"use client";

import { type ComponentType, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Car,
  Landmark,
  Palmtree,
  Trees,
  Mountain,
  ArrowLeft,
  ArrowRight,
  ChefHat,
  Check,
  Camera,
  GlassWater,
  Home,
  Leaf,
  Loader2,
  Music2,
  Palette,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Soup,
  UtensilsCrossed,
  Waves,
} from "lucide-react";
import { DestinationAutocomplete } from "@/components/DestinationAutocomplete";
import { fetchDestinationCenter } from "@/lib/fetch-destination-center";
import { mergeSwapHintsForApi } from "@/lib/swap-hints-storage";
import { saveTrip } from "@/lib/session-trip";
import {
  clampTripDays,
  type Budget,
  type DiningTag,
  type InterestTag,
  type ItineraryItem,
  type MorningPreference,
  type PriorityKey,
  type TravelCompanion,
  type TravelPace,
  type TripMobility,
  type TripPreferences,
} from "@/lib/types";

type Step = "days" | "vibe" | "interests" | "dining" | "extras" | "result";

type OptionItem = {
  id: string;
  title: string;
  desc: string;
  icon?: ComponentType<{ className?: string }>;
};

const STEPS: { key: Exclude<Step, "result">; label: string }[] = [
  { key: "days", label: "Duration" },
  { key: "vibe", label: "City Style" },
  { key: "interests", label: "Interests" },
  { key: "dining", label: "Dining" },
  { key: "extras", label: "Trip details" },
];

const COMPANION_OPTIONS: { value: TravelCompanion; label: string }[] = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family_with_kids", label: "Family with Kids" },
  { value: "friends_group", label: "Friends Group" },
];

const PACE_OPTIONS: { value: TravelPace; label: string; hint: string }[] = [
  {
    value: "relaxed",
    label: "Relaxed",
    hint: "2–3 activities per day, lots of free time",
  },
  {
    value: "moderate",
    label: "Moderate",
    hint: "3–4 activities per day",
  },
  {
    value: "packed",
    label: "Packed",
    hint: "5+ activities, see everything",
  },
];

const MORNING_OPTIONS: { value: MorningPreference; label: string; hint: string }[] = [
  { value: "early_bird", label: "Early Bird", hint: "Start by 8 AM" },
  { value: "normal", label: "Normal", hint: "Start by 10 AM" },
  { value: "late_riser", label: "Late Riser", hint: "Start after 11 AM" },
];

const MOBILITY_OPTIONS: { value: TripMobility; label: string; hint: string }[] = [
  { value: "walking_transit", label: "Walking & transit", hint: "Keep each day compact" },
  { value: "rental_car", label: "Rental car", hint: "Some farther stops OK" },
  { value: "own_car", label: "I have a car", hint: "Mix near and far in one day" },
];

const SEASON_MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
] as const;

function seasonYearOptions(): number[] {
  const y = new Date().getFullYear();
  return [y, y + 1, y + 2];
}

const DAY_OPTIONS = [1, 2, 3, 4, 5, 7, 10, 14];

const VIBES: OptionItem[] = [
  { id: "city", title: "Vibrant City", desc: "Bustling streets, nightlife, and urban adventures", icon: Building2 },
  { id: "nature", title: "Nature Escape", desc: "Serene landscapes, mountains, and outdoor exploration", icon: Trees },
  { id: "beach", title: "Beach Paradise", desc: "Crystal waters, sandy shores, and tropical vibes", icon: Palmtree },
  { id: "cultural", title: "Cultural Heritage", desc: "Historic sites, museums, and local traditions", icon: Landmark },
];

const INTERESTS: Array<OptionItem & { value: InterestTag }> = [
  { id: "adventure", value: "adventure", title: "Adventure & Hiking", desc: "Trails, peaks, and outdoor thrills", icon: Mountain },
  { id: "food", value: "food", title: "Food & Cooking", desc: "Local flavors and culinary experiences", icon: UtensilsCrossed },
  { id: "art", value: "art", title: "Photography & Art", desc: "Capture stunning moments and creative spaces", icon: Camera },
  { id: "relaxation", value: "relaxation", title: "Wellness & Spa", desc: "Relaxation, slow mornings, and rejuvenation", icon: Sparkles },
  { id: "nightlife", value: "nightlife", title: "Entertainment", desc: "Shows, bars, and lively night scenes", icon: Music2 },
  { id: "shopping", value: "shopping", title: "Shopping", desc: "Markets, boutiques, and local finds", icon: ShoppingBag },
  { id: "history", value: "history", title: "Culture & History", desc: "Museums, heritage, and iconic landmarks", icon: Palette },
  { id: "nature", value: "nature", title: "Nature & Views", desc: "Parks, coastlines, and scenic escapes", icon: Waves },
];

const DINING: Array<OptionItem & { value: DiningTag }> = [
  { id: "street food", value: "street food", title: "Street Food", desc: "Authentic and affordable local bites", icon: Soup },
  { id: "local cuisine", value: "local cuisine", title: "Local Restaurants", desc: "Traditional cuisine and signature dishes", icon: ChefHat },
  { id: "trendy spots", value: "trendy spots", title: "Trendy Spots", desc: "Design-forward and social dining", icon: GlassWater },
  { id: "vegetarian friendly", value: "vegetarian friendly", title: "Vegetarian Friendly", desc: "Plant-forward meals and healthy options", icon: Leaf },
];

const stepContent: Record<Exclude<Step, "result">, { heading: string; sub: string }> = {
  days: { heading: "How many days?", sub: "Choose your trip duration" },
  vibe: {
    heading: "What's your travel vibe?",
    sub: "Select all that fit — we blend them. Quick Plan answers pre-select matching vibes.",
  },
  interests: { heading: "What excites you most?", sub: "Select all the experiences you'd love to have" },
  dining: { heading: "How do you like to eat?", sub: "Select your dining preferences" },
  extras: {
    heading: "Almost there — a few details",
    sub: "Who you’re with, pace, mornings, and season help tailor the plan",
  },
};

function normalizeDestinationInput(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return "";
  if (value.includes("localhost") || value.includes("127.0.0.1")) return "";
  return value;
}

function initialBudgetFromPrefs(p?: Partial<TripPreferences> | null): Budget {
  const b = p?.budget;
  if (b === "low" || b === "medium" || b === "high") return b;
  return "medium";
}

function wizardSeedFromQuickPlan(p?: Partial<TripPreferences> | null): {
  destination: string;
  selectedDays: number;
  flexibleDates: boolean;
  startDate: string;
  selectedInterests: InterestTag[];
  selectedDining: DiningTag[];
  travelCompanion: TravelCompanion;
  travelPace: TravelPace;
  morningPreference: MorningPreference;
  mobility: TripMobility;
  tripSeasonFlexible: boolean;
  tripMonth: string;
  tripYear: string;
  budget: Budget;
} {
  const td = p?.tripDate?.trim();
  let tripMonth = "";
  let tripYear = "";
  let tripSeasonFlexible = true;
  if (td && /^\d{4}-\d{2}$/.test(td)) {
    tripSeasonFlexible = false;
    tripYear = td.slice(0, 4);
    tripMonth = td.slice(5, 7);
  } else if (p?.flexibleDates === false && p.tripDate) {
    tripSeasonFlexible = false;
  }

  const companion = p?.travelCompanion;
  const pace = p?.travelPace;
  const morning = p?.morningPreference;
  const mob = p?.mobility;

  return {
    destination: "",
    selectedDays: p?.tripDays != null ? clampTripDays(p.tripDays) : 3,
    flexibleDates: p?.flexibleDates ?? false,
    startDate: p?.startDate ?? "",
    selectedInterests: p?.interests?.length ? [...p.interests] : [],
    selectedDining: p?.dining?.length ? [...p.dining] : [],
    travelCompanion:
      companion === "solo" ||
      companion === "couple" ||
      companion === "family_with_kids" ||
      companion === "friends_group"
        ? companion
        : "solo",
    travelPace: pace === "relaxed" || pace === "moderate" || pace === "packed" ? pace : "moderate",
    morningPreference:
      morning === "early_bird" || morning === "normal" || morning === "late_riser"
        ? morning
        : "normal",
    mobility:
      mob === "walking_transit" || mob === "rental_car" || mob === "own_car"
        ? mob
        : "walking_transit",
    tripSeasonFlexible,
    tripMonth,
    tripYear,
    budget: initialBudgetFromPrefs(p),
  };
}

function OptionCard({
  item,
  selected,
  onClick,
}: {
  item: OptionItem;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass-float-card w-full rounded-2xl border p-5 text-left transition-all duration-300 ${
        selected
          ? "border-primary bg-primary/8 shadow-[0_10px_24px_rgba(110,97,61,0.12)]"
          : "border-border/40 bg-card/60"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {Icon ? (
            <div
              className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[22px] transition-all duration-300 ${
                selected
                  ? "bg-primary/12 text-primary"
                  : "bg-white/50 text-muted-foreground"
              }`}
            >
              <Icon className="h-7 w-7" />
            </div>
          ) : null}
          <div>
            <p className={`text-sm font-semibold ${selected ? "text-foreground" : "text-foreground/80"}`}>
              {item.title}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">{item.desc}</p>
          </div>
        </div>
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            selected ? "border-primary bg-primary" : "border-border/60"
          }`}
        >
          {selected && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
        </div>
      </div>
    </button>
  );
}

const VIBE_IDS = new Set(VIBES.map((v) => v.id));

/**
 * Map Quick Plan interests → at most **two** vibe cards (scores + tie-break),
 * so we don't pre-check all four after a rich interest profile.
 */
function inferVibesFromInterests(interests: InterestTag[]): string[] {
  const scores: Record<string, number> = {
    city: 0,
    nature: 0,
    beach: 0,
    cultural: 0,
  };
  for (const i of interests) {
    if (i === "nature" || i === "adventure") scores.nature += 2;
    if (i === "history" || i === "art") scores.cultural += 2;
    if (i === "nightlife" || i === "shopping") scores.city += 2;
    if (i === "food") scores.city += 1;
    if (i === "relaxation") scores.beach += 1;
  }
  const ranked = (Object.entries(scores) as [string, number][])
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1]);
  if (!ranked.length) return [];

  const out: string[] = [];
  const [first, second] = ranked;
  if (first && VIBE_IDS.has(first[0])) out.push(first[0]);
  if (
    second &&
    VIBE_IDS.has(second[0]) &&
    second[1] >= first![1] * 0.72 &&
    second[1] >= 2
  ) {
    out.push(second[0]);
  }
  return out;
}

function combineInterests(vibes: string[], interests: InterestTag[]): InterestTag[] {
  const next = new Set<InterestTag>(interests);
  for (const vibe of vibes) {
    if (vibe === "city") {
      next.add("food");
      next.add("nightlife");
    } else if (vibe === "nature") {
      next.add("nature");
      next.add("adventure");
    } else if (vibe === "beach") {
      next.add("relaxation");
      next.add("food");
    } else if (vibe === "cultural") {
      next.add("history");
      next.add("art");
    }
  }
  return [...next];
}

function computePriorityOrder(vibes: string[], interests: InterestTag[]): PriorityKey[] {
  if (interests.includes("food")) return ["food", "sightseeing", "relaxation", "shopping"];
  if (interests.includes("shopping")) return ["shopping", "sightseeing", "food", "relaxation"];
  if (interests.includes("relaxation") || vibes.includes("beach")) {
    return ["relaxation", "sightseeing", "food", "shopping"];
  }
  return ["sightseeing", "food", "shopping", "relaxation"];
}

type Props = {
  initialDestination?: string;
  /** When opening from Quick Plan, pass inferred preferences to pre-fill steps. */
  initialPreferences?: Partial<TripPreferences> | null;
  onAskAi: () => void;
  onBack?: () => void;
};

export function TravelPlannerWizard({
  initialDestination = "",
  initialPreferences = null,
  onAskAi,
  onBack,
}: Props) {
  const router = useRouter();
  const seed = wizardSeedFromQuickPlan(initialPreferences);
  const mergedDestination =
    normalizeDestinationInput(initialPreferences?.destination?.trim() || "") || initialDestination;

  const [step, setStep] = useState<Step>("days");
  const [destination, setDestination] = useState(mergedDestination);
  const [selectedDays, setSelectedDays] = useState<number>(seed.selectedDays);
  const [customDays, setCustomDays] = useState(() =>
    (DAY_OPTIONS as readonly number[]).includes(seed.selectedDays) ? "" : String(seed.selectedDays)
  );
  const [startDate, setStartDate] = useState(seed.startDate);
  const [flexibleDates, setFlexibleDates] = useState(seed.flexibleDates);
  const [selectedVibes, setSelectedVibes] = useState<string[]>(() =>
    inferVibesFromInterests(seed.selectedInterests)
  );
  const [selectedInterests, setSelectedInterests] = useState<InterestTag[]>(seed.selectedInterests);
  const [selectedDining, setSelectedDining] = useState<DiningTag[]>(seed.selectedDining);
  const [travelCompanion, setTravelCompanion] = useState<TravelCompanion>(seed.travelCompanion);
  const [travelPace, setTravelPace] = useState<TravelPace>(seed.travelPace);
  const [morningPreference, setMorningPreference] = useState<MorningPreference>(seed.morningPreference);
  const [mobility, setMobility] = useState<TripMobility>(seed.mobility);
  const [tripSeasonFlexible, setTripSeasonFlexible] = useState(seed.tripSeasonFlexible);
  const [tripMonth, setTripMonth] = useState(seed.tripMonth);
  const [tripYear, setTripYear] = useState(seed.tripYear);
  const [budget] = useState<Budget>(seed.budget);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const currentStepIndex = STEPS.findIndex((item) => item.key === step);

  const normalizedDestination = useMemo(
    () => normalizeDestinationInput(destination),
    [destination]
  );

  const tripDateForSeason = useMemo(() => {
    if (tripSeasonFlexible || !tripMonth || !tripYear) return null;
    return `${tripYear}-${tripMonth}`;
  }, [tripSeasonFlexible, tripMonth, tripYear]);

  const tripPreferences = useMemo<TripPreferences>(() => {
    const interests = combineInterests(selectedVibes, selectedInterests);
    return {
      destination: normalizedDestination || "not_sure",
      tripDays: selectedDays,
      startDate: flexibleDates || !startDate ? undefined : startDate,
      flexibleDates,
      budget,
      hotelStyles: [],
      interests,
      dining: selectedDining,
      priorityOrder: computePriorityOrder(selectedVibes, interests),
      travelCompanion,
      travelPace,
      morningPreference,
      mobility,
      tripDate: tripDateForSeason,
    };
  }, [
    normalizedDestination,
    selectedDays,
    startDate,
    flexibleDates,
    budget,
    selectedVibes,
    selectedInterests,
    selectedDining,
    travelCompanion,
    travelPace,
    morningPreference,
    mobility,
    tripDateForSeason,
  ]);


  const toggleInterest = (value: InterestTag) => {
    setSelectedInterests((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const toggleDining = (value: DiningTag) => {
    setSelectedDining((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const toggleVibe = (id: string) => {
    setSelectedVibes((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const canContinue = () => {
    switch (step) {
      case "days":
        return selectedDays > 0;
      case "vibe":
        return selectedVibes.length > 0;
      case "interests":
        return selectedInterests.length > 0;
      case "dining":
        return selectedDining.length > 0;
      case "extras":
        return true;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    if (step === "result") return;
    if (currentStepIndex < STEPS.length - 1) {
      setStep(STEPS[currentStepIndex + 1].key);
      return;
    }
    await generatePlan();
  };

  const prevStep = () => {
    if (currentStepIndex <= 0) {
      onBack?.();
      return;
    }
    setStep(STEPS[currentStepIndex - 1].key);
  };

  const reset = () => {
    setStep("days");
    setSelectedDays(3);
    setCustomDays("");
    setStartDate("");
    setFlexibleDates(false);
    setSelectedVibes([]);
    setSelectedInterests([]);
    setSelectedDining([]);
    setTravelCompanion("solo");
    setTravelPace("moderate");
    setMorningPreference("normal");
    setTripSeasonFlexible(true);
    setTripMonth("");
    setTripYear("");
    setError("");
  };

  const generatePlan = async () => {
    if (!normalizedDestination) {
      setError("Please enter a valid destination city or region before generating.");
      return;
    }
    setIsLoading(true);
    setError("");
    setStep("result");
    try {
      let prefsToSave = tripPreferences;
      if (prefsToSave.destinationLat == null || prefsToSave.destinationLng == null) {
        const c = await fetchDestinationCenter(normalizedDestination);
        if (c) {
          prefsToSave = { ...prefsToSave, destinationLat: c.lat, destinationLng: c.lng };
        }
      }

      const prefsForApi = mergeSwapHintsForApi(prefsToSave);
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefsForApi),
      });
      const data = (await response.json()) as { items?: ItineraryItem[]; error?: string };
      if (!response.ok || !data.items?.length) {
        throw new Error(data.error ?? "Failed to generate travel plan");
      }
      saveTrip({ preferences: prefsForApi, items: data.items });
      router.push("/itinerary");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  const renderOptions = () => {
    switch (step) {
      case "days":
        return (
          <div className="flex flex-col items-center gap-6">
            {normalizedDestination ? (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary">
                  Destination: {normalizedDestination}
                </span>
              </div>
            ) : (
              <div className="w-full max-w-md">
                <DestinationAutocomplete
                  value={destination}
                  onChange={setDestination}
                  placeholder="Where do you want to go?"
                  className="w-full"
                  inputClassName="w-full rounded-2xl border border-border/40 bg-muted px-4 py-3 text-center text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              {DAY_OPTIONS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setSelectedDays(day);
                    setCustomDays("");
                  }}
                  className={`flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                    selectedDays === day && !customDays
                      ? "glass-float-card border-primary bg-primary/10 text-primary shadow-[0_10px_24px_rgba(110,97,61,0.12)]"
                      : "glass-float-card border-border/40 bg-card/60 text-muted-foreground"
                  }`}
                >
                  <span className="text-lg font-bold leading-none">{day}</span>
                  <span className="mt-0.5 text-[10px]">{day === 1 ? "day" : "days"}</span>
                </button>
              ))}
            </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">or enter custom:</span>
              <input
                type="number"
                min="1"
                max="60"
                placeholder="21"
                value={customDays}
                onChange={(event) => {
                  setCustomDays(event.target.value);
                  const value = Number.parseInt(event.target.value, 10);
                  if (value > 0) setSelectedDays(value);
                }}
                className={`w-24 rounded-xl border px-4 py-2.5 text-center text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary ${
                  customDays ? "border-primary bg-primary/5" : "border-border/40 bg-muted"
                }`}
              />
              </div>

              <div className="mt-2 w-full border-t border-border/30 pt-5">
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  When do you want to go?
                </p>
                <div className="flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFlexibleDates((current) => {
                        const next = !current;
                        if (next) setStartDate("");
                        return next;
                      });
                    }}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-3 transition-all duration-200 ${
                      flexibleDates
                        ? "glass-float-card border-primary bg-primary/10 text-primary shadow-[0_10px_24px_rgba(110,97,61,0.12)]"
                        : "glass-float-card border-border/40 bg-card/60 text-muted-foreground"
                    }`}
                  >
                    <CalendarDays className="h-4 w-4" />
                    <span className="text-sm font-semibold">I&apos;m flexible</span>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                        flexibleDates ? "border-primary bg-primary" : "border-border/60"
                      }`}
                    >
                      {flexibleDates && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                    </div>
                  </button>

                  {!flexibleDates && (
                    <label className="glass-float-card flex w-full max-w-xs items-center gap-3 rounded-2xl border-2 border-border/40 bg-card/60 px-5 py-3 text-sm font-medium text-muted-foreground transition-all">
                      <CalendarDays className="h-4 w-4" />
                      <input
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="w-full bg-transparent text-foreground outline-none"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          );
      case "vibe":
        return VIBES.map((item) => (
          <OptionCard
            key={item.id}
            item={item}
            selected={selectedVibes.includes(item.id)}
            onClick={() => toggleVibe(item.id)}
          />
        ));
      case "interests":
        return INTERESTS.map((item) => (
          <OptionCard
            key={item.id}
            item={item}
            selected={selectedInterests.includes(item.value)}
            onClick={() => toggleInterest(item.value)}
          />
        ));
      case "dining":
        return DINING.map((item) => (
          <OptionCard
            key={item.id}
            item={item}
            selected={selectedDining.includes(item.value)}
            onClick={() => toggleDining(item.value)}
          />
        ));
      case "extras":
        return (
          <div className="flex w-full max-w-xl flex-col gap-8">
            <div className="space-y-3">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Who are you traveling with?
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {COMPANION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTravelCompanion(opt.value)}
                    className={`rounded-2xl border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                      travelCompanion === opt.value
                        ? "border-primary bg-primary/10 text-primary shadow-[0_10px_24px_rgba(110,97,61,0.12)]"
                        : "border-border/40 bg-card/60 text-muted-foreground hover:border-foreground/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Travel pace
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                {PACE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTravelPace(opt.value)}
                    className={`w-full min-w-0 flex-1 rounded-2xl border-2 p-4 text-left transition-all sm:min-w-[160px] sm:max-w-[220px] ${
                      travelPace === opt.value
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border/40 bg-card/60 hover:border-foreground/15"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-foreground">{opt.label}</span>
                    <span className="mt-1 block text-xs leading-snug text-muted-foreground">{opt.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Morning person?
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                {MORNING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMorningPreference(opt.value)}
                    className={`w-full min-w-0 flex-1 rounded-2xl border-2 p-4 text-left transition-all sm:min-w-[140px] sm:max-w-[200px] ${
                      morningPreference === opt.value
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border/40 bg-card/60 hover:border-foreground/15"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-foreground">{opt.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{opt.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="flex items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Car className="h-3.5 w-3.5" />
                How will you get around?
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                {MOBILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMobility(opt.value)}
                    className={`w-full min-w-0 flex-1 rounded-2xl border-2 p-4 text-left transition-all sm:min-w-[140px] sm:max-w-[220px] ${
                      mobility === opt.value
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border/40 bg-card/60 hover:border-foreground/15"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-foreground">{opt.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{opt.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-border/30 pt-6">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Trip month <span className="font-normal normal-case tracking-normal">(optional)</span>
              </p>
              <p className="text-center text-xs text-muted-foreground">
                For seasonal tips (weather, events). Separate from the exact start date on the first step.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTripSeasonFlexible((prev) => {
                    const next = !prev;
                    if (next) {
                      setTripMonth("");
                      setTripYear("");
                    }
                    return next;
                  });
                }}
                className={`mx-auto flex w-full max-w-xs items-center justify-center gap-3 rounded-2xl border-2 px-5 py-3 transition-all ${
                  tripSeasonFlexible
                    ? "border-primary bg-primary/10 text-primary shadow-[0_10px_24px_rgba(110,97,61,0.12)]"
                    : "border-border/40 bg-card/60 text-muted-foreground"
                }`}
              >
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span className="text-sm font-semibold">I&apos;m flexible on month</span>
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    tripSeasonFlexible ? "border-primary bg-primary" : "border-border/60"
                  }`}
                >
                  {tripSeasonFlexible && (
                    <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                  )}
                </div>
              </button>
              {!tripSeasonFlexible && (
                <div className="mx-auto flex w-full max-w-md flex-wrap justify-center gap-3">
                  <select
                    value={tripMonth}
                    onChange={(e) => setTripMonth(e.target.value)}
                    aria-label="Trip month"
                    className="min-w-[160px] flex-1 rounded-2xl border-2 border-border/40 bg-muted px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Month</option>
                    {SEASON_MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={tripYear}
                    onChange={(e) => setTripYear(e.target.value)}
                    aria-label="Trip year"
                    className="min-w-[120px] flex-1 rounded-2xl border-2 border-border/40 bg-muted px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Year</option>
                    {seasonYearOptions().map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="flex min-h-screen flex-col items-center px-4 py-8 md:px-8">
      <div className="mb-6 w-full max-w-3xl pt-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-xs font-medium tracking-wide text-muted-foreground">
            AI-Powered Travel Planning
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
          Plan Your Perfect <span className="text-primary">Journey</span>
        </h1>
      </div>

      <div className="w-full max-w-3xl flex-1">
        {step !== "result" && (
          <div className="rounded-3xl border border-border/40 bg-card/80 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-10">
            <div className="mb-10 flex items-center justify-center gap-1 sm:gap-3">
              {STEPS.map((item, index) => {
                const isActive = currentStepIndex === index;
                const isDone = currentStepIndex > index;
                return (
                  <div key={item.key} className="flex items-center gap-1 sm:gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                          isActive
                            ? "border-primary bg-primary/15 text-primary"
                            : isDone
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
                      </div>
                      <span
                        className={`hidden text-xs font-medium sm:inline ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`h-px w-6 sm:w-10 ${isDone ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mb-8 text-center">
              <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">
                {stepContent[step].heading}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{stepContent[step].sub}</p>
            </div>

            {step === "days" || step === "extras" ? (
              renderOptions()
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{renderOptions()}</div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-border/30 pt-6">
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex items-center gap-3">
                {step === "days" && (
                  <button
                    type="button"
                    onClick={onAskAi}
                    className="hidden rounded-full border border-border px-5 py-3 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:border-foreground hover:text-foreground sm:inline-flex"
                  >
                    Ask AI instead
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void nextStep()}
                  disabled={!canContinue()}
                  className="flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {currentStepIndex === STEPS.length - 1 ? (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate Plan
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="rounded-3xl border border-border/40 bg-card/80 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
            {isLoading && !error && (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Crafting your recommendation and opening the final itinerary page...
                </p>
              </div>
            )}

            {error && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={reset}
                    className="flex items-center gap-2 rounded-full border border-primary px-6 py-2.5 text-sm font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Plan another trip
                  </button>
                  {onBack && (
                    <button
                      type="button"
                      onClick={onBack}
                      className="flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:border-foreground hover:text-foreground"
                    >
                      <Home className="h-3.5 w-3.5" /> Back to Home
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
