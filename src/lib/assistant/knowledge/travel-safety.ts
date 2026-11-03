/**
 * Karnataka Travel Preparation, Packing & Safety Knowledge Module
 * Practical, verified guidance with strict anti-hallucination guardrails.
 */

import type { PackingChecklist, SafetyGuideline } from "../assistant-types";

export const PACKING_CHECKLISTS: Record<string, PackingChecklist[]> = {
  heritage: [
    {
      category: "clothing",
      title: "Breathable & Modest Clothing",
      titleKn: "ಉಸಿರಾಡುವ ಮತ್ತು ಸಭ್ಯ ಉಡುಪುಗಳು",
      items: [
        {
          name: "Lightweight, breathable cotton tops and trousers",
          nameKn: "ಹಗುರವಾದ ಹತ್ತಿ ಶರ್ಟ್ ಮತ್ತು ಪ್ಯಾಂಟ್‌ಗಳು",
          essential: true,
          reason: "North Karnataka (Hampi, Badami) is warm with high daytime sun exposure.",
        },
        {
          name: "Modest attire covering shoulders and knees",
          nameKn: "ಮೈ ಮುಚ್ಚುವ ಸಭ್ಯ ವಸ್ತ್ರಗಳು (ದೇವಸ್ಥಾನಗಳಿಗೆ)",
          essential: true,
          reason: "Required for entering active shrines like Virupaksha and Badami Banashankari.",
        },
      ],
    },
    {
      category: "footwear",
      title: "Trekking & Walking Footwear",
      titleKn: "ನಡಿಗೆ ಮತ್ತು ಚಾರಣದ ಪಾದರಕ್ಷೆಗಳು",
      items: [
        {
          name: "Sturdy walking sneakers with good rubber grip",
          nameKn: "ಉತ್ತಮ ಹಿಡಿತವಿರುವ ವಾಕಿಂಗ್ ಶೂಗಳು",
          essential: true,
          reason: "Navigating ancient boulder-strewn hills, stone steps, and uneven granite ruins.",
        },
        {
          name: "Easy-to-remove sandals for temple entrances",
          nameKn: "ದೇವಸ್ಥಾನಗಳಲ್ಲಿ ಸುಲಭವಾಗಿ ಕಳಚಬಹುದಾದ ಚಪ್ಪಲಿ",
          essential: true,
          reason: "Shoes must be removed at every temple prakara and ASI monument sanctum.",
        },
      ],
    },
    {
      category: "gear",
      title: "Sun & Hydration Protection",
      titleKn: "ಬಿಸಿಲು ಮತ್ತು ಜಲಸಂಚಯನ ರಕ್ಷಣೆ",
      items: [
        {
          name: "Wide-brim sun hat and UV-filter sunglasses",
          nameKn: "ಅಗಲವಾದ ಅಂಚಿನ ಟೋಪಿ ಮತ್ತು ಸನ್‌ಗ್ಲಾಸ್",
          essential: true,
          reason: "Extensive open-sky walking among reflective granite boulders.",
        },
        {
          name: "Reusable insulated water flask & electrolyte packets",
          nameKn: "ಮರುಬಳಕೆಯ ನೀರಿನ ಬಾಟಲ್ ಮತ್ತು ಒಆರ್‌ಎಸ್",
          essential: true,
          reason: "Prevents dehydration and eliminates single-use plastic waste.",
        },
      ],
    },
  ],

  western_ghats: [
    {
      category: "clothing",
      title: "Rain & Cool Evening Layers",
      titleKn: "ಮಳೆ ಮತ್ತು ತಂಪಾದ ಸಂಜೆಯ ಉಡುಪುಗಳು",
      items: [
        {
          name: "Waterproof rain poncho or breathable rain jacket",
          nameKn: "ಜಲನಿರೋಧಕ ರೈನ್‌ಕೋಟ್ ಅಥವಾ ಪಾನ್ಚೋ",
          essential: true,
          reason: "Sudden heavy rain squalls are frequent in Coorg, Chikmagalur, and Western Ghats.",
        },
        {
          name: "Light fleece jacket or warm shawl",
          nameKn: "ಲಘು ಸ್ವೆಟರ್ ಅಥವಾ ಶಾಲು",
          essential: true,
          reason: "Evening temperatures drop noticeably in highland coffee estates.",
        },
      ],
    },
    {
      category: "footwear",
      title: "Trekking Shoes & Leech Protection",
      titleKn: "ಚಾರಣದ ಶೂಗಳು ಮತ್ತು ಜಿಗಣೆ ರಕ್ಷಣೆ",
      items: [
        {
          name: "Water-resistant trekking boots with deep tread",
          nameKn: "ಜಲನಿರೋಧಕ ಚಾರಣದ ಬೂಟುಗಳು",
          essential: true,
          reason: "Forest trails like Mullayanagiri or Baba Budangiri can be slippery and mossy.",
        },
        {
          name: "Knee-high leech socks & salt pouch (Monsoon: June–Sept)",
          nameKn: "ಜಿಗಣೆ ಸಾಕ್ಸ್ ಮತ್ತು ಉಪ್ಪು (ಮಳೆಗಾಲದಲ್ಲಿ)",
          essential: true,
          reason: "Protects against forest leeches along humid Shola forest and plantation trails.",
        },
      ],
    },
    {
      category: "gear",
      title: "Electronics & Outdoor Gear",
      titleKn: "ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಮತ್ತು ಉಪಕರಣಗಳು",
      items: [
        {
          name: "Waterproof dry bag for phone, camera & documents",
          nameKn: "ಜಲನಿರೋಧಕ ಡ್ರೈ ಬ್ಯಾಗ್",
          essential: true,
          reason: "High humidity and sudden downpours near waterfalls and riverbanks.",
        },
        {
          name: "DEET-free mosquito/insect repellent cream",
          nameKn: "ಸೊಳ್ಳೆ ನಿರೋಧಕ ಕ್ರೀಮ್",
          essential: true,
          reason: "Natural forest estates have active insect populations at dusk.",
        },
      ],
    },
  ],
};

export const SAFETY_GUIDELINES: SafetyGuideline[] = [
  {
    id: "responsible_tourism",
    category: "responsible_tourism",
    title: "Responsible Tourism & Leave-No-Trace Principles",
    titleKn: "ಜವಾಬ್ದಾರಿಯುತ ಪ್ರವಾಸೋದ್ಯಮ ಮತ್ತು ಪರಿಸರ ಸಂರಕ್ಷಣೆ",
    titleHi: "जिम्मेदार पर्यटन और पर्यावरण संरक्षण",
    titleTe: "బాధ్యతాయుతమైన పర్యాటకం & పర్యావరణ పరిరక్షణ",
    guidelines: [
      {
        en: "Plastic-Free Zones: Do not carry single-use plastic bottles into Western Ghats reserved forests or wildlife sanctuaries.",
        kn: "ಪ್ಲಾಸ್ಟಿಕ್ ಮುಕ್ತ ವಲಯಗಳು: ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಅರಣ್ಯ ಪ್ರದೇಶಗಳಲ್ಲಿ ಮರುಬಳಕೆಯಾಗದ ಪ್ಲಾಸ್ಟಿಕ್ ಬಳಸಬೇಡಿ.",
        hi: "प्लास्टिक-मुक्त क्षेत्र: पश्चिमी घाट के आरक्षित वनों में एकल-उपयोग प्लास्टिक की अनुमति नहीं है।",
        te: "ప్లాస్టిక్ రహిత మండలాలు: పశ్చిమ కనుమలలో ప్లాస్టిక్ వాడకం నిషేధించబడింది.",
      },
      {
        en: "Monument Preservation: Never carve, scratch, or climb atop protected ancient stone carvings or temple pillars.",
        kn: "ಸ್ಮಾರಕಗಳ ಸಂರಕ್ಷಣೆ: ಪ್ರಾಚೀನ ಶಿಲ್ಪಗಳ ಮೇಲೆ ಗೀಚಬೇಡಿ ಅಥವಾ ಅಸಭ್ಯವಾಗಿ ಹತ್ತಬೇಡಿ.",
        hi: "स्मारक संरक्षण: ऐतिहासिक प्राचीन मूर्तियों और स्तंभों को नुकसान न पहुँचाएँ।",
        te: "స్మారకాల పరిరక్షణ: ప్రాచీన శిల్పాలు మరియు స్తంభాలపై రాయవద్దు.",
      },
    ],
  },
  {
    id: "ghat_roads",
    category: "ghat_roads",
    title: "Western Ghats Mountain Road Driving Safety",
    titleKn: "ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ರಸ್ತೆ ಪ್ರಯಾಣ ಸುರಕ್ಷತೆ",
    titleHi: "पश्चिमी घाट घाट-सड़क ड्राइविंग सुरक्षा",
    titleTe: "పశ్చిమ కనుమల కొండ రహదారి ప్రయాణ భద్రత",
    guidelines: [
      {
        en: "Ghat Road Speed & Gearing: Use low engine gear when descending steep hairpins on Shiradi Ghat (NH 75) or Charmadi Ghat; avoid riding the brakes.",
        kn: "ಘಾಟ್ ರಸ್ತೆಗಳ ವೇಗ ನಿಯಂತ್ರಣ: ಶಿರಾಡಿ ಮತ್ತು ಚಾರ್ಮಾಡಿ ಘಾಟ್‌ಗಳಲ್ಲಿ ಕಡಿದಾದ ತಿರುವುಗಳಲ್ಲಿ ಕಡಿಮೆ ಗೇರ್ ಬಳಸಿ; ಬ್ರೇಕ್ ಹೆಚ್ಚು ತುಳಿಯಬೇಡಿ.",
      },
      {
        en: "Monsoon Landslide Alerts: Check official KSRTC bus and district disaster bulletins between July and September during peak monsoon downpours.",
        kn: "ಮಳೆಗಾಲದ ಭೂಕುಸಿತ ಎಚ್ಚರಿಕೆ: ಜುಲೈ-ಸೆಪ್ಟೆಂಬರ್ ತಿಂಗಳಿನಲ್ಲಿ ಅಧಿಕೃತ ರಸ್ತೆ ಮಾಹಿತಿ ಪರಿಶೀಲಿಸಿ ಪ್ರಯಾಣಿಸಿ.",
      },
    ],
  },
  {
    id: "wildlife_safari",
    category: "wildlife_safari",
    title: "Wildlife Safari Etiquette (Bandipur & Dandeli)",
    titleKn: "ವನ್ಯಜೀವಿ ಸಫಾರಿ ನಿಯಮಗಳು (ಬಂಡೀಪುರ ಮತ್ತು ದಾಂಡೇಲಿ)",
    guidelines: [
      {
        en: "Strict Silence: Maintain absolute silence during jungle safaris so as not to distress wild elephants, gaurs, or big cats.",
        kn: "ಕಟ್ಟುನಿಟ್ಟಿನ ಮೌನ: ಕಾಡಿನ ಸಫಾರಿಯ ವೇಳೆ ವನ್ಯಜೀವಿಗಳಿಗೆ ತೊಂದರೆಯಾಗದಂತೆ ಸಂಪೂರ್ಣ ಶಾಂತಿ ಕಾಪಾಡಿ.",
      },
      {
        en: "No Feeding or Littering: Never throw food or wrappers to monkeys or deer along forest highway corridors.",
        kn: "ಪ್ರಾಣಿಗಳಿಗೆ ಆಹಾರ ನೀಡಬೇಡಿ: ಹೆದ್ದಾರಿಯಲ್ಲಿ ಕೋತಿ ಅಥವಾ ಜಿಂಕೆಗಳಿಗೆ ಆಹಾರ ಎಸೆಯಬೇಡಿ.",
      },
    ],
  },
];

export const EMERGENCY_GUIDANCE_TEXT = {
  en: `### Karnataka Visitor Safety & Emergency Guidance:
* **Statewide Emergency Helpline:** **112** (Unified response for Police, Fire, and Ambulance services across Karnataka).
* **Karnataka State Tourism Development Corporation (KSTDC):** Operates official tourist information desks at Bengaluru Airport, Mysuru Railway Station, and Hampi.
* **Connectivity Deadzones:** Western Ghats valleys (between Sakleshpur, Coorg, and Kudremukh) frequently experience cellular signal drops. Always download offline navigation maps prior to ascending the ghats.

*(Notice: Yatrion provides general travel preparedness guidelines based on verified state data. Yatrion does not provide real-time dispatch, active medical triage, or roadside assistance).*`,
  kn: `### ಕರ್ನಾಟಕ ಪ್ರವಾಸಿ ಸುರಕ್ಷತೆ ಮತ್ತು ತುರ್ತು ಮಾರ್ಗದರ್ಶನ:
* **ರಾಜ್ಯ ತುರ್ತು ಸಹಾಯವಾಣಿ:** **112** (ಕರ್ನಾಟಕದಾದ್ಯಂತ ಪೊಲೀಸ್, ಅಗ್ನಿಶಾಮಕ ಮತ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ ಸೇವೆಗಳಿಗೆ ಏಕೀಕೃತ ಸಂಖ್ಯೆ).
* **ಪ್ರವಾಸೋದ್ಯಮ ಮಾಹಿತಿ:** ಬೆಂಗಳೂರು ವಿಮಾನ ನಿಲ್ದಾಣ, ಮೈಸೂರು ರೈಲ್ವೆ ನಿಲ್ದಾಣ ಹಾಗೂ ಹಂಪಿಯಲ್ಲಿ ಅಧಿಕೃತ KSTDC ಮಾಹಿತಿ ಕೇಂದ್ರಗಳು ಲಭ್ಯ.
* **ನೆಟ್‌ವರ್ಕ್ ರಹಿತ ವಲಯಗಳು:** ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಕಣಿವೆಗಳಲ್ಲಿ ಮೊಬೈಲ್ ಸಿಗ್ನಲ್ ಕ್ಷೀಣಿಸಬಹುದು; ಪ್ರಯಾಣಕ್ಕೂ ಮುನ್ನ ಆಫ್‌ಲೈನ್ ಮ್ಯಾಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಿ.

*(ಗಮನಿಸಿ: ಯಾತ್ರಿಯಾನ್ ಸಾರ್ವತ್ರಿಕ ಪ್ರವಾಸ ಸಿದ್ಧತೆಯ ಮಾರ್ಗದರ್ಶನವನ್ನು ನೀಡುತ್ತದೆ. ಇದು ತುರ್ತು ವೈದ್ಯಕೀಯ ಅಥವಾ ಪೊಲೀಸ್ ರವಾನೆ ಸೇವೆಯಲ್ಲ; ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ 112 ಗೆ ಕರೆ ಮಾಡಿ).*`,
};

