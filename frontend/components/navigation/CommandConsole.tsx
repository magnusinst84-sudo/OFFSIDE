'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Calendar, Users, Bot, TrendingUp } from 'lucide-react'
import { SPRING } from '@/lib/constants'

/* 5 items only — Settings and Account live in AppHeader (UI.md §5.8) */
const NAV_ITEMS = [
  { id: 'home',     label: 'Home',     Icon: Home,        href: '/',        key: 'H' },
  { id: 'matches',  label: 'Matches',  Icon: Calendar,    href: '/matches', key: 'M' },
  { id: 'players',  label: 'Players',  Icon: Users,       href: '/players', key: 'P' },
  { id: 'ai',       label: 'AI',       Icon: Bot,         href: '/ai',      key: 'A' },
  { id: 'insights', label: 'Insights', Icon: TrendingUp,  href: '/insights',key: 'I' },
] as const

type NavId = typeof NAV_ITEMS[number]['id']

function getActiveId(pathname: string): NavId {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/match')) return 'matches'
  if (pathname.startsWith('/player')) return 'players'
  if (pathname.startsWith('/ai')) return 'ai'
  if (pathname.startsWith('/insights')) return 'insights'
  return 'home'
}

export function CommandConsole() {
  const router = useRouter()
  const pathname = usePathname()
  const [hoveredId, setHoveredId] = useState<NavId | null>(null)
  const activeId = getActiveId(pathname)

  /* Keyboard shortcuts (desktop only) */
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const item = NAV_ITEMS.find(n => n.key.toLowerCase() === e.key.toLowerCase())
      if (item) router.push(item.href)
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [router])

  /* ── Desktop floating pill dock ── */
  const DesktopDock = (
    <nav
      aria-label="Primary Navigation"
      className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] items-center gap-0.5 px-2"
      style={{
        height: 52,
        background: 'rgba(15,17,23,0.90)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {NAV_ITEMS.map(item => {
        const isActive = activeId === item.id
        const isHovered = hoveredId === item.id

        return (
          <div
            key={item.id}
            className="relative flex items-center justify-center cursor-pointer"
            style={{ borderRadius: 999 }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => router.push(item.href)}
          >
            {/* Active / hover background */}
            {(isActive || isHovered) && (
              <motion.div
                layoutId={isActive ? 'activePill' : undefined}
                className="absolute inset-0 rounded-full"
                style={{ background: isActive ? 'rgba(0,255,135,0.12)' : 'rgba(255,255,255,0.04)' }}
                transition={{ type: 'spring', ...SPRING }}
              />
            )}

            <motion.div
              animate={{ x: 0 }}
              className="relative z-10 flex items-center gap-1.5 overflow-hidden"
              style={{
                paddingInline: isActive ? 14 : 12,
                paddingBlock: 10,
                borderRadius: 999,
              }}
            >
              <item.Icon
                size={18}
                aria-label={item.label}
                style={{
                  color: isActive ? '#00FF87' : isHovered ? '#F0F4F8' : '#6B7280',
                  strokeWidth: 1.8,
                  flexShrink: 0,
                  transition: 'color 0.15s',
                }}
              />
              {/* Label only on active item */}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    key="label"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#00FF87',
                      fontFamily: 'Inter, sans-serif',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Hover tooltip (only when not active, only on hover) */}
            <AnimatePresence>
              {isHovered && !isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute pointer-events-none px-2.5 py-1 rounded-lg text-xs font-medium z-50"
                  style={{
                    top: -36,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    background: 'var(--color-surface-1)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    fontSize: 12,
                  }}
                >
                  {item.label}
                  <span style={{ color: 'var(--color-text-faint)', marginLeft: 4 }}>
                    [{item.key}]
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </nav>
  )

  /* ── Mobile bottom tab bar (below 768px) ── */
  const MobileTabBar = (
    <nav
      aria-label="Primary Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] flex items-stretch"
      style={{
        height: `calc(64px + env(safe-area-inset-bottom, 0px))`,
        background: 'rgba(15,17,23,0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {NAV_ITEMS.map(item => {
        const isActive = activeId === item.id
        return (
          <button
            key={item.id}
            onClick={() => router.push(item.href)}
            className="flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition-opacity"
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{ minHeight: 44 }}
          >
            <item.Icon
              size={22}
              style={{
                color: isActive ? 'var(--color-accent)' : '#6B7280',
                strokeWidth: 1.8,
                transition: 'color 0.15s',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-accent)' : '#6B7280',
                fontFamily: 'Inter, sans-serif',
                transition: 'color 0.15s',
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )

  return (
    <>
      {DesktopDock}
      {MobileTabBar}
    </>
  )
}
