"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Clock3,
  Coffee,
  Download,
  MapPinned,
  MoonStar,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { ItineraryMap } from "@/components/ItineraryMap";
import { SiteHeader } from "@/components/SiteHeader";
import { loadTrip, updateTripItems, updateTripPreferences } from "@/lib/session-trip";
import { appendPersistentSwapHints, mergeSwapHintsForApi } from "@/lib/swap-hints-storage";
import { hintFromSwappedItem, withStrongMuseumPreference } from "@/lib/swap-learning";
import { itineraryLegKey } from "@/lib/itinerary-legs";
import {
  clampTripDays,
  timeSlotOrderIndex,
  type ItineraryItem,
  type TripPreferences,
} from "@/lib/types";

type TravelLegInfo = {
  durationLabel: string;
  distanceLabel: string;
  source: "google" | "estimate";
  nearby?: boolean;
};

type PlacePhotosResponse = {
  photos?: string[];
  placeName?: string;
  error?: string;
};

const SLOT_LABEL: Record<string, string> = {
  morning_destination: "Morning destination",
  lunch: "Lunch",
  afternoon_destination: "Afternoon destination",
  dinner: "Dinner",
  evening_activity: "Evening activity",
  morning: "Morning destination",
  afternoon: "Afternoon destination",
  evening: "Evening activity",
};

function slotTitle(slot: string): string {
  return SLOT_LABEL[slot] ?? slot.replace(/_/g, " ");
}

function slotMeta(slot: string): {
  icon: typeof Camera;
  badgeClass: string;
} {
  const normalized = slot.includes("lunch") || slot.includes("dinner") ? "dining" : slot;
  switch (normalized) {
    case "lunch":
    case "dinner":
    case "dining":
      return { icon: UtensilsCrossed, badgeClass: "bg-orange-100 text-orange-700" };
    case "evening_activity":
    case "evening":
      return { icon: MoonStar, badgeClass: "bg-violet-100 text-violet-700" };
    case "morning_destination":
    case "afternoon_destination":
    case "morning":
    case "afternoon":
      return { icon: Camera, badgeClass: "bg-blue-100 text-blue-700" };
    default:
      return { icon: MapPinned, badgeClass: "bg-slate-100 text-slate-700" };
  }
}

function formatReviewCount(n: number): string {
  if (n >= 10_000) return `${Math.round(n / 1000)}k reviews`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k reviews`;
  return `${n} reviews`;
}

function RatingLine({ rating, reviewCount }: { rating?: number | null; reviewCount?: number | null }) {
  const hasRating = rating != null && rating > 0 && Number.isFinite(rating);
  const hasCount = reviewCount != null && reviewCount > 0 && Number.isFinite(reviewCount);
  if (!hasRating && !hasCount) return null;
  return (
    <p className="mt-2 flex flex-wrap items-baseline gap-2 text-sm">
      {hasRating && (
        <span className="font-medium text-amber-200 tabular-nums" title="Google rating">
          {rating!.toFixed(1)}★
        </span>
      )}
      {hasCount && (
        <span className="text-ink-muted">{formatReviewCount(Math.floor(reviewCount!))}</span>
      )}
    </p>
  );
}

function googleMapsHref(item: ItineraryItem, destination: string): string {
  const dest = destination.trim();
  const name = item.name.trim();
  /** Name + destination disambiguates common venue names (e.g. many "Museum of Fine Arts"). */
  const nameInContext = dest ? `${name}, ${dest}` : name;
  const q = encodeURIComponent(nameInContext);

  if (item.placeId?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${encodeURIComponent(item.placeId.trim())}`;
  }

  const hasCoords =
    Number.isFinite(item.lat) &&
    Number.isFinite(item.lng) &&
    !(item.lat === 0 && item.lng === 0);
  if (hasCoords) {
    return `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function AddressLine({ item, destination }: { item: ItineraryItem; destination: string }) {
  const href = googleMapsHref(item, destination);
  return (
    <div className="mt-2 text-sm">
      {item.address?.trim() ? (
        <p className="leading-snug text-ink-muted">{item.address.trim()}</p>
      ) : null}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-1 inline-block text-accent underline decoration-accent/50 underline-offset-2 hover:no-underline"
      >
        Open in Google Maps
      </a>
    </div>
  );
}

function buildSummary(items: ItineraryItem[]): string {
  return items
    .slice(0, 20)
    .map((i) => `Day ${i.day} ${i.timeSlot}: ${i.name}`)
    .join("; ");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function printableRating(item: ItineraryItem): string {
  const parts: string[] = [];
  if (item.rating != null && item.rating > 0 && Number.isFinite(item.rating)) {
    parts.push(`${item.rating.toFixed(1)}★`);
  }
  if (item.reviewCount != null && item.reviewCount > 0 && Number.isFinite(item.reviewCount)) {
    parts.push(formatReviewCount(Math.floor(item.reviewCount)));
  }
  return parts.join(" • ");
}

function buildPrintableItineraryHtml(
  prefs: TripPreferences,
  byDay: [number, ItineraryItem[]][],
  legsByKey: Record<string, TravelLegInfo>
): string {
  const daySections = byDay
    .map(([day, dayItems]) => {
      const itemCards = dayItems
        .map((item, idx) => {
          const mapsHref = googleMapsHref(item, prefs.destination);
          const rating = printableRating(item);
          const travelLine =
            idx > 0
              ? legsByKey[itineraryLegKey(dayItems[idx - 1].id, item.id)]
              : undefined;

          return `
            ${travelLine
              ? `<div class="travel-leg">Travel from ${escapeHtml(dayItems[idx - 1].name)}: ~${escapeHtml(
                  travelLine.durationLabel
                )} • ${escapeHtml(travelLine.distanceLabel)}</div>`
              : ""}
            <article class="stop-card">
              <div class="slot-label">${escapeHtml(slotTitle(item.timeSlot))}</div>
              <h3>${escapeHtml(item.name)}</h3>
              <p class="description">${escapeHtml(item.description)}</p>
              ${rating ? `<p class="meta">${escapeHtml(rating)}</p>` : ""}
              ${item.address?.trim() ? `<p class="address">${escapeHtml(item.address.trim())}</p>` : ""}
              <p class="meta"><a href="${escapeHtml(mapsHref)}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a></p>
            </article>
          `;
        })
        .join("");

      return `
        <section class="day-section">
          <h2>Day ${day}</h2>
          ${itemCards}
        </section>
      `;
    })
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(prefs.destination)} itinerary</title>
    <style>
      :root {
        color-scheme: light;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 40px;
        font-family: "DM Sans", "Helvetica Neue", Arial, sans-serif;
        color: #2f261d;
        background: #f7f2e8;
      }
      .page {
        max-width: 900px;
        margin: 0 auto;
      }
      .header {
        margin-bottom: 28px;
        padding-bottom: 20px;
        border-bottom: 1px solid #d8cdb8;
      }
      .eyebrow {
        margin: 0 0 10px;
        font-size: 12px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #8c7a52;
      }
      h1 {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 42px;
        font-style: italic;
        line-height: 1.1;
      }
      .summary {
        margin-top: 14px;
        font-size: 14px;
        color: #5d5141;
      }
      .summary strong {
        color: #2f261d;
      }
      .day-section {
        margin-top: 26px;
      }
      h2 {
        margin: 0 0 14px;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 28px;
        font-style: italic;
      }
      .stop-card {
        margin-bottom: 14px;
        padding: 18px 20px;
        border: 1px solid #d8cdb8;
        border-radius: 18px;
        background: #fffdfa;
        page-break-inside: avoid;
      }
      .slot-label {
        margin-bottom: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #8c7a52;
      }
      h3 {
        margin: 0 0 8px;
        font-size: 22px;
      }
      .description,
      .address,
      .meta {
        margin: 0 0 8px;
        font-size: 14px;
        line-height: 1.55;
        color: #5d5141;
      }
      .travel-leg {
        margin: 0 0 10px;
        padding-left: 4px;
        font-size: 13px;
        color: #6e614d;
      }
      a {
        color: #2686c7;
        text-decoration: underline;
      }
      @media print {
        body {
          padding: 18px;
          background: #ffffff;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <header class="header">
        <p class="eyebrow">Travel Itinerary</p>
        <h1>${escapeHtml(prefs.destination)}</h1>
        <div class="summary">
          <div><strong>Days:</strong> ${clampTripDays(prefs.tripDays)}</div>
          <div><strong>Budget:</strong> ${escapeHtml(prefs.budget)}</div>
          ${prefs.hotelStyles?.length ? `<div><strong>Stay style:</strong> ${escapeHtml(prefs.hotelStyles.join(", "))}</div>` : ""}
          <div><strong>Interests:</strong> ${escapeHtml(prefs.interests.join(", ") || "general")}</div>
        </div>
      </header>
      ${daySections}
    </main>
    <script>
      window.onload = () => {
        window.print();
      };
    </script>
  </body>
</html>`;
}

function BetweenStopsRow({
  prev,
  next,
  leg,
  loading,
}: {
  prev: ItineraryItem;
  next: ItineraryItem;
  leg: TravelLegInfo | undefined;
  loading: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 border-l-2 border-dashed border-[#d8d0c2] py-2 pl-4 text-sm text-[#111111]"
      aria-label={`Travel from ${prev.name} to ${next.name}`}
    >
      <span className="shrink-0 text-lg" aria-hidden>
        ↓
      </span>
      <div className="min-w-0 flex-1">
        {loading ? (
          <p className="animate-pulse text-[#111111]">Estimating travel time…</p>
        ) : leg ? (
          <p className="text-[#111111]">
            <span className="font-medium text-[#111111]">~{leg.durationLabel}</span>
            <span className="mx-1.5 text-[#111111]">·</span>
            {leg.distanceLabel}
            <span className="ml-1.5 text-xs text-[#111111]">
              {leg.nearby
                ? "(short walk)"
                : leg.source === "google"
                  ? "(driving)"
                  : "(estimated drive)"}
            </span>
          </p>
        ) : (
          <p className="text-xs text-[#111111]">
            Travel time unavailable — check that both stops have map locations.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ItineraryPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<TripPreferences | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [activeDay, setActiveDay] = useState(1);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [swapLoading, setSwapLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [legsByKey, setLegsByKey] = useState<Record<string, TravelLegInfo>>({});
  const [legsLoading, setLegsLoading] = useState(false);
  const [legsError, setLegsError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState<string | null>(null);
  const [photoLightboxUrl, setPhotoLightboxUrl] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const coordsRepairAttemptedRef = useRef(false);

  useEffect(() => {
    const trip = loadTrip();
    if (!trip?.items?.length || !trip.preferences?.destination) {
      router.replace("/");
      return;
    }
    setPrefs(trip.preferences);
    setItems(trip.items);
  }, [router]);

  useEffect(() => {
    const dest = prefs?.destination?.trim();
    if (!dest || !items.length || coordsRepairAttemptedRef.current) return;

    const needsCoords = items.some((it) => {
      const lat = typeof it.lat === "number" ? it.lat : Number.parseFloat(String(it.lat));
      const lng = typeof it.lng === "number" ? it.lng : Number.parseFloat(String(it.lng));
      return (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        (lat === 0 && lng === 0)
      );
    });

    coordsRepairAttemptedRef.current = true;
    if (!needsCoords) return;

    void (async () => {
      try {
        const res = await fetch("/api/itinerary-fill-coords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, destination: dest }),
        });
        const data = (await res.json()) as { items?: ItineraryItem[]; error?: string };
        if (!res.ok || !data.items?.length) return;
        setItems(data.items);
        updateTripItems(data.items);
      } catch {
        /* ignore */
      }
    })();
  }, [prefs, items]);

  useEffect(() => {
    if (!items.length) return;
    const ctrl = new AbortController();
    setLegsLoading(true);
    setLegsError(null);
    setLegsByKey({});
    void (async () => {
      try {
        const res = await fetch("/api/travel-times", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
          signal: ctrl.signal,
        });
        const data = (await res.json()) as {
          legs?: {
            key: string;
            durationLabel: string;
            distanceLabel: string;
            source: "google" | "estimate";
            nearby?: boolean;
          }[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Could not load travel times");
        const next: Record<string, TravelLegInfo> = {};
        for (const L of data.legs ?? []) {
          next[L.key] = {
            durationLabel: L.durationLabel,
            distanceLabel: L.distanceLabel,
            source: L.source,
            ...(L.nearby ? { nearby: true } : {}),
          };
        }
        if (!ctrl.signal.aborted) setLegsByKey(next);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        if (!ctrl.signal.aborted) {
          setLegsError(e instanceof Error ? e.message : "Could not load travel times");
          setLegsByKey({});
        }
      } finally {
        if (!ctrl.signal.aborted) setLegsLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [items]);

  const byDay = useMemo<[number, ItineraryItem[]][]>(() => {
    const days = new Map<number, ItineraryItem[]>();
    for (const it of items) {
      const list = days.get(it.day) ?? [];
      list.push(it);
      days.set(it.day, list);
    }
    for (const [, list] of days) {
      list.sort((a, b) => timeSlotOrderIndex(a.timeSlot) - timeSlotOrderIndex(b.timeSlot));
    }
    return [...days.entries()].sort((a, b) => a[0] - b[0]);
  }, [items]);

  useEffect(() => {
    if (!byDay.length) return;
    if (!byDay.some(([day]) => day === activeDay)) {
      setActiveDay(byDay[0][0]);
    }
  }, [activeDay, byDay]);

  const activeDayItems = useMemo(
    () => byDay.find(([day]) => day === activeDay)?.[1] ?? [],
    [activeDay, byDay]
  );

  const selectedItem = useMemo<ItineraryItem | null>(() => {
    if (focusedId) {
      const found = items.find((it) => it.id === focusedId);
      if (found) return found;
    }
    return activeDayItems[0] ?? items[0] ?? null;
  }, [activeDayItems, focusedId, items]);

  useEffect(() => {
    const placeId = selectedItem?.placeId?.trim();
    if (!placeId) {
      setPhotoUrls([]);
      setPhotosError(null);
      setPhotosLoading(false);
      return;
    }

    const ctrl = new AbortController();
    setPhotosLoading(true);
    setPhotosError(null);

    void (async () => {
      try {
        const res = await fetch(`/api/place-photos?placeId=${encodeURIComponent(placeId)}&limit=4`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as PlacePhotosResponse;
        if (!res.ok) throw new Error(data.error ?? "Could not load place photos");
        if (!ctrl.signal.aborted) {
          setPhotoUrls(data.photos ?? []);
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        if (!ctrl.signal.aborted) {
          setPhotoUrls([]);
          setPhotosError(e instanceof Error ? e.message : "Could not load place photos");
        }
      } finally {
        if (!ctrl.signal.aborted) setPhotosLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [selectedItem?.placeId]);

  useEffect(() => {
    if (!photoLightboxUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPhotoLightboxUrl(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photoLightboxUrl]);

  const exportPdf = useCallback(() => {
    if (!prefs || !byDay.length) return;
    const html = buildPrintableItineraryHtml(prefs, byDay, legsByKey);
    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.setAttribute("aria-hidden", "true");
    document.body.appendChild(frame);

    const cleanup = () => {
      window.setTimeout(() => {
        frame.remove();
      }, 1000);
    };

    frame.onload = () => {
      const win = frame.contentWindow;
      if (!win) {
        cleanup();
        setError("Could not start PDF export.");
        return;
      }
      win.focus();
      win.print();
      cleanup();
    };

    const doc = frame.contentDocument;
    if (!doc) {
      cleanup();
      setError("Could not start PDF export.");
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();
  }, [byDay, legsByKey, prefs]);

  const swapItem = useCallback(
    async (item: ItineraryItem) => {
      if (!prefs) return;
      setError(null);
      setSwapLoading(item.id);
      try {
        const res = await fetch("/api/swap-item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item,
            preferences: mergeSwapHintsForApi(prefs),
            itinerarySummary: buildSummary(items),
          }),
        });
        const data = (await res.json()) as { item?: ItineraryItem; error?: string };
        if (!res.ok || !data.item) throw new Error(data.error ?? "Swap failed");
        const next = items.map((i) => (i.id === item.id ? data.item! : i));
        setItems(next);
        updateTripItems(next);

        const hint = hintFromSwappedItem(item);
        const baseHints = [...new Set([...(prefs.swapAvoidHints ?? []), ...(hint ? [hint] : [])])];
        const nextHints = withStrongMuseumPreference(baseHints);
        appendPersistentSwapHints(nextHints);
        const newPrefs = { ...prefs, swapAvoidHints: nextHints };
        setPrefs(newPrefs);
        updateTripPreferences(newPrefs);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Swap failed");
      } finally {
        setSwapLoading(null);
      }
    },
    [items, prefs]
  );

  useEffect(() => {
    if (!focusedId) return;
    const el = itemRefs.current[focusedId];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusedId]);

  if (!prefs) {
    return (
      <div className="min-h-screen bg-[#0a0e12]">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-ink-muted">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-cream">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="text-sm text-muted-foreground transition hover:text-foreground">
              ← New itinerary
            </Link>
            <h1 className="mt-3 font-display text-4xl font-bold italic text-foreground md:text-5xl">
              {prefs.destination}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {clampTripDays(prefs.tripDays)}-day itinerary powered by your recommendation system
            </p>
          </div>
          <button
            type="button"
            onClick={exportPdf}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-coral/40 bg-coral/10 p-3 text-sm text-coral">
            {error}
          </p>
        )}
        {legsError && (
          <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700">
            {legsError}
          </p>
        )}

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {byDay.map(([day]) => (
            <button
              key={day}
              type="button"
              onClick={() => {
                setActiveDay(day);
                const dayItems = byDay.find(([d]) => d === day)?.[1] ?? [];
                setFocusedId(dayItems[0]?.id ?? null);
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeDay === day
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/30"
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <section className="rounded-[28px] border border-border bg-card/90 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.06)]">
            <h2 className="mb-6 font-display text-2xl font-bold italic text-foreground">
              Day {activeDay}
            </h2>

            <div className="space-y-4">
              {activeDayItems.map((it, idx) => {
                const Icon = slotMeta(it.timeSlot).icon;
                const badgeClass = slotMeta(it.timeSlot).badgeClass;
                return (
                  <div key={it.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${badgeClass}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {idx < activeDayItems.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
                    </div>

                    <div className="flex-1 space-y-2">
                      {idx > 0 && (
                        <BetweenStopsRow
                          prev={activeDayItems[idx - 1]}
                          next={it}
                          leg={legsByKey[itineraryLegKey(activeDayItems[idx - 1].id, it.id)]}
                          loading={legsLoading}
                        />
                      )}

                      <div
                        ref={(el: HTMLDivElement | null) => {
                          itemRefs.current[it.id] = el;
                        }}
                        onClick={() => setFocusedId(it.id)}
                        className={`cursor-pointer rounded-2xl border bg-card p-4 transition ${
                          focusedId === it.id
                            ? "border-primary shadow-lg ring-2 ring-primary/20"
                            : "border-border hover:border-foreground/20"
                        }`}
                      >
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                              {slotTitle(it.timeSlot)}
                            </span>
                            <h3 className="font-display text-lg font-bold leading-tight text-foreground">
                              {it.name}
                            </h3>
                          </div>
                          <button
                            type="button"
                            disabled={swapLoading === it.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              void swapItem(it);
                            }}
                            className="rounded-md bg-muted px-3 py-2 text-xs font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                          >
                            {swapLoading === it.id ? "Swapping…" : "Swap"}
                          </button>
                        </div>

                        <p className="text-sm leading-relaxed text-muted-foreground">{it.description}</p>
                        <RatingLine rating={it.rating} reviewCount={it.reviewCount} />
                        <AddressLine item={it} destination={prefs.destination} />

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {slotTitle(it.timeSlot)}
                          </span>
                          {idx > 0 && legsByKey[itineraryLegKey(activeDayItems[idx - 1].id, it.id)] && (
                            <span className="inline-flex items-center gap-1">
                              <Coffee className="h-3.5 w-3.5" />
                              ~{legsByKey[itineraryLegKey(activeDayItems[idx - 1].id, it.id)].durationLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-5 lg:sticky lg:top-6">
            <div className="rounded-[28px] border border-border bg-card/90 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.06)]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Place Photos
              </p>
              <p className="mb-3 text-sm font-medium text-foreground">
                {selectedItem ? selectedItem.name : "Select a stop to preview"}
              </p>
              {photosLoading ? (
                <p className="text-xs text-muted-foreground">Loading photos…</p>
              ) : photosError ? (
                <p className="text-xs text-amber-700">{photosError}</p>
              ) : photoUrls.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {photoUrls.slice(0, 4).map((url, idx) => (
                    <button
                      key={`${url}-${idx}`}
                      type="button"
                      onClick={() => setPhotoLightboxUrl(url)}
                      className="group relative block overflow-hidden rounded-xl ring-offset-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <img
                        src={url}
                        alt={`${selectedItem?.name ?? "Place"} photo ${idx + 1}`}
                        className="h-24 w-full object-cover transition group-hover:scale-105"
                        loading="lazy"
                      />
                      <span className="sr-only">Enlarge photo {idx + 1}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No photos for this stop. Try another item or check Google Places API quota.
                </p>
              )}
              {photoUrls.length > 0 ? (
                <p className="mt-2 text-[11px] text-muted-foreground">Tap a photo to view larger · up to 4 shown</p>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-border bg-card/90 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.06)]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Map
              </p>
              <ItineraryMap
                items={items}
                focusedId={focusedId}
                fallbackDestination={prefs.destination}
                fallbackCenter={
                  prefs.destinationLat != null &&
                  prefs.destinationLng != null &&
                  Number.isFinite(prefs.destinationLat) &&
                  Number.isFinite(prefs.destinationLng) &&
                  !(prefs.destinationLat === 0 && prefs.destinationLng === 0)
                    ? { lat: prefs.destinationLat, lng: prefs.destinationLng }
                    : null
                }
                onSelectPin={(id) => (id ? setFocusedId(id) : undefined)}
              />
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Click a card to focus the map, or tap a pin to jump back to that stop.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {photoLightboxUrl ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          onClick={() => setPhotoLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setPhotoLightboxUrl(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={photoLightboxUrl}
            alt=""
            className="max-h-[min(90vh,900px)] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
