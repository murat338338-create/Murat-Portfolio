(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function whenVisible(el, onChange) {
    if (!("IntersectionObserver" in window)) { onChange(true); return; }
    new IntersectionObserver(function (entries) { onChange(entries[0].isIntersecting); }).observe(el);
  }

  /* ---------- Scroll reveals ---------- */

  var revealables = document.querySelectorAll("[data-reveal], [data-reveal-media]");
  if (revealables.length) {
    if (!("IntersectionObserver" in window) || reduceMotion.matches) {
      revealables.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var revealer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealer.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      revealables.forEach(function (el) { revealer.observe(el); });
    }
  }

  /* ---------- Marquee: stop it when nobody can see it ---------- */

  document.querySelectorAll(".marquee").forEach(function (m) {
    whenVisible(m, function (v) { m.classList.toggle("is-paused", !v); });
  });

  /* ---------- Fresha readout: cycle through the device's three answers ---------- */

  var STATES = [
    { state: "safe", pct: 97, text: "Safe to eat · points earned" },
    { state: "unsure", pct: 48, text: "Can’t guarantee it · use your judgement" },
    { state: "bad", pct: 14, text: "Highly likely contaminated" }
  ];
  document.querySelectorAll("[data-readout]").forEach(function (el) {
    var value = el.querySelector(".readout__value");
    var caption = el.querySelector(".readout__caption");
    var i = 0;
    var timer = 0;
    function show(s) {
      el.dataset.state = s.state;
      el.style.setProperty("--pct", s.pct);
      value.textContent = s.pct + "%";
      caption.textContent = s.text;
    }
    show(STATES[0]);
    if (reduceMotion.matches) return;
    whenVisible(el, function (v) {
      clearInterval(timer);
      if (v) timer = setInterval(function () { i = (i + 1) % STATES.length; show(STATES[i]); }, 2600);
    });
  });

  /* ---------- Hero carousel ---------- */

  var stage = document.querySelector("[data-carousel]");
  if (!stage) return;

  var hero = document.querySelector(".hero");
  var ring = stage.querySelector(".carousel__ring");
  var cards = Array.prototype.slice.call(ring.querySelectorAll(".carousel__card"));
  var ghost = document.querySelector("[data-ghost]");
  var ghostText = ghost && ghost.querySelector("span");
  var nowNum = document.querySelector("[data-now-num]");
  var nowName = document.querySelector("[data-now-name]");
  var nowKind = document.querySelector("[data-now-kind]");
  var nowOpen = document.querySelector("[data-now-open]");
  var pauseBtn = document.querySelector("[data-carousel-pause]");
  var prevBtn = document.querySelector("[data-carousel-prev]");
  var nextBtn = document.querySelector("[data-carousel-next]");

  var n = cards.length;
  var step = 360 / n;
  var DEG_PER_MS = 0.0054;

  var angle = 0;
  var target = null;
  var vel = 0;
  var drag = null;
  var radius = 0;
  var front = -1;
  var paused = reduceMotion.matches;
  var hovering = false;
  var visible = true;
  var suppressUntil = 0;
  var last = performance.now();
  var raf = 0;
  var swapTimer = 0;

  function setFront(i) {
    if (i === front) return;
    front = i;
    var d = cards[i].dataset;
    if (hero && d.tone) hero.style.setProperty("--tone", d.tone);
    if (nowNum) nowNum.textContent = d.num;
    if (nowName) nowName.textContent = d.name;
    if (nowKind) nowKind.textContent = d.kind;
    if (nowOpen) {
      nowOpen.href = cards[i].getAttribute("href");
      nowOpen.setAttribute("aria-label", "Open " + d.name);
    }
    if (ghostText && ghostText.textContent !== d.name) {
      clearTimeout(swapTimer);
      ghost.classList.add("is-swapping");
      swapTimer = setTimeout(function () {
        ghostText.textContent = d.name;
        ghost.style.setProperty("--chars", d.name.length);
        ghost.classList.remove("is-swapping");
      }, reduceMotion.matches ? 0 : 260);
    }
  }

  function layout() {
    // Card size follows the viewport so it matches the height the stylesheet reserves.
    var w = document.documentElement.clientWidth;
    var cw = w < 640 ? Math.min(w * 0.52, 220) : Math.max(170, Math.min(270, w * 0.19));
    var ch = cw * 1.32;
    radius = Math.round((cw * 1.16) / (2 * Math.tan(Math.PI / n)));
    stage.style.setProperty("--cw", cw + "px");
    stage.style.setProperty("--ch", ch + "px");
    stage.style.setProperty("--stage-h", ch + 64 + "px");
    stage.style.setProperty("--persp", Math.round(radius * 2.6) + "px");
    cards.forEach(function (card, i) {
      card.style.transform = "rotateY(" + i * step + "deg) translateZ(" + radius + "px)";
    });
    render();
  }

  function render() {
    ring.style.transform = "translateZ(" + -radius + "px) rotateY(" + angle + "deg)";
    var best = 0;
    var bestFacing = -2;
    for (var i = 0; i < n; i++) {
      var rel = (((i * step + angle) % 360) + 360) % 360;
      var facing = Math.cos((rel * Math.PI) / 180);
      var card = cards[i];
      card.style.opacity = facing < -0.05 ? "0" : (0.22 + 0.78 * ((facing + 1) / 2)).toFixed(3);
      card.style.pointerEvents = facing > 0.55 ? "auto" : "none";
      if (facing > bestFacing) { bestFacing = facing; best = i; }
    }
    setFront(best);
  }

  function tick(t) {
    var dt = Math.min(48, t - last);
    last = t;
    var moved = false;

    if (target !== null && !drag) {
      var diff = target - angle;
      if (Math.abs(diff) < 0.05) {
        angle = target;
        target = null;
      } else {
        angle += diff * Math.min(1, dt / 110);
      }
      moved = true;
    } else if (!drag) {
      if (Math.abs(vel) > 0.01) {
        angle += vel;
        vel *= 0.92;
        moved = true;
      }
      if (!paused && !hovering) {
        angle -= DEG_PER_MS * dt;
        moved = true;
      }
    }

    if (moved) render();
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (!raf && visible && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function setPaused(p) {
    paused = p;
    if (pauseBtn) pauseBtn.querySelector("[data-pause-text]").textContent = p ? "Play" : "Pause";
  }

  function nudge(dir) {
    var base = target !== null ? target : angle;
    target = Math.round((base + dir * step) / step) * step;
    vel = 0;
  }

  stage.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    drag = { x: e.clientX, moved: 0 };
    target = null;
    vel = 0;
  });
  window.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    drag.x = e.clientX;
    drag.moved += Math.abs(dx);
    if (drag.moved > 6) stage.classList.add("is-dragging");
    angle += dx * 0.22;
    vel = dx * 0.16;
    render();
  });
  function endDrag() {
    if (!drag) return;
    if (drag.moved > 8) suppressUntil = performance.now() + 150;
    drag = null;
    stage.classList.remove("is-dragging");
  }
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  stage.addEventListener("click", function (e) {
    if (performance.now() < suppressUntil) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
  stage.addEventListener("dragstart", function (e) { e.preventDefault(); });

  if (window.matchMedia("(hover: hover)").matches) {
    stage.addEventListener("pointerenter", function () { hovering = true; });
    stage.addEventListener("pointerleave", function () { hovering = false; });
  }

  if (pauseBtn) pauseBtn.addEventListener("click", function () { setPaused(!paused); });
  if (prevBtn) prevBtn.addEventListener("click", function () { nudge(1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { nudge(-1); });

  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", function (e) { setPaused(e.matches); });
  }

  whenVisible(stage, function (v) {
    visible = v;
    if (v) start(); else stop();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 120);
  });

  setPaused(paused);
  layout();
  stage.classList.add("is-ready");
  start();
})();
