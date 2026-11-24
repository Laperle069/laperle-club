# Architektur von Lumé

## Grundsatz: API zuerst

Es gibt genau eine Schnittstelle (`apps/api`). Backoffice, Mitarbeiter-App,
Kunden-App, Partner-Integrationen und KI-Agenten (über den MCP-Server) nutzen
dieselbe API mit denselben Regeln. Nichts greift an der API vorbei auf die
Datenbank zu. So ist jede Funktion automatisch auch per API und MCP verfügbar.

```
Backoffice (Next.js) ─┐
Mitarbeiter-App ──────┤
Kunden-App/Marktplatz ┼──► Lumé-API (Hono, OpenAPI) ──► PostgreSQL
Partner / Zapier ─────┤        │
KI-Agenten (MCP) ─────┘        └── Kernlogik (@lume/core)
```

## Mandanten, Rollen, Bausteine

- Jede Tabelle mit Studio-Daten hat `studio_id`. Die API liest die Studio-ID nur
  aus dem Schlüssel, nie aus der Anfrage. Ein Studio kann fremde Daten weder
  lesen noch verändern (Test: „trennt Studios strikt voneinander“).
- Rollen und Rechte stehen an einer Stelle: `packages/core/src/roles.ts`.
- Bausteine und Studio-Vorlagen: `packages/core/src/modules.ts`. Neue Bausteine
  prüfen später per `studio_modules`, ob sie eingeschaltet sind.

## Anmeldung

- Menschen melden sich mit E-Mail und Passwort an (`POST /v1/auth/login`) und
  erhalten ein Sitzungs-Token (`lume_sess_…`). Programme nutzen API-Schlüssel
  (`lume_live_…`). Beides wird nur als SHA-256-Hash gespeichert, Passwörter mit scrypt.
- Eine Sitzung gilt für ein Studio. Die Rolle wird bei jeder Anfrage frisch aus der
  Mitgliedschaft gelesen: Rolle ändern oder Zugang entziehen wirkt sofort.
- Das Backoffice legt das Token in ein httpOnly-Cookie; Browser-JavaScript sieht es nie.
  `proxy.ts` schickt Besucher ohne Cookie zur Anmeldung, die API prüft die Gültigkeit.
- Die Bremse gegen Passwort-Raten liegt im Speicher des API-Servers. Bei mehreren
  Servern muss sie in die Datenbank oder Redis.

## Termine

- Freie Zeiten rechnet `computeAvailability` (reine Funktion, getestet):
  Arbeitszeiten je Wochentag (mehrere Blöcke = Pausen), minus Termine inklusive
  Puffer, minus Abwesenheiten, im Raster des Studios, ab Vorlaufzeit.
- Beim Buchen prüft die API dasselbe noch einmal. Zusätzlich verhindert eine
  Ausschluss-Regel in PostgreSQL (`appointments_no_overlap`) Überschneidungen,
  selbst wenn zwei Buchungen in derselben Millisekunde eintreffen.
- Geld immer in Cent (ganze Zahlen), Zeiten immer mit Zeitzone gespeichert.

## Datenbank

- Schema: `packages/db/src/schema.ts`, Migrationen: `packages/db/migrations`.
- Neue Migration nach Schemaänderung: `pnpm db:generate`.
- Lokal ohne Installation: PGlite (echtes PostgreSQL als WebAssembly).
  Produktion: PostgreSQL bei Supabase in Frankfurt.

## Bewusst noch nicht enthalten (nächste Schritte)

- Passwort vergessen und Einladung per E-Mail (braucht einen E-Mail-Dienst),
  Zwei-Faktor-Anmeldung.
- Webhooks, Ratenbegrenzung der öffentlichen Buchung.
- Benachrichtigungen (E-Mail, SMS, Push), Stornoregeln, Anzahlungen.
- Zeilenbasierte Sicherheit (Row Level Security) als zweite Schutzschicht in Supabase.
- Kasse (fiskaly-TSE, DSFinV-K), Stripe Connect, Abos/Club, Wallet, Marketing,
  Buchhaltung, Lager, Zeiterfassung, KI-Assistent, Apps (Expo).
