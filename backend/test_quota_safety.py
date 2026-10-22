import os, asyncio, tempfile, sqlite3
from unittest.mock import patch, MagicMock

# Base mock env
os.environ["MOCK_MODE"] = "false"
os.environ["API_FOOTBALL_KEY"] = "test_key_sample"

import cache_db
from api_football import api_football_request, get_daily_cap

REAL_DB_PATH = os.path.join(os.path.dirname(__file__), "offside_cache.db")

def read_db_tables(db_path):
    if not os.path.exists(db_path):
        return [], []
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT * FROM api_daily_calls")
    calls = cur.fetchall()
    cur.execute("SELECT * FROM api_circuit_breaker")
    breaker = cur.fetchall()
    conn.close()
    return calls, breaker

async def run_quota_safety_tests():
    print("=================================================================")
    print("QUOTA SAFETY TEST SUITE (WITH COMPLETE TEST DB ISOLATION)")
    print("=================================================================")

    # Snapshot real offside_cache.db state
    real_calls_before, real_breaker_before = read_db_tables(REAL_DB_PATH)
    print(f"[TEST ISOLATION] Snapshot real DB before tests:")
    print(f"  api_daily_calls rows:     {real_calls_before}")
    print(f"  api_circuit_breaker rows: {real_breaker_before}")

    # Create temporary database file for test isolation
    temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    temp_db_path = temp_db.name
    temp_db.close()

    try:
        cache_db.DB_PATH = temp_db_path
        cache_db.init_db()

        # -----------------------------------------------------------------
        # TEST 1: Concurrent execution of 200 requests with cap at 80
        # -----------------------------------------------------------------
        os.environ["API_FOOTBALL_DAILY_CAP"] = "80"
        cache_db.reset_daily_api_calls()
        cache_db.reset_circuit_breaker()
        cache_db.clear_cache()

        cap = get_daily_cap()
        assert cap == 80

        upstream_calls = 0

        class MockResponse:
            def __init__(self, json_data, status_code=200):
                self._json = json_data
                self.status_code = status_code

            def json(self):
                return self._json

        async def mock_get(url, headers=None, params=None):
            nonlocal upstream_calls
            upstream_calls += 1
            await asyncio.sleep(0.001)
            return MockResponse({"response": [{"fixture": {"id": 1000 + upstream_calls}}]})

        mock_client = MagicMock()
        mock_client.get = mock_get

        with patch("httpx.AsyncClient") as mock_client_cls:
            mock_client_cls.return_value.__aenter__.return_value = mock_client

            print("\n--- TEST 1: Firing 200 concurrent requests (Cap = 80) ---")
            tasks = [api_football_request("/fixtures", params={"id": i}) for i in range(1, 201)]
            results = await asyncio.gather(*tasks)

            successes = [r for r in results if r is not None]
            blocked = [r for r in results if r is None]

            print(f"Total concurrent calls:    200")
            print(f"Upstream attempts made:    {upstream_calls}")
            print(f"Successful calls:          {len(successes)}")
            print(f"Blocked calls:             {len(blocked)}")
            print(f"Calls recorded in temp DB: {cache_db.get_daily_api_calls()}")

            assert upstream_calls <= cap, f"Upstream attempts ({upstream_calls}) exceeded cap ({cap})!"
            assert upstream_calls == 80, f"Expected exactly 80 upstream attempts, got {upstream_calls}"
            assert len(successes) == 80
            assert len(blocked) == 120

            is_active, cooldown_until, reason = cache_db.get_circuit_breaker_status()
            assert is_active is True, "Circuit breaker should be active after cap exhaustion"
            print(f"✓ Concurrency & atomic cap verified: exactly {upstream_calls} <= {cap} attempts.")

        # -----------------------------------------------------------------
        # TEST 2: Breaker triggers ONLY on HTTP 401/403/429 or error KEYS
        # -----------------------------------------------------------------
        print("\n--- TEST 2: False positive rejection (Tokenaga / requests in value) ---")
        cache_db.reset_daily_api_calls()
        cache_db.reset_circuit_breaker()

        # Response contains "Tokenaga" in name and "requests" in value, status 200, errors dict has no matching keys
        async def mock_tokenaga_get(url, headers=None, params=None):
            return MockResponse({
                "response": [
                    {"player": {"name": "Tokenaga", "notes": "Special requests completed"}}
                ],
                "errors": {}
            }, status_code=200)

        mock_client.get = mock_tokenaga_get
        with patch("httpx.AsyncClient") as mock_client_cls:
            mock_client_cls.return_value.__aenter__.return_value = mock_client
            res = await api_football_request("/players", params={"search": "Tokenaga"})
            assert res is not None, "Response should be returned normally"
            assert res["response"][0]["player"]["name"] == "Tokenaga"

            is_active, _, _ = cache_db.get_circuit_breaker_status()
            print(f"Circuit Breaker Status after 'Tokenaga' 200 OK: is_active={is_active}")
            assert is_active is False, "Breaker must NOT be tripped for normal 200 containing 'token' or 'requests' substrings!"
            print("✓ Substring false positive prevented: breaker remained OFF.")

        print("\n--- TEST 3: Breaker trips on JSON 'errors' object KEYS (requests/token/ratelimit) ---")
        cache_db.reset_circuit_breaker()
        cache_db.reset_daily_api_calls()

        async def mock_error_key_get(url, headers=None, params=None):
            return MockResponse({
                "response": [],
                "errors": {"requests": "You have reached the request limit per day."}
            }, status_code=200)

        mock_client.get = mock_error_key_get
        with patch("httpx.AsyncClient") as mock_client_cls:
            mock_client_cls.return_value.__aenter__.return_value = mock_client
            res = await api_football_request("/fixtures", params={"live": "all"})
            assert res is None

            is_active, _, reason = cache_db.get_circuit_breaker_status()
            print(f"Circuit Breaker Status after error key: is_active={is_active} (reason: {reason})")
            assert is_active is True
            assert "requests" in reason
            print("✓ Breaker correctly tripped on 'requests' error key.")

        print("\n--- TEST 4: Breaker trips on HTTP 429 ---")
        cache_db.reset_circuit_breaker()
        cache_db.reset_daily_api_calls()

        async def mock_429_get(url, headers=None, params=None):
            return MockResponse({"message": "Rate limit reached"}, status_code=429)

        mock_client.get = mock_429_get
        with patch("httpx.AsyncClient") as mock_client_cls:
            mock_client_cls.return_value.__aenter__.return_value = mock_client
            res = await api_football_request("/fixtures", params={"live": "all"})
            assert res is None

            is_active, _, reason = cache_db.get_circuit_breaker_status()
            assert is_active is True
            assert "429" in reason
            print("✓ Breaker correctly tripped on HTTP 429.")

    finally:
        # Restore real DB path and remove temp file
        cache_db.DB_PATH = REAL_DB_PATH
        if os.path.exists(temp_db_path):
            os.remove(temp_db_path)

    # Prove real offside_cache.db was NEVER touched
    real_calls_after, real_breaker_after = read_db_tables(REAL_DB_PATH)
    print(f"\n[TEST ISOLATION] Verify real DB after test run:")
    print(f"  api_daily_calls rows:     {real_calls_after}")
    print(f"  api_circuit_breaker rows: {real_breaker_after}")
    assert real_calls_before == real_calls_after, "REAL DB api_daily_calls WAS MODIFIED BY TESTS!"
    assert real_breaker_before == real_breaker_after, "REAL DB api_circuit_breaker WAS MODIFIED BY TESTS!"
    print("✓ PROOF: backend/offside_cache.db remained completely untouched and identical before and after test!")

if __name__ == "__main__":
    asyncio.run(run_quota_safety_tests())
