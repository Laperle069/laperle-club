export const TZ = "Europe/Berlin";

export const euro = (cents: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);

export const time = (iso: string, tz = TZ) =>
  new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(iso));

export const longDate = (date: string, tz = TZ) =>
  new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz }).format(
    new Date(`${date}T12:00:00Z`),
  );

export const shortDateTime = (iso: string, tz = TZ) =>
  new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(iso));

/** Heutiges Datum in Studio-Zeit als YYYY-MM-DD. */
export function today(tz = TZ): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Tagesgrenzen in UTC (großzügig, damit Zeitzonen-Versatz abgedeckt ist). */
export function dayBounds(date: string) {
  return { from: `${addDays(date, -1)}T22:00:00Z`, to: `${date}T23:59:59Z` };
}

/** Datum eines Zeitpunkts in Studio-Zeit. */
export function dateInTz(iso: string, tz = TZ): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(iso));
}

export const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export const STATUS_LABEL: Record<string, string> = {
  booked: "Gebucht",
  confirmed: "Bestätigt",
  completed: "Erledigt",
  cancelled: "Abgesagt",
  no_show: "Nicht erschienen",
};

export const SOURCE_LABEL: Record<string, string> = {
  backoffice: "Backoffice",
  online: "Online",
  api: "API",
  assistant: "Assistent",
};
