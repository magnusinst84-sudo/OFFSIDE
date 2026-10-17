'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { Settings, LogOut, User, LogIn } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

/* OFFSIDE logo — wireframe ball + wordmark */
function OffsideLogo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      {/* Ball SVG */}
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="1.8" />
        <polygon
          points="16,4 20,10 16,16 12,10"
          stroke="white" strokeWidth="1.2" fill="none"
        />
        <polygon
          points="16,16 22,14 26,20 22,26 10,26 6,20 10,14"
          stroke="white" strokeWidth="1.2" fill="none"
        />
      </svg>
      {/* Wordmark */}
      <span
        className="font-display font-bold tracking-tight"
        style={{ fontSize: 18, color: 'var(--color-text)', letterSpacing: '-0.01em' }}
      >
        OFFSIDE
      </span>
    </div>
  )
}

/* Avatar menu dropdown */
function AvatarMenu({ user, onSettings, onSignOut, onClose }: {
  user: { email?: string | null; displayName?: string | null; photoURL?: string | null }
  onSettings: () => void
  onSignOut: () => void
  onClose: () => void
}) {
  const initials = user.displayName
    ? user.displayName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : (user.email?.[0] ?? '?').toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-[10001]"
      style={{
        minWidth: 200,
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border-strong)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* User info */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" width={32} height={32} className="rounded-full" />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-display font-semibold text-sm"
            style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
          >
            {initials}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          {user.displayName && (
            <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
              {user.displayName}
            </span>
          )}
          {user.email && (
            <span className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
              {user.email}
            </span>
          )}
        </div>
      </div>
      {/* Actions */}
      <div className="py-1">
        <button
          onClick={() => { onSettings(); onClose() }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Settings size={15} />
          Settings
        </button>
        <button
          onClick={() => { onSignOut(); onClose() }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer"
          style={{ color: '#F43F5E' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </motion.div>
  )
}

export function AppHeader() {
  const { openSettings } = useApp()
  const { user, loading, openAuthModal, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  return (
    <header
      className="sticky top-0 z-[200] w-full flex items-center justify-between px-4 md:px-6"
      style={{
        height: 56,
        background: scrolled ? 'rgba(5,5,8,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Logo */}
      <button
        onClick={() => router.push('/')}
        className="cursor-pointer"
        aria-label="Go to home"
      >
        <OffsideLogo />
      </button>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="w-8 h-8 rounded-full" style={{ background: 'var(--color-surface-2)' }} />
        ) : user ? (
          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
              className="flex items-center gap-2 cursor-pointer rounded-full p-0.5 transition-opacity hover:opacity-80"
              aria-label="Account menu"
              aria-expanded={menuOpen}
            >
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" width={32} height={32} className="rounded-full" />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-display font-semibold text-sm"
                  style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
                >
                  {(user.displayName?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
                </div>
              )}
            </button>
            <AnimatePresence>
              {menuOpen && (
                <AvatarMenu
                  user={user}
                  onSettings={openSettings}
                  onSignOut={logout}
                  onClose={() => setMenuOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-80"
            style={{
              height: 36,
              paddingInline: 16,
              borderRadius: 8,
              border: '1px solid var(--color-border-strong)',
              color: 'var(--color-text-muted)',
              fontSize: 14,
              fontWeight: 500,
              background: 'transparent',
            }}
          >
            <LogIn size={14} />
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}
