/**
 * Karnataka Heritage, Architecture & Living Traditions Knowledge Module
 * Authoritative, culturally verified information across Karnataka's historical eras.
 */

export interface DynastyRecord {
  id: string;
  name: string;
  kannadaName: string;
  era: string;
  capital: string;
  keyMonuments: string[];
  architecturalStyle: string;
  descriptionEn: string;
  descriptionKn: string;
}

export const KARNATAKA_DYNASTIES: DynastyRecord[] = [
  {
    id: "chalukya",
    name: "Badami Chalukyas",
    kannadaName: "ಬಾದಾಮಿ ಚಾಲುಕ್ಯರು",
    era: "6th – 8th Century CE",
    capital: "Vatapi (modern Badami)",
    keyMonuments: ["Badami Cave Temples", "Pattadakal UNESCO Group", "Aihole Durga Temple"],
    architecturalStyle: "Vesara (blend of Nagara and Dravidian rock-cut styles)",
    descriptionEn:
      "Pioneers of rock-cut cave temple architecture in South India. They transformed the sandstone cliffs of Badami into magnificent multi-tiered shrines dedicated to Shiva, Vishnu, and Jain Tirthankaras.",
    descriptionKn:
      "ದಕ್ಷಿಣ ಭಾರತದ ಶಿಲಾ-ಕೊರೆದ ಗುಹಾಂತರ ವಾಸ್ತುಶಿಲ್ಪದ ಪ್ರವರ್ತಕರು. ಬಾದಾಮಿಯ ಕೆಂಪು ಮರಳುಗಲ್ಲಿನ ಬಂಡೆಗಳನ್ನು ಶಿವ, ವಿಷ್ಣು ಮತ್ತು ಜೈನ ತೀರ್ಥಂಕರರ ಭವ್ಯ ದೇಗುಲಗಳನ್ನಾಗಿ ಪರಿವರ್ತಿಸಿದರು.",
  },
  {
    id: "hoysala",
    name: "Hoysala Empire",
    kannadaName: "ಹೊಯ್ಸಳ ಸಾಮ್ರಾಜ್ಯ",
    era: "10th – 14th Century CE",
    capital: "Dorasamudra (modern Halebidu)",
    keyMonuments: ["Belur Chennakeshava Temple", "Halebidu Hoysaleshwara Temple", "Somnathapura Keshava Temple"],
    architecturalStyle: "Stellate (Star-shaped) chloritic schist (soapstone) filigree carving",
    descriptionEn:
      "Masters of intricate stone filigree. Their temples feature multi-pointed star-shaped platforms (jagati) adorned with horizontal bands of carved elephants, lions, cavalry, floral scrolls, and celestial dancers (Madanikas).",
    descriptionKn:
      "ಬಳಪದ ಕಲ್ಲಿನಲ್ಲಿ ಅತ್ಯದ್ಭುತ ಸೂಕ್ಷ್ಮ ಕೆತ್ತನೆಯ ಶಿಲ್ಪಿಗಳು. ನಕ್ಷತ್ರಾಕಾರದ ಜಗತಿಯ ಮೇಲೆ ಆನೆ, ಸಿಂಹ, ಬಳ್ಳಿಗಳು ಮತ್ತು ಮದನಿಕೆಯರ ಸೌಂದರ್ಯವನ್ನು ಜೀವಂತಗೊಳಿಸಿದ ಶ್ರೇಷ್ಠ ಪರಂಪರೆ.",
  },
  {
    id: "vijayanagara",
    name: "Vijayanagara Empire",
    kannadaName: "ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯ",
    era: "1336 – 1646 CE",
    capital: "Vijayanagara (Hampi)",
    keyMonuments: ["Virupaksha Temple", "Vittala Temple Stone Chariot", "Lotus Mahal", "Elephant Stables"],
    architecturalStyle: "Monumental Vijayanagara Granite Dravidian with pillared mandapas and musical columns",
    descriptionEn:
      "Once one of the world's wealthiest capitals along the Tungabhadra River. Celebrated for monolithic granite sculptures, pillared Kalyana Mandapas, soaring Raya Gopurams, and the iconic monolithic Stone Chariot.",
    descriptionKn:
      "ತುಂಗಭದ್ರಾ ತೀರದಲ್ಲಿ ವಿಶ್ವದ ಅತ್ಯಂತ ಶ್ರೀಮಂತ ಸಾಮ್ರಾಜ್ಯಗಳಲ್ಲಿ ಒಂದಾಗಿದ್ದ ವಿಜಯನಗರ. ಕಲ್ಲಿನ ರಥ, ನಾದಸ್ವರ ಕಂಬಗಳು, ಭವ್ಯ ರಾಯಗೋಪುರಗಳು ಮತ್ತು ಕಲ್ಯಾಣ ಮಂಟಪಗಳ ಶಿಲ್ಪಕಲಾ ವೈಭವ.",
  },
  {
    id: "wodeyar",
    name: "Wodeyars of Mysuru",
    kannadaName: "ಮೈಸೂರು ಒಡೆಯರ್ ಸಂಸ್ಥಾನ",
    era: "1399 – 1950 CE",
    capital: "Mysuru",
    keyMonuments: ["Mysore Palace (Amba Vilas)", "Jaganmohan Palace", "Chamundeshwari Temple", "Lalitha Mahal"],
    architecturalStyle: "Indo-Saracenic (Harmonious fusion of Hindu, Rajput, Mughal, and Gothic architecture)",
    descriptionEn:
      "Patrons of classical Carnatic music, Kannada literature, silk weaving, and grand festival traditions, best embodied in the 10-day state celebration of Mysore Dasara.",
    descriptionKn:
      "ಶಾಸ್ತ್ರೀಯ ಕರ್ನಾಟಕ ಸಂಗೀತ, ಕನ್ನಡ ಸಾಹಿತ್ಯ, ಮೈಸೂರು ರೇಷ್ಮೆ ಮತ್ತು 10 ದಿನಗಳ ದಸರಾ ಮಹೋತ್ಸವದ (ನಾಡಹಬ್ಬ) ಮಹಾನ್ ಪೋಷಕರು.",
  },
];

export interface CulturalTradition {
  id: string;
  name: string;
  kannadaName: string;
  region: string;
  descriptionEn: string;
  descriptionKn: string;
  practicalTip: string;
}

export const CULTURAL_TRADITIONS: CulturalTradition[] = [
  {
    id: "yakshagana",
    name: "Yakshagana",
    kannadaName: "ಯಕ್ಷಗಾನ",
    region: "Coastal Karnataka & Malnad",
    descriptionEn:
      "A 500-year-old theatrical dance drama combining heavy percussion (Chande & Maddale), high-pitched singing (Bhagavathike), elaborate gilded headgear (Mudi), vibrant facial makeup, and spontaneous philosophical dialogue depicting epics like Mahabharata and Ramayana.",
    descriptionKn:
      "ಕರಾವಳಿ ಮತ್ತು ಮಲೆನಾಡಿನ 500 ವರ್ಷಗಳ ಸಾಂಪ್ರದಾಯಿಕ ನೃತ್ಯ-ನಾಟಕ. ಚಂಡೆ, ಮದ್ದಳೆ, ಭಾಗವತಿಕೆ, ಭವ್ಯ ಮುಂಡಾಸು ಮತ್ತು ತಾತ್ವಿಕ ಸಂಭಾಷಣೆಗಳ ಅದ್ಭುತ ಕಲಾ ಪ್ರಕಾರ.",
    practicalTip: "All-night performances (Aata) take place during dry winter and summer months in open-air temple grounds.",
  },
  {
    id: "kambala",
    name: "Kambala Buffalo Slush Race",
    kannadaName: "ಕಂಬಳ",
    region: "Dakshina Kannada & Udupi",
    descriptionEn:
      "A traditional annual festival where pairs of prized buffaloes sprint across slushy paddy fields harnessed by swift jockeys, celebrating agrarian heritage and reverence for nature.",
    descriptionKn:
      "ಕರಾವಳಿಯ ಗದ್ದೆಗಳಲ್ಲಿ ನಡೆಯುವ ಸಾಂಪ್ರದಾಯಿಕ ಕೋಣಗಳ ಓಟ. ಕೃಷಿ ಸಂಸ್ಕೃತಿ ಮತ್ತು ಗ್ರಾಮೀಣ ಕ್ರೀಡೆಯ ಅದ್ಭುತ ಆಚರಣೆ.",
    practicalTip: "Held on weekends between November and March across coastal villages like Moodabidri and Puttur.",
  },
  {
    id: "dasara",
    name: "Mysore Dasara (Nada Habba)",
    kannadaName: "ಮೈಸೂರು ದಸರಾ (ನಾಡಹಬ್ಬ)",
    region: "Mysuru & South Karnataka",
    descriptionEn:
      "Karnataka's state festival spanning 10 days in autumn, culminating in Vijayadashami when the lead tusker carries the 750-kg golden howdah (Chinnada Ambari) bearing Goddess Chamundeshwari through illuminated Mysuru.",
    descriptionKn:
      "ಕರ್ನಾಟಕದ 10 ದಿನಗಳ ನಾಡಹಬ್ಬ. ವಿಜಯದಶಮಿಯಂದು 750 ಕೆಜಿ ತೂಕದ ಚಿನ್ನದ ಅಂಬಾರಿಯಲ್ಲಿ ತಾಯಿ ಚಾಮುಂಡೇಶ್ವರಿಯ ಜಂಬೂಸವಾರಿ ಮೆರವಣಿಗೆ ನಡೆಯುತ್ತದೆ.",
    practicalTip: "Mysore Palace is illuminated with nearly 100,000 light bulbs every evening during Dasara.",
  },
];

export const TEMPLE_ETIQUETTE_GUIDANCE = {
  en: `### Sacred Temple Etiquette in Karnataka:
1. **Footwear:** Remove shoes and socks at designated temple Chappal stands before stepping onto the stone prakara (courtyard).
2. **Dress Code:** Wear modest clothing covering shoulders and knees (Dhoti, Kurta, Saree, or trousers with modest tops). Avoid shorts, beachwear, or sleeveless garments.
3. **Circumambulation (Pradakshina):** Always walk around the inner sanctum in a clockwise direction.
4. **Photography Protocol:** Photography is strictly prohibited inside the inner sanctum (Garbhagriha) to respect spiritual sanctity and priest rituals.
5. **Silence & Offerings:** Maintain a calm, respectful presence; seek blessings (Prasada/Theertha) with the right hand placed gently over the left palm.`,
  kn: `### ಕರ್ನಾಟಕದ ದೇವಸ್ಥಾನಗಳ ಪವಿತ್ರ ಶಿಷ್ಟಾಚಾರ:
1. **ಪಾದರಕ್ಷೆಗಳು:** ದೇವಸ್ಥಾನದ ಪ್ರಾಕಾರ ಪ್ರವೇಶಿಸುವ ಮುನ್ನ ನಿಗದಿತ ಚಪ್ಪಲಿ ಕೌಂಟರ್‌ನಲ್ಲಿ ಪಾದರಕ್ಷೆ ಬಿಡಿ.
2. **ಉಡುಪು:** ಸಂಪ್ರದಾಯಬದ್ಧ ಉಡುಪು ಧರಿಸಿ (ಧೋತಿ, ಕುರ್ತಾ, ಸೀರೆ ಅಥವಾ ಮೈಮುಚ್ಚುವ ಸಭ್ಯ ವಸ್ತ್ರಗಳು).
3. **ಪ್ರದಕ್ಷಿಣೆ:** ಗರ್ಭಗುಡಿಯ ಸುತ್ತಲೂ ಯಾವಾಗಲೂ ಪ್ರದಕ್ಷಿಣಾಕಾರವಾಗಿ (Clockwise) ಸಾಗಿ.
4. **ಛಾಯಾಗ್ರಹಣ ನಿರ್ಬಂಧ:** ಗರ್ಭಗುಡಿಯ ಒಳಗೆ ಛಾಯಾಗ್ರಹಣವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ನಿಷೇಧಿಸಲಾಗಿದೆ.
5. **ತೀರ್ಥ-ಪ್ರಸಾದ:** ತೀರ್ಥ ಅಥವಾ ಪ್ರಸಾದ ಸ್ವೀಕರಿಸುವಾಗ ಬಲಗೈಯನ್ನು ಎಡಗೈಯ ಮೇಲಿಟ್ಟು ಶ್ರದ್ಧೆಯಿಂದ ಸ್ವೀಕರಿಸಿ.`,
};

