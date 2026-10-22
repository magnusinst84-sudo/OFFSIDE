import os, time, json
from typing import Optional, Dict, Any
import httpx
from cache_db import (
    get_daily_api_calls,
    try_acquire_api_call_quota,
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
    cap = os.getenv("API_FOOTBALL_DAILY_CAP", "60")
    try:
        return int(cap)
    except Exception:
        return 60

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
    3. Atomically checks and acquires quota in SQLite under API_FOOTBALL_DAILY_CAP (default 60).
    4. On cap exhaustion, trips circuit breaker for 15 minutes.
    5. Trip breaker ONLY on:
       (a) HTTP 401, 403, 429
       (b) JSON "errors" object whose KEYS include access, token, requests or rateLimit.
    6. Returns None on block/error so callers serve stale cache or mock data.
    """
    if is_mock_mode():
        return None

    # Check 15-minute circuit breaker cooldown
    is_active, cooldown_until, reason = get_circuit_breaker_status()
    if is_active:
        print(f"[api_football] Upstream paused until {cooldown_until} ({reason}).")
        return None

    api_key = get_api_key()
    if not api_key:
        return None

    # Atomically acquire quota from daily cap
    daily_cap = get_daily_cap()
    if not try_acquire_api_call_quota(daily_cap):
        trip_circuit_breaker(f"daily_cap_{daily_cap}_reached", duration_seconds=900)
        return None

    # Build request
    url = f"{API_FOOTBALL_BASE}{endpoint if endpoint.startswith('/') else '/' + endpoint}"
    headers = {"x-apisports-key": api_key}

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.get(url, headers=headers, params=params)
    except Exception as e:
        print(f"[api_football] Upstream request error: {e}")
        return None

    # Trip breaker on HTTP 401, 403, 429
    if r.status_code in (401, 403, 429):
        trip_circuit_breaker(f"http_status_{r.status_code}", duration_seconds=900)
        return None

    if r.status_code != 200:
        return None

    try:
        data = r.json()
    except Exception:
        return None

    # Trip breaker ONLY if JSON "errors" object KEYS contain target keywords
    errors = data.get("errors")
    if isinstance(errors, dict) and errors:
        error_keys = {str(k).lower() for k in errors.keys()}
        target_keys = {"access", "token", "requests", "ratelimit"}
        matched = error_keys.intersection(target_keys)
        if matched:
            trip_circuit_breaker(f"error_keys_{','.join(matched)}", duration_seconds=900)
            return None

    return data

