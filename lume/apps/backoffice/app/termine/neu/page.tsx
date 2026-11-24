import type { AvailabilityDto, CustomerDto, ServiceDto, StaffDto } from "@lume/api/types";
import Link from "next/link";
import { api, ApiRequestError } from "@/lib/api";
import { addDays, euro, longDate, time, today } from "@/lib/format";
import { bookAppointment } from "../../actions";
import { ApiDown, Notice, params, type SearchParams } from "../../ui";

export const dynamic = "force-dynamic";

/** Termin in drei Schritten: Leistung und Tag → freie Zeit → Kundin. */
export default async function NewAppointment({ searchParams }: { searchParams: SearchParams }) {
  const get = await params(searchParams);
  const serviceId = get("serviceId");
  const staffId = get("staffId") || undefined;
  const date = get("datum") ?? today();
  const slot = get("slot");
  const slotStaff = get("slotStaff");

  let services: ServiceDto[];
  let staff: StaffDto[];
  let availability: AvailabilityDto | null = null;
  let customers: CustomerDto[] = [];
  try {
    [services, staff] = await Promise.all([api<ServiceDto[]>("/services"), api<StaffDto[]>("/staff")]);
    services = services.filter((s) => s.active);
    if (serviceId) {
      const q = new URLSearchParams({ serviceId, date, ...(staffId ? { staffId } : {}) });
      availability = await api<AvailabilityDto>(`/availability?${q}`);
    }
    if (slot) customers = await api<CustomerDto[]>(`/customers?limit=200${get("q") ? `&q=${encodeURIComponent(get("q")!)}` : ""}`);
  } catch (err) {
    if (err instanceof ApiRequestError && err.code === "api_unreachable") return <ApiDown message={err.message} />;
    if (err instanceof ApiRequestError) return <Notice fehler={err.message} />;
    throw err;
  }
  const service = services.find((s) => s.id === serviceId);
  const staffName = (id: string) => staff.find((s) => s.id === id)?.displayName ?? "?";
  const link = (extra: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ serviceId, staffId, datum: date, ...extra })) if (v) q.set(k, v);
    return `/termine/neu?${q}`;
  };

  return (
    <>
      <h1>Neuer Termin</h1>
      <Notice fehler={get("fehler")} />

      <form className="card form-row" method="get">
        <label>
          Leistung
          <select name="serviceId" defaultValue={serviceId ?? ""} required>
            <option value="" disabled>
              Bitte wählen
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.durationMin} Min., {euro(s.priceCents)})
              </option>
            ))}
          </select>
        </label>
        <label>
          Bei
          <select name="staffId" defaultValue={staffId ?? ""}>
            <option value="">Egal, wer frei ist</option>
            {staff
              .filter((s) => s.active && (!serviceId || s.serviceIds.includes(serviceId)))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.displayName}
                </option>
              ))}
          </select>
        </label>
        <label>
          Tag
          <input type="date" name="datum" defaultValue={date} />
        </label>
        <button type="submit">Freie Zeiten zeigen</button>
      </form>

      {service && availability ? (
        <section className="card">
          <div className="row space">
            <h2>
              {service.name} am {longDate(date)}
            </h2>
            <div className="row">
              <Link className="button ghost" href={link({ datum: addDays(date, -1) })}>
                ←
              </Link>
              <Link className="button ghost" href={link({ datum: addDays(date, 1) })}>
                →
              </Link>
            </div>
          </div>
          {availability.slots.length === 0 ? (
            <p className="muted">An diesem Tag ist nichts mehr frei.</p>
          ) : (
            <div className="slots">
              {availability.slots.map((s) => (
                <Link
                  key={s.startsAt}
                  className={`slot ${slot === s.startsAt ? "selected" : ""}`}
                  href={link({ slot: s.startsAt, slotStaff: staffId || s.staffIds[0] })}
                  title={s.staffIds.map(staffName).join(", ")}
                >
                  {time(s.startsAt)}
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {service && slot && slotStaff ? (
        <form className="card" action={bookAppointment}>
          <h2>
            {time(slot)} Uhr bei {staffName(slotStaff)}
          </h2>
          <input type="hidden" name="serviceId" value={service.id} />
          <input type="hidden" name="staffId" value={slotStaff} />
          <input type="hidden" name="startsAt" value={slot} />
          <input type="hidden" name="date" value={date} />
          <label>
            Bestehende Kundin
            <select name="customerId" defaultValue="">
              <option value="">– Neue Kundin (unten eintragen) –</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName ?? ""} {c.email ? `· ${c.email}` : ""} {c.phone ? `· ${c.phone}` : ""}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Neue Kundin</legend>
            <div className="form-row">
              <label>
                Vorname
                <input name="firstName" />
              </label>
              <label>
                Nachname
                <input name="lastName" />
              </label>
              <label>
                E-Mail
                <input name="email" type="email" />
              </label>
              <label>
                Telefon
                <input name="phone" />
              </label>
            </div>
          </fieldset>
          <label>
            Notiz
            <input name="notes" />
          </label>
          <button type="submit">Termin buchen</button>
        </form>
      ) : null}
    </>
  );
}
