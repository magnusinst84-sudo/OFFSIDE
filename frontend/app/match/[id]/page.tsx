'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useLiveMatch, usePrediction } from '@/hooks/useMatchData'
import { generateCommentary } from '@/lib/api'
import type { CommentaryMessage, MomentumPoint, PersonalityType } from '@/lib/types'
import { MatchHeader } from '@/components/war-room/MatchHeader'
import { StatsPanel } from '@/components/war-room/StatsPanel'
import { PitchVisualization } from '@/components/war-room/PitchVisualization'
import { AIPanel } from '@/components/war-room/AIPanel'

export default function WarRoomPage() {
  const params = useParams()
  const id = params.id as string
  const { currentMatch, personality, setPersonality, showToast } = useApp()
  const { stats, events, lineups, isLoading } = useLiveMatch(id)
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

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: '#050508', overflow: 'hidden' }}>
      {/* Top bar */}
      <MatchHeader match={currentMatch} prediction={prediction} isLoading={isLoading && !currentMatch} />

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — 280px */}
        <div
          className="flex-shrink-0 overflow-y-auto"
          style={{
            width: 280,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#1A1D27 transparent',
          }}
        >
          <StatsPanel
            stats={stats}
            prediction={prediction}
            momentumHistory={momentumHistory}
            currentMinute={currentMatch?.minute ?? undefined}
            isLoading={isLoading}
          />
        </div>

        {/* Center panel — flex */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden" style={{ minWidth: 0 }}>
          <PitchVisualization
            lineups={lineups}
            events={events}
            currentMinute={currentMatch?.minute ?? undefined}
          />
        </div>

        {/* Right panel — 320px */}
        <div
          className="flex-shrink-0 p-3 overflow-hidden"
          style={{ width: 320, borderLeft: '1px solid rgba(255,255,255,0.06)' }}
        >
          <AIPanel
            commentary={commentary}
            isLoading={commentaryLoading}
            personality={personality}
            onPersonalityChange={handlePersonalityChange}
          />
        </div>
      </div>
    </div>
  )
}
