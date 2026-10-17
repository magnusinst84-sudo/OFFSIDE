'use client'
import React from 'react'
import Link from 'next/link'
import type { CommentaryMessage, PersonalityType } from '@/lib/types'
import { SegmentedTabs } from '@/components/shared/Primitives'
import { Bot, ArrowUpRight, Sparkles } from 'lucide-react'

interface AIPanelProps {
  matchId?: number | string
  commentary: CommentaryMessage[]
  personality: PersonalityType
  onPersonalityChange: (p: PersonalityType) => void
  isLoading: boolean
  isUpcoming?: boolean
}

export function AIPanel({
  matchId,
  commentary,
  personality,
  onPersonalityChange,
  isLoading,
  isUpcoming = false,
}: AIPanelProps) {
  return (
    <div className="flex flex-col h-full p-4 md:p-6 text-white gap-4">
      {/* Header + Link to full AI center */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-[var(--color-accent,#00FF87)]" />
          <h3 className="text-[14px] font-semibold text-white">AI Tactical Commentary</h3>
        </div>

        {matchId && (
          <Link
            href={`/ai?match=${matchId}`}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-accent,#00FF87)] hover:underline cursor-pointer"
          >
            Ask the analyst <ArrowUpRight size={14} />
          </Link>
        )}
      </div>

      {/* Persona SegmentedTabs */}
      <SegmentedTabs
        tabs={[
          { id: 'tactical', label: 'Tactical' },
          { id: 'broadcast', label: 'Broadcast' },
          { id: 'coach', label: 'Coach' },
          { id: 'fan', label: 'Fan' },
        ]}
        activeTab={personality}
        onChange={id => onPersonalityChange(id as PersonalityType)}
        className="w-full"
      />

      {/* Commentary Feed List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 min-h-[200px]">
        {isLoading && commentary.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-[13px] text-[#94A3B8]">
            <Sparkles size={16} className="animate-spin mr-2 text-[var(--color-accent,#00FF87)]" />
            Analyzing tactical dynamics...
          </div>
        ) : commentary.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-[#94A3B8] rounded-xl bg-[#0F1117] border border-white/[0.06]">
            {isUpcoming
              ? 'Tactical preview ready. Switch persona or ask the analyst for pre-match breakdown.'
              : 'Awaiting match events to generate live observations.'}
          </div>
        ) : (
          commentary.map(msg => (
            <div
              key={msg.id}
              className="p-3.5 rounded-xl bg-[#0F1117] border border-white/[0.06] flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span className="capitalize font-medium text-[var(--color-accent,#00FF87)]">
                  {msg.personality} Perspective
                </span>
                <span className="font-mono">{msg.timestamp}</span>
              </div>
              <p className="text-[14px] leading-[1.6] text-white/90">
                {msg.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
