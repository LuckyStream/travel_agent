import { NextResponse } from "next/server";
import { enrichItemCoordinates } from "@/lib/geocode";
import type { ItineraryItem } from "@/lib/types";

function toNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

/**
 * Fills missing or zero lat/lng on saved itinerary items (e.g. sessionStorage JSON
 * or older runs). Uses server GOOGLE_PLACES_API_KEY — does not skip Text Search.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { items?: ItineraryItem[]; destination?: string };
    const items = body.items;
    const dest = body.destination?.trim();
    if (!items?.length || !dest) {
      return NextResponse.json({ error: "items and destination required" }, { status: 400 });
    }

    const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
    if (!key) {
      return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY not configured" }, { status: 503 });
    }

    const rows = items.map((it) => {
      const lat = toNum(it.lat);
      const lng = toNum(it.lng);
      return {
        name: it.name,
        lat: Number.isFinite(lat) ? lat : 0,
        lng: Number.isFinite(lng) ? lng : 0,
        destinationHint: dest,
        address: it.address ?? null,
        placeId: it.placeId ?? null,
      };
    });

    await enrichItemCoordinates(rows, { googlePlacesApiKey: key });

    const next: ItineraryItem[] = items.map((it, i) => {
      const r = rows[i]!;
      return {
        ...it,
        lat: r.lat,
        lng: r.lng,
        ...(r.address ? { address: r.address } : {}),
        ...(r.placeId ? { placeId: r.placeId } : {}),
      };
    });

    return NextResponse.json({ items: next });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fill coordinates failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
