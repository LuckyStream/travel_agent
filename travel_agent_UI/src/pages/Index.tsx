import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import Layout from "@/components/layout/Layout";
import NewsletterSignup from "@/components/NewsletterSignup";
import TravelAgent from "@/components/TravelAgent";

const heroSlides = [
  { image: "/hero-slides/01-santorini.jpg", alt: "Santorini white cliffs and blue sea" },
  { image: "/hero-slides/02-sahara.jpg", alt: "Sahara desert golden dunes" },
  { image: "/hero-slides/03-swiss-alps.jpg", alt: "Swiss Alps mountain panorama" },
  { image: "/hero-slides/04-bali-rice.jpg", alt: "Bali rice terrace landscape" },
  { image: "/hero-slides/05-machu-picchu.jpg", alt: "Machu Picchu ancient ruins" },
  { image: "/hero-slides/06-aurora.jpg", alt: "Northern lights aurora borealis" },
  { image: "/hero-slides/07-grand-canyon.jpg", alt: "Grand Canyon vast landscape" },
  { image: "/hero-slides/08-venice.jpg", alt: "Venice canals and architecture" },
  { image: "/hero-slides/09-kyoto.jpg", alt: "Kyoto temple and cherry blossoms" },
  { image: "/hero-slides/10-maldives.jpg", alt: "Maldives crystal clear waters" },
  { image: "/hero-slides/11-patagonia.jpg", alt: "Patagonia mountains and glaciers" },
  { image: "/hero-slides/12-great-wall.jpg", alt: "Great Wall of China" },
  { image: "/hero-slides/13-iceland-waterfall.jpg", alt: "Iceland dramatic waterfall" },
  { image: "/hero-slides/14-taj-mahal.jpg", alt: "Taj Mahal at sunrise" },
  { image: "/hero-slides/15-savanna.jpg", alt: "African savanna sunset" },
  { image: "/hero-slides/16-norway-fjords.jpg", alt: "Norwegian fjords landscape" },
  { image: "/hero-slides/17-paris.jpg", alt: "Paris Eiffel Tower cityscape" },
  { image: "/hero-slides/18-cappadocia.jpg", alt: "Cappadocia rock formations" },
  { image: "/hero-slides/19-banff.jpg", alt: "Banff National Park lake" },
  { image: "/hero-slides/20-amalfi.jpg", alt: "Amalfi Coast cliffside village" },
  { image: "/hero-slides/21-petra.jpg", alt: "Petra ancient carved city" },
  { image: "/hero-slides/22-angkor-wat.jpg", alt: "Angkor Wat temple at dawn" },
  { image: "/hero-slides/23-niagara.jpg", alt: "Niagara Falls cascading water" },
  { image: "/hero-slides/24-amsterdam.jpg", alt: "Amsterdam canal houses" },
  { image: "/hero-slides/25-morocco.jpg", alt: "Morocco colorful medina streets" },
  { image: "/hero-slides/26-new-zealand.jpg", alt: "New Zealand mountain scenery" },
  { image: "/hero-slides/27-lisbon.jpg", alt: "Lisbon colorful tram streets" },
  { image: "/hero-slides/28-halong-bay.jpg", alt: "Ha Long Bay limestone pillars" },
  { image: "/hero-slides/29-sydney.jpg", alt: "Sydney Opera House harbor" },
  { image: "/hero-slides/30-dubai.jpg", alt: "Dubai skyline at sunset" },
  { image: "/hero-slides/31-rome.jpg", alt: "Rome Colosseum ancient ruins" },
  { image: "/hero-slides/32-lake-bled.jpg", alt: "Lake Bled island church" },
  { image: "/hero-slides/33-yellowstone.jpg", alt: "Yellowstone geothermal springs" },
  { image: "/hero-slides/34-zanzibar.jpg", alt: "Zanzibar tropical beach" },
  { image: "/hero-slides/35-barcelona.jpg", alt: "Barcelona Sagrada Familia" },
  { image: "/hero-slides/36-kilimanjaro.jpg", alt: "Mount Kilimanjaro at dawn" },
  { image: "/hero-slides/37-phuket.jpg", alt: "Phuket Thai islands" },
  { image: "/hero-slides/38-prague.jpg", alt: "Prague old town bridges" },
  { image: "/hero-slides/39-costa-rica.jpg", alt: "Costa Rica tropical jungle" },
  { image: "/hero-slides/40-colombo.jpg", alt: "Sri Lanka ancient temple" },
  { image: "/hero-slides/41-canadian-rockies.jpg", alt: "Canadian Rockies turquoise lake" },
  { image: "/hero-slides/42-dubrovnik.jpg", alt: "Dubrovnik old city walls" },
  { image: "/hero-slides/43-mount-fuji.jpg", alt: "Mount Fuji snow-capped peak" },
  { image: "/hero-slides/44-caribbean.jpg", alt: "Caribbean turquoise beach" },
  { image: "/hero-slides/45-dolomites.jpg", alt: "Italian Dolomites peaks" },
  { image: "/hero-slides/46-scottish-highlands.jpg", alt: "Scottish Highlands rolling hills" },
  { image: "/hero-slides/47-antelope-canyon.jpg", alt: "Antelope Canyon light beams" },
  { image: "/hero-slides/48-cinque-terre.jpg", alt: "Cinque Terre coastal villages" },
  { image: "/hero-slides/49-bagan.jpg", alt: "Bagan Myanmar ancient temples" },
  { image: "/hero-slides/50-victoria-falls.jpg", alt: "Victoria Falls mist and rainbow" },
  { image: "/hero-slides/51-rio.jpg", alt: "Rio de Janeiro mountain view" },
  { image: "/hero-slides/52-great-barrier-reef.jpg", alt: "Great Barrier Reef aerial view" },
  { image: "/hero-slides/53-lavender-provence.jpg", alt: "Provence lavender fields" },
  { image: "/hero-slides/54-northern-lights.jpg", alt: "Arctic northern lights display" },
  { image: "/hero-slides/55-red-canyon.jpg", alt: "Red rock canyon landscape" },
];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type ActiveView = "home" | "wizard";

const cinematicEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

const viewVariants = {
  initial: { opacity: 0, y: 60, filter: "blur(8px)", scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 0.55, ease: cinematicEase },
  },
  exit: {
    opacity: 0,
    y: -50,
    filter: "blur(6px)",
    scale: 0.98,
    transition: { duration: 0.4, ease: cinematicEase },
  },
};

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<ActiveView>("home");
  const [wizardStartStep, setWizardStartStep] = useState<"vibe" | "interests">("vibe");
  const [wizardDestination, setWizardDestination] = useState("");

  const launchWizard = useCallback((startStep: "vibe" | "interests", dest?: string) => {
    setWizardStartStep(startStep);
    setWizardDestination(dest || "");
    setActiveView("wizard");
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      launchWizard("interests", searchQuery.trim());
    }
  };

  const handleAiSuggestions = () => {
    launchWizard("vibe");
  };

  const handleBackToHome = useCallback(() => {
    setActiveView("home");
    setSearchQuery("");
  }, []);

  useEffect(() => {
    if (activeView !== "home") return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeView]);

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {activeView === "home" && (
          <motion.div
            key="home"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Hero */}
            <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
              {heroSlides.map((slide, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
                >
                  <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-foreground/50" />

              {/* Stamp badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -25 }}
                animate={{ opacity: 1, scale: 1, rotate: -15 }}
                transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
                className="absolute top-8 right-8 md:top-12 md:right-16 stamp-badge text-primary-foreground border-primary-foreground/60 hidden md:flex backdrop-blur-sm bg-primary-foreground/5"
              >
                <span>Your<br />Personal<br />Traveling<br />Agent</span>
              </motion.div>

              <div className="relative h-full flex flex-col justify-end pb-20 px-6 md:px-16 lg:px-24 max-w-7xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <p className="text-primary-foreground/60 text-xs uppercase tracking-[0.3em] mb-3 font-medium">YOUR PERSONAL TRAVELING AGENT</p>
                  <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground tracking-tight mb-4 max-w-3xl italic leading-[1.1]">
                    Van Trips around the world, we've got you covered
                  </h1>
                  <p className="text-primary-foreground/70 text-xs uppercase tracking-[0.2em] mb-4">Where do you want to go?</p>
                  <div className="flex flex-col sm:flex-row items-stretch gap-3 max-w-2xl">
                    {/* Search bar */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="flex items-center flex-1 bg-card/70 backdrop-blur-xl border border-primary-foreground/10 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-shadow duration-500"
                    >
                      <input
                        type="text"
                        placeholder="Search destinations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="flex-1 bg-transparent pl-5 pr-2 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSearch}
                        className="flex items-center justify-center w-11 h-11 bg-primary text-primary-foreground rounded-xl m-1.5 hover:bg-primary/90 transition-colors shrink-0"
                      >
                        <Search className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                    {/* AI Suggestions */}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.45 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAiSuggestions}
                      className="flex items-center gap-3 bg-card/70 backdrop-blur-xl border border-primary-foreground/10 rounded-2xl px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] transition-all duration-500 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors duration-300">
                        <Sparkles className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-bold text-foreground leading-tight">Ask AI suggestions</span>
                        <span className="block text-xs text-muted-foreground leading-snug">Let AI find your destination</span>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* Wavy bottom edge */}
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                  <path d="M0 30C240 60 480 0 720 30C960 60 1200 0 1440 30V60H0V30Z" fill="hsl(40, 33%, 96%)" />
                </svg>
              </div>
            </section>

            {/* When to Travel */}
            <section className="border-t border-border">
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
                <div className="text-center mb-10">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">When do you want to travel?</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {months.map((month, i) => (
                    <motion.button
                      key={month}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2 rounded-full border border-border text-xs font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-all tracking-wide duration-300"
                    >
                      {month}
                    </motion.button>
                  ))}
                </div>
              </div>
            </section>

            {/* Newsletter */}

            {/* Newsletter */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16 md:pb-24">
              <NewsletterSignup />
            </section>
          </motion.div>
        )}

        {activeView === "wizard" && (
          <motion.div
            key="wizard"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen"
          >
            <TravelAgent
              initialStep={wizardStartStep}
              initialDestination={wizardDestination}
              onBack={handleBackToHome}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Index;
