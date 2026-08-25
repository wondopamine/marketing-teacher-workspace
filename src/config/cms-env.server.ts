import "@tanstack/react-start/server-only"

function requiredDatabaseUrl(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is required for CMS database access`)

  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`${name} must be a valid PostgreSQL connection URL`)
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error(`${name} must use the postgres or postgresql protocol`)
  }
  return value
}

function poolMaximum(value: string | undefined): number {
  if (!value) return 5
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 20) {
    throw new Error("DATABASE_POOL_MAX must be an integer between 1 and 20")
  }
  return parsed
}

export function getCmsDatabaseEnvironment() {
  return {
    databaseUrl: requiredDatabaseUrl("DATABASE_URL", process.env.DATABASE_URL),
    poolMaximum: poolMaximum(process.env.DATABASE_POOL_MAX),
  }
}

export function getCmsMigrationDatabaseUrl(): string {
  return requiredDatabaseUrl(
    process.env.DATABASE_URL_UNPOOLED
      ? "DATABASE_URL_UNPOOLED"
      : "DATABASE_URL",
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
  )
}
