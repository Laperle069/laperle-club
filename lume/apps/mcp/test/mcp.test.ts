import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createApp } from "@lume/api";
import { createDb, seedDemo, type DbHandle } from "@lume/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createLumeMcpServer, httpFetcher } from "../src/server.js";

const KEY = "lume_test_mcp_key";
let handle: DbHandle;
let client: Client;

const parse = (res: unknown) => JSON.parse((res as { content: { text: string }[] }).content[0]!.text);

beforeAll(async () => {
  handle = createDb();
  await handle.migrate();
  await seedDemo(handle.db, KEY);
  const app = createApp({ db: handle.db });
  const fetchViaApp = ((url: string, init?: RequestInit) => app.request(url, init)) as typeof fetch;
  const server = createLumeMcpServer(httpFetcher("http://lume.test", KEY, fetchViaApp));
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await server.connect(serverSide);
  client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(clientSide);
});

afterAll(async () => {
  await client?.close();
  await handle?.close();
});

describe("MCP-Server", () => {
  it("bietet die Werkzeuge an", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toEqual(
      expect.arrayContaining(["find_free_slots", "book_appointment", "cancel_appointment", "search_customers"]),
    );
  });

  it("findet freie Zeiten, bucht und sagt wieder ab – wie ein KI-Assistent", async () => {
    const services = parse(await client.callTool({ name: "list_services", arguments: {} }));
    const lashes = services.find((s: { name: string }) => s.name === "Wimpernlifting");
    const date = "2030-03-05"; // Dienstag: beide arbeiten
    const free = parse(await client.callTool({ name: "find_free_slots", arguments: { serviceId: lashes.id, date } }));
    expect(free.slots.length).toBeGreaterThan(0);

    const booked = parse(
      await client.callTool({
        name: "book_appointment",
        arguments: { serviceId: lashes.id, startsAt: free.slots[0].startsAt, firstName: "Mara", email: "mara@example.com" },
      }),
    );
    expect(booked).toMatchObject({ customerName: "Mara", source: "assistant", status: "booked" });

    const cancelled = parse(
      await client.callTool({ name: "cancel_appointment", arguments: { appointmentId: booked.id } }),
    );
    expect(cancelled.status).toBe("cancelled");
  });

  it("meldet Fehler verständlich statt abzustürzen", async () => {
    const res = await client.callTool({
      name: "cancel_appointment",
      arguments: { appointmentId: "00000000-0000-4000-8000-000000000000" },
    });
    expect(res.isError).toBe(true);
    expect((res.content as { text: string }[])[0]!.text).toBe("Termin nicht gefunden");
  });
});
