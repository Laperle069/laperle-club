import type { ServiceDto } from "@lume/api/types";
import { api, ApiRequestError } from "@/lib/api";
import { euro } from "@/lib/format";
import { createService, toggleService } from "@/app/actions";
import { ApiProblem, Notice, params, type SearchParams } from "@/app/ui";

export const dynamic = "force-dynamic";

export default async function Services({ searchParams }: { searchParams: SearchParams }) {
  const get = await params(searchParams);
  let services: ServiceDto[];
  try {
    services = await api<ServiceDto[]>("/services");
  } catch (err) {
    if (err instanceof ApiRequestError) return <ApiProblem error={err} />;
    throw err;
  }
  return (
    <>
      <h1>Leistungen</h1>
      <Notice fehler={get("fehler")} ok={get("ok")} />
      <table>
        <thead>
          <tr>
            <th>Leistung</th>
            <th>Kategorie</th>
            <th>Dauer</th>
            <th>Puffer</th>
            <th>Preis</th>
            <th>Online</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id} className={s.active ? "" : "inactive"}>
              <td>{s.name}</td>
              <td>{s.category ?? "–"}</td>
              <td>{s.durationMin} Min.</td>
              <td>{s.bufferAfterMin ? `${s.bufferAfterMin} Min.` : "–"}</td>
              <td>{euro(s.priceCents)}</td>
              <td>{s.onlineBookable ? "ja" : "nein"}</td>
              <td>
                <form action={toggleService}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="active" value={String(!s.active)} />
                  <button className="ghost small">{s.active ? "Ausblenden" : "Aktivieren"}</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form className="card" action={createService}>
        <h2>Leistung anlegen</h2>
        <div className="form-row">
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Kategorie
            <input name="category" placeholder="z. B. Nägel" />
          </label>
          <label>
            Dauer (Min.)
            <input name="durationMin" type="number" min={5} step={5} defaultValue={60} required />
          </label>
          <label>
            Puffer danach (Min.)
            <input name="bufferAfterMin" type="number" min={0} step={5} defaultValue={0} />
          </label>
          <label>
            Preis (€)
            <input name="price" inputMode="decimal" placeholder="35,00" required />
          </label>
        </div>
        <label className="check">
          <input type="checkbox" name="onlineBookable" defaultChecked /> Online buchbar
        </label>
        <button type="submit">Speichern</button>
      </form>
    </>
  );
}
