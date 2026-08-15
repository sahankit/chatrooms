const ADSENSE_ACCOUNT = "f08c47fec0942fa0";

const state = {
  client: normalizeClient(process.env.ADSENSE_CLIENT || process.env.GOOGLE_ADSENSE_CLIENT),
  slotTop: String(process.env.ADSENSE_SLOT_TOP || "").trim(),
  slotBottom: String(process.env.ADSENSE_SLOT_BOTTOM || "").trim()
};

function normalizeClient(value) {
  const raw = String(value || "").trim();
  if (/^ca-pub-\d+$/.test(raw)) return raw;
  if (/^pub-\d+$/.test(raw)) return `ca-${raw}`;
  return "";
}

function configure(next = {}) {
  if ("client" in next) state.client = normalizeClient(next.client);
  if ("slotTop" in next) state.slotTop = String(next.slotTop || "").trim();
  if ("slotBottom" in next) state.slotBottom = String(next.slotBottom || "").trim();
}

function clientId() {
  return state.client;
}

function publisherId() {
  return state.client.replace(/^ca-/, "");
}

function headTags() {
  const id = clientId();
  if (!id) return "";
  return `<meta name="google-adsense-account" content="${id}" />
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${id}" crossorigin="anonymous"></script>`;
}

function unit(slot, label) {
  const id = clientId();
  if (!id || !slot) return "";
  return `<aside class="ad-slot" aria-label="${label}">
<ins class="adsbygoogle"
  style="display:block"
  data-ad-client="${id}"
  data-ad-slot="${slot}"
  data-ad-format="auto"
  data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</aside>`;
}

function topAd() {
  return unit(state.slotTop, "Advertisement");
}

function bottomAd() {
  return unit(state.slotBottom, "Advertisement");
}

function adsTxt() {
  const pub = publisherId();
  if (!pub) return "# Set ADSENSE_CLIENT (ca-pub-XXXXXXXX) to publish ads.txt\n";
  return `google.com, ${pub}, DIRECT, ${ADSENSE_ACCOUNT}\n`;
}

module.exports = {
  configure,
  clientId,
  headTags,
  topAd,
  bottomAd,
  adsTxt
};
