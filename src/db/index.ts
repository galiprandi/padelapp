import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { neonConfig, Pool as NeonPool } from "@neondatabase/serverless";
import ws from "ws";

import * as schema from "./schema";

// Neon serverless driver requires a WebSocket constructor in Node.js.
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL!;

/**
 * Database client.
 *
 * - Local development: uses `pg` (node-postgres) over TCP against the Docker
 *   PostgreSQL instance.
 * - Production (Vercel + Neon): uses `@neondatabase/serverless` over
 *   WebSockets for optimal serverless cold starts and to avoid connection-pool
 *   issues that Prisma suffers from in serverless environments.
 *
 * The selection is driven by `USE_NEON_DRIVER=true`. In production on Vercel
 * this env var is set; in local dev it is absent so we fall back to `pg`.
 */
const useNeonDriver = process.env.USE_NEON_DRIVER === "true";

export const db = useNeonDriver
  ? drizzleNeon(
      new NeonPool({ connectionString: DATABASE_URL }),
      { schema },
    )
  : drizzlePg(
      new Pool({ connectionString: DATABASE_URL }),
      { schema },
    );

export type Database = typeof db;
