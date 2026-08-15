const http = require("http");
const path = require("path");
const express = require("express");
const { WebSocketServer } = require("ws");
const { getRoom, resolvePath, regions, rooms } = require("./lib/rooms");
const pages = require("./lib/html");
const { attachChat } = require("./lib/chat");
const { sitemapXml, robotsTxt, rssFeed, llmsTxt, indexNowKey } = require("./lib/seo");
const ads = require("./lib/adsense");

const app = express();
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";

app.set("trust proxy", 1);
app.use((req, _res, next) => {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.get("host") || "localhost";
  pages.configure({
    siteUrl: process.env.SITE_URL || `${proto}://${host}`,
    adsenseClient: process.env.ADSENSE_CLIENT || process.env.GOOGLE_ADSENSE_CLIENT,
    adsenseSlotTop: process.env.ADSENSE_SLOT_TOP,
    adsenseSlotBottom: process.env.ADSENSE_SLOT_BOTTOM
  });
  req.siteUrl = process.env.SITE_URL || `${proto}://${host}`;
  next();
});
app.use((req, res, next) => {
  res.set("Content-Language", "en");
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(robotsTxt(req.siteUrl));
});

app.get("/ads.txt", (_req, res) => {
  res.type("text/plain").send(ads.adsTxt());
});

app.get("/sitemap.xml", (req, res) => {
  res.set("Cache-Control", "public, max-age=300");
  res.type("application/xml").send(sitemapXml(req.siteUrl, rooms));
});

app.get("/feed.xml", (req, res) => {
  res.set("Cache-Control", "public, max-age=300");
  res.type("application/rss+xml").send(rssFeed(req.siteUrl, rooms));
});

app.get("/llms.txt", (req, res) => {
  res.type("text/plain").send(llmsTxt(req.siteUrl));
});

app.get("/indexnow-key.txt", (_req, res) => {
  const key = indexNowKey();
  if (!key) {
    res.status(404).type("text/plain").send("INDEXNOW_KEY is not set");
    return;
  }
  res.type("text/plain").send(key);
});

app.get("/", (_req, res) => {
  res.type("html").send(pages.homePage());
});

app.get("/search", (req, res) => {
  res.type("html").send(pages.searchPage(req.query.s || req.query.q || ""));
});

app.get("/api/rooms", (_req, res) => {
  const counts = hub.onlineCounts();
  res.json({
    rooms: rooms.map((room) => ({
      slug: room.slug,
      name: room.name,
      href: room.href,
      group: room.group,
      online: counts[room.slug] || 0
    }))
  });
});

app.get(["/online-chat", "/online-chat/"], (_req, res) => {
  res.type("html").send(pages.lobbyPage());
});

app.get(["/chatwidget", "/chatwidget/"], (_req, res) => {
  res.type("html").send(pages.multiPage());
});

app.get(["/chat-rooms", "/chat-rooms/"], (_req, res) => {
  res.type("html").send(pages.chatRoomsIndex());
});

app.get(["/chat-rooms/feedback", "/chat-rooms/feedback/"], (_req, res) => {
  res.type("html").send(pages.feedbackPage());
});

app.get(["/help", "/help/"], (_req, res) => {
  res.type("html").send(pages.termsPage());
});

app.get(["/pages", "/pages/"], (_req, res) => {
  res.type("html").send(pages.pagesIndex());
});

app.get(
  ["/pages/privacypolicy", "/pages/privacypolicy/", "/privacypolicy", "/privacypolicy/"],
  (_req, res) => {
    res.type("html").send(pages.privacyPage());
  }
);

app.get(["/pages/safetytips", "/pages/safetytips/", "/safetytips", "/safetytips/"], (_req, res) => {
  res.type("html").send(pages.safetyPage());
});

app.get(["/pages/disclaimers", "/pages/disclaimers/"], (_req, res) => {
  res.type("html").send(pages.disclaimerPage());
});

app.get(["/contact", "/contact/"], (_req, res) => {
  res.type("html").send(pages.contactPage());
});

app.get(["/local-chat-rooms", "/local-chat-rooms/"], (_req, res) => {
  res.redirect(301, "/india-chat-rooms/");
});
app.get(["/deutschland-online-chat", "/deutschland-online-chat/"], (_req, res) => {
  res.redirect(301, "/germany-chat-rooms/");
});
app.get(["/worldwide", "/worldwide/"], (_req, res) => {
  res.redirect(301, "/global-chat-rooms/");
});

app.get("/:key.txt", (req, res, next) => {
  const key = indexNowKey();
  if (!key || req.params.key !== key) {
    next();
    return;
  }
  res.type("text/plain").send(key);
});

app.get("*", (req, res) => {
  const resolved = resolvePath(req.path);
  if (resolved && resolved.type === "region" && regions[resolved.slug]) {
    res.type("html").send(pages.regionPage(regions[resolved.slug]));
    return;
  }
  if (resolved && resolved.type === "room") {
    const room = getRoom(resolved.slug);
    if (room) {
      const canonical = room.href;
      const current = req.path.endsWith("/") ? req.path : `${req.path}/`;
      if (req.query.embed !== "1" && current !== canonical) {
        res.redirect(301, canonical);
        return;
      }
      if (req.query.embed === "1") {
        res.type("html").send(pages.embedPage(room));
      } else {
        res.type("html").send(pages.roomPage(room));
      }
      return;
    }
  }
  res.status(404).type("html").send(pages.notFoundPage());
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
const hub = attachChat(wss);

server.listen(port, host, () => {
  console.log(`Chat site running on http://${host}:${port}`);
});
