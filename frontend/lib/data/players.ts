// ════════════════════════════════════════════════════════════
// OFFSIDE — Static Player Roster + DNA Dataset
// ════════════════════════════════════════════════════════════
// Source: Verified real FIFA World Cup 2026 squad lists
// (FIFA official squad PDF, ESPN, Al Jazeera, UEFA, official
//  federation announcements — confirmed June 2026 final 26-man
//  squads). Player names, clubs, positions, captaincy are real.
//
// Stats (goals/assists/xG), DNA scores, attributes, strengths/
// weaknesses, role suitability %, shot maps, and comparisons
// are MODEL-GENERATED for demo purposes — clearly synthetic
// analytics layered on top of real identities. This mirrors
// exactly what a real AI scouting tool would output: real
// player, AI-generated insight.
//
// Teams included match the mock match data in matches.py:
// Germany, Paraguay, Netherlands, Morocco, France, Sweden,
// Brazil, Argentina, Mexico, England, Belgium, USA
// ════════════════════════════════════════════════════════════

import { ALL_PLAYERS_BATCH2, TEAMS_IN_ROSTER_BATCH2 } from './players-batch2'
import { ALL_PLAYERS_BATCH3, TEAMS_IN_ROSTER_BATCH3 } from './players-batch3'
import { ALL_PLAYERS_BATCH4 } from './players-batch4'
import { BATCH5_PLAYERS } from './players-batch5'
import { BATCH6_PLAYERS } from './players-batch6'

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
  x: number // 0-100, pitch width
  y: number // 0-100, pitch length (half pitch, 50 = edge of box)
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
  // Synthetic season stats (demo)
  goals: number
  assists: number
  xg: number
  xa: number
  minutes_played: number
  shots: number
  shots_on_target: number
  pass_accuracy: number
  // AI DNA layer (synthetic)
  dna_score: number
  attributes: PlayerAttributes
  strengths: string[]
  weaknesses: string[]
  role_suitability: RoleSuitability
  predicted_impact: number
  comparison_players: string[]
  shot_map: ShotMapPoint[]
  form_trend: number[] // last 8 data points, 0-100
}

// ────────────────────────────────────────────────────────────
// Helper to keep entries terse below
// ────────────────────────────────────────────────────────────
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
// GERMANY — Group E (verified squad, Julian Nagelsmann)
// Real fixtures: beat Curaçao 7-1, beat Côte d'Ivoire 2-1,
// lost to Ecuador 2-1, plays Paraguay R32 June 29
// ════════════════════════════════════════════════════════════
export const GERMANY_PLAYERS: Player[] = [
  {
    id: 'ger-kimmich', name: 'Joshua Kimmich', shirt_name: 'KIMMICH',
    team: 'Germany', team_code: 'GER', position: 'DF', number: 6,
    club: 'Bayern Munich', age: 31, height_cm: 176, caps: 108, is_captain: true,
    goals: 2, assists: 5, xg: 1.4, xa: 4.1, minutes_played: 270,
    shots: 9, shots_on_target: 4, pass_accuracy: 91,
    dna_score: 89,
    attributes: mkAttrs({ pace: 72, dribbling: 78, passing: 93, shooting: 65, defending: 80, physicality: 75 }),
    strengths: ['Elite tempo control from deep', 'Pinpoint long-range switches', 'Tactical intelligence reading the press'],
    weaknesses: ['Lacks explosive recovery pace', 'Occasionally overcommits going forward'],
    role_suitability: mkRole({ cm: 95, winger: 35, cam: 55, striker: 10 }),
    predicted_impact: 88,
    comparison_players: ['Toni Kroos', 'Rodri'],
    shot_map: mkShots(6, 45),
    form_trend: mkForm(85),
  },
  {
    id: 'ger-musiala', name: 'Jamal Musiala', shirt_name: 'MUSIALA',
    team: 'Germany', team_code: 'GER', position: 'MF', number: 10,
    club: 'Bayern Munich', age: 23, height_cm: 183, caps: 45,
    goals: 3, assists: 2, xg: 2.6, xa: 1.8, minutes_played: 180,
    shots: 14, shots_on_target: 7, pass_accuracy: 87,
    dna_score: 92,
    attributes: mkAttrs({ pace: 85, dribbling: 95, passing: 86, shooting: 80, defending: 35, physicality: 62 }),
    strengths: ['Unpredictable close control in tight spaces', 'Elite first-touch under pressure', 'Disguised through balls'],
    weaknesses: ['Returning from major injury — match sharpness still building', 'Light frame vulnerable to physical defending'],
    role_suitability: mkRole({ cam: 96, winger: 80, cm: 60, striker: 40 }),
    predicted_impact: 93,
    comparison_players: ['Bernardo Silva', 'Florian Wirtz'],
    shot_map: mkShots(8, 55),
    form_trend: mkForm(78),
  },
  {
    id: 'ger-wirtz', name: 'Florian Wirtz', shirt_name: 'WIRTZ',
    team: 'Germany', team_code: 'GER', position: 'MF', number: 17,
    club: 'Liverpool', age: 23, height_cm: 177, caps: 38,
    goals: 1, assists: 3, xg: 1.9, xa: 2.7, minutes_played: 250,
    shots: 11, shots_on_target: 5, pass_accuracy: 84,
    dna_score: 90,
    attributes: mkAttrs({ pace: 78, dribbling: 92, passing: 89, shooting: 78, defending: 32, physicality: 58 }),
    strengths: ['Vision for the final pass', 'Composure in the box', 'Set-piece delivery'],
    weaknesses: ['Inconsistent Premier League form this season', 'Press resistance under heavy contact'],
    role_suitability: mkRole({ cam: 94, winger: 70, cm: 55, striker: 35 }),
    predicted_impact: 87,
    comparison_players: ['Kevin De Bruyne', 'Jamal Musiala'],
    shot_map: mkShots(7, 50),
    form_trend: mkForm(72),
  },
  {
    id: 'ger-havertz', name: 'Kai Havertz', shirt_name: 'HAVERTZ',
    team: 'Germany', team_code: 'GER', position: 'FW', number: 9,
    club: 'Arsenal', age: 27, height_cm: 193, caps: 56,
    goals: 4, assists: 1, xg: 3.5, xa: 0.6, minutes_played: 240,
    shots: 15, shots_on_target: 9, pass_accuracy: 79,
    dna_score: 84,
    attributes: mkAttrs({ pace: 68, dribbling: 72, passing: 75, shooting: 86, defending: 40, physicality: 80 }),
    strengths: ['Aerial threat in the box', 'Composed finishing under pressure', 'Link-up play dropping deep'],
    weaknesses: ['Lacks pure pace in behind', 'Injury-prone across 2025-26 season'],
    role_suitability: mkRole({ striker: 90, cam: 60, winger: 30, cm: 25 }),
    predicted_impact: 85,
    comparison_players: ['Harry Kane', 'Joshua Zirkzee'],
    shot_map: mkShots(9, 50),
    form_trend: mkForm(80),
  },
  {
    id: 'ger-neuer', name: 'Manuel Neuer', shirt_name: 'NEUER',
    team: 'Germany', team_code: 'GER', position: 'GK', number: 1,
    club: 'Bayern Munich', age: 40, height_cm: 193, caps: 124,
    goals: 0, assists: 0, xg: 0, xa: 0.1, minutes_played: 270,
    shots: 0, shots_on_target: 0, pass_accuracy: 88,
    dna_score: 86,
    attributes: mkAttrs({ pace: 45, dribbling: 55, passing: 84, shooting: 20, defending: 91, physicality: 70 }),
    strengths: ['Elite sweeper-keeper positioning', 'Composure with ball at feet', 'Tournament big-game experience'],
    weaknesses: ['Reduced reflex speed at 40', 'Reduced mobility for one-on-ones'],
    role_suitability: mkRole({ striker: 0, winger: 0, cam: 0, cm: 0 }),
    predicted_impact: 76,
    comparison_players: ['Marc-André ter Stegen', 'Yann Sommer'],
    shot_map: [],
    form_trend: mkForm(80),
  },
  {
    id: 'ger-rudiger', name: 'Antonio Rüdiger', shirt_name: 'RUDIGER',
    team: 'Germany', team_code: 'GER', position: 'DF', number: 2,
    club: 'Real Madrid', age: 33, height_cm: 190, caps: 84,
    goals: 1, assists: 0, xg: 0.4, xa: 0.1, minutes_played: 260,
    shots: 3, shots_on_target: 1, pass_accuracy: 89,
    dna_score: 85,
    attributes: mkAttrs({ pace: 75, dribbling: 65, passing: 78, shooting: 45, defending: 92, physicality: 88 }),
    strengths: ['Dominant in 1v1 duels', 'Aggressive ball-winning', 'Vice-captain leadership'],
    weaknesses: ['Occasional positional indiscipline pushing up', 'Card accumulation risk'],
    role_suitability: mkRole({ striker: 5, winger: 5, cam: 10, cm: 30 }),
    predicted_impact: 82,
    comparison_players: ['William Saliba', 'Dayot Upamecano'],
    shot_map: mkShots(3, 50),
    form_trend: mkForm(83),
  },
]

// ════════════════════════════════════════════════════════════
// FRANCE — Group I (verified squad)
// ════════════════════════════════════════════════════════════
export const FRANCE_PLAYERS: Player[] = [
  {
    id: 'fra-mbappe', name: 'Kylian Mbappé', shirt_name: 'MBAPPE',
    team: 'France', team_code: 'FRA', position: 'FW', number: 10,
    club: 'Real Madrid', age: 27, height_cm: 178, caps: 96, is_captain: true,
    goals: 5, assists: 2, xg: 4.3, xa: 1.7, minutes_played: 270,
    shots: 18, shots_on_target: 11, pass_accuracy: 82,
    dna_score: 96,
    attributes: mkAttrs({ pace: 97, dribbling: 93, passing: 81, shooting: 92, defending: 30, physicality: 76 }),
    strengths: ['Explosive pace in transition', 'Clinical one-on-one finishing', 'Big-tournament composure'],
    weaknesses: ['Drops deep at times, disrupting attacking shape', 'Can be isolated against low blocks'],
    role_suitability: mkRole({ striker: 92, winger: 88, cam: 50, cm: 15 }),
    predicted_impact: 97,
    comparison_players: ['Vinícius Júnior', 'Erling Haaland'],
    shot_map: mkShots(12, 55),
    form_trend: mkForm(94),
  },
  {
    id: 'fra-tchouameni', name: 'Aurélien Tchouaméni', shirt_name: 'TCHOUAMENI',
    team: 'France', team_code: 'FRA', position: 'MF', number: 8,
    club: 'Real Madrid', age: 26, height_cm: 187, caps: 52,
    goals: 1, assists: 1, xg: 0.7, xa: 0.9, minutes_played: 270,
    shots: 5, shots_on_target: 2, pass_accuracy: 90,
    dna_score: 86,
    attributes: mkAttrs({ pace: 74, dribbling: 75, passing: 87, shooting: 60, defending: 86, physicality: 84 }),
    strengths: ['Defensive screen breaking up play', 'Progressive passing range', 'Physical dominance in midfield duels'],
    weaknesses: ['Occasional rash positioning leaves space behind'],
    role_suitability: mkRole({ cm: 92, cam: 45, winger: 10, striker: 10 }),
    predicted_impact: 84,
    comparison_players: ['Declan Rice', 'Joshua Kimmich'],
    shot_map: mkShots(4, 45),
    form_trend: mkForm(82),
  },
  {
    id: 'fra-saliba', name: 'William Saliba', shirt_name: 'SALIBA',
    team: 'France', team_code: 'FRA', position: 'DF', number: 17,
    club: 'Arsenal', age: 25, height_cm: 192, caps: 32,
    goals: 0, assists: 0, xg: 0.3, xa: 0.1, minutes_played: 270,
    shots: 2, shots_on_target: 1, pass_accuracy: 92,
    dna_score: 87,
    attributes: mkAttrs({ pace: 81, dribbling: 70, passing: 84, shooting: 35, defending: 93, physicality: 85 }),
    strengths: ['Elite recovery pace', 'Reading of attacking transitions', 'Aerial command'],
    weaknesses: ['Can be drawn out of position by movement runners'],
    role_suitability: mkRole({ striker: 0, winger: 0, cam: 5, cm: 20 }),
    predicted_impact: 80,
    comparison_players: ['Antonio Rüdiger', 'Jonathan Tah'],
    shot_map: mkShots(2, 50),
    form_trend: mkForm(85),
  },
  {
    id: 'fra-dembele', name: 'Ousmane Dembélé', shirt_name: 'DEMBELE',
    team: 'France', team_code: 'FRA', position: 'FW', number: 7,
    club: 'Paris Saint-Germain', age: 29, height_cm: 178, caps: 50,
    goals: 2, assists: 4, xg: 2.1, xa: 3.2, minutes_played: 230,
    shots: 13, shots_on_target: 6, pass_accuracy: 83,
    dna_score: 88,
    attributes: mkAttrs({ pace: 91, dribbling: 92, passing: 80, shooting: 78, defending: 32, physicality: 68 }),
    strengths: ['Unpredictable dribbling at pace', 'Creates chances from wide areas', 'Reigning Ballon d\'Or pedigree'],
    weaknesses: ['Injury history limits consistent availability', 'Decision-making in final third can be erratic'],
    role_suitability: mkRole({ winger: 93, striker: 55, cam: 60, cm: 15 }),
    predicted_impact: 89,
    comparison_players: ['Bukayo Saka', 'Rafael Leão'],
    shot_map: mkShots(9, 50),
    form_trend: mkForm(86),
  },
]

// ════════════════════════════════════════════════════════════
// BRAZIL — Group C (verified squad, Carlo Ancelotti)
// ════════════════════════════════════════════════════════════
export const BRAZIL_PLAYERS: Player[] = [
  {
    id: 'bra-vinicius', name: 'Vinícius Júnior', shirt_name: 'VINICIUS JR',
    team: 'Brazil', team_code: 'BRA', position: 'FW', number: 7,
    club: 'Real Madrid', age: 25, height_cm: 176, caps: 42,
    goals: 3, assists: 2, xg: 2.8, xa: 1.9, minutes_played: 240,
    shots: 13, shots_on_target: 7, pass_accuracy: 81,
    dna_score: 93,
    attributes: mkAttrs({ pace: 95, dribbling: 94, passing: 79, shooting: 85, defending: 28, physicality: 70 }),
    strengths: ['Explosive dribbling at full speed', 'Cuts inside onto strong foot dangerously', 'High-pressure tournament temperament'],
    weaknesses: ['Final product can be inconsistent in big moments', 'Tendency to drift out of games when frustrated'],
    role_suitability: mkRole({ winger: 94, striker: 65, cam: 45, cm: 10 }),
    predicted_impact: 92,
    comparison_players: ['Kylian Mbappé', 'Rafael Leão'],
    shot_map: mkShots(10, 55),
    form_trend: mkForm(88),
  },
  {
    id: 'bra-raphinha', name: 'Raphinha', shirt_name: 'RAPHINHA',
    team: 'Brazil', team_code: 'BRA', position: 'FW', number: 11,
    club: 'Barcelona', age: 29, height_cm: 176, caps: 38,
    goals: 2, assists: 3, xg: 2.0, xa: 2.6, minutes_played: 250,
    shots: 11, shots_on_target: 6, pass_accuracy: 84,
    dna_score: 89,
    attributes: mkAttrs({ pace: 86, dribbling: 87, passing: 84, shooting: 80, defending: 38, physicality: 72 }),
    strengths: ['Direct running with end product', 'Reliable from set pieces', 'Tracks back defensively unlike most wingers'],
    weaknesses: ['Can overplay in tight areas under pressure'],
    role_suitability: mkRole({ winger: 90, striker: 50, cam: 55, cm: 15 }),
    predicted_impact: 87,
    comparison_players: ['Bukayo Saka', 'Michael Olise'],
    shot_map: mkShots(8, 50),
    form_trend: mkForm(84),
  },
  {
    id: 'bra-neymar', name: 'Neymar', shirt_name: 'NEYMAR',
    team: 'Brazil', team_code: 'BRA', position: 'FW', number: 9,
    club: 'Santos', age: 34, height_cm: 175, caps: 134,
    goals: 1, assists: 2, xg: 1.3, xa: 1.8, minutes_played: 150,
    shots: 7, shots_on_target: 3, pass_accuracy: 86,
    dna_score: 81,
    attributes: mkAttrs({ pace: 68, dribbling: 90, passing: 86, shooting: 75, defending: 25, physicality: 60 }),
    strengths: ['Elite vision and creativity in tight spaces', 'Tournament experience and big-game pedigree', 'Free-kick specialist'],
    weaknesses: ['Recent injury history limits sharpness', 'Reduced pace compared to peak years'],
    role_suitability: mkRole({ cam: 85, winger: 70, striker: 45, cm: 30 }),
    predicted_impact: 78,
    comparison_players: ['Lionel Messi', 'Ángel Di María'],
    shot_map: mkShots(5, 50),
    form_trend: mkForm(70),
  },
  {
    id: 'bra-marquinhos', name: 'Marquinhos', shirt_name: 'MARQUINHOS',
    team: 'Brazil', team_code: 'BRA', position: 'DF', number: 4,
    club: 'Paris Saint-Germain', age: 31, height_cm: 183, caps: 96, is_captain: true,
    goals: 1, assists: 0, xg: 0.5, xa: 0.1, minutes_played: 250,
    shots: 3, shots_on_target: 2, pass_accuracy: 90,
    dna_score: 85,
    attributes: mkAttrs({ pace: 76, dribbling: 74, passing: 85, shooting: 50, defending: 89, physicality: 80 }),
    strengths: ['Composed ball-playing from the back', 'Strong tactical reading of the game', 'Captain leadership and organisation'],
    weaknesses: ['Lacks elite recovery pace against fastest forwards'],
    role_suitability: mkRole({ striker: 5, winger: 5, cam: 10, cm: 35 }),
    predicted_impact: 81,
    comparison_players: ['Rúben Dias', 'Éder Militão'],
    shot_map: mkShots(3, 50),
    form_trend: mkForm(82),
  },
]

// ════════════════════════════════════════════════════════════
// ARGENTINA — Group J (verified squad, defending champions)
// ════════════════════════════════════════════════════════════
export const ARGENTINA_PLAYERS: Player[] = [
  {
    id: 'arg-messi', name: 'Lionel Messi', shirt_name: 'MESSI',
    team: 'Argentina', team_code: 'ARG', position: 'FW', number: 10,
    club: 'Inter Miami', age: 38, height_cm: 170, caps: 196, is_captain: true,
    goals: 3, assists: 4, xg: 2.4, xa: 3.5, minutes_played: 240,
    shots: 12, shots_on_target: 7, pass_accuracy: 88,
    dna_score: 94,
    attributes: mkAttrs({ pace: 62, dribbling: 92, passing: 90, shooting: 86, defending: 25, physicality: 55 }),
    strengths: ['Unmatched game intelligence and vision', 'Set-piece and free-kick mastery', 'Defending World Cup champion experience'],
    weaknesses: ['Reduced top-speed at 38', 'Limited defensive contribution off the ball'],
    role_suitability: mkRole({ cam: 90, striker: 60, winger: 65, cm: 35 }),
    predicted_impact: 91,
    comparison_players: ['Neymar', 'Kevin De Bruyne'],
    shot_map: mkShots(9, 50),
    form_trend: mkForm(86),
  },
  {
    id: 'arg-martinez', name: 'Lautaro Martínez', shirt_name: 'L. MARTINEZ',
    team: 'Argentina', team_code: 'ARG', position: 'FW', number: 22,
    club: 'Inter Milan', age: 28, height_cm: 174, caps: 65,
    goals: 4, assists: 1, xg: 3.6, xa: 0.7, minutes_played: 260,
    shots: 16, shots_on_target: 10, pass_accuracy: 78,
    dna_score: 87,
    attributes: mkAttrs({ pace: 82, dribbling: 80, passing: 74, shooting: 88, defending: 38, physicality: 78 }),
    strengths: ['Clinical movement in the box', 'High work-rate pressing from the front', 'Aerial threat on crosses'],
    weaknesses: ['Can drift offside chasing through balls'],
    role_suitability: mkRole({ striker: 93, winger: 25, cam: 30, cm: 10 }),
    predicted_impact: 86,
    comparison_players: ['Harry Kane', 'Victor Osimhen'],
    shot_map: mkShots(11, 52),
    form_trend: mkForm(85),
  },
  {
    id: 'arg-emimartinez', name: 'Emiliano Martínez', shirt_name: 'E. MARTINEZ',
    team: 'Argentina', team_code: 'ARG', position: 'GK', number: 23,
    club: 'Aston Villa', age: 33, height_cm: 195, caps: 58,
    goals: 0, assists: 0, xg: 0, xa: 0, minutes_played: 270,
    shots: 0, shots_on_target: 0, pass_accuracy: 76,
    dna_score: 88,
    attributes: mkAttrs({ pace: 50, dribbling: 50, passing: 75, shooting: 15, defending: 90, physicality: 78 }),
    strengths: ['Penalty shootout specialist', 'Elite shot-stopping reflexes', 'Vocal organiser of the back line'],
    weaknesses: ['Aggressive sweeping style occasionally exposes space'],
    role_suitability: mkRole({ striker: 0, winger: 0, cam: 0, cm: 0 }),
    predicted_impact: 84,
    comparison_players: ['Manuel Neuer', 'Thibaut Courtois'],
    shot_map: [],
    form_trend: mkForm(87),
  },
]

// ════════════════════════════════════════════════════════════
// ENGLAND — Group L (verified squad, Thomas Tuchel)
// ════════════════════════════════════════════════════════════
export const ENGLAND_PLAYERS: Player[] = [
  {
    id: 'eng-rice', name: 'Declan Rice', shirt_name: 'RICE',
    team: 'England', team_code: 'ENG', position: 'MF', number: 4,
    club: 'Arsenal', age: 27, height_cm: 185, caps: 64,
    goals: 1, assists: 2, xg: 0.8, xa: 1.6, minutes_played: 270,
    shots: 6, shots_on_target: 3, pass_accuracy: 89,
    dna_score: 88,
    attributes: mkAttrs({ pace: 73, dribbling: 78, passing: 87, shooting: 68, defending: 88, physicality: 84 }),
    strengths: ['Box-to-box engine controlling tempo', 'Elite defensive screen positioning', 'Leadership and consistency'],
    weaknesses: ['Occasionally caught upfield on counters'],
    role_suitability: mkRole({ cm: 93, cam: 50, winger: 10, striker: 10 }),
    predicted_impact: 87,
    comparison_players: ['Aurélien Tchouaméni', 'Rodri'],
    shot_map: mkShots(5, 48),
    form_trend: mkForm(85),
  },
  {
    id: 'eng-bellingham', name: 'Jude Bellingham', shirt_name: 'BELLINGHAM',
    team: 'England', team_code: 'ENG', position: 'MF', number: 10,
    club: 'Real Madrid', age: 22, height_cm: 186, caps: 44,
    goals: 3, assists: 2, xg: 2.2, xa: 1.7, minutes_played: 260,
    shots: 12, shots_on_target: 6, pass_accuracy: 85,
    dna_score: 91,
    attributes: mkAttrs({ pace: 80, dribbling: 86, passing: 85, shooting: 82, defending: 60, physicality: 82 }),
    strengths: ['Box-crashing late runs', 'Two-way midfield contribution', 'Big-moment composure beyond his years'],
    weaknesses: ['Can be reckless in challenges, drawing cards'],
    role_suitability: mkRole({ cam: 90, cm: 75, striker: 45, winger: 30 }),
    predicted_impact: 90,
    comparison_players: ['Kevin De Bruyne', 'Frenkie de Jong'],
    shot_map: mkShots(9, 52),
    form_trend: mkForm(88),
  },
  {
    id: 'eng-kane', name: 'Harry Kane', shirt_name: 'KANE',
    team: 'England', team_code: 'ENG', position: 'FW', number: 9,
    club: 'Bayern Munich', age: 32, height_cm: 188, caps: 108, is_captain: true,
    goals: 5, assists: 1, xg: 4.0, xa: 0.8, minutes_played: 270,
    shots: 17, shots_on_target: 10, pass_accuracy: 80,
    dna_score: 92,
    attributes: mkAttrs({ pace: 70, dribbling: 75, passing: 82, shooting: 92, defending: 35, physicality: 82 }),
    strengths: ['Clinical finishing from any angle', 'Elite hold-up play and link-up', 'England all-time record scorer'],
    weaknesses: ['Lacks top-end pace in behind defensive lines'],
    role_suitability: mkRole({ striker: 96, cam: 45, winger: 15, cm: 15 }),
    predicted_impact: 93,
    comparison_players: ['Robert Lewandowski', 'Lautaro Martínez'],
    shot_map: mkShots(13, 50),
    form_trend: mkForm(89),
  },
]

// ════════════════════════════════════════════════════════════
// NETHERLANDS — Group F (verified squad)
// ════════════════════════════════════════════════════════════
export const NETHERLANDS_PLAYERS: Player[] = [
  {
    id: 'ned-vandijk', name: 'Virgil van Dijk', shirt_name: 'VAN DIJK',
    team: 'Netherlands', team_code: 'NED', position: 'DF', number: 4,
    club: 'Liverpool', age: 34, height_cm: 195, caps: 91, is_captain: true,
    goals: 1, assists: 0, xg: 0.6, xa: 0.1, minutes_played: 270,
    shots: 4, shots_on_target: 2, pass_accuracy: 91,
    dna_score: 89,
    attributes: mkAttrs({ pace: 73, dribbling: 70, passing: 86, shooting: 55, defending: 94, physicality: 90 }),
    strengths: ['Commanding aerial presence', 'Reads attacking play exceptionally', 'Captain organising the defensive line'],
    weaknesses: ['Recovery pace declining slightly with age'],
    role_suitability: mkRole({ striker: 5, winger: 0, cam: 10, cm: 25 }),
    predicted_impact: 85,
    comparison_players: ['Rúben Dias', 'William Saliba'],
    shot_map: mkShots(4, 48),
    form_trend: mkForm(86),
  },
  {
    id: 'ned-degjong', name: 'Frenkie de Jong', shirt_name: 'DE JONG',
    team: 'Netherlands', team_code: 'NED', position: 'MF', number: 21,
    club: 'Barcelona', age: 28, height_cm: 180, caps: 60,
    goals: 1, assists: 3, xg: 0.9, xa: 2.4, minutes_played: 250,
    shots: 6, shots_on_target: 3, pass_accuracy: 92,
    dna_score: 88,
    attributes: mkAttrs({ pace: 76, dribbling: 88, passing: 90, shooting: 65, defending: 70, physicality: 68 }),
    strengths: ['Press resistance under heavy pressure', 'Progressive ball carrying through midfield', 'Tactical versatility'],
    weaknesses: ['Injury-prone in recent seasons'],
    role_suitability: mkRole({ cm: 92, cam: 65, winger: 15, striker: 10 }),
    predicted_impact: 85,
    comparison_players: ['Jude Bellingham', 'Pedri'],
    shot_map: mkShots(6, 48),
    form_trend: mkForm(83),
  },
  {
    id: 'ned-depay', name: 'Memphis Depay', shirt_name: 'DEPAY',
    team: 'Netherlands', team_code: 'NED', position: 'FW', number: 9,
    club: 'Corinthians', age: 32, height_cm: 176, caps: 102,
    goals: 3, assists: 1, xg: 2.4, xa: 0.6, minutes_played: 240,
    shots: 11, shots_on_target: 6, pass_accuracy: 78,
    dna_score: 83,
    attributes: mkAttrs({ pace: 80, dribbling: 84, passing: 80, shooting: 84, defending: 30, physicality: 75 }),
    strengths: ['Versatile movement across the front line', 'Dead-ball specialist', 'Netherlands all-time top scorer pedigree'],
    weaknesses: ['Decision-making consistency varies'],
    role_suitability: mkRole({ striker: 80, winger: 65, cam: 55, cm: 15 }),
    predicted_impact: 80,
    comparison_players: ['Memphis-tier — Dušan Vlahović', 'Randal Kolo Muani'],
    shot_map: mkShots(8, 50),
    form_trend: mkForm(78),
  },
]

// ════════════════════════════════════════════════════════════
// MOROCCO — Group C (verified squad, Mohamed Ouahbi)
// ════════════════════════════════════════════════════════════
export const MOROCCO_PLAYERS: Player[] = [
  {
    id: 'mar-hakimi', name: 'Achraf Hakimi', shirt_name: 'HAKIMI',
    team: 'Morocco', team_code: 'MAR', position: 'DF', number: 2,
    club: 'Paris Saint-Germain', age: 27, height_cm: 181, caps: 95, is_captain: true,
    goals: 1, assists: 2, xg: 0.7, xa: 1.5, minutes_played: 270,
    shots: 5, shots_on_target: 3, pass_accuracy: 87,
    dna_score: 89,
    attributes: mkAttrs({ pace: 93, dribbling: 86, passing: 83, shooting: 70, defending: 78, physicality: 76 }),
    strengths: ['Explosive overlapping runs', 'Champions League winning pedigree', 'Captain leadership of historic squad'],
    weaknesses: ['Defensive recovery stretched when caught upfield'],
    role_suitability: mkRole({ winger: 60, cm: 20, cam: 30, striker: 10 }),
    predicted_impact: 88,
    comparison_players: ['Trent Alexander-Arnold', 'Theo Hernández'],
    shot_map: mkShots(6, 52),
    form_trend: mkForm(87),
  },
  {
    id: 'mar-diaz', name: 'Brahim Díaz', shirt_name: 'BRAHIM',
    team: 'Morocco', team_code: 'MAR', position: 'MF', number: 21,
    club: 'Real Madrid', age: 26, height_cm: 171, caps: 22,
    goals: 2, assists: 2, xg: 1.6, xa: 1.4, minutes_played: 230,
    shots: 9, shots_on_target: 5, pass_accuracy: 86,
    dna_score: 86,
    attributes: mkAttrs({ pace: 82, dribbling: 89, passing: 85, shooting: 79, defending: 30, physicality: 60 }),
    strengths: ['AFCON 2025 top scorer pedigree', 'Creative spark in tight spaces', 'Composed in big moments'],
    weaknesses: ['History of missing high-pressure penalties'],
    role_suitability: mkRole({ cam: 88, winger: 75, striker: 45, cm: 25 }),
    predicted_impact: 85,
    comparison_players: ['Bernardo Silva', 'Brahim-tier creative No.10'],
    shot_map: mkShots(7, 50),
    form_trend: mkForm(83),
  },
  {
    id: 'mar-bounou', name: 'Yassine Bounou', shirt_name: 'BOUNOU',
    team: 'Morocco', team_code: 'MAR', position: 'GK', number: 1,
    club: 'Al-Hilal', age: 35, height_cm: 192, caps: 67,
    goals: 0, assists: 0, xg: 0, xa: 0, minutes_played: 270,
    shots: 0, shots_on_target: 0, pass_accuracy: 81,
    dna_score: 87,
    attributes: mkAttrs({ pace: 48, dribbling: 55, passing: 79, shooting: 15, defending: 90, physicality: 75 }),
    strengths: ['2022 semi-final tournament experience', 'Excellent distribution starting attacks', 'Composed under sustained pressure'],
    weaknesses: ['Reduced explosiveness for reaction saves at 35'],
    role_suitability: mkRole({ striker: 0, winger: 0, cam: 0, cm: 0 }),
    predicted_impact: 83,
    comparison_players: ['Mike Maignan', 'Emiliano Martínez'],
    shot_map: [],
    form_trend: mkForm(84),
  },
]

// ════════════════════════════════════════════════════════════
// MEXICO — Group A (verified squad, hosts)
// ════════════════════════════════════════════════════════════
export const MEXICO_PLAYERS: Player[] = [
  {
    id: 'mex-alvarez', name: 'Edson Álvarez', shirt_name: 'ALVAREZ',
    team: 'Mexico', team_code: 'MEX', position: 'MF', number: 4,
    club: 'Fenerbahçe', age: 27, height_cm: 187, caps: 78, is_captain: true,
    goals: 1, assists: 1, xg: 0.6, xa: 0.7, minutes_played: 270,
    shots: 4, shots_on_target: 2, pass_accuracy: 86,
    dna_score: 83,
    attributes: mkAttrs({ pace: 70, dribbling: 72, passing: 82, shooting: 60, defending: 87, physicality: 86 }),
    strengths: ['Defensive midfield anchor', 'Home tournament leadership', 'Aerial duels won'],
    weaknesses: ['Limited creative output going forward'],
    role_suitability: mkRole({ cm: 88, cam: 25, winger: 5, striker: 10 }),
    predicted_impact: 80,
    comparison_players: ['Casemiro', 'Manuel Ugarte'],
    shot_map: mkShots(3, 45),
    form_trend: mkForm(80),
  },
  {
    id: 'mex-ochoa', name: 'Guillermo Ochoa', shirt_name: 'OCHOA',
    team: 'Mexico', team_code: 'MEX', position: 'GK', number: 13,
    club: 'AEL Limassol', age: 40, height_cm: 183, caps: 145,
    goals: 0, assists: 0, xg: 0, xa: 0, minutes_played: 180,
    shots: 0, shots_on_target: 0, pass_accuracy: 75,
    dna_score: 76,
    attributes: mkAttrs({ pace: 40, dribbling: 50, passing: 72, shooting: 10, defending: 82, physicality: 70 }),
    strengths: ['Veteran World Cup big-game experience', 'Vocal organiser of young back line'],
    weaknesses: ['Reduced reflexes — likely rotation option at 40'],
    role_suitability: mkRole({ striker: 0, winger: 0, cam: 0, cm: 0 }),
    predicted_impact: 68,
    comparison_players: ['Manuel Neuer (veteran tier)', 'Tim Howard (historical)'],
    shot_map: [],
    form_trend: mkForm(65),
  },
]

// ════════════════════════════════════════════════════════════
// BELGIUM — Group G (verified squad)
// ════════════════════════════════════════════════════════════
export const BELGIUM_PLAYERS: Player[] = [
  {
    id: 'bel-debruyne', name: 'Kevin De Bruyne', shirt_name: 'DE BRUYNE',
    team: 'Belgium', team_code: 'BEL', position: 'MF', number: 7,
    club: 'Napoli', age: 34, height_cm: 181, caps: 108, is_captain: true,
    goals: 2, assists: 5, xg: 1.5, xa: 4.2, minutes_played: 240,
    shots: 8, shots_on_target: 4, pass_accuracy: 89,
    dna_score: 90,
    attributes: mkAttrs({ pace: 68, dribbling: 84, passing: 95, shooting: 82, defending: 40, physicality: 70 }),
    strengths: ['Generational passing range and vision', 'Set-piece delivery', 'Big-moment goal contributions'],
    weaknesses: ['Reduced pace and durability at 34'],
    role_suitability: mkRole({ cam: 93, cm: 75, winger: 40, striker: 25 }),
    predicted_impact: 88,
    comparison_players: ['Florian Wirtz', 'Bruno Fernandes'],
    shot_map: mkShots(7, 48),
    form_trend: mkForm(85),
  },
  {
    id: 'bel-lukaku', name: 'Romelu Lukaku', shirt_name: 'LUKAKU',
    team: 'Belgium', team_code: 'BEL', position: 'FW', number: 9,
    club: 'Napoli', age: 33, height_cm: 191, caps: 124,
    goals: 3, assists: 1, xg: 2.7, xa: 0.5, minutes_played: 230,
    shots: 12, shots_on_target: 7, pass_accuracy: 76,
    dna_score: 84,
    attributes: mkAttrs({ pace: 73, dribbling: 76, passing: 73, shooting: 85, defending: 30, physicality: 90 }),
    strengths: ['Physical dominance holding up play', 'Belgium all-time top scorer', 'Strong finishing in the box'],
    weaknesses: ['Lost a step in pure speed compared to peak years'],
    role_suitability: mkRole({ striker: 90, winger: 25, cam: 35, cm: 10 }),
    predicted_impact: 82,
    comparison_players: ['Kai Havertz', 'Victor Osimhen'],
    shot_map: mkShots(9, 50),
    form_trend: mkForm(80),
  },
]

// ════════════════════════════════════════════════════════════
// USA — Group D (verified squad, hosts)
// ════════════════════════════════════════════════════════════
export const USA_PLAYERS: Player[] = [
  {
    id: 'usa-pulisic', name: 'Christian Pulisic', shirt_name: 'PULISIC',
    team: 'United States', team_code: 'USA', position: 'FW', number: 10,
    club: 'AC Milan', age: 27, height_cm: 173, caps: 78, is_captain: true,
    goals: 3, assists: 2, xg: 2.1, xa: 1.6, minutes_played: 260,
    shots: 11, shots_on_target: 6, pass_accuracy: 83,
    dna_score: 87,
    attributes: mkAttrs({ pace: 84, dribbling: 87, passing: 81, shooting: 80, defending: 35, physicality: 65 }),
    strengths: ['Home tournament focal point', 'Direct dribbling beating defenders', 'USA all-time leading scorer pedigree'],
    weaknesses: ['Can be shut down by physical double-teams'],
    role_suitability: mkRole({ winger: 85, cam: 65, striker: 55, cm: 15 }),
    predicted_impact: 86,
    comparison_players: ['Raphinha', 'Bukayo Saka'],
    shot_map: mkShots(8, 50),
    form_trend: mkForm(84),
  },
  {
    id: 'usa-mckennie', name: 'Weston McKennie', shirt_name: 'MCKENNIE',
    team: 'United States', team_code: 'USA', position: 'MF', number: 8,
    club: 'Juventus', age: 27, height_cm: 185, caps: 60,
    goals: 2, assists: 1, xg: 1.4, xa: 0.8, minutes_played: 250,
    shots: 7, shots_on_target: 4, pass_accuracy: 84,
    dna_score: 82,
    attributes: mkAttrs({ pace: 76, dribbling: 75, passing: 80, shooting: 72, defending: 72, physicality: 82 }),
    strengths: ['Box-to-box energy and late runs', 'Aerial threat from midfield', 'Versatile across midfield roles'],
    weaknesses: ['Defensive positioning discipline inconsistent'],
    role_suitability: mkRole({ cm: 80, cam: 55, winger: 20, striker: 25 }),
    predicted_impact: 78,
    comparison_players: ['Jude Bellingham (lower ceiling)', 'Frenkie de Jong'],
    shot_map: mkShots(5, 50),
    form_trend: mkForm(76),
  },
]

// ════════════════════════════════════════════════════════════
// AGGREGATE ROSTER — export for /players list page
// ════════════════════════════════════════════════════════════
export const ALL_PLAYERS: Player[] = [
  ...GERMANY_PLAYERS,
  ...FRANCE_PLAYERS,
  ...BRAZIL_PLAYERS,
  ...ARGENTINA_PLAYERS,
  ...ENGLAND_PLAYERS,
  ...NETHERLANDS_PLAYERS,
  ...MOROCCO_PLAYERS,
  ...MEXICO_PLAYERS,
  ...BELGIUM_PLAYERS,
  ...USA_PLAYERS,
  ...ALL_PLAYERS_BATCH2,
  ...ALL_PLAYERS_BATCH3,
  ...ALL_PLAYERS_BATCH4,
  ...BATCH5_PLAYERS,
  ...BATCH6_PLAYERS,
]

// ────────────────────────────────────────────────────────────
// Helper lookups — use these in /players and /player/[id]
// ────────────────────────────────────────────────────────────
export const getPlayerById = (id: string): Player | undefined =>
  ALL_PLAYERS.find(p => p.id === id)

export const searchPlayersLocal = (query: string): Player[] => {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return ALL_PLAYERS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.team.toLowerCase().includes(q) ||
    p.club.toLowerCase().includes(q)
  ).slice(0, 8)
}

export const getPlayersByTeam = (teamCode: string): Player[] =>
  ALL_PLAYERS.filter(p => p.team_code === teamCode)

export const TEAMS_IN_ROSTER = [
  'Germany', 'France', 'Brazil', 'Argentina', 'England',
  'Netherlands', 'Morocco', 'Mexico', 'Belgium', 'United States',
  ...TEAMS_IN_ROSTER_BATCH2,
  ...TEAMS_IN_ROSTER_BATCH3,
]