/**
 * Bausteine, die ein Studio ein- und ausschalten kann. "booking" ist der Kern
 * und immer an. Vorlagen legen fest, was bei einer Studio-Art zuerst an ist.
 */
export const MODULES = {
  booking: { label: "Terminbuchung", alwaysOn: true },
  marketplace: { label: "Marktplatz-Eintrag", alwaysOn: false },
  pos: { label: "Kasse (TSE, DATEV)", alwaysOn: false },
  memberships: { label: "Abos und Kundenclub", alwaysOn: false },
  marketing: { label: "Marketing und Rückgewinnung", alwaysOn: false },
  accounting: { label: "Buchhaltung", alwaysOn: false },
  inventory: { label: "Lager und Nachbestellung", alwaysOn: false },
  time_tracking: { label: "Zeiterfassung", alwaysOn: false },
  assistant: { label: "KI-Assistent", alwaysOn: false },
} as const;

export type ModuleKey = keyof typeof MODULES;
export const MODULE_KEYS = Object.keys(MODULES) as ModuleKey[];

export function isModuleKey(value: string): value is ModuleKey {
  return value in MODULES;
}

export const STUDIO_TEMPLATES = {
  friseur: ["booking", "marketplace", "pos", "marketing"],
  kosmetik: ["booking", "marketplace", "pos", "memberships", "marketing"],
  nagelstudio: ["booking", "marketplace", "pos", "memberships"],
  barbershop: ["booking", "marketplace", "pos"],
  sonstiges: ["booking"],
} as const satisfies Record<string, readonly ModuleKey[]>;

export type StudioTemplate = keyof typeof STUDIO_TEMPLATES;
