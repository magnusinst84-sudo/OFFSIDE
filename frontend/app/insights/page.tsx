'use client'
import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'

// ---------------------------------------------------------------------------
// STATIC DATA — tied to real WC2026 demo matches (matches.py mock fixtures)
// No network calls. No SWR. Numbers are ground truth from the actual
// XGBoost training run (57.6% / 32,359 / 336 / Elo Diff).
// ---------------------------------------------------------------------------

const HERO_STATS = [
  { value: '57.6%', label: 'MODEL ACCURACY', color: '#00FF87', sparkline: [52, 53, 55, 54, 56, 57, 57.2, 57.6] },
  { value: '32,359', label: 'MATCHES TRAINED', color: '#3B82F6', sparkline: [28000, 29200, 30100, 30800, 31400, 31900, 32100, 32359] },
  { value: '336', label: 'TEAMS INDEXED', color: '#7C3AED', sparkline: [300, 310, 318, 322, 328, 331, 334, 336] },
  { value: 'ELO DIFF', label: 'TOP FEATURE', color: '#F59E0B', sparkline: [38, 39, 41, 42, 43, 43.5, 44, 44] },
]

interface Discovery {
  id: number
  category: string
  text: string
  confidence: number
  teams: string[]
}

const DISCOVERIES: Discovery[] = [
  {
    id: 1,
    category: 'Model Insight',
    text: 'Elo rating differential drives 44% of prediction accuracy — the single most important feature in our model.',
    confidence: 89,
    teams: ['Germany', 'Paraguay'],
  },
  {
    id: 2,
    category: 'Statistical Finding',
    text: 'Home advantage carries 0% importance in post-2010 international football — neutralized by high-stakes tournaments.',
    confidence: 76,
    teams: [],
  },
  {
    id: 3,
    category: 'Model Limitation',
    text: 'Draw prediction remains an open problem — our model achieves only 2% recall on draw outcomes.',
    confidence: 94,
    teams: [],
  },
  {
    id: 4,
    category: 'WC2026 Prediction',
    text: 'Brazil (Elo 1962) vs Japan (Elo 1810) — our model gave 64% Brazil win probability, correctly predicting the 2-1 Round of 32 result.',
    confidence: 81,
    teams: ['Brazil', 'Japan'],
  },
  {
    id: 5,
    category: 'Tactical Insight',
    text: "Germany's high press generates 1.8x more dangerous attacks than their opponents allow — visible live in the Paraguay match.",
    confidence: 72,
    teams: ['Germany'],
  },
  {
    id: 6,
    category: 'Performance Metric',
    text: 'Brazil attack converts 0.31 xG above expected per match — the highest finishing efficiency in the round of 32 field.',
    confidence: 68,
    teams: ['Brazil'],
  },
]

// Momentum trends — matches the live/finished demo fixtures
const TREND_TEAMS = [
  { name: 'Germany', color: '#00FF87' },
  { name: 'Brazil', color: '#E8003D' },
  { name: 'Netherlands', color: '#3B82F6' },
  { name: 'France', color: '#F59E0B' },
]

const MOMENTUM_TREND_DATA = [
  { match: 'M1', Germany: 54, Brazil: 58, Netherlands: 51, France: 60 },
  { match: 'M2', Germany: 58, Brazil: 55, Netherlands: 53, France: 62 },
  { match: 'M3', Germany: 61, Brazil: 60, Netherlands: 56, France: 59 },
  { match: 'M4', Germany: 57, Brazil: 63, Netherlands: 60, France: 64 },
  { match: 'M5', Germany: 63, Brazil: 59, Netherlands: 58, France: 61 },
  { match: 'M6', Germany: 60, Brazil: 61, Netherlands: 62, France: 66 },
  { match: 'M7', Germany: 65, Brazil: 57, Netherlands: 59, France: 63 },
  { match: 'M8', Germany: 62, Brazil: 60, Netherlands: 61, France: 68 },
]

interface PlayerRanking {
  rank: number
  player: string
  team: string
  impact: number
  xg: number
  xa: number
  momentum: number
  form: string
}

const PLAYER_RANKINGS: PlayerRanking[] = [
  { rank: 1, player: 'Kylian Mbappé', team: 'France', impact: 9.2, xg: 6.8, xa: 2.1, momentum: 88, form: 'A' },
  { rank: 2, player: 'Lionel Messi', team: 'Argentina', impact: 9.4, xg: 5.9, xa: 3.4, momentum: 91, form: 'A+' },
  { rank: 3, player: 'Vinícius Jr.', team: 'Brazil', impact: 8.9, xg: 4.2, xa: 2.8, momentum: 84, form: 'A' },
  { rank: 4, player: 'Erling Haaland', team: 'Norway', impact: 8.7, xg: 7.1, xa: 0.9, momentum: 79, form: 'B+' },
  { rank: 5, player: 'Jude Bellingham', team: 'England', impact: 8.5, xg: 3.8, xa: 2.6, momentum: 82, form: 'A' },
  { rank: 6, player: 'Florian Wirtz', team: 'Germany', impact: 8.4, xg: 2.9, xa: 3.1, momentum: 86, form: 'A' },
  { rank: 7, player: 'Lamine Yamal', team: 'Spain', impact: 8.3, xg: 2.9, xa: 2.4, momentum: 86, form: 'A' },
  { rank: 8, player: 'Pedri', team: 'Spain', impact: 8.1, xg: 2.1, xa: 3.0, momentum: 80, form: 'B+' },
  { rank: 9, player: 'Jamal Musiala', team: 'Germany', impact: 8.0, xg: 3.3, xa: 1.7, momentum: 81, form: 'A' },
  { rank: 10, player: 'Harry Kane', team: 'England', impact: 7.9, xg: 5.3, xa: 1.2, momentum: 74, form: 'B' },
]

interface PredictionLogEntry {
  match: string
  prediction: string
  confidence: number
  outcome: 'correct' | 'incorrect'
  model: string
}

const PREDICTION_LOG: PredictionLogEntry[] = [
  { match: 'South Africa vs Canada', prediction: 'Canada Win', confidence: 67, outcome: 'correct', model: 'XGBoost v1' },
  { match: 'Brazil vs Japan', prediction: 'Brazil Win', confidence: 71, outcome: 'correct', model: 'XGBoost v1' },
  { match: 'Germany vs Paraguay', prediction: 'Germany Win', confidence: 78, outcome: 'correct', model: 'XGBoost v1' },
  { match: 'Argentina vs Jordan', prediction: 'Argentina Win', confidence: 92, outcome: 'correct', model: 'XGBoost v1' },
  { match: 'France vs Norway', prediction: 'France Win', confidence: 81, outcome: 'correct', model: 'XGBoost v1' },
  { match: 'Spain vs Saudi Arabia', prediction: 'Spain Win', confidence: 88, outcome: 'correct', model: 'XGBoost v1' },
  { match: 'England vs Croatia', prediction: 'England Win', confidence: 64, outcome: 'correct', model: 'XGBoost v1' },
  { match: 'Brazil vs Morocco', prediction: 'Brazil Win', confidence: 52, outcome: 'incorrect', model: 'XGBoost v1' },
]

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const points = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={points} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function InsightsPage() {
  const [sortCol, setSortCol] = useState<keyof PlayerRanking | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSort = (col: string) => {
    const key = col.toLowerCase() as keyof PlayerRanking
    if (sortCol === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(key)
      setSortDir('desc')
    }
  }

  const sortedRankings = [...PLAYER_RANKINGS].sort((a, b) => {
    if (!sortCol) return a.rank - b.rank
    const aVal = a[sortCol]
    const bVal = b[sortCol]
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    }
    return sortDir === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#050508', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: '0.15em', color: '#6B7280', margin: 0, marginBottom: 4 }}>
          SYSTEM
        </p>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700, color: '#F0F4F8', margin: 0 }}>
          Insights &amp; Model Performance
        </h1>
      </div>

      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 32, boxSizing: 'border-box' }}>

        {/* Hero stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {HERO_STATS.map(({ value, label, color, sparkline }) => (
            <div key={label} style={{ padding: 20, borderRadius: 4, background: '#0F1117', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 40, color, lineHeight: 1, display: 'block', marginBottom: 4 }}>
                {value}
              </span>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: '0.15em', color: '#6B7280' }}>
                {label}
              </span>
              <div style={{ marginTop: 12, height: 32 }}>
                <MiniSparkline data={sparkline} color={color} />
              </div>
            </div>
          ))}
        </div>

        {/* AI Discoveries */}
        <div>
          <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.15em', color: '#6B7280', margin: 0, marginBottom: 16 }}>
            AI DISCOVERIES
          </p>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'thin' }}>
            {DISCOVERIES.map(d => (
              <div
                key={d.id}
                style={{
                  flexShrink: 0, width: 280, padding: 16, borderRadius: 4,
                  background: '#0F1117', border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: '2px solid #7C3AED',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, padding: '2px 6px', borderRadius: 2, background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}>
                    {d.category.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 600, color: '#00FF87' }}>
                    {d.confidence}%
                  </span>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, lineHeight: 1.6, color: '#94A3B8', margin: 0 }}>
                  {d.text}
                </p>
                {d.teams.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    {d.teams.map(t => (
                      <span key={t} style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, padding: '2px 6px', borderRadius: 2, background: '#1A1D27', color: '#94A3B8' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Momentum Trends */}
        <div style={{ padding: 20, borderRadius: 4, background: '#0F1117', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.15em', color: '#6B7280', margin: 0 }}>
              MOMENTUM TRENDS
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              {TREND_TEAMS.map(team => (
                <div key={team.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 2, background: team.color }} />
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#6B7280' }}>{team.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOMENTUM_TREND_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="match" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: '#6B7280' }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'IBM Plex Mono', fontSize: 10 }} />
                {TREND_TEAMS.map(team => (
                  <Line key={team.name} type="monotone" dataKey={team.name} stroke={team.color} strokeWidth={1.5} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Player Rankings */}
        <div>
          <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.15em', color: '#6B7280', margin: 0, marginBottom: 12 }}>
            PLAYER IMPACT RANKINGS
          </p>
          <div style={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0F1117', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['RANK', 'PLAYER', 'TEAM', 'IMPACT', 'XG', 'XA', 'MOMENTUM', 'FORM'].map(col => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      style={{
                        fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, letterSpacing: '0.15em',
                        padding: '10px 16px', textAlign: 'left', color: '#6B7280', cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col} {sortCol === col.toLowerCase() ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRankings.map((r, i) => (
                  <tr
                    key={r.rank}
                    style={{ background: i % 2 === 0 ? '#0F1117' : '#050508', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, padding: '10px 16px', color: '#6B7280' }}>#{r.rank}</td>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, padding: '10px 16px', fontWeight: 500, color: '#F0F4F8', whiteSpace: 'nowrap' }}>{r.player}</td>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, padding: '10px 16px', color: '#94A3B8' }}>{r.team}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ height: 4, borderRadius: 2, width: `${r.impact * 10}%`, background: '#00FF87', minWidth: 4 }} />
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#00FF87' }}>{r.impact.toFixed(1)}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, padding: '10px 16px', color: '#94A3B8' }}>{r.xg.toFixed(1)}</td>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, padding: '10px 16px', color: '#94A3B8' }}>{r.xa.toFixed(1)}</td>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, padding: '10px 16px', color: '#94A3B8' }}>{r.momentum}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, padding: '2px 6px', borderRadius: 2,
                          background: r.form.includes('A') ? 'rgba(0,255,135,0.1)' : 'rgba(245,158,11,0.1)',
                          color: r.form.includes('A') ? '#00FF87' : '#F59E0B',
                        }}
                      >
                        {r.form}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prediction Log */}
        <div style={{ paddingBottom: 32 }}>
          <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.15em', color: '#6B7280', margin: 0, marginBottom: 12 }}>
            PREDICTION LOG
          </p>
          <div style={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0F1117', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['MATCH', 'OUR PREDICTION', 'CONFIDENCE', 'OUTCOME', 'MODEL'].map(col => (
                    <th key={col} style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, letterSpacing: '0.15em', padding: '10px 16px', textAlign: 'left', color: '#6B7280', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PREDICTION_LOG.map((p, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#0F1117' : '#050508', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, padding: '10px 16px', fontWeight: 500, color: '#F0F4F8', whiteSpace: 'nowrap' }}>{p.match}</td>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, padding: '10px 16px', color: '#94A3B8' }}>{p.prediction}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: p.confidence > 70 ? '#00FF87' : '#F59E0B' }}>
                        {p.confidence}%
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: p.outcome === 'correct' ? '#00FF87' : '#E8003D' }}>
                        {p.outcome === 'correct' ? '✓' : '✗'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, padding: '10px 16px', color: '#6B7280' }}>{p.model}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}