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

export function useSettings() {
  const [settings, setSettings, isHydrated] = useLocalStorage<AppSettings>(
    'offside-settings',
    DEFAULT_SETTINGS
  )

  useEffect(() => {
    if (isHydrated && typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--accent', settings.accentColor)
    }
  }, [settings.accentColor, isHydrated])

  return { settings, setSettings, isHydrated }
}
