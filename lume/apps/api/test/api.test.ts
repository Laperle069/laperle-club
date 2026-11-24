import { apiKeys, createDb, hashApiKey, studios, type DbHandle } from "@lume/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const OWNER_KEY = "lume_test_owner_key";
const STAFF_KEY = "lume_test_staff_key";
const OTHER_STUDIO_KEY = "lume_test_other_studio";
const DAY = "2030-03-04"; // Montag, Winterzeit (UTC+1)

let handle: DbHandle;
let app: ReturnType<typeof createApp>;

async function call(method: string, path: string, opts: { key?: string | null; body?: unknown } = {}) {
  const key = opts.key === undefined ? OWNER_KEY : opts.key;
  const res = await app.request(path, {
    method,
    headers: {
      "content-type": "application/json",
      ...(key ? { authorization: `Bearer ${key}` } : {}),
    },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

let serviceId: string;
let longServiceId: string;
let milaId: string;
let saraId: string;
let customerId: string;

beforeAll(async () => {
  handle = createDb();
  await handle.migrate();
  const [studio, other] = await handle.db
    .insert(studios)
    .values([
      { slug: "test-studio", name: "Test Studio", bookingLeadMin: 0 },
      { slug: "anderes-studio", name: "Anderes Studio" },
    ])
    .returning();
  await handle.db.insert(apiKeys).values([
    { studioId: studio!.id, name: "owner", prefix: "x", hash: hashApiKey(OWNER_KEY), role: "owner" },
    { studioId: studio!.id, name: "staff", prefix: "x", hash: hashApiKey(STAFF_KEY), role: "staff" },
    { studioId: other!.id, name: "other", prefix: "x", hash: hashApiKey(OTHER_STUDIO_KEY), role: "owner" },
  ]);
  app = createApp({ db: handle.db });

  const svc = await call("POST", "/v1/services", {
    body: { name: "Maniküre", durationMin: 60, bufferAfterMin: 15, priceCents: 3500 },
  });
  expect(svc.status).toBe(201);
  serviceId = svc.body.id;
  longServiceId = (
    await call("POST", "/v1/services", { body: { name: "Gel-Modellage", durationMin: 120, priceCents: 6500 } })
  ).body.id;

  const hours = [{ weekday: 1, start: "09:00", end: "12:00" }];
  const mila = await call("POST", "/v1/staff", {
    body: { displayName: "Mila", serviceIds: [serviceId, longServiceId], workingHours: hours },
  });
  expect(mila.status).toBe(201);
  milaId = mila.body.id;
  saraId = (
    await call("POST", "/v1/staff", { body: { displayName: "Sara", serviceIds: [serviceId], workingHours: hours } })
  ).body.id;

  const customer = await call("POST", "/v1/customers", {
    body: { firstName: "Anna", lastName: "Beispiel", email: "anna@example.com" },
  });
  expect(customer.status).toBe(201);
  customerId = customer.body.id;
});

afterAll(async () => {
  await handle?.close();
});

describe("Zugang", () => {
  it("lehnt Anfragen ohne oder mit falschem Schlüssel ab", async () => {
    expect((await call("GET", "/v1/studio", { key: null })).status).toBe(401);
    expect((await call("GET", "/v1/studio", { key: "falsch" })).status).toBe(401);
    expect((await call("GET", "/v1/studio")).body.slug).toBe("test-studio");
  });

  it("beachtet Rollen: Mitarbeiter-Schlüssel darf lesen, aber nicht buchen", async () => {
    expect((await call("GET", "/v1/services", { key: STAFF_KEY })).status).toBe(200);
    const res = await call("POST", "/v1/appointments", {
      key: STAFF_KEY,
      body: { serviceId, customerId, startsAt: `${DAY}T08:00:00Z` },
    });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("forbidden");
  });

  it("trennt Studios strikt voneinander", async () => {
    expect((await call("GET", "/v1/services", { key: OTHER_STUDIO_KEY })).body).toEqual([]);
    expect((await call("GET", `/v1/customers/${customerId}`, { key: OTHER_STUDIO_KEY })).status).toBe(404);
  });

  it("liefert die OpenAPI-Beschreibung ohne Schlüssel", async () => {
    const res = await call("GET", "/v1/openapi.json", { key: null });
    expect(res.status).toBe(200);
    expect(res.body.paths["/v1/appointments"]).toBeDefined();
    expect(res.body.paths["/v1/public/studios/{slug}/bookings"]).toBeDefined();
  });

  it("meldet ungültige Eingaben verständlich", async () => {
    const res = await call("POST", "/v1/services", { body: { name: "", durationMin: 0 } });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("validation_error");
  });
});

describe("Buchen", () => {
  it("zeigt freie Zeiten für beide Mitarbeiterinnen", async () => {
    const res = await call("GET", `/v1/availability?serviceId=${serviceId}&date=${DAY}`);
    expect(res.status).toBe(200);
    // 9:00 bis 11:00 Studio-Zeit im 15-Minuten-Raster = 9 Startzeiten
    expect(res.body.slots).toHaveLength(9);
    expect(res.body.slots[0]).toEqual({
      startsAt: "2030-03-04T08:00:00.000Z",
      endsAt: "2030-03-04T09:00:00.000Z",
      staffIds: expect.arrayContaining([milaId, saraId]),
    });
  });

  it("bucht, verhindert Doppelbuchung und verteilt auf freie Mitarbeiterin", async () => {
    const first = await call("POST", "/v1/appointments", {
      body: { serviceId, staffId: milaId, customerId, startsAt: `${DAY}T08:00:00Z`, source: "backoffice" },
    });
    expect(first.status).toBe(201);
    expect(first.body).toMatchObject({ staffName: "Mila", customerName: "Anna Beispiel", priceCents: 3500 });

    const again = await call("POST", "/v1/appointments", {
      body: { serviceId, staffId: milaId, customerId, startsAt: `${DAY}T08:30:00Z` },
    });
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe("slot_unavailable");

    const auto = await call("POST", "/v1/appointments", {
      body: { serviceId, customerId, startsAt: `${DAY}T08:00:00Z` },
    });
    expect(auto.status).toBe(201);
    expect(auto.body.staffName).toBe("Sara");

    const full = await call("POST", "/v1/appointments", {
      body: { serviceId, customerId, startsAt: `${DAY}T08:00:00Z` },
    });
    expect(full.status).toBe(409);
  });

  it("rechnet den Puffer nach dem Termin mit ein", async () => {
    const res = await call("GET", `/v1/availability?serviceId=${serviceId}&date=${DAY}&staffId=${milaId}`);
    const starts = res.body.slots.map((s: { startsAt: string }) => s.startsAt.slice(11, 16));
    // Termin 9:00–10:00 + 15 Min. Puffer: frühestens 10:15 Studio-Zeit
    expect(starts[0]).toBe("09:15");
  });

  it("verweigert Leistungen, die die Mitarbeiterin nicht anbietet", async () => {
    const res = await call("POST", "/v1/appointments", {
      body: { serviceId: longServiceId, staffId: saraId, customerId, startsAt: `${DAY}T10:00:00Z` },
    });
    expect(res.status).toBe(422);
  });

  it("bucht außerhalb der Arbeitszeit nur auf ausdrücklichen Wunsch", async () => {
    const body = { serviceId, staffId: saraId, customerId, startsAt: `${DAY}T16:00:00Z` };
    expect((await call("POST", "/v1/appointments", { body })).status).toBe(409);
    const res = await call("POST", "/v1/appointments", { body: { ...body, ignoreWorkingHours: true } });
    expect(res.status).toBe(201);
  });

  it("legt neue Kundinnen beim Buchen direkt mit an", async () => {
    const res = await call("POST", "/v1/appointments", {
      body: {
        serviceId: longServiceId,
        startsAt: "2030-03-18T08:00:00Z",
        customer: { firstName: "Lea", email: "lea@example.com" },
      },
    });
    expect(res.status).toBe(201);
    expect(res.body.customerName).toBe("Lea");
  });

  it("verschiebt, ändert den Status und sagt ab", async () => {
    const list = await call("GET", `/v1/appointments?from=${DAY}T00:00:00Z&to=2030-03-05T00:00:00Z`);
    expect(list.status).toBe(200);
    const sara = list.body.find((a: { staffName: string }) => a.staffName === "Sara");

    const moved = await call("POST", `/v1/appointments/${sara.id}/reschedule`, {
      body: { startsAt: `${DAY}T10:00:00Z` },
    });
    expect(moved.status).toBe(200);
    expect(moved.body.startsAt).toBe("2030-03-04T10:00:00.000Z");

    const confirmed = await call("PATCH", `/v1/appointments/${sara.id}`, { body: { status: "confirmed" } });
    expect(confirmed.body.status).toBe("confirmed");

    const cancelled = await call("POST", `/v1/appointments/${sara.id}/cancel`);
    expect(cancelled.body.status).toBe("cancelled");

    // Die Zeit ist danach wieder frei
    const rebook = await call("POST", "/v1/appointments", {
      body: { serviceId, staffId: saraId, customerId, startsAt: `${DAY}T10:00:00Z` },
    });
    expect(rebook.status).toBe(201);
  });

  it("blockiert Zeiten bei Abwesenheit", async () => {
    const off = await call("POST", `/v1/staff/${saraId}/time-off`, {
      body: { startsAt: "2030-03-11T08:00:00Z", endsAt: "2030-03-11T11:00:00Z", reason: "Schulung" },
    });
    expect(off.status).toBe(201);
    const res = await call("GET", `/v1/availability?serviceId=${serviceId}&date=2030-03-11`);
    expect(res.body.slots.every((s: { staffIds: string[] }) => !s.staffIds.includes(saraId))).toBe(true);
  });
});

describe("Sonderfälle", () => {
  it("verteilt gleichzeitige Buchungen ohne Wunsch-Mitarbeiterin auf alle Freien", async () => {
    const body = { serviceId, customerId, startsAt: "2030-03-25T08:00:00Z" };
    const [a, b] = await Promise.all([
      call("POST", "/v1/appointments", { body }),
      call("POST", "/v1/appointments", { body }),
    ]);
    expect([a.status, b.status]).toEqual([201, 201]);
    expect(new Set([a.body.staffName, b.body.staffName])).toEqual(new Set(["Mila", "Sara"]));
  });

  it("setzt 'nicht erschienen' erst ab Terminbeginn und verschiebt solche Termine nicht", async () => {
    const future = await call("POST", "/v1/appointments", {
      body: { serviceId, staffId: milaId, customerId, startsAt: "2030-04-01T08:00:00Z" },
    });
    const early = await call("PATCH", `/v1/appointments/${future.body.id}`, { body: { status: "no_show" } });
    expect(early.status).toBe(409);

    const past = await call("POST", "/v1/appointments", {
      body: { serviceId, staffId: milaId, customerId, startsAt: "2020-03-02T08:00:00Z" },
    });
    expect(past.status).toBe(201);
    expect((await call("PATCH", `/v1/appointments/${past.body.id}`, { body: { status: "no_show" } })).status).toBe(200);
    const moved = await call("POST", `/v1/appointments/${past.body.id}/reschedule`, {
      body: { startsAt: "2030-04-01T09:30:00Z" },
    });
    expect(moved.status).toBe(409);
  });
});

describe("Online-Buchung", () => {
  it("zeigt das Studio öffentlich und bucht ohne Schlüssel", async () => {
    const studio = await call("GET", "/v1/public/studios/test-studio", { key: null });
    expect(studio.status).toBe(200);
    expect(studio.body.services.map((s: { name: string }) => s.name)).toContain("Maniküre");
    expect(studio.body).not.toHaveProperty("customers");

    const booking = await call("POST", "/v1/public/studios/test-studio/bookings", {
      key: null,
      body: {
        serviceId,
        startsAt: "2030-03-11T08:00:00Z",
        customer: { firstName: "anna", email: "ANNA@example.com" },
      },
    });
    expect(booking.status).toBe(201);
    expect(booking.body.staffName).toBe("Mila");

    // Gleiche E-Mail → keine doppelte Kundin
    const found = await call("GET", "/v1/customers?q=anna");
    expect(found.body).toHaveLength(1);
  });

  it("bietet keine Termine in der Vergangenheit an", async () => {
    const res = await call("GET", `/v1/public/studios/test-studio/availability?serviceId=${serviceId}&date=2020-03-02`, {
      key: null,
    });
    expect(res.body.slots).toEqual([]);
  });
});

describe("Bausteine", () => {
  it("lassen sich vom Inhaber ein- und ausschalten", async () => {
    const res = await call("PUT", "/v1/modules/pos", { body: { enabled: true } });
    expect(res.status).toBe(200);
    expect(res.body.find((m: { key: string }) => m.key === "pos").enabled).toBe(true);
    expect(res.body.find((m: { key: string }) => m.key === "booking").enabled).toBe(true);
    expect((await call("PUT", "/v1/modules/booking", { body: { enabled: false } })).status).toBe(404);
    expect((await call("PUT", "/v1/modules/pos", { key: STAFF_KEY, body: { enabled: false } })).status).toBe(403);
  });
});
