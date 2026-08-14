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
});
