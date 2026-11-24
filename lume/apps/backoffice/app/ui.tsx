export function Notice({ fehler, ok }: { fehler?: string; ok?: string }) {
  if (fehler) return <p className="notice error">{fehler}</p>;
  if (ok) return <p className="notice ok">Gespeichert.</p>;
  return null;
}

/** Verständliche Anzeige, wenn die API nicht antwortet oder etwas nicht erlaubt ist. */
export function ApiProblem({ error }: { error: { status: number; message: string } }) {
  if (error.status === 403) {
    return (
      <div className="card">
        <h2>Keine Berechtigung</h2>
        <p>Dieser Bereich ist für deine Rolle nicht freigegeben. Frag die Inhaberin des Studios.</p>
      </div>
    );
  }
  return (
    <div className="card">
      <h2>{error.status === 0 ? "Keine Verbindung zur API" : "Etwas ist schiefgelaufen"}</h2>
      <p>{error.message}</p>
      {error.status === 0 ? (
        <p className="muted">
          Läuft die API? Im Ordner <code>lume</code> mit <code>pnpm dev</code> starten.
        </p>
      ) : null}
    </div>
  );
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function params(sp: SearchParams) {
  const raw = await sp;
  const get = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : undefined);
  return get;
}
