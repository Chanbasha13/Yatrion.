"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type * as LeafletType from "leaflet";
import {
  KARNATAKA_MAP_BOUNDS,
  OSM_TILE_CONFIG,
  type MapLandmark,
} from "./karnataka-map-data";
import type { ActiveRoutePoint } from "./map-route-utils";
import { Plus, Minus, RotateCcw, Route, Compass, AlertCircle } from "lucide-react";

export interface LeafletInteractiveMapProps {
  landmarks: MapLandmark[];
  selectedLandmark: MapLandmark | null;
  onSelectLandmark: (landmark: MapLandmark) => void;
  routePoints?: ActiveRoutePoint[];
  showRoute?: boolean;
  onToggleRoute?: () => void;
  isKn?: boolean;
  className?: string;
  onTileError?: () => void;
}

export function LeafletInteractiveMap({
  landmarks,
  selectedLandmark,
  onSelectLandmark,
  routePoints = [],
  showRoute = false,
  onToggleRoute,
  isKn = false,
  className = "",
  onTileError,
}: LeafletInteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletType.Map | null>(null);
  const markersGroupRef = useRef<LeafletType.LayerGroup | null>(null);
  const routeGroupRef = useRef<LeafletType.LayerGroup | null>(null);

  const [L, setL] = useState<typeof LeafletType | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [tileErrorOccurred, setTileErrorOccurred] = useState(false);

  // 1. Dynamic client-only import of Leaflet
  useEffect(() => {
    let active = true;
    import("leaflet")
      .then((leafletModule) => {
        if (active) {
          const loadedL = leafletModule.default || leafletModule;
          setL(loadedL);
        }
      })
      .catch((err) => {
        console.warn("Leaflet dynamic import failed", err);
        setTileErrorOccurred(true);
        onTileError?.();
      });

    return () => {
      active = false;
    };
  }, [onTileError]);

  // 2. Initialize Map instance once Leaflet is loaded
  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return;

    try {
      const map = L.map(containerRef.current, {
        center: [KARNATAKA_MAP_BOUNDS.center.lat, KARNATAKA_MAP_BOUNDS.center.lng],
        zoom: KARNATAKA_MAP_BOUNDS.defaultZoom,
        minZoom: OSM_TILE_CONFIG.minZoom,
        maxZoom: OSM_TILE_CONFIG.maxZoom,
        maxBounds: [
          [KARNATAKA_MAP_BOUNDS.southWest.lat - 1.5, KARNATAKA_MAP_BOUNDS.southWest.lng - 1.5],
          [KARNATAKA_MAP_BOUNDS.northEast.lat + 1.5, KARNATAKA_MAP_BOUNDS.northEast.lng + 1.5],
        ],
        maxBoundsViscosity: 0.85,
        zoomControl: false,
        attributionControl: true,
      });

      // Add OpenStreetMap Tile Layer
      const tileLayer = L.tileLayer(OSM_TILE_CONFIG.url, {
        attribution: OSM_TILE_CONFIG.attribution,
        maxZoom: OSM_TILE_CONFIG.maxZoom,
        minZoom: OSM_TILE_CONFIG.minZoom,
      });

      tileLayer.on("tileerror", () => {
        setTileErrorOccurred(true);
        onTileError?.();
      });

      tileLayer.addTo(map);

      // Create LayerGroups for pins & routes
      const markersGroup = L.layerGroup().addTo(map);
      const routeGroup = L.layerGroup().addTo(map);

      markersGroupRef.current = markersGroup;
      routeGroupRef.current = routeGroup;
      mapRef.current = map;
      requestAnimationFrame(() => {
        setIsMapReady(true);
      });
    } catch (err) {
      console.warn("Error initializing Leaflet map", err);
      requestAnimationFrame(() => {
        setTileErrorOccurred(true);
        onTileError?.();
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersGroupRef.current = null;
        routeGroupRef.current = null;
        setIsMapReady(false);
      }
    };
  }, [L, onTileError]);

  // 3. Render Landmark Markers
  useEffect(() => {
    if (!L || !mapRef.current || !markersGroupRef.current || !isMapReady) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    landmarks.forEach((lm) => {
      const isSelected = selectedLandmark?.id === lm.id;

      // Color and symbol mapping based on biome
      const biomeColors: Record<string, string> = {
        coastal: "#0284c7", // Sky blue
        rainforest: "#16a34a", // Forest green
        deccan: "#d97706", // Amber gold
        plains: "#9333ea", // Royal purple
      };
      const badgeColor = biomeColors[lm.biome] || "#1b4332";

      const pinHtml = `
        <div class="yatrion-map-pin ${isSelected ? 'selected' : ''}" style="--pin-color: ${badgeColor};">
          <div class="pin-inner">
            <span class="pin-dot"></span>
          </div>
          ${isSelected ? '<div class="pin-pulse"></div>' : ''}
          <div class="pin-label">${isKn ? lm.nameKn : lm.nameEn}</div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "yatrion-custom-div-icon",
        html: pinHtml,
        iconSize: isSelected ? [34, 34] : [26, 26],
        iconAnchor: isSelected ? [17, 34] : [13, 26],
        popupAnchor: [0, isSelected ? -36 : -28],
      });

      const marker = L.marker([lm.lat, lm.lng], { icon: customIcon });

      // Leaflet Popup with verified landmark card
      const popupHtml = `
        <div class="p-3 max-w-[220px] font-sans text-left">
          <div class="text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-1">
            ${isKn ? lm.biomeLabelKn : lm.biomeLabelEn} · ${lm.elevationMeters}m MSL
          </div>
          <div class="text-sm font-serif font-bold text-white mb-1">
            ${isKn ? lm.nameKn : lm.nameEn}
          </div>
          <div class="text-[11px] text-white/70 line-clamp-2 mb-2">
            ${isKn ? lm.summaryKn : lm.summaryEn}
          </div>
          <div class="text-[10px] text-emerald-400 font-mono">
            ${lm.lat.toFixed(4)}°N, ${lm.lng.toFixed(4)}°E
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: "yatrion-map-popup",
        closeButton: true,
      });

      marker.on("click", () => {
        onSelectLandmark(lm);
      });

      markersGroup.addLayer(marker);
    });
  }, [L, isMapReady, landmarks, selectedLandmark, isKn, onSelectLandmark]);

  // 4. Render Active Trip Route Polyline & Sequence Waypoints
  useEffect(() => {
    if (!L || !mapRef.current || !routeGroupRef.current || !isMapReady) return;

    const routeGroup = routeGroupRef.current;
    routeGroup.clearLayers();

    if (!showRoute || routePoints.length < 2) return;

    // A. Draw Polyline Connecting Trip Stops
    const latLngs: [number, number][] = routePoints.map((p) => [p.lat, p.lng]);

    // Outer glow line
    const glowLine = L.polyline(latLngs, {
      color: "#D4AF37",
      weight: 6,
      opacity: 0.35,
      lineCap: "round",
      lineJoin: "round",
    });

    // Inner dashed route line
    const coreLine = L.polyline(latLngs, {
      color: "#F59E0B",
      weight: 3,
      opacity: 0.95,
      dashArray: "6, 8",
      lineCap: "round",
      lineJoin: "round",
    });

    routeGroup.addLayer(glowLine);
    routeGroup.addLayer(coreLine);

    // B. Add Route Waypoint Markers with Day/Sequence numbers
    routePoints.forEach((point) => {
      const waypointHtml = `
        <div class="yatrion-waypoint-pin ${point.isCompleted ? 'completed' : ''}">
          <div class="waypoint-badge">
            ${point.isCompleted ? '✓' : point.stopIndex}
          </div>
        </div>
      `;

      const waypointIcon = L.divIcon({
        className: "yatrion-waypoint-div-icon",
        html: waypointHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const wpMarker = L.marker([point.lat, point.lng], {
        icon: waypointIcon,
        zIndexOffset: 500,
      });

      wpMarker.bindTooltip(
        `<b>${isKn ? point.nameKn : point.nameEn}</b> (Day ${point.dayNumber})`,
        { direction: "top", offset: [0, -14], className: "yatrion-tooltip" }
      );

      routeGroup.addLayer(wpMarker);
    });
  }, [L, isMapReady, showRoute, routePoints, isKn]);

  // 5. Smooth fly-to when selectedLandmark changes
  useEffect(() => {
    if (!mapRef.current || !selectedLandmark || !isMapReady) return;
    mapRef.current.flyTo(
      [selectedLandmark.lat, selectedLandmark.lng],
      Math.max(mapRef.current.getZoom(), 9),
      { duration: 1.2 }
    );
  }, [selectedLandmark, isMapReady]);

  // Handlers for Map Control Buttons
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleResetView = useCallback(() => {
    mapRef.current?.flyTo(
      [KARNATAKA_MAP_BOUNDS.center.lat, KARNATAKA_MAP_BOUNDS.center.lng],
      KARNATAKA_MAP_BOUNDS.defaultZoom,
      { duration: 1.0 }
    );
  }, []);

  const handleFitRoute = useCallback(() => {
    if (!L || !mapRef.current || routePoints.length === 0) return;
    const bounds = L.latLngBounds(routePoints.map((p) => [p.lat, p.lng]));
    mapRef.current.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
  }, [L, routePoints]);

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-[#081510] ${className}`}>
      {/* Map DOM Target */}
      <div
        ref={containerRef}
        className="yatrion-map-container w-full h-full min-h-[460px] md:min-h-[580px] z-0 focus:outline-none"
        tabIndex={0}
        aria-label="Interactive Geographic Map of Karnataka"
      />

      {/* Loading Skeleton / Initial Overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#081510] text-white/80 z-20 space-y-3">
          <Compass className="w-8 h-8 text-amber-400 animate-spin" />
          <span className="text-xs font-mono text-white/70">
            {isKn ? "ನಕ್ಷೆಯ ಡೇಟಾವನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." : "Loading OpenStreetMap tiles..."}
          </span>
        </div>
      )}

      {/* Fallback Warning if Tiles Fail */}
      {tileErrorOccurred && (
        <div className="absolute top-4 left-4 right-4 md:right-auto z-30 flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs backdrop-blur-md">
          <AlertCircle size={15} className="shrink-0 text-amber-400" />
          <span>
            {isKn
              ? "ನೆಟ್‌ವರ್ಕ್ ಮಿತಿ: ವೆಕ್ಟರ್ ನಕ್ಷೆ ಮೋಡ್ ಲಭ್ಯವಿದೆ"
              : "Tile provider limited: Cached vector markers active"}
          </span>
        </div>
      )}

      {/* Floating Map Custom Control Buttons */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        {/* Zoom Controls */}
        <div className="flex flex-col rounded-xl overflow-hidden bg-[#0d261c]/90 border border-white/15 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2.5 text-white/80 hover:text-amber-400 hover:bg-white/10 transition-colors border-b border-white/10"
            title={isKn ? "ಹತ್ತಿರ ನೋಡಿ" : "Zoom in"}
            aria-label="Zoom in"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2.5 text-white/80 hover:text-amber-400 hover:bg-white/10 transition-colors"
            title={isKn ? "ದೂರ ನೋಡಿ" : "Zoom out"}
            aria-label="Zoom out"
          >
            <Minus size={16} />
          </button>
        </div>

        {/* Reset State View */}
        <button
          type="button"
          onClick={handleResetView}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0d261c]/90 border border-white/15 text-white/80 hover:text-amber-300 hover:bg-white/10 transition-colors shadow-xl backdrop-blur-md text-xs font-medium"
          title={isKn ? "ಕರ್ನಾಟಕ ಸಮಗ್ರ ನೋಟಕ್ಕೆ ಮರುಹೊಂದಿಸಿ" : "Reset Karnataka View"}
        >
          <RotateCcw size={13} className="text-amber-400" />
          <span className="hidden sm:inline">{isKn ? "ಮರುಹೊಂದಿಸಿ" : "State View"}</span>
        </button>

        {/* Route Polyline Toggle & Fit */}
        {routePoints.length >= 2 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleRoute}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all shadow-xl backdrop-blur-md text-xs font-medium ${
                showRoute
                  ? "bg-amber-400 text-forest-dark border-amber-300 font-semibold"
                  : "bg-[#0d261c]/90 border-white/15 text-white/80 hover:text-amber-300 hover:bg-white/10"
              }`}
              title={isKn ? "ಪ್ರವಾಸ ಮಾರ್ಗವನ್ನು ತೋರಿಸಿ/ಮರೆಮಾಡಿ" : "Toggle active trip route"}
            >
              <Route size={13} />
              <span>{isKn ? "ಪ್ರವಾಸ ಮಾರ್ಗ" : "Trip Route"}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
                {routePoints.length}
              </span>
            </button>

            {showRoute && (
              <button
                type="button"
                onClick={handleFitRoute}
                className="px-2.5 py-2 rounded-xl bg-[#0d261c]/90 border border-white/15 text-white/80 hover:text-amber-300 hover:bg-white/10 text-xs shadow-xl backdrop-blur-md font-mono"
                title={isKn ? "ಮಾರ್ಗಕ್ಕೆ ಹೊಂದಿಸಿ" : "Fit route bounds"}
              >
                Fit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Legend Badge at bottom-left */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-black/70 border border-white/10 text-[11px] text-white/70 backdrop-blur-md">
        <span className="font-semibold text-white/90">Legend:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Rainforest</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
          <span>Coast</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>Granite</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
          <span>Plains</span>
        </span>
      </div>
    </div>
  );
}
