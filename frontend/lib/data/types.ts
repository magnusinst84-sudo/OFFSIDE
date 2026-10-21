// ════════════════════════════════════════════════════════════
// OFFSIDE — Legacy World Cup Player Roster Types
// Synthetic, model-generated demo analytics for the World Cup roster.
// ════════════════════════════════════════════════════════════

export type LegacyPosition = 'GK' | 'DF' | 'MF' | 'FW'

export interface LegacyPlayerAttributes {
  pace: number
  dribbling: number
  passing: number
  shooting: number
  defending: number
  physicality: number
}

export interface LegacyRoleSuitability {
  striker: number
  winger: number
  cam: number
  cm: number
}

export interface LegacyShotMapPoint {
  x: number // 0-100, pitch width
  y: number // 0-100, pitch length (half pitch, 50 = edge of box)
  outcome: 'goal' | 'on_target' | 'off_target' | 'blocked'
  xg: number
}

export interface LegacyPlayer {
  id: string
  name: string
  shirt_name: string
  team: string
  team_code: string
  position: LegacyPosition
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
  attributes: LegacyPlayerAttributes
  strengths: string[]
  weaknesses: string[]
  role_suitability: LegacyRoleSuitability
  predicted_impact: number
  comparison_players: string[]
  shot_map: LegacyShotMapPoint[]
  form_trend: number[]
}

// Backwards compatibility aliases if needed
export type Player = LegacyPlayer
export type PlayerAttributes = LegacyPlayerAttributes
export type RoleSuitability = LegacyRoleSuitability
export type ShotMapPoint = LegacyShotMapPoint
export type Position = LegacyPosition
