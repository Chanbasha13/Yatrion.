"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/lib/i18n";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, isKn } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF8F5]">
      {/* Visual Brand Panel — Left Column (Desktop) */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-5/12 bg-forest flex-col justify-between p-12 overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/destinations/hampi.jpg"
            alt="Karnataka landscape"
            fill
            priority
            sizes="50vw"
            className="object-cover opacity-25 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-forest/85 to-forest-dark/95" />
        </div>

        {/* Panel Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Logo className="text-2xl text-white group-hover:text-amber-200 transition-colors" />
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-amber-200/90 font-medium tracking-wide">
            <Sparkles size={13} className="text-amber-300" />
            <span>KDIC 2026</span>
          </div>
        </div>

        {/* Panel Center Storytelling */}
        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-white/90 text-xs font-serif tracking-wider uppercase">
            <Compass size={14} className="text-amber-300" />
            <span>{isKn ? "ಕರ್ನಾಟಕ ಪ್ರವಾಸ ನಾವೀನ್ಯತೆ" : "Karnataka Travel Operating System"}</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-serif font-bold text-white leading-tight">
            {isKn
              ? "ಕಾವೇರಿಯಿಂದ ಗೋದಾವರಿವರೆಗಿನ ಭವ್ಯ ನಿಸರ್ಗ ಮತ್ತು ಪರಂಪರೆ."
              : "Discover Karnataka with verifiable travel intelligence."}
          </h2>

          <p className="text-sm xl:text-base text-white/80 leading-relaxed font-sans">
            {isKn
              ? "31 ಜಿಲ್ಲೆಗಳ ನೈಸರ್ಗಿಕ ಜಲಪಾತಗಳು, ಗಿರಿ ಶ್ರೇಣಿಗಳು, ಪುರಾತನ ಕೋಟೆಗಳು ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ತಾಣಗಳನ್ನು ಪಾರದರ್ಶಕ ಬಜೆಟ್ ಹಾಗೂ ನೈಜ ಹವಾಮಾನ ಮಾಹಿತಿಯೊಂದಿಗೆ ಯೋಜಿಸಿ."
              : "Explore waterfalls, Western Ghat passes, mountain bastions, and coastal trails across 31 districts with explainable route algorithms, group consensus, and zero hidden costs."}
          </p>

          <div className="pt-4 grid grid-cols-3 gap-3 border-t border-white/15">
            <div>
              <div className="text-xl font-serif font-bold text-amber-300">31</div>
              <div className="text-[11px] text-white/70 uppercase tracking-wider">
                {isKn ? "ಜಿಲ್ಲೆಗಳು" : "Districts"}
              </div>
            </div>
            <div>
              <div className="text-xl font-serif font-bold text-amber-300">100%</div>
              <div className="text-[11px] text-white/70 uppercase tracking-wider">
                {isKn ? "ಶೂನ್ಯ ಶುಲ್ಕ" : "Zero-Cost"}
              </div>
            </div>
            <div>
              <div className="text-xl font-serif font-bold text-amber-300">Deterministic</div>
              <div className="text-[11px] text-white/70 uppercase tracking-wider">
                {isKn ? "ಖಚಿತ ಎಂಜಿನ್" : "Intelligence"}
              </div>
            </div>
          </div>
        </div>

        {/* Panel Footer Quote */}
        <div className="relative z-10 pt-6 border-t border-white/15 text-xs text-white/70 italic font-serif">
          &ldquo;ಸಿರಿದೇವಿಯ ಕೃಪೆಯು ನೆಲೆಸಿರುವ ನಾಡು — ಕರ್ನಾಟಕದ ಪ್ರತಿಯೊಂದು ಮೈಲಿಗಲ್ಲು ಹೊಸ ಕಥೆಯನ್ನು ಹೇಳುತ್ತದೆ.&rdquo;
        </div>
      </div>

      {/* Main Interactive Form Column — Right (Desktop) / Full (Mobile) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen">
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-charcoal-light hover:text-forest transition-colors rounded-lg px-2.5 py-1.5 -ml-2.5 hover:bg-forest/5"
          >
            <ArrowLeft size={16} />
            <span>{t("auth.backToHome")}</span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Center Container for Auth Form */}
        <div className="w-full max-w-md mx-auto my-auto py-4">{children}</div>

        {/* Bottom Micro Footer */}
        <div className="pt-8 text-center text-xs text-charcoal-light border-t border-charcoal/10">
          <span>Yatrion · Kannada Digital Innovation Hackathon 2026 · </span>
          <span className="text-forest font-medium">{isKn ? "ಸುರಕ್ಷಿತ ಸೆಷನ್" : "Secure Session"}</span>
        </div>
      </div>
    </div>
  );
}

