#!/usr/bin/env node
// OFFSIDE — per-league squad generator (API-Football, Free-plan safe) — v2
//
// Run:  API_FOOTBALL_KEY=xxxx node scripts/build-squads.mjs [--out frontend/lib/data/league] [--budget 85]
//
// Why v2: the Free plan blocks season=2026 on /teams, so club membership comes from
// clubs-2026.json (2026-27 clubs per league). Ids are resolved from the allowed 2024 team
// lists (1 call/league) plus /teams?search for clubs not in them (promoted sides).
// /players/squads has no season param, so it returns the CURRENT squad on the Free plan.
//
// Resumable: every API response is cached on disk. Re-run until it prints "complete".
// Free limits respected: 100 requests/day, 10 requests/minute.
// Output is IDENTITY ONLY (no fabricated stats). Names are API-abbreviated ("M. van de Ven").

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const BASE = 'https://v3.football.api-sports.io'
const KEY = process.env.API_FOOTBALL_KEY
const HERE = path.dirname(fileURLToPath(import.meta.url))

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : dflt
}
const OUT = arg('out', 'frontend/lib/data/league')
const CACHE = arg('cache', '.cache/api-football')
const BUDGET = Number(arg('budget', 85)) // headroom under the 100/day cap
const REF_SEASON = Number(arg('ref-season', 2024)) // newest season the Free plan allows
const CLUBS_FILE = arg('clubs', path.join(HERE, 'clubs-2026.json'))

export const LEAGUES = [
  { id: 39, name: 'Premier League', slug: 'premier-league', konst: 'PREMIER_LEAGUE', country: 'England' },
  { id: 140, name: 'La Liga', slug: 'la-liga', konst: 'LA_LIGA', country: 'Spain' },
  { id: 78, name: 'Bundesliga', slug: 'bundesliga', konst: 'BUNDESLIGA', country: 'Germany' },
  { id: 135, name: 'Serie A', slug: 'serie-a', konst: 'SERIE_A', country: 'Italy' },
  { id: 61, name: 'Ligue 1', slug: 'ligue-1', konst: 'LIGUE_1', country: 'France' },
]
const POS = { Goalkeeper: 'GK', Defender: 'DF', Midfielder: 'MF', Attacker: 'FW' }

// ── pure helpers (exported for testing) ─────────────────────────────
const STOP = new Set(['fc', 'afc', 'cf', 'sc', 'ssc', 'ud', 'cd', 'rcd', 'fk', 'sv', 'fsv', 'ac', 'as', 'us', 'ss', 'club', 'de', 'and'])

export function norm(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/munich/g, 'munchen').replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/).filter((t) => t && !STOP.has(t)).join(' ')
}

// candidates: [{id, name}]. Exact normalized match wins; else a UNIQUE token-subset match; else null.
const NOT_SENIOR = /\b(u1[5-9]|u2[0-3]|ii|iii|b|w|women|reserves?|youth)\b/i

export function pickCandidate(name, candidates) {
  candidates = candidates.filter((c) => !NOT_SENIOR.test(c.name))
  // "Paris FC" must not collapse into "Paris Saint Germain" just because 'fc' is a stopword.
  if (/\bfc\b/i.test(name)) candidates = candidates.filter((c) => /\bfc\b/i.test(c.name))
  const n = norm(name)
  const exact = candidates.filter((c) => norm(c.name) === n)
  if (exact.length === 1) return exact[0]
  if (exact.length > 1) return null
  const nt = new Set(n.split(' '))
  const subset = candidates.filter((c) => {
    const ct = new Set(norm(c.name).split(' '))
    return [...nt].every((t) => ct.has(t)) || [...ct].every((t) => nt.has(t))
  })
  return subset.length === 1 ? subset[0] : null
}

export function shirtName(name) {
  const parts = name.trim().split(/\s+/)
  const rest = parts.filter((p, i) => !(i < parts.length - 1 && /^[A-Z]\.$/.test(p)))
  const hadInitial = rest.length !== parts.length
  const surname = hadInitial || rest.length === 1 ? rest.join(' ') : rest[rest.length - 1]
  return surname.toUpperCase() // "M. van de Ven" -> VAN DE VEN; "Pedro Porro" -> PORRO
}

export function transformSquad(apiPlayers, club) {
  const counts = new Map()
  for (const p of apiPlayers) if (p.number != null) counts.set(p.number, (counts.get(p.number) ?? 0) + 1)
  return apiPlayers
    .map((p) => ({
      id: `api-${p.id}`,
      api_id: p.id,
      name: p.name,
      shirt_name: shirtName(p.name),
      club: club.name,
      club_id: club.id,
      league: club.league,
      position: POS[p.position] ?? 'MF',
      number: p.number ?? null,
      age: p.age ?? null,
      photo: p.photo ?? null,
      // Shared shirt number inside one squad = youth/stale registry entry. Review these.
      number_conflict: p.number != null && counts.get(p.number) > 1,
    }))
    .sort((a, b) => (a.number ?? 999) - (b.number ?? 999))
}

// ── API plumbing ─────────────────────────────────────────────────────
class BudgetExhausted extends Error {}
let used = 0
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function api(p) {
  if (used >= BUDGET) throw new BudgetExhausted()
  used++
  await sleep(Number(process.env.THROTTLE_MS ?? 6500)) // 10 req/min
  const res = await fetch(BASE + p, { headers: { 'x-apisports-key': KEY } })
  if (res.status === 429) { await sleep(65000); used--; return api(p) }
  const json = await res.json()
  const errs = json.errors
  if (Array.isArray(errs) ? errs.length : Object.keys(errs ?? {}).length) {
    throw new Error(`${p} -> ${JSON.stringify(errs)}`)
  }
  return json.response
}

async function cached(file, fn) {
  const f = path.join(CACHE, file)
  if (existsSync(f)) return JSON.parse(await readFile(f, 'utf8'))
  const data = await fn()
  await writeFile(f, JSON.stringify(data))
  return data
}

const plain = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

// ── resolve 2026-27 club names to API ids ────────────────────────────
async function resolveClubs(cfg, unresolved) {
  const clubs = []
  for (const lg of LEAGUES) {
    const names = cfg.leagues?.[lg.name] ?? []
    const ref = await cached(`ref-${lg.id}-${REF_SEASON}.json`, async () =>
      (await api(`/teams?league=${lg.id}&season=${REF_SEASON}`)).map((t) => ({ id: t.team.id, name: t.team.name })))
    for (const wanted of names) {
      const ov = cfg.overrides?.[wanted] // either 123 or { "id": 123, "name": "Display Name" }
      let hit = ov ? (typeof ov === 'object' ? ov : { id: ov, name: wanted }) : pickCandidate(wanted, ref)
      if (!hit) {
        const cands = await cached(`search-${norm(wanted).replace(/ /g, '-')}-${lg.id}.json`, async () =>
          (await api(`/teams?search=${encodeURIComponent(plain(wanted))}`))
            .filter((t) => t.team.country === lg.country && !t.team.national)
            .map((t) => ({ id: t.team.id, name: t.team.name })))
        hit = pickCandidate(wanted, cands)
        if (!hit) unresolved.push(`${lg.name}: "${wanted}" candidates=${JSON.stringify(cands.slice(0, 5))}`)
      }
      if (hit) clubs.push({ id: hit.id, name: hit.name, league: lg.name, wanted })
    }
  }
  const seen = new Map()
  for (const c of clubs) {
    if (seen.has(c.id)) unresolved.push(`DUPLICATE id ${c.id}: "${seen.get(c.id)}" and "${c.wanted}"`)
    seen.set(c.id, c.wanted)
  }
  return clubs
}

// ── emit ─────────────────────────────────────────────────────────────
const HEADER = `// AUTO-GENERATED by build-squads.mjs — do not hand-edit.
// Source: API-Football /players/squads (current squads at generation time). Identity only, no stats.
`
const TYPES = `${HEADER}
export type LeagueName = 'Premier League' | 'La Liga' | 'Bundesliga' | 'Serie A' | 'Ligue 1'
export type LeagueFilter = 'All' | 'UCL' | 'UEL' | LeagueName

export interface ClubMeta {
  id: number
  name: string
  league: LeagueName
  competitions: ('UCL' | 'UEL')[]
}

export interface LeaguePlayer {
  id: string
  api_id: number
  name: string // API-abbreviated, e.g. "M. van de Ven"
  shirt_name: string
  club: string
  club_id: number
  league: LeagueName
  position: 'GK' | 'DF' | 'MF' | 'FW'
  number: number | null
  age: number | null
  photo: string | null
  number_conflict: boolean // shared shirt number in the same squad: likely youth/stale entry
}
`

async function emit(clubs) {
  await mkdir(OUT, { recursive: true })
  await writeFile(path.join(OUT, 'league-types.ts'), TYPES)
  for (const lg of LEAGUES) {
    const players = clubs.filter((c) => c.league === lg.name && c.squad).flatMap((c) => transformSquad(c.squad, c))
    await writeFile(
      path.join(OUT, `players-${lg.slug}.ts`),
      `${HEADER}import type { LeaguePlayer } from './league-types'\n\nexport const ${lg.konst}_PLAYERS: LeaguePlayer[] = ${JSON.stringify(players, null, 2)}\n`,
    )
  }
  const meta = clubs.map(({ id, name, league, competitions }) => ({ id, name, league, competitions: competitions ?? [] }))
  const imports = LEAGUES.map((l) => `import { ${l.konst}_PLAYERS } from './players-${l.slug}'`).join('\n')
  await writeFile(
    path.join(OUT, 'index.ts'),
    `${HEADER}import type { ClubMeta, LeagueFilter, LeaguePlayer } from './league-types'
${imports}

export const CLUBS: ClubMeta[] = ${JSON.stringify(meta, null, 2)}

export const ALL_LEAGUE_PLAYERS: LeaguePlayer[] = [
${LEAGUES.map((l) => `  ...${l.konst}_PLAYERS,`).join('\n')}
]

const clubById = new Map(CLUBS.map((c) => [c.id, c]))

// Drives the filter pills: All / UCL / UEL / <league>
export const filterByPill = (pill: LeagueFilter): LeaguePlayer[] =>
  pill === 'All'
    ? ALL_LEAGUE_PLAYERS
    : ALL_LEAGUE_PLAYERS.filter((p) =>
        pill === 'UCL' || pill === 'UEL'
          ? !!clubById.get(p.club_id)?.competitions.includes(pill)
          : p.league === pill,
      )
`,
  )
}

// ── main ─────────────────────────────────────────────────────────────
async function main() {
  if (!KEY) { console.error('Set API_FOOTBALL_KEY'); process.exit(1) }
  if (!existsSync(CLUBS_FILE)) { console.error(`Missing ${CLUBS_FILE}`); process.exit(1) }
  const cfg = JSON.parse(await readFile(CLUBS_FILE, 'utf8'))
  await mkdir(CACHE, { recursive: true })

  const unresolved = []
  let clubs = []
  let stopped = false
  let failed = false
  try {
    clubs = await resolveClubs(cfg, unresolved)
    for (const c of clubs) {
      for (const [code, names] of Object.entries(cfg.competitions ?? {})) {
        if (names.some((n) => norm(n) === norm(c.wanted))) (c.competitions ??= []).push(code)
      }
    }
    for (const c of clubs) {
      c.squad = await cached(`squad-${c.id}.json`, async () => {
        const r = await api(`/players/squads?team=${c.id}`)
        const got = r[0]?.team?.name
        if (got && !pickCandidate(c.wanted, [{ id: c.id, name: got }])) {
          console.warn(`! "${c.wanted}" resolved to id ${c.id} but API says "${got}" — add a fix to "overrides"`)
        }
        return r[0]?.players ?? []
      })
    }
  } catch (err) {
    if (err instanceof BudgetExhausted) stopped = true
    else { failed = true; console.error(`FAILED: ${err.message}`) }
  }

  if (clubs.length) await emit(clubs)
  const withSquad = clubs.filter((c) => c.squad).length
  if (unresolved.length) {
    console.warn('\nUNRESOLVED clubs (add "Club name": apiTeamId to "overrides" in clubs-2026.json):')
    unresolved.forEach((u) => console.warn('  - ' + u))
  }
  const status = failed ? 'FAILED' : stopped ? 'PARTIAL — re-run tomorrow' : unresolved.length ? 'INCOMPLETE — fix unresolved clubs' : 'complete'
  console.log(`${status}: ${withSquad}/${clubs.length} squads loaded, ${used} calls used`)
  if (failed) process.exitCode = 1
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main()
