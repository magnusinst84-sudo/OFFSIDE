from fastapi import APIRouter
from pydantic import BaseModel
import joblib, numpy as np, pandas as pd
import os
router = APIRouter()
BASE = os.path.dirname(__file__)
model = joblib.load(os.path.join(BASE, "../ml/model.pkl"))
features = joblib.load(os.path.join(BASE, "../ml/features.pkl"))
elo_df = pd.read_csv(os.path.join(BASE, "../ml/elo_ratings.csv"))
elo_map = dict(zip(elo_df["team"], elo_df["elo"]))
class MatchRequest(BaseModel):
    home_team: str
    away_team: str
    neutral: bool = False
    home_goals: int = 0
    away_goals: int = 0
    home_shots_on_target: int = 0
    away_shots_on_target: int = 0
    home_possession: float = 50.0
    home_xg: float = 0.0
    away_xg: float = 0.0
    match_minute: int = 0
def compute_momentum(req):
    raw = (0.4*(req.home_shots_on_target-req.away_shots_on_target))+(0.3*((req.home_possession-50)/50)*10)+(0.3*(req.home_xg-req.away_xg)*5)
    return float(round(min(95,max(5,50+(raw*5))),1))
@router.post("/win-probability")
async def predict_win_prob(req: MatchRequest):
    home_elo=float(elo_map.get(req.home_team,1500))
    away_elo=float(elo_map.get(req.away_team,1500))
    fv={"home_advantage":0 if req.neutral else 1,"home_elo":home_elo,"away_elo":away_elo,"elo_diff":home_elo-away_elo,"home_form":0.5,"away_form":0.5,"form_diff":0.0,"home_gs":1.2,"home_gc":1.2,"away_gs":1.2,"away_gc":1.2,"gs_diff":0.0,"gc_diff":0.0,"is_wc":1}
    X=np.array([[fv[f] for f in features]])
    probs=model.predict_proba(X)[0]
    ap,dp,hp=float(probs[0]),float(probs[1]),float(probs[2])
    if req.match_minute>0:
        adj=(req.home_goals-req.away_goals)*0.12+(req.home_shots_on_target-req.away_shots_on_target)*0.015+(req.home_xg-req.away_xg)*0.04
        hp=min(0.95,max(0.05,hp+adj));ap=min(0.95,max(0.05,ap-adj));t=hp+ap+dp;hp/=t;ap/=t;dp/=t
    m=compute_momentum(req)
    ed=abs(home_elo-away_elo)
    up=hp if home_elo<away_elo else ap
    return {"home_team":req.home_team,"away_team":req.away_team,"home_win_prob":float(round(hp,3)),"draw_prob":float(round(dp,3)),"away_win_prob":float(round(ap,3)),"momentum_score":m,"upset_alert":bool(up>0.35 and ed>100),"home_elo":float(round(home_elo,1)),"away_elo":float(round(away_elo,1)),"model_accuracy":0.576}
@router.get("/teams")
async def list_teams():
    return {"teams":sorted(elo_map.keys())}
