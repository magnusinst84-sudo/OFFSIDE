'use client'
import React, { useState } from 'react'
import {
  ProbabilityBar, StatBar, SegmentedTabs, Chip, Card, SectionHeader,
  Button, Input, EmptyState, Avatar, Toggle, StatusBadge, FallbackBadge,
} from '@/components/shared/Primitives'
import { Search, Zap } from 'lucide-react'

/* Only show in non-production; harmless in prod too */
export default function UIKitPage() {
  const [tab, setTab] = useState<'live' | 'upcoming' | 'finished'>('upcoming')
  const [chip, setChip] = useState('All')
  const [toggle1, setToggle1] = useState(false)
  const [toggle2, setToggle2] = useState(true)
  const [inputVal, setInputVal] = useState('')

  const CHIPS = ['All', 'UCL', 'UEL', 'Premier League', 'La Liga', 'Bundesliga']

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 pb-32 space-y-16">
      <div>
        <p className="text-xs text-[#6B7280] mb-1 font-mono">DEV ONLY — remove before merge</p>
        <h1 className="font-display text-4xl font-bold">UI Kit</h1>
        <p className="text-[#94A3B8] mt-2 text-base">All primitives and patterns in all states.</p>
      </div>

      {/* ── StatusBadge ── */}
      <section>
        <SectionHeader title="StatusBadge" />
        <div className="flex flex-wrap gap-3">
          <StatusBadge status="live" minute={67} />
          <StatusBadge status="live" />
          <StatusBadge status="upcoming" />
          <StatusBadge status="finished" />
        </div>
      </section>

      {/* ── FallbackBadge ── */}
      <section>
        <SectionHeader title="FallbackBadge" />
        <FallbackBadge />
        <div className="mt-3">
          <FallbackBadge label="Limited data" />
        </div>
      </section>

      {/* ── SegmentedTabs ── */}
      <section>
        <SectionHeader title="SegmentedTabs" description="Active item uses accent-soft background, never solid green" />
        <div className="space-y-4">
          <SegmentedTabs
            tabs={[
              { id: 'live', label: 'Live', count: 3 },
              { id: 'upcoming', label: 'Upcoming', count: 24 },
              { id: 'finished', label: 'Finished' },
            ]}
            active={tab}
            onChange={setTab}
          />
          <p className="text-xs text-[#6B7280]">Full-width variant:</p>
          <SegmentedTabs
            tabs={[
              { id: 'live', label: 'Live', count: 3 },
              { id: 'upcoming', label: 'Upcoming', count: 24 },
              { id: 'finished', label: 'Finished' },
            ]}
            active={tab}
            onChange={setTab}
            fullWidth
          />
        </div>
      </section>

      {/* ── Chips ── */}
      <section>
        <SectionHeader title="Chip (filter)" description="Horizontal scroll with edge fade, no scrollbar" />
        <div className="chip-scroll py-2">
          {CHIPS.map(c => (
            <Chip key={c} label={c} selected={chip === c} onClick={() => setChip(c)} />
          ))}
        </div>
      </section>

      {/* ── ProbabilityBar ── */}
      <section>
        <SectionHeader title="ProbabilityBar" description="Hides if no data; largest-remainder rounding" />
        <div className="space-y-6 max-w-sm">
          <div>
            <p className="text-xs text-[#6B7280] mb-2">With percentages (default)</p>
            <ProbabilityBar home={29} draw={27} away={44} homeLabel="Chelsea" awayLabel="Arsenal" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280] mb-2">No percentages</p>
            <ProbabilityBar home={81} draw={12} away={7} showPercentages={false} />
          </div>
          <div>
            <p className="text-xs text-[#6B7280] mb-2">No data — hidden</p>
            <ProbabilityBar />
            <span className="text-xs text-[#6B7280]">(nothing renders above)</span>
          </div>
        </div>
      </section>

      {/* ── StatBar ── */}
      <section>
        <SectionHeader title="StatBar" />
        <div className="max-w-sm space-y-2">
          <StatBar label="Possession" homeValue={52} awayValue={48} unit="%" />
          <StatBar label="Shots" homeValue={8} awayValue={6} />
          <StatBar label="xG" homeValue={2.4} awayValue={0.8} />
        </div>
      </section>

      {/* ── Card ── */}
      <section>
        <SectionHeader title="Card" description="No border by default; hairline + surface-2 on hover when interactive" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="font-display font-semibold mb-2">Static card</p>
            <p className="text-sm text-[#94A3B8]">No border, radius 12, padding 24.</p>
          </Card>
          <Card onClick={() => {}} >
            <p className="font-display font-semibold mb-2">Interactive card</p>
            <p className="text-sm text-[#94A3B8]">Hover for border + surface-2.</p>
          </Card>
          <Card compact>
            <p className="font-display font-semibold mb-2">Compact card</p>
            <p className="text-sm text-[#94A3B8]">20px padding variant.</p>
          </Card>
        </div>
      </section>

      {/* ── Button ── */}
      <section>
        <SectionHeader title="Button" description="Primary: accent fill, black text. Secondary: surface-2. Ghost: text only." />
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="primary">Enter War Room</Button>
          <Button variant="secondary">Explore matches</Button>
          <Button variant="ghost">Continue as guest</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      {/* ── Input ── */}
      <section>
        <SectionHeader title="Input" description="44px, radius 10, autofill override, accent focus ring" />
        <div className="max-w-sm space-y-4">
          <Input label="Email" id="email-demo" type="email" placeholder="you@example.com"
            value={inputVal} onChange={e => setInputVal(e.target.value)} />
          <Input label="Search" id="search-demo" placeholder="Search players..."
            icon={<Search size={16} />} />
          <Input label="Error state" id="error-demo" placeholder="Invalid input"
            error="This field is required" />
        </div>
      </section>

      {/* ── Toggle ── */}
      <section>
        <SectionHeader title="Toggle" description="40×24 pill; off = surface-2; on = accent-soft track + accent knob" />
        <div className="space-y-4 max-w-xs">
          <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span className="text-sm" style={{ color: '#94A3B8' }}>Match start alerts</span>
            <Toggle value={toggle1} onChange={setToggle1} />
          </div>
          <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span className="text-sm" style={{ color: '#94A3B8' }}>Reduce motion</span>
            <Toggle value={toggle2} onChange={setToggle2} />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm" style={{ color: '#94A3B8' }}>Disabled toggle</span>
            <Toggle value={true} onChange={() => {}} disabled />
          </div>
        </div>
      </section>

      {/* ── Avatar ── */}
      <section>
        <SectionHeader title="Avatar / Crest" description="Image or tinted initials fallback" />
        <div className="flex items-center gap-4 flex-wrap">
          <Avatar name="Kylian Mbappé" size={40} color="#38BDF8" />
          <Avatar name="Lionel Messi" size={40} color="#F43F5E" />
          <Avatar name="Erling Haaland" size={32} />
          <Avatar src="https://media.api-sports.io/football/players/278.png" name="Messi" size={40} />
          <Avatar size={24} />
        </div>
      </section>

      {/* ── EmptyState ── */}
      <section>
        <SectionHeader title="EmptyState" description="min-height 320, centered, never a thin strip" />
        <div style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12 }}>
          <EmptyState
            icon={<Zap size={36} />}
            title="No live matches"
            description="There are no matches in progress right now. Check back during peak hours."
            action={<Button variant="secondary">View upcoming</Button>}
          />
        </div>
      </section>

      {/* ── Color palette ── */}
      <section>
        <SectionHeader title="Color tokens" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['--color-bg', '#050508', 'bg'],
            ['--color-surface-1', '#0F1117', 'surface-1'],
            ['--color-surface-2', '#1A1D27', 'surface-2'],
            ['--color-accent', '#00FF87', 'accent'],
            ['--color-home', '#38BDF8', 'home'],
            ['--color-away', '#F43F5E', 'away'],
            ['--color-draw', '#64748B', 'draw'],
            ['--color-live', '#EF4444', 'live'],
            ['--color-ai', '#7C3AED', 'ai'],
            ['--color-warn', '#F59E0B', 'warn'],
          ].map(([, hex, name]) => (
            <div key={name} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: hex, border: '1px solid rgba(255,255,255,0.1)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#F0F4F8' }}>{name}</p>
                <p className="text-xs font-mono" style={{ color: '#6B7280' }}>{hex}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
