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

// Expand England
export const ENGLAND_EXTRA: Player[] = [
  {
    id: 'eng-saka', name: 'Bukayo Saka', shirt_name: 'SAKA', team: 'England', team_code: 'ENG',
    position: 'FW', number: 7, club: 'Arsenal', age: 24, height_cm: 178, caps: 45,
    goals: 15, assists: 11, xg: 12.5, xa: 9.2, minutes_played: 3100, shots: 85, shots_on_target: 38, pass_accuracy: 82.5,
    dna_score: 89, attributes: mkAttrs({ pace: 88, dribbling: 89, shooting: 84, passing: 83 }),
    strengths: ['1v1 Dribbling', 'Cutting Inside', 'Work Rate'], weaknesses: ['Aerial Duels'],
    role_suitability: mkRole({ winger: 95, cam: 60 }), predicted_impact: 8.8, comparison_players: ['Mohamed Salah'],
    shot_map: mkShots(25, 65), form_trend: [86, 88, 89, 87, 88]
  },


  {
    id: 'eng-stones', name: 'John Stones', shirt_name: 'STONES', team: 'England', team_code: 'ENG',
    position: 'DF', number: 5, club: 'Man City', age: 32, height_cm: 188, caps: 75,
    goals: 2, assists: 1, xg: 1.5, xa: 0.5, minutes_played: 2600, shots: 10, shots_on_target: 4, pass_accuracy: 93.5,
    dna_score: 86, attributes: mkAttrs({ pace: 72, defending: 88, passing: 89, physicality: 82 }),
    strengths: ['Ball Playing', 'Composure', 'Versatility'], weaknesses: ['Injury Prone'],
    role_suitability: mkRole({ cm: 60 }), predicted_impact: 8.4, comparison_players: ['Alessandro Bastoni'],
    shot_map: mkShots(5, 50), form_trend: [84, 85, 84, 86, 85]
  },

]

// Expand France
export const FRANCE_EXTRA: Player[] = [
  {
    id: 'fra-griezmann', name: 'Antoine Griezmann', shirt_name: 'GRIEZMANN', team: 'France', team_code: 'FRA',
    position: 'MF', number: 7, club: 'Atletico Madrid', age: 35, height_cm: 176, caps: 140,
    goals: 12, assists: 10, xg: 9.5, xa: 8.2, minutes_played: 3500, shots: 60, shots_on_target: 28, pass_accuracy: 85.5,
    dna_score: 89, attributes: mkAttrs({ pace: 72, dribbling: 85, passing: 89, shooting: 84, defending: 70 }),
    strengths: ['Work Rate', 'Vision', 'Link-up Play'], weaknesses: ['Pace'],
    role_suitability: mkRole({ cam: 95, striker: 75 }), predicted_impact: 8.8, comparison_players: ['Thomas Müller'],
    shot_map: mkShots(20, 50), form_trend: [88, 89, 88, 90, 89]
  },

  {
    id: 'fra-kounde', name: 'Jules Koundé', shirt_name: 'KOUNDE', team: 'France', team_code: 'FRA',
    position: 'DF', number: 5, club: 'Barcelona', age: 27, height_cm: 180, caps: 45,
    goals: 1, assists: 4, xg: 0.8, xa: 2.5, minutes_played: 3600, shots: 8, shots_on_target: 3, pass_accuracy: 89.5,
    dna_score: 85, attributes: mkAttrs({ pace: 84, defending: 88, passing: 84, physicality: 81 }),
    strengths: ['1v1 Defending', 'Recovery Pace', 'Versatility'], weaknesses: ['Aerial Duels'],
    role_suitability: mkRole({ cm: 30 }), predicted_impact: 8.3, comparison_players: ['Marquinhos'],
    shot_map: mkShots(4, 30), form_trend: [83, 85, 84, 86, 85]
  },
  {
    id: 'fra-hernandez', name: 'Theo Hernández', shirt_name: 'T. HERNANDEZ', team: 'France', team_code: 'FRA',
    position: 'DF', number: 22, club: 'AC Milan', age: 28, height_cm: 184, caps: 40,
    goals: 5, assists: 8, xg: 3.5, xa: 5.5, minutes_played: 3400, shots: 35, shots_on_target: 15, pass_accuracy: 82.5,
    dna_score: 86, attributes: mkAttrs({ pace: 94, dribbling: 84, passing: 80, shooting: 78, defending: 79, physicality: 85 }),
    strengths: ['Pace', 'Ball Carrying', 'Attacking Overlaps'], weaknesses: ['Defensive Positioning'],
    role_suitability: mkRole({ winger: 75 }), predicted_impact: 8.5, comparison_players: ['Alphonso Davies'],
    shot_map: mkShots(12, 20), form_trend: [85, 86, 85, 87, 86]
  }
]

// Expand Brazil
export const BRAZIL_EXTRA: Player[] = [
  {
    id: 'bra-rodrygo', name: 'Rodrygo', shirt_name: 'RODRYGO', team: 'Brazil', team_code: 'BRA',
    position: 'FW', number: 10, club: 'Real Madrid', age: 25, height_cm: 174, caps: 35,
    goals: 16, assists: 10, xg: 14.5, xa: 8.2, minutes_played: 3100, shots: 80, shots_on_target: 35, pass_accuracy: 85.5,
    dna_score: 88, attributes: mkAttrs({ pace: 89, dribbling: 90, shooting: 85, passing: 84 }),
    strengths: ['Versatility', 'Finishing', 'Agility'], weaknesses: ['Physicality'],
    role_suitability: mkRole({ winger: 92, striker: 85 }), predicted_impact: 8.7, comparison_players: ['Neymar'],
    shot_map: mkShots(25, 40), form_trend: [86, 88, 87, 89, 88]
  },
  {
    id: 'bra-guimaraes', name: 'Bruno Guimarães', shirt_name: 'GUIMARAES', team: 'Brazil', team_code: 'BRA',
    position: 'MF', number: 8, club: 'Newcastle', age: 28, height_cm: 182, caps: 30,
    goals: 6, assists: 8, xg: 4.5, xa: 6.2, minutes_played: 3400, shots: 35, shots_on_target: 12, pass_accuracy: 87.5,
    dna_score: 86, attributes: mkAttrs({ pace: 75, dribbling: 84, passing: 87, defending: 81, physicality: 84 }),
    strengths: ['Passing Range', 'Tenacity', 'Ball Carrying'], weaknesses: ['Pace'],
    role_suitability: mkRole({ cm: 94 }), predicted_impact: 8.5, comparison_players: ['Nicolo Barella'],
    shot_map: mkShots(15, 50), form_trend: [84, 86, 85, 87, 86]
  },
  {
    id: 'bra-militao', name: 'Éder Militão', shirt_name: 'MILITAO', team: 'Brazil', team_code: 'BRA',
    position: 'DF', number: 3, club: 'Real Madrid', age: 28, height_cm: 186, caps: 40,
    goals: 3, assists: 1, xg: 2.1, xa: 0.5, minutes_played: 3000, shots: 15, shots_on_target: 5, pass_accuracy: 88.5,
    dna_score: 87, attributes: mkAttrs({ pace: 86, defending: 89, physicality: 88 }),
    strengths: ['Recovery Pace', 'Aggression', 'Aerial Duels'], weaknesses: ['Concentration Lapses'],
    role_suitability: mkRole({ cm: 20 }), predicted_impact: 8.6, comparison_players: ['Ronald Araujo'],
    shot_map: mkShots(6, 50), form_trend: [85, 87, 86, 88, 87]
  },
  {
    id: 'bra-alisson', name: 'Alisson Becker', shirt_name: 'ALISSON', team: 'Brazil', team_code: 'BRA',
    position: 'GK', number: 1, club: 'Liverpool', age: 33, height_cm: 193, caps: 75,
    goals: 0, assists: 1, xg: 0, xa: 0.5, minutes_played: 4000, shots: 0, shots_on_target: 0, pass_accuracy: 85.5,
    dna_score: 88, attributes: mkAttrs({ pace: 55, defending: 91, physicality: 84, passing: 88 }),
    strengths: ['1v1 Saving', 'Positioning', 'Distribution'], weaknesses: ['Injury Prone'],
    role_suitability: mkRole({ cm: 10 }), predicted_impact: 8.7, comparison_players: ['Ederson'],
    shot_map: [], form_trend: [87, 88, 87, 89, 88]
  }
]

// Expand Argentina
export const ARGENTINA_EXTRA: Player[] = [
  {
    id: 'arg-alvarez', name: 'Julián Álvarez', shirt_name: 'ALVAREZ', team: 'Argentina', team_code: 'ARG',
    position: 'FW', number: 9, club: 'Atletico Madrid', age: 26, height_cm: 170, caps: 45,
    goals: 18, assists: 8, xg: 15.5, xa: 6.5, minutes_played: 3100, shots: 90, shots_on_target: 42, pass_accuracy: 81.5,
    dna_score: 87, attributes: mkAttrs({ pace: 85, dribbling: 84, shooting: 86, passing: 80, defending: 65 }),
    strengths: ['Pressing', 'Finishing', 'Work Rate'], weaknesses: ['Physicality'],
    role_suitability: mkRole({ striker: 92, winger: 80, cam: 75 }), predicted_impact: 8.6, comparison_players: ['Lautaro Martinez'],
    shot_map: mkShots(35, 50), form_trend: [86, 87, 86, 88, 87]
  },
  {
    id: 'arg-macallister', name: 'Alexis Mac Allister', shirt_name: 'MAC ALLISTER', team: 'Argentina', team_code: 'ARG',
    position: 'MF', number: 20, club: 'Liverpool', age: 27, height_cm: 174, caps: 40,
    goals: 7, assists: 8, xg: 5.5, xa: 6.2, minutes_played: 3300, shots: 40, shots_on_target: 15, pass_accuracy: 88.5,
    dna_score: 86, attributes: mkAttrs({ pace: 72, dribbling: 84, passing: 88, shooting: 82, defending: 78 }),
    strengths: ['Composure', 'Passing Range', 'Long Shots'], weaknesses: ['Pace'],
    role_suitability: mkRole({ cm: 94, cam: 85 }), predicted_impact: 8.5, comparison_players: ['Ilkay Gundogan'],
    shot_map: mkShots(15, 50), form_trend: [85, 86, 85, 87, 86]
  },
  {
    id: 'arg-enzo', name: 'Enzo Fernández', shirt_name: 'ENZO', team: 'Argentina', team_code: 'ARG',
    position: 'MF', number: 24, club: 'Chelsea', age: 25, height_cm: 178, caps: 35,
    goals: 4, assists: 7, xg: 3.5, xa: 5.2, minutes_played: 3200, shots: 30, shots_on_target: 10, pass_accuracy: 89.5,
    dna_score: 85, attributes: mkAttrs({ pace: 74, dribbling: 83, passing: 89, defending: 76, physicality: 75 }),
    strengths: ['Vision', 'Long Passing', 'Tenacity'], weaknesses: ['Pace', 'Discipline'],
    role_suitability: mkRole({ cm: 95 }), predicted_impact: 8.4, comparison_players: ['Toni Kroos'],
    shot_map: mkShots(10, 50), form_trend: [84, 85, 84, 86, 85]
  },
  {
    id: 'arg-romero', name: 'Cristian Romero', shirt_name: 'ROMERO', team: 'Argentina', team_code: 'ARG',
    position: 'DF', number: 13, club: 'Tottenham', age: 28, height_cm: 185, caps: 45,
    goals: 3, assists: 1, xg: 2.1, xa: 0.5, minutes_played: 3000, shots: 12, shots_on_target: 4, pass_accuracy: 87.5,
    dna_score: 86, attributes: mkAttrs({ pace: 78, defending: 89, physicality: 88, passing: 80 }),
    strengths: ['Aggression', 'Tackling', 'Aerial Duels'], weaknesses: ['Card Prone'],
    role_suitability: mkRole({ cm: 20 }), predicted_impact: 8.5, comparison_players: ['Ruben Dias'],
    shot_map: mkShots(5, 50), form_trend: [85, 86, 85, 87, 86]
  }
]

// Expand Spain
export const SPAIN_EXTRA: Player[] = [
  {
    id: 'esp-williams', name: 'Nico Williams', shirt_name: 'WILLIAMS', team: 'Spain', team_code: 'ESP',
    position: 'FW', number: 11, club: 'Athletic Club', age: 23, height_cm: 181, caps: 25,
    goals: 12, assists: 14, xg: 9.5, xa: 11.2, minutes_played: 2900, shots: 70, shots_on_target: 30, pass_accuracy: 78.5,
    dna_score: 87, attributes: mkAttrs({ pace: 94, dribbling: 91, passing: 82, shooting: 79 }),
    strengths: ['Pace', '1v1 Dribbling', 'Weak Foot'], weaknesses: ['Finishing Consistency'],
    role_suitability: mkRole({ winger: 96, striker: 60 }), predicted_impact: 8.6, comparison_players: ['Ousmane Dembele'],
    shot_map: mkShots(20, 25), form_trend: [86, 87, 86, 88, 87]
  },
  {
    id: 'esp-olmo', name: 'Dani Olmo', shirt_name: 'OLMO', team: 'Spain', team_code: 'ESP',
    position: 'MF', number: 10, club: 'Barcelona', age: 28, height_cm: 179, caps: 45,
    goals: 10, assists: 8, xg: 8.5, xa: 7.2, minutes_played: 2600, shots: 50, shots_on_target: 22, pass_accuracy: 85.5,
    dna_score: 86, attributes: mkAttrs({ pace: 78, dribbling: 87, passing: 86, shooting: 84 }),
    strengths: ['Close Control', 'Late Runs', 'Creativity'], weaknesses: ['Injury Prone'],
    role_suitability: mkRole({ cam: 94, winger: 80, cm: 70 }), predicted_impact: 8.5, comparison_players: ['Bernardo Silva'],
    shot_map: mkShots(15, 50), form_trend: [85, 86, 85, 87, 86]
  },
  {
    id: 'esp-carvajal', name: 'Dani Carvajal', shirt_name: 'CARVAJAL', team: 'Spain', team_code: 'ESP',
    position: 'DF', number: 2, club: 'Real Madrid', age: 34, height_cm: 173, caps: 55,
    goals: 3, assists: 6, xg: 2.1, xa: 4.5, minutes_played: 3100, shots: 15, shots_on_target: 6, pass_accuracy: 86.5,
    dna_score: 85, attributes: mkAttrs({ pace: 78, defending: 86, passing: 83, physicality: 82 }),
    strengths: ['Experience', 'Aggression', 'Crossing'], weaknesses: ['Pace Loss'],
    role_suitability: mkRole({ winger: 40 }), predicted_impact: 8.4, comparison_players: ['Kyle Walker'],
    shot_map: mkShots(5, 85), form_trend: [84, 85, 84, 86, 85]
  }
]

// Expand Portugal
export const PORTUGAL_EXTRA: Player[] = [
  {
    id: 'por-silva', name: 'Bernardo Silva', shirt_name: 'B. SILVA', team: 'Portugal', team_code: 'POR',
    position: 'MF', number: 10, club: 'Man City', age: 31, height_cm: 173, caps: 90,
    goals: 8, assists: 12, xg: 6.5, xa: 9.2, minutes_played: 3500, shots: 40, shots_on_target: 18, pass_accuracy: 89.5,
    dna_score: 89, attributes: mkAttrs({ pace: 75, dribbling: 91, passing: 89, shooting: 78, defending: 65, physicality: 60 }),
    strengths: ['Work Rate', 'Close Control', 'Versatility'], weaknesses: ['Physicality'],
    role_suitability: mkRole({ cam: 92, winger: 85, cm: 80 }), predicted_impact: 8.8, comparison_players: ['Ilkay Gundogan'],
    shot_map: mkShots(15, 75), form_trend: [88, 89, 88, 90, 89]
  },
  {
    id: 'por-dias', name: 'Rúben Dias', shirt_name: 'R. DIAS', team: 'Portugal', team_code: 'POR',
    position: 'DF', number: 4, club: 'Man City', age: 29, height_cm: 187, caps: 65,
    goals: 2, assists: 1, xg: 1.5, xa: 0.5, minutes_played: 3800, shots: 10, shots_on_target: 3, pass_accuracy: 92.5,
    dna_score: 88, attributes: mkAttrs({ pace: 74, defending: 91, physicality: 89, passing: 85 }),
    strengths: ['Leadership', 'Positioning', 'Aggression'], weaknesses: ['Pace'],
    role_suitability: mkRole({ cm: 20 }), predicted_impact: 8.7, comparison_players: ['Virgil van Dijk'],
    shot_map: mkShots(4, 50), form_trend: [87, 88, 87, 89, 88]
  },
  {
    id: 'por-leao', name: 'Rafael Leão', shirt_name: 'LEÃO', team: 'Portugal', team_code: 'POR',
    position: 'FW', number: 17, club: 'AC Milan', age: 27, height_cm: 188, caps: 45,
    goals: 14, assists: 11, xg: 11.5, xa: 8.5, minutes_played: 3100, shots: 75, shots_on_target: 32, pass_accuracy: 78.5,
    dna_score: 87, attributes: mkAttrs({ pace: 93, dribbling: 90, shooting: 82, physicality: 84 }),
    strengths: ['Pace', 'Dribbling', 'Strength'], weaknesses: ['Work Rate', 'Consistency'],
    role_suitability: mkRole({ winger: 95, striker: 75 }), predicted_impact: 8.6, comparison_players: ['Kylian Mbappé'],
    shot_map: mkShots(22, 25), form_trend: [86, 87, 86, 88, 87]
  }
]

// Expand Germany
export const GERMANY_EXTRA: Player[] = [
  {
    id: 'ger-sane', name: 'Leroy Sané', shirt_name: 'SANÉ', team: 'Germany', team_code: 'GER',
    position: 'FW', number: 19, club: 'Bayern Munich', age: 30, height_cm: 183, caps: 70,
    goals: 12, assists: 14, xg: 10.5, xa: 11.2, minutes_played: 2800, shots: 65, shots_on_target: 28, pass_accuracy: 82.5,
    dna_score: 87, attributes: mkAttrs({ pace: 93, dribbling: 89, passing: 83, shooting: 82 }),
    strengths: ['Pace', 'Dribbling', 'Crossing'], weaknesses: ['Consistency'],
    role_suitability: mkRole({ winger: 94, cam: 70 }), predicted_impact: 8.6, comparison_players: ['Kingsley Coman'],
    shot_map: mkShots(20, 75), form_trend: [86, 87, 86, 88, 87]
  },
  {
    id: 'ger-tah', name: 'Jonathan Tah', shirt_name: 'TAH', team: 'Germany', team_code: 'GER',
    position: 'DF', number: 4, club: 'Bayer Leverkusen', age: 30, height_cm: 195, caps: 40,
    goals: 3, assists: 1, xg: 2.1, xa: 0.5, minutes_played: 3400, shots: 12, shots_on_target: 4, pass_accuracy: 90.5,
    dna_score: 85, attributes: mkAttrs({ pace: 82, defending: 87, physicality: 90, passing: 85 }),
    strengths: ['Strength', 'Pace', 'Aerial Duels'], weaknesses: ['Agility'],
    role_suitability: mkRole({ cm: 15 }), predicted_impact: 8.4, comparison_players: ['Antonio Rüdiger'],
    shot_map: mkShots(5, 50), form_trend: [84, 85, 84, 86, 85]
  }
]

export const ALL_PLAYERS_BATCH4: Player[] = [
  ...ENGLAND_EXTRA,
  ...FRANCE_EXTRA,
  ...BRAZIL_EXTRA,
  ...ARGENTINA_EXTRA,
  ...SPAIN_EXTRA,
  ...PORTUGAL_EXTRA,
  ...GERMANY_EXTRA
]
