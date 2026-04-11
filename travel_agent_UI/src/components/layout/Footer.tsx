import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube } from "lucide-react";


const Footer = () => {
  return (
    <footer className="bg-earth-dark text-primary-foreground/70">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About */}
          <div>
            <span className="font-display text-xl font-bold text-primary-foreground italic block mb-4">
              Personal Traveling Agent
            </span>
            <p className="text-xs leading-relaxed text-primary-foreground/50">
              At Personal Traveling Agent, we share travel stories, practical tips, and inspiration for your next adventure. After years of exploring the world, we created this platform to help fellow travelers discover the beauty our planet has to offer.
            </p>
            <div className="flex gap-3 mt-4">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary/30 transition text-primary-foreground/50 hover:text-primary-foreground">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-primary-foreground mb-4 text-sm">Contact & Connect</h4>
            <p className="text-xs text-primary-foreground/50 mb-2">
              Have a question or want to collaborate?
            </p>
            <p className="text-xs text-primary-foreground/50">
              Personal Traveling Agent is open for collaborations and sponsored content. Feel free to reach out!
            </p>
          </div>

          {/* Latest tips */}
          <div>
            <h4 className="font-display font-bold text-primary-foreground mb-4 text-sm">Latest Tips</h4>
            <ul className="space-y-2">
              {["Accommodation tips", "Travel guides", "Attractions", "Road trips", "Food & Culture"].map((cat) => (
                <li key={cat}>
                  <Link to="/destinations" className="text-xs text-primary-foreground/40 hover:text-primary transition">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-[10px] text-primary-foreground/30 tracking-wide">© 2025 Personal Traveling Agent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;