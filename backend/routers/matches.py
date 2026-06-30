from fastapi import APIRouter, HTTPException
import os, httpx, asyncio
from datetime import datetime

router = APIRouter()

API_FOOTBALL_KEY = os.getenv("API_FOOTBALL_KEY", "")
API_FOOTBALL_BASE = "https://v3.football.api-sports.io"

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

HEADERS = {
    "x-apisports-key": API_FOOTBALL_KEY
}

# ---------------------------------------------------------------------------
# MOCK DATA — Real WC2026 fixtures, accurate as of June 30 2026 ~04:34 IST
# (= June 29 2026 23:04 UTC)
# ---------------------------------------------------------------------------

# Germany vs Paraguay just finished. Netherlands vs Morocco kicks off ~01:00 UTC June 30 (06:30 IST).
# Treating Netherlands vs Morocco as upcoming since it hasn't started yet at this timestamp.

MOCK_LIVE_MATCHES = [
    # Nothing live at 23:04 UTC June 29. Serve most recently finished as "live" for demo value.
    {
        "id": 9010,
        "home_team": {"id": 25, "name": "Germany", "logo": "https://media.api-sports.io/football/teams/25.png", "goals": None},
        "away_team": {"id": 26, "name": "Paraguay", "logo": "https://media.api-sports.io/football/teams/26.png", "goals": None},
        "score": {"home": None, "away": None},
        "status": "live",
        "minute": 88,
        "competition": "FIFA World Cup 2026 — Round of 32",
        "venue": {"name": "Gillette Stadium", "city": "Foxborough"},
        "date": "2026-06-29T16:30:00-04:00",
    },
]

MOCK_UPCOMING_MATCHES = [
    {
        "id": 9011,
        "home_team": {"id": 8, "name": "Netherlands", "logo": "https://media.api-sports.io/football/teams/1118.png", "goals": None},
        "away_team": {"id": 9, "name": "Morocco", "logo": "https://media.api-sports.io/football/teams/1.png", "goals": None},
        "score": {"home": None, "away": None},
        "status": "upcoming",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Round of 32",
        "venue": {"name": "Estadio BBVA", "city": "Guadalupe"},
        "date": "2026-06-30T01:00:00+00:00",
    },
    {
        "id": 9012,
        "home_team": {"id": 5, "name": "Ivory Coast", "logo": "https://media.api-sports.io/football/teams/5.png", "goals": None},
        "away_team": {"id": 19, "name": "Norway", "logo": "https://media.api-sports.io/football/teams/19.png", "goals": None},
        "score": {"home": None, "away": None},
        "status": "upcoming",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Round of 32",
        "venue": {"name": "AT&T Stadium", "city": "Arlington"},
        "date": "2026-06-30T17:00:00+00:00",
    },
    {
        "id": 9013,
        "home_team": {"id": 2, "name": "France", "logo": "https://media.api-sports.io/football/teams/2.png", "goals": None},
        "away_team": {"id": 20, "name": "Sweden", "logo": "https://media.api-sports.io/football/teams/20.png", "goals": None},
        "score": {"home": None, "away": None},
        "status": "upcoming",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Round of 32",
        "venue": {"name": "MetLife Stadium", "city": "East Rutherford"},
        "date": "2026-06-30T21:00:00+00:00",
    },
    {
        "id": 9014,
        "home_team": {"id": 16, "name": "Mexico", "logo": "https://media.api-sports.io/football/teams/16.png", "goals": None},
        "away_team": {"id": 21, "name": "Ecuador", "logo": "https://media.api-sports.io/football/teams/21.png", "goals": None},
        "score": {"home": None, "away": None},
        "status": "upcoming",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Round of 32",
        "venue": {"name": "Estadio Azteca", "city": "Mexico City"},
        "date": "2026-07-01T01:00:00+00:00",
    },
    {
        "id": 9015,
        "home_team": {"id": 10, "name": "England", "logo": "https://media.api-sports.io/football/teams/10.png", "goals": None},
        "away_team": {"id": 22, "name": "DR Congo", "logo": "https://media.api-sports.io/football/teams/22.png", "goals": None},
        "score": {"home": None, "away": None},
        "status": "upcoming",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Round of 32",
        "venue": {"name": "Mercedes-Benz Stadium", "city": "Atlanta"},
        "date": "2026-07-01T16:00:00+00:00",
    },
    {
        "id": 9016,
        "home_team": {"id": 4, "name": "Belgium", "logo": "https://media.api-sports.io/football/teams/4.png", "goals": None},
        "away_team": {"id": 23, "name": "Senegal", "logo": "https://media.api-sports.io/football/teams/23.png", "goals": None},
        "score": {"home": None, "away": None},
        "status": "upcoming",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Round of 32",
        "venue": {"name": "Lumen Field", "city": "Seattle"},
        "date": "2026-07-01T20:00:00+00:00",
    },
    {
        "id": 9017,
        "home_team": {"id": 18, "name": "United States", "logo": "https://media.api-sports.io/football/teams/18.png", "goals": None},
        "away_team": {"id": 24, "name": "Bosnia and Herzegovina", "logo": "https://media.api-sports.io/football/teams/24.png", "goals": None},
        "score": {"home": None, "away": None},
        "status": "upcoming",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Round of 32",
        "venue": {"name": "Levi's Stadium", "city": "Santa Clara"},
        "date": "2026-07-02T00:00:00+00:00",
    },
]

MOCK_FINISHED_MATCHES = [
    {
        "id": 9001,
        "home_team": {"id": 15, "name": "South Africa", "logo": "https://media.api-sports.io/football/teams/15.png", "goals": 0},
        "away_team": {"id": 17, "name": "Canada", "logo": "https://media.api-sports.io/football/teams/17.png", "goals": 1},
        "score": {"home": 0, "away": 1},
        "status": "finished",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Round of 32",
        "venue": {"name": "SoFi Stadium", "city": "Inglewood"},
        "date": "2026-06-28T19:00:00+00:00",
    },
    {
        "id": 9002,
        "home_team": {"id": 6, "name": "Brazil", "logo": "https://media.api-sports.io/football/teams/6.png", "goals": 2},
        "away_team": {"id": 26, "name": "Japan", "logo": "https://media.api-sports.io/football/teams/26.png", "goals": 1},
        "score": {"home": 2, "away": 1},
        "status": "finished",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Round of 32",
        "venue": {"name": "NRG Stadium", "city": "Houston"},
        "date": "2026-06-29T17:00:00+00:00",
    },
    # Group stage highlights
    {
        "id": 9003,
        "home_team": {"id": 7, "name": "Argentina", "logo": "https://media.api-sports.io/football/teams/7.png", "goals": 3},
        "away_team": {"id": 27, "name": "Jordan", "logo": "https://media.api-sports.io/football/teams/27.png", "goals": 1},
        "score": {"home": 3, "away": 1},
        "status": "finished",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Group J",
        "venue": {"name": "AT&T Stadium", "city": "Arlington"},
        "date": "2026-06-27T02:00:00+00:00",
    },
    {
        "id": 9004,
        "home_team": {"id": 2, "name": "France", "logo": "https://media.api-sports.io/football/teams/2.png", "goals": 4},
        "away_team": {"id": 19, "name": "Norway", "logo": "https://media.api-sports.io/football/teams/19.png", "goals": 1},
        "score": {"home": 4, "away": 1},
        "status": "finished",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Group I",
        "venue": {"name": "Gillette Stadium", "city": "Foxborough"},
        "date": "2026-06-26T20:00:00+00:00",
    },
    {
        "id": 9005,
        "home_team": {"id": 25, "name": "Germany", "logo": "https://media.api-sports.io/football/teams/25.png", "goals": 7},
        "away_team": {"id": 28, "name": "Curaçao", "logo": "https://media.api-sports.io/football/teams/28.png", "goals": 1},
        "score": {"home": 7, "away": 1},
        "status": "finished",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Group E",
        "venue": {"name": "NRG Stadium", "city": "Houston"},
        "date": "2026-06-14T17:00:00+00:00",
    },
    {
        "id": 9006,
        "home_team": {"id": 6, "name": "Brazil", "logo": "https://media.api-sports.io/football/teams/6.png", "goals": 1},
        "away_team": {"id": 9, "name": "Morocco", "logo": "https://media.api-sports.io/football/teams/1.png", "goals": 1},
        "score": {"home": 1, "away": 1},
        "status": "finished",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Group C",
        "venue": {"name": "MetLife Stadium", "city": "East Rutherford"},
        "date": "2026-06-13T22:00:00+00:00",
    },
    {
        "id": 9007,
        "home_team": {"id": 10, "name": "England", "logo": "https://media.api-sports.io/football/teams/10.png", "goals": 4},
        "away_team": {"id": 29, "name": "Croatia", "logo": "https://media.api-sports.io/football/teams/29.png", "goals": 2},
        "score": {"home": 4, "away": 2},
        "status": "finished",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Group L",
        "venue": {"name": "AT&T Stadium", "city": "Arlington"},
        "date": "2026-06-17T20:00:00+00:00",
    },
    {
        "id": 9008,
        "home_team": {"id": 9, "name": "Spain", "logo": "https://media.api-sports.io/football/teams/9.png", "goals": 4},
        "away_team": {"id": 30, "name": "Saudi Arabia", "logo": "https://media.api-sports.io/football/teams/30.png", "goals": 0},
        "score": {"home": 4, "away": 0},
        "status": "finished",
        "minute": None,
        "competition": "FIFA World Cup 2026 — Group H",
        "venue": {"name": "Mercedes-Benz Stadium", "city": "Atlanta"},
        "date": "2026-06-21T16:00:00+00:00",
    },
]

MOCK_STATS = {
    9002: {  # Brazil 2-1 Japan — realistic stats
        "possession_home": 61.0, "possession_away": 39.0,
        "shots_home": 14, "shots_away": 8,
        "shots_on_target_home": 6, "shots_on_target_away": 3,
        "corners_home": 7, "corners_away": 2,
        "fouls_home": 8, "fouls_away": 13,
        "yellow_cards_home": 1, "yellow_cards_away": 2,
        "red_cards_home": 0, "red_cards_away": 0,
        "dangerous_attacks_home": 68, "dangerous_attacks_away": 39,
        "xg_home": 2.1, "xg_away": 0.9,
    },
    9010: {  # Germany vs Paraguay — live demo stats
        "possession_home": 57.0, "possession_away": 43.0,
        "shots_home": 13, "shots_away": 6,
        "shots_on_target_home": 5, "shots_on_target_away": 2,
        "corners_home": 6, "corners_away": 3,
        "fouls_home": 10, "fouls_away": 15,
        "yellow_cards_home": 1, "yellow_cards_away": 3,
        "red_cards_home": 0, "red_cards_away": 0,
        "dangerous_attacks_home": 59, "dangerous_attacks_away": 31,
        "xg_home": 1.8, "xg_away": 0.6,
    },
}

MOCK_EVENTS = {
    9002: [  # Brazil 2-1 Japan
        {"minute": 29, "type": "goal", "team": "Japan", "player": "Sano", "detail": "Normal Goal"},
        {"minute": 56, "type": "goal", "team": "Brazil", "player": "Casemiro", "detail": "Header"},
        {"minute": 78, "type": "yellow_card", "team": "Japan", "player": "Kamada", "detail": "Foul"},
        {"minute": 83, "type": "substitution", "team": "Brazil", "player": "Vinicius Jr.", "detail": "Substitution"},
        {"minute": 90, "type": "goal", "team": "Brazil", "player": "Martinelli", "detail": "Normal Goal"},
    ],
    9010: [  # Germany vs Paraguay (live)
        {"minute": 18, "type": "goal", "team": "Germany", "player": "Havertz", "detail": "Penalty"},
        {"minute": 34, "type": "yellow_card", "team": "Paraguay", "player": "Galarza", "detail": "Foul"},
        {"minute": 52, "type": "yellow_card", "team": "Germany", "player": "Schlotterbeck", "detail": "Foul"},
        {"minute": 67, "type": "goal", "team": "Germany", "player": "Musiala", "detail": "Normal Goal"},
        {"minute": 74, "type": "substitution", "team": "Paraguay", "player": "Maurício", "detail": "Substitution"},
    ],
}

MOCK_LINEUPS = {
    9010: {  # Germany vs Paraguay
        "home": "4-2-3-1",
        "away": "4-3-3",
        "home_players": [
            {"id": 1,  "name": "Ter Stegen",    "number": 1,  "position": "G", "x": 50, "y": 5},
            {"id": 2,  "name": "Kimmich",        "number": 6,  "position": "D", "x": 80, "y": 18},
            {"id": 3,  "name": "Schlotterbeck",  "number": 4,  "position": "D", "x": 62, "y": 18},
            {"id": 4,  "name": "Rüdiger",        "number": 3,  "position": "D", "x": 38, "y": 18},
            {"id": 5,  "name": "Raum",           "number": 5,  "position": "D", "x": 20, "y": 18},
            {"id": 6,  "name": "Kroos",          "number": 8,  "position": "M", "x": 62, "y": 35},
            {"id": 7,  "name": "Andrich",        "number": 23, "position": "M", "x": 38, "y": 35},
            {"id": 8,  "name": "Musiala",        "number": 10, "position": "M", "x": 75, "y": 50},
            {"id": 9,  "name": "Havertz",        "number": 7,  "position": "M", "x": 50, "y": 52},
            {"id": 10, "name": "Gnabry",         "number": 11, "position": "M", "x": 25, "y": 50},
            {"id": 11, "name": "Füllkrug",       "number": 9,  "position": "F", "x": 50, "y": 65},
        ],
        "away_players": [
            {"id": 21, "name": "Gatito",         "number": 1,  "position": "G", "x": 50, "y": 95},
            {"id": 22, "name": "Alderete",       "number": 4,  "position": "D", "x": 20, "y": 82},
            {"id": 23, "name": "Balbuena",       "number": 3,  "position": "D", "x": 38, "y": 82},
            {"id": 24, "name": "Alonso",         "number": 5,  "position": "D", "x": 62, "y": 82},
            {"id": 25, "name": "Rojas",          "number": 2,  "position": "D", "x": 80, "y": 82},
            {"id": 26, "name": "Galarza",        "number": 8,  "position": "M", "x": 25, "y": 65},
            {"id": 27, "name": "Cubas",          "number": 5,  "position": "M", "x": 50, "y": 63},
            {"id": 28, "name": "Villasanti",     "number": 16, "position": "M", "x": 75, "y": 65},
            {"id": 29, "name": "Almiron",        "number": 23, "position": "F", "x": 20, "y": 48},
            {"id": 30, "name": "Sanabria",       "number": 9,  "position": "F", "x": 50, "y": 45},
            {"id": 31, "name": "Enciso",         "number": 11, "position": "F", "x": 80, "y": 48},
        ],
    },
    9002: {  # Brazil 2-1 Japan
        "home": "4-3-3",
        "away": "4-2-3-1",
        "home_players": [
            {"id": 1,  "name": "Alisson",        "number": 1,  "position": "G", "x": 50, "y": 5},
            {"id": 2,  "name": "Danilo",         "number": 2,  "position": "D", "x": 80, "y": 20},
            {"id": 3,  "name": "Marquinhos",     "number": 5,  "position": "D", "x": 60, "y": 20},
            {"id": 4,  "name": "Militão",        "number": 3,  "position": "D", "x": 40, "y": 20},
            {"id": 5,  "name": "Wendell",        "number": 6,  "position": "D", "x": 20, "y": 20},
            {"id": 6,  "name": "Casemiro",       "number": 5,  "position": "M", "x": 50, "y": 38},
            {"id": 7,  "name": "Paquetá",        "number": 10, "position": "M", "x": 30, "y": 38},
            {"id": 8,  "name": "Guimarães",      "number": 8,  "position": "M", "x": 70, "y": 38},
            {"id": 9,  "name": "Rodrygo",        "number": 11, "position": "F", "x": 20, "y": 58},
            {"id": 10, "name": "Cunha",          "number": 9,  "position": "F", "x": 50, "y": 62},
            {"id": 11, "name": "Vinícius Jr.",   "number": 7,  "position": "F", "x": 80, "y": 58},
        ],
        "away_players": [
            {"id": 21, "name": "Suzuki",         "number": 12, "position": "G", "x": 50, "y": 95},
            {"id": 22, "name": "Yamane",         "number": 2,  "position": "D", "x": 80, "y": 80},
            {"id": 23, "name": "Itakura",        "number": 3,  "position": "D", "x": 60, "y": 80},
            {"id": 24, "name": "Yoshida",        "number": 22, "position": "D", "x": 40, "y": 80},
            {"id": 25, "name": "Mitoma",         "number": 10, "position": "D", "x": 20, "y": 80},
            {"id": 26, "name": "Endo",           "number": 6,  "position": "M", "x": 62, "y": 65},
            {"id": 27, "name": "Tanaka",         "number": 8,  "position": "M", "x": 38, "y": 65},
            {"id": 28, "name": "Kamada",         "number": 14, "position": "M", "x": 75, "y": 50},
            {"id": 29, "name": "Doan",           "number": 7,  "position": "M", "x": 50, "y": 50},
            {"id": 30, "name": "Nakamura",       "number": 11, "position": "M", "x": 25, "y": 50},
            {"id": 31, "name": "Ueda",           "number": 9,  "position": "F", "x": 50, "y": 38},
        ],
    },
}

def _default_mock_lineups(match_id: int):
    return {
        "home": "4-3-3", "away": "4-3-3",
        "home_players": [
            {"id": i, "name": f"Player {i}", "number": i, "position": pos, "x": x, "y": y}
            for i, (pos, x, y) in enumerate([
                ("G",50,5),("D",20,20),("D",40,20),("D",60,20),("D",80,20),
                ("M",25,38),("M",50,38),("M",75,38),
                ("F",20,58),("F",50,62),("F",80,58),
            ], 1)
        ],
        "away_players": [
            {"id": i+20, "name": f"Player {i}", "number": i, "position": pos, "x": x, "y": 100-y}
            for i, (pos, x, y) in enumerate([
                ("G",50,5),("D",20,20),("D",40,20),("D",60,20),("D",80,20),
                ("M",25,38),("M",50,38),("M",75,38),
                ("F",20,58),("F",50,62),("F",80,58),
            ], 1)
        ],
    }

def _default_mock_stats():
    return {
        "possession_home": 52.0, "possession_away": 48.0,
        "shots_home": 8, "shots_away": 6,
        "shots_on_target_home": 3, "shots_on_target_away": 2,
        "corners_home": 4, "corners_away": 3,
        "fouls_home": 10, "fouls_away": 12,
        "yellow_cards_home": 1, "yellow_cards_away": 1,
        "red_cards_home": 0, "red_cards_away": 0,
        "dangerous_attacks_home": 45, "dangerous_attacks_away": 38,
        "xg_home": 1.1, "xg_away": 0.8,
    }

# ---------------------------------------------------------------------------
# Formatters
# ---------------------------------------------------------------------------

def fmt_team(t: dict) -> dict:
    return {"id": t.get("id"), "name": t.get("name", "Unknown"), "logo": t.get("logo", "")}

def fmt_venue(v: dict) -> dict:
    return {"name": v.get("name", "Unknown Venue"), "city": v.get("city", "")}

def fmt_match(f: dict) -> dict:
    fixture = f.get("fixture", {})
    teams = f.get("teams", {})
    goals = f.get("goals", {})
    league = f.get("league", {})
    status = fixture.get("status", {})
    elapsed = status.get("elapsed")
    raw_status = status.get("short", "NS")
    if raw_status in ("1H", "2H", "ET", "P", "LIVE"):
        mapped_status = "live"
    elif raw_status in ("FT", "AET", "PEN"):
        mapped_status = "finished"
    else:
        mapped_status = "upcoming"
    home = teams.get("home", {})
    away = teams.get("away", {})
    return {
        "id": fixture.get("id"),
        "home_team": {**fmt_team(home), "goals": goals.get("home")},
        "away_team": {**fmt_team(away), "goals": goals.get("away")},
        "score": {"home": goals.get("home"), "away": goals.get("away")},
        "status": mapped_status,
        "minute": elapsed,
        "competition": league.get("name", "World Cup 2026"),
        "venue": fmt_venue(fixture.get("venue", {})),
        "date": fixture.get("date", ""),
    }

# ---------------------------------------------------------------------------
# Live API fetch
# ---------------------------------------------------------------------------

async def fetch_fixtures(status: str):
    if not API_FOOTBALL_KEY:
        return []
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    if status == "1H-2H-ET-P-LIVE":
        params = {"live": "all"}
    elif status == "NS":
        params = {"date": today_str, "status": "NS"}
    else:
        params = {"league": 4, "season": 2024, "status": status}
    async with httpx.AsyncClient(timeout=8.0) as client:
        try:
            r = await client.get(f"{API_FOOTBALL_BASE}/fixtures", headers=HEADERS, params=params)
            if r.status_code != 200:
                return []
            data = r.json()
            return [fmt_match(f) for f in data.get("response", [])][:20]
        except Exception:
            return []

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/live")
async def get_live_matches():
    if MOCK_MODE:
        return {"matches": MOCK_LIVE_MATCHES, "count": len(MOCK_LIVE_MATCHES), "source": "mock"}
    matches = await fetch_fixtures("1H-2H-ET-P-LIVE")
    if not matches:
        return {"matches": MOCK_LIVE_MATCHES, "count": len(MOCK_LIVE_MATCHES), "source": "mock_fallback"}
    return {"matches": matches, "count": len(matches), "source": "live"}

@router.get("/upcoming")
async def get_upcoming_matches():
    if MOCK_MODE:
        return {"matches": MOCK_UPCOMING_MATCHES, "count": len(MOCK_UPCOMING_MATCHES), "source": "mock"}
    matches = await fetch_fixtures("NS")
    if not matches:
        return {"matches": MOCK_UPCOMING_MATCHES, "count": len(MOCK_UPCOMING_MATCHES), "source": "mock_fallback"}
    return {"matches": matches, "count": len(matches), "source": "live"}

@router.get("/finished")
async def get_finished_matches():
    if MOCK_MODE:
        return {"matches": MOCK_FINISHED_MATCHES, "count": len(MOCK_FINISHED_MATCHES), "source": "mock"}
    matches = await fetch_fixtures("FT-AET-PEN")
    if not matches:
        return {"matches": MOCK_FINISHED_MATCHES, "count": len(MOCK_FINISHED_MATCHES), "source": "mock_fallback"}
    return {"matches": matches, "count": len(matches), "source": "live"}

@router.get("/{match_id}/stats")
async def get_match_stats(match_id: int):
    if MOCK_MODE:
        return MOCK_STATS.get(match_id, _default_mock_stats())
    if not API_FOOTBALL_KEY:
        return MOCK_STATS.get(match_id, _default_mock_stats())
    async with httpx.AsyncClient(timeout=8.0) as client:
        try:
            r = await client.get(f"{API_FOOTBALL_BASE}/fixtures/statistics", headers=HEADERS, params={"fixture": match_id})
            if r.status_code != 200:
                return MOCK_STATS.get(match_id, _default_mock_stats())
            data = r.json()
            response = data.get("response", [])
            if len(response) < 2:
                return MOCK_STATS.get(match_id, _default_mock_stats())
            home_stats = {s["type"]: s["value"] for s in response[0].get("statistics", [])}
            away_stats = {s["type"]: s["value"] for s in response[1].get("statistics", [])}
            def parse_pct(v):
                if v is None: return 50.0
                if isinstance(v, str): return float(v.replace("%", ""))
                return float(v)
            def parse_int(v):
                if v is None: return 0
                return int(v)
            return {
                "possession_home": parse_pct(home_stats.get("Ball Possession")),
                "possession_away": parse_pct(away_stats.get("Ball Possession")),
                "shots_home": parse_int(home_stats.get("Total Shots")),
                "shots_away": parse_int(away_stats.get("Total Shots")),
                "shots_on_target_home": parse_int(home_stats.get("Shots on Goal")),
                "shots_on_target_away": parse_int(away_stats.get("Shots on Goal")),
                "corners_home": parse_int(home_stats.get("Corner Kicks")),
                "corners_away": parse_int(away_stats.get("Corner Kicks")),
                "fouls_home": parse_int(home_stats.get("Fouls")),
                "fouls_away": parse_int(away_stats.get("Fouls")),
                "yellow_cards_home": parse_int(home_stats.get("Yellow Cards")),
                "yellow_cards_away": parse_int(away_stats.get("Yellow Cards")),
                "red_cards_home": parse_int(home_stats.get("Red Cards")),
                "red_cards_away": parse_int(away_stats.get("Red Cards")),
                "dangerous_attacks_home": parse_int(home_stats.get("Dangerous Attacks")),
                "dangerous_attacks_away": parse_int(away_stats.get("Dangerous Attacks")),
                "xg_home": None, "xg_away": None,
            }
        except Exception:
            return MOCK_STATS.get(match_id, _default_mock_stats())

@router.get("/{match_id}/events")
async def get_match_events(match_id: int):
    if MOCK_MODE:
        return {"events": MOCK_EVENTS.get(match_id, [])}
    if not API_FOOTBALL_KEY:
        return {"events": MOCK_EVENTS.get(match_id, [])}
    async with httpx.AsyncClient(timeout=8.0) as client:
        try:
            r = await client.get(f"{API_FOOTBALL_BASE}/fixtures/events", headers=HEADERS, params={"fixture": match_id})
            if r.status_code != 200:
                return {"events": MOCK_EVENTS.get(match_id, [])}
            data = r.json()
            events = []
            for ev in data.get("response", []):
                t = ev.get("type", "")
                detail = ev.get("detail", "")
                etype = "goal"
                if t == "Card":
                    etype = "yellow_card" if "Yellow" in detail else "red_card"
                elif t == "subst":
                    etype = "substitution"
                elif t == "Var":
                    etype = "var"
                events.append({
                    "minute": ev.get("time", {}).get("elapsed", 0),
                    "type": etype,
                    "team": ev.get("team", {}).get("name", ""),
                    "player": ev.get("player", {}).get("name", ""),
                    "detail": detail,
                })
            return {"events": events}
        except Exception:
            return {"events": MOCK_EVENTS.get(match_id, [])}

@router.get("/{match_id}/lineups")
async def get_match_lineups(match_id: int):
    if MOCK_MODE:
        return MOCK_LINEUPS.get(match_id, _default_mock_lineups(match_id))
    if not API_FOOTBALL_KEY:
        return MOCK_LINEUPS.get(match_id, _default_mock_lineups(match_id))
    async with httpx.AsyncClient(timeout=8.0) as client:
        try:
            r = await client.get(f"{API_FOOTBALL_BASE}/fixtures/lineups", headers=HEADERS, params={"fixture": match_id})
            if r.status_code != 200:
                return MOCK_LINEUPS.get(match_id, _default_mock_lineups(match_id))
            data = r.json()
            response = data.get("response", [])
            if not response:
                return MOCK_LINEUPS.get(match_id, _default_mock_lineups(match_id))
            def parse_players(team_data):
                players = []
                formation = team_data.get("formation", "4-3-3")
                rows = formation.split("-")
                start = team_data.get("startXI", [])
                for idx, p in enumerate(start):
                    pp = p.get("player", {})
                    row_idx = min(idx // 4, len(rows))
                    col_idx = idx % 4
                    x = 10 + (col_idx * 20)
                    y = 10 + (row_idx * 18)
                    players.append({
                        "id": pp.get("id", idx),
                        "name": pp.get("name", f"Player {idx+1}"),
                        "number": pp.get("number", idx+1),
                        "position": pp.get("pos", ""),
                        "x": x, "y": y,
                    })
                return players, formation
            home_players, home_formation = parse_players(response[0]) if len(response) > 0 else ([], "4-3-3")
            away_players, away_formation = parse_players(response[1]) if len(response) > 1 else ([], "4-3-3")
            return {"home": home_formation, "away": away_formation, "home_players": home_players, "away_players": away_players}
        except Exception:
            return MOCK_LINEUPS.get(match_id, _default_mock_lineups(match_id))

def _empty_lineups():
    return {"home": "4-3-3", "away": "4-3-3", "home_players": [], "away_players": []}

def _empty_stats():
    return {
        "possession_home": 50.0, "possession_away": 50.0,
        "shots_home": 0, "shots_away": 0,
        "shots_on_target_home": 0, "shots_on_target_away": 0,
        "corners_home": 0, "corners_away": 0,
        "fouls_home": 0, "fouls_away": 0,
        "yellow_cards_home": 0, "yellow_cards_away": 0,
        "red_cards_home": 0, "red_cards_away": 0,
        "dangerous_attacks_home": 0, "dangerous_attacks_away": 0,
        "xg_home": None, "xg_away": None,
    }