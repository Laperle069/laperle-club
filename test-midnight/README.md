# Midnight Privé – getrennte Club-Testfassung (Stand 04)

Diese Dateien stammen aus `LaPerle_MidnightPrive_Stand_04.zip` und richten sich ausschließlich an das Supabase-Testprojekt `xzxplhvkabgfyglmkcii`. Die Testseite zeigt einen deutlichen Hinweis; keine echten Kundendaten eingeben.

## Bereitstellung

Dieser Branch veröffentlicht noch keine Testseite. Die produktive `index.html`, `backend.html`, `recht.html` und `404.html` im Repository-Stamm bleiben unverändert. Vor einem Merge die tatsächliche GitHub-Pages-Quelle in Settings → Pages prüfen. Bei Veröffentlichung aus `main` und `/` wäre der Testclub anschließend unter `/laperle-club/test-midnight/` erreichbar. Der Link ist vor dem Merge nicht verfügbar.

Der neue Ordner ist für die öffentliche Kundenoberfläche vorgesehen. Die neue Terminal- und Verwaltungsfassung bleiben im vollständigen Stand-04-Paket für getrenntes, geschütztes Hosting. Die bereits vorhandene öffentliche `backend.html` im Repository-Stamm wird in diesem Vorschlag nicht verändert; ihr weiterer Hosting-Ort muss vor dem Produktivwechsel festgelegt werden.

## Grenzen

- Test-PINs, Kundenzugangslinks, private Schlüssel und Datenbank-Dumps sind nicht enthalten.
- Der öffentliche Supabase-Schlüssel ist absichtlich öffentlich; Berechtigungen werden in der Datenbank geprüft.
- Mailversand, Wallet-Versand und Altlink-Rotation sind in der Testumgebung deaktiviert.
- `noindex` verhindert keine Zugriffe. Es gibt hier keinen Verzeichnisschutz.
- GitHub Pages wertet `_headers` nicht aus. Deshalb enthalten diese HTML-Dateien Referrer- und Robots-Metatags; serverseitige Schutzheader müssen beim endgültigen Hosting eingerichtet und geprüft werden.
- Reale Browser-/iPad-Tests auf der veröffentlichten Adresse stehen noch aus. Die bisherigen Browser-Integrationstests verwendeten einen HTTP-Transport über Node; sie sind kein Nachweis für den nativen Browserzugriff von dieser Domain.
- Eine Apple-Wallet-Integration ist noch nicht Bestandteil dieses Standes.

## Abgleich

Design, Anwendungslogik und Rechtsdatei wurden aus dem geprüften Paket übernommen. Zusätzlich wurden ausschließlich die Robots-/Referrer-Metatags ergänzt. Bestehende Rechtstexte sind keine neue rechtliche Prüfung.

## Freigegebene E-Mail-Texte integriert

Die E-Mail-Migration ist in der getrennten Testdatenbank angewendet. Der Club berücksichtigt jetzt die direkten Ziele aus E-Mails (Prämien, Geschenke, Einstellungen) nach dem Laden. Details, Voraussetzungen und verbleibende Versandtests: [E-Mail-Einbaustand](../mail/README.md).
