'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { checkHealth, getInsights, getTeams } from '@/lib/api'
import { ChevronRight, Zap, Dna, Bot, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface BootLine {
  text: string
  status: 'loading' | 'online' | 'offline' | 'pending'
}

const BOOT_SEQUENCE: BootLine[] = [
  { text: 'Connecting Tactical Engine...', status: 'pending' },
  { text: 'Loading AI Models...', status: 'pending' },
  { text: 'Player Tracking Ready...', status: 'pending' },
  { text: 'Momentum Engine Online...', status: 'pending' },
  { text: 'Global Football Intelligence Connected...', status: 'pending' },
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
  const { user, openAuthModal } = useAuth()
  const [scene, setScene] = useState<1 | 2 | 3>(1)
  const [lines, setLines] = useState<BootLine[]>(BOOT_SEQUENCE)
  const [currentLine, setCurrentLine] = useState(0)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [teamCount, setTeamCount] = useState<number | null>(null)
  const [matchCount, setMatchCount] = useState<number | null>(null)

  const handleProtectedNavigate = (path: string) => {
    if (!user) {
      openAuthModal()
      return
    }
    router.push(path)
  }

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
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ background: '#050508' }}>
      {/* Pitch background — visible from scene 2 */}
      <AnimatePresence>
        {scene >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#050508] p-4"
          >
            <div className="flex flex-col gap-2.5 sm:gap-3 w-full max-w-[440px]">
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: i <= currentLine ? 1 : 0.1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className="flex items-center gap-2.5 sm:gap-3 font-mono text-[11px] sm:text-[13px] truncate"
                >
                  {/* Status indicator */}
                  <span className="flex-shrink-0" style={{ width: 8 }}>
                    {line.status === 'loading' && (
                      <span style={{ color: '#F59E0B', animation: 'terminalBlink 0.8s infinite' }}>▋</span>
                    )}
                    {line.status === 'online' && <span style={{ color: '#00FF87' }}>●</span>}
                    {line.status === 'offline' && <span style={{ color: '#E8003D' }}>●</span>}
                    {line.status === 'pending' && <span style={{ color: '#1A1D27' }}>○</span>}
                  </span>
                  <span className="truncate" style={{ color: line.status === 'online' ? '#00FF87' : line.status === 'offline' ? '#94A3B8' : line.status === 'loading' ? '#F0F4F8' : '#1A1D27' }}>
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
            className="relative min-h-screen flex flex-col w-full"
          >
            {/* Hero section */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-8 pt-16 sm:pt-20 pb-12 w-full">
              {/* Label */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mb-4"
              >
                <div style={{ width: 24, height: 1, background: '#00FF87' }} />
                <span className="font-mono text-[10px] sm:text-[11px] tracking-widest text-[#00FF87]">GLOBAL FOOTBALL // AI INTELLIGENCE</span>
                <div style={{ width: 24, height: 1, background: '#00FF87' }} />
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 'clamp(32px, 5.5vw, 72px)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: '#F0F4F8',
                  letterSpacing: '-0.02em',
                  maxWidth: 860,
                  marginBottom: 16,
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
                className="text-[14px] sm:text-[16px] md:text-[18px] text-gray-400 max-w-[540px] leading-relaxed mb-8 px-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                AI-powered tactical analysis, win probability, momentum tracking and player DNA scoring — built for modern elite football.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 relative z-20 mb-10 w-full sm:w-auto px-4"
              >
                {/* Primary Tactical Trigger */}
                <button
                  onClick={() => handleProtectedNavigate('/matches')}
                  className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-7 py-3 rounded-[6px] border border-[#00FF87] bg-[#050508] transition-all duration-200 hover:scale-[1.02] shadow-[0_0_20px_rgba(0,255,135,0.2)] cursor-pointer"
                >
                  {!user && <Lock size={15} className="text-[#00FF87]" />}
                  <span className="font-mono text-[13px] sm:text-[14px] font-bold tracking-wider text-white">
                    {user ? 'ENTER WAR ROOM' : 'AUTHENTICATE & ENTER'}
                  </span>
                  <ChevronRight size={18} strokeWidth={2.5} className="text-[#00FF87] group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Secondary Console Button */}
                <button
                  onClick={() => handleProtectedNavigate('/matches?tab=live')}
                  className="w-full sm:w-auto group relative flex items-center justify-center px-6 py-3 rounded-[6px] border border-white/15 bg-[#0F1117]/80 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:border-white/30 cursor-pointer"
                >
                  <span className="font-mono text-[13px] sm:text-[14px] font-medium tracking-wider text-gray-200">
                    {user ? 'EXPLORE MATCHES' : 'SIGN IN / REGISTER'}
                  </span>
                </button>
              </motion.div>

              {/* Real stats strip — 2x2 grid on mobile, row on desktop */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-14 py-4 px-6 rounded-[8px] bg-[#0F1117]/50 border border-white/5 backdrop-blur-sm w-full max-w-2xl"
              >
                {[
                  { value: accuracy ? `${accuracy.toFixed(1)}%` : '57.6%', label: 'MODEL ACCURACY' },
                  { value: teamCount?.toLocaleString() ?? '336', label: 'TEAMS INDEXED' },
                  { value: matchCount?.toLocaleString() ?? '32,359', label: 'MATCHES TRAINED' },
                  { value: '44%', label: 'ELO IMPORTANCE' },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col items-center">
                    <span className="font-mono font-bold text-[22px] sm:text-[26px] md:text-[30px] text-white leading-none">
                      {value}
                    </span>
                    <span className="font-mono text-[9px] sm:text-[10px] tracking-widest mt-1.5 text-gray-500 text-center">
                      {label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Feature strip - Centered Modern Glass Tactical Cards */}
            <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 mb-32 z-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 w-full max-w-6xl px-2 sm:px-0"
              >
                {[
                  {
                    icon: <Zap className="w-5 h-5 md:w-7 md:h-7 text-[#00FF87]" />,
                    title: 'Momentum Engine',
                    desc: 'Real-time momentum scoring computed dynamically from shot quality, possession swings, and rolling xG deltas.',
                  },
                  {
                    icon: <Dna className="w-5 h-5 md:w-7 md:h-7 text-[#38BDF8]" />,
                    title: 'Player DNA Fingerprint',
                    desc: 'Comprehensive scouting radar across 6 tactical attributes, with archetype similarity benchmarks and role fit indices.',
                  },
                  {
                    icon: <Bot className="w-5 h-5 md:w-7 md:h-7 text-[#7C3AED]" />,
                    title: 'AI Tactical Command',
                    desc: '4 distinct analyst personalities (Broadcast, Tactical, Coach, Fan) streaming live commentary and match intelligence.',
                  },
                ].map(({ icon, title, desc }) => (
                  <div
                    key={title}
                    className="p-4 sm:p-6 md:p-8 rounded-[8px] sm:rounded-[12px] flex flex-row md:flex-col items-start gap-3.5 md:gap-4 transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: 'rgba(15, 17, 23, 0.75)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-[6px] md:rounded-[8px] bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] sm:text-[17px] md:text-[20px] font-bold text-white mb-1 md:mb-2 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {title}
                      </h3>
                      <p className="text-[11px] sm:text-[12px] md:text-[13px] text-gray-400 font-sans leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
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
