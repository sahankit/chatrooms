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

function pageTitle(name) {
  const label = String(name || SITE_TAGLINE).trim();
  if (label.toLowerCase() === SITE_NAME) return `${SITE_NAME} — ${SITE_TAGLINE}`;
  return `${label} | ${SITE_NAME}`;
}

function sitemapXml(base, rooms) {
  const root = trimBase(base);
  const today = new Date().toISOString().slice(0, 10);
  const staticPaths = [
    "/",
    "/online-chat/",
    "/chat-rooms/",
    "/help/",
    "/pages/privacypolicy/",
    "/pages/safetytips/",
    "/pages/disclaimers/",
    "/contact/",
    "/chat-rooms/asia-chat-rooms/",
    "/chat-rooms/ethiopia-chat-rooms/",
    "/chat-rooms/friendship-chat-rooms/"
  ];
  const roomPaths = rooms.map((room) => room.href);
  const urls = [...new Set([...staticPaths, ...roomPaths])];
  const items = urls
    .map((path) => {
      const loc = absoluteUrl(root, path);
      const priority = path === "/" ? "1.0" : path.includes("-chat-rooms") ? "0.8" : "0.6";
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}

function robotsTxt(base) {
  const root = trimBase(base);
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /search",
    "Disallow: /chatwidget",
    "Disallow: /health",
    "Disallow: /api/",
    "",
    `Sitemap: ${absoluteUrl(root, "/sitemap.xml")}`,
    ""
  ].join("\n");
}

function jsonLd({ base, path, title, description, type }) {
  const url = absoluteUrl(base, path);
  const website = {
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_TAGLINE,
    url: absoluteUrl(base, "/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl(base, "/search")}?s={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
  const page = {
    "@type": type || "WebPage",
    name: title,
    description,
    url,
    isPartOf: { "@id": `${absoluteUrl(base, "/")}#website` },
    inLanguage: "en"
  };
  return {
    "@context": "https://schema.org",
    "@graph": [{ "@id": `${absoluteUrl(base, "/")}#website`, ...website }, page]
  };
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

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = {
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  pageTitle,
  sitemapXml,
  robotsTxt,
  jsonLd,
  breadcrumb
};
