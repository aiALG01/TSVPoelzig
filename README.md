# TSV 1861 Pölzig – Website

Neue Website des TSV 1861 Pölzig. Reines HTML/CSS/JS, kein Build-Schritt,
kein Framework. Die einzige Ausnahme ist die Neuigkeiten-Verwaltung unter
`/admin`, eine fertige Open-Source-Oberfläche (Decap CMS), die Beiträge direkt
in `content/neuigkeiten.json` speichert.

## Projektstruktur

```
index.html              Startseite
verein.html              Verein-Hub, verlinkt Geschichte/Vorstand/Mitglied werden
geschichte.html          Zeitleiste 1861-2021, mit Jubiläums-Highlights
vorstand.html            Vorstand und Abteilungsleitungen (3-spaltig, große Fotos)
abteilungen/
  index.html             Übersicht
  fussball.html           inkl. Hinweis zur SG Pölzig-Heuckewalde
  volleyball.html
  gymnastik.html
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
`css/fonts.css` verdrahtet, die Dateien liegen selbst gehostet in `fonts/`,
siehe `fonts/README.md` für Details zu den vorhandenen Schnitten.

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

## Kontaktformular einrichten

Das Formular auf `kontakt.html` ist für **Netlify Forms** vorbereitet
(`data-netlify="true"`), braucht aber einen einmaligen Schritt im
Netlify-Dashboard, damit Nachrichten auch ankommen:

1. Nach dem ersten Deploy: Site settings → Forms → Form notifications →
   „Add notification“ → „Email notification“.
2. Als Empfänger vorerst `an.marc@web.de` (Marc Schulze, 1. Vorsitzender)
   eintragen. Weitere Empfänger lassen sich später ergänzen.

Ohne diesen Schritt werden Formular-Einsendungen zwar bei Netlify
gespeichert, aber nicht per E-Mail zugestellt.

## Vor dem Go-Live noch offen

- **Impressum und Datenschutzerklärung**: enthalten absichtlich Platzhalter
  (`[Platzhalter: …]`), keine erfundenen Angaben. Beide Seiten sind mit einem
  roten Warnhinweis markiert, bis sie vollständig sind.
- **Fotos**: alle Bildflächen sind bewusst Platzhalter (Streifenmuster mit
  Beschriftung), kein Stock- oder KI-Material. Echte Fotos einfach über
  `/admin` hochladen (Neuigkeiten) oder für feste Seiten direkt in den
  jeweiligen `<img>`/`.photoslot`-Bereich einsetzen.
- **Fußball-Actionfoto**: einziger verbliebener Foto-Platzhalter, wartet auf
  ein echtes Bild.
- **Kontaktformular**: technisch an Netlify Forms angebunden, sendet aber
  erst E-Mails, nachdem die Empfänger-Adresse im Netlify-Dashboard
  eingetragen ist, siehe Abschnitt „Kontaktformular einrichten“ oben.
- **Domain-Umzug von Jimdo**: die alte Seite bleibt bis zum erfolgreichen
  DNS-Umzug online, siehe Absprache im Projekt-Chat, Jimdo wird erst danach
  gekündigt.
