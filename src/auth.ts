import NextAuth from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import Google, { type GoogleProfile } from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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
        session.user.displayName = adapterUser.displayName;
        session.user.alias = adapterUser.alias;
        session.user.level = adapterUser.level;
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
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: emailVerifiedAt },
      });
      adapterUser.emailVerified = emailVerifiedAt;
    },
  },
});

export async function auth() {
  if (process.env.AUTH_BYPASS === "true") {
    const devUser = await prisma.user.upsert({
      where: { email: "dev@padelapp.local" },
      update: {},
      create: {
        email: "dev@padelapp.local",
        displayName: "Dev Player",
        alias: "DevPlayer",
        level: 6,
      },
    });

    return {
      user: {
        id: devUser.id,
        displayName: devUser.displayName,
        alias: devUser.alias,
        level: devUser.level,
        email: devUser.email,
        image: devUser.image,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as unknown as Awaited<ReturnType<typeof _auth>>;
  }
  return _auth();
}

export { handlers, signIn, signOut };
export const { GET, POST } = handlers;
