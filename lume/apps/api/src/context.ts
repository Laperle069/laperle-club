import type { Role } from "@lume/core";
import type { Db } from "@lume/db";

export interface AuthContext {
  studioId: string;
  role: Role;
  /** Wie angemeldet: Mensch (Sitzung) oder Programm/Agent (API-Schlüssel) */
  kind: "session" | "api_key";
  userId?: string;
  sessionId?: string;
  apiKeyId?: string;
}

export type AppEnv = {
  Variables: {
    db: Db;
    auth: AuthContext;
  };
};
