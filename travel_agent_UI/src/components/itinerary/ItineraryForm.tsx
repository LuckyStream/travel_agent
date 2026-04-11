import { useState } from "react";
import { MapPin, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const PREFERENCE_TAGS = [
  "Culture & History",
  "Food & Wine",
  "Nature & Hiking",
  "Beach & Relaxation",
  "Nightlife",
  "Shopping",
  "Adventure Sports",
  "Photography",
  "Budget-Friendly",
  "Luxury",
  "Family-Friendly",
  "Off the Beaten Path",
];

const COMPANION_OPTIONS = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family_with_kids", label: "Family with Kids" },
  { value: "friends_group", label: "Friends Group" },
] as const;

const PACE_OPTIONS = [
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
] as const;

const MORNING_OPTIONS = [
  { value: "early_bird", label: "Early Bird", hint: "Start by 8 AM" },
  { value: "normal", label: "Normal", hint: "Start by 10 AM" },
  { value: "late_riser", label: "Late Riser", hint: "Start after 11 AM" },
] as const;

const MONTHS = [
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

function yearOptions(): number[] {
  const y = new Date().getFullYear();
  return [y, y + 1, y + 2];
}

export type ItineraryGeneratePayload = {
  destination: string;
  days: number;
  preferences: string[];
  travelCompanion: string;
  travelPace: string;
  morningPreference: string;
  tripDate: string | null;
};

interface Props {
  onGenerate: (payload: ItineraryGeneratePayload) => void;
  loading: boolean;
}

const ItineraryForm = ({ onGenerate, loading }: Props) => {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);

  const [travelCompanion, setTravelCompanion] = useState<string>("solo");
  const [travelPace, setTravelPace] = useState<string>("moderate");
  const [morningPreference, setMorningPreference] = useState<string>("normal");
  const [tripFlexible, setTripFlexible] = useState(true);
  const [tripMonth, setTripMonth] = useState("");
  const [tripYear, setTripYear] = useState("");

  const togglePref = (pref: string) => {
    setSelectedPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    let tripDate: string | null = null;
    if (!tripFlexible && tripMonth && tripYear) {
      tripDate = `${tripYear}-${tripMonth}`;
    }

    onGenerate({
      destination: destination.trim(),
      days,
      preferences: selectedPrefs,
      travelCompanion,
      travelPace,
      morningPreference,
      tripDate,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3 italic">
          Plan Your Journey
        </h1>
        <p className="text-muted-foreground text-lg">
          AI-powered day-by-day itineraries, tailored to you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Destination */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
            Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Tokyo, Japan"
              className="w-full bg-muted rounded-md pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              required
            />
          </div>
        </div>

        {/* Days */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
            Number of Days
          </label>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 5, 7, 10, 14].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`px-3.5 py-2 rounded-md text-sm font-medium transition ${
                    days === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
            Travel Style
          </label>
          <div className="flex flex-wrap gap-2">
            {PREFERENCE_TAGS.map((pref) => (
              <button
                key={pref}
                type="button"
                onClick={() => togglePref(pref)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  selectedPrefs.includes(pref)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-foreground/30"
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>

        {/* Who are you traveling with? */}
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
            Who are you traveling with?
          </label>
          <div className="flex flex-wrap gap-2">
            {COMPANION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTravelCompanion(opt.value)}
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition border ${
                  travelCompanion === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-foreground/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Travel pace */}
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
            Travel Pace
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {PACE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTravelPace(opt.value)}
                className={`flex-1 min-w-[140px] rounded-md border px-3 py-2.5 text-left transition ${
                  travelPace === opt.value
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border bg-card hover:border-foreground/20"
                }`}
              >
                <span className="block text-sm font-semibold text-foreground">{opt.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground leading-snug">{opt.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Morning person */}
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
            Morning Person?
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {MORNING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMorningPreference(opt.value)}
                className={`flex-1 min-w-[120px] rounded-md border px-3 py-2.5 text-left transition ${
                  morningPreference === opt.value
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border bg-card hover:border-foreground/20"
                }`}
              >
                <span className="block text-sm font-semibold text-foreground">{opt.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{opt.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trip date (optional) */}
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
            Trip Date <span className="font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
            <input
              type="checkbox"
              checked={tripFlexible}
              onChange={(e) => {
                setTripFlexible(e.target.checked);
                if (e.target.checked) {
                  setTripMonth("");
                  setTripYear("");
                }
              }}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm font-medium text-foreground">I&apos;m flexible</span>
          </label>
          {!tripFlexible && (
            <div className="flex flex-wrap gap-3">
              <select
                value={tripMonth}
                onChange={(e) => setTripMonth(e.target.value)}
                className="min-w-[140px] flex-1 rounded-md border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Trip month"
              >
                <option value="">Month</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                value={tripYear}
                onChange={(e) => setTripYear(e.target.value)}
                className="min-w-[100px] flex-1 rounded-md border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Trip year"
              >
                <option value="">Year</option>
                {yearOptions().map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !destination.trim()}
          className="w-full bg-foreground text-background font-semibold py-3.5 rounded-md flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-40"
        >
          <Sparkles className="w-4 h-4" />
          Generate Itinerary
        </button>
      </form>
    </motion.div>
  );
};

export default ItineraryForm;
