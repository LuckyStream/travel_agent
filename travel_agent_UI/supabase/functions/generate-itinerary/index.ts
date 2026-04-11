import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination, days, preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prefTags = Array.isArray(preferences) && preferences.length > 0
      ? `\nTravel style preferences: ${preferences.join(", ")}`
      : "";

    const systemPrompt = `You are a world-class travel planner. Return ONLY valid JSON (no markdown, no code fences).

The JSON must be an array of day objects with this exact structure:
[
  {
    "day": 1,
    "title": "Exploring Old Town",
    "stops": [
      {
        "time": "09:00",
        "slot": "Morning",
        "name": "Place Name",
        "description": "2-3 sentence description of what to do here.",
        "duration": "2 hours",
        "category": "sightseeing",
        "tip": "Optional insider tip"
      },
      {
        "time": "12:00",
        "slot": "Lunch",
        "name": "Restaurant Name",
        "description": "What to eat here and why it's special.",
        "duration": "1.5 hours",
        "category": "dining",
        "tip": "Try the local speciality"
      },
      {
        "time": "14:00",
        "slot": "Afternoon",
        "name": "Activity or Place",
        "description": "Description of the afternoon activity.",
        "duration": "3 hours",
        "category": "activity"
      },
      {
        "time": "19:00",
        "slot": "Dinner",
        "name": "Evening Restaurant",
        "description": "Dinner recommendation.",
        "duration": "2 hours",
        "category": "dining"
      }
    ]
  }
]

Categories: "sightseeing", "dining", "activity", "transport", "accommodation", "nightlife", "shopping"

Include 3-5 stops per day. Make it practical and inspiring.`;

    const userPrompt = `Create a ${days}-day itinerary for ${destination}.${prefTags}

Return ONLY the JSON array, no other text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      const status = response.status === 429 ? 429 : response.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: status === 429 ? "Rate limit exceeded. Please try again." : status === 402 ? "AI credits exhausted." : "Failed to generate itinerary" }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Strip markdown code fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    const itinerary = JSON.parse(content);

    return new Response(JSON.stringify({ itinerary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-itinerary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
