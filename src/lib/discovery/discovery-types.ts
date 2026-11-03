import type { RegionId } from "../destinations-data";
import type { GeoCoordinates } from "../routes/route-types";
import type {
  TripPreferences,
  TripInterest,
  TravelStyle,
  TransportPreference,
} from "../planner-types";
import type { BudgetScenarioType } from "../budget/budget-types";

/* =========================================================================
   1. CATEGORY, EFFORT, ACCESSIBILITY & CONFIDENCE ENUMS
   ========================================================================= */

export type ExperienceCategory =
  | "heritage"
  | "nature"
  | "waterfalls_viewpoints"
  | "village_cultural"
  | "food_culinary"
  | "peaceful_alternatives"
  | "responsible_adventure"
  | "offbeat_photography";

export type ExperienceBudgetTier = "free" | "budget" | "moderate" | "premium";

export type PhysicalEffortLevel = "easy" | "moderate" | "strenuous";

export type AccessibilityRating =
  | "wheelchair_accessible"
  | "partially_accessible"
  | "steep_steps"
  | "rocky_uneven"
  | "not_accessible";

export type DataSourceConfidence =
  | "verified_karnatakatourism"
  | "verified_asi"
  | "verified_field_curated"
  | "editorial_suggestion";

export type RecommendedSeason =
  | "monsoon"
  | "post_monsoon"
  | "winter"
  | "summer"
  | "year_round";

/* =========================================================================
   2. KARNATAKA HIDDEN GEM EXPERIENCE MODEL
   ========================================================================= */

export interface KarnatakaExperience {
  id: string;
  titleEn: string;
  titleKn: string;
  category: ExperienceCategory;
  categoryLabelEn: string;
  categoryLabelKn: string;
  region: RegionId;
  district: string;
  associatedDestinationId: string; // Destination ID from DESTINATIONS registry
  associatedDestinationName: string;
  associatedDestinationKannada: string;
  shortDescriptionEn: string;
  shortDescriptionKn: string;
  whySpecialEn: string;
  whySpecialKn: string;
  visitDurationMinutes: number;
  durationLabelEn: string;
  durationLabelKn: string;
  recommendedSeason: RecommendedSeason;
  seasonLabelEn: string;
  seasonLabelKn: string;
  budgetTier: ExperienceBudgetTier;
  estimatedCostInr: number; // 0 for free viewpoints, or approx admission fee
  costLabelEn: string;
  costLabelKn: string;
  physicalEffort: PhysicalEffortLevel;
  effortLabelEn: string;
  effortLabelKn: string;
  accessibility: AccessibilityRating;
  accessibilityNoteEn: string;
  accessibilityNoteKn: string;
  responsibleTourismGuidanceEn: string;
  responsibleTourismGuidanceKn: string;
  dataConfidence: DataSourceConfidence;
  sourceCitationEn: string;
  sourceCitationKn: string;
  coordinates: GeoCoordinates | null;
  googleMapsSearchUrl: string;
  tags: (TripInterest | string)[];
  crowdLevelDisclaimerEn: string;
  crowdLevelDisclaimerKn: string;
  peacefulAlternativeTo?: string; // Popular destination or attraction this gem offers a quiet alternative to
  image?: string;
  imageAlt?: string;
}

/* =========================================================================
   3. DISCOVERY FILTERS & QUERY PARAMETERS
   ========================================================================= */

export interface DiscoveryFilters {
  searchQuery: string;
  category: ExperienceCategory | "all";
  region: RegionId | "all";
  destinationId: string | "all";
  budgetTier: ExperienceBudgetTier | "all";
  maxDurationMinutes: number | "all";
  effortLevel: PhysicalEffortLevel | "all";
  season: RecommendedSeason | "all";
}

/* =========================================================================
   4. PERSONALIZED RANKING MODEL
   ========================================================================= */

export interface RankedExperience {
  experience: KarnatakaExperience;
  relevanceScore: number; // 0 to 100
  matchReasonsEn: string[];
  matchReasonsKn: string[];
  isNearSelectedDestination: boolean;
  isAlternativeToPopular: boolean;
  isBudgetFriendly: boolean;
  isSeasonallyOptimal: boolean;
}

export interface DiscoveryRankingInputs {
  preferences?: TripPreferences | null;
  selectedDestinationIds?: string[];
  activeBudgetScenario?: BudgetScenarioType;
  budgetScenario?: BudgetScenarioType;
  durationDays?: number;
  travelStyle?: TravelStyle;
  transportPreference?: TransportPreference;
  userInterests?: TripInterest[];
  interests?: TripInterest[];
  departureDate?: string;
}
