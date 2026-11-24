import type { Role } from "@lume/core";
import type { Db } from "@lume/db";

export interface AuthContext {
  studioId: string;
  role: Role;
  apiKeyId: string;
}

export type AppEnv = {
  Variables: {
    db: Db;
    auth: AuthContext;
  };
};
