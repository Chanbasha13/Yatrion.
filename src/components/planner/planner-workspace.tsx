"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Route, 
  Coins, 
  Activity, 
  RotateCcw, 
  Compass
} from "lucide-react";
import { SmartTripPlanner } from "./smart-trip-planner";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import { loadUserTrip, clearUserTrip, type StoredTripState } from "@/lib/storage/user-trip-service";

export function PlannerWorkspace() {
  const { user } = useAuth();
  const { isKn } = useLanguage();
  const [activeTrip, setActiveTrip] = useState<StoredTripState | null>(() =>
    loadUserTrip(user?.id, user?.isDemo)
  );

  const handleResetTrip = () => {
    if (confirm(isKn ? "ನೀವು ನಿಜವಾಗಿಯೂ ಈ ಪ್ರವಾಸವನ್ನು ಮರುಹೊಂದಿಸಲು ಬಯಸುವಿರಾ?" : "Reset this journey to start a new plan?")) {
      clearUserTrip(user?.id, user?.isDemo);
      setActiveTrip(null);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      {/* Workspace Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-mono font-bold flex items-center gap-1.5">
              <Compass size={13} />
              <span>Workspace • Smart Itinerary Engine</span>
            </span>
            {user?.isDemo && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 text-[11px] font-mono font-semibold border border-amber-500/20">
                Demo Traveler Mode
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            {isKn ? "ಸ್ಮಾರ್ಟ್ ಪ್ರವಾಸ ಪ್ಲಾನರ್" : "Smart Trip Planner"}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            {isKn
              ? "ಕರ್ನಾಟಕದ ಗಮ್ಯಸ್ಥಾನಗಳು, ವಾಹನ, ಬಜೆಟ್ ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ ನಿಮ್ಮ ಬಹುದಿನಗಳ ಪ್ರವಾಸವನ್ನು ನಿರ್ಮಿಸಿ."
              : "Generate mathematically optimized daily itineraries tailored to your pace, vehicle class, and group accessibility."}
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center gap-2.5">
          {activeTrip && (
            <button
              type="button"
              onClick={handleResetTrip}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-mono font-medium text-charcoal-light hover:text-terracotta hover:bg-terracotta/5 transition-colors"
            >
              <RotateCcw size={13} />
              <span>{isKn ? "ಹೊಸ ಯೋಜನೆ" : "Reset Plan"}</span>
            </button>
          )}

          <Link
            href="/app/routes"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest/10 text-forest hover:bg-forest/20 text-xs font-semibold transition-colors"
          >
            <Route size={14} />
            <span>{isKn ? "ಮಾರ್ಗ" : "Routes"}</span>
          </Link>

          <Link
            href="/app/budget"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest/10 text-forest hover:bg-forest/20 text-xs font-semibold transition-colors"
          >
            <Coins size={14} />
            <span>{isKn ? "ಬಜೆಟ್" : "Budget"}</span>
          </Link>

          <Link
            href="/app/adaptive"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-subtle"
          >
            <Activity size={14} />
            <span>{isKn ? "ಹವಾಮಾನ & ನವೀಕರಣ" : "Adaptive"}</span>
          </Link>
        </div>
      </div>

      {/* Main Trip Planner Engine */}
      <div className="bg-white rounded-2xl border border-border/80 shadow-subtle overflow-hidden">
        <SmartTripPlanner />
      </div>
    </div>
  );
}
