# La Perlé Club

Der Kundenbereich des Treueprogramms der La Perlé Beauty Boutique,
Bruchfeldstraße 33, Frankfurt-Niederrad.

## Was hier liegt

| Datei | Zweck |
|---|---|
| `index.html` | Der Clubbereich: Anmeldung, Punktestand, Kette, Fassungen |
| `recht.html` | Teilnahmebedingungen, Datenschutz, Impressum |
| `404.html` | Leitet Tippfehler auf den Club zurück |

Terminal und Backend liegen bewusst **nicht** hier. Sie enthalten
Kundendaten und gehören hinter einen Verzeichnisschutz, den GitHub
Pages nicht kann.

## Online stellen

1. Auf github.com ein Repository anlegen, Name `laperle-club`, **Public**
2. Die drei Dateien hochladen (Add file → Upload files)
3. Settings → Pages → Source: „Deploy from a branch", Branch `main`, Ordner `/`
4. Nach ein bis zwei Minuten ist der Club erreichbar unter
   `https://DEINNAME.github.io/laperle-club/`

## Danach im Backend eintragen

Reiter **E-Mail** → Feld „Adresse des Clubbereichs":
die Adresse von oben, ohne Schrägstrich am Ende.

Sonst zeigen die Links in den Willkommensmails ins Leere.

## Eigene Domain (später)

Wenn `club.laperle-beauty.de` darauf zeigen soll:
Datei `CNAME` mit genau dieser Zeile anlegen und beim Domain-Anbieter
einen CNAME-Eintrag auf `DEINNAME.github.io` setzen.

## Was NICHT hier hineingehört

- Der Brevo-Schlüssel (liegt in der Datenbank)
- Der Google-Dienstkontoschlüssel (liegt bei Supabase)
- Der geheime Supabase-Schlüssel (`sb_secret_…`)

Der öffentliche Supabase-Schlüssel in `index.html` ist dafür gedacht,
öffentlich zu sein. Geschützt wird nicht durch ihn, sondern durch die
Rechte in der Datenbank.
