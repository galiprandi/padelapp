import { sql } from "drizzle-orm";
import { matches as matchesTable, turnPlayers } from "@/db/schema";

/**
 * SQL exists clause for checking if a user is a player in a match.
 * Uses the "matches" alias that Drizzle's Relational Query API assigns
 * to the outer query — must be referenced via raw SQL, not the Drizzle
 * `exists()` builder (which generates the wrong table reference).
 */
export const userInMatch = (userId: string) =>
  sql`exists (select 1 from "MatchPlayer" where "matchId" = "matches"."id" and "userId" = ${userId})`;

/**
 * SQL exists clause for checking if a user is enrolled in a turn.
 * Same alias caveat as userInMatch — "turns" is the Drizzle RQA alias.
 */
export const userInTurn = (userId: string) =>
  sql`exists (select 1 from "TurnPlayer" where "turnId" = "turns"."id" and "userId" = ${userId})`;

/**
 * SQL exists clause for checking if a user is in any of a list of matches.
 * Used for bulk "network" queries (e.g. all enrolled players in a turn).
 */
export const userInMatchFromList = (userIds: string[]) =>
  sql`exists (select 1 from "MatchPlayer" where "matchId" = "matches"."id" and "userId" in (${sql.join(
    userIds.map((id) => sql`${id}`),
    sql`, `,
  )}))`;

/**
 * SQL exists clause for matches that have at least one player with
 * null attendance (used by the "pending attendance" dashboard query).
 */
export const hasPlayerWithoutAttendance = () =>
  sql`exists (select 1 from "MatchPlayer" where "matchId" = "matches"."id" and "userId" is not null and "attendance" is null)`;

/**
 * SQL exists clause for the non-RQA (regular query builder) context.
 * Here we reference the actual column reference, not an alias.
 */
export const userInMatchByRef = (userId: string) =>
  sql`exists (select 1 from "MatchPlayer" where "matchId" = ${matchesTable.id} and "userId" = ${userId})`;

/**
 * SQL not-exists clause for checking if a user is NOT enrolled in a turn.
 */
export const userNotInTurn = (userId: string) =>
  sql`not exists (select 1 from "TurnPlayer" where "turnId" = "turns"."id" and "userId" = ${userId})`;

export const userIsSubstitute = (userId: string) =>
  sql`exists (select 1 from "TurnSubstitute" where "turnId" = "turns"."id" and "userId" = ${userId})`;
