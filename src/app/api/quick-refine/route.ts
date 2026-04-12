import { NextResponse } from "next/server";
import { parseJsonLoose } from "@/lib/json-utils";
import { ollamaChat } from "@/lib/ollama";
import type { TripPreferences } from "@/lib/types";

const SYSTEM = `You are a warm travel assistant. The user completed a short structured quiz; their answers are provided as JSON.

Output **only** valid JSON with this exact shape: {"message": string}

Rules for "message":
- **First reply** (when there are no prior user messages in the thread): Write 2–4 short paragraphs describing the trip they seem to want (place, length, companion, pace, interests, timing). Be specific and friendly. End by inviting them to tweak anything (pace, food, must-sees, things to avoid) or say they are ready to generate.
- **Later replies**: Respond to what they said. Stay under 200 words. Help them clarify changes; the itinerary builder will read this whole conversation. Do **not** output a day-by-day hour-by-hour itinerary here.

Use plain sentences in "message" only — no markdown headings, no bullet markdown.`;

type RefineMsg = { role: "user" | "assistant"; content: string };

function extractMessage(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const message = typeof o.message === "string" ? o.message.trim() : "";
  return message || null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      preferences?: TripPreferences;
      messages?: RefineMsg[];
    };
    const prefs = body.preferences;
    if (!prefs?.destination?.trim()) {
      return NextResponse.json({ error: "preferences.destination required" }, { status: 400 });
    }

    const messages = (body.messages ?? []).filter(
      (m) => m.content?.trim() && (m.role === "user" || m.role === "assistant")
    );

    const profileJson = JSON.stringify(
      {
        destination: prefs.destination.trim(),
        tripDays: prefs.tripDays,
        flexibleDates: prefs.flexibleDates,
        tripDate: prefs.tripDate,
        travelCompanion: prefs.travelCompanion,
        travelPace: prefs.travelPace,
        morningPreference: prefs.morningPreference,
        mobility: prefs.mobility ?? "walking_transit",
        interests: prefs.interests,
        dining: prefs.dining,
        priorityOrder: prefs.priorityOrder,
        budget: prefs.budget,
      },
      null,
      0
    );

    const systemWithProfile = `${SYSTEM}\n\n--- Trip profile (JSON) ---\n${profileJson}`;

    const ollamaMessages =
      messages.length === 0
        ? [
            { role: "system" as const, content: systemWithProfile },
            {
              role: "user" as const,
              content:
                "Describe the trip I seem to want from this profile and invite me to tweak anything or say I'm ready to generate.",
            },
          ]
        : [
            { role: "system" as const, content: systemWithProfile },
            ...messages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content.trim(),
            })),
          ];

    const raw = await ollamaChat(ollamaMessages, { format: "json", temperature: 0.55 });
    let parsed: unknown;
    try {
      parsed = parseJsonLoose(raw);
    } catch {
      return NextResponse.json({ error: "Assistant returned invalid JSON. Try again." }, { status: 502 });
    }

    const message = extractMessage(parsed);
    if (!message) {
      return NextResponse.json({ error: "Assistant JSON missing message" }, { status: 502 });
    }

    return NextResponse.json({ message });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Refine chat failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
