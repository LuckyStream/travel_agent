import { Link } from "react-router-dom";

const destinations = [
  { name: "France", slug: "europe/france", image: "/destinations/france.jpg" },
  { name: "Greece", slug: "europe/greece", image: "/destinations/greece.jpg" },
  { name: "Iceland", slug: "europe/iceland", image: "/destinations/iceland.jpg" },
  { name: "Italy", slug: "europe/italy", image: "/destinations/italy.jpg" },
  { name: "Netherlands", slug: "europe/netherlands", image: "/destinations/netherlands.jpg" },
  { name: "Portugal", slug: "europe/portugal", image: "/destinations/portugal.jpg" },
  { name: "Spain", slug: "europe/spain", image: "/destinations/spain.jpg" },
  { name: "Philippines", slug: "asia/philippines", image: "/destinations/philippines.jpg" },
  { name: "Indonesia", slug: "asia/indonesia", image: "/destinations/indonesia.jpg" },
  { name: "Japan", slug: "asia/japan", image: "/destinations/japan.jpg" },
  { name: "China", slug: "asia/china", image: "/destinations/china.jpg" },
  { name: "Sri Lanka", slug: "asia/sri-lanka", image: "/destinations/sri-lanka.jpg" },
  { name: "Thailand", slug: "asia/thailand", image: "/destinations/thailand.jpg" },
  { name: "Vietnam", slug: "asia/vietnam", image: "/destinations/vietnam.jpg" },
  { name: "Botswana", slug: "africa/botswana", image: "/destinations/botswana.jpg" },
  { name: "Kenya", slug: "africa/kenya", image: "/destinations/kenya.jpg" },
  { name: "Morocco", slug: "africa/morocco", image: "/destinations/morocco.jpg" },
  { name: "South Africa", slug: "africa/south-africa", image: "/destinations/south-africa.jpg" },
  { name: "Costa Rica", slug: "central-america/costa-rica", image: "/destinations/costa-rica.jpg" },
  { name: "Mexico", slug: "central-america/mexico", image: "/destinations/mexico.jpg" },
  { name: "Peru", slug: "south-america/peru", image: "/destinations/peru.jpg" },
  { name: "Australia", slug: "oceania/australia", image: "/destinations/australia.jpg" },
];

const DestinationMarquee = () => {
  // Split into two rows
  const row1 = destinations.slice(0, 11);
  const row2 = destinations.slice(11);

  const renderRow = (items: typeof destinations, direction: "left" | "right") => {
    const doubled = [...items, ...items];
    return (
      <div className="overflow-hidden">
        <div
          className={`flex gap-4 ${
            direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
          }`}
          style={{ width: "max-content" }}
        >
          {doubled.map((dest, i) => (
            <Link
              key={`${dest.slug}-${i}`}
              to={`/destinations/${dest.slug}`}
              className="relative group flex-shrink-0 w-[280px] h-[180px] rounded-xl overflow-hidden"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-4 text-white text-sm font-medium tracking-wide">
                {dest.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="py-10 space-y-4">
      {renderRow(row1, "left")}
      {renderRow(row2, "right")}
    </section>
  );
};

export default DestinationMarquee;
