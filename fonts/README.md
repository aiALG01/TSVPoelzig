# Schriftdateien einbinden

Diese Seite ist auf zwei Schriften ausgelegt, beide kostenlos über
[Fontshare](https://www.fontshare.com) (ITF Free Font License):

- **Clash Display** – Headlines: https://www.fontshare.com/fonts/clash-display
- **Synonym** – Fließtext: https://www.fontshare.com/fonts/synonym

Aus der Bau-Umgebung heraus war `api.fontshare.com` nicht erreichbar, deshalb
liegen die Dateien noch nicht hier. Bis dahin fällt `css/fonts.css` automatisch
auf System-Schriften zurück, die Seite funktioniert also schon, sieht aber
noch nicht mit der Ziel-Typografie aus.

## So werden die echten Dateien eingebunden

1. Auf Fontshare beide Familien als woff2 herunterladen.
2. Folgende Dateien hier in `fonts/` ablegen (Dateinamen müssen exakt passen,
   `css/fonts.css` verweist bereits darauf):
   - `ClashDisplay-Semibold.woff2`
   - `ClashDisplay-Bold.woff2`
   - `ClashDisplay-Extrabold.woff2`
   - `Synonym-Regular.woff2`
   - `Synonym-Medium.woff2`
   - `Synonym-Semibold.woff2`
3. Fertig, kein weiterer Code nötig. Sobald die Dateien existieren, lädt der
   Browser sie automatisch statt der Fallback-Schrift.

Warum selbst hosten statt per CDN laden: kein Drittanbieter-Kontakt beim
Seitenaufruf, das ist datenschutzfreundlicher und spart einen Punkt in der
Datenschutzerklärung.
