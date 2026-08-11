import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Pool } from "pg"
import { afterAll, beforeAll, describe, expect, it } from "vitest"


import { createCmsContentRepository } from "./content-repository.server"
import * as schema from "./schema"
import {
  cmsHomepageImportAttemptId,
  cmsHomepagePageId,
  homepageV1Contract,
} from "@/cms/templates/homepage-v1.server"
import { buildCmsReviewTargetSeeds } from "@/cms/review-targets.server"

const testDatabaseUrl = process.env.CMS_TEST_DATABASE_URL
const databaseSuite = testDatabaseUrl ? describe : describe.skip

function assertDedicatedTestDatabase(value: string): void {
  const url = new URL(value)
  const localDocker =
    (url.hostname === "127.0.0.1" || url.hostname === "localhost") &&
    url.port === "55432"
  if (!localDocker || !url.pathname.endsWith("_test")) {
    throw new Error(
      "CMS_TEST_DATABASE_URL must point to the dedicated local Docker database on port 55432 and end in _test"
    )
  }
}

function databaseErrorText(error: unknown): string {
  const parts: Array<string> = []
  let current: unknown = error
  while (current && typeof current === "object") {
    if (current instanceof Error) parts.push(current.message)
    for (const key of ["code", "constraint", "detail", "table"] as const) {
      const value = (current as Record<string, unknown>)[key]
      if (typeof value === "string") parts.push(value)
    }
    current = (current as { cause?: unknown }).cause
  }
  return parts.join("\n")
}

async function expectDatabaseError(
  operation: Promise<unknown>,
  pattern: RegExp
): Promise<void> {
  try {
    await operation
  } catch (error) {
    expect(databaseErrorText(error)).toMatch(pattern)
    return
  }
  throw new Error(`Expected a database error matching ${pattern.source}`)
}

databaseSuite("CMS PostgreSQL repository", () => {
  if (!testDatabaseUrl) return
  assertDedicatedTestDatabase(testDatabaseUrl)

  const pool = new Pool({ connectionString: testDatabaseUrl, max: 4 })
  const database = drizzle(pool, { schema, casing: "snake_case" })
  const repository = createCmsContentRepository(database)

  beforeAll(async () => {
    await pool.query("drop schema if exists drizzle cascade")
    await pool.query("drop schema public cascade")
    await pool.query("create schema public")
    await migrate(database, { migrationsFolder: "drizzle" })
  }, 30_000)

  afterAll(async () => {
    await pool.end()
  })

  it("imports once, retries safely, and reads the same normalised document", async () => {
    const input = {
      pageId: cmsHomepagePageId,
      attemptId: cmsHomepageImportAttemptId,
      contract: homepageV1Contract,
    } as const

    const first = await repository.importInitialPage(input)
    const retry = await repository.importInitialPage(input)
    const draft = await repository.loadDraft(cmsHomepagePageId)
    const published = await repository.loadPublishedPage("/")

    expect(first.created).toBe(true)
    expect(retry.created).toBe(false)
    expect(retry.snapshot).toEqual(first.snapshot)
    expect(draft).toEqual(first.snapshot)
    expect(published).toEqual(first.snapshot)
    expect(draft.pageDocument).toEqual(homepageV1Contract.pageDocument)

    const counts = await database.execute<
      Record<string, unknown> & {
        pages: number
        versions: number
        routes: number
        publications: number
        lifecycles: number
        targets: number
      }
    >(sql`
      select
        (select count(*)::int from cms_pages) as pages,
        (select count(*)::int from cms_page_versions) as versions,
        (select count(*)::int from cms_routes) as routes,
        (select count(*)::int from cms_publication_events) as publications,
        (select count(*)::int from cms_page_lifecycle_events) as lifecycles,
        (select count(*)::int from cms_review_targets) as targets
    `)
    expect(counts.rows.at(0)).toMatchObject({
      pages: 1,
      versions: 1,
      routes: 1,
      publications: 1,
      lifecycles: 1,
      targets: buildCmsReviewTargetSeeds(
        cmsHomepagePageId,
        homepageV1Contract.pageDocument
      ).length,
    })
  })

  it("enforces append-only versions and exact same-page heads", async () => {
    await expectDatabaseError(
      database.execute(sql`
        update cms_page_versions
        set editor_display_name = 'Changed'
        where page_id = ${cmsHomepagePageId}
      `),
      /append-only/i
    )

    await expectDatabaseError(
      database.transaction(async (transaction) => {
        await transaction.execute(sql`set constraints all deferred`)
        await transaction.execute(sql`
          update cms_pages
          set draft_version_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
          where id = ${cmsHomepagePageId}
        `)
      }),
      /cms_pages_draft_version_fk/i
    )
  })

  it("enforces unique routes, version numbers, and attempt IDs", async () => {
    await expectDatabaseError(
      database.execute(sql`
        insert into cms_routes (
          normalized_path,
          page_id,
          is_draft_path,
          is_published_path
        ) values ('/', ${cmsHomepagePageId}, false, false)
      `),
      /cms_routes_pkey/i
    )

    await expectDatabaseError(
      database.execute(sql`
        insert into cms_page_versions
        select
          'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid,
          page_id,
          version_number,
          parent_version_id,
          restored_from_version_id,
          page_schema_version,
          review_schema_version,
          section_library_version,
          page_document,
          review_document,
          canonical_digest,
          attribution_kind,
          editor_display_name,
          now(),
          'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::uuid,
          request_fingerprint
        from cms_page_versions
        where page_id = ${cmsHomepagePageId}
      `),
      /cms_page_versions_page_version_uq/i
    )

    await expectDatabaseError(
      database.execute(sql`
        insert into cms_page_versions
        select
          'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid,
          page_id,
          version_number + 1,
          id,
          null,
          page_schema_version,
          review_schema_version,
          section_library_version,
          page_document,
          review_document,
          canonical_digest,
          attribution_kind,
          editor_display_name,
          now(),
          attempt_id,
          request_fingerprint
        from cms_page_versions
        where page_id = ${cmsHomepagePageId}
      `),
      /cms_page_versions_page_attempt_uq/i
    )
  })
})
