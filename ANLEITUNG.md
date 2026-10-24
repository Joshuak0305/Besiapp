# Besichtigungs-App – Anleitung

Web-App für Objektbesichtigungen: Stammdaten, Baubeschreibung mit Schnellauswahl,
Fotos mit Kategorien, Beschriftung und Markierungen, Ausstattungsstandard und
Modernisierung nach ImmoWertV. Export als **Word-Datei (.docx)**.

Alle Daten bleiben lokal auf dem iPhone, es gibt keinen Server und keine Cloud.

## Auf das iPhone bringen (einmalig)

Die App braucht eine HTTPS-Adresse, damit sie offline läuft. Am einfachsten
und kostenlos geht das mit **GitHub Pages**:

1. Auf github.com ein Konto anlegen und ein neues Repository erstellen, z. B. `besichtigung`.
2. Diese Dateien hochladen („Add file → Upload files“):
   `index.html`, `styles.css`, `manifest.webmanifest`, `sw.js`, den Ordner `js` und den Ordner `icons`.
3. Unter *Settings → Pages* bei *Branch* `main` und `/ (root)` wählen und speichern.
4. Nach etwa einer Minute ist die App unter `https://<name>.github.io/besichtigung/` erreichbar.
5. Diese Adresse auf dem iPhone in **Safari** öffnen, dann *Teilen → Zum Home-Bildschirm*.

## Ablauf bei einer Besichtigung

1. **Objekt**: Adresse, Aktenzeichen, Besichtigungsdatum, ggf. Wertermittlungsstichtag.
2. **Fotos**: Oben „Neue Fotos in“ die Kategorie und das Geschoss wählen, dann *Kamera*.
   Nach jeder Aufnahme öffnet sich die Beschriftung: Raum antippen, Beschreibung tippen oder diktieren.
   *Nächstes Foto aufnehmen* übernimmt Kategorie und Geschoss.
   - In der Fotoliste kannst du die Beschreibung direkt bearbeiten und mit ⠿ verschieben,
     auch in eine andere Kategorie. Die Nummerierung passt sich automatisch an.
   - *Nach Geschoss sortieren* ordnet innerhalb jeder Kategorie nach KG, EG, OG, DG …
   - *Markieren* zeichnet Pfeile, Kreise oder Freihandlinien ein. Das Original bleibt erhalten.
3. **Baubeschreibung**: Begriffe antippen (nochmal tippen entfernt sie) oder frei schreiben.
4. **Bewertung**:
   - *Ausstattungsstandard*: wird automatisch aus den Begriffen der Baubeschreibung ermittelt
     (Stufen 1–5 nach Anlage 4 ImmoWertV, gewichtet). Merkmal antippen, um die Grundlage zu sehen,
     mit − / ＋ in halben Stufen anzupassen oder eine Stufenbeschreibung direkt auszuwählen.
     *Automatisch* setzt die Anpassung zurück.
   - *Modernisierung* (Anlage 2 ImmoWertV), zwei Wege:
     - **Je Element (Tabelle 1):** Jahr der Maßnahme eintragen ergibt die Höchstpunkte, „teilweise“ halbiert.
       „zeitgemäß“ für nicht modernisierte Bauteile, die noch zeitgemäßen Ansprüchen genügen.
       Punkte je Element und in der Summe mit − / ＋ anpassen (↺ = zurück auf automatisch).
       Optional: „Ältere Maßnahmen automatisch mindern“ (eigene Annahme, nicht ImmoWertV:
       bis 10 Jahre volle, 11–20 Jahre halbe Punkte, älter keine).
     - **Grad (Tabelle 2):** Modernisierungsgrad wählen und die Punktzahl innerhalb der Spanne festlegen.
   - *Restnutzungsdauer*: modifiziert nach Anlage 2 ImmoWertV aus Baujahr, Gesamtnutzungsdauer
     (Standard 80 Jahre) und Modernisierungspunkten. Eigener Wert möglich.
5. **Export**: *Word-Datei erstellen* → *teilen / sichern* (in Dateien, per Mail, AirDrop).
   - Fotodokumentation: 2 oder 4 Fotos je Seite, wahlweise nach Kategorien gegliedert.
     Die Fotonummern sind Word-Felder: Nach Umsortieren in Word mit *Alles markieren → F9* aktualisieren.
   - Baubeschreibung: alle Angaben, Ausstattungsstandard mit Begründung, Modernisierung und RND.

**Hinweis:** Die Beschreibungen der Standardstufen, Punkttabellen und Koeffizienten sind
sinngemäß aus der ImmoWertV übernommen. Bitte vor dem ersten Einsatz gegen den
Verordnungstext prüfen. Die Zuordnung von Baubeschreibung zu Standardstufe ist ein Vorschlag
und ersetzt nicht die sachverständige Einstufung.

## Datensicherung

Safari kann Daten von Web-Apps löschen, wenn der Speicher knapp wird. Erstelle deshalb
nach jeder Besichtigung unter *Export → Sicherung* eine Datei und lege sie in iCloud
Drive ab. Mit *Import* auf der Startseite lässt sie sich wiederherstellen.

## App-Updates

Geänderte Dateien bei GitHub erneut hochladen. In `sw.js` die Versionsnummer bei `CACHE`
erhöhen (z. B. `besichtigung-v3`), damit die iPhones die neue Version laden.
App danach auf dem iPhone einmal schließen und neu öffnen.
