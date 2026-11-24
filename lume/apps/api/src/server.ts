import { resolve } from "node:path";
import { serve } from "@hono/node-server";
import { createDb, seedDemo } from "@lume/db";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 4000);
const isProduction = process.env.NODE_ENV === "production";

const handle = createDb({
  url: process.env.DATABASE_URL,
  dataDir: process.env.DATABASE_URL ? undefined : resolve(import.meta.dirname, "../../../.data/pglite"),
});
await handle.migrate();

if (!isProduction && process.env.LUME_DEMO_SEED !== "0") {
  const key = process.env.LUME_DEV_API_KEY ?? "lume_dev_nur_lokal_demo_schluessel";
  const { created } = await seedDemo(handle.db, key, {
    email: process.env.LUME_DEV_EMAIL ?? "demo@lume.local",
    password: process.env.LUME_DEV_PASSWORD ?? "demo-passwort-lokal",
  });
  if (created) console.log("Demo-Studio angelegt (nur lokal).");
}

const server = serve({ fetch: createApp({ db: handle.db }).fetch, port }, () => {
  console.log(`Lumé API läuft auf http://localhost:${port}  (Beschreibung: /v1/openapi.json)`);
});

const shutdown = async () => {
  server.close();
  await handle.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
