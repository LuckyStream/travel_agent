import type { ItineraryItem, TimeSlot } from "./types";

const TIME_SLOTS: TimeSlot[] = [
  "morning_destination",
  "lunch",
  "afternoon_destination",
  "dinner",
  "evening_activity",
];

function slugId(prefix: string, i: number): string {
  return `${prefix}-${i}-${Math.random().toString(36).slice(2, 9)}`;
}

function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** CamelCase / spaces → snake_case segments for matching. */
function normalizeJsonKey(key: string): string {
  return key
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/\s+/g, "_");
}

/** Map day object property names to canonical TimeSlot. */
export function keyToCanonicalSlot(raw: string): TimeSlot | null {
  const k = normalizeJsonKey(raw);
  if (k === "morning_destination" || k === "morning") return "morning_destination";
  if (k === "lunch") return "lunch";
  if (k === "afternoon_destination" || k === "afternoon") return "afternoon_destination";
  if (k === "dinner") return "dinner";
  if (k === "evening_activity" || k === "evening") return "evening_activity";
  return null;
}

/** Accept top-level array or common wrapper keys models use. */
export function extractItineraryDays(raw: unknown): Record<string, unknown>[] {
  let root: unknown = raw;
  if (root && typeof root === "object" && !Array.isArray(root)) {
    const o = root as Record<string, unknown>;
    for (const key of ["days", "itinerary", "plan", "schedule", "trip", "activities"]) {
      const v = o[key];
      if (Array.isArray(v)) {
        root = v;
        break;
      }
    }
  }

  if (Array.isArray(root)) {
    return root.filter((x): x is Record<string, unknown> => x !== null && typeof x === "object");
  }

  if (root && typeof root === "object") {
    const o = root as Record<string, unknown>;
    const dayVal = o.day;
    if (dayVal !== undefined && dayVal !== null) {
      return [o];
    }
  }

  return [];
}

function findSlotBlock(d: Record<string, unknown>, slot: TimeSlot): Record<string, unknown> | null {
  for (const [key, val] of Object.entries(d)) {
    if (keyToCanonicalSlot(key) !== slot) continue;
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      return val as Record<string, unknown>;
    }
  }
  return null;
}

function readCoords(b: Record<string, unknown>): { lat: number; lng: number } {
  let lat =
    toNum(b.lat) ??
    toNum(b.latitude) ??
    toNum((b as { Latitude?: unknown }).Latitude);
  let lng =
    toNum(b.lng) ??
    toNum(b.lon) ??
    toNum(b.longitude) ??
    toNum((b as { Longitude?: unknown }).Longitude);

  const loc = b.location ?? b.coordinates ?? b.geo;
  if (loc && typeof loc === "object" && !Array.isArray(loc)) {
    const L = loc as Record<string, unknown>;
    lat = lat ?? toNum(L.lat ?? L.latitude);
    lng = lng ?? toNum(L.lng ?? L.lon ?? L.longitude);
  }

  if (lat === null || lng === null) return { lat: 0, lng: 0 };
  return { lat, lng };
}

function readDayNumber(d: Record<string, unknown>): number | null {
  const raw = d.day ?? d.dayNumber ?? (d as { Day?: unknown }).Day;
  if (typeof raw === "string") {
    const m = raw.match(/\d+/);
    if (m) {
      const n = Number.parseInt(m[0], 10);
      if (Number.isFinite(n) && n >= 1) return Math.floor(n);
    }
  }
  const n = toNum(raw);
  if (n === null || !Number.isFinite(n) || n < 1) return null;
  return Math.floor(n);
}

export function normalizeItinerary(raw: unknown, destination: string): ItineraryItem[] {
  const dayEntries = extractItineraryDays(raw);
  const items: ItineraryItem[] = [];
  let index = 0;

  for (const d of dayEntries) {
    const dayNum = readDayNumber(d);
    if (dayNum === null) continue;

    for (const slot of TIME_SLOTS) {
      const block = findSlotBlock(d, slot);
      if (!block) continue;

      const nameRaw = block.name ?? block.title ?? block.place ?? block.activity;
      const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
      const descRaw = block.description ?? block.summary ?? block.details;
      const description =
        typeof descRaw === "string" ? descRaw.trim() : "";
      const { lat, lng } = readCoords(block);

      if (!name) continue;

      const rating =
        toNum(block.rating) ??
        toNum((block as { Rating?: unknown }).Rating);
      const reviewCount =
        toNum(block.reviewCount) ??
        toNum(block.review_count) ??
        toNum((block as { user_ratings_total?: unknown }).user_ratings_total);

      const addrRaw =
        block.address ??
        block.formatted_address ??
        (block as { formattedAddress?: unknown }).formattedAddress ??
        block.vicinity;
      const address = typeof addrRaw === "string" ? addrRaw.trim() : "";
      const pidRaw = block.place_id ?? (block as { placeId?: unknown }).placeId;
      const placeId = typeof pidRaw === "string" ? pidRaw.trim() : "";

      items.push({
        id: slugId("item", index++),
        day: dayNum,
        timeSlot: slot,
        name,
        description: description || `Activity in ${destination}`,
        lat: Number.isFinite(lat) ? lat : 0,
        lng: Number.isFinite(lng) ? lng : 0,
        ...(address ? { address } : {}),
        ...(placeId ? { placeId } : {}),
        rating:
          rating !== null && rating >= 0 && rating <= 5 ? Math.round(rating * 10) / 10 : null,
        reviewCount:
          reviewCount !== null && reviewCount >= 0 ? Math.floor(reviewCount) : null,
      });
    }
  }

  return items;
}
