import { describe, expect, it } from "vitest";
import { computeAvailability, isStaffFree, workingIntervalsForDate } from "../src/availability.js";
import { can } from "../src/roles.js";

const TZ = "Europe/Berlin";
const monday = "2026-12-07"; // Montag
const mondayHours = [{ weekday: 1, start: "09:00", end: "12:00" }];

describe("Arbeitszeiten", () => {
  it("rechnet Studio-Zeit in echte Zeitpunkte um (Winterzeit = UTC+1)", () => {
    const [w] = workingIntervalsForDate(monday, TZ, mondayHours);
    expect(w?.start.toISOString()).toBe("2026-12-07T08:00:00.000Z");
    expect(w?.end.toISOString()).toBe("2026-12-07T11:00:00.000Z");
  });

  it("beachtet die Sommerzeit", () => {
    const [w] = workingIntervalsForDate("2026-07-06", TZ, mondayHours);
    expect(w?.start.toISOString()).toBe("2026-07-06T07:00:00.000Z");
  });

  it("liefert nichts an freien Tagen", () => {
    expect(workingIntervalsForDate("2026-12-08", TZ, mondayHours)).toEqual([]);
  });
});

describe("Freie Termine", () => {
  it("bietet Startzeiten im 15-Minuten-Raster bis zum Feierabend an", () => {
    const slots = computeAvailability({
      date: monday,
      timezone: TZ,
      durationMin: 60,
      bufferAfterMin: 0,
      staff: [{ staffId: "a", workingHours: mondayHours, busy: [] }],
    });
    expect(slots).toHaveLength(9); // 9:00 … 11:00
    expect(slots.at(-1)?.end.toISOString()).toBe("2026-12-07T11:00:00.000Z");
  });

  it("lässt belegte Zeiten inklusive Puffer aus", () => {
    const slots = computeAvailability({
      date: monday,
      timezone: TZ,
      durationMin: 30,
      bufferAfterMin: 15,
      staff: [
        {
          staffId: "a",
          workingHours: mondayHours,
          busy: [{ start: new Date("2026-12-07T09:00:00Z"), end: new Date("2026-12-07T09:30:00Z") }],
        },
      ],
    });
    const starts = slots.map((s) => s.start.toISOString().slice(11, 16));
    // 10:00–10:30 Studio-Zeit ist belegt; mit Puffer darf kein Termin bis 10:00 hineinragen
    expect(starts).not.toContain("08:30"); // 9:30 + 30 + 15 Puffer = 10:15 → Überschneidung
    expect(starts).toContain("08:15"); // 9:15–9:45 + Puffer bis 10:00 passt genau
    expect(starts).not.toContain("09:15");
    expect(starts).toContain("09:30");
  });

  it("fasst mehrere Mitarbeiter je Startzeit zusammen", () => {
    const slots = computeAvailability({
      date: monday,
      timezone: TZ,
      durationMin: 180,
      bufferAfterMin: 0,
      staff: [
        { staffId: "a", workingHours: mondayHours, busy: [] },
        { staffId: "b", workingHours: mondayHours, busy: [] },
      ],
    });
    expect(slots).toEqual([
      {
        start: new Date("2026-12-07T08:00:00Z"),
        end: new Date("2026-12-07T11:00:00Z"),
        staffIds: ["a", "b"],
      },
    ]);
  });

  it("bietet keine Zeiten vor 'notBefore' an", () => {
    const slots = computeAvailability({
      date: monday,
      timezone: TZ,
      durationMin: 60,
      bufferAfterMin: 0,
      notBefore: new Date("2026-12-07T09:50:00Z"),
      staff: [{ staffId: "a", workingHours: mondayHours, busy: [] }],
    });
    expect(slots.map((s) => s.start.toISOString())).toEqual(["2026-12-07T10:00:00.000Z"]);
  });

  it("prüft einen einzelnen Zeitpunkt, auf Wunsch auch außerhalb der Arbeitszeit", () => {
    const staff = { staffId: "a", workingHours: mondayHours, busy: [] };
    const evening = new Date("2026-12-07T18:00:00Z");
    expect(isStaffFree(staff, TZ, evening, 30, 0)).toBe(false);
    expect(isStaffFree(staff, TZ, evening, 30, 0, { ignoreWorkingHours: true })).toBe(true);
  });
});

describe("Rollen", () => {
  it("Mitarbeiter dürfen Termine sehen, aber nicht anlegen", () => {
    expect(can("staff", "appointments:read")).toBe(true);
    expect(can("staff", "appointments:write")).toBe(false);
    expect(can("owner", "modules:write")).toBe(true);
    expect(can("manager", "modules:write")).toBe(false);
  });
});
