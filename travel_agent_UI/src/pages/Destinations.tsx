import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { continents } from "@/data/destinations";
import DestinationMarquee from "@/components/DestinationMarquee";

// Flag emoji map for countries
const countryFlags: Record<string, string> = {
  "France": "🇫🇷", "Greece": "🇬🇷", "Iceland": "🇮🇸", "Italy": "🇮🇹",
  "Netherlands": "🇳🇱", "Portugal": "🇵🇹", "Spain": "🇪🇸",
  "Philippines": "🇵🇭", "Indonesia": "🇮🇩", "Japan": "🇯🇵", "China": "🇨🇳",
  "Sri Lanka": "🇱🇰", "Thailand": "🇹🇭", "Vietnam": "🇻🇳",
  "Botswana": "🇧🇼", "Kenya": "🇰🇪", "Morocco": "🇲🇦", "South Africa": "🇿🇦",
  "Costa Rica": "🇨🇷", "Mexico": "🇲🇽",
  "Peru": "🇵🇪", "Colombia": "🇨🇴",
  "Australia": "🇦🇺", "New Zealand": "🇳🇿",
  "United States": "🇺🇸", "Canada": "🇨🇦",
};

// Pair continents for 2-column layout
const continentPairs = [
  ["Africa", "Asia"],
  ["Europe", "Central America"],
  ["North America", "Oceania"],
  ["South America"],
];

const Destinations = () => {
  const getContinentByName = (name: string) => continents.find(c => c.name === name);

  return (
    <Layout>
      {/* Hero with mountain silhouette */}
      <section className="relative h-[45vh] min-h-[320px] overflow-hidden bg-earth-dark">
        {/* Mountain silhouette SVG */}
        <div className="absolute inset-0 flex items-end">
          <svg viewBox="0 0 1440 320" className="w-full" preserveAspectRatio="none">
            <path d="M0,320 L0,200 Q100,120 200,180 Q280,220 360,160 Q420,110 500,140 Q560,170 620,100 Q700,20 780,80 Q840,130 900,90 Q960,50 1040,100 Q1100,140 1160,80 Q1220,30 1300,100 Q1360,150 1440,120 L1440,320 Z" fill="hsl(30, 15%, 18%)" opacity="0.6" />
            <path d="M0,320 L0,240 Q120,180 240,220 Q320,250 400,200 Q480,150 560,190 Q640,230 720,170 Q800,120 880,160 Q960,200 1040,150 Q1120,100 1200,150 Q1280,200 1360,170 L1440,180 L1440,320 Z" fill="hsl(30, 15%, 15%)" opacity="0.8" />
          </svg>
        </div>

        {/* Breadcrumb */}
        <div className="absolute top-6 left-6 md:left-16 z-10">
          <Link to="/" className="text-primary-foreground/40 text-xs hover:text-primary-foreground/70 transition">
            Personal Traveling Agent
          </Link>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary-foreground/40 text-[10px] uppercase tracking-[0.4em] mb-3 font-medium">Discover Our</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground italic tracking-tight">
              Destinations
            </h1>
          </motion.div>
        </div>

        {/* Wavy bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 20C240 40 480 0 720 20C960 40 1200 0 1440 20V40H0V20Z" fill="hsl(40, 33%, 96%)" />
          </svg>
        </div>
      </section>

      {/* Intro text */}
      <section className="max-w-3xl mx-auto px-6 py-14 md:py-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm text-muted-foreground leading-relaxed"
        >
          Here you'll find an overview of all destinations we've written about and gathered the best tips for!
          This way you can plan your next trip in no time. Do you already know what your next vacation destination will be?
          Or are you still looking for inspiration? Below you'll find tips for destinations in Asia, Africa, Central America,
          South America, Oceania and North America. Enjoy!
        </motion.p>
      </section>

      {/* Rolling destination images */}
      <DestinationMarquee />

      {/* Continents in 2-column layout */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pb-20">
        {continentPairs.map((pair, pairIndex) => (
          <div
            key={pairIndex}
            className={`grid ${pair.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1 max-w-[50%]"} gap-x-16 gap-y-12 mb-16`}
          >
            {pair.map((continentName) => {
              const continent = getContinentByName(continentName);
              if (!continent) return null;
              return (
                <motion.div
                  key={continent.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <Link
                    to={`/destinations/${continent.slug}`}
                    className="block mb-5"
                  >
                    <h2 className="text-[11px] uppercase tracking-[0.25em] font-semibold text-foreground/70 hover:text-foreground transition">
                      {continent.name}
                    </h2>
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    {continent.countries.map((country) => (
                      <Link
                        key={country.slug}
                        to={`/destinations/${continent.slug}/${country.slug}`}
                        className="inline-flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 text-xs text-foreground/70 hover:border-primary hover:text-foreground transition-all"
                      >
                        <span className="text-sm leading-none">{countryFlags[country.name] || "🌍"}</span>
                        {country.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </section>
    </Layout>
  );
};

export default Destinations;