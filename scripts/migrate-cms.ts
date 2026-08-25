import "dotenv/config"

import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Pool } from "pg"

const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required")
}

const pool = new Pool({ connectionString: databaseUrl, max: 1 })

try {
  await migrate(drizzle(pool), { migrationsFolder: "drizzle" })
  console.log("CMS migrations are up to date")
} finally {
  await pool.end()
}
