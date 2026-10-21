#!/usr/bin/env node
// Squad coverage report: players per club, league vs clubs counts, and the pending list.
// Run from repo root:  node scripts/count-squads.mjs
// Options: --dir <generated dir>  --clubs <clubs-2026.json>  --cache <cache dir>
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pickCandidate, LEAGUES } from './build-squads.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d }
const DIR = arg('dir', 'frontend/lib/data/league')
const CLUBS_FILE = arg('clubs', path.join(HERE, 'clubs-2026.json'))
const CACHE = arg('cache', '.cache/api-football')
const LOW = 22 // fewer players than this = thin squad
const HIGH = 38 // more than this = probably padded with academy entries

const cfg = JSON.parse(readFileSync(CLUBS_FILE, 'utf8'))

// players per club (from the generated player files)
const perClub = {} // club_id -> row
for (const f of readdirSync(DIR).filter((x) => x.startsWith('players-'))) {
  const txt = readFileSync(`${DIR}/${f}`, 'utf8')
  for (const p of JSON.parse(txt.slice(txt.indexOf('= [') + 2))) {
    const c = (perClub[p.club_id] ??= { club: p.club, league: p.league, players: 0, GK: 0, DF: 0, MF: 0, FW: 0, conflicts: 0 })
    c.players++
    c[p.position]++
    if (p.number_conflict) c.conflicts++
  }
}

// resolved clubs (from the generated index.ts)
const idx = readFileSync(`${DIR}/index.ts`, 'utf8')
const resolved = JSON.parse(idx.match(/export const CLUBS: ClubMeta\[\] = (\[[\s\S]*?\n\])\n/)[1])

// per-club table
const rows = Object.values(perClub)
  .sort((a, b) => a.players - b.players)
  .map((c) => ({ ...c, flag: c.players < LOW ? 'THIN' : c.players > HIGH ? 'PADDED' : c.GK < 2 ? 'FEW GK' : '' }))
console.table(rows)

// league vs clubs + pending
const summary = []
const pending = []
for (const lg of LEAGUES) {
  const wanted = cfg.leagues?.[lg.name] ?? []
  const inLeague = resolved.filter((c) => c.league === lg.name)
  let nResolved = 0, nLoaded = 0, nPlayers = 0
  for (const w of wanted) {
    const ov = cfg.overrides?.[w]
    const match = ov
      ? inLeague.find((c) => c.id === (typeof ov === 'object' ? ov.id : ov))
      : pickCandidate(w, inLeague)
    if (!match) { pending.push({ league: lg.name, club: w, status: 'NOT RESOLVED (add to overrides)' }); continue }
    nResolved++
    const got = perClub[match.id]
    if (got) { nLoaded++; nPlayers += got.players; continue }
    const fetched = existsSync(path.join(CACHE, `squad-${match.id}.json`))
    pending.push({ league: lg.name, club: match.name, status: fetched ? `EMPTY SQUAD returned (id ${match.id})` : `NOT FETCHED YET (id ${match.id})` })
  }
  summary.push({ league: lg.name, expected: wanted.length, resolved: nResolved, loaded: nLoaded, pending: wanted.length - nLoaded, players: nPlayers })
}
const sum = (k) => summary.reduce((s, r) => s + r[k], 0)
summary.push({ league: 'TOTAL', expected: sum('expected'), resolved: sum('resolved'), loaded: sum('loaded'), pending: sum('pending'), players: sum('players') })

console.log('\nLEAGUE vs CLUBS')
console.table(summary)
console.log(`PENDING (${pending.length})`)
if (pending.length) console.table(pending)
else console.log('  none — all clubs loaded')
const flagged = rows.filter((r) => r.flag)
console.log(`\nflagged squads: ${flagged.map((r) => `${r.club} (${r.flag}, ${r.players})`).join(', ') || 'none'}`)
console.log(`avg players per loaded club: ${(sum('players') / Math.max(1, sum('loaded'))).toFixed(1)}`)
