'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { askAnalyst } from '@/lib/api'
import type { PersonalityType, ConversationMessage } from '@/lib/types'
import { Waveform } from '@/components/ai-center/Waveform'
import { PERSONALITIES } from '@/lib/constants'
import { Send, Zap, Shield, Mic, Flame } from 'lucide-react'

const QUICK_CHIPS = [
  (home?: string) => `Why is ${home ?? 'the home team'} losing momentum?`,
  () => 'Counter-tactic for 4-3-3 high press?',
  () => 'Who should be substituted now?',
  () => 'Predict the next goal scorer.',
]

const PERSONALITY_CONFIG = {
  tactical: {
    icon: Shield,
    color: '#00FF87',
    label: 'TACTICAL ANALYST',
    sub: 'Data-driven, formation analysis',
    accent: 'rgba(0,255,135,0.08)',
    border: 'rgba(0,255,135,0.25)',
  },
  broadcast: {
    icon: Mic,
    color: '#3B82F6',
    label: 'BROADCAST',
    sub: 'Live commentary style',
    accent: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
  },
  coach: {
    icon: Zap,
    color: '#F59E0B',
    label: 'FORMER COACH',
    sub: 'Authoritative, player-specific',
    accent: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
  },
  fan: {
    icon: Flame,
    color: '#E8003D',
    label: 'UNHINGED FAN',
    sub: 'Passionate, hyperbolic, raw',
    accent: 'rgba(232,0,61,0.08)',
    border: 'rgba(232,0,61,0.25)',
  },
}

export default function AITacticalCenter() {
  const { currentMatch, personality, setPersonality } = useApp()
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeConfig = PERSONALITY_CONFIG[personality] ?? PERSONALITY_CONFIG.tactical

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  const handleSend = async (question: string) => {
    if (!question.trim() || isThinking) return
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
        match_context: currentMatch ? {
          home: currentMatch.home_team.name,
          away: currentMatch.away_team.name,
          score: currentMatch.score,
          minute: currentMatch.minute,
        } : undefined,
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
    } catch (err) {
      console.error('[AI page] askAnalyst failed:', err)
      setConversation(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Analyst unavailable — tactical engine is reconnecting. Please try again.',
        personality,
        timestamp: new Date(),
      }])
    } finally {
      setIsThinking(false)
    }
  }

  const handlePersonalityChange = async (p: PersonalityType) => {
    setPersonality(p)
    await handleSend(`Introduce yourself as the ${p} analyst and briefly describe how you approach match analysis.`)
  }

  return (
    <div style={{
      height: '100vh',
      background: '#050508',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        flexShrink: 0,
        padding: '20px 32px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: '0.15em', color: '#6B7280', marginBottom: 4 }}>
            AI TACTICAL CENTER
          </p>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700, color: '#F0F4F8', margin: 0 }}>
            Analyst Consultation
          </h1>
        </div>
        {/* Active analyst badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 16px',
          borderRadius: 4,
          background: activeConfig.accent,
          border: `1px solid ${activeConfig.border}`,
        }}>
          <Waveform isActive={isThinking} personality={personality} />
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 600, color: activeConfig.color }}>
            {activeConfig.label}
          </span>
          {isThinking && (
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: '0.1em' }}>
              THINKING...
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ── LEFT PANEL (320px) ── */}
        <div style={{
          width: 320,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px',
          gap: 24,
          overflowY: 'auto',
        }}>

          {/* Analyst Mode label */}
          <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: '0.15em', color: '#6B7280', margin: 0 }}>
            ANALYST MODE
          </p>

          {/* Personality cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(Object.entries(PERSONALITY_CONFIG) as [PersonalityType, typeof PERSONALITY_CONFIG.tactical][]).map(([id, cfg]) => {
              const Icon = cfg.icon
              const isActive = personality === id
              return (
                <button
                  key={id}
                  onClick={() => handlePersonalityChange(id)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 4,
                    background: isActive ? cfg.accent : '#0F1117',
                    border: `1px solid ${isActive ? cfg.border : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = '#1A1D27'
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = '#0F1117'
                  }}
                >
                  {/* Icon box */}
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: 4,
                    background: isActive ? `${cfg.color}20` : 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} color={isActive ? cfg.color : '#6B7280'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: 11,
                      fontWeight: 600,
                      color: isActive ? cfg.color : '#F0F4F8',
                      margin: 0, marginBottom: 2,
                      letterSpacing: '0.05em',
                    }}>
                      {cfg.label}
                    </p>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 11,
                      color: '#6B7280',
                      margin: 0,
                    }}>
                      {cfg.sub}
                    </p>
                  </div>
                  {/* Active dot */}
                  {isActive && (
                    <div style={{
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: cfg.color,
                      flexShrink: 0,
                    }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Match context card */}
          <div>
            <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: '0.15em', color: '#6B7280', marginBottom: 10 }}>
              {currentMatch ? 'ANALYZING' : 'NO MATCH SELECTED'}
            </p>
            <div style={{
              padding: '14px 16px',
              borderRadius: 4,
              background: '#0F1117',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {currentMatch ? (
                <>
                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, fontWeight: 600, color: '#F0F4F8', margin: 0, marginBottom: 6 }}>
                    {currentMatch.home_team.name}
                  </p>
                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 24, fontWeight: 700, color: '#00FF87', margin: 0, marginBottom: 6, letterSpacing: '-0.02em' }}>
                    {currentMatch.score?.home ?? '—'} — {currentMatch.score?.away ?? '—'}
                  </p>
                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, fontWeight: 600, color: '#F0F4F8', margin: 0, marginBottom: 10 }}>
                    {currentMatch.away_team.name}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {currentMatch.minute && (
                      <span style={{
                        fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
                        padding: '2px 8px', borderRadius: 2,
                        background: 'rgba(232,0,61,0.12)', color: '#E8003D',
                        letterSpacing: '0.1em',
                      }}>
                        {currentMatch.minute}'
                      </span>
                    )}
                    <span style={{
                      fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
                      padding: '2px 8px', borderRadius: 2,
                      background: 'rgba(255,255,255,0.05)', color: '#94A3B8',
                      letterSpacing: '0.05em',
                    }}>
                      {currentMatch.competition}
                    </span>
                  </div>
                </>
              ) : (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                  Go to Matches and click a fixture to load match context here.
                </p>
              )}
            </div>
          </div>

          {/* Session stats */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: 4,
              background: '#0F1117',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#6B7280', margin: 0, marginBottom: 2, letterSpacing: '0.1em' }}>MESSAGES</p>
                <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 20, fontWeight: 600, color: '#F0F4F8', margin: 0 }}>{conversation.length}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#6B7280', margin: 0, marginBottom: 2, letterSpacing: '0.1em' }}>MODE</p>
                <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 600, color: activeConfig.color, margin: 0 }}>
                  {personality.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CHAT PANEL ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>

          {/* Message feed */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            scrollbarWidth: 'thin',
            scrollbarColor: '#1A1D27 transparent',
          }}>
            {conversation.length === 0 && !isThinking && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 16, textAlign: 'center', padding: '60px 0',
              }}>
                {/* Big personality icon */}
                <div style={{
                  width: 72, height: 72,
                  borderRadius: 4,
                  background: activeConfig.accent,
                  border: `1px solid ${activeConfig.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {React.createElement(activeConfig.icon, { size: 32, color: activeConfig.color })}
                </div>
                <div>
                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, letterSpacing: '0.15em', color: '#F0F4F8', margin: 0, marginBottom: 8 }}>
                    {activeConfig.label} READY
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B7280', margin: 0, maxWidth: 420, lineHeight: 1.6 }}>
                    Ask about formations, tactical adjustments, player performance, or match predictions. Use the chips below to get started.
                  </p>
                </div>
                {/* Suggested questions as larger cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8, maxWidth: 560 }}>
                  {QUICK_CHIPS.map((chip, i) => {
                    const text = chip(currentMatch?.home_team.name)
                    return (
                      <button
                        key={i}
                        onClick={() => handleSend(text)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 4,
                          background: '#0F1117',
                          border: '1px solid rgba(255,255,255,0.06)',
                          color: '#94A3B8',
                          fontFamily: 'IBM Plex Mono, monospace',
                          fontSize: 11,
                          textAlign: 'left',
                          cursor: 'pointer',
                          lineHeight: 1.4,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#1A1D27'
                          e.currentTarget.style.borderColor = `${activeConfig.color}30`
                          e.currentTarget.style.color = '#F0F4F8'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#0F1117'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                          e.currentTarget.style.color = '#94A3B8'
                        }}
                      >
                        {text}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {conversation.map(msg => {
              const isUser = msg.role === 'user'
              const msgConfig = PERSONALITY_CONFIG[msg.personality as PersonalityType] ?? activeConfig
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '72%',
                    padding: '14px 18px',
                    borderRadius: 4,
                    background: isUser ? '#1A1D27' : '#0F1117',
                    borderLeft: !isUser ? `2px solid ${msgConfig.color}` : undefined,
                    border: isUser ? '1px solid rgba(255,255,255,0.06)' : `1px solid rgba(255,255,255,0.04)`,
                  }}>
                    {!isUser && (
                      <p style={{
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: 9,
                        letterSpacing: '0.15em',
                        color: msgConfig.color,
                        margin: 0, marginBottom: 6,
                      }}>
                        {msgConfig.label}
                      </p>
                    )}
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 14,
                      lineHeight: 1.65,
                      color: '#F0F4F8',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content}
                    </p>
                    <span style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: 9,
                      color: '#6B7280',
                      display: 'block',
                      marginTop: 8,
                    }}>
                      {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}

            {isThinking && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 4,
                  background: '#0F1117',
                  borderLeft: `2px solid ${activeConfig.color}`,
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, letterSpacing: '0.15em', color: activeConfig.color, margin: 0, marginBottom: 8 }}>
                    {activeConfig.label}
                  </p>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        style={{
                          width: 6, height: 6,
                          borderRadius: '50%',
                          background: activeConfig.color,
                          animation: `livePulse 1s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Bottom: chips + input ── */}
          <div style={{
            flexShrink: 0,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 32px 20px',
          }}>
            {/* Quick chips — only show when conversation is active */}
            {conversation.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {QUICK_CHIPS.map((chip, i) => {
                  const text = chip(currentMatch?.home_team.name)
                  return (
                    <button
                      key={i}
                      onClick={() => handleSend(text)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 999,
                        background: '#1A1D27',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: '#94A3B8',
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: 10,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        letterSpacing: '0.03em',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = `${activeConfig.color}40`
                        e.currentTarget.style.color = '#F0F4F8'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                        e.currentTarget.style.color = '#94A3B8'
                      }}
                    >
                      {text}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Input bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              borderRadius: 8,
              backdropFilter: 'blur(8px)',
              background: 'rgba(15,17,23,0.9)',
              border: `1px solid rgba(255,255,255,0.08)`,
              transition: 'border-color 0.15s',
            }}
              onFocusCapture={e => (e.currentTarget.style.borderColor = `${activeConfig.color}30`)}
              onBlurCapture={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask the analyst..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                disabled={isThinking}
                style={{
                  flex: 1,
                  background: 'transparent',
                  outline: 'none',
                  border: 'none',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 13,
                  color: '#F0F4F8',
                }}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={isThinking || !input.trim()}
                style={{
                  width: 36, height: 36,
                  borderRadius: 4,
                  background: input.trim() && !isThinking ? activeConfig.color : 'rgba(255,255,255,0.05)',
                  border: 'none',
                  cursor: input.trim() && !isThinking ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              >
                <Send size={15} color={input.trim() && !isThinking ? '#050508' : '#6B7280'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}