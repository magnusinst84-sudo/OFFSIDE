# OFFSIDE — Skills & Capabilities Reference

This document catalogs the domain workflows, capabilities, and procedures for maintaining and extending the OFFSIDE platform.

---

## 1. Match Ingestion & Cache Management
- **Workflow**: Interfacing with API-Football and caching responses.
- **Endpoints Handled**:
  - `GET /api/matches/live`: In-play fixtures across world leagues (TTL: 45s).
  - `GET /api/matches/upcoming`: Scheduled fixtures (TTL: 10m).
  - `GET /api/matches/finished`: Completed match fixtures and scores (TTL: 10m).
  - `GET /api/matches/{id}/stats`: Possession, shots on target, xG, cards, fouls (TTL: 30s).
  - `GET /api/matches/{id}/events`: Match event timeline (goals, cards, VAR, substitutions) (TTL: 30s).
  - `GET /api/matches/{id}/lineups`: Tactical formations and starting XI positions (TTL: 15m).
- **Execution Script**:
  ```python
  from backend.cache_db import get_cache, set_cache
  # Query or invalidate cache keys:
  # 'fixtures_1H-2H-ET-P-LIVE', 'fixtures_NS', 'fixtures_FT-AET-PEN', 'match_stats_{id}'
  ```

---

## 2. Real-Time AI Commentary & Tactical Q&A
- **Model**: `gemini-3-flash-live` & `gemini-3.8-live` (with `gemini-3-flash` & `gemini-3.8-flash` fallback) via Google Generative Language API v1beta.
- **Workflow**:
  - `POST /api/commentary/generate`: Formats match context (possession delta, xG, live win probability, recent event) into a prompt and outputs in-character commentary.
  - `POST /api/commentary/ask`: Interactive analyst chat with full match context awareness and sliding conversation history (last 6 messages).
- **Personalities**:
  - **Broadcast**: Dramatic, eloquent, present tense, monumental metaphors.
  - **Tactical**: Analytical, half-space passing networks, pressing triggers, xG efficiency.
  - **Coach**: Halftime team talk, direct, motivational, tactical shape discipline.
  - **Fan**: High-energy, emotional, exclamation-heavy, authentic football banter.

---

## 3. ML Win-Probability & Momentum Engine
- **Engine**: XGBoost Classifier (`backend/ml/model.pkl`).
- **Input Features**:
  - `home_advantage`: 1 if home venue, 0 if neutral
  - `home_elo`, `away_elo`, `elo_diff`: Elo ratings from `backend/ml/elo_ratings.csv` (336 teams)
  - `home_form`, `away_form`, `form_diff`: Recent performance metrics
  - `home_gs`, `home_gc`, `away_gs`, `away_gc`: Goals scored / conceded per match
  - `is_wc`: Competition factor
- **In-Game Momentum Calculation**:
  $$\text{Momentum} = 50 + 5 \times \left(0.4 \times \Delta\text{SoT} + 0.3 \times \frac{\text{Possession}-50}{50} \times 10 + 0.3 \times \Delta\text{xG} \times 5\right)$$
  (Clamped between 5 and 95).

---

## 4. Player Intelligence & Scouting Radar
- **Endpoints**:
  - `GET /api/players/search?q={query}`: Searches verified database, falls back to API-Football `/players`.
  - `GET /api/players/{id}`: Detailed player profile, physical attributes, attacking metrics.
  - `POST /api/players/{id}/dna`: 6-axis radar (Pace, Dribbling, Passing, Shooting, Defending, Physicality) + role suitability percentages.

---

## 5. Frontend Build & Route Verification
- **Verification Command**:
  ```bash
  cd frontend
  npm run build
  ```
  Must verify that all 9 routes pass clean compilation:
  - `/` (Landing & Command)
  - `/matches` (Match Explorer)
  - `/match/[id]` (Live War Room)
  - `/players` (Player Roster)
  - `/player/[id]` (Player Intelligence & DNA)
  - `/ai` (AI Tactical Center)
  - `/insights` (Model Discovery & Accuracy)
  - `/settings` (Preferences)
  - `/_not-found`
