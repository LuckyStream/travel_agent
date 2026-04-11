import type { ItineraryGeneratePayload } from "@/components/itinerary/ItineraryForm";
import type { ItineraryDay, ItineraryStop } from "@/types/itinerary-ui";

/** Map UI travel-style tags to backend interest slugs (see main app `InterestTag`). */
const TAG_TO_INTERESTS: Record<string, string[]> = {
  "Culture & History": ["history"],
  "Food & Wine": ["food"],
  "Nature & Hiking": ["nature", "adventure"],
  "Beach & Relaxation": ["relaxation"],
  Nightlife: ["nightlife"],
  Shopping: ["shopping"],
  "Adventure Sports": ["adventure"],
  Photography: ["art"],
  "Budget-Friendly": [],
  Luxury: [],
  "Family-Friendly": [],
  "Off the Beaten Path": ["nature"],
};

function mapStyleTagsToInterests(tags: string[]): string[] {
  const set = new Set<string>();
  for (const t of tags) {
    for (const i of TAG_TO_INTERESTS[t] ?? []) set.add(i);
  }
  const out = [...set];
  return out.length ? out : ["food", "history"];
}

const SLOT_ORDER = [
  "morning_destination",
  "lunch",
  "afternoon_destination",
  "dinner",
  "evening_activity",
] as const;

function slotOrderIndex(slot: string): number {
  const i = (SLOT_ORDER as readonly string[]).indexOf(slot);
  return i === -1 ? 99 : i;
}

function formatSlotLabel(slot: string): string {
  const map: Record<string, string> = {
    morning_destination: "Morning destination",
    lunch: "Lunch",
    afternoon_destination: "Afternoon destination",
    dinner: "Dinner",
    evening_activity: "Evening activity",
  };
  return map[slot] ?? slot.replace(/_/g, " ");
}

function categoryFromSlot(slot: string): string {
  if (slot === "lunch" || slot === "dinner") return "dining";
  if (slot === "evening_activity") return "nightlife";
  return "sightseeing";
}

const MORNING_TIMES: Record<string, string> = {
  early_bird: "8:00 AM",
  normal: "10:00 AM",
  late_riser: "11:30 AM",
};

function timeForSlot(slot: string, morningPreference: string): string {
  const morning = MORNING_TIMES[morningPreference] ?? "10:00 AM";
  const table: Record<string, string> = {
    morning_destination: morning,
    lunch: "12:30 PM",
    afternoon_destination: "2:30 PM",
    dinner: "7:00 PM",
    evening_activity: "9:00 PM",
  };
  return table[slot] ?? "—";
}

export type ApiItineraryItem = {
  id: string;
  day: number;
  timeSlot: string;
  name: string;
  description: string;
  address?: string | null;
};

export function itemsToItineraryDays(
  items: ApiItineraryItem[],
  morningPreference: string
): ItineraryDay[] {
  const byDay = new Map<number, ApiItineraryItem[]>();
  for (const it of items) {
    const list = byDay.get(it.day) ?? [];
    list.push(it);
    byDay.set(it.day, list);
  }

  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([dayNum, dayItems]) => {
      dayItems.sort((a, b) => slotOrderIndex(a.timeSlot) - slotOrderIndex(b.timeSlot));
      const stops: ItineraryStop[] = dayItems.map((it) => ({
        time: timeForSlot(it.timeSlot, morningPreference),
        slot: formatSlotLabel(it.timeSlot),
        name: it.name,
        description: it.description,
        duration: "~2–3 hrs",
        category: categoryFromSlot(it.timeSlot),
        tip: it.address?.trim() ? `📍 ${it.address.trim()}` : undefined,
      }));
      return {
        day: dayNum,
        title: `Day ${dayNum}`,
        stops,
      };
    });
}

export function buildGeneratePlanBody(payload: ItineraryGeneratePayload): Record<string, unknown> {
  const interests = mapStyleTagsToInterests(payload.preferences);
  const flexibleForMonth = payload.tripDate === null;

  return {
    destination: payload.destination,
    tripDays: payload.days,
    budget: "medium",
    hotelStyles: [],
    interests,
    dining: ["local cuisine"],
    priorityOrder: ["sightseeing", "food", "shopping", "relaxation"],
    flexibleDates: flexibleForMonth,
    travelCompanion: payload.travelCompanion,
    travelPace: payload.travelPace,
    morningPreference: payload.morningPreference,
    tripDate: payload.tripDate,
  };
}

export function getGeneratePlanUrl(): string {
  const base = (import.meta.env.VITE_TRAVEL_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
  return `${base}/api/generate-plan`;
}
