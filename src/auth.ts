import NextAuth, { type Session } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import Google, { type GoogleProfile } from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

type AdapterUserWithAlias = AdapterUser & { alias?: string | null };

function resolveDisplayName(profile: GoogleProfile): string {
  const trimmedName = profile.name?.trim() || profile.given_name?.trim();
  if (trimmedName && trimmedName.length > 0) {
    return trimmedName;
  }

  const emailUser = profile.email?.split("@")[0];
  return emailUser && emailUser.length > 0 ? emailUser : "Jugador";
}

const {
  handlers,
  auth: _auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  } as any),
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
  return _auth() as Promise<Session | null>;
}

export { handlers, signIn, signOut };
export const { GET, POST } = handlers;
