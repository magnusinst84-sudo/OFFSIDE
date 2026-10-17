'use client'
import React, { useState } from 'react'
import { Card, FallbackBadge } from '@/components/shared/Primitives'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Trophy, Check, X, Sparkles } from 'lucide-react'

// 1. Stat Strip ground truth data
const STAT_STRIP = [
  { value: '57.6%', label: 'Accuracy', desc: 'Hold-out test set accuracy', isAccent: true },
  { value: '32,359', label: 'Matches trained', desc: 'International & top European matches', isAccent: false },
  { value: '336', label: 'Teams indexed', desc: 'Active clubs and national teams', isAccent: false },
  { value: '44%', label: 'Elo differential importance', desc: 'Single largest predictive feature', isAccent: false },
]

// 2. AI Discoveries (3-column grid of 6 cards, no confidence numbers)
const DISCOVERIES = [
  {
    id: 1,
    tag: 'Feature Importance',
    text: 'Elo rating differential accounts for 44% of total predictive weight in the XGBoost tree splits, outperforming raw goal averages.',
    teams: ['Germany', 'France'],
  },
  {
    id: 2,
    tag: 'Model Limitation',
    text: 'Draw outcomes remain challenging in knockout formats — model achieves approximately 2% recall on standard regulation draws.',
    teams: [],
  },
  {
    id: 3,
    tag: 'Home Advantage',
    text: 'Neutral-venue tournament fixtures demonstrate near-zero statistical home advantage compared to domestic European leagues.',
    teams: ['Spain', 'Italy'],
  },
  {
    id: 4,
    tag: 'Momentum Efficiency',
    text: 'Teams sustaining over 65% momentum for 12+ continuous minutes convert dangerous attacks at a 2.4x higher rate.',
    teams: ['England', 'Netherlands'],
  },
  {
    id: 5,
    tag: 'Finishing Overperformance',
    text: 'Clinical conversion rates correlate closely with Tier 1 DNA scores, outperforming baseline xG models in the final third.',
    teams: ['Brazil'],
  },
  {
    id: 6,
    tag: 'Tactical Pressing',
    text: 'Counter-pressing systems force 31% more opponent turnovers in defensive transition than traditional zonal mid-blocks.',
    teams: ['Bayer Leverkusen', 'Arsenal'],
  },
]

// 3. Per-Outcome Recall Data
const RECALL_DATA = [
  { outcome: 'Home Win', recall: 68 },
  { outcome: 'Draw', recall: 2 },
  { outcome: 'Away Win', recall: 54 },
]

// 4. Feature Importance Data
const FEATURE_IMPORTANCE = [
  { feature: 'Elo Differential', weight: 44 },
  { feature: 'Recent xG Trend', weight: 22 },
  { feature: 'Head-to-Head History', weight: 16 },
  { feature: 'Rest & Fatigue Days', weight: 10 },
  { feature: 'Venue Context', weight: 8 },
]

// 5. Impact Player Table (Sorted descending: Messi 9.4 #1, Mbappé 9.2 #2)
const IMPACT_PLAYERS = [
  { rank: 1, name: 'Lionel Messi', team: 'Argentina', impact: 9.4, xg: 0.82, xa: 0.65, form: 'A+' },
  { rank: 2, name: 'Kylian Mbappé', team: 'France', impact: 9.2, xg: 0.94, xa: 0.38, form: 'A+' },
  { rank: 3, name: 'Erling Haaland', team: 'Norway / Man City', impact: 8.9, xg: 1.05, xa: 0.18, form: 'A' },
  { rank: 4, name: 'Vinicius Junior', team: 'Brazil / Real Madrid', impact: 8.8, xg: 0.76, xa: 0.44, form: 'A' },
  { rank: 5, name: 'Bukayo Saka', team: 'England / Arsenal', impact: 8.7, xg: 0.62, xa: 0.52, form: 'A' },
  { rank: 6, name: 'Florian Wirtz', team: 'Germany / Leverkusen', impact: 8.6, xg: 0.58, xa: 0.61, form: 'A' },
  { rank: 7, name: 'Rodri', team: 'Spain / Man City', impact: 8.5, xg: 0.35, xa: 0.48, form: 'A' },
]

// 6. Backtest: 2022 FIFA World Cup (Single model: XGBoost Classifier)
const BACKTEST_LOG = [
  { match: 'Argentina vs France', predicted: 'Home Win', actual: 'Draw (Arg PKs)', correct: false, prob: '42%' },
  { match: 'France vs Morocco', predicted: 'Home Win', actual: 'Home Win (2-0)', correct: true, prob: '68%' },
  { match: 'Argentina vs Croatia', predicted: 'Home Win', actual: 'Home Win (3-0)', correct: true, prob: '61%' },
  { match: 'England vs France', predicted: 'Away Win', actual: 'Away Win (1-2)', correct: true, prob: '53%' },
  { match: 'Morocco vs Portugal', predicted: 'Away Win', actual: 'Home Win (1-0)', correct: false, prob: '62%' },
  { match: 'Netherlands vs Argentina', predicted: 'Draw', actual: 'Draw (Arg PKs)', correct: true, prob: '31%' },
  { match: 'Croatia vs Brazil', predicted: 'Away Win', actual: 'Draw (Cro PKs)', correct: false, prob: '66%' },
  { match: 'Brazil vs Korea Republic', predicted: 'Home Win', actual: 'Home Win (4-1)', correct: true, prob: '78%' },
]

export default function InsightsPage() {
  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 pt-6 pb-32 flex flex-col gap-10">
      {/* Page Header */}
      <div>
        <h1
          className="text-[32px] font-bold text-white tracking-tight mb-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Model performance
        </h1>
        <p className="text-[14px] sm:text-[15px] text-[#94A3B8]">
          How the XGBoost classifier performs, validation statistics, and feature importance drivers.
        </p>
      </div>

      {/* 1. Stat Strip (One container, hairline dividers, numbers white except 57.6% accent) */}
      <div className="w-full rounded-2xl bg-[#0F1117] border border-white/[0.08] p-6 shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          {STAT_STRIP.map((st, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-2 text-center">
              <span
                className="text-[32px] font-bold tracking-tight mb-1"
                style={{
                  color: st.isAccent ? 'var(--color-accent, #00FF87)' : '#ffffff',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                {st.value}
              </span>
              <span className="text-[12px] font-medium text-[#F0F4F8] mb-0.5">{st.label}</span>
              <span className="text-[11px] text-[#94A3B8]">{st.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Real Model Metrics: Per-Outcome Recall & Feature Importance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart A: Per-Outcome Recall */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[16px] font-semibold text-white tracking-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Per-Outcome Recall
            </h2>
            <span className="text-[12px] text-[#94A3B8]">Hold-out test set</span>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RECALL_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 12 }} unit="%" />
                <YAxis dataKey="outcome" type="category" tick={{ fill: '#F0F4F8', fontSize: 12 }} width={80} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Recall']}
                  contentStyle={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                />
                <Bar dataKey="recall" radius={[0, 4, 4, 0]}>
                  {RECALL_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.outcome === 'Home Win'
                          ? 'var(--color-home, #3B82F6)'
                          : entry.outcome === 'Draw'
                          ? '#64748B'
                          : 'var(--color-away, #E8003D)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[12px] text-[#94A3B8] mt-2">
            Draw recall (2%) reflects the mathematical infrequency of exact tie outcomes in tournament football.
          </p>
        </Card>

        {/* Chart B: Feature Importance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[16px] font-semibold text-white tracking-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Feature Importance
            </h2>
            <span className="text-[12px] text-[#94A3B8]">XGBoost Split Weight</span>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <XAxis type="number" domain={[0, 50]} tick={{ fill: '#94A3B8', fontSize: 12 }} unit="%" />
                <YAxis dataKey="feature" type="category" tick={{ fill: '#F0F4F8', fontSize: 12 }} width={120} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Weight']}
                  contentStyle={{ background: '#0F1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                />
                <Bar dataKey="weight" fill="var(--color-accent, #00FF87)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[12px] text-[#94A3B8] mt-2">
            Elo differential dominates predictive power at 44%, followed by recent xG velocity.
          </p>
        </Card>
      </div>

      {/* 3. AI Discoveries (3-Column Grid of 6 Cards, No scroller, No confidence %) */}
      <div className="flex flex-col gap-4">
        <h2
          className="text-[18px] font-semibold text-white tracking-tight"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Algorithmic Findings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DISCOVERIES.map(d => (
            <Card key={d.id} className="p-5 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[11px] font-mono font-medium">
                    {d.tag}
                  </span>
                </div>
                <p className="text-[14px] leading-[1.6] text-white/90">{d.text}</p>
              </div>

              {d.teams.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.06]">
                  {d.teams.map(t => (
                    <span key={t} className="text-[11px] text-[#94A3B8] px-2 py-0.5 rounded bg-white/[0.04]">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Player Impact Table (Sorted by metric, Messi 9.4 is #1, max-width 960px) */}
      <div className="flex flex-col gap-4 max-w-[960px]">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-[18px] font-semibold text-white tracking-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Player Match Impact Index
            </h2>
            <span className="text-[12px] text-[#94A3B8]">Ranked by model impact score</span>
          </div>
          <FallbackBadge text="Sample data" />
        </div>

        <div className="w-full rounded-xl bg-[#0F1117] border border-white/[0.08] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[12px] text-[#94A3B8] bg-[#1A1D27]/40">
                <th className="py-3 px-4 w-12 text-center font-mono">#</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4 hidden sm:table-cell">Team</th>
                <th className="py-3 px-4 text-right">Impact</th>
                <th className="py-3 px-4 text-right hidden md:table-cell">xG/90</th>
                <th className="py-3 px-4 text-right hidden md:table-cell">xA/90</th>
                <th className="py-3 px-4 text-center w-20">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {IMPACT_PLAYERS.map(p => (
                <tr key={p.rank} className="h-[52px] hover:bg-white/[0.02] transition-colors text-[14px]">
                  <td className="py-2 px-4 text-center font-mono text-[#64748B]">{p.rank}</td>
                  <td className="py-2 px-4 font-medium text-white">{p.name}</td>
                  <td className="py-2 px-4 text-[#94A3B8] hidden sm:table-cell">{p.team}</td>
                  <td className="py-2 px-4 text-right font-mono font-bold text-[var(--color-accent,#00FF87)]">
                    {p.impact.toFixed(1)}
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-[#94A3B8] hidden md:table-cell">
                    {p.xg.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-[#94A3B8] hidden md:table-cell">
                    {p.xa.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--color-accent-soft,rgba(0,255,135,0.12))] text-[var(--color-accent,#00FF87)] font-mono text-[11px] font-bold">
                      {p.form}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Backtest Log (Single model name: XGBoost Classifier) */}
      <div className="flex flex-col gap-4 max-w-[960px]">
        <div>
          <h2
            className="text-[18px] font-semibold text-white tracking-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Backtest: 2022 FIFA World Cup (Sample of 8 matches)
          </h2>
          <span className="text-[12px] text-[#94A3B8]">Model: XGBoost Classifier v1.4</span>
        </div>

        <div className="w-full rounded-xl bg-[#0F1117] border border-white/[0.08] overflow-hidden">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.08] text-[12px] text-[#94A3B8] bg-[#1A1D27]/40">
                <th className="py-3 px-4">Fixture</th>
                <th className="py-3 px-4">Predicted Outcome</th>
                <th className="py-3 px-4">Actual Result</th>
                <th className="py-3 px-4 text-right w-24">Confidence</th>
                <th className="py-3 px-4 text-center w-24">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {BACKTEST_LOG.map((b, idx) => (
                <tr key={idx} className="h-[48px] hover:bg-white/[0.02] transition-colors">
                  <td className="py-2 px-4 font-medium text-white">{b.match}</td>
                  <td className="py-2 px-4 text-[#94A3B8]">{b.predicted}</td>
                  <td className="py-2 px-4 text-white font-mono">{b.actual}</td>
                  <td className="py-2 px-4 text-right font-mono text-[#94A3B8]">{b.prob}</td>
                  <td className="py-2 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                        b.correct
                          ? 'bg-[var(--color-accent-soft,rgba(0,255,135,0.12))] text-[var(--color-accent,#00FF87)]'
                          : 'bg-[rgba(232,0,61,0.12)] text-[#FCA5A5]'
                      }`}
                    >
                      {b.correct ? <Check size={12} /> : <X size={12} />}
                      {b.correct ? 'Correct' : 'Miss'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}