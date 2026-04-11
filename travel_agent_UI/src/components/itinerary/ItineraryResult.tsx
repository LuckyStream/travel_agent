import { useState } from "react";
import { ArrowLeft, Share2, Download, Clock, Utensils, Camera, Footprints, ShoppingBag, Moon, Train, Hotel } from "lucide-react";
import { motion } from "framer-motion";
import type { ItineraryDay } from "@/types/itinerary-ui";
import { jsPDF } from "jspdf";

const categoryIcons: Record<string, React.ElementType> = {
  sightseeing: Camera,
  dining: Utensils,
  activity: Footprints,
  nightlife: Moon,
  shopping: ShoppingBag,
  transport: Train,
  accommodation: Hotel,
};

const categoryColors: Record<string, string> = {
  sightseeing: "bg-blue-100 text-blue-700",
  dining: "bg-orange-100 text-orange-700",
  activity: "bg-green-100 text-green-700",
  nightlife: "bg-purple-100 text-purple-700",
  shopping: "bg-pink-100 text-pink-700",
  transport: "bg-slate-100 text-slate-700",
  accommodation: "bg-amber-100 text-amber-700",
};

interface Props {
  itinerary: ItineraryDay[];
  destination: string;
  days: number;
  onShare: () => void;
  onReset: () => void;
}

const ItineraryResult = ({ itinerary, destination, days, onShare, onReset }: Props) => {
  const [activeDay, setActiveDay] = useState(0);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(`${destination} — ${days}-Day Itinerary`, margin, y);
    y += 14;

    for (const day of itinerary) {
      if (y > 260) {
        doc.addPage();
        y = margin;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Day ${day.day}: ${day.title}`, margin, y);
      y += 8;

      for (const stop of day.stops) {
        if (y > 260) {
          doc.addPage();
          y = margin;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`${stop.time} — ${stop.name}`, margin + 4, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(stop.description, 160);
        doc.text(lines, margin + 4, y);
        y += lines.length * 4.5 + 4;
      }
      y += 6;
    }

    doc.save(`${destination.replace(/\s+/g, "-").toLowerCase()}-itinerary.pdf`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> New itinerary
          </button>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground italic">
            {destination}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{days}-day itinerary</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md text-sm font-medium text-foreground hover:bg-accent transition"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-90 transition"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {itinerary.map((day, i) => (
          <button
            key={day.day}
            onClick={() => setActiveDay(i)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition border ${
              activeDay === i
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-foreground/30"
            }`}
          >
            Day {day.day}
          </button>
        ))}
      </div>

      {/* Active day content */}
      {itinerary[activeDay] && (
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="font-display text-xl font-bold text-foreground mb-6 italic">
            {itinerary[activeDay].title}
          </h2>

          <div className="space-y-4">
            {itinerary[activeDay].stops.map((stop, idx) => {
              const Icon = categoryIcons[stop.category] || Camera;
              const colorClass = categoryColors[stop.category] || "bg-muted text-muted-foreground";

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-4"
                >
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {idx < itinerary[activeDay].stops.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>

                  {/* Card */}
                  <div className="bg-card border border-border rounded-lg p-4 flex-1 mb-2">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                          {stop.slot}
                        </span>
                        <h3 className="font-display font-bold text-foreground text-lg leading-tight">
                          {stop.name}
                        </h3>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 mt-1">{stop.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{stop.description}</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> {stop.duration}
                      </span>
                      {stop.tip && (
                        <span className="text-xs text-primary italic">💡 {stop.tip}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ItineraryResult;
