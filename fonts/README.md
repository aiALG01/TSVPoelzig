# Schriftdateien

Diese Seite nutzt zwei Schriften von [Fontshare](https://www.fontshare.com)
(ITF Free Font License):

- **Clash Display** – Headlines: https://www.fontshare.com/fonts/clash-display
- **Synonym** – Fließtext: https://www.fontshare.com/fonts/synonym

Die von Fontshare heruntergeladenen Komplett-Pakete liegen als Archiv unter
`ClashDisplay_Complete/` und `Synonym_Complete/` (inkl. Lizenz, OTF/TTF und
allen Schriftschnitten). `css/fonts.css` braucht davon nur die woff2-Dateien
der tatsächlich verwendeten Schnitte, die deshalb zusätzlich flach direkt
hier in `fonts/` liegen:

- `ClashDisplay-Semibold.woff2` (600)
- `ClashDisplay-Bold.woff2` (700)
- `Synonym-Regular.woff2` (400)
- `Synonym-Medium.woff2` (500)
- `Synonym-Semibold.woff2` (600)
- `Synonym-Bold.woff2` (700)

Falls weitere Schnitte gebraucht werden (z. B. Clash Display Medium für
leichtere Headlines), liegen die passenden woff2-Dateien schon in
`ClashDisplay_Complete/Fonts/WEB/fonts/` bzw. `Synonym_Complete/Fonts/WEB/fonts/`
und müssen nur zusätzlich flach hierher kopiert und in `css/fonts.css` als
`@font-face` ergänzt werden.

Warum selbst hosten statt per CDN laden: kein Drittanbieter-Kontakt beim
Seitenaufruf, das ist datenschutzfreundlicher und spart einen Punkt in der
Datenschutzerklärung.
