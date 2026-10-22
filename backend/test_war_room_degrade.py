import os
import sys
import tempfile
import sqlite3
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
import cache_db
import api_football

client = TestClient(app)
REAL_DB_PATH = os.path.abspath("offside_cache.db")

def run_war_room_degrade_tests():
    print("=================================================================")
    print("WAR ROOM DEGRADE TEST SUITE (WITH DB ISOLATION)")
    print("=================================================================")

    temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    temp_db_path = temp_db.name
    temp_db.close()

    try:
        cache_db.DB_PATH = temp_db_path
        cache_db.init_db()

        # Ensure MOCK_MODE=false to test fallback logic through the wrapper
        os.environ["MOCK_MODE"] = "false"
        os.environ["API_FOOTBALL_KEY"] = "dummy_valid_format_key_123456"

        endpoints = [
            ("Matches Root",   "/api/matches"),
            ("Live Matches",   "/api/matches/live"),
            ("Match Detail",   "/api/matches/9101"),
            ("Match Stats",    "/api/matches/9101/stats"),
            ("Match Events",   "/api/matches/9101/events"),
            ("Match Lineups",  "/api/matches/9101/lineups"),
        ]

        upstream_attempts = 0

        async def mock_upstream_fail(*args, **kwargs):
            nonlocal upstream_attempts
            upstream_attempts += 1
            raise RuntimeError("Upstream should NEVER be reached when degraded!")

        mock_client = MagicMock()
        mock_client.get = mock_upstream_fail

        with patch("httpx.AsyncClient") as mock_client_cls:
            mock_client_cls.return_value.__aenter__.return_value = mock_client

            # -----------------------------------------------------------------
            # SCENARIO 1: Circuit Breaker Tripped
            # -----------------------------------------------------------------
            print("\n-------------------------------------------------------------")
            print("SCENARIO 1: Circuit Breaker Tripped")
            print("-------------------------------------------------------------")
            cache_db.trip_circuit_breaker("rate_limit_or_suspended", duration_seconds=900)
            is_active, _, reason = cache_db.get_circuit_breaker_status()
            assert is_active is True, "Circuit breaker must be active"
            print(f"Breaker Status: is_active={is_active}, reason='{reason}'")

            for name, path in endpoints:
                resp = client.get(path)
                data = resp.json()
                print(f"[{name}] GET {path} -> HTTP {resp.status_code}")
                assert resp.status_code == 200, f"Expected 200 for {path}, got {resp.status_code}"
                assert data, f"Payload for {path} was empty!"
                if isinstance(data, dict):
                    assert len(data) > 0
                elif isinstance(data, list):
                    assert len(data) > 0
                print(f"  ✓ Non-empty payload received: {type(data).__name__} with keys/items: {list(data.keys()) if isinstance(data, dict) else len(data)}")

            print(f"Upstream attempts made during Breaker Tripped: {upstream_attempts}")
            assert upstream_attempts == 0, f"Expected 0 upstream attempts, got {upstream_attempts}"
            print("✓ Scenario 1 passed: all 6 War Room endpoints returned 200 with non-empty payload and ZERO upstream attempts.")

            # -----------------------------------------------------------------
            # SCENARIO 2: Daily Call Cap Exhausted
            # -----------------------------------------------------------------
            print("\n-------------------------------------------------------------")
            print("SCENARIO 2: Daily Call Cap Exhausted")
            print("-------------------------------------------------------------")
            cache_db.reset_circuit_breaker()
            cache_db.clear_cache()

            # Set cap to 60 and call count to 60 in temp DB
            cap = api_football.get_daily_cap()
            today_utc = cache_db.datetime.now(cache_db.timezone.utc).strftime("%Y-%m-%d")
            conn = sqlite3.connect(temp_db_path)
            conn.execute("INSERT OR REPLACE INTO api_daily_calls (day_utc, call_count) VALUES (?, ?)", (today_utc, cap))
            conn.commit()
            conn.close()

            print(f"Current Daily Calls in DB: {cache_db.get_daily_api_calls()} (Cap: {cap})")
            assert cache_db.get_daily_api_calls() >= cap

            for name, path in endpoints:
                resp = client.get(path)
                data = resp.json()
                print(f"[{name}] GET {path} -> HTTP {resp.status_code}")
                assert resp.status_code == 200, f"Expected 200 for {path}, got {resp.status_code}"
                assert data, f"Payload for {path} was empty!"
                if isinstance(data, dict):
                    assert len(data) > 0
                elif isinstance(data, list):
                    assert len(data) > 0
                print(f"  ✓ Non-empty payload received: {type(data).__name__} with keys/items: {list(data.keys()) if isinstance(data, dict) else len(data)}")

            print(f"Total upstream attempts across entire test: {upstream_attempts}")
            assert upstream_attempts == 0, f"Expected 0 upstream attempts, got {upstream_attempts}"
            print("✓ Scenario 2 passed: all 6 War Room endpoints returned 200 with non-empty payload and ZERO upstream attempts.")

    finally:
        cache_db.DB_PATH = REAL_DB_PATH
        import gc
        gc.collect()
        try:
            if os.path.exists(temp_db_path):
                os.remove(temp_db_path)
        except Exception:
            pass

    print("\n=================================================================")
    print("ALL WAR ROOM DEGRADE TESTS PASSED SUCCESSFULLY!")
    print("=================================================================")

if __name__ == "__main__":
    run_war_room_degrade_tests()
