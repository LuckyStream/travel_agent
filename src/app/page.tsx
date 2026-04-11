"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { DestinationAutocomplete } from "@/components/DestinationAutocomplete";
import { DestinationChat } from "@/components/DestinationChat";
import { SiteHeader } from "@/components/SiteHeader";
import { TravelPlannerWizard } from "@/components/TravelPlannerWizard";

const heroSlides = [
  { image: "/hero-slides/01-santorini.jpg", alt: "Santorini white cliffs and blue sea" },
  { image: "/hero-slides/09-kyoto.jpg", alt: "Kyoto temple and cherry blossoms" },
  { image: "/hero-slides/11-patagonia.jpg", alt: "Patagonia mountains and glaciers" },
  { image: "/hero-slides/20-amalfi.jpg", alt: "Amalfi Coast cliffside village" },
  { image: "/hero-slides/27-lisbon.jpg", alt: "Lisbon colorful tram streets" },
  { image: "/hero-slides/34-zanzibar.jpg", alt: "Zanzibar tropical beach" },
] as const;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

type ActiveView = "home" | "wizard";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<ActiveView>("home");
  const [wizardDestination, setWizardDestination] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const launchWizard = useCallback((destination?: string) => {
    setWizardDestination(destination ?? "");
    setActiveView("wizard");
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    launchWizard(searchQuery.trim());
  };

  const handleBackToHome = useCallback(() => {
    setActiveView("home");
    setSearchQuery("");
  }, []);

  const handleAiConfirmedDestination = useCallback((destination: string) => {
    setChatOpen(false);
    launchWizard(destination);
  }, [launchWizard]);

  useEffect(() => {
    if (activeView !== "home") return;
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [activeView]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {activeView === "home" ? (
        <main>
          <section className="relative z-20 h-[90vh] min-h-[600px] overflow-visible">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.image}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img src={slide.image} alt={slide.alt} className="h-full w-full object-cover" />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-foreground/50" />

            <div className="stamp-badge absolute right-8 top-8 hidden border-primary-foreground/60 bg-primary-foreground/5 text-primary-foreground backdrop-blur-sm md:flex md:right-16 md:top-12">
              <span>
                Your
                <br />
                Personal
                <br />
                Traveling
                <br />
                Agent
              </span>
            </div>

            <div className="relative flex h-full max-w-7xl flex-col justify-end px-6 pb-20 md:px-16 lg:px-24">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary-foreground/60">
                  YOUR PERSONAL TRAVELING AGENT
                </p>
                <h1 className="mb-4 max-w-5xl font-display text-4xl font-bold italic leading-[1.02] tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
                  Van Trips around the world,
                  <br />
                  we&apos;ve got you covered
                </h1>
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
                  Where do you want to go?
                </p>

                <div className="flex max-w-2xl flex-col items-stretch gap-3 sm:flex-row">
                  <div className="flex-1">
                    <DestinationAutocomplete
                      value={searchQuery}
                      onChange={setSearchQuery}
                      onSubmit={handleSearch}
                      onSelectSuggestion={(value) => launchWizard(value)}
                      className="w-full"
                      inputClassName="w-full min-h-[76px] rounded-[30px] border border-primary-foreground/10 bg-card/75 py-6 pl-8 pr-8 text-base text-foreground shadow-[0_10px_36px_rgba(0,0,0,0.14)] backdrop-blur-xl transition-shadow duration-500 hover:shadow-[0_14px_44px_rgba(0,0,0,0.2)] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    className="group flex items-center gap-3 rounded-2xl border border-primary-foreground/10 bg-card/70 px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 transition-colors duration-300 group-hover:bg-primary/25">
                      <Sparkles className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold leading-tight text-foreground">
                        Ask AI suggestions
                      </span>
                      <span className="mt-0.5 block text-xs leading-tight text-muted-foreground">
                        Let AI find your destination
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0">
              <svg
                viewBox="0 0 1440 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
              >
                <path
                  d="M0 30C240 60 480 0 720 30C960 60 1200 0 1440 30V60H0V30Z"
                  fill="hsl(40 33% 96%)"
                />
              </svg>
            </div>
          </section>

          <section className="relative z-0 border-t border-border">
            <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
              <div className="mb-10 text-center">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                  When do you want to travel?
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {months.map((month) => (
                  <button
                    key={month}
                    type="button"
                    className="rounded-full border border-border px-5 py-2 text-xs font-medium tracking-wide text-muted-foreground transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>
      ) : (
        <main className="min-h-screen">
          <TravelPlannerWizard
            initialDestination={wizardDestination}
            onAskAi={() => setChatOpen(true)}
            onBack={handleBackToHome}
          />
        </main>
      )}

      <DestinationChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        tripDays={3}
        onConfirmDestination={handleAiConfirmedDestination}
      />
    </div>
  );
}
