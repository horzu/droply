import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

if (!process.env.NEON_DATABASE_URL) {
  throw new Error("Database Url is not defined in environment variables");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL!,
  },
  migrations: {
	table: "__drizzle_migrations",
	schema: "public",
  },
  verbose: true,
  strict: true,
});
