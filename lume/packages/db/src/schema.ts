import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Datenmodell von Lumé. Jede Tabelle mit Studio-Daten trägt `studio_id`:
 * so liegen viele Studios sauber getrennt in einer Datenbank (mandantenfähig).
 */

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const studioRef = () =>
  uuid("studio_id")
    .notNull()
    .references(() => studios.id, { onDelete: "cascade" });

export const roleEnum = pgEnum("role", ["owner", "manager", "reception", "staff"]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "booked",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);
export const appointmentSourceEnum = pgEnum("appointment_source", [
  "backoffice",
  "online",
  "api",
  "assistant",
]);

export const studios = pgTable("studios", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("Europe/Berlin"),
  currency: text("currency").notNull().default("EUR"),
  plan: text("plan").notNull().default("free"),
  /** Wie viele Minuten im Voraus Kunden online frühestens buchen können. */
  bookingLeadMin: integer("booking_lead_min").notNull().default(60),
  /** Raster für angebotene Startzeiten. */
  slotStepMin: integer("slot_step_min").notNull().default(15),
  createdAt: createdAt(),
});

/** Menschen mit Login (Inhaber, Mitarbeiter). Anmeldung folgt in einem späteren Schritt. */
export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: createdAt(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: id(),
    studioId: studioRef(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("memberships_studio_user").on(t.studioId, t.userId)],
);

/** Schlüssel für Programme und KI-Agenten. Gespeichert wird nur der Hash. */
export const apiKeys = pgTable(
  "api_keys",
  {
    id: id(),
    studioId: studioRef(),
    name: text("name").notNull(),
    prefix: text("prefix").notNull(),
    hash: text("hash").notNull().unique(),
    role: roleEnum("role").notNull(),
    createdAt: createdAt(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [index("api_keys_studio").on(t.studioId)],
);

export const studioModules = pgTable(
  "studio_modules",
  {
    studioId: studioRef(),
    module: text("module").notNull(),
    enabled: boolean("enabled").notNull().default(false),
    settings: jsonb("settings").notNull().default({}),
  },
  (t) => [primaryKey({ columns: [t.studioId, t.module] })],
);

export const staffMembers = pgTable(
  "staff_members",
  {
    id: id(),
    studioId: studioRef(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    displayName: text("display_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    color: text("color").notNull().default("#8b7cf6"),
    active: boolean("active").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("staff_studio").on(t.studioId)],
);

export const services = pgTable(
  "services",
  {
    id: id(),
    studioId: studioRef(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category"),
    durationMin: integer("duration_min").notNull(),
    bufferAfterMin: integer("buffer_after_min").notNull().default(0),
    /** Preis in Cent, damit nie Rundungsfehler entstehen. */
    priceCents: integer("price_cents").notNull(),
    active: boolean("active").notNull().default(true),
    onlineBookable: boolean("online_bookable").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("services_studio").on(t.studioId)],
);

/** Welche Mitarbeiterin welche Leistung anbietet. */
export const staffServices = pgTable(
  "staff_services",
  {
    studioId: studioRef(),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffMembers.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.staffId, t.serviceId] })],
);

/** Wöchentliche Arbeitszeiten; mehrere Blöcke pro Tag erlauben Pausen. */
export const workingHours = pgTable(
  "working_hours",
  {
    id: id(),
    studioId: studioRef(),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffMembers.id, { onDelete: "cascade" }),
    /** 1 = Montag … 7 = Sonntag */
    weekday: smallint("weekday").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
  },
  (t) => [index("working_hours_staff").on(t.staffId)],
);

export const timeOff = pgTable(
  "time_off",
  {
    id: id(),
    studioId: studioRef(),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffMembers.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    reason: text("reason"),
  },
  (t) => [index("time_off_staff").on(t.staffId, t.startsAt)],
);

export const customers = pgTable(
  "customers",
  {
    id: id(),
    studioId: studioRef(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    email: text("email"),
    phone: text("phone"),
    notes: text("notes"),
    marketingConsent: boolean("marketing_consent").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    index("customers_studio").on(t.studioId),
    uniqueIndex("customers_studio_email").on(t.studioId, sql`lower(${t.email})`),
  ],
);

export const appointments = pgTable(
  "appointments",
  {
    id: id(),
    studioId: studioRef(),
    staffId: uuid("staff_id")
      .notNull()
      .references(() => staffMembers.id),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    /** Ende inklusive Puffer (Aufräumen, Einwirkzeit). Die Datenbank verhindert Überschneidungen. */
    blockedUntil: timestamp("blocked_until", { withTimezone: true }).notNull(),
    status: appointmentStatusEnum("status").notNull().default("booked"),
    source: appointmentSourceEnum("source").notNull(),
    priceCents: integer("price_cents").notNull(),
    notes: text("notes"),
    createdAt: createdAt(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  },
  (t) => [
    index("appointments_studio_start").on(t.studioId, t.startsAt),
    index("appointments_staff_start").on(t.staffId, t.startsAt),
    index("appointments_customer").on(t.customerId),
  ],
);

export type Studio = typeof studios.$inferSelect;
export type StaffMember = typeof staffMembers.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
