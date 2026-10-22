'use client'
import React, { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SegmentedTabs, Chip, EmptyState } from '@/components/shared/Primitives'
import { MatchRow } from '@/components/match-explorer/MatchRow'
import { useMatches } from '@/hooks/useMatchData'
import type { Match } from '@/lib/types'
import { Calendar, Trophy } from 'lucide-react'

const LEAGUES = [
  { id: 'all', label: 'All' },
  { id: 'ucl', label: 'UCL' },
  { id: 'uel', label: 'UEL' },
  { id: 'epl', label: 'Premier League' },
  { id: 'laliga', label: 'La Liga' },
  { id: 'bundesliga', label: 'Bundesliga' },
  { id: 'seriea', label: 'Serie A' },
  { id: 'ligue1', label: 'Ligue 1' },
  { id: 'superlig', label: 'Süper Lig' },
  { id: 'proleague', label: 'Pro League' },
]

function isDisallowedMatch(m: Match): boolean {
  const text = `${m.competition || ''} ${m.home_team?.name || ''} ${m.away_team?.name || ''}`.toLowerCase()
  const homeName = (m.home_team?.name || '').toLowerCase()
  const awayName = (m.away_team?.name || '').toLowerCase()

  const EXCLUDE_WOMEN = [
    'women', 'woman', "women's", 'feminin', 'feminine', 'femenin', 'femenina', 'femenil',
    'frauen', 'damen', 'nwsl', 'wsl', 'wleague', 'damallsvenskan', 'naisliiga',
    'keuken', 'ladies', ' wfc', ' fc women', ' (w)', ' w)'
  ]
  if (EXCLUDE_WOMEN.some(k => text.includes(k))) return true
  if (homeName.endsWith(' w') || awayName.endsWith(' w') ||
      homeName.endsWith(' women') || awayName.endsWith(' women') ||
      homeName.endsWith(' ladies') || awayName.endsWith(' ladies') ||
      homeName.endsWith(' (w)') || awayName.endsWith(' (w)')) return true

  const EXCLUDE_GLOBAL = [
    'mls', 'major league soccer', 'liga mx', 'saudi', 'roshn', 'j-league',
    'a-league', 'k league', 'chinese super', 'csl', 'indian super', 'isl',
    'conmebol', 'concacaf', 'copa libertadores', 'copa sudamericana'
  ]
  if (EXCLUDE_GLOBAL.some(k => text.includes(k))) return true
  return false
}

function MatchesContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') as 'live' | 'upcoming' | 'finished' | null
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'finished'>(
    initialTab === 'live' ? 'live' : initialTab === 'finished' ? 'finished' : 'upcoming'
  )
  const [selectedLeague, setSelectedLeague] = useState<string>('all')

  const { matches: liveMatches, dataSource: liveDataSource } = useMatches('live')
  const { matches: upcomingMatches, dataSource: upcomingDataSource } = useMatches('upcoming')
  const { matches: finishedMatches, dataSource: finishedDataSource } = useMatches('finished')

  const currentDataSource =
    activeTab === 'live'
      ? liveDataSource
      : activeTab === 'upcoming'
      ? upcomingDataSource
      : finishedDataSource

  const currentList =
    activeTab === 'live'
      ? liveMatches
      : activeTab === 'upcoming'
      ? upcomingMatches
      : finishedMatches

  // Filter by selected league and strictly exclude women & non-European matches
  const filteredMatches = useMemo(() => {
    return currentList
      .filter((m: Match) => !isDisallowedMatch(m))
      .filter((m: Match) => {
        if (selectedLeague === 'all') return true
        const comp = (m.competition || '').toLowerCase()
        if (selectedLeague === 'ucl') return comp.includes('champions') || comp.includes('ucl')
        if (selectedLeague === 'uel') return comp.includes('europa') || comp.includes('uel')
        if (selectedLeague === 'epl') return comp.includes('premier') || comp.includes('epl')
        if (selectedLeague === 'laliga') return comp.includes('la liga') || comp.includes('laliga')
        if (selectedLeague === 'bundesliga') return comp.includes('bundesliga')
        if (selectedLeague === 'seriea') return comp.includes('serie a')
        if (selectedLeague === 'ligue1') return comp.includes('ligue 1')
        if (selectedLeague === 'superlig') return comp.includes('super lig') || comp.includes('süper lig')
        if (selectedLeague === 'proleague') return comp.includes('pro league') || comp.includes('jupiler')
        return true
      })
  }, [currentList, selectedLeague])

  // Group by competition
  const groupedByComp = useMemo(() => {
    const groups: Record<string, Match[]> = {}
    filteredMatches.forEach((m: Match) => {
      const comp = m.competition || 'Other Competitions'
      if (!groups[comp]) groups[comp] = []
      groups[comp].push(m)
    })
    return groups
  }, [filteredMatches])

  // Format today's date for Day Header
  const todayFormatted = useMemo(() => {
    const d = new Date()
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }, [])

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 pt-6 pb-32">
      {/* Title & Description */}
      <div className="mb-6">
        <h1
          className="text-[32px] font-bold text-white tracking-tight mb-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Matches
        </h1>
        <p className="text-[14px] sm:text-[15px] text-[#94A3B8]">
          Real-time European football intelligence with live win probability distributions and momentum analysis.
        </p>
      </div>

      {/* Sticky Filter Bar under header */}
      <div className="sticky top-[56px] z-30 bg-[#050508]/95 backdrop-blur-md pt-2 pb-4 border-b border-white/[0.06] flex flex-col gap-3">
        {/* Status Tabs & Data Source Indicator */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <SegmentedTabs
            tabs={[
              { id: 'live', label: 'Live', count: liveMatches.length },
              { id: 'upcoming', label: 'Upcoming', count: upcomingMatches.length },
              { id: 'finished', label: 'Finished', count: finishedMatches.length },
            ]}
            activeTab={activeTab}
            onChange={id => setActiveTab(id as any)}
            className="w-full sm:w-auto"
          />

          {currentDataSource && currentDataSource !== 'live' && (
            <span
              className="px-2.5 py-1 rounded text-[11px] font-mono font-medium tracking-wide uppercase inline-flex items-center gap-1.5"
              style={{
                background: currentDataSource === 'mock' ? 'rgba(232, 0, 61, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: currentDataSource === 'mock' ? '#FF4D6D' : '#60A5FA',
                border: `1px solid ${currentDataSource === 'mock' ? 'rgba(232, 0, 61, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: currentDataSource === 'mock' ? '#FF4D6D' : '#60A5FA' }}
              />
              {currentDataSource === 'mock' ? 'Demo data' : 'Cached'}
            </span>
          )}
        </div>

        {/* Competition Chips: horizontally scrollable with edge fade */}
        <div className="relative w-full overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {LEAGUES.map(l => (
              <Chip
                key={l.id}
                label={l.label}
                selected={selectedLeague === l.id}
                onClick={() => setSelectedLeague(l.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {/* Day Header + Right-aligned Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-white/[0.06]">
          <span className="text-[16px] font-semibold text-white">
            Today, {todayFormatted}
          </span>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[12px] text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-home,#3B82F6)]" />
              Home
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#64748B]" />
              Draw
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-away,#E8003D)]" />
              Away
            </span>
          </div>
        </div>

        {/* Empty State */}
        {filteredMatches.length === 0 ? (
          <EmptyState
            icon={<Calendar size={32} />}
            title={activeTab === 'live' ? 'No live matches right now' : `No ${activeTab} fixtures found`}
            description={
              activeTab === 'live'
                ? 'Check back shortly or explore upcoming matches scheduled for today.'
                : 'No matches found matching the selected competition filter.'
            }
            action={
              selectedLeague !== 'all' ? (
                <button
                  type="button"
                  onClick={() => setSelectedLeague('all')}
                  className="text-[13px] text-[var(--color-accent,#00FF87)] hover:underline cursor-pointer"
                >
                  Show all competitions
                </button>
              ) : undefined
            }
          />
        ) : (
          /* Grouped by Competition */
          <div className="flex flex-col gap-8">
            {Object.entries(groupedByComp).map(([competition, compMatches]) => (
              <section key={competition} className="flex flex-col">
                {/* Group Header: Plain text row (24px crest + comp name 14px/600 + count) */}
                <div className="sticky top-[152px] z-20 bg-[#050508]/95 backdrop-blur-md py-2.5 flex items-center justify-between border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-[#94A3B8]" />
                    <span className="text-[14px] font-semibold text-white tracking-wide">
                      {competition}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#94A3B8] font-mono">
                    {compMatches.length} {compMatches.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>

                {/* Match Rows */}
                <div className="flex flex-col divide-y divide-white/[0.04]">
                  {compMatches.map(m => (
                    <MatchRow key={m.id} match={m} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#94A3B8] text-center">Loading fixtures...</div>}>
      <MatchesContent />
    </Suspense>
  )
}
