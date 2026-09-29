# Bestandsaufnahme Designsystem Fassung 3 „Midnight Privé“

Stand 29.09.2026 · beschreibt den Zustand **vor Fassung 4**: das Designsystem, das Club, Terminal, Verwaltung und Rechtstexte heute tragen ([`midnight-prive-fassung-3.css`](midnight-prive-fassung-3.css)). Die Empfehlungen aus §8 und §9 setzt die [Spezifikation Fassung 4](fassung-4-spezifikation.md) um; Einstieg, Dateien und Befehle stehen in der [README](README.md).

Die Bestandsaufnahme hat an den Seiten nichts verändert. Alle Werte stehen genau so im Quelltext oder wurden in Chromium (Playwright) gemessen; Messwerte sind als „gemessen“ markiert, rechnerisch abgeleitete Mindestwerte als „abgeleitet“. Wo Einzelbefunde sich widersprachen, wurde am Quelltext nachgeprüft (z. B. Icon-Nutzung, §6.9). Messskripte, Bildschirmfotos und Einzelnotizen der Erhebung sind Arbeitsnotizen und liegen nicht im Repository; ihre Ergebnisse stehen vollständig in diesem Dokument.

**Konventionen**

- `mp:N` = Zeile N in [`design/midnight-prive-fassung-3.css`](midnight-prive-fassung-3.css) (621 Zeilen, md5 `4232834a3388a1c34011a142b07110f7`). Die Datei ist byte-identisch mit dem Block zwischen `/* MP-DESIGN-START */` und `/* MP-DESIGN-END */` in allen sechs Seiten (`python3 design/einbetten.py pruefen`). Seitenzeile = mp-Zeile + Versatz: **club/index.html +17**, **terminal/index.html +19**, **backend/index.html +16**, **club/recht.html +11**. Beispiel: `mp:317` = club:334.
- `club:N`, `terminal:N` (auch `T:N`), `backend:N` (auch `B:N`), `recht:N` (= club/recht.html) sind echte Seitenzeilen. Wurzelseiten heißen `backend.html:N`, `recht.html:N` (Legacy).
- Alle Seitenzeilen beziehen sich auf den Stand vom 29.09.2026; spätere Änderungen an den Seiten verschieben sie.

---

## 1. Überblick

### 1.1 Welche Systeme existieren

| System | Charakter | Wo | Status |
|---|---|---|---|
| **MIDNIGHT PRIVÉ – Fassung 3 (17.09.2026)** | dunkel, warm (Pflaume/Champagner), `color-scheme:dark` (mp:75) | byte-identisch eingebettet zwischen `/* MP-DESIGN-START */` und `/* MP-DESIGN-END */` in `club/index.html` (Z. 18–638), `terminal/index.html` (20–640), `backend/index.html` (17–637), `club/recht.html` (12–632) sowie `club/recht-2026-09-19-3.html` und `club/recht-2026-09-19-4.html` | aktives System aller App-Seiten |
| Seitenreste nach `MP-DESIGN-END` | seitenspezifisches CSS | club:640–669 (~2,4 KB, u. a. Einwilligungskarten mit hartkodierten Hex), club/recht:634–647 (~1,2 KB), backend:639–650 (~0,6 KB), terminal:642–665 (~1,6 KB) | aktiv |
| MP-Druckfassung (V34) | hell, mauve-neutral | mp:551–565 | aktiv nur für `@media print` |
| **Legacy „Crème/Gold“** | hell, gelb-warm | Wurzel `backend.html` (224 000 B, 1481 Z., Token backend.html:14–27; Kommentar „Markenfarben, identisch mit dem Clubbereich“, backend.html:15), `404.html` (676 B) | nicht verlinkt; einzige dokumentierte helle Crème-Palette |
| **Legacy „Rosé/Terrakotta“** | hell, rosé-warm | Wurzel `recht.html` (153 873 B, 261 Z., Token recht.html:11) | nicht verlinkt; Entwurf („[Datum eintragen]“, recht.html:43; „Hinweis für Deniz – vor Veröffentlichung löschen“, recht.html:52) |
| Wallet-Vorschau | dunkel `#191616`, Systemschrift | `wallet-vorschau/index.html` | Vorschauseite |
| **Wallet-Rangpalette** | Metall-Töne Bronze/Silber/Gold/Platin/Diamant | `assets/wallet/refined-metallic-v4/palette.json`, Rangmotive `source/<rang>.svg`, `wallet-apple/pass.ts`, `wallet/index.ts` | nur Wallet-Pässe, nicht in der Club-Oberfläche |
| Wurzel `index.html` | 238 B Weiterleitung `location.replace('./club/'…)` | – | – |

### 1.2 Kopf der MP-Fassung (mp:1–20, wörtlich zusammengefasst)

„MIDNIGHT PRIVÉ – gemeinsames Designsystem (Fassung 3, 17.09.2026). Eine Quelle für Club, Terminal, Backend und Rechtstexte. Grundlage: `referenzen/01-designvergleich-original.html`, Variante 02, und `referenzen/02-animationen-original.html`; Präzisierungen aus `Claude_Umsetzung_Verbindlich.md` (V05–V06, V21, V30, V34). Wird per `design/einbetten.py` identisch in die HTML-Dateien eingebettet … Nicht in den HTML-Dateien ändern, sondern hier.“

Aufbau laut Kopf, mit Zeilen in `design/midnight-prive-fassung-3.css`: 1 Tokens V05 (mp:22) · 2 Grundschrift/Flächen V06 (mp:73) · 3 Bauteile (mp:114) · 4 Markenleiste/Dialoge/Sheets (mp:221) · 5 Kundenclub V07–V12 (mp:243) · 6 Terminal V13–V15 (mp:362) · 7 Verwaltung V17–V20 (mp:425) · 8 Feier V21–V29 (mp:474) · 9 Druck V34 (mp:551) · 10 Zugänglichkeit/Bewegung (mp:567) · 11 Umbrüche (mp:577) · danach `.mp-admin-dialog` (mp:615–619).

**Quellen:** Der Block liegt als `design/midnight-prive-fassung-3.css` im Repository, der im Kopf genannte Einbetter als `design/einbetten.py` (beide wiederhergestellt; `python3 design/einbetten.py pruefen` vergleicht die md5 aller sechs Seiten). **Nicht in diesem Repository** liegen `referenzen/…`, `Claude_Umsetzung_Verbindlich.md` und `docs/logo-660.png` (genannt in mp:223).

### 1.3 Abgrenzung

- Dieses Repo enthält Club (`club/`), Terminal (`terminal/`) und Verwaltung (`backend/`) plus Wallet-Code. Website, Chatbot „Perlá“, Perlenfilm (`home-story.js`), Laserfilm und Shop liegen laut Übergabedokument (nicht in diesem Repository) in einem anderen Repository (`La-Perle-Web`) und sind hier nicht enthalten. Die in der Übergabe erwähnte Datensparen-Steuerung gehört zum Perlenfilm der Website; **in diesem Repo gibt es keine Datensparen-Behandlung** (grep auf `saveData`, `prefers-reduced-data`, `navigator.connection`, `Datensparen`: 0 Treffer außerhalb von Vendor-Dateien).
- Alle App-Seiten sind **nur dunkel** (kein `prefers-color-scheme`: 0 Treffer in allen sechs Seiten) und **nur deutsch** (`lang="de"`, keine Stringtabelle; DE/EN/RU existiert nur als Kundensprache-Auswahl im Terminal T:862–863 und als `p_sprache` an das Backend, club:1010).
- Schriften lokal: `club/assets/vendor/fonts.css` (alle vier MP-Seiten verlinken `/laperle-club/club/assets/vendor/fonts.css`). Legacy-Seiten laden Google Fonts (backend.html:9, recht.html:9).

---

## 2. Tokens

### 2.1 Vollständige Token-Tabelle `:root` (mp:23–71)

54 Custom Properties: 30 `--mp-*`-Token und 24 Legacy-Aliase. „MP-Nutzung“ = `var()`-Verweise im Block ohne die Aliaszeilen (in allen vier Seiten gleich). „außerhalb“ = Verweise in Seitenrest, Inline-Stil und JS (club / terminal / backend / club-recht). Keine Seite definiert ein `--mp-*`-Token neu.

| Token | Wert (exakt) | Rolle | Def. | MP-Nutzung | außerhalb c/t/b/r | Druck (mp:554–555) |
|---|---|---|---|---|---|---|
| `--mp-bg` | `#21191A` | Seiten-/html-Grund (mp:75, 77); zugleich **Einlassfläche** für Felder (156), Suche (169), sekundäre Buttons (131), nps/categories (336, 390), Listeneinträge (395), Sheet-Karte/Dialog (237), `.avatar.large` (232), aktiver Sidebar-Eintrag (434); `theme-color` aller MP-Seiten | mp:24 | 11 | 0/0/0/0 | `#fff` |
| `--mp-surface` | `#302327` | gehobene Fläche: `.card` 177, `.hinweis` 182, `th` 189, Toast 206, `.avatar` 231, `.track` 313, `.sw` 328, `.door` 343, `.ziel` 349, `.customer` 368, Pad-Taste 386, `.sidebar` 428, Admin-Dialog 616 | mp:25 | 13 | 0/0/0/2 | `#fff` |
| `--mp-text` | `#F6E9DF` | Haupttext, Überschriften (mp:92) | mp:26 | 18 | 2/0/0/1 | `#2A2024` |
| `--mp-text-muted` | `#C6ABA8` | Sekundärtext: Label, Eyebrow, `.small`, `th`, Icons | mp:27 | 36 | 1/1/1/1 | `#6B5A63` |
| `--mp-line` | `#5A4242` | 1-px-Ränder/Trenner, Feldränder, Stern aus (mp:333) | mp:28 | 28 | 1/1/1/2 | `#D9CFD4` |
| `--mp-accent` | `#DFBE95` | Champagner-Akzent: Links, Fokus, Icons, aktive Navigation, Fortschritt, `accent-color` | mp:29 | 29 | 1/1/4/0 | `#8E7145` |
| `--mp-button-bg` | `#E0BE98` | Primärbutton-Fläche (mp:119); aktive Fläche von `.sw`, `.nps`, `.categories` (330, 337, 391) | mp:30 | 7 | 0 | `#fff` |
| `--mp-button-text` | `#2E211B` | Text auf Button-Fläche | mp:31 | 5 | 0 | `#2A2024` |
| `--mp-member-text` | `#FAE8DE` | Text Mitgliedskarte, `.card-dark` (181), `.admin-bottom` (457) | mp:32 | 4 | 0 | `#2A2024` |
| `--mp-member-muted` | `#D8B9B5` | gedämpft auf Mitgliedskarte (263, 269, 287) | mp:33 | 3 | 0 | – (nicht überschrieben) |
| `--mp-member-gradient` | `radial-gradient(ellipse at 90% 50%, #573A42 0%, #38242C 55%, #291C23 100%)` | nur `.member` (254) | mp:34 | 1 | 0 | – |
| `--mp-reward-gradient` | `linear-gradient(110deg, #3F2B30, #2B2023)` | `.featured-reward` (294), `.door.auf` (345) | mp:35 | 2 | 0 | – |
| `--mp-art` | `#4C3238` | Prämien-Bildfläche `.reward-art` (295) | mp:36 | 1 | 0 | – |
| `--mp-card` | `#3C272C` | dunkle Hinweiskarte `.card-dark` (181), `.admin-bottom` (457) – beide ungenutzt | mp:37 | 2 | 0 | `#fff` |
| `--mp-ok` | `#A9C8AE` | Status ok (Kommentar mp:40 „8.9:1“) – **Salbeigrün** | mp:41 | 5 | 0 | – |
| `--mp-warn` | `#E7C58A` | Status Warnung (Kommentar „9.6:1“) | mp:42 | 3 | 0/0/1/2 | – |
| `--mp-danger` | `#F0A5AD` | Status Fehler (Kommentar „fehler 7.2:1“) | mp:43 | 6 | 0 | – |
| `--mp-stage` | `#100D10` | Feierbühne; Kommentar „nur dort“, aber auch `.scanbox` (mp:406) | mp:46 | 3 | 0 | – |
| `--mp-stage-gold` | `#D6B783` | Bühnen-Gold: Orbit, Staub, Eyebrow, Marke, Bühnen-Button | mp:47 | 5 | 0 | – |
| `--mp-stage-rose` | `#BC8F9F` | nur `.mp-arc` (490) | mp:48 | 1 | 0 | – |
| `--mp-stage-text` | `#F5ECE6` | Bühnentext | mp:49 | 5 | 0 | – |
| `--mp-stage-muted` | `#BEADB7` | Bühnentext gedämpft | mp:50 | 4 | 0 | – |
| `--mp-heading` | `'Cormorant Garamond',Georgia,serif` | Display/Serif | mp:52 | 15 | 3/1/3/0 | – |
| `--mp-body` | `Jost,system-ui,-apple-system,sans-serif` | UI/Fließtext | mp:53 | 9 | 0 | – |
| `--mp-r-card` | `18px` | „Standardkarte“ | mp:55 | 10 | 0 | – |
| `--mp-r-control` | `12px` | „sekundäre Controls“ | mp:56 | 12 | 0/0/0/2 | – |
| `--mp-r-pill` | `50px` | „primäre Buttons“ (nur `.btn` 118, `.pill` 197) | mp:57 | 2 | 0 | – |
| `--mp-ease` | `cubic-bezier(.22,1,.36,1)` | Standard-Easing | mp:58 | 15 | 0 | – |
| `--mp-t-hover` | `160ms` | Hover/Zustand | mp:59 | 8 | 0 | – |
| `--mp-t-layer` | `180ms` | Ebene ein/aus (Toast 208, `.ebene/.reveal` 548) | mp:60 | 2 | 0 | – |

Außerhalb des Blocks referenzierte Token mit Zeile: club:643–644 (`.reg .plus .z` line/heading/muted), club:759 (accent, `#bannerBox`), club:762 und 906 (text), club:1249 und 1504 (heading, JS); terminal:650 (line), 660 (muted), 789 (accent, `#zielKarte`), 791 (heading); backend:644 (accent, `.bars div`), 1424 (line), 1425 (muted neben `#2E211B`), 1489 und 1587 (heading), 1515 (accent), 1796 (warn), 1828 (accent), 2043 (heading + accent); club/recht:641, 643, 644, 645, 647. Weitere Custom Properties außerhalb `:root`: `--x`, `--y`, `--delay` (Bühnenstaub, gesetzt in club:1366–1367 und terminal:1238–1239).

**Es gibt keine Token für:** Abstände, Schriftgrößen/Zeilenhöhen, Schatten/Elevation, z-index, Fokusring, Scrim, Icongröße, Control-Höhe, max-width/Messlänge, Hell-Palette (einzige Hell-Werte: Druck).

### 2.2 Alias-Tabelle (mp:62–70, Kommentar „Alte Namen aus früheren Fassungen zeigen auf dieselben Werte“)

In den MP-Seiten **0 Verweise** auf alle 24 Aliase (Markup und JS eingeschlossen) – toter Code. Alte Bedeutungen aus `backend.html:16–26` und `recht.html:11`:

| Alias | → MP-Token | alter Wert | Bedeutungsänderung |
|---|---|---|---|
| `--gold` | `--mp-accent #DFBE95` | backend `#B49153` | Gold-Basis |
| `--gold-deep`, `--gold-dark` | `--mp-accent` | backend `#7C6029` | Tiefgold = Basis (Stufe verloren) |
| `--gold-soft` | `--mp-accent` | backend `#E2CFA6` | Hellgold = Basis |
| `--plum` | `--mp-accent` | backend `#B49153`, recht `#B98570` | Rosébraun wird Gold |
| `--rose-deep`, `--deep` | `--mp-accent` | backend `#7C6029`, recht `#A3705A` | – |
| `--bronze` | `--mp-surface #302327` | backend `#3A2A17` | Dunkelbraun → Pflaume |
| `--bronze-deep` | `--mp-bg #21191A` | backend `#211709` | – |
| `--cream`, `--ivory`, `--pearl`, `--rose-soft` | `--mp-surface` | `#FFFCF7` / `#F6EFE3` / `#F6EFE3` bzw. recht `#F4ECE4` / `#F3E6DF` | **Polarität umgedreht** (hell → dunkel); `--pearl` war Seitenfläche, nicht Karte |
| `--rose` | `--mp-stage-rose #BC8F9F` | backend `#F3E6DF`, recht `#EFDDD1` | **Fläche wird Akzent** |
| `--ink` | `--mp-text #F6E9DF` | backend `#3B2E1E`, recht `#2C2420` | Polarität umgedreht |
| `--ink-soft` | `--mp-text-muted` | (nicht definiert) | – |
| `--soft` | `--mp-text-muted` | backend `#6E5C44`, recht `#8C7A70` | Polarität umgedreht |
| `--on-gold-soft` | `--mp-text-muted` | backend `rgba(247,235,211,.74)` | – |
| `--on-gold` | `--mp-button-text #2E211B` | backend `#F7EBD3` | hell-auf-Gold → dunkel-auf-Gold |
| `--line` | `--mp-line #5A4242` | backend `rgba(180,145,83,.28)`, recht `#E3D6CA` | – |
| `--err` | `--mp-danger #F0A5AD` | – | – |
| `--warn` | `--mp-warn #E7C58A` | backend `#B3261E` (**Rot**, als Fehler genutzt) | **Fehler-Rot → Bernstein-Warnung** |
| `--ok` | `--mp-ok #A9C8AE` | backend `#6B7F5E` (Olivgrün) | grün bleibt grün |
| `--ease` | `--mp-ease` | backend `cubic-bezier(.2,.7,.2,1)` | Kurve geändert |

Summe: 7 Namen auf einen Akzent (löscht die Goldskala soft `#E2CFA6` / base `#B49153` / deep `#7C6029`), 5 Namen auf eine Fläche, 6 Polaritätswechsel, 2 Rollenwechsel. Ohne Alias: `--pearl2 #EFE5D4` und `--shadow` (backend.html:20, 26).

### 2.3 Legacy- und Nebenpaletten (Referenz für ein Hell-Thema)

**Wurzel backend.html:14–27** (Nutzung in Klammern): `--gold #B49153` (3), `--gold-deep #7C6029` (1), `--gold-dark #7C6029` (1), `--gold-soft #E2CFA6` (0), `--bronze #3A2A17` (0), `--bronze-deep #211709` (0), `--on-gold #F7EBD3` (0), `--on-gold-soft rgba(247,235,211,.74)` (0), `--ink #3B2E1E` (6), `--soft #6E5C44` (7), `--cream #FFFCF7` (5: Karten, Felder, Button-Text), `--pearl #F6EFE3` (1: Seite), `--pearl2 #EFE5D4` (0), `--ivory #F6EFE3` (0), `--line rgba(180,145,83,.28)` (11; gemischt ≈ `#EADEC9` auf Crème, `#E4D5BB` auf Pearl), `--plum #B49153` (8), `--rose-deep #7C6029` (0), `--rose-soft #F3E6DF` (0), `--rose #F3E6DF` (3: Zeilen-Hover, Pill, Fokusring), `--deep #7C6029` (2), `--ok #6B7F5E` (2, grünlich H96°), `--warn #B3261E` (4, Rot), `--ease cubic-bezier(.2,.7,.2,1)` (4), `--shadow 0 10px 30px rgba(58,42,23,.10), 0 1px 2px rgba(58,42,23,.06)` (2).

**Wurzel recht.html:11** (Rosé-Fassung): `--ink #2C2420`, `--soft #8C7A70`, `--pearl #F4ECE4` (Seite), `--cream #FBF7F2` (Karte/Pill), `--line #E3D6CA`, `--plum #B98570` (h2-Strich), `--deep #A3705A` (Links, Pill-Text), `--rose #EFDDD1` (TBD). Markendetail `h2::after` 34px × 1px `var(--plum)`, opacity .7, margin-top 8px (recht.html:19).

**404.html:** Hintergrund `#FFFCF7` (Z. 6), Text `#3B2E1E` (Z. 7), Link `#7C6029` (Z. 9), h1 `Georgia,serif` 400 2rem (Z. 8), Fließtext Jost 300; Weiterleitung nach 3 s.

**MP-Druck (mp:552–565):** `html,body` `#fff` / `#2A2024`, `color-scheme:light` (553); `--mp-bg/--mp-surface/--mp-card/--mp-button-bg` `#fff`; `--mp-text/--mp-button-text/--mp-member-text` `#2A2024`; `--mp-text-muted #6B5A63`; `--mp-line #D9CFD4`; `--mp-accent #8E7145` (554–555); `.card,.metrics > div,.customer` `#fff` + `1px solid #D9CFD4`, ohne Schatten (556); `th` `#fff` / `#6B5A63` (557); `.bdelta.plus #3E6B48` (grün) / `.minus #8E2E36` (560); `@page{size:A4; margin:16mm 14mm}` (564). Nicht überschrieben: `--mp-member-muted`, `--mp-ok`, `--mp-warn`, `--mp-danger`, Verläufe (auf Weiß 1.82 / 1.82 / 1.65 / 1.96:1).

**wallet-vorschau/index.html:7:** Seite `#191616`, Text `#f6f0e7`, gedämpft `#c3b2a4`, Schalterrand `#6d5c50`, Schaltertext `#dfd0c1`, aktiv `#e3cfb4` mit `#201b18`, QR-Platzhalter `#fff`/`#626262`, Kartenschatten `0 12px 30px #0003`, Outline `#0001`, Fokus `3px solid white` Versatz 4px, Kartenradius 17px, QR-Radius 6px, Schalter 999px.

**Farbton-Familien (berechnet):** Legacy backend H33–40° (gelb-warm), Legacy recht H17–33° (rosé-warm), MP-dunkel-Neutrale H342–6° (rosé/mauve), MP-Druck H328–336° (mauve); Akzente überall H32–40° (Champagner/Gold).

### 2.4 Beinahe-Duplikate im Token-Satz

- `--mp-accent #DFBE95` ↔ `--mp-button-bg #E0BE98`: **1.00:1**, zwei Token für dieselbe Farbe (gerendert: Hintergrund `#DFBE95` ×84, `#E0BE98` ×62).
- `--mp-text #F6E9DF` / `--mp-member-text #FAE8DE` / `--mp-stage-text #F5ECE6`: drei fast identische Hellwerte.
- `--mp-warn #E7C58A` (OKLCH h 80.9°) ↔ `--mp-accent #DFBE95` (h 72.7°): ΔE_OK 0.029 für alle Sehtypen.
- Einwilligungsbereich: `#dfbe95` (= Akzent, klein geschrieben) und `#21191a` (= bg) als Literale; `#2b2224`/`#302820`/`#49382d` liegen neben `--mp-surface #302327`/`--mp-card #3C272C`.

### 2.5 Drift: hartkodierte Farbliterale nach Datei

**MP-Block außerhalb Abschnitt 1:** 90 Literale (69 verschieden) + 22× `transparent` + 1× `currentColor` (mp:112). Davon 22 Token-Ableitungen, 49 frei (41 verschieden), 19 Druck (7 verschieden).

*Token-Ableitungen (Alpha eingebacken, kein Alpha-Token):*

| mp | Literal | = Token | Rolle |
|---|---|---|---|
| 98 | `rgba(223,190,149,.45)` | accent 45 % | Link-Unterstreichung |
| 136 | `rgba(240,165,173,.45)` | danger 45 % | Rand `.btn.gefahr` |
| 142 | `rgba(46,33,27,.3)` | button-text 30 % | Spinner-Spur |
| 143 | `rgba(223,190,149,.3)` | accent 30 % | Ghost-Spinner-Spur |
| 162, 173 | `rgba(223,190,149,.22)` | accent 22 % | Fokus-Halo |
| 164 | `%23DFBE95` | accent (URL-kodiert) | Select-Pfeil |
| 190 | `rgba(90,66,66,.55)` | line 55 % | Tabellenzeilen-Trenner |
| 197 | `rgba(223,190,149,.14)` | accent 14 % | `.pill` |
| 198 / 199 / 200 | `rgba(169,200,174,.16)` / `rgba(231,197,138,.16)` / `rgba(240,165,173,.16)` | ok / warn / danger 16 % | Pill-Varianten |
| 212 | `rgba(240,165,173,.6)` | danger 60 % | Rand `.toast.err` |
| 216 | `rgba(231,197,138,.08)` | warn 8 % | `.unklar` |
| 388 | `rgba(223,190,149,.18)` | accent 18 % | Pad aktiv |
| 416 | `rgba(223,190,149,.1)` | accent 10 % | `.mp-kurz` |
| 433 | `rgba(33,25,26,.5)` | bg 50 % | Sidebar-Hover |
| 476 | `rgba(16,13,16,.86)` | stage 86 % | Feier-Scrim |
| 488 | `#D6B78318`, `#D6B78315` | stage-gold 9 % / 8 % | Orbit-Glanz |
| 489 | `#D6B78324` | stage-gold 14 % | Halo |
| 617 | `rgba(16,13,16,.78)` | stage 78 % | Admin-Dialog-Backdrop |

Der Akzent erscheint in sechs Alphastufen (.1, .14, .18, .22, .3, .45).

*Freie Literale (kein Token):* 161 `#8F7677` (Platzhalter, überschreibt mp:86) · 207 `rgba(0,0,0,.45)` (Toast-Schatten) · 222 `#6C4C483F` (Markenleisten-Rand ≠ `--mp-line`) · 234 `#1C130BB5` (Sheet-Scrim) · 255 `#A17C6655` (Mitgliedskarte Rand) · 257 `#CBAE8029` (Innenrahmen) · 259 `rgba(255,240,218,.13)` (Glanz) · 272 `#C6A875` (Kette) · 277 `#FFFDF4, #FAEFDF, #E8D5C5, #B8A3A0, #F3E6D4` (Kettenperle) · 278/280 `#A8998A`, `#1E140F70` (Perlenschatten) · 288 `#DFC69C40` (Fußtrenner) · 296 `#BA966D` (Orbit Prämie) · 298 `#FFFDF7, #F9EEDF, #DFCBBF, #A79595, #F3E9DC` (Art-/Dialog-/Bottom-Perle) · 299 `#9C898744`, `#4B322B24` · 408 `rgba(255,249,244,.8)` (Scan-Rahmen) · 418 **und** 485 `#FFF9E9, #EDDBCB, #BF969F, #695360, #E4C9B8` (identischer Verlauf doppelt) · 419 `rgba(0,0,0,.4)` · 479 `#493A45` (Bühnenrand) · 480 `#30202C` (Bühnen-Glow) · 482 `rgba(255,255,255,.06)` · 486 `#24181C88`, `#0008` · 491 `#30202C` (Häkchen) · 498 `#725942` · 499 `#2D2025`, `#1A151A` · 502 `#493A45` · 503 `#F4DFB940` · 505 `#8D7785` (Bühnen-Ghost-Rand).

*Druck:* `#fff`, `#2A2024`, `#6B5A63`, `#D9CFD4`, `#8E7145`, `#3E6B48`, `#8E2E36`.

**Außerhalb des MP-Blocks:**

| Datei | Literale (verschieden) | Inhalt |
|---|---|---|
| club/index.html | 22 (12) | club:11 `#21191A` (`theme-color`); club:651 `#F4DFB933` (`.mp-gsap-shine`); Seitenrest club:653–669: `#927875`, `#2b2224`, `#f7eee7`, `#dfbe95`, `#49382d`, `#f5ddbc`, `#d7c5bd`, `#ffe3b8`, `#302820`, `#21191a`. **Markup/JS club:671–1533: keine Hex-/rgba-Literale.** |
| terminal/index.html | 9 (7) | Rad-Canvas T:1571–1577 `#3F2B30`, `#F6E9DF`, `#DFBE95` ×3, `#5A4242`, `#302327`; T:665 `#F4DFB933`; T:9 `#21191A` |
| backend/index.html | 2 (2) | Heatmap B:1423–1425: `rgba(223,190,149,${a*.9})` und `#2E211B` (alles andere inline nutzt `var(--mp-*)`) |
| club/recht.html | 2 (2) | u. a. recht:645 `rgba(231,197,138,.18)` (`.tbd`) |
| Wurzel backend.html | Token + Literale | backend.html:30 `radial-gradient(900px 500px at 8% -10%,rgba(255,255,255,.75),transparent 60%),var(--pearl)`; :59 Verlauf `#B49153→#7C6029`, Schatten `rgba(124,96,41,.24)`; :57 `rgba(124,96,41,.3)`; :54 `rgba(255,255,255,.34)` (Sheen); :68/87/833 `#FFF9F4`; :85/923 `#C6957F` (Rosé-Rest); :831 `rgba(185,133,112,${a*.92})` (Rosé-Rest); :97 `#fff`; :100 `#D8CBB4` |

**Scrims (drei verschiedene):** `#1C130BB5` + `blur(7px)` (Sheet, mp:234), `rgba(16,13,16,.86)` + `blur(6px)` (Feier, mp:476), `rgba(16,13,16,.78)` ohne Blur (Admin-Dialog, mp:617).

**Perlen-„Material“:** drei Verlaufsrezepte ohne Token (mp:277, mp:298, mp:418 = mp:485).

---

## 3. Typografie

### 3.1 Familien und geladene Schnitte

| Familie | Datei (fonts.css) | Stil/Gewicht | Größe (B) |
|---|---|---|---|
| Cormorant Garamond | font-0.ttf | italic 400 | 293 036 |
| Cormorant Garamond | font-1.ttf | italic 500 | 293 244 |
| Cormorant Garamond | font-2.ttf | normal 400 | 290 236 |
| Cormorant Garamond | font-3.ttf | normal 500 | 290 496 |
| Cormorant Garamond | font-4.ttf | normal 600 | 290 392 |
| Jost | font-5.ttf | normal 400 | 58 796 |
| Jost | font-6.ttf | normal 500 | 58 936 |

Alle `font-display:swap`, unkomprimiertes TTF. Beide Familien enthalten kyrillische Glyphen (Canvas-Test „Привет, мир“: kein Fallback).

- **Im MP-Block genutzt:** nur Gewichte 400 und 500 sowie italic 400 (`h1 em` mp:94; `.club-footer > span` mp:316 `font:italic 20px`). Cormorant 600 nur im Rad-Canvas (`"600 24px 'Cormorant Garamond'"`, T:1577; Rad-Beschriftung `"400 22px Jost"`, T:1573).
- **Nicht geladene Gewichte in Gebrauch (synthetisch):** Jost 600 bei `.consent-state` (club:660) und `#rechtStatus` (club:669); Jost 700 bei `<strong id="rewardProgressName">` (club:798, UA-Stil) und `b` in club/recht (gerendert 700 ×32).
- **Legacy:** Fließtext Jost 300 (backend.html:29, recht.html:13, 404.html:7) – lokal nicht vorhanden; „Great Vibes“ geladen (backend.html:9), 0 Verwendungen; 404-Überschrift Georgia.
- Dritte Schrift auf MP-Seiten: Browser-`monospace` bei `code#empfLink` (Empfehlungslink).
- Explizite Familienzuweisung im Block: heading 15× (mp:92, 232, 266, 304, 316, 322, 340, 343, 350, 354, 371, 383, 386, 437, 496), body 9× (mp:78, 120, 155, 188, 269, 344, 372, 438, 447).
- Große Ziffern uneinheitlich: `.metrics strong` **Jost** `500 32px/1.15` (mp:447); alle anderen in Cormorant (`.balance` 66, `.customer-balance` 54, `.amount` 56, `.empf .zahlen span` 34).

### 3.2 Grundstile (Abschnitt 2)

| Selektor | Familie | Gew. | Größe | Zeilenhöhe | Laufweite | Sonstiges | mp |
|---|---|---|---|---|---|---|---|
| body | body | 400 | 16px | 1.5 | – | antialiased | 76–80 |
| h1 | heading | 400 | 38px | 1.06 | -.035em | `h1 em` italic 400 | 93–94 |
| h2 | heading | 500 | 27px | 1.15 | -.025em | | 95 |
| h3 | heading | 500 | 21px | 1.2 | – | | 96 |
| `.eyebrow` | body | 500 | 12px | (1.5) | .15em | uppercase, muted | 105 |
| `.tiny,.small,.muted` | body | – | 13px | (1.5) | – | muted | 106 |
| `.lead` | body | – | 16px | 1.6 | – | muted | 107 |
| `.leer,.empty` | body | – | 14px | (1.5) | – | muted, zentriert | 109–110 |
| input/select/textarea | body | – | `max(1rem, 16px)` (mp:85) → **überschrieben durch 16px** (mp:155) | (1.5) | – | | 85/155 |
| label | body | 500 | 14px | (1.5) | .02em | muted, margin-bottom 6px | 152 |

Verhältnis h1:h2:h3 = 38:27:21 (≈1.41 und 1.29), keine modulare Skala.

### 3.3 Schriftgrößen – deklariert (MP-Block, 104 Vorkommen, 30 Werte)

| Wert | Anzahl | mp-Zeilen |
|---|---|---|
| 10px | 1 | 227 |
| 12px | 13 | 105, 188, 201, 231, 287, 303, 318, 344, 438, 446, 449, 495, 535 |
| 13px | 19 | 106, 197, 228, 269, 305, 306, 310, 312, 317, 355, 357, 372, 373, 375, 381, 397, 400, 456, 501 |
| 14px | 19 | 110, 132, 135, 145, 152, 182, 187, 216, 324, 351, 379, 390, 402, 422, 432, 470, 471, 502, 531 |
| 15px | 3 | 207, 455, 465 |
| 16px | 5 | 78, 107, 120, 155, 497 |
| 17px | 1 | 500 |
| 18px | 3 | 217, 322, 340 |
| 19px | 1 | 437 |
| 20px | 4 | 232, 316, 343, 448 |
| 21px | 2 | 96, 304 |
| 22px | 2 | 350, 611 |
| 24px | 4 | 179, 452, 469, 530 |
| 25px | 1 | 603 |
| 26px | 4 | 240, 386, 458, 481 |
| 27px | 1 | 95 |
| 28px | 2 | 591, 608 |
| 30px | 2 | 333, 384 |
| 32px | 1 | 447 |
| 33px | 1 | 442 |
| 34px | 2 | 354, 598 |
| 38px | 2 | 93, 247 |
| 40px | 2 | 268, 491 |
| 44px | 2 | 606, 607 |
| 52px | 2 | 267, 612 |
| 54px | 1 | 371 |
| 56px | 1 | 383 |
| 66px | 1 | 266 |
| `clamp(32px,6vw,46px)` | 1 | 496 |
| `max(1rem, 16px)` | 1 | 85 (tot) |

Außerhalb des Blocks: club:643 15px, club:762/848 inline 15px, club:1249 `font:500 18px`, club:1279/1419 16px, club:1504 `font:500 22px`, terminal:791 `font:500 21px/1.3`, backend:1489 19px, 1587 26px, 1828 15px, 2043 21px; club/recht:636–639 (40/28/20/16px).

### 3.4 Schriftgrößen – gerendert (MP-Seiten, 390 + 1280, alle Zustände)

12px ×281 · 13px ×298 · 14px ×612 · 15px ×22 · 16px ×490 · 17 ×2 · 18 ×18 · 19 ×4 · 20 ×60 · 21 ×22 · 24 ×34 · 25 ×4 · 26 ×52 · 27 ×42 · 28 ×26 · 32 ×17 · 33 ×4 · 34 ×21 · 38 ×17 · 40 ×2 · 44 ×4 · 46 ×1 · 54 ×2 · 56 ×2 · 66 ×8 → **29 verschiedene Größen**; 12/13/14/16 tragen 1681 von 1943 Textelementen.

**Beinahe-Duplikat-Cluster (markiert):** 15 ↔ 14/16 · 17/18 · 19/20/21 · 24/25/26/27/28 (vier h2-Größen 24/25/26/27 innerhalb von 3 px) · 32/33/34 · 38/40 · 44/46 · 54/56 · Legacy 13.5 / 14.4.

**Rollen in Gebrauch:**

- UI/Jost: 10 (Logo-Zeile, ungenutzt) · 12 (Caption/Overline: eyebrow, th, rank, legal, KPI-Label) · 13 (small) · 14 (UI/Control) · 16 (body, lead, Primärbutton, Feld); Ausreißer 15 (Toast mp:207, `.customer-row` mp:455, `.filter input` mp:465) und 17 (`.mp-mark` mp:500).
- Überschriften/Cormorant: h1 38 (mp:93, 247) · 34 (≤480, mp:598) · 33 (Admin, mp:442) · 28 (Admin ≤480, mp:608) · club/recht 40; h2 27 (mp:95) · 26 (Sheet mp:240, `.admin-bottom` mp:458) · 25 (≤480 mp:603) · 24 (`.card h2` mp:179, `.section-title` 452, `body.admin` 469, Inline-Feier 530) · Bühne `clamp(32px,6vw,46px)` (mp:496); h3/Titel 21 (mp:96, 304) · 22 (`.ziel` 350) · 20 (`.door` 343, `.club-footer` 316, `.avatar.large` 232) · 19 (Sidebar-Fuß 437) · 18 (Prämienliste 322, Board 340).
- Ziffern: `.balance` 66 → 52 (`.lang`, mp:267; ≤340 mp:612) → 40 (`.sehrlang`, mp:268) · `.amount` 56 → 44 (≤480, mp:606) · `.customer-balance` 54 → 44 (mp:607) · `.empf` 34 · `.metrics` 32 → 28 (≤768, mp:591) · Pad 26 → 22 (≤340, mp:611).

### 3.5 Zeilenhöhen

Deklariert (25 Vorkommen, 10 Werte): `1` ×4 (mp:266, 333, 354, 371) · `1.06` ×2 (93, 304) · `1.1` (383) · `1.12` (496) · `1.15` ×3 (95, 322, 447) · `1.2` (96) · `1.3` (350) · `1.5` ×2 (78, 269) · `1.6` (107) · **`normal` ×9 implizit** durch `font:`-Kurzschreibweise ohne `/lh` (mp:232, 316, 340, 343, 344, 372, 386, 437, 438). Seitenrest: club/recht `1.7` (recht:639), Consent `1.5` (club:654).

Gerendert: 18px ×277, 19.5 ×294, 21 ×612, 24 ×360, 25.6 ×32, 27.2 ×146, 31.05 ×42, 27.6 ×34, 40.28 ×17, 66 ×8, `normal` ×78 (v. a. Pad-Tasten). Beinahe-Duplikate: 20.7/21, 22.26/22.5, 25.2/25.5/25.6, 27.2/27.3/27.6, 28.75/29.68/29.9/31.05/32.2, 34/34.98/35.84/36.04/36.8.

### 3.6 Gewichte

Deklariert: 400 ×14 (mp:78, 93, 94, 266, 269, 310, 344, 354, 371, 372, 383, 386, 438, 496), 500 ×21 (mp:95, 96, 105, 120, 152, 188, 197, 232, 304, 322, 340, 343, 350, 374, 380, 396, 403, 421, 437, 447, 455), italic ×1 (316). Gerendert: 400 ×1354, 500 ×659, **700 ×32 (synthetisch)**.

### 3.7 Laufweite und Versalien

| Wert | Wo (mp) |
|---|---|
| -.04em | `.balance` 266 |
| -.035em | h1 93 |
| -.025em | h2 95 |
| -.02em | `.mp-feier h2` 496 |
| 0 | `.balance > .sub` 269 |
| .01em | `.btn` 120 |
| .015em | `.reward-copy .ready` 303 |
| .02em | label 152 |
| .06em | `th` 188; `.list .item.gewinn .p` 400 |
| .08em | `.rank` 201 |
| .12em | `.mp-mark` 500; `li.titel` 535 |
| .15em | `.eyebrow` 105 |
| .22em | `.mp-feier .mp-eyebrow` 495 |
| .24em | `.brandbar .logo span` 227 (ungenutzt) |
| .26em | club/recht `.brand` (recht:641) |

`text-transform:uppercase` bei mp:105, 188, 201, 400, 495, 535 (gerendert ×183) mit **fünf verschiedenen Versal-Laufweiten** (.06/.08/.12/.15/.22em); zusammen mit nicht-versalen gesperrten Labels **sieben weite Laufweiten** für eine Rolle. Legacy: backend.html:72 .16em, :75 .14em, :36 .28em; recht.html:31 .12em, :23 .26em.

### 3.8 Ziffern und Formate

- `font-variant-numeric:tabular-nums` bei `.num`, `td.num`, `.metrics strong`, `.amount` (mp:383), `.customer-balance` (mp:371), `.next-number`, Prämienpunkten (mp:398). **`lining-nums` nirgends** → Cormorant zeigt Mediävalziffern bei Saldo 54/56px und Pad 26px (Pad ohne tabular).
- Formate: Terminal Saldo roh „1284“ (T:1315), Minus als Bindestrich „-300“, Datum „20. Sept.“ (T:928), Betrag `euro()` „129,50 €“ (T:921); Backend „1.284“, „−300“ (U+2212 nur B:1286–1287) oder „-300“, Datum „20.9.2026“ (`toLocaleDateString("de-DE")`, B:1120), „3.8 %“ per `toFixed(1)` (B:1242, Punkt statt Komma), „8 T“, „12.400,50 €“.

---

## 4. Abstände, Radien, Rahmen, Schatten, Bewegung, Ebenen, Umbrüche

### 4.1 Abstände

**Padding (MP-Block, 85 Deklarationen):** 0 ×33 · 3 ×1 · 4 ×1 · 6 ×2 · 8 ×10 · 9 ×3 · 10 ×15 · 11 ×1 · 12 ×14 · 14 ×15 · 15 ×2 · 16 ×11 · 17 ×3 · 18 ×3 · 19 ×2 · 20 ×11 · 22 ×5 · 23 ×1 · 24 ×6 · 25 ×3 · 28 ×2 · 29 ×1 · 30 ×6 · 32 ×2 · 38 ×1 · 48 ×1 · `min(90px,12vh)` ×1.

**Margin (89 Deklarationen):** 0 ×48 · auto ×13 · 3 · 4 ×4 · 5 · 6 ×7 · 7 ×3 · 8 ×8 · 9 · 10 ×3 · 12 ×10 · 14 ×5 · 15 ×2 · 16 ×10 · 17 · 20 ×4 · 21 ×2 · 22 ×5 · 24 ×3 · 25 ×2 · 27 ×2 · 28 ×2 · 32 · 35. Negativ: -8 (410), -9 (141), -10 (529), -20 (521), -24 (529); außerdem 12vh (412), 16mm/14mm (564).

**Gap (52 Deklarationen):** 0 · 2 ×2 · 4 ×2 · 5 ×3 · 6 ×2 · 7 ×3 · 8 ×11 · 10 ×10 · 12 ×13 · 14 · 16 ×3 · 18 ×2 · 24 · 26; zweiachsig `0 12px`, `2px 12px`, `4px 12px`, `8px 14px` (T:651).

**Vereinigung aller px-Abstände:** 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 35, 38, 48, 90 → **33 Werte, nur 9 auf 4-px-Raster** (4, 8, 12, 16, 20, 24, 28, 32, 48). Gerendert, Padding-Seiten: 8 ×771, 9 ×504, 10 ×412, 11 ×136, 12 ×460, 14 ×394, 16 ×208, 17 ×62, 18 ×40, 19 ×52, 20 ×140, 22 ×102, 23 ×7, 24 ×184, 25 ×16, 28 ×14, 29 ×8, 30 ×60, 32 ×18 (plus UA-Werte 1/6 auf unformatierten Buttons).

**Inline-Abstände (style-Attribute):** club 26 `style="` + 13 `el()`-Stile + 10 `.style`-Schreibzugriffe (Margins 6/8/10/12/16/20/24 u. a.; die Einzelliste ist eine Arbeitsnotiz, nicht im Repository); terminal 19 (alle im Markup) + 6 `.style` (Margins 4/6/8/10/12/14/16/28); backend 89 (51 Markup, 38 JS; häufig `margin-top:8px` ×12, `16px` ×9, `12px` ×7, `18px` ×5, `10px` ×4, `0` ×4, `flex:0 0 auto` ×3); club/recht 2. Legacy backend.html: `margin-top` 20 ×16, 16 ×12, 12 ×10, 18 ×7, 14 ×7, 10 ×4.

**Seitenränder (Gutter):**

| Container | Desktop | ≤768 | ≤480 |
|---|---|---|---|
| `.club` | 28px (mp:244) | – | **19px** (mp:597) |
| `.workspace` | 32px (mp:364) | 20px (mp:583) | **`20px 17px`** (mp:604) |
| `.admin-content` | 30px (mp:440) | 20px (mp:583) | **`20px 17px`** (mp:604) |
| Terminal/Admin `.brandbar` | `22px 30px` (mp:363, 426) | 20px (mp:594) | – |
| Sheet / `.login` / `.mp-feier` | 20px (mp:235) / 20px (mp:412) / 16px (mp:475) | | |
| club/recht `.wrap` | `24px 24px 80px` (recht:635) | | |

Mobiler Seitenrand damit 16 / 17 / 19 / 20 px je nach Seite; die mobile „Bereiche“-Schaltfläche der Verwaltung hat gar keinen (x = 0, §5.13).

**Box-Innenabstände:** `.card` 24 (mp:177) · `body.admin .card` 20 (468) · `.card-dark`/`.customer`/`.admin-bottom` 25 (181, 368, 457) · `.ziel` 20 (349) · `.sheet .card`/`.dialog` 30 (238) · `.mp-admin-dialog` 24 (616) · `.member` `22px 22px 16px` / ≤480 `20px 16px 14px` (255/599) · `.reward-copy` `17px 15px` / ≤480 `15px 12px` (302/601) · `.metrics > div` 16 (445) · `.mp-reward` `18px 20px` (498) · `.hinweis` `12px 16px` (182) · `.unklar` `14px 16px` (215) · `.leer` `24px 16px` (109) · `.toast` `14px 20px` (207) · `.consent-card` 18 (club:654) · `#rechtsBestaetigung` 22 (club:663) · Inline-Bühne `14px 16px` (mp:528) · recht `.box` `16px 20px` (recht:644). → Karten-Paddings **18/20/22/24/25/30 px**.

**Abschnittsrhythmus:** `.club section` margin-top 32 (mp:248) · `.metrics` `28px 0 35px` (444) · `.section-title` `24px 0 14px` (451) · `.reward-heading` `27px 0 17px` (291) · `.searchrow` mb 27 (174) · `.admin-bottom` mt 28 (457) · `.workspace > h1` `12px 0 25px` (365) · `.main-action` mt 25 (125) · `.booking-separator` mt 24 (392) · `.next` `21px 0 10px` (307) · `.club-footer` `21px 0` (315); Terminal-Stapel gap 26 (T:645/646), ≤768 18 (T:654); Backend Karte→Karte 16 (mp:468). Gemessene Club-Dashboard-Abstände bei 390: 0, 27, 17, 0, 32, 10, 21, 10, 25, 32, 32, 32, 21, 21 px. Abschnittswerte in Gebrauch: 10, 16, 17, 18, 20, 21, 22, 24, 25, 26, 27, 28, 32, 35 px.

**Beinahe-Duplikat-Cluster (nur vorhandene Werte):** 8/9/10/11/12 · 14/15/16/17/18/19/20 · 22/23/24/25 · 28/29/30/32 · Gaps 5/7/8, 10/12/14, 16/18, 24/26.

### 4.2 Control-Höhen

`min-height` im Block (32 Vorkommen): 44px ×15 (mp:87, 91, 132, 135, 146, 147, 274, 317, 333, 336, 390, 432, 465, 481, 534) · 48px ×5 (118, 155, 169, 504, 611) · 40px (219 `.unklar .btn`) · 46 (171) · 52 (386) · 56 (395) · 64 (343) · 80 (383) · 96 (160) · 100 (619) · 154 (295) · 30 (288) · 0 (166) · `calc(100vh - 92px)` (427). Buttons erben `line-height:1.5` über `font:inherit` (mp:102) – Padding bestimmt die echte Höhe, nicht min-height.

Gemessene Höhen siehe §5.1; Leiter aller gerenderten Button-Höhen: **30 · 40 · 44 · 45 · 46 · 47 · 49 · 52 · 54 · 56 · 57 · 60 · 84 px** (dazu Listeneinträge 72/96, gestreckte „Bereiche“-Schaltfläche 210/229, Prämienkarten-Button 154–172). Felder: 50px (Text/Select), 52px (`type=date`), 44px (`.filter`).

### 4.3 Radien

| Wert | Anzahl | Verwendung (mp) |
|---|---|---|
| `var(--mp-r-card)` 18px | 10 | 110, 177, 181, 237, 255, 349, 368, 406, 457, 616; Literal club:663 |
| `var(--mp-r-control)` 12px | 12 | 132, 136, 156, 169, 182, 206, 216, 336, 343, 387, 395, 415; Literal 12px mp:359 |
| `var(--mp-r-pill)` 50px | 2 | 118 (`.btn`), 197 (`.pill`) |
| 50% | 13 | 141, 148, 230, 275, 296, 329, 417, 481, 484, 487, 489, 490, 494 |
| 3px | 1 | 313 (`.track`); backend `.bars div` `3px 3px 0 0` (B:644) |
| 8px | 1 | 431 (`.sidebar button`) |
| 11px | 1 | 257 (`.member::before`) |
| **12.6px** | 1 | 294 (`.featured-reward`) |
| 15px | 1 | 328 (`.sw`) |
| 16px | 3 | 408 (`.scanbox .frame`), 498 (`.mp-reward`), 528 (Inline-Bühne); club:654 (`.consent-card`) |
| 24px | 1 | 479 (`.mp-feier .buehne`) |
| 30px | 1 | 390 (`.categories > button`, ungenutzt) |
| `0 0 50% 50%` | 1 | 273 (Kette) |
| `48% 52% 47% 53%`, `49% 51% 47% 53%` | je 1 | 276, 297 (organische Perlen) |

Außerdem Legacy 5px (recht `.tbd`), 16px (recht `.box`), 20px (backend Karte/Felder), 24px, 999px; wallet-vorschau 17px/6px/999px; club/recht `.tbd` 5px.
**Buttons mischen Radien:** `.btn` und `.btn.sm` 50px, `.btn.ghost`/`.secondary`/`.btn.gefahr`/`.btn.ghost.sm` 12px, `.categories` 30px, `.sidebar button` 8px, `.sw` 15px, Wallet-Buttons 0.

### 4.4 Rahmen

Gerendert: 1px rundum ×376; `0 0 1px` ×304; `1px 0 0` ×50; **2px ×74** – gewollt nur bei `.consent-card` (club:654) und `.orbit` (mp:296); alle `.secondary`-Buttons und beide Wallet-Buttons haben 2px nur durch den UA-Stil `outset`. Rahmenfarben: `#5A4242` ×420, `#5A4242@.55` ×174, `#6C4C48@.247` ×26 (Markenleiste), `#DFBE95` ×18, `#A9C8AE` ×4, `#FFFFFF` ×16 (UA-Wallet-Buttons) sowie `#927875`, `#A17C66@.333`, `#C6A875`, `#DFC69C@.25`, `#BA966D`, `#E0BE98`, `#493A45`, `#725942`, `#D6B783`. `.card` hat `border:1px solid transparent` (mp:177). Linker Akzentbalken 3px: `.hinweis` (182), `.beob` (471), recht `.box` (recht:644, warn).

### 4.5 Schatten (11 Vorkommen, 10 verschieden, keine Token)

| Wert | mp | Rolle |
|---|---|---|
| `0 0 0 3px rgba(223,190,149,.22)` | 162, 173 | Fokus-Halo Felder/Suche |
| `none` | 172 | `.search input` |
| `0 14px 34px rgba(0,0,0,.45)` | 207 | Toast – einzige UI-Elevation |
| `inset -2px -3px 5px #A8998A, 0 5px 9px #1E140F70` | 278 | Kettenperle |
| `inset -2px -3px 5px #A8998A` | 280 | Deko-Perle |
| `inset -4px -5px 7px #9C898744, 5px 12px 18px #4B322B24` | 299 | Art-/Dialog-/Bottom-Perle |
| `0 4px 12px rgba(0,0,0,.4)` | 419 | `.mp-kurz`-Perle |
| `inset -8px -7px 14px #24181C88, 0 14px 26px #0008` | 486 | Bühnenperle |
| `0 0 22px #D6B78318, inset 0 0 20px #D6B78315` | 488 | Orbit-Glanz |
| `none !important` | 556 | Druck |

Seitenrest: `.consent-card:has(input:checked)` `0 0 0 1px #dfbe95` (club:656). Sheets/Dialoge haben **keinen** Schatten (nur Scrim). Legacy: `--shadow`, Button `0 10px 26px rgba(124,96,41,.24)`, Hover `0 16px 34px rgba(124,96,41,.3)`, Fokus `0 0 0 4px var(--rose)` (backend.html:26, 52, 57, 59).

### 4.6 Deckkraft, Filter, Scrims

Deckkraft (12 Werte): 0, .2, .3, .35 (Advent-Bild), .42 (Deko-Perle), .45 (Button disabled mp:138), .5 (`.door:disabled` mp:347; Orbit), .55 (Felder disabled mp:163, Listeneintrag disabled mp:401), .7, .8, .85 (backend `.bars div`), .9, 1. Filter: Hover `brightness(1.08)` (mp:126), aktiv `brightness(.94)` (mp:127); Backdrop `blur(7px)` (mp:234), `blur(6px)` (mp:476). Scrims siehe §2.5.

### 4.7 Bewegung

**Token:** `--mp-ease cubic-bezier(.22,1,.36,1)`, `--mp-t-hover 160ms`, `--mp-t-layer 180ms`.

**Transitions:** `.btn` filter/background/border-color/box-shadow `var(--mp-t-hover) var(--mp-ease)` (mp:122–123) · Felder border-color/box-shadow hover-Token + ease (157) · Toast transform `var(--mp-t-layer)` + ease (208) · `.pearl::before` `transform .35s ease` (278) · `.art-pearl` `transform .6s var(--mp-ease)` (300) · `.track > span` `width .6s var(--mp-ease)` (314) · `.sw::after` transform hover+ease, `background var(--mp-t-hover)` ohne Easing (329) · `#wheel` `transform 4.8s cubic-bezier(.16,.84,.26,1)` (411).

**Keyframe-Animationen (Keyframes mp:144, 261, 405, 538–547):**

| mp | Animation | Auslöser |
|---|---|---|
| 142 | `mp-dreh .8s linear infinite` | Spinner `.laedt` |
| 238 | `mp-ebene .4s var(--mp-ease) both` | Sheet-Karte/Dialog |
| 260 | `lp-shine 1.5s ease both` | `.member:hover`, nur `(hover:hover)` |
| 404 | `zahl .6s var(--mp-ease)` (scale 1 → 1.08 → 1) | `.stand.puls` (spielt nie, §5.12) |
| 416 | `mp-ebene 260ms var(--mp-ease) both` | `.mp-kurz` (ungenutzt) |
| 419 | `mp-seal .65s ease both` | `.mp-kurz`-Perle |
| 477 | `mp-ebene 250ms var(--mp-ease) both` | `.mp-feier.an` |
| 508, 516 | `mp-rise 1.5s cubic-bezier(.22,1,.36,1) both` | Bühnenperle (level, both) |
| 509 | `mp-ring 1.4s cubic-bezier(.22,1,.36,1) both` | Orbit |
| 510 | `mp-glow 2s ease-out both` | Halo |
| 511 | `mp-spark 1.8s ease-out both`, Verzögerung `calc(.4s + var(--delay))` | Staub |
| 512 | `mp-shine 1.4s .6s ease-in-out both` | Prämienglanz |
| 513/514 | `mp-open-left/right 1.6s ease both` (±46px/±30° bei 70 %, ±58px/±40° bei 100 %) | Bögen (unlock) |
| 515, 517 | `mp-reveal 1.5s cubic-bezier(.22,1,.36,1) both` (opacity .35, translateY 16px, scale .94 → none) | Prämie (unlock, both) |
| 518 / 519 | `mp-seal 1.1s ease both` / `mp-seal 1s ease both` | Häkchen / Perle (redeem) |
| 522–523 | kompakt: Dauer `.65s !important`, Verzögerung `0s !important` | `.mp-compact` |
| 548 | `.ebene,.reveal`: `mp-ebene var(--mp-t-layer) var(--mp-ease) both` | – |

mp:507 kennzeichnet die Feier-Zeiten als „exakt aus der Studie (V21)“.

**Dauern (19):** .01ms (Reduced Motion, mp:572) · 0s · 160ms · 180ms · 250ms · 260ms · .35s · .4s · .6s · .65s · .8s · 1s · 1.1s · 1.4s · 1.5s · 1.6s · 1.8s · 2s · 4.8s. **„Ebene rein“ allein hat vier Dauern:** 180ms (Token), 250ms (Feier), 260ms (`.mp-kurz`), 400ms (Sheet).
**Easings (7):** `var(--mp-ease)` ×15 · derselbe Wert als Literal `cubic-bezier(.22,1,.36,1)` ×5 (mp:508, 509, 515, 516, 517) · `ease` ×7 · `ease-out` ×2 · `ease-in-out` ×1 · `linear` ×1 · `cubic-bezier(.16,.84,.26,1)` ×1.

**GSAP `club/assets/celebration-motion.js`** (57 Z., geteilt mit Terminal T:668): läuft nur mit `window.gsap` (Z. 3); `window.LaPerleCelebration = { play, stop }` (53); `play()` bricht ab bei `prefers-reduced-motion: reduce` oder `document.hidden` (18), sonst Klasse `.mp-gsap` (setzt CSS-Animation der Bühne außer Kraft, club:649). Zeitleiste `ease:'power3.out', duration:0.7` (31): `.mp-pearl` von `y:24` (redeem 0), `scale:0.78` (redeem 1.15), `opacity:0.4` bei 0 (32); `.mp-orbit` `scale:0.65, opacity:0, duration:0.95` bei 0.08 (33); `.mp-halo` `scale:0.7, opacity:0, duration:1.1` bei 0.05 (34); `.mp-copy` `y:8, opacity:0.45, duration:0.55` bei 0.14 (35); unlock/both: `.mp-left/.mp-right` `x:0, rotation:0, opacity:0.8` → `x:∓48, rotation:∓32, opacity:0, duration:0.85` bei 0.05 (37–38); redeem: `.mp-check` `scale:0.5, opacity:0, duration:0.45, ease:'back.out(1.5)'` bei 0.2 (40); Prämie `y:12, scale:0.97, opacity:0.4` bei 0.5 (both) bzw. 0.25 (41); Glanz `span.mp-gsap-shine` `xPercent -120 → 120, duration:0.95, ease:'power1.inOut'` bei 0.65 (both) bzw. 0.4 (42); Staub (nicht redeem) `opacity 0.65 / 0.15s`, dann `x:cos(a)*90, y:sin(a)*75, scale:0.2, opacity:0 / 0.7s` bei `0.18 + (i%3)*0.04` (43–47); kompakt `timeline.duration(0.65)` (49); `visibilitychange`/Reduced-Motion-Wechsel → `settle()` (54–56).

**GSAP `club/assets/club-motion.js`** (59 Z., nur Club): benötigt `gsap`, `ScrollTrigger`, `#club` (5); alles in `gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', …)` (8); Ziele `#member, #praemienBox, #zielBox, #gewinneBox, #adventBox, #empfBox, #fbBox` (13); `gsap.from(el, { y: member ? 14 : 10, opacity: 0.55, duration: 0.65, ease: 'power2.out', clearProps: 'transform,opacity' })` (18–23); `ScrollTrigger start:'top 94%', once:true` (35–38); Elemente mit Fokus übersprungen (17), `focusin` beendet Tween (45–50), `MutationObserver` (43–44). Inhalt ist ohne Skript sichtbar.

**JS-Zeiten:** Feier startet 300ms nach Render (club:1331), wartet bei aktivem Formular (Eingabe < 3000ms, Neuversuch 1500ms; club:1320, 1328); Staub `--x = cos(a)*96px`, `--y = sin(a)*82px`, `--delay = (i%3)*.07s` (club:1365–1367); Toast club 3800ms (club:957–958), terminal 3200ms (T:918–919; Folgetoast 3400ms T:1440), backend 3400ms (B:1104–1106); `bestaetigt()` 400ms (B:1141–1148, Kommentar „180–300 ms“); Rad-Ergebnis 4900ms bzw. 0ms bei Reduced Motion (T:1596); jsQR alle 350ms (T:1293); Sheet-Fokus nach 50ms (T:1521, 1542).

**Legacy, nicht bestätigt (nicht übernehmen):** backend.html `auf` .5s mit Staffelung 0.05–0.35s (:38–43), `sheen` 4.5s infinite auf jedem `.btn` (:53–56), Hover-Lift translateY(-2px/-3px) (:45, 57), Balken .9s (:46), Toast .3s (:88).

### 4.8 Ebenen (z-index; 10 Vorkommen, 8 Werte, keine Token)

| Wert | mp | Verwendung |
|---|---|---|
| -1 | 258, 278 | Kartenglanz, `.pearl::before` |
| 2 | 410, 484 | Rad-Nadel, Bühnenperle |
| 3 | 491 | `.mp-check` |
| 5 | 481 | Bühnen-Schließen |
| **800** | 234 | `.sheet,.overlay` |
| **900** | 205 | `.toast,#toast,.note` |
| **1000** | 475 | `.mp-feier` |
| auto | 527 | `.mp-feier.mp-inline` |

Keine z-index-, `position:fixed`- oder `sticky`-Regeln in den Seitenresten; kein fixer Header, kein Menü-Overlay, kein Chat, keine schwebenden Bedienelemente auf MP-Seiten. Gemessen: keine Überlagerungen. Legacy backend.html: leerer Toast 44×26 px ragt 16 px ins Bild (backend.html:87, `translate(-50%,140%)` ohne `visibility:hidden`).

### 4.9 Umbrüche und Medienabfragen

| Abfrage | mp | Inhalt |
|---|---|---|
| `(pointer:coarse)` | 91 | `.nps button,.stars button` min 44×44 (`.stars` existiert nicht, Markup nutzt `.sterne`) |
| `(hover:hover)` | 260, 301 | Kartenglanz; Art-Perle-Hover |
| `(max-width:400px)` | 286 | Perle p1 `left:9%`, p6 `left:91%` |
| `print` | 552–565 | Druckpalette, A4 |
| `(prefers-reduced-motion:reduce)` | 571–575 | globale Bewegungsabschaltung |
| `(max-width:1023px)` | 578–580 | `.metrics` 2 Spalten |
| `(max-width:768px)` | 581–595 | Terminal 1 Spalte gap 18; workspace/admin 20px; Sidebar aus + `.bereiche-btn`; `.metrics` 1 Spalte; brandbar 20px; `.brandbar > .eyebrow` aus |
| `(max-width:480px)` | 596–609 | club-Gutter 19; h1 34; Karten-Paddings; Advent 3 Spalten; amount/balance 44; Admin-h1 28 |
| `(max-width:340px)` | 610–613 | Pad gap 6, Tasten 48/22px; Saldo 52 |

Seitenreste: terminal:653 `(max-width:768px)`, backend:642 `(max-width:1023px)`. Ansatz desktop-first mit 1023 / 768 / 480 / 400 / 340. **Kein `prefers-color-scheme`, kein `forced-colors`, kein `prefers-reduced-data`.** Legacy backend.html ≤820px.

### 4.10 Container und max-width

`.club` 450px (mp:244; auf 1280 eine 394-px-Spalte) · `.login` 420px (412) · `.workspace` 1200px (364) · `.pad` 320px (385) · `.mp-reward` 370px (498) · `.note,.toast` `min(92vw,640px)` (89, **tot**) → `min(92vw,520px)` (207) · `.sheet .card,.dialog` `min(390px,100%)` (237) · `.breit` `min(540px,100%)` (239) · `.mp-feier .buehne` `min(480px,100%)`, max-height `calc(100vh - 32px)` (478) · `.mp-admin-dialog` `min(520px,calc(100vw - 32px))`, max-height `calc(100dvh - 32px)` (616) · `.login .logo img` `min(240px,70vw)` (413) · `.home-grid` 640px (T:659) · club/recht `.wrap` 720px (recht:635) · Legacy backend `.wrap` 1180px. `100vh` (427, 478) neben `100dvh` (616). **Keine `ch`-Messlänge.** `body{overflow-x:hidden}` (mp:79) verdeckt Überläufe statt sie zu verhindern; `body::before,body::after{display:none !important}` (mp:81).

---

## 5. Komponenten-Inventar

Nutzungszahlen = Klassen-Token in Markup / JS-Vorlagen.

| Klasse | club | terminal | backend | recht |
|---|---|---|---|---|
| `.btn` | 5 / 3 | 14 / 4 | 26 / 12 | 0 |
| `.ghost` | 1 / 1 | 8 / 3 | 15 / 6 + 1 ternär | 0 |
| `.sm` | 0 | 3 / 3 | 8 / 7 | 0 |
| `.main-action` | 3 / 0 | 2 / 0 | 1 / 0 | 0 |
| `.secondary` | 5 / 1 | 6 / 0 | 2 / 0 | 0 |
| `.linkbtn` | 4 / 4 | 1 / 0 | 0 | 0 |
| `.icon-button` | 1 / 0 | 0 | 0 | 0 |
| `.sw` | 0 / 2 | 0 | 0 | 0 |
| `.laedt` (classList) | 2 | 4 | 2 | 0 |
| `.card` | 4 / 2 | 9 / 0 | 37 / 8 | – |
| unformatierte `<button>` | 2 (Wallet) | 12 Pad-Tasten (über `.pad button`) | 17 Sidebar (über `.sidebar button`) | 0 |

### 5.1 Buttons

| Selektor (mp) | Display | min-height | Padding | **gemessen** | Radius | Rand | Schrift | Gap | Farben |
|---|---|---|---|---|---|---|---|---|---|
| `.btn,.btn-gold,.main-action` (116–124) | inline-flex, center | 48px (118; 44px mp:87 überschrieben) | `14px 22px` | **54px** | 50px | `1px solid transparent` | Jost 500 16px `.01em` | 12px | `#E0BE98` / `#2E211B` |
| `.main-action` (125) | inline-flex, `justify-content:space-between`, `width:100%`, `margin-top:25px` | 48px | `17px 19px` | **60px** (84px zweizeilig) | 50px | wie Basis | wie Basis | 12px | wie Basis |
| `.btn.ghost` (130–133 mit `.btn`) | inline-flex | 44px | `12px 16px` | **47px** | 12px | 1px `#5A4242` | 14px/500 | 12px | `#21191A` / `#F6E9DF` |
| `.secondary` **ohne** `.btn` (gleiche Regel) | UA (als Flex-Kind `block`) | 44px | `12px 16px` | **49px** schlicht, **52px** mit Icon, **56px** gestreckt in `.searchrow`; `<a class="secondary">` 45px | 12px | **UA `2px outset`** `#5A4242` auf `<button>`; **kein Rand** auf `<a>` | 14px/**400** | keiner (Leerzeichen) | wie ghost |
| `.btn.sm` (135) | wie `.btn` | 44px | `8px 14px` | **44px** | **50px** | – | 14px | 12px | primär |
| `.btn.ghost.sm` | wie `.btn` | 44px | `8px 14px` | **44px** (40px in `.unklar`) | **12px** | line | 14px/500 | 12px | ghost |
| `.unklar .btn` (219) | – | **40px** | – | wirkungslos außer bei `.btn.ghost.sm` | – | – | – | – | – |
| `.btn.gefahr,.btn.danger` (136) | wie `.btn` | 48px | `14px 22px` | (nirgends genutzt; 54 im Test) | 12px | `rgba(240,165,173,.45)` | 16px | 12px | transparent / `--mp-danger` |
| `.linkbtn,.row-button` (145–146) | inline-flex | 44px | `10px 0` (mp:88 `8px 4px` tot) | **44px** | 0 | 0 | 14px/400, unterstrichen, Versatz 3px | 5px | Akzent |
| `.icon-button` (147–148) | inline-flex center | 44×44 | UA `1px 6px` | **44×44** | 50% | 1px line | – | – | transparent / text |
| `.club-footer > button` (317) | inline-flex | 44px | `10px 0` | **greift nicht** (club:912 Buttons im `<div>`) | – | 0 | 13px | 7px | transparent |
| `#appleWalletBtn`, `#walletBtn` (club:912, ohne Klasse) | UA | – | UA `1px 6px` | **30px**, 204/214 breit | 0 | UA `2px outset rgb(255,255,255)` | 16px/400 | – | **UA ButtonFace `#6B6B6B`**, Text 4.48:1 |
| `.sidebar button` (431–436) | flex | 44px | `11px 10px` | 44px (144×44) | **8px** | 0 | 14px/400 | 10px | Hover `rgba(33,25,26,.5)`; `[aria-current=page]` bg `--mp-bg`, Akzent |
| `.bereiche-btn` (`.secondary`, ≤768 flex, 100 %, space-between, mb 12px; mp:588) | flex | 44px | `12px 16px` | 52px; **57/210/229px** gestreckt bei 768×1024 | 12px | UA 2px outset | 14px/400 | – | ghost |
| `.categories > button` (390–391) | – | 44px | `10px 14px` | ungenutzt | **30px** | line | 14px | – | `[aria-pressed=true]` primär |
| `.nps button` (336–337) | UA | 44×44 | UA | 44px | 12px | line | 16px | `.nps` 6px | `.an` primär |
| `.sterne button` (333–334) | UA | 44×44 | 0 | 44px | – | 0 | 30px „★“, lh 1, `--mp-line` | `.sterne` 4px | `.an` Akzent |
| `.pad button` (386–388) | – | 52px (48px ≤340) | UA | 52px (100–101 breit) | 12px | line | Cormorant 400 26px (22px ≤340) | Grid 8px | surface; `:active` `rgba(223,190,149,.18)` + Akzentrand |
| `.sw` (328–331) | – | – | 0 | **52×30** | 15px | line | – | – | Knopf 22px, an = primär |
| `.list .item` (394–401) | Grid | 56px | `12px 14px` | 71.5–72px (95.5–96 zweizeilig) | 12px | line | – | `2px 12px` | `.erreichbar` Akzent, `.gewinn` **`--mp-ok`** |
| `.door` (343) | – | 64px | 6px | – | 12px | line | Cormorant 500 20px | – | – |
| `.featured-reward` (293) | Grid `102px 1fr` | – | 0 | 154–172px | **12.6px** | 0 | – | – | `--mp-reward-gradient` |
| `.mp-feier .btn` (504) / `.btn.ghost` (505) | – | 48px | Basis | 54px (162×54) | 50 / 12px | ghost `#8D7785` | – | – | **zweite Primärfarbe** `--mp-stage-gold #D6B783` auf `#100D10` |
| `.mp-feier.mp-inline .btn` (534) | – | 44px | `10px 18px` | **46px** (86×46) | 50px | – | – | – | Bühnengold |
| `.mp-feier .zu` (481–482) | – | 44×44 | 0 | 44px | 50% | 0 | 26px „×“ | – | `--mp-stage-muted`, Hover `rgba(255,255,255,.06)` |
| club/recht `.nav a` (recht:643) | inline-flex | 44px | `10px 16px` | ungenutzt | 12px | line | 14px | – | surface |

**Zustände:**

| Zustand | Regel | Lücken |
|---|---|---|
| hover | `.btn/.btn-gold/.main-action:hover{filter:brightness(1.08)}` (126); `.btn.ghost/.secondary:hover{border-color:accent; filter:none}` (134); `.icon-button:hover` (149); `.sidebar button:hover` (433); `.mp-feier .zu:hover` (482) | keiner für `.linkbtn`, `.nps`, `.sterne`, `.pad`, `.sw`, `.list .item` |
| active | `.btn:active,.main-action:active{filter:brightness(.94)}` (127); `.pad button:active` (388) | `.btn.ghost:hover{filter:none}` (0,3,0) schlägt `.btn:active` (0,2,0) → Ghost ohne Druckrückmeldung; `.secondary` ohne active |
| focus-visible | `outline:2px solid var(--mp-accent); outline-offset:3px` (568–569); `.pearl` `-2px` (570) | Ausnahme `.consent-card:focus-within{outline:3px solid #f5ddbc; outline-offset:3px}` (club:658); Details §7.4 |
| disabled | `.btn:disabled,.btn[aria-disabled="true"],.main-action:disabled,.secondary:disabled{opacity:.45; cursor:not-allowed; filter:none}` (137–138) | keiner für `.linkbtn`, `.icon-button`, `.sw`, `.nps`; `.door:disabled` .5 (347); `.list .item:disabled` .55 + gestrichelt (401); `#rechtAnnehmen:disabled` = Erledigt-Look `opacity:1; background:#dfbe95; color:#21191a; border:2px solid #f5ddbc` (club:667) |
| aria-busy | `button[aria-busy="true"]{cursor:progress}` (84); `#rechtAnnehmen[aria-busy=true]{background:#49382d; color:#ffe3b8}` (club:668) | – |
| laden `.laedt` | `.btn.laedt,.main-action.laedt{color:transparent; pointer-events:none}` (139); Spinner `::after` 18×18, `border:2px solid rgba(46,33,27,.3)`, `border-top-color:var(--mp-button-text)`, `mp-dreh .8s linear infinite` (140–144); Ghost-Spinner `rgba(223,190,149,.3)`/Akzent (143) | `mitSperre()` (club:993–995, B:1113–1117) und T:1051/1086 setzen `disabled` + `.laedt` + `aria-busy` auch auf `.secondary`, `.linkbtn`, `.sw`, `.door`, Wallet-Buttons → dort **kein Spinner**; `laden()` setzt nur disabled/aria-busy (B:1218, 1229); Terminal-Login nur `disabled` (T:1180, 1192); Spinner erscheint bei opacity .45 |
| gedrückt/gewählt | `.sw[aria-pressed=true]`, `.categories > button[aria-pressed=true]`, `.nps button.an`, `.sterne button.an`, `.sidebar button[aria-current=page]` | Backend-Funktionsschalter wechselt `btn sm` ↔ `btn ghost sm` (B:1857–1858): **Radius wechselt mit dem Zustand** (45×44 Pille „an“ / 51×44 Rechteck „aus“); Zeitraum-/Vorlagen-Chips (B:736–738, 938–941) ohne gewählten Zustand, kein `aria-pressed` |

**Icons und Pfeile in Buttons:** `.ic` 18×18, `fill:none; stroke:currentColor; stroke-width:1.8`, rund (mp:112); `.sidebar .ic` 16px (435), `.member .rank .ic` 14px (265). `#i-arrow` nur in `.btn`/`.main-action`: club rBtn:717, terminBtn:814, empfTeilen:850, fbBtn:863, bewLink:871; terminal loginBtn:692, buchenBtn:825. In `.btn` 12px nach dem Label, Mitten deckungsgleich (gemessen). In `.main-action` rechts angeheftet; **ohne Pfeil steht ein einzeiliges Label links**: backend `#loginBtn` (B:684, kein Pfeil), `#rechtAnnehmen` (club:898), terminal `#buchenBtn` verliert den Pfeil durch `textContent` beim ersten Render (T:926 in `betragAnzeigen()`). In bloßem `.secondary` sitzt das Icon auf der Grundlinie, **4px über der Textmitte** (terminal #scanBtn Icon-Mitte 977 / Text 981; #neuBtn 1658/1662; gemessen 16px oben / 22px unten): terminal scanBtn:711, scanBtn2:748, backBtn:749, neuBtn:725; backend bereicheBtn:696–697, bDruckOben:728.

**Mehrzeilige Beschriftungen:** kein `white-space`, keine feste Höhe → umbrechende Buttons wachsen (terminal „Hinweis schließen – Buchungsstatus bleibt ungeklärt“ 371px breit, 47→68px bei 390; `#rechtAnnehmen` 60→84px schon auf Deutsch; `#terminBtn` bei langen Labels 84px). `<a class="btn">`/`<a class="main-action">` berechnen `text-align:start`, `<button>` `center` → umbrochene Link-Buttons linksbündig, Buttons zentriert. `.aktionen{align-items:center; flex-wrap:wrap}` (mp:467) zentriert Nachbarn auf den höchsten Button. backend:2012 erzwingt `flex-wrap:nowrap` → Tabellenbuttons werden bei ~1,5-fachen Labels 60px (zweizeilig). Stresstest +40 %: kein neuer Überlauf; Primärpillen stehen nach Umbruch allein über kleineren Ghosts.

**Reihen mit ungleichen Höhen (dedupliziert, gemessen):**

| # | Ort | Elemente (Höhe) | Wirkung |
|---|---|---|---|
| 1 | terminal `#unklar` (T:754–756) | `.btn` 54 · `.btn.ghost` 47 · `.btn.ghost` 47 (68 zweizeilig) | Δ7, Pille neben 12px |
| 2 | terminal `.customer .aktionen` (T:775–776) | `#jumpBooking.btn` 54 · `#jumpRewards.btn.ghost` 47 | Tops 691.3/694.8 |
| 3 | terminal `#sheetNeu .aktionen` (T:866) | `.btn.ghost` 47 · `.btn` 54 | Tops 820.9/824.4 |
| 4 | terminal `#sheetAus .aktionen` (T:880) | 47 · 54 | Δ7 |
| 5 | terminal `.searchrow` (T:706–711, 743–749) | `label.search` 50 · `.secondary` 56 | Unterkanten 6px versetzt (Label-`margin-bottom:6px`, mp:152); umbrochene Reihe bei 390: 52 vs 56 |
| 6 | backend `#zeitraum .filter` (B:731–741) | Datumsfelder 44 · „Anzeigen“ `.btn` 54 · Chips `.btn.ghost.sm` 44 | `align-items:end` → Primär 10px höher (Tops 225/215); bei 768 Chips 52px über den Datumsfeldern; bei 390 „Anzeigen“ nach den Schnellfiltern |
| 7 | backend `#vKunden .filter` (B:836–842) | Feld/Select 44 · `.btn` 54 | 10px |
| 8 | backend `#vBericht .filter` (B:907–909) | Select 44 · `.btn.ghost` 47 | 3px |
| 9 | backend `#vMitt .aktionen` (B:959) | „Wie viele?“ ghost 47 · „Absenden“ 54 | Δ7 |
| 10 | backend `#vMail .aktionen` (B:1054–1059) | `.btn` 54 · Feld 50 (inline `flex:1;min-width:200px;width:auto`) · `.btn.ghost` 47 ×3 | vier Höhen in einer Reihe |
| 11 | backend Mail-Dialog (B:1951) | `.btn.ghost` 47 · `.btn` 54 in `<div class="row">` | `.row` undefiniert → **0px Abstand**, linksbündig |
| 12 | backend Kundin-Detail (B:1359–1361) | `.btn.ghost.sm` ×2 in `.row style="justify-content:space-between"` | `.row` undefiniert → Inline-Justify wirkungslos, h2 eigene Zeile |
| 13 | backend Schwellen (B:1517) | `.btn` + `span style="flex:1"` in `.row` | `flex:1` ignoriert |
| 14 | backend Prämien-Tabellenzeile (B:2012–2013) | `.btn.sm` 44 (50px) · `.btn.ghost.sm` 44 (12px), inline `flex-wrap:nowrap` | gleiche Höhe, **gemischter Radius** |
| 15 | backend Funktionen (B:1857) | `btn sm` ↔ `btn ghost sm` | Radius wechselt mit Zustand |
| 16 | club `#fertig .aktionen` (club:736–738) | `#fNochmal.secondary` 49 · `#fZurueck.linkbtn` 44 | Tops 521.1/523.6 |
| 17 | club `#bewBox .aktionen` (club:870–873) | `a#bewLink.btn` 54 · `.linkbtn` 44 ×2 | Δ10; umbricht in 2 Reihen (DE) bzw. 3 (RU-Länge) bei 360/390 |
| 18 | club `.zielaktionen` (JS, club:1433–1449) | `.secondary` 49 · `.linkbtn` 44 ×2 | Δ5 |
| 19 | club `.linkfeld` (club:851) | `<code>` 39 · `.secondary` 49 | – |
| 20 | club Wallet-Auswahl (club:912) | zwei UA-Buttons 30px | unter Touchgröße, graue Fläche |
| 21 | terminal `#offenHinweis` (T:716–717) | `.btn.ghost.sm` 40 ×2 | gleich, aber **< 44px** |
| 22 | backend `.section-title`-Aktionsplätze | `csvBtn` `.btn` 54 (B:771), `jobBtn` `.btn` 54 (B:816), `kExport` `.btn.ghost` 47 (B:834), `korrAuf` `.btn.ghost.sm` 44 (T:831) | gleicher Platz, drei Größen; „Als CSV laden“ einmal primär (B:771), einmal ghost (B:834) |

Konsistente Referenzreihen: terminal `.searchrow`-Buttons untereinander, `#pad` (52), backend `#zeitraum .aktionen`-Ghosts (44), backend Mail@768 zweite Reihe (47/47).

### 5.2 Formularfelder

| Teil | Regel | Werte |
|---|---|---|
| `label` (mp:152) | `display:block; font-size:14px; font-weight:500; letter-spacing:.02em; color:var(--mp-text-muted); margin-bottom:6px` | trifft auch `label.search`, `label.consent-card`, `label.small` (club:903) |
| `.field` (153) | `margin-top:16px` | club 7 + 2 JS, terminal 11, backend 3 |
| input/select/textarea (154–159) | `width:100%; min-height:48px; font:Jost 16px; color:--mp-text; background:--mp-bg; border:1px solid --mp-line; border-radius:12px; padding:12px 14px; transition 160ms --mp-ease; appearance:none` | **gemessen 50px**, `type=date` **52px** (z. B. nGeb T:859, aVon/aBis B:923–924) – in `.formzeile` 2px versetzt |
| Schriftgröße | mp:85 `max(1rem,16px)` → mp:155 `16px`; `.filter input,.filter select{font-size:15px}` (465) | 15px < 16px → iOS-Zoom |
| textarea (160) | `min-height:96px; resize:vertical`; im Admin-Dialog 100px (619) | – |
| Platzhalter | mp:86 `var(--mp-text-muted)` → überschrieben durch mp:161 `#8F7677` | 4.12:1 |
| Fokus (162) | `outline:0; border-color:accent; box-shadow:0 0 0 3px rgba(223,190,149,.22)` **plus** mp:568 Outline 2px, Versatz 3px | Textfelder matchen `:focus-visible` auch bei Mausfokus → **immer Doppelring** (gemessen an terminal #pin) |
| `.search` (168–173) | flex, gap 10px, `flex:1 1 230px`, 1px line, 12px, `padding:0 12px`, bg `--mp-bg`, min-height 48px; inneres Feld randlos `padding:12px 0`, min-height 46px; `:focus-within`-Ring | inneres Feld erhält trotzdem Outline → Doppelring; Box 50px |
| `.searchrow` (174) | flex, gap 10px, wrap, mb 27px | terminal ×2 |
| select (164–165) | Pfeil-SVG 12×8, `M1 1l5 5 5-5`, stroke `%23DFBE95` 1.6, `right 14px center`, `padding-right:38px` | Farbe fest dunkel |
| disabled (163) | `input:disabled,select:disabled{opacity:.55}` | textarea fehlt |
| checkbox/radio (166) | `width:auto; min-height:0; accent-color:var(--mp-accent)`, aber **`appearance:none`, Padding `12px 14px`, Rand und Radius aus 154–158 bleiben** | **Fehler: angehakt = nicht angehakt** (30×26-Box ohne Häkchen, gemessen): club `#loeschBestaetigt` (club:903, **Kontolöschung**), backend Advent „Push“ (B:2051). Nur `.consent-card input` stellt `appearance:auto` 26×26 wieder her (club:655). Keine Radios |
| date (167) | `color-scheme:dark` | – |
| `.filter` (460–465) | flex, gap 10px, wrap, `align-items:end`, mb 8px; Kinder `flex:1 1 140px`; Label mb 4px; Felder `min-height:44px; padding:8px 12px; font-size:15px` | zweite Feldgröße 44px |
| `.formzeile` (466) | Grid `repeat(auto-fit,minmax(160px,1fr))`, gap 12px | terminal 2, backend 9; 11 Markup-Stellen mit Inline-`margin-top` 12/16/18px; `grid-column:1/-1` (B:999) |
| `.aktionen` (467) | flex, gap 8px, wrap, `align-items:center`, mt 16px | club 5, terminal 4+1 JS, backend 10+1 JS; Inline: `justify-content:center;margin-top:24px` (club:736), `justify-content:flex-end` (T:865, 879), `flex:1 1 200px;margin:0` (B:735), `margin:0;flex-wrap:nowrap` (B:2012) |
| Fehlerzustand | **keiner** (kein `aria-invalid`, kein Feldfehler); Fehler nur als Toast/Note (`sagen(m,true)` club:957; `toast(m,true)` T:918, B:1104) | – |
| Hinweistexte | kein Bauteil; `p.muted`/`p.small` mit Inline-Margins (T:724 `6px 0 14px`, club:1423 `8px 0 12px`); `.hint` benutzt (T:792), nirgends definiert | – |
| Tabellenfelder | inline `width:90px` (B:2006, 2009), `min-width:180px` (B:2010), `width:85px` (B:2049), `min-width:170px` (B:2050) | Prämiennamen abgeschnitten (§7.9) |

### 5.3 Schalter, Sterne, NPS, Tabs

- `.switch` (mp:327): flex, space-between, gap 12px, `padding:12px 0`, Unterrand line; Titel inline `font-size:16px` (club:1279, B:1854–1855).
- `.sw` (mp:328–331): `52×30px; border-radius:15px; border:1px solid var(--mp-line); background:var(--mp-surface)`; Knopf `::after` 22×22, top/left 3px, `--mp-text-muted`; an: `--mp-button-bg`, Knopf `translateX(22px)` in `--mp-button-text`; `role="switch"`, `aria-pressed`, `aria-checked`. Nur club (JS). Backend nutzt stattdessen Textbuttons (§5.1 Zustände).
- `.sterne` (club:349–351): gap 4px, `margin:8px 0 16px`, „★“ 30px, min 44×44, `--mp-line`, `.an` Akzent. `.nps` (club:352–354): gap 6px, 44×44, 1px line, 12px, bg `--mp-bg`, `.an` primär; per JS (club:1466–1470) mit `aria-pressed`.
- **Tabs: kein Bauteil.** `.tabs button` nur in mp:87 und Druck-Ausblendliste (mp:561). Segmentwahl über `.btn.ghost.sm`-Chips. Legacy backend.html hatte Pillen-Tabs mit `aria-pressed` (36px hoch, `9px 18px`, 999px).

### 5.4 Karten und Flächen

| Selektor | Werte | Nutzung |
|---|---|---|
| `.card` (177–180) | surface, `1px solid transparent`, 18px, 24px; `.card h2{font-size:24px}` | club 4+2 JS, terminal 9, backend 37+8 JS |
| `body.admin .card` (468) | `padding:20px; margin-top:16px` | nur backend |
| `.card-dark` (181) | `--mp-card`, 18px, **25px**, `--mp-member-text` | ungenutzt |
| `.customer` (368) | surface, 18px, **25px** | terminal |
| `.ziel` (349/club:366–369) | surface, 18px, **20px**; `.satz` `500 22px/1.3` heading; `.seit` 14px muted; `.zielaktionen` gap 12px, mt 14px | club JS |
| `.sheet .card`,`.dialog` (237–238) | `min(390px,100%)`, **bg `--mp-bg`**, 1px line, 18px, **30px**, `mp-ebene .4s` | terminal Sheets |
| `#rechtsBestaetigung` (club:663–665) | 22px, `1px solid #927875`, 18px, mt 24px; `.bestaetigt` `#dfbe95` / `#302820`, blendet `p.small` aus | club |
| `.consent-card` (club:654) | 18px, **16px**, 2px Rand | club |
| `.leer,.empty` (109–110) | muted, zentriert, `24px 16px`, `1px dashed var(--mp-line)`, 18px, 14px | `.leer` club/terminal/backend JS; `.empty` ungenutzt; Backend-Tabellen nutzen stattdessen `<td colspan class='muted'>` („Gerade niemand.“, „Niemand gefunden.“) |
| `.admin-bottom` (457) | `--mp-card`, 18px, 25px | ungenutzt |
| Akzentkarte (nur inline) | `#bannerBox` `margin-bottom:20px;border:1px solid var(--mp-accent)` (club:759); `#zielKarte` `border:1px solid var(--mp-accent)` (T:789); `#ladeFehler` Rand `--mp-danger` (mp:90, `role="alert"` club:704) | – |

Karten-Paddings 18/20/22/24/25/30px; kartenartige Radien 12/12.6/16/18/24px.

### 5.5 Tabellen (mp:186–194, 470)

- `table{width:100%; border-collapse:collapse; font-size:14px}`; `th` Jost 500 12px `.06em` uppercase muted links `padding:10px 8px`, `border-bottom:1px solid var(--mp-line)`, `background:var(--mp-surface)`; `td` `padding:10px 8px`, `border-bottom:1px solid rgba(90,66,66,.55)`, `vertical-align:top`, letzte Zeile ohne Rand; `.num` rechts, tabular, nowrap; `.tabelle-scroll{overflow-x:auto}`, `> table{min-width:560px}`; Backend-Rest `.tabelle-scroll{margin-top:12px}` (B:650).
- **Admin:** `td` **und** `th` `padding:9px 8px; font-size:14px` (mp:470) → Admin-Kopf 14px versal gegen 12px im Terminal. Gemessen th 39.5px, td 40px, td mit Feld 69px, td mit Status+Button 137.5px; zweizeilige Zellen 58.5–59px.
- Backend: 14 `.tabelle-scroll`-Wrapper (kTab, auszug, praemien, advent, post, mTab, aTab, rTab, fbTab, uTab, lvlTab, simErg, heat, summen); **ohne Wrapper** ~12 Tabellen (push, topP, verb, laeufe, vKat, vZahl, vBind, zAlter, zVert, zGrp, zPrae, Bericht-Tabellen, DNS-Tabelle B:1066), elf davon inline `margin-top:8px`. `.num` 132× in JS-Vorlagen. **Kein `<thead>`** (alle `<tr><th>`, z. B. B:1257, 1262, 1324) → Druckregel `thead{display:table-header-group}` (mp:558) greift nie.
- **Spaltenversatz:** `#praemien` 6 `th` für 7 `td` (B:2004 vs. 2005–2013: „Status“ über Bildadresse), `#advent` gleich (B:2041–2050, „Push“ über Bildadresse).
- Klickbare Zeilen `#kTab tr style="cursor:pointer"` mit `onclick` (B:1328, 1340): kein Hover, kein Fokus, keine Tastatur.
- Terminal-Korrektur: `table.korr` inline `minWidth = "420px"` (T:1460), `classList.add("tabelle-scroll")` (T:1461); Kopf Datum | Umsatz | Perlen | (Aktion); Datum und „von“ ohne Trenner („20. Sept.Anna“).
- club/recht: 2 schlichte Tabellen, `.wrap table{margin-top:10px}` (recht:646).

### 5.6 Meldungen: Toast, Note, Hinweis, Unklar, Beobachtung

| Selektor | Werte | Anmerkung |
|---|---|---|
| `.toast,#toast,.note` (204–214) | `position:fixed; left:50%; bottom:24px; z-index:900`; verborgen `translate(-50%,140%)` + `visibility:hidden`; `.on` → `translate(-50%,0)`; surface, 1px line, 12px, `padding:14px 20px`, 15px, `max-width:min(92vw,520px)`, zentriert, Schatten `0 14px 34px rgba(0,0,0,.45)`, `transform 180ms --mp-ease`; mp:89 zusätzlich `overflow-wrap:anywhere` | **Breite faktisch ≤ 50vw** (`left:50%` + Shrink-to-fit): gemessen 476px @1280, 384 @768, **195px @390** (120px hoch) |
| Fehler | `.toast.err,#toast.err,.note.bad{border-color:rgba(240,165,173,.6); color:var(--mp-danger)}` + `::before "⚠ "` (212–213) | – |
| Erfolg | `.toast.ok::before{content:"✓ "; color:var(--mp-ok)}` (214) | nie von JS gesetzt |
| Nutzung | club `#note` (club:940) `"note on"+" bad"` 3800ms; terminal `#toast` 3200ms; backend `#toast` 3400ms | ein Element je Seite |
| `.hinweis` (182–184) | surface, `border-left:3px solid accent`, 12px, `12px 16px`, 14px; `.hinweis.fehler,.note.bad,.hinweis.warn{border-left-color:var(--mp-danger)}`; `.hinweis.fehler::before "⚠ "` | **`.hinweis.warn` in Danger-Farbe**; „⚠“ doppelt deklariert (184, 213); nur backend JS (B:1591 `hinweis noprint`, B:1669 `hinweis fehler`) |
| `.unklar` (215–219) | flex, gap 12px, wrap, `margin:0 0 16px; padding:14px 16px; border:1px solid var(--mp-warn)`, 12px, bg `rgba(231,197,138,.08)`, 14px; `::before "⚠"` warn 18px; `.txt{flex:1 1 240px}` | terminal `#offenHinweis`, `#unklar` (`role="alert"`) |
| `.beob` (471) | `border-left:3px solid accent; padding:8px 14px; margin:8px 0`, muted 14px | Duplikat von `.hinweis` (B:1665) |
| `.mp-kurz` (415–423) | flex, gap 14px, `12px 16px`, 12px, Akzentrand, bg `rgba(223,190,149,.1)`, `mp-ebene 260ms`, 34px-Perle, `mp-seal .65s` | ungenutzt |
| `#ladeFehler` (90) | `.card` + `margin:16px 0; border-color:var(--mp-danger)` | seitenspezifisch im gemeinsamen CSS |
| recht `.box` (recht:644) | surface, `border-left:3px solid var(--mp-warn)`, 12px, `16px 20px`, `margin:18px 0` | ungenutzt |

### 5.7 Pills, Rang, Avatar

- `.pill` (197): inline-block, `3px 10px`, 50px, bg `rgba(223,190,149,.14)`, Akzent, 13px/500 (~25.5px hoch); `.pill.gut,.ok` `rgba(169,200,174,.16)`/`--mp-ok` (grün); `.pill.warn` `rgba(231,197,138,.16)`/warn; `.pill.fehler` `rgba(240,165,173,.16)`/danger. Nur backend: `#adventJahr` (B:804), JS „läuft“ (B:1683), „aktiv“ (B:2011), Anzahl freier Prämien (B:1335), `MAIL_STATUS` (B:1937–1939: ok „vom Anbieter angenommen“, warn „später erneut“/„ungeklärt – bitte prüfen“, fehler „fehlgeschlagen“, sonst Akzent). `.pill.gut` ungenutzt. **Kein Glyph** an Status-Pills.
- `.rank` (201): inline-flex, gap 5px, 12px, `.08em`, uppercase (club:770, T:765); Icon `#i-sparkle`.
- `.avatar` (230–232): 34×34 rund, surface, muted 12px; `.avatar.large` 52×52, `--mp-bg`, Cormorant 500 20px (T:764).
- club/recht `.tbd` (recht:645): `rgba(231,197,138,.18)`/warn, `1px 7px`, **5px** – ungenutzt.

### 5.8 Markenleiste (mp:222–232)

`display:flex; align-items:center; justify-content:space-between; gap:16px; padding:24px 0; border-bottom:1px solid #6C4C483F` (222; mp:229 wiederholt den Selektor für `flex-wrap:wrap`). `.logo` 140×54-Fenster, `<img>` 220px bei `left:-40px; top:-30px` (225–226); `.logo span` 10px `.24em` ungenutzt (227). `.user` flex, gap 10px, 13px muted, wrap, `justify-content:flex-end`, `min-width:0` (228) – umbricht schmal **linksbündig** unter das Logo. Terminal/Admin `padding:22px 30px` (363, 426), 20px ≤768 (594), `.brandbar > .eyebrow` ≤768 aus (593). Gemessen: club 103px (24+54+24+1), terminal/admin 99px @1280, 95px @390; **backend @390 155px** (Umbruch). Inhalte: club Logo (+ `#walletTop` `.icon-button`, club:747–750); terminal Logo + Eyebrow „Empfang“ + `.user` (T:698–702); backend Logo + Eyebrow + `.user` mit `.btn.ghost.sm` „Abmelden“ 95×44 (B:689–693); club/recht keine Markenleiste, sondern `.brand` 12px `.26em` (recht:641) und Logo inline `width:150px;height:auto` (recht:653).

### 5.9 Dialoge und Sheets

| Selektor | Werte | Nutzung |
|---|---|---|
| `.sheet,.overlay` (234–236) | fixed, `inset:0`, z 800, `#1C130BB5` + `blur(7px)`, `display:none` → `.on{display:flex}`, `align-items:flex-start`, `padding:min(90px,12vh) 20px 30px`, `overflow:auto` | terminal `#sheetNeu`, `#sheetAus` (T:854, 871), `role="dialog" aria-modal="true"`; `.overlay` ungenutzt |
| `.sheet .card,.dialog` (237–238) | `min(390px,100%)`, bg `--mp-bg`, 1px line, 18px, 30px, `mp-ebene .4s` | `.dialog` ungenutzt; gemessen 390×511, Top 90px @1280; @390 916px hoch, Overlay scrollt |
| `.breit` (239) | `min(540px,100%)` | `#sheetNeu` |
| `.sheet h2` (240) | 26px, mb 8px | – |
| `.dialog .icon-button.close` (241) | `position:absolute; right:14px; top:14px` | **ungenutzt – Sheets haben kein ×**, nur „Abbrechen“ |
| `.mp-admin-dialog` (616–619, natives `<dialog>`) | bg **surface**, 1px line, 18px, **24px**, `min(520px,calc(100vw - 32px))`, `max-height:calc(100dvh - 32px)`, overflow auto; `::backdrop{background:rgba(16,13,16,.78)}`; h2 `margin:0 0 12px`; p muted mb 16px; label `display:block; margin:14px 0`; select/textarea mt 6px | backend `mailKlaerDialog()` (B:1941–1957): 520×446 @1280, 352×517 @390; Buttons in undefinierter `.row` mit 0px Abstand, linksbündig (Terminal-Sheets rechtsbündig mit 8px) |
| native Dialoge | `confirm()` T:1407, T:1501, B:1384, B:1687, B:1741; `prompt()` T:1483, T:1488 | – |
| Tastatur | Terminal-Sheets: **kein Escape, keine Fokusfalle, kein Backdrop-Klick** (`Escape` in beiden Dateien 0×); Feier: Fokus auf `#feierZu`, Tab-Falle, Escape und Backdrop schließen, Fokus zurück (club:1384–1385, 1396–1400) | – |

Drei Scrims, zwei Dialogflächen (bg / surface), zwei Paddings (30/24px), drei Breiten (390/520/540px), Eintrittszeiten .4s / 250ms / 260ms gegen Token 180ms.

### 5.10 Club-Bereich (club/index.html)

**Rahmen:** `.club{max-width:450px; margin:0 auto; padding:0 28px 32px}` (club:261), ≤480 `0 19px 24px` (club:614); `.greeting` zentriert, `padding:30px 0`, Eyebrow mb 12px, h1 38px (34px ≤480); `.club section{margin-top:32px}`, `section > .eyebrow{mb 7px}`, `section > h2{mb 12px}` (club:265–267). Horizontaler Überlauf 0 bei 360/390/1280.

**Mitgliedskarte `.member`** (club:270–305; Markup 767–777): `background:var(--mp-member-gradient); color:var(--mp-member-text); border:1px solid #A17C6655; border-radius:18px; padding:22px 22px 16px; overflow:hidden; isolation:isolate` (≤480 `20px 16px 14px`), gerendert 352×314.5 @390. Innenrahmen `::before` `inset:8px; border:1px solid #CBAE8029; border-radius:11px`. Glanz `::after` `inset:-90%; z-index:-1; linear-gradient(115deg,transparent 44%,rgba(255,240,218,.13) 49%,transparent 54%); translateX(-60%)` → `lp-shine 1.5s ease both` nur `(hover:hover)` (bis `translateX(60%)`). Kopf flex space-between gap 8px, Eyebrow „Deine Perlen“ in member-muted. Rang `.rank` + `#i-sparkle` 14px Akzent; Text `d.level.name` (club:1171), ausgeblendet ohne Level oder bei `funktionen.level === false` (club:1170). Saldo `.balance` `text-align:center; margin-top:22px; font:400 66px/1 var(--mp-heading); letter-spacing:-.04em; overflow-wrap:anywhere`; `.lang` (≥100000) 52px, `.sehrlang` (≥10000000) 40px (club:1169), ≤340 52px; `.sub` `400 13px/1.5` Jost member-muted, mt 5px. Kette `.necklace` `height:117px; margin:0 4px`; `.chain` `left/right 5%; height:100px; top:-12px; border-bottom:1px solid #C6A875; border-radius:0 0 50% 50%; rotate(-7deg)`. Fuß flex space-between gap 8px, 12px member-muted, `border-top:1px solid #DFC69C40`, `padding-top:12px`, `min-height:30px`; links `#kettenNotiz` (aria-live), rechts `#kettenZahl` („04“).

**Perlen der Kette** (club:291–303; JS club:1128–1155): `.pearl` absolut, min 44×44, transparent, `translate(-50%,-50%)`, rund; `::before` `inset:7px`, Radius `48% 52% 47% 53%`, Verlauf `radial-gradient(circle at 31% 24%,#FFFDF4 0%,#FAEFDF 15%,#E8D5C5 38%,#B8A3A0 67%,#F3E6D4 89%)`, Schatten `inset -2px -3px 5px #A8998A, 0 5px 9px #1E140F70`, `transition:transform .35s ease`. Größen über inset: p1/p3/p5 7px (30px), p2 4px (36px), p4 1px (42px), p6 3px (38px). Positionen (auch JS `POS` club:1128): p1 `6%/42%`, p2 `21%/64%`, p3 `39%/73%`, p4 `58%/72%`, p5 `77%/56%`, p6 `94%/26%`; ≤400 p1 9 %, p6 91 %. Deko `.pearl.deko{pointer-events:none; opacity:.42}` ohne Schlagschatten. Hover/gewählt `translateY(-5px) scale(1.12)` (club:298, **nicht** in `(hover:hover)`). Fokus Versatz -2px. Verhalten: bis 6 positive Buchungen, alt links → neu rechts; gefüllt `<button aria-pressed>` „Buchung vom {Datum} ansehen“; Klick schreibt „{Datum} · {Anlass} · {n} Perlen“; leer: „Deine Geschichte beginnt mit deinem ersten Eintrag.“ (club:1138).

**Hervorgehobene Prämie** (club:780–794, CSS 308–323): `.reward-heading` flex, `align-items:end`, space-between, gap 12px, `margin:27px 0 17px`; rechts `#rewardZahl` „01 / 03“ (13px); h2 25px ≤480. Karte `<button>` `padding:0; grid 102px 1fr` (≤480 87px); `border-radius:12.6px`; Verlauf reward; 352×172 @390. `.reward-art` min 154px `--mp-art`; `.orbit` 102×110, `2px solid #BA966D`, rund, top 22px, `rotate(-30deg)`, opacity .5. `.art-pearl` 62×65, Radius `49% 51% 47% 53%`, Verlauf `radial-gradient(circle at 28% 24%,#FFFDF7 0%,#F9EEDF 19%,#DFCBBF 48%,#A79595 75%,#F3E9DC 96%)`, Schatten `inset -4px -5px 7px #9C898744, 5px 12px 18px #4B322B24`, `left:20px; top:43px; rotate(-15deg)`, `transition .6s var(--mp-ease)` (≤480 left 13px), Hover `(hover:hover)` `rotate(15deg) translateY(-5px)`. `.reward-copy` `17px 15px` (≤480 `15px 12px`), Spalte, gap 7px: `.ready` 12px Akzent `.015em` („Für dich verfügbar“/„Noch {n} Perlen“), `strong` `500 21px/1.06` heading, `.detail` 13px muted, `.bottom` 13px space-between mit `#i-arrow-up`. Leer: `<p class="leer">Aktuell sind keine Prämien hinterlegt.</p>` (club:793). `#rewardAvailable` `.muted`.

**Nächstes Prämienziel `#rewardProgress`** (club:795–802): `section.card` 352×210.9; Eyebrow, h3 „Noch {n} Perlen bis zu deiner nächsten Prämie“, **`<strong id="rewardProgressName">` ungestylt → 700 16px Jost (synthetisch)**, `.muted`, `.track`, `.small`. `role="progressbar"` mit `aria-valuenow`/`aria-valuetext`; Breite per `style.width` (club:1187).

**Rangfortschritt `.next` + `.track`** (club:324–331): `.next` flex, gap 10px, `margin:21px 0 10px`, `#i-gem` 18px Akzent, 13px; `.next-number` tabular „62 %“. `.track` 3px, surface, Radius 3px; Füllung Akzent `width .6s var(--mp-ease)`, bei Reduced Motion `transition:none`. Texte „Dein nächster Rang“/„Noch {n} Perlen bis {Rang}“; oben „Dein Rang“/„Du hast den höchsten Rang erreicht.“. **Rangnamen/-farben (Bronze … Diamant) erscheinen nicht in der Club-Oberfläche.**

**Prämienliste `.reward-list`** (club:817–822, CSS 338–342): `.item` Grid `1fr auto`, gap `4px 12px`, `padding:14px 0`, Unterrand line, `tabindex="-1"`, `id="praemie-{id}"`; `strong` `500 18px/1.15` heading; `.small` Status („erreicht – am Empfang einlösbar“/„noch {n} Perlen“); `.pts` `grid-row:1/3`, 14px tabular muted, `.frei .pts` Akzent. Leitsatz inline mb 8px.

**Registrierung** (club:691–717, Rest 642–644): `.reg .plus` flex gap 14px `padding:12px 0` (Zeile 69px); `.z` 30×30 rund, 1px line, `font:500 15px var(--mp-heading)` (Mediävalziffern sitzen tief); `.t` 500; `.u` 14px muted. Formular `#regForm` inline mt 8px; Honeypot `#rHp.hp{position:absolute; left:-9999px}` (club:377, `tabindex="-1" aria-hidden`), 2-s-Zeitschutz (club:1003); Absenden `#rBtn.main-action` „Dabei sein →“ 352×60. Mischausrichtung: Logo links, Eyebrow/Überschrift/Lead zentriert, Schritte/Formular links, Kleingedrucktes zentriert.

**Einwilligungskarten `.consent-card`** (club:654–662; Markup 715–716, 897): `display:flex; align-items:flex-start; gap:14px; padding:18px; margin:14px 0; border:2px solid #927875; border-radius:16px; background:#2b2224; color:#f7eee7; cursor:pointer; line-height:1.5`; Checkbox `appearance:auto; -webkit-appearance:checkbox; flex:0 0 26px; 26×26; min-height:26px; padding:0; margin:2px 0 0; accent-color:#dfbe95`; angehakt `:has(input:checked){border-color:#dfbe95; background:#49382d; box-shadow:0 0 0 1px #dfbe95}`; `[hidden]{display:none}`; Fokus `:focus-within{outline:3px solid #f5ddbc; outline-offset:3px}`; Link `#f5ddbc` unterstrichen; `.consent-state{display:block; font-size:13px; font-weight:600; margin-top:5px; color:#d7c5bd}` mit **Text in CSS `content`**: „Zum Bestätigen anklicken“ (661), „✓ Bestätigt“ in `#ffe3b8` (662), `aria-hidden="true"`. 352×85.5 @390; Versionsstring „2026-09-19.4“ bricht um.

**Rechtsbestätigung `#rechtsBestaetigung`** (club:663–669; Markup 895–899; JS 1033–1051): Box `padding:22px; border:1px solid #927875; border-radius:18px; margin-top:24px`; `.bestaetigt` `#dfbe95` / `#302820`, blendet `p.small` aus. `#rechtAnnehmen.main-action` `min-height:52px; width:100%; margin-top:12px`; erledigt (`:disabled`) `opacity:1; background:#dfbe95; color:#21191a; border:2px solid #f5ddbc; cursor:default`; beschäftigt `#49382d`/`#ffe3b8`. `#rechtStatus` `#ffe3b8`, 600, `margin:12px 0 0`. Labels „Bedingungen ausdrücklich annehmen“ → „Wird gespeichert …“ → „✓ Bestätigung gespeichert“; Status „Deine Bestätigung ist gespeichert. Du musst nichts weiter tun.“. Bei 390 bereits zweizeilig (84px).

**Wallet** (club:909–913; JS 1056–1089): Markup `<div class="club-footer" id="walletAuswahl"><span>Mit Liebe, Lorin</span><div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center"><button id="appleWalletBtn">Zu Apple Wallet hinzufügen</button><button id="walletBtn">Zu Google Wallet hinzufügen</button></div></div>`; gemeinte Regel `.club-footer > button{display:inline-flex; align-items:center; gap:7px; background:transparent; border:0; font-size:13px; padding:10px 0; min-height:44px; color:var(--mp-text)}` (club:334) greift nicht → grau 30px (§5.1). `.club-footer` flex, space-between, gap 10px, `margin:21px 0`, wrap; Signatur `italic 20px var(--mp-heading)` muted. `#walletTop.icon-button` 44×44 mit `#i-scan` („Karte in die Wallet legen“), scrollt zu `#walletAuswahl` (sanft außer Reduced Motion, club:1087). Apple lädt `LaPerle-Club.pkpass`, Google leitet auf `https://pay.google.com/gp/v/save/…`.

**Postfach-Bildschirm `.pending`** (club:728–742, Rest 645–646): `text-align:center; padding:40px 0`; `.dialog-pearl` (gleiche Regel wie `.art-pearl`, statisch) `margin:0 auto 24px`; h1 inline `margin:12px 0` „Schau in dein Postfach.“ (personalisiert club:1014); Aktionen `.secondary` „Link erneut senden“ 49 + `.linkbtn` „Andere Adresse verwenden“ 44.

**Weitere Module:** Leaderboard `.board .brow` Grid `32px 1fr auto`, gap 10px, `padding:10px 0`, `.ich` Akzent, `.pl` `500 18px` heading (club:355–358) · Advent `.advent` Grid `repeat(4,1fr)` (3 ≤480), gap 8px; `.door` min 64px, 12px, `500 20px` heading, `.auf` Akzentrand + reward-Verlauf, `.verpasst`/`:disabled` .5, `.bild` .35 (club:359–365) · Empfehlung `.empf .zahlen` gap 24px, `margin:14px 0`, `span` `400 34px/1` heading; `.linkfeld` gap 8px, `code` 13px muted `overflow-wrap:anywhere` (Browser-monospace, bricht mitten in der URL) (club:370–374) · Gewinne `.gewinn` gap 12px, `.bild` 56×56 12px, Titel inline `font:500 18px var(--mp-heading)` (club:375–376, 1249) · Banner `#bannerBox.card` inline Akzentrand, h3 inline `margin:6px 0`, Text inline 15px, `a.secondary` inline `margin-top:12px;display:none` → JS `inline-flex` (club:1479) · Konto `<details>` mit ungestyltem `summary` „Konto und Datenschutz“ 16px, **24px hoch** (club:900–905) · Kundennummer als Text `<b id="kNr" style="font-weight:500;color:var(--mp-text)">` (club:906).

**QR:** Club zeigt **keinen QR** (Kundennummer als Text); Pass enthält QR (Wallet-App rendert); Terminal scannt per jsQR; einziger QR-Platzhalter `wallet-vorschau/index.html:7` `.qr{width:112px;height:112px;…background:#fff;border-radius:6px;color:#626262;font-size:11px;…border:12px solid #fff;outline:1px solid #0001;outline-offset:-1px}`, `.qr-area{display:grid;place-items:center;padding:10px 0 23px}`; Fußzeile „Schrift, Abstände und QR-Code stellt die jeweilige Wallet-App auf dem Gerät dar.“ (:13).

### 5.11 Feierbühne `.mp-feier` (club:491–567 / mp:474–549; Markup club:918–939; JS club:1297–1406)

Aufbau: `div.mp-feier#feier[role=dialog][aria-modal=true][data-kind]` > `.buehne` > `.zu` „×“ · `.mp-art` (`.mp-halo`, `.mp-orbit`, `.mp-arc.mp-left/right`, `.mp-pearl`, `.mp-check` „✓“, `.mp-dust` mit 12 `<i>`) · `.mp-copy` (`.mp-eyebrow`, h2, `.mp-detail`) · `.mp-reward` (`.mp-mark`, `.mp-reward-note`, optional `ul` mit `li.titel`) · `.aktionen > .btn#feierZu` · sr-only aria-live.

| Teil | mp | Werte |
|---|---|---|
| Overlay | 475–476 | fixed, inset 0, z 1000, `display:none`, zentriert, `padding:16px`, `rgba(16,13,16,.86)`, `blur(6px)`, overflow auto |
| Öffnen | 477 | `.mp-feier.an{display:flex; animation:mp-ebene 250ms var(--mp-ease) both}` |
| Bühne | 478–480 | `width:min(480px,100%); max-height:calc(100vh - 32px); overflow:auto; color:var(--mp-stage-text); background:var(--mp-stage); border:1px solid #493A45; border-radius:24px; padding:0 24px 28px; text-align:center; background-image:radial-gradient(ellipse at 50% 22%,#30202C 0,transparent 65%)` – 358×588.8 @390, 480×579 @1280 |
| Schließen | 481–482 | `right:10px; top:10px`, transparent, stage-muted, 26px, min 44×44, rund, z 5; Hover stage-text + `rgba(255,255,255,.06)`; Glyph „×“ (nicht `#i-x`) |
| Kunstfläche | 483 | `height:215px; width:240px; margin:0 auto` |
| Perle | 484–486 | 72×72, `left:84px; top:78px`, rund, z 2, `radial-gradient(circle at 32% 26%,#FFF9E9 0,#EDDBCB 15%,#BF969F 43%,#695360 70%,#E4C9B8 100%)`, `inset -8px -7px 14px #24181C88, 0 14px 26px #0008` (Rosé-Perle, bewusst anders als Champagner-Kartenperlen, V21) |
| Orbit | 487–488 | `left:56px; top:50px`, 128×128, `1px solid var(--mp-stage-gold)`, rund, `0 0 22px #D6B78318, inset 0 0 20px #D6B78315` |
| Halo | 489 | `inset:12px 20px`, rund, `radial-gradient(ellipse,#D6B78324,transparent 65%)` |
| Bögen | 490 | `top:65px; left:71px`, 98×98, `1px solid var(--mp-stage-rose)`, rund, opacity 0 |
| Häkchen | 491–492 | z 3, `top:85px; left:94px; width:52px`, 40px, `#30202C`, opacity 0; sichtbar bei `[data-kind="redeem"]` (nur Terminal) |
| Staub | 493–494 | `left:118px; top:113px`, 3×3, rund, stage-gold, opacity 0 |
| Eyebrow | 495 | stage-gold, 12px, `.22em`, `margin:0 0 9px`, uppercase |
| Titel | 496 | `font:400 clamp(32px,6vw,46px)/1.12 var(--mp-heading); letter-spacing:-.02em` (32px @390, 46px @1280) |
| Detail | 497 | stage-muted, `margin:14px 0 22px`, 16px |
| Prämienkarte | 498–499 | `max-width:370px; margin:0 auto 24px; border:1px solid #725942; border-radius:16px; padding:18px 20px; background:linear-gradient(130deg,#2D2025,#1A151A)`, overflow hidden, zentriert |
| Marke | 500 | `.12em`, stage-gold, 17px, mb 6px, `overflow-wrap:anywhere` |
| Notiz/Liste | 501–502, 535 | Notiz 13px muted; `ul` `margin:10px 0 0; padding:10px 0 0; border-top:1px solid #493A45; 14px`; `li.titel` 12px `.12em` uppercase muted mb 4px |
| Prämienglanz | 503 | `::after{inset:-40%; linear-gradient(115deg,transparent 35%,#F4DFB940 50%,transparent 65%); translateX(-120%)}` |
| Button | 504–506 | `.mp-feier .btn{background:var(--mp-stage-gold); color:var(--mp-stage); min-height:48px}`; Ghost transparent / stage-text / `#8D7785`; Reihe zentriert mt 8px; 162×54 |
| Kompakt (Terminal) | 521–523 | Kunst `height:180px; scale(.8); margin-bottom:-20px`; alle Animationen `.65s !important`, Verzögerung 0s |
| Inline (Terminal) | 527–534 | `position:static; padding:0; margin-top:16px; background:none; z-index:auto`; Bühne `padding:14px 16px 14px; border-radius:16px`; Kunst `height:150px; scale(.7); margin:-10px auto -24px`; h2 24px; Detail `margin:6px 0 12px; 14px`; Prämie `12px 14px`; `.btn{min-height:44px; padding:10px 18px}` (46px) |
| Reduziert | 536–537 | `.mp-feier.mp-reduced *,…::after{animation:none !important; transition:none !important}`; Bögen/Staub `display:none` |
| GSAP-Übernahme | club:649–651, T:662–665 | `.mp-feier.mp-gsap,… *::after{animation:none!important;transition:none!important}`; `.mp-reward::after` aus; `.mp-gsap-shine{position:absolute;inset:-40%;pointer-events:none;background:linear-gradient(115deg,transparent 35%,#F4DFB933 50%,transparent 65%)}` |

Arten: club `level`, `unlock`, `both` (club:1335); `redeem` nur Terminal. Verhalten: Hintergrund `inert`, `body.style.overflow="hidden"` (club:1370–1372); gemessen mit GSAP `mp-feier an mp-play mp-gsap`, bei Reduced Motion `mp-feier mp-reduced an mp-play`. **CSS-Fallback und GSAP weichen ab:** Bögen in CSS nur `unlock`, in GSAP `unlock`+`both`; Staub 96/82px (CSS) vs. 90/75px (GSAP); `.mp-copy` nur in GSAP animiert; `.mp-gsap` hebt die 250ms-Einblendung auf.

### 5.12 Terminal (`terminal/index.html`, `<body class="terminal">`, Titel „La Perlé · Empfang“)

- **Kopf:** `theme-color #21191A`, `viewport-fit=cover`, `apple-mobile-web-app-capable`, Statusleiste `black-translucent` (T:9–12); kein `env(safe-area-inset-*)`. Vendor: fonts.css, `supabase-2.57.4.js`, `jsQR-1.4.0.js` (T:16–18), `gsap.min.js`, `celebration-motion.js` (T:667–668).
- **Bildschirme:** `.screen{display:none}` / `.on{display:block}` (T:643–644): `#sLogin`, `#sHome`, `#sKundin` (T:684, 697, 733). `.workspace{padding:32px; max-width:1200px; margin:0 auto}` (mp:364), h1 38px `margin:12px 0 25px` (mp:365).
- **Anmeldung:** `.login{max-width:420px; margin:12vh auto 0; padding:0 20px; text-align:center}`, Logo `min(240px,70vw)`, Felder links (mp:412–414); Eyebrow „Empfang“ inline `margin:16px 0 28px` (T:687); `#studio` (Platzhalter „z. B. FFM-01“, `autocapitalize="characters"`), `#pin` (`type=password inputmode=numeric`) je 50px; `#loginBtn.main-action` mit Pfeil 380×60 @1280 / 350×60 @390; Enter löst aus (T:1194).
- **Suche/Scan:** `.searchrow` + `label.search` (§5.2); Buttons „Suchen“, „Karte scannen“ (`i-scan`), in `#sKundin` zusätzlich „Start“ (`i-back`), alle `.secondary`. `.scanbox{position:relative; background:var(--mp-stage); border-radius:18px; overflow:hidden; aspect-ratio:4/3}`, `video{object-fit:cover}`, `.frame{inset:18%; border:1.5px solid rgba(255,249,244,.8); border-radius:16px}` (mp:406–408); ein `#scanbox` wandert in `.scanslot` (T:1274), `.scanslot:empty{display:none}` (T:648); `facingMode:"environment"` (T:1279), alle 350ms, nur `/^\d{6}$/`; Label „ Karte scannen“/„ Kamera stoppen“ (T:1283, 1297); kein Hinweistext, keine Lampe. „Neue Kundin“: `.card`, Absatz inline `margin:6px 0 14px` (T:724), `.secondary` „Kundin anlegen“ mit `i-plus` (T:725); `.home-grid{display:grid; gap:24px; max-width:640px}` (T:659). „Abmelden“ `.linkbtn`.
- **Ungeklärte Buchungen (R01):** `#offenHinweis`, `#unklar` (`.unklar`, T:714, 752); `#offenListe` `.card` (T:1392–1411), Rest: mb 24px, `.zeile` flex-wrap gap `8px 14px`, `padding:10px 0`, Unterrand, `.t{flex:1 1 220px}` (T:649–652); je Zeile `.btn.ghost.sm` „Zur Kundin“ und „Aus der Liste nehmen (bleibt ungeklärt)“, Bestätigung `confirm()` (T:1407).
- **Kundinnenkarte `.customer` (V13):** surface, 18px, 25px (mp:368); `.customer-top` flex space-between gap 10px mb 16px (369); `.avatar.large`; `.rank`; Name h2 27px `overflow-wrap:anywhere` (370); `.kunde-nr` 13px muted mt 4px (T:660); `.customer-balance{font:400 54px/1 var(--mp-heading); margin:22px 0 15px; font-variant-numeric:tabular-nums}` (371; 44px ≤480), Einheit `.u` 13px Jost muted (372), Wert roh „1284“ (T:1315); `.customer-line` flex space-between 13px `padding:10px 0` Oberrand, `strong` 500 rechts (373–374), 40.5px; Schnellaktionen `.btn` „Perlen buchen“ 54 + `.btn.ghost` „Prämien einlösen (3)“ 47 (T:774–777). **Puls `.stand.puls{animation:zahl .6s var(--mp-ease)}`** (mp:404–405) spielt nie: `puls` landet auf `#kStand` (T:1316), `.stand` sitzt auf `#kStandWrap` (T:769), gemessen `animation-name:none`. `.customer .secondary{width:100%}` (376) trifft nichts.
- **Perlen buchen `.booking` (V14):** `padding:0 0 20px`, h2 `margin:12px 0 6px`, `.fuer` 14px muted mb 22px (mp:377–380); Eyebrow „Punkte buchen“, h2 „Ein Besuch. Eine neue Perle.“ (T:807–808). `.amount-label` 13px (381); `.amount` flex baseline gap 8px, Unterrand line, `padding:9px 0`, mb 20px, `font:400 56px/1.1 var(--mp-heading)`, tabular, min-height 80px (382–383; 44px ≤480); `.amount > span{font-size:30px}` (384) trifft nichts; Anzeige `euro()` „129,50 €“. `#amountInput` `inputmode=decimal`, `maxlength=10`, `/^\d{0,7}(,\d{0,2})?$/` (T:813, 1382–1386), Label „Betrag direkt eingeben oder Ziffernblock nutzen“. **Ziffernblock `.pad`:** Grid `repeat(3,1fr)`, gap 8px, **max-width 320px**, `margin:0 0 20px` (385); Tasten min 52px, `font:400 26px var(--mp-heading)`, surface, line, 12px (386–387); `:active` (388); ≤340 gap 6px, 48px/22px (611); JS-Tasten „1“–„9“, „,“, „0“, „←“ mit aria-labels „Komma“/„Löschen“ (T:1414–1427); kein Hover; berührt das Eingabefeld (0px Abstand); @1280 320px in 691-px-Spalte. `.formzeile` mit „Behandlung“ (Laser / Gesichtsbehandlung / Produkt / Geschenkgutschein / Sonstiges) und „Zahlungsart“ (aus Daten, Faktor „(50 %)“) (T:815–823), je 50px. `.booking-separator` 1px line mt 24px (392). `#buchenBtn.main-action` 60px, Label „Perlen buchen“/„`<Betrag>` buchen“ (T:926; Pfeil geht verloren). `.categories` (389–391) ungenutzt.
- **Prämienliste `#praemienCard .list .item`:** Kopf `.terminal-reward` flex gap 8px 13px Akzent (mp:375), inline `margin:0 0 8px` (T:782); `#rewardSummary role=status`; Erklärung inline `margin:0 0 12px` (T:784). `.list .item` Button, Grid `1fr auto`, gap `2px 12px`, bg `--mp-bg`, line, 12px, `12px 14px`, mb 8px, min 56px (394–395); `.t` 500 / `.u` 13px muted / `.p` zwei Zeilen tabular muted (396–398); `.erreichbar` Akzent (399); **`.gewinn` `--mp-ok`-Rand + grünes `.p` 13px `.06em` uppercase „AUSGEBEN“** (400); `:disabled` .55 gestrichelt (401, Unterzeile ~3.4:1). Reihenfolge: offene Gewinne, einlösbar, nach Punkten (T:1331); Punkte roh („1500“); leer `<p class="leer">Keine Prämien hinterlegt.</p>` (T:1340).
- **Verlauf/Korrektur `#korrCard`:** `.section-title` (mp:451) inline `margin:0 0 8px` (T:830), h2 „Letzte Buchungen“ + `.btn.ghost.sm` „Korrigieren“. `.log .zeile{display:grid; grid-template-columns:1fr auto auto; gap:12px; padding:9px 0; border-top:1px solid var(--mp-line); font-size:14px}`, `.b` 500, `.d` muted (402–403), 40px je Zeile, **jede Zeile eigenes Grid → Spalten fluchten nicht**; Korrekturliste (T:1448–1480) mit `table.korr` (§5.5), Aktion `.btn.ghost.sm` „richtigstellen“ (Zeile 65px vs. 44px) oder „korrigiert“; Werte über zwei `prompt()` (T:1483, 1488).
- **Ziel, Glücksrad, Übernahme:** `#zielKarte` `.card` + Akzentrand (T:789), Satz inline `font:500 21px/1.3 var(--mp-heading); margin:8px 0 0` (T:791). `#wheelCard .wheelwrap` zentriert (mp:409); `.needle` CSS-Dreieck 9px+9px, 18px Akzent-Oberrand, z 2 (410); Canvas 520×520 inline `width:260px;height:260px;max-width:100%` (T:800); `#wheel` 4.8s (411); Canvas-Farben T:1571–1577 (Segmente `#3F2B30`/`#F6E9DF`, Beschriftung `#DFBE95`/`#5A4242` in `400 22px Jost`, Nabe `#302327` mit `#DFBE95` 2px, „La Perlé“ `600 24px 'Cormorant Garamond'`; die hellen Segmente sind die einzige fast weiße Fläche im Terminal); „Drehen“ `.btn` inline mt 14px (T:801). `#uebCard` „Punkte übernehmen“: `.formzeile` inline mt 12px mit „Alter Punktestand“ (`type=number`) und „Beleg oder Hinweis (optional)“, `.btn` „Übernehmen“, `confirm()` (T:1501).
- **Sheets:** `#sheetNeu` (`.card.breit`): Vorname, Nachname, E-Mail, Geburtsdatum (`type=date`), Empfehlung, Sprache (Deutsch/Englisch/Russisch), Notiz inline `margin:16px 0 0`, `.aktionen` inline `justify-content:flex-end` (T:854–867). `#sheetAus` „Prämie ausgeben“ (T:871–881): Kassenbon-Nummer (Pflicht), Nachlass in Euro, USt 19/7/0 %. „Abbrechen“ 47 / „Anlegen“/„Ausgeben“ 54. Overlay gemessen `rgba(28,19,11,0.71)`.
- **Inline-Feier „kurz“ (V25):** `kurzFeier()` (T:1218–1243) baut `.mp-feier.mp-compact.mp-inline.mp-buehne-klein.an` (+ `.mp-reduced`) in `#kurzFeier aria-live=polite`; Eyebrows „Dein Moment ist da“ / „Neuer Rang“ / „Freigeschaltet“; Staub inline (T:1237–1239).
- **Layout (V13/V15):** Rest `.terminal-spalten{display:grid; grid-template-columns:.85fr 1.4fr; gap:26px; align-items:start}`, `.stapel{display:grid; gap:26px; min-width:0}`, `.stapel > *{margin:0; min-width:0}` (T:645–647) – 419/691px @1280, 353/581px @1024; `.terminal-grid` (mp:366–367) ungenutzt. ≤768 (T:653–658): `display:flex; flex-direction:column; gap:18px`, `.stapel{display:contents}`, Reihenfolge Kundin 1 → Buchung 2 → `#praemienCard` 3 → `#korrCard` 4 → `#zielKarte` 5 → `#uebCard` 6 → `#wheelCard` 7. **Fehler:** `align-items:start` bleibt → Karten schrumpfen auf Inhalt (@768: 503/315/728/697/395/310/622px; @390: customer/praemien/ziel/ueb 356, korr 326, booking 315, wheel 310); „Korrigieren“ geöffnet @390 → `#korrCard` 470px, **97px Überlauf** (127px @360).
- **Ziele (Touch):** Pad 100–101×52 (48 ≤340), Buchen/Anmelden volle Breite×60, `.btn` 54, Ghost 47 (52/56), `.btn.sm` 44, Prämienzeile ×71.5, Felder 50, „Weiter“ 86×46, Abstände 8px (`.aktionen`, Pad), 10px (Suche), 12px (`.unklar`).

### 5.13 Verwaltung (`backend/index.html`, `<body class="admin">`, Titel „La Perlé · Verwaltung“)

- **Rahmen:** `.admin .brandbar{padding:22px 30px}` (mp:426); `.admin-layout{display:grid; grid-template-columns:176px 1fr; min-height:calc(100vh - 92px)}` (427; Markenleiste real 99px). **Sidebar** (428–438): `padding:29px 16px`, surface, flex column, gap 5px; `.gruppe` Eyebrow `padding:14px 10px 6px` (erste 0 oben); Buttons flex gap 10px, volle Breite, transparent, 8px, `11px 10px`, 14px, min 44 (144×44); Hover `rgba(33,25,26,.5)`; `[aria-current="page"]` `--mp-bg` + Akzent; Icons 16px muted; `.sidebar-foot` mt auto, `padding:48px 10px 10px`, `500 19px` heading „La Perlé Club“ + 12px „Mit Sorgfalt verbunden.“; nicht sticky. Navigation 5 Gruppen / 17 Einträge (B:699–723): Überblick (Übersicht, Bericht) · Kundinnen (Kundinnen, Verhalten, Zielgruppe, Rückkehr, Feedback, Umzug) · Treueprogramm (Prämien, Prämienauszug, Ränge, Aktionen, Adventskalender) · Kommunikation (Automatik, Mitteilungen, E-Mail) · Betrieb (Funktionen); Rollensteuerung blendet 12 Einträge für Nicht-„zentrale“ aus (B:1536–1554), leere Gruppen verschwinden (V18). ≤768 (584–588): Sidebar verborgen, mit `.offen` im Fluss (padding 12px, gap 2px), Fuß aus; `.bereiche-btn` „☰ Bereiche“ + aktueller Bereich, **390×52 bei x = 0** (direktes Grid-Kind, kein Gutter), bei 768×1024 **52 / 57.4 / 210 / 229px** hoch (gestreckt durch `min-height` im Ein-Spalten-Grid). `.admin-content{padding:30px}` (440), 20px ≤768, `20px 17px` ≤480. `.admin-title` (441–443) flex space-between wrap gap 16px mb 8px; **h1 immer „Dein Studio im Blick.“** (B:727) 33px (28px ≤480); oben rechts `.secondary` „Bericht“ mit `i-download` (99×52, inline `onclick`, B:728) auf jedem Bereich.
- **Anmeldung:** wie Terminal; Eyebrow „Studioverwaltung“ inline `margin:16px 0 4px`, Zeile „Auswertungen und Inhalte · nur für Studioleitung und Zentrale“ inline `margin:0 0 20px` (B:680–681); `#loginBtn` „Anmelden“ **ohne Pfeil** (B:684); Studio-Kennung ohne Platzhalter.
- **Zeitraumfilter:** §5.1 Reihe 6; nur Übersicht und Prämienauszug (B:2075).
- **Kennzahlen `.metrics` (V19):** `kpis()` (B:1108–1109) `<div class="metrics"><div><span>label</span><strong>value</strong><small>sub</small></div>…`; `grid-template-columns:1.2fr 1fr 1fr; margin:28px 0 35px; border-top/bottom:1px solid var(--mp-line); padding:23px 0; gap:18px`; Zelle 16px; Label 12px muted; `strong` `500 32px/1.15 var(--mp-body)`, tabular, nowrap, `margin:6px 0`; `em` 20px muted; `small` 12px muted; `.weitere` ohne Oberrand (444–450); ≤1023 2 Spalten (579), ≤768 1 Spalte, Zelle `1fr auto`, Wert rechts 28px, `10px 8px`, gap 8px (589–591). **Waisen:** Übersicht „weitere“ 5 (3+2), Kundinnen-Gruppen 4, Kundin-Detail 4, Rückkehr 6, Feedback 4, Umzug 4, Zielgruppe 4, Bericht „Geld“ 4; Dreierreihe 165px, Fünferreihe 276px @1280. Bericht: `.bdelta` („+6.4 % zum Vormonat“, 16px, grün) ersetzt die 12px-Unterzeile (B:1582, 1596).
- **Diagramme:** `.bars{display:flex; align-items:flex-end; gap:3px; height:120px; margin-top:12px}`; `.bars div{flex:1; min-width:2px; background:var(--mp-accent); border-radius:3px 3px 0 0; opacity:.85}` (B:643–644); Höhen inline % (B:1250, 1368, 1433); Tooltip nur `title`, keine Achsen; Bildunterschrift inline mt 10px. Heatmap (B:1407–1427): Tabelle inline `min-width:560px` in `#heat.tabelle-scroll` (inline mt 18px); Zellen `<td style="padding:0">` mit div `height:34px; background:rgba(223,190,149,${a*.9}); border:1px solid var(--mp-line); display:grid; place-items:center; font-size:12px; color:${a>.55 ? "#2E211B" : "var(--mp-text-muted)"}`; Stunden-`th.num` rechtsbündig über zentrierten Zellen; Beschriftung „Je dunkler, desto mehr Besuche“ (B:853) im Dunkelthema falsch (mehr = heller). Rang-Simulation inline `height:14px; width:%; min-width:2px; background:var(--mp-accent); border-radius:3px` (B:1514–1515).
- **Tabellen:** §5.5. Inline-Zellstile: `white-space:nowrap` (B:1418), `color:var(--mp-warn)` „überfällig“ (B:1796), Sterne `color:var(--mp-accent);font-size:15px` (B:1828), Adventstag `font-family:var(--mp-heading);font-size:21px;color:var(--mp-accent)` (B:2043), Rangname `font-weight:500;font-family:var(--mp-heading);font-size:19px` (B:1489), `b style="font-weight:400"` (B:1620, 1622, 1971).
- **Kundin-Detail `#kDetail`:** `.card` `tabindex=-1`, `#kDetail:focus{outline:none}` (B:647); Kopf `.row` (undefiniert) mit h2 + „Zugangslink anfordern“, „Schließen“; KPI-Reihe, Balken, Bildunterschrift inline `margin:10px 0 18px`, `.grid2` mit h3 (inline mb 8px); Scroll `behavior:"smooth"` (B:1382) ohne Reduced-Motion-Prüfung.
- **Formulare:** `.formzeile` für Prämien, Ränge, Aktionen, Rückkehr, Google, Umzug, Mail, stets inline mt 16/12/18px. Mitteilungen: Vorlagen-Chips `.btn.ghost.sm` ×4 nach „Schnell:“, Titel (maxlength 80), Zielgruppe (8 Optionen), textarea, zweite `.formzeile` mit fünf Feldern, „Wie viele?“ 47 + „Absenden“ 54, `confirm()` (B:1741).
- **Funktionen:** `.switch`-Zeilen mit `.btn sm` „an“ / `.btn ghost sm` „aus“ (`aria-pressed`, klein geschrieben); `.sw` ungenutzt.
- **E-Mail/Postausgang:** sechs Felder (API-Schlüssel `type=password`, Platzhalter „xkeysib-…“, danach „hinterlegt – nur zum Ändern ausfüllen“; Absender; Name; Antwort-an; Club-URL; „Versand scharfgeschaltet“ nein/ja) (B:1042–1072); Aktionsreihe §5.1 Nr. 10; Status muted inline mt 14px; DNS-Tabelle statisch. `#post` (B:1967–1973): `.pill` aus `MAIL_STATUS`, bei ungeklärt/fehlgeschlagen primärer `.btn` „Versand klären“ (54px) in der Zelle; `mailKlaerDialog()` (§5.9).
- **Bericht (V34):** `.bericht-kopf` mt 8px (B:648), Titel inline 26px heading (B:1587), optional `.hinweis.noprint`, `.card.bblock` (`break-inside:avoid`, B:645): Geld, Das Programm, Kundinnen, Prämien, Risiko, Beiwerk, „Was auffällt“ (`.beob`); „Als PDF sichern“ → `window.print()` (B:1576); Druck blendet Sidebar, Markenleiste, `.aktionen` aus.
- **Rückmeldung:** `bestaetigt()` toggelt `.bestaetigt` 400ms – **keine CSS-Regel** (B:1141–1148).
- **Seitenrest (B:639–650):** `.hide{display:none !important}`, `.grid2{grid-template-columns:1fr 1fr; gap:16px}` (1 Spalte ≤1023), `.bars`, `.bblock`, `.kpi-row{margin-top:0}` (ungenutzt), `#kDetail:focus{outline:none}`, `.bericht-kopf`, `section > .card:first-child{margin-top:0}`, `.tabelle-scroll{margin-top:12px}`.

### 5.14 club/recht.html (Seitenrest recht:634–647)

`.wrap{max-width:720px; padding:24px 24px 80px}` (635); h1 40px `margin:14px 0 6px`, h2 28px `44px 0 6px` `scroll-margin-top:20px`, h3 20px `26px 0 4px` (636–638); `p,li` 16px, lh 1.7, `overflow-wrap:anywhere` (639); `.brand` 12px `.26em` muted zentriert mb 8px (641); `.nav`/`.nav a` gap 8px `margin:22px 0 10px` / 14px `10px 16px` 12px min 44 surface (642–643, ungenutzt); `.box`, `.tbd` (644–645, ungenutzt); Footer `margin-top:60px; padding-top:20px; border-top:1px solid var(--mp-line)` (647). Struktur 1:1 wie Wurzel recht.html (720px, 40/28px), aber 16 statt 15px, 12 statt 999px Radien, min-height 44px neu. Keine Button-Bauteile.

### 5.15 Legacy-Bauteile (nur Referenz)

Wurzel backend.html: `.btn` min 52px, `padding:.85rem 1.6rem`, gap .6rem, Jost 500 16px `.03em`, Verlauf 135deg `#B49153→#7C6029`, Text `#FFFCF7`, Schatten `0 10px 26px rgba(124,96,41,.24)`, Sheen 4.5s infinite (:53–61); `.btn.sm` `padding:7px 14px` **aber weiterhin 52px**; Karte 24px (:44) → zweite Regel 20px (:69) gewinnt, Padding 22px; Felder 20px Radius, `11px 13px`, 15px/300; Tabs 999px `9px 18px`, 36px, `aria-pressed`, aktiv `#B49153`/`#FFF9F4`; Pill 999px `4px 11px`; Toast Tinte `13px 22px`, bottom 26px, Fehler `var(--warn)`; KPI-Grid `repeat(auto-fit,minmax(190px,1fr))` gap 14px (keine Waisen), `.kpi .n` Cormorant 600 42px lh 1 `--plum`, `.kpi .l` 11.5px `.16em`, `th` Jost 500 11px `.14em`, Tabelle 13.5px, `th 10px 12px`, `td 10px`; `.kicker` Cormorant italic 500 1.1rem `--gold-deep`; `.brand small` Cormorant 10px `.28em`; `.wrap` max 1180px, `padding:26px 30px 60px` (≤820 16px); `.grid2` gap 20px; `.beob` `10px 0 10px 14px`. Wurzel recht.html: `.wrap` 720px `padding:30px 24px 80px`; h1/h2/h3 40/28/19px Cormorant 400; p/li 15px lh 1.7; `.muted` 13.5px; `.nav` gap 8px, Link `8px 16px` 999px 13.5px; `.box` 16px `padding:18px 20px`; `.tbd` 5px; th `8px 8px` 11px `.12em`, td `9px 8px`; Footer mt 60px.

### 5.16 Tote, undefinierte und überschriebene Regeln

- **Ungenutzte Selektoren:** `.btn-gold`, `.btn-line`, `.btn-ghost`, `.row-button`, `.btn.gefahr`/`.danger`, `.card-dark`, `.overlay`, `.dialog`, `.dialog .icon-button.close`, `.tabs`, `.stars`, `.categories*`, `.empty`, `.admin-bottom`, `.bottom-pearl`, `.terminal-grid`, `.amount > span`, `.customer .secondary`, `.mp-kurz*`, `.customer-row*`, `.pill.gut`, `.brandbar .logo span`, backend `.kpi-row`, recht `.nav`, `.box`, `.tbd`; `.icon-button`/`.row-button`/`.btn.gefahr` in Terminal/Backend nicht verwendet.
- **Benutzt, aber nirgends definiert:** `.row` (B:1359, 1517, 1951), `.hint` (T:792), `.korr` (T:1460), `.bestaetigt` (B:1146), `.mp-copy`, `.mp-buehne-klein`, `.club-body`, `.ziel.geschafft`, `.nm`, `.weiter` (JS-Haken). Gesetzt, aber nie getroffen: `.stand.puls`.
- **Überschrieben/tot:** mp:85 (`max(1rem,16px)`) ← 155; mp:86 (Platzhalter) ← 161; mp:87 (`.btn` 44px) ← 118 (48px); mp:88 (`.linkbtn 8px 4px`) ← 145; mp:89 (`min(92vw,640px)`) ← 207; mp:162 `outline:0` ← 568; `.btn::after,.btn::before{content:none !important}` (128) muss vom `!important`-Spinner (141) geschlagen werden; `#ladeFehler` (90) seitenspezifisch im gemeinsamen Block; `.customer .secondary`, `.amount > span`.

---

## 6. Assets

### 6.1 Seitenlogo (PNG per Data-URI)

- **660 × 660 px**, 8 bit RGBA, nicht interlaced; dekodiert 104 464 B (Base64 inline ≈ 139 KB); md5 `ff850c3c037763314a38f49929d79a9b`; **bytegleich in allen 8 HTML-Dateien** (inkl. recht-2026-09-19-3/4, Wurzel recht.html, backend.html). Chunks IHDR, **caBX** (5 758 B C2PA-Manifest „Anthropic Files“, Aktion `c2pa.opened`), IDAT ×2, IEND.
- Inhalt: gestapeltes Vollzeichen, Gold `#B49153` auf transparent, Perle rosé-weiß (z. B. `#FBF7F5`). Bänder (PNG-Pixel): Wortmarke „La Perlé“ y 109–211 / x 134–524 · „BEAUTY BOUTIQUE“ y 232–253 / x 167–492 · Muschel mit Perle y 284–409 / x 237–422 · Leistungszeile „Laser-Haarentfernung • Skincare • Lash & Brow Lift • Zahnbleaching“ y 444–465 / **x 0–659 (bis an beide Kanten, „g“ rechts angeschnitten)** · „by Lorin“ y 486–549 / x 265–394; 408 605 von 435 600 Pixeln voll transparent, oben 109 px / unten 110 px leer.
- Einbindung: Skript am Seitenende setzt `img[data-logo].src` und das Favicon (club:1535–1536, terminal:1603–1604, backend:2092–2093, club/recht:833–834, recht.html:256, backend.html:1476). Alt-Texte „La Perlé Beauty Boutique“ / „La Perlé“.
- **Varianten nur per CSS/Größe:** Markenleisten-Ausschnitt 140×54, Bild 220px bei `left:-40px; top:-30px` (mp:225–226) – zeigt Wortmarke + BEAUTY BOUTIQUE; BEAUTY BOUTIQUE endet rechnerisch bei 54.33px im 54-px-Fenster (bündig). Anmeldung Vollzeichen `min(240px,70vw)` (mp:413). club/recht Vollzeichen 150px (recht:653, Leistungszeile unlesbar). Legacy: backend.html Login 78px (:120), Kopf 38px (:35); recht.html 150px (:41). Unter ≈240px ist die Leistungszeile unlesbar (≈2–5 px Versalhöhe).
- Drei Logo-Darstellungen in der MP-Familie; der Markenleisten-Ausschnitt hängt an Pixelversätzen in ein quadratisches Rasterbild.

### 6.2 `original-logo.svg` (`assets/wallet/refined-metallic-v4/source/`, 72 681 B)

`viewBox="0 0 1080 872.57"`, `id="Layer_1"`, `aria-label="La Perlé Beauty Boutique by Lorin"`, `class="logo-svg"`, eine Farbe `.st0{fill:#b49153}`. 10 `path`, 5 `circle`, 1 `ellipse`, 4 `image` (WebP), 1 `linearGradient`, 1 `clipPath`, kein `<text>`. Teile (viewBox-Maß): Wortmarke Pfade 7 (1. Band), 8–11 → x 252–824, y 123–273 · BEAUTY BOUTIQUE Pfad 7 (2. Band) → x 300–778, y 304–335 · Muschel Pfad 18 (Fächer, x 436–644, y 382–503), Pfad 1 (Bogen, x 404–676, y 499–564), Pfad 0 (Keil, x 510–568, y 528–545) · **Perle** `circle cx=539.9 cy=501.39 r=32.93` mit Verlauf `#ebd6c7` (0) → `#efddd2` (.48) → `#eedcd4` (1) und 4 WebP-Rasterbildern (446×353, 353×381, 455×428, 575×498, `matrix(.24 …)`) auf den Kreis beschnitten – **die Perle ist Raster** · Leistungszeile Pfad 15 (x 54–1024, y 616–647) + 3 Trennpunkte `r=2.65` bei y 631.28 (x 399.33 / 561.59 / 821.76) · „by Lorin“ Pfad 16, Pfad 15 (2. Band), Pfad 18 (2. Band), `ellipse` (cx 594.15, cy 716.74, rotate -23.09). Gesamtbox x 54.05, y 123.23, b 971.92, h 647.21.

**Vorhandene kompakte Querversion (kein neues Logo):** `scripts/export-refined-wallet.cjs:20–22`: 160×50-Fläche; Wortmarke = viewBox `240 110 600 235` bei x0 y5 100×40; Muschel = viewBox `350 350 380 235` mit `stroke:ink; stroke-width:3; stroke-linejoin:round` („bold shell“) bei x105 y5 55×40.

### 6.3 Wallet-Bilder

- Apple `assets/wallet/refined-metallic-v4/apple/<rang>/logo.png` 160×50, `@2x` 320×100, `@3x` 480×150 (Palette-PNG): Wortmarke + Muschel in Rang-Tinte, Perle in Perlfarbe (`#EFDDD2`). Strips 375×123 / 750×246 / 1125×369. Icons `apple/icon.png` 29×29 / 58×58 / 87×87: Ausschnitt mit **angeschnittener Leistungszeile** („…ung • Skincare • Lash & Brow…“) und „by Lorin“; laut `release/wallet-design-refinement.md` „bytegleich“ freigegeben. Google-Hero 1032×812 (manifest.json).
- `wallet-apple/refined-artwork.ts` (`refinedAssets`) enthält alle 33 Apple-Bilder bytegleich (15 Logos, 15 Strips, 3 Icons). `wallet-apple/logos.ts` (`logoAssets`, 15 PNG, einfarbig tintengefüllte Perle) ist **toter Fallback** (`wallet-apple/index.ts:24–25` prüft zuerst `refinedAssets`).

### 6.4 Rangmotive (`source/<rang>.svg`)

Alle `width=1125 height=369 viewBox="0 0 1000 328" preserveAspectRatio="none"`; `#metal` linear x1 0 y1 .2 → x2 1 y2 .8; `#edge` vertikal (bei .22/.78 transparent); `#brush` Linienmuster 1000×3 (weiß .035 / schwarz .025); Lichtschnitt (Bronze-Gruppe opacity .45, sonst 1).

| Rang | Stopp 0 | .34 | .52 | .73 | 1 | Edge | Besonderheit |
|---|---|---|---|---|---|---|---|
| Bronze | `#503A30` | `#78533F` | `#78533F` | `#78533F` | `#503A30` | `#78533F` | Mitte ohne Glanz (light = base), Glanz .45 |
| Silber | `#9CA8B2` | `#C4CBD1` | `#EDF1F4` | `#C4CBD1` | `#9CA8B2` | `#C4CBD1` | |
| Gold | `#A88C56` | `#C8AC74` | `#E8D5A8` | `#C8AC74` | `#A88C56` | `#C8AC74` | |
| Platin | `#AAAFA9` | `#D0D0C9` | `#F1F1E9` | `#D0D0C9` | `#AAAFA9` | `#D0D0C9` | |
| Diamant | `#A5BDC9` | `#D1E2EC` | `#F5FBFF` | `#D1E2EC` | `#A5BDC9` | `#D1E2EC` | Facetten (Dreiecke weiß .12/.055, schwarz .05, Kanten weiß .17) |

### 6.5 `palette.json` (identisch `scripts/export-refined-wallet.cjs:6–10`)

| Rang | base | shade | light | ink | ink/base | Zeilen |
|---|---|---|---|---|---|---|
| Bronze | `#78533F` | `#503A30` | `#78533F` | `#FFF0DA` | 6.03 | 4–7 |
| Silber | `#C4CBD1` | `#9CA8B2` | `#EDF1F4` | `#24252A` | 9.33 | 11–14 |
| Gold | `#C8AC74` | `#A88C56` | `#E8D5A8` | `#322519` | 6.79 | 18–21 |
| Platin | `#D0D0C9` | `#AAAFA9` | `#F1F1E9` | `#30312F` | 8.44 | 25–28 |
| Diamant | `#D1E2EC` | `#A5BDC9` | `#F5FBFF` | `#203342` | 9.79 | 32–35 |

Bronze `light` = `base` (keine Glanzstufe). Keiner der Rangtöne ist grün (Platin shade `#AAAFA9` h 140.5° bei C 0.01 = neutral).

### 6.6 Pass-Farben

- **Apple** (`wallet-apple/pass.ts:9–13, 74`): `backgroundColor` = Rang-base als `rgb()` (Bronze `rgb(120, 83, 63)`, Silber `rgb(196, 203, 209)`, Gold `rgb(200, 172, 116)`, Platin `rgb(208, 208, 201)`, Diamant `rgb(209, 226, 236)`); `foregroundColor` = `labelColor` = Rang-ink (`rgb(255, 240, 218)`, `rgb(36, 37, 42)`, `rgb(50, 37, 25)`, `rgb(48, 49, 47)`, `rgb(32, 51, 66)`). Typ `storeCard` (78); `organizationName "La Perlé Beauty Boutique"`, `description "La Perlé Club – deine Kundenkarte"` (73); `sharingProhibited:true` (75); Header `PERLEN` (79); primär `"<RANG> · LA PERLÉ CLUB"` bzw. `"LA PERLÉ CLUB"` + Name (80); sekundär `MITGLIED SEIT` (81), `BIS <NÄCHSTER RANG>` mit „Noch n Perle(n)“ oder `DEIN STATUS` „Höchster Rang erreicht“ (84–85); Rückseite Kundennummer, „Dein Club und aktueller Punktestand“, „Bis zur nächsten Prämie“, „Karte aktualisieren“ (88–93); QR `PKBarcodeFormatQR`, iso-8859-1 (94); Bilder `icon`, `<rang>/logo`, `<rang>/strip` 1×/2×/3× (66–70).
- **Google** (`wallet/index.ts`): Klasse `issuerName "La Perlé Beauty Boutique"`, `programName "La Perlé Club"` (170–171), `hexBackgroundColor: "#21191A"` (174–175, Kommentar „V33: Seitenhintergrund der Midnight-Privé-Palette …“), `programLogo` = `d.logo_url` (177, Datei nicht im Repo), Labels „Mitglied“/„Kundennummer“ (182–183), Modul „So sammelst du“ (189), Link „Termin buchen“; Objekt `rangArtwork` (220–228) je Rang `#78533F`, `#C4CBD1`, `#C8AC74`, `#D0D0C9`, `#D1E2EC` (227) + `heroImage <rang>/hero.png` (ohne Asset-Basis `{}` → Klassenfarbe); `loyaltyPoints.label "Perlen"` (248); Sekundär-Label `"<Rang> → <Nächster>"` / `<Rang>` / `"Rang"` (232–236); Module „Bis zur nächsten Prämie“, „Mitglied seit“ (258–259). Die Vorschau zeigt für Google ersatzweise Apple-`logo@3x.png`.

### 6.7 CSS-Perlen (Muschel/Perlen-Motiv in der Oberfläche)

Kettenperle `radial-gradient(circle at 31% 24%,#FFFDF4 0%,#FAEFDF 15%,#E8D5C5 38%,#B8A3A0 67%,#F3E6D4 89%)` (mp:277) · Art-/Dialog-/Bottom-Perle `radial-gradient(circle at 28% 24%,#FFFDF7 0%,#F9EEDF 19%,#DFCBBF 48%,#A79595 75%,#F3E9DC 96%)` (mp:298) · Bühnen-/Kurz-Perle `…#FFF9E9 0,#EDDBCB 15%,#BF969F 43%,#695360 70%,#E4C9B8 100%` (mp:485 = 418). Tonal passend zur Logo-Perle (`#ebd6c7`/`#efddd2`/`#eedcd4`). Kein Perlen- oder Muschel-Icon im Sprite.

### 6.8 Schrift- und Skriptdateien (Bytes auf Platte)

Fonts §3.1. Vendor: `gsap.min.js` 72 435 und `ScrollTrigger.min.js` 44 157 (club:671–672; Terminal nur gsap, T:667), `supabase-2.57.4.js` 131 061 (alle MP-App-Seiten), `jsQR-1.4.0.js` 256 885 (T:18). Eigene Motion-Skripte `club/assets/celebration-motion.js` (57 Z.), `club/assets/club-motion.js` (59 Z.). Legacy lädt Google Fonts und Supabase vom CDN (backend.html:9–10).

### 6.9 Icon-Sprite (`<symbol>`, 24er-Raster)

Container `<svg style="display:none" aria-hidden="true">` (club:679, terminal:673, backend:656); Einbindung `<svg class="ic"><use href="#i-…"/></svg>`; Strichregel `.ic{width:18px; height:18px; flex-shrink:0; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round}` (mp:112); Größen 18 (Standard), 14 (`.member .rank .ic`, Akzent, mp:265), 16 (`.sidebar .ic`, muted, aktiv Akzent, mp:435–436); `.search .ic` muted (170), `.next > .ic` Akzent (308). Kein Sprite in club/recht, Wurzel-recht, backend.html, 404, wallet-vorschau. Gleiche IDs sind seitenübergreifend pfadgleich. Weiteres Inline-Icon: Select-Pfeil Data-URI 12×8 `M1 1l5 5 5-5`, `stroke='%23DFBE95' stroke-width='1.6'` (mp:164).

| id | Pfaddaten | Definiert | genutzt |
|---|---|---|---|
| i-scan | `M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10` | club:680, terminal:675 | club `#walletTop` (749), terminal Scan |
| i-sparkle | `M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z` | club:681, terminal:679, backend:667 | `.rank`, Sidebar |
| i-arrow | `M5 12h14M13 6l6 6-6 6` | club:682, terminal:677 | `.btn`/`.main-action` |
| i-arrow-up | `M7 17 17 7M8 7h9v9` | club:683 | `.featured-reward .bottom` (790) |
| i-gem | `M6 3h12l4 6-10 12L2 9zM2 9h20M9 3l3 6 3-6M8 9l4 12 4-12` | club:684 | `.next` (807) |
| i-wallet | `M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM16 3H6a2 2 0 0 0-2 2v2M16 14h4` | club:685 | **ungenutzt** (nachgeprüft: 1 Vorkommen = Definition) |
| i-x | `M18 6 6 18M6 6l12 12` | club:686 | **ungenutzt** (Bühne nutzt Glyph „×“, club:920) |
| i-check | `M20 6 9 17l-5-5` | club:687 | **ungenutzt** |
| i-search | `<circle cx="11" cy="11" r="7"/>` + `m20 20-3.5-3.5` | terminal:674 | Suche |
| i-gift | `<rect x="3" y="8" width="18" height="4" rx="1"/>` + `M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5` | terminal:676, backend:665 | Prämien |
| i-back | `M19 12H5M11 18l-6-6 6-6` | terminal:678 | „Start“ |
| i-plus | `M12 5v14M5 12h14` | terminal:680 | „Kundin anlegen“ |
| i-dash | 4× `rect rx=1`: (3,3,8,8) (13,3,8,5) (13,10,8,11) (3,13,8,8) | backend:657 | Sidebar |
| i-file | `M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h8` | backend:658 | Sidebar |
| i-users | `<circle cx="9" cy="8" r="4"/>` + `M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-5-6.7` | backend:659 | Sidebar |
| i-chart | `M3 3v18h18M7 15l4-4 3 3 6-6` | backend:660 | Sidebar |
| i-target | 3× circle cx12 cy12 r 9 / 5 / 1 | backend:661 | Sidebar |
| i-return | `M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3` | backend:662 | Sidebar |
| i-chat | `M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z` | backend:663 | Sidebar |
| i-move | `M5 12h14M13 6l6 6-6 6M3 4v16` | backend:664 | Sidebar |
| i-list | `M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01` | backend:666 | Sidebar |
| i-zap | `M13 2 3 14h9l-1 8 10-12h-9z` | backend:668 | Sidebar |
| i-calendar | `<rect x="3" y="4" width="18" height="17" rx="2"/>` + `M3 10h18M8 2v4M16 2v4` | backend:669 | Sidebar |
| i-clock | `<circle cx="12" cy="12" r="9"/>` + `M12 7v5l3 2` | backend:670 | Sidebar |
| i-mail | `<rect x="3" y="5" width="18" height="14" rx="2"/>` + `m3 7 9 6 9-6` | backend:671 | Sidebar |
| i-settings | `<circle cx="12" cy="12" r="3"/>` + Zahnrad-Pfad (vollständig in backend:672) | backend:672 | Sidebar |
| i-menu | `M4 7h16M4 12h16M4 17h16` | backend:673 | „Bereiche“ |
| i-download | `M12 3v12M7 10l5 5 5-5M4 21h16` | backend:674 | „Bericht“ |

Summe **28 eindeutige Icons** (club 8, terminal 7 davon 4 neu, backend 18 davon 16 neu). Am Quelltext nachgeprüft: `i-wallet`, `i-x` und `i-check` stehen nur als Definition (ungenutzt). Ein Einzel-SVG-Export der Icons in `#B49153` mit Kontaktbogen ist eine Arbeitsnotiz und liegt nicht im Repository.

---

## 7. Kontrast und Zugänglichkeit

Methode: WCAG-2.x-Leuchtdichte, rgba über den jeweiligen Grund komponiert, `filter:brightness(k)` als Kanal × k auf Text und Fläche; großer Text ≥ 24px oder ≥ 18.66px bei ≥ 700 (500/600 zählen als normal). CVD nach Machado 2009 (Schwere 1.0), Abstände als ΔE in OKLab (Heuristik, kein WCAG-Kriterium; ΔE_OK < 0.06 = „schwer unterscheidbar“). Laufzeitprüfung von 16 Zuständen bei 390/1280 px, Reflow bei 320 px, Forced-Colors-Emulation.

### 7.1 Bilanz

| Gruppe | bestanden | nicht bestanden | Info/ausgenommen |
|---|---|---|---|
| B1 Grundschrift/Text | 13 | 0 | 0 |
| B2 Gedämpft `#C6ABA8` | 16 | 0 | 0 |
| B3 Akzent `#DFBE95` | 10 | 0 | 1 |
| B4 Status ok/warn/danger | 13 | 0 | 0 |
| B5 Buttons | 6 | 0 | 1 |
| B6 Mitgliedskarte | 13 | 0 | 0 |
| B7 Feierbühne | 16 | 0 | 2 |
| B8 Felder/Platzhalter | 3 | 1 | 0 |
| B9 Kontrollränder (3:1) | 9 | 11 | 3 |
| B10 Fokusindikatoren | 12 | 1 | 1 |
| B11 Seitenrest Club (Consent) | 12 | 0 | 0 |
| B12 Heatmap/Glücksrad (JS-Farben) | 4 | 3 | 0 |
| B13 Druck | 5 | 0 | 1 |
| C1 Wurzel backend.html | 14 | 10 | 0 |
| C2 Wurzel recht.html | 2 | 7 | 1 |
| C3 404.html | 2 | 0 | 0 |
| C4 wallet-vorschau | 6 | 1 | 0 |
| **Summe (200 Paare)** | **156** | **34** | **10** |

MP-Seiten: 106 Textpaare (4 nicht bestanden: Platzhalter + 3 Heatmap-Bänder), 42 UI-Paare (12 nicht bestanden: Kontrollränder + 1 Fokus-Halo). Legacy: 33 Textpaare (10 nicht bestanden), 9 UI-Paare (8 nicht bestanden).

### 7.2 Token-Matrix dunkel (Text-Token × Grund)

| Text ↓ / Grund → | bg `#21191A` | surface `#302327` | card `#3C272C` | art `#4C3238` | member 0 % `#573A42` | member 55 % `#38242C` | member 100 % `#291C23` | reward Start `#3F2B30` | reward Ende `#2B2023` |
|---|---|---|---|---|---|---|---|---|---|
| text `#F6E9DF` | 14.47 | 12.64 | 11.61 | 9.69 | 8.44 | 12.11 | 13.73 | 11.03 | 13.23 |
| text-muted `#C6ABA8` | 8.04 | 7.02 | 6.45 | 5.38 | 4.69 | 6.72 | 7.62 | 6.12 | 7.34 |
| accent `#DFBE95` | 9.80 | 8.55 | 7.86 | 6.56 | 5.71 | 8.19 | 9.29 | 7.46 | 8.95 |
| ok `#A9C8AE` | 9.49 | 8.28 | 7.61 | 6.35 | 5.53 | 7.93 | 9.00 | 7.23 | 8.67 |
| warn `#E7C58A` | 10.46 | 9.14 | 8.40 | 7.00 | 6.10 | 8.75 | 9.93 | 7.97 | 9.56 |
| danger `#F0A5AD` | 8.77 | 7.66 | 7.04 | 5.87 | 5.12 | 7.34 | 8.32 | 6.68 | 8.02 |
| member-text `#FAE8DE` | 14.49 | 12.66 | 11.63 | 9.70 | 8.45 | 12.12 | 13.75 | 11.04 | 13.24 |
| member-muted `#D8B9B5` | 9.46 | 8.26 | 7.59 | 6.33 | 5.52 | 7.91 | 8.97 | 7.21 | 8.64 |
| Platzhalter `#8F7677` (mp:161) | **4.12** | **3.60** | **3.31** | **2.76** | **2.41** | **3.45** | **3.91** | **3.14** | **3.77** |

Button-Grund `#E0BE98`: `#2E211B` **8.88** (Hover 9.99, aktiv 8.09), `#21191A` 9.84, `#F6E9DF` 1.47 (nie hellen Text auf Champagner). Kommentar mp:39–40 („ok 8.9:1, warn 9.6:1, fehler 7.2:1“) ist veraltet: berechnet **9.49 / 10.46 / 8.77**.

**Bühne:**

| Bühnen-Token ↓ / Grund → | stage `#100D10` | Glow `#30202C` | `.mp-reward` Start `#2D2025` | Ende `#1A151A` | `.zu:hover` `#1E1C1E` |
|---|---|---|---|---|---|
| stage-text `#F5ECE6` | 16.58 | 13.17 | 13.40 | 15.46 | 14.53 |
| stage-muted `#BEADB7` | 9.06 | 7.20 | 7.32 | 8.45 | 7.94 |
| stage-gold `#D6B783` | 10.08 | 8.01 | 8.15 | 9.40 | 8.84 |
| stage-rose `#BC8F9F` | 6.96 | 5.53 | 5.63 | 6.49 | 6.10 |
| accent (Fokus) `#DFBE95` | 10.98 | 8.72 | 8.88 | 10.24 | 9.63 |

**Legacy hell (backend.html-Token × Grund):**

| Token ↓ / Grund → | cream `#FFFCF7` | pearl `#F6EFE3` | pearl2 `#EFE5D4` | rose `#F3E6DF` |
|---|---|---|---|---|
| ink `#3B2E1E` | 12.86 | 11.52 | 10.55 | 10.78 |
| soft `#6E5C44` | 6.26 | 5.61 | 5.13 | 5.25 |
| gold/plum `#B49153` | **2.88** | **2.58** | **2.36** | **2.42** |
| gold-deep/deep `#7C6029` | 5.76 | 5.16 | 4.72 | 4.83 |
| ok `#6B7F5E` | **4.25** | **3.81** | **3.49** | **3.57** |
| warn `#B3261E` | 6.39 | 5.72 | 5.24 | 5.35 |

Weitere Einzelwerte: Druck `#2A2024`/`#6B5A63`/`#8E7145`/`#3E6B48`/`#8E2E36` auf `#fff` 15.78 / 6.43 / 4.57 / 6.17 / 8.09; Logo-Gold `#B49153` auf `#21191A` 5.84; Logo-Perle `#EFDDD2` gegen `#FFFCF7` 1.29; Fokusring Legacy `#F3E6DF` gegen `#FFFCF7` 1.19 (gegen `#F6EFE3` 1.07).

### 7.3 Vollständige Paar-Tabelle (200 Paare)

„ok“ = bestanden, „ok (AAA)“ = auch AAA, **FAIL** = nicht bestanden, „Info“ = dekorativ/ausgenommen. Kriterium: „Text 4.5:1“, „groß 3:1“ (großer Text), „UI 3:1 (1.4.11)“ (Bedienelemente), „Info (ausgenommen)“. Die Kürzel in den Spalten Vordergrund und Grund (`bg`, `surface`, `mem0`, `rew1`, `A@B` = A komponiert über B) sind Rechennamen der Erhebung. Quelle `mp:N` = Zeile in `design/midnight-prive-fassung-3.css`.

**B1 Grundschrift/Text (mp-text)**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| body Fließtext | text `#F6E9DF` | bg `#21191A` | 16px/400 | 14.47 | Text 4.5:1 | ok (AAA) | mp:77 |
| Text in .card / .toast / .customer / .sidebar button | text `#F6E9DF` | surface `#302327` | 14px/400 | 12.64 | Text 4.5:1 | ok (AAA) | mp:177,206,368,432 |
| .toast 15px | text `#F6E9DF` | surface `#302327` | 15px/400 | 12.64 | Text 4.5:1 | ok (AAA) | mp:206-207 |
| .admin-bottom h2 (26px Cormorant 500) | text `#F6E9DF` | card `#3C272C` | 26px/500 | 11.61 | groß 3:1 | ok (AAA) | mp:92,457-458 |
| .featured-reward strong (21px Cormorant 500) | text `#F6E9DF` | rew0 `#3F2B30` | 21px/500 | 11.03 | Text 4.5:1 | ok (AAA) | mp:294,304 |
| .featured-reward strong (21px), Verlaufsende | text `#F6E9DF` | rew1 `#2B2023` | 21px/500 | 13.23 | Text 4.5:1 | ok (AAA) | mp:294,304 |
| .reward-copy .bottom 13px | text `#F6E9DF` | rew0 `#3F2B30` | 13px/400 | 11.03 | Text 4.5:1 | ok (AAA) | mp:306 |
| .door.auf .hinten 12px auf Prämienverlauf | text `#F6E9DF` | rew0 `#3F2B30` | 12px/400 | 11.03 | Text 4.5:1 | ok (AAA) | mp:344-345 |
| .sidebar button:hover | text `#F6E9DF` | sidebar_hover@surface `#281E20` | 14px/400 | 13.6 | Text 4.5:1 | ok (AAA) | mp:433 |
| .pad button (26px Cormorant) | text `#F6E9DF` | surface `#302327` | 26px/400 | 12.64 | groß 3:1 | ok (AAA) | mp:386 |
| .pad button:active | text `#F6E9DF` | pad_active@surface `#503F3B` | 26px/400 | 8.34 | groß 3:1 | ok (AAA) | mp:388 |
| .unklar Text 14px | text `#F6E9DF` | unklar@bg `#312723` | 14px/400 | 12.21 | Text 4.5:1 | ok (AAA) | mp:215-216 |
| .mp-admin-dialog Text | text `#F6E9DF` | surface `#302327` | 16px/400 | 12.64 | Text 4.5:1 | ok (AAA) | mp:616 |

**B2 Gedämpft (mp-text-muted #C6ABA8)**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| .eyebrow 12px versal .15em | muted `#C6ABA8` | bg `#21191A` | 12px/500 | 8.04 | Text 4.5:1 | ok (AAA) | mp:105 |
| .tiny/.small/.muted 13px auf bg | muted `#C6ABA8` | bg `#21191A` | 13px/400 | 8.04 | Text 4.5:1 | ok (AAA) | mp:106 |
| .small/.muted 13px auf surface (.card) | muted `#C6ABA8` | surface `#302327` | 13px/400 | 7.02 | Text 4.5:1 | ok (AAA) | mp:106,177 |
| label 14px 500 | muted `#C6ABA8` | bg `#21191A` | 14px/500 | 8.04 | Text 4.5:1 | ok (AAA) | mp:152 |
| label 14px in .card/.mp-admin-dialog | muted `#C6ABA8` | surface `#302327` | 14px/500 | 7.02 | Text 4.5:1 | ok (AAA) | mp:152,616 |
| table th 12px versal auf surface | muted `#C6ABA8` | surface `#302327` | 12px/500 | 7.02 | Text 4.5:1 | ok (AAA) | mp:188-189 |
| .legal 12px | muted `#C6ABA8` | bg `#21191A` | 12px/400 | 8.04 | Text 4.5:1 | ok (AAA) | mp:318 |
| .brandbar .logo span 10px | muted `#C6ABA8` | bg `#21191A` | 10px/400 | 8.04 | Text 4.5:1 | ok (AAA) | mp:227 |
| .reward-copy .detail 13px (Prämienverlauf Anfang) | muted `#C6ABA8` | rew0 `#3F2B30` | 13px/400 | 6.12 | Text 4.5:1 | ok | mp:305 |
| .reward-copy .detail 13px (Prämienverlauf Ende) | muted `#C6ABA8` | rew1 `#2B2023` | 13px/400 | 7.34 | Text 4.5:1 | ok (AAA) | mp:305 |
| muted auf mp-card (.admin-bottom .eyebrow) | muted `#C6ABA8` | card `#3C272C` | 12px/500 | 6.45 | Text 4.5:1 | ok | mp:105,457 |
| .metrics span/small 12px | muted `#C6ABA8` | bg `#21191A` | 12px/400 | 8.04 | Text 4.5:1 | ok (AAA) | mp:446,449 |
| .mp-kurz span 14px | muted `#C6ABA8` | mpkurz@surface `#423232` | 14px/400 | 5.65 | Text 4.5:1 | ok | mp:415-416,422 |
| .sidebar .ic 16px, Icon (UI) | muted `#C6ABA8` | surface `#302327` | 16px/400 | 7.02 | UI 3:1 (1.4.11) | ok | mp:435 |
| .search .ic, Icon (UI) | muted `#C6ABA8` | bg `#21191A` | 18px/400 | 8.04 | UI 3:1 (1.4.11) | ok | mp:170 |
| .sw-Knopf (aus) gegen Spur surface (UI) | muted `#C6ABA8` | surface `#302327` | 16px/400 | 7.02 | UI 3:1 (1.4.11) | ok | mp:328-329 |

**B3 Akzent (mp-accent #DFBE95)**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| a / .linkbtn 14px | accent `#DFBE95` | bg `#21191A` | 14px/400 | 9.8 | Text 4.5:1 | ok (AAA) | mp:98,145 |
| a in .card / .hinweis | accent `#DFBE95` | surface `#302327` | 14px/400 | 8.55 | Text 4.5:1 | ok (AAA) | mp:98,182 |
| .terminal-reward 13px | accent `#DFBE95` | surface `#302327` | 13px/400 | 8.55 | Text 4.5:1 | ok (AAA) | mp:375 |
| .reward-copy .ready 12px (Verlaufsanfang) | accent `#DFBE95` | rew0 `#3F2B30` | 12px/400 | 7.46 | Text 4.5:1 | ok (AAA) | mp:303 |
| .reward-copy .ready 12px (Verlaufsende) | accent `#DFBE95` | rew1 `#2B2023` | 12px/400 | 8.95 | Text 4.5:1 | ok (AAA) | mp:303 |
| .pill (Akzent) 13px 500 auf surface | accent `#DFBE95` | pill_accent@surface `#483936` | 13px/500 | 6.24 | Text 4.5:1 | ok | mp:197 |
| .sidebar [aria-current] 14px | accent `#DFBE95` | bg `#21191A` | 14px/400 | 9.8 | Text 4.5:1 | ok (AAA) | mp:434 |
| .mp-kurz b | accent `#DFBE95` | mpkurz@surface `#423232` | 16px/500 | 6.88 | Text 4.5:1 | ok | mp:421 |
| .member .rank .ic, Icon auf Mitgliedskarten-Verlauf (UI) | accent `#DFBE95` | mem0 `#573A42` | 14px/400 | 5.71 | UI 3:1 (1.4.11) | ok | mp:265 |
| .member .rank .ic, Icon (Stopp 55 %) | accent `#DFBE95` | mem55 `#38242C` | 14px/400 | 8.19 | UI 3:1 (1.4.11) | ok | mp:265 |
| Link-Unterstreichung rgba(223,190,149,.45) auf bg (UI) | `rgba(223,190,149,.45)` | bg `#21191A` | 16px/400 | 3.03 | Info (ausgenommen) | Info | mp:98 |

**B4 Status (ok/warn/danger)**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| .pill.ok 13px | ok `#A9C8AE` | pill_ok@surface `#433D3D` | 13px/500 | 5.86 | Text 4.5:1 | ok | mp:198 |
| .pill.warn 13px | warn `#E7C58A` | pill_warn@surface `#4D3D37` | 13px/500 | 6.26 | Text 4.5:1 | ok | mp:199 |
| .pill.fehler 13px | danger `#F0A5AD` | pill_danger@surface `#4F383C` | 13px/500 | 5.44 | Text 4.5:1 | ok | mp:200 |
| .bdelta.plus (ok) in .card | ok `#A9C8AE` | surface `#302327` | 13px/400 | 8.28 | Text 4.5:1 | ok (AAA) | mp:472 |
| .bdelta.minus (danger) in .card | danger `#F0A5AD` | surface `#302327` | 13px/400 | 7.66 | Text 4.5:1 | ok (AAA) | mp:472 |
| .list .item.gewinn .p 13px versal | ok `#A9C8AE` | bg `#21191A` | 13px/400 | 9.49 | Text 4.5:1 | ok (AAA) | mp:400 |
| .toast.err 15px | danger `#F0A5AD` | surface `#302327` | 15px/400 | 7.66 | Text 4.5:1 | ok (AAA) | mp:212 |
| .toast.ok::before ✓ | ok `#A9C8AE` | surface `#302327` | 15px/400 | 8.28 | Text 4.5:1 | ok (AAA) | mp:214 |
| .btn.gefahr Text 16px 500 (transparent auf bg) | danger `#F0A5AD` | bg `#21191A` | 16px/500 | 8.77 | Text 4.5:1 | ok (AAA) | mp:136 |
| .unklar::before ⚠ 18px | warn `#E7C58A` | unklar@bg `#312723` | 18px/400 | 8.82 | Text 4.5:1 | ok (AAA) | mp:217 |
| warn als Inline-Stil in td (backend/index.html:1796) | warn `#E7C58A` | surface `#302327` | 14px/400 | 9.14 | Text 4.5:1 | ok (AAA) | backend/index.html:1796 |
| .tbd (Seitenrest club/recht.html) auf surface | warn `#E7C58A` | tbd@surface `#514039` | 16px/400 | 5.95 | Text 4.5:1 | ok | club/recht.html:645 |
| .tbd auf bg | warn `#E7C58A` | tbd@bg `#45382E` | 16px/400 | 6.86 | Text 4.5:1 | ok | club/recht.html:645 |

**B5 Buttons**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| .btn primär 16px 500 | btntext `#2E211B` | btnbg `#E0BE98` | 16px/500 | 8.88 | Text 4.5:1 | ok (AAA) | mp:116-120 |
| .btn:hover brightness(1.08), Text mitgefiltert | `#32241D` | btnbg_hover `#F2CDA4` | 16px/500 | 9.99 | Text 4.5:1 | ok (AAA) | mp:126 |
| .btn:active brightness(.94) | `#2B1F19` | btnbg_active `#D3B38F` | 16px/500 | 8.09 | Text 4.5:1 | ok (AAA) | mp:127 |
| .btn.ghost/.secondary 14px (Text auf bg) | text `#F6E9DF` | bg `#21191A` | 14px/400 | 14.47 | Text 4.5:1 | ok (AAA) | mp:130-132 |
| .btn.ghost in .customer (auf surface) | text `#F6E9DF` | bg `#21191A` | 14px/400 | 14.47 | Text 4.5:1 | ok (AAA) | mp:376 |
| .nps .an / .categories [aria-pressed] 14px | btntext `#2E211B` | btnbg `#E0BE98` | 14px/400 | 8.88 | Text 4.5:1 | ok (AAA) | mp:337,391 |
| .btn:disabled Deckkraft .45 (Text) | `#56453A` | btnbg@.45 over bg `#776353` | 16px/500 | 1.6 | Info (ausgenommen) | Info | mp:137-138 |

**B6 Mitgliedskarte (Verlauf member)**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| .balance 66px Cormorant (mem0) | memtext `#FAE8DE` | mem0 `#573A42` | 66px/400 | 8.45 | groß 3:1 | ok (AAA) | mp:254,266 |
| .member .rank 12px versal (mem0) | memtext `#FAE8DE` | mem0 `#573A42` | 12px/400 | 8.45 | Text 4.5:1 | ok (AAA) | mp:201,264 |
| .head .eyebrow / .foot 12px member-muted (mem0) | memmuted `#D8B9B5` | mem0 `#573A42` | 12px/500 | 5.52 | Text 4.5:1 | ok | mp:263,287 |
| .balance > .sub 13px member-muted (mem0) | memmuted `#D8B9B5` | mem0 `#573A42` | 13px/400 | 5.52 | Text 4.5:1 | ok | mp:269 |
| .balance 66px Cormorant (mem55) | memtext `#FAE8DE` | mem55 `#38242C` | 66px/400 | 12.12 | groß 3:1 | ok (AAA) | mp:254,266 |
| .member .rank 12px versal (mem55) | memtext `#FAE8DE` | mem55 `#38242C` | 12px/400 | 12.12 | Text 4.5:1 | ok (AAA) | mp:201,264 |
| .head .eyebrow / .foot 12px member-muted (mem55) | memmuted `#D8B9B5` | mem55 `#38242C` | 12px/500 | 7.91 | Text 4.5:1 | ok (AAA) | mp:263,287 |
| .balance > .sub 13px member-muted (mem55) | memmuted `#D8B9B5` | mem55 `#38242C` | 13px/400 | 7.91 | Text 4.5:1 | ok (AAA) | mp:269 |
| .balance 66px Cormorant (mem100) | memtext `#FAE8DE` | mem100 `#291C23` | 66px/400 | 13.75 | groß 3:1 | ok (AAA) | mp:254,266 |
| .member .rank 12px versal (mem100) | memtext `#FAE8DE` | mem100 `#291C23` | 12px/400 | 13.75 | Text 4.5:1 | ok (AAA) | mp:201,264 |
| .head .eyebrow / .foot 12px member-muted (mem100) | memmuted `#D8B9B5` | mem100 `#291C23` | 12px/500 | 8.97 | Text 4.5:1 | ok (AAA) | mp:263,287 |
| .balance > .sub 13px member-muted (mem100) | memmuted `#D8B9B5` | mem100 `#291C23` | 13px/400 | 8.97 | Text 4.5:1 | ok (AAA) | mp:269 |
| .card-dark / .admin-bottom Text | memtext `#FAE8DE` | card `#3C272C` | 16px/400 | 11.63 | Text 4.5:1 | ok (AAA) | mp:181,457 |

**B7 Feierbühne (stage)**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| .buehne Text / h2 32–46px | stext `#F5ECE6` | stage `#100D10` | 32px/400 | 16.58 | groß 3:1 | ok (AAA) | mp:478,496 |
| .buehne h2 über Bühnenlicht #30202C | stext `#F5ECE6` | stage_glow `#30202C` | 32px/400 | 13.17 | groß 3:1 | ok (AAA) | mp:480,496 |
| .mp-feier .mp-detail 16px muted | smuted `#BEADB7` | stage `#100D10` | 16px/400 | 9.06 | Text 4.5:1 | ok (AAA) | mp:497 |
| .mp-feier.mp-inline .mp-detail 14px | smuted `#BEADB7` | stage `#100D10` | 14px/400 | 9.06 | Text 4.5:1 | ok (AAA) | mp:531 |
| .mp-detail über Bühnenlicht | smuted `#BEADB7` | stage_glow `#30202C` | 16px/400 | 7.2 | Text 4.5:1 | ok (AAA) | mp:480,497 |
| .mp-eyebrow 12px versal .22em Gold | sgold `#D6B783` | stage `#100D10` | 12px/400 | 10.08 | Text 4.5:1 | ok (AAA) | mp:495 |
| .mp-eyebrow über Bühnenlicht | sgold `#D6B783` | stage_glow `#30202C` | 12px/400 | 8.01 | Text 4.5:1 | ok (AAA) | mp:480,495 |
| .mp-mark 17px Gold (Prämie Anfang) | sgold `#D6B783` | mpreward0 `#2D2025` | 17px/400 | 8.15 | Text 4.5:1 | ok (AAA) | mp:499-500 |
| .mp-reward-note 13px muted (Prämie Anfang) | smuted `#BEADB7` | mpreward0 `#2D2025` | 13px/400 | 7.32 | Text 4.5:1 | ok (AAA) | mp:501 |
| .mp-reward ul 14px Text (Prämie Anfang) | stext `#F5ECE6` | mpreward0 `#2D2025` | 14px/400 | 13.4 | Text 4.5:1 | ok (AAA) | mp:502 |
| li.titel 12px versal muted | smuted `#BEADB7` | mpreward0 `#2D2025` | 12px/400 | 7.32 | Text 4.5:1 | ok (AAA) | mp:535 |
| .mp-feier .zu × 26px muted | smuted `#BEADB7` | stage `#100D10` | 26px/400 | 9.06 | groß 3:1 | ok (AAA) | mp:481 |
| .zu:hover | stext `#F5ECE6` | zu_hover@stage `#1E1C1E` | 26px/400 | 14.53 | groß 3:1 | ok (AAA) | mp:482 |
| .mp-feier .btn (Bühnentext #100D10 auf Gold) | stage `#100D10` | sgold `#D6B783` | 16px/500 | 10.08 | Text 4.5:1 | ok (AAA) | mp:504 |
| .mp-feier .btn.ghost Text | stext `#F5ECE6` | stage `#100D10` | 16px/500 | 16.58 | Text 4.5:1 | ok (AAA) | mp:505 |
| .mp-feier .btn.ghost Rand #8D7785 (UI) | `#8D7785` | stage `#100D10` | 16px/400 | 4.7 | UI 3:1 (1.4.11) | ok | mp:505 |
| .mp-arc Ring stage-rose (Deko) | srose `#BC8F9F` | stage `#100D10` | 16px/400 | 6.96 | Info (ausgenommen) | Info | mp:490 |
| .buehne Rand #493A45 (Deko) | `#493A45` | stage `#100D10` | 16px/400 | 1.82 | Info (ausgenommen) | Info | mp:479 |

**B8 Felder und Platzhalter**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| input Text 16px auf mp-bg | text `#F6E9DF` | bg `#21191A` | 16px/400 | 14.47 | Text 4.5:1 | ok (AAA) | mp:155-156 |
| Platzhalter #8F7677 (mp:161 überschreibt mp:86) | Platzhalter `#8F7677` | bg `#21191A` | 16px/400 | 4.12 | Text 4.5:1 | **FAIL** | mp:161 |
| Platzhalter, falls mp:86 wirkt (muted) | muted `#C6ABA8` | bg `#21191A` | 16px/400 | 8.04 | Text 4.5:1 | ok (AAA) | mp:86 |
| .filter input 15px Text | text `#F6E9DF` | bg `#21191A` | 15px/400 | 14.47 | Text 4.5:1 | ok (AAA) | mp:465 |

**B9 Kontrollränder (mp-line #5A4242, UI 3:1)**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| Feldrand gegen Feldfläche (bg) | line `#5A4242` | bg `#21191A` | 16px/400 | 1.88 | UI 3:1 (1.4.11) | **FAIL** | mp:156 |
| Feldrand gegen umgebende .card-Fläche | line `#5A4242` | surface `#302327` | 16px/400 | 1.64 | UI 3:1 (1.4.11) | **FAIL** | mp:156,177 |
| Feldfläche (bg) gegen .card-Fläche (Flächenkante) | bg `#21191A` | surface `#302327` | 16px/400 | 1.15 | UI 3:1 (1.4.11) | **FAIL** | mp:156,177 |
| Feldrand gegen mp-card | line `#5A4242` | card `#3C272C` | 16px/400 | 1.51 | UI 3:1 (1.4.11) | **FAIL** | mp:156,181 |
| .btn.ghost/.secondary/.nps/.categories/.list .item, Rand auf bg | line `#5A4242` | bg `#21191A` | 16px/400 | 1.88 | UI 3:1 (1.4.11) | **FAIL** | mp:131,336,390,395 |
| .icon-button / .pad / .door, Rand auf surface | line `#5A4242` | surface `#302327` | 16px/400 | 1.64 | UI 3:1 (1.4.11) | **FAIL** | mp:148,386,343 |
| .sw Spurrand gegen bg | line `#5A4242` | bg `#21191A` | 16px/400 | 1.88 | UI 3:1 (1.4.11) | **FAIL** | mp:328 |
| .sw Spurfläche surface gegen bg | surface `#302327` | bg `#21191A` | 16px/400 | 1.15 | UI 3:1 (1.4.11) | **FAIL** | mp:328 |
| .sw an: Fläche button-bg gegen bg | btnbg `#E0BE98` | bg `#21191A` | 16px/400 | 9.84 | UI 3:1 (1.4.11) | ok | mp:330 |
| .sw an: Knopf #2E211B gegen Fläche | btntext `#2E211B` | btnbg `#E0BE98` | 16px/400 | 8.88 | UI 3:1 (1.4.11) | ok | mp:331 |
| .sterne button (aus), Zeichen #5A4242 auf bg 30px | line `#5A4242` | bg `#21191A` | 16px/400 | 1.88 | UI 3:1 (1.4.11) | **FAIL** | mp:333 |
| .sterne .an, Zeichen accent auf bg | accent `#DFBE95` | bg `#21191A` | 16px/400 | 9.8 | UI 3:1 (1.4.11) | ok | mp:334 |
| .btn.gefahr Rand rgba(240,165,173,.45) auf bg | `rgba(240,165,173,.45)` | bg `#21191A` | 16px/400 | 2.82 | UI 3:1 (1.4.11) | **FAIL** | mp:136 |
| .track Füllung accent gegen Spur surface (3px) | accent `#DFBE95` | surface `#302327` | 16px/400 | 8.55 | UI 3:1 (1.4.11) | ok | mp:313-314 |
| .track (surface) gegen Seitengrund bg | surface `#302327` | bg `#21191A` | 16px/400 | 1.15 | UI 3:1 (1.4.11) | **FAIL** | mp:313 |
| .list .item.erreichbar, Rand accent auf bg | accent `#DFBE95` | bg `#21191A` | 16px/400 | 9.8 | UI 3:1 (1.4.11) | ok | mp:399 |
| .list .item.gewinn, Rand ok auf bg | ok `#A9C8AE` | bg `#21191A` | 16px/400 | 9.49 | UI 3:1 (1.4.11) | ok | mp:400 |
| .hinweis, linker Rand accent gegen surface | accent `#DFBE95` | surface `#302327` | 16px/400 | 8.55 | UI 3:1 (1.4.11) | ok | mp:182 |
| .hinweis.fehler, linker Rand danger gegen surface | danger `#F0A5AD` | surface `#302327` | 16px/400 | 7.66 | UI 3:1 (1.4.11) | ok | mp:183 |
| .needle accent auf Radkarte (surface) | accent `#DFBE95` | surface `#302327` | 16px/400 | 8.55 | UI 3:1 (1.4.11) | ok | mp:410 |
| .card gegen Seitengrund bg (Flächenkante, Rand transparent) | surface `#302327` | bg `#21191A` | 16px/400 | 1.15 | Info (ausgenommen) | Info | mp:177 |
| .brandbar Rand #6C4C483F (Deko) | `#6C4C483F` | bg `#21191A` | 16px/400 | 1.18 | Info (ausgenommen) | Info | mp:222 |
| table td Rand rgba(90,66,66,.55) auf surface (Deko) | `rgba(90,66,66,.55)` | surface `#302327` | 16px/400 | 1.3 | Info (ausgenommen) | Info | mp:190 |

**B10 Fokusindikatoren**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| Outline 2px accent, Versatz 3px, auf bg | accent `#DFBE95` | bg `#21191A` | 16px/400 | 9.8 | UI 3:1 (1.4.11) | ok | mp:568-569 |
| Outline 2px accent, Versatz 3px, auf surface | accent `#DFBE95` | surface `#302327` | 16px/400 | 8.55 | UI 3:1 (1.4.11) | ok | mp:568-569 |
| Outline 2px accent, Versatz 3px, auf card | accent `#DFBE95` | card `#3C272C` | 16px/400 | 7.86 | UI 3:1 (1.4.11) | ok | mp:568-569 |
| Outline 2px accent, Versatz 3px, auf art | accent `#DFBE95` | art `#4C3238` | 16px/400 | 6.56 | UI 3:1 (1.4.11) | ok | mp:568-569 |
| Outline 2px accent, Versatz 3px, auf mem0 | accent `#DFBE95` | mem0 `#573A42` | 16px/400 | 5.71 | UI 3:1 (1.4.11) | ok | mp:568-569 |
| Outline 2px accent, Versatz 3px, auf mem55 | accent `#DFBE95` | mem55 `#38242C` | 16px/400 | 8.19 | UI 3:1 (1.4.11) | ok | mp:568-569 |
| Outline 2px accent, Versatz 3px, auf mem100 | accent `#DFBE95` | mem100 `#291C23` | 16px/400 | 9.29 | UI 3:1 (1.4.11) | ok | mp:568-569 |
| Outline 2px accent, Versatz 3px, auf rew0 | accent `#DFBE95` | rew0 `#3F2B30` | 16px/400 | 7.46 | UI 3:1 (1.4.11) | ok | mp:568-569 |
| Outline 2px accent, Versatz 3px, auf rew1 | accent `#DFBE95` | rew1 `#2B2023` | 16px/400 | 8.95 | UI 3:1 (1.4.11) | ok | mp:568-569 |
| Outline 2px accent, Versatz 3px, auf stage | accent `#DFBE95` | stage `#100D10` | 16px/400 | 10.98 | UI 3:1 (1.4.11) | ok | mp:568-569 |
| Outline 2px accent, Versatz 3px, auf btnbg | accent `#DFBE95` | btnbg `#E0BE98` | 16px/400 | 1.0 | Info (ausgenommen) | Info | mp:568-569 |
| input:focus Rand accent gegen Fläche bg | accent `#DFBE95` | bg `#21191A` | 16px/400 | 9.8 | UI 3:1 (1.4.11) | ok | mp:162 |
| input:focus Halo rgba(223,190,149,.22) 3px gegen bg | focus_halo@bg `#4B3D35` | bg `#21191A` | 16px/400 | 1.66 | UI 3:1 (1.4.11) | **FAIL** | mp:162,173 |
| .consent-card:focus-within 3px #f5ddbc auf bg | `#f5ddbc` | bg `#21191A` | 16px/400 | 13.09 | UI 3:1 (1.4.11) | ok | club/index.html:658 |

**B11 Seitenrest Club (Einwilligung, hartkodiert)**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| .consent-card Text #f7eee7 auf #2b2224 | `#f7eee7` | `#2b2224` | 16px/400 | 13.51 | Text 4.5:1 | ok (AAA) | club/index.html:654 |
| .consent-card angehakt, Text auf #49382d | `#f7eee7` | `#49382d` | 16px/400 | 9.72 | Text 4.5:1 | ok (AAA) | club/index.html:656 |
| .consent-state 13px 600 #d7c5bd auf #2b2224 | `#d7c5bd` | `#2b2224` | 13px/600 | 9.29 | Text 4.5:1 | ok (AAA) | club/index.html:660 |
| .consent-state ✓ #ffe3b8 auf #49382d | `#ffe3b8` | `#49382d` | 13px/600 | 8.97 | Text 4.5:1 | ok (AAA) | club/index.html:662 |
| .consent-card a #f5ddbc auf #2b2224 | `#f5ddbc` | `#2b2224` | 16px/400 | 11.75 | Text 4.5:1 | ok (AAA) | club/index.html:659 |
| .consent-card Rand 2px #927875 gegen bg | `#927875` | bg `#21191A` | 16px/400 | 4.24 | UI 3:1 (1.4.11) | ok | club/index.html:654 |
| .consent-card Rand #927875 gegen eigene Fläche #2b2224 | `#927875` | `#2b2224` | 16px/400 | 3.81 | UI 3:1 (1.4.11) | ok | club/index.html:654 |
| angehakt: Rand #dfbe95 gegen bg | `#dfbe95` | bg `#21191A` | 16px/400 | 9.8 | UI 3:1 (1.4.11) | ok | club/index.html:656 |
| #rechtAnnehmen:disabled #21191a auf #dfbe95 | `#21191a` | `#dfbe95` | 16px/500 | 9.8 | Text 4.5:1 | ok (AAA) | club/index.html:667 |
| #rechtAnnehmen[aria-busy] #ffe3b8 auf #49382d | `#ffe3b8` | `#49382d` | 16px/500 | 8.97 | Text 4.5:1 | ok (AAA) | club/index.html:668 |
| #rechtStatus #ffe3b8 600 auf #302820 | `#ffe3b8` | `#302820` | 16px/600 | 11.68 | Text 4.5:1 | ok (AAA) | club/index.html:664,669 |
| #rechtStatus auf bg | `#ffe3b8` | bg `#21191A` | 16px/600 | 13.89 | Text 4.5:1 | ok (AAA) | club/index.html:669 |

**B12 Backend-Heatmap / Terminal-Rad (JS-Farben)**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| Heatmap-Zelle a ≤ .55, muted 12px auf Alpha .495 | muted `#C6ABA8` | heat_49.5@surface `#87705D` | 12px/400 | 2.17 | Text 4.5:1 | **FAIL** | backend/index.html:1423-1425 |
| Heatmap-Zelle a > .55, #2E211B 12px auf Alpha .4955 | btntext `#2E211B` | heat_49.6@surface `#87705E` | 12px/400 | 3.34 | Text 4.5:1 | **FAIL** | backend/index.html:1423-1425 |
| Heatmap-Zelle Maximum, #2E211B auf Alpha .90 | btntext `#2E211B` | heat_90@surface `#CEAE8A` | 12px/400 | 7.44 | Text 4.5:1 | ok (AAA) | backend/index.html:1423-1425 |
| Heatmap-Zelle niedrig, muted auf Alpha .20 | muted `#C6ABA8` | heat_20@surface `#53423D` | 12px/400 | 4.42 | Text 4.5:1 | **FAIL** | backend/index.html:1423-1425 |
| Radbeschriftung #5A4242 22px auf #F6E9DF | `#5A4242` | `#F6E9DF` | 22px/400 | 7.69 | Text 4.5:1 | ok (AAA) | terminal/index.html:1571-1573 |
| Radbeschriftung #DFBE95 22px auf #3F2B30 | `#DFBE95` | `#3F2B30` | 22px/400 | 7.46 | Text 4.5:1 | ok (AAA) | terminal/index.html:1571-1573 |
| Radnabe „La Perlé“ #DFBE95 24px 600 auf #302327 | `#DFBE95` | `#302327` | 24px/600 | 8.55 | groß 3:1 | ok (AAA) | terminal/index.html:1575-1577 |

**B13 Druck (V34, hell)**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| Druck: Text #2A2024 auf #fff | `#2A2024` | `#FFFFFF` | 16px/400 | 15.78 | Text 4.5:1 | ok (AAA) | mp:553-554 |
| Druck: gedämpft #6B5A63 auf #fff | `#6B5A63` | `#FFFFFF` | 12px/400 | 6.43 | Text 4.5:1 | ok | mp:554,557 |
| Druck: Akzent #8E7145 auf #fff | `#8E7145` | `#FFFFFF` | 14px/400 | 4.57 | Text 4.5:1 | ok | mp:555 |
| Druck: .bdelta.plus #3E6B48 (grün) auf #fff | `#3E6B48` | `#FFFFFF` | 13px/400 | 6.17 | Text 4.5:1 | ok | mp:560 |
| Druck: .bdelta.minus #8E2E36 auf #fff | `#8E2E36` | `#FFFFFF` | 13px/400 | 8.09 | Text 4.5:1 | ok (AAA) | mp:560 |
| Druck: Linie #D9CFD4 auf #fff (Deko-Rand) | `#D9CFD4` | `#FFFFFF` | 16px/400 | 1.52 | Info (ausgenommen) | Info | mp:554,556 |

**C1 Wurzel backend.html (hell)**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| body ink 300 auf pearl | `#3B2E1E` | `#F6EFE3` | 16px/300 | 11.52 | Text 4.5:1 | ok (AAA) | backend.html:19,29-30 |
| .muted soft 13px auf cream (.card) | `#6E5C44` | `#FFFCF7` | 13px/300 | 6.26 | Text 4.5:1 | ok | backend.html:19,79 |
| .kpi .l soft 11.5px versal .16em | `#6E5C44` | `#FFFCF7` | 11.5px/300 | 6.26 | Text 4.5:1 | ok | backend.html:72 |
| th soft 11px versal .14em | `#6E5C44` | `#FFFCF7` | 11px/500 | 6.26 | Text 4.5:1 | ok | backend.html:75 |
| .tabs button soft 14px auf pearl | `#6E5C44` | `#F6EFE3` | 14px/300 | 5.61 | Text 4.5:1 | ok | backend.html:66-67 |
| .tabs [aria-pressed] #FFF9F4 auf plum #B49153 | `#FFF9F4` | `#B49153` | 14px/300 | 2.83 | Text 4.5:1 | **FAIL** | backend.html:68 |
| .kpi .n plum #B49153 42px 600 auf cream | `#B49153` | `#FFFCF7` | 42px/600 | 2.88 | groß 3:1 | **FAIL** | backend.html:71 |
| .kicker gold-deep kursiv 1.1rem (17.6px) | `#7C6029` | `#FFFCF7` | 17.6px/500 | 5.76 | Text 4.5:1 | ok | backend.html:12-13 |
| .btn.ghost gold-deep 16px 500 auf pearl | `#7C6029` | `#F6EFE3` | 16px/500 | 5.16 | Text 4.5:1 | ok | backend.html:60 |
| .btn Text cream auf Verlaufsanfang #B49153 | `#FFFCF7` | `#B49153` | 16px/500 | 2.88 | Text 4.5:1 | **FAIL** | backend.html:59 |
| .btn Text cream auf Verlaufsende #7C6029 | `#FFFCF7` | `#7C6029` | 16px/500 | 5.76 | Text 4.5:1 | ok | backend.html:59 |
| .pill deep #7C6029 12px auf rose #F3E6DF | `#7C6029` | `#F3E6DF` | 12px/300 | 4.83 | Text 4.5:1 | ok | backend.html:86 |
| .toast #FFF9F4 auf ink | `#FFF9F4` | `#3B2E1E` | 14.5px/300 | 12.6 | Text 4.5:1 | ok (AAA) | backend.html:87-88 |
| .toast.err #FFF9F4 auf warn #B3261E | `#FFF9F4` | `#B3261E` | 14.5px/300 | 6.26 | Text 4.5:1 | ok | backend.html:90 |
| .bdelta.plus ok #6B7F5E (olivgrün) auf cream | `#6B7F5E` | `#FFFCF7` | 13px/300 | 4.25 | Text 4.5:1 | **FAIL** | backend.html:109 |
| .bdelta.minus warn #B3261E auf cream | `#B3261E` | `#FFFCF7` | 13px/300 | 6.39 | Text 4.5:1 | ok | backend.html:109 |
| tr:hover ink auf rose | `#3B2E1E` | `#F3E6DF` | 13.5px/300 | 10.78 | Text 4.5:1 | ok (AAA) | backend.html:48 |
| body oben, radialer Weißverlauf .75 über pearl: soft | `#6E5C44` | pearl+white.75 `#FDFBF8` | 14px/300 | 6.2 | Text 4.5:1 | ok | backend.html:30 |
| Feldrand rgba(180,145,83,.28) gegen Fläche cream | `#EADEC9` | `#FFFCF7` | 16px/400 | 1.3 | UI 3:1 (1.4.11) | **FAIL** | backend.html:21,50-51 |
| Feldrand gegen Seite pearl | `#E4D5BB` | `#F6EFE3` | 16px/400 | 1.26 | UI 3:1 (1.4.11) | **FAIL** | backend.html:21,50-51 |
| Feldfläche cream gegen Seite pearl (Flächenkante) | `#FFFCF7` | `#F6EFE3` | 16px/400 | 1.12 | UI 3:1 (1.4.11) | **FAIL** | backend.html:50 |
| Fokus: Rand plum #B49153 gegen cream | `#B49153` | `#FFFCF7` | 16px/400 | 2.88 | UI 3:1 (1.4.11) | **FAIL** | backend.html:52 |
| Fokus: Halo 4px rose #F3E6DF gegen pearl | `#F3E6DF` | `#F6EFE3` | 16px/400 | 1.07 | UI 3:1 (1.4.11) | **FAIL** | backend.html:52 |
| .tabs button, Rand line gegen pearl | `#E4D5BB` | `#F6EFE3` | 16px/400 | 1.26 | UI 3:1 (1.4.11) | **FAIL** | backend.html:21,66 |

**C2 Wurzel recht.html (hell, eigene Palette)**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| body ink 300 auf pearl | `#2C2420` | `#F4ECE4` | 15px/300 | 13.02 | Text 4.5:1 | ok (AAA) | recht.html:11-14,21 |
| .muted soft 13.5px auf pearl | `#8C7A70` | `#F4ECE4` | 13.5px/300 | 3.5 | Text 4.5:1 | **FAIL** | recht.html:24 |
| .brand soft 12px .26em | `#8C7A70` | `#F4ECE4` | 12px/400 | 3.5 | Text 4.5:1 | **FAIL** | recht.html:23 |
| th soft 11px versal .12em | `#8C7A70` | `#F4ECE4` | 11px/400 | 3.5 | Text 4.5:1 | **FAIL** | recht.html:31-32 |
| a deep #A3705A auf pearl | `#A3705A` | `#F4ECE4` | 15px/300 | 3.58 | Text 4.5:1 | **FAIL** | recht.html:34 |
| .nav a deep 13.5px auf cream | `#A3705A` | `#FBF7F2` | 13.5px/300 | 3.92 | Text 4.5:1 | **FAIL** | recht.html:26-27 |
| .tbd deep 14px auf rose | `#A3705A` | `#EFDDD1` | 14px/300 | 3.17 | Text 4.5:1 | **FAIL** | recht.html:29 |
| ink auf .box cream | `#2C2420` | `#FBF7F2` | 15px/300 | 14.26 | Text 4.5:1 | ok (AAA) | recht.html:28 |
| .nav a, Rand line gegen pearl (UI) | `#E3D6CA` | `#F4ECE4` | 16px/400 | 1.22 | UI 3:1 (1.4.11) | **FAIL** | recht.html:26-27 |
| h2::after Strich plum (Deko) | `#B98570` | `#F4ECE4` | 16px/400 | 2.7 | Info (ausgenommen) | Info | recht.html:19 |

**C3 404.html**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| ink #3B2E1E 300 auf #FFFCF7 | `#3B2E1E` | `#FFFCF7` | 16px/300 | 12.86 | Text 4.5:1 | ok (AAA) | 404.html:6-7 |
| a #7C6029 auf #FFFCF7 | `#7C6029` | `#FFFCF7` | 16px/300 | 5.76 | Text 4.5:1 | ok | 404.html:9 |

**C4 wallet-vorschau/index.html**

| Bauteil/Regel | Vordergrund | Grund | Größe/Gew. | Verhältnis | Kriterium | Ergebnis | Quelle |
|---|---|---|---|---|---|---|---|
| body #f6f0e7 auf #191616 | `#f6f0e7` | `#191616` | 16px/400 | 15.87 | Text 4.5:1 | ok (AAA) | wallet-vorschau/index.html:7 |
| header p #c3b2a4 12px .17em | `#c3b2a4` | `#191616` | 12px/400 | 8.76 | Text 4.5:1 | ok (AAA) | wallet-vorschau/index.html:7 |
| .switch button #dfd0c1 auf #191616 | `#dfd0c1` | `#191616` | 16px/400 | 11.93 | Text 4.5:1 | ok (AAA) | wallet-vorschau/index.html:7 |
| .switch gedrückt #201b18 auf #e3cfb4 | `#201b18` | `#e3cfb4` | 16px/400 | 11.25 | Text 4.5:1 | ok (AAA) | wallet-vorschau/index.html:7 |
| .switch Rand #6d5c50 gegen #191616 (UI) | `#6d5c50` | `#191616` | 16px/400 | 2.82 | UI 3:1 (1.4.11) | **FAIL** | wallet-vorschau/index.html:7 |
| Fokus 3px weiß gegen #191616 | `#FFFFFF` | `#191616` | 16px/400 | 17.98 | UI 3:1 (1.4.11) | ok | wallet-vorschau/index.html:7 |
| .qr Platzhalter #626262 11px auf #fff | `#626262` | `#FFFFFF` | 11px/400 | 6.1 | Text 4.5:1 | ok | wallet-vorschau/index.html:7 |

### 7.4 Fokus

| Bauteil | Regel | Indikator | gemessen |
|---|---|---|---|
| `a, button, input, select, textarea, [tabindex]` | mp:568–569 | `outline:2px solid var(--mp-accent)` (`#DFBE95`), `outline-offset:3px` | 9.80 bg · 8.55 surface · 7.86 card · 6.56 art · 5.71–9.29 member · 7.46–8.95 reward · 10.98 stage |
| `.pearl` | mp:570 | dasselbe, Versatz `-2px` (innen) | 5.71 schlechtester Fall |
| Felder `:focus` | mp:162 | `outline:0` + Akzentrand + Halo `0 0 0 3px rgba(223,190,149,.22)`; mp:568 fügt Outline wieder hinzu | Rand 9.80, Halo allein **1.66** |
| `.search` | mp:172–173 | Innenfeld-Halo aus, Container `:focus-within` Rand + Halo; Innenfeld behält Outline | Doppelindikator |
| `.consent-card` | club:658 | `:focus-within{outline:3px solid #f5ddbc; outline-offset:3px}` + 2px-Ring der Checkbox | 13.09; Doppelring |
| `#kDetail` | B:647 | `#kDetail:focus{outline:none}` | keiner (programmatisches Ziel) |
| `summary` | – | UA-Ring `auto 1px rgb(16,16,16)` | nicht MP-Ring |
| `.tabelle-scroll` (tastaturfokussierbar) | – | UA-Ring `auto 1px` | **1.26** auf surface |
| Wurzel backend.html Felder | backend.html:52 | `outline:none; border-color:#B49153; box-shadow:0 0 0 4px #F3E6DF` | Rand 2.88, Halo **1.07** |
| Wurzel recht.html, 404 | – | UA | – |
| wallet-vorschau | :7 | `button:focus-visible{outline:3px solid white;outline-offset:4px}` | 17.98 |

Ringfarbe `#DFBE95` = Primärfläche `#E0BE98` (1.00:1): ein fokussierter Primärbutton wirkt als doppelte Pillenkontur mit 3-px-Lücke (bestanden, aber kein eigener Zustandston). Laufzeit-Tab-Reihenfolge: alle MP-Ziele erhalten den MP-Ring, außer `summary` und `.tabelle-scroll` (backend Verhalten/Kundinnen/Feedback); im Club-Mitgliedszustand bleibt die Tab-Schleife an `input#gebDatum` hängen (Datumssegmente schlucken Tab).

### 7.5 Zielgrößen (Touch)

44-px-Boden aus mp:87 und mp:91. Unter 44 px (gemessen @390):

| Element | w × h | Ort |
|---|---|---|
| `#appleWalletBtn` / `#walletBtn` | 204 × 30 / 214 × 30 | club:912 (UA-Buttons, Text 4.48:1) |
| `.sw` (drei Einwilligungsschalter) | 52 × 30 | mp:328 |
| `summary` „Konto und Datenschutz“ | 352 × 24 | club:900 |
| `.legal a` (Impressum, Datenschutz, Teilnahmebedingungen) | 54/61/117 × 34 | mp:319 (`padding:8px 0` auf 12px-Link) |
| `#loeschBestaetigt` | 30 × 26 | club:903 (im klickbaren Label) |
| Einwilligungs-Checkboxen `#rAlter` | 26 × 26 | club:655 (ganze Karte klickbar) |
| Advent-„Push“-Checkbox | 30 × 26 | B:2051 |
| `.unklar .btn` | min-height 40px (latent; `.btn.ghost.sm` darin 40px, T:716–717) | mp:219 |
| Inline-Links in Fließtext | 16–23 hoch | nach 2.5.8 ausgenommen |
| Legacy: backend.html Tabs 36px, Login-Felder 42px; recht.html Nav 40.9px; wallet-vorschau Schalter 42px | | |

Kein nicht-inline Ziel unter 24 px → WCAG 2.5.8 AA erfüllt. Terminal- und Backend-MP-Zustände ohne Ziel < 44 px (außer `#offenHinweis`).

### 7.6 Reduzierte Bewegung (vorhanden, erhalten)

- Global mp:571–575: `*,*::before,*::after{animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; scroll-behavior:auto !important}`, `.mp-feier .mp-arc,.mp-feier .mp-dust{display:none !important}`, `.track > span{transition:none}`.
- `.mp-feier.mp-reduced` (mp:536–537) per `sanft()` = `matchMedia("(prefers-reduced-motion: reduce)")` (club:955, 1338; terminal:1223); `scrollIntoView` `auto`/`smooth` (club:1087, 1292); Rad-Ergebnis 0 statt 4900ms (T:1596); GSAP-Sperren celebration-motion.js:6/18/56, club-motion.js:7–8; CSS bleibt Fallback (club:648).
- Lücken: Kommentar mp:524 verspricht „System oder Nutzereinstellung“, eine In-App-Einstellung gibt es nicht; backend `#kDetail`-Scroll `smooth` ohne Prüfung (B:1382); Legacy backend.html ohne Reduced Motion (Sheen 4.5s infinite :53–56, KPI-Einstieg :38–39, Hover-Lifts :45, :57).

### 7.7 Datensparen / Save-Data

**Nicht vorhanden** (kein `prefers-reduced-data`, kein `navigator.connection.saveData` in club/, terminal/, backend/ und Assets). Immer geladen: gsap 72 435 B + ScrollTrigger 44 157 B (Club), supabase 131 061 B, jsQR 256 885 B (Terminal), Cormorant-TTF je 290–293 KB (nur tatsächlich genutzte Schnitte). Die Übergabe („Datensparen … nicht pauschal umgehen“) bezieht sich auf den Perlenfilm der Website (anderes Repo).

### 7.8 Forced Colors (Windows-Kontrastmodus)

Keine `@media (forced-colors: active)`-Regel. Emulation: `.sw` an/aus identisch (Spur und Knopf Canvas, Knopf unsichtbar); `#track`-Füllung verschwindet; Sidebar `[aria-current]` nicht erkennbar; **alle 6 interaktiven `.pearl`-Buttons unsichtbar** (Verlauf-`::before` entfällt; Kettenlinie bleibt); Deko-Perlen/Staub verschwinden (vertretbar). `.btn`, Felder und Fokusring werden korrekt auf Systemfarben abgebildet.

### 7.9 Überlauf, Reflow und abgeschnittene Inhalte

| Befund | Zustand / Breite | Wert | Beleg |
|---|---|---|---|
| Kein Überlauf | club, terminal, backend, club/recht in den geprüften Zuständen (Standard, fertig, dash-empty/-data/-all, feier; terminal login/home/kundin/sheet; backend login/dash/kunden/praemien/mail) bei 360/390/768/1280 | `scrollWidth − innerWidth = 0` | gemessen |
| Terminal „Korrigieren“ geöffnet | 390 / 360 | **97 / 127 px** (`#korrCard` 470px, Tabelle `minWidth 420px`) | gemessen; T:645, 653–658, 1460 |
| Backend Zielgruppe | 1024 / 390 | **82 / 88 px** (Tabellen in `.grid2` ohne `.tabelle-scroll`) | gemessen; B:869–875 |
| Backend Verhalten | 390 / 320 | **4 / 74 px** (`.grid2 .card` rechts 393.8) | gemessen |
| Wurzel recht.html | 360 / 320 | 2 / 42 px (Tabelle) | gemessen |
| Prämiennamen in Tabellenfeldern | backend Prämien 360–1280 | „Augenbrauen-Styling“ braucht 166px im 105-px-Feld (181px @1280), „Gesichtsbehandlung Signature“ 231px | gemessen |
| E-Mail-Absender `#mVon` | backend Mail @768 | 183px Text im 161-px-Feld | gemessen |
| Scheinbare Überläufe | `.member` (Glanz `inset:-90%`), `#feierKarte` (`.mp-gsap-shine`) | dekorativ, nichts abgeschnitten | gemessen |

`body{overflow-x:hidden}` (mp:79) verdeckt Überläufe; nicht geprüfte Backend-Bereiche mit Tabellen ohne Wrapper (§5.5) können Inhalte abschneiden statt zu scrollen.

### 7.10 Mindestgrößen, Versalien, Laufweite

- MP-Block unter 12px: nur `.brandbar .logo span` 10px `.24em` (mp:227, nicht gerendert). Praktischer Boden 12px (`.eyebrow`, `th`, `.rank`, `.member .foot`, `.reward-copy .ready`, `.legal`, `.metrics span/small`, `.sidebar-foot > span`, `.door .hinten`, `.avatar`, `.mp-eyebrow`, `li.titel`, Heatmap). Legacy: backend.html:36 (10px), :72 (11.5px), :75 (11px), :832 (11px); recht.html:31 (11px); wallet-vorschau 10/11px.
- Versal-Laufweiten gerendert: eyebrow 1.8px (12px .15em), `.rank` 0.96px, `.gewinn .p` 0.78px, Admin-`th` 0.84px (14px), recht-`th` 0.72px, Bühnen-Eyebrow 2.64px, `.mp-mark` 2.04px, recht `.brand` 3.12px. Weite Laufweite auf 12-px-Versalien verlängert Strings um ≈15–25 % → EN/RU und kyrillische Versalien brechen in einzeiligen Flex-Reihen um (`.member .head`, Bühnen-Eyebrow).

### 7.11 Messlänge (Zeichen pro Zeile)

Club 390 Median 41 (24–56), 1280 Median 45, max 62–71 (`p.small`, 394-px-Spalte) – gut. club/recht 1280 **102 cpl** (Laufzeitmessung) bzw. Median 77 / max 96 (Zählung aller Textelemente) bei 16px/1.7 (`.wrap` 720px → 672px Inhalt). Backend `.card p.muted` 13px **172–181 cpl** @1280 (kein max-width); terminal `#uebText` 114 cpl @1280; Wurzel recht max 85–100 cpl. Kein Textelement auf MP-Seiten hat ein `max-width`.

### 7.12 Statusfarben, Farbsehschwäche und Vorschlag

OKLCH-Farbton (grün = h 120–170° bei C ≥ 0.03): `--mp-ok #A9C8AE` L 0.803 C 0.049 **h 149.8° (grün)** · Druck `#3E6B48` h 150.0° (grün) · Legacy `--ok #6B7F5E` h 133.3° (grün) · warn `#E7C58A` h 80.9° · danger `#F0A5AD` h 12.3° · accent `#DFBE95` h 72.7° · muted `#C6ABA8` h 25.4° · stage-rose `#BC8F9F` h 355.5° · Diamant base `#D1E2EC` h 233.4° C 0.023.

Aktuelle Familie unter CVD (ΔE_OK normal / protan / deutan / tritan): ok↔danger 0.130 / 0.061 / **0.005** / 0.151 · ok↔warn 0.089 / **0.053** / 0.077 / 0.111 · ok↔accent 0.075 / **0.033** / **0.049** / 0.100 · warn↔accent **0.029 / 0.029 / 0.029 / 0.021** · danger↔muted 0.067 / **0.009** / **0.037** / 0.079 · danger↔accent 0.084 / 0.071 / **0.046** / **0.058**. → Die „⚠“-Präfixe (mp:184, mp:213) sind tragend; `.pill.*` haben keinen Glyph.

Vorschlag der Bestandsaufnahme (Werte aus palette.json, keine neue Farbe):

| Rolle | Wert | Herkunft | Kontrast | CVD vs. danger (n/p/d/t) |
|---|---|---|---|---|
| ok auf dunkel (Text, Pill, ✓) | `#D1E2EC` | `diamant.base` | bg 12.97 · surface 11.32 · card 10.40 · art 8.68 · member 0 % 7.56 / 55 % 10.85 / 100 % 12.30 · reward 9.88–11.85 · Pill `rgba(209,226,236,.16)` auf surface (`#4A4247`) 7.31 | 0.151 / 0.153 / 0.110 / 0.175 |
| ok nur als Rand/Linie | `#A5BDC9` | `diamant.shade` | bg 8.80 · surface 7.68 · card 7.06 | 0.117 / 0.044 / 0.056 / 0.155 |
| ok auf hell/Druck | `#203342` | `diamant.ink` | `#fff` 13.01 · cream 12.72 · pearl 11.39 · pearl2 10.43 | vs. `#8E2E36`: 0.208 / 0.079 / 0.172 / 0.249 |
| warn (bleibt) | `#E7C58A` | mp:42 | ≥ 6.10 auf allen dunklen Gründen | ≈ accent → nur mit ⚠ + Wortlaut |
| danger (bleibt) | `#F0A5AD` | mp:43 | ≥ 5.12 | – |

Einschränkung: `#D1E2EC` liegt in der Helligkeit nahe `--mp-text` (ΔE 0.057, unterscheidbar nur über kühl/warm) → Regel „immer mit Text/Zeichen kombiniert“ (Kommentar mp:39) muss gelten: ✓ für ok, ⚠ für warn, eigener Glyph für danger. Kein warmer, nicht-grüner AA-Warnton trennt gut vom Akzent (bester Kandidat `#FFDBAF` 0.079).

### 7.13 Wallet-Rangpalette

Alle Rang-Tinten ≥ 4.5:1 auf base/shade/light: Bronze `#FFF0DA` 6.03 / 9.42 / 6.03 · Silber `#24252A` 9.33 / 6.31 / 13.47 · Gold `#322519` 6.79 / **4.63** / 10.26 · Platin `#30312F` 8.44 / 5.86 / 11.52 · Diamant `#203342` 9.79 / 6.64 / 12.47.

### 7.14 Abgeleitete Mindestwerte (nicht im Quelltext, vom Design zu bestätigen)

Kontrollrand gleicher Farbton `#7A6060` (3.01 nur bg) bzw. `#896F6F` (3.75 bg / 3.27 surface / 3.01 card) · Platzhalter `#967D7E` (4.54) oder mp:86 wirken lassen (muted 8.04) · Heatmap zwei Bänder: Alpha ≤ .19 mit muted (4.56) und ≥ .64 mit `#2E211B` (4.54) · Hell-Thema: Textakzent `#7C6029` (≥ 4.72 auf cream/pearl/pearl2); 3:1-UI-Gold `#A17E40` (3.68 / 3.30 / 3.02); helle Feldlinie `#968970` (3.36 cream / 3.01 pearl); falls Wurzel-recht bleibt: soft `#7A685F` (4.52 / 4.96), deep `#895843` (5.07 / 5.56 / 4.50) · Messlänge ≈68ch Prosa, ≈72ch Hilfetext · Versal-Laufweite ≤ .12em bei ≤ 12px oder Labels auf 13px; +30 % Breitenbudget für EN/RU.

---

## 8. Befunde (dedupliziert, nach Schwere)

### 8.1 Hoch

| ID | Befund | Ort | Empfehlung für die neue Fassung |
|---|---|---|---|
| H1 | **Grün im Statussystem.** `--mp-ok #A9C8AE` (h 149.8°) treibt `.pill.ok/.gut`, `.toast.ok::before`, `.list .item.gewinn` (sichtbar im Terminal: Rand + „AUSGEBEN“) und `.bdelta.plus`; Druck `#3E6B48`, Legacy `--ok #6B7F5E` ebenfalls grün. Unter Deuteranopie ok↔danger ΔE 0.005. | mp:41, 198, 214, 400, 472, 560; backend.html:24; B:1937–1939; T:1322 | ok = `#D1E2EC` (dunkel) / `#203342` (hell, Druck) aus palette.json, immer mit ✓-Glyph; Grün vollständig entfernen. |
| H2 | **Nur Dunkelmodus.** `html{color-scheme:dark}`, `input[type=date]{color-scheme:dark}`, kein `prefers-color-scheme`, kein Hell-Token-Satz; Aliase zeigen auf dunkle Werte; Select-Pfeil fest `%23DFBE95`. | mp:75, 167, 164, 553–555, 62–70 | Semantische Rollen-Token mit Dunkel- und Hellsatz (Hell aus der backend.html-Crème/Gold-Linie `#FFFCF7`/`#F6EFE3`/`#EFE5D4`/`#3B2E1E`/`#6E5C44`), `prefers-color-scheme` + `:root[data-theme]`; keine weißen Zwischenflächen im Dunkel. |
| H3 | **Gold `#B49153` auf Hell unbrauchbar** für Text, Icons, UI, Fokus (2.88 / 2.58 / 2.36:1); Legacy-Buttontext auf Verlaufsanfang 2.88, aktiver Tab 2.83; ein Icon-Export in `#B49153` (Arbeitsnotiz, nicht im Repository) wäre auf Hell ebenso zu schwach. | backend.html:16, 59, 68, 71 | Hell: Textakzent `#7C6029`, `#B49153` nur Logo/Deko; UI-Gold ≥ 3:1 (abgeleitet `#A17E40`) erst nach Designabnahme. |
| H4 | **Buttons sind kein System.** Gerenderte Höhen 30/40/44/45/46/47/49/52/54/56/57/60/84 px, Radien 0/8/12/12.6/15/30/50px/50 %, Paddings `14px 22px`/`17px 19px`/`12px 16px`/`8px 14px`/`10px 0`/`10px 18px`/`11px 10px`; min-height wirkungslos (Padding + lh 1.5); 22 gemessene Reihen mit ungleichen Höhen oder Radien (§5.1). | mp:87, 116–136, 219, 390, 431, 467, 534 | Eine Control-Höhenskala für primär/sekundär/klein/Feld (feste Höhe statt Padding), ein Radius je Familie unabhängig vom Zustand, Reihen mit `align-items:stretch`/gleicher Höhe. |
| H5 | **`.secondary` ohne `.btn`-Basis.** UA-`2px outset`-Fase, Gewicht 400, `display:block`, Icon 4px über Textmitte, `<a class="secondary">` ohne Rand; 49/52/56px statt 47/44px; 14 Verwendungen; zwei verschiedene „Sekundär“-Looks nebeneinander. | mp:130–134; club:737, 763, 851, 890, 904, 1444; T:710–711, 725, 747–749; B:696, 728 | `.secondary` in dieselbe Basis wie `.btn.ghost` überführen (1px, 500, inline-flex, 12px gap). |
| H6 | **Wallet-Buttons unformatiert.** `.club-footer > button` trifft nicht (Buttons im Inline-`<div>`); grau `#6B6B6B`, `2px outset #FFFFFF`, Radius 0, `1px 6px`, 30px, kein Spinner – hellgraue Zwischenfläche im Dunkel. | club:912 vs. mp:317 (club:334) | Wallet-Aktionen in das Button-System aufnehmen (≥ 44px, dunkle Fläche, Ladezustand). |
| H7 | **Checkbox ohne Häkchen.** Globales `appearance:none` + Feldpadding → angehakt = nicht angehakt (30×26). Betrifft Kontolöschungs-Bestätigung und Advent-Push. | mp:154–166; club:903; B:2051 | Checkbox/Radio aus der Feldregel ausnehmen und ein eigenes Checkbox-Bauteil (≥ 44px Ziel) definieren. |
| H8 | **Kontrollränder unter 3:1.** `--mp-line #5A4242` einziger Rand für Felder, Suche, `.sw`, `.nps`, Sterne aus, `.icon-button`, `.pad`, `.door`, `.list .item`: 1.88 bg / 1.64 surface / 1.51 card; Feldfläche gegen Karte 1.15; `.btn.gefahr`-Rand 2.82. | mp:28, 136, 148, 156, 328, 333, 336, 343, 386, 395 | Token teilen: `--mp-line` nur für Trenner, neuer Kontrollrand ≥ 3:1 (abgeleitet `#896F6F`). |
| H9 | **Terminal ≤768: ungleiche Kartenbreiten und Überlauf.** `align-items:start` bleibt in der Flex-Spalte; Karten 310–728px; „Korrigieren“ @390 → 97px Überlauf (127 @360). | T:645, 653–658, 1460 | Einspaltiges Layout mit gestreckten Karten und Tabellen im Scroll-Wrapper; Portrait-Tablet als Hauptfall prüfen. |
| H10 | **Backend-Tabellen: Überlauf und Spaltenversatz.** Zielgruppe 82px (1024) / 88px (390), Verhalten 4px (390) / 74px (320); `#praemien` und `#advent` 6 `th` für 7 `td`; ~12 Tabellen ohne Wrapper unter `overflow-x:hidden`. | B:869–875, 2004–2013, 2041–2050; mp:79, 193–194 | Tabellen-Bauteil mit Scroll-Wrapper als Standard, `<thead>`, gleicher Spaltenzahl. |
| H11 | **Legacy-Hellseiten fallen durch (falls live).** Wurzel recht.html soft 3.50, deep 3.17–3.92, Gewicht 300, Entwurfstexte; Wurzel backend.html Gold 2.88, Rahmen 1.26–1.30, Fokus-Halo 1.07 bei `outline:none`, ok 4.25, Endlos-Sheen. | recht.html:11, 23–34, 43, 52; backend.html:21, 52–56, 59, 68, 71, 109 | Nicht als Vorlage übernehmen; nur Crème-Werte als Rohstoff; Seiten nicht verlinken bzw. ersetzen. |

### 8.2 Mittel

| ID | Befund | Ort | Empfehlung |
|---|---|---|---|
| M1 | **Keine Token für Abstand, Typo, Schatten, z-index, Messlänge, Control-Höhe, Scrim, Fokus.** 33 Abstandswerte (9 auf 4-px-Raster), 30 deklarierte / 29 gerenderte Schriftgrößen, vier h2-Größen (24/25/26/27), sieben weite Laufweiten, Gutter 16/17/19/20px, Karten-Paddings 18/20/22/24/25/30px, Abschnittsabstände 10–35px (Club-Dashboard 0/10/17/21/25/27/32). | ganzer Block; Gutter mp:244, 364, 440, 583, 597, 604 | Skalen aus vorhandenen Werten bilden (z. B. Abstand 8/12/16/24/32, UI-Typo 12/13/14/16, Display 18/21/24/27/38/66), ein Gutter je Breite, ein Karten-Padding. |
| M2 | **Radien-Wildwuchs.** 16 Werte; 12.6px `.featured-reward`, 11px Innenrahmen, 16/24px Bühne/Consent, 15px Schalter, 8px Sidebar, 30px Chips; Pille neben 12px in derselben Reihe; Funktionsschalter wechselt Radius mit Zustand. | mp:118, 132, 135, 257, 294, 328, 390, 431, 479, 498, 528; club:654; B:1857, 2012 | Auf die drei Token 12/18/50px + 50 % reduzieren (3px nur Fortschritt/Balken); zustandsunabhängig. |
| M3 | **Fokus: Doppelringe und Lücken.** Felder immer Rand + Halo + Outline; `.search` innen + außen; Consent 3px `#f5ddbc` + Checkbox-Ring; `summary` und `.tabelle-scroll` nur UA-Ring (1.26); `#kDetail:focus{outline:none}`. | mp:162, 172–173, 568–570; club:658, 900; B:647 | Ein Ring pro Control (2px, Versatz 3px beibehalten), auf `summary`, Scroller, `[role=button]` ausdehnen; nie `outline:none` ohne ≥ 3:1-Ersatz. |
| M4 | **Platzhalter 4.12:1.** mp:161 `#8F7677` überschreibt mp:86 (`--mp-text-muted`, 8.04). | mp:86, 161 | Override streichen oder abgeleitet `#967D7E` (4.54). |
| M5 | **Warn ≈ Akzent; Warn als Fehler.** ΔE 0.029 für alle Sehtypen; `.hinweis.warn` nutzt `--mp-danger`; danger↔muted protan 0.009; Status-Pills ohne Glyph. | mp:29, 42, 183, 197–200 | Status immer über Glyph + Wortlaut; `.hinweis.warn` auf warn; eigene Glyphen für ok/warn/danger. |
| M6 | **Legacy-Aliase tot und bedeutungsverschoben.** 24 Aliase, 0 Verweise; 7 Namen → ein Akzent, Crème → dunkle Fläche, `--ink`/`--on-gold` invertiert, `--warn` Rot → Bernstein, `--rose` Fläche → Akzent. | mp:62–70 | Aliase entfernen; Hell-Thema mit neuen semantischen Namen statt alter Namen. |
| M7 | **Toast.** Breite faktisch ≤ 50vw (195px @390, 120px hoch), 640px-Grenze tot; Dauern 3800/3200/3400ms; Erfolgsvariante nie gesetzt. | mp:89, 204–214; club:957–958; T:918–919, 1440; B:1104–1106 | Toast mit voller mobiler Breite (Gutter), eine Dauer, Varianten ok/warn/fehler mit Glyph, ohne Grün. |
| M8 | **Zwei Modalsysteme + native Dialoge.** `.sheet .card` (bg, 30px, 390/540px, `#1C130BB5` + blur 7px) vs. `.mp-admin-dialog` (surface, 24px, 520px, `rgba(16,13,16,.78)`); Feier-Scrim `rgba(16,13,16,.86)`; `confirm()`/`prompt()` für unumkehrbare Schritte; Terminal-Sheets ohne Escape/Fokusfalle, kein ×; Eintritt .4s/250ms/260ms vs. Token 180ms. | mp:234–241, 476, 616–619; T:854–881, 1407, 1483, 1488, 1501; B:1384, 1687, 1741, 1951 | Ein Dialog-Muster (Fläche, Padding, Breiten, Scrim, Escape, Fokusfalle, Buttonreihenfolge); ohne neue Animation die vorhandene `mp-ebene` verwenden. |
| M9 | **Lade-/Disabled-Zustände lückenhaft.** Spinner nur `.btn`/`.main-action`; `mitSperre()` setzt `.laedt`/`aria-busy` auch auf `.secondary`, `.linkbtn`, `.sw`, `.door`, Wallet-Buttons ohne Wirkung; `.linkbtn:disabled` ohne Look; Opazitäten .45/.5/.55; Ghost ohne Druckzustand. | mp:84, 126–143, 163, 347, 401; club:993–995; B:1113–1117, 1218, 1229; T:1051, 1086, 1180, 1192 | Einheitliche Zustände (hover/active/disabled/laden) für jede Button-Variante; eine Disabled-Opazität. |
| M10 | **Undefinierte Klassen, tote Rückmeldungen.** `.row` (0px-Abstand im Mail-Dialog, Kundin-Detail-Kopf gestapelt), `.bestaetigt` ohne CSS, `.stand.puls` spielt nie (`puls` auf `#kStand`, `.stand` auf `#kStandWrap`), `.hint`, `.korr`. | B:1141–1148, 1359, 1517, 1951; T:769, 792, 1316, 1460; mp:404 | Layout-Helfer (Reihe/Stapel) als Bauteil definieren; bestätigte Rückmeldungen (Puls, Ring) wieder wirksam machen, ohne neue Animation zu erfinden (Klärung §9.2). |
| M11 | **Suchreihe 6px versetzt.** `label.search` erbt `label{margin-bottom:6px}`; Feld 50 vs. Buttons 56. | mp:152, 168; T:706–711, 743–749 | Label-Abstand nur für Feldbeschriftungen, nicht für Feld-Container. |
| M12 | **Feldgröße 15px / zweite Feldhöhe 44px.** `.filter` 15px (iOS-Zoom), `max(1rem,16px)` tot; Formularreihen mischen 44 und 50px (`select#kGruppe` 44 vs. `select#npArt` 50); Datum 52px. | mp:85, 155, 460–465; B:731–740, 836–842, 907–909 | Felder ≥ 16px, eine Feldhöhe = Control-Höhe der Buttons daneben. |
| M13 | **Mehrzeilige Labels und Pfeilausrichtung.** Umbrüche lassen Buttons wachsen (47→68, 60→84), Nachbarn zentrieren; `<a>`-Buttons `text-align:start`, `<button>` zentriert; `nowrap` in Tabellenaktionen; `.main-action` ohne Pfeil linksbündig (backend `#loginBtn`, `#rechtAnnehmen`), `#buchenBtn` verliert Pfeil durch `textContent`. | mp:116–125, 467; T:756, 825, 926; club:871, 898; B:684, 2012 | Regeln für Umbruch (gleiche Höhe je Reihe, definierte Ausrichtung), Label + Pfeil als getrennte Kinder, Pfeil konsequent oder nie. |
| M14 | **Consent/Rechtsbestätigung außerhalb der Token.** 10 hartkodierte Hex (`#927875`, `#2b2224`, `#f7eee7`, `#dfbe95`, `#49382d`, `#f5ddbc`, `#d7c5bd`, `#ffe3b8`, `#302820`, `#21191a`), 2px-Rand, 16px-Radius, eigener Fokusring, Gewicht 600, Erledigt-Gold `#dfbe95/#21191a` ≠ Button-Token; „Disabled“ = Erfolgszustand. | club:654–669 | Auf Rollen-Token überführen (Auswahlkarte mit angehakt-Zustand), gleicher Fokusring, Gewicht 500. |
| M15 | **Synthetische Schriftschnitte.** Jost 600 (club:660, 669) und 700 (`strong#rewardProgressName` club:798, club/recht `b`, gerendert ×32) nicht geladen; Legacy Jost 300 lokal nicht vorhanden. | club/assets/vendor/fonts.css; club:660, 669, 798 | Nur 400/500 (Jost) und 400/500/600 + italic 400/500 (Cormorant) verwenden; `strong`/`b` explizit 500. |
| M16 | **Keine DE/EN/RU-Struktur.** `lang="de"`, Strings inline in HTML/JS und in CSS `content` („Zum Bestätigen anklicken“, „✓ Bestätigt“); weite Versal-Laufweiten verlängern Strings. | club:2, 661–662, 1010; mp:105, 495 | Stringstruktur vorbereiten, keine Texte in CSS `content`; Layouts mit +30–40 % Textlänge prüfen. |
| M17 | **Ziffern und Formate.** Keine `lining-nums` (Mediävalziffern auf Pad, Saldo, Betrag); Terminal „1284“/„-300“/„20. Sept.“, Backend „1.284“/„−300“/„20.9.2026“/„3.8 %“; Verlaufszeilen ohne Spaltenflucht; Datum + Name ohne Trenner. | mp:371, 383, 386, 402; T:921, 928, 1315, 1337, 1347, 1465–1469; B:1118–1120, 1242, 1286–1287 | `lining-nums tabular-nums` für Zahlen/Beträge; ein Zahl-, Datums- und Minusformat für beide Apps (de-DE, Komma, U+2212). |
| M18 | **Karten- und Flächen-Specs uneinheitlich.** Paddings 18/20/22/24/25/30px; Feld-Fläche = Karten-Fläche im Terminal-Sheet (Feld verschmilzt); Karte vs. Seite 1.15:1 bei transparentem Rand; Akzentkarte nur inline. | mp:177, 181, 237–238, 349, 368, 457, 468; club:654, 663, 759; T:789 | Eine Kartenfamilie (Standard, Akzent, Einlass) mit festem Padding und klarer Flächenstufung. |
| M19 | **Backend-Mobil/Tablet-Rahmen.** „Bereiche“-Button 210–229px hoch bei 768×1024 (Grid-`min-height`), @390 ohne Gutter (x = 0), Markenleiste 155px; `calc(100vh - 92px)` vs. 99px; Sidebar nicht sticky. | mp:426–428, 584–588; B:696–699 | Navigation als eigenes Bauteil mit Gutter und fester Höhe; min-height nicht auf Zeilen verteilen. |
| M20 | **KPI-Waisen und statischer Titel.** `.metrics` fest 3 Spalten bei 4/5/6 Einträgen; `.bdelta` 16px grün statt 12px-Unterzeile; h1 „Dein Studio im Blick.“ in allen 17 Bereichen; „Bericht“-Button überall. | mp:444–450, 472, 579; B:727–728, 1108, 1238–1250, 1370, 1582–1599 | Auto-fit-KPI-Raster (Legacy-Muster `minmax(190px,1fr)` als Vorbild), Bereichsname als Titel. |
| M21 | **Kein Forced-Colors-Support.** Schalterzustand, Fortschritt, aktueller Sidebar-Eintrag und die 6 Perlen-Buttons verschwinden. | mp:274–284, 313–314, 328–331, 434 | `@media (forced-colors: active)`-Block (Highlight/ButtonText, Rand für `.pearl::before`). |
| M22 | **Keine Datensparen-Behandlung** (Übergabe verlangt „erhalten“, hier nicht vorhanden); GSAP/ScrollTrigger immer geladen, Fonts als TTF. | club:671–674; T:667–668; fonts.css | GSAP-Pfade hinter `saveData`/`prefers-reduced-data` schalten (CSS-Fallback existiert). |
| M23 | **Heatmap-Kontrast und Beschriftung.** 2.17–3.64:1 bei 12px; Kopf rechtsbündig über zentrierten Zellen; „Je dunkler, desto mehr Besuche“ im Dunkelthema falsch. | B:853, 1407–1427 | Zwei Farbbänder (abgeleitet Alpha ≤ .19 / ≥ .64) oder Zahl außerhalb der Fläche; Beschriftung je Thema. |
| M24 | **Abgeschnittene Feldwerte.** Prämiennamen in 105-px-Tabellenfeldern, `#mVon` @768. | B:2006–2010, 2049–2050; Mail-Formular | Inline-Editierfelder mit Mindestbreite je Inhalt oder Umbruch/Detailansicht. |
| M25 | **Drei Hell-Familien** (gelb-warm backend/404, rosé-warm recht, mauve Druck); Rosé-Reste in backend.html (`#C6957F`, `rgba(185,133,112,…)`). | backend.html:15, 85, 831, 923; recht.html:11; mp:553–555 | Eine Hell-Familie (gelb-warme Crème) auch für Druck. |
| M26 | **Logo-Präsentation.** PNG-Leistungszeile bis an die Kante (x 0–659, „g“ angeschnitten); Markenleisten-Ausschnitt bündig (54.33 in 54px); Vollzeichen unter 240px unlesbar (club/recht 150px); Apple-Icon mit angeschnittener Leistungszeile (freigegeben). | mp:223–226; recht:653; apple/icon*.png | Kein neues Logo: für kleine Größen die vorhandene Querversion (Wortmarke + Muschel) bzw. den Wortmarken-Ausschnitt mit Luft verwenden; Apple-Icon nur mit Freigabe ändern. |
| M27 | **Tabellen-Zugänglichkeit.** Klickbare `tr` ohne Fokus/Tastatur; kein `<thead>` (Druck-Kopfwiederholung greift nie); Admin-`th` 14px versal konkurriert mit Daten; leere Zustände uneinheitlich (`.leer` vs. `td.muted`). | B:1257, 1262, 1324, 1328, 1340; mp:188, 470, 558 | Zeilenaktion als Button/Link, `<thead>`, ein `th`-Stil, ein Leerzustand. |
| M28 | **Rhythmus Club-Dashboard.** Abstände aus Einzelwerten (27, 17, 0, 32, 10, 21, 10, 25, 21) + ~30 Inline-Margins; Terminal-Pad ohne Abstand zum Feld, 320px in 691-px-Spalte; Registrierung mit gemischter Ausrichtung. | mp:125, 248, 291, 307, 315, 385; club Inline-Stile (§4.1) | Dreistufiger Rhythmus (innerhalb/zwischen/Abschnitt) aus vorhandenen Werten; Inline-Margins ablösen. |

### 8.3 Niedrig

| ID | Befund | Ort | Empfehlung |
|---|---|---|---|
| L1 | Beinahe-Duplikat-Token: `--mp-accent`/`--mp-button-bg` 1.00:1; drei fast gleiche Helltexte (`#F6E9DF`/`#FAE8DE`/`#F5ECE6`). | mp:26, 29–32, 49 | Zusammenlegen oder klar als Rollen trennen. |
| L2 | Hartkodierte Drift: 90 Literale im Block (22 Alpha-Ableitungen, Akzent in 6 Alphastufen), Perlenverlauf doppelt (mp:418 = 485), Markenleistenrand `#6C4C483F` ≠ `--mp-line`, drei Scrims, Rad-Canvas kopiert Token als Literale. | mp:222, 234, 277, 298, 418, 476, 485, 617; T:1571–1577 | Alpha-/Scrim-/Perlen-Material-Token; Canvas-Farben aus CSS-Variablen lesen. |
| L3 | Bewegung: `cubic-bezier(.22,1,.36,1)` 5× als Literal; vier Ebenen-Dauern; CSS-Fallback vs. GSAP (Bögen, Staub 96/82 vs. 90/75, `.mp-copy`); `.mp-gsap` hebt 250ms-Einblendung auf. | mp:238, 416, 477, 507–519, 548; club:649, 1365–1367; celebration-motion.js:35–47 | Nur Token-Verweise, Werte unverändert (V21-Zeiten bleiben); Abweichungen dokumentieren, nicht neu erfinden. |
| L4 | Veraltete Kommentare: mp:40 (8.9/9.6/7.2 statt 9.49/10.46/8.77); mp:524 („Nutzereinstellung“ existiert nicht). | mp:39–40, 524 | Korrigieren. |
| L5 | Tote/überschriebene Regeln und Selektoren (§5.16): mp:85–91, `.stars`, `.tabs`, `#ladeFehler` im gemeinsamen Block, `.linkbtn` mp:88, 640px-Toast. | mp:85–91, 128, 145, 155, 207 | Bereinigen. |
| L6 | Zielgrößen unter 44px: `.sw` 30, `.legal a` 34, `summary` 24, `.unklar .btn` 40 (latent), Advent-Checkbox 30×26. | mp:219, 319, 328; club:900; B:2051; T:716–717 | 44-px-Trefferfläche für alle Controls. |
| L7 | Zu lange Zeilen: club/recht 96–102 cpl, backend-Hilfetext 172–181, terminal 114. | recht:635; backend `.card p.muted`; T `#uebText` | Messlänge-Token (≈68ch/72ch). |
| L8 | Kleine Versalien mit weiter Laufweite (`.22em`, `.15em`), `.brandbar .logo span` 10px; Legacy < 12px. | mp:105, 227, 495, 535; backend.html:36, 72, 75, 832; recht.html:31 | Eine Versal-Laufweite, Boden 12px. |
| L9 | `.pearl:hover`-Hub nicht in `(hover:hover)` → bleibt auf Touch hängen. | club:298 (mp:281) | In `(hover:hover)` fassen (Werte unverändert). |
| L10 | Rangstufen in der Club-Oberfläche nicht sichtbar (nur Name); Bronze light = base; `i-wallet`/`i-x`/`i-check` ungenutzt; Bühnen-× als Glyph; `#walletTop` nutzt `i-scan`. | palette.json:4–7; club:685–687, 749, 920 | Entscheidung: Rangfarben nur Wallet oder auch UI (ohne neue Farben). |
| L11 | Empfehlungslink in Browser-monospace, bricht mitten in der URL, neben 12px-„Kopieren“ und 50px-„Einladung teilen“. | club:850–851 | Link-Feld-Bauteil in Jost, einheitliche Buttonform. |
| L12 | Terminal-Scan ohne Hinweistext/aktiven Zustand; `viewport-fit=cover` ohne `env(safe-area-inset-*)`. | mp:406–408; T:9–12, 1279–1297 | Sichere Randabstände für Standalone-iPad. |
| L13 | Tabs-, Feldfehler-, Hinweis-Bauteil fehlen; Chips ohne gewählten Zustand/`aria-pressed`. | mp:87, 561; B:736–738, 938–941; T:792 | Segment-/Tab-, Feldfehler- und Hinweisbauteil im Button-/Feldsystem definieren. |
| L14 | `100vh` neben `100dvh`; `body{overflow-x:hidden}` verdeckt Überläufe. | mp:79, 427, 478, 616 | Einheitlich `dvh`; Überläufe beheben statt verstecken. |
| L15 | Legacy-Defekte: recht.html Entwurfstexte, backend.html leerer Toast ragt 16px ins Bild, sichtbare Verlaufskante bei y ≈ 617px, „Great Vibes“ ungenutzt, `logos.ts` toter Fallback. | recht.html:43, 52; backend.html:9, 30, 87; wallet-apple/logos.ts; index.ts:24–25 | Nicht übernehmen; `logos.ts` nicht versehentlich aktivieren. |
| L16 | Desktop-Club ist eine 394-px-Telefonspalte auf 1280px. | mp:244 | Bewusst entscheiden (akzeptabel für Mitglieder-App). |

---

## 9. Leitplanken für die neue Fassung

### 9.1 Übergaberegeln (aus dem Übergabedokument `calude_design.md`, Stand 29.09.2026, nicht in diesem Repository, und aus AGENTS.md)

1. Bestehende La-Perlé-Markenwelt erhalten: warme Gold-/Champagnertöne, **helle Cremeflächen und dunkle warme Flächen**, bestehende Typografie (Cormorant Garamond + Jost) und Muschel-/Perlenbezug.
2. **Kein Grün** wieder einführen (betrifft `--mp-ok`, Druck-Plus, Legacy-ok). **Keine LP-Monogramme, keine Logo-Neugestaltung** ohne konkreten Auftrag.
3. **Buttons als ein System:** gleiche Höhen innerhalb einer Reihe, stimmige Innenabstände, Text-/Pfeilausrichtung, konsistente Radien; mehrzeilige Beschriftungen dürfen keine versetzten Reihen erzeugen.
4. Einheitliche Abschnittsabstände, Box-Innenabstände, Zeilenhöhen und Textbreiten; mobil **keine abgeschnittenen Inhalte, kein horizontaler Überlauf**.
5. **Hell- und Dunkelmodus** berücksichtigen; im Dunklen keine weißen Zwischenflächen (hier: Wallet-UA-Buttons, helle Radsegmente), lesbare Inhalte, sichtbarer Kopfbereich. (Die Übergabe nennt den Chat „Perlá“ – nicht in diesem Repo.)
6. Menü, Header, Chat und schwebende Bedienelemente dürfen sich nicht unkontrolliert überlagern, auch schmal. (Heute: keine fixen Kopf-/Menü-/Chat-Ebenen auf MP-Seiten; Ebenen 800/900/1000 – bei neuen Ebenen z-index-Skala festlegen.)
7. **DE, EN und RU** behalten dieselbe Struktur und dieselben Funktionen (längere EN/RU-Strings); Sprachwahl nutzt Flaggen (Website).
8. **Keine neuen Animationen, keine KI-Medien**; bestätigte Filme/Animationen erhalten.
9. **Fokuszustände und reduzierte Bewegung/Datensparen erhalten** (Datensparen existiert in diesem Repo nicht, §7.7).
10. Arbeitsweise: nur betroffene Dateien, kleiner Diff, keine Frameworkwechsel, keine neuen Abhängigkeiten, keine Geheimnisse im Frontend; produktive Daten/Server nicht verändern (Beautinda betreut den Server, kein Upload ohne Auftrag); lokale Vorschau, Teststand, Freigabe und Live klar trennen; nach Abschluss `PROJECT_STATUS.md` knapp aktualisieren.

### 9.2 Byte-genau bzw. wertgenau zu erhalten

**Animationen (bestätigt):**
- Feier-Choreografie mp:474–549 mit allen Zeiten, Verzögerungen, Keyframes und Easings (§4.7; mp:507 „exakt aus der Studie (V21)“): `mp-ebene` 250ms, `mp-rise` 1.5s, `mp-ring` 1.4s, `mp-glow` 2s, `mp-spark` 1.8s + `calc(.4s + var(--delay))`, `mp-shine` 1.4s .6s, `mp-open-left/right` 1.6s, `mp-reveal` 1.5s, `mp-seal` 1.1s/1s, Kompakt .65s, Inline-Varianten; Rosé-Bühnenperle bewusst anders als Kartenperlen.
- `club/assets/celebration-motion.js` (Zeitleiste §4.7) und `club/assets/club-motion.js` (Reveal y 14/10, opacity .55, 0.65s `power2.out`, `top 94%`, once) unverändert.
- Club: Kartenglanz `lp-shine 1.5s ease` nur `(hover:hover)`; Perlenhub `.35s ease` `translateY(-5px) scale(1.12)`; Prämienperle `.6s var(--mp-ease)`; Fortschritt `width .6s`; Schalter 160ms; Spinner `mp-dreh .8s linear infinite`; Toast 180ms; Sheet `mp-ebene .4s`.
- Terminal: Glücksrad `transform 4.8s cubic-bezier(.16,.84,.26,1)`, Ergebnis nach 4900ms (0ms reduziert); Kurz-Feier (V25); Saldo-Puls `zahl .6s` ist definiert, spielt aber nie – Reaktivierung vorher klären (bestätigte, aber derzeit unsichtbare Animation).
- Reduced-Motion-Pfad vollständig: mp:571–575, `.mp-reduced` (mp:536–537), `sanft()` (club:955, 1338; terminal:1223), GSAP-Sperren, `visibilitychange`-Settle (club:1403–1406, celebration-motion.js:54–56), Feier wartet bei Formulareingabe/verborgenem Tab.
- Fokusmuster 2px `--mp-accent`, Versatz 3px (Perle −2px) als Grundlage.

**Logo und Wallet:**
- Seitenlogo-PNG (md5 `ff850c3c037763314a38f49929d79a9b`) und `original-logo.svg` unverändert; Varianten nur durch Ausschnitt/Größe bzw. die dokumentierte Querversion (`scripts/export-refined-wallet.cjs:20–22`). Kein Monogramm, kein neues Zeichen.
- Wallet-Kunst `assets/wallet/refined-metallic-v4/**` (Rangmotive, Strips, Logos, Icons – laut `release/wallet-design-refinement.md` bytegleich freigegeben), `palette.json`, Pass-Farben in `wallet-apple/pass.ts:9–13` und `wallet/index.ts:174–175, 227` (Klasse `#21191A`).

**Fachliche Regeln (nicht stillschweigend ändern):**
- Terminal: Beim **Hinzufügen von Punkten keine Kassenbonnummer** verlangen (heutige Buchung fragt nur Betrag, Behandlung, Zahlungsart; die Kassenbon-Nummer „(Pflicht)“ gehört zu „Prämie ausgeben“, `#sheetAus` T:871–881).
- Einlösbare Prämien aus der vorhandenen Club-Prämienliste und dem Punktestand (Reihenfolge offene Gewinne → einlösbar → nach Punkten, T:1331); **nicht auf zwei Beispielprämien zurückfallen**.
- R01 ungeklärte Buchungen („nichts wird doppelt gebucht, solange du „Erneut senden“ nutzt", T:1076), nur 6-stellige Kartencodes (T:1287–1291), Korrekturweg.
- La Perlé Plus nicht buchbar; Mitarbeiterzugang bis Rollenabnahme deaktiviert; Rollensteuerung (12 Einträge nur „zentrale“, B:1536–1554).
- Club-Sprache: du-Form, „Perlen“ (nie „Punkte“ in der Mitgliederoberfläche), Einlösen „am Empfang“, Gedankenstrich „–“ mit Leerzeichen, ausdrückliche Einwilligung („Schweigen gilt nicht als Zustimmung.“, club:896), Honeypot + 2-s-Zeitschutz, Altersbestätigung.
- Terminal-Reihenfolge ≤768 (V13/V15) und Admin-Navigation (V18) inhaltlich wie heute.

### 9.3 Nicht aus Legacy übernehmen

Sheen 4.5s infinite, KPI-Einstieg `auf`, Hover-Lifts, Balken-.9s (backend.html:38–57); Jost 300; Google Fonts und CDN-Supabase (backend.html:9–10, recht.html:9); `outline:none` mit Halo `#F3E6DF`; Gold `#B49153` als Text-/Buttonfarbe; Rosé-Reste `#C6957F`/`rgba(185,133,112,…)`; 999px-Pillen und 36px-Tabs; `logos.ts`; Entwurfstexte der Wurzel-recht.html. Übernehmbar als Rohstoff: Crème-Palette (`#FFFCF7`, `#F6EFE3`, `#EFE5D4`, `#3B2E1E`, `#6E5C44`, `#7C6029`, `#E2CFA6`), `--shadow`, KPI-Muster `repeat(auto-fit,minmax(190px,1fr))`, h2-Strich-Detail (34×1px, recht.html:19).

### 9.4 Technische Leitplanken

- Der MP-Block muss in allen sechs HTML-Dateien byte-identisch bleiben (md5-Prüfung). Quelle (`design/midnight-prive-fassung-3.css`) und Einbetter (`design/einbetten.py`) sind wiederhergestellt; `python3 design/einbetten.py pruefen` vergleicht die sechs Blöcke.
- Lokale Schriften (fonts.css) behalten; nur vorhandene Schnitte verwenden.
- Prüfungen je Änderung: 320/360/390/768/1024/1280, hell/dunkel, +40 % Textlänge (EN/RU), Reduced Motion, Tastatur, Forced Colors; Vorschau `127.0.0.1:8790` mit gesperrtem `supabase.co`.

### 9.5 Mindestumfang der neuen Fassung (aus den Befunden abgeleitet, ohne neue Werte)

Rollen-Token dunkel + hell (Fläche, Einlass, Text, gedämpft, Linie, Kontrollrand, Akzent-Text, Akzent-Fläche, Status ok/warn/fehler ohne Grün, Scrim, Fokus) · Abstands-, Typo-, Radius-, Höhen-, Schatten-, z-index- und Messlängen-Skalen aus vorhandenen Werten · ein Button-System (primär, sekundär, klein, Link, Icon, Gefahr, Schalter, Chip/Segment) mit Zuständen und Umbruchregeln · Felder inkl. Checkbox, Fehler und Hinweis · Karte, Tabelle (dicht, Wrapper, `thead`, Zahlenformate), KPI-Raster, Toast, ein Dialogmuster · Fokus-, Forced-Colors- und Datensparen-Regeln · unveränderte Feier-, Perlen- und Wallet-Welt.
