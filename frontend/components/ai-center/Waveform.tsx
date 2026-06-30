'use client'
import React, { useEffect, useRef } from 'react'
import type { PersonalityType } from '@/lib/types'

interface WaveformProps {
  isActive: boolean
  personality: PersonalityType
  barCount?: number
}

const PERSONALITY_CONFIG = {
  broadcast: { speed: 0.08, amplitude: 0.9, irregularity: 0.3, color: '#3B82F6' },
  tactical: { speed: 0.04, amplitude: 0.6, irregularity: 0.1, color: '#00FF87' },
  coach: { speed: 0.025, amplitude: 0.75, irregularity: 0.15, color: '#F59E0B' },
  fan: { speed: 0.12, amplitude: 0.95, irregularity: 0.6, color: '#E8003D' },
}

export function Waveform({ isActive, personality, barCount = 20 }: WaveformProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const animRef = useRef<number>(0)
  const frameRef = useRef(0)
  const config = PERSONALITY_CONFIG[personality]

  useEffect(() => {
    if (!isActive) {
      // Rest state — minimal animation
      barsRef.current.forEach((bar, i) => {
        if (bar) {
          const height = 4 + Math.sin(i * 0.5) * 2
          bar.style.height = `${height}px`
        }
      })
      return
    }

    const animate = () => {
      frameRef.current += config.speed
      barsRef.current.forEach((bar, i) => {
        if (!bar) return
        const phase = frameRef.current + i * (0.5 + Math.random() * config.irregularity * 0.1)
        const height = 4 + Math.abs(Math.sin(phase) * 28 * config.amplitude + Math.sin(phase * 2.3) * 10 * config.irregularity)
        bar.style.height = `${Math.min(36, height)}px`
      })
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [isActive, personality, config])

  return (
    <div className="flex items-center gap-px" style={{ height: 36 }}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          ref={el => { barsRef.current[i] = el }}
          className="rounded-full flex-shrink-0 transition-none"
          style={{
            width: 2,
            height: 4,
            background: config.color,
            opacity: isActive ? 0.8 : 0.2,
            alignSelf: 'center',
            transition: isActive ? 'none' : 'height 0.5s ease',
          }}
        />
      ))}
    </div>
  )
}
