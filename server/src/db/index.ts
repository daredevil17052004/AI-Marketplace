// src/db/index.ts
//
// The single shared database connection for the whole app. Every
// other file that needs to query the DB imports `db` from here -
// we never create multiple separate connections scattered around.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Fail loudly and immediately if config is missing, rather than
  // letting the app start in a broken state and fail mysteriously
  // later on the first query. This is a "fail fast" principle.
  throw new Error("DATABASE_URL is not set - check your .env file");
}

const client = postgres(connectionString);

// Passing `schema` here is what gives us autocomplete and type
// safety when we write queries later, e.g. db.select().from(users)
export const db = drizzle(client, { schema });
