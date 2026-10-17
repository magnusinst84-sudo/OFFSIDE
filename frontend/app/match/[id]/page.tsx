'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useLiveMatch, usePrediction, useMatches } from '@/hooks/useMatchData'
import { generateCommentary } from '@/lib/api'
import type { CommentaryMessage, MomentumPoint, PersonalityType, MatchEvent } from '@/lib/types'
import { MatchHeader } from '@/components/war-room/MatchHeader'
import { StatsPanel } from '@/components/war-room/StatsPanel'
import { PitchVisualization } from '@/components/war-room/PitchVisualization'
import { AIPanel } from '@/components/war-room/AIPanel'
import { SegmentedTabs, ProbabilityBar } from '@/components/shared/Primitives'

function EventsTimeline({ events }: { events: MatchEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-[13px] text-[#94A3B8] rounded-xl bg-[#0F1117] border border-white/[0.06]">
        No match events recorded yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <h3 className="text-[14px] font-semibold text-white mb-1">Match events</h3>
      <div className="relative border-l border-white/10 ml-4 flex flex-col gap-4 pl-4">
        {events.map((ev, i) => (
          <div key={i} className="relative flex items-center gap-3 text-[13px]">
            <span className="absolute -left-[23px] w-3.5 h-3.5 rounded-full bg-[#1A1D27] border-2 border-[var(--color-accent,#00FF87)]" />
            <span className="font-mono text-[12px] text-[#94A3B8] w-8">{ev.minute}&apos;</span>
            <span className="font-medium text-white capitalize">{ev.type.replace('_', ' ')}</span>
            <span className="text-[#94A3B8] truncate">{ev.player || ev.team}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WarRoomPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { currentMatch, setCurrentMatch, personality, setPersonality, showToast } = useApp()
  const { matches: liveMatches } = useMatches('live')
  const { matches: upcomingMatches } = useMatches('upcoming')
  const { matches: finishedMatches } = useMatches('finished')

  const { stats, events, lineups, matchDetail, isLoading } = useLiveMatch(id)

  const syncedMatchIdRef = useRef<string | null>(null)

  // Direct access fallback if currentMatch is null on hard refresh — guarded by ref to run at most once per match id
  useEffect(() => {
    if (syncedMatchIdRef.current === id) return

    if (matchDetail && String(matchDetail.id) === String(id)) {
      syncedMatchIdRef.current = id
      if (currentMatch?.id !== matchDetail.id) {
        setCurrentMatch(matchDetail)
      }
    } else if (!currentMatch && id) {
      const matchId = Number(id)
      const found = [...liveMatches, ...upcomingMatches, ...finishedMatches].find(m => m.id === matchId)
      if (found) {
        syncedMatchIdRef.current = id
        setCurrentMatch(found)
      }
    }
  }, [id, matchDetail, currentMatch?.id, liveMatches, upcomingMatches, finishedMatches, setCurrentMatch])

  const activeMatch =
    (matchDetail && String(matchDetail.id) === String(id) ? matchDetail : null) ||
    (currentMatch && String(currentMatch.id) === String(id) ? currentMatch : null) ||
    [...liveMatches, ...upcomingMatches, ...finishedMatches].find(m => String(m.id) === String(id)) ||
    matchDetail ||
    currentMatch

  const { prediction } = usePrediction(
    activeMatch?.home_team?.name ?? null,
    activeMatch?.away_team?.name ?? null
  )

  const [commentary, setCommentary] = useState<CommentaryMessage[]>([])
  const [commentaryLoading, setCommentaryLoading] = useState(false)
  const [momentumHistory, setMomentumHistory] = useState<MomentumPoint[]>([])
  const [mobileTab, setMobileTab] = useState<'pitch' | 'stats' | 'events' | 'ai'>('pitch')

  // Build momentum history
  useEffect(() => {
    if (prediction && activeMatch?.minute) {
      setMomentumHistory(prev => {
        const score = prediction.momentum_score ?? 50
        const last = prev[prev.length - 1]
        if (last?.minute === activeMatch.minute) return prev
        return [...prev.slice(-89), {
          minute: activeMatch.minute!,
          home: score,
          away: 100 - score,
        }]
      })
    }
  }, [prediction, activeMatch?.minute])

  // Initial commentary on load
  useEffect(() => {
    if (!activeMatch || !prediction || commentary.length > 0) return
    setCommentaryLoading(true)
    generateCommentary({
      match_id: Number(id),
      event_type: 'tactical',
      match_state: {
        home: activeMatch.home_team.name,
        away: activeMatch.away_team.name,
        stats,
        prediction,
      },
      personality,
      event_detail: 'Match analysis on load',
    }).then(msg => {
      setCommentary([{
        id: Date.now().toString(),
        text: msg.text,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        personality: msg.personality as PersonalityType,
        event_type: msg.event_type,
      }])
      setCommentaryLoading(false)
    }).catch(() => {
      setCommentaryLoading(false)
    })
  }, [activeMatch, prediction, id, personality, stats])

  const isLive = activeMatch?.status === 'live'

  return (
    <div className="w-full min-h-[calc(100dvh-56px)] flex flex-col bg-[#050508] pb-32">
      {/* 1. Scoreboard (Top) */}
      <MatchHeader match={activeMatch} prediction={prediction} isLoading={isLoading} />

      {/* 2. Mobile View (< 1024px): Tabs for Pitch / Stats / Events / AI */}
      <div className="lg:hidden flex flex-col px-4 pt-4">
        {/* Sticky Mobile Tabs (at least 44px high) */}
        <div className="sticky top-[56px] z-30 bg-[#050508]/95 backdrop-blur-md pb-3 border-b border-white/[0.08]">
          <SegmentedTabs
            tabs={[
              { id: 'pitch', label: 'Pitch' },
              { id: 'stats', label: 'Stats' },
              { id: 'events', label: 'Events' },
              { id: 'ai', label: 'AI' },
            ]}
            activeTab={mobileTab}
            onChange={id => setMobileTab(id as any)}
            className="w-full"
          />
        </div>

        {/* Mobile Tab Content */}
        <div className="mt-4">
          {mobileTab === 'pitch' && (
            <div className="w-full max-w-[480px] mx-auto">
              <PitchVisualization
                lineups={lineups}
                events={events}
                currentMinute={activeMatch?.minute ?? 0}
                isLive={isLive}
              />
            </div>
          )}

          {mobileTab === 'stats' && (
            <StatsPanel
              match={activeMatch}
              stats={stats}
              prediction={prediction}
              momentumHistory={momentumHistory}
              currentMinute={activeMatch?.minute ?? 0}
              isLoading={isLoading}
            />
          )}

          {mobileTab === 'events' && (
            <EventsTimeline events={events} />
          )}

          {mobileTab === 'ai' && (
            <AIPanel
              matchId={id}
              commentary={commentary}
              personality={personality}
              onPersonalityChange={setPersonality}
              isLoading={commentaryLoading}
              isUpcoming={activeMatch?.status === 'upcoming'}
            />
          )}
        </div>
      </div>

      {/* 3. Desktop View (>= 1024px): Two-Column Layout */}
      <div className="hidden lg:grid grid-cols-[7fr_5fr] gap-8 max-w-[1440px] w-full mx-auto px-6 pt-6">
        {/* Pitch Column: max 640px, centered */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[640px]">
            <PitchVisualization
              lineups={lineups}
              events={events}
              currentMinute={activeMatch?.minute ?? 0}
              isLive={isLive}
            />
          </div>
        </div>

        {/* Panel Column: min 380px, stacked sections with 32px space and hairlines */}
        <div className="flex flex-col gap-6 rounded-xl bg-[#0F1117] border border-white/[0.08] overflow-hidden">
          {/* Stats Panel */}
          <StatsPanel
            match={activeMatch}
            stats={stats}
            prediction={prediction}
            momentumHistory={momentumHistory}
            currentMinute={activeMatch?.minute ?? 0}
            isLoading={isLoading}
          />

          {/* AI Commentary Panel */}
          <div className="border-t border-white/[0.08]">
            <AIPanel
              matchId={id}
              commentary={commentary}
              personality={personality}
              onPersonalityChange={setPersonality}
              isLoading={commentaryLoading}
              isUpcoming={activeMatch?.status === 'upcoming'}
            />
          </div>

          {/* Events Timeline (if live or finished) */}
          {activeMatch?.status !== 'upcoming' && events.length > 0 && (
            <div className="border-t border-white/[0.08]">
              <EventsTimeline events={events} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
