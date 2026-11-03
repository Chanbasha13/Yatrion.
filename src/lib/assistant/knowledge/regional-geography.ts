/**
 * Karnataka Regional Geography & Offbeat Alternatives Knowledge Module
 */

export interface RegionalZone {
  id: string;
  nameEn: string;
  nameKn: string;
  landscapeDescriptionEn: string;
  landscapeDescriptionKn: string;
  climateOverviewEn: string;
  climateOverviewKn: string;
  prominentDistricts: string[];
}

export const KARNATAKA_REGIONAL_ZONES: RegionalZone[] = [
  {
    id: "north",
    nameEn: "North Karnataka (Bayaluseeme / Semi-Arid Plains)",
    nameKn: "ಉತ್ತರ ಕರ್ನಾಟಕ (ಬಯಲು ಸೀಮೆ)",
    landscapeDescriptionEn:
      "Vast boulder-strewn horizons, weathered granite plateaus, Krishna and Tungabhadra river basins, and black cotton soil. Home to ancient Chalukya, Rashtrakuta, and Vijayanagara capitals.",
    landscapeDescriptionKn:
      "ವಿಶಾಲ ಕಲ್ಲಿನ ಬಂಡೆಗಳು, ಕೃಷ್ಣಾ ಮತ್ತು ತುಂಗಭದ್ರಾ ನದಿ ಬಯಲು ಹಾಗೂ ಕಪ್ಪು ಮಣ್ಣಿನ ಭೂಮಿ. ಬಾದಾಮಿ ಚಾಲುಕ್ಯರು ಮತ್ತು ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯದ ಹೆಮ್ಮೆಯ ನೆಲೆಬೀಡು.",
    climateOverviewEn: "Warm, dry continental climate. Ideal visiting window: October to March; hot summer days April to May.",
    climateOverviewKn: "ಉಷ್ಣ ಮತ್ತು ಒಣ ಹವೆ. ಭೇಟಿಗೆ ಅತ್ಯುತ್ತಮ ಕಾಲ: ಅಕ್ಟೋಬರ್‌ನಿಂದ ಮಾರ್ಚ್.",
    prominentDistricts: ["Vijayanagara", "Bagalkote", "Belagavi", "Dharwad", "Vijayapura", "Koppal"],
  },
  {
    id: "malnad",
    nameEn: "Malnad & Western Ghats (Sahyadri Highlands)",
    nameKn: "ಮಲೆನಾಡು ಮತ್ತು ಪಶ್ಚಿಮ ಘಟ್ಟಗಳು (ಸಹ್ಯಾದ್ರಿ ಶ್ರೇಣಿ)",
    landscapeDescriptionEn:
      "Evergreen tropical rainforests, cloud-cloaked Shola grasslands, terraced shade-grown coffee plantations, and roaring waterfalls fed by monsoon torrents.",
    landscapeDescriptionKn:
      "ನಿತ್ಯಹರಿದ್ವರ್ಣ ಕಾಡುಗಳು, ಶೋಲಾ ಹುಲ್ಲುಗಾವಲುಗಳು, ಕಾಫಿ ಮತ್ತು ಸಾಂಬಾರ ಪದಾರ್ಥಗಳ ತೋಟಗಳು ಹಾಗೂ ಜಲಪಾತಗಳ ನಾಡು.",
    climateOverviewEn: "Heavy monsoon rains June to September; cool, pleasant, misty winters November to February.",
    climateOverviewKn: "ಜೂನ್‌ನಿಂದ ಸೆಪ್ಟೆಂಬರ್‌ವರೆಗೆ ಭಾರಿ ಮಳೆ; ನವೆಂಬರ್‌ನಿಂದ ಫೆಬ್ರವರಿಯವರೆಗೆ ಅತ್ಯಹ್ಲಾದಕರ ತಂಪು ಹವೆ.",
    prominentDistricts: ["Kodagu", "Chikkamagaluru", "Shivamogga", "Hassan"],
  },
  {
    id: "coastal",
    nameEn: "Coastal Karnataka (Karavali Coast)",
    nameKn: "ಕರಾವಳಿ ಕರ್ನಾಟಕ",
    landscapeDescriptionEn:
      "Pristine golden sand beaches along the Arabian Sea, lush coconut groves, tidal estuaries, and historic pilgrimage towns where Western Ghats plunge into the ocean.",
    landscapeDescriptionKn:
      "ಅರಬ್ಬಿ ಸಮುದ್ರದ ತೀರ, ತೆಂಗಿನ ತೋಟಗಳು ಮತ್ತು ಪಶ್ಚಿಮ ಘಟ್ಟಗಳು ಸಮುದ್ರವನ್ನು ಸಂಧಿಸುವ ರಮಣೀಯ ಕರಾವಳಿ.",
    climateOverviewEn: "Tropical and humid year-round; sparkling clear skies October through March; torrential rains June to August.",
    climateOverviewKn: "ಉಷ್ಣವಲಯದ ಕರಾವಳಿ ಹವೆ; ಅಕ್ಟೋಬರ್‌ನಿಂದ ಮಾರ್ಚ್‌ವರೆಗೆ ಪ್ರವಾಸಕ್ಕೆ ಸೂಕ್ತ.",
    prominentDistricts: ["Uttara Kannada", "Udupi", "Dakshina Kannada"],
  },
  {
    id: "south",
    nameEn: "South Karnataka & Old Mysore Plains",
    nameKn: "ದಕ್ಷಿಣ ಕರ್ನಾಟಕ ಮತ್ತು ಹಳೆಯ ಮೈಸೂರು ಪ್ರಾಂತ್ಯ",
    landscapeDescriptionEn:
      "Gentle rolling agrarian plains nourished by the sacred Cauvery River, royal palace gardens, and silk and sandalwood cottage clusters.",
    landscapeDescriptionKn:
      "ಕಾವೇರಿ ನದಿ ಕಣಿವೆಯ ಫಲವತ್ತಾದ ಕೃಷಿ ಭೂಮಿ, ರೇಷ್ಮೆ ಮತ್ತು ಶ್ರೀಗಂಧದ ನಾಡು.",
    climateOverviewEn: "Moderate, pleasant climate throughout the year with balmy winters.",
    climateOverviewKn: "ವರ್ಷವಿಡೀ ಹಿತಕರವಾದ ವಾತಾವರಣ.",
    prominentDistricts: ["Mysuru", "Mandya", "Hassan", "Chamarajanagar", "Bengaluru"],
  },
];

export interface OffbeatAlternative {
  popularPlace: string;
  popularPlaceKn: string;
  peacefulAlternative: string;
  peacefulAlternativeKn: string;
  reasonEn: string;
  reasonKn: string;
  destinationId: string;
}

export const LESS_CROWDED_ALTERNATIVES: OffbeatAlternative[] = [
  {
    popularPlace: "Coorg Main Town & Abbey Falls (Crowded weekends)",
    popularPlaceKn: "ಮಡಿಕೇರಿ ಮತ್ತು ಅಬ್ಬಿ ಜಲಪಾತ (ವಾರಾಂತ್ಯದ ಜನದಟ್ಟಣೆ)",
    peacefulAlternative: "Chikmagalur Highlands & Kemmangundi Trails",
    peacefulAlternativeKn: "ಚಿಕ್ಕಮಗಳೂರು ಮತ್ತು ಕೆಮ್ಮಣ್ಣುಗುಂಡಿ ಪ್ರಶಾಂತ ತೋಟಗಳು",
    reasonEn: "Offers equally majestic cloud-topped coffee ridges, Mullayanagiri peak walks, and much quieter estate homestays.",
    reasonKn: "ಕೊಡಗಿನಷ್ಟೇ ಸುಂದರವಾದ ಮಂಜಿನ ಪರ್ವತಗಳು ಮತ್ತು ಶಾಂತಿಯುತ ಕಾಫಿ ತೋಟದ ಹೋಂಸ್ಟೇಗಳು.",
    destinationId: "chikmagalur",
  },
  {
    popularPlace: "Gokarna Main Beach & Kudle Beach",
    popularPlaceKn: "ಗೋಕರ್ಣ ಮುಖ್ಯ ಕಡಲತೀರ",
    peacefulAlternative: "Udupi Kaup Beach & Padubidri Blue Flag Beach",
    peacefulAlternativeKn: "ಉಡುಪಿಯ ಕಾಪು ಲೈಟ್‌ಹೌಸ್ ಮತ್ತು ಪಡುಬಿದ್ರಿ ಬ್ಲೂ ಫ್ಲ್ಯಾಗ್ ಬೀಚ್",
    reasonEn: "Uncrowded, certified clean golden sands, historic century-old lighthouse, and tranquil sunset views.",
    reasonKn: "ಅತ್ಯಂತ ಸ್ವಚ್ಛವಾದ ಕಡಲತೀರ, ನೂರು ವರ್ಷಗಳ ಹಳೆಯ ಲೈಟ್‌ಹೌಸ್ ಹಾಗೂ ಪ್ರಶಾಂತ ವಾತಾವರಣ.",
    destinationId: "udupi",
  },
  {
    popularPlace: "Hampi Bazaar & Vittala Complex (Peak Afternoon Hours)",
    popularPlaceKn: "ಹಂಪಿ ಬಜಾರ್ (ಮಧ್ಯಾಹ್ನದ ಜನದಟ್ಟಣೆ)",
    peacefulAlternative: "Badami Sandstone Caves & Pattadakal UNESCO Cluster",
    peacefulAlternativeKn: "ಬಾದಾಮಿ ಗುಹಾಂತರ ದೇವಾಲಯಗಳು ಮತ್ತು ಪಟ್ಟದಕಲ್ಲು",
    reasonEn: "Intimate 6th-century rock-cut monuments, serene Agastya Lake views, and significantly lighter tourist crowds.",
    reasonKn: "6ನೇ ಶತಮಾನದ ಅದ್ಭುತ ಗುಹೆಗಳು, ಅಗಸ್ತ್ಯ ತೀರ್ಥ ಸರೋವರ ಹಾಗೂ ಕಡಿಮೆ ಜನದಟ್ಟಣೆಯ ಅನುಭವ.",
    destinationId: "badami",
  },
];

