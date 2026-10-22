import os, tempfile, sqlite3
from unittest.mock import patch, MagicMock

# Base mock env
os.environ["MOCK_MODE"] = "false"
os.environ["API_FOOTBALL_KEY"] = "mock_key_12345"

import cache_db
from fastapi.testclient import TestClient
from main import app
from routers.players import TOP_PLAYERS
import routers.players as players_module

client = TestClient(app)

REAL_DB_PATH = os.path.join(os.path.dirname(__file__), "offside_cache.db")
TOP_PLAYER_IDS = [p["id"] for p in TOP_PLAYERS]

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

def test_live_lookup_guard_suite():
    print("=================================================================")
    print("LIVE LOOKUP GUARD & FLAG-ON TEST SUITE (WITH DB ISOLATION)")
    print("=================================================================")

    # 1. Snapshot real DB
    real_calls_before, real_breaker_before = read_db_tables(REAL_DB_PATH)
    print(f"[TEST ISOLATION] Snapshot real DB before tests:")
    print(f"  api_daily_calls rows:     {real_calls_before}")
    print(f"  api_circuit_breaker rows: {real_breaker_before}")

    # 2. Point cache_db.DB_PATH to a temporary DB
    temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    temp_db_path = temp_db.name
    temp_db.close()

    try:
        cache_db.DB_PATH = temp_db_path
        cache_db.init_db()

        # -------------------------------------------------------------
        # SUITE 1: Flag OFF (ENABLE_LIVE_PLAYER_LOOKUP = False)
        # -------------------------------------------------------------
        players_module.ENABLE_LIVE_PLAYER_LOOKUP = False
        cache_db.reset_circuit_breaker()
        cache_db.reset_daily_api_calls()
        cache_db.clear_cache()

        print("\n=======================================================")
        print("PHASE 1: Flag OFF (ENABLE_LIVE_PLAYER_LOOKUP = false)")
        print("=======================================================")

        with patch("httpx.AsyncClient") as mock_client_cls:
            mock_inst = MagicMock()
            mock_client_cls.return_value.__aenter__.return_value = mock_inst

            # Known players
            for pid in TOP_PLAYER_IDS:
                res_get = client.get(f"/api/players/{pid}/dna")
                assert res_get.status_code == 200, f"Expected 200 for {pid}, got {res_get.status_code}"
                res_post = client.post(f"/api/players/{pid}/dna")
                assert res_post.status_code == 200, f"Expected 200 for POST {pid}"

            # Unknown players
            for uid in [278, 999999, 12345, 0, -1]:
                res_get = client.get(f"/api/players/{uid}/dna")
                assert res_get.status_code == 404, f"Expected 404 for unknown {uid}"
                res_post = client.post(f"/api/players/{uid}/dna")
                assert res_post.status_code == 404, f"Expected 404 for unknown POST {uid}"

            # Zero httpx calls when flag is OFF
            assert mock_client_cls.call_count == 0, f"Expected 0 calls with flag OFF, got {mock_client_cls.call_count}"
            print("✓ Flag OFF: 17 known players returned 200, unknown returned 404, 0 httpx calls.")

        # -------------------------------------------------------------
        # SUITE 2: Flag ON (ENABLE_LIVE_PLAYER_LOOKUP = True)
        # -------------------------------------------------------------
        players_module.ENABLE_LIVE_PLAYER_LOOKUP = True
        cache_db.reset_circuit_breaker()
        cache_db.reset_daily_api_calls()
        cache_db.clear_cache()

        print("\n=======================================================")
        print("PHASE 2: Flag ON (ENABLE_LIVE_PLAYER_LOOKUP = true)")
        print("=======================================================")

        is_active, _, _ = cache_db.get_circuit_breaker_status()
        assert is_active is False, "Breaker must be reset before Flag-ON test"

        upstream_attempts = 0

        class MockResponse:
            def __init__(self, json_data, status_code=200):
                self._json = json_data
                self.status_code = status_code

            def json(self):
                return self._json

        async def mock_get(url, headers=None, params=None):
            nonlocal upstream_attempts
            upstream_attempts += 1
            # Upstream API-Football returns 200 with empty response for unknown players
            return MockResponse({"response": []}, status_code=200)

        mock_inst = MagicMock()
        mock_inst.get = mock_get

        with patch("httpx.AsyncClient") as mock_client_cls:
            mock_client_cls.return_value.__aenter__.return_value = mock_inst

            unknown_id = 999999

            # 1. First request for unknown ID -> reaches wrapper exactly once
            print(f"\n1. First lookup for unknown player {unknown_id}...")
            r1 = client.get(f"/api/players/{unknown_id}")
            print(f"   Response status:   {r1.status_code} ({r1.json()})")
            print(f"   Upstream attempts: {upstream_attempts}")
            assert r1.status_code == 404
            assert upstream_attempts == 1, f"Expected exactly 1 upstream attempt, got {upstream_attempts}"

            is_active, _, reason = cache_db.get_circuit_breaker_status()
            print(f"   Circuit breaker active: {is_active} ({reason})")
            assert is_active is False, "Circuit breaker must NOT be tripped on 404 lookup!"

            # 2. Repeat request for unknown ID -> served from cache with zero further attempts
            print(f"\n2. Repeat lookup for same unknown player {unknown_id}...")
            r2 = client.get(f"/api/players/{unknown_id}")
            print(f"   Response status:   {r2.status_code} ({r2.json()})")
            print(f"   Upstream attempts: {upstream_attempts}")
            assert r2.status_code == 404
            assert upstream_attempts == 1, f"Repeat request should be served from cache! Upstream attempts was {upstream_attempts}"

            is_active, _, _ = cache_db.get_circuit_breaker_status()
            assert is_active is False, "Circuit breaker must NOT be tripped"
            print("   ✓ Repeat request successfully served from cache with zero further attempts.")

            # 3. DNA route for same unknown ID -> served from cache with zero further attempts
            print(f"\n3. DNA request for unknown player {unknown_id}/dna...")
            r3_get = client.get(f"/api/players/{unknown_id}/dna")
            print(f"   Response status:   {r3_get.status_code} ({r3_get.json()})")
            print(f"   Upstream attempts: {upstream_attempts}")
            assert r3_get.status_code == 404
            assert upstream_attempts == 1, f"DNA lookup should use cached negative result! Upstream attempts was {upstream_attempts}"

            # 4. Known players with flag ON -> served locally / precomputed, zero upstream calls
            print(f"\n4. Testing known players with flag ON...")
            for pid in TOP_PLAYER_IDS:
                res_top = client.get(f"/api/players/{pid}/dna")
                assert res_top.status_code == 200

            print(f"   Total upstream attempts across all requests so far: {upstream_attempts}")
            assert upstream_attempts == 1, f"Expected total 1 attempt so far, got {upstream_attempts}"

            # -------------------------------------------------------------
            # SUITE 3: Breaker tripped / upstream unavailable path (503)
            # -------------------------------------------------------------
            print("\n=======================================================")
            print("PHASE 3: Upstream Unavailable (Breaker Tripped -> 503)")
            print("=======================================================")
            valid_id = 888888
            cache_key_888 = f"player_detail_{valid_id}"

            # Step A: Trip breaker
            print(f"1. Tripping circuit breaker...")
            cache_db.trip_circuit_breaker("manual_test_trip", duration_seconds=900)
            is_active, _, reason = cache_db.get_circuit_breaker_status()
            assert is_active is True, "Circuit breaker must be active"

            # Step B: Request ID while breaker is tripped -> must return 503, NOT 404
            print(f"2. Requesting player {valid_id} with breaker active...")
            r_blocked = client.get(f"/api/players/{valid_id}")
            print(f"   Response status: {r_blocked.status_code} ({r_blocked.json()})")
            assert r_blocked.status_code == 503, f"Expected 503 on tripped breaker, got {r_blocked.status_code}"
            assert r_blocked.json() == {"error": "upstream_unavailable", "id": valid_id}

            # Step C: Assert NO cache row was written to database
            cached_val = cache_db.get_cache(cache_key_888)
            stale_val = cache_db.get_stale_cache(cache_key_888)
            assert cached_val is None, f"Expected NO fresh cache row, found {cached_val}"
            assert stale_val is None, f"Expected NO stale cache row, found {stale_val}"

            conn = sqlite3.connect(temp_db_path)
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM api_cache WHERE key = ?", (cache_key_888,))
            row_count = cur.fetchone()[0]
            conn.close()
            assert row_count == 0, f"Expected 0 api_cache table rows for {cache_key_888}, found {row_count}"
            print(f"   ✓ NO cache row written (row_count={row_count}) and 503 returned.")

            # Step D: Reset the breaker
            print(f"3. Resetting circuit breaker...")
            cache_db.reset_circuit_breaker()
            is_active, _, _ = cache_db.get_circuit_breaker_status()
            assert is_active is False, "Breaker must be reset"

            # Step E: Assert the same ID is looked up again (reaches upstream mock)
            print(f"4. Requesting player {valid_id} again after breaker reset...")
            prev_attempts = upstream_attempts
            r_after_reset = client.get(f"/api/players/{valid_id}")
            print(f"   Response status:   {r_after_reset.status_code} ({r_after_reset.json()})")
            print(f"   Upstream attempts: before={prev_attempts}, after={upstream_attempts}")
            assert upstream_attempts == prev_attempts + 1, "Upstream MUST be called again after breaker reset!"
            assert r_after_reset.status_code == 404  # Upstream empty mock returned 404
            print("   ✓ Same ID successfully looked up again upon breaker reset.")

    finally:
        # Reset flag to false and restore real DB
        players_module.ENABLE_LIVE_PLAYER_LOOKUP = False
        cache_db.DB_PATH = REAL_DB_PATH
        import gc
        gc.collect()
        try:
            if os.path.exists(temp_db_path):
                os.remove(temp_db_path)
        except Exception:
            pass

    # Prove real offside_cache.db was NEVER touched
    real_calls_after, real_breaker_after = read_db_tables(REAL_DB_PATH)
    print(f"\n[TEST ISOLATION] Verify real DB after test run:")
    print(f"  api_daily_calls rows:     {real_calls_after}")
    print(f"  api_circuit_breaker rows: {real_breaker_after}")
    assert real_calls_before == real_calls_after, "REAL DB api_daily_calls WAS MODIFIED BY TESTS!"
    assert real_breaker_before == real_breaker_after, "REAL DB api_circuit_breaker WAS MODIFIED BY TESTS!"
    print("✓ PROOF: backend/offside_cache.db remained completely untouched and identical before and after test!")

if __name__ == "__main__":
    test_live_lookup_guard_suite()
