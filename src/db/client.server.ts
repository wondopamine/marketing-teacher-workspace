import "@tanstack/react-start/server-only"

import { attachDatabasePool } from "@vercel/functions"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"
import type {
  NodePgDatabase,
  NodePgTransaction,
} from "drizzle-orm/node-postgres"
import type { ExtractTablesWithRelations } from "drizzle-orm"

import { getCmsDatabaseEnvironment } from "@/config/cms-env.server"

export type CmsDatabase = NodePgDatabase<typeof schema>
export type CmsTransaction = NodePgTransaction<
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>

let cachedPool: Pool | null = null
let cachedDatabase: CmsDatabase | null = null

function createPool(): Pool {
  const environment = getCmsDatabaseEnvironment()
  const pool = new Pool({
    connectionString: environment.databaseUrl,
    max: environment.poolMaximum,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
  })

  pool.on("error", (error) => {
    console.error("[cms/database] idle pooled connection failed", {
      error:
        error instanceof Error
          ? { name: error.name, message: error.message }
          : error,
    })
  })

  if (process.env.VERCEL === "1") attachDatabasePool(pool)
  return pool
}

export function getCmsPool(): Pool {
  cachedPool ??= createPool()
  return cachedPool
}

export function getCmsDatabase(): CmsDatabase {
  cachedDatabase ??= drizzle(getCmsPool(), {
    schema,
    casing: "snake_case",
  })
  return cachedDatabase
}

export async function closeCmsDatabaseForTests(): Promise<void> {
  const pool = cachedPool
  cachedPool = null
  cachedDatabase = null
  await pool?.end()
}
