'use client'
import React, { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useMatches, usePrediction } from '@/hooks/useMatchData'
import { MatchCard, MatchCardSkeleton } from '@/components/match-explorer/MatchCard'
import type { Match } from '@/lib/types'


import { PageShell, PageHeader } from '@/components/shared/PageShell'
import { SegmentedTabs, FallbackBadge } from '@/components/shared/Primitives'

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
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
        {Array.from({ length: 6 }).map((_, i) => <MatchCardSkeleton key={i} />)}
      </div>
    )
  }

  if (!matches.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 rounded-[6px] border border-white/[0.06] bg-[#0F1117] gap-3">
        <span className="font-mono text-[12px] font-semibold tracking-widest text-[#00FF87]">
          {tab === 'live' ? 'NO LIVE MATCHES IN PROGRESS' : `NO ${tab.toUpperCase()} MATCHES FOUND`}
        </span>
        <span className="text-[13px] text-[#94A3B8] font-normal text-center max-w-md">
          {tab === 'live'
            ? 'No matches are currently active in top European competitions.'
            : `No ${tab} fixtures found for premier European competitions.`}
        </span>
      </div>
    )
  }

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
      {matches.map((match: Match) => (
        <motion.div
          key={match.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
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
    <PageShell>
      <PageHeader
        eyebrow="UCL • UEL • PREMIER LEAGUE • LA LIGA • BUNDESLIGA • SERIE A • LIGUE 1"
        title="Match Explorer"
        subtitle="Real-time European football intelligence with live probability distributions and momentum analysis."
        action={
          <SegmentedTabs
            tabs={TABS}
            active={activeTab}
            onChange={setActiveTab}
          />
        }
      />

      {/* Match grid */}
      <div className="mt-2">
        <MatchGrid tab={activeTab} />
      </div>
    </PageShell>
  )
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
      <MatchesContent />
    </Suspense>
  )
}
