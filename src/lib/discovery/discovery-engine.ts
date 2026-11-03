import { KARNATAKA_EXPERIENCES } from "./experiences";
import type {
  KarnatakaExperience,
  DiscoveryFilters,
  RankedExperience,
  DiscoveryRankingInputs,
} from "./discovery-types";
import { rankExperience, sortRankedExperiences } from "./discovery-ranking";
import type { ItineraryStop, ActivityTimeOfDay } from "../itinerary-engine";
import type { RouteStop } from "../routes/route-types";

/**
 * Returns all verified and field-curated Karnataka experiences.
 */
export function getAllExperiences(): KarnatakaExperience[] {
  return KARNATAKA_EXPERIENCES;
}

/**
 * Retrieves a single experience by unique ID.
 */
export function getExperienceById(id: string): KarnatakaExperience | undefined {
  return KARNATAKA_EXPERIENCES.find((exp) => exp.id === id);
}

/**
 * Filters experiences by search terms, category, region, destination, budget, duration, effort, and season.
 */
export function filterExperiences(
  experiences: KarnatakaExperience[],
  filters: Partial<DiscoveryFilters>
): KarnatakaExperience[] {
  return experiences.filter((exp) => {
    // 1. Text Search Query
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchTitle =
        exp.titleEn.toLowerCase().includes(q) ||
        exp.titleKn.includes(q);
      const matchDesc =
        exp.shortDescriptionEn.toLowerCase().includes(q) ||
        exp.shortDescriptionKn.includes(q);
      const matchDistrict = exp.district.toLowerCase().includes(q);
      const matchDest =
        exp.associatedDestinationName.toLowerCase().includes(q) ||
        exp.associatedDestinationKannada.includes(q);
      const matchTags = exp.tags.some((t) => t.toLowerCase().includes(q));

      if (!matchTitle && !matchDesc && !matchDistrict && !matchDest && !matchTags) {
        return false;
      }
    }

    // 2. Category Filter
    if (filters.category && filters.category !== "all") {
      if (exp.category !== filters.category) {
        return false;
      }
    }

    // 3. Region Filter
    if (filters.region && filters.region !== "all") {
      const normExpRegion = exp.region.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normFilterRegion = filters.region.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normExpRegion !== normFilterRegion && exp.region !== filters.region) {
        return false;
      }
    }

    // 4. Associated Destination Filter
    if (filters.destinationId && filters.destinationId !== "all") {
      const normDestExp = exp.associatedDestinationId.toLowerCase().trim();
      const normDestFilter = filters.destinationId.toLowerCase().trim();
      if (normDestExp !== normDestFilter) {
        return false;
      }
    }

    // 5. Budget Tier Filter
    if (filters.budgetTier && filters.budgetTier !== "all") {
      if (exp.budgetTier !== filters.budgetTier) {
        return false;
      }
    }

    // 6. Max Duration Filter
    if (
      typeof filters.maxDurationMinutes === "number" &&
      filters.maxDurationMinutes !== ("all" as unknown as number)
    ) {
      if (exp.visitDurationMinutes > filters.maxDurationMinutes) {
        return false;
      }
    }

    // 7. Physical Effort Level Filter
    if (filters.effortLevel && filters.effortLevel !== "all") {
      if (exp.physicalEffort !== filters.effortLevel) {
        return false;
      }
    }

    // 8. Recommended Season Filter
    if (filters.season && filters.season !== "all") {
      if (
        exp.recommendedSeason !== "year_round" &&
        exp.recommendedSeason !== filters.season
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Ranks, filters, and sorts all experiences according to user preferences and trip context.
 */
export function rankAllExperiences(
  inputs: DiscoveryRankingInputs,
  filters?: Partial<DiscoveryFilters>
): RankedExperience[] {
  const all = getAllExperiences();
  const filtered = filters ? filterExperiences(all, filters) : all;
  const ranked = filtered.map((exp) => rankExperience(exp, inputs));
  return sortRankedExperiences(ranked);
}

/**
 * Returns hidden gems specifically associated with or adjacent to a given destination ID.
 */
export function getExperiencesNearDestination(
  destinationId: string
): KarnatakaExperience[] {
  const normId = destinationId.toLowerCase().trim();
  return KARNATAKA_EXPERIENCES.filter(
    (exp) => exp.associatedDestinationId === normId
  );
}

/**
 * Returns all peaceful alternatives to popular crowded destinations.
 */
export function getPeacefulAlternatives(): KarnatakaExperience[] {
  return KARNATAKA_EXPERIENCES.filter(
    (exp) =>
      exp.category === "peaceful_alternatives" ||
      Boolean(exp.peacefulAlternativeTo)
  );
}

/**
 * Returns low-budget and free experiences (admission cost <= maxCostInr).
 */
export function getLowBudgetExperiences(
  maxCostInr: number = 50
): KarnatakaExperience[] {
  return KARNATAKA_EXPERIENCES.filter(
    (exp) =>
      exp.budgetTier === "free" || exp.estimatedCostInr <= maxCostInr
  );
}

/**
 * Converts a KarnatakaExperience into a typed ItineraryStop
 * so it can be seamlessly inserted into the itinerary workspace.
 */
export function convertExperienceToItineraryStop(
  experience: KarnatakaExperience,
  timeOfDay: ActivityTimeOfDay = "afternoon"
): ItineraryStop {
  let activityType: ItineraryStop["activityType"] = "exploration";
  if (experience.category === "food_culinary") {
    activityType = "dining";
  } else if (experience.category === "village_cultural" || experience.category === "heritage") {
    activityType = "cultural";
  } else if (experience.category === "nature" || experience.category === "waterfalls_viewpoints") {
    activityType = "nature";
  } else if (experience.category === "responsible_adventure") {
    activityType = "exploration";
  }

  return {
    timeOfDay,
    title: experience.titleEn,
    destinationId: experience.associatedDestinationId,
    destinationName: experience.associatedDestinationName,
    destinationKannada: experience.associatedDestinationKannada,
    location: `${experience.titleEn}, ${experience.district}`,
    district: experience.district,
    description: `${experience.shortDescriptionEn} (${experience.whySpecialEn})`,
    highlightMatch: experience.categoryLabelEn,
    estimatedDuration: experience.durationLabelEn,
    activityType,
    mealOrRestNote:
      experience.estimatedCostInr > 0
        ? `Estimated admission/entry: ~₹${experience.estimatedCostInr}`
        : "Free access / zero admission charge",
    transitNote: `Data confidence: ${experience.sourceCitationEn} · Season: ${experience.seasonLabelEn}`,
  };
}

/**
 * Converts a KarnatakaExperience into a typed RouteStop
 * when verified coordinates are available.
 */
export function convertExperienceToRouteStop(
  experience: KarnatakaExperience,
  _dayNumber: number,
  sequenceOrder: number = 99
): RouteStop {
  const coords = experience.coordinates || {
    latitude: 12.9716,
    longitude: 77.5946,
  };

  return {
    id: `gem-${experience.id}`,
    sequenceNumber: sequenceOrder,
    attractionId: experience.id,
    title: experience.titleEn,
    titleKn: experience.titleKn,
    destinationId: experience.associatedDestinationId,
    destinationName: experience.associatedDestinationName,
    destinationKannada: experience.associatedDestinationKannada,
    coordinates: coords,
    activityType:
      experience.category === "heritage"
        ? "heritage"
        : experience.category === "nature" || experience.category === "waterfalls_viewpoints"
        ? "nature"
        : experience.category === "food_culinary"
        ? "dining"
        : "exploration",
    estimatedDurationMinutes: experience.visitDurationMinutes,
    timeOfDay: "afternoon",
    googleMapsSearchUrl: experience.googleMapsSearchUrl,
    descriptionEn: experience.shortDescriptionEn,
    descriptionKn: experience.shortDescriptionKn,
    mealOrRestNoteEn: experience.costLabelEn,
    mealOrRestNoteKn: experience.costLabelKn,
  };
}
