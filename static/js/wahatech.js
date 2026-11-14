/* WahaTech — interactions et animations (aucun script en ligne, compatible CSP) */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.remove("no-js");
  doc.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Barre de navigation compacte au défilement
  var nav = document.querySelector(".al-nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Délai d'apparition (data-delay="150")
  document.querySelectorAll("[data-delay]").forEach(function (el) {
    el.style.setProperty("--delay", parseInt(el.dataset.delay, 10) + "ms");
  });

  // Compteurs animés (data-count="12")
  function animateCount(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    var suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null, duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Barres de progression (data-progress="40")
  function animateProgress(el) {
    el.style.width = Math.max(0, Math.min(100, parseInt(el.dataset.progress, 10) || 0)) + "%";
  }

  var targets = document.querySelectorAll(".reveal, [data-count], [data-progress]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-visible");
        if (el.dataset.count) animateCount(el);
        if (el.dataset.progress) animateProgress(el);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) {
      el.classList.add("is-visible");
      if (el.dataset.count) animateCount(el);
      if (el.dataset.progress) animateProgress(el);
    });
  }

  // Filet de sécurité : tout le contenu devient visible après 2,5 s, même sans défilement
  setTimeout(function () {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
      el.classList.add("is-visible");
      if (el.dataset.count) animateCount(el);
    });
    document.querySelectorAll("[data-progress]").forEach(animateProgress);
  }, 2500);

  // Messages : fermeture manuelle et automatique
  document.querySelectorAll(".al-alert").forEach(function (alert, i) {
    function close() {
      alert.classList.add("is-leaving");
      setTimeout(function () { alert.remove(); }, 400);
    }
    var btn = alert.querySelector(".btn-close");
    if (btn) btn.addEventListener("click", close);
    setTimeout(close, 6000 + i * 800);
  });

  // Indicateur de robustesse du mot de passe
  document.querySelectorAll("[data-strength-for]").forEach(function (meter) {
    var input = document.getElementById(meter.dataset.strengthFor);
    var label = document.getElementById(meter.dataset.strengthLabel);
    if (!input) return;
    var words = (meter.dataset.strengthWords || "|1|2|3|4").split("|");
    input.addEventListener("input", function () {
      var v = input.value, score = 0;
      if (v.length >= 10) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v) || v.length >= 14) score++;
      if (!v) score = 0;
      meter.dataset.level = String(score);
      if (label) label.textContent = words[score];
    });
  });

  // Afficher / masquer le mot de passe
  document.querySelectorAll("[data-toggle-password]").forEach(function (btn) {
    var input = document.getElementById(btn.dataset.togglePassword);
    if (!input) return;
    btn.addEventListener("click", function () {
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.textContent = show ? (btn.dataset.labelHide || "—") : (btn.dataset.labelShow || "—");
      btn.setAttribute("aria-pressed", show ? "true" : "false");
    });
  });


  // Exploitation : lignes de cultures dynamiques (formset Django)
  document.querySelectorAll("form[data-tree-crops]").forEach(function (form) {
    var treeIds = (form.dataset.treeCrops || "").split(",").filter(Boolean);
    var rows = form.querySelector("[data-crop-rows]");
    var tpl = form.querySelector("#crop-row-template");
    var addBtn = form.querySelector("[data-add-crop]");
    var total = form.querySelector("input[name$='-TOTAL_FORMS']");
    var max = form.querySelector("input[name$='-MAX_NUM_FORMS']");

    function syncTree(row) {
      var select = row.querySelector("select[name$='-crop']");
      var field = row.querySelector("[data-tree-field]");
      if (!select || !field) return;
      var isTree = treeIds.indexOf(select.value) !== -1;
      field.hidden = !isTree;
      if (!isTree) {
        var input = field.querySelector("input");
        if (input) input.value = "";
      }
    }
    function bind(row) {
      var select = row.querySelector("select[name$='-crop']");
      if (select) select.addEventListener("change", function () { syncTree(row); });
      syncTree(row);
    }
    if (rows) rows.querySelectorAll("[data-crop-row]").forEach(bind);

    if (addBtn && tpl && rows && total) {
      addBtn.addEventListener("click", function () {
        var index = parseInt(total.value, 10) || 0;
        if (max && index >= parseInt(max.value, 10)) return;
        var html = tpl.innerHTML.replace(/__prefix__/g, String(index));
        var wrapper = document.createElement("div");
        wrapper.innerHTML = html.trim();
        var row = wrapper.firstElementChild;
        rows.appendChild(row);
        total.value = String(index + 1);
        bind(row);
        var first = row.querySelector("select, input:not([type=hidden])");
        if (first) first.focus();
      });
    }
  });

  // Confirmation avant une action destructrice
  document.querySelectorAll("form[data-confirm]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      if (!window.confirm(form.dataset.confirm)) e.preventDefault();
    });
  });

  // Résultats HTMX : rendre visibles les éléments animés insérés
  document.body.addEventListener("htmx:afterSwap", function (e) {
    e.target.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  });

  // Année du pied de page
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
  // Panier : la quantité est enregistrée dès qu'on la change (le bouton reste pour les navigateurs sans JS)
  document.querySelectorAll("form[data-autosubmit] input[type=number]").forEach(function (input) {
    input.addEventListener("change", function () { input.form.submit(); });
  });

})();
