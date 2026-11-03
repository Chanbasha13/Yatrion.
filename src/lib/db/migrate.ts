/**
 * Database Migration & Schema Initialization Engine
 * Idempotently creates tables, constraints, indexes, and seeds the Demo Traveler.
 */

import { getClient } from "./client";
import fs from "fs";
import path from "path";
import type { UserRecord } from "../auth/auth-types";

// Seed credentials for Demo Traveler (password: DemoExplorer2026!)
const DEMO_USER_ID = "user-demo-karnataka";
const DEMO_USER_EMAIL = "demo@yatrion.local";
const DEMO_PASSWORD_HASH = "$2b$10$XA/RQ43LQKchRkc/CiAsruRb8GxNFnZP/PabIM4JvCM/rQuVkZqFi";

let migrationPromise: Promise<void> | null = null;

export async function runMigrations(): Promise<void> {
  if (migrationPromise) return migrationPromise;

  migrationPromise = (async () => {
    const client = getClient();

    // 1. Enforce Foreign Keys
    await client.execute("PRAGMA foreign_keys = ON;");

    // 2. Create 'users' table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        is_demo INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_login_at TEXT NOT NULL
      );
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // 3. Create 'trips' table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        destination_ids_json TEXT NOT NULL,
        preferences_json TEXT NOT NULL,
        itinerary_json TEXT NOT NULL,
        route_json TEXT,
        budget_json TEXT,
        group_state_json TEXT,
        day_notes_json TEXT,
        stop_notes_json TEXT,
        completed_stops_json TEXT,
        saved_gem_ids_json TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
    `);

    // 4. Create 'saved_places' table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS saved_places (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        place_id TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        CONSTRAINT unq_user_place UNIQUE(user_id, place_id)
      );
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON saved_places(user_id);
    `);

    // 5. Seed Demo Traveler if not present
    const demoCheck = await client.execute({
      sql: "SELECT id FROM users WHERE id = ? OR email = ? LIMIT 1;",
      args: [DEMO_USER_ID, DEMO_USER_EMAIL],
    });

    if (demoCheck.rows.length === 0) {
      const now = new Date().toISOString();
      await client.execute({
        sql: `INSERT INTO users (id, email, name, password_hash, is_demo, created_at, updated_at, last_login_at)
              VALUES (?, ?, ?, ?, 1, ?, ?, ?);`,
        args: [
          DEMO_USER_ID,
          DEMO_USER_EMAIL,
          "Karnataka Explorer (Demo)",
          DEMO_PASSWORD_HASH,
          now,
          now,
          now,
        ],
      });
    }

    // 6. Migrate legacy users from .data/users.json if present
    try {
      const usersJsonPath = path.join(process.cwd(), ".data", "users.json");
      if (fs.existsSync(usersJsonPath)) {
        const raw = fs.readFileSync(usersJsonPath, "utf-8");
        const list = JSON.parse(raw) as UserRecord[];
        if (Array.isArray(list)) {
          for (const u of list) {
            if (u.id && u.email && u.passwordHash) {
              const existing = await client.execute({
                sql: "SELECT id FROM users WHERE email = ? LIMIT 1;",
                args: [u.email.toLowerCase()],
              });
              if (existing.rows.length === 0) {
                const now = new Date().toISOString();
                await client.execute({
                  sql: `INSERT INTO users (id, email, name, password_hash, is_demo, created_at, updated_at, last_login_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                  args: [
                    u.id,
                    u.email.toLowerCase(),
                    u.name,
                    u.passwordHash,
                    u.isDemo ? 1 : 0,
                    u.createdAt || now,
                    now,
                    u.lastLoginAt || now,
                  ],
                });
              }
            }
          }
        }
      }
    } catch {
      // Non-fatal if legacy migration file is unavailable or invalid
    }
  })();

  return migrationPromise;
}

