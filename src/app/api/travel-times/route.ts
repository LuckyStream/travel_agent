import { NextResponse } from "next/server";
import { buildItineraryLegs, itineraryLegKey } from "@/lib/itinerary-legs";
import {
  estimateDriveDurationFromStraightLineMeters,
  formatDistanceKm,
  formatDuration,
  haversineMeters,
} from "@/lib/travel-time-estimate";
import type { ItineraryItem } from "@/lib/types";

type LegResult = {
  key: string;
  fromId: string;
  toId: string;
  durationSeconds: number;
  distanceMeters: number;
  durationLabel: string;
  distanceLabel: string;
  source: "google" | "estimate";
  /** True when stops are very close; time is walking pace, not driving. */
  nearby?: boolean;
};

function coordsUsable(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
}

async function googleMatrixLeg(
  apiKey: string,
  from: ItineraryItem,
  to: ItineraryItem
): Promise<{ durationSec: number; distanceM: number } | null> {
  const origin =
    from.address?.trim() ||
    (coordsUsable(from.lat, from.lng) ? `${from.lat},${from.lng}` : "");
  const destination =
    to.address?.trim() || (coordsUsable(to.lat, to.lng) ? `${to.lat},${to.lng}` : "");
  if (!origin || !destination) return null;

  const params = new URLSearchParams({
    origins: origin,
    destinations: destination,
    mode: "driving",
    units: "metric",
    key: apiKey,
  });
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    status?: string;
    error_message?: string;
    rows?: { elements?: { status?: string; duration?: { value?: number }; distance?: { value?: number } }[] }[];
  };
  if (data.status !== "OK") return null;
  const el = data.rows?.[0]?.elements?.[0];
  if (!el || el.status !== "OK") return null;
  const durationSec = el.duration?.value;
  const distanceM = el.distance?.value;
  if (typeof durationSec !== "number" || typeof distanceM !== "number") return null;
  return { durationSec, distanceM };
}

const BATCH = 8;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { items?: ItineraryItem[] };
    const items = body.items;
    if (!Array.isArray(items) || !items.length) {
      return NextResponse.json({ error: "items array required" }, { status: 400 });
    }

    const legs = buildItineraryLegs(items);
    const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim() ?? "";

    const results: LegResult[] = [];

    for (let i = 0; i < legs.length; i += BATCH) {
      const chunk = legs.slice(i, i + BATCH);
      const settled = await Promise.all(
        chunk.map(async ({ from, to }) => {
          const key = itineraryLegKey(from.id, to.id);
          const okFrom = coordsUsable(from.lat, from.lng);
          const okTo = coordsUsable(to.lat, to.lng);
          if (!okFrom || !okTo) {
            return null;
          }

          const straightM = haversineMeters(from.lat, from.lng, to.lat, to.lng);
          if (straightM < 80) {
            const durationSeconds = Math.max(60, Math.round(straightM / 1.4));
            return {
              key,
              fromId: from.id,
              toId: to.id,
              durationSeconds,
              distanceMeters: straightM,
              durationLabel: formatDuration(durationSeconds),
              distanceLabel: formatDistanceKm(straightM),
              source: "estimate" as const,
              nearby: true,
            };
          }

          if (apiKey) {
            const g = await googleMatrixLeg(apiKey, from, to);
            if (g) {
              return {
                key,
                fromId: from.id,
                toId: to.id,
                durationSeconds: g.durationSec,
                distanceMeters: g.distanceM,
                durationLabel: formatDuration(g.durationSec),
                distanceLabel: formatDistanceKm(g.distanceM),
                source: "google" as const,
              };
            }
          }

          const durationSeconds = estimateDriveDurationFromStraightLineMeters(straightM);
          return {
            key,
            fromId: from.id,
            toId: to.id,
            durationSeconds,
            distanceMeters: straightM,
            durationLabel: formatDuration(durationSeconds),
            distanceLabel: formatDistanceKm(straightM),
            source: "estimate" as const,
          };
        })
      );

      for (const r of settled) {
        if (r) results.push(r);
      }
    }

    return NextResponse.json({ legs: results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "travel-times failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
