import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { isModuleKey, MODULE_KEYS, MODULES } from "@lume/core";
import {
  eq,
  studioModules,
  studios,
} from "@lume/db";
import { requirePermission } from "../auth.js";
import { getStudio } from "../booking.js";
import type { AppEnv } from "../context.js";
import { notFound } from "../errors.js";
import { ModuleSchema, StudioSchema, StudioUpdateSchema } from "../schemas.js";
import { studioOut } from "../serialize.js";
import { body, errors, json, security } from "./helpers.js";

export const studioRoutes = new OpenAPIHono<AppEnv>();

studioRoutes.openapi(
  createRoute({
    method: "get",
    path: "/studio",
    tags: ["Studio"],
    summary: "Eigenes Studio abrufen",
    security,
    responses: { 200: json(StudioSchema, "Studio"), 401: errors[401] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "studio:read");
    return c.json(studioOut(await getStudio(c.get("db"), studioId)), 200);
  },
);

studioRoutes.openapi(
  createRoute({
    method: "patch",
    path: "/studio",
    tags: ["Studio"],
    summary: "Studio-Einstellungen ändern",
    security,
    request: body(StudioUpdateSchema),
    responses: { 200: json(StudioSchema, "Studio"), 400: errors[400], 403: errors[403] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "studio:admin");
    const [row] = await c
      .get("db")
      .update(studios)
      .set(c.req.valid("json"))
      .where(eq(studios.id, studioId))
      .returning();
    if (!row) throw notFound("Studio");
    return c.json(studioOut(row), 200);
  },
);

async function listModules(c: Parameters<typeof requirePermission>[0], studioId: string) {
  const rows = await c.get("db").select().from(studioModules).where(eq(studioModules.studioId, studioId));
  return MODULE_KEYS.map((key) => ({
    key,
    label: MODULES[key].label,
    alwaysOn: MODULES[key].alwaysOn,
    enabled: MODULES[key].alwaysOn || rows.some((r) => r.module === key && r.enabled),
  }));
}

studioRoutes.openapi(
  createRoute({
    method: "get",
    path: "/modules",
    tags: ["Studio"],
    summary: "Bausteine und ob sie eingeschaltet sind",
    security,
    responses: { 200: json(z.array(ModuleSchema), "Bausteine") },
  }),
  async (c) => {
    const studioId = requirePermission(c, "studio:read");
    return c.json(await listModules(c, studioId), 200);
  },
);

studioRoutes.openapi(
  createRoute({
    method: "put",
    path: "/modules/{key}",
    tags: ["Studio"],
    summary: "Baustein ein- oder ausschalten",
    security,
    request: {
      params: z.object({ key: z.string().openapi({ param: { name: "key", in: "path" }, example: "pos" }) }),
      ...body(z.object({ enabled: z.boolean() })),
    },
    responses: { 200: json(z.array(ModuleSchema), "Bausteine"), 403: errors[403], 404: errors[404] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "modules:write");
    const { key } = c.req.valid("param");
    if (!isModuleKey(key) || MODULES[key].alwaysOn) throw notFound("Baustein");
    const { enabled } = c.req.valid("json");
    await c
      .get("db")
      .insert(studioModules)
      .values({ studioId, module: key, enabled })
      .onConflictDoUpdate({ target: [studioModules.studioId, studioModules.module], set: { enabled } });
    return c.json(await listModules(c, studioId), 200);
  },
);
