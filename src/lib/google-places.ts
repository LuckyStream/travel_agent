import type { DiningTag, InterestTag, ItineraryItem } from "./types";

/** Google Nearby Search maximum radius (meters). Requested 80km is clamped to this API limit. */
export const GOOGLE_NEARBY_MAX_RADIUS_METERS = 50_000;
const R_URBAN_METERS = 15_000;

export type GooglePlaceCandidate = {
  placeId: string;
  name: string;
  rating: number;
  userRatingsTotal: number;
  address: string;
  lat: number;
  lng: number;
  types: string[];
  sourceType?: string;
  sourceKeyword?: string;
};

type NearbySearchParams = {
  radiusMeters: number;
  type?: string;
  keyword?: string;
};

type NearbyApiResult = {
  place_id?: string;
  name?: string;
  rating?: number;
  user_ratings_total?: number;
  vicinity?: string;
  formatted_address?: string;
  geometry?: { location?: { lat?: number; lng?: number } };
  types?: string[];
};

type NearbyApiResponse = {
  status: string;
  results?: NearbyApiResult[];
  error_message?: string;
  next_page_token?: string;
};

type PlaceDetailsResponse = {
  status: string;
  result?: {
    place_id?: string;
    formatted_address?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
    name?: string;
  };
  error_message?: string;
};

/** True when interests justify regional (wider) search around the destination. */
export function interestsPreferRegionalSearch(interests: InterestTag[]): boolean {
  return interests.some((t) => t === "nature" || t === "adventure" || t === "relaxation");
}

function restaurantKeywordFromDining(dining: DiningTag[]): string | undefined {
  const parts: string[] = [];
  if (dining.includes("local cuisine")) parts.push("local");
  if (dining.includes("vegetarian friendly")) parts.push("vegetarian");
  if (dining.includes("street food")) parts.push("street food");
  if (dining.includes("trendy spots")) parts.push("trendy");
  return parts.length ? parts.join(" ") : undefined;
}

function buildNearbyRequests(
  interests: InterestTag[],
  dining: DiningTag[]
): NearbySearchParams[] {
  const regional = interestsPreferRegionalSearch(interests);
  const rRegional = GOOGLE_NEARBY_MAX_RADIUS_METERS;
  const rUrban = R_URBAN_METERS;
  const seen = new Set<string>();
  const out: NearbySearchParams[] = [];

  const add = (p: NearbySearchParams) => {
    const key = `${p.type ?? ""}|${p.keyword ?? ""}|${p.radiusMeters}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      ...p,
      radiusMeters: Math.min(p.radiusMeters, GOOGLE_NEARBY_MAX_RADIUS_METERS),
    });
  };

  const rw = regional ? rRegional : rUrban;
  const set = new Set(interests);

  if (set.size === 0) {
    add({ radiusMeters: rUrban, type: "restaurant" });
    add({ radiusMeters: rUrban, type: "tourist_attraction" });
    add({ radiusMeters: rUrban, type: "museum" });
    return out;
  }

  if (set.has("food")) {
    add({
      radiusMeters: rUrban,
      type: "restaurant",
      keyword: restaurantKeywordFromDining(dining),
    });
    add({ radiusMeters: rUrban, type: "cafe" });
  }

  if (set.has("nature")) {
    add({ radiusMeters: rw, type: "park" });
    add({ radiusMeters: rw, type: "tourist_attraction", keyword: "nature scenic viewpoint" });
  }

  if (set.has("history")) {
    add({ radiusMeters: rUrban, type: "museum" });
    add({
      radiusMeters: rUrban,
      type: "tourist_attraction",
      keyword: "historic landmark",
    });
  }

  if (set.has("shopping")) {
    add({ radiusMeters: rUrban, type: "shopping_mall" });
  }

  if (set.has("nightlife")) {
    add({ radiusMeters: rUrban, type: "night_club" });
    add({ radiusMeters: rUrban, type: "bar" });
  }

  if (set.has("art")) {
    add({ radiusMeters: rUrban, type: "art_gallery" });
    add({ radiusMeters: rUrban, type: "museum", keyword: "art" });
  }

  if (set.has("adventure")) {
    add({
      radiusMeters: rw,
      type: "tourist_attraction",
      keyword: "outdoor adventure hiking",
    });
  }

  if (set.has("relaxation")) {
    add({ radiusMeters: rUrban, type: "spa" });
    add({ radiusMeters: rw, type: "park", keyword: "garden quiet" });
  }

  if (!set.has("food")) {
    add({
      radiusMeters: rUrban,
      type: "restaurant",
      keyword: restaurantKeywordFromDining(dining),
    });
  }

  return out;
}

async function nearbySearch(
  apiKey: string,
  lat: number,
  lng: number,
  params: NearbySearchParams
): Promise<NearbyApiResult[]> {
  const radius = Math.min(params.radiusMeters, GOOGLE_NEARBY_MAX_RADIUS_METERS);
  const qs = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: String(radius),
    key: apiKey,
  });
  if (params.type) qs.set("type", params.type);
  if (params.keyword) qs.set("keyword", params.keyword);

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${qs.toString()}`;
  const res = await fetch(url);
  const data = (await res.json()) as NearbyApiResponse;

  if (data.status === "ZERO_RESULTS") return [];
  if (data.status !== "OK") {
    throw new Error(
      `Google Places nearby search (${params.type ?? "any"}): ${data.status} ${data.error_message ?? ""}`
    );
  }

  return data.results ?? [];
}

export async function googleGeocode(
  address: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  const qs = new URLSearchParams({
    address,
    key: apiKey,
  });
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${qs.toString()}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results?: { geometry?: { location?: { lat: number; lng: number } } }[];
    error_message?: string;
  };
  if (data.status !== "OK" || !data.results?.length) {
    return null;
  }
  const loc = data.results[0].geometry?.location;
  if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") return null;
  return { lat: loc.lat, lng: loc.lng };
}

function resultScore(r: NearbyApiResult): number {
  const rating = r.rating ?? 0;
  const n = r.user_ratings_total ?? 0;
  return rating * Math.log10(10 + n / 10);
}

function mapResult(
  r: NearbyApiResult,
  sourceType?: string,
  sourceKeyword?: string
): GooglePlaceCandidate | null {
  const pid = r.place_id;
  const name = r.name?.trim();
  const loc = r.geometry?.location;
  if (!pid || !name || !loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") {
    return null;
  }
  return {
    placeId: pid,
    name,
    rating: typeof r.rating === "number" ? r.rating : 0,
    userRatingsTotal: typeof r.user_ratings_total === "number" ? r.user_ratings_total : 0,
    address: (r.vicinity ?? "").trim() || "Address not listed",
    lat: loc.lat,
    lng: loc.lng,
    types: Array.isArray(r.types) ? r.types : [],
    sourceType,
    sourceKeyword,
  };
}

/**
 * Fetches deduplicated, sorted real venues near the destination for LLM context.
 */
export async function fetchVerifiedPlacesForDestination(
  destinationLabel: string,
  interests: InterestTag[],
  dining: DiningTag[],
  apiKey: string
): Promise<GooglePlaceCandidate[]> {
  const center = await googleGeocode(destinationLabel, apiKey);
  if (!center) return [];

  const templates = buildNearbyRequests(interests, dining);
  const collected: NearbyApiResult[] = [];
  const meta: { type?: string; keyword?: string }[] = [];

  for (const t of templates) {
    const { type, keyword, radiusMeters } = t;
    try {
      const chunk = await nearbySearch(apiKey, center.lat, center.lng, {
        radiusMeters,
        type,
        keyword,
      });
      for (const row of chunk) {
        collected.push(row);
        meta.push({ type, keyword });
      }
    } catch {
      // Skip failed category (e.g. invalid type for legacy API); continue others
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  const byId = new Map<string, GooglePlaceCandidate>();

  for (let i = 0; i < collected.length; i++) {
    const row = collected[i];
    const m = meta[i] ?? {};
    const cand = mapResult(row, m.type, m.keyword);
    if (!cand) continue;
    const prev = byId.get(cand.placeId);
    const sNew = resultScore(row);
    if (!prev) {
      byId.set(cand.placeId, cand);
    } else {
      const sOld = resultScore({ rating: prev.rating, user_ratings_total: prev.userRatingsTotal });
      if (sNew > sOld) byId.set(cand.placeId, cand);
    }
  }

  return [...byId.values()].sort((a, b) => {
    const sa = resultScore({ rating: a.rating, user_ratings_total: a.userRatingsTotal });
    const sb = resultScore({ rating: b.rating, user_ratings_total: b.userRatingsTotal });
    return sb - sa;
  });
}

/** Compact text block for Ollama (cap list size for token limits). */
export function formatVerifiedPlacesForPrompt(places: GooglePlaceCandidate[], maxPlaces = 48): string {
  const slice = places.slice(0, maxPlaces);
  if (!slice.length) return "(No verified places returned — check API key and billing.)";

  const lines = slice.map((p, i) => {
    const types = p.types.slice(0, 4).join(", ");
    const kw = p.sourceKeyword ? ` [search: ${p.sourceKeyword}]` : "";
    return (
      `${i + 1}. "${p.name}" | ${p.rating.toFixed(1)}★ | ${p.userRatingsTotal} reviews | ` +
      `${p.address} | lat ${p.lat.toFixed(6)}, lng ${p.lng.toFixed(6)} | ` +
      `placeId: ${p.placeId} | types: ${types}${kw}`
    );
  });

  return lines.join("\n");
}

type FindPlaceFromTextResponse = {
  status: string;
  candidates?: NearbyApiResult[];
  error_message?: string;
};

/**
 * When the model returns stops from our verified list, replace lat/lng with the exact
 * coordinates from Nearby Search (model copy/paste of numbers is often wrong).
 */
export function snapItineraryItemsToVerifiedCandidates(
  items: ItineraryItem[],
  candidates: GooglePlaceCandidate[]
): Set<string> {
  const pinned = new Set<string>();
  if (!candidates.length) return pinned;

  const byName = new Map<string, GooglePlaceCandidate>();
  const byPlaceId = new Map<string, GooglePlaceCandidate>();
  for (const c of candidates) {
    const k = c.name.trim().toLowerCase();
    if (!byName.has(k)) byName.set(k, c);
    const pid = c.placeId.trim();
    if (pid && !byPlaceId.has(pid)) byPlaceId.set(pid, c);
  }

  for (const it of items) {
    const pid = it.placeId?.trim();
    const k = it.name.trim().toLowerCase();
    const hit = (pid ? byPlaceId.get(pid) : null) ?? byName.get(k);
    if (hit) {
      it.lat = hit.lat;
      it.lng = hit.lng;
      it.address = hit.address;
      it.placeId = hit.placeId;
      pinned.add(k);
    }
  }
  return pinned;
}

export async function lookupPlaceDetails(
  apiKey: string,
  placeId: string
): Promise<ResolvedPlaceFromText | null> {
  const pid = placeId.trim();
  if (!pid) return null;

  const qs = new URLSearchParams({
    place_id: pid,
    fields: "geometry,formatted_address,place_id,name",
    key: apiKey,
  });
  const url = `https://maps.googleapis.com/maps/api/place/details/json?${qs.toString()}`;

  try {
    const res = await fetch(url);
    const data = (await res.json()) as PlaceDetailsResponse;
    if (data.status !== "OK" || !data.result) return null;
    const loc = data.result.geometry?.location;
    if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") return null;
    const formatted = data.result.formatted_address?.trim();
    const resolvedPid = data.result.place_id?.trim() || pid;
    return {
      lat: loc.lat,
      lng: loc.lng,
      ...(formatted ? { address: formatted } : {}),
      ...(resolvedPid ? { placeId: resolvedPid } : {}),
    };
  } catch {
    return null;
  }
}

export type ResolvedPlaceFromText = {
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
};

/**
 * Resolve a free-text place near a bias point (Places Find + Text Search fallback).
 * Returns coordinates plus formatted address and place id when the API provides them.
 */
export async function findPlaceFromText(
  apiKey: string,
  query: string,
  biasLat: number,
  biasLng: number,
  radiusMeters = GOOGLE_NEARBY_MAX_RADIUS_METERS
): Promise<ResolvedPlaceFromText | null> {
  const q = query.trim();
  if (!q || !Number.isFinite(biasLat) || !Number.isFinite(biasLng)) return null;

  const r = Math.min(Math.max(radiusMeters, 1000), GOOGLE_NEARBY_MAX_RADIUS_METERS);
  const bias = `circle:${r}@${biasLat},${biasLng}`;

  const findQs = new URLSearchParams({
    input: q,
    inputtype: "textquery",
    fields: "geometry,formatted_address,place_id",
    locationbias: bias,
    key: apiKey,
  });
  const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${findQs.toString()}`;

  try {
    const findRes = await fetch(findUrl);
    const findData = (await findRes.json()) as FindPlaceFromTextResponse;
    if (findData.status === "OK" && findData.candidates?.length) {
      const c = findData.candidates[0];
      const loc = c.geometry?.location;
      if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
        const formatted = c.formatted_address?.trim();
        const pid = c.place_id?.trim();
        return {
          lat: loc.lat,
          lng: loc.lng,
          ...(formatted ? { address: formatted } : {}),
          ...(pid ? { placeId: pid } : {}),
        };
      }
    }
  } catch {
    // fall through
  }

  const textQs = new URLSearchParams({
    query: q,
    location: `${biasLat},${biasLng}`,
    radius: String(r),
    key: apiKey,
  });
  const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?${textQs.toString()}`;

  try {
    const textRes = await fetch(textUrl);
    const textData = (await textRes.json()) as NearbyApiResponse;
    if (textData.status === "OK" && textData.results?.length) {
      const row = textData.results[0];
      const loc = row.geometry?.location;
      if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
        const formatted = row.formatted_address?.trim();
        const vicinity = row.vicinity?.trim();
        const pid = row.place_id?.trim();
        const address = formatted || vicinity;
        return {
          lat: loc.lat,
          lng: loc.lng,
          ...(address ? { address } : {}),
          ...(pid ? { placeId: pid } : {}),
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}
