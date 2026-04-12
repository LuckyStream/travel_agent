import { NextResponse } from "next/server";
import { enrichItemCoordinates } from "@/lib/geocode";
import { normalizeItinerary } from "@/lib/itinerary-schema";
import { parseJsonLoose } from "@/lib/json-utils";
import { ollamaChat } from "@/lib/ollama";
import type { ItineraryItem, TripPreferences } from "@/lib/types";

const SWAP_SYSTEM = `You replace one itinerary activity. Output **only valid JSON** — no markdown.

Return a JSON **array** with exactly **1** day-shaped object. Include **only one** of these slot keys (the one being replaced), using **exact snake_case**:
- "morning_destination" | "lunch" | "afternoon_destination" | "dinner" | "evening_activity"

Shape example:
{ "day": <number>, "lunch": { "name", "description", "lat", "lng", "rating", "reviewCount" } }

Include "rating" (number 0–5) and "reviewCount" (integer) when known; otherwise use null.

The slot must match the user's request (same type of activity: e.g. lunch → another restaurant). Day must match the item's day. Prefer a real, verifiable alternative near the same trip context.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      item?: ItineraryItem;
      preferences?: TripPreferences;
      itinerarySummary?: string;
    };
    const item = body.item;
    const prefs = body.preferences;
    if (!item?.name || !prefs?.destination?.trim()) {
      return NextResponse.json({ error: "item and preferences.destination required" }, { status: 400 });
    }

    const summary =
      body.itinerarySummary?.trim() ||
      `Trip to ${prefs.destination}; budget ${prefs.budget}; interests: ${prefs.interests.join(", ")}`;

    const avoidBlock =
      prefs.swapAvoidHints?.length ?
        `\n\n### Personalization — honor when possible\n${prefs.swapAvoidHints.map((h) => `- ${h}`).join("\n")}\nPick a replacement that **does not** repeat categories the user clearly rejected (e.g. if they removed museums, prefer a park, market, walk, or non-museum POI).`
      : "";

    const userPrompt = `Destination: ${prefs.destination}
Budget: ${prefs.budget}
Accommodation styles: ${prefs.hotelStyles?.join(", ") || "any"}
Interests: ${prefs.interests.join(", ")}
Dining: ${prefs.dining.join(", ")}
Priorities: ${prefs.priorityOrder.join(" > ")}
${avoidBlock}

Current plan summary:
${summary}

Replace this activity (same day ${item.day}, slot ${item.timeSlot}):
Name: ${item.name}
Description: ${item.description}

Suggest **one** alternative that fits the trip and is noticeably different from the current pick.
Do not reuse any venue that already appears in the current plan summary.`;

    const raw = await ollamaChat(
      [
        { role: "system", content: SWAP_SYSTEM },
        { role: "user", content: userPrompt },
      ],
      { format: "json", temperature: 0.65 }
    );

    let parsed: unknown;
    try {
      parsed = parseJsonLoose(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON from model" }, { status: 502 });
    }

    const normalized = normalizeItinerary(
      Array.isArray(parsed) ? parsed : [parsed],
      prefs.destination.trim()
    );
    const replacement = normalized.find(
      (n) => n.day === item.day && n.timeSlot === item.timeSlot
    );

    if (!replacement) {
      return NextResponse.json({ error: "Could not extract replacement activity" }, { status: 502 });
    }

    const merged: ItineraryItem = {
      ...replacement,
      id: item.id,
    };

    const forGeo = [
      {
        name: merged.name,
        lat: merged.lat,
        lng: merged.lng,
        destinationHint: prefs.destination.trim(),
        address: merged.address ?? null,
        placeId: merged.placeId ?? null,
      },
    ];
    const placesKey = process.env.GOOGLE_PLACES_API_KEY?.trim() ?? "";
    await enrichItemCoordinates(forGeo, {
      googlePlacesApiKey: placesKey || undefined,
    });

    const result: ItineraryItem = {
      ...merged,
      lat: forGeo[0].lat,
      lng: forGeo[0].lng,
      address: forGeo[0].address ?? merged.address ?? null,
      placeId: forGeo[0].placeId ?? merged.placeId ?? null,
    };

    return NextResponse.json({ item: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Swap failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
