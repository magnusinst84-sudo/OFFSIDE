from fastapi import APIRouter, HTTPException
import os, httpx, asyncio
from datetime import datetime, timedelta
from cache_db import get_cache, set_cache, get_stale_cache
from api_football import api_football_request, get_configured_ttl

from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

API_FOOTBALL_BASE = "https://v3.football.api-sports.io"

# Configurable TTLs (in seconds)
TTL_MATCHES_LIVE = get_configured_ttl("MATCHES_LIVE", 45)
TTL_MATCHES_UPCOMING = get_configured_ttl("MATCHES_UPCOMING", 600)
TTL_MATCHES_FINISHED = get_configured_ttl("MATCHES_FINISHED", 600)
TTL_MATCH_DETAIL_LIVE = get_configured_ttl("MATCH_DETAIL_LIVE", 45)
TTL_MATCH_DETAIL_FINISHED = get_configured_ttl("MATCH_DETAIL_FINISHED", 3600)
TTL_MATCH_STATS = get_configured_ttl("MATCH_STATS", 30)
TTL_MATCH_EVENTS = get_configured_ttl("MATCH_EVENTS", 30)
TTL_MATCH_LINEUPS = get_configured_ttl("MATCH_LINEUPS", 900)

def get_headers():
    key = os.getenv("API_FOOTBALL_KEY", "")
    return {"x-apisports-key": key}

def is_mock_mode():
    return os.getenv("MOCK_MODE", "false").lower() == "true"

# ---------------------------------------------------------------------------
# FALLBACK DATA — Top European Competitions (UCL, Premier League, La Liga, etc.)
# Used only if API-Football is unreachable or returns empty results.
# ---------------------------------------------------------------------------

MOCK_LIVE_MATCHES = [
    {
        "id": 9101,
        "home_team": {"id": 541, "name": "Real Madrid", "logo": "https://media.api-sports.io/football/teams/541.png", "goals": 2},
        "away_team": {"id": 50, "name": "Manchester City", "logo": "https://media.api-sports.io/football/teams/50.png", "goals": 1},
        "score": {"home": 2, "away": 1},
        "status": "live",
        "minute": 67,
        "competition": "UEFA Champions League",
        "venue": {"name": "Santiago Bernabéu", "city": "Madrid"},
        "date": "2026-10-16T19:00:00+00:00",
    },
    {
        "id": 9102,
        "home_team": {"id": 42, "name": "Arsenal", "logo": "https://media.api-sports.io/football/teams/42.png", "goals": 1},
        "away_team": {"id": 157, "name": "Bayern Munich", "logo": "https://media.api-sports.io/football/teams/157.png", "goals": 1},
        "score": {"home": 1, "away": 1},
        "status": "live",
        "minute": 54,
        "competition": "UEFA Champions League",
        "venue": {"name": "Emirates Stadium", "city": "London"},
        "date": "2026-10-16T19:00:00+00:00",
    },
]

MOCK_UPCOMING_MATCHES = [
    {
        "id": 9103,
        "home_team": {"id": 40, "name": "Liverpool", "logo": "https://media.api-sports.io/football/teams/40.png", "goals": None},
        "away_team": {"id": 49, "name": "Chelsea", "logo": "https://media.api-sports.io/football/teams/49.png", "goals": None},
        "score": {"home": None, "away": None},
        "status": "upcoming",
        "minute": None,
        "competition": "Premier League",
        "venue": {"name": "Anfield", "city": "Liverpool"},
        "date": "2026-10-18T15:30:00+00:00",
    },
    {
        "id": 9104,
        "home_team": {"id": 529, "name": "Barcelona", "logo": "https://media.api-sports.io/football/teams/529.png", "goals": None},
        "away_team": {"id": 530, "name": "Atletico Madrid", "logo": "https://media.api-sports.io/football/teams/530.png", "goals": None},
        "score": {"home": None, "away": None},
        "status": "upcoming",
        "minute": None,
        "competition": "La Liga",
        "venue": {"name": "Camp Nou", "city": "Barcelona"},
        "date": "2026-10-18T19:00:00+00:00",
    },
    {
        "id": 9105,
        "home_team": {"id": 489, "name": "AC Milan", "logo": "https://media.api-sports.io/football/teams/489.png", "goals": None},
        "away_team": {"id": 505, "name": "Inter Milan", "logo": "https://media.api-sports.io/football/teams/505.png", "goals": None},
        "score": {"home": None, "away": None},
        "status": "upcoming",
        "minute": None,
        "competition": "Serie A",
        "venue": {"name": "San Siro", "city": "Milan"},
        "date": "2026-10-19T18:45:00+00:00",
    },
    {
        "id": 9106,
        "home_team": {"id": 165, "name": "Borussia Dortmund", "logo": "https://media.api-sports.io/football/teams/165.png", "goals": None},
        "away_team": {"id": 168, "name": "Bayer Leverkusen", "logo": "https://media.api-sports.io/football/teams/168.png", "goals": None},
        "score": {"home": None, "away": None},
        "status": "upcoming",
        "minute": None,
        "competition": "Bundesliga",
        "venue": {"name": "Signal Iduna Park", "city": "Dortmund"},
        "date": "2026-10-19T16:30:00+00:00",
    },
    {
        "id": 9107,
        "home_team": {"id": 85, "name": "Paris Saint-Germain", "logo": "https://media.api-sports.io/football/teams/85.png", "goals": None},
        "away_team": {"id": 81, "name": "Marseille", "logo": "https://media.api-sports.io/football/teams/81.png", "goals": None},
        "score": {"home": None, "away": None},
        "status": "upcoming",
        "minute": None,
        "competition": "Ligue 1",
        "venue": {"name": "Parc des Princes", "city": "Paris"},
        "date": "2026-10-20T19:45:00+00:00",
    },
]

MOCK_FINISHED_MATCHES = [
    {
        "id": 9108,
        "home_team": {"id": 50, "name": "Manchester City", "logo": "https://media.api-sports.io/football/teams/50.png", "goals": 3},
        "away_team": {"id": 33, "name": "Manchester United", "logo": "https://media.api-sports.io/football/teams/33.png", "goals": 1},
        "score": {"home": 3, "away": 1},
        "status": "finished",
        "minute": None,
        "competition": "Premier League",
        "venue": {"name": "Etihad Stadium", "city": "Manchester"},
        "date": "2026-10-12T15:30:00+00:00",
    },
    {
        "id": 9109,
        "home_team": {"id": 541, "name": "Real Madrid", "logo": "https://media.api-sports.io/football/teams/541.png", "goals": 2},
        "away_team": {"id": 529, "name": "Barcelona", "logo": "https://media.api-sports.io/football/teams/529.png", "goals": 1},
        "score": {"home": 2, "away": 1},
        "status": "finished",
        "minute": None,
        "competition": "La Liga",
        "venue": {"name": "Santiago Bernabéu", "city": "Madrid"},
        "date": "2026-10-10T19:00:00+00:00",
    },
    {
        "id": 9110,
        "home_team": {"id": 157, "name": "Bayern Munich", "logo": "https://media.api-sports.io/football/teams/157.png", "goals": 4},
        "away_team": {"id": 165, "name": "Borussia Dortmund", "logo": "https://media.api-sports.io/football/teams/165.png", "goals": 2},
        "score": {"home": 4, "away": 2},
        "status": "finished",
        "minute": None,
        "competition": "Bundesliga",
        "venue": {"name": "Allianz Arena", "city": "Munich"},
        "date": "2026-10-08T17:30:00+00:00",
    },
]

MOCK_STATS = {
    9101: {  # Real Madrid vs Man City
        "possession_home": 48.0, "possession_away": 52.0,
        "shots_home": 14, "shots_away": 12,
        "shots_on_target_home": 6, "shots_on_target_away": 4,
        "corners_home": 5, "corners_away": 6,
        "fouls_home": 11, "fouls_away": 9,
        "yellow_cards_home": 2, "yellow_cards_away": 1,
        "red_cards_home": 0, "red_cards_away": 0,
        "dangerous_attacks_home": 52, "dangerous_attacks_away": 58,
        "xg_home": 1.9, "xg_away": 1.4,
    },
    9102: {  # Arsenal vs Bayern
        "possession_home": 53.0, "possession_away": 47.0,
        "shots_home": 11, "shots_away": 10,
        "shots_on_target_home": 4, "shots_on_target_away": 4,
        "corners_home": 6, "corners_away": 4,
        "fouls_home": 8, "fouls_away": 10,
        "yellow_cards_home": 1, "yellow_cards_away": 2,
        "red_cards_home": 0, "red_cards_away": 0,
        "dangerous_attacks_home": 47, "dangerous_attacks_away": 42,
        "xg_home": 1.2, "xg_away": 1.1,
    },
}

MOCK_EVENTS = {
    9101: [  # Real Madrid 2-1 Man City (live 67')
        {"minute": 12, "type": "goal", "team": "Real Madrid", "player": "Vinícius Jr.", "detail": "Normal Goal"},
        {"minute": 33, "type": "yellow_card", "team": "Manchester City", "player": "Rodri", "detail": "Foul"},
        {"minute": 41, "type": "goal", "team": "Manchester City", "player": "Haaland", "detail": "Header"},
        {"minute": 58, "type": "goal", "team": "Real Madrid", "player": "Bellingham", "detail": "Normal Goal"},
        {"minute": 64, "type": "substitution", "team": "Manchester City", "player": "De Bruyne", "detail": "Substitution"},
    ],
}

MOCK_LINEUPS = {
    9101: {  # Real Madrid vs Manchester City
        "home": "4-3-1-2",
        "away": "4-2-3-1",
        "home_players": [
            {"id": 1,  "name": "Courtois",       "number": 1,  "position": "G", "x": 50, "y": 5},
            {"id": 2,  "name": "Carvajal",      "number": 2,  "position": "D", "x": 80, "y": 18},
            {"id": 3,  "name": "Rüdiger",       "number": 22, "position": "D", "x": 60, "y": 18},
            {"id": 4,  "name": "Militão",       "number": 3,  "position": "D", "x": 40, "y": 18},
            {"id": 5,  "name": "Mendy",         "number": 23, "position": "D", "x": 20, "y": 18},
            {"id": 6,  "name": "Valverde",      "number": 15, "position": "M", "x": 75, "y": 35},
            {"id": 7,  "name": "Tchouaméni",    "number": 14, "position": "M", "x": 50, "y": 32},
            {"id": 8,  "name": "Camavinga",     "number": 12, "position": "M", "x": 25, "y": 35},
            {"id": 9,  "name": "Bellingham",    "number": 5,  "position": "M", "x": 50, "y": 48},
            {"id": 10, "name": "Rodrygo",       "number": 11, "position": "F", "x": 35, "y": 62},
            {"id": 11, "name": "Vinícius Jr.",  "number": 7,  "position": "F", "x": 65, "y": 62},
        ],
        "away_players": [
            {"id": 21, "name": "Ederson",       "number": 31, "position": "G", "x": 50, "y": 95},
            {"id": 22, "name": "Walker",        "number": 2,  "position": "D", "x": 80, "y": 82},
            {"id": 23, "name": "Dias",          "number": 3,  "position": "D", "x": 60, "y": 82},
            {"id": 24, "name": "Akanji",        "number": 25, "position": "D", "x": 40, "y": 82},
            {"id": 25, "name": "Gvardiol",      "number": 24, "position": "D", "x": 20, "y": 82},
            {"id": 26, "name": "Rodri",         "number": 16, "position": "M", "x": 40, "y": 68},
            {"id": 27, "name": "Kovačić",       "number": 8,  "position": "M", "x": 60, "y": 68},
            {"id": 28, "name": "Bernardo",      "number": 20, "position": "M", "x": 80, "y": 52},
            {"id": 29, "name": "De Bruyne",     "number": 17, "position": "M", "x": 50, "y": 50},
            {"id": 30, "name": "Foden",         "number": 47, "position": "M", "x": 20, "y": 52},
            {"id": 31, "name": "Haaland",       "number": 9,  "position": "F", "x": 50, "y": 38},
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
        "competition": league.get("name") or "Global Football League",
        "venue": fmt_venue(fixture.get("venue", {})),
        "date": fixture.get("date", ""),
    }

# Top European Tournaments & Domestic Cups
TOP_LEAGUE_IDS = {
    2, 3, 848, 531,
    39, 45, 48,
    140, 143, 556,
    78, 81, 529,
    135, 137, 547,
    61, 66, 526,
    203, 205,
    144, 147,
    88, 90,
    94, 96,
    179,
}

MOCK_MATCHES = MOCK_LIVE_MATCHES + MOCK_UPCOMING_MATCHES + MOCK_FINISHED_MATCHES
MOCK_MATCH_MAP = {m["id"]: m for m in MOCK_MATCHES}

def is_top_flight(f: dict) -> bool:
    league = f.get("league", {})
    return league.get("id") in TOP_LEAGUE_IDS

# ---------------------------------------------------------------------------
# Live API fetch
# ---------------------------------------------------------------------------

async def fetch_fixtures(status: str):
    cache_key = f"fixtures_{status}_top_tier_v5"
    ttl = TTL_MATCHES_LIVE if status == "1H-2H-ET-P-LIVE" else TTL_MATCHES_UPCOMING if status == "NS" else TTL_MATCHES_FINISHED
    # 1. Fresh cache
    cached = get_cache(cache_key)
    if cached is not None:
        return cached, "cache"

    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    try:
        # 2. Upstream via wrapper
        if status == "1H-2H-ET-P-LIVE":
            r = await api_football_request("/fixtures", params={"live": "all"}, cache_key=cache_key)
            if not r:
                stale = get_stale_cache(cache_key)
                if stale is not None:
                    return stale, "stale"
                return [{**m, "data_source": "mock"} for m in MOCK_LIVE_MATCHES], "mock"
            all_live = r.get("response", [])
            fixtures = [f for f in all_live if is_top_flight(f)]
        elif status == "NS":
            day1_str = today_str
            day2_str = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")
            day3_str = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")
            
            now = datetime.utcnow()
            cutoff_48h = now + timedelta(hours=48)

            collected = []
            for d_str in [day1_str, day2_str, day3_str]:
                r = await api_football_request("/fixtures", params={"date": d_str, "status": "NS"}, cache_key=cache_key)
                if r:
                    day_res = r.get("response", [])
                    top_fixtures = [f for f in day_res if is_top_flight(f)]
                    collected.extend(top_fixtures)

            if not collected:
                r_next = await api_football_request("/fixtures", params={"next": 50}, cache_key=cache_key)
                next_resp = r_next.get("response", []) if r_next else []
                collected = [f for f in next_resp if is_top_flight(f)]

            valid_fixtures = []
            for f in collected:
                match_date_str = f.get("fixture", {}).get("date")
                if match_date_str:
                    try:
                        clean_str = match_date_str.replace("Z", "+00:00")
                        m_dt = datetime.fromisoformat(clean_str).replace(tzinfo=None)
                        if now - timedelta(hours=2) <= m_dt <= cutoff_48h:
                            valid_fixtures.append(f)
                    except Exception:
                        valid_fixtures.append(f)
                else:
                    valid_fixtures.append(f)

            valid_fixtures.sort(key=lambda x: x.get("fixture", {}).get("date", ""))
            fixtures = valid_fixtures
        else:
            one_week_ago = datetime.utcnow() - timedelta(days=7)
            now = datetime.utcnow()

            r_last = await api_football_request("/fixtures", params={"last": 70}, cache_key=cache_key)
            last_resp = r_last.get("response", []) if r_last else []
            top_last = [f for f in last_resp if is_top_flight(f)]

            valid_finished = []
            for f in top_last:
                match_date_str = f.get("fixture", {}).get("date")
                if match_date_str:
                    try:
                        clean_str = match_date_str.replace("Z", "+00:00")
                        m_dt = datetime.fromisoformat(clean_str).replace(tzinfo=None)
                        if one_week_ago <= m_dt <= now + timedelta(hours=2):
                            valid_finished.append(f)
                    except Exception:
                        valid_finished.append(f)
                else:
                    valid_finished.append(f)

            valid_finished.sort(key=lambda x: x.get("fixture", {}).get("date", ""), reverse=True)
            fixtures = valid_finished

        formatted = [{**fmt_match(f), "data_source": "live"} for f in fixtures][:25]
        if formatted is not None and len(formatted) > 0:
            set_cache(cache_key, formatted, ttl_seconds=ttl)
            return formatted, "live"
    except Exception as e:
        print(f"[matches] Error fetching fixtures: {e}")

    # 3. Stale cache
    stale = get_stale_cache(cache_key)
    if stale is not None:
        return [{**m, "data_source": "stale"} for m in stale], "stale"

    # 4. Mock fallback
    if status == "1H-2H-ET-P-LIVE":
        return [{**m, "data_source": "mock"} for m in MOCK_LIVE_MATCHES], "mock"
    elif status == "NS":
        return [{**m, "data_source": "mock"} for m in MOCK_UPCOMING_MATCHES], "mock"
    else:
        return [{**m, "data_source": "mock"} for m in MOCK_FINISHED_MATCHES], "mock"

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("")
@router.get("/")
async def get_matches():
    if is_mock_mode():
        all_matches = [{**m, "data_source": "mock"} for m in MOCK_MATCHES]
        return {"matches": all_matches, "count": len(all_matches), "data_source": "mock", "source": "mock"}
    live, ds = await fetch_fixtures("1H-2H-ET-P-LIVE")
    if live:
        return {"matches": live, "count": len(live), "data_source": ds, "source": ds}
    all_mock = [{**m, "data_source": "mock"} for m in MOCK_MATCHES]
    return {"matches": all_mock, "count": len(all_mock), "data_source": "mock", "source": "mock"}

@router.get("/live")
async def get_live_matches():
    if is_mock_mode():
        mock_list = [{**m, "data_source": "mock"} for m in MOCK_LIVE_MATCHES]
        return {"matches": mock_list, "count": len(mock_list), "data_source": "mock", "source": "mock"}
    matches, ds = await fetch_fixtures("1H-2H-ET-P-LIVE")
    if not matches:
        mock_list = [{**m, "data_source": "mock"} for m in MOCK_LIVE_MATCHES]
        return {"matches": mock_list, "count": len(mock_list), "data_source": "mock", "source": "mock"}
    return {"matches": matches, "count": len(matches), "data_source": ds, "source": ds}

@router.get("/upcoming")
async def get_upcoming_matches():
    if is_mock_mode():
        mock_list = [{**m, "data_source": "mock"} for m in MOCK_UPCOMING_MATCHES]
        return {"matches": mock_list, "count": len(mock_list), "data_source": "mock", "source": "mock"}
    matches, ds = await fetch_fixtures("NS")
    if not matches:
        mock_list = [{**m, "data_source": "mock"} for m in MOCK_UPCOMING_MATCHES]
        return {"matches": mock_list, "count": len(mock_list), "data_source": "mock", "source": "mock"}
    return {"matches": matches, "count": len(matches), "data_source": ds, "source": ds}

@router.get("/finished")
async def get_finished_matches():
    if is_mock_mode():
        mock_list = [{**m, "data_source": "mock"} for m in MOCK_FINISHED_MATCHES]
        return {"matches": mock_list, "count": len(mock_list), "data_source": "mock", "source": "mock"}
    matches, ds = await fetch_fixtures("FT-AET-PEN")
    if not matches:
        mock_list = [{**m, "data_source": "mock"} for m in MOCK_FINISHED_MATCHES]
        return {"matches": mock_list, "count": len(mock_list), "data_source": "mock", "source": "mock"}
    return {"matches": matches, "count": len(matches), "data_source": ds, "source": ds}

@router.get("/{match_id}")
async def get_match_detail(match_id: int):
    # Check fallback lists first if mock mode
    if is_mock_mode():
        if match_id in MOCK_MATCH_MAP:
            return {**MOCK_MATCH_MAP[match_id], "data_source": "mock"}
        raise HTTPException(status_code=404, detail=f"Match {match_id} not found")

    cache_key = f"match_detail_{match_id}"
    cached = get_cache(cache_key)
    if cached is not None:
        return {**cached, "data_source": "cache"}

    r = await api_football_request("/fixtures", params={"id": match_id}, cache_key=cache_key)
    if r:
        resp = r.get("response", [])
        if resp:
            detail = fmt_match(resp[0])
            ttl = TTL_MATCH_DETAIL_LIVE if detail["status"] == "live" else TTL_MATCH_DETAIL_FINISHED
            set_cache(cache_key, detail, ttl_seconds=ttl)
            return {**detail, "data_source": "live"}

    stale = get_stale_cache(cache_key)
    if stale is not None:
        return {**stale, "data_source": "stale"}

    # Check cached fixture lists before falling back
    for c_key in ["fixtures_1H-2H-ET-P-LIVE_top_tier_v5", "fixtures_NS_top_tier_v5", "fixtures_FT-AET-PEN_top_tier_v5"]:
        c_list = get_cache(c_key)
        if c_list and isinstance(c_list, list):
            for m in c_list:
                if m.get("id") == match_id:
                    set_cache(cache_key, m, ttl_seconds=300)
                    return {**m, "data_source": "cache"}

    # Fallback to local mock matches ONLY if match_id is a mock id!
    if match_id in MOCK_MATCH_MAP:
        return {**MOCK_MATCH_MAP[match_id], "data_source": "mock"}

    raise HTTPException(status_code=404, detail=f"Match {match_id} not found")

@router.get("/{match_id}/stats")
async def get_match_stats(match_id: int):
    if is_mock_mode():
        return {**MOCK_STATS.get(match_id, _default_mock_stats()), "data_source": "mock"}
    
    cache_key = f"match_stats_{match_id}"
    cached = get_cache(cache_key)
    if cached is not None:
        return {**cached, "data_source": "cache"}

    r = await api_football_request("/fixtures/statistics", params={"fixture": match_id}, cache_key=cache_key)
    if r:
        response = r.get("response", [])
        if len(response) >= 2:
            home_stats = {s["type"]: s["value"] for s in response[0].get("statistics", [])}
            away_stats = {s["type"]: s["value"] for s in response[1].get("statistics", [])}
            def parse_pct(v):
                if v is None: return 50.0
                if isinstance(v, str): return float(v.replace("%", ""))
                return float(v)
            def parse_int(v):
                if v is None: return 0
                try: return int(v)
                except Exception: return 0
            def parse_float(v):
                if v is None: return None
                try: return float(v)
                except Exception: return None
            result = {
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
                "xg_home": parse_float(home_stats.get("expected_goals")),
                "xg_away": parse_float(away_stats.get("expected_goals")),
            }
            set_cache(cache_key, result, ttl_seconds=TTL_MATCH_STATS)
            return {**result, "data_source": "live"}

    stale = get_stale_cache(cache_key)
    if stale is not None:
        return {**stale, "data_source": "stale"}
    return {**MOCK_STATS.get(match_id, _default_mock_stats()), "data_source": "mock"}

@router.get("/{match_id}/events")
async def get_match_events(match_id: int):
    if is_mock_mode():
        return {"events": MOCK_EVENTS.get(match_id, []), "data_source": "mock"}

    cache_key = f"match_events_{match_id}"
    cached = get_cache(cache_key)
    if cached is not None:
        return {**cached, "data_source": "cache"}

    r = await api_football_request("/fixtures/events", params={"fixture": match_id}, cache_key=cache_key)
    if r:
        events = []
        for ev in r.get("response", []):
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
        result = {"events": events}
        set_cache(cache_key, result, ttl_seconds=TTL_MATCH_EVENTS)
        return {**result, "data_source": "live"}

    stale = get_stale_cache(cache_key)
    if stale is not None:
        return {**stale, "data_source": "stale"}
    return {"events": MOCK_EVENTS.get(match_id, []), "data_source": "mock"}

@router.get("/{match_id}/lineups")
async def get_match_lineups(match_id: int):
    if is_mock_mode():
        return {**MOCK_LINEUPS.get(match_id, _default_mock_lineups(match_id)), "data_source": "mock"}

    cache_key = f"match_lineups_{match_id}"
    cached = get_cache(cache_key)
    if cached is not None:
        return {**cached, "data_source": "cache"}

    r = await api_football_request("/fixtures/lineups", params={"fixture": match_id}, cache_key=cache_key)
    if r:
        response = r.get("response", [])
        if response:
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
            result = {"home": home_formation, "away": away_formation, "home_players": home_players, "away_players": away_players}
            set_cache(cache_key, result, ttl_seconds=TTL_MATCH_LINEUPS)
            return {**result, "data_source": "live"}

    stale = get_stale_cache(cache_key)
    if stale is not None:
        return {**stale, "data_source": "stale"}
    return {**MOCK_LINEUPS.get(match_id, _default_mock_lineups(match_id)), "data_source": "mock"}

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