/**
 * Karnataka Regional Food Trails & Culinary Knowledge Module
 */

export interface CulinaryZone {
  id: string;
  region: string;
  nameEn: string;
  nameKn: string;
  signatureDishes: {
    name: string;
    kannadaName: string;
    description: string;
    isVeg: boolean;
  }[];
  overviewEn: string;
  overviewKn: string;
  authenticVenueTipEn: string;
  authenticVenueTipKn: string;
}

export const CULINARY_ZONES: CulinaryZone[] = [
  {
    id: "coastal",
    region: "Coastal Karnataka",
    nameEn: "Karavali & Tulu Nadu Coastal Flavours",
    nameKn: "ಕರಾವಳಿ ಮತ್ತು ತುಳುನಾಡಿನ ರುಚಿಗಳು",
    signatureDishes: [
      {
        name: "Neer Dosa",
        kannadaName: "ನೀರ್ ದೋಸೆ",
        description: "Paper-thin, feather-soft crepes made purely from ground rice batter, served with fresh coconut chutney and jaggery-coconut mix.",
        isVeg: true,
      },
      {
        name: "Udupi Satvik Thali",
        kannadaName: "ಉಡುಪಿ ಸಾತ್ವಿಕ ಭೋಜನ",
        description: "Pure vegetarian meal cooked strictly without onion or garlic, featuring spiced saaru, huli (sambar), majjige huli, and banana chips served on a plantain leaf.",
        isVeg: true,
      },
      {
        name: "Mangalorean Ghee Roast",
        kannadaName: "ಮಂಗಳೂರು ಘೀ ರೋಸ್ಟ್",
        description: "Fiery, dark-red delicacy slow-cooked in clarified desi ghee with roasted Byadgi chillies, tellicherry peppercorns, and tamarind.",
        isVeg: false,
      },
      {
        name: "Kori Rotti",
        kannadaName: "ಕೋರಿ ರೊಟ್ಟಿ",
        description: "Crisp, sun-dried wafer-thin rice flakes soaked in rich, aromatic coastal coconut chicken curry.",
        isVeg: false,
      },
      {
        name: "Goli Baje (Mangalore Bajji)",
        kannadaName: "ಗೋಳಿ ಬಜೆ",
        description: "Golden, crispy outside and cloud-soft inside fried snack made with spiced maida and sour curd, paired with ginger-coconut chutney.",
        isVeg: true,
      },
    ],
    overviewEn:
      "Coastal Karnataka (Udupi, Mangaluru, Gokarna) is India's vegetarian culinary capital as well as a haven for seafood lovers. It blends coconut milk, Byadgi chillies, and tamarind.",
    overviewKn:
      "ಕರಾವಳಿ ಕರ್ನಾಟಕವು (ಉಡುಪಿ, ಮಂಗಳೂರು, ಗೋಕರ್ಣ) ವಿಶ್ವವಿಖ್ಯಾತ ಸಾತ್ವಿಕ ಸಸ್ಯಾಹಾರ ಹಾಗೂ ಕರಾವಳಿ ತಿನಿಸುಗಳ ತವರು. ಕೊಬ್ಬರಿ, ಬ್ಯಾಡಗಿ ಮೆಣಸಿನಕಾಯಿ ಮತ್ತು ಹುಣಸೆಹಣ್ಣಿನ ಸಮೃದ್ಧ ರುಚಿ.",
    authenticVenueTipEn: "Visit Shri Krishna Temple Bhojanashala in Udupi for sacred midday Prasada, or family-run coastal fish messes in Mangaluru.",
    authenticVenueTipKn: "ಉಡುಪಿಯ ಶ್ರೀಕೃಷ್ಣ ಮಠದಲ್ಲಿ ಮಧ್ಯಾಹ್ನದ ಮಹಾಪ್ರಸಾದವನ್ನು ಸವಿಯಿರಿ ಅಥವಾ ಮಂಗಳೂರಿನ ಅಧಿಕೃತ ಕರಾವಳಿ ಹೋಟೆಲ್‌ಗಳನ್ನು ಭೇಟಿ ಮಾಡಿ.",
  },
  {
    id: "malnad",
    region: "Western Ghats",
    nameEn: "Malnad & Coorg Highland Cuisine",
    nameKn: "ಮಲೆನಾಡು ಮತ್ತು ಕೊಡಗು ಅಡುಗೆ ಪದ್ಧತಿ",
    signatureDishes: [
      {
        name: "Akki Rotti",
        kannadaName: "ಅಕ್ಕಿ ರೊಟ್ಟಿ",
        description: "Rustic flatbread crafted from rice flour mixed with finely chopped green chillies, onions, coriander, and dill leaves, roasted on a tawa.",
        isVeg: true,
      },
      {
        name: "Kadambuttu",
        kannadaName: "ಕದಂಬುಟ್ಟು",
        description: "Pillowy steamed broken-rice dumplings seasoned with pure ghee, typically paired with wild mushroom or bamboo shoot curry.",
        isVeg: true,
      },
      {
        name: "Estate Filter Coffee",
        kannadaName: "ಫಿಲ್ಟರ್ ಕಾಫಿ",
        description: "Dark-roast, shade-grown Arabica/Robusta coffee decoction brewed in traditional brass filters, blended with hot frothy milk.",
        isVeg: true,
      },
      {
        name: "Coorg Pandi Curry",
        kannadaName: "ಪಾಂಡಿ ಕರಿ",
        description: "Dark, tangy pork curry slow-braised with roasted pepper, cumin, and the indigenous souring agent Kachampuli (Garcinia gummi-gutta).",
        isVeg: false,
      },
    ],
    overviewEn:
      "Malnad cuisine (Chikmagalur, Coorg, Sakleshpur) mirrors the rich misty forests. It utilizes wild bamboo shoots (Kanile), colocasia leaves (Kesu), estate pepper, and fragrant coffee.",
    overviewKn:
      "ಮಲೆನಾಡಿನ ಅಡುಗೆಗಳು ಕಾಡಿನ ಸಂಪತ್ತನ್ನು ಬಿಂಬಿಸುತ್ತವೆ: ಕಣಿಲೆ (ಬಿದಿರಿನ ಚಿಗುರು), ಕೆಸುವಿನ ಎಲೆ, ಕಾಳುಮೆಣಸು ಮತ್ತು ಘಮಘಮಿಸುವ ಫಿಲ್ಟರ್ ಕಾಫಿ.",
    authenticVenueTipEn: "Dine at registered coffee estate homestays where recipes have been preserved across generations.",
    authenticVenueTipKn: "ಕಾಫಿ ತೋಟದ ಹೋಂಸ್ಟೇಗಳಲ್ಲಿ ತಂಗಿ ಸ್ಥಳೀಯ ಸಾಂಪ್ರದಾಯಿಕ ಅಡುಗೆಗಳನ್ನು ಸವಿಯುವುದು ಅತ್ಯುತ್ತಮ ಅನುಭವ.",
  },
  {
    id: "mysuru",
    region: "South Karnataka",
    nameEn: "Old Mysore Royal & Darshini Traditions",
    nameKn: "ಹಳೆಯ ಮೈಸೂರು ಭಾಗದ ಸಾಂಪ್ರದಾಯಿಕ ತಿನಿಸುಗಳು",
    signatureDishes: [
      {
        name: "Original Mysore Pak",
        kannadaName: "ಮೈಸೂರು ಪಾಕ್",
        description: "Legendary royal confection invented in the royal kitchen of Maharaja Krishnaraja Wodeyar IV, made from pure melted ghee, chickpea flour, and sugar.",
        isVeg: true,
      },
      {
        name: "Mysore Masala Dosa",
        kannadaName: "ಮೈಸೂರು ಮಸಾಲ ದೋಸೆ",
        description: "Crispy golden fermented rice-lentil crepe slathered inside with fiery red garlic-chilli chutney, stuffed with spiced potato palya and topped with white butter.",
        isVeg: true,
      },
      {
        name: "Ragi Mudde with Saaru",
        kannadaName: "ರಾಗಿ ಮುದ್ದೆ ಮತ್ತು ಸಾರು",
        description: "Steamed finger-millet balls rich in iron and fibre, swallowed with hot fragrant greens saaru (Bassaru/Soppu Saaru).",
        isVeg: true,
      },
      {
        name: "Maddur Vada",
        kannadaName: "ಮದ್ದೂರು ವಡೆ",
        description: "Crunchy onion, semolina, and rice-flour fritter born at Maddur railway station along the Bengaluru-Mysuru line.",
        isVeg: true,
      },
    ],
    overviewEn:
      "Old Mysore cuisine (Mysuru, Mandya, Bengaluru) spans quick-service Darshinis offering crisp dosas to nutritious rural finger-millet (Ragi) staples and royal Wodeyar sweets.",
    overviewKn:
      "ದರ್ಶಿನಿ ಶೈಲಿಯ ಗರಿಗರಿ ದೋಸೆಗಳು, ಪೌಷ್ಟಿಕ ರಾಗಿ ಮುದ್ದೆ ಹಾಗೂ ಅರಮನೆ ಅಡುಗೆಮನೆಯ ಮೈಸೂರು ಪಾಕ್ ಈ ಭಾಗದ ಪ್ರಮುಖ ಹೆಗ್ಗುರುತು.",
    authenticVenueTipEn: "Try Mysore Pak at Guru Sweet Mart in Devaraja Market (descendants of the royal chef Kakasura Madappa).",
    authenticVenueTipKn: "ಮೈಸೂರಿನ ದೇವರಾಜ ಮಾರುಕಟ್ಟೆಯ ಗುರು ಸ್ವೀಟ್ ಮಾರ್ಟ್‌ನಲ್ಲಿ ಸಾಂಪ್ರದಾಯಿಕ ಮೈಸೂರು ಪಾಕ್ ಸವಿಯಿರಿ.",
  },
  {
    id: "north",
    region: "North Karnataka",
    nameEn: "North Karnataka (Bayaluseeme) Jolada Rotti Meals",
    nameKn: "ಉತ್ತರ ಕರ್ನಾಟಕದ ಜೋಳದ ರೊಟ್ಟಿ ಊಟ",
    signatureDishes: [
      {
        name: "Jolada Rotti",
        kannadaName: "ಜೋಳದ ರೊಟ್ಟಿ",
        description: "Unleavened sorghum flatbread hand-patted and baked on a broad earthen tawa until puffed and crisp.",
        isVeg: true,
      },
      {
        name: "Ennegai (Stuffed Brinjal)",
        kannadaName: "ಎಣ್ಣೆಗಾಯಿ ಬದನೆಕಾಯಿ",
        description: "Tender purple baby eggplants stuffed with roasted peanuts, sesame seeds, tamarind, jaggery, and dry copra, slow-simmered in gravy.",
        isVeg: true,
      },
      {
        name: "Shenga Chutney Pudi",
        kannadaName: "ಶೇಂಗಾ ಚಟ್ನಿ ಪುಡಿ",
        description: "Fiery dry peanut powder seasoned with garlic, Byadgi chilli, and cumin, served with curd and raw onions.",
        isVeg: true,
      },
      {
        name: "Dharwad Peda",
        kannadaName: "ಧಾರವಾಡ ಪೇಡಾ",
        description: "Deep caramel-brown fudge confection made from slow-reduced Dharwad buffalo milk mawa and coated in powdered sugar.",
        isVeg: true,
      },
    ],
    overviewEn:
      "North Karnataka (Hampi, Badami, Hubballi, Dharwad) offers hearty, dry-land millet cuisine that is protein-rich, 100% vegetarian, and delightfully spicy.",
    overviewKn:
      "ಉತ್ತರ ಕರ್ನಾಟಕದ ಬಿಸಿಲು ಮತ್ತು ಬಯಲು ಸೀಮೆಯ ಆಹಾರವು ಪೌಷ್ಟಿಕ, ಗರಿಗರಿ ಜೋಳದ ರೊಟ್ಟಿ, ಕಾಳುಗಳ ಪಲ್ಯ ಹಾಗೂ ಸಿಹಿಯಾದ ಧಾರವಾಡ ಪೇಡಾಗಳಿಗೆ ಹೆಸರುವಾಸಿ.",
    authenticVenueTipEn: "Eat at community-run Lingayat Khanavalis where unlimited Jolada Rotti meals are served hot with fresh buttermilk.",
    authenticVenueTipKn: "ಹುಬ್ಬಳ್ಳಿ ಮತ್ತು ಧಾರವಾಡದ ಸಾಂಪ್ರದಾಯಿಕ ಖಾನಾವಳಿಗಳಲ್ಲಿ ಬಿಸಿಬಿಸಿ ರೊಟ್ಟಿ ಊಟ ಸವಿಯಿರಿ.",
  },
];

