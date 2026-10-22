'use client'
import React, { useState } from 'react'
import type { Match, PredictResponse } from '@/lib/types'
import { StatusBadge } from '@/components/shared/Primitives'
import { MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface MatchHeaderProps {
  match?: Match | null
  prediction?: PredictResponse
  isLoading: boolean
}

function HeaderCrest({ name, logo, size = 36 }: { name: string; logo?: string; size?: number }) {
  const [imgError, setImgError] = useState(false)
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || 'FC'

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={name}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className="rounded-full object-contain shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-mono font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        fontSize: Math.max(12, Math.floor(size * 0.38)),
      }}
    >
      {initials}
    </div>
  )
}

export function MatchHeader({ match, prediction, isLoading }: MatchHeaderProps) {
  const homeName = match?.home_team?.name || 'Home Team'
  const awayName = match?.away_team?.name || 'Away Team'
  const homeGoals = match?.home_team?.goals ?? match?.score?.home ?? 0
  const awayGoals = match?.away_team?.goals ?? match?.score?.away ?? 0

  const isLive = match?.status === 'live'
  const isFinished = match?.status === 'finished'
  const isUpcoming = match?.status === 'upcoming' || (!isLive && !isFinished)

  // Kickoff calculation
  const formatKickoff = (dateStr?: string) => {
    if (!dateStr) return 'Kick-off time TBD'
    try {
      const d = new Date(dateStr)
      const now = new Date()
      const diffHours = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60))
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      if (diffHours > 0) return `${timeStr} (in ${diffHours}h)`
      return timeStr
    } catch {
      return 'Upcoming'
    }
  }

  return (
    <div className="w-full flex flex-col bg-[#0F1117] border-b border-white/[0.08] px-4 sm:px-6 py-4">
      {/* Top Breadcrumb: Back to matches + Competition / Venue */}
      <div className="flex items-center justify-between gap-4 mb-3 text-[13px] text-[#94A3B8]">
        <Link
          href="/matches"
          className="inline-flex items-center gap-1.5 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Matches</span>
        </Link>

        {match && (
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-white truncate">{match.competition}</span>
            {match.venue?.name && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[#64748B]">
                • <MapPin size={12} /> {match.venue.name}{match.venue.city ? `, ${match.venue.city}` : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Scoreboard: Full team names wrap, never truncated */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6 py-2">
        {/* Home Team */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-4 text-right min-w-0">
          <span
            className="text-[15px] sm:text-[20px] md:text-[24px] font-bold text-white leading-tight break-words"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {homeName}
          </span>
          <HeaderCrest name={homeName} logo={match?.home_team?.logo} size={36} />
        </div>

        {/* Center: Score (56px mono digits) or Kickoff Time */}
        <div className="flex flex-col items-center justify-center shrink-0 min-w-[100px] sm:min-w-[140px]">
          {isUpcoming ? (
            <div className="flex flex-col items-center">
              <span className="font-mono text-[18px] sm:text-[22px] font-bold text-white tracking-tight">
                {match?.date ? new Date(match.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'TBD'}
              </span>
              <span className="text-[12px] text-[#94A3B8] mt-0.5">
                {formatKickoff(match?.date)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className="font-mono font-bold text-[32px] sm:text-[48px] md:text-[56px] tabular-nums leading-none text-[var(--color-home,#3B82F6)]"
              >
                {homeGoals}
              </span>
              <span className="font-mono text-[20px] sm:text-[28px] text-[#64748B] leading-none">-</span>
              <span
                className="font-mono font-bold text-[32px] sm:text-[48px] md:text-[56px] tabular-nums leading-none text-[var(--color-away,#E8003D)]"
              >
                {awayGoals}
              </span>
            </div>
          )}

          {/* Status Badge & Data Source Badge */}
          <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
            <StatusBadge
              status={isLive ? 'live' : isFinished ? 'finished' : 'upcoming'}
              minute={match?.minute}
            />
            {match?.data_source && match.data_source !== 'live' && (
              <span
                className="px-2 py-0.5 rounded text-[11px] font-mono font-medium tracking-wide uppercase"
                style={{
                  background: match.data_source === 'mock' ? 'rgba(232, 0, 61, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  color: match.data_source === 'mock' ? '#FF4D6D' : '#60A5FA',
                  border: `1px solid ${match.data_source === 'mock' ? 'rgba(232, 0, 61, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
                }}
              >
                {match.data_source === 'mock' ? 'Demo data' : 'Cached'}
              </span>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-start gap-2.5 sm:gap-4 text-left min-w-0">
          <HeaderCrest name={awayName} logo={match?.away_team?.logo} size={36} />
          <span
            className="text-[15px] sm:text-[20px] md:text-[24px] font-bold text-white leading-tight break-words"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {awayName}
          </span>
        </div>
      </div>
    </div>
  )
}
