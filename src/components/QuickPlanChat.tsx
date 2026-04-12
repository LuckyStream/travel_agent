"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Loader2, Send, Sparkles, Undo2 } from "lucide-react";
import { DestinationAutocomplete } from "@/components/DestinationAutocomplete";
import { fetchDestinationCenter } from "@/lib/fetch-destination-center";
import { saveTrip } from "@/lib/session-trip";
import { parseFetchJson } from "@/lib/json-utils";
import { mergeSwapHintsForApi } from "@/lib/swap-hints-storage";
import type {
  DiningTag,
  InterestTag,
  ItineraryItem,
  MorningPreference,
  PriorityKey,
  TravelCompanion,
  TravelPace,
  TripMobility,
  TripPreferences,
} from "@/lib/types";

type Props = {
  initialDestination?: string;
  onBack: () => void;
  /** Passes current quiz-derived preferences so the wizard can pre-fill days, companion, pace, etc. */
  onOpenFullPlanner: (preferences: TripPreferences) => void;
};

function normalizeDestinationInput(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return "";
  if (value.includes("localhost") || value.includes("127.0.0.1")) return "";
  return value;
}

type ScenarioEffects = {
  interestWeights?: Partial<Record<InterestTag, number>>;
  morningPreference?: MorningPreference;
  travelPace?: TravelPace;
};

type ScenarioOption = { id: string; label: string; effects: ScenarioEffects };

type ScenarioBlock = { id: string; question: string; options: ScenarioOption[] };

/** MBTI-style situational questions → weighted interests + pace + morning. */
const SCENARIO_QUESTIONS: ScenarioBlock[] = [
  {
    id: "first_morning",
    question: "First morning of a trip — what sounds most like you?",
    options: [
      {
        id: "first_morning-brunch",
        label: "Sleep in, then a slow brunch",
        effects: {
          interestWeights: { relaxation: 2, food: 1 },
          morningPreference: "late_riser",
        },
      },
      {
        id: "first_morning-outdoors",
        label: "Up early and straight into nature or a big view",
        effects: {
          interestWeights: { nature: 2, adventure: 1 },
          morningPreference: "early_bird",
        },
      },
      {
        id: "first_morning-cafe",
        label: "Up early, café in the city, people-watching",
        effects: {
          interestWeights: { food: 1, shopping: 1 },
          morningPreference: "early_bird",
        },
      },
    ],
  },
  {
    id: "ten_k",
    question: "You’re in for a long walking day. You’d rather spend it…",
    options: [
      {
        id: "ten_k-urban",
        label: "Neighborhoods, shops, and museums",
        effects: { interestWeights: { history: 2, shopping: 1, food: 1 } },
      },
      {
        id: "ten_k-coast",
        label: "Coastline, park, or trail",
        effects: { interestWeights: { nature: 2, adventure: 2 } },
      },
      {
        id: "ten_k-mix",
        label: "A bit of both — I like variety",
        effects: { interestWeights: { food: 1, history: 1, nature: 1 } },
      },
    ],
  },
  {
    id: "planning",
    question: "Before you go, how much do you like to plan?",
    options: [
      {
        id: "planning-detailed",
        label: "Day-by-day — I want a clear schedule",
        effects: { travelPace: "packed" },
      },
      {
        id: "planning-rough",
        label: "Rough outline — a few anchors, then improvise",
        effects: { travelPace: "moderate" },
      },
      {
        id: "planning-wing",
        label: "Mostly wing it — surprises are fine",
        effects: { travelPace: "relaxed" },
      },
    ],
  },
  {
    id: "dinner",
    question: "Your ideal night on vacation looks more like…",
    options: [
      {
        id: "dinner-quiet",
        label: "A quiet table and a long meal",
        effects: { interestWeights: { food: 2 } },
      },
      {
        id: "dinner-buzz",
        label: "A busy market, street food, or a buzzy spot",
        effects: { interestWeights: { nightlife: 2, food: 1 } },
      },
      {
        id: "dinner-room",
        label: "Takeout or room service and decompress",
        effects: { interestWeights: { relaxation: 2 } },
      },
    ],
  },
  {
    id: "recharge",
    question: "What actually recharges you on a trip?",
    options: [
      {
        id: "recharge-challenge",
        label: "A small challenge — new route, light adventure",
        effects: { interestWeights: { adventure: 2 } },
      },
      {
        id: "recharge-sky",
        label: "Staring at water, sky, or green space",
        effects: { interestWeights: { relaxation: 2, nature: 1 } },
      },
      {
        id: "recharge-meal",
        label: "An amazing meal I’ll remember",
        effects: { interestWeights: { food: 2 } },
      },
    ],
  },
  {
    id: "why_go",
    question: "What usually pulls you toward a destination?",
    options: [
      {
        id: "why-heritage",
        label: "Heritage, icons, museums, depth",
        effects: { interestWeights: { history: 2, art: 1 } },
      },
      {
        id: "why-story",
        label: "A story — film, book, or myth attached to the place",
        effects: { interestWeights: { art: 1, history: 1 } },
      },
      {
        id: "why-social",
        label: "Saw it online or a friend went — I want in",
        effects: { interestWeights: { shopping: 1, food: 1 } },
      },
    ],
  },
];

const COMPANION: { value: TravelCompanion; label: string }[] = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family_with_kids", label: "Family with kids" },
  { value: "friends_group", label: "Friends" },
];

const DAY_CHIPS = [1, 2, 3, 4, 5, 7, 10, 14] as const;

const MONTHS = [
  { v: "01", n: "Jan" },
  { v: "02", n: "Feb" },
  { v: "03", n: "Mar" },
  { v: "04", n: "Apr" },
  { v: "05", n: "May" },
  { v: "06", n: "Jun" },
  { v: "07", n: "Jul" },
  { v: "08", n: "Aug" },
  { v: "09", n: "Sep" },
  { v: "10", n: "Oct" },
  { v: "11", n: "Nov" },
  { v: "12", n: "Dec" },
] as const;

function yearOpts(): number[] {
  const y = new Date().getFullYear();
  return [y, y + 1, y + 2];
}

function deriveFromScenarioAnswers(answerIds: string[]): {
  interests: InterestTag[];
  morningPreference: MorningPreference;
  travelPace: TravelPace;
} {
  const scores: Partial<Record<InterestTag, number>> = {};
  let morning: MorningPreference = "normal";
  let pace: TravelPace = "moderate";

  for (let i = 0; i < answerIds.length; i++) {
    const id = answerIds[i];
    const block = SCENARIO_QUESTIONS[i];
    const opt = block?.options.find((o) => o.id === id);
    if (!opt) continue;
    const e = opt.effects;
    if (e.interestWeights) {
      for (const [tag, w] of Object.entries(e.interestWeights)) {
        const t = tag as InterestTag;
        scores[t] = (scores[t] ?? 0) + w;
      }
    }
    if (e.morningPreference) morning = e.morningPreference;
    if (e.travelPace) pace = e.travelPace;
  }

  const ranked = (Object.entries(scores) as [InterestTag, number][]).sort((a, b) => b[1] - a[1]);
  let interests = ranked.filter(([, w]) => w >= 1).map(([t]) => t);
  const pool: InterestTag[] = ["food", "history", "relaxation", "nature", "shopping"];
  while (interests.length < 3) {
    const next = pool.find((t) => !interests.includes(t));
    if (!next) break;
    interests.push(next);
  }
  interests = interests.slice(0, 6);
  return { interests, morningPreference: morning, travelPace: pace };
}

function priorityFromInterests(interests: InterestTag[]): PriorityKey[] {
  if (interests.includes("food")) return ["food", "sightseeing", "relaxation", "shopping"];
  if (interests.includes("shopping")) return ["shopping", "sightseeing", "food", "relaxation"];
  if (interests.includes("relaxation")) return ["relaxation", "sightseeing", "food", "shopping"];
  return ["sightseeing", "food", "shopping", "relaxation"];
}

type Phase = "questions" | "refine";

type RefineMessage = { role: "user" | "assistant"; content: string };

type FlowStep = "destination" | "scenario" | "companion" | "days" | "mobility" | "season";

const ASSISTANT_COMPANION = "Who are you traveling with?";
const ASSISTANT_DAYS = "How many days are you planning?";
const ASSISTANT_MOBILITY =
  "How will you get around? This helps us space stops — walking-only days stay compact; with a car we can suggest farther gems.";
const ASSISTANT_SEASON =
  "Roughly when? (for season & events — optional.) Choose both month & year to confirm, or say you’re flexible.";

const MOBILITY_CHIPS: { value: TripMobility; label: string }[] = [
  { value: "walking_transit", label: "Walking & transit" },
  { value: "rental_car", label: "Rental car" },
  { value: "own_car", label: "I have a car" },
];

export function QuickPlanChat({ initialDestination = "", onBack, onOpenFullPlanner }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("questions");
  const hasInitialDest = Boolean(normalizeDestinationInput(initialDestination));

  const [flowStep, setFlowStep] = useState<FlowStep>(() => (hasInitialDest ? "scenario" : "destination"));
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [scenarioAnswerIds, setScenarioAnswerIds] = useState<string[]>([]);

  const [destinationDraft, setDestinationDraft] = useState(() =>
    hasInitialDest ? normalizeDestinationInput(initialDestination)! : initialDestination
  );
  const [travelCompanion, setTravelCompanion] = useState<TravelCompanion>("solo");
  const [mobility, setMobility] = useState<TripMobility>("walking_transit");
  const [tripDays, setTripDays] = useState(3);
  const [tripSeasonFlexible, setTripSeasonFlexible] = useState(true);
  const [tripMonth, setTripMonth] = useState("");
  const [tripYear, setTripYear] = useState("");

  const [transcript, setTranscript] = useState<{ role: "assistant" | "user"; text: string }[]>(() => {
    if (hasInitialDest) {
      return [{ role: "assistant", text: SCENARIO_QUESTIONS[0].question }];
    }
    return [];
  });

  const [reEntryFromSummary, setReEntryFromSummary] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [refineMessages, setRefineMessages] = useState<RefineMessage[]>([]);
  const [refineInput, setRefineInput] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);

  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const refineScrollRef = useRef<HTMLDivElement>(null);
  /** Scroll destination / scenario / companion / days / … into view — long chat + tall min-height was hiding chips below the fold. */
  const stepControlsRef = useRef<HTMLDivElement>(null);

  const normalizedDest = useMemo(() => normalizeDestinationInput(destinationDraft), [destinationDraft]);

  const { interests: derivedInterests, morningPreference, travelPace } = useMemo(
    () => deriveFromScenarioAnswers(scenarioAnswerIds),
    [scenarioAnswerIds]
  );

  const tripDate = useMemo(() => {
    if (tripSeasonFlexible || !tripMonth || !tripYear) return null;
    return `${tripYear}-${tripMonth}`;
  }, [tripSeasonFlexible, tripMonth, tripYear]);

  const tripPreferences = useMemo((): TripPreferences => {
    const dining: DiningTag[] = derivedInterests.includes("food")
      ? ["local cuisine", "street food"]
      : ["local cuisine"];
    return {
      destination: normalizedDest || "not_sure",
      tripDays,
      flexibleDates: tripSeasonFlexible,
      budget: "medium",
      hotelStyles: [],
      interests: derivedInterests,
      dining,
      priorityOrder: priorityFromInterests(derivedInterests),
      travelCompanion,
      travelPace,
      morningPreference,
      tripDate,
      mobility,
    };
  }, [
    normalizedDest,
    tripDays,
    tripSeasonFlexible,
    derivedInterests,
    travelCompanion,
    travelPace,
    morningPreference,
    tripDate,
    mobility,
  ]);

  const styleSummary = useMemo(() => {
    const pace =
      travelPace === "relaxed" ? "easygoing days" : travelPace === "packed" ? "full days" : "balanced days";
    const morn =
      morningPreference === "early_bird"
        ? "early starts"
        : morningPreference === "late_riser"
          ? "later starts"
          : "normal mornings";
    const top = derivedInterests.slice(0, 4).join(", ");
    return `${pace}, ${morn} · drawn to: ${top}`;
  }, [travelPace, morningPreference, derivedInterests]);

  const seasonReady = Boolean(tripMonth && tripYear);

  const advanceAfterDestination = useCallback(() => {
    if (!normalizedDest) return;
    setDestinationDraft(normalizedDest);
    if (reEntryFromSummary) {
      setReEntryFromSummary(false);
      setPhase("refine");
      return;
    }
    setTranscript((t) => [
      ...t,
      { role: "assistant", text: SCENARIO_QUESTIONS[0].question },
    ]);
    setScenarioIndex(0);
    setScenarioAnswerIds([]);
    setFlowStep("scenario");
  }, [normalizedDest, reEntryFromSummary]);

  const pickScenarioOption = (opt: ScenarioOption) => {
    if (reEntryFromSummary) {
      setReEntryFromSummary(false);
      setPhase("refine");
      return;
    }
    const idx = scenarioIndex;
    setTranscript((t) => [...t, { role: "user", text: opt.label }]);
    const nextAnswers = scenarioAnswerIds.slice(0, idx);
    nextAnswers[idx] = opt.id;
    setScenarioAnswerIds(nextAnswers);

    if (idx < SCENARIO_QUESTIONS.length - 1) {
      const nextQ = SCENARIO_QUESTIONS[idx + 1].question;
      setTranscript((t) => [...t, { role: "assistant", text: nextQ }]);
      setScenarioIndex(idx + 1);
    } else {
      setTranscript((t) => [...t, { role: "assistant", text: ASSISTANT_COMPANION }]);
      setFlowStep("companion");
    }
  };

  const pickCompanion = (v: TravelCompanion, label: string) => {
    if (reEntryFromSummary) {
      setTravelCompanion(v);
      setReEntryFromSummary(false);
      setPhase("refine");
      return;
    }
    setTravelCompanion(v);
    setTranscript((t) => [
      ...t,
      { role: "user", text: label },
      { role: "assistant", text: ASSISTANT_DAYS },
    ]);
    setFlowStep("days");
  };

  const pickDays = (d: number) => {
    if (reEntryFromSummary) {
      setTripDays(d);
      setReEntryFromSummary(false);
      setPhase("refine");
      return;
    }
    setTripDays(d);
    setTranscript((t) => [
      ...t,
      { role: "user", text: `${d} day${d === 1 ? "" : "s"}` },
      { role: "assistant", text: ASSISTANT_MOBILITY },
    ]);
    setFlowStep("mobility");
  };

  const pickMobility = (v: TripMobility, label: string) => {
    if (reEntryFromSummary) {
      setMobility(v);
      setReEntryFromSummary(false);
      setPhase("refine");
      return;
    }
    setMobility(v);
    setTranscript((t) => [
      ...t,
      { role: "user", text: label },
      { role: "assistant", text: ASSISTANT_SEASON },
    ]);
    setFlowStep("season");
  };

  const finishSeasonFlexible = () => {
    if (reEntryFromSummary) {
      setTripSeasonFlexible(true);
      setTripMonth("");
      setTripYear("");
      setReEntryFromSummary(false);
      setPhase("refine");
      return;
    }
    setTripSeasonFlexible(true);
    setTripMonth("");
    setTripYear("");
    setTranscript((t) => [...t, { role: "user", text: "I'm flexible on timing" }]);
    setRefineMessages([]);
    setPhase("refine");
  };

  const finishSeasonFixed = () => {
    if (!tripMonth || !tripYear) return;
    const label = `${MONTHS.find((m) => m.v === tripMonth)?.n} ${tripYear}`;
    if (reEntryFromSummary) {
      setTripSeasonFlexible(false);
      setReEntryFromSummary(false);
      setPhase("refine");
      return;
    }
    setTripSeasonFlexible(false);
    setTranscript((t) => [...t, { role: "user", text: `Around ${label}` }]);
    setRefineMessages([]);
    setPhase("refine");
  };

  const backOneStep = () => {
    if (flowStep === "destination") return;
    if (flowStep === "scenario") {
      if (scenarioIndex === 0) {
        setTranscript([]);
        setScenarioAnswerIds([]);
        setFlowStep("destination");
        return;
      }
      setTranscript((t) => t.slice(0, -2));
      setScenarioAnswerIds((a) => a.slice(0, scenarioIndex - 1));
      setScenarioIndex((i) => i - 1);
      return;
    }
    if (flowStep === "companion") {
      setTranscript((t) => t.slice(0, -2));
      setScenarioAnswerIds((a) => a.slice(0, -1));
      setScenarioIndex(SCENARIO_QUESTIONS.length - 1);
      setFlowStep("scenario");
      return;
    }
    if (flowStep === "days") {
      setTranscript((t) => t.slice(0, -2));
      setFlowStep("companion");
      return;
    }
    if (flowStep === "season") {
      setTranscript((t) => t.slice(0, -2));
      setFlowStep("mobility");
      return;
    }
    if (flowStep === "mobility") {
      setTranscript((t) => t.slice(0, -2));
      setFlowStep("days");
    }
  };

  const showBack =
    phase === "questions" &&
    flowStep !== "destination" &&
    !(hasInitialDest && flowStep === "scenario" && scenarioIndex === 0 && transcript.length <= 1);

  useEffect(() => {
    const el =
      phase === "refine" ? refineScrollRef.current : transcriptScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  }, [transcript, phase, flowStep, refineMessages, refineLoading]);

  useEffect(() => {
    if (phase !== "questions") return;
    requestAnimationFrame(() => {
      stepControlsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [phase, flowStep]);

  useEffect(() => {
    if (phase !== "refine") return;
    if (refineMessages.length > 0) return;

    let cancelled = false;
    (async () => {
      setRefineLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/quick-refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferences: tripPreferences, messages: [] }),
        });
        const parsed = await parseFetchJson<{ message?: string; error?: string }>(res);
        if (!parsed.ok) throw new Error(parsed.error);
        const msg = parsed.data.message?.trim();
        if (!msg) throw new Error("Empty reply");
        if (!cancelled) setRefineMessages([{ role: "assistant", content: msg }]);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Chat failed");
          setRefineMessages([
            {
              role: "assistant",
              content:
                "Here's what we captured from your answers. Use Generate below when you're ready, or type what you'd like to change.",
            },
          ]);
        }
      } finally {
        if (!cancelled) setRefineLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [phase, refineMessages.length, tripPreferences]);

  const sendRefine = useCallback(async () => {
    const text = refineInput.trim();
    if (!text || refineLoading) return;
    setRefineInput("");
    const next: RefineMessage[] = [...refineMessages, { role: "user", content: text }];
    setRefineMessages(next);
    setRefineLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quick-refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: tripPreferences, messages: next }),
      });
      const parsed = await parseFetchJson<{ message?: string; error?: string }>(res);
      if (!parsed.ok) throw new Error(parsed.error);
      const msg = parsed.data.message?.trim();
      if (!msg) throw new Error("Empty reply");
      setRefineMessages((t) => [...t, { role: "assistant", content: msg }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setRefineMessages((t) => t.slice(0, -1));
      setRefineInput(text);
    } finally {
      setRefineLoading(false);
    }
  }, [refineInput, refineLoading, refineMessages, tripPreferences]);

  const generate = async () => {
    if (!normalizedDest) {
      setError("Add a valid destination first.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      let prefsToSave = tripPreferences;
      if (
        (prefsToSave.destinationLat == null || prefsToSave.destinationLng == null) &&
        normalizedDest
      ) {
        const c = await fetchDestinationCenter(normalizedDest);
        if (c) {
          prefsToSave = { ...prefsToSave, destinationLat: c.lat, destinationLng: c.lng };
        }
      }

      const refinementContext =
        refineMessages.length > 0
          ? refineMessages
              .map((m) => `${m.role === "user" ? "Traveler" : "Assistant"}: ${m.content}`)
              .join("\n\n")
          : undefined;
      const prefsForApi = mergeSwapHintsForApi(prefsToSave);
      const payload =
        refinementContext ? { ...prefsForApi, refinementContext } : prefsForApi;
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const parsed = await parseFetchJson<{ items?: ItineraryItem[]; error?: string }>(res);
      if (!parsed.ok || !parsed.data.items?.length) {
        throw new Error(
          !parsed.ok ? parsed.error : parsed.data.error ?? "Could not generate plan"
        );
      }
      saveTrip({ preferences: prefsForApi, items: parsed.data.items });
      router.push("/itinerary");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const summaryChipClass =
    "rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-foreground/25";

  const currentScenario = SCENARIO_QUESTIONS[scenarioIndex];

  return (
    <section className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-10 md:px-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </button>

      <div className="mb-6 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Quick plan
        </p>
        <h1 className="font-display text-3xl font-bold italic text-foreground md:text-4xl">
          A few taps, <span className="text-primary">zero essays</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Situation questions (not “what country do you like”) — we infer your travel style.
        </p>
      </div>

      <div className="rounded-3xl border border-border/40 bg-card/80 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-8">
        {phase === "questions" && (
          <>
            {normalizedDest && flowStep !== "destination" && (
              <div className="mb-4 flex justify-center">
                <span className="inline-flex max-w-full rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-center text-xs font-semibold text-primary">
                  {normalizedDest}
                </span>
              </div>
            )}

            {transcript.length > 0 && (
              <div
                ref={transcriptScrollRef}
                className="mb-4 max-h-[min(240px,32vh)] space-y-2 overflow-y-auto scroll-smooth pr-1 text-sm sm:max-h-[min(320px,38vh)]"
              >
                {transcript.map((row, i) => (
                  <div
                    key={`${row.role}-${i}-${row.text.slice(0, 24)}`}
                    className={`flex ${row.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={
                        row.role === "user"
                          ? "max-w-[90%] rounded-2xl bg-primary px-3 py-2 text-primary-foreground"
                          : "max-w-[90%] rounded-2xl bg-muted px-3 py-2 text-foreground"
                      }
                    >
                      {row.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showBack && (
              <div className="mb-4 flex justify-center">
                <button
                  type="button"
                  onClick={backOneStep}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  Back one step
                </button>
              </div>
            )}

            <div ref={stepControlsRef} className="scroll-mt-8 space-y-4">
            {flowStep === "destination" && (
              <div className="space-y-4">
                <p className="text-center font-display text-lg font-semibold text-foreground">
                  Where do you want to go?
                </p>
                <DestinationAutocomplete
                  value={destinationDraft}
                  onChange={setDestinationDraft}
                  placeholder="City, region, or country"
                  className="w-full"
                  inputClassName="w-full rounded-2xl border border-border/40 bg-muted px-4 py-3 text-center text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  disabled={!normalizedDest}
                  onClick={advanceAfterDestination}
                  className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            )}

            {flowStep === "scenario" && currentScenario && (
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  {currentScenario.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => pickScenarioOption(opt)}
                      className="rounded-2xl border-2 border-border/40 bg-card/60 px-4 py-3 text-left text-sm font-medium transition hover:border-primary/40"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {flowStep === "companion" && (
              <div className="space-y-3">
                <p className="text-center text-xs font-medium text-muted-foreground">
                  Tap one option below
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {COMPANION.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => pickCompanion(c.value, c.label)}
                      className="rounded-2xl border-2 border-border/40 bg-card/60 px-4 py-2.5 text-sm font-medium transition hover:border-primary/40"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {flowStep === "days" && (
              <div className="space-y-3">
                <p className="text-center text-xs font-medium text-muted-foreground">
                  Tap a number — then how you get around, then season
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {DAY_CHIPS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => pickDays(d)}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-border/40 bg-card/60 text-sm font-semibold transition hover:border-primary/40"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {flowStep === "mobility" && (
              <div className="space-y-3">
                <p className="text-center text-xs font-medium text-muted-foreground">
                  Walking vs car changes how far apart we place stops
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                  {MOBILITY_CHIPS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => pickMobility(m.value, m.label)}
                      className={`w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition hover:border-primary/40 sm:min-w-[200px] sm:max-w-[260px] sm:flex-1 ${
                        mobility === m.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/40 bg-card/60"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {flowStep === "season" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={finishSeasonFlexible}
                  className="w-full cursor-pointer rounded-2xl border-2 border-primary/30 bg-primary/10 py-3 text-sm font-semibold text-primary"
                >
                  I&apos;m flexible on timing
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Or pick <strong className="font-medium text-foreground">month</strong> and{" "}
                  <strong className="font-medium text-foreground">year</strong>, then continue.
                </p>
                <div className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row">
                  <select
                    value={tripMonth}
                    onChange={(e) => setTripMonth(e.target.value)}
                    className="min-h-[44px] min-w-0 flex-1 cursor-pointer rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-foreground"
                    aria-label="Month"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m.v} value={m.v}>
                        {m.n}
                      </option>
                    ))}
                  </select>
                  <select
                    value={tripYear}
                    onChange={(e) => setTripYear(e.target.value)}
                    className="min-h-[44px] min-w-0 flex-1 cursor-pointer rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-foreground"
                    aria-label="Year"
                  >
                    <option value="">Year</option>
                    {yearOpts().map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={!seasonReady}
                  title={seasonReady ? "Continue with selected month" : "Select month and year first"}
                  onClick={finishSeasonFixed}
                  className={`w-full rounded-full py-3 text-sm font-semibold transition ${
                    seasonReady
                      ? "cursor-pointer bg-primary text-primary-foreground shadow-sm hover:opacity-95"
                      : "cursor-not-allowed bg-muted text-muted-foreground opacity-60"
                  }`}
                >
                  Continue
                </button>
              </div>
            )}
            </div>
          </>
        )}

        {phase === "refine" && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Your trip — chat to tweak
              </p>
              <div
                ref={refineScrollRef}
                className="mb-4 min-h-[min(200px,28vh)] max-h-[min(400px,45vh)] space-y-2 overflow-y-auto scroll-smooth rounded-2xl border border-border/30 bg-muted/20 p-3 pr-1 text-sm"
              >
                {refineLoading && refineMessages.length === 0 ? (
                  <div className="flex justify-center py-10 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  refineMessages.map((row, i) => (
                    <div
                      key={`refine-${i}-${row.content.slice(0, 24)}`}
                      className={`flex ${row.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={
                          row.role === "user"
                            ? "max-w-[90%] rounded-2xl bg-primary px-3 py-2 text-primary-foreground"
                            : "max-w-[90%] rounded-2xl bg-muted px-3 py-2 text-foreground"
                        }
                      >
                        {row.content}
                      </div>
                    </div>
                  ))
                )}
                {refineLoading && refineMessages.length > 0 ? (
                  <div className="flex justify-start">
                    <div className="flex rounded-2xl bg-muted px-3 py-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={refineInput}
                  onChange={(e) => setRefineInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendRefine();
                    }
                  }}
                  placeholder="e.g. More museums, slower pace, vegetarian…"
                  disabled={refineLoading && refineMessages.length === 0}
                  className="min-h-[44px] flex-1 rounded-2xl border border-border/40 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <button
                  type="button"
                  disabled={!refineInput.trim() || refineLoading}
                  onClick={() => void sendRefine()}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-muted/60 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Here&apos;s what we inferred
              </p>
              <p className="mt-2 font-display text-lg font-semibold text-foreground">{normalizedDest}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{styleSummary}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {COMPANION.find((c) => c.value === travelCompanion)?.label} · {tripDays} days ·{" "}
                {MOBILITY_CHIPS.find((m) => m.value === mobility)?.label ?? "Walking & transit"}
                {tripDate
                  ? ` · ~${MONTHS.find((x) => x.v === tripMonth)?.n} ${tripYear}`
                  : " · season flexible"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-center text-xs text-muted-foreground">Tap to change</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className={summaryChipClass}
                  onClick={() => {
                    setRefineMessages([]);
                    setReEntryFromSummary(true);
                    setPhase("questions");
                    setFlowStep("destination");
                  }}
                >
                  Destination
                </button>
                <button
                  type="button"
                  className={summaryChipClass}
                  onClick={() => {
                    setRefineMessages([]);
                    setReEntryFromSummary(true);
                    setPhase("questions");
                    setFlowStep("scenario");
                    setScenarioIndex(0);
                    setScenarioAnswerIds([]);
                    setTranscript([{ role: "assistant", text: SCENARIO_QUESTIONS[0].question }]);
                  }}
                >
                  Style questions
                </button>
                <button
                  type="button"
                  className={summaryChipClass}
                  onClick={() => {
                    setRefineMessages([]);
                    setReEntryFromSummary(true);
                    setPhase("questions");
                    setFlowStep("companion");
                    setTranscript((t) => {
                      const cut = t.findIndex((m) => m.text === ASSISTANT_COMPANION);
                      if (cut === -1) return [...t, { role: "assistant", text: ASSISTANT_COMPANION }];
                      return t.slice(0, cut + 1);
                    });
                  }}
                >
                  {COMPANION.find((c) => c.value === travelCompanion)?.label}
                </button>
                <button
                  type="button"
                  className={summaryChipClass}
                  onClick={() => {
                    setRefineMessages([]);
                    setReEntryFromSummary(true);
                    setPhase("questions");
                    setFlowStep("days");
                    setTranscript((t) => {
                      const cut = t.findIndex((m) => m.text === ASSISTANT_DAYS);
                      if (cut === -1) return t;
                      return t.slice(0, cut + 1);
                    });
                  }}
                >
                  {tripDays} days
                </button>
                <button
                  type="button"
                  className={summaryChipClass}
                  onClick={() => {
                    setRefineMessages([]);
                    setReEntryFromSummary(true);
                    setPhase("questions");
                    setFlowStep("mobility");
                    setTranscript((t) => {
                      const cut = t.findIndex((m) => m.text === ASSISTANT_MOBILITY);
                      if (cut === -1) return t;
                      return t.slice(0, cut + 1);
                    });
                  }}
                >
                  {MOBILITY_CHIPS.find((m) => m.value === mobility)?.label ?? "Getting around"}
                </button>
                <button
                  type="button"
                  className={summaryChipClass}
                  onClick={() => {
                    setRefineMessages([]);
                    setReEntryFromSummary(true);
                    setPhase("questions");
                    setFlowStep("season");
                    setTranscript((t) => {
                      const cut = t.findIndex((m) => m.text === ASSISTANT_SEASON);
                      if (cut === -1) return t;
                      return t.slice(0, cut + 1);
                    });
                  }}
                >
                  {tripDate ? "Month" : "Season"}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-center text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                disabled={generating || (refineLoading && refineMessages.length === 0)}
                onClick={() => void generate()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate itinerary
              </button>
              <button
                type="button"
                disabled={generating}
                onClick={() => onOpenFullPlanner(tripPreferences)}
                className="rounded-full border border-border px-8 py-3 text-sm font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              >
                Open detailed planner
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
