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

  var EXCERPT_LIMIT = 180;

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

  function truncateAtWord(text, limit) {
    if (text.length <= limit) return text;
    var cut = text.slice(0, limit);
    var lastSpace = cut.lastIndexOf(" ");
    if (lastSpace > 0) cut = cut.slice(0, lastSpace);
    return cut + "…";
  }

  function excerptHtml(excerpt) {
    if (!excerpt) return "";
    if (excerpt.length <= EXCERPT_LIMIT) {
      return "<p>" + escapeHtml(excerpt) + "</p>";
    }
    var short = truncateAtWord(excerpt, EXCERPT_LIMIT);
    return (
      '<p class="news-excerpt">' +
      '<span class="excerpt-short">' + escapeHtml(short) + "</span>" +
      '<span class="excerpt-full" hidden>' + escapeHtml(excerpt) + "</span>" +
      ' <button type="button" class="news-more-toggle" data-news-more>Weiterlesen</button>' +
      "</p>"
    );
  }

  function terminInfoHtml(item, tagName, className) {
    var parts = [];
    if (item.zeit) parts.push(escapeHtml(item.zeit));
    if (item.ort) parts.push(escapeHtml(item.ort));
    if (parts.length === 0) return "";
    return "<" + tagName + ' class="' + className + '">' + parts.join(" · ") + "</" + tagName + ">";
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
      excerptHtml(item.excerpt) +
      terminInfoHtml(item, "span", "news-termin-info") +
      '<span class="news-date">' + formatDate(item.date) + "</span>" +
      "</div>" +
      "</article>"
    );
  }

  function termineRowHtml(item) {
    var hasImage = !!item.image;
    var imageHtml = hasImage
      ? '<img class="termin-photo" src="' + escapeHtml(item.image) + '" alt="" loading="lazy">'
      : "";
    return (
      '<article class="termin-row">' +
      '<div class="termin-head">' +
      '<span class="termin-date">' + formatDate(item.date) + "</span>" +
      '<h3 class="termin-title">' + escapeHtml(item.title || "Ohne Titel") + "</h3>" +
      terminInfoHtml(item, "span", "termin-meta") +
      "</div>" +
      '<div class="termin-body' + (hasImage ? "" : " no-image") + '">' +
      imageHtml +
      '<div class="termin-desc">' +
      (item.excerpt ? "<p>" + escapeHtml(item.excerpt) + "</p>" : "") +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function renderInto(container, items, opts) {
    opts = opts || {};
    var filtered = items;
    if (opts.category) {
      // Neben der passenden Kategorie zählt auch jeder Beitrag mit
      // ausgefülltem Termin-Feld (Zeit/Ort) als Termin, unabhängig von
      // seiner eigentlichen Kategorie (z. B. ein Spielbericht mit Anstoßzeit).
      filtered = filtered.filter(function (i) {
        return i.category === opts.category || !!(i.zeit || i.ort);
      });
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

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-news-more]");
    if (!btn) return;
    var wrap = btn.closest(".news-excerpt");
    if (!wrap) return;
    var short = wrap.querySelector(".excerpt-short");
    var full = wrap.querySelector(".excerpt-full");
    var isExpanded = !full.hidden;
    full.hidden = isExpanded;
    short.hidden = !isExpanded;
    btn.textContent = isExpanded ? "Weiterlesen" : "Weniger anzeigen";
  });

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
