'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, Bot, Dna, ArrowRight } from 'lucide-react'
import { Card, Button } from '@/components/shared/Primitives'
import { SplashScreen } from '@/components/shared/SplashScreen'
import { getMatches } from '@/lib/api'

function PitchBackground() {
  return (
    <div className="absolute inset-0 w-full h-[640px] pointer-events-none overflow-hidden select-none">
      {/* Soft radial scrim protecting the text region */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 30%, #050508 30%, rgba(5,5,8,0.7) 70%, #050508 100%)',
        }}
      />
      
      {/* Faint wireframe tactical pitch placed below the text region */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <svg
          viewBox="0 0 1000 600"
          className="w-[120vw] max-w-[1400px] h-auto"
          style={{ transform: 'perspective(1000px) rotateX(60deg) translateY(120px)' }}
        >
          <g stroke="var(--color-accent, #00FF87)" strokeWidth="1" fill="none" strokeOpacity="0.2">
            <rect x="50" y="30" width="900" height="540" />
            <line x1="500" y1="30" x2="500" y2="570" />
            <circle cx="500" cy="300" r="80" />
            <circle cx="500" cy="300" r="3" fill="var(--color-accent, #00FF87)" />
            <rect x="50" y="160" width="160" height="280" />
            <rect x="790" y="160" width="160" height="280" />
            <rect x="50" y="220" width="60" height="160" />
            <rect x="890" y="220" width="60" height="160" />
          </g>
        </svg>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [firstMatchId, setFirstMatchId] = useState<string>('live_1')

  useEffect(() => {
    // Attempt to grab live or upcoming match id for direct War Room entry
    getMatches('live')
      .then(res => {
        if (res?.matches && res.matches.length > 0) {
          setFirstMatchId(res.matches[0].id)
        } else {
          getMatches('upcoming').then(up => {
            if (up?.matches && up.matches.length > 0) {
              setFirstMatchId(up.matches[0].id)
            }
          }).catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="relative min-h-[calc(100dvh-56px)] flex flex-col items-center justify-between overflow-x-hidden">
      <SplashScreen />
      <PitchBackground />

      <main className="relative z-20 w-full max-w-[1120px] mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-32 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent,#00FF87)]" />
          <span className="text-[12px] font-medium text-[#94A3B8]">
            Global football intelligence
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-[36px] sm:text-[48px] md:text-[64px] font-bold tracking-tight text-white max-w-[800px] leading-[1.08] mb-6"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Beyond The <span style={{ color: 'var(--color-accent, #00FF87)' }}>Scoreline.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[16px] sm:text-[18px] text-[#94A3B8] max-w-[640px] leading-[1.6] mb-8">
          Real-time tactical intelligence, live win probabilities, momentum shifts, and deep player DNA profiling powered by machine learning and multi-persona analysis.
        </p>

        {/* CTA Group: 32px below subtitle, primary + secondary */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto min-w-[200px] h-[48px] text-[15px]"
            onClick={() => router.push(`/match/${firstMatchId}`)}
          >
            Enter War Room
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto min-w-[180px] h-[48px] text-[15px]"
            onClick={() => router.push('/matches')}
          >
            Explore matches
          </Button>
        </div>

        {/* Stat strip: 64px below CTAs, one container, hairline dividers */}
        <div className="w-full max-w-[960px] rounded-xl bg-[#0F1117] border border-white/[0.08] p-6 mb-16 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {/* Stat 1: Accuracy (only 57.6% in accent) */}
            <div className="flex flex-col items-center justify-center p-2">
              <span
                className="text-[32px] font-bold tracking-tight mb-1"
                style={{ color: 'var(--color-accent, #00FF87)', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                57.6%
              </span>
              <span className="text-[12px] text-[#94A3B8]">Validation accuracy</span>
            </div>

            {/* Stat 2: Matches */}
            <div className="flex flex-col items-center justify-center p-2 pt-4 md:pt-2">
              <span
                className="text-[32px] font-bold tracking-tight text-white mb-1"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                32,359
              </span>
              <span className="text-[12px] text-[#94A3B8]">Matches trained</span>
            </div>

            {/* Stat 3: Teams */}
            <div className="flex flex-col items-center justify-center p-2 pt-4 md:pt-2">
              <span
                className="text-[32px] font-bold tracking-tight text-white mb-1"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                336
              </span>
              <span className="text-[12px] text-[#94A3B8]">Clubs & nations indexed</span>
            </div>

            {/* Stat 4: Elo Weight */}
            <div className="flex flex-col items-center justify-center p-2 pt-4 md:pt-2">
              <span
                className="text-[32px] font-bold tracking-tight text-white mb-1"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                44%
              </span>
              <span className="text-[12px] text-[#94A3B8]">Elo differential weight</span>
            </div>
          </div>
        </div>

        {/* Feature Cards: 3 cards, gap 24, padding 24, 40px accent-soft circle, title 18px, desc 14px/1.6 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Card 1: War Room */}
          <Link href={`/match/${firstMatchId}`} className="group block h-full">
            <Card hover className="h-full flex flex-col p-6 transition-all">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-accent-soft,rgba(0,255,135,0.12))] text-[var(--color-accent,#00FF87)] mb-5">
                <Activity size={20} />
              </div>
              <h2
                className="text-[18px] font-semibold text-white tracking-tight mb-2 group-hover:text-[var(--color-accent,#00FF87)] transition-colors"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Live War Room
              </h2>
              <p className="text-[14px] text-[#94A3B8] leading-[1.6] flex-1">
                Real-time pitch visualization, momentum swings, expected goals (xG), and live win probabilities computed dynamically.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-accent,#00FF87)]">
                Launch war room <ArrowRight size={14} />
              </div>
            </Card>
          </Link>

          {/* Card 2: AI Multi-Persona */}
          <Link href="/ai" className="group block h-full">
            <Card hover className="h-full flex flex-col p-6 transition-all">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-accent-soft,rgba(0,255,135,0.12))] text-[var(--color-accent,#00FF87)] mb-5">
                <Bot size={20} />
              </div>
              <h2
                className="text-[18px] font-semibold text-white tracking-tight mb-2 group-hover:text-[var(--color-accent,#00FF87)] transition-colors"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Tactical AI Analyst
              </h2>
              <p className="text-[14px] text-[#94A3B8] leading-[1.6] flex-1">
                Four distinct AI viewpoints: tactical rigor, broadcast commentary, dugout coaching advice, and raw fan emotion.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-accent,#00FF87)]">
                Consult analyst <ArrowRight size={14} />
              </div>
            </Card>
          </Link>

          {/* Card 3: Deep Player DNA */}
          <Link href="/players" className="group block h-full">
            <Card hover className="h-full flex flex-col p-6 transition-all">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-accent-soft,rgba(0,255,135,0.12))] text-[var(--color-accent,#00FF87)] mb-5">
                <Dna size={20} />
              </div>
              <h2
                className="text-[18px] font-semibold text-white tracking-tight mb-2 group-hover:text-[var(--color-accent,#00FF87)] transition-colors"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Player DNA Profiling
              </h2>
              <p className="text-[14px] text-[#94A3B8] leading-[1.6] flex-1">
                Full 6-attribute radar analysis, pitch-accurate shot maps, strength/vulnerability audits, and similar player benchmarking.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-accent,#00FF87)]">
                Explore roster <ArrowRight size={14} />
              </div>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
