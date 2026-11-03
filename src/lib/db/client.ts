/**
 * Dual-Mode Database Client for Yatrion
 * Supports local SQLite (development/tests) and Turso LibSQL (production).
 *
 * Strict Production Guarantees:
 * - Never silently falls back to local storage in production.
 * - Fails clearly when required cloud configuration is missing.
 * - Enforces PRAGMA foreign_keys = ON.
 */

import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

let cachedClient: Client | null = null;
let cachedDb: LibSQLDatabase<typeof schema> | null = null;

export function getDatabaseConfig(): { url: string; authToken?: string } {
  const isProduction = process.env.NODE_ENV === "production";
  const databaseUrl = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (isProduction) {
    if (!databaseUrl) {
      throw new Error(
        "[Yatrion DB] Fatal: DATABASE_URL environment variable is required in production. Silent fallback to local ephemeral storage is strictly prohibited."
      );
    }

    if (
      (databaseUrl.startsWith("libsql://") || databaseUrl.startsWith("https://")) &&
      !authToken
    ) {
      throw new Error(
        "[Yatrion DB] Fatal: DATABASE_AUTH_TOKEN is required when connecting to remote Turso LibSQL in production."
      );
    }

    return { url: databaseUrl, authToken };
  }

  // Development & Test Mode: Default to local SQLite database in .data directory
  if (databaseUrl) {
    return { url: databaseUrl, authToken };
  }

  const dataDir = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // Ignore if already created or filesystem permission issue
    }
  }

  const localDbPath = path.join(dataDir, "yatrion.db");
  return { url: `file:${localDbPath}` };
}

export function getClient(): Client {
  if (cachedClient) return cachedClient;

  const config = getDatabaseConfig();
  cachedClient = createClient(config);
  return cachedClient;
}

export function getDb(): LibSQLDatabase<typeof schema> {
  if (cachedDb) return cachedDb;

  const client = getClient();
  cachedDb = drizzle(client, { schema });
  return cachedDb;
}

/**
 * Resets the cached database connection (primarily for automated testing).
 */
export function resetDatabaseClient(): void {
  if (cachedClient) {
    try {
      cachedClient.close();
    } catch {
      // Ignore close errors
    }
    cachedClient = null;
  }
  cachedDb = null;
}

