'use client'
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPlayerById, searchPlayersLocal } from '@/lib/data/players'
import { DNACard } from '@/components/player/DNACard'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { Search } from 'lucide-react'
import { notFound } from 'next/navigation'

const FALLBACK_PLAYER_ID = 'fra-mbappe'

export default function PlayerPage() {
  const params = useParams()
  const id = (params.id as string) ?? FALLBACK_PLAYER_ID
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const player = getPlayerById(id)

  if (!player) {
    return notFound()
  }

  const searchResults = searchQuery.length > 1 ? searchPlayersLocal(searchQuery) : []

  const radarData = [
    { attribute: 'PACE', value: player.attributes.pace },
    { attribute: 'DRIBBLE', value: player.attributes.dribbling },
    { attribute: 'PASSING', value: player.attributes.passing },
    { attribute: 'SHOOT', value: player.attributes.shooting },
    { attribute: 'DEFEND', value: player.attributes.defending },
    { attribute: 'PHYSIC', value: player.attributes.physicality },
  ]

  const stats = [
    { label: 'GOALS', value: player.goals },
    { label: 'ASSISTS', value: player.assists },
    { label: 'XG', value: player.xg.toFixed(2) },
    { label: 'XA', value: player.xa.toFixed(2) },
    { label: 'MINUTES', value: player.minutes_played.toLocaleString() },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#050508' }}>
      {/* Header */}
      <div className="px-8 pt-8 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="font-mono text-[10px] tracking-widest mb-1" style={{ color: '#6B7280' }}>PLAYER INTELLIGENCE</p>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, color: '#F0F4F8' }}>
          {player.name}
        </h1>
      </div>

      {/* Three-column layout */}
      <div className="flex gap-0" style={{ minHeight: 'calc(100vh - 120px)' }}>

        {/* Left — 280px */}
        <div className="flex-shrink-0 p-6 flex flex-col gap-5" style={{ width: 280, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Portrait */}
          <div className="rounded-[4px] flex items-center justify-center" style={{ aspectRatio: '3/4', background: 'linear-gradient(to bottom, #1A1D27, #0F1117)', maxHeight: 180, overflow: 'hidden' }}>
            <span className="font-mono text-[40px]" style={{ opacity: 0.2 }}>
              {player.name.slice(0, 1)}
            </span>
          </div>

          {/* DNA Score */}
          <div>
            <span className="font-mono font-bold" style={{ fontSize: 56, color: '#00FF87', lineHeight: 1 }}>
              {player.dna_score}
            </span>
            <p className="font-mono text-[10px] tracking-widest" style={{ color: '#6B7280' }}>AI DNA SCORE</p>
          </div>

          {/* Player sub-stats */}
          <div className="flex flex-wrap gap-3">
            <span className="font-mono text-[12px]" style={{ color: '#94A3B8' }}>{player.position}</span>
            <span className="font-mono text-[12px]" style={{ color: '#94A3B8' }}>{player.age} YRS</span>
            <span className="font-mono text-[12px]" style={{ color: '#94A3B8' }}>{player.height_cm}CM</span>
            <span className="font-mono text-[12px]" style={{ color: '#94A3B8' }}>{player.club}</span>
          </div>

          {/* Stats table */}
          <div className="flex flex-col">
            {stats.map((s, i) => (
              <div key={s.label}>
                <div className="flex items-center justify-between py-2">
                  <span className="font-mono text-[10px] tracking-widest" style={{ color: '#6B7280' }}>{s.label}</span>
                  <span className="font-mono text-[14px] font-medium" style={{ color: '#F0F4F8' }}>{s.value}</span>
                </div>
                {i < stats.length - 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Center — flex */}
        <div className="flex-1 p-6 flex flex-col gap-6">
          {/* Radar chart */}
          <div>
            <p className="font-mono text-[11px] tracking-widest mb-3" style={{ color: '#6B7280' }}>ATTRIBUTE PROFILE</p>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis
                    dataKey="attribute"
                    tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: '#6B7280' }}
                  />
                  <Radar
                    name="Attributes"
                    dataKey="value"
                    stroke="#00FF87"
                    fill="#00FF87"
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shot Map */}
          <div>
            <p className="font-mono text-[11px] tracking-widest mb-3" style={{ color: '#6B7280' }}>SHOT MAP</p>
            <div className="relative rounded-[4px] overflow-hidden" style={{ height: 200, background: '#0D1F14', border: '1px solid rgba(255,255,255,0.04)' }}>
              <svg viewBox="0 0 100 60" className="w-full h-full">
                {/* Half pitch */}
                <rect x="5" y="2" width="90" height="56" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" fill="none" />
                <rect x="25" y="2" width="50" height="20" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" />
                <rect x="37" y="2" width="26" height="8" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" />
                <line x1="5" y1="58" x2="95" y2="58" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
                {player.shot_map.map((shot, i) => (
                  <circle
                    key={i}
                    cx={shot.x}
                    cy={shot.y * 0.6}
                    r={1.5 + shot.xg * 5}
                    fill={shot.outcome === 'goal' ? '#00FF87' : shot.outcome === 'on_target' ? '#F59E0B' : '#E8003D'}
                    fillOpacity={0.8}
                  />
                ))}
                {/* Legend */}
                <text x="6" y="57" fontFamily="IBM Plex Mono" fontSize="2.5" fill="#6B7280">● GOAL  ● ON TARGET  ● OFF</text>
              </svg>
              {player.shot_map.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-[10px]" style={{ color: '#6B7280' }}>NO SHOT DATA — GOALKEEPER</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — 320px */}
        <div className="flex-shrink-0 p-6 flex flex-col gap-5" style={{ width: 320, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Search */}
          <div className="relative">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-[4px]"
              style={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Search size={12} style={{ color: '#6B7280' }} />
              <input
                type="text"
                placeholder="SEARCH PLAYER..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setSearchOpen(true)
                }}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="bg-transparent outline-none w-full font-mono text-[11px] tracking-wider"
                style={{ color: '#F0F4F8' }}
              />
            </div>
            {searchOpen && searchResults.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-[4px] overflow-hidden z-50"
                style={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    className="w-full flex items-center justify-between px-3 py-2 transition-colors text-left"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseDown={() => router.push(`/player/${p.id}`)}
                  >
                    <span className="font-mono text-[11px]" style={{ color: '#F0F4F8' }}>{p.name}</span>
                    <span className="font-mono text-[9px]" style={{ color: '#6B7280' }}>{p.team}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DNA Card */}
          <DNACard player={player} />

          {/* Strengths */}
          <div>
            <p className="font-mono text-[10px] tracking-widest mb-2" style={{ color: '#00FF87' }}>STRENGTHS</p>
            {player.strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <span style={{ color: '#00FF87', fontSize: 10 }}>✓</span>
                <span className="font-mono text-[11px]" style={{ color: '#94A3B8' }}>{s}</span>
              </div>
            ))}
            <p className="font-mono text-[10px] tracking-widest mt-3 mb-2" style={{ color: '#E8003D' }}>WEAKNESSES</p>
            {player.weaknesses.map((w, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <span style={{ color: '#E8003D', fontSize: 10 }}>✗</span>
                <span className="font-mono text-[11px]" style={{ color: '#94A3B8' }}>{w}</span>
              </div>
            ))}
          </div>

          {/* Role Suitability */}
          <div>
            <p className="font-mono text-[10px] tracking-widest mb-2" style={{ color: '#7C3AED' }}>ROLE SUITABILITY</p>
            {Object.entries(player.role_suitability).map(([role, val]) => (
              <div key={role} className="flex items-center gap-2 py-1">
                <span className="font-mono text-[9px] w-16" style={{ color: '#6B7280' }}>{role.toUpperCase()}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${val}%`, background: '#7C3AED' }} />
                </div>
                <span className="font-mono text-[9px] w-8 text-right" style={{ color: '#94A3B8' }}>{val}%</span>
              </div>
            ))}
          </div>

          {/* Comparison */}
          <div>
            <p className="font-mono text-[10px] tracking-widest mb-2" style={{ color: '#6B7280' }}>SIMILAR PLAYERS</p>
            <div className="flex flex-wrap gap-2">
              {player.comparison_players.map(name => (
                <span
                  key={name}
                  className="font-mono text-[10px] px-2 py-1 rounded-[2px] cursor-pointer transition-colors"
                  style={{ background: '#1A1D27', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}