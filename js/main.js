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
