'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getPlayers } from '@/lib/api'
import { ALL_PLAYERS } from '@/lib/data/players'
import { PageShell, PageHeader } from '@/components/shared/PageShell'
import { SegmentedTabs } from '@/components/shared/Primitives'
import { Search, User, SlidersHorizontal } from 'lucide-react'

const POSITION_TABS = [
  { id: 'ALL', label: 'All Positions' },
  { id: 'FW', label: 'Forwards' },
  { id: 'MF', label: 'Midfielders' },
  { id: 'DF', label: 'Defenders' },
  { id: 'GK', label: 'Goalkeepers' },
]

export default function PlayersPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activePos, setActivePos] = useState('ALL')
  const [sortBy, setSortBy] = useState<'dna' | 'name' | 'goals'>('dna')

  useEffect(() => {
    let mounted = true
    getPlayers()
      .then(res => {
        if (mounted && res?.players && res.players.length > 0) {
          setPlayers(res.players)
          setLoading(false)
        } else {
          setPlayers([...ALL_PLAYERS].sort((a, b) => b.dna_score - a.dna_score))
          setLoading(false)
        }
      })
      .catch(() => {
        if (mounted) {
          setPlayers([...ALL_PLAYERS].sort((a, b) => b.dna_score - a.dna_score))
          setLoading(false)
        }
      })
    return () => { mounted = false }
  }, [])

  const filteredPlayers = useMemo(() => {
    return players
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.team?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.club?.toLowerCase().includes(searchQuery.toLowerCase())

        if (!matchesSearch) return false

        if (activePos === 'ALL') return true
        if (activePos === 'FW') return p.position?.toLowerCase().includes('forward') || p.position === 'FW' || p.position === 'ST' || p.position === 'LW' || p.position === 'RW'
        if (activePos === 'MF') return p.position?.toLowerCase().includes('midfield') || p.position === 'MF' || p.position === 'CM' || p.position === 'CAM' || p.position === 'CDM'
        if (activePos === 'DF') return p.position?.toLowerCase().includes('defender') || p.position === 'DF' || p.position === 'CB' || p.position === 'LB' || p.position === 'RB'
        if (activePos === 'GK') return p.position?.toLowerCase().includes('goalkeeper') || p.position === 'GK'
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'dna') return (b.dna_score ?? 0) - (a.dna_score ?? 0)
        if (sortBy === 'goals') return (b.goals ?? 0) - (a.goals ?? 0)
        return a.name.localeCompare(b.name)
      })
  }, [players, searchQuery, activePos, sortBy])

  return (
    <PageShell>
      <PageHeader
        eyebrow="GLOBAL SCOUTING INTELLIGENCE"
        title="Player Intelligence & DNA"
        subtitle="Explore tactical fingerprints, attribute profiles, and AI-predicted match impact across top European stars."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
        <div className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by player name, club, or country..."
            className="w-full bg-[#0F1117] border border-white/10 rounded-[6px] pl-10 pr-4 py-2.5 text-[13px] font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF87]/50 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SegmentedTabs
            tabs={POSITION_TABS}
            active={activePos}
            onChange={setActivePos}
          />

          <div className="flex items-center gap-2 bg-[#0F1117] border border-white/10 rounded-[6px] px-3 py-1.5">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-[12px] font-mono text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="dna" className="bg-[#0F1117] text-white">Sort: DNA Score</option>
              <option value="goals" className="bg-[#0F1117] text-white">Sort: Goals</option>
              <option value="name" className="bg-[#0F1117] text-white">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-5 rounded-[8px] h-[130px] animate-pulse bg-[#0F1117] border border-white/5" />
          ))}
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-20 rounded-[8px] bg-[#0F1117]/60 border border-white/5">
          <User size={32} className="mx-auto text-gray-500 mb-3 opacity-60" />
          <h3 className="text-[16px] font-semibold text-white">No players found</h3>
          <p className="text-[13px] text-gray-400 mt-1">Try refining your search query or position filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPlayers.map(p => (
            <button
              key={p.id}
              onClick={() => router.push(`/player/${p.id}`)}
              className="p-5 rounded-[8px] text-left transition-all duration-200 group relative overflow-hidden flex flex-col justify-between cursor-pointer"
              style={{
                background: '#0F1117',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#1A1D27'
                e.currentTarget.style.borderColor = 'rgba(0,255,135,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0F1117'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[16px] text-white truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {p.name}
                  </p>
                  <p className="font-mono text-[11px] text-gray-400 mt-0.5 truncate">
                    {p.team || p.club} • {p.position}
                  </p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="font-mono font-bold text-[28px] leading-none" style={{ color: '#00FF87' }}>
                    {p.dna_score ?? 84}
                  </span>
                  <span className="font-mono text-[9px] tracking-wider text-gray-500 mt-1">DNA</span>
                </div>
              </div>

              {/* Sub-metrics */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>{p.goals ?? 0} Goals</span>
                <span>{p.assists ?? 0} Assists</span>
                <span className="text-gray-500 group-hover:text-[#00FF87] transition-colors">View DNA →</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </PageShell>
  )
}
