# OFFSIDE — AI Football Intelligence & Live Tactical War Room

**OFFSIDE** is an elite, AI-augmented football intelligence, live war room, and predictive analytics platform engineered for modern football. It combines real-time match momentum tracking, an Elo-backed XGBoost predictive machine learning engine, multi-personality AI tactical commentary via Google Gemini 2.5 Flash, and holographic player DNA scouting profiles.

---

## System Architecture

```text
OFFSIDE Platform
├── Frontend (Next.js 16 + React 19 + Tailwind CSS v4)
│   ├── app/
│   │   ├── page.tsx               Interactive boot terminal & intelligence landing
│   │   ├── matches/               Premier European competition explorer (Live / Upcoming / Finished)
│   │   ├── match/[id]/            Real-time War Room (Momentum Ring, Pitch layout, AI stream)
│   │   ├── players/               Scouting database with position filters & DNA cards
│   │   ├── player/[id]/           Player intelligence deep-dive with hexagonal radar & shot maps
│   │   ├── ai/                    AI Tactical Command Center with 4 analyst personas
│   │   ├── insights/              Predictive accuracy, ML telemetry & discovery logs
│   │   └── settings/              Customization console (accent colors, commentary velocity)
│   ├── context/
│   │   ├── AuthContext.tsx        Firebase Authentication & disposable email anti-spam layer
│   │   └── AppContext.tsx         Global match telemetry & UI state
│   └── components/                Cyberpunk dark aesthetic design system & visualizers
│
└── Backend (FastAPI + Python 3.11+)
    ├── routers/
    │   ├── predict.py             XGBoost win-probability & momentum calculation
    │   ├── commentary.py          Gemini 2.5 Flash with prompt injection guardrails & fallback
    │   ├── matches.py             Tiered match telemetry (Cache -> API-Football -> Fallback)
    │   ├── players.py             Player attributes, archetype matching & DNA vectors
    │   └── insights.py            Historical model telemetry & feature importance
    ├── ml/
    │   ├── train.py               XGBoost classifier training on 32k+ international matches
    │   ├── model.pkl              Trained XGBoost estimator
    │   └── elo_ratings.csv        Historical Elo ratings for 336 teams
    └── cache_db.py                Embedded SQLite database cache with TTL invalidation
```

---

## Core Capabilities

### 1. Live Match War Room (`/match/[id]`)
- **Dynamic Momentum Ring**: Real-time momentum scoring calculated from:
  $$\text{Momentum} = 0.4 \times \Delta(\text{Shots on Target}) + 0.3 \times \Delta(\text{Possession}) + 0.3 \times \Delta(\text{xG})$$
- **Tactical Pitch Visualization**: Clamped coordinate pitch node system with real-time substitution tracking, event pins, and team formations.
- **Adaptive Multi-Screen Layout**: Triple-column command cockpit on desktop; transitions to a unified tab switcher (`PITCH` / `STATS` / `AI`) on mobile viewports.

### 2. Machine Learning Predictive Engine (`/matches`, `/insights`)
- **XGBoost Classifier**: 500 decision trees trained across 32,359 historical matches (1990–2026).
- **57.6% Prediction Accuracy**: Comfortably exceeds the 48% baseline home-win rate.
- **Feature Dominance**: Incorporates rolling goal differentials, form indices, and a 44% importance Elo rating differential baseline.

### 3. AI Tactical Command (`/ai`)
- **Google Gemini 2.5 Flash Integration**: Low-latency commentary streaming with direct async REST calls.
- **4 Distinct Analyst Personalities**:
  - `Broadcast`: Punchy, dramatic play-by-play commentary.
  - `Tactical`: Analytical breakdown of half-space occupation, pressing schemes, and passing networks.
  - `Coach`: Pragmatic tactical instructions and motivational team talk.
  - `Fan`: Expressive, passionate match reaction and club banter.
- **Security & Prompt Injection Defenses**: Sanitized input filtering, context length constraints, and strict domain boundaries preventing prompt hijacking.

### 4. Player Intelligence & DNA Fingerprints (`/players`, `/player/[id]`)
- Hexagonal attribute radar mapping: Pace, Shooting, Passing, Dribbling, Defending, and Physicality.
- Interactive 3D tilt DNA card with holographic lighting shaders.
- Filtered roster focusing exclusively on premier European competitions and elite international squads.

### 5. Operator Clearance & Anti-Spam Security
- **Firebase Authentication**: One-click Google OAuth authentication alongside email/password credentials.
- **Anti-Spam Disposable Domain Blocker**: Client and server validation blocking 35+ popular throwaway email services (`tempmail`, `10minutemail`, `mailinator`, `guerrillamail`, etc.).
- **Email Verification**: Automatic verification dispatch preventing bot sign-up spam.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router + Turbopack), React 19, TypeScript, Tailwind CSS v4 |
| **Visuals & Motion** | Framer Motion, Recharts, Lucide React, Glassmorphism design tokens |
| **Authentication** | Firebase Auth (Google OAuth, Email Verification, Anti-Spam Blacklist) |
| **Backend API** | FastAPI, Uvicorn, Pydantic, HTTPX, SQLite Cache |
| **Machine Learning** | XGBoost, Scikit-Learn, Pandas, NumPy |
| **Generative AI** | Google Gemini 2.5 Flash (`gemini-2.5-flash` REST endpoint) |
| **External Sports API** | API-Football (v3 fixtures, lineups, statistics) |

---

## Getting Started

### Prerequisites
- Node.js 18+ and `npm`
- Python 3.11+ and `pip`
- Git

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   API_FOOTBALL_KEY=your_api_football_key
   MOCK_MODE=false
   ENVIRONMENT=development
   ```

4. **Launch the FastAPI API server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will be live at `http://localhost:8000` (API docs at `http://localhost:8000/docs`).*

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the `frontend/` directory (see `env.example`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000

   # Firebase Authentication Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the Next.js development server**:
   ```bash
   npm run dev
   ```
   *Access the web application at `http://localhost:3000`.*

---

## Production Deployment

### Frontend (Vercel)
1. Import repository to Vercel and set root directory to `frontend`.
2. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your hosted backend URL.
   - `NEXT_PUBLIC_FIREBASE_*`: Your production Firebase credentials.
3. Deploy directly via `npm run build`.

### Backend (Render / Railway / VPS / Docker)
1. Install dependencies via `pip install -r requirements.txt`.
2. Run using production ASGI server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   ```
3. Set environment variables `API_FOOTBALL_KEY`, `GEMINI_API_KEY`, and `MOCK_MODE=false`.
