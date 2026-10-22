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

const TR = { 'ø': 'o', 'Ø': 'O', 'æ': 'ae', 'Æ': 'AE', 'å': 'a', 'Å': 'A', 'ł': 'l', 'Ł': 'L', 'đ': 'd', 'Đ': 'D', 'ß': 'ss', 'ı': 'i', 'þ': 'th', 'ð': 'd' }
const translit = (s) => s.replace(/[øØæÆåÅłŁđĐßıþð]/g, (ch) => TR[ch])

export function norm(s) {
  return translit(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/munich/g, 'munchen').replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/).filter((t) => t && !STOP.has(t)).join(' ')
}

// candidates: [{id, name}]. Exact normalized match wins; else a UNIQUE token-subset match; else null.
const NOT_SENIOR = /\b(u1[5-9]|u2[0-3]|ii|iii|b|w|women|reserves?|youth)\b/i

export function pickCandidate(name, candidates) {
  candidates = candidates.filter((c) => !NOT_SENIOR.test(c.name))
  // "Paris FC" must not collapse into "Paris Saint Germain" just because 'fc' is a stopword.
  if (/\bfc\b/i.test(name)) candidates = candidates.filter((c) => /\bfc\b/i.test(c.name))
  // "Feyenoord" must beat "SC Feyenoord" even though 'sc' is a stopword.
  const rawN = (x) => translit(x).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const raw = candidates.filter((c) => rawN(c.name) === rawN(name))
  if (raw.length === 1) return raw[0]
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
      country: club.country,
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
class AccessDenied extends Error {} // key rejected / account suspended: stop at once, never keep hammering
let used = 0
let offline = false // true = cache-only pass (never calls the API)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function api(p) {
  if (offline || used >= BUDGET) throw new BudgetExhausted()
  used++
  await sleep(Number(process.env.THROTTLE_MS ?? 6500)) // 10 req/min
  const res = await fetch(BASE + p, { headers: { 'x-apisports-key': KEY } })
  if (res.status === 429) { await sleep(65000); used--; return api(p) }
  const json = await res.json()
  const errs = json.errors
  if (errs && !Array.isArray(errs) && (errs.access || errs.token)) throw new AccessDenied(String(errs.access ?? errs.token))
  if (errs && !Array.isArray(errs) && errs.requests) throw new BudgetExhausted() // daily quota hit
  if (errs && !Array.isArray(errs) && errs.rateLimit) { await sleep(65000); used--; return api(p) } // per-minute cap
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

const plain = (s) => translit(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

// ── resolve 2026-27 club names to API ids ────────────────────────────
const toHit = (ov, name) => (ov ? (typeof ov === 'object' ? ov : { id: ov, name }) : null)

// A budget stop aborts the run, except in the offline (cache-only) pass where we skip uncached items.
const budgetGuard = (err) => { if (!(err instanceof BudgetExhausted) || !offline) throw err }

function dupCheck(list, unresolved) {
  const seen = new Map()
  for (const c of list) {
    if (seen.has(c.id)) unresolved.push(`DUPLICATE id ${c.id}: "${seen.get(c.id)}" and "${c.wanted}"`)
    seen.set(c.id, c.wanted)
  }
}

// Big-5 leagues: ids from the allowed 2024 team lists, search fallback for promoted clubs.
async function resolveClubs(cfg, out, unresolved) {
  for (const lg of LEAGUES) {
    let ref
    try {
      ref = await cached(`ref-${lg.id}-${REF_SEASON}.json`, async () =>
        (await api(`/teams?league=${lg.id}&season=${REF_SEASON}`)).map((t) => ({ id: t.team.id, name: t.team.name })))
    } catch (err) { budgetGuard(err); continue }
    for (const wanted of cfg.leagues?.[lg.name] ?? []) {
      try {
        let hit = toHit(cfg.overrides?.[wanted], wanted) ?? pickCandidate(wanted, ref)
        if (!hit) {
          const cands = await cached(`search-${norm(wanted).replace(/ /g, '-')}-${lg.id}.json`, async () =>
            (await api(`/teams?search=${encodeURIComponent(plain(wanted))}`))
              .filter((t) => t.team.country === lg.country && !t.team.national)
              .map((t) => ({ id: t.team.id, name: t.team.name })))
          hit = pickCandidate(wanted, cands)
          if (!hit) unresolved.push(`${lg.name}: "${wanted}" candidates=${JSON.stringify(cands.slice(0, 5))}`)
        }
        if (hit && !Number.isInteger(Number(hit.id))) {
          unresolved.push(`${lg.name}: "${wanted}" has a non-numeric id in overrides: ${JSON.stringify(hit.id)}`)
          hit = null
        }
        if (hit) out.push({ id: Number(hit.id), name: hit.name, league: lg.name, country: lg.country, wanted })
      } catch (err) { budgetGuard(err) }
    }
  }
  dupCheck(out, unresolved)
}

// Non-big-5 clubs in UEFA competitions: search by name, prefer the right country.
export function pickEurope(entry, cands) {
  const ck = (c) => norm(String(c ?? '').replace(/-/g, ' '))
  const inCountry = cands.filter((c) => ck(c.country) === ck(entry.country))
  if (inCountry.length) return pickCandidate(entry.name, inCountry)
  // The API's country label may differ from ours (Turkey/Türkiye...): accept only an exact name match.
  const exact = cands.filter((c) => !NOT_SENIOR.test(c.name) && norm(c.name) === norm(entry.name))
  return exact.length === 1 ? exact[0] : null
}

async function resolveEurope(cfg, out, unresolved, failures) {
  const start = out.length
  for (const e of cfg.europe ?? []) {
    try {
      let hit = toHit(cfg.overrides?.[e.name], e.name)
      if (!hit) {
        const q = plain(e.search ?? e.name)
        const cands = await cached(`search-eu-${norm(q).replace(/ /g, '-')}-${norm(e.country).replace(/ /g, '-')}.json`, async () =>
          (await api(`/teams?search=${encodeURIComponent(q)}`))
            .filter((t) => !t.team.national)
            .map((t) => ({ id: t.team.id, name: t.team.name, country: t.team.country })))
        hit = pickEurope(e, cands)
        if (!hit) unresolved.push(`Europe: "${e.name}" (${e.country}) candidates=${JSON.stringify(cands.slice(0, 6))}`)
      }
      if (hit && !Number.isInteger(Number(hit.id))) {
        unresolved.push(`Europe: "${e.name}" has a non-numeric id in overrides: ${JSON.stringify(hit.id)}`)
        hit = null
      }
      if (hit) {
        const club = { id: Number(hit.id), name: hit.name, league: 'Other', country: e.country, competitions: [...(e.competitions ?? [])], wanted: e.name }
        out.push(club)
        // fetch right away: a partial run then leaves complete clubs in priority order, not 70 bare ids
        await loadCached([club])
        await fetchMissing([club], failures)
      }
    } catch (err) {
      if (err instanceof AccessDenied) throw err
      if (err instanceof BudgetExhausted) { budgetGuard(err); continue }
      unresolved.push(`Europe: "${e.name}" search failed: ${err.message}`)
    }
  }
  dupCheck(out.slice(start), unresolved)
}

// ── squads ───────────────────────────────────────────────────────────
async function loadCached(list) {
  for (const c of list) {
    const f = path.join(CACHE, `squad-${c.id}.json`)
    if (!c.squad && existsSync(f)) c.squad = JSON.parse(await readFile(f, 'utf8'))
  }
}

async function fetchMissing(list, failures) {
  for (const c of list.filter((x) => !x.squad)) {
    try {
      c.squad = await cached(`squad-${c.id}.json`, async () => {
        const r = await api(`/players/squads?team=${c.id}`)
        const got = r[0]?.team?.name
        if (got && !pickCandidate(c.wanted, [{ id: c.id, name: got }])) {
          console.warn(`! "${c.wanted}" resolved to id ${c.id} but API says "${got}" — add a fix to "overrides"`)
        }
        return r[0]?.players ?? []
      })
    } catch (err) {
      if (err instanceof AccessDenied) throw err
      if (err instanceof BudgetExhausted) { budgetGuard(err); continue }
      failures.push(`${c.wanted} (id ${c.id}): ${err.message}`)
    }
  }
}

// Big-5 first (so scarce quota goes to the core leagues), then European clubs in UCL > UEL > UECL order.
async function pipeline(cfg, clubs, unresolved, failures) {
  await resolveClubs(cfg, clubs, unresolved)
  for (const c of clubs) {
    for (const [code, names] of Object.entries(cfg.competitions ?? {})) {
      if (names.some((n) => norm(n) === norm(c.wanted))) (c.competitions ??= []).push(code)
    }
  }
  await loadCached(clubs)
  await fetchMissing(clubs, failures)
  const n = clubs.length
  await resolveEurope(cfg, clubs, unresolved, failures)
  const eu = clubs.slice(n)
  await loadCached(eu)
  await fetchMissing(eu, failures)
}

// ── emit ─────────────────────────────────────────────────────────────
const HEADER = `// AUTO-GENERATED by build-squads.mjs — do not hand-edit.
// Source: API-Football /players/squads (current squads at generation time). Identity only, no stats.
`
const TYPES = `${HEADER}
// 'Other' = clubs outside the five leagues that play in UEFA competitions (see ClubMeta.country).
export type LeagueName = 'Premier League' | 'La Liga' | 'Bundesliga' | 'Serie A' | 'Ligue 1' | 'Other'
export type Competition = 'UCL' | 'UEL' | 'UECL'
export type LeagueFilter = 'All' | Competition | Exclude<LeagueName, 'Other'>

export interface ClubMeta {
  id: number
  name: string
  league: LeagueName
  country: string
  competitions: Competition[]
}

export interface LeaguePlayer {
  id: string
  api_id: number
  name: string // API-abbreviated, e.g. "M. van de Ven"
  shirt_name: string
  club: string
  club_id: number
  league: LeagueName
  country: string // country of the CLUB (not the player's nationality)
  position: 'GK' | 'DF' | 'MF' | 'FW'
  number: number | null
  age: number | null
  photo: string | null
  number_conflict: boolean // shared shirt number in the same squad: likely youth/reserve/stale entry
}
`

const GROUPS = [
  ...LEAGUES.map((lg) => ({ slug: lg.slug, konst: lg.konst, match: (c) => c.league === lg.name })),
  { slug: 'europe', konst: 'EUROPE', match: (c) => c.league === 'Other' },
]

async function emit(clubs) {
  await mkdir(OUT, { recursive: true })
  await writeFile(path.join(OUT, 'league-types.ts'), TYPES)
  for (const g of GROUPS) {
    const players = clubs.filter((c) => g.match(c) && c.squad).flatMap((c) => transformSquad(c.squad, c))
    await writeFile(
      path.join(OUT, `players-${g.slug}.ts`),
      `${HEADER}import type { LeaguePlayer } from './league-types'\n\nexport const ${g.konst}_PLAYERS: LeaguePlayer[] = ${JSON.stringify(players, null, 2)}\n`,
    )
  }
  const meta = clubs.map(({ id, name, league, country, competitions }) => ({ id, name, league, country, competitions: competitions ?? [] }))
  const imports = GROUPS.map((g) => `import { ${g.konst}_PLAYERS } from './players-${g.slug}'`).join('\n')
  await writeFile(
    path.join(OUT, 'index.ts'),
    `${HEADER}import type { ClubMeta, LeagueFilter, LeaguePlayer } from './league-types'
${imports}

export const CLUBS: ClubMeta[] = ${JSON.stringify(meta, null, 2)}

export const ALL_LEAGUE_PLAYERS: LeaguePlayer[] = [
${GROUPS.map((g) => `  ...${g.konst}_PLAYERS,`).join('\n')}
]

const clubById = new Map(CLUBS.map((c) => [c.id, c]))

// Drives the filter pills: All / UCL / UEL / UECL / <league>
export const filterByPill = (pill: LeagueFilter): LeaguePlayer[] =>
  pill === 'All'
    ? ALL_LEAGUE_PLAYERS
    : ALL_LEAGUE_PLAYERS.filter((p) =>
        pill === 'UCL' || pill === 'UEL' || pill === 'UECL'
          ? !!clubById.get(p.club_id)?.competitions.includes(pill)
          : p.league === pill,
      )
`,
  )
}

// ── main ─────────────────────────────────────────────────────────────
async function main() {
  const OFFLINE_ONLY = process.argv.includes('--offline') // rebuild files from cache; never touches the API
  if (OFFLINE_ONLY) offline = true
  else if (!KEY) { console.error('Set API_FOOTBALL_KEY (or run with --offline to rebuild from cache)'); process.exit(1) }
  if (!existsSync(CLUBS_FILE)) { console.error(`Missing ${CLUBS_FILE}`); process.exit(1) }
  const cfg = JSON.parse(await readFile(CLUBS_FILE, 'utf8'))
  await mkdir(CACHE, { recursive: true })

  let unresolved = []
  let failures = []
  let clubs = []
  let stopped = false
  let denied = false
  let failed = false
  try {
    await pipeline(cfg, clubs, unresolved, failures)
  } catch (err) {
    if (err instanceof BudgetExhausted) stopped = true
    else if (err instanceof AccessDenied) {
      denied = true
      stopped = true
      console.error(`\nSTOPPED: API-Football rejected this key/account: ${err.message}`)
      console.error('Nothing more was requested. Check https://dashboard.api-football.com (and your email) before running again.')
    } else { failed = true; console.error(`FAILED: ${err.message}`) }
  }
  if (stopped) {
    // Budget ran out mid-run. Rebuild from cache only (zero API calls) so the output never
    // loses clubs that were resolved/fetched on an earlier day but sit later in the pipeline.
    offline = true
    const clubs2 = []
    try { await pipeline(cfg, clubs2, [], []) } catch { /* cache-only pass is best effort */ }
    if (clubs2.length >= clubs.length) clubs = clubs2
  }

  if (clubs.length) await emit(clubs)
  const withSquad = clubs.filter((c) => c.squad).length
  if (unresolved.length) {
    console.warn('\nUNRESOLVED clubs (add "Club name": apiTeamId to "overrides" in clubs-2026.json):')
    unresolved.forEach((u) => console.warn('  - ' + u))
  }
  if (failures.length) {
    console.warn('\nFAILED clubs (the rest were still processed):')
    failures.forEach((f) => console.warn('  - ' + f))
  }
  const status = OFFLINE_ONLY ? 'OFFLINE rebuild from cache (0 API calls)' : denied ? 'STOPPED — API access denied' : failed ? 'FAILED' : stopped ? 'PARTIAL — re-run tomorrow' : failures.length ? 'INCOMPLETE — some clubs failed' : unresolved.length ? 'INCOMPLETE — fix unresolved clubs' : 'complete'
  console.log(`${status}: ${withSquad}/${clubs.length} squads loaded, ${used} calls used`)
  if (failed || denied || failures.length) process.exitCode = 1
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main()
