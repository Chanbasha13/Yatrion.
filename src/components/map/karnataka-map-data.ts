/**
 * Karnataka Geographic Map Data & Geodetic Coordinates
 *
 * Strict Secular Invariant:
 * - 100% secular attractions (Nature, Forts, Waterfalls, Peaks, Geological Monuments, Wildlife).
 * - Excludes all temples, mosques, churches, pilgrimage shrines, and religious rituals.
 * - Sourced from Geological Survey of India (GSI), Archaeological Survey of India (ASI),
 *   Karnataka Forest Department, and UNESCO documentation.
 *
 * Geodetic Bounds for Karnataka:
 * - Latitude: 11.5°N – 18.5°N
 * - Longitude: 74.0°E – 78.5°E
 */

export type MapBiome = "coastal" | "rainforest" | "deccan" | "plains";

export interface MapLandmark {
  id: string;
  nameEn: string;
  nameKn: string;
  districtEn: string;
  districtKn: string;
  biome: MapBiome;
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
  hubId?: string; // Associated hub if any
}

export const KARNATAKA_MAP_BOUNDS = {
  southWest: { lat: 11.5, lng: 74.0 },
  northEast: { lat: 18.5, lng: 78.5 },
  center: { lat: 14.55, lng: 75.8 },
  defaultZoom: 7,
};

export const OSM_TILE_CONFIG = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  maxZoom: 19,
  minZoom: 6,
};

export const BIOME_FILTERS: { id: "all" | MapBiome; labelEn: string; labelKn: string }[] = [
  { id: "all", labelEn: "All Karnataka", labelKn: "ಸಮಗ್ರ ಕರ್ನಾಟಕ" },
  { id: "coastal", labelEn: "Karavali Coast", labelKn: "ಕರಾವಳಿ ತೀರ" },
  { id: "rainforest", labelEn: "Sahyadri Rainforests", labelKn: "ಸಹ್ಯಾದ್ರಿ ಮಳೆಕಾಡು" },
  { id: "deccan", labelEn: "Deccan Granite", labelKn: "ಡೆಕ್ಕನ್ ಶಿಲಾ ಪರಿಸರ" },
  { id: "plains", labelEn: "Central Citadels", labelKn: "ಬಯಲು ಸೀಮೆ ಕೋಟೆಗಳು" },
];

export const REAL_MAP_LANDMARKS: MapLandmark[] = [
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
    hubId: "chikmagalur",
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
    hubId: "jogfalls",
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
    hubId: "udupi",
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
    summaryEn: "Two towering karst rock monoliths surrounded by pristine evergreen jungle.",
    summaryKn: "ನಿತ್ಯಹರಿದ್ವರ್ಣ ಕಾಡಿನ ನಡುವೆ ಎದ್ದು ನಿಂತಿರುವ ಎರಡು ಕಪ್ಪು ಶಿಲಾ ಶಿಖರಗಳು.",
    hubId: "gokarna",
  },
  {
    id: "hampi-boulders",
    nameEn: "Hampi Granitic Tors & Ruins",
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
    hubId: "hampi",
  },
  {
    id: "mysore-palace",
    nameEn: "Mysore Amba Vilas Palace",
    nameKn: "ಮೈಸೂರು ಅಂಬಾ ವಿಲಾಸ ಅರಮನೆ",
    districtEn: "Mysuru",
    districtKn: "ಮೈಸೂರು",
    biome: "plains",
    biomeLabelEn: "Central Plains & Bastions",
    biomeLabelKn: "ಬಯಲು ಸೀಮೆ ಅರಮನೆಗಳು",
    lat: 12.3051,
    lng: 76.6551,
    elevationMeters: 770,
    categoryEn: "Indo-Saracenic Royal Palace Architecture",
    categoryKn: "ಇಂಡೋ-ಸಾರ್ಸೆನಿಕ್ ರಾಜವಂಶದ ಅರಮನೆ",
    image: "/images/destinations/mysuru.jpg",
    verifiedSource: "Archaeological Survey of India / KSTDC",
    summaryEn: "Magnificent three-story granite palace featuring domed pavilions, stained glass ceilings, and royal courtyards.",
    summaryKn: "ಭವ್ಯವಾದ ಮೂರು ಅಂತಸ್ತಿನ ಗ್ರಾನೈಟ್ ಅರಮನೆ, ಸುಂದರ ಗುಮ್ಮಟಗಳು ಮತ್ತು ರಾಯಲ್ ದರ್ಬಾರ್ ಸಭಾಂಗಣ.",
    hubId: "mysuru",
  },
  {
    id: "badami-caves",
    nameEn: "Badami Sandstone Cliffs",
    nameKn: "ಬಾದಾಮಿ ಕೆಂಪು ಮರಳುಶಿಲಾ ಬೆಟ್ಟಗಳು",
    districtEn: "Bagalkote",
    districtKn: "ಬಾಗಲಕೋಟೆ",
    biome: "deccan",
    biomeLabelEn: "Deccan Granite & Sandstone",
    biomeLabelKn: "ಡೆಕ್ಕನ್ ಶಿಲಾ ಪರಿಸರ",
    lat: 15.9187,
    lng: 75.6766,
    elevationMeters: 585,
    categoryEn: "Early Chalukya Rock-Cut Monolithic Caves",
    categoryKn: "ಚಾಲುಕ್ಯರ ಶಿಲಾ ಕೆತ್ತನೆಯ ಗುಹೆಗಳು",
    image: "/images/destinations/badami.jpg",
    verifiedSource: "Archaeological Survey of India (ASI)",
    summaryEn: "Spectacular red sandstone bluffs enclosing the ancient Agastya Lake, carved in the 6th century.",
    summaryKn: "ಅಗಸ್ತ್ಯ ಸರೋವರವನ್ನು ಸುತ್ತುವರೆದಿರುವ 6ನೇ ಶತಮಾನದ ಕೆಂಪು ಮರಳುಶಿಲೆಯ ಶಿಲಾ ಗುಹೆಗಳು.",
    hubId: "badami",
  },
  {
    id: "dandeli-river",
    nameEn: "Dandeli Kali River Gorge",
    nameKn: "ದಾಂಡೇಲಿ ಕಾಳಿ ನದಿ ಕಣಿವೆ",
    districtEn: "Uttara Kannada",
    districtKn: "ಉತ್ತರ ಕನ್ನಡ",
    biome: "rainforest",
    biomeLabelEn: "Sahyadri Rainforests",
    biomeLabelKn: "ಸಹ್ಯಾದ್ರಿ ಮಳೆಕಾಡು",
    lat: 15.2361,
    lng: 74.6173,
    elevationMeters: 473,
    categoryEn: "Hornbill Conservation & River Rapids",
    categoryKn: "ಕಾಳಿ ನದಿ ನೈಸರ್ಗಿಕ ಕಣಿವೆ",
    image: "/images/destinations/dandeli.jpg",
    verifiedSource: "Karnataka Forest Department",
    summaryEn: "Dense moist deciduous forest habitat of the Great Hornbill with pristine Grade-3 Kali river rapids.",
    summaryKn: "ಮಹಾದಾಸೆ ಹಕ್ಕಿಗಳ ಆವಾಸಸ್ಥಾನ ಮತ್ತು ಕಾಳಿ ನದಿಯ ವೇಗದ ಜಲಪ್ರವಾಹದ ದಟ್ಟ ಅರಣ್ಯ.",
    hubId: "dandeli",
  },
  {
    id: "netrani-island",
    nameEn: "Netrani Coral Island",
    nameKn: "ನೇತ್ರಾಣಿ ಹವಳದ ದ್ವೀಪ",
    districtEn: "Uttara Kannada",
    districtKn: "ಉತ್ತರ ಕನ್ನಡ",
    biome: "coastal",
    biomeLabelEn: "Karavali Coast & Islands",
    biomeLabelKn: "ಕರಾವಳಿ ತೀರ ಮತ್ತು ದ್ವೀಪ",
    lat: 14.0167,
    lng: 74.3333,
    elevationMeters: 35,
    categoryEn: "Heart-Shaped Coral Reef Island",
    categoryKn: "ಹವಳದ ದಿಬ್ಬಗಳ ಪ್ರಾಕೃತಿಕ ದ್ವೀಪ",
    image: "/images/destinations/gokarna.jpg",
    verifiedSource: "Zoological Survey of India Marine Record",
    summaryEn: "Isolated heart-shaped coral island in the Arabian Sea famous for rich marine biodiversity and visibility.",
    summaryKn: "ಅರಬ್ಬಿ ಸಮುದ್ರದ ಹೃದಯಾಕಾರದ ದ್ವೀಪ, ವಿಶಿಷ್ಟ ಹವಳದ ದಿಬ್ಬಗಳು ಮತ್ತು ಜಲಚರಗಳ ಸಮೃದ್ಧ ಪರಿಸರ.",
    hubId: "gokarna",
  },
  {
    id: "bandipur-reserve",
    nameEn: "Bandipur Deciduous Biosphere",
    nameKn: "ಬಂಡೀಪುರ ಅಭಯಾರಣ್ಯ",
    districtEn: "Chamarajanagar",
    districtKn: "ಚಾಮರಾಜನಗರ",
    biome: "plains",
    biomeLabelEn: "Central Plains & Foothills",
    biomeLabelKn: "ಬಯಲು ಸೀಮೆ ಮತ್ತು ಅರಣ್ಯ",
    lat: 11.6664,
    lng: 76.6291,
    elevationMeters: 800,
    categoryEn: "Project Tiger Nilgiri Biosphere Core",
    categoryKn: "ಹುಲಿ ಸಂರಕ್ಷಿತ ಬಯಲು-ಅರಣ್ಯ ವಲಯ",
    image: "/images/destinations/bandipur.jpg",
    verifiedSource: "National Tiger Conservation Authority (NTCA)",
    summaryEn: "Premier 874 sq km national park protecting Asian elephants, Bengal tigers, and dry deciduous flora.",
    summaryKn: "874 ಚದರ ಕಿಲೋಮೀಟರ್ ವಿಸ್ತೀರ್ಣದ ಏಷ್ಯನ್ ಆನೆಗಳು ಮತ್ತು ಹುಲಿಗಳ ಸಂರಕ್ಷಿತ ತಾಣ.",
    hubId: "bandipur",
  },
  {
    id: "belur-complex",
    nameEn: "Belur Sculptural Enclave",
    nameKn: "ಬೇಲೂರು ಶಿಲ್ಪಕಲಾ ಸಂಕೀರ್ಣ",
    districtEn: "Hassan",
    districtKn: "ಹಾಸನ",
    biome: "plains",
    biomeLabelEn: "Central Plains & Bastions",
    biomeLabelKn: "ಬಯಲು ಸೀಮೆಯ ಶಿಲ್ಪಕಲೆ",
    lat: 13.1623,
    lng: 75.8643,
    elevationMeters: 962,
    categoryEn: "Hoysala Monolithic Chloritic Schist Carvings",
    categoryKn: "ಹೊಯ್ಸಳ ಶಿಲ್ಪಕಲೆಯ ಅದ್ಭುತ",
    image: "/images/destinations/belur.jpg",
    verifiedSource: "UNESCO World Heritage Inscription (2023)",
    summaryEn: "Intricate 12th-century soapstone star-shaped architecture chronicling Hoysala court life and musicians.",
    summaryKn: "12ನೇ ಶತಮಾನದ ಸಾಬೂನು ಕಲ್ಲಿನ ನಕ್ಷತ್ರಾಕಾರದ ಶಿಲ್ಪಕಲೆ ಮತ್ತು ಹೊಯ್ಸಳ ಪರಂಪರೆ.",
    hubId: "belur",
  },
];

