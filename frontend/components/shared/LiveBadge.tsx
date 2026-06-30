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
  if (status === 'live') return <LiveBadge />
  if (status === 'finished') {
    return (
      <span
        className="font-mono text-[11px] tracking-widest px-1.5 py-0.5 rounded-[2px]"
        style={{ background: 'rgba(148,163,184,0.1)', color: '#94A3B8' }}
      >
        FT
      </span>
    )
  }
  return (
    <span
      className="font-mono text-[11px] tracking-widest px-1.5 py-0.5 rounded-[2px]"
      style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}
    >
      UPCOMING
    </span>
  )
}
