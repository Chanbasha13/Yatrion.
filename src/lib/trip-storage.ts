import type { TripPreferences } from "./planner-types";
import type { GeneratedItinerary, ItineraryDay, ItineraryStop } from "./itinerary-engine";
import type { OptimizedRoutePlan } from "./routes/route-types";
import type { OptimizedBudgetPlan } from "./budget/budget-types";
import type { GroupTripState } from "./group/group-types";

/* =========================================================================
   LOCAL STORAGE SCHEMA & TYPES (v1)
   ========================================================================= */

export const TRIP_STORAGE_KEY = "yatrion-trip-v1";

export interface StoredTripState {
  version: 1;
  savedAt: string;
  preferences: TripPreferences;
  originalItinerary: GeneratedItinerary;
  editedDays: ItineraryDay[];
  removedStops: Record<number, ItineraryStop[]>;
  dayNotes: Record<number, string>;
  stopNotes: Record<string, string>;
  completedStopKeys: string[];
  optimizedRoute?: OptimizedRoutePlan;
  budgetPlan?: OptimizedBudgetPlan;
  savedGemIds?: string[];
  groupState?: GroupTripState;
  acceptedRecommendationIds?: string[];
  rejectedRecommendationIds?: string[];
  serverVersion?: number;
  syncState?: "synced" | "syncing" | "offline" | "conflict" | "error";
}

/**
 * Type guard to strictly validate deserialized JSON from localStorage.
 */
export function isValidStoredTrip(obj: unknown): obj is StoredTripState {
  if (!obj || typeof obj !== "object") return false;

  const candidate = obj as Record<string, unknown>;

  // Check version
  if (candidate.version !== 1) return false;

  // Check timestamp
  if (typeof candidate.savedAt !== "string") return false;

  // Check preferences
  if (!candidate.preferences || typeof candidate.preferences !== "object") {
    return false;
  }
  const prefs = candidate.preferences as Record<string, unknown>;
  if (
    typeof prefs.startingLocation !== "string" ||
    typeof prefs.durationDays !== "number" ||
    !Array.isArray(prefs.interests)
  ) {
    return false;
  }

  // Check originalItinerary
  if (
    !candidate.originalItinerary ||
    typeof candidate.originalItinerary !== "object"
  ) {
    return false;
  }
  const itin = candidate.originalItinerary as Record<string, unknown>;
  if (
    typeof itin.id !== "string" ||
    typeof itin.title !== "string" ||
    !Array.isArray(itin.days)
  ) {
    return false;
  }

  // Check editedDays
  if (!Array.isArray(candidate.editedDays) || candidate.editedDays.length === 0) {
    return false;
  }

  // Check dictionary objects
  if (
    candidate.dayNotes !== undefined &&
    (typeof candidate.dayNotes !== "object" || candidate.dayNotes === null)
  ) {
    return false;
  }
  if (
    candidate.stopNotes !== undefined &&
    (typeof candidate.stopNotes !== "object" || candidate.stopNotes === null)
  ) {
    return false;
  }
  if (
    candidate.completedStopKeys !== undefined &&
    !Array.isArray(candidate.completedStopKeys)
  ) {
    return false;
  }
  if (
    candidate.savedGemIds !== undefined &&
    !Array.isArray(candidate.savedGemIds)
  ) {
    return false;
  }
  if (candidate.groupState !== undefined) {
    if (typeof candidate.groupState !== "object" || candidate.groupState === null) {
      return false;
    }
    const gs = candidate.groupState as Record<string, unknown>;
    if (typeof gs.config !== "object" || gs.config === null) {
      return false;
    }
    const cfg = gs.config as Record<string, unknown>;
    if (!Array.isArray(cfg.travellers)) {
      return false;
    }
  }
  if (
    candidate.acceptedRecommendationIds !== undefined &&
    !Array.isArray(candidate.acceptedRecommendationIds)
  ) {
    return false;
  }
  if (
    candidate.rejectedRecommendationIds !== undefined &&
    !Array.isArray(candidate.rejectedRecommendationIds)
  ) {
    return false;
  }

  return true;
}

/* =========================================================================
   STORAGE OPERATIONS (SAFE FOR CLIENT-SIDE ONLY)
   ========================================================================= */

/**
 * Checks if browser localStorage is supported and accessible (handles incognito/private modes).
 */
export function isStorageAvailable(): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  try {
    const testKey = "__yatrion_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely persists the current trip state to localStorage.
 */
export function saveTripToStorage(
  preferences: TripPreferences,
  originalItinerary: GeneratedItinerary,
  editedDays: ItineraryDay[],
  removedStops: Record<number, ItineraryStop[]>,
  dayNotes: Record<number, string>,
  stopNotes: Record<string, string>,
  completedStopKeys: string[],
  optimizedRoute?: OptimizedRoutePlan,
  budgetPlan?: OptimizedBudgetPlan,
  savedGemIds?: string[],
  groupState?: GroupTripState,
  acceptedRecommendationIds?: string[],
  rejectedRecommendationIds?: string[]
): boolean {
  if (!isStorageAvailable()) return false;

  try {
    const payload: StoredTripState = {
      version: 1,
      savedAt: new Date().toISOString(),
      preferences,
      originalItinerary,
      editedDays,
      removedStops,
      dayNotes,
      stopNotes,
      completedStopKeys,
      optimizedRoute,
      budgetPlan,
      savedGemIds,
      groupState,
      acceptedRecommendationIds,
      rejectedRecommendationIds,
    };
    window.localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn("Yatrion: Could not save trip to local storage", err);
    return false;
  }
}

/**
 * Safely loads and validates the stored trip from localStorage.
 * Returns null if missing, malformed, or outdated schema version.
 */
export function loadTripFromStorage(): StoredTripState | null {
  if (!isStorageAvailable()) return null;

  try {
    const raw = window.localStorage.getItem(TRIP_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (isValidStoredTrip(parsed)) {
      return parsed;
    } else {
      console.warn("Yatrion: Stored trip failed validation; discarding invalid state.");
      // Safely remove corrupted/invalid entry
      window.localStorage.removeItem(TRIP_STORAGE_KEY);
      return null;
    }
  } catch (err) {
    console.warn("Yatrion: Error reading from local storage", err);
    return null;
  }
}

/**
 * Clears the stored trip from localStorage.
 */
export function clearTripFromStorage(): boolean {
  if (!isStorageAvailable()) return false;

  try {
    window.localStorage.removeItem(TRIP_STORAGE_KEY);
    return true;
  } catch (err) {
    console.warn("Yatrion: Error clearing local storage", err);
    return false;
  }
}

/**
 * Checks whether a valid saved trip currently exists in storage.
 */
export function hasSavedTrip(): boolean {
  return loadTripFromStorage() !== null;
}

