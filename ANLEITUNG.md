# Besichtigungs-App – Anleitung

Web-App für Objektbesichtigungen: Stammdaten, Baubeschreibung mit Schnellauswahl,
Fotos mit Beschriftung und Markierungen. Export als PDF (Fotodokumentation,
Baubeschreibung) und als Text zum Einfügen in Word.

Alle Daten bleiben lokal auf dem iPhone, es gibt keinen Server und keine Cloud.

## Auf das iPhone bringen (einmalig)

Die App braucht eine HTTPS-Adresse, damit sie offline läuft. Am einfachsten
und kostenlos geht das mit **GitHub Pages**:

1. Auf github.com ein Konto anlegen und ein neues Repository erstellen, z. B. `besichtigung`.
   Wähle **Private** nur, wenn du ein kostenpflichtiges Konto hast, sonst Public.
   Die Daten liegen sowieso nie dort, nur der App-Code.
2. Alle Dateien aus diesem Ordner hochladen („Add file → Upload files“),
   außer dem Ordner `.claude`.
3. Unter *Settings → Pages* bei *Branch* `main` und `/ (root)` wählen und speichern.
4. Nach etwa einer Minute ist die App unter `https://<name>.github.io/besichtigung/` erreichbar.
5. Diese Adresse auf dem iPhone in **Safari** öffnen, dann *Teilen → Zum Home-Bildschirm*.

Ab dann startet die App wie jede andere App vom Home-Bildschirm und funktioniert
auch ohne Netz.

## Schnell im WLAN ausprobieren (ohne Offline-Funktion)

Auf dem Mac in diesem Ordner `python3 -m http.server 8765` starten und auf dem
iPhone `http://<IP-des-Macs>:8765` öffnen (iPhone und Mac im selben WLAN).

## Ablauf bei einer Besichtigung

1. **Neue Besichtigung** → Objekt-Tab: Adresse, Aktenzeichen, Datum usw.
2. **Fotos** → *Kamera*: nach jeder Aufnahme öffnet sich direkt die Beschriftung.
   Schnellauswahl antippen (z. B. „Küche“ + „EG“) oder diktieren.
   *Markieren* zeichnet Pfeile, Kreise oder Freihandlinien ein. Das Original bleibt erhalten.
3. **Baubeschreibung**: Abschnitte aufklappen und Begriffe antippen. Nochmal tippen entfernt sie.
   Freitext ist jederzeit möglich. Unten kannst du die NHK-2010-Standardstufen einstufen.
4. **Export**: *PDF erstellen* → *teilen / sichern* (in Dateien, per Mail, AirDrop).
   *Text kopieren* legt die Baubeschreibung in die Zwischenablage, fertig zum Einfügen in Word.

## Datensicherung

Safari kann Daten von Web-Apps löschen, wenn der Speicher knapp wird. Erstelle deshalb
nach jeder Besichtigung unter *Export → Sicherung* eine Datei und lege sie in iCloud
Drive ab. Mit *Import* auf der Startseite lässt sie sich wiederherstellen.

## App-Updates

Nach Änderungen am Code in `sw.js` die Versionsnummer bei `CACHE` erhöhen
(z. B. `besichtigung-v2`), damit die iPhones die neue Version laden.
