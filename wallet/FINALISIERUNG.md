# Wallet-Abnahme – 18.09.2026

## Bereitgestellter Stand

Nur TEST `xzxplhvkabgfyglmkcii`: Google `wallet` Version 12, Apple `wallet-apple` Version 24. Migration `20260918180259_wallet_final_readiness.sql` ergänzt aktuelle Namen und berücksichtigt den Level-Funktionsschalter im Google-Worker. Vorherige Migrationsdateien für Ausgabe und automatische Updates gehören ebenfalls dazu.

`club_basis_url` wurde in TEST vom Platzhalter auf https://la-perle-club-test.durmaz-ecommerce.chatgpt.site/club/ gesetzt (HTTP 200 geprüft). Diese Adresse nicht für Produktion übernehmen. `wallet_aktiv=false` und `apple_wallet_aktiv=false`; der Minutenjob läuft, überspringt aber ausgeschaltete Plattformen.

## Verifiziert

- Google API HTTP 200, bestehende Klasse `approved`, geschützte Diagnose `ready:true`.
- Apple: fünf echte PKPass-Pakete mit freigegebenen Bildern im Serverprozess signiert; Bronze 96452, Silber 117346, Gold 97682, Platin 115133, Diamant 119594 Bytes. Kein Paket oder Kundentoken wird von der Diagnose zurückgegeben.
- Apple-Zertifikat gültig bis 17.10.2027. APNs-Zertifikatsverbindung erfolgreich (synthetischer Null-Token: BadDeviceToken).
- Lokale Ausgabe-, Signatur-, Protokoll-, Worker- und Datenbanktests erfolgreich. Namensänderungen werden jetzt auch an Google übertragen.
- Google-Objekte enthalten kein ungültiges hexBackgroundColor-Feld mehr. Fünf Rangbilder bleiben bestehen; die Grundfarbe stammt aus der bestehenden Klasse.
- Geschützte Diagnose verlangt den Vault-Worker-Schlüssel; keine öffentlichen Diagnosedaten.
- Sicherheitsprüfung: vorhandene pg_net/public- und tokenbasierte SECURITY-DEFINER-Hinweise bleiben bestehen. Gerätezuordnung ist RLS-geschützt und nur für den Dienst zugänglich.

## Einmaliger Live-Gerätetest

1. Google Wallet Console: Veröffentlichungsstatus prüfen; bei Demo-Modus das Google-Konto des Android-Testgeräts als Testnutzer eintragen. Klassenfreigabe allein beweist keinen unbegrenzten Ausstellerzugang.
2. Im TEST-Backend Wallet-Funktion und beide Ausgabe-Schalter einschalten. Kontrollierte Testdaten verwenden. Produktion bleibt separat.
3. Den persönlichen TEST-Club-Link auf iPhone/Safari und Android öffnen und jeweils die Karte speichern. Alte Apple-Karten ohne Update-Dienst einmal neu hinzufügen. Automatische Updates in Wallet zulassen.
4. Auf beiden Geräten Namen, fünf Rangdesigns, Perlen, Kundennummer und Link zurück zum persönlichen Club prüfen. QR am Studio-iPad scannen; exakte Kundenzuordnung bestätigen.
5. Über die Verwaltung Umsatz buchen, Prämie einlösen und Ranggrenze überschreiten. Wallet ohne erneutes Hinzufügen auf Änderung prüfen; Zustellung kann verzögert sein. Paralleländerungen dürfen nicht verloren gehen.
6. Karte entfernen und neu hinzufügen. Apple-Geräteregistrierung, stabile Seriennummer und erneute Aktualisierung prüfen.
7. Ergebnis mit Gerät/OS, Zeitpunkt und Screenshot dokumentieren. Bei Fehlern Ausgabe wieder ausschalten; keine erneute Kartenanlage oder neue Seriennummer als Fehlerumgehung.

Die Prüfendpunkte lauten POST /functions/v1/wallet/check und POST /functions/v1/wallet-apple/check. Sie sind nur serverseitig mit x-sync-geheimnis verwendbar. Der Schlüssel bleibt in Vault.

NFC/VAS/Smart Tap und frei formulierte Kampagnen sind eigenständige Erweiterungen und nicht Bestandteil dieser Kartenabnahme. Bislang keine Kundenbenachrichtigungen versendet.

## Git / Quellen

Quellstand liegt lokal auf codex/wallet-auto-updates. Der GitHub-Push wurde zuvor durch automatische Freigabeprüfung gesperrt und ohne neue ausdrückliche Freigabe nicht erneut versucht. Deployment in TEST ist davon unabhängig erfolgt.

API-Felder: https://developers.google.com/wallet/reference/rest/v1/loyaltyobject
Apple-Updates: https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Updating.html
