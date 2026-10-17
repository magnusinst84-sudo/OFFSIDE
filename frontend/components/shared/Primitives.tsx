'use client'
import React from 'react'

/* ─────────────────────────────────────────────────────────
   FallbackBadge — amber pill shown when data is estimated
   ───────────────────────────────────────────────────────── */
export function FallbackBadge({ label = 'Estimated data' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium font-sans"
      style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F59E0B' }} />
      {label}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────
   StatusBadge — live / upcoming / finished
   ───────────────────────────────────────────────────────── */
export function StatusBadge({ status, minute }: { status: 'live' | 'upcoming' | 'finished'; minute?: number }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium"
        style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
        <span className="w-1.5 h-1.5 rounded-full animate-live" style={{ background: '#EF4444' }} />
        LIVE{minute !== undefined ? ` ${minute}'` : ''}
      </span>
    )
  }
  if (status === 'finished') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium"
        style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}>
        Full time
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium"
      style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}>
      Upcoming
    </span>
  )
}

/* ─────────────────────────────────────────────────────────
   ProbabilityBar — Home / Draw / Away tri-state bar
   Spec: 6px tall, fully rounded, blue/slate/rose segments,
         percentages below, aria-label.
         Hides entirely if no data provided.
   ───────────────────────────────────────────────────────── */
export function ProbabilityBar({
  home,
  draw,
  away,
  homeLabel,
  awayLabel,
  showPercentages = true,
  height = 6,
}: {
  home?: number
  draw?: number
  away?: number
  homeLabel?: string
  awayLabel?: string
  showPercentages?: boolean
  height?: number
}) {
  // Hide if no real data
  if (home === undefined || draw === undefined || away === undefined) return null
  if (home === 0 && draw === 0 && away === 0) return null

  // Largest-remainder rounding to ensure they sum to exactly 100
  const raw = [home, draw, away]
  const floors = raw.map(Math.floor)
  const rem = 100 - floors.reduce((a, b) => a + b, 0)
  const fracs = raw.map((v, i) => v - floors[i])
  // Sort indices by fractional part descending, give remainder to top ones
  const order = fracs.map((f, i) => ({ f, i })).sort((a, b) => b.f - a.f)
  order.slice(0, rem).forEach(({ i }) => floors[i]++)
  const [h, d, a] = floors

  const ariaLabel = `${homeLabel ?? 'Home'} ${h}%, draw ${d}%, ${awayLabel ?? 'away'} ${a}%`

  return (
    <div className="w-full flex flex-col gap-1" aria-label={ariaLabel}>
      {/* Bar */}
      <div
        className="w-full flex overflow-hidden rounded-full"
        style={{ height, background: 'var(--color-surface-2)' }}
        role="meter"
        aria-valuenow={h}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div style={{ width: `${h}%`, background: '#38BDF8', transition: 'width 0.4s ease' }} />
        <div style={{ width: `${d}%`, background: '#64748B', transition: 'width 0.4s ease' }} />
        <div style={{ width: `${a}%`, background: '#F43F5E', transition: 'width 0.4s ease' }} />
      </div>
      {/* Percentages */}
      {showPercentages && (
        <div className="flex w-full" style={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: '#6B7280' }}>
          <span style={{ width: `${h}%`, minWidth: h > 12 ? undefined : 0, textAlign: 'left' }}>
            {h >= 10 ? `${h}%` : ''}
          </span>
          <span style={{ width: `${d}%`, textAlign: 'center', flexShrink: 0 }}>
            {d >= 10 ? `${d}%` : ''}
          </span>
          <span style={{ width: `${a}%`, textAlign: 'right', minWidth: a > 12 ? undefined : 0 }}>
            {a >= 10 ? `${a}%` : ''}
          </span>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   StatBar — dual-sided horizontal bar for a single stat
   ───────────────────────────────────────────────────────── */
export function StatBar({
  label,
  homeValue,
  awayValue,
  unit = '',
}: {
  label: string
  homeValue: number
  awayValue: number
  unit?: string
}) {
  const total = homeValue + awayValue || 1
  const homePct = Math.round((homeValue / total) * 100)
  const awayPct = 100 - homePct

  return (
    <div className="w-full" style={{ paddingBlock: 6 }}>
      {/* Values + label */}
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 600, color: '#F0F4F8', tabularNums: 'tabular-nums' } as React.CSSProperties}>
          {homeValue}{unit}
        </span>
        <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, textAlign: 'center', flex: 1, paddingInline: 8 }}>
          {label}
        </span>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 600, color: '#F0F4F8' }}>
          {awayValue}{unit}
        </span>
      </div>
      {/* Bar */}
      <div className="flex rounded-full overflow-hidden" style={{ height: 5, background: 'var(--color-surface-2)' }}>
        <div style={{ width: `${homePct}%`, background: '#38BDF8', transition: 'width 0.4s ease' }} />
        <div style={{ width: `${awayPct}%`, background: '#F43F5E', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   SegmentedTabs — pill container with accent-soft active state
   Spec: pill container on surface-1, 4px inner padding,
         active = accent-soft bg + accent text (never solid green)
   ───────────────────────────────────────────────────────── */
export function SegmentedTabs<T extends string>({
  tabs,
  active,
  onChange,
  fullWidth = false,
  size = 'md',
}: {
  tabs: { id: T; label: string; count?: number }[]
  active: T
  onChange: (id: T) => void
  fullWidth?: boolean
  size?: 'sm' | 'md'
}) {
  return (
    <div
      className={`inline-flex items-center ${fullWidth ? 'w-full' : ''}`}
      style={{
        background: 'var(--color-surface-1)',
        borderRadius: 999,
        padding: 4,
        gap: 2,
      }}
    >
      {tabs.map(tab => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${fullWidth ? 'flex-1 justify-center' : ''}`}
            style={{
              paddingInline: size === 'sm' ? 10 : 14,
              paddingBlock: size === 'sm' ? 5 : 7,
              borderRadius: 999,
              background: isActive ? 'var(--color-accent-soft)' : 'transparent',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontSize: size === 'sm' ? 13 : 14,
              fontWeight: isActive ? 600 : 500,
              fontFamily: 'Inter, sans-serif',
              minHeight: 36,
              whiteSpace: 'nowrap',
            }}
            aria-selected={isActive}
            role="tab"
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 11,
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-faint)',
                  opacity: 0.8,
                }}
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

/* ─────────────────────────────────────────────────────────
   Chip — filter chip (full pill, 32px, accent-soft when selected)
   ───────────────────────────────────────────────────────── */
export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 cursor-pointer transition-all duration-150"
      style={{
        height: 32,
        paddingInline: 14,
        borderRadius: 999,
        background: selected ? 'var(--color-accent-soft)' : 'var(--color-surface-1)',
        color: selected ? 'var(--color-accent)' : 'var(--color-text-muted)',
        fontSize: 13,
        fontWeight: selected ? 600 : 500,
        fontFamily: 'Inter, sans-serif',
        border: 'none',
        whiteSpace: 'nowrap',
      }}
      aria-pressed={selected}
    >
      {label}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────
   Card — surface-1, radius 12, padding 24, no border
   ───────────────────────────────────────────────────────── */
export function Card({
  children,
  className = '',
  onClick,
  compact = false,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  compact?: boolean
}) {
  const isInteractive = Boolean(onClick)
  return (
    <div
      onClick={onClick}
      className={`transition-all duration-150 ${isInteractive ? 'cursor-pointer hover:border-white/[0.12]' : ''} ${className}`}
      style={{
        background: 'var(--color-surface-1)',
        borderRadius: 'var(--radius-md)',
        padding: compact ? 20 : 24,
        border: isInteractive ? '1px solid transparent' : 'none',
      }}
      onMouseEnter={isInteractive ? (e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface-2)'
      } : undefined}
      onMouseLeave={isInteractive ? (e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface-1)'
      } : undefined}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   SectionHeader — 18px Space Grotesk title + muted description
   ───────────────────────────────────────────────────────── */
export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4" style={{ marginBottom: 20 }}>
      <div>
        <h2 className="font-display font-semibold" style={{ fontSize: 18, color: 'var(--color-text)' }}>
          {title}
        </h2>
        {description && (
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Button — primary / secondary / ghost variants
   ───────────────────────────────────────────────────────── */
export function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--color-accent)',
      color: 'var(--color-on-accent)',
      border: 'none',
    },
    secondary: {
      background: 'var(--color-surface-2)',
      color: 'var(--color-text)',
      border: 'none',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-muted)',
      border: 'none',
    },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center cursor-pointer transition-opacity duration-150 ${className}`}
      style={{
        height: 44,
        paddingInline: 20,
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        opacity: disabled ? 0.45 : 1,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────
   Input — 44px, radius 10, surface-1, autofill-safe
   ───────────────────────────────────────────────────────── */
export function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  rightElement,
  error,
}: {
  label?: string
  id?: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon?: React.ReactNode
  rightElement?: React.ReactNode
  error?: string
}) {
  return (
    <div className="flex flex-col" style={{ gap: 6 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-4 flex items-center justify-center pointer-events-none" style={{ color: 'var(--color-text-faint)' }}>
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full transition-all duration-150"
          style={{
            height: 44,
            paddingInline: icon ? '40px 12px' : rightElement ? '12px 44px' : '12px',
            borderRadius: 10,
            background: 'var(--color-surface-1)',
            border: error
              ? '2px solid var(--color-danger)'
              : '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-accent)'
            e.currentTarget.style.borderWidth = '2px'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)'
            e.currentTarget.style.borderWidth = error ? '2px' : '1px'
          }}
        />
        {rightElement && (
          <span className="absolute right-3 flex items-center justify-center">
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: 'var(--color-danger)' }}>{error}</span>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   EmptyState — centered, min-height 320, icon + title + description
   ───────────────────────────────────────────────────────── */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ minHeight: 320, padding: 40, gap: 12 }}
    >
      {icon && (
        <div style={{ color: 'var(--color-text-faint)', marginBottom: 8, opacity: 0.6 }}>
          {icon}
        </div>
      )}
      <h3 className="font-display font-semibold" style={{ fontSize: 18, color: 'var(--color-text)' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 360, lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Avatar / Crest — circular image or tinted initials
   ───────────────────────────────────────────────────────── */
export function Avatar({
  src,
  name,
  size = 32,
  color,
}: {
  src?: string | null
  name?: string
  size?: number
  color?: string
}) {
  const initials = name
    ? name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : '?'

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ?? ''}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
    )
  }

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-display font-semibold"
      style={{
        width: size,
        height: size,
        background: color ? `${color}22` : 'var(--color-surface-2)',
        color: color ?? 'var(--color-text-muted)',
        fontSize: Math.max(10, Math.round(size * 0.38)),
        border: color ? `1px solid ${color}40` : undefined,
      }}
    >
      {initials}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Toggle — 40×24 pill; off = surface-2, on = accent-soft + accent knob
   ───────────────────────────────────────────────────────── */
export function Toggle({ value, onChange, disabled = false }: {
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => !disabled && onChange(!value)}
      className="relative flex-shrink-0 transition-colors duration-200"
      style={{
        width: 40,
        height: 24,
        borderRadius: 12,
        background: value ? 'var(--color-accent-soft)' : 'var(--color-surface-2)',
        border: value
          ? '1px solid rgba(0,255,135,0.3)'
          : '1px solid rgba(255,255,255,0.10)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div
        className="absolute top-[3px] rounded-full transition-transform duration-200"
        style={{
          width: 16,
          height: 16,
          background: value ? 'var(--color-accent)' : '#6B7280',
          transform: value ? 'translateX(19px)' : 'translateX(3px)',
        }}
      />
    </button>
  )
}
