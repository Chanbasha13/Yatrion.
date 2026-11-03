import type {
  AssistantAction,
  AssistantContextState,
  AssistantResponse,
} from "../assistant-types";
import {
  buildUnifiedTripContext,
  type UnifiedTripIntelligenceContext,
} from "../../adaptive/unified-context";
import { getPeacefulAlternatives } from "../../discovery/discovery-engine";

interface AdaptiveCompanionParams {
  queryNorm: string;
  rawQuery: string;
  context: AssistantContextState;
  isKn: boolean;
  isHi: boolean;
  isTe: boolean;
  sourceDescription: string;
}

/**
 * Handles Part 10 Stage 5 Context-Aware Adaptive Travel Queries.
 * Follows the mandatory 5-part explainable conversational structure:
 * 1. Direct answer
 * 2. Relevant trip evidence
 * 3. Recommendation
 * 4. Important uncertainty
 * 5. Available next action
 */
export function handleAdaptiveCompanionQuery(
  params: AdaptiveCompanionParams
): AssistantResponse | null {
  const { queryNorm, context, isKn, isHi, isTe, sourceDescription } = params;

  // Retrieve or build Unified Context
  const uCtx: UnifiedTripIntelligenceContext | null =
    context.unifiedContext ||
    (context.itinerary
      ? buildUnifiedTripContext({
          itinerary: context.itinerary,
          preferences: context.plannerPrefs,
          routePlan: context.routePlan,
          budgetPlan: context.budgetPlan,
          groupState: context.groupState,
          savedGemIds: context.savedGemIds,
        })
      : null);

  const actions: AssistantAction[] = [];

  // =========================================================================
  // 1. TRIP HEALTH INTENT
  // =========================================================================
  const isHealthQuery =
    queryNorm.includes("trip health") ||
    queryNorm.includes("is my trip still looking good") ||
    queryNorm.includes("is my trip good") ||
    queryNorm.includes("trip looking good") ||
    queryNorm.includes("trip status") ||
    queryNorm.includes("health status") ||
    queryNorm.includes("ಪ್ರವಾಸದ ಸ್ಥಿತಿ") ||
    queryNorm.includes("ಪ್ರವಾಸ ಹೇಗಿದೆ") ||
    queryNorm.includes("ಯೋಜನೆ ಸರಿಯಾಗಿದೆಯೇ") ||
    queryNorm.includes("ಪ್ರವಾಸ ಆರೋಗ್ಯ") ||
    queryNorm.includes("ಆರೋಗ್ಯ ಸ್ಥಿತಿ") ||
    queryNorm.includes("यात्रा की स्थिति") ||
    queryNorm.includes("यात्रा कैसी है") ||
    queryNorm.includes("ట్రిప్ ఆరోగ్యం") ||
    queryNorm.includes("ట్రిప్ బాగుందా");

  if (isHealthQuery) {
    if (!uCtx || !context.itinerary) {
      actions.push({
        id: "act-nav-planner",
        type: "navigate_planner",
        label: isKn ? "ಪ್ರವಾಸ ಯೋಜಕಕ್ಕೆ ಹೋಗಿ" : "Open Trip Planner",
        labelKn: "ಪ್ರವಾಸ ಯೋಜಕಕ್ಕೆ ಹೋಗಿ",
      });

      return {
        text: isKn
          ? `### ಪ್ರವಾಸದ ಆರೋಗ್ಯ ಸ್ಥಿತಿ:\n1. **ನೇರ ಉತ್ತರ:** ಪ್ರಸ್ತುತ ಯಾವುದೇ ಸಕ್ರಿಯ ಪ್ರವಾಸ ವೇಳಾಪಟ್ಟಿ ಲಭ್ಯವಿಲ್ಲ.\n2. **ಸಾಕ್ಷ್ಯ:** ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಯಾವುದೇ ಯೋಜಿತ ದಿನಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ.\n3. **ಶಿಫಾರಸು:** ಮೊದಲು ಪ್ಲಾನರ್‌ನಲ್ಲಿ ಕರ್ನಾಟಕ ಪ್ರವಾಸವನ್ನು ರಚಿಸಿ.\n4. **ಅನಿಶ್ಚಿತತೆ:** ವೇಳಾಪಟ್ಟಿ ಇಲ್ಲದೆ ಆರೋಗ್ಯ ಅಥವಾ ಅಡಚಣೆಗಳನ್ನು ಅಂದಾಜಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.\n5. **ಮುಂದಿನ ಕ್ರಮ:** ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ಹೊಸ ಪ್ರವಾಸ ಯೋಜಿಸಿ.`
          : `### Trip Health Evaluation:\n1. **Direct Answer:** No active trip itinerary is currently loaded.\n2. **Relevant Trip Evidence:** Zero scheduled days found in the active workspace.\n3. **Actionable Recommendation:** Generate an itinerary in the Planner first.\n4. **Important Uncertainty:** Health status cannot be computed without scheduled stops.\n5. **Available Next Action:** Click below to open the Trip Planner.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    const { health, recommendations } = uCtx.adaptive;
    actions.push({
      id: "act-view-adaptive",
      type: "view_adaptive_dashboard",
      label: isKn ? "ಹೊಂದಾಣಿಕೆಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ವೀಕ್ಷಿಸಿ" : "View Adaptive Dashboard",
      labelKn: "ಹೊಂದಾಣಿಕೆಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ವೀಕ್ಷಿಸಿ",
    });

    if (isKn) {
      return {
        text: `### ಪ್ರವಾಸ ಆರೋಗ್ಯ ಮೌಲ್ಯಮಾಪನ (ಭಾಗ 10 ಹಂತ 5):
1. **ನೇರ ಉತ್ತರ:** ${health.status === "critical_action_required" ? "**ತುರ್ತು ಗಮನ ಅಗತ್ಯವಿದೆ.** ನಿಮ್ಮ ವೇಳಾಪಟ್ಟಿಯಲ್ಲಿ ಪ್ರಮುಖ ಸಮಸ್ಯೆಗಳಿವೆ." : health.status === "attention_needed" ? "**ಗಮನ ಮತ್ತು ಸಲಹೆಗಳು ಸಕ್ರಿಯವಾಗಿವೆ.** ನಿಮ್ಮ ಪ್ರವಾಸ ಸರಿಯಾದ ಹಾದಿಯಲ್ಲಿದೆ, ಆದರೆ ಸುಧಾರಣೆಗಳು ಲಭ್ಯವಿವೆ." : "**ಯೋಜನೆ ಅತ್ಯುತ್ತಮವಾಗಿದೆ ಮತ್ತು ಸುಗಮವಾಗಿದೆ!** ಯಾವುದೇ ಗಂಭೀರ ಸಂಚಾರ ಅಥವಾ ಹವಾಮಾನ ತೊಂದರೆಗಳಿಲ್ಲ."}
2. **ಪ್ರವಾಸದ ಸಾಕ್ಷ್ಯ:** ಒಟ್ಟು **${health.totalIssues}** ಸಮಸ್ಯೆಗಳು/ಸಲಹೆಗಳು (${health.criticalCount} ಗಂಭೀರ, ${health.warningCount} ಎಚ್ಚರಿಕೆ, ${health.infoCount} ಮಾಹಿತಿ). ಬಾಧಿತ ದಿನಗಳು: ${health.affectedDayNumbers.length > 0 ? health.affectedDayNumbers.map((d) => `ದಿನ ${d}`).join(", ") : "ಯಾವುದೂ ಇಲ್ಲ"}.
3. **ಕ್ರಿಯಾಯೋಜನೆ / ಶಿಫಾರಸು:** ${recommendations.length > 0 ? `ದಿನ ${recommendations[0].targetDayNumber} ಕ್ಕೆ ಶಿಫಾರಸು: **${recommendations[0].titleKn}** (ಸಮಯ ವ್ಯತ್ಯಾಸ: ${recommendations[0].timeImpactMinutes} ನಿಮಿಷಗಳು).` : "ಹಾಲಿ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಬದಲಾಯಿಸುವ ಅಗತ್ಯವಿಲ್ಲ."}
4. **ಪ್ರಮುಖ ಅನಿಶ್ಚಿತತೆ:** ಈ ಮೌಲ್ಯಮಾಪನವು ಲಭ್ಯವಿರುವ ಪ್ರವಾಸ ನಿಯತಾಂಕಗಳನ್ನು ಆಧರಿಸಿದೆ; ಸ್ಥಳೀಯ ಹವಾಮಾನ ಅಥವಾ ರಸ್ತೆ ಸ್ಥಿತಿಗಳು ನೈಜ ಸಮಯದಲ್ಲಿ ಬದಲಾಗಬಹುದು.
5. **ಮುಂದಿನ ಲಭ್ಯವಿರುವ ಕ್ರಮ:** ಸಂಪೂರ್ಣ ವಿವರ ಮತ್ತು ಶಿಫಾರಸುಗಳಿಗಾಗಿ ಹೊಂದಾಣಿಕೆಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    if (isHi) {
      return {
        text: `### यात्रा स्वास्थ्य मूल्यांकन (भाग 10):
1. **प्रत्यक्ष उत्तर:** ${health.status === "critical_action_required" ? "**तत्काल ध्यान आवश्यक है।** यात्रा में महत्वपूर्ण बाधाएं पाई गई हैं।" : health.status === "attention_needed" ? "**सलाह सक्रिय है।** योजना अच्छी है, सुधार के सुझाव उपलब्ध हैं।" : "**यात्रा योजना उत्कृष्ट और सुगम है!** कोई गंभीर समस्या नहीं है।"}
2. **यात्रा साक्ष्य:** कुल **${health.totalIssues}** मामले (${health.criticalCount} गंभीर, ${health.warningCount} चेतावनी, ${health.infoCount} सुझाव)।
3. **सिफारिश:** ${recommendations.length > 0 ? `दिन ${recommendations[0].targetDayNumber} के लिए: **${recommendations[0].titleEn}**।` : "वर्तमान कार्यक्रम को बदलने की आवश्यकता नहीं है।"}
4. **अनिश्चितता:** यह मूल्यांकन वर्तमान योजना पर आधारित है; मौसम और सड़क की स्थिति बदल सकती है।
5. **उपलब्ध कार्रवाई:** संपूर्ण विवरण के लिए एडेप्टिव डैशबोर्ड खोलें।`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    if (isTe) {
      return {
        text: `### ప్రయాణ ఆరోగ్య మూల్యాంకనం (పార్ట్ 10):
1. **ప్రత్యక్ష సమాధానం:** ${health.status === "critical_action_required" ? "**అత్యవసర శ్రద్ధ అవసరం.** ప్రణాళికలో ముఖ్యమైన సమస్యలు ఉన్నాయి." : health.status === "attention_needed" ? "**సలహాలు అందుబాటులో ఉన్నాయి.** ప్రయాణం సవ్యంగా సాగుతోంది." : "**ప్రణాళిక చాలా బాగుంది!** ఎటువంటి తీవ్ర సమస్యలు లేవు."}
2. **ప్రయాణ సాక్ష్యం:** మొత్తం **${health.totalIssues}** అంశాలు (${health.criticalCount} తీవ్రమైనవి, ${health.warningCount} హెచ్చరికలు, ${health.infoCount} సూచనలు).
3. **సిఫార్సు:** ${recommendations.length > 0 ? `రోజు ${recommendations[0].targetDayNumber} కొరకు: **${recommendations[0].titleEn}**।` : "ప్రస్తుత షెడ్యూల్ మార్చాల్సిన అవసరం లేదు."}
4. **అనిశ్చితి:** ఇది ప్రస్తుత అంచనా ఆధారితం; స్థానిక వాతావరణం మారవచ్చు.
5. **తదుపరి చర్య:** పూర్తి వివరాల కోసం అడాప్టివ్ డ్యాష్‌బోర్డ్ తెరవండి.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Trip Health Evaluation (Part 10 Stage 5):
1. **Direct Answer:** ${health.status === "critical_action_required" ? "**Critical Attention Required.** Your itinerary has constraint conflicts that warrant immediate replanning." : health.status === "attention_needed" ? "**Advisories Active.** Your trip is feasible, but timing or transit optimizations are available." : "**Optimal & Smooth.** No critical schedule, pacing, or seasonal conflicts detected."}
2. **Relevant Trip Evidence:** Total **${health.totalIssues}** issue(s) detected (${health.criticalCount} Critical, ${health.warningCount} Warning, ${health.infoCount} Info). Affected day(s): ${health.affectedDayNumbers.length > 0 ? health.affectedDayNumbers.map((d) => `Day ${d}`).join(", ") : "None"}.
3. **Actionable Recommendation:** ${recommendations.length > 0 ? `For Day ${recommendations[0].targetDayNumber}: **${recommendations[0].titleEn}** (Δ${recommendations[0].timeImpactMinutes}m transit, Δ₹${recommendations[0].costImpactInr}).` : "Keep your current well-balanced schedule."}
4. **Important Uncertainty:** This evaluation is deterministic based on current schedule inputs; natural meteorological and transit variance can occur.
5. **Available Next Action:** Review the full breakdown on the Adaptive Intelligence Dashboard below.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // =========================================================================
  // 2. WEATHER & RAIN IMPACT INTENT
  // =========================================================================
  const isWeatherQuery =
    queryNorm.includes("rain affect") ||
    queryNorm.includes("will rain affect") ||
    queryNorm.includes("rain tomorrow") ||
    queryNorm.includes("rain") ||
    queryNorm.includes("weather") ||
    queryNorm.includes("weather change") ||
    queryNorm.includes("forecast") ||
    queryNorm.includes("precipitation") ||
    queryNorm.includes("ನಾಳೆ ಮಳೆಯಾಗುವುದೇ") ||
    queryNorm.includes("ಮಳೆ") ||
    queryNorm.includes("ಹವಾಮಾನ") ||
    queryNorm.includes("ಹವಾಮಾನ ಬದಲಾದರೆ") ||
    queryNorm.includes("ಮುನ್ಸೂಚನೆ") ||
    queryNorm.includes("बारिश") ||
    queryNorm.includes("मौसम") ||
    queryNorm.includes("వర్షం") ||
    queryNorm.includes("వాతావరణం");

  if (isWeatherQuery) {
    actions.push({
      id: "act-view-weather",
      type: "view_weather_details",
      label: isKn ? "ಹವಾಮಾನ ಮಾಹಿತಿ ವೀಕ್ಷಿಸಿ" : "View Weather Telemetry",
      labelKn: "ಹವಾಮಾನ ಮಾಹಿತಿ ವೀಕ್ಷಿಸಿ",
    });

    const weatherList = uCtx?.conditions?.weather || [];
    const forecastList = uCtx?.conditions?.forecasts || [];
    const firstWeather = weatherList[0];
    const firstForecast = forecastList[0];

    const hasRainExpected =
      (firstWeather?.precipitationMm && firstWeather.precipitationMm >= 5) ||
      (firstForecast && firstForecast.rainProbabilityPercent >= 50);

    if (isKn) {
      return {
        text: `### ಪರಿಸರ ಮತ್ತು ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ (Open-Meteo CC BY 4.0):
1. **ನೇರ ಉತ್ತರ:** ${hasRainExpected ? "**ಹೌದು, ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ.** ನಿಮ್ಮ ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಬಹುದು." : "**ಪ್ರಸ್ತುತ ಹವಾಮಾನವು ಆಹ್ಲಾದಕರವಾಗಿದೆ.** ಭಾರಿ ಮಳೆಯ ಯಾವುದೇ ತಕ್ಷಣದ ಮುನ್ಸೂಚನೆಯಿಲ್ಲ."}
2. **ಪ್ರವಾಸದ ಸಾಕ್ಷ್ಯ:** ${firstWeather ? `ತಾಣ: **${firstWeather.destinationName}**, ತಾಪಮಾನ: **${firstWeather.temperatureC ?? "—"}°C** (${firstWeather.conditionKn || firstWeather.conditionEn}), ಗಾಳಿ: **${firstWeather.windSpeedKmh ?? "—"} km/h**, ಮಳೆ: **${firstWeather.precipitationMm ?? 0} mm** [ಸ್ಥಿತಿ: ${firstWeather.freshnessState}].` : "ಲೈವ್ ಹವಾಮಾನ ಮಾಹಿತಿಯು ಶೂನ್ಯ ವೆಚ್ಚದ ಸಾರ್ವಜನಿಕ ಫೀಡ್‌ನಿಂದ ನವೀಕರಣಗೊಳ್ಳುತ್ತಿದೆ."} ${firstForecast ? `ಮುನ್ಸೂಚನೆ: ಮಳೆ ಸಂಭವನೀಯತೆ **${firstForecast.rainProbabilityPercent}%**.` : ""}
3. **ಕ್ರಿಯಾಯೋಜನೆ / ಶಿಫಾರಸು:** ${hasRainExpected ? "ಹೊರಾಂಗಣ ಚಾರಣ ಅಥವಾ ಜಲಪಾತದ ಬದಲು ಒಳಾಂಗಣ ಐತಿಹಾಸಿಕ ಅರಮನೆ ಅಥವಾ ಮ್ಯೂಸಿಯಂ ಪರ್ಯಾಯಗಳನ್ನು ಪರಿಶೀಲಿಸಿ." : "ಬೆಳಗಿನ ಹೊತ್ತು ಹೊರಾಂಗಣ ದೃಶ್ಯವೀಕ್ಷಣೆಯನ್ನು ಮುಂದುವರಿಸಿ; ಮಧ್ಯಾಹ್ನ ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ."}
4. **ಪ್ರಮುಖ ಅನಿಶ್ಚಿತತೆ:** **ಇದು ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯಾಗಿದ್ದು, ದೃಢಪಟ್ಟ ನೇರ ಮಳೆ ವೀಕ್ಷಣೆಯಲ್ಲ.** ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಮೈಕ್ರೋ-ಕ್ಲೈಮೇಟ್‌ನಲ್ಲಿ ನೈಸರ್ಗಿಕ ವ್ಯತ್ಯಾಸಗಳು ಸಹಜ.
5. **ಮುಂದಿನ ಲಭ್ಯವಿರುವ ಕ್ರಮ:** 3-ದಿನಗಳ ವಿಸ್ತೃತ ಮುನ್ಸೂಚನೆಯನ್ನು ನೋಡಲು ಕೆಳಗಿನ ಬಟನ್ ಬಳಸಿ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    if (isHi) {
      return {
        text: `### वायुमंडलीय एवं मौसम पूर्वानुमान (Open-Meteo):
1. **प्रत्यक्ष उत्तर:** ${hasRainExpected ? "**हां, बारिश की संभावना है।** बाहरी गतिविधियों पर असर पड़ सकता है।" : "**मौसम अनुकूल है।** भारी बारिश का कोई तत्काल अलर्ट नहीं है।"}
2. **यात्रा साक्ष्य:** ${firstWeather ? `स्थान: **${firstWeather.destinationName}**, तापमान: **${firstWeather.temperatureC ?? "—"}°C** (${firstWeather.conditionEn}), वर्षा: **${firstWeather.precipitationMm ?? 0} mm**।` : "मौसम डेटा अपडेट हो रहा है।"}
3. **सिफारिश:** ${hasRainExpected ? "बारिश होने पर इनडोर संग्रहालय या हेरिटेज पैलेस विकल्पों पर विचार करें।" : "अपनी योजना के अनुसार बाहरी स्थलों का भ्रमण जारी रखें।"}
4. **अनिश्चितता:** **यह एक सांख्यिकीय पूर्वानुमान है, पुष्टि की गई लाइव बारिश नहीं।** पश्चिमी घाट में मौसम तेजी से बदल सकता है।
5. **कार्रवाई:** विस्तृत 3-दिवसीय पूर्वानुमान देखने के लिए नीचे क्लिक करें।`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Atmospheric & Weather Intelligence (Open-Meteo CC BY 4.0):
1. **Direct Answer:** ${hasRainExpected ? "**Rain is likely to affect activities.** Outdoor visits may experience wet conditions." : "**Current conditions look clear and viable.** No severe rain hazard is currently anticipated for your itinerary."}
2. **Relevant Trip Evidence:** ${firstWeather ? `Destination: **${firstWeather.destinationName}**, Temperature: **${firstWeather.temperatureC ?? "—"}°C** (${firstWeather.conditionEn || "Fair"}), Wind: **${firstWeather.windSpeedKmh ?? "—"} km/h**, Rain: **${firstWeather.precipitationMm ?? 0} mm** [Telemetry: ${firstWeather.freshnessState}].` : "Telemetry is synced via keyless public feeds."} ${firstForecast ? `3-Day Outlook: **${firstForecast.rainProbabilityPercent}%** precipitation probability (${firstForecast.tempMinC}°–${firstForecast.tempMaxC}°C).` : ""}
3. **Actionable Recommendation:** ${hasRainExpected ? "Consider shifting outdoor waterfall/trekking stops to sheltered indoor heritage monuments or museums." : "Proceed with your scheduled activities; carry sun protection during midday."}
4. **Important Uncertainty:** **This is a probabilistic meteorological forecast, not a sensor confirmation.** Western Ghats and Coastal Karnataka experience natural local microclimate variance.
5. **Available Next Action:** Click below to view live weather and multi-day telemetry in the Adaptive Dashboard.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // =========================================================================
  // 3. ROUTE CHANGES & TRANSIT TIME REDUCTION
  // =========================================================================
  const isRouteChangeQuery =
    (queryNorm.includes("reduce") && (queryNorm.includes("travel") || queryNorm.includes("transit"))) ||
    queryNorm.includes("reduce today's travel") ||
    queryNorm.includes("cut travel time") ||
    queryNorm.includes("explain route changes") ||
    queryNorm.includes("why route changed") ||
    queryNorm.includes("route changes") ||
    queryNorm.includes("explain the route changes") ||
    queryNorm.includes("ಪ್ರಯಾಣ ಸಮಯ ಕಡಿಮೆ") ||
    queryNorm.includes("ಪ್ರಯಾಣದ ಸಮಯ ಕಡಿಮೆ") ||
    queryNorm.includes("ಮಾರ್ಗದ ಬದಲಾವಣೆ") ||
    queryNorm.includes("ರಸ್ತೆ ಬದಲಾವಣೆ") ||
    queryNorm.includes("यात्रा का समय कम") ||
    queryNorm.includes("मार्ग परिवर्तन") ||
    queryNorm.includes("ప్రయాణ సమయం తగ్గించడం") ||
    queryNorm.includes("రూట్ మార్పులు");

  if (isRouteChangeQuery) {
    actions.push({
      id: "act-review-replanning",
      type: "review_replanning_proposal",
      label: isKn ? "ಮರು-ಯೋಜನಾ ಪ್ರಸ್ತಾವನೆ ಪರಿಶೀಲಿಸಿ" : "Review Replanning Proposal",
      labelKn: "ಮರು-ಯೋಜನಾ ಪ್ರಸ್ತಾವನೆ ಪರಿಶೀಲಿಸಿ",
    });

    const route = uCtx?.route;
    const recs = uCtx?.adaptive?.recommendations || [];
    const timeSavingRec = recs.find((r) => r.timeImpactMinutes < 0);

    if (isKn) {
      return {
        text: `### ಮಾರ್ಗ ಮತ್ತು ಪ್ರಯಾಣದ ಸಮಯ ವಿಶ್ಲೇಷಣೆ (ಭಾಗ 10 ಹಂತ 5):
1. **ನೇರ ಉತ್ತರ:** ಹೌದು, ದೈನಂದಿನ ನಿಲುಗಡೆಗಳನ್ನು ಸಮೀಪದ ನೆರೆಹೊರೆಯ ಕ್ರಮದಲ್ಲಿ ಮರುಹೊಂದಿಸುವ ಮೂಲಕ ಪ್ರಯಾಣದ ಸಮಯವನ್ನು ಕಡಿಮೆ ಮಾಡಬಹುದು.
2. **ಪ್ರವಾಸದ ಸಾಕ್ಷ್ಯ:** ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಒಟ್ಟು ಮಾರ್ಗ: ~**${route?.totalDistanceKm || 0} km** ಮತ್ತು ಅಂದಾಜು ಪ್ರಯಾಣ ಸಮಯ: ~**${route?.totalTransitHours || 0} ಗಂಟೆಗಳು**. ${timeSavingRec ? `ಪ್ರಸ್ತಾವಿತ ಹೊಂದಾಣಿಕೆಯು ದಿನ ${timeSavingRec.targetDayNumber} ರಲ್ಲಿ **${Math.abs(timeSavingRec.timeImpactMinutes)} ನಿಮಿಷಗಳ** ಪ್ರಯಾಣ ಸಮಯವನ್ನು ಉಳಿಸುತ್ತದೆ.` : ""}
3. **ಕ್ರಿಯಾಯೋಜನೆ / ಶಿಫಾರಸು:** ದೇವಾಲಯಗಳ ಮಧ್ಯಾಹ್ನದ ಮುಚ್ಚುವಿಕೆ ತಪ್ಪಿಸಲು ಬೆಳಿಗ್ಗೆ ಭೇಟಿ ನೀಡುವುದು ಮತ್ತು ಒಂದೇ ಕಾರಿಡಾರ್‌ನಲ್ಲಿರುವ ತಾಣಗಳನ್ನು ಒಟ್ಟಿಗೆ ಸಂದರ್ಶಿಸುವುದು ಸೂಕ್ತ.
4. **ಪ್ರಮುಖ ಅನಿಶ್ಚಿತತೆ:** ಪ್ರಯಾಣದ ಸಮಯವು ಕರ್ನಾಟಕದ ಭೂಪ್ರದೇಶ ತಿರುವು ಗುಣಕಗಳನ್ನು (ಘಟ್ಟಕ್ಕೆ 1.48x, ಕರಾವಳಿಗೆ 1.28x) ಆಧರಿಸಿದೆ; ಅನಿರೀಕ್ಷಿತ ಟ್ರಾಫಿಕ್‌ನಿಂದ ವ್ಯತ್ಯಾಸವಾಗಬಹುದು.
5. **ಮುಂದಿನ ಲಭ್ಯವಿರುವ ಕ್ರಮ:** ಅಕ್ಕಪಕ್ಕದ ವೇಳಾಪಟ್ಟಿ ಹೋಲಿಕೆಯನ್ನು ವೀಕ್ಷಿಸಲು ಮರು-ಯೋಜನಾ ಪರಿಶೀಲನಾ ವಿಂಡೋ ತೆರೆಯಿರಿ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Route Optimization & Transit Explanation (Part 10 Stage 5):
1. **Direct Answer:** Yes, road transit time can be reduced by eliminating backtracking and reordering geographically proximate stops.
2. **Relevant Trip Evidence:** Current estimated road distance: ~**${route?.totalDistanceKm || 0} km** (~**${route?.totalTransitHours || 0} hrs** transit). ${timeSavingRec ? `The adaptive replanning engine identified a proposal that saves **${Math.abs(timeSavingRec.timeImpactMinutes)} minutes** on Day ${timeSavingRec.targetDayNumber}.` : "No excessive detour legs were identified in your current sequence."}
3. **Actionable Recommendation:** Group nearby monuments into morning clusters before midday sanctum closures and avoid night driving on ghat corridors.
4. **Important Uncertainty:** Road estimates account for realistic Karnataka terrain detour factors (1.48x Western Ghats, 1.28x Coastal NH 66) without assuming zero-traffic conditions.
5. **Available Next Action:** Click below to open the Interactive Replanning Review Modal and see the side-by-side diff.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // =========================================================================
  // 4. ACTIVITY ALTERNATIVES INTENT
  // =========================================================================
  const isAlternativeQuery =
    queryNorm.includes("suggest an alternative") ||
    queryNorm.includes("alternative to this") ||
    queryNorm.includes("activity alternative") ||
    queryNorm.includes("suggest alternative") ||
    queryNorm.includes("suggest alternatives") ||
    queryNorm.includes("different activity") ||
    queryNorm.includes("ಪರ್ಯಾಯ ಚಟುವಟಿಕೆ") ||
    queryNorm.includes("ಪರ್ಯಾಯ ತಾಣ") ||
    queryNorm.includes("ಬೇರೆ ಚಟುವಟಿಕೆ") ||
    queryNorm.includes("ವೈವಿಧ್ಯಮಯ ತಾಣ") ||
    queryNorm.includes("वैकल्पिक गतिविधि") ||
    queryNorm.includes("ప్రత్యామ్నాయం");

  if (isAlternativeQuery) {
    actions.push({
      id: "act-view-gems",
      type: "view_hidden_gems",
      label: isKn ? "ಗುಪ್ತ ರತ್ನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ" : "Explore Verified Hidden Gems",
      labelKn: "ಗುಪ್ತ ರತ್ನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    });

    const peacefulAlts = getPeacefulAlternatives().slice(0, 2);

    if (isKn) {
      return {
        text: `### ಪರಿಶೀಲಿತ ಪರ್ಯಾಯ ಚಟುವಟಿಕೆಗಳು (ಭಾಗ 10 ಹಂತ 3 & 5):
1. **ನೇರ ಉತ್ತರ:** ನಿಮ್ಮ ಪ್ರವಾಸದ ಅನುಕೂಲಕ್ಕಾಗಿ ಜನದಟ್ಟಣೆ ಕಡಿಮೆ ಇರುವ ಮತ್ತು ಹವಾಮಾನಕ್ಕೆ ಹೊಂದಿಕೊಳ್ಳುವ ಪರ್ಯಾಯಗಳು ಲಭ್ಯವಿವೆ.
2. **ಪ್ರವಾಸದ ಸಾಕ್ಷ್ಯ:** ಕರ್ನಾಟಕದ 11 ತಾಣಗಳಲ್ಲಿ 40+ ಪ್ರಮಾಣೀಕೃತ ಅನುಭವಗಳಿವೆ. ಉದಾಹರಣೆಗೆ:
${peacefulAlts.map((a, i) => `   * **${i + 1}. ${a.titleKn} (${a.district}):** ${a.categoryLabelKn} (~₹${a.estimatedCostInr}, ${a.durationLabelKn}).`).join("\n")}
3. **ಕ್ರಿಯಾಯೋಜನೆ / ಶಿಫಾರಸು:** ಜನದಟ್ಟಣೆ ಅಥವಾ ಹವಾಮಾನ ತೊಂದರೆಯಿದ್ದಾಗ ಈ ಶಾಂತಿಯುತ ತಾಣಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.
4. **ಪ್ರಮುಖ ಅನಿಶ್ಚಿತತೆ:** ಪರ್ಯಾಯ ಚಟುವಟಿಕೆಗಳು ವೇಳಾಪಟ್ಟಿಯಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಬದಲಾಗುವುದಿಲ್ಲ; ನೀವು ಖಚಿತಪಡಿಸಿದ ನಂತರವೇ ಸೇರ್ಪಡೆಯಾಗುತ್ತವೆ.
5. **ಮುಂದಿನ ಲಭ್ಯವಿರುವ ಕ್ರಮ:** ಸಂಪೂರ್ಣ ಪಟ್ಟಿಯನ್ನು ನೋಡಲು 'ಗುಪ್ತ ರತ್ನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ' ಬಟನ್ ಒತ್ತಿರಿ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Verified Activity Alternatives (Part 10 Stage 3 & 5):
1. **Direct Answer:** Yes, verified tranquil, indoor, and low-cost alternatives are available to replace crowded or weather-affected stops.
2. **Relevant Trip Evidence:** Grounded in Yatrion's 40+ verified Karnataka offbeat experiences:
${peacefulAlts.map((a, i) => `   * **${i + 1}. ${a.titleEn} (${a.district}):** ${a.categoryLabelEn} (~₹${a.estimatedCostInr}, ${a.durationLabelEn}).`).join("\n")}
3. **Actionable Recommendation:** Swap high-density tourist locations for peaceful nearby alternatives that match your travel style.
4. **Important Uncertainty:** Recommendations are advisory; your active itinerary is never altered automatically without your review.
5. **Available Next Action:** Open Hidden Gems & Discovery below to add experiences to your schedule.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // =========================================================================
  // 5. BUDGET CONSTRAINTS & SAVINGS
  // =========================================================================
  const isBudgetCheckQuery =
    (queryNorm.includes("stay within our budget") ||
      queryNorm.includes("stay within budget") ||
      queryNorm.includes("over budget") ||
      queryNorm.includes("budget limit") ||
      queryNorm.includes("save budget") ||
      queryNorm.includes("ಬಜೆಟ್ ಮಿತಿ") ||
      queryNorm.includes("ಬಜೆಟ್ ಉಳಿತಾಯ") ||
      queryNorm.includes("ಬಜೆಟ್ ಒಳಗಿರಬಹುದೇ") ||
      queryNorm.includes("बजट सीमा") ||
      queryNorm.includes("बजट में रहना") ||
      queryNorm.includes("బడ్జెట్ పరిమితి")) &&
    !queryNorm.includes("everyone");

  if (isBudgetCheckQuery) {
    actions.push({
      id: "act-view-budget",
      type: "view_budget",
      label: isKn ? "ಬಜೆಟ್ ಆಪ್ಟಿಮೈಜರ್ ವೀಕ್ಷಿಸಿ" : "View Budget Optimizer",
      labelKn: "ಬಜೆಟ್ ಆಪ್ಟಿಮೈಜರ್ ವೀಕ್ಷಿಸಿ",
    });

    const budget = uCtx?.budget;

    if (isKn) {
      return {
        text: `### ಪ್ರಯಾಣ ಬಜೆಟ್ ವಿಶ್ಲೇಷಣೆ (ಭಾಗ 10 ಹಂತ 2 & 5):
1. **ನೇರ ಉತ್ತರ:** ${budget?.isBudgetTight ? "**ಗಮನಿಸಿ: ನಿಮ್ಮ ಬಜೆಟ್ ಮಿತಿ ಬಿಗಿಯಾಗಿದೆ.** ಕೆಲವು ಹೊಂದಾಣಿಕೆಗಳಿಂದ ವೆಚ್ಚವನ್ನು ನಿಯಂತ್ರಿಸಬಹುದು." : "**ಹೌದು, ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಅಂದಾಜು ವೆಚ್ಚವು ಸಮತೋಲಿತ ಮಿತಿಯಲ್ಲಿದೆ.**"}
2. **ಪ್ರವಾಸದ ಸಾಕ್ಷ್ಯ:** ಅಂದಾಜು ಒಟ್ಟು ಮೊತ್ತ: **₹${budget?.totalCostInr.toLocaleString("en-IN") || 0}** (ತಲಾ **₹${budget?.perPersonCostInr.toLocaleString("en-IN") || 0}**, ಸನ್ನಿವೇಶ: ${budget?.selectedScenario || "ಸಮತೋಲಿತ"}).
3. **ಕ್ರಿಯಾಯೋಜನೆ / ಶಿಫಾರಸು:** ವೆಚ್ಚವನ್ನು ಮತ್ತಷ್ಟು ಕಡಿಮೆ ಮಾಡಲು 'ಬಜೆಟ್ / ಮಿತವ್ಯಯ' (Savvy) ಸನ್ನಿವೇಶವನ್ನು ಆರಿಸಿ ಅಥವಾ ಉಚಿತ ಪ್ರವೇಶವಿರುವ ಹೆರಿಟೇಜ್ ತಾಣಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.
4. **ಪ್ರಮುಖ ಅನಿಶ್ಚಿತತೆ:** ಈ ಲೆಕ್ಕಾಚಾರವು ಕರ್ನಾಟಕದ ಪ್ರಮಾಣೀಕೃತ ದರಗಳ ಯೋಜನಾ ಅಂದಾಜಾಗಿದೆ; ವೈಯಕ್ತಿಕ ಶಾಪಿಂಗ್ ಮತ್ತು ಇತರ ಖಾಸಗಿ ವೆಚ್ಚಗಳು ಇದರಲ್ಲಿ ಒಳಗೊಂಡಿಲ್ಲ.
5. **ಮುಂದಿನ ಲಭ್ಯವಿರುವ ಕ್ರಮ:** 3 ಸನ್ನಿವೇಶಗಳನ್ನು ಹೋಲಿಸಲು ಕೆಳಗಿನ ಬಜೆಟ್ ಆಪ್ಟಿಮೈಜರ್ ತೆರೆಯಿರಿ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Travel Budget Feasibility Analysis (Part 10 Stage 2 & 5):
1. **Direct Answer:** ${budget?.isBudgetTight ? "**Budget attention needed.** Your current selections are near the ceiling of your chosen tier." : "**Yes, your trip is well within projected budget parameters.**"}
2. **Relevant Trip Evidence:** Total estimated expenditure: **₹${budget?.totalCostInr.toLocaleString("en-IN") || 0}** (~**₹${budget?.perPersonCostInr.toLocaleString("en-IN") || 0}** per person, **${budget?.selectedScenario || "balanced"}** scenario).
3. **Actionable Recommendation:** Switch to the "Budget / Savvy" scenario or accept cost-saving adaptive recommendations to preserve contingency funds.
4. **Important Uncertainty:** Figures reflect grounded regional planning estimates for transit, accommodation, food, and admissions; discretionary personal shopping is excluded.
5. **Available Next Action:** Click below to view the 6-category itemized budget breakdown.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // =========================================================================
  // 6. GROUP CONSENSUS & ACCESSIBILITY
  // =========================================================================
  const isGroupSuitabilityQuery =
    queryNorm.includes("suitable for everyone") ||
    queryNorm.includes("suitable for all") ||
    queryNorm.includes("wheelchair") ||
    queryNorm.includes("accessible for everyone") ||
    queryNorm.includes("senior citizen") ||
    queryNorm.includes("ಎಲ್ಲರಿಗೂ ಸೂಕ್ತ") ||
    queryNorm.includes("ವೀಲ್‌ಚೇರ್") ||
    queryNorm.includes("ಹಿರಿಯರಿಗೆ") ||
    queryNorm.includes("सभी के लिए उपयुक्त") ||
    queryNorm.includes("అందరికీ అనుకూలం");

  if (isGroupSuitabilityQuery) {
    actions.push({
      id: "act-view-group",
      type: "view_group_planner",
      label: isKn ? "ಗುಂಪು ಪ್ರವಾಸ ವೀಕ್ಷಿಸಿ" : "View Group Workspace",
      labelKn: "ಗುಂಪು ಪ್ರವಾಸ ವೀಕ್ಷಿಸಿ",
    });

    const group = uCtx?.group;

    if (isKn) {
      return {
        text: `### ಗುಂಪು ಸೌಕರ್ಯ ಮತ್ತು ಪ್ರವೇಶಾವಕಾಶ (ಭಾಗ 10 ಹಂತ 4 & 5):
1. **ನೇರ ಉತ್ತರ:** ಹೌದು, ನಿಮ್ಮ ಗುಂಪಿನ ಸದಸ್ಯರ ವೈವಿಧ್ಯಮಯ ವೇಗ ಮತ್ತು ಪ್ರವೇಶಾವಕಾಶ ಅಗತ್ಯಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ಚಟುವಟಿಕೆಗಳನ್ನು ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ.
2. **ಪ್ರವಾಸದ ಸಾಕ್ಷ್ಯ:** ಗುಂಪು: **${group?.groupName || "ಕರ್ನಾಟಕ ಯಾತ್ರಿಕರು"}** (${group?.memberCount || 3} ಸದಸ್ಯರು). ${group?.hasAccessibilityNeeds ? `ಪ್ರವೇಶಾವಕಾಶ ಅಗತ್ಯಗಳು: **${group.accessibilitySummary.join(", ")}**.` : "ಯಾವುದೇ ಕಡ್ಡಾಯ ವೀಲ್‌ಚೇರ್ ನಿರ್ಬಂಧಗಳಿಲ್ಲ."}
3. **ಕ್ರಿಯಾಯೋಜನೆ / ಶಿಫಾರಸು:** ಹಿರಿಯರು ಅಥವಾ ಕಡಿಮೆ ನಡಿಗೆ ಇಷ್ಟಪಡುವವರಿಗೆ ಮೈಸೂರು ಅರಮನೆ ಗ್ರೌಂಡ್ ಫ್ಲೋರ್ ಬ್ಯಾಟರಿ ಬಗ್ಗಿ ಅಥವಾ ಹಂಪಿ ವಿಠ್ಠಲ ದೇವಸ್ಥಾನದ ಎಲೆಕ್ಟ್ರಿಕ್ ವಾಹನ ಸೌಲಭ್ಯವನ್ನು ಬಳಸಿ.
4. **ಪ್ರಮುಖ ಅನಿಶ್ಚಿತತೆ:** ಪ್ರಾಚೀನ ಸ್ಮಾರಕಗಳು ಮತ್ತು ಹೆರಿಟೇಜ್ ತಾಣಗಳಲ್ಲಿ ಪುರಾತನ ಕಲ್ಲಿನ ಮೆಟ್ಟಿಲುಗಳಿರಬಹುದು; ಸ್ಥಳೀಯ ಪ್ರವೇಶ ದ್ವಾರದಲ್ಲಿ ರ‍್ಯಾಂಪ್ ಲಭ್ಯತೆಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.
5. **ಮುಂದಿನ ಲಭ್ಯವಿರುವ ಕ್ರಮ:** ಗುಂಪು ನಿರ್ಧಾರಗಳು ಮತ್ತು ಚಟುವಟಿಕೆ ಮತದಾನವನ್ನು ವೀಕ್ಷಿಸಲು ಕೆಳಗೆ ಕ್ಲಿಕ್ ಮಾಡಿ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Group Consensus & Accessibility Analysis (Part 10 Stage 4 & 5):
1. **Direct Answer:** Activities are filtered to accommodate group mobility constraints and pace preferences.
2. **Relevant Trip Evidence:** Group: **${group?.groupName || "Karnataka Explorers"}** (${group?.memberCount || 3} travellers). ${group?.hasAccessibilityNeeds ? `Accessibility requirements flagged: **${group.accessibilitySummary.join(", ")}**.` : "No mandatory mobility constraints active."}
3. **Actionable Recommendation:** Use battery-operated electric buggies at Hampi Vitthala and Mysore Palace; tag strenuous hill climbs as optional subgroup activities.
4. **Important Uncertainty:** Ancient heritage sites have uneven stone thresholds; local entry points should always be confirmed for step-free access.
5. **Available Next Action:** Open the Group Trip Workspace to view collaborative consensus.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // =========================================================================
  // 7. RECOMMENDATION EXPLANATION
  // =========================================================================
  const isWhyRecommendationQuery =
    queryNorm.includes("why is this recommendation") ||
    queryNorm.includes("why recommendation") ||
    queryNorm.includes("why change") ||
    queryNorm.includes("why this change") ||
    queryNorm.includes("explain recommendation") ||
    queryNorm.includes("ಏಕೆ ಈ ಶಿಫಾರಸು") ||
    queryNorm.includes("ಏಕೆ ಬದಲಾಯಿಸಬೇಕು") ||
    queryNorm.includes("ಶಿಫಾರಸು ವಿವರಣೆ") ||
    queryNorm.includes("यह सिफारिश क्यों") ||
    queryNorm.includes("ఈ సిఫార్సు ఎందుకు");

  if (isWhyRecommendationQuery) {
    actions.push({
      id: "act-review-replanning",
      type: "review_replanning_proposal",
      label: isKn ? "ಪ್ರಸ್ತಾವನೆ ಪರಿಶೀಲಿಸಿ" : "Review Proposal Diff",
      labelKn: "ಪ್ರಸ್ತಾವನೆ ಪರಿಶೀಲಿಸಿ",
    });

    const recs = uCtx?.adaptive?.recommendations || [];
    const firstRec = recs[0];

    if (isKn) {
      return {
        text: `### ಹೊಂದಾಣಿಕೆಯ ಶಿಫಾರಸಿನ ವಿವರಣೆ (ಭಾಗ 10 ಹಂತ 5):
1. **ನೇರ ಉತ್ತರ:** ಈ ಶಿಫಾರಸು ನಿಮ್ಮ ಪ್ರವಾಸವನ್ನು ಸುಗಮಗೊಳಿಸಲು ಮತ್ತು ಕರ್ನಾಟಕದ ನೈಜ ಪ್ರಯಾಣ ನಿರ್ಬಂಧಗಳನ್ನು ಪೂರೈಸಲು ರಚಿಸಲ್ಪಟ್ಟಿದೆ.
2. **ಪ್ರವಾಸದ ಸಾಕ್ಷ್ಯ:** ${firstRec ? `ದಿನ ${firstRec.targetDayNumber} ರ ಶಿಫಾರಸು: **${firstRec.titleKn}**. ಕಾರಣ: **${firstRec.whyChangedKn}**.` : "ಪ್ರಸ್ತುತ ಯಾವುದೇ ಸಕ್ರಿಯ ಶಿಫಾರಸು ಬಾಕಿಯಿಲ್ಲ."}
3. **ಕ್ರಿಯಾಯೋಜನೆ / ಶಿಫಾರಸು:** ಈ ಬದಲಾವಣೆಯನ್ನು ಅಳವಡಿಸಿದರೆ ಪ್ರಯಾಣದ ಸಮಯ ಮತ್ತು ಬಜೆಟ್ ಉಳಿತಾಯವಾಗುತ್ತದೆ. ನೀವು ಇದನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಬಹುದು ಅಥವಾ ತಿರಸ್ಕರಿಸಬಹುದು.
4. **ಪ್ರಮುಖ ಅನಿಶ್ಚಿತತೆ:** ನಿಮ್ಮ ಒಪ್ಪಿಗೆಯಿಲ್ಲದೆ ಯಾವುದೇ ಬದಲಾವಣೆ ಜಾರಿಯಾಗುವುದಿಲ್ಲ; ನಿಮ್ಮ ಟಿಪ್ಪಣಿಗಳು ಮತ್ತು ಪೂರ್ಣಗೊಂಡ ಗುರುತುಗಳು 100% ಸಂರಕ್ಷಿತವಾಗಿರುತ್ತವೆ.
5. **ಮುಂದಿನ ಲಭ್ಯವಿರುವ ಕ್ರಮ:** ಅಕ್ಕಪಕ್ಕದಲ್ಲಿ ಬದಲಾವಣೆಗಳನ್ನು ಹೋಲಿಸಲು ಕೆಳಗಿನ ಬಟನ್ ಬಳಸಿ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Adaptive Recommendation Explanation (Part 10 Stage 5):
1. **Direct Answer:** Recommendations are triggered deterministically to resolve verified route, timing, pacing, or seasonal conflicts.
2. **Relevant Trip Evidence:** ${firstRec ? `Day ${firstRec.targetDayNumber}: **${firstRec.titleEn}**. Underlying reason: **${firstRec.whyChangedEn}** (Δ${firstRec.timeImpactMinutes}m transit, Δ₹${firstRec.costImpactInr}).` : "All itinerary constraints are currently satisfied."}
3. **Actionable Recommendation:** Accept the recommendation to optimize your transit and avoid midday sanctum closures or fatigue.
4. **Important Uncertainty:** Proposals are advisory only; zero changes take effect until you explicitly click 'Apply Proposed Plan'.
5. **Available Next Action:** Review the visual before/after diff in the Replanning Review Modal.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // =========================================================================
  // 8. REJECTION IMPACT INTENT
  // =========================================================================
  const isRejectionQuery =
    queryNorm.includes("what happens if i reject") ||
    queryNorm.includes("if i reject this change") ||
    queryNorm.includes("if i reject") ||
    queryNorm.includes("keep original plan") ||
    queryNorm.includes("reject recommendation") ||
    queryNorm.includes("what happens if i dismiss") ||
    queryNorm.includes("ತಿರಸ್ಕರಿಸಿದರೆ ಏನಾಗುತ್ತದೆ") ||
    queryNorm.includes("ಮೂಲ ಯೋಜನೆಯನ್ನೇ ಇರಿಸಿದರೆ") ||
    queryNorm.includes("ತಿರಸ್ಕರಿಸಿದರೆ ತೊಂದರೆಯೇ") ||
    queryNorm.includes("खारिज करने पर क्या होगा") ||
    queryNorm.includes("తిరస్కరిస్తే ఏమవుతుంది");

  if (isRejectionQuery) {
    actions.push({
      id: "act-view-adaptive",
      type: "view_adaptive_dashboard",
      label: isKn ? "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ" : "Back to Adaptive Dashboard",
      labelKn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    });

    if (isKn) {
      return {
        text: `### ಶಿಫಾರಸು ತಿರಸ್ಕರಿಸುವಿಕೆಯ ಪರಿಣಾಮ (ಶೂನ್ಯ ತಿದ್ದಿಬರೆಯುವಿಕೆ ಖಾತರಿ):
1. **ನೇರ ಉತ್ತರ:** **ಯಾವುದೇ ತೊಂದರೆಯಿಲ್ಲ.** ನಿಮ್ಮ ಪ್ರವಾಸದ ಮೇಲೆ ನಿಮಗೆ ಸಂಪೂರ್ಣ ನಿಯಂತ್ರಣವಿದೆ; ಶಿಫಾರಸನ್ನು ತಿರಸ್ಕರಿಸಿದರೆ ನಿಮ್ಮ ಮೂಲ ವೇಳಾಪಟ್ಟಿ 100% ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ.
2. **ಪ್ರವಾಸದ ಸಾಕ್ಷ್ಯ:** ತಿರಸ್ಕರಿಸಿದ ಶಿಫಾರಸುಗಳನ್ನು 'Dismissed' ಎಂದು ಗುರುತಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಅವು ನಿಮ್ಮ ದಿನಚರಿಯನ್ನು ಬದಲಾಯಿಸುವುದಿಲ್ಲ.
3. **ಕ್ರಿಯಾಯೋಜನೆ / ಶಿಫಾರಸು:** ನೀವು ಮೂಲ ಯೋಜನೆಯನ್ನೇ ಮುಂದುವರಿಸಬಹುದು; ಕೇವಲ ಗುರುತಿಸಲಾದ ಸಲಹೆಯನ್ನು (ಉದಾ: ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಲು ಅಥವಾ ದಟ್ಟಣೆ) ನೆನಪಿನಲ್ಲಿಡಿ.
4. **ಪ್ರಮುಖ ಅನಿಶ್ಚಿತತೆ:** ನಿಮ್ಮ ದಿನದ ಟಿಪ್ಪಣಿಗಳು, ಚಟುವಟಿಕೆ ಟಿಪ್ಪಣಿಗಳು, ಪೂರ್ಣಗೊಂಡ ಗುರುತುಗಳು ಮತ್ತು ಗುಂಪು ನಿರ್ಧಾರಗಳು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಅಳಿಸಿಹೋಗುವುದಿಲ್ಲ.
5. **ಮುಂದಿನ ಲಭ್ಯವಿರುವ ಕ್ರಮ:** ಹೊಂದಾಣಿಕೆಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ನಿರ್ಧಾರವನ್ನು ಮರುಹೊಂದಿಸಬಹುದು.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Rejection Impact & Zero-Overwrite Guarantee:
1. **Direct Answer:** **Zero negative impact.** You retain 100% autonomy over your journey; rejecting a recommendation keeps your original plan strictly unaltered.
2. **Relevant Trip Evidence:** Dismissed proposals are flagged as 'Dismissed' and will not modify your schedule, transit routes, or budget calculations.
3. **Actionable Recommendation:** If you prefer your original stop sequence, keep it as-is. Simply keep the advisory in mind during travel.
4. **Important Uncertainty:** Under Yatrion's Non-Destructive Guarantee, 100% of your personal notes, completion marks, and saved gems remain intact.
5. **Available Next Action:** You can revisit or reset dismissed recommendations at any time in the Adaptive Dashboard below.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // =========================================================================
  // 9. VERIFIED TRAVEL DISRUPTIONS INTENT
  // =========================================================================
  const isDisruptionQuery =
    queryNorm.includes("verified travel disruptions") ||
    queryNorm.includes("travel disruptions") ||
    queryNorm.includes("road closures") ||
    queryNorm.includes("verified disruptions") ||
    queryNorm.includes("is road closed") ||
    queryNorm.includes("is highway closed") ||
    queryNorm.includes("disruptions") ||
    queryNorm.includes("road closed") ||
    queryNorm.includes("ಸಂಚಾರ ಅಡಚಣೆ") ||
    queryNorm.includes("ರಸ್ತೆ ಬಂದ್") ||
    queryNorm.includes("ಹೆದ್ದಾರಿ ಬಂದ್") ||
    queryNorm.includes("ಅಡೆತಡೆಗಳಿವೆಯೇ") ||
    queryNorm.includes("ಘಾಟ್ ರಸ್ತೆ") ||
    queryNorm.includes("रास्ता बंद") ||
    queryNorm.includes("सड़क बंद") ||
    queryNorm.includes("व्यवधान") ||
    queryNorm.includes("రోడ్డు మూసివేత") ||
    queryNorm.includes("ట్రాఫిక్ ఆటంకాలు");

  if (isDisruptionQuery) {
    actions.push({
      id: "act-view-weather",
      type: "view_weather_details",
      label: isKn ? "ಸಂಚಾರ ವರದಿ ವೀಕ್ಷಿಸಿ" : "View Disruption Bulletins",
      labelKn: "ಸಂಚಾರ ವರದಿ ವೀಕ್ಷಿಸಿ",
    });

    const disruptions = uCtx?.conditions?.disruptions || [];

    if (isKn) {
      return {
        text: `### ಪರಿಶೀಲಿತ ಕರ್ನಾಟಕ ಸಂಚಾರ & ರಸ್ತೆ ಅಡಚಣೆ ಮಾಹಿತಿ:
1. **ನೇರ ಉತ್ತರ:** ${disruptions.length > 0 ? `**ಗಮನಿಸಿ: ${disruptions.length} ಅಧಿಕೃತ ಸಂಚಾರ ಅಡಚಣೆ ವರದಿಯಾಗಿದೆ.**` : "**ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಮಾರ್ಗದಲ್ಲಿ ಯಾವುದೇ ಅಧಿಕೃತ ರಸ್ತೆ ಬಂದ್ ಅಥವಾ ಸಂಚಾರ ಅಡಚಣೆಗಳು ವರದಿಯಾಗಿಲ್ಲ.**"}
2. **ಪ್ರವಾಸದ ಸಾಕ್ಷ್ಯ:** ${disruptions.length > 0 ? disruptions.map((d) => `* **[${d.severity.toUpperCase()}] ${d.titleKn}**: ${d.corridorOrRoad || ""} (ಮೂಲ: ${d.officialSource}).`).join("\n") : "ಕರ್ನಾಟಕ ಲೋಕೋಪಯೋಗಿ ಇಲಾಖೆ (PWD) ಮತ್ತು ರಾಜ್ಯ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಪ್ರಾಧಿಕಾರ (KSDMA) ಗೆಜೆಟ್‌ಗಳಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ."}
3. **ಕ್ರಿಯಾಯೋಜನೆ / ಶಿಫಾರಸು:** ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ರಸ್ತೆಗಳಲ್ಲಿ (ಶಿರಾಡಿ, ಚಾರ್ಮಾಡಿ, ಸಂಪಾಜೆ) ರಾತ್ರಿ ಪ್ರಯಾಣವನ್ನು ತಪ್ಪಿಸಿ ಮತ್ತು ಹಗಲಿನ ವೇಳೆಯಲ್ಲೇ ಘಾಟ್ ದಾಟಿ.
4. **ಪ್ರಮುಖ ಅನಿಶ್ಚಿತತೆ:** **ಅಧಿಕೃತ ವರದಿ ಇಲ್ಲದಿರುವುದು ನೈಜ ಸಮಯದಲ್ಲಿ ರಸ್ತೆ ಸಂಪೂರ್ಣ ಮುಕ್ತವಾಗಿದೆ ಎಂದು ಖಾತರಿಪಡಿಸುವುದಿಲ್ಲ.** ಸ್ಥಳೀಯ ದುರಸ್ತಿಗಳು ಅಥವಾ ಮಳೆಯ ಅಡಚಣೆಗಳನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ; ಯಾವುದೇ ಕಾಲ್ಪನಿಕ ವರದಿಗಳನ್ನು ಸೃಷ್ಟಿಸಲಾಗುವುದಿಲ್ಲ.
5. **ಮುಂದಿನ ಲಭ್ಯವಿರುವ ಕ್ರಮ:** ಅಧಿಕೃತ ಬುಲೆಟಿನ್ ವಿವರಗಳಿಗಾಗಿ ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿರಿ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    if (isHi) {
      return {
        text: `### सत्यापित कर्नाटक सड़क एवं यात्रा व्यवधान (KSDMA/PWD):
1. **प्रत्यक्ष उत्तर:** ${disruptions.length > 0 ? `**सूचना: ${disruptions.length} आधिकारिक व्यवधान दर्ज किए गए हैं।**` : "**वर्तमान में आपके मार्ग पर कोई आधिकारिक सड़क बंदी या व्यवधान दर्ज नहीं है।**"}
2. **साक्ष्य:** ${disruptions.length > 0 ? disruptions.map((d) => `* **[${d.severity.toUpperCase()}] ${d.titleEn}**: स्रोत: ${d.officialSource}।`).join("\n") : "कर्नाटक लोक निर्माण विभाग (PWD) और आपदा प्रबंधन बुलेटिन द्वारा सत्यापित।"}
3. **सिफारिश:** पश्चिमी घाट के पहाड़ी मार्गों पर रात के समय यात्रा से बचें।
4. **अनिश्चितता:** **आधिकारिक बुलेटिन का अभाव वास्तविक समय में सड़क की पूर्ण सुरक्षा की गारंटी नहीं देता।** हमेशा स्थानीय स्तर पर पुष्टि करें।
5. **कार्रवाई:** विस्तृत अलर्ट देखने के लिए नीचे क्लिक करें।`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Verified Karnataka Travel Disruption Feeds (PWD / KSDMA):
1. **Direct Answer:** ${disruptions.length > 0 ? `**Notice: ${disruptions.length} verified travel disruption(s) active.**` : "**No verified road closures or route disruptions are currently reported for your route.**"}
2. **Relevant Trip Evidence:** Sourced from Karnataka Public Works Department (PWD) and Karnataka State Disaster Management Authority gazettes. ${disruptions.length > 0 ? disruptions.map((d) => `* **[${d.severity.toUpperCase()}] ${d.titleEn}** (Corridor: ${d.corridorOrRoad || "State Highway"}, Source: ${d.officialSource})`).join("\n") : "Zero active closure bulletins on file."}
3. **Actionable Recommendation:** If driving through Western Ghats passes (Shiradi, Charmadi, Sampaje Ghats), complete transit during daylight hours before 6:30 PM.
4. **Important Uncertainty:** **The absence of an official closure report does not guarantee real-time clear conditions.** Localized maintenance or weather changes may occur without immediate state gazette notification. Zero synthetic incidents are manufactured.
5. **Available Next Action:** Check the Verified Disruption Feeds in the Adaptive Dashboard below.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  return null;
}
