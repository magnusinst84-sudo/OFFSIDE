'use client'
import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ALL_LEAGUE_PLAYERS, filterByPill } from '@/lib/data/league'
import type { LeagueFilter, LeaguePlayer } from '@/lib/data/league/league-types'
import { Chip, Input, Button, Avatar, EmptyState } from '@/components/shared/Primitives'
import { Search, ChevronRight, User } from 'lucide-react'

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

export default function PlayersPage() {
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [pill, setPill] = useState<LeagueFilter>('All')
  const [pos, setPos] = useState('ALL')
  const [visibleCount, setVisibleCount] = useState(50)

  // Filtered League Players
  const filteredPlayers = useMemo(() => {
    // 1. Filter by competition/league pill via filterByPill()
    const byPill = filterByPill(pill)

    // 2. Filter by search (name + club + shirt_name) & position
    const q = search.toLowerCase().trim()
    return byPill
      .filter(p => {
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
      .sort((a, b) => {
        // Default sort: league -> club -> position (GK, DF, MF, FW) -> number
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
  }, [pill, search, pos])

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
          Official club rosters across UCL, UEL, UECL, and the Big 5 European leagues ({ALL_LEAGUE_PLAYERS.length.toLocaleString()} players).
        </p>
      </div>

      {/* Sticky Controls */}
      <div className="sticky top-[56px] z-30 bg-[#050508]/95 backdrop-blur-md pt-2 pb-4 border-b border-white/[0.08] flex flex-col gap-3">
        {/* Row 1: Search & Position Filter Chips */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-xs">
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
        <div className="mb-3 flex items-center justify-between text-[13px] text-[#94A3B8]">
          <span>
            Showing <strong className="text-white">{Math.min(visibleCount, filteredPlayers.length)}</strong> of <strong className="text-white">{filteredPlayers.length.toLocaleString()}</strong> players
          </span>
          <span className="font-mono text-[11px] text-[#64748B]">Sorted by League • Club • Pos • #</span>
        </div>

        {filteredPlayers.length === 0 ? (
          <EmptyState
            icon={<User size={32} />}
            title="No players found"
            description="No players matched your search, competition, or position filter."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setPill('All')
                  setPos('ALL')
                }}
                className="text-[13px] text-[var(--color-accent,#00FF87)] hover:underline cursor-pointer"
              >
                Clear filters
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
                                  # conflict
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
