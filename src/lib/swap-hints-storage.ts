import type { TripPreferences } from "@/lib/types";
import { withStrongMuseumPreference } from "@/lib/swap-learning";

const KEY = "wanderlust-swap-avoid-hints";

export function loadPersistentSwapHints(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function appendPersistentSwapHints(newHints: string[]): void {
  if (typeof window === "undefined" || !newHints.length) return;
  const cur = loadPersistentSwapHints();
  const next = [...cur];
  for (const h of newHints) {
    if (h && !next.includes(h)) next.push(h);
  }
  sessionStorage.setItem(KEY, JSON.stringify(next.slice(-22)));
}

/** Merge trip prefs + session learning for any /api/generate-plan or /api/swap-item call. */
export function mergeSwapHintsForApi(prefs: TripPreferences): TripPreferences {
  const fromTrip = prefs.swapAvoidHints ?? [];
  const persistent = loadPersistentSwapHints();
  const merged = withStrongMuseumPreference(
    [...new Set([...fromTrip, ...persistent])].slice(-25)
  );
  if (!merged.length) return prefs;
  return { ...prefs, swapAvoidHints: merged };
}
