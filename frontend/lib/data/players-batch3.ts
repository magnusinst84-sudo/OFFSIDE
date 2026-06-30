import type { Player, PlayerAttributes, RoleSuitability, ShotMapPoint } from './players-batch2'

const mkAttrs = (a: Partial<PlayerAttributes>): PlayerAttributes => ({
  pace: 70, dribbling: 70, passing: 70, shooting: 60, defending: 50, physicality: 65, ...a
})
const mkRole = (r: Partial<RoleSuitability>): RoleSuitability => ({
  striker: 30, winger: 30, cam: 30, cm: 30, ...r
})
const mkShots = (n: number, baseX = 50): ShotMapPoint[] =>
  Array.from({ length: n }, (_, i) => ({
    x: baseX + (Math.sin(i * 1.7) * 20),
    y: 75 + (Math.cos(i * 1.3) * 15),
    outcome: i % 4 === 0 ? 'goal' : i % 2 === 0 ? 'on_target' : 'off_target',
    xg: 0.05 + (Math.random() * 0.2)
  }))

const URUGUAY_PLAYERS: Player[] = [
  {
    id: 'uru-valverde', name: 'Federico Valverde', shirt_name: 'VALVERDE', team: 'Uruguay', team_code: 'URU',
    position: 'MF', number: 15, club: 'Real Madrid', age: 27, height_cm: 182, caps: 65,
    goals: 11, assists: 8, xg: 6.5, xa: 5.2, minutes_played: 5100, shots: 95, shots_on_target: 38, pass_accuracy: 88.5,
    dna_score: 91, attributes: mkAttrs({ pace: 88, shooting: 87, passing: 86, defending: 82, physicality: 85 }),
    strengths: ['Long Shots', 'Stamina', 'Versatility'], weaknesses: ['Tight Space Dribbling'],
    role_suitability: mkRole({ cm: 96, winger: 85, cam: 80 }), predicted_impact: 9.0, comparison_players: ['Steven Gerrard'],
    shot_map: mkShots(40), form_trend: [89, 90, 91, 92, 91]
  },
  {
    id: 'uru-araujo', name: 'Ronald Araujo', shirt_name: 'ARAUJO', team: 'Uruguay', team_code: 'URU',
    position: 'DF', number: 4, club: 'Barcelona', age: 27, height_cm: 188, caps: 40,
    goals: 3, assists: 1, xg: 1.8, xa: 0.5, minutes_played: 3400, shots: 15, shots_on_target: 5, pass_accuracy: 84.2,
    dna_score: 88, attributes: mkAttrs({ pace: 86, defending: 91, physicality: 90 }),
    strengths: ['Recovery Pace', '1v1 Defending', 'Aggression'], weaknesses: ['Ball Playing Under Pressure'],
    role_suitability: mkRole({ cm: 20 }), predicted_impact: 8.7, comparison_players: ['Antonio Rüdiger'],
    shot_map: mkShots(8), form_trend: [86, 88, 89, 87, 88]
  },
  {
    id: 'uru-nunez', name: 'Darwin Núñez', shirt_name: 'NÚÑEZ', team: 'Uruguay', team_code: 'URU',
    position: 'FW', number: 9, club: 'Liverpool', age: 26, height_cm: 187, caps: 35,
    goals: 18, assists: 5, xg: 22.5, xa: 3.1, minutes_played: 2600, shots: 110, shots_on_target: 45, pass_accuracy: 71.5,
    dna_score: 85, attributes: mkAttrs({ pace: 93, shooting: 82, physicality: 86, dribbling: 78 }),
    strengths: ['Pace', 'Off-ball Movement', 'Chaos Creation'], weaknesses: ['Finishing Consistency', 'First Touch'],
    role_suitability: mkRole({ striker: 92, winger: 80 }), predicted_impact: 8.4, comparison_players: ['Edinson Cavani'],
    shot_map: mkShots(45), form_trend: [83, 85, 82, 86, 85]
  },
  {
    id: 'uru-ugarte', name: 'Manuel Ugarte', shirt_name: 'UGARTE', team: 'Uruguay', team_code: 'URU',
    position: 'MF', number: 5, club: 'Paris SG', age: 25, height_cm: 182, caps: 28,
    goals: 0, assists: 2, xg: 0.5, xa: 1.2, minutes_played: 2100, shots: 5, shots_on_target: 1, pass_accuracy: 91.5,
    dna_score: 83, attributes: mkAttrs({ defending: 87, physicality: 85, passing: 82 }),
    strengths: ['Tackling', 'Interceptions', 'Work Rate'], weaknesses: ['Attacking Contribution', 'Discipline'],
    role_suitability: mkRole({ cm: 90 }), predicted_impact: 8.0, comparison_players: ['Casemiro'],
    shot_map: mkShots(2), form_trend: [81, 83, 84, 82, 83]
  }
]

const CROATIA_PLAYERS: Player[] = [
  {
    id: 'cro-gvardiol', name: 'Joško Gvardiol', shirt_name: 'GVARDIOL', team: 'Croatia', team_code: 'CRO',
    position: 'DF', number: 4, club: 'Man City', age: 24, height_cm: 185, caps: 42,
    goals: 4, assists: 3, xg: 2.1, xa: 2.5, minutes_played: 3500, shots: 18, shots_on_target: 6, pass_accuracy: 90.2,
    dna_score: 88, attributes: mkAttrs({ pace: 82, defending: 88, passing: 85, physicality: 86 }),
    strengths: ['Ball Playing', 'Versatility', 'Tackling'], weaknesses: ['Occasional Lapses'],
    role_suitability: mkRole({ cm: 60 }), predicted_impact: 8.7, comparison_players: ['Alessandro Bastoni'],
    shot_map: mkShots(10), form_trend: [87, 88, 89, 87, 88]
  },
  {
    id: 'cro-kovacic', name: 'Mateo Kovačić', shirt_name: 'KOVAČIĆ', team: 'Croatia', team_code: 'CRO',
    position: 'MF', number: 8, club: 'Man City', age: 32, height_cm: 178, caps: 110,
    goals: 6, assists: 12, xg: 3.5, xa: 6.8, minutes_played: 7500, shots: 40, shots_on_target: 12, pass_accuracy: 92.5,
    dna_score: 85, attributes: mkAttrs({ dribbling: 88, passing: 89, defending: 75 }),
    strengths: ['Press Resistance', 'Ball Carrying', 'Passing Accuracy'], weaknesses: ['Goal Scoring'],
    role_suitability: mkRole({ cm: 92, cam: 75 }), predicted_impact: 8.2, comparison_players: ['Frenkie de Jong'],
    shot_map: mkShots(15), form_trend: [84, 85, 86, 84, 85]
  },
  {
    id: 'cro-majera', name: 'Lovro Majer', shirt_name: 'MAJER', team: 'Croatia', team_code: 'CRO',
    position: 'MF', number: 7, club: 'Wolfsburg', age: 28, height_cm: 179, caps: 38,
    goals: 8, assists: 10, xg: 5.2, xa: 7.1, minutes_played: 2200, shots: 35, shots_on_target: 14, pass_accuracy: 85.4,
    dna_score: 83, attributes: mkAttrs({ passing: 86, dribbling: 83, shooting: 78 }),
    strengths: ['Vision', 'Key Passes', 'Agility'], weaknesses: ['Physicality', 'Aerial Duels'],
    role_suitability: mkRole({ cam: 88, cm: 80 }), predicted_impact: 8.0, comparison_players: ['Martin Ødegaard'],
    shot_map: mkShots(20), form_trend: [80, 82, 84, 83, 83]
  }
]

const COLOMBIA_PLAYERS: Player[] = [
  {
    id: 'col-diaz', name: 'Luis Díaz', shirt_name: 'DÍAZ', team: 'Colombia', team_code: 'COL',
    position: 'FW', number: 7, club: 'Liverpool', age: 29, height_cm: 180, caps: 55,
    goals: 15, assists: 8, xg: 14.2, xa: 6.5, minutes_played: 4200, shots: 95, shots_on_target: 38, pass_accuracy: 81.5,
    dna_score: 87, attributes: mkAttrs({ pace: 92, dribbling: 90, shooting: 83 }),
    strengths: ['Dribbling', 'Cut-ins', 'Work Rate'], weaknesses: ['Decision Making in Final Third'],
    role_suitability: mkRole({ winger: 95, striker: 70 }), predicted_impact: 8.6, comparison_players: ['Sadio Mané'],
    shot_map: mkShots(35, 25), form_trend: [86, 87, 85, 88, 87]
  },
  {
    id: 'col-rios', name: 'Richard Ríos', shirt_name: 'RÍOS', team: 'Colombia', team_code: 'COL',
    position: 'MF', number: 6, club: 'Palmeiras', age: 26, height_cm: 185, caps: 20,
    goals: 2, assists: 3, xg: 1.5, xa: 2.1, minutes_played: 1400, shots: 15, shots_on_target: 5, pass_accuracy: 85.2,
    dna_score: 81, attributes: mkAttrs({ passing: 81, defending: 79, physicality: 83, dribbling: 84 }),
    strengths: ['Ball Carrying', 'Tackling', 'Flair'], weaknesses: ['Consistency', 'Positioning'],
    role_suitability: mkRole({ cm: 85 }), predicted_impact: 7.8, comparison_players: ['Yves Bissouma'],
    shot_map: mkShots(10), form_trend: [79, 81, 82, 80, 81]
  }
]

const JAPAN_PLAYERS: Player[] = [
  {
    id: 'jpn-mitoma', name: 'Kaoru Mitoma', shirt_name: 'MITOMA', team: 'Japan', team_code: 'JPN',
    position: 'FW', number: 9, club: 'Brighton', age: 29, height_cm: 178, caps: 35,
    goals: 10, assists: 12, xg: 8.5, xa: 9.1, minutes_played: 2400, shots: 45, shots_on_target: 20, pass_accuracy: 80.5,
    dna_score: 85, attributes: mkAttrs({ pace: 89, dribbling: 92, passing: 82 }),
    strengths: ['1v1 Dribbling', 'Agility', 'Crossing'], weaknesses: ['Strength', 'Aerial Duels'],
    role_suitability: mkRole({ winger: 95 }), predicted_impact: 8.4, comparison_players: ['Luis Díaz'],
    shot_map: mkShots(25, 25), form_trend: [84, 85, 86, 85, 85]
  },
  {
    id: 'jpn-kubo', name: 'Takefusa Kubo', shirt_name: 'KUBO', team: 'Japan', team_code: 'JPN',
    position: 'FW', number: 20, club: 'Real Sociedad', age: 25, height_cm: 173, caps: 40,
    goals: 8, assists: 9, xg: 6.5, xa: 7.2, minutes_played: 2600, shots: 50, shots_on_target: 18, pass_accuracy: 83.5,
    dna_score: 84, attributes: mkAttrs({ pace: 86, dribbling: 88, passing: 84 }),
    strengths: ['Close Control', 'Vision', 'Agility'], weaknesses: ['Physicality'],
    role_suitability: mkRole({ winger: 88, cam: 85 }), predicted_impact: 8.2, comparison_players: ['Bernardo Silva'],
    shot_map: mkShots(20, 75), form_trend: [82, 84, 83, 85, 84]
  },
  {
    id: 'jpn-endo', name: 'Wataru Endo', shirt_name: 'ENDO', team: 'Japan', team_code: 'JPN',
    position: 'MF', number: 6, club: 'Liverpool', age: 33, height_cm: 178, caps: 65,
    goals: 3, assists: 2, xg: 1.5, xa: 1.8, minutes_played: 4500, shots: 20, shots_on_target: 6, pass_accuracy: 88.2,
    dna_score: 83, attributes: mkAttrs({ defending: 85, physicality: 84, passing: 83 }),
    strengths: ['Tackling', 'Work Rate', 'Leadership'], weaknesses: ['Pace'],
    role_suitability: mkRole({ cm: 90 }), predicted_impact: 8.1, comparison_players: ['Casemiro'],
    shot_map: mkShots(8), form_trend: [83, 84, 82, 83, 83]
  }
]

const KOREA_PLAYERS: Player[] = [
  {
    id: 'kor-son', name: 'Son Heung-min', shirt_name: 'SON', team: 'South Korea', team_code: 'KOR',
    position: 'FW', number: 7, club: 'Tottenham', age: 33, height_cm: 183, caps: 120,
    goals: 45, assists: 20, xg: 35.5, xa: 15.2, minutes_played: 9800, shots: 250, shots_on_target: 115, pass_accuracy: 82.5,
    dna_score: 88, attributes: mkAttrs({ pace: 87, shooting: 90, dribbling: 85, passing: 83 }),
    strengths: ['Finishing', 'Pace', 'Two-Footed'], weaknesses: ['Aerial Duels'],
    role_suitability: mkRole({ winger: 90, striker: 85 }), predicted_impact: 8.8, comparison_players: ['Sadio Mané'],
    shot_map: mkShots(60), form_trend: [88, 87, 89, 88, 88]
  },
  {
    id: 'kor-kim', name: 'Kim Min-jae', shirt_name: 'KIM', team: 'South Korea', team_code: 'KOR',
    position: 'DF', number: 4, club: 'Bayern Munich', age: 29, height_cm: 190, caps: 55,
    goals: 4, assists: 1, xg: 2.1, xa: 0.5, minutes_played: 4500, shots: 15, shots_on_target: 5, pass_accuracy: 90.5,
    dna_score: 87, attributes: mkAttrs({ pace: 83, defending: 89, physicality: 91 }),
    strengths: ['Strength', 'Aggression', 'Recovery Pace'], weaknesses: ['Agility'],
    role_suitability: mkRole({ cm: 20 }), predicted_impact: 8.6, comparison_players: ['Dayot Upamecano'],
    shot_map: mkShots(6), form_trend: [86, 87, 88, 86, 87]
  },
  {
    id: 'kor-lee', name: 'Lee Kang-in', shirt_name: 'LEE', team: 'South Korea', team_code: 'KOR',
    position: 'MF', number: 18, club: 'Paris SG', age: 25, height_cm: 173, caps: 35,
    goals: 7, assists: 11, xg: 5.2, xa: 8.5, minutes_played: 2200, shots: 35, shots_on_target: 14, pass_accuracy: 86.5,
    dna_score: 84, attributes: mkAttrs({ dribbling: 89, passing: 87, shooting: 80 }),
    strengths: ['Dribbling', 'Vision', 'Set Pieces'], weaknesses: ['Physicality', 'Defensive Contribution'],
    role_suitability: mkRole({ cam: 90, winger: 85 }), predicted_impact: 8.2, comparison_players: ['Bernardo Silva'],
    shot_map: mkShots(15), form_trend: [82, 84, 85, 83, 84]
  }
]

const SENEGAL_PLAYERS: Player[] = [
  {
    id: 'sen-mane', name: 'Sadio Mané', shirt_name: 'MANÉ', team: 'Senegal', team_code: 'SEN',
    position: 'FW', number: 10, club: 'Al Nassr', age: 34, height_cm: 174, caps: 105,
    goals: 40, assists: 25, xg: 32.5, xa: 18.2, minutes_played: 8500, shots: 210, shots_on_target: 95, pass_accuracy: 79.5,
    dna_score: 85, attributes: mkAttrs({ pace: 85, dribbling: 86, shooting: 84, physicality: 78 }),
    strengths: ['Positioning', 'Finishing', 'Leadership'], weaknesses: ['Declining Pace'],
    role_suitability: mkRole({ winger: 85, striker: 80 }), predicted_impact: 8.4, comparison_players: ['Son Heung-min'],
    shot_map: mkShots(45), form_trend: [84, 85, 84, 86, 85]
  },
  {
    id: 'sen-sarr', name: 'Pape Matar Sarr', shirt_name: 'SARR', team: 'Senegal', team_code: 'SEN',
    position: 'MF', number: 15, club: 'Tottenham', age: 23, height_cm: 185, caps: 25,
    goals: 4, assists: 5, xg: 3.1, xa: 3.5, minutes_played: 1800, shots: 25, shots_on_target: 8, pass_accuracy: 87.5,
    dna_score: 82, attributes: mkAttrs({ passing: 84, defending: 81, physicality: 83, pace: 80 }),
    strengths: ['Box-to-Box', 'Passing Range', 'Energy'], weaknesses: ['Experience', 'Consistency'],
    role_suitability: mkRole({ cm: 88, cam: 70 }), predicted_impact: 8.0, comparison_players: ['Amadou Onana'],
    shot_map: mkShots(10), form_trend: [80, 81, 83, 82, 82]
  },
  {
    id: 'sen-koulibaly', name: 'Kalidou Koulibaly', shirt_name: 'KOULIBALY', team: 'Senegal', team_code: 'SEN',
    position: 'DF', number: 3, club: 'Al Hilal', age: 34, height_cm: 186, caps: 80,
    goals: 1, assists: 2, xg: 0.8, xa: 1.1, minutes_played: 7000, shots: 10, shots_on_target: 3, pass_accuracy: 88.5,
    dna_score: 83, attributes: mkAttrs({ defending: 86, physicality: 89, pace: 70 }),
    strengths: ['Strength', 'Tackling', 'Leadership'], weaknesses: ['Pace'],
    role_suitability: mkRole({ cm: 20 }), predicted_impact: 8.1, comparison_players: ['Virgil van Dijk'],
    shot_map: mkShots(5), form_trend: [82, 83, 82, 84, 83]
  }
]

const CANADA_PLAYERS: Player[] = [
  {
    id: 'can-davies', name: 'Alphonso Davies', shirt_name: 'DAVIES', team: 'Canada', team_code: 'CAN',
    position: 'DF', number: 19, club: 'Bayern Munich', age: 25, height_cm: 185, caps: 52,
    goals: 15, assists: 28, xg: 10.5, xa: 18.2, minutes_played: 4520, shots: 42, shots_on_target: 15, pass_accuracy: 86.1,
    dna_score: 87, attributes: mkAttrs({ pace: 95, passing: 81, dribbling: 87, defending: 78, physicality: 80 }),
    strengths: ['Explosive Pace', 'Progressive Carries', 'Attacking Overlap'], weaknesses: ['Defensive Positioning'],
    role_suitability: mkRole({ winger: 85, cm: 10 }), predicted_impact: 8.7, comparison_players: ['Theo Hernández'],
    shot_map: mkShots(20), form_trend: [86, 88, 89, 88, 88]
  },
  {
    id: 'can-david', name: 'Jonathan David', shirt_name: 'DAVID', team: 'Canada', team_code: 'CAN',
    position: 'FW', number: 20, club: 'Lille', age: 26, height_cm: 175, caps: 55,
    goals: 32, assists: 14, xg: 28.5, xa: 6.2, minutes_played: 4800, shots: 110, shots_on_target: 55, pass_accuracy: 78.5,
    dna_score: 84, attributes: mkAttrs({ pace: 88, dribbling: 82, shooting: 85 }),
    strengths: ['Finishing', 'Pace', 'Work Rate'], weaknesses: ['Aerial Duels', 'Hold-up Play'],
    role_suitability: mkRole({ striker: 94, winger: 70 }), predicted_impact: 8.4, comparison_players: ['Timo Werner'],
    shot_map: mkShots(30, 50), form_trend: [82, 85, 84, 85, 84]
  },
  {
    id: 'can-eustaquio', name: 'Stephen Eustáquio', shirt_name: 'EUSTÁQUIO', team: 'Canada', team_code: 'CAN',
    position: 'MF', number: 7, club: 'Porto', age: 29, height_cm: 176, caps: 40,
    goals: 4, assists: 8, xg: 2.1, xa: 4.4, minutes_played: 3200, shots: 15, shots_on_target: 6, pass_accuracy: 88.2,
    dna_score: 81, attributes: mkAttrs({ defending: 80, passing: 84, physicality: 78 }),
    strengths: ['Passing Range', 'Dictating Tempo', 'Set Pieces'], weaknesses: ['Pace'],
    role_suitability: mkRole({ cm: 90 }), predicted_impact: 8.0, comparison_players: ['Rúben Neves'],
    shot_map: mkShots(5, 45), form_trend: [80, 81, 82, 80, 81]
  }
]

export const ALL_PLAYERS_BATCH3: Player[] = [
  ...CANADA_PLAYERS,
  ...URUGUAY_PLAYERS,
  ...CROATIA_PLAYERS,
  ...COLOMBIA_PLAYERS,
  ...JAPAN_PLAYERS,
  ...KOREA_PLAYERS,
  ...SENEGAL_PLAYERS
]

export const TEAMS_IN_ROSTER_BATCH3 = [
  'Canada', 'Uruguay', 'Croatia', 'Colombia', 'Japan', 'South Korea', 'Senegal'
]
