import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, ChevronDown, MapPin, FileText } from "lucide-react";
import { continents, getAllArticles, type Article, type Country, type Continent } from "@/data/destinations";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const allArticles = useMemo(() => getAllArticles(), []);

  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { articles: [], destinations: [] };

    const matchedArticles = allArticles
      .filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))
      .slice(0, 5);

    const matchedDestinations: { country: Country; continent: Continent }[] = [];
    for (const continent of continents) {
      for (const country of continent.countries) {
        if (country.name.toLowerCase().includes(q) || continent.name.toLowerCase().includes(q)) {
          matchedDestinations.push({ country, continent });
        }
      }
    }

    return { articles: matchedArticles, destinations: matchedDestinations.slice(0, 5) };
  }, [searchQuery, allArticles]);

  const handleResultClick = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Left nav */}
        <nav className="hidden md:flex items-center gap-6">
          <div
            className="relative"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm text-foreground/70 hover:text-foreground transition font-medium tracking-wide">
              Destinations <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {megaMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[90vw] max-w-5xl bg-card shadow-xl rounded-lg border border-border mt-2 p-8"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                    {continents.map((continent) => (
                      <div key={continent.slug}>
                        <Link
                          to={`/destinations/${continent.slug}`}
                          className="font-display font-bold text-foreground text-sm mb-3 block hover:text-primary transition"
                        >
                          {continent.name}
                        </Link>
                        <ul className="space-y-1.5">
                          {continent.countries.slice(0, 5).map((country) => (
                            <li key={country.slug}>
                              <Link
                                to={`/destinations/${continent.slug}/${country.slug}`}
                                className="text-xs text-muted-foreground hover:text-primary transition"
                              >
                                {country.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link to="/routes" className="text-sm text-foreground/70 hover:text-foreground transition font-medium tracking-wide">
            Travel Routes
          </Link>
          <Link to="/itinerary" className="text-sm text-foreground/70 hover:text-foreground transition font-medium tracking-wide">
            Itinerary
          </Link>
        </nav>

        {/* Center Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight italic">
            Your Personal Traveling Agent
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-foreground/60 hover:text-foreground transition"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <span className="text-foreground/60 text-sm hidden md:inline">Search</span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground/60"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center bg-muted rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent pl-0 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                  autoFocus
                />
                <button className="px-4 py-3 text-muted-foreground hover:text-foreground transition" aria-label="Search">
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Search results */}
              {searchQuery.trim().length > 0 && (
                <div className="mt-4 space-y-4 max-h-80 overflow-y-auto">
                  {searchResults.destinations.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-2">Destinations</p>
                      <div className="space-y-1">
                        {searchResults.destinations.map(({ country, continent }) => (
                          <Link
                            key={`${continent.slug}-${country.slug}`}
                            to={`/destinations/${continent.slug}/${country.slug}`}
                            onClick={handleResultClick}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/80 transition group"
                          >
                            <MapPin className="w-4 h-4 text-primary shrink-0" />
                            <div>
                              <span className="text-sm font-medium text-foreground group-hover:text-primary transition">{country.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">{continent.name}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.articles.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-2">Articles</p>
                      <div className="space-y-1">
                        {searchResults.articles.map((article) => (
                          <Link
                            key={article.id}
                            to={`/article/${article.id}`}
                            onClick={handleResultClick}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/80 transition group"
                          >
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <div className="min-w-0">
                              <span className="text-sm font-medium text-foreground group-hover:text-primary transition line-clamp-1">{article.title}</span>
                              <span className="text-xs text-muted-foreground ml-2">{article.category}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.articles.length === 0 && searchResults.destinations.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No results found for "{searchQuery}"</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-80 bg-card shadow-2xl z-50 overflow-y-auto p-6 md:hidden"
          >
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4">
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
            <nav className="mt-12 space-y-6">
              <Link to="/destinations" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-display font-bold text-foreground">
                All Destinations
              </Link>
              {continents.map((c) => (
                <div key={c.slug}>
                  <Link to={`/destinations/${c.slug}`} onClick={() => setMobileMenuOpen(false)} className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    {c.name}
                  </Link>
                  <ul className="space-y-1 ml-2">
                    {c.countries.slice(0, 4).map((country) => (
                      <li key={country.slug}>
                        <Link to={`/destinations/${c.slug}/${country.slug}`} onClick={() => setMobileMenuOpen(false)} className="text-sm text-muted-foreground hover:text-primary">
                          {country.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Link to="/routes" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-display font-bold text-foreground">Travel Routes</Link>
              <Link to="/itinerary" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-display font-bold text-foreground">Itinerary</Link>
              
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;