#!/usr/bin/env node
// Competition coverage: which UEFA competitions (and which leagues/countries inside them) are sparsely mapped.
// Reads files only: no API calls, no key needed.
// Run from repo root:  node scripts/competition-coverage.mjs [--min 90]
// Options: --dir <generated dir>  --clubs <clubs-2026.json>  --min <percent below which a competition is SPARSE>
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pickCandidate } from './build-squads.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d }
const DIR = arg('dir', 'frontend/lib/data/league')
const CLUBS_FILE = arg('clubs', path.join(HERE, 'clubs-2026.json'))
const MIN = Number(arg('min', 90))
const COMPS = ['UCL', 'UEL', 'UECL']
const FIELD = 36 // every UEFA league phase has 36 clubs

const cfg = JSON.parse(readFileSync(CLUBS_FILE, 'utf8'))

// generated data
const idx = readFileSync(`${DIR}/index.ts`, 'utf8')
const clubs = JSON.parse(idx.match(/export const CLUBS: ClubMeta\[\] = (\[[\s\S]*?\n\])\n/)[1])
const players = {} // club_id -> player count
for (const f of readdirSync(DIR).filter((x) => x.startsWith('players-'))) {
  const txt = readFileSync(`${DIR}/${f}`, 'utf8')
  for (const p of JSON.parse(txt.slice(txt.indexOf('= [') + 2))) players[p.club_id] = (players[p.club_id] ?? 0) + 1
}
const isLoaded = (c) => (players[c.id] ?? 0) > 0

// 1) per competition
const status = (pct) => (pct >= 100 ? 'COMPLETE' : pct >= MIN ? 'ok' : 'SPARSE')
const compRows = COMPS.map((code) => {
  const tagged = clubs.filter((c) => c.competitions.includes(code))
  const loaded = tagged.filter(isLoaded)
  const configured = (cfg.competitions?.[code] ?? []).length + (cfg.europe ?? []).filter((e) => (e.competitions ?? []).includes(code)).length
  const pct = Math.round((loaded.length / FIELD) * 100)
  return {
    competition: code,
    field: FIELD,
    configured,
    resolved: tagged.length,
    loaded: loaded.length,
    missing: FIELD - loaded.length,
    players: loaded.reduce((s, c) => s + players[c.id], 0),
    coverage: `${pct}%`,
    status: configured !== FIELD ? `CHECK CONFIG (${configured} != ${FIELD})` : status(pct),
  }
})
console.log(`COMPETITION COVERAGE (field = ${FIELD} clubs per competition; SPARSE below ${MIN}%)`)
console.table(compRows)

// 2) league x competition matrix (loaded clubs)
const groups = ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Other']
const matrix = groups.map((g) => {
  const inG = clubs.filter((c) => c.league === g && isLoaded(c))
  const row = { league: g === 'Other' ? 'Other (non-big-5)' : g, clubs_loaded: inG.length }
  for (const code of COMPS) row[code] = inG.filter((c) => c.competitions.includes(code)).length
  row['no Europe'] = inG.filter((c) => c.competitions.length === 0).length
  return row
})
console.log('\nLEAGUE x COMPETITION (loaded clubs; a club appears in at most one competition)')
console.table(matrix)

// 3) countries outside the big five: expected vs loaded, worst first
const other = clubs.filter((c) => c.league === 'Other')
const byCountry = {}
const unmatched = []
for (const e of cfg.europe ?? []) {
  const ov = cfg.overrides?.[e.name]
  const match = ov ? other.find((c) => c.id === (typeof ov === 'object' ? ov.id : ov)) : pickCandidate(e.name, other)
  const loaded = !!match && isLoaded(match)
  const r = (byCountry[e.country] ??= { country: e.country, expected: 0, loaded: 0, missing_clubs: [] })
  r.expected++
  if (loaded) r.loaded++
  else { r.missing_clubs.push(e.name); unmatched.push(e) }
}
const countryRows = Object.values(byCountry)
  .map((r) => ({ country: r.country, expected: r.expected, loaded: r.loaded, pending: r.expected - r.loaded, missing: r.missing_clubs.join(', ') }))
  .sort((a, b) => b.pending - a.pending || a.country.localeCompare(b.country))
console.log('\nNON-BIG-5 CLUBS BY COUNTRY (worst first)')
console.table(countryRows.filter((r) => r.pending > 0))
console.log(`  fully loaded countries: ${countryRows.filter((r) => r.pending === 0).length}/${countryRows.length}`)

// 4) mapping problems
const orphans = other.filter((c) => c.competitions.length === 0)
console.log('\nMAPPING CHECKS')
console.log(`  resolved non-big-5 clubs with NO competition tag (invisible to every pill): ${orphans.length ? orphans.map((c) => c.name).join(', ') : 'none'}`)
const noEurope = clubs.filter((c) => c.league !== 'Other' && c.competitions.length === 0 && isLoaded(c))
console.log(`  big-5 clubs with no European competition this season: ${noEurope.length}`)
const emptySquad = clubs.filter((c) => !isLoaded(c))
console.log(`  clubs resolved but with 0 players: ${emptySquad.length ? emptySquad.map((c) => c.name).join(', ') : 'none'}`)

const sparse = compRows.filter((r) => r.status === 'SPARSE' || r.status.startsWith('CHECK'))
console.log(`\n${sparse.length ? 'SPARSE / NEEDS ATTENTION: ' + sparse.map((r) => `${r.competition} (${r.loaded}/${FIELD} = ${r.coverage})`).join(', ') : 'all competitions at or above ' + MIN + '%'}`)
if (sparse.length) process.exitCode = 1
