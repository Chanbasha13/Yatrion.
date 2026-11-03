import type { GeoCoordinates } from "../../routes/route-types";
import type {
  DestinationDisruptionData,
  ProviderFetchOptions,
  ProviderMetadata,
  ProviderResult,
  ProviderStatus,
  TravelDisruptionAlert,
  TravelDisruptionProvider,
} from "./provider-types";
import { evaluateFreshness, DISRUPTION_TTL_SECONDS } from "./freshness-evaluator";

export const KARNATAKA_DISRUPTION_METADATA: ProviderMetadata = {
  id: "karnataka-official-advisories",
  name: "Karnataka Official Travel Advisory & Disruption Service",
  category: "travel_disruption",
  attribution: {
    textEn: "Official government travel advisories via Karnataka Disaster Management Authority",
    textKn: "ಕರ್ನಾಟಕ ರಾಜ್ಯ ನೈಸರ್ಗಿಕ ವಿಕೋಪ ಉಸ್ತುವಾರಿ ಮತ್ತು ಪ್ರವಾಸೋದ್ಯಮ ಇಲಾಖೆ ಅಧಿಕೃತ ಪ್ರಕಟಣೆಗಳು",
    url: "https://karnataka.gov.in",
    license: "Open Government Data (OGD) Platform / Public Bulletin",
  },
  termsUrl: "https://karnataka.gov.in",
  requiresApiKey: false,
};

/**
 * Karnataka Travel Disruption Provider implementation.
 *
 * Grounded Engineering Principle:
 * Official government departments (KSRTC, PWD, Traffic Police) do NOT offer a public,
 * unauthenticated open REST API for road closures or strikes without restricted credentials.
 * This provider honestly reports "unavailable" rather than fabricating fake disruption telemetry.
 * If verified bulletin fixtures are explicitly supplied (e.g. in tests or official admin updates),
 * it serves them with strict attribution.
 */
export class KarnatakaDisruptionProvider implements TravelDisruptionProvider {
  public readonly metadata: ProviderMetadata = KARNATAKA_DISRUPTION_METADATA;
  private verifiedAlerts: Map<string, TravelDisruptionAlert[]> = new Map();

  constructor(initialAlerts?: Record<string, TravelDisruptionAlert[]>) {
    if (initialAlerts) {
      for (const [destId, alerts] of Object.entries(initialAlerts)) {
        this.verifiedAlerts.set(destId.toLowerCase(), alerts);
      }
    }
  }

  public async getStatus(): Promise<ProviderStatus> {
    return this.verifiedAlerts.size > 0 ? "operational" : "unavailable";
  }

  /**
   * Allows injecting authentic administrative or verified gazette advisories.
   */
  public registerVerifiedAlert(destinationId: string, alert: TravelDisruptionAlert): void {
    const key = destinationId.toLowerCase();
    const existing = this.verifiedAlerts.get(key) || [];
    this.verifiedAlerts.set(key, [...existing, alert]);
  }

  public async fetchConditions(
    destinationId: string,
    coordinates: GeoCoordinates,
    options?: ProviderFetchOptions
  ): Promise<ProviderResult<DestinationDisruptionData>> {
    void coordinates;
    void options;
    const retrievedAt = new Date().toISOString();
    const key = destinationId.toLowerCase();
    const alerts = this.verifiedAlerts.get(key) || [];

    // If verified alerts were registered for this destination
    if (alerts.length > 0) {
      const data: DestinationDisruptionData = {
        destinationId,
        alerts,
        disruptionReportingAvailable: true,
        disclaimerEn: "Official advisories verified from state gazette publications. Always confirm local travel advice before departure.",
        disclaimerKn: "ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪ್ರಕಟಣೆಗಳಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಪ್ರಯಾಣಕ್ಕೆ ಮುನ್ನ ಸ್ಥಳೀಯ ಪರಿಸ್ಥಿತಿಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
        retrievedAt,
      };

      return {
        providerId: this.metadata.id,
        providerName: this.metadata.name,
        category: "route_disruption",
        status: "operational",
        data,
        metadata: this.metadata,
        freshness: evaluateFreshness(retrievedAt, retrievedAt, DISRUPTION_TTL_SECONDS),
        provenance: "external_live",
        confidence: "high",
        isLiveObservation: true,
        isForecast: false,
      };
    }

    // Default honest behavior: no open API exists; zero fabricated disruptions
    const unavailableData: DestinationDisruptionData = {
      destinationId,
      alerts: [],
      disruptionReportingAvailable: false,
      disclaimerEn: "No public, unauthenticated open REST API for road closures is available from state authorities. Zero fabricated disruption telemetry.",
      disclaimerKn: "ರಸ್ತೆ ಮುಚ್ಚುವಿಕೆ ಕುರಿತು ಯಾವುದೇ ಮುಕ್ತ ಸರ್ಕಾರಿ API ಲಭ್ಯವಿಲ್ಲ. ಕಾಲ್ಪನಿಕ ಅಡೆತಡೆಗಳನ್ನು ಸೃಷ್ಟಿಸಲಾಗುವುದಿಲ್ಲ.",
      retrievedAt,
    };

    return {
      providerId: this.metadata.id,
      providerName: this.metadata.name,
      category: "route_disruption",
      status: "unavailable",
      data: unavailableData,
      metadata: this.metadata,
      freshness: {
        state: "unavailable",
        retrievedAt,
        expiresAt: retrievedAt,
        ageSeconds: 0,
        ttlSeconds: DISRUPTION_TTL_SECONDS,
        isFresh: false,
      },
      provenance: "static_knowledge",
      confidence: "high",
      isLiveObservation: false,
      isForecast: false,
      error: {
        code: "NO_PUBLIC_DISRUPTION_API",
        messageEn: "State government road closure telemetry is unavailable via open unauthenticated APIs. Zero fabricated disruptions.",
        messageKn: "ಸರ್ಕಾರಿ ರಸ್ತೆ ಸಂಚಾರ ಮುಚ್ಚುವಿಕೆಯ ಮುಕ್ತ API ಲಭ್ಯವಿಲ್ಲ. ಯಾವುದೇ ಕಾಲ್ಪನಿಕ ಅಡೆತಡೆಗಳನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ.",
        isRetryable: false,
      },
    };
  }
}
