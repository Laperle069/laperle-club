# Google Wallet – aktueller Stand

Stand 18.09.2026. TEST `xzxplhvkabgfyglmkcii`; Produktion unverändert.

Die vorhandene Dienstkonto-Verbindung funktioniert. Die konfigurierte Klasse `3388000000023188314.laperle_club` ist über die Google Wallet API erreichbar und hat Status `approved`. Der Aussteller hat ID `3388000000023188314`. Die allgemeine Veröffentlichungsfreigabe bzw. Demo-Testnutzer ist damit noch nicht bewiesen und gehört zum Gerätetest in der Google Wallet Console.

## Ausgabe und Aktualisierung

`POST /link` prüft den persönlichen Clubtoken, legt das Kundenobjekt an oder aktualisiert es und liefert einen signierten Save-Link, der nur die Objekt-ID enthält. Ein ausgegebener Link ist keine Speicherbestätigung des Kunden.

`POST /sync` aktualisiert Perlen, Rang, Rangbild, Namen, Club-Link und nächste Prämie. Leases, Versionsquittierungen und Wiederholungen verhindern verlorene Änderungen. Der Minutenzeitplan `laperle_wallet_sync` benutzt den Vault-Schlüssel `laperle_wallet_worker`. `SYNC_GEHEIMNIS` bleibt als kompatible Alternative unterstützt.

Fünf native Metallic-Rangbilder sind in TEST öffentlich hinterlegt. Die Grundfarbe wird von der Google-Klasse bestimmt: `hexBackgroundColor` ist kein gültiges LoyaltyObject-Feld. Individuelle Rangbilder werden als `heroImage` gesetzt. Die bestehende Klasse wird nicht global umgestaltet.

## Bereitstellung

`index.ts` als Funktion `wallet`, `verify_jwt=false`. Eigene Authentifizierung für Kunden, Worker und Diagnose ist implementiert. `GOOGLE_SERVICE_ACCOUNT` bleibt als Secret hinterlegt. Supabase URL und Schlüssel kommen aus der Laufzeit. `GOOGLE_PASS_ASSET_BASE_URL` für andere Umgebungen konfigurieren.

Geschütztes `POST /check` prüft Dienstkonto, Klassenfreigabe und Club-Adresse ausschließlich lesend. Es erzeugt keine Kundenkarte. Antwort enthält keine Zugangsschlüssel und keine Kundendaten.

Gemeinsame Konfiguration, verifizierte Ergebnisse und Geräteabnahme: [FINALISIERUNG.md](FINALISIERUNG.md).
