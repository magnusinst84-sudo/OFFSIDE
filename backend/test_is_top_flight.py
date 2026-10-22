import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from routers.matches import is_top_flight

def run_tests():
    print("=================================================================")
    print("TEST SUITE: is_top_flight() ALLOWLIST-FIRST & EXCLUSIONS")
    print("=================================================================")

    # 1. Tests for excluded competitions (non-allowlisted IDs)
    excluded_fixtures = [
        ("TFF 3. Lig", {"league": {"id": 9991, "name": "TFF 3. Lig", "country": "Turkey"}, "teams": {"home": {"name": "Team A"}, "away": {"name": "Team B"}}}),
        ("Liga 3", {"league": {"id": 9992, "name": "Liga 3", "country": "Portugal"}, "teams": {"home": {"name": "Team C"}, "away": {"name": "Team D"}}}),
        ("League Two", {"league": {"id": 9993, "name": "League Two", "country": "England"}, "teams": {"home": {"name": "Team E"}, "away": {"name": "Team F"}}}),
        ("Women's fixture", {"league": {"id": 9994, "name": "Women's Super League", "country": "England"}, "teams": {"home": {"name": "Chelsea Women"}, "away": {"name": "Arsenal (W)"}}}),
    ]

    print("\n--- Testing Excluded Competitions (non-allowlisted) ---")
    for name, fix in excluded_fixtures:
        result = is_top_flight(fix)
        print(f"Fixture: '{name}' (league_id={fix['league']['id']}) -> is_top_flight = {result}")
        assert result is False, f"Expected {name} to be excluded, but got True!"
    print("✓ All lower tiers and women's fixtures are correctly EXCLUDED.")

    # 2. Tests for allowlisted IDs (2, 3, 848, 203, 94, 179) even with 'isl' or 'caf' in team name
    allowlisted_fixtures = [
        ("ID 2 (UEFA Champions League) with 'isl' & 'caf'", 2, "Real Madrid isl", "Bayern Munich caf"),
        ("ID 3 (UEFA Europa League) with 'isl'", 3, "Roma isl", "Porto"),
        ("ID 848 (UEFA Conference League) with 'caf'", 848, "Chelsea caf", "Gent"),
        ("ID 203 (Turkish Süper Lig) with 'isl'", 203, "Galatasaray isl", "Fenerbahce"),
        ("ID 94 (Portuguese Primeira Liga) with 'caf'", 94, "Benfica caf", "Sporting CP"),
        ("ID 179 (Scottish Premiership) with 'isl' & 'caf'", 179, "Celtic isl", "Rangers caf"),
    ]

    print("\n--- Testing Allowlisted Competitions (IDs 2, 3, 848, 203, 94, 179) with 'isl'/'caf' ---")
    for desc, lid, home, away in allowlisted_fixtures:
        fix = {
            "league": {"id": lid, "name": f"League {lid}", "country": "Europe"},
            "teams": {"home": {"name": home}, "away": {"name": away}}
        }
        result = is_top_flight(fix)
        print(f"Fixture: {desc} -> is_top_flight = {result}")
        assert result is True, f"Expected allowlisted ID {lid} to be included, but got False!"
    print("✓ All allowlisted IDs (2, 3, 848, 203, 94, 179) are correctly INCLUDED despite 'isl'/'caf' substrings.")

    print("\n=================================================================")
    print("ALL is_top_flight() TESTS PASSED SUCCESSFULLY!")
    print("=================================================================")

if __name__ == "__main__":
    run_tests()
