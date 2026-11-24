import type { MeDto } from "@lume/api/types";
import { api } from "@/lib/api";
import { PasswordForm } from "@/app/forms";

export const dynamic = "force-dynamic";

export default async function Account() {
  const me = await api<MeDto>("/auth/me");
  return (
    <>
      <h1>Mein Konto</h1>
      <section className="card">
        <p>
          <strong>{me.user.name}</strong> · {me.user.email}
        </p>
        <p className="muted small">Angemeldet bei {me.studio.name}.</p>
      </section>
      <PasswordForm />
    </>
  );
}
