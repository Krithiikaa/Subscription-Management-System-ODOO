import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// The neon-http driver cannot run db.transaction() at all, which the billing
// engine and password-reset flows both require — use the Pool/WebSocket
// driver instead, which supports real transactions.
neonConfig.webSocketConstructor = ws;

// Use the direct (non-pgbouncer) connection string — Neon's serverless Pool
// does its own connection management and conflicts with PgBouncer pooling.
const connectionString =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  "postgres://demo:demo@localhost:5432/brightloop";
const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
