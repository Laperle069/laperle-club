import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { ROLE_RANK } from "@lume/core";
import { and, apiKeys, desc, eq, generateToken, hashToken, isNull, type Db } from "@lume/db";
import { requirePermission } from "../auth.js";
import type { AppEnv } from "../context.js";
import { ApiError, notFound } from "../errors.js";
import { ApiKeyCreatedSchema, ApiKeyCreateSchema, ApiKeySchema, IdParam } from "../schemas.js";
import { body, errors, json, security } from "./helpers.js";

/**
 * API-Schlüssel für Programme, Partner und KI-Agenten. Der vollständige Schlüssel
 * wird nur beim Anlegen einmal gezeigt; gespeichert wird nur sein Hash.
 */
export const apiKeyRoutes = new OpenAPIHono<AppEnv>();

const KEY_PREFIX = "lume_live";
const VISIBLE_CHARS = KEY_PREFIX.length + 7;

type ApiKeyRow = typeof apiKeys.$inferSelect;
const out = (k: ApiKeyRow) => ({
  id: k.id,
  name: k.name,
  prefix: k.prefix,
  role: k.role,
  createdAt: k.createdAt.toISOString(),
  lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
  revokedAt: k.revokedAt ? k.revokedAt.toISOString() : null,
});

async function list(db: Db, studioId: string) {
  const rows = await db.select().from(apiKeys).where(eq(apiKeys.studioId, studioId)).orderBy(desc(apiKeys.createdAt));
  return rows.map(out);
}

apiKeyRoutes.openapi(
  createRoute({
    method: "get",
    path: "/api-keys",
    tags: ["API-Schlüssel"],
    summary: "Alle Schlüssel des Studios (ohne den geheimen Teil)",
    security,
    responses: { 200: json(z.array(ApiKeySchema), "Schlüssel"), 403: errors[403] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "api_keys:manage");
    return c.json(await list(c.get("db"), studioId), 200);
  },
);

apiKeyRoutes.openapi(
  createRoute({
    method: "post",
    path: "/api-keys",
    tags: ["API-Schlüssel"],
    summary: "Neuen Schlüssel anlegen",
    description: "Die Rolle bestimmt, was der Schlüssel darf. Sie kann nicht höher sein als die eigene.",
    security,
    request: body(ApiKeyCreateSchema),
    responses: { 201: json(ApiKeyCreatedSchema, "Angelegt"), 400: errors[400], 403: errors[403] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "api_keys:manage");
    const input = c.req.valid("json");
    const auth = c.get("auth");
    if (ROLE_RANK[input.role] > ROLE_RANK[auth.role]) {
      throw new ApiError(403, "forbidden", "Diese Rolle darfst du nicht vergeben");
    }
    const key = generateToken(KEY_PREFIX);
    const [row] = await c
      .get("db")
      .insert(apiKeys)
      .values({
        studioId,
        name: input.name,
        prefix: key.slice(0, VISIBLE_CHARS),
        hash: hashToken(key),
        role: input.role,
        createdByUserId: auth.userId,
      })
      .returning();
    if (!row) throw new Error("Schlüssel nicht gespeichert");
    return c.json({ ...out(row), key }, 201);
  },
);

apiKeyRoutes.openapi(
  createRoute({
    method: "delete",
    path: "/api-keys/{id}",
    tags: ["API-Schlüssel"],
    summary: "Schlüssel sperren (wirkt sofort, nicht umkehrbar)",
    security,
    request: { params: IdParam },
    responses: { 200: json(z.array(ApiKeySchema), "Schlüssel"), 403: errors[403], 404: errors[404], 409: errors[409] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "api_keys:manage");
    const { id } = c.req.valid("param");
    const auth = c.get("auth");
    if (auth.kind === "api_key" && auth.apiKeyId === id) {
      throw new ApiError(409, "self_revoke", "Ein Schlüssel kann sich nicht selbst sperren");
    }
    const db = c.get("db");
    const [row] = await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.studioId, studioId), isNull(apiKeys.revokedAt)))
      .returning({ id: apiKeys.id });
    if (!row) {
      const [exists] = await db
        .select({ id: apiKeys.id })
        .from(apiKeys)
        .where(and(eq(apiKeys.id, id), eq(apiKeys.studioId, studioId)));
      if (!exists) throw notFound("Schlüssel");
    }
    return c.json(await list(db, studioId), 200);
  },
);
