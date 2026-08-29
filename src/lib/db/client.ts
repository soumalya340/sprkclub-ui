import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy the Neon credentials into .env / .env.local.",
  );
}

// neon-http is the right driver here: every query is a stateless fetch, which
// suits Route Handlers far better than a pooled TCP connection.
export const db = drizzle(neon(connectionString), { schema });
export { schema };
