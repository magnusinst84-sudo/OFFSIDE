'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getPlayers } from '@/lib/api'
import { ALL_PLAYERS } from '@/lib/data/legacy/players'
import PLAYER_MATCH_MAP from '@/lib/data/legacy/player-match-map.json'
import { ALL_LEAGUE_PLAYERS, CLUBS, filterByPill } from '@/lib/data/league'
import type { LeagueFilter, LeaguePlayer } from '@/lib/data/league/league-types'
import { SegmentedTabs, Chip, Input, Button, Avatar, EmptyState } from '@/components/shared/Primitives'
import { Search, ChevronRight, User, ShieldAlert } from 'lucide-react'

const clubById = new Map(CLUBS.map(c => [c.id, c]))
const matchMapByLegacyId = new Map(PLAYER_MATCH_MAP.map(m => [m.legacy_id, m]))
const matchMapByLeagueId = new Map(PLAYER_MATCH_MAP.map(m => [m.league_id, m]))

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

function DnaPill({ score }: { score: number }) {
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

const isEuropeanLeaguePlayer = (p: any): boolean => {
  const club = (p.club || '').toLowerCase()
  const NON_EUROPEAN = ['inter miami', 'miami', 'mls', 'al-nassr', 'al-hilal', 'al hilal', 'al-ahli', 'al-ittihad', 'galaxy', 'sounders']
  if (NON_EUROPEAN.some(k => club.includes(k))) return false
  if (p.name === 'Lionel Messi') return false
  return true
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

  // Primary dataset switcher: 'dna' (Tab 1, default) vs 'clubs' (Tab 2)
  const [activeDataset, setActiveDataset] = useState<'dna' | 'clubs'>('dna')

  // ─── TAB 1: DNA ROSTER STATE ───
  const [dnaPlayers, setDnaPlayers] = useState<any[]>(() =>
    [...ALL_PLAYERS].filter(isEuropeanLeaguePlayer).sort((a, b) => b.dna_score - a.dna_score)
  )
  const [dnaSearch, setDnaSearch] = useState('')
  const [dnaPill, setDnaPill] = useState<LeagueFilter>('All')
  const [dnaPos, setDnaPos] = useState('ALL')
  const [dnaSort, setDnaSort] = useState<'dna' | 'name' | 'goals'>('dna')
  const [dnaVisibleCount, setDnaVisibleCount] = useState(25)

  // ─── TAB 2: ALL CLUBS (LEAGUE) STATE ───
  const [clubSearch, setClubSearch] = useState('')
  const [clubPill, setClubPill] = useState<LeagueFilter>('All')
  const [clubPos, setClubPos] = useState('ALL')
  const [clubVisibleCount, setClubVisibleCount] = useState(50)

  // Old backend merge-by-name applies to DNA Roster ONLY
  useEffect(() => {
    let mounted = true
    getPlayers()
      .then(res => {
        if (mounted && res?.players && res.players.length > 0) {
          const liveFiltered = res.players.filter(isEuropeanLeaguePlayer)
          const merged = ALL_PLAYERS.filter(isEuropeanLeaguePlayer).map(p => {
            const liveMatch = liveFiltered.find((lp: any) => lp.name === p.name || lp.id === p.id)
            return liveMatch ? { ...p, ...liveMatch } : p
          })
          setDnaPlayers([...merged].sort((a, b) => b.dna_score - a.dna_score))
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  // Position count calculations for DNA Roster
  const dnaCounts = useMemo(() => {
    const res: Record<string, number> = { ALL: 0, FW: 0, MF: 0, DF: 0, GK: 0 }
    dnaPlayers.forEach(p => {
      if (dnaPill !== 'All') {
        const match = matchMapByLegacyId.get(p.id)
        if (!match) return
        const club = clubById.get(match.club_id)
        if (!club) return
        if (dnaPill === 'UCL' || dnaPill === 'UEL' || dnaPill === 'UECL') {
          if (!club.competitions.includes(dnaPill)) return
        } else {
          if (club.league !== dnaPill) return
        }
      }
      res.ALL++
      const pos = (p.position || '').toUpperCase()
      if (pos.includes('FW') || pos.includes('ST') || pos.includes('W')) res.FW++
      else if (pos.includes('MF') || pos.includes('M')) res.MF++
      else if (pos.includes('DF') || pos.includes('D') || pos.includes('B')) res.DF++
      else if (pos.includes('GK') || pos.includes('G')) res.GK++
    })
    return res
  }, [dnaPlayers, dnaPill])

  // Filtered DNA Players
  const filteredDnaPlayers = useMemo(() => {
    return dnaPlayers
      .filter(p => {
        // Filter by competition / league pill via match map
        if (dnaPill !== 'All') {
          const match = matchMapByLegacyId.get(p.id)
          if (!match) return false
          const club = clubById.get(match.club_id)
          if (!club) return false
          if (dnaPill === 'UCL' || dnaPill === 'UEL' || dnaPill === 'UECL') {
            if (!club.competitions.includes(dnaPill)) return false
          } else {
            if (club.league !== dnaPill) return false
          }
        }

        const matchesSearch =
          p.name.toLowerCase().includes(dnaSearch.toLowerCase()) ||
          (p.team || '').toLowerCase().includes(dnaSearch.toLowerCase()) ||
          (p.club || '').toLowerCase().includes(dnaSearch.toLowerCase())

        if (!matchesSearch) return false

        const pos = (p.position || '').toUpperCase()
        if (dnaPos === 'ALL') return true
        if (dnaPos === 'FW') return pos.includes('FW') || pos.includes('ST') || pos.includes('W')
        if (dnaPos === 'MF') return pos.includes('MF') || pos.includes('M')
        if (dnaPos === 'DF') return pos.includes('DF') || pos.includes('D') || pos.includes('B')
        if (dnaPos === 'GK') return pos.includes('GK') || pos.includes('G')
        return true
      })
      .sort((a, b) => {
        if (dnaSort === 'dna') return (b.dna_score ?? 0) - (a.dna_score ?? 0)
        if (dnaSort === 'goals') return (b.goals ?? b.stats?.goals ?? 0) - (a.goals ?? a.stats?.goals ?? 0)
        return a.name.localeCompare(b.name)
      })
  }, [dnaPlayers, dnaSearch, dnaPos, dnaSort, dnaPill])

  // Filtered League Players (Tab 2)
  const filteredLeaguePlayers = useMemo(() => {
    // 1. Filter by competition/league pill
    const byPill = filterByPill(clubPill)

    // 2. Filter by search & position
    const q = clubSearch.toLowerCase().trim()
    return byPill
      .filter(p => {
        if (q) {
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.shirt_name.toLowerCase().includes(q) ||
            p.club.toLowerCase().includes(q)
          if (!matches) return false
        }
        if (clubPos !== 'ALL' && p.position !== clubPos) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        // Default sort: league, club, position (GK, DF, MF, FW), number
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
  }, [clubPill, clubSearch, clubPos])

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
            {activeDataset === 'dna'
              ? 'Tactical DNA profiling, multi-attribute radar scouting, and World Cup impact benchmarking.'
              : 'Official club rosters across UCL, UEL, UECL, and the Big 5 European leagues (5,244 players).'}
          </p>
        </div>

        {/* Primary View Switcher: DNA Roster vs All Clubs */}
        <div className="inline-flex p-1 rounded-xl bg-[#0F1117] border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveDataset('dna')
              setDnaVisibleCount(25)
            }}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
              activeDataset === 'dna'
                ? 'bg-[var(--color-accent,#00FF87)] text-black font-semibold shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            DNA Roster ({dnaPlayers.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveDataset('clubs')
              setClubVisibleCount(50)
            }}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
              activeDataset === 'clubs'
                ? 'bg-[var(--color-accent,#00FF87)] text-black font-semibold shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            All Clubs ({ALL_LEAGUE_PLAYERS.length.toLocaleString()})
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TAB 1: DNA ROSTER (DEFAULT) */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeDataset === 'dna' && (
        <>
          {/* Sticky Controls */}
          <div className="sticky top-[56px] z-30 bg-[#050508]/95 backdrop-blur-md pt-2 pb-4 border-b border-white/[0.08] flex flex-col gap-3">
            {/* Row 1: Search, Position Tabs & Sort */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="w-full md:max-w-xs">
                <Input
                  placeholder="Search by player, club, or country..."
                  value={dnaSearch}
                  onChange={e => {
                    setDnaSearch(e.target.value)
                    setDnaVisibleCount(25)
                  }}
                  icon={<Search size={16} />}
                />
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 overflow-x-auto">
                <div className="hidden sm:block">
                  <SegmentedTabs
                    tabs={POSITION_TABS.map(t => ({
                      id: t.id,
                      label: t.label,
                      count: dnaCounts[t.id],
                    }))}
                    activeTab={dnaPos}
                    onChange={pos => {
                      setDnaPos(pos)
                      setDnaVisibleCount(25)
                    }}
                  />
                </div>

                <div className="sm:hidden flex items-center gap-1.5 overflow-x-auto">
                  {POSITION_TABS.map(t => (
                    <Chip
                      key={t.id}
                      label={`${t.label} (${dnaCounts[t.id] ?? 0})`}
                      selected={dnaPos === t.id}
                      onClick={() => {
                        setDnaPos(t.id)
                        setDnaVisibleCount(25)
                      }}
                    />
                  ))}
                </div>

                <select
                  value={dnaSort}
                  onChange={e => setDnaSort(e.target.value as any)}
                  className="h-[44px] px-3 rounded-[10px] bg-[#0F1117] border border-white/10 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer"
                >
                  <option value="dna">Sort: DNA Score</option>
                  <option value="goals">Sort: Goals</option>
                  <option value="name">Sort: Name</option>
                </select>
              </div>
            </div>

            {/* Row 2: League / Competition Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {LEAGUE_PILLS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setDnaPill(p.id)
                    setDnaVisibleCount(25)
                  }}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-mono font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    dnaPill === p.id
                      ? 'bg-[var(--color-accent,#00FF87)] text-black font-semibold'
                      : 'bg-[#0F1117] text-[#94A3B8] border border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* DNA Roster Table */}
          <div className="mt-6">
            {filteredDnaPlayers.length === 0 ? (
              <EmptyState
                icon={<User size={32} />}
                title="No players found"
                description="No players matched your search, competition, or position filter in the DNA Roster."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setDnaSearch('')
                      setDnaPos('ALL')
                      setDnaPill('All')
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
                        <th className="py-3 px-3 w-20">Pos</th>
                        <th className="py-3 px-3 hidden md:table-cell">Club / Nation</th>
                        <th className="py-3 px-3 w-24 text-right hidden sm:table-cell">Goals</th>
                        <th className="py-3 px-3 w-24 text-right hidden sm:table-cell">Assists</th>
                        <th className="py-3 px-3 w-24 text-right">DNA</th>
                        <th className="py-3 px-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredDnaPlayers.slice(0, dnaVisibleCount).map((player, idx) => {
                        const goals = player.goals ?? player.stats?.goals ?? 0
                        const assists = player.assists ?? player.stats?.assists ?? 0

                        return (
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
                            <td className="py-2 px-3 font-mono text-[13px] text-[#94A3B8]">
                              {player.position}
                            </td>
                            <td className="py-2 px-3 hidden md:table-cell text-[14px] text-[#94A3B8] truncate">
                              {player.club || player.team}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-[14px] text-white hidden sm:table-cell">
                              {goals}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-[14px] text-white hidden sm:table-cell">
                              {assists}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex justify-end">
                                <DnaPill score={player.dna_score ?? 75} />
                              </div>
                            </td>
                            <td className="py-2 px-3 text-right text-[#64748B] group-hover:text-white transition-colors">
                              <ChevronRight size={18} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {dnaVisibleCount < filteredDnaPlayers.length && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="secondary"
                      onClick={() => setDnaVisibleCount(prev => prev + 25)}
                      className="min-w-[160px]"
                    >
                      Load more players ({filteredDnaPlayers.length - dnaVisibleCount} remaining)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TAB 2: ALL CLUBS (LEAGUE DATASET, 5,244 PLAYERS) */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeDataset === 'clubs' && (
        <>
          {/* Sticky Controls */}
          <div className="sticky top-[56px] z-30 bg-[#050508]/95 backdrop-blur-md pt-2 pb-4 border-b border-white/[0.08] flex flex-col gap-3">
            {/* Row 1: Search & Position Chips */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="w-full sm:max-w-xs">
                <Input
                  placeholder="Search player or club..."
                  value={clubSearch}
                  onChange={e => {
                    setClubSearch(e.target.value)
                    setClubVisibleCount(50)
                  }}
                  icon={<Search size={16} />}
                />
              </div>

              {/* Position Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {POSITION_TABS.map(t => (
                  <Chip
                    key={t.id}
                    label={t.label}
                    selected={clubPos === t.id}
                    onClick={() => {
                      setClubPos(t.id)
                      setClubVisibleCount(50)
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
                    setClubPill(p.id)
                    setClubVisibleCount(50)
                  }}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-mono font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    clubPill === p.id
                      ? 'bg-[var(--color-accent,#00FF87)] text-black font-semibold'
                      : 'bg-[#0F1117] text-[#94A3B8] border border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between text-[13px] text-[#94A3B8]">
              <span>
                Showing <strong className="text-white">{Math.min(clubVisibleCount, filteredLeaguePlayers.length)}</strong> of <strong className="text-white">{filteredLeaguePlayers.length.toLocaleString()}</strong> club players
              </span>
              <span className="font-mono text-[11px] text-[#64748B]">Sorted by League • Club • Pos • #</span>
            </div>

            {filteredLeaguePlayers.length === 0 ? (
              <EmptyState
                icon={<User size={32} />}
                title="No club players found"
                description="No players matched your search, competition, or position filter."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setClubSearch('')
                      setClubPill('All')
                      setClubPos('ALL')
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
                        <th className="py-3 px-3 w-20 text-center">DNA</th>
                        <th className="py-3 px-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredLeaguePlayers.slice(0, clubVisibleCount).map((player, idx) => {
                        const legacyMatch = matchMapByLeagueId.get(player.id)
                        return (
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
                            <td className="py-2 px-3 text-center">
                              {legacyMatch ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/player/${legacyMatch.legacy_id}`)
                                  }}
                                  className="inline-flex items-center justify-center px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer bg-[var(--color-accent-soft,rgba(0,255,135,0.12))] text-[var(--color-accent,#00FF87)] border border-[rgba(0,255,135,0.35)] hover:bg-[var(--color-accent,#00FF87)] hover:text-black shadow-[0_0_8px_rgba(0,255,135,0.25)]"
                                  title={`View legacy DNA profile (${legacyMatch.legacy_id})`}
                                >
                                  DNA
                                </button>
                              ) : (
                                <span className="font-mono text-[11px] text-[#64748B]">
                                  No data
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right text-[#64748B] group-hover:text-white transition-colors">
                              <ChevronRight size={18} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {clubVisibleCount < filteredLeaguePlayers.length && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="secondary"
                      onClick={() => setClubVisibleCount(prev => prev + 50)}
                      className="min-w-[180px]"
                    >
                      Load more clubs ({filteredLeaguePlayers.length - clubVisibleCount} remaining)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
