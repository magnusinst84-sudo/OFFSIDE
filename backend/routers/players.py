from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import os, httpx
from typing import Optional
from cache_db import get_cache, set_cache

router = APIRouter()

API_FOOTBALL_KEY = os.getenv("API_FOOTBALL_KEY", "")
API_FOOTBALL_BASE = "https://v3.football.api-sports.io"
HEADERS = {"x-apisports-key": API_FOOTBALL_KEY}
ENABLE_LIVE_PLAYER_LOOKUP = os.getenv("ENABLE_LIVE_PLAYER_LOOKUP", "false").lower() in ("true", "1", "yes")

TOP_PLAYERS = [
    {"id": 1100, "name": "Florian Wirtz", "team": "Germany", "position": "Midfielder", "nationality": "German", "number": 10, "club": "Bayer Leverkusen"},
    {"id": 1101, "name": "Kylian Mbappé", "team": "France", "position": "Forward", "nationality": "French", "number": 10, "club": "Real Madrid"},
    {"id": 1102, "name": "Vinicius Jr.", "team": "Brazil", "position": "Forward", "nationality": "Brazilian", "number": 7, "club": "Real Madrid"},
    {"id": 1103, "name": "Erling Haaland", "team": "Norway", "position": "Forward", "nationality": "Norwegian", "number": 9, "club": "Manchester City"},
    {"id": 1104, "name": "Pedri", "team": "Spain", "position": "Midfielder", "nationality": "Spanish", "number": 8, "club": "Barcelona"},
    {"id": 1105, "name": "Jude Bellingham", "team": "England", "position": "Midfielder", "nationality": "English", "number": 10, "club": "Real Madrid"},
    {"id": 1106, "name": "Lamine Yamal", "team": "Spain", "position": "Forward", "nationality": "Spanish", "number": 19, "club": "Barcelona"},
    {"id": 1107, "name": "Bukayo Saka", "team": "England", "position": "Forward", "nationality": "English", "number": 7, "club": "Arsenal"},
    {"id": 1108, "name": "Phil Foden", "team": "England", "position": "Midfielder", "nationality": "English", "number": 11, "club": "Manchester City"},
    {"id": 1109, "name": "Gavi", "team": "Spain", "position": "Midfielder", "nationality": "Spanish", "number": 6, "club": "Barcelona"},
    {"id": 1110, "name": "Rodri", "team": "Spain", "position": "Midfielder", "nationality": "Spanish", "number": 16, "club": "Manchester City"},
    {"id": 1111, "name": "Federico Valverde", "team": "Uruguay", "position": "Midfielder", "nationality": "Uruguayan", "number": 8, "club": "Real Madrid"},
    {"id": 1112, "name": "Darwin Núñez", "team": "Uruguay", "position": "Forward", "nationality": "Uruguayan", "number": 9, "club": "Liverpool"},
    {"id": 1113, "name": "Antoine Griezmann", "team": "France", "position": "Forward", "nationality": "French", "number": 7, "club": "Atletico Madrid"},
    {"id": 1114, "name": "Harry Kane", "team": "England", "position": "Forward", "nationality": "English", "number": 9, "club": "Bayern Munich"},
    {"id": 1115, "name": "Mohamed Salah", "team": "Egypt", "position": "Forward", "nationality": "Egyptian", "number": 11, "club": "Liverpool"},
    {"id": 1116, "name": "Victor Osimhen", "team": "Nigeria", "position": "Forward", "nationality": "Nigerian", "number": 9, "club": "Galatasaray"},
]

DNA_PROFILES = {
    1100: {"dna_score": 93, "strengths": ["Vision", "Chance Creation", "Dribbling in Tight Spaces", "Key Passes"], "weaknesses": ["Aerial Duels"], "role_suitability": {"striker": 70, "winger": 88, "cam": 97, "cm": 82}, "attributes": {"pace": 83, "dribbling": 92, "passing": 92, "shooting": 85, "defending": 52, "physicality": 70}, "predicted_impact": 9.1, "comparison_players": ["Kevin De Bruyne", "Mesut Özil"]},
    1101: {"dna_score": 96, "strengths": ["Pace", "Clinical finishing", "1v1", "Big game temperament"], "weaknesses": ["Aerial positioning", "Tracking back"], "role_suitability": {"striker": 94, "winger": 98, "cam": 72, "cm": 45}, "attributes": {"pace": 99, "dribbling": 92, "passing": 80, "shooting": 95, "defending": 42, "physicality": 76}, "predicted_impact": 9.2, "comparison_players": ["Thierry Henry", "Ronaldo R9", "George Weah"]},
    1102: {"dna_score": 94, "strengths": ["Pace", "Dribbling", "Creativity", "Pressing"], "weaknesses": ["Consistency", "Long-range shooting"], "role_suitability": {"striker": 78, "winger": 98, "cam": 82, "cm": 50}, "attributes": {"pace": 97, "dribbling": 95, "passing": 82, "shooting": 84, "defending": 40, "physicality": 74}, "predicted_impact": 8.9, "comparison_players": ["Ronaldo R9", "Romário", "Robinho"]},
    1103: {"dna_score": 95, "strengths": ["Predatory Finishing", "Aerial Threat", "Acceleration"], "weaknesses": ["Build-up Play"], "role_suitability": {"striker": 99, "winger": 20, "cam": 30, "cm": 15}, "attributes": {"pace": 89, "dribbling": 76, "passing": 68, "shooting": 97, "defending": 45, "physicality": 90}, "predicted_impact": 9.2, "comparison_players": ["Ruud van Nistelrooy", "Marco van Basten"]},
}

def compute_dynamic_dna(stats: dict, position: str = "") -> dict:
    # Compute genuine normalized radar metrics based on real stats
    goals = stats.get("goals", 0) or 0
    assists = stats.get("assists", 0) or 0
    minutes = max(1, stats.get("minutes_played", 0) or 900)
    per90 = 90.0 / minutes
    
    g90 = goals * per90
    a90 = assists * per90
    
    # Position heuristics
    is_fwd = "forward" in position.lower() or "striker" in position.lower() or "wing" in position.lower()
    is_mid = "midfield" in position.lower()
    is_def = "defend" in position.lower() or "back" in position.lower()
    
    pace = int(min(99, max(60, 75 + (5 if is_fwd else 0))))
    shooting = int(min(99, max(45, 65 + (g90 * 35))))
    passing = int(min(99, max(50, 70 + (a90 * 40) + (10 if is_mid else 0))))
    dribbling = int(min(99, max(50, 72 + (g90 * 15) + (a90 * 15))))
    defending = int(min(99, max(30, 85 if is_def else (60 if is_mid else 40))))
    physicality = int(min(99, max(55, 75)))
    
    dna_score = int(round((pace + shooting + passing + dribbling + defending + physicality) / 6))
    
    return {
        "dna_score": dna_score,
        "attributes": {
            "pace": pace,
            "dribbling": dribbling,
            "passing": passing,
            "shooting": shooting,
            "defending": defending,
            "physicality": physicality
        },
        "strengths": ["High technical output" if g90 > 0.3 else "Positional awareness", "Chance creation" if a90 > 0.2 else "Work rate"],
        "weaknesses": ["Aerial duels" if is_mid else "Defensive recovery"],
        "role_suitability": {
            "striker": 90 if is_fwd else 50,
            "winger": 88 if is_fwd else 65,
            "cam": 85 if is_mid else 60,
            "cm": 90 if is_mid else 40
        },
        "predicted_impact": round(min(9.9, max(6.5, dna_score / 10.0)), 1),
        "comparison_players": ["Top Tier European Profile", "High Intensity Archetype"]
    }

@router.get("/")
async def list_roster():
    cache_key = "player_roster_featured"
    cached = get_cache(cache_key)
    if cached is not None:
        return cached
    
    players_list = []
    for p in TOP_PLAYERS:
        dna = DNA_PROFILES.get(p["id"], compute_dynamic_dna({"goals": 10, "assists": 5}, p.get("position", "")))
        players_list.append({
            **p,
            "dna_score": dna["dna_score"],
            "attributes": dna["attributes"],
            "predicted_impact": dna["predicted_impact"]
        })
    set_cache(cache_key, players_list, ttl_seconds=86400)
    return {"players": players_list, "count": len(players_list)}

@router.get("/search")
async def search_players(q: str = Query(..., min_length=2)):
    cache_key = f"player_search_{q.lower().strip()}"
    cached = get_cache(cache_key)
    if cached is not None:
        return cached

    results = [p for p in TOP_PLAYERS if q.lower() in p["name"].lower()]
    
    if not results and ENABLE_LIVE_PLAYER_LOOKUP and API_FOOTBALL_KEY:
        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                r = await client.get(
                    f"{API_FOOTBALL_BASE}/players",
                    headers=HEADERS,
                    params={"search": q}
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
    
    data = {"players": results[:20], "count": len(results)}
    set_cache(cache_key, data, ttl_seconds=86400) # Cache search for 24 hours
    return data

@router.get("/{player_id}")
async def get_player(player_id: int):
    cache_key = f"player_detail_{player_id}"
    cached = get_cache(cache_key)
    if cached is not None:
        return cached

    player = next((p for p in TOP_PLAYERS if p["id"] == player_id), None)
    
    if player:
        data = {
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
        set_cache(cache_key, data, ttl_seconds=86400)
        return data
    
    if ENABLE_LIVE_PLAYER_LOOKUP and API_FOOTBALL_KEY:
        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                r = await client.get(
                    f"{API_FOOTBALL_BASE}/players",
                    headers=HEADERS,
                    params={"id": player_id}
                )
                if r.status_code == 200:
                    data = r.json().get("response", [])
                    if data:
                        p = data[0]
                        pl = p.get("player", {})
                        stats = p.get("statistics", [{}])[0]
                        result = {
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
                        set_cache(cache_key, result, ttl_seconds=86400)
                        return result
            except Exception:
                pass
    
    return JSONResponse(status_code=404, content={"error": "Player not found", "id": player_id})

@router.get("/{player_id}/dna")
@router.post("/{player_id}/dna")
async def get_player_dna_endpoint(player_id: int):
    player = next((p for p in TOP_PLAYERS if p["id"] == player_id), None)
    player_name = player["name"] if player else f"Player {player_id}"
    team = player["team"] if player else "Unknown"
    pos = player.get("position", "") if player else ""
    
    dna = DNA_PROFILES.get(player_id, compute_dynamic_dna({"goals": 10, "assists": 5}, pos))
    
    return {
        "player_id": player_id,
        "player_name": player_name,
        "team": team,
        **dna,
    }
