import type { CustomerDto } from "@lume/api/types";
import { api, ApiRequestError } from "@/lib/api";
import { createCustomer } from "../actions";
import { ApiDown, Notice, params, type SearchParams } from "../ui";

export const dynamic = "force-dynamic";

export default async function Customers({ searchParams }: { searchParams: SearchParams }) {
  const get = await params(searchParams);
  const q = get("q") ?? "";
  let customers: CustomerDto[];
  try {
    customers = await api<CustomerDto[]>(`/customers?limit=200${q ? `&q=${encodeURIComponent(q)}` : ""}`);
  } catch (err) {
    if (err instanceof ApiRequestError) return <ApiDown message={err.message} />;
    throw err;
  }
  return (
    <>
      <h1>Kunden</h1>
      <Notice fehler={get("fehler")} ok={get("ok")} />
      <form className="row" method="get">
        <input name="q" defaultValue={q} placeholder="Name, E-Mail oder Telefon" />
        <button type="submit">Suchen</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>E-Mail</th>
            <th>Telefon</th>
            <th>Werbung erlaubt</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>
                {c.firstName} {c.lastName}
              </td>
              <td>{c.email ?? "–"}</td>
              <td>{c.phone ?? "–"}</td>
              <td>{c.marketingConsent ? "ja" : "nein"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {customers.length === 0 ? <p className="muted">Keine Kunden gefunden.</p> : null}

      <form className="card" action={createCustomer}>
        <h2>Kundin anlegen</h2>
        <div className="form-row">
          <label>
            Vorname
            <input name="firstName" required />
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
        <label>
          Notiz
          <input name="notes" />
        </label>
        <label className="check">
          <input type="checkbox" name="marketingConsent" /> Möchte Angebote und Neuigkeiten erhalten
        </label>
        <button type="submit">Speichern</button>
      </form>
    </>
  );
}
