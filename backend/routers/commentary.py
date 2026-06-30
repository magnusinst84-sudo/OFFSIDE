from fastapi import APIRouter
from pydantic import BaseModel
import os, google.generativeai as genai
from typing import Optional

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

PERSONALITY_PROMPTS = {
    "broadcast": (
        "You are a professional football broadcast commentator — energetic, dramatic, eloquent. "
        "Use vivid metaphors, build suspense, reference football history. Be concise (2-3 sentences max). "
        "Speak in present tense. Make every moment feel monumental."
    ),
    "tactical": (
        "You are an elite tactical football analyst — precise, data-driven, clinical. "
        "Reference formations, pressing triggers, spatial dynamics, xG values. "
        "2-4 sentences. Use football analytics terminology. Be insightful not obvious."
    ),
    "coach": (
        "You are a seasoned international football coach — authoritative, direct, motivational. "
        "Speak as if giving halftime team talk. Reference specific player positions and roles. "
        "2-3 sentences. Pragmatic. Focused on what to fix or maintain."
    ),
    "fan": (
        "You are a passionate, unhinged football fan — raw emotion, humor, hyperbole. "
        "CAPS for emphasis. Include at least one dramatic exaggeration. "
        "2-3 sentences. Funny but knowledgeable. Reference clubs, managers, iconic moments."
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
    if not GEMINI_API_KEY:
        return _fallback_commentary(req)
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = build_commentary_prompt(req)
        response = model.generate_content(prompt)
        text = response.text.strip()
        return {
            "text": text,
            "personality": req.personality,
            "event_type": req.event_type,
            "match_id": req.match_id,
        }
    except Exception as e:
        return _fallback_commentary(req)

def _fallback_commentary(req: CommentaryRequest) -> dict:
    fallbacks = {
        "tactical": "The tactical battle is intensifying. Both sides are probing for structural weaknesses in the opponent's defensive block.",
        "broadcast": "What a contest this is! Both teams leaving everything on the pitch in this crucial encounter.",
        "coach": "We need to maintain our shape and be patient. The chance will come — stay disciplined.",
        "fan": "COME ON! This is EXACTLY the kind of match that gives you grey hairs!! 😤",
    }
    return {
        "text": fallbacks.get(req.personality, fallbacks["tactical"]),
        "personality": req.personality,
        "event_type": req.event_type,
        "match_id": req.match_id,
    }


@router.post("/ask")
async def ask_analyst(req: AskRequest):
    if not GEMINI_API_KEY:
        return _fallback_ask(req)
    try:
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
        full_prompt += f"\n\nUser: {req.question}\nAnalyst:"
        
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(full_prompt)
        text = response.text.strip()
        
        return {
            "answer": text,
            "personality": req.personality,
        }
    except Exception as e:
        print(f"[commentary] Gemini call failed: {e}")
        return _fallback_ask(req)

def _fallback_ask(req: AskRequest) -> dict:
    return {
        "answer": "The tactical engine is processing your query. Our AI analyst is analyzing the match dynamics — please try again in a moment.",
        "personality": req.personality,
    }
