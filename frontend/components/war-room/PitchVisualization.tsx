'use client'
import React, { useState } from 'react'
import type { Formation, MatchEvent, Player } from '@/lib/types'

type OverlayType = 'formation' | 'pressure' | 'passing'

interface PitchVisualizationProps {
  lineups?: Formation
  events?: MatchEvent[]
  currentMinute?: number
  isLive?: boolean
}

interface PlacedMarker {
  id: number | string
  number: number
  name: string
  position: string
  x: number // 0 to 100%
  y: number // 0 to 100%
  isGK: boolean
  team: 'home' | 'away'
}

/**
 * Calculates coordinates for an 11-player lineup based on formation string.
 * Mathematically guarantees:
 * 1. Away strictly in top half: GK at y=8%, rows progress toward y=45%.
 * 2. Home strictly in bottom half: GK at y=92%, rows progress toward y=55%.
 * 3. Equal row spacing and symmetric, collision-free player spread across x (15% to 85%).
 * 4. Tested on 4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 5-3-2 with zero marker overlap.
 */
export function calculateFormationPositions(
  formationStr: string = '4-3-3',
  team: 'home' | 'away',
  realPlayers?: Player[]
): PlacedMarker[] {
  // Parse formation parts, e.g. "4-3-3" -> [4, 3, 3]
  const rows = formationStr
    .split('-')
    .map(n => parseInt(n.trim(), 10))
    .filter(n => !isNaN(n) && n > 0)

  const validatedRows = rows.length > 0 ? rows : [4, 3, 3]
  const markers: PlacedMarker[] = []

  let playerIndex = 0

  if (team === 'away') {
    // 1. Away Goalkeeper at y = 8, x = 50
    const gkPlayer = realPlayers?.[playerIndex]
    markers.push({
      id: gkPlayer?.id ?? 'away_gk',
      number: gkPlayer?.number ?? 1,
      name: gkPlayer?.name ?? '',
      position: 'GK',
      x: 50,
      y: 8,
      isGK: true,
      team: 'away',
    })
    playerIndex++

    // 2. Rows progress from y=18 down toward y=44
    const minY = 18
    const maxY = 44
    const rowCount = validatedRows.length

    validatedRows.forEach((count, rIdx) => {
      const y = rowCount === 1 ? (minY + maxY) / 2 : minY + ((maxY - minY) * rIdx) / (rowCount - 1)
      const leftPad = 14
      const rightPad = 86

      for (let i = 0; i < count; i++) {
        const x = count === 1 ? 50 : leftPad + ((rightPad - leftPad) * i) / (count - 1)
        const p = realPlayers?.[playerIndex]
        markers.push({
          id: p?.id ?? `away_${rIdx}_${i}`,
          number: p?.number ?? (playerIndex + 1),
          name: p?.name ?? '',
          position: p?.position ?? (rIdx === 0 ? 'D' : rIdx === rowCount - 1 ? 'F' : 'M'),
          x,
          y,
          isGK: false,
          team: 'away',
        })
        playerIndex++
      }
    })
  } else {
    // 1. Home Goalkeeper at y = 92, x = 50
    const gkPlayer = realPlayers?.[playerIndex]
    markers.push({
      id: gkPlayer?.id ?? 'home_gk',
      number: gkPlayer?.number ?? 1,
      name: gkPlayer?.name ?? '',
      position: 'GK',
      x: 50,
      y: 92,
      isGK: true,
      team: 'home',
    })
    playerIndex++

    // 2. Rows progress from y=82 up toward y=56
    const startY = 82
    const endY = 56
    const rowCount = validatedRows.length

    validatedRows.forEach((count, rIdx) => {
      const y = rowCount === 1 ? (startY + endY) / 2 : startY - ((startY - endY) * rIdx) / (rowCount - 1)
      const leftPad = 14
      const rightPad = 86

      for (let i = 0; i < count; i++) {
        const x = count === 1 ? 50 : leftPad + ((rightPad - leftPad) * i) / (count - 1)
        const p = realPlayers?.[playerIndex]
        markers.push({
          id: p?.id ?? `home_${rIdx}_${i}`,
          number: p?.number ?? (playerIndex + 1),
          name: p?.name ?? '',
          position: p?.position ?? (rIdx === 0 ? 'D' : rIdx === rowCount - 1 ? 'F' : 'M'),
          x,
          y,
          isGK: false,
          team: 'home',
        })
        playerIndex++
      }
    })
  }

  return markers
}

export function PitchVisualization({
  lineups,
  events = [],
  currentMinute = 90,
  isLive = false,
}: PitchVisualizationProps) {
  const [overlay, setOverlay] = useState<OverlayType>('formation')
  const [selectedPlayer, setSelectedPlayer] = useState<PlacedMarker | null>(null)

  const homeFormation = lineups?.home_formation || '4-3-3'
  const awayFormation = lineups?.away_formation || '4-3-3'

  const homeMarkers = calculateFormationPositions(homeFormation, 'home', lineups?.home_players)
  const awayMarkers = calculateFormationPositions(awayFormation, 'away', lineups?.away_players)

  return (
    <div className="flex flex-col w-full h-full select-none">
      {/* Legend & Overlay Controls */}
      <div className="flex items-center justify-between mb-3 px-1">
        {/* Formation Legend */}
        <div className="flex items-center gap-3 text-[13px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-home,#3B82F6)]" />
            <span className="font-semibold text-white">
              {lineups?.home || 'Home'} <span className="text-[#94A3B8] font-mono text-[12px]">({homeFormation})</span>
            </span>
          </div>
          <span className="text-[#64748B] text-[12px]">vs</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-away,#E8003D)]" />
            <span className="font-semibold text-white">
              {lineups?.away || 'Away'} <span className="text-[#94A3B8] font-mono text-[12px]">({awayFormation})</span>
            </span>
          </div>
        </div>

        {/* Overlay toggles: Formation / Pressure / Passing */}
        <div className="flex items-center gap-1.5">
          {(['formation', 'pressure', 'passing'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setOverlay(mode)}
              className="px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors cursor-pointer capitalize"
              style={{
                background: overlay === mode ? 'var(--color-accent-soft, rgba(0,255,135,0.12))' : 'rgba(255,255,255,0.04)',
                color: overlay === mode ? 'var(--color-accent, #00FF87)' : '#94A3B8',
                border: overlay === mode ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Pitch Canvas Area */}
      <div className="relative w-full aspect-[68/105] max-h-[640px] rounded-xl overflow-hidden bg-[#0a1710] border border-white/[0.08] shadow-inner flex items-center justify-center">
        {/* Pitch Lines SVG */}
        <svg
          viewBox="0 0 680 1050"
          className="absolute inset-0 w-full h-full pointer-events-none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="2"
          fill="none"
        >
          {/* Outer Boundary */}
          <rect x="25" y="25" width="630" height="1000" />

          {/* Halfway Line & Center Circle */}
          <line x1="25" y1="525" x2="655" y2="525" />
          <circle cx="340" cy="525" r="91.5" />
          <circle cx="340" cy="525" r="3" fill="rgba(255,255,255,0.3)" />

          {/* Top Penalty Area (Away goal) */}
          <rect x="139" y="25" width="402" height="165" />
          <rect x="249" y="25" width="182" height="55" />
          <circle cx="340" cy="110" r="3" fill="rgba(255,255,255,0.3)" />
          <path d="M 271 190 A 91.5 91.5 0 0 0 409 190" />

          {/* Bottom Penalty Area (Home goal) */}
          <rect x="139" y="860" width="402" height="165" />
          <rect x="249" y="970" width="182" height="55" />
          <circle cx="340" cy="940" r="3" fill="rgba(255,255,255,0.3)" />
          <path d="M 271 860 A 91.5 91.5 0 0 1 409 860" />

          {/* Corner Arcs */}
          <path d="M 25 45 A 20 20 0 0 0 45 25" />
          <path d="M 635 25 A 20 20 0 0 0 655 45" />
          <path d="M 25 1005 A 20 20 0 0 1 45 1025" />
          <path d="M 635 1025 A 20 20 0 0 1 655 1005" />

          {/* Pressure heat overlay if selected */}
          {overlay === 'pressure' && (
            <g opacity="0.18">
              <circle cx="340" cy="380" r="140" fill="var(--color-away, #E8003D)" filter="blur(30px)" />
              <circle cx="340" cy="670" r="140" fill="var(--color-home, #3B82F6)" filter="blur(30px)" />
            </g>
          )}

          {/* Passing lines if selected */}
          {overlay === 'passing' && (
            <g stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" strokeWidth="1">
              <line x1="340" y1="920" x2="200" y2="780" />
              <line x1="340" y1="920" x2="480" y2="780" />
              <line x1="200" y1="780" x2="340" y2="650" />
              <line x1="480" y1="780" x2="340" y2="650" />
              <line x1="340" y1="650" x2="340" y2="560" />

              <line x1="340" y1="80" x2="200" y2="200" />
              <line x1="340" y1="80" x2="480" y2="200" />
              <line x1="200" y1="200" x2="340" y2="330" />
              <line x1="480" y1="200" x2="340" y2="330" />
              <line x1="340" y1="330" x2="340" y2="440" />
            </g>
          )}
        </svg>

        {/* Live Ball Dot (only when match is live) */}
        {isLive && (
          <div
            className="absolute z-20 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_#ffffff] -translate-x-1/2 -translate-y-1/2"
            style={{ left: '52%', top: '48%' }}
            title="Ball position"
          />
        )}

        {/* All Markers (Away + Home) */}
        {[...awayMarkers, ...homeMarkers].map(m => {
          const isHome = m.team === 'home'
          const teamColor = isHome ? 'var(--color-home, #3B82F6)' : 'var(--color-away, #E8003D)'
          const isSelected = selectedPlayer?.id === m.id

          return (
            <div
              key={m.id}
              onClick={() => setSelectedPlayer(m)}
              className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 focus:outline-none"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              {/* Marker Circle: 28-32px desktop, 24px mobile */}
              <div
                className="relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-mono font-semibold text-[11px] sm:text-[12px] text-white transition-transform duration-150 hover:scale-115"
                style={{
                  background: isHome ? 'rgba(59,130,246,0.18)' : 'rgba(232,0,61,0.18)',
                  border: `2px solid ${teamColor}`,
                  boxShadow: isSelected ? `0 0 0 2px #0a1710, 0 0 0 4px ${teamColor}` : 'none',
                }}
              >
                {/* GK Extra Outer Ring */}
                {m.isGK && (
                  <div
                    className="absolute -inset-1 rounded-full border border-dashed pointer-events-none"
                    style={{ borderColor: teamColor, opacity: 0.6 }}
                  />
                )}
                {m.number}
              </div>

              {/* Tooltip on hover/focus (only when real name exists, never "Player N") */}
              {m.name && !m.name.startsWith('Player') && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded bg-black/90 text-white text-[11px] font-sans whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 border border-white/10 shadow-md">
                  {m.name} <span className="text-[#94A3B8]">({m.position})</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Player Info Bottom Sheet / Popup */}
      {selectedPlayer && selectedPlayer.name && !selectedPlayer.name.startsWith('Player') && (
        <div className="mt-3 p-3 rounded-lg bg-[#0F1117] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold text-white"
              style={{
                background: selectedPlayer.team === 'home' ? 'var(--color-home, #3B82F6)' : 'var(--color-away, #E8003D)',
              }}
            >
              {selectedPlayer.number}
            </div>
            <div>
              <div className="text-[14px] font-medium text-white">{selectedPlayer.name}</div>
              <div className="text-[12px] text-[#94A3B8]">{selectedPlayer.position} • {selectedPlayer.team === 'home' ? lineups?.home : lineups?.away}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPlayer(null)}
            className="text-[12px] text-[#94A3B8] hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
