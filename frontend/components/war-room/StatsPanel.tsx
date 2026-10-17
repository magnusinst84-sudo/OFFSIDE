'use client'
import React from 'react'
import type { MatchStats, PredictResponse, MomentumPoint, Match } from '@/lib/types'
import { StatBar, ProbabilityBar, FallbackBadge } from '@/components/shared/Primitives'
import { MomentumRing } from './MomentumRing'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, ReferenceLine } from 'recharts'

interface StatsPanelProps {
  match?: Match | null
  stats?: MatchStats
  prediction?: PredictResponse
  momentumHistory: MomentumPoint[]
  currentMinute?: number
  isLoading: boolean
}

export function StatsPanel({
  match,
  stats,
  prediction,
  momentumHistory,
  currentMinute,
  isLoading,
}: StatsPanelProps) {
  const isUpcoming = match?.status === 'upcoming'
  const isLive = match?.status === 'live'

  const momentumScore = prediction?.momentum_score ?? 50
  const isDefaultElo = prediction && (prediction.home_elo === 1500 || prediction.away_elo === 1500)

  // Upcoming Match Preview State
  if (isUpcoming) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6 text-white">
        {/* Win Probability Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-white">Pre-match win probability</h3>
            {isDefaultElo && <FallbackBadge text="Limited data" />}
          </div>

          {prediction ? (
            <div className="flex flex-col gap-2">
              <ProbabilityBar
                home={prediction.home_win_prob}
                draw={prediction.draw_prob}
                away={prediction.away_win_prob}
                height={8}
              />
              <div className="text-[12px] text-[#94A3B8] text-center mt-1">
                {isDefaultElo
                  ? 'Not enough rating history for these teams.'
                  : `Elo rating: ${Math.round(prediction.home_elo)} vs ${Math.round(prediction.away_elo)}`}
              </div>
            </div>
          ) : (
            <div className="text-[13px] text-[#94A3B8]">Awaiting pre-match predictive model calculation...</div>
          )}
        </div>

        {/* Informational Message for Upcoming */}
        <div className="p-4 rounded-xl bg-[#0F1117] border border-white/[0.08] text-center flex flex-col items-center gap-1.5 mt-2">
          <span className="text-[14px] font-medium text-white">Match has not started</span>
          <span className="text-[13px] text-[#94A3B8]">
            Live stats, momentum curves, shot timeline, and expected goals will be available when the match starts.
          </span>
        </div>
      </div>
    )
  }

  // Live / Finished Match State
  const xgHome = stats?.xg_home ?? 0
  const xgAway = stats?.xg_away ?? 0

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 text-white">
      {/* 1. Win Probability */}
      {prediction && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-white">Live win probability</h3>
            {prediction.upset_alert && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-[rgba(245,158,11,0.14)] text-[#F59E0B] font-medium">
                Upset alert
              </span>
            )}
          </div>
          <ProbabilityBar
            home={prediction.home_win_prob}
            draw={prediction.draw_prob}
            away={prediction.away_win_prob}
            height={8}
          />
        </section>
      )}

      {/* 2. Momentum Ring + Sparkline */}
      <section className="flex flex-col gap-3 pt-3 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-white">Momentum flow</h3>
          <span className="text-[12px] text-[#94A3B8]">
            {momentumScore >= 50 ? `${Math.round(momentumScore)}% Home pressure` : `${Math.round(100 - momentumScore)}% Away pressure`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="shrink-0 flex items-center justify-center">
            <MomentumRing score={momentumScore} size={72} strokeWidth={4} animate={isLive} />
          </div>

          <div className="flex-1 h-[64px] rounded-lg bg-[#0F1117] p-1 border border-white/[0.06]">
            {momentumHistory.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={momentumHistory} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <defs>
                    <linearGradient id="momentumGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-home, #3B82F6)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-away, #E8003D)" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <ReferenceLine y={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="2 2" />
                  <Area
                    type="monotone"
                    dataKey="home"
                    stroke="var(--color-accent, #00FF87)"
                    strokeWidth={1.5}
                    fill="url(#momentumGrad)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[12px] text-[#64748B]">
                Momentum tracking active
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Expected Goals (xG) */}
      <section className="flex flex-col gap-2 pt-3 border-t border-white/[0.08]">
        <span className="text-[12px] text-[#94A3B8] text-center uppercase tracking-wider">Expected Goals (xG)</span>
        <div className="flex items-center justify-between px-6 py-2 rounded-lg bg-[#0F1117] border border-white/[0.06]">
          <span className="font-mono text-[24px] font-bold text-[var(--color-home,#3B82F6)]">
            {typeof xgHome === 'number' ? xgHome.toFixed(2) : '—'}
          </span>
          <span className="text-[12px] font-medium text-[#64748B] px-2 py-0.5 rounded bg-white/[0.04]">xG</span>
          <span className="font-mono text-[24px] font-bold text-[var(--color-away,#E8003D)]">
            {typeof xgAway === 'number' ? xgAway.toFixed(2) : '—'}
          </span>
        </div>
      </section>

      {/* 4. Live StatBar Rows (40px rows, 13px centered labels, 14px mono values) */}
      <section className="flex flex-col gap-2 pt-3 border-t border-white/[0.08]">
        <h3 className="text-[14px] font-semibold text-white mb-1">Match statistics</h3>
        
        {stats ? (
          <div className="flex flex-col gap-2">
            <StatBar
              label="Possession"
              homeValue={stats.possession_home}
              awayValue={stats.possession_away}
              unit="%"
            />
            <StatBar
              label="Total shots"
              homeValue={stats.shots_home}
              awayValue={stats.shots_away}
            />
            <StatBar
              label="Shots on target"
              homeValue={stats.shots_on_target_home}
              awayValue={stats.shots_on_target_away}
            />
            <StatBar
              label="Corner kicks"
              homeValue={stats.corners_home}
              awayValue={stats.corners_away}
            />
            <StatBar
              label="Fouls committed"
              homeValue={stats.fouls_home}
              awayValue={stats.fouls_away}
            />
            <StatBar
              label="Yellow cards"
              homeValue={stats.yellow_cards_home}
              awayValue={stats.yellow_cards_away}
            />
            {stats.red_cards_home > 0 || stats.red_cards_away > 0 ? (
              <StatBar
                label="Red cards"
                homeValue={stats.red_cards_home}
                awayValue={stats.red_cards_away}
              />
            ) : null}
            <StatBar
              label="Dangerous attacks"
              homeValue={stats.dangerous_attacks_home}
              awayValue={stats.dangerous_attacks_away}
            />
          </div>
        ) : (
          <div className="text-[13px] text-[#94A3B8]">Loading match statistics...</div>
        )}
      </section>
    </div>
  )
}
