# TSV 1861 Pölzig – Website

Neue Website des TSV 1861 Pölzig. Reines HTML/CSS/JS, kein Build-Schritt,
kein Framework. Die einzige Ausnahme ist die Neuigkeiten-Verwaltung unter
`/admin`, eine fertige Open-Source-Oberfläche (Decap CMS), die Beiträge direkt
in `content/neuigkeiten.json` speichert.

## Projektstruktur

```
index.html              Startseite
verein.html              Über den Verein
abteilungen/
  index.html             Übersicht
  fussball.html           inkl. Hinweis zur SG Pölzig-Heuckewalde
  volleyball.html
  turnen.html
  tanzen.html
neuigkeiten.html         Alle Neuigkeiten
termine.html
spielorte.html            Beide Sportplätze, mit Karten-Consent-Gate
sponsoren.html
fanshop.html              Platzhalter, bis ein Shop feststeht
kontakt.html
impressum.html            MUSS vor Go-Live vervollständigt werden
datenschutz.html          MUSS vor Go-Live vervollständigt werden

css/tokens liegen in css/style.css (Abschnitt 1), css/fonts.css für @font-face
js/main.js               Navigation, Cookie-Consent
js/neuigkeiten.js        lädt content/neuigkeiten.json und rendert Karten
content/neuigkeiten.json Datenquelle der Neuigkeiten, gepflegt über /admin
images/uploads/           Bild-Uploads aus /admin landen hier
admin/                    Decap-CMS-Verwaltungsoberfläche
fonts/                    Platz für die selbst gehosteten Schriftdateien
```

## Lokal ansehen

Kein Build nötig, es reicht ein einfacher Static-Server, zum Beispiel:

```
npx serve .
```

oder mit Python:

```
python3 -m http.server 8080
```

## Design-System

Farben, Typografie-Skala und Abstände stehen als CSS-Variablen ganz oben in
`css/style.css`. Kurzfassung der Farblogik:

- **Blau (`--color-pulse`) und Weiß** sind die tragende Vereinsidentität.
- **Gelb (`--color-sun`)** ist echte Vereinsfarbe, wird aber bewusst nur bei
  einzelnen Highlights eingesetzt (aktuell: Kategorie „Verein“ bei Neuigkeiten).
- **Grün (`--color-pitch`)** ist eine bewusste Ergänzung und bleibt am
  zurückhaltendsten von allen (aktuell: Kategorie „Spielbericht“).

## Schriftarten

Clash Display und Synonym (beide Fontshare) sind als `@font-face` in
`css/fonts.css` verdrahtet, die Dateien selbst fehlen noch, siehe
`fonts/README.md`. Bis dahin greift automatisch ein System-Font-Fallback,
die Seite ist also lauffähig, nur noch nicht mit der finalen Typografie.

## Neuigkeiten pflegen (`/admin`)

Die Verwaltungsoberfläche läuft über **Decap CMS** mit **Netlify Identity**
als Login, damit kein Vorstandsmitglied Git oder GitHub lernen muss.

Einrichtung (einmalig, beim Go-Live):

1. Seite bei [Netlify](https://netlify.com) aus diesem Repository deployen
   (Build-Befehl: leer lassen, Publish-Verzeichnis: `.`).
2. Im Netlify-Dashboard **Identity** aktivieren und unter „Registration“ auf
   „Invite only“ stellen.
3. Unter Identity → Services → Git Gateway aktivieren.
4. Vorstandsmitglieder unter Identity → Invite users per E-Mail einladen.
5. Diese öffnen den Einladungslink, vergeben ein Passwort und landen direkt
   im Formular unter `/admin`.

Danach reicht für neue Beiträge: `/admin` öffnen, einloggen, Kategorie
(Verein / Spielbericht / Termin), Titel, Text, Datum und optional ein Bild
eintragen, „Veröffentlichen“ klicken. Der Beitrag erscheint automatisch auf
der Startseite und unter „Neuigkeiten“.

## Vor dem Go-Live noch offen

- **Impressum und Datenschutzerklärung**: enthalten absichtlich Platzhalter
  (`[Platzhalter: …]`), keine erfundenen Angaben. Beide Seiten sind mit einem
  roten Warnhinweis markiert, bis sie vollständig sind.
- **Schriftdateien**: siehe `fonts/README.md`.
- **Fotos**: alle Bildflächen sind bewusst Platzhalter (Streifenmuster mit
  Beschriftung), kein Stock- oder KI-Material. Echte Fotos einfach über
  `/admin` hochladen (Neuigkeiten) oder für feste Seiten direkt in den
  jeweiligen `<img>`/`.photoslot`-Bereich einsetzen.
- **Vereinslogos SG Pölzig-Heuckewalde**: Platzhalter-Slots auf der
  Fußball-Abteilungsseite und der Startseite, warten auf die echten Logos.
- **Kontaktformular**: noch nicht an ein Postfach angebunden, Button ist
  bewusst deaktiviert, bis eine Vereins-E-Mail-Adresse feststeht.
- **Domain-Umzug von Jimdo**: die alte Seite bleibt bis zum erfolgreichen
  DNS-Umzug online, siehe Absprache im Projekt-Chat, Jimdo wird erst danach
  gekündigt.
