"use client";

import React, { useState } from "react";
import {
  CloudSun,
  Wind,
  Droplets,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  ProviderResult,
  DestinationWeatherData,
  DestinationDisruptionData,
  DataFreshness,
} from "@/lib/adaptive/providers/provider-types";
import { useLanguage } from "@/lib/i18n";

interface TripConditionOverviewProps {
  weatherResults: Record<string, ProviderResult<DestinationWeatherData>>;
  disruptionResults?: ProviderResult<DestinationDisruptionData>[];
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
}

export function TripConditionOverview({
  weatherResults,
  disruptionResults = [],
  onRefresh,
  isRefreshing = false,
}: TripConditionOverviewProps) {
  const { isKn } = useLanguage();
  const [expandedForecasts, setExpandedForecasts] = useState<Record<string, boolean>>({});

  const toggleForecast = (destId: string) => {
    setExpandedForecasts((prev) => ({
      ...prev,
      [destId]: !prev[destId],
    }));
  };

  const renderFreshnessBadge = (freshness: DataFreshness) => {
    switch (freshness.state) {
      case "fresh":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            {isKn ? "ತಾಜಾ (ಪರಿಶೀಲಿಸಲಾಗಿದೆ)" : "Fresh (Verified)"}
          </span>
        );
      case "aging":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            {isKn ? "ಹಳೆಯದಾಗುತ್ತಿದೆ" : "Aging"}
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
            {isKn ? "ಅವಧಿ ಮುಗಿದಿದೆ" : "Expired"}
          </span>
        );
      case "unavailable":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            {isKn ? "ಲಭ್ಯವಿಲ್ಲ" : "Unavailable"}
          </span>
        );
      case "invalid":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
            {isKn ? "ಅಮಾನ್ಯ ಮಾಹಿತಿ" : "Invalid"}
          </span>
        );
    }
  };

  const weatherEntries = Object.entries(weatherResults);

  // Extract all alerts from disruption results
  const allAlerts = disruptionResults.flatMap((res) => res.data?.alerts || []);

  return (
    <div className="space-y-6">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-forest-dark flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-forest" />
            <span>
              {isKn
                ? "ನೈಜ ಪರಿಸರ & ಹವಾಮಾನ ಸ್ಥಿತಿಗಳು"
                : "Live Environmental & Weather Telemetry"}
            </span>
          </h3>
          <p className="text-xs text-charcoal-muted mt-0.5">
            {isKn
              ? "ಕರ್ನಾಟಕದ ತಾಣಗಳಿಗೆ ನೇರ ಹವಾಮಾನ ವೀಕ್ಷಣೆ ಮತ್ತು ಅಧಿಕೃತ ಸಂಚಾರ ವರದಿಗಳು"
              : "Authentic keyless telemetry and verified road advisories for your route"}
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sand-light hover:bg-sand text-charcoal border border-border shadow-xs transition-all disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-forest" : ""}`}
          />
          <span>
            {isRefreshing
              ? isKn
                ? "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ..."
                : "Updating..."
              : isKn
              ? "ಮಾಹಿತಿ ನವೀಕರಿಸಿ"
              : "Refresh Telemetry"}
          </span>
        </button>
      </div>

      {/* ── Destination Weather Cards Grid ── */}
      {weatherEntries.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-border bg-white text-center text-xs text-charcoal-muted">
          {isKn
            ? "ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ."
            : "No weather telemetry available for current destinations."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weatherEntries.map(([destId, res]) => {
            const obs = res.data?.current;
            const forecastDays = res.data?.dailyForecast || [];
            const isForecastOpen = expandedForecasts[destId];

            return (
              <div
                key={destId}
                className="rounded-2xl border border-border/80 bg-white shadow-subtle p-4 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Destination & Freshness */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
                    <span className="text-sm font-bold capitalize text-forest-dark">
                      {res.data?.destinationName || destId}
                    </span>
                    {renderFreshnessBadge(res.freshness)}
                  </div>

                  {/* Atmospheric Metrics */}
                  {obs ? (
                    <div className="py-3 space-y-2.5">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-extrabold text-charcoal">
                            {Math.round(obs.temperatureC)}°C
                          </span>
                          <span className="text-xs text-charcoal-muted">
                            ({isKn ? "ಅನುಭವ" : "Feels"} {Math.round(obs.apparentTemperatureC)}°C)
                          </span>
                        </div>
                        <span className="text-xs font-medium text-forest bg-forest/5 px-2 py-0.5 rounded-md">
                          {isKn ? obs.weatherDescriptionKn : obs.weatherDescriptionEn}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center">
                        <div className="p-1.5 rounded-lg bg-sand-light/50">
                          <div className="flex items-center justify-center gap-1 text-[11px] text-charcoal-muted">
                            <Droplets className="w-3 h-3 text-sky-500" />
                            <span>{isKn ? "ತೇವಾಂಶ" : "Humidity"}</span>
                          </div>
                          <span className="text-xs font-bold text-charcoal mt-0.5 block">
                            {obs.relativeHumidityPercent !== undefined
                              ? `${obs.relativeHumidityPercent}%`
                              : "—"}
                          </span>
                        </div>

                        <div className="p-1.5 rounded-lg bg-sand-light/50">
                          <div className="flex items-center justify-center gap-1 text-[11px] text-charcoal-muted">
                            <Wind className="w-3 h-3 text-teal-600" />
                            <span>{isKn ? "ಗಾಳಿ" : "Wind"}</span>
                          </div>
                          <span className="text-xs font-bold text-charcoal mt-0.5 block">
                            {obs.windSpeedKmh} km/h
                          </span>
                        </div>

                        <div className="p-1.5 rounded-lg bg-sand-light/50">
                          <div className="flex items-center justify-center gap-1 text-[11px] text-charcoal-muted">
                            <CloudSun className="w-3 h-3 text-amber-500" />
                            <span>{isKn ? "ಮಳೆ" : "Rain"}</span>
                          </div>
                          <span className="text-xs font-bold text-charcoal mt-0.5 block">
                            {obs.precipitationMm} mm
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-charcoal-muted">
                      {isKn
                        ? "ನೈಜ ವೀಕ್ಷಣಾ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ."
                        : "Observation telemetry unavailable."}
                    </div>
                  )}

                  {/* Multi-Day Forecast Expansion */}
                  {forecastDays.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => toggleForecast(destId)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-forest hover:text-forest-dark py-1 cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {isKn
                            ? "3-ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ"
                            : "3-Day Weather Forecast"}
                        </span>
                        {isForecastOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isForecastOpen && (
                        <div className="mt-2 space-y-1.5 bg-sand-light/40 p-2.5 rounded-xl border border-border/50 animate-fade-in text-xs">
                          {forecastDays.map((period, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-center justify-between py-1 border-b last:border-b-0 border-border/30 text-[11px]"
                            >
                              <span className="font-medium text-charcoal">
                                {period.date}
                              </span>
                              <span className="text-charcoal-muted">
                                {isKn ? period.weatherDescriptionKn : period.weatherDescriptionEn}
                              </span>
                              <span className="font-semibold text-charcoal">
                                {period.tempMinC}° – {period.tempMaxC}°C
                              </span>
                            </div>
                          ))}
                          <p className="text-[10px] text-charcoal-muted italic pt-1">
                            {isKn
                              ? "ಮುನ್ಸೂಚನೆಯಲ್ಲಿ ನೈಸರ್ಗಿಕ ವ್ಯತ್ಯಾಸಗಳಿರಬಹುದು."
                              : "Probabilistic forecast with natural meteorological variance."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Attribution */}
                <div className="mt-3 pt-2 border-t border-border/40 text-[10px] text-charcoal-muted flex items-center justify-between">
                  <span>Open-Meteo (CC BY 4.0)</span>
                  <span>
                    {res.status === "operational" ? (isKn ? "ಪರಿಶೀಲಿತ" : "Verified") : res.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Verified Disruption Bulletins ── */}
      <div className="p-4 rounded-2xl border border-border/80 bg-white shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-bold text-forest-dark flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>
              {isKn
                ? "ಪರಿಶೀಲಿತ ಕರ್ನಾಟಕ ಸಂಚಾರ & ಅಡಚಣೆ ಮಾಹಿತಿ"
                : "Verified Karnataka Travel Disruption Feeds"}
            </span>
          </h4>
          <span className="text-[10px] text-charcoal-muted">
            {isKn
              ? "ಅಧಿಕೃತ ಗೆಜೆಟ್ & ವಿಕೋಪ ನಿರ್ವಹಣಾ ವರದಿಗಳು"
              : "State Disaster Management & Gazette Bulletins"}
          </span>
        </div>

        {allAlerts.length > 0 ? (
          <div className="space-y-2">
            {allAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl border border-rose-200 bg-rose-50/60 flex items-start gap-2.5 text-xs text-rose-950"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">
                      {isKn ? alert.titleKn : alert.titleEn}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-rose-200 text-rose-900">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-900">
                    {isKn ? alert.descriptionKn : alert.descriptionEn}
                  </p>
                  <p className="text-[10px] text-rose-700 italic">
                    {isKn ? "ಮೂಲ:" : "Source:"} {alert.officialSource} (
                    {alert.effectiveFrom})
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs">
              {isKn
                ? "ಯಾವುದೇ ಅಧಿಕೃತ ರಸ್ತೆ ಅಥವಾ ಸಂಚಾರ ಅಡಚಣೆಗಳು ವರದಿಯಾಗಿಲ್ಲ. ನಿಮ್ಮ ಪ್ರವಾಸ ಮಾರ್ಗ ಸುಗಮವಾಗಿದೆ."
                : "No active verified road closures or disruptions reported for your selected route. Always confirm locally."}
            </span>
          </div>
        )}

        <p className="text-[10px] text-charcoal-muted italic">
          {isKn
            ? "ಗಮನಿಸಿ: ಅಧಿಕೃತ ಪರಿಶೀಲಿತ ಬುಲೆಟಿನ್‌ಗಳನ್ನು ಮಾತ್ರ ವರದಿ ಮಾಡಲಾಗುತ್ತದೆ. ಯಾವುದೇ ಕಾಲ್ಪನಿಕ ಘಟನೆಗಳನ್ನು ಸೃಷ್ಟಿಸಲಾಗುವುದಿಲ್ಲ."
            : "Notice: Only verified official bulletins are shown. Zero synthetic or simulated incidents are manufactured."}
        </p>
      </div>
    </div>
  );
}
