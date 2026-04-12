import { NextResponse } from "next/server";

/**
 * Exposes a Maps JavaScript API key to the browser when only server-side env is set.
 * Same key must have "Maps JavaScript API" enabled in Google Cloud (alongside Places/Geocoding).
 * Referrer-restrict this key to your domains in Cloud Console.
 */
export async function GET() {
  const key =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    "";

  if (!key) {
    return NextResponse.json({ key: null }, { status: 200 });
  }

  return NextResponse.json(
    { key },
    { headers: { "Cache-Control": "no-store" } }
  );
}
