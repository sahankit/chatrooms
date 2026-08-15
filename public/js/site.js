document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  document.querySelectorAll(".mainnav a").forEach((link) => {
    const href = (link.getAttribute("href") || "/").replace(/\/+$/, "") || "/";
    if (href === path) {
      link.parentElement.classList.add("current");
    }
  });

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".mainnav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });
  }

  const start = document.querySelector("[data-start]");
  if (start) {
    const nick = start.querySelector("[name=nick]");
    const saved = localStorage.getItem("chatkaro.nick");
    if (saved && nick) nick.value = saved;
    const savedRoom = localStorage.getItem("chatkaro.room");
    const roomSelect = start.querySelector("[name=room]");
    if (savedRoom && roomSelect && [...roomSelect.options].some((opt) => opt.value === savedRoom)) {
      roomSelect.value = savedRoom;
    }

    function go(name, room) {
      if (!name || name.length < 2) {
        if (nick) nick.focus();
        return;
      }
      localStorage.setItem("chatkaro.nick", name);
      localStorage.setItem("chatkaro.room", room);
      window.location.href = `/${room}-chat-rooms/`;
    }

    start.addEventListener("submit", (event) => {
      event.preventDefault();
      go((nick && nick.value.trim()) || "", start.room.value);
    });
    const guest = start.querySelector("[data-guest]");
    if (guest) {
      guest.addEventListener("click", () => {
        go(`Guest${Math.floor(1000 + Math.random() * 9000)}`, start.room.value);
      });
    }
  }

  const grid = document.querySelector("[data-room-grid]");
  const filter = document.querySelector("[data-room-filter]");
  const tabs = document.querySelector("[data-room-tabs]");
  if (grid) {
    let tab = "popular";
    function applyFinder() {
      const q = (filter && filter.value ? filter.value : "").toLowerCase().trim();
      grid.querySelectorAll(".room-card").forEach((card) => {
        const group = card.dataset.group || "";
        const name = (card.dataset.name || "").toLowerCase();
        const popular = card.dataset.popular === "1";
        const matchTab =
          tab === "all" ||
          (tab === "popular" && popular) ||
          (tab !== "popular" && tab !== "all" && group === tab);
        const matchQuery = !q || name.includes(q) || (card.getAttribute("href") || "").includes(q);
        card.hidden = !(matchTab && matchQuery);
      });
    }
    if (tabs) {
      tabs.querySelectorAll("[data-tab]").forEach((button) => {
        button.addEventListener("click", () => {
          tab = button.dataset.tab;
          tabs.querySelectorAll("[data-tab]").forEach((item) => item.classList.toggle("is-on", item === button));
          applyFinder();
        });
      });
    }
    if (filter) filter.addEventListener("input", applyFinder);
    applyFinder();
  }
});
