"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Route, 
  Compass, 
  Clock
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import { loadUserTrip, saveUserTrip, type StoredTripState } from "@/lib/storage/user-trip-service";
import { optimizeKarnatakaRoute } from "@/lib/routes/route-optimizer";
import { RouteOverview } from "@/components/routes/route-overview";
import { DailyRouteTimeline } from "@/components/routes/daily-route-timeline";
import { getActiveTripRoutePoints } from "@/components/map/map-route-utils";
import { REAL_MAP_LANDMARKS, type MapLandmark } from "@/components/map/karnataka-map-data";
import { cn } from "@/lib/utils";

const LeafletInteractiveMap = dynamic(
  () =>
    import("@/components/map/leaflet-interactive-map").then(
      (mod) => mod.LeafletInteractiveMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-xl bg-[#081510] border border-border flex items-center justify-center text-white/70">
        <Compass className="w-6 h-6 animate-spin text-amber-400 mr-2" />
        <span className="text-xs font-mono">Loading Real Geographic Route Map...</span>
      </div>
    ),
  }
);

export function RoutesWorkspace() {
  const { user } = useAuth();
  const { isKn } = useLanguage();

  const [tripState, setTripState] = useState<StoredTripState | null>(() =>
    loadUserTrip(user?.id, user?.isDemo)
  );

  // Cross-workspace trip state synchronization
  useEffect(() => {
    const handleUpdate = () => {
      setTripState(loadUserTrip(user?.id, user?.isDemo));
    };
    window.addEventListener("yatrion:trip-updated", handleUpdate);
    return () => window.removeEventListener("yatrion:trip-updated", handleUpdate);
  }, [user?.id, user?.isDemo]);

  // Compute or load optimized route
  const routePlan = useMemo(() => {
    if (!tripState) return null;
    if (tripState.optimizedRoute) return tripState.optimizedRoute;

    // Deterministically generate route plan from trip state
    const destIds = tripState.preferences.selectedDestinationIds?.length
      ? tripState.preferences.selectedDestinationIds
      : tripState.editedDays.map((d) => d.destinationId);

    return optimizeKarnatakaRoute({
      destinationIds: destIds,
      durationDays: tripState.preferences.durationDays,
      startingLocation: tripState.preferences.startingLocation,
      budget: tripState.preferences.budget,
      interests: tripState.preferences.interests,
      travelStyle: tripState.preferences.travelStyle,
      transport: tripState.preferences.transport,
      travellerCount: tripState.preferences.travellerCount,
    });
  }, [tripState]);

  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);
  const [selectedMapLandmark, setSelectedMapLandmark] = useState<MapLandmark | null>(
    REAL_MAP_LANDMARKS[0]
  );

  const routePoints = useMemo(() => {
    return getActiveTripRoutePoints(tripState);
  }, [tripState]);

  // Stop manipulation handlers
  const handleToggleCompleted = (key: string) => {
    if (!tripState) return;
    const isCompleted = tripState.completedStopKeys.includes(key);
    const updatedKeys = isCompleted
      ? tripState.completedStopKeys.filter((k) => k !== key)
      : [...tripState.completedStopKeys, key];

    const updated = { ...tripState, completedStopKeys: updatedKeys };
    setTripState(updated);
    saveUserTrip(user?.id, user?.isDemo, updated);
  };

  const handleSaveStopNote = (key: string, note: string) => {
    if (!tripState) return;
    const updated = {
      ...tripState,
      stopNotes: { ...tripState.stopNotes, [key]: note },
    };
    setTripState(updated);
    saveUserTrip(user?.id, user?.isDemo, updated);
  };

  const handleRegenerateRoute = () => {
    if (!tripState) return;
    const destIds = tripState.preferences.selectedDestinationIds?.length
      ? tripState.preferences.selectedDestinationIds
      : tripState.editedDays.map((d) => d.destinationId);

    const recomputed = optimizeKarnatakaRoute({
      destinationIds: destIds,
      durationDays: tripState.preferences.durationDays,
      startingLocation: tripState.preferences.startingLocation,
      budget: tripState.preferences.budget,
      interests: tripState.preferences.interests,
      travelStyle: tripState.preferences.travelStyle,
      transport: tripState.preferences.transport,
      travellerCount: tripState.preferences.travellerCount,
    });

    const updated = { ...tripState, optimizedRoute: recomputed };
    setTripState(updated);
    saveUserTrip(user?.id, user?.isDemo, updated);
  };

  if (!tripState || !routePlan) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-forest/10 border border-forest/20 text-forest flex items-center justify-center mx-auto">
          <Route size={28} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-charcoal">
          {isKn ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಪ್ರವಾಸವಿಲ್ಲ" : "No Active Journey to Route"}
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed">
          {isKn
            ? "ಮಾರ್ಗ ಆಪ್ಟಿಮೈಸೇಶನ್ ವೀಕ್ಷಿಸಲು ಮೊದಲು ಸ್ಮಾರ್ಟ್ ಪ್ರವಾಸ ಪ್ಲಾನರ್‌ನಲ್ಲಿ ಹೊಸ ಪ್ರವಾಸವನ್ನು ರಚಿಸಿ."
            : "Generate an itinerary in the Smart Trip Planner first to calculate topographic route sequences and ghat road transit factors."}
        </p>
        <div className="pt-2">
          <Link
            href="/app/planner"
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-xs font-bold text-white hover:bg-forest-dark transition-all shadow-subtle"
          >
            <Compass size={15} />
            <span>{isKn ? "ಪ್ಲಾನರ್‌ಗೆ ಹೋಗಿ" : "Open Trip Planner"}</span>
          </Link>
        </div>
      </div>
    );
  }

  const activeDailyRoute = routePlan.dailyRoutes[activeDayIdx] || routePlan.dailyRoutes[0];

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-mono font-bold flex items-center gap-1.5">
              <Route size={13} />
              <span>Workspace • Topographic Route Engine</span>
            </span>
            <span className="text-xs text-charcoal-light font-mono">• Zero Backtracking</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            {isKn ? "ಮಾರ್ಗ ಆಪ್ಟಿಮೈಸೇಶನ್ ಕಾರ್ಯಸ್ಥಳ" : "Route Optimization Workspace"}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            {isKn
              ? "ಘಾಟಿ ರಸ್ತೆಗಳ ತಿರುವು ಗುಣಕ (1.35x-1.55x) ಮತ್ತು ಸೂರ್ಯಾಸ್ತದ ಸುರಕ್ಷತಾ ಮಿತಿಗಳನ್ನು ಆಧರಿಸಿದ ನಿಖರ ಮಾರ್ಗ ವಿನ್ಯಾಸ."
              : "Sequences daily attractions geographically to eradicate backtracking with Western Ghats curvature speed calibration."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/budget"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest/10 text-forest hover:bg-forest/20 text-xs font-semibold transition-colors"
          >
            <span>{isKn ? "ಬಜೆಟ್ ವೀಕ್ಷಿಸಿ" : "View Budget"}</span>
          </Link>
          <Link
            href="/app/adaptive"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-subtle"
          >
            <span>{isKn ? "ಹವಾಮಾನ ಸ್ಥಿತಿ" : "Live Telemetry"}</span>
          </Link>
        </div>
      </div>

      {/* Route Overview Component */}
      <RouteOverview
        routePlan={routePlan}
        onRegenerateRoute={handleRegenerateRoute}
      />

      {/* Interactive Geographic Route Map */}
      {routePoints.length >= 2 && (
        <div className="rounded-2xl border border-border bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                <Route size={18} className="text-forest" />
                <span>{isKn ? "ನೈಜ ಭೌಗೋಳಿಕ ಮಾರ್ಗ ನಕ್ಷೆ" : "Geographic Journey Cartography"}</span>
              </h3>
              <p className="text-xs text-charcoal-light">
                {isKn
                  ? "ಓಪನ್‌ಸ್ಟ್ರೀಟ್‌ಮ್ಯಾಪ್ ಆಧಾರಿತ ಮಾರ್ಗ ವಿವರ ಮತ್ತು ನಿಲ್ದಾಣಗಳ ಸರಣಿ."
                  : "Live OpenStreetMap polyline connecting your sequential daily stops and verified landmarks."}
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-forest/10 text-forest font-semibold self-start sm:self-auto">
              {routePoints.length} {isKn ? "ನಿಲ್ದಾಣಗಳು" : "Sequential Stops"}
            </span>
          </div>

          <div className="h-80 sm:h-96 w-full rounded-xl overflow-hidden border border-border shadow-xs">
            <LeafletInteractiveMap
              landmarks={REAL_MAP_LANDMARKS}
              selectedLandmark={selectedMapLandmark}
              onSelectLandmark={setSelectedMapLandmark}
              routePoints={routePoints}
              showRoute={true}
              isKn={isKn}
            />
          </div>
        </div>
      )}

      {/* Day Selector Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
            <Clock size={16} className="text-forest" />
            <span>{isKn ? "ದೈನಂದಿನ ಮಾರ್ಗ ವೇಳಾಪಟ್ಟಿ" : "Daily Route Sequencing Timeline"}</span>
          </h3>
          <span className="text-xs font-mono text-charcoal-light">
            {isKn ? "ದಿನ" : "Day"} {activeDayIdx + 1} of {routePlan.dailyRoutes.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {routePlan.dailyRoutes.map((dr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveDayIdx(idx)}
              className={cn(
                "px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2",
                activeDayIdx === idx
                  ? "bg-forest text-white border-forest shadow-sm"
                  : "bg-white text-charcoal border-border hover:bg-ivory-warm hover:border-forest/30"
              )}
            >
              <span>{isKn ? `ದಿನ ${dr.dayNumber}` : `Day ${dr.dayNumber}`}</span>
              <span className={cn("text-[11px] font-mono", activeDayIdx === idx ? "text-ivory/80" : "text-charcoal-light")}>
                • {dr.destinationName}
              </span>
            </button>
          ))}
        </div>

        {/* Daily Timeline */}
        {activeDailyRoute && (
          <DailyRouteTimeline
            dailyRoute={activeDailyRoute}
            completedStopKeys={tripState.completedStopKeys}
            stopNotes={tripState.stopNotes}
            onMoveStop={() => {}}
            onRemoveStop={() => {}}
            onRestoreStop={() => {}}
            onToggleCompleted={handleToggleCompleted}
            onSaveStopNote={handleSaveStopNote}
          />
        )}
      </div>
    </div>
  );
}
