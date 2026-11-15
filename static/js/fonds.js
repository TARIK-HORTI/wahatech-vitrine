/* Fond d'écran : une photo du Maroc différente à chaque page ouverte (8 photos, très pâles).
   Chargé dans <head> sans « defer » pour éviter un changement de fond visible après l'affichage.
   Aucun style en ligne (politique de sécurité du site) : on pose seulement data-fond sur <html>. */
(function () {
  "use strict";
  var COUNT = 8;
  var last = -1;
  try { last = parseInt(window.sessionStorage.getItem("wahatech-fond") || "-1", 10); } catch (e) { /* stockage indisponible */ }
  // Tirage au hasard, jamais deux fois de suite le même paysage
  var pick = Math.floor(Math.random() * (last >= 1 ? COUNT - 1 : COUNT)) + 1;
  if (last >= 1 && pick >= last) { pick += 1; }
  document.documentElement.setAttribute("data-fond", String(pick));
  try { window.sessionStorage.setItem("wahatech-fond", String(pick)); } catch (e) { /* stockage indisponible */ }
})();
