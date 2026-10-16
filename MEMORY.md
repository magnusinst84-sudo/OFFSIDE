# OFFSIDE — Project Memory & Technical Log

This document records key decisions, resolved bugs, known limitations, and the evolution of the OFFSIDE platform.

---

## Technical History & Problem Log

### 1. Gemini AI Integration Failure & Resolution
- **Symptom**: Commentary generation and `/api/commentary/ask` failed silently and fell back to pre-written canned responses.
- **Root Cause**:
  1. Deprecated `google.generativeai` SDK encountered an `AttributeError` with `pyparsing/httplib2` in the local Python environment.
  2. The Google Generative Language API v1beta removed `gemini-2.0-flash` from availability for this project, causing 404 / quota failure.
- **Resolution**: Migrated `backend/routers/commentary.py` to direct asynchronous HTTP requests (`httpx`) targeting `gemini-2.5-flash` (`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`). Dynamic AI responses across all 4 analyst personalities are now functional and verified live.

### 2. Live Match Scope & API-Football Transition
- **Symptom**: Platform was initially hardcoded to simulated World Cup 2026 fixtures only, ignoring club competitions.
- **Resolution**:
  - Expanded `backend/routers/matches.py` to query live in-play games globally (`live=all`), scheduled upcoming fixtures (`NS` / `next=20`), and completed club matches (`FT` / `last=20`).
  - Added real `expected_goals` (xG) parsing from API fixture statistics.
  - Updated frontend headers and titles in `MatchHeader.tsx` and `app/matches/page.tsx` from "World Cup 2026" to global league and match intelligence.

### 3. API Quota Conservation & SQLite Caching
- **Problem**: API-Football free tier provides 100 requests/day. Frequent polling from frontend SWR hooks would deplete the quota in minutes.
- **Resolution**: Built `backend/cache_db.py` using SQLite (`offside_cache.db`).
  - Implemented automatic caching with TTLs: 45s for live games, 10m for upcoming/finished, 30s for match stats/events, 15m for lineups, 24h for player searches.
  - Multi-user requests now hit local cache, returning in under 5ms without burning external API calls.

### 4. War Room Direct Navigation Resilience
- **Symptom**: Opening `/match/[id]` directly in a browser or hard-refreshing left `currentMatch` in `AppContext` as `null`, causing an incomplete UI state.
- **Resolution**: Added a fallback lookup in `frontend/app/match/[id]/page.tsx` that searches active matches via `useMatches` and automatically populates `currentMatch`.

### 5. Frontend Build Verification
- **Status**: Tested and verified clean. `npm run build` succeeds with zero errors (Turbopack, TypeScript 5, Next.js 16.2.9 App Router).

---

## Active Environment & Configuration
- **API Keys**: Stored in `backend/.env` (excluded from git tracking).
  - `GEMINI_API_KEY`: Google Gemini API key.
  - `API_FOOTBALL_KEY`: API-Football v3 key (active, tested, working).
  - `MOCK_MODE`: Flag to control fallback behavior (`false` for live data with cache; `true` for local mock fixtures).
