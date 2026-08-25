import "dotenv/config"

import { randomUUID } from "node:crypto"
import { mkdir, unlink } from "node:fs/promises"
import { dirname } from "node:path"
import { pathToFileURL } from "node:url"
import { spawn } from "node:child_process"

import {
  finalisePrivateFile,
  optionValue,
  resolvePrivateOutput,
} from "./cms-private-output.mjs"

function validPostgresUrl(value) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "postgres:" || parsed.protocol === "postgresql:"
  } catch {
    return false
  }
}

function runPgDump(binary, output, databaseUrl) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      binary,
      ["--format=custom", "--no-owner", "--no-privileges", "--file", output],
      {
        env: { ...process.env, PGDATABASE: databaseUrl },
        shell: false,
        stdio: ["ignore", "inherit", "inherit"],
      }
    )
    child.once("error", reject)
    child.once("exit", (code, signal) => {
      if (code === 0) resolve()
      else reject(new Error(`pg_dump failed (${signal ?? `exit ${code}`})`))
    })
  })
}

export async function backupCmsDatabase(args = process.argv.slice(2)) {
  const databaseUrl =
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
  if (!databaseUrl || !validPostgresUrl(databaseUrl)) {
    throw new Error(
      "DATABASE_URL_UNPOOLED or DATABASE_URL must be a PostgreSQL URL"
    )
  }
  const force = args.includes("--force")
  const output = resolvePrivateOutput({
    rawPath: optionValue(args, "--output"),
    extension: ".dump",
    force,
  })
  const partial = `${output}.partial-${randomUUID()}`
  await mkdir(dirname(output), { recursive: true })
  try {
    await runPgDump(process.env.PG_DUMP_BIN ?? "pg_dump", partial, databaseUrl)
    await finalisePrivateFile({ partial, output, force })
    console.log(`Backed up the CMS database to ${output}`)
    return output
  } catch (error) {
    await unlink(partial).catch(() => undefined)
    throw error
  }
}

const invokedPath = process.argv[1]
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  await backupCmsDatabase()
}
