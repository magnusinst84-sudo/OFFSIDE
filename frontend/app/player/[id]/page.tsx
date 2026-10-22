'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ALL_LEAGUE_PLAYERS, CLUBS } from '@/lib/data/league'
import type { LeaguePlayer } from '@/lib/data/league/league-types'
import { Card, Input, Avatar, Button, EmptyState } from '@/components/shared/Primitives'
import { ArrowLeft, Search, UserX, ExternalLink, Shield } from 'lucide-react'

type Position = 'GK' | 'DF' | 'MF' | 'FW'

const POSITION_LABELS: Record<Position, string> = {
  GK: 'Goalkeepers',
  DF: 'Defenders',
  MF: 'Midfielders',
  FW: 'Forwards',
}

const POSITION_ORDER: Position[] = ['GK', 'DF', 'MF', 'FW']

export default function PlayerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [player, setPlayer] = useState<LeaguePlayer | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [photoError, setPhotoError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setPhotoError(false)

    if (!id || !id.startsWith('api-')) {
      setNotFound(true)
      setPlayer(null)
      setLoading(false)
      return
    }

    const found = ALL_LEAGUE_PLAYERS.find(p => p.id === id)
    if (found) {
      setPlayer(found)
      setNotFound(false)
    } else {
      setNotFound(true)
      setPlayer(null)
    }
    setLoading(false)
  }, [id])

  // Club metadata lookup for competition badges
  const clubMeta = useMemo(() => {
    if (!player) return null
    return CLUBS.find(c => c.id === player.club_id) || null
  }, [player])

  // Teammates in the same club squad
  const squadByPosition = useMemo(() => {
    if (!player) return null
    const teammates = ALL_LEAGUE_PLAYERS.filter(p => p.club_id === player.club_id)
    const grouped: Record<Position, LeaguePlayer[]> = {
      GK: [],
      DF: [],
      MF: [],
      FW: [],
    }

    teammates.forEach(p => {
      if (grouped[p.position]) {
        grouped[p.position].push(p)
      }
    })

    // Sort within each position by shirt number
    POSITION_ORDER.forEach(pos => {
      grouped[pos].sort((a, b) => (a.number ?? 999) - (b.number ?? 999))
    })

    return {
      grouped,
      totalCount: teammates.length,
    }
  }, [player])

  // Search dropdown over league players
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return []
    const q = searchQuery.toLowerCase().trim()

    return ALL_LEAGUE_PLAYERS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.shirt_name.toLowerCase().includes(q) ||
      p.club.toLowerCase().includes(q)
    ).slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      sub: p.club,
      league: p.league,
    }))
  }, [searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[#94A3B8] text-[14px]">
        Loading player profile...
      </div>
    )
  }

  // Not Found State
  if (notFound || !player) {
    return (
      <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 pt-16 pb-32 flex flex-col items-center">
        <EmptyState
          icon={<UserX size={40} className="text-[#94A3B8]" />}
          title="Player Not Found"
          description={`No official league squad record matches identifier "${id}". Only valid official league player IDs ("api-<n>") are indexed.`}
          action={
            <Button
              variant="primary"
              onClick={() => router.push('/players')}
              className="mt-4"
            >
              Back to Players
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-4 pb-32">
      {/* 1. Top Navigation & Quick Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link
          href="/players"
          className="inline-flex items-center gap-1.5 text-[14px] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>All Players</span>
        </Link>

        {/* Search Player Input */}
        <div className="relative w-full sm:w-[320px]">
          <Input
            placeholder="Search another club player..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            icon={<Search size={15} />}
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F1117] border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-white/[0.06]">
              {searchResults.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSearchQuery('')
                    router.push(`/player/${p.id}`)
                  }}
                  className="p-2.5 hover:bg-[#1A1D27] cursor-pointer flex items-center justify-between text-[13px]"
                >
                  <span className="text-white font-medium">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8] font-mono text-[11px]">{p.sub}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-mono">{p.league}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Hero Section */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-white/10 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5 sm:gap-7">
            {/* Player Photo */}
            {player.photo && !photoError ? (
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-white/15 bg-[#1A1D27] shrink-0 shadow-lg">
                <Image
                  src={player.photo}
                  alt={player.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                  onError={() => setPhotoError(true)}
                />
              </div>
            ) : (
              <Avatar name={player.name} size={80} className="sm:w-28 sm:h-28 sm:text-[36px] text-white rounded-2xl shrink-0" />
            )}

            <div className="flex flex-col">
              {/* Competition & League Badges */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-mono font-medium">
                  {player.league}
                </span>
                {clubMeta?.competitions?.map(comp => (
                  <span
                    key={comp}
                    className="px-2.5 py-0.5 rounded-full bg-[var(--color-accent-soft,rgba(0,255,135,0.12))] border border-[rgba(0,255,135,0.3)] text-[var(--color-accent,#00FF87)] text-[11px] font-mono font-medium flex items-center gap-1"
                  >
                    <Shield size={10} />
                    {comp}
                  </span>
                ))}
                {player.number_conflict && (
                  <span
                    className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono"
                    title="Shared shirt number in club squad"
                  >
                    reserve/unverified
                  </span>
                )}
              </div>

              {/* Player Name */}
              <h1
                className="text-[28px] sm:text-[40px] font-bold text-white tracking-tight leading-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {player.name}
              </h1>

              {/* Meta Row: Club (linked) • Country • Position • Number • Age */}
              <div className="text-[14px] sm:text-[15px] text-[#94A3B8] flex flex-wrap items-center gap-2 mt-2">
                <Link
                  href={`/players?club=${encodeURIComponent(player.club)}`}
                  className="text-white hover:text-[var(--color-accent,#00FF87)] font-medium transition-colors inline-flex items-center gap-1 group"
                  title={`View all ${player.club} players`}
                >
                  <span>{player.club}</span>
                  <ExternalLink size={13} className="text-[#64748B] group-hover:text-[var(--color-accent,#00FF87)]" />
                </Link>
                <span>•</span>
                <span>{player.country}</span>
                <span>•</span>
                <span className="font-mono text-white font-medium">{player.position}</span>
                {player.number !== null && player.number !== undefined && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-white">#{player.number}</span>
                  </>
                )}
                {player.age !== null && player.age !== undefined && (
                  <>
                    <span>•</span>
                    <span>{player.age} yrs</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Squad Section: Teammates Grouped by Position */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <h2
              className="text-[20px] font-semibold text-white tracking-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {player.club} Squad
            </h2>
            <span className="text-[13px] text-[#64748B] font-mono">
              ({squadByPosition?.totalCount ?? 0} players indexed)
            </span>
          </div>

          <Link
            href={`/players?club=${encodeURIComponent(player.club)}`}
            className="text-[13px] text-[var(--color-accent,#00FF87)] hover:underline font-medium"
          >
            Filter roster by this club →
          </Link>
        </div>

        {squadByPosition && POSITION_ORDER.map(pos => {
          const group = squadByPosition.grouped[pos]
          if (!group || group.length === 0) return null

          return (
            <div key={pos} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono uppercase tracking-wider text-[#94A3B8]">
                  {POSITION_LABELS[pos]}
                </span>
                <span className="text-[11px] font-mono text-[#64748B]">({group.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {group.map(tm => {
                  const isCurrent = tm.id === player.id
                  return (
                    <div
                      key={tm.id}
                      onClick={() => !isCurrent && router.push(`/player/${tm.id}`)}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-[var(--color-accent-soft,rgba(0,255,135,0.1))] border-[var(--color-accent,#00FF87)]/40 shadow-sm cursor-default'
                          : 'bg-[#0F1117] border-white/[0.08] hover:border-white/20 hover:bg-[#1A1D27] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {tm.photo ? (
                          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#1A1D27] border border-white/10 shrink-0">
                            <Image
                              src={tm.photo}
                              alt={tm.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <Avatar name={tm.name} size={36} />
                        )}

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[13px] font-medium truncate ${isCurrent ? 'text-[var(--color-accent,#00FF87)] font-semibold' : 'text-white'}`}>
                              {tm.name}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded bg-[var(--color-accent,#00FF87)] text-black text-[9px] font-bold uppercase font-mono">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] font-mono">
                            <span>#{tm.number ?? '—'}</span>
                            <span>•</span>
                            <span>{tm.age !== null ? `${tm.age}y` : '—'}</span>
                            {tm.number_conflict && (
                              <>
                                <span>•</span>
                                <span className="text-amber-400/90 text-[10px]" title="Shared shirt number in club squad">
                                  reserve/unverified
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="font-mono text-[11px] text-[#64748B] uppercase shrink-0">
                        {tm.position}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 4. Single muted note at bottom */}
      <div className="mt-12 pt-6 border-t border-white/[0.08] text-center">
        <p className="text-[13px] text-[#64748B] font-mono">
          Performance analytics aren&apos;t available for club players yet.
        </p>
      </div>
    </div>
  )
}