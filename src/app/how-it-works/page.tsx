import Link from "next/link";
import { MessageSquare, Map, Settings2, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

const steps = [
  {
    title: "Chat with AI",
    description:
      "Start from the homepage and ask for destination ideas. Ollama helps narrow your options and confirm a place to plan around.",
    icon: MessageSquare,
  },
  {
    title: "Shape the trip",
    description:
      "Use the newer light planner flow to choose trip length, vibe, interests, hotels, and dining preferences.",
    icon: Settings2,
  },
  {
    title: "Generate the itinerary",
    description:
      "The app builds a day-by-day plan with mapped stops, travel-time estimates, ratings, and Google Maps links.",
    icon: Map,
  },
  {
    title: "Refine and continue",
    description:
      "Swap individual stops, review the route, and keep polishing the trip until it feels right for you.",
    icon: Sparkles,
  },
] as const;

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="border-b border-border bg-gradient-to-b from-earth-sand/35 via-background to-background">
          <div className="mx-auto max-w-5xl px-4 py-20 text-center md:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Planner Flow
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold italic tracking-tight md:text-6xl">
              How It Works
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              The new UI keeps the Lovable feel, but routes everything through your merged Next.js
              planner and local Ollama chat flow.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 md:px-6 md:py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="rounded-[28px] border border-border bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-earth-olive/10 text-earth-olive">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Step {index + 1}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold italic">{step.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 rounded-[28px] border border-border bg-earth-dark p-8 text-primary-foreground">
            <h2 className="font-display text-3xl font-bold italic">Ready to try it?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-primary-foreground/70">
              Head back to the homepage to ask for AI suggestions, or jump directly into the
              planning flow if you already know your destination.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-earth-olive px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
