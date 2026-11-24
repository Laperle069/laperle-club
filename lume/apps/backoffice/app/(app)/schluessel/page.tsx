import type { ApiKeyDto } from "@lume/api/types";
import { api, ApiRequestError, baseUrl } from "@/lib/api";
import { revokeApiKey } from "@/app/auth-actions";
import { ApiKeyForm } from "@/app/forms";
import { ApiProblem, Notice, params, type SearchParams } from "@/app/ui";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = { owner: "Inhaber", manager: "Leitung", reception: "Empfang", staff: "Mitarbeiter" };
const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "short", timeStyle: "short" }) : "–";

export default async function ApiKeys({ searchParams }: { searchParams: SearchParams }) {
  const get = await params(searchParams);
  let keys: ApiKeyDto[];
  try {
    keys = await api<ApiKeyDto[]>("/api-keys");
  } catch (err) {
    if (err instanceof ApiRequestError) return <ApiProblem error={err} />;
    throw err;
  }
  const active = keys.filter((k) => !k.revokedAt);
  const revoked = keys.filter((k) => k.revokedAt);
  return (
    <>
      <h1>API-Schlüssel</h1>
      <p className="muted">
        Damit greifen Programme und KI-Agenten auf dein Studio zu. Schnittstelle: <code>{baseUrl}/v1</code> ·
        Beschreibung: <code>{baseUrl}/v1/openapi.json</code>
      </p>
      <Notice fehler={get("fehler")} />
      <ApiKeyForm />
      <h2>Aktive Schlüssel</h2>
      {active.length === 0 ? (
        <p className="muted">Noch keine.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Beginnt mit</th>
              <th>Darf</th>
              <th>Angelegt</th>
              <th>Zuletzt benutzt</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {active.map((k) => (
              <tr key={k.id}>
                <td>{k.name}</td>
                <td>
                  <code>{k.prefix}…</code>
                </td>
                <td>{ROLE_LABEL[k.role]}</td>
                <td>{fmt(k.createdAt)}</td>
                <td>{fmt(k.lastUsedAt)}</td>
                <td>
                  <form action={revokeApiKey}>
                    <input type="hidden" name="id" value={k.id} />
                    <button className="ghost small danger">Sperren</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {revoked.length > 0 ? (
        <details>
          <summary className="muted">Gesperrte Schlüssel ({revoked.length})</summary>
          <ul>
            {revoked.map((k) => (
              <li key={k.id} className="muted small">
                {k.name} (<code>{k.prefix}…</code>), gesperrt am {fmt(k.revokedAt)}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  );
}
