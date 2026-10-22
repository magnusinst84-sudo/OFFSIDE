import os
from unittest.mock import patch, MagicMock

# Ensure flag is OFF
os.environ["ENABLE_LIVE_PLAYER_LOOKUP"] = "false"
os.environ["API_FOOTBALL_KEY"] = "mock_key_12345"

# Import app / router after env set
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_no_outbound_httpx_when_flag_off():
    with patch("httpx.AsyncClient") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value.__aenter__.return_value = mock_instance
        
        print("=== TEST 1: Unknown player lookup (/api/players/999999) ===")
        res = client.get("/api/players/999999")
        print(f"Status Code: {res.status_code}")
        print(f"Response JSON: {res.json()}")
        assert res.status_code == 404, f"Expected 404, got {res.status_code}"
        assert res.json() == {"error": "Player not found", "id": 999999}
        
        print("\n=== TEST 2: Unknown player search (/api/players/search?q=NonexistentPlayerXYZ) ===")
        res_search = client.get("/api/players/search?q=NonexistentPlayerXYZ")
        print(f"Status Code: {res_search.status_code}")
        print(f"Response JSON: {res_search.json()}")
        assert res_search.status_code == 200
        assert res_search.json() == {"players": [], "count": 0}
        
        print("\n=== TEST 3: Known top player (/api/players/1101 - Mbappé) ===")
        res_top = client.get("/api/players/1101")
        print(f"Status Code: {res_top.status_code}")
        print(f"Player Name: {res_top.json().get('name')}")
        assert res_top.status_code == 200
        assert res_top.json().get("name") == "Kylian Mbappé"

        print("\n=== TEST 4: GET & POST /api/players/278/dna (flag off) ===")
        res_278_get = client.get("/api/players/278/dna")
        print(f"GET /278/dna Status: {res_278_get.status_code} | Body: {res_278_get.json()}")
        assert res_278_get.status_code == 404
        assert res_278_get.json() == {"error": "Player not found", "id": 278}

        res_278_post = client.post("/api/players/278/dna")
        print(f"POST /278/dna Status: {res_278_post.status_code} | Body: {res_278_post.json()}")
        assert res_278_post.status_code == 404
        assert res_278_post.json() == {"error": "Player not found", "id": 278}

        print("\n=== TEST 5: GET & POST /api/players/999999/dna (flag off) ===")
        res_999_get = client.get("/api/players/999999/dna")
        print(f"GET /999999/dna Status: {res_999_get.status_code} | Body: {res_999_get.json()}")
        assert res_999_get.status_code == 404
        assert res_999_get.json() == {"error": "Player not found", "id": 999999}

        res_999_post = client.post("/api/players/999999/dna")
        print(f"POST /999999/dna Status: {res_999_post.status_code} | Body: {res_999_post.json()}")
        assert res_999_post.status_code == 404
        assert res_999_post.json() == {"error": "Player not found", "id": 999999}

        print("\n=== TEST 6: Known player DNA (/api/players/1101/dna) ===")
        res_1101_dna = client.get("/api/players/1101/dna")
        print(f"GET /1101/dna Status: {res_1101_dna.status_code} | Score: {res_1101_dna.json().get('dna_score')}")
        assert res_1101_dna.status_code == 200
        assert res_1101_dna.json().get("dna_score") == 96

        # Assert ZERO outbound httpx calls were made across all tests!
        print(f"\nhttpx.AsyncClient instantiation count: {mock_client_cls.call_count}")
        assert mock_client_cls.call_count == 0, f"Expected 0 calls, but httpx was instantiated {mock_client_cls.call_count} times!"
        print("✓ ALL TESTS PASSED: ZERO outbound httpx calls and no unhandled exceptions with ENABLE_LIVE_PLAYER_LOOKUP=false!")

if __name__ == "__main__":
    test_no_outbound_httpx_when_flag_off()
