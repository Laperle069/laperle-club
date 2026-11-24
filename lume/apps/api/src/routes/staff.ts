import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  and,
  type Db,
  eq,
  inArray,
  services,
  staffMembers,
  staffServices,
  timeOff,
  workingHours,
} from "@lume/db";
import { requirePermission } from "../auth.js";
import type { AppEnv } from "../context.js";
import { ApiError, notFound } from "../errors.js";
import {
  IdParam,
  StaffCreateSchema,
  StaffSchema,
  StaffUpdateSchema,
  TimeOffCreateSchema,
  TimeOffSchema,
} from "../schemas.js";
import { loadStaff } from "../serialize.js";
import { body, errors, json, security } from "./helpers.js";

export const staffRoutes = new OpenAPIHono<AppEnv>();

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

async function setServices(tx: Tx, studioId: string, staffId: string, serviceIds: string[]) {
  const unique = [...new Set(serviceIds)];
  if (unique.length > 0) {
    const found = await tx
      .select({ id: services.id })
      .from(services)
      .where(and(eq(services.studioId, studioId), inArray(services.id, unique)));
    if (found.length !== unique.length) throw new ApiError(422, "unknown_service", "Unbekannte Leistung");
  }
  await tx.delete(staffServices).where(eq(staffServices.staffId, staffId));
  if (unique.length > 0) {
    await tx.insert(staffServices).values(unique.map((serviceId) => ({ studioId, staffId, serviceId })));
  }
}

async function setHours(
  tx: Tx,
  studioId: string,
  staffId: string,
  hours: { weekday: number; start: string; end: string }[],
) {
  await tx.delete(workingHours).where(eq(workingHours.staffId, staffId));
  if (hours.length > 0) {
    await tx.insert(workingHours).values(
      hours.map((h) => ({ studioId, staffId, weekday: h.weekday, startTime: h.start, endTime: h.end })),
    );
  }
}

async function getOne(db: Db, studioId: string, id: string) {
  const [staff] = await loadStaff(db, studioId, [id]);
  if (!staff) throw notFound("Mitarbeiter");
  return staff;
}

staffRoutes.openapi(
  createRoute({
    method: "get",
    path: "/staff",
    tags: ["Mitarbeiter"],
    summary: "Alle Mitarbeiter mit Leistungen und Arbeitszeiten",
    security,
    responses: { 200: json(z.array(StaffSchema), "Mitarbeiter") },
  }),
  async (c) => {
    const studioId = requirePermission(c, "staff:read");
    return c.json(await loadStaff(c.get("db"), studioId), 200);
  },
);

staffRoutes.openapi(
  createRoute({
    method: "post",
    path: "/staff",
    tags: ["Mitarbeiter"],
    summary: "Mitarbeiter anlegen",
    security,
    request: body(StaffCreateSchema),
    responses: { 201: json(StaffSchema, "Angelegt"), 400: errors[400], 403: errors[403], 422: errors[422] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "staff:write");
    const input = c.req.valid("json");
    const db = c.get("db");
    const id = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(staffMembers)
        .values({
          studioId,
          displayName: input.displayName,
          email: input.email,
          phone: input.phone,
          ...(input.color ? { color: input.color } : {}),
        })
        .returning({ id: staffMembers.id });
      if (!row) throw new Error("Mitarbeiter nicht gespeichert");
      await setServices(tx, studioId, row.id, input.serviceIds);
      await setHours(tx, studioId, row.id, input.workingHours);
      return row.id;
    });
    return c.json(await getOne(db, studioId, id), 201);
  },
);

staffRoutes.openapi(
  createRoute({
    method: "patch",
    path: "/staff/{id}",
    tags: ["Mitarbeiter"],
    summary: "Mitarbeiter ändern (auch Leistungen und Arbeitszeiten)",
    security,
    request: { params: IdParam, ...body(StaffUpdateSchema) },
    responses: { 200: json(StaffSchema, "Geändert"), 400: errors[400], 404: errors[404], 422: errors[422] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "staff:write");
    const { id } = c.req.valid("param");
    const { serviceIds, workingHours: hours, ...fields } = c.req.valid("json");
    const db = c.get("db");
    await getOne(db, studioId, id);
    await db.transaction(async (tx) => {
      if (Object.keys(fields).length > 0) {
        await tx.update(staffMembers).set(fields).where(eq(staffMembers.id, id));
      }
      if (serviceIds) await setServices(tx, studioId, id, serviceIds);
      if (hours) await setHours(tx, studioId, id, hours);
    });
    return c.json(await getOne(db, studioId, id), 200);
  },
);

staffRoutes.openapi(
  createRoute({
    method: "post",
    path: "/staff/{id}/time-off",
    tags: ["Mitarbeiter"],
    summary: "Abwesenheit eintragen (Urlaub, Krankheit, Schulung)",
    security,
    request: { params: IdParam, ...body(TimeOffCreateSchema) },
    responses: { 201: json(TimeOffSchema, "Eingetragen"), 400: errors[400], 404: errors[404] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "staff:write");
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    const db = c.get("db");
    await getOne(db, studioId, id);
    const [row] = await db
      .insert(timeOff)
      .values({
        studioId,
        staffId: id,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        reason: input.reason,
      })
      .returning();
    if (!row) throw new Error("Abwesenheit nicht gespeichert");
    return c.json(
      {
        id: row.id,
        staffId: row.staffId,
        startsAt: row.startsAt.toISOString(),
        endsAt: row.endsAt.toISOString(),
        reason: row.reason,
      },
      201,
    );
  },
);
