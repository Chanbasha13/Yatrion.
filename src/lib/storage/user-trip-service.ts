/**
 * User-Scoped Trip & Saved Places Persistence Service
 *
 * Dual-Layer Cloud-First Architecture with Optimistic Local Caching:
 * 1. Cloud Database is the source of truth for authenticated registered users.
 * 2. Browser localStorage acts as a high-speed optimistic cache for instant UI rendering.
 * 3. Asynchronous background synchronization prevents UI latency.
 * 4. Safe, idempotent migration uploads existing localStorage data to the cloud on login.
 * 5. Strict Demo Traveler isolation: Demo data remains 100% client-scoped and never pollutes cloud DB.
 */

import {
  TRIP_STORAGE_KEY,
  isValidStoredTrip,
  isStorageAvailable,
  type StoredTripState,
} from "../trip-storage";

export type { StoredTripState };
import type { TripPreferences } from "../planner-types";
import { generateItinerary } from "../itinerary-engine";
import { optimizeKarnatakaRoute } from "../routes/route-optimizer";
import { calculateOptimizedBudget } from "../budget/budget-optimizer";

export function getUserTripStorageKey(userId?: string, isDemo?: boolean): string {
  if (isDemo || userId === "user-demo-karnataka") {
    return "yatrion-trip-demo-v1";
  }
  if (userId) {
    return `yatrion-trip-${userId}-v1`;
  }
  return TRIP_STORAGE_KEY;
}

export function getUserSavedPlacesStorageKey(userId?: string): string {
  if (userId) {
    return `yatrion-saved-places-${userId}-v1`;
  }
  return "yatrion-saved-places-guest-v1";
}

export function getUserMigrationStorageKey(userId: string): string {
  return `yatrion-trip-migrated-${userId}-v1`;
}

/**
 * Builds an authentic, seeded 4-day Karnataka journey for the Demo Traveler.
 */
export function createSeedDemoTrip(): StoredTripState {
  const demoPreferences: TripPreferences = {
    destinationMode: "explore",
    selectedDestinationIds: ["chikmagalur", "coorg"],
    startingLocation: "Bengaluru",
    durationDays: 4,
    travelStyle: "balanced",
    budget: "7k-15k",
    interests: ["nature", "wildlife", "heritage"],
    groupType: "friends",
    travellerCount: 4,
    transport: "self-drive",
  };

  const originalItinerary = generateItinerary(demoPreferences);

  // Compute deterministic route & budget for the demo trip
  const routePlan = optimizeKarnatakaRoute({
    destinationIds: ["chikmagalur", "coorg"],
    durationDays: 4,
    startingLocation: "Bengaluru",
    budget: "7k-15k",
    interests: ["nature", "wildlife", "heritage"],
    travelStyle: "balanced",
    transport: "self-drive",
    travellerCount: 4,
  });

  const budgetPlan = calculateOptimizedBudget({
    itinerary: originalItinerary,
    preferences: demoPreferences,
    routePlan,
    scenarioKey: "balanced",
    travellerCount: 4,
  });

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    preferences: demoPreferences,
    originalItinerary,
    editedDays: originalItinerary.days,
    removedStops: {},
    dayNotes: {
      1: "Stop for hot Tatte Idli breakfast near Nelamangala on NH75.",
      2: "Check morning mist visibility before Mullayanagiri summit ascent.",
    },
    stopNotes: {
      "day1-morning": "Pre-booked KSTDC jungle safari permit.",
    },
    completedStopKeys: ["day1-morning"],
    optimizedRoute: routePlan,
    budgetPlan,
    savedGemIds: ["magod-falls", "st-marys-island"],
    acceptedRecommendationIds: [],
    rejectedRecommendationIds: [],
    serverVersion: 1,
    syncState: "synced",
  };
}

/**
 * Loads the active trip for the given user from optimistic local cache.
 * Automatically seeds the Demo Traveler if empty.
 * For registered users, kicks off asynchronous cloud synchronization in the background.
 */
export function loadUserTrip(
  userId?: string,
  isDemo?: boolean,
  onSyncComplete?: (updatedTrip: StoredTripState) => void
): StoredTripState | null {
  if (!isStorageAvailable()) return null;

  const key = getUserTripStorageKey(userId, isDemo);

  try {
    const raw = window.localStorage.getItem(key);
    let cachedTrip: StoredTripState | null = null;

    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidStoredTrip(parsed)) {
        cachedTrip = parsed;
      } else {
        console.warn(`[UserTripService] Stored trip for ${key} invalid, resetting`);
        window.localStorage.removeItem(key);
      }
    }

    if (!cachedTrip) {
      if (isDemo || userId === "user-demo-karnataka") {
        const seed = createSeedDemoTrip();
        window.localStorage.setItem(key, JSON.stringify(seed));
        return seed;
      }
    }

    // If registered user, trigger background server synchronization
    if (userId && !isDemo && userId !== "user-demo-karnataka" && typeof window !== "undefined") {
      void syncUserTripWithServer(userId, cachedTrip).then((res) => {
        if (res.synced && res.trip && onSyncComplete) {
          onSyncComplete(res.trip);
        }
      });
    }

    return cachedTrip;
  } catch (err) {
    console.warn("[UserTripService] Error reading trip from storage:", err);
    return null;
  }
}

/**
 * Synchronizes client trip with cloud server database.
 * - If server has newer trip, updates local cache.
 * - If server is empty and client has valid unmigrated trip, uploads it to server.
 */
export async function syncUserTripWithServer(
  userId: string,
  cachedTrip?: StoredTripState | null
): Promise<{ synced: boolean; conflict?: boolean; trip: StoredTripState | null; error?: string }> {
  if (!userId || userId === "user-demo-karnataka" || typeof window === "undefined") {
    return { synced: false, trip: cachedTrip || null };
  }

  const key = getUserTripStorageKey(userId, false);

  try {
    const res = await fetch("/api/trips", { method: "GET" });
    if (!res.ok) {
      if (res.status === 401) {
        return { synced: false, trip: cachedTrip || null, error: "Unauthenticated" };
      }
      return { synced: false, trip: cachedTrip || null, error: "Server error" };
    }

    const data = await res.json();

    if (data.exists && data.trip) {
      const serverTrip = data.trip as StoredTripState;
      const cachedVersion = cachedTrip?.serverVersion || 0;
      const serverVersion = data.serverVersion || 1;

      if (serverVersion >= cachedVersion) {
        // Server is equal or newer -> update local cache
        const updated: StoredTripState = {
          ...serverTrip,
          serverVersion,
          syncState: "synced",
        };
        window.localStorage.setItem(key, JSON.stringify(updated));
        return { synced: true, trip: updated };
      } else {
        // Client has newer local edits not yet on server -> push to server
        if (cachedTrip) {
          const pushRes = await fetch("/api/trips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trip: cachedTrip, clientVersion: cachedTrip.serverVersion }),
          });
          if (pushRes.ok) {
            const pushData = await pushRes.json();
            const updated = { ...cachedTrip, serverVersion: pushData.version, syncState: "synced" as const };
            window.localStorage.setItem(key, JSON.stringify(updated));
            return { synced: true, trip: updated };
          }
        }
      }
    } else {
      // Server has NO trip. If local cache has a valid trip, migrate it!
      if (cachedTrip && isValidStoredTrip(cachedTrip)) {
        const uploadRes = await fetch("/api/trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trip: cachedTrip, clientVersion: 1 }),
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          const updated = { ...cachedTrip, serverVersion: uploadData.version, syncState: "synced" as const };
          window.localStorage.setItem(key, JSON.stringify(updated));
          window.localStorage.setItem(getUserMigrationStorageKey(userId), "true");
          return { synced: true, trip: updated };
        }
      }
    }

    return { synced: true, trip: cachedTrip || null };
  } catch (err) {
    console.warn("[UserTripService] Network sync failed (operating offline):", err);
    if (cachedTrip) {
      cachedTrip.syncState = "offline";
    }
    return { synced: false, trip: cachedTrip || null, error: "Network offline" };
  }
}

/**
 * Persists trip state for the specified user.
 * Writes to local cache immediately and background pushes to cloud database.
 */
export function saveUserTrip(
  userId: string | undefined,
  isDemo: boolean | undefined,
  trip: StoredTripState
): boolean {
  if (!isStorageAvailable()) return false;

  const key = getUserTripStorageKey(userId, isDemo);
  const isCloudTenant = !!(userId && !isDemo && userId !== "user-demo-karnataka");

  try {
    // 1. Set initial sync state
    trip.syncState = isCloudTenant ? "syncing" : "synced";

    // 2. Optimistic local cache update
    window.localStorage.setItem(key, JSON.stringify(trip));

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("yatrion:sync", {
          detail: { state: trip.syncState, key, version: trip.serverVersion },
        })
      );
      window.dispatchEvent(
        new CustomEvent("yatrion:trip-updated", {
          detail: { trip, key, version: trip.serverVersion },
        })
      );
    }

    // 3. If authenticated non-demo user, push to cloud API
    if (isCloudTenant && typeof window !== "undefined") {
      void fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip, clientVersion: trip.serverVersion }),
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            trip.serverVersion = data.version;
            trip.syncState = "synced";
            window.localStorage.setItem(key, JSON.stringify(trip));
          } else if (res.status === 409) {
            trip.syncState = "conflict";
            window.localStorage.setItem(key, JSON.stringify(trip));
            console.warn("[UserTripService] Trip sync conflict: server has newer version.");
          } else if (res.status >= 500) {
            trip.syncState = "error";
            window.localStorage.setItem(key, JSON.stringify(trip));
          } else {
            trip.syncState = "offline";
            window.localStorage.setItem(key, JSON.stringify(trip));
          }
          window.dispatchEvent(
            new CustomEvent("yatrion:sync", {
              detail: { state: trip.syncState, key, version: trip.serverVersion },
            })
          );
        })
        .catch(() => {
          trip.syncState = "offline";
          window.localStorage.setItem(key, JSON.stringify(trip));
          window.dispatchEvent(
            new CustomEvent("yatrion:sync", {
              detail: { state: "offline", key, version: trip.serverVersion },
            })
          );
        });
    }

    return true;
  } catch (err) {
    console.warn(`[UserTripService] Could not persist trip for ${key}:`, err);
    return false;
  }
}

/**
 * Clears the user's active trip from local cache and cloud database.
 */
export function clearUserTrip(userId?: string, isDemo?: boolean): boolean {
  if (!isStorageAvailable()) return false;
  const key = getUserTripStorageKey(userId, isDemo);
  try {
    window.localStorage.removeItem(key);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("yatrion:trip-updated", {
          detail: { trip: null, key },
        })
      );
    }

    if (userId && !isDemo && userId !== "user-demo-karnataka" && typeof window !== "undefined") {
      void fetch("/api/trips", { method: "DELETE" }).catch((err) =>
        console.warn("[UserTripService] Failed to delete trip from server:", err)
      );
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieves the user's saved attraction IDs with cloud synchronization.
 */
export function getUserSavedPlaces(userId?: string, isDemo?: boolean): string[] {
  if (!isStorageAvailable()) return ["st-marys-island-explore", "mullayanagiri-peak"];

  const key = getUserSavedPlacesStorageKey(userId);
  try {
    const raw = window.localStorage.getItem(key);
    let localPlaces: string[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      localPlaces = Array.isArray(parsed) ? parsed : [];
    } else {
      localPlaces = isDemo ? ["st-marys-island-explore", "mullayanagiri-peak"] : [];
    }

    // Background sync with cloud for registered users
    if (userId && !isDemo && userId !== "user-demo-karnataka" && typeof window !== "undefined") {
      void fetch("/api/saved-places", { method: "GET" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.savedPlaces)) {
            window.localStorage.setItem(key, JSON.stringify(data.savedPlaces));
          }
        })
        .catch(() => {});
    }

    return localPlaces;
  } catch {
    return [];
  }
}

/**
 * Toggles a saved place for the user with optimistic local update and cloud synchronization.
 */
export function toggleUserSavedPlace(
  userId: string | undefined,
  placeId: string,
  isDemo?: boolean
): boolean {
  if (!isStorageAvailable() || !placeId) return false;

  const key = getUserSavedPlacesStorageKey(userId);
  try {
    const current = getUserSavedPlaces(userId, isDemo);
    let updated: string[];
    let action: "add" | "remove";

    if (current.includes(placeId)) {
      updated = current.filter((id) => id !== placeId);
      action = "remove";
    } else {
      updated = [...current, placeId];
      action = "add";
    }

    window.localStorage.setItem(key, JSON.stringify(updated));

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("yatrion:saved-places-updated", {
          detail: { savedPlaces: updated, placeId, action },
        })
      );
    }

    // Background push to server
    if (userId && !isDemo && userId !== "user-demo-karnataka" && typeof window !== "undefined" && window.location?.origin) {
      void fetch("/api/saved-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId, action }),
      }).catch((err) =>
        console.warn("[UserTripService] Failed to sync saved place to server:", err)
      );
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a specific place is saved by the user.
 */
export function isUserPlaceSaved(userId: string | undefined, placeId: string, isDemo?: boolean): boolean {
  const current = getUserSavedPlaces(userId, isDemo);
  return current.includes(placeId);
}

/**
 * Idempotently migrates existing localStorage trip data to cloud database.
 */
export async function migrateLocalTripToServer(
  userId: string
): Promise<{ migrated: boolean; error?: string }> {
  if (!userId || userId === "user-demo-karnataka" || typeof window === "undefined") {
    return { migrated: false };
  }

  const migrationKey = getUserMigrationStorageKey(userId);
  const isAlreadyMigrated = window.localStorage.getItem(migrationKey) === "true";
  if (isAlreadyMigrated) {
    return { migrated: true };
  }

  const key = getUserTripStorageKey(userId, false);
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(migrationKey, "true");
    return { migrated: true };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isValidStoredTrip(parsed)) {
      return { migrated: false, error: "Local trip payload invalid." };
    }

    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trip: parsed, clientVersion: 1 }),
    });

    if (res.ok) {
      window.localStorage.setItem(migrationKey, "true");
      return { migrated: true };
    } else {
      const data = await res.json().catch(() => ({}));
      return { migrated: false, error: data.error || "Failed to upload trip to server." };
    }
  } catch (err) {
    return { migrated: false, error: err instanceof Error ? err.message : "Network error" };
  }
}
