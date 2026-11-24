import { OpenAPIHono } from "@hono/zod-openapi";
import type { Db } from "@lume/db";
import { cors } from "hono/cors";
import { requireApiKey } from "./auth.js";
import type { AppEnv } from "./context.js";
import { errorResponse } from "./errors.js";
import { appointmentRoutes } from "./routes/appointments.js";
import { customerRoutes } from "./routes/customers.js";
import { publicRoutes } from "./routes/public.js";
import { serviceRoutes } from "./routes/services.js";
import { staffRoutes } from "./routes/staff.js";
import { studioRoutes } from "./routes/studio.js";

export { bookAppointment, getAvailability } from "./booking.js";

/** Die Lumé-API. Alles läuft über diese eine Schnittstelle: Backoffice, Apps, Partner und KI-Agenten. */
export function createApp({ db }: { db: Db }) {
  const app = new OpenAPIHono<AppEnv>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            error: {
              code: "validation_error",
              message: "Eingaben ungültig",
              details: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
            },
          },
          400,
        );
      }
    },
  });

  app.onError(errorResponse);
  app.notFound((c) => c.json({ error: { code: "not_found", message: "Adresse nicht gefunden" } }, 404));
  app.use("*", async (c, next) => {
    c.set("db", db);
    await next();
  });

  app.get("/health", (c) => c.json({ ok: true }));

  // Öffentlich (Buchungsseite, Kunden-App, Marktplatz)
  app.use("/v1/public/*", cors());
  app.route("/v1", publicRoutes);

  // Alles andere nur mit API-Schlüssel
  const privateApi = new OpenAPIHono<AppEnv>({ defaultHook: app.defaultHook });
  privateApi.use("*", requireApiKey);
  privateApi.route("/", studioRoutes);
  privateApi.route("/", staffRoutes);
  privateApi.route("/", serviceRoutes);
  privateApi.route("/", customerRoutes);
  privateApi.route("/", appointmentRoutes);

  app.openAPIRegistry.registerComponent("securitySchemes", "apiKey", {
    type: "http",
    scheme: "bearer",
    description: "API-Schlüssel des Studios, z. B. lume_live_…",
  });
  app.doc31("/v1/openapi.json", {
    openapi: "3.1.0",
    info: {
      title: "Lumé API",
      version: "0.1.0",
      description: "Offene Schnittstelle für Studios, Partner und KI-Agenten.",
    },
  });
  // Muss nach doc31 stehen, sonst greift der Schlüssel-Check auch auf openapi.json
  app.route("/v1", privateApi);

  return app;
}
