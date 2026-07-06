// drizzle.config.ts
//
// This tells drizzle-kit (the CLI) where to find our schema, where to
// write generated migrations, and how to connect to the database.

import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
    