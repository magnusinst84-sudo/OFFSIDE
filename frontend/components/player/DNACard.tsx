'use client'
import React, { useState, useEffect } from 'react'
import type { Player } from '@/lib/data/players'
import { Skeleton } from '@/components/shared/Skeleton'

interface DNACardProps {
  player: Player
}

export function DNACard({ player }: DNACardProps) {
  const [flipped, setFlipped] = useState(false)
  const [shimmerPos, setShimmerPos] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setShimmerPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  if (!player) return null

  return (
    <div
      className="relative cursor-pointer select-none"
      style={{ height: 240, perspective: 1000 }}
      onClick={() => setFlipped(f => !f)}
      onMouseMove={handleMouseMove}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-[4px] overflow-hidden flex flex-col p-4"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #0F1117 0%, #1A1D27 100%)',
            border: '1px solid rgba(0,255,135,0.15)',
          }}
          onMouseMove={handleMouseMove}
        >
          {/* Holographic shimmer */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[4px]"
            style={{
              background: `radial-gradient(circle at ${shimmerPos.x}% ${shimmerPos.y}%, rgba(0,255,135,0.08) 0%, transparent 60%)`,
            }}
          />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-[10px] tracking-widest" style={{ color: '#6B7280' }}>PLAYER DNA</p>
                <p className="font-bold text-[16px] leading-tight mt-0.5" style={{ color: '#F0F4F8', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {player.name}
                </p>
                <p className="font-mono text-[10px]" style={{ color: '#94A3B8' }}>{player.team}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-mono font-bold" style={{ fontSize: 48, color: '#00FF87', lineHeight: 1 }}>
                  {player.dna_score}
                </span>
                <span className="font-mono text-[9px] tracking-widest" style={{ color: '#6B7280' }}>DNA SCORE</span>
              </div>
            </div>

            {/* Attribute bars */}
            <div className="mt-2 flex flex-col gap-1.5">
              {Object.entries(player.attributes).slice(0, 4).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-mono text-[9px] w-16" style={{ color: '#6B7280' }}>
                    {key.toUpperCase().slice(0, 5)}
                  </span>
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${val}%`, background: 'linear-gradient(90deg, #00FF87, #3B82F6)' }}
                    />
                  </div>
                  <span className="font-mono text-[9px] w-6 text-right" style={{ color: '#94A3B8' }}>{val}</span>
                </div>
              ))}
            </div>

            <p className="mt-2 font-mono text-[9px]" style={{ color: '#6B7280' }}>CLICK TO FLIP →</p>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-[4px] overflow-hidden flex flex-col p-4"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #1A1D27 0%, #0F1117 100%)',
            border: '1px solid rgba(124,58,237,0.2)',
          }}
        >
          <p className="font-mono text-[11px] tracking-widest mb-3" style={{ color: '#7C3AED' }}>AI ANALYSIS</p>

          <div className="flex flex-col gap-1 mb-3">
            {player.strengths.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: '#00FF87', fontSize: 10 }}>✓</span>
                <span className="font-mono text-[10px]" style={{ color: '#94A3B8' }}>{s}</span>
              </div>
            ))}
            {player.weaknesses.slice(0, 2).map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: '#E8003D', fontSize: 10 }}>✗</span>
                <span className="font-mono text-[10px]" style={{ color: '#94A3B8' }}>{w}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <p className="font-mono text-[9px] tracking-widest mb-1" style={{ color: '#6B7280' }}>PREDICTED IMPACT</p>
            <span className="font-mono font-bold text-[32px]" style={{ color: '#7C3AED', lineHeight: 1 }}>
              {player.predicted_impact.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
