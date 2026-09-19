# Umsetzungsstand 2026-09-19.2

Die folgenden Änderungen sind als Code vorbereitet und wurden auf einer isolierten Wiederherstellung der Produktionsdatenbank getestet. Anmeldung, Einwilligungen und Löschung sind noch nicht produktiv eingespielt oder veröffentlicht. Unabhängig davon sind die beiden rückwärtskompatiblen Fehlerkorrekturen aus `privacy-immediate-fixes.sql` bereits produktiv: sichere Mail-Bereinigung und Advent-Tagesende. Die Definitionen wurden nach Installation geprüft; alle zehn bestehenden Kunden sind erhalten.

- Anmeldung mit dokumentierter Rechtsversion und Alters-Selbsterklärung; Bestätigung beim ersten authentifizierten Aufruf. Bestehende Kunden können die neue Fassung ausdrücklich annehmen. Schweigen ersetzt die Zustimmung nicht.
- Einwilligungen: eindeutige Texte und serverseitige Prüfung; Widerruf von Werbung ohne Verlust des Punktekontos. Alte, unpräzise Einwilligungen werden bei Installation beendet und müssen aktiv neu erteilt werden. Der Verlauf bleibt als Nachweis erhalten.
- Kontoschließung im Profil: Zugang sofort ungültig, offene Werbung storniert; geschützter Löschauftrag.
- Tägliche Bereinigung inaktiver Konten nach der konfigurierten Frist; keine aktuell fälligen Produktionskonten bei der Vorprüfung.
- Getrenntes, für öffentliche API-Rollen unzugängliches Archiv: ausgegebene Belege befristet bis zum Ende der achtjährigen Frist; Einwilligungs- und Vertragsnachweise drei Jahre. Dokumentierte Aufbewahrungssperren verhindern die vorzeitige Archivlöschung.
- Dienstleister-Löschaufträge werden gesondert erfasst. Sie sind nicht mit einer automatisch erfolgten Löschung bei Brevo/Google gleichzusetzen. Diese Aufträge müssen betrieblich bearbeitet und mit Erledigungsnachweis abgeschlossen werden.
- Ungeklärte Mailzustellungen behalten ihre Request-ID und werden nicht durch die tägliche Bereinigung für eine Wiederholung freigegeben.
- Advent-Sachpreise gelten bis Ende des ausgewiesenen Tages in Europe/Berlin. Rangregeln sind in der Textfassung ausdrücklich erklärt.

## Testergebnis

Bestanden: SQL-Kompilierung auf wiederhergestelltem Schema; fehlende Annahme abgelehnt; gültige E-Mail akzeptiert; Nachweis gespeichert; alter Einwilligungswortlaut abgelehnt; Widerruf wirksam; Zugang nach Schließung ungültig; Testkonten gelöscht; bestehende Kunden erhalten; Archiv und Löschjob für anon gesperrt; normale Buchungsänderung abgelehnt; ausgegebener Beleg ohne Zugangstoken archiviert; abgelaufene Archive gelöscht. JavaScript-Syntax geprüft.

Die Browserprüfung der lokalen Vorschau wurde durch die Browserumgebung blockiert (ERR_BLOCKED_BY_CLIENT); ein erfolgreicher visueller Test wird daher nicht behauptet.

## Vor Live-Schaltung

1. Brevo: Kontoprüfung abgeschlossen (siehe unten). Verbleibende Tracking-Technologien vollständig deaktivieren oder ihre Zulässigkeit einschließlich einer gegebenenfalls erforderlichen gesonderten Einwilligung klären; anonymisierte Zählung ist nicht gleichbedeutend mit abgeschaltetem Tracking.
2. Konkrete Anbietervereinbarungen und Transfergrundlagen in der gekennzeichneten Stelle der Rechtsfassung ergänzen; Anbieterinformationen sind im ursprünglichen Prüfbericht verlinkt.
3. Löschaufträge bei Dienstleistern, manuelle Sicherungskopien und Nachweise bei minderjährigen Teilnehmern organisatorisch zuordnen. Die Altersangabe im Formular ist eine Selbsterklärung, keine Identitäts- oder Vertretungsprüfung.
4. Beide SQL-Dateien zusammen installieren, neue Oberfläche und fertige Rechtsfassung gemeinsam veröffentlichen und im Browser prüfen. Die alten Registrierungsaufrufe mit sechs Parametern werden gesperrt; daher keine isolierte Installation ohne Frontend-Veröffentlichung.

## Dateien

`release/privacy-hardening.sql`, `release/privacy-erasure.sql`, `customer-release/club/index.html`, `release/legal-review/recht-prueffassung.html`.

Der ursprüngliche PRUEFBERICHT.md dokumentiert den Befund vor diesen Änderungen. Diese Datei beschreibt den neueren Stand.

## Brevo-Kontoprüfung am 19. September 2026

- Authentifizierter Zugriff auf das Konto „La Perlé Beauty Boutique“ bestätigt.
- Im Bereich „Rechtsdokumente“ bestätigt Brevo, dass bei Registrierung in Vertretung des Unternehmens den Nutzungsbedingungen einschließlich Auftragsverarbeitungsvertrag zugestimmt wurde. Kein gesondertes unterschriebenes PDF oder Annahmedatum wurde festgestellt.
- Nach dem Länderanhang der verlinkten Nutzungsbedingungen ist für Deutschland die Brevo GmbH, Köpenicker Straße 126, 10179 Berlin, zuständig.
- „Anonymes E-Mail-Tracking“ von „Nein“ auf „Ja“ umgestellt, gespeichert und nach erneutem Öffnen bestätigt. Dies ist bereits produktiv wirksam. Öffnungen und Klicks werden laut Einstellungsbeschreibung weiterhin gezählt, aber nicht mehr bestimmten Kontakten zugeordnet. Keine Behauptung einer vollständigen Tracking-Abschaltung oder rückwirkenden Löschung alter Messdaten.
- Bestehende Aufbewahrungseinstellung für alle Absender: Transaktionsprotokolle einen Monat; „Vorschau nie aufbewahren“. Nicht verändert.
- Der AVV beschreibt Tracking-Pixel/URLs und weist die Verantwortung für Information und gegebenenfalls Einwilligung dem Kunden zu. Auch die anonyme Einstellung erledigt diese Prüfung nicht automatisch.
- Quelle: authentifizierter Kontobereich https://app.brevo.com/profile/data-processing-agreement sowie https://www.brevo.com/de/legal/termsofuse/ (Länderanhang, AVV Abschnitt 9 und Anlage 1).

## Veröffentlichung

Die automatische Freigabeprüfung hat die Aktualisierung des GitHub-Hauptzweigs abgelehnt, weil sie eine Veröffentlichung auslösen könnte. Die anschließende ausdrückliche Freigabe zur Veröffentlichung steht weiterhin aus. Die Rückmeldung „bin drinne“ bezog sich auf den Brevo-Zugang. Die neue Oberfläche, vollständige Datenschutzmigration und Rechtsfassung sind weiterhin nicht veröffentlicht.

## Veröffentlichung der Rechtstexte nach ausdrücklicher Freigabe

Der Nutzer hat anschließend ausdrücklich „veröffentliche es“ angewiesen. Am 19. September 2026 wurde ausschließlich `club/recht.html` auf GitHub main aktualisiert (Commit `c53ed70a4fdc62903e24040b41e3033b31e08737`). Die frühere Veröffentlichungssperre ist für diese Aktion durch ausdrückliche Freigabe aufgelöst.

Die veröffentlichte Fassung ist an die vorhandenen Funktionen angepasst: Kontoschließung per E-Mail, kein behaupteter täglicher Löschlauf und kein behauptetes neues Archiv. Anbieterinformationen wurden anhand aktueller Primärquellen ergänzt; Brevo-Tracking wird als weiterhin aktiv und anonymisiert beschrieben. Die vollständige Abschaltung wurde nicht erreicht; die Support-Anfrage wurde wegen Cloudflare nicht gesendet und auf Nutzerwunsch zurückgestellt. Veröffentlichung der Information bedeutet keine abschließende Klärung der Zulässigkeit dieser Messung.

Neue Registrierung, Einwilligungsprüfung, Profil-Löschfunktion und Datenschutzmigration bleiben unveröffentlicht. Die Veröffentlichung ersetzt keine Vertragsannahme bestehender Kunden. Der veröffentlichte Textkörper liegt in `recht-veroeffentlichung-body.html`; die ursprüngliche Prüffassung beschreibt weiterhin zusätzlich die vorbereiteten Funktionen und ist nicht mit der Live-Fassung gleichzusetzen.

## Datenschutzfunktionen produktiv – Version 2026-09-19.3

Nach ausdrücklichem Auftrag „ja mach das alles“ sind die Datenbankmigrationen `club_privacy_acceptance_consent_erasure_v3` und `club_privacy_single_account_erasure` produktiv. Oberfläche, aktuelle Rechtsfassung und fest versionierte Rechtsfassung sind mit GitHub-Commit `7c2dde898a8786f0d7fe557b6627b68a8a4b31d1` veröffentlicht und über GitHub Pages überprüft.

- Anmeldung verlangt Rechtsversion und Alters-Selbsterklärung. Der genaue veröffentlichte Textkörper ist durch SHA-256 in der privaten Rechtsfassungstabelle dokumentiert. Die verlinkte Version bleibt unter `club/recht-2026-09-19-3.html` erhalten.
- Das Öffnen des Zugangslinks bestätigt die Bedingungen NICHT automatisch. Die ausdrückliche Annahme im Kundenbereich wird separat gespeichert. Bestehende Kunden können ohne Annahme ihren bisherigen Stand ansehen.
- Werbeeinwilligungen werden anhand des aktuellen Wortlauts geprüft; bisherige Einwilligungen wurden widerrufen. Erneute Zustimmung bleibt freiwillig. Ein Widerruf wurde im Browser und anschließend in der Datenbank bestätigt.
- Kontoschließung im Browser widerruft Einwilligungen, storniert offene Nachrichten, sperrt den Zugang und erfasst den Löschauftrag. Der tägliche vorhandene Job ruft den Löschprozess auf.
- Der allgemeine manuelle Löschaufruf wurde durch die automatische Sicherheitsprüfung wegen möglicher weiterer fälliger Konten abgelehnt. Ein zusätzlicher administrativer Einzelkonto-Löschlauf mit verpflichtender Konto-ID wurde installiert. Dieser hat ausschließlich das synthetische Browser-Testkonto gelöscht. Danach sind weiterhin die zehn ursprünglichen Konten vorhanden.
- Der Testversand an example.invalid wurde in derselben Transaktion wie die Testregistrierung storniert. Es wurde keine Testmail an diese Adresse gesendet. Der dazu erzeugte externe Löschauftrag wurde mit diesem Nachweis erledigt; aktuell keine offenen Dienstleister-Löschaufträge.
- Nachweise des synthetischen Tests wurden wie vorgesehen im geschützten Archiv erhalten. Öffentliche Rollen haben weder Archivzugriff noch Ausführungsrechte auf den Löschworker.

### Prüfungen

Isolierte Wiederherstellung: SQL-Kompilierung; fehlende Annahme abgewiesen; Rechtsnachweis vorhanden; bloßes Öffnen zählt nicht als Annahme; explizite Annahme wirksam; falscher Einwilligungstext abgewiesen; Widerruf; Zugangssperre; Löschung; Schutz regulärer Punktebuchungen; befristete Belegaufbewahrung ohne Zugangstoken; Ablauf der Archivfrist. Zusätzlich Transaktionstest auf Produktion mit vollständigem Rollback. JavaScript-Syntax und öffentliche Auslieferung geprüft. Live-Browser: Profil, ausdrückliche Annahme, Werbung ein/aus, Kontoschließung und Rückkehr zur Anmeldung geprüft.

### Weiterhin offen / betriebliche Grenzen

- Vollständige Brevo-Tracking-Abschaltung: weiterhin nur anonymisiert; Support bleibt durch Cloudflare blockiert, Anfrage nicht gesendet.
- Google Wallet auf echtem Android-Gerät und abschließender kompletter Kundendurchlauf im Studio. Der bereits vom Nutzer bestätigte Apple-Wallet- und E-Mail-Zustelltest wird nicht als in diesem Durchlauf wiederholt ausgegeben.
- Externe Kopien bei Brevo/Google werden nicht durch die Datenbanklöschung beseitigt. Aufträge in `club_private.dienstleister_loeschung` müssen gesondert durch die berechtigte Verwaltung bearbeitet und mit Nachweis abgeschlossen werden. Manuelle Backups und eine Wiederherstellung benötigen ebenfalls Berücksichtigung erfolgter Löschungen.
- Die Altersauswahl ist eine Selbsterklärung, keine technische Prüfung der gesetzlichen Vertretung.
- Sicherheitsadvisors: private RLS-Tabellen ohne Freigabepolicies sind bewusst gesperrt. Hinweise auf öffentlich ausführbare SECURITY-DEFINER-RPCs bestehen aufgrund des tokenbasierten Zugangs; die neuen Kundenfunktionen prüfen ihren Zugangstoken. Kein pauschales Urteil „alle Sicherheitswarnungen behoben“.

## Google-Wallet-Gerätetest bestätigt

Der Nutzer hat bestätigt, dass die Google-Wallet-Karte erfolgreich auf einem Android-Gerät hinzugefügt wurde. Dieser Installationstest ist erledigt. Eine automatische Kartenaktualisierung nach einer neuen Perlenbuchung auf diesem Android-Gerät wurde damit noch nicht bestätigt.
