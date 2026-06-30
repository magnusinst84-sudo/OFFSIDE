'use client'
import React from 'react'
import type { MatchStats, PredictResponse, MomentumPoint } from '@/lib/types'
import { SkeletonStatRow, Skeleton } from '@/components/shared/Skeleton'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts'

const STAT_ROWS = [
  { key: 'possession', label: 'POSSESSION', homeKey: 'possession_home', awayKey: 'possession_away', unit: '%' },
  { key: 'shots', label: 'SHOTS', homeKey: 'shots_home', awayKey: 'shots_away', unit: '' },
  { key: 'on_target', label: 'ON TARGET', homeKey: 'shots_on_target_home', awayKey: 'shots_on_target_away', unit: '' },
  { key: 'corners', label: 'CORNERS', homeKey: 'corners_home', awayKey: 'corners_away', unit: '' },
  { key: 'fouls', label: 'FOULS', homeKey: 'fouls_home', awayKey: 'fouls_away', unit: '' },
  { key: 'yellows', label: 'YELLOWS', homeKey: 'yellow_cards_home', awayKey: 'yellow_cards_away', unit: '' },
  { key: 'reds', label: 'REDS', homeKey: 'red_cards_home', awayKey: 'red_cards_away', unit: '' },
  { key: 'attacks', label: 'ATTACKS', homeKey: 'dangerous_attacks_home', awayKey: 'dangerous_attacks_away', unit: '' },
] as const

interface StatsPanelProps {
  stats?: MatchStats
  prediction?: PredictResponse
  momentumHistory: MomentumPoint[]
  currentMinute?: number
  isLoading: boolean
}

export function StatsPanel({ stats, prediction, momentumHistory, currentMinute, isLoading }: StatsPanelProps) {
  const homeWin = prediction ? Math.round(prediction.home_win_prob * 100) : null
  const draw = prediction ? Math.round(prediction.draw_prob * 100) : null
  const awayWin = prediction ? Math.round(prediction.away_win_prob * 100) : null
  const xgHome = stats?.xg_home ?? null
  const xgAway = stats?.xg_away ?? null

  return (
    <div className="flex flex-col gap-0 h-full overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1A1D27 transparent' }}>
      {/* Win Probability */}
      <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[11px] tracking-widest" style={{ color: '#94A3B8' }}>WIN PROBABILITY</span>
          {prediction?.upset_alert && (
            <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 rounded-[2px]"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
              ⚡ UPSET
            </span>
          )}
        </div>
        <div className="flex justify-between items-end gap-1">
          {[
            { label: 'HOME', value: homeWin, color: '#00FF87' },
            { label: 'DRAW', value: draw, color: '#F59E0B' },
            { label: 'AWAY', value: awayWin, color: '#E8003D' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 flex flex-col items-center">
              {isLoading || value === null ? (
                <Skeleton width={48} height={36} className="mb-1" />
              ) : (
                <span className="font-mono font-semibold" style={{ fontSize: 28, color, lineHeight: 1 }}>
                  {value}<span style={{ fontSize: 14, opacity: 0.7 }}>%</span>
                </span>
              )}
              <span className="font-mono text-[10px] tracking-wider mt-1" style={{ color: '#6B7280' }}>{label}</span>
              <div className="w-full h-1 mt-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value ?? 0}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
        {prediction && (
          <div className="mt-3 font-mono text-[10px] tracking-wider" style={{ color: '#6B7280' }}>
            ELO {Math.round(prediction.home_elo)} vs {Math.round(prediction.away_elo)}
          </div>
        )}
      </div>

      {/* Expected Goals */}
      <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="font-mono text-[11px] tracking-widest block mb-2" style={{ color: '#94A3B8' }}>EXPECTED GOALS</span>
        <div className="flex justify-between items-center">
          {isLoading ? (
            <>
              <Skeleton width={48} height={32} />
              <Skeleton width={16} height={16} />
              <Skeleton width={48} height={32} />
            </>
          ) : (
            <>
              <span className="font-mono font-semibold" style={{ fontSize: 28, color: '#00FF87' }}>
                {xgHome !== null ? xgHome.toFixed(2) : '—'}
              </span>
              <span className="font-mono text-[11px]" style={{ color: '#6B7280' }}>xG</span>
              <span className="font-mono font-semibold" style={{ fontSize: 28, color: '#E8003D' }}>
                {xgAway !== null ? xgAway.toFixed(2) : '—'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Live Stats */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="font-mono text-[11px] tracking-widest block mb-2" style={{ color: '#94A3B8' }}>LIVE STATS</span>
        <div className="flex flex-col">
          {STAT_ROWS.map((row, i) => {
            const homeVal = stats ? (stats as unknown as Record<string, number>)[row.homeKey] : null
            const awayVal = stats ? (stats as unknown as Record<string, number>)[row.awayKey] : null
            return (
              <div key={row.key}>
                {isLoading ? <SkeletonStatRow /> : (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="font-mono font-semibold text-[14px]" style={{ color: '#F0F4F8', minWidth: 32 }}>
                      {homeVal ?? 0}{row.unit}
                    </span>
                    <span className="font-mono text-[9px] tracking-widest" style={{ color: '#6B7280' }}>{row.label}</span>
                    <span className="font-mono font-semibold text-[14px] text-right" style={{ color: '#F0F4F8', minWidth: 32 }}>
                      {awayVal ?? 0}{row.unit}
                    </span>
                  </div>
                )}
                {i < STAT_ROWS.length - 1 && (
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Momentum Graph */}
      <div className="p-4">
        <span className="font-mono text-[11px] tracking-widest block mb-3" style={{ color: '#94A3B8' }}>MOMENTUM FLOW</span>
        <div style={{ height: 120 }}>
          {momentumHistory.length < 2 ? (
            <div className="flex items-center justify-center h-full">
              <span className="font-mono text-[10px]" style={{ color: '#6B7280' }}>AWAITING MATCH DATA...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={momentumHistory} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="homeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF87" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00FF87" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="minute" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: '#6B7280' }} />
                <YAxis domain={[0, 100]} tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'IBM Plex Mono', fontSize: 11 }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                {currentMinute && (
                  <ReferenceLine x={currentMinute} stroke="#94A3B8" strokeDasharray="3 3" strokeOpacity={0.5} />
                )}
                <Area type="monotone" dataKey="home" stroke="#00FF87" fill="url(#homeGrad)" strokeWidth={1.5} dot={false} />
                <Area type="monotone" dataKey="away" stroke="#E8003D" fill="none" strokeWidth={1} strokeDasharray="3 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
