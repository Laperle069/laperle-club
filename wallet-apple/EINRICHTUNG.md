# Apple Wallet – aktueller Stand

Stand 18.09.2026. Implementiert und auf TEST `xzxplhvkabgfyglmkcii` bereitgestellt: signierte Kartenausgabe, fünf freigegebene Metallic-Rangdesigns, persönlicher QR-Code, Perlen, Rang und automatische Aktualisierung per Apple-Webservice/APNs.

Pass Type ID `pass.de.laperlebeauty.club`, Team `FPDU6B86GK`. Vorhandenes Zertifikat, privater Schlüssel und Passphrase sind eingerichtet. Kein erneuter Export erforderlich. Zertifikat gültig bis 17.10.2027; vor Ablauf im Secretmanager erneuern. Private Schlüssel bleiben ausschließlich dort und werden nur im Arbeitsspeicher entschlüsselt.

## Bereitstellung

Alle `.ts`-Dateien dieses Verzeichnisses plus `deno.json` als Funktion `wallet-apple` bereitstellen; Importmap explizit `deno.json`. `verify_jwt=false`, weil die Ausgabe Kundentoken, Pass-Endpunkte ApplePass-Token und Worker/Diagnose den Vault-Schlüssel prüfen.

Abhängigkeiten: passkit-generator 3.6.0, node-forge 1.4.0. Vorhandene Secrets: `APPLE_SIGNER_KEY`, gegebenenfalls `APPLE_SIGNER_KEY_PASSPHRASE`; optionale öffentliche Zertifikats-Overrides `APPLE_SIGNER_CERT`, `APPLE_WWDR_CERT`. `APPLE_PASS_ASSET_BASE_URL` für andere Umgebungen setzen. TEST verwendet das freigegebene öffentliche Asset-Verzeichnis `wallet-artwork/metallic-facets-v2/apple/`.

`POST /pass` liefert `application/vnd.apple.pkpass`. Stabile Seriennummer und separater Authentifizierungstoken bleiben bei Aktualisierungen erhalten. Namen, Perlen und QR-Code sind echte Datenfelder, nicht ins Artwork eingebrannt. Apple bestimmt das native Kartenlayout.

## Prüfung

Geschütztes `POST /check` signiert intern alle fünf Ränge mit echten Bildern und echtem Schlüssel, gibt nur Paketgrößen und Zertifikatsgültigkeit zurück und prüft APNs mit einem nicht zugeordneten Null-Token. Es speichert keine Testkarte und benachrichtigt keinen Kunden. HTTP 400 BadDeviceToken beweist die APNs-Verbindung, nicht die Zustellung an ein Gerät.

Lokale Tests prüfen Authentifizierung, Gerätezuordnung, Aktualisierungen, Wiederholungen, PKPass-Manifest und unabhängige OpenSSL-Signaturprüfung. Echte Gerätezustellung, Safari-Speicherung und QR-Scan müssen noch abgenommen werden.

Details: [automatische Aktualisierung](AUTOMATIC_UPDATES.md), [gemeinsame Abnahme](../wallet/FINALISIERUNG.md).
