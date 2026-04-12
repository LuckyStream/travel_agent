import { NextResponse } from "next/server";

type PlaceDetailsPhoto = {
  photo_reference?: string;
};

type PlaceDetailsResponse = {
  status?: string;
  error_message?: string;
  result?: {
    name?: string;
    photos?: PlaceDetailsPhoto[];
  };
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const placeId = url.searchParams.get("placeId")?.trim() ?? "";
  const limitRaw = Number.parseInt(url.searchParams.get("limit") ?? "6", 10);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 10)) : 6;
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim() ?? "";

  if (!placeId) {
    return NextResponse.json({ error: "placeId required" }, { status: 400 });
  }
  if (!key) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY is missing" }, { status: 400 });
  }

  const qs = new URLSearchParams({
    place_id: placeId,
    fields: "name,photos",
    key,
  });

  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${qs.toString()}`, {
      cache: "no-store",
    });
    const data = (await res.json()) as PlaceDetailsResponse;
    if (!res.ok || data.status !== "OK") {
      return NextResponse.json(
        { error: `Google place details failed: ${data.status ?? res.status}` },
        { status: 502 }
      );
    }

    const refs = (data.result?.photos ?? [])
      .map((p) => p.photo_reference?.trim() ?? "")
      .filter(Boolean)
      .slice(0, limit);

    const photos = refs.map(
      (ref) => `/api/place-photo?ref=${encodeURIComponent(ref)}&maxwidth=1200`
    );

    return NextResponse.json(
      {
        placeName: data.result?.name ?? null,
        photos,
      },
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not fetch place photos" },
      { status: 502 }
    );
  }
}
