export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  features: string[];
  pages: number;
  format: string;
  contents: string[];
}

export const products: Product[] = [
  {
    id: "p1",
    name: "European Adventures Guide",
    price: 27.50,
    rating: 4.8,
    image: "/travel-books.jpg",
    description: "Your comprehensive guide to Europe's most incredible destinations. From the fjords of Norway to the islands of Greece, this guide covers 25 countries with detailed itineraries, local tips, and hidden gems that most travelers never discover.",
    features: [
      "25 European countries covered in detail",
      "Over 150 curated restaurant and café recommendations",
      "Day-by-day itineraries for 2-week trips",
      "Budget breakdowns for every destination",
      "Offline-friendly digital format",
      "Free updates for 2 years",
    ],
    pages: 340,
    format: "Digital PDF + ePub",
    contents: [
      "Chapter 1: Planning Your European Adventure — visa requirements, rail passes, budget tips, and packing lists for every season.",
      "Chapter 2: Mediterranean Magic — detailed guides to Spain, Italy, Greece, Croatia, and Portugal with our favorite beaches, restaurants, and hidden villages.",
      "Chapter 3: Northern Wonders — Scandinavia, Iceland, and the Baltics. Northern Lights chasing guides, fjord cruises, and the best of Nordic culture.",
      "Chapter 4: Central Europe — Germany, Austria, Switzerland, Czech Republic, and beyond. Beer gardens, Alpine hikes, Christmas markets, and medieval towns.",
      "Chapter 5: Eastern Europe — The best-value destinations on the continent. Romania's castles, Georgia's wine country, and the Balkans' stunning coastline.",
      "Chapter 6: Road Trip Routes — Five epic driving routes across Europe with day-by-day itineraries, camping spots, and scenic detours.",
    ],
  },
  {
    id: "p2",
    name: "Asia Explorer's Handbook",
    price: 27.50,
    rating: 4.9,
    image: "/travel-books.jpg",
    description: "Navigate Asia with confidence using our most popular guide. Covering Southeast Asia, Japan, China, India, and more — with practical advice on everything from street food safety to temple etiquette.",
    features: [
      "15 Asian countries with in-depth coverage",
      "Street food guides for every major city",
      "Temple and cultural etiquette guides",
      "Budget backpacker and luxury travel options",
      "Health and safety advice for each region",
      "Free updates for 2 years",
    ],
    pages: 380,
    format: "Digital PDF + ePub",
    contents: [
      "Chapter 1: Asia Travel Essentials — visas, vaccinations, budget planning, and the best time to visit each region.",
      "Chapter 2: Southeast Asia — Thailand, Vietnam, Cambodia, Indonesia, Philippines, and Myanmar. Backpacker routes, island guides, and food trails.",
      "Chapter 3: East Asia — Japan, South Korea, China, and Taiwan. From bullet trains to ancient temples, modern cities to rural villages.",
      "Chapter 4: South Asia — India, Sri Lanka, and Nepal. Navigating the beautiful chaos, trekking in the Himalayas, and finding serenity.",
      "Chapter 5: Food Lover's Asia — A complete guide to Asian cuisines. What to eat, where to eat it, and how to order like a local.",
      "Chapter 6: Off the Beaten Path — Hidden gems that most guidebooks miss. Mongolia's steppe, Borneo's rainforests, and Japan's rural islands.",
    ],
  },
  {
    id: "p3",
    name: "Complete World Travel Planner",
    price: 24.95,
    rating: 4.7,
    image: "/travel-books.jpg",
    description: "The ultimate planning companion for any trip, anywhere. This interactive planner helps you organize every aspect of your journey — from initial inspiration to day-by-day scheduling, budgeting, and packing.",
    features: [
      "Interactive trip planning templates",
      "Budget calculator and expense tracker",
      "Customizable packing checklists by destination",
      "Printable daily itinerary planners",
      "Travel journal pages with prompts",
      "Emergency contact and document organizer",
    ],
    pages: 220,
    format: "Digital PDF (printable)",
    contents: [
      "Section 1: Dream & Discover — Bucket list templates, destination comparison worksheets, and travel style quizzes to find your perfect trip.",
      "Section 2: Plan & Prepare — Step-by-step planning guides, booking timelines, visa checklists, and travel insurance comparison charts.",
      "Section 3: Budget & Save — Trip cost calculators, daily budget trackers, and money-saving tips for every travel style.",
      "Section 4: Pack & Go — Customizable packing lists for different climates, carry-on optimization guides, and gear recommendations.",
      "Section 5: Experience & Record — Daily itinerary planners, travel journal prompts, photo logs, and memory-keeping templates.",
      "Section 6: Return & Reflect — Post-trip reflection pages, photo book planning guides, and inspiration for your next adventure.",
    ],
  },
  {
    id: "p4",
    name: "Africa Safari Planning Guide",
    price: 29.95,
    rating: 4.9,
    image: "/africa-lion.jpg",
    description: "Plan the safari of a lifetime with our expert guide. Covers East and Southern Africa with detailed information on parks, lodges, wildlife seasons, and photography tips.",
    features: [
      "12 African countries and 40+ national parks",
      "Wildlife identification guide with photos",
      "Best time to visit each park and region",
      "Lodge and camp reviews at every budget level",
      "Safari photography tips from professionals",
      "Health, safety, and visa information",
    ],
    pages: 290,
    format: "Digital PDF + ePub",
    contents: [
      "Chapter 1: Safari Essentials — What to expect, what to pack, health precautions, and how to choose the right safari for you.",
      "Chapter 2: East Africa — Kenya and Tanzania's famous reserves. The Great Migration, gorilla trekking, and Zanzibar's beaches.",
      "Chapter 3: Southern Africa — South Africa, Botswana, Namibia, and Zimbabwe. Self-drive safaris, the Okavango Delta, and Victoria Falls.",
      "Chapter 4: Wildlife Guide — Identification guide for Africa's most iconic animals with behavioral notes and photography tips.",
      "Chapter 5: Photography Masterclass — Camera settings, composition tips, and the best times and positions for wildlife photography.",
      "Chapter 6: Practical Planning — Detailed budget breakdowns, booking timelines, and lodge recommendations for every budget.",
    ],
  },
];

export function getProductById(id: string) {
  return products.find(p => p.id === id);
}
