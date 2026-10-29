(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  // The title sharpens into focus once the page is painted.
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add("is-on"); }); });

  /* ---------- Reveals: text rises in, pictures open with a curtain ---------- */

  var revealables = document.querySelectorAll("[data-reveal], [data-curtain]");
  if (reduce || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); revealer.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------- Reading progress and the "On this page" index ---------- */

  var bar = document.querySelector("[data-progress]");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ")";
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var tocLinks = {};
  document.querySelectorAll(".case-toc a").forEach(function (a) { tocLinks[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window && Object.keys(tocLinks).length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(tocLinks).forEach(function (k) { tocLinks[k].removeAttribute("aria-current"); });
        var link = tocLinks[e.target.id];
        if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    Object.keys(tocLinks).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* ---------- Fresha readout ---------- */

  var STATES = [
    { state: "safe", pct: 97, text: "Safe to eat · points earned" },
    { state: "unsure", pct: 48, text: "Can’t guarantee it · use your judgement" },
    { state: "bad", pct: 14, text: "Highly likely contaminated" }
  ];
  document.querySelectorAll("[data-readout]").forEach(function (el) {
    var value = el.querySelector(".readout__value"), caption = el.querySelector(".readout__caption");
    var i = 0, timer = 0;
    function show(s) { el.dataset.state = s.state; el.style.setProperty("--pct", s.pct); value.textContent = s.pct + "%"; caption.textContent = s.text; }
    show(STATES[0]);
    if (reduce || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (e) {
      clearInterval(timer);
      if (e[0].isIntersecting) timer = setInterval(function () { i = (i + 1) % STATES.length; show(STATES[i]); }, 2600);
    }).observe(el);
  });

  /* ---------- Signature and London time, as on the home page ---------- */

  var fitEl = document.querySelector("[data-fit]");
  if (fitEl) {
    var fitName = function () {
      var box = fitEl.parentElement, cs = getComputedStyle(box);
      var room = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      box.style.fontSize = "100px";
      var w = fitEl.getBoundingClientRect().width;
      if (w) box.style.fontSize = (100 * room / w).toFixed(2) + "px";
    };
    fitName();
    window.addEventListener("resize", fitName);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);
  }
  var clock = document.querySelector("[data-clock]");
  if (clock && window.Intl) {
    var fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });
    var tick = function () { clock.textContent = fmt.format(new Date()); clock.setAttribute("datetime", new Date().toISOString()); };
    tick();
    window.setInterval(tick, 30000);
  }
})();
