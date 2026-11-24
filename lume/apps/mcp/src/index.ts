import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createLumeMcpServer, httpFetcher } from "./server.js";

const baseUrl = process.env.LUME_API_URL ?? "http://localhost:4000";
const apiKey = process.env.LUME_API_KEY;
if (!apiKey) {
  console.error("LUME_API_KEY fehlt (API-Schlüssel des Studios).");
  process.exit(1);
}

const server = createLumeMcpServer(httpFetcher(baseUrl, apiKey));
await server.connect(new StdioServerTransport());
