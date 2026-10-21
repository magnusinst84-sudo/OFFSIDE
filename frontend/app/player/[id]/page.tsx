'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPlayerById as getLegacyPlayer, searchPlayersLocal as searchLegacyPlayers } from '@/lib/data/legacy/players'
import { ALL_LEAGUE_PLAYERS } from '@/lib/data/league'
import type { LeaguePlayer } from '@/lib/data/league/league-types'
import type { LegacyPlayer } from '@/lib/data/types'
import { Card, Input, Avatar, FallbackBadge, Button, EmptyState } from '@/components/shared/Primitives'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, Search, Check, AlertTriangle, UserX, AlertCircle } from 'lucide-react'

// Realistic clinical shot distribution for premier European attackers (legacy fallback)
const DEFAULT_SHOTS = [
  { x: 235, y: 75, xg: 0.65, outcome: 'goal', minute: 23, opponent: 'Bayern', part: 'Right foot' },
  { x: 260, y: 68, xg: 0.52, outcome: 'goal', minute: 41, opponent: 'Dortmund', part: 'Left foot' },
  { x: 215, y: 92, xg: 0.44, outcome: 'goal', minute: 67, opponent: 'Inter', part: 'Header' },
  { x: 245, y: 84, xg: 0.58, outcome: 'goal', minute: 82, opponent: 'Arsenal', part: 'Right foot' },
  { x: 255, y: 60, xg: 0.48, outcome: 'goal', minute: 89, opponent: 'Barcelona', part: 'Right foot' },
  { x: 190, y: 110, xg: 0.28, outcome: 'on_target', minute: 14, opponent: 'Bayern', part: 'Left foot' },
  { x: 285, y: 95, xg: 0.32, outcome: 'on_target', minute: 33, opponent: 'Dortmund', part: 'Right foot' },
  { x: 220, y: 125, xg: 0.22, outcome: 'on_target', minute: 54, opponent: 'Inter', part: 'Right foot' },
  { x: 265, y: 115, xg: 0.25, outcome: 'on_target', minute: 76, opponent: 'Arsenal', part: 'Left foot' },
  { x: 165, y: 140, xg: 0.14, outcome: 'off_target', minute: 8, opponent: 'Bayern', part: 'Right foot' },
  { x: 310, y: 135, xg: 0.12, outcome: 'off_target', minute: 29, opponent: 'Dortmund', part: 'Right foot' },
  { x: 240, y: 160, xg: 0.18, outcome: 'off_target', minute: 61, opponent: 'Inter', part: 'Right foot' },
  { x: 180, y: 150, xg: 0.12, outcome: 'off_target', minute: 88, opponent: 'Barcelona', part: 'Left foot' },
]

// ─── STUB FOR FUTURE LIVE STATS EXPANSION (Default: Disabled) ───
// When NEXT_PUBLIC_ENABLE_LIVE_STATS is false, NEVER calls external API-Football
const ENABLE_LIVE_STATS = process.env.NEXT_PUBLIC_ENABLE_LIVE_STATS === 'true'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useLeagueStatsStub(apiId: number | null) {
  if (!ENABLE_LIVE_STATS || !apiId) {
    return { stats: null, loading: false }
  }
  // Stub only: do not implement or hit API-Football
  return { stats: null, loading: false }
}

export default function PlayerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [legacyPlayer, setLegacyPlayer] = useState<LegacyPlayer | null>(null)
  const [leaguePlayer, setLeaguePlayer] = useState<LeaguePlayer | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeShot, setActiveShot] = useState<any>(null)
  const [photoError, setPhotoError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setPhotoError(false)

    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }

    if (id.startsWith('api-')) {
      // 1. LEAGUE PLAYER ROUTE: STRICTLY LOCAL, NEVER CALLS API-FOOTBALL
      const found = ALL_LEAGUE_PLAYERS.find(p => p.id === id)
      if (found) {
        setLeaguePlayer(found)
        setLegacyPlayer(null)
      } else {
        setNotFound(true)
      }
      setLoading(false)
      return
    }

    // 2. LEGACY PLAYER ROUTE: LOOK UP IN LEGACY DATASET
    const legacy = getLegacyPlayer(id)
    if (legacy) {
      setLegacyPlayer(legacy)
      setLeaguePlayer(null)
      setLoading(false)
    } else {
      // 3. UNKNOWN ID: DO NOT FALL BACK TO MBAPPÉ
      setNotFound(true)
      setLoading(false)
    }
  }, [id])

  // Cross-dataset search dropdown
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return []
    const q = searchQuery.toLowerCase().trim()

    // Search legacy first
    const legacyMatches = searchLegacyPlayers(q).slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      sub: p.team || p.club,
      type: 'World Cup',
    }))

    // Search league players
    const leagueMatches = ALL_LEAGUE_PLAYERS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.club.toLowerCase().includes(q)
    ).slice(0, 4).map(p => ({
      id: p.id,
      name: p.name,
      sub: p.club,
      type: 'Club',
    }))

    return [...legacyMatches, ...leagueMatches]
  }, [searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[#94A3B8] text-[14px]">
        Loading player profile...
      </div>
    )
  }

  // Proper Not Found State (Removes any hardcoded fallback to fra-mbappe)
  if (notFound || (!legacyPlayer && !leaguePlayer)) {
    return (
      <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 pt-16 pb-32 flex flex-col items-center">
        <EmptyState
          icon={<UserX size={40} className="text-[#94A3B8]" />}
          title="Player Not Found"
          description={`No player record matches identifier "${id}". The player may have been transferred or the link may be invalid.`}
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

  const isLeague = !!leaguePlayer
  const playerName = isLeague ? leaguePlayer!.name : legacyPlayer!.name
  const clubName = isLeague ? leaguePlayer!.club : legacyPlayer!.club
  const position = isLeague ? leaguePlayer!.position : legacyPlayer!.position
  const number = isLeague ? leaguePlayer!.number : legacyPlayer!.number
  const age = isLeague ? leaguePlayer!.age : legacyPlayer!.age
  const country = isLeague ? leaguePlayer!.country : legacyPlayer!.team
  const photoUrl = isLeague ? leaguePlayer!.photo : null
  const hasNumberConflict = isLeague ? leaguePlayer!.number_conflict : false

  // Legacy analytics data
  const radarData = !isLeague && legacyPlayer ? [
    { attribute: 'Pace', value: legacyPlayer.attributes?.pace ?? 85, fullMark: 100 },
    { attribute: 'Dribbling', value: legacyPlayer.attributes?.dribbling ?? 84, fullMark: 100 },
    { attribute: 'Passing', value: legacyPlayer.attributes?.passing ?? 80, fullMark: 100 },
    { attribute: 'Shooting', value: legacyPlayer.attributes?.shooting ?? 86, fullMark: 100 },
    { attribute: 'Defending', value: legacyPlayer.attributes?.defending ?? 45, fullMark: 100 },
    { attribute: 'Physicality', value: legacyPlayer.attributes?.physicality ?? 75, fullMark: 100 },
  ] : []

  const shotsList = !isLeague && legacyPlayer ? (legacyPlayer.shot_map?.length ? legacyPlayer.shot_map : DEFAULT_SHOTS) : []
  const goalsCount = shotsList.filter((s: any) => s.outcome === 'goal').length
  const totalShots = shotsList.length
  const totalXg = shotsList.reduce((acc: number, s: any) => acc + (s.xg || 0.2), 0).toFixed(2)

  const roleEntries = !isLeague && legacyPlayer ? Object.entries(legacyPlayer.role_suitability || {
    'Inside Forward': 92,
    'Advanced Striker': 88,
    'Inverted Winger': 81,
    'Deep-Lying Playmaker': 62,
  }).sort((a: any, b: any) => b[1] - a[1]) : []

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-4 pb-32">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link
          href="/players"
          className="inline-flex items-center gap-1.5 text-[14px] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Players</span>
        </Link>

        {/* Search Player Input */}
        <div className="relative w-full sm:w-[300px]">
          <Input
            placeholder="Search another player..."
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
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-mono">{p.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Identity & Hero DNA Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08] mb-8">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Avatar / Photo with remote pattern fallback */}
          {photoUrl && !photoError ? (
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-white/10 bg-[#1A1D27] shrink-0">
              <Image
                src={photoUrl}
                alt={playerName}
                fill
                sizes="96px"
                className="object-cover"
                onError={() => setPhotoError(true)}
              />
            </div>
          ) : (
            <Avatar name={playerName} size={64} className="sm:w-24 sm:h-24 sm:text-[32px] text-white shrink-0" />
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight leading-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {playerName}
              </h1>
              {hasNumberConflict && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono" title="Shared shirt number in club squad (reserve or youth roster entry)">
                  Shared # conflict
                </span>
              )}
              {isLeague && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-mono">
                  {leaguePlayer!.league}
                </span>
              )}
            </div>

            <div className="text-[14px] text-[#94A3B8] flex flex-wrap items-center gap-2 mt-1">
              <span>{clubName}</span>
              <span>•</span>
              <span>{country}</span>
              <span>•</span>
              <span className="font-mono">{position}</span>
              {number !== null && number !== undefined && (
                <>
                  <span>•</span>
                  <span className="font-mono">#{number}</span>
                </>
              )}
              {age !== null && age !== undefined && (
                <>
                  <span>•</span>
                  <span>{age} yrs</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Hero DNA Score: Space Grotesk */}
        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center p-3 sm:p-0 rounded-xl bg-white/[0.02] sm:bg-transparent">
          {isLeague ? (
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[24px] sm:text-[32px] font-bold text-[#64748B] font-mono leading-none">
                No data
              </span>
              <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider mt-1">
                DNA Score
              </span>
            </div>
          ) : (
            <>
              <span
                className="text-[44px] sm:text-[56px] font-bold leading-none"
                style={{ color: 'var(--color-accent, #00FF87)', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {legacyPlayer!.dna_score ?? 85}
              </span>
              <span className="text-[12px] text-[#94A3B8] uppercase tracking-wider mt-1">
                DNA score
              </span>
            </>
          )}
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

            {isLeague ? (
              <div className="py-12 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-[#1A1D27]/30 border border-white/[0.04]">
                <AlertCircle size={28} className="text-[#64748B] mb-2" />
                <p className="text-[14px] text-white font-medium mb-1">No tactical attribute data</p>
                <p className="text-[13px] text-[#94A3B8] max-w-sm">
                  Analytical radar metrics are calculated for the curated World Cup DNA roster entries only.
                </p>
              </div>
            ) : (
              <>
                <div className="w-full flex items-center justify-center">
                  <div className="w-[320px] sm:w-[360px] h-[300px] sm:h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} outerRadius="70%">
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis
                          dataKey="attribute"
                          tick={{ fill: '#F0F4F8', fontSize: 13, fontFamily: 'Inter, sans-serif' }}
                        />
                        <Radar
                          name="Attributes"
                          dataKey="value"
                          stroke="var(--color-accent, #00FF87)"
                          strokeWidth={2}
                          fill="var(--color-accent, #00FF87)"
                          fillOpacity={0.15}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/[0.08]">
                  {radarData.map(attr => (
                    <div key={attr.attribute} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-[#94A3B8]">{attr.attribute}</span>
                        <span className="font-mono font-semibold text-white">{attr.value}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#1A1D27] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--color-accent,#00FF87)]"
                          style={{ width: `${attr.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
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
                  {isLeague ? 'Tracking data' : `${totalShots} shots, ${goalsCount} goals, ${totalXg} xG (Season)`}
                </span>
              </div>
              {!isLeague && <FallbackBadge text="Approximate shot locations" />}
            </div>

            {isLeague ? (
              <div className="py-12 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-[#1A1D27]/30 border border-white/[0.04]">
                <AlertCircle size={28} className="text-[#64748B] mb-2" />
                <p className="text-[14px] text-white font-medium mb-1">No shot map data</p>
                <p className="text-[13px] text-[#94A3B8] max-w-sm">
                  Positional shot event coordinates are currently not indexed for this squad entry.
                </p>
              </div>
            ) : (
              <>
                <div className="w-full max-w-[480px] mx-auto aspect-[480/340] rounded-xl bg-[#0a1710] border border-white/[0.08] relative overflow-hidden flex items-center justify-center">
                  <svg
                    viewBox="0 0 480 340"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1.5"
                    fill="none"
                  >
                    <rect x="20" y="15" width="440" height="310" />
                    <rect x="180" y="5" width="120" height="10" stroke="var(--color-accent,#00FF87)" strokeWidth="2" />
                    <rect x="90" y="15" width="300" height="135" />
                    <rect x="165" y="15" width="150" height="45" />
                    <circle cx="240" cy="85" r="2.5" fill="rgba(255,255,255,0.3)" />
                    <path d="M 195 150 A 65 65 0 0 0 285 150" />
                    <line x1="20" y1="325" x2="460" y2="325" />
                    <path d="M 200 325 A 40 40 0 0 1 280 325" />
                  </svg>

                  {shotsList.map((shot: any, idx: number) => {
                    const isGoal = shot.outcome === 'goal'
                    const isOnTarget = shot.outcome === 'on_target'
                    const radius = Math.max(5, Math.min(14, (shot.xg || 0.2) * 18))

                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveShot(shot)}
                        className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                        style={{ left: `${(shot.x / 480) * 100}%`, top: `${(shot.y / 340) * 100}%` }}
                      >
                        <div
                          className="rounded-full transition-transform hover:scale-130"
                          style={{
                            width: radius * 2,
                            height: radius * 2,
                            background: isGoal ? 'var(--color-accent, #00FF87)' : 'transparent',
                            border: isGoal
                              ? '1px solid var(--color-accent, #00FF87)'
                              : isOnTarget
                              ? '2px solid #ffffff'
                              : '2px solid #64748B',
                            opacity: 0.85,
                          }}
                        />
                      </div>
                    )
                  })}
                </div>

                {activeShot && (
                  <div className="mt-3 p-3 rounded-lg bg-[#1A1D27] border border-white/10 flex items-center justify-between text-[12px]">
                    <div>
                      <span className="font-semibold text-white capitalize">{activeShot.outcome.replace('_', ' ')}</span>
                      <span className="text-[#94A3B8] ml-2">vs {activeShot.opponent} • {activeShot.minute}&apos; • {activeShot.part}</span>
                    </div>
                    <span className="font-mono text-[var(--color-accent,#00FF87)] font-bold">{activeShot.xg} xG</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] text-[#94A3B8] mt-4 pt-3 border-t border-white/[0.08]">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[var(--color-accent,#00FF87)]" />
                    Goal
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-white" />
                    On target / Saved
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-[#64748B]" />
                    Off target
                  </span>
                </div>
              </>
            )}
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
                { label: 'Goals', value: isLeague ? 'No data' : (legacyPlayer!.goals ?? '—') },
                { label: 'Assists', value: isLeague ? 'No data' : (legacyPlayer!.assists ?? '—') },
                { label: 'Expected Goals (xG)', value: isLeague ? 'No data' : (typeof legacyPlayer!.xg === 'number' ? legacyPlayer!.xg.toFixed(2) : '—') },
                { label: 'Expected Assists (xA)', value: isLeague ? 'No data' : (typeof legacyPlayer!.xa === 'number' ? legacyPlayer!.xa.toFixed(2) : '—') },
                { label: 'Minutes played', value: isLeague ? 'No data' : (legacyPlayer!.minutes_played?.toLocaleString() || '—') },
              ].map(st => (
                <div key={st.label} className="flex items-center justify-between h-[48px]">
                  <span className="text-[14px] text-[#94A3B8]">{st.label}</span>
                  <span className={`font-mono text-[14px] font-semibold ${st.value === 'No data' ? 'text-[#64748B]' : 'text-white'}`}>
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
              {isLeague ? (
                <p className="text-[13px] text-[#64748B] font-mono">No data</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {(legacyPlayer!.strengths || []).map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-white/90">
                      <Check size={16} className="text-[var(--color-accent,#00FF87)] shrink-0 mt-1" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <h3 className="text-[14px] font-semibold text-white mb-3">Vulnerabilities</h3>
              {isLeague ? (
                <p className="text-[13px] text-[#64748B] font-mono">No data</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {(legacyPlayer!.weaknesses || []).map((w: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-white/90">
                      <AlertTriangle size={16} className="text-[#F59E0B] shrink-0 mt-1" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
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
            {isLeague ? (
              <p className="text-[13px] text-[#64748B] font-mono">No data</p>
            ) : (
              <div className="flex flex-col gap-3">
                {roleEntries.map(([role, val]: any, i: number) => (
                  <div key={role} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className={i === 0 ? 'font-bold text-white' : 'text-[#94A3B8]'}>
                        {role}
                      </span>
                      <span className="font-mono text-white font-medium">{val}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#1A1D27] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--color-accent,#00FF87)]"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 4. Similar Players Chips */}
          <Card className="p-6">
            <h2
              className="text-[16px] font-semibold text-white tracking-tight mb-3"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Similar Profiles
            </h2>
            {isLeague ? (
              <p className="text-[13px] text-[#64748B] font-mono">No data</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(legacyPlayer!.comparison_players || []).map((name: string) => (
                  <div
                    key={name}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1D27] border border-white/10 text-[13px] text-white"
                  >
                    <Avatar name={name} size={20} />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 5. AI Audit Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[11px] font-mono font-semibold">
                AI AUDIT
              </span>
              <h2
                className="text-[15px] font-semibold text-white tracking-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Algorithmic Assessment
              </h2>
            </div>
            {isLeague ? (
              <p className="text-[13px] text-[#64748B] font-mono">No data</p>
            ) : (
              <p className="text-[14px] leading-[1.6] text-[#94A3B8]">
                {legacyPlayer!.predicted_impact
                  ? `Tactical fingerprint rated at ${legacyPlayer!.predicted_impact.toFixed(1)} impact score. Model assesses player as an active contributor within tactical setup.`
                  : 'High-confidence tactical fingerprint confirms elite-tier offensive efficiency.'}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}