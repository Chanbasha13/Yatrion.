/**
 * Session Token & Cookie Management
 * Implements signed JWT session handling with jose
 */

import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "./auth-types";

export const SESSION_COOKIE_NAME = "yatrion_session";
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Extracts session token from Request cookie headers or from a raw cookie string.
 */
export function extractSessionTokenFromCookieHeader(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Returns the session secret key.
 * In production mode, strictly throws an error if SESSION_SECRET is unset or shorter than 32 characters.
 */
export function getSessionSecret(): string {
  const isProduction = process.env.NODE_ENV === "production";
  const secret = process.env.SESSION_SECRET;

  if (isProduction) {
    if (!secret || secret.trim().length < 32) {
      throw new Error(
        "[Yatrion Security] Fatal: A secure SESSION_SECRET of at least 32 characters is required in production mode."
      );
    }
    return secret;
  }

  return secret || "yatrion-karnataka-auth-secret-key-2026-zero-cost-hackathon-token";
}

export function getEncodedSessionKey(): Uint8Array {
  return new TextEncoder().encode(getSessionSecret());
}

/**
 * Creates a signed JWT session token valid for 7 days.
 */
export async function createSessionToken(
  payload: Omit<SessionPayload, "iat" | "exp">
): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + SESSION_DURATION_SECONDS;
  const encodedSecretKey = getEncodedSessionKey();

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(encodedSecretKey);
}

/**
 * Verifies and decodes a signed JWT session token.
 * Returns the decoded SessionPayload or null if invalid/expired.
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const encodedSecretKey = getEncodedSessionKey();
    const { payload } = await jwtVerify(token, encodedSecretKey, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      isDemo: Boolean(payload.isDemo),
      iat: typeof payload.iat === "number" ? payload.iat : undefined,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Standard cookie options for the session cookie.
 */
export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}

