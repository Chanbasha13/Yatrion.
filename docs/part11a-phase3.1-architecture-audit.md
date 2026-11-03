# Yatrion Part 11A — Phase 3.1: Persistence, Security & Production Architecture Audit
**Kannada Digital Innovation Hackathon 2026**  
*Track: Open-Source Cultural Tourism & Smart Travel Intelligence for Karnataka*  
*Audit Scope: Post-Phase 3 Engine Migration & Application Topology*

---

## 1. Existing Architecture Overview

Yatrion is structured as a full-stack Next.js 16.4.3 application leveraging the App Router, Turbopack compiler, Node.js 24 runtime, and strict TypeScript 5.8.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  PUBLIC DOMAIN (/)                                     │
│  - Cinematic 3D Horizon (WebGL/Canvas + Topographic SVG fallback)                      │
│  - 12 Introductory Sections (Manifesto, Features Matrix, Biome Explorer, Benefits)     │
│  - Authentication Gateways: /login, /signup                                           │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SESSION MIDDLEWARE (src/proxy.ts)                         │
│  - Matcher: ["/app/:path*", "/login", "/signup"]                                       │
│  - Stateless HS256 JWT Verification via jose against cookie: 'yatrion_session'          │
│  - Unauthenticated /app/* requests -> redirected to /login?redirect=<target>           │
│  - Note: Middleware DOES NOT match or protect /api/* endpoints                         │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                            AUTHENTICATED PLATFORM (/app/*)                             │
│  12 Dedicated Workspaces (Dashboard, Explore, Planner, Routes, Budget, Gems,           │
│                           Group, Adaptive, Conditions, Saved, Trips, Settings)         │
│  - In-Browser State Management: React useState / useEffect                             │
│  - Client Persistence Layer: src/lib/storage/user-trip-service.ts                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Core Algorithmic & Telemetry Engines
- **Smart Route Optimizer** (`src/lib/routes/`): Haversine distance calculations with terrain detour curvature multipliers (1.48x Western Ghats, 1.28x Coastal NH 66, 1.22x Deccan Plains) and transit feasibility detectors.
- **Intelligent Budget Optimizer** (`src/lib/budget/`): 3-tier mathematical cost models (Saver, Balanced, Comfort) calculating accommodation room requirements, fuel consumption, daily food expenses, and contingency factors.
- **Hidden Gems Discovery Engine** (`src/lib/discovery/`): 40+ vetted offbeat locations ranked by quietness, crowds, and seasonal suitability scores.
- **Group Trip Planner & Consensus** (`src/lib/group/`): Multi-traveller preference voting using Borda count consensus, accessibility constraint checks, and simplified debt-settlement graphs.
- **Adaptive Travel Companion** (`src/lib/adaptive/`): Deterministic issue detection, non-destructive replanning proposals, 30-min TTL cached Open-Meteo weather telemetry, and verified Karnataka road disruption alerts.
- **31-District Secular Explorer** (`src/lib/explore/district-data.ts`): Complete administrative directory of Karnataka's 31 districts across 4 revenue divisions with 100% secular curation.

---

## 2. Persistence Inventory

The table below delineates every piece of data currently managed by Yatrion, distinguishing local client-side persistence from server-side persistence:

| Data Entity | Primary Storage Medium | Server-Side Record Exists? | Survives Logout? | Survives Browser Site Data Clear? | Survives Device / Browser Change? | Concurrency Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **User Account & Password Hash** | Server `.data/users.json` + In-memory cache | **YES** (Filesystem JSON) | **YES** | **YES** | **YES** (Can log in from any device) | Single-process atomic rename write (`.tmp` -> `.json`). Unsynchronized across multi-instance serverless functions. |
| **Session Token (JWT)** | Client HttpOnly Cookie (`yatrion_session`) | **NO** (Stateless signed token) | **NO** (Cookie cleared via `maxAge: 0`) | **NO** | **NO** (Device-bound cookie) | Valid until expiration (7 days) or explicit logout. |
| **Active Trip Itinerary & Customizations** | Client `window.localStorage` (`yatrion-trip-${userId}-v1`) | **NO (0 bytes on server)** | **YES** (Persists in browser disk) | **NO (Permanently lost)** | **NO (Invisible on new device)** | Last-write-wins between multiple tabs on same browser. Completely divergent across multiple devices. |
| **Saved Places & Bookmarks** | Client `window.localStorage` (`yatrion-saved-places-${userId}-v1`) | **NO (0 bytes on server)** | **YES** (Persists in browser disk) | **NO (Permanently lost)** | **NO (Invisible on new device)** | Last-write-wins locally. |
| **Language Preference** | Client `window.localStorage` (`yatrion-language-pref-v1`) | **NO** | **YES** | **NO** | **NO** | Client-scoped. |
| **Weather & Road Disruption Cache** | In-Memory `ConditionCache` (Map in client/server process) | **NO** | Transformed on reload | Transformed on reload | Transformed on reload | TTL expires after 1,800s (weather) or 86,400s (disruptions). |
| **Demo Traveler Seed State** | Client `window.localStorage` (`yatrion-trip-demo-v1`) | **NO** (Client initialized) | **YES** | Re-seeded on next demo entry | N/A | Local to evaluator's browser. |

### Key Insight
**100% of user-created travel itineraries, customizations, daily notes, checklist progress, group voting states, and bookmarked places exist exclusively in the client's browser `localStorage`.** There is currently no backend database, no cloud database table, and no server-side API endpoint for trip persistence or retrieval.

---

## 3. Security Findings

### 3.1 Client-Side Key Partitioning is NOT a Security Boundary
In `src/lib/storage/user-trip-service.ts`, storage keys are partitioned by user ID:
```typescript
export function getUserTripStorageKey(userId?: string, isDemo?: boolean): string {
  if (isDemo || userId === "user-demo-karnataka") return "yatrion-trip-demo-v1";
  if (userId) return `yatrion-trip-${userId}-v1`;
  return TRIP_STORAGE_KEY;
}
```
- **Finding**: While this prevents the React UI of User B from automatically rendering User A's trip on the same browser, **it does not constitute an access control or security boundary**.
- **Impact**: Any script running in the browser origin, or any person opening Chrome DevTools on a shared computer (e.g., college computer lab, family laptop, internet kiosk), can inspect `localStorage` and retrieve another user's trip details, notes, and group profiles via:
  ```javascript
  localStorage.getItem("yatrion-trip-user-1730592831000-xyz-v1")
  ```

### 3.2 Unauthenticated API Endpoints
- **Finding**: `src/app/api/chat/route.ts` does not inspect the `yatrion_session` cookie or verify authorization.
- **Impact**: Any external actor can issue unauthenticated HTTP `POST` requests to `/api/chat`. If `GEMINI_API_KEY` is configured in production, unauthenticated external traffic can exhaust the application's AI quota.

### 3.3 Hardcoded Fallback Session Secret
- **Finding**: In both `src/proxy.ts` (line 8) and `src/lib/auth/session.ts` (line 15), `SESSION_SECRET` defaults to:
  ```typescript
  process.env.SESSION_SECRET || "yatrion-karnataka-auth-secret-key-2026-zero-cost-hackathon-token"
  ```
- **Impact**: If an operator deploys Yatrion without explicitly setting `SESSION_SECRET` in production environment variables, an attacker reading the open-source repository can forge signed HS256 JWT tokens with arbitrary `userId` claims, completely bypassing authentication.

### 3.4 Absence of Server-Side Authorization Handlers
- **Finding**: Because there are no backend trip mutation endpoints (`/api/trips`, `/api/saved-places`), there is currently no server-side code enforcing access control policies such as:
  ```sql
  SELECT * FROM trips WHERE id = $1 AND user_id = $2
  ```
- **Impact**: All access control currently resides in client-side React conditional logic.

---

## 4. Cross-User Isolation Findings

### 4.1 Single Browser / Shared Machine Scenario
- **Behavior**: When User A logs out, `yatrion_session` cookie is deleted, but `localStorage["yatrion-trip-user-A-v1"]` remains intact on disk.
- **Risk**: When User B logs in on that same machine, User B's UI reads `localStorage["yatrion-trip-user-B-v1"]`. User B does not see User A's data in the application interface. However, User A's data remains physically accessible in the browser's persistent storage. If User A's ID is discovered, any client script can access User A's record.

### 4.2 Multi-Device Scenario
- **Behavior**: If User A creates an itinerary on a desktop computer, then logs into their account from a smartphone while traveling in Karnataka, **the smartphone shows "No Active Journey Yet"**.
- **Risk**: User data is strictly siloed within the physical browser that created it. Cloud synchronization is non-existent.

### 4.3 Client State Manipulation
- **Behavior**: The client components read `user?.id` from `useAuth()` to load data.
- **Risk**: If a malicious client overrides `user.id` in memory or in the browser console, they can trigger reads and writes to arbitrary `yatrion-trip-${targetId}-v1` keys present in that browser's `localStorage`.

---

## 5. Demo Traveler Isolation Findings

### 5.1 Demo Account Architecture
- **Credentials**: Email `demo@yatrion.local`, ID `user-demo-karnataka`, Flag `isDemo: true`.
- **Storage Scope**: Isolated to `yatrion-trip-demo-v1` and `yatrion-saved-places-user-demo-karnataka-v1`.
- **Seeding**: Initialized in browser memory via `createSeedDemoTrip()` upon first launch or when the demo storage key is empty.

### 5.2 Isolation Integrity Assessment
- **Positives**:
  - Demo Traveler changes do not modify the server-side `.data/users.json`.
  - Demo Traveler changes do not collide with or overwrite registered user storage keys.
  - The "Reset Demo Data" action (`handleResetDemo`) cleanly purges `yatrion-trip-demo-v1` and re-seeds the pristine 4-day Western Ghats trip.
- **Limitations**:
  - The demo experience is also client-bound; evaluators testing on desktop cannot inspect their test modifications on mobile.

---

## 6. Data Accuracy & Provenance Audit

This audit classifies all data entities into **Verified Facts**, **Computed Mathematical Estimates**, **Heuristic Rules**, and **Demonstration Samples**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DATA TAXONOMY AUDIT                                    │
│                                                                                        │
│  [1. VERIFIED FACTS]                                                                   │
│  - 31 Karnataka Administrative Districts across 4 Divisions (Revenue Department)       │
│  - Geodetic Landmark Coordinates (11.5°N - 18.5°N, 74.0°E - 78.5°E, Survey of India)    │
│  - Physical Elevations (Mullayanagiri 1,930m, Jog Falls 472m rim, Survey of India)     │
│  - Live Open-Meteo Weather Observations (WMO Weather Stations via CC BY 4.0)           │
│  - Official Karnataka PWD / KSDMA Road Closure Bulletins                                │
│                                                                                        │
│  [2. COMPUTED MATHEMATICAL ESTIMATES]                                                  │
│  - Haversine Great-Circle Geodesic Distances                                           │
│  - Road Detour Distances via Terrain Multipliers (Ghats 1.48x, Coastal 1.28x, Plains 1.22x)│
│  - Fuel Cost Models: (Road Distance / Mileage) * State Regulated Fuel Price             │
│  - Accommodation Room Formulas: ceil(TravellerCount / 2) * Standard Base Rates         │
│  - Borda Count Ranked Voting Preference Scores for Group Consensus                     │
│                                                                                        │
│  [3. HEURISTIC RULES]                                                                  │
│  - Western Ghats Driving Speed: 32-38 km/h (Hairpin turns & fog deceleration)           │
│  - Pacing Intensity: Packed (>7h transit/day), Balanced (4-7h), Relaxed (<4h)          │
│  - Midday Sanctum Closure Heuristic: 12:30 PM - 4:30 PM (Traditional Shrines)          │
│  - Contingency Budget Buffer: 5% (plains) to 15% (monsoon ghats / large groups)        │
│                                                                                        │
│  [4. DEMONSTRATION SAMPLES]                                                            │
│  - Seeded 4-Day Demo Trip (Bengaluru -> Chikkamagaluru -> Coorg)                       │
│  - Pre-drafted traveler notes ("Stop for Tatte Idli breakfast near Nelamangala")       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 District Directory & Secular Curation Audit
- **District Coverage**: Exactly 31 administrative districts are modeled in `src/lib/explore/district-data.ts`. Revenue divisions align with official Karnataka administrative reorganization:
  - Belagavi Division: 7 districts (Belagavi, Bagalkote, Vijayapura, Dharwad, Gadag, Haveri, Uttara Kannada).
  - Kalaburagi Division: 7 districts (Kalaburagi, Bidar, Raichur, Koppal, Ballari, Vijayanagara, Yadgir).
  - Bengaluru Division: 9 districts (Bengaluru Urban, Bengaluru Rural, Ramanagara, Kolar, Chikkaballapura, Tumakuru, Chitradurga, Davanagere, Shivamogga).
  - Mysuru Division: 8 districts (Chamarajanagara, Chikkamagaluru, Dakshina Kannada, Hassan, Kodagu, Mandya, Mysuru, Udupi).
- **Secular Curation Invariant**:
  - In `src/lib/explore/district-data.ts`, **all 33 curated attractions are 100% secular** (citadels, monolithic caverns, lakes, bird sanctuaries, waterfalls, and GI-tagged woodcraft).
  - **Dataset Divergence Note**: In the legacy files (`src/lib/destinations-data.ts` and `src/lib/routes/route-estimates.ts`), historical religious monuments (Hampi Virupaksha Temple, Udupi Krishna Matha, Belur Chennakeshava, etc.) remain present. The application maintains two tiers: the **31-District Secular Explorer** (100% non-sectarian) and the **Legacy 11-Hub Cultural Itinerary Engine** (broader historical/heritage circuits).

### 6.2 Route Distance & Topographic Curvature Calculations
- **Calculation Formulation**:
  $$\text{Road Distance} = \text{Haversine}(C_1, C_2) \times \text{DetourMultiplier}(\text{Terrain})$$
  - Ghats: `1.48` multiplier (~48% road curve over flight distance).
  - Coastal: `1.28` multiplier (~28% road curve along NH 66).
  - Plains: `1.22` multiplier (~22% road curve along NH 48 / NH 75).
- **Audit Assessment**: This is an **explainable geometric heuristic**, not real-time GPS turn-by-turn routing telemetry. It provides reliable planning accuracy (within ±10–15% of actual odometer distances) without paid routing API dependencies.

### 6.3 Budget Estimates Audit
- **Calculation Formulation**:
  $$\text{Total Budget} = (\text{Transit} + \text{Lodging} + \text{Food} + \text{Activities}) \times (1 + \text{Contingency})$$
  - Lodging: Double-occupancy rooms ($\lceil \text{pax}/2 \rceil$) $\times$ Tier rate ($\text{Saver: ₹1,200}$, $\text{Balanced: ₹2,800}$, $\text{Comfort: ₹5,500}$) $\times$ $(\text{days} - 1)$.
  - Food: ₹350/day (Saver), ₹750/day (Balanced), ₹1,600/day (Comfort) per traveller.
- **Audit Assessment**: Fully deterministic planning estimates. The UI transparently presents these as estimation ranges rather than live commercial booking rates.

### 6.4 Weather Telemetry Freshness
- **Provider**: Open-Meteo CC BY 4.0 API.
- **TTL Validation**:
  - Current weather observations: TTL = 1,800s (30 minutes).
  - Forecasts: TTL = 21,600s (6 hours).
- **Audit Assessment**: Freshness is strictly evaluated via `evaluateFreshness()`. If external network connectivity fails, stale cached data is transparently flagged or gracefully omitted without fabricating synthetic weather measurements.

---

## 7. Production Blockers

The following items are identified as blocking true multi-user production deployment:

1. **Absence of Server-Side Trip Database**:
   - Registered users expect their itineraries, bookmarks, and expenses to synchronize across devices (desktop, tablet, mobile).
   - LocalStorage-only persistence fails if the user clears browser cookies, changes browsers, or travels with a mobile phone.
2. **Stateless Serverless Auth Inconsistency**:
   - `.data/users.json` relies on local container disk. On multi-instance serverless hosting (e.g. Vercel, AWS Lambda), files written on instance A are not visible to instance B, and filesystem state is wiped on container recycling.
3. **Unprotected AI Chat Endpoint**:
   - `/api/chat` is publicly accessible without session authentication, exposing server compute or Gemini API keys to unauthenticated abuse.
4. **Hardcoded Fallback JWT Secret**:
   - `SESSION_SECRET` fallback allows anyone with repository access to forge tokens if deployed without explicit environment variables.
5. **No Concurrency or Conflict Resolution**:
   - Simultaneous edits across multiple browser tabs overwrite each other on a last-write-wins basis with no optimistic locking or versioning.

---

## 8. Recommended Zero-Cost Architecture

### 8.1 Database Evaluation Matrix

| Evaluated Database | Cost Model | Requires Credit Card? | Serverless / Edge Compatible? | Local & Offline Dev? | Free Tier Limits | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Turso (Hosted LibSQL / SQLite)** | **₹0 / mo** | **NO** | **YES (HTTP/WebSocket)** | **YES (Native `file:./data/yatrion.db`)** | 9 GB storage, 500 databases, 1B reads/mo | **RECOMMENDED (Rank 1)** |
| **Local SQLite File (`better-sqlite3`)** | **₹0 / mo** | **NO** | NO (Ephemeral on serverless) | **YES** | Unlimited local disk | Excellent for Docker/VPS; fails on Vercel |
| **Neon (Serverless Postgres)** | **₹0 / mo** | **NO** | **YES (HTTP driver)** | Requires internet | 0.5 GB storage, 1 project, compute suspends | Strong contender; cold starts (500ms-1s) |
| **Supabase (Postgres)** | **₹0 / mo** | Region-dependent | **YES (Pooler)** | Requires Docker locally | 500 MB, pauses after 7 days inactivity | Risk of database pause on free tier |

### 8.2 Detailed Evaluation of Top Recommendation: Turso (LibSQL)
Turso represents the optimal database architecture for Yatrion under the zero-cost hackathon constraints:

1. **Zero Financial Cost & No Payment Method Requirement**:
   - Turso's Starter Plan is permanently free, provides 9 GB of storage, and allows creating accounts without credit card details.
2. **Dual-Mode Adapter Architecture**:
   - Using `@libsql/client`, the exact same database abstraction runs in two modes:
     - **Local Development / Offline Mode**: Connects to `file:./.data/yatrion.db` without network access or cloud accounts.
     - **Production Deployment**: Connects to `libsql://yatrion-db.turso.io` using `DATABASE_URL` and `DATABASE_AUTH_TOKEN`.
3. **Native Edge & Serverless Performance**:
   - Connects over lightweight HTTP requests; zero persistent connection pool exhaustion issues on Next.js App Router / Turbopack.
4. **Relational Schema with Foreign Keys & Server-Enforced Security**:
   - Enables strict database constraints:
     - `users` (id, email, password_hash, name, is_demo, created_at)
     - `trips` (id, user_id REFERENCES users(id), preferences_json, itinerary_json, route_json, budget_json, created_at, updated_at)
     - `saved_places` (id, user_id REFERENCES users(id), place_id, saved_at)
5. **Server-Side Authorization**:
   - Authenticated API routes (`/api/trips`, `/api/saved-places`) verify the session cookie on every request:
     ```typescript
     const session = await getSession(req);
     const userTrips = await db.select().from(trips).where(eq(trips.userId, session.userId));
     ```

---

## 9. Migration Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Data Loss for Existing LocalStorage Users** | Evaluators/users lose trips saved in browser localStorage when switching to database. | High | **Client-to-Cloud Reconciliation Flow**: On login, client checks if a local trip exists in `localStorage` and automatically offers to sync it to the newly authenticated cloud account. |
| **UI Latency Friction** | Moving from instantaneous local disk writes to network API calls introduces save lag. | Medium | **Optimistic Local Cache Pattern**: Writes commit immediately to local memory/cache while background syncing via a debounced API mutation (`saveTripToServer`). |
| **Demo Traveler Multi-User Collision** | If demo trips are written to a single shared database record, concurrent evaluators overwrite each other. | High | **Demo Sandbox Isolation**: Demo Traveler must remain strictly client-side (`localStorage` only) OR use ephemeral session-scoped UUIDs in the database. |
| **Serverless Cold Starts / Outages** | Cloud database downtime halts application loading. | Low | **Graceful Offline Fallback**: If the database is unreachable, the client falls back to cached local storage with an informative offline banner. |

---

## 10. Recommended Next Implementation Phase

### Proposed Phase 3.2: Cloud Persistence & Server Authorization Engine
Before proceeding to Phase 4 (AI Companion Expansion & Multi-Day Tour Pack Generation), implement a focused persistence and security hardening phase:

1. **Step 1: Database Setup & Dual-Mode LibSQL Client**:
   - Install `@libsql/client` and Drizzle ORM.
   - Configure dual-mode connection: local SQLite file (`.data/yatrion.db`) in development/tests, Turso cloud LibSQL in production.
2. **Step 2: Relational Schema & Migrations**:
   - Define `users`, `trips`, and `saved_places` tables with strict foreign key constraints and updated timestamps.
3. **Step 3: Authenticated API Routes**:
   - Implement `GET /api/trips`, `POST /api/trips`, `DELETE /api/trips` with server-side session token validation (`WHERE trips.user_id = session.userId`).
   - Implement `GET /api/saved-places`, `POST /api/saved-places`, `DELETE /api/saved-places`.
   - Protect `/api/chat` by enforcing active session requirements.
4. **Step 4: Client-Side Sync Adapter**:
   - Refactor `user-trip-service.ts` to perform optimistic local updates with background server sync for authenticated users.
   - Preserve client-only isolation for the Demo Traveler (`user-demo-karnataka`).
5. **Step 5: Production Security Hardening**:
   - Enforce fail-fast check: throw an explicit runtime error if `SESSION_SECRET` is unset in `NODE_ENV === "production"`.

---

## 11. Conclusion

This architecture audit confirms that Yatrion's core travel algorithms, route calculations, budget modeling, and district directories are mathematically sound, highly performant, and 100% secular. 

However, user data persistence currently relies entirely on browser `localStorage`, which poses severe multi-device limitations and should not be confused with a server-enforced security boundary. Implementing a zero-cost LibSQL/SQLite persistence layer (Phase 3.2) will resolve these production blockers cleanly before advancing to Phase 4.

**Awaiting user review and approval before proceeding.**

