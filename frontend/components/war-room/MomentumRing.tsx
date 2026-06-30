'use client'
import React, { useEffect, useRef } from 'react'
import { getMomentumColor } from '@/lib/constants'

interface MomentumRingProps {
  score: number
  size?: number
  strokeWidth?: number
  animate?: boolean
  goalBurst?: boolean
}

export function MomentumRing({
  score,
  size = 80,
  strokeWidth = 3,
  animate = true,
  goalBurst = false,
}: MomentumRingProps) {
  const ringRef = useRef<SVGCircleElement>(null)
  const color = getMomentumColor(score)
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // Normalize score 0-100 to dash offset
  const dashOffset = circumference - (score / 100) * circumference

  useEffect(() => {
    if (!ringRef.current) return
    if (goalBurst) {
      ringRef.current.style.animation = 'goalBurst 0.6s ease-out forwards'
      setTimeout(() => {
        if (ringRef.current) ringRef.current.style.animation = ''
      }, 600)
    }
  }, [goalBurst])

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width: size,
        height: size,
        animation: animate ? 'momentumBreathe 3s ease-in-out infinite' : 'none',
        filter: `drop-shadow(0 0 ${size / 4}px ${color}4D)`,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          ref={ringRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
          }}
        />
      </svg>
    </div>
  )
}
