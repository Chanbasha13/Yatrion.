import {
  DESTINATIONS,
  type Destination,
  type ExperienceCategoryId,
} from "../destinations-data";
import type {
  AssistantAction,
  AssistantContextState,
  AssistantResponse,
} from "./assistant-types";
import {
  KARNATAKA_DYNASTIES,
  CULTURAL_TRADITIONS,
  TEMPLE_ETIQUETTE_GUIDANCE,
} from "./knowledge/heritage-culture";
import { CULINARY_ZONES } from "./knowledge/regional-food";
import {
  MULTILINGUAL_TRAVEL_PHRASES,
  MULTILINGUAL_DESTINATION_NAMES,
} from "./knowledge/travel-phrases";
import {
  PACKING_CHECKLISTS,
  SAFETY_GUIDELINES,
  EMERGENCY_GUIDANCE_TEXT,
} from "./knowledge/travel-safety";
import {
  KARNATAKA_REGIONAL_ZONES,
  LESS_CROWDED_ALTERNATIVES,
} from "./knowledge/regional-geography";
import { handleAdaptiveCompanionQuery } from "./knowledge/adaptive-companion";
import {
  getAllExperiences,
  getExperiencesNearDestination,
  getPeacefulAlternatives,
  getLowBudgetExperiences,
  filterExperiences,
} from "../discovery/discovery-engine";
import type { KarnatakaExperience } from "../discovery/discovery-types";
import {
  extractSharedInterests,
  detectInterestConflicts,
  aggregateAccessibilityRequirements,
} from "../group/group-preferences";
import { calculateGroupCompatibility } from "../group/group-compatibility";
import { analyzeGroupBudget } from "../group/group-budget";
import { calculateGroupExpenseSummary } from "../group/group-expenses";

/**
 * Normalizes input text for keyword and intent matching
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"()[\]{}]/g, " ")
    .replace(/[-–—]/g, " ");
}

/**
 * Searches for known destinations mentioned in a query across English, Kannada, Hindi, and Telugu.
 */
function findMentionedDestinations(queryNorm: string): Destination[] {
  const matches: Destination[] = [];
  for (const d of DESTINATIONS) {
    const id = d.id.toLowerCase();
    const name = d.name.toLowerCase();
    const knName = d.kannadaName.toLowerCase();
    // Handle Kannada grammatical inflection (ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು): e.g., ಮೈಸೂರು -> ಮೈಸೂರನ್ನು (stem: ಮೈಸೂರ)
    const knStem = knName.endsWith("\u0CC1") ? knName.slice(0, -1) : knName;
    const district = d.district.toLowerCase();
    const multi = MULTILINGUAL_DESTINATION_NAMES[d.id];

    if (
      queryNorm.includes(id) ||
      queryNorm.includes(name) ||
      queryNorm.includes(knName) ||
      (knStem.length >= 3 && queryNorm.includes(knStem)) ||
      (district !== "unknown" && queryNorm.includes(district)) ||
      (multi && queryNorm.includes(multi.hi.toLowerCase())) ||
      (multi && queryNorm.includes(multi.te.toLowerCase()))
    ) {
      if (!matches.some((m) => m.id === d.id)) {
        matches.push(d);
      }
    }
  }
  return matches;
}

/**
 * Grounded Karnataka Travel Knowledge Engine (Stage 3 Enhanced)
 * Integrates modular heritage, culinary, multilingual, safety, packing, and contextual travel intelligence.
 */
export function generateKnowledgeEngineResponse(
  query: string,
  context: AssistantContextState,
  requestedLanguage?: "en" | "kn" | "te" | "hi"
): AssistantResponse {
  const isKn =
    context.language === "kn" ||
    context.assistantLanguage === "kn" ||
    requestedLanguage === "kn" ||
    /[\u0C80-\u0CFF]/.test(query);
  const isTe =
    context.assistantLanguage === "te" ||
    requestedLanguage === "te" ||
    /[\u0C00-\u0C7F]/.test(query);
  const isHi =
    context.assistantLanguage === "hi" ||
    requestedLanguage === "hi" ||
    /[\u0900-\u097F]/.test(query);

  const qNorm = normalize(query);
  const mentionedDests = findMentionedDestinations(qNorm);

  const actions: AssistantAction[] = [];

  const sourceDescription = isKn
    ? "ಯಾತ್ರಿಯಾನ್ ಪರಿಶೀಲಿತ ಕರ್ನಾಟಕ ಪ್ರವಾಸ ಡೇಟಾಸೆಟ್‌ನಿಂದ ನಿರ್ಣಾಯಕವಾಗಿ ರಚಿಸಲಾಗಿದೆ."
    : isTe
    ? "యాత్రియాన్ ధృవీకరించిన కర్ణాటక ప్రయాణ డేటాసెట్ ఆధారంగా రూపొందించబడింది."
    : isHi
    ? "यात्रियान के सत्यापित कर्नाटक यात्रा डेटासेट से निर्धारित रूप से तैयार किया गया।"
    : "Generated deterministically from Yatrion's verified Karnataka travel dataset.";

  // ── 0. PART 10 STAGE 5: ADAPTIVE INTELLIGENCE & CONTEXT-AWARE COMPANION INTENTS ──
  const adaptiveResponse = handleAdaptiveCompanionQuery({
    queryNorm: qNorm,
    rawQuery: query,
    context,
    isKn,
    isHi,
    isTe,
    sourceDescription,
  });
  if (adaptiveResponse) {
    return adaptiveResponse;
  }

  // ── 1. PACKING & PREPARATION INTENT ("what should i pack", "what to wear", "clothes", "jacket") ──
  const isPacking =
    qNorm.includes("pack") ||
    qNorm.includes("wear") ||
    qNorm.includes("clothes") ||
    qNorm.includes("shoes") ||
    qNorm.includes("jacket") ||
    qNorm.includes("ಬಟ್ಟೆ") ||
    qNorm.includes("ತಯಾರಿ") ||
    qNorm.includes("సామాన్లు");

  if (isPacking) {
    const isGhats =
      mentionedDests.some((d) => d.region === "Western Ghats") ||
      qNorm.includes("coorg") ||
      qNorm.includes("chikmagalur") ||
      qNorm.includes("dandeli") ||
      context.selectedDestination?.region === "Western Ghats";

    const checklistKey = isGhats ? "western_ghats" : "heritage";
    const checklist = PACKING_CHECKLISTS[checklistKey] || PACKING_CHECKLISTS.heritage;

    if (context.selectedDestination) {
      actions.push({
        id: `plan-pack-${context.selectedDestination.id}`,
        type: "plan_destination",
        label: isKn
          ? `${context.selectedDestination.kannadaName} ಗೆ ಪ್ರವಾಸ ಯೋಜನೆ`
          : `Plan ${context.selectedDestination.name} in Planner`,
        labelKn: `${context.selectedDestination.kannadaName} ಗೆ ಪ್ರವಾಸ ಯೋಜನೆ`,
        destinationId: context.selectedDestination.id,
      });
    }

    if (isKn) {
      return {
        text: `### ಕರ್ನಾಟಕ ಪ್ರವಾಸಕ್ಕೆ ಪ್ಯಾಕಿಂಗ್ ಸಲಹೆಗಳು (${isGhats ? "ಮಲೆನಾಡು & ಪಶ್ಚಿಮ ಘಟ್ಟಗಳು" : "ಪರಂಪರೆ ಮತ್ತು ಬಯಲುಸೀಮೆ"}):

${checklist
  .map(
    (c) =>
      `* **${c.titleKn}:**\n${c.items
        .map((item) => `  * ${item.nameKn} — *${item.reason}*`)
        .join("\n")}`
  )
  .join("\n\n")}

*(ಪ್ರಮುಖ ಸಲಹೆ: ಪಶ್ಚಿಮ ಘಟ್ಟಗಳಲ್ಲಿ ಏಕ-ಬಳಕೆಯ ಪ್ಲಾಸ್ಟಿಕ್ ಬಾಟಲಿಗಳನ್ನು ಕಡ್ಡಾಯವಾಗಿ ನಿಷೇಧಿಸಲಾಗಿದೆ; ಮರುಬಳಕೆಯ ಸ್ಟೀಲ್ ಬಾಟಲ್ ಕೊಂಡೊಯ್ಯಿರಿ).*`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Packing Checklist & Travel Preparation (${isGhats ? "Western Ghats & Highland Forests" : "Heritage Plains & Stone Ruins"}):

${checklist
  .map(
    (c) =>
      `* **${c.title}:**\n${c.items
        .map((item) => `  * ${item.name} (${item.nameKn}) — *${item.reason}*`)
        .join("\n")}`
  )
  .join("\n\n")}

*(Eco-tip: Single-use plastic bottles are banned in Western Ghats forest reserves. Carry a reusable insulated water flask).*`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // ── 2. TRAVEL PHRASES & MULTILINGUAL ASSISTANCE ("how to say thank you", "useful phrases", "kannada words", "telugu") ──
  const isPhrase =
    qNorm.includes("phrase") ||
    qNorm.includes("say thank you") ||
    qNorm.includes("how to say") ||
    qNorm.includes("words") ||
    qNorm.includes("vocabulary") ||
    qNorm.includes("ಕನ್ನಡ ಪದ") ||
    qNorm.includes("ಮಾತನಾಡು") ||
    qNorm.includes("తెలుగు మాటలు") ||
    qNorm.includes("భాష") ||
    qNorm.includes("పదాలు");

  const hasTripKeywords =
    qNorm.includes("suggest") ||
    qNorm.includes("itinerary") ||
    qNorm.includes("trip") ||
    qNorm.includes("plan") ||
    qNorm.includes("day") ||
    qNorm.includes("ದಿನ") ||
    qNorm.includes("ಪ್ರವಾಸ");

  if (isPhrase || (qNorm.includes("telugu") && !hasTripKeywords && mentionedDests.length === 0)) {
    const samplePhrases = MULTILINGUAL_TRAVEL_PHRASES.slice(0, 6);

    if (isTe) {
      return {
        text: `### కర్ణాటక ప్రయాణికుల ముఖ్యమైన కన్నడ పదాలు (తెలుగు & ఇంగ్లీష్ వివరణతో):

${samplePhrases
  .map(
    (p) =>
      `* **${p.english}:**\n  * **ಕನ್ನಡ (కన్నడ):** ${p.kannada} (*${p.kannadaTransliteration}*)\n  * **తెలుగు:** ${p.telugu}\n  * *సందర్భం:* ${p.usageContext}`
  )
  .join("\n\n")}

*(గమనిక: కన్నడ మరియు తెలుగు సోదర ద్రవిడ భాషలు. 'నమస్కార', 'ధన్యవాదాలు', 'ఎక్కడికి/ఎల్లిಗೆ' వంటి పదాలు చాలా పోలి ఉంటాయి).*`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    if (isKn) {
      return {
        text: `### ಕರ್ನಾಟಕದ ಪ್ರವಾಸಿ ಉಪಯುಕ್ತ ಸಂವಹನ ಪದಗಳು:

${samplePhrases
  .map(
    (p) =>
      `* **${p.kannada} (*${p.kannadaTransliteration}*):** ${p.english}\n  * *ಹಿಂದಿ:* ${p.hindi} · *ತೆಲುಗು:* ${p.telugu}\n  * *ಬಳಕೆ:* ${p.usageContext}`
  )
  .join("\n\n")}

ಸ್ಥಳೀಯರೊಂದಿಗೆ 'ನಮಸ್ಕಾರ' ಮತ್ತು 'ಊಟ ಆಯ್ತಾ?' ಎಂದು ಸಂಭಾಷಣೆ ಆರಂಭಿಸುವುದು ಗೌರವ ಮತ್ತು ಆಪ್ತತೆಯನ್ನು ತರುತ್ತದೆ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Essential Multilingual Travel Phrases for Karnataka:

${samplePhrases
  .map(
    (p) =>
      `* **${p.english}:**\n  * **Kannada (ಕನ್ನಡ):** ${p.kannada} (*${p.kannadaTransliteration}*)\n  * **Hindi (हिन्दी):** ${p.hindi} (*${p.hindiTransliteration || p.hindi}*)\n  * **Telugu (తెలుగు):** ${p.telugu} (*${p.teluguTransliteration || p.telugu}*)\n  * *Context:* ${p.usageContext}`
  )
  .join("\n\n")}

*(Communication tip: Greeting auto drivers and shopkeepers with 'Namaskara' or asking 'Oota aayitha?' brings instant warmth and local hospitality).*`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // ── 3. TEMPLE ETIQUETTE & SACRED PROTOCOL ("temple rules", "dress code", "pradakshina") ──
  const isTempleEtiquette =
    qNorm.includes("dress code") ||
    qNorm.includes("temple rule") ||
    qNorm.includes("etiquette") ||
    qNorm.includes("pradakshina") ||
    qNorm.includes("ದೇವಸ್ಥಾನ ನಿಯಮ") ||
    qNorm.includes("ಶಿಷ್ಟಾಚಾರ");

  if (isTempleEtiquette) {
    if (isKn) {
      return {
        text: TEMPLE_ETIQUETTE_GUIDANCE.kn,
        source: "knowledge-engine",
        sourceDescription,
        actions: [
          {
            id: "etiquette-view-belur",
            type: "view_destination",
            label: "ಬೇಲೂರು ದೇವಾಲಯ ವಿವರ",
            labelKn: "ಬೇಲೂರು ದೇವಾಲಯ ವಿವರ",
            destinationId: "belur",
          },
        ],
      };
    }

    return {
      text: TEMPLE_ETIQUETTE_GUIDANCE.en,
      source: "knowledge-engine",
      sourceDescription,
      actions: [
        {
          id: "etiquette-view-belur",
          type: "view_destination",
          label: "View Belur Temple Details",
          labelKn: "ಬೇಲೂರು ದೇವಾಲಯ ವಿವರ",
          destinationId: "belur",
        },
      ],
    };
  }

  // ── 4. RESPONSIBLE TOURISM, GHAT ROADS & EMERGENCY GUIDANCE ("safe to drive", "safety", "emergency", "112") ──
  const isSafety =
    qNorm.includes("safety") ||
    qNorm.includes("safe") ||
    qNorm.includes("emergency") ||
    qNorm.includes("ghat road") ||
    qNorm.includes("landslide") ||
    qNorm.includes("driving") ||
    qNorm.includes("safari rule") ||
    qNorm.includes("ಸುರಕ್ಷತೆ") ||
    qNorm.includes("ತುರ್ತು");

  if (isSafety) {
    const safetyNote = isKn ? EMERGENCY_GUIDANCE_TEXT.kn : EMERGENCY_GUIDANCE_TEXT.en;
    const isGhatQuery = qNorm.includes("ghat") || qNorm.includes("driv") || qNorm.includes("ರಸ್ತೆ");
    const activeGuidelines = isGhatQuery
      ? SAFETY_GUIDELINES.filter((g) => g.id === "ghat_roads" || g.id === "responsible_tourism")
      : SAFETY_GUIDELINES.filter((g) => g.id === "responsible_tourism");

    if (isKn) {
      return {
        text: `${safetyNote}\n\n${activeGuidelines
          .map((sec) => `### ${sec.titleKn}:\n${sec.guidelines.map((g) => `* ${g.kn}`).join("\n")}`)
          .join("\n\n")}`,
        source: "knowledge-engine",
        sourceDescription,
        actions: [],
      };
    }

    return {
      text: `${safetyNote}\n\n${activeGuidelines
        .map((sec) => `### ${sec.title}:\n${sec.guidelines.map((g) => `* ${g.en}`).join("\n")}`)
        .join("\n\n")}`,
      source: "knowledge-engine",
      sourceDescription,
      actions: [],
    };
  }

  // ── 5. OFFBEAT & LESS CROWDED ALTERNATIVES ("less crowded", "peaceful", "crowd", "ಶಾಂತ") ──
  const isOffbeat =
    qNorm.includes("less crowded") ||
    qNorm.includes("crowd") ||
    qNorm.includes("peaceful") ||
    qNorm.includes("quiet") ||
    qNorm.includes("offbeat") ||
    qNorm.includes("ಶಾಂತ") ||
    qNorm.includes("ಜನದಟ್ಟಣೆ");

  if (isOffbeat) {
    const alternatives = LESS_CROWDED_ALTERNATIVES;
    for (const alt of alternatives) {
      actions.push({
        id: `offbeat-${alt.destinationId}`,
        type: "view_destination",
        label: isKn ? `${alt.peacefulAlternativeKn} ವೀಕ್ಷಿಸಿ` : `View ${alt.peacefulAlternative}`,
        labelKn: `${alt.peacefulAlternativeKn} ವೀಕ್ಷಿಸಿ`,
        destinationId: alt.destinationId,
      });
    }

    if (isKn) {
      return {
        text: `### ಜನದಟ್ಟಣೆ ಕಡಿಮೆ ಇರುವ ಪ್ರಶಾಂತ ಕರ್ನಾಟಕ ಪರ್ಯಾಯ ತಾಣಗಳು:

${alternatives
  .map(
    (alt) =>
      `* **ಹೆಚ್ಚು ಜನದಟ್ಟಣೆಯ ಸ್ಥಳ:** ${alt.popularPlaceKn}\n  * **ಶಾಂತಿಯುತ ಪರ್ಯಾಯ:** ${alt.peacefulAlternativeKn}\n  * *ಯಾತ್ರಿಯಾನ್ ವಿವರ:* ${alt.reasonKn}`
  )
  .join("\n\n")}

ಯಾವುದೇ ಪರ್ಯಾಯ ತಾಣದ ಪೂರ್ಣ ವೇಳಾಪಟ್ಟಿಯನ್ನು ನೋಡಲು ಕೆಳಗಿನ ಬಟನ್‌ಗಳನ್ನು ಬಳಸಿ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Less Crowded & Peaceful Karnataka Alternatives:

${alternatives
  .map(
    (alt) =>
      `* **Instead of:** ${alt.popularPlace}\n  * **Try this peaceful alternative:** ${alt.peacefulAlternative} (${alt.peacefulAlternativeKn})\n  * *Why:* ${alt.reasonEn}`
  )
  .join("\n\n")}

Click below to explore complete itineraries and tranquil accommodation options for these destinations.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // ── 5C. HIDDEN GEMS DISCOVERY & OFFBEAT EXPERIENCES (PART 10 STAGE 3) ──
  const isDestinationProximity =
    qNorm.includes("destination") &&
    (qNorm.includes("near") || qNorm.includes("around") || qNorm.includes("close"));

  const isGemsQuery =
    !isDestinationProximity &&
    (qNorm.includes("hidden") ||
      qNorm.includes("gem") ||
      qNorm.includes("gems") ||
      qNorm.includes("secret") ||
      qNorm.includes("unexplored") ||
      qNorm.includes("lesser known") ||
      qNorm.includes("less-known") ||
      qNorm.includes("peaceful alternative") ||
      qNorm.includes("peaceful alternatives") ||
      qNorm.includes("low budget nature") ||
      qNorm.includes("low-budget nature") ||
      qNorm.includes("free experience") ||
      qNorm.includes("offbeat experience") ||
      qNorm.includes("ಗುಪ್ತ") ||
      qNorm.includes("ಅಪರೂಪದ") ||
      qNorm.includes("ಅನ್ವೇಷಿಸದ") ||
      qNorm.includes("ಪ್ರಶಾಂತ ಪರ್ಯಾಯ") ||
      qNorm.includes("छिपी") ||
      qNorm.includes("शांतिपूर्ण") ||
      qNorm.includes("దాగి"));

  if (isGemsQuery) {
    let matchedGems: KarnatakaExperience[] = [];

    if (mentionedDests.length > 0) {
      const hub = mentionedDests[0];
      matchedGems = getExperiencesNearDestination(hub.id);
      if (matchedGems.length === 0) {
        matchedGems = getAllExperiences().filter(
          (e) => e.region === hub.region
        );
      }
    } else if (
      qNorm.includes("peaceful") ||
      qNorm.includes("ಪ್ರಶಾಂತ") ||
      qNorm.includes("ಶಾಂತಿ") ||
      qNorm.includes("शांतिपूर्ण")
    ) {
      matchedGems = getPeacefulAlternatives();
    } else if (
      qNorm.includes("low budget") ||
      qNorm.includes("low-budget") ||
      qNorm.includes("free") ||
      qNorm.includes("ಉಚಿತ")
    ) {
      matchedGems = getLowBudgetExperiences(100);
      if (
        qNorm.includes("nature") ||
        qNorm.includes("ಪ್ರಕೃತಿ") ||
        qNorm.includes("waterfall") ||
        qNorm.includes("ಜಲಪಾತ")
      ) {
        matchedGems = matchedGems.filter(
          (e) =>
            e.category === "nature" || e.category === "waterfalls_viewpoints"
        );
      }
    } else if (
      qNorm.includes("north") ||
      qNorm.includes("ಉತ್ತರ")
    ) {
      matchedGems = filterExperiences(getAllExperiences(), {
        region: "North Karnataka",
      });
    }

    if (matchedGems.length === 0) {
      matchedGems = getAllExperiences();
    }

    const selectedGems = matchedGems.slice(0, 4);

    actions.push({
      id: "view-all-hidden-gems",
      type: "view_hidden_gems",
      label: isKn
        ? "ಎಲ್ಲಾ ಗುಪ್ತ ರತ್ನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ"
        : "Explore All Hidden Gems in Explorer",
      labelKn: "ಎಲ್ಲಾ ಗುಪ್ತ ರತ್ನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
      payload: { sectionId: "discovery" },
    });

    if (isKn) {
      return {
        text: `### ಪರಿಶೀಲಿಸಿದ ಕರ್ನಾಟಕ ಗುಪ್ತ ರತ್ನಗಳು & ಅಪರೂಪದ ಅನುಭವಗಳು (ಭಾಗ 10 ಹಂತ 3):

${selectedGems
  .map(
    (g, idx) =>
      `**${idx + 1}. ${g.titleKn} (${g.district})**\n* **ವಿಭಾಗ:** ${g.categoryLabelKn} | **ಬಜೆಟ್:** ${g.budgetTier === "free" ? "ಉಚಿತ ಪ್ರವೇಶ (₹0)" : `~₹${g.estimatedCostInr}`}\n* **ವಿಶೇಷತೆ:** ${g.whySpecialKn}\n* **ಉತ್ತಮ ಕಾಲ & ಅವಧಿ:** ${g.seasonLabelKn} (${g.durationLabelKn})\n* **ಪರಿಶೀಲಿತ ಮೂಲ:** ${g.sourceCitationKn}\n* **ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್:** [ನಕ್ಷೆಯಲ್ಲಿ ವೀಕ್ಷಿಸಿ](${g.googleMapsSearchUrl})`
  )
  .join("\n\n")}

> **ಸೂಚನೆ:** ಜನದಟ್ಟಣೆಯ ವಿವರಣೆಯು ಐತಿಹಾಸಿಕ ಅಂದಾಜಾಗಿದ್ದು, ನೇರ ಸಂವೇದಕ ಟೆಲಿಮೆಟ್ರಿ ಅಲ್ಲ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    if (isHi) {
      return {
        text: `### सत्यापित कर्नाटक के छिपे हुए रत्न और अनोखे अनुभव (भाग 10):

${selectedGems
  .map(
    (g, idx) =>
      `**${idx + 1}. ${g.titleEn} (${g.district})**\n* **श्रेणी:** ${g.categoryLabelEn} | **बजट:** ${g.budgetTier === "free" ? "निःशुल्क (₹0)" : `~₹${g.estimatedCostInr}`}\n* **विशेषता:** ${g.whySpecialEn}\n* **सत्यापित स्रोत:** ${g.sourceCitationEn}\n* **गूगल मैप्स:** [मानचित्र पर देखें](${g.googleMapsSearchUrl})`
  )
  .join("\n\n")}

> **सूचना:** भीड़ का स्तर ऐतिहासिक गुणात्मक आधार रेखा है, कोई लाइव स्वचालित टेलीमेट्री नहीं।`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    if (isTe) {
      return {
        text: `### ధృవీకరించిన కర్ణాటక దాగి ఉన్న రత్నాలు & ప్రత్యేక అనుభవాలు (పార్ట్ 10):

${selectedGems
  .map(
    (g, idx) =>
      `**${idx + 1}. ${g.titleEn} (${g.district})**\n* **వర్గం:** ${g.categoryLabelEn} | **బడ్జెట్:** ${g.budgetTier === "free" ? "ఉచిత ప్రవేశం (₹0)" : `~₹${g.estimatedCostInr}`}\n* **ప్రత్యేకత:** ${g.whySpecialEn}\n* **ధృవీకరించిన మూలం:** ${g.sourceCitationEn}\n* **గూగుల్ మ్యాప్స్:** [మ్యాప్‌లో చూడండి](${g.googleMapsSearchUrl})`
  )
  .join("\n\n")}

> **గమనిక:** రద్దీ స్థాయిలు గుణాత్మక చారిత్రక అంచనా మాత్రమే, ప్రత్యక్ష స్వయంచాలక టెలిమెట్రీ కాదు।`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Verified Karnataka Hidden Gems & Offbeat Experiences (Part 10 Stage 3):

${selectedGems
  .map(
    (g, idx) =>
      `**${idx + 1}. ${g.titleEn} (${g.district})**\n* **Category:** ${g.categoryLabelEn} | **Budget Tier:** ${g.budgetTier === "free" ? "Free Admission (₹0)" : `~₹${g.estimatedCostInr}`}\n* **Why It's Special:** ${g.whySpecialEn}\n* **Season & Duration:** ${g.seasonLabelEn} (${g.durationLabelEn})\n* **Verified Source:** ${g.sourceCitationEn}\n* **Google Maps:** [View on Map](${g.googleMapsSearchUrl})`
  )
  .join("\n\n")}

> **Disclaimer:** Crowd levels are qualitative historical baselines, not live automated counter telemetry.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // ── 5B. SMART ROUTE OPTIMIZATION & TRAVEL FEASIBILITY ──
  const isRouteQuery =
    qNorm.includes("route") ||
    qNorm.includes("optim") ||
    qNorm.includes("distance") ||
    qNorm.includes("transit") ||
    qNorm.includes("driving") ||
    qNorm.includes("backtrack") ||
    qNorm.includes("intensity") ||
    qNorm.includes("stop order") ||
    qNorm.includes("order of visit") ||
    qNorm.includes("which stop") ||
    qNorm.includes("road trip") ||
    qNorm.includes("highway") ||
    qNorm.includes("ಮಾರ್ಗ") ||
    qNorm.includes("ದಾರಿ") ||
    qNorm.includes("ದೂರ") ||
    qNorm.includes("ರಸ್ತೆ");

  if (isRouteQuery) {
    if (context.routePlan) {
      const rp = context.routePlan;
      actions.push({
        id: "view-route-timeline",
        type: "view_route",
        label: isKn ? "ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಕಾಲಾವಧಿ ವೀಕ್ಷಿಸಿ" : "View Smart Route Timeline",
        labelKn: "ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಕಾಲಾವಧಿ ವೀಕ್ಷಿಸಿ",
        payload: { sectionId: "planner" },
      });

      if (isKn) {
        return {
          text: `### ನಿಮ್ಮ ಪ್ರವಾಸದ ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಆಪ್ಟಿಮೈಸೇಶನ್ ವಿವರಗಳು:
* **ಮಾರ್ಗ ಶೀರ್ಷಿಕೆ:** ${rp.kannadaSubtitle}
* **ಒಟ್ಟು ರಸ್ತೆ ದೂರ (ಅಂದಾಜು):** ~${rp.totalEstimatedDistanceKm} km
* **ಒಟ್ಟು ಪ್ರಯಾಣ ಸಮಯ (ಅಂದಾಜು):** ~${rp.totalEstimatedTransitHours} ಗಂಟೆಗಳು
* **ಪ್ರಯಾಣದ ತೀವ್ರತೆ:** ${rp.intensity === "relaxed" ? "ಆರಾಮದಾಯಕ" : rp.intensity === "packed" ? "ವೇಗದ ಗತಿಯ" : "ಸಮತೋಲಿತ"} (${rp.intensityReasonKn})
* **ಯೋಜಿತ ತಾಣಗಳು:** ${rp.totalStopsCount} ನಿಲುಗಡೆಗಳು (${rp.dailyRoutes.length} ದಿನಗಳಲ್ಲಿ)

**ಯಾತ್ರಿಯಾನ್ ಮಾರ್ಗ ತಂತ್ರಜ್ಞಾನ:**
* **ಹಿಂತಿರುಗುವಿಕೆ ತಪ್ಪಿಸುವಿಕೆ:** ಆಯಾ ದಿನದ ತಾಣಗಳನ್ನು ಹತ್ತಿರದ ನೆರೆಹೊರೆಯ ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸಲಾಗಿದೆ.
* **ಭೂಪ್ರದೇಶ ಗುಣಕಗಳು:** ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ತಿರುವು ರಸ್ತೆಗಳಿಗೆ 1.48x, ಕರಾವಳಿ ಹೆದ್ದಾರಿಗೆ 1.28x ಮತ್ತು ಮೈದಾನಕ್ಕೆ 1.22x ನೈಜ ಗುಣಕಗಳನ್ನು ಅನ್ವಯಿಸಲಾಗಿದೆ.
* **ದೇವಾಲಯಗಳ ಸಮಯ:** ಮಧ್ಯಾಹ್ನ 12:30 ರಿಂದ 4:30 ರವರೆಗಿನ ಗರ್ಭಗುಡಿ ಮುಚ್ಚುವ ಸಮಯವನ್ನು ಪರಿಗಣಿಸಿ ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ಭೇಟಿಗೆ ಹೊಂದಿಸಲಾಗಿದೆ.`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }

      return {
        text: `### Your Trip's Smart Route Optimization & Transit Details:
* **Optimized Trail:** ${rp.title}
* **Total Estimated Road Distance:** ~${rp.totalEstimatedDistanceKm} km
* **Total Estimated Transit Time:** ~${rp.totalEstimatedTransitHours} hours
* **Travel Intensity Rating:** ${rp.intensity.toUpperCase()} (${rp.intensityReasonEn})
* **Curated Stops:** ${rp.totalStopsCount} stops across ${rp.dailyRoutes.length} days

**Yatrion Route Intelligence:**
* **Backtracking Minimization:** Daily attractions are clustered and sequenced using nearest-neighbor routing.
* **Calibrated Terrain Detour Multipliers:** Western Ghats hairpins (1.48x), Coastal NH 66 (1.28x), and Deccan Plains (1.22x) provide realistic travel estimates instead of straight-line distances.
* **Temple Sanctum Windows:** Sacred sanctum afternoon closures (12:30 PM – 4:30 PM) are respected with morning/evening sequencing.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    // Generic route guidance
    actions.push({
      id: "nav-planner-route",
      type: "navigate_planner",
      label: isKn ? "ಸ್ಮಾರ್ಟ್ ಪ್ಲಾನರ್‌ಗೆ ಹೋಗಿ" : "Open Smart Trip Planner",
      labelKn: "ಸ್ಮಾರ್ಟ್ ಪ್ಲಾನರ್‌ಗೆ ಹೋಗಿ",
      payload: { sectionId: "planner" },
    });

    if (isKn) {
      return {
        text: `### ಯಾತ್ರಿಯಾನ್ ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಆಪ್ಟಿಮೈಸೇಶನ್ (ಭಾಗ 10):
ಕರ್ನಾಟಕದ ವಿಭಿನ್ನ ಭೌಗೋಳಿಕತೆಯಲ್ಲಿ ಸುಗಮ ಪ್ರವಾಸಕ್ಕಾಗಿ ಯಾತ್ರಿಯಾನ್ ಈ ಕೆಳಗಿನ ತತ್ವಗಳನ್ನು ಬಳಸುತ್ತದೆ:

1. **ಆರಂಭಿಕ ಕೇಂದ್ರದಿಂದ ಆಪ್ಟಿಮೈಸೇಶನ್:** ಬೆಂಗಳೂರು, ಮೈಸೂರು, ಹುಬ್ಬಳ್ಳಿ ಅಥವಾ ಮಂಗಳೂರಿನಿಂದ ಹೊರಟು ನಿಲುಗಡೆಗಳನ್ನು ಕನಿಷ್ಠ ಪ್ರಯಾಣದ ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸುತ್ತದೆ.
2. **ಭೂಪ್ರದೇಶ ಗುಣಕಗಳು:** ಕೇವಲ ನೇರ ರೇಖೆಯ ದೂರವಲ್ಲದೆ, ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಕಡಿದಾದ ತಿರುವುಗಳಿಗೆ 1.48x ಮತ್ತು ಕರಾವಳಿ ಹೆದ್ದಾರಿಗೆ 1.28x ನೈಜ ರಸ್ತೆ ಗುಣಕಗಳನ್ನು ಬಳಸುತ್ತದೆ.
3. **ಹಿಂತಿರುಗುವಿಕೆ (Backtracking) ರಹಿತ ಕ್ರಮ:** ಒಂದೇ ದಿನದಲ್ಲಿ ಅನಗತ್ಯವಾಗಿ ಅತ್ತಿಂದಿತ್ತ ಓಡಾಡುವುದನ್ನು ತಡೆಯಲು ತಾಣಗಳನ್ನು ಭೌಗೋಳಿಕವಾಗಿ ಗುಂಪು ಮಾಡಲಾಗುತ್ತದೆ.
4. **ದೇವಾಲಯಗಳ ಸಮಯ ಹೊಂದಾಣಿಕೆ:** ಗರ್ಭಗುಡಿ ಮುಚ್ಚುವ ಸಮಯ (12:30 - 4:30 PM) ಮತ್ತು ಸೂರ್ಯೋದಯ/ಸೂರ್ಯಾಸ್ತದ ಸಮಯಗಳನ್ನು ನಿಲುಗಡೆಗಳ ಕ್ರಮದಲ್ಲಿ ಹೊಂದಿಸಲಾಗುತ್ತದೆ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Yatrion Smart Route Optimization Engine (Part 10):
Yatrion plans multi-destination Karnataka routes with realistic spatial intelligence:

1. **Hub-First Geographic Clustering:** Routes originate from your departure city (Bengaluru, Mysuru, Hubballi, Mangaluru, etc.) and visit destinations in optimal sequence to minimize total transit.
2. **Calibrated Terrain Detour Factors:** Real roads are not straight lines. We apply 1.48x for Western Ghats hairpins (averaging 30 km/h), 1.28x for Coastal NH 66, and 1.22x for Deccan Plains.
3. **Anti-Backtracking Ordering:** Intra-day attractions are ordered via nearest-neighbor heuristics to eliminate wasteful zigzagging.
4. **Sacred Timing Respect:** Temple sanctum afternoon closures (12:30 PM – 4:30 PM) and scenic sunrise/sunset spots are scheduled at their optimal times of day.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // ── 6. HISTORICAL DYNASTIES & ARCHITECTURE ("history", "dynasty", "chalukya", "hoysala", "vijayanagara", "ಇತಿಹಾಸ") ──
  const isDynasty =
    qNorm.includes("dynasty") ||
    qNorm.includes("chalukya") ||
    qNorm.includes("hoysala") ||
    qNorm.includes("vijayanagara") ||
    qNorm.includes("wodeyar") ||
    qNorm.includes("architecture") ||
    qNorm.includes("ವಾಸ್ತುಶಿಲ್ಪ") ||
    qNorm.includes("ಸಾಮ್ರಾಜ್ಯ");

  if (isDynasty) {
    const dynasties = KARNATAKA_DYNASTIES;
    if (isKn) {
      return {
        text: `### ಕರ್ನಾಟಕದ ಭವ್ಯ ಐತಿಹಾಸಿಕ ಸಾಮ್ರಾಜ್ಯಗಳು ಮತ್ತು ವಾಸ್ತುಶಿಲ್ಪ:

${dynasties
  .map(
    (dyn) =>
      `* **${dyn.kannadaName} (${dyn.era}):**\n  * **ರಾಜಧಾನಿ:** ${dyn.capital}\n  * **ವಾಸ್ತು ಶೈಲಿ:** ${dyn.architecturalStyle}\n  * **ಪ್ರಮುಖ ಸ್ಮಾರಕಗಳು:** ${dyn.keyMonuments.join(", ")}\n  * ${dyn.descriptionKn}`
  )
  .join("\n\n")}`,
        source: "knowledge-engine",
        sourceDescription,
        actions: [
          {
            id: "view-dynasty-hampi",
            type: "view_destination",
            label: "ಹಂಪಿ (ವಿಜಯನಗರ) ವಿವರ",
            labelKn: "ಹಂಪಿ (ವಿಜಯನಗರ) ವಿವರ",
            destinationId: "hampi",
          },
          {
            id: "view-dynasty-badami",
            type: "view_destination",
            label: "ಬಾದಾಮಿ (ಚಾಲುಕ್ಯ) ವಿವರ",
            labelKn: "ಬಾದಾಮಿ (ಚಾಲುಕ್ಯ) ವಿವರ",
            destinationId: "badami",
          },
        ],
      };
    }

    return {
      text: `### Historic Dynasties and Architecture of Karnataka:

${dynasties
  .map(
    (dyn) =>
      `* **${dyn.name} (${dyn.kannadaName} · ${dyn.era}):**\n  * **Capital:** ${dyn.capital}\n  * **Architectural Style:** ${dyn.architecturalStyle}\n  * **Key Monuments:** ${dyn.keyMonuments.join(", ")}\n  * ${dyn.descriptionEn}`
  )
  .join("\n\n")}

*(All 4 historical capital regions are featured in Yatrion's curated destinations).*`,
      source: "knowledge-engine",
      sourceDescription,
      actions: [
        {
          id: "view-dynasty-hampi",
          type: "view_destination",
          label: "View Hampi (Vijayanagara)",
          labelKn: "ಹಂಪಿ ವಿವರ",
          destinationId: "hampi",
        },
        {
          id: "view-dynasty-badami",
          type: "view_destination",
          label: "View Badami (Chalukya)",
          labelKn: "ಬಾದಾಮಿ ವಿವರ",
          destinationId: "badami",
        },
      ],
    };
  }

  // ── 6b. LIVING CULTURAL TRADITIONS ("tradition", "culture", "yakshagana", "kambala", "dasara", "ಸಂಸ್ಕೃತಿ") ──
  const isFoodQuery =
    qNorm.includes("food") ||
    qNorm.includes("cuisine") ||
    qNorm.includes("dish") ||
    qNorm.includes("eat") ||
    qNorm.includes("ಆಹಾರ") ||
    qNorm.includes("ಊಟ");

  const isTradition =
    !isFoodQuery &&
    (qNorm.includes("tradition") ||
      qNorm.includes("culture") ||
      qNorm.includes("yakshagana") ||
      qNorm.includes("kambala") ||
      qNorm.includes("dasara") ||
      qNorm.includes("festival") ||
      qNorm.includes("ಸಂಸ್ಕೃತಿ") ||
      qNorm.includes("ಹಬ್ಬ") ||
      qNorm.includes("ಕಲೆ"));

  if (isTradition) {
    if (isKn) {
      return {
        text: `### ಕರ್ನಾಟಕದ ಜೀವಂತ ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆ ಮತ್ತು ಕಲೆಗಳು:

${CULTURAL_TRADITIONS.map(
  (t) =>
    `* **${t.kannadaName} (${t.region}):**\n  * ${t.descriptionKn}\n  * *ಪ್ರವಾಸ ಸಲಹೆ:* ${t.practicalTip}`
).join("\n\n")}`,
        source: "knowledge-engine",
        sourceDescription,
        actions: [
          {
            id: "culture-view-mysuru",
            type: "view_destination",
            label: "ಮೈಸೂರು (ನಾಡಹಬ್ಬ) ವಿವರ",
            labelKn: "ಮೈಸೂರು ವಿವರ",
            destinationId: "mysuru",
          },
          {
            id: "culture-view-udupi",
            type: "view_destination",
            label: "ಉಡುಪಿ (ಯಕ್ಷಗಾನ/ಕಂಬಳ) ವಿವರ",
            labelKn: "ಉಡುಪಿ ವಿವರ",
            destinationId: "udupi",
          },
        ],
      };
    }

    return {
      text: `### Living Cultural Traditions & Performing Arts of Karnataka:

${CULTURAL_TRADITIONS.map(
  (t) =>
    `* **${t.name} (${t.kannadaName} · ${t.region}):**\n  * ${t.descriptionEn}\n  * *Traveler tip:* ${t.practicalTip}`
).join("\n\n")}

*(Tip: Cultural performances like Yakshagana and Kambala occur during dry winter and summer months across coastal and Malnad districts).*`,
      source: "knowledge-engine",
      sourceDescription,
      actions: [
        {
          id: "culture-view-mysuru",
          type: "view_destination",
          label: "Explore Mysuru (Dasara)",
          labelKn: "ಮೈಸೂರು ವಿವರ",
          destinationId: "mysuru",
        },
        {
          id: "culture-view-udupi",
          type: "view_destination",
          label: "Explore Udupi (Yakshagana & Kambala)",
          labelKn: "ಉಡುಪಿ ವಿವರ",
          destinationId: "udupi",
        },
      ],
    };
  }

  // ── 6c. REGIONAL GEOGRAPHY & CLIMATIC ZONES ("geography", "zone", "climate", "ಭೂಗೋಳ", "ಹವಾಮಾನ") ──
  const isGeography =
    qNorm.includes("geography") ||
    qNorm.includes("region") ||
    qNorm.includes("climate") ||
    qNorm.includes("zone") ||
    qNorm.includes("ಭೂಗೋಳ") ||
    qNorm.includes("ಹವಾಮಾನ");

  if (isGeography) {
    if (isKn) {
      return {
        text: `### ಕರ್ನಾಟಕದ ಭೌಗೋಳಿಕ ವಲಯಗಳು ಮತ್ತು ಹವಾಮಾನ:

${KARNATAKA_REGIONAL_ZONES.map(
  (z) =>
    `* **${z.nameKn}:**\n  * ${z.landscapeDescriptionKn}\n  * *ಹವಾಮಾನ:* ${z.climateOverviewKn}\n  * *ಪ್ರಮುಖ ಜಿಲ್ಲೆಗಳು:* ${z.prominentDistricts.join(", ")}`
).join("\n\n")}`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Geographic Zones & Climatic Regions of Karnataka:

${KARNATAKA_REGIONAL_ZONES.map(
  (z) =>
    `* **${z.nameEn}:**\n  * ${z.landscapeDescriptionEn}\n  * *Climate & Best Time:* ${z.climateOverviewEn}\n  * *Districts:* ${z.prominentDistricts.join(", ")}`
).join("\n\n")}`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // ── 7. COMPARISON INTENT ("compare hampi and mysuru", "coorg vs chikmagalur", etc.) ──
  const isCompare =
    qNorm.includes("compare") ||
    qNorm.includes("versus") ||
    qNorm.includes(" vs ") ||
    qNorm.includes("ಹೋಲಿಕೆ") ||
    qNorm.includes("ವ್ಯತ್ಯಾಸ") ||
    qNorm.includes("మరియు") ||
    qNorm.includes("పోలిక") ||
    mentionedDests.length >= 2;

  if (isCompare && mentionedDests.length >= 2) {
    const d1 = mentionedDests[0];
    const d2 = mentionedDests[1];

    actions.push({
      id: `view-${d1.id}`,
      type: "view_destination",
      label: isKn ? `${d1.kannadaName} ವಿವರ ವೀಕ್ಷಿಸಿ` : isTe ? `${MULTILINGUAL_DESTINATION_NAMES[d1.id]?.te || d1.name} వివరాలు` : `View ${d1.name} Details`,
      labelKn: `${d1.kannadaName} ವಿವರ ವೀಕ್ಷಿಸಿ`,
      destinationId: d1.id,
      payload: { destinationId: d1.id },
    });
    actions.push({
      id: `view-${d2.id}`,
      type: "view_destination",
      label: isKn ? `${d2.kannadaName} ವಿವರ ವೀಕ್ಷಿಸಿ` : isTe ? `${MULTILINGUAL_DESTINATION_NAMES[d2.id]?.te || d2.name} వివరాలు` : `View ${d2.name} Details`,
      labelKn: `${d2.kannadaName} ವಿವರ ವೀಕ್ಷಿಸಿ`,
      destinationId: d2.id,
      payload: { destinationId: d2.id },
    });

    if (isTe) {
      const d1Te = MULTILINGUAL_DESTINATION_NAMES[d1.id]?.te || d1.name;
      const d2Te = MULTILINGUAL_DESTINATION_NAMES[d2.id]?.te || d2.name;
      return {
        text: `### ${d1Te} మరియు ${d2Te} గమ్యస్థానాల సమాచారం (కర్ణాటక ప్రయాణ మార్గదర్శి):

* **${d1Te} (${d1.name} · ${d1.region})**:
  * **వర్గం:** ${d1.categoryLabel}
  * **ప్రధాన ఆకర్షణలు:** ${d1.highlights.slice(0, 3).join(", ")}
  * **ఉత్తమ సమయం:** ${d1.bestSeason}
  * **అవసరమైన రోజులు:** ${d1.idealDuration}
  * **అంచనా రోజువారీ ఖర్చు:** ${d1.estimatedDailyBudget}

* **${d2Te} (${d2.name} · ${d2.region})**:
  * **వర్గం:** ${d2.categoryLabel}
  * **ప్రధాన ఆకర్షణలు:** ${d2.highlights.slice(0, 3).join(", ")}
  * **ఉత్తమ సమయం:** ${d2.bestSeason}
  * **అవసరమైన రోజులు:** ${d2.idealDuration}
  * **అంచనా రోజువారీ ఖర్చు:** ${d2.estimatedDailyBudget}

వివరాలను చూడటానికి క్రింది బటన్లను ఉపయోగించండి.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    if (isKn) {
      return {
        text: `### ${d1.kannadaName} ಮತ್ತು ${d2.kannadaName} ಹೋಲಿಕೆ:

* **${d1.kannadaName} (${d1.region})**:
  * **ವಿಭಾಗ:** ${d1.categoryLabel}
  * **ಪ್ರಮುಖ ಆಕರ್ಷಣೆ:** ${d1.highlights.slice(0, 2).join(", ")}
  * **ಸೂಕ್ತ ಅವಧಿ:** ${d1.idealDuration}
  * **ಉತ್ತಮ ಸಮಯ:** ${d1.bestSeason}
  * **ಅಂದಾಜು ದೈನಂದಿನ ವೆಚ್ಚ:** ${d1.estimatedDailyBudget} (${d1.budgetTier})
  * **ಸಾಂಸ್ಕೃತಿಕ ಹಿನ್ನೆಲೆ:** ${d1.culturalNote}

* **${d2.kannadaName} (${d2.region})**:
  * **ವಿಭಾಗ:** ${d2.categoryLabel}
  * **ಪ್ರಮುಖ ಆಕರ್ಷಣೆ:** ${d2.highlights.slice(0, 2).join(", ")}
  * **ಸೂಕ್ತ ಅವಧಿ:** ${d2.idealDuration}
  * **ಉತ್ತಮ ಸಮಯ:** ${d2.bestSeason}
  * **ಅಂದಾಜು ದೈನಂದಿನ ವೆಚ್ಚ:** ${d2.estimatedDailyBudget} (${d2.budgetTier})
  * **ಸಾಂಸ್ಕೃತಿಕ ಹಿನ್ನೆಲೆ:** ${d2.culturalNote}

**ಯಾತ್ರಿಯಾನ್ ಸಲಹೆ:** ಪ್ರಾಚೀನ ವಾಸ್ತುಶಿಲ್ಪ ಮತ್ತು ಇತಿಹಾಸವನ್ನು ಹುಡುಕುತ್ತಿದ್ದರೆ ${
          d1.category === "heritage" ? d1.kannadaName : d2.kannadaName
        } ಆಯ್ಕೆಮಾಡಿ; ನಿಸರ್ಗ ಮತ್ತು ಶಾಂತ ವಾತಾವರಣಕ್ಕೆ ${
          d1.category === "nature" ? d1.kannadaName : d2.kannadaName
        } ಉತ್ತಮ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Comparing ${d1.name} vs. ${d2.name}:

* **${d1.name} (${d1.kannadaName} · ${d1.region})**:
  * **Category:** ${d1.categoryLabel}
  * **Highlights:** ${d1.highlights.slice(0, 2).join(", ")}
  * **Ideal Duration:** ${d1.idealDuration}
  * **Best Season:** ${d1.bestSeason}
  * **Estimated Daily Cost:** ${d1.estimatedDailyBudget} (${d1.budgetTier} tier)
  * **Cultural Essence:** ${d1.culturalNote}

* **${d2.name} (${d2.kannadaName} · ${d2.region})**:
  * **Category:** ${d2.categoryLabel}
  * **Highlights:** ${d2.highlights.slice(0, 2).join(", ")}
  * **Ideal Duration:** ${d2.idealDuration}
  * **Best Season:** ${d2.bestSeason}
  * **Estimated Daily Cost:** ${d2.estimatedDailyBudget} (${d2.budgetTier} tier)
  * **Cultural Essence:** ${d2.culturalNote}

**Yatrion Recommendation:** If your focus is ancient architecture and monuments, prioritize **${
        d1.category === "heritage" ? d1.name : d2.name
      }**. If you prefer cool mountain greenery or mist, choose **${
        d1.category === "nature" ? d1.name : d2.name
      }**.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // ── 8. DURATION / ITINERARY SUGGESTION INTENT ("suggest a 3 day trip", "weekend trip", "5 days") ──
  const isTripSuggest =
    qNorm.includes("suggest") ||
    qNorm.includes("itinerary") ||
    qNorm.includes("trip") ||
    qNorm.includes("plan") ||
    qNorm.includes("day") ||
    qNorm.includes("ದಿನ") ||
    qNorm.includes("ಪ್ರವಾಸ");

  const durationMatch = qNorm.match(/(\d+)\s*(?:day|days|ದಿನ)/);
  const requestedDays = durationMatch ? parseInt(durationMatch[1], 10) : 0;

  if (isTripSuggest && (requestedDays > 0 || qNorm.includes("weekend") || qNorm.includes("ವಾರಾಂತ್ಯ"))) {
    const days = requestedDays || 2;
    actions.push({
      id: "action-planner-duration",
      type: "set_duration",
      label: isKn ? `${days} ದಿನಗಳ ಪ್ರವಾಸವನ್ನು ಯೋಜಿಸಿ` : `Plan a ${days}-Day Itinerary in Planner`,
      labelKn: `${days} ದಿನಗಳ ಪ್ರವಾಸವನ್ನು ಯೋಜಿಸಿ`,
      payload: { durationDays: Math.min(days, 7) },
    });
    actions.push({
      id: "action-goto-planner",
      type: "navigate_planner",
      label: isKn ? "ಪ್ರವಾಸ ಯೋಜಕಕ್ಕೆ ತೆರಳಿ" : "Open Smart Trip Planner",
      labelKn: "ಪ್ರವಾಸ ಯೋಜಕಕ್ಕೆ ತೆರಳಿ",
      payload: { sectionId: "planner" },
    });

    if (days <= 2) {
      if (isKn) {
        return {
          text: `### 2 ದಿನಗಳ ಕರ್ನಾಟಕ ವಾರಾಂತ್ಯ ಪ್ರವಾಸ ಸಲಹೆ:
* **ಆಯ್ಕೆ 1: ರಾಜಮನೆತನದ ಹೆರಿಟೇಜ್ ಸರ್ಕ್ಯೂಟ್ (ಮೈಸೂರು & ಶ್ರೀರಂಗಪಟ್ಟಣ)**
  * ದಿನ 1: ಮೈಸೂರು ಅರಮನೆ, ದೇವರಾಜ ಮಾರುಕಟ್ಟೆ, ಚಾಮುಂಡಿ ಬೆಟ್ಟ.
  * ದಿನ 2: ಶ್ರೀರಂಗಪಟ್ಟಣ ಐತಿಹಾಸಿಕ ತಾಣಗಳು, ರಂಗನತಿಟ್ಟು ಪಕ್ಷಿಧಾಮ.
* **ಆಯ್ಕೆ 2: ಮಲೆನಾಡು ಕಾಫಿ ಬೆಟ್ಟಗಳು (ಚಿಕ್ಕಮಗಳೂರು)**
  * ದಿನ 1: ಮುಳ್ಳಯ್ಯನಗಿರಿ ಚಾರಣ, ಬಾಬಾ ಬುಡನ್‌ಗಿರಿ, ಕಾಫಿ ಎಸ್ಟೇಟ್ ವಾಕ್.
  * ದಿನ 2: ಹೆಬ್ಬೆ ಜಲಪಾತ, ಹಳೇಬೀಡು ಹೊಯ್ಸಳ ದೇವಾಲಯ ದರ್ಶನ.

*(ಗಮನಿಸಿ: ಪ್ರಯಾಣ ಸಮಯದ ಅಂದಾಜುಗಳು ಸಾಮಾನ್ಯ ಹೆದ್ದಾರಿ ಸಂಚಾರಕ್ಕೆ ಅನ್ವಯಿಸುತ್ತವೆ).*`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }
      return {
        text: `### Recommended 2-Day Karnataka Weekend Getaway:
* **Option 1: Royal Heritage (Bengaluru → Mysuru & Belur)**
  * **Day 1:** Mysore Palace, Devaraja Market, Chamundi Hill sunset.
  * **Day 2:** Srirangapatna fort or a short detour to Hoysala temples in Belur.
* **Option 2: Coffee Highlands (Chikmagalur)**
  * **Day 1:** Mullayanagiri peak trek, Baba Budangiri, coffee estate plantation walk.
  * **Day 2:** Hebbe Falls or Belur/Halebidu temple trail on return.

*(Transit note: Typical driving time from Bengaluru is ~3 hours to Mysuru via Expressway, or ~4.5 hours to Chikmagalur via NH 75).*`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    } else if (days <= 4) {
      if (isKn) {
        return {
          text: `### 3–4 ದಿನಗಳ ಕರ್ನಾಟಕ ಪ್ರವಾಸ ಸರ್ಕ್ಯೂಟ್:
* **ಮಾರ್ಗ: ವಿಜಯನಗರ & ಚಾಲುಕ್ಯ ಪರಂಪರೆ (ಹಂಪಿ & ಬಾದಾಮಿ)**
  * **ದಿನ 1–2 (ಹಂಪಿ):** ವಿರೂಪಾಕ್ಷ ದೇವಾಲಯ, ವಿಜಯ ವಿಠ್ಠಲ ಕಲ್ಲಿನ ರಥ, ಹೇಮಕೂಟ ಸೂರ್ಯಾಸ್ತ, ತುಂಗಭದ್ರಾ ನದಿ ತೀರ.
  * **ದಿನ 3 (ಬಾದಾಮಿ):** ಬಾದಾಮಿ ಗುಹಾಂತರ ದೇವಾಲಯಗಳು, ಭೂತನಾಥ ಗುಂಪು, ಐಹೊಳೆ ಮತ್ತು ಪಟ್ಟದಕಲ್ಲು (UNESCO ವಿಶ್ವ ಪರಂಪರೆ).
  * **ದಿನ 4:** ಮರಳಿ ಪ್ರಯಾಣ ಅಥವಾ ಹಂಪಿ ಆನೆ ಲಾಯಗಳು ಹಾಗೂ ರಾಯಲ್ ಎನ್‌ಕ್ಲೋಷರ್.

*(ಸಾರಿಗೆ ಸಲಹೆ: ಹೊಸಪೇಟೆ ಅಥವಾ ಹುಬ್ಬಳ್ಳಿ ಮೂಲಕ ರೈಲು ಪ್ರಯಾಣ ಅತ್ಯಂತ ಸುಗಮ).*`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }
      return {
        text: `### Recommended 3–4 Day Karnataka Circuit:
* **The Golden Heritage Trail (Hampi & Badami):**
  * **Days 1–2 (Hampi):** Virupaksha Temple, Vittala Stone Chariot, Royal Enclosure, Hemakuta Hill sunset, Tungabhadra coracle ride.
  * **Day 3 (Badami & Pattadakal):** 6th-century rock-cut cave temples, Agastya Lake, UNESCO world heritage monument cluster in Pattadakal.
  * **Day 4:** Aihole cradle of temple architecture and scenic return via Hubballi.

*(Logistics tip: Overnight train from Bengaluru to Hospet Junction provides convenient morning arrival).*`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    } else {
      if (isKn) {
        return {
          text: `### ${days} ದಿನಗಳ ಸಮಗ್ರ ಕರ್ನಾಟಕ ಗ್ರಾಂಡ್ ಟೂರ್:
* **ದಿನ 1–2 (ಪರಂಪರೆ):** ಹಂಪಿ ಮತ್ತು ಬಾದಾಮಿಯ ಶಿಲ್ಪಕಲೆ ಹಾಗೂ ಇತಿಹಾಸ.
* **ದಿನ 3–4 (ಕರಾವಳಿ):** ಗೋಕರ್ಣದ ಕಡಲತೀರಗಳು, ಮುರುಡೇಶ್ವರ, ಉಡುಪಿ ಶ್ರೀಕೃಷ್ಣ ಮಠ ಹಾಗೂ ಸಾತ್ವಿಕ ಭೋಜನ.
* **ದಿನ 5–${days} (ಮಲೆನಾಡು & ವನ್ಯಜೀವಿ):** ಜೋಗ ಜಲಪಾತ, ಚಿಕ್ಕಮಗಳೂರು ಅಥವಾ ಕೊಡಗು ಕಾಫಿ ಬೆಟ್ಟಗಳು, ಬಂಡೀಪುರ ಸಫಾರಿ.

ಈ ಸಂಪೂರ್ಣ ಪ್ರವಾಸವನ್ನು ನಿಮ್ಮ ಬಜೆಟ್ ಹಾಗೂ ವಾಹನಕ್ಕೆ ತಕ್ಕಂತೆ ಕಸ್ಟಮೈಸ್ ಮಾಡಲು ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ.`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }
      return {
        text: `### Recommended ${days}-Day Grand Karnataka Circuit:
* **Days 1–2 (Ancient Empires):** Hampi & Badami cave temples and stone chariot.
* **Days 3–4 (Arabian Coast):** Gokarna beach treks (Om & Kudle beaches) and Udupi culinary trail.
* **Days 5–${days} (Western Ghats & Biosphere):** Jog Falls cascades, Chikmagalur coffee highlands, and Bandipur national park safari.

Use Yatrion's Smart Trip Planner below to adjust pacing, vehicle type, and budget breakdown automatically.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }
  }

  // ── 9. REGIONAL FOOD & CUISINE INTENT ("food", "eat", "dishes", "ಆಹಾರ", "ಊಟ") ──
  const isFood =
    qNorm.includes("food") ||
    qNorm.includes("eat") ||
    qNorm.includes("cuisine") ||
    qNorm.includes("dish") ||
    qNorm.includes("dosa") ||
    qNorm.includes("coffee") ||
    qNorm.includes("ಆಹಾರ") ||
    qNorm.includes("ಊಟ") ||
    qNorm.includes("ತಿಂಡಿ");

  if (isFood) {
    if (isKn) {
      return {
        text: `### ಕರ್ನಾಟಕದ ಸಾಂಪ್ರದಾಯಿಕ ಆಹಾರ ಮಾರ್ಗದರ್ಶಿ:

${CULINARY_ZONES.map(
  (zone) =>
    `* **${zone.nameKn} (${zone.region}):**\n  * ${zone.overviewKn}\n  * *ವಿಶೇಷ ತಿನಿಸುಗಳು:* ${zone.signatureDishes
      .map((d) => d.kannadaName)
      .join(", ")}\n  * *ಅಧಿಕೃತ ತಾಣ:* ${zone.authenticVenueTipKn}`
).join("\n\n")}`,
        source: "knowledge-engine",
        sourceDescription,
        actions: [
          {
            id: "food-view-udupi",
            type: "view_destination",
            label: "ಉಡುಪಿ (ಆಹಾರ ರಾಜಧಾನಿ) ವಿವರ",
            labelKn: "ಉಡುಪಿ ವಿವರ",
            destinationId: "udupi",
          },
        ],
      };
    }

    return {
      text: `### Authentic Karnataka Culinary Trails:

${CULINARY_ZONES.map(
  (zone) =>
    `* **${zone.nameEn} (${zone.nameKn}):**\n  * ${zone.overviewEn}\n  * *Signature dishes:* ${zone.signatureDishes
      .map((d) => d.name)
      .join(", ")}\n  * *Authentic venue tip:* ${zone.authenticVenueTipEn}`
).join("\n\n")}

*(Tip: For authentic food experiences, seek out district-run cooperative messes, local Darshinis, and estate homestays).*`,
      source: "knowledge-engine",
      sourceDescription,
      actions: [
        {
          id: "food-view-udupi",
          type: "view_destination",
          label: "Explore Udupi (Culinary Capital)",
          labelKn: "ಉಡುಪಿ ವಿವರ",
          destinationId: "udupi",
        },
      ],
    };
  }

  // ── 9B. GROUP TRIP PLANNER & COLLABORATIVE DECISION ENGINE (PART 10 STAGE 4) ──
  const isGroupQuery =
    qNorm.includes("everyone will enjoy") ||
    qNorm.includes("conflicting interests") ||
    qNorm.includes("conflicting interest") ||
    qNorm.includes("which travellers have conflicting") ||
    qNorm.includes("which travellers have conflict") ||
    qNorm.includes("within everyone's budget") ||
    qNorm.includes("everyone's budget") ||
    qNorm.includes("stay within everyone") ||
    qNorm.includes("adventure and relaxation") ||
    qNorm.includes("split this trip") ||
    qNorm.includes("split expenses") ||
    qNorm.includes("who owes whom") ||
    qNorm.includes("accessible activities for our group") ||
    qNorm.includes("accessible activities") ||
    qNorm.includes("group trip") ||
    qNorm.includes("traveller profile") ||
    qNorm.includes("group compatibility") ||
    (qNorm.includes("group") &&
      (qNorm.includes("budget") ||
        qNorm.includes("split") ||
        qNorm.includes("conflict") ||
        qNorm.includes("pace") ||
        qNorm.includes("activity") ||
        qNorm.includes("compromise"))) ||
    qNorm.includes("ಗುಂಪು") ||
    qNorm.includes("ಎಲ್ಲರೂ ಆನಂದಿಸುವ") ||
    qNorm.includes("ಆಸಕ್ತಿ ಸಂಘರ್ಷ") ||
    qNorm.includes("ವೆಚ್ಚ ಹಂಚಿಕೆ") ||
    qNorm.includes("ಯಾರು ಯಾರಿಗೆ ನೀಡಬೇಕು") ||
    qNorm.includes("ಸಮೂಹ") ||
    qNorm.includes("समूह") ||
    qNorm.includes("सभी") ||
    qNorm.includes("గ్రూప్");

  if (isGroupQuery) {
    const groupState = context.groupState;
    const travellers = groupState?.config?.travellers || [];
    const groupName = groupState?.config?.groupName || "Karnataka Explorers";

    actions.push({
      id: "action-view-group",
      type: "view_group_planner",
      label: isKn ? "ಗುಂಪು ಪ್ರವಾಸ ಯೋಜಕ ವೀಕ್ಷಿಸಿ" : "View Group Trip Workspace",
      labelKn: "ಗುಂಪು ಪ್ರವಾಸ ಯೋಜಕ ವೀಕ್ಷಿಸಿ",
    });

    // 1. ACTIVITIES EVERYONE WILL ENJOY / CONSENSUS
    if (
      qNorm.includes("everyone will enjoy") ||
      qNorm.includes("everyone enjoy") ||
      qNorm.includes("ಎಲ್ಲರೂ ಆನಂದಿಸುವ") ||
      qNorm.includes("ಎಲ್ಲರಿಗೂ ಇಷ್ಟ") ||
      qNorm.includes("सभी पसंद करेंगे") ||
      qNorm.includes("पसंद") ||
      qNorm.includes("అందరూ ఆనందించే")
    ) {
      if (travellers.length > 0) {
        const shared = extractSharedInterests(travellers);
        const unanimous = shared.filter((s) => s.isUnanimous);
        const majorities = shared.filter((s) => !s.isUnanimous && s.isMajority);

        if (isKn) {
          return {
            text: `### '${groupName}' ತಂಡದ ಎಲ್ಲರೂ ಆನಂದಿಸಬಹುದಾದ ಚಟುವಟಿಕೆಗಳು:

${
  unanimous.length > 0
    ? `* **ಸರ್ವಾನುಮತದ ಆಸಕ್ತಿಗಳು (100% ಒಪ್ಪಿಗೆ):** ${unanimous
        .map((u) => `**${u.labelKn}** (${u.supporterCount}/${travellers.length} ಜನರು)`)
        .join(", ")}
  * ಈ ಆಸಕ್ತಿಗಳಿಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಮೈಸೂರು ಅರಮನೆ, ಬೇಲೂರು ಹೊಯ್ಸಳ ಶಿಲ್ಪಕಲೆ, ಅಥವಾ ಕರಾವಳಿ ಸೂರ್ಯಾಸ್ತ ವೀಕ್ಷಣೆ ಎಲ್ಲರಿಗೂ ಮೆಚ್ಚುಗೆಯಾಗುತ್ತದೆ.`
    : `* **ಗಮನಿಸಿ:** ಯಾವುದೇ ಒಂದೇ ಆಸಕ್ತಿಯ ಮೇಲೆ ಇಡೀ ತಂಡದಲ್ಲಿ 100% ಸರ್ವಾನುಮತವಿಲ್ಲ.`
}
${
  majorities.length > 0
    ? `* **ಬಹುಮತದ ಆಸಕ್ತಿಗಳು (50%+ ಬೆಂಬಲ):**
${majorities
  .map(
    (m) =>
      `  • **${m.labelKn}** (${m.percentage}% ಬೆಂಬಲ: ${m.travellerNames.join(", ")})`
  )
  .join("\n")}`
    : ""
}

* **ಯಾತ್ರಿಯಾನ್ ಸಾಮೂಹಿಕ ಶಿಫಾರಸು:**
  1. ಬೆಳಿಗ್ಗೆ ಪ್ರಮುಖ ಪಾರಂಪರಿಕ ಅಥವಾ ನೈಸರ್ಗಿಕ ತಾಣಕ್ಕೆ ಎಲ್ಲರೂ ಒಟ್ಟಾಗಿ ಭೇಟಿ ನೀಡಿ.
  2. ಮಧ್ಯಾಹ್ನದ ವಿಶ್ರಾಂತಿ ಸಮಯದಲ್ಲಿ ಸಾಂಪ್ರದಾಯಿಕ ಕರ್ನಾಟಕ ಊಟ (ದಕ್ಷಿಣ/ಉತ್ತರ ಶೈಲಿ) ಎಲ್ಲರಿಗೂ ತೃಪ್ತಿ ನೀಡುತ್ತದೆ.
  3. ಸಂಜೆ ವೈಯಕ್ತಿಕ ಆಸಕ್ತಿಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ಉಪಗುಂಪು ಚಟುವಟಿಕೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿಕೊಳ್ಳಿ.`,
            source: "knowledge-engine",
            sourceDescription,
            actions,
          };
        }

        if (isHi) {
          return {
            text: `### '${groupName}' समूह के सभी सदस्यों के लिए अनुशंसित गतिविधियाँ:

${
  unanimous.length > 0
    ? `* **सर्वसम्मत रुचियां (100% सहमति):** ${unanimous
        .map((u) => `**${u.labelEn}** (${u.supporterCount}/${travellers.length} यात्री)`)
        .join(", ")}
  * इन रुचियों के आधार पर मैसूर पैलेस या हंपी के विश्व धरोहर स्थल समूह के सभी सदस्यों को पसंद आएंगे।`
    : `* **ध्यान दें:** समूह में किसी भी एक रुचि पर 100% पूर्ण सर्वसम्मति नहीं है।`
}
${
  majorities.length > 0
    ? `* **बहुमत रुचियां (50%+ समर्थन):**
${majorities
  .map(
    (m) =>
      `  • **${m.labelEn}** (${m.percentage}% सदस्य: ${m.travellerNames.join(", ")})`
  )
  .join("\n")}`
    : ""
}

* **समूह सलाह:** सुबह सभी सदस्य एक साथ मुख्य धरोहर या प्राकृतिक स्थल पर जाएं, और शाम को व्यक्तिगत प्राथमिकताओं के लिए समय रखें।`,
            source: "knowledge-engine",
            sourceDescription,
            actions,
          };
        }

        if (isTe) {
          return {
            text: `### '${groupName}' బృందంలోని అందరూ ఆనందించే కార్యకలాపాలు:

${
  unanimous.length > 0
    ? `* **ఏకగ్రీవ ఆసక్తులు (100% ఏకాభిప్రాయం):** ${unanimous
        .map((u) => `**${u.labelEn}** (${u.supporterCount}/${travellers.length} మంది)`)
        .join(", ")}`
    : `* **గమనిక:** ఏ ఒక్క ఆసక్తిపైనా గ్రూప్‌లో 100% పూర్తి ఏకాభిప్రాయం లేదు.`
}
${
  majorities.length > 0
    ? `* **మెజారిటీ ఆసక్తులు (50%+ మద్దతు):**
${majorities
  .map(
    (m) =>
      `  • **${m.labelEn}** (${m.percentage}% సభ్యులు: ${m.travellerNames.join(", ")})`
  )
  .join("\n")}`
    : ""
}

* **గ్రూప్ సిఫార్సు:** ఉదయం ప్రధాన చారిత్రక లేదా పర్యాటక ప్రదేశాన్ని కలిసి దర్శించి, సాయంత్రం వేర్వేరు అభిరుచుల కోసం సమయం కేటాయించండి.`,
            source: "knowledge-engine",
            sourceDescription,
            actions,
          };
        }

        return {
          text: `### Activities Everyone Will Enjoy in '${groupName}':

${
  unanimous.length > 0
    ? `* **Unanimous Group Consensus (100% Agreement):** ${unanimous
        .map((u) => `**${u.labelEn}** (${u.supporterCount}/${travellers.length} travellers)`)
        .join(", ")}
  * Activities grounded in these categories (such as Mysuru Palace cultural touring or scenic coastal sunsets) are guaranteed crowd-pleasers.`
    : `* **Consensus Notice:** There is no single category with 100% unanimous agreement across all ${travellers.length} travellers.`
}
${
  majorities.length > 0
    ? `* **Majority Shared Interests (≥50% Support):**
${majorities
  .map(
    (m) =>
      `  • **${m.labelEn}** (${m.percentage}% support: ${m.travellerNames.join(", ")})`
  )
  .join("\n")}`
    : ""
}

* **Yatrion Collaborative Strategy:**
  1. Anchor morning slots around shared majority interests (e.g., iconic monuments or scenic viewpoints).
  2. Reserve afternoon free hours for subgroup optional excursions (e.g., café relaxation vs. nature trails).
  3. Reconnect for hearty authentic Karnataka dinners (local Darshinis or estate homestay dining).`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }

      // Fallback if no group configured yet
      return {
        text: isKn
          ? `### ಎಲ್ಲಾ ಪ್ರವಾಸಿಗರೂ ಆನಂದಿಸಬಹುದಾದ ಕರ್ನಾಟಕದ ಸಾರ್ವತ್ರಿಕ ತಾಣಗಳು:
1. **ಮೈಸೂರು ಅರಮನೆ & ಚಾಮುಂಡಿ ಬೆಟ್ಟ:** ಇತಿಹಾಸ, ವಾಸ್ತುಶಿಲ್ಪ ಹಾಗೂ ಭಕ್ತಿ ಎಲ್ಲರಿಗೂ ಹೊಂದಿಕೊಳ್ಳುತ್ತದೆ.
2. **ಗೋಕರ್ಣ ಕುಡ್ಲೆ ಕಡಲತೀರ:** ವಿಶ್ರಾಂತಿ ಬಯಸುವವರಿಗೆ ಸೂರ್ಯಾಸ್ತದ ಧ್ಯಾನ, ಸಾಹಸಿಗಳಿಗೆ ಕ್ಲಿಫ್ ಟ್ರೆಕ್ ಎರಡೂ ಲಭ್ಯ.
3. **ಹಂಪಿ ತುಂಗಭದ್ರಾ ನದಿ & ಕಲ್ಲಿನ ರಥ:** ವಿಶಿಷ್ಟ ಪ್ರಾಚೀನತೆ ಮತ್ತು ತೆಪ್ಪದ ಸವಾರಿ.

ನಿಮ್ಮ ತಂಡದ ನಿರ್ದಿಷ್ಟ ಹೊಂದಾಣಿಕೆಯನ್ನು ಪರೀಕ್ಷಿಸಲು 'ಗುಂಪು ಪ್ರವಾಸ ಯೋಜಕ'ದಲ್ಲಿ ಪ್ರವಾಸಿಗರನ್ನು ಸೇರಿಸಿ.`
          : `### Universal Group Activities in Karnataka (Appeals to All Ages):
1. **Mysuru Palace & Chamundi Hill:** Perfect blend of royal heritage, illumination, and motorable accessibility for adults and children alike.
2. **Gokarna Kudle Beach:** Relaxation seekers can enjoy tranquil sunset cafés while adventurous travellers hike the coastal headland trail.
3. **Hampi Tungabhadra River Coracle Ride:** Iconic historical scenery that is gentle enough for families while novel for adventure lovers.

To generate recommendations based on your specific group, add travellers in the Group Trip Workspace below.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    // 2. CONFLICTING INTERESTS / WHICH TRAVELLERS HAVE CONFLICTS
    if (
      qNorm.includes("conflicting") ||
      qNorm.includes("conflict") ||
      qNorm.includes("ಸಂಘರ್ಷ") ||
      qNorm.includes("ವಿವಾದ") ||
      qNorm.includes("భిన్నాభిప్రాయాలు")
    ) {
      if (travellers.length > 0) {
        const conflicts = detectInterestConflicts(travellers);
        const compatibility = calculateGroupCompatibility(travellers);

        if (isKn) {
          return {
            text: `### '${groupName}' ತಂಡದ ಆಸಕ್ತಿ ಸಂಘರ್ಷಗಳ ವಿಶ್ಲೇಷಣೆ:
* **ಒಟ್ಟು ಹೊಂದಾಣಿಕೆ ಅಂಕ:** ${compatibility.overallScore}/100
* **ವೇಗ ಒಮ್ಮತ:** ${compatibility.paceConsensus === "relaxed" ? "ನಿರಾಳ" : compatibility.paceConsensus === "packed" ? "ವೇಗದ" : "ಸಮತೋಲಿತ"}

${
  conflicts.length > 0
    ? `**ಗುರುತಿಸಲಾದ ಸಂಘರ್ಷಗಳು (${conflicts.length}):**
${conflicts
  .map(
    (c, i) =>
      `**${i + 1}. ${c.descriptionKn}**
  • ತೊಡಗಿಕೊಂಡಿರುವವರು: [${c.involvedTravellersA.join(", ")}] vs [${c.involvedTravellersB.join(", ")}]
  • **ಪರಿಹಾರ ಸಲಹೆ:** ${c.suggestedCompromiseKn}`
  )
  .join("\n\n")}`
    : `✓ **ಉತ್ತಮ ಸುದ್ದಿ:** ನಿಮ್ಮ ತಂಡದ ಸದಸ್ಯರ ನಡುವೆ ಯಾವುದೇ ಗಂಭೀರ ಆಸಕ್ತಿ ಸಂಘರ್ಷಗಳು ಕಂಡುಬಂದಿಲ್ಲ!`
}
${
  compatibility.hasPaceConflict
    ? `\n⚠️ **ಪ್ರಯಾಣದ ವೇಗದ ಸಂಘರ್ಷ:** ತಂಡದಲ್ಲಿ ನಿರಾಳ ಮತ್ತು ವೇಗದ ಪ್ರಯಾಣ ಶೈಲಿ ಬಯಸುವವರಿದ್ದಾರೆ. ಸಮತೋಲಿತ (Balanced) ವೇಗವನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.`
    : ""
}`,
            source: "knowledge-engine",
            sourceDescription,
            actions,
          };
        }

        if (isHi) {
          return {
            text: `### '${groupName}' समूह में रुचि और प्राथमिकताओं के टकराव का विश्लेषण:
* **समूह अनुकूलता स्कोर:** ${compatibility.overallScore}/100

${
  conflicts.length > 0
    ? `**पहचाने गए मतभेद (${conflicts.length}):**
${conflicts
  .map(
    (c, i) =>
      `**${i + 1}. ${c.descriptionEn}**
  • संबंधित यात्री: [${c.involvedTravellersA.join(", ")}] बनाम [${c.involvedTravellersB.join(", ")}]
  • **समाधान:** ${c.suggestedCompromiseEn}`
  )
  .join("\n\n")}`
    : `✓ **शानदार!** समूह के सदस्यों के बीच कोई गंभीर रुचि टकराव नहीं पाया गया।`
}`,
            source: "knowledge-engine",
            sourceDescription,
            actions,
          };
        }

        return {
          text: `### Interest Conflicts Analysis for '${groupName}':
* **Overall Group Compatibility:** ${compatibility.overallScore}/100
* **Consensus Travel Pace:** ${compatibility.paceConsensus.toUpperCase()}

${
  conflicts.length > 0
    ? `**Identified Conflicts (${conflicts.length}):**
${conflicts
  .map(
    (c, i) =>
      `**${i + 1}. ${c.descriptionEn}**
  • Travellers Involved: [${c.involvedTravellersA.join(", ")}] vs [${c.involvedTravellersB.join(", ")}]
  • **Suggested Compromise:** ${c.suggestedCompromiseEn}`
  )
  .join("\n\n")}`
    : `✓ **Great News:** No severe interest conflicts detected in your group roster!`
}
${
  compatibility.hasPaceConflict
    ? `\n⚠️ **Pacing Friction:** Your group contains both packed-schedule and relaxed seekers. A balanced tempo with optional late afternoons is recommended.`
    : ""
}`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }

      return {
        text: isKn
          ? "ತಂಡದಲ್ಲಿ ಸಂಘರ್ಷಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ದಯವಿಟ್ಟು 'ಗುಂಪು ಪ್ರವಾಸ ಯೋಜಕ'ದಲ್ಲಿ ಪ್ರವಾಸಿಗರ ಪ್ರೊಫೈಲ್‌ಗಳನ್ನು ರಚಿಸಿ."
          : "Please configure your travellers in the Group Trip Workspace to analyze individual preferences and potential conflicts.",
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    // 3. COMPROMISE BETWEEN ADVENTURE AND RELAXATION
    if (
      qNorm.includes("adventure and relaxation") ||
      qNorm.includes("compromise") ||
      qNorm.includes("ರಾಜಿ") ||
      qNorm.includes("ಸಾಹಸ ಮತ್ತು ವಿಶ್ರಾಂತಿ") ||
      qNorm.includes("समझौता") ||
      qNorm.includes("సర్దుబాటు")
    ) {
      if (isKn) {
        return {
          text: `### ಸಾಹಸ (Adventure) ಮತ್ತು ವಿಶ್ರಾಂತಿ (Relaxation) ನಡುವಿನ ಸಮತೋಲನ ಪರಿಹಾರ:

ಕರ್ನಾಟಕದ ಭೌಗೋಳಿಕ ವೈವಿಧ್ಯತೆಯು ಎರಡೂ ಅಭಿರುಚಿಗಳಿಗೆ ಸುಂದರ ಹೊಂದಾಣಿಕೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ:

1. **ದಾಂಡೇಲಿ / ಕಾಳಿ ನದಿ:**
   * **ಸಾಹಸಿಗಳಿಗೆ:** ಕಾಳಿ ನದಿಯಲ್ಲಿ ವೈಟ್-ವಾಟರ್ ರಾಫ್ಟಿಂಗ್ ಅಥವಾ ಕಾಯಾಕಿಂಗ್.
   * **ವಿಶ್ರಾಂತಿ ಪ್ರಿಯರಿಗೆ:** ನದಿಯ ದಂಡೆಯ ಮೇಲೆ ಪಕ್ಷಿ ವೀಕ್ಷಣೆ, ಮರದ ನೆರಳಿನಲ್ಲಿ ವಿಶ್ರಾಂತಿ, ಮತ್ತು ಸಾವಯವ ಮಲೆನಾಡು ಊಟ.
2. **ಗೋಕರ್ಣ / ಕರಾವಳಿ ತೀರ:**
   * **ಸಾಹಸಿಗಳಿಗೆ:** ಕುಡ್ಲೆಯಿಂದ ಪ್ಯಾರಡೈಸ್ ಬೀಚ್‌ಗೆ ಬಂಡೆಗಳ ಕಡಿದಾದ ಕ್ಲಿಫ್ ಟ್ರೆಕ್.
   * **ವಿಶ್ರಾಂತಿ ಪ್ರಿಯರಿಗೆ:** ಓಂ ಬೀಚ್ ಅಥವಾ ಕುಡ್ಲೆ ಬೀಚ್ ಶಾಂತ ಕೆಫೆಗಳಲ್ಲಿ ಸೂರ್ಯಾಸ್ತದ ಧ್ಯಾನ ಮತ್ತು ಆಯುರ್ವೇದ ಚಿಕಿತ್ಸೆ.
3. **ಚಿಕ್ಕಮಗಳೂರು / ಮುಳ್ಳಯ್ಯನಗಿರಿ:**
   * **ಸಾಹಸಿಗಳಿಗೆ:** ಬಾಬಾ ಬುಡನ್‌ಗಿರಿ ಶಿಖರದ ಚಾರಣ.
   * **ವಿಶ್ರಾಂತಿ ಪ್ರಿಯರಿಗೆ:** ಖಾಸಗಿ ಕಾಫಿ ಎಸ್ಟೇಟ್ ಹೋಂಸ್ಟೇನಲ್ಲಿ ಫಿಲ್ಟರ್ ಕಾಫಿ ಸವಿಯುತ್ತಾ ಪ್ರಕೃತಿ ಸೌಂದರ್ಯದ ಆಸ್ವಾದನೆ.

*ಸಲಹೆ: ತಂಡವು ಒಟ್ಟಾಗಿ ವಾಸ್ತವ್ಯ ಹೂಡಿ, ದಿನದ 2-3 ಗಂಟೆಗಳನ್ನು ಪ್ರತ್ಯೇಕ ಉಪಗುಂಪು ಚಟುವಟಿಕೆಗಳಿಗೆ ಮೀಸಲಿಡಬಹುದು!*`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }

      if (isHi) {
        return {
          text: `### रोमांच (Adventure) और सुकून (Relaxation) के बीच संतुलन समाधान:

1. **दांदेली (Dandeli):** रोमांच पसंद करने वाले काली नदी में वाइट-वाटर राफ्टिंग कर सकते हैं, जबकि विश्राम पसंद करने वाले शांत रिसॉर्ट में पक्षी दर्शन का आनंद ले सकते हैं।
2. **गोकर्ण (Gokarna):** साहसी यात्री 5-बीच क्लिफ ट्रैक कर सकते हैं, जबकि अन्य सदस्य कुडले बीच के शांत कैफे में सूर्यास्त का आनंद ले सकते हैं।
3. **चिकमगलूर (Chikmagalur):** मुल्लायनगिरि की ट्रेकिंग बनाम शांत कॉफी एस्टेट होमस्टे में विश्राम।`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }

      return {
        text: `### How to Balance Adventure and Relaxation in Karnataka:

Karnataka's geography offers ideal dual-experience hubs where thrill-seekers and leisure-lovers can base together without anyone compromising:

1. **Dandeli (Kali River Basin):**
   * **Adventure Track:** Grade-3 white-water rafting, natural jacuzzis, and jungle safari.
   * **Relaxation Track:** Riverside birdwatching, serene coracle drifting, and hammock stays under dense teak canopies.
2. **Gokarna (Coastal Headlands):**
   * **Adventure Track:** 5-beach cliffside trail connecting Kudle, Om, Half Moon, and Paradise Beach.
   * **Relaxation Track:** Sunset yoga at Kudle Beach, tranquil beachside seafood cafés, and temple town wandering.
3. **Chikmagalur (Coffee Hills):**
   * **Adventure Track:** Early-morning steep summit climb to Mullayanagiri peak.
   * **Relaxation Track:** Private coffee estate walking tours, artisan filter coffee brewing, and verandah reading.

*Execution Tip: Keep morning starts unified, split into parallel 2.5-hour activity tracks at noon, and reunite for shared dinners.*`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    // 4. STAY WITHIN EVERYONE'S BUDGET / GROUP BUDGET CEILINGS
    if (
      qNorm.includes("budget") ||
      qNorm.includes("ಬಜೆಟ್") ||
      qNorm.includes("ವೆಚ್ಚ") ||
      qNorm.includes("बजट") ||
      qNorm.includes("ఖర్చు")
    ) {
      if (travellers.length > 0) {
        const analysis = analyzeGroupBudget({
          travellers,
          budgetPlan: context.budgetPlan || undefined,
        });

        if (isKn) {
          return {
            text: `### '${groupName}' ತಂಡದ ಬಜೆಟ್ ಮಿತಿಗಳ ವಿಶ್ಲೇಷಣೆ:
* **ಅಂದಾಜು ತಲಾ ವೆಚ್ಚ (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ):** ₹${analysis.estimatedTripCostPerPerson.toLocaleString("en-IN")}
* **ಇಡೀ ತಂಡದ ಒಟ್ಟು ಅಂದಾಜು:** ₹${analysis.totalEstimatedTripCost.toLocaleString("en-IN")}
* **ತುರ್ತು ಮೀಸಲು ನಿಧಿ (ತಲಾ ಪಾಲು):** ₹${analysis.contingencySharePerPerson.toLocaleString("en-IN")}
* **ಶಿಫಾರಸು ಮಾಡಿದ ಸನ್ನಿವೇಶ:** ${analysis.recommendedScenario === "budget_saver" ? "ಬಜೆಟ್ ಸೇವರ್ (KSRTC & ಬಜೆಟ್ ಹೋಂಸ್ಟೇ)" : "ಸಮತೋಲಿತ ಕಂಫರ್ಟ್"}

${
  analysis.hasBudgetConflict
    ? `⚠️ **ಬಜೆಟ್ ಕೊರತೆಯ ಎಚ್ಚರಿಕೆ:**
${analysis.conflicts
  .filter((c) => c.isDeficit)
  .map(
    (c) =>
      `• **${c.travellerName}:** ನಿಗದಿಪಡಿಸಿದ ಮಿತಿ ₹${c.individualBudgetLimit.toLocaleString("en-IN")} (ಕೊರತೆ: ₹${c.deficitAmount.toLocaleString("en-IN")})\n  *ಸಲಹೆ:* ${c.adviceKn}`
  )
  .join("\n")}`
    : `✓ **ಎಲ್ಲರ ಬಜೆಟ್ ಮಿತಿಯಲ್ಲಿದೆ:** ಎಲ್ಲಾ ${travellers.length} ಪ್ರವಾಸಿಗರೂ ತಮ್ಮ ವೈಯಕ್ತಿಕ ಬಜೆಟ್ ಮಿತಿಯಲ್ಲಿ ಸುಲಭವಾಗಿ ಪ್ರವಾಸ ಮಾಡಬಹುದು!`
}`,
            source: "knowledge-engine",
            sourceDescription,
            actions,
          };
        }

        if (isHi) {
          return {
            text: `### '${groupName}' समूह का बजट विश्लेषण:
* **अनुमानित प्रति व्यक्ति खर्च:** ₹${analysis.estimatedTripCostPerPerson.toLocaleString("en-IN")}
* **समूह का कुल अनुमानित खर्च:** ₹${analysis.totalEstimatedTripCost.toLocaleString("en-IN")}
${
  analysis.hasBudgetConflict
    ? `⚠️ **बजट सीमा चेतावनी:** कुछ सदस्यों की व्यक्तिगत बजट सीमा अनुमानित खर्च से कम है। कृपया बजट सेवर मॉडल चुनें।`
    : `✓ **सफलता:** सभी यात्री अपनी व्यक्तिगत बजट सीमा के भीतर हैं!`
}`,
            source: "knowledge-engine",
            sourceDescription,
            actions,
          };
        }

        return {
          text: `### Group Budget Feasibility for '${groupName}':
* **Estimated Cost Per Traveller:** ₹${analysis.estimatedTripCostPerPerson.toLocaleString("en-IN")}
* **Total Estimated Group Expenditure:** ₹${analysis.totalEstimatedTripCost.toLocaleString("en-IN")}
* **Emergency Buffer Share (Per Person):** ₹${analysis.contingencySharePerPerson.toLocaleString("en-IN")}
* **Recommended Scenario:** ${analysis.recommendedScenario.replace("_", " ").toUpperCase()}

${
  analysis.hasBudgetConflict
    ? `⚠️ **Individual Budget Ceiling Alerts:**
${analysis.conflicts
  .filter((c) => c.isDeficit)
  .map(
    (c) =>
      `• **${c.travellerName}:** Budget limit of ₹${c.individualBudgetLimit.toLocaleString("en-IN")} is below estimated per-person cost by ₹${c.deficitAmount.toLocaleString("en-IN")}.\n  *Advice:* ${c.adviceEn}`
  )
  .join("\n")}`
    : `✓ **All Within Budget:** Every member's personal budget ceiling safely accommodates the estimated trip costs!`
}`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }

      return {
        text: isKn
          ? "ತಂಡದ ಪ್ರತಿಯೊಬ್ಬರ ಬಜೆಟ್ ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸಲು 'ಗುಂಪು ಪ್ರವಾಸ ಯೋಜಕ'ದಲ್ಲಿ ಪ್ರವಾಸಿಗರ ಬಜೆಟ್ ಮಿತಿಗಳನ್ನು ನಮೂದಿಸಿ."
          : "To analyze whether you can stay within everyone's budget, configure traveller budget ceilings in the Group Trip Workspace.",
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    // 5. SPLIT THIS TRIP'S ESTIMATED EXPENSES / WHO OWES WHOM
    if (
      qNorm.includes("split") ||
      qNorm.includes("settlement") ||
      qNorm.includes("who owes whom") ||
      qNorm.includes("ಹಂಚಿಕೆ") ||
      qNorm.includes("ಲೆಕ್ಕ") ||
      qNorm.includes("बंटवारा") ||
      qNorm.includes("ఖర్చులు పంచుకోండి")
    ) {
      if (travellers.length > 0) {
        const expenseSummary = calculateGroupExpenseSummary(
          groupState?.expenses || [],
          travellers
        );

        if (isKn) {
          return {
            text: `### '${groupName}' ತಂಡದ ವೆಚ್ಚ ಹಂಚಿಕೆ & ಇತ್ಯರ್ಥದ ಸ್ಥಿತಿ:
* **ದಾಖಲಾದ ಒಟ್ಟು ವೆಚ್ಚ:** ₹${expenseSummary.totalExpenses.toLocaleString("en-IN")}
* **ಪ್ರವಾಸಿಗರ ಸಂಖ್ಯೆ:** ${travellers.length} ಜನರು

${
  expenseSummary.settlementTransfers.length > 0
    ? `**ಹಣ ಪಾವತಿ ಇತ್ಯರ್ಥ ("ಯಾರು ಯಾರಿಗೆ ನೀಡಬೇಕು"):**
${expenseSummary.settlementTransfers
  .map(
    (st) =>
      `• **${st.fromTravellerName}** ಅವರು **${st.toTravellerName}** ಅವರಿಗೆ **₹${st.amountInr.toLocaleString("en-IN")}** ಪಾವತಿಸಬೇಕು.`
  )
  .join("\n")}`
    : expenseSummary.totalExpenses > 0
    ? `✓ ಎಲ್ಲಾ ಸದಸ್ಯರ ಪಾವತಿಗಳು ಸಮತೋಲನದಲ್ಲಿವೆ; ಯಾರೂ ಯಾರಿಗೂ ಬಾಕಿ ಪಾವತಿಸಬೇಕಿಲ್ಲ.`
    : `ಇನ್ನೂ ಯಾವುದೇ ವೆಚ್ಚಗಳು ದಾಖಲಾಗಿಲ್ಲ. 'ಗುಂಪು ಪ್ರವಾಸ ಯೋಜಕ'ದಲ್ಲಿ ವಾಸ್ತವ್ಯ, ಆಹಾರ ಅಥವಾ ಸಾರಿಗೆ ವೆಚ್ಚಗಳನ್ನು ದಾಖಲಿಸಿ ತ್ವರಿತ ಇತ್ಯರ್ಥ ಲೆಕ್ಕಾಚಾರ ಪಡೆಯಿರಿ.`
}`,
            source: "knowledge-engine",
            sourceDescription,
            actions,
          };
        }

        if (isHi) {
          return {
            text: `### '${groupName}' समूह का खर्च बंटवारा और हिसाब:
* **कुल दर्ज खर्च:** ₹${expenseSummary.totalExpenses.toLocaleString("en-IN")}
${
  expenseSummary.settlementTransfers.length > 0
    ? `**लेनदेन का हिसाब (किसे किसको देना है):**
${expenseSummary.settlementTransfers
  .map(
    (st) =>
      `• **${st.fromTravellerName}** को **${st.toTravellerName}** को **₹${st.amountInr.toLocaleString("en-IN")}** देना है।`
  )
  .join("\n")}`
    : `दर्ज खर्चों का हिसाब संतुलित है।`
}`,
            source: "knowledge-engine",
            sourceDescription,
            actions,
          };
        }

        return {
          text: `### Expense Split & Settlement Status for '${groupName}':
* **Total Tracked Expenses:** ₹${expenseSummary.totalExpenses.toLocaleString("en-IN")}
* **Active Travellers:** ${travellers.length} members

${
  expenseSummary.settlementTransfers.length > 0
    ? `**Simplified Settlement Transfers ("Who Owes Whom"):**
${expenseSummary.settlementTransfers
  .map(
    (st) =>
      `• **${st.fromTravellerName}** owes **${st.toTravellerName}**: ₹${st.amountInr.toLocaleString("en-IN")}`
  )
  .join("\n")}

*(Calculated using Yatrion's greedy debt simplification algorithm to eliminate cyclic transfers).*`
    : expenseSummary.totalExpenses > 0
    ? `✓ All individual accounts are currently balanced. No pending transfers needed.`
    : `No shared expenses logged yet. Log accommodations, meals, and tempo traveller hires in the Group Trip Workspace to calculate zero-loss splits.`
}`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }

      return {
        text: isKn
          ? "ವೆಚ್ಚ ಹಂಚಿಕೆಯನ್ನು ಲೆಕ್ಕಹಾಕಲು ಮೊದಲು 'ಗುಂಪು ಪ್ರವಾಸ ಯೋಜಕ'ದಲ್ಲಿ ಪ್ರವಾಸಿಗರನ್ನು ಸೇರಿಸಿ."
          : "Add your travel companions in the Group Trip Workspace to track shared expenses and calculate simplified settlements.",
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    // 6. ACCESSIBLE ACTIVITIES FOR OUR GROUP
    if (
      qNorm.includes("accessible") ||
      qNorm.includes("wheelchair") ||
      qNorm.includes("step-free") ||
      qNorm.includes("step free") ||
      qNorm.includes("low walking") ||
      qNorm.includes("ಪ್ರವೇಶ್ಯತೆ") ||
      qNorm.includes("ಗಾಲಿಕುರ್ಚಿ")
    ) {
      const activeAccessibility =
        travellers.length > 0
          ? aggregateAccessibilityRequirements(travellers)
          : ["step_free"];

      if (isKn) {
        return {
          text: `### ತಂಡಕ್ಕೆ ಸೂಕ್ತವಾದ ಪ್ರವೇಶ್ಯತಾ-ಸ್ನೇಹಿ (Accessible) ಚಟುವಟಿಕೆಗಳು:

* **ಗುರುತಿಸಲಾದ ಅಗತ್ಯತೆಗಳು:** ${
            activeAccessibility.length > 0
              ? activeAccessibility.join(", ")
              : "ಸಾಮಾನ್ಯ"
          }

1. **ಮೈಸೂರು ಅರಮನೆ (Mysuru Palace):**
   * ಬ್ಯಾಟರಿ ಚಾಲಿತ ವಾಹನಗಳು, ಸುಲಭ ರ‍್ಯಾಂಪ್ ಪ್ರವೇಶ ಮತ್ತು ಸಮತಟ್ಟಾದ ಅಂಗಳ ಲಭ್ಯವಿದೆ.
2. **ಚಾಮುಂಡಿ ಬೆಟ್ಟ (Chamundi Hill):**
   * ಬೆಟ್ಟದ ಮೇಲಿನ ದೇವಾಲಯದವರೆಗೆ ವಾಹನಗಳು ನೇರವಾಗಿ ಹೋಗುತ್ತವೆ; ಕಡಿದಾದ ಮೆಟ್ಟಿಲುಗಳನ್ನು ತಪ್ಪಿಸಬಹುದು.
3. **ಬೃಂದಾವನ ಗಾರ್ಡನ್ಸ್ (Brindavan Gardens):**
   * ಪ್ರಮುಖ ಕಾರಂಜಿ ಪ್ರದೇಶದವರೆಗೆ ಸುಗಮವಾದ ಸಿಮೆಂಟ್ ನಡಿಗೆ ಪಥಗಳು (Paved pathways) ಇವೆ.
4. **ಉಡುಪಿ ಶ್ರೀಕೃಷ್ಣ ಮಠ (Udupi Sri Krishna Matha):**
   * ಆವರಣವು ಸಮತಟ್ಟಾಗಿದ್ದು ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ ಮತ್ತು ಗಾಲಿಕುರ್ಚಿಗಳಿಗೆ ಸುಲಭವಾಗಿ ಪ್ರವೇಶಿಸಬಹುದಾಗಿದೆ.

⚠️ **ಎಚ್ಚರಿಕೆ (ಕಠಿಣ ತಾಣಗಳು):** ಹಂಪಿಯ ಮಾತಂಗ ಬೆಟ್ಟದ ಚಾರಣ ಮತ್ತು ಬಾದಾಮಿಯ ಗುಹಾಂತರ ದೇವಾಲಯಗಳ ಮೆಟ್ಟಿಲುಗಳು ಕಡಿದಾಗಿದ್ದು, ಗಾಲಿಕುರ್ಚಿ ಅಥವಾ ಕಡಿಮೆ ನಡಿಗೆಯವರಿಗೆ ಸೂಕ್ತವಲ್ಲ.`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }

      return {
        text: `### Accessible Activities for Your Group in Karnataka:

* **Active Group Accessibility Flags:** ${
          activeAccessibility.length > 0
            ? activeAccessibility.join(", ")
            : "Wheelchair / Step-Free verified"
        }

1. **Mysuru Palace (Mysuru):**
   * Wheelchair ramps, wide ground corridors, and battery-operated carts available for mobility-restricted travellers.
2. **Chamundi Hill Summit (Mysuru):**
   * Fully motorable road right up to the temple courtyard, completely bypassing the 1,008 stone steps.
3. **Brindavan Gardens (KRS Dam):**
   * Paved walkways and gentle step-free ramps along the main musical fountain lawns.
4. **Udupi Sri Krishna Matha (Udupi):**
   * Flat paved courtyard with dedicated priority access for senior citizens and mobility-assisted visitors.

⚠️ **Avoid / Flag as Strenuous:**
* **Matanga Hill (Hampi):** Steep, boulder-strewn footpath with uneven rocks and no handrails.
* **Badami Cave Temples:** Steep stone staircases cut into cliff faces without ramp access.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }
  }


  const isBudget =
    qNorm.includes("cheaper") ||
    qNorm.includes("budget") ||
    qNorm.includes("save") ||
    qNorm.includes("cost") ||
    qNorm.includes("price") ||
    qNorm.includes("expensive") ||
    qNorm.includes("afford") ||
    qNorm.includes("₹") ||
    /(?:under|below|within)\s*₹?\s*\d+/i.test(query) ||
    qNorm.includes("ಬಜೆಟ್") ||
    qNorm.includes("ವೆಚ್ಚ") ||
    qNorm.includes("ಕಡಿಮೆ") ||
    qNorm.includes("ದುಬಾರಿ") ||
    qNorm.includes("ಉಳಿತಾಯ");

  if (isBudget) {
    if (context.budgetPlan) {
      const bp = context.budgetPlan;
      const s = bp.scenarios;
      const activeS = s[bp.activeScenario];

      actions.push({
        id: "action-view-budget-optimizer",
        type: "view_budget",
        label: isKn
          ? "ಜಾಣ್ಮೆಯ ಬಜೆಟ್ ಆಪ್ಟಿಮೈಜರ್ ವೀಕ್ಷಿಸಿ"
          : "View Intelligent Budget Optimizer",
        labelKn: "ಜಾಣ್ಮೆಯ ಬಜೆಟ್ ಆಪ್ಟಿಮೈಜರ್ ವೀಕ್ಷಿಸಿ",
        payload: { sectionId: "budget" },
      });

      // Specific query 1: Most expensive day
      if (
        qNorm.includes("most expensive") ||
        qNorm.includes("which day") ||
        qNorm.includes("ಹೆಚ್ಚು ವೆಚ್ಚ") ||
        qNorm.includes("ಯಾವ ದಿನ")
      ) {
        const expDay = bp.dailyExpenses.find(
          (d) => d.dayNumber === bp.mostExpensiveDayNumber
        );
        if (isKn) {
          return {
            text: `### ಗರಿಷ್ಠ ವೆಚ್ಚದ ದಿನದ ವಿಶ್ಲೇಷಣೆ:
* **ದಿನ:** ದಿನ ${bp.mostExpensiveDayNumber} (${expDay ? expDay.destinationKannada : ""})
* **ಅಂದಾಜು ದಿನದ ವೆಚ್ಚ:** ₹${expDay ? expDay.estimatedDayCost.toLocaleString("en-IN") : "0"} (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ: ₹${expDay ? expDay.perPersonDayCost.toLocaleString("en-IN") : "0"})
* **ಮುಖ್ಯ ವೆಚ್ಚದ ಕಾರಣ:** ${expDay ? expDay.primaryCostDriverKn : "ಆಗಮನ ಪ್ರಯಾಣ ಮತ್ತು ಪ್ರವೇಶ ಶುಲ್ಕಗಳು"}

💡 **ಉಳಿತಾಯ ಸಲಹೆ:** ಈ ದಿನದ ಸಾರಿಗೆಯನ್ನು ಹಂಚಿಕೆಯ ಕ್ಯಾಬ್ ಮೂಲಕ ಅಥವಾ ಸಾರ್ವಜನಿಕ ರೈಲು/KSRTC ಮೂಲಕ ಯೋಜಿಸಿದರೆ ವೆಚ್ಚವನ್ನು ಸರಾಸರಿಗೆ ತರಬಹುದು.`,
            source: "knowledge-engine",
            sourceDescription,
            actions,
          };
        }

        return {
          text: `### Most Expensive Day Analysis:
* **Day:** Day ${bp.mostExpensiveDayNumber} (${expDay ? expDay.destinationName : ""})
* **Estimated Day Spend:** ₹${expDay ? expDay.estimatedDayCost.toLocaleString("en-IN") : "0"} (Per Person: ₹${expDay ? expDay.perPersonDayCost.toLocaleString("en-IN") : "0"})
* **Primary Cost Driver:** ${expDay ? expDay.primaryCostDriverEn : "Arrival transit and entry fees"}

💡 **Cost-Cutting Tip:** Booking express rail / KSRTC for this leg or opting for authentic Darshini meals brings this day's cost right back into your daily average.`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }

      // Specific query 2: Target budget threshold (e.g. under 8000 / under 20000 / under ...)
      const budgetMatch = query.match(/(?:under|below|within|ಕಡಿಮೆ)\s*₹?\s*([\d,]+)/i);
      if (budgetMatch) {
        const threshold = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
        const saverFeasible = s.budget_saver.perPersonCost <= threshold || s.budget_saver.totalCost <= threshold;
        const balancedFeasible = s.balanced.perPersonCost <= threshold || s.balanced.totalCost <= threshold;
        const comfortFeasible = s.comfort.perPersonCost <= threshold || s.comfort.totalCost <= threshold;

        if (isKn) {
          return {
            text: `### ₹${threshold.toLocaleString("en-IN")} ಬಜೆಟ್ ಕಾರ್ಯಸಾಧ್ಯತೆ ಪರಿಶೀಲನೆ:
* **ಬಜೆಟ್ ಸೇವರ್ (₹${s.budget_saver.perPersonCost.toLocaleString("en-IN")}/ವ್ಯಕ್ತಿ):** ${saverFeasible ? "✓ ಹೌದು, ಸುಲಭವಾಗಿ ಸಾಧ್ಯ!" : "⚠ ಕಷ್ಟವಾಗಬಹುದು"}
* **ಸಮತೋಲಿತ ಪರಿಶೋಧಕ (₹${s.balanced.perPersonCost.toLocaleString("en-IN")}/ವ್ಯಕ್ತಿ):** ${balancedFeasible ? "✓ ಹೌದು, ಆರಾಮವಾಗಿ ಸಾಧ್ಯ!" : "⚠ ಬಜೆಟ್ ಮೀರಬಹುದು"}
* **ಪ್ರೀಮಿಯಂ ಕಂಫರ್ಟ್ (₹${s.comfort.perPersonCost.toLocaleString("en-IN")}/ವ್ಯಕ್ತಿ):** ${comfortFeasible ? "✓ ಹೌದು" : "✗ ಈ ಬಜೆಟ್‌ಗಿಂತ ಹೆಚ್ಚಾಗುತ್ತದೆ"}

💡 **ಶಿಫಾರಸು:** ನಿಮ್ಮ ಪ್ರವಾಸವನ್ನು ₹${threshold.toLocaleString("en-IN")} ಒಳಗೆ ಪೂರ್ಣಗೊಳಿಸಲು **${saverFeasible && !balancedFeasible ? "ಬಜೆಟ್ ಸೇವರ್" : "ಸಮತೋಲಿತ"}** ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.`,
            source: "knowledge-engine",
            sourceDescription,
            actions,
          };
        }

        return {
          text: `### Feasibility Analysis for Budget of ₹${threshold.toLocaleString("en-IN")}:
* **Budget Saver (₹${s.budget_saver.perPersonCost.toLocaleString("en-IN")} / person):** ${saverFeasible ? "✓ Fully Feasible!" : "⚠ Tight"}
* **Balanced Explorer (₹${s.balanced.perPersonCost.toLocaleString("en-IN")} / person):** ${balancedFeasible ? "✓ Feasible & Recommended!" : "⚠ Slightly over target"}
* **Comfort & Indulgence (₹${s.comfort.perPersonCost.toLocaleString("en-IN")} / person):** ${comfortFeasible ? "✓ Feasible" : "✗ Exceeds target"}

💡 **Advice:** You can comfortably complete this trip within ₹${threshold.toLocaleString("en-IN")} by selecting the **${saverFeasible && !balancedFeasible ? "Budget Saver" : "Balanced"}** scenario in the optimizer below.`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }

      // Specific query 3: How to save money / specific amount
      if (
        qNorm.includes("save") ||
        qNorm.includes("how can i save") ||
        qNorm.includes("ಉಳಿತಾಯ") ||
        qNorm.includes("ಕಡಿಮೆ ಮಾಡುವುದು") ||
        qNorm.includes("ಕಡಿಮೆ ವೆಚ್ಚ")
      ) {
        const topRecs = bp.recommendations.slice(0, 3);
        const totalSavings = topRecs.reduce(
          (acc, r) => acc + r.estimatedSavingsInr,
          0
        );

        if (isKn) {
          return {
            text: `### ನಿಮ್ಮ ಪ್ರವಾಸದಲ್ಲಿ ~₹${totalSavings.toLocaleString("en-IN")} ವರೆಗೆ ಉಳಿತಾಯ ಮಾಡುವ ವಿಧಾನಗಳು:
${topRecs
  .map(
    (r, idx) =>
      `${idx + 1}. **${r.titleKn} (ಅಂದಾಜು ಉಳಿತಾಯ: ~₹${r.estimatedSavingsInr.toLocaleString("en-IN")}):**\n   * ${r.descriptionKn}\n   * *ಸಲಹೆ:* ${r.actionableSuggestionKn}`
  )
  .join("\n\n")}

🛡️ **ಸುರಕ್ಷತಾ ಖಾತರಿ:** ಈ ಎಲ್ಲಾ ಶಿಫಾರಸುಗಳಲ್ಲಿ ತುರ್ತು ಮೀಸಲು ನಿಧಿ (${activeS.contingencyPercent}%) ಮತ್ತು ನೈರ್ಮಲ್ಯದ ವಸತಿಯನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಕಾಪಾಡಲಾಗುತ್ತದೆ.`,
            source: "knowledge-engine",
            sourceDescription,
            actions,
          };
        }

        return {
          text: `### Practical Ways to Save ~₹${totalSavings.toLocaleString("en-IN")} on Your Karnataka Trip:
${topRecs
  .map(
    (r, idx) =>
      `${idx + 1}. **${r.titleEn} (Est. Savings: ~₹${r.estimatedSavingsInr.toLocaleString("en-IN")}):**\n   * ${r.descriptionEn}\n   * *Action:* ${r.actionableSuggestionEn}`
  )
  .join("\n\n")}

🛡️ **Safety Assurance:** None of these recommendations compromise passenger safety, vehicle hygiene, or your emergency contingency buffer (${activeS.contingencyPercent}%).`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }

      // Default comprehensive scenario response
      if (isKn) {
        return {
          text: `### ಯಾತ್ರಿಯಾನ್ ಜಾಣ್ಮೆಯ ಬಜೆಟ್ ಹೋಲಿಕೆ (ಭಾಗ 10 ಹಂತ 2):
* **1. ಬಜೆಟ್ ಸೇವರ್:** ಒಟ್ಟು ₹${s.budget_saver.totalCost.toLocaleString("en-IN")} (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ: ₹${s.budget_saver.perPersonCost.toLocaleString("en-IN")}) — *KSRTC ಬಸ್ಸುಗಳು, ಬಜೆಟ್ ವಸತಿ, ದರ್ಶಿನಿ ಊಟ*
* **2. ಸಮತೋಲಿತ ಪರಿಶೋಧಕ [ಶಿಫಾರಸು]:** ಒಟ್ಟು ₹${s.balanced.totalCost.toLocaleString("en-IN")} (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ: ₹${s.balanced.perPersonCost.toLocaleString("en-IN")}) — *ಹೆರಿಟೇಜ್ ಹೋಂಸ್ಟೇ, ಖಾಸಗಿ ಕ್ಯಾಬ್, ಪ್ರಾದೇಶಿಕ ಊಟ*
* **3. ಪ್ರೀಮಿಯಂ ಕಂಫರ್ಟ್:** ಒಟ್ಟು ₹${s.comfort.totalCost.toLocaleString("en-IN")} (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ: ₹${s.comfort.perPersonCost.toLocaleString("en-IN")}) — *ರೆಸಾರ್ಟ್‌ಗಳು, AC SUV, ಪ್ರೀಮಿಯಂ ಸೌಕರ್ಯ*

• **ತುರ್ತು ಮೀಸಲು ನಿಧಿ:** ${activeS.contingencyPercent}% (~₹${activeS.contingencyBuffer.toLocaleString("en-IN")})
• **ಗರಿಷ್ಠ ವೆಚ್ಚದ ದಿನ:** ದಿನ ${bp.mostExpensiveDayNumber}
${activeS.remainingBudget !== null ? `• **ಬಜೆಟ್ ಸ್ಥಿತಿ:** ${activeS.isOverBudget ? `⚠ ₹${Math.abs(activeS.remainingBudget).toLocaleString("en-IN")} ಮೀರಿದೆ` : `✓ +₹${activeS.remainingBudget.toLocaleString("en-IN")} ಉಳಿಕೆ`}` : ""}`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }

      return {
        text: `### Yatrion Intelligent Budget Scenario Comparison (Part 10 Stage 2):
* **1. Budget Saver:** ₹${s.budget_saver.totalCost.toLocaleString("en-IN")} (Per Person: ₹${s.budget_saver.perPersonCost.toLocaleString("en-IN")}) — *KSRTC express, clean budget homestays, Darshini meals*
* **2. Balanced Explorer [Recommended]:** ₹${s.balanced.totalCost.toLocaleString("en-IN")} (Per Person: ₹${s.balanced.perPersonCost.toLocaleString("en-IN")}) — *Heritage homestays, private tourist cab, sit-down thalis*
* **3. Comfort & Indulgence:** ₹${s.comfort.totalCost.toLocaleString("en-IN")} (Per Person: ₹${s.comfort.perPersonCost.toLocaleString("en-IN")}) — *Boutique resorts, dedicated AC SUV, fine regional banquets*

• **Emergency Contingency Buffer:** ${activeS.contingencyPercent}% (~₹${activeS.contingencyBuffer.toLocaleString("en-IN")})
• **Most Expensive Day:** Day ${bp.mostExpensiveDayNumber}
${activeS.remainingBudget !== null ? `• **Budget Status:** ${activeS.isOverBudget ? `⚠ Over target by ₹${Math.abs(activeS.remainingBudget).toLocaleString("en-IN")}` : `✓ Within budget (+₹${activeS.remainingBudget.toLocaleString("en-IN")} surplus)`}` : ""}`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    // Fallback if budgetPlan is not yet calculated
    actions.push({
      id: "action-view-budget",
      type: "view_budget",
      label: isKn ? "ಬಜೆಟ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ನೋಡಿ" : "View Budget Intelligence in Planner",
      labelKn: "ಬಜೆಟ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ನೋಡಿ",
      payload: { sectionId: "planner" },
    });

    if (isKn) {
      return {
        text: `### ಕರ್ನಾಟಕ ಪ್ರವಾಸದಲ್ಲಿ ವೆಚ್ಚ ಕಡಿಮೆ ಮಾಡುವ ಪ್ರಮುಖ ಸಲಹೆಗಳು:

1. **ಸಾರ್ವಜನಿಕ ಸಾರಿಗೆ ಬಳಕೆ (KSRTC & ರೈಲ್ವೆ):**
   * ಬೆಂಗಳೂರಿನಿಂದ ಮೈಸೂರಿಗೆ ಮೆಮು/ಎಕ್ಸ್‌ಪ್ರೆಸ್ ರೈಲು ಕೇವಲ ₹60-₹150 ಇರುತ್ತದೆ.
   * ಹೊಸಪೇಟೆಗೆ (ಹಂಪಿ) ರಾತ್ರಿ ರೈಲು ಹೋಟೆಲ್ ವೆಚ್ಚ ಹಾಗೂ ಸಮಯ ಎರಡನ್ನೂ ಉಳಿಸುತ್ತದೆ.
2. **ವಸತಿ ಉಳಿತಾಯ:**
   * ಪ್ರವಾಸಿ ಕೇಂದ್ರ ಪಟ್ಟಣಗಳ ಬದಲು ಅಧಿಕೃತ ಹೋಂಸ್ಟೇ ಅಥವಾ KSTDC ಮಯೂರ ಹೋಟೆಲ್‌ಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.
3. **ಆಹಾರ ವೆಚ್ಚ:**
   * ಸ್ಥಳೀಯ ದರ್ಶಿನಿಗಳಲ್ಲಿ ಹಾಗೂ ಖಾನಾವಳಿಗಳಲ್ಲಿ ಶುಚಿ-ರುಚಿಯಾದ ಊಟ ₹80-₹150 ರಲ್ಲಿ ಸಿಗುತ್ತದೆ.
4. **ಸ್ಮಾರಕ ಪಾಸ್:**
   * ASI ಸಂರಕ್ಷಿತ ತಾಣಗಳಿಗೆ (ಹಂಪಿ, ಪಟ್ಟದಕಲ್ಲು) ಆನ್‌ಲೈನ್ ಮೂಲಕ ಟಿಕೆಟ್ ಪಡೆದರೆ ರಿಯಾಯಿತಿ ಇರುತ್ತದೆ.

*(ಗಮನಿಸಿ: ಇವು ಸಾಮಾನ್ಯ ಯೋಜನಾ ಅಂದಾಜುಗಳು; ಅಧಿಕೃತ ಸಾರಿಗೆ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನಿಖರ ದರ ಪರಿಶೀಲಿಸಿ).*`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### How to Optimize Your Karnataka Travel Budget:

1. **Leverage KSRTC & Indian Railways:**
   * Trains between Bengaluru and Mysuru cost as little as ₹65–₹150 per person vs. ₹2,500+ for private cabs.
   * Overnight sleeper trains to Hospet (for Hampi) save an entire night's hotel tariff while maximizing daylight touring.
2. **Strategic Accommodation:**
   * Choose certified Malnad coffee homestays or government-run KSTDC Mayura hotels rather than luxury resorts.
3. **Local Dining Levers:**
   * Authentic local messes, Darshinis, and Khanavalis offer hearty regional meals for ₹90–₹160 per plate.
4. **ASI Monument Ticketing:**
   * Major monuments (Hampi Vittala complex, Badami caves) have nominal entry fees regulated by the Archaeological Survey of India (ASI). Booking through the official ASI portal often provides a digital discount.

*(Budget note: Yatrion provides transparent ₹3,000–₹30,000+ budget bands in the Smart Planner below).*`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // ── 11. PROXIMITY & NEARBY DESTINATIONS ("destinations near coorg", "places around hampi") ──
  const isNearby =
    qNorm.includes("near") ||
    qNorm.includes("around") ||
    qNorm.includes("close to") ||
    qNorm.includes("ಹತ್ತಿರ") ||
    qNorm.includes("ಸಮೀಪ");

  if (isNearby && mentionedDests.length >= 1) {
    const base = mentionedDests[0];
    const nearby = DESTINATIONS.filter(
      (d) =>
        d.id !== base.id &&
        (d.region === base.region ||
          (base.region === "Western Ghats" && (d.region === "South Karnataka" || d.region === "Nilgiri Biosphere")) ||
          (base.region === "Coastal Karnataka" && (d.region === "Western Ghats" || d.id === "gokarna" || d.id === "udupi")) ||
          (base.region === "North Karnataka" && d.region === "North Karnataka"))
    ).slice(0, 3);

    for (const d of nearby) {
      actions.push({
        id: `nearby-${d.id}`,
        type: "view_destination",
        label: isKn ? `${d.kannadaName} ವಿವರ ವೀಕ್ಷಿಸಿ` : `View ${d.name} Details`,
        labelKn: `${d.kannadaName} ವಿವರ ವೀಕ್ಷಿಸಿ`,
        destinationId: d.id,
        payload: { destinationId: d.id },
      });
    }

    if (isKn) {
      return {
        text: `### ${base.kannadaName} ಸುತ್ತಮುತ್ತಲಿನ ಪ್ರಮುಖ ಗಮ್ಯಸ್ಥಾನಗಳು:

${nearby
  .map(
    (d) =>
      `* **${d.kannadaName} (${d.district} ಜಿಲ್ಲೆ · ${d.region}):** ${d.description.slice(0, 115)}...
  * *ಸೂಕ್ತ ಕಾಲ:* ${d.bestSeason} · *ವಿಭಾಗ:* ${d.categoryLabel}`
  )
  .join("\n\n")}

${base.kannadaName} ಜೊತೆಗೆ ಇವುಗಳಲ್ಲಿ ಯಾವುದನ್ನಾದರೂ ಸೇರಿಸಿ ನಿಮ್ಮ ಪ್ರವಾಸವನ್ನು ವಿಸ್ತರಿಸಬಹುದು. ವಿವರಗಳಿಗೆ ಕೆಳಗಿನ ಬಟನ್‌ಗಳನ್ನು ಬಳಸಿ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### Handpicked Destinations Near ${base.name} (${base.kannadaName}):

${nearby
  .map(
    (d) =>
      `* **${d.name} (${d.kannadaName} · ${d.district} District):** ${d.description.slice(0, 120)}...
  * *Best Season:* ${d.bestSeason} · *Category:* ${d.categoryLabel}`
  )
  .join("\n\n")}

You can combine any of these with ${base.name} for an enriched multi-day Karnataka circuit. Click below to inspect their full itineraries and transit tips.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // ── 12. INTERESTS INTENT ("nature and adventure", "beaches", "heritage", "wildlife") ──
  const isNature = qNorm.includes("nature") || qNorm.includes("adventure") || qNorm.includes("ಪ್ರಕೃತಿ") || qNorm.includes("ಸಾಹಸ");
  const isHeritage = qNorm.includes("heritage") || qNorm.includes("temple") || qNorm.includes("ದೇವಾಲಯ");
  const isBeach = qNorm.includes("beach") || qNorm.includes("coastal") || qNorm.includes("sea") || qNorm.includes("ಕಡಲತೀರ");
  const isWildlife = qNorm.includes("wildlife") || qNorm.includes("safari") || qNorm.includes("tiger") || qNorm.includes("ವನ್ಯಜೀವಿ");

  if (isNature || isHeritage || isBeach || isWildlife) {
    let targetCat: ExperienceCategoryId = "nature";
    let titleEn = "Nature & Western Ghats Destinations";
    let titleKn = "ಪ್ರಕೃತಿ ಮತ್ತು ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ತಾಣಗಳು";
    if (isHeritage) {
      targetCat = "heritage";
      titleEn = "Heritage & Historical Monument Destinations";
      titleKn = "ಪ್ರಾಚೀನ ಪರಂಪರೆ ಮತ್ತು ಶಿಲ್ಪಕಲೆಯ ತಾಣಗಳು";
    } else if (isBeach) {
      targetCat = "coastal";
      titleEn = "Coastal Karnataka & Pristine Beach Destinations";
      titleKn = "ಕರಾವಳಿ ಕರ್ನಾಟಕ ಮತ್ತು ಸಮುದ್ರ ತೀರಗಳು";
    } else if (isWildlife) {
      targetCat = "wildlife";
      titleEn = "Wildlife Sanctuaries & Safari Reserves";
      titleKn = "ವನ್ಯಜೀವಿ ಸಂರಕ್ಷಣಾ ತಾಣಗಳು ಮತ್ತು ಸಫಾರಿ";
    }

    const filtered = DESTINATIONS.filter(
      (d) => d.category === targetCat || d.categories.includes(targetCat)
    );

    for (const d of filtered.slice(0, 3)) {
      actions.push({
        id: `interest-dest-${d.id}`,
        type: "view_destination",
        label: isKn ? `${d.kannadaName} ವಿವರ` : `View ${d.name}`,
        labelKn: `${d.kannadaName} ವಿವರ`,
        destinationId: d.id,
        payload: { destinationId: d.id },
      });
    }

    if (isKn) {
      return {
        text: `### ${titleKn}:

${filtered
  .map(
    (d) =>
      `* **${d.kannadaName} (${d.district} ಜಿಲ್ಲೆ · ${d.region}):** ${d.description.slice(0, 110)}... (ಸೂಕ್ತ ಕಾಲ: ${d.bestSeason})`
  )
  .join("\n")}

ಮೇಲಿನ ಯಾವುದೇ ಗಮ್ಯಸ್ಥಾನದ ಸಂಪೂರ್ಣ ವಿವರಗಳನ್ನು ನೋಡಲು ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### ${titleEn}:

${filtered
  .map(
    (d) =>
      `* **${d.name} (${d.kannadaName} · ${d.district} District):** ${d.description.slice(0, 120)}... *(Best Season: ${d.bestSeason})*`
  )
  .join("\n")}

Click below to inspect any destination's complete cultural notes, highlights, and transit tips.`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // ── 13. SINGLE DESTINATION DEEP DIVE ("tell me about hampi", "history of badami", etc.) ──
  if (mentionedDests.length === 1) {
    const d = mentionedDests[0];
    actions.push({
      id: `view-single-${d.id}`,
      type: "view_destination",
      label: isKn ? `${d.kannadaName} ವಿವರ ವೀಕ್ಷಿಸಿ` : `View ${d.name} Details`,
      labelKn: `${d.kannadaName} ವಿವರ ವೀಕ್ಷಿಸಿ`,
      destinationId: d.id,
      payload: { destinationId: d.id },
    });
    actions.push({
      id: `plan-single-${d.id}`,
      type: "plan_destination",
      label: isKn ? `${d.kannadaName} ಗೆ ಪ್ರವಾಸ ರೂಪಿಸಿ` : `Plan Trip with ${d.name}`,
      labelKn: `${d.kannadaName} ಗೆ ಪ್ರವಾಸ ರೂಪಿಸಿ`,
      destinationId: d.id,
      payload: { destinationId: d.id },
    });

    if (isKn) {
      return {
        text: `### ${d.kannadaName} (${d.name}) — ${d.tag}:

* **ಸ್ಥಳ ಮತ್ತು ಜಿಲ್ಲೆ:** ${d.district} (${d.region})
* **ವಿಭಾಗ:** ${d.categoryLabel}
* **ಪ್ರಮುಖ ಆಕರ್ಷಣೆಗಳು:** ${d.highlights.join(", ")}
* **ಸೂಕ್ತ ಪ್ರವಾಸ ಅವಧಿ:** ${d.idealDuration}
* **ಭೇಟಿಗೆ ಉತ್ತಮ ಕಾಲ:** ${d.bestSeason}
* **ಅಂದಾಜು ದೈನಂದಿನ ಬಜೆಟ್:** ${d.estimatedDailyBudget} (${d.budgetTier})

**ಸಾಂಸ್ಕೃತಿಕ ಮಾಹಿತಿ:**
${d.culturalNote}

**ಪ್ರಯಾಣ ಸಲಹೆ:**
${d.transitTip}

*(ಗಮನಿಸಿ: ಅಧಿಕೃತ ಪ್ರವೇಶ ಸಮಯ ಮತ್ತು ನಿರ್ದಿಷ್ಟ ಶುಲ್ಕಗಳ ವಿವರಕ್ಕಾಗಿ ASI / ಪ್ರವಾಸೋದ್ಯಮ ಇಲಾಖೆಯ ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಗಮನಿಸಿ).*`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }

    return {
      text: `### ${d.name} (${d.kannadaName}) — ${d.tag}:

* **Location:** ${d.district} District (${d.region})
* **Category:** ${d.categoryLabel}
* **Key Highlights:** ${d.highlights.join(", ")}
* **Ideal Duration:** ${d.idealDuration}
* **Best Season to Visit:** ${d.bestSeason}
* **Estimated Daily Budget:** ${d.estimatedDailyBudget} (${d.budgetTier} tier)

**Cultural Context:**
${d.culturalNote}

**Transit & Practical Advice:**
${d.transitTip}

*(Practical Note: Exact monument timings and tickets are governed by the Archaeological Survey of India (ASI) or local temple trusts; verify on official portals before visiting).*`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  // ── 14. CURRENT CONTEXT / ITINERARY / PLANNER STATUS ──
  if (
    qNorm.includes("current") ||
    qNorm.includes("my trip") ||
    qNorm.includes("planned") ||
    qNorm.includes("today") ||
    qNorm.includes("ನನ್ನ ಪ್ರವಾಸ")
  ) {
    if (context.plannerPrefs) {
      const p = context.plannerPrefs;
      actions.push({
        id: "context-nav-planner",
        type: "navigate_planner",
        label: isKn ? "ಪ್ರವಾಸ ಯೋಜಕಕ್ಕೆ ಹೋಗಿ" : "Open Trip Planner",
        labelKn: "ಪ್ರವಾಸ ಯೋಜಕಕ್ಕೆ ಹೋಗಿ",
        payload: { sectionId: "planner" },
      });

      if (isKn) {
        return {
          text: `### ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಪ್ರವಾಸ ಯೋಜನೆ:
* **ಆರಂಭಿಕ ಸ್ಥಳ:** ${p.startingLocation}
* **ಅವಧಿ:** ${p.durationDays} ದಿನಗಳು
* **ಬಜೆಟ್ ಶ್ರೇಣಿ:** ${p.budget}
* **ಪ್ರಯಾಣ ಶೈಲಿ:** ${p.travelStyle}
* **ಪ್ರವಾಸಿಗರ ಸಂಖ್ಯೆ:** ${p.travellerCount} (${p.groupType})
* **ಆಸಕ್ತಿಗಳು:** ${p.interests.join(", ") || "ಎಲ್ಲವೂ"}

ಈ ಆದ್ಯತೆಗಳ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ವಿವರವಾದ ವೇಳಾಪಟ್ಟಿ ಪ್ರವಾಸ ಯೋಜಕದಲ್ಲಿ ಲಭ್ಯವಿದೆ.`,
          source: "knowledge-engine",
          sourceDescription,
          actions,
        };
      }

      return {
        text: `### Your Current Trip Preferences:
* **Origin:** ${p.startingLocation}
* **Duration:** ${p.durationDays} Days
* **Budget Tier:** ${p.budget}
* **Travel Style:** ${p.travelStyle}
* **Party Size:** ${p.travellerCount} (${p.groupType})
* **Interests:** ${p.interests.join(", ") || "All categories"}

Your personalized itinerary is active in the Smart Trip Planner below.`,
        source: "knowledge-engine",
        sourceDescription,
        actions,
      };
    }
  }

  // ── 15. DEFAULT / HONEST UNGROUNDED FALLBACK ──
  actions.push({
    id: "action-suggest-3day",
    type: "set_duration",
    label: isKn ? "3 ದಿನಗಳ ಪ್ರವಾಸ ಸಲಹೆ" : "Suggest a 3-Day Trip",
    labelKn: "3 ದಿನಗಳ ಪ್ರವಾಸ ಸಲಹೆ",
    payload: { durationDays: 3 },
  });
  actions.push({
    id: "action-compare-hampi-mysuru",
    type: "navigate_planner",
    label: isKn ? "ಹಂಪಿ ಮತ್ತು ಮೈಸೂರು ಹೋಲಿಕೆ" : "Compare Hampi & Mysuru",
    labelKn: "ಹಂಪಿ ಮತ್ತು ಮೈಸೂರು ಹೋಲಿಕೆ",
  });

  if (isKn) {
    return {
      text: `ಯಾತ್ರಿಯಾನ್ AI ಸ್ಥಳೀಯ ಮಾರ್ಗದರ್ಶಿಗೆ ಸ್ವಾಗತ! ನಾನು ಪರಿಶೀಲಿಸಿದ ಕರ್ನಾಟಕ ಪ್ರವಾಸ ಡೇಟಾಸೆಟ್‌ನಿಂದ ಮಾಹಿತಿ ನೀಡುತ್ತೇನೆ.

ನಾನು ಈ ಕೆಳಗಿನ ವಿಷಯಗಳಲ್ಲಿ ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಬಲ್ಲೆ:
* **11 ಪ್ರಮುಖ ಗಮ್ಯಸ್ಥಾನಗಳು:** ಹಂಪಿ, ಮೈಸೂರು, ಕೊಡಗು, ಗೋಕರ್ಣ, ಚಿಕ್ಕಮಗಳೂರು, ಬಂಡೀಪುರ, ಬಾದಾಮಿ, ಬೇಲೂರು, ಉಡುಪಿ, ಜೋಗ ಜಲಪಾತ, ದಾಂಡೇಲಿ.
* **ಸ್ಥಳಗಳ ಹೋಲಿಕೆ & ಪರ್ಯಾಯಗಳು:** ಉದಾ: "ಹಂಪಿ ಮತ್ತು ಮೈಸೂರು ಹೋಲಿಕೆ", "ಜನದಟ್ಟಣೆ ಕಡಿಮೆ ಇರುವ ತಾಣಗಳು".
* **ಪ್ಯಾಕಿಂಗ್ & ತಯಾರಿ:** ಉದಾ: "ಕೊಡಗು ಪ್ರವಾಸಕ್ಕೆ ಏನು ಬಟ್ಟೆ ಕೊಂಡೊಯ್ಯಬೇಕು?".
* **ಬಹುಭಾಷಾ ಸಂವಹನ ಪದಗಳು:** ಕನ್ನಡ, ಹಿಂದಿ, ತೆಲುಗು ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಸಂವಹನ ಸಲಹೆಗಳು.
* **ಸ್ಥಳೀಯ ಊಟ ಮತ್ತು ಸಂಸ್ಕೃತಿ:** ಕರಾವಳಿ, ಮಲೆನಾಡು ಹಾಗೂ ಉತ್ತರ ಕರ್ನಾಟಕದ ಆಹಾರ ವಿಶೇಷತೆಗಳು.
* **ದೇವಸ್ಥಾನಗಳ ಶಿಷ್ಟಾಚಾರ ಮತ್ತು ಸುರಕ್ಷತೆ:** ಅಧಿಕೃತ ನಿಯಮಗಳು ಹಾಗೂ ಸುರಕ್ಷತಾ ಮಾರ್ಗದರ್ಶನ.

ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಈ ವಿಷಯಗಳ ಸುತ್ತ ಕೇಳಿ!`,
      source: "knowledge-engine",
      sourceDescription,
      actions,
    };
  }

  return {
    text: `Welcome to Yatrion AI — Your Comprehensive Karnataka Local Guide!

I can assist you with:
* **11 Curated Karnataka Destinations:** Hampi, Mysuru, Coorg, Gokarna, Chikmagalur, Bandipur, Badami, Belur, Udupi, Jog Falls, and Dandeli.
* **Packing & Preparation Guidance:** e.g., *"What should I pack for Coorg?"* or *"Monsoon packing checklist"*.
* **Multilingual Travel Phrases:** Useful communication in **Kannada**, **Telugu**, **Hindi**, and **English**.
* **Temple Etiquette & Sacred Customs:** Sacred attire rules and pradakshina guidelines.
* **Offbeat & Peaceful Alternatives:** e.g., *"I prefer less crowded places"*.
* **Regional Food Trails:** Coastal Udupi satvik thalis, Malnad filter coffee, Mysore pak, and North Karnataka Jolada Rotti.
* **Visitor Safety & Emergency Reminders:** Statewide helpline **112**, Western Ghats monsoon driving, and wildlife safari etiquette.

Feel free to pick one of the suggestions below or ask a specific question!`,
    source: "knowledge-engine",
    sourceDescription,
    actions,
  };
}
