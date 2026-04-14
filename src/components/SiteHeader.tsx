"use client";

import Link from "next/link";

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
        </nav>

        <Link
          href="/?home=1"
          onClick={(e) => {
            e.preventDefault();
            window.location.assign("/?home=1");
          }}
          className="md:absolute md:left-1/2 md:-translate-x-1/2 font-display text-[2.35rem] font-bold italic tracking-tight text-foreground lg:text-[2.9rem]"
        >
          R.O.A.M.
        </Link>

      </div>
    </header>
  );
}
