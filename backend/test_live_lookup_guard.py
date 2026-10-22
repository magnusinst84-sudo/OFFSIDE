import os
from unittest.mock import patch, MagicMock

# Base mock env
os.environ["API_FOOTBALL_KEY"] = "mock_key_12345"

from fastapi.testclient import TestClient
from main import app
from routers.players import TOP_PLAYERS
import routers.players as players_module

client = TestClient(app)

TOP_PLAYER_IDS = [p["id"] for p in TOP_PLAYERS]
UNKNOWN_IDS = [278, 999999, 12345, 0, -1]

def run_dna_suite(flag_enabled: bool, mock_client_cls):
    """
    Run GET and POST on /{player_id}/dna for all TOP_PLAYERS and unknown IDs.
    Asserts:
    1. No 500 status codes on any request.
    2. When flag is off: unknown players return 404.
    3. When flag is on: mock handles lookups gracefully without 500s.
    4. Zero real outbound network calls.
    """
    players_module.ENABLE_LIVE_PLAYER_LOOKUP = flag_enabled
    flag_str = "ON" if flag_enabled else "OFF"
    print(f"\n=======================================================")
    print(f"RUNNING DNA SUITE: ENABLE_LIVE_PLAYER_LOOKUP = {flag_str}")
    print(f"=======================================================")

    # 1. Test EVERY TOP_PLAYERS ID (GET and POST)
    print(f"\n--- Testing {len(TOP_PLAYER_IDS)} Known TOP_PLAYERS IDs ---")
    for pid in TOP_PLAYER_IDS:
        # GET
        res_get = client.get(f"/api/players/{pid}/dna")
        assert res_get.status_code != 500, f"500 Internal Server Error on GET /api/players/{pid}/dna"
        assert res_get.status_code == 200, f"Expected 200 on GET /api/players/{pid}/dna, got {res_get.status_code}"
        get_json = res_get.json()
        assert "dna_score" in get_json, f"Missing dna_score for player {pid}"
        assert get_json["player_id"] == pid

        # POST
        res_post = client.post(f"/api/players/{pid}/dna")
        assert res_post.status_code != 500, f"500 Internal Server Error on POST /api/players/{pid}/dna"
        assert res_post.status_code == 200, f"Expected 200 on POST /api/players/{pid}/dna, got {res_post.status_code}"

        print(f"✓ Player {pid} ({get_json.get('player_name')}) DNA Score: {get_json.get('dna_score')}")

    # 2. Test Unknown IDs (GET and POST)
    print(f"\n--- Testing {len(UNKNOWN_IDS)} Unknown Player IDs: {UNKNOWN_IDS} ---")
    for uid in UNKNOWN_IDS:
        # GET
        res_get = client.get(f"/api/players/{uid}/dna")
        assert res_get.status_code != 500, f"500 Internal Server Error on GET /api/players/{uid}/dna"
        # POST
        res_post = client.post(f"/api/players/{uid}/dna")
        assert res_post.status_code != 500, f"500 Internal Server Error on POST /api/players/{uid}/dna"

        if not flag_enabled:
            assert res_get.status_code == 404, f"Expected 404 for unknown {uid} with flag OFF, got {res_get.status_code}"
            assert res_post.status_code == 404, f"Expected 404 for unknown {uid} with flag OFF, got {res_post.status_code}"
            print(f"✓ Unknown player {uid} correctly rejected with 404 (flag OFF)")
        else:
            print(f"✓ Unknown player {uid} handled gracefully with status {res_get.status_code} (flag ON, mock upstream)")

def test_live_lookup_guard_full_suite():
    class MockResponse:
        def __init__(self, json_data, status_code=200):
            self._json = json_data
            self.status_code = status_code
            self.text = "OK"

        def json(self):
            return self._json

    async def mock_get(url, headers=None, params=None):
        # Return mock 404 or empty response for unknown players
        return MockResponse({"response": []}, status_code=200)

    mock_instance = MagicMock()
    mock_instance.get = mock_get

    with patch("httpx.AsyncClient") as mock_client_cls:
        mock_client_cls.return_value.__aenter__.return_value = mock_instance

        # Phase A: Flag OFF
        run_dna_suite(flag_enabled=False, mock_client_cls=mock_client_cls)
        # When flag is OFF, httpx.AsyncClient must NOT even be instantiated for player lookups!
        off_instantiations = mock_client_cls.call_count
        print(f"\nhttpx.AsyncClient calls with flag OFF: {off_instantiations}")
        assert off_instantiations == 0, f"Expected 0 httpx calls with flag OFF, got {off_instantiations}"

        # Phase B: Flag ON (mocked httpx)
        run_dna_suite(flag_enabled=True, mock_client_cls=mock_client_cls)
        print(f"\nTotal httpx.AsyncClient calls across entire test: {mock_client_cls.call_count}")

    print("\n=======================================================")
    print("ALL TESTS PASSED: NO 500s AND ZERO REAL OUTBOUND CALLS!")
    print("=======================================================")

if __name__ == "__main__":
    test_live_lookup_guard_full_suite()
