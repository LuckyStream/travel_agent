"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ItineraryMap } from "@/components/ItineraryMap";
import { SiteHeader } from "@/components/SiteHeader";
import { loadTrip, updateTripItems } from "@/lib/session-trip";
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
  if (item.address?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address.trim())}`;
  }
  const hasCoords =
    Number.isFinite(item.lat) &&
    Number.isFinite(item.lng) &&
    !(item.lat === 0 && item.lng === 0);
  if (hasCoords) {
    return `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`;
  }
  const nameQ = encodeURIComponent(item.name.trim());
  if (item.placeId?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${nameQ}&query_place_id=${encodeURIComponent(item.placeId.trim())}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name.trim()}, ${dest}`)}`;
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
      className="flex items-center gap-3 border-l-2 border-dashed border-surface-muted py-2 pl-4 text-sm text-ink-muted"
      aria-label={`Travel from ${prev.name} to ${next.name}`}
    >
      <span className="shrink-0 text-lg" aria-hidden>
        ↓
      </span>
      <div className="min-w-0 flex-1">
        {loading ? (
          <p className="animate-pulse text-ink-muted">Estimating travel time…</p>
        ) : leg ? (
          <p className="text-ink-muted">
            <span className="font-medium text-ink">~{leg.durationLabel}</span>
            <span className="mx-1.5 text-surface-muted">·</span>
            {leg.distanceLabel}
            <span className="ml-1.5 text-xs text-ink-muted/80">
              {leg.nearby
                ? "(short walk)"
                : leg.source === "google"
                  ? "(driving)"
                  : "(estimated drive)"}
            </span>
          </p>
        ) : (
          <p className="text-xs text-ink-muted">
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
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [swapLoading, setSwapLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [legsByKey, setLegsByKey] = useState<Record<string, TravelLegInfo>>({});
  const [legsLoading, setLegsLoading] = useState(false);
  const [legsError, setLegsError] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
            preferences: prefs,
            itinerarySummary: buildSummary(items),
          }),
        });
        const data = (await res.json()) as { item?: ItineraryItem; error?: string };
        if (!res.ok || !data.item) throw new Error(data.error ?? "Swap failed");
        const next = items.map((i) => (i.id === item.id ? data.item! : i));
        setItems(next);
        updateTripItems(next);
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#1e293b_0%,_#0a0e12_55%)]">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">Step 3</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">
          Your itinerary — {prefs.destination}
        </h1>
        <p className="mt-2 text-ink-muted">
          Cards match map pins by day and time. Between stops you will see approximate driving time and
          distance. Swap any activity for an AI-suggested alternative.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_minmax(280px,400px)] lg:items-start">
          <div className="flex flex-col gap-8">
            {error && (
              <p className="rounded-xl border border-coral/40 bg-coral/10 p-3 text-sm text-coral">
                {error}
              </p>
            )}
            {legsError && (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200/90">
                {legsError}
              </p>
            )}

            {byDay.map(([day, list]) => (
              <section key={day}>
                <h2 className="font-display text-xl font-semibold text-ink">Day {day}</h2>
                <div className="mt-4 flex flex-col gap-3">
                  {list.map((it, idx) => (
                    <div key={it.id} className="flex flex-col gap-1">
                      {idx > 0 && (
                        <BetweenStopsRow
                          prev={list[idx - 1]}
                          next={it}
                          leg={legsByKey[itineraryLegKey(list[idx - 1].id, it.id)]}
                          loading={legsLoading}
                        />
                      )}
                      <div
                        ref={(el: HTMLDivElement | null) => {
                          itemRefs.current[it.id] = el;
                        }}
                        onClick={() => setFocusedId(it.id)}
                        className={`cursor-pointer rounded-2xl border bg-surface-raised p-4 transition ${
                          focusedId === it.id
                            ? "border-2 border-accent shadow-lg shadow-accent/25 ring-2 ring-accent/40 ring-offset-2 ring-offset-[#0a0e12]"
                            : "border border-surface-muted hover:border-surface-muted/80 hover:bg-surface-muted/20"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-accent">
                              {slotTitle(it.timeSlot)}
                            </p>
                            <h3 className="mt-1 font-display text-lg font-semibold text-ink">
                              {it.name}
                            </h3>
                            <RatingLine rating={it.rating} reviewCount={it.reviewCount} />
                            <AddressLine item={it} destination={prefs.destination} />
                          </div>
                          <button
                            type="button"
                            disabled={swapLoading === it.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              void swapItem(it);
                            }}
                            className="shrink-0 cursor-pointer rounded-lg border border-surface-muted px-3 py-1.5 text-xs font-medium text-ink-muted hover:border-accent/50 hover:text-accent disabled:opacity-50"
                          >
                            {swapLoading === it.id ? "Swapping…" : "Swap"}
                          </button>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{it.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="lg:sticky lg:top-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Map</p>
            <ItineraryMap
              items={items}
              focusedId={focusedId}
              onSelectPin={(id) => (id ? setFocusedId(id) : undefined)}
            />
            <p className="mt-3 text-xs text-ink-muted">
              Pin colors match each slot. Click a card to fly the map there, or a pin to scroll the
              list to that stop.
            </p>
            <Link
              href={`/preferences?destination=${encodeURIComponent(prefs.destination)}&days=${clampTripDays(prefs.tripDays)}`}
              className="mt-6 inline-block text-sm text-accent underline hover:no-underline"
            >
              Change preferences & regenerate
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
