(function () {
  "use strict";

  /* ---------- Cover clip: plays only on screen, never for reduced motion, and can be paused ---------- */

  var reel = document.querySelector("[data-reel]");
  if (reel) {
    var video = reel.querySelector("video");
    var toggle = reel.querySelector("[data-reel-toggle]");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var paused = reduce;

    function sync() { toggle.textContent = paused ? "Play" : "Pause"; }
    function play() { var p = video.play(); if (p && p.catch) p.catch(function () {}); }

    toggle.hidden = false;
    sync();
    toggle.addEventListener("click", function () {
      paused = !paused;
      if (paused) video.pause(); else play();
      sync();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !paused) play();
          else if (!e.isIntersecting) video.pause();
        });
      }, { threshold: 0.15 }).observe(reel);
    } else if (!paused) {
      play();
    }
  }

  /* ---------- Iteration stepper ---------- */

  var CAPTIONS = [
    "The blackhouse silhouette: low battered walls, a hipped roof and one window.",
    "First Vizcom Modify. The stone came through well, but the roof read as turf and the window was too timid for a weaver’s north light.",
    "The thatch became crisp and combed: golden heather and marram, roped and weighted. The window became a bold box in pre-weathered bronze.",
    "The final north face. A deep loom window turned to the even north light and the sea loch, framed in timber and bronze."
  ];

  var steps = document.querySelector("[data-steps]");
  if (steps) {
    var imgs = steps.querySelectorAll("[data-step-img]");
    var nav = steps.querySelector("[data-step-nav]");
    var buttons = nav.querySelectorAll("button");
    var caption = steps.querySelector("[data-step-caption]");

    nav.hidden = false;
    // Stacked images all need loading before a switch, or the first change would flash empty.
    imgs.forEach(function (img, i) { if (i > 0) img.loading = "eager"; });
    buttons.forEach(function (button, i) {
      button.addEventListener("click", function () {
        imgs.forEach(function (img, j) { img.classList.toggle("is-current", i === j); });
        buttons.forEach(function (b, j) { b.setAttribute("aria-pressed", String(i === j)); });
        caption.textContent = CAPTIONS[i];
      });
    });
  }
})();
