/* HydroStress : dessin de la parcelle sur la carte (Leaflet). Aucun script en ligne : compatible CSP. */
(function () {
  "use strict";
  var ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  var OSM = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  var ZONE_COLORS = ["#2f8f3a", "#17496e", "#e07b1f", "#8cc63f", "#7c3aed", "#0891b2", "#db2777", "#ca8a04", "#64748b"];

  function areaHa(points) {
    if (points.length < 3) return 0;
    var lat0 = points.reduce(function (s, p) { return s + p.lat; }, 0) / points.length;
    var kx = 111.32 * Math.cos(lat0 * Math.PI / 180), ky = 111.32, a = 0;
    for (var i = 0; i < points.length; i++) {
      var p = points[i], q = points[(i + 1) % points.length];
      a += (p.lng * kx) * (q.lat * ky) - (q.lng * kx) * (p.lat * ky);
    }
    return Math.abs(a) / 2 * 100;  // km² -> ha
  }

  function init(el) {
    var input = document.getElementById(el.dataset.input);
    var status = document.querySelector("[data-hs-status]");
    var areaBox = document.querySelector("[data-hs-area]");
    var zoneSelect = document.getElementById("hs-zone");
    var emptyText = areaBox ? areaBox.textContent : "";

    var satellite = L.tileLayer(ESRI, { maxZoom: 19, attribution: "Esri World Imagery" });
    var plan = L.tileLayer(OSM, { maxZoom: 19, attribution: "© OpenStreetMap" });
    var map = L.map(el, { layers: [satellite], doubleClickZoom: false, scrollWheelZoom: true }).setView([31.8, -6.8], 6);
    var points = [], vertices = [], shape = null, zones = [], labels = {};

    function render() {
      vertices.forEach(function (v) { map.removeLayer(v); });
      vertices = [];
      if (shape) { map.removeLayer(shape); shape = null; }
      if (points.length >= 2) {
        shape = (points.length >= 3 ? L.polygon : L.polyline)(points, { color: "#8cc63f", weight: 3, fillOpacity: 0.25 }).addTo(map);
      }
      points.forEach(function (p) {
        vertices.push(L.circleMarker(p, { radius: 5, color: "#fff", weight: 2, fillColor: "#f0a224", fillOpacity: 1, className: "hs-vertex" }).addTo(map));
      });
      if (points.length >= 3) {
        var ring = points.map(function (p) { return [Number(p.lng.toFixed(6)), Number(p.lat.toFixed(6))]; });
        ring.push(ring[0]);
        input.value = JSON.stringify(ring);
        if (areaBox) {
          areaBox.textContent = "≈ " + areaHa(points).toFixed(2) + " ha · " + points.length + " " + (labels.points || "points");
          areaBox.classList.add("is-ready");
        }
      } else {
        input.value = "";
        if (areaBox) {
          areaBox.textContent = points.length ? points.length + " " + (labels.points || "points") + " · " + (labels.hint || "") : emptyText;
          areaBox.classList.remove("is-ready");
        }
      }
    }

    map.on("click", function (e) { points.push(e.latlng); render(); });
    var undo = document.querySelector("[data-hs-undo]");
    var clear = document.querySelector("[data-hs-clear]");
    if (undo) undo.addEventListener("click", function () { points.pop(); render(); });
    if (clear) clear.addEventListener("click", function () { points = []; render(); });

    // Parcelle déjà analysée (page d'une analyse)
    var initial = document.getElementById("hs-initial");
    if (initial) {
      try {
        var ring = JSON.parse(initial.textContent);
        if (ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) ring.pop();
        points = ring.map(function (c) { return L.latLng(c[1], c[0]); });
        render();
        map.fitBounds(L.latLngBounds(points), { maxZoom: 16, padding: [40, 40] });
      } catch (err) { /* contour illisible : on garde la carte vide */ }
    }

    fetch(el.dataset.src, { credentials: "same-origin" }).then(function (r) { return r.json(); }).then(function (data) {
      zones = data.zones; labels = data.labels || {};
      L.control.layers((function () { var o = {}; o[labels.satellite || "Satellite"] = satellite; o[labels.plan || "Plan"] = plan; return o; })()).addTo(map);
      zones.forEach(function (z, i) {
        z.places.forEach(function (p) {
          L.circleMarker([p.lat, p.lng], { radius: 4, color: ZONE_COLORS[i % ZONE_COLORS.length], weight: 2, fillOpacity: 0.6, interactive: true })
            .bindTooltip(p.name + " · " + z.name).addTo(map);
        });
      });
      if (!initial) map.setView(data.center, data.zoom);
      render();
    });

    if (zoneSelect) zoneSelect.addEventListener("change", function () {
      var z = zones.filter(function (x) { return x.id === zoneSelect.value; })[0];
      if (!z) { map.setView([31.8, -6.8], 6); return; }
      var b = L.latLngBounds(z.places.map(function (p) { return [p.lat, p.lng]; }));
      map.fitBounds(b.pad(0.4), { maxZoom: 11 });
      var crop = document.getElementById("id_crop");
      if (crop && z.crops.length && z.crops.indexOf(crop.value) === -1) crop.value = z.crops[0];
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof L === "undefined") return;
    document.querySelectorAll("[data-hs-map]").forEach(init);
  });

  // Après une analyse (HTMX), faire défiler jusqu'au rapport
  document.addEventListener("htmx:afterSwap", function (e) {
    if (e.detail && e.detail.target && e.detail.target.id === "hs-result") {
      e.detail.target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
})();
