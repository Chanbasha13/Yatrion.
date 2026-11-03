import type {
  TripDurationDays,
  TravelStyle,
  TransportPreference,
  BudgetTier,
  TripInterest,
} from "../planner-types";

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export type AttractionCategory =
  | "heritage"
  | "nature"
  | "cultural"
  | "scenic"
  | "adventure"
  | "spiritual"
  | "coastal"
  | "dining";

export interface AttractionRecord {
  id: string;
  name: string;
  kannadaName: string;
  destinationId: string;
  destinationName: string;
  destinationKannada: string;
  coordinates: GeoCoordinates;
  category: AttractionCategory;
  typicalDurationMinutes: number;
  optimalTimeOfDay: "morning" | "afternoon" | "evening" | "any";
  descriptionEn: string;
  descriptionKn: string;
  timingNoteEn?: string;
  timingNoteKn?: string;
  highlightMatch?: string;
}

export interface RouteLeg {
  fromStopId: string;
  toStopId: string;
  fromTitle: string;
  toTitle: string;
  haversineDistanceKm: number;
  estimatedRoadDistanceKm: number;
  estimatedDurationMinutes: number;
  terrainType: "plains" | "ghats" | "coastal";
  transportMode: TransportPreference;
  transitAdviceEn: string;
  transitAdviceKn: string;
  googleMapsDirUrl: string;
}

export interface RouteStop {
  id: string;
  sequenceNumber: number;
  attractionId?: string;
  title: string;
  titleKn: string;
  destinationId: string;
  destinationName: string;
  destinationKannada: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  coordinates: GeoCoordinates;
  estimatedDurationMinutes: number;
  activityType: string;
  descriptionEn: string;
  descriptionKn: string;
  mealOrRestNoteEn?: string;
  mealOrRestNoteKn?: string;
  googleMapsSearchUrl: string;
  isCompleted?: boolean;
  userNotes?: string;
}

export interface MealBreak {
  timeOfDay: "morning" | "afternoon" | "evening";
  titleEn: string;
  titleKn: string;
  durationMinutes: number;
  recommendationEn: string;
  recommendationKn: string;
}

export interface DailyRoute {
  dayNumber: number;
  dateLabel?: string;
  destinationId: string;
  destinationName: string;
  destinationKannada: string;
  themeEn: string;
  themeKn: string;
  stops: RouteStop[];
  legs: RouteLeg[];
  totalDistanceKm: number;
  totalTravelTimeMinutes: number;
  totalActivityTimeMinutes: number;
  mealBreaks: MealBreak[];
  pacingAlertEn?: string;
  pacingAlertKn?: string;
}

export interface RouteFeasibilityWarning {
  id: string;
  type: "backtracking" | "excessive_travel" | "overcrowded" | "timing_conflict" | "terrain_alert";
  severity: "info" | "warning" | "caution";
  titleEn: string;
  titleKn: string;
  messageEn: string;
  messageKn: string;
  dayNumber?: number;
}

export interface AlternativeRouteSuggestion {
  id: string;
  titleEn: string;
  titleKn: string;
  descriptionEn: string;
  descriptionKn: string;
  benefitEn: string;
  benefitKn: string;
  suggestedPace?: TravelStyle;
}

export type TravelIntensity = "relaxed" | "balanced" | "packed";

export interface OptimizedRoutePlan {
  id: string;
  title: string;
  kannadaSubtitle: string;
  startingLocation: string;
  startCoordinates: GeoCoordinates;
  travelStyle: TravelStyle;
  transport: TransportPreference;
  intensity: TravelIntensity;
  intensityReasonEn: string;
  intensityReasonKn: string;
  totalEstimatedDistanceKm: number;
  totalEstimatedTransitHours: number;
  totalStopsCount: number;
  dailyRoutes: DailyRoute[];
  feasibilityWarnings: RouteFeasibilityWarning[];
  alternativeSuggestions: AlternativeRouteSuggestion[];
  generatedAt: string;
  isFallback: boolean;
}

export interface RouteOptimizationOptions {
  destinationIds: string[];
  durationDays: TripDurationDays;
  startingLocation?: string;
  departureDate?: string;
  budget?: BudgetTier;
  interests?: TripInterest[];
  travelStyle?: TravelStyle;
  transport?: TransportPreference;
  groupType?: string;
  travellerCount?: number;
}
