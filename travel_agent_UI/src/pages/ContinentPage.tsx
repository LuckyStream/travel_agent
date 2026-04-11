import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import ArticleCard from "@/components/ArticleCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getContinentBySlug } from "@/data/destinations";
import { ArrowRight } from "lucide-react";
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

const ContinentPage = () => {
  const { continent: continentSlug } = useParams<{ continent: string }>();
  const continent = getContinentBySlug(continentSlug || "");

  if (!continent) return <NotFound />;

  const allArticles = continent.countries.flatMap((c) => c.articles);

  return (
    <Layout>
      {/* Dark mountain hero */}
      <section className="relative h-[45vh] min-h-[320px] overflow-hidden bg-earth-dark">
        <div className="absolute inset-0 flex items-end">
          <svg viewBox="0 0 1440 320" className="w-full" preserveAspectRatio="none">
            <path d="M0,320 L0,200 Q100,120 200,180 Q280,220 360,160 Q420,110 500,140 Q560,170 620,100 Q700,20 780,80 Q840,130 900,90 Q960,50 1040,100 Q1100,140 1160,80 Q1220,30 1300,100 Q1360,150 1440,120 L1440,320 Z" fill="hsl(30, 15%, 18%)" opacity="0.6" />
            <path d="M0,320 L0,240 Q120,180 240,220 Q320,250 400,200 Q480,150 560,190 Q640,230 720,170 Q800,120 880,160 Q960,200 1040,150 Q1120,100 1200,150 Q1280,200 1360,170 L1440,180 L1440,320 Z" fill="hsl(30, 15%, 15%)" opacity="0.8" />
          </svg>
        </div>

        {/* Breadcrumb */}
        <div className="absolute top-6 left-6 md:left-16 z-10 flex items-center gap-2 text-xs">
          <Link to="/" className="text-primary-foreground/40 hover:text-primary-foreground/70 transition">Personal Traveling Agent</Link>
          <span className="text-primary-foreground/20">›</span>
          <Link to="/destinations" className="text-primary-foreground/40 hover:text-primary-foreground/70 transition">Destinations</Link>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary-foreground/40 text-[10px] uppercase tracking-[0.4em] mb-3 font-medium">Welcome to</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground italic tracking-tight">
              {continent.name}
            </h1>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 20C240 40 480 0 720 20C960 40 1200 0 1440 20V40H0V20Z" fill="hsl(40, 33%, 96%)" />
          </svg>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-6 py-14 md:py-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm text-muted-foreground leading-relaxed"
        >
          {continent.introduction}
        </motion.p>
      </section>

      {/* Country flag pills */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pb-14">
        <div className="flex flex-wrap justify-center gap-2">
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
      </section>

      {/* Articles */}
      {allArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">Latest stories</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground italic">
              Latest from {continent.name}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allArticles.slice(0, 6).map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Per-country navigation */}
      <section className="bg-earth-cream">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">Explore by country</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {continent.countries.map((country) => (
              <Link
                key={country.slug}
                to={`/destinations/${continent.slug}/${country.slug}`}
                className="flex items-center justify-between bg-card border border-border rounded-lg px-5 py-4 hover:border-primary hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{countryFlags[country.name] || "🌍"}</span>
                  <div>
                    <span className="font-display text-lg font-bold text-foreground">{country.name}</span>
                    <span className="block text-[10px] text-muted-foreground">{country.articles.length} articles</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <NewsletterSignup />
      </section>
    </Layout>
  );
};

export default ContinentPage;