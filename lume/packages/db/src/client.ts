import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema.js";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export interface DbHandle {
  db: Db;
  migrate(): Promise<void>;
  close(): Promise<void>;
}

const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), "../migrations");

/**
 * Verbindung zur Datenbank.
 * - Mit `url` (z. B. Supabase Frankfurt): echte PostgreSQL-Datenbank.
 * - Ohne `url`: eingebaute PostgreSQL (PGlite) – im Ordner `dataDir` oder nur im Speicher.
 */
export function createDb(options: { url?: string; dataDir?: string } = {}): DbHandle {
  if (options.url) {
    const client = postgres(options.url, { max: 10 });
    const db = drizzlePostgres(client, { schema }) as unknown as Db;
    return {
      db,
      migrate: () => migratePostgres(drizzlePostgres(client), { migrationsFolder }),
      close: () => client.end(),
    };
  }
  if (options.dataDir) mkdirSync(options.dataDir, { recursive: true });
  const client = new PGlite({ dataDir: options.dataDir, extensions: { btree_gist } });
  const db = drizzlePglite(client, { schema }) as unknown as Db;
  return {
    db,
    migrate: () => migratePglite(drizzlePglite(client), { migrationsFolder }),
    close: () => client.close(),
  };
}
