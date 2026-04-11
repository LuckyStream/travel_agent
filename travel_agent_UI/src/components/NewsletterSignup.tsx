import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface NewsletterSignupProps {
  variant?: "inline" | "hero" | "split";
  backgroundImage?: string;
}

const NewsletterSignup = ({ variant = "inline", backgroundImage }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
    setName("");
  };

  if (variant === "split" && backgroundImage) {
    return (
      <section className="rounded-lg overflow-hidden shadow-md">
        <div className="grid md:grid-cols-2">
          {/* Left: photo with overlay text */}
          <div className="relative h-64 md:h-auto min-h-[280px]">
            <img src={backgroundImage} alt="Newsletter" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-earth-dark/60" />
            <div className="relative h-full flex items-center justify-center px-8">
              <h3 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground italic leading-snug text-center">
                Stay up to date<br />with our new<br />travels?
              </h3>
            </div>
          </div>
          {/* Right: form */}
          <div className="bg-earth-cream p-8 md:p-12 flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1 block">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-border rounded-md px-4 py-3 text-foreground bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full border border-border rounded-md px-4 py-3 text-foreground bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm hover:opacity-90 transition inline-flex items-center gap-2"
              >
                Subscribe <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "hero" && backgroundImage) {
    return (
      <section className="relative h-80 md:h-96 overflow-hidden rounded-lg">
        <img src={backgroundImage} alt="Newsletter background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-earth-dark/70" />
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="text-center max-w-lg">
            <p className="text-primary-foreground/60 text-[10px] uppercase tracking-[0.3em] mb-2">Stay Updated</p>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6 italic">
              Never miss a new travel story
            </h3>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-primary-foreground/10 backdrop-blur border border-primary-foreground/20 rounded-md px-4 py-3 text-primary-foreground text-sm placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm hover:opacity-90 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-earth-cream border border-border rounded-lg p-8 md:p-12 text-center max-w-3xl mx-auto">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">Where do you want to go?</p>
      <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4 italic">
        Get travel vibes straight to your inbox
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="flex-1 border border-border rounded-md px-4 py-3 text-foreground bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold text-sm hover:opacity-90 transition inline-flex items-center justify-center gap-2"
        >
          Sign Up <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    </section>
  );
};

export default NewsletterSignup;