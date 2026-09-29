# La Perlé Designsystem · Fassung 4 – Spezifikation

Stand 29.09.2026 · **Auf dem Branch `claude/design-system-extraction-mmqyeb` in alle sechs Seiten eingebettet, noch nicht live** (die offenen Entscheidungen in I sind mit den umgesetzten Werten angenommen und bleiben änderbar). Fassung 4 ersetzt „MIDNIGHT PRIVÉ Fassung 3“ ([`midnight-prive-fassung-3.css`](midnight-prive-fassung-3.css), 621 Z., md5 `4232834a3388a1c34011a142b07110f7`) zwischen denselben Markern `/* MP-DESIGN-START */` und `/* MP-DESIGN-END */`. Auf `main` (live) tragen die Seiten bis zum Zusammenführen weiterhin Fassung 3. Einstieg und Befehle: [README](README.md). Zustand vor Fassung 4 und Befunde: [Bestandsaufnahme Fassung 3](bestandsaufnahme-fassung-3.md).

**Grundlage:** Drei Entwurfsvarianten wurden in den Prüfungen Marke, Technik und UX bewertet. Gerüst ist die Variante mit der höchsten Gesamtsumme (115.5 von 150: Marke 39, Technik 40, UX 36.5) und dem besten Technikergebnis. Übernommen sind die Markenregeln der Variante mit dem besten Markenergebnis und die Service-Regeln der Variante mit dem besten UX-Ergebnis. Behoben sind alle Befunde und K.-o.-Mängel, die bei der Prüfung nachgewiesen wurden (Abschnitt „Entscheidungen“). Varianten und Prüfberichte sind Arbeitsunterlagen und liegen nicht im Repository.

| Datei | Inhalt |
|---|---|
| `design/fassung-4-spezifikation.md` | diese Spezifikation (Entscheidungen, A–I) |
| `design/tokens.json` | Token in der Artefakt-Grammatik: Themen `dark` „Midnight Privé“ (Rückfall) und `light` „Perle“, 122 Farbtoken, 215 weitere Token in spacing/radius/shadow und 10 Zusatzfamilien, 33 Schriftstile, 7 Schriftdateien `fonts/…` |
| `design/laperle-designsystem.css` | der Block Fassung 4 von `/* MP-DESIGN-START */` bis `/* MP-DESIGN-END */` (Aufbau B.8) |
| `design/kontrastpaare.json` | die 144 Kontrastpaare der Tabelle C.7 (P001–P144, davon 3 Info; Text ≥ 4.5:1, UI ≥ 3:1), je Paar mit Mindestwert und Thema |
| `design/pruefen.py` | Freigabeprüfung ohne Netzwerk und ohne Abhängigkeiten: Grammatik von tokens.json, Gleichheit Token ↔ CSS je Thema, Vollständigkeit der `var()`, Abdeckung der Fassung-3-Selektoren, `--mp-*` in den Seitenresten, kein Grün, Kontrast |
| `design/einbetten.py` | prüft bzw. schreibt den Block in allen sechs Seiten (md5-Vergleich) |
| `design/midnight-prive-fassung-3.css` | Fassung 3 wörtlich, Bezug aller `mp:N` |
| `design/bestandsaufnahme-fassung-3.md` | Bestandsaufnahme Fassung 3 mit den Befunden H/M/L |
| `design/styleguide.html` | lebender Styleguide zu Fassung 4 (folgt) |

„Artefakt-Grammatik“ bezeichnet das Tokenformat von `design/tokens.json` (Familien, Themen, Aliase `{…}`, Schriftstile, Schriftdateien), wie es das Design-System-Artefakt liest und zu CSS kompiliert (B.6). Token, Paarliste, Regelzerlegung von Fassung 3 und Migrationstabelle H.3 wurden mit Arbeitsskripten erzeugt, die nicht im Repository liegen. Maßgeblich im Repository sind `design/tokens.json` als Wertequelle und `design/pruefen.py` als Prüfung.

**Prüfbilanz der Entwurfsprüfung (per Skript, nicht geschätzt):**
- **Kontrast:** Paare: 144 (davon 3 Info) · bewertete Prüfungen (Paar × Thema): 272 · FAIL: 0 → ALLE PASS
- **Grün:** Grün-Prüfung (OKLCH C ≥ .02, h 95–185°) über 122 Token × 2 Themen: 0 Treffer
- **Grammatik:** Farbtoken 122 · weitere Token 215 in 10 Familien (+spacing/radius/shadow) · Stile 33 in 5 Gruppen · Fehler: 0 (strenge Grammatikprüfung; eine zweite, unabhängige Grammatikprüfung: 0 Probleme)
- **Abdeckung Fassung 3:** 438 Regeln in 60 Gruppen, jede genau einmal; 203 von 203 Klassen und 4 von 4 IDs der Fassung 3 stehen in der Tabelle; fehlend: keine.

Im Repository wiederholt `python3 design/pruefen.py` diese Prüfungen gegen `design/laperle-designsystem.css`, `design/tokens.json` und `design/kontrastpaare.json`; der Rückgabewert ist nur 0, wenn alles besteht. Die Schwellen der Grünprüfung stehen im Skript.

Quellenkürzel: `mp:N` = Zeile in `design/midnight-prive-fassung-3.css`; `club:N`, `T:N` (terminal), `B:N` (backend), `recht:N` = Seitenzeilen (Stand 29.09.2026); H1–H11, M1–M28, L1–L16 = Befunde der Bestandsaufnahme §8. „Bestandsaufnahme §x“ verweist auf Abschnitte von `design/bestandsaufnahme-fassung-3.md`.

---

## Entscheidungen

Jeder Konflikt, den die drei Prüfungen (Marke, Technik, UX) festgestellt haben, und wie Fassung 4 ihn löst. „K.-o.“ bezeichnet einen Mangel, der eine harte Regel verletzt. In diesem Abschnitt meint „Variante“ eine der drei geprüften Entwurfsvarianten, „Gerüst“ die als Grundlage gewählte.

| # | Konflikt / geprüfter Befund | Quelle | Entscheidung Fassung 4 |
|---|---|---|---|
| E01 | Welches Gerüst? Jede der drei Prüfungen bewertete eine andere Variante am besten. | Prüfung Marke, Technik, UX | **Gerüst ist die Variante mit der höchsten Gesamtsumme**, weil sie die sauberste Kompatibilität mitbringt (Abbildung aller 203 Klassen, Alias-Neuberechnung, Druck-Inseln). Die Markenregeln kommen aus der Variante mit dem besten Markenergebnis, die Service-Regeln aus der Variante mit dem besten UX-Ergebnis. |
| E02 | Primärfläche im Hellen: Zwei Varianten nehmen Tiefgold `#7C6029` mit Crème-Text, eine behält Champagner. | Prüfung Marke | **Die Champagner-Pille bleibt in beiden Themen.** Hell hat die Fläche `#E2CFA6`, Text `#2E211B` (10.16:1) und eine 1-px-Goldkante `#907036` (4.03 auf der Seite, 4.50 auf der Karte). Es gibt drei Goldrollen: Text `#7C6029`, UI-Marke `#907036`, Deko `#B49153` (nur Logo und Ornament). |
| E03 | Button-Radius: 999px, 28px oder 30px (je eine Variante). | Prüfung Marke, UX | **28px (`--lp-radius-action`) für jeden Button.** Einzeilig ergibt das bei 44/48/56px eine Pille, mehrzeilig eine weiche 28-px-Ecke statt einer Riesenkapsel. Der Radius hängt nie vom Zustand ab. |
| E04 | K.-o. (Gerüst): `.featured-reward` und `.door.auf` sind fokussierbare Nacht-Inseln, ihr Ring `#DFBE95` liegt auf Crème (1.41–1.72:1). | Prüfung Technik | **Inseln sind nur nicht fokussierbare Behälter:** `.member`, `.mp-feier`, `.scanbox`. Prämie und Tür folgen dem Thema und haben hell einen Crème-Verlauf. Alle Ringe liegen auf Gründen mit ≥ 3:1 (C.7, Gruppe E/I/J). |
| E05 | K.-o. (eine Variante): Datensparen löst den ganzen Reduced-Motion-Satz aus und stoppt damit Spinner, Toast und Feier. K.-o. (eine andere Variante): `transform:none` lässt gewählte Perlen fallen, und die Prämienperle springt auf 0°. | Prüfung Marke, Technik, UX | **`html[data-saver="on"]` schaltet nur optionale Bewegung ab** (Kartenglanz, Perlen-/Prämien-Hub, GSAP/ScrollTrigger laden). Die Ruhelage bleibt: `rotate(-15deg)`. Gewählte Perlen bleiben angehoben, weil nur `:not([aria-pressed="true"]):hover` betroffen ist. Spinner, Toast, Fortschritt, Glücksrad und Feier bleiben (F.11). |
| E06 | K.-o. (eine Variante): Der native `.mp-admin-dialog` bekommt eine Einblendung `mp-ebene 400ms`, die es in Fassung 3 nicht gibt. | Prüfung Marke, UX | **Der native Dialog bleibt ohne Einblendung.** Das Sheet behält `mp-ebene .4s` (wertgleich). Das gemeinsame Muster betrifft Fläche, Maße, Scrim und Verhalten, keine Bewegung. |
| E07 | K.-o. `.linkfeld code` (eine Variante) und K.-o. `#who` (Gerüst): `text-overflow:ellipsis` schneidet Inhalte ab. | Prüfung Marke, Technik, UX | **Keine Ellipse, kein `nowrap` an Textträgern.** Das Link-Feld bricht mit `overflow-wrap:anywhere` in einer Feldbox um, der Name in der Markenleiste ebenso; `.user` darf umbrechen und bleibt rechtsbündig (G.2, G.8). |
| E08 | Druck: In zwei Varianten landet der Mitgliedstext `#FAE8DE` auf Papier (1.19:1); `member-muted` erreicht in allen Varianten nur 1.82:1. | Prüfung Technik | **Der Druck setzt den Perle-Satz auch in den Inseln**, dazu `--lp-member-text:#3B2E1E` (13.16:1) und `--lp-member-muted:#6E5C44` (6.41:1), `.member` ohne Verlauf (G.18). |
| E09 | Fehler aus Fassung 3, von allen Varianten geerbt: `a:hover` (0,1,1) färbt `a.btn`/`a.main-action` auf 1.46:1. | Prüfung Technik | **Die Button-Hover-Regel setzt die Farbe selbst** und hat die Spezifität (0,3,0). Geprüft ist das über Paar P051 (Text und Fläche gefiltert, 9.99 / 11.50). |
| E10 | Hell-Warnung: Siena `#A14206` (eine Variante) ist der lauteste Ton und liegt außerhalb der Goldfamilie. | Prüfung Marke | **Bernstein `#8A4B12`** (h 56.6°, in der Gold-/Crème-Familie): 5.94 auf der Seite, 6.63 auf der Karte, 5.51 auf der Warn-Tönung. |
| E11 | Gehobene Fläche hell: Eine Variante setzt `surface-2 #EFE5D4` dunkler als die Seite, die Hebung kippt. | Prüfung Marke | **`--lp-surface-raised` ist hell `#FFFCF7`** und hebt sich über `--lp-shadow-2` ab. Keine Fläche ist dunkler als die Seite. |
| E12 | Mitgliedskarte und Logo: Zwei Varianten ändern Padding 22 → 24, Innenrahmen 11 → 10 und das Logo-Fenster 54 → 56. Die dritte lässt alles wertgleich (Kritik der UX-Prüfung: „nicht uniform“). | Prüfung Marke gegen Prüfung UX | **Mitgliedskarte, Bühne und Logo-Ausschnitt sind Material und bleiben wertgleich:** `22px 22px 16px` (≤ 480: `20px 16px 14px`), Innenrahmen 11px, Saldo-Abstand 22px, Fenster 140×54. Die Regel „einheitliche Innenabstände“ gilt für das UI-System. Material ist als Ausnahme dokumentiert (E.3). `.reward-copy` ist ein Textbaustein und kommt auf die Skala (16px). |
| E13 | Das Gerüst lässt `filter` aus der Button-Transition weg, dadurch springt der Bühnen-Hover. | Prüfung Marke | **Die Transition-Liste ist wertgleich mit mp:122–123:** `filter`, `background`, `border-color`, `box-shadow`, je 160ms `--lp-ease`. Hover und Aktiv bleiben `brightness(1.08/.94)`. |
| E14 | KPI: Die Regeln aller drei Varianten erzeugen Waisen (4+1/3+1 bzw. eine gestreckte Einzelkachel) oder Überlauf („12.400,50 €“ = 183px bei 32px, 162px bei 28px; Kachelinhalte 146–176px). | Prüfung Technik, UX | **Container-Regel (G.5):** `.metrics` ist ein Inline-Size-Container, die Spaltenzahl folgt seiner Breite (2 ab 448px, 3 ab 680, 4 ab 912, 5 ab 1144) und der Anzahl der Kacheln. Jede Schwelle garantiert einen Kachelinhalt von ≥ 184px. Es gibt keine einzelne Kachel in der letzten Reihe, ungerade Mengen bekommen eine breite erste Kachel. |
| E15 | NPS bei 320px: Zwei Varianten brechen 5+5+1 um. | Prüfung UX | **Raster `repeat(6,minmax(44px,1fr))`, Abstand 6px (< 360: 4px):** 6×44+5×4 = 284 ≤ 288px. Das ergibt immer zwei Reihen, 6+5. |
| E16 | Eine Variante: Im Zeitraum-Filter stehen Felder mit 48 neben Chips mit 44, und Tabellenfelder mit 48 neben Zellbuttons mit 44. | Prüfung UX | **Eine Kontrollhöhe je Reihe, auch für Felder:** `.filter`, Tabellenzellen, `.section-title`, `.unklar`, `#offenListe` und `.brandbar` setzen sm 44 für Buttons und Felder (Schrift 16px). |
| E17 | Alle drei Varianten: `align-items:stretch` setzt Nicht-Controls (z. B. „Schnell:“) ≈ 12px zu hoch. | Prüfung UX | **Nicht-Controls in Reihen werden zentriert** (`align-self:center`, R6). |
| E18 | Eine Variante: H9 (Terminal ≤ 768) ist nur als Seitenrest-Diff gelöst, der Seitenrest gewinnt (94px Überlauf). | Prüfung UX | **Die Korrektur steht im Block:** `.terminal .terminal-spalten{align-items:stretch}` (0,2,0) schlägt den Seitenrest (0,1,0), ohne ihn zu ändern. |
| E19 | Statuszeichen: ✓ ⚠ ✕ fehlen in Jost und Cormorant (Rückfall auf Emoji). Zwei Varianten nutzen für Fehler ✕, das wie „Schließen“ aussieht. | Prüfung UX | **SVG-Masken in `currentColor`:** ✓ (Pfad `i-check`), Warndreieck und für Fehler ein **!-Kreis**, nie ✕. Dazu gibt es immer ein Wort. |
| E20 | Kontext: Eine Variante hat eine Dichte für alle drei Kontexte. | Prüfung UX | **Dichte-Modi Komfort/Theke/Dicht** über die vorhandenen Klassen `body.terminal`/`body.admin`, ohne neues Markup und nie unter 44px (G.0). |
| E21 | Eine Variante: Die Aussage „Toast 900 über Dialog 800“ stimmt nicht für `<dialog>.showModal()`, weil der Dialog im Top Layer liegt. | Prüfung UX | **Top-Layer-Regel:** Solange ein nativer Dialog offen ist, erscheint die Rückmeldung als `.hinweis` im Dialog, nicht als Toast (F.5). |
| E22 | Bühnenbutton: gerendert 54px, die Varianten setzen 48 oder 52. | Prüfung Marke | **Systemstufe lg 56px** (2px Abweichung statt 6). Inline-Bühne sm 44 (vorher 46). Alle anderen Bühnenwerte sind eingefroren. |
| E23 | Ziffernblock und Schrittziffern in Jost (eine Variante) oder Cormorant (zwei Varianten, 27px). | Prüfung Marke | **Cormorant 400 26px mit `lining-nums tabular-nums`** (Fassung-3-Größe). Schrittziffer Cormorant 500 16px lining. |
| E24 | Fortschrittsspur 3 → 4px oder 6px (je eine Variante): stille Materialänderung. | Prüfung Marke | **3px wertgleich**, Spur jetzt sichtbar über `--lp-line` (Füllung 5.21 / 3.19:1 gegen die Spur). |
| E25 | Token-Grammatik: `type.families` wird zu `--font-<key>` kompiliert, keine der Varianten trifft die CSS-Namen. Im Gerüst ist `lp-font-display` mit `'` außerhalb des Zeichensatzes; Font-Pfade stehen nicht unter `fonts/`. | Prüfung Technik | **Die Familienschlüssel `display`/`ui` erzeugen `--font-display`/`--font-ui`, und genau diese Namen nutzt das CSS.** `--mp-heading`/`--mp-body` zeigen darauf. Schriftdateien heißen `fonts/CormorantGaramond-*.ttf` und `fonts/Jost-*.ttf`. |
| E26 | `text-subtle` fällt in allen Varianten auf Tönungen unter 4.5:1 (3.1–4.4). | Prüfung Technik | **Nutzungsregel im Token:** nur auf `lp-bg`, `lp-surface`, `lp-surface-raised`, `lp-field`. Hell ist es ein Alias auf `lp-text-muted`, weil es keinen dritten AA-Grauwert gibt. Dunkel `#AB918E` (4.72–5.89). |
| E27 | Eine Variante: Alpha-Tönungen über geschachtelten Gründen brechen, z. B. eine Pill in einer gehoverten Zeile mit 4.41:1. | Prüfung Technik | **Alle Tönungen (`-soft`) sind opak.** Dunkel: Tonwert 14 % über `lp-surface`; hell: 40 % des Pastellwerts über `#FFFCF7`. Der Kontrast hängt damit nicht mehr vom Untergrund ab. |
| E28 | Das Gerüst legt `#E0BE98→#DFBE95` und `#FAE8DE→#F6E9DF` zusammen („nicht exakt“). | Prüfung Technik | **Dunkle Grundwerte bleiben exakt.** `--lp-accent-fill #E0BE98` und `--lp-member-text #FAE8DE` sind eigene Rollen (Text-Akzent ≠ Fläche, L1 über Rollentrennung gelöst). |
| E29 | `body{overflow-x:hidden}` wird sofort entfernt bzw. durch `clip` ersetzt (je eine Variante). | Prüfung Technik | **Die Regel bleibt**, bis die Prüfung bei 320/360/390 `scrollWidth − innerWidth = 0` auch ohne sie zeigt (H.7 Nr. 3). Danach wird sie entfernt. |
| E30 | Eine Variante ändert R01-Aktionen und Wortlaut und schlägt „Perlen“ im Terminal vor. | Prüfung Marke, UX | **Wortlaut und fachliche Regeln bleiben unberührt.** `#unklar` zeigt weiter „Erneut senden“ / „Status prüfen“ / „Hinweis schließen – Buchungsstatus bleibt ungeklärt“. Die Terminal-Sprache ändert sich nicht. Fassung 4 regelt nur Form, Höhe und Umbruch. |
| E31 | Scrims mit 7px (Sheet) bzw. ohne Blur (Admin). | – | **Ein Scrim** `--lp-scrim` mit `blur(6px)`. Die Bühne behält `rgba(16,13,16,.86)` mit 6px. |
| E32 | z-index: Das Gerüst stellt „schwebend 300“ unter „Nav 200“, sodass ein Menü unter einem Chat-Knopf läge. | Prüfung UX | **Reihenfolge:** sticky 100 < schwebend 600 < Nav 700 < Sheet 800 < Toast 900 < Bühne 1000, dazu Konfliktregeln (F.5). |
| E33 | Heatmap: Alphabänder (eine Variante) oder fünf Stufen (zwei Varianten), Legende je Thema (eine Variante). | Prüfung UX, Technik | **Fünf feste Stufen mit eigener Zahlenfarbe je Stufe und Thema** (≥ 5.14:1). Die Legende ist themenneutral: „Je kräftiger der Goldton, desto mehr Besuche.“ |
| E34 | Glücksrad: Die dunklen Segmente zweier Varianten trennen nur mit 1.14 bzw. 1.37:1, die dritte nutzt helle Champagnersegmente. | Prüfung Technik | **Dunkle Segmente `#3F2B30`/`#4C3238` mit 2-px-Trennlinien und Außenring in `#DFBE95`** (7.46 / 6.56:1). Es gibt keine helle Fläche im Dunkel. |
| E35 | Spinner für alle Button-Varianten: neue Verwendung einer Animation? | – | **Ja, als Ladezustand.** `mitSperre()` setzt `.laedt` schon heute auf `.secondary`, `.linkbtn` und Wallet (M9). Der bestätigte Spinner `mp-dreh .8s` gilt dort wertgleich. Keyframes und Werte sind unverändert, dekorative Bewegung kommt nicht hinzu. |
| E36 | Versal-Laufweiten: Das Gerüst setzt alles auf .12em, auch `th`. | Prüfung Marke | **Zwei Werte:** `.12em` für Eyebrow/Rang/Gruppe, `.06em` für dichte Versalien (`th`, Statuswort in Listen). Die Bühne behält `.22em`. |
| E37 | Adventskalender: Die Inhaberin wünscht ausdrücklich den neuen Kalender aus `origin/design/relaunch` (Stand 21.09.2026) – Bogentüren mit zwei Flügeln, gravierte Fächer links/rechts, Bogenkasten und Öffnungsbewegung. | Wunsch Inhaberin | **Übernommen und auf Fassung 4 abgebildet (G.11).** Farben laufen über die Rollen (`--lp-surface`, `--lp-bg`, `--lp-text`, `--lp-text-muted`, `--lp-border-control`, `--lp-accent-mark`, `--lp-line`), beide Themen, Fokus = Systemring. Die Regel „keine neuen Animationen“ (A, Regel 12) ist **nur für diese Öffnung** aufgehoben: vier neue Keyframes mit den Relaunch-Namen `lp-open-left`, `lp-open-right`, `lp-gift-rise`, `lp-door-number`, Werte zeichengleich (Flügel 1450 ms, Gewinn 1750 ms, Zahl 600 ms linear, Kurve `cubic-bezier(.22,1,.36,1)` = `--lp-ease`, Neuladen nach 1850 ms). Die 13 bestehenden Keyframes bleiben unverändert. Reduzierte Bewegung (System und `data-motion="reduced"`) zeigt sofort den Endzustand; Datensparen lässt die Öffnung laufen (Rückmeldung auf eine Handlung). Radien 80/80/24/24 (Kasten) und 30/30/4/4 (Tür) sind Markenmaterial wie die Mitgliedskarte. |

---

## A. Leitprinzipien

| # | Prinzip | Prüfbare Folge in Fassung 4 |
|---|---|---|
| A1 | **Die Schrift ist das Schmuckstück.** Cormorant Garamond trägt die Momente, Jost trägt die Arbeit. | Cormorant nur für h1–h3, Saldo, Betrag, Pad, Prämien- und Zieltitel, Signatur, Tür und Schrittziffer. Jost für alles Bedienbare, für Tabellen und Kennzahlen. Nur geladene Schnitte (Cormorant 400/500/600, kursiv 400/500; Jost 400/500), `b,strong{font-weight:500}`, `font-synthesis:style`. Ablesezahlen `lining-nums tabular-nums`, Ziffern im Satz Mediäval. |
| A2 | **Champagner wie Schmuck.** Gold bedeutet Handlung, Ort oder Fokus, nie Status. | Pro Aktionsreihe höchstens eine Champagnerfläche. Die Primärpille ist in beiden Themen Champagner (`#E0BE98` / `#E2CFA6`). Hell gibt es drei Goldrollen: Text `#7C6029`, UI-Marke `#907036`, Deko `#B49153`. Statt sechs Alphastufen gibt es eine Akzent-Tönung `--lp-accent-soft`. |
| A3 | **Material bleibt Material.** Mitgliedskarte = Lackobjekt, Perle = Perlmutt, Bühne = Nacht. | `.member`, `.mp-feier` und `.scanbox` sind Nacht-Inseln: Sie deklarieren den dunklen Satz selbst und bleiben in beiden Themen dunkel. Perlmutt-Rezepte, Kette, Bühne, Logo-Ausschnitt und Mitgliedskarten-Geometrie bleiben wertgleich. Im Dunkel gibt es keine weiße Zwischenfläche (Wallet-UA-Buttons und helle Radsegmente entfallen). |
| A4 | **Haarlinie statt Kasten.** Tiefe entsteht aus Tonstufen und 1-px-Linien. | Drei Linien: `--lp-line-soft` (Zeile, Leiste), `--lp-line` (Trenner, Spur) und `--lp-border-control` (nur Controls, ≥ 3:1). Rahmen nur 1/2/3px. Warme Schatten (dunkel `rgba(16,13,16,…)`, hell Legacy-Braun `rgba(58,42,23,…)`), Perlmutt-Haarlicht `--lp-shadow-lustre`. |
| A5 | **Ein Maß für alles.** Wenige Stufen, überall dieselben. | Abstand 4/8/12/16/20/24/32/48 (+ Haarfuge 2), Rhythmus 8/16/24/32, Karte 24 (< 481: 20; Verwaltung 20), Kachel 16, Meldung 12/16, Kontrollhöhen 44/48/56, Gutter 16/20/32, Radien 3/12/18/28 + Pille + Kreis. |
| A6 | **Eine Handlung, eine Form.** Jeder Button gehört zur selben Familie. | Eine Basisregel, Varianten und Größen setzen nur private `--_*`-Variablen. Die Höhe kommt aus `min-height` mit `padding-block:8px` und `line-height:1.25`. In Reihen gilt `align-items:stretch` mit einer Größe je Reihe. Mehrzeilige Labels ziehen die Nachbarn mit, statt sie zu versetzen. |
| A7 | **Status spricht mit Zeichen und Wort, nie grün.** | ok = Diamant `#D1E2EC` / `#203342` mit ✓, Warnung = Bernstein mit Dreieck, Fehler = Rosé/Weinrot mit !-Kreis. Die Zeichen sind SVG-Masken in `currentColor`. Grün-Prüfung über 122 Token × 2 Themen: 0 Treffer. |
| A8 | **Bewegung ist bestätigt, nicht erfunden.** | Keine neuen Keyframes, keine neuen Animationen. Alle 13 `@keyframes` sind zeichengleich, jede Dauer und Kurve läuft als Token mit identischem Wert. Reduced Motion ist unverändert, dazu kommen der In-App-Schalter `data-motion` und der Datensparen-Schalter `data-saver`, der nur optionale Bewegung abschaltet. |
| A9 | **Länger darf nicht kaputt heißen.** DE/EN/RU mit +30–40 % Text. | Keine festen Breiten an Textträgern, kein `nowrap` außer an Zahlen, keine Ellipse, kein Text in CSS `content`. Kopfzeilen dürfen umbrechen, Sidebar 200px, Toast in voller Mobilbreite, Tabellen scrollen in ihrer Karte. |
| A10 | **Kompatibel bis zum letzten Selektor.** | Alle 438 Regeln, 203 Klassen und 4 IDs aus Fassung 3 bleiben gestylt (H.3). Alle 30 `--mp-*` lösen auf, je Thema und je Insel neu berechnet. Der Block ersetzt den alten zwischen denselben Markern. |

---

## B. Token-Architektur & Benennung

### B.1 Ebenen

| Ebene | Präfix / Muster | Inhalt | Wo definiert | in tokens.json |
|---|---|---|---|---|
| 1 Rolle (themenabhängig) | `--lp-<rolle>` | 36 Farbrollen (C.2): Grund, Fläche, Text, Linie, Akzent, Status, Tönung, Scrim, Fokus, Prämie; dazu 10 Heat-Stufen (C.3) | Themenblöcke B.3 (dunkel = Rückfall), auch auf den Inseln | ja, je Thema ein Wert oder ein Alias `{…}` |
| 2 Material (themenfest) | `--lp-member-*`, `--lp-pearl-*`, `--lp-artpearl-*`, `--lp-stagepearl-*`, `--lp-stage-*`, `--lp-scan-frame`, `--lp-wheel-*`, `--lp-rank-*`, `--lp-chain` | Werte der bestätigten Objekte, in beiden Themen gleich (Fassung-3-Werte) | `:root` | ja, beide Themen gleicher Wert |
| 3 Skala | `--lp-space-*`, `--lp-rhythm-*`, `--lp-pad-*`, `--lp-gutter-*`, `--lp-gap-*`, `--lp-radius-*`, `--lp-shadow-*`, `--lp-fs-*`, `--lp-lh-*`, `--lp-track-*`, `--lp-fw-*`, `--lp-control-*`, `--lp-z-*`, `--lp-dur-*`, `--lp-ease*` … | Maße ohne Thema (Schatten je Thema) | `:root` | ja: spacing, radius, shadow + 10 Zusatzfamilien |
| 4 Schrift | `--font-display`, `--font-ui` | Familienstapel | `:root` | ja: `type.families` mit den Schlüsseln `display`/`ui`, das Artefakt kompiliert zu `--font-<key>` |
| 5 Laufzeit | `--lp-gutter`, `--lp-pad`, `--lp-member-gradient`, `--lp-reward-gradient`, `--_select-arrow`, `--_glyph-ok/-warn/-danger`, `--_toast-offset` | aus Ebene 1–3 zusammengesetzt (je Umbruch, Verlauf, Data-URI) | `:root`, Themenblöcke, Medienabfragen | nein (B.7) |
| 6 Bauteil (privat) | `--_*` (z. B. `--_h`, `--_bg`, `--_fg`, `--_bd`, `--_n`) | Stellschrauben, die eine Variante setzt; Regeln lesen nur diese | am Bauteil-Selektor | nein; nie außerhalb des Bauteils lesen |
| 7 Kompatibilität | `--mp-*` (30) | Aliase auf Ebene 1–4 | Alias-Block B.5 | Farbaliase als `{lp-…}`, Radius/Dauer/Kurve gespiegelt |

### B.2 Namensregeln

- Form `--lp-<rolle>[-<variante>][-<stufe>]`, nur Kleinbuchstaben, Ziffern und Bindestrich, ≤ 64 Zeichen, eindeutig über alle Familien. **tokens.json-Name = CSS-Name ohne `--`** (`lp-accent-fill` ↔ `--lp-accent-fill`). Einzige Ausnahme sind die Schriftfamilien: Schlüssel `display` → `--font-display`, so wie das Artefakt kompiliert.
- Farbe wird nach Rolle benannt, nicht nach Ton (`--lp-accent`, nicht `--lp-gold`). Material nach Objekt (`--lp-member-*`, `--lp-stage-*`). Schriftgrößen heißen `--lp-fs-<px>`, Zeilenhöhen `--lp-lh-<rolle>`, Laufweiten `--lp-track-<rolle>`. Schriftstile (Klassen) heißen `.lp-t-*`.
- Private Bauteilvariablen beginnen mit `--_` und stehen nie in tokens.json oder in Seiten.
- Deutsche Klassennamen bleiben (`.aktionen`, `.leer`, `.laedt`, `.hinweis`), neue Hilfsklassen sind ebenfalls deutsch (`.akzent`, `.einlass`, `.feldfehler`, `.check`, `.ende`, `.dicht`, `.klickbar`).

### B.3 Themenumschaltung (exakt)

```css
/* 1b  Midnight Privé – Standard, explizit dunkel und Nacht-Inseln (erstes Thema = Rückfall) */
:root,[data-theme="dark"],.member,.mp-feier,.scanbox{
  color-scheme:dark;
  --lp-bg:#21191A; --lp-surface:#302327; /* … alle themenabhängigen Rollen und Heat-Stufen, Spalte „Midnight Privé“ in C.2/C.3 */
  --_select-arrow:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23DFBE95' stroke-width='1.6'/%3E%3C/svg%3E");
}
/* 1c  Perle – steht NACH 1b (gleiche Spezifität 0,1,0 gewinnt durch Reihenfolge) */
[data-theme="light"]{
  color-scheme:light;
  --lp-bg:#F6EFE3; --lp-surface:#FFFCF7; /* … Spalte „Perle“ in C.2 */
  --_select-arrow:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%237C6029' stroke-width='1.6'/%3E%3C/svg%3E");
}
/* 1b' Schatten je Thema – ohne Inseln (dort erbt z. B. .member den Hellwert von --lp-shadow-object) */
:root,[data-theme="dark"]{ --lp-shadow-1:none; --lp-shadow-2:0 14px 34px rgba(16,13,16,.6); /* … Familie shadow, Spalte dunkel (F.3) */ }
[data-theme="light"]{ --lp-shadow-1:0 1px 2px rgba(58,42,23,.06); /* … Spalte hell */ }
/* 1d  Systemfolge – nur wenn die Seite data-theme="auto" setzt */
@media (prefers-color-scheme:light){ [data-theme="auto"]{ /* identisch 1c und Schatten hell */ } }
/* 1e  Druck = Perle auf Papierweiß, auch in den Inseln */
@media print{
  :root,[data-theme],.member,.mp-feier,.scanbox{
    color-scheme:light; /* identisch 1c (Rollen und Schatten hell), dann: */
    --lp-bg:#FFFFFF; --lp-surface:#FFFFFF; --lp-surface-raised:#FFFFFF; --lp-field:#FFFFFF; --lp-selected:#FFFFFF;
    --lp-member-text:#3B2E1E; --lp-member-muted:#6E5C44;
  }
}
```

- `data-theme` sitzt auf `<html>`. Ohne Attribut sind Club, Terminal und Verwaltung dunkel wie heute. Ein Unterbaum darf `data-theme` tragen, weil jedes Thema vollständig deklariert.
- Den Hell-Satz gibt es dreimal (1c, 1d, 1e), weil CSS Deklarationsblöcke nicht teilen kann. Alle drei Kopien stammen aus derselben Quelle (`design/tokens.json`). `design/pruefen.py` vergleicht die Themenblöcke dunkel (1b) und hell (1c) mit tokens.json; die Kopien in 1d (auto) und 1e (Druck) werden bei jeder Farbänderung mitgezogen.
- Seitenseitig (je Bereich ein eigener Diff, H.6): Das Attribut kommt aus einer Geräteeinstellung (`localStorage` in `try/catch`), dazu `<meta name="theme-color">` je Thema (`#21191A` / `#F6EFE3`). **Hell wird erst freigeschaltet, wenn die Seitenreste migriert sind** (H.6 „Voraussetzung Perle“).

### B.4 Nacht-Inseln

`.member`, `.mp-feier` und `.scanbox` stehen in der Selektorliste von 1b. Sie deklarieren dort die dunklen Rollen am eigenen Element und schlagen damit das geerbte Hellthema. Deshalb liegen Fokusring und Rang-Icon auf der Lackkarte auch im Perle-Thema bei `#DFBE95` (5.71–9.29:1, C.7 Gruppe I), die Bühne bei 10.98:1 (Gruppe J).

Inseln sind **ausschließlich nicht fokussierbare Behälter**. Fokussierbare Elemente in einer Insel (Perlen-Buttons mit Versatz −2px innen, Bühnenbuttons, Bühnen-Schließen) zeichnen ihren Ring auf dem dunklen Inselgrund. `.featured-reward`, `.door.auf`, `.card-dark`, `.admin-bottom` und `.wheelwrap` sind keine Inseln: Ihr Ring liegt außen auf dem Seitengrund und muss dort ≥ 3:1 erreichen.

Schatten werden in Inseln nicht neu deklariert. Deshalb bekommt `.member` im Perle-Thema den Hellwert von `--lp-shadow-object` (Lackobjekt auf Papier).

### B.5 Kompat-Aliase und Komposita müssen auf denselben Selektoren stehen

Eine Custom Property mit `var()` wird am deklarierenden Element berechnet und dann **als fertiger Wert vererbt**. Stünde `--mp-accent:var(--lp-accent)` nur auf `:root`, trüge eine Insel auf einer hellen Seite `#7C6029` auf `#573A42` (1.71:1). Deshalb gilt:

```css
/* 1f  Kompatibilität + Laufzeit-Komposita – je Thema und je Insel neu berechnet */
:root,[data-theme],.member,.mp-feier,.scanbox{
  --mp-bg:var(--lp-bg); --mp-surface:var(--lp-surface); --mp-text:var(--lp-text); --mp-text-muted:var(--lp-text-muted);
  --mp-line:var(--lp-line); --mp-accent:var(--lp-accent); --mp-button-bg:var(--lp-accent-fill); --mp-button-text:var(--lp-on-accent);
  --mp-member-text:var(--lp-member-text); --mp-member-muted:var(--lp-member-muted); --mp-art:var(--lp-art); --mp-card:var(--lp-surface-raised);
  --mp-ok:var(--lp-ok); --mp-warn:var(--lp-warn); --mp-danger:var(--lp-danger);
  --mp-stage:var(--lp-stage); --mp-stage-gold:var(--lp-stage-gold); --mp-stage-rose:var(--lp-stage-rose);
  --mp-stage-text:var(--lp-stage-text); --mp-stage-muted:var(--lp-stage-muted);
  --mp-heading:var(--font-display); --mp-body:var(--font-ui);
  --mp-r-card:var(--lp-radius-l); --mp-r-control:var(--lp-radius-m); --mp-r-pill:var(--lp-radius-pill);
  --mp-ease:var(--lp-ease); --mp-t-hover:var(--lp-dur-hover); --mp-t-layer:var(--lp-dur-layer);
  --lp-member-gradient:radial-gradient(ellipse at 90% 50%, var(--lp-member-from) 0%, var(--lp-member-via) 55%, var(--lp-member-to) 100%);
  --lp-reward-gradient:linear-gradient(110deg, var(--lp-reward-from), var(--lp-reward-to));
  --mp-member-gradient:var(--lp-member-gradient); --mp-reward-gradient:var(--lp-reward-gradient);
}
```

Der Block selbst nutzt ausschließlich `--lp-*`, `--font-*` und `--_*`. Die `--mp-*` gibt es nur für Seitenreste, Inline-Stile und JS. Vollständige Abbildung mit Werten: H.2.

### B.6 tokens.json ↔ CSS

- **Kompilierung durch das Artefakt:** `:root,[data-theme="dark"]{--<farbe>;--<schatten>}`, `[data-theme="light"]{…}`, `:root{--<space>;--<radius>;--<weitere>;--font-<key>}`, eine Klasse `.<stil>` je Schriftstil, `@font-face` je Datei. Die Namen stimmen also 1:1 mit dem CSS des Blocks überein.
- Familien: `color` (2 Themen), `type`, `spacing`, `radius`, `shadow` und 10 Zusatzfamilien: `typeScale`, `controlHeight`, `size`, `measure`, `breakpoint`, `borderWidth`, `opacity`, `zIndex`, `duration`, `easing`. Es gibt keine Familie „motion“.
- Farbwerte sind nur Hex (auch 8-stellig für Material mit Alpha, byte-treu zu Fassung 3), `rgba()` oder Alias `{…}`. Verläufe, Data-URIs und `transparent` gibt es nur im CSS (C.6).
- `breakpoint` und `measure → lp-kpi-cols-*` dienen der Dokumentation, weil `@media`/`@container` keine `var()` lesen. Die Werte stehen literal in den Abfragen.
- Schriftstile: Zeilenhöhe in `%`, Laufweite in `em`, Gewicht als Zahl. Versalien setzt das CSS über `text-transform:uppercase` (die Grammatik kennt kein Transform-Feld; die Nutzung nennt es).
- Die Abschnitte 1a–1f (Skalen, Themen, Inseln, Druck, Kompat) entsprechen `design/tokens.json`, der Rest des Blocks ist handgeschrieben. `design/pruefen.py` prüft, dass jeder Farbtoken je Thema mit demselben Wert im CSS steht. Der wiederhergestellte Einbetter `design/einbetten.py` (Bestandsaufnahme §1.2) schreibt den fertigen Block unverändert in die Seiten (H.1); er erzeugt nichts aus tokens.json.

### B.7 Laufzeit-Variablen (nur CSS)

| Variable | Wert | Wo gesetzt |
|---|---|---|
| `--lp-gutter` | `var(--lp-gutter-xs)` 16px; `@media (min-width:360px)` `var(--lp-gutter-s)` 20px; `@media (min-width:769px)` `var(--lp-gutter-l)` 32px | `:root` |
| `--lp-pad` | `var(--lp-pad-card-sm)` 20px; `@media (min-width:481px)` `var(--lp-pad-card)` 24px | `:root` |
| `--lp-member-gradient`, `--lp-reward-gradient` | Komposita B.5 | Block 1f |
| `--_select-arrow` | Data-URI, Strich `%23DFBE95` (dunkel/Inseln) bzw. `%237C6029` (hell/Druck) | 1b–1e |
| `--_glyph-ok`, `--_glyph-warn`, `--_glyph-danger` | Masken-Data-URIs (C.4), schwarzer Strich, die Farbe kommt aus `currentColor` | `:root` |
| `--_toast-offset` | `0px`; schwebende Elemente unten setzen ihre Höhe + 16px | `:root` bzw. Seite |

### B.8 Aufbau des Blocks (Reihenfolge ist Teil der Spezifikation)

`/* MP-DESIGN-START */` · 0 Kopf „LA PERLÉ DESIGNSYSTEM – Fassung 4 (Datum)“ · 1a Skalen `:root` · 1b Midnight Privé + Inseln · 1c Perle · 1d auto · 1e Druck-Token · 1f Kompat/Komposita · 2 Grundschrift und Flächen · 3 Buttons · 4 Felder und Auswahl · 5 Karten, Tabellen, KPI, Meldungen · 6 Markenleiste, Navigation, Dialoge · 7 Club · 8 Terminal · 9 Verwaltung · 10 Feier (eingefroren) · 11 Druck · 12 Fokus, Forced Colors, reduzierte Bewegung, Datensparen · 13 Umbrüche · 14 `.mp-admin-dialog` · `/* MP-DESIGN-END */`. Die veralteten Kommentare mp:39–40 („8.9/9.6/7.2“) und mp:524 werden korrigiert (L4).

---

## C. Farbe

### C.1 Grundsätze

1. **Dunkel bleibt wertgleich**, wo nichts zu reparieren ist: bg, surface, raised (= `--mp-card`), text, muted, line, accent, accent-fill, on-accent, member-*, stage-*, art, reward-*, warn, danger.
2. **Neu nur mit Befund:** ok (Grün → Diamant, H1), Kontrollrand (H8), zurückhaltender Text (M4), opake Tönungen (M5, Prüfung), Scrim vereinheitlicht (M8). Zusätzlich neu sind hell die UI-Marke `#907036`, die Warnung `#8A4B12`, der Kontrollrand `#8A785F`, die Linie `#E4D5BB`/`#EADEC9` (Legacy-Linie auf Pearl bzw. Crème) und die Tönungen.
3. **Perle wächst aus der Crème-Linie** `#FFFCF7` / `#F6EFE3` / `#EFE5D4` / `#3B2E1E` / `#6E5C44` / `#7C6029` / `#E2CFA6`. `#B49153` ist im Hellen nie Text, Icon oder Bedienelement (2.88:1 auf Crème, Logo-Ausnahme).
4. **Einlass = Seitenton:** Felder tragen in beiden Themen die Seitenfarbe und wirken in Karten eingelassen (dunkel `#21191A` in `#302327`, hell `#F6EFE3` in `#FFFCF7`).
5. **Rollen trennen, nicht zusammenlegen:** `--lp-accent` (Text) und `--lp-accent-fill` (Fläche) sind dunkel fast gleich (1.00:1, L1) und bleiben trotzdem zwei Rollen, weil sie hell verschieden sind (`#7C6029` / `#E2CFA6`).
6. **Linie ≠ Rand:** `--lp-line`/`--lp-line-soft`/`--lp-card-edge` sind dekorativ und dürfen unter 3:1 liegen. Jede Grenze, die eine Bedienung erklärt, trägt `--lp-border-control` (≥ 3:1).
7. **Tönungen sind opak** und wurden je Thema gegen ihre Texte gerechnet. Ihr Kontrast hängt nicht vom Untergrund ab (Zeilen-Hover, Karte, Seite).
8. **Keine weiße Zwischenfläche im Dunkel.** Die hellsten dunklen Flächen sind Material (Mitgliedskarte `#573A42`, OKLCH-L 0.385) und die Tönungen (≤ 0.36). Hell sind nur Champagner-Aktionsflächen (Primärpille, Schalter an, gewählter Chip), die oberen Heat-Stufen und die Perlen (Material).

### C.2 Farbrollen (beide Themen, Werte = `design/tokens.json`)

| Token | Midnight Privé (dunkel) | Perle (hell) | Nutzung · Textgründe |
|---|---|---|---|
| `--lp-bg` | `#21191A` | `#F6EFE3` | Seitengrund html/body, theme-color (#21191A / #F6EFE3). Textgrund für lp-text, lp-text-muted, lp-text-subtle, lp-accent, lp-ok, lp-warn, lp-danger. |
| `--lp-surface` | `#302327` | `#FFFCF7` | Stufe 1: .card, .customer, .ziel, .sidebar, table th, .sheet .card, .dialog, .mp-admin-dialog, .pad button, .door, .consent-card, Heat-Stufe 0. Textgrund für alle Text- und Statusrollen. |
| `--lp-surface-raised` | `#3C272C` | `#FFFCF7` | Stufe 2: .toast/#toast/.note, .card-dark, .admin-bottom (hell gleiche Farbe + lp-shadow-2; nie dunkler als lp-bg). Textgrund für lp-text, lp-text-muted, lp-text-subtle, lp-accent, Statusrollen. |
| `--lp-field` | `{lp-bg}` → `#21191A` | `{lp-bg}` → `#F6EFE3` | Einlass = Seitenton: input, select, textarea, .search, .nps button, .list .item, .linkfeld code, .sw aus, .avatar.large, .card.einlass. Textgrund für lp-text (Wert), lp-text-subtle (Platzhalter), lp-text-muted, lp-accent. |
| `--lp-selected` | `{lp-bg}` → `#21191A` | `#EFE5D4` | Aktueller Navigationseintrag .sidebar button[aria-current="page"], .tabs gewählt (Fläche). Textgrund für lp-accent, lp-text, lp-text-muted – nicht lp-text-subtle. |
| `--lp-hover` | `rgba(33,25,26,.5)` | `rgba(124,96,41,.06)` | Hover-Schleier nur über lp-surface: .sidebar button:hover, tr.klickbar:hover td (komponiert #281E20 / #F7F3EB). Textgrund für lp-text, lp-text-muted, lp-accent. |
| `--lp-accent-soft` | `#483936` | `#F3EAD7` | Eine Akzent-Tönung, opak (dunkel #DFBE95 14 % über lp-surface, hell #E2CFA6 40 % über #FFFCF7): .pill neutral, .hinweis, Sekundär/Icon/Pad :active, gewählte Auswahlkarte, .mp-kurz. Textgrund für lp-text, lp-text-muted, lp-accent – nicht lp-text-subtle. |
| `--lp-scrim` | `rgba(16,13,16,.78)` | `rgba(59,46,30,.42)` | Ein Scrim für .sheet, .overlay, .mp-admin-dialog::backdrop (+ backdrop-filter blur 6px). Kein Textgrund. |
| `--lp-text` | `#F6E9DF` | `#3B2E1E` | Haupttext, Überschriften, Feldwert, Sekundärbutton-Label, Toast-Text. Liest auf lp-bg, lp-surface, lp-surface-raised, lp-field, lp-selected, lp-hover@lp-surface, lp-accent-soft, lp-ok-soft, lp-warn-soft, lp-danger-soft, lp-reward-from, lp-reward-to, Heat-Stufen laut lp-heat-ink-*. |
| `--lp-text-muted` | `#C6ABA8` | `#6E5C44` | Sekundärtext: label, .eyebrow, th, .small/.muted/.tiny, .lead, .hint, gedämpfte Icons (≥ 3:1), Schalterknopf aus. Liest auf denselben Gründen wie lp-text. |
| `--lp-text-subtle` | `#AB918E` | `{lp-text-muted}` → `#6E5C44` | Platzhalter (::placeholder), tertiäre Meta. Nur auf lp-bg, lp-surface, lp-surface-raised, lp-field – nie auf Tönungen (-soft), lp-hover oder lp-selected. Hell = lp-text-muted (kein dritter AA-Grauwert). |
| `--lp-line` | `#5A4242` | `#E4D5BB` | Trenner (dekorativ, < 3:1 erlaubt): hr, th-Unterkante, .customer-line, .switch, .reward-list .item, .legal, .booking-separator, .leer (gestrichelt), .metrics-Rahmen, .track-Spur. Nie Control-Rand, nie Text. |
| `--lp-line-soft` | `rgba(90,66,66,.55)` | `rgba(180,145,83,.2)` | Haarlinie (dekorativ): td-Unterkante, Markenleiste-Unterkante, .log .zeile, .zusammenfassung. Dunkel = Fassung-3-Wert (mp:190). |
| `--lp-card-edge` | `{lp-surface}` → `#302327` | `#EADEC9` | Kartenrand 1px (.card, .customer, .ziel, .sheet .card, .dialog): dunkel unsichtbar wie Fassung 3, hell Legacy-Linie als Papierkante. Dekorativ. |
| `--lp-border-control` | `#917777` | `#8A785F` | Rand jedes Controls: Feld, .search, Sekundär-/Icon-Button, .sw, .nps button, .pad button, .door, .list .item, .consent-card, .reg .plus .z; Farbe Stern aus. ≥ 3:1 gegen lp-bg, lp-surface, lp-surface-raised, lp-field, lp-selected, lp-hover@lp-surface. |
| `--lp-accent` | `#DFBE95` | `#7C6029` | Akzenttext: a, .linkbtn, aktive Navigation (Text/Icon), .reward-copy .ready, .frei .pts, .list .item.erreichbar .p, .board .ich, .terminal-reward, .pill neutral, Stern an, .needle. Liest auf lp-bg, lp-surface, lp-surface-raised, lp-field, lp-selected, lp-hover@lp-surface, lp-accent-soft, lp-reward-from, lp-reward-to. |
| `--lp-accent-mark` | `{lp-accent}` → `#DFBE95` | `#907036` | UI-Marke ≥ 3:1, nie Fließtext: .track-Füllung, Sekundär-/Icon-Hover-Rand, Navigationsmarke (inset 3px), Tabs-Unterstrich, .door.auf-Rand, .card.akzent-Rand, .bars div, accent-color Checkbox/Radio. Gegen lp-bg, lp-surface, lp-surface-raised, lp-field, lp-selected, lp-track. |
| `--lp-accent-fill` | `#E0BE98` | `#E2CFA6` | Champagner-Primärfläche in beiden Themen: .btn, .btn-gold, .main-action, Schalter an, Chip/NPS/.categories gewählt, [aria-pressed="true"]. Trägt nur lp-on-accent; hell zusätzlich Kante lp-accent-fill-edge. |
| `--lp-accent-fill-edge` | `{lp-accent-fill}` → `#E0BE98` | `{lp-accent-mark}` → `#907036` | Rand der Primärfläche und gewählter Chips/Schalter: dunkel = Fläche (unsichtbar), hell Goldkante #907036 (≥ 3:1 gegen lp-bg und lp-surface, trägt die Form). |
| `--lp-on-accent` | `#2E211B` | = dunkel (themenfest) | Text, Icon, Schalterknopf und Spinnerkopf auf lp-accent-fill (auch ×1.08 Hover und ×.94 Aktiv); Heat-Zahl Stufe 3/4 dunkel. |
| `--lp-link-underline` | `rgba(223,190,149,.45)` | `rgba(124,96,41,.45)` | Unterstreichung von a und .linkbtn (dekorativ; der Link unterscheidet sich zusätzlich durch lp-accent ≥ 4.5:1). |
| `--lp-focus` | `{lp-accent}` → `#DFBE95` | `{lp-accent}` → `#7C6029` | Der eine Fokusring (2px, Versatz 3px) auf lp-bg, lp-surface, lp-surface-raised, lp-field, lp-selected, lp-reward-from/-to, lp-accent-soft; in Inseln (.member, .mp-feier, .scanbox) #DFBE95. |
| `--lp-track` | `{lp-line}` → `#5A4242` | `{lp-line}` → `#E4D5BB` | .track-Spur (3px). Füllung lp-accent-mark ≥ 3:1 gegen diese Spur. |
| `--lp-spinner-track` | `rgba(223,190,149,.3)` | `rgba(124,96,41,.3)` | Spinnerspur (.laedt::after) auf transparenten Buttons; Kopf lp-accent bzw. lp-danger. |
| `--lp-spinner-track-on-accent` | `rgba(46,33,27,.3)` | = dunkel (themenfest) | Spinnerspur auf lp-accent-fill; Kopf lp-on-accent. |
| `--lp-ok` | `#D1E2EC` | `#203342` | Status ok/erledigt (Diamant aus palette.json, kein Grün) – nur mit ✓-Maske und Wortlaut. Liest auf lp-bg, lp-surface, lp-surface-raised, lp-ok-soft; Rand .list .item.gewinn. |
| `--lp-ok-soft` | `#473E43` | `#EDF2F3` | Grund ok (opak; dunkel 14 % über lp-surface, hell 40 % #D1E2EC über #FFFCF7): .pill.ok/.gut, .hinweis.ok. Trägt lp-ok, lp-text, lp-text-muted. |
| `--lp-warn` | `#E7C58A` | `#8A4B12` | Status Warnung/ungeklärt (R01) – nur mit ⚠-Maske und Wortlaut. Liest auf lp-bg, lp-surface, lp-surface-raised, lp-warn-soft; Rand .unklar, Balken .hinweis.warn. |
| `--lp-warn-soft` | `#4A3A35` | `#F5E6CB` | Grund Warnung (opak): .unklar, .pill.warn, .hinweis.warn. Trägt lp-warn, lp-text, lp-text-muted. |
| `--lp-danger` | `#F0A5AD` | `#8E2E36` | Status Fehler/Gefahr – nur mit !-Kreis-Maske und Wortlaut: .btn.gefahr (Text + Rand), .toast.err-Rand/-Zeichen, .feldfehler, [aria-invalid]-Rand, #ladeFehler. Liest auf lp-bg, lp-surface, lp-surface-raised, lp-danger-soft. |
| `--lp-danger-soft` | `#4B353A` | `#F9D9D9` | Grund Fehler (opak): .pill.fehler, .hinweis.fehler, .btn.gefahr Hover/Aktiv. Trägt lp-danger, lp-text, lp-text-muted. |
| `--lp-reward-from` | `#3F2B30` | `#FFFCF7` | Prämienverlauf Start (110deg): .featured-reward, .door.auf. Textgrund für lp-text, lp-text-muted, lp-accent. |
| `--lp-reward-to` | `#2B2023` | `#EFE5D4` | Prämienverlauf Ende. Textgrund für lp-text, lp-text-muted, lp-accent. |
| `--lp-art` | `#4C3238` | `#E2CFA6` | Prämienmotiv-Fläche .reward-art (Perle bleibt auf Champagner sichtbar). Kein Textgrund. |
| `--lp-orbit` | `#BA966D` | = dunkel (themenfest) | Orbitlinie 2px der Prämienperle .orbit (dekorativ, Opazität .5). |
| `--lp-paper` | `#FFFFFF` | = dunkel (themenfest) | Nur @media print: Papierweiß für lp-bg, lp-surface, lp-surface-raised, lp-field. Textgrund für die Perle-Textrollen. |

### C.3 Material, Heatmap, Glücksrad, Rang (themenfest, wo nicht anders angegeben)

| Token | Midnight Privé (dunkel) | Perle (hell) | Nutzung · Textgründe |
|---|---|---|---|
| `--lp-member-from` | `#573A42` | = dunkel (themenfest) | Mitgliedskarte Verlauf 0 % (radial ellipse at 90% 50%). Textgrund für lp-member-text, lp-member-muted; Fokus/Rang-Icon #DFBE95. |
| `--lp-member-via` | `#38242C` | = dunkel (themenfest) | Mitgliedskarte Verlauf 55 %. Textgrund für lp-member-text, lp-member-muted. |
| `--lp-member-to` | `#291C23` | = dunkel (themenfest) | Mitgliedskarte Verlauf 100 %. Textgrund für lp-member-text, lp-member-muted. |
| `--lp-member-text` | `#FAE8DE` | = dunkel (themenfest) | Text auf .member (Saldo, Rang); liest auf lp-member-from/-via/-to. Druck: #3B2E1E. |
| `--lp-member-muted` | `#D8B9B5` | = dunkel (themenfest) | Gedämpft auf .member (.head .eyebrow, .balance .sub, .foot); liest auf lp-member-from/-via/-to. Druck: #6E5C44. |
| `--lp-member-edge` | `#A17C6655` | = dunkel (themenfest) | Außenrand 1px .member (dekorativ). |
| `--lp-member-frame` | `#CBAE8029` | = dunkel (themenfest) | Innenrahmen .member::before (inset 8px, Radius 11px, dekorativ). |
| `--lp-member-rule` | `#DFC69C40` | = dunkel (themenfest) | Fußtrenner .member .foot (dekorativ). |
| `--lp-member-sheen` | `rgba(255,240,218,.13)` | = dunkel (themenfest) | Glanzband .member::after (lp-shine, nur hover:hover). |
| `--lp-chain` | `#C6A875` | = dunkel (themenfest) | Kettenlinie .necklace .chain (dekorativ). |
| `--lp-pearl-1` | `#FFFDF4` | = dunkel (themenfest) | Kettenperle .pearl::before, Verlaufsstopp 1 (0/15/38/67/89 %, circle at 31% 24%). |
| `--lp-pearl-2` | `#FAEFDF` | = dunkel (themenfest) | Kettenperle .pearl::before, Verlaufsstopp 2 (0/15/38/67/89 %, circle at 31% 24%). |
| `--lp-pearl-3` | `#E8D5C5` | = dunkel (themenfest) | Kettenperle .pearl::before, Verlaufsstopp 3 (0/15/38/67/89 %, circle at 31% 24%). |
| `--lp-pearl-4` | `#B8A3A0` | = dunkel (themenfest) | Kettenperle .pearl::before, Verlaufsstopp 4 (0/15/38/67/89 %, circle at 31% 24%). |
| `--lp-pearl-5` | `#F3E6D4` | = dunkel (themenfest) | Kettenperle .pearl::before, Verlaufsstopp 5 (0/15/38/67/89 %, circle at 31% 24%). |
| `--lp-artpearl-1` | `#FFFDF7` | = dunkel (themenfest) | Prämien-/Dialog-/Bottom-Perle, Verlaufsstopp 1 (0/19/48/75/96 %, circle at 28% 24%). |
| `--lp-artpearl-2` | `#F9EEDF` | = dunkel (themenfest) | Prämien-/Dialog-/Bottom-Perle, Verlaufsstopp 2 (0/19/48/75/96 %, circle at 28% 24%). |
| `--lp-artpearl-3` | `#DFCBBF` | = dunkel (themenfest) | Prämien-/Dialog-/Bottom-Perle, Verlaufsstopp 3 (0/19/48/75/96 %, circle at 28% 24%). |
| `--lp-artpearl-4` | `#A79595` | = dunkel (themenfest) | Prämien-/Dialog-/Bottom-Perle, Verlaufsstopp 4 (0/19/48/75/96 %, circle at 28% 24%). |
| `--lp-artpearl-5` | `#F3E9DC` | = dunkel (themenfest) | Prämien-/Dialog-/Bottom-Perle, Verlaufsstopp 5 (0/19/48/75/96 %, circle at 28% 24%). |
| `--lp-stagepearl-1` | `#FFF9E9` | = dunkel (themenfest) | Rosé-Bühnen- und Kurzperle (.mp-pearl, .mp-kurz .p), Verlaufsstopp 1 (0/15/43/70/100 %, circle at 32% 26%). |
| `--lp-stagepearl-2` | `#EDDBCB` | = dunkel (themenfest) | Rosé-Bühnen- und Kurzperle (.mp-pearl, .mp-kurz .p), Verlaufsstopp 2 (0/15/43/70/100 %, circle at 32% 26%). |
| `--lp-stagepearl-3` | `#BF969F` | = dunkel (themenfest) | Rosé-Bühnen- und Kurzperle (.mp-pearl, .mp-kurz .p), Verlaufsstopp 3 (0/15/43/70/100 %, circle at 32% 26%). |
| `--lp-stagepearl-4` | `#695360` | = dunkel (themenfest) | Rosé-Bühnen- und Kurzperle (.mp-pearl, .mp-kurz .p), Verlaufsstopp 4 (0/15/43/70/100 %, circle at 32% 26%). |
| `--lp-stagepearl-5` | `#E4C9B8` | = dunkel (themenfest) | Rosé-Bühnen- und Kurzperle (.mp-pearl, .mp-kurz .p), Verlaufsstopp 5 (0/15/43/70/100 %, circle at 32% 26%). |
| `--lp-stage` | `#100D10` | = dunkel (themenfest) | Feierbühne .mp-feier .buehne, .scanbox. Textgrund für lp-stage-text, lp-stage-muted, lp-stage-gold; Fokus #DFBE95. |
| `--lp-stage-gold` | `#D6B783` | = dunkel (themenfest) | Bühnengold: .mp-orbit, Staub, .mp-eyebrow, .mp-mark, Bühnenbutton-Fläche (trägt lp-stage). Liest auf lp-stage, lp-stage-glow, lp-stage-card-from/-to. |
| `--lp-stage-rose` | `#BC8F9F` | = dunkel (themenfest) | Bögen .mp-arc (dekorativ). |
| `--lp-stage-text` | `#F5ECE6` | = dunkel (themenfest) | Bühnentext (h2, Liste, Ghost-Label); liest auf lp-stage, lp-stage-glow, lp-stage-card-from/-to, lp-stage-close-hover@lp-stage. |
| `--lp-stage-muted` | `#BEADB7` | = dunkel (themenfest) | Bühne gedämpft (.mp-detail, .mp-reward-note, li.titel, .zu); liest auf lp-stage, lp-stage-glow, lp-stage-card-from/-to. |
| `--lp-stage-edge` | `#493A45` | = dunkel (themenfest) | Bühnenrand, Listentrenner .mp-reward ul (dekorativ). |
| `--lp-stage-glow` | `#30202C` | = dunkel (themenfest) | Bühnenlicht (radial 50% 22%) und Häkchenfarbe .mp-check. |
| `--lp-stage-card-edge` | `#725942` | = dunkel (themenfest) | Rand Bühnenprämie .mp-reward (dekorativ). |
| `--lp-stage-card-from` | `#2D2025` | = dunkel (themenfest) | Bühnenprämie Verlauf Start (130deg). Textgrund Bühnentexte. |
| `--lp-stage-card-to` | `#1A151A` | = dunkel (themenfest) | Bühnenprämie Verlauf Ende. Textgrund Bühnentexte. |
| `--lp-stage-ghost-edge` | `#8D7785` | = dunkel (themenfest) | Rand Bühnen-Sekundärbutton (≥ 3:1 auf lp-stage). |
| `--lp-stage-halo` | `#D6B78324` | = dunkel (themenfest) | Halo-Mitte .mp-halo (dekorativ). |
| `--lp-stage-sheen` | `#F4DFB940` | = dunkel (themenfest) | Prämienglanz CSS .mp-reward::after (dekorativ). |
| `--lp-stage-sheen-gsap` | `#F4DFB933` | = dunkel (themenfest) | Prämienglanz GSAP .mp-gsap-shine (Seitenrest club:651 / T:665). |
| `--lp-stage-close-hover` | `rgba(255,255,255,.06)` | = dunkel (themenfest) | Hover-Fläche Bühnen-Schließen .mp-feier .zu. |
| `--lp-scrim-stage` | `rgba(16,13,16,.86)` | = dunkel (themenfest) | Feier-Scrim .mp-feier (+ blur 6px), eingefroren. |
| `--lp-scan-frame` | `rgba(255,249,244,.8)` | = dunkel (themenfest) | Scanrahmen .scanbox .frame 1.5px (≥ 3:1 auf lp-stage). |
| `--lp-wheel-seg-a` | `#3F2B30` | = dunkel (themenfest) | Glücksrad-Canvas Segment A (T:1571–1577 liest per getComputedStyle). Textgrund für lp-wheel-ink. |
| `--lp-wheel-seg-b` | `#4C3238` | = dunkel (themenfest) | Glücksrad-Canvas Segment B (ersetzt #F6E9DF – keine helle Fläche). Textgrund für lp-wheel-ink. |
| `--lp-wheel-ink` | `#DFBE95` | = dunkel (themenfest) | Glücksrad: Beschriftung Jost 22px, 2px-Segmenttrennlinie, Nabenring, „La Perlé“ Cormorant 600. |
| `--lp-wheel-hub` | `#302327` | = dunkel (themenfest) | Glücksrad-Nabe. |
| `--lp-rank-bronze` | `#78533F` | = dunkel (themenfest) | Wallet-Rangfarbe Bronze (palette.json). In der Oberfläche nur nach Freigabe (I.4), dann als Plakettenfläche. Trägt lp-rank-bronze-ink. |
| `--lp-rank-bronze-ink` | `#FFF0DA` | = dunkel (themenfest) | Schrift auf lp-rank-bronze (Wallet-Tinte). |
| `--lp-rank-silber` | `#C4CBD1` | = dunkel (themenfest) | Wallet-Rangfarbe Silber (palette.json). In der Oberfläche nur nach Freigabe (I.4), dann als Plakettenfläche. Trägt lp-rank-silber-ink. |
| `--lp-rank-silber-ink` | `#24252A` | = dunkel (themenfest) | Schrift auf lp-rank-silber (Wallet-Tinte). |
| `--lp-rank-gold` | `#C8AC74` | = dunkel (themenfest) | Wallet-Rangfarbe Gold (palette.json). In der Oberfläche nur nach Freigabe (I.4), dann als Plakettenfläche. Trägt lp-rank-gold-ink. |
| `--lp-rank-gold-ink` | `#322519` | = dunkel (themenfest) | Schrift auf lp-rank-gold (Wallet-Tinte). |
| `--lp-rank-platin` | `#D0D0C9` | = dunkel (themenfest) | Wallet-Rangfarbe Platin (palette.json). In der Oberfläche nur nach Freigabe (I.4), dann als Plakettenfläche. Trägt lp-rank-platin-ink. |
| `--lp-rank-platin-ink` | `#30312F` | = dunkel (themenfest) | Schrift auf lp-rank-platin (Wallet-Tinte). |
| `--lp-rank-diamant` | `#D1E2EC` | = dunkel (themenfest) | Wallet-Rangfarbe Diamant (palette.json). In der Oberfläche nur nach Freigabe (I.4), dann als Plakettenfläche. Trägt lp-rank-diamant-ink. |
| `--lp-rank-diamant-ink` | `#203342` | = dunkel (themenfest) | Schrift auf lp-rank-diamant (Wallet-Tinte). |
| `--lp-heat-0` | `#302327` | `#FFFCF7` | Heatmap-Zelle Stufe 0 (kein Besuch): dunkel #DFBE95 0/12/30/70/90 % über lp-surface, hell #7C6029 0/12/30/55/95 % über #FFFCF7. Trägt lp-heat-ink-0. |
| `--lp-heat-1` | `#453634` | `#EFE9DE` | Heatmap-Zelle Stufe 1 (Anteil ≤ .25): dunkel #DFBE95 0/12/30/70/90 % über lp-surface, hell #7C6029 0/12/30/55/95 % über #FFFCF7. Trägt lp-heat-ink-1. |
| `--lp-heat-2` | `#645248` | `#D8CDB9` | Heatmap-Zelle Stufe 2 (≤ .5): dunkel #DFBE95 0/12/30/70/90 % über lp-surface, hell #7C6029 0/12/30/55/95 % über #FFFCF7. Trägt lp-heat-ink-2. |
| `--lp-heat-3` | `#AA9074` | `#B7A686` | Heatmap-Zelle Stufe 3 (≤ .75): dunkel #DFBE95 0/12/30/70/90 % über lp-surface, hell #7C6029 0/12/30/55/95 % über #FFFCF7. Trägt lp-heat-ink-3. |
| `--lp-heat-4` | `#CEAE8A` | `#836833` | Heatmap-Zelle Stufe 4 (> .75): dunkel #DFBE95 0/12/30/70/90 % über lp-surface, hell #7C6029 0/12/30/55/95 % über #FFFCF7. Trägt lp-heat-ink-4. |
| `--lp-heat-ink-0` | `{lp-text-muted}` → `#C6ABA8` | `{lp-text-muted}` → `#6E5C44` | Zahl (12px, 500, tabellarisch) in Heatmap-Stufe 0; liest nur auf lp-heat-0. |
| `--lp-heat-ink-1` | `{lp-text}` → `#F6E9DF` | `{lp-text}` → `#3B2E1E` | Zahl (12px, 500, tabellarisch) in Heatmap-Stufe 1; liest nur auf lp-heat-1. |
| `--lp-heat-ink-2` | `{lp-text}` → `#F6E9DF` | `{lp-text}` → `#3B2E1E` | Zahl (12px, 500, tabellarisch) in Heatmap-Stufe 2; liest nur auf lp-heat-2. |
| `--lp-heat-ink-3` | `{lp-on-accent}` → `#2E211B` | `{lp-text}` → `#3B2E1E` | Zahl (12px, 500, tabellarisch) in Heatmap-Stufe 3; liest nur auf lp-heat-3. |
| `--lp-heat-ink-4` | `{lp-on-accent}` → `#2E211B` | `{lp-surface}` → `#FFFCF7` | Zahl (12px, 500, tabellarisch) in Heatmap-Stufe 4; liest nur auf lp-heat-4. |

### C.4 Status ohne Grün

| Status | Maske `--_glyph-*` (SVG 24×24, Strich 2, rund, `currentColor`) | dunkel fg / Grund | hell fg / Grund | Pflicht |
|---|---|---|---|---|
| ok | ✓ `<path d='M20 6 9 17l-5-5'/>` (= Sprite `i-check`) | `#D1E2EC` / `#473E43` | `#203342` / `#EDF2F3` | Zeichen + Wort („Gespeichert.“, „vom Anbieter angenommen“) |
| Warnung | ⚠ `<path d='M12 3.5 2.5 20h19z'/><path d='M12 10v4.5M12 17.5h.01'/>` | `#E7C58A` / `#4A3A35` | `#8A4B12` / `#F5E6CB` | Zeichen + Wort („Ungeklärt:“, „Achtung:“) |
| Fehler | ! im Kreis `<circle cx='12' cy='12' r='9'/><path d='M12 7.5v5.5M12 16.5h.01'/>` | `#F0A5AD` / `#4B353A` | `#8E2E36` / `#F9D9D9` | Zeichen + Wort („Fehler:“, „Nicht gespeichert:“) – nie ✕ (= Schließen) |

Data-URI-Schema (ok): `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E")`. Warnung und Fehler folgen demselben Schema mit den Pfaden aus der Tabelle.

Glyph-Bauteil (neu `.lp-glyph`, außerdem `::before` von `.toast.ok/.warn/.err`, `.note.bad`, `.hinweis.ok/.warn/.fehler`, `.unklar`, `.pill.ok/.gut/.warn/.fehler`, `.feldfehler`, `.list .item.gewinn .p`, `.consent-state` gewählt):
`content:""; display:inline-block; flex:none; width:var(--lp-glyph); height:var(--lp-glyph); background:currentColor; -webkit-mask:var(--_glyph-ok) center/contain no-repeat; mask:var(--_glyph-ok) center/contain no-repeat; vertical-align:-.125em` (bzw. `-warn`, `-danger`). Die Maske ist dekorativ; die Bedeutung trägt das Wort. Screenreader lesen nichts zusätzlich vor.

Warum Masken: Weder Jost noch Cormorant enthalten U+2713, U+26A0 oder U+2715 (cmap geprüft). Schriftzeichen fielen auf die Systemschrift zurück, auf iOS teils auf farbige Emoji. Die Maske folgt Thema, Status und Forced Colors (F.9).

`.bdelta` (KPI-Veränderung) nutzt keine Maske, sondern Vorzeichen und Wortlaut („+6,4 % zum Vormonat“, „−3 %“ mit U+2212) in `--lp-ok` bzw. `--lp-danger`, 12px.

### C.5 Heatmap, Glücksrad, Rang

- **Heatmap (Verwaltung, B:1407–1427):** Das Seiten-JS bildet den Anteil `a` auf eine Stufe ab (`a = 0` → 0, `≤ .25` → 1, `≤ .5` → 2, `≤ .75` → 3, sonst 4) und setzt `data-stufe`. Das CSS färbt `[data-stufe="N"]{background:var(--lp-heat-N); color:var(--lp-heat-ink-N)}`. Die Zahlen erreichen ≥ 5.14:1 (C.7 Gruppe H). Die Legende zeigt fünf 16×16-Felder und die themenneutrale Zeile „Je kräftiger der Goldton, desto mehr Besuche.“ (statt „Je dunkler …“, M23).
- **Glücksrad (T:1571–1577):** Der Canvas liest Farben per `getComputedStyle(document.documentElement)`. Segmente abwechselnd `--lp-wheel-seg-a #3F2B30` / `--lp-wheel-seg-b #4C3238` (statt `#3F2B30`/`#F6E9DF`), 2px-Trennlinien, Außenring und Nabenring 2px `--lp-wheel-ink #DFBE95`, Beschriftung Jost 400 22px `--lp-wheel-ink` (7.46 / 6.56:1), Nabe `--lp-wheel-hub #302327`, „La Perlé“ Cormorant 600 24px. Das Rad ist in beiden Themen eine dunkle Scheibe; hell grenzt es sich über die Scheibe selbst ab (12.83:1), dunkel über den Außenring (8.55:1).
- **Rang (palette.json):** Rang-Tokens gibt es als Material. In der Oberfläche erscheint der Rang weiter als Wort + `#i-sparkle`. Eine Plakette `.rank[data-rang]` (Fläche `--lp-rank-<rang>`, Schrift `-ink`, ≥ 6.03:1) nur nach Freigabe (I.4).

### C.6 Komposita im CSS (aus Farbtoken, Werte identisch mit Fassung 3)

| CSS-Komposit | Wert |
|---|---|
| `--lp-member-gradient` | `radial-gradient(ellipse at 90% 50%, var(--lp-member-from) 0%, var(--lp-member-via) 55%, var(--lp-member-to) 100%)` |
| `--lp-reward-gradient` | `linear-gradient(110deg, var(--lp-reward-from), var(--lp-reward-to))` (hell `#FFFCF7 → #EFE5D4`) |
| Kettenperle `.pearl::before` | `radial-gradient(circle at 31% 24%, var(--lp-pearl-1) 0%, var(--lp-pearl-2) 15%, var(--lp-pearl-3) 38%, var(--lp-pearl-4) 67%, var(--lp-pearl-5) 89%)` |
| Prämienperle `.art-pearl,.dialog-pearl,.bottom-pearl` | `radial-gradient(circle at 28% 24%, var(--lp-artpearl-1) 0%, var(--lp-artpearl-2) 19%, var(--lp-artpearl-3) 48%, var(--lp-artpearl-4) 75%, var(--lp-artpearl-5) 96%)` |
| Rosé-Perle `.mp-pearl`, `.mp-kurz .p` | `radial-gradient(circle at 32% 26%, var(--lp-stagepearl-1) 0, var(--lp-stagepearl-2) 15%, var(--lp-stagepearl-3) 43%, var(--lp-stagepearl-4) 70%, var(--lp-stagepearl-5) 100%)` (einmal statt doppelt, mp:418 = mp:485) |
| Kartenglanz `.member::after` | `linear-gradient(115deg, transparent 44%, var(--lp-member-sheen) 49%, transparent 54%)` |
| Bühne `.mp-feier .buehne` | `background-color:var(--lp-stage); background-image:radial-gradient(ellipse at 50% 22%, var(--lp-stage-glow) 0, transparent 65%)` |
| Bühnenprämie `.mp-reward` | `linear-gradient(130deg, var(--lp-stage-card-from), var(--lp-stage-card-to))` |
| Halo `.mp-halo` / Glanz `.mp-reward::after` | `radial-gradient(ellipse, var(--lp-stage-halo), transparent 65%)` / `linear-gradient(115deg, transparent 35%, var(--lp-stage-sheen) 50%, transparent 65%)` |
| Scroller `.tabelle-scroll` | kein Schattenverlauf (statisch schlicht; fokussierbar mit Ring) |

`transparent` in Verläufen ist ein CSS-Schlüsselwort und bleibt erlaubt; nur tokens.json schließt es aus.

### C.7 Kontrasttabelle (beide Themen)

Methode: WCAG-2.x-Leuchtdichte, rgba über den genannten Grund komponiert (`A@B`), `filter:brightness(k)` auf Text **und** Fläche (`X*k`). Schwellen: Text ≥ 4.5:1. Die Tabelle prüft jeden Text mit 4.5, auch großen, UI-Ränder, Fokus, Icons und Marken mit ≥ 3:1. Inseln (Gruppen I, J) rechnen in beiden Spalten mit dem dunklen Satz, den sie selbst deklarieren. Druck (L) rechnet mit dem Perle-Satz auf `#FFFFFF`. „–“ heißt, dass das Paar in diesem Thema nicht vorkommt. Die Tabelle ist das Ergebnis der Entwurfsprüfung; im Repository rechnet `python3 design/pruefen.py` die Paare aus `design/kontrastpaare.json` je Thema gegen ihren Mindestwert nach. Die Nummern P001–P144 gelten für diese Tabelle.

**Ergebnis:** Paare: 144 (davon 3 Info) · bewertete Prüfungen (Paar × Thema): 272 · FAIL: 0 → ALLE PASS

- knappster Wert Midnight Privé Text: 4.72  (P027  lp-text-subtle auf lp-surface-raised)
- knappster Wert Midnight Privé UI: 3.36  (P055  lp-border-control auf lp-surface-raised)
- knappster Wert Perle Text: 4.72  (P033  lp-accent auf lp-selected)
- knappster Wert Perle UI: 3.19  (P072  lp-accent-mark auf lp-track)

| # | Gruppe | Vordergrund | Grund | Soll | Midnight Privé | Perle | Nutzung |
|---|---|---|---|---|---|---|---|
| P001 | A Text | `lp-text` | `lp-bg` | ≥ 4.5:1 | `#F6E9DF`/`#21191A` **14.47** PASS | `#3B2E1E`/`#F6EFE3` **11.52** PASS | Haupttext auf Seite |
| P002 | A Text | `lp-text` | `lp-surface` | ≥ 4.5:1 | `#F6E9DF`/`#302327` **12.64** PASS | `#3B2E1E`/`#FFFCF7` **12.86** PASS | Haupttext auf Karte/Dialog |
| P003 | A Text | `lp-text` | `lp-surface-raised` | ≥ 4.5:1 | `#F6E9DF`/`#3C272C` **11.61** PASS | `#3B2E1E`/`#FFFCF7` **12.86** PASS | Haupttext auf Toast/Stufe 2 |
| P004 | A Text | `lp-text` | `lp-field` | ≥ 4.5:1 | `#F6E9DF`/`#21191A` **14.47** PASS | `#3B2E1E`/`#F6EFE3` **11.52** PASS | Haupttext auf Feld/Einlass |
| P005 | A Text | `lp-text` | `lp-selected` | ≥ 4.5:1 | `#F6E9DF`/`#21191A` **14.47** PASS | `#3B2E1E`/`#EFE5D4` **10.55** PASS | Haupttext auf aktueller Nav-Eintrag |
| P006 | A Text | `lp-text` | `lp-hover@lp-surface` | ≥ 4.5:1 | `#F6E9DF`/`#281E20` **13.60** PASS | `#3B2E1E`/`#F7F3EB` **11.89** PASS | Haupttext auf Zeilen-/Nav-Hover |
| P007 | A Text | `lp-text` | `lp-accent-soft` | ≥ 4.5:1 | `#F6E9DF`/`#483936` **9.22** PASS | `#3B2E1E`/`#F3EAD7` **11.01** PASS | Haupttext auf Akzent-Tönung |
| P008 | A Text | `lp-text` | `lp-ok-soft` | ≥ 4.5:1 | `#F6E9DF`/`#473E43` **8.66** PASS | `#3B2E1E`/`#EDF2F3` **11.66** PASS | Haupttext auf ok-Grund |
| P009 | A Text | `lp-text` | `lp-warn-soft` | ≥ 4.5:1 | `#F6E9DF`/`#4A3A35` **9.06** PASS | `#3B2E1E`/`#F5E6CB` **10.69** PASS | Haupttext auf Warn-Grund |
| P010 | A Text | `lp-text` | `lp-danger-soft` | ≥ 4.5:1 | `#F6E9DF`/`#4B353A` **9.44** PASS | `#3B2E1E`/`#F9D9D9` **10.00** PASS | Haupttext auf Fehler-Grund |
| P011 | A Text | `lp-text` | `lp-reward-from` | ≥ 4.5:1 | `#F6E9DF`/`#3F2B30` **11.03** PASS | `#3B2E1E`/`#FFFCF7` **12.86** PASS | Haupttext auf Prämienverlauf Start |
| P012 | A Text | `lp-text` | `lp-reward-to` | ≥ 4.5:1 | `#F6E9DF`/`#2B2023` **13.23** PASS | `#3B2E1E`/`#EFE5D4` **10.55** PASS | Haupttext auf Prämienverlauf Ende |
| P013 | A Text | `lp-text-muted` | `lp-bg` | ≥ 4.5:1 | `#C6ABA8`/`#21191A` **8.04** PASS | `#6E5C44`/`#F6EFE3` **5.61** PASS | Sekundärtext auf Seite |
| P014 | A Text | `lp-text-muted` | `lp-surface` | ≥ 4.5:1 | `#C6ABA8`/`#302327` **7.02** PASS | `#6E5C44`/`#FFFCF7` **6.26** PASS | Sekundärtext auf Karte/Dialog |
| P015 | A Text | `lp-text-muted` | `lp-surface-raised` | ≥ 4.5:1 | `#C6ABA8`/`#3C272C` **6.45** PASS | `#6E5C44`/`#FFFCF7` **6.26** PASS | Sekundärtext auf Toast/Stufe 2 |
| P016 | A Text | `lp-text-muted` | `lp-field` | ≥ 4.5:1 | `#C6ABA8`/`#21191A` **8.04** PASS | `#6E5C44`/`#F6EFE3` **5.61** PASS | Sekundärtext auf Feld/Einlass |
| P017 | A Text | `lp-text-muted` | `lp-selected` | ≥ 4.5:1 | `#C6ABA8`/`#21191A` **8.04** PASS | `#6E5C44`/`#EFE5D4` **5.13** PASS | Sekundärtext auf aktueller Nav-Eintrag |
| P018 | A Text | `lp-text-muted` | `lp-hover@lp-surface` | ≥ 4.5:1 | `#C6ABA8`/`#281E20` **7.55** PASS | `#6E5C44`/`#F7F3EB` **5.79** PASS | Sekundärtext auf Zeilen-/Nav-Hover |
| P019 | A Text | `lp-text-muted` | `lp-accent-soft` | ≥ 4.5:1 | `#C6ABA8`/`#483936` **5.12** PASS | `#6E5C44`/`#F3EAD7` **5.36** PASS | Sekundärtext auf Akzent-Tönung |
| P020 | A Text | `lp-text-muted` | `lp-ok-soft` | ≥ 4.5:1 | `#C6ABA8`/`#473E43` **4.80** PASS | `#6E5C44`/`#EDF2F3` **5.67** PASS | Sekundärtext auf ok-Grund |
| P021 | A Text | `lp-text-muted` | `lp-warn-soft` | ≥ 4.5:1 | `#C6ABA8`/`#4A3A35` **5.03** PASS | `#6E5C44`/`#F5E6CB` **5.21** PASS | Sekundärtext auf Warn-Grund |
| P022 | A Text | `lp-text-muted` | `lp-danger-soft` | ≥ 4.5:1 | `#C6ABA8`/`#4B353A` **5.24** PASS | `#6E5C44`/`#F9D9D9` **4.87** PASS | Sekundärtext auf Fehler-Grund |
| P023 | A Text | `lp-text-muted` | `lp-reward-from` | ≥ 4.5:1 | `#C6ABA8`/`#3F2B30` **6.12** PASS | `#6E5C44`/`#FFFCF7` **6.26** PASS | Sekundärtext auf Prämienverlauf Start |
| P024 | A Text | `lp-text-muted` | `lp-reward-to` | ≥ 4.5:1 | `#C6ABA8`/`#2B2023` **7.34** PASS | `#6E5C44`/`#EFE5D4` **5.13** PASS | Sekundärtext auf Prämienverlauf Ende |
| P025 | A Text | `lp-text-subtle` | `lp-bg` | ≥ 4.5:1 | `#AB918E`/`#21191A` **5.89** PASS | `#6E5C44`/`#F6EFE3` **5.61** PASS | Platzhalter/Tertiär auf Seite |
| P026 | A Text | `lp-text-subtle` | `lp-surface` | ≥ 4.5:1 | `#AB918E`/`#302327` **5.14** PASS | `#6E5C44`/`#FFFCF7` **6.26** PASS | Platzhalter/Tertiär auf Karte/Dialog |
| P027 | A Text | `lp-text-subtle` | `lp-surface-raised` | ≥ 4.5:1 | `#AB918E`/`#3C272C` **4.72** PASS | `#6E5C44`/`#FFFCF7` **6.26** PASS | Platzhalter/Tertiär auf Toast/Stufe 2 |
| P028 | A Text | `lp-text-subtle` | `lp-field` | ≥ 4.5:1 | `#AB918E`/`#21191A` **5.89** PASS | `#6E5C44`/`#F6EFE3` **5.61** PASS | Platzhalter/Tertiär auf Feld/Einlass |
| P029 | A Text | `lp-accent` | `lp-bg` | ≥ 4.5:1 | `#DFBE95`/`#21191A` **9.80** PASS | `#7C6029`/`#F6EFE3` **5.16** PASS | Akzenttext/Link auf Seite |
| P030 | A Text | `lp-accent` | `lp-surface` | ≥ 4.5:1 | `#DFBE95`/`#302327` **8.55** PASS | `#7C6029`/`#FFFCF7` **5.76** PASS | Akzenttext/Link auf Karte/Dialog |
| P031 | A Text | `lp-accent` | `lp-surface-raised` | ≥ 4.5:1 | `#DFBE95`/`#3C272C` **7.86** PASS | `#7C6029`/`#FFFCF7` **5.76** PASS | Akzenttext/Link auf Toast/Stufe 2 |
| P032 | A Text | `lp-accent` | `lp-field` | ≥ 4.5:1 | `#DFBE95`/`#21191A` **9.80** PASS | `#7C6029`/`#F6EFE3` **5.16** PASS | Akzenttext/Link auf Feld/Einlass |
| P033 | A Text | `lp-accent` | `lp-selected` | ≥ 4.5:1 | `#DFBE95`/`#21191A` **9.80** PASS | `#7C6029`/`#EFE5D4` **4.72** PASS | Akzenttext/Link auf aktueller Nav-Eintrag |
| P034 | A Text | `lp-accent` | `lp-hover@lp-surface` | ≥ 4.5:1 | `#DFBE95`/`#281E20` **9.21** PASS | `#7C6029`/`#F7F3EB` **5.33** PASS | Akzenttext/Link auf Zeilen-/Nav-Hover |
| P035 | A Text | `lp-accent` | `lp-accent-soft` | ≥ 4.5:1 | `#DFBE95`/`#483936` **6.24** PASS | `#7C6029`/`#F3EAD7` **4.93** PASS | Akzenttext/Link auf Akzent-Tönung |
| P036 | A Text | `lp-accent` | `lp-reward-from` | ≥ 4.5:1 | `#DFBE95`/`#3F2B30` **7.46** PASS | `#7C6029`/`#FFFCF7` **5.76** PASS | Akzenttext/Link auf Prämienverlauf Start |
| P037 | A Text | `lp-accent` | `lp-reward-to` | ≥ 4.5:1 | `#DFBE95`/`#2B2023` **8.95** PASS | `#7C6029`/`#EFE5D4` **4.72** PASS | Akzenttext/Link auf Prämienverlauf Ende |
| P038 | B Status | `lp-ok` | `lp-bg` | ≥ 4.5:1 | `#D1E2EC`/`#21191A` **12.97** PASS | `#203342`/`#F6EFE3` **11.39** PASS | Status ok (Text, Glyph, Rand) auf Seite |
| P039 | B Status | `lp-ok` | `lp-surface` | ≥ 4.5:1 | `#D1E2EC`/`#302327` **11.32** PASS | `#203342`/`#FFFCF7` **12.72** PASS | Status ok (Text, Glyph, Rand) auf Karte |
| P040 | B Status | `lp-ok` | `lp-surface-raised` | ≥ 4.5:1 | `#D1E2EC`/`#3C272C` **10.40** PASS | `#203342`/`#FFFCF7` **12.72** PASS | Status ok (Text, Glyph, Rand) auf Toast |
| P041 | B Status | `lp-ok` | `lp-ok-soft` | ≥ 4.5:1 | `#D1E2EC`/`#473E43` **7.75** PASS | `#203342`/`#EDF2F3` **11.52** PASS | Status ok (Text, Glyph, Rand) auf ok-Grund |
| P042 | B Status | `lp-warn` | `lp-bg` | ≥ 4.5:1 | `#E7C58A`/`#21191A` **10.46** PASS | `#8A4B12`/`#F6EFE3` **5.94** PASS | Status warn (Text, Glyph, Rand) auf Seite |
| P043 | B Status | `lp-warn` | `lp-surface` | ≥ 4.5:1 | `#E7C58A`/`#302327` **9.14** PASS | `#8A4B12`/`#FFFCF7` **6.63** PASS | Status warn (Text, Glyph, Rand) auf Karte |
| P044 | B Status | `lp-warn` | `lp-surface-raised` | ≥ 4.5:1 | `#E7C58A`/`#3C272C` **8.40** PASS | `#8A4B12`/`#FFFCF7` **6.63** PASS | Status warn (Text, Glyph, Rand) auf Toast |
| P045 | B Status | `lp-warn` | `lp-warn-soft` | ≥ 4.5:1 | `#E7C58A`/`#4A3A35` **6.55** PASS | `#8A4B12`/`#F5E6CB` **5.51** PASS | Status warn (Text, Glyph, Rand) auf warn-Grund |
| P046 | B Status | `lp-danger` | `lp-bg` | ≥ 4.5:1 | `#F0A5AD`/`#21191A` **8.77** PASS | `#8E2E36`/`#F6EFE3` **7.08** PASS | Status danger (Text, Glyph, Rand) auf Seite |
| P047 | B Status | `lp-danger` | `lp-surface` | ≥ 4.5:1 | `#F0A5AD`/`#302327` **7.66** PASS | `#8E2E36`/`#FFFCF7` **7.91** PASS | Status danger (Text, Glyph, Rand) auf Karte |
| P048 | B Status | `lp-danger` | `lp-surface-raised` | ≥ 4.5:1 | `#F0A5AD`/`#3C272C` **7.04** PASS | `#8E2E36`/`#FFFCF7` **7.91** PASS | Status danger (Text, Glyph, Rand) auf Toast |
| P049 | B Status | `lp-danger` | `lp-danger-soft` | ≥ 4.5:1 | `#F0A5AD`/`#4B353A` **5.72** PASS | `#8E2E36`/`#F9D9D9` **6.15** PASS | Status danger (Text, Glyph, Rand) auf danger-Grund |
| P050 | C Primärfläche | `lp-on-accent` | `lp-accent-fill` | ≥ 4.5:1 | `#2E211B`/`#E0BE98` **8.88** PASS | `#2E211B`/`#E2CFA6` **10.16** PASS | Primärbutton, Chip/NPS gewählt – Ruhe |
| P051 | C Primärfläche | `lp-on-accent*1.08` | `lp-accent-fill*1.08` | ≥ 4.5:1 | `#32241D`/`#F2CDA4` **9.99** PASS | `#32241D`/`#F4E0B3` **11.50** PASS | Primärbutton Hover brightness(1.08), Text mitgefiltert |
| P052 | C Primärfläche | `lp-on-accent*0.94` | `lp-accent-fill*0.94` | ≥ 4.5:1 | `#2B1F19`/`#D3B38F` **8.09** PASS | `#2B1F19`/`#D4C39C` **9.21** PASS | Primärbutton Aktiv brightness(.94), Text mitgefiltert |
| P053 | D Kontrollrand | `lp-border-control` | `lp-bg` | ≥ 3:1 | `#917777`/`#21191A` **4.19** PASS | `#8A785F`/`#F6EFE3` **3.73** PASS | Control-Rand gegen Seite |
| P054 | D Kontrollrand | `lp-border-control` | `lp-surface` | ≥ 3:1 | `#917777`/`#302327` **3.66** PASS | `#8A785F`/`#FFFCF7` **4.16** PASS | Control-Rand gegen Karte |
| P055 | D Kontrollrand | `lp-border-control` | `lp-surface-raised` | ≥ 3:1 | `#917777`/`#3C272C` **3.36** PASS | `#8A785F`/`#FFFCF7` **4.16** PASS | Control-Rand gegen Stufe 2 |
| P056 | D Kontrollrand | `lp-border-control` | `lp-field` | ≥ 3:1 | `#917777`/`#21191A` **4.19** PASS | `#8A785F`/`#F6EFE3` **3.73** PASS | Control-Rand gegen Feldfläche innen |
| P057 | D Kontrollrand | `lp-border-control` | `lp-selected` | ≥ 3:1 | `#917777`/`#21191A` **4.19** PASS | `#8A785F`/`#EFE5D4` **3.41** PASS | Control-Rand gegen Nav aktuell |
| P058 | D Kontrollrand | `lp-border-control` | `lp-hover@lp-surface` | ≥ 3:1 | `#917777`/`#281E20` **3.94** PASS | `#8A785F`/`#F7F3EB` **3.85** PASS | Control-Rand gegen Hover-Zeile |
| P059 | E Fokus | `lp-focus` | `lp-bg` | ≥ 3:1 | `#DFBE95`/`#21191A` **9.80** PASS | `#7C6029`/`#F6EFE3` **5.16** PASS | Fokusring (Versatz 3px liegt auf Seite) |
| P060 | E Fokus | `lp-focus` | `lp-surface` | ≥ 3:1 | `#DFBE95`/`#302327` **8.55** PASS | `#7C6029`/`#FFFCF7` **5.76** PASS | Fokusring (Versatz 3px liegt auf Karte) |
| P061 | E Fokus | `lp-focus` | `lp-surface-raised` | ≥ 3:1 | `#DFBE95`/`#3C272C` **7.86** PASS | `#7C6029`/`#FFFCF7` **5.76** PASS | Fokusring (Versatz 3px liegt auf Stufe 2) |
| P062 | E Fokus | `lp-focus` | `lp-field` | ≥ 3:1 | `#DFBE95`/`#21191A` **9.80** PASS | `#7C6029`/`#F6EFE3` **5.16** PASS | Fokusring (Versatz 3px liegt auf Feld) |
| P063 | E Fokus | `lp-focus` | `lp-selected` | ≥ 3:1 | `#DFBE95`/`#21191A` **9.80** PASS | `#7C6029`/`#EFE5D4` **4.72** PASS | Fokusring (Versatz 3px liegt auf Nav aktuell) |
| P064 | E Fokus | `lp-focus` | `lp-accent-soft` | ≥ 3:1 | `#DFBE95`/`#483936` **6.24** PASS | `#7C6029`/`#F3EAD7` **4.93** PASS | Fokusring (Versatz 3px liegt auf Tönung) |
| P065 | E Fokus | `lp-focus` | `lp-reward-from` | ≥ 3:1 | `#DFBE95`/`#3F2B30` **7.46** PASS | `#7C6029`/`#FFFCF7` **5.76** PASS | Fokusring (Versatz 3px liegt auf Prämie Start) |
| P066 | E Fokus | `lp-focus` | `lp-reward-to` | ≥ 3:1 | `#DFBE95`/`#2B2023` **8.95** PASS | `#7C6029`/`#EFE5D4` **4.72** PASS | Fokusring (Versatz 3px liegt auf Prämie Ende) |
| P067 | F Marke | `lp-accent-mark` | `lp-bg` | ≥ 3:1 | `#DFBE95`/`#21191A` **9.80** PASS | `#907036`/`#F6EFE3` **4.03** PASS | UI-Marke (Füllung, Hover-Rand, Nav-Marke, Tabs, Balken) gegen Seite |
| P068 | F Marke | `lp-accent-mark` | `lp-surface` | ≥ 3:1 | `#DFBE95`/`#302327` **8.55** PASS | `#907036`/`#FFFCF7` **4.50** PASS | UI-Marke (Füllung, Hover-Rand, Nav-Marke, Tabs, Balken) gegen Karte |
| P069 | F Marke | `lp-accent-mark` | `lp-surface-raised` | ≥ 3:1 | `#DFBE95`/`#3C272C` **7.86** PASS | `#907036`/`#FFFCF7` **4.50** PASS | UI-Marke (Füllung, Hover-Rand, Nav-Marke, Tabs, Balken) gegen Stufe 2 |
| P070 | F Marke | `lp-accent-mark` | `lp-field` | ≥ 3:1 | `#DFBE95`/`#21191A` **9.80** PASS | `#907036`/`#F6EFE3` **4.03** PASS | UI-Marke (Füllung, Hover-Rand, Nav-Marke, Tabs, Balken) gegen Feld |
| P071 | F Marke | `lp-accent-mark` | `lp-selected` | ≥ 3:1 | `#DFBE95`/`#21191A` **9.80** PASS | `#907036`/`#EFE5D4` **3.69** PASS | UI-Marke (Füllung, Hover-Rand, Nav-Marke, Tabs, Balken) gegen Nav aktuell |
| P072 | F Marke | `lp-accent-mark` | `lp-track` | ≥ 3:1 | `#DFBE95`/`#5A4242` **5.21** PASS | `#907036`/`#E4D5BB` **3.19** PASS | UI-Marke (Füllung, Hover-Rand, Nav-Marke, Tabs, Balken) gegen Fortschrittsspur |
| P073 | F Marke | `lp-accent-fill-edge` | `lp-bg` | ≥ 3:1 | `#E0BE98`/`#21191A` **9.84** PASS | `#907036`/`#F6EFE3` **4.03** PASS | Umriss Primärpille/gewählter Chip gegen Seite |
| P074 | F Marke | `lp-accent-fill-edge` | `lp-surface` | ≥ 3:1 | `#E0BE98`/`#302327` **8.59** PASS | `#907036`/`#FFFCF7` **4.50** PASS | Umriss Primärpille/gewählter Chip gegen Karte |
| P075 | F Marke | `lp-accent-fill-edge` | `lp-surface-raised` | ≥ 3:1 | `#E0BE98`/`#3C272C` **7.89** PASS | `#907036`/`#FFFCF7` **4.50** PASS | Umriss Primärpille/gewählter Chip gegen Stufe 2 |
| P076 | F Marke | `lp-accent-fill-edge*1.08` | `lp-bg` | ≥ 3:1 | `#F2CDA4`/`#21191A` **11.52** PASS | `#9C793A`/`#F6EFE3` **3.53** PASS | Umriss Primärpille im Hover (Filter wirkt auf den Rand) gegen Seite |
| P077 | F Marke | `lp-accent-fill-edge*1.08` | `lp-surface` | ≥ 3:1 | `#F2CDA4`/`#302327` **10.06** PASS | `#9C793A`/`#FFFCF7` **3.94** PASS | Umriss Primärpille im Hover gegen Karte |
| P078 | F Marke | `lp-accent-mark` | `lp-accent-soft` | ≥ 3:1 | `#DFBE95`/`#483936` **6.24** PASS | `#907036`/`#F3EAD7` **3.85** PASS | Akzentbalken 3px .hinweis und Rand gewählte Auswahlkarte gegen Tönung |
| P079 | F Marke | `lp-on-accent` | `lp-accent-fill` | ≥ 3:1 | `#2E211B`/`#E0BE98` **8.88** PASS | `#2E211B`/`#E2CFA6` **10.16** PASS | Schalterknopf an gegen Spur |
| P080 | F Marke | `lp-text-muted` | `lp-field` | ≥ 3:1 | `#C6ABA8`/`#21191A` **8.04** PASS | `#6E5C44`/`#F6EFE3` **5.61** PASS | Schalterknopf aus, Select-Pfeil, gedämpfte Icons |
| P081 | G Spinner | `lp-on-accent` | `lp-spinner-track-on-accent@lp-accent-fill` | ≥ 3:1 | `#2E211B`/`#AB8F72` **5.12** PASS | `#2E211B`/`#AC9B7C` **5.73** PASS | Spinnerkopf gegen Spur auf Primärfläche |
| P082 | G Spinner | `lp-accent` | `lp-spinner-track@lp-surface` | ≥ 3:1 | `#DFBE95`/`#645248` **4.20** PASS | `#7C6029`/`#D8CDB9` **3.75** PASS | Spinnerkopf gegen Spur (Sekundär auf Karte) |
| P083 | G Spinner | `lp-accent` | `lp-spinner-track@lp-bg` | ≥ 3:1 | `#DFBE95`/`#5A4A3F` **4.80** PASS | `#7C6029`/`#D1C4AB` **3.42** PASS | Spinnerkopf gegen Spur (Sekundär auf Seite) |
| P084 | G Spinner | `lp-danger` | `lp-spinner-track@lp-surface` | ≥ 3:1 | `#F0A5AD`/`#645248` **3.76** PASS | `#8E2E36`/`#D8CDB9` **5.15** PASS | Spinnerkopf gegen Spur (Gefahr auf Karte) |
| P085 | H Heatmap | `lp-heat-ink-0` | `lp-heat-0` | ≥ 4.5:1 | `#C6ABA8`/`#302327` **7.02** PASS | `#6E5C44`/`#FFFCF7` **6.26** PASS | Zahl 12px in Heatmap-Stufe 0 |
| P086 | H Heatmap | `lp-heat-ink-1` | `lp-heat-1` | ≥ 4.5:1 | `#F6E9DF`/`#453634` **9.64** PASS | `#3B2E1E`/`#EFE9DE` **10.89** PASS | Zahl 12px in Heatmap-Stufe 1 |
| P087 | H Heatmap | `lp-heat-ink-2` | `lp-heat-2` | ≥ 4.5:1 | `#F6E9DF`/`#645248` **6.21** PASS | `#3B2E1E`/`#D8CDB9` **8.37** PASS | Zahl 12px in Heatmap-Stufe 2 |
| P088 | H Heatmap | `lp-heat-ink-3` | `lp-heat-3` | ≥ 4.5:1 | `#2E211B`/`#AA9074` **5.15** PASS | `#3B2E1E`/`#B7A686` **5.52** PASS | Zahl 12px in Heatmap-Stufe 3 |
| P089 | H Heatmap | `lp-heat-ink-4` | `lp-heat-4` | ≥ 4.5:1 | `#2E211B`/`#CEAE8A` **7.44** PASS | `#FFFCF7`/`#836833` **5.14** PASS | Zahl 12px in Heatmap-Stufe 4 |
| P090 | I Insel Mitgliedskarte | `lp-member-text` | `lp-member-from` | ≥ 4.5:1 | `#FAE8DE`/`#573A42` **8.45** PASS | `#FAE8DE`/`#573A42` **8.45** PASS | Saldo, Rang auf lp-member-from (Insel, dunkler Satz in beiden Themen) |
| P091 | I Insel Mitgliedskarte | `lp-member-muted` | `lp-member-from` | ≥ 4.5:1 | `#D8B9B5`/`#573A42` **5.52** PASS | `#D8B9B5`/`#573A42` **5.52** PASS | Eyebrow, .sub, Fuß auf lp-member-from (Insel, dunkler Satz in beiden Themen) |
| P092 | I Insel Mitgliedskarte | `lp-accent` | `lp-member-from` | ≥ 3:1 | `#DFBE95`/`#573A42` **5.71** PASS | `#DFBE95`/`#573A42` **5.71** PASS | Rang-Icon, Perlen-Fokusring (innen) auf lp-member-from (Insel, dunkler Satz in beiden Themen) |
| P093 | I Insel Mitgliedskarte | `lp-pearl-3` | `lp-member-from` | ≥ 3:1 | `#E8D5C5`/`#573A42` **7.06** PASS | `#E8D5C5`/`#573A42` **7.06** PASS | Perlen-Button (Mittelstopp) gegen lp-member-from (Insel, dunkler Satz in beiden Themen) |
| P094 | I Insel Mitgliedskarte | `lp-member-text` | `lp-member-via` | ≥ 4.5:1 | `#FAE8DE`/`#38242C` **12.12** PASS | `#FAE8DE`/`#38242C` **12.12** PASS | Saldo, Rang auf lp-member-via (Insel, dunkler Satz in beiden Themen) |
| P095 | I Insel Mitgliedskarte | `lp-member-muted` | `lp-member-via` | ≥ 4.5:1 | `#D8B9B5`/`#38242C` **7.91** PASS | `#D8B9B5`/`#38242C` **7.91** PASS | Eyebrow, .sub, Fuß auf lp-member-via (Insel, dunkler Satz in beiden Themen) |
| P096 | I Insel Mitgliedskarte | `lp-accent` | `lp-member-via` | ≥ 3:1 | `#DFBE95`/`#38242C` **8.19** PASS | `#DFBE95`/`#38242C` **8.19** PASS | Rang-Icon, Perlen-Fokusring (innen) auf lp-member-via (Insel, dunkler Satz in beiden Themen) |
| P097 | I Insel Mitgliedskarte | `lp-pearl-3` | `lp-member-via` | ≥ 3:1 | `#E8D5C5`/`#38242C` **10.13** PASS | `#E8D5C5`/`#38242C` **10.13** PASS | Perlen-Button (Mittelstopp) gegen lp-member-via (Insel, dunkler Satz in beiden Themen) |
| P098 | I Insel Mitgliedskarte | `lp-member-text` | `lp-member-to` | ≥ 4.5:1 | `#FAE8DE`/`#291C23` **13.75** PASS | `#FAE8DE`/`#291C23` **13.75** PASS | Saldo, Rang auf lp-member-to (Insel, dunkler Satz in beiden Themen) |
| P099 | I Insel Mitgliedskarte | `lp-member-muted` | `lp-member-to` | ≥ 4.5:1 | `#D8B9B5`/`#291C23` **8.97** PASS | `#D8B9B5`/`#291C23` **8.97** PASS | Eyebrow, .sub, Fuß auf lp-member-to (Insel, dunkler Satz in beiden Themen) |
| P100 | I Insel Mitgliedskarte | `lp-accent` | `lp-member-to` | ≥ 3:1 | `#DFBE95`/`#291C23` **9.29** PASS | `#DFBE95`/`#291C23` **9.29** PASS | Rang-Icon, Perlen-Fokusring (innen) auf lp-member-to (Insel, dunkler Satz in beiden Themen) |
| P101 | I Insel Mitgliedskarte | `lp-pearl-3` | `lp-member-to` | ≥ 3:1 | `#E8D5C5`/`#291C23` **11.49** PASS | `#E8D5C5`/`#291C23` **11.49** PASS | Perlen-Button (Mittelstopp) gegen lp-member-to (Insel, dunkler Satz in beiden Themen) |
| P102 | J Insel Bühne | `lp-stage-text` | `lp-stage` | ≥ 4.5:1 | `#F5ECE6`/`#100D10` **16.58** PASS | `#F5ECE6`/`#100D10` **16.58** PASS | Bühnentext auf lp-stage (Insel, dunkler Satz in beiden Themen) |
| P103 | J Insel Bühne | `lp-stage-muted` | `lp-stage` | ≥ 4.5:1 | `#BEADB7`/`#100D10` **9.06** PASS | `#BEADB7`/`#100D10` **9.06** PASS | Bühne gedämpft auf lp-stage (Insel, dunkler Satz in beiden Themen) |
| P104 | J Insel Bühne | `lp-stage-gold` | `lp-stage` | ≥ 4.5:1 | `#D6B783`/`#100D10` **10.08** PASS | `#D6B783`/`#100D10` **10.08** PASS | Eyebrow/Marke auf lp-stage (Insel, dunkler Satz in beiden Themen) |
| P105 | J Insel Bühne | `lp-stage-text` | `lp-stage-glow` | ≥ 4.5:1 | `#F5ECE6`/`#30202C` **13.17** PASS | `#F5ECE6`/`#30202C` **13.17** PASS | Bühnentext auf lp-stage-glow (Insel, dunkler Satz in beiden Themen) |
| P106 | J Insel Bühne | `lp-stage-muted` | `lp-stage-glow` | ≥ 4.5:1 | `#BEADB7`/`#30202C` **7.20** PASS | `#BEADB7`/`#30202C` **7.20** PASS | Bühne gedämpft auf lp-stage-glow (Insel, dunkler Satz in beiden Themen) |
| P107 | J Insel Bühne | `lp-stage-gold` | `lp-stage-glow` | ≥ 4.5:1 | `#D6B783`/`#30202C` **8.01** PASS | `#D6B783`/`#30202C` **8.01** PASS | Eyebrow/Marke auf lp-stage-glow (Insel, dunkler Satz in beiden Themen) |
| P108 | J Insel Bühne | `lp-stage-text` | `lp-stage-card-from` | ≥ 4.5:1 | `#F5ECE6`/`#2D2025` **13.40** PASS | `#F5ECE6`/`#2D2025` **13.40** PASS | Bühnentext auf lp-stage-card-from (Insel, dunkler Satz in beiden Themen) |
| P109 | J Insel Bühne | `lp-stage-muted` | `lp-stage-card-from` | ≥ 4.5:1 | `#BEADB7`/`#2D2025` **7.32** PASS | `#BEADB7`/`#2D2025` **7.32** PASS | Bühne gedämpft auf lp-stage-card-from (Insel, dunkler Satz in beiden Themen) |
| P110 | J Insel Bühne | `lp-stage-gold` | `lp-stage-card-from` | ≥ 4.5:1 | `#D6B783`/`#2D2025` **8.15** PASS | `#D6B783`/`#2D2025` **8.15** PASS | Eyebrow/Marke auf lp-stage-card-from (Insel, dunkler Satz in beiden Themen) |
| P111 | J Insel Bühne | `lp-stage-text` | `lp-stage-card-to` | ≥ 4.5:1 | `#F5ECE6`/`#1A151A` **15.46** PASS | `#F5ECE6`/`#1A151A` **15.46** PASS | Bühnentext auf lp-stage-card-to (Insel, dunkler Satz in beiden Themen) |
| P112 | J Insel Bühne | `lp-stage-muted` | `lp-stage-card-to` | ≥ 4.5:1 | `#BEADB7`/`#1A151A` **8.45** PASS | `#BEADB7`/`#1A151A` **8.45** PASS | Bühne gedämpft auf lp-stage-card-to (Insel, dunkler Satz in beiden Themen) |
| P113 | J Insel Bühne | `lp-stage-gold` | `lp-stage-card-to` | ≥ 4.5:1 | `#D6B783`/`#1A151A` **9.40** PASS | `#D6B783`/`#1A151A` **9.40** PASS | Eyebrow/Marke auf lp-stage-card-to (Insel, dunkler Satz in beiden Themen) |
| P114 | J Insel Bühne | `lp-stage-text` | `lp-stage-close-hover@lp-stage` | ≥ 4.5:1 | `#F5ECE6`/`#1E1C1E` **14.53** PASS | `#F5ECE6`/`#1E1C1E` **14.53** PASS | Schließen × Hover (Insel, dunkler Satz in beiden Themen) |
| P115 | J Insel Bühne | `lp-stage` | `lp-stage-gold` | ≥ 4.5:1 | `#100D10`/`#D6B783` **10.08** PASS | `#100D10`/`#D6B783` **10.08** PASS | Bühnenbutton Text (Ruhe) (Insel, dunkler Satz in beiden Themen) |
| P116 | J Insel Bühne | `lp-stage*1.08` | `lp-stage-gold*1.08` | ≥ 4.5:1 | `#110E11`/`#E7C68D` **11.75** PASS | `#110E11`/`#E7C68D` **11.75** PASS | Bühnenbutton Hover brightness(1.08) (Insel, dunkler Satz in beiden Themen) |
| P117 | J Insel Bühne | `lp-stage*0.94` | `lp-stage-gold*0.94` | ≥ 4.5:1 | `#0F0C0F`/`#C9AC7B` **8.96** PASS | `#0F0C0F`/`#C9AC7B` **8.96** PASS | Bühnenbutton Aktiv brightness(.94) (Insel, dunkler Satz in beiden Themen) |
| P118 | J Insel Bühne | `lp-stage-gold` | `lp-stage` | ≥ 3:1 | `#D6B783`/`#100D10` **10.08** PASS | `#D6B783`/`#100D10` **10.08** PASS | Bühnenbutton-Fläche gegen Bühne (Insel, dunkler Satz in beiden Themen) |
| P119 | J Insel Bühne | `lp-stage-ghost-edge` | `lp-stage` | ≥ 3:1 | `#8D7785`/`#100D10` **4.70** PASS | `#8D7785`/`#100D10` **4.70** PASS | Rand Bühnen-Sekundärbutton (Insel, dunkler Satz in beiden Themen) |
| P120 | J Insel Bühne | `lp-focus` | `lp-stage` | ≥ 3:1 | `#DFBE95`/`#100D10` **10.98** PASS | `#DFBE95`/`#100D10` **10.98** PASS | Fokusring auf der Bühne/Scanbox (#DFBE95) (Insel, dunkler Satz in beiden Themen) |
| P121 | J Insel Bühne | `lp-focus` | `lp-stage-glow` | ≥ 3:1 | `#DFBE95`/`#30202C` **8.72** PASS | `#DFBE95`/`#30202C` **8.72** PASS | Fokusring im Bühnenlicht (Insel, dunkler Satz in beiden Themen) |
| P122 | J Insel Bühne | `lp-scan-frame` | `lp-stage` | ≥ 3:1 | `#CFCAC6`/`#100D10` **11.87** PASS | `#CFCAC6`/`#100D10` **11.87** PASS | Scanrahmen 1.5px auf Kamerafläche (Insel, dunkler Satz in beiden Themen) |
| P123 | K Glücksrad | `lp-wheel-ink` | `lp-wheel-seg-a` | ≥ 4.5:1 | `#DFBE95`/`#3F2B30` **7.46** PASS | `#DFBE95`/`#3F2B30` **7.46** PASS | Beschriftung 22px auf Segment A |
| P124 | K Glücksrad | `lp-wheel-ink` | `lp-wheel-seg-b` | ≥ 4.5:1 | `#DFBE95`/`#4C3238` **6.56** PASS | `#DFBE95`/`#4C3238` **6.56** PASS | Beschriftung 22px auf Segment B |
| P125 | K Glücksrad | `lp-wheel-ink` | `lp-wheel-hub` | ≥ 4.5:1 | `#DFBE95`/`#302327` **8.55** PASS | `#DFBE95`/`#302327` **8.55** PASS | „La Perlé“ und Nabenring auf Nabe |
| P126 | K Glücksrad | `lp-wheel-ink` | `lp-surface` | ≥ 3:1 | `#DFBE95`/`#302327` **8.55** PASS | – | Außenring 2px gegen Karte (dunkel) |
| P127 | K Glücksrad | `lp-wheel-seg-a` | `lp-surface` | ≥ 3:1 | – | `#3F2B30`/`#FFFCF7` **12.83** PASS | Radscheibe gegen Karte (hell) |
| P128 | K Glücksrad | `lp-accent` | `lp-surface` | ≥ 3:1 | `#DFBE95`/`#302327` **8.55** PASS | `#7C6029`/`#FFFCF7` **5.76** PASS | Nadel .needle gegen Karte |
| P129 | L Druck | `lp-text` | `lp-paper` | ≥ 4.5:1 | – | `#3B2E1E`/`#FFFFFF` **13.16** PASS | Druck: lp-text auf Papierweiß (Perle-Satz, auch .member) |
| P130 | L Druck | `lp-text-muted` | `lp-paper` | ≥ 4.5:1 | – | `#6E5C44`/`#FFFFFF` **6.41** PASS | Druck: lp-text-muted auf Papierweiß (Perle-Satz, auch .member) |
| P131 | L Druck | `lp-accent` | `lp-paper` | ≥ 4.5:1 | – | `#7C6029`/`#FFFFFF` **5.90** PASS | Druck: lp-accent auf Papierweiß (Perle-Satz, auch .member) |
| P132 | L Druck | `lp-ok` | `lp-paper` | ≥ 4.5:1 | – | `#203342`/`#FFFFFF` **13.01** PASS | Druck: lp-ok auf Papierweiß (Perle-Satz, auch .member) |
| P133 | L Druck | `lp-warn` | `lp-paper` | ≥ 4.5:1 | – | `#8A4B12`/`#FFFFFF` **6.78** PASS | Druck: lp-warn auf Papierweiß (Perle-Satz, auch .member) |
| P134 | L Druck | `lp-danger` | `lp-paper` | ≥ 4.5:1 | – | `#8E2E36`/`#FFFFFF` **8.09** PASS | Druck: lp-danger auf Papierweiß (Perle-Satz, auch .member) |
| P135 | L Druck | `lp-border-control` | `lp-paper` | ≥ 3:1 | – | `#8A785F`/`#FFFFFF` **4.26** PASS | Druck: lp-border-control auf Papierweiß |
| P136 | L Druck | `lp-accent-mark` | `lp-paper` | ≥ 3:1 | – | `#907036`/`#FFFFFF` **4.61** PASS | Druck: lp-accent-mark auf Papierweiß |
| P137 | M Rang (Wallet) | `lp-rank-bronze-ink` | `lp-rank-bronze` | ≥ 4.5:1 | `#FFF0DA`/`#78533F` **6.03** PASS | `#FFF0DA`/`#78533F` **6.03** PASS | Rangplakette bronze (nur nach Freigabe) |
| P138 | M Rang (Wallet) | `lp-rank-silber-ink` | `lp-rank-silber` | ≥ 4.5:1 | `#24252A`/`#C4CBD1` **9.33** PASS | `#24252A`/`#C4CBD1` **9.33** PASS | Rangplakette silber (nur nach Freigabe) |
| P139 | M Rang (Wallet) | `lp-rank-gold-ink` | `lp-rank-gold` | ≥ 4.5:1 | `#322519`/`#C8AC74` **6.79** PASS | `#322519`/`#C8AC74` **6.79** PASS | Rangplakette gold (nur nach Freigabe) |
| P140 | M Rang (Wallet) | `lp-rank-platin-ink` | `lp-rank-platin` | ≥ 4.5:1 | `#30312F`/`#D0D0C9` **8.44** PASS | `#30312F`/`#D0D0C9` **8.44** PASS | Rangplakette platin (nur nach Freigabe) |
| P141 | M Rang (Wallet) | `lp-rank-diamant-ink` | `lp-rank-diamant` | ≥ 4.5:1 | `#203342`/`#D1E2EC` **9.79** PASS | `#203342`/`#D1E2EC` **9.79** PASS | Rangplakette diamant (nur nach Freigabe) |
| P142 | N Info | `lp-focus` | `lp-accent-fill` | Info | `#DFBE95`/`#E0BE98` **1.00** INFO | `#7C6029`/`#E2CFA6` **3.85** INFO | Ring neben Primärpille – 3px-Spalt in Grundfarbe trennt (kein Kriterium) |
| P143 | N Info | `lp-line` | `lp-surface` | Info | `#5A4242`/`#302327` **1.64** INFO | `#E4D5BB`/`#FFFCF7` **1.41** INFO | Trenner dekorativ (kein Control-Rand, kein Kriterium) |
| P144 | N Info | `#B49153` | `lp-surface` | Info | – | `#B49153`/`#FFFCF7` **2.88** INFO | Logo-Gold (Logo von 1.4.3/1.4.11 ausgenommen, nie Text/UI) |

**Nutzungsregeln aus der Tabelle (verbindlich):**
- `--lp-text-subtle` nur auf `lp-bg`, `lp-surface`, `lp-surface-raised`, `lp-field`, nie auf Tönungen, `lp-hover` oder `lp-selected`.
- `--lp-on-accent` nur auf `--lp-accent-fill` (auch gefiltert) und auf Heat-Stufe 3/4 dunkel.
- `--lp-accent-mark` nie als Fließtext (hell 4.03 auf der Seite; nur Marken ≥ 3:1).
- Material-Text (`--lp-member-*`, `--lp-stage-*`) nur auf seinem Material.
- Ringe liegen immer auf einem Grund aus Gruppe E, I oder J. Ein Ring neben der Primärpille (P142 Info, dunkel 1.00:1) wird durch den 3-px-Spalt in Grundfarbe getrennt; bewertet wird der Grund (≥ 4.72).

### C.8 Farbsehschwäche (ΔE_OK nach Machado 2009, Schwere 1.0; < 0.06 = schwer unterscheidbar)

| Paar | Midnight Privé n / p / d / t | Perle n / p / d / t |
|---|---|---|
| `lp-ok` ↔ `lp-danger` | 0.151 / 0.153 / 0.110 / 0.175 | 0.208 / 0.079 / 0.172 / 0.249 |
| `lp-ok` ↔ `lp-warn` | 0.124 / 0.134 / 0.119 / 0.113 | 0.221 / 0.165 / 0.222 / 0.239 |
| `lp-warn` ↔ `lp-danger` | 0.107 / 0.099 / 0.074 / 0.065 | 0.085 / 0.086 / 0.053 / 0.054 |
| `lp-warn` ↔ `lp-accent` | 0.029 / 0.029 / 0.029 / 0.021 | 0.055 / 0.050 / 0.027 / 0.064 |
| `lp-ok` ↔ `lp-accent` | 0.121 / 0.133 / 0.114 / 0.120 | 0.226 / 0.199 / 0.234 / 0.225 |
| `lp-ok` ↔ `lp-text` | 0.057 / 0.040 / 0.056 / 0.065 | 0.069 / 0.062 / 0.067 / 0.073 |
| `lp-danger` ↔ `lp-text-muted` | 0.067 / 0.009 / 0.037 / 0.079 | 0.118 / 0.094 / 0.035 / 0.130 |
| `lp-danger` ↔ `lp-accent` | 0.084 / 0.071 / 0.046 / 0.058 | 0.131 / 0.121 / 0.063 / 0.117 |

Paare unter 0.06 und ihre Formtrennung: ok ↔ Text (dunkel 0.040–0.065) → ok nur mit ✓ und Wort. Warn ↔ Akzent (dunkel 0.021–0.029, hell deutan 0.027) → Dreieck + Wort, der Akzent ist nie Status. Danger ↔ gedämpft (protan dunkel 0.009, deutan hell 0.035) → !-Kreis + Wort, Fehlertext nie gedämpft. Warn ↔ Danger hell (deutan 0.053, tritan 0.054) → verschiedene Zeichen. Ein warmer AA-Warnton mit besserem Abstand wäre nur als lautes Orange möglich (`#F2823D`, ΔE 0.111) und bleibt verworfen (Bestandsaufnahme §7.12).

### C.9 Behobene Kontrastbefunde (vorher → nachher)

| Befund | Fassung 3 | Fassung 4 |
|---|---|---|
| Platzhalter (M4) | `#8F7677` auf `#21191A` 4.12 | `--lp-text-subtle #AB918E` 5.89 (Feld), hell `#6E5C44` 5.61 |
| Kontrollrand (H8) | `#5A4242` 1.88 bg / 1.64 surface / 1.51 card | `#917777` 4.19 / 3.66 / 3.36; hell `#8A785F` 3.73 / 4.16 / 3.41 (auf `#EFE5D4`) |
| Feld-Fokus-Halo (M3) | Halo `rgba(223,190,149,.22)` 1.66 + Doppelring | ein Ring `#DFBE95` 9.80 / 8.55 (hell `#7C6029` 5.16 / 5.76) |
| `.tabelle-scroll`, `summary` (M3) | UA-Ring 1.26 | MP-Ring 8.55 auf der Karte |
| `.btn.gefahr`-Rand | `rgba(240,165,173,.45)` 2.82 | `--lp-danger` 8.77 / 7.66 |
| Stern aus, `.sw`, `.pad`, `.door`, `.list .item`, NPS | `#5A4242` ≤ 1.88 | `--lp-border-control` ≥ 3.36 |
| Heatmap (M23) | 2.17–3.64 bei 12px | fünf Stufen, Zahl ≥ 5.14 |
| Wallet-Buttons (H6) | UA `#6B6B6B`, Text 4.48, 30px | Sekundär md, Text 14.47, 48px |
| Status ok (H1) | `#A9C8AE` h 149.8° (grün) | `#D1E2EC` h 233.4° / `#203342` h 243.1° |
| Hell Gold als Text/UI (H3) | `#B49153` 2.88 / 2.58 / 2.36 | Text `#7C6029` 5.16–5.76, UI `#907036` 3.69–4.50 |
| `a.btn:hover` (Prüfung) | `#F6E9DF` auf `#F2CDA4` 1.46 | Button setzt Hover-Farbe: 9.99 / 11.50 |
| Druck Mitgliedstext (Prüfung, E08) | Entwurfsvarianten 1.19 (F3: `#2A2024` 15.78) | `#3B2E1E` 13.16, gedämpft `#6E5C44` 6.41 (F3 1.82) |
| Druck Plus (H1) | `#3E6B48` (grün) | `#203342` 13.01 |
| Glücksrad-Segmentgrenzen | `#3F2B30`/`#F6E9DF` (fast weiß) | dunkle Segmente + 2px `#DFBE95` (7.46 / 6.56) |
| Pill in gehoverter Zeile (Prüfung, E27) | 4.41 | opake Tönung: 6.24 / 4.93 |

---

## D. Typografie

### D.1 Familien und Schnitte (nur geladene)

| CSS (tokens.json `type.families`) | Stapel | Dateien (`type.fonts`, = club/assets/vendor/font-N.ttf) | Einsatz |
|---|---|---|---|
| `--font-display` (`display`) | `'Cormorant Garamond',Georgia,serif` | 400 `fonts/CormorantGaramond-Regular-400.ttf` (font-2) · 500 `fonts/CormorantGaramond-Medium-500.ttf` (font-3) · 600 `fonts/CormorantGaramond-SemiBold-600.ttf` (font-4, nur Glücksrad-Canvas) · kursiv 400 `fonts/CormorantGaramond-Italic-400.ttf` (font-0) · kursiv 500 `fonts/CormorantGaramond-Italic-500.ttf` (font-1) | Momente: h1–h3, Saldo, Betrag, Pad, Prämien-/Zieltitel, Signatur, Tür, Schrittziffer, Avatar groß |
| `--font-ui` (`ui`) | `Jost,system-ui,-apple-system,sans-serif` | 400 `fonts/Jost-Regular-400.ttf` (font-5) · 500 `fonts/Jost-Medium-500.ttf` (font-6) | Arbeit: Fließtext, Bedienung, Felder, Tabellen, KPI, Link-Feld (statt Browser-Monospace, L11) |

Regeln: `html{font-synthesis:style}` (kein synthetisches Fett, Kursiv bleibt für seltene Jost-`em` erlaubt) · `b,strong{font-weight:500}` (beendet 700 bei `#rewardProgressName`, club/recht `b`) · Seitenrest `font-weight:600` (club:660, 669) → 500 · `code{font:inherit; font-size:var(--lp-fs-13)}` · kein Jost 300. Beide Familien enthalten Kyrillisch (Bestandsaufnahme §3.1), RU braucht also keine Ersatzschrift. Die lokalen Schriften (`club/assets/vendor/fonts.css`, Dateien `club/assets/vendor/font-0.ttf` … `font-6.ttf`) bleiben; die Dateinamen `fonts/…` sind die Namen in `design/tokens.json` für das Artefakt.

### D.2 Schriftstile (Klassen `.lp-t-*` in tokens.json; Altselektoren tragen dieselben Werte)

| Gruppe | Stil (Klasse) | Familie | Größe / Zeile | Gewicht | Laufweite | Stil | Beispiel | Nutzung |
|---|---|---|---|---|---|---|---|---|
| Momente · Cormorant Garamond | `.lp-t-balance` | `--font-display` | 66px / 100% | 400 | -0.04em | normal | „1.240“ | .balance Mitgliedskarte; .lang 52px, .sehrlang 40px, ≤ 340px 52px; lining + tabular. |
| Momente · Cormorant Garamond | `.lp-t-amount` | `--font-display` | 56px / 100% | 400 | 0 | normal | „129,50 €“ | .amount, .customer-balance; ≤ 480px 44px; lining + tabular. |
| Momente · Cormorant Garamond | `.lp-t-h1` | `--font-display` | 38px / 106% | 400 | -0.035em | normal | „Schön, dass du da bist.“ | h1 Club/Terminal/Anmeldung; ≤ 480px 34px; h1 em kursiv 400. |
| Momente · Cormorant Garamond | `.lp-t-h1-compact` | `--font-display` | 34px / 106% | 400 | -0.035em | normal | „Kundinnen“ | .admin-title h1 (≤ 480px 28px), Club-h1 ≤ 480px. |
| Momente · Cormorant Garamond | `.lp-t-figure` | `--font-display` | 34px / 100% | 400 | 0 | normal | „12“ | .empf .zahlen span; lining + tabular. |
| Momente · Cormorant Garamond | `.lp-t-h2` | `--font-display` | 27px / 115% | 500 | -0.025em | normal | „Deine Prämien“ | h2 im Seitenfluss, .reward-heading h2, Kundinnenname .customer h2. |
| Momente · Cormorant Garamond | `.lp-t-key` | `--font-display` | 26px / 100% | 400 | 0 | normal | „7“ | .pad button (≤ 340px 21px); lining + tabular. |
| Momente · Cormorant Garamond | `.lp-t-h2-card` | `--font-display` | 24px / 115% | 500 | -0.025em | normal | „Letzte Buchungen“ | .card h2, .section-title > h2, body.admin h2, .sheet h2, .mp-admin-dialog h2, .admin-bottom h2. |
| Momente · Cormorant Garamond | `.lp-t-title` | `--font-display` | 21px / 120% | 500 | 0 | normal | „Signature-Gesichtsbehandlung“ | h3, .reward-copy strong, .door, .avatar.large. |
| Momente · Cormorant Garamond | `.lp-t-quote` | `--font-display` | 21px / 130% | 500 | 0 | normal | „Noch zwei Besuche bis zu deinem Ziel.“ | .ziel .satz, #zielKarte-Satz. |
| Momente · Cormorant Garamond | `.lp-t-signature` | `--font-display` | 21px / 130% | 400 | 0 | italic | „Mit Liebe, Lorin“ | .club-footer > span. |
| Momente · Cormorant Garamond | `.lp-t-title-s` | `--font-display` | 18px / 115% | 500 | 0 | normal | „Wimpernlifting“ | .reward-list .item strong, .board .pl, .sidebar-foot, Gewinn-Titel. |
| Momente · Cormorant Garamond | `.lp-t-step` | `--font-display` | 16px / 100% | 500 | 0 | normal | „2“ | .reg .plus .z im 32px-Kreis; lining. |
| Text & UI · Jost | `.lp-t-body` | `--font-ui` | 16px / 150% | 400 | 0 | normal | „Du sammelst bei jedem Besuch Perlen.“ | body, Felder, Checkbox-Zeile, Toast. |
| Text & UI · Jost | `.lp-t-body-strong` | `--font-ui` | 16px / 150% | 500 | 0 | normal | „Gesichtsbehandlung“ | .list .item .t, .reg .plus .t, summary. |
| Text & UI · Jost | `.lp-t-lead` | `--font-ui` | 16px / 160% | 400 | 0 | normal | „Schön, dass du da bist.“ | .lead (lp-text-muted, max. 68ch). |
| Text & UI · Jost | `.lp-t-prose` | `--font-ui` | 16px / 170% | 400 | 0 | normal | „Die Teilnahme ist freiwillig.“ | club/recht .wrap p, li (max. 68ch). |
| Text & UI · Jost | `.lp-t-ui` | `--font-ui` | 14px / 150% | 400 | 0 | normal | „Letzter Besuch“ | table, .hinweis, .unklar, .sidebar button, .leer, .log .zeile, .booking .fuer. |
| Text & UI · Jost | `.lp-t-label` | `--font-ui` | 14px / 150% | 500 | 0.02em | normal | „E-Mail-Adresse“ | label (lp-text-muted). |
| Text & UI · Jost | `.lp-t-small` | `--font-ui` | 13px / 150% | 400 | 0 | normal | „noch 120 Perlen“ | .small, .tiny, .muted, .detail, .u, .customer-line, .next, .hint, .linkfeld code. |
| Text & UI · Jost | `.lp-t-pill` | `--font-ui` | 13px / 150% | 500 | 0 | normal | „vom Anbieter angenommen“ | .pill, .consent-state, .feldfehler. |
| Text & UI · Jost | `.lp-t-caption` | `--font-ui` | 12px / 150% | 400 | 0 | normal | „Kundinnen gesamt“ | .metrics span/small, .legal, .member .foot, .sidebar-foot > span, .avatar, .bdelta; .reward-copy .ready 500 .02em. |
| Versalien & Buttons · Jost | `.lp-t-eyebrow` | `--font-ui` | 12px / 150% | 500 | 0.12em | normal | „DEINE PERLEN“ | .eyebrow, .rank, .sidebar .gruppe (uppercase). |
| Versalien & Buttons · Jost | `.lp-t-th` | `--font-ui` | 12px / 150% | 500 | 0.06em | normal | „DATUM“ | table th, .list .item.gewinn .p (uppercase). |
| Versalien & Buttons · Jost | `.lp-t-button` | `--font-ui` | 16px / 125% | 500 | 0.01em | normal | „Perlen buchen“ | Button md/lg (.btn, .secondary, .main-action, Wallet). |
| Versalien & Buttons · Jost | `.lp-t-button-s` | `--font-ui` | 14px / 125% | 500 | 0.01em | normal | „Korrigieren“ | Button sm, Chips, Tabs; .linkbtn mit 400. |
| Zahlen im Werkzeug · Jost | `.lp-t-kpi` | `--font-ui` | 32px / 115% | 500 | 0 | normal | „1.284“ | .metrics strong in Kacheln; em-Einheit 18px/400 muted. |
| Zahlen im Werkzeug · Jost | `.lp-t-kpi-list` | `--font-ui` | 28px / 115% | 500 | 0 | normal | „1.284“ | .metrics strong in Listenform (Container < 448px). |
| Zahlen im Werkzeug · Jost | `.lp-t-num` | `--font-ui` | 14px / 150% | 400 | 0 | normal | „+129“ | td.num, .pts, .list .item .p, .log .zeile .b (500). |
| Bühne · eingefroren | `.lp-t-stage-title` | `--font-display` | 46px / 112% | 400 | -0.02em | normal | „Deine Perle ist da.“ | .mp-feier h2: im CSS clamp(32px,6vw,46px)/1.12 (fluide, einzige Ausnahme); Inline 24px. |
| Bühne · eingefroren | `.lp-t-stage-eyebrow` | `--font-ui` | 12px / 150% | 400 | 0.22em | normal | „DEIN MOMENT“ | .mp-feier .mp-eyebrow (uppercase, .22em). |
| Bühne · eingefroren | `.lp-t-stage-mark` | `--font-ui` | 17px / 150% | 400 | 0.12em | normal | „SIGNATURE“ | .mp-mark (.12em). |
| Bühne · eingefroren | `.lp-t-stage-detail` | `--font-ui` | 16px / 150% | 400 | 0 | normal | „Am Empfang einlösbar.“ | .mp-feier .mp-detail (Inline 14px). |

Größen-, Zeilenhöhen-, Laufweiten- und Gewichtstoken (Familie `typeScale`):

| Token | Wert | Nutzung |
|---|---|---|
| `--lp-fs-12` | `12px` | Boden: .eyebrow, th, .rank, .legal, .member .foot, KPI-Label, .reward-copy .ready, Heatmap-Zahl, .sidebar .gruppe. |
| `--lp-fs-13` | `13px` | .small, .tiny, .muted, .next, .customer-line, .pill, .hint, .feldfehler, .linkfeld code. |
| `--lp-fs-14` | `14px` | UI: table, label, .hinweis, .unklar, .sidebar button, Toast, .leer, Button sm, .linkbtn. |
| `--lp-fs-16` | `16px` | Grundtext, Felder (≥ 16px gegen iOS-Zoom), Button md/lg, .lead, Schrittziffer, NPS. |
| `--lp-fs-17` | `17px` | Nur Bühne .mp-mark (eingefroren). |
| `--lp-fs-18` | `18px` | Titel klein Cormorant: .reward-list strong, .board .pl, .sidebar-foot, Gewinn-Titel; KPI-Einheit em. |
| `--lp-fs-21` | `21px` | Titel Cormorant: h3, .reward-copy strong, .ziel .satz, .door, .avatar.large, Signatur; Pad-Taste ≤ 340px. |
| `--lp-fs-24` | `24px` | h2 in Karte/Dialog/Verwaltung, .section-title > h2, .mp-feier.mp-inline h2. |
| `--lp-fs-26` | `26px` | Pad-Taste Cormorant (.pad button), Bühnen-Schließen „×“. |
| `--lp-fs-27` | `27px` | h2 im Seitenfluss, .reward-heading h2, Kundinnenname. |
| `--lp-fs-28` | `28px` | KPI-Wert in Listenform (n = 1), Verwaltungs-h1 ≤ 480px. |
| `--lp-fs-32` | `32px` | KPI-Wert .metrics strong (Kacheln). |
| `--lp-fs-34` | `34px` | Verwaltungs-h1, Club-h1 ≤ 480px, .empf .zahlen span. |
| `--lp-fs-38` | `38px` | h1 Club/Terminal/Anmeldung. |
| `--lp-fs-40` | `40px` | .balance.sehrlang (≥ 10 Mio.), club/recht .wrap h1 (Seitenrest). |
| `--lp-fs-44` | `44px` | .amount, .customer-balance ≤ 480px. |
| `--lp-fs-52` | `52px` | .balance.lang (≥ 100.000) und .balance ≤ 340px. |
| `--lp-fs-56` | `56px` | .amount, .customer-balance. |
| `--lp-fs-66` | `66px` | .balance (Mitgliedskarte). |
| `--lp-lh-tight` | `1` | Zahlen: .balance, .amount, .customer-balance, .pad button, .empf .zahlen span, Stern, Schrittziffer. |
| `--lp-lh-display` | `1.06` | h1. |
| `--lp-lh-stage` | `1.12` | Bühnentitel .mp-feier h2 (eingefroren). |
| `--lp-lh-heading` | `1.15` | h2, Titel klein, KPI-Wert. |
| `--lp-lh-title` | `1.2` | h3, .reward-copy strong, .door. |
| `--lp-lh-control` | `1.25` | Button-Labels (einzeilig 20px/17.5px, Höhe aus min-height). |
| `--lp-lh-quote` | `1.3` | .ziel .satz, Signatur. |
| `--lp-lh-body` | `1.5` | Grundtext, UI, Label, Tabelle, Meldungen. |
| `--lp-lh-lead` | `1.6` | .lead. |
| `--lp-lh-prose` | `1.7` | Rechtstext .wrap p, li. |
| `--lp-track-balance` | `-.04em` | .balance. |
| `--lp-track-h1` | `-.035em` | h1. |
| `--lp-track-h2` | `-.025em` | h2, h2 in Karte. |
| `--lp-track-stage` | `-.02em` | Bühnentitel (eingefroren). |
| `--lp-track-control` | `.01em` | Button-Labels. |
| `--lp-track-label` | `.02em` | label, .reward-copy .ready. |
| `--lp-track-caps-dense` | `.06em` | Versalien dicht: th, Statuswort in Listen (.list .item.gewinn .p). |
| `--lp-track-caps` | `.12em` | Versalien: .eyebrow, .rank, .sidebar .gruppe, li.titel, .mp-mark. |
| `--lp-track-stage-caps` | `.22em` | Nur Bühnen-Eyebrow .mp-feier .mp-eyebrow (eingefroren). |
| `--lp-fw-regular` | `400` | Cormorant/Jost 400. |
| `--lp-fw-medium` | `500` | Cormorant/Jost 500; b, strong, th, label, Buttons. |
| `--lp-fw-semibold` | `600` | Nur Cormorant 600 im Glücksrad-Canvas („La Perlé“). |
| `--lp-numeric` | `lining-nums tabular-nums` | Ablesezahlen: .num, .balance, .amount, .customer-balance, .pad button, .metrics strong, .next-number, .pts, .list .item .p, .board .pn, .empf .zahlen span, .door .vorn, .nps button, .log .zeile .b, .reg .plus .z, Heatmap. |

### D.3 Zuordnung der Fassung-3-Selektoren

`h1`, `.club .greeting h1`, `.workspace > h1` → lp-t-h1 (≤ 480: 34px) · `.admin-title h1` → lp-t-h1-compact (≤ 480: 28px) · `h2`, `.reward-heading h2`, `.customer h2` → lp-t-h2 (27px in allen Breiten; F3 ≤ 480 25) · `.card h2`, `.section-title > h2`, `body.admin h2`, `.sheet h2` (26 → 24), `.mp-admin-dialog h2`, `.admin-bottom h2` (26 → 24) → lp-t-h2-card · `h3`, `.reward-copy strong` (1.06 → 1.2), `.door` (20 → 21), `.avatar.large` (20 → 21) → lp-t-title · `.ziel .satz` (22 → 21/1.3) → lp-t-quote · `.club-footer > span` (20 → 21) → lp-t-signature · `.reward-list .item strong`, `.board .pl`, `.sidebar-foot` (19 → 18), Gewinn-Titel → lp-t-title-s · `.empf .zahlen span` → lp-t-figure · `.pad button` → lp-t-key (≤ 340: 21px; F3 22) · `.reg .plus .z` (15 → 16) → lp-t-step · `.balance` → lp-t-balance (`.lang` 52, `.sehrlang` 40, ≤ 340 52) · `.amount` (56/1.1 → 56/1), `.customer-balance` (54 → 56) → lp-t-amount (≤ 480: 44) · `body`, Felder, `.filter input` (15 → 16), `.customer-row strong` (15 → 16) → lp-t-body · `.lead` → lp-t-lead · club/recht `.wrap p, li` → lp-t-prose · `table`, `.hinweis`, `.unklar`, `.sidebar button`, `.leer`, `.log .zeile`, `.booking .fuer`, `.toast` (15 → 14) → lp-t-ui · `label` → lp-t-label · `.small`, `.tiny`, `.muted`, `.detail`, `.u`, `.customer-line`, `.next`, `.pts`, `.hint` → lp-t-small · `.pill`, `.consent-state`, `.feldfehler` → lp-t-pill · `.metrics span/small`, `.legal`, `.member .foot`, `.sidebar-foot > span`, `.avatar`, `.bdelta`, `.reward-copy .ready` (500, .02em) → lp-t-caption · `.eyebrow` (.15 → .12em), `.rank` (.08 → .12em, 500), `.sidebar .gruppe` → lp-t-eyebrow · `th`, `.list .item.gewinn .p` → lp-t-th · `.btn`, `.main-action`, `.secondary` (14 → 16) → lp-t-button · `.btn.sm`, Chips, Tabs, `.linkbtn` (400) → lp-t-button-s · `.metrics strong` → lp-t-kpi (Listenform lp-t-kpi-list) · `td.num`, `.list .item .p`, `.log .zeile .b` (500) → lp-t-num · `.mp-feier h2`, `.mp-feier .mp-eyebrow`, `.mp-mark`, `.mp-detail` → lp-t-stage-* (eingefroren).

Ergebnis: 29 gerenderte Größen werden zu 19 Stufen (19 Token `--lp-fs-*`). Stufen 10, 15, 19, 20, 22, 25, 30 (außer Sternglyphe), 33 und 54 entfallen. 17px bleibt nur auf der Bühne.

### D.4 Zeilenhöhe, Umbruch, Messlänge

- Zeilenhöhen nur aus `--lp-lh-*`. Alle 9 impliziten `normal` (Kurzform `font:` ohne `/lh`, Bestandsaufnahme §3.5) bekommen einen Wert; die Kurzform wird im Block immer mit Zeilenhöhe geschrieben.
- `h1,h2,h3,.reward-copy strong,.balance{text-wrap:balance}` · `p,li,.lead,.hint{text-wrap:pretty}` · `h1,h2,h3{font-kerning:normal}`.
- Messlänge: `.lead`, club/recht `p, li`, `.pending p` → `max-width:var(--lp-measure-prose)` 68ch (L7: 102 → ≤ 68 cpl). Zentrierte Leitsätze (`.club .greeting .lead`) mit `margin-inline:auto`. `.card p.muted`, `.card p.small`, `.hint`, Text in `.hinweis` → `max-width:var(--lp-measure-help)` 72ch (Verwaltung 172–181 → ≤ 72 cpl).
- `overflow-wrap:anywhere` nur für Nutzerdaten (Name, E-Mail, URL, Prämienname, Saldo): `.balance`, `.customer h2`, `.customer-row strong`, `.reward-copy strong`, `.mp-mark`, `.linkfeld code`, `.brandbar .user`. Sonst `overflow-wrap:break-word`. `hyphens:auto` nur für `p, li, .lead, .hinweis, .unklar .txt` und nur mit korrektem `lang` am `<html>` (Seitenpflicht). Nie in Buttons, Labels, Zahlen oder URLs.

### D.5 Ziffern und Formate

- `font-variant-numeric:var(--lp-numeric)` (`lining-nums tabular-nums`; Cormorant: GSUB `lnum`/`tnum` in font-2/3 vorhanden; Jost: `tnum`) auf `.num, td.num, th.num, .balance, .amount, .customer-balance, .pad button, .metrics strong, .next-number, .pts, .list .item .p, .board .pn, .empf .zahlen span, .door .vorn, .nps button, .log .zeile .b, .reg .plus .z, .kunde-nr, [data-stufe]`. In Überschriften und Sätzen bleiben die Mediävalziffern von Cormorant.
- Formate (Seiten-JS, beide Apps gleich, `Intl.NumberFormat('de-DE')`): Ganzzahl „1.284“ · Minus „−300“ (U+2212, in beiden Schriften vorhanden) · Betrag „129,50 €“ mit U+00A0 (U+202F fehlt in Jost) · Prozent „3,8 %“ mit U+00A0 (nicht `toFixed`) · Datum in Tabelle und Liste „20.09.2026“, im Verlauf „20.09.“ + „14:05“, im Fließtext „20. September 2026“ · Trenner zwischen Datum und Name „ · “ („20.09. · Anna“ statt „20. Sept.Anna“) · Terminal-Saldo „1284“ → „1.284“.

### D.6 Mindestgröße, Versalien, Laufweite, Mehrsprachigkeit

- Boden **12px** für jeden Text (`.brandbar .logo span` 10 → 12, ungenutzt).
- Versalien nur bei 12px: `--lp-track-caps` .12em (Eyebrow, Rang, Sidebar-Gruppe, `li.titel`) oder `--lp-track-caps-dense` .06em (`th`, Statuswort in Listen). Die Bühnen-Eyebrow bleibt .22em (eingefroren). Verwaltungs-`th` 14px versal → 12px (M27). Aus 7 Versal-Laufweiten werden 2 (+1 Bühne).
- Übrige Laufweiten: Display −.04 / −.035 / −.025em, Bühnentitel −.02em, Buttons .01em, Label und `.ready` .02em.
- DE/EN/RU mit +40 % Budget: Kopfzeilen `.member .head`, `.reward-heading`, `.customer-top`, `.section-title`, `.admin-title`, `.brandbar`, `.brandbar .user` umbrechen mit `flex-wrap:wrap` und `min-width:0`, statt abzuschneiden. Buttons höchstens zwei Zeilen. Sidebar-Einträge höchstens zwei Zeilen in 200px. `th` darf umbrechen (`white-space:normal`), Zahlen nie. Kyrillische Versalien bekommen dieselben Laufweiten. Keine Wörter in CSS `content`: Die Seitenrest-Texte „Zum Bestätigen anklicken“ / „✓ Bestätigt“ wandern ins Markup (H.6).

---

## E. Raum & Layout

### E.1 Abstandsskala, Rhythmus, Innenabstände (Familie `spacing`)

| Token | Wert | Nutzung |
|---|---|---|
| `--lp-space-hair` | `2px` | Haarfuge: Titel ↔ Unterzeile in .list .item (row-gap), .pill oben/unten. |
| `--lp-space-1` | `4px` | Skala 1: Sterne-Abstand, Tabs-Abstand, Pill-Glyph-Abstand, .sidebar gap. |
| `--lp-space-2` | `8px` | Skala 2: Chips/NPS-Raster (6/4 als Sonderwert), Label → Feld, Eyebrow → Titel, .door padding. |
| `--lp-space-3` | `12px` | Skala 3: Button-Reihen gap, Icon ↔ Label (md/lg), Box-Innenrand y, .formzeile gap. |
| `--lp-space-4` | `16px` | Skala 4: Feld → Feld, Box-Innenrand x, KPI-Zelle, Karte → Karte Verwaltung. |
| `--lp-space-5` | `20px` | Skala 5: Karten-Innenrand kompakt/Telefon, Markenleiste oben/unten, Gutter 360–768. |
| `--lp-space-6` | `24px` | Skala 6: Karten-Innenrand, Gruppenabstand, Hauptaktion oben, Terminal-Stapel. |
| `--lp-space-7` | `32px` | Skala 7: Abschnittsabstand, Gutter ≥ 769, Sheet unten. |
| `--lp-space-8` | `48px` | Skala 8: .sidebar-foot oben, große Leerzustände. |
| `--lp-rhythm-inside` | `8px` | Rhythmus innen: Eyebrow → Titel, Label → Feld, Titel → Meta, .next → .track, .sheet h2 unten. |
| `--lp-rhythm-between` | `16px` | Rhythmus zwischen: .field, Text → .aktionen, Kopf → Inhalt, Karte → Karte (Verwaltung), .unklar unten. |
| `--lp-rhythm-group` | `24px` | Rhythmus Gruppe: .main-action oben, .booking-separator, .section-title oben, .searchrow unten, Terminal-Stapel. |
| `--lp-rhythm-section` | `32px` | Rhythmus Abschnitt: .club section, .metrics oben/unten, .reward-heading oben, .admin-bottom oben. |
| `--lp-pad-card` | `24px` | Karten-Innenrand ≥ 481px: .card, .customer, .ziel, .card-dark, .admin-bottom, .sheet .card, .dialog, .mp-admin-dialog. |
| `--lp-pad-card-sm` | `20px` | Karten-Innenrand < 481px (dieselben Bauteile). |
| `--lp-pad-card-compact` | `20px` | Karten-Innenrand Verwaltung (body.admin .card) in allen Breiten. |
| `--lp-pad-tile` | `16px` | Kachel: .metrics > div, .consent-card, .reward-copy, .card.einlass. |
| `--lp-pad-box-y` | `12px` | Meldungsbox oben/unten: .toast, .hinweis, .unklar, .beob, .mp-kurz. |
| `--lp-pad-box-x` | `16px` | Meldungsbox links/rechts: .toast, .hinweis, .unklar, .beob, .mp-kurz. |
| `--lp-pad-control-y` | `8px` | Button oben/unten (wirkt erst bei Mehrzeiligkeit; Höhe kommt aus min-height). |
| `--lp-pad-control-x` | `24px` | Button md/lg links/rechts. |
| `--lp-pad-control-x-sm` | `16px` | Button sm, Chip, Tab links/rechts. |
| `--lp-pad-field-x` | `16px` | Feld links/rechts (select rechts 44px), .search, .linkfeld code. |
| `--lp-pad-field-x-sm` | `12px` | Feld sm (.filter, Tabellenzelle) links/rechts. |
| `--lp-pad-cell-y` | `12px` | Tabellenzelle oben/unten Komfort/Theke (Club, Terminal, Recht). |
| `--lp-pad-cell-y-dense` | `8px` | Tabellenzelle oben/unten Dicht (body.admin, table.dicht). |
| `--lp-pad-cell-x` | `12px` | Tabellenzelle links/rechts (alle Tabellen). |
| `--lp-gutter-xs` | `16px` | Seitenrand < 360px (--lp-gutter Laufzeit): .club, .workspace, .admin-content, Markenleiste, .login, Toast, Sheet. |
| `--lp-gutter-s` | `20px` | Seitenrand 360–768px. |
| `--lp-gutter-l` | `32px` | Seitenrand ≥ 769px. |
| `--lp-gap-actions` | `12px` | Abstand in Button-Reihen (.aktionen, .zielaktionen, .searchrow, .linkfeld, .row, .filter, .club-footer > div), horizontal und vertikal. |
| `--lp-gap-chips` | `8px` | Abstand Chips/.categories, Pills, .advent-Raster, .pad-Raster. |
| `--lp-gap-icon` | `12px` | Icon ↔ Label in Buttons md/lg. |
| `--lp-gap-icon-sm` | `8px` | Icon ↔ Label in Buttons sm, .linkbtn. |
| `--lp-gap-kpi` | `16px` | Abstand KPI-Kacheln (.metrics). |

Überführung der 33 Altwerte (Bestandsaufnahme §4.1): 2/3 → 2 · 4/5 → 4 · 6/7/8/9 → 8 · 10/11/12/14 (Gap) → 12 · 14 (Padding)/15/16/17/18/19 → 16 · 20/21/22 → 20 · 22 (übrige)/23/24/25/26/27 → 24 · 28/29/30/32/35/38 → 32 · 40/48 → 48. Layoutwerte bleiben benannt: Sheet-Oberkante `min(90px,12vh)`, Login `margin-top:12vh`, Bühne (eingefroren), negative Kunst-Margins der Bühne.

### E.2 Rhythmus-Regel

| Stufe | Wert | Anwendung (Fassung 3 → 4) |
|---|---|---|
| innen `--lp-rhythm-inside` | 8px | Eyebrow → Titel (7/9/12 → 8), Label → Feld (6/4 → 8), Titel → Meta, `.next` → `.track` (10 → 8), `.sheet h2` unten (8), `.club section > .eyebrow` (7 → 8) |
| zwischen `--lp-rhythm-between` | 16px | `.field` (16), Text → `.aktionen` (16), Titel → Inhalt (`.club section > h2` 12 → 16), `.reward-heading` unten (17 → 16), `.zielaktionen` oben (14 → 16), Karte → Karte Verwaltung (16), `.unklar` unten (16), `.section-title` unten (14 → 16), Pad oben (0 → 16) |
| Gruppe `--lp-rhythm-group` | 24px | `.main-action` oben (25/20 → 24), `.booking-separator` (24), `.section-title` oben (24), `.searchrow` unten (27 → 24), `.workspace > h1` unten (25 → 24), Pad unten (20 → 24), Terminal-Stapel (26 → 24; ≤ 768 18 → 16), `.club-footer` (21 → 24), `.next` oben (21 → 24) |
| Abschnitt `--lp-rhythm-section` | 32px | `.club section` (32), `.reward-heading` oben (27 → 32), `.metrics` oben/unten (28/35 → 32/32), `.admin-bottom` oben (28 → 32), Begrüßung `padding:32px 0` (30) |

Abstände entstehen nur über `gap` des Elternteils oder `margin-top` des Folgeelements, nie über `margin-bottom` von Labels an Behältern (behebt `label.search`, M11). Das Club-Dashboard (390px, gemessen 0/27/17/0/32/10/21/10/25/32/32/32/21/21) hat damit nur noch 8/16/24/32. Die rund 30 Inline-Margins im Club und 89 in der Verwaltung werden seitenseitig durch diese Stufen ersetzt (H.6).

### E.3 Box-Innenabstände

| Box | Fassung 3 | Fassung 4 |
|---|---|---|
| `.card`, `.customer`, `.ziel`, `.card-dark`, `.admin-bottom`, `#rechtsBestaetigung` | 24 / 25 / 20 / 25 / 25 / 22 | `var(--lp-pad)` = 24 (≥ 481), 20 (< 481) |
| `body.admin .card` | 20 | `--lp-pad-card-compact` 20 (alle Breiten) |
| `.sheet .card`, `.dialog`, `.mp-admin-dialog` | 30 / 30 / 24 | `var(--lp-pad)` (24 / 20) |
| `.metrics > div`, `.consent-card`, `.reward-copy`, `.card.einlass` | 16 / 18 / `17px 15px` / – | `--lp-pad-tile` 16 (`.reward-copy` < 481: `16px 12px`) |
| Toast, `.hinweis`, `.unklar`, `.mp-kurz` | `14px 20px` / `12px 16px` / `14px 16px` / `12px 16px` | `12px 16px` (`--lp-pad-box-y/-x`) |
| `.beob` | `8px 14px` | `8px 16px` |
| `.leer` | `24px 16px` | = |
| Tabellenzelle | `10px 8px` / Verwaltung `9px 8px` | `td 12px 12px`, `th 8px 12px`; dicht `8px 12px` |
| **Material (wertgleich, Ausnahme von der Skala)** | `.member` `22px 22px 16px` (≤ 480 `20px 16px 14px`), Innenrahmen `inset:8px`/11px; `.mp-reward` `18px 20px`; Bühne `0 24px 28px`; Inline-Bühne `14px 16px 14px` | unverändert – Kette, Perlenpositionen (in %) und Glanz sind auf diese Maße abgestimmt |

### E.4 Seitenrand und Umbrüche

| Breite | Abfrage | `--lp-gutter` | `--lp-pad` | Wirkung |
|---|---|---|---|---|
| < 360px | Basis | 16px | 20px | NPS-gap 4px; Pad-Tasten ≤ 340: 48px/21px, gap 6; Saldo ≤ 340: 52px |
| 360–480px | `(min-width:360px)` | 20px | 20px | Telefon: Aktionen füllen die Zeile (≤ 480), Advent 3 Spalten (≤ 600, E37), h1 34, Betrag 44, Motivspalte 87px |
| 481–768px | `(min-width:481px)` | 20px | 24px | Karten 24, h1 38, Motivspalte 102px |
| ≥ 769px | `(min-width:769px)` | 32px | 24px | Terminal zweispaltig, Sidebar sichtbar und sticky, Markenleiste mit Eyebrow |
| ≥ 1024px | `(min-width:1024px)` | 32px | 24px | `.grid2` zweispaltig (Seitenrest) |
| Sonderfall | `(max-width:400px)` | – | – | Perle p1 `left:9%`, p6 `left:91%` (wertgleich) |

Die Fassung-3-Grenzen 1023/768/480/400/340 bleiben als `max-width`-Abfragen erhalten (gleiches Verhalten an den Grenzpixeln). Neu ist `min-width:360px` für den Gutter. Das heutige Gutter-Gemisch (mobil 16/17/19/20px und `x = 0` bei „Bereiche“) wird überall 16/20/32.

### E.5 Container und Messlängen (Familie `measure`)

| Token | Wert | Nutzung |
|---|---|---|
| `--lp-container-club` | `394px` | Inhaltsbreite .club (Fassung 3: 450 − 2 × 28); max-width = 394px + 2 × Gutter. |
| `--lp-container-login` | `380px` | Inhaltsbreite .login (Fassung 3: 420 − 2 × 20). |
| `--lp-container-home` | `640px` | Terminal .home-grid (Seitenrest). |
| `--lp-container-prose` | `720px` | club/recht .wrap (Seitenrest). |
| `--lp-container-wide` | `1200px` | .workspace, .admin-content (max-width). |
| `--lp-dialog-s` | `400px` | .sheet .card, .dialog (vorher 390px). |
| `--lp-dialog-m` | `540px` | .sheet .card.breit, .mp-admin-dialog (vorher 540/520px). |
| `--lp-toast-max` | `520px` | Toast Höchstbreite. |
| `--lp-pad-max` | `360px` | .pad Höchstbreite (vorher 320px). |
| `--lp-sidebar-w` | `200px` | .admin-layout Spalte 1 (vorher 176px). |
| `--lp-table-min` | `560px` | .tabelle-scroll > table min-width (wertgleich). |
| `--lp-stage-max` | `480px` | .mp-feier .buehne (eingefroren). |
| `--lp-stage-reward-max` | `370px` | .mp-reward (eingefroren). |
| `--lp-measure-prose` | `68ch` | Fließtext: .lead, club/recht p/li, .pending p. |
| `--lp-measure-help` | `72ch` | Hilfetext in Karten: .card p.muted, .card p.small, .hint, .hinweis-Text. |
| `--lp-kpi-cols-2` | `448px` | Containerbreite .metrics ab der 2 KPI-Spalten gelten (Kachelinhalt ≥ 184px; nur Dokumentation – @container kann keine var() lesen). |
| `--lp-kpi-cols-3` | `680px` | Containerbreite ab 3 KPI-Spalten (Dokumentation). |
| `--lp-kpi-cols-4` | `912px` | Containerbreite ab 4 KPI-Spalten für 4/7/8 Kacheln (Dokumentation). |
| `--lp-kpi-cols-5` | `1144px` | Containerbreite ab 5 KPI-Spalten für 5/10 Kacheln (Dokumentation). |

`.club{max-width:calc(var(--lp-container-club) + 2 * var(--lp-gutter)); margin:0 auto}` (Inhalt 394px wie heute; auf dem Desktop bewusst eine Telefonspalte, L16). `.login{max-width:calc(var(--lp-container-login) + 2 * var(--lp-gutter))}`. Umbrüche (Familie `breakpoint`, Dokumentation):

| Token | Wert | Nutzung |
|---|---|---|
| `--lp-bp-xxs` | `340px` | max-width: Pad gap 6px, Taste 48px/21px, .balance 52px (Fassung-3-Grenze; Dokumentation, @media liest keine var()). |
| `--lp-bp-xs` | `360px` | min-width: Gutter 16 → 20px, NPS-gap 4 → 6px. |
| `--lp-bp-pearl` | `400px` | max-width: Perle p1 9 %, p6 91 % (wertgleich). |
| `--lp-bp-sm` | `481px` | min-width: Karten 20 → 24px, Motivspalte 87 → 102px; max-width 480px = darunter (Aktionen füllen die Zeile). |
| `--lp-bp-md` | `769px` | min-width: Terminal zweispaltig, Sidebar sichtbar + sticky, Gutter 32px; max-width 768px = darunter. |
| `--lp-bp-lg` | `1024px` | min-width: .grid2 zweispaltig (Seitenrest). |

### E.6 Sichere Bereiche (Terminal als Standalone-Web-App, `viewport-fit=cover`, L12)

```css
.club,.workspace,.admin-content,.login{ padding-inline:max(var(--lp-gutter),env(safe-area-inset-left)) max(var(--lp-gutter),env(safe-area-inset-right)); }
.terminal .brandbar,.admin .brandbar{ padding:calc(var(--lp-space-5) + env(safe-area-inset-top)) max(var(--lp-gutter),env(safe-area-inset-right)) var(--lp-space-5) max(var(--lp-gutter),env(safe-area-inset-left)); }
.workspace,.admin-content{ padding-bottom:calc(var(--lp-gutter) + env(safe-area-inset-bottom)); }
.toast,#toast,.note{ bottom:calc(var(--lp-space-6) + var(--_toast-offset) + env(safe-area-inset-bottom)); }
.sheet,.overlay{ padding-bottom:calc(var(--lp-space-7) + env(safe-area-inset-bottom)); }
```

Ohne Aussparung ergibt `env()` 0, dann gelten die Werte des Gutters. Die Bühne bleibt unverändert (Overlay `padding:16px`).

### E.7 Überlauf

- Jedes Flex-/Grid-Kind mit Text bekommt `min-width:0` (`.grid2 > *`, `.stapel > *`, `.filter > div`, `.metrics > *`, `.admin-content`, `.aktionen > *`, `.customer-row > div`, `.next > div`, `.reward-copy`).
- Tabellen stehen immer in `.tabelle-scroll`. Sicherheitsnetz im Block ohne Markup: `.card:has(table), .grid2 > *{overflow-x:auto}` – jede Tabelle ohne Hülle (~12 in der Verwaltung, `table.korr` im Terminal) scrollt in ihrer Karte, statt die Seite zu verbreitern (H9, H10; Beispiel Zielgruppe 82/88px Überlauf → 0).
- Terminal < 769 (H9): `@media (max-width:768px){ .terminal .terminal-spalten{align-items:stretch; gap:var(--lp-rhythm-between)} }` (0,2,0 schlägt den Seitenrest 0,1,0). Alle Karten nutzen die volle Breite (vorher 310–728px), die Korrekturtabelle scrollt in der Karte (vorher 94–127px Überlauf).
- `body{overflow-x:hidden}` bleibt, bis H.7 Nr. 3 bei 320/360/390 auch ohne die Regel `scrollWidth − innerWidth = 0` ergibt. Danach wird sie gestrichen (L14). Eine vorzeitige Entfernung würde unbekannte Restüberläufe live schalten.
- `100vh` → `100dvh` für die Verwaltung (`.admin-layout`, `.sidebar`). Die Bühne behält `max-height:calc(100vh - 32px)` (eingefroren). `.mp-admin-dialog` nutzt bereits `100dvh`.

---

## F. Form & Tiefe

### F.1 Radien (Familie `radius`)

| Token | Wert | Nutzung |
|---|---|---|
| `--lp-radius-bar` | `3px` | .track, .bars div (3px 3px 0 0), Heatmap-Zelle (Wert Fassung 3). |
| `--lp-radius-m` | `12px` | Control/Kachel: Feld, .search, select, textarea, .list .item, .pad button, .nps button, .hinweis, .unklar, Toast, .sidebar button, .linkfeld code, .gewinn .bild, .mp-kurz. |
| `--lp-radius-l` | `18px` | Fläche: .card, .customer, .ziel, Dialog/Sheet, .member, .featured-reward, .consent-card, .scanbox, .leer, .sidebar.offen. |
| `--lp-radius-action` | `28px` | Jeder Button (primär, sekundär, sm, Gefahr, Hauptaktion, Chip, Wallet): einzeilig 44/48/56px = Pille, mehrzeilig 28px-Ecke; nie zustandsabhängig. |
| `--lp-radius-pill` | `999px` | .pill, .sw, Tab-Unterstrich-Enden – immer Kapsel. |
| `--lp-radius-circle` | `50%` | .icon-button, .avatar, .pearl, .reg .plus .z, Bühnenteile, Orbit. |
| `--lp-radius-member-frame` | `11px` | Material: Innenrahmen .member::before (wertgleich Fassung 3). |
| `--lp-radius-inner` | `16px` | Material: .mp-reward, Inline-Bühne, .scanbox .frame (wertgleich). |
| `--lp-radius-stage` | `24px` | Material: .mp-feier .buehne (wertgleich). |
| `--mp-r-card` | `18px` | Kompat-Alias Fassung 3 → --lp-radius-l (CSS: var()). |
| `--mp-r-control` | `12px` | Kompat-Alias Fassung 3 → --lp-radius-m (club/recht Seitenrest nutzt ihn). |
| `--mp-r-pill` | `999px` | Kompat-Alias Fassung 3 → --lp-radius-pill (bisher 50px; bis 100px Höhe identische Kapsel). |

Zuordnung: **28px** jeder Button (`.btn`, `.btn-gold`, `.main-action`, `.secondary`, `.btn-line`, `.btn-ghost`, `.btn.ghost`, `.btn.sm`, `.btn.gefahr`, `.btn.danger`, `.categories > button`, Wallet, Bühnenbutton, `.bereiche-btn`). Bei 44/48/56px Höhe ergibt das eine Kapsel; zweizeilig (53/58px) eine weiche Ecke. **999px** `.pill`, `.sw`, `.track`. **12px** Feld, `.search`, `select`, `textarea`, `.list .item`, `.pad button`, `.nps button`, `.hinweis`, `.unklar`, Toast, `.sidebar button` (8 → 12), `.linkfeld code`, `.gewinn .bild`, `.mp-kurz`. **18px** `.card`, `.customer`, `.ziel`, Dialog/Sheet, `.member`, `.featured-reward` (12.6 → 18), `.consent-card` (16 → 18), `#rechtsBestaetigung`, `.scanbox`, `.leer`. **3px** `.track`, `.bars div` (`3px 3px 0 0`), Heatmap-Zelle. **50%** `.icon-button`, `.avatar`, `.pearl`, `.reg .plus .z`, Bühnenteile. **Material wertgleich:** 11px Innenrahmen der Mitgliedskarte, Adventskasten `80px 80px 24px 24px` und Bogentür `30px 30px 4px 4px` mit Flügeln `30px 0 0 4px` / `0 30px 4px 0` (E37, aus `design/relaunch`), 16px Bühnenprämie, Inline-Bühne und Scanrahmen, 24px Bühne, organische Perlenradien `48% 52% 47% 53%` / `49% 51% 47% 53%`. Ein Radius wechselt nie mit dem Zustand (Funktionsschalter B:1857, Tabellenzeile B:2012).

### F.2 Rahmen (Familie `borderWidth`)

| Token | Wert | Nutzung |
|---|---|---|
| `--lp-border` | `1px` | Jeder Rand und Trenner (auch Primärbutton, damit alle Varianten dasselbe Außenmaß haben). |
| `--lp-border-bar` | `3px` | Akzentbalken .hinweis, .beob; Navigationsmarke (inset box-shadow). |
| `--lp-border-orbit` | `2px` | .orbit der Prämienperle (wertgleich). |
| `--lp-border-scan` | `1.5px` | .scanbox .frame (wertgleich). |
| `--lp-border-spinner` | `2px` | .laedt::after Ring. |
| `--lp-border-wheel` | `2px` | Glücksrad: Segmenttrennlinie und Nabenring (Canvas). |
| `--lp-focus-width` | `2px` | Fokusring (wertgleich). |
| `--lp-focus-offset` | `3px` | Fokusversatz außen (wertgleich). |
| `--lp-focus-offset-inset` | `-2px` | Fokusversatz .pearl innen (wertgleich). |

Jeder Button hat `1px solid` (Primär: Randfarbe `--lp-accent-fill-edge`), damit alle Varianten dasselbe Außenmaß haben. Die UA-Fase `2px outset` von `.secondary`/Wallet entfällt (H5, H6). Gewählte Zustände nutzen `box-shadow:var(--lp-shadow-selected)` zusätzlich zum 1-px-Rand, also 2px optisch ohne Layoutsprung (die 2px-Ränder von Einwilligung und UA verschwinden). Farben: Trennung `--lp-line`, Zeile/Leiste `--lp-line-soft` (ersetzt `#6C4C483F` und `rgba(90,66,66,.55)`), Karte `--lp-card-edge`, Control `--lp-border-control`, gewählt/Marke `--lp-accent-mark`, Status `--lp-ok/-warn/-danger`.

### F.3 Schatten und Elevation (Familie `shadow`, je Thema)

| Token | Wert | Nutzung |
|---|---|---|
| `--lp-shadow-1` | dunkel `none` · hell `0 1px 2px rgba(58,42,23,.06)` | Stufe 1 Karte (.card, .customer, .ziel): dunkel Stufe über Tonwert, hell Papierkante. |
| `--lp-shadow-2` | dunkel `0 14px 34px rgba(16,13,16,.6)` · hell `0 10px 30px rgba(58,42,23,.1), 0 1px 2px rgba(58,42,23,.06)` | Stufe 2 schwebend: Toast, .sheet .card, .dialog, .mp-admin-dialog (immer zusammen mit lp-shadow-lustre). |
| `--lp-shadow-lustre` | dunkel `inset 0 1px 0 rgba(255,240,218,.06)` · hell `inset 0 1px 0 rgba(255,255,255,.7)` | Perlmutt-Haarlicht oben: Primärfläche, Toast, Dialog/Sheet. |
| `--lp-shadow-object` | dunkel `none` · hell `0 10px 30px rgba(58,42,23,.1), 0 1px 2px rgba(58,42,23,.06)` | Nachtobjekt auf Papier: .member, .scanbox (hell); wird in Inseln nicht neu deklariert. |
| `--lp-shadow-selected` | dunkel `inset 0 0 0 1px #DFBE95` · hell `inset 0 0 0 1px #907036` | Gewählte Auswahlkarte, .bestaetigt: 1px innen zusätzlich zum 1px-Rand = 2px optisch ohne Layoutsprung. |
| `--lp-shadow-invalid` | dunkel `inset 0 0 0 1px #F0A5AD` · hell `inset 0 0 0 1px #8E2E36` | Feld [aria-invalid="true"] zusätzlich zum Rand lp-danger. |
| `--lp-shadow-reward-edge` | dunkel `none` · hell `inset 0 0 0 1px #EADEC9` | .featured-reward, .door.auf: hell Papierkante um den Crème-Verlauf, dunkel keine (wie Fassung 3). |
| `--lp-shadow-pearl` | `inset -2px -3px 5px #A8998A, 0 5px 9px #1E140F70` | Kettenperle .pearl::before (wertgleich mp:278). |
| `--lp-shadow-pearl-deko` | `inset -2px -3px 5px #A8998A` | Deko-Perle .pearl.deko::before (wertgleich mp:280). |
| `--lp-shadow-artpearl` | `inset -4px -5px 7px #9C898744, 5px 12px 18px #4B322B24` | .art-pearl, .dialog-pearl, .bottom-pearl (wertgleich mp:299). |
| `--lp-shadow-stagepearl` | `inset -8px -7px 14px #24181C88, 0 14px 26px #0008` | Bühnenperle .mp-pearl (wertgleich mp:486). |
| `--lp-shadow-kurzpearl` | `0 4px 12px rgba(0,0,0,.4)` | .mp-kurz .p (wertgleich mp:419). |
| `--lp-shadow-orbit` | `0 0 22px #D6B78318, inset 0 0 20px #D6B78315` | .mp-orbit (wertgleich mp:488). |

| Ebene | Fläche | dunkel | hell |
|---|---|---|---|
| 0 Seite | `--lp-bg` | – | – |
| Einlass | `--lp-field` | Seitenton in der Karte | Seitenton in der Karte |
| 1 Karte | `--lp-surface` + 1px `--lp-card-edge` | Tonstufe 1.15:1, kein Schatten | Papierkante `#EADEC9` + `--lp-shadow-1` |
| 2 schwebend | Toast `--lp-surface-raised`; Dialog/Sheet `--lp-surface` | `--lp-shadow-2` + `--lp-shadow-lustre` | `--lp-shadow-2` + `--lp-shadow-lustre`, Fläche `#FFFCF7` (nie dunkler als die Seite) |
| Objekt | `.member`, `.scanbox` | – | `--lp-shadow-object` |
| Bühne | `--lp-stage` | Perlen-/Orbit-Schatten wertgleich | = |

Kombinationen: `box-shadow:var(--lp-shadow-2), var(--lp-shadow-lustre)` (beide nie `none`). `--lp-shadow-1`, `--lp-shadow-object`, `--lp-shadow-reward-edge` stehen immer allein, weil sie dunkel `none` sind.

### F.4 Scrims

Ein Scrim für `.sheet`, `.overlay` und `.mp-admin-dialog::backdrop`: `--lp-scrim` (dunkel `rgba(16,13,16,.78)`, hell `rgba(59,46,30,.42)`) mit `backdrop-filter:blur(6px)`. Vorher waren es `#1C130BB5` mit 7px bzw. ein Scrim ohne Blur. `::backdrop` erbt Custom Properties erst in neueren Engines; deshalb gilt `background:rgba(16,13,16,.78); background:var(--lp-scrim,rgba(16,13,16,.78))`, ältere Browser zeigen den dunklen Scrim. Die Bühne behält ihren eingefrorenen Scrim `--lp-scrim-stage rgba(16,13,16,.86)` mit 6px.

### F.5 Ebenen (Familie `zIndex`) und Überlagerungsregeln

| Token | Wert | Nutzung |
|---|---|---|
| `--lp-z-below` | `-1` | Dekor hinter Inhalt in isolation:isolate: .member::after, .pearl::before. |
| `--lp-z-local` | `2` | Lokal: .needle, .mp-pearl (wertgleich). |
| `--lp-z-local-2` | `3` | Lokal: .mp-check (wertgleich). |
| `--lp-z-local-3` | `5` | Lokal: .mp-feier .zu (wertgleich). |
| `--lp-z-sticky` | `100` | .sidebar sticky ≥ 769px (eigene Spalte, überdeckt nichts). |
| `--lp-z-float` | `600` | Reserviert: schwebende Bedienelemente (z. B. Chat-Starter der Website); schieben den Toast über --_toast-offset nach oben. |
| `--lp-z-nav` | `700` | Reserviert: mobiles Menü als Ebene (heute im Fluss, „Bereiche“ klappt im Fluss auf). |
| `--lp-z-sheet` | `800` | .sheet, .overlay (wertgleich). Natives <dialog> liegt im Top Layer über allem. |
| `--lp-z-toast` | `900` | .toast, #toast, .note (wertgleich) – über Sheets. |
| `--lp-z-stage` | `1000` | .mp-feier (wertgleich) – oberste Ebene, Hintergrund inert. |

1. Es gibt nur diese Werte. Lokale Werte 2/3/5 gelten nur innerhalb von `isolation:isolate`. Kein anderes Element setzt `z-index > 5`.
2. Markenleiste und Kopf sind nicht fixiert, das mobile Menü („Bereiche“) klappt im Fluss auf. Kopf und Menü können sich deshalb nicht überlagern. Wird eine Kopfzeile je sticky, bekommen Anker `scroll-margin-top` in Kopfhöhe.
3. Die Sidebar klebt ab 769px (`position:sticky; top:0`) in ihrer eigenen Grid-Spalte und überdeckt keinen Inhalt.
4. Schwebende Elemente (600, z. B. ein künftiger Chat-Starter) liegen unter Menü, Sheet, Toast und Bühne. Steht eines unten, setzt es `--_toast-offset` auf seine Höhe + 16px, damit der Toast darüber erscheint.
5. Toast (900) liegt über Sheets (800), damit Rückmeldungen aus einem Sheet sichtbar bleiben. **Ein nativer `<dialog>` (`.mp-admin-dialog`, `showModal()` B:1955) liegt im Top Layer über allem.** Solange er offen ist, erscheint die Rückmeldung als `.hinweis` im Dialog, nicht als Toast.
6. Solange die Feier (1000) offen ist, wartet der Toast (Seiten-JS Club/Terminal). Feier, Sheet und Dialog setzen den Hintergrund `inert` (wie heute die Feier, club:1370–1372).

### F.6 Bewegung (Familien `duration`, `easing`; alle Werte wertgleich)

| Token | Wert | Nutzung |
|---|---|---|
| `--lp-dur-hover` | `160ms` | Hover/Zustand: Buttons, Felder, .sw (mp:122, 157, 329). |
| `--lp-dur-layer` | `180ms` | Toast transform, .ebene/.reveal (mp:208, 548). |
| `--lp-dur-stage-in` | `250ms` | .mp-feier.an mp-ebene (mp:477). |
| `--lp-dur-kurz` | `260ms` | .mp-kurz mp-ebene (mp:416). |
| `--lp-dur-pearl` | `.35s` | .pearl::before transform (mp:278). |
| `--lp-dur-sheet` | `.4s` | .sheet .card, .dialog mp-ebene (mp:238); nativer Dialog ohne Einblendung. |
| `--lp-dur-progress` | `.6s` | .track > span width, .art-pearl transform, zahl-Puls (mp:300, 314, 404). |
| `--lp-dur-compact` | `.65s` | .mp-kurz .p mp-seal, .mp-compact (mp:419, 522–523). |
| `--lp-dur-spin` | `.8s` | Spinner mp-dreh (mp:142). |
| `--lp-dur-seal-pearl` | `1s` | mp-seal Perle redeem (mp:519). |
| `--lp-dur-seal` | `1.1s` | mp-seal Häkchen redeem (mp:518). |
| `--lp-dur-ring` | `1.4s` | mp-ring Orbit, mp-shine Prämie (mp:509, 512). |
| `--lp-dur-shine` | `1.5s` | lp-shine, mp-rise, mp-reveal (mp:260, 508, 515–517). |
| `--lp-dur-open` | `1.6s` | mp-open-left/right (mp:513–514). |
| `--lp-dur-spark` | `1.8s` | mp-spark Staub (mp:511). |
| `--lp-dur-glow` | `2s` | mp-glow Halo (mp:510). |
| `--lp-dur-wheel` | `4.8s` | #wheel transform (mp:411). |
| `--lp-delay-spark` | `.4s` | Staub-Grundverzögerung: calc(var(--lp-delay-spark) + var(--delay)) (mp:511). |
| `--lp-delay-shine` | `.6s` | Prämienglanz-Verzögerung (mp:512). |
| `--lp-dur-reduced` | `.01ms` | Reduzierte Bewegung (mp:572, auch data-motion="reduced"). |
| `--lp-wait-wheel-result` | `4900ms` | JS: Rad-Ergebnis (0ms bei reduzierter Bewegung, T:1596) – unverändert. |
| `--lp-wait-toast` | `3800ms` | JS: Standzeit Toast in allen drei Apps (heute 3800/3200/3400ms; Seitenrest-Diff). |
| `--lp-wait-busy-label` | `400ms` | JS: „Wird gespeichert …“ erst nach 400ms Wartezeit zeigen. |
| `--mp-t-hover` | `160ms` | Kompat-Alias Fassung 3 → --lp-dur-hover (CSS: var()). |
| `--mp-t-layer` | `180ms` | Kompat-Alias Fassung 3 → --lp-dur-layer (CSS: var()). |

| Token | Wert | Nutzung |
|---|---|---|
| `--lp-ease` | `cubic-bezier(.22,1,.36,1)` | Standard (15 × --mp-ease + 5 Literale der Bühne mp:508, 509, 515–517). |
| `--lp-ease-wheel` | `cubic-bezier(.16,.84,.26,1)` | #wheel (mp:411). |
| `--lp-ease-css` | `ease` | Perlenhub, lp-shine, mp-open, mp-seal (mp:260, 278, 419, 513, 514, 518, 519). |
| `--lp-ease-out` | `ease-out` | mp-glow, mp-spark (mp:510–511). |
| `--lp-ease-in-out` | `ease-in-out` | mp-shine (mp:512). |
| `--lp-ease-linear` | `linear` | Spinner mp-dreh (mp:142). |
| `--mp-ease` | `cubic-bezier(.22,1,.36,1)` | Kompat-Alias Fassung 3 → --lp-ease (CSS: var()). |

| Stelle (mp) | Fassung 4 (gleicher berechneter Wert) |
|---|---|
| Buttons 122–123 | `transition:filter var(--lp-dur-hover) var(--lp-ease), background var(--lp-dur-hover) var(--lp-ease), border-color var(--lp-dur-hover) var(--lp-ease), box-shadow var(--lp-dur-hover) var(--lp-ease)` |
| Felder 157 | `transition:border-color var(--lp-dur-hover) var(--lp-ease), box-shadow var(--lp-dur-hover) var(--lp-ease)` |
| Toast 208 | `transition:transform var(--lp-dur-layer) var(--lp-ease)` |
| Sheet-Karte 238 | `animation:mp-ebene var(--lp-dur-sheet) var(--lp-ease) both` |
| Kartenglanz 260 | `animation:lp-shine var(--lp-dur-shine) var(--lp-ease-css) both` (nur `(hover:hover)`) |
| Perlenhub 278 | `transition:transform var(--lp-dur-pearl) var(--lp-ease-css)` |
| Prämienperle 300 / Fortschritt 314 / Puls 404 | `transform var(--lp-dur-progress) var(--lp-ease)` / `width var(--lp-dur-progress) var(--lp-ease)` / `zahl var(--lp-dur-progress) var(--lp-ease)` |
| Schalter 329 | `transform var(--lp-dur-hover) var(--lp-ease), background var(--lp-dur-hover)` |
| Glücksrad 411 | `transition:transform var(--lp-dur-wheel) var(--lp-ease-wheel)` |
| `.mp-kurz` 416 / 419 | `mp-ebene var(--lp-dur-kurz) var(--lp-ease) both` / `mp-seal var(--lp-dur-compact) var(--lp-ease-css) both` |
| Spinner 142 | `mp-dreh var(--lp-dur-spin) var(--lp-ease-linear) infinite` |
| Feier 477, 508–523 | `mp-ebene var(--lp-dur-stage-in)`; `mp-rise var(--lp-dur-shine) var(--lp-ease) both`; `mp-ring var(--lp-dur-ring) var(--lp-ease) both`; `mp-glow var(--lp-dur-glow) var(--lp-ease-out) both`; `mp-spark var(--lp-dur-spark) var(--lp-ease-out) both` + `animation-delay:calc(var(--lp-delay-spark) + var(--delay))`; `mp-shine var(--lp-dur-ring) var(--lp-delay-shine) var(--lp-ease-in-out) both`; `mp-open-left/right var(--lp-dur-open) var(--lp-ease-css) both`; `mp-reveal var(--lp-dur-shine) var(--lp-ease) both`; `mp-seal var(--lp-dur-seal)` / `var(--lp-dur-seal-pearl)` `var(--lp-ease-css) both`; kompakt `animation-duration:var(--lp-dur-compact) !important; animation-delay:0s !important` |
| `.ebene,.reveal` 548 | `mp-ebene var(--lp-dur-layer) var(--lp-ease) both` |
| Reduced Motion 572 | `var(--lp-dur-reduced)` |

Alle 13 `@keyframes` (`mp-dreh`, `lp-shine`, `zahl`, `mp-rise`, `mp-ring`, `mp-glow`, `mp-spark`, `mp-shine`, `mp-open-left`, `mp-open-right`, `mp-reveal`, `mp-seal`, `mp-ebene`) bleiben **zeichengleich**. Einzige genehmigte neue Bewegung ist die Öffnung der Adventstür (E37, Wunsch der Inhaberin): vier Keyframes mit den Relaunch-Namen `lp-open-left`, `lp-open-right` (Flügel `0%,8%` 0° → `100%` ∓105°, Deckkraft ab 85 % → 0), `lp-gift-rise` (`0%,24%` `translateY(8px) scale(.75)` 0 → `65%` `scale(1.08)` 1 → `100%` 1) und `lp-door-number` (1 → 0); Dauern 1450 ms (Flügel), 1750 ms (Gewinn), 600 ms linear (Zahl), Kurve `--lp-ease`, JS-Neuladen nach 1850 ms (reduziert 0 ms). Die Dauern stehen als Werte im Adventsblock (G.11), nicht als Token. Sonst entsteht keine neue Animation. Der native Dialog bleibt ohne Einblendung. Einzige Wirkungsänderung ohne neuen Wert: `.pearl:hover::before` und der Prämienperlen-Hover gelten nur noch in `(hover:hover)` (L9); `[aria-pressed="true"]` hebt weiter auf allen Geräten. `.stand.puls` bleibt definiert und spielt weiterhin nicht (Reparatur erst nach Freigabe, I.7). `celebration-motion.js` und `club-motion.js` sind unverändert. JS-Zeiten: Rad-Ergebnis 4900ms (0ms reduziert) unverändert; Toast-Standzeit 3800ms in allen Apps (Seitenrest-Diff, heute 3800/3200/3400ms).

### F.7 Fokus (ein Ring pro Control)

```css
:is(a,button,input,select,textarea,summary,[tabindex],[role="button"],[role="switch"],[role="tab"]):focus-visible{
  outline:var(--lp-focus-width) solid var(--lp-focus); outline-offset:var(--lp-focus-offset); }        /* 2px / 3px – wertgleich */
.pearl:focus-visible{ outline-offset:var(--lp-focus-offset-inset); }                                   /* −2px – wertgleich */
.search:focus-within,.consent-card:focus-within,.lp-auswahl:focus-within{
  outline:var(--lp-focus-width) solid var(--lp-focus); outline-offset:var(--lp-focus-offset); }        /* Ring am Behälter … */
.search input:focus-visible,.consent-card input:focus-visible,.lp-auswahl input:focus-visible{ outline:none; }  /* … nicht doppelt */
input:focus,select:focus,textarea:focus{ box-shadow:none; }                   /* Halo und outline:0 aus mp:162 entfallen */
```

- Die Ringfarbe erreicht auf jedem angrenzenden Grund ≥ 3:1: hell mindestens 4.72, dunkel 6.24, Inseln 5.71 (C.7, Gruppen E/I/J). Neben der Primärpille trennt der 3-px-Spalt in Grundfarbe.
- `outline:none` gibt es nur, wo der Behälter den Ring trägt (Suche, Auswahlkarte), oder bei programmatischen Zielen mit `tabindex="-1"`: `#kDetail`, `#praemie-{id}`, Dialog-`h2`, jeweils als `:focus:not(:focus-visible){outline:none}`.
- `.tabelle-scroll` wird mit `tabindex="0" role="region" aria-label` fokussierbar (Seite) und bekommt denselben Ring (vorher UA 1.26:1).
- Die Tab-Falle im Club an `input#gebDatum` ist eine JS-Folgeänderung (Club, H.6).

### F.8 Deaktiviert, Laden, Beschäftigt, Erledigt

| Zustand | Regel |
|---|---|
| deaktiviert | `:disabled, [aria-disabled="true"]` an jedem Control (alle Buttons, `.sw`, `.nps`/`.pad`/`.sterne button`, Felder inkl. `textarea`): `opacity:var(--lp-opacity-disabled)` .5 (vorher .45/.5/.55), `cursor:not-allowed`, `filter:none`, keine Hover- oder Aktiv-Wirkung. Ausnahme Adventstür (E37): `opacity:1`, der Zustand steht in der Form (geschlossen, gestrichelt, geöffnet). |
| Information gesperrt | `.list .item:disabled` (Prämie noch nicht erreichbar): **Opazität 1**, `border-style:dashed`, Text `--lp-text-muted` (8.04 / 5.61) statt .55 (≈ 3.4:1). Die Beschriftung sagt den Grund („Noch 300 Perlen“). |
| laden `.laedt` | an jeder Button-Variante (auch `.secondary`, `.linkbtn`, `.icon-button`, Wallet): Label `color:transparent`, `pointer-events:none`, `cursor:progress`, **`opacity:1` auch bei `:disabled`**. Spinner `::after{content:"" !important; position:absolute; left:50%; top:50%; width:var(--lp-spinner); height:var(--lp-spinner); margin:-9px 0 0 -9px; border-radius:50%; border:var(--lp-border-spinner) solid var(--_spin-track); border-top-color:var(--_spin); animation:mp-dreh var(--lp-dur-spin) var(--lp-ease-linear) infinite}` (sm: 16×16, `margin:-8px 0 0 -8px`). Kopf gegen Spur ≥ 3.42:1 (C.7 Gruppe G). |
| laden ohne Spinner | `.sw.laedt, .door.laedt, .pearl.laedt`: `cursor:progress; opacity:.5` (zu klein für einen Spinner) |
| beschäftigt | `[aria-busy="true"]{cursor:progress}` (wie bisher). Das Label wechselt auf „Wird gespeichert …“ erst nach `--lp-wait-busy-label` 400ms (Seiten-JS). |
| erledigt ≠ deaktiviert | Erfolg zeigt sich nie über `:disabled` (heute `#rechtAnnehmen:disabled` im Gold-Erfolgslook, M14). Der Button wird ausgeblendet und durch `.hinweis.ok` mit ✓ und Text ersetzt (G.14). |

### F.9 Forced Colors (neu, M21)

```css
@media (forced-colors:active){
  :is(a,button,input,select,textarea,summary,[tabindex]):focus-visible{ outline-color:Highlight; }
  :is(.btn,.btn-gold,.main-action,.secondary,.btn-line,.btn-ghost,.icon-button,.nps button,.pad button,.list .item,.door){ border:1px solid ButtonText; }
  .card,.sheet .card,.dialog,.mp-admin-dialog,.toast,#toast,.note,.member,.featured-reward,.hinweis,.unklar,.mp-feier .buehne{ border:1px solid CanvasText; }
  .sw{ forced-color-adjust:none; background:Canvas; border-color:ButtonText; }
  .sw::after{ forced-color-adjust:none; background:ButtonText; }
  .sw:is([aria-pressed="true"],[aria-checked="true"]){ background:Highlight; border-color:Highlight; }
  .sw:is([aria-pressed="true"],[aria-checked="true"])::after{ background:HighlightText; }
  .track{ forced-color-adjust:none; background:Canvas; outline:1px solid CanvasText; }
  .track > span{ background:Highlight; }
  .sidebar button[aria-current="page"],.tabs [aria-selected="true"]{ outline:2px solid Highlight; outline-offset:-2px; }
  :is(.btn,.secondary,.categories > button,.nps button)[aria-pressed="true"],.nps button.an{ forced-color-adjust:none; background:Highlight; color:HighlightText; border-color:Highlight; }
  .pearl::before{ forced-color-adjust:none; }                         /* Perlenmaterial bleibt sichtbar */
  .pearl[aria-pressed="true"]{ outline:2px solid Highlight; outline-offset:-2px; }
  .lp-glyph,.toast::before,.note::before,.hinweis::before,.unklar::before,.pill::before,.feldfehler::before,.list .item.gewinn .p::before{ forced-color-adjust:none; background:CanvasText; }
  [data-stufe]{ forced-color-adjust:none; background:Canvas; color:CanvasText; outline:1px solid CanvasText; }
  .pearl.deko,.mp-dust,.mp-halo{ display:none; }                     /* rein dekorativ */
}
```

### F.10 Reduzierte Bewegung

Block mp:571–575 bleibt **zeichengleich** (nur `.01ms` als `var(--lp-dur-reduced)`), ebenso `.mp-feier.mp-reduced` (mp:536–537), `sanft()`, GSAP-Sperren und `visibilitychange`-Settle. Zusätzlich gibt es den In-App-Schalter `:root[data-motion="reduced"]` mit exakt denselben Regeln (Regelsatz zweimal, identisch): `*,*::before,*::after{animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; scroll-behavior:auto !important}`, `.mp-feier .mp-arc,.mp-feier .mp-dust{display:none !important}`, `.track > span{transition:none}`. Ihn setzt nur eine ausdrückliche Nutzereinstellung, **nie Datensparen**. JS-Pfade (`sanft()` club:955/1338, T:1223; `celebration-motion.js:18`; `club-motion.js:8`) prüfen künftig zusätzlich `document.documentElement.dataset.motion === 'reduced'`. Der Kommentar mp:524 („Nutzereinstellung“) wird damit wahr.

### F.11 Datensparen (nur Schalter für optionale Bewegung)

```css
:root[data-saver="on"] .member:hover::after{ animation:none; }                                        /* Kartenglanz */
:root[data-saver="on"] .pearl::before,:root[data-saver="on"] .art-pearl{ transition:none; }           /* Hub ohne Bewegung */
:root[data-saver="on"] .pearl:not([aria-pressed="true"]):hover::before{ transform:none; }             /* gewählte Perle bleibt angehoben */
:root[data-saver="on"] .featured-reward:hover .art-pearl{ transform:rotate(-15deg); }                 /* Ruhelage wie mp:300 */
@media (prefers-reduced-data:reduce){ /* dieselben vier Regeln ohne :root[data-saver="on"] */ }
```

- Seitenseitig (Kopf, 4 Zeilen in `try/catch`): `data-saver="on"`, wenn `navigator.connection?.saveData === true` oder `matchMedia('(prefers-reduced-data: reduce)').matches`. Bei gesetztem Attribut lädt die Seite `gsap.min.js`, `ScrollTrigger.min.js` und `club-motion.js` nicht (club:671–674, T:667). `celebration-motion.js` fällt ohne `window.gsap` schon heute auf die bestätigte CSS-Feier zurück (Z. 3), das Scroll-Reveal entfällt (der Inhalt ist ohne Skript sichtbar).
- **Unberührt bleiben** Spinner, Toast-Einblendung, Sheet-Einblendung, Fortschritt, Schalter, Glücksrad (4.8s) und die CSS-Feier mit allen Zeiten. Datensparen setzt nie `data-motion`.

### F.12 Kontrollhöhen, Maße, Deckkraft (Familien `controlHeight`, `size`, `opacity`)

| Token | Wert | Nutzung |
|---|---|---|
| `--lp-control-sm` | `44px` | sm: .btn.sm, Chips, .linkbtn, .icon-button, Tabs, Buttons und Felder in .filter/Tabellenzellen/.section-title/.unklar/#offenListe/.brandbar, NPS, Sterne, .sidebar button. |
| `--lp-control-md` | `48px` | md (Standard): .btn, .secondary, .btn.ghost, Wallet, Felder, select, .search. |
| `--lp-control-lg` | `56px` | lg: .main-action, .btn.lg, Bühnenbutton, Pad-Taste, .list .item, .switch-Zeile. |
| `--lp-hit-min` | `44px` | Mindest-Trefffläche jedes Controls (auch .legal a, summary, .sw über ::before, Checkbox-Zeile). |
| `--lp-textarea-min` | `96px` | textarea (auch .mp-admin-dialog, vorher 100px). |
| `--lp-row-min` | `56px` | .switch-Zeile, .list .item. |
| `--lp-door-min` | `64px` | bisher .door (Advent); seit E37 nicht mehr genutzt – die Bogentür ist 92/108px hoch, mind. 44px (Name bleibt für die Tokengleichheit). |
| `--lp-amount-min` | `80px` | .amount (Betragsanzeige). |

| Token | Wert | Nutzung |
|---|---|---|
| `--lp-icon` | `18px` | .ic Standard, Icons in md/lg-Buttons, .search .ic. |
| `--lp-icon-sm` | `16px` | Icons in sm-Buttons, .sidebar .ic. |
| `--lp-icon-xs` | `14px` | .member .rank .ic. |
| `--lp-glyph` | `1em` | Statuszeichen ✓ / ⚠ / ! als Maske, relativ zur Schrift (.unklar 18px). |
| `--lp-check` | `22px` | Checkbox/Radio sichtbar (Trefffläche ≥ 44px über das Label). |
| `--lp-switch-w` | `52px` | .sw Breite (Trefffläche 60×44 über ::before). |
| `--lp-switch-h` | `30px` | .sw Höhe. |
| `--lp-switch-knob` | `22px` | .sw::after Knopf. |
| `--lp-avatar` | `34px` | .avatar. |
| `--lp-avatar-lg` | `52px` | .avatar.large. |
| `--lp-step` | `32px` | .reg .plus .z Schrittkreis. |
| `--lp-pill-h` | `24px` | .pill Mindesthöhe. |
| `--lp-spinner` | `18px` | .laedt::after (sm-Buttons 16px = lp-icon-sm). |
| `--lp-star` | `30px` | Sternglyphe „★“ in .sterne button. |
| `--lp-track-h` | `3px` | .track Höhe (wertgleich). |
| `--lp-logo-w` | `140px` | Logo-Fenster .brandbar .logo Breite (unverändert). |
| `--lp-logo-h` | `54px` | Logo-Fenster Höhe (unverändert). |
| `--lp-logo-img` | `220px` | Logo-Bild im Fenster, left -40px, top -30px (unverändert). |
| `--lp-logo-login` | `min(240px,70vw)` | .login .logo img (unverändert). |
| `--lp-necklace-h` | `117px` | .necklace (unverändert). |
| `--lp-art-col` | `102px` | .featured-reward Motivspalte ≥ 481px. |
| `--lp-art-col-sm` | `87px` | .featured-reward Motivspalte < 481px. |
| `--lp-art-min` | `154px` | .reward-art Mindesthöhe. |
| `--lp-heat-cell` | `34px` | Heatmap-Zellenhöhe. |

| Token | Wert | Nutzung |
|---|---|---|
| `--lp-opacity-disabled` | `.5` | Jedes deaktivierte Control (vorher .45/.5/.55); nie für Informationszeilen. |
| `--lp-opacity-deko` | `.42` | .pearl.deko (wertgleich). |
| `--lp-opacity-orbit` | `.5` | .orbit (wertgleich). |
| `--lp-opacity-door-image` | `.35` | bisher .door .bild; seit E37 nicht mehr genutzt (Bild steht voll deckend in `.hinten`). |
| `--lp-opacity-bars` | `.85` | .bars div (Seitenrest-Wert). |

---

## G. Komponenten

Maße in px. „sm/md/lg“ = Kontrollhöhen 44/48/56. Hover-Regeln stehen immer in `@media (hover:hover)` (kein klebender Hover auf Touch). Fokus = F.7, deaktiviert/laden = F.8. Selektoren in `code` sind Fassung-3-Klassen (bleiben gültig); neue Klassen sind mit „neu“ markiert.

### G.0 Dichte-Modi (ohne neues Markup, über die vorhandenen `body`-Klassen)

| Modus | Auslöser | Karte | Controls | Hauptaktion | Tabelle | Karte → Karte |
|---|---|---|---|---|---|---|
| **Komfort** (Club, Rechtstexte) | Standard | `var(--lp-pad)` 24 (< 481: 20) | md 48; Chips, Links sm 44 | lg 56 `.main-action`, volle Breite | `td 12px 12px`, `th 8px 12px` | Abschnitt 32 |
| **Theke** (Terminal) | `body.terminal` | 24 (< 481: 20) | md 48; Pad-Taste, `.list .item`, Anmelden, Buchen lg 56; Kopf-/Zeilenaktionen sm 44 | lg 56 | wie Komfort | Stapel 24 (≤ 768: 16) |
| **Dicht** (Verwaltung) | `body.admin` | `--lp-pad-card-compact` 20 | md 48 in Formularen; sm 44 in `.filter`, Tabellen, `.section-title`, Chips | md 48 (keine vollbreite Aktion außer Anmelden) | `8px 12px` | 16 |

Unter 44px geht es in keinem Modus: „Dicht“ heißt weniger Luft, nicht kleinere Ziele.

### G.1 Button-Familie – ein System

**Basis (eine Regel, alle Varianten).** Jeder Selektor der Liste hat die Spezifität (0,1,0). Varianten und Größen stehen danach und setzen nur `--_*`:

```css
.btn,.btn-gold,.main-action,.secondary,.btn-line,.btn-ghost,.linkbtn,.row-button,.icon-button,
.club-footer :where(button),.categories > :where(button){
  --_h:var(--lp-control-md); --_px:var(--lp-pad-control-x); --_fs:var(--lp-fs-16); --_gap:var(--lp-gap-icon); --_ic:var(--lp-icon);
  --_bg:var(--lp-accent-fill); --_fg:var(--lp-on-accent); --_bd:var(--lp-accent-fill-edge);
  --_bg-h:var(--_bg); --_fg-h:var(--_fg); --_bd-h:var(--_bd); --_bg-a:var(--_bg);
  --_filter-h:brightness(1.08); --_filter-a:brightness(.94); --_sh:var(--lp-shadow-lustre);
  --_spin:var(--lp-on-accent); --_spin-track:var(--lp-spinner-track-on-accent);
  display:inline-flex; align-items:center; justify-content:center; gap:var(--_gap);
  box-sizing:border-box; min-height:var(--_h); max-width:100%; margin:0;
  padding:var(--lp-pad-control-y) var(--_px);
  border:var(--lp-border) solid var(--_bd); border-radius:var(--lp-radius-action);
  background:var(--_bg); color:var(--_fg); box-shadow:var(--_sh);
  font:var(--lp-fw-medium) var(--_fs)/var(--lp-lh-control) var(--font-ui); letter-spacing:var(--lp-track-control);
  text-align:center; text-decoration:none; text-wrap:balance; white-space:normal; vertical-align:middle;
  position:relative; cursor:pointer; -webkit-tap-highlight-color:transparent; touch-action:manipulation;
  transition:filter var(--lp-dur-hover) var(--lp-ease), background var(--lp-dur-hover) var(--lp-ease),
             border-color var(--lp-dur-hover) var(--lp-ease), box-shadow var(--lp-dur-hover) var(--lp-ease); }
:is(.btn,.btn-gold,.main-action,.secondary,.btn-line,.btn-ghost,.linkbtn,.row-button,.icon-button) .ic{ width:var(--_ic); height:var(--_ic); flex:none; }
.btn::before,.btn:not(.laedt)::after{ content:none !important; }                         /* Legacy-Glanz bleibt aus (mp:128) */
@media (hover:hover){
  :is(.btn,.btn-gold,.main-action,.secondary,.btn-line,.btn-ghost,.linkbtn,.row-button,.icon-button,.club-footer :where(button),.categories > :where(button)):not(:disabled,[aria-disabled="true"],.laedt):hover{
    filter:var(--_filter-h); background:var(--_bg-h); border-color:var(--_bd-h); color:var(--_fg-h); } }
:is(…dieselbe Liste…):not(:disabled,[aria-disabled="true"],.laedt):active{ filter:var(--_filter-a); background:var(--_bg-a); }
```

Die Hover-Regel hat (0,3,0) und setzt die Farbe selbst. Damit greift `a:hover{color:var(--lp-text)}` (0,1,1) nicht mehr auf `a.btn`/`a.main-action` (behebt 1.46:1). `:active` steht nach `:hover`, dadurch hat auch der Sekundärbutton eine Druckrückmeldung (M9). Die Elementregel `button,input,select,textarea{font:inherit;color:inherit}` (0,0,1) kann die Basis nicht überschreiben. Seitenreste mit ID (z. B. `#rechtAnnehmen`) bleiben stärker, bis sie migriert sind.

**Höhe (deterministisch):** einzeilig = `min-height` exakt, denn der Inhalt 16 × 1.25 = 20 + 2 × 8 + 2 = 38 < 48. Zweizeilig md/lg 58, sm 53 (2 × 17.5 + 16 + 2). Drei Zeilen sind nicht zulässig; das Label wird dann gekürzt (Inhalt, nicht CSS).

**Größen**

| Größe | Selektoren | `--_h` | `--_px` | `--_fs` / Stil | `--_gap` | `--_ic` |
|---|---|---|---|---|---|---|
| sm | `.btn.sm`, `.secondary.sm`, `.btn.ghost.sm`, `.categories > button`, `.linkbtn`, `.row-button`, `.icon-button`; **jede Variante in** `.filter`, `td`, `.section-title`, `.unklar`, `#offenListe`, `.brandbar`, `.admin-title`, `.mp-feier.mp-inline` | 44 | 16 (Link/Icon 0) | 14 / lp-t-button-s | 8 | 16 |
| md (Standard) | `.btn`, `.btn-gold`, `.secondary`, `.btn.ghost`, `.btn-line`, `.btn-ghost`, `.btn.gefahr`, `.btn.danger`, `.bereiche-btn`, Wallet | 48 | 24 | 16 / lp-t-button | 12 | 18 |
| lg | `.main-action`, `.btn.lg` (neu), `.mp-feier .btn` (Bühne) | 56 | 24 | 16 / lp-t-button | 12 | 18 |

Die Kontext-Größen stehen als `:where(.filter,td,.section-title,.unklar,#offenListe,.brandbar,.admin-title) :is(<Liste>)` mit (0,1,0) nach den Varianten. `.main-action`: `width:100%; justify-content:space-between; text-align:start; margin-top:var(--lp-rhythm-group)` (25 → 24; `.booking .main-action` 20 → 24).

**Varianten und Zustände**

| Variante | Selektoren | Ruhe `--_bg` / `--_fg` / `--_bd` | Hover | Aktiv | Spinner Kopf / Spur | sonst |
|---|---|---|---|---|---|---|
| Primär | `.btn`, `.btn-gold`, `.main-action` | `--lp-accent-fill` / `--lp-on-accent` / `--lp-accent-fill-edge` (hell Goldkante `#907036`) | `brightness(1.08)` (wertgleich) | `brightness(.94)` (wertgleich) | on-accent / spinner-track-on-accent | `--_sh:var(--lp-shadow-lustre)` |
| Sekundär | `.btn.ghost`, `.secondary`, `.btn-line`, `.btn-ghost`, `.bereiche-btn`, `.club-footer :where(button):not(.btn)`, `.categories > button` | `transparent` / `--lp-text` / `--lp-border-control` | Rand `--lp-accent-mark` | Fläche `--lp-accent-soft` | accent / spinner-track | `--_filter-h:none; --_filter-a:none; --_sh:none` |
| Gefahr | `.btn.gefahr`, `.btn.danger` | `transparent` / `--lp-danger` / `--lp-danger` (vorher 45 % = 2.82:1) | Fläche `--lp-danger-soft` | `--lp-danger-soft` | danger / spinner-track | wie Sekundär |
| Link | `.linkbtn`, `.row-button` | `transparent` / `--lp-accent` / `transparent` | Text `--lp-text` | – | accent / spinner-track | Gewicht 400, `text-decoration:underline; text-decoration-color:var(--lp-link-underline); text-underline-offset:3px`, `--_px:0` |
| Icon | `.icon-button` (44 × 44, `padding:0`, `border-radius:var(--lp-radius-circle)`) | `transparent` / `--lp-text` / `--lp-border-control` | Rand `--lp-accent-mark` | `--lp-accent-soft` | accent / spinner-track | Pflicht `aria-label` |
| Gewählt | `:is(<Liste>)[aria-pressed="true"]` (Chips, Segmente, Umschalter, `.categories > button[aria-pressed="true"]`) | `--lp-accent-fill` / `--lp-on-accent` / `--lp-accent-fill-edge` | `brightness(1.08)` | `brightness(.94)` | – | Radius bleibt 28px |
| Bühne (Insel) | `.mp-feier .btn` / `.mp-feier .btn.ghost` | `--lp-stage-gold` / `--lp-stage` / `--lp-stage-gold` · `transparent` / `--lp-stage-text` / `--lp-stage-ghost-edge` | `brightness(1.08)` · Rand `--lp-accent-mark` (#DFBE95 in der Insel) | `brightness(.94)` · `--lp-accent-soft` | – | lg 56 (gerendert vorher 54); Inline sm 44 (vorher 46) |

**Icon, Pfeil, Label**
- Aufbau: `<button class="btn"><svg class="ic">…</svg><span>Label</span></button>` für ein führendes Icon (Scan, Start, Plus, Download, Wallet `#i-wallet`, Menü `#i-menu`) bzw. `<span>Label</span><svg class="ic"><use href="#i-arrow"/></svg>` für den Pfeil. Icons sind immer ein Kind-`<svg class="ic">`, nie ein Textzeichen („→“ und „☰“ fehlen in Jost). Durch `align-items:center` sitzen Icon und mehrzeiliges Label mittig zur ganzen Höhe (behebt den 4-px-Versatz bei `.secondary` + Icon, H5).
- `.main-action`: Label links, Pfeil rechts. **Ohne Icon zentriert:** `.main-action:not(:has(> .ic)){justify-content:center; text-align:center}` (Backend `#loginBtn`, `#rechtAnnehmen`, M13). Ohne `:has()`-Unterstützung bleibt das Label links (heutiger Zustand).
- Der Pfeil erscheint in einem Ablauf konsequent auf allen Hauptaktionen oder nie. Seiten-JS schreibt nur in das Label-`<span>` (T:926 `#buchenBtn`, H.6).
- `<a class="btn">` / `<a class="main-action">` bekommen `text-align:center` wie `<button>` (heute `start`).

**Reihen (ein System für `.aktionen`, `.zielaktionen`, `.searchrow`, `.linkfeld`, `.row` (neu definiert), `.filter`, `.club-footer > div`, `.mp-feier .aktionen`, `.unklar`)**

| Regel | Umsetzung |
|---|---|
| R1 gleiche Höhe | `display:flex; flex-wrap:wrap; gap:var(--lp-gap-actions); align-items:stretch`. Alle Buttons einer Zeile übernehmen die Höhe des höchsten; ein umbrechendes Label (58px) zieht die Nachbarn mit, statt sie zu versetzen. |
| R2 eine Größe je Reihe | In `.filter`, `td`, `.section-title`, `.unklar`, `#offenListe`, `.brandbar`, `.admin-title` sind **Buttons und Felder** sm 44 (Feldschrift 16px). Sonst sind Buttons und Felder md 48. Chips stehen nur in sm-Reihen. |
| R3 mobil | `@media (max-width:480px){ :is(.aktionen,.zielaktionen,.row,.club-footer > div) > :is(.btn,.btn-gold,.secondary,.btn-line,.btn-ghost):not(.sm){ flex:1 1 auto; } }`. Die Zeilen füllen sich, kleine Restknöpfe entstehen nicht; die Reihenfolge bleibt die des DOM. |
| R4 Link in Reihe | `.linkbtn` streckt sich mit (R1), sein Text sitzt mittig. Er steht nicht mehr 5–10px tiefer (#fertig, #bewBox, `.zielaktionen`). `.icon-button` bleibt mit `align-self:center` rund. |
| R5 Umbruch | Nie `nowrap` an Labels (auch nicht inline B:2012), `text-wrap:balance`, höchstens zwei Zeilen bei +40 %. |
| R6 Nicht-Controls | `:is(.aktionen,.zielaktionen,.searchrow,.linkfeld,.row,.club-footer > div,.filter .aktionen) > :not(button,input,select,textarea,label,code,output,.btn,.secondary,.linkbtn,.row-button,.icon-button,.main-action,.search){ align-self:center; }`. Texte wie „Schnell:“ (B:937) stehen damit wieder mittig (vorher 12px zu hoch). |
| R7 Feld + Button | Gleiche Größe (md 48 oder sm 44); `label.search{margin:0}` (M11). |
| R8 Ausrichtung | `.aktionen{margin-top:var(--lp-rhythm-between)}`; `.aktionen.ende` (neu), `.sheet .aktionen`, `.dialog .aktionen`, `.mp-admin-dialog .row`: `justify-content:flex-end`; `.mp-feier .aktionen{justify-content:center; margin-top:8px}`; sonst `flex-start`. Reihenfolge in Dialogen: Abbrechen (Sekundär) → Bestätigen (Primär, rechts); in Karten-Schnellaktionen bleibt die heutige Reihenfolge. |

Prüfbeispiel (Messreihe Bestandsaufnahme §5.1): Die 22 versetzten Reihen werden bündig, z. B. Terminal `#unklar` 54/47/47 → 44/44/44, `.customer .aktionen` 54/47 → 48/48, `.searchrow` 50/56 + 6px → 48/48, Verwaltung `#zeitraum` 44/54/44 → 44/44/44 mit gleicher Oberkante, `#vMail` 54/50/47 → 48/48/48, Club `#bewBox` 54/44 → 48/48.

### G.2 Felder und Auswahl

| Teil | Spezifikation |
|---|---|
| Text, E-Mail, Zahl, Passwort, Datum, `select` (`input:not([type=checkbox]):not([type=radio]):not([type=range]),select`) | `width:100%; min-height:var(--_fh, var(--lp-control-md))` 48 (sm 44), `padding:0 var(--_fpx, var(--lp-pad-field-x))` 16 (sm 12), Rand 1px `--lp-border-control`, Radius 12, Fläche `--lp-field`, Text `--lp-text` Jost 400 **16px**/1.5 (auch `.filter`, behebt iOS-Zoom M12), `caret-color:var(--lp-accent)`, `appearance:none`, Übergang F.6 (wertgleich). `input[type=date]`: `::-webkit-datetime-edit{padding:0}` → 48 statt 52, `color-scheme` erbt vom Thema (mp:167 entfällt). |
| Zustände | hover `(hover:hover)`: Rand `--lp-text-muted` · Fokus: nur Ring F.7, kein Halo · ungültig `[aria-invalid="true"]`: Rand `--lp-danger` + `box-shadow:var(--lp-shadow-invalid)` · deaktiviert `opacity:.5; cursor:not-allowed` (auch `textarea`) · schreibgeschützt `[readonly]`: `background:transparent; border-style:dashed` |
| Platzhalter | `::placeholder{color:var(--lp-text-subtle); opacity:1}` (5.89 dunkel, 5.61 hell) – eine Regel statt zwei (mp:86/161) |
| `select` | `padding-right:44px; background-image:var(--_select-arrow); background-repeat:no-repeat; background-position:right 16px center; background-size:12px 8px` (Pfad `M1 1l5 5 5-5`, Strich 1.6, je Thema) |
| `textarea` | `min-height:var(--lp-textarea-min)` 96 (auch `.mp-admin-dialog`, vorher 100), `padding:12px 16px`, `line-height:1.5`, `resize:vertical` |
| Feld sm | in `.filter` und `td`: `--_fh:var(--lp-control-sm); --_fpx:var(--lp-pad-field-x-sm)`, Schrift 16px |
| Tabellenfeld | `td input:not([type=checkbox]):not([type=radio]),td select{min-width:14ch}`, `td input[type="text"]{min-width:22ch}` – schlägt die Inline-Breiten 85/90px ohne Markup (M24; `min-width` gewinnt gegen `width`) |
| Suche `.search` | Behälter `display:flex; align-items:center; gap:var(--lp-space-3); flex:1 1 240px; min-height:var(--lp-control-md); padding:0 var(--lp-pad-field-x)`, Rand/Radius/Fläche wie Feld; Icon 18 `--lp-text-muted`; Innenfeld `min-height:46px; border:0; background:transparent; padding:0`; Ring am Behälter; `label.search{margin:0}` |
| `.searchrow` | R1, `margin-bottom:var(--lp-rhythm-group)` (27 → 24); „Suchen“, „Karte scannen“, „Start“ = `.secondary` md 48 → gleich hoch wie das Feld |
| Checkbox, Radio | aus der Feldregel ausgenommen (H7): `appearance:auto; -webkit-appearance:auto; width:var(--lp-check); height:var(--lp-check)` 22, `min-height:0; margin:0; padding:0; border:0; background:none; flex:none; accent-color:var(--lp-accent-mark)` → das Häkchen ist wieder sichtbar (Kontolöschung club:903, Advent-Push B:2051) |
| Checkbox-Zeile | `label.check` (neu) und `label:has(> input:is([type=checkbox],[type=radio]))`: `display:flex; gap:var(--lp-space-3); align-items:flex-start; min-height:var(--lp-hit-min); padding-block:11px; margin:0; cursor:pointer`, Text lp-t-body `--lp-text`; Box `margin-top:1px` (mittig zur ersten Zeile) |
| Schalter `.sw` | 52 × 30, Radius Pille, Rand `--lp-border-control`, Grund `--lp-field`; Knopf `::after` 22 × 22 bei `top:3px; left:3px`, `--lp-text-muted`; an (`[aria-pressed="true"]`, `[aria-checked="true"]`): Grund `--lp-accent-fill`, Rand `--lp-accent-fill-edge`, Knopf `--lp-on-accent` mit `translateX(22px)`; Übergang wertgleich; Trefffläche `::before{content:""; position:absolute; inset:-7px -4px}` → 60 × 44 (L6); `role="switch"` + `aria-checked` |
| Zeile `.switch` | `display:flex; justify-content:space-between; align-items:center; gap:var(--lp-space-3); min-height:var(--lp-row-min); padding:12px 0; border-bottom:1px solid var(--lp-line)`; Titel 16px (heute inline) |
| Chips `.categories`, Backend-Zeitraum/Vorlagen | `display:flex; flex-wrap:wrap; gap:var(--lp-gap-chips); margin-bottom:16px`; Chip = Sekundär sm mit `aria-pressed`, gewählt = Variante „Gewählt“. B:736–738 und 938–941 setzen `aria-pressed` (JS, H.6, L13) |
| Tabs `.tabs` (Selektor aus F3, jetzt definiert) | `display:flex; gap:var(--lp-space-1); border-bottom:1px solid var(--lp-line); overflow-x:auto`; Tab `min-height:44px; padding:0 16px; background:transparent; border:0; border-bottom:2px solid transparent; margin-bottom:-1px; color:var(--lp-text-muted)`, lp-t-button-s; gewählt `[aria-selected="true"]`: Text `--lp-text`, Unterstrich `--lp-accent-mark` (≥ 3.69:1); `role="tablist"` |
| NPS `.nps` | `display:grid; grid-template-columns:repeat(6,minmax(44px,1fr)); gap:6px` (`@media (max-width:359.98px){gap:4px}`); 6 + 5 in zwei Reihen (320px: 6 × 44 + 5 × 4 = 284 ≤ 288); Taste `min-height:44px`, Radius 12, Rand control, Grund field, 16px lining; `.an` bzw. `[aria-pressed="true"]` = Gewählt. Die Sonderregel `(pointer:coarse)` entfällt. Darunter Skalenlabels 13px muted `display:flex; justify-content:space-between` („0 = unwahrscheinlich“ / „10 = sehr wahrscheinlich“, Markup) |
| Sterne `.sterne` (Alias `.stars`) | `display:flex; gap:4px; margin:8px 0 16px`; Taste 44 × 44, „★“ 30px/1, `background:transparent; border:0; padding:0`; aus `--lp-border-control` (3.66 statt 1.64), `.an` `--lp-accent`; Hover `(hover:hover)` `--lp-accent`; `role="radiogroup"`, je Stern `aria-label` |
| `label` | lp-t-label 14/1.5 500 .02em `--lp-text-muted`, `display:block; margin:0 0 var(--lp-rhythm-inside)` (6 → 8; `.filter` 4 → 8); ohne Abstand: `label.search`, `label.consent-card`, `label.check`, Checkbox-Labels |
| `.field` | `margin-top:var(--lp-rhythm-between)` 16 (wertgleich); `.login .field{text-align:left}` |
| Hinweis `.hint` (T:792, bisher undefiniert), `.feldhinweis` (neu) | lp-t-small `--lp-text-muted`, `margin-top:8px`, `max-width:var(--lp-measure-help)`, per `aria-describedby` verbunden |
| Fehler `.feldfehler` (neu) | lp-t-pill (13/1.5 500) `--lp-danger`, `display:flex; gap:8px; margin-top:8px`, !-Kreis-Maske 1em davor; Feld mit `aria-invalid="true"` + `aria-describedby`. Der Text sagt, was zu tun ist („Gib den Betrag mit Komma ein, z. B. 129,50.“) |
| `.formzeile` | `display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr)); gap:var(--lp-space-3); align-items:end` (`min()` verhindert den 320-px-Überlauf; Labels dürfen umbrechen, Felder fluchten unten) |
| Link-Feld `.linkfeld` | Reihe R1, `margin-top:12px`; `code` = Feldoptik: `flex:1 1 240px; min-width:0; min-height:var(--lp-control-md); display:flex; align-items:center; padding:8px 16px; background:var(--lp-field); border:1px solid var(--lp-border-control); border-radius:var(--lp-radius-m)`, Jost 13/1.5 `--lp-text-muted`, **`overflow-wrap:anywhere`** (URL bricht im Feld, keine Ellipse); daneben „Kopieren“ `.secondary` md (gleiche Höhe über R1) |

### G.3 Karten

| Karte | Selektoren | Spezifikation |
|---|---|---|
| Standard | `.card`, `.customer`, `.ziel` | Grund `--lp-surface`, Rand 1px `--lp-card-edge`, Radius 18, `padding:var(--lp-pad)` (Verwaltung 20), `box-shadow:var(--lp-shadow-1)`, `min-width:0`; `.card h2` lp-t-h2-card mit `margin-bottom:12px`; `> :first-child{margin-top:0}`; `.card::after`, `.card h2::after{display:none}` (wertgleich, gegen Legacy-Zier) |
| Akzent `.card.akzent` (neu; ersetzt Inline `#bannerBox` club:759, `#zielKarte` T:789) | | wie Standard, Rand 1px `--lp-accent-mark`; höchstens eine je Bildschirm |
| Fehler `#ladeFehler`, `.card.fehler` (neu) | | wie Standard, Rand 1px `--lp-danger`, `margin:16px 0`, Titel mit !-Kreis; `role="alert"` (Markup) |
| Einlass `.card.einlass` (neu) | | Grund `--lp-field`, Rand 1px `--lp-line`, Radius 12, `padding:var(--lp-pad-tile)` – Box in der Karte; nie Karte in Karte mit gleicher Fläche (behebt „Feld verschmilzt mit Sheet“, M18) |
| Stufe 2 | `.card-dark`, `.admin-bottom` (beide ungenutzt) | Grund `--lp-surface-raised`, Text `--lp-text`, `padding:var(--lp-pad)`, `box-shadow:var(--lp-shadow-2),var(--lp-shadow-lustre)` – keine Insel |
| Leer | `.leer`, `.empty` | lp-t-ui `--lp-text-muted` zentriert, `padding:24px 16px`, Rand 1px gestrichelt `--lp-line`, Radius 18; ein Satz + höchstens eine Aktion (sm, `margin-top:12px`) |

### G.4 Tabelle

| Teil | Spezifikation |
|---|---|
| `table` | `width:100%; border-collapse:collapse`, lp-t-ui 14/1.5 |
| Kopf `th` | lp-t-th 12/1.5 500 `.06em` uppercase `--lp-text-muted`, links, `padding:var(--lp-space-2) var(--lp-pad-cell-x)` 8/12, Unterrand 1px `--lp-line`, Grund `--lp-surface`, `white-space:normal`; in allen Apps gleich (Verwaltung vorher 14px versal, M27) |
| Zelle `td` | `padding:var(--lp-pad-cell-y) var(--lp-pad-cell-x)` 12/12, Unterrand 1px `--lp-line-soft` (= Fassung-3-Wert), `vertical-align:top`; `tr:last-child td{border-bottom:0}` |
| dicht | `body.admin table td, body.admin table th, table.dicht td` (neu `table.dicht`): `padding:8px 12px; font-size:14px`; `body.admin table th{font-size:12px}` |
| Zahlen | `th.num, td.num`: `text-align:right; font-variant-numeric:var(--lp-numeric); white-space:nowrap`; Kopf ebenfalls rechts; Einheit in der Kopfzeile („Umsatz (€)“), wo möglich |
| Scroller `.tabelle-scroll` | `overflow-x:auto; max-width:100%; overscroll-behavior-x:contain; -webkit-overflow-scrolling:touch`; `> table{min-width:var(--lp-table-min)}` 560; fokussierbar (`tabindex="0" role="region" aria-label`, Seite), Ring F.7 |
| Sicherung ohne Markup | `.card:has(table), .grid2 > *{overflow-x:auto; min-width:0}` (E.7) |
| klickbare Zeile | `tr.klickbar` (neu) und `tr[onclick]`: `cursor:pointer`; Hover `(hover:hover)` `td{background:var(--lp-hover)}`; Pflicht (Verwaltung, M27): erste Zelle enthält `<button class="linkbtn">Name</button>` für Tastatur und Screenreader |
| Aktion in Zelle | sm 44 (R2), Reihe `.row`; kein Inline-`nowrap` |
| Leerzustand | `td.leer` (neu), `td[colspan].muted`: zentriert, lp-t-ui muted, `padding:24px 12px`, Wortlaut im Stil von `.leer` („Noch keine Kundinnen in diesem Zeitraum.“) |
| Spaltenzahl, Kopf | jede Tabelle hat `<thead>` mit so vielen `th` wie `td` (`#praemien`, `#advent`: 6 → 7 `th`, H10). Nur dann greift die Kopfwiederholung im Druck |
| Heatmap-Zelle | `[data-stufe]` (neu): `height:var(--lp-heat-cell)` 34, `text-align:center`, Rand 1px `--lp-line-soft`, Radius 3, lp-t-caption 500 lining tabular, Farben C.5; Stunden-`th` zentriert über den zentrierten Zellen |

### G.5 Kennzahlen `.metrics` – Container-Regel ohne Waisen und ohne Überlauf

```css
.metrics{ container:lp-kpi / inline-size; display:flex; flex-wrap:wrap; gap:var(--lp-gap-kpi);
  margin:var(--lp-rhythm-section) 0; padding:var(--lp-space-6) 0; border-block:1px solid var(--lp-line); }
.metrics.weitere{ border-top:0; margin-top:0; padding-top:0; }                                   /* wertgleich */
.metrics > *{ --_n:1; flex:0 0 calc((100% - (var(--_n) - 1) * var(--lp-gap-kpi)) / var(--_n) - .1px); min-width:0;
  display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; column-gap:12px; padding:12px 0; }   /* Liste < 448 */
.metrics > * > strong{ grid-column:2; grid-row:1 / 3; margin:0; }                                  /* lp-t-kpi-list 28px */
@container lp-kpi (min-width:448px){
  .metrics > *{ --_n:2; display:block; padding:var(--lp-pad-tile); }
  .metrics > * > strong{ margin:8px 0; }                                                            /* lp-t-kpi 32px */
  .metrics > :first-child:nth-last-child(2n+1){ --_n:1; }                    /* 3, 5, 7 … → erste Kachel breit */ }
@container lp-kpi (min-width:680px){
  .metrics > *, .metrics > :first-child:nth-last-child(2n+1){ --_n:3; }
  .metrics > :first-child:nth-last-child(3n+1){ --_n:1; }                    /* 7, 10 … → erste Kachel breit */
  .metrics:is(:has(> :nth-child(2):last-child),:has(> :nth-child(4):last-child)) > *{ --_n:2; } }   /* 2 → 2 · 4 → 2+2 */
@container lp-kpi (min-width:912px){
  .metrics:is(:has(> :nth-child(4):last-child),:has(> :nth-child(7):last-child),:has(> :nth-child(8):last-child)) > *{ --_n:4; } }
@container lp-kpi (min-width:1144px){
  .metrics:is(:has(> :nth-child(5):last-child),:has(> :nth-child(10):last-child)) > *{ --_n:5; } }
```

| Anzahl | Container < 448 | 448–679 | 680–911 | 912–1143 | ≥ 1144 |
|---|---|---|---|---|---|
| 2 | Liste | 2 | 2 | 2 | 2 |
| 3 | Liste | 1 + 2 | 3 | 3 | 3 |
| 4 | Liste | 2 + 2 | 2 + 2 | 4 | 4 |
| 5 | Liste | 1 + 2 + 2 | 3 + 2 | 3 + 2 | 5 |
| 6 | Liste | 2 + 2 + 2 | 3 + 3 | 3 + 3 | 3 + 3 |
| 7 | Liste | 1 + 2 + 2 + 2 | 1 + 3 + 3 | 4 + 3 | 4 + 3 |
| 8 | Liste | 2 × 4 | 3 + 3 + 2 | 4 + 4 | 4 + 4 |

- **Kein Überlauf:** An jeder Schwelle ist der Kachelinhalt ≥ 184px, denn `(W − (n−1)·16)/n − 32` ergibt bei 448/680/912/1144 genau 184/184/184/184px. „12.400,50 €“ in Jost 500 32px tabellarisch misst 183px, in der Liste bei 28px 162px, dort steht der Wert allein rechts. Der Wert `strong` hat `white-space:normal`, damit bei längeren Beträgen höchstens die Einheit umbricht, nie die Zahl (Zahlen haben keine Umbruchstellen).
- **Verwaltung gerechnet** (Inhalt = Viewport − 200 − 2 × 32): 1024 → 760px (4 KPI = 2+2, 5 = 3+2, 6 = 3+3) · 1280 → 1016px (4 = 4, 5 = 3+2) · 1440 → 1176px (5 = 5) · 900 → 636px (2 Spalten) · ≤ 768 (eine Spalte, Gutter 20) 728px → 3 Spalten.
- Zelle: Label `span` lp-t-caption muted (Umbruch erlaubt) · Wert `strong` lp-t-kpi 32/1.15 500 `--lp-text` lining tabular (Listenform lp-t-kpi-list 28px) · Einheit `em` 18px 400 `font-style:normal` muted · Unterzeile `small` lp-t-caption muted · `.bdelta` lp-t-caption, `.plus` `--lp-ok`, `.minus` `--lp-danger`, Vorzeichen + Wort, kein Grün.
- Rückfall ohne Container-Abfragen (Safari < 16): Listenform für alle Mengen (lesbar, ohne Waisen).

### G.6 Meldungen: Toast, Hinweis, Unklar, Beobachtung, Pill, Rang, Avatar

| Bauteil | Spezifikation |
|---|---|
| Toast `.toast`, `#toast`, `.note` | `position:fixed; left:var(--lp-gutter); right:var(--lp-gutter); margin-inline:auto; width:fit-content; max-width:var(--lp-toast-max)` 520 (volle Mobilbreite: 350px @390 statt 195px, M7); `bottom:calc(24px + var(--_toast-offset) + env(safe-area-inset-bottom))`; `z-index:var(--lp-z-toast)`; Grund `--lp-surface-raised`, Rand 1px `--lp-line`, Radius 12, `padding:12px 16px`, lp-t-ui, `display:flex; gap:8px; align-items:flex-start; text-align:start; overflow-wrap:break-word`, `box-shadow:var(--lp-shadow-2),var(--lp-shadow-lustre)`; verborgen `transform:translateY(140%); visibility:hidden`, `.on{transform:none; visibility:visible}`; `transition:transform var(--lp-dur-layer) var(--lp-ease)` (180ms wertgleich; nur die X-Zentrierung `translate(-50%,…)` entfällt) |
| Varianten | `.ok` (neu gesetzt von JS): Rand + Zeichen ✓ `--lp-ok`, Text `--lp-text` · `.warn` (neu): Dreieck `--lp-warn` · `.err`, `.note.bad`: Rand + !-Kreis `--lp-danger`, Text `--lp-text` (Wortlaut trägt). Rollen: `role="status"` (ok/warn) bzw. `role="alert"` (Fehler). Standzeit 3800ms, Pause bei Hover/Fokus, Fehler bleiben bis zur nächsten Aktion (Seiten-JS) |
| Hinweis `.hinweis` | `display:flex; gap:8px; align-items:flex-start; background:var(--lp-accent-soft); border-left:3px solid var(--lp-accent-mark); border-radius:12px; padding:12px 16px`, lp-t-ui `--lp-text`; `.warn`: `--lp-warn-soft` + Balken `--lp-warn` + Dreieck (vorher Fehlerfarbe, M5) · `.fehler`: `--lp-danger-soft` + `--lp-danger` + !-Kreis · `.ok` (neu): `--lp-ok-soft` + `--lp-ok` + ✓. Der neutrale Hinweis hat kein Zeichen |
| Beobachtung `.beob` | Hinweis ohne Fläche: `border-left:3px solid var(--lp-accent-mark); padding:8px 16px; margin:8px 0`, lp-t-ui `--lp-text-muted` |
| Ungeklärt `.unklar` (R01) | `display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin:0 0 16px; padding:12px 16px; border:1px solid var(--lp-warn); border-radius:12px; background:var(--lp-warn-soft)`, lp-t-ui; `::before` Dreieck 18 × 18 `--lp-warn`, `flex:none`; `.txt{flex:1 1 calc(100% - 30px); min-width:0}` → Zeichen und Text in Zeile 1, Buttons darunter; Buttons sm 44 (vorher 40), `align-self:stretch` (R1). **Wortlaut unverändert** (T:752–756: „Erneut senden“ / „Status prüfen“ / „Hinweis schließen – Buchungsstatus bleibt ungeklärt“; zweizeilig zulässig, gleiche Höhe über R1). Nie Fehlerrot |
| `#offenHinweis`, `#offenListe .zeile` (Seitenrest) | Buttons sm 44 (vorher 40); Block-Regel `body.terminal #offenListe .zeile{align-items:stretch}` und `body.terminal #offenListe .zeile .t{align-self:center}` (1,2,1 schlägt den Seitenrest 1,1,0) |
| `.mp-kurz` (ungenutzt) | Werte wertgleich; Grund `--lp-accent-soft`, Rand `--lp-accent-mark`, Radius 12, `padding:12px 16px`; `mp-ebene 260ms`, `mp-seal .65s` unverändert |
| Pill `.pill` | `display:inline-flex; align-items:center; gap:4px; min-height:var(--lp-pill-h)` 24, `padding:2px 12px; border-radius:var(--lp-radius-pill)`, lp-t-pill; neutral `--lp-accent-soft` / `--lp-accent` · `.ok`, `.gut` `--lp-ok-soft` / `--lp-ok` + ✓ · `.warn` + Dreieck · `.fehler` + !-Kreis (Glyph 1em). Wortlaut `MAIL_STATUS` (B:1937–1939) unverändert |
| Rang `.rank` | `display:inline-flex; align-items:center; gap:4px`, lp-t-eyebrow (12px 500 .12em versal; vorher .08em 400); Icon `#i-sparkle` 14px `--lp-accent`; `.member .rank{color:var(--lp-member-text)}` |
| Avatar `.avatar` | 34 × 34 Kreis, Grund `--lp-surface`, lp-t-caption `--lp-text-muted`, `flex-shrink:0`; `.avatar.large` 52 × 52, Grund `--lp-field`, Cormorant 500 21px `--lp-text` |

### G.7 Dialog und Sheet – ein Muster

| Teil | Spezifikation |
|---|---|
| Scrim `.sheet`, `.overlay` | `position:fixed; inset:0; z-index:var(--lp-z-sheet)`; `background:var(--lp-scrim); backdrop-filter:blur(6px)`; `display:none` → `.on{display:flex}`; `align-items:flex-start; justify-content:center; padding:min(90px,12vh) var(--lp-gutter) calc(32px + env(safe-area-inset-bottom)); overflow:auto; overscroll-behavior:contain` |
| Fläche `.sheet .card`, `.dialog` | `width:min(var(--lp-dialog-s),100%)` 400 (vorher 390), `.breit` `min(var(--lp-dialog-m),100%)` 540; Grund `--lp-surface` (vorher `--mp-bg`, Felder verschmolzen), Rand 1px `--lp-line`, Radius 18, `padding:var(--lp-pad)`, `box-shadow:var(--lp-shadow-2),var(--lp-shadow-lustre)`, `position:relative`; Einblendung `animation:mp-ebene var(--lp-dur-sheet) var(--lp-ease) both` (.4s, wertgleich) |
| Nativer Dialog `.mp-admin-dialog` | gleiche Fläche, Rand, Radius, Padding, Schatten; `width:min(var(--lp-dialog-m), calc(100vw - 2 * var(--lp-gutter)))` 540 (vorher 520); `max-height:calc(100dvh - 32px); overflow:auto; margin:auto`; **ohne Einblendung** (wie bisher); `::backdrop{background:rgba(16,13,16,.78); background:var(--lp-scrim,rgba(16,13,16,.78)); backdrop-filter:blur(6px)}` |
| Kopf | `h2` lp-t-h2-card, `margin:0 0 8px` (Sheet vorher 26px, Admin mb 12); Einleitung `p` lp-t-ui muted `margin-bottom:16px`, max. 68ch; Schließen `.dialog .icon-button.close`, `.sheet .card .icon-button.close` (neu): `position:absolute; top:12px; right:12px`, 44 × 44, `#i-x`, dann `h2{padding-right:56px}` |
| Inhalt | Felder mit `.field`-Rhythmus 16; im nativen Dialog `label{display:block; margin:16px 0 0}`, `select, textarea{margin-top:8px}`. Zusammenfassung vor unumkehrbaren Schritten `dl.zusammenfassung` (neu): Zeilen `display:grid; grid-template-columns:minmax(0,1fr) auto; gap:4px 16px; padding:8px 0; border-bottom:1px solid var(--lp-line-soft)`, `dt` muted, `dd` 500 lining rechts |
| Aktionen | `.aktionen` bzw. `.row`: R1, `justify-content:flex-end; margin-top:var(--lp-rhythm-group)`; Abbrechen (Sekundär) → Primär mit Verb + Objekt („Prämie ausgeben“, „150 Perlen abziehen“); beide md 48; ≤ 480 füllen beide die Zeile (R3). Der Mail-Dialog bekommt damit 12px Abstand (vorher 0px, undefinierte `.row`) |
| Verhalten (Seiten-JS, ein Helfer für Terminal und Verwaltung) | `role="dialog" aria-modal="true" aria-labelledby`; Fokus aufs erste Feld (50ms wie T:1521) bzw. `h2[tabindex=-1]`; Tab-Falle; **Escape = Abbrechen**; Scrim-Klick schließt nur nicht-destruktive Dialoge; Hintergrund `inert`; Fokus zurück zum Auslöser. Ersetzt `confirm()`/`prompt()` (T:1407, 1483, 1488, 1501; B:1384, 1687, 1741) mit gleichem Wortlaut und gleicher Logik. Rückmeldungen im offenen nativen Dialog als `.hinweis` im Dialog (Top Layer, F.5) |

### G.8 Markenleiste `.brandbar`

`display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--lp-space-4); border-bottom:1px solid var(--lp-line-soft)` (statt `#6C4C483F`). Club `padding:20px 0` in der Club-Spalte (vorher 24), Terminal und Verwaltung `padding:20px var(--lp-gutter)` + sichere Bereiche (E.6, vorher `22px 30px`) → Höhe 95px (20 + 54 + 20 + 1) in allen Apps.

**Logo unverändert:** Fenster `.brandbar .logo{display:block; width:140px; height:54px; overflow:hidden; position:relative; flex-shrink:0}`, `img{position:absolute; width:220px; height:auto; max-width:none; left:-40px; top:-30px}`; Login-Vollzeichen `min(240px,70vw)`; `.logo span` 12px 500 .12em muted (ungenutzt; vorher 10px).

`.brandbar > .eyebrow` ist < 769 ausgeblendet (wertgleich). `.user`: `display:flex; align-items:center; justify-content:flex-end; flex-wrap:wrap; gap:var(--lp-space-3); margin-left:auto; min-width:0`, lp-t-small `--lp-text-muted`; Textteil (Name, `#who`) `overflow-wrap:anywhere; min-width:0` – **keine Ellipse**. „Abmelden“ ist sm 44. Schmal umbricht `.user` rechtsbündig unter das Logo (Verwaltung @390 zwei Zeilen statt linksbündig 155px). Nicht sticky, kein z-index. Im Perle-Thema bleibt das Gold-Logo auf Crème (Logo-Ausnahme, C.1).

### G.9 Navigation

| Teil | Spezifikation |
|---|---|
| `.admin-layout` | `display:grid; grid-template-columns:var(--lp-sidebar-w) minmax(0,1fr)` (176 → 200px); `min-height:calc(100dvh - 95px)` (vorher `100vh − 92px`); ≤ 768 `grid-template-columns:1fr; align-content:start` (behebt den gestreckten „Bereiche“-Button, M19) |
| `.sidebar` (≥ 769) | Grund `--lp-surface`, `padding:24px 16px` (29/16), `display:flex; flex-direction:column; gap:4px` (5); `position:sticky; top:0; align-self:start; min-height:calc(100dvh - 95px); max-height:100dvh; overflow-y:auto; z-index:var(--lp-z-sticky)` |
| Gruppe `.gruppe` | lp-t-eyebrow `--lp-text-muted`, `padding:16px 12px 8px` (14/10/6); `:first-child{padding-top:0}` |
| Eintrag `.sidebar button` | `display:flex; align-items:center; gap:12px; width:100%; min-height:44px; padding:10px 12px; border:0; border-radius:12px` (8), transparent, lp-t-ui `--lp-text`, `text-align:left`; Icon 16 muted; Label darf zweizeilig umbrechen (EN/RU), Icon bleibt mittig; Hover `(hover:hover)` `--lp-hover`; **aktuell** `[aria-current="page"]`: Grund `--lp-selected`, Text + Icon `--lp-accent`, Marke `box-shadow:inset 3px 0 0 var(--lp-accent-mark)` (Form zusätzlich zur Farbe; Forced Colors: Outline) |
| Fuß `.sidebar-foot` | `margin-top:auto; padding:48px 12px 12px`; Titel lp-t-title-s (19 → 18); `> span` lp-t-caption muted, `margin-top:8px` |
| Mobil `.bereiche-btn` (< 769) | Sekundär md: `display:flex; justify-content:space-between; width:auto; margin:var(--lp-rhythm-between) var(--lp-gutter) 0` (vorher x = 0 und 52–229px hoch); Inhalt `#i-menu` + „Bereiche“ + aktueller Bereich muted; `aria-expanded`, `aria-controls` |
| Mobil `.sidebar.offen` | im Fluss (kein Overlay, keine Ebene): `display:flex; padding:12px var(--lp-gutter); gap:2px`, Fuß aus; nach der Wahl schließt das Menü, der Fokus springt auf das `h1` des Bereichs (JS) |
| Tabs/Segmente | G.2 |
| Rechtslinks `.legal` | `display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; border-top:1px solid var(--lp-line); padding:12px 0 16px` (12/18), lp-t-caption muted; `a{color:var(--lp-text-muted); display:inline-flex; align-items:center; min-height:44px; padding:0}` (34 → 44, L6) |
| `summary` (Konto und Datenschutz) | `min-height:44px; padding:10px 0; cursor:pointer; font-weight:500`, `::marker{color:var(--lp-text-muted)}`, Ring F.7 (24 → 44px, UA-Ring → MP-Ring) |

### G.10 Mitgliedskarte `.member` (Nacht-Insel, Material wertgleich)

| Teil | Spezifikation (Fassung 3 wertgleich, sofern nicht **fett**) |
|---|---|
| Karte | `position:relative; isolation:isolate; overflow:hidden`; `background:var(--lp-member-gradient)`; Text `--lp-member-text` `#FAE8DE`; Rand 1px `--lp-member-edge`; Radius 18; `padding:22px 22px 16px` (≤ 480 `20px 16px 14px`); **hell zusätzlich `box-shadow:var(--lp-shadow-object)`** |
| Innenrahmen `::before` | `content:""; position:absolute; inset:8px; border:1px solid var(--lp-member-frame); border-radius:var(--lp-radius-member-frame)` 11px; `pointer-events:none` |
| Glanz `::after` | `inset:-90%; z-index:var(--lp-z-below)`, Verlauf C.6, `transform:translateX(-60%)`; `@media (hover:hover){ .member:hover::after{ animation:lp-shine var(--lp-dur-shine) var(--lp-ease-css) both } }`; Datensparen aus (F.11) |
| Kopf `.head` | `display:flex; justify-content:space-between; align-items:center; gap:8px;` **`flex-wrap:wrap`**; `.eyebrow` `--lp-member-muted`; `.rank` `--lp-member-text`, `.rank .ic` 14 × 14 `--lp-accent` (Insel: `#DFBE95`, 5.71–9.29:1) |
| Saldo `.balance` | Cormorant 400 66/1, `letter-spacing:-.04em`, zentriert, `margin-top:22px`, `overflow-wrap:anywhere`, **`font-variant-numeric:var(--lp-numeric)`, `text-wrap:balance`**; `.lang` 52, `.sehrlang` 40, ≤ 340 52; `.sub` `display:block`, Jost 400 13/1.5, `letter-spacing:0`, `margin-top:5px`, `--lp-member-muted` |
| Kette | `.necklace{height:117px; position:relative; margin:0 4px}`; `.chain{position:absolute; left:5%; right:5%; height:100px; top:-12px; border-bottom:1px solid var(--lp-chain); border-radius:0 0 50% 50%; transform:rotate(-7deg); pointer-events:none}`; Perlen G.12 |
| Fuß `.foot` | `display:flex; justify-content:space-between; gap:8px`, lp-t-caption `--lp-member-muted`, `border-top:1px solid var(--lp-member-rule); padding-top:12px; min-height:30px`; `#kettenZahl` lining tabular |
| Druck | `background:var(--lp-paper)`, Rand 1px `--lp-line`, Text `#3B2E1E`, gedämpft `#6E5C44` (B.3 1e) |

### G.11 Prämien, Advent, Bestenliste, Gewinne

| Teil | Spezifikation |
|---|---|
| Kopf `.reward-heading` | `display:flex; align-items:end; justify-content:space-between; gap:12px; flex-wrap:wrap; margin:var(--lp-rhythm-section) 0 var(--lp-rhythm-between)` (27/17 → 32/16); `.eyebrow{display:block; margin-bottom:8px}`; h2 lp-t-h2 in allen Breiten; Zähler „01 / 03“ lp-t-small lining tabular muted |
| Hervorgehoben `.featured-reward` (`<button>`, keine Insel) | `display:grid; grid-template-columns:var(--lp-art-col) 1fr` 102 (≤ 480 87), `width:100%; padding:0; border:0; text-align:left; border-radius:var(--lp-radius-l)` (12.6 → 18), `overflow:hidden; background:var(--lp-reward-gradient); color:var(--lp-text); box-shadow:var(--lp-shadow-reward-edge)` (hell 1px Papierkante); Fokusring außen auf der Seite (5.16 / 9.80) |
| Motiv (wertgleich) | `.reward-art{min-height:154px; position:relative; background:var(--lp-art); overflow:hidden}` (hell Champagner `#E2CFA6`); `.orbit{position:absolute; width:102px; height:110px; border:2px solid var(--lp-orbit); border-radius:50%; top:22px; left:0; transform:rotate(-30deg); opacity:.5}`; `.art-pearl,.dialog-pearl,.bottom-pearl{display:block; width:62px; height:65px; border-radius:49% 51% 47% 53%; background:<Prämienperle C.6>; box-shadow:var(--lp-shadow-artpearl)}`; `.art-pearl{position:absolute; left:20px; top:43px; transform:rotate(-15deg); transition:transform var(--lp-dur-progress) var(--lp-ease)}` (≤ 480 `left:13px`); `@media (hover:hover){ .featured-reward:hover .art-pearl{ transform:rotate(15deg) translateY(-5px) } }` |
| Text `.reward-copy` | `display:flex; flex-direction:column; align-items:start; gap:8px` (7), `min-width:0`, `padding:var(--lp-pad-tile)` 16 (≤ 480 `16px 12px`; vorher `17px 15px` / `15px 12px`); `.ready` 12/1.5 500 `.02em` `--lp-accent`; `strong` lp-t-title 21/1.2 500 `overflow-wrap:anywhere`; `.detail` lp-t-small muted; `.bottom` lp-t-small, `display:flex; justify-content:space-between; align-items:center; gap:8px; width:100%; margin-top:auto`, `#i-arrow-up` 18 |
| Liste `.reward-list .item` | `display:grid; grid-template-columns:minmax(0,1fr) auto; gap:4px 12px; align-items:center; padding:16px 0; border-bottom:1px solid var(--lp-line)` (14 → 16); `strong` lp-t-title-s; `.small{grid-column:1}` (Status im Wort: „erreicht – am Empfang einlösbar“ / „noch 120 Perlen“); `.pts{grid-column:2; grid-row:1 / 3}` lp-t-num `--lp-text-muted`; `.frei .pts` `--lp-accent` |
| Bestenliste `.board .brow` | `display:grid; grid-template-columns:32px minmax(0,1fr) auto; gap:12px; align-items:center; padding:12px 0; border-bottom:1px solid var(--lp-line)` (10 → 12); `.ich` `--lp-accent`; `.pl` lp-t-title-s; `.pn` lining tabular |
| Advent `#adventBox`, `.advent`, `.door` (E37, aus `design/relaunch`) | **Kasten** `#adventBox`: `background:var(--lp-surface); color:var(--lp-text); border:1px solid var(--lp-line); border-radius:80px 80px 24px 24px` (Markenmaterial), `padding:36px 24px; margin:16px -8px 32px; position:relative; isolation:isolate`, Container `lp-advent`; Eyebrow, h2 (36px, 400) und Lead (14px) zentriert in `--lp-text`. **Fächer** `::before/::after`: 38 × 108, `top:22px`, links/rechts 15px, `border-left:1px solid var(--lp-text-muted)`, Rundung 50 %, Gravur `repeating-linear-gradient(34deg, transparent 0 13px, var(--lp-accent-mark) 14px 15px, transparent 16px 23px)`, `opacity:.45`, gedreht −24° (rechts gespiegelt). **Raster** `.advent`: 4 Spalten, `gap:10px`, `perspective:800px`; ≤ 600px 3 Spalten, ≤ 420px `gap:8px`; Kasten ≥ 640px 6, ≥ 900px 8 Spalten (`gap:16px`, Tür 120px). **Tür** `.door`: Höhe 92px (≤ 600px 108px), mind. 44 × 44, `padding:8px; overflow:hidden; border:1px solid var(--lp-border-control); border-radius:30px 30px 4px 4px; background:var(--lp-bg)`; zwei **Flügel** `::before/::after` je halbe Breite, Rand `--lp-border-control`, Verlauf `145deg --lp-bg → --lp-surface`, Drehpunkt außen, `backface-visibility:hidden`. `.vorn` 30px Display 400 lining tabular `--lp-text`; `.hinten` 13/1.2 UI `--lp-text`, zentriert, Silbentrennung, optionales Bild 52px hoch `object-fit:contain` (≤ 420px: 12px, Innenabstand 5px). **Zustände:** heute `:not(:disabled)` 2px `--lp-accent-mark` + Hof `0 0 0 3px var(--lp-line)`; verpasst gestrichelt; künftig geschlossen; geöffnet `.auf` Flügel `rotateY(∓108deg)` unsichtbar, Zahl aus, Gewinn sichtbar – **nie verblasst** (`opacity:1` für alle Türen, Zustand über Form); `[aria-busy="true"] .vorn` 16px. **Öffnen** `.lp-door-opening` (nur nach erfolgreicher Antwort von `advent_oeffnen`): `lp-open-left/right 1450ms var(--lp-ease) both`, `lp-gift-rise 1750ms var(--lp-ease) both`, `lp-door-number 600ms linear both`; Neuzeichnen während der Öffnung setzt `--_door-elapsed` (negative Verzögerung). Reduzierte Bewegung: sofort Endzustand. Forced Colors: heute 2px `Highlight`, verpasst gestrichelt. Kontrast: Zahl/Gewinn 11.5–14.5:1, Türrand 3.66/3.73:1, heute-Rand 4.03–9.8:1 (beide Themen). `.bild` direkt in der Tür bleibt ausgeblendet (Bild jetzt in `.hinten`). |
| Gewinne `.gewinn` | `display:flex; gap:12px; align-items:center`; `.bild` 56 × 56 Radius 12 `object-fit:cover`; Titel lp-t-title-s (heute inline club:1249 → Klasse `.gewinn strong`, Seitenrest) |
| Leer | `.leer` „Aktuell sind keine Prämien hinterlegt.“ (club:793, unverändert) |
| `.hp` | `position:absolute; left:-9999px` (wertgleich; Honeypot fachlich unverändert) |

### G.12 Perlenkette und Fortschritt

- **Perlen `.pearl` (wertgleich):** `position:absolute; border:0; padding:0; min-width:44px; min-height:44px; background:transparent; transform:translate(-50%,-50%); isolation:isolate; border-radius:50%`; `::before{content:""; position:absolute; inset:7px; border-radius:48% 52% 47% 53%; background:<Kettenperle C.6>; box-shadow:var(--lp-shadow-pearl); transition:transform var(--lp-dur-pearl) var(--lp-ease-css); z-index:var(--lp-z-below)}`; p2 `inset:4px`, p4 `inset:1px`, p6 `inset:3px`; Positionen p1 6 %/42 %, p2 21 %/64 %, p3 39 %/73 %, p4 58 %/72 %, p5 77 %/56 %, p6 94 %/26 % (≤ 400 p1 9 %, p6 91 %); `.deko{pointer-events:none; opacity:var(--lp-opacity-deko)}`, `.deko::before{box-shadow:var(--lp-shadow-pearl-deko)}`; Hub `translateY(-5px) scale(1.12)` für `[aria-pressed="true"]` immer, für `:hover` nur `(hover:hover)`; Fokus Versatz −2px.
- **`.next`:** `display:flex; align-items:center; gap:12px; margin:24px 0 8px` (21/10, gap 10); `> .ic` (`#i-gem`) `--lp-accent`; `> div{flex:1; min-width:0}`; `strong`, `> div > span` `display:block` lp-t-small 400, `span` muted; `.next-number` lp-t-small lining tabular.
- **`.track`:** `height:var(--lp-track-h)` 3 (wertgleich), `border-radius:var(--lp-radius-pill)`, `background:var(--lp-track)` (dunkel `#5A4242`, hell `#E4D5BB`; vorher Kartenfarbe = unsichtbar), `overflow:hidden`; `> span{display:block; width:0; height:100%; background:var(--lp-accent-mark); transition:width var(--lp-dur-progress) var(--lp-ease)}` (5.21 / 3.19:1 gegen die Spur); `role="progressbar"` + `aria-valuenow/-max/-valuetext` (vorhanden) tragen den Wert.
- **`#rewardProgress`:** Karte; `strong#rewardProgressName` 500 (vorher synthetisch 700, M15); Rhythmus 8/16.

### G.13 Registrierungsschritte (Seitenrest club:642–644, Umstellung H.6)

`.reg .plus{display:flex; gap:16px; align-items:flex-start; padding:12px 0}` (gap 14); `.z` 32 × 32 (30), `border-radius:50%; border:1px solid var(--lp-border-control); display:grid; place-items:center; flex-shrink:0`, lp-t-step Cormorant 500 16/1 lining (15px Mediäval saß tief); `.t` lp-t-body-strong; `.u` 14/1.5 muted. Ausrichtung: Logo, Eyebrow, h1 und Leitsatz zentriert als Einheit (Leitsatz max. 68ch), Schritte, Formular und Kleingedrucktes linksbündig (M28). `#rBtn.main-action` lg 56 mit Pfeil. Honeypot `.hp` und 2-s-Zeitschutz bleiben unverändert.

### G.14 Einwilligung / Auswahlkarte (Seitenrest club:654–669 auf Token, M14; `.lp-auswahl` neu als Blockklasse mit identischen Werten)

| Zustand | Spezifikation |
|---|---|
| Ruhe `.consent-card`, `.lp-auswahl` | `display:flex; align-items:flex-start; gap:12px; padding:var(--lp-pad-tile)` 16 (18); `margin:12px 0` (14); Rand **1px** `--lp-border-control` (2px `#927875`); Radius 18 (16); Grund `--lp-surface` (`#2b2224`); Text `--lp-text` lp-t-body (`#f7eee7`); `cursor:pointer` |
| Checkbox | nativ 22 × 22 (26), `accent-color:var(--lp-accent-mark)`, `margin-top:1px`; die ganze Karte ist Trefffläche |
| gewählt `:has(input:checked)` | Rand `--lp-accent-mark`, `box-shadow:var(--lp-shadow-selected)` (2px optisch, ohne Sprung), Grund `--lp-accent-soft` (`#49382d`) |
| Fokus | ein Ring an der Karte (`:focus-within`, F.7), Checkbox ohne eigenen Ring (vorher 3px `#f5ddbc` + Checkbox-Ring) |
| Links | `--lp-accent`, unterstrichen `--lp-link-underline` (vorher `#f5ddbc`) |
| Zustandszeile `.consent-state` | lp-t-pill 13/1.5 **500** (600) `--lp-text-muted` (`#d7c5bd`); gewählt `--lp-accent` + ✓-Maske; **Text im Markup** („Zum Bestätigen anklicken“ / „Bestätigt“), nicht in CSS `content` (M16) |
| Rechtsbestätigung `#rechtsBestaetigung` | `padding:var(--lp-pad)` (22), Rand 1px `--lp-border-control`, Radius 18, `margin-top:24px`; `.bestaetigt` Rand `--lp-accent-mark` + Grund `--lp-accent-soft` (statt `#dfbe95`/`#302820`), `> p.small{display:none}` (wie heute) |
| `#rechtAnnehmen` | `.main-action` lg 56, `margin-top:12px`; beschäftigt = `.laedt` + `aria-busy` (statt `#49382d/#ffe3b8`); erledigt: Button `hidden`, danach `.hinweis.ok` „Deine Bestätigung ist gespeichert. Du musst nichts weiter tun.“ (Wortlaut club:1051) – Erfolg sieht nicht mehr aus wie ein deaktivierter Primärbutton |
| `#rechtStatus` | lp-t-pill `--lp-accent`, `margin:12px 0 0` (vorher `#ffe3b8` 600) |

Die zehn Literale `#927875`, `#2b2224`, `#f7eee7`, `#dfbe95`, `#49382d`, `#f5ddbc`, `#d7c5bd`, `#ffe3b8`, `#302820`, `#21191a` entfallen.

### G.15 Terminal (Theke)

| Teil | Spezifikation |
|---|---|
| Rahmen | `.workspace{max-width:var(--lp-container-wide); margin:0 auto; padding:var(--lp-gutter)}` + sichere Bereiche; `.workspace > h1{margin:8px 0 24px}` (12/25); `.terminal-grid{display:grid; grid-template-columns:.85fr 1.4fr; gap:24px; align-items:start}` (26), `> *{min-width:0}`, ≤ 768 eine Spalte, gap 16 (18). Seitenrest `.terminal-spalten`: Block-Regeln `.terminal .terminal-spalten{gap:24px}`, `.terminal .terminal-spalten > .stapel{gap:24px}` (0,3,0), `@media (max-width:768px){ .terminal .terminal-spalten{align-items:stretch; gap:16px} }` (H9). Die Reihenfolge V13/V15 ist unverändert |
| Anmeldung `.login` | `max-width:calc(var(--lp-container-login) + 2 * var(--lp-gutter)); margin:12vh auto 0; padding:0 var(--lp-gutter); text-align:center`; `.logo img{width:var(--lp-logo-login); height:auto}`; `.field{text-align:left}`; `#loginBtn.main-action` lg 56 mit Pfeil |
| Suche/Scan | `.searchrow` G.2 |
| Scanbox `.scanbox` (Insel) | `position:relative; background:var(--lp-stage); border-radius:var(--lp-radius-l); overflow:hidden; aspect-ratio:4/3; box-shadow:var(--lp-shadow-object)`; `video{width:100%; height:100%; object-fit:cover}`; `.frame{position:absolute; inset:18%; border:1.5px solid var(--lp-scan-frame); border-radius:var(--lp-radius-inner)}` (16px wertgleich); aktiv `.scanbox.aktiv .frame{border-color:var(--lp-accent)}` (neu, `#DFBE95` in der Insel, statisch); darunter `.hint` „Karte ruhig in den Rahmen halten.“ (Markup, L12) |
| Kundinnenkarte `.customer` | Karte (`padding:var(--lp-pad)`, 25 → 24); `.customer-top{display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:16px}`; `.avatar.large`; `h2` lp-t-h2 `overflow-wrap:anywhere`; `.kunde-nr` (Seitenrest) 13 muted lining; `.customer-balance` lp-t-amount 56/1 lining tabular, `margin:24px 0 16px` (54px, 22/15), ≤ 480 44; `> .u` Jost 400 13 muted; `.customer-line{display:flex; justify-content:space-between; gap:12px; padding:12px 0; border-top:1px solid var(--lp-line)}` lp-t-small, `> strong{font-weight:500; text-align:right}`; `.terminal-reward{display:flex; gap:8px; align-items:center; margin:24px 0 16px}` lp-t-small `--lp-accent`; `.customer .secondary{width:100%}` (wertgleich); Schnellaktionen `.aktionen` „Perlen buchen“ Primär md + „Prämien einlösen (3)“ Sekundär md → 48/48 |
| Buchung `.booking` | `padding:0 0 24px; min-width:0`; `> h2{margin:12px 0 8px}` (6 → 8); `.fuer` lp-t-ui muted `margin-bottom:24px` (22), `b{color:var(--lp-text); font-weight:500}`; `.amount-label` lp-t-small muted; `.amount{display:flex; align-items:baseline; gap:8px; min-height:var(--lp-amount-min); padding:8px 0; margin-bottom:16px; border-bottom:1px solid var(--lp-line); overflow-wrap:anywhere}` lp-t-amount 56/1 lining (56/1.1; mb 20 → 16), ≤ 480 44; `> span` 27px (30) |
| Ziffernblock `.pad` | `display:grid; grid-template-columns:repeat(3,1fr); gap:8px` (≤ 340 6), `max-width:var(--lp-pad-max)` 360 (320), `margin:16px 0 24px` (0/20 – vorher 0 Abstand zum Feld); Taste `min-height:var(--lp-control-lg)` 56 (52; ≤ 340 48), lp-t-key Cormorant 400 26/1 lining tabular (≤ 340 21), Grund `--lp-surface`, Rand 1px `--lp-border-control`, Radius 12, Text `--lp-text`; Hover `(hover:hover)` Rand `--lp-accent-mark`; `:active` Grund `--lp-accent-soft` + Rand `--lp-accent-mark`; Tasten „,“ und „←“ mit `aria-label` („Komma“, „Löschen“) |
| Kategorien `.categories` | G.2 Chips (Radius 30 → 28, sm 44) |
| Abschluss | `.formzeile` (Behandlung, Zahlungsart – **keine Kassenbonnummer beim Buchen**, fachlich unverändert); `.booking-separator{height:1px; background:var(--lp-line); margin-top:24px}`; `.booking .main-action{margin-top:24px}` (20); `#buchenBtn` Label-`<span>` + Pfeil |
| Prämienliste `.list .item` (`<button>`) | `width:100%; display:grid; grid-template-columns:minmax(0,1fr) auto; gap:2px 12px; align-items:center; text-align:left; min-height:var(--lp-row-min)` 56; `padding:12px 16px` (12/14); `margin-bottom:8px`; Grund `--lp-field`, Rand 1px `--lp-border-control`, Radius 12, Text `--lp-text`; `.t` lp-t-body-strong; `.u` lp-t-small muted; `.p{grid-column:2; grid-row:1 / 3}` lp-t-num muted; `.erreichbar` Rand `--lp-accent-mark`, `.p` `--lp-accent`; **`.gewinn` Rand `--lp-ok`, `.p` `--lp-ok` lp-t-th (12px 500 .06em versal) + ✓-Maske** (vorher grün, 13px); gesperrt `:disabled`: `opacity:1; border-style:dashed; color:var(--lp-text-muted); cursor:not-allowed`. Reihenfolge und Datenquelle unverändert (offene Gewinne → einlösbar → nach Punkten, T:1331) |
| Verlauf `.log .zeile` | `display:grid; grid-template-columns:minmax(0,1fr) 8ch 10ch; gap:12px; padding:12px 0; border-top:1px solid var(--lp-line-soft)` (statt `1fr auto auto` → die Spalten fluchten, M17), lp-t-ui; `.b` 500 lining tabular rechts; `.d` muted rechts; Datum und Name mit „ · “ getrennt (JS) |
| Saldo-Puls | `.stand.puls{animation:zahl var(--lp-dur-progress) var(--lp-ease)}` und `@keyframes zahl` zeichengleich; Reparatur (Klasse aufs richtige Element, T:1316/769) nur nach Freigabe (I.7) |
| Korrektur | `table.korr` in der Karte (Sicherung E.7) bzw. in `.tabelle-scroll`; Aktion „richtigstellen“ sm 44; Werteingabe im Dialogmuster G.7 statt zwei `prompt()` |
| Ungeklärt | `.unklar`, `#offenHinweis`, `#offenListe` G.6 |
| Glücksrad | `.wheelwrap{text-align:center}` (keine Insel); `.needle{width:0; height:0; border-left:9px solid transparent; border-right:9px solid transparent; border-top:18px solid var(--lp-accent); margin:0 auto -8px; position:relative; z-index:var(--lp-z-local)}`; `#wheel{transition:transform var(--lp-dur-wheel) var(--lp-ease-wheel)}` (wertgleich); Canvas C.5; „Drehen“ Primär md |
| Ziel `#zielKarte` | `.card.akzent`; Satz lp-t-quote |
| Sheets `#sheetNeu`, `#sheetAus` | G.7; Kassenbon-Nummer (Pflicht) nur in „Prämie ausgeben“ – unverändert |
| Kurz-Feier | `.mp-feier.mp-compact.mp-inline` G.17, Buttons sm 44 |

### G.16 Verwaltung (dicht)

| Teil | Spezifikation |
|---|---|
| Rahmen | Markenleiste G.8, Navigation G.9; `.admin-content{padding:var(--lp-gutter); min-width:0}` (30 → 32) |
| Titel `.admin-title` | `display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; margin-bottom:8px`; `.eyebrow{display:block}`; `h1` lp-t-h1-compact 34 (≤ 480 28), `margin-top:8px` (10); Titeltext = Bereichsname (JS, M20); „Bericht“ `.secondary` sm mit `#i-download` |
| Kennzahlen | G.5 |
| Abschnitt `.section-title` | `display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin:24px 0 16px` (14 → 16); `> h2` lp-t-h2-card; alle Aktionen sm (R2: „Als CSV laden“ einheitlich Sekundär sm; vorher 54/47/44) |
| Filter `.filter` | `display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end; margin-bottom:8px` (gap 10); `> div{flex:1 1 160px; min-width:0}` (140); `label{margin-bottom:8px}` (4); Felder und Buttons sm 44, Felder 16px; `.filter .aktionen{margin:0; min-width:0}` (Chips); ≤ 480 bricht die Reihe nach „Anzeigen“ um, die Chips stehen darunter |
| Formulare | `.formzeile` G.2; Aktionsreihen R1 md; `#vMail .aktionen`: Buttons md + Feld md 48 → eine Höhe (vorher vier); `#mVon` volle Zeilenbreite |
| Karte | `body.admin .card{padding:20px; margin-top:16px}` (wertgleich); `section > .card:first-child{margin-top:0}` (Seitenrest, bleibt) |
| Typo | `body.admin h2{font-size:24px}` (wertgleich) |
| Tabellen | G.4 dicht; Hülle Pflicht |
| Balken `.bars` (Seitenrest B:643–644) | `div{background:var(--mp-accent)}` bleibt lauffähig (= `--lp-accent`, 8.55 / 5.76 gegen die Karte); Zielwert `--lp-accent-mark`, Radius `3px 3px 0 0`, `opacity:.85`; Diagramm `role="img"` + `aria-label` mit Zusammenfassung (Seite) |
| Heatmap | G.4, C.5 |
| Funktionen | `.switch`-Zeilen; Umschalter „an/aus“ = `.btn.sm` mit `aria-pressed` (an = Gewählt, aus = Sekundär, **gleicher Radius und gleiche Höhe**; vorher Pille ↔ Rechteck, M2) |
| Pills | G.6 mit Zeichen (MAIL_STATUS ok/warn/fehler) |
| Beobachtung, Bericht | `.beob` G.6; `.bblock{break-inside:avoid}`, `.bericht-kopf`, `.hinweis.noprint` |
| Rückmeldung | `body.admin .bestaetigt{box-shadow:0 0 0 2px var(--lp-ok)}` für die 400ms von `bestaetigt()` (B:1141–1148; heute ohne CSS, M10) – ein Zustandswechsel, keine Animation |
| `.customer-row` (ungenutzt) | `display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--lp-line)`; `> div{flex:1; min-width:0}`; `strong` lp-t-body-strong `overflow-wrap:anywhere` (15 → 16); `> div > span` lp-t-small muted, `margin-top:4px` |
| `.admin-bottom` (ungenutzt) | G.3 Stufe 2, `display:flex; gap:16px; align-items:center; margin-top:32px`; `h2` 24, `margin-top:8px`; `.bottom-pearl{width:42px; height:44px; flex-shrink:0; margin-left:auto}` |
| `.bdelta` | `.plus` `--lp-ok`, `.minus` `--lp-danger`, 12px (Druck G.18) |
| Kundin-Detail `#kDetail` | Karte, `tabindex="-1"`; Kopf `.row` (jetzt definiert) mit h2 + zwei Sekundär sm; `.grid2` gap 16, < 1024 eine Spalte, Kinder `min-width:0` |

### G.17 Feierbühne `.mp-feier` (eingefroren)

Alle Werte aus mp:474–549 bleiben: Overlay `position:fixed; inset:0; z-index:var(--lp-z-stage)` 1000, `display:none; align-items:center; justify-content:center; padding:16px; background:var(--lp-scrim-stage); backdrop-filter:blur(6px); overflow:auto`; `.an{display:flex; animation:mp-ebene var(--lp-dur-stage-in) var(--lp-ease) both}`; Bühne `.buehne{width:min(480px,100%); max-height:calc(100vh - 32px); overflow:auto; color:var(--lp-stage-text); border:1px solid var(--lp-stage-edge); border-radius:var(--lp-radius-stage); padding:0 24px 28px; text-align:center; position:relative}` + Hintergrund C.6; `.zu{position:absolute; right:10px; top:10px; background:transparent; border:0; color:var(--lp-stage-muted); font-size:26px; min-width:44px; min-height:44px; border-radius:50%; z-index:var(--lp-z-local-3)}`, Hover `color:var(--lp-stage-text); background:var(--lp-stage-close-hover)`; `.mp-art` 240 × 215; `.mp-pearl` 72 × 72 bei 84/78, Rosé-Rezept, `box-shadow:var(--lp-shadow-stagepearl)`, z 2; `.mp-orbit` 128 bei 56/50, 1px `--lp-stage-gold`, `box-shadow:var(--lp-shadow-orbit)`; `.mp-halo{inset:12px 20px}`; `.mp-arc` 98 bei 71/65, 1px `--lp-stage-rose`, `opacity:0`; `.mp-check` 52 breit bei 94/85, 40px, `color:var(--lp-stage-glow)`, z 3, `[data-kind="redeem"]` sichtbar; Staub `i` 3 × 3 bei 118/113 `--lp-stage-gold`; Eyebrow lp-t-stage-eyebrow `--lp-stage-gold`, `margin:0 0 9px`; h2 `font:400 clamp(32px,6vw,46px)/1.12 var(--font-display); letter-spacing:-.02em`; `.mp-detail` 16px `--lp-stage-muted`, `margin:14px 0 22px`; `.mp-reward` `max-width:370px; margin:0 auto 24px; border:1px solid var(--lp-stage-card-edge); border-radius:16px; padding:18px 20px` + Verlauf C.6; `.mp-mark` lp-t-stage-mark `--lp-stage-gold`, `margin-bottom:6px`, `overflow-wrap:anywhere`; `.mp-reward-note` 13px muted; `ul` 14px, Trenner `--lp-stage-edge`; `li.titel` 12px .12em versal muted; Glanz C.6; Kompakt (`.mp-compact .mp-art{height:180px; transform:scale(.8); margin-bottom:-20px}`), Inline (`position:static; …; padding:14px 16px 14px; border-radius:16px`, `.mp-art{height:150px; transform:scale(.7); margin:-10px auto -24px}`, h2 24, Detail `6px 0 12px` 14px, Prämie `0 auto 12px` / `12px 14px`), `.mp-reduced` und **alle Animationszeilen 508–523, 536–537 unverändert** (Tokens F.6).

**Einzige Änderung:** Die Bühnenbuttons folgen dem Buttonsystem, Vollbühne lg 56 (gerendert vorher 54), Inline sm 44 (vorher 46). Farben bleiben unverändert (`--lp-stage-gold` auf `--lp-stage`, 10.08:1). Die Bühne ist in beiden Themen dunkel (Insel) und im Druck verborgen. Fokus auf der Bühne: `#DFBE95`, 10.98:1.

### G.18 Druck

`@media print`: Perle-Satz auf Papierweiß, auch in den Inseln (B.3 1e) · `html,body{background:#FFFFFF !important; color:var(--lp-text) !important}` · `.card, .metrics > *, .customer, .member{background:var(--lp-paper) !important; border:1px solid var(--lp-line) !important; box-shadow:none !important; break-inside:avoid}` · `.member` ohne Verlauf, Text `#3B2E1E`, gedämpft `#6E5C44` · `table th{position:static; background:var(--lp-paper) !important; color:var(--lp-text-muted) !important}` · `thead{display:table-header-group}`, `tr{break-inside:avoid}` · `.metrics strong, .bzahl, .kpi .v{color:var(--lp-text) !important}` · `.bdelta.plus{color:var(--lp-ok) !important}` (`#203342`, statt Grün `#3E6B48`), `.bdelta.minus{color:var(--lp-danger) !important}` (`#8E2E36`) · `.tabelle-scroll{overflow:visible}`, `> table{min-width:0}` (nichts abgeschnitten) · Ausblendliste wertgleich: `.noprint, .sidebar, .bereiche-btn, .brandbar, .tabs, #toast, .toast, nav, .mp-feier, #login, .sheet, .filter .btn, .aktionen{display:none !important}` · `.admin-layout{display:block}`, `.admin-content{padding:0}` · `a[href]::after{content:""}` · `@page{size:A4; margin:16mm 14mm}` (wertgleich). Kontraste C.7 Gruppe L: Text 13.16, gedämpft 6.41, Akzent 5.90, ok 13.01, Warnung 6.78, Fehler 8.09, Kontrollrand 4.26, UI-Gold 4.61.

### G.19 Leer-, Lade-, Fehler-, Erfolgs- und Sperrzustände

| Zustand | Muster | Club (Mitglied) | Terminal (Empfang) | Verwaltung (Studioleitung) |
|---|---|---|---|---|
| Leer | `.leer` / `td.leer`: ein Satz, was fehlt; höchstens eine Aktion sm | „Deine Geschichte beginnt mit deinem ersten Eintrag.“ · „Aktuell sind keine Prämien hinterlegt.“ (vorhanden) | „Keine Kundin gefunden. Prüfe die Schreibweise oder lege sie neu an.“ + „Kundin anlegen“ | „Noch keine Buchungen in diesem Zeitraum.“ + „Zeitraum ändern“; Filter ohne Treffer: „Niemand passt zu diesem Filter.“ + „Filter zurücksetzen“ |
| Laden | Buttons `.laedt` (F.8). Bereiche: statische Zeile `.laedt-zeile` (neu, lp-t-ui muted „Wird geladen …“ mit 16-px-Spinner `mp-dreh` wertgleich), erst nach 400ms; **kein Skeleton-Schimmer** (wäre eine neue Animation) | Mitgliedskarte zeigt „—“ statt 0 Perlen, bis die Daten da sind | Such-Button `.laedt`; `#buchenBtn.laedt` | `.laedt-zeile` im `tbody`; KPI-Werte „—“ |
| Fehler | `.hinweis.fehler` am Ort mit Handlung oder `#ladeFehler`; Feldfehler G.2; Toast nur für flüchtige Fehler | „Wir konnten deinen Club gerade nicht laden. Prüfe deine Verbindung und versuch es noch einmal.“ + „Erneut laden“ | Buchung ohne Bestätigung → R01 `.unklar` (nie Fehlerrot); Kamera → Hinweis unter der Scanbox; Anmeldung: Fehler am Feld | „Der Bericht konnte nicht erstellt werden.“ + „Erneut versuchen“; Mail: Pill `.fehler` + „Versand klären“ |
| Erfolg | Toast `.ok` 3800ms oder `.hinweis.ok` am Ort, wenn der Zustand bleibt | „Gespeichert.“ | „Gebucht.“ | „Gespeichert.“ |
| Gesperrt | Control deaktiviert + Grund daneben; Informationszeilen nie über Opazität | „Noch 120 Perlen bis zu dieser Prämie.“ | Prämienzeile gestrichelt + „Noch 300 Perlen“ | Rolle: Eintrag ausgeblendet (fachlich unverändert, B:1536–1554) |

Neue Wortlaute in dieser Tabelle sind **Vorschläge für Stellen, die heute keinen Text haben**. Vorhandene Texte, insbesondere R01, Einwilligung und Club-Sprache, bleiben wörtlich.

### G.20 Mikrotext und Formate

| Regel | richtig | nicht |
|---|---|---|
| Club in du-Form, warm und kurz; Terminal und Verwaltung sachlich, ebenfalls du | „Schön, dass du da bist.“ | „Sie“ |
| Einheit im Club immer „Perlen“ (Singular „1 Perle“); die Terminal-Begriffe bleiben, wie sie sind | „Noch 120 Perlen bis zu deiner nächsten Prämie“ | „Punkte“ in der Mitgliederoberfläche |
| Einlösen passiert am Empfang | „erreicht – am Empfang einlösbar“ | „Jetzt einlösen“ |
| Buttons: Verb + Objekt, ≤ 3 Wörter, Satzschreibung, ohne Punkt (neue Buttons) | „Prämie ausgeben“ | „OK“, „ABSENDEN“ |
| Bestätigung nennt Folge und Menge (neue Dialoge) | „150 Perlen abziehen“ | „Bestätigen“ |
| Meldung = Status-Wort + was passiert ist + was zu tun ist | „Nicht gespeichert: Die Verbindung ist weg. Versuch es gleich noch einmal.“ | „Fehler 500“ |
| Gedankenstrich mit Leerzeichen, deutsche Anführungszeichen, Auslassung mit Leerzeichen | „erreicht – am Empfang“, „Wird gespeichert …“ | „-“, "…", „gespeichert...“ |
| Einwilligung ausdrücklich (unverändert) | „Schweigen gilt nicht als Zustimmung.“ (club:896) | vorangekreuzte Felder |
| Zahlen, Beträge, Prozent, Datum | D.5 | `toFixed`, „-300“, „20.9.2026“ |

**DE/EN/RU (+30–40 %):** Alle Strings stehen außerhalb von CSS `content`; `lang` am Wurzelelement je Sprache (Silbentrennung). Budget je Bauteil: Button ≤ 2 Zeilen bei 320px, Sidebar-Eintrag ≤ 2 Zeilen in 200px, Kopfzeilen umbrechen, `th` darf umbrechen, Zahlen nie. Rechenbeispiel: „Aus der Liste nehmen (bleibt ungeklärt)“ = 39 Zeichen, +40 % = 55 Zeichen; ein sm-Button bei 320px Viewport hat 288 − 2 × 16 = 256px ≈ 36 Zeichen Jost 14px je Zeile → zwei Zeilen, zulässig, und die Reihe bleibt über R1 bündig.

---

## H. Migration & Kompatibilität

### H.1 Ersatzverfahren (dieselben Marker, sechs Dateien)

1. **Quellen im Repository:** `design/laperle-designsystem.css` (Block Fassung 4), `design/tokens.json` (Wertequelle, nach Abnahme verbindlich) und der wiederhergestellte Einbetter `design/einbetten.py` (klein, nur Standardbibliothek, kein Netzwerk). `python3 design/einbetten.py schreiben design/laperle-designsystem.css` ersetzt **alles zwischen `/* MP-DESIGN-START */` und `/* MP-DESIGN-END */`** in `club/index.html`, `terminal/index.html`, `backend/index.html`, `club/recht.html`, `club/recht-2026-09-19-3.html` und `club/recht-2026-09-19-4.html` byte-identisch und prüft danach, dass alle sechs Blöcke dieser Quelle entsprechen (md5).
2. **Reihenfolge im `<style>` bleibt:** Block → Seitenrest. Der Seitenrest steht danach und überschreibt gleich spezifische Regeln. Fassung 4 setzt deshalb nur dort eine höhere Spezifität, wo ein Befund im Seitenrest steckt (`.terminal .terminal-spalten` für H9, `body.terminal #offenListe .zeile`).
3. **Seitenreste bleiben zunächst unberührt** und funktionieren über die `--mp-*`-Aliase. Ihre Umstellung ist ein eigener, kleiner Diff je Bereich (H.6). Fassung 4 dunkel funktioniert ohne diese Diffs; Perle wird erst danach freigeschaltet.
4. Lokale Vorschau (`127.0.0.1:8790`, `supabase.co` gesperrt) → Teststand → Freigabe → Live. Kein Upload und kein Installationspaket ohne ausdrücklichen Auftrag (Beautinda betreut den Server). Danach `PROJECT_STATUS.md` knapp aktualisieren.

### H.2 Token-Abbildung Fassung 3 → Fassung 4 (alle 30 `--mp-*` und die 24 Legacy-Aliase)

| `--mp-*` | Fassung 3 | → Fassung 4 | Midnight Privé | Perle | Anmerkung |
|---|---|---|---|---|---|
| `--mp-bg` | `#21191A` | `var(--lp-bg)` | `#21191A` | `#F6EFE3` | Block nutzt für Felder `--lp-field` (= bg) |
| `--mp-surface` | `#302327` | `var(--lp-surface)` | `#302327` | `#FFFCF7` |  |
| `--mp-text` | `#F6E9DF` | `var(--lp-text)` | `#F6E9DF` | `#3B2E1E` |  |
| `--mp-text-muted` | `#C6ABA8` | `var(--lp-text-muted)` | `#C6ABA8` | `#6E5C44` |  |
| `--mp-line` | `#5A4242` | `var(--lp-line)` | `#5A4242` | `#E4D5BB` | nur noch Trenner; Controls im Block `--lp-border-control` |
| `--mp-accent` | `#DFBE95` | `var(--lp-accent)` | `#DFBE95` | `#7C6029` |  |
| `--mp-button-bg` | `#E0BE98` | `var(--lp-accent-fill)` | `#E0BE98` | `#E2CFA6` | hell Champagner + Goldkante |
| `--mp-button-text` | `#2E211B` | `var(--lp-on-accent)` | `#2E211B` | `#2E211B` |  |
| `--mp-member-text` | `#FAE8DE` | `var(--lp-member-text)` | `#FAE8DE` | `#FAE8DE` | Material; Druck `#3B2E1E` |
| `--mp-member-muted` | `#D8B9B5` | `var(--lp-member-muted)` | `#D8B9B5` | `#D8B9B5` | Material; Druck `#6E5C44` |
| `--mp-member-gradient` | `radial-gradient(ellipse at 90% 50%, #573A42 0%, #38242C 55%, #291C23 100%)` | `var(--lp-member-gradient)` | `radial-gradient(ellipse at 90% 50%, #573A42 0%, #38242C 55%, #291C23 100%)` | `radial-gradient(ellipse at 90% 50%, #573A42 0%, #38242C 55%, #291C23 100%)` | Komposit aus `--lp-member-from/-via/-to` |
| `--mp-reward-gradient` | `linear-gradient(110deg, #3F2B30, #2B2023)` | `var(--lp-reward-gradient)` | `linear-gradient(110deg, #3F2B30, #2B2023)` | `linear-gradient(110deg, #FFFCF7, #EFE5D4)` | Komposit aus `--lp-reward-from/-to` |
| `--mp-art` | `#4C3238` | `var(--lp-art)` | `#4C3238` | `#E2CFA6` |  |
| `--mp-card` | `#3C272C` | `var(--lp-surface-raised)` | `#3C272C` | `#FFFCF7` | Stufe 2 (Toast, `.card-dark`, `.admin-bottom`) |
| `--mp-ok` | `#A9C8AE` | `var(--lp-ok)` | `#D1E2EC` (**geändert**) | `#203342` | **Grün entfernt** (H1) |
| `--mp-warn` | `#E7C58A` | `var(--lp-warn)` | `#E7C58A` | `#8A4B12` |  |
| `--mp-danger` | `#F0A5AD` | `var(--lp-danger)` | `#F0A5AD` | `#8E2E36` |  |
| `--mp-stage` | `#100D10` | `var(--lp-stage)` | `#100D10` | `#100D10` | eingefroren |
| `--mp-stage-gold` | `#D6B783` | `var(--lp-stage-gold)` | `#D6B783` | `#D6B783` | eingefroren |
| `--mp-stage-rose` | `#BC8F9F` | `var(--lp-stage-rose)` | `#BC8F9F` | `#BC8F9F` | eingefroren |
| `--mp-stage-text` | `#F5ECE6` | `var(--lp-stage-text)` | `#F5ECE6` | `#F5ECE6` | eingefroren |
| `--mp-stage-muted` | `#BEADB7` | `var(--lp-stage-muted)` | `#BEADB7` | `#BEADB7` | eingefroren |
| `--mp-heading` | `'Cormorant Garamond',Georgia,serif` | `var(--font-display)` | `'Cormorant Garamond',Georgia,serif` | `'Cormorant Garamond',Georgia,serif` | `type.families.display` |
| `--mp-body` | `Jost,system-ui,-apple-system,sans-serif` | `var(--font-ui)` | `Jost,system-ui,-apple-system,sans-serif` | `Jost,system-ui,-apple-system,sans-serif` | `type.families.ui` |
| `--mp-r-card` | `18px` | `var(--lp-radius-l)` | `18px` | `18px` |  |
| `--mp-r-control` | `12px` | `var(--lp-radius-m)` | `12px` | `12px` |  |
| `--mp-r-pill` | `50px` | `var(--lp-radius-pill)` | `999px` (**geändert**) | `999px` | 50 → 999px, bis 100px Höhe optisch gleich |
| `--mp-ease` | `cubic-bezier(.22,1,.36,1)` | `var(--lp-ease)` | `cubic-bezier(.22,1,.36,1)` | `cubic-bezier(.22,1,.36,1)` |  |
| `--mp-t-hover` | `160ms` | `var(--lp-dur-hover)` | `160ms` | `160ms` |  |
| `--mp-t-layer` | `180ms` | `var(--lp-dur-layer)` | `180ms` | `180ms` |  |

**Entfallen (24 Legacy-Aliase, mp:62–70):** `--gold`, `--gold-deep`, `--gold-dark`, `--gold-soft`, `--bronze`, `--bronze-deep`, `--cream`, `--ivory`, `--pearl`, `--ink`, `--ink-soft`, `--soft`, `--line`, `--err`, `--warn`, `--ok`, `--plum`, `--rose`, `--rose-soft`, `--rose-deep`, `--deep`, `--on-gold`, `--on-gold-soft`, `--ease`. Nachweis: 0 `var()`-Verweise in allen MP-Seiten, Markup, JS und TS. Der einzige Treffer, `wallet-vorschau/index.html:7 var(--ink)`, definiert `--ink` selbst. Vor dem Einbau wird das erneut geprüft: `grep -rnE "var\(--(gold|bronze|cream|ivory|pearl|ink|soft|line|err|warn|ok|plum|rose|deep|on-gold|ease)[-a-z]*\)" club terminal backend`. Findet sich ein Treffer, bleibt der Alias vorübergehend im Kompat-Block. Außerhalb von `:root` bleiben `--x`, `--y` und `--delay` (Bühnenstaub, von JS gesetzt) unverändert.

**Änderungen im Dunkel-Standard, die Seitenreste und JS sehen:** nur `--mp-ok` (`#A9C8AE` → `#D1E2EC`) und `--mp-r-pill` (50px → 999px, bis 100px Höhe optisch identisch). Alle übrigen 28 Werte sind dunkel identisch.

### H.3 Selektor-Abbildung (jede Regel aus `design/midnight-prive-fassung-3.css`)

Status: **=** wertgleich · **T** nur Token-Schreibweise (gleicher Wert) · **Ä** Werte geändert · **S** ins System überführt. Die Tabelle wurde mit einem Arbeitsskript (nicht im Repository) aus `design/midnight-prive-fassung-3.css` erzeugt. Jede Regel liegt in genau einer Gruppe, `@media`-Kontext steht vor dem Pfeil.

| # | F3-Gruppe (mp-Zeilen) | Fassung-3-Selektoren (vollständig, in Quelltextfolge) | St. | Fassung 4 | Änderung / Hinweis |
|---|---|---|---|---|---|
| M01 | 1 Tokens `:root` (mp:22–71) | `:root` | S | B.2–B.4, C.2 | 30 `--mp-*` bleiben als Alias (je Thema und Insel neu berechnet); 24 Legacy-Aliase entfallen (0 Verweise); Rollen `--lp-*` neu; dunkle Werte gleich außer `--mp-ok` #A9C8AE → #D1E2EC und `--mp-r-pill` 50 → 999px (optisch gleich). |
| M02 | 2 Grund: `*`, `html`, `body`, `body::before/::after` (mp:73–81) | `*` · `html` · `body` · `body::before,body::after` | T | E.6, B.2 | `html{background:var(--lp-bg)}`, `color-scheme` aus dem Thema; `body` 16/1.5 Jost, `font-synthesis:style`; `overflow-x:hidden` bleibt bis H.7 Nr. 3 grün. |
| M03 | 2 Touch, `aria-busy` (mp:82–84) | `button,a,input,select,textarea` · `button[aria-busy="true"]` | = | F.8 | unverändert. |
| M04 | 2 tote Überschreibungen (mp:85–89) | `input,select,textarea` · `input::placeholder,textarea::placeholder` · `.btn,.secondary,.linkbtn,.tabs button,.sidebar button` · `.linkbtn` · `.note,.toast` | S | G.1, G.2, G.6 | Selektoren bleiben gültig, Wirkung steckt jetzt in Button-, Feld- und Toast-Regel (L5): Feld 16px, Platzhalter `--lp-text-subtle`, min-height über Kontrollhöhen, `.linkbtn` sm, Toast `--lp-toast-max`. |
| M05 | 2 `#ladeFehler` (mp:90–90) | `#ladeFehler` | T | G.3 | Fehlerkarte: `.card` + Rand 1px `--lp-danger`, `margin:16px 0` (wertgleich). |
| M06 | 2 `(pointer:coarse)` NPS/Sterne (mp:91–91) | `@media (pointer:coarse) → .nps button,.stars button` | S | G.2 | aufgelöst: NPS und Sterne sind immer 44×44 (kein Sonderfall mehr). |
| M07 | 2 Überschriften `h1` `h2` `h3` `p` (mp:92–97) | `h1,h2,h3` · `h1` · `h1 em` · `h2` · `h3` · `p` | Ä | D.2 | Werte gleich (h1 38/1.06, h2 27/1.15, h3 21/1.2); neu `text-wrap:balance`, `font-kerning:normal`; `p,li{text-wrap:pretty}`. |
| M08 | 2 `a`, `hr`, `img`, Formular-Erbe, `[hidden]` (mp:98–104) | `a` · `a:hover` · `hr` · `img` · `button,input,select,textarea` · `button` · `[hidden]` | T | D, G.1 | `a:hover` bleibt `--lp-text`; Buttons setzen ihre Hover-Farbe selbst (behebt a.btn:hover 1.46:1); `hr` → `--lp-line`. |
| M09 | 2 Textklassen, `.num`, `.leer`, `.sr-only`, `.ic` (mp:105–112) | `.eyebrow` · `.tiny,.small,.muted` · `.lead` · `.num` · `.leer,.empty` · `.sr-only` · `.ic` | Ä | D.2, D.4, G.3 | `.eyebrow` .15 → .12em; `.num` + `lining-nums`; `.lead` max. 68ch; `.sr-only` + `clip-path:inset(50%)`; `.ic` wertgleich. |
| M10 | 3 Primärbutton `.btn` `.btn-gold` `.main-action` (mp:114–128) | `.btn,.btn-gold,.main-action` · `.main-action` · `.btn:hover,.btn-gold:hover,.main-action:hover` · `.btn:active,.main-action:active` · `.btn::after,.btn::before` | S | G.1 | eine Basis mit `--_*`-Variablen; 54 → 48px, `.main-action` 60 → 56px, zweizeilig 84 → 58px; Radius 50 → 28px (optisch Pille); Hover/Aktiv `brightness` wertgleich, nur `(hover:hover)`. |
| M11 | 3 Sekundär, `.sm`, Gefahr (mp:129–136) | `.btn.ghost,.btn-line,.secondary,.btn-ghost` · `.btn.ghost:hover,.btn-line:hover,.secondary:hover,.btn-ghost:hover` · `.btn.sm` · `.btn.gefahr,.btn.danger` | S | G.1 | `.secondary`/`.btn.ghost` 47–56 → 48px, Rand `#5A4242` → `--lp-border-control` #917777, 500 statt 400, UA-Fase weg, Radius 12 → 28px; Aktiv-Zustand neu; `.btn.gefahr` Rand 45 % → 100 %. |
| M12 | 3 Deaktiviert, Laden, `@keyframes mp-dreh` (mp:137–144) | `.btn:disabled,.btn[aria-disabled="true"],.main-action:disabled,.secondary:disabled` · `.btn.laedt,.main-action.laedt` · `.btn.laedt::after,.main-action.laedt::after` · `.btn.ghost.laedt::after` · `@keyframes mp-dreh` | S | F.8, G.1 | Opazität .45 → .5; Spinner für jede Variante; `.laedt:disabled{opacity:1}`; Keyframes zeichengleich. |
| M13 | 3 `.linkbtn` `.row-button` `.icon-button` (mp:145–149) | `.linkbtn,.row-button` · `.icon-button` · `.icon-button:hover` | S | G.1 | Link sm 44, Abstand 5 → 8px; Icon-Rand `--lp-border-control`; Hover-Rand `--lp-accent-mark`. |
| M14 | 3 Felder: `label`, `.field`, `input`, `select`, `textarea`, Checkbox, Datum (mp:151–167) | `label` · `.field` · `input,select,textarea` · `textarea` · `input::placeholder,textarea::placeholder` · `input:focus,select:focus,textarea:focus` · `input:disabled,select:disabled` · `select` · `input[type="checkbox"],input[type="radio"]` · `input[type="date"]` | Ä | G.2 | Feld 50 → 48px, Datum 52 → 48px, Innenabstand `12px 14px` → `0 16px`, Rand #917777, Platzhalter #AB918E, Halo entfällt (ein Ring); Checkbox nativ mit Häkchen (H7); `type=date` erbt `color-scheme`. |
| M15 | 3 Suche `.search`, `.searchrow` (mp:168–174) | `.search` · `.search .ic` · `.search input` · `.search input:focus` · `.search:focus-within` · `.searchrow` | Ä | G.2, G.1 R1 | Behälter 48px, Ring am Behälter, `label.search{margin:0}` → kein 6px-Versatz; `.searchrow` gap 12, `margin-bottom` 27 → 24px. |
| M16 | 3 Karten, `.hinweis` (mp:176–184) | `.card` · `.card::after` · `.card h2` · `.card h2::after` · `.card-dark` · `.hinweis` · `.hinweis.fehler,.note.bad,.hinweis.warn` · `.hinweis.fehler::before,.note.bad::before` | Ä | G.3, G.6 | Karte 24px (< 481: 20), Rand `--lp-card-edge`; `.card-dark` Stufe 2; `.hinweis` auf `--lp-accent-soft`, `.warn` Warnfarbe statt Fehlerfarbe, Glyph-Masken statt „⚠ “. |
| M17 | 3 Tabellen, `.tabelle-scroll` (mp:186–194) | `table` · `table th` · `table td` · `table tr:last-child td` · `table th.num,table td.num` · `.tabelle-scroll` · `.tabelle-scroll > table` | Ä | G.4 | Zellen `10px 8px` → `12px 12px`, `th` `8px 12px`; Zeilenlinie `--lp-line-soft` (= Fassung-3-Wert); Scroller fokussierbar mit Ring; Sicherung `.card:has(table){overflow-x:auto}`. |
| M18 | 3 `.pill`, `.rank` (mp:196–201) | `.pill` · `.pill.gut,.pill.ok` · `.pill.warn` · `.pill.fehler` · `.rank` | Ä | G.6 | Pille opak getönt + Glyph; ok ohne Grün; `.rank` .08 → .12em, 500. |
| M19 | 3 Meldungen: Toast/Note, `.unklar` (mp:203–219) | `.toast,#toast,.note` · `.toast:not(.on),.note:not(.on)` · `.toast.on,#toast.on,.note.on` · `.toast.err,#toast.err,.note.bad` · `.toast.err::before,.note.bad::before` · `.toast.ok::before` · `.unklar` · `.unklar::before` · `.unklar .txt` · `.unklar .btn` | Ä | G.6 | Toast volle Mobilbreite (358px@390 statt 195px), linksbündig, Stufe 2 + Schatten, Glyph-Masken; `.unklar` Grund opak, Buttons 40 → 44px, Aktionen unter dem Text. |
| M20 | 4 Markenleiste, Logo, `.user`, Avatar (mp:221–232) | `.brandbar` · `.brandbar .logo` · `.brandbar .logo img` · `.brandbar .logo span` · `.brandbar .user` · `.brandbar` · `.avatar` · `.avatar.large` | Ä | G.8, G.6 | Logo-Fenster 140×54 unverändert; `padding` 24/22 → 20px, Rand `#6C4C483F` → `--lp-line-soft`; `.user` rechtsbündig, Name `overflow-wrap:anywhere` (keine Ellipse). |
| M21 | 4 Sheets, Overlay, Dialog (mp:233–241) | `.sheet,.overlay` · `.sheet.on,.overlay.on` · `.sheet .card,.dialog` · `.sheet .card.breit` · `.sheet h2` · `.dialog .icon-button.close` | S | G.7 | ein Muster: Fläche `--lp-bg` → `--lp-surface`, 30 → 24px, 390 → 400px, Scrim `#1C130BB5`+7px → `--lp-scrim`+6px, Schatten neu; Einblendung `mp-ebene .4s` wertgleich. |
| M22 | 5 Club-Rahmen `.club`, `.greeting`, `section` (mp:243–250) | `.club` · `.club .greeting` · `.club .greeting .eyebrow` · `.club .greeting h1` · `.club section` · `.club section > .eyebrow` · `.club section > h2` | Ä | E.2, E.4 | Gutter 28/19 → 16/20/32 (Inhalt 394px); Rhythmus 8/16/32; Begrüßung `padding:32px 0` (30). |
| M23 | 5 Mitgliedskarte `.member`, `.balance`, `@keyframes lp-shine` (mp:252–269) | `.member` · `.member::before` · `.member::after` · `@media (hover:hover) → .member:hover::after` · `@keyframes lp-shine` · `.member .head` · `.member .head .eyebrow` · `.member .rank` · `.member .rank .ic` · `.balance` · `.balance.lang` · `.balance.sehrlang` · `.balance > .sub` | T | G.10 | Material wertgleich (22/22/16, Innenrahmen 11px, Glanz, Saldo 66/1); neu: Ziffern lining + tabular, `.head` darf umbrechen, Insel mit dunklem Satz; Keyframes zeichengleich. |
| M24 | 5 Kette, Perlen, Kartenfuß (mp:270–288) | `.necklace` · `.necklace .chain` · `.pearl` · `.pearl::before` · `.pearl.deko` · `.pearl.deko::before` · `.pearl:hover::before,.pearl[aria-pressed="true"]::before` · `.pearl.p1` · `.pearl.p2` · `.pearl.p2::before` · `.pearl.p3` · `.pearl.p4` · `.pearl.p4::before` · `.pearl.p5` · `.pearl.p6` · `.pearl.p6::before` · `@media (max-width:400px) → .pearl.p1` · `@media (max-width:400px) → .pearl.p6` · `.member .foot` | = | G.12, G.10 | Material, Größen, Positionen wertgleich; Hub bei `:hover` nur noch `(hover:hover)` (L9), `[aria-pressed]` überall. |
| M25 | 5 Prämie `.featured-reward`, `.reward-copy` (mp:290–306) | `.reward-heading` · `.reward-heading .eyebrow` · `.featured-reward` · `.reward-art` · `.orbit` · `.art-pearl,.dialog-pearl,.bottom-pearl` · `.art-pearl` · `@media (hover:hover) → .featured-reward:hover .art-pearl` · `.reward-copy` · `.reward-copy .ready` · `.reward-copy strong` · `.reward-copy .detail` · `.reward-copy .bottom` | Ä | G.11 | Radius 12.6 → 18px; `.reward-copy` `17px 15px` → 16px; `strong` Zeilenhöhe 1.06 → 1.2; Perlendrehung wertgleich. |
| M26 | 5 `.next`, `.track` (mp:307–314) | `.next` · `.next > .ic` · `.next > div` · `.next strong,.next > div > span` · `.next > div > span` · `.next-number` · `.track` · `.track > span` | Ä | G.12 | Abstände 21/10 → 24/8, gap 12; Spur jetzt sichtbar (`--lp-line` statt Kartenfarbe), 3px wertgleich; Füllung `--lp-accent-mark`. |
| M27 | 5 `.club-footer`, `.legal` (mp:315–319) | `.club-footer` · `.club-footer > span` · `.club-footer > button` · `.legal` · `.legal a` | S | G.1, G.9 | Wallet-Buttons (`.club-footer :where(button)`) = Sekundär md 48px statt grauer 30px (H6); Rechtslinks 34 → 44px. |
| M28 | 5 `.reward-list` (mp:320–325) | `.reward-list .item` · `.reward-list .item strong` · `.reward-list .item .small` · `.reward-list .item .pts` · `.reward-list .item.frei .pts` | Ä | G.11 | `padding` 14 → 16px; Titel 18/1.15. |
| M29 | 5 `.switch`, `.sw` (mp:326–331) | `.switch` · `.sw` · `.sw::after` · `.sw[aria-pressed="true"]` · `.sw[aria-pressed="true"]::after` | Ä | G.2 | Rand #917777, Trefffläche 60×44 über `::before`; Werte/Transition wertgleich. |
| M30 | 5 `.sterne`, `.nps` (mp:332–337) | `.sterne` · `.sterne button` · `.sterne button.an` · `.nps` · `.nps button` · `.nps button.an` | Ä | G.2 | Stern aus #917777 (3.66 statt 1.64); NPS 6er-Raster (6+5 bei 320px), gewählt mit Kante. |
| M31 | 5 Bestenliste `.board` (mp:338–341) | `.board .brow` · `.board .brow.ich` · `.board .pl` · `.board .pn` | Ä | G.11 | gap 10 → 12, `padding` 10 → 12; `.pn` lining. |
| M32 | 5 Advent `.advent`, `.door` (mp:342–348) | `.advent` · `.door` · `.door .hinten` · `.door.auf` · `.door.auf .vorn` · `.door.auf .hinten` · `.door.verpasst,.door:disabled` · `.door .bild` | Ä | G.11, E37 | Ersetzt durch den Relaunch-Kalender (E37): Bogenkasten `#adventBox`, Bogentür mit zwei Flügeln, Rand `--lp-border-control`, Zahl 30px lining; geöffnet nie verblasst, verpasst gestrichelt, heute 2px `--lp-accent-mark` + Hof; `.door .bild` ausgeblendet (Bild in `.hinten`). |
| M33 | 5 Ziel `.ziel`, `.zielaktionen` (mp:349–352) | `.ziel` · `.ziel .satz` · `.ziel .seit` · `.zielaktionen` | Ä | G.3, G.1 | `padding` 20 → 24 (< 481: 20); `.satz` 22 → 21px/1.3; Reihe mit gleichen Höhen, mt 14 → 16. |
| M34 | 5 Empfehlung `.empf`, `.linkfeld` (mp:353–357) | `.empf .zahlen` · `.empf .zahlen span` · `.empf .zahlen small` · `.linkfeld` · `.linkfeld code` | Ä | G.2, G.11 | `code` in Feldoptik 48px (Jost 13px statt Monospace), URL bricht im Feld (keine Ellipse); „Kopieren“ gleiche Höhe. |
| M35 | 5 `.gewinn`, `.hp` (mp:358–360) | `.gewinn` · `.gewinn .bild` · `.hp` | = | G.11 | wertgleich; Titel über Klasse statt Inline (Seitenrest). |
| M36 | 6 Terminal-Rahmen (mp:362–367) | `.terminal .brandbar` · `.workspace` · `.workspace > h1` · `.terminal-grid` · `.terminal-grid > *` | Ä | G.15 | `.workspace` 32 → Gutter; h1 `12px 0 25px` → `8px 0 24px`; Spalten-gap 26 → 24. |
| M37 | 6 Kundinnenkarte `.customer` (mp:368–376) | `.customer` · `.customer-top` · `.customer h2` · `.customer-balance` · `.customer-balance > .u` · `.customer-line` · `.customer-line > strong` · `.terminal-reward` · `.customer .secondary` | Ä | G.15 | `padding` 25 → 24; Saldo 54 → 56px lining, `margin` 22/15 → 24/16; Zeilen `padding` 10 → 12. |
| M38 | 6 Buchung, Betrag, Ziffernblock, Kategorien (mp:377–393) | `.booking` · `.booking > h2` · `.booking .fuer` · `.booking .fuer b` · `.amount-label` · `.amount` · `.amount > span` · `.pad` · `.pad button` · `.pad button:active` · `.categories` · `.categories > button` · `.categories > button[aria-pressed="true"]` · `.booking-separator` · `.booking .main-action` | Ä | G.15 | Betrag 56/1.1 → 56/1 lining; Pad 320 → 360px, Tasten 52 → 56px, 16px Abstand zum Feld, Rand #917777; Kategorien = Chips sm (Radius 30 → 28px). |
| M39 | 6 Prämienliste `.list .item` (mp:394–401) | `.list .item` · `.list .item .t` · `.list .item .u` · `.list .item .p` · `.list .item.erreichbar` · `.list .item.erreichbar .p` · `.list .item.gewinn` · `.list .item.gewinn .p` · `.list .item:disabled` | Ä | G.15 | `.gewinn` grün → Diamant + ✓; gesperrt lesbar (Opazität 1, gestrichelt, muted) statt .55; `padding` `12px 14px` → `12px 16px`. |
| M40 | 6 Verlauf `.log`, `.stand.puls`, `@keyframes zahl` (mp:402–405) | `.log .zeile` · `.log .zeile .b` · `.log .zeile .d` · `.stand.puls` · `@keyframes zahl` | Ä | G.15 | feste Spalten `minmax(0,1fr) 8ch 10ch` (Flucht); Puls und Keyframes zeichengleich (spielt weiterhin nicht, I.7). |
| M41 | 6 Scanbox, Glücksrad (mp:406–411) | `.scanbox` · `.scanbox video` · `.scanbox .frame` · `.wheelwrap` · `.needle` · `#wheel` | T | G.15 | Scanbox = Insel, Rahmen wertgleich (16px); `#wheel` 4.8s wertgleich; Canvas-Farben aus Token (Seitenrest). |
| M42 | 6 Anmeldung `.login` (mp:412–414) | `.login` · `.login .logo img` · `.login .field` | T | G.15 | Inhalt 380px + Gutter (wertgleich 420 − 40). |
| M43 | 6 Kurzbestätigung `.mp-kurz` (mp:415–423) | `.mp-kurz` · `.mp-kurz .p` · `.mp-kurz .txt` · `.mp-kurz b` · `.mp-kurz span` · `.mp-kurz .zu` | T | G.6 | ungenutzt; Werte, `mp-ebene 260ms`, `mp-seal .65s` wertgleich; Grund `--lp-accent-soft`. |
| M44 | 7 Verwaltung: Layout, Sidebar, „Bereiche“ (mp:425–439) | `.admin .brandbar` · `.admin-layout` · `.sidebar` · `.sidebar .gruppe` · `.sidebar .gruppe:first-child` · `.sidebar button` · `.sidebar button:hover` · `.sidebar button[aria-current="page"]` · `.sidebar .ic` · `.sidebar button[aria-current="page"] .ic` · `.sidebar-foot` · `.sidebar-foot > span` · `.bereiche-btn` | Ä | G.9 | Sidebar 176 → 200px, sticky, Einträge Radius 8 → 12, Marke 3px; `100vh − 92px` → `100dvh − 95px`; „Bereiche“ mit Gutter, 48px statt 210/229px. |
| M45 | 7 `.admin-content`, `.admin-title` (mp:440–443) | `.admin-content` · `.admin-title` · `.admin-title h1` · `.admin-title .eyebrow` | Ä | G.16 | `padding` 30 → Gutter 32; h1 33 → 34px (≤ 480 28). |
| M46 | 7 Kennzahlen `.metrics` (mp:444–450) | `.metrics` · `.metrics > div` · `.metrics > div > span` · `.metrics strong` · `.metrics strong em` · `.metrics small` · `.metrics.weitere` | Ä | G.5 | Container-Regel ohne Waisen und ohne Überlauf (statt 3 feste Spalten); Außenabstand 28/35 → 32/32. |
| M47 | 7 `.section-title`, `.customer-row`, `.admin-bottom` (mp:451–459) | `.section-title` · `.section-title > h2` · `.customer-row` · `.customer-row > div` · `.customer-row strong` · `.customer-row > div > span` · `.admin-bottom` · `.admin-bottom h2` · `.bottom-pearl` | Ä | G.16, G.3 | `.section-title` `24px 0 14px` → `24px 0 16px`, Aktionen immer sm; `.customer-row`/`.admin-bottom` ungenutzt, auf Token. |
| M48 | 7 `.filter`, `.formzeile`, `.aktionen` (mp:460–467) | `.filter` · `.filter .aktionen` · `.filter > div` · `.filter > div` · `.filter label` · `.filter input,.filter select` · `.formzeile` · `.aktionen` | S | G.1 R1–R8, G.2 | Filter: Felder und Buttons 44px, 16px Schrift (M12), gap 10 → 12; `.formzeile` `minmax(min(100%,160px),1fr)`; `.aktionen` gap 8 → 12, `align-items:stretch`. |
| M49 | 7 `body.admin …`, `.beob`, `.bdelta` (mp:468–472) | `body.admin .card` · `body.admin h2` · `body.admin table td,body.admin table th` · `.beob` · `.bdelta.plus` · `.bdelta.minus` | Ä | G.16, G.6, G.5 | Karte 20 wertgleich; Zellen `9px 8px` → `8px 12px`, `th` 14 → 12px; `.bdelta.plus` grün → `--lp-ok`, 12px. |
| M50 | 8 Feierbühne: Aufbau (mp:474–506) | `.mp-feier` · `.mp-feier.an` · `.mp-feier .buehne` · `.mp-feier .zu` · `.mp-feier .zu:hover` · `.mp-art` · `.mp-pearl` · `.mp-orbit` · `.mp-halo` · `.mp-arc` · `.mp-check` · `.mp-feier[data-kind="redeem"] .mp-check` · `.mp-dust` · `.mp-dust i` · `.mp-feier .mp-eyebrow` · `.mp-feier h2` · `.mp-feier .mp-detail` · `.mp-reward` · `.mp-mark` · `.mp-reward-note` · `.mp-reward ul` · `.mp-reward::after` · `.mp-feier .btn` · `.mp-feier .btn.ghost` · `.mp-feier .aktionen` | T | G.17 | eingefroren (Farben über Material-Token wertgleich); einzige Änderung: Bühnenbutton lg 56px (gerendert 54). |
| M51 | 8 Feier-Zeitwerte (level/unlock/both/redeem, kompakt) (mp:507–523) | `.mp-feier.mp-play[data-kind="level"] .mp-pearl` · `.mp-feier.mp-play .mp-orbit` · `.mp-feier.mp-play .mp-halo` · `.mp-feier.mp-play .mp-dust i` · `.mp-feier.mp-play .mp-reward::after` · `.mp-feier.mp-play[data-kind="unlock"] .mp-left` · `.mp-feier.mp-play[data-kind="unlock"] .mp-right` · `.mp-feier.mp-play[data-kind="unlock"] .mp-reward` · `.mp-feier.mp-play[data-kind="both"] .mp-pearl` · `.mp-feier.mp-play[data-kind="both"] .mp-reward` · `.mp-feier.mp-play[data-kind="redeem"] .mp-check` · `.mp-feier.mp-play[data-kind="redeem"] .mp-pearl` · `.mp-feier.mp-compact .mp-art` · `.mp-feier.mp-compact.mp-play *` · `.mp-feier.mp-compact.mp-play .mp-reward::after` | = | G.17, F.6 | zeichengleich; Dauer/Kurve nur als Token mit identischem Wert. |
| M52 | 8 Inline-Bühne, `li.titel`, `.mp-reduced` (mp:524–537) | `.mp-feier.mp-inline` · `.mp-feier.mp-inline .buehne` · `.mp-feier.mp-inline .mp-art` · `.mp-feier.mp-inline h2` · `.mp-feier.mp-inline .mp-detail` · `.mp-feier.mp-inline .mp-reward` · `.mp-feier.mp-inline .aktionen` · `.mp-feier.mp-inline .btn` · `.mp-reward li.titel` · `.mp-feier.mp-reduced *,.mp-feier.mp-reduced *::after` · `.mp-feier.mp-reduced .mp-arc,.mp-feier.mp-reduced .mp-dust` | T | G.17 | wertgleich; Inline-Buttons sm 44px (gerendert 46). |
| M53 | 8 `@keyframes` mp-rise … mp-ebene, `.ebene/.reveal` (mp:538–549) | `@keyframes mp-rise` · `@keyframes mp-ring` · `@keyframes mp-glow` · `@keyframes mp-spark` · `@keyframes mp-shine` · `@keyframes mp-open-left` · `@keyframes mp-open-right` · `@keyframes mp-reveal` · `@keyframes mp-seal` · `@keyframes mp-ebene` · `.ebene,.reveal` · `.reveal` | = | F.6 | alle Keyframes zeichengleich. |
| M54 | 9 Druck (mp:551–565) | `@media print → html,body` · `@media print → :root` · `@media print → .card,.metrics > div,.customer` · `@media print → table th` · `@media print → thead` · `@media print → tr` · `@media print → .metrics strong,.bzahl,.kpi .v` · `@media print → .bdelta.plus` · `@media print → .bdelta.minus` · `@media print → .noprint,.sidebar,.bereiche-btn,.brandbar,.tabs,#toast,.toast,nav,.mp-feier,#login,.sheet,.filter .btn,.aktionen` · `@media print → .admin-layout` · `@media print → .admin-content` · `@media print → a[href]::after` | Ä | G.18 | Perle-Satz auf Papierweiß (auch Inseln); Mauve-Palette und Grün `#3E6B48` entfallen; Ausblendliste und `@page` wertgleich. |
| M55 | 10 Fokus, reduzierte Bewegung (mp:567–575) | `a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[tabindex]:focus-visible` · `.pearl:focus-visible` · `@media (prefers-reduced-motion:reduce) → *,*::before,*::after` · `@media (prefers-reduced-motion:reduce) → .mp-feier .mp-arc,.mp-feier .mp-dust` · `@media (prefers-reduced-motion:reduce) → .track > span` | T | F.7, F.10 | Ring 2px/3px (Perle −2px) wertgleich, auf `summary`, `[role]` erweitert; Reduced-Motion-Block zeichengleich + `data-motion`. |
| M56 | 11 `(max-width:1023px)` (mp:577–580) | `@media (max-width:1023px) → .metrics` | S | G.5 | KPI-Spalten über Containerbreite statt Viewport. |
| M57 | 11 `(max-width:768px)` (mp:581–595) | `@media (max-width:768px) → .terminal-grid` · `@media (max-width:768px) → .workspace,.admin-content` · `@media (max-width:768px) → .admin-layout` · `@media (max-width:768px) → .sidebar` · `@media (max-width:768px) → .sidebar.offen` · `@media (max-width:768px) → .sidebar-foot` · `@media (max-width:768px) → .bereiche-btn` · `@media (max-width:768px) → .metrics` · `@media (max-width:768px) → .metrics > div` · `@media (max-width:768px) → .metrics strong` · `@media (max-width:768px) → .metrics small` · `@media (max-width:768px) → .brandbar > .eyebrow` · `@media (max-width:768px) → .terminal .brandbar,.admin .brandbar` | Ä | E.4, G.9, G.15, G.5 | Terminal einspaltig mit gestreckten Karten (H9, im Block); Sidebar aus, „Bereiche“ mit Gutter; Markenleiste 20px. |
| M58 | 11 `(max-width:480px)` (mp:596–609) | `@media (max-width:480px) → .club` · `@media (max-width:480px) → .club .greeting h1` · `@media (max-width:480px) → .member` · `@media (max-width:480px) → .featured-reward` · `@media (max-width:480px) → .reward-copy` · `@media (max-width:480px) → .art-pearl` · `@media (max-width:480px) → .reward-heading h2` · `@media (max-width:480px) → .workspace,.admin-content` · `@media (max-width:480px) → .advent` · `@media (max-width:480px) → .amount` · `@media (max-width:480px) → .customer-balance` · `@media (max-width:480px) → .admin-title h1` | Ä | E.4, D.2 | Gutter 20 (≥ 360) bzw. 16; Karten 20; h1 34; Mitgliedskarte `20px 16px 14px` wertgleich; Betrag 44; Admin-h1 28. |
| M59 | 11 `(max-width:340px)` (mp:610–613) | `@media (max-width:340px) → .pad` · `@media (max-width:340px) → .pad button` · `@media (max-width:340px) → .balance` | Ä | G.15, G.10 | Pad gap 6, Taste 48px/21px (22); Saldo 52 wertgleich. |
| M60 | `.mp-admin-dialog` (+ `::backdrop`, h2, p, label, select, textarea) (mp:615–619) | `.mp-admin-dialog` · `.mp-admin-dialog::backdrop` · `.mp-admin-dialog h2` · `.mp-admin-dialog p` · `.mp-admin-dialog label` · `.mp-admin-dialog select,.mp-admin-dialog textarea` · `.mp-admin-dialog textarea` | S | G.7 | gleiches Muster wie Sheet: 520 → 540px, Scrim `--lp-scrim` + 6px Blur, h2 24px, `.row` rechtsbündig mit 12px Abstand; keine Einblendung (wie bisher). |

Abdeckung (Arbeitsskript der Migrationstabelle): 438 Regeln in 60 Gruppen, jede genau einmal; 203 von 203 Klassen und 4 von 4 IDs der Fassung 3 stehen in der Tabelle; fehlend: keine.

**Neu im Block (additiv, bricht nichts):** `[data-theme]`, `[data-motion]`, `[data-saver]`, `[data-stufe]`, `.lp-glyph`, `.lp-auswahl`, `.btn.lg`, `.aktionen.ende`, `.row`, `.tabs` (jetzt definiert), `.card.akzent`, `.card.einlass`, `.card.fehler`, `.hinweis.ok`, `.toast.warn`, `.feldfehler`, `.feldhinweis`, `.hint`, `label.check`, `td.leer`, `tr.klickbar`, `table.dicht`, `dl.zusammenfassung`, `.laedt-zeile`, `.scanbox.aktiv`, `.sheet .card .icon-button.close`, `body.admin .bestaetigt`, `.terminal .terminal-spalten`, `body.terminal #offenListe .zeile`, `.card:has(table)`, `.grid2 > *`, `@container lp-kpi`, `@media (forced-colors:active)`, `@media (prefers-reduced-data:reduce)`.

Automatische Prüfung vor dem Einbetten (`python3 design/pruefen.py`): Die Klassen und IDs aus Fassung 3 (203 Klassen, 4 IDs) müssen vollständig im neuen Block vorkommen. Die `--mp-*`-Namen, die die Seitenreste nutzen (Markup, Inline, JS: accent, heading, line, text, text-muted, warn, surface, r-control), müssen im Block definiert sein.

### H.4 Sichtbare Änderungen je Seite (Standard dunkel)

| Seite | Was sich sichtbar ändert | Was bleibt |
|---|---|---|
| **club/index.html** | Primärbuttons 54 → 48px, `.main-action` 60 → 56px, zweizeilig 84 → 58px, Radius 28px (Pille); `.secondary` ohne UA-Fase, 500, 16px, 48px; **Wallet-Buttons** dunkle Sekundärpillen 48px statt grauer 30px (H6); **Checkbox „Konto löschen“ zeigt das Häkchen** (H7); Kontrollränder heller (`#917777`) an Feldern, NPS, Sternen, Schaltern und Türen; Platzhalter `#AB918E`; Prämienkarte Radius 18, Innenmaß 16; **Fortschrittsspur sichtbar** (3px); Saldo und Zahlen in Versalziffern; Eyebrow .15 → .12em; Abstände nur 8/16/24/32; Gutter 19 → 20px (< 360: 16); Toast in voller Breite (350px @390 statt 195px); Status ok blaugrau mit ✓; Rechtslinks und `summary` 44px mit MP-Ring; NPS in zwei Reihen 6+5 | Mitgliedskarte (Maße, Verlauf, Kette, Perlen, Glanz), Prämienmotiv, Feier (bis auf 56px-Buttons), alle Bewegungen, Logo, Texte |
| **terminal/index.html** | Buttonreihen bündig (54/47 → 48/48; „Ungeklärt“ 40 → 44); ≤ 768 alle Karten volle Breite, kein Überlauf bei „Korrigieren“ (H9); Ziffernblock 360px, Tasten 56px, 16px Abstand zum Feld, Versalziffern; Sheets auf `--lp-surface` mit Schatten, Scrim `rgba(16,13,16,.78)` + 6px statt `#1C130BB5`, Breite 390 → 400; „AUSGEBEN“-Gewinn blaugrau mit ✓ statt grün; gesperrte Prämien lesbar; Verlaufsspalten fluchten; Markenleiste 95px mit sicherem Bereich; Saldo 54 → 56px | Scanlogik, Buchung ohne Kassenbonnummer, Prämienreihenfolge, R01-Wortlaut, Reihenfolge ≤ 768, Glücksrad-Zeiten, Kurz-Feier-Zeiten |
| **backend/index.html** | Sidebar 176 → 200px, sticky, Einträge Radius 12, aktueller Eintrag mit 3px-Marke; „Bereiche“ mit Gutter und 48px statt 210–229px; Markenleiste mobil rechtsbündig umbrechend; KPI ohne Waisen (Container-Regel); `th` 12px statt 14px versal; Zellen 8/12; Filterreihen durchgehend 44px mit 16px-Feldern; alle Kopfzeilen-Aktionen sm; Pills mit Zeichen, „angenommen“ blaugrau statt grün; `.hinweis.warn` in Warnfarbe; Mail-Dialog 540px mit 12px Button-Abstand rechtsbündig; Funktionsschalter wechseln nicht mehr den Radius; Admin-h1 33 → 34px; `.bdelta` 12px ohne Grün; Tabellen ohne Hülle scrollen in ihrer Karte | Navigation (V18), Rollensteuerung, Inhalte, Druck-Ausblendungen |
| **club/recht.html** (+ -3, -4) | Grundstile wie Club (Links, `b` 500 statt synthetischem 700); Seitenrest nutzt `--mp-r-control` (12px) und `--mp-line` weiter | Inhalte, Layout `.wrap` 720px bis zum Seitenrest-Diff (Messlänge 68ch) |
| **Druck** | Perle-Palette statt Mauve (`#3B2E1E`/`#6E5C44`/`#7C6029`), Plus blaugrau statt grün, Mitgliedskarte lesbar | Ausblendliste, A4-Ränder |
| **Perle (hell)** | nur mit `data-theme="light"`/`auto` und nach H.6 „Voraussetzung Perle“; Mitgliedskarte, Bühne und Scanbox bleiben dunkel | – |

### H.5 Wertgleich zu erhalten (Prüfliste)

- Dunkle Farben `#21191A`, `#302327`, `#3C272C`, `#F6E9DF`, `#C6ABA8`, `#5A4242`, `#DFBE95`, `#E0BE98`, `#2E211B`, `#FAE8DE`, `#D8B9B5`, `#4C3238`, `#E7C58A`, `#F0A5AD`, die Verläufe von Mitgliedskarte und Prämie sowie alle Material- und Bühnenwerte (C.3).
- Alle Animationen, 13 Keyframes, Dauern, Verzögerungen und Kurven (Bestandsaufnahme §9.2, F.6); `celebration-motion.js`, `club-motion.js`, Reduced-Motion-Pfad, Rad 4.8s / 4900ms. Hinzu kommt nur die genehmigte Adventsöffnung (E37): `lp-open-left/right` 1450 ms, `lp-gift-rise` 1750 ms, `lp-door-number` 600 ms, Neuladen nach 1850 ms – wertgleich zu `design/relaunch` (21.09.2026).
- Fokusring 2px / Versatz 3px / Perle −2px; z-index 800/900/1000.
- Logo-PNG (md5 `ff850c3c037763314a38f49929d79a9b`), `original-logo.svg`, Markenleisten-Ausschnitt 140 × 54 / 220px / −40 / −30, Login-Logo `min(240px,70vw)`, Wallet-Kunst, palette.json, Pass-Farben (`#21191A`).
- Mitgliedskarte (22/22/16, ≤ 480 20/16/14, Innenrahmen 11px, Saldo 66/1 mit Abstand 22), Kette 117/100px, Perlenpositionen und -größen, Prämienmotiv (Orbit, Perle), Feierbühne (Maße, Positionen, Radien 16/24px).
- Fachliche Regeln (Bestandsaufnahme §9.2): keine Kassenbonnummer beim Buchen; Prämien aus der Club-Liste (offene Gewinne → einlösbar → Punkte); R01 mit Wortlaut; nur 6-stellige Kartencodes; Korrekturweg; La Perlé Plus nicht buchbar; Mitarbeiterzugang bis Rollenabnahme deaktiviert; Rollensteuerung (12 Einträge „zentrale“); Club-Sprache (du, „Perlen“, „am Empfang“, Gedankenstrich), ausdrückliche Einwilligung, Honeypot + 2-s-Zeitschutz, Altersbestätigung; Terminal-Reihenfolge V13/V15; Admin-Navigation V18.

### H.6 Folgearbeiten außerhalb des Blocks (je Bereich ein eigener, kleiner Diff)

| Bereich | Datei:Stelle | Änderung | Pflicht für |
|---|---|---|---|
| Club | club:654–669 (Seitenrest) | Einwilligung/Rechtsbestätigung auf `.lp-auswahl`-Werte und Token (G.14); Gewicht 600 → 500; Statustexte aus CSS `content` ins Markup; Erfolg als `.hinweis.ok` statt `:disabled`; eigener Fokusring `#f5ddbc` entfällt | **Voraussetzung Perle**, M14, M16 |
| Club | club:642–644 | `.reg .plus .z` → 32px, Rand `--mp-*` → `--lp-border-control`, Cormorant 16 lining (G.13) | Perle (Rand), M17 |
| Club | club:759, 1249, 1423, ~30 Inline-Margins | `#bannerBox` → `.card.akzent`; Gewinn-Titel → Klasse; Inline-Abstände → Rhythmus (E.2) | M28 |
| Club | club:912 | Wallet-Buttons bekommen `#i-wallet` und das Label im `<span>` (das CSS wirkt auch ohne) | H6 (Feinschliff) |
| Club | club:955, 1338, 671–674, `club-motion.js:8`, `celebration-motion.js:18` | `data-motion` und `data-saver` mitprüfen; bei `data-saver` GSAP/ScrollTrigger/club-motion nicht laden; Kopf-Snippet (4 Zeilen, `try/catch`) | F.10, F.11 |
| Club | JS `sagen()` club:957 | Erfolg setzt `.ok`, Rolle `status`/`alert`; 3800ms bleibt | M7 |
| Club | club:900, `input#gebDatum` | Tab-Falle im Datumsfeld beheben | M3 |
| Terminal | T:645–658 (Seitenrest) | nichts nötig (H9 steht im Block); optional `gap`-Werte angleichen | – |
| Terminal | T:926 | `betragAnzeigen()` schreibt nur ins Label-`<span>` von `#buchenBtn` (der Pfeil bleibt) | M13 |
| Terminal | T:1571–1577 | Radfarben per `getComputedStyle` aus `--lp-wheel-*` (C.5), Außenring und 2px-Trennlinien | Übergaberegel 5 |
| Terminal | T:918–919, 1440 | Toast 3800ms, `.ok` bei Erfolg | M7 |
| Terminal | T:854–881, 1407, 1483, 1488, 1501 | Dialog-Helfer (Escape, Tab-Falle, ×, Fokus zurück); `confirm()`/`prompt()` → Dialogmuster mit gleichem Wortlaut | M8 |
| Terminal | T:928, 1315, 1337, 1347, 1465–1469 | Zahl, Datum und Minus nach de-DE (D.5), Trenner „ · “ | M17 |
| Terminal | T:1316 / T:769 | `puls` aufs richtige Element – **erst nach Freigabe I.7** | M10 |
| Terminal | Scanbox T:1279–1297 | `.scanbox.aktiv` während der Kamera läuft; Hinweistext darunter | L12 |
| Verwaltung | B:727, 1108 | h1 = Bereichsname | M20 |
| Verwaltung | ~12 Tabellen, B:1257 ff., 2004–2013, 2041–2050, 869–875 | `<thead>`, gleiche Spaltenzahl, `.tabelle-scroll` um jede Tabelle (+ `tabindex="0" role="region" aria-label`); Inline `nowrap` B:2012 entfernen | H10, M27 |
| Verwaltung | B:1328, 1340 | Zeilenaktion als `<button class="linkbtn">` in der ersten Zelle, `tr.klickbar` | M27 |
| Verwaltung | B:1407–1427, 853 | Heatmap `data-stufe` 0–4, Legende themenneutral | M23 |
| Verwaltung | B:736–738, 938–941, 1857 | Chips und Funktionsschalter mit `aria-pressed` | L13, M2 |
| Verwaltung | B:1242, 1118–1120, 1286–1287 | `toFixed` → `toLocaleString('de-DE')`, U+2212 | M17 |
| Verwaltung | B:1941–1957, 1384, 1687, 1741 | Dialogmuster, `confirm()` ersetzen; Rückmeldung im offenen Dialog als `.hinweis` | M8 |
| Verwaltung | B:1104–1106, 1382 | Toast 3800ms; `#kDetail`-Scroll mit Reduced-Motion-Prüfung | M7, Bestandsaufnahme §7.6 |
| Verwaltung | B:643–644 (Seitenrest) | `.bars div` → `--lp-accent-mark`; Diagramm mit `role="img"` + `aria-label` | Perle (Farbe) |
| Recht | recht:643 | `.nav a` Rand `--mp-line` → `--lp-border-control` (Control-Rand ≥ 3:1); `.wrap p, li` max. 68ch | Perle, L7 |
| Alle | `<html>` | `lang` je Sprache; optional `data-theme` (Standard ohne Attribut = dunkel), `<meta name="theme-color">` je Thema; Einstellung pro Gerät | Perle, i18n |

### H.7 Prüfliste vor Freigabe (lokale Vorschau, kein Upload)

1. `python3 design/einbetten.py pruefen design/laperle-designsystem.css`: md5 der sechs Blöcke identisch und gleich der Quelle; Selektor- und `--mp-*`-Abdeckung 100 % (H.3); Legacy-grep leer.
2. `python3 design/pruefen.py` → Rückgabewert 0: Grammatik, Tokengleichheit, Vollständigkeit, Abdeckung, 0 Grün-Treffer, alle Kontrastpaare bestanden.
3. Breiten 320 / 360 / 390 / 768 / 1024 / 1280 für Club (Standard, fertig, dash-empty/-data/-all, Feier), Terminal (Login, Home, Kundin, Sheet, Korrektur offen), Verwaltung (Login, Übersicht, Kundinnen, Prämien, Mail, Verhalten, Zielgruppe) und club/recht, jeweils dunkel und `data-theme="light"` (nur im Teststand): `scrollWidth − innerWidth = 0`, **auch mit ausgeschaltetem `body{overflow-x:hidden}`**; erst dann fällt die Regel weg.
4. Pseudolokalisierung +40 % (EN/RU, kyrillische Versalien) in Club-Dashboard, Terminal-Kundin und Verwaltung-Übersicht: keine abgeschnittenen Inhalte; alle 22 Reihen aus Bestandsaufnahme §5.1 mit Ober- und Unterkanten-Differenz 0; KPI 4/5/6/7/8 Kacheln bei 900/1024/1280/1440 ohne Waise und ohne Überlauf; NPS bei 320 in 6+5.
5. Tastatur (ein Ring je Control, `summary`, Scroller, Sheets mit Escape), Forced Colors (Schalter, Fortschritt, Perlen, Sidebar, Glyphen), Reduced Motion (System und `data-motion`), `data-saver` (Feier, Spinner und Toast laufen weiter; gewählte Perle bleibt oben; Prämienperle bleibt bei −15°).
6. Feier level/unlock/both/redeem, kompakt, inline, reduziert – Bildvergleich mit Fassung 3. Die einzige erwartete Abweichung sind die Bühnenbuttons 56 statt 54px bzw. 44 statt 46px.
7. Fachliche Regeln unverändert (H.5).
8. `PROJECT_STATUS.md` knapp nachführen: Status, betroffene Dateien, bestandene Prüfung, offene Punkte.

---

## I. Risiken & offene Entscheidungen

| # | Thema | Risiko / Frage | Empfehlung |
|---|---|---|---|
| I.1 | **Perle vor der Seitenrest-Migration** | Einwilligungskarten und Rechtsbestätigung sind hartkodiert dunkel (club:654–669). Rad-Canvas, Heatmap-JS und `.bars` blieben auf Crème dunkel bzw. alt. | `data-theme` erst setzen, wenn H.6 „Voraussetzung Perle“ erledigt ist. Bis dahin gibt es Perle nur im Teststand und im Druck. |
| I.2 | Champagner-Primärfläche im Hellen | Die Fläche `#E2CFA6` hebt sich von der Seite nur mit 1.34:1 ab (Karte 1.50:1). Die Kante `#907036` trägt die Form (4.03 / 4.50). | Annehmen (Marke in beiden Themen gleich). Alternative Tiefgold `#7C6029` mit Crème-Text (5.76) wirkt schwerer und kehrt die Marke um. |
| I.3 | Alle Buttons mit 28px-Radius | Die größte sichtbare Änderung in Terminal und Verwaltung (Sekundär 12px → Pille). | Annehmen: Nur so sind konsistente Radien in gemischten Reihen möglich, ohne die bestätigte Primärpille aufzugeben. |
| I.4 | Rangfarben in der Oberfläche | Diamant `#D1E2EC` = Status ok dunkel; Rangmarken sind heute nicht sichtbar (L10). | Rang bleibt Wort + Sparkle. Eine Plakette `.rank[data-rang]` nur nach Freigabe, dann als Fläche + Tinte (Form ≠ Status-Glyph). |
| I.5 | Abgeleitete Werte | Dunkel `#917777` (Kontrollrand), `#AB918E` (zurückhaltend) und die Tönungen `#483936`/`#473E43`/`#4A3A35`/`#4B353A`; hell `#8A785F`, `#907036`, `#8A4B12`, `#E4D5BB`, `#EADEC9`, `#F3EAD7`, `#EDF2F3`, `#F5E6CB`, `#F9D9D9` und die Heat-Stufen sind Mindest- bzw. Rezeptwerte, keine Quellwerte. | Designabnahme; alle erfüllen das Soll (C.7). Bei jeder Farbänderung `python3 design/pruefen.py` laufen lassen. |
| I.6 | `body{overflow-x:hidden}` | Unbekannte Überläufe würden beim Entfernen sichtbar. | Entfernen erst nach H.7 Nr. 3. |
| I.7 | Saldo-Puls `zahl .6s` | Bestätigt, spielt aber nie (der Selektor trifft nicht). Eine Reparatur macht ihn erstmals sichtbar. | Nicht stillschweigend aktivieren; ausdrückliche Freigabe (Bestandsaufnahme §9.2). |
| I.8 | Feier im Datensparmodus | GSAP wird dann nicht geladen, die bestätigte CSS-Feier läuft. | So umsetzen (die Feier wird nicht abgeschaltet); freigeben lassen. |
| I.9 | Warn ≈ Akzent | ΔE_OK 0.029 dunkel / 0.027–0.064 hell; nur Zeichen und Wort trennen. | Beibehalten (markengerecht). Die Zeichenpflicht im Code-Review prüfen. |
| I.10 | `:has()`, Container-Abfragen, Masken | Safari ≥ 15.4 (`:has`), ≥ 16 (Container), `-webkit-mask`. | Terminal-iPad-Version prüfen. Rückfall: Hauptaktion linksbündig, KPI als Liste, Status mit Wort – kein Bruch. |
| I.11 | Bühnenbutton 56 statt 54px | Die einzige Abweichung im eingefrorenen Feierblock. | Annehmen (Systemstufe, 2px); sonst `.mp-feier .btn{--_h:54px}` pinnen. |
| I.12 | Logo-Ausschnitt | Das Fenster ist bündig (54.33 in 54px), die Leistungszeile im PNG angeschnitten (M26). | Unverändert lassen; nur mit ausdrücklicher Freigabe ändern (kein neues Logo, kein Monogramm). |
| I.13 | Dichte Verwaltung | Sidebar 200px, Zellen 8/12: etwas weniger Inhalt je Bildschirm als heute. | Annehmen (EN/RU-Budget). Bei Einwänden `table.dicht` für einzelne Tabellen. |
| I.14 | Einbetter | Erledigt: `design/einbetten.py` ist wiederhergestellt (`pruefen` und `schreiben` mit md5-Vergleich über alle sechs Seiten). | Keine offene Entscheidung; vor dem Einbau `python3 design/einbetten.py pruefen` ausführen (H.1). |
| I.15 | Themenwahl für Nutzerinnen | Es gibt noch keinen Schalter. | Standard dunkel. Ein Schalter („Darstellung: Dunkel / Hell / wie Gerät“) speichert pro Gerät, Ort unter „Konto und Datenschutz“ im Club – eigene Freigabe. |
| I.16 | Toast-Standzeit 3800ms überall | JS in drei Bereichen, heute 3800/3200/3400ms. | Je Bereich ein kleiner Diff; die Schnittstellen (RPCs, Datenfluss) bleiben unberührt. |
| I.17 | Native Checkbox | Sie sieht je Browser anders aus. | Bewusst: Funktion (sichtbarer Haken, H7) vor Stil; `accent-color` und `color-scheme` halten sie im Markenton. |
| I.18 | Terminal-Begriffe („Punkte“/„Perlen“) | Der Vorschlag einer Entwurfsvariante, im Terminal „Perlen“ zu sagen (E30), berührt Sprache und Fachbereich. | Nicht Teil von Fassung 4; nur mit fachlicher Freigabe. |
