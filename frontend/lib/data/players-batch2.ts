// ════════════════════════════════════════════════════════════
// OFFSIDE — Static Player Roster Extension (Batch 2)
// ════════════════════════════════════════════════════════════
// Adds: Norway, Ivory Coast, Sweden, Portugal, Spain
// Same sourcing standard as players.ts batch 1 — names, clubs,
// ages, caps, captaincy verified via real June 2026 FIFA squad
// announcements. Stats/DNA/attributes are synthetic (demo AI layer).
//
// Append this file's exports into players.ts, or import alongside it.
// Requires the same Player/PlayerAttributes/RoleSuitability/
// ShotMapPoint types and mkAttrs/mkRole/mkShots/mkForm helpers
// already defined in players.ts.
// ════════════════════════════════════════════════════════════

// Types are duplicated here (not imported from players.ts) to avoid
// a circular import, since players.ts imports ALL_PLAYERS_BATCH2 from
// this file. Keep these in sync with players.ts if the shape changes.

export type Position = 'GK' | 'DF' | 'MF' | 'FW'

export interface PlayerAttributes {
  pace: number
  dribbling: number
  passing: number
  shooting: number
  defending: number
  physicality: number
}

export interface RoleSuitability {
  striker: number
  winger: number
  cam: number
  cm: number
}

export interface ShotMapPoint {
  x: number
  y: number
  outcome: 'goal' | 'on_target' | 'off_target' | 'blocked'
  xg: number
}

export interface Player {
  id: string
  name: string
  shirt_name: string
  team: string
  team_code: string
  position: Position
  number: number
  club: string
  age: number
  height_cm: number
  caps: number
  is_captain?: boolean
  goals: number
  assists: number
  xg: number
  xa: number
  minutes_played: number
  shots: number
  shots_on_target: number
  pass_accuracy: number
  dna_score: number
  attributes: PlayerAttributes
  strengths: string[]
  weaknesses: string[]
  role_suitability: RoleSuitability
  predicted_impact: number
  comparison_players: string[]
  shot_map: ShotMapPoint[]
  form_trend: number[]
}

// Local helpers (duplicated from players.ts for the same reason above)
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
    outcome: (['goal', 'on_target', 'on_target', 'off_target', 'blocked'] as const)[i % 5],
    xg: Number((0.15 + (i % 5) * 0.12).toFixed(2)),
  }))
const mkForm = (peak: number): number[] =>
  Array.from({ length: 8 }, (_, i) => Math.round(peak - 15 + Math.sin(i * 0.9) * 12))

// ════════════════════════════════════════════════════════════
// NORWAY — Group I (verified squad, Ståle Solbakken)
// Real: first WC since 1998. Beat Iraq 4-1, beat Senegal 3-2,
// lost to France 1-4 (rested side). R32 vs Côte d'Ivoire June 30.
// Haaland: 4 goals in group stage, 59 international goals career.
// ════════════════════════════════════════════════════════════
export const NORWAY_PLAYERS: Player[] = [
  {
    id: 'nor-haaland', name: 'Erling Haaland', shirt_name: 'HAALAND',
    team: 'Norway', team_code: 'NOR', position: 'FW', number: 9,
    club: 'Manchester City', age: 25, height_cm: 195, caps: 52,
    goals: 4, assists: 0, xg: 4.1, xa: 0.2, minutes_played: 230,
    shots: 14, shots_on_target: 9, pass_accuracy: 74,
    dna_score: 95,
    attributes: mkAttrs({ pace: 88, dribbling: 78, passing: 70, shooting: 96, defending: 25, physicality: 93 }),
    strengths: ['Lethal one-touch finishing', 'Physical dominance vs centre-backs', 'Norway all-time record scorer at 25'],
    weaknesses: ['Can be isolated if service dries up', 'Limited link-up dropping deep'],
    role_suitability: mkRole({ striker: 97, winger: 15, cam: 20, cm: 5 }),
    predicted_impact: 95,
    comparison_players: ['Harry Kane', 'Victor Osimhen'],
    shot_map: mkShots(13, 52),
    form_trend: mkForm(92),
  },
  {
    id: 'nor-odegaard', name: 'Martin Ødegaard', shirt_name: 'ODEGAARD',
    team: 'Norway', team_code: 'NOR', position: 'MF', number: 8,
    club: 'Arsenal', age: 27, height_cm: 178, caps: 75, is_captain: true,
    goals: 1, assists: 3, xg: 0.9, xa: 2.6, minutes_played: 220,
    shots: 7, shots_on_target: 3, pass_accuracy: 88,
    dna_score: 88,
    attributes: mkAttrs({ pace: 72, dribbling: 86, passing: 90, shooting: 78, defending: 40, physicality: 62 }),
    strengths: ['Creative hub linking midfield to Haaland', 'Premier League title-winning captain pedigree', 'Set-piece delivery'],
    weaknesses: ['Injury-disrupted season affecting tournament sharpness'],
    role_suitability: mkRole({ cam: 92, cm: 65, winger: 35, striker: 20 }),
    predicted_impact: 86,
    comparison_players: ['Bruno Fernandes', 'Florian Wirtz'],
    shot_map: mkShots(6, 50),
    form_trend: mkForm(80),
  },
  {
    id: 'nor-nusa', name: 'Antonio Nusa', shirt_name: 'NUSA',
    team: 'Norway', team_code: 'NOR', position: 'MF', number: 19,
    club: 'RB Leipzig', age: 21, height_cm: 184, caps: 22,
    goals: 1, assists: 2, xg: 1.0, xa: 1.5, minutes_played: 180,
    shots: 6, shots_on_target: 3, pass_accuracy: 80,
    dna_score: 80,
    attributes: mkAttrs({ pace: 90, dribbling: 85, passing: 76, shooting: 73, defending: 35, physicality: 68 }),
    strengths: ['Explosive one-on-one pace', 'High breakout potential off the bench', 'Direct dribbling at defenders'],
    weaknesses: ['Tournament inexperience at 21', 'Final-third decision making still developing'],
    role_suitability: mkRole({ winger: 85, striker: 40, cam: 50, cm: 10 }),
    predicted_impact: 76,
    comparison_players: ['Yan Diomande', 'Rayan Cherki'],
    shot_map: mkShots(5, 53),
    form_trend: mkForm(75),
  },
]

// ════════════════════════════════════════════════════════════
// IVORY COAST — Group E (verified squad, Emerse Faé)
// Real: beat Ecuador 1-0 to open. Plays Germany R32-adjacent
// fixture per official schedule (faces Germany June 20 per source).
// ════════════════════════════════════════════════════════════
export const IVORY_COAST_PLAYERS: Player[] = [
  {
    id: 'civ-kessie', name: 'Franck Kessié', shirt_name: 'KESSIE',
    team: 'Ivory Coast', team_code: 'CIV', position: 'MF', number: 6,
    club: 'Al-Ahli', age: 29, height_cm: 181, caps: 56, is_captain: true,
    goals: 1, assists: 1, xg: 0.8, xa: 0.6, minutes_played: 180,
    shots: 4, shots_on_target: 2, pass_accuracy: 84,
    dna_score: 82,
    attributes: mkAttrs({ pace: 74, dribbling: 76, passing: 81, shooting: 75, defending: 78, physicality: 86 }),
    strengths: ['Box-to-box physical presence', 'Captain leadership of squad', 'Penalty box arrivals from midfield'],
    weaknesses: ['Occasional concentration lapses defensively'],
    role_suitability: mkRole({ cm: 85, cam: 45, striker: 30, winger: 10 }),
    predicted_impact: 79,
    comparison_players: ['Franck Kessié-tier all-action mid', 'Youssouf Fofana'],
    shot_map: mkShots(4, 48),
    form_trend: mkForm(78),
  },
  {
    id: 'civ-diomande-yan', name: 'Yan Diomande', shirt_name: 'Y. DIOMANDE',
    team: 'Ivory Coast', team_code: 'CIV', position: 'FW', number: 11,
    club: 'RB Leipzig', age: 19, height_cm: 178, caps: 6,
    goals: 1, assists: 1, xg: 0.9, xa: 0.5, minutes_played: 90,
    shots: 5, shots_on_target: 3, pass_accuracy: 78,
    dna_score: 81,
    attributes: mkAttrs({ pace: 92, dribbling: 88, passing: 72, shooting: 76, defending: 28, physicality: 65 }),
    strengths: ['Breakout World Cup debut performance', 'Bundesliga-proven explosive dribbling', 'Fearless in 1v1 situations'],
    weaknesses: ['Minimal senior international experience'],
    role_suitability: mkRole({ winger: 88, striker: 45, cam: 40, cm: 10 }),
    predicted_impact: 78,
    comparison_players: ['Antonio Nusa', 'Rayan Cherki'],
    shot_map: mkShots(5, 54),
    form_trend: mkForm(76),
  },
  {
    id: 'civ-singo', name: 'Wilfried Singo', shirt_name: 'SINGO',
    team: 'Ivory Coast', team_code: 'CIV', position: 'DF', number: 5,
    club: 'AS Monaco', age: 24, height_cm: 187, caps: 34,
    goals: 0, assists: 0, xg: 0.2, xa: 0.1, minutes_played: 180,
    shots: 1, shots_on_target: 0, pass_accuracy: 83,
    dna_score: 78,
    attributes: mkAttrs({ pace: 89, dribbling: 70, passing: 75, shooting: 40, defending: 84, physicality: 85 }),
    strengths: ['Elite recovery speed at full-back', 'Physical battles against wingers', 'Attacking overlap threat'],
    weaknesses: ['Positional discipline can lapse high up the pitch'],
    role_suitability: mkRole({ winger: 30, cm: 10, cam: 15, striker: 5 }),
    predicted_impact: 74,
    comparison_players: ['Achraf Hakimi (lower ceiling)', 'Jeremie Frimpong'],
    shot_map: mkShots(2, 50),
    form_trend: mkForm(74),
  },
]

// ════════════════════════════════════════════════════════════
// SWEDEN — Group F (verified squad)
// ════════════════════════════════════════════════════════════
export const SWEDEN_PLAYERS: Player[] = [
  {
    id: 'swe-isak', name: 'Alexander Isak', shirt_name: 'ISAK',
    team: 'Sweden', team_code: 'SWE', position: 'FW', number: 9,
    club: 'Liverpool', age: 26, height_cm: 192, caps: 48,
    goals: 2, assists: 1, xg: 2.3, xa: 0.5, minutes_played: 200,
    shots: 9, shots_on_target: 5, pass_accuracy: 80,
    dna_score: 86,
    attributes: mkAttrs({ pace: 84, dribbling: 84, passing: 76, shooting: 87, defending: 30, physicality: 78 }),
    strengths: ['Elegant movement and finishing', 'Sweden\'s main attacking threat', 'Comfortable in build-up play'],
    weaknesses: ['Limited tournament experience at this level'],
    role_suitability: mkRole({ striker: 90, cam: 35, winger: 25, cm: 10 }),
    predicted_impact: 83,
    comparison_players: ['Viktor Gyökeres', 'Kai Havertz'],
    shot_map: mkShots(8, 52),
    form_trend: mkForm(81),
  },
  {
    id: 'swe-gyokeres', name: 'Viktor Gyökeres', shirt_name: 'GYOKERES',
    team: 'Sweden', team_code: 'SWE', position: 'FW', number: 11,
    club: 'Arsenal', age: 27, height_cm: 191, caps: 30,
    goals: 2, assists: 0, xg: 1.9, xa: 0.3, minutes_played: 150,
    shots: 8, shots_on_target: 4, pass_accuracy: 73,
    dna_score: 84,
    attributes: mkAttrs({ pace: 81, dribbling: 75, passing: 70, shooting: 88, defending: 32, physicality: 87 }),
    strengths: ['Powerful hold-up and physicality', 'Arrives in dangerous areas consistently', 'In red-hot club form'],
    weaknesses: ['Competition with Isak for the same striker role'],
    role_suitability: mkRole({ striker: 91, cam: 25, winger: 20, cm: 5 }),
    predicted_impact: 81,
    comparison_players: ['Romelu Lukaku', 'Alexander Sørloth'],
    shot_map: mkShots(7, 50),
    form_trend: mkForm(82),
  },
  {
    id: 'swe-lindelof', name: 'Victor Lindelöf', shirt_name: 'LINDELOF',
    team: 'Sweden', team_code: 'SWE', position: 'DF', number: 4,
    club: 'Aston Villa', age: 31, height_cm: 187, caps: 95, is_captain: true,
    goals: 0, assists: 0, xg: 0.2, xa: 0.1, minutes_played: 200,
    shots: 2, shots_on_target: 1, pass_accuracy: 87,
    dna_score: 79,
    attributes: mkAttrs({ pace: 70, dribbling: 68, passing: 82, shooting: 35, defending: 84, physicality: 78 }),
    strengths: ['Calm composure under pressure', 'Captain organising young backline', 'Reliable positioning'],
    weaknesses: ['Limited pace against quickest forwards'],
    role_suitability: mkRole({ striker: 0, winger: 0, cam: 5, cm: 20 }),
    predicted_impact: 73,
    comparison_players: ['Jan Vertonghen (veteran tier)', 'Joachim Andersen'],
    shot_map: mkShots(2, 48),
    form_trend: mkForm(75),
  },
]

// ════════════════════════════════════════════════════════════
// PORTUGAL — Group K (verified squad, Roberto Martínez)
// Real: Ronaldo's record 6th World Cup, captain, 143 int'l goals.
// Squad carries a symbolic "+1" place honoring Diogo Jota.
// ════════════════════════════════════════════════════════════
export const PORTUGAL_PLAYERS: Player[] = [
  {
    id: 'por-ronaldo', name: 'Cristiano Ronaldo', shirt_name: 'RONALDO',
    team: 'Portugal', team_code: 'POR', position: 'FW', number: 7,
    club: 'Al-Nassr', age: 41, height_cm: 187, caps: 226, is_captain: true,
    goals: 2, assists: 1, xg: 1.8, xa: 0.7, minutes_played: 230,
    shots: 10, shots_on_target: 5, pass_accuracy: 76,
    dna_score: 85,
    attributes: mkAttrs({ pace: 62, dribbling: 70, passing: 72, shooting: 89, defending: 25, physicality: 75 }),
    strengths: ['All-time record international goalscorer (143)', 'Elite penalty box instincts', 'Unmatched tournament big-game mentality'],
    weaknesses: ['Significantly reduced pace at 41', 'Limited defensive/pressing contribution'],
    role_suitability: mkRole({ striker: 85, cam: 30, winger: 20, cm: 5 }),
    predicted_impact: 80,
    comparison_players: ['Robert Lewandowski (veteran tier)', 'Harry Kane'],
    shot_map: mkShots(9, 51),
    form_trend: mkForm(76),
  },
  {
    id: 'por-fernandes', name: 'Bruno Fernandes', shirt_name: 'B. FERNANDES',
    team: 'Portugal', team_code: 'POR', position: 'MF', number: 8,
    club: 'Manchester United', age: 31, height_cm: 179, caps: 92,
    goals: 2, assists: 4, xg: 1.7, xa: 3.3, minutes_played: 250,
    shots: 9, shots_on_target: 5, pass_accuracy: 85,
    dna_score: 89,
    attributes: mkAttrs({ pace: 73, dribbling: 82, passing: 91, shooting: 83, defending: 50, physicality: 72 }),
    strengths: ['Portugal\'s creative engine and set-piece taker', 'Penalty specialist', 'Links midfield to Ronaldo seamlessly'],
    weaknesses: ['Card-prone due to aggressive pressing style'],
    role_suitability: mkRole({ cam: 90, cm: 65, winger: 30, striker: 35 }),
    predicted_impact: 87,
    comparison_players: ['Kevin De Bruyne', 'Jude Bellingham'],
    shot_map: mkShots(8, 49),
    form_trend: mkForm(85),
  },
  {
    id: 'por-vitinha', name: 'Vitinha', shirt_name: 'VITINHA',
    team: 'Portugal', team_code: 'POR', position: 'MF', number: 16,
    club: 'Paris Saint-Germain', age: 26, height_cm: 172, caps: 38,
    goals: 1, assists: 2, xg: 0.7, xa: 1.6, minutes_played: 240,
    shots: 5, shots_on_target: 2, pass_accuracy: 93,
    dna_score: 87,
    attributes: mkAttrs({ pace: 76, dribbling: 88, passing: 92, shooting: 68, defending: 65, physicality: 60 }),
    strengths: ['Tempo control from deep midfield', 'PSG treble-winning pedigree', 'Press resistance in tight areas'],
    weaknesses: ['Lighter frame can be physically overpowered'],
    role_suitability: mkRole({ cm: 90, cam: 70, winger: 15, striker: 10 }),
    predicted_impact: 84,
    comparison_players: ['Frenkie de Jong', 'Martin Ødegaard'],
    shot_map: mkShots(4, 46),
    form_trend: mkForm(83),
  },
]

// ════════════════════════════════════════════════════════════
// SPAIN — Group H (verified squad, Luis de la Fuente)
// Real: reigning Euro 2024 champions, no Real Madrid players
// selected — notable squad-building decision.
// ════════════════════════════════════════════════════════════
export const SPAIN_PLAYERS: Player[] = [
  {
    id: 'esp-yamal', name: 'Lamine Yamal', shirt_name: 'L. YAMAL',
    team: 'Spain', team_code: 'ESP', position: 'FW', number: 19,
    club: 'Barcelona', age: 18, height_cm: 180, caps: 36,
    goals: 3, assists: 3, xg: 2.4, xa: 2.7, minutes_played: 250,
    shots: 13, shots_on_target: 7, pass_accuracy: 86,
    dna_score: 91,
    attributes: mkAttrs({ pace: 87, dribbling: 94, passing: 86, shooting: 80, defending: 30, physicality: 58 }),
    strengths: ['Generational dribbling at 18', 'Euro 2024 winning pedigree already', 'Fearless in 1v1 situations'],
    weaknesses: ['Tournament fitness/load management questions at his age', 'Can try the spectacular over the simple'],
    role_suitability: mkRole({ winger: 95, cam: 65, striker: 50, cm: 15 }),
    predicted_impact: 90,
    comparison_players: ['Vinícius Júnior', 'Kylian Mbappé'],
    shot_map: mkShots(10, 54),
    form_trend: mkForm(88),
  },
  {
    id: 'esp-pedri', name: 'Pedri', shirt_name: 'PEDRI',
    team: 'Spain', team_code: 'ESP', position: 'MF', number: 26,
    club: 'Barcelona', age: 23, height_cm: 174, caps: 50,
    goals: 1, assists: 3, xg: 0.8, xa: 2.5, minutes_played: 260,
    shots: 6, shots_on_target: 3, pass_accuracy: 92,
    dna_score: 89,
    attributes: mkAttrs({ pace: 75, dribbling: 89, passing: 92, shooting: 70, defending: 60, physicality: 62 }),
    strengths: ['Elite tempo and game control', 'Press resistance in tight spaces', 'Tactical maturity beyond his age'],
    weaknesses: ['Injury history requires careful workload management'],
    role_suitability: mkRole({ cm: 90, cam: 75, winger: 25, striker: 15 }),
    predicted_impact: 86,
    comparison_players: ['Vitinha', 'Frenkie de Jong'],
    shot_map: mkShots(5, 48),
    form_trend: mkForm(85),
  },
  {
    id: 'esp-rodri', name: 'Rodri', shirt_name: 'RODRI',
    team: 'Spain', team_code: 'ESP', position: 'MF', number: 16,
    club: 'Manchester City', age: 29, height_cm: 191, caps: 60,
    goals: 1, assists: 1, xg: 0.6, xa: 0.8, minutes_played: 230,
    shots: 4, shots_on_target: 2, pass_accuracy: 93,
    dna_score: 90,
    attributes: mkAttrs({ pace: 65, dribbling: 78, passing: 92, shooting: 68, defending: 87, physicality: 82 }),
    strengths: ['Ballon d\'Or pedigree defensive midfielder', 'Dictates tempo from deep', 'Reads danger before it develops'],
    weaknesses: ['Returning from long-term injury layoff — minutes managed carefully'],
    role_suitability: mkRole({ cm: 95, cam: 40, winger: 5, striker: 10 }),
    predicted_impact: 88,
    comparison_players: ['Joshua Kimmich', 'Declan Rice'],
    shot_map: mkShots(4, 46),
    form_trend: mkForm(83),
  },
]

// ════════════════════════════════════════════════════════════
// EXTENDED AGGREGATE — combine with ALL_PLAYERS from players.ts
// ════════════════════════════════════════════════════════════
export const ALL_PLAYERS_BATCH2: Player[] = [
  ...NORWAY_PLAYERS,
  ...IVORY_COAST_PLAYERS,
  ...SWEDEN_PLAYERS,
  ...PORTUGAL_PLAYERS,
  ...SPAIN_PLAYERS,
]

export const TEAMS_IN_ROSTER_BATCH2 = [
  'Norway', 'Ivory Coast', 'Sweden', 'Portugal', 'Spain',
]

// ════════════════════════════════════════════════════════════
// USAGE — in players.ts, merge both batches like this:
//
// import { ALL_PLAYERS_BATCH2, TEAMS_IN_ROSTER_BATCH2 } from './players-batch2'
//
// export const ALL_PLAYERS = [
//   ...GERMANY_PLAYERS, ...FRANCE_PLAYERS, ...BRAZIL_PLAYERS,
//   ...ARGENTINA_PLAYERS, ...ENGLAND_PLAYERS, ...NETHERLANDS_PLAYERS,
//   ...MOROCCO_PLAYERS, ...MEXICO_PLAYERS, ...BELGIUM_PLAYERS,
//   ...USA_PLAYERS, ...ALL_PLAYERS_BATCH2,
// ]
//
// export const TEAMS_IN_ROSTER = [
//   ...TEAMS_IN_ROSTER_BATCH1, ...TEAMS_IN_ROSTER_BATCH2,
// ]
// ════════════════════════════════════════════════════════════