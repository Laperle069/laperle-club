import { z } from "@hono/zod-openapi";
import { ErrorSchema } from "../schemas.js";

export const json = <T extends z.ZodType>(schema: T, description: string) => ({
  content: { "application/json": { schema } },
  description,
});

export const body = <T extends z.ZodType>(schema: T) => ({
  body: { content: { "application/json": { schema } }, required: true },
});

export const errors = {
  400: json(ErrorSchema, "Ungültige Eingaben"),
  401: json(ErrorSchema, "Nicht angemeldet"),
  403: json(ErrorSchema, "Keine Berechtigung"),
  404: json(ErrorSchema, "Nicht gefunden"),
  409: json(ErrorSchema, "Konflikt, z. B. Termin nicht mehr frei"),
  422: json(ErrorSchema, "Fachlich nicht möglich"),
  429: json(ErrorSchema, "Zu viele Versuche"),
} as const;

export const security = [{ apiKey: [] }];
