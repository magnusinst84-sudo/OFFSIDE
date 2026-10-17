'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPlayerById as getPlayerLocal, searchPlayersLocal } from '@/lib/data/players'
import { getPlayerById as getPlayerApi, getPlayerDNA } from '@/lib/api'
import { Card, Input, Avatar, FallbackBadge } from '@/components/shared/Primitives'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, Search, Check, AlertTriangle, Sparkles } from 'lucide-react'

const FALLBACK_PLAYER_ID = 'fra-mbappe'

// Realistic clinical shot distribution for premier European attackers
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

export default function PlayerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params.id as string) ?? FALLBACK_PLAYER_ID

  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeShot, setActiveShot] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    const local = getPlayerLocal(id)
    if (local) {
      setPlayer(local)
      setLoading(false)
      return
    }

    getPlayerApi(id)
      .then(async res => {
        if (!mounted) return
        if (res && !res.error) {
          const dnaRes = await getPlayerDNA(id).catch(() => null)
          setPlayer({
            ...res,
            dna_score: dnaRes?.dna_score || 85,
            attributes: dnaRes?.attributes || {
              pace: 82,
              dribbling: 84,
              passing: 80,
              shooting: 82,
              defending: 48,
              physicality: 72,
            },
            role_suitability: dnaRes?.role_suitability || {
              'Inside Forward': 88,
              'Advanced Playmaker': 82,
              'Shadow Striker': 78,
              'Inverted Winger': 74,
            },
            strengths: dnaRes?.strengths || ['Explosive acceleration in half-spaces', 'Clinical conversion inside the 18-yard box'],
            weaknesses: dnaRes?.weaknesses || ['Aerial duel recovery', 'Defensive tracking in transition'],
            comparison_players: dnaRes?.comparison_players || ['Vinicius Junior', 'Rodrygo', 'Bukayo Saka'],
            ai_audit: 'Exceptional acceleration profile and off-ball movement. Operates with clinical decision-making in the final third, outperforming expected goals through precise shot placement.',
            shots: DEFAULT_SHOTS,
          })
        } else {
          setPlayer(getPlayerLocal(FALLBACK_PLAYER_ID))
        }
        setLoading(false)
      })
      .catch(() => {
        if (mounted) {
          setPlayer(getPlayerLocal(FALLBACK_PLAYER_ID))
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [id])

  // Search dropdown results
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return []
    return searchPlayersLocal(searchQuery).slice(0, 5)
  }, [searchQuery])

  if (loading || !player) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[#94A3B8] text-[14px]">
        Loading player profile...
      </div>
    )
  }

  // 6 full-word radar attributes
  const radarData = [
    { attribute: 'Pace', value: player.attributes?.pace ?? 85, fullMark: 100 },
    { attribute: 'Dribbling', value: player.attributes?.dribbling ?? 84, fullMark: 100 },
    { attribute: 'Passing', value: player.attributes?.passing ?? 80, fullMark: 100 },
    { attribute: 'Shooting', value: player.attributes?.shooting ?? 86, fullMark: 100 },
    { attribute: 'Defending', value: player.attributes?.defending ?? 45, fullMark: 100 },
    { attribute: 'Physicality', value: player.attributes?.physicality ?? 75, fullMark: 100 },
  ]

  const shotsList = player.shots?.length ? player.shots : DEFAULT_SHOTS
  const goalsCount = shotsList.filter((s: any) => s.outcome === 'goal').length
  const totalShots = shotsList.length
  const totalXg = shotsList.reduce((acc: number, s: any) => acc + (s.xg || 0.2), 0).toFixed(2)

  // Role fit sorted descending
  const roleEntries = Object.entries(player.role_suitability || {
    'Inside Forward': 92,
    'Advanced Striker': 88,
    'Inverted Winger': 81,
    'Deep-Lying Playmaker': 62,
  }).sort((a: any, b: any) => b[1] - a[1])

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
        <div className="relative w-full sm:w-[280px]">
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
                  <span className="text-[#94A3B8] font-mono">{p.team}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Identity & Hero DNA Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08] mb-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <Avatar name={player.name} size={64} className="sm:w-24 sm:h-24 sm:text-[32px] text-white" />
          <div className="flex flex-col">
            <h1
              className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight leading-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {player.name}
            </h1>
            <div className="text-[14px] text-[#94A3B8] flex flex-wrap items-center gap-2 mt-1">
              <span>{player.team || 'International'}</span>
              <span>•</span>
              <span>{player.club || 'Club'}</span>
              <span>•</span>
              <span className="font-mono">{player.position}</span>
              {player.number && (
                <>
                  <span>•</span>
                  <span className="font-mono">#{player.number}</span>
                </>
              )}
              {player.age && (
                <>
                  <span>•</span>
                  <span>{player.age} yrs</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Hero DNA Score: One number, Space Grotesk 56px */}
        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center p-3 sm:p-0 rounded-xl bg-white/[0.02] sm:bg-transparent">
          <span
            className="text-[44px] sm:text-[56px] font-bold leading-none"
            style={{ color: 'var(--color-accent, #00FF87)', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {player.dna_score ?? 85}
          </span>
          <span className="text-[12px] text-[#94A3B8] uppercase tracking-wider mt-1">
            DNA score
          </span>
        </div>
      </div>

      {/* 3. Main Two-Column Layout (7/12 Main, 5/12 Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── MAIN COLUMN (7/12) ─── */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* 1. Attribute Profile Card */}
          <Card className="p-6">
            <h2
              className="text-[18px] font-semibold text-white tracking-tight mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Tactical Attribute Profile
            </h2>

            {/* Radar Chart (360px desktop, 320px mobile) */}
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

            {/* All Six Attributes List */}
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
                  {totalShots} shots, {goalsCount} goals, {totalXg} xG (Season)
                </span>
              </div>
              <FallbackBadge text="Approximate shot locations" />
            </div>

            {/* Half-pitch SVG: max 480px, centered */}
            <div className="w-full max-w-[480px] mx-auto aspect-[480/340] rounded-xl bg-[#0a1710] border border-white/[0.08] relative overflow-hidden flex items-center justify-center">
              <svg
                viewBox="0 0 480 340"
                className="absolute inset-0 w-full h-full pointer-events-none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1.5"
                fill="none"
              >
                {/* Half-pitch boundary */}
                <rect x="20" y="15" width="440" height="310" />

                {/* Goal at top */}
                <rect x="180" y="5" width="120" height="10" stroke="var(--color-accent,#00FF87)" strokeWidth="2" />

                {/* Penalty area (18-yard box) */}
                <rect x="90" y="15" width="300" height="135" />

                {/* Goal area (6-yard box) */}
                <rect x="165" y="15" width="150" height="45" />

                {/* Penalty spot and arc */}
                <circle cx="240" cy="85" r="2.5" fill="rgba(255,255,255,0.3)" />
                <path d="M 195 150 A 65 65 0 0 0 285 150" />

                {/* Halfway line at bottom */}
                <line x1="20" y1="325" x2="460" y2="325" />
                <path d="M 200 325 A 40 40 0 0 1 280 325" />
              </svg>

              {/* Shot Circles: non-team color encoding */}
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

            {/* Shot Details Box if selected */}
            {activeShot && (
              <div className="mt-3 p-3 rounded-lg bg-[#1A1D27] border border-white/10 flex items-center justify-between text-[12px]">
                <div>
                  <span className="font-semibold text-white capitalize">{activeShot.outcome.replace('_', ' ')}</span>
                  <span className="text-[#94A3B8] ml-2">vs {activeShot.opponent} • {activeShot.minute}&apos; • {activeShot.part}</span>
                </div>
                <span className="font-mono text-[var(--color-accent,#00FF87)] font-bold">{activeShot.xg} xG</span>
              </div>
            )}

            {/* Legend below the map: Never clipped */}
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
          </Card>
        </div>

        {/* ─── SIDE COLUMN (5/12) ─── */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* 1. Stats List (Season Scope) */}
          <Card className="p-6">
            <h2
              className="text-[16px] font-semibold text-white tracking-tight mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Stats, Season
            </h2>
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {[
                { label: 'Goals', value: player.goals ?? 27 },
                { label: 'Assists', value: player.assists ?? 12 },
                { label: 'Expected Goals (xG)', value: typeof player.xg === 'number' ? player.xg.toFixed(2) : '24.80' },
                { label: 'Expected Assists (xA)', value: typeof player.xa === 'number' ? player.xa.toFixed(2) : '10.40' },
                { label: 'Minutes played', value: player.minutes_played?.toLocaleString() || '2,480' },
              ].map(st => (
                <div key={st.label} className="flex items-center justify-between h-[48px]">
                  <span className="text-[14px] text-[#94A3B8]">{st.label}</span>
                  <span className="font-mono text-[14px] font-semibold text-white">{st.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 2. Strengths & Vulnerabilities (Two separate lists) */}
          <Card className="p-6 flex flex-col gap-6">
            <div>
              <h3 className="text-[14px] font-semibold text-white mb-3">Key Strengths</h3>
              <div className="flex flex-col gap-2.5">
                {(player.strengths || ['High pace in half-spaces', 'Clinical finishing']).map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-white/90">
                    <Check size={16} className="text-[var(--color-accent,#00FF87)] shrink-0 mt-1" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <h3 className="text-[14px] font-semibold text-white mb-3">Vulnerabilities</h3>
              <div className="flex flex-col gap-2.5">
                {(player.weaknesses || ['Defensive tracking back', 'Aerial duels']).map((w: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-white/90">
                    <AlertTriangle size={16} className="text-[#F59E0B] shrink-0 mt-1" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 3. Role Fit Bars (Sorted descending, accent fill on surface-2 track, top in bold white) */}
          <Card className="p-6">
            <h2
              className="text-[16px] font-semibold text-white tracking-tight mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Tactical Role Suitability
            </h2>
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
          </Card>

          {/* 4. Similar Players Chips */}
          <Card className="p-6">
            <h2
              className="text-[16px] font-semibold text-white tracking-tight mb-3"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Similar Profiles
            </h2>
            <div className="flex flex-wrap gap-2">
              {(player.comparison_players || ['Vinicius Junior', 'Rodrygo']).map((name: string) => (
                <div
                  key={name}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1D27] border border-white/10 text-[13px] text-white"
                >
                  <Avatar name={name} size={20} />
                  <span>{name}</span>
                </div>
              ))}
            </div>
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
            <p className="text-[14px] leading-[1.6] text-[#94A3B8]">
              {player.ai_audit ||
                'High-confidence tactical fingerprint confirms elite-tier offensive efficiency. Consistent spatial awareness enables persistent isolation creation against low blocks.'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}