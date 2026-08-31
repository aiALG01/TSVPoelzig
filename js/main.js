// Aktuelles Jahr im Footer
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
});

// Mobile-Navigation
(function () {
  var toggle = document.querySelector(".nav-toggle");
  if (!toggle) return;
  toggle.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();

// Cookie-Consent, datenschutzfreundlich: nichts wird geladen, bevor zugestimmt wurde.
// Es gibt nur "technisch notwendig" (immer aktiv, keine Cookies) und "erweitert"
// (z. B. Kartenembed auf der Spielorte-Seite). Kein Tracking, keine Drittanbieter
// vor Zustimmung.
var TSVConsent = (function () {
  var KEY = "tsv-poelzig-consent";

  function getConsent() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    localStorage.setItem(KEY, JSON.stringify(value));
    document.dispatchEvent(new CustomEvent("tsv-consent-changed", { detail: value }));
  }

  function initBanner() {
    var banner = document.querySelector("[data-consent-banner]");
    if (!banner) return;
    var consent = getConsent();
    if (consent === null) {
      banner.classList.add("visible");
    }
    var acceptBtn = banner.querySelector("[data-consent-accept]");
    var declineBtn = banner.querySelector("[data-consent-decline]");
    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        setConsent({ extended: true });
        banner.classList.remove("visible");
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener("click", function () {
        setConsent({ extended: false });
        banner.classList.remove("visible");
      });
    }
  }

  function applyGates() {
    var consent = getConsent();
    var gates = document.querySelectorAll("[data-consent-gate]");
    gates.forEach(function (gate) {
      if (consent && consent.extended) {
        revealGate(gate);
      } else {
        var btn = gate.querySelector("[data-consent-load]");
        if (btn) {
          btn.addEventListener("click", function () {
            setConsent({ extended: true });
            revealGate(gate);
          });
        }
      }
    });
  }

  function revealGate(gate) {
    var template = gate.querySelector("template");
    if (template) {
      gate.innerHTML = "";
      gate.appendChild(template.content.cloneNode(true));
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initBanner();
    applyGates();
  });

  document.addEventListener("tsv-consent-changed", applyGates);

  return { getConsent: getConsent, setConsent: setConsent };
})();

// Dezentes Einblenden beim Scrollen. Motivation: Karten, Kacheln und
// Zeitleisten-Einträge sollen sich anfühlen, als würden sie ins Spiel
// kommen, statt starr dazustehen, ohne aufdringlich zu wirken. Läuft
// einmalig pro Element, respektiert prefers-reduced-motion vollständig.
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  document.addEventListener("DOMContentLoaded", function () {
    var selector = [
      ".card",
      ".bento-tile",
      ".news-card",
      ".termin-row",
      ".person",
      ".timeline-entry",
      ".logo-slot",
      ".sponsor-card",
      ".training-cta",
    ].join(",");
    var els = document.querySelectorAll(selector);
    if (!els.length) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 5) * 60 + "ms";
      io.observe(el);
    });
  });
})();

// Kontaktformular: Inline-Validierung + Versand per fetch, ohne Seitenwechsel.
// Läuft nur, wenn JavaScript verfügbar ist; ohne JS greift die normale
// Netlify-Forms-Einsendung über das action-Attribut des Formulars.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector("[data-contact-form]");
    var statusBox = document.querySelector("[data-form-status]");
    if (!form) return;

    var honeypot = form.querySelector('input[name="_gegenstelle"]');

    var validators = {
      name: function (value) {
        return value.trim().length >= 2 || "Bitte gib deinen Namen an.";
      },
      email: function (value) {
        return (
          /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ||
          "Bitte gib eine gültige E-Mail-Adresse an."
        );
      },
      nachricht: function (value) {
        return (
          value.trim().length >= 10 ||
          "Bitte schreib uns kurz, worum es geht."
        );
      },
      consent: function (_value, field) {
        return field.checked || "Bitte bestätige die Datenschutzhinweise.";
      },
    };

    var validateField = function (field) {
      var check = validators[field.name];
      if (!check) return true;

      var result = check(field.value, field);
      var wrapper = field.closest(".form-field");
      var errorEl = wrapper && wrapper.querySelector(".error");

      if (result === true) {
        if (wrapper) wrapper.classList.remove("has-error");
        if (errorEl) errorEl.textContent = "";
        field.removeAttribute("aria-invalid");
        return true;
      }

      if (wrapper) wrapper.classList.add("has-error");
      if (errorEl) errorEl.textContent = result;
      field.setAttribute("aria-invalid", "true");
      return false;
    };

    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var fields = Array.prototype.slice.call(
        form.querySelectorAll("input, select, textarea")
      );
      var firstInvalid = null;

      fields.forEach(function (field) {
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      // Honeypot ausgefüllt: still abbrechen, kein Feedback für Bots.
      if (honeypot && honeypot.value) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      var formData = new FormData(form);
      if (!formData.has("form-name")) {
        formData.append("form-name", "kontakt");
      }

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      })
        .then(function (response) {
          if (response.ok) {
            form.hidden = true;
            if (statusBox) {
              statusBox.classList.add("visible");
              statusBox.focus();
            } else {
              alert("Danke! Deine Nachricht wurde gesendet.");
            }
          } else {
            alert("Fehler beim Senden. Bitte versuche es später erneut.");
          }
        })
        .catch(function (error) {
          console.error("Netzwerkfehler:", error);
          alert("Verbindungsfehler. Bitte versuche es später erneut.");
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  });
})();
