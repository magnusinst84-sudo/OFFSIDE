'use client'
import React, { useState } from 'react'
import type { Formation, MatchEvent } from '@/lib/types'

type OverlayType = 'formation' | 'pressure' | 'passing'

interface PitchVisualizationProps {
  lineups?: Formation
  events?: MatchEvent[]
  currentMinute?: number
}

export function PitchVisualization({ lineups, events = [], currentMinute = 90 }: PitchVisualizationProps) {
  const [overlay, setOverlay] = useState<OverlayType>('formation')

  const overlayButtons: { id: OverlayType; label: string }[] = [
    { id: 'formation', label: 'FORM' },
    { id: 'pressure', label: 'PRESS' },
    { id: 'passing', label: 'PASS' },
  ]

  // Default 4-3-3 positions if no lineups
  const defaultHome = [
    { id: 0, name: 'GK', number: 1, position: 'G', x: 50, y: 90 },
    { id: 1, name: 'RB', number: 2, position: 'D', x: 80, y: 75 },
    { id: 2, name: 'CB', number: 3, position: 'D', x: 62, y: 75 },
    { id: 3, name: 'CB', number: 4, position: 'D', x: 38, y: 75 },
    { id: 4, name: 'LB', number: 5, position: 'D', x: 20, y: 75 },
    { id: 5, name: 'CM', number: 8, position: 'M', x: 70, y: 55 },
    { id: 6, name: 'CM', number: 6, position: 'M', x: 50, y: 55 },
    { id: 7, name: 'CM', number: 10, position: 'M', x: 30, y: 55 },
    { id: 8, name: 'RW', number: 7, position: 'F', x: 78, y: 30 },
    { id: 9, name: 'ST', number: 9, position: 'F', x: 50, y: 28 },
    { id: 10, name: 'LW', number: 11, position: 'F', x: 22, y: 30 },
  ]

  const defaultAway = [
    { id: 11, name: 'GK', number: 1, position: 'G', x: 50, y: 10 },
    { id: 12, name: 'RB', number: 2, position: 'D', x: 80, y: 25 },
    { id: 13, name: 'CB', number: 3, position: 'D', x: 62, y: 25 },
    { id: 14, name: 'CB', number: 4, position: 'D', x: 38, y: 25 },
    { id: 15, name: 'LB', number: 5, position: 'D', x: 20, y: 25 },
    { id: 16, name: 'CM', number: 8, position: 'M', x: 70, y: 45 },
    { id: 17, name: 'CM', number: 6, position: 'M', x: 50, y: 45 },
    { id: 18, name: 'CM', number: 10, position: 'M', x: 30, y: 45 },
    { id: 19, name: 'RW', number: 7, position: 'F', x: 78, y: 70 },
    { id: 20, name: 'ST', number: 9, position: 'F', x: 50, y: 72 },
    { id: 21, name: 'LW', number: 11, position: 'F', x: 22, y: 70 },
  ]

  // Normalize players to prevent midpoint node collisions
  // Home plays on lower half (y: 54 -> 90), Away plays on upper half (y: 10 -> 46)
  const homePlayers = (lineups?.home_players?.length ? lineups.home_players : defaultHome).map(p => ({
    ...p,
    // Ensure home stays strictly in [54, 92]
    y: p.y < 50 ? 50 + (p.y * 0.42) : Math.min(92, Math.max(54, p.y)),
    x: Math.min(92, Math.max(8, p.x)),
  }))

  const awayPlayers = (lineups?.away_players?.length ? lineups.away_players : defaultAway).map(p => ({
    ...p,
    // Ensure away stays strictly in [8, 46]
    y: p.y > 50 ? (100 - p.y) * 0.42 + 8 : Math.min(46, Math.max(8, p.y)),
    x: Math.min(92, Math.max(8, p.x)),
  }))

  return (
    <div className="flex flex-col h-full">
      {/* Overlay Toggles */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: '#38BDF8' }} />
            <span className="font-mono text-[11px] font-semibold" style={{ color: '#F0F4F8' }}>{lineups?.home || 'HOME'}</span>
          </div>
          <span className="font-mono text-[10px]" style={{ color: '#6B7280' }}>vs</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: '#F43F5E' }} />
            <span className="font-mono text-[11px] font-semibold" style={{ color: '#F0F4F8' }}>{lineups?.away || 'AWAY'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {overlayButtons.map(btn => (
            <button
              key={btn.id}
              onClick={() => setOverlay(btn.id)}
              className="font-mono text-[10px] tracking-wider px-2.5 py-1 rounded-[4px] transition-all duration-150 cursor-pointer"
              style={{
                background: overlay === btn.id ? 'rgba(0,255,135,0.12)' : 'rgba(255,255,255,0.02)',
                color: overlay === btn.id ? '#00FF87' : '#94A3B8',
                border: overlay === btn.id ? '1px solid rgba(0,255,135,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pitch SVG */}
      <div className="relative flex-1 rounded-[6px] overflow-hidden" style={{ background: '#0a1710', border: '1px solid rgba(255,255,255,0.06)', minHeight: 320 }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* Pitch lines */}
          <g stroke="rgba(255,255,255,0.14)" strokeWidth="0.45" fill="none">
            {/* Outer boundary */}
            <rect x="4" y="2" width="92" height="96" />
            {/* Halfway line */}
            <line x1="4" y1="50" x2="96" y2="50" strokeDasharray="1.5 1.5" />
            {/* Center circle */}
            <circle cx="50" cy="50" r="9.5" />
            {/* Center dot */}
            <circle cx="50" cy="50" r="0.6" fill="rgba(255,255,255,0.3)" stroke="none" />
            {/* Top penalty area */}
            <rect x="22" y="2" width="56" height="16" />
            {/* Top goal area */}
            <rect x="35" y="2" width="30" height="6" />
            {/* Top penalty spot */}
            <circle cx="50" cy="13" r="0.5" fill="rgba(255,255,255,0.3)" stroke="none" />
            {/* Top penalty arc */}
            <path d="M 40 18 A 10 10 0 0 1 60 18" />
            {/* Bottom penalty area */}
            <rect x="22" y="82" width="56" height="16" />
            {/* Bottom goal area */}
            <rect x="35" y="92" width="30" height="6" />
            {/* Bottom penalty spot */}
            <circle cx="50" cy="87" r="0.5" fill="rgba(255,255,255,0.3)" stroke="none" />
            {/* Bottom penalty arc */}
            <path d="M 40 82 A 10 10 0 0 0 60 82" />
            {/* Corner arcs */}
            <path d="M 4 5 A 3 3 0 0 1 7 2" />
            <path d="M 93 2 A 3 3 0 0 1 96 5" />
            <path d="M 4 95 A 3 3 0 0 0 7 98" />
            <path d="M 93 98 A 3 3 0 0 0 96 95" />
            {/* Goals */}
            <rect x="43" y="0" width="14" height="2" strokeWidth="0.6" stroke="rgba(255,255,255,0.3)" />
            <rect x="43" y="98" width="14" height="2" strokeWidth="0.6" stroke="rgba(255,255,255,0.3)" />
          </g>

          {/* Pressure overlay */}
          {overlay === 'pressure' && (
            <g opacity="0.65">
              <circle cx="50" cy="24" r="18" fill="rgba(244,63,94,0.15)" />
              <circle cx="72" cy="28" r="12" fill="rgba(244,63,94,0.12)" />
              <circle cx="30" cy="74" r="14" fill="rgba(56,189,248,0.14)" />
              <circle cx="50" cy="76" r="16" fill="rgba(56,189,248,0.1)" />
            </g>
          )}

          {/* Passing overlay */}
          {overlay === 'passing' && (
            <g stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="0.6" fill="none">
              <line x1="50" y1="90" x2="62" y2="76" />
              <line x1="62" y1="76" x2="70" y2="60" />
              <line x1="70" y1="60" x2="78" y2="54" />
              <line x1="50" y1="90" x2="38" y2="76" />
              <line x1="38" y1="76" x2="30" y2="60" />
              <text x="24" y="48" fontFamily="IBM Plex Mono" fontSize="2.4" fill="#38BDF8" fillOpacity="0.6">(estimated tactical lanes)</text>
            </g>
          )}

          {/* Formation overlay */}
          {overlay === 'formation' && (
            <g>
              {/* Home players — Cyan (#38BDF8) */}
              {homePlayers.map(p => (
                <g key={`home-${p.id}`} className="cursor-pointer group">
                  <circle cx={p.x} cy={p.y} r="3.4" fill="#0F172A" stroke="#38BDF8" strokeWidth="0.9" />
                  <text x={p.x} y={p.y + 0.9} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="2.4" fill="#38BDF8" fontWeight="bold">
                    {p.number}
                  </text>
                  <text x={p.x} y={p.y + 4.8} textAnchor="middle" fontFamily="Inter" fontSize="1.8" fill="#F0F4F8" opacity="0.85">
                    {p.name.length > 8 ? p.name.slice(0, 7) + '…' : p.name}
                  </text>
                </g>
              ))}
              {/* Away players — Coral (#F43F5E) */}
              {awayPlayers.map(p => (
                <g key={`away-${p.id}`} className="cursor-pointer group">
                  <circle cx={p.x} cy={p.y} r="3.4" fill="#0F172A" stroke="#F43F5E" strokeWidth="0.9" />
                  <text x={p.x} y={p.y + 0.9} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="2.4" fill="#F43F5E" fontWeight="bold">
                    {p.number}
                  </text>
                  <text x={p.x} y={p.y - 4} textAnchor="middle" fontFamily="Inter" fontSize="1.8" fill="#F0F4F8" opacity="0.85">
                    {p.name.length > 8 ? p.name.slice(0, 7) + '…' : p.name}
                  </text>
                </g>
              ))}
              {/* Ball */}
              <circle cx="50" cy="50" r="1.8" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.8))' }} />
            </g>
          )}
        </svg>
      </div>

      {/* Event Timeline */}
      <div className="mt-2 relative" style={{ height: 40 }}>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        {/* Minute markers */}
        {[0, 15, 30, 45, 60, 75, 90].map(min => (
          <div
            key={min}
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${(min / 90) * 100}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div style={{ width: 1, height: 8, background: 'rgba(255,255,255,0.15)' }} />
            <span className="font-mono text-[8px] mt-0.5" style={{ color: '#6B7280' }}>{min}&apos;</span>
          </div>
        ))}
        {/* Events */}
        {events.map((ev, i) => {
          const left = `${Math.min((ev.minute / 90) * 100, 98)}%`
          const color = ev.type === 'goal' ? '#00FF87' : ev.type === 'yellow_card' ? '#F59E0B' : ev.type === 'red_card' ? '#E8003D' : '#94A3B8'
          const symbol = ev.type === 'goal' ? '⚽' : ev.type === 'yellow_card' ? '🟨' : ev.type === 'red_card' ? '🟥' : '↔'
          return (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left, zIndex: 10 }}
              title={`${ev.minute}' ${ev.player} (${ev.detail || ev.type})`}
            >
              <div
                className="w-2 h-2 rounded-full flex items-center justify-center text-[8px]"
                style={{ background: color, transform: 'translate(-50%, -50%)' }}
              />
              <div
                className="absolute bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none px-2 py-1 rounded-[2px]"
                style={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.08)', zIndex: 20 }}
              >
                <span className="font-mono text-[9px]" style={{ color: '#F0F4F8' }}>{ev.minute}&apos; {ev.player}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
