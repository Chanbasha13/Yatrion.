/**
 * Genuine Geographic Data & Verified Landmark Coordinates for Karnataka
 * Geodetic Bounds: 11.5°N - 18.5°N, 74.0°E - 78.5°E
 */

export interface VerifiedLandmark {
  id: string;
  nameEn: string;
  nameKn: string;
  districtEn: string;
  districtKn: string;
  biome: "coastal" | "rainforest" | "deccan" | "plains";
  biomeLabelEn: string;
  biomeLabelKn: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  categoryEn: string;
  categoryKn: string;
  image: string;
  verifiedSource: string;
  summaryEn: string;
  summaryKn: string;
}

export const KARNATAKA_LANDMARKS: VerifiedLandmark[] = [
  {
    id: "mullayanagiri",
    nameEn: "Mullayanagiri Peak",
    nameKn: "ಮುಳ್ಳಯ್ಯನಗಿರಿ ಶಿಖರ",
    districtEn: "Chikkamagaluru",
    districtKn: "ಚಿಕ್ಕಮಗಳೂರು",
    biome: "rainforest",
    biomeLabelEn: "Sahyadri Highlands",
    biomeLabelKn: "ಸಹ್ಯಾದ್ರಿ ಗಿರಿ ಶ್ರೇಣಿ",
    lat: 13.3912,
    lng: 75.7214,
    elevationMeters: 1930,
    categoryEn: "Highest Peak in Karnataka",
    categoryKn: "ಕರ್ನಾಟಕದ ಅತ್ಯುನ್ನತ ಶಿಖರ",
    image: "/images/destinations/chikmagalur.jpg",
    verifiedSource: "Survey of India Geodetic Record",
    summaryEn: "1,930m summit offering sweeping 360-degree views of the Western Ghats shola grasslands.",
    summaryKn: "1,930 ಮೀಟರ್ ಎತ್ತರದ ಗಿರಿ ಶಿಖರ, ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಶೋಲಾ ಹುಲ್ಲುಗಾವಲುಗಳ ರಮಣೀಯ ನೋಟ.",
  },
  {
    id: "jog-falls",
    nameEn: "Jog Falls Chasm",
    nameKn: "ಜೋಗ ಜಲಪಾತ ಕಂದಕ",
    districtEn: "Shivamogga",
    districtKn: "ಶಿವಮೊಗ್ಗ",
    biome: "rainforest",
    biomeLabelEn: "Sahyadri Rainforests",
    biomeLabelKn: "ಸಹ್ಯಾದ್ರಿ ಮಳೆಕಾಡು",
    lat: 14.2285,
    lng: 74.8123,
    elevationMeters: 472,
    categoryEn: "Canyon Plunge Waterfall (253m drop)",
    categoryKn: "ಕಂದಕ ಜಲಪಾತ (253 ಮೀ ಧುಮುಕು)",
    image: "/images/destinations/jogfalls.jpg",
    verifiedSource: "Karnataka Forest Department Survey",
    summaryEn: "Segmented plunge waterfall dropping 253 meters in the dense Sharavathi river valley.",
    summaryKn: "ಶರಾವತಿ ನದಿ ಕಣಿವೆಯಲ್ಲಿ 253 ಮೀಟರ್ ಆಳಕ್ಕೆ ಧುಮುಕುವ ಪ್ರಸಿದ್ಧ ಜಲಪಾತ.",
  },
  {
    id: "st-marys-island",
    nameEn: "St. Mary's Basaltic Island",
    nameKn: "ಸೇಂಟ್ ಮೇರೀಸ್ ದ್ವೀಪ",
    districtEn: "Udupi",
    districtKn: "ಉಡುಪಿ",
    biome: "coastal",
    biomeLabelEn: "Karavali Coast & Islands",
    biomeLabelKn: "ಕರಾವಳಿ ತೀರ ಮತ್ತು ದ್ವೀಪ",
    lat: 13.3792,
    lng: 74.6733,
    elevationMeters: 10,
    categoryEn: "National Geological Monument (Columnar Basalt)",
    categoryKn: "ರಾಷ್ಟ್ರೀಯ ಭೂವೈಜ್ಞಾನಿಕ ಸ್ಮಾರಕ",
    image: "/images/destinations/gokarna.jpg",
    verifiedSource: "Geological Survey of India (GSI)",
    summaryEn: "Hexagonal columnar basalt rock formations formed by prehistoric sub-aerial volcanic activity.",
    summaryKn: "ಪ್ರಾಗೈತಿಹಾಸಿಕ ಜ್ವಾಲಾಮುಖಿ ಚಟುವಟಿಕೆಯಿಂದ ರೂಪುಗೊಂಡ ಷಟ್ಕೋನ ಲಾವಾ ಬಂಡೆಗಳು.",
  },
  {
    id: "chitradurga-fort",
    nameEn: "Chitradurga Kallina Kote",
    nameKn: "ಚಿತ್ರದುರ್ಗದ ಕಲ್ಲಿನ ಕೋಟೆ",
    districtEn: "Chitradurga",
    districtKn: "ಚಿತ್ರದುರ್ಗ",
    biome: "plains",
    biomeLabelEn: "Central Plains & Bastions",
    biomeLabelKn: "ಬಯಲು ಸೀಮೆಯ ಕೋಟೆಗಳು",
    lat: 14.2185,
    lng: 76.398,
    elevationMeters: 732,
    categoryEn: "Seven-Walled Stone Mountain Citadel",
    categoryKn: "ಏಳು ಸುತ್ತಿನ ಕಲ್ಲಿನ ಕೋಟೆ",
    image: "/images/destinations/badami.jpg",
    verifiedSource: "Archaeological Survey of India (ASI)",
    summaryEn: "Impenetrable seven-walled stone hill fortress with ingenious rainwater harvesting moats.",
    summaryKn: "ಪ್ರಾಚೀನ ಜಲಸಂಗ್ರಹಣಾ ಹೊಂಡಗಳು ಮತ್ತು ಕಲ್ಲಿನ ಕೊತ್ತಲಗಳನ್ನು ಹೊಂದಿರುವ ಏಳು ಸುತ್ತಿನ ಕೋಟೆ.",
  },
  {
    id: "yana-rocks",
    nameEn: "Yana Monolithic Rocks",
    nameKn: "ಯಾಣದ ಕಪ್ಪು ಶಿಖರಗಳು",
    districtEn: "Uttara Kannada",
    districtKn: "ಉತ್ತರ ಕನ್ನಡ",
    biome: "rainforest",
    biomeLabelEn: "Sahyadri Rainforests",
    biomeLabelKn: "ಸಹ್ಯಾದ್ರಿ ಮಳೆಕಾಡು",
    lat: 14.5492,
    lng: 74.5619,
    elevationMeters: 310,
    categoryEn: "Solid Black Limestone Caverns",
    categoryKn: "ಕಪ್ಪು ಸುಣ್ಣದ ಕಲ್ಲಿನ ಶಿಖರಗಳು",
    image: "/images/destinations/dandeli.jpg",
    verifiedSource: "Karnataka Biodiversity Board",
    summaryEn: "Two towering karst rock monoliths (Bhairaveshwara & Mohini) surrounded by pristine evergreen jungle.",
    summaryKn: "ನಿತ್ಯಹರಿದ್ವರ್ಣ ಕಾಡಿನ ನಡುವೆ ಎದ್ದು ನಿಂತಿರುವ ಎರಡು ಕಪ್ಪು ಶಿಲಾ ಶಿಖರಗಳು.",
  },
  {
    id: "hampi-boulders",
    nameEn: "Hampi Granitic Tors",
    nameKn: "ಹಂಪಿಯ ಶಿಲಾ ಬೆಟ್ಟಗಳು",
    districtEn: "Vijayanagara",
    districtKn: "ವಿಜಯನಗರ",
    biome: "deccan",
    biomeLabelEn: "Deccan Granite Landscapes",
    biomeLabelKn: "ಡೆಕ್ಕನ್ ಶಿಲಾ ಪರಿಸರ",
    lat: 15.335,
    lng: 76.46,
    elevationMeters: 467,
    categoryEn: "Prehistoric Granitic Boulders & Gorges",
    categoryKn: "ಪುರಾತನ ಶಿಲಾ ಬೆಟ್ಟಗಳು ಮತ್ತು ಕಂದಕ",
    image: "/images/destinations/hampi.jpg",
    verifiedSource: "UNESCO / ASI Vijayanagara Documentation",
    summaryEn: "Giant balancing granitic boulders sculpted over billions of years along the Tungabhadra river valley.",
    summaryKn: "ತುಂಗಭದ್ರಾ ನದಿ ತೀರದಲ್ಲಿ ನೈಸರ್ಗಿಕವಾಗಿ ಸಮತೋಲನದಲ್ಲಿ ನಿಂತಿರುವ ಪುರಾತನ ಬಂಡೆಗಲ್ಲುಗಳು.",
  },
];

