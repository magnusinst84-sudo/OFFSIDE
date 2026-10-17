# OFFSIDE — AI Agent Guidelines & Architecture Rules

## System Overview
**OFFSIDE** is an AI-augmented football intelligence, live war room, and match simulation platform.
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, Lucide icons, Recharts, SWR.
- **Backend**: FastAPI (Python 3.11+), XGBoost ML engine, Google Gemini 2.5 Flash API for multi-personality commentary, API-Football for real-time fixtures/stats, and an embedded SQLite database cache.

---

## Agent Operational Rules & Conventions

### 1. Data Integrity & Live vs Mock Strategy
- **Never hardcode static mock data directly inside UI components.**
- The backend features a tiered architecture:
  1. **SQLite Database Cache** (`cache_db.py`): Checks local DB first with TTL per fixture type (45s live, 10m upcoming/finished, 30s stats, 15m lineups, 24h players).
  2. **Live Third-Party API** (`API-Football`): When cache misses or expires and `MOCK_MODE=false`.
  3. **Graceful Fallback**: If the external API fails or hits its quota, the backend falls back to deterministic mock fixtures/stats without throwing 500 errors to the client.
- When adding or modifying match data endpoints, maintain the fallback contract so the UI never breaks.

### 2. Frontend Development Standards
- **App Router Conventions**: All pages live in `frontend/app/`. All client-interactive pages must declare `'use client'` at the top.
- **Direct Navigation Support**: Dynamic routes like `/match/[id]` and `/player/[id]` must be resilient to hard browser refreshes and direct links (never assume `AppContext` state is pre-populated from previous navigation).
- **Styling**: Adhere to the established cyberpunk/analytics dark aesthetic:
  - Background base: `#050508`
  - Cards: `#0F1117` / `#1A1D27`
  - Momentum Green: `#00FF87`
  - Pressure Red: `#E8003D`
  - Cyan / Electric Blue: `#3B82F6`
  - Typography: Space Grotesk / Inter / JetBrains Mono

### 3. Backend & AI Guidelines
- **Gemini AI**: Use direct async REST requests with models `gemini-3-flash-live` / `gemini-3.8-live` (with `gemini-3-flash` & `gemini-3.8-flash` fallback) via `httpx`. Avoid deprecated packages with broken dependencies.
- **Personalities**: Commentary engine supports 4 distinct voices: `broadcast`, `tactical`, `coach`, and `fan`. Prompts must enforce 2–3 concise sentences to fit live UI feeds.
- **ML Predictions**:
  - The model is an **XGBoost Classifier** (`model.pkl`) trained on 32k+ international matches with an Elo rating differential baseline.
  - Momentum formula: `0.4*(shots_on_target_delta) + 0.3*(possession_delta) + 0.3*(xg_delta)`.

### 4. Git & Repository Hygiene
- Never commit `.env` files with secret keys.
- Do not create temporary shell pipeline files in the workspace root.
- Always run `npm run build` in `frontend/` after making changes to verify TypeScript and App Router static export integrity.
