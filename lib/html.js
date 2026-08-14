const {
  rooms,
  localRooms,
  topicRooms,
  worldRooms,
  regions,
  nav,
  popularPills,
  getRoom,
  searchRooms
} = require("./rooms");
const { pageTitle, absoluteUrl, jsonLd, breadcrumb, SITE_NAME } = require("./seo");

let siteUrl = "";

function configure({ siteUrl: next } = {}) {
  siteUrl = String(next || "").replace(/\/+$/, "");
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
              <input type="submit" value="Search" class="searchsubmit" />
            </form>
          </div>
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
      <div class="rightpannel">
        ${body}
      </div>
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

function pill(slug) {
  const room = getRoom(slug);
  if (!room) return "";
  return `<a class="chat" href="${room.href}">#${escapeHtml(room.name)}</a>`;
}

function listItems(list) {
  return list.map((room) => `<li>${roomLink(room.slug)}</li>`).join("");
}

function homePage() {
  const mid = Math.ceil(worldRooms.length / 2);
  const leftWorld = worldRooms.slice(0, mid);
  const rightWorld = worldRooms.slice(mid);
  return layout({
    title: "Free online chat rooms",
    description: "Free online chat rooms for India and the world. Join Tamil, Telugu, Kerala, Chennai, Delhi, USA and more. No registration.",
    path: "/",
    type: "WebSite",
    body: `
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow">Free · No signup · 18+</div>
          <h1>Meet people from India and around the world</h1>
          <p class="hero-lead">Pick a city or language, type a name, and talk live. Everyone in the same room sees the same chat.</p>
          <div class="start-wrap">
            <a class="btn" href="/online-chat/">Start chatting</a>
            <a class="btn btn-ghost" href="/chat-rooms/">Browse rooms</a>
          </div>
          <div class="stats">
            <div><b>150k+</b>joined this month</div>
            <div><b>80+</b>rooms</div>
            <div><b>0</b>registration</div>
          </div>
          <p class="note">By entering a room you agree to the <a href="/pages/disclaimers/">terms and privacy policy</a>.</p>
        </div>
        <div class="hero-preview" aria-hidden="true">
          <div class="preview-bar"><b># Tamil</b><span>live · 3 here</span></div>
          <div class="preview-msg"><span>A</span><p>Anyone from Chennai up for a late chat?</p></div>
          <div class="preview-msg me"><span>P</span><p>Just joined. How is everyone tonight?</p></div>
          <div class="preview-msg"><span>R</span><p>Welcome in. This room stays busy after 10.</p></div>
        </div>
      </section>
      <div class="room-links">
        <a href="/india-chat-rooms/">India</a>
        <a href="/tamil-chat-rooms/">Tamil</a>
        <a href="/telugu-chat-rooms/">Telugu</a>
        <a href="/kerala-chat-rooms/">Kerala</a>
        <a href="/chennai-chat-rooms/">Chennai</a>
        <a href="/usa-chat-rooms/">USA</a>
        <a href="/philippines-chat-rooms/">Philippines</a>
      </div>
      <h2 class="section-title">Popular rooms</h2>
      <div class="pills">${popularPills.map(pill).join(" ")}</div>
      <h2 class="section-title">Local rooms</h2>
      <p>Cities and languages from across India.</p>
      <ul class="local-list">${listItems(localRooms)}</ul>
      <h2 class="section-title">Topics</h2>
      <ul class="topic-list">${listItems(topicRooms)}</ul>
      <h2>Worldwide</h2>
      <p>Country and language rooms. Join in a few seconds.</p>
      <div class="world-cols">
        <ul>${listItems(leftWorld)}</ul>
        <ul>${listItems(rightWorld)}</ul>
      </div>
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
      ${breadcrumb([
        { href: "/", label: "Home" },
        { href: "/chat-rooms/", label: "Chat rooms" },
        { href: `/chat-rooms/${region.slug}-chat-rooms/`, label: region.title }
      ])}
      <div class="page-head">
        <h1>${escapeHtml(region.heading)}</h1>
        <p>${escapeHtml(region.blurb)}</p>
      </div>
      <div id="chat-app" data-room="${escapeHtml((regionRooms[0] && regionRooms[0].slug) || "general")}" data-room-name="${escapeHtml((regionRooms[0] && regionRooms[0].name) || "General")}"></div>
      <script src="/js/chat-client.js"></script>
      <div class="room-pick">
        ${regionRooms
          .map(
            (room) =>
              `<a class="room-card" href="${room.href}"><b>${escapeHtml(room.name)}</b><span>${escapeHtml(room.title)}</span></a>`
          )
          .join("")}
      </div>
      <h2 class="section-title">More local rooms</h2>
      <ul class="local-list">${listItems(localRooms)}</ul>
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
      ${breadcrumb([
        { href: "/", label: "Home" },
        { href: "/chat-rooms/", label: "Chat rooms" },
        { href: room.href, label: room.name }
      ])}
      <div class="page-head">
        <h1>${escapeHtml(room.name)} chat room</h1>
        <p>Join the free <strong>${escapeHtml(room.name)}</strong> online chat room. Everyone in this room shares the public conversation. Click a name to talk privately.</p>
      </div>
      <div class="rules">
        <strong>House rules</strong>
        <ul>
          <li>18+ only. Be kind. No spam or ads.</li>
          <li>Public chat is not private.</li>
          <li>Type <code>/clear</code> to clear your own view.</li>
        </ul>
      </div>
      <div id="chat-app" data-room="${escapeHtml(room.slug)}" data-room-name="${escapeHtml(room.name)}"></div>
      <script src="/js/chat-client.js"></script>
      <h2 class="section-title">Other rooms</h2>
      <ul class="local-list">${listItems(localRooms)}</ul>
    `
  });
}

function lobbyPage() {
  return layout({
    title: "Start live chat",
    description: "Start free live chat with no registration. Join the general room or pick India, Tamil, Kerala, and more.",
    path: "/online-chat/",
    body: `
      ${breadcrumb([
        { href: "/", label: "Home" },
        { href: "/online-chat/", label: "Live chat" }
      ])}
      <div class="page-head">
        <h1>Live chat</h1>
        <p>No registration. Enter a name and talk with everyone in the same room. Or <a href="/chatwidget/">open a few rooms at once</a>.</p>
      </div>
      <div id="chat-app" data-room="general" data-room-name="General"></div>
      <script src="/js/chat-client.js"></script>
      <h2 class="section-title">Jump to a room</h2>
      <div class="room-pick">
        ${["general", "india", "tamil", "telugu", "kerala", "chennai", "delhi", "mumbai", "usa", "philippines", "english", "friendship"]
          .map((slug) => {
            const room = getRoom(slug);
            return `<a class="room-card" href="${room.href}"><b>${escapeHtml(room.name)}</b><span>Open selected room</span></a>`;
          })
          .join("")}
      </div>
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
        <p>Choose a region or topic. No registration required.</p>
      </div>
      <div class="room-pick">
        <a class="room-card" href="/chat-rooms/asia-chat-rooms/"><b>Asia</b><span>India, Philippines, Singapore and more</span></a>
        <a class="room-card" href="/chat-rooms/ethiopia-chat-rooms/"><b>Ethiopia</b><span>Ethiopia and Africa rooms</span></a>
        <a class="room-card" href="/chat-rooms/friendship-chat-rooms/"><b>Friendship</b><span>Meet new people</span></a>
        <a class="room-card" href="/chat-rooms/feedback/"><b>feedback</b><span>Tell us what to improve</span></a>
      </div>
      <ul class="local-list">${listItems(rooms.slice(0, 24))}</ul>
      <br class="clear" />
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
