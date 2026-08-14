(function () {
  const root = document.getElementById("chat-app");
  if (!root) return;

  const startRoom = root.dataset.room || "general";
  const startName = root.dataset.roomName || startRoom;
  const compact = root.dataset.compact === "true";
  const storageKey = "chatkaro.nick";
  const roomKey = "chatkaro.room";
  const sessionKey = "chatkaro.session";

  function sessionId() {
    let id = localStorage.getItem(sessionKey);
    if (!id) {
      id = `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(sessionKey, id);
    }
    return id;
  }

  const state = {
    nick: localStorage.getItem(storageKey) || "",
    room: startRoom,
    roomName: startName,
    ws: null,
    users: [],
    rooms: [],
    joined: false,
    box: null,
    dmWith: "",
    threads: {},
    unread: {},
    roomLog: []
  };

  function el(html) {
    const wrap = document.createElement("div");
    wrap.innerHTML = html.trim();
    return wrap.firstElementChild;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function clock(ts) {
    const d = ts ? new Date(ts) : new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function guestNick() {
    return `Guest${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function showJoinError(text) {
    const err = root.querySelector("[data-error]");
    if (err) err.textContent = text;
  }

  function renderJoin() {
    root.innerHTML = "";
    const box = el(`
      <div class="chat-shell">
        <div class="chat-toolbar">
          <h1>Enter #${escapeHtml(state.roomName)}</h1>
        </div>
        <div class="join-box">
          <div class="join-mark">c</div>
          <p>Pick a unique name and walk in. No signup. If someone already has that name, try another.</p>
          <p class="join-error" data-error></p>
          <form class="join-form">
            <input type="text" name="nick" maxlength="24" placeholder="Your name" autocomplete="nickname" />
            <button type="submit">Enter room</button>
            <button type="button" class="guest" data-guest>Enter as guest</button>
          </form>
          <p>18+ only. By joining you agree to the <a href="/pages/disclaimers/">disclaimers</a>.</p>
        </div>
      </div>
    `);
    const input = box.querySelector("input");
    input.value = state.nick;
    box.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      enter(input.value.trim());
    });
    box.querySelector("[data-guest]").addEventListener("click", () => enter(guestNick()));
    root.appendChild(box);
    input.focus();
  }

  function enter(nick) {
    if (nick.length < 2) {
      showJoinError("Please type a name with at least 2 characters.");
      return;
    }
    state.nick = nick;
    localStorage.setItem(storageKey, nick);
    localStorage.setItem(roomKey, state.room);
    connect();
  }

  function roomListHtml() {
    const list = state.rooms.length
      ? state.rooms
      : [{ slug: state.room, name: state.roomName, online: state.users.length }];
    return list
      .map((room) => {
        const current = room.slug === state.room ? " current-room" : "";
        return `<a class="room-nav${current}" href="/${room.slug}-chat-rooms/" data-room="${escapeHtml(room.slug)}" data-name="${escapeHtml(room.name)}">#${escapeHtml(room.name)} <span>${room.online || 0}</span></a>`;
      })
      .join("");
  }

  function renderChat() {
    root.innerHTML = "";
    const box = el(`
      <div class="chat-shell chat-app${compact ? " compact" : ""}">
        <div class="chat-toolbar">
          <h1 data-title>#${escapeHtml(state.roomName)}</h1>
          <div class="meta"><span data-status class="status-off">connecting…</span> · <b data-me></b> · <span data-count>0</span> here</div>
        </div>
        <div class="chat-tabs" role="tablist">
          <button type="button" class="is-on" data-pane="log">Chat</button>
          ${compact ? "" : `<button type="button" data-pane="rooms">Rooms</button>`}
          <button type="button" data-pane="people">People</button>
        </div>
        <div class="chat-body">
          ${compact ? "" : `<aside class="chat-rooms"><h4>Chat rooms</h4><div data-rooms>${roomListHtml()}</div></aside>`}
          <div class="chat-log" data-log></div>
          <aside class="chat-users">
            <h4>In this room</h4>
            <p class="users-hint">Click a name to chat privately. Room messages stay public.</p>
            <ul data-users></ul>
          </aside>
        </div>
        <form class="chat-compose">
          <button type="button" class="back-room" data-back hidden>Room</button>
          <input type="text" name="text" maxlength="400" placeholder="Write a message…" autocomplete="off" />
          <button type="submit">Send</button>
        </form>
      </div>
    `);
    root.appendChild(box);
    state.box = box;
    box.querySelector("[data-me]").textContent = state.nick;
    box.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      const input = box.querySelector("input");
      const text = input.value.trim();
      if (!text) return;
      if (text === "/clear") {
        box.querySelector("[data-log]").innerHTML = "";
        input.value = "";
        return;
      }
      if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
        addLine({ type: "system", text: "Not connected. Trying again…", time: Date.now() });
        connect();
        return;
      }
      if (state.dmWith) {
        state.ws.send(JSON.stringify({ type: "pm", to: state.dmWith, text }));
      } else {
        state.ws.send(JSON.stringify({ type: "message", text }));
      }
      input.value = "";
    });
    box.querySelector("[data-back]").addEventListener("click", () => openRoomView());
    box.querySelectorAll("[data-pane]").forEach((button) => {
      button.addEventListener("click", () => {
        box.classList.remove("show-rooms", "show-people");
        if (button.dataset.pane === "rooms") box.classList.add("show-rooms");
        if (button.dataset.pane === "people") box.classList.add("show-people");
        box.querySelectorAll("[data-pane]").forEach((item) => item.classList.toggle("is-on", item === button));
      });
    });
    bindRoomClicks(box);
    return box;
  }

  function bindRoomClicks(box) {
    box.querySelectorAll("[data-room]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        switchRoom(link.dataset.room, link.dataset.name);
      });
    });
  }

  function switchRoom(slug, name) {
    if (!slug || slug === state.room) return;
    state.room = slug;
    state.roomName = name || slug;
    const title = root.querySelector("[data-title]");
    if (title) title.textContent = `#${state.roomName}`;
    const log = root.querySelector("[data-log]");
    if (log) log.innerHTML = "";
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify({ type: "join", room: state.room, nick: state.nick, session: sessionId() }));
    } else {
      connect();
    }
    refreshRoomList();
  }

  function initial(name) {
    return escapeHtml(String(name || "?").trim().charAt(0).toUpperCase() || "?");
  }

  function addLine(item) {
    const log = root.querySelector("[data-log]");
    if (!log) return;
    const line = document.createElement("div");
    if (item.type === "system" || item.type === "error") {
      line.className = "msg system";
      line.textContent = item.text;
    } else {
      line.className = "msg" + (item.nick === state.nick ? " me" : "");
      line.innerHTML = `<span class="avatar">${initial(item.nick)}</span><div class="msg-body"><div class="msg-head"><button type="button" class="nick" data-user="${escapeHtml(item.nick)}">${escapeHtml(item.nick)}</button><span class="time">${clock(item.time)}</span></div><div class="msg-text">${escapeHtml(item.text)}</div></div>`;
      const nameBtn = line.querySelector("[data-user]");
      if (nameBtn && item.nick !== state.nick) {
        nameBtn.addEventListener("click", () => openPrivate(item.nick));
      }
    }
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
    if (!state.dmWith && !item.private) state.roomLog.push(item);
  }

  function setUsers(users) {
    state.users = users;
    const count = root.querySelector("[data-count]");
    if (count) count.textContent = String(users.length);
    const list = root.querySelector("[data-users]");
    if (list) {
      list.innerHTML = users
        .map((name) => {
          const mine = name === state.nick;
          const unread = state.unread[name] ? ` unread` : "";
          const active = state.dmWith === name ? " active-dm" : "";
          return `<li class="${mine ? "me" : "clickable"}${unread}${active}" data-user="${escapeHtml(name)}"><span class="avatar">${initial(name)}</span>${escapeHtml(name)}${mine ? " · you" : ""}${state.unread[name] ? `<em>${state.unread[name]}</em>` : ""}</li>`;
        })
        .join("");
      list.querySelectorAll("[data-user]").forEach((item) => {
        if (item.classList.contains("me")) return;
        item.addEventListener("click", () => openPrivate(item.dataset.user));
      });
    }
    const current = state.rooms.find((room) => room.slug === state.room);
    if (current) current.online = users.length;
    refreshRoomList();
  }

  function threadKey(name) {
    return String(name || "").toLowerCase();
  }

  function openPrivate(name) {
    if (!name || name === state.nick) return;
    state.dmWith = name;
    delete state.unread[name];
    const title = root.querySelector("[data-title]");
    const back = root.querySelector("[data-back]");
    const input = root.querySelector(".chat-compose input");
    if (title) title.textContent = `Private · ${name}`;
    if (back) back.hidden = false;
    if (input) input.placeholder = `Message ${name}…`;
    renderThread();
    setUsers(state.users);
    const app = root.querySelector(".chat-app");
    if (app) {
      app.classList.remove("show-rooms", "show-people");
      app.querySelectorAll("[data-pane]").forEach((item) => item.classList.toggle("is-on", item.dataset.pane === "log"));
    }
  }

  function openRoomView() {
    state.dmWith = "";
    const title = root.querySelector("[data-title]");
    const back = root.querySelector("[data-back]");
    const input = root.querySelector(".chat-compose input");
    if (title) title.textContent = `#${state.roomName}`;
    if (back) back.hidden = true;
    if (input) input.placeholder = "Write a message to the room…";
    const log = root.querySelector("[data-log]");
    if (log) log.innerHTML = "";
    const replay = state.roomLog.slice();
    state.roomLog = [];
    replay.forEach((item) => addLine(item));
    setUsers(state.users);
  }

  function renderThread() {
    const log = root.querySelector("[data-log]");
    if (!log) return;
    log.innerHTML = "";
    const items = state.threads[threadKey(state.dmWith)] || [];
    if (!items.length) {
      addLine({ type: "system", text: `Private chat with ${state.dmWith}. Only the two of you can see this.` });
    }
    items.forEach((item) => addLine(item));
  }

  function receivePm(data) {
    const other = data.from === state.nick ? data.to : data.from;
    const key = threadKey(other);
    if (!state.threads[key]) state.threads[key] = [];
    const item = { type: "message", nick: data.from, text: data.text, time: data.time, private: true };
    state.threads[key].push(item);
    if (state.dmWith && threadKey(state.dmWith) === key) {
      addLine(item);
      return;
    }
    state.unread[other] = (state.unread[other] || 0) + 1;
    setUsers(state.users);
    if (!state.dmWith) {
      addLine({ type: "system", text: `${data.from} sent you a private message. Click their name to reply.` });
    }
  }

  function refreshRoomList() {
    const hold = root.querySelector("[data-rooms]");
    if (!hold) return;
    hold.innerHTML = roomListHtml();
    bindRoomClicks(root);
  }

  async function loadRooms() {
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      state.rooms = data.rooms || [];
      refreshRoomList();
    } catch {
      state.rooms = [];
    }
  }

  function connect() {
    if (state.ws) {
      state.ws.onclose = null;
      state.ws.close();
    }
    const box = state.box && root.contains(state.box) ? state.box : renderChat();
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${location.host}/ws`);
    state.ws = ws;

    ws.addEventListener("open", () => {
      const status = box.querySelector("[data-status]");
      if (status) {
        status.textContent = "live";
        status.className = "status-ok";
      }
      ws.send(JSON.stringify({ type: "join", room: state.room, nick: state.nick, session: sessionId() }));
    });

    ws.addEventListener("message", (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (data.type === "error") {
        if (!state.joined) {
          renderJoin();
          showJoinError(data.text);
          return;
        }
        addLine({ type: "system", text: data.text, time: Date.now() });
        return;
      }
      if (data.type === "joined") {
        state.joined = true;
        state.nick = data.nick;
        state.room = data.room || state.room;
        state.roomName = data.roomName || state.roomName;
        localStorage.setItem(storageKey, state.nick);
        localStorage.setItem(roomKey, state.room);
        const me = root.querySelector("[data-me]");
        const title = root.querySelector("[data-title]");
        if (me) me.textContent = state.nick;
        if (title) title.textContent = state.dmWith ? `Private · ${state.dmWith}` : `#${state.roomName}`;
        const log = root.querySelector("[data-log]");
        if (log && !state.dmWith) log.innerHTML = "";
        state.roomLog = [];
        setUsers(data.users || []);
        if (!state.dmWith) {
          (data.history || []).forEach((item) => addLine(item));
        }
        addLine({
          type: "system",
          text: `You joined #${state.roomName}. Anyone else in this room can see your messages.`,
          time: Date.now()
        });
        return;
      }
      if (data.type === "users") {
        setUsers(data.users || []);
        return;
      }
      if (data.type === "pm") {
        receivePm(data);
        return;
      }
      if (data.type === "message" || data.type === "system") {
        if (state.dmWith) return;
        addLine(data);
      }
    });

    ws.addEventListener("close", () => {
      const status = box.querySelector("[data-status]");
      if (status) {
        status.textContent = "reconnecting…";
        status.className = "status-off";
      }
      if (state.nick) {
        setTimeout(() => {
          if (state.ws === ws) connect();
        }, 1200);
      }
    });

    ws.addEventListener("error", () => {
      ws.close();
    });
  }

  loadRooms();
  setInterval(loadRooms, 8000);

  const lastRoom = localStorage.getItem(roomKey) || "";
  if (state.nick) {
    localStorage.setItem(roomKey, lastRoom || startRoom);
    connect();
  } else {
    renderJoin();
  }

  window.addEventListener("pagehide", () => {
    if (state.ws) {
      state.ws.onclose = null;
      state.ws.close();
    }
  });
})();
