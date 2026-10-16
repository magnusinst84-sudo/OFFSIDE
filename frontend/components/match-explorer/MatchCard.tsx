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
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Trophy size={12} className="text-[#94A3B8] flex-shrink-0" />
          <span className="font-mono text-[11px] font-medium tracking-wider text-[#94A3B8] truncate">
            {match.competition}
          </span>
        </div>
        <StatusBadge status={match.status} minute={match.minute} />
      </div>

      {/* Main 3-column score / teams row */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2 gap-3">
        {/* Home team */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#38BDF8] flex-shrink-0" title="Home" />
          <span className="text-[13px] font-semibold text-[#F0F4F8] truncate" title={match.home_team.name}>
            {match.home_team.name}
          </span>
          {isLive && (
            <div className="flex-shrink-0">
              <MomentumRing score={momentumScore} size={22} strokeWidth={2} animate={false} />
            </div>
          )}
        </div>

        {/* Center: Score (live/finished) OR Kickoff Time (upcoming) */}
        <div className="flex items-center justify-center px-2 flex-shrink-0">
          {match.status === 'upcoming' ? (
            <div className="flex flex-col items-center">
              <span suppressHydrationWarning className="font-mono text-[14px] font-semibold text-[#F0F4F8] tracking-tight">
                {match.date ? new Date(match.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'TBD'}
              </span>
              <span suppressHydrationWarning className="font-mono text-[10px] text-[#6B7280]">
                {match.date ? new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className="font-mono font-bold text-[28px] tabular-nums leading-none"
                style={{ color: isFinished ? 'rgba(240,244,248,0.7)' : '#F0F4F8' }}
              >
                {match.home_team.goals ?? match.score?.home ?? 0}
              </span>
              <span className="font-mono text-[16px] text-[#6B7280]">:</span>
              <span
                className="font-mono font-bold text-[28px] tabular-nums leading-none"
                style={{ color: isFinished ? 'rgba(240,244,248,0.7)' : '#F0F4F8' }}
              >
                {match.away_team.goals ?? match.score?.away ?? 0}
              </span>
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex items-center justify-end gap-2 min-w-0 text-right">
          {isLive && (
            <div className="flex-shrink-0">
              <MomentumRing score={100 - momentumScore} size={22} strokeWidth={2} animate={false} />
            </div>
          )}
          <span className="text-[13px] font-semibold text-[#F0F4F8] truncate" title={match.away_team.name}>
            {match.away_team.name}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#F43F5E] flex-shrink-0" title="Away" />
        </div>
      </div>

      {/* Win probability bar underneath */}
      {prediction && (
        <div className="px-4 py-1">
          <div className="h-1.5 w-full bg-[#1A1D27] rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.round(prediction.home_win_prob * 100)}%` }}
              className="bg-[#38BDF8] h-full"
              title={`Home Win: ${Math.round(prediction.home_win_prob * 100)}%`}
            />
            <div
              style={{ width: `${Math.round(prediction.draw_prob * 100)}%` }}
              className="bg-[#64748B] h-full"
              title={`Draw: ${Math.round(prediction.draw_prob * 100)}%`}
            />
            <div
              style={{ width: `${Math.round(prediction.away_win_prob * 100)}%` }}
              className="bg-[#F43F5E] h-full"
              title={`Away Win: ${Math.round(prediction.away_win_prob * 100)}%`}
            />
          </div>
        </div>
      )}

      {/* Bottom meta row */}
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <div className="flex items-center gap-1.5 text-[#6B7280]">
          <MapPin size={11} />
          <span className="text-[11px] truncate max-w-[200px]">
            {match.venue.city || match.venue.name}
          </span>
        </div>
        {prediction ? (
          <span className="font-mono text-[11px] font-medium text-[#94A3B8]">
            {homeWin}% • {draw}% • {awayWin}%
          </span>
        ) : (
          <span className="font-mono text-[11px] text-[#6B7280]">
            {match.status === 'live' ? 'Live Telemetry' : formatDate(match.date)}
          </span>
        )}
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
