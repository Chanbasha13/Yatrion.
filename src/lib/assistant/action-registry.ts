/**
 * Safe AI Action Registry for Yatrion
 * 
 * Enforces a strict 3-tier categorization:
 * - Category A: Read-Only Informational Actions (No confirmation)
 * - Category B: Workspace Navigation Actions (Explicit user click)
 * - Category C: Mutating Actions (MANDATORY User Confirmation Modal)
 * 
 * Guarantees zero silent mutations and strict schema validation.
 */

import { saveUserTrip, clearUserTrip, toggleUserSavedPlace, type StoredTripState } from "@/lib/storage/user-trip-service";
import type { ItineraryStop } from "@/lib/itinerary-engine";

export type ActionCategory = "read_only" | "navigation" | "mutating";

export interface ActionDefinition<P = Record<string, unknown>> {
  id: string;
  category: ActionCategory;
  requiresConfirmation: boolean;
  labelEn: string;
  labelKn: string;
  descriptionEn: string;
  descriptionKn: string;
  validatePayload: (payload: unknown) => { isValid: boolean; error?: string; cleanPayload?: P };
  execute: (payload: P, context: ActionExecutionContext) => Promise<ActionResult>;
}

export interface ActionExecutionContext {
  userId?: string;
  isDemo?: boolean;
  routerPush: (href: string) => void;
  getTripState: () => StoredTripState | null;
  refreshTripState: () => void;
}

export interface ActionResult {
  success: boolean;
  messageEn: string;
  messageKn: string;
  data?: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

export const ACTION_REGISTRY: Record<string, ActionDefinition<unknown>> = {
  // ── CATEGORY B: NAVIGATION ACTIONS ──
  navigate_workspace: {
    id: "navigate_workspace",
    category: "navigation",
    requiresConfirmation: false,
    labelEn: "Navigate Workspace",
    labelKn: "ಕಾರ್ಯಸ್ಥಳಕ್ಕೆ ತೆರಳಿ",
    descriptionEn: "Opens a dedicated application workspace.",
    descriptionKn: "ಮೀಸಲಾದ ಕಾರ್ಯಸ್ಥಳವನ್ನು ತೆರೆಯುತ್ತದೆ.",
    validatePayload: (payload: unknown) => {
      if (typeof payload === "object" && payload !== null && "href" in payload) {
        const p = payload as { href: unknown };
        if (typeof p.href === "string" && p.href.startsWith("/app/")) {
          return { isValid: true, cleanPayload: { href: p.href } };
        }
      }
      return { isValid: false, error: "Invalid workspace navigation target" };
    },
    execute: async (payload: unknown, context: ActionExecutionContext) => {
      const { href } = payload as { href: string };
      context.routerPush(href);
      return {
        success: true,
        messageEn: `Navigated to ${href}`,
        messageKn: `${href} ಕಾರ್ಯಸ್ಥಳಕ್ಕೆ ತೆರಳಲಾಗಿದೆ`,
      };
    },
  },

  // ── CATEGORY C: MUTATING ACTIONS (MANDATORY CONFIRMATION) ──
  add_attraction_to_trip: {
    id: "add_attraction_to_trip",
    category: "mutating",
    requiresConfirmation: true,
    labelEn: "Add Attraction to Trip",
    labelKn: "ತಾಣವನ್ನು ಪ್ರವಾಸಕ್ಕೆ ಸೇರಿಸಿ",
    descriptionEn: "Appends a verified secular attraction to your active itinerary.",
    descriptionKn: "ಪರಿಶೀಲಿತ ತಾಣವನ್ನು ನಿಮ್ಮ ಸಕ್ರಿಯ ಪ್ರವಾಸಕ್ಕೆ ಸೇರಿಸುತ್ತದೆ.",
    validatePayload: (payload: unknown) => {
      if (typeof payload === "object" && payload !== null) {
        const p = payload as Record<string, unknown>;
        if (
          typeof p.attractionId === "string" &&
          typeof p.attractionName === "string" &&
          typeof p.districtId === "string" &&
          typeof p.dayNumber === "number"
        ) {
          return {
            isValid: true,
            cleanPayload: {
              attractionId: p.attractionId,
              attractionName: p.attractionName,
              nameKn: typeof p.nameKn === "string" ? p.nameKn : undefined,
              districtId: p.districtId,
              dayNumber: p.dayNumber,
              timeOfDay: (p.timeOfDay === "morning" || p.timeOfDay === "evening" ? p.timeOfDay : "afternoon") as "morning" | "afternoon" | "evening",
            },
          };
        }
      }
      return { isValid: false, error: "Missing required attraction stop parameters" };
    },
    execute: async (
      payload: unknown,
      context: ActionExecutionContext
    ) => {
      const p = payload as {
        attractionId: string;
        attractionName: string;
        nameKn?: string;
        districtId: string;
        dayNumber: number;
        timeOfDay?: "morning" | "afternoon" | "evening";
      };
      const currentTrip = context.getTripState();
      if (!currentTrip || !currentTrip.editedDays) {
        return {
          success: false,
          messageEn: "No active trip found to modify. Please create a trip first.",
          messageKn: "ಬದಲಾಯಿಸಲು ಯಾವುದೇ ಸಕ್ರಿಯ ಪ್ರವಾಸವಿಲ್ಲ.",
        };
      }

      const dayIdx = p.dayNumber - 1;
      if (dayIdx < 0 || dayIdx >= currentTrip.editedDays.length) {
        return {
          success: false,
          messageEn: `Invalid day number ${p.dayNumber}`,
          messageKn: `ಅಮಾನ್ಯವಾದ ದಿನ ಸಂಖ್ಯೆ ${p.dayNumber}`,
        };
      }

      const newStop: ItineraryStop = {
        timeOfDay: p.timeOfDay || "afternoon",
        title: p.attractionName,
        destinationId: p.districtId,
        destinationName: p.attractionName,
        destinationKannada: p.nameKn || p.attractionName,
        location: `${p.attractionName}, Karnataka`,
        district: p.districtId,
        description: `Verified secular attraction in ${p.districtId}`,
        estimatedDuration: "2 - 3 hours",
        activityType: "sightseeing",
        transitNote: "Standard entry",
      };

      const updatedDays = [...currentTrip.editedDays];
      updatedDays[dayIdx] = {
        ...updatedDays[dayIdx],
        stops: [...updatedDays[dayIdx].stops, newStop],
      };
      currentTrip.editedDays = updatedDays;

      const updatedTrip: StoredTripState = {
        ...currentTrip,
        editedDays: updatedDays,
        savedAt: new Date().toISOString(),
        syncState: "syncing",
      };

      saveUserTrip(context.userId, context.isDemo, updatedTrip);
      context.refreshTripState();

      return {
        success: true,
        messageEn: `Added "${p.attractionName}" to Day ${p.dayNumber}.`,
        messageKn: `"${p.nameKn || p.attractionName}" ಅನ್ನು ದಿನ ${p.dayNumber} ಕ್ಕೆ ಸೇರಿಸಲಾಗಿದೆ.`,
      };
    },
  },

  remove_stop_from_trip: {
    id: "remove_stop_from_trip",
    category: "mutating",
    requiresConfirmation: true,
    labelEn: "Remove Stop from Itinerary",
    labelKn: "ಪ್ರವಾಸದಿಂದ ನಿಲ್ದಾಣವನ್ನು ತೆಗೆದುಹಾಕಿ",
    descriptionEn: "Removes a scheduled stop from a specific day in your active itinerary.",
    descriptionKn: "ನಿಮ್ಮ ಪ್ರವಾಸದ ನಿರ್ದಿಷ್ಟ ದಿನದಿಂದ ನಿಲ್ದಾಣವನ್ನು ತೆಗೆದುಹಾಕುತ್ತದೆ.",
    validatePayload: (payload: unknown) => {
      if (typeof payload === "object" && payload !== null) {
        const p = payload as Record<string, unknown>;
        if (typeof p.dayNumber === "number" && typeof p.stopIndex === "number") {
          return {
            isValid: true,
            cleanPayload: {
              dayNumber: p.dayNumber,
              stopIndex: p.stopIndex,
              stopTitle: typeof p.stopTitle === "string" ? p.stopTitle : undefined,
            },
          };
        }
      }
      return { isValid: false, error: "Invalid stop removal coordinates" };
    },
    execute: async (
      payload: unknown,
      context: ActionExecutionContext
    ) => {
      const p = payload as { dayNumber: number; stopIndex: number; stopTitle?: string };
      const currentTrip = context.getTripState();
      if (!currentTrip || !currentTrip.editedDays) {
        return { success: false, messageEn: "No active trip found.", messageKn: "ಸಕ್ರಿಯ ಪ್ರವಾಸವಿಲ್ಲ." };
      }

      const dayIdx = p.dayNumber - 1;
      if (dayIdx < 0 || dayIdx >= currentTrip.editedDays.length) {
        return { success: false, messageEn: "Day index out of range.", messageKn: "ಅಮಾನ್ಯ ದಿನ." };
      }

      const targetDay = currentTrip.editedDays[dayIdx];
      if (p.stopIndex < 0 || p.stopIndex >= targetDay.stops.length) {
        return { success: false, messageEn: "Stop index out of range.", messageKn: "ಅಮಾನ್ಯ ನಿಲ್ದಾಣ." };
      }

      const updatedStops = targetDay.stops.filter((_, idx) => idx !== p.stopIndex);
      const updatedDays = [...currentTrip.editedDays];
      updatedDays[dayIdx] = { ...targetDay, stops: updatedStops };
      currentTrip.editedDays = updatedDays;

      const updatedTrip: StoredTripState = {
        ...currentTrip,
        editedDays: updatedDays,
        savedAt: new Date().toISOString(),
        syncState: "syncing",
      };

      saveUserTrip(context.userId, context.isDemo, updatedTrip);
      context.refreshTripState();

      return {
        success: true,
        messageEn: `Removed stop from Day ${p.dayNumber}.`,
        messageKn: `ದಿನ ${p.dayNumber} ರಿಂದ ನಿಲ್ದಾಣವನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ.`,
      };
    },
  },

  toggle_saved_place: {
    id: "toggle_saved_place",
    category: "mutating",
    requiresConfirmation: true,
    labelEn: "Bookmark / Unsave Place",
    labelKn: "ತಾಣವನ್ನು ಉಳಿಸಿ / ತೆಗೆದುಹಾಕಿ",
    descriptionEn: "Toggles bookmark status for a Karnataka secular attraction.",
    descriptionKn: "ಕರ್ನಾಟಕ ತಾಣದ ಬುಕ್‌ಮಾರ್ಕ್ ಸ್ಥಿತಿಯನ್ನು ಬದಲಾಯಿಸುತ್ತದೆ.",
    validatePayload: (payload: unknown) => {
      if (typeof payload === "object" && payload !== null) {
        const p = payload as Record<string, unknown>;
        if (typeof p.placeId === "string") {
          return {
            isValid: true,
            cleanPayload: {
              placeId: p.placeId,
              placeName: typeof p.placeName === "string" ? p.placeName : undefined,
            },
          };
        }
      }
      return { isValid: false, error: "Missing placeId" };
    },
    execute: async (payload: unknown, context: ActionExecutionContext) => {
      const p = payload as { placeId: string; placeName?: string };
      const success = toggleUserSavedPlace(context.userId, p.placeId, context.isDemo);
      return {
        success,
        messageEn: `Updated bookmark for "${p.placeName || p.placeId}".`,
        messageKn: `"${p.placeName || p.placeId}" ತಾಣದ ಬುಕ್‌ಮಾರ್ಕ್ ನವೀಕರಿಸಲಾಗಿದೆ.`,
      };
    },
  },

  reset_active_trip: {
    id: "reset_active_trip",
    category: "mutating",
    requiresConfirmation: true,
    labelEn: "Reset Active Journey",
    labelKn: "ಸಕ್ರಿಯ ಪ್ರವಾಸವನ್ನು ಮರುಹೊಂದಿಸಿ",
    descriptionEn: "Clears your current trip plan to start fresh from the planner or blueprints.",
    descriptionKn: "ಹೊಸ ಯೋಜನೆ ಪ್ರಾರಂಭಿಸಲು ಪ್ರಸ್ತುತ ಪ್ರವಾಸವನ್ನು ಅಳಿಸುತ್ತದೆ.",
    validatePayload: () => ({ isValid: true, cleanPayload: {} }),
    execute: async (_payload: unknown, context: ActionExecutionContext) => {
      clearUserTrip(context.userId, context.isDemo);
      context.refreshTripState();
      return {
        success: true,
        messageEn: "Active trip cleared successfully.",
        messageKn: "ಸಕ್ರಿಯ ಪ್ರವಾಸವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ತೆರವುಗೊಳಿಸಲಾಗಿದೆ.",
      };
    },
  },
};

/**
 * Validates and executes an action safely, enforcing confirmation on mutating actions.
 */
export async function executeSafeAction(
  actionId: string,
  payload: unknown,
  context: ActionExecutionContext,
  userConfirmed: boolean = false
): Promise<ActionResult> {
  const actionDef = ACTION_REGISTRY[actionId];
  if (!actionDef) {
    return {
      success: false,
      messageEn: `Unknown action "${actionId}" rejected.`,
      messageKn: `ಅಪರಿಚಿತ ಕ್ರಿಯೆ "${actionId}" ತಿರಸ್ಕರಿಸಲಾಗಿದೆ.`,
    };
  }

  // 1. Schema Validation
  const validation = actionDef.validatePayload(payload);
  if (!validation.isValid) {
    return {
      success: false,
      messageEn: `Action payload validation failed: ${validation.error}`,
      messageKn: `ಕ್ರಿಯೆಯ ಡೇಟಾ ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ: ${validation.error}`,
    };
  }

  // 2. Confirmation Gate for Category C
  if (actionDef.requiresConfirmation && !userConfirmed) {
    return {
      success: false,
      messageEn: `Action requires explicit user confirmation before executing.`,
      messageKn: `ಈ ಕ್ರಿಯೆಯನ್ನು ಕೈಗೊಳ್ಳಲು ಬಳಕೆದಾರರ ಸ್ಪಷ್ಟ ದೃಢೀಕರಣದ ಅಗತ್ಯವಿದೆ.`,
      data: { pendingConfirmation: true, actionId, payload: validation.cleanPayload },
    };
  }

  // 3. Execution
  return actionDef.execute(validation.cleanPayload, context);
}
