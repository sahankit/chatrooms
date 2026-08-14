const { test } = require("node:test");
const assert = require("node:assert/strict");
const { validNick, guestNick } = require("../lib/nick");

test("allows everyday names with spaces", () => {
  assert.equal(validNick("Ankit Sah"), true);
  assert.equal(validNick("Priya"), true);
  assert.equal(validNick("A"), false);
  assert.equal(validNick(""), false);
});

test("guest nick is a usable chat name", () => {
  assert.equal(validNick(guestNick()), true);
});
