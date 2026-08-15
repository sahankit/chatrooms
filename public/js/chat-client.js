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
    roomLog: [],
    roomQuery: ""
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

  function unreadTotal() {
    return Object.values(state.unread).reduce((sum, n) => sum + n, 0);
  }

  function updatePeopleBadge() {
    const badge = root.querySelector("[data-people-badge]");
    if (!badge) return;
    const n = unreadTotal();
    badge.hidden = n < 1;
    badge.textContent = String(n);
  }

  function setToolbar() {
    const title = root.querySelector("[data-title]");
    const sub = root.querySelector("[data-sub]");
    const back = root.querySelector("[data-back]");
    const input = root.querySelector(".chat-compose input");
    if (state.dmWith) {
      if (title) title.textContent = state.dmWith;
      if (sub) sub.textContent = "Private · only you two can see this";
      if (back) {
        back.hidden = false;
        back.textContent = `← Back to #${state.roomName}`;
      }
      if (input) input.placeholder = `Message ${state.dmWith}…`;
    } else {
      if (title) title.textContent = `#${state.roomName}`;
      if (sub) sub.textContent = "Public room · tap a name to message privately";
      if (back) back.hidden = true;
      if (input) input.placeholder = "Write a message…";
    }
  }

  function renderJoin() {
    root.innerHTML = "";
    const box = el(`
      <div class="chat-shell">
        <div class="join-box">
          <div class="join-mark">c</div>
          <h2>Join #${escapeHtml(state.roomName)}</h2>
          <p>Type a name and walk in. No signup.</p>
          <p class="join-error" data-error></p>
          <form class="join-form">
            <label>
              <span>Your name</span>
              <input type="text" name="nick" maxlength="24" placeholder="e.g. Ankit" autocomplete="nickname" />
            </label>
            <button type="submit">Join #${escapeHtml(state.roomName)}</button>
            <button type="button" class="guest" data-guest>Continue as guest</button>
          </form>
          <p>18+ only. If that name is taken, try another.</p>
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
    const list = (state.rooms.length
      ? state.rooms.slice()
      : [{ slug: state.room, name: state.roomName, online: state.users.length }]
    )
      .filter((room) => {
        const q = state.roomQuery;
        if (!q) return true;
        return room.name.toLowerCase().includes(q) || room.slug.includes(q);
      })
      .sort((a, b) => {
        if (a.slug === state.room) return -1;
        if (b.slug === state.room) return 1;
        return (b.online || 0) - (a.online || 0);
      });
    if (!list.length) {
      return `<p class="users-hint">No rooms match that search.</p>`;
    }
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
          <div class="toolbar-main">
            <button type="button" class="back-room" data-back hidden>← Back to room</button>
            <div>
              <h1 data-title>#${escapeHtml(state.roomName)}</h1>
              <p class="toolbar-sub" data-sub>Public room · tap a name to message privately</p>
            </div>
          </div>
          <div class="meta"><span data-status class="status-off">connecting…</span> · <b data-me></b> · <span data-count>0</span> here</div>
        </div>
        <div class="chat-tabs" role="tablist">
          <button type="button" class="is-on" data-pane="log">Chat</button>
          ${compact ? "" : `<button type="button" data-pane="rooms">Rooms</button>`}
          <button type="button" data-pane="people">People <span data-people-badge hidden></span></button>
        </div>
        <div class="chat-body">
          ${
            compact
              ? ""
              : `<aside class="chat-rooms">
            <h4>Rooms</h4>
            <label class="sr-only" for="room-filter">Find a room</label>
            <input id="room-filter" class="room-filter" data-room-filter-chat type="search" placeholder="Find a room" />
            <div data-rooms>${roomListHtml()}</div>
          </aside>`
          }
          <div class="chat-log" data-log></div>
          <aside class="chat-users">
            <h4>People here</h4>
            <p class="users-hint">Tap a name to start a private chat.</p>
            <ul data-users></ul>
          </aside>
        </div>
        <form class="chat-compose">
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
      const input = box.querySelector("input[name=text], .chat-compose input");
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
    const roomFilter = box.querySelector("[data-room-filter-chat]");
    if (roomFilter) {
      roomFilter.value = state.roomQuery;
      roomFilter.addEventListener("input", () => {
        state.roomQuery = roomFilter.value.trim().toLowerCase();
        refreshRoomList();
      });
    }
    bindRoomClicks(box);
    setToolbar();
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
    state.dmWith = "";
    localStorage.setItem(roomKey, slug);
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, "", `/${slug}-chat-rooms/`);
    }
    setToolbar();
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
    if (item.type === "pm-nudge") {
      line.className = "msg system pm-nudge";
      line.innerHTML = `<button type="button" data-open-pm="${escapeHtml(item.from)}">${escapeHtml(item.from)} sent a private message — tap to reply</button>`;
      line.querySelector("button").addEventListener("click", () => openPrivate(item.from));
    } else if (item.type === "system" || item.type === "error") {
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
    if (!state.dmWith && !item.private && item.type !== "pm-nudge") state.roomLog.push(item);
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
          return `<li class="${mine ? "me" : "clickable"}${unread}${active}" data-user="${escapeHtml(name)}"><span class="avatar">${initial(name)}</span><span class="user-name">${escapeHtml(name)}${mine ? " · you" : ""}</span>${mine ? "" : `<span class="user-action">${state.unread[name] ? "New" : "Message"}</span>`}${state.unread[name] ? `<em>${state.unread[name]}</em>` : ""}</li>`;
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
    updatePeopleBadge();
  }

  function threadKey(name) {
    return String(name || "").toLowerCase();
  }

  function openPrivate(name) {
    if (!name || name === state.nick) return;
    state.dmWith = name;
    delete state.unread[name];
    setToolbar();
    renderThread();
    setUsers(state.users);
    const app = root.querySelector(".chat-app");
    if (app) {
      app.classList.remove("show-rooms", "show-people");
      app.querySelectorAll("[data-pane]").forEach((item) => item.classList.toggle("is-on", item.dataset.pane === "log"));
    }
    const input = root.querySelector(".chat-compose input");
    if (input) input.focus();
  }

  function openRoomView() {
    state.dmWith = "";
    setToolbar();
    const log = root.querySelector("[data-log]");
    if (log) log.innerHTML = "";
    const replay = state.roomLog.slice();
    state.roomLog = [];
    replay.forEach((item) => addLine(item));
    setUsers(state.users);
    const input = root.querySelector(".chat-compose input");
    if (input) input.focus();
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
      addLine({ type: "pm-nudge", from: data.from });
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

  function focusCompose() {
    const input = root.querySelector(".chat-compose input");
    if (input) input.focus();
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
        if (me) me.textContent = state.nick;
        setToolbar();
        const log = root.querySelector("[data-log]");
        if (log && !state.dmWith) log.innerHTML = "";
        state.roomLog = [];
        setUsers(data.users || []);
        if (!state.dmWith) {
          (data.history || []).forEach((item) => addLine(item));
        }
        addLine({
          type: "system",
          text: `You joined #${state.roomName}. Say hello — everyone here can see it.`,
          time: Date.now()
        });
        focusCompose();
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
