import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
})

// ─── ML / Predictions ────────────────────────────────
export const predictMatch = (
  home: string,
  away: string,
  stage?: string,
  stats?: {
    home_goals?: number
    away_goals?: number
    home_shots_on_target?: number
    away_shots_on_target?: number
    home_possession?: number
    home_xg?: number
    away_xg?: number
    match_minute?: number
  }
) =>
  api.post('/api/predict/win-probability', {
    home_team: home,
    away_team: away,
    tournament_stage: stage ?? 'Group Stage',
    ...stats,
  }).then(r => r.data)

export const getTeams = () =>
  api.get('/api/predict/teams').then(r => r.data)

// ─── Matches ─────────────────────────────────────────
export const getLiveMatches = () =>
  api.get('/api/matches/live').then(r => r.data)

export const getUpcomingMatches = () =>
  api.get('/api/matches/upcoming').then(r => r.data)

export const getFinishedMatches = () =>
  api.get('/api/matches/finished').then(r => r.data)

export const getMatchStats = (id: string) =>
  api.get(`/api/matches/${id}/stats`).then(r => r.data)

export const getMatchEvents = (id: string) =>
  api.get(`/api/matches/${id}/events`).then(r => r.data)

export const getMatchLineups = (id: string) =>
  api.get(`/api/matches/${id}/lineups`).then(r => r.data)

// ─── Commentary / AI ─────────────────────────────────
export const generateCommentary = (payload: {
  match_id: number
  event_type: string
  match_state: object
  personality: string
  event_detail?: string
}) => api.post('/api/commentary/generate', payload).then(r => r.data)

export const askAnalyst = (payload: {
  question: string
  match_context?: object
  personality: string
  conversation_history?: object[]
}) => api.post('/api/commentary/ask', payload).then(r => r.data)

// ─── Players ─────────────────────────────────────────
export const searchPlayers = (q: string) =>
  api.get(`/api/players/search?q=${encodeURIComponent(q)}`).then(r => r.data)

// ─── Insights ────────────────────────────────────────
export const getInsights = () =>
  api.get('/api/insights/accuracy').then(r => r.data)

export const getDiscoveries = () =>
  api.get('/api/insights/discoveries').then(r => r.data)

export const getPlayerRankings = () =>
  api.get('/api/insights/rankings').then(r => r.data)

export const getPredictionLog = () =>
  api.get('/api/insights/predictions').then(r => r.data)

// ─── Health ──────────────────────────────────────────
export const checkHealth = () =>
  api.get('/health').then(r => r.data)

export default api
