(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Mouse or touch is decided by the input actually used, not once at load: a laptop with a
  // touchscreen, an iPad with a trackpad, or a page opened in touch mode all switch as soon as a mouse moves.
  var root = document.documentElement;
  var hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  function setMouse(on) { hasMouse = on; root.classList.toggle("has-mouse", on); }
  setMouse(hasMouse);
  window.addEventListener("pointermove", function (e) { if (e.pointerType === "mouse" && !hasMouse) setMouse(true); }, { passive: true });
  window.addEventListener("pointerdown", function (e) { if (e.pointerType === "touch" && hasMouse) setMouse(false); }, { passive: true });
  function isMouse(e) { return e.pointerType === "mouse"; }
  var TAU = Math.PI * 2;

  /* ---------- Springs (Apple's damping / response model, mass 1) ---------- */

  function Spring(damping, response, x) {
    this.k = Math.pow(TAU / response, 2);
    this.c = (4 * Math.PI * damping) / response;
    this.x = x || 0;
    this.v = 0;
    this.target = this.x;
  }
  Spring.prototype.step = function (dt) {
    var n = Math.max(1, Math.ceil(dt / 0.004)), h = dt / n;
    for (var i = 0; i < n; i++) {
      var a = -this.k * (this.x - this.target) - this.c * this.v;
      this.v += a * h;
      this.x += this.v * h;
    }
  };
  Spring.prototype.settled = function () {
    return Math.abs(this.x - this.target) < 1e-4 && Math.abs(this.v) < 1e-3;
  };
  Spring.prototype.jump = function (x) { this.x = this.target = x; this.v = 0; };

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function wrap(a) { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; }
  // Where a flick would come to rest (Apple's projection, deceleration 0.998).
  function project(v) { return (v / 1000) * 0.998 / (1 - 0.998); }

  /* ---------- Header material and current section ---------- */

  var header = document.querySelector("[data-header]");
  var hero = document.querySelector("[data-hero]");
  var swapTimer = 0;
  var edgeBlur = document.querySelector("[data-edge-blur]");
  function syncHeader() {
    var past = window.scrollY > hero.offsetHeight - 80;
    // The progressive blur only exists where the floating pill sits over content.
    edgeBlur.classList.toggle("is-on", past);
    // Back over the sky, no section is current.
    if (!past) header.querySelectorAll("[aria-current]").forEach(function (a) { a.removeAttribute("aria-current"); });
    if (past === header.classList.contains("is-solid") || swapTimer) return;
    if (reduce) { header.classList.toggle("is-solid", past); return; }
    // Bar and pill have different geometry, so swap them behind a quick fade instead of morphing layout.
    header.classList.add("is-swapping");
    swapTimer = window.setTimeout(function () {
      header.classList.toggle("is-solid", window.scrollY > hero.offsetHeight - 80);
      requestAnimationFrame(function () { header.classList.remove("is-swapping"); swapTimer = 0; });
    }, 160);
  }
  window.addEventListener("scroll", syncHeader, { passive: true });
  syncHeader();

  if ("IntersectionObserver" in window) {
    var navLinks = {};
    document.querySelectorAll(".nav a").forEach(function (a) { navLinks[a.getAttribute("href").slice(1)] = a; });
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var link = navLinks[e.target.id];
        if (link && e.isIntersecting) {
          Object.keys(navLinks).forEach(function (k) { navLinks[k].removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(navLinks).forEach(function (id) { var el = document.getElementById(id); if (el) navObs.observe(el); });
  }

  /* ---------- Scroll reveals ---------- */

  var revealables = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); revealer.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { revealer.observe(el); });
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

  /* ---------- Before / after ---------- */

  document.querySelectorAll("[data-compare]").forEach(function (el) {
    var frame = el.querySelector(".compare__frame"), range = el.querySelector(".compare__range");
    function set() { frame.style.setProperty("--pos", range.value + "%"); }
    range.addEventListener("input", set);
    set();
  });

  /* ---------- Hero title: words rise in, full sentence kept for screen readers ---------- */

  var title = document.querySelector(".hero__title");
  var full = title.textContent;
  title.innerHTML = '<span class="visually-hidden"></span><span aria-hidden="true"></span>';
  title.firstChild.textContent = full;
  full.split(" ").forEach(function (word, i) {
    var w = document.createElement("span");
    w.className = "w";
    w.style.setProperty("--i", i);
    w.textContent = word;
    title.lastChild.appendChild(w);
    title.lastChild.appendChild(document.createTextNode(" "));
  });

  /* ---------- Cards ---------- */

  var PROJECTS = {
    aero:    { num: "01", name: "AERØ",        kind: "Sport product and brand",      href: "aero/" },
    fresha:  { num: "02", name: "Fresha",      kind: "Food-safety scanner and app",  href: "fresha/" },
    liman:   { num: "03", name: "Liman",       kind: "My own label",                 href: "liman/" },
    postura: { num: "04", name: "Postura",     kind: "Posture wearable",             href: "postura/" },
    night:   { num: "05", name: "Night Court", kind: "Streetball warm-up capsule",   href: "night-court/" },
    anatude: { num: "06", name: "Anatude",     kind: "Modular outdoor system",       href: "#anatude" },
    ring:    { num: "10", name: "Signet ring", kind: "Hand-made silver",             href: "#more" }
  };
  var CARDS = [
    ["fresha", "fresha-device"], ["liman", "liman-look-1"], ["night", "nc-tokyo"], ["aero", "aero-hero"],
    ["postura", "postura-wrist"], ["anatude", "anatude-lineup"], ["fresha", "fresha-app"], ["liman", "liman-look-street"],
    ["night", "nc-jacket"], ["aero", "aero-ad"], ["postura", "postura-bands"], ["liman", "liman-poster"],
    ["ring", "more-ring"], ["anatude", "anatude-moodboard"]
  ];

  var stage = document.querySelector("[data-stage]");
  var ring = document.querySelector("[data-ring]");
  var cards = [];
  for (var pass = 0; pass < 2; pass++) {
    CARDS.forEach(function (c) {
      var a = document.createElement("a");
      a.className = "card";
      a.href = PROJECTS[c[0]].href;
      a.tabIndex = -1;
      a.draggable = false;
      a.innerHTML = '<img src="assets/card/' + c[1] + '.jpg" alt="" decoding="async" draggable="false">';
      ring.appendChild(a);
      cards.push({ el: a, project: c[0], fly: new Spring(0.72, 0.62, reduce ? 1 : 0), launch: null, delay: 0, hover: 0, fade: reduce ? 1 : 0, started: false, z: null, hidden: null });
    });
  }
  var N = cards.length, STEP = TAU / N;

  /* ---------- Geometry: the arc stands on the horizon of the sky photo ---------- */

  var G = {};
  var HORIZON = 0.89; // waterline, as a fraction of the photo's height
  function measure() {
    var W = hero.clientWidth, H = hero.clientHeight, narrow = W < 760;
    var aspect = W / H <= 0.75 ? 1520 / 2688 : 2400 / 1357;
    var shown = Math.max(H, W / aspect); // object-fit: cover, anchored to the bottom
    G.W = W; G.H = H; G.narrow = narrow;
    G.horizon = H - (1 - HORIZON) * shown;
    G.arcY = G.horizon - H / 2;
    // Portrait screens (tablets) have room for a wider arch than landscape laptops.
    G.arcR = Math.min(narrow ? W * 0.84 : W * (W < H ? 0.47 : 0.4), G.horizon - H * (narrow ? 0.36 : 0.31));
    G.arcW = (TAU * G.arcR / N) * (narrow ? 0.92 : 0.82);
    // Whatever the screen shape, keep the arch clear of the title and the view buttons:
    // shrink it until no card, wherever it travels round the arch, would touch them.
    var heroBox = hero.getBoundingClientRect();
    var keepClear = [document.querySelector(".hero__intro")];
    if (!narrow) keepClear.push(document.querySelector(".hero__controls"));
    var rects = keepClear.map(function (el) {
      var r = el.getBoundingClientRect();
      return { l: r.left - heroBox.left - 12, t: r.top - heroBox.top - 12, r: r.right - heroBox.left + 12, b: r.bottom - heroBox.top + 12 };
    });
    function touches(R, w) {
      var rad = w * 0.8; // half the diagonal of a 4:5 card
      for (var deg = -100; deg <= 100; deg += 3) {
        var th = deg * Math.PI / 180;
        var cx = W / 2 + R * Math.sin(th), cy = G.horizon - R * Math.cos(th);
        if (cy > G.horizon) continue; // under the waterline the cards fade out
        for (var i = 0; i < rects.length; i++) {
          var q = rects[i];
          var nx = clamp(cx, q.l, q.r), ny = clamp(cy, q.t, q.b);
          if ((cx - nx) * (cx - nx) + (cy - ny) * (cy - ny) < rad * rad) return true;
        }
      }
      return false;
    }
    var k = narrow ? 0.92 : 0.82;
    while (touches(G.arcR, G.arcW) && G.arcR > W * 0.22) {
      G.arcR *= 0.97;
      G.arcW = (TAU * G.arcR / N) * k;
    }
    G.panoW = narrow ? W * 0.46 : Math.min(W * 0.16, H * 0.3);
    G.panoR = N * G.panoW * 1.1 / TAU;
    G.persp = narrow ? W * 1.05 : W * 0.42;
    G.panoY = G.horizon - H / 2 - G.panoW * 0.9;
    G.arcScale = G.arcW / G.panoW;
    stage.style.perspective = G.persp + "px";
    ring.style.setProperty("--cw", G.panoW + "px");
  }
  measure();
  window.addEventListener("resize", measure);

  /* ---------- Motion state ---------- */

  var alpha = -STEP * 0.5;             // ring rotation
  var snap = new Spring(0.86, 0.5, alpha);
  var snapping = false;
  var driftV = 0, DRIFT = reduce ? 0 : 0.05;
  var paused = reduce, idleUntil = 0, entranceDone = reduce;
  var mode = new Spring(1, 0.55, 0);
  var hovered = null, dragging = false, featuredHeld = false;
  var featuredIdx = -1;
  var nameEl = document.querySelector("[data-featured-name]");
  var metaEl = document.querySelector("[data-featured-meta]");
  var foot = document.querySelector(".hero__foot");
  var haze = document.querySelector("[data-haze]");

  /* ---------- Render ---------- */

  function render(now) {
    var m = clamp(mode.x, 0, 1);
    var best = 0, bestCos = -2;
    var cardH = G.panoW * 1.25;

    for (var i = 0; i < N; i++) {
      var c = cards[i];
      var th = wrap(i * STEP + alpha);
      var s = Math.sin(th), co = Math.cos(th);
      if (co > bestCos) { bestCos = co; best = i; }

      // Arc pose: a wheel standing on the waterline, cards leaning like slats.
      var lift = c.hover * 16;
      var ax = (G.arcR + lift) * s;
      var ay = G.arcY - (G.arcR + lift) * co;
      var az = -Math.abs(s) * 40;
      var aRz = th * 57.2958;
      var aRy = -s * 18;
      var aS = G.arcScale * (1 + c.hover * 0.06);
      // Cards sink below the waterline.
      var screenY = G.H / 2 + ay;
      var aO = clamp((G.horizon + G.arcScale * cardH * 0.1 - screenY) / (G.arcScale * cardH * 0.55), 0, 1);

      // Panorama pose: inside a cylinder, camera on its axis.
      var px = G.panoR * s;
      var py = G.panoY;
      var pz = Math.min(G.persp - G.panoR * co, G.persp - 60);
      var pRy = -th * 57.2958;
      var pS = 1 + c.hover * 0.04;
      var pO = co > 0.5 ? 1 : clamp((co - 0.3) * 5, 0, 1);

      var bx = lerp(ax, px, m), by = lerp(ay, py, m), bz = lerp(az, pz, m);
      var bRz = lerp(aRz, 0, m), bRy = lerp(aRy, pRy, m), bS = lerp(aS, pS, m);
      var o = c.started ? lerp(aO, pO, m) * (1 - c.fade) : 0;

      // Entrance flight: from close to the camera, low over the water, into the pose above.
      // In flight a card stays visible even where its resting place is under the waterline.
      var p = c.fly.x;
      if (p < 0.999 && c.launch) {
        var L = c.launch;
        bx = lerp(L.x, bx, p); by = lerp(L.y, by, p); bz = lerp(L.z, bz, p);
        bRz = lerp(L.rz, bRz, p); bRy = lerp(0, bRy, p);
        bS = lerp(G.arcScale * 1.1, bS, p);
        o = c.started ? Math.min(1, p * 4) * lerp(1, o, clamp(p, 0, 1)) : 0;
      }

      var hidden = o < 0.01;
      if (hidden !== c.hidden) { c.hidden = hidden; c.el.style.visibility = hidden ? "hidden" : "visible"; }
      if (hidden) continue;
      c.el.style.opacity = o.toFixed(3);
      c.el.style.transform =
        "translate3d(" + bx.toFixed(2) + "px," + by.toFixed(2) + "px," + bz.toFixed(2) + "px)" +
        " rotateZ(" + bRz.toFixed(3) + "deg) rotateY(" + bRy.toFixed(3) + "deg) scale(" + bS.toFixed(4) + ")";
      var z = p < 0.999 ? 200 + i : Math.round(co * 50) + 50;
      if (z !== c.z) { c.z = z; c.el.style.zIndex = z; }
    }

    if (best !== featuredIdx && entranceDone && !featuredHeld) {
      featuredIdx = best;
      var pr = PROJECTS[cards[best].project];
      if (pr.name !== nameEl.textContent) {
        nameEl.textContent = pr.name;
        metaEl.textContent = pr.num + " · " + pr.kind;
        if (!reduce && nameEl.animate) {
          nameEl.animate(
            [{ opacity: 0, transform: "translateY(10px)", filter: "blur(4px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
            { duration: 280, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
          );
        }
      }
      nameEl.href = pr.href;
    }
  }

  /* ---------- Entrance: cards shoot in one by one ---------- */

  var entranceStart = Infinity;
  function startEntrance() {
    if (entranceStart !== Infinity) return;
    hero.classList.add("is-on");
    var now = performance.now();
    entranceStart = now + 260;
    if (reduce) { entranceStart = now; return; }
    // Cards on screen launch left to right; the ones under the water are simply in place.
    var order = [];
    cards.forEach(function (c, i) {
      var th = wrap(i * STEP + alpha);
      if (Math.cos(th) > -0.3) order.push({ c: c, th: th });
      else { c.fly.jump(1); c.started = true; }
    });
    order.sort(function (a, b) { return a.th - b.th; });
    order.forEach(function (o, rank) {
      var side = o.th / (Math.PI / 2);
      o.c.delay = rank * 72;
      o.c.launch = {
        x: side * G.W * 0.14,
        y: G.H * 0.5 + G.panoW * 0.4,
        z: G.persp * 0.5,
        rz: side * 28 + (rank % 2 ? 9 : -9)
      };
    });
    entranceDone = false;
    window.setTimeout(function () { entranceDone = true; }, order.length * 72 + 900);
  }
  var sky = document.querySelector("[data-sky]");
  var skyReady = sky.decode ? sky.decode() : Promise.resolve();
  skyReady.then(startEntrance, startEntrance);
  window.setTimeout(startEntrance, 900);

  /* ---------- Loop ---------- */

  var last = performance.now(), running = true, heroVisible = true, lastScroll = -1;

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    featuredHeld = document.activeElement === nameEl;

    for (var i = 0; i < N; i++) {
      var c = cards[i];
      if (!c.started && now >= entranceStart + c.delay) { c.started = true; c.fly.target = 1; }
      if (c.started && !c.fly.settled()) c.fly.step(dt);
      if (reduce && now >= entranceStart) c.fade = Math.max(0, c.fade - dt / 0.35);
      c.hover += ((c === hovered && !dragging ? 1 : 0) - c.hover) * Math.min(1, dt * 14);
    }

    if (!mode.settled()) mode.step(dt);

    if (!dragging) {
      if (snapping) {
        snap.step(dt);
        alpha = snap.x;
        if (snap.settled()) { snapping = false; idleUntil = now + 2500; }
      } else {
        var want = !paused && !featuredHeld && !hovered && entranceDone && now > idleUntil ? DRIFT : 0;
        driftV += (want - driftV) * Math.min(1, dt * 1.6);
        alpha += driftV * dt * (mode.x > 0.5 ? 0.7 : 1);
      }
    }

    // The arc drifts up and the project name fades as the page scrolls away.
    if (!reduce) {
      var sy = window.scrollY;
      if (sy !== lastScroll) {
        lastScroll = sy;
        var prog = clamp(sy / G.H, 0, 1);
        stage.style.transform = prog ? "translate3d(0," + (-prog * G.H * 0.16).toFixed(1) + "px,0)" : "";
        foot.style.opacity = prog ? (1 - prog * 1.8).toFixed(3) : "";
        haze.style.opacity = prog ? Math.min(1, prog * 1.6).toFixed(3) : "";
      }
    }

    render(now);
    if (running) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function setRunning(r) {
    if (r === running) return;
    running = r;
    if (r) { last = performance.now(); requestAnimationFrame(frame); }
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; setRunning(heroVisible && !document.hidden); }).observe(hero);
  }
  document.addEventListener("visibilitychange", function () { setRunning(heroVisible && !document.hidden); });

  /* ---------- Hover (mouse only) ---------- */

  cards.forEach(function (c) {
    c.el.addEventListener("pointerenter", function (e) { if (isMouse(e)) hovered = c; });
    c.el.addEventListener("pointerleave", function () { if (hovered === c) hovered = null; });
  });

  /* ---------- Drag, flick and snap ---------- */

  var startX = 0, lastX = 0, moved = 0, history = [];
  function scaleNow() { return lerp(G.arcR, G.persp, clamp(mode.x, 0, 1)); }

  stage.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    dragging = true; moved = 0; snapping = false; driftV = 0;
    startX = lastX = e.clientX;
    history = [{ t: e.timeStamp, a: alpha }];
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX;
    lastX = e.clientX;
    moved += Math.abs(dx);
    // A little hysteresis before the arc commits to following the pointer.
    if (Math.abs(e.clientX - startX) < 6 && !stage.classList.contains("is-dragging")) return;
    stage.classList.add("is-dragging");
    alpha += dx / scaleNow();
    history.push({ t: e.timeStamp, a: alpha });
    while (history.length > 2 && e.timeStamp - history[0].t > 100) history.shift();
  });
  function release(e) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("is-dragging");
    var first = history[0], lastH = history[history.length - 1];
    var span = (lastH.t - first.t) / 1000;
    var v = span > 0.008 && e.timeStamp - lastH.t < 80 ? (lastH.a - first.a) / span : 0;
    // Throw: project where the flick would rest, snap to the nearest card, keep the finger's velocity.
    var target = Math.round((alpha + project(v)) / STEP) * STEP;
    if (reduce) { alpha = target; idleUntil = performance.now() + 2500; return; }
    snap.x = alpha; snap.v = v; snap.target = target;
    snapping = true;
  }
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);
  stage.addEventListener("click", function (e) { if (moved > 6) e.preventDefault(); }, true);

  /* ---------- Controls ---------- */

  var viewBtns = document.querySelectorAll("[data-view]");
  viewBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var target = b.dataset.view === "pano" ? 1 : 0;
      viewBtns.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      if (reduce) {
        // Cross-fade instead of travelling.
        stage.style.transition = "opacity 160ms ease-out";
        stage.style.opacity = "0";
        window.setTimeout(function () { mode.jump(target); stage.style.opacity = "1"; }, 170);
      } else {
        mode.target = target;
      }
    });
  });
  var pauseBtn = document.querySelector("[data-pause]");
  var pauseText = pauseBtn.querySelector("[data-pause-text]");
  function syncPause() { pauseText.textContent = paused ? "Play" : "Pause"; }
  pauseBtn.addEventListener("click", function () { paused = !paused; syncPause(); });
  syncPause();

  /* ---------- Page effects: one loop that sleeps when nothing is moving ---------- */

  var effects = [];
  var effectsRaf = 0, effectsLast = 0;
  function wake() {
    if (effectsRaf) return;
    effectsLast = performance.now();
    effectsRaf = requestAnimationFrame(tickEffects);
  }
  function tickEffects(now) {
    var dt = Math.min(0.05, (now - effectsLast) / 1000);
    effectsLast = now;
    var busy = false;
    effects.forEach(function (fx) { if (fx(dt, now)) busy = true; });
    effectsRaf = busy ? requestAnimationFrame(tickEffects) : 0;
  }

  // A pointer follower: x and y on separate critically damped springs, a reveal spring, and a press spring.
  // opts.pop < 1 gives the reveal a little overshoot; opts.from is the scale it grows from.
  function follower(el, opts) {
    opts = opts || {};
    var f = {
      x: new Spring(1, opts.response || 0.28), y: new Spring(1, opts.response || 0.28),
      show: new Spring(opts.pop || 1, 0.32), press: new Spring(1, 0.18, 1), placed: false, onFrame: null
    };
    var from = opts.from == null ? 0.7 : opts.from;
    f.move = function (cx, cy) {
      if (!f.placed) { f.x.jump(cx); f.y.jump(cy); f.placed = true; }
      f.x.target = cx; f.y.target = cy; wake();
    };
    f.visible = function (on) { f.show.target = on ? 1 : 0; if (!on) f.press.target = 1; wake(); };
    f.pressed = function (on) { f.press.target = on ? 0.88 : 1; wake(); };
    effects.push(function (dt) {
      if (f.x.settled() && f.y.settled() && f.show.settled() && f.press.settled()) return false;
      f.x.step(dt); f.y.step(dt); f.show.step(dt); f.press.step(dt);
      var s = Math.max(0, f.show.x);
      el.style.opacity = Math.min(1, s).toFixed(3);
      el.style.transform = "translate3d(" + f.x.x.toFixed(1) + "px," + f.y.x.toFixed(1) + "px,0) scale(" + ((from + (1 - from) * s) * f.press.x).toFixed(3) + ")";
      if (f.onFrame) f.onFrame(dt);
      if (s < 0.01 && f.show.target === 0) f.placed = false;
      return true;
    });
    return f;
  }

  /* Index: rows dim around the one you point at, and its picture follows the pointer. */
  var thumbEl = document.querySelector("[data-index-thumb]");
  var indexList = document.querySelector("[data-index]");
  if (!reduce && thumbEl && indexList) {
    var thumb = follower(thumbEl);
    var thumbImg = thumbEl.querySelector("img");
    indexList.addEventListener("pointerover", function (e) {
      var a = e.target.closest("a");
      if (!a || !isMouse(e)) return;
      if (thumbImg.getAttribute("src") !== a.dataset.thumb) {
        thumbImg.src = a.dataset.thumb;
        // Blur crossfade between projects, like the reference's slides.
        if (thumbImg.animate) thumbImg.animate(
          [{ filter: "blur(10px)", transform: "scale(1.08)" }, { filter: "blur(0)", transform: "none" }],
          { duration: 360, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
        );
      }
      thumb.visible(true);
    });
    indexList.addEventListener("pointermove", function (e) { if (isMouse(e)) thumb.move(e.clientX + 140, e.clientY); });
    indexList.addEventListener("pointerleave", function () { thumb.visible(false); });
  }

  /* "View case study" label: follows the mouse over anything that opens a project.
     Ink disc, the project's name in serif, a ring of text that turns as you move, a hairline in the project's tone. */
  var TONES = { aero: "#ECEDEA", fresha: "#C9DCC0", liman: "#F0C9AE", postura: "#C6D6EA", night: "#D3CCEA", anatude: "#C8DAE3", ring: "#E2DCD0" };
  var cursorEl = document.querySelector("[data-cursor-el]");
  var curName = cursorEl.querySelector("[data-cursor-name]");
  var curRing = cursorEl.querySelector(".cursor__ring");
  var cur = reduce ? null : follower(cursorEl, { response: 0.2, pop: 0.68, from: 0.3 });
  var ringAngle = 0, ringSpin = new Spring(1, 0.6, 0), lastPX = null, lastPY = null;
  if (cur) {
    cur.onFrame = function (dt) {
      ringSpin.step(dt);
      ringAngle += ringSpin.x * dt;
      curRing.style.transform = "rotate(" + ringAngle.toFixed(2) + "deg)";
    };
  }
  function showCursor(e, name, tone, compact) {
    if (!cur || !isMouse(e)) return;
    cursorEl.classList.toggle("is-compact", !!compact);
    if (curName.textContent !== name) {
      curName.textContent = name;
      cursorEl.classList.toggle("is-long", name.length > 7);
    }
    cursorEl.style.setProperty("--tone", tone || "#E2DCD0");
    lastPX = e.clientX; lastPY = e.clientY;
    cur.move(e.clientX, e.clientY);
    cur.visible(true);
  }
  function moveCursor(e) {
    if (!cur || !isMouse(e)) return;
    // The ring turns with how far the pointer travels, then eases to a stop.
    if (lastPX !== null) ringSpin.x += Math.hypot(e.clientX - lastPX, e.clientY - lastPY) * 2.2;
    ringSpin.target = 0;
    lastPX = e.clientX; lastPY = e.clientY;
    cur.move(e.clientX, e.clientY);
  }
  function hideCursor() { if (cur) cur.visible(false); lastPX = null; }

  document.querySelectorAll("[data-cursor]").forEach(function (el) {
    var project = el.closest(".project");
    var key = project && project.id;
    el.addEventListener("pointerenter", function (e) { showCursor(e, el.dataset.cursor, TONES[key]); });
    el.addEventListener("pointermove", moveCursor);
    el.addEventListener("pointerleave", hideCursor);
    el.addEventListener("pointerdown", function (e) { if (cur && isMouse(e)) cur.pressed(true); });
    el.addEventListener("pointerup", function () { if (cur) cur.pressed(false); });

    // Touch screens get a frosted tag on the picture instead: "View AERØ ↗".
    var tag = document.createElement("span");
    tag.className = "tap-tag";
    tag.setAttribute("aria-hidden", "true");
    tag.innerHTML = '<span>View</span><em></em><svg viewBox="0 0 16 16"><path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
    tag.querySelector("em").textContent = el.dataset.cursor;
    el.appendChild(tag);
  });

  // The arc's cards open projects too: the label names the card under the mouse, and steps aside while dragging.
  cards.forEach(function (c) {
    var name = PROJECTS[c.project].name;
    c.el.addEventListener("pointerenter", function (e) { if (!dragging) showCursor(e, name, TONES[c.project], true); });
    c.el.addEventListener("pointermove", function (e) { if (dragging) hideCursor(); else moveCursor(e); });
    c.el.addEventListener("pointerleave", hideCursor);
  });
  stage.addEventListener("pointerdown", hideCursor);

  /* Project pictures bend with scroll speed and spring back when the page stops. */
  if (!reduce && "IntersectionObserver" in window) {
    var bendTargets = [];
    var bendObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var kids = Array.prototype.filter.call(e.target.children, function (k) { return !k.classList.contains("caption"); });
        kids.forEach(function (k) {
          var i = bendTargets.indexOf(k);
          if (e.isIntersecting && i < 0) bendTargets.push(k);
          if (!e.isIntersecting && i >= 0) { bendTargets.splice(i, 1); k.style.transform = ""; }
        });
      });
    });
    document.querySelectorAll(".project__media").forEach(function (m) { bendObs.observe(m); });
    var bend = new Spring(0.75, 0.5, 0);
    var lastY = window.scrollY, lastT = performance.now();
    window.addEventListener("scroll", function () {
      var now = performance.now(), dt = Math.max(0.008, (now - lastT) / 1000);
      var v = (window.scrollY - lastY) / dt;
      lastY = window.scrollY; lastT = now;
      bend.target = clamp(v * 0.0012, -3.2, 3.2);
      wake();
    }, { passive: true });
    effects.push(function (dt, now) {
      if (now - lastT > 90) bend.target = 0; // the page has stopped
      if (bend.settled() && bend.x === 0) return false;
      bend.step(dt);
      if (Math.abs(bend.x) < 0.005 && bend.target === 0) bend.jump(0);
      var t = bend.x ? "skewY(" + bend.x.toFixed(3) + "deg)" : "";
      bendTargets.forEach(function (k) { k.style.transform = t; });
      return true;
    });
  }

  /* Rail and tint: while reading Selected work, show which project you're in and wash the page in its tone. */
  var rail = document.querySelector("[data-rail]");
  var railNo = document.querySelector("[data-rail-no]");
  var railLinks = {};
  rail.querySelectorAll("a").forEach(function (a) { railLinks[a.getAttribute("href").slice(1)] = a; });
  var projects = document.querySelectorAll(".project");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      rail.classList.toggle("is-on", e[0].isIntersecting);
      if (!e[0].isIntersecting) document.body.style.removeProperty("--bg");
    }, { rootMargin: "-40% 0px -40% 0px" }).observe(document.getElementById("work"));
    var projObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        Object.keys(railLinks).forEach(function (k) { railLinks[k].removeAttribute("aria-current"); });
        if (railLinks[id]) railLinks[id].setAttribute("aria-current", "true");
        railNo.textContent = String(Array.prototype.indexOf.call(projects, e.target) + 1).padStart(2, "0");
        document.body.style.setProperty("--bg", e.target.dataset.tone);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    projects.forEach(function (p) { projObs.observe(p); });
  }

  /* Signature: size the name so it spans the page exactly, on any screen. */
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

  /* London time in the footer. */
  var clock = document.querySelector("[data-clock]");
  if (clock && window.Intl) {
    var fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });
    var tick = function () { clock.textContent = fmt.format(new Date()); clock.setAttribute("datetime", new Date().toISOString()); };
    tick();
    window.setInterval(tick, 30000);
  }
})();
