'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useLiveMatch, usePrediction, useMatches } from '@/hooks/useMatchData'
import { generateCommentary } from '@/lib/api'
import type { CommentaryMessage, MomentumPoint, PersonalityType } from '@/lib/types'
import { MatchHeader } from '@/components/war-room/MatchHeader'
import { StatsPanel } from '@/components/war-room/StatsPanel'
import { PitchVisualization } from '@/components/war-room/PitchVisualization'
import { AIPanel } from '@/components/war-room/AIPanel'

export default function WarRoomPage() {
  const params = useParams()
  const id = params.id as string
  const { currentMatch, setCurrentMatch, personality, setPersonality, showToast } = useApp()
  const { matches: liveMatches } = useMatches('live')
  const { matches: upcomingMatches } = useMatches('upcoming')
  const { matches: finishedMatches } = useMatches('finished')

  const { stats, events, lineups, matchDetail, isLoading } = useLiveMatch(id)

  // Direct access fallback if currentMatch is null on page refresh
  useEffect(() => {
    if (matchDetail) {
      setCurrentMatch(matchDetail)
    } else if (!currentMatch && id) {
      const matchId = Number(id)
      const found = [...liveMatches, ...upcomingMatches, ...finishedMatches].find(m => m.id === matchId)
      if (found) {
        setCurrentMatch(found)
      }
    }
  }, [id, matchDetail, currentMatch, liveMatches, upcomingMatches, finishedMatches, setCurrentMatch])
  const { prediction } = usePrediction(
    currentMatch?.home_team.name ?? null,
    currentMatch?.away_team.name ?? null
  )

  const [commentary, setCommentary] = useState<CommentaryMessage[]>([])
  const [commentaryLoading, setCommentaryLoading] = useState(false)
  const [momentumHistory, setMomentumHistory] = useState<MomentumPoint[]>([])
  const prevEventsLen = useRef(0)

  // Build momentum history from prediction polls
  useEffect(() => {
    if (prediction && currentMatch?.minute) {
      setMomentumHistory(prev => {
        const score = prediction.momentum_score ?? 50
        const last = prev[prev.length - 1]
        if (last?.minute === currentMatch.minute) return prev
        return [...prev.slice(-89), {
          minute: currentMatch.minute!,
          home: score,
          away: 100 - score,
        }]
      })
    }
  }, [prediction, currentMatch?.minute])

  // Initial commentary on load
  useEffect(() => {
    if (!currentMatch || !prediction || commentary.length > 0) return
    setCommentaryLoading(true)
    generateCommentary({
      match_id: Number(id),
      event_type: 'tactical',
      match_state: {
        home: currentMatch.home_team.name,
        away: currentMatch.away_team.name,
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
      showToast('Tactical engine offline — retrying', 'error')
      setCommentaryLoading(false)
    })
  }, [currentMatch, prediction])

  // Detect new events and generate commentary
  useEffect(() => {
    if (!events || events.length <= prevEventsLen.current) {
      prevEventsLen.current = events?.length ?? 0
      return
    }
    const newEvent = events[events.length - 1]
    prevEventsLen.current = events.length

    generateCommentary({
      match_id: Number(id),
      event_type: newEvent.type,
      match_state: {
        home: currentMatch?.home_team.name,
        away: currentMatch?.away_team.name,
        stats,
        prediction,
      },
      personality,
      event_detail: `${newEvent.minute}' ${newEvent.player} — ${newEvent.detail || newEvent.type}`,
    }).then(msg => {
      setCommentary(prev => [...prev, {
        id: Date.now().toString(),
        text: msg.text,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        personality: msg.personality as PersonalityType,
        event_type: msg.event_type,
      }])
    }).catch(() => {})
  }, [events])

  const handlePersonalityChange = async (p: PersonalityType) => {
    setPersonality(p)
    try {
      const msg = await generateCommentary({
        match_id: Number(id),
        event_type: 'tactical',
        match_state: { home: currentMatch?.home_team.name, away: currentMatch?.away_team.name, stats, prediction },
        personality: p,
        event_detail: `Analyst switch to ${p} mode`,
      })
      setCommentary(prev => [...prev, {
        id: Date.now().toString(),
        text: msg.text,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        personality: p,
        event_type: 'tactical',
      }])
    } catch {}
  }

  const [mobileTab, setMobileTab] = useState<'pitch' | 'stats' | 'ai'>('pitch')

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden pb-20 md:pb-24 w-full" style={{ background: '#050508' }}>
      {/* Top bar */}
      <MatchHeader match={currentMatch} prediction={prediction} isLoading={isLoading && !currentMatch} />

      {/* Mobile view selector (hidden on lg+) */}
      <div className="flex lg:hidden items-center justify-center gap-2 p-2 border-b border-white/[0.06] bg-[#0F1117] flex-shrink-0">
        {(['pitch', 'stats', 'ai'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`font-mono text-[11px] font-semibold tracking-wider px-3.5 py-1.5 rounded transition-all ${
              mobileTab === tab
                ? 'bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30'
                : 'text-[#94A3B8] hover:text-white bg-transparent border border-transparent'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main layout: Desktop 3-column, Mobile tabbed */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left panel — stats (always on lg, conditional on mobile) */}
        <div
          className={`flex-shrink-0 overflow-y-auto ${
            mobileTab === 'stats' ? 'flex flex-col w-full' : 'hidden lg:flex lg:flex-col'
          }`}
          style={{
            width: undefined,
            minWidth: undefined,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#1A1D27 transparent',
          }}
        >
          <div className="lg:w-[280px] w-full">
            <StatsPanel
              stats={stats}
              prediction={prediction}
              momentumHistory={momentumHistory}
              currentMinute={currentMatch?.minute ?? undefined}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Center panel — pitch (always on lg, conditional on mobile) */}
        <div
          className={`flex-1 flex flex-col p-2 sm:p-4 overflow-hidden min-w-0 ${
            mobileTab === 'pitch' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <PitchVisualization
            lineups={lineups}
            events={events}
            currentMinute={currentMatch?.minute ?? undefined}
          />
        </div>

        {/* Right panel — AI commentary (always on lg, conditional on mobile) */}
        <div
          className={`flex-shrink-0 p-2 sm:p-3 overflow-hidden ${
            mobileTab === 'ai' ? 'flex flex-col w-full' : 'hidden lg:flex lg:flex-col'
          }`}
          style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="lg:w-[320px] w-full h-full">
            <AIPanel
              commentary={commentary}
              isLoading={commentaryLoading}
              personality={personality}
              onPersonalityChange={handlePersonalityChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
