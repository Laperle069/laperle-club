# Bestehende Google-Wallet-Klasse auf Midnight Privé bringen (vorbereitet, NICHT ausgeführt)

`wallet/index.ts` legt neue Klassen mit `hexBackgroundColor: "#21191A"` an. Eine bereits
angelegte Klasse (`<AUSSTELLER-ID>.laperle_club`) wird von der Funktion bewusst **nicht**
verändert. Die Aktualisierung ist ein gesonderter Produktivschritt:

```bash
# Zugriffstoken des Dienstkontos (Scope wallet_object.issuer) in $AT
curl -X PATCH "https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/<AUSSTELLER-ID>.laperle_club" \
  -H "Authorization: Bearer $AT" -H "Content-Type: application/json" \
  -d '{"hexBackgroundColor":"#21191A"}'
```

Formatgrenzen (Google Wallet, Stand der API-Dokumentation):
- Unterstützt ist nur `hexBackgroundColor`; Schriftfarbe, Schriftart und Verläufe bestimmt Google.
- `programLogo` bleibt das vorhandene Projektlogo (`logo_url`); kein neues Logo.
- Es gibt keine CSS-Animationen in Walletkarten; Perlenkette und Feier sind Club-Funktionen.
- Änderungen an der Klasse wirken auf alle bereits ausgestellten Karten; deshalb nur nach Freigabe ausführen.
