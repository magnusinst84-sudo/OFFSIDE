export interface PredictResponse {
  home_team: string
  away_team: string
  home_win_prob: number
  draw_prob: number
  away_win_prob: number
  win_probability: { home: number; draw: number; away: number }
  momentum_score: number
  upset_alert: boolean
  home_elo: number
  away_elo: number
  elo: { home: number; away: number }
  confidence: number
  model_accuracy: number
}

export interface TeamInfo {
  id: number
  name: string
  logo?: string
  goals?: number | null
}

export interface Match {
  id: number
  home_team: TeamInfo
  away_team: TeamInfo
  score: { home?: number | null; away?: number | null }
  status: 'live' | 'upcoming' | 'finished'
  minute?: number | null
  competition: string
  venue: { name: string; city: string }
  date: string
}

export interface MatchStats {
  possession_home: number
  possession_away: number
  shots_home: number
  shots_away: number
  shots_on_target_home: number
  shots_on_target_away: number
  corners_home: number
  corners_away: number
  fouls_home: number
  fouls_away: number
  yellow_cards_home: number
  yellow_cards_away: number
  red_cards_home: number
  red_cards_away: number
  dangerous_attacks_home: number
  dangerous_attacks_away: number
  xg_home?: number | null
  xg_away?: number | null
}

export interface MatchEvent {
  minute: number
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'var'
  team: string
  player: string
  detail?: string
}

export interface Player {
  id: number
  name: string
  number: number
  position: string
  x: number
  y: number
}

export interface Formation {
  home: string
  away: string
  home_players: Player[]
  away_players: Player[]
}

export interface CommentaryMessage {
  id: string
  text: string
  timestamp: string
  personality: PersonalityType
  event_type: string
}

// Removed dead PlayerProfile and PlayerDNA types
export interface CommentaryRequest {
  match_id: number
  event_type: string
  match_state: object
  personality: string
  event_detail?: string
}

export interface AskRequest {
  question: string
  match_context?: object
  personality: string
  conversation_history?: Array<{ role: string; content: string }>
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  personality?: PersonalityType
  timestamp: Date
}

export interface InsightsAccuracy {
  model_accuracy: number
  model_accuracy_pct: string
  matches_trained: number
  teams_indexed: number
  top_feature: string
  top_feature_importance: number
  draw_recall: number
  sparkline: number[]
}

export interface Discovery {
  id: number
  text: string
  confidence: number
  teams: string[]
  category: string
}

export interface PlayerRanking {
  rank: number
  player: string
  team: string
  impact: number
  xg: number
  momentum: number
  form: string
}

export interface PredictionLogEntry {
  match: string
  prediction: string
  confidence: number
  outcome: 'correct' | 'incorrect'
  model: string
}

export interface MomentumPoint {
  minute: number
  home: number
  away: number
}

export type PersonalityType = 'broadcast' | 'tactical' | 'coach' | 'fan'

export interface AppSettings {
  theme: string
  accentColor: string
  motionIntensity: 'minimal' | 'standard' | 'full'
  reducedMotion: boolean
  defaultPersonality: PersonalityType
  commentarySpeed: 'slow' | 'normal' | 'fast'
  notifications: {
    matchStart: boolean
    momentumSpike: boolean
    goal: boolean
    aiInsight: boolean
  }
  accessibility: {
    highContrast: boolean
    largeText: boolean
    keyboardShortcuts: boolean
  }
}
