'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ALL_PLAYERS } from '@/lib/data/players'

export default function PlayersPage() {
  const router = useRouter()
  const FEATURED = [...ALL_PLAYERS]
    .sort((a, b) => b.dna_score - a.dna_score)
    .slice(0, 200)

  return (
    <div style={{ minHeight: '100vh', background: '#050508' }}>
      <div className="px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="font-mono text-[10px] tracking-widest mb-1" style={{ color: '#6B7280' }}>WORLD CUP 2026</p>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700, color: '#F0F4F8' }}>
          Player Intelligence
        </h1>
      </div>
      <div className="px-8 py-6">
        <p className="font-mono text-[11px] tracking-widest mb-4" style={{ color: '#6B7280' }}>FEATURED PLAYERS</p>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {FEATURED.map(p => (
            <button
              key={p.id}
              onClick={() => router.push(`/player/${p.id}`)}
              className="p-4 rounded-[4px] text-left transition-all duration-150 group"
              style={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1A1D27')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0F1117')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-[15px]" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#F0F4F8' }}>{p.name}</p>
                  <p className="font-mono text-[10px] mt-0.5" style={{ color: '#6B7280' }}>{p.team} • {p.position}</p>
                </div>
                <div>
                  <span className="font-mono font-bold text-[24px]" style={{ color: '#00FF87' }}>{p.dna_score}</span>
                  <p className="font-mono text-[8px]" style={{ color: '#6B7280' }}>DNA</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
