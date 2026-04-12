import { NextResponse } from "next/server";
import { enrichItemCoordinates } from "@/lib/geocode";
import {
  fetchVerifiedPlacesForDestination,
  formatVerifiedPlacesForPrompt,
  GOOGLE_NEARBY_MAX_RADIUS_METERS,
  interestsPreferRegionalSearch,
  type GooglePlaceCandidate,
} from "@/lib/google-places";
import { enforceItineraryToVerifiedCandidates } from "@/lib/enforce-verified-itinerary";
import { swapMorningAfternoonIfShorter } from "@/lib/itinerary-geo-order";
import { replaceOneOutlierStopFromVerifiedList } from "@/lib/itinerary-outlier-replace";
import { normalizeItinerary } from "@/lib/itinerary-schema";
import { parseJsonLoose } from "@/lib/json-utils";
import { ollamaChat } from "@/lib/ollama";
import {
  clampTripDays,
  type ItineraryItem,
  type TripPreferences,
  type TravelCompanion,
  type TravelPace,
  type MorningPreference,
} from "@/lib/types";
import { fetchDestinationSummary } from "@/lib/wikipedia";

function companionPromptLine(companion: string | undefined): string | null {
  if (!companion?.trim()) return null;
  const c = companion.trim() as TravelCompanion;
  const map: Record<string, string> = {
    solo: "solo",
    couple: "a couple",
    family_with_kids: "a family with kids",
    friends_group: "a group of friends",
  };
  const label = map[c] ?? companion.trim();
  if (c === "solo") {
    return `The traveler is going **solo**, so tailor activities accordingly (walkable areas, solo-friendly dining, optional social spots without assuming a group).`;
  }
  return `The traveler is going with **${label}**, so tailor activities accordingly (e.g., romantic or intimate spots for couples, kid-friendly venues and pacing for families, lively or group-friendly options for friends).`;
}

function pacePromptLine(pace: string | undefined): string | null {
  if (!pace?.trim()) return null;
  const p = pace.trim() as TravelPace;
  if (p === "relaxed") {
    return `Travel pace is **relaxed**: aim for roughly **2–3 substantive activities per day** with lots of free time — keep descriptions calm and unhurried; **omit evening_activity** unless it is very low-key. The fixed daily slots still exist, but treat optional slots lightly and emphasize downtime between stops in the prose.`;
  }
  if (p === "moderate") {
    return `Travel pace is **moderate**: about **3–4 activities per day** with balanced downtime — use the main daily slots fully; add **evening_activity** only when it fits without feeling rushed.`;
  }
  if (p === "packed") {
    return `Travel pace is **packed**: aim for **5+ meaningful experiences per day** where realistic — use **morning_destination, lunch, afternoon_destination, dinner, and evening_activity** whenever venues from the verified list support it; still respect geographic clustering and do not invent places.`;
  }
  return `Travel pace preference: **${pace.trim()}** — adjust how dense each day feels in the descriptions and optional evening stops.`;
}

function morningPromptLine(pref: string | undefined): string | null {
  if (!pref?.trim()) return null;
  const m = pref.trim() as MorningPreference;
  if (m === "early_bird") {
    return `The traveler prefers an **early start**: schedule the **first activity of each day around 8:00 AM** (mention this timing in descriptions where helpful).`;
  }
  if (m === "normal") {
    return `The traveler prefers a **normal start**: schedule the **first activity of each day around 10:00 AM**.`;
  }
  if (m === "late_riser") {
    return `The traveler is a **late riser**: schedule the **first activity of each day after 11:00 AM**; keep mornings light in the prose.`;
  }
  return `Morning preference: **${pref.trim()}** — reflect this in suggested timing for the first stop each day.`;
}

function mobilityPromptLine(mobility: TripPreferences["mobility"]): string {
  const m = mobility ?? "walking_transit";
  if (m === "walking_transit") {
    return `**Getting around:** Mostly **walking and public transit** — keep each day's stops **tight** geographically; avoid assuming a private car for hops between venues.`;
  }
  if (m === "rental_car") {
    return `**Getting around:** **Rental car** — same-day plans may include **outer neighborhoods or short out-of-town legs** (~up to ~1 hr drive) when it matches interests; still avoid pointless zig-zags.`;
  }
  return `**Getting around:** **Own car or easy driving** — you may **mix downtown and farther sights** in one day when it improves the route; regional day-trip style stops are acceptable when interests justify them.`;
}

function tripDatePromptLine(tripDate: string | null | undefined, flexibleDates?: boolean): string | null {
  if (flexibleDates && !tripDate?.trim()) {
    return `Trip timing is **flexible** (no fixed month); suggest generally appropriate seasonal ideas without locking to a specific month.`;
  }
  const raw = tripDate?.trim();
  if (!raw) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(raw);
  if (!match) {
    return `Trip is planned for **${raw}** — consider seasonal weather, holidays, and local events where relevant.`;
  }
  const y = Number.parseInt(match[1], 10);
  const mo = Number.parseInt(match[2], 10);
  if (!Number.isFinite(y) || mo < 1 || mo > 12) {
    return `Trip is planned for **${raw}** — consider seasonal weather, holidays, and local events where relevant.`;
  }
  const monthName = new Date(y, mo - 1, 1).toLocaleString("en-US", { month: "long" });
  return `The trip is planned for **${monthName} ${y}** — prioritize season-appropriate activities, typical weather, and notable local events or festivals that month.`;
}

function swapLearningPromptLine(prefs: TripPreferences): string | null {
  if (!prefs.swapAvoidHints?.length) return null;
  return `**Personalization (from swaps):** The traveler replaced stops they did not want. When choosing from the verified list, **avoid repeating those themes** where good alternatives exist:\n${prefs.swapAvoidHints.map((h) => `- ${h}`).join("\n")}`;
}

function buildTravelerContextBlock(prefs: TripPreferences): string {
  const parts = [
    companionPromptLine(prefs.travelCompanion),
    pacePromptLine(prefs.travelPace),
    morningPromptLine(prefs.morningPreference),
    mobilityPromptLine(prefs.mobility),
    tripDatePromptLine(prefs.tripDate ?? null, prefs.flexibleDates),
    swapLearningPromptLine(prefs),
  ].filter(Boolean) as string[];
  if (!parts.length) return "";
  return `\n### Traveler context\n${parts.join("\n")}\n`;
}

function normalizePlanPreferences(raw: TripPreferences): TripPreferences {
  const interests =
    Array.isArray(raw.interests) && raw.interests.length > 0
      ? raw.interests
      : (["food", "history"] as TripPreferences["interests"]);
  const dining =
    Array.isArray(raw.dining) && raw.dining.length > 0
      ? raw.dining
      : (["local cuisine"] as TripPreferences["dining"]);
  const priorityOrder =
    Array.isArray(raw.priorityOrder) && raw.priorityOrder.length > 0
      ? raw.priorityOrder
      : (["sightseeing", "food", "shopping", "relaxation"] as TripPreferences["priorityOrder"]);
  return {
    ...raw,
    budget: raw.budget ?? "medium",
    interests: [...interests],
    dining: [...dining],
    priorityOrder: [...priorityOrder],
  };
}

function buildPlanSystem(dayCount: number): string {
  const plural = dayCount === 1 ? "" : "s";
  const dayRange =
    dayCount === 1 ? "1" : dayCount === 2 ? "1 or 2" : `1 through ${dayCount}`;
  return `You are an expert travel planner. Output **only valid JSON** — no markdown, no code fences, no explanation.

Return exactly **${dayCount}** day object${plural}. You may use EITHER:
A) A top-level JSON **array** of ${dayCount} object${plural}, OR
B) A JSON object with a key "days" whose value is that array.

Each day object must have:
- "day": integer ${dayRange}
- These **exact snake_case keys** (each value is an object):
  - "morning_destination": sightseeing / attraction / park (not a meal).
  - "lunch": **restaurant or café**.
  - "afternoon_destination": place to visit.
  - "dinner": **restaurant**.
  - "evening_activity": optional — omit the key or use null if none; otherwise bar, night market, show, etc.

Each slot object MUST have:
  - "placeId": string — **primary key.** Copy the **exact** \`placeId:\` value from one line in the verified list. Do **not** shorten, alter, or invent IDs; invalid IDs are removed server-side and the stop may be reassigned.
  - "name": string — **exact** same spelling as that same list line (the venue name in quotes).
  - "description": string — **include the Google rating and review count** in the prose (e.g. "4.6★, 1,240 reviews") plus a short useful line (cuisine, vibe, or what to see).
  - "address": string (copy from that list line)
  - "rating": number (1–5, from that list line)
  - "reviewCount": integer (non‑negative, from that list line)
  - "lat" and "lng": optional numbers — if omitted, the server fills them from the verified list using **placeId**. If you include them, they must match the list exactly; otherwise omit them.

**Choose from the following verified places only.** Do **not** invent venues, **placeId** values, coordinates, ratings, or review counts. Use only entries under "Verified places" in the user message. If nothing fits a slot perfectly, pick the closest real option from the same list.

**Group activities geographically by day.** Each day's morning visit, lunch, afternoon visit, dinner, and optional evening stop should form a **sensible tour**: consecutive stops should usually be **walkable or a short drive** apart. **Avoid zig-zags** (e.g. downtown → far suburb → back downtown the same day). If you pick a major museum or site that is far from the lunch neighborhood, place it when it fits the **flow** (often **morning** before crossing the city, or use a **different day** for that side of town). **Do not** sandwich one distant stop between clusters of nearby stops unless unavoidable.`;
}

function buildUserPrompt(
  prefs: TripPreferences,
  dayCount: number,
  wiki: string | null,
  verifiedPlacesText: string,
  regionalNatureHint: boolean,
  refinementContext: string
): string {
  const wikiBlock = wiki ? `\nDestination context (Wikipedia):\n${wiki}\n` : "";
  const kmApprox = Math.round(GOOGLE_NEARBY_MAX_RADIUS_METERS / 1000);
  const regionalBlock = regionalNatureHint
    ? `\nRegional / outdoor coverage: The user selected **nature, adventure, and/or relaxation**. For those interests, include **nearby natural attractions** that could reasonably be reached within about **one hour's driving time** from the city — not only dense city-center spots. Verified place searches for those themes used up to **~${kmApprox} km** from the destination center (Google Places API limit).\n`
    : `\nUrban coverage: Shopping, dining, nightlife, and most history venues use a **~15 km** search radius from the destination center.\n`;
  const dayLabel = dayCount === 1 ? "1 day" : `${dayCount} days`;
  const daysWord = dayCount === 1 ? "one logical day" : `${dayCount} logical days`;
  const uniquenessBlock = `\nUniqueness rule: **Never reuse the same venue anywhere in the trip.** A place may appear at most once across all days and all slots. If you need more variety, choose another verified venue rather than repeating one already used.`;
  const travelerBlock = buildTravelerContextBlock(prefs);
  const refineBlock = refinementContext.trim()
    ? `\n### Chat refinements\nAfter locking their profile, the traveler continued in chat. Reflect these wishes when choosing venues and tone (without breaking the verified-places rule):\n${refinementContext.trim()}\n`
    : "";

  return `Plan a ${dayLabel} trip.

Destination: ${prefs.destination}
Budget: ${prefs.budget}
Accommodation styles: ${prefs.hotelStyles?.join(", ") || "any"}
Interests: ${prefs.interests.join(", ") || "general"}
Dining preferences: ${prefs.dining.join(", ") || "any"}
Priority order (highest first): ${prefs.priorityOrder.join(" > ")}
Timing: ${prefs.flexibleDates ? "Flexible dates" : prefs.startDate ? `Start on ${prefs.startDate}` : "No specific date provided"}
${travelerBlock}${wikiBlock}
${regionalBlock}
${uniquenessBlock}${refineBlock}
### Verified places (Google Places — select and arrange ONLY from this list)
Rules: **placeId** must match one \`placeId:\` below verbatim. **name** must match the quoted name on that same line. You may omit **lat**/**lng** per slot; the server resolves coordinates from **placeId**.

${verifiedPlacesText}

Respect budget and priorities. Build ${daysWord} with **tight geographic routing** per day: the path morning → lunch → afternoon → dinner should read like one continuous area or a logical one-way move, not alternating ends of the city.`;
}

async function generatePlanJson(
  prefs: TripPreferences,
  dayCount: number,
  wiki: string | null,
  verifiedPlacesText: string,
  regionalNatureHint: boolean,
  refinementContext: string
): Promise<string> {
  return ollamaChat(
    [
      { role: "system", content: buildPlanSystem(dayCount) },
      {
        role: "user",
        content: buildUserPrompt(
          prefs,
          dayCount,
          wiki,
          verifiedPlacesText,
          regionalNatureHint,
          refinementContext
        ),
      },
    ],
    { format: "json", temperature: 0.45 }
  );
}

export async function POST(req: Request) {
  try {
    const rawBody = (await req.json()) as TripPreferences & { refinementContext?: unknown };
    const refinementContext =
      typeof rawBody.refinementContext === "string" ? rawBody.refinementContext.trim() : "";
    const { refinementContext: _drop, ...rawPrefs } = rawBody;
    void _drop;
    if (!rawPrefs?.destination?.trim()) {
      return NextResponse.json({ error: "destination required" }, { status: 400 });
    }

    const prefs = normalizePlanPreferences(rawPrefs as TripPreferences);
    const dayCount = clampTripDays(prefs.tripDays);
    const prefsWithDays: TripPreferences = { ...prefs, tripDays: dayCount };

    const dest = prefs.destination.trim();
    const placesKey = process.env.GOOGLE_PLACES_API_KEY?.trim() ?? "";

    let verifiedPlacesText: string;
    let verifiedCandidates: GooglePlaceCandidate[] = [];
    if (placesKey) {
      try {
        verifiedCandidates = await fetchVerifiedPlacesForDestination(
          dest,
          prefs.interests,
          prefs.dining,
          placesKey
        );
        verifiedPlacesText = formatVerifiedPlacesForPrompt(verifiedCandidates);
      } catch (e) {
        verifiedCandidates = [];
        verifiedPlacesText = `(Google Places request failed: ${e instanceof Error ? e.message : "unknown error"}. Use conservative, well-known real venues only and plausible coordinates near ${dest}.)`;
      }
    } else {
      verifiedPlacesText =
        "(No GOOGLE_PLACES_API_KEY — no verified list. Prefer widely known real venues near the destination with realistic coordinates, ratings, and review counts if you must infer.)";
    }

    const regionalNatureHint = interestsPreferRegionalSearch(prefs.interests);
    const wiki = await fetchDestinationSummary(dest);

    let parsed: unknown;
    try {
      const rawJson = await generatePlanJson(
        prefsWithDays,
        dayCount,
        wiki,
        verifiedPlacesText,
        regionalNatureHint,
        refinementContext
      );
      parsed = parseJsonLoose(rawJson);
      if (typeof parsed === "string") {
        parsed = parseJsonLoose(parsed);
      }
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const w = parsed as Record<string, unknown>;
        for (const k of ["json", "data", "output", "text", "content", "itinerary_json"]) {
          const inner = w[k];
          if (typeof inner === "string" && /[\[{]/.test(inner.trim())) {
            try {
              parsed = parseJsonLoose(inner);
              break;
            } catch {
              /* keep outer */
            }
          }
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not parse LLM response as JSON. Try again or use a model with strong JSON mode.";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    let items: ItineraryItem[] = normalizeItinerary(parsed, dest);

    if (!items.length) {
      return NextResponse.json(
        { error: "Itinerary structure was invalid. Try generating again." },
        { status: 502 }
      );
    }

    const pinnedNames = enforceItineraryToVerifiedCandidates(items, verifiedCandidates);

    const forGeo = items.map((it) => ({
      name: it.name,
      lat: it.lat,
      lng: it.lng,
      destinationHint: dest,
      address: it.address ?? null,
      placeId: it.placeId ?? null,
    }));
    await enrichItemCoordinates(forGeo, {
      googlePlacesApiKey: placesKey || undefined,
      skipFindPlaceForNormalizedNames: pinnedNames,
    });
    items = items.map((it, i) => ({
      ...it,
      lat: forGeo[i].lat,
      lng: forGeo[i].lng,
      address: forGeo[i].address ?? it.address ?? null,
      placeId: forGeo[i].placeId ?? it.placeId ?? null,
    }));

    swapMorningAfternoonIfShorter(items);

    if (verifiedCandidates.length > 0) {
      replaceOneOutlierStopFromVerifiedList(items, verifiedCandidates);
      replaceOneOutlierStopFromVerifiedList(items, verifiedCandidates);
    }

    return NextResponse.json({ items, preferences: prefsWithDays });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Plan generation failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
