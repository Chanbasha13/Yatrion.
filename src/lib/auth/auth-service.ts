/**
 * Server-Side Authentication Orchestration Service
 */

import { cookies } from "next/headers";
import type {
  SignupInput,
  LoginInput,
  AuthResult,
  User,
} from "./auth-types";
import {
  hashPassword,
  verifyPassword,
  validateSignupInput,
  validateLoginInput,
} from "./password";
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserLastLogin,
  getDemoUser,
  sanitizeUser,
} from "./user-store";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from "./session";
import { getSafeRedirectUrl } from "./safe-redirect";

export interface ServiceAuthResult extends AuthResult {
  token?: string;
}

/**
 * Registers a new user account with secure password hashing.
 */
export async function registerUser(input: SignupInput): Promise<ServiceAuthResult> {
  const validation = validateSignupInput(input);
  if (!validation.valid) {
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: validation.errors,
    };
  }

  const existing = await findUserByEmail(input.email);
  if (existing) {
    return {
      success: false,
      error: "An account with this email address already exists.",
      fieldErrors: {
        email: ["An account with this email address already exists."],
      },
    };
  }

  try {
    const passwordHash = await hashPassword(input.password);
    const user = await createUser(input.name, input.email, passwordHash, false);

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      isDemo: false,
    });

    return {
      success: true,
      user,
      token,
      redirectUrl: "/app/dashboard",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create account.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Authenticates user credentials and returns session token on success.
 */
export async function authenticateUser(input: LoginInput): Promise<ServiceAuthResult> {
  const validation = validateLoginInput(input);
  if (!validation.valid) {
    return {
      success: false,
      error: "Please enter a valid email and password.",
      fieldErrors: validation.errors,
    };
  }

  const userRecord = await findUserByEmail(input.email);
  if (!userRecord) {
    // Constant-time-like rejection prevents timing attacks revealing registered emails
    return {
      success: false,
      error: "Invalid email or password.",
    };
  }

  const passwordMatches = await verifyPassword(input.password, userRecord.passwordHash);
  if (!passwordMatches) {
    return {
      success: false,
      error: "Invalid email or password.",
    };
  }

  await updateUserLastLogin(userRecord.id);

  const safeUser = sanitizeUser(userRecord);
  const token = await createSessionToken({
    userId: safeUser.id,
    email: safeUser.email,
    name: safeUser.name,
    isDemo: Boolean(safeUser.isDemo),
  });

  const redirectUrl = getSafeRedirectUrl(input.redirect);

  return {
    success: true,
    user: safeUser,
    token,
    redirectUrl,
  };
}

/**
 * Creates an isolated session for the Demo Traveler.
 */
export async function loginAsDemo(): Promise<ServiceAuthResult> {
  const demoRecord = await getDemoUser();
  await updateUserLastLogin(demoRecord.id);

  const safeUser = sanitizeUser(demoRecord);
  const token = await createSessionToken({
    userId: safeUser.id,
    email: safeUser.email,
    name: safeUser.name,
    isDemo: true,
  });

  return {
    success: true,
    user: safeUser,
    token,
    redirectUrl: "/app/dashboard",
  };
}

/**
 * Reads and verifies the current session from incoming request cookies.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    const payload = await verifySessionToken(sessionCookie.value);
    if (!payload) return null;

    const userRecord = await findUserById(payload.userId);
    if (!userRecord) return null;

    return sanitizeUser(userRecord);
  } catch {
    return null;
  }
}

