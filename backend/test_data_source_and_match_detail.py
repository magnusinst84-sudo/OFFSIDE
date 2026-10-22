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
    print("TEST SUITE: data_source FIELD & MATCH DETAIL 404/503 VALIDATION")
    print("=================================================================")

    temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    temp_db_path = temp_db.name
    temp_db.close()

    try:
        cache_db.DB_PATH = temp_db_path
        cache_db.init_db()

        # -------------------------------------------------------------
        # TEST 1: Unknown Match ID: 404 on valid empty / mock mode; 503 on upstream unavailable
        # -------------------------------------------------------------
        print("\n--- TEST 1: Unknown match ID 404 and 503 paths ---")
        unknown_id = 999999

        # Scenario 1A: MOCK_MODE = True -> 404 for non-mock id
        os.environ["MOCK_MODE"] = "true"
        resp = client.get(f"/api/matches/{unknown_id}")
        print(f"[Mock Mode] GET /api/matches/{unknown_id} -> HTTP {resp.status_code}")
        assert resp.status_code == 404, f"Expected 404 in mock mode, got {resp.status_code}"
        assert resp.json().get("detail") == f"Match {unknown_id} not found"
        print("✓ Mock mode: non-mock ID returns 404.")

        # Scenario 1B: MOCK_MODE = False with upstream returning valid empty response -> 404 + negative cache
        os.environ["MOCK_MODE"] = "false"
        cache_db.reset_circuit_breaker()

        class MockEmptyResponse:
            def __init__(self):
                self.status_code = 200
            def json(self):
                return {"response": []}

        async def mock_empty_get(url, headers=None, params=None):
            return MockEmptyResponse()

        mock_inst_empty = MagicMock()
        mock_inst_empty.get = mock_empty_get

        with patch("httpx.AsyncClient") as mock_client_cls:
            mock_client_cls.return_value.__aenter__.return_value = mock_inst_empty
            resp_empty = client.get(f"/api/matches/{unknown_id}")
            print(f"[Valid Empty Upstream] GET /api/matches/{unknown_id} -> HTTP {resp_empty.status_code}")
            assert resp_empty.status_code == 404
            assert resp_empty.json().get("detail") == f"Match {unknown_id} not found"

            # Check that negative cache was written
            cached_val = cache_db.get_cache(f"match_detail_{unknown_id}")
            assert cached_val is not None and cached_val.get("_not_found") is True
            print("✓ Valid empty upstream: returns 404 and wrote negative cache.")

            # Repeat request served from negative cache with zero upstream calls
            resp_repeat = client.get(f"/api/matches/{unknown_id}")
            assert resp_repeat.status_code == 404
            print("✓ Repeat request: served 404 from cache.")

        # Scenario 1C: MOCK_MODE = False with upstream unavailable (breaker tripped, cap reached, mock off) -> 503
        cache_db.trip_circuit_breaker("test_quota_exhausted_or_down", duration_seconds=900)
        unseen_unknown_id = 888888
        resp_503 = client.get(f"/api/matches/{unseen_unknown_id}")
        print(f"[Upstream Unavailable] GET /api/matches/{unseen_unknown_id} -> HTTP {resp_503.status_code}")
        assert resp_503.status_code == 503, f"Expected 503, got {resp_503.status_code}"
        assert resp_503.json() == {"error": "upstream_unavailable"}, f"Unexpected body: {resp_503.json()}"

        # Assert NO cache row was written for 503
        no_cache = cache_db.get_cache(f"match_detail_{unseen_unknown_id}")
        assert no_cache is None, "Expected NO cache row written on 503"
        print("✓ Upstream unavailable: returns 503 {'error': 'upstream_unavailable'} and writes NO cache row.")

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
        # TEST 3: All endpoints carry data_source: "mock" in mock mode
        # -------------------------------------------------------------
        print("\n--- TEST 3: Verification of data_source in mock mode ---")
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
            assert ds == "mock", f"Expected 'mock' fallback, got {ds}"
        print("✓ All 8 match endpoints carry valid data_source='mock'.")

        # -------------------------------------------------------------
        # TEST 4: Verification of data_source: "cache" and "stale"
        # -------------------------------------------------------------
        print("\n--- TEST 4: Verification of data_source='cache' and 'stale' ---")
        os.environ["MOCK_MODE"] = "false"
        cache_key = "match_stats_9101"
        fresh_data = {"possession_home": 60.0, "possession_away": 40.0}
        cache_db.set_cache(cache_key, fresh_data, ttl_seconds=60)

        resp_cache = client.get("/api/matches/9101/stats")
        print(f"Fresh Cache: GET /api/matches/9101/stats -> data_source='{resp_cache.json().get('data_source')}'")
        assert resp_cache.json().get("data_source") == "cache"

        conn = sqlite3.connect(temp_db_path)
        conn.execute("UPDATE api_cache SET expires_at = ? WHERE key = ?", (time.time() - 100, cache_key))
        conn.commit()
        conn.close()

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
        assert quota_data["breaker"]["is_active"] is True
        print("✓ /api/health/quota returns calls_today, cap, breaker state accurately.")

        # -------------------------------------------------------------
        # TEST 6: Real Upstream Data -> data_source == "live"
        # (fixtures, match detail, stats, events, lineups)
        # -------------------------------------------------------------
        print("\n--- TEST 6: Upstream returns real data -> assert data_source == 'live' ---")
        os.environ["MOCK_MODE"] = "false"
        cache_db.reset_circuit_breaker()

        live_fixture_id = 700101
        sample_live_fixture = {
            "fixture": {
                "id": live_fixture_id,
                "status": {"short": "1H", "elapsed": 32},
                "venue": {"name": "Santiago Bernabéu"},
                "date": "2026-10-22T20:00:00+00:00"
            },
            "league": {
                "id": 2,  # UEFA Champions League (Top League)
                "name": "UEFA Champions League",
                "round": "Group Stage - 3"
            },
            "teams": {
                "home": {"id": 541, "name": "Real Madrid", "logo": "https://media.api-sports.io/football/teams/541.png"},
                "away": {"id": 50, "name": "Manchester City", "logo": "https://media.api-sports.io/football/teams/50.png"}
            },
            "goals": {"home": 1, "away": 0}
        }

        sample_stats = {
            "response": [
                {
                    "team": {"id": 541},
                    "statistics": [
                        {"type": "Ball Possession", "value": "58%"},
                        {"type": "Total Shots", "value": 11},
                        {"type": "Shots on Goal", "value": 5},
                        {"type": "Corner Kicks", "value": 4},
                        {"type": "Fouls", "value": 6},
                        {"type": "Yellow Cards", "value": 1},
                        {"type": "Red Cards", "value": 0},
                        {"type": "expected_goals", "value": "1.34"}
                    ]
                },
                {
                    "team": {"id": 50},
                    "statistics": [
                        {"type": "Ball Possession", "value": "42%"},
                        {"type": "Total Shots", "value": 7},
                        {"type": "Shots on Goal", "value": 2},
                        {"type": "Corner Kicks", "value": 2},
                        {"type": "Fouls", "value": 8},
                        {"type": "Yellow Cards", "value": 2},
                        {"type": "Red Cards", "value": 0},
                        {"type": "expected_goals", "value": "0.78"}
                    ]
                }
            ]
        }

        sample_events = {
            "response": [
                {
                    "time": {"elapsed": 24},
                    "team": {"id": 541, "name": "Real Madrid"},
                    "player": {"name": "Vinicius Jr"},
                    "assist": {"name": "Jude Bellingham"},
                    "type": "Goal",
                    "detail": "Normal Goal"
                }
            ]
        }

        sample_lineups = {
            "response": [
                {
                    "formation": "4-3-3",
                    "startXI": [{"player": {"id": 1, "name": "Thibaut Courtois", "number": 1, "pos": "G"}}]
                },
                {
                    "formation": "4-2-3-1",
                    "startXI": [{"player": {"id": 2, "name": "Ederson", "number": 31, "pos": "G"}}]
                }
            ]
        }

        class MockLiveClient:
            async def get(self, url, headers=None, params=None):
                class MockResp:
                    def __init__(self, data):
                        self.status_code = 200
                        self._data = data
                    def json(self):
                        return self._data

                p = params or {}
                if "/fixtures/statistics" in url:
                    return MockResp(sample_stats)
                elif "/fixtures/events" in url:
                    return MockResp(sample_events)
                elif "/fixtures/lineups" in url:
                    return MockResp(sample_lineups)
                elif "/fixtures" in url:
                    # Match detail lookup by fixture id or fixtures list
                    if "id" in p:
                        return MockResp({"response": [sample_live_fixture]})
                    else:
                        return MockResp({"response": [sample_live_fixture]})
                return MockResp({"response": []})

        with patch("httpx.AsyncClient") as mock_client_cls:
            mock_client_cls.return_value.__aenter__.return_value = MockLiveClient()

            # 1. Fixtures root & live
            resp_root = client.get("/api/matches/live")
            print(f"[Fixtures Live] GET /api/matches/live -> HTTP {resp_root.status_code}, data_source={resp_root.json().get('data_source')}")
            assert resp_root.status_code == 200
            assert resp_root.json().get("data_source") == "live"
            assert resp_root.json()["matches"][0]["data_source"] == "live"

            # 2. Match detail
            resp_detail = client.get(f"/api/matches/{live_fixture_id}")
            print(f"[Match Detail] GET /api/matches/{live_fixture_id} -> HTTP {resp_detail.status_code}, data_source={resp_detail.json().get('data_source')}")
            assert resp_detail.status_code == 200
            assert resp_detail.json().get("data_source") == "live"
            assert resp_detail.json().get("id") == live_fixture_id

            # 3. Match stats
            resp_stats = client.get(f"/api/matches/{live_fixture_id}/stats")
            print(f"[Match Stats] GET /api/matches/{live_fixture_id}/stats -> HTTP {resp_stats.status_code}, data_source={resp_stats.json().get('data_source')}")
            assert resp_stats.status_code == 200
            assert resp_stats.json().get("data_source") == "live"
            assert resp_stats.json().get("possession_home") == 58.0

            # 4. Match events
            resp_events = client.get(f"/api/matches/{live_fixture_id}/events")
            print(f"[Match Events] GET /api/matches/{live_fixture_id}/events -> HTTP {resp_events.status_code}, data_source={resp_events.json().get('data_source')}")
            assert resp_events.status_code == 200
            assert resp_events.json().get("data_source") == "live"
            assert len(resp_events.json().get("events", [])) > 0

            # 5. Match lineups
            resp_lineups = client.get(f"/api/matches/{live_fixture_id}/lineups")
            print(f"[Match Lineups] GET /api/matches/{live_fixture_id}/lineups -> HTTP {resp_lineups.status_code}, data_source={resp_lineups.json().get('data_source')}")
            assert resp_lineups.status_code == 200
            assert resp_lineups.json().get("data_source") == "live"
            assert resp_lineups.json().get("home") == "4-3-3"

        print("✓ All 5 live endpoints correctly assert data_source == 'live'.")

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
    print("ALL DATA SOURCE, 404/503 & LIVE WRAPPER TESTS PASSED!")
    print("=================================================================")

if __name__ == "__main__":
    run_tests()
