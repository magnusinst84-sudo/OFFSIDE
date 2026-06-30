'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Match, PredictResponse } from '@/lib/types'
import { MomentumRing } from '@/components/war-room/MomentumRing'
import { LiveBadge, StatusBadge } from '@/components/shared/LiveBadge'
import { Skeleton } from '@/components/shared/Skeleton'
import { MapPin, Trophy } from 'lucide-react'
import { useApp } from '@/context/AppContext'

interface MatchCardProps {
  match: Match
  prediction?: PredictResponse
  isLoading?: boolean
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function MatchCard({ match, prediction, isLoading = false }: MatchCardProps) {
  const [hovered, setHovered] = useState(false)
  const { setCurrentMatch } = useApp()
  const router = useRouter()

  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const momentumScore = prediction?.momentum_score ?? 50
  const homeWin = prediction ? Math.round(prediction.home_win_prob * 100) : null
  const draw = prediction ? Math.round(prediction.draw_prob * 100) : null
  const awayWin = prediction ? Math.round(prediction.away_win_prob * 100) : null

  const handleClick = () => {
    setCurrentMatch(match)
    router.push(`/match/${match.id}`)
  }

  return (
    <div
      className="relative rounded-[4px] cursor-pointer transition-all duration-150 overflow-hidden"
      style={{
        background: hovered ? '#1A1D27' : '#0F1117',
        border: isLive ? '1px solid rgba(0,255,135,0.15)' : '1px solid rgba(255,255,255,0.06)',
        borderLeft: isLive ? '2px solid #00FF87' : undefined,
        height: 120,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Top meta row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-1.5">
          <Trophy size={10} style={{ color: '#6B7280' }} />
          <span className="font-mono text-[10px] tracking-wider" style={{ color: '#6B7280' }}>
            {match.competition}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLive && match.minute && (
            <span className="font-mono text-[12px] font-semibold" style={{ color: '#00FF87' }}>
              {match.minute}&apos;
            </span>
          )}
          <StatusBadge status={match.status} minute={match.minute} />
        </div>
      </div>

      {/* Main score row */}
      <div className="flex items-center justify-between px-4 py-1">
        {/* Home team */}
        <div className="flex items-center gap-2 flex-1">
          <span className="font-mono text-[13px] font-medium" style={{ color: '#F0F4F8' }}>
            {match.home_team.name}
          </span>
          {isLive && (
            <MomentumRing score={momentumScore} size={22} strokeWidth={2} animate={false} />
          )}
        </div>

        {/* Score */}
        <div className="flex items-center gap-2 px-4">
          <span
            className="font-mono font-bold text-[36px] leading-none"
            style={{ color: isFinished ? 'rgba(240,244,248,0.6)' : '#F0F4F8' }}
          >
            {match.home_team.goals ?? match.score?.home ?? '—'}
          </span>
          <span className="font-mono text-[16px]" style={{ color: '#6B7280' }}>:</span>
          <span
            className="font-mono font-bold text-[36px] leading-none"
            style={{ color: isFinished ? 'rgba(240,244,248,0.6)' : '#F0F4F8' }}
          >
            {match.away_team.goals ?? match.score?.away ?? '—'}
          </span>
        </div>

        {/* Away team */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {isLive && (
            <MomentumRing score={100 - momentumScore} size={22} strokeWidth={2} animate={false} />
          )}
          <span className="font-mono text-[13px] font-medium" style={{ color: '#F0F4F8' }}>
            {match.away_team.name}
          </span>
        </div>
      </div>

      {/* Bottom meta row */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-1">
          <MapPin size={9} style={{ color: '#6B7280' }} />
          <span className="font-mono text-[9px]" style={{ color: '#6B7280' }}>
            {match.venue.city || match.venue.name}
          </span>
        </div>
        <span className="font-mono text-[9px]" style={{ color: '#6B7280' }}>
          {isLive ? '' : formatDate(match.date)}
        </span>
      </div>

      {/* Hover overlay — prediction data */}
      {hovered && (
        <div
          className="absolute inset-0 rounded-[4px] flex flex-col justify-end"
          style={{
            background: 'linear-gradient(to top, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.5) 50%, transparent 100%)',
            pointerEvents: 'none',
          }}
        >
          <div className="p-3">
            {prediction ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-[16px] font-semibold" style={{ color: '#00FF87' }}>{homeWin}%</span>
                    <span className="font-mono text-[8px]" style={{ color: '#6B7280' }}>HOME</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-[16px] font-semibold" style={{ color: '#F59E0B' }}>{draw}%</span>
                    <span className="font-mono text-[8px]" style={{ color: '#6B7280' }}>DRAW</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-[16px] font-semibold" style={{ color: '#E8003D' }}>{awayWin}%</span>
                    <span className="font-mono text-[8px]" style={{ color: '#6B7280' }}>AWAY</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-[9px]" style={{ color: '#7C3AED' }}>
                    {Math.round(prediction.model_accuracy * 100)}% MODEL CONF
                  </span>
                  {prediction.upset_alert && (
                    <span className="font-mono text-[9px]" style={{ color: '#F59E0B' }}>⚡ UPSET ALERT</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Skeleton width={40} height={20} />
                <Skeleton width={40} height={20} />
                <Skeleton width={40} height={20} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function MatchCardSkeleton() {
  return (
    <div
      className="rounded-[4px] p-4"
      style={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.06)', height: 120 }}
    >
      <div className="flex items-center justify-between mb-3">
        <Skeleton width={80} height={10} />
        <Skeleton width={50} height={10} />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton width={100} height={18} />
        <Skeleton width={80} height={36} />
        <Skeleton width={100} height={18} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <Skeleton width={60} height={8} />
        <Skeleton width={60} height={8} />
      </div>
    </div>
  )
}
