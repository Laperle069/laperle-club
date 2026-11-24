import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/** Einheitliches Fehlerformat: { error: { code, message, details? } } */
export class ApiError extends Error {
  constructor(
    public status: ContentfulStatusCode,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new ApiError(404, "not_found", `${what} nicht gefunden`);

export function errorResponse(err: Error, c: Context) {
  if (err instanceof ApiError) {
    return c.json(
      { error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) } },
      err.status,
    );
  }
  console.error(err);
  return c.json({ error: { code: "internal_error", message: "Interner Fehler" } }, 500);
}

/** PostgreSQL-Fehlercode aus einem (ggf. von Drizzle verpackten) Fehler lesen. */
export function pgCode(err: unknown): string | undefined {
  let e: unknown = err;
  for (let i = 0; i < 3 && e && typeof e === "object"; i++) {
    const code = (e as { code?: unknown }).code;
    if (typeof code === "string") return code;
    e = (e as { cause?: unknown }).cause;
  }
  return undefined;
}
