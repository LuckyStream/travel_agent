export interface TravelRoute {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  image: string;
  countries: string[];
  difficulty: "Easy" | "Moderate" | "Challenging";
  bestSeason: string;
  budget: string;
  highlights: string[];
  itinerary: { day: string; title: string; description: string }[];
  tips: string[];
}

export const travelRoutes: TravelRoute[] = [
  {
    id: "southern-europe",
    title: "Southern Europe Road Trip",
    subtitle: "Sun, sea, and Mediterranean culture",
    description: "Drive from Barcelona through the French Riviera to the Amalfi Coast. 3 weeks of sun, beaches, and incredible food spanning three of Europe's most beloved countries.",
    duration: "21 days",
    image: "/hero-greece.jpg",
    countries: ["Spain", "France", "Italy"],
    difficulty: "Easy",
    bestSeason: "May – October",
    budget: "€2,500 – €4,000 per person",
    highlights: [
      "Drive the stunning French Riviera coastal road",
      "Visit Gaudí's masterpieces in Barcelona",
      "Explore the medieval hilltop villages of Provence",
      "Swim in hidden coves along the Amalfi Coast",
      "Taste wine in Tuscany's rolling vineyards",
      "Wander the ancient streets of Rome",
    ],
    itinerary: [
      { day: "Day 1-3", title: "Barcelona, Spain", description: "Start your journey in Barcelona. Explore Gaudí's Sagrada Família, stroll down La Rambla, and enjoy tapas in the Gothic Quarter. Don't miss the sunset from Park Güell overlooking the Mediterranean." },
      { day: "Day 4-5", title: "Costa Brava to Montpellier", description: "Drive north along the Costa Brava, stopping at charming fishing villages like Tossa de Mar and Cadaqués (Salvador Dalí's hometown). Cross into France and spend a night in Montpellier." },
      { day: "Day 6-8", title: "Provence & The French Riviera", description: "Explore the lavender fields of Provence (June-July), visit the medieval village of Gordes, and drive down to Nice. Walk the Promenade des Anglais and explore the old town's colorful markets." },
      { day: "Day 9-10", title: "Monaco & Italian Riviera", description: "Visit glamorous Monaco and its famous casino square. Cross into Italy along the stunning Ligurian coast, stopping at the colorful villages of Cinque Terre." },
      { day: "Day 11-13", title: "Tuscany, Italy", description: "Drive through the Tuscan countryside, visiting Florence's Renaissance treasures, Siena's medieval piazza, and the hilltop town of San Gimignano. Wine tastings in Chianti are a must." },
      { day: "Day 14-16", title: "Rome", description: "Spend three days exploring the Eternal City. The Colosseum, Vatican City, Trastevere's cobblestone streets, and the best carbonara you'll ever eat." },
      { day: "Day 17-19", title: "Amalfi Coast", description: "Drive south to the Amalfi Coast. Visit Positano's pastel houses, swim in hidden coves, and take a boat to the island of Capri. Don't miss the limoncello." },
      { day: "Day 20-21", title: "Naples & Departure", description: "End in Naples — visit the archaeological museum, eat the world's best pizza at L'Antica Pizzeria da Michele, and explore the ruins of Pompeii before your flight home." },
    ],
    tips: [
      "Rent a small car — narrow European roads and parking will thank you",
      "Book accommodation in advance during July-August peak season",
      "Get a Telepass for Italian highways to avoid toll booth queues",
      "Eat where locals eat — avoid restaurants with photos on the menu",
      "Learn a few words in each language — locals appreciate the effort",
    ],
  },
  {
    id: "southeast-asia",
    title: "Southeast Asia Explorer",
    subtitle: "Temples, street food, and tropical paradise",
    description: "Backpack through Thailand, Vietnam, and Cambodia. 30 days of temples, street food, and tropical beaches that will change the way you see the world.",
    duration: "30 days",
    image: "/asia-temple.jpg",
    countries: ["Thailand", "Vietnam", "Cambodia"],
    difficulty: "Moderate",
    bestSeason: "November – March",
    budget: "€1,200 – €2,000 per person",
    highlights: [
      "Explore Bangkok's incredible street food scene",
      "Cruise through Ha Long Bay's limestone pillars",
      "Visit the ancient temples of Angkor Wat",
      "Ride a motorbike through Vietnam's mountains",
      "Relax on Thailand's pristine islands",
      "Discover Hoi An's magical lantern-lit streets",
    ],
    itinerary: [
      { day: "Day 1-4", title: "Bangkok, Thailand", description: "Arrive in Bangkok and dive into the chaos. Visit the Grand Palace, explore Chinatown's street food, take a boat through the khlongs (canals), and experience the nightlife in Khao San Road or Thonglor." },
      { day: "Day 5-7", title: "Chiang Mai, Thailand", description: "Fly north to Chiang Mai. Visit the Old City's temples, shop at the Sunday night market, take a cooking class, and visit an ethical elephant sanctuary." },
      { day: "Day 8-10", title: "Thai Islands", description: "Head south to the islands. Choose between Koh Lanta (relaxed), Koh Phi Phi (social), or Koh Tao (diving). Snorkel, kayak, and watch incredible sunsets." },
      { day: "Day 11-14", title: "Hanoi & Ha Long Bay, Vietnam", description: "Fly to Hanoi. Explore the Old Quarter, eat pho for breakfast, and take a 2-night cruise through Ha Long Bay. Kayak through limestone arches and sleep on the boat." },
      { day: "Day 15-17", title: "Hue & Hoi An, Vietnam", description: "Take the train from Hanoi to Hue (or fly). Explore the Imperial Citadel, then ride the Hai Van Pass to Hoi An. Get clothes tailored, eat cao lau, and explore by bicycle." },
      { day: "Day 18-20", title: "Ho Chi Minh City, Vietnam", description: "Fly to Saigon. Visit the War Remnants Museum, explore the Cu Chi Tunnels, eat bún chả in District 1, and experience the organized chaos of Vietnam's largest city." },
      { day: "Day 21-23", title: "Phnom Penh, Cambodia", description: "Bus or fly to Phnom Penh. Visit the sobering Tuol Sleng Genocide Museum and Killing Fields to understand Cambodia's history. The riverside night market is excellent." },
      { day: "Day 24-27", title: "Siem Reap & Angkor Wat, Cambodia", description: "Bus to Siem Reap. Spend three days exploring the Angkor temple complex — Angkor Wat at sunrise, Bayon's stone faces, and the jungle-consumed Ta Prohm." },
      { day: "Day 28-30", title: "Koh Rong & Departure", description: "Head south to the coast. Spend your final days on Koh Rong or Koh Rong Sanloem — untouched beaches, bioluminescent plankton at night, and the perfect ending to your trip." },
    ],
    tips: [
      "Budget $30-50/day for comfortable backpacking (hostel, street food, transport)",
      "Always negotiate tuk-tuk and taxi prices before getting in",
      "Carry mosquito repellent — dengue fever is a real risk",
      "Download offline maps — WiFi is unreliable in rural areas",
      "Dress modestly when visiting temples — cover shoulders and knees",
      "Eat at busy street stalls — high turnover means fresh food",
    ],
  },
  {
    id: "coastal-camping",
    title: "Coastal Camping Adventure",
    subtitle: "Van life along the Atlantic coast",
    description: "Van life along the Atlantic coast from Portugal to Norway. 45 days of wild camping, surfing, and Nordic fjords that redefine the meaning of freedom.",
    duration: "45 days",
    image: "/hero-camping.jpg",
    countries: ["Portugal", "Spain", "France", "Netherlands", "Denmark", "Norway"],
    difficulty: "Challenging",
    bestSeason: "June – September",
    budget: "€3,000 – €5,500 per person (including van rental)",
    highlights: [
      "Surf the legendary waves of Portugal's Silver Coast",
      "Sleep under the stars on remote French beaches",
      "Cycle through the Netherlands' tulip countryside",
      "Drive Norway's Atlantic Road — one of the world's most scenic drives",
      "Experience the midnight sun in Northern Norway",
      "Wild camp in Denmark's designated free camping spots",
    ],
    itinerary: [
      { day: "Day 1-7", title: "Portugal's Coast", description: "Pick up your van in Lisbon and head to the Algarve's dramatic cliffs. Surf at Ericeira and Peniche, camp at wild beaches on the Vicentine Coast, and eat fresh sardines grilled on the beach." },
      { day: "Day 8-12", title: "Northern Spain", description: "Drive through Galicia's green landscapes and the rugged Asturias coast. The Picos de Europa mountains offer incredible hiking. Camp near fishing villages and feast on fresh seafood." },
      { day: "Day 13-18", title: "Atlantic France", description: "Enter France along the Basque coast. Surf the famous waves of Biarritz and Hossegor. Drive north through the pine forests of Les Landes, then explore the wild Brittany coastline." },
      { day: "Day 19-22", title: "Normandy & Belgium", description: "Visit the D-Day beaches and Mont-Saint-Michel. Drive through Belgium's charming Bruges before reaching the Netherlands." },
      { day: "Day 23-27", title: "Netherlands & Northern Germany", description: "Park the van and rent bikes to explore Amsterdam, the Bollenstreek tulip region, and the Frisian Islands. Drive through Northern Germany's coastal towns." },
      { day: "Day 28-32", title: "Denmark", description: "Cross into Denmark and explore the dramatic west coast. Rubjerg Knude lighthouse buried in sand, the Skagen peninsula where two seas meet, and Copenhagen's vibrant food scene." },
      { day: "Day 33-38", title: "Southern Norway", description: "Take the ferry to Norway. Drive the southern coast through Stavanger, hike to Preikestolen (Pulpit Rock), and explore the stunning Hardangerfjord." },
      { day: "Day 39-42", title: "Norwegian Fjords", description: "Drive north to Bergen and continue along the fjords. Geirangerfjord, Trollstigen (Troll's Road), and the Atlantic Road are unforgettable driving experiences." },
      { day: "Day 43-45", title: "Lofoten & Return", description: "If time allows, push north to the Lofoten Islands — dramatic peaks rising from the Arctic Sea, white sand beaches, and fishing villages that look like paintings. Fly home from Bodø." },
    ],
    tips: [
      "Book your van well in advance — summer season is very popular",
      "Download the Park4Night app — essential for finding camping spots",
      "Norway is expensive — stock up on groceries in Germany or Denmark",
      "Carry a portable solar panel — van batteries drain fast when parked",
      "Wild camping rules vary by country — research each one before you go",
      "Bring warm layers even in summer — Norwegian fjords get cold at night",
    ],
  },
  {
    id: "east-africa-safari",
    title: "East Africa Safari Circuit",
    subtitle: "The Big Five and beyond",
    description: "Experience the best wildlife viewing on Earth across Kenya and Tanzania. From the Great Migration to mountain gorillas, this is the ultimate African adventure.",
    duration: "18 days",
    image: "/africa-lion.jpg",
    countries: ["Kenya", "Tanzania"],
    difficulty: "Moderate",
    bestSeason: "July – October",
    budget: "€4,500 – €8,000 per person",
    highlights: [
      "Witness the Great Migration river crossings in the Masai Mara",
      "Hot air balloon safari over the Serengeti at dawn",
      "Visit a Maasai village and learn about their culture",
      "Explore the Ngorongoro Crater — the world's largest caldera",
      "Relax on Zanzibar's pristine white sand beaches",
      "See flamingos at Lake Nakuru in the Great Rift Valley",
    ],
    itinerary: [
      { day: "Day 1-2", title: "Nairobi, Kenya", description: "Arrive in Nairobi. Visit the David Sheldrick Elephant Orphanage to see rescued baby elephants, explore the Karen Blixen Museum (Out of Africa), and enjoy Nairobi's growing food scene." },
      { day: "Day 3-4", title: "Lake Nakuru & Lake Naivasha", description: "Drive to the Great Rift Valley. Lake Nakuru is famous for flamingos and rhinos, while Lake Naivasha offers boat rides past hippos and a visit to Crescent Island wildlife sanctuary." },
      { day: "Day 5-8", title: "Masai Mara, Kenya", description: "Four days in Africa's most famous reserve. Morning and afternoon game drives, a hot air balloon safari at dawn, and a visit to a Maasai village. If visiting July-October, witness the Great Migration." },
      { day: "Day 9-10", title: "Serengeti, Tanzania", description: "Cross into Tanzania and enter the Serengeti. Endless plains dotted with acacia trees and teeming with wildlife — lions, cheetahs, elephants, and millions of wildebeest." },
      { day: "Day 11-12", title: "Ngorongoro Crater", description: "Descend into the Ngorongoro Crater, a collapsed volcano teeming with wildlife. The crater floor is one of the best places in Africa to spot the Big Five in a single day." },
      { day: "Day 13-14", title: "Tarangire & Lake Manyara", description: "Visit Tarangire National Park, known for its massive elephant herds and giant baobab trees. Lake Manyara offers tree-climbing lions and incredible birdlife." },
      { day: "Day 15-18", title: "Zanzibar", description: "Fly to Zanzibar for a beach finale. Explore Stone Town's narrow alleys and spice markets, snorkel at Mnemba Atoll, and relax on the pristine beaches of Nungwi or Kendwa." },
    ],
    tips: [
      "Book safari lodges 6-12 months in advance for peak season",
      "Bring binoculars — they make a huge difference for wildlife viewing",
      "Wear neutral colors on safari — avoid white and bright colors",
      "Carry a good zoom lens — minimum 200mm for wildlife photography",
      "Take malaria prophylaxis and carry insect repellent",
      "Tipping is expected for guides and camp staff — budget $10-20/day",
    ],
  },
  {
    id: "south-america-highlights",
    title: "South America Highlights",
    subtitle: "From Patagonia to the Amazon",
    description: "A 28-day journey through the continent's most spectacular landscapes, from the glaciers of Patagonia to the Amazon rainforest and everything in between.",
    duration: "28 days",
    image: "/hero-desert.jpg",
    countries: ["Argentina", "Chile", "Peru", "Bolivia"],
    difficulty: "Challenging",
    bestSeason: "October – April",
    budget: "€3,000 – €5,000 per person",
    highlights: [
      "Hike to the base of Perito Moreno Glacier in Patagonia",
      "Walk the Inca Trail to Machu Picchu",
      "Cross the Salar de Uyuni salt flats in Bolivia",
      "Explore Buenos Aires' tango halls and steak houses",
      "Navigate the Amazon River by boat",
      "Marvel at Iguazú Falls from both Argentine and Brazilian sides",
    ],
    itinerary: [
      { day: "Day 1-4", title: "Buenos Aires, Argentina", description: "Start in Buenos Aires. Watch a tango show in San Telmo, eat the best steak of your life in Palermo, visit the colorful La Boca neighborhood, and explore the elegant Recoleta district." },
      { day: "Day 5-8", title: "Patagonia", description: "Fly to El Calafate for Perito Moreno Glacier — a massive wall of ice that cracks and calves into the lake before your eyes. Hike in Los Glaciares National Park and El Chaltén." },
      { day: "Day 9-10", title: "Torres del Paine, Chile", description: "Cross into Chile for Torres del Paine National Park. The granite towers, turquoise lakes, and guanaco herds create some of the most dramatic mountain scenery on Earth." },
      { day: "Day 11-13", title: "Iguazú Falls", description: "Fly north to Iguazú Falls — 275 waterfalls spanning nearly 3 km. Visit from both the Argentine side (close-up experiences) and Brazilian side (panoramic views). The Devil's Throat viewpoint is unforgettable." },
      { day: "Day 14-17", title: "Cusco & Sacred Valley, Peru", description: "Fly to Cusco and acclimatize. Explore the city's Inca and colonial heritage, visit the Sacred Valley, and prepare for the Inca Trail or alternative trek to Machu Picchu." },
      { day: "Day 18-21", title: "Machu Picchu & Inca Trail", description: "Trek the classic 4-day Inca Trail through cloud forest and mountain passes to arrive at Machu Picchu through the Sun Gate at dawn. One of the world's greatest hikes." },
      { day: "Day 22-24", title: "Lake Titicaca & Bolivia", description: "Travel to Lake Titicaca and visit the Uros floating islands. Cross into Bolivia and continue to the surreal Salar de Uyuni — the world's largest salt flat. A night here under the stars is otherworldly." },
      { day: "Day 25-28", title: "La Paz & Departure", description: "End in La Paz, the world's highest capital. Ride the cable car system for views, explore the Witches' Market, and mountain bike the 'Death Road' for a final adrenaline rush." },
    ],
    tips: [
      "Book the Inca Trail permit at least 6 months in advance — it sells out",
      "Acclimatize properly in Cusco — altitude sickness is serious at 3,400m",
      "Carry US dollars as backup — ATMs can be unreliable in Bolivia",
      "Pack layers — temperatures can swing 30°C in a single day in Patagonia",
      "Learn basic Spanish — English is not widely spoken outside tourist areas",
      "Book internal flights early — they're much cheaper than last-minute",
    ],
  },
];

export function getRouteById(id: string) {
  return travelRoutes.find(r => r.id === id);
}
