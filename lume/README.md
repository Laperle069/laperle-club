# Lumé – Buchungssystem für Beauty-Studios

Arbeitsname **Lumé**. Eigenständiges Produkt, unabhängig vom La-Perle-Club in
diesem Repository. Alles zu Lumé liegt nur in diesem Ordner `lume/`.

> Stand: **Grundgerüst** (Schritt 1). Läuft nur lokal, keine Live-Dienste,
> keine echten Kundendaten.

## Was schon da ist

| Teil | Ordner | Was es macht |
|---|---|---|
| API | `apps/api` | Die zentrale Schnittstelle. Alles läuft darüber: Backoffice, Apps, Partner, KI-Agenten. Beschreibung unter `/v1/openapi.json`. |
| Backoffice | `apps/backoffice` | Web-Oberfläche für Inhaber: Übersicht, Kalender, Termin buchen, Kunden, Leistungen, Mitarbeiter, Bausteine. |
| MCP-Server | `apps/mcp` | Lässt KI-Assistenten (z. B. Claude) freie Termine finden, buchen und absagen. |
| Datenbank | `packages/db` | Datenmodell (PostgreSQL) mit Studios, Mitarbeitern, Leistungen, Kunden, Terminen, Rollen, Bausteinen. |
| Kernlogik | `packages/core` | Freie Termine berechnen, Rollen und Rechte, Bausteine und Studio-Vorlagen. |

Wichtige Eigenschaften:

- **Mandantenfähig:** viele Studios in einer Datenbank, strikt getrennt. Jeder Schlüssel sieht nur sein Studio.
- **Keine Doppelbuchungen:** die Datenbank selbst verhindert überlappende Termine (inklusive Puffer), auch bei gleichzeitigen Buchungen.
- **Rollen:** Inhaber, Leitung, Empfang, Mitarbeiter – mit unterschiedlichen Rechten.
- **Bausteine:** Kasse, Abos und Club, Marketing, Buchhaltung usw. lassen sich je Studio ein- und ausschalten (Inhalte folgen).
- **Online-Buchung ohne Schlüssel:** `/v1/public/studios/{slug}` für Buchungsseite, Kunden-App und Marktplatz.
- **Sommer-/Winterzeit** wird korrekt berücksichtigt.

## Lokal starten

Voraussetzung: Node.js 22 und pnpm.

```bash
cd lume
cp .env.example .env
pnpm install
pnpm dev
```

- Backoffice: http://localhost:3000
- API: http://localhost:4000 (Beschreibung: http://localhost:4000/v1/openapi.json)

Beim ersten Start legt Lumé ein erfundenes **Demo Studio** mit zwei Mitarbeiterinnen,
vier Leistungen und zwei Terminen an. Die Daten liegen in `lume/.data/` (eingebaute
PostgreSQL, nichts zu installieren). Ordner löschen = frisch anfangen.

Für eine echte PostgreSQL-Datenbank: `docker compose up -d` und in `.env`
`DATABASE_URL` setzen. Später zeigt `DATABASE_URL` auf Supabase (Frankfurt).

## Prüfen

```bash
pnpm test        # Tests für Kernlogik, API und MCP-Server
pnpm typecheck   # Typprüfung aller Teile
```

## MCP-Server mit Claude nutzen (lokal)

API starten, dann in der MCP-Konfiguration von Claude eintragen:

```json
{
  "mcpServers": {
    "lume": {
      "command": "pnpm",
      "args": ["--dir", "/PFAD/ZU/laperle-club/lume/apps/mcp", "start"],
      "env": { "LUME_API_URL": "http://localhost:4000", "LUME_API_KEY": "lume_dev_nur_lokal_demo_schluessel" }
    }
  }
}
```

## Technik

TypeScript überall · API mit Hono und automatischer OpenAPI-Beschreibung ·
PostgreSQL mit Drizzle (Migrationen in `packages/db/migrations`) ·
Next.js fürs Backoffice · Vitest für Tests. Pakete werden erst installiert,
wenn sie mindestens 14 Tage veröffentlicht sind (Schutz vor manipulierten Paketen).

Mehr Details: [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md)
