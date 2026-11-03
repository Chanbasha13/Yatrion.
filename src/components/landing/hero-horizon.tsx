"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function HeroHorizon() {
  const { t, isKn } = useLanguage();

  // Mouse coordinate state normalized from -1 to 1
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    // Check reduced motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionHandler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener("change", motionHandler);

    // Check mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);

    return () => {
      motionQuery.removeEventListener("change", motionHandler);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isReducedMotion || isMobile) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMousePos({ x, y });
    },
    [isReducedMotion, isMobile]
  );

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Parallax offsets for different depth planes (in pixels)
  const skyOffset = {
    x: mousePos.x * -6,
    y: mousePos.y * -4,
  };
  const farMountainsOffset = {
    x: mousePos.x * -14,
    y: mousePos.y * -8,
  };
  const midLandscapeOffset = {
    x: mousePos.x * -24,
    y: mousePos.y * -14,
  };
  const foregroundOffset = {
    x: mousePos.x * 20,
    y: mousePos.y * 12,
  };

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#0A1A14] text-white select-none"
      style={{ perspective: "1000px" }}
    >
      {/* =========================================================================
          PLANE 0: SKY, ATMOSPHERIC DAWN LIGHT & CLOUD MIST
          ========================================================================= */}
      <div
        className="absolute inset-0 z-0 transition-transform duration-700 ease-out pointer-events-none"
        style={{
          transform: isReducedMotion
            ? "none"
            : `translate3d(${skyOffset.x}px, ${skyOffset.y}px, 0px) scale(1.05)`,
        }}
      >
        {/* Morning Sky Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#081510] via-[#0E281F] to-[#1E3B2E]" />

        {/* Sunrise Ambient Glow in the Horizon */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] rounded-full bg-radial from-amber-500/25 via-amber-700/10 to-transparent blur-3xl opacity-80" />

        {/* Dawn God-Rays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(245,158,11,0.12)_0%,rgba(15,56,42,0)_70%)]" />
      </div>

      {/* =========================================================================
          PLANE 1: FAR WESTERN GHATS RIDGELINES & VOLUMETRIC MIST
          ========================================================================= */}
      <div
        className="absolute inset-0 z-1 transition-transform duration-500 ease-out pointer-events-none opacity-40 mix-blend-screen"
        style={{
          transform: isReducedMotion
            ? "none"
            : `translate3d(${farMountainsOffset.x}px, ${farMountainsOffset.y}px, -40px) scale(1.08)`,
        }}
      >
        <Image
          src="/images/destinations/coorg.jpg"
          alt="Western Ghats silhouette"
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom filter grayscale contrast-125 brightness-75"
        />
        {/* Volumetric Valley Mist Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E281F] via-[#0E281F]/60 to-transparent" />
      </div>

      {/* =========================================================================
          PLANE 2: MIDGROUND DECCAN BOULDERS & TUNGABHADRA VALLEY
          ========================================================================= */}
      <div
        className="absolute inset-0 z-2 transition-transform duration-300 ease-out pointer-events-none opacity-45"
        style={{
          transform: isReducedMotion
            ? "none"
            : `translate3d(${midLandscapeOffset.x}px, ${midLandscapeOffset.y}px, 0px) scale(1.06)`,
        }}
      >
        <Image
          src="/images/destinations/hampi.jpg"
          alt="Hampi boulders landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter contrast-110 brightness-85"
        />
        {/* Depth vignette & atmospheric shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#081510] via-transparent to-[#081510]/80" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#081510]/50 to-[#081510]/90" />
      </div>

      {/* Drifting Mist Ribbons (CSS Animated) */}
      <div className="absolute inset-x-0 bottom-0 h-64 z-3 pointer-events-none overflow-hidden opacity-60">
        <div className="absolute -left-1/4 bottom-0 w-[150%] h-48 bg-gradient-to-r from-transparent via-emerald-100/10 to-transparent blur-2xl animate-pulse" />
      </div>

      {/* =========================================================================
          PLANE 3: HERO EDITORIAL CONTENT & CALL TO ACTIONS
          ========================================================================= */}
      <div className="relative z-10 container-content pt-28 pb-16 md:pt-36 md:pb-20 flex-1 flex flex-col justify-center">
        <div className="max-w-4xl space-y-6">
          {/* Classical Inscription Badge */}
          <div className="inline-flex flex-wrap items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-amber-200/90 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-serif tracking-wider font-semibold text-amber-300">
              {t("landing.heroBadge")}
            </span>
            <span className="text-white/40">|</span>
            <span className="font-serif italic text-white/90 text-[11px] sm:text-xs">
              &ldquo;{t("landing.heroKaviraja")}&rdquo;
            </span>
          </div>

          {/* Main Editorial Headline */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white tracking-tight leading-[1.08] drop-shadow-md">
              <span className="block text-white/95">{t("landing.heroTitle1")}</span>
              <span className="block bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent italic font-serif">
                {t("landing.heroTitle2")}
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl font-sans leading-relaxed drop-shadow-xs">
            {t("landing.heroSubtitle")}
          </p>

          {/* Dual Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 max-w-xl">
            {/* Primary Action: Sign Up */}
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-forest hover:bg-forest-light text-white text-sm font-semibold transition-all shadow-lg hover:shadow-emerald-900/40 hover:-translate-y-0.5 active:translate-y-0 border border-forest-light/40 group"
            >
              <span>{t("landing.startJourneyBtn")}</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform text-amber-300"
              />
            </Link>

            {/* Hackathon Evaluation Action: 1-Click Demo */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-200 hover:text-white border border-amber-300/40 text-sm font-semibold transition-all backdrop-blur-md"
            >
              <ShieldCheck size={16} className="text-amber-400" />
              <span>{t("landing.exploreDemoBtn")}</span>
            </Link>
          </div>

          {/* Geographic Metric Indicators */}
          <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/15 max-w-lg">
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-serif font-bold text-amber-300">
                31
              </div>
              <div className="text-[11px] sm:text-xs text-white/70 font-medium tracking-wide">
                {isKn ? "ಸಮಗ್ರ ಜಿಲ್ಲೆಗಳು" : "Districts Covered"}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-serif font-bold text-amber-300">
                100%
              </div>
              <div className="text-[11px] sm:text-xs text-white/70 font-medium tracking-wide">
                {isKn ? "ಜಾತ್ಯತೀತ ತಾಣಗಳು" : "Secular Curation"}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-serif font-bold text-amber-300">
                Deterministic
              </div>
              <div className="text-[11px] sm:text-xs text-white/70 font-medium tracking-wide">
                {isKn ? "ಖಚಿತ ಅಲ್ಗಾರಿದಮ್" : "Route Intelligence"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PLANE 4: FOREGROUND BOTANICAL SILHOUETTES
          ========================================================================= */}
      <div
        className="hidden lg:block absolute -bottom-10 -right-12 z-20 w-80 h-96 pointer-events-none opacity-30 transition-transform duration-300"
        style={{
          transform: isReducedMotion
            ? "none"
            : `translate3d(${foregroundOffset.x}px, ${foregroundOffset.y}px, 20px)`,
        }}
      >
        <div className="w-full h-full bg-radial from-forest-light/20 to-transparent blur-xl" />
      </div>

      {/* Bottom Floating Scroll Anchor to Section 5: 3D Terrain */}
      <div className="relative z-10 pb-6 text-center">
        <a
          href="#map"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white/80 hover:text-white transition-all backdrop-blur-xs group"
        >
          <Compass size={14} className="text-amber-300 group-hover:rotate-45 transition-transform" />
          <span>{t("landing.exploreTerrainBtn")}</span>
          <ChevronDown size={14} className="animate-bounce text-amber-300" />
        </a>
      </div>
    </section>
  );
}
