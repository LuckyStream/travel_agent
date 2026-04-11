import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Sparkles, ArrowRight, ArrowLeft, Loader2, RotateCcw, Check, Home,
  Building2, Trees, Waves, Landmark,
  Mountain, UtensilsCrossed, Camera, Flower2, Music, ShoppingBag, Palette, Sailboat,
  BedDouble, Hotel, Star, House,
  Sandwich, ChefHat, Wine, Salad, Calendar as CalendarIcon,
  type LucideIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface TravelAgentHandle {
  startAt: (step: "vibe" | "interests", destination?: string) => void;
}

interface TravelAgentProps {
  initialStep?: "vibe" | "interests";
  initialDestination?: string;
  onBack?: () => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/travel-plan`;

type Step = "days" | "vibe" | "interests" | "hotels" | "dining" | "result";

const STEPS: { key: Step; label: string }[] = [
  { key: "days", label: "Duration" },
  { key: "vibe", label: "City Style" },
  { key: "interests", label: "Interests" },
  { key: "hotels", label: "Hotels" },
  { key: "dining", label: "Dining" },
];

const DAY_OPTIONS = [1, 2, 3, 4, 5, 7, 10, 14];

interface OptionItem {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

const VIBES: OptionItem[] = [
  { id: "city", title: "Vibrant City", desc: "Bustling streets, nightlife, and urban adventures", icon: Building2 },
  { id: "nature", title: "Nature Escape", desc: "Serene landscapes, mountains, and outdoor exploration", icon: Trees },
  { id: "beach", title: "Beach Paradise", desc: "Crystal waters, sandy shores, and tropical vibes", icon: Waves },
  { id: "cultural", title: "Cultural Heritage", desc: "Historic sites, museums, and local traditions", icon: Landmark },
];

const INTERESTS: OptionItem[] = [
  { id: "adventure", title: "Adventure & Hiking", desc: "Trails, peaks, and outdoor thrills", icon: Mountain },
  { id: "food", title: "Food & Cooking", desc: "Local flavors and culinary experiences", icon: UtensilsCrossed },
  { id: "photography", title: "Photography", desc: "Capture stunning moments and scenery", icon: Camera },
  { id: "wellness", title: "Wellness & Spa", desc: "Relaxation, yoga, and rejuvenation", icon: Flower2 },
  { id: "nightlife", title: "Entertainment", desc: "Shows, nightlife, and fun activities", icon: Music },
  { id: "shopping", title: "Shopping", desc: "Markets, boutiques, and local finds", icon: ShoppingBag },
  { id: "history", title: "Culture & Arts", desc: "Museums, galleries, and local traditions", icon: Palette },
  { id: "water", title: "Hidden Gems", desc: "Off-the-beaten-path discoveries", icon: Sailboat },
];

const HOTELS: OptionItem[] = [
  { id: "budget", title: "Budget Hostels", desc: "Affordable & social", icon: BedDouble },
  { id: "boutique", title: "Boutique Hotels", desc: "Unique & stylish", icon: Hotel },
  { id: "luxury", title: "Luxury Resorts", desc: "Premium comfort", icon: Star },
  { id: "airbnb", title: "Local Stays", desc: "Apartments & homes", icon: House },
];

const DINING: OptionItem[] = [
  { id: "street", title: "Street Food", desc: "Authentic & cheap eats", icon: Sandwich },
  { id: "local", title: "Local Restaurants", desc: "Traditional cuisine", icon: ChefHat },
  { id: "fine", title: "Fine Dining", desc: "Upscale experiences", icon: Wine },
  { id: "vegan", title: "Vegan / Healthy", desc: "Plant-based options", icon: Salad },
];

const stepTransition = {
  initial: { opacity: 0, x: 60, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -60, filter: "blur(4px)" },
};

const stepTransitionConfig = {
  duration: 0.45,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

/* ─── Reusable option card ─── */
const OptionCard = ({
  item,
  selected,
  onClick,
  index,
}: {
  item: OptionItem;
  selected: boolean;
  onClick: () => void;
  index: number;
}) => {
  const Icon = item.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-300 w-full ${
        selected
          ? "border-primary bg-primary/5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
          : "border-border/40 bg-card/60 hover:border-border hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
          selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="w-5 h-5" strokeWidth={1.8} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold transition-colors duration-200 ${selected ? "text-foreground" : "text-foreground/80"}`}>
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground leading-snug mt-0.5">{item.desc}</p>
      </div>

      {/* Checkbox circle */}
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
          selected
            ? "border-primary bg-primary"
            : "border-border/60 bg-transparent"
        }`}
      >
        {selected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
            <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};

const TravelAgent = forwardRef<TravelAgentHandle, TravelAgentProps>(
  ({ initialStep = "vibe", initialDestination = "", onBack }, ref) => {
    const [step, setStep] = useState<Step>(initialStep === "vibe" || initialStep === "interests" ? "days" : initialStep);
    const [destination, setDestination] = useState(initialDestination);
    const [selectedDays, setSelectedDays] = useState<number>(3);
    const [customDays, setCustomDays] = useState("");
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [flexibleDates, setFlexibleDates] = useState(false);
    const [selectedVibe, setSelectedVibe] = useState<string>("");
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedHotel, setSelectedHotel] = useState<string>("");
    const [selectedDining, setSelectedDining] = useState<string[]>([]);
    const [result, setResult] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setStep("days");
      setDestination(initialDestination);
    }, [initialStep, initialDestination]);

    useImperativeHandle(ref, () => ({
      startAt: (targetStep: "vibe" | "interests", dest?: string) => {
        reset();
        if (dest) setDestination(dest);
        setStep(targetStep);
      },
    }));

    const currentStepIndex = STEPS.findIndex((s) => s.key === step);

    const toggleMulti = (id: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) =>
      setList(list.includes(id) ? list.filter((i) => i !== id) : [...list, id]);

    const canContinue = () => {
      switch (step) {
        case "days": return selectedDays > 0;
        
        case "vibe": return !!selectedVibe;
        case "interests": return selectedInterests.length > 0;
        case "hotels": return !!selectedHotel;
        case "dining": return selectedDining.length > 0;
        default: return false;
      }
    };

    const nextStep = () => {
      const idx = currentStepIndex;
      if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
      else generatePlan();
    };

    const prevStep = () => {
      const idx = currentStepIndex;
      if (idx > 0) setStep(STEPS[idx - 1].key);
      else onBack?.();
    };

    const generatePlan = async () => {
      setIsLoading(true);
      setResult("");
      setError("");
      setStep("result");

      const vibe = VIBES.find((v) => v.id === selectedVibe);
      const interests = selectedInterests.map((id) => INTERESTS.find((i) => i.id === id)?.title).filter(Boolean);
      const hotel = HOTELS.find((h) => h.id === selectedHotel);
      const dining = selectedDining.map((id) => DINING.find((d) => d.id === id)?.title).filter(Boolean);

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            destination: destination || "not_sure",
            days: selectedDays,
            specificDate: startDate && !flexibleDates ? format(startDate, "yyyy-MM-dd") : undefined,
            preferences: `Travel vibe: ${vibe?.title}. Interests: ${interests.join(", ")}. Accommodation: ${hotel?.title}. Dining: ${dining.join(", ")}.`,
          }),
        });

        if (!resp.ok || !resp.body) {
          const data = await resp.json().catch(() => ({}));
          throw new Error(data.error || "Failed to generate travel plan");
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                setResult(fullText);
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    const reset = () => {
      setStep("days");
      setSelectedDays(3);
      setCustomDays("");
      setStartDate(undefined);
      setFlexibleDates(false);
      setSelectedVibe("");
      setSelectedInterests([]);
      setSelectedHotel("");
      setSelectedDining([]);
      setResult("");
      setError("");
    };

    /* ─── Step headings config ─── */
    const stepContent: Record<Exclude<Step, "result">, { heading: string; sub: string }> = {
      days: { heading: "How many days?", sub: "Choose your trip duration and dates" },
      vibe: { heading: "What's your travel vibe?", sub: "Choose the atmosphere that speaks to your soul" },
      interests: { heading: "What excites you most?", sub: "Select all the experiences you'd love to have" },
      hotels: { heading: "Where do you want to stay?", sub: "Pick your ideal accommodation style" },
      dining: { heading: "How do you like to eat?", sub: "Select your dining preferences" },
    };

    /* ─── Step indicator ─── */
    const stepIndicator = (
      <div className="flex items-center justify-center gap-1 sm:gap-3 mb-10">
        {STEPS.map((s, i) => {
          const isActive = currentStepIndex === i;
          const isDone = currentStepIndex > i || step === "result";
          return (
            <div key={s.key} className="flex items-center gap-1 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isActive
                      ? "hsl(var(--primary) / 0.15)"
                      : isDone
                        ? "hsl(var(--primary))"
                        : "transparent",
                    borderColor: isActive
                      ? "hsl(var(--primary))"
                      : isDone
                        ? "hsl(var(--primary))"
                        : "hsl(var(--border))",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 ${
                    isActive
                      ? "text-primary"
                      : isDone
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {isDone && !isActive ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </motion.div>
                <span
                  className={`text-xs font-medium hidden sm:inline transition-colors duration-300 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isDone ? "hsl(var(--primary))" : "hsl(var(--border))",
                  }}
                  className="w-6 sm:w-10 h-px"
                />
              )}
            </div>
          );
        })}
      </div>
    );

    /* ─── Render options for current step ─── */
    const renderOptions = () => {
      switch (step) {
        case "days":
          return (
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-wrap justify-center gap-3">
                {DAY_OPTIONS.map((d) => (
                  <motion.button
                    key={d}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedDays(d); setCustomDays(""); }}
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-200 ${
                      selectedDays === d && !customDays
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/40 bg-card/60 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <span className="text-lg font-bold leading-none">{d}</span>
                    <span className="text-[10px] mt-0.5">{d === 1 ? "day" : "days"}</span>
                  </motion.button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">or enter custom:</span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  placeholder="e.g. 21"
                  value={customDays}
                  onChange={(e) => {
                    setCustomDays(e.target.value);
                    const v = parseInt(e.target.value);
                    if (v > 0) setSelectedDays(v);
                  }}
                  className={`w-24 px-4 py-2.5 rounded-xl text-sm font-medium bg-muted border transition focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 text-center ${
                    customDays ? "border-primary" : "border-border/40"
                  }`}
                />
              </div>

              {/* Date section */}
              <div className="w-full border-t border-border/30 pt-5 mt-2">
                <p className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-3 text-center">When do you want to go?</p>
                <div className="flex flex-col items-center gap-4">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setFlexibleDates(!flexibleDates); setStartDate(undefined); }}
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all duration-200 ${
                      flexibleDates
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/40 bg-card/60 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold">I'm flexible</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      flexibleDates ? "border-primary bg-primary" : "border-border/60"
                    }`}>
                      {flexibleDates && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                    </div>
                  </motion.button>

                  {!flexibleDates && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className={cn(
                          "flex items-center gap-2 px-5 py-3 rounded-2xl border-2 text-sm font-medium transition-all",
                          startDate
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/40 bg-card/60 text-muted-foreground hover:border-border"
                        )}>
                          <CalendarIcon className="w-4 h-4" />
                          {startDate ? format(startDate, "MMMM d, yyyy") : "Pick a start date"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="center">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>
          );
        case "vibe":
          return VIBES.map((item, i) => (
            <OptionCard
              key={item.id}
              item={item}
              selected={selectedVibe === item.id}
              onClick={() => setSelectedVibe(item.id)}
              index={i}
            />
          ));
        case "interests":
          return INTERESTS.map((item, i) => (
            <OptionCard
              key={item.id}
              item={item}
              selected={selectedInterests.includes(item.id)}
              onClick={() => toggleMulti(item.id, selectedInterests, setSelectedInterests)}
              index={i}
            />
          ));
        case "hotels":
          return HOTELS.map((item, i) => (
            <OptionCard
              key={item.id}
              item={item}
              selected={selectedHotel === item.id}
              onClick={() => setSelectedHotel(item.id)}
              index={i}
            />
          ));
        case "dining":
          return DINING.map((item, i) => (
            <OptionCard
              key={item.id}
              item={item}
              selected={selectedDining.includes(item.id)}
              onClick={() => toggleMulti(item.id, selectedDining, setSelectedDining)}
              index={i}
            />
          ));
        default:
          return null;
      }
    };

    const currentContent = step !== "result" ? stepContent[step] : null;

    return (
      <section ref={sectionRef} className="min-h-screen flex flex-col items-center px-4 md:px-8 py-8">
        {/* Header area */}
        <div className="w-full max-w-3xl text-center mb-6 pt-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground tracking-wide">AI-Powered Travel Planning</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight"
          >
            Plan Your Perfect{" "}
            <span className="text-primary">Journey</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm md:text-base mt-3 max-w-lg mx-auto leading-relaxed"
          >
            Tell us what you love, and we'll craft a personalized travel experience that matches your unique style and preferences.
          </motion.p>
        </div>

        {/* Card area */}
        <div className="w-full max-w-3xl flex-1">
          <AnimatePresence mode="wait">
            {step !== "result" && (
              <motion.div
                key={step}
                variants={stepTransition}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={stepTransitionConfig}
              >
                <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/40 p-6 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.06)]">
                  {stepIndicator}

                  {/* Destination badge */}
                  {destination && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-6"
                    >
                      <span className="inline-flex items-center gap-2 bg-primary/8 text-primary px-4 py-1.5 rounded-full text-xs font-semibold border border-primary/15">
                        ✈️ Destination: {destination}
                      </span>
                    </motion.div>
                  )}

                  {/* Step heading */}
                  {currentContent && (
                    <div className="text-center mb-8">
                      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                        {currentContent.heading}
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">{currentContent.sub}</p>
                    </div>
                  )}

                  {/* Options grid */}
                  {step === "days" ? (
                    renderOptions()
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {renderOptions()}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/30">
                    <motion.button
                      whileHover={{ x: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={prevStep}
                      className="flex items-center gap-2 text-muted-foreground text-sm font-medium hover:text-foreground transition-colors duration-200"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: canContinue() ? 1.02 : 1 }}
                      whileTap={{ scale: canContinue() ? 0.97 : 1 }}
                      onClick={nextStep}
                      disabled={!canContinue()}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 rounded-full font-semibold text-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                    >
                      {currentStepIndex === STEPS.length - 1 ? (
                        <><Sparkles className="w-4 h-4" /> Generate Plan</>
                      ) : (
                        <>Continue <ArrowRight className="w-4 h-4" /></>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/40 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.06)] space-y-6">
                  {isLoading && !result && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                        <Loader2 className="w-10 h-10 text-primary" />
                      </motion.div>
                      <p className="text-muted-foreground text-sm">Crafting your perfect travel plan...</p>
                    </div>
                  )}

                  {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-destructive/10 text-destructive rounded-2xl p-4 text-sm">
                      {error}
                    </motion.div>
                  )}

                  {result && (
                    <div className="prose prose-sm max-w-none text-foreground">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{result}</div>
                    </div>
                  )}

                  {(result || error) && !isLoading && (
                    <div className="flex items-center justify-center gap-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={reset}
                        className="flex items-center gap-2 border border-primary text-primary px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Plan another trip
                      </motion.button>
                      {onBack && (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={onBack}
                          className="flex items-center gap-2 border border-border text-muted-foreground px-6 py-2.5 rounded-full font-semibold text-sm hover:text-foreground hover:border-foreground transition-all duration-300"
                        >
                          <Home className="w-3.5 h-3.5" /> Back to Home
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    );
  }
);

TravelAgent.displayName = "TravelAgent";

export default TravelAgent;
