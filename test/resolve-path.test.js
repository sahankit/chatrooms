const { test } = require("node:test");
const assert = require("node:assert/strict");
const { resolvePath } = require("../lib/rooms");

test("india/tamil/usa chat-room URLs open the room, not a directory", () => {
  assert.deepEqual(resolvePath("/india-chat-rooms"), { type: "room", slug: "india" });
  assert.deepEqual(resolvePath("/india-chat-rooms/"), { type: "room", slug: "india" });
  assert.deepEqual(resolvePath("/tamil-chat-rooms"), { type: "room", slug: "tamil" });
  assert.deepEqual(resolvePath("/usa-chat-rooms"), { type: "room", slug: "usa" });
});

test("short nav paths still open a live room", () => {
  assert.deepEqual(resolvePath("/kerala"), { type: "room", slug: "kerala" });
  assert.deepEqual(resolvePath("/chennai"), { type: "room", slug: "chennai" });
  assert.deepEqual(resolvePath("/telugu"), { type: "room", slug: "telugu" });
});
