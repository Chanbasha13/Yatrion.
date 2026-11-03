import type { GeoCoordinates } from "../../routes/route-types";
import type {
  DestinationWeatherData,
  ProviderFetchOptions,
  ProviderMetadata,
  ProviderResult,
  ProviderStatus,
  WeatherForecastDay,
  WeatherObservation,
  WeatherProvider,
} from "./provider-types";
import {
  evaluateFreshness,
  validateCoordinates,
  validateWeatherMeasurements,
  WEATHER_OBSERVATION_TTL_SECONDS,
} from "./freshness-evaluator";
import { ConditionCache, globalConditionCache } from "./condition-cache";

export const OPEN_METEO_METADATA: ProviderMetadata = {
  id: "open-meteo",
  name: "Open-Meteo Weather Service",
  category: "weather",
  attribution: {
    textEn: "Weather data by Open-Meteo.com under CC BY 4.0",
    textKn: "ಮುಕ್ತ ಹವಾಮಾನ ಮಾಹಿತಿ: Open-Meteo.com (CC BY 4.0)",
    url: "https://open-meteo.com/",
    license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
  },
  termsUrl: "https://open-meteo.com/en/terms",
  requiresApiKey: false,
  maxRequestsPerDay: 10000,
};

/**
 * Maps WMO weather interpretation codes to bilingual descriptors.
 * Source: World Meteorological Organization (WMO) Code 4501.
 */
export function getWmoWeatherDescription(code: number): { en: string; kn: string } {
  switch (code) {
    case 0:
      return { en: "Clear sky", kn: "ಶುಭ್ರ ಆಕಾಶ" };
    case 1:
      return { en: "Mainly clear", kn: "ಹೆಚ್ಚಾಗಿ ಸ್ವಚ್ಛ ಆಕಾಶ" };
    case 2:
      return { en: "Partly cloudy", kn: "ಭಾಗಶಃ ಮೋಡ ಕವಿದಿದೆ" };
    case 3:
      return { en: "Overcast", kn: "ಸಂಪೂರ್ಣ ಮೋಡ ಕವಿದ ವಾತಾವರಣ" };
    case 45:
    case 48:
      return { en: "Foggy", kn: "ಮಂಜು ಮುಸುಕಿದ ವಾತಾವರಣ" };
    case 51:
    case 53:
    case 55:
      return { en: "Drizzle", kn: "ತುಂತುರು ಮಳೆ" };
    case 61:
      return { en: "Slight rain", kn: "ಹಗುರ ಮಳೆ" };
    case 63:
      return { en: "Moderate rain", kn: "ಮಧ್ಯಮ ಮಳೆ" };
    case 65:
      return { en: "Heavy rain", kn: "ಭಾರೀ ಮಳೆ" };
    case 80:
    case 81:
    case 82:
      return { en: "Rain showers", kn: "ಜಡಿಮಳೆ" };
    case 95:
      return { en: "Thunderstorm", kn: "ಗುಡುಗು ಸಹಿತ ಮಳೆ" };
    case 96:
    case 99:
      return { en: "Severe thunderstorm with hail", kn: "ಆಲಿಕಲ್ಲು ಸಹಿತ ಭೀಕರ ಗುಡುಗು ಮಳೆ" };
    default:
      return { en: "Atmospheric condition", kn: "ಸಾಮಾನ್ಯ ವಾತಾವರಣ" };
  }
}

/**
 * Open-Meteo Weather Provider implementation.
 * Zero-cost, keyless, non-commercial public meteorological integration.
 */
export class OpenMeteoWeatherProvider implements WeatherProvider {
  public readonly metadata: ProviderMetadata = OPEN_METEO_METADATA;
  private cache: ConditionCache;
  private fetchFn: typeof fetch;

  constructor(cache?: ConditionCache, customFetch?: typeof fetch) {
    this.cache = cache || globalConditionCache;
    this.fetchFn = customFetch || (typeof fetch !== "undefined" ? fetch.bind(globalThis) : (async () => {
      throw new Error("No global fetch available");
    }) as unknown as typeof fetch);
  }

  public async getStatus(): Promise<ProviderStatus> {
    return "operational";
  }

  public async fetchConditions(
    destinationId: string,
    coordinates: GeoCoordinates,
    options?: ProviderFetchOptions
  ): Promise<ProviderResult<DestinationWeatherData>> {
    const retrievedAt = new Date().toISOString();
    const cacheKey = ConditionCache.buildKey(this.metadata.id, destinationId, options?.targetDate || "forecast");

    // 1. Validate destination coordinates
    if (!validateCoordinates(coordinates)) {
      return {
        providerId: this.metadata.id,
        providerName: this.metadata.name,
        category: "weather",
        status: "error",
        metadata: this.metadata,
        freshness: {
          state: "invalid",
          retrievedAt,
          expiresAt: retrievedAt,
          ageSeconds: 0,
          ttlSeconds: WEATHER_OBSERVATION_TTL_SECONDS,
          isFresh: false,
        },
        provenance: "external_live",
        confidence: "unverified",
        isLiveObservation: false,
        isForecast: false,
        error: {
          code: "INVALID_COORDINATES",
          messageEn: `Invalid coordinates provided for ${destinationId} (${coordinates?.latitude}, ${coordinates?.longitude}).`,
          messageKn: `${destinationId} ತಾಣಕ್ಕೆ ಅಮಾನ್ಯ ಭೌಗೋಳಿಕ ನಿರ್ದೇಶಾಂಕಗಳು (${coordinates?.latitude}, ${coordinates?.longitude}).`,
          isRetryable: false,
        },
      };
    }

    // 2. Check Cache
    if (!options?.skipCache) {
      const cached = this.cache.get<DestinationWeatherData>(cacheKey);
      if (cached) {
        const freshness = evaluateFreshness(
          cached.retrievedAt,
          cached.current?.observedAt,
          WEATHER_OBSERVATION_TTL_SECONDS
        );
        return {
          providerId: this.metadata.id,
          providerName: this.metadata.name,
          category: "weather",
          status: "operational",
          data: cached,
          metadata: this.metadata,
          freshness,
          provenance: "external_live",
          confidence: "high",
          isLiveObservation: Boolean(cached.current),
          isForecast: cached.dailyForecast.length > 0,
          forecastPeriod: `${cached.dailyForecast.length} days`,
        };
      }
    }

    // 3. Build Safe Keyless API Query
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", coordinates.latitude.toFixed(4));
    url.searchParams.set("longitude", coordinates.longitude.toFixed(4));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m"
    );
    url.searchParams.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max"
    );
    url.searchParams.set("timezone", "Asia/Kolkata");

    const timeoutMs = options?.timeoutMs || 6000;
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    try {
      const response = await this.fetchFn(url.toString(), {
        method: "GET",
        signal: controller?.signal,
        headers: { Accept: "application/json" },
      });

      if (timeoutId) clearTimeout(timeoutId);

      // Handle Rate Limiting
      if (response.status === 429) {
        return {
          providerId: this.metadata.id,
          providerName: this.metadata.name,
          category: "weather",
          status: "rate_limited",
          metadata: this.metadata,
          freshness: evaluateFreshness(retrievedAt, undefined, WEATHER_OBSERVATION_TTL_SECONDS),
          provenance: "external_live",
          confidence: "low",
          isLiveObservation: false,
          isForecast: false,
          error: {
            code: "RATE_LIMITED",
            messageEn: "Open-Meteo free rate limit reached (HTTP 429). Will retry after cooldown.",
            messageKn: "ಹವಾಮಾನ ಸೇವೆಯ ದರ ಮಿತಿ ಮೀರಿದೆ (HTTP 429). ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.",
            statusCode: 429,
            isRetryable: true,
          },
        };
      }

      // Handle HTTP Server/Client Errors
      if (!response.ok) {
        return {
          providerId: this.metadata.id,
          providerName: this.metadata.name,
          category: "weather",
          status: "error",
          metadata: this.metadata,
          freshness: evaluateFreshness(retrievedAt, undefined, WEATHER_OBSERVATION_TTL_SECONDS),
          provenance: "external_live",
          confidence: "unverified",
          isLiveObservation: false,
          isForecast: false,
          error: {
            code: "HTTP_ERROR",
            messageEn: `Open-Meteo upstream returned HTTP error ${response.status}.`,
            messageKn: `ಹವಾಮಾನ ಸೇವೆ ದೋಷ ಹಿಂತಿರುಗಿಸಿದೆ: HTTP ${response.status}.`,
            statusCode: response.status,
            isRetryable: response.status >= 500,
          },
        };
      }

      // Parse JSON
      let json: Record<string, unknown>;
      try {
        json = await response.json();
      } catch {
        return {
          providerId: this.metadata.id,
          providerName: this.metadata.name,
          category: "weather",
          status: "error",
          metadata: this.metadata,
          freshness: evaluateFreshness(retrievedAt, undefined, WEATHER_OBSERVATION_TTL_SECONDS),
          provenance: "external_live",
          confidence: "unverified",
          isLiveObservation: false,
          isForecast: false,
          error: {
            code: "MALFORMED_JSON",
            messageEn: "Failed to parse JSON response from Open-Meteo API.",
            messageKn: "ಹವಾಮಾನ ಸೇವೆಯಿಂದ ಬಂದ JSON ಡೇಟಾ ವಿಶ್ಲೇಷಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
            isRetryable: false,
          },
        };
      }

      // Validate Atmospheric Sanity
      const rawCurrent = (json.current || {}) as Record<string, unknown>;
      const rawDaily = (json.daily || {}) as Record<string, unknown>;

      const tempC = Number(rawCurrent.temperature_2m);
      const apparentTempC =
        typeof rawCurrent.apparent_temperature === "number"
          ? rawCurrent.apparent_temperature
          : tempC;
      const precipMm = Number(rawCurrent.precipitation || 0);
      const windKmh = Number(rawCurrent.wind_speed_10m || 0);
      const humidity =
        typeof rawCurrent.relative_humidity_2m === "number"
          ? rawCurrent.relative_humidity_2m
          : undefined;

      if (
        !validateWeatherMeasurements({
          temperatureC: tempC,
          apparentTemperatureC: apparentTempC,
          precipitationMm: precipMm,
          windSpeedKmh: windKmh,
          relativeHumidityPercent: humidity,
        })
      ) {
        return {
          providerId: this.metadata.id,
          providerName: this.metadata.name,
          category: "weather",
          status: "error",
          metadata: this.metadata,
          freshness: {
            state: "invalid",
            retrievedAt,
            expiresAt: retrievedAt,
            ageSeconds: 0,
            ttlSeconds: WEATHER_OBSERVATION_TTL_SECONDS,
            isFresh: false,
          },
          provenance: "external_live",
          confidence: "unverified",
          isLiveObservation: false,
          isForecast: false,
          error: {
            code: "MEASUREMENT_SANITY_FAILED",
            messageEn: "Atmospheric measurements failed terrestrial physical sanity verification.",
            messageKn: "ವಾತಾವರಣದ ಮಾಪನಗಳು ವಾಸ್ತವಿಕ ಮಿತಿಯನ್ನು ಮೀರಿದ್ದು ಅಮಾನ್ಯಗೊಂಡಿವೆ.",
            isRetryable: false,
          },
        };
      }

      // Construct Observation Object
      const weatherCode = Number(rawCurrent.weather_code || 0);
      const wmoDesc = getWmoWeatherDescription(weatherCode);

      const observation: WeatherObservation = {
        temperatureC: tempC,
        apparentTemperatureC: apparentTempC,
        relativeHumidityPercent: humidity,
        precipitationMm: precipMm,
        windSpeedKmh: windKmh,
        weatherCode,
        weatherDescriptionEn: wmoDesc.en,
        weatherDescriptionKn: wmoDesc.kn,
        observedAt: typeof rawCurrent.time === "string" ? rawCurrent.time : retrievedAt,
      };

      // Construct Daily Forecasts
      const dailyForecasts: WeatherForecastDay[] = [];
      const times = Array.isArray(rawDaily.time) ? (rawDaily.time as string[]) : [];
      const dailyCodes = Array.isArray(rawDaily.weather_code) ? (rawDaily.weather_code as number[]) : [];
      const maxTemps = Array.isArray(rawDaily.temperature_2m_max) ? (rawDaily.temperature_2m_max as number[]) : [];
      const minTemps = Array.isArray(rawDaily.temperature_2m_min) ? (rawDaily.temperature_2m_min as number[]) : [];
      const precipSums = Array.isArray(rawDaily.precipitation_sum) ? (rawDaily.precipitation_sum as number[]) : [];
      const precipProbs = Array.isArray(rawDaily.precipitation_probability_max)
        ? (rawDaily.precipitation_probability_max as number[])
        : [];
      const windMaxs = Array.isArray(rawDaily.wind_speed_10m_max) ? (rawDaily.wind_speed_10m_max as number[]) : [];

      for (let i = 0; i < times.length; i++) {
        const code = dailyCodes[i] || 0;
        const desc = getWmoWeatherDescription(code);
        dailyForecasts.push({
          date: times[i],
          weatherCode: code,
          weatherDescriptionEn: desc.en,
          weatherDescriptionKn: desc.kn,
          tempMaxC: Number(maxTemps[i] || tempC),
          tempMinC: Number(minTemps[i] || tempC),
          precipitationMm: Number(precipSums[i] || 0),
          precipitationProbabilityPercent: Number(precipProbs[i] || 0),
          windSpeedMaxKmh: Number(windMaxs[i] || windKmh),
        });
      }

      const weatherData: DestinationWeatherData = {
        destinationId,
        destinationName: destinationId.charAt(0).toUpperCase() + destinationId.slice(1),
        coordinates,
        current: observation,
        dailyForecast: dailyForecasts,
        retrievedAt,
      };

      // Save to cache
      this.cache.set(cacheKey, weatherData, WEATHER_OBSERVATION_TTL_SECONDS);

      const freshness = evaluateFreshness(
        retrievedAt,
        observation.observedAt,
        WEATHER_OBSERVATION_TTL_SECONDS
      );

      return {
        providerId: this.metadata.id,
        providerName: this.metadata.name,
        category: "weather",
        status: "operational",
        data: weatherData,
        metadata: this.metadata,
        freshness,
        provenance: "external_live",
        confidence: "high",
        isLiveObservation: true,
        isForecast: dailyForecasts.length > 0,
        forecastPeriod: `${dailyForecasts.length} days`,
      };
    } catch (err: unknown) {
      if (timeoutId) clearTimeout(timeoutId);

      const isAbort = err instanceof Error && err.name === "AbortError";
      return {
        providerId: this.metadata.id,
        providerName: this.metadata.name,
        category: "weather",
        status: "error",
        metadata: this.metadata,
        freshness: evaluateFreshness(retrievedAt, undefined, WEATHER_OBSERVATION_TTL_SECONDS),
        provenance: "external_live",
        confidence: "unverified",
        isLiveObservation: false,
        isForecast: false,
        error: {
          code: isAbort ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
          messageEn: isAbort
            ? `Open-Meteo connection timed out after ${timeoutMs}ms.`
            : `Network error connecting to Open-Meteo: ${(err as Error).message}`,
          messageKn: isAbort
            ? `ಹವಾಮಾನ ಸೇವೆ ಸಂಪರ್ಕ ಸಮಯ ಮೀರಿತು (${timeoutMs}ms).`
            : `ಹವಾಮಾನ ಸೇವೆ ಸಂಪರ್ಕ ಜಾಲದೋಷ: ${(err as Error).message}`,
          isRetryable: true,
        },
      };
    }
  }
}
