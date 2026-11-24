import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  and,
  appointments,
  eq,
  gt,
  lt,
  notInArray,
} from "@lume/db";
import { requirePermission } from "../auth.js";
import { bookAppointment, getAvailability, rescheduleAppointment } from "../booking.js";
import type { AppEnv } from "../context.js";
import { findOrCreateCustomer } from "../customers-lookup.js";
import { ApiError, notFound } from "../errors.js";
import {
  AppointmentCreateSchema,
  AppointmentListQuery,
  AppointmentSchema,
  AppointmentUpdateSchema,
  AvailabilityQuery,
  AvailabilitySchema,
  IdParam,
  RescheduleSchema,
} from "../schemas.js";
import { loadAppointments } from "../serialize.js";
import { body, errors, json, security } from "./helpers.js";

export const appointmentRoutes = new OpenAPIHono<AppEnv>();

async function getOne(c: { get: (k: "db") => import("@lume/db").Db }, studioId: string, id: string) {
  const [row] = await loadAppointments(c.get("db"), studioId, eq(appointments.id, id));
  if (!row) throw notFound("Termin");
  return row;
}

appointmentRoutes.openapi(
  createRoute({
    method: "get",
    path: "/availability",
    tags: ["Termine"],
    summary: "Freie Termine für eine Leistung an einem Tag",
    security,
    request: { query: AvailabilityQuery },
    responses: { 200: json(AvailabilitySchema, "Freie Startzeiten"), 404: errors[404], 422: errors[422] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "appointments:read");
    return c.json(await getAvailability(c.get("db"), studioId, c.req.valid("query")), 200);
  },
);

appointmentRoutes.openapi(
  createRoute({
    method: "get",
    path: "/appointments",
    tags: ["Termine"],
    summary: "Termine in einem Zeitraum",
    security,
    request: { query: AppointmentListQuery },
    responses: { 200: json(z.array(AppointmentSchema), "Termine"), 400: errors[400] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "appointments:read");
    const q = c.req.valid("query");
    const from = new Date(q.from);
    const to = new Date(q.to);
    if (to.getTime() - from.getTime() > 62 * 24 * 3600_000 || to <= from) {
      throw new ApiError(400, "invalid_range", "Zeitraum muss zwischen 0 und 62 Tagen liegen");
    }
    const rows = await loadAppointments(
      c.get("db"),
      studioId,
      and(
        lt(appointments.startsAt, to),
        gt(appointments.endsAt, from),
        q.staffId ? eq(appointments.staffId, q.staffId) : undefined,
        q.customerId ? eq(appointments.customerId, q.customerId) : undefined,
        q.includeCancelled === "true" ? undefined : notInArray(appointments.status, ["cancelled"]),
      ),
    );
    return c.json(rows, 200);
  },
);

appointmentRoutes.openapi(
  createRoute({
    method: "post",
    path: "/appointments",
    tags: ["Termine"],
    summary: "Termin buchen",
    description:
      "Prüft Arbeitszeiten, Abwesenheiten und bestehende Termine. Ohne staffId wählt Lumé eine freie Mitarbeiterin.",
    security,
    request: body(AppointmentCreateSchema),
    responses: {
      201: json(AppointmentSchema, "Gebucht"),
      400: errors[400],
      404: errors[404],
      409: errors[409],
      422: errors[422],
    },
  }),
  async (c) => {
    const studioId = requirePermission(c, "appointments:write");
    const input = c.req.valid("json");
    const db = c.get("db");
    const customerId =
      input.customerId ?? (await findOrCreateCustomer(db, studioId, input.customer!));
    const id = await bookAppointment(db, studioId, {
      serviceId: input.serviceId,
      staffId: input.staffId,
      startsAt: new Date(input.startsAt),
      customerId,
      notes: input.notes,
      source: input.source,
      ignoreWorkingHours: input.ignoreWorkingHours,
    });
    return c.json(await getOne(c, studioId, id), 201);
  },
);

appointmentRoutes.openapi(
  createRoute({
    method: "get",
    path: "/appointments/{id}",
    tags: ["Termine"],
    summary: "Termin abrufen",
    security,
    request: { params: IdParam },
    responses: { 200: json(AppointmentSchema, "Termin"), 404: errors[404] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "appointments:read");
    return c.json(await getOne(c, studioId, c.req.valid("param").id), 200);
  },
);

appointmentRoutes.openapi(
  createRoute({
    method: "patch",
    path: "/appointments/{id}",
    tags: ["Termine"],
    summary: "Status oder Notiz ändern (bestätigt, erledigt, nicht erschienen)",
    security,
    request: { params: IdParam, ...body(AppointmentUpdateSchema) },
    responses: { 200: json(AppointmentSchema, "Geändert"), 404: errors[404], 409: errors[409] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "appointments:write");
    const { id } = c.req.valid("param");
    const current = await getOne(c, studioId, id);
    if (current.status === "cancelled") {
      throw new ApiError(409, "invalid_state", "Abgesagte Termine können nicht geändert werden");
    }
    const patch = c.req.valid("json");
    if (patch.status === "no_show" && new Date(current.startsAt) > new Date()) {
      // Sonst würde die Zeit frei und könnte doppelt vergeben werden
      throw new ApiError(409, "invalid_state", "\"Nicht erschienen\" geht erst ab Terminbeginn");
    }
    if (Object.keys(patch).length > 0) {
      await c.get("db").update(appointments).set(patch).where(eq(appointments.id, id));
    }
    return c.json(await getOne(c, studioId, id), 200);
  },
);

appointmentRoutes.openapi(
  createRoute({
    method: "post",
    path: "/appointments/{id}/reschedule",
    tags: ["Termine"],
    summary: "Termin verschieben",
    security,
    request: { params: IdParam, ...body(RescheduleSchema) },
    responses: { 200: json(AppointmentSchema, "Verschoben"), 404: errors[404], 409: errors[409] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "appointments:write");
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    await rescheduleAppointment(c.get("db"), studioId, id, { ...input, startsAt: new Date(input.startsAt) });
    return c.json(await getOne(c, studioId, id), 200);
  },
);

appointmentRoutes.openapi(
  createRoute({
    method: "post",
    path: "/appointments/{id}/cancel",
    tags: ["Termine"],
    summary: "Termin absagen",
    security,
    request: { params: IdParam },
    responses: { 200: json(AppointmentSchema, "Abgesagt"), 404: errors[404], 409: errors[409] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "appointments:write");
    const { id } = c.req.valid("param");
    const current = await getOne(c, studioId, id);
    if (current.status === "completed") {
      throw new ApiError(409, "invalid_state", "Erledigte Termine können nicht abgesagt werden");
    }
    if (current.status !== "cancelled") {
      await c
        .get("db")
        .update(appointments)
        .set({ status: "cancelled", cancelledAt: new Date() })
        .where(eq(appointments.id, id));
    }
    return c.json(await getOne(c, studioId, id), 200);
  },
);
