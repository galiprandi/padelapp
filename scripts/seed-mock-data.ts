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

const MOCK_USERS = [
  {
    id: "mock-1",
    displayName: "Coello",
    alias: "coello",
    email: "coello@mock.test",
    image: null,
    level: 7,
  },
  {
    id: "mock-2",
    displayName: "Tapia",
    alias: "tapia",
    email: "tapia@mock.test",
    image: null,
    level: 6,
  },
  {
    id: "mock-3",
    displayName: "Chingotto",
    alias: "chingotto",
    email: "chingotto@mock.test",
    image: null,
    level: 5,
  },
  {
    id: "mock-4",
    displayName: "Galan",
    alias: "galan",
    email: "galan@mock.test",
    image: null,
    level: 8,
  },
  {
    id: "mock-5",
    displayName: "Lebron",
    alias: "lebron",
    email: "lebron@mock.test",
    image: null,
    level: 7,
  },
  {
    id: "mock-6",
    displayName: "Stupa",
    alias: "stupa",
    email: "stupa@mock.test",
    image: null,
    level: 6,
  },
  {
    id: "mock-7",
    displayName: "Di Nenno",
    alias: "dinennno",
    email: "dinennno@mock.test",
    image: null,
    level: 5,
  },
  {
    id: "mock-8",
    displayName: "Navarro",
    alias: "navarro",
    email: "navarro@mock.test",
    image: null,
    level: 7,
  },
  {
    id: "mock-9",
    displayName: "Paquito",
    alias: "paquito",
    email: "paquito@mock.test",
    image: null,
    level: 6,
  },
  {
    id: "mock-10",
    displayName: "Tello",
    alias: "tello",
    email: "tello@mock.test",
    image: null,
    level: 5,
  },
  {
    id: "mock-11",
    displayName: "Belasteguin",
    alias: "bela",
    email: "bela@mock.test",
    image: null,
    level: 8,
  },
  {
    id: "mock-12",
    displayName: "Lamperti",
    alias: "lamperti",
    email: "lamperti@mock.test",
    image: null,
    level: 6,
  },
];

async function seed() {
  console.log("Seeding mock data...");

  // Insert users
  for (const u of MOCK_USERS) {
    await db
      .insert(users)
      .values({
        id: u.id,
        displayName: u.displayName,
        alias: u.alias,
        email: u.email,
        image: u.image,
        level: u.level,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        rankingScore: 1000,
        attendanceScore: 1,
      })
      .onConflictDoNothing();
  }

  // Create 8 matches with different pairings and results
  type MatchConfig = {
    id: string;
    date: Date;
    score: string;
    winner: "A" | "B";
    teamA: string[];
    teamB: string[];
    sides: Record<string, "RIGHT" | "LEFT">;
  };

  const matchConfigs: MatchConfig[] = [
    {
      id: "mock-match-1",
      date: daysAgo(30),
      score: "6-4, 6-3",
      winner: "A",
      teamA: ["mock-1", "mock-2"],
      teamB: ["mock-3", "mock-4"],
      sides: {
        "mock-1": "RIGHT",
        "mock-2": "LEFT",
        "mock-3": "RIGHT",
        "mock-4": "LEFT",
      } as Record<string, "RIGHT" | "LEFT">,
    },
    {
      id: "mock-match-2",
      date: daysAgo(28),
      score: "6-2, 6-1",
      winner: "A",
      teamA: ["mock-1", "mock-2"],
      teamB: ["mock-5", "mock-6"],
      sides: {
        "mock-1": "RIGHT",
        "mock-2": "LEFT",
        "mock-5": "RIGHT",
        "mock-6": "LEFT",
      } as Record<string, "RIGHT" | "LEFT">,
    },
    {
      id: "mock-match-3",
      date: daysAgo(25),
      score: "7-5, 6-4",
      winner: "B",
      teamA: ["mock-1", "mock-3"],
      teamB: ["mock-5", "mock-7"],
      sides: {
        "mock-1": "RIGHT",
        "mock-3": "LEFT",
        "mock-5": "RIGHT",
        "mock-7": "LEFT",
      } as Record<string, "RIGHT" | "LEFT">,
    },
    {
      id: "mock-match-4",
      date: daysAgo(20),
      score: "6-3, 6-7, 7-6",
      winner: "A",
      teamA: ["mock-4", "mock-8"],
      teamB: ["mock-1", "mock-9"],
      sides: {
        "mock-4": "RIGHT",
        "mock-8": "LEFT",
        "mock-1": "RIGHT",
        "mock-9": "LEFT",
      } as Record<string, "RIGHT" | "LEFT">,
    },
    {
      id: "mock-match-5",
      date: daysAgo(18),
      score: "6-4, 4-6, 6-2",
      winner: "B",
      teamA: ["mock-2", "mock-6"],
      teamB: ["mock-4", "mock-10"],
      sides: {
        "mock-2": "RIGHT",
        "mock-6": "LEFT",
        "mock-4": "RIGHT",
        "mock-10": "LEFT",
      } as Record<string, "RIGHT" | "LEFT">,
    },
    {
      id: "mock-match-6",
      date: daysAgo(15),
      score: "6-1, 6-2",
      winner: "A",
      teamA: ["mock-11", "mock-12"],
      teamB: ["mock-7", "mock-10"],
      sides: {
        "mock-11": "RIGHT",
        "mock-12": "LEFT",
        "mock-7": "RIGHT",
        "mock-10": "LEFT",
      } as Record<string, "RIGHT" | "LEFT">,
    },
    {
      id: "mock-match-7",
      date: daysAgo(10),
      score: "6-3, 6-4",
      winner: "A",
      teamA: ["mock-11", "mock-12"],
      teamB: ["mock-3", "mock-6"],
      sides: {
        "mock-11": "RIGHT",
        "mock-12": "LEFT",
        "mock-3": "RIGHT",
        "mock-6": "LEFT",
      } as Record<string, "RIGHT" | "LEFT">,
    },
    {
      id: "mock-match-8",
      date: daysAgo(5),
      score: "7-6, 6-4",
      winner: "B",
      teamA: ["mock-8", "mock-9"],
      teamB: ["mock-11", "mock-1"],
      sides: {
        "mock-8": "RIGHT",
        "mock-9": "LEFT",
        "mock-11": "RIGHT",
        "mock-1": "LEFT",
      } as Record<string, "RIGHT" | "LEFT">,
    },
  ];

  for (const mc of matchConfigs) {
    // Create teams
    const teamAId = `${mc.id}-team-a`;
    const teamBId = `${mc.id}-team-b`;

    await db
      .insert(teams)
      .values({ id: teamAId, label: "Equipo A" })
      .onConflictDoNothing();
    await db
      .insert(teams)
      .values({ id: teamBId, label: "Equipo B" })
      .onConflictDoNothing();

    // Create match
    await db
      .insert(matches)
      .values({
        id: mc.id,
        creatorId: mc.teamA[0],
        status: "CONFIRMED",
        date: mc.date,
        sets: 2,
        matchType: "FRIENDLY",
        club: "Padel Club",
        score: mc.score,
      })
      .onConflictDoNothing();

    // Insert players
    let position = 0;
    for (const playerId of mc.teamA) {
      await db
        .insert(matchPlayers)
        .values({
          matchId: mc.id,
          userId: playerId,
          position,
          resultConfirmed: true,
          teamId: teamAId,
          side: mc.sides[playerId] ?? null,
          attendance: "ATTENDED",
        })
        .onConflictDoNothing();
      position++;
    }
    for (const playerId of mc.teamB) {
      await db
        .insert(matchPlayers)
        .values({
          matchId: mc.id,
          userId: playerId,
          position,
          resultConfirmed: true,
          teamId: teamBId,
          side: mc.sides[playerId] ?? null,
          attendance: "ATTENDED",
        })
        .onConflictDoNothing();
      position++;
    }

    // Update edges
    const teamAWon = mc.winner === "A";
    const teamBWon = mc.winner === "B";

    // Rivalry edges
    for (const a of mc.teamA) {
      for (const b of mc.teamB) {
        const [min, max] = a < b ? [a, b] : [b, a];
        const isMinA = min === a;
        await upsertEdge(
          min,
          max,
          {
            rival: 1,
            partner: 0,
            winsA: isMinA ? (teamAWon ? 1 : 0) : teamBWon ? 1 : 0,
            winsB: isMinA ? (teamBWon ? 1 : 0) : teamAWon ? 1 : 0,
            winsTogether: 0,
            lossesTogether: 0,
          },
          mc.date,
        );
      }
    }

    // Partnership edges
    for (const team of [mc.teamA, mc.teamB]) {
      const teamWon = team === mc.teamA ? teamAWon : teamBWon;
      const [p1, p2] = team;
      const [min, max] = p1 < p2 ? [p1, p2] : [p2, p1];
      await upsertEdge(
        min,
        max,
        {
          rival: 0,
          partner: 1,
          winsA: 0,
          winsB: 0,
          winsTogether: teamWon ? 1 : 0,
          lossesTogether: teamWon ? 0 : 1,
        },
        mc.date,
      );
    }
  }

  // Update user match counts
  for (const u of MOCK_USERS) {
    const userMatches = matchConfigs.filter(
      (mc) => mc.teamA.includes(u.id) || mc.teamB.includes(u.id),
    );
    const wins = userMatches.filter((mc) => {
      const inTeamA = mc.teamA.includes(u.id);
      return (inTeamA && mc.winner === "A") || (!inTeamA && mc.winner === "B");
    }).length;

    await db
      .update(users)
      .set({
        matchesPlayed: userMatches.length,
        wins,
        losses: userMatches.length - wins,
        lastMatchAt: userMatches[0]?.date ?? null,
      })
      .where(eq(users.id, u.id));
  }

  // Compute and insert graph stats
  const edges = await db.select().from(playerEdges);
  const playerIds = new Set<string>();
  for (const e of edges) {
    playerIds.add(e.playerAId);
    playerIds.add(e.playerBId);
  }

  for (const playerId of playerIds) {
    const networkSize = edges.filter(
      (e) => e.playerAId === playerId || e.playerBId === playerId,
    ).length;

    // Simple skill score based on win rate
    const playerEdges_ = edges.filter(
      (e) => e.playerAId === playerId || e.playerBId === playerId,
    );
    let totalRivals = 0;
    let totalWins = 0;
    for (const e of playerEdges_) {
      if (e.playerAId === playerId) {
        totalRivals += e.matchesAsRivals;
        totalWins += e.winsA;
      } else {
        totalRivals += e.matchesAsRivals;
        totalWins += e.winsB;
      }
    }
    const skillScore =
      1000 + (totalRivals > 0 ? (totalWins / totalRivals - 0.5) * 200 : 0);

    // Determine preferred side
    const playerMatches = matchConfigs.filter(
      (mc) => mc.teamA.includes(playerId) || mc.teamB.includes(playerId),
    );
    const rightCount = playerMatches.filter(
      (mc) => mc.sides[playerId] === "RIGHT",
    ).length;
    const leftCount = playerMatches.filter(
      (mc) => mc.sides[playerId] === "LEFT",
    ).length;
    const preferredSide =
      rightCount > leftCount ? "RIGHT" : leftCount > rightCount ? "LEFT" : null;

    // Simple community: cluster by who plays with whom most
    const community = Math.floor(parseInt(playerId.split("-")[1]) / 4);

    await db
      .insert(playerGraphStats)
      .values({
        userId: playerId,
        skillScore: Math.round(skillScore),
        community,
        networkSize,
        preferredSide,
        winRateRight: rightCount > 0 ? 0.6 : null,
        winRateLeft: leftCount > 0 ? 0.5 : null,
      })
      .onConflictDoUpdate({
        target: playerGraphStats.userId,
        set: {
          skillScore: Math.round(skillScore),
          community,
          networkSize,
          preferredSide,
          winRateRight: rightCount > 0 ? 0.6 : null,
          winRateLeft: leftCount > 0 ? 0.5 : null,
        },
      });
  }

  console.log("Mock data seeded successfully!");
  console.log(`  - ${MOCK_USERS.length} users`);
  console.log(`  - ${matchConfigs.length} confirmed matches`);
  console.log(`  - ${edges.length} player edges`);
  console.log(`  - ${playerIds.size} players with graph stats`);
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
