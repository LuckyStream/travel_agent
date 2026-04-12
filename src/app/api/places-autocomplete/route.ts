import { NextResponse } from "next/server";

type PlacesAutocompleteResponse = {
  status: string;
  predictions?: {
    description?: string;
    place_id?: string;
  }[];
  error_message?: string;
};

/**
 * Google Places Autocomplete (legacy JSON) — geographic regions (cities, countries, admin areas).
 * Same GOOGLE_PLACES_API_KEY as Nearby / Details; enable "Places API" in Cloud Console.
 */
export async function GET(req: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim() ?? "";
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (!key) {
    return NextResponse.json({ predictions: [], configured: false });
  }

  if (q.length < 2) {
    return NextResponse.json({ predictions: [], configured: true });
  }

  const params = new URLSearchParams({
    input: q,
    key,
    types: "(regions)",
    language: "en",
  });

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`,
      { cache: "no-store" }
    );
    const data = (await res.json()) as PlacesAutocompleteResponse;

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return NextResponse.json({
        predictions: [],
        configured: true,
        status: data.status,
        error: data.error_message ?? data.status,
      });
    }

    const predictions = (data.predictions ?? [])
      .slice(0, 10)
      .map((p) => ({
        description: p.description?.trim() ?? "",
        placeId: p.place_id?.trim() ?? "",
      }))
      .filter((p) => p.description.length > 0);

    return NextResponse.json({ predictions, configured: true });
  } catch (e) {
    return NextResponse.json(
      {
        predictions: [],
        configured: true,
        error: e instanceof Error ? e.message : "Autocomplete request failed",
      },
      { status: 502 }
    );
  }
}
