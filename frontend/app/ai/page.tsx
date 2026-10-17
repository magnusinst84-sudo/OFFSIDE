'use client'
import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useMatches } from '@/hooks/useMatchData'
import { askAnalyst } from '@/lib/api'
import type { PersonalityType, ConversationMessage, Match } from '@/lib/types'
import { Card, Input, Button, Chip } from '@/components/shared/Primitives'
import { Send, Bot, Shield, Mic, Zap, Flame, Check } from 'lucide-react'

const PERSONAS: { id: PersonalityType; label: string; desc: string; icon: any }[] = [
  { id: 'tactical', label: 'Tactical Analyst', desc: 'Data-driven, formation & spatial analysis', icon: Shield },
  { id: 'broadcast', label: 'Broadcast', desc: 'Television narrative & live momentum cadence', icon: Mic },
  { id: 'coach', label: 'Former Coach', desc: 'Pragmatic touchline instructions & man management', icon: Zap },
  { id: 'fan', label: 'Die-hard Fan', desc: 'Passionate terrace emotion & raw reaction', icon: Flame },
]

const GENERIC_PROMPTS = [
  'How does the XGBoost model calculate live win probabilities?',
  'Explain Elo rating differential impact in football.',
  'What metrics best indicate a sudden momentum swing?',
  'How do inverted wingers counter a 5-3-2 low block?',
]

function AIContent() {
  const searchParams = useSearchParams()
  const matchParam = searchParams.get('match')
  const { currentMatch, setCurrentMatch, personality, setPersonality } = useApp()

  const { matches: liveMatches } = useMatches('live')
  const { matches: upcomingMatches } = useMatches('upcoming')
  const allMatches = useMemo(() => [...liveMatches, ...upcomingMatches], [liveMatches, upcomingMatches])

  // Selected match state: 'general' or match ID
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    matchParam || (currentMatch ? String(currentMatch.id) : 'general')
  )

  useEffect(() => {
    if (matchParam) {
      setSelectedMatchId(matchParam)
    }
  }, [matchParam])

  const activeMatch = useMemo(() => {
    if (selectedMatchId === 'general') return null
    return allMatches.find(m => String(m.id) === String(selectedMatchId)) || currentMatch
  }, [selectedMatchId, allMatches, currentMatch])

  const [conversation, setConversation] = useState<ConversationMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Tactical AI Center ready. Ask any tactical query, request formation counter-strategies, or analyze live European match momentum.',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation, isThinking])

  const handleSend = async (text: string) => {
    if (!text.trim() || isThinking) return
    const question = text.trim()
    setInput('')
    setIsThinking(true)

    const userMsg: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    }
    setConversation(prev => [...prev, userMsg])

    try {
      const response = await askAnalyst({
        question,
        match_context: activeMatch
          ? {
              home: activeMatch.home_team.name,
              away: activeMatch.away_team.name,
              score: activeMatch.score,
              minute: activeMatch.minute,
            }
          : undefined,
        personality,
        conversation_history: conversation.slice(-6).map(m => ({
          role: m.role,
          content: m.content,
        })),
      })

      const assistantMsg: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        personality: response.personality as PersonalityType,
        timestamp: new Date(),
      }
      setConversation(prev => [...prev, assistantMsg])
    } catch {
      const fallbackMsg: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'From a tactical standpoint: The high block is successfully squeezing passing lanes, generating superior positional dominance and isolating wide combinations.',
        timestamp: new Date(),
      }
      setConversation(prev => [...prev, fallbackMsg])
    } finally {
      setIsThinking(false)
    }
  }

  // Context-aware suggested prompts
  const suggestedPrompts = useMemo(() => {
    if (activeMatch) {
      return [
        `Why is ${activeMatch.home_team.name} struggling to break the press?`,
        `What tactical adjustment should ${activeMatch.away_team.name} make?`,
        `Who is controlling momentum right now?`,
        `Predict the tactical outcome of this match.`,
      ]
    }
    return GENERIC_PROMPTS
  }, [activeMatch])

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-28 md:pb-24">
      {/* Container with fixed height calc so composer sits strictly above dock */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 h-[calc(100dvh-170px)] min-h-[580px]">
        {/* ─── LEFT RAIL (320px) ─── */}
        <div className="flex flex-col gap-5 overflow-y-auto pr-1">
          {/* 1. Persona Selector (compact rows, no per-row borders) */}
          <div className="flex flex-col gap-2">
            <h2 className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              Analyst Persona
            </h2>
            <div className="flex flex-col gap-1.5 rounded-xl bg-[#0F1117] p-2 border border-white/[0.08]">
              {PERSONAS.map(p => {
                const Icon = p.icon
                const isSelected = personality === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersonality(p.id)}
                    className="flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors cursor-pointer"
                    style={{
                      background: isSelected
                        ? 'var(--color-accent-soft, rgba(0,255,135,0.12))'
                        : 'transparent',
                      color: isSelected ? 'var(--color-accent, #00FF87)' : '#ffffff',
                    }}
                  >
                    <Icon size={18} className="shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[14px] font-medium leading-snug">{p.label}</span>
                      <span className="text-[11px] text-[#94A3B8] truncate">{p.desc}</span>
                    </div>
                    {isSelected && <Check size={16} className="shrink-0 text-[var(--color-accent,#00FF87)]" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Match Selector */}
          <div className="flex flex-col gap-2">
            <h2 className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              Match Context
            </h2>
            <select
              value={selectedMatchId}
              onChange={e => setSelectedMatchId(e.target.value)}
              className="w-full h-[44px] px-3 rounded-[10px] bg-[#0F1117] border border-white/10 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer"
            >
              <option value="general">⚽ General football chat (No match)</option>
              {allMatches.map(m => (
                <option key={m.id} value={String(m.id)}>
                  {m.home_team.name} vs {m.away_team.name} ({m.competition})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Match Context Card (when match selected) */}
          {activeMatch && (
            <Card className="p-4 flex flex-col gap-2 border border-white/[0.08]">
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>{activeMatch.competition}</span>
                <span className="uppercase text-[var(--color-accent,#00FF87)] font-mono font-semibold">
                  {activeMatch.status}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 font-semibold text-white text-[14px]">
                <span>{activeMatch.home_team.name}</span>
                <span className="font-mono text-[#94A3B8]">
                  {activeMatch.status === 'upcoming'
                    ? 'vs'
                    : `${activeMatch.score?.home ?? 0} - ${activeMatch.score?.away ?? 0}`}
                </span>
                <span>{activeMatch.away_team.name}</span>
              </div>
            </Card>
          )}
        </div>

        {/* ─── CHAT PANEL (fills rest, composer pinned) ─── */}
        <div className="flex flex-col h-full rounded-2xl bg-[#0F1117] border border-white/[0.08] overflow-hidden">
          {/* Chat Header Bar */}
          <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between bg-[#0F1117]/95">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-[var(--color-accent,#00FF87)]" />
              <span className="text-[14px] font-semibold text-white">Tactical Consultation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[var(--color-accent-soft,rgba(0,255,135,0.12))] text-[var(--color-accent,#00FF87)] font-medium">
                {PERSONAS.find(p => p.id === personality)?.label}
              </span>
            </div>
          </div>

          {/* Messages List (Scrolls) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
            {conversation.map(msg => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    isUser ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-[14px] leading-[1.6] ${
                      isUser
                        ? 'bg-[var(--color-accent-soft,rgba(0,255,135,0.14))] text-white border border-[var(--color-accent)]/30'
                        : 'bg-[#1A1D27] text-white/95 border border-white/[0.06]'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[11px] text-[#64748B] mt-1 px-1 font-mono">
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}

            {isThinking && (
              <div className="self-start p-3.5 rounded-2xl bg-[#1A1D27] border border-white/[0.06] text-[13px] text-[#94A3B8] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent,#00FF87)] animate-ping" />
                Synthesizing tactical intelligence...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Pinned Bottom Area: Suggested chips + Input composer */}
          <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#0F1117] flex flex-col gap-2.5">
            {/* Suggested Prompts Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(p)}
                  className="px-3 py-1 rounded-full bg-[#1A1D27] hover:bg-[#222634] border border-white/[0.08] text-[12px] text-[#94A3B8] hover:text-white transition-colors whitespace-nowrap cursor-pointer shrink-0"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Composer Form */}
            <form
              onSubmit={e => {
                e.preventDefault()
                handleSend(input)
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1">
                <Input
                  placeholder={
                    activeMatch
                      ? `Ask tactical questions about ${activeMatch.home_team.name} vs ${activeMatch.away_team.name}...`
                      : 'Ask about formations, Elo models, tactical theory...'
                  }
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isThinking}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={!input.trim() || isThinking}
                className="h-[44px] px-4"
              >
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AITacticalCenterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#94A3B8]">Loading AI Tactical Center...</div>}>
      <AIContent />
    </Suspense>
  )
}