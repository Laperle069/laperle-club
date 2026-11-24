import type { ServiceDto, StaffDto } from "@lume/api/types";
import { api, ApiRequestError } from "@/lib/api";
import { WEEKDAYS } from "@/lib/format";
import { createStaff } from "@/app/actions";
import { ApiProblem, Notice, params, type SearchParams } from "@/app/ui";

export const dynamic = "force-dynamic";

function hoursSummary(s: StaffDto) {
  if (s.workingHours.length === 0) return "keine Arbeitszeiten";
  return s.workingHours.map((h) => `${WEEKDAYS[h.weekday - 1]} ${h.start}–${h.end}`).join(", ");
}

export default async function Staff({ searchParams }: { searchParams: SearchParams }) {
  const get = await params(searchParams);
  let staff: StaffDto[];
  let services: ServiceDto[];
  try {
    [staff, services] = await Promise.all([api<StaffDto[]>("/staff"), api<ServiceDto[]>("/services")]);
  } catch (err) {
    if (err instanceof ApiRequestError) return <ApiProblem error={err} />;
    throw err;
  }
  const serviceName = (id: string) => services.find((s) => s.id === id)?.name ?? "?";
  return (
    <>
      <h1>Mitarbeiter</h1>
      <Notice fehler={get("fehler")} ok={get("ok")} />
      <div className="cards">
        {staff.map((s) => (
          <div key={s.id} className={`card ${s.active ? "" : "inactive"}`}>
            <h3>
              <span className="dot" style={{ background: s.color }} /> {s.displayName}
            </h3>
            <p className="small">{hoursSummary(s)}</p>
            <p className="small muted">{s.serviceIds.map(serviceName).join(", ") || "keine Leistungen"}</p>
          </div>
        ))}
      </div>

      <form className="card" action={createStaff}>
        <h2>Mitarbeiter anlegen</h2>
        <div className="form-row">
          <label>
            Name
            <input name="displayName" required />
          </label>
          <label>
            E-Mail
            <input name="email" type="email" />
          </label>
          <label>
            Farbe im Kalender
            <input name="color" type="color" defaultValue="#8b7cf6" />
          </label>
        </div>
        <fieldset>
          <legend>Arbeitstage</legend>
          {WEEKDAYS.map((d, i) => (
            <label key={d} className="check inline">
              <input type="checkbox" name="weekday" value={i + 1} defaultChecked={i < 5} /> {d}
            </label>
          ))}
          <div className="form-row">
            <label>
              von
              <input type="time" name="start" defaultValue="09:00" />
            </label>
            <label>
              bis
              <input type="time" name="end" defaultValue="18:00" />
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Leistungen</legend>
          {services
            .filter((s) => s.active)
            .map((s) => (
              <label key={s.id} className="check inline">
                <input type="checkbox" name="serviceId" value={s.id} defaultChecked /> {s.name}
              </label>
            ))}
        </fieldset>
        <button type="submit">Speichern</button>
      </form>
    </>
  );
}
