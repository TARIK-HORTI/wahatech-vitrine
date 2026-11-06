/* Cartes WahaTech (Leaflet + OpenStreetMap). Aucun script en ligne : compatible CSP stricte. */
(function () {
  "use strict";
  var MOROCCO = [31.8, -7.1];
  var TILE = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  var ATTR = "© OpenStreetMap";
  var COLORS = { cooperatives: "#e07b1f", land: "#2f8f3a", equipment: "#17496e" };

  function baseMap(el, zoom) {
    var map = L.map(el, { scrollWheelZoom: false }).setView(MOROCCO, zoom || 5);
    L.tileLayer(TILE, { maxZoom: 18, attribution: ATTR }).addTo(map);
    return map;
  }

  function dot(color) {
    return { radius: 8, color: "#fff", weight: 2, fillColor: color, fillOpacity: 0.9 };
  }

  function popup(f, labels) {
    var box = document.createElement("div");
    var strong = document.createElement("strong");
    strong.textContent = f.title;
    var sub = document.createElement("div");
    sub.className = "small";
    sub.textContent = f.sub;
    var link = document.createElement("a");
    link.href = f.url;
    link.textContent = labels.open + " →";
    box.appendChild(strong); box.appendChild(sub); box.appendChild(link);
    return box;
  }

  function initPublic(el) {
    var map = baseMap(el, 5);
    var groups = {};
    fetch(el.dataset.src, { credentials: "same-origin" }).then(function (r) { return r.json(); }).then(function (data) {
      data.features.forEach(function (f) {
        if (!groups[f.layer]) groups[f.layer] = L.layerGroup();
        L.circleMarker([f.lat, f.lng], dot(COLORS[f.layer])).bindPopup(popup(f, data.labels)).addTo(groups[f.layer]);
      });
      document.querySelectorAll("[data-layer]").forEach(function (box) {
        var group = groups[box.dataset.layer];
        if (!group) return;
        if (box.checked) group.addTo(map);
        box.addEventListener("change", function () { box.checked ? group.addTo(map) : map.removeLayer(group); });
      });
    });
  }

  function initPicker(el) {
    var lat = document.getElementById(el.dataset.latInput);
    var lng = document.getElementById(el.dataset.lngInput);
    var map = baseMap(el, 5);
    var marker = null;
    function place(latlng) {
      if (marker) marker.setLatLng(latlng); else marker = L.circleMarker(latlng, dot("#2f8f3a")).addTo(map);
    }
    if (lat.value && lng.value) {
      var start = [parseFloat(lat.value.replace(",", ".")), parseFloat(lng.value.replace(",", "."))];
      place(start); map.setView(start, 11);
    }
    map.on("click", function (e) {
      place(e.latlng);
      lat.value = e.latlng.lat.toFixed(6);
      lng.value = e.latlng.lng.toFixed(6);
    });
    var clear = el.parentNode.querySelector("[data-map-clear]");
    if (clear) clear.addEventListener("click", function () {
      lat.value = ""; lng.value = "";
      if (marker) { map.removeLayer(marker); marker = null; }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof L === "undefined") return;
    L.Icon.Default.imagePath = (document.querySelector('link[href*="leaflet.css"]') || {}).href
      ? document.querySelector('link[href*="leaflet.css"]').href.replace(/leaflet[^/]*\.css.*$/, "images/") : "";
    document.querySelectorAll("[data-map-public]").forEach(initPublic);
    document.querySelectorAll("[data-map-picker]").forEach(initPicker);
  });
})();
