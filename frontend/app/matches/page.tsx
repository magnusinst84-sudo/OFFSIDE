'use client'
import React, { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useMatches, usePrediction } from '@/hooks/useMatchData'
import { MatchCard, MatchCardSkeleton } from '@/components/match-explorer/MatchCard'
import type { Match } from '@/lib/types'


const TABS = [
  { id: 'live' as const, label: 'LIVE' },
  { id: 'upcoming' as const, label: 'UPCOMING' },
  { id: 'finished' as const, label: 'FINISHED' },
]

function MatchWithPrediction({ match }: { match: Match }) {
  const { prediction } = usePrediction(
    match.status !== 'upcoming' ? match.home_team.name : null,
    match.status !== 'upcoming' ? match.away_team.name : null
  )
  return <MatchCard match={match} prediction={prediction} />
}

function MatchGrid({ tab }: { tab: 'live' | 'upcoming' | 'finished' }) {
  const { matches, isLoading } = useMatches(tab)

  if (isLoading) {
    return (
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
        {Array.from({ length: 6 }).map((_, i) => <MatchCardSkeleton key={i} />)}
      </div>
    )
  }

  if (!matches.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="font-mono text-[11px] tracking-widest" style={{ color: '#6B7280' }}>
          NO {tab.toUpperCase()} MATCHES
        </span>
        <span className="text-[13px]" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
          {tab === 'live' ? 'No matches currently in play.' : `No ${tab} fixtures available.`}
        </span>
      </div>
    )
  }

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
      {matches.map((match: Match) => (
        <motion.div
          key={match.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MatchWithPrediction match={match} />
        </motion.div>
      ))}
    </div>
  )
}

function MatchesContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'finished'>(
    tabParam === 'live' ? 'live' : tabParam === 'finished' ? 'finished' : 'upcoming'
  )

  return (
    <div style={{ minHeight: '100vh', background: '#050508' }}>
      {/* Page header */}
      <div className="px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-widest mb-1" style={{ color: '#6B7280' }}>WORLD CUP 2026</p>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700, color: '#F0F4F8' }}>
              Match Explorer
            </h1>
          </div>
          <p className="font-mono text-[11px]" style={{ color: '#6B7280' }}>
            Real-time via API-Football
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-8 pt-4 pb-0 flex items-center gap-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative px-4 py-2 font-mono text-[11px] tracking-widest transition-all duration-150"
            style={{
              color: activeTab === tab.id ? '#00FF87' : '#6B7280',
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tabIndicator"
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: '#00FF87' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
        <div className="flex-1" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Match grid */}
      <div className="px-8 py-6">
        <MatchGrid tab={activeTab} />
      </div>
    </div>
  )
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<div style={{ background: '#050508', minHeight: '100vh' }} />}>
      <MatchesContent />
    </Suspense>
  )
}
