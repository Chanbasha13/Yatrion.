export type ExperienceCategoryId = "heritage" | "nature" | "coastal" | "wildlife" | "culture";

export type RegionId =
  | "North Karnataka"
  | "South Karnataka"
  | "Western Ghats"
  | "Coastal Karnataka"
  | "Nilgiri Biosphere";

export interface Destination {
  id: string;
  name: string;
  kannadaName: string;
  district: string;
  region: RegionId;
  category: ExperienceCategoryId;
  categories: ExperienceCategoryId[];
  categoryLabel: string;
  tag: string;
  image: string;
  imageAlt: string;
  description: string;
  detailedDescription: string;
  idealDuration: string;
  durationDays: number; // For deterministic sorting
  bestSeason: string;
  estimatedDailyBudget: string;
  budgetTier: "Budget" | "Moderate" | "Comfort";
  highlights: string[];
  culturalNote: string;
  transitTip: string;
}

export const DESTINATIONS: Destination[] = [
  {
    id: "hampi",
    name: "Hampi",
    kannadaName: "ಹಂಪಿ",
    region: "North Karnataka",
    district: "Vijayanagara",
    category: "heritage",
    categories: ["heritage", "culture"],
    categoryLabel: "Heritage & Architecture",
    tag: "UNESCO World Heritage",
    image: "/images/destinations/hampi.jpg",
    imageAlt: "Virupaksha Temple rising above ancient stone ruins in Hampi, Karnataka",
    description:
      "The 14th-century capital of the Vijayanagara Empire, famed for monolithic granite monuments, boulder-strewn hills, and royal temple complexes along the Tungabhadra River.",
    detailedDescription:
      "Spread over 4,100 hectares, Hampi preserves the magnificent ruins of Vijayanagara, once one of the world's richest cities. Its landscape of weathered granite boulders, date palms, and stepped aqueducts cradles over 1,600 surviving monuments, including the iconic stone chariot of Vittala Temple and the still-active Virupaksha pilgrimage complex.",
    idealDuration: "2 – 3 Days",
    durationDays: 2.5,
    bestSeason: "October to March",
    estimatedDailyBudget: "₹1,500 – ₹3,000 / day (est.)",
    budgetTier: "Moderate",
    highlights: [
      "Virupaksha Temple & Hampi Bazaar",
      "Vittala Temple & Stone Chariot",
      "Sunset from Matanga Hill",
      "Coracle ride on Tungabhadra River",
    ],
    culturalNote:
      "Host to the annual Hampi Utsav celebrating classical Carnatic music, dance, and Vijayanagara royal heritage.",
    transitTip:
      "Nearest railway station is Hosapete (13 km), connected by overnight trains from Bengaluru, Mysuru, and Hubballi.",
  },
  {
    id: "mysuru",
    name: "Mysuru",
    kannadaName: "ಮೈಸೂರು",
    region: "South Karnataka",
    district: "Mysuru",
    category: "heritage",
    categories: ["heritage", "culture"],
    categoryLabel: "Royal Heritage & Culture",
    tag: "City of Palaces",
    image: "/images/destinations/mysuru.jpg",
    imageAlt: "Indo-Saracenic facade of the Mysore Palace in morning light",
    description:
      "Karnataka's cultural heart, renowned for the Indo-Saracenic Mysore Palace, centuries-old silk weaving traditions, fragrant sandalwood, and royal Dasara festivities.",
    detailedDescription:
      "Ruled by the Wodeyar dynasty for over six centuries, Mysuru blends grand European and Dravidian architecture with vibrant living traditions. Its streets are scented with jasmine, incense, and freshly brewed filter coffee, leading to royal palaces, century-old spice markets, and world-renowned yoga schools.",
    idealDuration: "2 Days",
    durationDays: 2,
    bestSeason: "September to March",
    estimatedDailyBudget: "₹1,800 – ₹3,500 / day (est.)",
    budgetTier: "Moderate",
    highlights: [
      "Amba Vilas (Mysore Palace)",
      "Chamundi Hill & Nandi Bull",
      "Devaraja Market spice & flower stalls",
      "Karanji Lake & Nature Sanctuary",
    ],
    culturalNote:
      "Birthplace of Mysore Pak confection and the global epicenter of traditional Ashtanga yoga practice.",
    transitTip:
      "Frequent Shatabdi and Vande Bharat Express trains connect Bengaluru to Mysuru in under 2 hours.",
  },
  {
    id: "coorg",
    name: "Coorg (Kodagu)",
    kannadaName: "ಕೊಡಗು",
    region: "Western Ghats",
    district: "Kodagu",
    category: "nature",
    categories: ["nature", "culture"],
    categoryLabel: "Nature & Hill Stations",
    tag: "Coffee Highlands",
    image: "/images/destinations/coorg.jpg",
    imageAlt: "Abbey Falls cascading through lush rainforest in Madikeri, Coorg",
    description:
      "Misty highlands carpeted with Arabica coffee plantations, pepper vines, cascading waterfalls, and the distinct culture and hospitality of the Kodava community.",
    detailedDescription:
      "Perched on the eastern slopes of the Western Ghats, Kodagu is a verdant biodiversity hotspot. Shrouded in morning mist, its rolling ridges are lined with shaded coffee estates, sacred groves (Devarakadu), and traditional Kodava ainmanes (ancestral homes) offering generous local hospitality.",
    idealDuration: "3 Days",
    durationDays: 3,
    bestSeason: "October to April",
    estimatedDailyBudget: "₹2,200 – ₹4,500 / day (est.)",
    budgetTier: "Moderate",
    highlights: [
      "Abbey Falls & Iruppu Falls",
      "Raja's Seat sunset viewpoint",
      "Dubare Elephant Camp on Cauvery",
      "Coffee & spice plantation walking tours",
    ],
    culturalNote:
      "Known for Kodava warrior traditions, unique attire (Kupya), and flavorful Pandi curry made with Kachampuli vinegar.",
    transitTip:
      "Accessible by scenic 5-hour drive or KSRTC Club Class buses from Bengaluru via Mysuru.",
  },
  {
    id: "gokarna",
    name: "Gokarna",
    kannadaName: "ಗೋಕರ್ಣ",
    region: "Coastal Karnataka",
    district: "Uttara Kannada",
    category: "coastal",
    categories: ["coastal", "culture"],
    categoryLabel: "Beaches & Coastal Escapes",
    tag: "Coastal Trails",
    image: "/images/destinations/gokarna.jpg",
    imageAlt: "Sweeping view of Om Beach coastline and cliffs in Gokarna, Karnataka",
    description:
      "Pristine Arabian Sea shores bordered by dramatic Western Ghats headlands, an ancient Mahabaleshwar temple, and scenic five-beach cliff walking trails.",
    detailedDescription:
      "Located at the convergence of the Gangavali and Aghanashini rivers, Gokarna offers an unhurried coastal rhythm. Rocky headlands divide five natural crescent beaches—Kudle, Om, Half Moon, Paradise, and Main Beach—providing one of India's most scenic coastal trekking routes alongside ancient Shaivite temple rituals.",
    idealDuration: "2 – 3 Days",
    durationDays: 2.5,
    bestSeason: "October to March",
    estimatedDailyBudget: "₹1,200 – ₹2,500 / day (est.)",
    budgetTier: "Budget",
    highlights: [
      "Om Beach & Kudle Beach cliff trail",
      "Paradise Beach boat trek",
      "Mahabaleshwar Temple & Kotiteertha",
      "Sunset viewpoints from rocky bluffs",
    ],
    culturalNote:
      "A sacred Shaivite pilgrimage center where the Atmalinga is revered, preserving traditional Vedic chanting schools.",
    transitTip:
      "Gokarna Road railway station connects to the scenic Konkan Railway network running between Mumbai and Mangaluru.",
  },
  {
    id: "chikmagalur",
    name: "Chikkamagaluru",
    kannadaName: "ಚಿಕ್ಕಮಗಳೂರು",
    region: "Western Ghats",
    district: "Chikkamagaluru",
    category: "nature",
    categories: ["nature", "heritage"],
    categoryLabel: "Nature & Hill Stations",
    tag: "Coffee Origins",
    image: "/images/destinations/chikmagalur.jpg",
    imageAlt: "Rolling green ridges of Mullayanagiri peak in Chikkamagaluru, Karnataka",
    description:
      "The historic cradle of coffee in India where Baba Budan first planted beans in the 17th century, crowned by Mullayanagiri, Karnataka's highest mountain peak.",
    detailedDescription:
      "Nestled against the Chandra Drona hill range, Chikkamagaluru combines high-altitude trekking with deep agrarian heritage. Mullayanagiri rises to 1,930 meters, offering breathtaking views over cloud-draped valleys, while heritage coffee bungalows offer bean-to-cup immersion.",
    idealDuration: "2 – 3 Days",
    durationDays: 2.5,
    bestSeason: "September to May",
    estimatedDailyBudget: "₹2,000 – ₹4,000 / day (est.)",
    budgetTier: "Moderate",
    highlights: [
      "Mullayanagiri Peak summit (1,930 m)",
      "Baba Budangiri sacred hill ridge",
      "Hebbe Falls rainforest trek",
      "Heritage coffee estate stays",
    ],
    culturalNote:
      "Origin point of Indian coffee heritage; Baba Budangiri is also a centuries-old syncretic pilgrimage shrine.",
    transitTip:
      "Direct KSRTC buses and 4.5-hour highway drive from Bengaluru via Hassan and Belur.",
  },
  {
    id: "bandipur",
    name: "Bandipur & Kabini",
    kannadaName: "ಬಂಡೀಪುರ ಮತ್ತು ಕಬಿನಿ",
    region: "Nilgiri Biosphere",
    district: "Chamarajanagar",
    category: "wildlife",
    categories: ["wildlife", "nature"],
    categoryLabel: "Wildlife & Outdoors",
    tag: "Protected Forest",
    image: "/images/experiences/wildlife.jpg",
    imageAlt: "Wild Asian elephant herd walking through Bandipur National Park, Karnataka",
    description:
      "Dense dry-deciduous teak forests forming a critical sanctuary for Bengal tigers, Asian elephants, and leopards along the banks of the Kabini reservoir.",
    detailedDescription:
      "Part of the UNESCO Nilgiri Biosphere Reserve spanning Karnataka, Tamil Nadu, and Kerala, this contiguous forest tract holds the world's largest population of wild Asian elephants. Safari boat trips on the Kabini reservoir and open-top jungle drives offer exceptional wildlife encounters.",
    idealDuration: "2 Days",
    durationDays: 2,
    bestSeason: "October to May",
    estimatedDailyBudget: "₹3,500 – ₹7,000 / day (est.)",
    budgetTier: "Comfort",
    highlights: [
      "Kabini River boat safari",
      "Bandipur National Park morning jeep safari",
      "Himavad Gopalaswamy Betta hill temple",
      "Nilgiri Biosphere birdwatching",
    ],
    culturalNote:
      "One of India's earliest designated Project Tiger reserves, featuring strict conservation protocols.",
    transitTip:
      "Located 80 km south of Mysuru along the highway towards Ooty, easily reached by taxi or state buses.",
  },
  {
    id: "badami",
    name: "Badami & Pattadakal",
    kannadaName: "ಬಾದಾಮಿ ಮತ್ತು ಪಟ್ಟದಕಲ್ಲು",
    region: "North Karnataka",
    district: "Bagalkote",
    category: "heritage",
    categories: ["heritage", "culture"],
    categoryLabel: "Heritage & Architecture",
    tag: "Chalukyan Rock Architecture",
    image: "/images/destinations/badami.jpg",
    imageAlt: "Ancient rock-cut cave temple overlooking red sandstone cliffs in Badami, Karnataka",
    description:
      "The 6th-century capital of the Early Chalukyas, renowned for rock-cut sandstone cave temples, the serene Agastya Lake, and UNESCO monuments at Pattadakal.",
    detailedDescription:
      "Carved directly into red sandstone cliffs surrounding the emerald waters of Agastya Lake, Badami's four cave temples display breathtaking Chalukyan rock sculpture. Just 22 km away lies Pattadakal, a UNESCO World Heritage site where northern Nagara and southern Dravidian temple styles harmoniously converged.",
    idealDuration: "2 Days",
    durationDays: 2,
    bestSeason: "October to March",
    estimatedDailyBudget: "₹1,400 – ₹2,800 / day (est.)",
    budgetTier: "Budget",
    highlights: [
      "Badami Cave Temples (Caves 1–4)",
      "Bhutanatha Temple cluster on Agastya Lake",
      "UNESCO World Heritage complex at Pattadakal",
      "Aihole: The cradle of Indian temple architecture",
    ],
    culturalNote:
      "Known for traditional Ilkal sarees woven with Kasuti embroidery and authentic North Karnataka jolada rotti meals.",
    transitTip:
      "Badami railway station connects directly to Hubballi and Solapur. Frequent local buses connect to Pattadakal and Aihole.",
  },
  {
    id: "belur",
    name: "Belur & Halebidu",
    kannadaName: "ಬೇಲೂರು ಮತ್ತು ಹಳೇಬೀಡು",
    region: "South Karnataka",
    district: "Hassan",
    category: "heritage",
    categories: ["heritage", "culture"],
    categoryLabel: "Heritage & Architecture",
    tag: "Hoysala UNESCO Temples",
    image: "/images/destinations/belur.jpg",
    imageAlt: "Intricate soapstone carvings on the exterior walls of Chennakeshava Temple in Belur, Karnataka",
    description:
      "The jewel of Hoysala architecture, celebrated for Chennakeshava and Hoysaleshwara temples with intricate soapstone filigree carvings inscribed as UNESCO World Heritage.",
    detailedDescription:
      "Built in the 12th century by Hoysala rulers, these temples represent the pinnacle of medieval South Indian stone carving. Every square inch of chloritic schist (soapstone) is carved with micro-sculptures of celestial dancers (Madanikas), epics, wildlife, and mythological motifs that appear as delicate as ivory work.",
    idealDuration: "1 – 2 Days",
    durationDays: 1.5,
    bestSeason: "September to March",
    estimatedDailyBudget: "₹1,200 – ₹2,400 / day (est.)",
    budgetTier: "Budget",
    highlights: [
      "Chennakeshava Temple Belur (UNESCO)",
      "Hoysaleshwara Temple Halebidu (UNESCO)",
      "Intricately carved Madanika brackets",
      "Pushkarani stepped temple tank",
    ],
    culturalNote:
      "Recently inscribed as a UNESCO World Heritage site under 'Sacred Ensembles of the Hoysalas'.",
    transitTip:
      "Located 38 km from Hassan railway junction, easily visited on a day trip from Bengaluru (4 hours) or Mysuru (3 hours).",
  },
  {
    id: "udupi",
    name: "Udupi & Malpe",
    kannadaName: "ಉಡುಪಿ ಮತ್ತು ಮಲ್ಪೆ",
    region: "Coastal Karnataka",
    district: "Udupi",
    category: "coastal",
    categories: ["coastal", "culture"],
    categoryLabel: "Beaches & Coastal Escapes",
    tag: "Temple Town & Islands",
    image: "/images/destinations/udupi.jpg",
    imageAlt: "Hexagonal basaltic rock columns of St. Mary's Island near Malpe Beach, Udupi",
    description:
      "Famous temple town and culinary capital known for the 13th-century Krishna Matha, pristine Malpe Beach, and the unique columnar basalt formations of St. Mary's Island.",
    detailedDescription:
      "Udupi is synonymous with authentic coastal Karnataka heritage and vegetarian gastronomy. The town revolves around the historic Sri Krishna Matha founded by saint Madhvacharya, while 6 km west lies Malpe port, where ferries run to the geological wonder of St. Mary's Island.",
    idealDuration: "2 Days",
    durationDays: 2,
    bestSeason: "October to March",
    estimatedDailyBudget: "₹1,500 – ₹3,000 / day (est.)",
    budgetTier: "Moderate",
    highlights: [
      "Sri Krishna Matha & Kanakana Kindi",
      "St. Mary's Island basaltic rock formations",
      "Malpe Beach & Sea Walkway",
      "Kaup Lighthouse sunset & beach",
    ],
    culturalNote:
      "Origin of worldwide 'Udupi cuisine', Masala Dosa, and the elaborate Paryaya festival held every two years.",
    transitTip:
      "Udupi is a major stop on the Konkan Railway network, located 60 km north of Mangaluru International Airport.",
  },
  {
    id: "jogfalls",
    name: "Jog Falls & Sharavathi",
    kannadaName: "ಜೋಗ ಜಲಪಾತ",
    region: "Western Ghats",
    district: "Shivamogga",
    category: "nature",
    categories: ["nature", "wildlife"],
    categoryLabel: "Nature & Hill Stations",
    tag: "India's Grand Cascade",
    image: "/images/destinations/jogfalls.jpg",
    imageAlt: "Mighty cascades of Jog Falls dropping into the deep gorge of Sharavathi River, Karnataka",
    description:
      "India's second-highest plunge waterfall where the Sharavathi River drops 253 meters in four distinct cascades: Raja, Roarer, Rocket, and Rani.",
    detailedDescription:
      "Set amidst the dense rainforests of the Western Ghats in Shivamogga district, Jog Falls is a spectacular sight during and after the southwest monsoon. The deep canyon viewpoint provides panoramic vistas over the mist-filled gorge and the surrounding Sharavathi Valley wildlife sanctuary.",
    idealDuration: "1 – 2 Days",
    durationDays: 1.5,
    bestSeason: "July to November",
    estimatedDailyBudget: "₹1,200 – ₹2,200 / day (est.)",
    budgetTier: "Budget",
    highlights: [
      "Viewpoint of four distinct cascades (Raja, Roarer, Rocket, Rani)",
      "Sharavathi Valley Wildlife Sanctuary",
      "Honnemardu water sports and island camping",
      "Watkins Platform gorge views",
    ],
    culturalNote:
      "Powerhouse of Karnataka's earliest hydroelectric projects, celebrated in Kannada literature and cinema.",
    transitTip:
      "Talguppa railway station is 14 km away. Direct KSRTC buses run regularly from Shivamogga, Sagara, and Bengaluru.",
  },
  {
    id: "dandeli",
    name: "Dandeli",
    kannadaName: "ದಾಂಡೇಲಿ",
    region: "Western Ghats",
    district: "Uttara Kannada",
    category: "wildlife",
    categories: ["wildlife", "nature"],
    categoryLabel: "Wildlife & Outdoors",
    tag: "River Rapids & Canopy",
    image: "/images/destinations/dandeli.jpg",
    imageAlt: "Lush deciduous forests along the Kali River in Dandeli, Karnataka",
    description:
      "An adventure and eco-tourism hub on the banks of the Kali River, featuring white-water rafting, hornbill birdwatching, and dense moist-deciduous forest reserves.",
    detailedDescription:
      "Surrounded by the Dandeli-Anshi Tiger Reserve (Kali Tiger Reserve), Dandeli is Karnataka's premier outdoor activity center. The turbulent rapids of the Kali River provide thrilling class 2 and 3 white-water rafting, while the dense jungle canopy shelter black panthers, giant squirrels, and all four South Indian hornbill species.",
    idealDuration: "2 – 3 Days",
    durationDays: 2.5,
    bestSeason: "October to May",
    estimatedDailyBudget: "₹2,000 – ₹4,000 / day (est.)",
    budgetTier: "Moderate",
    highlights: [
      "Kali River white-water rafting",
      "Dandeli-Anshi Tiger Reserve jungle safari",
      "Syntheri Rocks monolithic granite formation",
      "Hornbill birdwatching along riverbanks",
    ],
    culturalNote:
      "Home to the indigenous Gowli and Siddi communities, preserving distinctive Afro-Indian folk traditions.",
    transitTip:
      "Located 75 km from Hubballi and 55 km from Belagavi. Direct buses run from Hubballi, Dharwad, and Belagavi.",
  },
];

export interface ExperienceCategory {
  id: ExperienceCategoryId;
  title: string;
  tagline: string;
  description: string;
  image: string;
  imageAlt: string;
  destinationCount: number;
  featuredPlaces: string[];
}

export const EXPERIENCE_CATEGORIES: ExperienceCategory[] = [
  {
    id: "heritage",
    title: "Heritage & Architecture",
    tagline: "Stone empires and royal dynasties",
    description:
      "Explore UNESCO ruins, Hoysala soapstone-carved temples, and Indo-Saracenic royal palaces that shaped South Indian history.",
    image: "/images/destinations/hampi.jpg",
    imageAlt: "Ancient stone architecture of Hampi ruins in Karnataka",
    destinationCount: 4,
    featuredPlaces: ["Hampi", "Mysuru", "Badami", "Belur & Halebidu"],
  },
  {
    id: "nature",
    title: "Nature & Hill Stations",
    tagline: "Misty coffee slopes and waterfalls",
    description:
      "Breathe the crisp air of Western Ghats highlands, wander through aromatic coffee estates, and marvel at roaring waterfalls.",
    image: "/images/destinations/chikmagalur.jpg",
    imageAlt: "Misty mountains and coffee hills of Chikkamagaluru",
    destinationCount: 4,
    featuredPlaces: ["Coorg", "Chikkamagaluru", "Jog Falls", "Dandeli"],
  },
  {
    id: "coastal",
    title: "Beaches & Coastal Escapes",
    tagline: "Golden cliffs and Arabian Sea shores",
    description:
      "Wander uncrowded beaches, hike coastal headlands, and explore sacred coastal shrines along 320 km of Karnataka shoreline.",
    image: "/images/destinations/gokarna.jpg",
    imageAlt: "Scenic coastline and beaches of Gokarna, Karnataka",
    destinationCount: 2,
    featuredPlaces: ["Gokarna", "Udupi & Malpe", "St. Mary's Island"],
  },
  {
    id: "wildlife",
    title: "Wildlife & Outdoor Adventures",
    tagline: "Tiger reserves and river rapids",
    description:
      "Encounter wild Asian elephants, Bengal tigers, and riverine ecosystems across premier national parks and whitewater rivers.",
    image: "/images/experiences/wildlife.jpg",
    imageAlt: "Wild elephant in Karnataka's protected forests",
    destinationCount: 3,
    featuredPlaces: ["Bandipur & Kabini", "Dandeli Rapids", "Sharavathi Sanctuary"],
  },
  {
    id: "culture",
    title: "Culture & Local Food",
    tagline: "Coastal curries and royal confections",
    description:
      "Savor authentic regional flavors from Udupi temple feasts and fiery coastal cuisine to royal Mysore Pak and Kodava specialties.",
    image: "/images/experiences/cuisine.jpg",
    imageAlt: "Traditional Karnataka Masala Dosa and filter coffee",
    destinationCount: 6,
    featuredPlaces: ["Udupi", "Mysuru", "Coorg", "Badami"],
  },
];
