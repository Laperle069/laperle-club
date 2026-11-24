import "server-only";
import type { ApiErrorDto } from "@lume/api/types";

/**
 * Das Backoffice nutzt dieselbe öffentliche API wie alle anderen (API zuerst).
 * Der Schlüssel bleibt auf dem Server und erreicht nie den Browser.
 */
const baseUrl = process.env.LUME_API_URL ?? "http://localhost:4000";
const apiKey = process.env.LUME_API_KEY ?? "lume_dev_nur_lokal_demo_schluessel";

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/v1${path}`, {
      method: init.method ?? "GET",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiRequestError(0, "api_unreachable", `Die Lumé-API ist nicht erreichbar (${baseUrl}).`);
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiErrorDto | null;
    const details = (data?.error.details as { path: string; message: string }[] | undefined)
      ?.map((d) => `${d.path}: ${d.message}`)
      .join(", ");
    throw new ApiRequestError(
      res.status,
      data?.error.code ?? "error",
      [data?.error.message ?? `Fehler ${res.status}`, details].filter(Boolean).join(" – "),
    );
  }
  return (await res.json()) as T;
}
