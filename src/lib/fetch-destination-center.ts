/**
 * Client-side: resolve destination label to lat/lng via server Geocoding (same key as plan generation).
 */
export async function fetchDestinationCenter(
  query: string
): Promise<{ lat: number; lng: number } | null> {
  const q = query.trim();
  if (!q) return null;
  try {
    const res = await fetch("/api/destination-center", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    });
    const data = (await res.json()) as { lat?: number; lng?: number; error?: string };
    if (!res.ok || typeof data.lat !== "number" || typeof data.lng !== "number") return null;
    return { lat: data.lat, lng: data.lng };
  } catch {
    return null;
  }
}
