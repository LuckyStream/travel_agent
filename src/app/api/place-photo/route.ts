import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ref = url.searchParams.get("ref")?.trim() ?? "";
  const widthRaw = Number.parseInt(url.searchParams.get("maxwidth") ?? "1200", 10);
  const maxwidth = Number.isFinite(widthRaw) ? Math.max(200, Math.min(widthRaw, 1600)) : 1200;
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim() ?? "";

  if (!ref) {
    return NextResponse.json({ error: "ref required" }, { status: 400 });
  }
  if (!key) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY is missing" }, { status: 400 });
  }

  const qs = new URLSearchParams({
    maxwidth: String(maxwidth),
    photo_reference: ref,
    key,
  });

  try {
    const googleRes = await fetch(`https://maps.googleapis.com/maps/api/place/photo?${qs.toString()}`, {
      redirect: "follow",
      cache: "no-store",
    });

    if (!googleRes.ok) {
      return NextResponse.json({ error: `Google photo failed: ${googleRes.status}` }, { status: 502 });
    }

    const contentType = googleRes.headers.get("content-type") ?? "image/jpeg";
    const body = await googleRes.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not fetch photo" },
      { status: 502 }
    );
  }
}
