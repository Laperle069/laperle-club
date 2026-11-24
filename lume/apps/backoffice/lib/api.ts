import "server-only";
import type { ApiErrorDto } from "@lume/api/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Das Backoffice nutzt dieselbe API wie alle anderen (API zuerst).
 * Angemeldet wird über ein Sitzungs-Token im httpOnly-Cookie; es erreicht nie
 * Browser-JavaScript.
 */
export const baseUrl = process.env.LUME_API_URL ?? "http://localhost:4000";
export const SESSION_COOKIE = "lume_session";

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: { method?: string; body?: unknown; token?: string }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/v1${path}`, {
      method: init.method ?? "GET",
      headers: {
        "content-type": "application/json",
        ...(init.token ? { authorization: `Bearer ${init.token}` } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiRequestError(0, "api_unreachable", `Die Lumé-API ist nicht erreichbar (${baseUrl}).`);
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiErrorDto | null;
    const details = (data?.error.details as { path: string; message: string }[] | undefined)
      ?.map((d) => d.message)
      .join(", ");
    throw new ApiRequestError(
      res.status,
      data?.error.code ?? "error",
      [data?.error.message ?? `Fehler ${res.status}`, details].filter(Boolean).join(" – "),
    );
  }
  return (await res.json()) as T;
}

/** Anfrage im Namen der angemeldeten Person. Ohne gültige Sitzung → Login-Seite. */
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");
  try {
    return await request<T>(path, { ...init, token });
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) redirect("/login?abgelaufen=1");
    throw err;
  }
}

/** Anfrage ohne Sitzung (nur für die Anmeldung). */
export function publicApi<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  return request<T>(path, init);
}
