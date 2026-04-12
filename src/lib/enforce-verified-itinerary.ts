import type { GooglePlaceCandidate } from "@/lib/google-places";
import { haversineMeters } from "@/lib/travel-time-estimate";
import type { ItineraryItem, TimeSlot } from "@/lib/types";
import { timeSlotOrderIndex } from "@/lib/types";

function coordsOk(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
}

function candidateFitsSlot(c: GooglePlaceCandidate, slot: TimeSlot): boolean {
  const t = c.types.join(" ").toLowerCase();
  if (slot === "lunch" || slot === "dinner") {
    return (
      t.includes("restaurant") ||
      t.includes("food") ||
      t.includes("meal") ||
      t.includes("cafe") ||
      t.includes("bakery")
    );
  }
  if (slot === "evening_activity") {
    return (
      t.includes("bar") ||
      t.includes("night") ||
      t.includes("club") ||
      t.includes("tourist") ||
      t.includes("amusement")
    );
  }
  return (
    t.includes("tourist") ||
    t.includes("museum") ||
    t.includes("park") ||
    t.includes("church") ||
    t.includes("natural_feature") ||
    t.includes("point_of_interest")
  );
}

function centroidOfItems(points: Pick<ItineraryItem, "lat" | "lng">[]): { lat: number; lng: number } | null {
  const ok = points.filter((p) => coordsOk(p.lat, p.lng));
  if (!ok.length) return null;
  let slat = 0;
  let slng = 0;
  for (const p of ok) {
    slat += p.lat;
    slng += p.lng;
  }
  return { lat: slat / ok.length, lng: slng / ok.length };
}

function applyCandidate(it: ItineraryItem, c: GooglePlaceCandidate): void {
  const rating = Math.round(c.rating * 10) / 10;
  it.name = c.name;
  it.placeId = c.placeId;
  it.address = c.address;
  it.lat = c.lat;
  it.lng = c.lng;
  it.rating = rating >= 0 && rating <= 5 ? rating : null;
  it.reviewCount = c.userRatingsTotal >= 0 ? c.userRatingsTotal : null;
  it.description = `${c.name} — ${c.rating.toFixed(1)}★, ${c.userRatingsTotal.toLocaleString()} reviews.`;
}

function pickFallbackCandidate(
  candidates: GooglePlaceCandidate[],
  usedPlaceIds: Set<string>,
  slot: TimeSlot,
  anchor: { lat: number; lng: number } | null
): GooglePlaceCandidate | null {
  const unused = candidates.filter((c) => c.placeId.trim() && !usedPlaceIds.has(c.placeId.trim()));
  if (!unused.length) return null;

  let pool = unused.filter((c) => coordsOk(c.lat, c.lng) && candidateFitsSlot(c, slot));
  if (!pool.length) pool = unused.filter((c) => coordsOk(c.lat, c.lng));
  if (!pool.length) return null;

  if (!anchor) {
    return pool.sort((a, b) => b.rating * Math.log1p(b.userRatingsTotal) - a.rating * Math.log1p(a.userRatingsTotal))[0]!;
  }

  const scored = pool.map((c) => ({
    c,
    d: haversineMeters(c.lat, c.lng, anchor.lat, anchor.lng),
    q: c.rating * Math.log1p(c.userRatingsTotal),
  }));
  scored.sort((a, b) => {
    if (Math.abs(a.d - b.d) > 200) return a.d - b.d;
    return b.q - a.q;
  });
  return scored[0]!.c;
}

/**
 * Snap every stop to the verified Nearby list: placeId first, then exact name, then unused fallback.
 * Strips any placeId not in the verified set so geocoding cannot resolve a hallucinated ID to the wrong region.
 * Returns lowercase normalized names for enrichItemCoordinates skipFind (authoritative coords from this list).
 */
export function enforceItineraryToVerifiedCandidates(
  items: ItineraryItem[],
  candidates: GooglePlaceCandidate[]
): Set<string> {
  const pinned = new Set<string>();

  const validIds = new Set(candidates.map((c) => c.placeId.trim()).filter(Boolean));
  if (!candidates.length) {
    for (const it of items) {
      const pid = it.placeId?.trim();
      if (pid && !validIds.has(pid)) {
        delete it.placeId;
      }
    }
    return pinned;
  }

  const byPlaceId = new Map<string, GooglePlaceCandidate>();
  const byName = new Map<string, GooglePlaceCandidate[]>();
  for (const c of candidates) {
    const pid = c.placeId.trim();
    if (pid) byPlaceId.set(pid, c);
    const k = c.name.trim().toLowerCase();
    const arr = byName.get(k) ?? [];
    arr.push(c);
    byName.set(k, arr);
  }

  const usedPlaceIds = new Set<string>();
  const enforcedIds = new Set<string>();

  const markUsed = (c: GooglePlaceCandidate) => {
    usedPlaceIds.add(c.placeId.trim());
  };
  const isUsed = (c: GooglePlaceCandidate) => usedPlaceIds.has(c.placeId.trim());

  for (const it of items) {
    const pid = it.placeId?.trim();
    if (!pid || !validIds.has(pid)) continue;
    const c = byPlaceId.get(pid);
    if (!c || isUsed(c)) continue;
    applyCandidate(it, c);
    markUsed(c);
    enforcedIds.add(it.id);
    pinned.add(it.name.trim().toLowerCase());
  }

  for (const it of items) {
    if (enforcedIds.has(it.id)) continue;
    const k = it.name.trim().toLowerCase();
    const arr = byName.get(k);
    if (!arr) continue;
    const pick = arr.find((c) => !isUsed(c));
    if (!pick) continue;
    applyCandidate(it, pick);
    markUsed(pick);
    enforcedIds.add(it.id);
    pinned.add(it.name.trim().toLowerCase());
  }

  const sorted = [...items].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return timeSlotOrderIndex(a.timeSlot) - timeSlotOrderIndex(b.timeSlot);
  });

  for (const it of sorted) {
    if (enforcedIds.has(it.id)) continue;

    const siblings = items.filter(
      (x) => x.day === it.day && enforcedIds.has(x.id) && coordsOk(x.lat, x.lng)
    );
    const anchor = centroidOfItems(siblings);
    const pick = pickFallbackCandidate(candidates, usedPlaceIds, it.timeSlot, anchor);
    if (pick) {
      applyCandidate(it, pick);
      markUsed(pick);
      enforcedIds.add(it.id);
      pinned.add(it.name.trim().toLowerCase());
    }
  }

  for (const it of items) {
    if (enforcedIds.has(it.id)) continue;
    delete it.placeId;
  }

  return pinned;
}
