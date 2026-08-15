const SITE_NAME = "chat";
const SITE_TAGLINE = "Free online chat rooms";

function trimBase(base) {
  return String(base || "").replace(/\/+$/, "");
}

function absoluteUrl(base, path) {
  const root = trimBase(base) || "https://localhost";
  if (!path || path === "/") return `${root}/`;
  return `${root}${path.startsWith("/") ? path : `/${path}`}`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pageTitle(name) {
  const label = String(name || SITE_TAGLINE).trim();
  if (label.toLowerCase() === SITE_NAME) return `${SITE_NAME} — ${SITE_TAGLINE}`;
  if (/free online chat rooms/i.test(label)) return `${label} | ${SITE_NAME}`;
  return `${label} | Free online chat | ${SITE_NAME}`;
}

function sitemapXml(base, rooms) {
  const root = trimBase(base);
  const today = new Date().toISOString();
  const staticPaths = [
    { path: "/", priority: "1.0", changefreq: "hourly" },
    { path: "/online-chat/", priority: "0.9", changefreq: "hourly" },
    { path: "/chat-rooms/", priority: "0.9", changefreq: "daily" },
    { path: "/help/", priority: "0.3", changefreq: "monthly" },
    { path: "/pages/privacypolicy/", priority: "0.3", changefreq: "monthly" },
    { path: "/pages/safetytips/", priority: "0.3", changefreq: "monthly" },
    { path: "/pages/disclaimers/", priority: "0.3", changefreq: "monthly" },
    { path: "/contact/", priority: "0.3", changefreq: "monthly" },
    { path: "/chat-rooms/asia-chat-rooms/", priority: "0.7", changefreq: "daily" },
    { path: "/chat-rooms/ethiopia-chat-rooms/", priority: "0.6", changefreq: "daily" },
    { path: "/chat-rooms/friendship-chat-rooms/", priority: "0.7", changefreq: "daily" }
  ];
  const roomEntries = rooms.map((room) => ({
    path: room.href,
    priority: "0.8",
    changefreq: "hourly"
  }));
  const seen = new Set();
  const urls = [...staticPaths, ...roomEntries].filter((item) => {
    if (seen.has(item.path)) return false;
    seen.add(item.path);
    return true;
  });
  const items = urls
    .map((item) => {
      const loc = absoluteUrl(root, item.path);
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>
`;
}

function robotsTxt(base) {
  const root = trimBase(base);
  const host = root.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return [
    "User-agent: Googlebot",
    "Allow: /",
    "Disallow: /chatwidget",
    "Disallow: /health",
    "Disallow: /api/",
    "",
    "User-agent: Bingbot",
    "Allow: /",
    "Disallow: /chatwidget",
    "Disallow: /health",
    "Disallow: /api/",
    "",
    "User-agent: DuckDuckBot",
    "Allow: /",
    "",
    "User-agent: Yandex",
    "Allow: /",
    "",
    "User-agent: *",
    "Allow: /",
    "Allow: /search",
    "Disallow: /chatwidget",
    "Disallow: /health",
    "Disallow: /api/",
    "",
    host ? `Host: ${host}` : "",
    `Sitemap: ${absoluteUrl(root, "/sitemap.xml")}`,
    `Sitemap: ${absoluteUrl(root, "/feed.xml")}`,
    ""
  ]
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

function webmasterTags() {
  const tags = [];
  const google = String(process.env.GOOGLE_SITE_VERIFICATION || "").trim();
  const bing = String(process.env.BING_SITE_VERIFICATION || "").trim();
  const yandex = String(process.env.YANDEX_VERIFICATION || "").trim();
  if (google) tags.push(`<meta name="google-site-verification" content="${escapeXml(google)}" />`);
  if (bing) tags.push(`<meta name="msvalidate.01" content="${escapeXml(bing)}" />`);
  if (yandex) tags.push(`<meta name="yandex-verification" content="${escapeXml(yandex)}" />`);
  return tags.join("\n");
}

function indexNowKey() {
  return String(process.env.INDEXNOW_KEY || "").trim();
}

function homeFaqs() {
  return [
    {
      q: "How do I join a chat room?",
      a: "Type a name, pick a room, and tap Join chat. No email or password is required."
    },
    {
      q: "Is this chat free?",
      a: "Yes. The rooms are free and public. You can also join as a guest."
    },
    {
      q: "Can I talk privately?",
      a: "Yes. After you join a room, tap another person’s name to open a private chat."
    },
    {
      q: "What is the age limit?",
      a: "You must be 18 or older. These rooms are not for children."
    }
  ];
}

function jsonLd({ base, path, title, description, type, crumbs, faqs, items }) {
  const url = absoluteUrl(base, path);
  const home = absoluteUrl(base, "/");
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${home}#website`,
      name: SITE_NAME,
      alternateName: [SITE_TAGLINE, "free online chat rooms"],
      url: home,
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${absoluteUrl(base, "/search")}?s={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": `${home}#org`,
      name: SITE_NAME,
      url: home,
      logo: absoluteUrl(base, "/favicon.svg")
    },
    {
      "@type": "WebApplication",
      "@id": `${home}#app`,
      name: SITE_NAME,
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      url: home
    },
    {
      "@type": type || "WebPage",
      "@id": `${url}#page`,
      name: title,
      description,
      url,
      isPartOf: { "@id": `${home}#website` },
      about: { "@id": `${home}#app` },
      inLanguage: "en",
      primaryImageOfPage: absoluteUrl(base, "/og.svg")
    }
  ];

  if (crumbs && crumbs.length) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#crumbs`,
      itemListElement: crumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: absoluteUrl(base, item.href)
      }))
    });
  }

  if (faqs && faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a }
      }))
    });
  }

  if (items && items.length) {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#rooms`,
      itemListElement: items.slice(0, 20).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(base, item.href)
      }))
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function breadcrumb(items) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items
    .map((item, index) => {
      const last = index === items.length - 1;
      return last
        ? `<li aria-current="page">${escapeXml(item.label)}</li>`
        : `<li><a href="${item.href}">${escapeXml(item.label)}</a></li>`;
    })
    .join("")}</ol></nav>`;
}

function rssFeed(base, rooms) {
  const root = trimBase(base);
  const now = new Date().toUTCString();
  const items = rooms
    .map((room) => {
      const loc = absoluteUrl(root, room.href);
      return `  <item>
    <title>${escapeXml(room.name)} chat room</title>
    <link>${loc}</link>
    <guid>${loc}</guid>
    <description>${escapeXml(`Free ${room.name} online chat room. No registration.`)}</description>
  </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(SITE_NAME)} — ${escapeXml(SITE_TAGLINE)}</title>
  <link>${absoluteUrl(root, "/")}</link>
  <description>Free online chat rooms for India and the world. No signup.</description>
  <language>en</language>
  <lastBuildDate>${now}</lastBuildDate>
${items}
</channel>
</rss>
`;
}

function llmsTxt(base) {
  const root = trimBase(base);
  return [
    "# chat",
    "",
    "> Free online chat rooms. No registration. 18+ only.",
    "",
    `Home: ${absoluteUrl(root, "/")}`,
    `Rooms: ${absoluteUrl(root, "/chat-rooms/")}`,
    `Sitemap: ${absoluteUrl(root, "/sitemap.xml")}`,
    `Feed: ${absoluteUrl(root, "/feed.xml")}`,
    "",
    "Join a city or language room, type a name, and talk live.",
    ""
  ].join("\n");
}

module.exports = {
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  pageTitle,
  sitemapXml,
  robotsTxt,
  webmasterTags,
  indexNowKey,
  homeFaqs,
  jsonLd,
  breadcrumb,
  rssFeed,
  llmsTxt
};
