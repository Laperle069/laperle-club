import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  and,
  asc,
  eq,
  generateToken,
  hashPassword,
  hashToken,
  memberships,
  ne,
  sessions,
  studios,
  users,
  verifyPassword,
  type Db,
} from "@lume/db";
import {
  checkLoginAllowed,
  clearLoginFailures,
  recordLoginFailure,
  requireSession,
  SESSION_DAYS,
  SESSION_PREFIX,
} from "../auth.js";
import type { AppEnv } from "../context.js";
import { ApiError } from "../errors.js";
import { LoginResultSchema, LoginSchema, MeSchema, PasswordChangeSchema } from "../schemas.js";
import { body, errors, json, security } from "./helpers.js";
import { z } from "@hono/zod-openapi";

/** Öffentlich: Anmelden. */
export const loginRoutes = new OpenAPIHono<AppEnv>();
/** Mit Sitzung: wer bin ich, abmelden, Passwort ändern. */
export const authRoutes = new OpenAPIHono<AppEnv>();

const invalidLogin = () => new ApiError(401, "invalid_login", "E-Mail oder Passwort falsch");

// Für unbekannte E-Mails trotzdem einen Hash prüfen, damit die Antwortzeit nichts verrät
let dummyHash: Promise<string> | undefined;

async function userStudios(db: Db, userId: string) {
  return db
    .select({ id: studios.id, slug: studios.slug, name: studios.name, role: memberships.role })
    .from(memberships)
    .innerJoin(studios, eq(studios.id, memberships.studioId))
    .where(eq(memberships.userId, userId))
    .orderBy(asc(studios.name));
}

async function me(db: Db, userId: string, studioId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const list = await userStudios(db, userId);
  const current = list.find((s) => s.id === studioId);
  if (!user || !current) throw new ApiError(401, "unauthorized", "Nicht angemeldet");
  return {
    user: { id: user.id, email: user.email, name: user.name },
    studio: { id: current.id, slug: current.slug, name: current.name },
    role: current.role,
    studios: list.map((s) => ({ slug: s.slug, name: s.name, role: s.role })),
  };
}

loginRoutes.openapi(
  createRoute({
    method: "post",
    path: "/auth/login",
    tags: ["Anmeldung"],
    summary: "Mit E-Mail und Passwort anmelden",
    request: body(LoginSchema),
    responses: { 200: json(LoginResultSchema, "Angemeldet"), 401: errors[401], 429: errors[429] },
  }),
  async (c) => {
    const db = c.get("db");
    const input = c.req.valid("json");
    const email = input.email.trim().toLowerCase();
    checkLoginAllowed(email);

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const ok = user?.passwordHash
      ? await verifyPassword(input.password, user.passwordHash)
      : (await verifyPassword(input.password, await (dummyHash ??= hashPassword("dummy-passwort"))), false);
    if (!user || !ok) {
      recordLoginFailure(email);
      throw invalidLogin();
    }
    const list = await userStudios(db, user.id);
    const studio = input.studioSlug ? list.find((s) => s.slug === input.studioSlug) : list[0];
    if (!studio) {
      recordLoginFailure(email);
      throw invalidLogin();
    }
    clearLoginFailures(email);

    const token = generateToken(SESSION_PREFIX);
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
    await db.insert(sessions).values({ userId: user.id, studioId: studio.id, tokenHash: hashToken(token), expiresAt });
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    return c.json({ ...(await me(db, user.id, studio.id)), token, expiresAt: expiresAt.toISOString() }, 200);
  },
);

authRoutes.openapi(
  createRoute({
    method: "get",
    path: "/auth/me",
    tags: ["Anmeldung"],
    summary: "Angemeldete Person, aktuelles Studio und Rolle",
    security,
    responses: { 200: json(MeSchema, "Angemeldet"), 401: errors[401], 403: errors[403] },
  }),
  async (c) => {
    const auth = requireSession(c);
    return c.json(await me(c.get("db"), auth.userId, auth.studioId), 200);
  },
);

authRoutes.openapi(
  createRoute({
    method: "post",
    path: "/auth/logout",
    tags: ["Anmeldung"],
    summary: "Abmelden (beendet diese Sitzung)",
    security,
    responses: { 200: json(z.object({ ok: z.boolean() }), "Abgemeldet") },
  }),
  async (c) => {
    const auth = requireSession(c);
    await c.get("db").delete(sessions).where(eq(sessions.id, auth.sessionId));
    return c.json({ ok: true }, 200);
  },
);

authRoutes.openapi(
  createRoute({
    method: "post",
    path: "/auth/password",
    tags: ["Anmeldung"],
    summary: "Eigenes Passwort ändern (meldet alle anderen Geräte ab)",
    security,
    request: body(PasswordChangeSchema),
    responses: { 200: json(z.object({ ok: z.boolean() }), "Geändert"), 400: errors[400], 401: errors[401] },
  }),
  async (c) => {
    const auth = requireSession(c);
    const db = c.get("db");
    const input = c.req.valid("json");
    const [user] = await db.select().from(users).where(eq(users.id, auth.userId)).limit(1);
    if (!user?.passwordHash || !(await verifyPassword(input.currentPassword, user.passwordHash))) {
      throw new ApiError(400, "invalid_password", "Aktuelles Passwort ist falsch");
    }
    await db.update(users).set({ passwordHash: await hashPassword(input.newPassword) }).where(eq(users.id, user.id));
    await db.delete(sessions).where(and(eq(sessions.userId, user.id), ne(sessions.id, auth.sessionId)));
    return c.json({ ok: true }, 200);
  },
);
