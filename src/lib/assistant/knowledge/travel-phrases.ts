/**
 * Karnataka Multilingual Travel Phrases & Communication Module
 * Grounded across Kannada, English, Hindi, and Telugu.
 */

import type { TravelPhrase } from "../assistant-types";

export const MULTILINGUAL_TRAVEL_PHRASES: TravelPhrase[] = [
  // ── 1. GREETINGS & POLITENESS ──
  {
    id: "phrase-hello",
    category: "greetings",
    english: "Hello / Greetings",
    kannada: "ನಮಸ್ಕಾರ",
    kannadaTransliteration: "Namaskara",
    hindi: "नमस्ते",
    hindiTransliteration: "Namaste",
    telugu: "నమస్కారం",
    teluguTransliteration: "Namaskaram",
    usageContext: "Universal respectful greeting suitable for priests, elders, drivers, and hosts.",
  },
  {
    id: "phrase-thank-you",
    category: "greetings",
    english: "Thank you very much",
    kannada: "ತುಂಬಾ ಧನ್ಯವಾದಗಳು",
    kannadaTransliteration: "Tumba Dhanyavadagalu",
    hindi: "बहुत धन्यवाद",
    hindiTransliteration: "Bahut Dhanyavaad",
    telugu: "చాలా ధన్యవాదాలు",
    teluguTransliteration: "Chaalaa Dhanyavaadaalu",
    usageContext: "Use when receiving meals, homestay hospitality, or help with directions.",
  },
  {
    id: "phrase-how-are-you",
    category: "greetings",
    english: "How are you? / Are you well?",
    kannada: "ಹೇಗಿದ್ದೀರಾ? ಚೆನ್ನಾಗಿದ್ದೀರಾ?",
    kannadaTransliteration: "Hegiddeera? Chennagiddeera?",
    hindi: "आप कैसे हैं?",
    hindiTransliteration: "Aap kaise hain?",
    telugu: "మీరు ఎలా ఉన్నారు?",
    teluguTransliteration: "Meeru elaa unnaaru?",
    usageContext: "Warm conversational ice-breaker across Karnataka.",
  },

  // ── 2. TRANSPORT & NAVIGATION ──
  {
    id: "phrase-where-is",
    category: "transport",
    english: "Where is [Destination / Place]?",
    kannada: "[ಸ್ಥಳ] ಎಲ್ಲಿದೆ?",
    kannadaTransliteration: "[Place] ellide?",
    hindi: "[जगह] कहाँ है?",
    hindiTransliteration: "[Place] kahan hai?",
    telugu: "[ప్రదేశం] ఎక్కడ ఉంది?",
    teluguTransliteration: "[Place] ekkada undi?",
    usageContext: "Useful when navigating temple towns, bus stands, or markets.",
  },
  {
    id: "phrase-stop-here",
    category: "transport",
    english: "Please stop here",
    kannada: "ದಯವಿಟ್ಟು ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ",
    kannadaTransliteration: "Dayavittu illi nillisi",
    hindi: "कृपया यहाँ रोकिए",
    hindiTransliteration: "Kripya yahan rokiye",
    telugu: "దయచేసి ఇక్కడ ఆపండి",
    teluguTransliteration: "Dayachesi ikkada aapandi",
    usageContext: "For autos, taxis, and private cabs approaching your stop.",
  },
  {
    id: "phrase-use-meter",
    category: "transport",
    english: "Please turn on the meter",
    kannada: "ದಯವಿಟ್ಟು ಮೀಟರ್ ಹಾಕಿ",
    kannadaTransliteration: "Dayavittu meter haaki",
    hindi: "कृपया मीटर चालू कीजिए",
    hindiTransliteration: "Kripya meter chaaloo kijiye",
    telugu: "దయచేసి మీటర్ వేయండి",
    teluguTransliteration: "Dayachesi meter veyandi",
    usageContext: "Standard polite request when boarding auto-rickshaws in Bengaluru, Mysuru, or Hubballi.",
  },
  {
    id: "phrase-how-far",
    category: "transport",
    english: "How far is it?",
    kannada: "ಅದು ಎಷ್ಟು ದೂರ ಇದೆ?",
    kannadaTransliteration: "Adu eshtu doora ide?",
    hindi: "वह कितनी दूर है?",
    hindiTransliteration: "Vah kitni door hai?",
    telugu: "అది ఎంత దూరం ఉంది?",
    teluguTransliteration: "Adi entha dooram undi?",
    usageContext: "Estimating walking or trekking distance from landmark.",
  },

  // ── 3. FOOD & DINING ──
  {
    id: "phrase-had-food",
    category: "food",
    english: "Have you eaten? (Traditional Karnataka care phrase)",
    kannada: "ಊಟ ಆಯ್ತಾ? / ತಿಂಡಿ ಆಯ್ತಾ?",
    kannadaTransliteration: "Oota aayitha? / Thindi aayitha?",
    hindi: "खाना खाया आपने?",
    hindiTransliteration: "Khaana khaaya aapne?",
    telugu: "భోజనం చేశారా?",
    teluguTransliteration: "Bhojanam chesaaraa?",
    usageContext: "Equivalent to 'How are you?' in local culture; shows warmth to hosts.",
  },
  {
    id: "phrase-less-spicy",
    category: "food",
    english: "Please make it less spicy (no chilli)",
    kannada: "ಖಾರ ಕಡಿಮೆ ಮಾಡಿ / ಖಾರ ಬೇಡಿ",
    kannadaTransliteration: "Kaara kadime maadi / Kaara bedi",
    hindi: "तीखा कम कीजिए",
    hindiTransliteration: "Teekha kam kijiye",
    telugu: "కారం తగ్గించండి",
    teluguTransliteration: "Kaaram thagginchandi",
    usageContext: "Helpful for travelers sensitive to fiery Byadgi or Guntur chillies in local curries.",
  },
  {
    id: "phrase-give-water",
    category: "food",
    english: "Please give drinking water",
    kannada: "ದಯವಿಟ್ಟು ಕುಡಿಯುವ ನೀರು ಕೊಡಿ",
    kannadaTransliteration: "Dayavittu kudiyuva neeru kodi",
    hindi: "कृपया पीने का पानी दीजिए",
    hindiTransliteration: "Kripya peene ka paani dijiye",
    telugu: "దయచేసి మంచి నీళ్లు ఇవ్వండి",
    teluguTransliteration: "Dayachesi manchi neellu ivvandi",
    usageContext: "Dining at Darshinis and roadside messes.",
  },

  // ── 4. SHOPPING & BARGAINING ──
  {
    id: "phrase-how-much",
    category: "shopping",
    english: "How much is this?",
    kannada: "ಇದರ ಬೆಲೆ ಎಷ್ಟು?",
    kannadaTransliteration: "Idara bele eshtu?",
    hindi: "इसका दाम कितना है?",
    hindiTransliteration: "Iska daam kitna hai?",
    telugu: "దీని ధర ఎంత?",
    teluguTransliteration: "Deeni dhara entha?",
    usageContext: "Crucial for local bazaars, handicrafts, and spice stalls.",
  },
  {
    id: "phrase-too-costly",
    category: "shopping",
    english: "It is too expensive; please reduce a little",
    kannada: "ಬಹಳ ಜಾಸ್ತಿ ಆಯ್ತು; ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ",
    kannadaTransliteration: "Bahala jaasti aaythu; swalpa kadime maadi",
    hindi: "बहुत महँगा है; थोड़ा कम कीजिए",
    hindiTransliteration: "Bahut mehanga hai; thoda kam kijiye",
    telugu: "చాలా ఎక్కువైంది; కొంచెం తగ్గించండి",
    teluguTransliteration: "Chaalaa ekkuvaindi; konchem thagginchandi",
    usageContext: "Polite bargaining in street markets.",
  },

  // ── 5. BASIC EMERGENCY & HELP ──
  {
    id: "phrase-help-me",
    category: "emergency",
    english: "Please help me",
    kannada: "ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ",
    kannadaTransliteration: "Dayavittu nanage sahaaya maadi",
    hindi: "कृपया मेरी मदद कीजिए",
    hindiTransliteration: "Kripya meri madad kijiye",
    telugu: "దయచేసి నాకు సహాయం చేయండి",
    teluguTransliteration: "Dayachesi naaku sahaayam cheyandi",
    usageContext: "General polite appeal for assistance in public spaces.",
  },
];

/**
 * Multilingual Destination Name Mappings (English, Kannada, Hindi, Telugu)
 */
export const MULTILINGUAL_DESTINATION_NAMES: Record<
  string,
  { id: string; en: string; kn: string; hi: string; te: string }
> = {
  hampi: { id: "hampi", en: "Hampi", kn: "ಹಂಪಿ", hi: "हम्पी", te: "హంపి" },
  mysuru: { id: "mysuru", en: "Mysuru", kn: "ಮೈಸೂರು", hi: "मैसूर", te: "మైసూరు" },
  coorg: { id: "coorg", en: "Coorg (Kodagu)", kn: "ಕೊಡಗು", hi: "कूर्ग", te: "కూర్గ్ / కొడగు" },
  gokarna: { id: "gokarna", en: "Gokarna", kn: "ಗೋಕರ್ಣ", hi: "गोकर्ण", te: "గోకర్ణ" },
  chikmagalur: { id: "chikmagalur", en: "Chikmagalur", kn: "ಚಿಕ್ಕಮಗಳೂರು", hi: "चिकमगलूर", te: "చిక్కమగళూరు" },
  bandipur: { id: "bandipur", en: "Bandipur", kn: "ಬಂಡೀಪುರ", hi: "बांदीपुर", te: "బండిపూర్" },
  badami: { id: "badami", en: "Badami", kn: "ಬಾದಾಮಿ", hi: "बादामी", te: "బాదామి" },
  belur: { id: "belur", en: "Belur", kn: "ಬೇಲೂರು", hi: "बेलूर", te: "బేలూరు" },
  udupi: { id: "udupi", en: "Udupi", kn: "ಉಡುಪಿ", hi: "उडुपी", te: "ఉడుపి" },
  jogfalls: { id: "jogfalls", en: "Jog Falls", kn: "ಜೋಗ ಜಲಪಾತ", hi: "जोग जलप्रपात", te: "జోగ్ జలపాతం" },
  dandeli: { id: "dandeli", en: "Dandeli", kn: "ದಾಂಡೇಲಿ", hi: "दांडेली", te: "దాండేలి" },
};

