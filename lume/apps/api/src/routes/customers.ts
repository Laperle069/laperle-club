import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  and,
  asc,
  customers,
  eq,
  ilike,
  or,
} from "@lume/db";
import { requirePermission } from "../auth.js";
import type { AppEnv } from "../context.js";
import { ApiError, notFound, pgCode } from "../errors.js";
import { CustomerCreateSchema, CustomerSchema, CustomerUpdateSchema, IdParam } from "../schemas.js";
import { customerOut } from "../serialize.js";
import { body, errors, json, security } from "./helpers.js";

export const customerRoutes = new OpenAPIHono<AppEnv>();

const duplicateEmail = () =>
  new ApiError(409, "duplicate_email", "Es gibt schon eine Kundin mit dieser E-Mail-Adresse");

customerRoutes.openapi(
  createRoute({
    method: "get",
    path: "/customers",
    tags: ["Kunden"],
    summary: "Kunden suchen",
    security,
    request: {
      query: z.object({
        q: z.string().max(100).optional().openapi({ param: { name: "q", in: "query" }, description: "Name, E-Mail oder Telefon" }),
        limit: z.coerce.number().int().min(1).max(200).default(50).openapi({ param: { name: "limit", in: "query" } }),
      }),
    },
    responses: { 200: json(z.array(CustomerSchema), "Kunden") },
  }),
  async (c) => {
    const studioId = requirePermission(c, "customers:read");
    const { q, limit } = c.req.valid("query");
    const pattern = q ? `%${q.replace(/[%_\\]/g, (m) => `\\${m}`)}%` : undefined;
    const rows = await c
      .get("db")
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.studioId, studioId),
          pattern
            ? or(
                ilike(customers.firstName, pattern),
                ilike(customers.lastName, pattern),
                ilike(customers.email, pattern),
                ilike(customers.phone, pattern),
              )
            : undefined,
        ),
      )
      .orderBy(asc(customers.firstName), asc(customers.lastName))
      .limit(limit);
    return c.json(rows.map(customerOut), 200);
  },
);

customerRoutes.openapi(
  createRoute({
    method: "post",
    path: "/customers",
    tags: ["Kunden"],
    summary: "Kundin anlegen",
    security,
    request: body(CustomerCreateSchema),
    responses: { 201: json(CustomerSchema, "Angelegt"), 400: errors[400], 409: errors[409] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "customers:write");
    try {
      const [row] = await c
        .get("db")
        .insert(customers)
        .values({ ...c.req.valid("json"), studioId })
        .returning();
      if (!row) throw new Error("Kundin nicht gespeichert");
      return c.json(customerOut(row), 201);
    } catch (err) {
      if (pgCode(err) === "23505") throw duplicateEmail();
      throw err;
    }
  },
);

customerRoutes.openapi(
  createRoute({
    method: "get",
    path: "/customers/{id}",
    tags: ["Kunden"],
    summary: "Kundin abrufen",
    security,
    request: { params: IdParam },
    responses: { 200: json(CustomerSchema, "Kundin"), 404: errors[404] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "customers:read");
    const [row] = await c
      .get("db")
      .select()
      .from(customers)
      .where(and(eq(customers.id, c.req.valid("param").id), eq(customers.studioId, studioId)));
    if (!row) throw notFound("Kundin");
    return c.json(customerOut(row), 200);
  },
);

customerRoutes.openapi(
  createRoute({
    method: "patch",
    path: "/customers/{id}",
    tags: ["Kunden"],
    summary: "Kundin ändern",
    security,
    request: { params: IdParam, ...body(CustomerUpdateSchema) },
    responses: { 200: json(CustomerSchema, "Geändert"), 404: errors[404], 409: errors[409] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "customers:write");
    try {
      const [row] = await c
        .get("db")
        .update(customers)
        .set(c.req.valid("json"))
        .where(and(eq(customers.id, c.req.valid("param").id), eq(customers.studioId, studioId)))
        .returning();
      if (!row) throw notFound("Kundin");
      return c.json(customerOut(row), 200);
    } catch (err) {
      if (pgCode(err) === "23505") throw duplicateEmail();
      throw err;
    }
  },
);
