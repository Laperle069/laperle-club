import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  and,
  appointments,
  asc,
  type Db,
  eq,
  services,
  studios,
} from "@lume/db";
import { bookAppointment, getAvailability } from "../booking.js";
import type { AppEnv } from "../context.js";
import { findOrCreateCustomer } from "../customers-lookup.js";
import { notFound } from "../errors.js";
import {
  AvailabilityQuery,
  AvailabilitySchema,
  PublicBookingResultSchema,
  PublicBookingSchema,
  PublicStudioSchema,
} from "../schemas.js";
import { loadAppointments, loadStaff } from "../serialize.js";
import { body, errors, json } from "./helpers.js";

/**
 * Öffentliche Buchung ohne Schlüssel: für die Buchungsseite des Studios,
 * die Kunden-App und den Marktplatz. Zeigt nur, was Kunden sehen dürfen.
 */
export const publicRoutes = new OpenAPIHono<AppEnv>();

const SlugParam = z.object({ slug: z.string().openapi({ param: { name: "slug", in: "path" }, example: "demo-studio" }) });

async function studioBySlug(db: Db, slug: string) {
  const [studio] = await db.select().from(studios).where(eq(studios.slug, slug)).limit(1);
  if (!studio) throw notFound("Studio");
  return studio;
}

publicRoutes.openapi(
  createRoute({
    method: "get",
    path: "/public/studios/{slug}",
    tags: ["Online-Buchung"],
    summary: "Studio mit online buchbaren Leistungen",
    request: { params: SlugParam },
    responses: { 200: json(PublicStudioSchema, "Studio"), 404: errors[404] },
  }),
  async (c) => {
    const db = c.get("db");
    const studio = await studioBySlug(db, c.req.valid("param").slug);
    const svc = await db
      .select()
      .from(services)
      .where(and(eq(services.studioId, studio.id), eq(services.active, true), eq(services.onlineBookable, true)))
      .orderBy(asc(services.category), asc(services.name));
    const staff = (await loadStaff(db, studio.id)).filter((s) => s.active);
    return c.json(
      {
        slug: studio.slug,
        name: studio.name,
        timezone: studio.timezone,
        services: svc.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          durationMin: s.durationMin,
          priceCents: s.priceCents,
        })),
        staff: staff.map((s) => ({ id: s.id, displayName: s.displayName, serviceIds: s.serviceIds })),
      },
      200,
    );
  },
);

publicRoutes.openapi(
  createRoute({
    method: "get",
    path: "/public/studios/{slug}/availability",
    tags: ["Online-Buchung"],
    summary: "Freie Termine (mit Vorlaufzeit des Studios)",
    request: { params: SlugParam, query: AvailabilityQuery },
    responses: { 200: json(AvailabilitySchema, "Freie Startzeiten"), 404: errors[404] },
  }),
  async (c) => {
    const db = c.get("db");
    const studio = await studioBySlug(db, c.req.valid("param").slug);
    return c.json(await getAvailability(db, studio.id, { ...c.req.valid("query"), onlineOnly: true }), 200);
  },
);

publicRoutes.openapi(
  createRoute({
    method: "post",
    path: "/public/studios/{slug}/bookings",
    tags: ["Online-Buchung"],
    summary: "Termin online buchen",
    request: { params: SlugParam, ...body(PublicBookingSchema) },
    responses: {
      201: json(PublicBookingResultSchema, "Gebucht"),
      400: errors[400],
      404: errors[404],
      409: errors[409],
    },
  }),
  async (c) => {
    const db = c.get("db");
    const studio = await studioBySlug(db, c.req.valid("param").slug);
    const input = c.req.valid("json");
    const customerId = await findOrCreateCustomer(db, studio.id, input.customer);
    const id = await bookAppointment(db, studio.id, {
      serviceId: input.serviceId,
      staffId: input.staffId,
      startsAt: new Date(input.startsAt),
      customerId,
      notes: input.notes,
      source: "online",
      onlineOnly: true,
    });
    const [a] = await loadAppointments(db, studio.id, eq(appointments.id, id));
    if (!a) throw notFound("Termin");
    return c.json(
      { id: a.id, startsAt: a.startsAt, endsAt: a.endsAt, serviceName: a.serviceName, staffName: a.staffName, status: a.status },
      201,
    );
  },
);
