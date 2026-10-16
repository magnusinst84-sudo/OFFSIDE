'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { useSettings } from '@/hooks/useLocalStorage'
import { X } from 'lucide-react'

const ACCENT_COLORS = ['#00FF87', '#3B82F6', '#7C3AED', '#F59E0B', '#E8003D']
const PERSONALITIES = ['broadcast', 'tactical', 'coach', 'fan'] as const

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative transition-colors duration-200 cursor-pointer focus:outline-none"
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: value ? '#00FF87' : '#1A1D27',
        border: value ? '1px solid #00FF87' : '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
      }}
    >
      <div
        className="absolute top-0.5 rounded-full transition-transform duration-200"
        style={{
          width: 16,
          height: 16,
          background: value ? '#050508' : '#6B7280',
          transform: value ? 'translateX(20px)' : 'translateX(3px)',
        }}
      />
    </button>
  )
}

export function SettingsPanel() {
  const { settingsPanelOpen, closeSettings } = useApp()
  const { settings, setSettings } = useSettings()

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && settingsPanelOpen) {
        closeSettings()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [settingsPanelOpen, closeSettings])

  const update = <K extends keyof typeof settings>(key: K, val: typeof settings[K]) =>
    setSettings(prev => ({ ...prev, [key]: val }))

  return (
    <AnimatePresence>
      {settingsPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999]"
            style={{ background: 'rgba(5,5,8,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={closeSettings}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="fixed z-[10000] flex flex-col"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(640px, 94vw)',
              maxHeight: '88vh',
              background: '#0F1117',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 1px rgba(0,255,135,0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-[#0F1117]/90 backdrop-blur-md flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse" />
                <span className="font-mono text-[12px] font-semibold tracking-widest text-[#F0F4F8]">SYSTEM SETTINGS</span>
              </div>
              <button
                type="button"
                onClick={closeSettings}
                className="w-7 h-7 rounded-[4px] flex items-center justify-center text-[#6B7280] hover:text-[#F0F4F8] hover:bg-white/[0.06] transition-all cursor-pointer"
                title="Close (Esc)"
              >
                <X size={16} />
              </button>
            </div>

            <div
              className="overflow-y-auto p-6 flex flex-col gap-7"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#1A1D27 transparent' }}
            >
              {/* Appearance */}
              <section>
                <p className="font-mono text-[10px] tracking-widest mb-3 text-[#6B7280]">APPEARANCE</p>
                {/* Theme */}
                <div className="flex gap-3 mb-4">
                  {['dark', 'high-contrast'].map(theme => (
                    <button
                      key={theme}
                      onClick={() => update('theme', theme)}
                      className="flex-1 py-3 rounded-[4px] font-mono text-[11px] tracking-wider transition-all"
                      style={{
                        background: settings.theme === theme ? 'rgba(0,255,135,0.06)' : '#1A1D27',
                        border: settings.theme === theme ? '1px solid #00FF87' : '1px solid rgba(255,255,255,0.06)',
                        color: settings.theme === theme ? '#00FF87' : '#94A3B8',
                      }}
                    >
                      {theme === 'dark' ? 'WAR ROOM DARK' : 'HIGH CONTRAST DARK'}
                    </button>
                  ))}
                </div>

                {/* Accent swatches */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px]" style={{ color: '#6B7280' }}>ACCENT COLOR</span>
                  <div className="flex gap-2">
                    {ACCENT_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => update('accentColor', color)}
                        className="rounded-full transition-all duration-150"
                        style={{
                          width: 24,
                          height: 24,
                          background: color,
                          outline: settings.accentColor === color ? `2px solid white` : 'none',
                          outlineOffset: 2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Motion */}
              <section>
                <p className="font-mono text-[11px] tracking-widest mb-4" style={{ color: '#6B7280' }}>MOTION</p>
                <div className="flex gap-2 mb-4">
                  {(['minimal', 'standard', 'full'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => update('motionIntensity', level)}
                      className="flex-1 py-2 rounded-[4px] font-mono text-[10px] tracking-wider transition-all"
                      style={{
                        background: settings.motionIntensity === level ? 'rgba(0,255,135,0.1)' : '#1A1D27',
                        color: settings.motionIntensity === level ? '#00FF87' : '#6B7280',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-mono text-[11px]" style={{ color: '#94A3B8' }}>Reduced Motion</span>
                  <Toggle value={settings.reducedMotion} onChange={v => update('reducedMotion', v)} />
                </div>
                <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="font-mono text-[11px]" style={{ color: '#94A3B8' }}>Commentary Speed</span>
                  <div className="flex gap-1">
                    {(['slow', 'normal', 'fast'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => update('commentarySpeed', s)}
                        className="px-2.5 py-1 rounded-[2px] font-mono text-[9px] transition-all"
                        style={{
                          background: settings.commentarySpeed === s ? 'rgba(0,255,135,0.1)' : 'transparent',
                          color: settings.commentarySpeed === s ? '#00FF87' : '#6B7280',
                        }}
                      >
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Commentary Personality */}
              <section>
                <p className="font-mono text-[11px] tracking-widest mb-4" style={{ color: '#6B7280' }}>DEFAULT ANALYST</p>
                <div className="flex gap-2">
                  {PERSONALITIES.map(p => (
                    <button
                      key={p}
                      onClick={() => update('defaultPersonality', p)}
                      className="flex-1 py-2 rounded-[4px] font-mono text-[9px] tracking-wider transition-all"
                      style={{
                        background: settings.defaultPersonality === p ? 'rgba(0,255,135,0.1)' : '#1A1D27',
                        color: settings.defaultPersonality === p ? '#00FF87' : '#6B7280',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </section>

              {/* Notifications */}
              <section>
                <p className="font-mono text-[11px] tracking-widest mb-4" style={{ color: '#6B7280' }}>NOTIFICATIONS</p>
                {[
                  { key: 'matchStart' as const, label: 'Match Start' },
                  { key: 'momentumSpike' as const, label: 'Momentum Spike' },
                  { key: 'goal' as const, label: 'Goal Alert' },
                  { key: 'aiInsight' as const, label: 'AI Insight' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="font-mono text-[11px]" style={{ color: '#94A3B8' }}>{label}</span>
                    <Toggle
                      value={settings.notifications[key]}
                      onChange={v => update('notifications', { ...settings.notifications, [key]: v })}
                    />
                  </div>
                ))}
              </section>

              {/* Accessibility */}
              <section>
                <p className="font-mono text-[11px] tracking-widest mb-4" style={{ color: '#6B7280' }}>ACCESSIBILITY</p>
                {[
                  { key: 'highContrast' as const, label: 'High Contrast' },
                  { key: 'largeText' as const, label: 'Large Text' },
                  { key: 'keyboardShortcuts' as const, label: 'Keyboard Shortcuts' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="font-mono text-[11px]" style={{ color: '#94A3B8' }}>{label}</span>
                    <Toggle
                      value={settings.accessibility[key]}
                      onChange={v => update('accessibility', { ...settings.accessibility, [key]: v })}
                    />
                  </div>
                ))}

                {/* Keyboard shortcuts reference */}
                {settings.accessibility.keyboardShortcuts && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 p-3 rounded-[4px] overflow-hidden"
                    style={{ background: '#1A1D27' }}
                  >
                    {[['G', 'Go to Matches'], ['A', 'AI Center'], ['I', 'Insights'], ['S', 'Settings']].map(([key, action]) => (
                      <div key={key} className="flex items-center justify-between py-1">
                        <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded-[2px]" style={{ background: '#0F1117', color: '#00FF87', border: '1px solid rgba(0,255,135,0.2)' }}>
                          {key}
                        </kbd>
                        <span className="font-mono text-[10px]" style={{ color: '#6B7280' }}>{action}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </section>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
