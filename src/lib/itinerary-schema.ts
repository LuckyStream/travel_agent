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
  if (
    k === "morning_destination" ||
    k === "morning" ||
    k === "morning_activity" ||
    k === "breakfast_stop" ||
    k === "am_activity"
  ) {
    return "morning_destination";
  }
  if (k === "lunch" || k === "lunch_stop" || k === "midday_meal") return "lunch";
  if (
    k === "afternoon_destination" ||
    k === "afternoon" ||
    k === "afternoon_activity" ||
    k === "pm_activity"
  ) {
    return "afternoon_destination";
  }
  if (k === "dinner" || k === "dinner_stop" || k === "supper") return "dinner";
  if (k === "evening_activity" || k === "evening" || k === "night_activity" || k === "nightlife") {
    return "evening_activity";
  }
  if (k === "morning_stop" || k === "first_stop" || k === "morning_visit") return "morning_destination";
  if (k === "afternoon_stop" || k === "afternoon_visit") return "afternoon_destination";
  if (k === "dinner_location" || k === "dinner_venue") return "dinner";
  if (k === "lunch_location" || k === "lunch_venue" || k === "lunch_spot") return "lunch";
  return null;
}

function unwrapSlotBlock(val: unknown): Record<string, unknown> | null {
  if (typeof val === "string") {
    const t = val.trim();
    return t ? { name: t, description: "" } : null;
  }
  if (!val || typeof val !== "object") return null;
  if (Array.isArray(val)) {
    const first = val.find((x) => x && typeof x === "object" && !Array.isArray(x));
    return first ? (first as Record<string, unknown>) : null;
  }
  return val as Record<string, unknown>;
}

function blockHasPlaceShape(b: Record<string, unknown>): boolean {
  return (
    typeof b.name === "string" ||
    typeof b.title === "string" ||
    typeof b.place === "string" ||
    typeof (b.placeId ?? b.place_id) === "string" ||
    typeof (b.venue_name ?? b.location_name ?? b.place_name) === "string"
  );
}

function looksLikeDayPayload(d: Record<string, unknown>): boolean {
  if (readDayNumber(d) !== null) return true;
  for (const key of Object.keys(d)) {
    if (!keyToCanonicalSlot(key)) continue;
    const inner = unwrapSlotBlock(d[key]);
    if (inner && blockHasPlaceShape(inner)) return true;
  }
  return false;
}

function inferDayFromParentKey(key: string): number | null {
  const m1 = /^day[_\s-]?(\d+)$/i.exec(key.trim());
  if (m1) {
    const n = Number.parseInt(m1[1], 10);
    return Number.isFinite(n) && n >= 1 ? n : null;
  }
  if (/^\d+$/.test(key.trim())) {
    const n = Number.parseInt(key.trim(), 10);
    return Number.isFinite(n) && n >= 1 ? n : null;
  }
  return null;
}

/** When the model returns `{ "1": { day:1, lunch:{...} } }` instead of an array. */
function collectDaysFromObjectMap(obj: Record<string, unknown>): Record<string, unknown>[] {
  const candidates: Record<string, unknown>[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (!val || typeof val !== "object" || Array.isArray(val)) continue;
    const d = val as Record<string, unknown>;
    if (!looksLikeDayPayload(d)) continue;
    if (readDayNumber(d) === null) {
      const inferred = inferDayFromParentKey(key);
      if (inferred !== null) {
        candidates.push({ ...d, day: inferred });
        continue;
      }
    }
    candidates.push(d);
  }
  return candidates.sort((a, b) => (readDayNumber(a) ?? 999) - (readDayNumber(b) ?? 999));
}

/** e.g. `{ data: { days: [...] } }` — LLMs often nest one level. */
const NESTED_DAY_ARRAY_PATHS: string[][] = [
  ["data", "days"],
  ["data", "itinerary"],
  ["data", "plan"],
  ["result", "days"],
  ["result", "itinerary"],
  ["result", "plan"],
  ["payload", "days"],
  ["output", "days"],
  ["output", "itinerary"],
  ["response", "days"],
  ["response", "itinerary"],
  ["itinerary", "days"],
  ["parsed", "days"],
  ["json", "days"],
  ["message", "days"],
];

function readNestedArray(o: Record<string, unknown>, path: string[]): unknown[] | null {
  let cur: unknown = o;
  for (const p of path) {
    if (!cur || typeof cur !== "object" || Array.isArray(cur)) return null;
    cur = (cur as Record<string, unknown>)[p];
  }
  return Array.isArray(cur) ? cur : null;
}

function peelSingleKeyObject(o: Record<string, unknown>, maxPeels: number): Record<string, unknown> {
  let cur: unknown = o;
  for (let i = 0; i < maxPeels; i++) {
    if (!cur || typeof cur !== "object" || Array.isArray(cur)) break;
    const rec = cur as Record<string, unknown>;
    const keys = Object.keys(rec);
    if (
      keys.length === 1 &&
      rec[keys[0]!] !== null &&
      typeof rec[keys[0]!] === "object" &&
      !Array.isArray(rec[keys[0]!])
    ) {
      cur = rec[keys[0]!];
      continue;
    }
    break;
  }
  return (cur as Record<string, unknown>) ?? o;
}

/** Accept top-level array or common wrapper keys models use. */
export function extractItineraryDays(raw: unknown): Record<string, unknown>[] {
  let root: unknown = raw;

  if (root && typeof root === "object" && !Array.isArray(root)) {
    let o = peelSingleKeyObject(root as Record<string, unknown>, 4);

    for (const path of NESTED_DAY_ARRAY_PATHS) {
      const arr = readNestedArray(o, path);
      if (arr?.length) {
        root = arr;
        break;
      }
    }

    if (root === raw || (root && typeof root === "object" && !Array.isArray(root))) {
      o = peelSingleKeyObject(root as Record<string, unknown>, 4);
      root = o;
      for (const key of [
        "days",
        "itinerary",
        "plan",
        "schedule",
        "trip",
        "activities",
        "daily_plan",
        "dailyPlan",
        "result",
        "response",
        "output",
        "generated_plan",
        "generatedPlan",
        "day_plans",
        "dayPlans",
        "final_plan",
        "ai_itinerary",
      ]) {
        const v = o[key];
        if (Array.isArray(v)) {
          root = v;
          break;
        }
        if (v && typeof v === "object" && !Array.isArray(v)) {
          const collected = collectDaysFromObjectMap(v as Record<string, unknown>);
          if (collected.length) return collected;
        }
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
    const collected = collectDaysFromObjectMap(o);
    if (collected.length) return collected;
  }

  return [];
}

function findSlotBlock(d: Record<string, unknown>, slot: TimeSlot): Record<string, unknown> | null {
  for (const [key, val] of Object.entries(d)) {
    if (keyToCanonicalSlot(key) !== slot) continue;
    const inner = unwrapSlotBlock(val);
    if (inner) return inner;
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

function pushItemFromBlock(
  items: ItineraryItem[],
  indexRef: { n: number },
  dayNum: number,
  slot: TimeSlot,
  block: Record<string, unknown>,
  destination: string
): void {
  const addrRaw =
    block.address ??
    block.formatted_address ??
    (block as { formattedAddress?: unknown }).formattedAddress ??
    block.vicinity;
  const address = typeof addrRaw === "string" ? addrRaw.trim() : "";
  const pidRaw = block.place_id ?? (block as { placeId?: unknown }).placeId;
  const placeId = typeof pidRaw === "string" ? pidRaw.trim() : "";

  const nameRaw =
    block.name ??
    block.title ??
    block.place ??
    block.activity ??
    block.venue_name ??
    block.location_name ??
    block.place_name ??
    (typeof block.place === "string" ? block.place : undefined) ??
    (typeof block.place === "object" &&
    block.place !== null &&
    (block.place as Record<string, unknown>).name
      ? String((block.place as Record<string, unknown>).name)
      : undefined);
  let name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  if (!name && placeId) {
    name = "Place from plan";
  }
  if (!name) return;

  const descRaw = block.description ?? block.summary ?? block.details;
  const description = typeof descRaw === "string" ? descRaw.trim() : "";
  const { lat, lng } = readCoords(block);

  const rating =
    toNum(block.rating) ?? toNum((block as { Rating?: unknown }).Rating);
  const reviewCount =
    toNum(block.reviewCount) ??
    toNum(block.review_count) ??
    toNum((block as { user_ratings_total?: unknown }).user_ratings_total);

  items.push({
    id: slugId("item", indexRef.n++),
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

function collectItemsFromDayEntries(
  dayEntries: Record<string, unknown>[],
  destination: string
): ItineraryItem[] {
  const items: ItineraryItem[] = [];
  const indexRef = { n: 0 };

  for (let di = 0; di < dayEntries.length; di++) {
    const d = dayEntries[di]!;
    let dayNum = readDayNumber(d);
    if (dayNum === null) {
      dayNum = di + 1;
    }

    for (const slot of TIME_SLOTS) {
      const block = findSlotBlock(d, slot);
      if (!block) continue;
      pushItemFromBlock(items, indexRef, dayNum, slot, block, destination);
    }
  }

  return items;
}

function readSlotFromFlatObject(o: Record<string, unknown>): TimeSlot | null {
  const raw =
    o.time_slot ??
    o.timeSlot ??
    o.slot ??
    o.slot_type ??
    o.type ??
    o.period ??
    o.meal ??
    o.part_of_day ??
    (o as { timeOfDay?: unknown }).timeOfDay;
  if (typeof raw !== "string") return null;
  const k = normalizeJsonKey(raw);
  if (k === "morning_destination" || k === "afternoon_destination" || k === "evening_activity") {
    return k as TimeSlot;
  }
  if (k === "lunch" || k === "dinner") return k;
  if (k.includes("morning") || k === "am" || k.includes("breakfast")) return "morning_destination";
  if (k.includes("lunch") || k.includes("midday")) return "lunch";
  if (k.includes("afternoon")) return "afternoon_destination";
  if (k.includes("dinner") || k.includes("supper")) return "dinner";
  if (k.includes("evening") || k.includes("night") || k.includes("bar")) return "evening_activity";
  return null;
}

function pickFlatStopName(o: Record<string, unknown>): string {
  const n =
    o.name ??
    o.title ??
    o.place ??
    o.venue ??
    o.location_name ??
    o.place_name ??
    (o as { venueName?: unknown }).venueName;
  if (typeof n === "string") return n.trim();
  return "";
}

/** Models sometimes emit a flat array of stops with `day` + `slot` instead of nested day objects. */
function extractFromFlatStopList(raw: unknown, destination: string): ItineraryItem[] {
  const tryArrays: unknown[] = [];
  if (Array.isArray(raw)) tryArrays.push(raw);
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    for (const key of [
      "items",
      "stops",
      "schedule",
      "activities",
      "places",
      "entries",
      "events",
      "timeline",
    ]) {
      const v = o[key];
      if (Array.isArray(v)) tryArrays.push(v);
    }
  }

  let best: ItineraryItem[] = [];

  for (const candidate of tryArrays) {
    if (!Array.isArray(candidate) || candidate.length < 1) continue;
    const items: ItineraryItem[] = [];
    const indexRef = { n: 0 };
    let lastDay = 1;

    for (const el of candidate) {
      if (!el || typeof el !== "object" || Array.isArray(el)) continue;
      const o = el as Record<string, unknown>;
      const slot = readSlotFromFlatObject(o);
      if (!slot) continue;
      const name = pickFlatStopName(o);
      const pidRaw = o.place_id ?? (o as { placeId?: unknown }).placeId;
      const hasPlaceId = typeof pidRaw === "string" && pidRaw.trim().length > 0;
      if (!name && !hasPlaceId) continue;
      let dayNum = readDayNumber(o);
      if (dayNum === null) {
        dayNum = lastDay;
      } else {
        lastDay = dayNum;
      }

      pushItemFromBlock(items, indexRef, dayNum, slot, o, destination);
    }

    if (items.length > best.length) best = items;
  }

  return best;
}

export function normalizeItinerary(raw: unknown, destination: string): ItineraryItem[] {
  const dayEntries = extractItineraryDays(raw);
  let items = collectItemsFromDayEntries(dayEntries, destination);
  if (items.length) return items;
  items = extractFromFlatStopList(raw, destination);
  return items;
}
