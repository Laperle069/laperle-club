import { z } from "@hono/zod-openapi";

/** Datenformate der API. Daraus entsteht automatisch die OpenAPI-Beschreibung. */

export const Uuid = z.uuid();
const Time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Uhrzeit als HH:MM")
  .openapi({ example: "09:00" });
const DateOnly = z.iso.date().openapi({ example: "2026-12-07" });
const DateTimeStr = z.iso.datetime({ offset: true }).openapi({ example: "2026-12-07T09:00:00.000Z" });

export const ErrorSchema = z
  .object({
    error: z.object({ code: z.string(), message: z.string(), details: z.unknown().optional() }),
  })
  .openapi("Error");

export const IdParam = z.object({ id: Uuid.openapi({ param: { name: "id", in: "path" } }) });

export const StudioSchema = z
  .object({
    id: Uuid,
    slug: z.string(),
    name: z.string(),
    timezone: z.string(),
    currency: z.string(),
    plan: z.string(),
    bookingLeadMin: z.number().int(),
    slotStepMin: z.number().int(),
  })
  .openapi("Studio");

export const StudioUpdateSchema = z
  .object({
    name: z.string().min(1).max(120),
    bookingLeadMin: z.number().int().min(0).max(60 * 24 * 14),
    slotStepMin: z.number().int().min(5).max(120),
  })
  .partial()
  .openapi("StudioUpdate");

export const ModuleSchema = z
  .object({ key: z.string(), label: z.string(), enabled: z.boolean(), alwaysOn: z.boolean() })
  .openapi("Module");

export const WorkingHoursSchema = z
  .object({ weekday: z.number().int().min(1).max(7), start: Time, end: Time })
  .refine((v) => v.start < v.end, "Beginn muss vor dem Ende liegen")
  .openapi("WorkingHours");

export const StaffSchema = z
  .object({
    id: Uuid,
    displayName: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    color: z.string(),
    active: z.boolean(),
    serviceIds: z.array(Uuid),
    workingHours: z.array(WorkingHoursSchema),
  })
  .openapi("Staff");

const Color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Farbe als #RRGGBB");

export const StaffCreateSchema = z
  .object({
    displayName: z.string().min(1).max(80),
    email: z.email().optional(),
    phone: z.string().max(40).optional(),
    color: Color.optional(),
    serviceIds: z.array(Uuid).default([]),
    workingHours: z.array(WorkingHoursSchema).default([]),
  })
  .openapi("StaffCreate");

export const StaffUpdateSchema = z
  .object({
    displayName: z.string().min(1).max(80),
    email: z.email().nullable(),
    phone: z.string().max(40).nullable(),
    color: Color,
    active: z.boolean(),
    serviceIds: z.array(Uuid),
    workingHours: z.array(WorkingHoursSchema),
  })
  .partial()
  .openapi("StaffUpdate");

export const TimeOffCreateSchema = z
  .object({ startsAt: DateTimeStr, endsAt: DateTimeStr, reason: z.string().max(200).optional() })
  .refine((v) => new Date(v.startsAt) < new Date(v.endsAt), "Beginn muss vor dem Ende liegen")
  .openapi("TimeOffCreate");

export const TimeOffSchema = z
  .object({ id: Uuid, staffId: Uuid, startsAt: DateTimeStr, endsAt: DateTimeStr, reason: z.string().nullable() })
  .openapi("TimeOff");

export const ServiceSchema = z
  .object({
    id: Uuid,
    name: z.string(),
    description: z.string().nullable(),
    category: z.string().nullable(),
    durationMin: z.number().int(),
    bufferAfterMin: z.number().int(),
    priceCents: z.number().int().openapi({ description: "Preis in Cent", example: 3500 }),
    active: z.boolean(),
    onlineBookable: z.boolean(),
  })
  .openapi("Service");

export const ServiceCreateSchema = z
  .object({
    name: z.string().min(1).max(120),
    description: z.string().max(2000).optional(),
    category: z.string().max(80).optional(),
    durationMin: z.number().int().min(5).max(12 * 60),
    bufferAfterMin: z.number().int().min(0).max(240).default(0),
    priceCents: z.number().int().min(0),
    onlineBookable: z.boolean().default(true),
  })
  .openapi("ServiceCreate");

export const ServiceUpdateSchema = z
  .object({
    name: z.string().min(1).max(120),
    description: z.string().max(2000).nullable(),
    category: z.string().max(80).nullable(),
    durationMin: z.number().int().min(5).max(12 * 60),
    bufferAfterMin: z.number().int().min(0).max(240),
    priceCents: z.number().int().min(0),
    active: z.boolean(),
    onlineBookable: z.boolean(),
  })
  .partial()
  .openapi("ServiceUpdate");

export const CustomerSchema = z
  .object({
    id: Uuid,
    firstName: z.string(),
    lastName: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    notes: z.string().nullable(),
    marketingConsent: z.boolean(),
    createdAt: DateTimeStr,
  })
  .openapi("Customer");

export const CustomerCreateSchema = z
  .object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().max(80).optional(),
    email: z.email().optional(),
    phone: z.string().max(40).optional(),
    notes: z.string().max(5000).optional(),
    marketingConsent: z.boolean().default(false),
  })
  .openapi("CustomerCreate");

export const CustomerUpdateSchema = z
  .object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().max(80).nullable(),
    email: z.email().nullable(),
    phone: z.string().max(40).nullable(),
    notes: z.string().max(5000).nullable(),
    marketingConsent: z.boolean(),
  })
  .partial()
  .openapi("CustomerUpdate");

export const AppointmentStatus = z.enum(["booked", "confirmed", "completed", "cancelled", "no_show"]);

export const AppointmentSchema = z
  .object({
    id: Uuid,
    staffId: Uuid,
    staffName: z.string(),
    customerId: Uuid,
    customerName: z.string(),
    serviceId: Uuid,
    serviceName: z.string(),
    startsAt: DateTimeStr,
    endsAt: DateTimeStr,
    status: AppointmentStatus,
    source: z.enum(["backoffice", "online", "api", "assistant"]),
    priceCents: z.number().int(),
    notes: z.string().nullable(),
    createdAt: DateTimeStr,
    cancelledAt: DateTimeStr.nullable(),
  })
  .openapi("Appointment");

export const AppointmentCreateSchema = z
  .object({
    serviceId: Uuid,
    staffId: Uuid.optional().openapi({ description: "Leer lassen: Lumé wählt eine freie Mitarbeiterin" }),
    startsAt: DateTimeStr,
    customerId: Uuid.optional(),
    customer: CustomerCreateSchema.optional().openapi({ description: "Neue Kundin direkt mit anlegen" }),
    notes: z.string().max(2000).optional(),
    source: z.enum(["backoffice", "api", "assistant"]).default("api"),
    ignoreWorkingHours: z
      .boolean()
      .default(false)
      .openapi({ description: "Auch außerhalb der Arbeitszeit buchen (Überschneidungen bleiben verboten)" }),
  })
  .refine((v) => Boolean(v.customerId) !== Boolean(v.customer), {
    message: "Entweder customerId oder customer angeben",
  })
  .openapi("AppointmentCreate");

export const AppointmentUpdateSchema = z
  .object({
    status: z.enum(["confirmed", "completed", "no_show"]).optional(),
    notes: z.string().max(2000).nullable().optional(),
  })
  .openapi("AppointmentUpdate");

export const RescheduleSchema = z
  .object({ startsAt: DateTimeStr, staffId: Uuid.optional(), ignoreWorkingHours: z.boolean().default(false) })
  .openapi("Reschedule");

export const AppointmentListQuery = z.object({
  from: DateTimeStr.openapi({ param: { name: "from", in: "query" } }),
  to: DateTimeStr.openapi({ param: { name: "to", in: "query" } }),
  staffId: Uuid.optional().openapi({ param: { name: "staffId", in: "query" } }),
  customerId: Uuid.optional().openapi({ param: { name: "customerId", in: "query" } }),
  includeCancelled: z
    .enum(["true", "false"])
    .default("false")
    .openapi({ param: { name: "includeCancelled", in: "query" } }),
});

export const AvailabilityQuery = z.object({
  serviceId: Uuid.openapi({ param: { name: "serviceId", in: "query" } }),
  date: DateOnly.openapi({ param: { name: "date", in: "query" } }),
  staffId: Uuid.optional().openapi({ param: { name: "staffId", in: "query" } }),
});

export const SlotSchema = z
  .object({ startsAt: DateTimeStr, endsAt: DateTimeStr, staffIds: z.array(Uuid) })
  .openapi("Slot");

export const AvailabilitySchema = z
  .object({ date: DateOnly, timezone: z.string(), serviceId: Uuid, slots: z.array(SlotSchema) })
  .openapi("Availability");

export const PublicBookingSchema = z
  .object({
    serviceId: Uuid,
    staffId: Uuid.optional(),
    startsAt: DateTimeStr,
    customer: z.object({
      firstName: z.string().min(1).max(80),
      lastName: z.string().max(80).optional(),
      email: z.email(),
      phone: z.string().max(40).optional(),
    }),
    notes: z.string().max(1000).optional(),
  })
  .openapi("PublicBooking");

export const PublicStudioSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    timezone: z.string(),
    services: z.array(ServiceSchema.pick({ id: true, name: true, description: true, category: true, durationMin: true, priceCents: true })),
    staff: z.array(z.object({ id: Uuid, displayName: z.string(), serviceIds: z.array(Uuid) })),
  })
  .openapi("PublicStudio");

export const PublicBookingResultSchema = z
  .object({
    id: Uuid,
    startsAt: DateTimeStr,
    endsAt: DateTimeStr,
    serviceName: z.string(),
    staffName: z.string(),
    status: AppointmentStatus,
  })
  .openapi("PublicBookingResult");

export const RoleSchema = z.enum(["owner", "manager", "reception", "staff"]);
const Password = z.string().min(10, "Passwort braucht mindestens 10 Zeichen").max(200);

export const LoginSchema = z
  .object({
    email: z.email(),
    password: z.string().min(1).max(200),
    studioSlug: z.string().optional().openapi({ description: "Bei mehreren Studios: welches" }),
  })
  .openapi("Login");

export const MeSchema = z
  .object({
    user: z.object({ id: Uuid, email: z.string(), name: z.string() }),
    studio: z.object({ id: Uuid, slug: z.string(), name: z.string() }),
    role: RoleSchema,
    studios: z.array(z.object({ slug: z.string(), name: z.string(), role: RoleSchema })),
  })
  .openapi("Me");

export const LoginResultSchema = MeSchema.extend({
  token: z.string().openapi({ description: "Sitzungs-Token, als Bearer senden" }),
  expiresAt: DateTimeStr,
}).openapi("LoginResult");

export const PasswordChangeSchema = z
  .object({ currentPassword: z.string().min(1).max(200), newPassword: Password })
  .openapi("PasswordChange");

export const TeamMemberSchema = z
  .object({
    userId: Uuid,
    email: z.string(),
    name: z.string(),
    role: RoleSchema,
    lastLoginAt: DateTimeStr.nullable(),
  })
  .openapi("TeamMember");

export const TeamInviteSchema = z
  .object({
    email: z.email(),
    name: z.string().min(1).max(80),
    role: RoleSchema,
    password: Password.openapi({ description: "Startpasswort; wird ignoriert, wenn die Person schon ein Konto hat" }),
  })
  .openapi("TeamInvite");

export const ApiKeySchema = z
  .object({
    id: Uuid,
    name: z.string(),
    prefix: z.string().openapi({ description: "Anfang des Schlüssels zum Wiedererkennen" }),
    role: RoleSchema,
    createdAt: DateTimeStr,
    lastUsedAt: DateTimeStr.nullable(),
    revokedAt: DateTimeStr.nullable(),
  })
  .openapi("ApiKey");

export const ApiKeyCreateSchema = z
  .object({ name: z.string().min(1).max(80), role: RoleSchema.default("reception") })
  .openapi("ApiKeyCreate");

export const ApiKeyCreatedSchema = ApiKeySchema.extend({
  key: z.string().openapi({ description: "Der vollständige Schlüssel – wird nur dieses eine Mal angezeigt" }),
}).openapi("ApiKeyCreated");

// Typen für Programme, die die API nutzen (Backoffice, Apps, MCP-Server)
export type StudioDto = z.infer<typeof StudioSchema>;
export type ModuleDto = z.infer<typeof ModuleSchema>;
export type StaffDto = z.infer<typeof StaffSchema>;
export type ServiceDto = z.infer<typeof ServiceSchema>;
export type CustomerDto = z.infer<typeof CustomerSchema>;
export type AppointmentDto = z.infer<typeof AppointmentSchema>;
export type AvailabilityDto = z.infer<typeof AvailabilitySchema>;
export type ApiErrorDto = z.infer<typeof ErrorSchema>;
export type MeDto = z.infer<typeof MeSchema>;
export type LoginResultDto = z.infer<typeof LoginResultSchema>;
export type TeamMemberDto = z.infer<typeof TeamMemberSchema>;
export type ApiKeyDto = z.infer<typeof ApiKeySchema>;
export type ApiKeyCreatedDto = z.infer<typeof ApiKeyCreatedSchema>;
