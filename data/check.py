import pandas as pd
df = pd.read_csv('matches_detailed.csv', encoding='utf-8-sig')
print('Total matches:', len(df))
print('Completed:', len(df[df['status']=='Completed']))
print('Has xG:', df[['home_xg','away_xg']].dropna().shape[0])
print(df[['home_xg','away_xg','home_score','away_score']].head(10))