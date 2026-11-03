"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  X,
  Send,
  Sparkles,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  MapPin,
  Compass,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAssistant } from "@/lib/assistant/assistant-context";
import { useLanguage } from "@/lib/i18n";
import type { AssistantAction, AssistantMessage, VoiceLanguage } from "@/lib/assistant/assistant-types";
import { useSpeech } from "@/lib/assistant/use-speech";
import { VOICE_LANGUAGES } from "@/lib/assistant/voice-service";

export function AssistantPanel() {
  const {
    isOpen,
    setIsOpen,
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    retryLastMessage,
    executeAction,
    pendingAction,
    confirmPendingAction,
    cancelPendingAction,
  } = useAssistant();

  const { t, language } = useLanguage();
  const pathname = usePathname() || "";
  const [inputText, setInputText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [suggestionCategory, setSuggestionCategory] = useState<
    "all" | "culture" | "food" | "packing" | "phrases"
  >("all");

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const isKn = language === "kn";

  // Contextual prompts based on current authenticated workspace route
  const workspacePrompts = useMemo(() => {
    if (pathname.includes("/planner")) {
      return isKn
        ? [
            "3 ದಿನಗಳ ಪರಂಪರೆ ಪ್ರವಾಸ ಸರ್ಕ್ಯೂಟ್ ಅನ್ನು ಶಿಫಾರಸು ಮಾಡಿ.",
            "ಕುಟುಂಬಕ್ಕಾಗಿ ಅತ್ಯುತ್ತಮ ಪ್ರಯಾಣ ವೇಗವನ್ನು ಸೂಚಿಸಿ.",
          ]
        : [
            "Suggest a 3-day heritage circuit.",
            "Recommend an optimal travel pace.",
          ];
    }
    if (pathname.includes("/itinerary")) {
      return isKn
        ? [
            "ಇಂದಿನ ತಾಣಗಳ ಸಾರಾಂಶವನ್ನು ನೀಡಿ.",
            "ಈ ನಿಲ್ದಾಣಗಳಿಗೆ ನಾನು ಏನನ್ನು ಪ್ಯಾಕ್ ಮಾಡಬೇಕು?",
          ]
        : [
            "Summarize today's stops.",
            "What should I pack for these stops?",
          ];
    }
    if (pathname.includes("/routes")) {
      return isKn
        ? [
            "ಈ ಮಾರ್ಗದ ದಕ್ಷತೆಯನ್ನು ವಿವರಿಸಿ.",
            "ಸುಂದರ ದೃಶ್ಯಾವಳಿ ತಾಣಗಳನ್ನು ಸೂಚಿಸಿ.",
          ]
        : [
            "Explain route efficiency.",
            "Suggest scenic viewpoints.",
          ];
    }
    if (pathname.includes("/budget")) {
      return isKn
        ? [
            "ವಸತಿ ವೆಚ್ಚವನ್ನು ಕಡಿಮೆ ಮಾಡುವುದು ಹೇಗೆ?",
            "ಸಮೀಪದಲ್ಲಿ ಉಚಿತ ಜಾತ್ಯತೀತ ಆಕರ್ಷಣೆಗಳನ್ನು ಹುಡುಕಿ.",
          ]
        : [
            "How can I reduce accommodation expenses?",
            "Find free secular attractions nearby.",
          ];
    }
    if (pathname.includes("/discover") || pathname.includes("/gems")) {
      return isKn
        ? [
            "ಶಾಂತ, ಜನಸಂದಣಿಯಿಲ್ಲದ ಅಜ್ಞಾತ ತಾಣಗಳನ್ನು ಸೂಚಿಸಿ.",
            "ಸ್ಥಳೀಯ ಕರಕುಶಲ ಕಲಾ ಅನುಭವಗಳನ್ನು ಹುಡುಕಿ.",
          ]
        : [
            "Suggest quiet offbeat destinations.",
            "Find local artisan experiences.",
          ];
    }
    if (pathname.includes("/group")) {
      return isKn
        ? [
            "ಗುಂಪಿನ ಆದ್ಯತೆಗಳ ಒಮ್ಮತವನ್ನು ವಿವರಿಸಿ.",
            "ಖರ್ಚುಗಳ ಇತ್ಯರ್ಥವನ್ನು ವಿವರಿಸಿ.",
          ]
        : [
            "Explain group preference consensus.",
            "Explain expense settlement.",
          ];
    }
    if (pathname.includes("/intelligence") || pathname.includes("/adaptive")) {
      return isKn
        ? [
            "ಪ್ರಸ್ತುತ ಪ್ರಯಾಣ ಎಚ್ಚರಿಕೆಗಳನ್ನು ವಿವರಿಸಿ.",
            "ಸೂಚಿಸಲಾದ ಪ್ರವಾಸ ನವೀಕರಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
          ]
        : [
            "Explain current travel alerts.",
            "Review the proposed itinerary changes.",
          ];
    }
    if (pathname.includes("/weather") || pathname.includes("/conditions")) {
      return isKn
        ? [
            "ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಗಳನ್ನು ವಿವರಿಸಿ.",
            "ಹವಾಮಾನ-ಜಾಗರೂಕತೆಯ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳನ್ನು ಸೂಚಿಸಿ.",
          ]
        : [
            "Explain current weather conditions.",
            "Suggest weather-aware travel precautions.",
          ];
    }
    if (pathname.includes("/explore") || pathname.includes("/attractions")) {
      return isKn
        ? [
            "ಈ ಆಕರ್ಷಣೆಯ ಐತಿಹಾಸಿಕ ಹಿನ್ನೆಲೆಯನ್ನು ವಿವರಿಸಿ.",
            "ಫೋಟೋಗ್ರಫಿಗೆ ಅತ್ಯುತ್ತಮ ಸಮಯವನ್ನು ಸೂಚಿಸಿ.",
          ]
        : [
            "Explain the historical context of this attraction.",
            "Suggest the best photography time.",
          ];
    }
    if (pathname.includes("/saved")) {
      return isKn
        ? [
            "ಉಳಿಸಿದ ತಾಣಗಳಿಂದ ಪ್ರವಾಸವನ್ನು ಸಂಯೋಜಿಸಿ.",
            "ಉಳಿಸಿದ ತಾಣಗಳನ್ನು ಜಿಲ್ಲೆಗಳ ಪ್ರಕಾರ ವರ್ಗೀಕರಿಸಿ.",
          ]
        : [
            "Compose a trip from my saved places.",
            "Group my saved places by district.",
          ];
    }
    if (pathname.includes("/trips")) {
      return isKn
        ? [
            "ನನ್ನ ಸಕ್ರಿಯ ಪ್ರವಾಸದ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
            "ಹೊಸ ಪ್ರವಾಸವನ್ನು ಹೇಗೆ ಪ್ರಾರಂಭಿಸುವುದು?",
          ]
        : [
            "Review my active trip status.",
            "How do I start a fresh journey?",
          ];
    }
    if (pathname.includes("/settings")) {
      return isKn
        ? [
            "ಕ್ಲೌಡ್ ಸಿಂಕ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ವಿವರಿಸಿ.",
            "ನನ್ನ ಸ್ಥಳೀಯ ಡೇಟಾ ಸುರಕ್ಷಿತವಾಗಿದೆಯೇ?",
          ]
        : [
            "Explain cloud synchronization settings.",
            "Is my local cache secure and private?",
          ];
    }
    if (pathname.includes("/dashboard")) {
      return isKn
        ? [
            "ನನ್ನ ಸಕ್ರಿಯ ಪ್ರವಾಸದ ಸ್ಥಿತಿಗತಿ ತಿಳಿಸಿ.",
            "ಇಂದಿನ ನಿಗದಿತ ನಿಲ್ದಾಣಗಳೇನು?",
          ]
        : [
            "Brief me on my active journey.",
            "What stops are scheduled for today?",
          ];
    }
    return [];
  }, [pathname, isKn]);

  // Voice Interaction Hook (STT & TTS)
  const {
    isSTTSupported,
    isTTSSupported,
    recognitionStatus,
    synthesisStatus,
    activeSpeakingId,
    selectedVoiceLang,
    setSelectedVoiceLang,
    autoSpeak,
    toggleAutoSpeak,
    startListening,
    stopListening,
    speak,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    clearError: clearSpeechError,
    capabilities,
  } = useSpeech({
    defaultLanguage: isKn ? "kn-IN" : "en-IN",
  });

  // Automatically synchronize default voice language when site language changes
  useEffect(() => {
    if (isKn && selectedVoiceLang === "en-IN") {
      setSelectedVoiceLang("kn-IN");
    } else if (!isKn && selectedVoiceLang === "kn-IN") {
      setSelectedVoiceLang("en-IN");
    }
  }, [isKn, selectedVoiceLang, setSelectedVoiceLang]);

  // Auto-speak newly arrived assistant response if enabled
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === "assistant" && !lastMsg.isError) {
        speak(lastMsg.text, lastMsg.id);
      }
    }
  }, [messages, autoSpeak, speak]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Focus management & Escape key listener
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      // Focus input field on opening
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          stopSpeaking();
          stopListening();
          setIsOpen(false);
          return;
        }

        // Trap focus inside panel
        if (e.key === "Tab" && panelRef.current) {
          const focusable = panelRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else if (previousActiveElementRef.current) {
      // Restore focus to trigger button
      previousActiveElementRef.current.focus();
    }
  }, [isOpen, setIsOpen, stopSpeaking, stopListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText("");
    // Stop ongoing speech before sending new query
    stopSpeaking();
    sendMessage(text);
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handlePromptClick = (question: string) => {
    stopSpeaking();
    sendMessage(question);
  };

  // Explicit microphone button click handler
  const handleMicClick = () => {
    if (recognitionStatus === "listening") {
      stopListening();
    } else {
      stopSpeaking();
      startListening(
        (transcript, isFinal) => {
          setInputText(transcript);
          if (isFinal) {
            // Keep text in input so user can edit or send
            inputRef.current?.focus();
          }
        },
        (errCode) => {
          console.warn("Speech recognition error:", errCode);
        }
      );
    }
  };

  const renderSourceBadge = (msg: AssistantMessage) => {
    if (!msg.source) return null;

    let badgeText = t("assistant.sourceEngine");
    let badgeClass = "bg-ivory-warm text-charcoal-muted border-border";

    if (msg.source === "chrome-builtin") {
      badgeText = t("assistant.sourceChrome");
      badgeClass = "bg-forest/10 text-forest border-forest/30 font-medium";
    } else if (msg.source === "cloud-gemini") {
      badgeText = t("assistant.sourceCloud");
      badgeClass = "bg-gold/15 text-gold border-gold/30 font-medium";
    }

    return (
      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-border/60">
        <span
          title={msg.sourceDescription || t("assistant.sourceEngineTooltip")}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border font-mono ${badgeClass}`}
        >
          {badgeText}
        </span>
      </div>
    );
  };

  const renderActionButtons = (actions?: AssistantAction[]) => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-border/70">
        {actions.map((act) => (
          <button
            key={act.id}
            type="button"
            onClick={() => {
              stopSpeaking();
              executeAction(act);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-forest text-white hover:bg-forest-light transition-all shadow-subtle cursor-pointer focus-visible:outline-forest"
          >
            {act.type === "view_destination" && <MapPin size={12} className="text-gold-light" />}
            {act.type === "plan_destination" && <Compass size={12} className="text-gold-light" />}
            {act.type === "navigate_planner" && <ArrowRight size={12} className="text-gold-light" />}
            <span>{isKn && act.labelKn ? act.labelKn : act.label}</span>
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  const suggestedQuestions = [
    { text: t("assistant.suggestedQ1"), category: "all" },
    { text: t("assistant.suggestedQ2"), category: "all" },
    { text: t("assistant.suggestedQ3"), category: "food" },
    { text: t("assistant.suggestedQ4"), category: "all" },
    { text: t("assistant.suggestedQ5"), category: "all" },
    { text: t("assistant.suggestedQ6"), category: "culture" },
    { text: t("assistant.suggestedQ7"), category: "packing" },
    { text: t("assistant.suggestedQ8"), category: "phrases" },
    { text: t("assistant.suggestedQ9"), category: "culture" },
    { text: t("assistant.suggestedQ10"), category: "packing" },
    { text: t("assistant.suggestedQ11"), category: "all" },
  ];

  const filteredQuestions =
    suggestionCategory === "all"
      ? suggestedQuestions.slice(0, 6)
      : suggestedQuestions.filter((q) => q.category === suggestionCategory);

  return (
    <div
      ref={panelRef}
      id="yatrion-assistant-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-panel-title"
      className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-20 sm:right-6 w-full sm:w-[430px] h-[92vh] sm:h-[620px] max-h-[92vh] sm:max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-elevated border border-border flex flex-col z-50 overflow-hidden no-print animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      {/* ── HEADER ── */}
      <div className="px-4 py-3.5 bg-forest text-white border-b border-forest-light flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-forest-dark border border-gold/40 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-gold-light" />
          </div>
          <div>
            <h2
              id="assistant-panel-title"
              className="text-sm font-bold tracking-wide font-[family-name:var(--font-playfair)] flex items-center gap-1.5"
            >
              {t("assistant.title")}
              <span className="text-[10px] font-mono font-normal uppercase px-1.5 py-0.2 rounded bg-gold/20 text-gold-light border border-gold/30">
                Voice AI
              </span>
            </h2>
            <p className="text-[11px] text-ivory/80 leading-none mt-0.5">
              {t("assistant.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Auto-Speak Toggle */}
          {isTTSSupported && (
            <button
              type="button"
              onClick={toggleAutoSpeak}
              title={autoSpeak ? t("assistant.voiceAutoSpeakOn") : t("assistant.voiceAutoSpeakOff")}
              aria-label={autoSpeak ? t("assistant.voiceAutoSpeakOn") : t("assistant.voiceAutoSpeakOff")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                autoSpeak
                  ? "text-gold-light bg-forest-light ring-1 ring-gold/40"
                  : "text-ivory/60 hover:text-white hover:bg-forest-light"
              }`}
            >
              {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t("assistant.clearChatConfirm"))) {
                  stopSpeaking();
                  clearMessages();
                }
              }}
              title={t("assistant.clearChatLabel")}
              aria-label={t("assistant.clearChatLabel")}
              className="p-1.5 rounded-lg text-ivory/70 hover:text-white hover:bg-forest-light transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              stopListening();
              setIsOpen(false);
            }}
            aria-label={t("assistant.closeAria")}
            className="p-1.5 rounded-lg text-ivory/70 hover:text-white hover:bg-forest-light transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── ACTIVE SPEECH INTERRUPTION MINI-BAR ── */}
      {(synthesisStatus === "speaking" || synthesisStatus === "paused") && (
        <div className="px-3.5 py-1.5 bg-forest-dark text-white text-[11px] flex items-center justify-between border-b border-forest-light/60 shrink-0 animate-in fade-in">
          <div className="flex items-center gap-2 text-gold-light">
            <span className="flex gap-0.5 items-end h-3">
              <span className="w-0.5 h-2 bg-gold-light animate-bounce"></span>
              <span className="w-0.5 h-3 bg-gold-light animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-0.5 h-1.5 bg-gold-light animate-bounce [animation-delay:0.3s]"></span>
            </span>
            <span className="font-medium text-xs font-mono">{t("assistant.voiceSpeakingActive")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {synthesisStatus === "speaking" ? (
              <button
                type="button"
                onClick={pauseSpeaking}
                title={t("assistant.voicePauseSpeaking")}
                aria-label={t("assistant.voicePauseSpeaking")}
                className="px-2 py-0.5 rounded bg-forest hover:bg-forest-light text-white text-[10px] font-medium cursor-pointer"
              >
                {t("assistant.voicePauseSpeaking")}
              </button>
            ) : (
              <button
                type="button"
                onClick={resumeSpeaking}
                title={t("assistant.voiceResumeSpeaking")}
                aria-label={t("assistant.voiceResumeSpeaking")}
                className="px-2 py-0.5 rounded bg-forest hover:bg-forest-light text-white text-[10px] font-medium cursor-pointer"
              >
                {t("assistant.voiceResumeSpeaking")}
              </button>
            )}
            <button
              type="button"
              onClick={stopSpeaking}
              title={t("assistant.voiceStopSpeaking")}
              aria-label={t("assistant.voiceStopSpeaking")}
              className="px-2 py-0.5 rounded bg-error/90 hover:bg-error text-white text-[10px] font-semibold cursor-pointer"
            >
              {t("assistant.voiceStopSpeaking")}
            </button>
          </div>
        </div>
      )}

      {/* ── PERMISSION DENIED NOTICE ── */}
      {recognitionStatus === "permission-denied" && (
        <div className="p-2.5 bg-error/10 border-b border-error/20 text-[11px] text-error flex items-start justify-between gap-2 shrink-0">
          <p className="leading-snug">{t("assistant.voicePermissionDenied")}</p>
          <button
            type="button"
            onClick={clearSpeechError}
            className="text-error font-bold hover:underline shrink-0 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── MESSAGES FEED ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-ivory/40">
        {messages.length === 0 ? (
          /* Welcome Card & Suggestions */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white border border-border shadow-subtle space-y-2">
              <div className="flex items-center gap-2 text-forest font-bold text-sm">
                <Sparkles size={16} className="text-gold" />
                <span>{t("assistant.welcomeTitle")}</span>
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {t("assistant.welcomeSubtitle")}
              </p>
            </div>

            <div className="space-y-2.5">
              {workspacePrompts.length > 0 && (
                <div className="p-2.5 rounded-xl bg-forest/5 border border-forest/15 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-forest">
                    <Sparkles size={12} className="text-gold" />
                    <span>{isKn ? "ಕಾರ್ಯಸ್ಥಳದ ಶಿಫಾರಸು ಪ್ರಶ್ನೆಗಳು" : "Workspace Context Prompts"}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {workspacePrompts.map((wpText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePromptClick(wpText)}
                        className="w-full text-left p-2 rounded-lg bg-white hover:bg-forest/10 border border-forest/20 text-xs text-charcoal font-medium transition-colors cursor-pointer flex items-center justify-between group shadow-2xs"
                      >
                        <span className="truncate">{wpText}</span>
                        <ArrowRight size={11} className="text-forest group-hover:translate-x-0.5 transition-transform shrink-0 ml-1.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-charcoal-muted">
                  {t("assistant.suggestedHeading")}
                </p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist">
                {(
                  [
                    { id: "all", label: t("assistant.filterAll") },
                    { id: "culture", label: t("assistant.filterCulture") },
                    { id: "food", label: t("assistant.filterFood") },
                    { id: "packing", label: t("assistant.filterPacking") },
                    { id: "phrases", label: t("assistant.filterPhrases") },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={suggestionCategory === cat.id}
                    onClick={() => setSuggestionCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all shrink-0 cursor-pointer ${
                      suggestionCategory === cat.id
                        ? "bg-forest text-white shadow-xs font-semibold"
                        : "bg-white text-charcoal-muted border border-border hover:bg-ivory-warm hover:text-charcoal"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {filteredQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptClick(q.text)}
                    className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-ivory-warm border border-border text-xs text-charcoal hover:border-forest/40 transition-colors cursor-pointer shadow-subtle flex items-center justify-between group"
                  >
                    <span>{q.text}</span>
                    <ArrowRight
                      size={12}
                      className="text-charcoal-muted group-hover:text-forest group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3 text-xs sm:text-[13px] leading-relaxed shadow-subtle ${
                  msg.sender === "user"
                    ? "bg-forest text-white rounded-br-xs"
                    : msg.isError
                    ? "bg-error/10 text-error border border-error/20 rounded-bl-xs"
                    : "bg-white text-charcoal border border-border rounded-bl-xs"
                }`}
              >
                {/* Message Body with light markdown line formatting */}
                <div className="whitespace-pre-wrap space-y-1">
                  {msg.text.split("\n").map((line, lIdx) => {
                    if (line.startsWith("### ")) {
                      return (
                        <p key={lIdx} className="font-bold text-sm pt-1 text-forest">
                          {line.replace("### ", "")}
                        </p>
                      );
                    }
                    if (line.startsWith("* **")) {
                      return (
                        <p key={lIdx} className="pl-2">
                          {line}
                        </p>
                      );
                    }
                    return <p key={lIdx}>{line}</p>;
                  })}
                </div>

                {/* Action Buttons */}
                {msg.sender === "assistant" && renderActionButtons(msg.actions)}

                {/* Source Metadata Badge */}
                {msg.sender === "assistant" && renderSourceBadge(msg)}

                {/* Assistant Controls (Copy & Speak Aloud) */}
                {msg.sender === "assistant" && !msg.isError && (
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-border/50 text-charcoal-muted">
                    {/* TTS Read Aloud Control */}
                    {isTTSSupported && (
                      <button
                        type="button"
                        onClick={() => speak(msg.text, msg.id)}
                        title={
                          activeSpeakingId === msg.id && synthesisStatus === "speaking"
                            ? t("assistant.voiceStopSpeaking")
                            : t("assistant.voiceSpeakResponse")
                        }
                        aria-label={
                          activeSpeakingId === msg.id && synthesisStatus === "speaking"
                            ? t("assistant.voiceStopSpeaking")
                            : t("assistant.voiceSpeakResponse")
                        }
                        className={`inline-flex items-center gap-1 text-[11px] cursor-pointer transition-colors ${
                          activeSpeakingId === msg.id && synthesisStatus === "speaking"
                            ? "text-gold font-bold"
                            : "hover:text-forest"
                        }`}
                      >
                        {activeSpeakingId === msg.id && synthesisStatus === "speaking" ? (
                          <>
                            <VolumeX size={13} className="text-error" />
                            <span className="text-error font-medium">
                              {t("assistant.voiceStopSpeaking")}
                            </span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={13} />
                            <span>{t("assistant.voiceSpeakResponse")}</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Copy Text Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.text, msg.id)}
                      title={t("assistant.copyResponseLabel")}
                      aria-label={t("assistant.copyResponseLabel")}
                      className="inline-flex items-center gap-1 text-[11px] hover:text-charcoal cursor-pointer ml-auto"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={11} className="text-forest" />
                          <span className="text-forest font-medium">
                            {t("assistant.copiedFeedback")}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>{t("assistant.copyResponseLabel")}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Error Retry Button */}
                {msg.sender === "assistant" && msg.isError && (
                  <div className="flex items-center justify-end mt-2 pt-2 border-t border-error/20">
                    <button
                      type="button"
                      onClick={() => retryLastMessage()}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-error/10 hover:bg-error/20 text-error text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw size={11} />
                      <span>{t("assistant.retryLabel")}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading / Processing Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="p-3 rounded-2xl rounded-bl-xs bg-white border border-border shadow-subtle text-xs text-charcoal-muted flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-forest animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-forest animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-forest animate-bounce [animation-delay:0.4s]"></span>
              </span>
              <span className="italic">{t("assistant.thinking")}</span>
            </div>
          </div>
        )}

        {/* Category C Mutating Action Confirmation Card */}
        {pendingAction && (
          <div className="p-3.5 my-2 rounded-xl bg-amber-50/95 border border-amber-300 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-200 border border-amber-300 flex items-center justify-center shrink-0 text-amber-900 font-bold text-xs">
                ⚠️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-amber-950 uppercase tracking-wider font-mono">
                    {isKn ? "ದೃಢೀಕರಣದ ಅಗತ್ಯವಿದೆ" : "Confirmation Required"}
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/60 text-amber-900 font-mono">
                    Mutating Action
                  </span>
                </div>
                <p className="text-xs text-amber-900 mt-1 font-semibold">
                  {isKn ? pendingAction.labelKn : pendingAction.labelEn}
                </p>
                <p className="text-[11px] text-amber-800/90 mt-0.5 leading-snug">
                  {isKn
                    ? "ಈ ಕ್ರಿಯೆಯು ನಿಮ್ಮ ಪ್ರವಾಸ ಯೋಜನೆಯನ್ನು ಬದಲಾಯಿಸುತ್ತದೆ. ಮುಂದುವರಿಯಲು ದೃಢೀಕರಿಸಿ."
                    : "This action will modify your active trip plan. Confirm to proceed or cancel safely."}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      confirmPendingAction();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-forest text-white text-xs font-semibold hover:bg-forest-dark transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Check size={13} />
                    <span>{isKn ? "ದೃಢೀಕರಿಸಿ" : "Confirm"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      cancelPendingAction();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-charcoal hover:bg-amber-100 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>{isKn ? "ರದ್ದುಮಾಡಿ" : "Cancel"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── VOICE LANGUAGE SELECTOR & STATUS BAR ── */}
      <div className="px-3 pt-2 pb-1 bg-white border-t border-border/80 flex items-center justify-between text-[11px] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase font-semibold text-charcoal-muted">
            {t("assistant.voiceLangSelectorAria")}:
          </span>
          <div className="inline-flex rounded-lg p-0.5 bg-ivory-warm border border-border" role="radiogroup">
            {(["en-IN", "kn-IN", "hi-IN", "te-IN"] as VoiceLanguage[]).map((lang) => (
              <button
                key={lang}
                type="button"
                role="radio"
                aria-checked={selectedVoiceLang === lang}
                onClick={() => setSelectedVoiceLang(lang)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                  selectedVoiceLang === lang
                    ? "bg-forest text-white shadow-xs font-bold"
                    : "text-charcoal-muted hover:text-charcoal"
                }`}
              >
                {VOICE_LANGUAGES[lang].nativeLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Listening indicator */}
        {recognitionStatus === "listening" ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-error animate-pulse font-mono">
            <span className="w-2 h-2 rounded-full bg-error"></span>
            {t("assistant.voiceListening")}
          </span>
        ) : selectedVoiceLang === "kn-IN" && !capabilities.hasKannadaTTS && isTTSSupported ? (
          <span
            title={t("assistant.voiceWarningKn")}
            className="text-[10px] text-gold font-mono truncate max-w-[140px]"
          >
            ℹ️ {isKn ? "ಕನ್ನಡ ಧ್ವನಿ fallback" : "Kannada TTS fallback"}
          </span>
        ) : selectedVoiceLang === "te-IN" && !capabilities.hasTeluguTTS && isTTSSupported ? (
          <span
            title={t("assistant.voiceWarningTe")}
            className="text-[10px] text-gold font-mono truncate max-w-[140px]"
          >
            ℹ️ {isKn ? "ತೆಲುಗು ಪಠ್ಯ (ಧ್ವನಿ fallback)" : "Telugu text (Voice fallback)"}
          </span>
        ) : null}
      </div>

      {/* ── INPUT FOOTER ── */}
      <div className="p-3 bg-white border-t border-border shrink-0 space-y-2">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Microphone Voice Button */}
          {isSTTSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              title={
                recognitionStatus === "listening"
                  ? t("assistant.voiceMicStop")
                  : t("assistant.voiceMicStart")
              }
              aria-label={
                recognitionStatus === "listening"
                  ? t("assistant.voiceMicStop")
                  : t("assistant.voiceMicStart")
              }
              className={`p-2.5 rounded-xl transition-all cursor-pointer shadow-subtle shrink-0 focus-visible:outline-forest ${
                recognitionStatus === "listening"
                  ? "bg-error text-white animate-pulse ring-2 ring-error/40 scale-105"
                  : recognitionStatus === "permission-denied"
                  ? "bg-error/15 text-error hover:bg-error/25 border border-error/30"
                  : "bg-ivory-warm text-charcoal border border-border hover:bg-cream hover:text-forest"
              }`}
            >
              {recognitionStatus === "listening" ? (
                <MicOff size={16} />
              ) : (
                <Mic size={16} className={recognitionStatus === "permission-denied" ? "text-error" : "text-forest"} />
              )}
            </button>
          )}

          {/* Text Input (Populated & editable during speech recognition) */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              recognitionStatus === "listening"
                ? t("assistant.voiceListening")
                : t("assistant.inputPlaceholder")
            }
            aria-label={t("assistant.inputPlaceholder")}
            className={`flex-1 px-3 py-2.5 bg-ivory/50 border rounded-xl text-xs text-charcoal placeholder:text-charcoal-muted focus:outline-none transition-colors ${
              recognitionStatus === "listening"
                ? "border-gold ring-1 ring-gold/40 bg-gold/5"
                : "border-border focus:border-forest focus:ring-1 focus:ring-forest"
            }`}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            aria-label={t("assistant.sendButtonLabel")}
            className="p-2.5 rounded-xl bg-forest text-white hover:bg-forest-light disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-subtle shrink-0"
          >
            <Send size={15} />
          </button>
        </form>

        <p className="text-[10px] text-center text-charcoal-muted/80 leading-tight">
          {t("assistant.disclaimer")}
        </p>
      </div>
    </div>
  );
}
