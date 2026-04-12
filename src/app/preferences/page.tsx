"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { PriorityRanker } from "@/components/PriorityRanker";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchDestinationCenter } from "@/lib/fetch-destination-center";
import { saveTrip } from "@/lib/session-trip";
import { mergeSwapHintsForApi } from "@/lib/swap-hints-storage";
import {
  clampTripDays,
  type Budget,
  type DiningTag,
  type InterestTag,
  type ItineraryItem,
  type PriorityKey,
  type TripPreferences,
} from "@/lib/types";

const INTERESTS: InterestTag[] = [
  "nature",
  "history",
  "food",
  "shopping",
  "nightlife",
  "art",
  "adventure",
  "relaxation",
];

const DINING: DiningTag[] = [
  "local cuisine",
  "trendy spots",
  "vegetarian friendly",
  "street food",
];

const BUDGETS: Budget[] = ["low", "medium", "high"];

const GENERATE_LOADING_MESSAGES = [
  "Researching your destination…",
  "Finding the best spots for you…",
  "Building your personalized itinerary…",
  "Almost there…",
] as const;

function labelInterest(t: InterestTag): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function labelDining(t: DiningTag): string {
  return t.replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeDestinationInput(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return "";
  if (value.includes("localhost") || value.includes("127.0.0.1")) return "";
  return value;
}

function PreferencesForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destinationParam = searchParams.get("destination")?.trim() ?? "";
  const daysParam = searchParams.get("days");
  const tripDays = clampTripDays(
    daysParam != null && daysParam !== "" ? Number.parseInt(daysParam, 10) : undefined
  );

  const [budget, setBudget] = useState<Budget>("medium");
  const [interests, setInterests] = useState<InterestTag[]>([]);
  const [dining, setDining] = useState<DiningTag[]>([]);
  const [priorityOrder, setPriorityOrder] = useState<PriorityKey[]>([
    "sightseeing",
    "food",
    "shopping",
    "relaxation",
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const destination = normalizeDestinationInput(destinationParam);

  const prefs = useMemo<TripPreferences>(
    () => ({
      destination,
      tripDays,
      flexibleDates: true,
      budget,
      interests,
      dining,
      priorityOrder,
    }),
    [destination, tripDays, budget, interests, dining, priorityOrder]
  );

  const toggleInterest = (t: InterestTag) => {
    setInterests((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  };

  const toggleDining = (t: DiningTag) => {
    setDining((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  };

  useEffect(() => {
    if (!loading) return;
    setLoadingMsgIndex(0);
    const id = window.setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % GENERATE_LOADING_MESSAGES.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [loading]);

  useEffect(() => {
    if (!loading) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [loading]);

  const generate = async () => {
    if (!destination) return;
    setError(null);
    setLoading(true);
    try {
      let prefsToSave = prefs;
      if (prefsToSave.destinationLat == null || prefsToSave.destinationLng == null) {
        const c = await fetchDestinationCenter(destination);
        if (c) {
          prefsToSave = { ...prefsToSave, destinationLat: c.lat, destinationLng: c.lng };
        }
      }

      const prefsForApi = mergeSwapHintsForApi(prefsToSave);
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefsForApi),
      });
      const data = (await res.json()) as { items?: ItineraryItem[]; error?: string };
      if (!res.ok || !data.items?.length) {
        throw new Error(data.error ?? "Generation failed");
      }
      saveTrip({ preferences: prefsForApi, items: data.items });
      router.push("/itinerary");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative mx-auto max-w-2xl px-4 py-12">
      {loading && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0e12]/92 px-6 backdrop-blur-md"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="w-full max-w-md text-center">
            <div
              className="mx-auto h-14 w-14 rounded-full border-[3px] border-surface-muted border-t-accent animate-spin"
              aria-hidden
            />
            <p className="mt-8 min-h-[3.5rem] font-display text-lg font-medium leading-snug text-ink transition-opacity duration-300">
              {GENERATE_LOADING_MESSAGES[loadingMsgIndex]}
            </p>
            <p className="mt-2 text-sm text-ink-muted">This can take a minute while the AI plans your trip.</p>
            <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-accent/40 via-accent to-accent/40 animate-loadbar" />
            </div>
          </div>
        </div>
      )}
      <p className="text-sm font-medium uppercase tracking-widest text-accent">Step 2</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">
        Tailor your trip
      </h1>
      <p className="mt-2 text-ink-muted">
        {destination ? (
          <>
            Planning for <span className="font-medium text-ink">{destination}</span>
            {" — "}
            <span className="font-medium text-ink">
              {tripDays} {tripDays === 1 ? "day" : "days"}
            </span>
          </>
        ) : (
          <>Pick a destination first.</>
        )}
      </p>

      {!destination && (
        <p className="mt-6 rounded-xl border border-coral/40 bg-coral/10 p-4 text-sm text-coral">
          No destination selected.{" "}
          <Link href="/" className="font-medium underline">
            Go back
          </Link>{" "}
          to search or use the AI chat.
        </p>
      )}

      {destination && (
        <div className="mt-10 flex flex-col gap-10">
          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Budget</h2>
            <p className="mt-1 text-sm text-ink-muted">Tap one option.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium capitalize transition ${
                    budget === b
                      ? "bg-accent text-surface"
                      : "border border-surface-muted bg-surface-raised text-ink hover:border-accent/40"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Interests</h2>
            <p className="mt-1 text-sm text-ink-muted">Select any that apply.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {INTERESTS.map((t) => {
                const on = interests.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleInterest(t)}
                    className={`rounded-xl px-3 py-2 text-sm transition ${
                      on
                        ? "bg-sage/25 text-ink ring-1 ring-sage"
                        : "border border-surface-muted bg-surface-raised text-ink-muted hover:border-accent/30"
                    }`}
                  >
                    {labelInterest(t)}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Dining</h2>
            <p className="mt-1 text-sm text-ink-muted">How do you like to eat?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DINING.map((t) => {
                const on = dining.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleDining(t)}
                    className={`rounded-xl px-3 py-2 text-sm transition ${
                      on
                        ? "bg-accent/20 text-ink ring-1 ring-accent"
                        : "border border-surface-muted bg-surface-raised text-ink-muted hover:border-accent/30"
                    }`}
                  >
                    {labelDining(t)}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-surface-muted bg-surface-raised/50 p-4">
            <PriorityRanker value={priorityOrder} onChange={setPriorityOrder} />
          </section>

          {error && (
            <p className="rounded-xl border border-coral/40 bg-coral/10 p-3 text-sm text-coral">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void generate()}
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-accent to-accent-dim py-4 font-display text-lg font-semibold text-surface shadow-lg shadow-accent/20 hover:opacity-95 disabled:opacity-45"
          >
            {loading ? "Generating plan…" : "Generate plan"}
          </button>
        </div>
      )}
    </main>
  );
}

export default function PreferencesPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#1e293b_0%,_#0a0e12_55%)]">
      <SiteHeader />
      <Suspense
        fallback={
          <main className="mx-auto max-w-2xl px-4 py-12">
            <p className="text-ink-muted">Loading…</p>
          </main>
        }
      >
        <PreferencesForm />
      </Suspense>
    </div>
  );
}
