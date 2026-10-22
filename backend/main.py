from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import predict, commentary, matches
from routers import players, insights
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="OFFSIDE API", version="2.0.0", description="Football Intelligence & Live Match Analytics Platform")

cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if os.getenv("FRONTEND_URL"):
    cors_origins.extend([url.strip() for url in os.getenv("FRONTEND_URL").split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if os.getenv("ENVIRONMENT") == "production" and not os.getenv("ALLOW_ALL_CORS") else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matches.router,    prefix="/api/matches",    tags=["Matches"])
app.include_router(predict.router,    prefix="/api/predict",    tags=["Predictions"])
app.include_router(commentary.router, prefix="/api/commentary", tags=["Commentary"])
app.include_router(players.router,    prefix="/api/players",    tags=["Players"])
app.include_router(insights.router,   prefix="/api/insights",   tags=["Insights"])

@app.on_event("startup")
def on_startup():
    from cache_db import clear_cache
    clear_cache()
    print("[startup] Cleared API cache to ensure fresh top-tier matches.")

@app.get("/")
def root():
    return {"status": "OFFSIDE API running", "version": "2.0.0"}

@app.get("/health")
def health():
    return {
        "status": "online",
        "tactical_engine": "ready",
        "ml_model": "loaded",
        "commentary_engine": "ready",
        "player_tracking": "ready",
        "version": "2.0.0",
    }

@app.get("/health/quota")
@app.get("/api/health/quota")
def health_quota():
    from cache_db import get_daily_api_calls, get_circuit_breaker_status
    from api_football import get_daily_cap
    calls_today = get_daily_api_calls()
    cap = get_daily_cap()
    is_active, cooldown_until, reason = get_circuit_breaker_status()
    return {
        "calls_today": calls_today,
        "cap": cap,
        "breaker": {
            "is_active": is_active,
            "cooldown_until": cooldown_until,
            "reason": reason or "",
        }
    }

@app.post("/api/ask")
async def ask_analyst_root(request: dict):
    from routers.commentary import ask_analyst, AskRequest
    req = AskRequest(**request)
    return await ask_analyst(req)