# La Perlé — Lüster

## Erweiterung vom 20. September 2026 — aktueller Umfang

Der Folgeauftrag erweitert ausdrücklich die frühere reine Darstellung um Hell/Dunkel-Auswahl, den vollständigen Prämienkatalog, öffentliche Bewertungslinks, Rangübersicht, optionale Advent-Produktbilder und serverbestätigte Behandlungsziele. Die nachfolgenden historischen Schutzgrenzen gelten für diese ausdrücklich genannten Änderungen nicht mehr. Die übrige Anwendung bleibt geschützt; der Grenztest erlaubt genau einen Club-Render-Hook und die Terminal-Kategorie `laser_intim`.

- `appearance.js` speichert die ausdrückliche Hell/Dunkel-Wahl nur auf dem Gerät. Ohne Wahl gilt die Systemeinstellung.
- Die Kette verbindet sechs 32-px-Buchungsperlen mit fünf 26-px-Zwischenperlen; 44-px-Treffflächen und die vorhandene Buchungsanzeige bleiben erhalten. Die große Perle trägt den Studionamen.
- Neun tatsächlich konfigurierte Prämien, davon im Beispielkonto fünf freigeschaltet; vier deaktiviert mit fehlendem Perlenstand. Die Einlösung erfolgt weiterhin am Empfang.
- Fünf konfigurierte Ränge mit den bestehenden Vorteilen. Rangperlen und verfügbares Prämienguthaben bleiben getrennt.
- Google und Beautinda öffnen die verifizierten Studio-Profile. Ein direkter Google-Bewertungsformular-Link ist nicht hinterlegt; deshalb wird kein direkter Formularaufruf behauptet. Privates Feedback bleibt separat.
- Advent: erfolgreiche Serverantwort startet 1450 ms Türflügel und 1750 ms Gewinn-Reveal. Die Datenaktualisierung erfolgt nach 1850 ms; übrige Eingaben bleiben bedienbar. Reduced Motion zeigt sofort den Endzustand. Produktbilder sind optional; ohne Bild bleibt der Gewinntext. Leere Bild-URL entfernt ein zuvor hinterlegtes Bild.
- Behandlungsziele werden in der Verwaltung mit Kategorie, Anzahl, bestehender Prämie und Gültigkeit angelegt und ausdrücklich freigegeben. Standardmäßig bleiben neue Ziele Entwürfe. Ein Ziel kann pro Kundin einmal abgeschlossen werden; es läuft höchstens ein nicht abgeschlossenes Ziel gleichzeitig.
- [ANNAHME] Passende gebuchte Behandlungen zählen nach Zielstart höchstens einmal je Berliner Kalendertag. Dies verhindert Fortschritt durch doppelte Buchungen. Terminal-Buchungen müssen die konfigurierte Kategorie verwenden, zum Beispiel `Laser · Intim`.
- [ANNAHME] Zielprämien gelten standardmäßig 90 Tage; die Verwaltung kann 1–730 Tage festlegen. Die 10-Prozent-Prämie in der isolierten Vorschau ist ausschließlich ein Beispiel. In der TEST-Datenbank wurden keine aktiven Vorlagen angelegt.
- SQL unter `release/club-missions.sql` und `release/club-images-and-policies.sql` wurde ausschließlich auf TEST angewendet. Produktion bleibt unverändert. Private Tabellen sind gegen direkte Zugriffe gesperrt; öffentliche RPCs prüfen vorhandene Kunden-/Mitarbeitertoken. Der SQL-Test arbeitet mit synthetischen Datensätzen innerhalb eines vollständig zurückgerollten Vorgangs.
- Die öffentliche Testvorschau `/relaunch/club/` enthält ausschließlich Beispieldaten und lokale Demo-Aktionen; sie verwendet keine echten Kundensitzungen. Der GitHub-Entwurf wird aktualisiert, aber nicht zusammengeführt. Figma wurde in diesem Folgeauftrag nicht geändert.

Fortsetzung vom 21. September: Die freigegebene Gestaltung ist auch im bestehenden angemeldeten TEST-Club eingebunden. Behandlungsziele laden unabhängig von persönlichen Wunschtexten; ein Fehler im Wunschtext kann sie nicht mehr ausblenden. Der vollständige Backend–Terminal–Club-Ablauf wurde mit zurückgerollten synthetischen Daten durch die öffentlichen RPCs geprüft.

Prüfergebnisse: `design/evidence/club-features-QA.md`. Die folgenden Abschnitte dokumentieren den ursprünglichen Stand und dessen damalige Prüfungen; diese aktuelle Erweiterung hat bei Widersprüchen Vorrang.

## Atelier-Erweiterung vom 21. September 2026

`club-atelier.css` und `goal-picker.js` ergänzen den aktuellen Stand: Logo auf stilisierter Perle, goldene Kettenglieder mit erklärter Sammelaktion, Prämien als Gutscheine, nummerierte Rangvorteile und Advent in beiden Farbmodi. Club-WebGL ist zugunsten der stilisierten Oberfläche deaktiviert. Das Licht läuft einmal 2200 ms; Fokus/Hover reagiert über 500 ms, Reduced Motion bleibt statisch.

Fünf lokale Präferenzfragen sortieren ausschließlich freigegebene Ziele anhand der vorhandenen Kategorie, Anzahl und konfigurierten Prämienart. Antworten werden nicht gespeichert oder übertragen. Der Server entscheidet unverändert über Fortschritt und Abschlussgeschenk. `release/club-mission-recommendations.sql` ergänzt nur die Prämienart im vorhandenen TEST-RPC.

Die vorhandene zielgruppengesteuerte Aktion erscheint bei „Ein Moment für dich“. Im Backend führen direkte Schaltflächen zu Aktionen, Rangvorteilen, Adventbildern und Behandlungszielen. Es wurden weder echte Kampagnen verschickt noch Angebote aktiviert. Aktions-Push über Wallet ist weiterhin nicht als Versandkanal angebunden; vorhandene Kartenaktualisierungen sind davon getrennt.

## Historische Ausgangsbasis des ersten Designauftrags

Gestalterischer Relaunch ausschließlich von `club/index.html` (angemeldeter Bereich) und `terminal/index.html` (Arbeitsbereich). Basis: GitHub `main`, Commit `6ac9a6e`. Branch: `design/relaunch`. Kein Deployment, kein Merge, keine Datenbankoperation.

[ANNAHME] Der Figma-Platzhalter im Auftrag bezeichnet die bereits gemeinsam verwendete Datei https://www.figma.com/design/jTdIOupNC0OLEx9eZdA4Np. Sie wurde vor der Gestaltung gelesen. Sie enthält bereits 13 Seiten, 37 Variablen, 7 Textstile und Komponenten. Bestehende Inhalte werden nicht verändert. Die neuen Seiten heißen wie beauftragt `Design-System`, `Club`, `Terminal`.

**Abweichungen:** Figma enthält Gold `#DFBE95`, Creme `#F6E9DF`, Hintergrund `#21191A`, Karte `#3C272C`, Rosé `#C6ABA8`; nicht die Beispielwerte `#A7884B` / `#FFFDF9` des Briefings. Die Figma-Werte sind maßgeblich. `#FFFDF9` wird nur als ergänzendes Papierweiß eingeführt. Das unveränderte Logo stammt aus Figma-Komponente `14:2`, SVG-Export `design/brand-original.svg`. Das bisher eingebettete PNG bleibt auf Anmeldung und anderen Seiten unverändert.

Die bisherige externe Testvorschau enthält 16 lokale Folgecommits, die noch nicht auf GitHub `main` liegen. Ihre zusätzlichen Module, Demo-Routen und Konfigurationen sind **nicht** Teil dieses Pull Requests. Das bestehende Supabase-Ziel auf `main` bleibt bytegenau erhalten. Es werden ausschließlich lokale, vollständig erfundene Testdaten verwendet.

## Leitidee

Eine Perle wird wie ein kleines Studioobjekt inszeniert: ein gerichtetes Licht, eine tastbare Oberfläche, eine ruhige Fassung. Der Club liest sich als persönliche Sammlung: Stand → Prämie → nächster Besuch → weitere Vorteile. Das Terminal übernimmt die Materialien, aber gewichtet Kundenzuordnung und Eingabe stärker als Inszenierung. Keine austauschbare Kachelwand, keine zusätzlichen Werbetexte.

## Tokens

Alle neuen Tokens stehen zentral in `design/relaunch.css` und gelten ausschließlich innerhalb der freigegebenen Oberfläche. Sechs benannte Grundfarben: `--lp-ink:#21191A`, `--lp-pearl:#F6E9DF`, `--lp-gold:#DFBE95`, `--lp-clay:#C6ABA8`, `--lp-wine:#3C272C`, `--lp-paper:#FFFDF9`. Gold dient als Material und Akzent, niemals als kleiner Text auf Creme. Semantische Tokens: `--lp-bg`, `--lp-surface`, `--lp-fg`, `--lp-muted`, `--lp-rule`, `--lp-action`, `--lp-on-action`. Heller Modus standardmäßig, dunkler Modus über `prefers-color-scheme:dark`; keine neue Einstellungsfunktion.

Schriften: Cormorant Garamond Regular/Italic/Medium für Titel und Zahlen; Jost Regular/Medium für Bedienung und längere Texte. Vorhandene lokale Schriftdateien bleiben erhalten. Die neuen Oberflächen benutzen daraus verlustfrei konvertierte WOFF2-Dateien unter eigenen CSS-Familiennamen, damit Login und Verwaltung nicht beeinflusst werden. Schriftgrößen: 12, 14, 16, 20, 28, 40, 56, 80 px. Abstände: 4, 8, 12, 16, 24, 32, 48, 64 px. Radien: 4, 12, 24, 999 px. Touch-Mindestmaß: 44 px, Hauptaktion 56 px, Terminal-Ziffernblock 56 px (ab 700 px Bildschirmbreite: 48 px). Geschützte Wallet-Schaltflächen sind die unten dokumentierte Ausnahme.

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
- Punktestand: sofort der tatsächlich gerenderte Stand, ohne zusätzlich positionierte Zählebene. So bleibt die Zahl bei Schriftwechsel, Zoom und Scrollen an ihrem Platz.
- Club-Layout: Begrüßung und Mitgliedskarte bleiben im normalen Dokumentfluss; kein Sticky-Element über späteren Modulen.
- Perlenkette: sechs feste 44 × 44 px Bedienflächen, 34 px Perlen, zehn rein dekorative 12 px Zwischenperlen statt einer gezeichneten Schnur. Klick/Touch, Maus und Tastaturfokus verwenden dieselbe vorhandene Buchungsanzeige unterhalb der Kette. Originale Datums-, Anlass- und Perlenwerte bleiben erhalten; keine erfundenen Behandlungsnamen.
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

Die drei neuen Seiten sind angelegt: [Design-System](https://www.figma.com/design/jTdIOupNC0OLEx9eZdA4Np?node-id=38-18), [Club](https://www.figma.com/design/jTdIOupNC0OLEx9eZdA4Np?node-id=38-19), [Terminal](https://www.figma.com/design/jTdIOupNC0OLEx9eZdA4Np?node-id=38-20). Die bisherigen 13 Seiten bleiben erhalten. 45 Variablen in 3 neuen Collections, 8 Textstile, 10 Komponentenfamilien. Club 390 px und Terminal 1024 px jeweils in Hell, Dunkel, Leer, Laden und Fehler. Der ID-/Token-Nachweis steht in `design/evidence/figma-map.json`. Keine echten Kundendaten, keine realen Zugangstoken oder Codes in Figma oder Testbildern. Die browsergestützte Prüfung verwendet einen separaten, nicht ausgelieferten Fixture-Server; Original-Handler bleiben darin unverändert und erhalten ausschließlich lokale Antworten.

## Texte und Bibliotheken

Keine Produkttexte werden verändert. Neue visuelle Zustände verwenden vorhandene Beschriftungen; **0 neue oder geänderte Produkttexte**. Die gesamte sichtbare Bestandskopie wurde zusätzlich mit einem DOM-Vergleich geprüft. Keine neue Laufzeitbibliothek. Vorhandene GSAP-Dateien werden für diese beiden Oberflächen nicht mehr benötigt; sie bleiben für andere Bereiche unverändert im Repository. Eigene WebGL-Implementierung ohne Drittbibliothek. Jost Version 3.710 und Cormorant Garamond Version 4.001: jeweils SIL Open Font License 1.1, lokale Lizenztexte unter `design/fonts/`. WOFF2-Konvertierung mit fontTools/Brotli ausschließlich als Entwicklungswerkzeug; kein neuer Build-Schritt. Die 5 WOFF2-Dateien umfassen 229.904 Bytes. Zusätzliches JavaScript: `relaunch.js` und `pearl-webgl.js`, zusammen rund 15,7 KB unkomprimiert, Shader nur bedingt nachgeladen.

## Vorschläge außerhalb des Auftrags

Die Differenz zwischen aktueller Testvorschau und GitHub `main` separat zusammenführen; Login-/Sitzungscode, Supabase-Konfiguration, zusätzliche Club-CTAs und manuelle Theme-Umschaltung nicht in einem Design-PR nachziehen. Die Supabase-Advisor-Prüfung gehört in einen eigenen Sicherheitsauftrag. Fehlender serverseitiger Trostpreisstatus darf nicht durch Gestaltung erfunden werden. Änderungen am 4900-ms-Ablauf des Glücksrads sind Geschäftsablauf und wurden nicht vorgenommen.


### Figma-Abweichungen und Token-Abgleich

Der automatische Webseiten-Capture blieb nach 10 Abfragen ohne Ergebnis; sein externes Capture-Skript war aus dieser Umgebung nicht erreichbar. Die Screens wurden deshalb aus der geprüften Oberfläche mit editierbaren Texten, Auto-Layout, Komponenteninstanzen und gebundenen Farben rekonstruiert. **Kein pixelgenauer automatischer Import.** Browserbilder unter `design/evidence/` und der Code sind verbindlich.

- 3D ist eine native statische Gradientenkugel; Lichtreaktion und Materialwechsel laufen nur im Code. Das Glücksrad ist in Figma ein statischer Kreis aus 8 editierbaren Sektoren; die Canvas-Beschriftungen und Drehphysik verbleiben im Code.
- Responsive Zeilenumbrüche, optische Zahlenformen, Kalendergravur und native Formular-/Wallet-Darstellung sind angenähert. Die Club-Fehlermeldung steht im Figma-Screen unter der Markenleiste zur Sichtprüfung; im Browser ist sie ein Overlay. Laden ist als Zustand einer bestehenden Aktion dargestellt, kein neuer Erstlade-Ablauf.
- CSS-Familien `LP Sans` / `LP Editorial` entsprechen Jost / Cormorant Garamond in Figma. Alle 45 Token-Namen und Werte sind abgeglichen; FLOAT-Werte repräsentieren px beziehungsweise ms. Zwei abgeleitete Linienfarben `--lp-rule-light` / `--lp-rule-dark` ergänzen die sechs Grundfarben und haben Alpha 0,24 / 0,32. Die Schatten- und Easingwerte sind STRING-Tokens, keine ausführbaren Figma-Effekte.
- Die Figma-Anmerkungen nennen Auslöser, Dauer, Easing und Reduced-Motion-Endzustand. Alle Daten und Codes in Screens sind erfunden.

### Verifikation und offene Abnahme

Details: [`design/evidence/QA.md`](design/evidence/QA.md). Die vorhandenen 3 Client-Testdateien und 3 Schutzgrenzen-Tests bestehen (6/6). Isolierte DOM-/Handler-Prüfungen bestätigen alle IDs, ursprünglichen Attribute/Klassen, Formfelder und Produkttexte sowie Advent und Terminal-Buchung bei Erfolg, Fehler und ausstehender Antwort. Zusätzliche Browserprüfung: Prämieneinlösung und identischer Endwinkel von Original-Glücksrad und dekorativer Kopie. Keine Tests gegen echte Kundendaten, keine Datenbank-Schreiboperationen.

Bei 360/390 px Club und 390/768/1024 px Terminal sowie 1024 px Club wurde kein horizontaler Seitenüberlauf festgestellt. Hell und Dunkel sind visuell geprüft. Semantische Textkontraste liegen zwischen 6,45:1 und 16,96:1. Sichtbare Terminal-Bedienelemente erreichen 44×44 px; das Kontoschließungs-Checkboxlabel im Club misst 350×72,4 px. **Die geschützten Wallet-Buttons bleiben wie vorher 30 px hoch und haben ihren bisherigen unzureichenden Kontrast.** Sie wurden wegen der ausdrücklichen Schutzvorgabe nicht umgestaltet; keine pauschale AA-Konformität behauptet.

Lighthouse mobil vorher/nachher: **nicht verfügbar**, weil kein lokales Chrome-/Chromium-Binary vorhanden ist (`CHROME_PATH`-Fehler). Die verwaltete Browserumgebung liefert zudem keinen WebGL-Kontext. Statische Ausweichvariante, Skriptladung, Reduced Motion und Abschaltpfad sind geprüft; GPU-Bild, echte Geräte-FPS, LCP, CLS und INP sind **noch nicht gemessen**. Der Pull Request bleibt deshalb ein Entwurf. Keine erfundenen Scores oder Leistungszusagen.

Weitere Abnahme am Testgerät: QR-/Kamerascanner, echte Betriebssystem-Teilenansicht, Tastaturvergrößerung/Zoom und bestehende Authentifizierung mit einem freigegebenen Testkonto. Die unveränderten Handler und DOM-Verträge ersetzen diese Geräte-/Integrationstests nicht.

Die geschützten Wallet-Schaltflächen sollten separat durch die freigegebenen Hersteller-Badges mit zugänglicher Trefffläche ersetzt werden. Das ist ausdrücklich kein Bestandteil dieses PR.
