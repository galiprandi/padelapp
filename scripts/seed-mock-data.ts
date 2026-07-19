import { db } from "@/db";
import {
  users,
  matches,
  matchPlayers,
  teams,
  playerEdges,
  playerGraphStats,
} from "@/db/schema";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// 20 players across 3 playing groups + 2 bridge players
// Group A (morning regulars): 1-7, community 0
// Group B (evening competitive): 8-14, community 1
// Group C (weekend social): 15-20, community 2
// Bridge players: mock-1 (plays A+B), mock-8 (plays B+C), mock-15 (plays A+C)
// ---------------------------------------------------------------------------

type PlayerDef = {
  id: string;
  name: string;
  alias: string;
  level: number;
  side: "RIGHT" | "LEFT";
  community: number;
};

const PLAYERS: PlayerDef[] = [
  // Group A — morning regulars (levels 5-7)
  { id: "p-01", name: "Agustín", alias: "agu", level: 7, side: "RIGHT", community: 0 },
  { id: "p-02", name: "Bruno", alias: "bru", level: 6, side: "LEFT", community: 0 },
  { id: "p-03", name: "Carlos", alias: "charly", level: 5, side: "RIGHT", community: 0 },
  { id: "p-04", name: "Diego", alias: "diego", level: 6, side: "LEFT", community: 0 },
  { id: "p-05", name: "Ezequiel", alias: "eze", level: 5, side: "RIGHT", community: 0 },
  { id: "p-06", name: "Federico", alias: "fede", level: 7, side: "LEFT", community: 0 },
  { id: "p-07", name: "Gonzalo", alias: "gonza", level: 4, side: "RIGHT", community: 0 },

  // Group B — evening competitive (levels 6-8)
  { id: "p-08", name: "Hernán", alias: "hernan", level: 8, side: "RIGHT", community: 1 },
  { id: "p-09", name: "Iván", alias: "ivan", level: 7, side: "LEFT", community: 1 },
  { id: "p-10", name: "Javier", alias: "javi", level: 6, side: "RIGHT", community: 1 },
  { id: "p-11", name: "Kevin", alias: "kevin", level: 7, side: "LEFT", community: 1 },
  { id: "p-12", name: "Lucas", alias: "lucas", level: 6, side: "RIGHT", community: 1 },
  { id: "p-13", name: "Martín", alias: "martin", level: 8, side: "LEFT", community: 1 },
  { id: "p-14", name: "Nicolás", alias: "nico", level: 5, side: "RIGHT", community: 1 },

  // Group C — weekend social (levels 3-6)
  { id: "p-15", name: "Octavio", alias: "octa", level: 6, side: "RIGHT", community: 2 },
  { id: "p-16", name: "Pablo", alias: "pablito", level: 4, side: "LEFT", community: 2 },
  { id: "p-17", name: "Quique", alias: "quique", level: 5, side: "RIGHT", community: 2 },
  { id: "p-18", name: "Rodrigo", alias: "rodrigo", level: 3, side: "LEFT", community: 2 },
  { id: "p-19", name: "Sergio", alias: "sergi", level: 5, side: "RIGHT", community: 2 },
  { id: "p-20", name: "Tomás", alias: "tomas", level: 4, side: "LEFT", community: 2 },
];

// ---------------------------------------------------------------------------
// Match definitions — 30 matches over 90 days
// Fixed partnerships within groups, cross-group matches for bridges
// ---------------------------------------------------------------------------

type MatchDef = {
  teamA: [string, string];
  teamB: [string, string];
  winner: "A" | "B";
  score: string;
  daysAgo: number;
};

const MATCHES: MatchDef[] = [
  // === Group A internal — Agustín+Bruno is the dominant pair ===
  { teamA: ["p-01", "p-02"], teamB: ["p-03", "p-04"], winner: "A", score: "6-3, 6-2", daysAgo: 85 },
  { teamA: ["p-01", "p-02"], teamB: ["p-05", "p-06"], winner: "A", score: "6-4, 7-5", daysAgo: 80 },
  { teamA: ["p-03", "p-04"], teamB: ["p-05", "p-07"], winner: "A", score: "6-2, 6-1", daysAgo: 78 },
  { teamA: ["p-01", "p-02"], teamB: ["p-03", "p-04"], winner: "A", score: "6-3, 6-4", daysAgo: 72 },
  { teamA: ["p-05", "p-06"], teamB: ["p-03", "p-07"], winner: "A", score: "7-6, 6-4", daysAgo: 68 },
  { teamA: ["p-01", "p-04"], teamB: ["p-02", "p-03"], winner: "B", score: "4-6, 6-3, 7-6", daysAgo: 60 },
  { teamA: ["p-01", "p-02"], teamB: ["p-05", "p-06"], winner: "A", score: "6-2, 6-3", daysAgo: 55 },
  { teamA: ["p-03", "p-04"], teamB: ["p-06", "p-07"], winner: "A", score: "6-4, 6-4", daysAgo: 45 },
  { teamA: ["p-01", "p-02"], teamB: ["p-04", "p-05"], winner: "A", score: "6-1, 6-2", daysAgo: 38 },
  { teamA: ["p-03", "p-06"], teamB: ["p-04", "p-07"], winner: "A", score: "7-5, 6-3", daysAgo: 25 },
  { teamA: ["p-01", "p-02"], teamB: ["p-03", "p-04"], winner: "B", score: "3-6, 6-4, 7-5", daysAgo: 12 },
  { teamA: ["p-05", "p-06"], teamB: ["p-01", "p-07"], winner: "A", score: "6-3, 6-2", daysAgo: 5 },

  // === Group B internal — Hernán+Martín dominant, Iván+Kevin challengers ===
  { teamA: ["p-08", "p-13"], teamB: ["p-09", "p-11"], winner: "A", score: "6-4, 6-3", daysAgo: 82 },
  { teamA: ["p-08", "p-13"], teamB: ["p-10", "p-12"], winner: "A", score: "6-2, 6-1", daysAgo: 75 },
  { teamA: ["p-09", "p-11"], teamB: ["p-10", "p-12"], winner: "A", score: "7-6, 6-4", daysAgo: 70 },
  { teamA: ["p-08", "p-13"], teamB: ["p-09", "p-11"], winner: "A", score: "6-3, 7-5", daysAgo: 62 },
  { teamA: ["p-10", "p-14"], teamB: ["p-12", "p-09"], winner: "B", score: "6-4, 4-6, 6-2", daysAgo: 50 },
  { teamA: ["p-08", "p-11"], teamB: ["p-09", "p-13"], winner: "B", score: "5-7, 4-6", daysAgo: 42 },
  { teamA: ["p-08", "p-13"], teamB: ["p-10", "p-14"], winner: "A", score: "6-1, 6-2", daysAgo: 35 },
  { teamA: ["p-09", "p-11"], teamB: ["p-10", "p-12"], winner: "A", score: "6-3, 6-4", daysAgo: 22 },
  { teamA: ["p-08", "p-13"], teamB: ["p-09", "p-11"], winner: "B", score: "6-7, 4-6", daysAgo: 8 },
  { teamA: ["p-10", "p-12"], teamB: ["p-11", "p-14"], winner: "A", score: "7-5, 6-3", daysAgo: 3 },

  // === Group C internal — Octavio+Quique vs Pablo+Tomás, social level ===
  { teamA: ["p-15", "p-17"], teamB: ["p-16", "p-20"], winner: "A", score: "6-2, 6-3", daysAgo: 65 },
  { teamA: ["p-15", "p-17"], teamB: ["p-18", "p-19"], winner: "A", score: "6-4, 6-1", daysAgo: 58 },
  { teamA: ["p-16", "p-19"], teamB: ["p-18", "p-20"], winner: "A", score: "7-5, 6-4", daysAgo: 48 },
  { teamA: ["p-15", "p-17"], teamB: ["p-16", "p-19"], winner: "B", score: "4-6, 6-7", daysAgo: 30 },
  { teamA: ["p-15", "p-20"], teamB: ["p-17", "p-18"], winner: "A", score: "6-3, 6-2", daysAgo: 18 },
  { teamA: ["p-16", "p-19"], teamB: ["p-15", "p-17"], winner: "A", score: "7-6, 6-4", daysAgo: 10 },

  // === Cross-group matches — bridge players connecting communities ===
  // Agustín (A) plays with Hernán (B) — bridge A↔B
  { teamA: ["p-01", "p-08"], teamB: ["p-02", "p-09"], winner: "A", score: "6-4, 7-5", daysAgo: 40 },
  { teamA: ["p-01", "p-09"], teamB: ["p-08", "p-02"], winner: "B", score: "3-6, 4-6", daysAgo: 20 },

  // Hernán (B) plays with Octavio (C) — bridge B↔C
  { teamA: ["p-08", "p-15"], teamB: ["p-13", "p-17"], winner: "A", score: "6-3, 6-2", daysAgo: 28 },
  { teamA: ["p-08", "p-15"], teamB: ["p-09", "p-16"], winner: "A", score: "6-1, 6-4", daysAgo: 15 },

  // Agustín (A) plays with Octavio (C) — bridge A↔C
  { teamA: ["p-01", "p-15"], teamB: ["p-02", "p-17"], winner: "A", score: "6-2, 6-3", daysAgo: 7 },
];

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function seed() {
  console.log("Seeding realistic mock data...");
  console.log(`  Players: ${PLAYERS.length}`);
  console.log(`  Matches: ${MATCHES.length}`);

  // Insert users
  for (const p of PLAYERS) {
    await db
      .insert(users)
      .values({
        id: p.id,
        displayName: p.name,
        alias: p.alias,
        email: `${p.alias}@mock.test`,
        image: null,
        level: p.level,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        rankingScore: 1000 + (p.level - 5) * 50,
        attendanceScore: 0.9 + Math.random() * 0.1,
      })
      .onConflictDoNothing();
  }

  // Track match counts per player
  const matchCount = new Map<string, number>();
  const winCount = new Map<string, number>();
  const lastMatchDate = new Map<string, Date>();

  // Insert matches
  for (let i = 0; i < MATCHES.length; i++) {
    const m = MATCHES[i];
    const matchId = `m-${String(i + 1).padStart(3, "0")}`;
    const date = daysAgo(m.daysAgo);
    const teamAId = `${matchId}-a`;
    const teamBId = `${matchId}-b`;

    await db.insert(teams).values({ id: teamAId, label: "A" }).onConflictDoNothing();
    await db.insert(teams).values({ id: teamBId, label: "B" }).onConflictDoNothing();

    await db
      .insert(matches)
      .values({
        id: matchId,
        creatorId: m.teamA[0],
        status: "CONFIRMED",
        date,
        sets: 2,
        matchType: "FRIENDLY",
        club: "Padel Club",
        score: m.score,
      })
      .onConflictDoNothing();

    // Insert players with positions
    let pos = 0;
    for (const pid of [...m.teamA, ...m.teamB]) {
      const teamId = m.teamA.includes(pid) ? teamAId : teamBId;
      const player = PLAYERS.find((p) => p.id === pid)!;
      await db
        .insert(matchPlayers)
        .values({
          matchId,
          userId: pid,
          position: pos,
          resultConfirmed: true,
          teamId,
          side: player.side,
          attendance: "ATTENDED",
        })
        .onConflictDoNothing();
      pos++;

      // Track stats
      matchCount.set(pid, (matchCount.get(pid) ?? 0) + 1);
      const isTeamA = m.teamA.includes(pid);
      const won = (isTeamA && m.winner === "A") || (!isTeamA && m.winner === "B");
      if (won) winCount.set(pid, (winCount.get(pid) ?? 0) + 1);
      const existingDate = lastMatchDate.get(pid);
      if (!existingDate || date > existingDate) lastMatchDate.set(pid, date);
    }

    // Update edges — rivalries (cross-team) and partnerships (same-team)
    const teamAWon = m.winner === "A";
    const teamBWon = m.winner === "B";

    // Rivalry edges: every player in A vs every player in B
    for (const a of m.teamA) {
      for (const b of m.teamB) {
        const [min, max] = a < b ? [a, b] : [b, a];
        const isMinA = min === a;
        await upsertEdge(min, max, {
          rival: 1,
          partner: 0,
          winsA: isMinA ? (teamAWon ? 1 : 0) : teamBWon ? 1 : 0,
          winsB: isMinA ? (teamBWon ? 1 : 0) : teamAWon ? 1 : 0,
          winsTogether: 0,
          lossesTogether: 0,
        }, date);
      }
    }

    // Partnership edges: the two players on the same team
    for (const team of [m.teamA, m.teamB] as [string, string][]) {
      const teamWon = team === m.teamA ? teamAWon : teamBWon;
      const [p1, p2] = team;
      const [min, max] = p1 < p2 ? [p1, p2] : [p2, p1];
      await upsertEdge(min, max, {
        rival: 0,
        partner: 1,
        winsA: 0,
        winsB: 0,
        winsTogether: teamWon ? 1 : 0,
        lossesTogether: teamWon ? 0 : 1,
      }, date);
    }
  }

  // Update user stats
  for (const p of PLAYERS) {
    const played = matchCount.get(p.id) ?? 0;
    const wins = winCount.get(p.id) ?? 0;
    await db
      .update(users)
      .set({
        matchesPlayed: played,
        wins,
        losses: played - wins,
        lastMatchAt: lastMatchDate.get(p.id) ?? null,
        rankingScore: 1000 + wins * 15 + (p.level - 5) * 30,
      })
      .where(eq(users.id, p.id));
  }

  // Compute graph stats
  const edges = await db.select().from(playerEdges);
  const playerIds = new Set<string>();
  for (const e of edges) {
    playerIds.add(e.playerAId);
    playerIds.add(e.playerBId);
  }

  for (const pid of playerIds) {
    const player = PLAYERS.find((p) => p.id === pid);
    const networkSize = edges.filter(
      (e) => e.playerAId === pid || e.playerBId === pid,
    ).length;

    // Skill score from win rate
    const myEdges = edges.filter(
      (e) => e.playerAId === pid || e.playerBId === pid,
    );
    let totalRivals = 0;
    let totalWins = 0;
    for (const e of myEdges) {
      if (e.playerAId === pid) {
        totalRivals += e.matchesAsRivals;
        totalWins += e.winsA;
      } else {
        totalRivals += e.matchesAsRivals;
        totalWins += e.winsB;
      }
    }
    const skillScore =
      1000 + (totalRivals > 0 ? (totalWins / totalRivals - 0.5) * 200 : 0);

    await db
      .insert(playerGraphStats)
      .values({
        userId: pid,
        skillScore: Math.round(skillScore),
        community: player?.community ?? 0,
        networkSize,
        preferredSide: player?.side ?? null,
        winRateRight: player?.side === "RIGHT" ? 0.55 + Math.random() * 0.2 : null,
        winRateLeft: player?.side === "LEFT" ? 0.5 + Math.random() * 0.2 : null,
      })
      .onConflictDoUpdate({
        target: playerGraphStats.userId,
        set: {
          skillScore: Math.round(skillScore),
          community: player?.community ?? 0,
          networkSize,
          preferredSide: player?.side ?? null,
        },
      });
  }

  console.log("Done!");
  console.log(`  Edges: ${edges.length}`);
  console.log(`  Players with stats: ${playerIds.size}`);

  // Print summary
  for (const p of PLAYERS) {
    const played = matchCount.get(p.id) ?? 0;
    const wins = winCount.get(p.id) ?? 0;
    const net = edges.filter(
      (e) => e.playerAId === p.id || e.playerBId === p.id,
    ).length;
    console.log(
      `  ${p.alias.padEnd(10)} ${played}P ${wins}W  net=${net}  grp=${p.community}`,
    );
  }
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function upsertEdge(
  playerAId: string,
  playerBId: string,
  deltas: {
    rival: number;
    partner: number;
    winsA: number;
    winsB: number;
    winsTogether: number;
    lossesTogether: number;
  },
  matchDate: Date,
) {
  const existing = await db
    .select()
    .from(playerEdges)
    .where(
      eq(playerEdges.playerAId, playerAId) &&
        eq(playerEdges.playerBId, playerBId),
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(playerEdges)
      .set({
        matchesAsRivals: existing[0].matchesAsRivals + deltas.rival,
        matchesAsPartners: existing[0].matchesAsPartners + deltas.partner,
        winsA: existing[0].winsA + deltas.winsA,
        winsB: existing[0].winsB + deltas.winsB,
        winsTogether: existing[0].winsTogether + deltas.winsTogether,
        lossesTogether: existing[0].lossesTogether + deltas.lossesTogether,
        lastMatchAt: matchDate,
        updatedAt: new Date(),
      })
      .where(eq(playerEdges.id, existing[0].id));
  } else {
    await db.insert(playerEdges).values({
      playerAId,
      playerBId,
      matchesAsRivals: deltas.rival,
      matchesAsPartners: deltas.partner,
      winsA: deltas.winsA,
      winsB: deltas.winsB,
      winsTogether: deltas.winsTogether,
      lossesTogether: deltas.lossesTogether,
      lastMatchAt: matchDate,
    });
  }
}

seed().catch(console.error);
