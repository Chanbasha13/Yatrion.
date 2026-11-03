"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  MapPin, 
  Download, 
  Printer, 
  RotateCcw, 
  Compass,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import { 
  loadUserTrip, 
  clearUserTrip, 
  type StoredTripState 
} from "@/lib/storage/user-trip-service";
import { formatItineraryAsText } from "@/lib/trip-export";

export function TripsWorkspace() {
  const { user } = useAuth();
  const { isKn } = useLanguage();

  const [tripState, setTripState] = useState<StoredTripState | null>(() =>
    loadUserTrip(user?.id, user?.isDemo)
  );

  const handleDownloadExport = () => {
    if (!tripState) return;
    const text = formatItineraryAsText({
      itinerary: tripState.originalItinerary,
      days: tripState.editedDays,
      dayNotes: tripState.dayNotes,
      stopNotes: tripState.stopNotes,
      completedStopKeys: tripState.completedStopKeys,
      language: isKn ? "kn" : "en",
      optimizedRoute: tripState.optimizedRoute,
      budgetPlan: tripState.budgetPlan,
      savedGemIds: tripState.savedGemIds,
    });
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yatrion-itinerary-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetTrip = () => {
    if (confirm(isKn ? "ನೀವು ನಿಜವಾಗಿಯೂ ಈ ಪ್ರವಾಸವನ್ನು ಮರುಹೊಂದಿಸಲು ಬಯಸುವಿರಾ?" : "Reset this active journey to start fresh?")) {
      clearUserTrip(user?.id, user?.isDemo);
      setTripState(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-mono font-bold flex items-center gap-1.5">
              <Briefcase size={13} />
              <span>Workspace • My Trips & Export Archive</span>
            </span>
            <span className="text-xs text-charcoal-light font-mono">• Multi-Trip Ownership</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            {isKn ? "ನನ್ನ ಪ್ರವಾಸಗಳು ಮತ್ತು ರಫ್ತು ಕೋಶ" : "My Trips & Itinerary Archive"}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            {isKn
              ? "ನಿಮ್ಮ ಸಕ್ರಿಯ ಪ್ರಯಾಣದ ವಿವರಗಳು, ಡೌನ್‌ಲೋಡ್ ಮಾಡಬಹುದಾದ ಟೆಕ್ಸ್ಟ್ ವರದಿ ಮತ್ತು ಮುದ್ರಣ ಸೌಲಭ್ಯ."
              : "Review your saved Karnataka itineraries, export plain text travel logs, and print formatted itineraries."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {tripState && (
            <>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-mono font-medium text-charcoal hover:bg-ivory-warm transition-colors"
              >
                <Printer size={14} />
                <span>{isKn ? "ಮುದ್ರಿಸಿ" : "Print"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadExport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest/10 text-forest hover:bg-forest/20 text-xs font-semibold transition-colors"
              >
                <Download size={14} />
                <span>{isKn ? "ಟೆಕ್ಸ್ಟ್ ರಫ್ತು" : "Export TXT"}</span>
              </button>
            </>
          )}

          <Link
            href="/app/planner"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-subtle"
          >
            <span>{isKn ? "ಹೊಸ ಪ್ರವಾಸ" : "New Journey"}</span>
          </Link>
        </div>
      </div>

      {/* Active Journey Card */}
      {!tripState ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-forest/10 border border-forest/20 text-forest flex items-center justify-center mx-auto">
            <Briefcase size={28} />
          </div>
          <h2 className="font-serif text-xl font-bold text-charcoal">
            {isKn ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಪ್ರವಾಸವಿಲ್ಲ" : "No Active Journey Found"}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed">
            {isKn
              ? "ಹೊಸ ಪ್ರವಾಸವನ್ನು ರಚಿಸಲು ಸ್ಮಾರ್ಟ್ ಪ್ರವಾಸ ಪ್ಲಾನರ್ ಅನ್ನು ಪ್ರಾರಂಭಿಸಿ."
              : "Launch the Smart Trip Planner to craft a multi-day itinerary across Karnataka's 31 districts."}
          </p>
          <div className="pt-2">
            <Link
              href="/app/planner"
              className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-xs font-bold text-white hover:bg-forest-dark transition-all shadow-subtle"
            >
              <Compass size={15} />
              <span>{isKn ? "ಪ್ರವಾಸ ಪ್ಲಾನರ್ ತೆರೆಯಿರಿ" : "Open Trip Planner"}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-forest/10 text-forest text-xs font-mono font-semibold">
                  {tripState.preferences.durationDays} {isKn ? "ದಿನಗಳ ಪ್ರವಾಸ" : "Days Journey"}
                </span>
                <span className="text-xs text-charcoal-light font-mono">
                  Saved: {new Date(tripState.savedAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-charcoal">
                {tripState.originalItinerary.title}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-light mt-0.5">
                {tripState.originalItinerary.kannadaSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/app/planner"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-subtle"
              >
                <span>{isKn ? "ಪ್ಲಾನರ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ" : "Open in Planner"}</span>
                <ArrowRight size={14} />
              </Link>

              <button
                type="button"
                onClick={handleResetTrip}
                className="p-2.5 rounded-xl border border-border text-charcoal-light hover:text-terracotta hover:bg-terracotta/5 transition-colors"
                title="Reset trip"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-ivory-warm/50 border border-border">
              <span className="text-[11px] font-mono text-charcoal-light uppercase block mb-1">
                {isKn ? "ಪ್ರಾರಂಭಿಕ ನಗರ" : "Starting Location"}
              </span>
              <span className="text-sm font-bold text-charcoal flex items-center gap-1">
                <MapPin size={13} className="text-forest" />
                <span>{tripState.preferences.startingLocation}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-ivory-warm/50 border border-border">
              <span className="text-[11px] font-mono text-charcoal-light uppercase block mb-1">
                {isKn ? "ಪ್ರಯಾಣಿಕರ ಸಂಖ್ಯೆ" : "Party Size"}
              </span>
              <span className="text-sm font-bold text-charcoal">
                {tripState.preferences.travellerCount} {isKn ? "ಜನರು" : "Travellers"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-ivory-warm/50 border border-border">
              <span className="text-[11px] font-mono text-charcoal-light uppercase block mb-1">
                {isKn ? "ಪೂರ್ಣಗೊಂಡ ತಾಣಗಳು" : "Completed Stops"}
              </span>
              <span className="text-sm font-bold text-forest">
                {tripState.completedStopKeys.length} / {tripState.editedDays.flatMap((d) => d.stops).length} Stops
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-ivory-warm/50 border border-border">
              <span className="text-[11px] font-mono text-charcoal-light uppercase block mb-1">
                {isKn ? "ಬಜೆಟ್ ಶ್ರೇಣಿ" : "Budget Target"}
              </span>
              <span className="text-sm font-bold text-gold-dark">
                {tripState.preferences.budget}
              </span>
            </div>
          </div>

          {/* Day By Day List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-light font-bold">
              {isKn ? "ದಿನಗಳ ಸಾರಾಂಶ" : "Daily Itinerary Breakdown"}:
            </h4>
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
              {tripState.editedDays.map((day) => (
                <div key={day.dayNumber} className="p-4 flex items-center justify-between bg-white hover:bg-ivory/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {day.dayNumber}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-charcoal block">
                        {day.theme}
                      </span>
                      <span className="text-xs text-charcoal-light">
                        {day.stops.length} {isKn ? "ನಿಲ್ದಾಣಗಳು" : "stops"} • {day.destinationName}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-forest font-semibold">
                    {day.stops.filter((s) => tripState.completedStopKeys.includes(`${day.dayNumber}-${s.timeOfDay}`)).length} / {day.stops.length} Done
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
