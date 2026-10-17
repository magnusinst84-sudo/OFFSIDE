'use client'
import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { useSettings } from '@/hooks/useLocalStorage'
import { X, Check } from 'lucide-react'
import { SegmentedTabs } from '@/components/shared/Primitives'

const SWATCHES = [
  { color: '#00FF87', name: 'Emerald' },
  { color: '#3B82F6', name: 'Electric Blue' },
  { color: '#8B5CF6', name: 'Purple' },
  { color: '#F59E0B', name: 'Amber' },
  { color: '#E8003D', name: 'Rose' },
]

function SettingsToggle({
  value,
  onChange,
  disabled = false,
}: {
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
      onClick={() => onChange(!value)}
      className="relative cursor-pointer transition-colors duration-200 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      style={{
        width: 40,
        height: 24,
        borderRadius: 12,
        background: value ? 'var(--color-accent-soft, rgba(0,255,135,0.15))' : 'var(--color-surface-2, #1A1D27)',
        border: value ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.08)',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div
        className="absolute top-0.5 rounded-full transition-transform duration-200"
        style={{
          width: 18,
          height: 18,
          background: value ? 'var(--color-accent)' : '#94A3B8',
          transform: value ? 'translateX(18px)' : 'translateX(2px)',
        }}
      />
    </button>
  )
}

export function SettingsPanel() {
  const { settingsPanelOpen, closeSettings } = useApp()
  const { settings, setSettings } = useSettings()
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on Escape key & trap focus
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

  const resetDefaults = () => {
    setSettings({
      theme: 'dark',
      accentColor: '#00FF87',
      motionIntensity: 'standard',
      reducedMotion: false,
      defaultPersonality: 'tactical',
      commentarySpeed: 'normal',
      notifications: {
        matchStart: true,
        momentumSpike: true,
        goal: true,
        aiInsight: false,
      },
      accessibility: {
        highContrast: false,
        largeText: false,
        keyboardShortcuts: true,
      },
    })
  }

  return (
    <AnimatePresence>
      {settingsPanelOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={closeSettings}
          />

          {/* Panel: Bottom sheet on mobile (<768px), Centered modal on desktop */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative z-10 w-full md:w-[560px] max-h-[90dvh] md:max-h-[85dvh] bg-[#0F1117] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drag handle for mobile */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Sticky Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0F1117]/95 backdrop-blur-md">
              <h2 id="settings-title" className="text-[20px] font-semibold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Settings
              </h2>
              <button
                type="button"
                onClick={closeSettings}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto px-6 py-6 flex flex-col gap-8 text-[14px]">
              {/* 1. Appearance */}
              <section className="flex flex-col gap-4">
                <h3 className="text-[14px] font-semibold text-white">Appearance</h3>
                
                {/* Theme */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#94A3B8]">Theme</label>
                  <SegmentedTabs
                    tabs={[
                      { id: 'dark', label: 'Standard dark' },
                      { id: 'high-contrast', label: 'High contrast' },
                    ]}
                    activeTab={settings.theme}
                    onChange={id => update('theme', id as any)}
                  />
                </div>

                {/* Accent Color */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#94A3B8]">Accent color</label>
                  <div className="flex items-center gap-3">
                    {SWATCHES.map(sw => {
                      const isSelected = settings.accentColor === sw.color
                      return (
                        <button
                          key={sw.color}
                          type="button"
                          onClick={() => update('accentColor', sw.color)}
                          title={sw.name}
                          aria-label={`Select accent ${sw.name}`}
                          className="relative flex items-center justify-center rounded-full transition-transform hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          style={{
                            width: 32,
                            height: 32,
                            background: sw.color,
                            boxShadow: isSelected ? `0 0 0 2px #0F1117, 0 0 0 4px ${sw.color}` : 'none',
                          }}
                        >
                          {isSelected && (
                            <Check
                              size={16}
                              strokeWidth={3}
                              style={{ color: sw.color === '#00FF87' || sw.color === '#F59E0B' ? '#050508' : '#ffffff' }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </section>

              {/* 2. Motion */}
              <section className="flex flex-col gap-4">
                <h3 className="text-[14px] font-semibold text-white">Motion</h3>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#94A3B8]">Animation intensity</label>
                  <SegmentedTabs
                    tabs={[
                      { id: 'minimal', label: 'Minimal' },
                      { id: 'standard', label: 'Standard' },
                      { id: 'full', label: 'Full' },
                    ]}
                    activeTab={settings.motionIntensity}
                    onChange={id => update('motionIntensity', id as any)}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-[14px] text-white">Reduce motion</div>
                    <div className="text-[12px] text-[#94A3B8]">Disables 3D pitch tilt, particle drifts, and radar sweeps</div>
                  </div>
                  <SettingsToggle
                    value={settings.reducedMotion}
                    onChange={v => update('reducedMotion', v)}
                  />
                </div>
              </section>

              {/* 3. Commentary */}
              <section className="flex flex-col gap-4">
                <h3 className="text-[14px] font-semibold text-white">Commentary</h3>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#94A3B8]">Speed</label>
                  <SegmentedTabs
                    tabs={[
                      { id: 'slow', label: 'Slow' },
                      { id: 'normal', label: 'Normal' },
                      { id: 'fast', label: 'Fast' },
                    ]}
                    activeTab={settings.commentarySpeed}
                    onChange={id => update('commentarySpeed', id as any)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-[#94A3B8]">Default analyst persona</label>
                  <SegmentedTabs
                    tabs={[
                      { id: 'tactical', label: 'Tactical' },
                      { id: 'broadcast', label: 'Broadcast' },
                      { id: 'coach', label: 'Former Coach' },
                      { id: 'fan', label: 'Die-hard Fan' },
                    ]}
                    activeTab={settings.defaultPersonality}
                    onChange={id => update('defaultPersonality', id as any)}
                  />
                </div>
              </section>

              {/* 4. Notifications */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-white">Notifications</h3>
                  <span className="text-[11px] text-[#94A3B8] px-2 py-0.5 rounded bg-white/[0.04]">In-browser</span>
                </div>
                
                {[
                  { key: 'matchStart' as const, label: 'Match start', desc: 'Alert when followed match kicks off' },
                  { key: 'momentumSpike' as const, label: 'Momentum spike', desc: 'Notify on significant swing in dominance' },
                  { key: 'goal' as const, label: 'Goal alert', desc: 'Real-time score change notification' },
                  { key: 'aiInsight' as const, label: 'AI insight', desc: 'High-confidence tactical observations' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <div>
                      <div className="text-[14px] text-white">{label}</div>
                      <div className="text-[12px] text-[#94A3B8]">{desc}</div>
                    </div>
                    <SettingsToggle
                      value={settings.notifications[key]}
                      onChange={v => update('notifications', { ...settings.notifications, [key]: v })}
                    />
                  </div>
                ))}
              </section>

              {/* 5. Accessibility */}
              <section className="flex flex-col gap-4">
                <h3 className="text-[14px] font-semibold text-white">Accessibility</h3>
                
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-[14px] text-white">Large text</div>
                    <div className="text-[12px] text-[#94A3B8]">Scales base typography to 112.5%</div>
                  </div>
                  <SettingsToggle
                    value={settings.accessibility.largeText}
                    onChange={v => update('accessibility', { ...settings.accessibility, largeText: v })}
                  />
                </div>

                {/* Keyboard Shortcuts List (Desktop only) */}
                <div className="hidden md:flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
                  <span className="text-[12px] text-[#94A3B8]">Keyboard shortcuts</span>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    {[
                      { key: 'M', desc: 'Matches' },
                      { key: 'P', desc: 'Players' },
                      { key: 'I', desc: 'Insights' },
                      { key: 'A', desc: 'AI Tactical Center' },
                      { key: 'S', desc: 'Settings' },
                      { key: 'Esc', desc: 'Close dialogs' },
                    ].map(s => (
                      <div key={s.key} className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.03]">
                        <span className="text-[#94A3B8]">{s.desc}</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[11px] font-mono text-white/90 border border-white/10">
                          {s.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Reset Footer */}
              <div className="pt-4 border-t border-white/[0.08] flex justify-end pb-2">
                <button
                  type="button"
                  onClick={resetDefaults}
                  className="text-[13px] text-[#94A3B8] hover:text-white transition-colors cursor-pointer py-1 px-2"
                >
                  Reset to defaults
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
