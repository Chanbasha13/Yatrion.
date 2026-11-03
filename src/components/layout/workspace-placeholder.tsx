"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface WorkspacePlaceholderProps {
  title: string;
  description: string;
  phase: string;
  icon: React.ReactNode;
}

export function WorkspacePlaceholder({
  title,
  description,
  phase,
  icon,
}: WorkspacePlaceholderProps) {
  const { isKn } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 space-y-8">
      <div className="p-8 sm:p-12 rounded-2xl bg-white border border-charcoal/10 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-forest/10 border border-forest/20 text-forest flex items-center justify-center mx-auto">
          {icon}
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Clock size={13} className="text-amber-700" />
            <span>{phase}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-dark">
            {title}
          </h1>

          <p className="text-sm text-charcoal-light max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-ivory-warm/60 border border-charcoal/10 text-xs text-charcoal-light max-w-lg mx-auto text-left space-y-2">
          <div className="flex items-center gap-1.5 text-forest font-semibold text-xs">
            <Sparkles size={14} className="text-amber-600" />
            <span>{isKn ? "ರಚನಾತ್ಮಕ ಬ್ಲೂಪ್ರಿಂಟ್ ಮಾಹಿತಿ" : "Architecture Roadmap Note"}</span>
          </div>
          <p>
            {isKn
              ? "ಈ ಕಾರ್ಯಸ್ಥಳವನ್ನು ಮುಂದಿನ ಹಂತದಲ್ಲಿ (Phase 4 ಅಥವಾ Phase 5) ಪ್ರತ್ಯೇಕ URL ನೊಂದಿಗೆ ಅಳವಡಿಸಲಾಗುತ್ತದೆ. ಈಗ ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಎಲ್ಲಾ ಎಂಜಿನ್‌ಗಳು ಮತ್ತು ಅಲ್ಗಾರಿದಮ್‌ಗಳು ಸಂರಕ್ಷಿತವಾಗಿವೆ."
              : "This dedicated workspace is scheduled for migration in the upcoming roadmap phase as specified in docs/part11a-implementation-roadmap.md. All existing algorithmic engines (Parts 1–10) are preserved."}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/app/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-charcoal/20 text-charcoal text-xs font-semibold hover:bg-charcoal/5 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{isKn ? "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ" : "Return to Dashboard"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
