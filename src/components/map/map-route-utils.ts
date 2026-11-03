import { loadTripFromStorage, type StoredTripState } from "@/lib/trip-storage";
import { REAL_MAP_LANDMARKS } from "./karnataka-map-data";

export interface ActiveRoutePoint {
  lat: number;
  lng: number;
  nameEn: string;
  nameKn: string;
  dayNumber: number;
  stopIndex: number;
  isCompleted: boolean;
  destinationId: string;
}

// Hub fallback coordinates in Karnataka
const HUB_COORDINATES: Record<string, { lat: number; lng: number; nameEn: string; nameKn: string }> = {
  bengaluru: { lat: 12.9716, lng: 77.5946, nameEn: "Bengaluru", nameKn: "ಬೆಂಗಳೂರು" },
  mysuru: { lat: 12.3051, lng: 76.6551, nameEn: "Mysuru", nameKn: "ಮೈಸೂರು" },
  hampi: { lat: 15.335, lng: 76.46, nameEn: "Hampi", nameKn: "ಹಂಪಿ" },
  coorg: { lat: 12.4244, lng: 75.7382, nameEn: "Coorg (Kodagu)", nameKn: "ಕೊಡಗು" },
  gokarna: { lat: 14.5479, lng: 74.3188, nameEn: "Gokarna", nameKn: "ಗೋಕರ್ಣ" },
  chikmagalur: { lat: 13.3161, lng: 75.772, nameEn: "Chikkamagaluru", nameKn: "ಚಿಕ್ಕಮಗಳೂರು" },
  bandipur: { lat: 11.6664, lng: 76.6291, nameEn: "Bandipur", nameKn: "ಬಂಡೀಪುರ" },
  badami: { lat: 15.9187, lng: 75.6766, nameEn: "Badami", nameKn: "ಬಾದಾಮಿ" },
  belur: { lat: 13.1623, lng: 75.8643, nameEn: "Belur", nameKn: "ಬೇಲೂರು" },
  udupi: { lat: 13.3409, lng: 74.7421, nameEn: "Udupi", nameKn: "ಉಡುಪಿ" },
  jogfalls: { lat: 14.2285, lng: 74.8124, nameEn: "Jog Falls", nameKn: "ಜೋಗ ಜಲಪಾತ" },
  dandeli: { lat: 15.2361, lng: 74.6173, nameEn: "Dandeli", nameKn: "ದಾಂಡೇಲಿ" },
};

/**
 * Extracts active itinerary stops and coordinates from current trip state.
 */
export function getActiveTripRoutePoints(tripState?: StoredTripState | null): ActiveRoutePoint[] {
  const activeTrip = tripState ?? (typeof window !== "undefined" ? loadTripFromStorage() : null);
  if (!activeTrip || !activeTrip.editedDays || activeTrip.editedDays.length === 0) {
    return [];
  }

  const completedKeys = new Set(activeTrip.completedStopKeys || []);
  const points: ActiveRoutePoint[] = [];
  let stopSequence = 1;

  for (const day of activeTrip.editedDays) {
    for (const stop of day.stops || []) {
      const destId = (stop.destinationId || "").toLowerCase();
      
      // 1. Try matching with REAL_MAP_LANDMARKS
      const matchedLandmark = REAL_MAP_LANDMARKS.find(
        (l) => l.hubId === destId || l.id === destId || l.districtEn.toLowerCase() === destId
      );

      // 2. Try matching with HUB_COORDINATES
      const matchedHub = HUB_COORDINATES[destId];

      const lat = matchedLandmark?.lat ?? matchedHub?.lat;
      const lng = matchedLandmark?.lng ?? matchedHub?.lng;

      if (typeof lat === "number" && typeof lng === "number") {
        const stopKey = `${day.dayNumber}-${stop.timeOfDay}`;
        points.push({
          lat,
          lng,
          nameEn: stop.title || stop.destinationName || matchedLandmark?.nameEn || matchedHub?.nameEn || destId,
          nameKn: stop.destinationKannada || matchedLandmark?.nameKn || matchedHub?.nameKn || destId,
          dayNumber: day.dayNumber,
          stopIndex: stopSequence++,
          isCompleted: completedKeys.has(stopKey),
          destinationId: destId,
        });
      }
    }
  }

  return points;
}

/**
 * Calculates a bounding box encompassing a list of lat/lng points.
 */
export function calculateLatLngBounds(points: { lat: number; lng: number }[]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} | null {
  if (points.length === 0) return null;

  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;

  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }

  return { minLat, maxLat, minLng, maxLng };
}

