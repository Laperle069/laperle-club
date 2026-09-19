# Freigegebene E-Mails – eingebaut

Stand: 18.09.2026. Die elf freigegebenen Texte sind als Vorlagen im Code hinterlegt. Die zehn bestehenden automatischen Kundenmail-Varianten sind mit den jeweiligen Abläufen verbunden. Die zusätzliche Registrierungseinladung ist als Vorlage vorhanden; sie startet keinen neuen Empfängerimport oder Massenversand.

## Eingebaut

- Persönliche Betreffzeilen, Vorschautexte, dezente Emojis und ein Hauptbutton je Anlass.
- Buchung direkt zur bereits in der App verwendeten Beautinda-Adresse; Bewertung direkt zur konfigurierten Google-Bewertungsadresse. Persönliche Kontotoken gelangen nicht in diese externen Hauptlinks.
- Club-Links führen nach asynchronem Laden zu Prämien, Geschenken oder E-Mail-Einstellungen; ein Feierdialog verdeckt diese Ziele nicht.
- Identische Texte in HTML und Klartext, einschließlich tatsächlich anklickbarer URLs. HTML mit dem bestehenden Logo und der Midnight-Privé-Palette.
- Sichere Ausgabe von Namen/Prämien; fehlende erforderliche Angaben werden nicht stillschweigend als leere Werte versendet.
- Geburtstagsauslöser auf das tatsächliche Datenmodell korrigiert (`ausloeser`, nicht `art`); Geschenktyp und individuelles Ablaufdatum aus der Einlösung. Kundensperre verhindert parallele doppelte Geschenkvergabe für dieselbe Aktion.
- Prämienhinweise wählen deterministisch die nächste passende Prämie; bestehende Quartalsbegrenzung bleibt.
- Registrierung, wiederholter Zugang, Support und Linkrotation nutzen neue Vorlagen bei unveränderten Token-/Rate-Limit-Regeln.
- Nie versuchte wartende automatische Nachrichten werden aktualisiert. Nicht mehr aktuelle Prämien-/Geschenk-/Verfallshinweise werden storniert. Bereits versuchte/unklare/angenommene Nachrichten werden nicht verändert.
- Der bestehende Testmail-Button verwendet jetzt die neue Willkommensvorlage mit fiktivem Namen „Test“ und deutlich markiertem Betreff.

## Datenbank und Bereitstellung

Migration: `../supabase/migrations/20260918010240_mail_vorlagen_freigegeben.sql`.

Voraussetzung ist der vollständige Stand 04: historische Migrationen 001–031 und die vier danach gelieferten Migrationen. Dieses Repository enthielt bisher nur die Weboberflächen. Die neue Migration ist **kein vollständiger Erstaufbau** einer leeren Datenbank und kein Upgrade für den ungeprüften alten Produktivstand.

Die Migration wurde in der bestehenden getrennten Testdatenbank angewendet. `mail_aktiv=false` ist anschließend bestätigt. Am Studio-Produktivprojekt wurden keine Änderungen vorgenommen; keine Mails wurden an echte Empfänger gesendet. Der Branch ist weiterhin ein Entwurf, nicht veröffentlicht.

`vorlagen.json` dokumentiert die freigegebenen Textbausteine; die SQL-Funktion `_mail_vorlage` enthält denselben Katalog. Änderungen daran müssen gemeinsam erfolgen. `FREIGEGEBENE_TEXTE.md` bewahrt die freigegebene redaktionelle Fassung; ihr historischer Hinweis „noch nicht eingebaut“ ist durch diesen Einbaustand überholt.

## Noch vor echtem Versand

Die Testdatenbank verwendet weiterhin eine Platzhalter-Clubadresse und noch keinen Google-Bewertungslink. Diese bestehenden Einstellungen müssen vor einem realen Versandtest gesetzt sein. `buchung_url` ist mit der vorhandenen Beautinda-Adresse vorbelegt. `mail_recht_url` ist optional; ohne Wert wird `recht.html` neben der Clubseite verwendet. Die beiden neuen Schlüssel sind über die bestehende berechtigte RPC `admin_mail_speichern` einstellbar; die Verwaltungsoberfläche wurde dafür nicht erweitert.

Abmeldelinks führen Mitglieder zu den vorhandenen Einwilligungsschaltern; der Klick selbst widerruft noch keine Einwilligung. Die neue Einladung benötigt beim späteren Kampagnenversand einen echten Abmeldelink, der kein Clubkonto voraussetzt. Die App beginnt diesen Versand nicht selbständig.

## Prüfung

- 41 gezielte lokale Vorlagen-/Versandprüfungen bestanden, darunter Personalisierung, leere Namen, Escaping, fehlende Daten/Links, Geburtstagsdatum, Einwilligung, Wiederherstellung und HTML/Klartext.
- Bestehende SQL-Vertrags-/Rechteprüfungen und 25 Prüfungen zur Betriebsstabilisierung bestanden; unklare Versandantworten werden weiterhin nicht automatisch wiederholt.
- Alle elf HTML-Vorlagen in Chromium bei 390 px ohne horizontalen Überlauf geprüft; Willkommenslayout visuell kontrolliert. Dies ersetzt keinen Test in Apple Mail/Gmail/Outlook. Emoji-Glyphen hängen vom Mailclient und dessen Systemschriften ab.
- Alle elf Vorlagen zusätzlich in der tatsächlichen Testdatenbank erzeugt; interne Helfer und feste Suchpfade geprüft.
- Die vier ergänzten Browserprüfungen kontrollieren die drei Linkziele nach asynchronem Laden und JavaScript-Fehler.

Lokale Reproduktion im vollständigen Stand-04-Projekt mit dieser Ergänzung:

```sh
node tests/pglite/mail-vorlagen.cjs
node tests/pglite/stabilisierung.cjs
node tests/pglite/sql-suites.cjs
PGLITE=1 node tests/browser/mail-links.test.js
```

Die hier ergänzten Tests benötigen die bereits im vollständigen Projekt vorhandene PGlite-/Browser-Testumgebung. Kein Test nutzt echte Empfänger oder Anbieterzugangsdaten.

Der Supabase-Advisor zeigt weiterhin Hinweise zu den bestehenden öffentlichen, intern tokengeprüften RPCs und zur bestehenden pg_net-Installation. Die neuen internen Mailhelfer sind für `anon` gesperrt; die öffentliche RPC-Liste ist unverändert. Einordnung: [SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [pg_net-Schemahinweis](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public).
