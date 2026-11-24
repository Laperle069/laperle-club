import { can, type Permission } from "@lume/core";
import { and, apiKeys, eq, gt, hashToken, isNull, memberships, sessions } from "@lume/db";
import type { Context, MiddlewareHandler } from "hono";
import type { AppEnv } from "./context.js";
import { ApiError } from "./errors.js";

export const SESSION_PREFIX = "lume_sess";
export const SESSION_DAYS = 14;
const TOUCH_AFTER_MS = 60 * 60 * 1000;

/**
 * Anmeldung per "Authorization: Bearer …". Zwei Arten:
 * - Sitzung eines Menschen (lume_sess_…): Rolle kommt frisch aus der Mitgliedschaft.
 * - API-Schlüssel (lume_live_…): für Programme und KI-Agenten, Rolle steht am Schlüssel.
 * In beiden Fällen gilt der Zugang für genau ein Studio.
 */
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const header = c.req.header("authorization") ?? "";
  const token = /^Bearer\s+(\S+)$/i.exec(header)?.[1];
  if (!token) throw new ApiError(401, "unauthorized", "Nicht angemeldet");
  const db = c.get("db");
  const hash = hashToken(token);
  const now = new Date();

  if (token.startsWith(`${SESSION_PREFIX}_`)) {
    const [row] = await db
      .select({ session: sessions, role: memberships.role })
      .from(sessions)
      .innerJoin(
        memberships,
        and(eq(memberships.userId, sessions.userId), eq(memberships.studioId, sessions.studioId)),
      )
      .where(and(eq(sessions.tokenHash, hash), gt(sessions.expiresAt, now)))
      .limit(1);
    if (!row) throw new ApiError(401, "unauthorized", "Sitzung abgelaufen, bitte neu anmelden");
    const { session } = row;
    if (now.getTime() - session.lastSeenAt.getTime() > TOUCH_AFTER_MS) {
      // Gleitende Gültigkeit: wer aktiv ist, bleibt angemeldet
      await db
        .update(sessions)
        .set({ lastSeenAt: now, expiresAt: new Date(now.getTime() + SESSION_DAYS * 86_400_000) })
        .where(eq(sessions.id, session.id));
    }
    c.set("auth", {
      kind: "session",
      studioId: session.studioId,
      role: row.role,
      userId: session.userId,
      sessionId: session.id,
    });
    return next();
  }

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.hash, hash), isNull(apiKeys.revokedAt)))
    .limit(1);
  if (!key) throw new ApiError(401, "unauthorized", "API-Schlüssel ungültig oder gesperrt");
  if (!key.lastUsedAt || now.getTime() - key.lastUsedAt.getTime() > 60_000) {
    await db.update(apiKeys).set({ lastUsedAt: now }).where(eq(apiKeys.id, key.id));
  }
  c.set("auth", { kind: "api_key", studioId: key.studioId, role: key.role, apiKeyId: key.id });
  return next();
};

export function requirePermission(c: Context<AppEnv>, permission: Permission): string {
  const auth = c.get("auth");
  if (!can(auth.role, permission)) {
    throw new ApiError(403, "forbidden", `Keine Berechtigung (${permission})`);
  }
  return auth.studioId;
}

export function requireSession(c: Context<AppEnv>) {
  const auth = c.get("auth");
  if (auth.kind !== "session" || !auth.userId || !auth.sessionId) {
    throw new ApiError(403, "session_required", "Nur für angemeldete Personen, nicht für API-Schlüssel");
  }
  return { ...auth, userId: auth.userId, sessionId: auth.sessionId };
}

/**
 * Einfache Bremse gegen Passwort-Raten: nach 10 Fehlversuchen je E-Mail
 * 15 Minuten Pause. Liegt im Speicher; bei mehreren Servern später in Redis/DB.
 */
const failures = new Map<string, { count: number; until: number }>();
const MAX_FAILURES = 10;
const LOCK_MS = 15 * 60 * 1000;

export function checkLoginAllowed(email: string, now = Date.now()) {
  const entry = failures.get(email);
  if (entry && entry.count >= MAX_FAILURES && entry.until > now) {
    throw new ApiError(429, "too_many_attempts", "Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen.");
  }
}

export function recordLoginFailure(email: string, now = Date.now()) {
  const entry = failures.get(email);
  const fresh = !entry || entry.until <= now;
  failures.set(email, { count: fresh ? 1 : entry.count + 1, until: now + LOCK_MS });
}

export function clearLoginFailures(email: string) {
  failures.delete(email);
}
