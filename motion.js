(function () {
  "use strict";

  // Shared motion for every page: weighted wheel scrolling, layered depth on scroll,
  // and the signature that writes itself at the foot of the page.
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  var root = document.documentElement;

  /* ---------- Weighted scrolling ---------- */

  // Wheels and trackpads ease towards where they were sent instead of jumping; touch, keys,
  // the scrollbar and anchor links stay native. Same idea as Lenis, without the dependency.
  var target = window.scrollY, current = target, running = false, last = 0;
  var EASE = 0.11; // share of the remaining distance covered per 60 fps frame

  function maxScroll() { return root.scrollHeight - window.innerHeight; }

  // Let elements that scroll on their own (sheets, the arc stage) keep the wheel.
  function scrollsItself(el, dx, dy) {
    for (; el && el !== document.body; el = el.parentElement) {
      if (el.hasAttribute && el.hasAttribute("data-wheel-native")) return true;
      var cs = getComputedStyle(el);
      if (Math.abs(dx) > Math.abs(dy)) {
        if (/(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth) return true;
      } else if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight) {
        if ((dy < 0 && el.scrollTop > 0) || (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight)) return true;
      }
    }
    return false;
  }

  function step(now) {
    if (!running) { last = 0; return; }
    var dt = last ? Math.min(64, now - last) : 16.7;
    last = now;
    current += (target - current) * (1 - Math.pow(1 - EASE, dt / 16.7));
    if (Math.abs(target - current) < 0.5) current = target;
    window.scrollTo({ top: current, behavior: "instant" });
    if (current !== target) requestAnimationFrame(step);
    else { running = false; last = 0; }
  }

  window.addEventListener("wheel", function (e) {
    if (e.ctrlKey || e.defaultPrevented || scrollsItself(e.target, e.deltaX, e.deltaY)) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (!running) target = current = window.scrollY;
    var unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
    target = Math.max(0, Math.min(maxScroll(), target + e.deltaY * unit));
    if (!running) { running = true; requestAnimationFrame(step); }
  }, { passive: false });

  // Anything else that moves the page (keys, scrollbar, anchors, find) cancels the glide.
  window.addEventListener("scroll", function () {
    if (running && Math.abs(window.scrollY - current) < 2) return;
    running = false;
    target = current = window.scrollY;
  }, { passive: true });

  /* ---------- Layered depth ---------- */

  // Each layer drifts against the scroll at its own rate, so stacked images part like a collage.
  // `translate` is used so it never fights the reveal transforms.
  var LAYERS = [
    [".compose__inset, .compose__device", 0.16],
    [".concept:nth-child(1)", 0.05], [".concept:nth-child(2)", -0.06], [".concept:nth-child(3)", 0.09],
    [".more .item:nth-child(1)", 0.04], [".more .item:nth-child(2)", -0.05],
    [".about__portrait .frame", -0.07]
  ];
  var layers = [];
  LAYERS.forEach(function (l) {
    document.querySelectorAll(l[0]).forEach(function (el) { layers.push({ el: el, depth: l[1], mid: 0, y: 0 }); });
  });
  var narrow = window.matchMedia("(max-width: 760px)");

  // Resting position of each layer, with its current drift taken back out.
  function measureLayers() {
    layers.forEach(function (l) {
      var r = l.el.getBoundingClientRect();
      l.mid = r.top + window.scrollY + r.height / 2 - l.y;
    });
    placeLayers();
  }
  function placeLayers() {
    var mid = window.scrollY + window.innerHeight / 2, scale = narrow.matches ? 0.5 : 1;
    layers.forEach(function (l) {
      var d = l.mid - mid;
      if (Math.abs(d) > window.innerHeight * 1.5) return;
      l.y = Math.max(-90, Math.min(90, d * l.depth * scale));
      l.el.style.translate = "0 " + l.y.toFixed(1) + "px";
    });
  }
  if (layers.length) {
    var queued = false;
    window.addEventListener("scroll", function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; placeLayers(); });
    }, { passive: true });
    // Re-measure whenever the page changes height (images, fonts, the arc settling).
    if ("ResizeObserver" in window) new ResizeObserver(function () { requestAnimationFrame(measureLayers); }).observe(document.body);
    else window.addEventListener("resize", measureLayers);
    measureLayers();
  }

  /* ---------- The signature writes itself ---------- */

  var sig = document.querySelector(".signature");
  if (sig && "IntersectionObserver" in window) {
    var font = document.createElement("link");
    font.rel = "stylesheet";
    font.href = "https://fonts.googleapis.com/css2?family=Mrs+Saint+Delafield&display=swap";
    document.head.appendChild(font);

    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "autograph");
    svg.setAttribute("viewBox", "0 0 1000 320");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      '<defs><mask id="autograph-pen" maskUnits="userSpaceOnUse"><rect class="autograph__pen" x="0" y="0" width="1000" height="320" fill="#fff"/></mask></defs>' +
      '<g mask="url(#autograph-pen)"><text class="autograph__ink" x="500" y="210" text-anchor="middle">Murat Kurul</text></g>';
    sig.appendChild(svg);

    var seen = false;
    var write = function () {
      if (seen) return;
      seen = true;
      sig.classList.add("is-signing");
    };
    var ready = document.fonts && document.fonts.load ? document.fonts.load('200px "Mrs Saint Delafield"', "Murat Kurul") : Promise.resolve();
    new IntersectionObserver(function (entries, io) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      ready.then(write, write);
    }, { threshold: 0.45 }).observe(sig);
  }
})();
