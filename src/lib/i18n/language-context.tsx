"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { en } from "./translations/en";
import { kn } from "./translations/kn";

export type SupportedLanguage = "en" | "kn";

export const LANGUAGE_STORAGE_KEY = "yatrion-language-pref-v1";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  isKn: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Resolves a dotted string path in a dictionary with fallback to English.
 */
function resolveTranslation(
  dict: Record<string, unknown>,
  path: string
): string | undefined {
  const parts = path.split(".");
  let current: unknown = dict;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

/**
 * Replaces `{paramName}` placeholders with supplied values.
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return Object.entries(params).reduce((str, [key, val]) => {
    return str.replace(new RegExp(`\\{${key}\\}`, "g"), String(val));
  }, template);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  // Client-side hydration from localStorage without SSR mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
          if (stored === "kn" || stored === "en") {
            setLanguageState(stored);
            document.documentElement.lang = stored;
          }
        }
      } catch {
        // Ignore storage access error in restricted sandboxes
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        document.documentElement.lang = lang;
      }
    } catch {
      // Ignore storage write error
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === "en" ? "kn" : "en";
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
          document.documentElement.lang = next;
        }
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const t = useMemo(() => {
    return (path: string, params?: Record<string, string | number>): string => {
      const activeDict = language === "kn" ? (kn as unknown as Record<string, unknown>) : (en as unknown as Record<string, unknown>);
      const fallbackDict = en as unknown as Record<string, unknown>;

      // 1. Try active language
      let translated = resolveTranslation(activeDict, path);

      // 2. Fallback to English if missing
      if (!translated) {
        translated = resolveTranslation(fallbackDict, path);
      }

      // 3. Fallback to path itself if still not found
      if (!translated) {
        return path;
      }

      return interpolate(translated, params);
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isKn: language === "kn",
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Provide a safe fallback if used outside provider
    return {
      language: "en",
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (path: string, params?: Record<string, string | number>) => {
        const str = resolveTranslation(en as unknown as Record<string, unknown>, path) || path;
        return interpolate(str, params);
      },
      isKn: false,
    };
  }
  return context;
}
