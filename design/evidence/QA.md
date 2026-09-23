# Relaunch-Abnahme

Basis: `main` / `6ac9a6e`. Prüfung am 20.–21. September 2026. Alle Bilddaten sind erfunden. Die separate lokale Prüfansicht verwendet Original-Handler und lokale RPC-Antworten; ihre Fixtures und ihr Vite-Server sind nicht Bestandteil des ausgelieferten Codes.

## Ergebnisse

| Prüfung | Ergebnis / Grenze |
|---|---|
| Vorhandene Client-Tests | 3 Testdateien bestanden; Wallet-Erzeugung, Ausgabe und Worker unverändert |
| Neue Schutzgrenzen-Tests | 3 bestanden: Inline-Logik/Styles, IDs/Formverträge, keine Datenzugriffe im Präsentationsskript |
| Bestehende CI-Prüfung | `python3 scripts/check-mail-interval.py`: PASS, 10-Sekunden-Intervall unverändert |
| DOM-Vergleich gegen Basis | Alle ursprünglichen IDs, Attribute/Klassen, Formfelder und Produkttexte identisch; Registrierung, Login und Wallet-Button-DOM exakt identisch |
| Isolierte Original-Handler | Advent mit und ohne Reduced Motion; Terminal-Buchung Erfolg/503/pending bestanden |
| Browser: Buchen | 85,50 € → lokale Antwort 86 Perlen; bestehende Sperre/Entsperrung erhalten |
| Browser: Prämie | Originaler Ausgabe-Dialog, Bon/Nachlass und erfolgreiche lokale Ausgabe geprüft |
| Browser: Glücksrad | Original und dekorative Kopie übernehmen denselben Winkel 2407,5°; keine Ergebnisberechnung im Designskript |
| Browser: Advent | Tür 3 öffnet erst nach erfolgreicher lokaler Antwort, bestehender Gewinn +20 Perlen sichtbar |
| Responsive | Club 360/390/1024 px, Terminal 390/768/1024 px ohne horizontalen Seitenüberlauf |
| Modi | Hell/Dunkel visuell geprüft; keine neue Theme-Einstellung eingeführt |
| Textkontrast | Light Haupttext 16,96:1; Light gedämpft 11,61:1; Dark Haupttext 14,47:1; Dark gedämpft 6,45:1; Buttons 13,61:1 / 9,80:1 |
| Treffflächen | Sichtbare Terminal-Aktionen ≥44×44 px; Club-Checkbox hat anklickbares Label 350×72,4 px |
| Geschützte Ausnahme | Apple-/Google-Wallet-Buttons behalten bestehende 30 px Höhe und bisherigen Kontrast; DOM und berechnete Darstellung gegen Basis verglichen |
| WebGL | Skriptladung geprüft; verwalteter Browser liefert `getContext('webgl') === null`, statische Fassung bleibt sichtbar |
| Reduced Motion | Kein Zähler/Parallax/WebGL/Advent-Übergang; echte Endzustände lesbar. Isolierter Original-Advent-Handler besteht auch mit Reduktion |
| Produktdaten | Keine echten Kundendaten gelesen, keine DB-/API-Konfiguration geändert, keine realen Buchungen |

## Lighthouse mobil: vorher / nachher

| Oberfläche | Performance vorher | Performance nachher | Accessibility vorher | Accessibility nachher |
|---|---:|---:|---:|---:|
| Club | nicht gemessen | nicht gemessen | nicht gemessen | nicht gemessen |
| Terminal | nicht gemessen | nicht gemessen | nicht gemessen | nicht gemessen |

Lighthouse 13.0.0 wurde ausschließlich im separaten QA-Verzeichnis installiert. Der Start brach ab: `The CHROME_PATH environment variable must be set to a Chrome/Chromium executable no older than Chrome stable.` Kein lokales Chrome-/Chromium-Binary verfügbar. Deshalb auch keine belastbaren LCP-/CLS-/INP-/FPS-Werte. Vor Freigabe beide Fassungen mit gleichem mobilen Lighthouse-Profil, freigegebenen Testdaten und lokalem Chrome messen. LCP <2,5 s, CLS <0,1 und INP <200 ms bleiben Abnahmeziele, keine nachgewiesenen Ergebnisse. INP zusätzlich mit echten Interaktionen am Gerät messen.

Offen: GPU-Darstellung/Leistung auf einem Mittelklasse-Handy, reale Kamera-/Scanner- und OS-Teilenabläufe, Live-Auth/Integration, vergrößerte Textdarstellung auf dem Zielgerät. Keine pauschale Bestätigung aller End-to-End-Abläufe.

## Screenshots

| Bereich | Vorher | Nachher |
|---|---|---|
| Club, 390 px | [Vorher](club-390-before.jpg) | [Hell](club-390-light.jpg), [Dunkel](club-390-dark.jpg) |
| Club, 1024 px | – | [Tablet](club-1024-light.jpg) |
| Terminal, 1024 px | [Vorher](terminal-1024-before.jpg) | [Hell](terminal-1024-light.jpg), [Dunkel](terminal-1024-dark.jpg) |
| Terminal, Hochformat | – | [768 px](terminal-768-light.jpg), [390 px](terminal-390-light.jpg) |
| Club-Zustände | – | [Leer](club-empty.jpg), [Laden](club-loading.jpg), [Fehler](club-error.jpg), [Advent geöffnet](club-advent-open.jpg) |
| Terminal-Zustände | – | [Leer](terminal-empty.jpg), [Laden](terminal-loading.jpg), [Fehler](terminal-error.jpg) |

Die Screenshots zeigen Ausschnitte einer scrollbaren Seite, keine neuen Routen. Der leuchtende Mauszeiger stammt aus der Prüfumgebung und gehört nicht zur Anwendung. Das Ladebild des Terminals wurde vor der abschließenden reinen Typografie-Korrektur der „ausgeben“-Beschriftung aufgenommen; die Zustandsbilder wurden vor der abschließenden Verstärkung der Eingabefeld-Konturen aufgenommen. Die vier regulären Terminal-Bilder zeigen die finale Fassung. Alle gezeigten Abläufe sind unverändert.

## Figma-Nachweis

`figma-map.json` enthält die 45 Token-Werte, 8 Textstile, 10 Komponentenfamilien und die IDs der zehn Screens. Originale 13 Seiten unverändert, drei neue Seiten. Die Screens sind manuell editierbar rekonstruiert, weil das externe Capture-Skript nicht erreichbar war. Keine pixelgenaue Deckung behauptet; bekannte Unterschiede stehen in `DESIGN.md` und direkt neben den Figma-Screens.

## Reproduzierbare Repo-Prüfung

```sh
npm ci --ignore-scripts --prefix wallet-apple
node --test tests/client/*.test.cjs tests/design/boundary.test.cjs
python3 scripts/check-mail-interval.py
```

`tests.txt` enthält das Ergebnis der Repo-Tests. Der separate DOM-/Handler-Lauf meldete:

```text
PASS club: protected DOM, IDs, attributes, classes and all original copy
PASS terminal: protected DOM, IDs, attributes, classes and all original copy
PASS Club advent and real balance; reduced=false
PASS Club advent and real balance; reduced=true
PASS Terminal booking normal
PASS Terminal booking error
PASS Terminal booking loading
```
