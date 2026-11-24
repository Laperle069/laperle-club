import { can, type Permission } from "@lume/core";
import {
  and,
  apiKeys,
  eq,
  hashApiKey,
  isNull,
} from "@lume/db";
import type { Context, MiddlewareHandler } from "hono";
import type { AppEnv } from "./context.js";
import { ApiError } from "./errors.js";

/**
 * Anmeldung per API-Schlüssel: "Authorization: Bearer lume_…".
 * Der Schlüssel bestimmt Studio und Rolle. Ein Schlüssel sieht nie Daten anderer Studios.
 */
export const requireApiKey: MiddlewareHandler<AppEnv> = async (c, next) => {
  const header = c.req.header("authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  if (!match?.[1]) throw new ApiError(401, "unauthorized", "API-Schlüssel fehlt");
  const db = c.get("db");
  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.hash, hashApiKey(match[1])), isNull(apiKeys.revokedAt)))
    .limit(1);
  if (!key) throw new ApiError(401, "unauthorized", "API-Schlüssel ungültig");
  c.set("auth", { studioId: key.studioId, role: key.role, apiKeyId: key.id });
  await next();
};

export function requirePermission(c: Context<AppEnv>, permission: Permission): string {
  const auth = c.get("auth");
  if (!can(auth.role, permission)) {
    throw new ApiError(403, "forbidden", `Keine Berechtigung (${permission})`);
  }
  return auth.studioId;
}
