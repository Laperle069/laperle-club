import type { MeDto } from "@lume/api/types";
import Link from "next/link";
import { api, ApiRequestError } from "@/lib/api";
import { logout } from "@/app/auth-actions";
import { ApiProblem } from "@/app/ui";

export const dynamic = "force-dynamic";

const ROLE_LABEL = { owner: "Inhaber", manager: "Leitung", reception: "Empfang", staff: "Mitarbeiter" } as const;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let me: MeDto;
  try {
    me = await api<MeDto>("/auth/me");
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return (
        <main className="center">
          <ApiProblem error={err} />
        </main>
      );
    }
    throw err;
  }
  const nav = [
    { href: "/", label: "Übersicht" },
    { href: "/kalender", label: "Kalender" },
    { href: "/termine/neu", label: "Neuer Termin" },
    { href: "/kunden", label: "Kunden" },
    { href: "/leistungen", label: "Leistungen" },
    { href: "/mitarbeiter", label: "Mitarbeiter" },
    ...(me.role === "owner" || me.role === "manager" ? [{ href: "/team", label: "Team und Zugänge" }] : []),
    ...(me.role === "owner"
      ? [
          { href: "/schluessel", label: "API-Schlüssel" },
          { href: "/einstellungen", label: "Bausteine" },
        ]
      : []),
  ];
  return (
    <div className="shell">
      <nav className="sidebar">
        <div className="brand">Lumé</div>
        {nav.map((n) => (
          <Link key={n.href} href={n.href}>
            {n.label}
          </Link>
        ))}
        <div className="account">
          <strong>{me.user.name}</strong>
          <span className="muted small">
            {me.studio.name} · {ROLE_LABEL[me.role]}
          </span>
          <Link href="/konto" className="small">
            Mein Konto
          </Link>
          <form action={logout}>
            <button className="ghost small">Abmelden</button>
          </form>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
