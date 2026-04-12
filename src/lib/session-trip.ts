import type { ItineraryItem, TripPreferences } from "./types";

export const TRIP_STORAGE_KEY = "wanderlust-trip";

export type StoredTrip = {
  preferences: TripPreferences;
  items: ItineraryItem[];
};

export function saveTrip(data: StoredTrip): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(data));
}

export function loadTrip(): StoredTrip | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(TRIP_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredTrip;
  } catch {
    return null;
  }
}

export function updateTripItems(items: ItineraryItem[]): void {
  const cur = loadTrip();
  if (!cur) return;
  saveTrip({ ...cur, items });
}

export function updateTripPreferences(preferences: TripPreferences): void {
  const cur = loadTrip();
  if (!cur) return;
  saveTrip({ ...cur, preferences });
}
