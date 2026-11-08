/* Version vitrine (pages HTML statiques) : les formulaires ne sont pas envoyés, un message s'affiche. */
(function () {
  "use strict";
  var lang = (document.documentElement.lang || "fr").slice(0, 2);
  var TEXT = {
    fr: "Version vitrine : pour essayer cette fonction, cliquez sur « Comptes de test » en haut de la page (démo complète).",
    ar: "نسخة عرض: لتجربة هذه الخاصية، اضغط على «حسابات التجربة» أعلى الصفحة (النسخة التجريبية الكاملة).",
    en: "Showcase version: to try this feature, click “Test accounts” at the top of the page (full demo)."
  };
  var EXAMPLE = {
    fr: "Version vitrine : voici un exemple de rapport d'analyse.",
    ar: "نسخة عرض: هذا مثال لتقرير تحليل.",
    en: "Showcase version: here is a sample analysis report."
  };

  function toast(message) {
    var box = document.createElement("div");
    box.className = "vitrine-toast";
    box.setAttribute("role", "status");
    box.textContent = message;
    document.body.appendChild(box);
    setTimeout(function () { box.classList.add("is-hidden"); }, 3500);
    setTimeout(function () { box.remove(); }, 4200);
  }

  document.addEventListener("submit", function (e) {
    var form = e.target;
    e.preventDefault();
    // Changement de langue : aller à la même page dans l'autre langue
    if (form.classList.contains("al-lang") && e.submitter && e.submitter.value) {
      var alt = document.querySelector('link[rel="alternate"][hreflang="' + e.submitter.value + '"]');
      window.location.href = alt ? alt.getAttribute("href") : "/" + e.submitter.value + "/";
      return;
    }
    // HydroStress : montrer le rapport d'exemple
    if (form.classList.contains("hs-form")) {
      try { sessionStorage.setItem("vitrine-example", "1"); } catch (err) { /* stockage indisponible */ }
      window.location.href = "/" + lang + "/stress-hydrique/exemple/#rapport";
      return;
    }
    toast(TEXT[lang] || TEXT.fr);
  }, true);

  // Liens vers des pages réservées aux comptes (connexion, commandes…)
  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest("[data-vitrine-locked]") : null;
    if (!link) return;
    e.preventDefault();
    toast(TEXT[lang] || TEXT.fr);
  }, true);

  document.addEventListener("DOMContentLoaded", function () {
    var flag = null;
    try { flag = sessionStorage.getItem("vitrine-example"); sessionStorage.removeItem("vitrine-example"); } catch (err) { /* ignore */ }
    if (flag) toast(EXAMPLE[lang] || EXAMPLE.fr);
  });
})();
