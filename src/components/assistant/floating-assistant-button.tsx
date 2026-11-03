"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useAssistant } from "@/lib/assistant/assistant-context";
import { useLanguage } from "@/lib/i18n";

export function FloatingAssistantButton() {
  const { isOpen, toggleOpen, messages } = useAssistant();
  const { t } = useLanguage();

  const userMessagesCount = messages.filter((m) => m.sender === "user").length;

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 no-print">
      <button
        type="button"
        id="yatrion-assistant-trigger"
        onClick={toggleOpen}
        aria-label={t("assistant.floatingButtonLabel")}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="yatrion-assistant-panel"
        className={`group relative flex items-center gap-2.5 rounded-full px-4 py-3 sm:px-4.5 sm:py-3.5 transition-all duration-300 shadow-elevated cursor-pointer focus-visible:outline-forest focus-visible:outline-offset-4 ${
          isOpen
            ? "bg-forest-dark text-white ring-2 ring-gold scale-95"
            : "bg-forest hover:bg-forest-light text-white ring-1 ring-gold/40 hover:ring-gold hover:shadow-2xl hover:scale-105 active:scale-95"
        }`}
      >
        <span className="relative flex items-center justify-center">
          <Sparkles
            size={20}
            className="text-gold-light group-hover:rotate-12 transition-transform duration-300"
          />
          {/* Subtle pulsating status beacon */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold"></span>
          </span>
        </span>

        <span className="text-sm font-semibold tracking-wide font-[family-name:var(--font-playfair)] hidden xs:inline-block">
          {t("assistant.title")}
        </span>

        {userMessagesCount > 0 && !isOpen && (
          <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold font-mono bg-gold text-forest-dark rounded-full">
            {userMessagesCount}
          </span>
        )}
      </button>
    </div>
  );
}
