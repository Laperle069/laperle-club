# Wallet-Designverfeinerung · 20. September 2026

Bronze, Silber, Gold, Platin und Diamant verwenden abgestimmte metallische Rangfarben. Diamant erhält dezente Facetten. Die originale Wortmarke und Muschel bleiben erhalten. Name, Mitgliedsdatum, Punkte, Rangfortschritt und QR-Code bleiben native, aktualisierbare Felder mit der zuletzt freigegebenen Anordnung.

## Umsetzung

- Apple: PNG-Streifen mit 375 × 123 Punkten sowie Logos mit 160 × 50 Punkten, jeweils in 1×, 2× und 3×. Alle 33 benötigten Apple-Bilder sind im Ausgabe-Dienst enthalten. Die vorhandenen Icons bleiben bytegleich.
- Google: fünf Hero-Bilder mit 1032 × 812 Pixeln unter unveränderlichen, versionierten URLs. Die Objektfarbe entspricht dem jeweiligen Rang. Bestehende Logo- und Layout-Einstellungen bleiben erhalten.
- 38 PNG-Dateien insgesamt. Quellen, Exportmaße und SHA-256-Prüfsummen stehen in `wallet-refined-manifest.json`.
- Die Vorschau unter `/wallet-vorschau/` verwendet Beispieldaten und QR-Platzhalter. Sie ist keine installierbare Wallet-Karte; die Darstellung auf dem Gerät bestimmt Apple beziehungsweise Google.

## Geprüft

- Alle 38 Bilddateien: PNG-Maße und Prüfsummen.
- Mindestkontrast der Apple-Schrift über sämtliche Pixel der Streifen: Bronze 5,15:1; Silber 6,47:1; Gold 4,77:1; Platin 6,00:1; Diamant 6,67:1.
- Fünf Apple-Pässe mit temporären Testzertifikaten erzeugt; CMS-Signatur und Manifest unabhängig geprüft. Mitgliedsdatum, Name, Perlen, QR-Inhalt und stabile Seriennummer erhalten.
- Bestehende Google-Ausgabetests bestanden, einschließlich Save-Link-Signatur, Layout, vorhandenen Karten, Fehlerbehandlung und Freigabeprüfung.

## Darstellung auf Geräten

Die Darstellung in Apple Wallet und Google Wallet muss auf echten Geräten angesehen werden. Eine bestehende Karte lässt sich über den persönlichen Club erneut hinzufügen; Seriennummer beziehungsweise Objekt-ID bleiben erhalten. Diese Designänderung allein stößt keinen Rundversand und keine globale Kartenaktualisierung an.

## Herstellerangaben

- [Apple: Pass-Layout, Bilder und native Felder](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html)
- [Google: Markenrichtlinien für Kundenkarten](https://developers.google.com/wallet/retail/loyalty-cards/resources/brand-guidelines)
