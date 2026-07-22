// Lädt content/neuigkeiten.json (gepflegt über /admin, Decap CMS) und rendert
// Neuigkeiten-Karten. Kein Build-Schritt: die Datei wird direkt im Browser
// geladen und die Karten werden clientseitig eingefügt.
(function () {
  var CATEGORY_LABEL = {
    verein: "Verein",
    spielbericht: "Spielbericht",
    termin: "Termin",
  };

  var CATEGORY_PHOTOSLOT = {
    verein: "ps-verein",
    spielbericht: "ps-spielbericht",
    termin: "ps-termin",
  };

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function cardHtml(item) {
    var cat = item.category in CATEGORY_LABEL ? item.category : "verein";
    var photoslot = CATEGORY_PHOTOSLOT[cat];
    var imageHtml = item.image
      ? '<img src="' + escapeHtml(item.image) + '" alt="" loading="lazy">'
      : '<div class="photoslot ' + photoslot + '"><span class="tag">Foto folgt</span></div>';
    return (
      '<article class="news-card">' +
      '<div class="thumb">' + imageHtml + "</div>" +
      '<div class="body">' +
      '<span class="news-cat ' + cat + '">' + CATEGORY_LABEL[cat] + "</span>" +
      "<h3>" + escapeHtml(item.title || "Ohne Titel") + "</h3>" +
      (item.excerpt ? "<p>" + escapeHtml(item.excerpt) + "</p>" : "") +
      '<span class="news-date">' + formatDate(item.date) + "</span>" +
      "</div>" +
      "</article>"
    );
  }

  function renderInto(container, items, limit, category, emptyText) {
    var filtered = category ? items.filter(function (i) { return i.category === category; }) : items;
    var sorted = filtered.slice().sort(function (a, b) {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
    if (limit) sorted = sorted.slice(0, limit);

    if (sorted.length === 0) {
      container.outerHTML = emptyStateHtml(emptyText);
      return;
    }
    container.innerHTML = sorted.map(cardHtml).join("");
  }

  function emptyStateHtml(text) {
    return (
      '<div class="news-empty">' +
      "<p><strong>" + (text || "Noch keine Neuigkeiten eingetragen.") + "</strong><br>" +
      "Sobald der Vorstand über <code>/admin</code> die erste Meldung veröffentlicht, erscheint sie hier.</p>" +
      "</div>"
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    var containers = document.querySelectorAll("[data-news-list]");
    if (containers.length === 0) return;

    fetch("content/neuigkeiten.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Neuigkeiten konnten nicht geladen werden.");
        return res.json();
      })
      .then(function (data) {
        var items = (data && data.items) || [];
        containers.forEach(function (container) {
          var limit = parseInt(container.getAttribute("data-news-limit"), 10) || null;
          var category = container.getAttribute("data-news-category") || null;
          var emptyText = container.getAttribute("data-news-empty-text") || null;
          renderInto(container, items, limit, category, emptyText);
        });
      })
      .catch(function () {
        containers.forEach(function (container) {
          container.outerHTML = emptyStateHtml();
        });
      });
  });
})();
