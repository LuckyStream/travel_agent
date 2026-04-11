import Layout from "@/components/layout/Layout";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { travelRoutes } from "@/data/routes";
import NewsletterSignup from "@/components/NewsletterSignup";

const Routes = () => {
  return (
    <Layout>
      <section className="bg-muted py-16 md:py-24 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Plan your journey</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Travel Routes
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Curated multi-destination itineraries to inspire your next big adventure. Each route includes day-by-day planning, budget tips, and insider recommendations.
          </p>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="space-y-12">
          {travelRoutes.map((route, i) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <Link to={`/routes/${route.id}`} className={`rounded-2xl overflow-hidden shadow-lg ${i % 2 === 1 ? "md:order-2" : ""}`}>
                <img src={route.image} alt={route.title} className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500" />
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs uppercase tracking-wide text-primary font-semibold">{route.duration}</span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">• {route.difficulty}</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1 mb-3">
                  {route.title}
                </h2>
                <p className="text-muted-foreground mb-4">{route.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {route.countries.map((c) => (
                    <span key={c} className="flex items-center gap-1 bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full">
                      <MapPin className="w-3 h-3" /> {c}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/routes/${route.id}`}
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                >
                  Read full itinerary <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <NewsletterSignup />
      </section>
    </Layout>
  );
};

export default Routes;
