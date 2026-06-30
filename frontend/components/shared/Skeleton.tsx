import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-[4px] ${className}`}
      style={{
        background: '#1A1D27',
        width,
        height,
      }}
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={14} width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`p-4 rounded-[4px] ${className}`}
      style={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <Skeleton width={80} height={12} />
        <Skeleton width={60} height={12} />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton width={120} height={20} />
        <Skeleton width={80} height={40} />
        <Skeleton width={120} height={20} />
      </div>
      <div className="mt-3 flex gap-2">
        <Skeleton width={60} height={10} />
        <Skeleton width={60} height={10} />
      </div>
    </div>
  )
}

export function SkeletonStatRow() {
  return (
    <div className="flex items-center justify-between py-2">
      <Skeleton width={32} height={14} />
      <Skeleton width={80} height={10} />
      <Skeleton width={32} height={14} />
    </div>
  )
}

export function SkeletonCircle({ size = 80 }: { size?: number }) {
  return (
    <div
      className="animate-pulse rounded-full"
      style={{ width: size, height: size, background: '#1A1D27' }}
    />
  )
}
