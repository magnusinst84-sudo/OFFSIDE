'use client'
import React from 'react'
import { useApp } from '@/context/AppContext'
import { SettingsPanel } from '@/components/settings/SettingsPanel'

export default function SettingsPage() {
  const { openSettings } = useApp()

  // Auto-open settings on mount
  React.useEffect(() => {
    openSettings()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#050508' }}>
      <div className="px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="font-mono text-[10px] tracking-widest mb-1" style={{ color: '#6B7280' }}>CONFIGURATION</p>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700, color: '#F0F4F8' }}>
          System Settings
        </h1>
        <p className="text-[13px] mt-2" style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
          Opening settings panel...
        </p>
      </div>
    </div>
  )
}
