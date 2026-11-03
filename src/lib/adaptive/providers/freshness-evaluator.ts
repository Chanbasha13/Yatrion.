import type { GeoCoordinates } from "../../routes/route-types";
import type { DataFreshness, FreshnessState } from "./provider-types";

export const WEATHER_OBSERVATION_TTL_SECONDS = 1800;  // 30 minutes
export const WEATHER_FORECAST_TTL_SECONDS = 21600;     // 6 hours
export const DISRUPTION_TTL_SECONDS = 86400;           // 24 hours

/**
 * Evaluates the freshness state and validity of an observation or forecast.
 * Rejects malformed dates and calculates deterministic age and expiration.
 */
export function evaluateFreshness(
  retrievedAt: string,
  observedAt?: string,
  ttlSeconds: number = WEATHER_FORECAST_TTL_SECONDS,
  referenceDate: Date = new Date()
): DataFreshness {
  const retrievedTime = Date.parse(retrievedAt);
  if (isNaN(retrievedTime)) {
    return {
      state: "invalid",
      retrievedAt,
      observedAt,
      expiresAt: new Date(0).toISOString(),
      ageSeconds: Infinity,
      ttlSeconds,
      isFresh: false,
    };
  }

  if (observedAt) {
    const observedTime = Date.parse(observedAt);
    if (isNaN(observedTime)) {
      return {
        state: "invalid",
        retrievedAt,
        observedAt,
        expiresAt: new Date(0).toISOString(),
        ageSeconds: Infinity,
        ttlSeconds,
        isFresh: false,
      };
    }
  }

  const nowTime = referenceDate.getTime();
  const ageSeconds = Math.max(0, Math.floor((nowTime - retrievedTime) / 1000));
  const expiresAt = new Date(retrievedTime + ttlSeconds * 1000).toISOString();

  let state: FreshnessState;
  if (ageSeconds <= ttlSeconds * 0.5) {
    state = "fresh";
  } else if (ageSeconds <= ttlSeconds) {
    state = "aging";
  } else {
    state = "expired";
  }

  return {
    state,
    retrievedAt,
    observedAt,
    expiresAt,
    ageSeconds,
    ttlSeconds,
    isFresh: state === "fresh" || state === "aging",
  };
}

/**
 * Validates that GPS coordinates fall within mathematically sound terrestrial bounds.
 */
export function validateCoordinates(coords?: GeoCoordinates | null): boolean {
  if (!coords) return false;
  const { latitude, longitude } = coords;

  if (typeof latitude !== "number" || typeof longitude !== "number") return false;
  if (!isFinite(latitude) || !isFinite(longitude)) return false;

  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;

  return true;
}

/**
 * Validates that atmospheric and physical weather measurements fall within real-world sanity limits.
 * Protects downstream planning engines from impossible telemetry corruption or spoofing.
 */
export function validateWeatherMeasurements(measurements: {
  temperatureC?: number;
  apparentTemperatureC?: number;
  precipitationMm?: number;
  windSpeedKmh?: number;
  relativeHumidityPercent?: number;
}): boolean {
  const {
    temperatureC,
    apparentTemperatureC,
    precipitationMm,
    windSpeedKmh,
    relativeHumidityPercent,
  } = measurements;

  if (typeof temperatureC === "number") {
    if (!isFinite(temperatureC) || temperatureC < -40 || temperatureC > 60) return false;
  }

  if (typeof apparentTemperatureC === "number") {
    if (!isFinite(apparentTemperatureC) || apparentTemperatureC < -50 || apparentTemperatureC > 65) return false;
  }

  if (typeof precipitationMm === "number") {
    if (!isFinite(precipitationMm) || precipitationMm < 0 || precipitationMm > 1500) return false;
  }

  if (typeof windSpeedKmh === "number") {
    if (!isFinite(windSpeedKmh) || windSpeedKmh < 0 || windSpeedKmh > 350) return false;
  }

  if (typeof relativeHumidityPercent === "number") {
    if (!isFinite(relativeHumidityPercent) || relativeHumidityPercent < 0 || relativeHumidityPercent > 100) return false;
  }

  return true;
}

