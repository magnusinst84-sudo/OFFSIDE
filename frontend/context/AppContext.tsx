'use client'
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import type { Match, PersonalityType, ConversationMessage } from '@/lib/types'

interface AppState {
  currentMatch: Match | null
  personality: PersonalityType
  conversation: ConversationMessage[]
  settingsPanelOpen: boolean
  toasts: Array<{ id: string; message: string; type: 'error' | 'info' | 'success' }>
}

type AppAction =
  | { type: 'SET_MATCH'; match: Match }
  | { type: 'CLEAR_MATCH' }
  | { type: 'SET_PERSONALITY'; personality: PersonalityType }
  | { type: 'ADD_MESSAGE'; message: ConversationMessage }
  | { type: 'CLEAR_CONVERSATION' }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'ADD_TOAST'; toast: { id: string; message: string; type: 'error' | 'info' | 'success' } }
  | { type: 'REMOVE_TOAST'; id: string }

const initialState: AppState = {
  currentMatch: null,
  personality: 'tactical',
  conversation: [],
  settingsPanelOpen: false,
  toasts: [],
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MATCH':
      return { ...state, currentMatch: action.match }
    case 'CLEAR_MATCH':
      return { ...state, currentMatch: null }
    case 'SET_PERSONALITY':
      return { ...state, personality: action.personality }
    case 'ADD_MESSAGE':
      return { ...state, conversation: [...state.conversation, action.message] }
    case 'CLEAR_CONVERSATION':
      return { ...state, conversation: [] }
    case 'OPEN_SETTINGS':
      return { ...state, settingsPanelOpen: true }
    case 'CLOSE_SETTINGS':
      return { ...state, settingsPanelOpen: false }
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts.slice(-2), action.toast] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) }
    default:
      return state
  }
}

interface AppContextValue extends AppState {
  setCurrentMatch: (match: Match) => void
  clearCurrentMatch: () => void
  setPersonality: (p: PersonalityType) => void
  addMessage: (msg: ConversationMessage) => void
  clearConversation: () => void
  openSettings: () => void
  closeSettings: () => void
  showToast: (message: string, type?: 'error' | 'info' | 'success') => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setCurrentMatch = (match: Match) => dispatch({ type: 'SET_MATCH', match })
  const clearCurrentMatch = () => dispatch({ type: 'CLEAR_MATCH' })
  const setPersonality = (personality: PersonalityType) => dispatch({ type: 'SET_PERSONALITY', personality })
  const addMessage = (message: ConversationMessage) => dispatch({ type: 'ADD_MESSAGE', message })
  const clearConversation = () => dispatch({ type: 'CLEAR_CONVERSATION' })
  const openSettings = () => dispatch({ type: 'OPEN_SETTINGS' })
  const closeSettings = () => dispatch({ type: 'CLOSE_SETTINGS' })

  const showToast = (message: string, type: 'error' | 'info' | 'success' = 'info') => {
    const id = Math.random().toString(36).slice(2)
    dispatch({ type: 'ADD_TOAST', toast: { id, message, type } })
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 4000)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 's' || e.key === 'S') {
        dispatch({ type: 'OPEN_SETTINGS' })
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  return (
    <AppContext.Provider
      value={{
        ...state,
        setCurrentMatch,
        clearCurrentMatch,
        setPersonality,
        addMessage,
        clearConversation,
        openSettings,
        closeSettings,
        showToast,
      }}
    >
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[10001] flex flex-col gap-2 pointer-events-none">
        {state.toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto px-4 py-3 rounded-[4px] text-sm font-mono text-[11px] uppercase tracking-wider flex items-center gap-2"
            style={{
              background: toast.type === 'error' ? 'rgba(232,0,61,0.15)' : toast.type === 'success' ? 'rgba(0,255,135,0.15)' : 'rgba(59,130,246,0.15)',
              border: `1px solid ${toast.type === 'error' ? '#E8003D' : toast.type === 'success' ? '#00FF87' : '#3B82F6'}40`,
              color: toast.type === 'error' ? '#E8003D' : toast.type === 'success' ? '#00FF87' : '#3B82F6',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export default AppContext
