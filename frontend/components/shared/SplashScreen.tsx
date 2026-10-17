'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Only show once per session
    try {
      const shown = window.sessionStorage.getItem('offside-splash-shown')
      if (!shown) {
        setVisible(true)
        window.sessionStorage.setItem('offside-splash-shown', 'true')

        const startTime = Date.now()
        const duration = 700 // 700ms smooth splash

        const timer = setInterval(() => {
          const elapsed = Date.now() - startTime
          const p = Math.min(100, Math.round((elapsed / duration) * 100))
          setProgress(p)
          if (elapsed >= duration) {
            clearInterval(timer)
            setTimeout(() => setVisible(false), 150)
          }
        }, 30)

        return () => clearInterval(timer)
      }
    } catch {
      // ignore in environments with restricted storage
    }
  }, [])

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-0 z-[99999] bg-[#050508] flex flex-col items-center justify-center p-6 select-none"
      >
        <div className="flex flex-col items-center gap-6 max-w-[280px] w-full">
          {/* Logo Mark + Wordmark */}
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" className="shrink-0">
              <path
                d="M4 14L14 4L24 14L14 24L4 14Z"
                stroke="var(--color-accent, #00FF87)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 14L14 9L19 14L14 19L9 14Z"
                fill="var(--color-accent-soft, rgba(0,255,135,0.12))"
                stroke="var(--color-accent, #00FF87)"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />
              <circle cx="14" cy="14" r="2.5" fill="var(--color-accent, #00FF87)" />
            </svg>
            <span
              className="font-bold text-[22px] tracking-[0.14em] text-white"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              OFFSIDE
            </span>
          </div>

          {/* Thin Progress Bar */}
          <div className="w-full h-[2px] bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent,#00FF87)] transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
