# OFFSIDE — AI Football War Room

An AI-powered football analytics dashboard and tactical war room built for World Cup 2026.

## Problem Statement

Traditional football statistics provide flat numbers (possession, shots) that fail to capture the live flow, momentum, and tactical nuances of a match. OFFSIDE bridges this gap by combining live momentum tracking, predictive ML models, and a generative AI analyst to provide fans and coaches with dynamic, deep-tactical insights during a game.

## Key Features

- **Win Probability & Momentum Engine:** Live win probabilities updated based on match events (goals, shots, xG) backed by an XGBoost model, alongside an original 0-100 Momentum Score tracking match dominance.
- **AI Tactical Analyst:** A chat interface powered by Gemini 2.0 Flash that analyzes match context and history. Choose from 4 working personalities: Tactical Analyst, Broadcast Commentator, Former Coach, and Unhinged Fan.
- **Player Intelligence:** Browse a static dataset of 111 top international players across 22 nations. View individual "DNA profiles" featuring radar charts, shot maps, and form trends.
- **Live Match Dashboard:** View live or scheduled matches, complete with scorelines, play-by-play tactical breakdowns, and momentum charts (supports both API-Football data and offline mock data).
- **Customizable UI:** A fully implemented settings panel allowing you to toggle themes (War Room Dark / High Contrast), animations, and data refresh rates.

## Tech Stack

**Frontend:**
- Next.js 16.2.9 (App Router)
- React 19.2
- Tailwind CSS v4
- Framer Motion (Animations)
- Recharts (Data visualization)
- Lucide React (Icons)

**Backend:**
- FastAPI (Python)
- XGBoost & scikit-learn (Machine Learning)
- Pandas & NumPy (Data processing)
- `google-generativeai` (Gemini API integration)

## Model Performance

Based on the trained XGBoost model (`backend/ml/train.py`):
- **Accuracy:** 57.6%
- **Training matches:** 32,359 international matches (1990–2026)
- **Teams indexed (Elo):** 336
- **Top feature:** Elo rating differential (44% importance)
- **Baseline (always predict home win):** 48%

## Architecture

```text
backend/
├── main.py              FastAPI entrypoint (Configures CORS and routing)
├── routers/
│   ├── predict.py       Calculates live win probability and momentum scores
│   ├── matches.py       Fetches matches from API-Football or local mock data
│   ├── commentary.py    Handles Gemini AI analyst prompting and fallbacks
│   ├── players.py       Serves static player data
│   └── insights.py      Generates data insights
└── ml/
    ├── train.py         Model training script (generates model.pkl)
    ├── model.pkl        Trained XGBoost model
    └── elo_ratings.csv  Historical Elo ratings for 336 teams

frontend/
├── app/
│   ├── page.tsx         Main war room dashboard
│   ├── ai/              AI Tactical Center chat interface
│   ├── matches/         Match listings
│   ├── match/[id]/      Individual match momentum and stats view
│   ├── players/         Player database grid
│   ├── player/[id]/     Individual player DNA and shot map profiles
│   ├── insights/        Insights overview page
│   └── settings/        Customizable theme and app settings
├── components/          Reusable UI components (e.g., DNACard, SettingsPanel)
└── lib/data/            Static datasets (contains 111 players across 22 teams)
```

## Setup Instructions

### Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   GEMINI_API_KEY=
   API_FOOTBALL_KEY=
   MOCK_MODE=
   ```
4. Start the FastAPI server:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```
   *The backend will run at `http://localhost:8000`.*

### Frontend
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:3000`.*

## Known Limitations

- **Commentary Fallback:** If the Gemini API key is missing, rate-limited (e.g., free tier exhausted), or the SDK throws an error, the AI Tactical Center will return a hardcoded static string: *"The tactical engine is processing your query. Our AI analyst is analyzing the match dynamics — please try again in a moment."*
- **Match Data:** If `MOCK_MODE=true` is set in the backend `.env` (or if API-Football rate limits are hit), the app falls back to serving static JSON files (`test_date.json`, `test_finished.json`) instead of live real-world match data.
- **Draw Predictions:** Draw prediction accuracy (recall) is exceptionally low (~2%). This reflects a known open problem in football analytics rather than a specific model defect. The model prioritizes win/loss accuracy.
- **Player Database:** The player database is static and hardcoded in the frontend (`lib/data/players-batch*.ts`). It currently contains exactly 111 players and does not fetch live player stats from an external database.
