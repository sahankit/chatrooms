const { test } = require("node:test");
const assert = require("node:assert/strict");
const { shouldResumeSession } = require("../lib/session");
const { ChatHub } = require("../lib/chat");

function fakeSocket() {
  const inbox = [];
  return {
    readyState: 1,
    inbox,
    send(raw) {
      inbox.push(JSON.parse(raw));
    }
  };
}

test("resume after refresh only if the user already had a name and a room", () => {
  assert.equal(shouldResumeSession({ nick: "Ankit", lastRoom: "chennai" }), true);
  assert.equal(shouldResumeSession({ nick: "", lastRoom: "chennai" }), false);
  assert.equal(shouldResumeSession({ nick: "Ankit", lastRoom: "" }), false);
});

test("same session can take the name back after a refresh", () => {
  const hub = new ChatHub();
  const oldSock = fakeSocket();
  const newSock = fakeSocket();
  const oldClient = hub.connect(oldSock);
  const newClient = hub.connect(newSock);

  hub.handle(oldClient, { type: "join", room: "chennai", nick: "Ankit", session: "abc" });
  hub.handle(newClient, { type: "join", room: "chennai", nick: "Ankit", session: "abc" });

  assert.equal(newSock.inbox.some((item) => item.type === "joined"), true);
  assert.equal(newClient.nick, "Ankit");
  assert.equal(oldClient.room, "");
});

test("a different person still cannot steal the name", () => {
  const hub = new ChatHub();
  const a = fakeSocket();
  const b = fakeSocket();
  hub.handle(hub.connect(a), { type: "join", room: "india", nick: "Ankit", session: "one" });
  hub.handle(hub.connect(b), { type: "join", room: "india", nick: "Ankit", session: "two" });
  assert.equal(b.inbox.some((item) => item.type === "error"), true);
  assert.equal(b.inbox.some((item) => item.type === "joined"), false);
});
