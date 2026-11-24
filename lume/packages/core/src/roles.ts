/**
 * Rollen und Rechte. Jeder Zugriff (Mensch, App oder KI-Agent) hat genau eine
 * Rolle in genau einem Studio. Rechte werden nur hier vergeben.
 */
export const ROLES = ["owner", "manager", "reception", "staff"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "studio:read",
  "studio:admin",
  "staff:read",
  "staff:write",
  "services:read",
  "services:write",
  "customers:read",
  "customers:write",
  "appointments:read",
  "appointments:write",
  "modules:write",
  "team:read",
  "team:manage",
  "api_keys:manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const READ_BASICS: Permission[] = ["studio:read", "staff:read", "services:read"];

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  owner: new Set(PERMISSIONS),
  manager: new Set<Permission>([
    ...READ_BASICS,
    "team:read",
    "staff:write",
    "services:write",
    "customers:read",
    "customers:write",
    "appointments:read",
    "appointments:write",
  ]),
  reception: new Set<Permission>([
    ...READ_BASICS,
    "customers:read",
    "customers:write",
    "appointments:read",
    "appointments:write",
  ]),
  staff: new Set<Permission>([...READ_BASICS, "customers:read", "appointments:read"]),
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

/** Rangfolge: wer darf wen verwalten? Höhere Zahl = mehr Rechte. */
export const ROLE_RANK: Record<Role, number> = { owner: 4, manager: 3, reception: 2, staff: 1 };
