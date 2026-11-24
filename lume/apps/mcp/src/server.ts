import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * MCP-Server von Lumé: Damit können KI-Assistenten (z. B. Claude) direkt mit einem
 * Studio arbeiten – freie Termine finden, buchen, absagen, Kunden suchen.
 * Er nutzt ausschließlich die öffentliche Lumé-API mit dem Schlüssel des Studios,
 * hat also genau die Rechte dieses Schlüssels und nicht mehr.
 */

export type Fetcher = (path: string, init?: { method?: string; body?: unknown }) => Promise<unknown>;

export function httpFetcher(baseUrl: string, apiKey: string, fetchImpl: typeof fetch = fetch): Fetcher {
  return async (path, init = {}) => {
    const res = await fetchImpl(`${baseUrl}/v1${path}`, {
      method: init.method ?? "GET",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    const data = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    if (!res.ok) throw new Error(data?.error?.message ?? `Fehler ${res.status}`);
    return data;
  };
}

const text = (value: unknown) => ({
  content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});

async function run(fn: () => Promise<unknown>) {
  try {
    return text(await fn());
  } catch (err) {
    return { ...text(err instanceof Error ? err.message : String(err)), isError: true };
  }
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Tag als YYYY-MM-DD in Studio-Zeit");
const isoDateTime = z.string().describe("Zeitpunkt als ISO 8601, z. B. 2026-12-07T09:00:00Z");

export function createLumeMcpServer(call: Fetcher): McpServer {
  const server = new McpServer({ name: "lume", version: "0.1.0" });

  server.registerTool(
    "studio_info",
    { title: "Studio", description: "Name, Zeitzone und Einstellungen des Studios." },
    () => run(() => call("/studio")),
  );

  server.registerTool(
    "list_services",
    { title: "Leistungen", description: "Alle Leistungen mit Dauer (Minuten) und Preis (Cent)." },
    () => run(() => call("/services")),
  );

  server.registerTool(
    "list_staff",
    { title: "Mitarbeiter", description: "Mitarbeiter mit Arbeitszeiten und angebotenen Leistungen." },
    () => run(() => call("/staff")),
  );

  server.registerTool(
    "find_free_slots",
    {
      title: "Freie Termine finden",
      description: "Freie Startzeiten für eine Leistung an einem Tag, optional bei einer bestimmten Mitarbeiterin.",
      inputSchema: { serviceId: z.string(), date: isoDate, staffId: z.string().optional() },
    },
    ({ serviceId, date, staffId }) =>
      run(() => call(`/availability?${new URLSearchParams({ serviceId, date, ...(staffId ? { staffId } : {}) })}`)),
  );

  server.registerTool(
    "list_appointments",
    {
      title: "Termine anzeigen",
      description: "Termine in einem Zeitraum (höchstens 62 Tage).",
      inputSchema: { from: isoDateTime, to: isoDateTime, staffId: z.string().optional() },
    },
    ({ from, to, staffId }) =>
      run(() => call(`/appointments?${new URLSearchParams({ from, to, ...(staffId ? { staffId } : {}) })}`)),
  );

  server.registerTool(
    "search_customers",
    {
      title: "Kunden suchen",
      description: "Kunden nach Name, E-Mail oder Telefon suchen.",
      inputSchema: { query: z.string().min(1) },
    },
    ({ query }) => run(() => call(`/customers?q=${encodeURIComponent(query)}&limit=20`)),
  );

  server.registerTool(
    "book_appointment",
    {
      title: "Termin buchen",
      description:
        "Bucht einen Termin. Entweder customerId einer bestehenden Kundin oder Vorname (plus E-Mail/Telefon) einer neuen angeben. Vorher mit find_free_slots eine freie Zeit suchen.",
      inputSchema: {
        serviceId: z.string(),
        startsAt: isoDateTime,
        staffId: z.string().optional(),
        customerId: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
      },
    },
    (input) =>
      run(() =>
        call("/appointments", {
          method: "POST",
          body: {
            serviceId: input.serviceId,
            startsAt: input.startsAt,
            staffId: input.staffId,
            notes: input.notes,
            source: "assistant",
            ...(input.customerId
              ? { customerId: input.customerId }
              : {
                  customer: {
                    firstName: input.firstName,
                    lastName: input.lastName,
                    email: input.email,
                    phone: input.phone,
                  },
                }),
          },
        }),
      ),
  );

  server.registerTool(
    "cancel_appointment",
    {
      title: "Termin absagen",
      description: "Sagt einen Termin ab. Die Zeit wird sofort wieder frei.",
      inputSchema: { appointmentId: z.string() },
      annotations: { destructiveHint: true },
    },
    ({ appointmentId }) => run(() => call(`/appointments/${appointmentId}/cancel`, { method: "POST" })),
  );

  return server;
}
