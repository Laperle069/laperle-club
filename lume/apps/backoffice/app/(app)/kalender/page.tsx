import type { AppointmentDto, StaffDto, StudioDto } from "@lume/api/types";
import Link from "next/link";
import { api, ApiRequestError } from "@/lib/api";
import { addDays, dateInTz, dayBounds, euro, longDate, SOURCE_LABEL, STATUS_LABEL, time, today } from "@/lib/format";
import { setAppointmentStatus } from "@/app/actions";
import { ApiProblem, Notice, params, type SearchParams } from "@/app/ui";

export const dynamic = "force-dynamic";

const START_HOUR = 7;
const END_HOUR = 21;
const PX_PER_MIN = 1.6;

function minutesSinceStart(iso: string, tz: string) {
  const [h, m] = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: tz })
    .format(new Date(iso))
    .split(":")
    .map(Number);
  return (h ?? 0) * 60 + (m ?? 0) - START_HOUR * 60;
}

export default async function Calendar({ searchParams }: { searchParams: SearchParams }) {
  const get = await params(searchParams);
  const date = get("datum") ?? today();
  let studio: StudioDto;
  let staff: StaffDto[];
  let appointments: AppointmentDto[];
  try {
    studio = await api<StudioDto>("/studio");
    staff = (await api<StaffDto[]>("/staff")).filter((s) => s.active);
    const { from, to } = dayBounds(date);
    appointments = (await api<AppointmentDto[]>(`/appointments?from=${from}&to=${to}`)).filter(
      (a) => dateInTz(a.startsAt, studio.timezone) === date,
    );
  } catch (err) {
    if (err instanceof ApiRequestError) return <ApiProblem error={err} />;
    throw err;
  }
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const height = (END_HOUR - START_HOUR) * 60 * PX_PER_MIN;

  return (
    <>
      <div className="row space">
        <h1>Kalender</h1>
        <div className="row">
          <Link className="button ghost" href={`/kalender?datum=${addDays(date, -1)}`}>
            ← Vortag
          </Link>
          <Link className="button ghost" href={`/kalender?datum=${today()}`}>
            Heute
          </Link>
          <Link className="button ghost" href={`/kalender?datum=${addDays(date, 1)}`}>
            Folgetag →
          </Link>
          <Link className="button" href={`/termine/neu?datum=${date}`}>
            + Termin
          </Link>
        </div>
      </div>
      <p className="muted">{longDate(date)}</p>
      <Notice fehler={get("fehler")} ok={get("ok")} />
      {staff.length === 0 ? (
        <p className="muted">
          Noch keine Mitarbeiter. <Link href="/mitarbeiter">Jetzt anlegen</Link>
        </p>
      ) : (
        <div className="calendar" style={{ gridTemplateColumns: `3.5rem repeat(${staff.length}, minmax(11rem, 1fr))` }}>
          <div />
          {staff.map((s) => (
            <div key={s.id} className="cal-head">
              <span className="dot" style={{ background: s.color }} /> {s.displayName}
            </div>
          ))}
          <div className="cal-times" style={{ height }}>
            {hours.map((h) => (
              <span key={h} style={{ top: (h - START_HOUR) * 60 * PX_PER_MIN }}>
                {String(h).padStart(2, "0")}:00
              </span>
            ))}
          </div>
          {staff.map((s) => (
            <div key={s.id} className="cal-col" style={{ height }}>
              {hours.map((h) => (
                <div key={h} className="cal-line" style={{ top: (h - START_HOUR) * 60 * PX_PER_MIN }} />
              ))}
              {appointments
                .filter((a) => a.staffId === s.id)
                .map((a) => {
                  const top = Math.max(0, minutesSinceStart(a.startsAt, studio.timezone)) * PX_PER_MIN;
                  const len = (new Date(a.endsAt).getTime() - new Date(a.startsAt).getTime()) / 60000;
                  return (
                    <div
                      key={a.id}
                      className={`appt status-${a.status}`}
                      style={{ top, height: Math.max(len * PX_PER_MIN, 22), borderColor: s.color }}
                    >
                      <strong>
                        {time(a.startsAt)}–{time(a.endsAt)} {a.customerName}
                      </strong>
                      <span>
                        {a.serviceName} · {euro(a.priceCents)}
                      </span>
                      <span className="small muted">
                        {STATUS_LABEL[a.status]} · {SOURCE_LABEL[a.source]}
                      </span>
                      {a.status === "booked" || a.status === "confirmed" ? (
                        <form action={setAppointmentStatus} className="appt-actions">
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="date" value={date} />
                          <button name="status" value="completed" title="Erledigt">
                            ✓
                          </button>
                          <button name="status" value="no_show" title="Nicht erschienen">
                            ∅
                          </button>
                          <button name="status" value="cancelled" title="Absagen">
                            ✕
                          </button>
                        </form>
                      ) : null}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
