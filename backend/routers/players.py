from fastapi import APIRouter, Query
import os, httpx
from typing import Optional

router = APIRouter()

API_FOOTBALL_KEY = os.getenv("API_FOOTBALL_KEY", "")
API_FOOTBALL_BASE = "https://v3.football.api-sports.io"
HEADERS = {"x-apisports-key": API_FOOTBALL_KEY}

WC2026_PLAYERS = [
    {"id": 1100, "name": "Lionel Messi", "team": "Argentina", "position": "Forward", "nationality": "Argentine", "number": 10},
    {"id": 1101, "name": "Kylian Mbappé", "team": "France", "position": "Forward", "nationality": "French", "number": 10},
    {"id": 1102, "name": "Vinicius Jr.", "team": "Brazil", "position": "Forward", "nationality": "Brazilian", "number": 7},
    {"id": 1103, "name": "Erling Haaland", "team": "Norway", "position": "Forward", "nationality": "Norwegian", "number": 9},
    {"id": 1104, "name": "Pedri", "team": "Spain", "position": "Midfielder", "nationality": "Spanish", "number": 8},
    {"id": 1105, "name": "Jude Bellingham", "team": "England", "position": "Midfielder", "nationality": "English", "number": 10},
    {"id": 1106, "name": "Lamine Yamal", "team": "Spain", "position": "Forward", "nationality": "Spanish", "number": 19},
    {"id": 1107, "name": "Bukayo Saka", "team": "England", "position": "Forward", "nationality": "English", "number": 7},
    {"id": 1108, "name": "Phil Foden", "team": "England", "position": "Midfielder", "nationality": "English", "number": 11},
    {"id": 1109, "name": "Gavi", "team": "Spain", "position": "Midfielder", "nationality": "Spanish", "number": 6},
    {"id": 1110, "name": "Rodri", "team": "Spain", "position": "Midfielder", "nationality": "Spanish", "number": 16},
    {"id": 1111, "name": "Federico Valverde", "team": "Uruguay", "position": "Midfielder", "nationality": "Uruguayan", "number": 8},
    {"id": 1112, "name": "Darwin Núñez", "team": "Uruguay", "position": "Forward", "nationality": "Uruguayan", "number": 9},
    {"id": 1113, "name": "Antoine Griezmann", "team": "France", "position": "Forward", "nationality": "French", "number": 7},
    {"id": 1114, "name": "Harry Kane", "team": "England", "position": "Forward", "nationality": "English", "number": 9},
]

DNA_PROFILES = {
    1100: {"dna_score": 97, "strengths": ["Vision", "Dribbling", "Free kicks", "Positioning"], "weaknesses": ["Aerial duels", "Pressing intensity"], "role_suitability": {"striker": 85, "winger": 78, "cam": 99, "cm": 60}, "attributes": {"pace": 80, "dribbling": 99, "passing": 96, "shooting": 92, "defending": 35, "physicality": 65}, "predicted_impact": 9.4, "comparison_players": ["Ronaldinho", "Zidane", "Maradona"]},
    1101: {"dna_score": 96, "strengths": ["Pace", "Clinical finishing", "1v1", "Big game temperament"], "weaknesses": ["Aerial positioning", "Tracking back"], "role_suitability": {"striker": 94, "winger": 98, "cam": 72, "cm": 45}, "attributes": {"pace": 99, "dribbling": 92, "passing": 80, "shooting": 95, "defending": 42, "physicality": 76}, "predicted_impact": 9.2, "comparison_players": ["Thierry Henry", "Ronaldo R9", "George Weah"]},
    1102: {"dna_score": 94, "strengths": ["Pace", "Dribbling", "Creativity", "Pressing"], "weaknesses": ["Consistency", "Long-range shooting"], "role_suitability": {"striker": 78, "winger": 98, "cam": 82, "cm": 50}, "attributes": {"pace": 97, "dribbling": 95, "passing": 82, "shooting": 84, "defending": 40, "physicality": 74}, "predicted_impact": 8.9, "comparison_players": ["Ronaldo R9", "Romário", "Robinho"]},
}

def get_player_dna(player_id: int) -> dict:
    profile = DNA_PROFILES.get(player_id, {
        "dna_score": 78,
        "strengths": ["Technical ability", "Work rate", "Team cohesion"],
        "weaknesses": ["Experience at top level", "Set piece delivery"],
        "role_suitability": {"striker": 70, "winger": 65, "cam": 72, "cm": 60},
        "attributes": {"pace": 75, "dribbling": 72, "passing": 74, "shooting": 70, "defending": 55, "physicality": 68},
        "predicted_impact": 7.2,
        "comparison_players": ["Similar archetype player A", "Similar archetype player B"],
    })
    return profile

@router.get("/search")
async def search_players(q: str = Query(..., min_length=2)):
    results = [p for p in WC2026_PLAYERS if q.lower() in p["name"].lower()]
    
    if not results and API_FOOTBALL_KEY:
        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                r = await client.get(
                    f"{API_FOOTBALL_BASE}/players",
                    headers=HEADERS,
                    params={"search": q, "league": 1, "season": 2026}
                )
                if r.status_code == 200:
                    api_players = r.json().get("response", [])
                    for p in api_players[:10]:
                        player = p.get("player", {})
                        results.append({
                            "id": player.get("id"),
                            "name": player.get("name", ""),
                            "team": p.get("statistics", [{}])[0].get("team", {}).get("name", ""),
                            "position": player.get("position", ""),
                            "nationality": player.get("nationality", ""),
                            "number": 0,
                        })
            except Exception:
                pass
    
    return {"players": results[:20], "count": len(results)}

@router.get("/{player_id}")
async def get_player(player_id: int):
    player = next((p for p in WC2026_PLAYERS if p["id"] == player_id), None)
    
    if player:
        return {
            **player,
            "age": 26,
            "height": "177 cm",
            "foot": "Left",
            "goals": 12,
            "assists": 8,
            "xg": 10.4,
            "xa": 7.2,
            "minutes_played": 2340,
            "shots": [
                {"x": 85, "y": 34, "xg": 0.18, "outcome": "goal"},
                {"x": 78, "y": 42, "xg": 0.09, "outcome": "on_target"},
                {"x": 90, "y": 28, "xg": 0.42, "outcome": "goal"},
                {"x": 72, "y": 55, "xg": 0.04, "outcome": "off"},
            ]
        }
    
    if API_FOOTBALL_KEY:
        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                r = await client.get(
                    f"{API_FOOTBALL_BASE}/players",
                    headers=HEADERS,
                    params={"id": player_id, "season": 2026}
                )
                if r.status_code == 200:
                    data = r.json().get("response", [])
                    if data:
                        p = data[0]
                        pl = p.get("player", {})
                        stats = p.get("statistics", [{}])[0]
                        return {
                            "id": pl.get("id"),
                            "name": pl.get("name"),
                            "team": stats.get("team", {}).get("name", ""),
                            "position": pl.get("position", ""),
                            "nationality": pl.get("nationality", ""),
                            "age": pl.get("age"),
                            "height": pl.get("height", ""),
                            "foot": "Right",
                            "number": stats.get("games", {}).get("number", 0),
                            "goals": stats.get("goals", {}).get("total", 0),
                            "assists": stats.get("goals", {}).get("assists", 0),
                            "xg": None,
                            "xa": None,
                            "minutes_played": stats.get("games", {}).get("minutes", 0),
                            "shots": [],
                        }
            except Exception:
                pass
    
    return {"error": "Player not found", "id": player_id}

@router.post("/{player_id}/dna")
async def get_player_dna_endpoint(player_id: int):
    player = next((p for p in WC2026_PLAYERS if p["id"] == player_id), None)
    player_name = player["name"] if player else f"Player {player_id}"
    team = player["team"] if player else "Unknown"
    
    dna = get_player_dna(player_id)
    
    return {
        "player_id": player_id,
        "player_name": player_name,
        "team": team,
        **dna,
    }
