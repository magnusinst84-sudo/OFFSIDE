'use client'
import React, { useState, useRef, useEffect } from 'react'
import type { CommentaryMessage, PersonalityType } from '@/lib/types'
import { PERSONALITIES } from '@/lib/constants'
import { Skeleton } from '@/components/shared/Skeleton'
import { Bot } from 'lucide-react'

interface AIPanelProps {
  commentary: CommentaryMessage[]
  isLoading: boolean
  personality: PersonalityType
  onPersonalityChange: (p: PersonalityType) => void
}

export function AIPanel({ commentary, isLoading, personality, onPersonalityChange }: AIPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const personalityConfig = PERSONALITIES.find(p => p.id === personality)!

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [commentary])

  return (
    <div className="flex flex-col h-full rounded-[4px] overflow-hidden" style={{
      backdropFilter: 'blur(8px)',
      background: 'rgba(15,17,23,0.6)',
      border: '1px solid rgba(59,130,246,0.15)',
    }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <Bot size={14} style={{ color: '#3B82F6' }} />
          <span className="font-mono text-[11px] tracking-widest" style={{ color: '#94A3B8' }}>AI COMMENTARY</span>
        </div>
        {/* Personality picker */}
        <div className="flex gap-1">
          {PERSONALITIES.map(p => (
            <button
              key={p.id}
              onClick={() => onPersonalityChange(p.id)}
              className="font-mono text-[9px] px-1.5 py-0.5 rounded-[2px] transition-all duration-150"
              style={{
                background: personality === p.id ? `${p.color}18` : 'transparent',
                color: personality === p.id ? p.color : '#6B7280',
                border: personality === p.id ? `1px solid ${p.color}30` : '1px solid transparent',
              }}
              title={p.label}
            >
              {p.shortLabel.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1A1D27 transparent' }}>
        {isLoading && commentary.length === 0 ? (
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] tracking-widest" style={{ color: '#6B7280' }}>LOADING ANALYST...</span>
            <Skeleton height={14} width="90%" />
            <Skeleton height={14} width="75%" />
            <Skeleton height={14} width="85%" />
          </div>
        ) : commentary.length === 0 ? (
          <div className="text-center py-6">
            <span className="font-mono text-[11px]" style={{ color: '#6B7280' }}>ANALYST STANDING BY</span>
          </div>
        ) : (
          commentary.map(msg => {
            const pc = PERSONALITIES.find(p => p.id === msg.personality)
            return (
              <div
                key={msg.id}
                className="pl-2"
                style={{ borderLeft: `2px solid ${pc?.color ?? '#3B82F6'}` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] tracking-widest" style={{ color: '#6B7280' }}>
                    {msg.timestamp}
                  </span>
                  <span
                    className="font-mono text-[9px] px-1.5 py-0.5 rounded-[2px]"
                    style={{ background: `${pc?.color ?? '#3B82F6'}15`, color: pc?.color ?? '#3B82F6' }}
                  >
                    {pc?.shortLabel ?? msg.personality.toUpperCase()}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: '#F0F4F8', fontFamily: 'Inter, sans-serif' }}>
                  {msg.text}
                </p>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Tactical Analysis placeholder */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-2">
          <div style={{ width: 2, height: 12, background: '#7C3AED', borderRadius: 1 }} />
          <span className="font-mono text-[10px] tracking-widest" style={{ color: '#7C3AED' }}>TACTICAL INSIGHT</span>
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
          {isLoading
            ? 'Analyzing tactical patterns...'
            : `${personalityConfig.description}. Select a match event to trigger analysis.`}
        </p>
      </div>
    </div>
  )
}
