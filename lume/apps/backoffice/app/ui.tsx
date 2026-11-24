export function Notice({ fehler, ok }: { fehler?: string; ok?: string }) {
  if (fehler) return <p className="notice error">{fehler}</p>;
  if (ok) return <p className="notice ok">Gespeichert.</p>;
  return null;
}

export function ApiDown({ message }: { message: string }) {
  return (
    <div className="card">
      <h2>Keine Verbindung zur API</h2>
      <p>{message}</p>
      <p className="muted">
        Läuft die API? Im Ordner <code>lume</code> mit <code>pnpm dev</code> starten.
      </p>
    </div>
  );
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function params(sp: SearchParams) {
  const raw = await sp;
  const get = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : undefined);
  return get;
}
