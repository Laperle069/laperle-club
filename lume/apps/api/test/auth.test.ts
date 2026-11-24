import { createDb, hashPassword, memberships, studios, users, type DbHandle } from "@lume/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let handle: DbHandle;
let app: ReturnType<typeof createApp>;
const PASSWORD = "sicheres-passwort-1";

async function call(method: string, path: string, opts: { token?: string; body?: unknown } = {}) {
  const res = await app.request(path, {
    method,
    headers: {
      "content-type": "application/json",
      ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

const login = (email: string, password = PASSWORD, studioSlug?: string) =>
  call("POST", "/v1/auth/login", { body: { email, password, studioSlug } });

beforeAll(async () => {
  handle = createDb();
  await handle.migrate();
  const [a, b] = await handle.db
    .insert(studios)
    .values([
      { slug: "studio-a", name: "Studio A" },
      { slug: "studio-b", name: "Studio B" },
    ])
    .returning();
  const [owner] = await handle.db
    .insert(users)
    .values({ email: "inhaberin@example.com", name: "Ines", passwordHash: await hashPassword(PASSWORD) })
    .returning();
  await handle.db.insert(memberships).values([
    { studioId: a!.id, userId: owner!.id, role: "owner" },
    { studioId: b!.id, userId: owner!.id, role: "staff" },
  ]);
  app = createApp({ db: handle.db });
});

afterAll(async () => {
  await handle?.close();
});

describe("Anmeldung", () => {
  it("meldet mit richtigem Passwort an und kennt Studio und Rolle", async () => {
    const res = await login("Inhaberin@Example.com");
    expect(res.status).toBe(200);
    expect(res.body.token).toMatch(/^lume_sess_/);
    expect(res.body).toMatchObject({ role: "owner", studio: { slug: "studio-a" }, user: { name: "Ines" } });
    expect(res.body.studios).toHaveLength(2);

    const me = await call("GET", "/v1/auth/me", { token: res.body.token });
    expect(me.body.user.email).toBe("inhaberin@example.com");
    expect((await call("GET", "/v1/services", { token: res.body.token })).status).toBe(200);
  });

  it("gibt bei falschem Passwort und unbekannter E-Mail dieselbe Meldung", async () => {
    const wrong = await login("inhaberin@example.com", "falsch-falsch");
    const unknown = await login("niemand@example.com", "falsch-falsch");
    expect(wrong.status).toBe(401);
    expect(unknown.body).toEqual(wrong.body);
  });

  it("wählt auf Wunsch ein anderes Studio – mit der Rolle dort", async () => {
    const res = await login("inhaberin@example.com", PASSWORD, "studio-b");
    expect(res.body.role).toBe("staff");
    const team = await call("POST", "/v1/team", {
      token: res.body.token,
      body: { email: "x@example.com", name: "X", role: "staff", password: "langes-passwort" },
    });
    expect(team.status).toBe(403);
  });

  it("beendet die Sitzung beim Abmelden", async () => {
    const { body } = await login("inhaberin@example.com");
    expect((await call("POST", "/v1/auth/logout", { token: body.token })).status).toBe(200);
    expect((await call("GET", "/v1/auth/me", { token: body.token })).status).toBe(401);
  });

  it("bremst nach vielen Fehlversuchen", async () => {
    const email = "bremse@example.com";
    for (let i = 0; i < 10; i++) expect((await login(email, "falsch")).status).toBe(401);
    expect((await login(email, "falsch")).status).toBe(429);
  });
});

describe("Team", () => {
  let owner: string;
  beforeAll(async () => {
    owner = (await login("inhaberin@example.com")).body.token;
  });

  it("legt Mitarbeiter an, die sich danach anmelden können", async () => {
    const res = await call("POST", "/v1/team", {
      token: owner,
      body: { email: "sara@example.com", name: "Sara", role: "reception", password: "sara-passwort-1" },
    });
    expect(res.status).toBe(201);
    expect(res.body.map((m: { name: string }) => m.name)).toEqual(["Ines", "Sara"]);

    const sara = await login("sara@example.com", "sara-passwort-1");
    expect(sara.body.role).toBe("reception");
    // Empfang darf Termine verwalten, aber kein Team und keine Schlüssel
    expect((await call("GET", "/v1/appointments?from=2030-01-01T00:00:00Z&to=2030-01-02T00:00:00Z", { token: sara.body.token })).status).toBe(200);
    expect((await call("GET", "/v1/api-keys", { token: sara.body.token })).status).toBe(403);
  });

  it("lässt das Studio nie ohne Inhaberin", async () => {
    const me = (await call("GET", "/v1/auth/me", { token: owner })).body;
    const res = await call("PATCH", `/v1/team/${me.user.id}`, { token: owner, body: { role: "manager" } });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("last_owner");
  });

  it("entzieht den Zugang sofort", async () => {
    const sara = (await login("sara@example.com", "sara-passwort-1")).body;
    const res = await call("DELETE", `/v1/team/${sara.user.id}`, { token: owner });
    expect(res.status).toBe(200);
    expect((await call("GET", "/v1/services", { token: sara.token })).status).toBe(401);
    expect((await login("sara@example.com", "sara-passwort-1")).status).toBe(401);
  });

  it("ändert das eigene Passwort und meldet andere Geräte ab", async () => {
    await call("POST", "/v1/team", {
      token: owner,
      body: { email: "mila@example.com", name: "Mila", role: "staff", password: "mila-passwort-1" },
    });
    const phone = (await login("mila@example.com", "mila-passwort-1")).body.token;
    const laptop = (await login("mila@example.com", "mila-passwort-1")).body.token;
    const short = await call("POST", "/v1/auth/password", {
      token: laptop,
      body: { currentPassword: "mila-passwort-1", newPassword: "kurz" },
    });
    expect(short.status).toBe(400);
    const ok = await call("POST", "/v1/auth/password", {
      token: laptop,
      body: { currentPassword: "mila-passwort-1", newPassword: "mila-neues-passwort" },
    });
    expect(ok.status).toBe(200);
    expect((await call("GET", "/v1/auth/me", { token: laptop })).status).toBe(200);
    expect((await call("GET", "/v1/auth/me", { token: phone })).status).toBe(401);
    expect((await login("mila@example.com", "mila-neues-passwort")).status).toBe(200);
  });
});

describe("API-Schlüssel", () => {
  let owner: string;
  beforeAll(async () => {
    owner = (await login("inhaberin@example.com")).body.token;
  });

  it("zeigt den Schlüssel nur einmal, danach funktioniert er für Programme", async () => {
    const res = await call("POST", "/v1/api-keys", { token: owner, body: { name: "Buchungs-Agent", role: "reception" } });
    expect(res.status).toBe(201);
    expect(res.body.key).toMatch(/^lume_live_/);
    expect(res.body.key.startsWith(res.body.prefix)).toBe(true);

    const listed = await call("GET", "/v1/api-keys", { token: owner });
    expect(JSON.stringify(listed.body)).not.toContain(res.body.key);

    const used = await call("GET", "/v1/services", { token: res.body.key });
    expect(used.status).toBe(200);
    const after = (await call("GET", "/v1/api-keys", { token: owner })).body;
    expect(after.find((k: { id: string }) => k.id === res.body.id).lastUsedAt).not.toBeNull();

    // Ein Empfangs-Schlüssel darf keine Schlüssel verwalten und ist keine Person
    expect((await call("POST", "/v1/api-keys", { token: res.body.key, body: { name: "x" } })).status).toBe(403);
    expect((await call("GET", "/v1/auth/me", { token: res.body.key })).status).toBe(403);
  });

  it("sperrt Schlüssel sofort", async () => {
    const { body: created } = await call("POST", "/v1/api-keys", { token: owner, body: { name: "Zapier", role: "staff" } });
    const res = await call("DELETE", `/v1/api-keys/${created.id}`, { token: owner });
    expect(res.status).toBe(200);
    expect(res.body.find((k: { id: string }) => k.id === created.id).revokedAt).not.toBeNull();
    expect((await call("GET", "/v1/services", { token: created.key })).status).toBe(401);
  });

  it("sieht keine Schlüssel anderer Studios", async () => {
    const other = (await login("inhaberin@example.com", PASSWORD, "studio-b")).body.token;
    const { body: created } = await call("POST", "/v1/api-keys", { token: owner, body: { name: "Nur A" } });
    expect((await call("DELETE", `/v1/api-keys/${created.id}`, { token: other })).status).toBe(403);
  });
});
