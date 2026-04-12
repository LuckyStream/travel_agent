import { NextResponse } from "next/server";
import { googleGeocode } from "@/lib/google-places";

/** Geocode a free-text destination (e.g. autocomplete label) for map fallback. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { query?: string };
    const query = body.query?.trim();
    if (!query) {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }

    const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
    if (!key) {
      return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY not configured" }, { status: 503 });
    }

    const loc = await googleGeocode(query, key);
    if (!loc) {
      return NextResponse.json({ error: "Could not geocode destination" }, { status: 404 });
    }

    return NextResponse.json({ lat: loc.lat, lng: loc.lng });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Geocode failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
