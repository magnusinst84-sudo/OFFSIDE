'use client'
import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ALL_LEAGUE_PLAYERS, filterByPill } from '@/lib/data/league'
import type { LeagueFilter, LeaguePlayer } from '@/lib/data/league/league-types'
import { Chip, Input, Button, Avatar, EmptyState } from '@/components/shared/Primitives'
import { Search, ChevronRight, User, X } from 'lucide-react'

const POSITION_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'FW', label: 'FW' },
  { id: 'MF', label: 'MF' },
  { id: 'DF', label: 'DF' },
  { id: 'GK', label: 'GK' },
]

const LEAGUE_PILLS: { id: LeagueFilter; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'UCL', label: 'UCL' },
  { id: 'UEL', label: 'UEL' },
  { id: 'UECL', label: 'UECL' },
  { id: 'Premier League', label: 'Premier League' },
  { id: 'La Liga', label: 'La Liga' },
  { id: 'Bundesliga', label: 'Bundesliga' },
  { id: 'Serie A', label: 'Serie A' },
  { id: 'Ligue 1', label: 'Ligue 1' },
]

function LeaguePlayerPhoto({ player }: { player: LeaguePlayer }) {
  const [error, setError] = useState(false)
  if (!player.photo || error) {
    return <Avatar name={player.name} size={32} />
  }
  return (
    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#1A1D27] border border-white/10 shrink-0">
      <Image
        src={player.photo}
        alt={player.name}
        fill
        sizes="32px"
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}

const POSITION_ORDER: Record<string, number> = { GK: 0, DF: 1, MF: 2, FW: 3 }
const LEAGUE_ORDER: Record<string, number> = {
  'Premier League': 0,
  'La Liga': 1,
  'Bundesliga': 2,
  'Serie A': 3,
  'Ligue 1': 4,
  'Other': 5,
}

function PlayersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clubQuery = searchParams.get('club') || ''

  const [search, setSearch] = useState(clubQuery)
  const [pill, setPill] = useState<LeagueFilter>('All')
  const [pos, setPos] = useState('ALL')
  const [firstTeamOnly, setFirstTeamOnly] = useState(false)
  const [visibleCount, setVisibleCount] = useState(50)

  // Sync search if club query param updates
  useEffect(() => {
    if (clubQuery) {
      setSearch(clubQuery)
      setVisibleCount(50)
    }
  }, [clubQuery])

  // Base list of players matching pill, search & position filter
  const basePlayers = useMemo(() => {
    const byPill = filterByPill(pill)
    const q = search.toLowerCase().trim()

    return byPill.filter(p => {
      if (q) {
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.shirt_name.toLowerCase().includes(q) ||
          p.club.toLowerCase().includes(q)
        if (!matches) return false
      }
      if (pos !== 'ALL' && p.position !== pos) {
        return false
      }
      return true
    })
  }, [pill, search, pos])

  // Count how many conflict/reserve players exist in the current filtered set
  const hiddenConflictCount = useMemo(() => {
    return basePlayers.filter(p => p.number_conflict).length
  }, [basePlayers])

  // Final filtered and sorted player list
  const filteredPlayers = useMemo(() => {
    const list = firstTeamOnly
      ? basePlayers.filter(p => !p.number_conflict)
      : basePlayers

    return [...list].sort((a, b) => {
      const leagueA = LEAGUE_ORDER[a.league] ?? 99
      const leagueB = LEAGUE_ORDER[b.league] ?? 99
      if (leagueA !== leagueB) return leagueA - leagueB

      const clubDiff = a.club.localeCompare(b.club)
      if (clubDiff !== 0) return clubDiff

      const posA = POSITION_ORDER[a.position] ?? 99
      const posB = POSITION_ORDER[b.position] ?? 99
      if (posA !== posB) return posA - posB

      const numA = a.number ?? 999
      const numB = b.number ?? 999
      return numA - numB
    })
  }, [basePlayers, firstTeamOnly])

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 pt-6 pb-32">
      {/* Title & Description */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1
            className="text-[32px] font-bold text-white tracking-tight mb-1"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Players
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[#94A3B8]">
            Official club rosters across UCL, UEL, UECL, and the Big 5 European leagues ({ALL_LEAGUE_PLAYERS.length.toLocaleString()} players).
          </p>
        </div>

        {clubQuery && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/10 shrink-0">
            <span className="text-[12px] text-[#94A3B8] font-mono">Filtered to club:</span>
            <span className="text-[13px] text-white font-semibold">{clubQuery}</span>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                router.push('/players')
              }}
              className="p-1 rounded-md text-[#94A3B8] hover:text-white hover:bg-white/10"
              title="Clear club filter"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Sticky Controls */}
      <div className="sticky top-[56px] z-30 bg-[#050508]/95 backdrop-blur-md pt-2 pb-4 border-b border-white/[0.08] flex flex-col gap-3">
        {/* Row 1: Search, Position Chips & First Team Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="w-full md:max-w-xs">
            <Input
              placeholder="Search player or club..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setVisibleCount(50)
              }}
              icon={<Search size={16} />}
            />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 overflow-x-auto">
            {/* Position Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {POSITION_TABS.map(t => (
                <Chip
                  key={t.id}
                  label={t.label}
                  selected={pos === t.id}
                  onClick={() => {
                    setPos(t.id)
                    setVisibleCount(50)
                  }}
                />
              ))}
            </div>

            {/* First Team Only Toggle */}
            <button
              type="button"
              onClick={() => setFirstTeamOnly(prev => !prev)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-mono whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                firstTeamOnly
                  ? 'bg-[var(--color-accent-soft,rgba(0,255,135,0.12))] border-[rgba(0,255,135,0.35)] text-[var(--color-accent,#00FF87)] font-medium shadow-sm'
                  : 'bg-[#0F1117] border-white/10 text-[#94A3B8] hover:border-white/20 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${firstTeamOnly ? 'bg-[var(--color-accent,#00FF87)]' : 'bg-[#64748B]'}`} />
              <span>First team only</span>
              {firstTeamOnly && hiddenConflictCount > 0 && (
                <span className="text-[11px] text-[#94A3B8] font-normal">
                  ({hiddenConflictCount} hidden)
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: League / Competition Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {LEAGUE_PILLS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPill(p.id)
                setVisibleCount(50)
              }}
              className={`px-3 py-1.5 rounded-full text-[12px] font-mono font-medium whitespace-nowrap transition-colors cursor-pointer ${
                pill === p.id
                  ? 'bg-[var(--color-accent,#00FF87)] text-black font-semibold'
                  : 'bg-[#0F1117] text-[#94A3B8] border border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="mt-6">
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[13px] text-[#94A3B8]">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong className="text-white">{Math.min(visibleCount, filteredPlayers.length)}</strong> of <strong className="text-white">{filteredPlayers.length.toLocaleString()}</strong> players
            </span>
            {firstTeamOnly && hiddenConflictCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[11px]">
                {hiddenConflictCount} reserve/unverified hidden
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] text-[#64748B]">Sorted by League • Club • Pos • #</span>
        </div>

        {filteredPlayers.length === 0 ? (
          <EmptyState
            icon={<User size={32} />}
            title="No players found"
            description="No players matched your search, competition, position, or first-team filter."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setPill('All')
                  setPos('ALL')
                  setFirstTeamOnly(false)
                }}
                className="text-[13px] text-[var(--color-accent,#00FF87)] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            }
          />
        ) : (
          <div className="flex flex-col">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[12px] text-[#94A3B8] select-none">
                    <th className="py-3 px-3 w-12 text-center font-mono">#</th>
                    <th className="py-3 px-3">Player</th>
                    <th className="py-3 px-3 w-16 text-center">Pos</th>
                    <th className="py-3 px-3">Club</th>
                    <th className="py-3 px-3 hidden md:table-cell">League</th>
                    <th className="py-3 px-3 w-16 text-center">Squad #</th>
                    <th className="py-3 px-3 w-16 text-center hidden sm:table-cell">Age</th>
                    <th className="py-3 px-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredPlayers.slice(0, visibleCount).map((player, idx) => (
                    <tr
                      key={player.id}
                      onClick={() => router.push(`/player/${player.id}`)}
                      className="group h-[56px] hover:bg-[#1A1D27]/80 transition-colors cursor-pointer"
                    >
                      <td className="py-2 px-3 text-center font-mono text-[13px] text-[#64748B]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-3">
                          <LeaguePlayerPhoto player={player} />
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] sm:text-[15px] font-medium text-white truncate group-hover:text-[var(--color-accent,#00FF87)] transition-colors">
                                {player.name}
                              </span>
                              {player.number_conflict && (
                                <span
                                  className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono shrink-0"
                                  title="Shared shirt number in club squad (reserve or youth player)"
                                >
                                  reserve/unverified
                                </span>
                              )}
                            </div>
                            <span className="sm:hidden text-[12px] text-[#94A3B8] truncate">
                              {player.club}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[13px] text-[#94A3B8]">
                        {player.position}
                      </td>
                      <td className="py-2 px-3 text-[14px] text-[#94A3B8] truncate">
                        <div className="flex items-center gap-2">
                          <span>{player.club}</span>
                          <span className="text-[11px] text-[#64748B] font-mono">({player.country})</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 hidden md:table-cell text-[13px] text-[#94A3B8] font-mono">
                        {player.league}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[13px] text-white">
                        {player.number !== null ? `#${player.number}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[13px] text-[#94A3B8] hidden sm:table-cell">
                        {player.age !== null ? `${player.age}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right text-[#64748B] group-hover:text-white transition-colors">
                        <ChevronRight size={18} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {visibleCount < filteredPlayers.length && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setVisibleCount(prev => prev + 50)}
                  className="min-w-[180px]"
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

export default function PlayersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen text-[#94A3B8] p-8 flex items-center justify-center">Loading players...</div>}>
      <PlayersContent />
    </Suspense>
  )
}
