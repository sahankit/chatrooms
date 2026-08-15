const localRooms = [
  { slug: "random", name: "Random", group: "local" },
  { slug: "chennai", name: "Chennai", group: "local" },
  { slug: "telugu", name: "Telugu", group: "local" },
  { slug: "general", name: "General", group: "local" },
  { slug: "delhi", name: "Delhi", group: "local" },
  { slug: "mumbai", name: "Mumbai", group: "local" },
  { slug: "calcutta", name: "Calcutta", group: "local" },
  { slug: "chandigarh", name: "Chandigarh", group: "local" },
  { slug: "desi", name: "Desi", group: "local" },
  { slug: "goa", name: "Goa", group: "local" },
  { slug: "gujarat", name: "Gujarat", group: "local" },
  { slug: "hindi", name: "Hindi", group: "local" },
  { slug: "tamil", name: "Tamil", group: "local" },
  { slug: "kerala", name: "Kerala", group: "local" },
  { slug: "punjab", name: "Punjab", group: "local" },
  { slug: "malayalam", name: "Malayalam", group: "local" },
  { slug: "hyderabad", name: "Hyderabad", group: "local" },
  { slug: "bangalore", name: "Bangalore", group: "local" },
  { slug: "pune", name: "Pune", group: "local" },
  { slug: "kolkata", name: "Kolkata", group: "local" }
];

const topicRooms = [
  { slug: "college", name: "College", group: "topic" },
  { slug: "music", name: "Music", group: "topic" },
  { slug: "live", name: "Live", group: "topic" },
  { slug: "friendship", name: "Friendship", group: "topic" },
  { slug: "sports", name: "Sports", group: "topic" },
  { slug: "movies", name: "Movies", group: "topic" },
  { slug: "travel", name: "Travel", group: "topic" },
  { slug: "food", name: "Food", group: "topic" }
];

const worldRooms = [
  { slug: "india", name: "India", group: "world" },
  { slug: "usa", name: "USA", group: "world" },
  { slug: "philippines", name: "Philippines", group: "world" },
  { slug: "uk", name: "UK", group: "world" },
  { slug: "uae", name: "UAE", group: "world" },
  { slug: "dubai", name: "Dubai", group: "world" },
  { slug: "canada", name: "Canada", group: "world" },
  { slug: "australia", name: "Australia", group: "world" },
  { slug: "pakistan", name: "Pakistan", group: "world" },
  { slug: "sri-lanka", name: "Sri Lanka", group: "world" },
  { slug: "singapore", name: "Singapore", group: "world" },
  { slug: "malaysia", name: "Malaysia", group: "world" },
  { slug: "thailand", name: "Thailand", group: "world" },
  { slug: "china", name: "China", group: "world" },
  { slug: "japan", name: "Japan", group: "world" },
  { slug: "south-korea", name: "South Korea", group: "world" },
  { slug: "indonesia", name: "Indonesia", group: "world" },
  { slug: "vietnam", name: "Vietnam", group: "world" },
  { slug: "hong-kong", name: "Hong Kong", group: "world" },
  { slug: "taiwan", name: "Taiwan", group: "world" },
  { slug: "nepal", name: "Nepal", group: "world" },
  { slug: "bangladesh", name: "Bangladesh", group: "world" },
  { slug: "egypt", name: "Egypt", group: "world" },
  { slug: "uae-arab", name: "Arab", group: "world" },
  { slug: "algeria", name: "Algeria", group: "world" },
  { slug: "south-africa", name: "South Africa", group: "world" },
  { slug: "ethiopia", name: "Ethiopia", group: "world" },
  { slug: "france", name: "France", group: "world" },
  { slug: "germany", name: "Germany", group: "world" },
  { slug: "italy", name: "Italy", group: "world" },
  { slug: "spain", name: "Spain", group: "world" },
  { slug: "netherlands", name: "Netherlands", group: "world" },
  { slug: "ireland", name: "Ireland", group: "world" },
  { slug: "switzerland", name: "Switzerland", group: "world" },
  { slug: "greece", name: "Greece", group: "world" },
  { slug: "poland", name: "Poland", group: "world" },
  { slug: "russia", name: "Russia", group: "world" },
  { slug: "turkey", name: "Turkey", group: "world" },
  { slug: "israel", name: "Israel", group: "world" },
  { slug: "kuwait", name: "Kuwait", group: "world" },
  { slug: "lebanon", name: "Lebanon", group: "world" },
  { slug: "iran", name: "Iran", group: "world" },
  { slug: "brazil", name: "Brazil", group: "world" },
  { slug: "mexico", name: "Mexico", group: "world" },
  { slug: "colombia", name: "Colombia", group: "world" },
  { slug: "venezuela", name: "Venezuela", group: "world" },
  { slug: "puerto-rico", name: "Puerto Rico", group: "world" },
  { slug: "new-zealand", name: "New Zealand", group: "world" },
  { slug: "bali", name: "Bali", group: "world" },
  { slug: "asia", name: "Asia", group: "world" },
  { slug: "europe", name: "Europe", group: "world" },
  { slug: "global", name: "Global", group: "world" },
  { slug: "english", name: "English", group: "world" },
  { slug: "filipino", name: "Filipino", group: "world" },
  { slug: "tagalog", name: "Tagalog", group: "world" },
  { slug: "spanish", name: "Spanish", group: "world" }
];

const rooms = [...localRooms, ...topicRooms, ...worldRooms].map((room) => ({
  ...room,
  title: `${room.name} Online Chat Rooms`,
  href: `/${room.slug}-chat-rooms/`
}));

const bySlug = Object.fromEntries(rooms.map((room) => [room.slug, room]));

const regions = {
  india: {
    slug: "india",
    title: "India Chat Rooms",
    heading: "India online chat rooms",
    blurb:
      "Join free India chatting online. Talk with people from Delhi, Chennai, Bangalore, Mumbai, Pune, Kolkata, Kerala, Tamil Nadu, Telangana and more.",
    rooms: [
      "india",
      "delhi",
      "mumbai",
      "chennai",
      "bangalore",
      "hyderabad",
      "pune",
      "kolkata",
      "calcutta",
      "goa",
      "gujarat",
      "punjab",
      "chandigarh",
      "desi",
      "hindi",
      "tamil",
      "telugu",
      "kerala",
      "malayalam"
    ]
  },
  kerala: {
    slug: "kerala",
    title: "Kerala Chat Rooms",
    heading: "Kerala and Malayalam chat",
    blurb:
      "Free Kerala chat rooms. Join Malayalam and English conversation with people from Kochi, Trivandrum, Kozhikode and across Kerala.",
    rooms: ["kerala", "malayalam", "india", "friendship", "music"]
  },
  tamil: {
    slug: "tamil",
    title: "Tamil Chat Rooms",
    heading: "Tamil online chat rooms",
    blurb:
      "Free Tamil chat rooms for friends from Chennai, Coimbatore, Madurai and the Tamil diaspora.",
    rooms: ["tamil", "chennai", "india", "music", "movies"]
  },
  telugu: {
    slug: "telugu",
    title: "Telugu Chat Rooms",
    heading: "Telugu online chat rooms",
    blurb:
      "Join Telugu chat from Hyderabad, Vijayawada, Visakhapatnam and Telangana / Andhra Pradesh.",
    rooms: ["telugu", "hyderabad", "india", "movies", "friendship"]
  },
  usa: {
    slug: "usa",
    title: "USA Chat Rooms",
    heading: "United States online chat rooms",
    blurb: "English chat rooms for the USA and friends worldwide. No registration required.",
    rooms: ["usa", "english", "global", "canada", "uk"]
  },
  chennai: {
    slug: "chennai",
    title: "Chennai Chat Rooms",
    heading: "Chennai online chat rooms",
    blurb: "Local Chennai chat. Meet people from the city and talk in Tamil or English.",
    rooms: ["chennai", "tamil", "india", "college", "music"]
  },
  global: {
    slug: "global",
    title: "Global Chat Rooms",
    heading: "Worldwide online chat rooms",
    blurb: "International chat rooms. Pick a country or language and start talking in seconds.",
    rooms: ["global", "english", "asia", "europe", "usa", "india", "philippines", "uk"]
  },
  philippines: {
    slug: "philippines",
    title: "Philippines Chat Rooms",
    heading: "Philippines and Tagalog chat",
    blurb: "Free Philippines chat rooms. Join Filipino and Tagalog conversation without signing up.",
    rooms: ["philippines", "filipino", "tagalog", "english", "friendship"]
  },
  asia: {
    slug: "asia",
    title: "Asia Chat Rooms",
    heading: "Asia online chat rooms",
    blurb: "Chat rooms across Asia — India, Philippines, Singapore, Japan, Korea and more.",
    rooms: [
      "asia",
      "india",
      "philippines",
      "singapore",
      "malaysia",
      "thailand",
      "japan",
      "south-korea",
      "china",
      "indonesia"
    ]
  },
  ethiopia: {
    slug: "ethiopia",
    title: "Ethiopia Chat Rooms",
    heading: "Ethiopia online chat rooms",
    blurb: "Meet people from Ethiopia and the Horn of Africa in a free public chat room.",
    rooms: ["ethiopia", "south-africa", "english", "friendship"]
  },
  friendship: {
    slug: "friendship",
    title: "Friendship Chat Rooms",
    heading: "Friendship online chat rooms",
    blurb: "Make new friends in a public room. Be kind, no spam, and keep it friendly.",
    rooms: ["friendship", "general", "random", "college", "music", "travel"]
  }
};

const nav = [
  { href: "/india-chat-rooms/", label: "India" },
  { href: "/tamil-chat-rooms/", label: "Tamil" },
  { href: "/kerala-chat-rooms/", label: "Kerala" },
  { href: "/usa-chat-rooms/", label: "USA" },
  { href: "/chat-rooms/", label: "All rooms" }
];

const popularPills = [
  "india",
  "tamil",
  "telugu",
  "kerala",
  "chennai",
  "delhi",
  "mumbai",
  "punjab",
  "usa",
  "philippines",
  "dubai",
  "english",
  "hyderabad",
  "bangalore"
];

function getRoom(slug) {
  return bySlug[slug] || null;
}

function searchRooms(query) {
  const q = String(query || "")
    .trim()
    .toLowerCase();
  if (!q) return [];
  return rooms.filter(
    (room) => room.name.toLowerCase().includes(q) || room.slug.includes(q) || room.title.toLowerCase().includes(q)
  );
}

function resolvePath(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const nestedRegion = {
    "/chat-rooms/asia-chat-rooms": "asia",
    "/chat-rooms/ethiopia-chat-rooms": "ethiopia",
    "/chat-rooms/friendship-chat-rooms": "friendship"
  };
  if (nestedRegion[path]) {
    return { type: "region", slug: nestedRegion[path] };
  }
  if (path === "/worldwide") {
    return { type: "room", slug: "global" };
  }
  const roomMatch = path.match(/^\/([a-z0-9-]+)-chat-rooms$/);
  if (roomMatch && bySlug[roomMatch[1]]) {
    return { type: "room", slug: roomMatch[1] };
  }
  const shortRoom = path.match(/^\/([a-z0-9-]+)$/);
  if (shortRoom && bySlug[shortRoom[1]] && !["help", "pages", "online-chat", "chat-rooms"].includes(shortRoom[1])) {
    return { type: "room", slug: shortRoom[1] };
  }
  return null;
}

module.exports = {
  rooms,
  localRooms,
  topicRooms,
  worldRooms,
  regions,
  nav,
  popularPills,
  getRoom,
  searchRooms,
  resolvePath
};
