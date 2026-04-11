import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, TrendingUp, DollarSign, Sun, CheckCircle, Lightbulb } from "lucide-react";
import Layout from "@/components/layout/Layout";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getRouteById, travelRoutes } from "@/data/routes";
import NotFound from "./NotFound";

const RouteDetailPage = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const route = getRouteById(routeId || "");

  if (!route) return <NotFound />;

  const otherRoutes = travelRoutes.filter(r => r.id !== route.id).slice(0, 2);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-80 md:h-[450px] overflow-hidden">
        <img src={route.image} alt={route.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-primary text-sm uppercase tracking-widest font-semibold mb-2">{route.duration} itinerary</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-2">{route.title}</h1>
            <p className="text-white/80 text-lg max-w-2xl">{route.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Quick info bar */}
      <div className="bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-wrap gap-6 justify-center text-sm">
          <span className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4 text-primary" /> {route.duration}</span>
          <span className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="w-4 h-4 text-primary" /> {route.difficulty}</span>
          <span className="flex items-center gap-2 text-muted-foreground"><Sun className="w-4 h-4 text-primary" /> {route.bestSeason}</span>
          <span className="flex items-center gap-2 text-muted-foreground"><DollarSign className="w-4 h-4 text-primary" /> {route.budget}</span>
        </div>
      </div>

      {/* Intro & Countries */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <p className="text-muted-foreground leading-relaxed text-lg mb-8">{route.description}</p>
        <div className="flex flex-wrap gap-2">
          {route.countries.map(c => (
            <span key={c} className="flex items-center gap-1.5 bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm font-medium">
              <MapPin className="w-3.5 h-3.5" /> {c}
            </span>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-muted">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">Trip Highlights</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {route.highlights.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 bg-card p-4 rounded-xl"
              >
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-foreground">{h}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Itinerary */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-10">Day-by-Day Itinerary</h2>
        <div className="space-y-0">
          {route.itinerary.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="relative pl-8 pb-10 border-l-2 border-border last:border-l-0 last:pb-0"
            >
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary" />
              <span className="text-xs uppercase tracking-wide text-primary font-semibold">{item.day}</span>
              <h3 className="font-display text-lg font-bold text-foreground mt-1 mb-2">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="bg-accent/30">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
            <Lightbulb className="w-7 h-7 text-primary" /> Practical Tips
          </h2>
          <ul className="space-y-4">
            {route.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Other routes */}
      {otherRoutes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">More travel routes</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {otherRoutes.map(r => (
              <Link key={r.id} to={`/routes/${r.id}`} className="group bg-card rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
                <div className="overflow-hidden aspect-video">
                  <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-6">
                  <span className="text-xs uppercase tracking-wide text-primary font-semibold">{r.duration}</span>
                  <h3 className="font-display text-xl font-bold text-foreground mt-1 mb-2">{r.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-8">
        <Link to="/routes" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> All travel routes
        </Link>
      </div>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <NewsletterSignup />
      </section>
    </Layout>
  );
};

export default RouteDetailPage;
