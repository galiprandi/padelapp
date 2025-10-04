import NextAuth from "next-auth";
import Google, { type GoogleProfile } from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function buildAlias(name?: string | null, identifier?: string | null): string {
  const baseCandidate = name?.trim() || identifier?.split("@")[0] || "jugador";
  const normalized = baseCandidate
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = identifier?.slice(-4) || Math.random().toString(36).slice(-4);
  const safeBase = normalized.length > 0 ? normalized : "jugador";
  return `${safeBase}-${suffix}`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile: GoogleProfile) {
        const alias = buildAlias(profile.given_name ?? profile.name, profile.email ?? profile.sub);

        return {
          id: profile.sub,
          name: profile.name ?? profile.email,
          email: profile.email,
          emailVerified: profile.email_verified ? new Date() : null,
          image: profile.picture,
          alias,
          level: 6,
        };
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.alias = user.alias;
        session.user.level = user.level;
        session.user.name = user.name;
        session.user.email = user.email;
        session.user.image = user.image;
      }
      return session;
    },
  },
});

export const { GET, POST } = handlers;
