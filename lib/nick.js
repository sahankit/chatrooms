function validNick(nick) {
  return /^[\p{L}\p{N} _.\-]{2,24}$/u.test(String(nick || "").trim());
}

function guestNick() {
  return `Guest${Math.floor(1000 + Math.random() * 9000)}`;
}

module.exports = { validNick, guestNick };
