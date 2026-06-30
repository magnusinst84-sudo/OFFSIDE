'use client'
import React from 'react'
import type { Match, PredictResponse } from '@/lib/types'
import { MomentumRing } from './MomentumRing'
import { LiveBadge } from '@/components/shared/LiveBadge'
import { Skeleton } from '@/components/shared/Skeleton'
import { MapPin } from 'lucide-react'

interface MatchHeaderProps {
  match?: Match | null
  prediction?: PredictResponse
  isLoading: boolean
}

export function MatchHeader({ match, prediction, isLoading }: MatchHeaderProps) {
  const momentumScore = prediction?.momentum_score ?? 50
  const homeGoals = match?.home_team.goals ?? match?.score?.home
  const awayGoals = match?.away_team.goals ?? match?.score?.away

  return (
    <div
      className="flex items-center justify-between px-6"
      style={{ height: 64, borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}
    >
      {/* Left: Competition */}
      <div className="flex items-center gap-3" style={{ minWidth: 200 }}>
        {isLoading ? (
          <Skeleton width={120} height={12} />
        ) : (
          <div className="flex flex-col">
            <span className="font-mono text-[10px] tracking-widest" style={{ color: '#6B7280' }}>
              {match?.competition ?? 'WORLD CUP 2026'}
            </span>
            {match?.status === 'live' && <LiveBadge size="sm" />}
          </div>
        )}
      </div>

      {/* Center: Score bug */}
      <div className="flex items-center gap-4 flex-1 justify-center">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton width={100} height={18} />
            <Skeleton width={80} height={40} />
            <Skeleton width={100} height={18} />
          </div>
        ) : (
          <>
            {/* Home team */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-[13px] tracking-wide text-right" style={{ color: '#F0F4F8', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {match?.home_team.name ?? 'HOME'}
              </span>
              <MomentumRing score={momentumScore} size={40} strokeWidth={2.5} />
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 px-4">
              <span className="font-mono font-bold" style={{ fontSize: 40, lineHeight: 1, color: '#F0F4F8' }}>
                {homeGoals ?? '—'}
              </span>
              <span className="font-mono text-[20px]" style={{ color: '#6B7280' }}>:</span>
              <span className="font-mono font-bold" style={{ fontSize: 40, lineHeight: 1, color: '#F0F4F8' }}>
                {awayGoals ?? '—'}
              </span>
            </div>

            {/* Away team */}
            <div className="flex items-center gap-3">
              <MomentumRing score={100 - momentumScore} size={40} strokeWidth={2.5} />
              <span className="font-mono text-[13px] tracking-wide" style={{ color: '#F0F4F8', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {match?.away_team.name ?? 'AWAY'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Right: Venue + Minute */}
      <div className="flex items-center gap-3 justify-end" style={{ minWidth: 200 }}>
        {!isLoading && match && (
          <>
            <div className="flex items-center gap-1">
              <MapPin size={10} style={{ color: '#6B7280' }} />
              <span className="font-mono text-[10px]" style={{ color: '#6B7280' }}>
                {match.venue.name} • {match.venue.city}
              </span>
            </div>
            {match.status === 'live' && match.minute && (
              <span className="font-mono font-semibold text-[14px]" style={{ color: '#00FF87', animation: 'livePulse 2s ease-in-out infinite' }}>
                {match.minute}&apos;
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
