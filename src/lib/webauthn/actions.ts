"use server";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
} from "@simplewebauthn/server";

import { auth } from "@/auth";
import { db } from "@/db";
import { passkeyCredentials, sessions, users } from "@/db/schema";
import { rpID, rpName, rpOrigin } from "./config";

const CHALLENGE_COOKIE = "webauthn-challenge";
const CHALLENGE_MAX_AGE = 5 * 60; // 5 minutes
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export async function getRegistrationOptions() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debés estar logueado." } as const;
  }

  const existingCredentials = await db
    .select({
      credentialId: passkeyCredentials.credentialId,
      transports: passkeyCredentials.transports,
    })
    .from(passkeyCredentials)
    .where(eq(passkeyCredentials.userId, session.user.id));

  const excludeCredentials = existingCredentials.map((cred) => ({
    id: cred.credentialId,
    transports: (cred.transports as AuthenticatorTransportFuture[]) ?? [],
  }));

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: session.user.email ?? session.user.id,
    userDisplayName: session.user.displayName ?? undefined,
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      residentKey: "preferred",
      userVerification: "preferred",
    },
    excludeCredentials,
  });

  (await cookies()).set(CHALLENGE_COOKIE, options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: CHALLENGE_MAX_AGE,
    path: "/",
  });

  return { options } as const;
}

export async function verifyRegistration(
  response: RegistrationResponseJSON,
  nickname?: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debés estar logueado." } as const;
  }

  const challengeCookie = (await cookies()).get(CHALLENGE_COOKIE);
  if (!challengeCookie?.value) {
    return { error: "Sesión expirada. Probá de nuevo." } as const;
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challengeCookie.value,
      expectedOrigin: rpOrigin,
      expectedRPID: rpID,
    });
  } catch (err) {
    console.error("[webauthn] registration verification failed:", err);
    return {
      error: "No pudimos verificar la huella. Probá de nuevo.",
    } as const;
  }

  if (!verification.verified || !verification.registrationInfo) {
    return { error: "Verificación fallida." } as const;
  }

  const { credential, credentialDeviceType, credentialBackedUp } =
    verification.registrationInfo;

  const credentialId = credential.id;
  const publicKey = Array.from(credential.publicKey);
  const counter = credential.counter;

  await db
    .insert(passkeyCredentials)
    .values({
      userId: session.user.id,
      credentialId,
      publicKey,
      counter,
      transports: credential.transports ?? [],
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      nickname: nickname?.trim() || null,
    })
    .onConflictDoNothing();

  (await cookies()).delete(CHALLENGE_COOKIE);

  return { verified: true } as const;
}

export async function deletePasskey(credentialId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debés estar logueado." } as const;
  }

  await db
    .delete(passkeyCredentials)
    .where(eq(passkeyCredentials.credentialId, credentialId));

  return { verified: true } as const;
}

export async function getUserPasskeys() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const creds = await db
    .select({
      credentialId: passkeyCredentials.credentialId,
      nickname: passkeyCredentials.nickname,
      deviceType: passkeyCredentials.deviceType,
      createdAt: passkeyCredentials.createdAt,
    })
    .from(passkeyCredentials)
    .where(eq(passkeyCredentials.userId, session.user.id));

  return creds;
}

// ---------------------------------------------------------------------------
// Authentication (login)
// ---------------------------------------------------------------------------

export async function getAuthOptions() {
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
  });

  (await cookies()).set(CHALLENGE_COOKIE, options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: CHALLENGE_MAX_AGE,
    path: "/",
  });

  return { options } as const;
}

export async function verifyAuth(response: AuthenticationResponseJSON) {
  const challengeCookie = (await cookies()).get(CHALLENGE_COOKIE);
  if (!challengeCookie?.value) {
    return { error: "Sesión expirada. Probá de nuevo." } as const;
  }

  const [credential] = await db
    .select()
    .from(passkeyCredentials)
    .where(eq(passkeyCredentials.credentialId, response.id))
    .limit(1);

  if (!credential) {
    return { error: "Huella no reconocida." } as const;
  }

  const publicKeyUint8 = new Uint8Array(credential.publicKey as number[]);

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challengeCookie.value,
      expectedOrigin: rpOrigin,
      expectedRPID: rpID,
      credential: {
        id: credential.credentialId,
        publicKey: publicKeyUint8,
        counter: credential.counter,
        transports:
          (credential.transports as AuthenticatorTransportFuture[]) ?? [],
      },
    });
  } catch (err) {
    console.error("[webauthn] auth verification failed:", err);
    return { error: "No pudimos verificar la huella." } as const;
  }

  if (!verification.verified) {
    return { error: "Verificación fallida." } as const;
  }

  await db
    .update(passkeyCredentials)
    .set({ counter: verification.authenticationInfo.newCounter })
    .where(eq(passkeyCredentials.credentialId, credential.credentialId));

  (await cookies()).delete(CHALLENGE_COOKIE);

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, credential.userId))
    .limit(1);

  if (!user) {
    return { error: "Usuario no encontrado." } as const;
  }

  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await db.insert(sessions).values({
    sessionToken,
    userId: user.id,
    expires,
  });

  (await cookies()).set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });

  return { verified: true } as const;
}
