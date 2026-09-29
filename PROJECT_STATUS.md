# PROJECT_STATUS – La Perlé Club

Stand 29.09.2026. Knapper Arbeitsstand dieses Repositorys (Club, Terminal, Verwaltung, Rechtstexte). Keine Gesprächshistorie.

## Designsystem Fassung 4 – Entwurf zur Designabnahme

**Status:** gebaut und geprüft, **nicht in die Seiten eingebettet**. Alle sechs Seiten tragen weiterhin Fassung 3 „Midnight Privé“ (md5 `4232834a3388a1c34011a142b07110f7`). Keine Änderung an Club, Terminal, Verwaltung, Rechtstexten, Daten oder Server.

**Bereich:** gemeinsamer Designblock aller drei Arbeitsbereiche (Club, Terminal, Verwaltung) und der Rechtstexte. Eine spätere Einbettung wirkt in allen sechs Seiten zugleich.

**Dateien** (alle in `design/`, Einstieg `design/README.md`):
- `midnight-prive-fassung-3.css` – bisherige Fassung wörtlich (wiederhergestellte Quelle)
- `laperle-designsystem.css` – Fassung 4 zwischen denselben Markern
- `tokens.json`, `kontrastpaare.json` – Werte und 144 Kontrastpaare
- `einbetten.py` (prüfen/schreiben), `pruefen.py` (Freigabeprüfung)
- `styleguide.html`, `logo-660.png` – lebender Styleguide
- `bestandsaufnahme-fassung-3.md`, `fassung-4-spezifikation.md`

**Bestandene Prüfungen:**
- `python3 design/pruefen.py`: Token-Grammatik, Token = CSS je Thema, alle 203 Klassen und 4 IDs aus Fassung 3 abgedeckt, `--mp-*` der Seitenreste definiert, kein Grün, 272 Kontrastprüfungen.
- `python3 design/einbetten.py pruefen`: sechs Seiten, ein identischer Block.
- Einbettungstest auf einer Kopie (41 App-Zustände, 320–1280 px, dunkel und hell):
  - 0 Seitenfehler, 0 horizontaler Überlauf, auch ohne `body{overflow-x:hidden}`;
  - 0 Buttonreihen mit ungleicher Höhe, auch mit +40 % Text in DE/EN/RU;
  - Animationen wertgleich zu Fassung 3;
  - Fokusring an jedem Tabstopp, Forced Colors, reduzierte Bewegung und Datensparen geprüft.
- Styleguide bei 320–1440 px in beiden Themen: 0 Fehler, 244 von 244 Farbwerten gleich `tokens.json`.

**Offen:**
- Freigabe der offenen Designentscheidungen (`design/README.md`, Abschnitt „Offene Entscheidungen“), danach Einbettung nur in der lokalen Vorschau: `python3 design/einbetten.py schreiben design/laperle-designsystem.css`, Rückweg mit `design/midnight-prive-fassung-3.css`.
- Folgearbeiten in den Seitenresten nach Spezifikation H.6 (u. a. Einwilligungskarten, Glücksradfarben, Heatmap-Stufen, Tabellen-Hüllen), je Bereich ein eigener Diff; Voraussetzung für das helle Thema „Perle“.
- Bekannte Grenzen:
  - Die Hauptaktion bricht bei 320 px auf zwei Zeilen um, wie schon in Fassung 3.
  - Bei 390 px sind vier Fokusringe am Rand horizontal scrollender Tabellen angeschnitten. Die Behebung braucht Seitenskript.
  - `#unklarWeg` und `#rechtAnnehmen` werden erst bei +40 % Text und 320 px dreizeilig. Die Wortlaute bleiben unverändert.
- Nicht geprüft: echtes Safari/iPadOS (nur Chromium vorhanden), echte Übersetzungen (nur simulierte Textlängen).
- Teststand, Freigabe und Live-Veröffentlichung stehen aus; kein Upload ohne ausdrücklichen Auftrag (Server: Beautinda).
