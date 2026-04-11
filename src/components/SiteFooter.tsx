import Link from "next/link";

const footerLinks = [
  { label: "Destinations", href: "/destinations" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Preferences", href: "/preferences" },
  { label: "Itinerary", href: "/itinerary" },
];

export function SiteFooter() {
  return (
    <footer className="bg-earth-dark text-primary-foreground/75">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="block font-display text-2xl font-bold italic text-primary-foreground">
              Personal Traveling Agent
            </span>
            <p className="mt-4 text-sm leading-7 text-primary-foreground/55">
              A Lovable-inspired frontend powered by the recommendation and itinerary code already
              living in this Next.js app.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold text-primary-foreground">
              Planner
            </h4>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-primary-foreground/55 transition hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold text-primary-foreground">
              What&apos;s Live
            </h4>
            <p className="mt-4 text-sm leading-7 text-primary-foreground/55">
              Destination chat, preference-based generation, interactive itinerary review, and stop
              swapping are all wired into the merged site.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold text-primary-foreground">
              Local AI
            </h4>
            <p className="mt-4 text-sm leading-7 text-primary-foreground/55">
              Start Ollama before generating recommendations or using the destination chat.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-8 text-center">
          <p className="text-xs tracking-[0.2em] text-primary-foreground/35">
            © 2026 Personal Traveling Agent
          </p>
        </div>
      </div>
    </footer>
  );
}
