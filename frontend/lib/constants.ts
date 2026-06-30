export const COLORS = {
  bgBlack: '#050508',
  bgPrimary: '#0F1117',
  bgSecondary: '#1A1D27',
  momentumGreen: '#00FF87',
  pressureRed: '#E8003D',
  electricBlue: '#3B82F6',
  royalPurple: '#7C3AED',
  amber: '#F59E0B',
  coolGray: '#6B7280',
  chalkWhite: '#F0F4F8',
  mutedGray: '#94A3B8',
} as const

export const PERSONALITIES = [
  {
    id: 'broadcast' as const,
    label: 'Broadcast Commentator',
    shortLabel: 'BROADCAST',
    color: '#3B82F6',
    description: 'Dramatic, eloquent, historical context',
  },
  {
    id: 'tactical' as const,
    label: 'Tactical Analyst',
    shortLabel: 'TACTICAL',
    color: '#00FF87',
    description: 'Data-driven, formation analysis',
  },
  {
    id: 'coach' as const,
    label: 'Former Coach',
    shortLabel: 'COACH',
    color: '#F59E0B',
    description: 'Authoritative, player-specific',
  },
  {
    id: 'fan' as const,
    label: 'Unhinged Fan',
    shortLabel: 'FAN',
    color: '#E8003D',
    description: 'Passionate, hyperbolic, raw',
  },
] as const

export const NAV_ITEMS = [
  { id: 'command', label: 'Command', icon: 'LayoutDashboard', href: '/' },
  { id: 'matches', label: 'Matches', icon: 'Calendar', href: '/matches' },
  { id: 'live', label: 'Live', icon: 'Radio', href: '/matches?tab=live' },
  { id: 'players', label: 'Players', icon: 'Users', href: '/players' },
  { id: 'ai', label: 'AI Center', icon: 'Bot', href: '/ai' },
  { id: 'insights', label: 'Insights', icon: 'TrendingUp', href: '/insights' },
  { id: 'settings', label: 'Settings', icon: 'Settings', href: '/settings' },
] as const

export const MOMENTUM_RING_COLORS = {
  home: '#00FF87',
  contested: '#F59E0B',
  away: '#E8003D',
} as const

export function getMomentumColor(score: number): string {
  if (score > 55) return MOMENTUM_RING_COLORS.home
  if (score >= 45) return MOMENTUM_RING_COLORS.contested
  return MOMENTUM_RING_COLORS.away
}

export const SPRING = { stiffness: 400, damping: 30 }

export const WC2026_TEAMS = [
  'Argentina', 'Brazil', 'France', 'Spain', 'England', 'Germany',
  'Portugal', 'Netherlands', 'Belgium', 'Italy', 'Uruguay', 'Colombia',
  'Mexico', 'USA', 'Canada', 'Morocco', 'Senegal', 'Japan', 'South Korea',
  'Australia', 'Croatia', 'Denmark', 'Switzerland', 'Poland', 'Serbia',
  'Ecuador', 'Cameroon', 'Ghana', 'Tunisia', 'Saudi Arabia', 'Iran', 'Qatar',
]
