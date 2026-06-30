import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

results = pd.read_csv("../../data/results.csv", encoding="utf-8-sig")
results = results.sort_values('date').reset_index(drop=True)

results['neutral'] = (results['neutral'] == 'TRUE').astype(int)
results['home_advantage'] = 1 - results['neutral']
results['home_score'] = pd.to_numeric(results['home_score'], errors='coerce')
results['away_score'] = pd.to_numeric(results['away_score'], errors='coerce')
results = results.dropna(subset=['home_score', 'away_score'])

def get_result(row):
    if row['home_score'] > row['away_score']: return 2
    elif row['home_score'] == row['away_score']: return 1
    else: return 0

results['result'] = results.apply(get_result, axis=1)

# --- Elo ratings (computed on full history since 1872 for accuracy) ---
def compute_elo(df, k=32, base=1500):
    elo = {}
    home_elos, away_elos = [], []
    for _, row in df.iterrows():
        ht, at = row['home_team'], row['away_team']
        he = elo.get(ht, base)
        ae = elo.get(at, base)
        home_elos.append(he)
        away_elos.append(ae)
        exp_h = 1 / (1 + 10**((ae - he) / 400))
        exp_a = 1 - exp_h
        if row['result'] == 2:   sh, sa = 1, 0
        elif row['result'] == 1: sh, sa = 0.5, 0.5
        else:                    sh, sa = 0, 1
        elo[ht] = he + k * (sh - exp_h)
        elo[at] = ae + k * (sa - exp_a)
    df = df.copy()
    df['home_elo'] = home_elos
    df['away_elo'] = away_elos
    df['elo_diff'] = df['home_elo'] - df['away_elo']
    return df, elo

results, final_elo = compute_elo(results)

# Save final Elo ratings for inference
elo_df = pd.DataFrame(list(final_elo.items()), columns=['team', 'elo'])
elo_df.to_csv('elo_ratings.csv', index=False)
print(f"Saved Elo ratings for {len(elo_df)} teams")

# --- Rolling team stats ---
def compute_team_stats(df, n=10):
    team_history = {}
    home_form, away_form = [], []
    home_gs, home_gc = [], []
    away_gs, away_gc = [], []

    for _, row in df.iterrows():
        ht, at = row['home_team'], row['away_team']

        def get_stats(team):
            h = team_history.get(team, [])
            if not h:
                return 0.5, 1.2, 1.2
            recent = h[-n:]
            wr = sum(1 for r in recent if r['win']) / len(recent)
            gs = np.mean([r['gs'] for r in recent])
            gc = np.mean([r['gc'] for r in recent])
            return wr, gs, gc

        h_wr, h_gs, h_gc = get_stats(ht)
        a_wr, a_gs, a_gc = get_stats(at)

        home_form.append(h_wr)
        away_form.append(a_wr)
        home_gs.append(h_gs)
        home_gc.append(h_gc)
        away_gs.append(a_gs)
        away_gc.append(a_gc)

        for team, win_cond, gs, gc in [
            (ht, row['result']==2, row['home_score'], row['away_score']),
            (at, row['result']==0, row['away_score'], row['home_score'])
        ]:
            if team not in team_history:
                team_history[team] = []
            team_history[team].append({
                'win': win_cond,
                'draw': row['result']==1,
                'gs': gs, 'gc': gc
            })

    df = df.copy()
    df['home_form'] = home_form
    df['away_form'] = away_form
    df['home_gs'] = home_gs
    df['home_gc'] = home_gc
    df['away_gs'] = away_gs
    df['away_gc'] = away_gc
    df['form_diff'] = df['home_form'] - df['away_form']
    df['gs_diff']   = df['home_gs']   - df['away_gs']
    df['gc_diff']   = df['home_gc']   - df['away_gc']
    return df

results = compute_team_stats(results)
results['is_wc'] = results['tournament'].str.contains('World Cup', na=False).astype(int)

# --- Train on 1990+ only ---
data = results[results['date'] >= '1990-01-01'].dropna()

features = [
    'home_advantage',
    'home_elo', 'away_elo', 'elo_diff',
    'home_form', 'away_form', 'form_diff',
    'home_gs', 'home_gc',
    'away_gs', 'away_gc',
    'gs_diff', 'gc_diff',
    'is_wc'
]

X = data[features]
y = data['result']

print(f"Training rows: {len(X)}")
print(f"Result distribution:\n{y.value_counts()}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = XGBClassifier(
    n_estimators=500,
    max_depth=4,
    learning_rate=0.03,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric='mlogloss'
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print(f"\nAccuracy: {accuracy_score(y_test, y_pred):.3f}")
print(classification_report(y_test, y_pred, target_names=['Away win', 'Draw', 'Home win']))

importance = pd.Series(model.feature_importances_, index=features).sort_values(ascending=False)
print(f"\nFeature importance:\n{importance}")

joblib.dump(model, "model.pkl")
joblib.dump(features, "features.pkl")
print("\nSaved model.pkl, features.pkl, elo_ratings.csv")