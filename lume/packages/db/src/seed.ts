import { createHash } from "node:crypto";
import { DateTime } from "luxon";
import type { Db } from "./client.js";
import {
  apiKeys,
  appointments,
  customers,
  services,
  staffMembers,
  staffServices,
  studioModules,
  studios,
  workingHours,
} from "./schema.js";

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Legt ein Demo-Studio für die lokale Entwicklung an (nur wenn noch keins existiert).
 * Erfundene Daten, kein Bezug zu einem echten Studio.
 */
export async function seedDemo(db: Db, apiKey: string): Promise<{ created: boolean }> {
  const existing = await db.select({ id: studios.id }).from(studios).limit(1);
  if (existing.length > 0) return { created: false };

  await db.transaction(async (tx) => {
    const [studio] = await tx
      .insert(studios)
      .values({ slug: "demo-studio", name: "Demo Studio Lumé" })
      .returning();
    if (!studio) throw new Error("Studio konnte nicht angelegt werden");
    const studioId = studio.id;

    await tx.insert(apiKeys).values({
      studioId,
      name: "Lokale Entwicklung",
      prefix: apiKey.slice(0, 12),
      hash: hashApiKey(apiKey),
      role: "owner",
    });

    await tx.insert(studioModules).values(
      ["booking", "marketplace", "pos", "memberships"].map((module) => ({
        studioId,
        module,
        enabled: true,
      })),
    );

    const staff = await tx
      .insert(staffMembers)
      .values([
        { studioId, displayName: "Mila", color: "#c084fc" },
        { studioId, displayName: "Sara", color: "#f472b6" },
      ])
      .returning();

    const svc = await tx
      .insert(services)
      .values([
        { studioId, name: "Maniküre", category: "Nägel", durationMin: 45, priceCents: 3500 },
        { studioId, name: "Gel-Modellage", category: "Nägel", durationMin: 90, bufferAfterMin: 15, priceCents: 6500 },
        { studioId, name: "Wimpernlifting", category: "Wimpern", durationMin: 60, priceCents: 5900 },
        { studioId, name: "Augenbrauen zupfen", category: "Augenbrauen", durationMin: 15, priceCents: 1500 },
      ])
      .returning();

    const [mila, sara] = staff;
    if (!mila || !sara) throw new Error("Mitarbeiter fehlen");
    await tx.insert(staffServices).values([
      ...svc.map((s) => ({ studioId, staffId: mila.id, serviceId: s.id })),
      ...svc.slice(2).map((s) => ({ studioId, staffId: sara.id, serviceId: s.id })),
    ]);

    // Mila: Mo–Fr 9–18 mit Mittagspause, Sara: Di–Sa 10–19
    await tx.insert(workingHours).values([
      ...[1, 2, 3, 4, 5].flatMap((weekday) => [
        { studioId, staffId: mila.id, weekday, startTime: "09:00", endTime: "13:00" },
        { studioId, staffId: mila.id, weekday, startTime: "14:00", endTime: "18:00" },
      ]),
      ...[2, 3, 4, 5, 6].map((weekday) => ({
        studioId,
        staffId: sara.id,
        weekday,
        startTime: "10:00",
        endTime: "19:00",
      })),
    ]);

    const [anna, lea] = await tx
      .insert(customers)
      .values([
        { studioId, firstName: "Anna", lastName: "Beispiel", email: "anna@example.com", marketingConsent: true },
        { studioId, firstName: "Lea", lastName: "Muster", phone: "+49 170 0000000" },
      ])
      .returning();
    const manicure = svc[0];
    const lashes = svc[2];
    if (!anna || !lea || !manicure || !lashes) throw new Error("Demo-Daten unvollständig");

    // Zwei Termine am nächsten Werktag, an dem beide arbeiten (Di–Fr)
    let day = DateTime.now().setZone(studio.timezone).plus({ days: 1 }).startOf("day");
    while (day.weekday < 2 || day.weekday > 5) day = day.plus({ days: 1 });
    const at = (h: number, m = 0) => day.set({ hour: h, minute: m }).toJSDate();
    await tx.insert(appointments).values([
      {
        studioId,
        staffId: mila.id,
        customerId: anna.id,
        serviceId: manicure.id,
        startsAt: at(10),
        endsAt: at(10, 45),
        blockedUntil: at(10, 45),
        source: "backoffice",
        priceCents: manicure.priceCents,
      },
      {
        studioId,
        staffId: sara.id,
        customerId: lea.id,
        serviceId: lashes.id,
        startsAt: at(11),
        endsAt: at(12),
        blockedUntil: at(12),
        source: "online",
        priceCents: lashes.priceCents,
      },
    ]);
  });
  return { created: true };
}
