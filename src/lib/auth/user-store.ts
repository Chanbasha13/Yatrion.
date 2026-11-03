/**
 * User Repository & Persistence Layer
 * Backed by LibSQL / SQLite Relational Database via Drizzle ORM.
 *
 * Guarantees:
 * - Server-side persistence across instances and container recycles.
 * - Password hashes only (bcrypt).
 * - Automatic migration and Demo Traveler seeding.
 */

import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { users } from "../db/schema";
import { runMigrations } from "../db/migrate";
import type { User, UserRecord } from "./auth-types";

// Pre-seeded Demo Traveler (password: DemoExplorer2026!)
export const DEMO_USER_ID = "user-demo-karnataka";
export const DEMO_USER_EMAIL = "demo@yatrion.local";

const SEED_USERS: UserRecord[] = [
  {
    id: DEMO_USER_ID,
    email: DEMO_USER_EMAIL,
    name: "Karnataka Explorer (Demo)",
    passwordHash: "$2b$10$XA/RQ43LQKchRkc/CiAsruRb8GxNFnZP/PabIM4JvCM/rQuVkZqFi",
    isDemo: true,
    createdAt: "2026-11-01T00:00:00.000Z",
    lastLoginAt: "2026-11-03T00:00:00.000Z",
  },
];

/**
 * Strips passwordHash and returns public User object.
 */
export function sanitizeUser(record: UserRecord): User {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    isDemo: record.isDemo,
    createdAt: record.createdAt,
    lastLoginAt: record.lastLoginAt,
  };
}

/**
 * Finds user by email address (case-insensitive).
 */
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  if (!email) return null;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    await runMigrations();
    const db = getDb();
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (rows.length > 0) {
      const row = rows[0];
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        passwordHash: row.passwordHash,
        isDemo: Boolean(row.isDemo),
        createdAt: row.createdAt,
        lastLoginAt: row.lastLoginAt,
      };
    }
  } catch (err) {
    console.warn("[UserStore] DB lookup failed, checking seed:", err);
  }

  // Fallback to in-memory seed for demo account
  const seed = SEED_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
  return seed ? { ...seed } : null;
}

/**
 * Finds user by unique ID.
 */
export async function findUserById(id: string): Promise<UserRecord | null> {
  if (!id) return null;

  try {
    await runMigrations();
    const db = getDb();
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (rows.length > 0) {
      const row = rows[0];
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        passwordHash: row.passwordHash,
        isDemo: Boolean(row.isDemo),
        createdAt: row.createdAt,
        lastLoginAt: row.lastLoginAt,
      };
    }
  } catch (err) {
    console.warn("[UserStore] DB lookup failed, checking seed:", err);
  }

  const seed = SEED_USERS.find((u) => u.id === id);
  return seed ? { ...seed } : null;
}

/**
 * Creates and persists a new user in the database.
 */
export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
  isDemo: boolean = false
): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();

  await runMigrations();
  const db = getDb();

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("A user with this email address already exists.");
  }

  const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  await db.insert(users).values({
    id,
    email: normalizedEmail,
    name: name.trim(),
    passwordHash,
    isDemo: isDemo,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  });

  return {
    id,
    email: normalizedEmail,
    name: name.trim(),
    isDemo,
    createdAt: now,
    lastLoginAt: now,
  };
}

/**
 * Updates the last login timestamp for a user.
 */
export async function updateUserLastLogin(id: string): Promise<void> {
  try {
    await runMigrations();
    const db = getDb();
    const now = new Date().toISOString();
    await db
      .update(users)
      .set({
        lastLoginAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, id));
  } catch (err) {
    console.warn("[UserStore] Could not update last login:", err);
  }
}

/**
 * Retrieves the seeded Demo Traveler account.
 */
export async function getDemoUser(): Promise<UserRecord> {
  const demo = await findUserByEmail(DEMO_USER_EMAIL);
  if (demo) return demo;
  return { ...SEED_USERS[0] };
}
