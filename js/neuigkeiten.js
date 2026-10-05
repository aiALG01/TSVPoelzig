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

  function slugifyText(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "beitrag";
  }

  function itemSlug(item) {
    var datePart = (item.date || "").slice(0, 10);
    return (datePart ? datePart + "-" : "") + slugifyText(item.title);
  }

  function detailUrl(item) {
    return "neuigkeit.html?s=" + encodeURIComponent(itemSlug(item));
  }

  // Erhält Absätze/Zeilenumbrüche aus dem Kurztext-Feld (so, wie im
  // CMS eingegeben), statt sie wie in einem einzelnen <p> zu einer Zeile
  // zusammenzufalten.
  function formatBodyHtml(text) {
    if (!text) return "";
    return text
      .split(/\n\s*\n/)
      .map(function (para) { return para.trim(); })
      .filter(function (para) { return para.length > 0; })
      .map(function (para) {
        return "<p>" + escapeHtml(para).replace(/\n/g, "<br>") + "</p>";
      })
      .join("");
  }

  function excerptHtml(excerpt, item) {
    if (!excerpt) return "";
    if (excerpt.length <= EXCERPT_LIMIT) {
      return "<p>" + escapeHtml(excerpt) + "</p>";
    }
    var short = truncateAtWord(excerpt, EXCERPT_LIMIT);
    return (
      "<p>" + escapeHtml(short) +
      ' <a class="news-more-toggle" href="' + detailUrl(item) + '">Weiterlesen</a>' +
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

  function terminMetaPillsHtml(item) {
    var pills = "";
    if (item.zeit) {
      pills += '<span class="termin-meta-item"><span class="termin-meta-label">Uhrzeit</span>' + escapeHtml(item.zeit) + "</span>";
    }
    if (item.ort) {
      pills += '<span class="termin-meta-item termin-meta-ort"><span class="termin-meta-label">Ort</span>' + escapeHtml(item.ort) + "</span>";
    }
    return pills ? '<div class="termin-meta">' + pills + "</div>" : "";
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
      excerptHtml(item.excerpt, item) +
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
      '<span class="termin-date">' + formatDate(item.termin_datum || item.date) + "</span>" +
      '<h3 class="termin-title">' + escapeHtml(item.title || "Ohne Titel") + "</h3>" +
      terminMetaPillsHtml(item) +
      "</div>" +
      '<div class="termin-body' + (hasImage ? "" : " no-image") + '">' +
      imageHtml +
      '<div class="termin-desc">' +
      excerptHtml(item.excerpt, item) +
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
    // Auf der Termine-Seite (layout "rows") zählt für die Reihenfolge das
    // tatsächliche Veranstaltungsdatum (termin_datum), falls gesetzt –
    // sonst würde ein nachträglich veröffentlichter Spielbericht an seinem
    // Veröffentlichungsdatum einsortiert statt am Datum der Veranstaltung.
    var useTerminDatum = opts.layout === "rows";
    var sorted = filtered.slice().sort(function (a, b) {
      var da = useTerminDatum ? (a.termin_datum || a.date) : a.date;
      var db = useTerminDatum ? (b.termin_datum || b.date) : b.date;
      var diff = new Date(da || 0) - new Date(db || 0);
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

  function detailNotFoundHtml() {
    return (
      "<p><strong>Dieser Beitrag wurde nicht gefunden.</strong><br>" +
      "Er wurde eventuell inzwischen bearbeitet oder entfernt.</p>" +
      '<p><a class="btn btn-ghost" href="neuigkeiten.html">Zurück zu Neuigkeiten</a></p>'
    );
  }

  function renderDetail(container, items) {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("s");
    var item = items.filter(function (i) { return itemSlug(i) === slug; })[0];
    if (!item) {
      container.innerHTML = detailNotFoundHtml();
      return;
    }

    document.title = (item.title || "Neuigkeit") + " – TSV 1861 Pölzig";

    var cat = item.category in CATEGORY_LABEL ? item.category : "verein";
    var imageHtml = item.image
      ? '<img class="news-detail-image" src="' + escapeHtml(item.image) + '" alt="" loading="lazy">'
      : "";

    container.innerHTML =
      '<a class="btn btn-ghost news-detail-back" href="neuigkeiten.html">← Zurück zu Neuigkeiten</a>' +
      '<span class="news-cat ' + cat + '">' + CATEGORY_LABEL[cat] + "</span>" +
      "<h1>" + escapeHtml(item.title || "Ohne Titel") + "</h1>" +
      '<div class="news-detail-meta"><span class="news-date">' + formatDate(item.termin_datum || item.date) + "</span></div>" +
      terminMetaPillsHtml(item) +
      imageHtml +
      '<div class="news-detail-body">' + formatBodyHtml(item.excerpt) + "</div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var containers = document.querySelectorAll("[data-news-list]");
    var detailContainer = document.querySelector("[data-news-detail]");
    if (containers.length === 0 && !detailContainer) return;

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
        if (detailContainer) renderDetail(detailContainer, items);
      })
      .catch(function () {
        containers.forEach(function (container) {
          container.outerHTML = emptyStateHtml();
        });
        if (detailContainer) detailContainer.innerHTML = detailNotFoundHtml();
      });
  });
})();
