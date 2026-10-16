'use client'
import React from 'react'

export function FallbackBadge({ label = 'Offline data' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] font-mono text-[11px] font-medium tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      {label}
    </span>
  )
}

export function ProbabilityBar({
  home = 33,
  draw = 34,
  away = 33,
  homeLabel,
  awayLabel,
  showLabels = false,
}: {
  home?: number
  draw?: number
  away?: number
  homeLabel?: string
  awayLabel?: string
  showLabels?: boolean
}) {
  const h = Math.round(home)
  const d = Math.round(draw)
  const a = Math.round(away)

  return (
    <div className="w-full flex flex-col gap-1.5">
      {showLabels && (
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#38BDF8] truncate max-w-[120px] font-medium" title={homeLabel}>
            {homeLabel ?? 'HOME'} {h}%
          </span>
          <span className="text-[#94A3B8] font-medium">DRAW {d}%</span>
          <span className="text-[#F43F5E] truncate max-w-[120px] font-medium text-right" title={awayLabel}>
            {awayLabel ?? 'AWAY'} {a}%
          </span>
        </div>
      )}
      <div className="h-1.5 w-full bg-[#1A1D27] rounded-full overflow-hidden flex">
        <div
          style={{ width: `${h}%` }}
          className="bg-[#38BDF8] h-full transition-all duration-300"
          title={`Home: ${h}%`}
        />
        <div
          style={{ width: `${d}%` }}
          className="bg-[#64748B] h-full transition-all duration-300"
          title={`Draw: ${d}%`}
        />
        <div
          style={{ width: `${a}%` }}
          className="bg-[#F43F5E] h-full transition-all duration-300"
          title={`Away: ${a}%`}
        />
      </div>
    </div>
  )
}

export function StatBar({
  label,
  homeValue,
  awayValue,
  unit = '',
  higherIsBetter = true,
}: {
  label: string
  homeValue: number
  awayValue: number
  unit?: string
  higherIsBetter?: boolean
}) {
  const total = homeValue + awayValue || 1
  const homePct = Math.round((homeValue / total) * 100)
  const awayPct = 100 - homePct

  return (
    <div className="flex flex-col gap-1 w-full py-1.5">
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-mono tabular-nums font-semibold text-[#F0F4F8]">
          {homeValue}
          {unit}
        </span>
        <span className="text-[11px] font-medium tracking-wider text-[#94A3B8] uppercase">
          {label}
        </span>
        <span className="font-mono tabular-nums font-semibold text-[#F0F4F8]">
          {awayValue}
          {unit}
        </span>
      </div>
      <div className="h-1.5 w-full bg-[#1A1D27] rounded-full overflow-hidden flex gap-0.5">
        <div
          style={{ width: `${homePct}%` }}
          className="bg-[#38BDF8] h-full transition-all duration-300 rounded-l-full"
        />
        <div
          style={{ width: `${awayPct}%` }}
          className="bg-[#F43F5E] h-full transition-all duration-300 rounded-r-full"
        />
      </div>
    </div>
  )
}

export function SegmentedTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[]
  active: T
  onChange: (id: T) => void
}) {
  return (
    <div className="inline-flex items-center p-1 bg-[#0F1117] border border-white/[0.08] rounded-[6px] gap-1 h-10">
      {tabs.map(tab => {
        const isSelected = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1 rounded-[4px] font-mono text-[11px] font-medium tracking-wider transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              isSelected
                ? 'bg-[#1A1D27] text-[#00FF87] border border-[#00FF87]/30 shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F0F4F8] hover:bg-white/[0.03]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1 rounded-[2px] ${
                  isSelected ? 'bg-[#00FF87]/20 text-[#00FF87]' : 'bg-white/[0.06] text-[#6B7280]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#0F1117] border border-white/[0.08] rounded-[6px] p-4 transition-all duration-150 ${
        hoverable ? 'hover:bg-[#1A1D27] hover:border-[#00FF87]/30 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
