# Complete Feature Highlights

**Project:** Yatrion (ಯಾತ್ರಿಯಾನ್) — AI Travel Companion for Karnataka  
**Competition:** Kannada Digital Innovation Hackathon 2026

---

### Platform Overview
Yatrion consists of a public discovery landing portal, a robust authentication system, and **14 specialized, authenticated application workspaces** unified by a global application shell, a context-aware AI travel companion, and a voice assistant.

```
                           YATRION PLATFORM ARCHITECTURE
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                           PUBLIC WEBSITE (/)                                │
 │   • Hero Portal    • Real Leaflet OSM Map    • 31-District Manifesto        │
 │   • Bilingual Switcher (EN/KN)    • Auth Gateway (/login, /signup)          │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │ (Stateless HMAC-SHA256 Cookie)
 ┌──────────────────────────────────────▼──────────────────────────────────────┐
 │                     AUTHENTICATED APPLICATION SHELL                         │
 │   • Persistent Nav    • Global Audio Feedback    • Floating AI Companion    │
 ├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
 │     EXPLORATION   │     PLANNING      │     OPTIMIZATION  │   COLLABORATION │
 │ • /app/dashboard  │ • /app/planner    │ • /app/routes     │ • /app/group    │
 │ • /app/explore    │ • /app/itinerary  │ • /app/budget     │ • /app/weather  │
 │ • /app/attractions│ • /app/trips      │ • /app/gems       │ • /app/adaptive │
 │ • /app/saved      │                   │                   │ • /app/settings │
 └───────────────────┴───────────────────┴───────────────────┴─────────────────┘
```

---

## 1. Public Portal & Authentication

- **Public Landing Page (`/`)**:
  - Editorial hero presentation highlighting Karnataka's geographical biomes.
  - Interactive **Real Leaflet + OpenStreetMap** preview featuring 12 secular landmarks across 4 biomes.
  - Bilingual switcher allowing instantaneous language switching between English and authentic Kannada script.
  - Direct gateway to Traveler Sign In, Registration, and Instant 1-Click Demo Traveler exploration.
- **Authentication & Security Engine (`/login`, `/signup`)**:
  - Stateless HMAC-SHA256 signed session tokens stored in secure HTTP-only cookies (`yatrion_session`).
  - WebCrypto PBKDF2 password hashing with cryptographically random salts.
  - Edge/Server proxy middleware (`src/proxy.ts` / Next middleware) guarding all 14 `/app/*` routes.
  - **Demo Traveler Isolation**: 1-click test mode issuing a sandbox token (`demo_user`) partitioned by a strict `demo_` prefix, preventing data pollution with registered traveler accounts.

---

## 2. Exploration & Attraction Workspaces

- **Central Dashboard (`/app/dashboard`)**:
  - Active trip synopsis (destinations, duration, traveler style, budget estimate).
  - Next scheduled stop countdown widget with transit guidance.
  - Live environmental conditions snippet and weather alert badge.
  - One-click quick launchers to all planning and optimization workspaces.
- **Karnataka 31-District Secular Explorer (`/app/explore`)**:
  - Complete coverage across all 31 administrative districts organized by 4 administrative divisions: **Mysuru, Bengaluru, Belagavi, and Kalaburagi**.
  - Secular category filtering: *Nature & Waterfalls, Wildlife & Forests, Heritage Forts, Geology & Caves, Beaches & Coast, Architecture & Monuments, Crafts & Culture*.
  - Senior accessibility filter: *Easy (flat paved paths, <200m walking)*, *Moderate (gentle gradients, handrails)*, *Challenging (steep stone steps, unpaved terrain)*.
- **Attraction Detail Workspace (`/app/attractions/[id]`)**:
  - Geodetic latitude, longitude, and physical elevation above mean sea level (MSL).
  - Institutional verification badges (ASI, GSI, Karnataka Forest Department, KSTDC).
  - Seasonal opening hours, entry fee guidelines, and best visiting seasons in English and Kannada.
  - Direct "Save to Bookmarks" and "Add Stop to Active Trip" actions.
- **Saved Places & Bookmarks (`/app/saved`)**:
  - Relational bookmark manager allowing travelers to curate prospective attractions.
  - Persisted in dual-mode storage (LibSQL/SQLite + client cache) for instant offline access.

---

## 3. Planning & Daily Itinerary Workspaces

- **Smart Trip Planner Wizard (`/app/planner`)**:
  - Configurable trip parameters: duration (1 to 14 days), group size, travel style (Relaxed, Balanced, Packed), and budget preference.
  - Multi-interest weighting (Nature, Wildlife, Heritage, Architecture, Coastal, Geology).
  - **Deterministic Constraint Engine**: Generates balanced, logically sequenced daily itineraries referencing verified Karnataka destinations without hallucinations.
- **Interactive Daily Itinerary Studio (`/app/itinerary`)**:
  - Daily schedule split into structured time slots: *Morning, Afternoon, and Evening*.
  - Activity re-ordering and non-destructive removal with full state restoration.
  - Per-stop user notes and interactive completion checkmark toggles.
  - **Pristine Export Engine**: Exports formatted plain-text travel briefs and print-optimized PDF itineraries containing budget allocations, emergency contacts, and packing advisories.
- **Multi-Trip Manager (`/app/trips`)**:
  - Multi-itinerary switching, cloning, archiving, and deletion.
  - Allows travelers to maintain concurrent trips (e.g., "Western Ghats Monsoon Trek" and "Hampi Architectural Expedition").

---

## 4. Route, Budget & Discovery Optimization

- **Topographic Route Optimizer (`/app/routes`)**:
  - Interactive Leaflet cartography plotting active journey stops with numbered custom vector pins and polyline connections.
  - **Western Ghats Speed Calibration**: Differentiates between flat national highways (NH 48, NH 75 @ 65–80 km/h) and winding mountain ghat roads (Agumbe, Charmadi @ 30–40 km/h), computing realistic travel times.
  - Dynamic bounding box calculation ensuring the map auto-fits any selected route.
- **Three-Scenario Budget Optimizer (`/app/budget`)**:
  - Simulates three parallel travel tiers: **Saver**, **Balanced**, and **Comfort**.
  - Itemized 6-category breakdown: *Accommodation, Dining, Transport, Activities, Monument Entry Fees, and 10–15% Emergency Contingency*.
  - Calculates per-person vs total group expenditures and flags subsistence budget warnings.
- **Hidden Gems & Offbeat Discoveries (`/app/discover`, `/app/gems`)**:
  - Curated index of 12 lesser-known secular Karnataka landmarks (e.g., Yana karst monoliths, Barkana Falls, Honnemardu backwaters, Gandikota-like gorges).
  - Accompanied by senior accessibility ratings, ecological safety guidelines, and seasonal crowd density indicators.

---

## 5. Group Coordination, Weather & Intelligence

- **Group Planning & Debt Minimization (`/app/group`)**:
  - Collaborative preference voting and destination consensus tracking.
  - Shared expense logging with payer attribution.
  - **Bipartite Debt Minimization Algorithm**: Computes the mathematically minimal number of peer-to-peer settlement transactions required to balance the group ledger.
- **Live Weather & Environmental Conditions (`/app/conditions`, `/app/weather`)**:
  - Live weather forecasts powered by Open-Meteo under CC BY 4.0 (temperature, rainfall, wind velocity, UV index).
  - Official advisory bulletins reflecting Karnataka State Disaster Management Authority (KSDMA) and PWD guidelines.
  - Elevation-calibrated thermal advisories for high-altitude locations (e.g., Mullayanagiri, Kemmangundi).
- **Adaptive Travel Intelligence (`/app/adaptive`)**:
  - Continuously monitors active trip parameters against environmental disruptions.
  - Generates proactive replanning proposals (e.g., recommending indoor heritage sites during heavy ghat downpours).
  - Strictly requires user confirmation before altering any itinerary stop.

---

## 6. Global AI Companion & Voice Engine

- **Context-Aware Global AI Companion**:
  - Docked / floating conversational panel accessible across all 14 workspaces.
  - Grounded in active trip context: understands current stops, remaining budget, weather conditions, and selected language.
  - **3-Tier Intelligence Fallback**:
    1. *Tier 1 (On-Device)*: Chrome Built-in Prompt API (Gemini Nano) for instant, local, zero-cost inference.
    2. *Tier 2 (Cloud)*: Serverless Google Gemini 1.5 Flash route handler with strict anti-hallucination prompts.
    3. *Tier 3 (Offline)*: Deterministic Rule & Intent Engine providing instant, zero-cost answers without cloud APIs.
  - **3-Tier Safe Action Gating**:
    - *Category A*: Informational answers rendered directly in chat.
    - *Category B*: Visual one-click navigation pills leading to target workspaces.
    - *Category C*: High-impact mutations (resets, deletions) gated behind explicit traveler confirmation modals.
- **Browser-Native Voice Engine**:
  - Integrated speech-to-text (STT) and text-to-speech (TTS) utilizing standard Web Speech APIs.
  - Audio text cleanser: converts `₹` currency symbols to spoken words, strips markdown formatting, and sanitizes URLs.
  - Synthesized Web Audio API sound effects (chimes, clicks, alerts) with zero external audio assets.

