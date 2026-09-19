# Kundenstart – 19.09.2026

## Bestätigt

- Nutzer hat die Apple-Karte auf einem echten iPhone hinzugefügt.
- Genau eine Apple-Geräteregistrierung im Testsystem; automatische Teständerung von 250 auf 251 Perlen: Version 2 quittiert, Fehlerzahl 0. Das beweist APNs-Annahme, nicht den sichtbaren Stand auf dem Gerät.
- Produktivdatenbank byiocfdghgbxxdcmaqoh: 10 Kunden, 0 Punktebuchungen, keine aktiven Standard-PINs 1234/5678, Studio FFM-01, Region Frankfurt.
- Aktiver Brevo-Absender info@laperle-beauty.de per API geprüft (HTTP 200). Keine Test- oder Kundenmail versendet; Zustellnachweis bleibt offen.
- Upgrade 029–031 und sämtliche danach gelieferten Migrationen in einer zurückgerollten Transaktion geprüft. Zweite Probe bestätigt zusätzlich Erhalt aller Kunden-IDs, E-Mail-Adressen und Zugangstoken. Produktivschema unverändert.
- customer-release enthält Club, Terminal, Backend, lokale Schriften und fest versionierte Supabase-/QR-Bibliotheken. Kein Testprojektziel, keine Testkennung und kein öffentlicher Vorschauzugang. Apple und Google werden durch die jeweiligen serverseitigen Freigabeschalter gesteuert.
- Alte persönliche Links am GitHub-Pages-Stamm behalten Query und Hash beim Übergang zu /club/.
- Company-/Kontaktdaten aus https://laperle-beauty.de/impressum.html ergänzt. Die dort ebenfalls fehlende USt-ID wurde ausdrücklich nicht erfunden.
- Produktionsziel des Kandidaten: https://laperle069.github.io/laperle-club/club/ . Das ist nur ein gebauter Kandidat, keine neue Veröffentlichung.
- Statische Prüfung: Produktionsziele, lokale Assetpfade und 21 eingebettete JavaScript-Blöcke bestanden.

- Test-Site Version 7 veröffentlicht: Apple und Google erreichen die Wallet-Dienste; 26 Oberflächentests und statische Prüfung bestanden. Registrierung und Mailversand bleiben im Testmodus.

## Noch keine Kundenfreigabe

1. Nutzer bestätigt: USt-ID noch nicht erhalten. Leerer Umsatzsteuerabschnitt entfernt, ohne Kleinunternehmerstatus zu behaupten. Bei Erhalt nachtragen. Datenschutz-/Teilnahmetexte sind Arbeitsfassung, keine rechtliche Freigabe.
2. Backup mit Wiederherstellungsnachweis vor dauerhaftem Bestandsupgrade. Probe alleine ersetzt kein Backup. Kein Upgrade ausgeführt.
3. Apple-Schlüssel und Passphrase befinden sich nachweislich im TEST-Projekt. Einrichtung im Produktivprojekt ist noch nicht nachgewiesen. Keine Schlüssel exportiert, kopiert oder offengelegt. Dort ist bisher nur die alte Google-Wallet-Funktion vorhanden. Aktuelle Edge Functions und freigegebene Assets müssen dort nach dem Upgrade bereitgestellt und geprüft werden.
4. Kontrollierter Mailzustelltest und Google-Gerätetest/Veröffentlichungsstatus ausstehend. API-Absender aktiv und Kartenklasse approved sind keine Endgeräteabnahme.
5. Nutzer hat die öffentliche Speicherung des Quellcodes ausdrücklich freigegeben. Repository-Inhaberschaft und Schreibrechte sind geprüft. Quellstand wird über die authentifizierte GitHub-Verbindung auf einem eigenen Branch gesichert; keine Veröffentlichung der Kundenfassung und keine Änderung des Produktionsbranchs.

## Reihenfolge zum Abschluss

- Sicherung und Wiederherstellung belegen; Upgrade aus den vorhandenen Migrationen durchführen. release/upgrade-rehearsal.sql rollt immer zurück und ist kein Produktionsinstaller.
- Aktuelle Wallet-Dienste/Secrets/Assets in PROD bereitstellen; Club- und Worker-URL auf PROD setzen. Kundentoken unverändert lassen.
- Endgeräte-/Mailtest mit ausdrücklich bestimmten eigenen Testempfängern durchführen; bestehende wartende Nachrichten vor Versand prüfen.
- USt-ID nach Erhalt nachtragen; Kandidat prüfen und auf freigegebenem Hosting veröffentlichen. Root-Weiterleitung erhält alte persönliche Zugangslinks.
- Erst dann TEST-Kundendaten bereinigen. Niemals die 10 Bestandskunden oder Produktivtabellen löschen.

## Auftrag zur Testbereinigung

Der Nutzer hat ausdrücklich angeordnet: Testkundendaten erst löschen, sobald alles zur Veröffentlichung bereit ist. Diese Bedingung ist derzeit nicht erfüllt. Daher keine Löschung erfolgt. Der Auftrag umfasst hier Testkundendaten und Testkarten; eine Löschung des gesamten Supabase-Projekts (mit Assets und funktionierender Signierkonfiguration) ist nicht stillschweigend mit umfasst. Vor Bereinigung müssen neue Kundenkarten und Produktionsassets unabhängig vom Testprojekt funktionieren.
