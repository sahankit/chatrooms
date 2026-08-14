const { test } = require("node:test");
const assert = require("node:assert/strict");
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

test("two people in the same room see each other's messages", () => {
  const hub = new ChatHub();
  const a = fakeSocket();
  const b = fakeSocket();
  const alice = hub.connect(a);
  const bob = hub.connect(b);

  hub.handle(alice, { type: "join", room: "chennai", nick: "Ankit Sah" });
  hub.handle(bob, { type: "join", room: "chennai", nick: "Priya" });
  hub.handle(alice, { type: "message", text: "hello priya" });

  const bobMessages = b.inbox.filter((item) => item.type === "message");
  assert.equal(bobMessages.length, 1);
  assert.equal(bobMessages[0].nick, "Ankit Sah");
  assert.equal(bobMessages[0].text, "hello priya");

  const aliceJoined = a.inbox.find((item) => item.type === "joined");
  assert.ok(aliceJoined.users.includes("Ankit Sah"));
});

test("rejects a name that is already on the site", () => {
  const hub = new ChatHub();
  const a = fakeSocket();
  const b = fakeSocket();
  const first = hub.connect(a);
  const second = hub.connect(b);

  hub.handle(first, { type: "join", room: "india", nick: "Ankit" });
  hub.handle(second, { type: "join", room: "tamil", nick: "ankit" });

  assert.equal(
    b.inbox.some((item) => item.type === "error" && /already/i.test(item.text)),
    true
  );
  assert.equal(
    b.inbox.some((item) => item.type === "joined"),
    false
  );
  assert.equal(second.room, "");
});

test("same person can keep their name when switching rooms", () => {
  const hub = new ChatHub();
  const a = fakeSocket();
  const client = hub.connect(a);

  hub.handle(client, { type: "join", room: "india", nick: "Ankit" });
  hub.handle(client, { type: "join", room: "tamil", nick: "Ankit" });

  const joined = a.inbox.filter((item) => item.type === "joined");
  assert.equal(joined.at(-1).room, "tamil");
  assert.equal(joined.at(-1).nick, "Ankit");
});

test("private message is only seen by the two people", () => {
  const hub = new ChatHub();
  const a = fakeSocket();
  const b = fakeSocket();
  const c = fakeSocket();
  const ankit = hub.connect(a);
  const priya = hub.connect(b);
  const ravi = hub.connect(c);

  hub.handle(ankit, { type: "join", room: "chennai", nick: "Ankit" });
  hub.handle(priya, { type: "join", room: "chennai", nick: "Priya" });
  hub.handle(ravi, { type: "join", room: "chennai", nick: "Ravi" });
  hub.handle(ankit, { type: "pm", to: "Priya", text: "hi only you" });

  const priyaPm = b.inbox.filter((item) => item.type === "pm");
  const ankitPm = a.inbox.filter((item) => item.type === "pm");
  const raviPm = c.inbox.filter((item) => item.type === "pm");
  assert.equal(priyaPm.length, 1);
  assert.equal(priyaPm[0].from, "Ankit");
  assert.equal(priyaPm[0].to, "Priya");
  assert.equal(priyaPm[0].text, "hi only you");
  assert.equal(ankitPm.length, 1);
  assert.equal(raviPm.length, 0);
});

test("cannot send a private message to yourself or a missing name", () => {
  const hub = new ChatHub();
  const a = fakeSocket();
  const ankit = hub.connect(a);
  hub.handle(ankit, { type: "join", room: "india", nick: "Ankit" });
  hub.handle(ankit, { type: "pm", to: "Ankit", text: "hello me" });
  hub.handle(ankit, { type: "pm", to: "Nobody", text: "hello" });
  const errors = a.inbox.filter((item) => item.type === "error").map((item) => item.text);
  assert.equal(errors.some((text) => /yourself/i.test(text)), true);
  assert.equal(errors.some((text) => /not online/i.test(text)), true);
});
