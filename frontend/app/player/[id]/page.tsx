'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ALL_LEAGUE_PLAYERS } from '@/lib/data/league'
import type { LeaguePlayer } from '@/lib/data/league/league-types'
import { Card, Input, Avatar, Button, EmptyState } from '@/components/shared/Primitives'
import { ArrowLeft, Search, UserX, AlertCircle } from 'lucide-react'

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

  // Not Found State for any non-api id or unindexed league id
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
      {/* 1. Header Navigation & Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link
          href="/players"
          className="inline-flex items-center gap-1.5 text-[14px] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Players</span>
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

      {/* 2. Identity & Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08] mb-8">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Avatar / Photo */}
          {player.photo && !photoError ? (
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-white/10 bg-[#1A1D27] shrink-0">
              <Image
                src={player.photo}
                alt={player.name}
                fill
                sizes="96px"
                className="object-cover"
                onError={() => setPhotoError(true)}
              />
            </div>
          ) : (
            <Avatar name={player.name} size={64} className="sm:w-24 sm:h-24 sm:text-[32px] text-white shrink-0" />
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight leading-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {player.name}
              </h1>
              {player.number_conflict && (
                <span
                  className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono"
                  title="Shared shirt number in club squad (reserve or youth roster entry)"
                >
                  Shared # conflict
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-mono">
                {player.league}
              </span>
            </div>

            <div className="text-[14px] text-[#94A3B8] flex flex-wrap items-center gap-2 mt-1">
              <span>{player.club}</span>
              <span>•</span>
              <span>{player.country}</span>
              <span>•</span>
              <span className="font-mono">{player.position}</span>
              {player.number !== null && player.number !== undefined && (
                <>
                  <span>•</span>
                  <span className="font-mono">#{player.number}</span>
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

        {/* Hero DNA Score: Space Grotesk */}
        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center p-3 sm:p-0 rounded-xl bg-white/[0.02] sm:bg-transparent">
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[24px] sm:text-[32px] font-bold text-[#64748B] font-mono leading-none">
              No data
            </span>
            <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider mt-1">
              DNA Score
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Layout (7/12 Main, 5/12 Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── MAIN COLUMN (7/12) ─── */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* 1. Tactical Attribute Profile Card */}
          <Card className="p-6">
            <h2
              className="text-[18px] font-semibold text-white tracking-tight mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Tactical Attribute Profile
            </h2>

            <div className="py-12 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-[#1A1D27]/30 border border-white/[0.04]">
              <AlertCircle size={28} className="text-[#64748B] mb-2" />
              <p className="text-[14px] text-white font-medium mb-1">No tactical attribute data</p>
              <p className="text-[13px] text-[#94A3B8] max-w-sm">
                Tactical attribute radar metrics are not available for this squad entry.
              </p>
            </div>
          </Card>

          {/* 2. Shot Map Card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2
                  className="text-[18px] font-semibold text-white tracking-tight"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Shot Map
                </h2>
                <span className="text-[12px] text-[#94A3B8]">
                  Tracking data
                </span>
              </div>
            </div>

            <div className="py-12 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-[#1A1D27]/30 border border-white/[0.04]">
              <AlertCircle size={28} className="text-[#64748B] mb-2" />
              <p className="text-[14px] text-white font-medium mb-1">No shot map data</p>
              <p className="text-[13px] text-[#94A3B8] max-w-sm">
                Positional shot event coordinates are not indexed for this squad entry.
              </p>
            </div>
          </Card>
        </div>

        {/* ─── SIDE COLUMN (5/12) ─── */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* 1. Stats List */}
          <Card className="p-6">
            <h2
              className="text-[16px] font-semibold text-white tracking-tight mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Stats, Season
            </h2>
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {[
                { label: 'Goals', value: 'No data' },
                { label: 'Assists', value: 'No data' },
                { label: 'Expected Goals (xG)', value: 'No data' },
                { label: 'Expected Assists (xA)', value: 'No data' },
                { label: 'Minutes played', value: 'No data' },
              ].map(st => (
                <div key={st.label} className="flex items-center justify-between h-[48px]">
                  <span className="text-[14px] text-[#94A3B8]">{st.label}</span>
                  <span className="font-mono text-[14px] font-semibold text-[#64748B]">
                    {st.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* 2. Strengths & Vulnerabilities */}
          <Card className="p-6 flex flex-col gap-6">
            <div>
              <h3 className="text-[14px] font-semibold text-white mb-3">Key Strengths</h3>
              <p className="text-[13px] text-[#64748B] font-mono">No data</p>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <h3 className="text-[14px] font-semibold text-white mb-3">Vulnerabilities</h3>
              <p className="text-[13px] text-[#64748B] font-mono">No data</p>
            </div>
          </Card>

          {/* 3. Role Fit Bars */}
          <Card className="p-6">
            <h2
              className="text-[16px] font-semibold text-white tracking-tight mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Tactical Role Suitability
            </h2>
            <p className="text-[13px] text-[#64748B] font-mono">No data</p>
          </Card>
        </div>
      </div>
    </div>
  )
}