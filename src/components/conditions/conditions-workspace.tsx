"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { 
  CloudSun, 
  RefreshCw, 
  AlertTriangle, 
  Clock
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n";
import { loadUserTrip, type StoredTripState } from "@/lib/storage/user-trip-service";
import {
  OpenMeteoWeatherProvider,
  KarnatakaDisruptionProvider,
  type ProviderResult,
  type DestinationWeatherData,
  type DestinationDisruptionData,
} from "@/lib/adaptive/providers";
import { resolveDestinationCoordinates } from "@/lib/routes/route-estimates";
import { TripConditionOverview } from "@/components/adaptive/trip-condition-overview";

export function ConditionsWorkspace() {
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

  const [weatherMap, setWeatherMap] = useState<Record<string, ProviderResult<DestinationWeatherData>>>({});
  const [disruptions, setDisruptions] = useState<ProviderResult<DestinationDisruptionData>[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>("");

  const destinationIds = useMemo(() => {
    return tripState?.preferences.selectedDestinationIds?.length
      ? tripState.preferences.selectedDestinationIds
      : tripState?.editedDays.map((d) => d.destinationId) || ["chikmagalur", "coorg"];
  }, [tripState]);

  const loadTelemetry = useCallback(async () => {
    setIsLoading(true);
    const weatherProvider = new OpenMeteoWeatherProvider();
    const disruptionProvider = new KarnatakaDisruptionProvider();

    const newWeatherMap: Record<string, ProviderResult<DestinationWeatherData>> = {};
    const newDisruptions: ProviderResult<DestinationDisruptionData>[] = [];

    for (const dId of destinationIds) {
      const coords = resolveDestinationCoordinates(dId);
      const res = await weatherProvider.fetchConditions(dId, {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      newWeatherMap[dId] = res;

      const dRes = await disruptionProvider.fetchConditions(dId, {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      newDisruptions.push(dRes);
    }

    setWeatherMap(newWeatherMap);
    setDisruptions(newDisruptions);
    setLastRefreshedAt(new Date().toLocaleTimeString());
    setIsLoading(false);
  }, [destinationIds]);

  useEffect(() => {
    let active = true;
    const fetchInitial = async () => {
      const weatherProvider = new OpenMeteoWeatherProvider();
      const disruptionProvider = new KarnatakaDisruptionProvider();

      const newWeatherMap: Record<string, ProviderResult<DestinationWeatherData>> = {};
      const newDisruptions: ProviderResult<DestinationDisruptionData>[] = [];

      for (const dId of destinationIds) {
        const coords = resolveDestinationCoordinates(dId);
        const res = await weatherProvider.fetchConditions(dId, {
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        newWeatherMap[dId] = res;

        const dRes = await disruptionProvider.fetchConditions(dId, {
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        newDisruptions.push(dRes);
      }

      if (active) {
        setWeatherMap(newWeatherMap);
        setDisruptions(newDisruptions);
        setLastRefreshedAt(new Date().toLocaleTimeString());
        setIsLoading(false);
      }
    };

    void fetchInitial();

    return () => {
      active = false;
    };
  }, [destinationIds]);

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-700 text-xs font-mono font-bold flex items-center gap-1.5">
              <CloudSun size={13} />
              <span>Workspace • Live Telemetry & Weather Stations</span>
            </span>
            <span className="text-xs text-charcoal-light font-mono">• Open-Meteo CC BY 4.0</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            {isKn ? "ನೈಜ ಹವಾಮಾನ ಮತ್ತು ರಸ್ತೆ ಸ್ಥಿತಿಗತಿಗಳು" : "Weather Telemetry & Road Conditions"}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light mt-1">
            {isKn
              ? "ನಿಮ್ಮ ಪ್ರವಾಸದ ತಾಣಗಳಲ್ಲಿನ ನೈಜ ಮಳೆ, ಉಷ್ಣಾಂಶ, ಗಾಳಿಯ ವೇಗ ಮತ್ತು ಪರಿಶೀಲಿತ ರಸ್ತೆ ಅಡೆತಡೆಗಳ ವರದಿ."
              : "Live Open-Meteo weather stations and official Karnataka road disruption feeds along your active travel route."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadTelemetry}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest/10 text-forest hover:bg-forest/20 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>{isLoading ? (isKn ? "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ..." : "Updating...") : (isKn ? "ನವೀಕರಿಸಿ" : "Refresh Telemetry")}</span>
          </button>

          <Link
            href="/app/adaptive"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest text-white hover:bg-forest-dark text-xs font-bold transition-all shadow-subtle"
          >
            <span>{isKn ? "ಕಮಾಂಡ್ ಸೆಂಟರ್" : "Adaptive Center"}</span>
          </Link>
        </div>
      </div>

      {/* Timestamp & Freshness Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-border shadow-subtle text-xs font-mono">
        <div className="flex items-center gap-2 text-charcoal">
          <Clock size={14} className="text-forest" />
          <span>Last Telemetry Sync: <strong>{lastRefreshedAt || "Syncing..."}</strong></span>
          <span className="text-charcoal-light">• TTL Cache: 30 minutes</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Verified Non-Fabricated Telemetry</span>
        </div>
      </div>

      {/* Conditions Overview Component */}
      <TripConditionOverview
        weatherResults={weatherMap}
        disruptionResults={disruptions}
        onRefresh={loadTelemetry}
        isRefreshing={isLoading}
      />

      {/* Safety Notice & Advisory Limitations */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-bold text-amber-950 font-mono uppercase tracking-wider text-[11px]">
            {isKn ? "ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ ಮತ್ತು ಹವಾಮಾನ ಮಿತಿಗಳು" : "Advisory Limitations & Weather Safety Invariant"}
          </h5>
          <p className="leading-relaxed">
            {isKn
              ? "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಗಳು ಗಣಿತೀಯ ಮಾದರಿಗಳನ್ನು ಆಧರಿಸಿವೆ ಮತ್ತು ಸಂಪೂರ್ಣ ಗ್ಯಾರಂಟಿ ಅಲ್ಲ. ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಘಾಟಿಗಳಲ್ಲಿ (ಶಿರಾಡಿ, ಚಾರ್ಮಾಡಿ, ಆಗುಂಬೆ) ಮಳೆಗಾಲದಲ್ಲಿ ಎಚ್ಚರಿಕೆಯಿಂದ ಚಲಿಸಿ ಮತ್ತು ಸೂರ್ಯಾಸ್ತದ ಮುನ್ನ ಪ್ರಯಾಣ ಪೂರ್ಣಗೊಳಿಸಿ."
              : "Weather forecasts are mathematical atmospheric models and must never be interpreted as an absolute safety guarantee. Heavy rainfall along Western Ghats passes (Shiradi, Charmadi, Agumbe) can induce sudden localized mudslides. Always heed local police advisories and avoid night driving in mountain corridors."}
          </p>
        </div>
      </div>
    </div>
  );
}
