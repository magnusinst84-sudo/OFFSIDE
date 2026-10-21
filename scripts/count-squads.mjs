#!/usr/bin/env node
// Squad coverage report: players per club, league vs clubs, competition vs clubs, pending list.
// Run from repo root:  node scripts/count-squads.mjs [--names]
// Options: --dir <generated dir>  --clubs <clubs-2026.json>  --cache <cache dir>  --names (list clubs per competition)
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pickCandidate, norm, LEAGUES } from './build-squads.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d }
const DIR = arg('dir', 'frontend/lib/data/league')
const CLUBS_FILE = arg('clubs', path.join(HERE, 'clubs-2026.json'))
const CACHE = arg('cache', '.cache/api-football')
const SHOW_NAMES = process.argv.includes('--names')
const LOW = 22 // fewer players than this = thin squad
const HIGH = 38 // more than this = probably padded with academy entries
const COMPS = ['UCL', 'UEL', 'UECL']

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

// competitions a big-5 club is tagged with (clubs-2026.json "competitions"); Europe clubs carry their own tag
const bigFiveComps = (name) =>
  Object.entries(cfg.competitions ?? {}).filter(([, names]) => names.some((n) => norm(n) === norm(name))).map(([k]) => k)

const GROUPS = [
  ...LEAGUES.map((l) => ({ name: l.name, label: l.name, big5: true, wanted: (cfg.leagues?.[l.name] ?? []).map((n) => ({ name: n, comps: bigFiveComps(n) })) })),
  { name: 'Other', label: 'Europe (non-big-5)', big5: false, wanted: (cfg.europe ?? []).map((e) => ({ name: e.name, comps: e.competitions ?? [] })) },
]

// league vs clubs + pending + one entry per club for the competition table
const summary = []
const pending = []
const entries = [] // { name, comps, big5, loaded, players }
for (const lg of GROUPS) {
  const inLeague = resolved.filter((c) => c.league === lg.name)
  let nResolved = 0, nLoaded = 0, nPlayers = 0
  for (const w of lg.wanted) {
    const ov = cfg.overrides?.[w.name]
    const match = ov
      ? inLeague.find((c) => c.id === (typeof ov === 'object' ? ov.id : ov))
      : pickCandidate(w.name, inLeague)
    const got = match ? perClub[match.id] : undefined
    entries.push({ name: match?.name ?? w.name, comps: w.comps, big5: lg.big5, loaded: !!got, players: got?.players ?? 0 })
    const comp = w.comps.join('/')
    if (!match) { pending.push({ league: lg.label, club: w.name, comp, status: 'NOT RESOLVED (add to overrides)' }); continue }
    nResolved++
    if (got) { nLoaded++; nPlayers += got.players; continue }
    const fetched = existsSync(path.join(CACHE, `squad-${match.id}.json`))
    pending.push({ league: lg.label, club: match.name, comp, status: fetched ? `EMPTY SQUAD returned (id ${match.id})` : `NOT FETCHED YET (id ${match.id})` })
  }
  summary.push({ league: lg.label, expected: lg.wanted.length, resolved: nResolved, loaded: nLoaded, pending: lg.wanted.length - nLoaded, players: nPlayers })
}
const sum = (k) => summary.reduce((s, r) => s + r[k], 0)
summary.push({ league: 'TOTAL', expected: sum('expected'), resolved: sum('resolved'), loaded: sum('loaded'), pending: sum('pending'), players: sum('players') })

console.log('\nLEAGUE vs CLUBS')
console.table(summary)

// competition vs clubs
const compRow = (label, es) => {
  const ok = es.filter((e) => e.loaded)
  return {
    competition: label,
    expected: es.length,
    loaded: ok.length,
    pending: es.length - ok.length,
    players: ok.reduce((s, e) => s + e.players, 0),
    big5: ok.filter((e) => e.big5).length,
    other: ok.filter((e) => !e.big5).length,
  }
}
const compTable = [
  ...COMPS.map((code) => compRow(code, entries.filter((e) => e.comps.includes(code)))),
  compRow('ANY (unique clubs)', entries.filter((e) => e.comps.length > 0)),
]
console.log('COMPETITION vs CLUBS (big5 / other = loaded clubs from the five leagues / from elsewhere)')
console.table(compTable)
if (!entries.some((e) => e.big5 && e.comps.length)) {
  console.log('  NOTE: no big-5 club has a UCL/UEL/UECL tag yet (clubs-2026.json "competitions" is empty),')
  console.log('  so the competition counts above cover non-big-5 clubs only.')
}
if (SHOW_NAMES) {
  for (const code of COMPS) {
    const es = entries.filter((e) => e.comps.includes(code))
    console.log(`\n${code} loaded (${es.filter((e) => e.loaded).length}): ${es.filter((e) => e.loaded).map((e) => e.name).join(', ') || '-'}`)
    console.log(`${code} pending (${es.filter((e) => !e.loaded).length}): ${es.filter((e) => !e.loaded).map((e) => e.name).join(', ') || '-'}`)
  }
}

console.log(`\nPENDING (${pending.length})`)
if (pending.length) console.table(pending)
else console.log('  none — all clubs loaded')
const flagged = rows.filter((r) => r.flag)
console.log(`\nflagged squads: ${flagged.map((r) => `${r.club} (${r.flag}, ${r.players})`).join(', ') || 'none'}`)
console.log(`avg players per loaded club: ${(sum('players') / Math.max(1, sum('loaded'))).toFixed(1)}`)
