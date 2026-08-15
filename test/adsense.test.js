const { test } = require("node:test");
const assert = require("node:assert/strict");
const ads = require("../lib/adsense");
const pages = require("../lib/html");

test("AdSense tags stay off until a publisher id is set", () => {
  ads.configure({ client: "", slotTop: "", slotBottom: "" });
  assert.equal(ads.headTags(), "");
  assert.equal(ads.topAd(), "");
  assert.equal(ads.adsTxt().startsWith("#"), true);
});

test("valid publisher id adds the AdSense script and ads.txt line", () => {
  ads.configure({ client: "ca-pub-1234567890123456", slotTop: "1111111111", slotBottom: "" });
  const head = ads.headTags();
  assert.match(head, /google-adsense-account/);
  assert.match(head, /ca-pub-1234567890123456/);
  assert.match(head, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
  assert.match(ads.topAd(), /data-ad-slot="1111111111"/);
  assert.equal(ads.bottomAd(), "");
  assert.match(ads.adsTxt(), /google\.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0/);
});

test("pages include AdSense only after configure", () => {
  ads.configure({ client: "ca-pub-1234567890123456" });
  const html = pages.homePage();
  assert.match(html, /adsbygoogle\.js\?client=ca-pub-1234567890123456/);
  assert.match(pages.privacyPage(), /Google AdSense/);
  ads.configure({ client: "" });
  assert.doesNotMatch(pages.homePage(), /adsbygoogle\.js/);
});
