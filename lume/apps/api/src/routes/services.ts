import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  and,
  asc,
  eq,
  services,
} from "@lume/db";
import { requirePermission } from "../auth.js";
import type { AppEnv } from "../context.js";
import { notFound } from "../errors.js";
import { IdParam, ServiceCreateSchema, ServiceSchema, ServiceUpdateSchema } from "../schemas.js";
import { serviceOut } from "../serialize.js";
import { body, errors, json, security } from "./helpers.js";

export const serviceRoutes = new OpenAPIHono<AppEnv>();

serviceRoutes.openapi(
  createRoute({
    method: "get",
    path: "/services",
    tags: ["Leistungen"],
    summary: "Alle Leistungen",
    security,
    responses: { 200: json(z.array(ServiceSchema), "Leistungen") },
  }),
  async (c) => {
    const studioId = requirePermission(c, "services:read");
    const rows = await c
      .get("db")
      .select()
      .from(services)
      .where(eq(services.studioId, studioId))
      .orderBy(asc(services.category), asc(services.name));
    return c.json(rows.map(serviceOut), 200);
  },
);

serviceRoutes.openapi(
  createRoute({
    method: "post",
    path: "/services",
    tags: ["Leistungen"],
    summary: "Leistung anlegen",
    security,
    request: body(ServiceCreateSchema),
    responses: { 201: json(ServiceSchema, "Angelegt"), 400: errors[400], 403: errors[403] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "services:write");
    const [row] = await c
      .get("db")
      .insert(services)
      .values({ ...c.req.valid("json"), studioId })
      .returning();
    if (!row) throw new Error("Leistung nicht gespeichert");
    return c.json(serviceOut(row), 201);
  },
);

serviceRoutes.openapi(
  createRoute({
    method: "patch",
    path: "/services/{id}",
    tags: ["Leistungen"],
    summary: "Leistung ändern",
    security,
    request: { params: IdParam, ...body(ServiceUpdateSchema) },
    responses: { 200: json(ServiceSchema, "Geändert"), 400: errors[400], 404: errors[404] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "services:write");
    const { id } = c.req.valid("param");
    const [row] = await c
      .get("db")
      .update(services)
      .set(c.req.valid("json"))
      .where(and(eq(services.id, id), eq(services.studioId, studioId)))
      .returning();
    if (!row) throw notFound("Leistung");
    return c.json(serviceOut(row), 200);
  },
);
