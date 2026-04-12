export type Budget = "low" | "medium" | "high";

export type InterestTag =
  | "nature"
  | "history"
  | "food"
  | "shopping"
  | "nightlife"
  | "art"
  | "adventure"
  | "relaxation";

export type DiningTag =
  | "local cuisine"
  | "trendy spots"
  | "vegetarian friendly"
  | "street food";

export type PriorityKey = "sightseeing" | "food" | "shopping" | "relaxation";

/** Canonical JSON keys from /api/generate-plan (snake_case). */
export type TimeSlot =
  | "morning_destination"
  | "lunch"
  | "afternoon_destination"
  | "dinner"
  | "evening_activity";

/** Display / sort order within each day. */
export const TIME_SLOT_ORDER: readonly TimeSlot[] = [
  "morning_destination",
  "lunch",
  "afternoon_destination",
  "dinner",
  "evening_activity",
] as const;

/** Sort index for a slot id (handles legacy saved trips from older versions). */
export function timeSlotOrderIndex(slot: string): number {
  const legacy: Record<string, TimeSlot> = {
    morning: "morning_destination",
    afternoon: "afternoon_destination",
    evening: "evening_activity",
  };
  const canonical = legacy[slot] ?? (slot as TimeSlot);
  const i = (TIME_SLOT_ORDER as readonly string[]).indexOf(canonical);
  return i === -1 ? 999 : i;
}

export type ItineraryItem = {
  id: string;
  day: number;
  timeSlot: TimeSlot;
  name: string;
  description: string;
  lat: number;
  lng: number;
  /** Street or vicinity line when known (Places / LLM). */
  address?: string | null;
  /** Google Place ID when resolved via Places — enables stable Maps links. */
  placeId?: string | null;
  /** Google-style 1–5 rating when sourced from verified places / LLM. */
  rating?: number | null;
  reviewCount?: number | null;
};

export type TravelCompanion = "solo" | "couple" | "family_with_kids" | "friends_group";

export type TravelPace = "relaxed" | "moderate" | "packed";

export type MorningPreference = "early_bird" | "normal" | "late_riser";

/** How the traveler moves — used to tune distance between stops and day-trip reach. */
export type TripMobility = "walking_transit" | "rental_car" | "own_car";

export type TripPreferences = {
  destination: string;
  /** Server Geocoding of `destination` — used to center the map before pins exist. */
  destinationLat?: number;
  destinationLng?: number;
  /** Number of days to plan (1–14). Omitted in older saved trips → treat as 3. */
  tripDays?: number;
  /** Optional ISO date string selected by the user for trip start. */
  startDate?: string;
  /** True when the user is open to any timing instead of a fixed start date. */
  flexibleDates?: boolean;
  budget: Budget;
  /** Optional accommodation styles chosen in the wizard. */
  hotelStyles?: string[];
  interests: InterestTag[];
  dining: DiningTag[];
  priorityOrder: PriorityKey[];
  /** Who the traveler is going with — used in the planner prompt. */
  travelCompanion?: TravelCompanion | string;
  /** How dense the daily schedule should feel. */
  travelPace?: TravelPace | string;
  /** Preferred start time for the first activity of the day. */
  morningPreference?: MorningPreference | string;
  /** Target month as YYYY-MM, or null/omitted when flexible. */
  tripDate?: string | null;
  /** Walking/transit vs car — affects how far apart same-day stops can be. */
  mobility?: TripMobility;
  /**
   * Short lines learned when the user swaps stops away (e.g. dislikes museums).
   * Merged with session-persisted hints before calling generate-plan / swap-item.
   */
  swapAvoidHints?: string[];
};

export const DEFAULT_TRIP_DAYS = 3;
export const MIN_TRIP_DAYS = 1;
export const MAX_TRIP_DAYS = 14;

export function clampTripDays(n: unknown): number {
  const x = typeof n === "number" && Number.isFinite(n) ? Math.floor(n) : DEFAULT_TRIP_DAYS;
  return Math.min(MAX_TRIP_DAYS, Math.max(MIN_TRIP_DAYS, x));
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  /** Present on assistant turns when the model locked in a destination (see /api/chat JSON). */
  confirmedDestination?: string | null;
};
