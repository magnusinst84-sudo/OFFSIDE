'use client'
import React from 'react'

interface PageShellProps {
  children: React.ReactNode
  className?: string
  fullHeight?: boolean
}

export function PageShell({ children, className = '', fullHeight = false }: PageShellProps) {
  return (
    <main
      className={`mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8 ${
        fullHeight ? 'pt-4 pb-4 h-[calc(100vh-80px)] flex flex-col' : 'pt-6 pb-32 min-h-screen'
      } ${className}`}
    >
      {children}
    </main>
  )
}

interface PageHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
  badge?: React.ReactNode
}

export function PageHeader({ eyebrow, title, subtitle, action, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-6 border-b border-white/[0.08]">
      <div>
        {eyebrow && (
          <p className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#00FF87] mb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87]" />
            {eyebrow}
          </p>
        )}
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[#F0F4F8]">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-[13px] text-[#94A3B8] mt-1.5 max-w-2xl font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3 flex-shrink-0">{action}</div>}
    </div>
  )
}
