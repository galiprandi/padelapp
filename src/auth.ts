import NextAuth, { type Session } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import Google, { type GoogleProfile } from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

type AdapterUserWithAlias = AdapterUser & { alias?: string | null };

// Keys whose values must never leak into log output. They tend to appear in
// adapter args (e.g. sessionToken, verificationTokens.token, passwords, OAuth
// access/refresh tokens). Matched case-insensitive and against the last path
// segment so we cover both top-level and nested keys.
const SENSITIVE_KEYS = new Set([
  "sessiontoken",
  "token",
  "verificationtoken",
  "password",
  "secret",
  "accesstoken",
  "refreshtoken",
  "idtoken",
]);

function maskSensitive(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(maskSensitive);
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(k.toLowerCase())) {
        result[k] = "[REDACTED]";
      } else {
        result[k] = maskSensitive(v);
      }
    }
    return result;
  }
  return value;
}

function resolveDisplayName(profile: GoogleProfile): string {
  const trimmedName = profile.name?.trim() || profile.given_name?.trim();
  if (trimmedName && trimmedName.length > 0) {
    return trimmedName;
  }

  const emailUser = profile.email?.split("@")[0];
  return emailUser && emailUser.length > 0 ? emailUser : "Jugador";
}

const rawAdapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
} as any);

const loggedAdapter = new Proxy(rawAdapter, {
  get(target, prop) {
    const original = (target as any)[prop];
    if (typeof original !== "function") return original;
    return async (...args: any[]) => {
      try {
        return await original.apply(target, args);
      } catch (error) {
        const safeArgs = maskSensitive(args);
        console.error(`[auth][adapter] ${String(prop)} failed:`, {
          error: error instanceof Error ? error.message : String(error),
          cause: error instanceof Error ? error.cause : undefined,
          stack: error instanceof Error ? error.stack : undefined,
          args: JSON.stringify(safeArgs, (_k, v) =>
            typeof v === "string" && v.length > 100
              ? v.slice(0, 100) + "..."
              : v,
          ),
        });
        throw error;
      }
    };
  },
});

const {
  handlers,
  auth: _auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: loggedAdapter,
  session: { strategy: "database" },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile: GoogleProfile) {
        const displayName = resolveDisplayName(profile);

        return {
          id: profile.sub,
          email: profile.email,
          emailVerified: profile.email_verified ? new Date() : null,
          image: profile.picture,
          displayName,
          level: 6,
        };
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        const adapterUser = user as AdapterUserWithAlias;
        session.user.id = adapterUser.id;
        session.user.displayName = (adapterUser as any).displayName;
        session.user.alias = (adapterUser as any).alias;
        session.user.level = (adapterUser as any).level;
        session.user.email = adapterUser.email;
        session.user.image = adapterUser.image;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google" || !profile) {
        return;
      }

      const emailVerifiedField = (profile as GoogleProfile).email_verified;
      const isEmailVerified =
        typeof emailVerifiedField === "string"
          ? emailVerifiedField === "true"
          : Boolean(emailVerifiedField);

      const adapterUser = user as AdapterUser;

      if (!isEmailVerified || adapterUser.emailVerified) {
        return;
      }

      const emailVerifiedAt = new Date();
      if (user.id) {
        await db
          .update(users)
          .set({ emailVerified: emailVerifiedAt })
          .where(eq(users.id, user.id));
      }
      adapterUser.emailVerified = emailVerifiedAt;
    },
  },
});

export async function auth(): Promise<Session | null> {
  try {
    return await (_auth() as Promise<Session | null>);
  } catch (error) {
    console.warn(
      "[auth] Session validation failed, treating as unauthenticated:",
      error,
    );
    return null;
  }
}

export { handlers, signIn, signOut };
export const { GET, POST } = handlers;
