import { KARNATAKA_ATTRACTIONS } from "../routes/route-estimates";
import { KARNATAKA_EXPERIENCES } from "../discovery/experiences";
import type {
  TravellerProfile,
  GroupActivitySuggestion,
  GroupDecisionTag,
  GroupDecisionStatus,
} from "./group-types";
import { aggregateAccessibilityRequirements } from "./group-preferences";

interface GenerateGroupActivitiesParams {
  destinationIds: string[];
  travellers: TravellerProfile[];
  existingDecisions?: Record<string, GroupDecisionStatus>;
}

/**
 * Generates transparent group activity suggestions categorized by consensus,
 * compromise, and subgroup-optional tags.
 */
export function generateGroupActivitySuggestions({
  destinationIds,
  travellers,
  existingDecisions = {},
}: GenerateGroupActivitiesParams): GroupActivitySuggestion[] {
  if (!destinationIds || destinationIds.length === 0 || !travellers || travellers.length === 0) {
    return [];
  }

  const activeAccessibility = aggregateAccessibilityRequirements(travellers);
  const totalTravellers = travellers.length;
  const suggestions: GroupActivitySuggestion[] = [];

  // 1. Process Signature Attractions from destinations
  for (const att of KARNATAKA_ATTRACTIONS) {
    if (destinationIds.includes(att.destinationId)) {
      // Find matching travellers
      const matchedTravellers = travellers.filter((t) => {
        if (att.category === "heritage" && t.interests.includes("heritage")) return true;
        if (att.category === "nature" && (t.interests.includes("nature") || t.interests.includes("wildlife"))) return true;
        if (att.category === "cultural" && (t.interests.includes("heritage") || t.interests.includes("spiritual"))) return true;
        if (att.category === "spiritual" && t.interests.includes("spiritual")) return true;
        if (att.category === "scenic" && (t.interests.includes("nature") || t.interests.includes("hills") || t.interests.includes("beaches"))) return true;
        if (att.category === "adventure" && t.interests.includes("adventure")) return true;
        if (att.category === "coastal" && t.interests.includes("beaches")) return true;
        return false;
      });

      const matchRatio = matchedTravellers.length / totalTravellers;
      let suitabilityScore = Math.round(matchRatio * 70) + 20;

      // Accessibility assessment
      let isAccessible = true;
      let accNoteEn: string | undefined;
      let accNoteKn: string | undefined;

      if (activeAccessibility.includes("wheelchair") || activeAccessibility.includes("step_free")) {
        if (att.category === "adventure" || att.name.toLowerCase().includes("trek") || att.name.toLowerCase().includes("peak")) {
          isAccessible = false;
          suitabilityScore = Math.max(10, suitabilityScore - 25);
          accNoteEn = "Steep terrain or steps may be difficult for members with mobility requirements.";
          accNoteKn = "ಕಡಿದಾದ ಹಾದಿ ಅಥವಾ ಮೆಟ್ಟಿಲುಗಳು ಇರುವುದರಿಂದ ಚಲನಶೀಲತೆಯ ಮಿತಿ ಇರುವವರಿಗೆ ಕಷ್ಟವಾಗಬಹುದು.";
        }
      }

      // Tag determination
      let decisionTag: GroupDecisionTag = "group_consensus";
      if (!isAccessible) {
        decisionTag = "subgroup_optional";
      } else if (matchRatio >= 0.6) {
        decisionTag = "group_consensus";
      } else if (matchRatio >= 0.4) {
        decisionTag = "compromise";
      } else if (matchedTravellers.length === 1) {
        decisionTag = "individual_preference";
      } else {
        decisionTag = "subgroup_optional";
      }

      const defaultStatus: GroupDecisionStatus =
        existingDecisions[att.id] ||
        (decisionTag === "group_consensus" ? "accepted" : "optional");

      suggestions.push({
        id: att.id,
        titleEn: att.name,
        titleKn: att.kannadaName,
        destinationId: att.destinationId,
        district: att.destinationName,
        category: att.category,
        decisionTag,
        suitabilityScore,
        matchedTravellerIds: matchedTravellers.map((t) => t.id),
        unmatchedTravellerIds: travellers
          .filter((t) => !matchedTravellers.some((m) => m.id === t.id))
          .map((t) => t.id),
        status: defaultStatus,
        reasonEn: `${matchedTravellers.length} of ${totalTravellers} travellers prefer ${att.category} experiences (${Math.round(matchRatio * 100)}% group interest).`,
        reasonKn: `${totalTravellers} ರಲ್ಲಿ ${matchedTravellers.length} ಪ್ರಯಾಣಿಕರು ${att.category} ಅನುಭವಗಳನ್ನು ಬಯಸಿದ್ದಾರೆ (${Math.round(matchRatio * 100)}% ಹೊಂದಾಣಿಕೆ).`,
        isAccessibleForGroup: isAccessible,
        accessibilityNotesEn: accNoteEn,
        accessibilityNotesKn: accNoteKn,
        estimatedCostInr: 0,
        typicalDurationMinutes: att.typicalDurationMinutes,
      });
    }
  }

  // 2. Process Hidden Gems from Part 10 Stage 3
  for (const gem of KARNATAKA_EXPERIENCES) {
    if (destinationIds.includes(gem.associatedDestinationId)) {
      const matchedTravellers = travellers.filter((t) => {
        return gem.tags.some((tag) => (t.interests as readonly string[]).includes(tag));
      });

      const matchRatio = matchedTravellers.length / totalTravellers;
      let suitabilityScore = Math.round(matchRatio * 65) + 25;

      let isAccessible = true;
      let accNoteEn: string | undefined;
      let accNoteKn: string | undefined;

      if (activeAccessibility.includes("wheelchair") && gem.accessibility === "not_accessible") {
        isAccessible = false;
        suitabilityScore = Math.max(10, suitabilityScore - 30);
        accNoteEn = gem.accessibilityNoteEn;
        accNoteKn = gem.accessibilityNoteKn;
      }

      let decisionTag: GroupDecisionTag = "group_consensus";
      if (!isAccessible) {
        decisionTag = "subgroup_optional";
      } else if (matchRatio >= 0.6) {
        decisionTag = "group_consensus";
      } else if (gem.category === "peaceful_alternatives" || matchRatio >= 0.4) {
        decisionTag = "compromise";
      } else {
        decisionTag = "subgroup_optional";
      }

      const defaultStatus: GroupDecisionStatus =
        existingDecisions[gem.id] ||
        (decisionTag === "group_consensus" ? "accepted" : "optional");

      suggestions.push({
        id: gem.id,
        titleEn: gem.titleEn,
        titleKn: gem.titleKn,
        destinationId: gem.associatedDestinationId,
        district: gem.district,
        category: gem.category,
        decisionTag,
        suitabilityScore,
        matchedTravellerIds: matchedTravellers.map((t) => t.id),
        unmatchedTravellerIds: travellers
          .filter((t) => !matchedTravellers.some((m) => m.id === t.id))
          .map((t) => t.id),
        status: defaultStatus,
        reasonEn: `Offbeat Gem: ${matchedTravellers.length} travellers matched. ${gem.whySpecialEn}`,
        reasonKn: `ಅಪರೂಪದ ತಾಣ: ${matchedTravellers.length} ಪ್ರಯಾಣಿಕರಿಗೆ ಹೊಂದಾಣಿಕೆ. ${gem.whySpecialKn}`,
        isAccessibleForGroup: isAccessible,
        accessibilityNotesEn: accNoteEn || gem.accessibilityNoteEn,
        accessibilityNotesKn: accNoteKn || gem.accessibilityNoteKn,
        estimatedCostInr: gem.estimatedCostInr,
        typicalDurationMinutes: gem.visitDurationMinutes,
      });
    }
  }

  // Sort: Accepted first, then highest suitability score
  return suggestions.sort((a, b) => {
    if (a.status === "accepted" && b.status !== "accepted") return -1;
    if (b.status === "accepted" && a.status !== "accepted") return 1;
    return b.suitabilityScore - a.suitabilityScore;
  });
}
