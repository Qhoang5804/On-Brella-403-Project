/**
 * Backend configuration. Uses env vars with sensible defaults.
 * Extensible: add more config as needed.
 */

const config = {
  port: parseInt(process.env.PORT || "5001", 10),
  hardwareUrl: process.env.HARDWARE_URL || "http://localhost:3000",
  /** Supabase/Postgres connection URL. From Supabase: Project Settings → Database → Connection string (URI). */
  databaseUrl: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL,
};

module.exports = config;
