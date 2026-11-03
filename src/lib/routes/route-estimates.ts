import type {
  GeoCoordinates,
  AttractionRecord,
  RouteLeg,
} from "./route-types";
import type { TransportPreference } from "../planner-types";

/* =========================================================================
   1. VERIFIED KARNATAKA REGIONAL COORDINATES REGISTRY
   ========================================================================= */

export const STARTING_HUBS_COORDINATES: Record<string, GeoCoordinates> = {
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  mysuru: { latitude: 12.2958, longitude: 76.6394 },
  mysore: { latitude: 12.2958, longitude: 76.6394 },
  hubballi: { latitude: 15.3647, longitude: 75.124 },
  hubli: { latitude: 15.3647, longitude: 75.124 },
  mangaluru: { latitude: 12.9141, longitude: 74.856 },
  mangalore: { latitude: 12.9141, longitude: 74.856 },
  belagavi: { latitude: 15.8497, longitude: 74.4977 },
  belgaum: { latitude: 15.8497, longitude: 74.4977 },
  shivamogga: { latitude: 13.9299, longitude: 75.5681 },
  shimoga: { latitude: 13.9299, longitude: 75.5681 },
};

export const DESTINATION_CENTER_COORDINATES: Record<string, GeoCoordinates> = {
  hampi: { latitude: 15.335, longitude: 76.46 },
  mysuru: { latitude: 12.3051, longitude: 76.6551 },
  coorg: { latitude: 12.4244, longitude: 75.7382 },
  gokarna: { latitude: 14.5479, longitude: 74.3188 },
  chikmagalur: { latitude: 13.3161, longitude: 75.772 },
  bandipur: { latitude: 11.6664, longitude: 76.6291 },
  badami: { latitude: 15.9187, longitude: 75.6766 },
  belur: { latitude: 13.1623, longitude: 75.8643 },
  udupi: { latitude: 13.3409, longitude: 74.7421 },
  jogfalls: { latitude: 14.2285, longitude: 74.8124 },
  dandeli: { latitude: 15.2361, longitude: 74.6173 },
};

/* =========================================================================
   2. DETAILED KARNATAKA ATTRACTIONS REGISTRY (4-6 per destination)
   ========================================================================= */

export const KARNATAKA_ATTRACTIONS: AttractionRecord[] = [
  // ── HAMPI ──
  {
    id: "hampi-virupaksha",
    name: "Virupaksha Temple & Hampi Bazaar",
    kannadaName: "ವಿರೂಪಾಕ್ಷ ದೇವಾಲಯ ಮತ್ತು ಹಂಪಿ ಬಜಾರ್",
    destinationId: "hampi",
    destinationName: "Hampi",
    destinationKannada: "ಹಂಪಿ",
    coordinates: { latitude: 15.3353, longitude: 76.4604 },
    category: "spiritual",
    typicalDurationMinutes: 90,
    optimalTimeOfDay: "morning",
    descriptionEn: "7th-century functioning shrine dedicated to Lord Shiva with towering 50-meter gopuram.",
    descriptionKn: "50 ಮೀಟರ್ ಎತ್ತರದ ಭವ್ಯ ರಾಯಗೋಪುರವಿರುವ 7ನೇ ಶತಮಾನದ ಸಕ್ರಿಯ ಪೂಜಾ ದೇವಾಲಯ.",
    timingNoteEn: "Best visited early morning (7:00 AM – 9:00 AM) to experience morning temple rituals; sanctum closes between 12:30 PM and 4:30 PM.",
    timingNoteKn: "ಮುಂಜಾನೆ 7:00 ರಿಂದ 9:00 ರೊಳಗೆ ಭೇಟಿ ನೀಡುವುದು ಸೂಕ್ತ; ಮಧ್ಯಾಹ್ನ 12:30 ರಿಂದ 4:30 ರವರೆಗೆ ಗರ್ಭಗುಡಿ ಮುಚ್ಚಿರುತ್ತದೆ.",
    highlightMatch: "Virupaksha Temple & Hampi Bazaar",
  },
  {
    id: "hampi-hemakuta",
    name: "Hemakuta Hill Sunset Complex",
    kannadaName: "ಹೇಮಕೂಟ ಬೆಟ್ಟ ಮತ್ತು ಸೂರ್ಯಾಸ್ತ ವೀಕ್ಷಣೆ",
    destinationId: "hampi",
    destinationName: "Hampi",
    destinationKannada: "ಹಂಪಿ",
    coordinates: { latitude: 15.333, longitude: 76.459 },
    category: "scenic",
    typicalDurationMinutes: 60,
    optimalTimeOfDay: "evening",
    descriptionEn: "Gentle boulder plateau featuring pre-Vijayanagara trikuta shrines and panoramic sunset views.",
    descriptionKn: "ಪೂರ್ವ-ವಿಜಯನಗರ ಕಾಲದ ತ್ರಿಕೂಟ ದೇವಾಲಯಗಳಿರುವ ಬೆಟ್ಟ; ಹಂಪಿಯ ಅದ್ಭುತ ಸೂರ್ಯಾಸ್ತ ವೀಕ್ಷಣೆ.",
    timingNoteEn: "Reach by 5:15 PM for dusk vistas over Virupaksha gopuram.",
    timingNoteKn: "ಸಂಜೆ 5:15 ಕ್ಕೆ ತಲುಪುವುದು ಸೂಕ್ತ.",
    highlightMatch: "Sunset from Matanga Hill",
  },
  {
    id: "hampi-vittala",
    name: "Vijaya Vittala Temple & Stone Chariot",
    kannadaName: "ವಿಜಯ ವಿಠ್ಠಲ ದೇವಾಲಯ ಮತ್ತು ಕಲ್ಲಿನ ರಥ",
    destinationId: "hampi",
    destinationName: "Hampi",
    destinationKannada: "ಹಂಪಿ",
    coordinates: { latitude: 15.3389, longitude: 76.4789 },
    category: "heritage",
    typicalDurationMinutes: 120,
    optimalTimeOfDay: "morning",
    descriptionEn: "Pinnacle of Vijayanagara artistic genius featuring the world-famous monolithic Stone Chariot and musical pillars.",
    descriptionKn: "ವಿಶ್ವವಿಖ್ಯಾತ ಕಲ್ಲಿನ ರಥ ಮತ್ತು ಸಂಗೀತ ಹೊರಹೊಮ್ಮಿಸುವ ನಾದಸ್ವರ ಕಂಬಗಳ ಶಿಲ್ಪಕಲಾ ವೈಭವ.",
    timingNoteEn: "Electric buggies run between the parking lot and the monument.",
    timingNoteKn: "ಪಾರ್ಕಿಂಗ್ ಸ್ಥಳದಿಂದ ಬ್ಯಾಟರಿ ವಾಹನ ಸೌಲಭ್ಯ ಲಭ್ಯವಿದೆ.",
    highlightMatch: "Vittala Temple & Stone Chariot",
  },
  {
    id: "hampi-royal-enclosure",
    name: "Royal Enclosure & Lotus Mahal",
    kannadaName: "ರಾಯಲ್ ಎನ್‌ಕ್ಲೋಷರ್ ಮತ್ತು ಕಮಲ್ ಮಹಲ್",
    destinationId: "hampi",
    destinationName: "Hampi",
    destinationKannada: "ಹಂಪಿ",
    coordinates: { latitude: 15.32, longitude: 76.469 },
    category: "heritage",
    typicalDurationMinutes: 75,
    optimalTimeOfDay: "afternoon",
    descriptionEn: "Stepped tank pushkarani, Mahanavami Dibba ceremonial platform, and Indo-Islamic palace architecture.",
    descriptionKn: "ಮೆಟ್ಟಿಲು ಬಾವಿ (ಪುಷ್ಕರಣಿ), ಮಹಾನವಮಿ ದಿಬ್ಬ ಹಾಗೂ ಇಂಡೋ-ಇಸ್ಲಾಮಿಕ್ ಶೈಲಿಯ ಕಮಲ್ ಮಹಲ್.",
    timingNoteEn: "Combine with nearby Queen's Bath and Elephant Stables.",
    timingNoteKn: "ರಾಣಿಯ ಸ್ನಾನಗೃಹ ಮತ್ತು ಆನೆ ಲಾಯಗಳೊಂದಿಗೆ ವೀಕ್ಷಿಸಿ.",
    highlightMatch: "Virupaksha Temple & Hampi Bazaar",
  },
  {
    id: "hampi-coracle",
    name: "Tungabhadra River Coracle Ride",
    kannadaName: "ತುಂಗಭದ್ರಾ ನದಿ ತೆಪ್ಪದ ಸವಾರಿ (ಬುಟ್ಟಿ ದೋಣಿ)",
    destinationId: "hampi",
    destinationName: "Hampi",
    destinationKannada: "ಹಂಪಿ",
    coordinates: { latitude: 15.338, longitude: 76.462 },
    category: "adventure",
    typicalDurationMinutes: 45,
    optimalTimeOfDay: "afternoon",
    descriptionEn: "Traditional circular woven wicker boat ride skimming through granite gorge canyons.",
    descriptionKn: "ಬಂಡೆಗಳ ಕಣಿವೆಯಲ್ಲಿ ತುಂಗಭದ್ರಾ ನದಿಯ ಸಾಂಪ್ರದಾಯಿಕ ಬುಟ್ಟಿ ದೋಣಿ ಸವಾರಿ.",
    timingNoteEn: "Wear provided life jackets; avoid during high monsoon river swell.",
    timingNoteKn: "ಲೈಫ್ ಜಾಕೆಟ್ ಕಡ್ಡಾಯವಾಗಿ ಧರಿಸಿ.",
    highlightMatch: "Coracle ride on Tungabhadra River",
  },

  // ── MYSURU ──
  {
    id: "mysuru-palace",
    name: "Amba Vilas (Mysore Palace)",
    kannadaName: "ಅಂಬಾ ವಿಲಾಸ್ (ಮೈಸೂರು ಅರಮನೆ)",
    destinationId: "mysuru",
    destinationName: "Mysuru",
    destinationKannada: "ಮೈಸೂರು",
    coordinates: { latitude: 12.3051, longitude: 76.6551 },
    category: "heritage",
    typicalDurationMinutes: 120,
    optimalTimeOfDay: "morning",
    descriptionEn: "Indo-Saracenic royal residence designed by Henry Irwin with stained glass, carved teakwood, and Durbar halls.",
    descriptionKn: "ಹೆನ್ರಿ ಇರ್ವಿನ್ ವಿನ್ಯಾಸಗೊಳಿಸಿದ ಇಂಡೋ-ಸಾರ್ಸೆನಿಕ್ ಶೈಲಿಯ ಭವ್ಯ ದರ್ಬಾರ್ ಸಭಾಂಗಣ.",
    timingNoteEn: "Palace illumination occurs on Sunday evenings and public holidays (7:00 PM – 7:45 PM).",
    timingNoteKn: "ಭಾನುವಾರ ಮತ್ತು ರಜಾದಿನಗಳಲ್ಲಿ ಸಂಜೆ 7:00 ಕ್ಕೆ ದೀಪಾಲಂಕಾರವಿರುತ್ತದೆ.",
    highlightMatch: "Amba Vilas (Mysore Palace)",
  },
  {
    id: "mysuru-chamundi",
    name: "Chamundi Hill & Nandi Monolith",
    kannadaName: "ಚಾಮುಂಡಿ ಬೆಟ್ಟ ಮತ್ತು ಬೃಹತ್ ನಂದಿ ವಿಗ್ರಹ",
    destinationId: "mysuru",
    destinationName: "Mysuru",
    destinationKannada: "ಮೈಸೂರು",
    coordinates: { latitude: 12.2724, longitude: 76.671 },
    category: "spiritual",
    typicalDurationMinutes: 90,
    optimalTimeOfDay: "morning",
    descriptionEn: "Ancient hilltop temple overlooking Mysuru city with a 350-year-old monolithic Nandi bull statue.",
    descriptionKn: "ಮೈಸೂರು ನಗರದ ಪಕ್ಷಿನೋಟ ನೀಡುವ ಪವಿತ್ರ ಬೆಟ್ಟ ಹಾಗೂ 350 ವರ್ಷಗಳ ಏಕಶಿಲಾ ನಂದಿ.",
    timingNoteEn: "Temple darshan queues lengthen during weekends; early morning ascent recommended.",
    timingNoteKn: "ವಾರಾಂತ್ಯದಲ್ಲಿ ಬೆಳಿಗ್ಗೆ ಬೇಗ ಭೇಟಿ ನೀಡುವುದು ಸೂಕ್ತ.",
    highlightMatch: "Chamundi Hill & Nandi Bull",
  },
  {
    id: "mysuru-devaraja",
    name: "Devaraja Market Heritage Walk",
    kannadaName: "ದೇವರಾಜ ಮಾರುಕಟ್ಟೆ ಹೆರಿಟೇಜ್ ವಾಕ್",
    destinationId: "mysuru",
    destinationName: "Mysuru",
    destinationKannada: "ಮೈಸೂರು",
    coordinates: { latitude: 12.3087, longitude: 76.6508 },
    category: "cultural",
    typicalDurationMinutes: 60,
    optimalTimeOfDay: "evening",
    descriptionEn: "Century-old covered bazaar brimming with Mysore jasmine (Mallige), essential oils, spices, and fresh betel leaves.",
    descriptionKn: "ನೂರು ವರ್ಷಗಳ ಹಳೆಯ ಮಾರುಕಟ್ಟೆ; ಮೈಸೂರು ಮಲ್ಲಿಗೆ, ಗಂಧದೆಣ್ಣೆ, ಬಣ್ಣದ ಕುಂಕುಮ ಮತ್ತು ಮಸಾಲೆ ಪದಾರ್ಥಗಳು.",
    timingNoteEn: "Ideal for tasting authentic Mysore Pak at nearby historic sweet stalls.",
    timingNoteKn: "ಹತ್ತಿರದ ಗುರು ಸ್ವೀಟ್ ಮಾರ್ಟ್‌ನಲ್ಲಿ ಮೈಸೂರು ಪಾಕ್ ಸವಿಯಲು ಪ್ರಶಸ್ತ.",
    highlightMatch: "Devaraja Market spice & flower stalls",
  },
  {
    id: "mysuru-karanji",
    name: "Karanji Lake & Nature Sanctuary",
    kannadaName: "ಕಾರಂಜಿ ಕೆರೆ ಮತ್ತು ಪಕ್ಷಿಧಾಮ",
    destinationId: "mysuru",
    destinationName: "Mysuru",
    destinationKannada: "ಮೈಸೂರು",
    coordinates: { latitude: 12.3025, longitude: 76.6715 },
    category: "nature",
    typicalDurationMinutes: 75,
    optimalTimeOfDay: "afternoon",
    descriptionEn: "Serene lakeside park featuring India's largest walk-through aviary, butterfly park, and boating.",
    descriptionKn: "ಭಾರತದ ಅತಿ ದೊಡ್ಡ ವಾಕ್-ಥ್ರೂ ಪಕ್ಷಿಧಾಮ ಹಾಗೂ ಚಿಟ್ಟೆ ಪಾರ್ಕ್ ಹೊಂದಿರುವ ಸುಂದರ ಕೆರೆ.",
    timingNoteEn: "Closed on Tuesdays. Peaceful walk during late afternoon.",
    timingNoteKn: "ಮಂಗಳವಾರ ರಜೆ ಇರುತ್ತದೆ.",
    highlightMatch: "Karanji Lake & Nature Sanctuary",
  },

  // ── COORG (KODAGU) ──
  {
    id: "coorg-rajas-seat",
    name: "Raja's Seat Viewpoint & Garden",
    kannadaName: "ರಾಜಾ ಸೀಟ್ ಉದ್ಯಾನವನ ಮತ್ತು ಸೂರ್ಯಾಸ್ತ ಪಾಯಿಂಟ್",
    destinationId: "coorg",
    destinationName: "Coorg (Kodagu)",
    destinationKannada: "ಕೊಡಗು",
    coordinates: { latitude: 12.4208, longitude: 75.736 },
    category: "scenic",
    typicalDurationMinutes: 60,
    optimalTimeOfDay: "evening",
    descriptionEn: "Historic seasonal retreat of Kodagu kings with panoramic sunset vistas over rolling green valleys.",
    descriptionKn: "ಕೊಡಗಿನ ರಾಜರು ಸೂರ್ಯಾಸ್ತ ವೀಕ್ಷಿಸುತ್ತಿದ್ದ ಐತಿಹಾಸಿಕ ತಾಣ; ಕಣಿವೆಗಳ ವಿಹಂಗಮ ನೋಟ.",
    timingNoteEn: "Musical fountain shows begin around 6:30 PM.",
    timingNoteKn: "ಸಂಜೆ 6:30 ಕ್ಕೆ ಕಾರಂಜಿ ಪ್ರದರ್ಶನವಿರುತ್ತದೆ.",
    highlightMatch: "Raja's Seat sunset viewpoint",
  },
  {
    id: "coorg-abbey-falls",
    name: "Abbey Falls Cascade Trail",
    kannadaName: "ಅಬ್ಬಿ ಜಲಪಾತ",
    destinationId: "coorg",
    destinationName: "Coorg (Kodagu)",
    destinationKannada: "ಕೊಡಗು",
    coordinates: { latitude: 12.4542, longitude: 75.7175 },
    category: "nature",
    typicalDurationMinutes: 75,
    optimalTimeOfDay: "morning",
    descriptionEn: "Dramatic waterfall plunging 70 feet nestled inside private coffee estates and spice plantations.",
    descriptionKn: "ಕಾಫಿ ಮತ್ತು ಸಾಂಬಾರ ತೋಟಗಳ ಮಧ್ಯೆ 70 ಅಡಿ ಕೆಳಗೆ ಧುಮುಕುವ ಸುಂದರ ಜಲಪಾತ.",
    timingNoteEn: "Moderate descent via concrete steps; hanging bridge offers prime photographic angle.",
    timingNoteKn: "ತೂಗು ಸೇತುವೆಯ ಮೇಲಿಂದ ಜಲಪಾತದ ಸುಂದರ ನೋಟ ಸಿಗುತ್ತದೆ.",
    highlightMatch: "Abbey Falls cascade",
  },
  {
    id: "coorg-dubare",
    name: "Dubare Elephant Camp (Kaveri River)",
    kannadaName: "ದುಬಾರೆ ಆನೆ ಶಿಬಿರ (ಕಾವೇರಿ ತೀರ)",
    destinationId: "coorg",
    destinationName: "Coorg (Kodagu)",
    destinationKannada: "ಕೊಡಗು",
    coordinates: { latitude: 12.3683, longitude: 75.9036 },
    category: "adventure",
    typicalDurationMinutes: 120,
    optimalTimeOfDay: "morning",
    descriptionEn: "Elephant conservation center on the banks of river Kaveri where visitors observe gentle pachyderms.",
    descriptionKn: "ಕಾವೇರಿ ನದಿ ತೀರದಲ್ಲಿರುವ ಆನೆ ಸಂರಕ್ಷಣಾ ಶಿಬಿರ.",
    timingNoteEn: "Morning interaction window: 9:00 AM – 11:00 AM. Cross river by boat.",
    timingNoteKn: "ಬೆಳಿಗ್ಗೆ 9:00 ರಿಂದ 11:00 ರೊಳಗೆ ಭೇಟಿ ನೀಡುವುದು ಸೂಕ್ತ.",
    highlightMatch: "Dubare Elephant Camp river experience",
  },
  {
    id: "coorg-namdroling",
    name: "Namdroling Monastery (Golden Temple Bylakuppe)",
    kannadaName: "ಬೈಲುಕುಪ್ಪೆ ಗೋಲ್ಡನ್ ಟೆಂಪಲ್ (ಟಿಬೆಟಿಯನ್ ಕ್ಯಾಂಪ್)",
    destinationId: "coorg",
    destinationName: "Coorg (Kodagu)",
    destinationKannada: "ಕೊಡಗು",
    coordinates: { latitude: 12.43, longitude: 75.9664 },
    category: "cultural",
    typicalDurationMinutes: 90,
    optimalTimeOfDay: "afternoon",
    descriptionEn: "Second largest Tibetan settlement outside Tibet featuring three 40-foot gilded Buddha statues.",
    descriptionKn: "40 ಅಡಿ ಎತ್ತರದ ಚಿನ್ನದ ಬಣ್ಣದ ಭಗವಾನ್ ಬುದ್ಧನ ಮೂರ್ತಿಗಳಿರುವ ಭವ್ಯ ಬೌದ್ಧ ಮಂದಿರ.",
    timingNoteEn: "Hear resonant ceremonial horn blowing and chanting at midday and early evening.",
    timingNoteKn: "ಶಾಂತಿಯುತ ವಾತಾವರಣ ಮತ್ತು ಟಿಬೆಟಿಯನ್ ಕರಕುಶಲ ಮಳಿಗೆಗಳು.",
    highlightMatch: "Bylakuppe Tibetan Golden Temple",
  },

  // ── CHIKMAGALUR ──
  {
    id: "chikmagalur-mullayanagiri",
    name: "Mullayanagiri Peak Trek (Highest in Karnataka)",
    kannadaName: "ಮುಳ್ಳಯ್ಯನಗಿರಿ ಶಿಖರ (ಕರ್ನಾಟಕದ ಅತ್ಯುನ್ನತ ಶಿಖರ)",
    destinationId: "chikmagalur",
    destinationName: "Chikmagalur",
    destinationKannada: "ಚಿಕ್ಕಮಗಳೂರು",
    coordinates: { latitude: 13.3911, longitude: 75.7214 },
    category: "adventure",
    typicalDurationMinutes: 120,
    optimalTimeOfDay: "morning",
    descriptionEn: "Standing at 1,930 meters, this highest summit in Karnataka offers cloud-walking trails and Shiva shrine.",
    descriptionKn: "ಸಮುದ್ರ ಮಟ್ಟದಿಂದ 1,930 ಮೀಟರ್ ಎತ್ತರದಲ್ಲಿರುವ ಕರ್ನಾಟಕದ ಅತ್ಯುನ್ನತ ಶಿಖರ.",
    timingNoteEn: "Start early before 8:00 AM to beat mountain mist and parking congestion on narrow ridge.",
    timingNoteKn: "ಬೆಳಿಗ್ಗೆ 8:00 ರ ಮುನ್ನವೇ ತಲುಪುವುದು ಸೂಕ್ತ.",
    highlightMatch: "Mullayanagiri Peak summit",
  },
  {
    id: "chikmagalur-baba-budangiri",
    name: "Baba Budangiri & Manikyadhara Falls",
    kannadaName: "ಬಾಬಾ ಬುಡನ್‌ಗಿರಿ ಮತ್ತು ಮಾಣಿಕ್ಯಧಾರಾ ಜಲಪಾತ",
    destinationId: "chikmagalur",
    destinationName: "Chikmagalur",
    destinationKannada: "ಚಿಕ್ಕಮಗಳೂರು",
    coordinates: { latitude: 13.4215, longitude: 75.758 },
    category: "spiritual",
    typicalDurationMinutes: 90,
    optimalTimeOfDay: "afternoon",
    descriptionEn: "Sacred mountain range associated with Sufi saint Baba Budan who introduced the first coffee seeds to India.",
    descriptionKn: "ಭಾರತಕ್ಕೆ ಮೊದಲ ಕಾಫಿ ಬೀಜಗಳನ್ನು ತಂದ ಸೂಫಿ ಸಂತ ಬಾಬಾ ಬುಡನ್ ಅವರ ಪವಿತ್ರ ಗಿರಿಶ್ರೇಣಿ.",
    timingNoteEn: "Winding ghat roads; check vehicle ground clearance for rough stretches.",
    timingNoteKn: "ಕಡಿದಾದ ಘಾಟ್ ರಸ್ತೆಗಳು; ಎಚ್ಚರಿಕೆಯಿಂದ ವಾಹನ ಚಾಲನೆ ಮಾಡಿ.",
    highlightMatch: "Baba Budangiri sacred hills",
  },
  {
    id: "chikmagalur-estate",
    name: "Coffee Estate Plantation Walk & Tasting",
    kannadaName: "ಕಾಫಿ ತೋಟದ ನಡಿಗೆ ಮತ್ತು ಕಾಫಿ ಸವಿಯುವಿಕೆ",
    destinationId: "chikmagalur",
    destinationName: "Chikmagalur",
    destinationKannada: "ಚಿಕ್ಕಮಗಳೂರು",
    coordinates: { latitude: 13.325, longitude: 75.77 },
    category: "cultural",
    typicalDurationMinutes: 75,
    optimalTimeOfDay: "morning",
    descriptionEn: "Guided stroll beneath shade trees explaining Arabica and Robusta cultivation, pepper vines, and brewing.",
    descriptionKn: "ನೆರಳು-ಮರದ ಕಾಫಿ ತೋಟದಲ್ಲಿ ಅರೇಬಿಕಾ-ರೋಬಸ್ಟಾ ಕಾಫಿ ಬೆಳೆಯುವ ವಿಧಾನ ಮತ್ತು ನಡಿಗೆ.",
    timingNoteEn: "Wear sturdy enclosed walking shoes to protect against estate terrain.",
    timingNoteKn: "ತೋಟದ ನಡಿಗೆಗೆ ಆರಾಮದಾಯಕ ಶೂ ಧರಿಸಿ.",
    highlightMatch: "Coffee plantation heritage walk",
  },
  {
    id: "chikmagalur-hirekolale",
    name: "Hirekolale Lake Tranquil Waters",
    kannadaName: "ಹಿರೇಕೊಳಲೆ ಕೆರೆ",
    destinationId: "chikmagalur",
    destinationName: "Chikmagalur",
    destinationKannada: "ಚಿಕ್ಕಮಗಳೂರು",
    coordinates: { latitude: 13.3512, longitude: 75.7198 },
    category: "scenic",
    typicalDurationMinutes: 60,
    optimalTimeOfDay: "evening",
    descriptionEn: "Scenic freshwater lake ringed by Western Ghats hills, famed for stunning sunset reflections.",
    descriptionKn: "ಬೆಟ್ಟಗಳಿಂದ ಸುತ್ತುವರೆದಿರುವ ಪ್ರಶಾಂತ ಕೆರೆ; ಸೂರ್ಯಾಸ್ತದ ಸುಂದರ ನೋಟ.",
    timingNoteEn: "Peaceful, uncommercialized stop 10 km from Chikmagalur town.",
    timingNoteKn: "ಶಾಂತಿಯುತ ವಾತಾವರಣಕ್ಕೆ ಹೇಳಿಮಾಡಿಸಿದ ಸ್ಥಳ.",
    highlightMatch: "Mullayanagiri Peak summit",
  },

  // ── GOKARNA ──
  {
    id: "gokarna-om-beach",
    name: "Om Beach & Coastal Headland Trail",
    kannadaName: "ಓಂ ಬೀಚ್ ಮತ್ತು ಕಡಲತೀರದ ನಡಿಗೆ",
    destinationId: "gokarna",
    destinationName: "Gokarna",
    destinationKannada: "ಗೋಕರ್ಣ",
    coordinates: { latitude: 14.519, longitude: 74.3175 },
    category: "coastal",
    typicalDurationMinutes: 120,
    optimalTimeOfDay: "morning",
    descriptionEn: "Naturally shaped like the auspicious Devanagari 'Om' symbol with twin crescent bays and granite rocks.",
    descriptionKn: "ನೈಸರ್ಗಿಕವಾಗಿ 'ಓಂ' ಆಕಾರದಲ್ಲಿರುವ ರಮಣೀಯ ಕಡಲತೀರ; ಎರಡು ಅರ್ಧಚಂದ್ರಾಕಾರದ ತೀರಗಳು.",
    timingNoteEn: "Hike south towards Half Moon and Paradise beaches along well-trodden cliff paths.",
    timingNoteKn: "ಬಂಡೆಗಳ ಹಾದಿಯಲ್ಲಿ ಹಾಫ್ ಮೂನ್ ಬೀಚ್‌ಗೆ ನಡಿಗೆ ಕೈಗೊಳ್ಳಬಹುದು.",
    highlightMatch: "Om Beach clifftop walk",
  },
  {
    id: "gokarna-mahabaleshwar",
    name: "Mahabaleshwar Temple & Atmalinga",
    kannadaName: "ಮಹಾಬಲೇಶ್ವರ ದೇವಾಲಯ (ಆತ್ಮಲಿಂಗ)",
    destinationId: "gokarna",
    destinationName: "Gokarna",
    destinationKannada: "ಗೋಕರ್ಣ",
    coordinates: { latitude: 14.5428, longitude: 74.3168 },
    category: "spiritual",
    typicalDurationMinutes: 60,
    optimalTimeOfDay: "morning",
    descriptionEn: "Classical 4th-century Dravidian granite temple housing the revered Pranalinga (Atmalinga) of Lord Shiva.",
    descriptionKn: "ಶಿವನ ಪವಿತ್ರ ಆತ್ಮಲಿಂಗವಿರುವ 4ನೇ ಶತಮಾನದ ದ್ರಾವಿಡ ಶೈಲಿಯ ಪುರಾತನ ಕ್ಷೇತ್ರ.",
    timingNoteEn: "Traditional dress required (Dhoti for men, Sarees/Salwars for women); sanctum touches permit during morning.",
    timingNoteKn: "ಸಂಪ್ರದಾಯಬದ್ಧ ವಸ್ತ್ರ ಸಂಹಿತೆ ಕಡ್ಡಾಯ.",
    highlightMatch: "Mahabaleshwar Temple",
  },
  {
    id: "gokarna-kudle",
    name: "Kudle Beach Sunset & Cafes",
    kannadaName: "ಕುಡ್ಲೆ ಬೀಚ್ ಸೂರ್ಯಾಸ್ತ",
    destinationId: "gokarna",
    destinationName: "Gokarna",
    destinationKannada: "ಗೋಕರ್ಣ",
    coordinates: { latitude: 14.53, longitude: 74.318 },
    category: "coastal",
    typicalDurationMinutes: 90,
    optimalTimeOfDay: "evening",
    descriptionEn: "Broad golden sand bay flanked by hills, famous for evening ocean sunsets and relaxed seaside dining.",
    descriptionKn: "ಬೆಟ್ಟಗಳ ನಡುವೆ ವಿಸ್ತಾರವಾದ ಕಡಲತೀರ; ಸಂಜೆಯ ಸೂರ್ಯಾಸ್ತ ವೀಕ್ಷಣೆಗೆ ಪ್ರಸಿದ್ಧ.",
    timingNoteEn: "Short downhill walk from parking headland.",
    timingNoteKn: "ಪಾರ್ಕಿಂಗ್ ಸ್ಥಳದಿಂದ ಸ್ವಲ್ಪ ಇಳಿಜಾರು ನಡಿಗೆಯಿದೆ.",
    highlightMatch: "Kudle Beach relaxation",
  },
  {
    id: "gokarna-mirjan",
    name: "Mirjan Fort Laterite Ruins",
    kannadaName: "ಮಿರ್ಜಾನ್ ಕೋಟೆ",
    destinationId: "gokarna",
    destinationName: "Gokarna",
    destinationKannada: "ಗೋಕರ್ಣ",
    coordinates: { latitude: 14.4925, longitude: 74.4225 },
    category: "heritage",
    typicalDurationMinutes: 60,
    optimalTimeOfDay: "afternoon",
    descriptionEn: "16th-century fortress built by Queen Chennabhairadevi (the 'Pepper Queen') with bastions, moats, and watchtowers.",
    descriptionKn: "16ನೇ ಶತಮಾನದ 'ಮೆಣಸಿನ ರಾಣಿ' ಚೆನ್ನಭೈರಾದೇವಿ ನಿರ್ಮಿಸಿದ ಐತಿಹಾಸಿಕ ಕೆಂಪುಕಲ್ಲಿನ ಕೋಟೆ.",
    timingNoteEn: "Located 22 km south of Gokarna along NH 66.",
    timingNoteKn: "ಗೋಕರ್ಣದಿಂದ 22 ಕಿ.ಮೀ ದೂರದಲ್ಲಿದೆ.",
    highlightMatch: "Mirjan Fort heritage stop",
  },

  // ── BADAMI ──
  {
    id: "badami-caves",
    name: "Badami Sandstone Cave Temples",
    kannadaName: "ಬಾದಾಮಿ ಗುಹಾಂತರ ದೇವಾಲಯಗಳು",
    destinationId: "badami",
    destinationName: "Badami",
    destinationKannada: "ಬಾದಾಮಿ",
    coordinates: { latitude: 15.9185, longitude: 75.6828 },
    category: "heritage",
    typicalDurationMinutes: 120,
    optimalTimeOfDay: "morning",
    descriptionEn: "Four magnificent 6th-century rock-cut shrines carved into fiery red sandstone cliffs overlooking Agastya Lake.",
    descriptionKn: "ಅಗಸ್ತ್ಯ ತೀರ್ಥ ಸರೋವರದ ದಂಡೆಯಲ್ಲಿ ಕೆಂಪು ಮರಳುಗಲ್ಲಿನಲ್ಲಿ ಕೊರೆದ 6ನೇ ಶತಮಾನದ 4 ಅದ್ಭುತ ಗುಹೆಗಳು.",
    timingNoteEn: "Cave 1 features the 18-armed dancing Nataraja in 81 distinct poses.",
    timingNoteKn: "ಗುಹೆ 1 ರಲ್ಲಿ 18 ಕೈಗಳ ನಾಟ್ಯ ಗಣಪತಿ ಮತ್ತು ನಟರಾಜನ ಭಂಗಿಗಳಿವೆ.",
    highlightMatch: "Rock-cut Cave Temples (Caves 1–4)",
  },
  {
    id: "badami-bhoothanatha",
    name: "Agastya Lake & Bhoothanatha Temples",
    kannadaName: "ಅಗಸ್ತ್ಯ ತೀರ್ಥ ಮತ್ತು ಭೂತನಾಥ ದೇವಾಲಯ ಸಮೂಹ",
    destinationId: "badami",
    destinationName: "Badami",
    destinationKannada: "ಬಾದಾಮಿ",
    coordinates: { latitude: 15.9198, longitude: 75.6885 },
    category: "heritage",
    typicalDurationMinutes: 75,
    optimalTimeOfDay: "evening",
    descriptionEn: "Stone shrines emerging directly from water with red cliffs reflecting in the placid green waters at sunset.",
    descriptionKn: "ನೀರಿನಂಚಿನಲ್ಲಿರುವ ಶಿಲಾ ದೇಗುಲಗಳು; ಸೂರ್ಯಾಸ್ತದ ವೇಳೆ ಕೆಂಪು ಬಂಡೆಗಳ ರಮಣೀಯ ಪ್ರತಿಬಿಂಬ.",
    timingNoteEn: "Best photographed during golden hour between 4:30 PM and 6:00 PM.",
    timingNoteKn: "ಸಂಜೆ 4:30 ರಿಂದ 6:00 ರೊಳಗೆ ಛಾಯಾಗ್ರಹಣಕ್ಕೆ ಅತ್ಯುತ್ತಮ.",
    highlightMatch: "Agastya Lake & Bhoothanatha Temples",
  },
  {
    id: "badami-pattadakal",
    name: "Pattadakal UNESCO World Heritage Complex",
    kannadaName: "ಪಟ್ಟದಕಲ್ಲು UNESCO ವಿಶ್ವ ಪರಂಪರೆ ತಾಣ",
    destinationId: "badami",
    destinationName: "Badami",
    destinationKannada: "ಬಾದಾಮಿ",
    coordinates: { latitude: 15.9489, longitude: 75.8163 },
    category: "heritage",
    typicalDurationMinutes: 120,
    optimalTimeOfDay: "morning",
    descriptionEn: "Coronation site of Chalukyan kings blending Northern Nagara and Southern Dravidian temple vimanas.",
    descriptionKn: "ಚಾಲುಕ್ಯ ರಾಜರ ಪಟ್ಟಾಭಿಷೇಕ ತಾಣ; ನಾಗರ ಮತ್ತು ದ್ರಾವಿಡ ವಾಸ್ತುಶಿಲ್ಪದ ಸಮ್ಮಿಲನ.",
    timingNoteEn: "Located 22 km from Badami; Virupaksha Temple houses intricate Ramayana and Mahabharata friezes.",
    timingNoteKn: "ಬಾದಾಮಿಯಿಂದ 22 ಕಿ.ಮೀ ದೂರದಲ್ಲಿದೆ.",
    highlightMatch: "Pattadakal UNESCO World Heritage complex detour",
  },
  {
    id: "badami-aihole",
    name: "Aihole Cradle of Temple Architecture",
    kannadaName: "ಐಹೊಳೆ ದೇವಾಲಯ ವಾಸ್ತುಶಿಲ್ಪದ ತೊಟ್ಟಿಲು",
    destinationId: "badami",
    destinationName: "Badami",
    destinationKannada: "ಬಾದಾಮಿ",
    coordinates: { latitude: 16.0205, longitude: 75.8825 },
    category: "heritage",
    typicalDurationMinutes: 90,
    optimalTimeOfDay: "afternoon",
    descriptionEn: "Over 120 stone temples dating back to the 5th century showcasing experimental Hindu, Jain, and Buddhist layouts.",
    descriptionKn: "120 ಕ್ಕೂ ಹೆಚ್ಚು ಪುರಾತನ ದೇವಾಲಯಗಳಿರುವ ಭಾರತೀಯ ವಾಸ್ತುಶಿಲ್ಪದ ಪ್ರಾಯೋಗಿಕ ಶಾಲೆ.",
    timingNoteEn: "Durga Temple's apsidal plan resembles the modern Indian Parliament.",
    timingNoteKn: "ದುರ್ಗಾ ದೇವಾಲಯದ ಗಜಪೃಷ್ಠಾಕಾರದ ವಿನ್ಯಾಸ ಅತ್ಯಂತ ವಿಶಿಷ್ಟ.",
    highlightMatch: "Aihole historic village & Durga Temple",
  },

  // ── BELUR & HALEBIDU ──
  {
    id: "belur-chennakeshava",
    name: "Chennakeshava Temple Belur (Soapstone Wonder)",
    kannadaName: "ಬೇಲೂರು ಚೆನ್ನಕೇಶವ ದೇವಾಲಯ (ಶಿಲಾಬಾಲಿಕೆಯರ ವೈಭವ)",
    destinationId: "belur",
    destinationName: "Belur & Halebidu",
    destinationKannada: "ಬೇಲೂರು ಮತ್ತು ಹಳೇಬೀಡು",
    coordinates: { latitude: 13.1623, longitude: 75.8643 },
    category: "heritage",
    typicalDurationMinutes: 120,
    optimalTimeOfDay: "morning",
    descriptionEn: "Commissioned by King Vishnuvardhana in 1117 CE; famous for 42 Madanika (bracket dancers) filigree carvings.",
    descriptionKn: "ಕ್ರಿ.ಶ 1117 ರಲ್ಲಿ ವಿಷ್ಣುವರ್ಧನ ಮಹಾರಾಜ ನಿರ್ಮಿಸಿದ ಬಳಪದ ಕಲ್ಲಿನ ಅದ್ಭುತ ಶಿಲ್ಪಕಲೆ.",
    timingNoteEn: "Take an authorized ASI guide to appreciate the microscopic stone filigree.",
    timingNoteKn: "ಅಧಿಕೃತ ಗೈಡ್ ಮೂಲಕ ಸೂಕ್ಷ್ಮ ಕೆತ್ತನೆಗಳ ವಿವರ ಪಡೆಯಿರಿ.",
    highlightMatch: "Chennakeshava Temple (Belur)",
  },
  {
    id: "belur-hoysaleshwara",
    name: "Hoysaleshwara Temple Halebidu",
    kannadaName: "ಹಳೇಬೀಡು ಹೊಯ್ಸಳೇಶ್ವರ ದೇವಾಲಯ",
    destinationId: "belur",
    destinationName: "Belur & Halebidu",
    destinationKannada: "ಬೇಲೂರು ಮತ್ತು ಹಳೇಬೀಡು",
    coordinates: { latitude: 13.2136, longitude: 75.9942 },
    category: "heritage",
    typicalDurationMinutes: 120,
    optimalTimeOfDay: "afternoon",
    descriptionEn: "Twin star-shaped Shiva temples perched on raised platforms adorned with thousands of carved friezes.",
    descriptionKn: "ನಕ್ಷತ್ರಾಕಾರದ ಜಗತಿಯ ಮೇಲೆ ನಿರ್ಮಿಸಲಾದ ದ್ವಿ-ಕೂಟ ದೇವಾಲಯ.",
    timingNoteEn: "16 km east of Belur; outer friezes depict charging elephants, lions, and makaras.",
    timingNoteKn: "ಬೇಲೂರಿನಿಂದ 16 ಕಿ.ಮೀ ದೂರದಲ್ಲಿದೆ.",
    highlightMatch: "Hoysaleshwara Temple (Halebidu)",
  },
  {
    id: "belur-yagachi",
    name: "Yagachi Dam & Water Sports Centre",
    kannadaName: "ಯಾಗಚಿ ಅಣೆಕಟ್ಟು ಮತ್ತು ಜಲ ಕ್ರೀಡೆ",
    destinationId: "belur",
    destinationName: "Belur & Halebidu",
    destinationKannada: "ಬೇಲೂರು ಮತ್ತು ಹಳೇಬೀಡು",
    coordinates: { latitude: 13.178, longitude: 75.875 },
    category: "adventure",
    typicalDurationMinutes: 60,
    optimalTimeOfDay: "evening",
    descriptionEn: "Scenic earthen dam reservoir 4 km from Belur offering speedboating, jet skiing, and calm water views.",
    descriptionKn: "ಬೇಲೂರಿನ ಸಮೀಪವಿರುವ ಸುಂದರ ಜಲಾಶಯ; ಬೋಟಿಂಗ್ ಮತ್ತು ವಾಟರ್ ಸ್ಪೋರ್ಟ್ಸ್.",
    timingNoteEn: "Ideal relaxing sunset wind-down after touring temple stones.",
    timingNoteKn: "ದೇವಾಲಯ ಭೇಟಿಯ ನಂತರ ಸಂಜೆ ವಿಶ್ರಾಂತಿಗೆ ಸೂಕ್ತ.",
    highlightMatch: "Kedareshwara Temple & archaeological museum",
  },

  // ── UDUPI ──
  {
    id: "udupi-krishna-matha",
    name: "Sri Krishna Matha & Kanakana Kindi",
    kannadaName: "ಉಡುಪಿ ಶ್ರೀಕೃಷ್ಣ ಮಠ ಮತ್ತು ಕನಕನ ಕಿಂಡಿ",
    destinationId: "udupi",
    destinationName: "Udupi",
    destinationKannada: "ಉಡುಪಿ",
    coordinates: { latitude: 13.3409, longitude: 74.7421 },
    category: "spiritual",
    typicalDurationMinutes: 90,
    optimalTimeOfDay: "morning",
    descriptionEn: "13th-century sacred monastery founded by Saint Madhvacharya where Lord Krishna is viewed through the nine-holed silver window.",
    descriptionKn: "13ನೇ ಶತಮಾನದಲ್ಲಿ ಮಧ್ವಾಚಾರ್ಯರು ಸ್ಥಾಪಿಸಿದ ಪುಣ್ಯಕ್ಷೇತ್ರ; ಕನಕನ ಕಿಂಡಿಯ ಮೂಲಕ ಕೃಷ್ಣನ ದರ್ಶನ.",
    timingNoteEn: "Free Satvik Mahaprasada served on plantain leaves at midday (11:45 AM – 1:30 PM).",
    timingNoteKn: "ಮಧ್ಯಾಹ್ನ 11:45 ರಿಂದ ಅನ್ನಪ್ರಸಾದ ಸೇವೆ ಲಭ್ಯವಿದೆ.",
    highlightMatch: "Sri Krishna Matha & Car Street",
  },
  {
    id: "udupi-malpe",
    name: "Malpe Beach & Sea Walk Jetty",
    kannadaName: "ಮಲ್ಪೆ ಕಡಲತೀರ ಮತ್ತು ಸೀ ವಾಕ್ ಜೆಟ್ಟಿ",
    destinationId: "udupi",
    destinationName: "Udupi",
    destinationKannada: "ಉಡುಪಿ",
    coordinates: { latitude: 13.3592, longitude: 74.698 },
    category: "coastal",
    typicalDurationMinutes: 90,
    optimalTimeOfDay: "evening",
    descriptionEn: "Silver sand beach with 450-meter elevated Sea Walk jetty into the Arabian Sea and ferry embarkation.",
    descriptionKn: "ಅರಬ್ಬಿ ಸಮುದ್ರದೊಳಗೆ ಸಾಗುವ ಸುಂದರ ಸೀ ವಾಕ್ ಜೆಟ್ಟಿ ಮತ್ತು ಬೆಳ್ಳಿಯ ಮರಳಿನ ಕಡಲತೀರ.",
    timingNoteEn: "Board morning ferries to St. Mary's Island from Malpe harbour.",
    timingNoteKn: "ಇಲ್ಲಿಂದ ಸೈಂಟ್ ಮೇರಿಸ್ ದ್ವೀಪಕ್ಕೆ ದೋಣಿ ಸೌಲಭ್ಯವಿದೆ.",
    highlightMatch: "Malpe Beach & sea-walk jetty",
  },
  {
    id: "udupi-st-marys",
    name: "St. Mary's Island Basalt Rock Columns",
    kannadaName: "ಸೈಂಟ್ ಮೇರಿಸ್ ಐಲ್ಯಾಂಡ್ (ಸ್ತಂಭಾಕಾರದ ಕಲ್ಲುಗಳು)",
    destinationId: "udupi",
    destinationName: "Udupi",
    destinationKannada: "ಉಡುಪಿ",
    coordinates: { latitude: 13.38, longitude: 74.673 },
    category: "nature",
    typicalDurationMinutes: 150,
    optimalTimeOfDay: "morning",
    descriptionEn: "National Geological Monument featuring hexagonal columnar basaltic lava formations formed 88 million years ago.",
    descriptionKn: "ಲಾವಾರಸದಿಂದ ರೂಪಗೊಂಡ ನೈಸರ್ಗಿಕ ಷಡ್ಭುಜಾಕೃತಿಯ ವಿಶಿಷ್ಟ ಕಲ್ಲಿನ ಸ್ತಂಭಗಳ ದ್ವೀಪ.",
    timingNoteEn: "Ferries operate October to May; closed during southwest monsoon rough seas.",
    timingNoteKn: "ಮಳೆಗಾಲದಲ್ಲಿ ದೋಣಿ ಸಂಚಾರ ಇರುವುದಿಲ್ಲ.",
    highlightMatch: "St. Mary's Island hexagonal basalt columns",
  },
  {
    id: "udupi-kaup",
    name: "Kaup Lighthouse & Cliff Beach",
    kannadaName: "ಕಾಪು ಲೈಟ್‌ಹೌಸ್ ಮತ್ತು ಕಡಲತೀರ",
    destinationId: "udupi",
    destinationName: "Udupi",
    destinationKannada: "ಉಡುಪಿ",
    coordinates: { latitude: 13.2244, longitude: 74.7408 },
    category: "scenic",
    typicalDurationMinutes: 75,
    optimalTimeOfDay: "evening",
    descriptionEn: "Century-old 27-meter black-and-white stone lighthouse perched atop rocky coastal promontory.",
    descriptionKn: "1901 ರಲ್ಲಿ ನಿರ್ಮಿಸಲಾದ ನೂರು ವರ್ಷಗಳ ಹಳೆಯ ಕಲ್ಲಿನ ಲೈಟ್‌ಹೌಸ್.",
    timingNoteEn: "Lighthouse steps open to visitors from 4:00 PM to 6:30 PM for panoramic coastal views.",
    timingNoteKn: "ಸಂಜೆ 4:00 ರಿಂದ 6:30 ರವರೆಗೆ ಲೈಟ್‌ಹೌಸ್ ಹತ್ತಲು ಅವಕಾಶವಿದೆ.",
    highlightMatch: "Kaup Lighthouse & rocky beach",
  },

  // ── BANDIPUR ──
  {
    id: "bandipur-safari",
    name: "Bandipur Tiger Reserve Jungle Safari",
    kannadaName: "ಬಂಡೀಪುರ ಹುಲಿ ಸಂರಕ್ಷಿತ ಪ್ರದೇಶ ಸಫಾರಿ",
    destinationId: "bandipur",
    destinationName: "Bandipur National Park",
    destinationKannada: "ಬಂಡೀಪುರ",
    coordinates: { latitude: 11.6664, longitude: 76.6291 },
    category: "adventure",
    typicalDurationMinutes: 180,
    optimalTimeOfDay: "morning",
    descriptionEn: "Premier Nilgiri Biosphere reserve sheltering wild Bengal tigers, herds of Asian elephants, gaurs, and leopards.",
    descriptionKn: "ಏಷ್ಯನ್ ಆನೆಗಳು, ಹುಲಿಗಳು ಮತ್ತು ಕಾಡೆಮ್ಮೆಗಳಿರುವ ನೀಲಗಿರಿ ಬಯೋಸ್ಫಿಯರ್ ಅರಣ್ಯ.",
    timingNoteEn: "Safaris operate 6:30 AM – 9:00 AM and 3:30 PM – 6:00 PM. Pre-book online through official Forest portal.",
    timingNoteKn: "ಬೆಳಿಗ್ಗೆ 6:30 ಮತ್ತು ಸಂಜೆ 3:30 ಕ್ಕೆ ಸಫಾರಿ ಆರಂಭವಾಗುತ್ತದೆ.",
    highlightMatch: "Morning or evening forest department safari",
  },
  {
    id: "bandipur-gopalaswamy",
    name: "Himavad Gopalaswamy Betta Peak",
    kannadaName: "ಹಿಮವದ್ ಗೋಪಾಲಸ್ವಾಮಿ ಬೆಟ್ಟ",
    destinationId: "bandipur",
    destinationName: "Bandipur National Park",
    destinationKannada: "ಬಂಡೀಪುರ",
    coordinates: { latitude: 11.7225, longitude: 76.5925 },
    category: "scenic",
    typicalDurationMinutes: 90,
    optimalTimeOfDay: "morning",
    descriptionEn: "Highest hill inside Bandipur enveloped in morning fog and wild grasslands with an ancient Venugopala shrine.",
    descriptionKn: "ವರ್ಷವಿಡೀ ಮಂಜು ಮುಸುಕಿರುವ ಬೆಟ್ಟ; ವೇಣುಗೋಪಾಲಸ್ವಾಮಿ ದೇವಾಲಯ.",
    timingNoteEn: "Private vehicles restricted at base; KSRTC electric shuttle buses ply to summit.",
    timingNoteKn: "ತಪ್ಪಲಿನಿಂದ KSRTC ಬಸ್ಸುಗಳ ಮೂಲಕ ಮಾತ್ರ ಪ್ರವೇಶವಿದೆ.",
    highlightMatch: "Himavad Gopalaswamy Betta peak",
  },

  // ── DANDELI ──
  {
    id: "dandeli-rafting",
    name: "Kali River White-Water Rafting",
    kannadaName: "ಕಾಳಿ ನದಿ ವೈಟ್ ವಾಟರ್ ರಾಫ್ಟಿಂಗ್",
    destinationId: "dandeli",
    destinationName: "Dandeli",
    destinationKannada: "ದಾಂಡೇಲಿ",
    coordinates: { latitude: 15.2361, longitude: 74.6173 },
    category: "adventure",
    typicalDurationMinutes: 150,
    optimalTimeOfDay: "morning",
    descriptionEn: "Thrilling Grade 2 and Grade 3 river rapids navigating through dense deciduous forest canyons.",
    descriptionKn: "ದಟ್ಟ ಅರಣ್ಯದ ನಡುವೆ ಕಾಳಿ ನದಿಯ ಸಾಹಸಮಯ ರಾಫ್ಟಿಂಗ್.",
    timingNoteEn: "Activity schedules depend on water release from Supa Dam; operational October to May.",
    timingNoteKn: "ಸೂಪಾ ಅಣೆಕಟ್ಟಿನ ನೀರು ಬಿಡುವ ಸಮಯದ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿರುತ್ತದೆ.",
    highlightMatch: "Kali River whitewater rafting (seasonal)",
  },
  {
    id: "dandeli-syntheri",
    name: "Syntheri Rocks Monolithic Granite Gorge",
    kannadaName: "ಸಿಂಥೇರಿ ರಾಕ್ಸ್ ಬೃಹತ್ ಶಿಲಾ ಕಣಿವೆ",
    destinationId: "dandeli",
    destinationName: "Dandeli",
    destinationKannada: "ದಾಂಡೇಲಿ",
    coordinates: { latitude: 15.21, longitude: 74.52 },
    category: "nature",
    typicalDurationMinutes: 90,
    optimalTimeOfDay: "afternoon",
    descriptionEn: "300-foot sheer monolithic granite ravine hollowed by Kaneri river currents, inhabited by thousands of rock pigeons.",
    descriptionKn: "ಕಾನೇರಿ ನದಿಯಿಂದ ಕೊರೆಯಲ್ಪಟ್ಟ 300 ಅಡಿ ಎತ್ತರದ ಬೃಹತ್ ಕಲ್ಲಿನ ಬಂಡೆಗಳು.",
    timingNoteEn: "Steep flight of 200 stone steps down to gorge platform; swimming is strictly prohibited.",
    timingNoteKn: "ನೀರಿನಲ್ಲಿ ಈಜುವುದನ್ನು ನಿಷೇಧಿಸಲಾಗಿದೆ.",
    highlightMatch: "Syntheri Rocks monolithic granite formation",
  },
  {
    id: "dandeli-safari",
    name: "Dandeli-Anshi Tiger Reserve Forest Safari",
    kannadaName: "ದಾಂಡೇಲಿ-ಅಣಶಿ ವನ್ಯಜೀವಿ ಸಫಾರಿ",
    destinationId: "dandeli",
    destinationName: "Dandeli",
    destinationKannada: "ದಾಂಡೇಲಿ",
    coordinates: { latitude: 15.245, longitude: 74.63 },
    category: "adventure",
    typicalDurationMinutes: 120,
    optimalTimeOfDay: "morning",
    descriptionEn: "Rainforest canopy trail known for black panthers, hornbills, and giant flying squirrels.",
    descriptionKn: "ಕಪ್ಪು ಚಿರತೆ, ಮಲಬಾರ್ ಹಾರ್ನ್‌ಬಿಲ್ ಹಾಗೂ ದೈತ್ಯ ಹಾರುವ ಅಳಿಲುಗಳ ನೆಲೆವೀಡು.",
    timingNoteEn: "Early morning drives offer best birdwatching opportunities for Great Hornbills.",
    timingNoteKn: "ಬೆಳಗಿನ ಜಾವ ಪಕ್ಷಿ ವೀಕ್ಷಣೆಗೆ ಅತ್ಯುತ್ತಮ ಸಮಯ.",
    highlightMatch: "Dandeli Wildlife Sanctuary safari",
  },

  // ── JOG FALLS ──
  {
    id: "jogfalls-viewpoint",
    name: "Jog Falls Main Viewpoint & Cascade Amphitheatre",
    kannadaName: "ಜೋಗ ಜಲಪಾತ ಮುಖ್ಯ ವೀಕ್ಷಣಾ ವೇದಿಕೆ",
    destinationId: "jogfalls",
    destinationName: "Jog Falls",
    destinationKannada: "ಜೋಗ ಜಲಪಾತ",
    coordinates: { latitude: 14.2285, longitude: 74.8124 },
    category: "scenic",
    typicalDurationMinutes: 120,
    optimalTimeOfDay: "morning",
    descriptionEn: "India's second-highest plunge waterfall where the Sharavathi River drops 253 meters in four distinct streams: Raja, Roarer, Rocket, and Rani.",
    descriptionKn: "ಶರಾವತಿ ನದಿಯು ರಾಜ, ರೋರರ್, ರಾಕೆಟ್ ಮತ್ತು ರಾಣಿ ಎಂಬ ನಾಲ್ಕು ಕವಲುಗಳಲ್ಲಿ 253 ಮೀಟರ್ ಎತ್ತರದಿಂದ ಧುಮುಕುವ ಭಾರತದ ಅದ್ಭುತ ಜಲಪಾತ.",
    timingNoteEn: "Peak torrents occur during monsoon (July to October). Evening laser fountain show at 7:00 PM.",
    timingNoteKn: "ಜುಲೈ-ಅಕ್ಟೋಬರ್ ತಿಂಗಳಿನಲ್ಲಿ ಜಲಪಾತ ಅತ್ಯಂತ ಭೋರ್ಗರೆಯುತ್ತದೆ.",
    highlightMatch: "Jog Falls viewpoint and cascade amphitheater",
  },
  {
    id: "jogfalls-bottom-steps",
    name: "Watkins Platform & Gorge Bottom Steps",
    kannadaName: "ವಾಟ್ಕಿನ್ಸ್ ವೇದಿಕೆ ಮತ್ತು ಕಣಿವೆಯ ಮೆಟ್ಟಿಲುಗಳು",
    destinationId: "jogfalls",
    destinationName: "Jog Falls",
    destinationKannada: "ಜೋಗ ಜಲಪಾತ",
    coordinates: { latitude: 14.225, longitude: 74.814 },
    category: "adventure",
    typicalDurationMinutes: 120,
    optimalTimeOfDay: "morning",
    descriptionEn: "Challenging 1,400-step stone staircase descending deep into the misty spray pool at the base of the gorge.",
    descriptionKn: "ಜಲಪಾತದ ಬುಡಕ್ಕೆ ಸಾಗುವ 1,400 ಕಲ್ಲಿನ ಮೆಟ್ಟಿಲುಗಳ ಸಾಹಸಮಯ ಇಳಿಯುವಿಕೆ.",
    timingNoteEn: "Strenuous climb; carry drinking water. Closed by authorities during heavy monsoon spate for safety.",
    timingNoteKn: "ಮೆಟ್ಟಿಲು ಹತ್ತುವುದು ಕಷ್ಟಕರ; ಕುಡಿಯುವ ನೀರು ಕೊಂಡೊಯ್ಯಿರಿ.",
    highlightMatch: "Walk down 1,400 steps to the gorge floor (seasonal)",
  },
  {
    id: "jogfalls-linganamakki",
    name: "Linganamakki Dam & Sharavathi Reservoir",
    kannadaName: "ಲಿಂಗನಮಕ್ಕಿ ಅಣೆಕಟ್ಟು ಮತ್ತು ಹಿನ್ನೀರು",
    destinationId: "jogfalls",
    destinationName: "Jog Falls",
    destinationKannada: "ಜೋಗ ಜಲಪಾತ",
    coordinates: { latitude: 14.195, longitude: 74.838 },
    category: "nature",
    typicalDurationMinutes: 75,
    optimalTimeOfDay: "evening",
    descriptionEn: "Massive hydroelectric dam built in 1964 across the Sharavathi River creating expansive island-dotted backwaters.",
    descriptionKn: "1964 ರಲ್ಲಿ ನಿರ್ಮಿಸಲಾದ ಬೃಹತ್ ಜಲವಿದ್ಯುತ್ ಅಣೆಕಟ್ಟು ಹಾಗೂ ರಮಣೀಯ ಹಿನ್ನೀರು.",
    timingNoteEn: "Entry passes regulated by Karnataka Power Corporation at checkpoint.",
    timingNoteKn: "ಕೆಪಿಟಿಸಿಎಲ್ ಭದ್ರತಾ ತಪಾಸಣೆ ಇರುತ್ತದೆ.",
    highlightMatch: "Linganamakki Dam & Sharavathi backwaters",
  },
];

/* =========================================================================
   3. ESTIMATION CALCULATORS (HAVERSINE & ROAD TOPOGRAPHY)
   ========================================================================= */

/**
 * Standard Haversine formula to compute great-circle distance between two GPS coordinates (in km).
 */
export function calculateHaversineDistanceKm(
  c1: GeoCoordinates,
  c2: GeoCoordinates
): number {
  if (
    typeof c1?.latitude !== "number" ||
    typeof c1?.longitude !== "number" ||
    typeof c2?.latitude !== "number" ||
    typeof c2?.longitude !== "number"
  ) {
    return 0;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
  const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.latitude * Math.PI) / 180) *
      Math.cos((c2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Classifies geographic terrain between two points in Karnataka.
 */
export function classifyTerrainType(
  c1: GeoCoordinates,
  c2: GeoCoordinates,
  destinationId?: string
): "plains" | "ghats" | "coastal" {
  const ghatsDestinations = ["coorg", "chikmagalur", "jogfalls", "dandeli"];
  const coastalDestinations = ["gokarna", "udupi"];

  if (destinationId && ghatsDestinations.includes(destinationId)) {
    return "ghats";
  }
  if (destinationId && coastalDestinations.includes(destinationId)) {
    return "coastal";
  }

  // Geographic boundary fallback: Western Ghats corridor is roughly longitudes 74.5°E to 76.0°E
  const avgLon = (c1.longitude + c2.longitude) / 2;
  const avgLat = (c1.latitude + c2.latitude) / 2;

  if (avgLon < 74.8) {
    return "coastal";
  }
  if (avgLon >= 74.8 && avgLon <= 75.9 && avgLat >= 11.8 && avgLat <= 15.5) {
    return "ghats";
  }
  return "plains";
}

/**
 * Returns realistic road detour multiplier over straight-line haversine distance.
 * Ghat roads have numerous hairpin turns; plains have higher directness.
 */
export function getTerrainDetourMultiplier(terrain: "plains" | "ghats" | "coastal"): number {
  switch (terrain) {
    case "ghats":
      return 1.48; // ~48% detour factor on mountain passes (Shiradi, Charmadi, Agumbe)
    case "coastal":
      return 1.28; // ~28% detour factor on coastal NH 66 corridors
    case "plains":
    default:
      return 1.22; // ~22% detour factor on Deccan plateau highways
  }
}

/**
 * Realistic average speed (km/h) across Karnataka terrain by transport preference.
 */
export function getAverageSpeedKmph(
  transport: TransportPreference,
  terrain: "plains" | "ghats" | "coastal"
): number {
  switch (transport) {
    case "self-drive":
      return terrain === "ghats" ? 32 : terrain === "coastal" ? 45 : 55;
    case "taxi":
      return terrain === "ghats" ? 30 : terrain === "coastal" ? 42 : 52;
    case "two-wheeler":
      return terrain === "ghats" ? 28 : terrain === "coastal" ? 38 : 42;
    case "public":
      return terrain === "ghats" ? 25 : terrain === "coastal" ? 35 : 38;
    case "flexible":
    default:
      return terrain === "ghats" ? 30 : terrain === "coastal" ? 42 : 50;
  }
}

/**
 * Estimates a road transit leg between two consecutive stops.
 */
export function estimateRouteLeg(
  fromStopId: string,
  fromTitle: string,
  fromCoord: GeoCoordinates,
  toStopId: string,
  toTitle: string,
  toCoord: GeoCoordinates,
  transport: TransportPreference,
  destinationId: string
): RouteLeg {
  const haversine = calculateHaversineDistanceKm(fromCoord, toCoord);
  const terrain = classifyTerrainType(fromCoord, toCoord, destinationId);
  const multiplier = getTerrainDetourMultiplier(terrain);
  const roadDist = Math.max(1, Math.round(haversine * multiplier * 10) / 10);
  const speed = getAverageSpeedKmph(transport, terrain);

  let durationMinutes = Math.round((roadDist / speed) * 60);
  if (transport === "public") {
    // Add transit hub / bus stop boarding buffer
    durationMinutes += 15;
  }
  // Minimum transit time between distinct spots
  durationMinutes = Math.max(10, durationMinutes);

  const adviceEn =
    terrain === "ghats"
      ? `Scenic mountain winding road (~${roadDist} km est.). Drive in low engine gear; daylight transit advised.`
      : terrain === "coastal"
      ? `Coastal highway run (~${roadDist} km est.) via NH 66 corridor.`
      : `Plains highway connector (~${roadDist} km est.). Steady driving conditions.`;

  const adviceKn =
    terrain === "ghats"
      ? `ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ರಮಣೀಯ ತಿರುವು ರಸ್ತೆ (~${roadDist} ಕಿ.ಮೀ ಅಂದಾಜು). ಕಡಿಮೆ ಗೇರ್ ಬಳಸಿ; ಹಗಲಿನಲ್ಲಿ ಪ್ರಯಾಣಿಸಿ.`
      : terrain === "coastal"
      ? `NH 66 ಕರಾವಳಿ ಹೆದ್ದಾರಿ ಮಾರ್ಗ (~${roadDist} ಕಿ.ಮೀ ಅಂದಾಜು).`
      : `ಬಯಲುಸೀಮೆ ಹೆದ್ದಾರಿ ಸಂಪರ್ಕ (~${roadDist} ಕಿ.ಮೀ ಅಂದಾಜು).`;

  const googleMapsDirUrl = getGoogleMapsDirectionsUrl(fromCoord, toCoord, transport);

  return {
    fromStopId,
    toStopId,
    fromTitle,
    toTitle,
    haversineDistanceKm: haversine,
    estimatedRoadDistanceKm: roadDist,
    estimatedDurationMinutes: durationMinutes,
    terrainType: terrain,
    transportMode: transport,
    transitAdviceEn: adviceEn,
    transitAdviceKn: adviceKn,
    googleMapsDirUrl,
  };
}

/* =========================================================================
   4. EXTERNAL NAVIGATION & SEARCH LINK GENERATORS (SAFE / NON-PROPRIETARY)
   ========================================================================= */

/**
 * Standard Google Maps Place Search URL (no API keys required, works on all devices).
 */
export function getGoogleMapsSearchUrl(
  title: string,
  destinationName: string,
  coord?: GeoCoordinates
): string {
  const query = coord
    ? `${coord.latitude},${coord.longitude}`
    : `${title}, ${destinationName}, Karnataka, India`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Standard Google Maps Directions URL between two coordinates.
 */
export function getGoogleMapsDirectionsUrl(
  origin: GeoCoordinates,
  destination: GeoCoordinates,
  mode: TransportPreference
): string {
  const travelMode =
    mode === "two-wheeler" ? "two-wheeler" : mode === "public" ? "transit" : "driving";
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=${travelMode}`;
}

/**
 * Resolves coordinates for a known start hub or returns sensible fallback.
 */
export function resolveOriginCoordinates(startingLocation: string): GeoCoordinates {
  const clean = startingLocation.toLowerCase().trim();
  for (const [hub, coord] of Object.entries(STARTING_HUBS_COORDINATES)) {
    if (clean.includes(hub)) {
      return coord;
    }
  }
  // Default to Bengaluru coordinates if unknown
  return STARTING_HUBS_COORDINATES.bengaluru;
}

/**
 * Resolves destination center coordinates.
 */
export function resolveDestinationCoordinates(destinationId: string): GeoCoordinates {
  return (
    DESTINATION_CENTER_COORDINATES[destinationId.toLowerCase()] ||
    STARTING_HUBS_COORDINATES.bengaluru
  );
}
