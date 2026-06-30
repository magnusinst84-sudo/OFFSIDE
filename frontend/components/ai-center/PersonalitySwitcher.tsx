'use client'
import React from 'react'
import type { PersonalityType } from '@/lib/types'
import { PERSONALITIES } from '@/lib/constants'

interface PersonalitySwitcherProps {
  active: PersonalityType
  onChange: (p: PersonalityType) => void
}

export function PersonalitySwitcher({ active, onChange }: PersonalitySwitcherProps) {
  return (
    <div className="flex flex-col gap-2">
      {PERSONALITIES.map(p => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className="w-full text-left px-3 py-3 rounded-[4px] transition-all duration-150 group"
          style={{
            background: active === p.id ? `${p.color}0D` : 'transparent',
            border: active === p.id ? `1px solid ${p.color}25` : '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="font-mono text-[11px] tracking-wider font-semibold"
              style={{ color: active === p.id ? p.color : '#94A3B8' }}
            >
              {p.shortLabel}
            </span>
            {active === p.id && (
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
            )}
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
            {p.description}
          </p>
        </button>
      ))}
    </div>
  )
}
