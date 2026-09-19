# Produktionskonfiguration

Projekt: `byiocfdghgbxxdcmaqoh`. Die freigegebenen Bilder werden unabhängig vom TEST-Projekt unter folgendem öffentlichen, versionierten Präfix betrieben:

`https://byiocfdghgbxxdcmaqoh.supabase.co/storage/v1/object/public/oeffentlich/club-wallet/metallic-facets-v2/`

- Apple: Unterverzeichnis `apple/`; Produktionsdefault in `wallet-apple/index.ts`. Ein zusätzliches Bild-Secret ist für dieses Projekt nicht erforderlich. Ein bewusst gesetztes `APPLE_PASS_ASSET_BASE_URL` hat Vorrang.
- Google: Unterverzeichnis `google/`; Produktionsdefault im vorbereiteten `wallet/index.ts`. `GOOGLE_PASS_ASSET_BASE_URL` kann diesen ersetzen. Die Produktionsfunktion `wallet` läuft noch auf Version 10 und wird erst zusammen mit dem Datenbankupgrade auf den vorbereiteten Stand gebracht.
- Datenbankeinstellung `wallet_edge_basis_url`: `https://byiocfdghgbxxdcmaqoh.supabase.co/functions/v1`.
- Der bisherige `club_basis_url` bleibt bis zur tatsächlichen Veröffentlichung erhalten. Die vorbereitete Kundenfassung führt alte persönliche Links vom Stamm unter Beibehaltung von Query und Hash nach `/club/` weiter.
- Kundenfassung in `customer-release/`: Produktionsprojekt, Studio `FFM-01`, Testmodus aus; lokale Schrift-, QR- und Supabase-Bibliotheken.

## Reproduzierbare Bildprüfung

`python scripts/verify-production-artwork.py`

Prüft sämtliche 39 öffentlichen PNGs gegen Dateigröße, MIME-Type und SHA-256 aus `release/wallet-artwork-manifest.json`. Die Prüfung ist rein lesend.

## Noch vor Kundenveröffentlichung

1. Backup und Wiederherstellung für Bestandsdaten sicherstellen und das vorbereitete Datenbankupgrade durchführen.
2. `APPLE_SIGNER_KEY` und gegebenenfalls `APPLE_SIGNER_KEY_PASSPHRASE` sicher im Produktivprojekt setzen. Keine privaten Schlüssel im Repository oder Frontend.
3. Wallet-Worker einrichten, aktuelle Google-Funktion deployen und geschützte Signier-/APNs-Prüfung bestehen.
4. Kundenfassung veröffentlichen und Produktions-Club-URL auf `/club/` umstellen; Gerätetests und Mailzustellung abnehmen.

Das Vorhandensein öffentlicher Bilder und eines deployten Apple-Dienstes bedeutet noch keine betriebsbereite Kartenausgabe. TEST bleibt bis zum abgeschlossenen Übergang erhalten.
