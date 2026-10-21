const path = require('path');
const fs = require('fs');
const assert = require('assert');
const jiti = require(path.resolve(__dirname, '../frontend/node_modules/jiti'))(__filename);

const { ALL_PLAYERS } = jiti(path.resolve(__dirname, '../frontend/lib/data/legacy/players.ts'));
const { ALL_LEAGUE_PLAYERS, CLUBS } = jiti(path.resolve(__dirname, '../frontend/lib/data/league/index.ts'));

const mapPath = path.resolve(__dirname, '../frontend/lib/data/legacy/player-match-map.json');
const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

console.log('====================================================');
console.log('        PLAYER MATCH MAP VERIFICATION SUITE         ');
console.log('====================================================\n');

const leaguePlayerById = new Map(ALL_LEAGUE_PLAYERS.map(p => [p.id, p]));
const clubById = new Map(CLUBS.map(c => [c.id, c]));
const legacyPlayerById = new Map(ALL_PLAYERS.map(p => [p.id, p]));

const failures = [];
const seenLeagueIds = new Map();
const seenLegacyIds = new Map();
let posFlagCount = 0;

mapData.forEach((row, idx) => {
  const rowPrefix = `Row #${idx + 1} (${row.legacy_id} -> ${row.league_id}):`;

  // Schema check
  const requiredFields = ['legacy_id', 'league_id', 'club_id', 'confidence', 'age_delta', 'position_flag'];
  for (const f of requiredFields) {
    if (row[f] === undefined) {
      failures.push(`${rowPrefix} Missing required field '${f}'`);
    }
  }

  if (row.position_flag === true) posFlagCount++;

  // 1. Assert league_id exists in ALL_LEAGUE_PLAYERS
  const lp = leaguePlayerById.get(row.league_id);
  if (!lp) {
    failures.push(`${rowPrefix} FAIL: league_id '${row.league_id}' does not exist in ALL_LEAGUE_PLAYERS`);
    return;
  }

  // 2. Assert club_id equals player's club_id
  if (lp.club_id !== row.club_id) {
    failures.push(`${rowPrefix} FAIL: player's club_id (${lp.club_id}) != mapped club_id (${row.club_id})`);
  }

  // 3. Assert club_id exists in CLUBS
  const club = clubById.get(row.club_id);
  if (!club) {
    failures.push(`${rowPrefix} FAIL: club_id ${row.club_id} not found in CLUBS`);
  }

  // 4. Assert legacy_id exists in ALL_PLAYERS
  const leg = legacyPlayerById.get(row.legacy_id);
  if (!leg) {
    failures.push(`${rowPrefix} FAIL: legacy_id '${row.legacy_id}' not found in ALL_PLAYERS`);
  }

  // 5. Assert no league_id appears twice
  if (seenLeagueIds.has(row.league_id)) {
    failures.push(`${rowPrefix} FAIL: duplicate league_id '${row.league_id}' (first seen at row #${seenLeagueIds.get(row.league_id)})`);
  } else {
    seenLeagueIds.set(row.league_id, idx + 1);
  }

  // 6. Assert no legacy_id appears twice
  if (seenLegacyIds.has(row.legacy_id)) {
    failures.push(`${rowPrefix} FAIL: duplicate legacy_id '${row.legacy_id}' (first seen at row #${seenLegacyIds.get(row.legacy_id)})`);
  } else {
    seenLegacyIds.set(row.legacy_id, idx + 1);
  }
});

console.log(`Total Mapped Rows: ${mapData.length}`);
console.log(`Rows with position_flag: true: ${posFlagCount}`);
console.log(`Total Assertion Failures: ${failures.length}`);

if (failures.length > 0) {
  console.log('\n--- ALL FAILURES ---');
  failures.forEach(f => console.error(f));
  process.exit(1);
} else {
  console.log('ALL INTEGRITY AND CONSISTENCY ASSERTIONS PASSED WITH ZERO FAILURES!\n');
}

// Approved IDs verification
console.log('--- APPROVED IDS VERIFICATION ---');
const lautaro = leaguePlayerById.get('api-217');
const lautaroClub = lautaro ? clubById.get(lautaro.club_id) : null;
const nico = leaguePlayerById.get('api-183799');
const nicoClub = nico ? clubById.get(nico.club_id) : null;

assert(lautaro && lautaro.name === 'Lautaro Martínez' && lautaroClub.name === 'Inter', 'api-217 must be Lautaro at Inter');
console.log(`✓ api-217 verified: ${lautaro.name} at ${lautaroClub.name} (club_id: ${lautaro.club_id})`);

assert(nico && nico.name === 'Nico Williams' && nicoClub.name === 'Athletic Club', 'api-183799 must be Nico Williams at Athletic Club');
console.log(`✓ api-183799 verified: ${nico.name} at ${nicoClub.name} (club_id: ${nico.club_id})\n`);
