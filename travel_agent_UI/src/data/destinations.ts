export interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  content?: string[];
  author?: string;
}

export interface Country {
  name: string;
  slug: string;
  heroImage: string;
  about: string;
  articles: Article[];
  bestMonths: number[];
  phrases?: { original: string; translation: string; language: string }[];
  categories?: string[];
  regions?: string[];
}

export interface Continent {
  name: string;
  slug: string;
  heroImage: string;
  introduction: string;
  countries: Country[];
}

export const continents: Continent[] = [
  {
    name: "Europe",
    slug: "europe",
    heroImage: "/hero-greece.jpg",
    introduction: "Europe is a continent of incredible diversity, from the sun-drenched Mediterranean coast to the fjords of Scandinavia. Rich in history, culture, cuisine, and breathtaking landscapes, Europe offers endless adventures for every type of traveler.",
    countries: [
      {
        name: "France",
        slug: "france",
        heroImage: "/france.jpg",
        about: "France is the perfect destination for travelers seeking diverse experiences. From the sunny beaches of the Côte d'Azur to the majestic Alps, the country offers rich culture, world-renowned cuisine, and stunning landscapes that will captivate your heart.",
        categories: ["Culture", "Nature", "Food", "Museums", "Attractions"],
        regions: ["Paris", "Provence", "Burgundy", "Brittany", "Corsica", "French Riviera"],
        bestMonths: [4, 5, 6, 7, 8, 9],
        phrases: [
          { original: "Bonjour", translation: "Hello", language: "French" },
          { original: "Merci beaucoup", translation: "Thank you very much", language: "French" },
          { original: "Où est...?", translation: "Where is...?", language: "French" },
        ],
        articles: [
          { id: "fr1", title: "Visit Burgundy: The best wine regions and historic towns to explore", excerpt: "Discover the rolling vineyards and medieval charm of Burgundy.", image: "/france.jpg", category: "Culture", date: "2025-11-15", author: "Marco", content: [
            "Burgundy is one of France's most beloved regions, famous for its world-class wines, medieval villages, and rolling countryside. Whether you're a wine enthusiast or simply love the French countryside, Burgundy will steal your heart.",
            "Start your journey in Beaune, the wine capital of Burgundy. The town's cobblestone streets are lined with tasting rooms, and the famous Hospices de Beaune is a must-see with its stunning multicolored roof tiles.",
            "From Beaune, head to the Côte d'Or — the 'Golden Slope' — where some of the world's most prestigious vineyards produce Pinot Noir and Chardonnay. Many domaines offer tastings, often in atmospheric cellars that date back centuries.",
            "Don't miss the medieval town of Vézelay, perched on a hilltop with its stunning Romanesque basilica. The view from the town ramparts stretches across the Morvan hills, making it a perfect spot for photography.",
            "For food lovers, Burgundy is paradise. Try the local specialties: bœuf bourguignon, escargots de Bourgogne, coq au vin, and gougères (cheese puffs). Pair everything with local wines and you'll understand why the French take their cuisine so seriously."
          ] },
          { id: "fr2", title: "French Riviera Road Trip: The ultimate coastal route with hidden beaches", excerpt: "Drive the stunning Côte d'Azur from Nice to Saint-Tropez.", image: "/france.jpg", category: "Nature", date: "2025-10-20", author: "Sophie", content: [
            "The French Riviera is synonymous with glamour, but beyond the glitzy resorts lie hidden coves, charming fishing villages, and some of the most beautiful coastal scenery in Europe.",
            "Start in Nice, where the Promenade des Anglais curves along the turquoise Mediterranean. Spend a morning exploring the Old Town with its colorful markets, then head west along the coast.",
            "Between Nice and Cannes, detour to the hilltop village of Èze. The Jardin Exotique at the summit offers jaw-dropping panoramic views of the coast far below.",
            "Continue to Saint-Tropez, but take the scenic Route des Crêtes for breathtaking views. Just outside town, Plage de l'Escalet is a hidden gem — a small, sheltered beach with crystal-clear water that most tourists never find.",
            "End your trip in the Calanques near Cassis, where dramatic limestone cliffs plunge into impossibly blue water. Hike, kayak, or take a boat tour — this is the Riviera at its most wild and beautiful."
          ] },
          { id: "fr3", title: "Paris Beyond the Eiffel Tower: 10 secret spots locals love", excerpt: "Skip the tourist traps and discover Paris like a local.", image: "/france.jpg", category: "Attractions", date: "2025-09-10", author: "Marco", content: [
            "Everyone knows the Eiffel Tower, the Louvre, and Notre-Dame. But the real Paris — the one locals love — is found in quieter corners, hidden courtyards, and off-the-beaten-path neighborhoods.",
            "Start with the Canal Saint-Martin in the 10th arrondissement. This peaceful waterway lined with iron footbridges, plane trees, and trendy cafés is where young Parisians gather for weekend picnics.",
            "Head to the Promenade Plantée, an elevated park built on an old railway line (it inspired New York's High Line). Walking above the rooftops of the 12th arrondissement is a magical experience.",
            "For the best views in Paris, skip Montmartre and go to Parc de Belleville instead. The hilltop park in the 20th arrondissement offers a sweeping panorama of the entire city, including the Eiffel Tower, without the crowds.",
            "Don't miss the Marché des Enfants Rouges in the Marais — Paris's oldest covered market. Grab Moroccan couscous, Japanese bento, or French crêpes and eat at communal tables alongside locals.",
            "Finally, explore the hidden passages of Paris: Passage des Panoramas, Galerie Vivienne, and Passage du Grand Cerf. These 19th-century covered arcades are filled with boutiques, bookshops, and quiet bistros."
          ] },
          { id: "fr4", title: "Brittany Camping: 8 beautiful campsites along the coast", excerpt: "Camp along the wild and beautiful Brittany coastline.", image: "/france.jpg", category: "Nature", date: "2025-08-05", author: "Sophie", content: [
            "Brittany's rugged coastline, dotted with lighthouses, prehistoric megaliths, and windswept beaches, is a camping paradise. Here are our favorite spots along this dramatic stretch of French coast.",
            "Camping de la Plage in Finistère puts you right on a sandy beach overlooking the Atlantic. Fall asleep to the sound of waves and wake up to stunning sunrises.",
            "Near the famous Pink Granite Coast, Camping du Ranolien offers pitches among ancient pine trees with views of the bizarre rose-colored rock formations.",
            "For wild camping (bivouac), the GR34 coastal path offers countless spots where you can pitch a tent at sunset. The stretch between Crozon and Camaret-sur-Mer is particularly stunning.",
            "Don't forget to try local Brittany crêpes and cider at the many crêperies scattered along the coast. A galette complète (buckwheat crêpe with ham, cheese, and egg) paired with local cider is the perfect camping meal."
          ] },
          { id: "fr5", title: "Corsica Adventures: Mountains and beaches on this Mediterranean island", excerpt: "Explore the untamed beauty of France's island paradise.", image: "/france.jpg", category: "Nature", date: "2025-07-22", author: "Marco", content: [
            "Corsica is France's wildest island — a rugged mountain range rising from the Mediterranean with beaches that rival the Caribbean. Napoleon's birthplace is an adventure playground.",
            "The GR20 is Europe's toughest long-distance hiking trail, crossing Corsica's mountainous spine. Even if you don't attempt the full 15-day trek, day hikes on individual stages offer incredible views.",
            "For beaches, head to the south. Palombaggia near Porto-Vecchio is often rated France's best beach, with white sand, turquoise water, and red granite rocks creating a stunning contrast.",
            "The Scandola Nature Reserve, a UNESCO World Heritage site accessible only by boat, features dramatic red cliffs, hidden caves, and crystal-clear water teeming with marine life.",
            "Corsican cuisine is a delicious blend of French and Italian influences. Try the local charcuterie (figatellu, coppa, lonzu), brocciu cheese, and chestnut-flour desserts. Pair with local Patrimonio wines."
          ] },
        ],
      },
      {
        name: "Greece",
        slug: "greece",
        heroImage: "/hero-greece.jpg",
        about: "Greece captivates travelers with its ancient history, stunning islands, crystal-clear waters, and warm hospitality. From the iconic Acropolis to hidden island coves, every corner offers a new adventure waiting to be discovered.",
        categories: ["Islands", "History", "Food", "Beaches", "Culture"],
        regions: ["Athens", "Santorini", "Crete", "Rhodes", "Mykonos", "Corfu"],
        bestMonths: [4, 5, 6, 9, 10],
        phrases: [
          { original: "Γεια σας (Yia sas)", translation: "Hello", language: "Greek" },
          { original: "Ευχαριστώ (Efcharistó)", translation: "Thank you", language: "Greek" },
          { original: "Παρακαλώ (Parakaló)", translation: "Please / You're welcome", language: "Greek" },
        ],
        articles: [
          { id: "gr1", title: "Athens Guide: Essential tips for exploring one of Europe's coolest capitals", excerpt: "Everything you need to know for an unforgettable Athens visit.", image: "/hero-greece.jpg", category: "Culture", date: "2025-12-01", author: "Sophie", content: [
            "Athens is a city where 2,500 years of history meets vibrant street art, world-class restaurants, and a buzzing nightlife scene. It's not just a stopover to the islands — it's a destination in its own right.",
            "Start at the Acropolis, but go early — arrive when the gates open at 8 AM to avoid the crowds and the midday heat. The Parthenon in the morning light, with the city stretching to the sea below, is unforgettable.",
            "Below the Acropolis, the Plaka and Anafiotika neighborhoods are a maze of bougainvillea-draped alleys, tiny churches, and hidden tavernas. Anafiotika looks like a Cycladic island village transplanted onto the hillside.",
            "For lunch, skip the tourist restaurants on the main squares. Instead, head to the Athens Central Market (Varvakeios) for the freshest seafood, or try the food stalls in Monastiraki Square.",
            "In the evening, head to the rooftop bars in Psiri or Monastiraki for cocktails with Acropolis views. A for Athens and 360 Cocktail Bar are local favorites.",
            "Day trips from Athens: Take the ferry to Aegina island (1 hour), visit the Temple of Poseidon at Cape Sounion at sunset, or explore the ancient theater of Epidaurus."
          ] },
          { id: "gr2", title: "Saronic Islands Day Trip: Exploring Aegina and hidden gems", excerpt: "Island-hop through the beautiful Saronic Gulf.", image: "/hero-greece.jpg", category: "Islands", date: "2025-11-10", author: "Marco", content: [
            "The Saronic Islands are Athens' backyard paradise — close enough for a day trip, but world-away in atmosphere. These islands offer a taste of Greek island life without the long ferry rides.",
            "Aegina is the closest and most popular, famous for its pistachio orchards and the remarkably preserved Temple of Aphaia. The port town has colorful neoclassical buildings and excellent seafood tavernas.",
            "Hydra is the jewel of the Saronic Gulf — a car-free island where donkeys carry luggage up cobblestone paths and the harbor is lined with elegant 18th-century mansions. Artists and writers have long been drawn to its beauty.",
            "Spetses, the furthest island, has a more cosmopolitan feel with pine-forested hills, pebbly beaches, and horse-drawn carriages. Rent a bike and circumnavigate the island in a few hours.",
            "The best way to explore is the Three Islands cruise from Piraeus, which visits Hydra, Poros, and Aegina in one day. But we recommend staying at least one night on Hydra to experience the island after the day-trippers leave."
          ] },
          { id: "gr3", title: "Rhodes Town: Must-see historic sites and beautiful beaches", excerpt: "A medieval town meets crystal-clear Mediterranean waters.", image: "/hero-greece.jpg", category: "History", date: "2025-10-15", author: "Sophie", content: [
            "Rhodes is the largest of the Dodecanese islands, and its Old Town is one of the best-preserved medieval cities in Europe. Walking through the massive walls feels like stepping into a time machine.",
            "The Street of the Knights is the most impressive medieval street in Greece — a perfectly restored avenue lined with the 'inns' (headquarters) of the various Knights of St. John, who ruled Rhodes from 1309 to 1522.",
            "At the top of the street stands the Palace of the Grand Master, a massive fortress-castle rebuilt by the Italians in the 1930s. The mosaic floors and medieval exhibits are well worth the visit.",
            "For beaches, head to Anthony Quinn Bay on the east coast — a small, stunningly blue cove named after the actor who fell in love with it while filming 'The Guns of Navarone.'",
            "Lindos, an hour south of Rhodes Town, is a must-visit. A whitewashed village cascades below an ancient acropolis with a temple of Athena. The views from the top are spectacular."
          ] },
          { id: "gr4", title: "Best Swim-Up Rooms in Greece: Your ultimate luxury island stay", excerpt: "Step directly from your room into sparkling pool water.", image: "/hero-greece.jpg", category: "Islands", date: "2025-09-20", author: "Marco", content: [
            "Greece has perfected the art of the swim-up room. Imagine sliding open your patio door and stepping directly into a private pool with views of the Aegean Sea. Here are our top picks.",
            "Canaves Oia Epitome in Santorini offers infinity pools that seem to merge with the caldera and the sea beyond. The sunset views from your private pool are otherworldly.",
            "Mykonos Riviera in Mykonos combines minimalist Cycladic design with swim-up suites overlooking the beach. The property's restaurant is one of the island's best.",
            "Stella Island Luxury Resort in Crete offers overwater bungalows connected by boardwalks — the closest thing to the Maldives in Europe. Each room has direct pool or lagoon access.",
            "For a more intimate experience, the Katikies hotels in Santorini are carved into the volcanic cliffside, with infinity pools perched hundreds of feet above the sea."
          ] },
          { id: "gr5", title: "10 Most Beautiful Places in Greece You Can't Miss", excerpt: "From Santorini sunsets to Meteora monasteries.", image: "/hero-greece.jpg", category: "Attractions", date: "2025-08-30", author: "Sophie", content: [
            "Greece is overflowing with beauty, from ancient ruins to pristine beaches to otherworldly landscapes. Here are the ten places that took our breath away.",
            "1. Santorini's caldera at sunset — the blue domes of Oia against the fiery sky is the most iconic image of Greece for good reason. 2. Meteora's monasteries — six monasteries perched on impossible rock pillars in central Greece.",
            "3. Navagio Beach in Zakynthos — a shipwreck on white sand surrounded by towering limestone cliffs, accessible only by boat. 4. The Acropolis of Athens — the Parthenon at golden hour is simply majestic.",
            "5. Myrtos Beach in Kefalonia — a sweeping arc of white pebbles and impossibly turquoise water backed by dramatic cliffs. 6. Monemvasia — a medieval fortress town on a rock island connected to the mainland by a single causeway.",
            "7. Balos Lagoon in Crete — where shallow turquoise waters create a tropical paradise. 8. Delphi — the ancient oracle site nestled in the mountains with views across an olive-tree valley to the sea.",
            "9. Sarakiniko Beach in Milos — lunar-white volcanic rocks sculpted by wind and waves into surreal formations. 10. The Vikos Gorge in Epirus — the world's deepest gorge relative to its width, with stunning hiking trails."
          ] },
        ],
      },
      {
        name: "Iceland",
        slug: "iceland",
        heroImage: "/iceland.jpg",
        about: "Iceland is a land of fire and ice, where dramatic landscapes, geothermal wonders, and Nordic culture create unforgettable experiences. From the Northern Lights to midnight sun, Iceland offers year-round adventure for nature lovers.",
        categories: ["Nature", "Adventure", "Hot Springs", "Wildlife", "Northern Lights"],
        regions: ["Reykjavik", "Golden Circle", "South Coast", "Westfjords", "Snæfellsnes"],
        bestMonths: [6, 7, 8, 9, 12, 1, 2],
        phrases: [
          { original: "Halló", translation: "Hello", language: "Icelandic" },
          { original: "Takk fyrir", translation: "Thank you", language: "Icelandic" },
          { original: "Skál!", translation: "Cheers!", language: "Icelandic" },
        ],
        articles: [
          { id: "is1", title: "8 Most Beautiful Places in Iceland: The Ultimate Bucket List", excerpt: "Glaciers, volcanoes, and waterfalls you need to see.", image: "/iceland.jpg", category: "Nature", date: "2025-12-05", author: "Marco", content: [
            "Iceland is a country that seems designed to make your jaw drop at every turn. Here are the eight places that left us speechless.",
            "Jökulsárlón Glacier Lagoon is Iceland's crown jewel — icebergs calve from Europe's largest glacier and float through a crystal-clear lagoon to the sea. Visit Diamond Beach next door, where ice chunks wash up on black sand.",
            "Seljalandsfoss is the waterfall you can walk behind. A narrow path takes you into a cave behind the 60-meter curtain of water — get your camera ready (and a waterproof jacket).",
            "The Westfjords are Iceland's most remote region. Dynjandi waterfall cascades down in a wedding-veil shape, and you might not see another person all day. This is Iceland as it was before tourism.",
            "Landmannalaugar's rainbow-colored rhyolite mountains look like a painter's palette. Hike through the colorful hills and finish with a soak in a natural hot river.",
            "The Snæfellsnes Peninsula is called 'Iceland in miniature' — volcanoes, glaciers, lava fields, black sand beaches, and the iconic Kirkjufell mountain, all in one compact area."
          ] },
          { id: "is2", title: "Reykjavik Guide: 10 Things to do in and around Iceland's capital", excerpt: "From street art to geothermal pools in the capital.", image: "/iceland.jpg", category: "Culture", date: "2025-11-20", author: "Sophie", content: [
            "Reykjavik is the world's northernmost capital, and despite its small size, it packs an outsized cultural punch. Here's how to make the most of your visit.",
            "Start at Hallgrímskirkja, the iconic church whose facade mimics basalt columns. Take the elevator to the top for a panoramic view of the colorful corrugated-iron rooftops of Reykjavik.",
            "Laugavegur street is the main shopping and dining strip. Pop into unique Icelandic design shops, try fermented shark at a local pub (it's an acquired taste!), and grab a hot dog from Bæjarins Beztu.",
            "The Harpa Concert Hall on the waterfront is a stunning glass structure that reflects the sky and sea. Check if there's a concert during your visit — the acoustics are superb.",
            "Take a dip in one of Reykjavik's many geothermal swimming pools. Skip the touristy Blue Lagoon and instead visit Laugardalslaug or the Sky Lagoon for a more authentic (and cheaper) geothermal experience."
          ] },
          { id: "is3", title: "7-Day Iceland Road Trip: The perfect route through the Golden Circle and beyond", excerpt: "The ultimate week-long Iceland adventure.", image: "/iceland.jpg", category: "Adventure", date: "2025-10-10", author: "Marco", content: [
            "A week in Iceland is enough to circle the entire Ring Road and see the country's greatest hits. Here's our day-by-day itinerary.",
            "Day 1-2: Start with the Golden Circle — Þingvellir National Park (where tectonic plates pull apart), Geysir (watch Strokkur erupt every 5-10 minutes), and Gullfoss waterfall. Then head to the South Coast.",
            "Day 3: Drive the South Coast past Seljalandsfoss and Skógafoss waterfalls, walk on Reynisfjara black sand beach (watch the waves!), and reach Vik.",
            "Day 4: Continue east to Jökulsárlón Glacier Lagoon and Diamond Beach. Try a glacier hiking tour on Vatnajökull.",
            "Day 5-6: Head north through the Eastfjords to Mývatn. Explore the lava formations at Dimmuborgir, swim in the Mývatn Nature Baths, and visit the Goðafoss waterfall.",
            "Day 7: Return to Reykjavik via Akureyri and the north coast, stopping at whatever catches your eye. Iceland rewards spontaneous detours."
          ] },
          { id: "is4", title: "Mývatn Region: What to do besides soaking in hot springs", excerpt: "Volcanic craters, lava formations, and bird watching.", image: "/iceland.jpg", category: "Nature", date: "2025-09-15", author: "Sophie", content: [
            "Lake Mývatn in northern Iceland is surrounded by some of the most alien landscapes on Earth. The area's volcanic activity has created a wonderland of craters, caves, and lava formations.",
            "Dimmuborgir ('Dark Castles') is a labyrinth of towering lava pillars, arches, and caves. According to Icelandic folklore, this is the entrance to the underworld. The walking paths wind through formations that look like ruined Gothic cathedrals.",
            "Hike up the Hverfjall tephra crater — a near-perfect circle 1 kilometer wide. The walk around the rim takes about an hour and offers views across the entire Mývatn region.",
            "The Grjótagjá cave contains a natural hot spring inside a lava cave (you may recognize it from Game of Thrones). Swimming is no longer permitted due to high water temperatures, but it's stunning to see.",
            "In summer, Lake Mývatn is one of Europe's best birdwatching sites, with more species of ducks than almost anywhere else in the world."
          ] },
          { id: "is5", title: "5 Reasons to Visit Iceland in Winter: Northern Lights and snow adventures", excerpt: "Why the cold season is actually the best time to visit.", image: "/iceland.jpg", category: "Northern Lights", date: "2025-08-25", author: "Marco", content: [
            "Most people visit Iceland in summer, but winter offers experiences you simply can't get during the long days of June and July.",
            "The Northern Lights are the top reason to visit between September and March. On a clear night, the aurora borealis dances across the sky in green, purple, and pink. Drive away from Reykjavik's light pollution for the best views.",
            "Ice cave tours inside Vatnajökull glacier are only available in winter. Walking through tunnels of ancient blue ice is a once-in-a-lifetime experience.",
            "Snorkeling in Silfra fissure is even more magical in winter. The crystal-clear glacial water never freezes (it stays at 2°C year-round), and the surrounding landscape covered in snow adds a dramatic backdrop.",
            "Winter is also the best time for snowmobiling on glaciers, dog sledding, and soaking in hot springs while snowflakes fall around you. And with fewer tourists, you'll often have Iceland's wonders to yourself."
          ] },
        ],
      },
      {
        name: "Italy",
        slug: "italy",
        heroImage: "/hero-greece.jpg",
        about: "Italy enchants visitors with its art, architecture, cuisine, and la dolce vita lifestyle. From the canals of Venice to the ruins of Rome, the vineyards of Tuscany to the beaches of Sardinia, Italy is a feast for all the senses.",
        categories: ["Food", "Art", "History", "Fashion", "Wine"],
        regions: ["Rome", "Florence", "Venice", "Amalfi Coast", "Tuscany", "Sicily"],
        bestMonths: [4, 5, 6, 9, 10],
        phrases: [
          { original: "Ciao", translation: "Hello / Goodbye", language: "Italian" },
          { original: "Grazie mille", translation: "Thanks a lot", language: "Italian" },
          { original: "Dov'è...?", translation: "Where is...?", language: "Italian" },
        ],
        articles: [
          { id: "it1", title: "Tuscany Road Trip: Rolling hills, vineyards, and medieval towns", excerpt: "The ultimate guide to exploring Tuscany by car.", image: "/hero-greece.jpg", category: "Wine", date: "2025-11-20", author: "Sophie", content: [
            "Tuscany is the Italy of postcards — rolling green hills dotted with cypress trees, golden stone farmhouses, and vineyards stretching to the horizon. A road trip here is pure magic.",
            "Start in Florence, the cradle of the Renaissance. The Uffizi Gallery, the Duomo, and the Ponte Vecchio are must-sees, but also wander the Oltrarno neighborhood for artisan workshops and authentic trattorias.",
            "Drive south through the Chianti region, stopping at family wineries for tastings. Greve in Chianti and Castellina in Chianti are charming towns with excellent food and wine.",
            "San Gimignano, the 'medieval Manhattan,' rises from the hilltop with its 14 surviving towers. The gelato at Gelateria Dondoli on the main square has won world championships.",
            "End in the Val d'Orcia, a UNESCO World Heritage landscape of gentle hills, lonely farmhouses, and winding roads lined with cypress trees. The towns of Pienza and Montalcino produce some of Italy's finest cheeses and wines."
          ] },
          { id: "it2", title: "Rome in 3 Days: The perfect itinerary for first-time visitors", excerpt: "See the Colosseum, Vatican, and hidden gems in 72 hours.", image: "/hero-greece.jpg", category: "History", date: "2025-10-15", author: "Marco", content: [
            "Rome wasn't built in a day, and you can't see it all in three. But with the right plan, you can hit the highlights and still find time for the dolce vita.",
            "Day 1: Start at the Colosseum and Roman Forum early morning. Walk up Palatine Hill for views over the ancient ruins. In the afternoon, toss a coin in the Trevi Fountain and explore the Spanish Steps area.",
            "Day 2: Dedicate to the Vatican. St. Peter's Basilica is free, but book skip-the-line tickets for the Vatican Museums and Sistine Chapel. The Raphael Rooms are often overlooked but equally stunning.",
            "Day 3: Cross the Tiber to Trastevere, Rome's most charming neighborhood. Wander cobblestone alleys, eat at family-run trattorias, and visit the beautiful Santa Maria in Trastevere church.",
            "Evening tip: Romans eat late. Don't go to restaurants before 8 PM. Head to Testaccio for authentic Roman cuisine — cacio e pepe, carbonara, and supplì (fried rice balls) are non-negotiable."
          ] },
          { id: "it3", title: "Amalfi Coast: A complete guide to Italy's most stunning coastline", excerpt: "Colorful villages perched on dramatic cliffs above the Mediterranean.", image: "/hero-greece.jpg", category: "Nature", date: "2025-09-08", author: "Sophie", content: [
            "The Amalfi Coast is one of the most dramatic stretches of coastline in the world — colorful villages clinging to steep cliffs above an impossibly blue sea.",
            "Positano is the most photogenic town, with pastel houses cascading down the hillside to the beach. It's touristy but irresistible. Get the famous lemon granita at any café.",
            "Amalfi town itself has a stunning cathedral with Arab-Norman architecture and peaceful lemon groves in the hills above. Take a cooking class and learn to make limoncello.",
            "Ravello, high above the coast, is quieter and more refined. Villa Rufolo's gardens have inspired artists for centuries, and the views from the terrace are the best on the coast.",
            "The best way to experience the coast is by boat. Rent a small boat (no license needed for boats under 40 HP) and explore hidden coves, swim in turquoise waters, and see the coast from its best angle."
          ] },
          { id: "it4", title: "Venice Without the Crowds: Quiet canals and local secrets", excerpt: "Discover the Venice that tourists rarely see.", image: "/hero-greece.jpg", category: "Culture", date: "2025-08-22", author: "Marco", content: [
            "Venice feels like it's drowning in tourists, but escape the main arteries between San Marco and Rialto, and you'll find a quieter, more authentic city.",
            "Head to Dorsoduro for world-class art at the Accademia Gallery and Peggy Guggenheim Collection. The neighborhood's fondamenta (canal-side walkways) are peaceful, and the views to Giudecca island are beautiful.",
            "Cannaregio is the real Venice. The Strada Nova has local shops and bakeries, and the former Jewish Ghetto (the world's first) has fascinating history and excellent restaurants.",
            "For the best cicchetti (Venetian tapas), skip the tourist bars near San Marco and head to All'Arco near the Rialto market or Cantina Do Spade. Try baccalà mantecato (creamed salt cod) and sarde in saor (sweet and sour sardines).",
            "Wake up early — before 8 AM, Venice belongs to the locals. The light on the canals in the early morning is magical, and you'll have San Marco practically to yourself."
          ] },
          { id: "it5", title: "Sicily: Ancient ruins, street food, and volcanic adventures", excerpt: "Italy's largest island is a world of its own.", image: "/hero-greece.jpg", category: "Food", date: "2025-07-18", author: "Sophie", content: [
            "Sicily is not just part of Italy — it's its own universe. Greek temples, Arab markets, Norman cathedrals, and the best street food in the Mediterranean all coexist on this sun-baked island.",
            "Palermo's street food scene is legendary. Try arancini (fried rice balls), panelle (chickpea fritters), and the adventurous pane con la milza (spleen sandwich) at the Ballarò market.",
            "The Valley of the Temples in Agrigento is one of the most important archaeological sites in the world — a row of Greek temples more complete than most ruins in Greece itself.",
            "Mount Etna, Europe's most active volcano, dominates eastern Sicily. Take a guided hike to the summit craters, or explore the vineyards on Etna's fertile slopes, where some of Sicily's best wines are produced.",
            "Taormina, perched on a cliff above the Ionian Sea, has a stunning ancient Greek theater still used for performances. The views of Etna and the coast from the theater are among the most photographed in Italy."
          ] },
        ],
      },
      {
        name: "Netherlands",
        slug: "netherlands",
        heroImage: "/hero-camping.jpg",
        about: "The Netherlands offers charming canals, windmills, tulip fields, and vibrant cities. Cycle through the countryside, explore world-class museums, and experience the famously liberal Dutch culture.",
        categories: ["Culture", "Nature", "Food", "Art", "Cycling"],
        bestMonths: [4, 5, 6, 7, 8, 9],
        phrases: [
          { original: "Hallo", translation: "Hello", language: "Dutch" },
          { original: "Dank je wel", translation: "Thank you", language: "Dutch" },
          { original: "Proost!", translation: "Cheers!", language: "Dutch" },
        ],
        articles: [
          { id: "nl1", title: "Amsterdam Beyond the Red Light District: A local's guide", excerpt: "Discover Amsterdam's charming neighborhoods and hidden gems.", image: "/hero-camping.jpg", category: "Culture", date: "2025-11-25", author: "Marco", content: [
            "Amsterdam is so much more than its famous Red Light District. The city's real charm lies in its canal-side neighborhoods, each with its own distinct character.",
            "De Jordaan is the most picturesque neighborhood — narrow streets lined with independent boutiques, art galleries, and cozy brown cafés. Visit the Anne Frank House early in the morning to avoid queues.",
            "The Museumplein area houses three world-class museums: the Rijksmuseum (Rembrandt, Vermeer), the Van Gogh Museum, and the Stedelijk Museum of modern art. A museum card covers all three.",
            "Rent a bike (this is the Netherlands, after all) and cycle to Vondelpark for a picnic, or ride east to the trendy De Pijp neighborhood and its Albert Cuyp Market — the biggest outdoor market in Europe.",
            "For the best Indonesian rijsttafel (rice table), head to Blauw or Ron Gastrobar. The Dutch colonial connection to Indonesia means Amsterdam has some of the best Indonesian food outside of Java."
          ] },
          { id: "nl2", title: "Tulip Season: When and where to see the Netherlands in bloom", excerpt: "Everything you need to know about Dutch tulip fields.", image: "/hero-camping.jpg", category: "Nature", date: "2025-10-10", author: "Sophie", content: [
            "Tulip season in the Netherlands is a phenomenon — millions of flowers paint the countryside in stripes of red, yellow, pink, and purple. It's one of Europe's most spectacular natural displays.",
            "Peak bloom usually falls between mid-April and early May. Keukenhof Gardens, the world's largest flower garden, is the most popular spot with 7 million bulbs planted each year.",
            "For a more authentic experience, rent a bike and cycle through the Bollenstreek (Bulb Region) between Haarlem and Leiden. The fields stretch to the horizon in every direction.",
            "The flower auction at Aalsmeer (Royal FloraHolland) is the world's largest — 20 million flowers are sold here every day. Visitors can watch from a gallery above the trading floor.",
            "Time your visit with King's Day (April 27) and you'll catch tulip season AND the Netherlands' biggest street party, where the entire country turns orange."
          ] },
          { id: "nl3", title: "Cycling the Dutch Countryside: Windmills, cheese, and cozy villages", excerpt: "The perfect bike route through Holland's green heart.", image: "/hero-camping.jpg", category: "Cycling", date: "2025-09-05", author: "Marco", content: [
            "The Netherlands was made for cycling. With 35,000 km of dedicated bike paths, flat terrain, and cycling infrastructure that's the envy of the world, it's the best country on Earth to explore on two wheels.",
            "Start in Gouda (yes, the cheese town) and cycle north through the Green Heart — the rural area between Amsterdam, Rotterdam, and Utrecht. Pass through polder landscapes, over tiny bridges, and past grazing cows.",
            "Stop at Kinderdijk to see 19 historic windmills in a row — a UNESCO World Heritage site and the most iconic image of the Netherlands.",
            "In Zaanse Schans near Amsterdam, working windmills, traditional houses, and craft workshops have been preserved. Watch clogs being carved, cheese being made, and windmill sails turning in the breeze.",
            "The cycling network uses numbered junction points (knooppunten) — simply follow the numbers and you can create any route you like. Most Dutch cycling maps and apps are based on this brilliant system."
          ] },
        ],
      },
      {
        name: "Portugal",
        slug: "portugal",
        heroImage: "/hero-greece.jpg",
        about: "Portugal captivates with its coastline, port wine, fado music, and historic cities. From the cobblestoned streets of Lisbon to the wild beaches of the Algarve, Portugal offers an authentic, affordable, and utterly charming European experience.",
        categories: ["Beaches", "Food", "Wine", "History", "Surfing"],
        bestMonths: [4, 5, 6, 9, 10],
        phrases: [
          { original: "Olá", translation: "Hello", language: "Portuguese" },
          { original: "Obrigado/a", translation: "Thank you", language: "Portuguese" },
          { original: "Saúde!", translation: "Cheers!", language: "Portuguese" },
        ],
        articles: [
          { id: "pt1", title: "Lisbon Guide: The ultimate 4-day itinerary for Portugal's capital", excerpt: "Hills, tiles, trams, and pastéis de nata — Lisbon has it all.", image: "/hero-greece.jpg", category: "Culture", date: "2025-11-18", author: "Sophie", content: [
            "Lisbon is one of Europe's most captivating capitals — a city of seven hills, pastel-colored buildings, melancholic fado music, and some of the best food on the continent.",
            "Ride the iconic Tram 28 through the narrow streets of Alfama, Lisbon's oldest neighborhood. Get off at random stops to explore: every alley reveals a hidden viewpoint or tiny fado club.",
            "The pastéis de nata (custard tarts) at Pastéis de Belém are legendary, but you'll find excellent ones at any local pastelaria. Eat them warm, sprinkled with cinnamon and powdered sugar.",
            "The Time Out Market in Cais do Sodré brings together the best of Lisbon's food scene under one roof. Try pica-pau (beef bites in garlic), cured meats from the Alentejo, and seafood rice.",
            "For sunset, head to the Miradouro da Graça or the lesser-known Miradouro da Senhora do Monte — the highest viewpoint in the city, with sweeping views over the terracotta rooftops to the Tagus River and the 25 de Abril Bridge."
          ] },
          { id: "pt2", title: "Algarve: The most beautiful beaches and hidden coves", excerpt: "Golden cliffs, turquoise waters, and secret grottos.", image: "/hero-greece.jpg", category: "Beaches", date: "2025-10-05", author: "Marco", content: [
            "The Algarve's coastline is one of Europe's most stunning — dramatic golden cliffs riddled with sea caves, arches, and hidden coves lapped by crystal-clear turquoise water.",
            "Praia da Marinha is regularly voted one of the world's best beaches. The rock formations here are extraordinary — swim through natural arches and explore caves at low tide.",
            "Take a boat tour from Lagos to see the Ponta da Piedade grottos — towering sandstone pillars and arches rise from the sea, with hidden grottoes accessible only by boat.",
            "Benagil Sea Cave is the Algarve's most famous natural wonder — a domed cave with an opening to the sky, accessible only by water. Rent a kayak or take a boat tour from Benagil beach.",
            "For fewer crowds, head west to the Vicentine Coast — the beaches near Aljezur (Arrifana, Monte Clérigo) are wilder, less developed, and popular with surfers."
          ] },
          { id: "pt3", title: "Porto & the Douro Valley: Wine, bridges, and river cruises", excerpt: "Portugal's charming northern city and wine country.", image: "/hero-greece.jpg", category: "Wine", date: "2025-09-12", author: "Sophie", content: [
            "Porto is Portugal's gritty, authentic second city — less polished than Lisbon but arguably more characterful. And the port wine is, of course, extraordinary.",
            "Cross the Dom Luís I Bridge for the classic Porto photo. The Ribeira district along the river is a UNESCO World Heritage site with colorful buildings and excellent seafood restaurants.",
            "In Vila Nova de Gaia, across the river, the famous port wine cellars offer tastings. Graham's, Taylor's, and Sandeman all have atmospheric cellars where you can learn about the winemaking process.",
            "Take a day trip to the Douro Valley — the world's oldest demarcated wine region. A train ride along the river is one of Europe's most scenic, with terraced vineyards rising from the water on both sides.",
            "Back in Porto, don't miss the São Bento train station (stunning azulejo tile panels), the Livraria Lello bookshop (one of the world's most beautiful), and a francesinha — Porto's legendary meat-and-cheese-covered sandwich."
          ] },
        ],
      },
      {
        name: "Spain",
        slug: "spain",
        heroImage: "/hero-desert.jpg",
        about: "Spain dazzles with flamenco, tapas, stunning architecture, and sun-kissed beaches. From the artistic treasures of Barcelona to the Moorish palaces of Andalusia, Spain is a country that lives life with passion.",
        categories: ["Food", "Culture", "Beaches", "Art", "Nightlife"],
        regions: ["Barcelona", "Madrid", "Ibiza", "Mallorca", "Andalusia", "Canary Islands"],
        bestMonths: [4, 5, 6, 9, 10],
        phrases: [
          { original: "¡Hola!", translation: "Hello!", language: "Spanish" },
          { original: "Muchas gracias", translation: "Thank you very much", language: "Spanish" },
          { original: "¿Dónde está...?", translation: "Where is...?", language: "Spanish" },
        ],
        articles: [
          { id: "es1", title: "Barcelona in 4 Days: Gaudí, tapas, and beaches", excerpt: "The perfect itinerary for Spain's most creative city.", image: "/hero-desert.jpg", category: "Culture", date: "2025-11-22", author: "Marco", content: [
            "Barcelona is a city that fires all your senses — Gaudí's impossible architecture, the Mediterranean breeze, incredible food, and a nightlife that doesn't start until midnight.",
            "Day 1: Dedicate to Gaudí. Start at the Sagrada Família (book tickets months in advance), then walk to Casa Batlló and Casa Milà on Passeig de Gràcia. End at Park Güell for sunset views.",
            "Day 2: Explore the Gothic Quarter's medieval streets and the Born neighborhood. Visit the Picasso Museum, browse the boutiques, and enjoy vermouth and tapas at Bar del Pla.",
            "Day 3: Head to Barceloneta beach in the morning, then spend the afternoon at La Boqueria market on La Rambla. In the evening, see a flamenco show at Tablao Cordobés.",
            "Day 4: Take the funicular to Montjuïc for the Joan Miró Foundation and panoramic city views. End your trip with a multi-course tasting menu at one of El Born's innovative restaurants."
          ] },
          { id: "es2", title: "Andalusia Road Trip: From Seville to Granada", excerpt: "Flamenco, Alhambra, and whitewashed villages.", image: "/hero-desert.jpg", category: "Culture", date: "2025-10-18", author: "Sophie", content: [
            "Andalusia is Spain at its most passionate — flamenco, bullfighting, Moorish palaces, and whitewashed pueblos blancos under a blazing sun.",
            "Start in Seville with the Real Alcázar (Game of Thrones fans will recognize it), the Gothic cathedral, and a flamenco show in the Triana neighborhood.",
            "Drive to Córdoba to see the Mezquita — a mosque-turned-cathedral that's one of the most awe-inspiring buildings in Europe. The forest of red-and-white arches inside is unforgettable.",
            "Stop in Ronda, perched on a dramatic cliff with the Puente Nuevo bridge spanning a 100-meter gorge. It's one of Spain's most spectacular towns.",
            "End in Granada with the Alhambra — reserve tickets well in advance. The Nasrid Palaces are the highlight, with impossibly intricate geometric patterns and gardens that seem to float above the city."
          ] },
          { id: "es3", title: "San Sebastián: The food capital of Spain", excerpt: "Pintxos bars, Michelin stars, and stunning beaches.", image: "/hero-desert.jpg", category: "Food", date: "2025-09-25", author: "Marco", content: [
            "San Sebastián in the Basque Country has more Michelin stars per capita than almost anywhere on Earth. But you don't need a fancy restaurant — the pintxos bars are where the magic happens.",
            "A pintxos crawl through the Parte Vieja (Old Town) is a must. Each bar specializes in different bites — txangurro (spider crab), gilda (anchovy, olive, pepper skewer), and crispy prawn tempura.",
            "La Concha beach, a perfect crescent of sand in the heart of the city, is regularly ranked among Europe's best urban beaches. Swim, surf, or simply stroll along the promenade.",
            "Take the funicular to Monte Igueldo for panoramic views of the bay, the old town, and the surrounding green hills. The view at sunset, with the sea turning gold, is breathtaking.",
            "For a culinary experience, book a table at Arzak, one of the world's most innovative restaurants and a pioneer of New Basque cuisine. Or try the more accessible Gandarias for premium pintxos."
          ] },
        ],
      },
    ],
  },
  {
    name: "Asia",
    slug: "asia",
    heroImage: "/asia-temple.jpg",
    introduction: "Asia is a continent of contrasts and extremes. From towering mountains to tropical beaches, ancient temples to ultra-modern cities. Asia has something for every traveler. A journey through Asia takes you past millennia-old cultures, diverse cuisines, and landscapes that take your breath away.",
    countries: [
      {
        name: "Philippines",
        slug: "philippines",
        heroImage: "/asia-temple.jpg",
        about: "The Philippines offers pristine beaches, crystal-clear waters, and warm Filipino hospitality. With over 7,000 islands, this tropical paradise has everything from world-class diving to stunning rice terraces.",
        categories: ["Beaches", "Islands", "Nature", "Food", "Culture"],
        regions: ["Manila", "Palawan", "Cebu", "Boracay", "Siargao", "Bohol"],
        bestMonths: [1, 2, 3, 4, 5],
        phrases: [
          { original: "Kamusta", translation: "Hello / How are you?", language: "Filipino" },
          { original: "Salamat po", translation: "Thank you (polite)", language: "Filipino" },
          { original: "Maganda!", translation: "Beautiful!", language: "Filipino" },
        ],
        articles: [
          { id: "ph1", title: "Island Hopping in Palawan: The ultimate guide to El Nido", excerpt: "Discover paradise lagoons and limestone cliffs.", image: "/asia-temple.jpg", category: "Islands", date: "2025-11-01", author: "Marco", content: [
            "El Nido in Palawan is the Philippines at its most spectacular — towering limestone karsts, hidden lagoons, and beaches so perfect they look photoshopped.",
            "Book an island-hopping tour (Tours A and C are the best). Tour A takes you to the Big and Small Lagoons, where you kayak through crystal-clear water between dramatic cliff faces.",
            "Secret Beach on Tour C is accessed by swimming through a narrow opening in a limestone cliff. Inside, a hidden crescent of white sand is surrounded by towering karst walls — pure magic.",
            "Stay in El Nido town or, for a more secluded experience, book a beachfront hut in Nacpan Beach, a 4-kilometer stretch of golden sand 45 minutes from town.",
            "The sunsets from Las Cabañas Beach are the best in El Nido. Grab a beer, settle into a bean bag, and watch the sky turn every shade of orange and pink behind the island silhouettes."
          ] },
          { id: "ph2", title: "Bohol & Chocolate Hills: A complete travel guide", excerpt: "Tarsiers, river cruises, and iconic geological formations.", image: "/asia-temple.jpg", category: "Nature", date: "2025-10-15", author: "Sophie", content: [
            "Bohol is a compact island with outsized attractions — from the iconic Chocolate Hills to the adorable tarsiers, it's a must-visit destination in the Philippines.",
            "The Chocolate Hills are 1,268 perfectly conical hills that turn brown in the dry season, earning their chocolatey name. The viewing deck at Carmen offers a stunning panorama.",
            "Visit the Philippine Tarsier Sanctuary to see the world's smallest primates. These bug-eyed creatures are nocturnal and incredibly fragile — keep quiet and don't use flash photography.",
            "Take the Loboc River cruise for a floating lunch through lush jungle scenery, with local musicians serenading you from the riverbank.",
            "Panglao Island, connected to Bohol by bridges, has stunning white-sand beaches. Alona Beach is the most popular, but for fewer crowds head to Dumaluan Beach."
          ] },
          { id: "ph3", title: "Siargao: The surfing capital of the Philippines", excerpt: "Tropical island vibes and world-class waves.", image: "/asia-temple.jpg", category: "Beaches", date: "2025-09-20", author: "Marco", content: [
            "Siargao has exploded in popularity, and for good reason. This teardrop-shaped island has incredible surf, jaw-dropping natural pools, and a laid-back vibe that's hard to leave.",
            "Cloud 9 is the most famous surf break, with a powerful barrel wave that attracts surfers from around the world. If you're a beginner, there are gentler waves at Jacking Horse and Stimpy's.",
            "The Magpupungko Rock Pools at low tide are otherworldly — natural infinity pools carved into flat rock shelves with crystal-clear water. Time your visit with the tide charts.",
            "Rent a motorbike and explore the island's palm-lined roads. The Sugba Lagoon, accessible by boat from Del Carmen, is a stunning turquoise lagoon perfect for paddleboarding and swimming.",
            "Siargao's nightlife centers around Tourism Road in General Luna, with beachfront bars, live music, and some surprisingly good international restaurants."
          ] },
        ],
      },
      {
        name: "Indonesia",
        slug: "indonesia",
        heroImage: "/asia-temple.jpg",
        about: "Indonesia is a tropical archipelago of incredible diversity, with over 17,000 islands ranging from the temples of Java to the rice terraces of Bali and the dragons of Komodo.",
        categories: ["Temples", "Beaches", "Nature", "Food", "Culture"],
        regions: ["Bali", "Java", "Lombok", "Komodo", "Sumatra", "Raja Ampat"],
        bestMonths: [4, 5, 6, 7, 8, 9],
        phrases: [
          { original: "Selamat pagi", translation: "Good morning", language: "Indonesian" },
          { original: "Terima kasih", translation: "Thank you", language: "Indonesian" },
          { original: "Berapa harganya?", translation: "How much does it cost?", language: "Indonesian" },
        ],
        articles: [
          { id: "id1", title: "Bali Beyond the Tourist Trail: Hidden temples and rice terraces", excerpt: "Discover the Bali that Instagram doesn't show you.", image: "/asia-temple.jpg", category: "Culture", date: "2025-11-12", author: "Sophie", content: [
            "Bali is so much more than beach clubs and Instagram influencers. The real Bali — of ancient temples, emerald rice terraces, and sacred rituals — is found away from the crowds of Seminyak and Kuta.",
            "Head north to Munduk for misty waterfalls, coffee plantations, and rice terraces without the crowds of Tegallalang. The Munduk Waterfall hike takes you through lush jungle to multiple cascades.",
            "Tirta Gangga water palace in East Bali is a serene maze of pools, fountains, and stone carvings. Go early morning to have this beautiful place almost to yourself.",
            "Sidemen Valley is Bali's hidden gem — stunning rice terraces, a backdrop of Mount Agung, and barely any tourists. Stay in a traditional Balinese compound and join a cooking class.",
            "For spiritual Bali, attend a temple ceremony. The Balinese Hindu ceremonies are colorful, musical affairs with offerings, incense, and gamelan orchestras. Pura Lempuyang and Besakih are the most impressive."
          ] },
          { id: "id2", title: "Komodo National Park: Meeting the dragons face to face", excerpt: "Hike, snorkel, and encounter prehistoric reptiles.", image: "/asia-temple.jpg", category: "Nature", date: "2025-10-08", author: "Marco", content: [
            "Komodo National Park is one of the most unique wildlife experiences on Earth — walking among 3-meter-long Komodo dragons in their natural habitat.",
            "Most visitors take a 2-3 day liveaboard boat trip from Labuan Bajo. The boats visit Komodo Island and Rinca Island, where park rangers guide you through dragon territory.",
            "The dragons are impressive but surprisingly fast. Your ranger carries a forked stick for protection, but encounters are generally safe. The dragons mostly ignore humans unless provoked.",
            "Between dragon treks, the snorkeling is world-class. Manta Point lives up to its name — giant manta rays with wingspans up to 5 meters glide through the current.",
            "Pink Beach (Pantai Merah) gets its color from microscopic red coral fragments mixed with white sand. It's one of only seven pink beaches in the world, and the snorkeling right off the beach is excellent."
          ] },
          { id: "id3", title: "Java: Temples, volcanoes, and street food adventures", excerpt: "Indonesia's cultural heartland from Yogyakarta to Bromo.", image: "/asia-temple.jpg", category: "Temples", date: "2025-09-15", author: "Sophie", content: [
            "Java is Indonesia's cultural soul — home to ancient temples, active volcanoes, royal palaces, and some of the best street food in Southeast Asia.",
            "Borobudur at sunrise is a bucket-list experience. The world's largest Buddhist temple emerges from the morning mist, its hundreds of Buddha statues silhouetted against the dawn sky.",
            "Prambanan, just outside Yogyakarta, is the Hindu counterpart to Borobudur — a complex of towering temples dedicated to Shiva, Vishnu, and Brahma, dramatically lit at sunset.",
            "Mount Bromo in East Java is a surreal landscape — an active volcano inside a vast caldera, surrounded by a sea of volcanic sand. The sunrise viewpoint from Mount Penanjakan is unforgettable.",
            "Yogyakarta's street food scene rivals Bangkok's. Try gudeg (jackfruit stew), bakpia (sweet pastries), and sate klatak (goat satay grilled over charcoal). Jalan Malioboro comes alive at night with food stalls."
          ] },
        ],
      },
      {
        name: "Japan",
        slug: "japan",
        heroImage: "/asia-temple.jpg",
        about: "Japan blends ancient traditions with cutting-edge modernity in a way no other country can match. From serene Zen gardens to neon-lit cities, ancient forests to bullet trains, Japan is endlessly fascinating.",
        categories: ["Culture", "Food", "Temples", "Nature", "Technology"],
        regions: ["Tokyo", "Kyoto", "Osaka", "Hokkaido", "Hiroshima", "Okinawa"],
        bestMonths: [3, 4, 10, 11],
        phrases: [
          { original: "こんにちは (Konnichiwa)", translation: "Hello", language: "Japanese" },
          { original: "ありがとう (Arigatou)", translation: "Thank you", language: "Japanese" },
          { original: "すみません (Sumimasen)", translation: "Excuse me / Sorry", language: "Japanese" },
        ],
        articles: [
          { id: "jp1", title: "Camper Van Rental in Japan: Complete guide with 7-day road trip route", excerpt: "Explore Japan's countryside in a camper van.", image: "/asia-temple.jpg", category: "Adventure", date: "2025-10-15", author: "Marco", content: [
            "Renting a camper van in Japan is one of the best ways to explore the country's stunning countryside — and it's easier than you think.",
            "Japan has an incredible network of 'michi no eki' (roadside stations) where camper vans can park overnight for free. Most have clean toilets, vending machines, and local produce shops.",
            "Start in Tokyo, pick up your van, and head to the Fuji Five Lakes region. Wake up to views of Mount Fuji reflected in Lake Kawaguchiko — one of Japan's most iconic scenes.",
            "Continue to the Japanese Alps and park in Kamikochi, a pristine mountain valley accessible only by bus or foot. Hike along crystal-clear rivers through old-growth forests.",
            "Drive along the coast of the Noto Peninsula — a remote, traditional area of Japan with terraced rice paddies dropping to the sea, tiny fishing villages, and almost no tourists."
          ] },
          { id: "jp2", title: "Tokyo in 5 Days: The ultimate guide to Japan's capital", excerpt: "From Shibuya crossing to hidden ramen alleys.", image: "/asia-temple.jpg", category: "Culture", date: "2025-09-28", author: "Sophie", content: [
            "Tokyo is a city that defies comprehension — 14 million people living in a metropolis that somehow manages to be both futuristic and deeply traditional, chaotic and eerily peaceful.",
            "Day 1: Start in Asakusa at the Sensoji Temple, Tokyo's oldest. Walk through the Thunder Gate and browse the Nakamise-dori shopping street. Then head to the nearby Tokyo Skytree for panoramic views.",
            "Day 2: Explore Shinjuku and Shibuya — watch the famous scramble crossing, get lost in the underground shopping malls, and find a tiny Golden Gai bar (six-seat establishments in narrow alleys).",
            "Day 3: Harajuku for street fashion and youth culture, followed by the serene Meiji Shrine hidden in a forest in the middle of the city. Omotesando is Tokyo's Champs-Élysées.",
            "Day 4-5: Take a day trip to Kamakura to see the Great Buddha, or explore the electronic chaos of Akihabara. End with a night in Roppongi or Shimokitazawa for live music and craft beer."
          ] },
          { id: "jp3", title: "Kyoto Temple Guide: 12 temples you absolutely must visit", excerpt: "Golden pavilions, bamboo groves, and Zen gardens.", image: "/asia-temple.jpg", category: "Temples", date: "2025-09-10", author: "Marco", content: [
            "Kyoto has over 2,000 temples and shrines, so choosing which to visit can be overwhelming. Here are the 12 that we think are absolutely unmissable.",
            "Kinkaku-ji (Golden Pavilion) is Kyoto's poster child — a gold-leaf-covered pavilion reflected in a mirror-still pond. Go early morning for the best photos and fewest crowds.",
            "Fushimi Inari Taisha and its thousands of vermillion torii gates snaking up the mountainside is one of Japan's most iconic images. Start climbing at dawn to have the paths almost to yourself.",
            "Arashiyama's Bamboo Grove is a natural cathedral of towering green stalks. Visit Tenryuji Temple nearby — its Zen garden is one of Kyoto's finest.",
            "For a deeper experience, book a zazen (Zen meditation) session at Shunko-in Temple. The English-speaking head priest offers insightful sessions on Zen Buddhism and Japanese tea ceremony."
          ] },
        ],
      },
      {
        name: "China",
        slug: "china",
        heroImage: "/asia-temple.jpg",
        about: "China offers millennia of history, incredible food, and vast landscapes. From the Great Wall to the rice terraces of Guilin, from Shanghai's futuristic skyline to rural villages untouched by time.",
        categories: ["History", "Food", "Nature", "Culture", "Architecture"],
        regions: ["Beijing", "Guangzhou", "Hong Kong", "Shanghai", "Yangshuo", "Tibet"],
        bestMonths: [4, 5, 9, 10],
        phrases: [
          { original: "你好 (Nǐ hǎo)", translation: "Hello", language: "Mandarin" },
          { original: "谢谢 (Xièxiè)", translation: "Thank you", language: "Mandarin" },
          { original: "多少钱？(Duōshao qián?)", translation: "How much?", language: "Mandarin" },
        ],
        articles: [
          { id: "cn1", title: "The Great Wall: Best sections to visit and how to avoid the crowds", excerpt: "Experience China's most iconic monument the right way.", image: "/asia-temple.jpg", category: "History", date: "2025-11-05", author: "Sophie", content: [
            "The Great Wall stretches over 21,000 kilometers, but most visitors see only a tiny fraction. Choose your section wisely for the best experience.",
            "Badaling is the most visited — fully restored, accessible, and crowded. Skip it unless you're short on time. Mutianyu is a better choice: well-restored, with fewer crowds and a cable car.",
            "For adventurers, Jinshanling is the sweet spot — partially restored and partially wild, with dramatic tower-to-tower walks along a ridgeline. The sunset hike here is magnificent.",
            "The wild, unrestored section at Jiankou is for experienced hikers only. Crumbling watchtowers and overgrown paths create a hauntingly beautiful experience, but it requires careful footwork.",
            "Book a guide for Jinshanling or Jiankou — they know the safest routes and can time your hike for the best light. Avoid weekends and Chinese public holidays when all sections get extremely crowded."
          ] },
          { id: "cn2", title: "Guilin & Yangshuo: Karst mountains and river cruises", excerpt: "Dreamy landscapes straight out of a Chinese painting.", image: "/asia-temple.jpg", category: "Nature", date: "2025-10-12", author: "Marco", content: [
            "The karst landscape of Guilin and Yangshuo looks like it was painted by a traditional Chinese artist — conical limestone mountains rising from misty rivers and rice paddies.",
            "Take the Li River cruise from Guilin to Yangshuo (4-5 hours). The scenery along the river — jade-green water winding through countless karst peaks — is on China's 20 yuan banknote.",
            "In Yangshuo, rent a bicycle and ride along the Yulong River. The bamboo raft trips here are quieter and more intimate than the Li River cruise.",
            "Hike to the Moon Hill viewpoint for a panoramic view of the karst landscape. The natural arch at the summit makes for a unique framing device for photos.",
            "At night, the Impression Liu Sanjie show on the Li River uses the actual mountains as a backdrop — 600 performers on a 'stage' of water. It was directed by Zhang Yimou of Olympic ceremony fame."
          ] },
          { id: "cn3", title: "Shanghai: Where East meets West in dazzling style", excerpt: "Futuristic skylines, French Concession charm, and incredible food.", image: "/asia-temple.jpg", category: "Culture", date: "2025-09-18", author: "Sophie", content: [
            "Shanghai is China at its most cosmopolitan — a city where Art Deco meets futuristic skyscrapers, traditional dumpling shops sit next to Michelin-starred restaurants, and East truly meets West.",
            "The Bund at sunset is Shanghai's most iconic view — stand on the waterfront promenade and watch the Pudong skyline light up across the river. The contrast between the colonial European buildings behind you and the futuristic towers ahead is stunning.",
            "The French Concession is Shanghai's most charming neighborhood — tree-lined streets with European architecture, independent boutiques, and excellent coffee shops and cocktail bars.",
            "For food, head to Jiashan Market in the French Concession for international cuisine, or Fangbang Road for traditional Shanghai street food. Xiao long bao (soup dumplings) at Din Tai Fung are legendary.",
            "Take the Maglev train from the airport — at 430 km/h, it's the fastest commercial train in the world and a uniquely Shanghai experience."
          ] },
        ],
      },
      {
        name: "Sri Lanka",
        slug: "sri-lanka",
        heroImage: "/asia-temple.jpg",
        about: "Sri Lanka packs beaches, temples, tea plantations, and wildlife into one small island. This tear-shaped island off India's southern tip offers an extraordinary range of experiences within a compact area.",
        categories: ["Temples", "Wildlife", "Beaches", "Tea", "Culture"],
        regions: ["Colombo", "Kandy", "Ella", "Sigiriya", "Galle", "Mirissa"],
        bestMonths: [1, 2, 3, 7, 8],
        phrases: [
          { original: "ආයුබෝවන් (Āyubōvan)", translation: "Hello / Welcome", language: "Sinhala" },
          { original: "ස්තූතියි (Stūtiyi)", translation: "Thank you", language: "Sinhala" },
          { original: "කොහොමද? (Kohomada?)", translation: "How are you?", language: "Sinhala" },
        ],
        articles: [
          { id: "lk1", title: "Sri Lanka in 2 Weeks: The ultimate route from Colombo to the coast", excerpt: "Temples, tea country, safaris, and beaches in one trip.", image: "/asia-temple.jpg", category: "Culture", date: "2025-11-08", author: "Marco", content: [
            "Two weeks in Sri Lanka is the perfect amount of time to experience the island's incredible diversity — from ancient temples to misty tea plantations to palm-fringed beaches.",
            "Start in the Cultural Triangle: climb Sigiriya Rock Fortress (the 'Eighth Wonder of the World'), explore the ancient city of Polonnaruwa, and visit the sacred Buddhist site at Dambulla Cave Temple.",
            "Take the train from Kandy to Ella — widely regarded as one of the world's most scenic train journeys. The blue train winds through emerald tea plantations and misses tunnels by inches.",
            "In the Hill Country, visit a tea plantation in Nuwara Eliya and learn about Ceylon tea production. The misty hills and colonial-era bungalows feel more like England than the tropics.",
            "End on the southern coast — Unawatuna and Mirissa have beautiful beaches, excellent surf, and whale watching (blue whales pass between December and April)."
          ] },
          { id: "lk2", title: "Ella: Hiking, trains, and the best viewpoints in Sri Lanka", excerpt: "A small hill town with big adventures.", image: "/asia-temple.jpg", category: "Nature", date: "2025-10-20", author: "Sophie", content: [
            "Ella is a tiny town in Sri Lanka's Hill Country that has become a traveler favorite. Set among misty mountains and tea estates, it's the perfect base for hiking and exploring.",
            "Hike Little Adam's Peak for stunning views of the Ella Gap — a sweeping vista of valleys, mountains, and distant plains. The hike takes about 45 minutes and is suitable for all fitness levels.",
            "The Nine Arches Bridge is one of Sri Lanka's most photographed spots. This colonial-era viaduct, nestled in jungle and tea plantations, looks like something from a fairytale — especially when a blue train crosses it.",
            "For more challenge, climb Ella Rock (allow 3-4 hours round trip). The trail passes through tea plantations and forest, and the views from the summit are spectacular.",
            "Don't miss Ravana Falls, one of Sri Lanka's widest waterfalls, just outside town. Cool off in the natural pool at the base after a hot hike."
          ] },
        ],
      },
      {
        name: "Thailand",
        slug: "thailand",
        heroImage: "/asia-temple.jpg",
        about: "Thailand enchants with golden temples, tropical islands, and world-famous street food. The 'Land of Smiles' offers incredible value and diverse experiences, from bustling Bangkok to serene Chiang Mai.",
        categories: ["Temples", "Beaches", "Food", "Markets", "Nature"],
        regions: ["Bangkok", "Chiang Mai", "Phuket", "Koh Samui", "Krabi", "Pai"],
        bestMonths: [11, 12, 1, 2, 3],
        phrases: [
          { original: "สวัสดี (Sawadee)", translation: "Hello", language: "Thai" },
          { original: "ขอบคุณ (Khob khun)", translation: "Thank you", language: "Thai" },
          { original: "อร่อย! (Aroi!)", translation: "Delicious!", language: "Thai" },
        ],
        articles: [
          { id: "th1", title: "Bangkok Street Food: A guide to the world's best street eats", excerpt: "Pad thai, som tum, and mango sticky rice on every corner.", image: "/asia-temple.jpg", category: "Food", date: "2025-11-18", author: "Sophie", content: [
            "Bangkok's street food scene is legendary — and for good reason. Nowhere else on Earth can you eat this well for this little, from Michelin-starred street stalls to hidden alley kitchens.",
            "Start at Yaowarat Road in Chinatown, where the street comes alive at night with grilled seafood, shark fin soup alternatives, and mango sticky rice. Jay Fai, a street stall with a Michelin star, serves legendary crab omelets.",
            "For the best pad thai, head to Thip Samai on Maha Chai Road. They've been making pad thai since the 1960s, wrapping it in a thin egg crepe. Get there early — the line can be long.",
            "Bang Rak and Silom areas have excellent lunchtime food markets catering to office workers. Try khao man gai (chicken rice), boat noodles, and som tum (papaya salad) at any stall with a queue of locals.",
            "Our top tip: eat where Thais eat. If a stall has a queue of local people, join it. If it's empty, skip it. Thais know their food, and the best stalls rarely have English menus."
          ] },
          { id: "th2", title: "Chiang Mai: Temples, markets, and mountain adventures", excerpt: "Northern Thailand's cultural capital and adventure base.", image: "/asia-temple.jpg", category: "Temples", date: "2025-10-25", author: "Marco", content: [
            "Chiang Mai is the cultural heart of northern Thailand — a city of over 300 temples, vibrant night markets, and easy access to mountains, jungles, and hill tribe villages.",
            "Start with the Old City's most impressive temples: Wat Chedi Luang (a ruined 14th-century pagoda), Wat Phra Singh (Chiang Mai's most revered temple), and Wat Chiang Man (the city's oldest).",
            "Climb (or drive) to Doi Suthep, the golden temple on the mountain above Chiang Mai. The 309-step naga staircase leads to a glittering temple with panoramic city views.",
            "The Sunday Walking Street market along Ratchadamnoen Road is one of Thailand's best — handmade crafts, hill tribe textiles, street food, and live music stretch for over a kilometer.",
            "For ethical elephant experiences, visit Elephant Nature Park. This rescue center lets you observe elephants in semi-wild conditions — no riding, no shows, just these magnificent creatures being elephants."
          ] },
          { id: "th3", title: "Thailand Islands: Choosing the perfect beach destination", excerpt: "From party islands to untouched paradise.", image: "/asia-temple.jpg", category: "Beaches", date: "2025-09-30", author: "Sophie", content: [
            "Thailand has hundreds of islands, each with its own personality. Here's how to choose the right one for your trip.",
            "Koh Phi Phi is stunning but crowded — the famous Maya Bay (The Beach) has reopened with limited daily visitors. Great for snorkeling and nightlife, but not for solitude.",
            "Koh Lanta is our top pick for families and couples. Long, uncrowded beaches, excellent seafood restaurants, and a laid-back vibe. The Old Town on the east coast has charming stilt houses.",
            "Koh Tao is Thailand's diving capital. The island is small enough to explore on a scooter, and dive courses here are among the cheapest in the world.",
            "For the real off-the-beaten-path experience, head to Koh Lipe in the far south. Crystal-clear Andaman Sea water, coral reefs right off the beach, and a Robinson Crusoe atmosphere."
          ] },
        ],
      },
      {
        name: "Vietnam",
        slug: "vietnam",
        heroImage: "/asia-temple.jpg",
        about: "Vietnam captivates with its history, cuisine, and stunning landscapes from north to south. From the limestone pillars of Ha Long Bay to the Mekong Delta's floating markets, Vietnam is an unforgettable adventure.",
        categories: ["Food", "History", "Nature", "Markets", "Culture"],
        regions: ["Hanoi", "Ho Chi Minh City", "Ha Long Bay", "Hoi An", "Da Nang", "Sapa"],
        bestMonths: [2, 3, 4, 10, 11],
        phrases: [
          { original: "Xin chào", translation: "Hello", language: "Vietnamese" },
          { original: "Cảm ơn", translation: "Thank you", language: "Vietnamese" },
          { original: "Ngon quá!", translation: "So delicious!", language: "Vietnamese" },
        ],
        articles: [
          { id: "vn1", title: "Vietnam by Motorbike: The ultimate north-to-south route", excerpt: "Two wheels, 2,000 kilometers, and endless adventure.", image: "/asia-temple.jpg", category: "Adventure", date: "2025-11-14", author: "Marco", content: [
            "Riding a motorbike from Hanoi to Ho Chi Minh City is one of Southeast Asia's greatest adventures. The 2,000-kilometer journey takes about 2-3 weeks at a comfortable pace.",
            "Start in Hanoi, where you can buy a reliable Honda Win for around $300 (and sell it in Saigon). The old quarter's 36 streets, each named after the goods historically sold there, are best explored on foot.",
            "The Ha Giang Loop in the far north is Vietnam's most spectacular road — carving through limestone karsts and rice terraces along the Chinese border. Allow 3-4 days for this epic detour.",
            "Ride the Hai Van Pass between Hue and Hoi An — the stretch famously featured on Top Gear as 'one of the great coast roads of the world.' The views from the summit are breathtaking.",
            "In Hoi An, park the bike and explore on foot. This UNESCO-listed ancient town is a living museum of Vietnamese, Chinese, Japanese, and French influences, with the best lantern-lit atmosphere in Asia."
          ] },
          { id: "vn2", title: "Ha Long Bay: Cruises, kayaking, and floating villages", excerpt: "Thousands of limestone pillars rising from emerald waters.", image: "/asia-temple.jpg", category: "Nature", date: "2025-10-22", author: "Sophie", content: [
            "Ha Long Bay is one of the world's natural wonders — nearly 2,000 limestone karsts and islands rising from emerald waters, many topped with jungle and riddled with caves.",
            "Book a 2-night junk boat cruise to fully appreciate the bay. Day trips from Hanoi are rushed and barely scratch the surface. The best boats visit Bai Tu Long Bay, which is less crowded.",
            "Kayaking through the karsts is the highlight. Paddle into hidden lagoons, through sea caves, and past floating fishing villages where families have lived for generations.",
            "Cat Ba Island is the bay's largest island and a great base for exploration. Rent a motorbike and ride to the viewpoints, or hike through Cat Ba National Park to spot the rare Cat Ba langur.",
            "For fewer crowds, consider Lan Ha Bay (adjacent to Ha Long Bay) — equally stunning scenery but with a fraction of the boat traffic. Many cruises now include both bays."
          ] },
          { id: "vn3", title: "Hoi An: Lanterns, tailors, and the best food in Vietnam", excerpt: "A magical ancient town on Vietnam's central coast.", image: "/asia-temple.jpg", category: "Food", date: "2025-09-08", author: "Marco", content: [
            "Hoi An is Vietnam's most enchanting town — a UNESCO World Heritage site where centuries-old merchant houses, Chinese temples, and Japanese bridges line the Thu Bon River.",
            "The Old Town is car-free and best explored on foot or by bicycle. Every evening, hundreds of colorful lanterns illuminate the streets, creating one of Asia's most romantic settings.",
            "Hoi An is famous for its tailors. Get a custom suit, dress, or coat made in 24-48 hours for a fraction of Western prices. Yaly Couture and BeBe are among the most reputable shops.",
            "The food in Hoi An is exceptional — try cao lau (thick noodles with pork), white rose dumplings, and banh mi (the best in Vietnam, according to Anthony Bourdain). Morning Glory restaurant serves excellent local dishes.",
            "Rent a bicycle and ride to An Bang Beach (3 km from town) for a quieter beach experience. The seafood shacks here serve the freshest catch grilled over coconut husks."
          ] },
        ],
      },
    ],
  },
  {
    name: "Africa",
    slug: "africa",
    heroImage: "/africa-lion.jpg",
    introduction: "Africa stands for adventure, culture, and abundant nature. From the vast savannas with the Big Five to the sandy beaches of the Seychelles, from the pyramids of Egypt to vibrant markets in Morocco. Africa offers unparalleled diversity and authentic experiences that will stay with you forever.",
    countries: [
      {
        name: "Botswana",
        slug: "botswana",
        heroImage: "/africa-lion.jpg",
        about: "Botswana is a premier safari destination with pristine wilderness, low-density tourism, and some of the best wildlife viewing in all of Africa.",
        categories: ["Safari", "Wildlife", "Nature", "Delta", "Adventure"],
        regions: ["Okavango Delta", "Chobe", "Makgadikgadi", "Maun", "Kasane", "Kalahari"],
        bestMonths: [5, 6, 7, 8, 9, 10],
        phrases: [
          { original: "Dumela", translation: "Hello", language: "Setswana" },
          { original: "Ke a leboga", translation: "Thank you", language: "Setswana" },
          { original: "Le kae?", translation: "How are you?", language: "Setswana" },
        ],
        articles: [
          { id: "bw1", title: "Namibia & Botswana Road Trip: The best route through Southern Africa", excerpt: "Drive through some of Africa's most spectacular landscapes.", image: "/africa-lion.jpg", category: "Adventure", date: "2025-09-01", author: "Marco", content: [
            "A road trip through Namibia and Botswana is one of Africa's great adventures — vast desert landscapes, incredible wildlife, and some of the most photogenic scenery on the continent.",
            "Start in Windhoek, Namibia's capital, and drive to Sossusvlei. The towering red sand dunes of the Namib Desert, especially Dune 45 at sunrise, are among Africa's most iconic images.",
            "Continue to Etosha National Park, one of Africa's best-managed game reserves. The park's white clay pan attracts elephants, lions, rhinos, and hundreds of other species to its waterholes.",
            "Cross into Botswana and head for Chobe National Park. The Chobe River boat safari is legendary — massive herds of elephants come to drink at sunset, with hippos and crocodiles nearby.",
            "End with a mokoro (dugout canoe) trip in the Okavango Delta. Glide through crystal-clear channels surrounded by papyrus reeds, with elephants and buffalo visible from the water."
          ] },
          { id: "bw2", title: "Okavango Delta: A guide to the world's most unique safari destination", excerpt: "Safari by canoe through Africa's inland delta.", image: "/africa-lion.jpg", category: "Wildlife", date: "2025-08-10", author: "Sophie", content: [
            "The Okavango Delta is the world's largest inland delta — a jewel of channels, lagoons, and islands in the middle of the Kalahari Desert. It's one of Africa's most exclusive safari destinations.",
            "A mokoro (traditional dugout canoe) safari is the quintessential Okavango experience. Your poler guides you silently through lily-pad-covered channels while elephants, hippos, and antelope graze on nearby islands.",
            "Moremi Game Reserve, on the delta's eastern edge, offers some of the best wildlife viewing in Africa. Leopards, wild dogs, and lions are regularly spotted, along with hundreds of bird species.",
            "The best time to visit is during the dry season (May-October) when animals concentrate around permanent water sources. The delta's annual flood arrives between June and August, creating a unique landscape.",
            "Accommodation ranges from luxury lodges with private plunge pools to simple bush camps. Chief's Island and the Moremi area offer the best combination of wildlife and delta scenery."
          ] },
        ],
      },
      {
        name: "Kenya",
        slug: "kenya",
        heroImage: "/africa-lion.jpg",
        about: "Kenya offers world-class safaris, vibrant culture, and stunning coastline. Home to the Great Migration and the Masai Mara, Kenya is the original safari destination.",
        categories: ["Safari", "Wildlife", "Beaches", "Culture", "Mountains"],
        bestMonths: [6, 7, 8, 9, 1, 2],
        phrases: [
          { original: "Jambo", translation: "Hello", language: "Swahili" },
          { original: "Asante sana", translation: "Thank you very much", language: "Swahili" },
          { original: "Hakuna matata", translation: "No worries", language: "Swahili" },
        ],
        articles: [
          { id: "ke1", title: "Masai Mara Safari: When to go and what to expect", excerpt: "Witness the Great Migration and Africa's Big Five.", image: "/africa-lion.jpg", category: "Safari", date: "2025-11-03", author: "Marco", content: [
            "The Masai Mara is Kenya's crown jewel and arguably the best safari destination in the world. The vast savanna, dramatic river crossings, and abundance of predators make every game drive unforgettable.",
            "The Great Migration arrives between July and October, when over two million wildebeest and zebra cross the Mara River from Tanzania's Serengeti. The crossings are nature's most dramatic spectacle.",
            "Even outside migration season, the Mara is incredible. The reserve has one of the highest densities of lions in Africa, along with leopards, cheetahs, elephants, and buffalo.",
            "Stay in a tented camp for the full safari experience. Many camps are unfenced, so you'll hear lions roaring and hyenas laughing at night. Governors' Camp and Angama Mara are top picks.",
            "A hot air balloon safari over the Mara at dawn is worth the splurge. Floating silently over herds of wildebeest, with the Mara River snaking through the landscape below, is a once-in-a-lifetime experience."
          ] },
          { id: "ke2", title: "Climbing Mount Kenya: Routes, preparation, and tips", excerpt: "Africa's second-highest peak offers incredible trekking.", image: "/africa-lion.jpg", category: "Mountains", date: "2025-10-18", author: "Sophie", content: [
            "Mount Kenya is Africa's second-highest peak at 5,199 meters, and its trekking routes are far less crowded than Kilimanjaro. The mountain offers diverse scenery and a real mountaineering challenge.",
            "The Sirimon-Chogoria traverse is the most scenic route — ascending through bamboo forest and moorland via Sirimon, and descending the dramatic Chogoria route past Lake Michaelson.",
            "Point Lenana (4,985m) is the highest trekking peak and requires no technical climbing. Most trekkers reach the summit in 4-5 days. Acclimatization days are essential.",
            "The mountain's Afro-alpine zone is otherworldly — giant groundsels and lobelias tower over the landscape like something from a sci-fi movie. This unique ecosystem exists nowhere else on Earth.",
            "Hire a guide through the Kenya Wildlife Service or a reputable trekking company. Porter support is available and highly recommended at altitude."
          ] },
        ],
      },
      {
        name: "Morocco",
        slug: "morocco",
        heroImage: "/morocco.jpg",
        about: "Morocco enchants with its medinas, desert adventures, and rich cultural tapestry. The sensory overload of Marrakech's souks, the silence of the Sahara, and the blue streets of Chefchaouen make Morocco a photographer's dream.",
        categories: ["Markets", "Desert", "Food", "History", "Mountains"],
        bestMonths: [3, 4, 5, 10, 11],
        phrases: [
          { original: "السلام عليكم (As-salaam alaykum)", translation: "Peace be upon you (Hello)", language: "Arabic" },
          { original: "شكراً (Shukran)", translation: "Thank you", language: "Arabic" },
          { original: "بسلامة (Bslama)", translation: "Goodbye", language: "Arabic" },
        ],
        articles: [
          { id: "ma1", title: "Marrakech: Navigating the medina and finding the best riads", excerpt: "Get lost (on purpose) in Morocco's most vibrant city.", image: "/morocco.jpg", category: "Culture", date: "2025-11-20", author: "Sophie", content: [
            "Marrakech assaults your senses in the best possible way — the call to prayer echoing over rooftops, the smell of spices and orange blossoms, the kaleidoscope of colors in the souks.",
            "Jemaa el-Fna square is the beating heart of the medina. By day it's a market; by night it transforms into the world's biggest open-air restaurant with food stalls, musicians, and storytellers.",
            "The souks (markets) radiate from the square in a maze of narrow alleys. Each area specializes in different crafts — leather, metalwork, carpets, spices. Getting lost is part of the experience.",
            "Stay in a riad — a traditional courtyard house converted into a guesthouse. Many are beautifully restored with tiled fountains, rooftop terraces, and plunge pools hidden behind unmarked doors.",
            "For a break from the chaos, visit Le Jardin Secret or the Majorelle Garden (Yves Saint Laurent's cobalt-blue retreat). The Bahia Palace is a masterpiece of Islamic architecture."
          ] },
          { id: "ma2", title: "Sahara Desert: Camel treks and sleeping under the stars", excerpt: "An unforgettable night in the world's largest desert.", image: "/morocco.jpg", category: "Desert", date: "2025-10-05", author: "Marco", content: [
            "A night in the Sahara Desert is one of Morocco's most magical experiences. The silence, the star-filled sky, and the endless dunes create a sense of awe that's hard to find elsewhere.",
            "Most trips depart from Merzouga, where the Erg Chebbi dunes rise up to 150 meters. A camel trek to a desert camp takes about 90 minutes — arrive in time for sunset.",
            "Desert camps range from basic bivouacs to luxury 'glamping' with hot showers and gourmet dinners. Both offer the same incredible night sky — in the Sahara, the Milky Way is so bright it casts shadows.",
            "Wake before dawn and climb the nearest dune for sunrise. The play of light and shadow on the sand creates an ever-changing landscape of gold, orange, and deep red.",
            "Extend your desert experience with a 4x4 tour through the Draa Valley, visiting kasbahs (fortified villages), palm groves, and the dramatic Todra Gorge."
          ] },
          { id: "ma3", title: "Chefchaouen: Morocco's blue pearl in the Rif Mountains", excerpt: "The most photogenic town in all of Morocco.", image: "/morocco.jpg", category: "History", date: "2025-09-12", author: "Sophie", content: [
            "Chefchaouen is Morocco's most visually striking town — a cascade of blue-washed buildings tumbling down a mountainside in the Rif Mountains. Every alley is a photo opportunity.",
            "The tradition of painting buildings blue has various explanations — some say it was brought by Jewish refugees in the 1930s, others say it repels mosquitoes or represents water and sky.",
            "Wander the medina without a map. Chefchaouen is small enough that you can't get truly lost, and every turn reveals another shade of blue, a cat sunning itself, or a grandmother weaving on a doorstep.",
            "Hike to the Spanish Mosque on the hill above town for the best view — the entire blue city spread below, with the Rif Mountains behind. Sunset is the ideal time.",
            "Chefchaouen is also known for its goat cheese and woven blankets. Visit the local cooperatives where Berber women produce traditional textiles using techniques passed down through generations."
          ] },
        ],
      },
      {
        name: "South Africa",
        slug: "south-africa",
        heroImage: "/africa-lion.jpg",
        about: "South Africa dazzles with diverse landscapes, wildlife, and vibrant cities. From Cape Town's Table Mountain to Kruger's Big Five, from the Garden Route to the winelands, it's a world in one country.",
        categories: ["Safari", "Wine", "Beaches", "Mountains", "Culture"],
        bestMonths: [3, 4, 5, 9, 10, 11],
        phrases: [
          { original: "Sawubona", translation: "Hello (I see you)", language: "Zulu" },
          { original: "Ngiyabonga", translation: "Thank you", language: "Zulu" },
          { original: "Hamba kahle", translation: "Go well (Goodbye)", language: "Zulu" },
        ],
        articles: [
          { id: "za1", title: "Whale Watching in South Africa: Best spots and seasons", excerpt: "Witness these magnificent creatures along the coast.", image: "/africa-lion.jpg", category: "Wildlife", date: "2025-08-15", author: "Marco", content: [
            "South Africa is one of the world's best whale-watching destinations. Southern right whales visit between June and November, with peak season in September and October.",
            "Hermanus, just 90 minutes from Cape Town, is the whale-watching capital of the world. Whales come so close to shore that the town has an official 'whale crier' who alerts people when they're spotted.",
            "The cliffs at De Kelders offer the most intimate whale viewing — mothers and calves swim just meters from the shore, breaching, spy-hopping, and slapping their tails on the water.",
            "For a boat-based experience, Gansbaai offers both whale watching and great white shark cage diving. Seeing both the ocean's largest and most feared creatures in one day is unforgettable.",
            "Further along the coast, Plettenberg Bay offers Bryde's whales, humpbacks, and dolphins. A boat trip here often includes sightings of Cape fur seals and African penguins on nearby islands."
          ] },
          { id: "za2", title: "Cape Town: Table Mountain, penguins, and the Cape Winelands", excerpt: "One of the world's most beautiful cities.", image: "/africa-lion.jpg", category: "Culture", date: "2025-07-20", author: "Sophie", content: [
            "Cape Town consistently ranks among the world's most beautiful cities, and it's easy to see why. Table Mountain's flat top dominates the skyline, beaches stretch in every direction, and world-class wine estates are 30 minutes away.",
            "Take the cable car to the top of Table Mountain for 360-degree views of the city, ocean, and Cape Peninsula. Alternatively, hike up via Platteklip Gorge (about 2 hours).",
            "Visit Boulders Beach in Simon's Town to see the famous African penguin colony. These charming birds waddle along the beach and swim in the sheltered cove.",
            "The Cape Winelands — Stellenbosch, Franschhoek, and Paarl — produce world-class wines. Many estates offer tastings paired with local cuisine in stunning mountain settings.",
            "Drive the Chapman's Peak road along the Atlantic coast. The winding road carved into the cliff face offers spectacular views of the ocean and the Sentinel mountain."
          ] },
          { id: "za3", title: "Kruger National Park: Self-drive safari guide", excerpt: "See the Big Five on your own terms.", image: "/africa-lion.jpg", category: "Safari", date: "2025-06-15", author: "Marco", content: [
            "Kruger National Park is South Africa's flagship reserve and one of Africa's greatest parks. At nearly 20,000 square kilometers, it's roughly the size of Wales.",
            "A self-drive safari is Kruger's unique appeal. Rent a regular car (no 4x4 needed for tarred roads), stay in rest camps, and drive at your own pace. It's a fraction of the cost of a guided safari.",
            "Wake before dawn and be at the gate when it opens. The first two hours of the morning are the best for wildlife — predators are still active from night hunts, and animals gather at waterholes.",
            "The southern section (Lower Sabie, Skukuza) has the highest concentration of wildlife. The Sunset Dam near Lower Sabie is legendary for hippo, crocodile, and elephant sightings.",
            "Book rest camp accommodation through SANParks well in advance. Satara and Lower Sabie camps are the most popular. Each camp has basic but comfortable chalets, swimming pools, and shops."
          ] },
        ],
      },
    ],
  },
  {
    name: "Central America",
    slug: "central-america",
    heroImage: "/hero-camping.jpg",
    introduction: "Central America connects North and South America with a vibrant mix of cultures, ancient ruins, pristine beaches, and lush rainforests.",
    countries: [
      {
        name: "Costa Rica",
        slug: "costa-rica",
        heroImage: "/hero-camping.jpg",
        about: "Costa Rica is a paradise for nature lovers with its rainforests, volcanoes, and incredible biodiversity. 'Pura Vida' isn't just a saying — it's a way of life.",
        categories: ["Nature", "Wildlife", "Beaches", "Adventure", "Surfing"],
        bestMonths: [12, 1, 2, 3, 4],
        phrases: [
          { original: "¡Pura Vida!", translation: "Pure Life! (Hello/Great/Goodbye)", language: "Spanish" },
          { original: "¡Mae!", translation: "Dude/Buddy", language: "Costa Rican Spanish" },
          { original: "Tuanis", translation: "Cool/Awesome", language: "Costa Rican Spanish" },
        ],
        articles: [
          { id: "cr1", title: "Costa Rica in 2 Weeks: Volcanoes, rainforests, and beaches", excerpt: "The perfect route through Central America's greenest country.", image: "/hero-camping.jpg", category: "Nature", date: "2025-11-10", author: "Sophie", content: [
            "Costa Rica packs an incredible amount of natural beauty into a small country. In two weeks, you can see volcanoes, rainforests, cloud forests, and two different coastlines.",
            "Start in San José and head to Arenal Volcano. The iconic conical volcano towers over a lake, and the surrounding area offers hot springs, zip-lining, and hanging bridge walks through the canopy.",
            "Continue to Monteverde Cloud Forest, one of the world's most biodiverse ecosystems. The misty trails are home to quetzals, howler monkeys, and thousands of plant and insect species.",
            "Head to the Pacific coast — Manuel Antonio National Park combines pristine beaches with excellent wildlife viewing. Sloths, monkeys, and toucans are regularly spotted just meters from the beach.",
            "End on the Nicoya Peninsula, where laid-back beach towns like Santa Teresa and Nosara offer world-class surfing, yoga retreats, and spectacular sunsets."
          ] },
          { id: "cr2", title: "Wildlife in Costa Rica: Where to spot sloths, toucans, and more", excerpt: "The best national parks and reserves for animal encounters.", image: "/hero-camping.jpg", category: "Wildlife", date: "2025-10-05", author: "Marco", content: [
            "Costa Rica contains 5% of the world's biodiversity in just 0.03% of its surface area. From sloths to scarlet macaws, the wildlife viewing here is extraordinary.",
            "Tortuguero National Park on the Caribbean coast is accessible only by boat or plane. Green sea turtles nest on its beaches from July to October, and the canals teem with caimans, toucans, and monkeys.",
            "For sloths, head to the Sloth Sanctuary near Cahuita or simply look up in any coastal town — two-toed and three-toed sloths are everywhere if you know where (and how slowly) to look.",
            "Corcovado National Park on the Osa Peninsula is Costa Rica's wildest corner. National Geographic called it 'the most biologically intense place on Earth.' Tapirs, jaguars, and all four Costa Rican monkey species live here.",
            "Hire a local guide — they have incredible eyes for spotting camouflaged animals and know where specific species tend to hang out. A good guide will triple the number of animals you see."
          ] },
        ],
      },
      {
        name: "Mexico",
        slug: "mexico",
        heroImage: "/hero-desert.jpg",
        about: "Mexico offers rich history, incredible food, and diverse landscapes. From ancient Mayan ruins to vibrant cities, tequila country to Caribbean beaches, Mexico is endlessly rewarding.",
        categories: ["Food", "History", "Beaches", "Culture", "Ruins"],
        bestMonths: [11, 12, 1, 2, 3, 4],
        phrases: [
          { original: "¿Qué onda?", translation: "What's up? (Mexican greeting)", language: "Mexican Spanish" },
          { original: "¡Órale!", translation: "Wow! / Let's go!", language: "Mexican Spanish" },
          { original: "¡Salud!", translation: "Cheers! / Bless you!", language: "Mexican Spanish" },
        ],
        articles: [
          { id: "mx1", title: "Mexico City: The world's most underrated capital", excerpt: "Art, food, history, and incredible energy.", image: "/hero-desert.jpg", category: "Culture", date: "2025-11-08", author: "Marco", content: [
            "Mexico City is one of the world's great cities — a sprawling metropolis of 22 million people with world-class museums, incredible food, and a creative energy that rivals anywhere on Earth.",
            "The historic center (Zócalo) is built on the ruins of the Aztec capital Tenochtitlán. The Templo Mayor excavation sits right next to the colonial cathedral, showing layers of Mexican history.",
            "Chapultepec Park is one of the world's largest urban parks, home to the National Museum of Anthropology — the finest collection of pre-Columbian artifacts anywhere.",
            "Roma and Condesa are the hipster neighborhoods — tree-lined streets with Art Deco buildings, independent bookshops, craft cocktail bars, and some of Mexico's most innovative restaurants.",
            "For food, try tacos al pastor (spit-roasted pork with pineapple), tlacoyos (stuffed corn cakes), and esquites (corn in a cup with lime, cheese, and chili). Street food here is world-class."
          ] },
          { id: "mx2", title: "Yucatán Peninsula: Ruins, cenotes, and Caribbean beaches", excerpt: "Ancient Maya meets tropical paradise.", image: "/hero-desert.jpg", category: "Ruins", date: "2025-10-15", author: "Sophie", content: [
            "The Yucatán Peninsula is where ancient Maya civilization meets the Caribbean Sea. Jungle-covered ruins, crystal-clear cenotes, and turquoise beaches make this one of Mexico's most popular regions.",
            "Chichén Itzá is Mexico's most visited ruin, and for good reason. El Castillo pyramid is a marvel of astronomical alignment — at the equinox, shadows create a serpent slithering down the staircase.",
            "Cenotes are natural sinkholes filled with crystal-clear water, unique to the Yucatán. Cenote Ik Kil near Chichén Itzá is stunning, but for fewer crowds try Cenote Suytun or the cenotes around Homún.",
            "Tulum's clifftop ruins overlooking the Caribbean are the most photogenic in Mexico. Visit early morning before the crowds, then swim at the beach below.",
            "Base yourself in Valladolid, a charming colonial town perfectly positioned between Chichén Itzá, Tulum, and numerous cenotes. It's cheaper, quieter, and more authentic than the resort towns."
          ] },
        ],
      },
    ],
  },
  {
    name: "South America",
    slug: "south-america",
    heroImage: "/hero-desert.jpg",
    introduction: "South America is a continent of superlatives — the Amazon, the Andes, Patagonia. From the ancient ruins of Peru to the tango halls of Buenos Aires, adventure awaits around every corner.",
    countries: [
      {
        name: "Peru",
        slug: "peru",
        heroImage: "/hero-desert.jpg",
        about: "Peru captivates with Machu Picchu, the Amazon, and incredible cuisine. From the Andes mountains to the coastal deserts, Peru offers extraordinary diversity and ancient wonders.",
        categories: ["Ruins", "Food", "Mountains", "Nature", "Culture"],
        bestMonths: [4, 5, 6, 7, 8, 9],
        phrases: [
          { original: "¿Cómo estás?", translation: "How are you?", language: "Spanish" },
          { original: "Chévere", translation: "Cool/Great", language: "Peruvian Spanish" },
          { original: "¡Provecho!", translation: "Enjoy your meal!", language: "Spanish" },
        ],
        articles: [
          { id: "pe1", title: "Machu Picchu: Everything you need to know before you go", excerpt: "The ultimate guide to Peru's most iconic wonder.", image: "/hero-desert.jpg", category: "Ruins", date: "2025-11-05", author: "Sophie", content: [
            "Machu Picchu is one of the world's most iconic archaeological sites, and visiting it requires careful planning. Here's everything you need to know.",
            "Book your tickets months in advance — daily visitor numbers are limited. The classic Inca Trail (4 days) fills up even further ahead. Alternative treks include the Salkantay and Lares routes.",
            "Arrive in Cusco at least 2 days before your trek to acclimatize to the altitude (3,400 meters). Coca tea helps with altitude sickness, and Cusco's restaurants and bars make acclimatization enjoyable.",
            "At Machu Picchu, enter through the Sun Gate for the classic panoramic view. The agricultural terraces, the Intihuatana stone, and the Temple of the Sun are highlights.",
            "For the best photos, visit early morning when mist often clings to the surrounding peaks, creating an ethereal atmosphere. The site is divided into circuits, so plan your route in advance."
          ] },
          { id: "pe2", title: "Lima: South America's food capital", excerpt: "Ceviche, pisco sours, and culinary innovation.", image: "/hero-desert.jpg", category: "Food", date: "2025-10-20", author: "Marco", content: [
            "Lima has quietly become the gastronomic capital of South America. With 3 of the world's top 50 restaurants and incredible street food, it's a must for food lovers.",
            "Ceviche is Lima's signature dish — fresh raw fish 'cooked' in lime juice with chili, onion, and sweet potato. La Mar and Chez Wong are legendary, but any neighborhood cevichería serves excellent versions.",
            "Central, by Virgilio Martínez, takes diners on a journey through Peru's ecosystems, from the sea to the Andes to the Amazon. Book weeks in advance — it's regularly ranked among the world's best restaurants.",
            "Barranco is Lima's bohemian neighborhood — street art, colonial mansions, and excellent bars. Try a pisco sour (Peru's national cocktail) at any of the trendy bars along Avenida Grau.",
            "Don't miss the Mercado de Surquillo, a local market where you can try exotic Peruvian fruits (lucuma, chirimoya, granadilla) and fresh juices at a fraction of restaurant prices."
          ] },
        ],
      },
      {
        name: "Colombia",
        slug: "colombia",
        heroImage: "/hero-camping.jpg",
        about: "Colombia surprises with vibrant cities, Caribbean coast, and coffee country. This once-avoided country has emerged as one of South America's most exciting destinations.",
        categories: ["Cities", "Beaches", "Coffee", "Nature", "Culture"],
        bestMonths: [12, 1, 2, 3, 7, 8],
        phrases: [
          { original: "¿Qué más?", translation: "What's up?", language: "Colombian Spanish" },
          { original: "¡Bacano!", translation: "Awesome!", language: "Colombian Spanish" },
          { original: "¡De una!", translation: "Let's do it!", language: "Colombian Spanish" },
        ],
        articles: [
          { id: "co1", title: "Cartagena: Colonial charm on Colombia's Caribbean coast", excerpt: "Colorful streets, Caribbean vibes, and incredible food.", image: "/hero-camping.jpg", category: "Cities", date: "2025-11-12", author: "Sophie", content: [
            "Cartagena's walled Old Town is a UNESCO World Heritage site of colorful colonial buildings, bougainvillea-draped balconies, and cobblestone streets that look like a movie set.",
            "Walk the city walls at sunset for panoramic views of the old town and the Caribbean. The walls, built to protect against pirate attacks, are Cartagena's most romantic spot.",
            "Getsemaní, just outside the walls, is the real heart of Cartagena. This formerly rough neighborhood has been transformed into a vibrant area of street art, live music, and excellent restaurants.",
            "Take a day trip to the Rosario Islands — a chain of 27 small islands with crystal-clear water, snorkeling, and beach clubs. Isla Barú's Playa Blanca is the most beautiful beach near Cartagena.",
            "For food, try the ceviche stands in the old town, a traditional arepa de huevo (egg-stuffed corn cake) from a street vendor, and fresh fruit juices from the Palenqueras — colorfully dressed women who carry fruit bowls on their heads."
          ] },
          { id: "co2", title: "Colombia's Coffee Triangle: Fincas, hikes, and the perfect brew", excerpt: "Visit the heart of Colombian coffee country.", image: "/hero-camping.jpg", category: "Coffee", date: "2025-10-08", author: "Marco", content: [
            "The Eje Cafetero (Coffee Triangle) is where Colombia's world-famous coffee is grown. The lush green hills, colorful towns, and the smell of freshly roasted beans make this a magical destination.",
            "Stay at a coffee finca (farm) and learn the bean-to-cup process. Many fincas offer tours where you pick coffee cherries, see the processing, and roast your own beans.",
            "Salento is the most charming town in the region — colorful colonial houses, excellent coffee shops, and the gateway to the stunning Cocora Valley.",
            "The Cocora Valley hike takes you through misty cloud forest past the world's tallest palm trees — wax palms reaching up to 60 meters. The 4-5 hour loop hike is moderately challenging and incredibly scenic.",
            "For the best coffee, visit small, single-origin roasters rather than large commercial farms. Jesús Martín in Salento serves some of the finest cups you'll find anywhere in Colombia."
          ] },
        ],
      },
    ],
  },
  {
    name: "Oceania",
    slug: "oceania",
    heroImage: "/hero-camping.jpg",
    introduction: "Oceania offers some of the world's most spectacular natural wonders, from the Great Barrier Reef to New Zealand's fjords, and some of the planet's most unique wildlife.",
    countries: [
      {
        name: "Australia",
        slug: "australia",
        heroImage: "/hero-camping.jpg",
        about: "Australia captivates with its unique wildlife, vast outback, and stunning beaches. From the Great Barrier Reef to Uluru, Sydney Harbour to the Daintree Rainforest, Australia is adventure on an epic scale.",
        categories: ["Wildlife", "Beaches", "Nature", "Cities", "Outback"],
        bestMonths: [9, 10, 11, 3, 4, 5],
        phrases: [
          { original: "G'day mate!", translation: "Hello friend!", language: "Australian English" },
          { original: "No worries", translation: "You're welcome / It's fine", language: "Australian English" },
          { original: "Arvo", translation: "Afternoon", language: "Australian English" },
        ],
        articles: [
          { id: "au1", title: "East Coast Australia: The ultimate road trip from Sydney to Cairns", excerpt: "2,500 km of beaches, reefs, and tropical paradise.", image: "/hero-camping.jpg", category: "Nature", date: "2025-11-15", author: "Marco", content: [
            "The East Coast road trip from Sydney to Cairns is Australia's classic backpacker journey — 2,500 kilometers of incredible beaches, the Great Barrier Reef, and tropical rainforest.",
            "Start in Sydney with the Harbour Bridge, Opera House, and Bondi Beach. Then head north to the Hunter Valley wine region for a day of tastings.",
            "Byron Bay is the spiritual heart of the East Coast — surfing, yoga, live music, and the most easterly point of mainland Australia. Watch the sunrise from the Cape Byron Lighthouse.",
            "The Whitsunday Islands are a must — sail to Whitehaven Beach, regularly voted the world's best beach, with 7 kilometers of pure white silica sand and turquoise water.",
            "End in Cairns, the gateway to the Great Barrier Reef and the Daintree Rainforest — the world's oldest tropical rainforest, where the jungle meets the reef."
          ] },
          { id: "au2", title: "Great Barrier Reef: Snorkeling, diving, and conservation", excerpt: "The world's largest coral reef system.", image: "/hero-camping.jpg", category: "Nature", date: "2025-10-10", author: "Sophie", content: [
            "The Great Barrier Reef is the world's largest coral reef system — visible from space and home to an astonishing diversity of marine life. Visiting it is a bucket-list experience.",
            "For the best snorkeling, head to the outer reef from Cairns or Port Douglas. The inner reef near shore has been affected by bleaching, but the outer reef remains spectacular.",
            "A liveaboard dive trip of 2-3 nights takes you to the best sites, including Cod Hole (swim with giant potato cod), Ribbon Reefs, and the SS Yongala wreck.",
            "Non-swimmers can still experience the reef — glass-bottom boats, semi-submersibles, and helicopter tours all offer incredible views without getting wet.",
            "The reef faces serious threats from climate change. Support operators who contribute to conservation efforts, and consider visiting sooner rather than later while this natural wonder is still intact."
          ] },
        ],
      },
      {
        name: "New Zealand",
        slug: "new-zealand",
        heroImage: "/hero-camping.jpg",
        about: "New Zealand mesmerizes with its dramatic landscapes and Maori culture. From the volcanoes of the North Island to the fjords of the South, and the hobbit holes in between.",
        categories: ["Nature", "Adventure", "Culture", "Film", "Wine"],
        bestMonths: [12, 1, 2, 3],
        phrases: [
          { original: "Kia ora", translation: "Hello / Thank you", language: "Māori" },
          { original: "Sweet as", translation: "Great / No problem", language: "NZ English" },
          { original: "Haere mai", translation: "Welcome", language: "Māori" },
        ],
        articles: [
          { id: "nz1", title: "New Zealand South Island: The ultimate 2-week road trip", excerpt: "Fjords, glaciers, mountains, and Middle Earth.", image: "/hero-camping.jpg", category: "Nature", date: "2025-11-20", author: "Sophie", content: [
            "New Zealand's South Island is one of the most scenically diverse places on Earth. In two weeks, you'll see glaciers, fjords, rainforests, mountains, and turquoise lakes.",
            "Start in Christchurch and drive to Kaikoura, where sperm whales, dolphins, and fur seals are regularly spotted. The mountains-meet-sea scenery is stunning.",
            "Continue to Queenstown, the adventure capital of the world. Bungee jumping, jet boating, skydiving, and hiking are all on offer, with the Remarkables mountain range as your backdrop.",
            "Milford Sound is New Zealand's most famous fjord — towering cliffs, cascading waterfalls, and dolphins playing in the dark water. An overnight cruise is the best way to experience it.",
            "Don't miss Lake Tekapo with its impossibly turquoise water, the Franz Josef Glacier hike, and the stargazing at Aoraki Mackenzie International Dark Sky Reserve."
          ] },
          { id: "nz2", title: "Hobbiton and Beyond: Lord of the Rings filming locations", excerpt: "Walk in the footsteps of hobbits and wizards.", image: "/hero-camping.jpg", category: "Film", date: "2025-10-15", author: "Marco", content: [
            "For Lord of the Rings fans, New Zealand IS Middle Earth. Many filming locations are accessible and as stunning in real life as they are on screen.",
            "Hobbiton in Matamata is the crown jewel — a fully preserved set with 44 hobbit holes, the Green Dragon Inn, and the Party Tree. Guided tours run daily and include a drink at the inn.",
            "Mount Ngauruhoe in Tongariro National Park doubled as Mount Doom. The Tongariro Alpine Crossing, a one-day hike across volcanic terrain, is one of New Zealand's Great Walks.",
            "Edoras (the capital of Rohan) was filmed on Mount Sunday in Canterbury. It's a short hike to the hilltop where Meduseld once stood, with sweeping views of the surrounding mountains.",
            "Paradise Valley near Queenstown served as multiple Middle Earth locations. The beech forests, braided rivers, and mountain backdrops look exactly like the Elven forests of Lothlórien."
          ] },
        ],
      },
    ],
  },
  {
    name: "North America",
    slug: "north-america",
    heroImage: "/hero-desert.jpg",
    introduction: "North America offers incredible diversity from coast to coast — spectacular national parks, vibrant cities, and road trip adventures across every kind of landscape.",
    countries: [
      {
        name: "United States",
        slug: "united-states",
        heroImage: "/hero-desert.jpg",
        about: "The USA offers incredible diversity from coast to coast. Epic national parks, vibrant cities, legendary road trips, and cultural experiences that span the globe.",
        categories: ["National Parks", "Cities", "Road Trips", "Food", "Culture"],
        bestMonths: [4, 5, 6, 9, 10],
        phrases: [
          { original: "How's it going?", translation: "How are you?", language: "American English" },
          { original: "Awesome!", translation: "Great!", language: "American English" },
          { original: "Check, please", translation: "Bill, please", language: "American English" },
        ],
        articles: [
          { id: "us1", title: "US National Parks: The 10 you absolutely must visit", excerpt: "From Yellowstone to Yosemite, America's best natural wonders.", image: "/hero-desert.jpg", category: "National Parks", date: "2025-11-18", author: "Marco", content: [
            "The US National Park system protects some of the most spectacular landscapes on Earth. With 63 parks to choose from, here are the 10 that should be at the top of your list.",
            "Yosemite in California is a cathedral of granite — El Capitan, Half Dome, and Yosemite Falls create a valley so beautiful that naturalist John Muir called it 'the grandest of all special temples of Nature.'",
            "Yellowstone, the world's first national park, has more geysers and hot springs than anywhere else on Earth. Old Faithful erupts every 90 minutes, and the Grand Prismatic Spring's rainbow colors are surreal.",
            "The Grand Canyon defies comprehension — a mile deep, 18 miles wide, and 277 miles long. Watch the sunrise from Mather Point on the South Rim as the canyon fills with golden light.",
            "Zion National Park in Utah offers incredible slot canyon hikes. The Narrows — wading through the Virgin River between 1,000-foot canyon walls — is one of America's most unique hiking experiences.",
            "Other must-visits: Glacier National Park (before the glaciers disappear), Acadia on the Maine coast, Grand Teton in Wyoming, Joshua Tree in California, and the Great Smoky Mountains."
          ] },
          { id: "us2", title: "New York City: A first-timer's guide to the Big Apple", excerpt: "The city that never sleeps — and neither will you.", image: "/hero-desert.jpg", category: "Cities", date: "2025-10-22", author: "Sophie", content: [
            "New York City is the world's greatest urban playground — a city of iconic landmarks, incredible food from every corner of the globe, and an energy that's absolutely electric.",
            "Walk across the Brooklyn Bridge at sunrise for the most iconic NYC view. Continue to DUMBO for coffee and the perfect Manhattan skyline photo.",
            "Central Park is 843 acres of green in the heart of Manhattan. Rent a bike, visit the Bethesda Fountain, and in summer, catch a free Shakespeare in the Park performance.",
            "Skip Times Square (too crowded, too commercial) and instead explore Greenwich Village's jazz clubs, the High Line's elevated park, and Chelsea Market's food stalls.",
            "For pizza, try Joe's on Carmine Street (classic New York slice) or Di Fara in Brooklyn (worth the trek). For bagels, Russ & Daughters on the Lower East Side has been going since 1914."
          ] },
        ],
      },
      {
        name: "Canada",
        slug: "canada",
        heroImage: "/iceland.jpg",
        about: "Canada enchants with vast wilderness, friendly cities, and natural wonders. From the Rocky Mountains to the maritime provinces, Canada offers outdoor adventures on an epic scale.",
        categories: ["Nature", "Wildlife", "Cities", "Mountains", "Lakes"],
        bestMonths: [6, 7, 8, 9],
        phrases: [
          { original: "Eh?", translation: "Right? / Don't you think?", language: "Canadian English" },
          { original: "Toque", translation: "Winter hat/beanie", language: "Canadian English" },
          { original: "Double-double", translation: "Coffee with 2 cream, 2 sugar", language: "Canadian English" },
        ],
        articles: [
          { id: "ca1", title: "Canadian Rockies: Banff, Jasper, and the Icefields Parkway", excerpt: "Turquoise lakes, glaciers, and mountain wildlife.", image: "/iceland.jpg", category: "Mountains", date: "2025-11-10", author: "Marco", content: [
            "The Canadian Rockies are one of the world's most spectacular mountain ranges. Banff and Jasper National Parks offer turquoise lakes, glaciers, and abundant wildlife in a pristine wilderness setting.",
            "Lake Louise is the poster child of the Rockies — its impossibly turquoise water (colored by glacial flour) reflects the surrounding peaks and the Victoria Glacier. Arrive at dawn for mirror-still reflections.",
            "The Icefields Parkway connecting Banff and Jasper is often called the most beautiful drive in the world. Every viewpoint reveals another jaw-dropping vista of glaciers, waterfalls, and mountain peaks.",
            "The Columbia Icefield sits astride the Continental Divide. Take the Ice Explorer onto the Athabasca Glacier, or walk the glass-bottomed Glacier Skywalk 280 meters above the valley floor.",
            "Wildlife is everywhere — keep your eyes peeled for grizzly bears, elk, moose, mountain goats, and bighorn sheep. The Icefields Parkway is particularly good for bear sightings in spring and early summer."
          ] },
          { id: "ca2", title: "Vancouver and Vancouver Island: Mountains meet the Pacific", excerpt: "Rainforests, orcas, and one of the world's most livable cities.", image: "/iceland.jpg", category: "Nature", date: "2025-10-05", author: "Sophie", content: [
            "Vancouver is consistently ranked as one of the world's most livable cities — a modern metropolis nestled between mountains and ocean, with stunning natural beauty in every direction.",
            "Stanley Park is one of the world's great urban parks — a 1,000-acre peninsula of old-growth forest, with a seawall path perfect for walking, running, or cycling with mountain and ocean views.",
            "Take the ferry to Vancouver Island and drive to Tofino on the wild west coast. Storm watching in winter is a unique experience — massive Pacific waves crash against the rocky shore.",
            "Whale watching from Victoria or Tofino is incredible — orca pods, humpback whales, and gray whales are regularly spotted. The resident orca pods in the San Juan Islands are particularly special.",
            "The drive from Nanaimo to Tofino through Cathedral Grove is magical — walk among ancient Douglas firs up to 800 years old, with trunks so wide that several people can't link arms around them."
          ] },
        ],
      },
    ],
  },
];

export const featuredArticles: Article[] = [
  {
    id: "feat1",
    title: "What to do in Santorini, Greece: From beaches and activities to the most beautiful sunset spots",
    excerpt: "Discover the magic of Santorini with our complete guide to the best beaches, activities, and sunset viewpoints.",
    image: "/hero-greece.jpg",
    category: "Europe",
    date: "2025-12-10",
    author: "Sophie",
    content: [
      "Santorini is the most iconic of the Greek islands — a volcanic crescent of white-washed buildings, blue domes, and dramatic cliffs plunging into the deepest blue sea.",
      "Oia is the most photographed village, famous for its stunning sunsets. Arrive at the castle ruins by 6 PM to secure a spot. The blue-domed churches (the most famous is actually the Three Bells of Fira) are nearby.",
      "For beaches, head to the south coast. Red Beach is dramatic (red volcanic cliffs), Perissa and Kamari have black volcanic sand, and Vlychada has eroded white cliffs that look like a moonscape.",
      "Take a sunset sailing cruise around the caldera. Most tours include swimming stops at the hot springs (warm water heated by volcanic activity), Red Beach, and a gourmet dinner on board.",
      "For the best views, hike from Fira to Oia along the caldera rim (about 3 hours). The trail follows the cliff edge with views of the volcano, the sea, and the whitewashed villages ahead.",
      "Don't miss the local wines — Santorini's volcanic soil produces unique varieties like Assyrtiko. Visit Santo Wines or Venetsanos Winery for tastings with caldera views."
    ],
  },
  {
    id: "feat2",
    title: "Northern Lights Guide: 10 incredible locations to witness this natural phenomenon",
    excerpt: "Chase the aurora borealis across the globe with our curated list of the best viewing spots.",
    image: "/northern-lights.jpg",
    category: "Adventure",
    date: "2025-11-28",
    author: "Marco",
    content: [
      "The Northern Lights (aurora borealis) are one of nature's most spectacular displays — curtains of green, purple, and pink light dancing across the dark sky. Here are the best places to see them.",
      "Iceland is one of the most accessible destinations. Between September and March, head away from Reykjavik's light pollution — Thingvellir National Park and the Snæfellsnes Peninsula are excellent spots.",
      "Northern Norway — Tromsø, the Lofoten Islands, and the North Cape — offers the most reliable Northern Lights viewing. The Lofoten Islands' dramatic fjords create a spectacular foreground.",
      "Swedish Lapland around Abisko is known as one of the best places in the world for aurora viewing, thanks to a unique microclimate that keeps the skies clear.",
      "Finnish Lapland offers glass igloos where you can watch the lights from the warmth of your bed. Saariselkä, Inari, and Levi are top Finnish destinations.",
      "For North America, Yellowknife in Canada's Northwest Territories has the highest frequency of Northern Lights sightings on the continent. Fairbanks, Alaska is another excellent option."
    ],
  },
  {
    id: "feat3",
    title: "Exploring Morocco: A complete travel guide with hidden gems and local favorites",
    excerpt: "From the medinas of Marrakech to the Sahara Desert, discover Morocco's hidden treasures.",
    image: "/morocco.jpg",
    category: "Africa",
    date: "2025-11-15",
    author: "Sophie",
    content: [
      "Morocco is a sensory feast — the colors of the souks, the call to prayer echoing through ancient medinas, the taste of tagine and mint tea, and the silence of the Sahara under a canopy of stars.",
      "Start in Marrakech: explore the Jemaa el-Fna square, get lost in the souks, and stay in a traditional riad with a rooftop terrace overlooking the medina.",
      "Head north to Chefchaouen, the 'Blue Pearl' — every building is painted in shades of blue, creating one of the most photogenic towns in the world.",
      "Cross the Atlas Mountains through Tizi n'Tichka pass, stopping at the Aït Benhaddou kasbah (a UNESCO site featured in many Hollywood films).",
      "End with a night in the Sahara Desert — ride a camel to a desert camp, watch the sunset paint the dunes gold, and sleep under more stars than you've ever seen.",
      "Morocco is safe, affordable, and endlessly fascinating. The key is to embrace the chaos, negotiate with humor, and always accept an invitation for tea."
    ],
  },
];

export const products = [
  { id: "p1", name: "European Adventures Guide", price: 27.50, rating: 4.8, image: "/travel-books.jpg" },
  { id: "p2", name: "Asia Explorer's Handbook", price: 27.50, rating: 4.9, image: "/travel-books.jpg" },
  { id: "p3", name: "Complete World Travel Planner", price: 24.95, rating: 4.7, image: "/travel-books.jpg" },
];

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function getContinentBySlug(slug: string) {
  return continents.find(c => c.slug === slug);
}

export function getCountryBySlug(continentSlug: string, countrySlug: string) {
  const continent = getContinentBySlug(continentSlug);
  return continent?.countries.find(c => c.slug === countrySlug);
}

export function getArticleById(id: string): { article: Article; country?: Country; continent?: Continent } | undefined {
  // Check featured articles first
  const featured = featuredArticles.find(a => a.id === id);
  if (featured) return { article: featured };

  // Search through all countries
  for (const continent of continents) {
    for (const country of continent.countries) {
      const article = country.articles.find(a => a.id === id);
      if (article) return { article, country, continent };
    }
  }
  return undefined;
}

export function getAllArticles(): Article[] {
  const articles: Article[] = [...featuredArticles];
  for (const continent of continents) {
    for (const country of continent.countries) {
      articles.push(...country.articles);
    }
  }
  return articles;
}
