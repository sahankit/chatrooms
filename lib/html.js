const {
  rooms,
  regions,
  nav,
  popularPills,
  getRoom,
  searchRooms
} = require("./rooms");
const { pageTitle, absoluteUrl, jsonLd, breadcrumb, SITE_NAME } = require("./seo");
const ads = require("./adsense");

let siteUrl = "";

function configure({ siteUrl: next, adsenseClient, adsenseSlotTop, adsenseSlotBottom } = {}) {
  siteUrl = String(next || "").replace(/\/+$/, "");
  if (adsenseClient != null || adsenseSlotTop != null || adsenseSlotBottom != null) {
    ads.configure({
      client: adsenseClient,
      slotTop: adsenseSlotTop,
      slotBottom: adsenseSlotBottom
    });
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function navHtml(activePath) {
  return nav
    .map((item) => {
      const current = item.href === activePath ? " current" : "";
      const children = item.children
        ? `<ul>${item.children
            .map((child) => `<li><a href="${child.href}">${escapeHtml(child.label)}</a></li>`)
            .join("")}</ul>`
        : "";
      return `<li class="page_item${current}"><a href="${item.href}">${escapeHtml(item.label)}</a>${children}</li>`;
    })
    .join("");
}

function layout({ title, description, keywords, path, body, noindex, type }) {
  const fullTitle = pageTitle(title);
  const desc = description.slice(0, 160);
  const canonical = absoluteUrl(siteUrl, path || "/");
  const robots = noindex ? "noindex, nofollow" : "index, follow";
  const schema = JSON.stringify(jsonLd({ base: siteUrl, path, title: fullTitle, description: desc, type }));
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(desc)}" />
<meta name="keywords" content="${escapeHtml(keywords || "free online chat, chat rooms, India chat, Tamil chat, Kerala chat")}" />
<meta name="robots" content="${robots}" />
<meta name="theme-color" content="#070b12" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(fullTitle)}" />
<meta property="og:description" content="${escapeHtml(desc)}" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:locale" content="en_US" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
<meta name="twitter:description" content="${escapeHtml(desc)}" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="sitemap" type="application/xml" href="/sitemap.xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/css/style.css" />
${ads.headTags()}
<script type="application/ld+json">${schema}</script>
</head>
<body>
<div class="wrapper">
  <div class="mainbody">
    <header class="header">
      <div class="topheader">
        <div class="topheader-left">
          <a class="brand" href="/" title="Free online chat rooms">
            <span class="brand-mark">c</span>
            <span class="brand-text">
              <strong>${SITE_NAME}</strong>
              <em>Free rooms. Instant talk. No signup.</em>
            </span>
          </a>
        </div>
        <div class="header-actions">
          <div class="searchpannel">
            <form method="get" action="/search" class="searchForm" role="search">
              <label class="sr-only" for="s">Search chat rooms</label>
              <input type="search" value="" name="s" id="s" class="field" placeholder="Find a room" />
              <input type="submit" value="Go" class="searchsubmit" />
            </form>
          </div>
          <a class="btn btn-header" href="/#start">Join</a>
          <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
        </div>
      </div>
      <nav class="mainnav" id="site-nav" aria-label="Primary">
        <div class="menu">
          <ul>${navHtml(path)}</ul>
        </div>
      </nav>
    </header>
    <main class="bodycontainer">
      ${ads.topAd()}
      <div class="rightpannel">
        ${body}
      </div>
      ${ads.bottomAd()}
    </main>
    <footer class="footer">
      <div class="copyrightpart">
        <p class="leftpart">A free public chat lounge for India and the world.</p>
        <p class="rightpart">v.9.9.1</p>
      </div>
    </footer>
  </div>
</div>
<p id="footer-message">&copy; ${new Date().getFullYear()}
  <a href="/">${SITE_NAME}</a> ·
  <a href="/pages/privacypolicy/">Privacy</a> ·
  <a href="/pages/disclaimers/">Disclaimers</a> ·
  <a href="/pages/safetytips/">Safety</a> ·
  <a href="/contact/">Contact</a>
</p>
<script src="/js/site.js"></script>
</body>
</html>`;
}

function roomLink(slug) {
  const room = getRoom(slug);
  if (!room) return "";
  return `<a href="${room.href}">${escapeHtml(room.title)}</a>`;
}

const startRooms = [
  ["tamil", "Tamil"],
  ["india", "India"],
  ["kerala", "Kerala"],
  ["telugu", "Telugu"],
  ["chennai", "Chennai"],
  ["delhi", "Delhi"],
  ["mumbai", "Mumbai"],
  ["usa", "USA"],
  ["philippines", "Philippines"],
  ["english", "English"],
  ["friendship", "Friendship"],
  ["general", "General"]
];

function startForm(selected = "tamil") {
  const options = startRooms
    .map(
      ([slug, name]) =>
        `<option value="${slug}"${slug === selected ? " selected" : ""}>#${escapeHtml(name)}</option>`
    )
    .join("");
  return `
    <form class="start-card" id="start" data-start>
      <p class="start-card-kicker">Takes 10 seconds</p>
      <label>
        <span>Your name</span>
        <input type="text" name="nick" maxlength="24" minlength="2" placeholder="e.g. Ankit" autocomplete="nickname" required />
      </label>
      <label>
        <span>Room</span>
        <select name="room" aria-label="Choose a room">${options}</select>
      </label>
      <div class="start-actions">
        <button type="submit" class="btn">Join chat</button>
        <button type="button" class="btn btn-ghost" data-guest>Join as guest</button>
      </div>
      <p class="note">18+ only. Public rooms. No signup.</p>
    </form>
  `;
}

function roomFinder() {
  const popular = new Set(popularPills);
  const cards = rooms
    .map((room) => {
      return `<a class="room-card" href="${room.href}" data-group="${escapeHtml(room.group)}" data-name="${escapeHtml(room.name)}" data-popular="${popular.has(room.slug) ? "1" : "0"}"><b>${escapeHtml(room.name)}</b><span>Open room</span></a>`;
    })
    .join("");
  return `
    <section class="finder" aria-label="Find a room">
      <div class="finder-head">
        <h2>Find a room</h2>
        <input type="search" data-room-filter placeholder="Search Tamil, Delhi, USA…" />
      </div>
      <div class="finder-tabs" data-room-tabs>
        <button type="button" class="is-on" data-tab="popular">Popular</button>
        <button type="button" data-tab="local">India</button>
        <button type="button" data-tab="topic">Topics</button>
        <button type="button" data-tab="world">World</button>
        <button type="button" data-tab="all">All</button>
      </div>
      <div class="room-pick" data-room-grid>${cards}</div>
    </section>
  `;
}

function chatKicker(name) {
  return `<p class="chat-kicker"><a href="/">Home</a> · #${escapeHtml(name)} · 18+ public room · tap a name to message privately</p>`;
}

function homePage() {
  return layout({
    title: "Free online chat rooms",
    description: "Free online chat rooms for India and the world. Join Tamil, Telugu, Kerala, Chennai, Delhi, USA and more. No registration.",
    path: "/",
    type: "WebSite",
    body: `
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow">Free · No signup · 18+</div>
          <h1>Type a name. Pick a room. Talk.</h1>
          <p class="hero-lead">No account. Everyone in the same room sees the same chat. Tap a name to talk privately.</p>
        </div>
        ${startForm("tamil")}
      </section>
      ${roomFinder()}
    `
  });
}

function regionPage(region) {
  const regionRooms = region.rooms.map((slug) => getRoom(slug)).filter(Boolean);
  return layout({
    title: region.title,
    description: region.blurb.slice(0, 160),
    path: `/chat-rooms/${region.slug}-chat-rooms/`,
    type: "CollectionPage",
    body: `
      ${chatKicker((regionRooms[0] && regionRooms[0].name) || region.title)}
      <div id="chat-app" data-room="${escapeHtml((regionRooms[0] && regionRooms[0].slug) || "general")}" data-room-name="${escapeHtml((regionRooms[0] && regionRooms[0].name) || "General")}"></div>
      <script src="/js/chat-client.js"></script>
      <div class="room-pick">
        ${regionRooms
          .map(
            (room) =>
              `<a class="room-card" href="${room.href}"><b>${escapeHtml(room.name)}</b><span>Open room</span></a>`
          )
          .join("")}
      </div>
    `
  });
}

function embedPage(room) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(pageTitle(room.title))}</title>
<meta name="robots" content="noindex, nofollow" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/css/style.css" />
<style>body{background:#070b12;margin:0} .wrapper,.mainbody{width:auto;min-height:0;box-shadow:none}</style>
</head>
<body>
<div id="chat-app" data-room="${escapeHtml(room.slug)}" data-room-name="${escapeHtml(room.name)}" data-compact="true"></div>
<script src="/js/chat-client.js"></script>
</body>
</html>`;
}

function roomPage(room) {
  return layout({
    title: `${room.name} chat room`,
    description: `Free ${room.name} online chat room. No registration. Talk live with people in ${room.name} and click a name to chat privately.`,
    path: room.href,
    keywords: `${room.name} chat, ${room.name} chat room, free ${room.name} online chat`,
    type: "WebPage",
    body: `
      ${chatKicker(room.name)}
      <div id="chat-app" data-room="${escapeHtml(room.slug)}" data-room-name="${escapeHtml(room.name)}"></div>
      <script src="/js/chat-client.js"></script>
    `
  });
}

function lobbyPage() {
  return layout({
    title: "Start live chat",
    description: "Start free live chat with no registration. Join the general room or pick India, Tamil, Kerala, and more.",
    path: "/online-chat/",
    body: `
      ${chatKicker("General")}
      <div id="chat-app" data-room="general" data-room-name="General"></div>
      <script src="/js/chat-client.js"></script>
      ${roomFinder()}
    `
  });
}

function multiPage() {
  const picks = ["india", "tamil", "kerala", "philippines"];
  return layout({
    title: "Open several chat rooms",
    description: "Open India, Tamil, Kerala and Philippines chat rooms in one window.",
    path: "/chatwidget/",
    noindex: true,
    body: `
      <div class="page-head">
        <h2>Several rooms at once</h2>
        <p>Four live rooms in one page. Type <code>/clear</code> to wipe a view.</p>
      </div>
      <div class="multi-grid">
        ${picks
          .map((slug) => {
            const room = getRoom(slug);
            return `<iframe title="${escapeHtml(room.name)} chat" src="${room.href}?embed=1"></iframe>`;
          })
          .join("")}
      </div>
    `
  });
}

function searchPage(query) {
  const results = searchRooms(query);
  return layout({
    title: query ? `Search results for ${query}` : "Search chat rooms",
    description: "Find a free online chat room by city, language, or country.",
    path: "/search",
    noindex: true,
    body: `
      <div class="page-head">
        <h2>Search rooms</h2>
        <p>${query ? `Results for “${escapeHtml(query)}”` : "Try a city, language, or country."}</p>
      </div>
      ${
        results.length
          ? `<ul class="search-list">${results.map((room) => `<li>${roomLink(room.slug)}</li>`).join("")}</ul>`
          : "<p>No rooms matched. Try Tamil, Kerala, Delhi or USA.</p>"
      }
    `
  });
}

function chatRoomsIndex() {
  return layout({
    title: "Browse chat rooms",
    description: "Browse free online chat rooms by region and topic, including Asia, India, and friendship rooms.",
    path: "/chat-rooms/",
    type: "CollectionPage",
    body: `
      ${breadcrumb([
        { href: "/", label: "Home" },
        { href: "/chat-rooms/", label: "Chat rooms" }
      ])}
      <div class="page-head">
        <h1>Chat rooms</h1>
        <p>Search or tap a room. No registration.</p>
      </div>
      ${roomFinder()}
    `
  });
}

function simplePage({ title, path, heading, html }) {
  return layout({
    title,
    description: heading,
    path,
    body: `${breadcrumb([
      { href: "/", label: "Home" },
      { href: path, label: heading }
    ])}<h1>${escapeHtml(heading)}</h1><div class="page-copy">${html}</div>`
  });
}

function termsPage() {
  return simplePage({
    title: "Terms of service",
    path: "/help/",
    heading: "Terms of service",
    html: `
      <p>By using this website you agree to these terms. If you do not agree, leave the site.</p>
      <ul>
        <li>You must be 18 years or older to use the chat rooms.</li>
        <li>Do not spam, flood, advertise, or harass other people.</li>
        <li>Do not share personal information, passwords, or payment details.</li>
        <li>Public rooms are not private. Anyone in the room can read what you type.</li>
        <li>We may remove messages or block nicknames that break these rules.</li>
        <li>The service is provided as-is, with no promise of uptime or moderation coverage.</li>
      </ul>
    `
  });
}

function privacyPage() {
  return simplePage({
    title: "Privacy policy",
    path: "/pages/privacypolicy/",
    heading: "Privacy policy",
    html: `
      <p>This is a no-registration chat site. We do not ask for an email or password to enter a room.</p>
      <ul>
        <li>Your chosen nickname is shown to other people in the same room.</li>
        <li>Recent messages are kept in memory on the server for a short time so new joiners can see the last lines, then discarded.</li>
        <li>The site stores your nickname in your own browser (localStorage) so you can rejoin faster.</li>
        <li>We use Google AdSense to show ads. Google may use cookies or similar technology to serve and measure ads. See <a href="https://policies.google.com/technologies/ads" rel="noopener noreferrer">how Google uses ad data</a>.</li>
        <li>Do not post private data. Public chat is not a safe place for addresses, phone numbers, or IDs.</li>
      </ul>
    `
  });
}

function safetyPage() {
  return simplePage({
    title: "Safety tips for chat",
    path: "/pages/safetytips/",
    heading: "Safety tips",
    html: `
      <ul>
        <li>Never send money, OTPs, or copies of ID to someone you met in chat.</li>
        <li>Do not share your address, workplace, or travel plans.</li>
        <li>If someone makes you uncomfortable, leave the room and pick a new nickname.</li>
        <li>Meet-ups from public chat are risky. If you meet anyone, tell a friend and stay in a public place.</li>
        <li>This site is for adults. Do not involve minors in chat.</li>
      </ul>
    `
  });
}

function disclaimerPage() {
  return simplePage({
    title: "Disclaimers",
    path: "/pages/disclaimers/",
    heading: "Disclaimers",
    html: `
      <p>Chat rooms are public and user-generated. We do not endorse what visitors write.</p>
      <ul>
        <li>You chat at your own risk.</li>
        <li>We are not responsible for other users’ messages, links, or conduct.</li>
        <li>Entering a room means you accept the terms, privacy policy, and safety tips.</li>
      </ul>
    `
  });
}

function contactPage() {
  return simplePage({
    title: "Contact Us",
    path: "/contact/",
    heading: "Contact Us",
    html: `<p>For feedback about rooms or rules, use the <a href="/chat-rooms/feedback/">feedback</a> page. This local demo does not collect email.</p>`
  });
}

function feedbackPage() {
  return simplePage({
    title: "Feedback",
    path: "/chat-rooms/feedback/",
    heading: "Feedback",
    html: `
      <p>Tell us which rooms you want added. This demo keeps feedback in the public <a href="/general-chat-rooms/">General</a> room — prefix your note with <strong>FEEDBACK:</strong></p>
      <div class="start-wrap"><a class="btn" href="/general-chat-rooms/">Open General room</a></div>
    `
  });
}

function pagesIndex() {
  return simplePage({
    title: "Site pages",
    path: "/pages/",
    heading: "Site pages",
    html: `
      <ul>
        <li><a href="/pages/disclaimers/">DISCLAIMERS.</a></li>
        <li><a href="/pages/privacypolicy/">PrivacyPolicy</a></li>
        <li><a href="/pages/safetytips/">SafetyTips</a></li>
      </ul>
    `
  });
}

function notFoundPage() {
  return layout({
    title: "Page not found",
    description: "That chat room or page was not found.",
    path: "/",
    noindex: true,
    body: `<div class="page-head"><h1>Page not found</h1><p>Try the <a href="/">home page</a> or <a href="/online-chat/">start chatting</a>.</p></div>`
  });
}

module.exports = {
  configure,
  homePage,
  regionPage,
  roomPage,
  lobbyPage,
  multiPage,
  searchPage,
  chatRoomsIndex,
  termsPage,
  privacyPage,
  safetyPage,
  disclaimerPage,
  contactPage,
  feedbackPage,
  pagesIndex,
  notFoundPage,
  embedPage,
  regions
};
