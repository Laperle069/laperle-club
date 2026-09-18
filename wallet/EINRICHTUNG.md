# Google Wallet – Einrichtung der aktuellen Fassung

Stand 18.09.2026. Quellcode: `wallet/index.ts`. Bestehende Klassen werden nicht umgestaltet.
Testprojekt: `xzxplhvkabgfyglmkcii`. Produktivprojekt separat behandeln.

## Benötigt

- Google Wallet API im Cloud-Projekt des Dienstkontos aktivieren.
- Dienstkonto in der Google Pay & Wallet Console unter **Nutzer** mit Entwicklerzugriff hinzufügen.
- Dienstkonto-JSON ausschließlich als Supabase Edge Function Secret `GOOGLE_SERVICE_ACCOUNT` hinterlegen. Nicht ins Repository oder in Chatnachrichten kopieren.
- Vorhandene Aussteller-ID: `3388000000023188314`.
- Hinterlegte vollständige Klassen-ID: `3388000000023188314.laperle_club`. Die zwei Anzeigenamen im Screenshot sind kein Beleg für die interne ID: vor der Freischaltung die Klassendetails abgleichen.
- Bei Demo Mode das Google-Konto des Testgeräts als Testnutzer hinterlegen.

## Funktion und Aktivierung

`wallet/index.ts` als Funktion `wallet` bereitstellen. `verify_jwt=false` ist erforderlich, da `/link` den persönlichen Club-Token über die Datenbank prüft und `/sync` ein eigenes Geheimnis verlangt.
`SUPABASE_URL` und der öffentliche bzw. serverseitige Supabase-Schlüssel werden aus der Edge-Umgebung bezogen; kein Projektwechsel im Code.

Die öffentliche Club-Adresse in `club_basis_url` muss erreichbar sein. `https://test.invalid/club/` ist ausdrücklich kein gültiges Ausgabeziel. Erst nach Prüfung in der Testdatenbank `wallet_aktiv=true` setzen; auch der Funktionsschalter `wallet` muss aktiv sein.

`POST /functions/v1/wallet/link` erhält `{ "token": "persönlicher Club-Token" }`. Das Objekt wird bei Google angelegt oder aktualisiert, anschließend enthält der signierte Save-Link nur die Objekt-ID. Ein ausgegebener Link ist **keine** Bestätigung, dass ein Mensch den Pass gespeichert hat. Die bestehende RPC/Statistik heißt aus Kompatibilitätsgründen weiterhin `wallet_gespeichert`; `zuletzt_abgerufen` steht für die Ausgabe.

## Rangbilder

Optionales Secret `GOOGLE_PASS_ASSET_BASE_URL`: öffentlich erreichbares HTTPS-Verzeichnis der freigegebenen Bilder. Je Rang wird `bronze/hero.png`, `silber/hero.png`, `gold/hero.png`, `platin/hero.png` oder `diamant/hero.png` verwendet; auch bei Rangänderungen im Sync.
Die bisherigen Entwürfe sind Designstudien, noch keine nativen Bildexporte. Keine Demo-QR-Codes oder Beispielnamen übernehmen. Google bestimmt die Schrift und den QR-Bereich. Der Hintergrund einer Loyalty Card kommt von der Klasse, nicht vom einzelnen Objekt. Eine Umstellung auf fünf Rangklassen ist hier bewusst noch nicht vorgenommen.

## Automatische Google-Aktualisierung

`POST /functions/v1/wallet/sync` mit `x-sync-geheimnis: <Secret>`; Edge Secret `SYNC_GEHEIMNIS` und serverseitiger Supabase-Schlüssel erforderlich. Nur ein geheimer serverseitiger Zeitplan darf diesen Aufruf auslösen. Schlüssel in Vault/Secretmanager speichern, niemals in öffentliche SQL-Dateien oder `ALTER DATABASE ... app.service_key` schreiben.
Der alte Anleitungsvorschlag mit Bearer-Service-Key allein passt nicht zum aktuellen Worker und wurde entfernt. Noch kein neuer Zeitplan eingerichtet.

## Vor dem ersten echten Kundeneinsatz

Testkarte auf Android speichern, Punktestand/Rang ändern, Sync auslösen und die aktualisierte Karte prüfen. QR mit dem Studio-iPad scannen. Demo-/Veröffentlichungsstatus in Google prüfen. Bestehende Google-Klassen nicht löschen oder ungeprüft ändern.

Quellen: [Google-Ausgabe](https://developers.google.com/wallet/retail/loyalty-cards/web), [Objekt-Felder](https://developers.google.com/wallet/reference/rest/v1/loyaltyobject), [Supabase Secrets](https://supabase.com/docs/guides/functions/secrets).
