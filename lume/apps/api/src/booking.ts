import {
  addMinutes,
  computeAvailability,
  isStaffFree,
  type StaffAvailabilityInput,
  type WorkingHoursRule,
} from "@lume/core";
import {
  and,
  appointments,
  customers,
  type Db,
  eq,
  gt,
  inArray,
  lt,
  notInArray,
  services,
  staffMembers,
  staffServices,
  type Studio,
  studios,
  timeOff,
  workingHours,
} from "@lume/db";
import { DateTime } from "luxon";
import { ApiError, notFound, pgCode } from "./errors.js";

/** Kernlogik der Terminbuchung – genutzt von Backoffice, öffentlicher Buchung, API und Agenten. */

const INACTIVE_STATUSES = ["cancelled", "no_show"] as const;

export async function getStudio(db: Db, studioId: string): Promise<Studio> {
  const [studio] = await db.select().from(studios).where(eq(studios.id, studioId)).limit(1);
  if (!studio) throw notFound("Studio");
  return studio;
}

async function getService(db: Db, studioId: string, serviceId: string) {
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.studioId, studioId)))
    .limit(1);
  if (!service || !service.active) throw notFound("Leistung");
  return service;
}

/** Aktive Mitarbeiter, die diese Leistung anbieten (optional nur eine bestimmte). */
async function eligibleStaff(db: Db, studioId: string, serviceId: string, staffId?: string) {
  const rows = await db
    .select({ id: staffMembers.id, displayName: staffMembers.displayName })
    .from(staffServices)
    .innerJoin(staffMembers, eq(staffMembers.id, staffServices.staffId))
    .where(
      and(
        eq(staffServices.studioId, studioId),
        eq(staffServices.serviceId, serviceId),
        eq(staffMembers.active, true),
        ...(staffId ? [eq(staffMembers.id, staffId)] : []),
      ),
    )
    .orderBy(staffMembers.displayName);
  if (staffId && rows.length === 0) {
    throw new ApiError(422, "staff_not_eligible", "Diese Mitarbeiterin bietet die Leistung nicht an");
  }
  return rows;
}

/** Arbeitszeiten und belegte Zeiten im Zeitraum laden. */
async function loadStaffCalendars(
  db: Db,
  studioId: string,
  staffIds: string[],
  range: { start: Date; end: Date },
  excludeAppointmentId?: string,
): Promise<StaffAvailabilityInput[]> {
  if (staffIds.length === 0) return [];
  const [hours, booked, absences] = await Promise.all([
    db
      .select()
      .from(workingHours)
      .where(and(eq(workingHours.studioId, studioId), inArray(workingHours.staffId, staffIds))),
    db
      .select({
        id: appointments.id,
        staffId: appointments.staffId,
        start: appointments.startsAt,
        end: appointments.blockedUntil,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.studioId, studioId),
          inArray(appointments.staffId, staffIds),
          notInArray(appointments.status, [...INACTIVE_STATUSES]),
          lt(appointments.startsAt, range.end),
          gt(appointments.blockedUntil, range.start),
        ),
      ),
    db
      .select()
      .from(timeOff)
      .where(
        and(
          eq(timeOff.studioId, studioId),
          inArray(timeOff.staffId, staffIds),
          lt(timeOff.startsAt, range.end),
          gt(timeOff.endsAt, range.start),
        ),
      ),
  ]);
  return staffIds.map((staffId) => ({
    staffId,
    workingHours: hours
      .filter((h) => h.staffId === staffId)
      .map<WorkingHoursRule>((h) => ({
        weekday: h.weekday,
        start: h.startTime.slice(0, 5),
        end: h.endTime.slice(0, 5),
      })),
    busy: [
      ...booked
        .filter((a) => a.staffId === staffId && a.id !== excludeAppointmentId)
        .map((a) => ({ start: a.start, end: a.end })),
      ...absences.filter((t) => t.staffId === staffId).map((t) => ({ start: t.startsAt, end: t.endsAt })),
    ],
  }));
}

function dayRange(date: string, timezone: string) {
  const day = DateTime.fromISO(date, { zone: timezone }).startOf("day");
  return { start: day.toJSDate(), end: day.plus({ days: 1 }).toJSDate() };
}

export async function getAvailability(
  db: Db,
  studioId: string,
  query: { serviceId: string; date: string; staffId?: string; onlineOnly?: boolean },
  now = new Date(),
) {
  const studio = await getStudio(db, studioId);
  const service = await getService(db, studioId, query.serviceId);
  if (query.onlineOnly && !service.onlineBookable) throw notFound("Leistung");
  const staff = await eligibleStaff(db, studioId, service.id, query.staffId);
  const calendars = await loadStaffCalendars(
    db,
    studioId,
    staff.map((s) => s.id),
    dayRange(query.date, studio.timezone),
  );
  const slots = computeAvailability({
    date: query.date,
    timezone: studio.timezone,
    durationMin: service.durationMin,
    bufferAfterMin: service.bufferAfterMin,
    stepMin: studio.slotStepMin,
    notBefore: query.onlineOnly ? addMinutes(now, studio.bookingLeadMin) : now,
    staff: calendars,
  });
  return {
    date: query.date,
    timezone: studio.timezone,
    serviceId: service.id,
    slots: slots.map((s) => ({
      startsAt: s.start.toISOString(),
      endsAt: s.end.toISOString(),
      staffIds: s.staffIds,
    })),
  };
}

export interface BookInput {
  serviceId: string;
  staffId?: string;
  startsAt: Date;
  customerId: string;
  notes?: string;
  source: "backoffice" | "online" | "api" | "assistant";
  ignoreWorkingHours?: boolean;
  onlineOnly?: boolean;
}

/** Alle freien, passenden Mitarbeiterinnen für genau diesen Zeitpunkt (in fester Reihenfolge). */
async function freeStaff(
  db: Db,
  studio: Studio,
  service: { id: string; durationMin: number; bufferAfterMin: number },
  startsAt: Date,
  options: { staffId?: string; ignoreWorkingHours?: boolean; excludeAppointmentId?: string },
) {
  const staff = await eligibleStaff(db, studio.id, service.id, options.staffId);
  const blockedUntil = addMinutes(startsAt, service.durationMin + service.bufferAfterMin);
  const calendars = await loadStaffCalendars(
    db,
    studio.id,
    staff.map((s) => s.id),
    { start: addMinutes(startsAt, -24 * 60), end: addMinutes(blockedUntil, 24 * 60) },
    options.excludeAppointmentId,
  );
  const free = calendars.filter((cal) =>
    isStaffFree(cal, studio.timezone, startsAt, service.durationMin, service.bufferAfterMin, {
      ignoreWorkingHours: options.ignoreWorkingHours,
    }),
  );
  if (free.length === 0) throw slotUnavailable();
  return free.map((f) => f.staffId);
}

const slotUnavailable = () => new ApiError(409, "slot_unavailable", "Dieser Termin ist nicht mehr frei");

/**
 * Versucht die Kandidaten der Reihe nach. Greift die Datenbank-Sperre gegen
 * Überschneidungen (gleichzeitige Buchung), kommt die nächste freie Person dran.
 */
async function withFirstAvailable<T>(candidates: string[], write: (staffId: string) => Promise<T>): Promise<T> {
  for (const staffId of candidates) {
    try {
      return await write(staffId);
    } catch (err) {
      if (pgCode(err) !== "23P01") throw err;
    }
  }
  throw slotUnavailable();
}

export async function bookAppointment(db: Db, studioId: string, input: BookInput, now = new Date()) {
  const studio = await getStudio(db, studioId);
  const service = await getService(db, studioId, input.serviceId);
  if (input.onlineOnly) {
    if (!service.onlineBookable) throw notFound("Leistung");
    if (input.startsAt < addMinutes(now, studio.bookingLeadMin)) {
      throw new ApiError(409, "slot_unavailable", "Dieser Termin liegt zu kurzfristig");
    }
  }
  const [customer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(and(eq(customers.id, input.customerId), eq(customers.studioId, studioId)))
    .limit(1);
  if (!customer) throw notFound("Kundin");

  const candidates = await freeStaff(db, studio, service, input.startsAt, input);
  const endsAt = addMinutes(input.startsAt, service.durationMin);
  return withFirstAvailable(candidates, async (staffId) => {
    const [created] = await db
      .insert(appointments)
      .values({
        studioId,
        staffId,
        customerId: customer.id,
        serviceId: service.id,
        startsAt: input.startsAt,
        endsAt,
        blockedUntil: addMinutes(endsAt, service.bufferAfterMin),
        source: input.source,
        priceCents: service.priceCents,
        notes: input.notes,
      })
      .returning({ id: appointments.id });
    if (!created) throw new Error("Termin wurde nicht gespeichert");
    return created.id;
  });
}

export async function rescheduleAppointment(
  db: Db,
  studioId: string,
  appointmentId: string,
  input: { startsAt: Date; staffId?: string; ignoreWorkingHours?: boolean },
) {
  const [current] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.studioId, studioId)))
    .limit(1);
  if (!current) throw notFound("Termin");
  // Nur aktive Termine: abgesagte, erledigte und "nicht erschienen" blockieren keine Zeit
  if (current.status !== "booked" && current.status !== "confirmed") {
    throw new ApiError(409, "invalid_state", "Dieser Termin kann nicht mehr verschoben werden");
  }
  const studio = await getStudio(db, studioId);
  const service = await getService(db, studioId, current.serviceId);
  const candidates = await freeStaff(db, studio, service, input.startsAt, {
    staffId: input.staffId ?? current.staffId,
    ignoreWorkingHours: input.ignoreWorkingHours,
    excludeAppointmentId: current.id,
  });
  const endsAt = addMinutes(input.startsAt, service.durationMin);
  await withFirstAvailable(candidates, (staffId) =>
    db
      .update(appointments)
      .set({
        staffId,
        startsAt: input.startsAt,
        endsAt,
        blockedUntil: addMinutes(endsAt, service.bufferAfterMin),
      })
      .where(eq(appointments.id, current.id)),
  );
}
