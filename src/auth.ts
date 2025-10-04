import NextAuth from "next-auth";
import Google, { type GoogleProfile } from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function resolveDisplayName(profile: GoogleProfile): string {
  const trimmedName = profile.name?.trim() || profile.given_name?.trim();
  if (trimmedName && trimmedName.length > 0) {
    return trimmedName;
  }

  const emailUser = profile.email?.split("@")[0];
  return emailUser && emailUser.length > 0 ? emailUser : "Jugador";
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
        const displayName = resolveDisplayName(profile);

        return {
          id: profile.sub,
          name: profile.name ?? profile.email,
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
        session.user.id = user.id;
        session.user.displayName = user.displayName;
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
