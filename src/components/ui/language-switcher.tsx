"use client";

import { useLanguage } from "@/lib/i18n";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "header" | "compact" | "mobile";
}

export function LanguageSwitcher({
  className = "",
  variant = "header",
}: LanguageSwitcherProps) {
  const { language, setLanguage, isKn } = useLanguage();

  if (variant === "mobile") {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-ivory-warm border border-border ${className}`}
        role="group"
        aria-label="Language selection / ಭಾಷೆ ಆಯ್ಕೆ"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-charcoal">
          <Globe size={16} className="text-forest" />
          <span>{isKn ? "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ:" : "Select Language:"}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            aria-pressed={language === "en"}
            className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
              language === "en"
                ? "bg-forest text-white shadow-subtle"
                : "text-charcoal hover:text-forest"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage("kn")}
            aria-pressed={language === "kn"}
            className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
              language === "kn"
                ? "bg-forest text-white shadow-subtle"
                : "text-charcoal hover:text-forest"
            }`}
          >
            ಕನ್ನಡ
          </button>
        </div>
      </div>
    );
  }

  // Header pill variant
  return (
    <div
      className={`inline-flex items-center rounded-full border border-border bg-ivory-warm p-0.5 shadow-subtle ${className}`}
      role="group"
      aria-label="Language toggle / ಭಾಷೆ ಬದಲಿಸಿ"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer focus-visible:outline-forest ${
          language === "en"
            ? "bg-forest text-white shadow-subtle"
            : "text-charcoal hover:text-forest"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage("kn")}
        aria-pressed={language === "kn"}
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer focus-visible:outline-forest ${
          language === "kn"
            ? "bg-forest text-white shadow-subtle"
            : "text-charcoal hover:text-forest"
        }`}
      >
        ಕನ್ನಡ
      </button>
    </div>
  );
}

