import type { GooglePlaceCandidate } from "@/lib/google-places";
import { haversineMeters } from "@/lib/travel-time-estimate";
import type { ItineraryItem, TimeSlot } from "@/lib/types";
import { timeSlotOrderIndex } from "@/lib/types";

/** Legs longer than this × day's median leg (with floors) trigger a replacement — slightly aggressive to reduce zig-zag days. */
const LEG_RATIO_THRESHOLD = 2.35;
/** Avoid treating tiny medians (same block) as baseline — use at least this for ratio. */
const MEDIAN_FLOOR_M = 400;
/** Ignore very short hops as outliers. */
const MIN_OUTLIER_LEG_M = 1_200;

function coordsOk(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
}

function medianSorted(sorted: number[]): number {
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function medianLegs(legs: number[]): number {
  if (!legs.length) return 0;
  return medianSorted([...legs].sort((a, b) => a - b));
}

function centroidOf(items: Pick<ItineraryItem, "lat" | "lng">[]): { lat: number; lng: number } | null {
  const ok = items.filter((p) => coordsOk(p.lat, p.lng));
  if (!ok.length) return null;
  let slat = 0;
  let slng = 0;
  for (const p of ok) {
    slat += p.lat;
    slng += p.lng;
  }
  return { lat: slat / ok.length, lng: slng / ok.length };
}

function anchorForReplacement(sortedDay: ItineraryItem[], replaceIdx: number): { lat: number; lng: number } | null {
  const prev = sortedDay[replaceIdx - 1];
  const next = sortedDay[replaceIdx + 1];
  if (prev && next && coordsOk(prev.lat, prev.lng) && coordsOk(next.lat, next.lng)) {
    return { lat: (prev.lat + next.lat) / 2, lng: (prev.lng + next.lng) / 2 };
  }
  if (prev && coordsOk(prev.lat, prev.lng)) return { lat: prev.lat, lng: prev.lng };
  if (next && coordsOk(next.lat, next.lng)) return { lat: next.lat, lng: next.lng };
  const others = sortedDay.filter((_, i) => i !== replaceIdx);
  return centroidOf(others);
}

function candidateMatchesSlot(c: GooglePlaceCandidate, slot: TimeSlot): boolean {
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

function pickReplacement(
  candidates: GooglePlaceCandidate[],
  slot: TimeSlot,
  anchor: { lat: number; lng: number },
  usedPlaceIds: Set<string>,
  usedNames: Set<string>
): GooglePlaceCandidate | null {
  const filtered = candidates.filter((c) => {
    const pid = c.placeId.trim();
    const nk = c.name.trim().toLowerCase();
    if (pid && usedPlaceIds.has(pid)) return false;
    if (usedNames.has(nk)) return false;
    return coordsOk(c.lat, c.lng);
  });

  const preferred = filtered.filter((c) => candidateMatchesSlot(c, slot));
  const pool = preferred.length ? preferred : filtered;
  if (!pool.length) return null;

  let best: GooglePlaceCandidate | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const c of pool) {
    const d = haversineMeters(c.lat, c.lng, anchor.lat, anchor.lng);
    const quality = -(c.rating * Math.log1p(Math.max(0, c.userRatingsTotal)));
    const score = d + quality * 2;
    if (score < bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

/**
 * If one same-day leg is huge vs that day's median leg (self-relative), replace exactly one stop:
 * the endpoint of that leg that sits farther from the centroid of the other stops on that day.
 * Replacement is chosen from `verifiedCandidates` near the anchor between neighbors in slot order.
 */
export function replaceOneOutlierStopFromVerifiedList(
  items: ItineraryItem[],
  verifiedCandidates: GooglePlaceCandidate[]
): void {
  if (!verifiedCandidates.length || items.length < 2) return;

  const byDay = new Map<number, ItineraryItem[]>();
  for (const it of items) {
    const list = byDay.get(it.day) ?? [];
    list.push(it);
    byDay.set(it.day, list);
  }

  type Edge = { from: ItineraryItem; to: ItineraryItem; dist: number };
  let worst: { ratio: number; distanceM: number; edge: Edge; sortedDay: ItineraryItem[] } | null =
    null;

  for (const [, dayItems] of byDay) {
    const sorted = [...dayItems].sort(
      (a, b) => timeSlotOrderIndex(a.timeSlot) - timeSlotOrderIndex(b.timeSlot)
    );

    const edges: Edge[] = [];
    let prevCoord: ItineraryItem | null = null;
    for (const it of sorted) {
      if (!coordsOk(it.lat, it.lng)) continue;
      if (prevCoord) {
        edges.push({
          from: prevCoord,
          to: it,
          dist: haversineMeters(prevCoord.lat, prevCoord.lng, it.lat, it.lng),
        });
      }
      prevCoord = it;
    }

    if (edges.length < 2) continue;

    const legDists = edges.map((e) => e.dist);
    const med = medianLegs(legDists);
    const effectiveMed = Math.max(med, MEDIAN_FLOOR_M);

    for (const edge of edges) {
      const d = edge.dist;
      if (d < MIN_OUTLIER_LEG_M) continue;
      const ratio = d / effectiveMed;
      if (ratio <= LEG_RATIO_THRESHOLD) continue;
      if (!worst || ratio > worst.ratio) {
        worst = { ratio, distanceM: d, edge, sortedDay: sorted };
      }
    }
  }

  if (!worst) return;

  const { edge, sortedDay } = worst;
  const a = edge.from;
  const b = edge.to;

  const centroidExcluding = (ex: ItineraryItem) =>
    centroidOf(sortedDay.filter((x) => x.id !== ex.id && coordsOk(x.lat, x.lng)));

  const cA = centroidExcluding(a);
  const cB = centroidExcluding(b);
  const dA = cA ? haversineMeters(a.lat, a.lng, cA.lat, cA.lng) : 0;
  const dB = cB ? haversineMeters(b.lat, b.lng, cB.lat, cB.lng) : 0;

  const replaceItem = dA >= dB ? a : b;
  const replaceIdx = sortedDay.indexOf(replaceItem);

  const anchor = anchorForReplacement(sortedDay, replaceIdx);
  if (!anchor) return;

  const usedPlaceIds = new Set<string>();
  const usedNames = new Set<string>();
  for (const it of items) {
    const pid = it.placeId?.trim();
    if (pid) usedPlaceIds.add(pid);
    usedNames.add(it.name.trim().toLowerCase());
  }

  const replacement = pickReplacement(
    verifiedCandidates,
    replaceItem.timeSlot,
    anchor,
    usedPlaceIds,
    usedNames
  );
  if (!replacement) return;

  const idxInItems = items.findIndex((x) => x.id === replaceItem.id);
  if (idxInItems === -1) return;

  const desc = `${replacement.name} — ${replacement.rating.toFixed(1)}★, ${replacement.userRatingsTotal.toLocaleString()} reviews.`;

  items[idxInItems] = {
    ...items[idxInItems],
    name: replacement.name,
    description: desc,
    lat: replacement.lat,
    lng: replacement.lng,
    address: replacement.address,
    placeId: replacement.placeId,
    rating: replacement.rating,
    reviewCount: replacement.userRatingsTotal,
  };
}
