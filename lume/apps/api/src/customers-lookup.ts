import {
  and,
  customers,
  type Db,
  eq,
  sql,
} from "@lume/db";

/** Kundin per E-Mail wiederfinden oder neu anlegen (für Online-Buchung und Agenten). */
export async function findOrCreateCustomer(
  db: Db,
  studioId: string,
  data: { firstName: string; lastName?: string; email?: string; phone?: string; marketingConsent?: boolean },
): Promise<string> {
  if (data.email) {
    const [existing] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.studioId, studioId), sql`lower(${customers.email}) = lower(${data.email})`))
      .limit(1);
    if (existing) return existing.id;
  }
  const [row] = await db
    .insert(customers)
    .values({ ...data, studioId })
    .onConflictDoNothing()
    .returning({ id: customers.id });
  if (row) return row.id;
  // Gleichzeitig angelegt: noch einmal lesen
  return findOrCreateCustomer(db, studioId, data);
}
