import { LoginForm } from "./login-form";

export const metadata = { title: "Anmelden · Lumé" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ abgelaufen?: string }> }) {
  const { abgelaufen } = await searchParams;
  return (
    <main className="center">
      <div className="card login">
        <div className="brand">Lumé</div>
        <h1>Anmelden</h1>
        {abgelaufen ? <p className="notice error">Bitte melde dich erneut an.</p> : null}
        <LoginForm />
      </div>
    </main>
  );
}
