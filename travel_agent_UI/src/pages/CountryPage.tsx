import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, ArrowRight, Mountain, Waves, Flame, Camera, TreePine, Bird, Compass, Snowflake, UtensilsCrossed, Landmark, Palmtree, Shell } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ArticleCard from "@/components/ArticleCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getCountryBySlug, getContinentBySlug, months } from "@/data/destinations";
import NotFound from "./NotFound";

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

const categoryIcons: Record<string, React.ElementType> = {
  "Nature": Mountain,
  "Adventure": Compass,
  "Hot Springs": Waves,
  "Wildlife": Bird,
  "Northern Lights": Snowflake,
  "Culture": Landmark,
  "Food": UtensilsCrossed,
  "Museums": Landmark,
  "Attractions": Camera,
  "Islands": Shell,
  "History": Landmark,
  "Beaches": Waves,
};

const ARTICLES_PER_PAGE = 6;

const CountryPage = () => {
  const { continent: continentSlug, country: countrySlug } = useParams<{
    continent: string;
    country: string;
  }>();
  const continent = getContinentBySlug(continentSlug || "");
  const country = getCountryBySlug(continentSlug || "", countrySlug || "");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [articlePage, setArticlePage] = useState(0);

  if (!country) return <NotFound />;

  const filteredArticles = activeCategory
    ? country.articles.filter((a) => a.category === activeCategory)
    : country.articles;

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    articlePage * ARTICLES_PER_PAGE,
    (articlePage + 1) * ARTICLES_PER_PAGE
  );

  const siblingCountries = continent?.countries.filter((c) => c.slug !== country.slug) || [];

  return (
    <Layout>
      {/* Photo hero */}
      <section className="relative h-[50vh] min-h-[350px] overflow-hidden">
        <img src={country.heroImage} alt={country.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/10 to-foreground/50" />

        {/* Breadcrumb */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-foreground/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 md:px-16 py-3 flex items-center gap-2 text-xs flex-wrap">
            <Link to="/" className="text-primary-foreground/50 hover:text-primary-foreground/80 transition">Personal Traveling Agent</Link>
            <span className="text-primary-foreground/30">›</span>
            <Link to="/destinations" className="text-primary-foreground/50 hover:text-primary-foreground/80 transition">Destinations</Link>
            {continent && (
              <>
                <span className="text-primary-foreground/30">›</span>
                <Link to={`/destinations/${continent.slug}`} className="text-primary-foreground/50 hover:text-primary-foreground/80 transition">{continent.name}</Link>
              </>
            )}
            <span className="text-primary-foreground/30">›</span>
            <span className="text-primary-foreground/70">{country.name}</span>
          </div>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary-foreground/50 text-[10px] uppercase tracking-[0.4em] mb-3 font-medium">Welcome to</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-primary-foreground italic tracking-tight">
              {country.name}
            </h1>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 20C240 40 480 0 720 20C960 40 1200 0 1440 20V40H0V20Z" fill="hsl(40, 33%, 96%)" />
          </svg>
        </div>
      </section>

      {/* Category icon circles */}
      {country.categories && country.categories.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {country.categories.map((cat) => {
              const Icon = categoryIcons[cat] || Compass;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(isActive ? null : cat)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card group-hover:border-primary"
                  }`}>
                    <Icon className={`w-7 h-7 transition ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.15em] font-medium transition ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* About */}
      <section className="max-w-3xl mx-auto px-6 py-10 text-center">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">About {country.name}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{country.about}</p>
        </motion.div>
      </section>

      {/* Region pills */}
      {country.regions && country.regions.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 md:px-8 pb-10">
          <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-foreground/70 mb-4">
            Where do you want to go in {country.name}?
          </p>
          <div className="flex flex-wrap gap-2">
            {country.regions.map((region) => (
              <span
                key={region}
                className="bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-xs font-medium"
              >
                {region}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Articles — uniform grid with pagination */}
      {paginatedArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground italic">
              Browse all travel blogs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedArticles.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </div>

          {/* Pagination dots */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setArticlePage(i)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold border transition-all ${
                    i === articlePage
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Travel Phrases */}
      {country.phrases && country.phrases.length > 0 && (
        <section className="bg-earth-cream">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
            <div className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">Useful phrases</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground italic">
                How do you say that in {country.phrases[0].language}?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {country.phrases.map((phrase, i) => (
                <div key={i} className="bg-card border border-border rounded-lg px-6 py-8 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-medium">{phrase.translation}</p>
                  <p className="text-2xl font-bold text-foreground font-display italic">{phrase.original}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Time to Visit */}
      {country.bestMonths.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 md:px-8 py-16 text-center">
          {/* Decorative icon */}
          <div className="mx-auto mb-4">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto text-primary">
              <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M24 4 L24 44 M4 24 L44 24 M10 10 L38 38 M38 10 L10 38" stroke="currentColor" strokeWidth="1" opacity="0.4" />
              <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground italic mb-4">
            Best time to visit {country.name}?
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Did you know that {country.name} is a great destination almost year-round? The highlighted months below are the
            best times to visit, offering the ideal mix of weather, fewer crowds, and unforgettable experiences. Whether
            you're planning a summer adventure or a winter escape, check the calendar and pick the perfect month for your trip!
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {months.map((month, i) => (
              <span
                key={month}
                className={`px-5 py-2.5 rounded-full text-xs font-medium border transition ${
                  country.bestMonths.includes(i + 1)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border"
                }`}
              >
                {month}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter - split variant */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pb-12">
        <NewsletterSignup variant="split" backgroundImage={country.heroImage} />
      </section>

      {/* Spotify playlist */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 pb-16 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">Music for your travels</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground italic mb-6">
          Get in the travel vibes<br />with our Spotify playlist
        </h2>
        <a
          href="https://open.spotify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-primary text-primary rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
        >
          Listen on Spotify 🎵
        </a>
      </section>

      {/* Also in [Continent] */}
      {siblingCountries.length > 0 && continent && (
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
            <div className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">Also in {continent.name}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {siblingCountries.map((c) => (
                <Link
                  key={c.slug}
                  to={`/destinations/${continent.slug}/${c.slug}`}
                  className="inline-flex items-center gap-1.5 bg-card border border-border rounded-full px-4 py-2 text-xs text-foreground/70 hover:border-primary hover:text-foreground transition-all"
                >
                  <span className="text-sm leading-none">{countryFlags[c.name] || "🌍"}</span>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default CountryPage;