# La Perlé — Lüster

## Auftrag und verbindliche Basis

Gestalterischer Relaunch ausschließlich von `club/index.html` (angemeldeter Bereich) und `terminal/index.html` (Arbeitsbereich). Basis: GitHub `main`, Commit `6ac9a6e`. Branch: `design/relaunch`. Kein Deployment, kein Merge, keine Datenbankoperation.

[ANNAHME] Der Figma-Platzhalter im Auftrag bezeichnet die bereits gemeinsam verwendete Datei https://www.figma.com/design/jTdIOupNC0OLEx9eZdA4Np. Sie wurde vor der Gestaltung gelesen. Sie enthält bereits 13 Seiten, 37 Variablen, 7 Textstile und Komponenten. Bestehende Inhalte werden nicht verändert. Die neuen Seiten heißen wie beauftragt `Design-System`, `Club`, `Terminal`.

**Abweichungen:** Figma enthält Gold `#DFBE95`, Creme `#F6E9DF`, Hintergrund `#21191A`, Karte `#3C272C`, Rosé `#C6ABA8`; nicht die Beispielwerte `#A7884B` / `#FFFDF9` des Briefings. Die Figma-Werte sind maßgeblich. `#FFFDF9` wird nur als ergänzendes Papierweiß eingeführt. Das unveränderte Logo stammt aus Figma-Komponente `14:2`, SVG-Export `design/brand-original.svg`. Das bisher eingebettete PNG bleibt auf Anmeldung und anderen Seiten unverändert.

Die bisherige externe Testvorschau enthält 16 lokale Folgecommits, die noch nicht auf GitHub `main` liegen. Ihre zusätzlichen Module, Demo-Routen und Konfigurationen sind **nicht** Teil dieses Pull Requests. Das bestehende Supabase-Ziel auf `main` bleibt bytegenau erhalten. Es werden ausschließlich lokale, vollständig erfundene Testdaten verwendet.

## Leitidee

Eine Perle wird wie ein kleines Studioobjekt inszeniert: ein gerichtetes Licht, eine tastbare Oberfläche, eine ruhige Fassung. Der Club liest sich als persönliche Sammlung: Stand → Prämie → nächster Besuch → weitere Vorteile. Das Terminal übernimmt die Materialien, aber gewichtet Kundenzuordnung und Eingabe stärker als Inszenierung. Keine austauschbare Kachelwand, keine zusätzlichen Werbetexte.

## Tokens

Alle neuen Tokens stehen zentral in `design/relaunch.css` und gelten ausschließlich innerhalb der freigegebenen Oberfläche. Sechs benannte Grundfarben: `--lp-ink:#21191A`, `--lp-pearl:#F6E9DF`, `--lp-gold:#DFBE95`, `--lp-clay:#C6ABA8`, `--lp-wine:#3C272C`, `--lp-paper:#FFFDF9`. Gold dient als Material und Akzent, niemals als kleiner Text auf Creme. Semantische Tokens: `--lp-bg`, `--lp-surface`, `--lp-fg`, `--lp-muted`, `--lp-rule`, `--lp-action`, `--lp-on-action`. Heller Modus standardmäßig, dunkler Modus über `prefers-color-scheme:dark`; keine neue Einstellungsfunktion.

Schriften: Cormorant Garamond Regular/Italic/Medium für Titel und Zahlen; Jost Regular/Medium für Bedienung und längere Texte. Vorhandene lokale Schriftdateien bleiben erhalten. Die neuen Oberflächen benutzen daraus verlustfrei konvertierte WOFF2-Dateien unter eigenen CSS-Familiennamen, damit Login und Verwaltung nicht beeinflusst werden. Schriftgrößen: 12, 14, 16, 20, 28, 40, 56, 80 px. Abstände: 4, 8, 12, 16, 24, 32, 48, 64 px. Radien: 4, 12, 24, 999 px. Touch-Mindestmaß: 44 px, Hauptaktion 56 px, Terminal-Ziffernblock 56 px.

Bewegung: `--lp-press:120ms`, `--lp-ui:180ms`, `--lp-reveal:640ms`, `--lp-moment:1200ms`; Auslauf `cubic-bezier(.22,1,.36,1)`, Druck `cubic-bezier(.2,.7,.3,1)`. Nur Transform und Deckkraft werden animiert; die ausdrücklich beauftragte WebGL-Materialdarstellung ist davon getrennt.

## Dateien und Schutzgrenzen

| Datei / Stelle | Rolle | Behandlung |
|---|---|---|
| `club/index.html` / `#club`, `#feier`, `#note` | Darstellung und Präsentations-Skripteinbindung | neue gekapselte Styles/Skripte, dekoratives Motiv |
| `terminal/index.html` / `#sHome`, `#sKundin`, vorhandene Sheets/Toast | Darstellung und Präsentations-Skripteinbindung | neue gekapselte Styles/Skripte, Motiv |
| beide HTML-Dateien / `MP-APP-START` bis `MP-APP-END` | gesamte Anwendung, Geschäftslogik und UI-Handler | bytegenau geschützt |
| Club `#reg`, `#fertig`; Terminal `#sLogin` | Anmeldung und Registrierung | DOM und Erscheinungsbild geschützt |
| bisherige eingebettete Styles, SVG-Symbole und Logo-Skript | gemeinsame Basis | bytegenau geschützt |
| `#appleWalletBtn`, `#walletBtn` | vorhandene Wallet-Schaltflächen | DOM und berechnete Darstellung geschützt |
| `backend*`, `wallet*`, `release/*`, `.github/*`, Konfiguration | außerhalb des Auftrags | keine Änderung |
| `design/relaunch.css`, `design/relaunch.js`, `design/pearl-webgl.js`, lokale Schrift-/Logoassets | neue Darstellung | keine API-Aufrufe, keine Sitzungsdaten |

## Choreografie und Interaktion

- Club-Eröffnung: Markenleiste steht sofort. Begrüßung 0 ms / 420 ms / translateY(8px→0); Mitgliederfassung 80 ms / 640 ms / translateY(16px→0); Prämienmotiv beim Eintritt in den Bildschirm 0 ms / 640 ms / translateX(12px→0). Inhalte bleiben ohne JavaScript sichtbar.
- Punktestand: nur nach Änderung des tatsächlich gerenderten Textes, dekorative `aria-hidden` Zählebene 0→echter Stand in 900 ms. Der originale Live-Text bleibt unverändert, die Animation reserviert dessen endgültige Breite. Im Terminal bleibt der Stand sofort sichtbar.
- Fortschritt: ausschließlich die von der Anwendung gesetzte Endbreite; transform scaleX(0→1) in 640 ms. Es wird weder ein Ziel noch ein Rang errechnet.
- Prämienleiter: einzelne Zeilen treten mit translateY(10px→0) in 420 ms auf; Versatz höchstens 180 ms. Fokus beendet die betroffene Darstellung sofort.
- Perle: WebGL-Material mit gerichteter Lichtquelle bei 28 % / 22 %, Blickrichtung aus Pointer und Scrollposition, Rotation maximal 0,16 rad. Rangmaterial aus der **ausgegebenen Rangbezeichnung**, keine eigenständige Einstufung. Rendering wird nach 900 ms ohne Eingabe, außerhalb des Bildschirms und im Hintergrund pausiert. Kein Sensorzugriff.
- Empfehlung: bestehender Teilen-/Kopieren-Ablauf; Druckzustand 0→0,98 scale in 120 ms, vorhandene Bestätigung erhält einen Ring 0,7→1,15 scale und 1→0 opacity in 600 ms. Abbruch des Teilen-Dialogs löst keine Erfolgsfeier aus.
- Advent: 24 architektonische Türen mit Ziffern, Winterzweig und Goldfassung. Erst `.auf` aus erfolgreicher vorhandener Serverantwort öffnet die Flügel rotateY(0→±108deg), 760 ms. Bereits offene Türen werden statisch dargestellt. Keine künstliche Aktivierung außerhalb des vorhandenen Vertrags.
- Rang-/Prämienfeier: vorhandenes `LaPerleCelebration.play/stop`-Präsentationsinterface; bis 1600 ms, alle vorhandenen Schließen-Aktionen sofort verfügbar. Ursprung bleibt ausschließlich das bestehende Ereignis.
- Terminal: Kundenkarte 180 ms, Rückmeldung 600 ms; keine Zähleranimation beim Tippen. Tastatur-/Touch-Eingaben bleiben unmittelbar wirksam. Hoch- und Querformat; Arbeitsansicht auf 390 px ebenfalls umbrechend.
- Glücksrad: Original-Canvas, Ergebniszuordnung und bestehender Ablauf bleiben unverändert. Eine rein dekorative bildschirmfüllende Bühne zeigt eine Kopie derselben Zeichnung mit demselben vom bestehenden Handler gesetzten Endwinkel. 4800 ms Auslauf, passend zum vorhandenen 4900-ms-Ergebnisablauf. Nächste Eingabe beendet die zusätzliche Bühne sofort, ohne das Ereignis abzufangen. Keine neue Bestätigung, keine Änderung der Gewinnchancen. Der Server unterscheidet hier Extrapunkte/Prämie; ein eigenständiger Trostpreisstatus existiert nicht und wird nicht erfunden.

## Ausweichvarianten und Leistung

`window.LaPerleDesign.disable3D()` schaltet das Motiv sofort auf seine statische CSS-Fassung; für eine dauerhafte zentrale Abschaltung `enable3D:false` in `design/relaunch.js` setzen. Kein WebGL, Datensparmodus, höchstens 2 GB gemeldeter Arbeitsspeicher oder höchstens 2 Hardware-Threads → statische Fassung. WebGL erst nach zwei Animationframes nachladen; Pixeldichte höchstens 2. Kontextverlust zerstört keine Inhalte und fällt auf die statische Perle zurück. Native Scrollfunktion bleibt erhalten.

Reduced Motion: kein Zählen, kein Parallax, kein WebGL, keine Auftakt-/Glanz-/Tür-/Bühnenanimation. Sämtliche Inhalte und echten Ergebnisse sind sofort sichtbar. Ändert sich die Einstellung während einer Sequenz, wird sie beendet. Bei Hintergrundwechsel enden dekorative Sequenzen.

## Figma-Abbild und Prüfung

Neue Seiten, Komponenten, Screens und Messwerte werden nach der fertigen Implementierung hier ergänzt. Keine echten Kundendaten, keine realen Zugangstoken oder Codes in Figma oder Testbildern. Die browsergestützte Prüfung verwendet einen separaten, nicht ausgelieferten Fixture-Server; Original-Handler bleiben darin unverändert und erhalten ausschließlich lokale Antworten.

## Texte und Bibliotheken

Keine Produkttexte werden verändert. Neue visuelle Zustände verwenden vorhandene Beschriftungen; keine neuen Produkttexte geplant. Keine neue Laufzeitbibliothek. Vorhandene GSAP-Dateien werden für diese beiden Oberflächen nicht mehr benötigt; sie bleiben für andere Bereiche unverändert im Repository. Eigene WebGL-Implementierung ohne Drittbibliothek. Schriftlizenzen und Messwerte werden in der Abgabe dokumentiert.

## Vorschläge außerhalb des Auftrags

Die Differenz zwischen aktueller Testvorschau und GitHub `main` separat zusammenführen; Login-/Sitzungscode, Supabase-Konfiguration, zusätzliche Club-CTAs und manuelle Theme-Umschaltung nicht in einem Design-PR nachziehen. Die Supabase-Advisor-Prüfung gehört in einen eigenen Sicherheitsauftrag. Fehlender serverseitiger Trostpreisstatus darf nicht durch Gestaltung erfunden werden. Änderungen am 4900-ms-Ablauf des Glücksrads sind Geschäftsablauf und wurden nicht vorgenommen.
