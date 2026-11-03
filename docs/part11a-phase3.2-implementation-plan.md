# Yatrion Part 11A — Phase 3.2: Cloud Persistence & Server Authorization Implementation Plan
**Kannada Digital Innovation Hackathon 2026**  
*Track: Open-Source Cultural Tourism & Smart Travel Intelligence for Karnataka*

---

## 1. Objectives & Scope

The purpose of Phase 3.2 is to transition Yatrion from browser-local storage into a robust, cloud-persisted, multi-device application while strictly preserving all existing deterministic travel engines, secular curation, and client responsiveness.

### Key Deliverables:
1. **Dual-Mode LibSQL & Drizzle ORM Architecture**:
   - Local SQLite (`file:./.data/yatrion.db`) for development and automated testing.
   - Remote Turso LibSQL (`libsql://...`) with auth tokens for production.
   - Enforce foreign keys, indexes, and transactions.
2. **Relational Database Schema**:
   - `users`: id, email (unique), name, password_hash, is_demo, created_at, updated_at, last_login_at.
   - `trips`: id, user_id (FK to users.id, cascade delete), title, destination_ids_json, preferences_json, itinerary_json, route_json, budget_json, group_state_json, notes_json, completed_stops_json, saved_gems_json, version, created_at, updated_at.
   - `saved_places`: id, user_id (FK to users.id, cascade delete), place_id, notes, created_at. Unique on `(user_id, place_id)`.
3. **Server-Side Authorization & Protected API Endpoints**:
   - `/api/trips`:
     - `GET`: Returns active trip for authenticated user derived strictly from verified JWT session cookie.
     - `POST` / `PUT`: Validates payload, verifies ownership, updates or creates trip transactionally with optimistic versioning.
     - `DELETE`: Clears the user's active trip.
   - `/api/saved-places`:
     - `GET`: Returns all bookmarked places for authenticated user.
     - `POST`: Toggles / adds bookmark for authenticated user.
     - `DELETE`: Removes bookmark for authenticated user.
   - `/api/chat`:
     - Protected with mandatory session verification.
     - Rate limit and request payload validation to prevent abuse.
4. **Authentication Hardening**:
   - Remove hardcoded JWT fallback secret in production. Fail-fast if `SESSION_SECRET` is missing when `NODE_ENV === "production"`.
   - Ensure proper secret length and algorithm enforcement (`HS256`).
5. **Local Cache & Cloud Synchronization Adapter (`user-trip-service.ts`)**:
   - LocalStorage acts as an optimistic cache for instant UI rendering.
   - Background synchronization communicates with `/api/trips` and `/api/saved-places`.
   - Prevent stale overwrites using monotonic `version` or timestamp comparison.
   - Handle offline degradation gracefully with clear synchronization states: `synced`, `syncing`, `offline`, `conflict`.
6. **Existing User-Data Migration Flow**:
   - Seamless, idempotent migration for users with existing `localStorage` data:
     1. On login, detect any unmigrated trip in `localStorage["yatrion-trip-${userId}-v1"]`.
     2. Validate data structure against `isValidStoredTrip()`.
     3. Check if server already has a trip. If server is empty, upload local trip to `/api/trips`.
     4. If server already has a newer trip, offer reconciliation.
     5. Mark migration as verified (`yatrion-trip-migrated-${userId}-v1`).
7. **Demo Traveler Isolation**:
   - The Demo Traveler (`user-demo-karnataka`, `demo@yatrion.local`) remains strictly client-side (`yatrion-trip-demo-v1`) or uses an isolated in-memory/isolated demo session, guaranteeing zero pollution of registered user records.
8. **Automated Verification**:
   - Comprehensive test suite covering database connectivity, CRUD, cross-user rejection, unauthenticated rejection, chat protection, migration idempotence, and concurrent updates, while preserving all existing 297 tests.

---

## 2. Technical Architecture & Component Design

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (BROWSER)                              │
│                                                                        │
│   Workspaces (/app/*)                                                  │
│       │                                                                │
│       ▼                                                                │
│   user-trip-service.ts (Optimistic Local Cache + Background Sync)      │
│       ├── Read / Write: window.localStorage (instant UI feedback)      │
│       └── Network Sync: fetch('/api/trips', '/api/saved-places')       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HttpOnly Cookie (yatrion_session)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          SERVER (NEXT.JS API)                          │
│                                                                        │
│   src/lib/auth/session.ts                                              │
│       └── verifySessionToken() -> derives authenticated userId         │
│                                                                        │
│   Protected Route Handlers:                                            │
│       ├── /api/trips (GET, POST, DELETE) -> verifies userId            │
│       ├── /api/saved-places (GET, POST, DELETE) -> verifies userId     │
│       └── /api/chat (POST) -> verifies session, rate limits            │
│                                                                        │
│   Database Layer (src/lib/db/):                                        │
│       ├── schema.ts (users, trips, saved_places via Drizzle)           │
│       ├── client.ts (Dual-mode LibSQL client: local file vs Turso)     │
│       └── migrations.ts (Automatic schema init with PRAGMA foreign_keys)
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        [DEVELOPMENT / TEST]                 [PRODUCTION DEPLOYMENT]
       Local SQLite (.data/yatrion.db)      Turso Cloud (libsql://...)
```

---

## 3. Database Schema Specification

### 3.1 `users` Table
```sql
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
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### 3.2 `trips` Table
```sql
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
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
```

### 3.3 `saved_places` Table
```sql
CREATE TABLE IF NOT EXISTS saved_places (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  CONSTRAINT unq_user_place UNIQUE(user_id, place_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON saved_places(user_id);
```

---

## 4. Implementation Steps & Work Breakdown

1. **Phase 3.2.1: Dependencies & Database Client Setup**:
   - Verify `@libsql/client` and `drizzle-orm` installation.
   - Create `src/lib/db/schema.ts` defining Drizzle schemas for `users`, `trips`, and `saved_places`.
   - Create `src/lib/db/client.ts` with dual-mode initialization (local SQLite file vs Turso cloud).
   - Create `src/lib/db/migrate.ts` ensuring idempotent table creation and `PRAGMA foreign_keys = ON;`.
2. **Phase 3.2.2: Auth Repository Integration**:
   - Refactor `src/lib/auth/user-store.ts` to read and write to the LibSQL `users` table while retaining seed support for `user-demo-karnataka`.
   - Harden `src/lib/auth/session.ts` and `src/proxy.ts` to require non-default `SESSION_SECRET` in production (`NODE_ENV === "production"`).
3. **Phase 3.2.3: Protected API Endpoints**:
   - Build `/api/trips/route.ts` supporting `GET`, `POST`, and `DELETE` with server-enforced ownership.
   - Build `/api/saved-places/route.ts` supporting `GET`, `POST`, and `DELETE` with server-enforced ownership.
   - Update `/api/chat/route.ts` to enforce active session verification and payload validation.
4. **Phase 3.2.4: Client-Side Synchronization & Migration**:
   - Refactor `src/lib/storage/user-trip-service.ts`:
     - Maintain `loadUserTrip` reading from optimistic cache while dispatching server fetch.
     - Implement `saveUserTrip` updating local cache and pushing to `/api/trips`.
     - Implement `syncUserTripWithServer` and data migration hook.
     - Ensure Demo Traveler remains 100% client-isolated.
5. **Phase 3.2.5: Automated Testing & Verification**:
   - Expand `scripts/test-engine.ts` with comprehensive Phase 3.2 tests (Tests 298–315).
   - Verify full suite passes: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.
6. **Phase 3.2.6: Final Documentation**:
   - Produce `docs/part11a-phase3.2-implementation-report.md`.

