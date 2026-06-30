'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { checkHealth, getInsights, getTeams } from '@/lib/api'
import { ChevronRight, Zap } from 'lucide-react'

interface BootLine {
  text: string
  status: 'loading' | 'online' | 'offline' | 'pending'
}

const BOOT_SEQUENCE: BootLine[] = [
  { text: 'Connecting Tactical Engine...', status: 'pending' },
  { text: 'Loading AI Models...', status: 'pending' },
  { text: 'Player Tracking Ready...', status: 'pending' },
  { text: 'Momentum Engine Online...', status: 'pending' },
  { text: 'World Cup Intelligence Connected...', status: 'pending' },
  { text: 'OFFSIDE // READY', status: 'pending' },
]

function PitchBackground() {
  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none" style={{ perspective: '1200px' }}>
      <div className="absolute inset-0 z-10" style={{ background: 'radial-gradient(circle at center, transparent 0%, #050508 80%)' }} />
      <svg
        viewBox="0 0 800 500"
        className="w-[140vw] max-w-none opacity-40"
        style={{ 
          transform: 'rotateX(65deg) translateY(0%) scale(1.4)',
          transformOrigin: 'center center',
          animation: 'fadeInUp 2s ease-out forwards' 
        }}
      >
        <defs>
          <radialGradient id="pitchGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FF87" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#050508" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="500" fill="url(#pitchGlow)" />

        {/* Pitch lines */}
        <g stroke="#00FF87" strokeWidth="0.8" fill="none" strokeOpacity="0.15">
        <rect x="40" y="20" width="720" height="460" />
        <line x1="400" y1="20" x2="400" y2="480" />
        <circle cx="400" cy="250" r="60" />
        <circle cx="400" cy="250" r="3" fill="#00FF87" />
        {/* Penalty areas */}
        <rect x="40" y="150" width="120" height="200" />
        <rect x="640" y="150" width="120" height="200" />
        {/* Goal areas */}
        <rect x="40" y="195" width="50" height="110" />
        <rect x="710" y="195" width="50" height="110" />
        {/* Corner arcs */}
        <path d="M 40 40 A 20 20 0 0 1 60 20" />
        <path d="M 740 20 A 20 20 0 0 1 760 40" />
        <path d="M 40 460 A 20 20 0 0 0 60 480" />
        <path d="M 740 480 A 20 20 0 0 0 760 460" />
      </g>

      {/* Radar sweep */}
      <g transform="translate(400,250)">
        <circle r="60" fill="none" stroke="#00FF87" strokeOpacity="0.1" strokeWidth="1" />
        <line
          x1="0" y1="0" x2="60" y2="0"
          stroke="#00FF87" strokeOpacity="0.4" strokeWidth="1"
          style={{ transformOrigin: '0 0', animation: 'radarSweep 4s linear infinite' }}
        />
        <circle r="3" fill="#00FF87" fillOpacity="0.6" />
      </g>

      {/* Tactical lines */}
      {[
        [160, 100, 300, 250], [300, 250, 400, 180], [400, 180, 540, 280],
        [160, 380, 300, 250], [400, 320, 540, 230],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#00FF87" strokeOpacity="0.25" strokeWidth="0.8"
          strokeDasharray="4 4"
          style={{
            animation: `drawLine 2s ease-out ${i * 0.3}s forwards`,
            strokeDashoffset: 1000,
          }}
        />
      ))}

      {/* Player tracking dots */}
      {[
        [160, 100], [240, 180], [300, 250], [400, 180], [500, 200],
        [540, 280], [620, 150], [680, 280], [160, 380], [300, 420],
      ].map(([x, y], i) => (
        <g key={i}>
          {/* Outer glow */}
          <circle cx={x} cy={y} r="15" fill={i < 5 ? '#00FF87' : '#E8003D'} fillOpacity="0.1" style={{ animation: `particleDrift ${3 + i * 0.4}s ease-in-out ${i * 0.2}s infinite alternate` }} />
          {/* Core */}
          <circle
            cx={x} cy={y} r="4"
            fill={i < 5 ? '#00FF87' : '#E8003D'}
            fillOpacity="0.9"
            style={{ animation: `particleDrift ${3 + i * 0.4}s ease-in-out ${i * 0.2}s infinite alternate` }}
          />
        </g>
      ))}
    </svg>
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [scene, setScene] = useState<1 | 2 | 3>(1)
  const [lines, setLines] = useState<BootLine[]>(BOOT_SEQUENCE)
  const [currentLine, setCurrentLine] = useState(0)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [teamCount, setTeamCount] = useState<number | null>(null)
  const [matchCount, setMatchCount] = useState<number | null>(null)

  useEffect(() => {
    const runBoot = async () => {
      // Line 0 — health check
      await delay(300)
      setLines(l => update(l, 0, 'loading'))
      setCurrentLine(0)
      try {
        await checkHealth()
        await delay(500)
        setLines(l => update(l, 0, 'online'))
      } catch {
        await delay(500)
        setLines(l => update(l, 0, 'offline'))
      }

      // Line 1 — fetch teams (AI models)
      await delay(400)
      setLines(l => update(l, 1, 'loading'))
      setCurrentLine(1)
      try {
        const data = await getTeams()
        setTeamCount(data.teams?.length ?? 336)
        await delay(400)
        setLines(l => update(l, 1, 'online'))
      } catch {
        setTeamCount(336)
        await delay(400)
        setLines(l => update(l, 1, 'offline'))
      }

      // Line 2
      await delay(350)
      setLines(l => update(l, 2, 'loading'))
      setCurrentLine(2)
      await delay(500)
      setLines(l => update(l, 2, 'online'))

      // Line 3 — fetch insights
      await delay(300)
      setLines(l => update(l, 3, 'loading'))
      setCurrentLine(3)
      try {
        const data = await getInsights()
        setAccuracy(data.model_accuracy ?? 57.6)
        setMatchCount(data.matches_trained ?? 32359)
        await delay(500)
        setLines(l => update(l, 3, 'online'))
      } catch {
        setAccuracy(57.6)
        setMatchCount(32359)
        await delay(500)
        setLines(l => update(l, 3, 'offline'))
      }

      // Line 4
      await delay(350)
      setLines(l => update(l, 4, 'loading'))
      setCurrentLine(4)
      await delay(500)
      setLines(l => update(l, 4, 'online'))

      // Line 5 — final
      await delay(400)
      setLines(l => update(l, 5, 'loading'))
      setCurrentLine(5)
      await delay(800)
      setLines(l => update(l, 5, 'online'))

      // Transition to scene 2
      await delay(600)
      setScene(2)
      await delay(1200)
      setScene(3)
    }

    runBoot()
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#050508' }}>
      {/* Pitch background — visible from scene 2 */}
      <AnimatePresence>
        {scene >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <PitchBackground />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene 1 — Boot terminal */}
      <AnimatePresence>
        {scene === 1 && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="flex flex-col gap-3" style={{ minWidth: 440 }}>
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: i <= currentLine ? 1 : 0.1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className="flex items-center gap-3 font-mono text-[13px]"
                >
                  {/* Status indicator */}
                  <span style={{ width: 8 }}>
                    {line.status === 'loading' && (
                      <span style={{ color: '#F59E0B', animation: 'terminalBlink 0.8s infinite' }}>▋</span>
                    )}
                    {line.status === 'online' && <span style={{ color: '#00FF87' }}>●</span>}
                    {line.status === 'offline' && <span style={{ color: '#E8003D' }}>●</span>}
                    {line.status === 'pending' && <span style={{ color: '#1A1D27' }}>○</span>}
                  </span>
                  <span style={{ color: line.status === 'online' ? '#00FF87' : line.status === 'offline' ? '#94A3B8' : line.status === 'loading' ? '#F0F4F8' : '#1A1D27' }}>
                    {line.text}
                    {line.status === 'offline' && <span style={{ color: '#6B7280' }}> (offline)</span>}
                  </span>
                  {i === currentLine && line.status === 'loading' && (
                    <span style={{ color: '#00FF87', animation: 'terminalBlink 0.6s infinite' }}>▋</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene 3 — Hero */}
      <AnimatePresence>
        {scene === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative min-h-screen flex flex-col"
          >
            {/* Hero section */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8" style={{ paddingTop: 80, paddingBottom: 180 }}>
              {/* Label */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mb-6"
              >
                <div style={{ width: 24, height: 1, background: '#00FF87' }} />
                <span className="font-mono text-[11px] tracking-widest" style={{ color: '#00FF87' }}>WORLD CUP 2026 // AI INTELLIGENCE</span>
                <div style={{ width: 24, height: 1, background: '#00FF87' }} />
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 'clamp(42px, 6vw, 80px)',
                  fontWeight: 700,
                  lineHeight: 1.05,
                  color: '#F0F4F8',
                  letterSpacing: '-0.02em',
                  maxWidth: 900,
                  marginBottom: 24,
                }}
              >
                Football Intelligence<br />
                <span style={{ color: '#00FF87' }}>Beyond The Scoreline.</span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ fontSize: 18, color: '#94A3B8', maxWidth: 540, lineHeight: 1.6, fontFamily: 'Inter, sans-serif', marginBottom: 40 }}
              >
                AI-powered tactical analysis, win probability, momentum tracking and player DNA scoring — built for the 2026 World Cup.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center gap-6 mt-12 relative z-20"
              >
                <style>{`
                  @keyframes scanline {
                    0% { transform: translateY(-20px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(80px); opacity: 0; }
                  }
                  .scan-effect {
                    animation: scanline 2s linear infinite;
                  }
                `}</style>

                {/* Primary Tactical Trigger */}
                <button
                  onClick={() => router.push('/matches')}
                  className="group relative flex flex-col items-center justify-center px-16 py-6 rounded-[8px] border overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                  style={{ 
                    background: '#050508',
                    borderColor: '#00FF87',
                    boxShadow: '0 0 30px rgba(0,255,135,0.2), inset 0 0 20px rgba(0,255,135,0.15)' 
                  }}
                >
                  <div className="absolute inset-0 bg-[#00FF87] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#00FF87] opacity-0 group-hover:opacity-50 blur-[1px] group-hover:scan-effect" />
                  
                  <span className="font-mono text-[11px] tracking-[0.3em] mb-2" style={{ color: '#00FF87' }}>CMD_EXECUTE_WAR_ROOM</span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[22px] font-bold tracking-widest text-white">ENTER WAR ROOM</span>
                    <ChevronRight size={24} strokeWidth={3} style={{ color: '#00FF87' }} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </button>

                {/* Secondary Console Button */}
                <button
                  onClick={() => router.push('/matches?tab=live')}
                  className="group relative flex flex-col items-center justify-center px-14 py-6 rounded-[8px] border transition-all duration-300 hover:scale-[1.02]"
                  style={{ 
                    background: 'rgba(15,17,23,0.5)', 
                    backdropFilter: 'blur(16px)', 
                    borderColor: 'rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                  }}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                  <span className="font-mono text-[11px] tracking-[0.3em] mb-2 opacity-60 text-white">SYS_EXPLORE_MATCHES</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[20px] tracking-widest text-[#F0F4F8]">EXPLORE MATCHES</span>
                  </div>
                </button>
              </motion.div>

              {/* Real stats strip */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center gap-12 mt-20"
              >
                {[
                  { value: accuracy ? `${accuracy.toFixed(1)}%` : '57.6%', label: 'MODEL ACCURACY' },
                  { value: teamCount?.toLocaleString() ?? '336', label: 'TEAMS INDEXED' },
                  { value: matchCount?.toLocaleString() ?? '32,359', label: 'MATCHES TRAINED' },
                  { value: '44%', label: 'ELO IMPORTANCE' },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col items-center">
                    <span className="font-mono font-bold" style={{ fontSize: 32, color: '#F0F4F8', lineHeight: 1 }}>
                      {value}
                    </span>
                    <span className="font-mono text-[10px] tracking-widest mt-1" style={{ color: '#6B7280' }}>
                      {label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Feature strip - Extra Large Floating Glass Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 mb-20 z-20 w-full max-w-[1200px] self-center px-8"
            >
              {[
                { icon: '⚡', title: 'Momentum Engine', desc: 'Real-time momentum scoring from shots, possession and xG deltas.' },
                { icon: '🧬', title: 'Player DNA Score', desc: 'AI-generated performance fingerprint across 6 tactical attributes.' },
                { icon: '🤖', title: 'AI Tactical Center', desc: '4 distinct analyst personalities to chat about live match state.' },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="px-10 py-12 rounded-[24px] flex flex-col gap-3 transition-all duration-300 hover:-translate-y-3"
                  style={{ 
                    background: 'rgba(15, 17, 23, 0.5)', 
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 16px 50px rgba(0,0,0,0.6), inset 0 0 40px rgba(255,255,255,0.04)'
                  }}
                >
                  <div className="text-6xl opacity-90 mb-6">{icon}</div>
                  <div className="flex flex-col text-left">
                    <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700, color: '#F0F4F8', marginBottom: 16 }}>
                      {title}
                    </h3>
                    <p style={{ fontSize: 18, color: '#94A3B8', fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function update(lines: BootLine[], index: number, status: BootLine['status']): BootLine[] {
  return lines.map((l, i) => i === index ? { ...l, status } : l)
}
