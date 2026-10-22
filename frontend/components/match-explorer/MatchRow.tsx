'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { ProbabilityBar, Skeleton } from '@/components/shared/Primitives'
import { usePrediction } from '@/hooks/useMatchData'
import { useApp } from '@/context/AppContext'
import type { Match } from '@/lib/types'

interface MatchRowProps {
  match: Match
}

function TeamCrest({ name, logo, size = 28 }: { name: string; logo?: string; size?: number }) {
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
        loading="lazy"
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
        fontSize: Math.max(10, Math.floor(size * 0.38)),
      }}
    >
      {initials}
    </div>
  )
}

export function MatchRow({ match }: MatchRowProps) {
  const router = useRouter()
  const { setCurrentMatch } = useApp()
  const rowRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // IntersectionObserver for lazy prediction request
  useEffect(() => {
    if (!rowRef.current) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(rowRef.current)
    return () => observer.disconnect()
  }, [])

  const homeName = match.home_team.name
  const awayName = match.away_team.name
  const { prediction, isLoading } = usePrediction(
    isVisible ? homeName : null,
    isVisible ? awayName : null
  )

  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'

  const handleClick = () => {
    setCurrentMatch(match)
    router.push(`/match/${match.id}`)
  }

  // Time format
  const formatTime = (dateStr: string) => {
    if (!dateStr) return 'TBD'
    try {
      const d = new Date(dateStr)
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch {
      return 'TBD'
    }
  }

  // Live minute or kickoff
  const timeDisplay = isLive ? (
    <span className="inline-flex items-center gap-1.5 font-mono text-[13px] font-semibold text-[var(--color-live,#E8003D)]">
      <span className="w-2 h-2 rounded-full bg-[var(--color-live,#E8003D)] animate-pulse" />
      {match.minute ? `${match.minute}'` : 'LIVE'}
    </span>
  ) : (
    <span className="font-mono text-[13px] text-[#94A3B8]">
      {formatTime(match.date)}
    </span>
  )

  // Score display
  const homeScore = match.score?.home ?? match.home_team.goals ?? 0
  const awayScore = match.score?.away ?? match.away_team.goals ?? 0

  return (
    <div
      ref={rowRef}
      onClick={handleClick}
      className="group relative w-full cursor-pointer transition-colors border-b border-white/[0.06] hover:bg-[#1A1D27]/80 select-none"
    >
      {/* ─── DESKTOP VIEW (>= 768px): 8-column 56px row ─── */}
      <div className="hidden md:grid items-center h-[56px] px-4 gap-3 grid-cols-[84px_1fr_28px_36px_28px_1fr_240px_24px]">
        {/* 1. Time / Live Indicator + Data Source Badge */}
        <div className="flex items-center gap-1.5 truncate">
          {timeDisplay}
          {match.data_source && match.data_source !== 'live' && (
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium uppercase tracking-wider shrink-0"
              style={{
                background: match.data_source === 'mock' ? 'rgba(232, 0, 61, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: match.data_source === 'mock' ? '#FF4D6D' : '#60A5FA',
                border: `1px solid ${match.data_source === 'mock' ? 'rgba(232, 0, 61, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
              }}
              title={match.data_source === 'mock' ? 'Demo data' : 'Cached'}
            >
              {match.data_source === 'mock' ? 'Demo' : 'Cached'}
            </span>
          )}
        </div>

        {/* 2. Home Team Name (right-aligned) */}
        <div
          className="text-right text-[15px] font-medium text-white truncate"
          title={homeName}
        >
          {homeName}
        </div>

        {/* 3. Home Crest */}
        <div className="flex justify-center">
          <TeamCrest name={homeName} logo={match.home_team.logo} size={28} />
        </div>

        {/* 4. Score or "vs" */}
        <div className="flex items-center justify-center font-mono">
          {isLive || isFinished ? (
            <div className="flex items-center gap-1 font-bold text-[14px]">
              <span className="text-[var(--color-home,#3B82F6)]">{homeScore}</span>
              <span className="text-[#64748B]">-</span>
              <span className="text-[var(--color-away,#E8003D)]">{awayScore}</span>
            </div>
          ) : (
            <span className="text-[12px] text-[#64748B]">vs</span>
          )}
        </div>

        {/* 5. Away Crest */}
        <div className="flex justify-center">
          <TeamCrest name={awayName} logo={match.away_team.logo} size={28} />
        </div>

        {/* 6. Away Team Name (left-aligned) */}
        <div
          className="text-left text-[15px] font-medium text-white truncate"
          title={awayName}
        >
          {awayName}
        </div>

        {/* 7. Probability Bar (240px wide) */}
        <div className="w-[240px]">
          {isLoading ? (
            <Skeleton width="100%" height={16} rounded="full" />
          ) : prediction ? (
            <ProbabilityBar
              home={prediction.home_win_prob}
              draw={prediction.draw_prob}
              away={prediction.away_win_prob}
              height={6}
            />
          ) : null}
        </div>

        {/* 8. Chevron */}
        <div className="flex justify-end text-[#64748B] group-hover:text-white transition-colors">
          <ChevronRight size={18} />
        </div>
      </div>

      {/* ─── MOBILE VIEW (< 768px): Two-line row + probability bar ─── */}
      <div className="md:hidden flex flex-col p-3.5 gap-2.5 min-h-[64px]">
        {/* Line 1: Home team + Time/Score right-aligned */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamCrest name={homeName} logo={match.home_team.logo} size={22} />
            <span className="text-[14px] font-medium text-white truncate" title={homeName}>
              {homeName}
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 font-mono text-[13px]">
            {match.data_source && match.data_source !== 'live' && (
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium uppercase tracking-wider shrink-0"
                style={{
                  background: match.data_source === 'mock' ? 'rgba(232, 0, 61, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  color: match.data_source === 'mock' ? '#FF4D6D' : '#60A5FA',
                  border: `1px solid ${match.data_source === 'mock' ? 'rgba(232, 0, 61, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
                }}
              >
                {match.data_source === 'mock' ? 'Demo' : 'Cached'}
              </span>
            )}
            {isLive || isFinished ? (
              <span className="font-bold text-[var(--color-home,#3B82F6)]">{homeScore}</span>
            ) : (
              timeDisplay
            )}
          </div>
        </div>

        {/* Line 2: Away team + Away score / chevron */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamCrest name={awayName} logo={match.away_team.logo} size={22} />
            <span className="text-[14px] font-medium text-white truncate" title={awayName}>
              {awayName}
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-2 font-mono text-[13px]">
            {isLive || isFinished ? (
              <span className="font-bold text-[var(--color-away,#E8003D)]">{awayScore}</span>
            ) : null}
            <ChevronRight size={16} className="text-[#64748B]" />
          </div>
        </div>

        {/* Probability bar under teams (when prediction available) */}
        {prediction && (
          <div className="w-full pt-1">
            <ProbabilityBar
              home={prediction.home_win_prob}
              draw={prediction.draw_prob}
              away={prediction.away_win_prob}
              height={6}
            />
          </div>
        )}
      </div>
    </div>
  )
}
