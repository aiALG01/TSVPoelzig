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

  function termineRowHtml(item) {
    var imageHtml = item.image
      ? '<img class="termin-photo" src="' + escapeHtml(item.image) + '" alt="" loading="lazy">'
      : "";
    return (
      '<article class="termin-row">' +
      '<div class="termin-when">' +
      '<span class="termin-date">' + formatDate(item.date) + "</span>" +
      '<h3 class="termin-title">' + escapeHtml(item.title || "Ohne Titel") + "</h3>" +
      "</div>" +
      '<div class="termin-desc">' +
      (item.excerpt ? "<p>" + escapeHtml(item.excerpt) + "</p>" : "") +
      imageHtml +
      "</div>" +
      "</article>"
    );
  }

  function renderInto(container, items, opts) {
    opts = opts || {};
    var filtered = items;
    if (opts.category) {
      filtered = filtered.filter(function (i) { return i.category === opts.category; });
    }
    if (opts.excludeCategory) {
      filtered = filtered.filter(function (i) { return i.category !== opts.excludeCategory; });
    }
    var sorted = filtered.slice().sort(function (a, b) {
      var diff = new Date(a.date || 0) - new Date(b.date || 0);
      return opts.sort === "asc" ? diff : -diff;
    });
    if (opts.limit) sorted = sorted.slice(0, opts.limit);

    if (sorted.length === 0) {
      container.outerHTML = emptyStateHtml(opts.emptyText);
      return;
    }
    container.innerHTML = opts.layout === "rows"
      ? sorted.map(termineRowHtml).join("")
      : sorted.map(cardHtml).join("");
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
          renderInto(container, items, {
            limit: parseInt(container.getAttribute("data-news-limit"), 10) || null,
            category: container.getAttribute("data-news-category") || null,
            excludeCategory: container.getAttribute("data-news-exclude-category") || null,
            emptyText: container.getAttribute("data-news-empty-text") || null,
            layout: container.getAttribute("data-news-layout") || "grid",
            sort: container.getAttribute("data-news-sort") || "desc",
          });
        });
      })
      .catch(function () {
        containers.forEach(function (container) {
          container.outerHTML = emptyStateHtml();
        });
      });
  });
})();
