import type { AppointmentDto, StudioDto } from "@lume/api/types";
import Link from "next/link";
import { api, ApiRequestError } from "@/lib/api";
import { addDays, dateInTz, dayBounds, euro, longDate, shortDateTime, STATUS_LABEL, today } from "@/lib/format";
import { ApiProblem } from "@/app/ui";

export const dynamic = "force-dynamic";

export default async function Overview() {
  let studio: StudioDto;
  let todays: AppointmentDto[];
  let upcoming: AppointmentDto[];
  const date = today();
  try {
    studio = await api<StudioDto>("/studio");
    const { from, to } = dayBounds(date);
    todays = (await api<AppointmentDto[]>(`/appointments?from=${from}&to=${to}`)).filter(
      (a) => dateInTz(a.startsAt, studio.timezone) === date,
    );
    upcoming = await api<AppointmentDto[]>(
      `/appointments?from=${new Date().toISOString()}&to=${addDays(date, 14)}T23:59:59Z`,
    );
  } catch (err) {
    if (err instanceof ApiRequestError) return <ApiProblem error={err} />;
    throw err;
  }
  const active = todays.filter((a) => a.status !== "no_show");
  return (
    <>
      <h1>{studio.name}</h1>
      <p className="muted">{longDate(date)}</p>
      <section className="stats">
        <div className="stat">
          <span>Termine heute</span>
          <strong>{active.length}</strong>
        </div>
        <div className="stat">
          <span>Geplanter Umsatz heute</span>
          <strong>{euro(active.reduce((sum, a) => sum + a.priceCents, 0))}</strong>
        </div>
        <div className="stat">
          <span>Termine nächste 14 Tage</span>
          <strong>{upcoming.length}</strong>
        </div>
      </section>
      <div className="row space">
        <h2>Nächste Termine</h2>
        <Link className="button" href="/termine/neu">
          + Neuer Termin
        </Link>
      </div>
      {upcoming.length === 0 ? (
        <p className="muted">Keine Termine in den nächsten 14 Tagen.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Wann</th>
              <th>Kundin</th>
              <th>Leistung</th>
              <th>Bei</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.slice(0, 10).map((a) => (
              <tr key={a.id}>
                <td>
                  <Link href={`/kalender?datum=${dateInTz(a.startsAt)}`}>
                    {shortDateTime(a.startsAt)}
                  </Link>
                </td>
                <td>{a.customerName}</td>
                <td>{a.serviceName}</td>
                <td>{a.staffName}</td>
                <td>{STATUS_LABEL[a.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
