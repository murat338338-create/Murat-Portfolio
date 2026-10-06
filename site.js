(function () {
  "use strict";

  var stage = document.querySelector("[data-carousel]");
  if (!stage) return;

  var ring = stage.querySelector(".carousel__ring");
  var cards = Array.prototype.slice.call(ring.querySelectorAll(".carousel__card"));
  var pauseBtn = document.querySelector("[data-carousel-pause]");
  var prevBtn = document.querySelector("[data-carousel-prev]");
  var nextBtn = document.querySelector("[data-carousel-next]");

  var n = cards.length;
  var step = 360 / n;
  var DEG_PER_MS = 0.0054;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var angle = 0;
  var target = null;
  var vel = 0;
  var drag = null;
  var radius = 0;
  var paused = reduceMotion.matches;
  var hovering = false;
  var visible = true;
  var suppressUntil = 0;
  var last = performance.now();
  var raf = 0;

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
    for (var i = 0; i < n; i++) {
      var rel = (((i * step + angle) % 360) + 360) % 360;
      var facing = Math.cos((rel * Math.PI) / 180);
      var card = cards[i];
      card.style.opacity = facing < -0.05 ? "0" : (0.22 + 0.78 * ((facing + 1) / 2)).toFixed(3);
      card.style.pointerEvents = facing > 0.55 ? "auto" : "none";
    }
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

  reduceMotion.addEventListener && reduceMotion.addEventListener("change", function (e) { setPaused(e.matches); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }).observe(stage);
  }
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
