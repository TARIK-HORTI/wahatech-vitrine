/* Diaporama de l'accueil : défilement automatique, points, flèches, pause au survol. */
(function () {
  "use strict";
  var root = document.querySelector("[data-tr-slider]");
  if (!root) return;
  var slides = root.querySelectorAll(".tr-slide");
  var dots = root.querySelectorAll("[data-tr-dot]");
  if (slides.length < 2) return;
  var current = 0;
  var timer = null;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      var active = i === current;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
      dot.setAttribute("aria-current", i === current ? "true" : "false");
    });
  }
  function start() {
    if (reduced) return;
    stop();
    timer = window.setInterval(function () { show(current + 1); }, 6000);
  }
  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  root.classList.add("is-ready");
  root.querySelector("[data-tr-prev]").addEventListener("click", function () { show(current - 1); start(); });
  root.querySelector("[data-tr-next]").addEventListener("click", function () { show(current + 1); start(); });
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () { show(parseInt(dot.getAttribute("data-tr-dot"), 10)); start(); });
  });
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  show(0);
  start();
})();
