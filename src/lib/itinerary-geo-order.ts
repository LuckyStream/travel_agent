import { haversineMeters } from "@/lib/travel-time-estimate";
import type { ItineraryItem, TimeSlot } from "@/lib/types";
import { timeSlotOrderIndex } from "@/lib/types";

function numLatLng(it: ItineraryItem): { lat: number; lng: number } | null {
  const lat = typeof it.lat === "number" ? it.lat : Number.parseFloat(String(it.lat));
  const lng = typeof it.lng === "number" ? it.lng : Number.parseFloat(String(it.lng));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return null;
  return { lat, lng };
}

function sortedDayItems(dayItems: ItineraryItem[]): ItineraryItem[] {
  return [...dayItems].sort((a, b) => timeSlotOrderIndex(a.timeSlot) - timeSlotOrderIndex(b.timeSlot));
}

/** Sum of haversine legs in slot order (morning → lunch → afternoon → …). */
function dayTravelDistanceM(dayItems: ItineraryItem[]): number {
  const sorted = sortedDayItems(dayItems);
  let total = 0;
  for (let i = 1; i < sorted.length; i++) {
    const a = numLatLng(sorted[i - 1]!);
    const b = numLatLng(sorted[i]!);
    if (a && b) total += haversineMeters(a.lat, a.lng, b.lat, b.lng);
  }
  return total;
}

/**
 * If swapping **morning_destination** and **afternoon_destination** venues shortens the day's total
 * hop distance (same slot labels, swapped places), apply the swap in-place on `items`.
 * Lunch / dinner / evening stay fixed — only the two sightseeing slots can trade content.
 */
export function swapMorningAfternoonIfShorter(items: ItineraryItem[]): void {
  const byDay = new Map<number, ItineraryItem[]>();
  for (const it of items) {
    const arr = byDay.get(it.day) ?? [];
    arr.push(it);
    byDay.set(it.day, arr);
  }

  const morningSlot: TimeSlot = "morning_destination";
  const afternoonSlot: TimeSlot = "afternoon_destination";

  for (const [, dayItems] of byDay) {
    const mor = dayItems.find((x) => x.timeSlot === morningSlot);
    const aft = dayItems.find((x) => x.timeSlot === afternoonSlot);
    if (!mor || !aft || !numLatLng(mor) || !numLatLng(aft)) continue;

    const before = dayTravelDistanceM(dayItems);

    const swappedDay = dayItems.map((it) => {
      if (it.id === mor.id) {
        return {
          ...aft,
          id: mor.id,
          day: mor.day,
          timeSlot: morningSlot,
        };
      }
      if (it.id === aft.id) {
        return {
          ...mor,
          id: aft.id,
          day: aft.day,
          timeSlot: afternoonSlot,
        };
      }
      return it;
    });

    const after = dayTravelDistanceM(swappedDay);
    /** Require a tangible improvement so we don't flip-flop on noise. */
    if (before - after < 150) continue;

    const byId = new Map(swappedDay.map((x) => [x.id, x]));
    for (let i = 0; i < items.length; i++) {
      const next = byId.get(items[i]!.id);
      if (next) items[i] = next;
    }
  }
}
