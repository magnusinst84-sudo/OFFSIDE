'use client'
import React from 'react'
import { useApp } from '@/context/AppContext'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { getQuotaHealth } from '@/lib/api'

export default function SettingsPage() {
  const { openSettings } = useApp()

  const [quota, setQuota] = React.useState<{ calls_today: number; cap: number; breaker?: { is_active: boolean; cooldown_until?: string | null; reason?: string | null } } | null>(null)

  // Auto-open settings on mount and load quota
  React.useEffect(() => {
    openSettings()
    getQuotaHealth()
      .then((d) => {
        if (d) setQuota(d)
      })
      .catch(() => {})
  }, [openSettings])

  return (
    <div style={{ minHeight: '100vh', background: '#050508' }}>
      <div className="px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="font-mono text-[10px] tracking-widest mb-1" style={{ color: '#6B7280' }}>CONFIGURATION</p>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700, color: '#F0F4F8' }}>
          System Settings
        </h1>
        <p className="text-[13px] mt-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
          Manage analytics preferences, audio, theme, and API safety thresholds.
        </p>
      </div>

      <div className="px-8 py-8 max-w-2xl">
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-white/[0.08] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                API-Football Quota & Safety
              </h2>
            </div>
            {quota && (
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold"
                style={{
                  background: quota.breaker?.is_active ? 'rgba(232, 0, 61, 0.15)' : 'rgba(0, 255, 135, 0.15)',
                  color: quota.breaker?.is_active ? '#FF4D6D' : '#00FF87',
                  border: `1px solid ${quota.breaker?.is_active ? 'rgba(232, 0, 61, 0.3)' : 'rgba(0, 255, 135, 0.3)'}`,
                }}
              >
                {quota.breaker?.is_active ? 'Breaker Tripped' : 'Normal'}
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#94A3B8] uppercase font-mono">Calls Today (UTC)</div>
                <div className="text-[20px] font-mono font-bold text-white mt-0.5">
                  {quota ? `${quota.calls_today} / ${quota.cap}` : 'Loading...'}
                </div>
              </div>
              {quota && (
                <div className="text-right">
                  <div className="text-[11px] text-[#94A3B8] uppercase font-mono">Daily Cap</div>
                  <div className="text-[14px] font-mono text-white/80 mt-0.5">
                    {quota.cap} calls/day
                  </div>
                </div>
              )}
            </div>

            {quota && (
              <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (quota.calls_today / quota.cap) * 100)}%`,
                    background: quota.calls_today >= quota.cap ? '#E8003D' : '#00FF87',
                  }}
                />
              </div>
            )}

            {quota?.breaker?.is_active && (
              <div className="text-[12px] text-[#FF4D6D] bg-[#E8003D]/10 p-3 rounded-lg border border-[#E8003D]/25 font-mono">
                Reason: {quota.breaker.reason || 'Active'}. Upstream paused for safety; serving cached/mock data.
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-[#94A3B8] pt-2">
            <span>FastAPI Route: <code className="font-mono text-[#00FF87]">/api/health/quota</code></span>
            <button
              onClick={() => openSettings()}
              className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white transition-colors cursor-pointer"
            >
              Configure in Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
