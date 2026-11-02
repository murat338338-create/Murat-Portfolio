(function () {
  "use strict";

  /* ---------- Live pages shown at their real size, scaled to fit their frame ---------- */

  var scaled = document.querySelectorAll("[data-scale]");
  function fit() {
    scaled.forEach(function (box) {
      var frame = box.querySelector("iframe");
      var k = box.clientWidth / Number(box.dataset.scale);
      frame.style.transform = "scale(" + k + ")";
      frame.height = Math.ceil(box.clientHeight / k);
    });
  }
  if ("ResizeObserver" in window) new ResizeObserver(fit).observe(document.body);
  else window.addEventListener("resize", fit);
  fit();

  /* ---------- Replay the Lottie banner ---------- */

  var replay = document.querySelector("[data-replay]");
  var lottieFrame = document.querySelector("[data-lottie]");
  if (replay && lottieFrame) replay.addEventListener("click", function () {
    lottieFrame.contentWindow.postMessage("tv-replay", "*");
  });

  /* ---------- A decorative QR pattern for the pause ad (not a real code) ---------- */

  var qr = document.querySelector("[data-qr]");
  if (qr) {
    var NS = "http://www.w3.org/2000/svg", out = "", seed = 7;
    var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var finder = function (x, y) { return '<path d="M' + x + ' ' + y + 'h7v7h-7zM' + (x + 1) + ' ' + (y + 1) + 'v5h5v-5z" fill-rule="evenodd"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3"/>'; };
    for (var y = 0; y < 25; y++) for (var x = 0; x < 25; x++) {
      var inFinder = (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
      if (!inFinder && rnd() > 0.52) out += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
    }
    qr.innerHTML = '<g fill="#07090B">' + finder(0, 0) + finder(18, 0) + finder(0, 18) + out + "</g>";
    qr.setAttribute("xmlns", NS);
  }
})();
