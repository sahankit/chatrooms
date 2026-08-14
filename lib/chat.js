const { getRoom } = require("./rooms");
const { validNick } = require("./nick");

const HISTORY_LIMIT = 80;
const MAX_MESSAGE = 400;
const RATE_WINDOW_MS = 10000;
const RATE_MAX = 8;

class ChatHub {
  constructor() {
    this.rooms = new Map();
  }

  roomState(slug) {
    if (!this.rooms.has(slug)) {
      this.rooms.set(slug, { clients: new Set(), history: [] });
    }
    return this.rooms.get(slug);
  }

  usersIn(state) {
    return [...state.clients].map((client) => client.nick).filter(Boolean);
  }

  findByNick(nick) {
    const want = String(nick || "").trim().toLowerCase();
    if (!want) return null;
    for (const state of this.rooms.values()) {
      for (const other of state.clients) {
        if (other.nick && other.nick.toLowerCase() === want) return other;
      }
    }
    return null;
  }

  isNickTaken(nick, except) {
    const want = String(nick).trim().toLowerCase();
    for (const state of this.rooms.values()) {
      for (const other of state.clients) {
        if (other !== except && other.nick && other.nick.toLowerCase() === want) {
          return true;
        }
      }
    }
    return false;
  }

  send(socket, payload) {
    if (socket && socket.readyState === 1) {
      socket.send(JSON.stringify(payload));
    }
  }

  broadcast(state, payload, except) {
    for (const client of state.clients) {
      if (client !== except) this.send(client.socket, payload);
    }
  }

  connect(socket) {
    return { socket, nick: "", room: "", times: [] };
  }

  handle(client, data) {
    if (!data || typeof data !== "object") return;

    if (data.type === "join") {
      const room = getRoom(String(data.room || ""));
      const nick = String(data.nick || "").trim();
      if (!room) {
        this.send(client.socket, { type: "error", text: "Unknown room." });
        return;
      }
      if (!validNick(nick)) {
        this.send(client.socket, {
          type: "error",
          text: "Nickname must be 2–24 letters or numbers. Spaces are ok."
        });
        return;
      }
      client.session = String(data.session || "").slice(0, 80);
      const existing = this.findByNick(nick);
      if (existing && existing !== client) {
        const sameSession = client.session && existing.session && existing.session === client.session;
        if (sameSession) {
          this.disconnect(existing);
        } else {
          this.send(client.socket, {
            type: "error",
            text: "That name is already on the site. Pick another."
          });
          return;
        }
      }
      if (client.room) this.leave(client, { silent: false });
      const state = this.roomState(room.slug);
      client.nick = nick.slice(0, 24);
      client.room = room.slug;
      state.clients.add(client);
      this.send(client.socket, {
        type: "joined",
        nick: client.nick,
        room: room.slug,
        roomName: room.name,
        users: this.usersIn(state),
        history: state.history
      });
      const system = { type: "system", text: `${client.nick} joined the room.`, time: Date.now() };
      state.history.push(system);
      if (state.history.length > HISTORY_LIMIT) state.history.shift();
      this.broadcast(state, system, client);
      this.broadcast(state, { type: "users", users: this.usersIn(state) });
      return;
    }

    if (data.type === "message") {
      if (!client.room || !client.nick) {
        this.send(client.socket, { type: "error", text: "Join a room first." });
        return;
      }
      const text = String(data.text || "").trim().slice(0, MAX_MESSAGE);
      if (!text) return;
      const now = Date.now();
      client.times = client.times.filter((t) => now - t < RATE_WINDOW_MS);
      if (client.times.length >= RATE_MAX) {
        this.send(client.socket, { type: "error", text: "Slow down — no flooding." });
        return;
      }
      client.times.push(now);
      const state = this.roomState(client.room);
      const message = { type: "message", nick: client.nick, text, time: now };
      state.history.push(message);
      if (state.history.length > HISTORY_LIMIT) state.history.shift();
      this.send(client.socket, message);
      this.broadcast(state, message, client);
      return;
    }

    if (data.type === "pm") {
      if (!client.nick) {
        this.send(client.socket, { type: "error", text: "Join a room first." });
        return;
      }
      const to = String(data.to || "").trim();
      const text = String(data.text || "").trim().slice(0, MAX_MESSAGE);
      if (!text) return;
      if (to.toLowerCase() === client.nick.toLowerCase()) {
        this.send(client.socket, { type: "error", text: "You cannot message yourself." });
        return;
      }
      const target = this.findByNick(to);
      if (!target) {
        this.send(client.socket, { type: "error", text: `${to || "That person"} is not online.` });
        return;
      }
      const now = Date.now();
      client.times = client.times.filter((t) => now - t < RATE_WINDOW_MS);
      if (client.times.length >= RATE_MAX) {
        this.send(client.socket, { type: "error", text: "Slow down — no flooding." });
        return;
      }
      client.times.push(now);
      const payload = { type: "pm", from: client.nick, to: target.nick, text, time: now };
      this.send(client.socket, payload);
      this.send(target.socket, payload);
    }
  }

  leave(client, { silent } = {}) {
    if (!client.room) return;
    const state = this.rooms.get(client.room);
    if (!state) return;
    state.clients.delete(client);
    if (client.nick && !silent) {
      const system = { type: "system", text: `${client.nick} left the room.`, time: Date.now() };
      state.history.push(system);
      if (state.history.length > HISTORY_LIMIT) state.history.shift();
      this.broadcast(state, system);
      this.broadcast(state, { type: "users", users: this.usersIn(state) });
    }
    client.room = "";
  }

  disconnect(client) {
    this.leave(client);
  }

  onlineCounts() {
    const counts = {};
    for (const [slug, state] of this.rooms) {
      counts[slug] = state.clients.size;
    }
    return counts;
  }
}

function attachChat(wss) {
  const hub = new ChatHub();
  wss.on("connection", (socket) => {
    const client = hub.connect(socket);
    socket.on("message", (raw) => {
      let data;
      try {
        data = JSON.parse(String(raw));
      } catch {
        return;
      }
      hub.handle(client, data);
    });
    socket.on("close", () => hub.disconnect(client));
  });
  return hub;
}

module.exports = { ChatHub, attachChat };
