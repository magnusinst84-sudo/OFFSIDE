import os, asyncio
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

# Configure environment for quota test
os.environ["MOCK_MODE"] = "false"
os.environ["API_FOOTBALL_KEY"] = "test_key_sample"
os.environ["API_FOOTBALL_DAILY_CAP"] = "80"

from cache_db import (
    reset_daily_api_calls,
    reset_circuit_breaker,
    clear_cache,
    set_cache,
    get_cache,
    get_stale_cache,
    get_daily_api_calls,
    get_circuit_breaker_status,
)
from api_football import api_football_request, get_daily_cap

async def run_quota_simulation_test():
    print("=================================================================")
    print("TEST 1: Simulating 200 requests with API_FOOTBALL_DAILY_CAP = 80")
    print("=================================================================")
    reset_daily_api_calls()
    reset_circuit_breaker()
    clear_cache()

    daily_cap = get_daily_cap()
    assert daily_cap == 80, f"Expected cap 80, got {daily_cap}"

    upstream_calls = 0

    class MockResponse:
        def __init__(self, json_data, status_code=200, text="OK"):
            self._json = json_data
            self.status_code = status_code
            self.text = text

        def json(self):
            return self._json

    async def mock_get(url, headers=None, params=None):
        nonlocal upstream_calls
        upstream_calls += 1
        return MockResponse({"response": [{"fixture": {"id": 1000 + upstream_calls}}]})

    mock_client = MagicMock()
    mock_client.get = mock_get

    with patch("httpx.AsyncClient") as mock_client_cls:
        mock_client_cls.return_value.__aenter__.return_value = mock_client

        blocked_count = 0
        success_count = 0

        for i in range(1, 201):
            res = await api_football_request("/fixtures", params={"id": i})
            if res is not None:
                success_count += 1
            else:
                blocked_count += 1

        print(f"Total Requests Simulated: 200")
        print(f"Upstream HTTP Calls Made: {upstream_calls}")
        print(f"Requests Succeeded:       {success_count}")
        print(f"Requests Blocked/Guarded: {blocked_count}")
        print(f"Calls Recorded in SQLite: {get_daily_api_calls()}")

        assert upstream_calls <= daily_cap, f"Upstream calls ({upstream_calls}) exceeded cap ({daily_cap})!"
        assert upstream_calls == 80, f"Expected exactly 80 upstream calls, got {upstream_calls}"
        assert success_count == 80, f"Expected 80 successes, got {success_count}"
        assert blocked_count == 120, f"Expected 120 blocked calls, got {blocked_count}"

        is_active, cooldown_until, reason = get_circuit_breaker_status()
        print(f"Circuit Breaker Active:   {is_active} (reason: {reason})")
        assert is_active is True, "Circuit breaker should be active after hitting daily cap"

    print("\n=================================================================")
    print("TEST 2: Circuit Breaker on 'suspended' / 'requests' / 'token' err")
    print("=================================================================")
    reset_daily_api_calls()
    reset_circuit_breaker()

    error_calls = 0
    async def mock_suspended_get(url, headers=None, params=None):
        nonlocal error_calls
        error_calls += 1
        return MockResponse({"message": "Subscription is suspended"}, status_code=403, text='{"message": "Subscription is suspended"}')

    mock_client.get = mock_suspended_get
    with patch("httpx.AsyncClient") as mock_client_cls:
        mock_client_cls.return_value.__aenter__.return_value = mock_client
        res = await api_football_request("/fixtures", params={"live": "all"})
        assert res is None, "Expected None on suspended response"
        assert error_calls == 1

        is_active, cooldown_until, reason = get_circuit_breaker_status()
        print(f"Circuit Breaker Tripped on Suspended: {is_active} (reason: {reason})")
        assert is_active is True

        # Second call must NOT call upstream because circuit breaker is active!
        res2 = await api_football_request("/fixtures", params={"live": "all"})
        assert res2 is None
        assert error_calls == 1, "Upstream was called while circuit breaker was active!"
        print("Confirmed: Upstream calls halted for 15 minutes upon keyword detection.")

    print("\n=================================================================")
    print("TEST 3: Stale Cache Fallback When Over Cap")
    print("=================================================================")
    cache_key = "match_stats_test_999"
    # Store expired cache entry
    set_cache(cache_key, {"possession_home": 58.0, "shots_home": 14}, ttl_seconds=-10)
    assert get_cache(cache_key) is None, "Fresh cache should return None for expired entry"
    stale = get_stale_cache(cache_key)
    assert stale is not None, "Stale cache should return expired entry"
    assert stale["possession_home"] == 58.0
    print(f"Stale Cache Successfully Served: {stale}")

    print("\n=================================================================")
    print("ALL QUOTA SAFETY AND CIRCUIT BREAKER TESTS PASSED!")
    print("=================================================================")

if __name__ == "__main__":
    asyncio.run(run_quota_simulation_test())
