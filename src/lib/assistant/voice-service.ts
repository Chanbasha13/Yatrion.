import type { VoiceLanguage, VoiceLanguageOption } from "./assistant-types";

export const VOICE_LANGUAGES: Record<VoiceLanguage, VoiceLanguageOption> = {
  "en-IN": {
    code: "en-IN",
    label: "English (India)",
    nativeLabel: "English",
    flag: "🇮🇳",
  },
  "kn-IN": {
    code: "kn-IN",
    label: "Kannada",
    nativeLabel: "ಕನ್ನಡ",
    flag: "🟡🔴",
  },
  "hi-IN": {
    code: "hi-IN",
    label: "Hindi",
    nativeLabel: "हिन्दी",
    flag: "🇮🇳",
  },
  "te-IN": {
    code: "te-IN",
    label: "Telugu",
    nativeLabel: "తెలుగు",
    flag: "🇮🇳",
  },
};

/**
 * Strips markdown, bullet points, headers, and structural tokens
 * so text-to-speech produces smooth, natural-sounding audio.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return "";

  return (
    text
      // Remove headers like ### Title
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bullet markers at line start (*, -, •) first
      .replace(/^[ \t]*[*•\-]+\s*/gm, "")
      // Remove URLs or markdown links [label](url) -> label
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove standalone bracket notes like *(Note:...)*
      .replace(/\*\((.*?)\)\*/g, "$1")
      // Remove bold and italic markers like **bold** or *italic*
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
      // Clean up any remaining stray asterisks or markdown artifacts
      .replace(/[*_]{1,3}/g, "")
      // Replace transit arrows / dashes with spoken pauses
      .replace(/→|->/g, " to ")
      // Clean escaped KaTeX characters (e.g. \$ or \_)
      .replace(/\\([$#&_%])/g, "$1")
      // Replace multiple consecutive newlines with sentence stop
      .replace(/\n+/g, ". ")
      // Consolidate whitespace
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

/**
 * Checks if SpeechRecognition (STT) is supported in the current environment
 */
export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

/**
 * Checks if SpeechSynthesis (TTS) is supported in the current environment
 */
export function isSpeechSynthesisAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

/**
 * Finds the most suitable system voice matching the requested language.
 * Prefers exact regional match (e.g. kn-IN, hi-IN, en-IN), falls back gracefully.
 */
export function findBestVoiceForLanguage(
  voices: SpeechSynthesisVoice[],
  targetLang: VoiceLanguage
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0 || !targetLang) return null;

  const normalizedTarget = targetLang.toLowerCase().replace("_", "-");
  const baseLang = normalizedTarget.split("-")[0];

  // 1. Exact locale match (e.g., "kn-in" or "kn_in")
  const exactMatch = voices.find((v) => {
    const vLang = v.lang.toLowerCase().replace("_", "-");
    return vLang === normalizedTarget;
  });
  if (exactMatch) return exactMatch;

  // 2. Base language match (e.g. any "kn" or "hi")
  const baseMatch = voices.find((v) => {
    const vLang = v.lang.toLowerCase().replace("_", "-");
    return vLang.startsWith(`${baseLang}-`) || vLang === baseLang;
  });
  if (baseMatch) return baseMatch;

  // 3. Name heuristic (some voices have language in name, e.g. "Kannada India", "Telugu India")
  const nameMatch = voices.find((v) =>
    v.name.toLowerCase().includes(
      baseLang === "kn"
        ? "kannada"
        : baseLang === "hi"
        ? "hindi"
        : baseLang === "te"
        ? "telugu"
        : "india"
    )
  );
  if (nameMatch) return nameMatch;

  // 4. For English fallback
  if (baseLang === "en") {
    const anyEn = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
    if (anyEn) return anyEn;
  }

  // Fallback to default voice or first available
  return voices.find((v) => v.default) || voices[0] || null;
}

/**
 * Detects whether the current browser has native TTS voices for English, Kannada, Hindi, and Telugu.
 */
export function detectVoiceCapabilities(voices: SpeechSynthesisVoice[]): {
  hasKannadaTTS: boolean;
  hasHindiTTS: boolean;
  hasTeluguTTS: boolean;
  hasEnglishTTS: boolean;
  totalVoices: number;
} {
  const hasKannadaTTS = Boolean(
    voices.some(
      (v) =>
        v.lang.toLowerCase().startsWith("kn") ||
        v.name.toLowerCase().includes("kannada")
    )
  );
  const hasHindiTTS = Boolean(
    voices.some(
      (v) =>
        v.lang.toLowerCase().startsWith("hi") ||
        v.name.toLowerCase().includes("hindi")
    )
  );
  const hasTeluguTTS = Boolean(
    voices.some(
      (v) =>
        v.lang.toLowerCase().startsWith("te") ||
        v.name.toLowerCase().includes("telugu")
    )
  );
  const hasEnglishTTS = Boolean(
    voices.some((v) => v.lang.toLowerCase().startsWith("en"))
  );

  return {
    hasKannadaTTS,
    hasHindiTTS,
    hasTeluguTTS,
    hasEnglishTTS,
    totalVoices: voices.length,
  };
}
