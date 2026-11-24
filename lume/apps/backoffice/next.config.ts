import { resolve } from "node:path";
import type { NextConfig } from "next";

// Gemeinsame Einstellungen aus lume/.env laden (Next liest sonst nur apps/backoffice/.env).
// Bereits gesetzte Umgebungsvariablen haben Vorrang.
try {
  process.loadEnvFile(resolve(process.cwd(), "../../.env"));
} catch {
  // keine .env vorhanden – Standardwerte gelten
}

const config: NextConfig = {
  // Das Backoffice spricht nur über die API mit der Datenbank.
  poweredByHeader: false,
};

export default config;
