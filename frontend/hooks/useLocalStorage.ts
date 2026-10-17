'use client'
import { useState, useEffect } from 'react'
import type { AppSettings } from '@/lib/types'

const DEFAULT_SETTINGS: AppSettings = {
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
    keyboardShortcuts: false,
  },
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
    setIsHydrated(true)
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, isHydrated] as const
}

const ACCENT_MAP: Record<string, { soft: string; onAccent: string; name: string }> = {
  '#00FF87': { soft: 'rgba(0, 255, 135, 0.12)', onAccent: '#050508', name: 'Emerald' },
  '#3B82F6': { soft: 'rgba(59, 130, 246, 0.14)', onAccent: '#ffffff', name: 'Electric Blue' },
  '#8B5CF6': { soft: 'rgba(139, 92, 246, 0.14)', onAccent: '#ffffff', name: 'Purple' },
  '#7C3AED': { soft: 'rgba(124, 58, 237, 0.14)', onAccent: '#ffffff', name: 'Violet' },
  '#F59E0B': { soft: 'rgba(245, 158, 11, 0.14)', onAccent: '#050508', name: 'Amber' },
  '#E8003D': { soft: 'rgba(232, 0, 61, 0.14)', onAccent: '#ffffff', name: 'Rose' },
}

export function useSettings() {
  const [settings, setSettings, isHydrated] = useLocalStorage<AppSettings>(
    'offside-settings',
    DEFAULT_SETTINGS
  )

  useEffect(() => {
    if (isHydrated && typeof document !== 'undefined') {
      const root = document.documentElement
      const accent = settings.accentColor || '#00FF87'
      const cfg = ACCENT_MAP[accent] || { soft: 'rgba(0, 255, 135, 0.12)', onAccent: '#050508', name: 'Custom' }
      
      root.style.setProperty('--color-accent', accent)
      root.style.setProperty('--accent', accent)
      root.style.setProperty('--color-accent-soft', cfg.soft)
      root.style.setProperty('--color-on-accent', cfg.onAccent)

      if (settings.theme === 'high-contrast') {
        root.setAttribute('data-theme', 'high-contrast')
      } else {
        root.removeAttribute('data-theme')
      }

      if (settings.accessibility?.largeText) {
        root.style.fontSize = '112.5%'
      } else {
        root.style.fontSize = ''
      }

      if (settings.reducedMotion || settings.motionIntensity === 'minimal') {
        root.setAttribute('data-reduced-motion', 'true')
      } else {
        root.removeAttribute('data-reduced-motion')
      }
    }
  }, [settings, isHydrated])

  return { settings, setSettings, isHydrated }
}
