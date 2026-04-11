import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const featuredDestinations = [
  {
    name: "Kyoto, Japan",
    image: "/destinations/japan.jpg",
    vibe: "Culture and calm",
    blurb: "Temples, tea houses, seasonal gardens, and slow mornings with a strong sense of place.",
  },
  {
    name: "Santorini, Greece",
    image: "/destinations/greece.jpg",
    vibe: "Sun and sea",
    blurb: "Clifftop stays, whitewashed villages, and relaxed evenings overlooking the caldera.",
  },
  {
    name: "Lisbon, Portugal",
    image: "/destinations/portugal.jpg",
    vibe: "Creative city break",
    blurb: "Hillside neighborhoods, trams, ocean light, and a great mix of food and design.",
  },
  {
    name: "Amalfi Coast, Italy",
    image: "/destinations/italy.jpg",
    vibe: "Romantic coast",
    blurb: "Colorful seaside towns, scenic drives, and long lunches with Mediterranean views.",
  },
  {
    name: "Bangkok + Islands, Thailand",
    image: "/destinations/thailand.jpg",
    vibe: "Food and adventure",
    blurb: "Street food energy, temples, night markets, and easy access to tropical beaches.",
  },
  {
    name: "Machu Picchu Region, Peru",
    image: "/destinations/peru.jpg",
    vibe: "Epic landscapes",
    blurb: "Mountain rail routes, ancient history, and dramatic high-altitude scenery.",
  },
] as const;

export default function DestinationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="border-b border-border bg-gradient-to-b from-earth-sand/35 via-background to-background">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center md:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Discover Our
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold italic tracking-tight md:text-6xl">
              Destinations
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Browse a curated set of places from the original Lovable-style experience and jump
              into planning with the newer light UI.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredDestinations.map((destination) => (
              <article
                key={destination.name}
                className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_8px_30px_rgba(0,0,0,0.05)]"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    {destination.vibe}
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-bold italic">
                    {destination.name}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {destination.blurb}
                  </p>
                  <Link
                    href={`/preferences?destination=${encodeURIComponent(destination.name)}`}
                    className="mt-5 inline-flex rounded-full bg-earth-olive px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    Start planning
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
