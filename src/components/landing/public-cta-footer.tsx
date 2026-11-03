"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n";
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  MapPin, 
  Heart
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export function PublicCtaFooter() {
  const { t, isKn } = useLanguage();

  const footerLinks = [
    { labelEn: "Horizon Hero", labelKn: "ಹರೈಸನ್ ಹೀರೊ", href: "#hero" },
    { labelEn: "What is Yatrion", labelKn: "ಯಾತ್ರಿಯಾನ್ ಎಂದರೇನು", href: "#what" },
    { labelEn: "Why It Exists", labelKn: "ಯಾಕೆ ಬೇಕು", href: "#why" },
    { labelEn: "How It Works", labelKn: "ಕಾರ್ಯವಿಧಾನ", href: "#how-it-works" },
    { labelEn: "6 Workspaces", labelKn: "6 ಕಾರ್ಯಸ್ಥಳಗಳು", href: "#features" },
    { labelEn: "31 Districts", labelKn: "31 ಜಿಲ್ಲೆಗಳು", href: "#discovery" },
    { labelEn: "4 Biomes", labelKn: "4 ನೈಸರ್ಗಿಕ ವಲಯಗಳು", href: "#biomes" },
    { labelEn: "Real Map", labelKn: "ಕರ್ನಾಟಕ ನಕ್ಷೆ", href: "#map" },
    { labelEn: "AI Companion", labelKn: "AI ಸಹಾಯಕ", href: "#ai-companion" },
    { labelEn: "Traveler ROI", labelKn: "ಪ್ರಯೋಜನಗಳು", href: "#benefits" },
    { labelEn: "Platform Tour", labelKn: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ನೋಟ", href: "#previews" },
  ];

  return (
    <footer id="footer" className="bg-forest-dark text-ivory/90 relative overflow-hidden">
      {/* SECTION 11: CALL TO ACTION BANNER */}
      <div id="get-started" className="scroll-mt-20 border-b border-white/10 py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08),rgba(0,0,0,0))] pointer-events-none" />

        <div className="container-content text-center max-w-3xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-dark/20 border border-gold-dark/30 text-gold-light text-xs font-semibold uppercase tracking-widest font-mono">
            <Sparkles size={14} />
            <span>{isKn ? "ಕನ್ನಡ ಡಿಜಿಟಲ್ ನಾವೀನ್ಯತಾ ಹ್ಯಾಕಥಾನ್ 2026" : "Hackathon Evaluation Ready"}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            {t("landing.ctaTitle")}
          </h2>

          <p className="text-base sm:text-lg text-ivory/80 leading-relaxed max-w-2xl mx-auto">
            {t("landing.ctaSubtitle")}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-forest-light hover:bg-forest px-8 py-4 text-sm font-bold text-white transition-all shadow-elevation hover:-translate-y-0.5 group"
            >
              <span>{t("landing.signUpFreeBtn")}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-6 py-4 text-sm font-semibold text-white transition-all"
            >
              <UserCheck size={16} className="text-gold-light" />
              <span>{t("landing.instantDemoBtn")}</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-5 py-4 text-sm font-medium text-ivory/70 hover:text-white transition-colors"
            >
              <span>{t("landing.signInBtn")}</span>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-ivory/60 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>{t("landing.zeroCost")}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>{t("landing.secularCuration")}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>{t("landing.districtsCount")}</span>
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 12: PUBLIC FOOTER & LEGAL */}
      <div className="py-14 sm:py-16">
        <div className="container-content space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Brand column */}
            <div className="md:col-span-5 space-y-4">
              <Logo className="text-2xl !text-white" />
              <p className="text-xs sm:text-sm text-ivory/70 leading-relaxed max-w-sm">
                {isKn
                  ? "ಯಾತ್ರಿಯಾನ್ — ಕರ್ನಾಟಕದ 31 ಜಿಲ್ಲೆಗಳನ್ನು ಅನ್ವೇಷಿಸಲು ಬುದ್ಧಿವಂತ, ಜಾತ್ಯತೀತ ಮತ್ತು ಮುಕ್ತ ತಂತ್ರಜ್ಞಾನದ ಪ್ರವಾಸ ಆಪರೇಟಿಂಗ್ ಸಿಸ್ಟಮ್."
                  : "Yatrion — An intelligent, secular, zero-cost travel operating system engineered specifically for Karnataka's 31 districts."}
              </p>
              <div className="flex items-center gap-2 text-xs text-ivory/60 font-mono">
                <MapPin size={13} className="text-forest-light" />
                <span>Bengaluru • Karnataka, India</span>
              </div>
            </div>

            {/* Quick Links Navigation */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-gold-muted font-bold">
                {isKn ? "ಪುಟದ ವಿಭಾಗಗಳು" : "Landing Page Sections"}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {footerLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    className="text-ivory/70 hover:text-white transition-colors truncate"
                  >
                    {isKn ? link.labelKn : link.labelEn}
                  </Link>
                ))}
              </div>
            </div>

            {/* Data Attributions & Language Switcher */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-gold-muted font-bold">
                {isKn ? "ಮಾಹಿತಿ ಆಕರಗಳು" : "Data Attributions"}
              </h4>
              <div className="space-y-2 text-xs text-ivory/60">
                <p>
                  <strong>Weather Telemetry:</strong> Open-Meteo API (CC BY 4.0 license).
                </p>
                <p>
                  <strong>Geodetic Data:</strong> Survey of India & Karnataka Tourism Gazette.
                </p>
                <p>
                  <strong>Elevation Model:</strong> Shuttle Radar Topography Mission (SRTM).
                </p>
              </div>

              <div className="pt-2">
                <LanguageSwitcher />
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory/60 font-mono">
            <div>
              <p>© {new Date().getFullYear()} Yatrion. {t("landing.allRightsReserved")}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-white transition-colors">
                {t("auth.signInBtn")}
              </Link>
              <Link href="/signup" className="hover:text-white transition-colors">
                {t("auth.signUpBtn")}
              </Link>
              <span className="text-ivory/40">|</span>
              <span className="text-ivory/80 flex items-center gap-1">
                <span>Made for Karnataka</span>
                <Heart size={12} className="text-terracotta inline fill-terracotta" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
