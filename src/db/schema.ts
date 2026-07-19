import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// TIMESTAMP(3) helper — matches Prisma's default precision
// ---------------------------------------------------------------------------

const timestamptz3 = (name: string) =>
  timestamp(name, { precision: 3, mode: "date" });

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const turnStatusEnum = pgEnum("TurnStatus", [
  "OPEN",
  "FULL",
  "CANCELLED",
  "COMPLETED",
]);

export const matchStatusEnum = pgEnum("MatchStatus", [
  "PENDING",
  "CONFIRMED",
  "DISPUTED",
  "CANCELLED",
]);

export const matchTypeEnum = pgEnum("MatchType", [
  "FRIENDLY",
  "LOCAL_TOURNAMENT",
]);

export const attendanceStatusEnum = pgEnum("AttendanceStatus", [
  "ATTENDED",
  "LATE",
  "NO_SHOW",
]);

export const sideEnum = pgEnum("PlayerSide", ["RIGHT", "LEFT"]);

export const feedbackEnum = pgEnum("FeedbackType", ["STRONGER", "WEAKER"]);

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const users = pgTable("User", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  displayName: text("displayName").notNull(),
  alias: text("alias"),
  email: text("email").notNull().unique(),
  image: text("image"),
  level: integer("level").notNull().default(6),
  emailVerified: timestamptz3("emailVerified"),
  createdAt: timestamptz3("createdAt").notNull().defaultNow(),
  updatedAt: timestamptz3("updatedAt")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
  attendanceScore: doublePrecision("attendanceScore").notNull().default(1.0),
  lastMatchAt: timestamptz3("lastMatchAt"),
  losses: integer("losses").notNull().default(0),
  matchesPlayed: integer("matchesPlayed").notNull().default(0),
  rankingDelta: integer("rankingDelta").notNull().default(0),
  rankingPosition: integer("rankingPosition"),
  rankingScore: doublePrecision("rankingScore").notNull().default(1000),
  wins: integer("wins").notNull().default(0),
});

export const accounts = pgTable(
  "Account",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    accountProviderProviderAccountUnique: unique(
      "Account_provider_providerAccountId_key",
    ).on(table.provider, table.providerAccountId),
  }),
);

export const sessions = pgTable("Session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionToken: text("sessionToken").notNull().unique(),
  userId: text("userId").notNull(),
  expires: timestamptz3("expires").notNull(),
});

export const verificationTokens = pgTable(
  "VerificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamptz3("expires").notNull(),
  },
  (table) => ({
    verificationTokenIdentifierTokenUnique: unique(
      "VerificationToken_identifier_token_key",
    ).on(table.identifier, table.token),
  }),
);

export const matches = pgTable("Match", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  creatorId: text("creatorId").notNull(),
  status: matchStatusEnum("status").notNull().default("PENDING"),
  date: timestamptz3("date").notNull().defaultNow(),
  sets: integer("sets").notNull().default(2),
  matchType: matchTypeEnum("matchType").notNull().default("FRIENDLY"),
  club: text("club"),
  courtNumber: text("courtNumber"),
  score: text("score"),
  notes: text("notes"),
  createdAt: timestamptz3("createdAt").notNull().defaultNow(),
  updatedAt: timestamptz3("updatedAt")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
  turnId: text("turnId"),
});

export const turns = pgTable("Turn", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  creatorId: text("creatorId").notNull(),
  club: text("club").notNull(),
  date: timestamptz3("date").notNull(),
  duration: integer("duration").notNull().default(90),
  maxPlayers: integer("maxPlayers").notNull().default(4),
  suggestedLevel: integer("suggestedLevel").notNull().default(6),
  notes: text("notes"),
  status: turnStatusEnum("status").notNull().default("OPEN"),
  lastNetworkNotificationAt: timestamptz3("lastNetworkNotificationAt"),
  createdAt: timestamptz3("createdAt").notNull().defaultNow(),
  updatedAt: timestamptz3("updatedAt")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const turnPlayers = pgTable(
  "TurnPlayer",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    turnId: text("turnId").notNull(),
    userId: text("userId").notNull(),
    joinedAt: timestamptz3("joinedAt").notNull().defaultNow(),
  },
  (table) => ({
    turnPlayerTurnIdUserIdUnique: unique("TurnPlayer_turnId_userId_key").on(
      table.turnId,
      table.userId,
    ),
  }),
);

export const turnSubstitutes = pgTable(
  "TurnSubstitute",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    turnId: text("turnId").notNull(),
    userId: text("userId").notNull(),
    joinedAt: timestamptz3("joinedAt").notNull().defaultNow(),
  },
  (table) => ({
    turnSubstituteTurnIdUserIdUnique: unique(
      "TurnSubstitute_turnId_userId_key",
    ).on(table.turnId, table.userId),
  }),
);

export const teams = pgTable("Team", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  label: text("label").notNull(),
  createdAt: timestamptz3("createdAt").notNull().defaultNow(),
  updatedAt: timestamptz3("updatedAt")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const matchPlayers = pgTable(
  "MatchPlayer",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    matchId: text("matchId").notNull(),
    userId: text("userId"),
    position: integer("position").notNull(),
    resultConfirmed: boolean("resultConfirmed").notNull().default(false),
    displayName: text("displayName"),
    teamId: text("teamId"),
    joinedAt: timestamptz3("joinedAt"),
    attendance: attendanceStatusEnum("attendance"),
    attendanceBy: text("attendanceBy"),
    attendanceAt: timestamptz3("attendanceAt"),
    side: sideEnum("side"),
    createdAt: timestamptz3("createdAt").notNull().defaultNow(),
    updatedAt: timestamptz3("updatedAt")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    matchPlayerMatchIdPositionUnique: unique(
      "MatchPlayer_matchId_position_key",
    ).on(table.matchId, table.position),
    matchPlayerMatchIdUserIdUnique: unique("MatchPlayer_matchId_userId_key").on(
      table.matchId,
      table.userId,
    ),
  }),
);

// ---------------------------------------------------------------------------
// Player Graph — edges, stats, and feedback
// ---------------------------------------------------------------------------

export const playerEdges = pgTable(
  "PlayerEdge",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    playerAId: text("playerAId").notNull(),
    playerBId: text("playerBId").notNull(),
    matchesAsRivals: integer("matchesAsRivals").notNull().default(0),
    matchesAsPartners: integer("matchesAsPartners").notNull().default(0),
    winsA: integer("winsA").notNull().default(0),
    winsB: integer("winsB").notNull().default(0),
    winsTogether: integer("winsTogether").notNull().default(0),
    lossesTogether: integer("lossesTogether").notNull().default(0),
    lastMatchAt: timestamptz3("lastMatchAt"),
    createdAt: timestamptz3("createdAt").notNull().defaultNow(),
    updatedAt: timestamptz3("updatedAt")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    playerEdgeUnique: unique("PlayerEdge_playerA_playerB_key").on(
      table.playerAId,
      table.playerBId,
    ),
  }),
);

export const playerGraphStats = pgTable("PlayerGraphStats", {
  userId: text("userId").primaryKey(),
  skillScore: doublePrecision("skillScore").notNull().default(1000),
  community: integer("community"),
  networkSize: integer("networkSize").notNull().default(0),
  preferredSide: sideEnum("preferredSide"),
  winRateRight: doublePrecision("winRateRight"),
  winRateLeft: doublePrecision("winRateLeft"),
  updatedAt: timestamptz3("updatedAt")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const matchPlayerFeedback = pgTable(
  "MatchPlayerFeedback",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    matchId: text("matchId").notNull(),
    playerId: text("playerId").notNull(),
    feedbackBy: text("feedbackBy").notNull(),
    feedback: feedbackEnum("feedback").notNull(),
    createdAt: timestamptz3("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    matchPlayerFeedbackUnique: unique(
      "MatchPlayerFeedback_match_player_by_key",
    ).on(table.matchId, table.playerId, table.feedbackBy),
  }),
);

export const pushSubscriptions = pgTable(
  "PushSubscription",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    endpoint: text("endpoint").notNull(),
    keys: json("keys").notNull(),
    createdAt: timestamptz3("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    pushSubscriptionUserIdEndpointUnique: unique(
      "PushSubscription_userId_endpoint_key",
    ).on(table.userId, table.endpoint),
  }),
);

// ---------------------------------------------------------------------------
// Passkey Credentials (WebAuthn)
// ---------------------------------------------------------------------------

export const passkeyCredentials = pgTable("PasskeyCredential", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(),
  credentialId: text("credentialId").notNull().unique(),
  publicKey: json("publicKey").notNull(),
  counter: integer("counter").notNull().default(0),
  transports: json("transports"),
  deviceType: text("deviceType"),
  backedUp: boolean("backedUp").notNull().default(false),
  nickname: text("nickname"),
  createdAt: timestamptz3("createdAt").notNull().defaultNow(),
  updatedAt: timestamptz3("updatedAt")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// Relations (for Drizzle's query API — db.query.X.findMany with `with`)
// ---------------------------------------------------------------------------

export const userRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  matches: many(matches, { relationName: "MatchCreator" }),
  matchPlayers: many(matchPlayers),
  passkeyCredentials: many(passkeyCredentials),
  pushSubscriptions: many(pushSubscriptions),
  sessions: many(sessions),
  turnsCreated: many(turns, { relationName: "TurnCreator" }),
  turnPlayers: many(turnPlayers),
  turnSubstitutes: many(turnSubstitutes),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const matchRelations = relations(matches, ({ one, many }) => ({
  creator: one(users, {
    fields: [matches.creatorId],
    references: [users.id],
    relationName: "MatchCreator",
  }),
  turn: one(turns, {
    fields: [matches.turnId],
    references: [turns.id],
  }),
  players: many(matchPlayers),
}));

export const turnRelations = relations(turns, ({ one, many }) => ({
  creator: one(users, {
    fields: [turns.creatorId],
    references: [users.id],
    relationName: "TurnCreator",
  }),
  matches: many(matches),
  players: many(turnPlayers),
  substitutes: many(turnSubstitutes),
}));

export const turnPlayerRelations = relations(turnPlayers, ({ one }) => ({
  turn: one(turns, {
    fields: [turnPlayers.turnId],
    references: [turns.id],
  }),
  user: one(users, {
    fields: [turnPlayers.userId],
    references: [users.id],
  }),
}));

export const turnSubstituteRelations = relations(
  turnSubstitutes,
  ({ one }) => ({
    turn: one(turns, {
      fields: [turnSubstitutes.turnId],
      references: [turns.id],
    }),
    user: one(users, {
      fields: [turnSubstitutes.userId],
      references: [users.id],
    }),
  }),
);

export const matchPlayerRelations = relations(matchPlayers, ({ one }) => ({
  match: one(matches, {
    fields: [matchPlayers.matchId],
    references: [matches.id],
  }),
  team: one(teams, {
    fields: [matchPlayers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [matchPlayers.userId],
    references: [users.id],
  }),
}));

export const teamRelations = relations(teams, ({ many }) => ({
  matchPlayers: many(matchPlayers),
}));

export const pushSubscriptionRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  }),
);

export const passkeyCredentialRelations = relations(
  passkeyCredentials,
  ({ one }) => ({
    user: one(users, {
      fields: [passkeyCredentials.userId],
      references: [users.id],
    }),
  }),
);

export const playerEdgeRelations = relations(playerEdges, ({ one }) => ({
  playerA: one(users, {
    fields: [playerEdges.playerAId],
    references: [users.id],
    relationName: "PlayerEdgeA",
  }),
  playerB: one(users, {
    fields: [playerEdges.playerBId],
    references: [users.id],
    relationName: "PlayerEdgeB",
  }),
}));

export const playerGraphStatsRelations = relations(
  playerGraphStats,
  ({ one }) => ({
    user: one(users, {
      fields: [playerGraphStats.userId],
      references: [users.id],
    }),
  }),
);

export const matchPlayerFeedbackRelations = relations(
  matchPlayerFeedback,
  ({ one }) => ({
    match: one(matches, {
      fields: [matchPlayerFeedback.matchId],
      references: [matches.id],
    }),
    player: one(users, {
      fields: [matchPlayerFeedback.playerId],
      references: [users.id],
      relationName: "FeedbackPlayer",
    }),
    feedbackByUser: one(users, {
      fields: [matchPlayerFeedback.feedbackBy],
      references: [users.id],
      relationName: "FeedbackBy",
    }),
  }),
);

// ---------------------------------------------------------------------------
// Type exports
// ---------------------------------------------------------------------------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type Turn = typeof turns.$inferSelect;
export type NewTurn = typeof turns.$inferInsert;
export type TurnPlayer = typeof turnPlayers.$inferSelect;
export type NewTurnPlayer = typeof turnPlayers.$inferInsert;
export type TurnSubstitute = typeof turnSubstitutes.$inferSelect;
export type NewTurnSubstitute = typeof turnSubstitutes.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type MatchPlayer = typeof matchPlayers.$inferSelect;
export type NewMatchPlayer = typeof matchPlayers.$inferInsert;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
export type PlayerEdge = typeof playerEdges.$inferSelect;
export type NewPlayerEdge = typeof playerEdges.$inferInsert;
export type PlayerGraphStats = typeof playerGraphStats.$inferSelect;
export type NewPlayerGraphStats = typeof playerGraphStats.$inferInsert;
export type MatchPlayerFeedback = typeof matchPlayerFeedback.$inferSelect;
export type NewMatchPlayerFeedback = typeof matchPlayerFeedback.$inferInsert;
export type PasskeyCredential = typeof passkeyCredentials.$inferSelect;
export type NewPasskeyCredential = typeof passkeyCredentials.$inferInsert;
