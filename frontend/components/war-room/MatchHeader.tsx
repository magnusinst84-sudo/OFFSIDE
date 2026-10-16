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
            <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: '#6B7280' }}>
              {match?.competition ?? 'FOOTBALL INTELLIGENCE'}
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
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#38BDF8' }} />
              <span className="font-mono text-[13px] md:text-[14px] font-semibold tracking-wide text-right" style={{ color: '#F0F4F8', maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {match?.home_team.name ?? 'HOME'}
              </span>
              <MomentumRing score={momentumScore} size={40} strokeWidth={2.5} />
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-[6px]" style={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="font-mono font-bold" style={{ fontSize: 36, lineHeight: 1, color: '#38BDF8', minWidth: 24, textAlign: 'center' }}>
                {homeGoals ?? '—'}
              </span>
              <span className="font-mono text-[18px]" style={{ color: '#6B7280' }}>:</span>
              <span className="font-mono font-bold" style={{ fontSize: 36, lineHeight: 1, color: '#F43F5E', minWidth: 24, textAlign: 'center' }}>
                {awayGoals ?? '—'}
              </span>
            </div>

            {/* Away team */}
            <div className="flex items-center gap-3">
              <MomentumRing score={100 - momentumScore} size={40} strokeWidth={2.5} />
              <span className="font-mono text-[13px] md:text-[14px] font-semibold tracking-wide" style={{ color: '#F0F4F8', maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {match?.away_team.name ?? 'AWAY'}
              </span>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#F43F5E' }} />
            </div>
          </>
        )}
      </div>

      {/* Right: Venue + Minute */}
      <div className="flex items-center gap-3 justify-end" style={{ minWidth: 200 }}>
        {!isLoading && match && (
          <>
            <div className="flex items-center gap-1.5 hidden md:flex">
              <MapPin size={12} style={{ color: '#6B7280' }} />
              <span className="font-mono text-[11px]" style={{ color: '#94A3B8' }}>
                {match.venue.name} • {match.venue.city}
              </span>
            </div>
            {match.status === 'live' && match.minute && (
              <span className="font-mono font-bold text-[14px] px-2 py-0.5 rounded-[4px]" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', animation: 'livePulse 2s ease-in-out infinite' }}>
                {match.minute}&apos;
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
