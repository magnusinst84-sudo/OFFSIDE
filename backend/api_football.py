import os, time, json
from typing import Optional, Dict, Any
import httpx
from cache_db import (
    get_daily_api_calls,
    increment_daily_api_calls,
    get_circuit_breaker_status,
    trip_circuit_breaker,
    get_stale_cache,
    get_cache,
    set_cache,
)

API_FOOTBALL_BASE = "https://v3.football.api-sports.io"

def get_api_key() -> str:
    return os.getenv("API_FOOTBALL_KEY", "")

def is_mock_mode() -> bool:
    return os.getenv("MOCK_MODE", "false").lower() in ("true", "1", "yes")

def get_daily_cap() -> int:
    cap = os.getenv("API_FOOTBALL_DAILY_CAP", "80")
    try:
        return int(cap)
    except Exception:
        return 80

def get_configured_ttl(env_var_suffix: str, default: int) -> int:
    val = os.getenv(f"TTL_{env_var_suffix.upper()}", "")
    if val.isdigit():
        return int(val)
    return default

async def api_football_request(
    endpoint: str,
    params: Optional[Dict[str, Any]] = None,
    timeout: float = 8.0,
    cache_key: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Central wrapper for EVERY outbound API-Football call in backend/.
    
    Enforces:
    1. Returns None if MOCK_MODE=true.
    2. Checks circuit-breaker cooldown; pauses upstream calls for 15 minutes if active.
    3. Counts calls per UTC day in SQLite and enforces API_FOOTBALL_DAILY_CAP (default 80).
    4. On cap hit, trips circuit breaker for 15 minutes.
    5. On any response containing 'suspended', 'token' or 'requests', trips circuit breaker for 15 minutes.
    6. Returns None on block/error so callers serve stale cache or mock data.
    """
    if is_mock_mode():
        return None

    # Check 15-minute circuit breaker cooldown
    is_active, cooldown_until, reason = get_circuit_breaker_status()
    if is_active:
        print(f"[api_football] Upstream paused until {cooldown_until} ({reason}).")
        return None

    # Enforce daily call cap in SQLite
    daily_cap = get_daily_cap()
    today_calls = get_daily_api_calls()
    if today_calls >= daily_cap:
        trip_circuit_breaker(f"daily_cap_{daily_cap}_reached (current: {today_calls})", duration_seconds=900)
        return None

    api_key = get_api_key()
    if not api_key:
        return None

    # Build request
    url = f"{API_FOOTBALL_BASE}{endpoint if endpoint.startswith('/') else '/' + endpoint}"
    headers = {"x-apisports-key": api_key}

    # Increment daily call count before dispatch
    increment_daily_api_calls()

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.get(url, headers=headers, params=params)
    except Exception as e:
        print(f"[api_football] Upstream request error: {e}")
        return None

    # Check response text for rate limit, auth, or quota keywords
    resp_text_lower = r.text.lower()
    for kw in ("suspended", "token", "requests"):
        if kw in resp_text_lower:
            trip_circuit_breaker(f"response body contained '{kw}'", duration_seconds=900)
            return None

    if r.status_code != 200:
        return None

    try:
        data = r.json()
    except Exception:
        return None

    # Inspect errors field in JSON response
    errors = data.get("errors")
    if errors:
        err_str = json.dumps(errors).lower()
        for kw in ("suspended", "token", "requests"):
            if kw in err_str:
                trip_circuit_breaker(f"response errors contained '{kw}'", duration_seconds=900)
                return None

    return data
