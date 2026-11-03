import type {
  AdaptiveTripContext,
  DetectedTripIssue,
  IssueSeverity,
  ConditionCategory,
} from "./adaptive-types";
import { aggregateAccessibilityRequirements } from "../group/group-preferences";

/**
 * Known strenuous activities in Karnataka with steep stone stairs or uneven boulders
 * that pose physical barriers for wheelchair users and step-free travelers.
 */
const KNOWN_STRENUOUS_ATTRACTION_KEYWORDS = [
  { keyword: "matanga", name: "Matanga Hill", district: "Ballari", reason: "Steep uneven boulders with no handrails or ramp access." },
  { keyword: "badami cave", name: "Badami Cave Temples", district: "Bagalkote", reason: "Steep stone cliff stairways without wheelchair ramps." },
  { keyword: "mullayanagiri", name: "Mullayanagiri Peak", district: "Chikkamagaluru", reason: "Steep 500+ windward steps to the mountain summit." },
  { keyword: "half moon", name: "Half Moon & Paradise Beach Trek", district: "Uttara Kannada", reason: "Rugged coastal headland cliff footpath with loose gravel." },
  { keyword: "kudremukh", name: "Kudremukh Peak Trek", district: "Chikkamagaluru", reason: "High-intensity 20km steep mountain trail." },
  { keyword: "kote betta", name: "Kote Betta Trail", district: "Kodagu", reason: "Strenuous uphill forest trek with rocky ascents." },
];

/**
 * Seasonal evidence in Karnataka:
 * Waterfalls trickle in dry summer; wildlife tracks close in peak monsoon; beaches have red flags in monsoon.
 */
const SEASONAL_GROUNDED_CONSTRAINTS = [
  {
    months: [3, 4, 5], // March, April, May (Summer)
    keywords: ["jog falls", "abbey falls", "hebbe falls", "shivanasamudra", "waterfall", "ಜಲಪಾತ"],
    category: "seasonal_restriction" as ConditionCategory,
    severity: "warning" as IssueSeverity,
    titleEn: "Summer Season: Reduced Waterfall Volume",
    titleKn: "ಬೇಸಿಗೆ ಕಾಲ: ಜಲಪಾತಗಳಲ್ಲಿ ನೀರಿನ ಹರಿವು ಕಡಿಮೆ",
    explanationEn: "In summer (March–May), Karnataka waterfalls experience substantially reduced water volumes before the arrival of the south-west monsoon.",
    explanationKn: "ಬೇಸಿಗೆಯ ದಿನಗಳಲ್ಲಿ (ಮಾರ್ಚ್-ಮೇ) ಮುಂಗಾರು ಮಳೆಯ ಆರಂಭಕ್ಕೂ ಮುನ್ನ ಕರ್ನಾಟಕದ ಜಲಪಾತಗಳಲ್ಲಿ ನೀರಿನ ಹರಿವು ಗಣನೀಯವಾಗಿ ಕಡಿಮೆಯಿರುತ್ತದೆ.",
    suggestedActionEn: "Consider pairing or replacing with evergreen forest nature walks, tranquil riversides, or shady estate homestays.",
    suggestedActionKn: "ನಿತ್ಯಹರಿದ್ವರ್ಣ ಕಾಡಿನ ನಡಿಗೆ, ನದಿ ತೀರ ಅಥವಾ ತಂಪಾದ ಕಾಫಿ ತೋಟದ ವಾಸ್ತವ್ಯವನ್ನು ಪರ್ಯಾಯವಾಗಿ ಆಯ್ಕೆಮಾಡಿ.",
  },
  {
    months: [6, 7, 8], // June, July, August (Monsoon)
    keywords: ["safari", "bandipur safari", "kabini safari", "ಸಫಾರಿ"],
    category: "seasonal_restriction" as ConditionCategory,
    severity: "warning" as IssueSeverity,
    titleEn: "Monsoon Season: Forest Safari Advisory",
    titleKn: "ಮುಂಗಾರು ಮಳೆ: ಅರಣ್ಯ ಸಫಾರಿ ಸಲಹೆ",
    explanationEn: "During heavy monsoon months (July–August), interior dirt tracks in Bandipur, Nagarhole, and Kabini may become waterlogged, leading to restricted safari zones.",
    explanationKn: "ಭಾರೀ ಮುಂಗಾರು ಮಳೆಯ ಸಮಯದಲ್ಲಿ (ಜುಲೈ-ಆಗಸ್ಟ್) ಬಂಡೀಪುರ ಮತ್ತು ಕಬಿನಿಯ ಒಳಭಾಗದ ಮಣ್ಣಿನ ರಸ್ತೆಗಳಲ್ಲಿ ಸಂಚಾರ ಕಷ್ಟವಾಗಬಹುದು.",
    suggestedActionEn: "Verify safari availability with Jungle Lodges/Forest Dept or prioritize paved-road viewpoint tours.",
    suggestedActionKn: "ಜಂಗಲ್ ಲಾಡ್ಜಸ್ / ಅರಣ್ಯ ಇಲಾಖೆಯಲ್ಲಿ ಲಭ್ಯತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಮುಖ್ಯ ರಸ್ತೆಯ ವೀಕ್ಷಣಾ ಸ್ಥಳಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  },
  {
    months: [6, 7, 8], // June, July, August (Monsoon)
    keywords: ["beach", "gokarna beach", "om beach", "kudle beach", "malpe", "ಕಡಲತೀರ", "ಬೀಚ್"],
    category: "seasonal_restriction" as ConditionCategory,
    severity: "warning" as IssueSeverity,
    titleEn: "Monsoon Coastal Advisory: High Waves & Swimming Ban",
    titleKn: "ಮುಂಗಾರು ಕರಾವಳಿ ಎಚ್ಚರಿಕೆ: ಬಲವಾದ ಅಲೆಗಳು & ಈಜು ನಿಷೇಧ",
    explanationEn: "The Arabian Sea is rough during monsoon with active red warning flags preventing swimming or water sports at Gokarna, Karwar, and Udupi beaches.",
    explanationKn: "ಮುಂಗಾರು ಮಳೆಯ ಸಮಯದಲ್ಲಿ ಅರಬ್ಬಿ ಸಮುದ್ರದಲ್ಲಿ ಭಾರಿ ಅಲೆಗಳಿದ್ದು, ಗೋಕರ್ಣ ಮತ್ತು ಉಡುಪಿಯ ಕಡಲತೀರಗಳಲ್ಲಿ ಈಜುವುದು ಹಾಗೂ ಜಲಕ್ರೀಡೆಗಳನ್ನು ನಿಷೇಧಿಸಲಾಗುತ್ತದೆ.",
    suggestedActionEn: "Enjoy cliffside ocean vistas, coastal temple heritage, and regional seafood dining instead of water sports.",
    suggestedActionKn: "ಕಡಲತೀರದ ನೀರಿನ ಆಟಗಳ ಬದಲಾಗಿ ಬೆಟ್ಟದ ಮೇಲಿನ ಸಾಗರ ನೋಟ, ಕರಾವಳಿ ದೇವಾಲಯಗಳು ಹಾಗೂ ತಾಜಾ ಊಟವನ್ನು ಆನಂದಿಸಿ.",
  },
];

/**
 * Deterministically evaluates an existing itinerary and context, identifying
 * potential problems without modifying any user data.
 */
export function detectTripIssues(context: AdaptiveTripContext): DetectedTripIssue[] {
  const issues: DetectedTripIssue[] = [];
  const {
    preferences,
    days,
    routePlan,
    budgetPlan,
    groupState,
    externalConditions,
    hasLiveProviderConnected,
    weatherResults,
    disruptionResults,
  } = context;
  const travelStyle = preferences.travelStyle || "balanced";

  const isLiveConnected =
    Boolean(hasLiveProviderConnected) ||
    Boolean(weatherResults?.some((r) => r.status === "operational")) ||
    Boolean(disruptionResults?.some((r) => r.status === "operational"));

  // ── 1. MISSING LIVE TELEMETRY HONEST NOTIFICATION ──
  if (!isLiveConnected) {
    issues.push({
      id: "issue-telemetry-notice",
      severity: "info",
      category: "weather",
      titleEn: "No Live Weather or Traffic Telemetry Connected",
      titleKn: "ನೈಜ ಹವಾಮಾನ ಅಥವಾ ಟ್ರಾಫಿಕ್ ಫೀಡ್ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ",
      explanationEn: "Evaluation is grounded entirely in verified static tourism facts, terrain heuristics, and explicit user preferences. Real-time road closures or sudden weather shifts have not been queried.",
      explanationKn: "ಈ ವಿಶ್ಲೇಷಣೆಯು ಪರಿಶೀಲಿತ ಸ್ಥಿರ ಪ್ರವಾಸ ಡೇಟಾ ಮತ್ತು ಬಳಕೆದಾರರ ಆದ್ಯತೆಗಳನ್ನು ಆಧರಿಸಿದೆ. ನೈಜ ರಸ್ತೆ ಸಂಚಾರ ಅಥವಾ ಅನಿರೀಕ್ಷಿತ ಹವಾಮಾನವನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿಲ್ಲ.",
      evidence: "Verified Yatrion static knowledge base; zero fabricated live data.",
      provenance: "static_knowledge",
      confidence: "high",
      suggestedActionEn: "Verify road conditions locally before departure, especially along Western Ghats routes.",
      suggestedActionKn: "ಪ್ರಯಾಣ ಹೊರಡುವ ಮುನ್ನ ವಿಶೇಷವಾಗಿ ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ರಸ್ತೆ ಸ್ಥಿತಿಯನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಪರಿಶೀಲಿಸಿ.",
      actionType: "adjust_travel_pace",
    });
  }

  // ── 2A. LIVE WEATHER PROVIDER CONDITIONS ──
  if (weatherResults && weatherResults.length > 0) {
    for (const wRes of weatherResults) {
      if (wRes.status === "operational" && wRes.data) {
        const { destinationId, destinationName, current, dailyForecast } = wRes.data;

        // Check if destination is part of the itinerary
        const affectedDays = days.filter(
          (d) => d.destinationId.toLowerCase() === destinationId.toLowerCase()
        );

        for (const day of affectedDays) {
          // 1. Current / Immediate Heavy Rain Warning
          if (current && (current.precipitationMm >= 10 || current.weatherCode === 65 || current.weatherCode === 82)) {
            issues.push({
              id: `issue-weather-heavy-rain-${day.dayNumber}`,
              severity: "warning",
              category: "weather",
              dayNumber: day.dayNumber,
              titleEn: `Heavy Rainfall Advisory in ${destinationName} (~${current.precipitationMm}mm)`,
              titleKn: `${destinationName} ನಲ್ಲಿ ಭಾರಿ ಮಳೆಯ ಎಚ್ಚರಿಕೆ (~${current.precipitationMm} ಮಿ.ಮೀ)`,
              explanationEn: `Current atmospheric observation shows intense rainfall (${current.precipitationMm} mm, ${current.weatherDescriptionEn}) in ${destinationName}. Outdoor sights, coracle boating, and uncovered viewpoints will experience severe wetness.`,
              explanationKn: `ಪ್ರಸ್ತುತ ವಾತಾವರಣ ಪರಿಶೀಲನೆಯಂತೆ ${destinationName} ನಲ್ಲಿ ತೀವ್ರ ಮಳೆಯಾಗುತ್ತಿದೆ (${current.precipitationMm} ಮಿ.ಮೀ, ${current.weatherDescriptionKn}). ಹೊರಾಂಗಣ ತಾಣಗಳು ಮತ್ತು ದೋಣಿ ಸವಾರಿಗಳಿಗೆ ಅಡಚಣೆಯಾಗಬಹುದು.`,
              evidence: `Live observation at ${current.observedAt} via ${wRes.metadata.name} (${wRes.metadata.attribution.license}).`,
              provenance: wRes.provenance,
              confidence: wRes.confidence,
              suggestedActionEn: "Consider indoor cultural museums, palace galleries, or sheltering in a heritage café during the downpour.",
              suggestedActionKn: "ಒಳಾಂಗಣ ವಸ್ತುಸಂಗ್ರಹಾಲಯಗಳು, ಅರಮನೆ ಅಥವಾ ಕರಕುಶಲ ಕೇಂದ್ರಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಿ.",
              actionType: "replace_activity",
            });
          }

          // 2. High Wind Advisory on Mountain / Coastal Corridors
          if (current && current.windSpeedKmh >= 45) {
            issues.push({
              id: `issue-weather-high-wind-${day.dayNumber}`,
              severity: "warning",
              category: "weather",
              dayNumber: day.dayNumber,
              titleEn: `High Wind Advisory in ${destinationName} (~${current.windSpeedKmh} km/h)`,
              titleKn: `${destinationName} ನಲ್ಲಿ ತೀವ್ರ ಬಿರುಗಾಳಿ ಎಚ್ಚರಿಕೆ (~${current.windSpeedKmh} ಕಿ.ಮೀ/ಗಂ)`,
              explanationEn: `Sustained winds of ${current.windSpeedKmh} km/h detected in ${destinationName}. Mountain peak trails and steep ridge viewpoints pose walking hazards.`,
              explanationKn: `${destinationName} ನಲ್ಲಿ ಗಂಟೆಗೆ ${current.windSpeedKmh} ಕಿ.ಮೀ ವೇಗದ ಬಲವಾದ ಗಾಳಿ ಬೀಸುತ್ತಿದೆ. ಬೆಟ್ಟದ ತುದಿಯ ನಡಿಗೆಗೆ ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.`,
              evidence: `Live atmospheric telemetry via ${wRes.metadata.name}.`,
              provenance: wRes.provenance,
              confidence: wRes.confidence,
              suggestedActionEn: "Avoid exposed cliff edges and prioritize sheltered valley attractions.",
              suggestedActionKn: "ಕಡಿದಾದ ಕಣಿವೆ ಅಂಚುಗಳನ್ನು ತಪ್ಪಿಸಿ ಸುರಕ್ಷಿತ ತಾಣಗಳಿಗೆ ಭೇಟಿ ನೀಡಿ.",
              actionType: "adjust_travel_pace",
            });
          }

          // 3. Extreme Heat Advisory
          if (current && current.temperatureC >= 38) {
            issues.push({
              id: `issue-weather-extreme-heat-${day.dayNumber}`,
              severity: "warning",
              category: "weather",
              dayNumber: day.dayNumber,
              titleEn: `Extreme Heat Advisory in ${destinationName} (~${current.temperatureC}°C)`,
              titleKn: `${destinationName} ನಲ್ಲಿ ತೀವ್ರ ಬಿಸಿಲಿನ ತಾಪಮಾನ (~${current.temperatureC}°C)`,
              explanationEn: `Current temperature reaches ${current.temperatureC}°C (apparent: ${current.apparentTemperatureC}°C) in ${destinationName}. Direct midday boulder exploration carries dehydration and heat exhaustion risk.`,
              explanationKn: `${destinationName} ನಲ್ಲಿ ತಾಪಮಾನ ${current.temperatureC}°C ತಲುಪಿದೆ. ಮಧ್ಯಾಹ್ನದ ಕಲ್ಲುಬಂಡೆಗಳ ನಡಿಗೆಯಲ್ಲಿ ನಿರ್ಜಲೀಕರಣದ ಸಾಧ್ಯತೆಯಿದೆ.`,
              evidence: `Live temperature observation via ${wRes.metadata.name}.`,
              provenance: wRes.provenance,
              confidence: wRes.confidence,
              suggestedActionEn: "Shift boulder climbs to early morning and rest in shaded or air-conditioned pavilions between 12:00 PM and 3:30 PM.",
              suggestedActionKn: "ಬೆಳಗಿನ ಜಾವದಲ್ಲಿ ತಾಣ ವೀಕ್ಷಿಸಿ, ಮಧ್ಯಾಹ್ನ ನೆರಳಿನಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.",
              actionType: "reorder_stops",
            });
          }

          // 4. Forecast Rainfall Check (if daily forecast is present)
          const forecastForDay = dailyForecast[day.dayNumber - 1];
          if (forecastForDay && forecastForDay.precipitationProbabilityPercent >= 75 && forecastForDay.precipitationMm >= 15) {
            issues.push({
              id: `issue-weather-forecast-rain-${day.dayNumber}`,
              severity: "warning",
              category: "weather",
              dayNumber: day.dayNumber,
              titleEn: `Day ${day.dayNumber} Rain Forecast: ${destinationName} (${forecastForDay.precipitationProbabilityPercent}% chance)`,
              titleKn: `ದಿನ ${day.dayNumber} ಮಳೆ ಮುನ್ಸೂಚನೆ: ${destinationName} (${forecastForDay.precipitationProbabilityPercent}% ಸಂಭವನೀಯತೆ)`,
              explanationEn: `Meteorological forecast projects a ${forecastForDay.precipitationProbabilityPercent}% probability of rain (~${forecastForDay.precipitationMm} mm, ${forecastForDay.weatherDescriptionEn}) for Day ${day.dayNumber}.`,
              explanationKn: `ದಿನ ${day.dayNumber} ರಂದು ${destinationName} ನಲ್ಲಿ ${forecastForDay.precipitationProbabilityPercent}% ಮಳೆಯಾಗುವ ಮುನ್ಸೂಚನೆ ಇದೆ (~${forecastForDay.precipitationMm} ಮಿ.ಮೀ).`,
              evidence: `Multi-day numerical weather prediction via ${wRes.metadata.name}.`,
              provenance: wRes.provenance,
              confidence: "medium", // Forecast has natural variance
              suggestedActionEn: "Carry rain protection, waterproof gear, and maintain flexible afternoon pacing.",
              suggestedActionKn: "ಛತ್ರಿ, ರೇನ್‌ಕೋಟ್ ಜೊತೆಗಿಟ್ಟುಕೊಳ್ಳಿ ಮತ್ತು ಹೊಂದಿಕೊಳ್ಳುವ ಯೋಜನೆಯನ್ನು ಅನುಸರಿಸಿ.",
              actionType: "adjust_travel_pace",
            });
          }
        }
      } else if (wRes.status === "rate_limited") {
        issues.push({
          id: `issue-weather-rate-limited-${wRes.providerId}`,
          severity: "info",
          category: "weather",
          titleEn: "Weather Provider Rate Limit Reached",
          titleKn: "ಹವಾಮಾನ ಸೇವೆಯ ದರ ಮಿತಿ ತಲುಪಿದೆ",
          explanationEn: "The open weather service rate limit was encountered. The engine is operating on verified historical seasonal facts and heuristics.",
          explanationKn: "ಮುಕ್ತ ಹವಾಮಾನ ಸೇವೆಯ ದರ ಮಿತಿ ತಲುಪಿದೆ. ಪ್ರವಾಸ ಯೋಜನೆಯು ಪರಿಶೀಲಿತ ಸ್ಥಿರ ಡೇಟಾವನ್ನು ಬಳಸುತ್ತಿದೆ.",
          evidence: wRes.error?.messageEn || "HTTP 429 rate limit",
          provenance: "heuristic",
          confidence: "medium",
          suggestedActionEn: "Cached conditions will refresh automatically after cooldown.",
          suggestedActionKn: "ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮಾಹಿತಿ ನವೀಕರಣಗೊಳ್ಳುತ್ತದೆ.",
          actionType: "adjust_travel_pace",
        });
      } else if (wRes.status === "error") {
        issues.push({
          id: `issue-weather-error-${wRes.providerId}`,
          severity: "info",
          category: "weather",
          titleEn: "Weather Telemetry Feed Temporarily Unavailable",
          titleKn: "ಹವಾಮಾನ ಫೀಡ್ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ",
          explanationEn: `Live weather telemetry could not be retrieved (${wRes.error?.code || "UPSTREAM_ERROR"}). Operating safely on static seasonal guidelines.`,
          explanationKn: `ನೈಜ ಹವಾಮಾನ ಡೇಟಾ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ. ಪ್ರವಾಸ ಯೋಜನೆಯು ಸ್ಥಿರ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ಆಧರಿಸಿ ಮುಂದುವರಿಯುತ್ತದೆ.`,
          evidence: wRes.error?.messageEn || "Upstream provider error",
          provenance: "static_knowledge",
          confidence: "medium",
          suggestedActionEn: "Check local weather forecasts before major outdoor ascents.",
          suggestedActionKn: "ಸ್ಥಳೀಯ ಹವಾಮಾನ ಮಾಹಿತಿಯನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
          actionType: "adjust_travel_pace",
        });
      }
    }
  }

  // ── 2B. LIVE TRAVEL DISRUPTION PROVIDER CONDITIONS ──
  if (disruptionResults && disruptionResults.length > 0) {
    for (const dRes of disruptionResults) {
      if (dRes.status === "operational" && dRes.data?.alerts && dRes.data.alerts.length > 0) {
        for (const alert of dRes.data.alerts) {
          issues.push({
            id: `issue-live-disruption-${alert.id}`,
            severity: alert.severity === "critical" ? "critical" : "warning",
            category: "route_disruption",
            titleEn: alert.titleEn,
            titleKn: alert.titleKn,
            explanationEn: alert.descriptionEn,
            explanationKn: alert.descriptionKn,
            evidence: `Official travel advisory from ${alert.officialSource}.`,
            provenance: "external_live",
            confidence: "high",
            suggestedActionEn: "Reroute transit corridor or select alternative unblocked attractions.",
            suggestedActionKn: "ಪರ್ಯಾಯ ಮಾರ್ಗವನ್ನು ಆರಿಸಿ ಅಥವಾ ಬಾಧಿತ ತಾಣವನ್ನು ಬದಲಾಯಿಸಿ.",
            actionType: "reorder_stops",
          });
        }
      } else if (dRes.status === "unavailable") {
        issues.push({
          id: "issue-disruption-feed-unavailable",
          severity: "info",
          category: "route_disruption",
          titleEn: "No State Disruption API Connected",
          titleKn: "ಸರ್ಕಾರಿ ರಸ್ತೆ ಸಂಚಾರ ಮುಕ್ತ API ಲಭ್ಯವಿಲ್ಲ",
          explanationEn: dRes.data?.disclaimerEn || "State government road closure telemetry is unavailable via open unauthenticated APIs. Zero fabricated disruption telemetry.",
          explanationKn: dRes.data?.disclaimerKn || "ರಸ್ತೆ ಮುಚ್ಚುವಿಕೆ ಕುರಿತು ಯಾವುದೇ ಮುಕ್ತ ಸರ್ಕಾರಿ API ಲಭ್ಯವಿಲ್ಲ. ಕಾಲ್ಪನಿಕ ಅಡೆತಡೆಗಳನ್ನು ಸೃಷ್ಟಿಸಲಾಗುವುದಿಲ್ಲ.",
          evidence: "Verified Karnataka infrastructure audit; no unauthenticated public REST endpoints.",
          provenance: "static_knowledge",
          confidence: "high",
          suggestedActionEn: "Confirm highway road conditions with local transport or KSTDC helpline before long-distance drives.",
          suggestedActionKn: "ದೂರ ಪ್ರಯಾಣದ ಮುನ್ನ ಸ್ಥಳೀಯ ಸಾರಿಗೆ ಅಥವಾ ಸಹಾಯವಾಣಿಯ ಮೂಲಕ ರಸ್ತೆ ಸ್ಥಿತಿಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
          actionType: "adjust_travel_pace",
        });
      }
    }
  }

  // ── 2C. EXTERNAL CONDITIONS SUPPLIED (IF ANY) ──
  if (externalConditions && externalConditions.length > 0) {
    for (const cond of externalConditions) {
      issues.push({
        id: `issue-ext-${cond.id}`,
        severity: cond.category === "route_disruption" || cond.category === "activity_unavailable" ? "critical" : "warning",
        category: cond.category,
        dayNumber: cond.affectedDayNumber,
        stopTitle: cond.affectedStopTitle,
        titleEn: cond.titleEn,
        titleKn: cond.titleKn,
        explanationEn: cond.descriptionEn,
        explanationKn: cond.descriptionKn,
        evidence: `Condition source: ${cond.provenance} (Confidence: ${cond.confidence})`,
        provenance: cond.provenance,
        confidence: cond.confidence,
        suggestedActionEn: "Replace the affected activity or detour around the disrupted corridor.",
        suggestedActionKn: "ಬಾಧಿತ ಚಟುವಟಿಕೆಯನ್ನು ಬದಲಾಯಿಸಿ ಅಥವಾ ಪರ್ಯಾಯ ಮಾರ್ಗವನ್ನು ಆರಿಸಿ.",
        actionType: cond.category === "route_disruption" ? "reorder_stops" : "replace_activity",
      });
    }
  }

  // ── 3. TRAVEL TIME & ROUTE OVERLOAD (PER DAY) ──
  const maxTransitMinutesAllowed =
    travelStyle === "relaxed" ? 120 : travelStyle === "balanced" ? 180 : 240;

  days.forEach((day) => {
    // Check route plan daily stats if present
    const routeDay = routePlan?.dailyRoutes.find((r) => r.dayNumber === day.dayNumber);
    const dayTransitMinutes = routeDay?.totalTravelTimeMinutes || 0;

    if (dayTransitMinutes > maxTransitMinutesAllowed) {
      issues.push({
        id: `issue-transit-overload-day-${day.dayNumber}`,
        severity: dayTransitMinutes > maxTransitMinutesAllowed * 1.3 ? "critical" : "warning",
        category: "schedule_overload",
        dayNumber: day.dayNumber,
        titleEn: `Day ${day.dayNumber}: Excessive Daily Transit Time (~${Math.round(dayTransitMinutes / 60)} hrs)`,
        titleKn: `ದಿನ ${day.dayNumber}: ಅತಿಯಾದ ಪ್ರಯಾಣ ಸಮಯ (~${Math.round(dayTransitMinutes / 60)} ಗಂಟೆ)`,
        explanationEn: `Estimated road transit on Day ${day.dayNumber} is ${dayTransitMinutes} minutes. Under '${travelStyle}' pace, the recommended ceiling is ${maxTransitMinutesAllowed} minutes to prevent traveller fatigue.`,
        explanationKn: `ದಿನ ${day.dayNumber} ರಲ್ಲಿ ಅಂದಾಜು ${dayTransitMinutes} ನಿಮಿಷಗಳ ಪ್ರಯಾಣವಿದೆ. ನಿಮ್ಮ '${travelStyle}' ಶೈಲಿಗೆ ಶಿಫಾರಸು ಮಾಡಲಾದ ಗರಿಷ್ಠ ಮಿತಿ ${maxTransitMinutesAllowed} ನಿಮಿಷಗಳು.`,
        evidence: `Calculated from terrain-adjusted road transit model (~${routeDay?.totalDistanceKm || 0} km).`,
        provenance: "heuristic",
        confidence: "medium",
        suggestedActionEn: "Reorder stops or drop the furthest secondary activity to save travel time.",
        suggestedActionKn: "ತಾಣಗಳ ಕ್ರಮ ಬದಲಾಯಿಸಿ ಅಥವಾ ದೂರದ ಚಟುವಟಿಕೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಿ.",
        actionType: "remove_excess_stop",
      });
    }

    // ── 4. EXCESSIVE DAILY ACTIVITY LOAD ──
    const maxStopsAllowed =
      travelStyle === "relaxed" ? 2 : travelStyle === "balanced" ? 3 : 4;

    if (day.stops.length > maxStopsAllowed) {
      issues.push({
        id: `issue-stop-overload-day-${day.dayNumber}`,
        severity: "warning",
        category: "schedule_overload",
        dayNumber: day.dayNumber,
        titleEn: `Day ${day.dayNumber}: Dense Stop Schedule (${day.stops.length} stops)`,
        titleKn: `ದಿನ ${day.dayNumber}: ಅತಿಯಾದ ತಾಣಗಳ ಸಂಖ್ಯೆ (${day.stops.length} ತಾಣಗಳು)`,
        explanationEn: `Day ${day.dayNumber} contains ${day.stops.length} activities, exceeding your '${travelStyle}' limit of ${maxStopsAllowed}. Rushed sightseeing reduces exploration quality.`,
        explanationKn: `ದಿನ ${day.dayNumber} ರಲ್ಲಿ ${day.stops.length} ತಾಣಗಳಿವೆ; '${travelStyle}' ಶೈಲಿಗೆ ${maxStopsAllowed} ತಾಣಗಳು ಸೂಕ್ತ. ಅತಿಯಾದ ಅವಸರವು ಪ್ರವಾಸದ ಆನಂದವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.`,
        evidence: `User preferred style: '${travelStyle}'. Day stops count: ${day.stops.length}.`,
        provenance: "user_provided",
        confidence: "high",
        suggestedActionEn: "Mark an afternoon stop as optional or move it to a lighter day.",
        suggestedActionKn: "ಮಧ್ಯಾಹ್ನದ ಒಂದು ಚಟುವಟಿಕೆಯನ್ನು ಐಚ್ಛಿಕಗೊಳಿಸಿ ಅಥವಾ ಮುಂದಿನ ದಿನಕ್ಕೆ ಬದಲಾಯಿಸಿ.",
        actionType: "tag_subgroup_optional",
      });
    }

    // ── 5. TIMING CONFLICTS & TEMPLE MIDDAY CLOSURES ──
    day.stops.forEach((stop, idx) => {
      const stopTitleNorm = stop.title.toLowerCase();
      const isTemple =
        stopTitleNorm.includes("temple") ||
        stopTitleNorm.includes("matha") ||
        stopTitleNorm.includes("ದೇವಾಲಯ") ||
        stopTitleNorm.includes("ಮಠ") ||
        stopTitleNorm.includes("goddess") ||
        stopTitleNorm.includes("shrine");

      if (isTemple && stop.timeOfDay === "afternoon") {
        issues.push({
          id: `issue-temple-closure-${day.dayNumber}-${idx}`,
          severity: "warning",
          category: "activity_unavailable",
          dayNumber: day.dayNumber,
          stopIndex: idx,
          stopTitle: stop.title,
          titleEn: `Afternoon Temple Sanctum Closure: ${stop.title}`,
          titleKn: `ಮಧ್ಯಾಹ್ನದ ದೇವಾಲಯ ಬಾಗಿಲು ಮುಚ್ಚುವ ಸಮಯ: ${stop.title}`,
          explanationEn: `In Karnataka, major temple sanctums close between 12:30 PM and 4:30 PM for deity seva and priest rest. Visiting in the afternoon risks finding the inner sanctum closed.`,
          explanationKn: `ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ದೇವಾಲಯಗಳಲ್ಲಿ ಮಧ್ಯಾಹ್ನ 12:30 ರಿಂದ 4:30 ರವರೆಗೆ ಗರ್ಭಗುಡಿ ದರ್ಶನ ಇರುವುದಿಲ್ಲ. ಮಧ್ಯಾಹ್ನ ಭೇಟಿ ನೀಡಿದರೆ ದರ್ಶನ ಸಿಗದಿರಬಹುದು.`,
          evidence: "Standard Karnataka Muzrai & ASI sacred shrine operational hours.",
          provenance: "static_knowledge",
          confidence: "high",
          suggestedActionEn: "Shift this temple visit to the morning (before 12:00 PM) or evening (after 4:30 PM), placing museum or garden visits at noon.",
          suggestedActionKn: "ದೇವಾಲಯದ ಭೇಟಿಯನ್ನು ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆಗೆ ಬದಲಾಯಿಸಿ, ಮಧ್ಯಾಹ್ನ ಮ್ಯೂಸಿಯಂ ಅಥವಾ ಉದ್ಯಾನವನ ವೀಕ್ಷಿಸಿ.",
          actionType: "reorder_stops",
        });
      }
    });

    // ── 6. DUPLICATE STOPS DETECTION WITHIN THE DAY ──
    const seenTitles = new Map<string, number>();
    day.stops.forEach((stop, idx) => {
      const norm = stop.title.toLowerCase().trim();
      if (seenTitles.has(norm)) {
        issues.push({
          id: `issue-duplicate-stop-${day.dayNumber}-${idx}`,
          severity: "warning",
          category: "schedule_overload",
          dayNumber: day.dayNumber,
          stopIndex: idx,
          stopTitle: stop.title,
          titleEn: `Duplicate Activity on Day ${day.dayNumber}: ${stop.title}`,
          titleKn: `ದಿನ ${day.dayNumber} ರಲ್ಲಿ ಪುನರಾವರ್ತಿತ ಚಟುವಟಿಕೆ: ${stop.title}`,
          explanationEn: `'${stop.title}' is scheduled twice on the same day. Duplicate stops unnecessarily consume sightseeing time.`,
          explanationKn: `'${stop.title}' ಒಂದೇ ದಿನದಲ್ಲಿ ಎರಡು ಬಾರಿ ನಿಗದಿಯಾಗಿದೆ. ಇದು ಅಮೂಲ್ಯ ಸಮಯವನ್ನು ವ್ಯರ್ಥ ಮಾಡುತ್ತದೆ.`,
          evidence: `Repeated stop title on Day ${day.dayNumber}.`,
          provenance: "user_provided",
          confidence: "high",
          suggestedActionEn: "Remove the duplicate stop and replace it with a nearby hidden gem or leisure break.",
          suggestedActionKn: "ಪುನರಾವರ್ತಿತ ತಾಣವನ್ನು ತೆಗೆದುಹಾಕಿ ಹತ್ತಿರದ ಅಪರೂಪದ ಸ್ಥಳ ಅಥವಾ ವಿಶ್ರಾಂತಿಯನ್ನು ಸೇರಿಸಿ.",
          actionType: "replace_activity",
        });
      } else {
        seenTitles.set(norm, idx);
      }
    });
  });

  // ── 7. GROUP ACCESSIBILITY CONFLICTS ──
  const activeAccessibility = groupState?.config?.travellers
    ? aggregateAccessibilityRequirements(groupState.config.travellers)
    : [];

  const requiresMobilityAssistance =
    activeAccessibility.includes("wheelchair") ||
    activeAccessibility.includes("step_free") ||
    activeAccessibility.includes("low_walking");

  if (requiresMobilityAssistance) {
    days.forEach((day) => {
      day.stops.forEach((stop, idx) => {
        const stopTitleNorm = stop.title.toLowerCase();
        const strenuousMatch = KNOWN_STRENUOUS_ATTRACTION_KEYWORDS.find((k) =>
          stopTitleNorm.includes(k.keyword)
        );

        if (strenuousMatch) {
          issues.push({
            id: `issue-accessibility-${day.dayNumber}-${idx}`,
            severity: "critical",
            category: "accessibility_conflict",
            dayNumber: day.dayNumber,
            stopIndex: idx,
            stopTitle: stop.title,
            titleEn: `Mobility Constraint Barrier: ${stop.title}`,
            titleKn: `ಪ್ರವೇಶ್ಯತಾ ಅಡೆತಡೆ: ${stop.title}`,
            explanationEn: `Your travel party includes members requiring step-free/wheelchair access. '${stop.title}' features ${strenuousMatch.reason.toLowerCase()}`,
            explanationKn: `ನಿಮ್ಮ ತಂಡದಲ್ಲಿ ಗಾಲಿಕುರ್ಚಿ ಅಥವಾ ಮೆಟ್ಟಿಲು-ರಹಿತ ನಡಿಗೆಯ ಅಗತ್ಯವಿರುವ ಸದಸ್ಯರಿದ್ದಾರೆ. '${stop.title}' ಕಡಿದಾದ ಮೆಟ್ಟಿಲು ಅಥವಾ ಕಲ್ಲುಬಂಡೆಗಳಿಂದ ಕೂಡಿದೆ.`,
            evidence: `Traveller profile constraints: [${activeAccessibility.join(", ")}]. Physical barrier: ${strenuousMatch.reason}`,
            provenance: "static_knowledge",
            confidence: "high",
            suggestedActionEn: "Replace with a step-free accessible viewpoint, garden, or museum in the same district.",
            suggestedActionKn: "ಇದೇ ಜಿಲ್ಲೆಯ ಮೆಟ್ಟಿಲು-ರಹಿತ ಪ್ರವೇಶವಿರುವ ಸುಲಭ ತಾಣ, ಉದ್ಯಾನವನ ಅಥವಾ ವಸ್ತುಸಂಗ್ರಹಾಲಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
            actionType: "select_accessible_alternative",
          });
        }
      });
    });
  }

  // ── 8. INDIVIDUAL & OVERALL BUDGET CEILING CONFLICTS ──
  if (budgetPlan) {
    const activeScenario = budgetPlan.scenarios[budgetPlan.activeScenario] || budgetPlan.scenarios.balanced;

    // Check individual traveller budget limits
    if (groupState?.config?.travellers) {
      for (const t of groupState.config.travellers) {
        if (typeof t.individualBudgetLimit === "number" && t.individualBudgetLimit > 0) {
          const deficit = activeScenario.perPersonCost - t.individualBudgetLimit;
          if (deficit > 0) {
            issues.push({
              id: `issue-budget-deficit-${t.id}`,
              severity: "warning",
              category: "budget_overrun",
              titleEn: `Individual Budget Ceiling Exceeded: ${t.name}`,
              titleKn: `ವೈಯಕ್ತಿಕ ಬಜೆಟ್ ಮಿತಿ ಮೀರಿದೆ: ${t.name}`,
              explanationEn: `Estimated per-person cost (₹${activeScenario.perPersonCost.toLocaleString("en-IN")}) under '${activeScenario.nameEn}' exceeds ${t.name}'s individual budget limit of ₹${t.individualBudgetLimit.toLocaleString("en-IN")} by ₹${deficit.toLocaleString("en-IN")}.`,
              explanationKn: `'${activeScenario.nameKn}' ಅಡಿಯಲ್ಲಿ ತಲಾ ವೆಚ್ಚ (₹${activeScenario.perPersonCost.toLocaleString("en-IN")}) ${t.name} ಅವರ ಬಜೆಟ್ ಮಿತಿ ₹${t.individualBudgetLimit.toLocaleString("en-IN")} ಕ್ಕಿಂತ ₹${deficit.toLocaleString("en-IN")} ಹೆಚ್ಚಾಗಿದೆ.`,
              evidence: `Traveller profile limit: ₹${t.individualBudgetLimit}. Scenario cost per person: ₹${activeScenario.perPersonCost}.`,
              provenance: "user_provided",
              confidence: "high",
              suggestedActionEn: "Switch to 'Budget Saver' scenario or substitute ticketed sights with verified free heritage viewpoints.",
              suggestedActionKn: "'ಬಜೆಟ್ ಸೇವರ್' ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಟಿಕೆಟ್ ರಹಿತ ಉಚಿತ ಪಾರಂಪರಿಕ ತಾಣಗಳನ್ನು ಸೇರಿಸಿ.",
              actionType: "switch_budget_scenario",
              metadata: { deficitAmount: deficit, travellerName: t.name },
            });
          }
        }
      }
    }

    // Check overall trip target budget
    if (budgetPlan.targetBudget && activeScenario.isOverBudget && activeScenario.remainingBudget !== null) {
      const overAmount = Math.abs(activeScenario.remainingBudget);
      issues.push({
        id: "issue-budget-overall-overrun",
        severity: "warning",
        category: "budget_overrun",
        titleEn: `Target Trip Budget Exceeded by ₹${overAmount.toLocaleString("en-IN")}`,
        titleKn: `ಗುರಿಯಿರಿಸಿದ ಒಟ್ಟು ಬಜೆಟ್ ₹${overAmount.toLocaleString("en-IN")} ರಷ್ಟು ಮೀರಿದೆ`,
        explanationEn: `The total estimated expenditure (₹${activeScenario.totalCost.toLocaleString("en-IN")}) exceeds your planned trip target of ₹${budgetPlan.targetBudget.toLocaleString("en-IN")}.`,
        explanationKn: `ಅಂದಾಜು ಒಟ್ಟು ವೆಚ್ಚ (₹${activeScenario.totalCost.toLocaleString("en-IN")}) ನಿಮ್ಮ ನಿಗದಿತ ಬಜೆಟ್ ₹${budgetPlan.targetBudget.toLocaleString("en-IN")} ಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿದೆ.`,
        evidence: `Trip target: ₹${budgetPlan.targetBudget}. Scenario total: ₹${activeScenario.totalCost}.`,
        provenance: "user_provided",
        confidence: "high",
        suggestedActionEn: "Select lower-tier accommodation or switch to 'Budget Saver' scenario to restore budget surplus.",
        suggestedActionKn: "ಬಜೆಟ್ ಸೇವರ್ ಆಯ್ಕೆಮಾಡುವ ಮೂಲಕ ವೆಚ್ಚವನ್ನು ನಿಯಂತ್ರಣಕ್ಕೆ ತನ್ನಿ.",
        actionType: "switch_budget_scenario",
      });
    }
  }

  // ── 9. SEASONAL CONSTRAINTS SUPPORTED BY STORED EVIDENCE ──
  // Extract month from departureDate if user specified, or default to current month
  let travelMonth = new Date().getMonth() + 1; // 1-12
  if (preferences.departureDate) {
    const parsedDate = new Date(preferences.departureDate);
    if (!isNaN(parsedDate.getTime())) {
      travelMonth = parsedDate.getMonth() + 1;
    }
  }

  SEASONAL_GROUNDED_CONSTRAINTS.forEach((rule, ruleIdx) => {
    if (rule.months.includes(travelMonth)) {
      days.forEach((day) => {
        day.stops.forEach((stop, stopIdx) => {
          const stopTitleNorm = stop.title.toLowerCase();
          const matchesKeyword = rule.keywords.some((k) => stopTitleNorm.includes(k));

          if (matchesKeyword) {
            issues.push({
              id: `issue-seasonal-${ruleIdx}-${day.dayNumber}-${stopIdx}`,
              severity: rule.severity,
              category: rule.category,
              dayNumber: day.dayNumber,
              stopIndex: stopIdx,
              stopTitle: stop.title,
              titleEn: `${rule.titleEn}: ${stop.title}`,
              titleKn: `${rule.titleKn}: ${stop.title}`,
              explanationEn: rule.explanationEn,
              explanationKn: rule.explanationKn,
              evidence: `Travel month: ${travelMonth}. Historical climate & seasonal hydrology in Karnataka.`,
              provenance: "static_knowledge",
              confidence: "high",
              suggestedActionEn: rule.suggestedActionEn,
              suggestedActionKn: rule.suggestedActionKn,
              actionType: "replace_activity",
            });
          }
        });
      });
    }
  });

  return issues;
}
