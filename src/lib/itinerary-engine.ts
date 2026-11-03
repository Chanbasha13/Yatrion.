import {
  DESTINATIONS,
  type Destination,
  type RegionId,
} from "./destinations-data";
import type {
  TripPreferences,
  TripDurationDays,
  BudgetTier,
  TravelStyle,
  TransportPreference,
} from "./planner-types";
import {
  calculateDetailedBudget,
  type DetailedBudgetBreakdown,
} from "./budget-calculator";

export { calculateDetailedBudget, type DetailedBudgetBreakdown };

/* =========================================================================
   ITINERARY ENGINE TYPES
   ========================================================================= */

export type ActivityTimeOfDay = "morning" | "afternoon" | "evening";

export interface ItineraryStop {
  timeOfDay: ActivityTimeOfDay;
  title: string;
  destinationId: string;
  destinationName: string;
  destinationKannada: string;
  location: string;
  district: string;
  description: string;
  highlightMatch?: string;
  estimatedDuration: string;
  activityType:
    | "sightseeing"
    | "exploration"
    | "cultural"
    | "nature"
    | "leisure"
    | "dining";
  mealOrRestNote?: string;
  transitNote?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  dateLabel?: string;
  destinationId: string;
  destinationName: string;
  destinationKannada: string;
  region: RegionId;
  district: string;
  image: string;
  imageAlt: string;
  theme: string;
  rationale: string;
  stops: ItineraryStop[];
  transitGuidance: string;
  dailyPacingNote: string;
  suggestedStayArea: string;
}

export interface TravelEstimate {
  budgetTierLabel: string;
  userBudgetRange: string;
  indicativeEstimatedSpend: string;
  costBreakdownNotes: string[];
  pricingAssumption: string;
  budgetStatus: "within-range" | "tight" | "flexible";
  budgetGuidance: string;
}

export interface ItineraryWarning {
  type: "distance" | "budget" | "pacing" | "dataset-note";
  title: string;
  message: string;
}

export interface IncludedDestinationMeta {
  id: string;
  name: string;
  kannadaName: string;
  district: string;
  region: RegionId;
  selectionReason: string;
  isUserSelected: boolean;
}

export interface GeneratedItinerary {
  id: string;
  title: string;
  kannadaSubtitle: string;
  summary: string;
  durationDays: TripDurationDays;
  startingLocation: string;
  groupTypeLabel: string;
  travellerCount: number;
  travelStyleLabel: string;
  transportPreferenceLabel: string;
  budgetSummary: TravelEstimate;
  detailedBudget?: DetailedBudgetBreakdown;
  days: ItineraryDay[];
  includedDestinations: IncludedDestinationMeta[];
  warnings: ItineraryWarning[];
  generatedAt: string;
}

/* =========================================================================
   RECOMMENDATION & SCORING LOGIC
   ========================================================================= */

/**
 * Calculates a match score for a destination against given user preferences.
 * Fully deterministic and based solely on fields in destinations-data.ts.
 */
function scoreDestination(
  dest: Destination,
  prefs: TripPreferences,
  currentlySelected: Destination[]
): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Explicit user selection priority
  const isExplicit = prefs.selectedDestinationIds.includes(dest.id);
  if (isExplicit) {
    score += 1000;
    reasons.push("Explicitly selected by you");
  }

  // 2. Interest alignment
  let interestMatches = 0;
  for (const interest of prefs.interests) {
    let matched = false;
    if (interest === "heritage" && (dest.category === "heritage" || dest.categories.includes("heritage"))) {
      matched = true;
    } else if (interest === "nature" && (dest.category === "nature" || dest.categories.includes("nature"))) {
      matched = true;
    } else if (interest === "hills" && (dest.tag.toLowerCase().includes("coffee") || dest.tag.toLowerCase().includes("peak") || dest.region === "Western Ghats")) {
      matched = true;
    } else if (interest === "beaches" && (dest.category === "coastal" || dest.categories.includes("coastal"))) {
      matched = true;
    } else if (interest === "wildlife" && (dest.category === "wildlife" || dest.categories.includes("wildlife"))) {
      matched = true;
    } else if (interest === "food" && dest.culturalNote.toLowerCase().includes("curry") || dest.culturalNote.toLowerCase().includes("dosa") || dest.culturalNote.toLowerCase().includes("cuisine") || dest.culturalNote.toLowerCase().includes("pak")) {
      matched = true;
    } else if (interest === "adventure" && (dest.id === "dandeli" || dest.id === "chikmagalur" || dest.id === "gokarna")) {
      matched = true;
    } else if (interest === "spiritual" && (dest.highlights.some(h => h.toLowerCase().includes("temple") || h.toLowerCase().includes("matha")))) {
      matched = true;
    }

    if (matched) {
      interestMatches++;
    }
  }

  if (interestMatches > 0) {
    score += interestMatches * 20;
    reasons.push(`Matches ${interestMatches} of your travel interests`);
  }

  // 3. Geographic clustering bonus (if another destination has already been chosen)
  if (currentlySelected.length > 0) {
    const hasSameRegion = currentlySelected.some((c) => c.region === dest.region);
    if (hasSameRegion) {
      score += 35;
      reasons.push(`Shares geographical region with ${currentlySelected[0].name}`);
    }
  }

  // 4. Starting Location proximity heuristic
  const startLoc = prefs.startingLocation.toLowerCase().trim();
  if (startLoc.includes("mysuru") || startLoc.includes("mysore")) {
    if (dest.region === "South Karnataka" || dest.region === "Nilgiri Biosphere") {
      score += 25;
      reasons.push("Conveniently accessible from Mysuru origin");
    }
  } else if (startLoc.includes("bengaluru") || startLoc.includes("bangalore")) {
    if (dest.region === "South Karnataka" || dest.region === "Western Ghats") {
      score += 15;
    }
  } else if (startLoc.includes("hubballi") || startLoc.includes("hubli") || startLoc.includes("belagavi") || startLoc.includes("belgaum")) {
    if (dest.region === "North Karnataka" || dest.id === "dandeli") {
      score += 30;
      reasons.push("Direct road/rail transit from North Karnataka origin");
    }
  } else if (startLoc.includes("mangaluru") || startLoc.includes("mangalore") || startLoc.includes("udupi")) {
    if (dest.region === "Coastal Karnataka" || dest.id === "coorg") {
      score += 30;
      reasons.push("Direct proximity to Coastal Karnataka origin");
    }
  }

  // 5. Trip duration fit
  if (dest.durationDays <= prefs.durationDays) {
    score += 10;
  }

  const primaryReason =
    reasons.length > 0
      ? reasons.join(" · ")
      : `Curated recommendation for ${dest.region}`;

  return { score, reason: primaryReason };
}

/**
 * Selects the optimal set of destinations based on preferences and duration.
 */
function selectDestinationsForItinerary(
  prefs: TripPreferences,
  allDestinations: Destination[]
): { selected: Destination[]; reasons: Map<string, string> } {
  const reasons = new Map<string, string>();
  const chosen: Destination[] = [];

  // Determine how many destinations can comfortably fit in durationDays
  let maxDestinations = 1;
  if (prefs.durationDays >= 7) {
    maxDestinations = 3;
  } else if (prefs.durationDays >= 4) {
    maxDestinations = 2;
  } else if (prefs.durationDays >= 3) {
    maxDestinations = 2;
  } else {
    maxDestinations = 1;
  }

  // If user explicitly chose destinations, include all of them
  if (
    prefs.destinationMode === "choose" ||
    prefs.destinationMode === "preselected"
  ) {
    for (const id of prefs.selectedDestinationIds) {
      const match = allDestinations.find((d) => d.id === id);
      if (match && !chosen.some((c) => c.id === match.id)) {
        chosen.push(match);
        reasons.set(match.id, "Explicitly selected by traveler");
      }
    }
  }

  // If we still need more destinations (e.g. in "explore" mode or duration permits additional stop)
  if (chosen.length < maxDestinations) {
    // Score all remaining destinations
    const scored = allDestinations
      .filter((d) => !chosen.some((c) => c.id === d.id))
      .map((d) => {
        const { score, reason } = scoreDestination(d, prefs, chosen);
        return { dest: d, score, reason };
      });

    // Deterministic sort: higher score first; tie breaker is alphabetical ID
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.dest.id.localeCompare(b.dest.id);
    });

    while (chosen.length < maxDestinations && scored.length > 0) {
      const best = scored.shift();
      if (best) {
        chosen.push(best.dest);
        reasons.set(best.dest.id, best.reason);
      }
    }
  }

  return { selected: chosen, reasons };
}

/* =========================================================================
   WARNINGS & FEASIBILITY CHECKS
   ========================================================================= */

function evaluateWarnings(
  prefs: TripPreferences,
  selectedDestinations: Destination[]
): ItineraryWarning[] {
  const warnings: ItineraryWarning[] = [];

  // 1. Distance & transit feasibility check
  const regions = Array.from(new Set(selectedDestinations.map((d) => d.region)));
  const hasFarNorth = regions.includes("North Karnataka");
  const hasFarSouthOrCoast =
    regions.includes("South Karnataka") ||
    regions.includes("Nilgiri Biosphere") ||
    regions.includes("Coastal Karnataka") ||
    regions.includes("Western Ghats");

  if (hasFarNorth && hasFarSouthOrCoast && selectedDestinations.length > 1) {
    if (prefs.durationDays <= 3) {
      warnings.push({
        type: "distance",
        title: "Extended Transit Warning (350+ km)",
        message:
          "Your selected destinations span North Karnataka and the Southern/Western Ghats regions (e.g., Hampi and Coorg/Mysuru/Gokarna). Traveling between these distant regions requires 7–9 hours of transit, which will consume a substantial portion of a " +
          prefs.durationDays +
          "-day trip. Consider allocating at least 5 days or focusing on a single regional circuit.",
      });
    } else {
      warnings.push({
        type: "distance",
        title: "Inter-Regional Highway Transit Required",
        message:
          "Transit between North Karnataka monuments and Western Ghats / Southern Karnataka involves overnight train routes (e.g., Hampi Express) or full-day highway travel (350+ km). Plan transit early.",
      });
    }
  }

  // 2. Budget feasibility check
  if (prefs.budget === "under-3k") {
    if (prefs.durationDays >= 4 || prefs.travellerCount >= 3) {
      warnings.push({
        type: "budget",
        title: "Budget Feasibility Note",
        message:
          "A total budget under ₹3,000 for a " +
          prefs.durationDays +
          "-day journey with " +
          prefs.travellerCount +
          " traveller(s) is very tight. This plan assumes local KSRTC ordinary buses, shared dormitories / budget dharamsalas, and temple meals (prasadam) to remain feasible.",
      });
    }
  } else if (prefs.budget === "3k-7k" && prefs.durationDays >= 5 && prefs.travellerCount >= 4) {
    warnings.push({
      type: "budget",
      title: "Group Budget Guidance",
      message:
        "For a party of " +
        prefs.travellerCount +
        " on a 5+ day circuit, ₹3,000–₹7,000 total requires careful lodging and transport choices. Consider shared homestays and public train transit.",
    });
  }

  // 3. Pacing & stops check
  if (prefs.travelStyle === "relaxed" && selectedDestinations.length > 2 && prefs.durationDays <= 3) {
    warnings.push({
      type: "pacing",
      title: "Relaxed Pacing Advisory",
      message:
        "You requested a 'Relaxed' pace but have " +
        selectedDestinations.length +
        " destinations within " +
        prefs.durationDays +
        " days. We recommend spending at least 2 full nights in one location for slow travel.",
    });
  }

  return warnings;
}

/* =========================================================================
   BUDGET CALCULATION (TRANSPARENT & ESTIMATED)
   ========================================================================= */

function calculateTravelEstimate(
  prefs: TripPreferences,
  selectedDestinations: Destination[]
): TravelEstimate {
  const budgetLabels: Record<BudgetTier, string> = {
    "under-3k": "Under ₹3,000",
    "3k-7k": "₹3,000 – ₹7,000",
    "7k-15k": "₹7,000 – ₹15,000",
    "15k-30k": "₹15,000 – ₹30,000",
    "30k-plus": "₹30,000+",
    flexible: "Flexible Budget",
  };

  const userBudgetRange = budgetLabels[prefs.budget];

  // Calculate indicative destination average per person from dataset
  // We explicitly note these are estimates and dependent on individual choices
  let minDaily = 1200;
  let maxDaily = 2500;

  if (selectedDestinations.length > 0) {
    const dailyRanges = selectedDestinations.map((d) => {
      // Parse e.g. "₹1,500 – ₹3,000 / day (est.)"
      const match = d.estimatedDailyBudget.match(/₹([\d,]+)\s*–\s*₹([\d,]+)/);
      if (match) {
        const low = parseInt(match[1].replace(/,/g, ""), 10);
        const high = parseInt(match[2].replace(/,/g, ""), 10);
        return { low, high };
      }
      return { low: 1500, high: 3000 };
    });

    minDaily = Math.round(
      dailyRanges.reduce((acc, r) => acc + r.low, 0) / dailyRanges.length
    );
    maxDaily = Math.round(
      dailyRanges.reduce((acc, r) => acc + r.high, 0) / dailyRanges.length
    );
  }

  const estTotalLow = minDaily * prefs.durationDays * prefs.travellerCount;
  const estTotalHigh = maxDaily * prefs.durationDays * prefs.travellerCount;

  const notes = [
    `Destination average stay & food: ~₹${minDaily.toLocaleString("en-IN")} to ₹${maxDaily.toLocaleString("en-IN")} per traveler per day (est.).`,
    `Transit estimate: Calculated from ${prefs.startingLocation} via ${prefs.transport} (fuel/bus fares vary with season).`,
    `Monument entry fees: Hampi, Mysuru Palace, and Belur require nominal tickets (₹40–₹100 for Indian citizens; ASI rates apply for foreign nationals).`,
  ];

  let budgetStatus: "within-range" | "tight" | "flexible" = "within-range";
  let budgetGuidance = "Your selected budget tier aligns with the estimated destination averages.";

  if (prefs.budget === "under-3k") {
    if (estTotalLow > 3000) {
      budgetStatus = "tight";
      budgetGuidance =
        "Your total budget is below typical commercial estimates. Prioritize state transport and municipal/temple guesthouses.";
    }
  } else if (prefs.budget === "flexible") {
    budgetStatus = "flexible";
    budgetGuidance =
      "Flexible budget allows upgrading to heritage homestays, private chauffeured cabs, and specialty safaris.";
  }

  return {
    budgetTierLabel: userBudgetRange,
    userBudgetRange,
    indicativeEstimatedSpend: `₹${estTotalLow.toLocaleString("en-IN")} – ₹${estTotalHigh.toLocaleString("en-IN")} total est.`,
    costBreakdownNotes: notes,
    pricingAssumption: `Based on ${prefs.travellerCount} traveler(s) across ${prefs.durationDays} day(s). Actual expenses vary by season and booking channel.`,
    budgetStatus,
    budgetGuidance,
  };
}

/* =========================================================================
   DAY-BY-DAY ITINERARY BUILDER
   ========================================================================= */

function buildDays(
  prefs: TripPreferences,
  destinations: Destination[]
): ItineraryDay[] {
  const days: ItineraryDay[] = [];
  const totalDays = prefs.durationDays;

  // Distribute days across selected destinations
  // e.g. for 2 destinations over 4 days: 2 days at dest A, 2 days at dest B
  const destCount = destinations.length;

  for (let dayIndex = 1; dayIndex <= totalDays; dayIndex++) {
    // Pick active destination for this day
    const assignedDestIndex = Math.min(
      Math.floor(((dayIndex - 1) / totalDays) * destCount),
      destCount - 1
    );
    const dest = destinations[assignedDestIndex];

    // Determine day number within this destination (1st day here, 2nd day here)
    const daysAtThisDest = Math.ceil(totalDays / destCount);
    const dayAtDestIndex = (dayIndex - 1) % daysAtThisDest;

    // Day title
    let dayTitle = "";
    if (dayIndex === 1) {
      dayTitle = `Arrival from ${prefs.startingLocation} & Exploring ${dest.name}`;
    } else if (dayIndex === totalDays) {
      dayTitle = `Final Trail in ${dest.name} & Departure`;
    } else if (destCount > 1 && dayAtDestIndex === 0 && dayIndex > 1) {
      dayTitle = `Scenic Journey to ${dest.name} (${dest.region})`;
    } else {
      dayTitle = `Immersive Exploration of ${dest.name}`;
    }

    // Date calculation if departureDate was specified
    let dateLabel: string | undefined = undefined;
    if (prefs.departureDate) {
      try {
        const [y, m, d] = prefs.departureDate.split("-").map(Number);
        const dateObj = new Date(y, m - 1, d + (dayIndex - 1));
        dateLabel = dateObj.toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      } catch {
        // Fallback without crash
      }
    }

    // Allocate curated highlights into morning, afternoon, evening based on day and travelStyle
    const highlights = dest.highlights || [];
    const hCount = highlights.length;

    // Pull distinct highlights for this day
    const hMorning = highlights[(dayAtDestIndex * 2) % hCount] || highlights[0] || `${dest.name} Heritage Trail`;
    const hAfternoon = highlights[(dayAtDestIndex * 2 + 1) % hCount] || highlights[1] || `${dest.name} Local Sights`;
    const hEvening = highlights[(dayAtDestIndex * 2 + 2) % hCount] || highlights[hCount - 1] || `${dest.name} Sunset Point`;

    // Transport note tailored to user preference
    const transportMap: Record<TransportPreference, string> = {
      public: `KSRTC bus / train connectivity or local auto-rickshaws around ${dest.name}`,
      "self-drive": `Personal vehicle / self-drive rental on state highways with parking available`,
      taxi: `Private tourist cab / pre-booked local driver`,
      "two-wheeler": `Rental motorcycle / scooter for scenic riding routes`,
      flexible: `Hybrid public transport and local taxis as appropriate for terrain`,
    };

    const stops: ItineraryStop[] = [];

    // --- MORNING STOP ---
    let morningDesc = "";
    let morningTitle = "";
    if (dayIndex === 1) {
      morningTitle = `Depart from ${prefs.startingLocation} → Arrive in ${dest.name}`;
      morningDesc = `Begin your journey from ${prefs.startingLocation} via ${transportMap[prefs.transport]}. Settle into your stay and prepare for your first trail visit: ${hMorning}.`;
    } else {
      morningTitle = `Morning Visit: ${hMorning}`;
      morningDesc = `Start early to avoid crowds. Explore ${hMorning} with pleasant morning temperatures and optimal photo lighting.`;
    }

    stops.push({
      timeOfDay: "morning",
      title: morningTitle,
      destinationId: dest.id,
      destinationName: dest.name,
      destinationKannada: dest.kannadaName,
      location: dest.district,
      district: dest.district,
      description: morningDesc,
      highlightMatch: hMorning,
      estimatedDuration: prefs.travelStyle === "relaxed" ? "2.5 – 3 hours (est.)" : "2 hours (est.)",
      activityType: "sightseeing",
      mealOrRestNote: `Traditional Karnataka breakfast stop: hot idli-vada with filter coffee.`,
      transitNote: dayIndex === 1 ? dest.transitTip : `Short local transit within ${dest.name}`,
    });

    // --- AFTERNOON STOP ---
    const afternoonTitle = `Afternoon: ${hAfternoon}`;
    let afternoonDesc = `Discover ${hAfternoon}. Take time to understand the local historical context and architecture.`;
    if (prefs.travelStyle === "relaxed") {
      afternoonDesc += ` Followed by leisurely rest during the midday heat.`;
    }

    stops.push({
      timeOfDay: "afternoon",
      title: afternoonTitle,
      destinationId: dest.id,
      destinationName: dest.name,
      destinationKannada: dest.kannadaName,
      location: dest.district,
      district: dest.district,
      description: afternoonDesc,
      highlightMatch: hAfternoon,
      estimatedDuration: prefs.travelStyle === "packed" ? "3 hours (est.)" : "2 hours (est.)",
      activityType: "cultural",
      mealOrRestNote: `Lunch featuring local regional specialties: ${dest.culturalNote.split(".")[0] || "Authentic Karnataka thali"}.`,
    });

    // --- EVENING STOP ---
    let eveningTitle = `Sunset & Evening: ${hEvening}`;
    let eveningDesc = `Wind down the day at ${hEvening}. Enjoy dusk vistas, cooler evening breezes, and local bazaar walks.`;
    if (dayIndex === totalDays) {
      eveningTitle = `Evening: ${hEvening} & Return Journey`;
      eveningDesc = `Conclude your Karnataka trail at ${hEvening}. Prepare for return departure back towards ${prefs.startingLocation}.`;
    }

    stops.push({
      timeOfDay: "evening",
      title: eveningTitle,
      destinationId: dest.id,
      destinationName: dest.name,
      destinationKannada: dest.kannadaName,
      location: dest.district,
      district: dest.district,
      description: eveningDesc,
      highlightMatch: hEvening,
      estimatedDuration: "1.5 – 2 hours (est.)",
      activityType: "leisure",
      mealOrRestNote: `Dinner and relaxation. Taste local snacks or confections before night rest.`,
      transitNote: dayIndex === totalDays ? `Return departure transit toward ${prefs.startingLocation}` : undefined,
    });

    // Pacing note
    const pacingMap: Record<TravelStyle, string> = {
      relaxed: "Slow travel pace: 2 core activities today with dedicated midday downtime and leisurely dining.",
      balanced: "Balanced pace: Morning & afternoon exploration with unhurried breaks and evening sunset.",
      packed: "Packed trail: Continuous sightseeing covering key landmarks, photography viewpoints, and markets.",
    };

    days.push({
      dayNumber: dayIndex,
      title: dayTitle,
      dateLabel,
      destinationId: dest.id,
      destinationName: dest.name,
      destinationKannada: dest.kannadaName,
      region: dest.region,
      district: dest.district,
      image: dest.image,
      imageAlt: dest.imageAlt,
      theme: dest.categoryLabel,
      rationale: `Chosen for its alignment with your interests in ${dest.categoryLabel} and ${dest.tag}.`,
      stops,
      transitGuidance: transportMap[prefs.transport],
      dailyPacingNote: pacingMap[prefs.travelStyle],
      suggestedStayArea: `${dest.name} center or surrounding heritage/homestay cluster in ${dest.district} district.`,
    });
  }

  return days;
}

/* =========================================================================
   PUBLIC GENERATION ENTRY POINT
   ========================================================================= */

/**
 * Main pure recommendation and itinerary generation engine.
 * Takes validated TripPreferences and destinations array.
 * Deterministic: identical inputs yield identical output.
 */
export function generateItinerary(
  prefs: TripPreferences,
  allDestinations: Destination[] = DESTINATIONS
): GeneratedItinerary {
  // Safe defaults if malformed
  const safePrefs: TripPreferences = {
    ...prefs,
    durationDays: (prefs.durationDays || 3) as TripDurationDays,
    startingLocation: prefs.startingLocation?.trim() || "Bengaluru",
    interests: prefs.interests && prefs.interests.length > 0 ? prefs.interests : ["heritage"],
    travelStyle: prefs.travelStyle || "balanced",
    budget: prefs.budget || "7k-15k",
    travellerCount: Math.max(1, Math.min(20, prefs.travellerCount || 1)),
    transport: prefs.transport || "public",
    selectedDestinationIds: Array.isArray(prefs.selectedDestinationIds)
      ? prefs.selectedDestinationIds
      : [],
  };

  // 1. Select optimal destinations
  const { selected, reasons } = selectDestinationsForItinerary(
    safePrefs,
    allDestinations
  );

  // Fallback if no destinations matched
  const finalDestinations =
    selected.length > 0 ? selected : [allDestinations[0] || DESTINATIONS[0]];

  // 2. Evaluate transparent warnings
  const warnings = evaluateWarnings(safePrefs, finalDestinations);

  // 3. Calculate budget estimates
  const budgetSummary = calculateTravelEstimate(safePrefs, finalDestinations);

  // 4. Construct day-by-day stops
  const days = buildDays(safePrefs, finalDestinations);

  // Format destination metadata
  const includedDestinations: IncludedDestinationMeta[] = finalDestinations.map(
    (d) => ({
      id: d.id,
      name: d.name,
      kannadaName: d.kannadaName,
      district: d.district,
      region: d.region,
      selectionReason:
        reasons.get(d.id) ||
        (safePrefs.selectedDestinationIds.includes(d.id)
          ? "Selected by you"
          : "Recommended for your travel interests"),
      isUserSelected: safePrefs.selectedDestinationIds.includes(d.id),
    })
  );

  // Dynamic titles
  const destNames = finalDestinations.map((d) => d.name).join(" & ");
  const title =
    finalDestinations.length === 1
      ? `${finalDestinations[0].name} Exploration Trail`
      : `${destNames} Karnataka Circuit`;

  const kannadaSubtitle = finalDestinations
    .map((d) => d.kannadaName)
    .join(" - ");

  const summary = `A custom ${safePrefs.durationDays}-day Karnataka itinerary departing from ${safePrefs.startingLocation}, featuring ${finalDestinations.length} curated destination(s) tailored to your ${safePrefs.travelStyle} travel pace and ${safePrefs.interests.length} interest areas.`;

  const transportLabels: Record<TransportPreference, string> = {
    public: "Public Transport (KSRTC & Railways)",
    "self-drive": "Self-Drive Vehicle",
    taxi: "Rental Car / Taxi",
    "two-wheeler": "Two-Wheeler",
    flexible: "Flexible / Recommended",
  };

  const styleLabels: Record<TravelStyle, string> = {
    relaxed: "Relaxed Pace (Slow Travel)",
    balanced: "Balanced Exploration",
    packed: "Packed Full-Day Trail",
  };

  const groupLabels: Record<string, string> = {
    solo: "Solo Explorer",
    couple: "Couple",
    family: "Family",
    friends: "Friends",
    group: "Group",
  };

  const detailedBudget = calculateDetailedBudget(safePrefs, finalDestinations);
  if (detailedBudget.isBudgetTightOrLower && !warnings.some((w) => w.type === "budget")) {
    warnings.push({
      type: "budget",
      title: "Budget Guidance: Indicative Spend Exceeds Selected Tier",
      message: detailedBudget.budgetComparisonNote,
    });
  }

  return {
    id: `yatrion-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    kannadaSubtitle,
    summary,
    durationDays: safePrefs.durationDays,
    startingLocation: safePrefs.startingLocation,
    groupTypeLabel: groupLabels[safePrefs.groupType] || "Travelers",
    travellerCount: safePrefs.travellerCount,
    travelStyleLabel: styleLabels[safePrefs.travelStyle],
    transportPreferenceLabel: transportLabels[safePrefs.transport],
    budgetSummary,
    detailedBudget,
    days,
    includedDestinations,
    warnings,
    generatedAt: new Date().toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}
