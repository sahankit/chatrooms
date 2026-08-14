function shouldResumeSession({ nick, lastRoom }) {
  return Boolean(String(nick || "").trim() && String(lastRoom || "").trim());
}

module.exports = { shouldResumeSession };
