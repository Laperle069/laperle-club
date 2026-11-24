import type { ModuleDto, StudioDto } from "@lume/api/types";
import { api, ApiRequestError } from "@/lib/api";
import { toggleModule } from "@/app/actions";
import { ApiProblem, Notice, params, type SearchParams } from "@/app/ui";

export const dynamic = "force-dynamic";

export default async function Settings({ searchParams }: { searchParams: SearchParams }) {
  const get = await params(searchParams);
  let studio: StudioDto;
  let modules: ModuleDto[];
  try {
    [studio, modules] = await Promise.all([api<StudioDto>("/studio"), api<ModuleDto[]>("/modules")]);
  } catch (err) {
    if (err instanceof ApiRequestError) return <ApiProblem error={err} />;
    throw err;
  }
  return (
    <>
      <h1>Bausteine</h1>
      <p className="muted">
        Jedes Studio schaltet nur ein, was es braucht. Die Bausteine selbst werden Schritt für Schritt gebaut;
        hier ist schon festgelegt, welche es gibt.
      </p>
      <Notice fehler={get("fehler")} />
      <table>
        <tbody>
          {modules.map((m) => (
            <tr key={m.key}>
              <td>{m.label}</td>
              <td>{m.enabled ? "an" : "aus"}</td>
              <td>
                {m.alwaysOn ? (
                  <span className="muted small">immer an</span>
                ) : (
                  <form action={toggleModule}>
                    <input type="hidden" name="key" value={m.key} />
                    <input type="hidden" name="enabled" value={String(!m.enabled)} />
                    <button className="ghost small">{m.enabled ? "Ausschalten" : "Einschalten"}</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <section className="card">
        <h2>Online-Buchung</h2>
        <p>
          Öffentliche Adresse dieses Studios in der API: <code>/v1/public/studios/{studio.slug}</code>
        </p>
        <p className="muted small">
          Vorlaufzeit {studio.bookingLeadMin} Min., Raster {studio.slotStepMin} Min., Zeitzone {studio.timezone}
        </p>
      </section>
    </>
  );
}
