import { DateTime } from "luxon";

/**
 * Freie Termine berechnen. Reine Funktion ohne Datenbank, damit sie überall
 * gleich rechnet: in der API, im Backoffice, in der Kunden-App und für KI-Agenten.
 */

export interface Interval {
  start: Date;
  end: Date;
}

/** Arbeitszeit an einem Wochentag, Uhrzeiten als "HH:MM" in Studio-Zeit. */
export interface WorkingHoursRule {
  /** ISO-Wochentag: 1 = Montag … 7 = Sonntag */
  weekday: number;
  start: string;
  end: string;
}

export interface StaffAvailabilityInput {
  staffId: string;
  workingHours: WorkingHoursRule[];
  /** Belegte Zeiten: Termine (inkl. Puffer), Urlaub, Pausen. */
  busy: Interval[];
}

export interface AvailabilityInput {
  /** Kalendertag in Studio-Zeit, "YYYY-MM-DD" */
  date: string;
  timezone: string;
  durationMin: number;
  bufferAfterMin: number;
  staff: StaffAvailabilityInput[];
  /** Raster, in dem Startzeiten angeboten werden. */
  stepMin?: number;
  /** Frühestmöglicher Start (z. B. jetzt + Vorlaufzeit). */
  notBefore?: Date;
}

export interface Slot {
  start: Date;
  end: Date;
  staffIds: string[];
}

export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Arbeitszeiten eines Tages als echte Zeitpunkte (berücksichtigt Sommer-/Winterzeit). */
export function workingIntervalsForDate(
  date: string,
  timezone: string,
  rules: WorkingHoursRule[],
): Interval[] {
  const day = DateTime.fromISO(date, { zone: timezone });
  if (!day.isValid) throw new Error(`Ungültiges Datum: ${date}`);
  return rules
    .filter((r) => r.weekday === day.weekday)
    .map((r) => ({
      start: DateTime.fromISO(`${date}T${r.start}`, { zone: timezone }).toJSDate(),
      end: DateTime.fromISO(`${date}T${r.end}`, { zone: timezone }).toJSDate(),
    }))
    .filter((i) => i.start < i.end)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Kann der Mitarbeiter genau zu diesem Zeitpunkt? */
export function isStaffFree(
  staff: StaffAvailabilityInput,
  timezone: string,
  start: Date,
  durationMin: number,
  bufferAfterMin: number,
  options: { ignoreWorkingHours?: boolean } = {},
): boolean {
  const end = addMinutes(start, durationMin);
  const blocked: Interval = { start, end: addMinutes(end, bufferAfterMin) };
  if (staff.busy.some((b) => overlaps(blocked, b))) return false;
  if (options.ignoreWorkingHours) return true;
  const date = DateTime.fromJSDate(start, { zone: timezone }).toISODate();
  if (!date) return false;
  return workingIntervalsForDate(date, timezone, staff.workingHours).some(
    (w) => w.start <= start && end <= w.end,
  );
}

export function computeAvailability(input: AvailabilityInput): Slot[] {
  const step = input.stepMin ?? 15;
  if (input.durationMin <= 0) throw new Error("Dauer muss größer als 0 sein");
  if (step <= 0) throw new Error("Raster muss größer als 0 sein");

  const byStart = new Map<number, Slot>();
  for (const staff of input.staff) {
    const windows = workingIntervalsForDate(input.date, input.timezone, staff.workingHours);
    for (const window of windows) {
      for (
        let start = window.start;
        addMinutes(start, input.durationMin) <= window.end;
        start = addMinutes(start, step)
      ) {
        if (input.notBefore && start < input.notBefore) continue;
        if (!isStaffFree(staff, input.timezone, start, input.durationMin, input.bufferAfterMin)) {
          continue;
        }
        const key = start.getTime();
        const slot = byStart.get(key);
        if (slot) slot.staffIds.push(staff.staffId);
        else
          byStart.set(key, {
            start,
            end: addMinutes(start, input.durationMin),
            staffIds: [staff.staffId],
          });
      }
    }
  }
  return [...byStart.values()].sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}
