import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "Lumé Backoffice", robots: { index: false } };

const NAV = [
  { href: "/", label: "Übersicht" },
  { href: "/kalender", label: "Kalender" },
  { href: "/termine/neu", label: "Neuer Termin" },
  { href: "/kunden", label: "Kunden" },
  { href: "/leistungen", label: "Leistungen" },
  { href: "/mitarbeiter", label: "Mitarbeiter" },
  { href: "/einstellungen", label: "Bausteine" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <div className="shell">
          <nav className="sidebar">
            <div className="brand">Lumé</div>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
            <p className="muted small">Grundgerüst · nur lokal</p>
          </nav>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
