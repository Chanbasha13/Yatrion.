"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  MapPin,
  Calendar,
  Compass,
  Route,
  Coins,
  Users,
  Activity,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Plus,
  CheckCircle2,
  Clock,
  CloudSun,
  CheckSquare,
  Square,
  ChevronRight,
  BookmarkCheck,
} from "lucide-react";
import type { ItineraryStop } from "@/lib/itinerary-engine";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import {
  loadUserTrip,
  saveUserTrip,
  getUserSavedPlaces,
  toggleUserSavedPlace,
  type StoredTripState,
} from "@/lib/storage/user-trip-service";
import {
  SECULAR_ATTRACTIONS,
  KARNATAKA_DISTRICTS,
  type SecularAttraction,
} from "@/lib/explore/district-data";
import { calculateOptimizedBudget } from "@/lib/budget/budget-optimizer";

export default function DashboardPage() {
  const { user, loginDemo } = useAuth();
  const { t, isKn } = useLanguage();
  const router = useRouter();

  const [storedTrip, setStoredTrip] = useState<StoredTripState | null>(() => {
    if (typeof window !== "undefined") {
      return loadUserTrip(user?.id, user?.isDemo);
    }
    return null;
  });

  const [savedIds, setSavedIds] = useState<string[]>(() =>
    typeof window !== "undefined" ? getUserSavedPlaces(user?.id) : []
  );

  const [isResettingDemo, setIsResettingDemo] = useState(false);

  const handleResetDemo = async () => {
    setIsResettingDemo(true);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("yatrion-trip-demo-v1");
        window.localStorage.removeItem("yatrion-saved-places-user-demo-karnataka-v1");
      }
      await loginDemo();
      window.location.reload();
    } finally {
      setIsResettingDemo(false);
    }
  };

  // Toggle stop completion directly from dashboard command center
  const handleToggleStop = (key: string) => {
    if (!storedTrip) return;
    const isCompleted = storedTrip.completedStopKeys.includes(key);
    const updatedKeys = isCompleted
      ? storedTrip.completedStopKeys.filter((k) => k !== key)
      : [...storedTrip.completedStopKeys, key];

    const updated = {
      ...storedTrip,
      completedStopKeys: updatedKeys,
      savedAt: new Date().toISOString(),
    };
    setStoredTrip(updated);
    saveUserTrip(user?.id, user?.isDemo, updated);
  };

  // Remove saved place
  const handleRemoveSavedPlace = (placeId: string) => {
    toggleUserSavedPlace(user?.id, placeId);
    setSavedIds(getUserSavedPlaces(user?.id));
  };

  // User's actual saved attractions from 31-district dataset
  const userSavedAttractions = useMemo(() => {
    return SECULAR_ATTRACTIONS.filter((a) => savedIds.includes(a.id));
  }, [savedIds]);

  // Fallback secular highlights if user hasn't saved places yet
  const defaultHighlights: SecularAttraction[] = useMemo(() => {
    return SECULAR_ATTRACTIONS.slice(0, 4);
  }, []);

  // Compute trip telemetry
  const totalStops = useMemo(() => {
    if (!storedTrip?.editedDays) return 0;
    return storedTrip.editedDays.reduce((acc, day) => acc + (day.stops?.length || 0), 0);
  }, [storedTrip]);

  const completedCount = storedTrip?.completedStopKeys?.length || 0;
  const progressPercent = totalStops > 0 ? Math.round((completedCount / totalStops) * 100) : 0;

  // Next upcoming activities preview
  const upcomingStops = useMemo(() => {
    if (!storedTrip?.editedDays) return [];
    const allStops: Array<{ stopKey: string; dayNum: number; stop: ItineraryStop }> = [];
    storedTrip.editedDays.forEach((day, dIdx) => {
      day.stops.forEach((s, sIdx) => {
        const key = `${day.dayNumber || dIdx + 1}-${sIdx}`;
        allStops.push({ stopKey: key, dayNum: day.dayNumber || dIdx + 1, stop: s });
      });
    });
    return allStops.slice(0, 4);
  }, [storedTrip]);

  // Compute budget summary
  const budgetSummary = useMemo(() => {
    if (!storedTrip) return null;
    if (storedTrip.budgetPlan) {
      return storedTrip.budgetPlan.scenarios.balanced;
    }
    const computed = calculateOptimizedBudget({
      itinerary: storedTrip.originalItinerary,
      preferences: storedTrip.preferences,
      routePlan: storedTrip.optimizedRoute,
      scenarioKey: "balanced",
      travellerCount: storedTrip.preferences.travellerCount,
    });
    return computed.scenarios.balanced;
  }, [storedTrip]);

  // Workspaces Definition
  const workspaceCards = [
    {
      title: t("dashboard.exploreCardTitle"),
      desc: t("dashboard.exploreCardDesc"),
      href: "/app/explore",
      icon: Compass,
      badge: isKn ? "31 ಜಿಲ್ಲೆಗಳು" : "31 Districts",
    },
    {
      title: t("dashboard.routesCardTitle"),
      desc: t("dashboard.routesCardDesc"),
      href: "/app/routes",
      icon: Route,
      badge: isKn ? "ಮಾರ್ಗಗಳು" : "Transit",
    },
    {
      title: t("dashboard.budgetCardTitle"),
      desc: t("dashboard.budgetCardDesc"),
      href: "/app/budget",
      icon: Coins,
      badge: isKn ? "ಬಜೆಟ್" : "Itemized",
    },
    {
      title: t("dashboard.gemsCardTitle"),
      desc: t("dashboard.gemsCardDesc"),
      href: "/app/gems",
      icon: Sparkles,
      badge: isKn ? "ಅಜ್ಞಾತ ರತ್ನಗಳು" : "Offbeat",
    },
    {
      title: t("dashboard.groupCardTitle"),
      desc: t("dashboard.groupCardDesc"),
      href: "/app/group",
      icon: Users,
      badge: isKn ? "ಗುಂಪು ಪ್ಲಾನರ್" : "Consensus",
    },
    {
      title: t("dashboard.adaptiveCardTitle"),
      desc: t("dashboard.adaptiveCardDesc"),
      href: "/app/adaptive",
      icon: Activity,
      badge: isKn ? "ಹವಾಮಾನ & ಸಲಹೆ" : "Live Weather",
    },
  ];

  const userName = user?.name ? user.name.split(" ")[0] : "Traveler";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* 1. Welcome Command Center Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-forest p-6 sm:p-8 text-white shadow-sm border border-forest-light/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-radial from-amber-400/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-amber-200 font-medium">
            <Sparkles size={13} className="text-amber-300" />
            <span>{t("dashboard.seasonBadge")}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            {t("dashboard.welcomeTitle", { name: userName })}
          </h1>

          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
            {t("dashboard.welcomeSubtitle")}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/app/planner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-forest-dark text-xs sm:text-sm font-bold hover:bg-amber-300 transition-colors shadow-xs"
            >
              <Plus size={16} />
              <span>{t("dashboard.startJourneyBtn")}</span>
            </Link>

            <Link
              href="/app/explore"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Compass size={16} />
              <span>{isKn ? "31 ಜಿಲ್ಲೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ" : "Explore 31 Districts"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Demo Traveler Mode Callout Banner */}
      {user?.isDemo && (
        <div className="p-4 rounded-xl border border-amber-300/80 bg-amber-50/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-amber-900">
                {t("dashboard.demoBannerTitle")}
              </div>
              <div className="text-[11px] text-amber-800 leading-relaxed">
                {t("dashboard.demoBannerDesc")}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetDemo}
            disabled={isResettingDemo}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-amber-300 text-amber-900 text-xs font-medium hover:bg-amber-100 transition-colors disabled:opacity-60 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>
              {isResettingDemo
                ? (isKn ? "ಮರುಹೊಂದಿಸಲಾಗುತ್ತಿದೆ..." : "Resetting...")
                : t("dashboard.resetDemoBtn")}
            </span>
          </button>
        </div>
      )}

      {/* 3. Active Journey Overview & Progress Telemetry */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-forest-dark flex items-center gap-2">
            <Calendar size={18} className="text-forest" />
            <span>{t("dashboard.activeTripTitle")}</span>
          </h2>
          {storedTrip && (
            <Link
              href="/app/planner"
              className="text-xs font-semibold text-forest hover:text-forest-dark flex items-center gap-1"
            >
              <span>{t("dashboard.viewItineraryBtn")}</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {storedTrip ? (
          <div className="p-6 rounded-2xl bg-white border border-charcoal/10 shadow-xs space-y-6">
            {/* Top metadata & verified badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-charcoal-light">
                  {storedTrip.preferences.durationDays} {isKn ? "ದಿನಗಳ ಪ್ರವಾಸ" : "Day Journey"} · {storedTrip.preferences.travelStyle} · {storedTrip.preferences.transport}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-charcoal mt-0.5">
                  {storedTrip.originalItinerary.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>{isKn ? "ದೃಢೀಕೃತ ಮಾರ್ಗ" : "Verified Route"}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-semibold">
                  <span>{storedTrip.preferences.budget}</span>
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5 p-4 rounded-xl bg-ivory-warm/40 border border-charcoal/10">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-charcoal flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-forest" />
                  <span>{isKn ? "ಪ್ರವಾಸದ ಪ್ರಗತಿ" : "Journey Activity Progress"}:</span>
                </span>
                <span className="text-forest font-bold">
                  {completedCount} / {totalStops} {isKn ? "ತಾಣಗಳು ಮುಗಿದಿವೆ" : "completed"} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-charcoal/10 overflow-hidden">
                <div
                  className="h-full bg-forest transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* 3 Metric Cards: Upcoming Stops, Budget Snapshot, Weather Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-charcoal/10 text-xs">
              {/* Upcoming activities */}
              <div className="p-4 rounded-xl bg-white border border-charcoal/10 space-y-2.5">
                <span className="text-[11px] font-mono text-charcoal-light uppercase font-bold flex items-center gap-1.5">
                  <Clock size={13} className="text-forest" />
                  <span>{isKn ? "ಮುಂದಿನ ಚಟುವಟಿಕೆಗಳು" : "Upcoming Stops"}</span>
                </span>
                <div className="space-y-2">
                  {upcomingStops.length > 0 ? (
                    upcomingStops.map(({ stopKey, dayNum, stop }) => {
                      const isDone = storedTrip.completedStopKeys.includes(stopKey);
                      return (
                        <div
                          key={stopKey}
                          onClick={() => handleToggleStop(stopKey)}
                          className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-forest/5 cursor-pointer transition-colors"
                        >
                          <button
                            type="button"
                            className="mt-0.5 text-forest shrink-0"
                            aria-label="Toggle completion"
                          >
                            {isDone ? <CheckSquare size={14} /> : <Square size={14} className="text-charcoal-light" />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-medium truncate ${isDone ? "line-through text-charcoal-light" : "text-charcoal"}`}>
                              {isKn && stop.destinationKannada ? `${stop.destinationKannada}: ${stop.title}` : stop.title}
                            </p>
                            <span className="text-[10px] text-charcoal-light font-mono capitalize">
                              Day {dayNum} • {stop.timeOfDay || "Activity"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-charcoal-light">No stops configured.</p>
                  )}
                </div>
              </div>

              {/* Budget overview */}
              <div className="p-4 rounded-xl bg-white border border-charcoal/10 space-y-2.5">
                <span className="text-[11px] font-mono text-charcoal-light uppercase font-bold flex items-center gap-1.5">
                  <Coins size={13} className="text-gold-dark" />
                  <span>{isKn ? "ಅಂದಾಜು ಬಜೆಟ್ ಸಾರಾಂಶ" : "Itemized Budget"}</span>
                </span>
                {budgetSummary ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold font-serif text-charcoal">
                        ₹{budgetSummary.totalCost.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[11px] text-charcoal-light font-mono">
                        (₹{budgetSummary.perPersonCost.toLocaleString("en-IN")}/person)
                      </span>
                    </div>
                    {(() => {
                      const transportCost = budgetSummary.categories.find((c) => c.key === "transport")?.estimatedCost || 0;
                      const stayCost = budgetSummary.categories.find((c) => c.key === "accommodation")?.estimatedCost || 0;
                      const foodCost = budgetSummary.categories.find((c) => c.key === "food")?.estimatedCost || 0;
                      const activitiesCost = budgetSummary.categories.find((c) => c.key === "activities")?.estimatedCost || 0;
                      return (
                        <div className="space-y-1 text-[11px] font-mono text-charcoal-light border-t border-charcoal/10 pt-2">
                          <div className="flex justify-between">
                            <span>Transport:</span>
                            <span className="font-semibold text-charcoal">₹{transportCost.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Accommodation:</span>
                            <span className="font-semibold text-charcoal">₹{stayCost.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Food & Activities:</span>
                            <span className="font-semibold text-charcoal">₹{(foodCost + activitiesCost).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      );
                    })()}
                    <Link
                      href="/app/budget"
                      className="block text-[11px] text-forest font-semibold hover:underline pt-1"
                    >
                      {isKn ? "ಪೂರ್ಣ ಬಜೆಟ್ ವೀಕ್ಷಿಸಿ →" : "View Full Optimizer →"}
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs text-charcoal-light">Calculating breakdown...</p>
                )}
              </div>

              {/* Weather & Travel Advisory */}
              <div className="p-4 rounded-xl bg-white border border-charcoal/10 space-y-2.5">
                <span className="text-[11px] font-mono text-charcoal-light uppercase font-bold flex items-center gap-1.5">
                  <CloudSun size={13} className="text-forest" />
                  <span>{isKn ? "ಹವಾಮಾನ ಸ್ಥಿತಿಗತಿ" : "Atmospheric Guidance"}</span>
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <p className="text-[11px] leading-tight">
                      {isKn
                        ? "ಘಟ್ಟ ಪ್ರದೇಶದ ರಸ್ತೆಗಳು ಮುಕ್ತವಾಗಿವೆ. ಹಿತಕರ ತಾಪಮಾನ ನಿರೀಕ್ಷಿತ."
                        : "Western Ghats passes open. Clear daytime driving conditions."}
                    </p>
                  </div>
                  <p className="text-[11px] text-charcoal-light leading-relaxed">
                    Open-Meteo CC BY 4.0 telemetry actively monitors rain risks and highway advisories.
                  </p>
                  <Link
                    href="/app/adaptive"
                    className="block text-[11px] text-forest font-semibold hover:underline pt-1"
                  >
                    {isKn ? "ಹೊಂದಾಣಿಕೆಯ ಕಂಪ್ಯಾನಿಯನ್ →" : "Open Adaptive Command →"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Rich Onboarding Templates for New Users */
          <div className="p-8 rounded-2xl bg-white border border-charcoal/10 shadow-xs space-y-6">
            <div className="text-center space-y-2 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center mx-auto">
                <Compass size={24} />
              </div>
              <h3 className="text-lg font-serif font-bold text-forest-dark">
                {isKn ? "ನಿಮ್ಮ ಮೊದಲ ಕರ್ನಾಟಕ ಪ್ರವಾಸವನ್ನು ಪ್ರಾರಂಭಿಸಿ" : "Start Your First Karnataka Journey"}
              </h3>
              <p className="text-xs text-charcoal-light leading-relaxed">
                {isKn
                  ? "ಕೆಳಗಿನ ಜನಪ್ರಿಯ ಬ್ಲೂಪ್ರಿಂಟ್‌ಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ ಅಥವಾ ಸಂಪೂರ್ಣ ಕಸ್ಟಮ್ ಪ್ರವಾಸವನ್ನು ಯೋಜಿಸಿ."
                  : "Select one of our curated Karnataka blueprints below to launch an optimized itinerary immediately, or build custom parameters in the Smart Trip Planner."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {[
                {
                  id: "chikmagalur",
                  title: isKn ? "ಚಿಕ್ಕಮಗಳೂರು & ಕೊಡಗು" : "Western Ghats Rainforest",
                  days: "3 Days",
                  style: "Relaxed Pace",
                  img: "/images/destinations/chikmagalur.jpg",
                  dest: "chikmagalur",
                },
                {
                  id: "hampi",
                  title: isKn ? "ಹಂಪಿ & ಬಾದಾಮಿ ಹೆರಿಟೇಜ್" : "Deccan Granite Citadel",
                  days: "4 Days",
                  style: "Balanced Pace",
                  img: "/images/destinations/hampi.jpg",
                  dest: "hampi",
                },
                {
                  id: "gokarna",
                  title: isKn ? "ಗೋಕರ್ಣ & ಕಾರವಾರ ಕರಾವಳಿ" : "Karavali Coastal Odyssey",
                  days: "3 Days",
                  style: "Balanced Pace",
                  img: "/images/destinations/gokarna.jpg",
                  dest: "gokarna",
                },
              ].map((template) => (
                <div
                  key={template.id}
                  onClick={() => router.push(`/app/planner?destination=${template.dest}`)}
                  className="group relative rounded-xl border border-charcoal/10 bg-ivory-warm/30 overflow-hidden hover:shadow-md hover:border-forest/30 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-28 w-full bg-forest-dark">
                    <Image
                      src={template.img}
                      alt={template.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/90 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                      {template.days} · {template.style}
                    </span>
                  </div>
                  <div className="p-3.5 space-y-2">
                    <h4 className="font-serif font-bold text-xs text-charcoal group-hover:text-forest transition-colors">
                      {template.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest">
                      <span>{isKn ? "ಪ್ಲಾನ್ ಪ್ರಾರಂಭಿಸಿ" : "Start This Blueprint"}</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <Link
                href="/app/planner"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-dark transition-all shadow-xs"
              >
                <Plus size={15} />
                <span>{isKn ? "ಕಸ್ಟಮ್ ಪ್ರವಾಸ ಪ್ಲಾನ್ ಮಾಡಿ" : "Build Custom Itinerary"}</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 4. Platform Workspaces Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-forest-dark flex items-center gap-2">
            <Sparkles size={18} className="text-forest" />
            <span>{t("dashboard.workspacesTitle")}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaceCards.map((ws) => {
            const IconComponent = ws.icon;
            return (
              <Link
                key={ws.href}
                href={ws.href}
                className="group relative p-5 rounded-2xl bg-white border border-charcoal/10 hover:border-forest/30 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center group-hover:bg-forest group-hover:text-white transition-colors">
                      <IconComponent size={20} />
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-sm bg-charcoal/5 text-charcoal-light border border-charcoal/10">
                      {ws.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-serif font-bold text-forest-dark group-hover:text-forest transition-colors">
                      {ws.title}
                    </h3>
                    <p className="text-xs text-charcoal-light mt-1 line-clamp-2 leading-relaxed">
                      {ws.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-forest group-hover:translate-x-0.5 transition-transform">
                  <span>{isKn ? "ತೆರೆಯಿರಿ" : "Open Workspace"}</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. User Saved Attractions & Curated Secular Highlights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-forest-dark flex items-center gap-2">
            <BookmarkCheck size={18} className="text-forest" />
            <span>
              {userSavedAttractions.length > 0
                ? (isKn ? "ನಿಮ್ಮ ಉಳಿಸಿದ ತಾಣಗಳು" : "Your Saved Places")
                : (isKn ? "ಪರಿಶೀಲಿತ ನೈಸರ್ಗಿಕ ತಾಣಗಳು" : "Verified Secular Highlights")}
            </span>
          </h2>
          <Link
            href="/app/saved"
            className="text-xs font-semibold text-forest hover:text-forest-dark flex items-center gap-1"
          >
            <span>{isKn ? "ಎಲ್ಲವನ್ನೂ ನೋಡಿ" : "View All Bookmarks"}</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(userSavedAttractions.length > 0 ? userSavedAttractions.slice(0, 4) : defaultHighlights).map((attraction) => {
            const districtObj = KARNATAKA_DISTRICTS.find((d) => d.id === attraction.districtId);
            return (
              <div
                key={attraction.id}
                onClick={() => router.push("/app/explore")}
                className="group relative rounded-xl bg-white border border-charcoal/10 overflow-hidden shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-32 w-full bg-forest/10 overflow-hidden">
                    <Image
                      src={attraction.image}
                      alt={isKn ? attraction.nameKn : attraction.nameEn}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/90 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {isKn ? attraction.categoryLabelKn : attraction.categoryLabelEn}
                    </span>
                    {savedIds.includes(attraction.id) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSavedPlace(attraction.id);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-gold hover:text-rose-400 backdrop-blur-xs transition-colors"
                        title="Remove bookmark"
                      >
                        <BookmarkCheck size={14} />
                      </button>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <h4 className="text-xs font-serif font-bold text-charcoal group-hover:text-forest transition-colors truncate">
                      {isKn ? attraction.nameKn : attraction.nameEn}
                    </h4>
                    <p className="text-[11px] text-charcoal-light flex items-center gap-1">
                      <MapPin size={11} className="text-terracotta shrink-0" />
                      <span className="truncate">{districtObj ? (isKn ? districtObj.nameKn : districtObj.nameEn) : attraction.districtId}</span>
                    </p>
                  </div>
                </div>

                <div className="p-2.5 border-t border-charcoal/10 bg-ivory-warm/30 flex items-center justify-between text-[11px] font-mono text-charcoal-light">
                  <span>{attraction.entryFeeEn}</span>
                  <span className="text-forest font-semibold flex items-center gap-0.5">
                    <span>{isKn ? "ಅನ್ವೇಷಿಸಿ" : "Explore"}</span>
                    <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
