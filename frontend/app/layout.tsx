import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { CommandConsole } from '@/components/navigation/CommandConsole'
import { SettingsPanel } from '@/components/settings/SettingsPanel'

export const metadata: Metadata = {
  title: 'OFFSIDE — AI Football War Room',
  description: 'Elite football intelligence platform for World Cup 2026. AI-powered match analysis, win probability, tactical insights, and player DNA scoring.',
  keywords: 'football AI, World Cup 2026, match analysis, tactical intelligence, win probability',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#050508" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ background: '#050508', color: '#F0F4F8', fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>
        <AppProvider>
          <div style={{ minHeight: '100vh', paddingBottom: 96 }}>
            {children}
          </div>
          <CommandConsole />
          <SettingsPanel />
        </AppProvider>
      </body>
    </html>
  )
}
