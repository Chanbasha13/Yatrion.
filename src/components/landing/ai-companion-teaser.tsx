"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { 
  Bot, 
  Volume2, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SampleDialogue {
  id: string;
  categoryEn: string;
  categoryKn: string;
  userPromptEn: string;
  userPromptKn: string;
  assistantReplyEn: string;
  assistantReplyKn: string;
  tagsEn: string[];
  tagsKn: string[];
}

export function AiCompanionTeaser() {
  const { t, isKn } = useLanguage();
  const [activeTab, setActiveTab] = useState<number>(0);

  const dialogues: SampleDialogue[] = [
    {
      id: "ghat-safety",
      categoryEn: "Ghat Safety & Weather",
      categoryKn: "ಘಾಟಿ ಸುರಕ್ಷತೆ ಮತ್ತು ಹವಾಮಾನ",
      userPromptEn: "Will rain affect our drive through Shiradi Ghat tomorrow afternoon?",
      userPromptKn: "ನಾಳೆ ಮಧ್ಯಾಹ್ನ ಶಿರಾಡಿ ಘಾಟಿಯ ಮೂಲಕ ಪ್ರಯಾಣಿಸುವಾಗ ಮಳೆ ತೊಂದರೆ ನೀಡಬಹುದೇ?",
      assistantReplyEn: "Open-Meteo telemetry indicates light precipitation (2.4 mm/hr) along NH75 with mist between 14:00 and 17:00. No landslide warnings are active on Shiradi Ghat. Plan for a 1.45x curve multiplier (approx 2h 20m from Sakleshpur to Gundya) and ensure you clear the pass before sunset at 18:22.",
      assistantReplyKn: "ಓಪನ್-ಮೀಟಿಯೋ ಹವಾಮಾನ ವರದಿಯ ಪ್ರಕಾರ ಎನ್‌ಎಚ್75 ನಲ್ಲಿ ಮಧ್ಯಾಹ್ನ 2 ರಿಂದ ಸಂಜೆ 5 ರವರೆಗೆ ಸಾಧಾರಣ ಮಳೆ (2.4 ಮಿ.ಮೀ/ಗಂ) ಮತ್ತು ಮಂಜು ಇರಲಿದೆ. ಶಿರಾಡಿ ಘಾಟಿಯಲ್ಲಿ ಯಾವುದೇ ಭೂಕುಸಿತದ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ. 1.45x ತಿರುವು ಗುಣಕದೊಂದಿಗೆ ಸಕಲೇಶಪುರದಿಂದ ಗುಂಡ್ಯವರೆಗೆ ಸುಮಾರು 2 ಗಂಟೆ 20 ನಿಮಿಷ ನಿರೀಕ್ಷಿಸಿ, ಸೂರ್ಯಾಸ್ತ 18:22 ರ ಮುನ್ನ ಘಾಟಿ ದಾಟಲು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ.",
      tagsEn: ["Open-Meteo Verified", "Shiradi Ghat NH75", "1.45x Curve Penalty"],
      tagsKn: ["ಓಪನ್-ಮೀಟಿಯೋ ವರದಿ", "ಶಿರಾಡಿ ಘಾಟಿ ಎನ್‌ಎಚ್75", "1.45x ತಿರುವು ಗುಣಕ"],
    },
    {
      id: "jog-accessibility",
      categoryEn: "Senior Accessibility & Timing",
      categoryKn: "ಹಿರಿಯರ ಪ್ರವೇಶಾವಕಾಶ ಮತ್ತು ಸಮಯ",
      userPromptEn: "Can my 68-year-old parents comfortably visit Jog Falls without climbing all the stairs?",
      userPromptKn: "ನನ್ನ 68 ವರ್ಷದ ಪೋಷಕರು ಮೆಟ್ಟಿಲುಗಳನ್ನು ಹತ್ತದೇ ಜೋಗ ಜಲಪಾತವನ್ನು ಆರಾಮವಾಗಿ ವೀಕ್ಷಿಸಬಹುದೇ?",
      assistantReplyEn: "Yes. Advise them against taking the 1,400 steps down to the Sharavathi gorge basin. Instead, direct them to the KSTDC Maurya viewing platform and the British Bungalow viewpoint, which offer wheelchair ramps, level paved pathways, and an uninterrupted panoramic vista of Raja, Rani, Roarer, and Rocket cascades.",
      assistantReplyKn: "ಖಂಡಿತ. ಶರಾವತಿ ಕಣಿವೆಯ ತಳಕ್ಕೆ ಹೋಗುವ 1,400 ಕಡಿದಾದ ಮೆಟ್ಟಿಲುಗಳನ್ನು ಇಳಿಯದಂತೆ ಅವರಿಗೆ ತಿಳಿಸಿ. ಬದಲಿಗೆ ಕೆಎಸ್‌ಟಿಡಿಸಿ ಮೌರ್ಯ ವೀಕ್ಷಣಾ ತಾಣ ಮತ್ತು ಬ್ರಿಟಿಷ್ ಬಂಗಲೆ ವ್ಯೂಪಾಯಿಂಟ್‌ಗೆ ಕರೆದೊಯ್ಯಿರಿ. ಇಲ್ಲಿ ವೀಲ್‌ಚೇರ್ ರ‍್ಯಾಂಪ್ ಮತ್ತು ಸಮತಟ್ಟಾದ ರಸ್ತೆಗಳಿದ್ದು, ರಾಜ, ರಾಣಿ, ರೋರರ್ ಮತ್ತು ರಾಕೆಟ್ ಜಲಧಾರೆಗಳ ಭವ್ಯ ದೃಶ್ಯವನ್ನು ಆರಾಮವಾಗಿ ವೀಕ್ಷಿಸಬಹುದು.",
      tagsEn: ["Mobility Vetted", "KSTDC Viewpoint", "Zero-Climb Access"],
      tagsKn: ["ಪ್ರವೇಶಾವಕಾಶ ಪರೀಕ್ಷಿತ", "ಕೆಎಸ್‌ಟಿಡಿಸಿ ವ್ಯೂಪಾಯಿಂಟ್", "ಮೆಟ್ಟಿಲು ರಹಿತ ವೀಕ್ಷಣೆ"],
    },
    {
      id: "hidden-gem",
      categoryEn: "Uncrowded Nature Trail",
      categoryKn: "ಅಜ್ಞಾತ ನೈಸರ್ಗಿಕ ತಾಣ",
      userPromptEn: "We want a peaceful waterfall near Dandeli that isn't packed with noisy rafting tour groups.",
      userPromptKn: "ದಾಂಡೇಲಿ ಬಳಿ ಪ್ರವಾಸಿಗರ ಗದ್ದಲವಿಲ್ಲದ ಶಾಂತಿಯುತ ಜಲಪಾತವನ್ನು ಸೂಚಿಸಿ.",
      assistantReplyEn: "Skip the central Kali river clusters and head 32 km southeast to Magod Falls, where the Bedti River plunges 200m in two tiers into a densely forested gorge. Alternatively, Sathodi Falls (via Yellapur forest road) offers calm emerald swimming pools. Arrive between 08:30 and 10:00 for total solitude.",
      assistantReplyKn: "ಕಾಳಿ ನದಿಯ ಕಿಕ್ಕಿರಿದ ತಾಣಗಳನ್ನು ಬಿಟ್ಟು, 32 ಕಿ.ಮೀ ದೂರದಲ್ಲಿರುವ ಮಾಗೋಡು ಜಲಪಾತಕ್ಕೆ ಭೇಟಿ ನೀಡಿ. ಇಲ್ಲಿ ಬೇಡ್ತಿ ನದಿಯು 200 ಮೀಟರ್ ಆಳದ ಹಸಿರು ಕಣಿವೆಗೆ ಧುಮುಕುತ್ತದೆ. ಅಥವಾ ಸಾತೊಡ್ಡಿ ಜಲಪಾತವು ಅತ್ಯಂತ ರಮಣೀಯ ಮತ್ತು ಶಾಂತಿಯುತವಾಗಿದೆ. ಮುಂಜಾನೆ 8:30 ರಿಂದ 10:00 ರ ನಡುವೆ ತಲುಪಿದರೆ ಸಂಪೂರ್ಣ ಪ್ರಶಾಂತತೆ ಅನುಭವಿಸಬಹುದು.",
      tagsEn: ["Hidden Gem", "Sathodi & Magod", "Zero Commercial Clutter"],
      tagsKn: ["ಅಜ್ಞಾತ ರತ್ನ", "ಸಾತೊಡ್ಡಿ ಮತ್ತು ಮಾಗೋಡು", "ವಾಣಿಜ್ಯ ಗದ್ದಲವಿಲ್ಲ"],
    },
  ];

  const currentDialogue = dialogues[activeTab];

  return (
    <section id="ai-companion" className="py-20 md:py-28 bg-white border-b border-border/80 scroll-mt-20">
      <div className="container-content space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold uppercase tracking-widest font-mono">
            <Bot size={14} />
            <span>{t("landing.aiCompanionTag")}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
            {t("landing.aiCompanionTitle")}
          </h2>
          <p className="text-base sm:text-lg text-charcoal-light leading-relaxed">
            {t("landing.aiCompanionSubtitle")}
          </p>
        </div>

        {/* Interactive Chat Simulation */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-ivory-warm/30 shadow-subtle overflow-hidden">
          {/* Top Bar of Simulation */}
          <div className="bg-forest-dark text-white px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center text-white">
                <Bot size={20} />
              </div>
              <div>
                <span className="font-bold text-sm text-ivory block">
                  {isKn ? "ಯಾತ್ರಿಯಾನ್ ಕರ್ನಾಟಕ AI ಗೈಡ್" : "Yatrion Karnataka AI Guide"}
                </span>
                <span className="text-xs text-ivory/60 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Kannada & English • Grounded Telemetry</span>
                </span>
              </div>
            </div>

            {/* Simulated Audio Waveform */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
              <Volume2 size={15} className="text-emerald-400" />
              <div className="flex items-center gap-1 h-3">
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
                <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.1s]" />
              </div>
              <span className="text-[11px] font-mono text-ivory/80">Browser Voice Engine</span>
            </div>
          </div>

          {/* Dialogue Tabs */}
          <div className="flex border-b border-border bg-white divide-x divide-border">
            {dialogues.map((dlg, idx) => (
              <button
                key={dlg.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "flex-1 px-4 py-3 text-xs font-semibold text-center transition-colors truncate",
                  activeTab === idx
                    ? "bg-forest/5 text-forest border-b-2 border-forest font-bold"
                    : "text-charcoal-light hover:bg-ivory-warm hover:text-charcoal"
                )}
              >
                {isKn ? dlg.categoryKn : dlg.categoryEn}
              </button>
            ))}
          </div>

          {/* Chat Body */}
          <div className="p-6 sm:p-8 space-y-6 bg-white min-h-[300px]">
            {/* User message */}
            <div className="flex items-start justify-end gap-3">
              <div className="max-w-lg rounded-2xl rounded-tr-sm bg-forest text-white p-4 text-xs sm:text-sm shadow-sm">
                <p>{isKn ? currentDialogue.userPromptKn : currentDialogue.userPromptEn}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-ivory-warm border border-border flex items-center justify-center text-charcoal-light shrink-0 font-mono text-xs font-bold">
                You
              </div>
            </div>

            {/* Assistant message */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-forest-dark text-emerald-400 flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
              <div className="max-w-xl space-y-3">
                <div className="rounded-2xl rounded-tl-sm bg-ivory-warm/60 border border-border p-5 text-xs sm:text-sm text-charcoal leading-relaxed shadow-sm">
                  <p>{isKn ? currentDialogue.assistantReplyKn : currentDialogue.assistantReplyEn}</p>
                </div>

                {/* Grounding Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pl-1">
                  {(isKn ? currentDialogue.tagsKn : currentDialogue.tagsEn).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-forest/5 border border-forest/15 text-forest text-[11px] font-mono font-medium"
                    >
                      <CheckCircle2 size={12} />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer of simulation */}
          <div className="p-4 bg-ivory-warm/40 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-light">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-forest" />
              <span>
                {isKn 
                  ? "ಶೂನ್ಯ ಕಲ್ಪಿತ ಮಾಹಿತಿ — ಕರ್ನಾಟಕದ ಅಧಿಕೃತ ಭೌಗೋಳಿಕತೆ ಮತ್ತು ಹವಾಮಾನಕ್ಕೆ ಬದ್ಧ" 
                  : "Zero hallucinations — strictly grounded in verified Karnataka geography & live telemetry"}
              </span>
            </div>
            <Link
              href="/signup"
              className="text-xs font-semibold text-forest hover:text-forest-dark flex items-center gap-1 group"
            >
              <span>{isKn ? "ಸಹಾಯಕರೊಂದಿಗೆ ಮಾತನಾಡಿ" : "Chat with AI Companion"}</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
