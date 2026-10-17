'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '@/components/shared/Primitives'

export function AuthModal() {
  const {
    authModalOpen,
    closeAuthModal,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
  } = useAuth()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && authModalOpen) {
        closeAuthModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [authModalOpen, closeAuthModal])

  if (!authModalOpen) return null

  const handleGoogle = async () => {
    setError(null)
    setLoading(true)
    try {
      await loginWithGoogle()
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const res = await loginWithEmail(email, password)
        if (!res.success) {
          setError(res.error || 'Invalid email or password.')
        }
      } else {
        const res = await registerWithEmail(email, password)
        if (!res.success) {
          setError(res.error || 'Registration failed.')
        } else {
          setSuccessMsg('Account created successfully! You are now signed in.')
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window: Bottom sheet on mobile, centered modal on desktop */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full md:max-w-[420px] rounded-t-2xl md:rounded-2xl bg-[#0F1117] border-t md:border border-white/10 shadow-2xl p-6 md:p-8 z-10 flex flex-col"
        >
          {/* Mobile drag handle */}
          <div className="md:hidden flex justify-center -mt-2 pb-3">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-[#94A3B8] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06] cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2
              id="auth-modal-title"
              className="text-[22px] font-semibold text-white tracking-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {mode === 'login' ? 'Sign in to OFFSIDE' : 'Create your account'}
            </h2>
            <p className="text-[14px] text-[#94A3B8] mt-1">
              Save your settings, pinned clubs, and personalized intelligence.
            </p>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-[44px] rounded-[10px] bg-[#1A1D27] hover:bg-[#222634] text-white border border-white/10 text-[14px] font-medium flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <span className="relative bg-[#0F1117] px-3 text-[12px] text-[#94A3B8]">or</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="analyst@football.club"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[32px] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-[rgba(232,0,61,0.12)] border border-[var(--color-danger,#E8003D)] text-[13px] text-[#FCA5A5]">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-[rgba(0,255,135,0.12)] border border-[var(--color-accent,#00FF87)] text-[13px] text-white">
                {successMsg}
              </div>
            )}

            <Button type="submit" variant="primary" loading={loading} className="w-full mt-1">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={closeAuthModal}
              className="w-full"
            >
              Continue as guest
            </Button>
          </form>

          {/* Footer Toggle */}
          <div className="mt-5 text-center text-[13px] text-[#94A3B8]">
            {mode === 'login' ? (
              <>
                New here?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setError(null)
                    setSuccessMsg(null)
                  }}
                  className="text-white hover:text-[var(--color-accent)] font-medium underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError(null)
                    setSuccessMsg(null)
                  }}
                  className="text-white hover:text-[var(--color-accent)] font-medium underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
