'use client'
import React from 'react'

export function LiveBadge({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dotSize = size === 'sm' ? 5 : size === 'lg' ? 8 : 6
  const fontSize = size === 'sm' ? '9px' : size === 'lg' ? '12px' : '11px'

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="rounded-full flex-shrink-0"
        style={{
          width: dotSize,
          height: dotSize,
          background: '#E8003D',
          animation: 'livePulse 1.4s ease-in-out infinite',
        }}
      />
      <span
        className="font-mono font-semibold tracking-widest"
        style={{ fontSize, color: '#E8003D', letterSpacing: '0.12em' }}
      >
        LIVE
      </span>
    </div>
  )
}

export function StatusBadge({
  status,
  minute,
}: {
  status: 'live' | 'upcoming' | 'finished'
  minute?: number | null
}) {
  if (status === 'live') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-red-500/10 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
        <span className="font-mono text-[11px] font-semibold tracking-wider text-[#EF4444]">
          {minute ? `${minute}'` : 'LIVE'}
        </span>
      </div>
    )
  }
  if (status === 'finished') {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] tracking-wider px-2 py-0.5 rounded-[4px] bg-emerald-500/10 border border-emerald-500/20 text-[#00FF87] font-medium">
        <span>✓</span> FT
      </span>
    )
  }
  return (
    <span className="inline-flex items-center font-mono text-[11px] tracking-wider px-2 py-0.5 rounded-[4px] bg-white/[0.06] border border-white/[0.08] text-[#94A3B8] font-medium">
      UPCOMING
    </span>
  )
}
