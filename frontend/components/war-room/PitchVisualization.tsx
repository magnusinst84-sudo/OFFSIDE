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

  const homePlayers = lineups?.home_players.length ? lineups.home_players : defaultHome
  const awayPlayers = lineups?.away_players.length ? lineups.away_players : defaultAway

  return (
    <div className="flex flex-col h-full">
      {/* Overlay Toggles */}
      <div className="flex items-center justify-end gap-1 mb-2 px-2">
        {overlayButtons.map(btn => (
          <button
            key={btn.id}
            onClick={() => setOverlay(btn.id)}
            className="font-mono text-[10px] tracking-widest px-2.5 py-1 rounded-[2px] transition-all duration-150"
            style={{
              background: overlay === btn.id ? 'rgba(0,255,135,0.1)' : 'transparent',
              color: overlay === btn.id ? '#00FF87' : '#6B7280',
              border: overlay === btn.id ? '1px solid rgba(0,255,135,0.2)' : '1px solid rgba(255,255,255,0.04)',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Pitch SVG */}
      <div className="relative flex-1 rounded-[4px] overflow-hidden" style={{ background: '#0D1F14', minHeight: 320 }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* Pitch lines */}
          <g stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" fill="none">
            {/* Outer boundary */}
            <rect x="4" y="2" width="92" height="96" />
            {/* Halfway line */}
            <line x1="4" y1="50" x2="96" y2="50" />
            {/* Center circle */}
            <circle cx="50" cy="50" r="9.5" />
            {/* Center dot */}
            <circle cx="50" cy="50" r="0.6" fill="rgba(255,255,255,0.2)" stroke="none" />
            {/* Top penalty area */}
            <rect x="22" y="2" width="56" height="16" />
            {/* Top goal area */}
            <rect x="35" y="2" width="30" height="6" />
            {/* Top penalty spot */}
            <circle cx="50" cy="13" r="0.5" fill="rgba(255,255,255,0.2)" stroke="none" />
            {/* Top penalty arc */}
            <path d="M 40 18 A 10 10 0 0 1 60 18" />
            {/* Bottom penalty area */}
            <rect x="22" y="82" width="56" height="16" />
            {/* Bottom goal area */}
            <rect x="35" y="92" width="30" height="6" />
            {/* Bottom penalty spot */}
            <circle cx="50" cy="87" r="0.5" fill="rgba(255,255,255,0.2)" stroke="none" />
            {/* Bottom penalty arc */}
            <path d="M 40 82 A 10 10 0 0 0 60 82" />
            {/* Corner arcs */}
            <path d="M 4 5 A 3 3 0 0 1 7 2" />
            <path d="M 93 2 A 3 3 0 0 1 96 5" />
            <path d="M 4 95 A 3 3 0 0 0 7 98" />
            <path d="M 93 98 A 3 3 0 0 0 96 95" />
            {/* Goals */}
            <rect x="43" y="0" width="14" height="2" strokeWidth="0.6" stroke="rgba(255,255,255,0.25)" />
            <rect x="43" y="98" width="14" height="2" strokeWidth="0.6" stroke="rgba(255,255,255,0.25)" />
          </g>

          {/* Pressure overlay */}
          {overlay === 'pressure' && (
            <g opacity="0.6">
              <circle cx="50" cy="28" r="18" fill="rgba(232,0,61,0.15)" />
              <circle cx="72" cy="32" r="10" fill="rgba(232,0,61,0.1)" />
              <circle cx="30" cy="75" r="12" fill="rgba(0,255,135,0.1)" />
              <circle cx="50" cy="72" r="14" fill="rgba(0,255,135,0.08)" />
            </g>
          )}

          {/* Passing overlay */}
          {overlay === 'passing' && (
            <g stroke="#3B82F6" strokeOpacity="0.4" strokeWidth="0.6" fill="none">
              <line x1="50" y1="90" x2="62" y2="75" markerEnd="url(#arrow)" />
              <line x1="62" y1="75" x2="70" y2="55" markerEnd="url(#arrow)" />
              <line x1="70" y1="55" x2="78" y2="30" markerEnd="url(#arrow)" />
              <line x1="50" y1="90" x2="38" y2="75" />
              <line x1="38" y1="75" x2="30" y2="55" />
              <line x1="30" y1="55" x2="50" y2="28" />
              <line x1="50" y1="55" x2="50" y2="28" />
              <text x="24" y="46" fontFamily="IBM Plex Mono" fontSize="2.5" fill="#3B82F6" fillOpacity="0.5">(estimated)</text>
            </g>
          )}

          {/* Formation overlay */}
          {overlay === 'formation' && (
            <g>
              {/* Home players — green */}
              {homePlayers.map(p => (
                <g key={`home-${p.id}`}>
                  <circle cx={p.x} cy={p.y} r="3.2" fill="#00FF87" fillOpacity="0.9" />
                  <circle cx={p.x} cy={p.y} r="3.2" fill="none" stroke="#00FF87" strokeWidth="0.5" />
                  <text x={p.x} y={p.y + 0.8} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="2.2" fill="#050508" fontWeight="bold">
                    {p.number}
                  </text>
                </g>
              ))}
              {/* Away players — red */}
              {awayPlayers.map(p => (
                <g key={`away-${p.id}`}>
                  <circle cx={p.x} cy={p.y} r="3.2" fill="#E8003D" fillOpacity="0.9" />
                  <text x={p.x} y={p.y + 0.8} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="2.2" fill="#fff" fontWeight="bold">
                    {p.number}
                  </text>
                </g>
              ))}
              {/* Ball */}
              <circle cx="50" cy="50" r="1.8" fill="white" fillOpacity="0.9" style={{ filter: 'drop-shadow(0 0 2px white)' }} />
            </g>
          )}
        </svg>

        {/* Formation labels */}
        {lineups && (
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            <span className="font-mono text-[10px]" style={{ color: '#00FF87' }}>{lineups.home}</span>
            <span className="font-mono text-[10px]" style={{ color: '#E8003D' }}>{lineups.away}</span>
          </div>
        )}
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
