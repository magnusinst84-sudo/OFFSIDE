'use client'
import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Calendar, Radio, Users, Bot, TrendingUp, Settings
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { SPRING } from '@/lib/constants'

const NAV_ITEMS = [
  { id: 'command', label: 'Command', Icon: LayoutDashboard, href: '/' },
  { id: 'matches', label: 'Matches', Icon: Calendar, href: '/matches' },
  { id: 'live', label: 'Live', Icon: Radio, href: '/matches?tab=live' },
  { id: 'players', label: 'Players', Icon: Users, href: '/players' },
  { id: 'ai', label: 'AI Center', Icon: Bot, href: '/ai' },
  { id: 'insights', label: 'Insights', Icon: TrendingUp, href: '/insights' },
  { id: 'settings', label: 'Settings', Icon: Settings, href: '/settings' },
]

export function CommandConsole() {
  const router = useRouter()
  const pathname = usePathname()
  const { openSettings } = useApp()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const getActiveId = () => {
    if (pathname === '/') return 'command'
    if (pathname.startsWith('/match')) return 'matches'
    if (pathname.startsWith('/player')) return 'players'
    if (pathname.startsWith('/ai')) return 'ai'
    if (pathname.startsWith('/insights')) return 'insights'
    if (pathname.startsWith('/settings')) return 'settings'
    return 'command'
  }

  const activeId = getActiveId()

  const handleClick = (item: typeof NAV_ITEMS[0]) => {
    if (item.id === 'settings') {
      openSettings()
      return
    }
    router.push(item.href)
  }

  return (
    <nav
      aria-label="Primary Navigation"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-1 px-4"
      style={{
        height: 56,
        background: 'rgba(15,17,23,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,255,135,0.08)',
        borderRadius: 999,
        boxShadow: '0 8px 32px rgba(0,255,135,0.08)',
      }}
    >
      {NAV_ITEMS.map(item => {
        const isActive = activeId === item.id
        const isHovered = hoveredId === item.id

        return (
          <div
            key={item.id}
            className="relative flex flex-col items-center justify-center cursor-pointer"
            style={{ width: 44, height: 44 }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleClick(item)}
          >
            {/* Active pill */}
            {isActive && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(0,255,135,0.12)' }}
                transition={{ type: 'spring', ...SPRING }}
              />
            )}

            {/* Icon */}
            <motion.div
              animate={{ y: isHovered ? -2 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative z-10 flex flex-col items-center"
            >
              <item.Icon
                size={18}
                style={{
                  color: isActive ? '#00FF87' : isHovered ? '#F0F4F8' : '#6B7280',
                  strokeWidth: 1.5,
                  transition: 'color 0.15s',
                }}
              />
            </motion.div>

            {/* Hover tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.92 }}
                  transition={{ duration: 0.12 }}
                  className="absolute font-mono text-[11px] font-semibold tracking-wider pointer-events-none px-2.5 py-1 rounded-[4px] bg-[#0F1117] border border-white/[0.1] shadow-lg z-50 flex items-center gap-1.5"
                  style={{
                    color: isActive ? '#00FF87' : '#F0F4F8',
                    top: -36,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? '#00FF87' : '#6B7280' }} />
                  {item.label}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </nav>
  )
}
