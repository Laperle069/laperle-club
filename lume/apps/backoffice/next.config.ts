import type { NextConfig } from "next";

const config: NextConfig = {
  // Das Backoffice spricht nur über die API mit der Datenbank.
  poweredByHeader: false,
};

export default config;
