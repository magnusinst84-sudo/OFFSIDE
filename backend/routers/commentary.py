from fastapi import APIRouter
from pydantic import BaseModel
import os, httpx
from typing import Optional

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

async def call_gemini(prompt: str) -> Optional[str]:
    if not GEMINI_API_KEY:
        return None
    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 300}
    }
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            r = await client.post(url, json=payload)
            if r.status_code == 200:
                data = r.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "").strip()
            print(f"[commentary] Gemini HTTP {r.status_code}: {r.text[:200]}")
    except Exception as e:
        print(f"[commentary] Gemini call exception: {e}")
    return None

PERSONALITY_PROMPTS = {
    "broadcast": (
        "You are an elite live football broadcast commentator — dramatic, articulate, and punchy. "
        "Deliver in present tense with vivid analogies. Keep to 2-3 high-impact sentences."
    ),
    "tactical": (
        "You are an advanced football tactical analyst. Evaluate shapes, pressing structures, passing lanes, and xG efficiency. "
        "Be clinical, data-aware, and concise (2-3 sentences)."
    ),
    "coach": (
        "You are an experienced technical director and top-flight manager. Offer direct instructions, team talk energy, "
        "and tactical adjustments. Keep to 2-3 sentences."
    ),
    "fan": (
        "You are an authentic, expressive football fanatic. React with passion, club banter, and relatable fan emotion. "
        "2-3 punchy sentences."
    ),
}

class CommentaryRequest(BaseModel):
    match_id: int
    event_type: str  # goal, yellow_card, tactical, substitution, var
    match_state: dict
    personality: str = "tactical"
    event_detail: Optional[str] = None

class AskRequest(BaseModel):
    question: str
    match_context: Optional[dict] = None
    personality: str = "tactical"
    conversation_history: Optional[list] = None

def build_commentary_prompt(req: CommentaryRequest) -> str:
    system = PERSONALITY_PROMPTS.get(req.personality, PERSONALITY_PROMPTS["tactical"])
    context_parts = []
    ms = req.match_state
    
    if "stats" in ms and ms["stats"]:
        s = ms["stats"]
        context_parts.append(
            f"Stats: Possession {s.get('possession_home', 50)}% vs {s.get('possession_away', 50)}%, "
            f"Shots {s.get('shots_home', 0)}-{s.get('shots_away', 0)}, "
            f"xG {s.get('xg_home', '?')}-{s.get('xg_away', '?')}"
        )
    if "prediction" in ms and ms["prediction"]:
        p = ms["prediction"]
        context_parts.append(
            f"Win probability: Home {round(p.get('home_win_prob', 0)*100)}% | "
            f"Draw {round(p.get('draw_prob', 0)*100)}% | "
            f"Away {round(p.get('away_win_prob', 0)*100)}%"
        )
    if "home" in ms and "away" in ms:
        context_parts.append(f"Match: {ms['home']} vs {ms['away']}")

    event_desc = req.event_detail or req.event_type.replace("_", " ").title()
    context = ". ".join(context_parts)
    prompt = f"{system}\n\nEvent: {event_desc}\n{context}\n\nProvide your {req.personality} analysis:"
    return prompt

@router.post("/generate")
async def generate_commentary(req: CommentaryRequest):
    prompt = build_commentary_prompt(req)
    text = await call_gemini(prompt)
    if not text:
        return _fallback_commentary(req)
    return {
        "text": text,
        "personality": req.personality,
        "event_type": req.event_type,
        "match_id": req.match_id,
    }

def _fallback_commentary(req: CommentaryRequest) -> dict:
    fallbacks = {
        "tactical": "The tactical block is shifting rapidly. Both managers are testing passing networks through the half-spaces.",
        "broadcast": "What intensity out there! High tempo, passionate duels, every loose ball contested with conviction.",
        "coach": "Keep your defensive shape, maintain discipline, and transition rapidly when the pressing trigger is activated.",
        "fan": "WHAT A GAME! You can't look away for a single second! Football at its absolute finest! 🔥",
    }
    return {
        "text": fallbacks.get(req.personality, fallbacks["tactical"]),
        "personality": req.personality,
        "event_type": req.event_type,
        "match_id": req.match_id,
    }

@router.post("/ask")
async def ask_analyst(req: AskRequest):
    system = PERSONALITY_PROMPTS.get(req.personality, PERSONALITY_PROMPTS["tactical"])
    context_parts = [system]
    
    if req.match_context:
        mc = req.match_context
        context_parts.append(
            f"\nCurrent match context: {mc.get('home', 'Home')} vs {mc.get('away', 'Away')}, "
            f"Score: {mc.get('score', {})}, Minute: {mc.get('minute', '?')}"
        )
    
    history_text = ""
    if req.conversation_history:
        for msg in req.conversation_history[-6:]:
            role = "User" if msg.get("role") == "user" else "Analyst"
            history_text += f"\n{role}: {msg.get('content', '')}"
    
    full_prompt = "\n".join(context_parts)
    if history_text:
        full_prompt += f"\n\nConversation history:{history_text}"
    full_prompt += f"\n\nUser Question: {req.question}\nAnalyst Response:"
    
    answer = await call_gemini(full_prompt)
    if not answer:
        return _fallback_ask(req)
    return {
        "answer": answer,
        "personality": req.personality,
    }

def _fallback_ask(req: AskRequest) -> dict:
    return {
        "answer": "Analyzing the tactical phase and player positioning. The structure suggests aggressive counter-pressing in transition.",
        "personality": req.personality,
    }
