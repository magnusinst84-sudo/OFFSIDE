import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { AuthProvider } from '@/context/AuthContext'
import { AppHeader } from '@/components/shared/AppHeader'
import { CommandConsole } from '@/components/navigation/CommandConsole'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { AuthModal } from '@/components/auth/AuthModal'

export const metadata: Metadata = {
  title: 'OFFSIDE',
  description: 'Real-time European and global football intelligence platform. AI-augmented match analytics, live win probability, tactical insights, and player DNA profiling.',
  keywords: 'football intelligence, UCL, Premier League, La Liga, live match analysis, win probability, tactical analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#050508" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        suppressHydrationWarning
        style={{
          background: '#050508',
          color: '#F0F4F8',
          fontFamily: 'Inter, sans-serif',
          minHeight: '100dvh',
          width: '100%',
        }}
      >
        <AuthProvider>
          <AppProvider>
            <div className="w-full flex flex-col" style={{ minHeight: '100dvh' }}>
              {/* Global app header — 56px */}
              <AppHeader />
              {/* Page content — reserves space for dock (pb-28 desktop, pb-20 mobile via page-level) */}
              <div className="flex-1 w-full">
                {children}
              </div>
            </div>
            {/* Floating navigation dock / mobile tab bar */}
            <CommandConsole />
            {/* Overlays */}
            <SettingsPanel />
            <AuthModal />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
