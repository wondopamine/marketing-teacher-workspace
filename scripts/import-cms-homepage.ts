import "dotenv/config"

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import {
  cmsHomepageImportAttemptId,
  cmsHomepagePageId,
  homepageV1Contract,
} from "../src/cms/templates/homepage-v1.server"
import { createCmsContentRepository } from "../src/db/content-repository.server"
import * as schema from "../src/db/schema"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) throw new Error("DATABASE_URL is required")

const pool = new Pool({ connectionString: databaseUrl, max: 1 })
const database = drizzle(pool, { schema, casing: "snake_case" })

try {
  const result = await createCmsContentRepository(database).importInitialPage({
    pageId: cmsHomepagePageId,
    attemptId: cmsHomepageImportAttemptId,
    contract: homepageV1Contract,
  })
  console.log(
    result.created
      ? "Imported CMS homepage version 1"
      : "CMS homepage version 1 was already imported"
  )
} finally {
  await pool.end()
}
