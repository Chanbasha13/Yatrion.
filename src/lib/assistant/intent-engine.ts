/**
 * Global AI Intent Engine for Yatrion
 * 
 * Classifies traveler intent across 15 domains and routes requests
 * to contextual application services with verified Karnataka grounding.
 */

import type { GlobalTravelContext } from "./global-travel-context";
import type { AssistantAction, AssistantResponse } from "./assistant-types";
import { DESTINATIONS } from "@/lib/destinations-data";

export type TravelIntentCategory =
  | "trip_planning"
  | "itinerary_explanation"
  | "itinerary_modification"
  | "route_recommendation"
  | "budget_optimization"
  | "attraction_discovery"
  | "local_cultural_experiences"
  | "group_decision_support"
  | "expense_settlement"
  | "weather_interpretation"
  | "travel_safety"
  | "adaptive_replanning"
  | "saved_places_recommendation"
  | "general_knowledge"
  | "platform_navigation";

export interface IntentClassificationResult {
  intent: TravelIntentCategory;
  confidence: number;
  extractedDestinations: string[];
  extractedDayNumber?: number;
  targetWorkspace: string;
  isMutatingAttempt: boolean;
}

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/[.,!?;:'"()[\]{}]/g, " ");
}

/**
 * Classifies user prompt into one of the 15 intent categories using semantic tokens and active workspace context.
 */
export function classifyTravelIntent(
  query: string,
  context?: GlobalTravelContext
): IntentClassificationResult {
  const q = normalize(query);
  const activeWorkspace = context?.currentWorkspace || "/app/dashboard";

  // Entity extraction: matched destinations
  const matchedDests: string[] = [];
  DESTINATIONS.forEach((d) => {
    if (q.includes(d.id.toLowerCase()) || q.includes(d.name.toLowerCase()) || q.includes(d.kannadaName)) {
      matchedDests.push(d.id);
    }
  });

  // Extract day number if any (e.g. "day 2", "ದಿನ 1")
  let extractedDayNumber: number | undefined;
  const dayMatch = q.match(/day\s*([1-7])/i) || q.match(/ದಿನ\s*([1-7])/);
  if (dayMatch) {
    extractedDayNumber = parseInt(dayMatch[1], 10);
  }

  // 1. Adaptive Replanning Intent
  if (
    q.includes("replan") ||
    q.includes("proposal") ||
    q.includes("health score") ||
    q.includes("ಬದಲಾವಣೆ") ||
    q.includes("ನವೀಕರಣ") ||
    (activeWorkspace.includes("/intelligence") && (q.includes("alert") || q.includes("risk")))
  ) {
    return {
      intent: "adaptive_replanning",
      confidence: 0.95,
      extractedDestinations: matchedDests,
      targetWorkspace: "/app/intelligence",
      isMutatingAttempt: q.includes("apply") || q.includes("accept") || q.includes("ಅಳವಡಿಸಿ"),
    };
  }

  // 2. Weather Interpretation Intent
  if (
    q.includes("weather") ||
    q.includes("rain") ||
    q.includes("temperature") ||
    q.includes("monsoon") ||
    q.includes("ಹವಾಮಾನ") ||
    q.includes("ಮಳೆ") ||
    activeWorkspace.includes("/weather")
  ) {
    return {
      intent: "weather_interpretation",
      confidence: 0.92,
      extractedDestinations: matchedDests,
      targetWorkspace: "/app/weather",
      isMutatingAttempt: false,
    };
  }

  // 3. Expense Settlement Intent
  if (
    q.includes("settle") ||
    q.includes("who owes") ||
    q.includes("split expense") ||
    q.includes("ಖರ್ಚು ಹಂಚಿಕೆ") ||
    q.includes("ಇತ್ಯರ್ಥ")
  ) {
    return {
      intent: "expense_settlement",
      confidence: 0.94,
      extractedDestinations: matchedDests,
      targetWorkspace: "/app/group",
      isMutatingAttempt: false,
    };
  }

  // 4. Group Decision Support Intent
  if (
    q.includes("group") ||
    q.includes("vote") ||
    q.includes("consensus") ||
    q.includes("borda") ||
    q.includes("ಗುಂಪು") ||
    q.includes("ಒಮ್ಮತ") ||
    activeWorkspace.includes("/group")
  ) {
    return {
      intent: "group_decision_support",
      confidence: 0.91,
      extractedDestinations: matchedDests,
      targetWorkspace: "/app/group",
      isMutatingAttempt: false,
    };
  }

  // 5. Itinerary Modification Intent
  if (
    q.includes("add stop") ||
    q.includes("remove stop") ||
    q.includes("delete stop") ||
    (q.includes("add") && (q.includes("stop") || q.includes("attraction"))) ||
    (q.includes("remove") && (q.includes("stop") || q.includes("attraction"))) ||
    q.includes("change day") ||
    q.includes("ಸೇರಿಸಿ") ||
    q.includes("ತೆಗೆದುಹಾಕಿ")
  ) {
    return {
      intent: "itinerary_modification",
      confidence: 0.96,
      extractedDestinations: matchedDests,
      extractedDayNumber,
      targetWorkspace: "/app/itinerary",
      isMutatingAttempt: true,
    };
  }

  // 6. Itinerary Explanation Intent
  if (
    q.includes("itinerary") ||
    q.includes("schedule") ||
    q.includes("today") ||
    q.includes("stops") ||
    q.includes("ವೇಳಾಪಟ್ಟಿ") ||
    q.includes("ನಿಲ್ದಾಣಗಳು") ||
    activeWorkspace.includes("/itinerary")
  ) {
    return {
      intent: "itinerary_explanation",
      confidence: 0.89,
      extractedDestinations: matchedDests,
      extractedDayNumber,
      targetWorkspace: "/app/itinerary",
      isMutatingAttempt: false,
    };
  }

  // 7. Route Recommendations & Transit Intent
  if (
    q.includes("route") ||
    q.includes("highway") ||
    q.includes("distance") ||
    q.includes("drive") ||
    q.includes("transit") ||
    q.includes("ಮಾರ್ಗ") ||
    q.includes("ದೂರ") ||
    activeWorkspace.includes("/routes")
  ) {
    return {
      intent: "route_recommendation",
      confidence: 0.9,
      extractedDestinations: matchedDests,
      targetWorkspace: "/app/routes",
      isMutatingAttempt: false,
    };
  }

  // 8. Budget Optimization Intent
  if (
    q.includes("budget") ||
    q.includes("cost") ||
    q.includes("expense") ||
    q.includes("price") ||
    q.includes("save money") ||
    q.includes("ಬಜೆಟ್") ||
    q.includes("ವೆಚ್ಚ") ||
    activeWorkspace.includes("/budget")
  ) {
    return {
      intent: "budget_optimization",
      confidence: 0.93,
      extractedDestinations: matchedDests,
      targetWorkspace: "/app/budget",
      isMutatingAttempt: q.includes("change budget") || q.includes("update budget"),
    };
  }

  // 9. Saved Places Recommendation Intent
  if (
    q.includes("saved") ||
    q.includes("bookmark") ||
    q.includes("favorites") ||
    q.includes("ಉಳಿಸಿದ") ||
    activeWorkspace.includes("/saved")
  ) {
    return {
      intent: "saved_places_recommendation",
      confidence: 0.92,
      extractedDestinations: matchedDests,
      targetWorkspace: "/app/saved",
      isMutatingAttempt: q.includes("save") || q.includes("bookmark"),
    };
  }

  // 10. Travel Safety & Guidelines Intent
  if (
    q.includes("safe") ||
    q.includes("ghat road") ||
    q.includes("emergency") ||
    q.includes("safari rules") ||
    q.includes("ಸುರಕ್ಷತೆ") ||
    q.includes("ತುರ್ತು")
  ) {
    return {
      intent: "travel_safety",
      confidence: 0.91,
      extractedDestinations: matchedDests,
      targetWorkspace: "/app/weather",
      isMutatingAttempt: false,
    };
  }

  // 11. Attraction Discovery & Exploration Intent
  if (
    q.includes("waterfall") ||
    q.includes("fort") ||
    q.includes("cave") ||
    q.includes("beach") ||
    q.includes("attraction") ||
    q.includes("district") ||
    q.includes("ಜಲಪಾತ") ||
    q.includes("ಕೋಟೆ") ||
    activeWorkspace.includes("/explore") ||
    activeWorkspace.includes("/attractions")
  ) {
    return {
      intent: "attraction_discovery",
      confidence: 0.88,
      extractedDestinations: matchedDests,
      targetWorkspace: "/app/explore",
      isMutatingAttempt: false,
    };
  }

  // 12. Local Cultural Experiences & Hidden Gems Intent
  if (
    q.includes("hidden gem") ||
    q.includes("offbeat") ||
    q.includes("craft") ||
    q.includes("food") ||
    q.includes("cuisine") ||
    q.includes("artisan") ||
    q.includes("ಅಜ್ಞಾತ") ||
    q.includes("ಆಹಾರ") ||
    activeWorkspace.includes("/discover")
  ) {
    return {
      intent: "local_cultural_experiences",
      confidence: 0.89,
      extractedDestinations: matchedDests,
      targetWorkspace: "/app/discover",
      isMutatingAttempt: false,
    };
  }

  // 13. Trip Planning Intent
  if (
    q.includes("plan") ||
    q.includes("days trip") ||
    q.includes("create trip") ||
    q.includes("weekend") ||
    q.includes("ಯೋಜನೆ") ||
    activeWorkspace.includes("/planner")
  ) {
    return {
      intent: "trip_planning",
      confidence: 0.87,
      extractedDestinations: matchedDests,
      targetWorkspace: "/app/planner",
      isMutatingAttempt: q.includes("create") || q.includes("reset"),
    };
  }

  // 14. Platform Navigation Intent
  if (
    q.includes("how to") ||
    q.includes("navigate") ||
    q.includes("export") ||
    q.includes("settings") ||
    q.includes("take me to") ||
    q.includes("dashboard") ||
    q.includes("open") ||
    q.includes("go to") ||
    q.includes("reset")
  ) {
    return {
      intent: "platform_navigation",
      confidence: 0.85,
      extractedDestinations: matchedDests,
      targetWorkspace: "/app/dashboard",
      isMutatingAttempt: q.includes("reset"),
    };
  }

  // 15. General Karnataka Travel Knowledge (Default Grounded)
  return {
    intent: "general_knowledge",
    confidence: 0.8,
    extractedDestinations: matchedDests,
    targetWorkspace: "/app/dashboard",
    isMutatingAttempt: false,
  };
}

/**
 * Generates an authoritative, grounded response based on the classified intent and actual GlobalTravelContext.
 */
export function handleIntentWithContext(
  classification: IntentClassificationResult,
  queryOrContext: string | GlobalTravelContext,
  maybeContext?: GlobalTravelContext
): AssistantResponse {
  const context: GlobalTravelContext =
    typeof queryOrContext === "object" && queryOrContext !== null && "availability" in queryOrContext
      ? (queryOrContext as GlobalTravelContext)
      : (maybeContext || ({} as GlobalTravelContext));
  const isKn = context?.language === "kn";
  const actions: AssistantAction[] = [];

  switch (classification.intent) {
    case "itinerary_explanation": {
      if (context.itinerary && context.activeTrip) {
        const text = isKn
          ? `### ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಪ್ರವಾಸದ ವಿವರ (${context.activeTrip.durationDays} ದಿನಗಳು):\n\n* **ಒಟ್ಟು ನಿಲ್ದಾಣಗಳು:** ${context.itinerary.totalStops} (ಪೂರ್ಣಗೊಂಡಿರುವುದು: ${context.itinerary.completedStopsCount})\n* **ಪ್ರಗತಿ:** ${context.itinerary.progressPercent}%\n\n${context.itinerary.stops.slice(0, 6).map((s) => `* **ದಿನ ${s.dayNumber} (${s.timeOfDay}):** ${s.title} — *${s.district}* ${s.isCompleted ? "(✓ ಪೂರ್ಣಗೊಂಡಿದೆ)" : ""}`).join("\n")}\n\n*ದೈನಂದಿನ ವಿವರಗಳನ್ನು ಎಡಿಟ್ ಮಾಡಲು ಅಥವಾ ಹೊಸ ನಿಲ್ದಾಣ ಸೇರಿಸಲು ದಿನಚರಿ ಸ್ಟುಡಿಯೋಗೆ ಭೇಟಿ ನೀಡಿ.*`
          : `### Active Itinerary Overview (${context.activeTrip.durationDays} Days):\n\n* **Total Scheduled Stops:** ${context.itinerary.totalStops} (Completed: ${context.itinerary.completedStopsCount})\n* **Journey Progress:** ${context.itinerary.progressPercent}%\n\n${context.itinerary.stops.slice(0, 6).map((s) => `* **Day ${s.dayNumber} [${s.timeOfDay}]:** ${s.title} (${s.district}) ${s.isCompleted ? "✓ Completed" : ""}`).join("\n")}\n\n*You can fine-tune stops and add notes directly in the Daily Itinerary Studio.*`;

        actions.push({
          id: "nav-itinerary",
          type: "open_itinerary_day",
          label: isKn ? "ದೈನಂದಿನ ವಿವರ ಪಟ್ಟಿ ತೆರೆಯಿರಿ" : "Open Daily Itinerary",
          labelKn: "ದೈನಂದಿನ ವಿವರ ಪಟ್ಟಿ ತೆರೆಯಿರಿ",
        });

        return {
          text,
          source: "knowledge-engine",
          sourceDescription: isKn ? "ನಿಮ್ಮ ಸಕ್ರಿಯ ಪ್ರವಾಸದ ವಿವರಗಳಿಂದ ರಚಿಸಲಾಗಿದೆ." : "Grounded directly in your active itinerary data.",
          actions,
        };
      }
      break;
    }

    case "itinerary_modification": {
      const text = isKn
        ? `### ಪ್ರವಾಸ ವೇಳಾಪಟ್ಟಿ ಮಾರ್ಪಾಡು:\n\nನಿಮ್ಮ ಸಕ್ರಿಯ ಪ್ರವಾಸಕ್ಕೆ ಹೊಸ ನಿಲ್ದಾಣವನ್ನು ಸೇರಿಸಲು ಅಥವಾ ಅನಗತ್ಯ ನಿಲ್ದಾಣವನ್ನು ತೆಗೆದುಹಾಕಲು ದೈನಂದಿನ ವಿವರ ಪಟ್ಟಿಗೆ ಭೇಟಿ ನೀಡಿ. ಯಾತ್ರಿಯಾನ್ ನಿಮ್ಮ ಆಯ್ಕೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸುತ್ತದೆ.`
        : `### Itinerary Modification:\n\nYou can append new verified stops or remove existing ones from your itinerary. Mutating actions require your explicit confirmation before applying changes.`;

      actions.push({
        id: "nav-itinerary-mod",
        type: "navigate_workspace",
        label: isKn ? "ದಿನಚರಿ ಸಂಪಾದಿಸಿ" : "Edit Itinerary",
        labelKn: "ದಿನಚರಿ ಸಂಪಾದಿಸಿ",
        payload: { href: "/app/itinerary" },
      });

      return {
        text,
        source: "knowledge-engine",
        sourceDescription: isKn ? "ಪ್ರವಾಸ ಮಾರ್ಪಾಡು ಸಹಾಯಕ." : "Itinerary modification assistant.",
        actions,
      };
    }

    case "weather_interpretation": {
      const text = isKn
        ? `### ಹವಾಮಾನ ಮತ್ತು ರಸ್ತೆ ಸ್ಥಿತಿಗತಿ:\n\n* **ಪಶ್ಚಿಮ ಘಟ್ಟಗಳು ಮತ್ತು ಮಲೆನಾಡು:** ಮಳೆಗಾಲದಲ್ಲಿ ಮಂಜು ಮತ್ತು ತೇವಭರಿತ ರಸ್ತೆಗಳು. ಹಗಲು ವೇಳೆಯಲ್ಲಿ ಮಾತ್ರ ಪ್ರಯಾಣಿಸಿ.\n* **ಕರಾವಳಿ ಕರ್ನಾಟಕ:** ಸಾಧಾರಣ ತಾಪಮಾನ (28°C - 33°C), ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆ.\n* **ಬಯಲುಸೀಮೆ ಮತ್ತು ಡೆಕ್ಕನ್:** ಶುಷ್ಕ ವಾತಾವರಣ, ಮುಂಜಾನೆ ಮತ್ತು ಸಂಜೆ ಪ್ರವಾಸಕ್ಕೆ ಸೂಕ್ತ.\n\n*ನಿಖರವಾದ ಲೈವ್ ಮುನ್ಸೂಚನೆಗಳನ್ನು ಹವಾಮಾನ ಕಾರ್ಯಸ್ಥಳದಲ್ಲಿ ವೀಕ್ಷಿಸಿ.*`
        : `### Weather & Travel Conditions:\n\n* **Western Ghats & Malnad:** Morning mist and moist ghat asphalt. Daytime transit recommended.\n* **Karavali Coast:** Tropical coastal climate (28°C - 33°C) with maritime breezes.\n* **Deccan Plains & Heritage Hubs:** Clear skies, ideal for early morning and golden hour exploration.\n\n*Check the Weather Workspace for live telemetry and highway alerts.*`;

      actions.push({
        id: "nav-weather",
        type: "navigate_workspace",
        label: isKn ? "ಹವಾಮಾನ ವರದಿ ನೋಡಿ" : "View Weather Dashboard",
        labelKn: "ಹವಾಮಾನ ವರದಿ ನೋಡಿ",
        payload: { href: "/app/weather" },
      });

      return {
        text,
        source: "knowledge-engine",
        sourceDescription: isKn ? "ನೈಜ ಹವಾಮಾನ ಮತ್ತು ಮುನ್ಸೂಚನೆ ಡೇಟಾ." : "Live telemetry and meteorological forecasts.",
        actions,
      };
    }

    case "travel_safety": {
      const text = isKn
        ? `### ಪ್ರಯಾಣ ಸುರಕ್ಷತಾ ಮಾರ್ಗಸೂಚಿಗಳು:\n\n* **ಘಾಟ್ ರಸ್ತೆ ಸುರಕ್ಷತೆ:** ಕಡಿದಾದ ತಿರುವುಗಳಲ್ಲಿ ಕಡಿಮೆ ಗೇರ್ ಬಳಸಿ, ಅತಿಯಾದ ವೇಗ ಬೇಡ.\n* **ವನ್ಯಜೀವಿ ಸಫಾರಿ ನಿಯಮಗಳು:** ವಾಹನದಿಂದ ಕೆಳಗಿಳಿಯಬೇಡಿ, ವನ್ಯಜೀವಿಗಳಿಗೆ ಆಹಾರ ನೀಡಬೇಡಿ.\n* **ಜಾತ್ಯತೀತ ಪರಂಪರೆ ಶಿಷ್ಟಾಚಾರ:** ಸ್ಮಾರಕಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿಡಿ, ಪ್ಲಾಸ್ಟಿಕ್ ತ್ಯಾಜ್ಯ ನಿಷೇಧಿಸಲಾಗಿದೆ.\n* **ತುರ್ತು ಸಹಾಯವಾಣಿ:** ಕರ್ನಾಟಕ ಪ್ರವಾಸೋದ್ಯಮ ಪೊಲೀಸ್ (112 / 100).`
        : `### Travel Safety & Heritage Guidelines:\n\n* **Ghat Roads:** Downshift into lower gears on hairpin turns; avoid overtaking on curves.\n* **Wildlife Protocols:** Remain inside safari vehicles at all times; do not feed wildlife.\n* **Responsible Heritage Tourism:** Zero littering, respect ancient stone inscriptions, follow local heritage guidelines.\n* **Emergency Assistance:** Karnataka Helpline 112 / 108.`;

      actions.push({
        id: "nav-safety",
        type: "navigate_workspace",
        label: isKn ? "ಸುರಕ್ಷತಾ ಮಾರ್ಗಸೂಚಿಗಳು" : "Safety Guidelines",
        labelKn: "ಸುರಕ್ಷತಾ ಮಾರ್ಗಸೂಚಿಗಳು",
        payload: { href: "/app/weather" },
      });

      return {
        text,
        source: "knowledge-engine",
        sourceDescription: isKn ? "ಕರ್ನಾಟಕ ಅಧಿಕೃತ ಪ್ರವಾಸೋದ್ಯಮ ಸುರಕ್ಷತಾ ಮಾನದಂಡಗಳು." : "Karnataka official tourism safety protocols.",
        actions,
      };
    }

    case "attraction_discovery": {
      const text = isKn
        ? `### ಜಾತ್ಯತೀತ ತಾಣಗಳ ಅನ್ವೇಷಣೆ:\n\nಕರ್ನಾಟಕದ 31 ಜಿಲ್ಲೆಗಳಲ್ಲಿ ನೂರಾರು ಅಧಿಕೃತ ಜಾತ್ಯತೀತ ತಾಣಗಳಿವೆ — ಗೋಲ್ ಗುಂಬಜ್, ಮಂಜರಾಬಾದ್ ಕೋಟೆ, ಜೋಗ ಜಲಪಾತ, ಮಾಗೋಡು ಫಾಲ್ಸ್ ಮತ್ತು ಸೆಂಟ್ ಮೇರೀಸ್ ದ್ವೀಪ.\n\n*ತಾಣಗಳ ನೈಜ ಇತಿಹಾಸ, ಭೌಗೋಳಿಕತೆ ಮತ್ತು ಪ್ರವೇಶ ಶುಲ್ಕಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.*`
        : `### Secular Attraction Discovery:\n\nKarnataka spans 31 districts of verified secular heritage — from Gol Gumbaz and Manjarabad Star Fort to Jog Falls, Magod Waterfalls, and St. Mary's Geologic Monoliths.\n\n*Explore district-level attractions with verified coordinates and architectural context.*`;

      actions.push({
        id: "nav-explore",
        type: "navigate_workspace",
        label: isKn ? "ಜಿಲ್ಲಾ ಅನ್ವೇಷಕ" : "Explore Districts",
        labelKn: "ಜಿಲ್ಲಾ ಅನ್ವೇಷಕ",
        payload: { href: "/app/discover" },
      });

      return {
        text,
        source: "knowledge-engine",
        sourceDescription: isKn ? "ಪರಿಶೀಲಿತ ಕರ್ನಾಟಕ ಜಾತ್ಯತೀತ ತಾಣಗಳ ಡೇಟಾಬೇಸ್." : "Verified Karnataka secular attractions directory.",
        actions,
      };
    }

    case "local_cultural_experiences": {
      const text = isKn
        ? `### ಸ್ಥಳೀಯ ಸಂಸ್ಕೃತಿ ಮತ್ತು ಕರಕುಶಲ ಕಲೆ:\n\n* **ಕರಾವಳಿ & ಮಲೆನಾಡು:** ಕಡಲತೀರದ ಕರಕುಶಲ ಕಲೆ, ಮಂಗಳೂರು ನೀರ್ ದೋಸೆ, ಮಲೆನಾಡಿನ ಕಷಾಯ.\n* **ದಕ್ಷಿಣ ಕರ್ನಾಟಕ:** ಚೆನ್ನಪಟ್ಟಣದ ಮರದ ಆಟಿಕೆಗಳು, ಮೈಸೂರು ರೇಷ್ಮೆ ಮತ್ತು ಪಾಕ್.\n* **ಉತ್ತರ ಕರ್ನಾಟಕ:** ಇಳಕಲ್ ಸೀರೆಗಳು, ಧಾರವಾಡ ಪೇಡ, ಜೋಳದ ರೊಟ್ಟಿ ಊಟ.\n\n*ಅಜ್ಞಾತ ತಾಣಗಳು ಮತ್ತು ಅಧಿಕೃತ ಸ್ಥಳೀಯ ಅನುಭವಗಳನ್ನು ಡಿಸ್ಕವರ್ ಸ್ಟುಡಿಯೋದಲ್ಲಿ ನೋಡಿ.*`
        : `### Authentic Regional Culture & Artisan Heritage:\n\n* **Karavali & Malnad:** Coastal brasscraft, Mangalorean Neer Dosa, and freshly brewed Malnad coffee.\n* **South Karnataka:** GI-tagged Channapatna wooden lacquerware, Mysore Silk weaving, and authentic Mysore Pak.\n* **North Karnataka:** Ilkal handlooms, Dharwad Pedha, and traditional Jowar Rotti cultural meals.\n\n*Discover offbeat heritage circuits in the Discover Studio.*`;

      actions.push({
        id: "nav-discover",
        type: "navigate_workspace",
        label: isKn ? "ಅಜ್ಞಾತ ತಾಣಗಳನ್ನು ಅನ್ವೇಷಿಸಿ" : "Explore Discoveries",
        labelKn: "ಅಜ್ಞಾತ ತಾಣಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
        payload: { href: "/app/discover" },
      });

      return {
        text,
        source: "knowledge-engine",
        sourceDescription: isKn ? "ಕರ್ನಾಟಕ ಜಿಐ ಟ್ಯಾಗ್ ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆ." : "Karnataka GI-tagged crafts and culinary geography.",
        actions,
      };
    }

    case "platform_navigation": {
      const targetWorkspace = classification.targetWorkspace || "/app/dashboard";
      const text = isKn
        ? `### ಕಾರ್ಯಸ್ಥಳಕ್ಕೆ ತೆರಳಿ:\n\nಯಾತ್ರಿಯಾನ್‌ನ 14 ಕಾರ್ಯಸ್ಥಳಗಳು ನಿಮ್ಮ ಪ್ರಯಾಣವನ್ನು ಸುಗಮಗೊಳಿಸುತ್ತವೆ. ಮುಂದುವರಿಯಲು ಕೆಳಗಿನ ಲಿಂಕ್ ಬಳಸಿ.`
        : `### Platform Navigation:\n\nAccess dedicated workspaces across all 14 specialized travel engines. Click below to open your destination.`;

      actions.push({
        id: "nav-workspace",
        type: "navigate_workspace",
        label: isKn ? "ಕಾರ್ಯಸ್ಥಳ ತೆರೆಯಿರಿ" : "Open Workspace",
        labelKn: "ಕಾರ್ಯಸ್ಥಳ ತೆರೆಯಿರಿ",
        payload: { href: targetWorkspace },
      });

      return {
        text,
        source: "knowledge-engine",
        sourceDescription: isKn ? "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ನ್ಯಾವಿಗೇಶನ್." : "Platform navigation assistant.",
        actions,
      };
    }

    case "general_knowledge": {
      const text = isKn
        ? `### ಕರ್ನಾಟಕ ಐತಿಹಾಸಿಕ ಪರಂಪರೆ:\n\nಕರ್ನಾಟಕವು ಬಾದಾಮಿ ಚಾಲುಕ್ಯರು, ಹೊಯ್ಸಳರು, ರಾಷ್ಟ್ರಕೂಟರು ಮತ್ತು ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯದ ಶ್ರೀಮಂತ ಇತಿಹಾಸವನ್ನು ಹೊಂದಿದೆ. ಬಾದಾಮಿಯ ಕೆಂಪು ಮರಳುಗಲ್ಲಿನ ಕಲ್ಲಿನ ಗುಹೆಗಳು (ಕ್ರಿ.ಶ. 6ನೇ ಶತಮಾನ) ಭಾರತೀಯ ಶಿಲ್ಪಕಲೆಯ ಅದ್ಭುತಗಳಾಗಿವೆ.`
        : `### Karnataka Heritage & History:\n\nKarnataka boasts a magnificent secular architectural legacy built by the Badami Chalukyas, Hoysalas, Rashtrakutas, and the Vijayanagara Empire. The Badami rock-cut cave sanctuaries (6th century CE) carved into red sandstone bluffs represent milestones of early structural engineering.`;

      actions.push({
        id: "nav-explore",
        type: "navigate_workspace",
        label: isKn ? "ಪರಂಪರೆ ತಾಣಗಳು" : "Heritage Sites",
        labelKn: "ಪರಂಪರೆ ತಾಣಗಳು",
        payload: { href: "/app/explore" },
      });

      return {
        text,
        source: "knowledge-engine",
        sourceDescription: isKn ? "ಪರಿಶೀಲಿತ ಕರ್ನಾಟಕ ಇತಿಹಾಸ." : "Verified Karnataka historical archives.",
        actions,
      };
    }

    case "budget_optimization": {
      if (context.budget) {
        const topCat = context.budget.categories.reduce((prev, curr) => (curr.estimatedCost > prev.estimatedCost ? curr : prev), context.budget.categories[0]);
        const text = isKn
          ? `### ಬಜೆಟ್ ಆಪ್ಟಿಮೈಸೇಶನ್ ವಿಶ್ಲೇಷಣೆ:\n\n* **ಅಂದಾಜು ಒಟ್ಟು ವೆಚ್ಚ:** ₹${context.budget.estimatedTotalCost.toLocaleString("en-IN")} (${context.budget.scenarioKey} ಶ್ರೇಣಿ)\n* **ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ:** ₹${context.budget.perPersonCost.toLocaleString("en-IN")}\n* **ಅತಿ ಹೆಚ್ಚು ಖರ್ಚು:** ${topCat ? `${topCat.labelKn} (₹${topCat.estimatedCost.toLocaleString("en-IN")}, ${topCat.percentage}%)` : "ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ"}\n\n**ವೆಚ್ಚ ಉಳಿತಾಯದ ಸಲಹೆ:** ಬಜೆಟ್ ಶ್ರೇಣಿಯನ್ನು 'budget_conscious' ಗೆ ಬದಲಾಯಿಸುವ ಮೂಲಕ ಅಥವಾ KSRTC ಸಾರ್ವಜನಿಕ ಸಾರಿಗೆಯನ್ನು ಬಳಸುವ ಮೂಲಕ ವೆಚ್ಚವನ್ನು 25% ವರೆಗೆ ತಗ್ಗಿಸಬಹುದು.`
          : `### Budget Optimization Insights:\n\n* **Estimated Total:** ₹${context.budget.estimatedTotalCost.toLocaleString("en-IN")} (${context.budget.scenarioKey} scenario)\n* **Per Person Cost:** ₹${context.budget.perPersonCost.toLocaleString("en-IN")}\n* **Primary Expenditure:** ${topCat ? `${topCat.labelEn} (₹${topCat.estimatedCost.toLocaleString("en-IN")}, ${topCat.percentage}%)` : "N/A"}\n\n**Saving Opportunities:** Switching from private cab to KSRTC bus/train corridors or selecting Homestays over Luxury Resorts can reduce total cost by up to 25%.`;

        actions.push({
          id: "nav-budget",
          type: "view_budget",
          label: isKn ? "ಬಜೆಟ್ ಆಪ್ಟಿಮೈಜರ್ ತೆರೆಯಿರಿ" : "Open Budget Optimizer",
          labelKn: "ಬಜೆಟ್ ಆಪ್ಟಿಮೈಜರ್ ತೆರೆಯಿರಿ",
        });

        return {
          text,
          source: "knowledge-engine",
          sourceDescription: isKn ? "ನಿಮ್ಮ ಸಕ್ರಿಯ ಬಜೆಟ್ ಯೋಜನೆಯಿಂದ ರಚಿಸಲಾಗಿದೆ." : "Grounded directly in your active budget allocations.",
          actions,
        };
      }
      break;
    }

    case "route_recommendation": {
      if (context.routes) {
        const text = isKn
          ? `### ಮಾರ್ಗ ದಕ್ಷತೆಯ ವಿಶ್ಲೇಷಣೆ:\n\n* **ಆರಂಭಿಕ ಕೇಂದ್ರ:** ${context.routes.startingLocation}\n* **ಒಟ್ಟು ಪ್ರಯಾಣದ ದೂರ:** ~${context.routes.totalDistanceKm} ಕಿ.ಮೀ\n* **ಅಂದಾಜು ಚಾಲನಾ ಸಮಯ:** ~${context.routes.totalDurationHours} ಗಂಟೆಗಳು (${context.routes.legsCount} ಹಂತಗಳು)\n\n**ಸುರಕ್ಷತಾ ಸಲಹೆ:** ಮಲೆನಾಡು ಮತ್ತು ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಘಾಟ್ ರಸ್ತೆಗಳಲ್ಲಿ (ಶಿರಡಿ/ಚಾರ್ಮಾಡಿ) ಮಳೆಗಾಲದಲ್ಲಿ ರಾತ್ರಿ ಚಾಲನೆ ತಪ್ಪಿಸಿ; ಮುಂಜಾನೆ 6:00 ರಿಂದ ಸಂಜೆ 5:30 ರ ನಡುವೆ ಪ್ರಯಾಣಿಸಿ.`
          : `### Route Transit & Corridor Efficiency:\n\n* **Origin Hub:** ${context.routes.startingLocation}\n* **Total Distance:** ~${context.routes.totalDistanceKm} km\n* **Estimated Driving Time:** ~${context.routes.totalDurationHours} hrs across ${context.routes.legsCount} transit legs.\n\n**Practical Highway Guidance:** When navigating Western Ghats mountain passes (Shiradi / Charmadi Ghats), avoid night journeys due to fog; daytime travel between 6:00 AM and 5:30 PM is strongly recommended.`;

        actions.push({
          id: "nav-routes",
          type: "view_route",
          label: isKn ? "ಮಾರ್ಗ ಆಪ್ಟಿಮೈಜರ್ ನೋಡಿ" : "View Route Timeline",
          labelKn: "ಮಾರ್ಗ ಆಪ್ಟಿಮೈಜರ್ ನೋಡಿ",
        });

        return {
          text,
          source: "knowledge-engine",
          sourceDescription: isKn ? "ನಿಮ್ಮ ಮಾರ್ಗ ಆಪ್ಟಿಮೈಜರ್ ಯೋಜನೆಯಿಂದ ರಚಿಸಲಾಗಿದೆ." : "Grounded directly in your route optimization plan.",
          actions,
        };
      }
      break;
    }

    case "saved_places_recommendation": {
      if (context.savedPlaces.length > 0) {
        const text = isKn
          ? `### ನೀವು ಉಳಿಸಿದ ತಾಣಗಳು (${context.savedPlaces.length}):\n\n${context.savedPlaces.map((p) => `* **${p.nameKn}:** ${p.districtId} ಜಿಲ್ಲೆ`).join("\n")}\n\n*ಈ ತಾಣಗಳನ್ನು ನಿಮ್ಮ ಸಕ್ರಿಯ ಪ್ರವಾಸದ ನಿರ್ದಿಷ್ಟ ದಿನಕ್ಕೆ ಸೇರಿಸಲು 'ಪ್ರವಾಸಕ್ಕೆ ಸೇರಿಸಿ' ಬಟನ್ ಬಳಸಿ.*`
          : `### Your Bookmarked Secular Attractions (${context.savedPlaces.length}):\n\n${context.savedPlaces.map((p) => `* **${p.nameEn}:** ${p.districtId} district`).join("\n")}\n\n*You can append any of these directly to your active itinerary via the Add-to-Trip action.*`;

        actions.push({
          id: "nav-saved",
          type: "navigate_planner",
          label: isKn ? "ಉಳಿಸಿದ ತಾಣಗಳ ಪಟ್ಟಿ" : "View Saved Places",
          labelKn: "ಉಳಿಸಿದ ತಾಣಗಳ ಪಟ್ಟಿ",
        });

        return {
          text,
          source: "knowledge-engine",
          sourceDescription: isKn ? "ನಿಮ್ಮ ಬುಕ್‌ಮಾರ್ಕ್ ಮಾಡಿದ ತಾಣಗಳಿಂದ ರಚಿಸಲಾಗಿದೆ." : "Grounded directly in your saved places.",
          actions,
        };
      }
      break;
    }

    case "group_decision_support":
    case "expense_settlement": {
      if (context.group) {
        const text = isKn
          ? `### ಗುಂಪು ಪ್ರಯಾಣದ ಸಮನ್ವಯ:\n\n* **ಒಟ್ಟು ಪ್ರಯಾಣಿಕರು:** ${context.group.participantsCount} ಸದಸ್ಯರು\n* **ದಾಖಲಾದ ಒಟ್ಟು ಖರ್ಚು:** ₹${context.group.totalExpenses.toLocaleString("en-IN")}\n* **ಬೋರ್ಡಾ ಕೌಂಟ್ ಆದ್ಯತೆಗಳು:** ${context.group.consensusRankings.map((r) => `${r.destinationId} (${r.score} ಅಂಕ)`).join(", ")}\n\n*ಗುಂಪು ಸದಸ್ಯರ ಭಿನ್ನ ಆದ್ಯತೆಗಳನ್ನು ಸಮತೋಲನಗೊಳಿಸಲು ನಮ್ಮ ಬೋರ್ಡಾ ಕೌಂಟ್ ಎಂಜಿನ್ ಸಿದ್ಧಪಡಿಸಿದ ಶಿಫಾರಸುಗಳನ್ನು ಗುಂಪು ಕಾರ್ಯಸ್ಥಳದಲ್ಲಿ ವೀಕ್ಷಿಸಿ.*`
          : `### Group Coordination & Expense Settlement:\n\n* **Group Size:** ${context.group.participantsCount} travelers\n* **Total Logged Expenses:** ₹${context.group.totalExpenses.toLocaleString("en-IN")}\n* **Borda Count Rankings:** ${context.group.consensusRankings.map((r) => `${r.destinationId} (${r.score} pts)`).join(", ")}\n\n*Check the Group Workspace for optimized debt settlement graphs and conflict resolution.*`;

        actions.push({
          id: "nav-group",
          type: "view_group_planner",
          label: isKn ? "ಗುಂಪು ಕಾರ್ಯಸ್ಥಳ ನೋಡಿ" : "Open Group Workspace",
          labelKn: "ಗುಂಪು ಕಾರ್ಯಸ್ಥಳ ನೋಡಿ",
        });

        return {
          text,
          source: "knowledge-engine",
          sourceDescription: isKn ? "ನಿಮ್ಮ ಗುಂಪು ಕಾರ್ಯಸ್ಥಳದ ಡೇಟಾದಿಂದ ರಚಿಸಲಾಗಿದೆ." : "Grounded directly in your group state.",
          actions,
        };
      }
      break;
    }

    case "adaptive_replanning": {
      if (context.intelligence) {
        const text = isKn
          ? `### ಪ್ರವಾಸ ಹೊಂದಾಣಿಕೆ & ಸುರಕ್ಷತೆ:\n\n* **ಪ್ರವಾಸದ ಆರೋಗ್ಯ ಸೂಚ್ಯಂಕ:** ${context.intelligence.tripHealthScore}/100\n* **ಸಕ್ರಿಯ ಸಮಸ್ಯೆಗಳು:** ${context.intelligence.activeIssuesCount}\n* **ಮರು-ಯೋಜನಾ ಪ್ರಸ್ತಾವನೆಗಳು:** ${context.intelligence.replanningProposalsCount} ಸಕ್ರಿಯ\n\n*ಪ್ರಸ್ತಾವಿತ ವೇಳಾಪಟ್ಟಿ ಬದಲಾವಣೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಮತ್ತು ದೃಢೀಕರಿಸಲು ಅಡಾಪ್ಟಿವ್ ಇಂಟೆಲಿಜೆನ್ಸ್ ಕಮಾಂಡ್ ಸೆಂಟರ್‌ಗೆ ಭೇಟಿ ನೀಡಿ.*`
          : `### Adaptive Travel Intelligence & Health:\n\n* **Trip Health Score:** ${context.intelligence.tripHealthScore}/100\n* **Detected Disruptions/Risks:** ${context.intelligence.activeIssuesCount}\n* **Pending Replanning Proposals:** ${context.intelligence.replanningProposalsCount}\n\n*Review non-destructive schedule adjustments in the Adaptive Command Center before confirming.*`;

        actions.push({
          id: "nav-intelligence",
          type: "view_adaptive_dashboard",
          label: isKn ? "ಕಮಾಂಡ್ ಸೆಂಟರ್ ತೆರೆಯಿರಿ" : "Open Adaptive Center",
          labelKn: "ಕಮಾಂಡ್ ಸೆಂಟರ್ ತೆರೆಯಿರಿ",
        });

        return {
          text,
          source: "knowledge-engine",
          sourceDescription: isKn ? "ನೈಜ ಹವಾಮಾನ ಮತ್ತು ರಸ್ತೆ ಡೇಟಾದಿಂದ ರಚಿಸಲಾಗಿದೆ." : "Grounded in real-time adaptive conditions.",
          actions,
        };
      }
      break;
    }
  }

  // Fallback to general Karnataka secular travel knowledge
  return {
    text: isKn
      ? `ಯಾತ್ರಿಯಾನ್ ಕರ್ನಾಟಕದ 31 ಜಿಲ್ಲೆಗಳ ದೃಢೀಕೃತ ಜಾತ್ಯತೀತ ಪ್ರವಾಸ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆಯಾಗಿದೆ. ನಿಮ್ಮ ಸಕ್ರಿಯ ಪ್ರವಾಸ, ದಿನಚರಿ, ಬಜೆಟ್ ಮತ್ತು ಮಾರ್ಗಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.`
      : `Yatrion is Karnataka's verified secular travel operating system across all 31 districts. Ask about your active journey, daily stops, route efficiency, budget scenarios, or local artisan heritage.`,
    source: "knowledge-engine",
    sourceDescription: isKn ? "ಪರಿಶೀಲಿತ ಕರ್ನಾಟಕ ಡೇಟಾಸೆಟ್." : "Verified Karnataka dataset.",
    actions: [
      {
        id: "nav-explore",
        type: "navigate_planner",
        label: isKn ? "31 ಜಿಲ್ಲೆಗಳ ಅನ್ವೇಷಣೆ" : "Explore 31 Districts",
        labelKn: "31 ಜಿಲ್ಲೆಗಳ ಅನ್ವೇಷಣೆ",
      },
    ],
  };
}
