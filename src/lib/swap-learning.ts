import type { ItineraryItem } from "@/lib/types";

/** Heuristic categories from the stop the user replaced. */
export function hintFromSwappedItem(item: ItineraryItem): string | null {
  const text = `${item.name} ${item.description}`.toLowerCase();
  const name = item.name.trim();

  if (
    /\bmuseum\b|gallery|art institute|contemporary art|\bica\b|\bmfa\b|fine arts|exhibition hall/i.test(
      text
    )
  ) {
    return `User swapped away a museum/gallery-type stop ("${name}"). Prefer non-museum sightseeing when the verified list allows.`;
  }
  if (/\bchurch\b|cathedral|basilica|chapel\b|mosque|synagogue|shrine/i.test(text)) {
    return `User swapped away a religious heritage site ("${name}"). Use lighter-touch heritage options if similar stops feel repetitive.`;
  }
  if (
    item.timeSlot === "morning_destination" ||
    item.timeSlot === "afternoon_destination"
  ) {
    if (/\bmemorial\b|cemetery|graveyard/i.test(text)) {
      return `User swapped away a memorial/cemetery-type stop ("${name}").`;
    }
  }
  return null;
}

export function countMuseumSwapHints(hints: string[]): number {
  return hints.filter((h) => /museum|gallery|art institute|contemporary art|fine arts/i.test(h)).length;
}

const STRONG_MUSEUM =
  "Strong preference: user removed multiple museum/gallery stops — prioritize parks, waterfront walks, neighborhoods, markets, or non-museum landmarks from the verified list.";

export function withStrongMuseumPreference(hints: string[]): string[] {
  if (countMuseumSwapHints(hints) < 2) return hints;
  if (hints.some((h) => h.startsWith("Strong preference: user removed multiple museum"))) return hints;
  return [...hints, STRONG_MUSEUM].slice(-25);
}
