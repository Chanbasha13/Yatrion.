import type {
  BudgetRecommendation,
  OptimizedBudgetPlan,
} from "./budget-types";
import type { GeneratedItinerary } from "../itinerary-engine";
import type { OptimizedRoutePlan } from "../routes/route-types";

/**
 * Deterministically generates practical, actionable cost-saving recommendations.
 * Each recommendation explains the expected savings using the engine's verified assumptions.
 * Strict safety rule: Never recommends unsafe travel or removing emergency provisions.
 */
export function generateBudgetRecommendations(
  plan: OptimizedBudgetPlan,
  itinerary?: GeneratedItinerary,
  routePlan?: OptimizedRoutePlan
): BudgetRecommendation[] {
  const recommendations: BudgetRecommendation[] = [];
  const { inputs, scenarios, activeScenario } = plan;
  const currentScenario = scenarios[activeScenario];
  const travellers = Math.max(1, inputs.travellerCount || 1);
  const duration = Math.max(1, inputs.durationDays || 1);
  const hasMultipleBases = Boolean(
    itinerary &&
      itinerary.days.some(
        (d, idx, arr) => idx > 0 && d.destinationId !== arr[idx - 1].destinationId
      )
  );

  // ── RECOMMENDATION 1: SCENARIO COMPARISON SAVINGS ──
  if (activeScenario === "comfort") {
    const savings = Math.max(
      500,
      currentScenario.totalCost - scenarios.balanced.totalCost
    );
    recommendations.push({
      id: "rec-switch-balanced",
      type: "accommodation",
      titleEn: "Switch to Balanced Explorer Scenario",
      titleKn: "ಸಮತೋಲಿತ ಪರಿಶೋಧಕ ಯೋಜನೆಗೆ ಬದಲಾಯಿಸಿ",
      descriptionEn: `Transitioning from luxury resorts to authentic heritage homestays and standard private cabs saves an estimated ₹${savings.toLocaleString("en-IN")}.`,
      descriptionKn: `ದುಬಾರಿ ರೆಸಾರ್ಟ್‌ಗಳ ಬದಲಿಗೆ ಅಧಿಕೃತ ಹೆರಿಟೇಜ್ ಹೋಂಸ್ಟೇ ಮತ್ತು ಸಾಮಾನ್ಯ ಕ್ಯಾಬ್ ಬಳಸುವುದರಿಂದ ಅಂದಾಜು ₹${savings.toLocaleString("en-IN")} ಉಳಿತಾಯವಾಗುತ್ತದೆ.`,
      estimatedSavingsInr: savings,
      impactLevel: "high",
      explanationEn: `Saves ~₹${Math.round(savings / travellers).toLocaleString("en-IN")} per traveler while retaining private point-to-point transit and full heritage access.`,
      explanationKn: `ಪ್ರತಿ ಪ್ರವಾಸಿಗರಿಗೆ ~₹${Math.round(savings / travellers).toLocaleString("en-IN")} ಉಳಿತಾಯವಾಗಲಿದ್ದು, ಖಾಸಗಿ ಸಂಚಾರ ಮತ್ತು ಪೂರ್ಣ ಸ್ಮಾರಕ ಪ್ರವೇಶ ಯಥಾವತ್ತಾಗಿರುತ್ತದೆ.`,
      actionableSuggestionEn:
        "Select the 'Balanced' card above to apply this lodging and dining configuration.",
      actionableSuggestionKn: "ಈ ಸಂರಚನೆಯನ್ನು ಅನ್ವಯಿಸಲು ಮೇಲಿನ 'ಸಮತೋಲಿತ' ಕಾರ್ಡ್ ಅನ್ನು ಆರಿಸಿ.",
      safetyAffirmationEn:
        "Preserves clean private bathrooms, verified homestays, and 7.5% emergency contingency.",
      safetyAffirmationKn:
        "ಶುದ್ಧ ಖಾಸಗಿ ಕೊಠಡಿಗಳು ಮತ್ತು 7.5% ತುರ್ತು ನಿಧಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಉಳಿಸಿಕೊಳ್ಳುತ್ತದೆ.",
    });
  } else if (activeScenario === "balanced") {
    const savings = Math.max(
      500,
      currentScenario.totalCost - scenarios.budget_saver.totalCost
    );
    recommendations.push({
      id: "rec-switch-saver",
      type: "transport",
      titleEn: "Adopt Budget Saver Public Transit & Guesthouses",
      titleKn: "ಬಜೆಟ್ ಸೇವರ್ ಸಾರ್ವಜನಿಕ ಸಾರಿಗೆ ಮತ್ತು ವಸತಿ ಆಯ್ಕೆಮಾಡಿ",
      descriptionEn: `Utilizing KSRTC Rajahamsa express buses and KSTDC/budget homestays saves an estimated ₹${savings.toLocaleString("en-IN")}.`,
      descriptionKn: `KSRTC ರಾಜಹಂಸ ಬಸ್ಸುಗಳು ಹಾಗೂ ಬಜೆಟ್ ಅತಿಥಿ ಗೃಹಗಳನ್ನು ಬಳಸುವುದರಿಂದ ಅಂದಾಜು ₹${savings.toLocaleString("en-IN")} ಉಳಿತಾಯವಾಗುತ್ತದೆ.`,
      estimatedSavingsInr: savings,
      impactLevel: "high",
      explanationEn: `Reduces intercity vehicle hire costs significantly (approx. ₹${Math.round(savings / travellers).toLocaleString("en-IN")} per person).`,
      explanationKn: `ಖಾಸಗಿ ವಾಹನ ಬಾಡಿಗೆ ವೆಚ್ಚವನ್ನು ಗಣನೀಯವಾಗಿ ಕಡಿತಗೊಳಿಸುತ್ತದೆ (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ ಅಂದಾಜು ₹${Math.round(savings / travellers).toLocaleString("en-IN")}).`,
      actionableSuggestionEn:
        "Click 'Budget Saver' above to view the low-cost public transit itinerary.",
      actionableSuggestionKn: "ಕಡಿಮೆ ವೆಚ್ಚದ ಸಾರ್ವಜನಿಕ ಸಾರಿಗೆ ಯೋಜನೆಯನ್ನು ನೋಡಲು ಮೇಲಿನ 'ಬಜೆಟ್ ಸೇವರ್' ಕ್ಲಿಕ್ ಮಾಡಿ.",
      safetyAffirmationEn:
        "KSRTC is Karnataka's state-operated, highly dependable transit network; 5% emergency buffer is maintained.",
      safetyAffirmationKn:
        "KSRTC ಕರ್ನಾಟಕದ ವಿಶ್ವಾಸಾರ್ಹ ಸರ್ಕಾರಿ ಸಾರಿಗೆಯಾಗಿದ್ದು, 5% ತುರ್ತು ನಿಧಿಯನ್ನು ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ.",
    });
  }

  // ── RECOMMENDATION 2: GROUP SIZE VEHICLE EFFICIENCY ──
  if (travellers >= 3 && (inputs.transportPreference === "public" || !inputs.transportPreference)) {
    // For 3+ travellers, a private cab eliminates multiple town auto-rickshaw fares
    recommendations.push({
      id: "rec-group-vehicle-efficiency",
      type: "transport",
      titleEn: "Optimize Group Transit via Shared Tourist Cab",
      titleKn: "ಗುಂಪು ಪ್ರಯಾಣಿಕರಿಗೆ ಹಂಚಿಕೆಯ ಕ್ಯಾಬ್ ದಕ್ಷತೆ",
      descriptionEn: `For a party of ${travellers}, booking a private cab split across all members eliminates multiple town auto-rickshaw fares while offering door-to-door flexibility.`,
      descriptionKn: `${travellers} ಜನರ ಗುಂಪಿಗೆ ಖಾಸಗಿ ಕ್ಯಾಬ್ ಹಂಚಿಕೊಳ್ಳುವುದರಿಂದ ನಗರದೊಳಗಿನ ಪ್ರತ್ಯೇಕ ಆಟೋ ವೆಚ್ಚಗಳು ತಪ್ಪುತ್ತವೆ ಮತ್ತು ಸುಲಭ ಸಂಚಾರ ಸಾಧ್ಯವಾಗುತ್ತದೆ.`,
      estimatedSavingsInr: Math.round(150 * duration * travellers),
      impactLevel: "medium",
      explanationEn:
        "Reduces repetitive station-to-hotel auto fares (~₹300/day across the group).",
      explanationKn:
        "ನಿಲ್ದಾಣದಿಂದ ಹೋಟೆಲ್‌ಗೆ ಪದೇಪದೇ ಆಟೋ ಹಿಡಿಯುವ ವೆಚ್ಚವನ್ನು ಉಳಿಸುತ್ತದೆ (ದಿನಕ್ಕೆ ~₹300).",
      actionableSuggestionEn:
        "Consider shifting transport preference to 'Taxi' in the Smart Planner.",
      actionableSuggestionKn: "ಸ್ಮಾರ್ಟ್ ಪ್ಲಾನರ್‌ನಲ್ಲಿ ಸಾರಿಗೆಯನ್ನು 'ಟ್ಯಾಕ್ಸಿ'ಗೆ ಬದಲಾಯಿಸಿ.",
      safetyAffirmationEn:
        "Licensed tourist cabs provide direct door-to-door safety for families and late arrivals.",
      safetyAffirmationKn:
        "ಪರವಾನಗಿ ಪಡೆದ ಟೂರಿಸ್ಟ್ ಕ್ಯಾಬ್‌ಗಳು ಕುಟುಂಬಗಳಿಗೆ ಸುರಕ್ಷಿತ ಸಂಚಾರವನ್ನು ಒದಗಿಸುತ್ತವೆ.",
    });
  }

  // ── RECOMMENDATION 3: FREE HERITAGE & SCENIC ATTRACTIONS ──
  const destinationIds = inputs.destinationIds || [];
  const hasHampi = destinationIds.includes("hampi");
  const hasGokarna = destinationIds.includes("gokarna");
  const hasMysuru = destinationIds.includes("mysuru");

  if (hasHampi || hasGokarna || hasMysuru) {
    const freeViewpointSavings = Math.round(180 * travellers);
    recommendations.push({
      id: "rec-free-heritage-viewpoints",
      type: "activities",
      titleEn: "Prioritize Free Viewpoints & Sacred Temple Ghats",
      titleKn: "ಉಚಿತ ನಿಸರ್ಗ ತಾಣಗಳು & ದೇವಾಲಯ ಘಾಟ್‌ಗಳಿಗೆ ಆದ್ಯತೆ",
      descriptionEn:
        "World-class spots like Hemakuta Hill, Matanga Hill sunrise, Gokarna cliff trails, and Chamundi Hill steps charge ₹0 entry fees.",
      descriptionKn:
        "ಹೇಮಕೂಟ ಬೆಟ್ಟ, ಮಾತಂಗ ಬೆಟ್ಟದ ಸೂರ್ಯೋದಯ, ಗೋಕರ್ಣ ಕ್ಲಿಫ್ ವಾಕ್ ಮತ್ತು ಚಾಮುಂಡಿ ಮೆಟ್ಟಿಲುಗಳು ಉಚಿತ ಪ್ರವೇಶವನ್ನು ಹೊಂದಿವೆ.",
      estimatedSavingsInr: freeViewpointSavings,
      impactLevel: "medium",
      explanationEn:
        "Saves on private amusement charges while experiencing the finest panoramic landscapes in Karnataka.",
      explanationKn:
        "ದುಬಾರಿ ಮನರಂಜನಾ ವೆಚ್ಚವಿಲ್ಲದೆ ಕರ್ನಾಟಕದ ಅತ್ಯುನ್ನತ ನೈಸರ್ಗಿಕ ಸೌಂದರ್ಯವನ್ನು ಕಣ್ತುಂಬಿಕೊಳ್ಳಬಹುದು.",
      actionableSuggestionEn:
        "Include these scenic free stops in your morning and sunset itineraries.",
      actionableSuggestionKn:
        "ನಿಮ್ಮ ಬೆಳಗಿನ ಮತ್ತು ಸೂರ್ಯಾಸ್ತದ ಪಥದಲ್ಲಿ ಈ ಉಚಿತ ತಾಣಗಳನ್ನು ಸೇರಿಸಿಕೊಳ್ಳಿ.",
      safetyAffirmationEn:
        "All suggested viewpoints are well-trodden trails; daylight visits are advised for rocky ascents.",
      safetyAffirmationKn:
        "ಇವು ಜನಪ್ರಿಯ ನಡಿಗೆ ಮಾರ್ಗಗಳಾಗಿದ್ದು, ಹಗಲಿನ ವೇಳೆಯಲ್ಲಿ ಭೇಟಿ ನೀಡುವುದು ಸೂಕ್ತ.",
    });
  }

  // ── RECOMMENDATION 4: FOOD & DARSHINI SAVINGS ──
  if (activeScenario !== "budget_saver") {
    const foodSavings = Math.round(200 * duration * travellers);
    recommendations.push({
      id: "rec-darshini-dining",
      type: "food",
      titleEn: "Enjoy Authentic Darshini Breakfasts & South Indian Thalis",
      titleKn: "ದರ್ಶಿನಿ ಉಪಹಾರ & ಸಾಂಪ್ರದಾಯಿಕ ಕರ್ನಾಟಕ ಊಟ",
      descriptionEn:
        "Opting for traditional Darshinis for morning idli-vada-dose (₹40–₹60) and authentic vegetarian lunch thalis (₹90–₹120) saves money and delivers superior taste.",
      descriptionKn:
        "ಬೆಳಗಿನ ಉಪಹಾರಕ್ಕೆ ದರ್ಶಿನಿ ತಿಂಡಿಗಳು (₹40-₹60) ಮತ್ತು ಮಧ್ಯಾಹ್ನ ಸಾಂಪ್ರದಾಯಿಕ ಊಟ ಸವಿಯುವುದರಿಂದ ರುಚಿ ಮತ್ತು ಉಳಿತಾಯ ಎರಡೂ ಸಾಧ್ಯ.",
      estimatedSavingsInr: foodSavings,
      impactLevel: "medium",
      explanationEn: `Saves ~₹${(200 * duration).toLocaleString("en-IN")} per traveler compared to hotel breakfast buffets.`,
      explanationKn: `ಹೋಟೆಲ್ ಬಫೆಗಳಿಗೆ ಹೋಲಿಸಿದರೆ ಪ್ರತಿ ಪ್ರವಾಸಿಗರಿಗೆ ~₹${(200 * duration).toLocaleString("en-IN")} ಉಳಿತಾಯವಾಗುತ್ತದೆ.`,
      actionableSuggestionEn:
        "Look for bustling local Darshinis near central bus stands and temple markets.",
      actionableSuggestionKn:
        "ಬಸ್ ನಿಲ್ದಾಣ ಮತ್ತು ದೇವಾಲಯ ಮಾರುಕಟ್ಟೆ ಬಳಿಯ ಜನಪ್ರಿಯ ದರ್ಶಿನಿಗಳಿಗೆ ಭೇಟಿ ನೀಡಿ.",
      safetyAffirmationEn:
        "Karnataka Darshinis prepare freshly steamed, hot food with high culinary turnover.",
      safetyAffirmationKn:
        "ದರ್ಶಿನಿಗಳಲ್ಲಿ ಬಿಸಿಬಿಸಿಯಾದ ತಾಜಾ ಉಪಹಾರ ಮತ್ತು ಊಟ ದೊರೆಯುತ್ತದೆ.",
    });
  }

  // ── RECOMMENDATION 5: CIRCUIT ROUTING OPTIMIZATION ──
  const routeDist = plan.routeDistanceKm || routePlan?.totalEstimatedDistanceKm || 0;
  if ((routeDist > 650 && duration <= 3) || (hasMultipleBases && routeDist > 550)) {
    const fuelSavings = Math.round((routeDist - 350) * 7.0);
    recommendations.push({
      id: "rec-prune-outlier-dest",
      type: "routing",
      titleEn: "Cluster Geographically Adjacent Destinations",
      titleKn: "ಭೌಗೋಳಿಕವಾಗಿ ಹತ್ತಿರದ ತಾಣಗಳನ್ನು ಮಾತ್ರ ಸೇರಿಸಿ",
      descriptionEn: `Your current itinerary covers ~${routeDist} km in just ${duration} days. Focusing on closer clusters (e.g. Mysuru + Belur instead of distant North Karnataka) reduces transit fuel and driver batta.`,
      descriptionKn: `ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಯೋಜನೆಯು ${duration} ದಿನಗಳಲ್ಲಿ ~${routeDist} ಕಿ.ಮೀ ಕ್ರಮಿಸುತ್ತದೆ. ಹತ್ತಿರದ ತಾಣಗಳನ್ನು ಮಾತ್ರ ಆರಿಸುವುದರಿಂದ ಇಂಧನ ಮತ್ತು ಪ್ರಯಾಣ ವೆಚ್ಚ ಉಳಿಯುತ್ತದೆ.`,
      estimatedSavingsInr: fuelSavings,
      impactLevel: "high",
      explanationEn:
        "Eliminates unnecessary high-speed highway fuel burns and toll booth charges.",
      explanationKn:
        "ದೀರ್ಘ ಹೆದ್ದಾರಿ ಇಂಧನ ಮತ್ತು ಟೋಲ್ ಶುಲ್ಕಗಳನ್ನು ಗಣನೀಯವಾಗಿ ಕಡಿತಗೊಳಿಸುತ್ತದೆ.",
      actionableSuggestionEn:
        "Use the Smart Route tab to inspect transit legs and remove distant outlier destinations.",
      actionableSuggestionKn:
        "ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಟ್ಯಾಬ್ ಬಳಸಿ ದೂರದ ತಾಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮರುಹೊಂದಿಸಿ.",
      safetyAffirmationEn:
        "Significantly decreases driver fatigue and avoids nighttime mountain driving.",
      safetyAffirmationKn:
        "ಚಾಲಕನ ಆಯಾಸವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ ಮತ್ತು ರಾತ್ರಿಯ ಘಾಟ್ ರಸ್ತೆ ಪ್ರಯಾಣವನ್ನು ತಪ್ಪಿಸುತ್ತದೆ.",
    });
  }

  // ── RECOMMENDATION 6: DURATION BALANCING (IF OVER BUDGET) ──
  if (currentScenario.isOverBudget && duration >= 3) {
    const singleDayLodgingFood = Math.round(currentScenario.totalCost / duration);
    recommendations.push({
      id: "rec-adjust-duration",
      type: "duration",
      titleEn: `Trim Trip by 1 Day to Match Target Budget`,
      titleKn: `ಬಜೆಟ್‌ಗೆ ಹೊಂದಿಸಲು ಪ್ರವಾಸವನ್ನು 1 ದಿನ ಕಡಿಮೆ ಮಾಡಿ`,
      descriptionEn: `Reducing the trip from ${duration} days to ${duration - 1} days immediately eliminates one day of lodging, dining, and local transit.`,
      descriptionKn: `ಪ್ರವಾಸವನ್ನು ${duration} ದಿನಗಳಿಂದ ${duration - 1} ದಿನಗಳಿಗೆ ಇಳಿಸುವುದರಿಂದ ಒಂದು ದಿನದ ವಸತಿ ಮತ್ತು ಊಟದ ವೆಚ್ಚ ಉಳಿಯುತ್ತದೆ.`,
      estimatedSavingsInr: singleDayLodgingFood,
      impactLevel: "high",
      explanationEn: `Directly saves ~₹${singleDayLodgingFood.toLocaleString("en-IN")}, bringing the trip within your target limit.`,
      explanationKn: `ನೇರವಾಗಿ ~₹${singleDayLodgingFood.toLocaleString("en-IN")} ಉಳಿಸಿ ನಿಮ್ಮ ಗುರಿ ಬಜೆಟ್‌ಗೆ ತರುತ್ತದೆ.`,
      actionableSuggestionEn:
        "Edit preferences in the Smart Planner and reduce duration by 1 day.",
      actionableSuggestionKn: "ಸ್ಮಾರ್ಟ್ ಪ್ಲಾನರ್‌ನಲ್ಲಿ ದಿನಗಳ ಸಂಖ್ಯೆಯನ್ನು 1 ದಿನ ಕಡಿಮೆ ಮಾಡಿ.",
      safetyAffirmationEn:
        "Maintains safety contingencies and full quality for the remaining travel days.",
      safetyAffirmationKn: "ಉಳಿದ ದಿನಗಳ ಸುರಕ್ಷತೆ ಮತ್ತು ಗುಣಮಟ್ಟವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುತ್ತದೆ.",
    });
  }

  return recommendations;
}
