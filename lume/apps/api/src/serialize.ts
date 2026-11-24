import {
  and,
  appointments,
  asc,
  type Customer,
  customers,
  type Db,
  eq,
  inArray,
  type Service,
  services,
  type SQL,
  staffMembers,
  staffServices,
  type Studio,
  workingHours,
} from "@lume/db";

/** Datenbankzeilen in API-Antworten umwandeln (Datumswerte als ISO-Text). */

const iso = (d: Date) => d.toISOString();

export const studioOut = (s: Studio) => ({
  id: s.id,
  slug: s.slug,
  name: s.name,
  timezone: s.timezone,
  currency: s.currency,
  plan: s.plan,
  bookingLeadMin: s.bookingLeadMin,
  slotStepMin: s.slotStepMin,
});

export const serviceOut = (s: Service) => ({
  id: s.id,
  name: s.name,
  description: s.description,
  category: s.category,
  durationMin: s.durationMin,
  bufferAfterMin: s.bufferAfterMin,
  priceCents: s.priceCents,
  active: s.active,
  onlineBookable: s.onlineBookable,
});

export const customerOut = (c: Customer) => ({
  id: c.id,
  firstName: c.firstName,
  lastName: c.lastName,
  email: c.email,
  phone: c.phone,
  notes: c.notes,
  marketingConsent: c.marketingConsent,
  createdAt: iso(c.createdAt),
});

export async function loadStaff(db: Db, studioId: string, ids?: string[]) {
  const where = and(eq(staffMembers.studioId, studioId), ids ? inArray(staffMembers.id, ids) : undefined);
  const rows = await db.select().from(staffMembers).where(where).orderBy(asc(staffMembers.displayName));
  if (rows.length === 0) return [];
  const staffIds = rows.map((r) => r.id);
  const [links, hours] = await Promise.all([
    db.select().from(staffServices).where(inArray(staffServices.staffId, staffIds)),
    db
      .select()
      .from(workingHours)
      .where(inArray(workingHours.staffId, staffIds))
      .orderBy(asc(workingHours.weekday), asc(workingHours.startTime)),
  ]);
  return rows.map((s) => ({
    id: s.id,
    displayName: s.displayName,
    email: s.email,
    phone: s.phone,
    color: s.color,
    active: s.active,
    serviceIds: links.filter((l) => l.staffId === s.id).map((l) => l.serviceId),
    workingHours: hours
      .filter((h) => h.staffId === s.id)
      .map((h) => ({ weekday: h.weekday, start: h.startTime.slice(0, 5), end: h.endTime.slice(0, 5) })),
  }));
}

export async function loadAppointments(db: Db, studioId: string, where?: SQL) {
  const rows = await db
    .select({
      a: appointments,
      staffName: staffMembers.displayName,
      serviceName: services.name,
      firstName: customers.firstName,
      lastName: customers.lastName,
    })
    .from(appointments)
    .innerJoin(staffMembers, eq(staffMembers.id, appointments.staffId))
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .innerJoin(customers, eq(customers.id, appointments.customerId))
    .where(and(eq(appointments.studioId, studioId), where))
    .orderBy(asc(appointments.startsAt));
  return rows.map(({ a, staffName, serviceName, firstName, lastName }) => ({
    id: a.id,
    staffId: a.staffId,
    staffName,
    customerId: a.customerId,
    customerName: [firstName, lastName].filter(Boolean).join(" "),
    serviceId: a.serviceId,
    serviceName,
    startsAt: iso(a.startsAt),
    endsAt: iso(a.endsAt),
    status: a.status,
    source: a.source,
    priceCents: a.priceCents,
    notes: a.notes,
    createdAt: iso(a.createdAt),
    cancelledAt: a.cancelledAt ? iso(a.cancelledAt) : null,
  }));
}
