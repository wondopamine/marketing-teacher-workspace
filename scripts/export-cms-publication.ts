import "dotenv/config"

import { pathToFileURL } from "node:url"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import { normaliseCmsPath } from "../src/cms/validation"
import { createCmsContentRepository } from "../src/db/content-repository.server"
import * as schema from "../src/db/schema"
import {
  optionValue,
  resolvePrivateOutput,
  writePrivateFile,
} from "./cms-private-output.mjs"

export async function exportCmsPublication(args = process.argv.slice(2)) {
  const databaseUrl =
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required")
  }
  const requestedPath = optionValue(args, "--path") ?? "/"
  if (normaliseCmsPath(requestedPath) !== requestedPath) {
    throw new Error("--path must be a normalized CMS path")
  }
  const force = args.includes("--force")
  const output = resolvePrivateOutput({
    rawPath: optionValue(args, "--output"),
    extension: ".json",
    force,
  })
  const pool = new Pool({ connectionString: databaseUrl, max: 1 })
  try {
    const database = drizzle(pool, { schema, casing: "snake_case" })
    const snapshot =
      await createCmsContentRepository(database).loadPublishedPage(
        requestedPath
      )
    const exported = {
      format: "teacher-workspace-cms-publication",
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      publishedPath: requestedPath,
      snapshot,
    }
    await writePrivateFile({
      output,
      contents: `${JSON.stringify(exported, null, 2)}\n`,
      force,
    })
    console.log(
      `Exported published version ${snapshot.head.versionNumber} to ${output}`
    )
    return output
  } finally {
    await pool.end()
  }
}

const invokedPath = process.argv[1]
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  await exportCmsPublication()
}
