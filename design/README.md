# Designsystem La Perlé

Ein gemeinsames Designsystem für vier Oberflächen: **Club** (`club/index.html`), **Terminal** am Empfang (`terminal/index.html`), **Verwaltung** (`backend/index.html`) und **Rechtstexte** (`club/recht.html` mit den datierten Ständen `club/recht-2026-09-19-3.html` und `-4.html`). Es steht als ein CSS-Block zwischen den Zeilen `/* MP-DESIGN-START */` und `/* MP-DESIGN-END */` in allen sechs Seiten und ist dort byte-identisch. Die Quelle liegt in diesem Ordner; in den HTML-Dateien wird der Block nie von Hand geändert.

| Fassung | Quelle | Stand 29.09.2026 |
|---|---|---|
| 3 „Midnight Privé“ (17.09.2026) | [`midnight-prive-fassung-3.css`](midnight-prive-fassung-3.css) | **in allen sechs Seiten eingebettet** (md5 `4232834a3388a1c34011a142b07110f7`), nur dunkel |
| 4 | [`laperle-designsystem.css`](laperle-designsystem.css), [`tokens.json`](tokens.json) | **Entwurf zur Designabnahme, noch nicht eingebettet**; optimierter Nachfolger mit Hell-Thema, Buttonsystem und Skalen |

Fassung 4 lässt Fachlogik, vorhandene Wortlaute und die bestätigten Animationen unverändert. Sie bleibt bis zur Abnahme der offenen Entscheidungen (unten) außerhalb der Seiten.

## Dateien

| Datei | Zweck |
|---|---|
| [`README.md`](README.md) | dieser Einstieg |
| [`midnight-prive-fassung-3.css`](midnight-prive-fassung-3.css) | Fassung 3 wörtlich, identisch mit dem Block in den Seiten; Bezug aller Zeilenangaben `mp:N` |
| [`laperle-designsystem.css`](laperle-designsystem.css) | Block Fassung 4, von Startmarke bis Endmarke |
| [`tokens.json`](tokens.json) | Wertequelle Fassung 4: Farben je Thema, Skalen, Schriftstile, Schriftdateien |
| [`kontrastpaare.json`](kontrastpaare.json) | 144 Kontrastpaare P001–P144 (Spezifikation C.7) mit Mindestwert: Text ≥ 4.5:1, UI ≥ 3:1 |
| [`pruefen.py`](pruefen.py) | Freigabeprüfung Fassung 4 (ein Befehl, Rückgabewert 0 nur bei Erfolg) |
| [`einbetten.py`](einbetten.py) | prüft bzw. schreibt den Block in allen sechs Seiten |
| [`styleguide.html`](styleguide.html) | lebender Styleguide zu Fassung 4: alle Bauteile live auf dem echten CSS, Themenschalter; lokal über einen Webserver öffnen (lädt `../club/assets/vendor/fonts.css`) |
| [`logo-660.png`](logo-660.png) | das Seitenlogo als Datei (bytegleich mit dem eingebetteten Data-URI), für Styleguide und Übergaben |
| [`bestandsaufnahme-fassung-3.md`](bestandsaufnahme-fassung-3.md) | Bestandsaufnahme Fassung 3: alle Werte, Messungen und Befunde H1–H11, M1–M28, L1–L16 |
| [`fassung-4-spezifikation.md`](fassung-4-spezifikation.md) | Spezifikation Fassung 4: Entscheidungen E01–E36, Abschnitte A–I |

Der Seitenrest (CSS nach `/* MP-DESIGN-END */`, Inline-Stile, JS) gehört zur jeweiligen Seite. Eine Änderung am Block wirkt dagegen in allen sechs Seiten zugleich und berührt damit Club, Terminal, Verwaltung und Rechtstexte. Scope und Dateien deshalb vorher benennen (AGENTS.md).

## Themen (Fassung 4)

| Thema | Auslöser | Kern |
|---|---|---|
| **Midnight Privé** (dunkel, Standard) | kein Attribut, `:root` bzw. `data-theme="dark"` | Grundwerte von Fassung 3; neu nur mit Befund: Status ok ohne Grün (`#D1E2EC` statt `#A9C8AE`), Kontrollrand `#917777`, Platzhalter `#AB918E`, opake Tönungen, ein Scrim |
| **Perle** (hell) | `data-theme="light"` am `<html>` | Crème-Linie: Seite `#F6EFE3`, Karte `#FFFCF7`, Text `#3B2E1E`, gedämpft `#6E5C44` |
| automatisch | `data-theme="auto"` | folgt `prefers-color-scheme` |
| Druck | `@media print` | Perle auf Papierweiß, auch in den Nacht-Inseln |

Die Mitgliedskarte `.member`, die Feierbühne `.mp-feier` und die Scanbox `.scanbox` sind **Nacht-Inseln**: Sie bleiben in beiden Themen dunkel. Perle wird erst freigeschaltet, wenn die Seitenreste migriert sind (Spezifikation H.6 „Voraussetzung Perle“, I.1); bis dahin gibt es Hell nur im Teststand und im Druck.

## Token-Namen

- **`--lp-*`** sind die semantischen Token, benannt nach Rolle, nicht nach Ton (`--lp-accent`, nicht `--lp-gold`): Rollen je Thema (`--lp-bg`, `--lp-text`, `--lp-border-control` …), Material themenfest (`--lp-member-*`, `--lp-stage-*`, `--lp-pearl-*`), Skalen (`--lp-space-*`, `--lp-radius-*`, `--lp-fs-*`, `--lp-dur-*` …). Schriftfamilien heißen `--font-display` und `--font-ui`.
- Der Name in `tokens.json` ist der CSS-Name ohne `--` (`lp-accent-fill` ↔ `--lp-accent-fill`).
- **`--mp-*`** sind die 30 Kompatibilitätsaliase aus Fassung 3. Sie zeigen auf `--lp-*` und werden je Thema und Insel neu berechnet. Sie sind nur für Seitenreste, Inline-Stile und JS da; der Block selbst nutzt sie nicht. Neuer Code verwendet `--lp-*`. Dunkel ändern sich nur `--mp-ok` (`#A9C8AE` → `#D1E2EC`) und `--mp-r-pill` (50px → 999px, optisch gleich).
- **`--_*`** sind private Bauteilvariablen (z. B. `--_h`, `--_bg`). Sie werden nur im eigenen Bauteil gelesen und stehen nie in Seiten oder in `tokens.json`.
- Die 24 alten Aliase (`--gold`, `--cream`, `--ink` …) entfallen in Fassung 4 (0 Verweise, Spezifikation H.2).

## Regeln für Änderungen

Verbindlich ist die Spezifikation; hier die Kernregeln mit Abschnitt.

1. **Kein Grün.** Status ok ist Diamant `#D1E2EC` (dunkel) bzw. `#203342` (hell). `pruefen.py` lehnt Farbwerte im Grünbereich ab (C.4, H1).
2. **Champagner wie Schmuck.** Gold bedeutet Handlung, Ort oder Fokus, nie Status. Höchstens eine Champagnerfläche je Aktionsreihe; die Primärpille ist in beiden Themen Champagner (`#E0BE98` / `#E2CFA6`) (A2).
3. **Drei Goldrollen im Hellen:** Text `#7C6029` (`--lp-accent`), UI-Marke `#907036` (`--lp-accent-mark`, ≥ 3:1, nie Fließtext), Deko `#B49153` nur für Logo und Ornament, nie Text, Icon oder Bedienelement (C.1, E02).
4. **Ein Buttonsystem.** Eine Basisregel; Größen sm 44 / md 48 / lg 56 px über `min-height`; Radius 28px (`--lp-radius-action`) für jeden Button, nie abhängig vom Zustand. In Reihen gilt `align-items:stretch` mit einer Größe je Reihe; Labels höchstens zwei Zeilen, kein `nowrap`, keine Ellipse; Icons immer als `<svg class="ic">`, nie als Textzeichen (G.1, Reihenregeln R1–R8).
5. **Abstände nur aus der Skala** 4/8/12/16/20/24/32/48 (+ Haarfuge 2). Rhythmus innen 8 · zwischen 16 · Gruppe 24 · Abschnitt 32; Karte 24 (< 481px: 20; Verwaltung 20); Seitenrand 16/20/32. Abstand entsteht über `gap` oder `margin-top`, nicht über `margin-bottom` an Behältern (E.1–E.4).
6. **Momente in Cormorant, Arbeit in Jost.** Cormorant für h1–h3, Saldo, Betrag, Ziffernblock, Prämien- und Zieltitel, Signatur, Tür, Schrittziffer; Jost für alles Bedienbare, Tabellen und Kennzahlen (A1, D.2).
7. **Nur geladene Schnitte:** Cormorant 400/500/600 (600 nur im Glücksrad-Canvas), kursiv 400/500; Jost 400/500. `b,strong{font-weight:500}`, `font-synthesis:style`; kein Jost 300, kein synthetisches Fett. Textboden 12px; Versalien nur bei 12px mit `.12em` oder `.06em` (Bühne `.22em`) (D.1, D.6).
8. **Ziffern:** Ablesezahlen mit `lining-nums tabular-nums` (`--lp-numeric`); in Überschriften und Sätzen bleiben Mediävalziffern. Formate de-DE: „1.284“, „−300“ (U+2212), „129,50 €“, „3,8 %“, „20.09.2026“ (D.5).
9. **Ein Fokusring je Control:** 2px `--lp-focus`, Versatz 3px (Perle −2px). `outline:none` nur, wo der Behälter den Ring trägt, oder an programmatischen Zielen mit `tabindex="-1"` (F.7).
10. **Status mit Zeichen und Wort:** ✓ für ok, Dreieck für Warnung, !-Kreis für Fehler (nie ✕, das heißt Schließen). Zeichen als SVG-Maske in `currentColor`; keine Wörter in CSS `content` (C.4, G.6).
11. **Nacht-Inseln** sind nur nicht fokussierbare Behälter (`.member`, `.mp-feier`, `.scanbox`). Prämienkarte und Adventstür folgen dem Thema (B.4, E04).
12. **Keine neuen Animationen.** Die 13 `@keyframes` bleiben zeichengleich, Dauern und Kurven laufen nur als Token mit identischem Wert, die Feier ist bis auf die Buttongröße eingefroren; kein Skeleton-Schimmer. Reduzierte Bewegung bleibt, dazu der Schalter `data-motion="reduced"` (A8, F.6, F.10).
13. **Datensparen-Schalter:** `html[data-saver="on"]` (gesetzt aus `saveData` oder `prefers-reduced-data`) schaltet nur optionale Bewegung ab – Kartenglanz, Perlen- und Prämien-Hub und das Laden von GSAP/ScrollTrigger. Spinner, Toast, Fortschritt, Glücksrad und die CSS-Feier bleiben; Datensparen setzt nie `data-motion` (F.11).
14. **Kontrast je Grund:** Text ≥ 4.5:1, Bedienelemente und Fokus ≥ 3:1. Controls tragen `--lp-border-control`; `--lp-line`, `--lp-line-soft` und `--lp-card-edge` sind nur Trenner (C.1, C.7).
15. **Material und Fachliches bleiben:** Mitgliedskarte, Perlen, Bühne, Logo-Ausschnitt 140 × 54 wertgleich, kein neues Logo, kein Monogramm. Wortlaute (R01, Einwilligung, Club-Sprache „Perlen“) und fachliche Regeln (keine Kassenbonnummer beim Buchen, Prämienreihenfolge, Rollensteuerung) werden nicht verändert (H.5).

## Prüfen

Alle Befehle aus dem Repository-Wurzelverzeichnis, nur Python-Standardbibliothek, ohne Netzwerk:

```sh
python3 design/einbetten.py pruefen                                  # sechs Seiten, ein identischer Block? ändert nichts
python3 design/einbetten.py pruefen design/laperle-designsystem.css  # tragen alle Seiten genau diese Quelle?
python3 design/pruefen.py                                            # Freigabeprüfung Fassung 4
```

`einbetten.py pruefen` gibt je Seite die md5 und die passende Quelle in `design/` aus und endet mit `OK: 6 Seiten, ein identischer Block.` Am 29.09.2026 tragen alle sechs Seiten `midnight-prive-fassung-3.css`.

`pruefen.py` liest `laperle-designsystem.css`, `tokens.json`, `kontrastpaare.json`, Fassung 3 und die Seiten, prüft sechs Punkte und gibt nur bei vollem Erfolg 0 zurück:

1. Grammatik von `tokens.json` (Namen, Eindeutigkeit, Farbwerte, Aliase, Themen),
2. Gleichheit: jeder Farbtoken steht je Thema mit demselben Wert im CSS,
3. Vollständigkeit: jede `var(--…)` im Block ist definiert,
4. Kompatibilität: jede Klasse und ID aus Fassung 3 kommt in Fassung 4 vor, und jede `--mp-*`, die ein Seitenrest nutzt (club/index.html, club/recht.html, terminal/index.html, backend/index.html), ist definiert,
5. kein Grün in CSS und `tokens.json`,
6. Kontrast: alle Paare aus `kontrastpaare.json` erreichen ihr Minimum in jedem Thema.

Nach jeder Änderung an Token oder Block `pruefen.py` erneut ausführen, nach dem Einbetten zusätzlich `einbetten.py pruefen`. Breitere Tests nur mit konkretem Grund (AGENTS.md).

## Fassung 4 übernehmen (erst nach Abnahme)

Nur in der lokalen Vorschau; kein Upload und kein Installationspaket ohne ausdrücklichen Auftrag. Den produktiven Server betreut Beautinda. Reihenfolge: lokale Vorschau → Teststand → Freigabe → Live.

1. `python3 design/pruefen.py` → Rückgabewert 0.
2. `python3 design/einbetten.py schreiben design/laperle-designsystem.css` – ersetzt den Block in allen sechs Seiten und prüft danach die md5. Rückweg: derselbe Befehl mit `design/midnight-prive-fassung-3.css`.
3. Folgearbeiten außerhalb des Blocks nach Spezifikation **H.6**, je Bereich ein eigener, kleiner Diff. Fassung 4 dunkel funktioniert ohne sie über die `--mp-*`-Aliase. Voraussetzung für Perle sind die Einwilligungskarten und die Rechtsbestätigung im Club (club:654–669); für Perle nötig sind außerdem die Registrierungsschritte (club:642–644), die Balkenfarbe der Verwaltung (B:643–644), der Linkrand in club/recht und `theme-color` je Thema. Weitere Punkte: Glücksradfarben aus `--lp-wheel-*`, Dialogmuster statt `confirm()`/`prompt()`, Toast 3800ms überall, `<thead>` und Scroll-Hülle für alle Tabellen, Heatmap mit `data-stufe`, Zahlenformate de-DE, `lang` am `<html>`. Der Saldo-Puls wird erst nach Freigabe repariert (I.7).
4. Prüfliste **H.7** vollständig abarbeiten: Breiten 320/360/390/768/1024/1280 in dunkel und `data-theme="light"` (nur Teststand) ohne horizontalen Überlauf, auch ohne `body{overflow-x:hidden}`; +40 % Textlänge (EN/RU); Tastatur, Forced Colors, reduzierte Bewegung, `data-saver`; Feier im Bildvergleich mit Fassung 3; fachliche Regeln unverändert.
5. Kurz berichten (geänderte Dateien, Änderung, ausgeführte Prüfungen mit Ergebnis, offene Punkte) und `PROJECT_STATUS.md` knapp nachführen. Die Datei ist in AGENTS.md vorgesehen, liegt aber derzeit nicht in diesem Repository.

## Offene Entscheidungen (zur Freigabe)

Aus Spezifikation Abschnitt I; die Empfehlung steht jeweils dort.

| # | Frage | Empfehlung |
|---|---|---|
| I.1 | Perle vor der Migration der Seitenreste? | Nein: `data-theme` erst nach H.6 „Voraussetzung Perle“ |
| I.2 | Champagner-Primärfläche im Hellen (`#E2CFA6`, 1.34:1 zur Seite; die Kante `#907036` trägt die Form) | annehmen; Tiefgold `#7C6029` würde die Marke umkehren |
| I.3 | 28px-Radius für alle Buttons (Sekundär 12px → Pille) | annehmen |
| I.4 | Rangfarben (Bronze … Diamant) in der Oberfläche | Rang bleibt Wort + Sparkle; Plakette nur nach Freigabe |
| I.5 | abgeleitete Farbwerte (`#917777`, `#AB918E`, Tönungen, Hellwerte) | Designabnahme; alle erfüllen das Soll |
| I.7 | Saldo-Puls `zahl .6s` reparieren (wäre erstmals sichtbar) | nicht stillschweigend; nur mit Freigabe |
| I.8 | Feier im Datensparmodus (CSS-Feier statt GSAP) | so umsetzen, freigeben lassen |
| I.9 | Warnung und Akzent farblich nah (ΔE_OK 0.029) | beibehalten; Zeichenpflicht im Review prüfen |
| I.11 | Bühnenbutton 56 statt 54px | annehmen oder auf 54px festsetzen |
| I.12 | Logo-Ausschnitt (bündig, Leistungszeile angeschnitten) | unverändert lassen |
| I.13 | dichtere Verwaltung (Sidebar 200px, Zellen 8/12) | annehmen |
| I.15 | Themenschalter „Dunkel / Hell / wie Gerät“ im Club | eigene Freigabe |
| I.16 | Toast-Standzeit 3800ms in allen drei Bereichen | je Bereich ein kleiner Diff |
| I.17 | native Checkbox (sieht je Browser anders aus) | bewusst annehmen |
| I.18 | „Perlen“ statt „Punkte“ im Terminal | nicht Teil von Fassung 4; fachliche Freigabe |

Technische Punkte ohne Entscheidungsbedarf: `body{overflow-x:hidden}` fällt erst nach H.7 Nr. 3 (I.6); `:has()`, Container-Abfragen und Masken auf dem Terminal-iPad prüfen (I.10); der Einbetter ist wiederhergestellt (I.14).

## Weiterlesen

- Design-System-Referenz (claude.ai, privat, Freigabe über das Teilen-Menü): https://claude.ai/artifact/NyUuVMUiuGdVSjk7JuMCro – Markenhandbuch, Token beider Themen, 28 Bauteile mit Live-Vorschau, Schriften, Logo, Icons und Rangmotive.

- [Bestandsaufnahme Fassung 3](bestandsaufnahme-fassung-3.md) – Zustand vor Fassung 4: Tokens, Typografie, Abstände, Bauteile, Assets, Kontrast (200 Paare), Befunde nach Schwere und Leitplanken.
- [Spezifikation Fassung 4](fassung-4-spezifikation.md) – Entscheidungen, Token-Architektur, Farbe und Kontrast, Typografie, Raum, Form und Tiefe, Komponenten, Migration (H.1–H.7) und offene Entscheidungen.

Zeilenangaben `mp:N` meinen `midnight-prive-fassung-3.css`; Seitenzeilen (`club:N`, `T:N`, `B:N`, `recht:N`) den Stand vom 29.09.2026.
