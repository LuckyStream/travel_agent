import Link from "next/link";
import { Search } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/destinations"
            className="text-sm font-medium tracking-wide text-foreground/70 transition hover:text-foreground"
          >
            Destinations
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm font-medium tracking-wide text-foreground/70 transition hover:text-foreground"
          >
            How It Works
          </Link>
          <Link
            href="/itinerary"
            className="text-sm font-medium tracking-wide text-foreground/70 transition hover:text-foreground"
          >
            Itinerary
          </Link>
        </nav>

        <Link
          href="/"
          className="md:absolute md:left-1/2 md:-translate-x-1/2 font-display text-xl font-bold italic tracking-tight text-foreground lg:text-2xl"
        >
          Your Personal Traveling Agent
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/destinations"
            className="hidden items-center gap-3 font-medium text-foreground/70 transition hover:text-foreground md:inline-flex"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Link>
          <Link
            href="/#plan-trip"
            className="rounded-full border border-earth-olive/30 bg-earth-olive px-4 py-2 font-medium text-primary-foreground transition hover:opacity-90"
          >
            Start planning
          </Link>
        </nav>
      </div>
    </header>
  );
}
