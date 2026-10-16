'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPlayerById as getPlayerLocal, searchPlayersLocal } from '@/lib/data/players'
import { getPlayerById as getPlayerApi, getPlayerDNA } from '@/lib/api'
import { DNACard } from '@/components/player/DNACard'
import { PageShell, PageHeader } from '@/components/shared/PageShell'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { Search, ChevronLeft, ArrowUpRight } from 'lucide-react'

const FALLBACK_PLAYER_ID = 'fra-mbappe'

export default function PlayerPage() {
  const params = useParams()
  const id = (params.id as string) ?? FALLBACK_PLAYER_ID
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const local = getPlayerLocal(id)
    if (local) {
      setPlayer(local)
      setLoading(false)
      return
    }

    // Try backend API for player
    getPlayerApi(id)
      .then(async res => {
        if (!mounted) return
        if (res && !res.error) {
          const dnaRes = await getPlayerDNA(id).catch(() => null)
          const merged = {
            id: res.id,
            name: res.name,
            team: res.team || 'International',
            club: res.club || 'Top European Club',
            position: res.position || 'Forward',
            age: res.age || 25,
            height_cm: res.height_cm || 182,
            dna_score: dnaRes?.dna_score || 84,
            attributes: dnaRes?.attributes || { pace: 80, dribbling: 82, passing: 78, shooting: 80, defending: 50, physicality: 70 },
            role_suitability: dnaRes?.role_suitability || { striker: 85, winger: 80, cam: 70, cm: 60 },
            strengths: dnaRes?.strengths || ['Technical execution', 'High game tempo'],
            weaknesses: dnaRes?.weaknesses || ['Defensive transitions'],
            comparison_players: dnaRes?.comparison_players || ['Top-flight European Archetype'],
            goals: res.goals || 0,
            assists: res.assists || 0,
            xg: res.xg || 0.0,
            xa: res.xa || 0.0,
            minutes_played: res.minutes_played || 1200,
            shots: res.shots || [],
          }
          setPlayer(merged)
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

    return () => { mounted = false }
  }, [id])

  if (loading || !player) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050508]">
        <p className="font-mono text-[14px] tracking-widest text-[#00FF87] animate-pulse">LOADING PLAYER DNA...</p>
      </div>
    )
  }

  const searchResults = searchQuery.length > 1 ? searchPlayersLocal(searchQuery) : []

  const radarData = [
    { attribute: 'PACE', value: player.attributes?.pace ?? 75 },
    { attribute: 'DRIBBLE', value: player.attributes?.dribbling ?? 75 },
    { attribute: 'PASSING', value: player.attributes?.passing ?? 75 },
    { attribute: 'SHOOT', value: player.attributes?.shooting ?? 75 },
    { attribute: 'DEFEND', value: player.attributes?.defending ?? 75 },
    { attribute: 'PHYSIC', value: player.attributes?.physicality ?? 75 },
  ]

  const stats = [
    { label: 'GOALS', value: player.goals ?? 0 },
    { label: 'ASSISTS', value: player.assists ?? 0 },
    { label: 'XG', value: typeof player.xg === 'number' ? player.xg.toFixed(2) : player.xg ?? '—' },
    { label: 'XA', value: typeof player.xa === 'number' ? player.xa.toFixed(2) : player.xa ?? '—' },
    { label: 'MINUTES', value: player.minutes_played ? player.minutes_played.toLocaleString() : '—' },
  ]

  return (
    <PageShell>
      {/* Back button and quick search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => router.push('/players')}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-mono text-[12px] transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>BACK TO ROSTER</span>
        </button>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-[6px] bg-[#0F1117] border border-white/10">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="SEARCH ANOTHER PLAYER..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setSearchOpen(true)
              }}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              className="bg-transparent outline-none w-full font-mono text-[12px] text-white placeholder-gray-500"
            />
          </div>
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-[6px] overflow-hidden z-50 bg-[#0F1117] border border-white/10 shadow-xl">
              {searchResults.map(p => (
                <button
                  key={p.id}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 transition-colors text-left hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                  onMouseDown={() => router.push(`/player/${p.id}`)}
                >
                  <span className="font-mono text-[12px] text-white">{p.name}</span>
                  <span className="font-mono text-[10px] text-gray-400">{p.team}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <PageHeader
        eyebrow="PLAYER INTELLIGENCE &amp; DNA"
        title={player.name}
        subtitle={`${player.team || player.club} • ${player.position} • #${player.number ?? 10}`}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column — Bio & Core Numbers (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-6 rounded-[8px] bg-[#0F1117] border border-white/10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[11px] tracking-wider text-gray-500">AI DNA SCORE</p>
                <span className="font-mono font-bold text-[56px] leading-none text-[#00FF87]">
                  {player.dna_score}
                </span>
              </div>
              <div className="h-16 w-16 rounded-[6px] bg-gradient-to-br from-[#1A1D27] to-[#0F1117] border border-white/10 flex items-center justify-center">
                <span className="font-mono text-[24px] font-bold text-gray-400">
                  {player.name.slice(0, 1)}
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-[4px] bg-white/5 text-gray-300">{player.position}</span>
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-[4px] bg-white/5 text-gray-300">{player.age ?? 26} YRS</span>
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-[4px] bg-white/5 text-gray-300">{player.height_cm ?? 180} CM</span>
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-[4px] bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20">TIER 1</span>
            </div>

            {/* Stats Table */}
            <div className="flex flex-col pt-3 border-t border-white/5">
              {stats.map((s, i) => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="font-mono text-[11px] tracking-wider text-gray-400">{s.label}</span>
                  <span className="font-mono text-[14px] font-semibold text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DNA Holographic Interactive Card */}
          <DNACard player={player} />
        </div>

        {/* Center Column — Visuals: Radar Chart & Shot Map (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Radar Chart Card */}
          <div className="p-6 rounded-[8px] bg-[#0F1117] border border-white/10 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[11px] tracking-wider text-gray-400">HEXAGONAL ATTRIBUTE RADAR</p>
              <span className="font-mono text-[11px] text-[#00FF87]">TACTICAL PROFILE</span>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="attribute"
                    tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                  />
                  <Radar
                    name="Attributes"
                    dataKey="value"
                    stroke="#00FF87"
                    fill="#00FF87"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shot Map Card */}
          <div className="p-6 rounded-[8px] bg-[#0F1117] border border-white/10 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[11px] tracking-wider text-gray-400">ATTACKING SHOT MAP &amp; XG ZONES</p>
              <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00FF87]" /> Goal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#38BDF8]" /> Saved</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F43F5E]" /> Off</span>
              </div>
            </div>

            <div className="relative rounded-[6px] overflow-hidden bg-[#0a1710] border border-white/5 h-[220px]">
              <svg viewBox="0 0 100 60" className="w-full h-full">
                {/* Half pitch markings */}
                <rect x="5" y="2" width="90" height="56" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" fill="none" />
                <rect x="25" y="2" width="50" height="20" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" />
                <rect x="37" y="2" width="26" height="8" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" />
                <circle cx="50" cy="14" r="0.6" fill="rgba(255,255,255,0.3)" />
                <line x1="5" y1="58" x2="95" y2="58" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="1.5 1.5" />

                {(player.shot_map || player.shots || []).map((shot: any, i: number) => (
                  <circle
                    key={i}
                    cx={shot.x}
                    cy={shot.y * 0.58}
                    r={2 + (shot.xg || 0.15) * 4}
                    fill={shot.outcome === 'goal' ? '#00FF87' : shot.outcome === 'on_target' ? '#38BDF8' : '#F43F5E'}
                    fillOpacity={0.85}
                    stroke="#FFFFFF"
                    strokeWidth={0.3}
                  />
                ))}
              </svg>
              {(!player.shot_map || player.shot_map.length === 0) && (!player.shots || player.shots.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-[11px] text-gray-500">NO LIVE SHOT TELEMETRY AVAILABLE</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column — AI Scouting Insights & Role Suitability (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Tactical Strengths & Weaknesses */}
          <div className="p-6 rounded-[8px] bg-[#0F1117] border border-white/10 flex flex-col gap-4">
            <div>
              <p className="font-mono text-[11px] tracking-wider text-[#00FF87] mb-2 font-semibold">TACTICAL STRENGTHS</p>
              <div className="flex flex-col gap-1.5">
                {(player.strengths || []).map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[#00FF87] text-[12px] font-bold">✓</span>
                    <span className="text-[12px] text-gray-300 leading-snug">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <p className="font-mono text-[11px] tracking-wider text-[#F43F5E] mb-2 font-semibold">TACTICAL VULNERABILITIES</p>
              <div className="flex flex-col gap-1.5">
                {(player.weaknesses || []).map((w: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[#F43F5E] text-[12px] font-bold">✗</span>
                    <span className="text-[12px] text-gray-300 leading-snug">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Role Suitability Bars */}
          <div className="p-6 rounded-[8px] bg-[#0F1117] border border-white/10 flex flex-col gap-3">
            <p className="font-mono text-[11px] tracking-wider text-gray-400 font-semibold">TACTICAL ROLE FIT</p>
            {Object.entries(player.role_suitability || {}).map(([role, val]: [string, any]) => (
              <div key={role} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-400">{role.toUpperCase()}</span>
                  <span className="text-white font-semibold">{val}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-white/5">
                  <div className="h-full rounded-full transition-all duration-500 bg-[#38BDF8]" style={{ width: `${val}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Benchmark Player Comparisons */}
          <div className="p-6 rounded-[8px] bg-[#0F1117] border border-white/10 flex flex-col gap-3">
            <p className="font-mono text-[11px] tracking-wider text-gray-400 font-semibold">ARCHETYPE SIMILARITIES</p>
            <div className="flex flex-wrap gap-2">
              {(player.comparison_players || []).map((name: string) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-1.5 rounded-[4px] bg-[#1A1D27] text-gray-300 border border-white/5"
                >
                  {name}
                  <ArrowUpRight size={12} className="text-gray-500" />
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </PageShell>
  )
}