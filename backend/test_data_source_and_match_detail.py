import os
import sys
import tempfile
import time
import json
import sqlite3
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
import cache_db

client = TestClient(app)
REAL_DB_PATH = os.path.abspath("offside_cache.db")

def run_tests():
    print("=================================================================")
    print("TEST SUITE: data_source FIELD & MATCH DETAIL 404 VALIDATION")
    print("=================================================================")

    temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    temp_db_path = temp_db.name
    temp_db.close()

    try:
        cache_db.DB_PATH = temp_db_path
        cache_db.init_db()

        # -------------------------------------------------------------
        # TEST 1: Unknown Match ID returns 404, NOT MOCK_LIVE_MATCHES[0]
        # -------------------------------------------------------------
        print("\n--- TEST 1: Unknown match ID must return 404 ---")
        unknown_ids = [999999, 12345, 888888, 777777]

        # Scenario 1A: MOCK_MODE = True
        os.environ["MOCK_MODE"] = "true"
        for uid in unknown_ids:
            resp = client.get(f"/api/matches/{uid}")
            print(f"[Mock Mode] GET /api/matches/{uid} -> HTTP {resp.status_code}")
            assert resp.status_code == 404, f"Expected 404 for unknown match {uid}, got {resp.status_code}"
            assert resp.json().get("detail") == f"Match {uid} not found"

        # Scenario 1B: MOCK_MODE = False with upstream returning empty response
        os.environ["MOCK_MODE"] = "false"
        class MockEmptyResponse:
            def __init__(self):
                self.status_code = 200
            def json(self):
                return {"response": []}

        async def mock_get(url, headers=None, params=None):
            return MockEmptyResponse()

        mock_inst = MagicMock()
        mock_inst.get = mock_get

        with patch("httpx.AsyncClient") as mock_client_cls:
            mock_client_cls.return_value.__aenter__.return_value = mock_inst
            for uid in unknown_ids:
                resp = client.get(f"/api/matches/{uid}")
                print(f"[Upstream Empty] GET /api/matches/{uid} -> HTTP {resp.status_code}")
                assert resp.status_code == 404, f"Expected 404 for unknown match {uid}, got {resp.status_code}"
                assert resp.json().get("detail") == f"Match {uid} not found"

        print("✓ Unknown match IDs correctly return 404 and never leak MOCK_LIVE_MATCHES[0].")

        # -------------------------------------------------------------
        # TEST 2: Mock Match ID returns only if id is in mock map
        # -------------------------------------------------------------
        print("\n--- TEST 2: Mock match IDs return corresponding mock match ---")
        os.environ["MOCK_MODE"] = "true"
        for mid in [9101, 9102, 9108, 9109, 9110]:
            resp = client.get(f"/api/matches/{mid}")
            print(f"GET /api/matches/{mid} -> HTTP {resp.status_code}, data_source={resp.json().get('data_source')}")
            assert resp.status_code == 200
            data = resp.json()
            assert data.get("id") == mid
            assert data.get("data_source") == "mock"
        print("✓ Mock match IDs correctly return the matching mock match with data_source='mock'.")

        # -------------------------------------------------------------
        # TEST 3: All endpoints carry data_source: "mock" in mock/degraded state
        # -------------------------------------------------------------
        print("\n--- TEST 3: Verification of data_source in mock/degraded mode ---")
        os.environ["MOCK_MODE"] = "true"
        endpoints = [
            ("Matches Root",   "/api/matches"),
            ("Live Matches",   "/api/matches/live"),
            ("Upcoming",       "/api/matches/upcoming"),
            ("Finished",       "/api/matches/finished"),
            ("Match Detail",   "/api/matches/9101"),
            ("Match Stats",    "/api/matches/9101/stats"),
            ("Match Events",   "/api/matches/9101/events"),
            ("Match Lineups",  "/api/matches/9101/lineups"),
        ]

        for name, path in endpoints:
            resp = client.get(path)
            assert resp.status_code == 200
            data = resp.json()
            ds = data.get("data_source")
            print(f"[{name}] {path} -> HTTP {resp.status_code}, data_source='{ds}'")
            assert ds in ("mock", "cache", "stale", "live"), f"Missing or invalid data_source: {ds}"
            assert ds == "mock", f"Expected 'mock' fallback, got {ds}"
        print("✓ All 8 match endpoints carry valid data_source='mock'.")

        # -------------------------------------------------------------
        # TEST 4: Verification of data_source: "cache" and "stale"
        # -------------------------------------------------------------
        print("\n--- TEST 4: Verification of data_source='cache' and 'stale' ---")
        os.environ["MOCK_MODE"] = "false"
        # Write fresh cache entry for 9101 stats
        cache_key = "match_stats_9101"
        fresh_data = {"possession_home": 60.0, "possession_away": 40.0}
        cache_db.set_cache(cache_key, fresh_data, ttl_seconds=60)

        resp_cache = client.get("/api/matches/9101/stats")
        print(f"Fresh Cache: GET /api/matches/9101/stats -> data_source='{resp_cache.json().get('data_source')}'")
        assert resp_cache.json().get("data_source") == "cache"

        # Manually expire entry in SQLite to test stale cache
        conn = sqlite3.connect(temp_db_path)
        conn.execute("UPDATE api_cache SET expires_at = ? WHERE key = ?", (time.time() - 100, cache_key))
        conn.commit()
        conn.close()

        # Trip breaker so upstream wrapper returns None and falls back to stale cache
        cache_db.trip_circuit_breaker("test_stale_fallback", duration_seconds=900)
        resp_stale = client.get("/api/matches/9101/stats")
        print(f"Stale Cache: GET /api/matches/9101/stats -> data_source='{resp_stale.json().get('data_source')}'")
        assert resp_stale.json().get("data_source") == "stale"
        assert resp_stale.json().get("possession_home") == 60.0
        print("✓ Fresh cache correctly tags 'cache' and expired cache tags 'stale'.")

        # -------------------------------------------------------------
        # TEST 5: Health Quota endpoint verification
        # -------------------------------------------------------------
        print("\n--- TEST 5: Verification of /api/health/quota endpoint ---")
        resp_quota = client.get("/api/health/quota")
        print(f"GET /api/health/quota -> HTTP {resp_quota.status_code}")
        quota_data = resp_quota.json()
        print(f"Quota Response: {quota_data}")
        assert resp_quota.status_code == 200
        assert "calls_today" in quota_data
        assert "cap" in quota_data
        assert "breaker" in quota_data
        assert "is_active" in quota_data["breaker"]
        assert "cooldown_until" in quota_data["breaker"]
        assert "reason" in quota_data["breaker"]
        assert quota_data["cap"] == 60
        assert quota_data["breaker"]["is_active"] is True
        assert quota_data["breaker"]["reason"] == "test_stale_fallback"
        print("✓ /api/health/quota returns calls_today, cap, breaker state and reason accurately.")

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
    print("ALL DATA SOURCE, 404 MATCH DETAIL & QUOTA TESTS PASSED!")
    print("=================================================================")

if __name__ == "__main__":
    run_tests()
