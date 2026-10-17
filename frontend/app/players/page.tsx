'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getPlayers } from '@/lib/api'
import { ALL_PLAYERS } from '@/lib/data/players'
import { SegmentedTabs, Chip, Input, Button, Avatar, EmptyState } from '@/components/shared/Primitives'
import { Search, ChevronRight, User } from 'lucide-react'

const POSITION_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'FW', label: 'FW' },
  { id: 'MF', label: 'MF' },
  { id: 'DF', label: 'DF' },
  { id: 'GK', label: 'GK' },
]

function DnaPill({ score }: { score: number }) {
  // Tiered colors per UI.md: 90+ Emerald, 80-89 Blue, 70-79 Amber, <70 Slate
  let color = '#94A3B8'
  let bg = 'rgba(148, 163, 184, 0.12)'
  let border = 'rgba(148, 163, 184, 0.2)'

  if (score >= 90) {
    color = 'var(--color-accent, #00FF87)'
    bg = 'var(--color-accent-soft, rgba(0, 255, 135, 0.12))'
    border = 'rgba(0, 255, 135, 0.25)'
  } else if (score >= 80) {
    color = 'var(--color-home, #3B82F6)'
    bg = 'rgba(59, 130, 246, 0.12)'
    border = 'rgba(59, 130, 246, 0.25)'
  } else if (score >= 70) {
    color = '#F59E0B'
    bg = 'rgba(245, 158, 11, 0.12)'
    border = 'rgba(245, 158, 11, 0.25)'
  }

  return (
    <div
      className="w-[48px] h-[28px] rounded-full flex items-center justify-center font-mono text-[14px] font-semibold"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {score}
    </div>
  )
}

export default function PlayersPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activePos, setActivePos] = useState('ALL')
  const [sortBy, setSortBy] = useState<'dna' | 'name' | 'goals'>('dna')
  const [visibleCount, setVisibleCount] = useState(25)

  useEffect(() => {
    let mounted = true
    getPlayers()
      .then(res => {
        if (mounted && res?.players && res.players.length > 0) {
          setPlayers(res.players)
        } else {
          setPlayers([...ALL_PLAYERS].sort((a, b) => b.dna_score - a.dna_score))
        }
        setLoading(false)
      })
      .catch(() => {
        if (mounted) {
          setPlayers([...ALL_PLAYERS].sort((a, b) => b.dna_score - a.dna_score))
          setLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  // Position count calculations
  const counts = useMemo(() => {
    const res: Record<string, number> = { ALL: players.length, FW: 0, MF: 0, DF: 0, GK: 0 }
    players.forEach(p => {
      const pos = (p.position || '').toUpperCase()
      if (pos.includes('FW') || pos.includes('ST') || pos.includes('W')) res.FW++
      else if (pos.includes('MF') || pos.includes('M')) res.MF++
      else if (pos.includes('DF') || pos.includes('D') || pos.includes('B')) res.DF++
      else if (pos.includes('GK') || pos.includes('G')) res.GK++
    })
    return res
  }, [players])

  const filteredPlayers = useMemo(() => {
    return players
      .filter(p => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.team || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.club || '').toLowerCase().includes(searchQuery.toLowerCase())

        if (!matchesSearch) return false

        const pos = (p.position || '').toUpperCase()
        if (activePos === 'ALL') return true
        if (activePos === 'FW') return pos.includes('FW') || pos.includes('ST') || pos.includes('W')
        if (activePos === 'MF') return pos.includes('MF') || pos.includes('M')
        if (activePos === 'DF') return pos.includes('DF') || pos.includes('D') || pos.includes('B')
        if (activePos === 'GK') return pos.includes('GK') || pos.includes('G')
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'dna') return (b.dna_score ?? 0) - (a.dna_score ?? 0)
        if (sortBy === 'goals') return (b.goals ?? b.stats?.goals ?? 0) - (a.goals ?? a.stats?.goals ?? 0)
        return a.name.localeCompare(b.name)
      })
  }, [players, searchQuery, activePos, sortBy])

  const displayedPlayers = filteredPlayers.slice(0, visibleCount)

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 pt-6 pb-32">
      {/* Title & Description */}
      <div className="mb-6">
        <h1
          className="text-[32px] font-bold text-white tracking-tight mb-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Players
        </h1>
        <p className="text-[14px] sm:text-[15px] text-[#94A3B8]">
          Tactical DNA profiling, multi-attribute scouting, and match impact benchmarking across top European clubs.
        </p>
      </div>

      {/* Filter and Search Bar: Sticky under header */}
      <div className="sticky top-[56px] z-30 bg-[#050508]/95 backdrop-blur-md pt-2 pb-4 border-b border-white/[0.08] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input (40px icon gutter, no overlap) */}
        <div className="w-full md:max-w-xs">
          <Input
            placeholder="Search by player, club, or country..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
              setVisibleCount(25)
            }}
            icon={<Search size={16} />}
          />
        </div>

        {/* Position Tabs & Sort */}
        <div className="flex items-center justify-between md:justify-end gap-3 overflow-x-auto">
          {/* Desktop SegmentedTabs / Mobile Chips */}
          <div className="hidden sm:block">
            <SegmentedTabs
              tabs={POSITION_TABS.map(t => ({
                id: t.id,
                label: t.label,
                count: counts[t.id],
              }))}
              activeTab={activePos}
              onChange={pos => {
                setActivePos(pos)
                setVisibleCount(25)
              }}
            />
          </div>

          <div className="sm:hidden flex items-center gap-1.5 overflow-x-auto">
            {POSITION_TABS.map(t => (
              <Chip
                key={t.id}
                label={`${t.label} (${counts[t.id] ?? 0})`}
                selected={activePos === t.id}
                onClick={() => {
                  setActivePos(t.id)
                  setVisibleCount(25)
                }}
              />
            ))}
          </div>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="h-[44px] px-3 rounded-[10px] bg-[#0F1117] border border-white/10 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer"
          >
            <option value="dna">Sort: DNA Score</option>
            <option value="goals">Sort: Goals</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {loading ? (
          <div className="p-12 text-center text-[14px] text-[#94A3B8]">Loading player database...</div>
        ) : filteredPlayers.length === 0 ? (
          <EmptyState
            icon={<User size={32} />}
            title="No players found"
            description="No players matched your search or position filter."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setActivePos('ALL')
                }}
                className="text-[13px] text-[var(--color-accent,#00FF87)] hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="flex flex-col">
            {/* Table Container */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                {/* Sticky Header */}
                <thead>
                  <tr className="border-b border-white/[0.08] text-[12px] text-[#94A3B8] select-none">
                    <th className="py-3 px-3 w-12 text-center font-mono">#</th>
                    <th className="py-3 px-3">Player</th>
                    <th className="py-3 px-3 w-20">Pos</th>
                    <th className="py-3 px-3 hidden md:table-cell">Club / Nation</th>
                    <th className="py-3 px-3 w-24 text-right hidden sm:table-cell" title="Season total">
                      Goals
                    </th>
                    <th className="py-3 px-3 w-24 text-right hidden sm:table-cell" title="Season total">
                      Assists
                    </th>
                    <th className="py-3 px-3 w-24 text-right">DNA</th>
                    <th className="py-3 px-3 w-10"></th>
                  </tr>
                </thead>

                {/* Rows: 56px height, whole row clickable, chevron on hover */}
                <tbody className="divide-y divide-white/[0.04]">
                  {displayedPlayers.map((player, idx) => {
                    const goals = player.goals ?? player.stats?.goals ?? 0
                    const assists = player.assists ?? player.stats?.assists ?? 0

                    return (
                      <tr
                        key={player.id}
                        onClick={() => router.push(`/player/${player.id}`)}
                        className="group h-[56px] hover:bg-[#1A1D27]/80 transition-colors cursor-pointer"
                      >
                        {/* 1. Rank # */}
                        <td className="py-2 px-3 text-center font-mono text-[13px] text-[#64748B]">
                          {idx + 1}
                        </td>

                        {/* 2. Player (avatar + name) */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={player.name} size={32} />
                            <div className="flex flex-col min-w-0">
                              <span className="text-[14px] sm:text-[15px] font-medium text-white truncate group-hover:text-[var(--color-accent,#00FF87)] transition-colors">
                                {player.name}
                              </span>
                              <span className="sm:hidden text-[12px] text-[#94A3B8] truncate">
                                {player.club || player.team}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Pos */}
                        <td className="py-2 px-3 font-mono text-[13px] text-[#94A3B8]">
                          {player.position}
                        </td>

                        {/* 4. Club / Nation (Desktop only) */}
                        <td className="py-2 px-3 hidden md:table-cell text-[14px] text-[#94A3B8] truncate">
                          {player.club || player.team}
                        </td>

                        {/* 5. Goals (Season) */}
                        <td className="py-2 px-3 text-right font-mono text-[14px] text-white hidden sm:table-cell">
                          {goals}
                        </td>

                        {/* 6. Assists (Season) */}
                        <td className="py-2 px-3 text-right font-mono text-[14px] text-white hidden sm:table-cell">
                          {assists}
                        </td>

                        {/* 7. DNA Pill */}
                        <td className="py-2 px-3 text-right">
                          <div className="flex justify-end">
                            <DnaPill score={player.dna_score ?? 75} />
                          </div>
                        </td>

                        {/* 8. Chevron */}
                        <td className="py-2 px-3 text-right text-[#64748B] group-hover:text-white transition-colors">
                          <ChevronRight size={18} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Load More Button */}
            {visibleCount < filteredPlayers.length && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setVisibleCount(prev => prev + 25)}
                  className="min-w-[160px]"
                >
                  Load more players ({filteredPlayers.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
