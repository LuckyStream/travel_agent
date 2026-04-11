import { findPlaceFromText, googleGeocode, lookupPlaceDetails } from "./google-places";

const USER_AGENT = "TravelRecommendationApp/1.0 (contact: local-dev)";

export type EnrichCoordinatesOptions = {
  googlePlacesApiKey?: string;
  /**
   * Lowercase trimmed place names already pinned to authoritative Google coords
   * (e.g. from verified Nearby list) — skip Find Place so we do not override good data.
   */
  skipFindPlaceForNormalizedNames?: Set<string>;
};

export async function geocodePlace(query: string): Promise<{ lat: number; lng: number } | null> {
  const q = query.trim();
  if (!q) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    q
  )}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { lat?: string; lon?: string }[];
    if (!data?.length) return null;
    const lat = parseFloat(data[0].lat ?? "");
    const lng = parseFloat(data[0].lon ?? "");
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

export type EnrichCoordinateRow = {
  name: string;
  lat: number;
  lng: number;
  destinationHint: string;
  address?: string | null;
  placeId?: string | null;
};

async function geocodeAddressWithDestination(
  apiKey: string,
  address: string,
  destinationHint: string
): Promise<{ lat: number; lng: number } | null> {
  const addr = address.trim();
  const dest = destinationHint.trim();
  if (!addr) return null;

  return (
    (await googleGeocode(addr, apiKey)) ??
    (dest ? await googleGeocode(`${addr}, ${dest}`, apiKey) : null)
  );
}

export async function enrichItemCoordinates(
  items: EnrichCoordinateRow[],
  options?: EnrichCoordinatesOptions
): Promise<void> {
  const key = options?.googlePlacesApiKey?.trim();
  const skipFind = options?.skipFindPlaceForNormalizedNames;
  let destCenter: { lat: number; lng: number } | null = null;

  const ensureDestCenter = async (destinationHint: string) => {
    if (!key) return null;
    if (!destCenter) {
      destCenter = await googleGeocode(destinationHint.trim(), key);
    }
    return destCenter;
  };

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const dest = it.destinationHint.trim();
    const nameNorm = it.name.trim().toLowerCase();

    if (key) {
      const pid = it.placeId?.trim();
      if (pid) {
        const exact = await lookupPlaceDetails(key, pid);
        if (exact) {
          if (exact.address) it.address = exact.address;
          if (exact.placeId) it.placeId = exact.placeId;
          const addressCoords = exact.address
            ? await geocodeAddressWithDestination(key, exact.address, dest)
            : null;
          it.lat = addressCoords?.lat ?? exact.lat;
          it.lng = addressCoords?.lng ?? exact.lng;
          if (i < items.length - 1) {
            await new Promise((r) => setTimeout(r, 120));
          }
          continue;
        }
      }

      if (skipFind?.has(nameNorm)) {
        if (i < items.length - 1) {
          await new Promise((r) => setTimeout(r, 120));
        }
        continue;
      }

      const addr = it.address?.trim();
      if (addr) {
        const geocodedAddress = await geocodeAddressWithDestination(key, addr, dest);
        if (geocodedAddress) {
          it.lat = geocodedAddress.lat;
          it.lng = geocodedAddress.lng;
          if (i < items.length - 1) {
            await new Promise((r) => setTimeout(r, 120));
          }
          continue;
        }
      }

      let biasLat = it.lat;
      let biasLng = it.lng;
      if (!Number.isFinite(biasLat) || !Number.isFinite(biasLng) || (biasLat === 0 && biasLng === 0)) {
        const c = await ensureDestCenter(dest);
        if (c) {
          biasLat = c.lat;
          biasLng = c.lng;
        }
      }
      if (Number.isFinite(biasLat) && Number.isFinite(biasLng)) {
        const found = await findPlaceFromText(key, `${it.name.trim()} ${dest}`, biasLat, biasLng);
        if (found) {
          it.lat = found.lat;
          it.lng = found.lng;
          if (found.address) it.address = found.address;
          if (found.placeId) it.placeId = found.placeId;
        }
      }
      if (i < items.length - 1) {
        await new Promise((r) => setTimeout(r, 200));
      }
      continue;
    }

    if (it.lat === 0 && it.lng === 0) {
      const coords = await geocodePlace(`${it.name.trim()}, ${dest}`);
      if (coords) {
        it.lat = coords.lat;
        it.lng = coords.lng;
      }
      if (i < items.length - 1) {
        await new Promise((r) => setTimeout(r, 1100));
      }
    }
  }
}
