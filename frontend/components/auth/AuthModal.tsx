'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { X, Mail, Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react'

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
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
          setError(res.error || 'Login failed.')
        }
      } else {
        const res = await registerWithEmail(email, password)
        if (!res.success) {
          setError(res.error || 'Registration failed.')
        } else {
          setSuccessMsg(
            'Account created! A verification link has been sent to your email. Please verify before accessing tactical features.'
          )
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
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-xl bg-[#0F1117] border border-white/10 shadow-2xl p-6 sm:p-8 overflow-hidden z-10"
        >
          {/* Neon decorative edge */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00FF87] to-transparent" />

          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1 rounded cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center mb-3">
              <ShieldCheck className="text-[#00FF87]" size={22} />
            </div>
            <p className="font-mono text-[10px] tracking-widest text-[#00FF87] uppercase mb-1">
              OFFSIDE SECURITY LAYER
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {mode === 'login' ? 'Tactical Access Portal' : 'Register Operator'}
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Anti-spam protected. Authenticate via Google or verified personal email.
            </p>
          </div>

          {/* Notifications */}
          {error && (
            <div className="mb-4 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded bg-[#00FF87]/10 border border-[#00FF87]/20 text-[#00FF87] text-xs flex items-start gap-2">
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google One-Click Auth */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs font-semibold tracking-wider transition-all cursor-pointer mb-5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>CONTINUE WITH GOOGLE</span>
          </button>

          <div className="relative flex items-center justify-center mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 bg-[#0F1117] font-mono text-[10px] text-gray-500 uppercase tracking-widest">
              OR EMAIL
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block font-mono text-[10px] text-gray-400 tracking-wider mb-1 uppercase">
                Email Address
              </label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded bg-black/40 border border-white/10 focus-within:border-[#00FF87]/50 transition-colors">
                <Mail size={15} className="text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="operator@organization.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-transparent border-none outline-none font-mono text-xs text-white placeholder-gray-600 flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-gray-400 tracking-wider mb-1 uppercase">
                Password
              </label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded bg-black/40 border border-white/10 focus-within:border-[#00FF87]/50 transition-colors">
                <Lock size={15} className="text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-transparent border-none outline-none font-mono text-xs text-white placeholder-gray-600 flex-1"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-3 rounded-lg bg-[#00FF87] hover:bg-[#00FF87]/90 text-black font-mono text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center"
            >
              {loading ? (
                <span className="animate-pulse">VERIFYING...</span>
              ) : mode === 'login' ? (
                'AUTHENTICATE'
              ) : (
                'CREATE ACCOUNT'
              )}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError(null)
                setSuccessMsg(null)
              }}
              className="font-mono text-[11px] text-gray-400 hover:text-[#00FF87] transition-colors cursor-pointer"
            >
              {mode === 'login'
                ? "Don't have an operator clearance? Register here"
                : 'Already have credentials? Sign in'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
