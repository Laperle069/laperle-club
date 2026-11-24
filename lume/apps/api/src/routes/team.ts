import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { ROLE_RANK, type Role } from "@lume/core";
import { and, asc, count, eq, hashPassword, memberships, sessions, users, type Db } from "@lume/db";
import { requirePermission } from "../auth.js";
import type { AppEnv } from "../context.js";
import { ApiError, notFound } from "../errors.js";
import { RoleSchema, TeamInviteSchema, TeamMemberSchema, Uuid } from "../schemas.js";
import { body, errors, json, security } from "./helpers.js";

/** Team: wer hat Zugang zum Backoffice und mit welcher Rolle. */
export const teamRoutes = new OpenAPIHono<AppEnv>();

const UserParam = z.object({ userId: Uuid.openapi({ param: { name: "userId", in: "path" } }) });

function assertMayAssign(actor: Role, target: Role) {
  if (ROLE_RANK[target] > ROLE_RANK[actor]) {
    throw new ApiError(403, "forbidden", "Diese Rolle darfst du nicht vergeben");
  }
}

async function listTeam(db: Db, studioId: string) {
  const rows = await db
    .select({ user: users, role: memberships.role })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.studioId, studioId))
    .orderBy(asc(users.name));
  return rows.map(({ user, role }) => ({
    userId: user.id,
    email: user.email,
    name: user.name,
    role,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
  }));
}

async function getMembership(db: Db, studioId: string, userId: string) {
  const [m] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.studioId, studioId), eq(memberships.userId, userId)))
    .limit(1);
  if (!m) throw notFound("Teammitglied");
  return m;
}

/** Ein Studio darf nie ohne Inhaber dastehen. */
async function assertKeepsOwner(db: Db, studioId: string, userId: string, current: Role, next: Role | null) {
  if (current !== "owner" || next === "owner") return;
  const [row] = await db
    .select({ n: count() })
    .from(memberships)
    .where(and(eq(memberships.studioId, studioId), eq(memberships.role, "owner")));
  if ((row?.n ?? 0) <= 1) {
    throw new ApiError(409, "last_owner", "Das Studio braucht mindestens eine Inhaberin");
  }
}

teamRoutes.openapi(
  createRoute({
    method: "get",
    path: "/team",
    tags: ["Team"],
    summary: "Alle Personen mit Zugang",
    security,
    responses: { 200: json(z.array(TeamMemberSchema), "Team"), 403: errors[403] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "team:read");
    return c.json(await listTeam(c.get("db"), studioId), 200);
  },
);

teamRoutes.openapi(
  createRoute({
    method: "post",
    path: "/team",
    tags: ["Team"],
    summary: "Person hinzufügen (mit Startpasswort)",
    security,
    request: body(TeamInviteSchema),
    responses: { 201: json(z.array(TeamMemberSchema), "Team"), 400: errors[400], 403: errors[403], 409: errors[409] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "team:manage");
    const input = c.req.valid("json");
    assertMayAssign(c.get("auth").role, input.role);
    const db = c.get("db");
    const email = input.email.trim().toLowerCase();
    await db.transaction(async (tx) => {
      let [user] = await tx.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) {
        [user] = await tx
          .insert(users)
          .values({ email, name: input.name, passwordHash: await hashPassword(input.password) })
          .returning();
      }
      if (!user) throw new Error("Benutzer nicht gespeichert");
      const inserted = await tx
        .insert(memberships)
        .values({ studioId, userId: user.id, role: input.role })
        .onConflictDoNothing()
        .returning({ id: memberships.id });
      if (inserted.length === 0) throw new ApiError(409, "already_member", "Diese Person gehört schon zum Team");
    });
    return c.json(await listTeam(db, studioId), 201);
  },
);

teamRoutes.openapi(
  createRoute({
    method: "patch",
    path: "/team/{userId}",
    tags: ["Team"],
    summary: "Rolle ändern",
    security,
    request: { params: UserParam, ...body(z.object({ role: RoleSchema })) },
    responses: { 200: json(z.array(TeamMemberSchema), "Team"), 403: errors[403], 404: errors[404], 409: errors[409] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "team:manage");
    const { userId } = c.req.valid("param");
    const { role } = c.req.valid("json");
    const db = c.get("db");
    const m = await getMembership(db, studioId, userId);
    assertMayAssign(c.get("auth").role, role);
    assertMayAssign(c.get("auth").role, m.role);
    await assertKeepsOwner(db, studioId, userId, m.role, role);
    await db.update(memberships).set({ role }).where(eq(memberships.id, m.id));
    return c.json(await listTeam(db, studioId), 200);
  },
);

teamRoutes.openapi(
  createRoute({
    method: "delete",
    path: "/team/{userId}",
    tags: ["Team"],
    summary: "Zugang entziehen (meldet die Person sofort ab)",
    security,
    request: { params: UserParam },
    responses: { 200: json(z.array(TeamMemberSchema), "Team"), 403: errors[403], 404: errors[404], 409: errors[409] },
  }),
  async (c) => {
    const studioId = requirePermission(c, "team:manage");
    const { userId } = c.req.valid("param");
    const db = c.get("db");
    const m = await getMembership(db, studioId, userId);
    assertMayAssign(c.get("auth").role, m.role);
    await assertKeepsOwner(db, studioId, userId, m.role, null);
    await db.transaction(async (tx) => {
      await tx.delete(memberships).where(eq(memberships.id, m.id));
      await tx.delete(sessions).where(and(eq(sessions.userId, userId), eq(sessions.studioId, studioId)));
    });
    return c.json(await listTeam(db, studioId), 200);
  },
);
