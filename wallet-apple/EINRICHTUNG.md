# Apple Wallet – erste native Ausgabe

Stand 18.09.2026. Die erste Fassung erstellt einen signierten `.pkpass` mit Kundenname, Kundennummer, aktuellem Punktestand, Rang und QR-Code. Erneutes Hinzufügen verwendet dieselbe Seriennummer. Automatische Hintergrundaktualisierung/APNs ist noch nicht implementiert.

## Vorhandenes Zertifikat

Das bereitgestellte `pass.cer` wurde gelesen: Pass Type ID `pass.de.laperlebeauty.club`, Team `FPDU6B86GK`, ausgestellt von Apple WWDR G4, gültig bis 17.10.2027. Die Datei enthält **keinen privaten Schlüssel**.
Auf dem Mac, auf dem der CSR erstellt wurde, in der Schlüsselbundverwaltung unter **Meine Zertifikate** den Pass-Eintrag samt privatem Schlüssel exportieren (`.p12`, mit Passwort). Wenn dort kein zugehöriger Schlüssel ist, muss er am ursprünglichen Erstellungsort gesucht werden; ein `.cer`-Download ersetzt ihn nicht.

## Secrets im Testprojekt

In Supabase `xzxplhvkabgfyglmkcii` unter Edge Functions → Secrets:

- `APPLE_SIGNER_CERT`: optionales öffentliches Pass-Zertifikat als PEM für spätere Erneuerung. Das bereitgestellte Zertifikat ist in `certificates.ts` enthalten; ein fehlender oder beschädigter PEM-Eintrag verwendet diesen geprüften öffentlichen Ersatz.
- `APPLE_SIGNER_KEY`: zugehöriger privater Schlüssel als PEM.
- `APPLE_SIGNER_KEY_PASSPHRASE`: falls der PEM-Schlüssel verschlüsselt ist.
- `APPLE_WWDR_CERT`: optionales öffentliches Apple-WWDR-Zertifikat als PEM. Das passende G4-Zertifikat aus Apples offizieller Quelle ist in `certificates.ts` enthalten.
- `APPLE_PASS_ASSET_BASE_URL`: HTTPS-Adresse des Verzeichnisses mit nativen Wallet-Bildern.

Private Schlüssel und Passwörter gehören ausschließlich in den Secretmanager. Weder hier noch im Repository speichern. Zertifikatsidentität, Gültigkeit, Schlüsselübereinstimmung und WWDR-Signatur werden vor jeder Pass-Erstellung geprüft.

## Bilddateien

Benötigt werden gemeinsame `icon.png`, `icon@2x.png`, `icon@3x.png` (29/58/87 px quadratisch). Für jeden Ordner `bronze`, `silber`, `gold`, `platin`, `diamant`:

- `logo.png`, `logo@2x.png`, `logo@3x.png` – bis 160×50 pt, zum jeweiligen Kontrast passend.
- `strip.png`, `strip@2x.png`, `strip@3x.png` – 375×123 pt, 750×246 px, 1125×369 px.

Diese Exporte aus dem freigegebenen Metallic-/Perlenschatz-Entwurf fehlen noch. Der Rang wird als echtes Wallet-Textfeld über den Streifen gelegt. Namen, Punkte und QR-Code dürfen nicht ins Bild gerendert sein. Die Entwurfstafel mit Beispielnamen und QR-Platzhaltern ist kein einsetzbarer Pass. Apple legt das native Layout, die Schrift und die Größe des QR-Bereichs fest; ein vollflächiger Metallic-Hintergrund der Studie ist im Store-Card-Layout nicht frei gestaltbar. Silber und Gold verwenden dunkle Schrift.

## Bereitstellung

`index.ts`, `pass.ts`, `certificates.ts` und `deno.json` als Funktion `wallet-apple` bereitstellen. Eigene Tokenprüfung über `wallet_apple_kartendaten`, deshalb `verify_jwt=false`. Abhängigkeiten `passkit-generator` und `node-forge` sind exakt auf 3.6.0 bzw. 1.4.0 festgelegt. Für lokale Signaturtests `npm ci --ignore-scripts` in diesem Verzeichnis verwenden; der Node-Lock ist beigefügt.

Migration `20260918012545_wallet_apple_und_google_ausgabe.sql` ergänzt die Datenbankfunktion und den standardmäßig ausgeschalteten Schalter `apple_wallet_aktiv`. Sie aktiviert keine Wallets. Nach Hinterlegen der Secrets, Bereitstellen der Bilddateien und Eintragen einer echten HTTPS-Adresse unter `club_basis_url` kann die Apple-Ausgabe im Testprojekt eingeschaltet werden. Der gemeinsame Funktionsschalter `wallet` muss ebenfalls aktiv sein.

Die App sendet den persönlichen Club-Token per POST an `/functions/v1/wallet-apple/pass` und lädt die Antwort mit `application/vnd.apple.pkpass`. Auf iPhone/Safari ist der vollständige native Speicherablauf noch zu prüfen, anschließend der QR-Scan per Studio-iPad und das erneute Hinzufügen bei geändertem Punktestand.

## Geprüft / noch offen

Fünf Ränge mit temporärer Test-CA signiert, zusätzlich Signierung unter Deno 2.9.6 ausgeführt; CMS-Signatur unabhängig mit OpenSSL geprüft; Manifest-Hashes geprüft; falscher Schlüssel, Team-ID, fehlende Bilder und Platzhalter-Adresse werden abgewiesen. Die Bildfixtures sind ausschließlich technische Tests, keine Designabnahme. Ein temporäres Testzertifikat wird von Apple Wallet nicht als echte Karte akzeptiert.

Echter Schlüsselabgleich und Signaturtest am 18.09.2026 auf dem Testserver erfolgreich: gespeicherten verschlüsselten Schlüssel im Serverprozess geöffnet, öffentliches Zertifikat und WWDR-Kette geprüft, internes PKPass mit synthetischen Daten signiert. CMS-Signatur zusätzlich unabhängig mit OpenSSL gegen das bereitgestellte Signierzertifikat geprüft; sämtliche Manifest-Hashes korrekt. Kein privater Schlüssel oder Passwort wurde aus Supabase abgerufen. Der temporäre, authentifizierte Prüfpfad wurde anschließend entfernt.

Die gehostete Edge-Laufzeit verarbeitet den vorhandenen verschlüsselten PKCS8-Schlüssel und die nativen X509-Schlüssel-/Signaturprüfungen nicht zuverlässig. `node-forge` entschlüsselt nun ausschließlich im Arbeitsspeicher, gleicht RSA-Modul/Exponent ab, prüft die Ausstellersignatur sowie eine Signaturprobe mit dem privaten Schlüssel. Gültigkeit und Pass-/Team-ID werden weiterhin geprüft. Der für die PKPass-Erstellung entschlüsselte Schlüssel wird weder gespeichert noch protokolliert. Tests decken verschlüsselte Schlüssel unter Node/Deno sowie falsches Passwort, fremden Schlüssel und falschen Aussteller ab.

Noch offen: native Bildexporte, iPhone/iPad-Gerätetest, Apple-Webservice/APNs für automatische Updates. Keine Produktivfreigabe.

Quellen: [Apple Pass Design and Creation](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html), [Apple Zertifikate](https://www.apple.com/certificateauthority/), [Signaturbibliothek](https://github.com/alexandercerutti/passkit-generator), [Supabase Abhängigkeiten](https://supabase.com/docs/guides/functions/dependencies).

## Datenbankprüfung

Der Supabase-Advisor meldet weiterhin das bestehende `pg_net` im öffentlichen Schema und die bewusst per Kundentoken/Studiositzung geschützten öffentlichen SECURITY-DEFINER-RPCs (nun 74 einschließlich Apple). Die neue Apple-RPC prüft zuerst `_kundin_per_token`; direkte Tabellenrechte bleiben entzogen. Diese Prüfung ist keine allgemeine Produktiv-Sicherheitsfreigabe. [Advisor zu öffentlichen RPCs](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [Advisor zu Erweiterungen](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public).
