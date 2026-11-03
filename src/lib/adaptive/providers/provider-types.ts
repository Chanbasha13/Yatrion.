import type { GeoCoordinates } from "../../routes/route-types";
import type { DataProvenance, ConfidenceLevel, ConditionCategory } from "../adaptive-types";

/* =========================================================================
   1. PROVIDER STATUS & FRESHNESS DEFINITIONS
   ========================================================================= */

export type ProviderStatus =
  | "operational"    // Responding normally with valid data
  | "degraded"       // Responding with partial or fallback data
  | "unavailable"    // Genuine unavailability (e.g. no open API exists)
  | "rate_limited"    // Rate limit hit (HTTP 429)
  | "error";          // Network, parsing, or server error

export type FreshnessState =
  | "fresh"          // Age <= 50% of TTL
  | "aging"          // 50% < Age <= 100% of TTL
  | "expired"        // Age > 100% of TTL
  | "unavailable"    // No data retrieved
  | "invalid";       // Corrupted timestamps or physical values

export interface DataFreshness {
  state: FreshnessState;
  retrievedAt: string;     // ISO timestamp of retrieval
  observedAt?: string;     // ISO timestamp of sensor observation (if live)
  expiresAt: string;       // ISO timestamp when data must be refreshed
  ageSeconds: number;
  ttlSeconds: number;
  isFresh: boolean;        // true if state === "fresh" || state === "aging"
}

/* =========================================================================
   2. PROVIDER METADATA & RESULT ENVELOPE
   ========================================================================= */

export interface ProviderAttribution {
  textEn: string;
  textKn: string;
  url: string;
  license: string;
}

export interface ProviderMetadata {
  id: string;
  name: string;
  category: "weather" | "travel_disruption";
  attribution: ProviderAttribution;
  termsUrl: string;
  requiresApiKey: false;
  maxRequestsPerDay?: number;
}

export interface ProviderError {
  code: string;
  messageEn: string;
  messageKn: string;
  statusCode?: number;
  isRetryable: boolean;
}

export interface ProviderResult<T> {
  providerId: string;
  providerName: string;
  category: ConditionCategory;
  status: ProviderStatus;
  data?: T;
  error?: ProviderError;
  metadata: ProviderMetadata;
  freshness: DataFreshness;
  provenance: DataProvenance;
  confidence: ConfidenceLevel;
  isLiveObservation: boolean;
  isForecast: boolean;
  forecastPeriod?: string;
}

export interface ProviderFetchOptions {
  targetDate?: string;
  skipCache?: boolean;
  timeoutMs?: number;
}

/* =========================================================================
   3. GENERIC CONDITION PROVIDER INTERFACE
   ========================================================================= */

export interface ConditionProvider<T> {
  metadata: ProviderMetadata;
  getStatus(): Promise<ProviderStatus>;
  fetchConditions(
    destinationId: string,
    coordinates: GeoCoordinates,
    options?: ProviderFetchOptions
  ): Promise<ProviderResult<T>>;
}

/* =========================================================================
   4. WEATHER DOMAIN DATA
   ========================================================================= */

export interface WeatherObservation {
  temperatureC: number;
  apparentTemperatureC: number;
  relativeHumidityPercent?: number;
  precipitationMm: number;
  windSpeedKmh: number;
  weatherCode: number;
  weatherDescriptionEn: string;
  weatherDescriptionKn: string;
  isDay?: boolean;
  observedAt: string;
}

export interface WeatherForecastDay {
  date: string;
  weatherCode: number;
  weatherDescriptionEn: string;
  weatherDescriptionKn: string;
  tempMaxC: number;
  tempMinC: number;
  precipitationProbabilityPercent: number;
  precipitationMm: number;
  windSpeedMaxKmh: number;
}

export interface DestinationWeatherData {
  destinationId: string;
  destinationName: string;
  coordinates: GeoCoordinates;
  current?: WeatherObservation;
  dailyForecast: WeatherForecastDay[];
  retrievedAt: string;
}

export type WeatherProvider = ConditionProvider<DestinationWeatherData>;

/* =========================================================================
   5. TRAVEL DISRUPTION DOMAIN DATA
   ========================================================================= */

export interface TravelDisruptionAlert {
  id: string;
  severity: "critical" | "warning" | "advisory";
  category: "road_closure" | "weather_hazard" | "forest_entry_ban" | "transit_strike";
  titleEn: string;
  titleKn: string;
  descriptionEn: string;
  descriptionKn: string;
  corridorOrRoad?: string;
  affectedDestinationIds: string[];
  effectiveFrom: string;
  effectiveUntil?: string;
  officialSource: string;
  sourceUrl?: string;
}

export interface DestinationDisruptionData {
  destinationId: string;
  alerts: TravelDisruptionAlert[];
  disruptionReportingAvailable: boolean;
  disclaimerEn: string;
  disclaimerKn: string;
  retrievedAt: string;
}

export type TravelDisruptionProvider = ConditionProvider<DestinationDisruptionData>;

