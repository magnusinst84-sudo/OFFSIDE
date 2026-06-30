'use client'
import useSWR from 'swr'
import * as api from '@/lib/api'

// ─── Live match data — polls every 30s ────────────────
export const useLiveMatch = (matchId: string | null) => {
  const { data: stats, error: statsError } = useSWR(
    matchId ? `match-stats-${matchId}` : null,
    () => api.getMatchStats(matchId!),
    { refreshInterval: 30000 }
  )
  const { data: eventsData } = useSWR(
    matchId ? `match-events-${matchId}` : null,
    () => api.getMatchEvents(matchId!),
    { refreshInterval: 30000 }
  )
  const { data: lineups } = useSWR(
    matchId ? `match-lineups-${matchId}` : null,
    () => api.getMatchLineups(matchId!),
    { refreshInterval: 300000 }
  )
  return {
    stats,
    events: eventsData?.events ?? [],
    lineups,
    isLoading: !stats && !statsError,
    error: statsError,
  }
}

// ─── Win probability — polls every 30s ────────────────
export const usePrediction = (home: string | null, away: string | null) => {
  const { data, error } = useSWR(
    home && away ? `predict-${home}-${away}` : null,
    () => api.predictMatch(home!, away!),
    { refreshInterval: 30000 }
  )
  return { prediction: data, isLoading: !data && !error, error }
}

// ─── Match lists — polls based on tab ─────────────────
export const useMatches = (tab: 'live' | 'upcoming' | 'finished') => {
  const fetchers = {
    live: api.getLiveMatches,
    upcoming: api.getUpcomingMatches,
    finished: api.getFinishedMatches,
  }
  const { data, error, isLoading } = useSWR(
    `matches-${tab}`,
    fetchers[tab],
    { refreshInterval: tab === 'live' ? 30000 : 300000 }
  )
  return {
    matches: data?.matches ?? [],
    count: data?.count ?? 0,
    isLoading: !data && !error,
    error,
  }
}

// ─── Teams list ───────────────────────────────────────
export const useTeams = () => {
  const { data, error } = useSWR('teams', api.getTeams, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  })
  return {
    teams: data?.teams ?? [],
    isLoading: !data && !error,
  }
}

// ─── Insights ─────────────────────────────────────────
export const useInsights = () => {
  const { data: accuracy, error: accError } = useSWR('insights-accuracy', api.getInsights, {
    revalidateOnFocus: false,
  })
  const { data: discoveries } = useSWR('insights-discoveries', api.getDiscoveries, {
    revalidateOnFocus: false,
  })
  const { data: rankings } = useSWR('insights-rankings', api.getPlayerRankings, {
    revalidateOnFocus: false,
  })
  const { data: predLog } = useSWR('insights-predictions', api.getPredictionLog, {
    revalidateOnFocus: false,
  })
  return {
    accuracy,
    discoveries: discoveries?.discoveries ?? [],
    rankings: rankings?.rankings ?? [],
    predLog: predLog?.predictions ?? [],
    isLoading: !accuracy && !accError,
  }
}
