'use client'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { validateEmail } from '@/lib/emailValidator'

interface AuthContextType {
  user: User | null
  loading: boolean
  authModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  loginWithGoogle: () => Promise<void>
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>
  registerWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>
  resendVerificationEmail: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const openAuthModal = () => setAuthModalOpen(true)
  const closeAuthModal = () => setAuthModalOpen(false)

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      setAuthModalOpen(false)
    } catch (err: any) {
      console.error('[Auth] Google sign-in error:', err)
      throw err
    }
  }

  const registerWithEmail = async (email: string, pass: string) => {
    // 1. Anti-spam / disposable domain check
    const validation = validateEmail(email)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    if (pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' }
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass)
      // Send verification email to verify legitimacy
      if (cred.user) {
        await sendEmailVerification(cred.user)
      }
      return { success: true }
    } catch (err: any) {
      const code = err?.code || ''
      if (code === 'auth/email-already-in-use') {
        return { success: false, error: 'This email address is already registered.' }
      }
      return { success: false, error: err?.message || 'Failed to create account.' }
    }
  }

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass)
      setAuthModalOpen(false)
      return { success: true }
    } catch (err: any) {
      const code = err?.code || ''
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        return { success: false, error: 'Invalid email or password.' }
      }
      return { success: false, error: err?.message || 'Login failed.' }
    }
  }

  const resendVerificationEmail = async () => {
    if (user && !user.emailVerified) {
      await sendEmailVerification(user)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resendVerificationEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
