import { randomUUID } from "node:crypto"

import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Pool } from "pg"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import {
  CmsRepositoryError,
  createCmsContentRepository,
} from "./content-repository.server"
import * as schema from "./schema"
import type { CmsVersionContract } from "@/cms/document"
import type {
  CmsHead,
  ImportInitialCmsPageResult,
} from "./content-repository.server"
import {
  cmsHomepageImportAttemptId,
  cmsHomepagePageId,
  homepageV1Contract,
} from "@/cms/templates/homepage-v1.server"
import { buildCmsReviewTargetSeeds } from "@/cms/review-targets.server"
import {
  addCmsSection,
  duplicateCmsSection,
  moveCmsSection,
  replaceCmsValue,
  setCmsSectionState,
} from "@/components/content-review/editor/cms-editor-model"
import { isCmsVersionContract } from "@/cms/validation"

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

function contractWith(
  base: CmsVersionContract,
  changes: {
    readonly title?: string
    readonly path?: string
    readonly description?: string
  }
): CmsVersionContract {
  return {
    pageSchemaVersion: base.pageSchemaVersion,
    reviewSchemaVersion: base.reviewSchemaVersion,
    sectionLibraryVersion: base.sectionLibraryVersion,
    pageDocument: {
      ...base.pageDocument,
      page: { ...base.pageDocument.page, ...changes },
    },
    reviewDocument: base.reviewDocument,
  }
}

function expectRepositoryError(
  result: PromiseSettledResult<unknown>,
  code: CmsRepositoryError["code"]
): void {
  expect(result.status).toBe("rejected")
  if (result.status !== "rejected") return
  expect(result.reason).toBeInstanceOf(CmsRepositoryError)
  expect((result.reason as CmsRepositoryError).code).toBe(code)
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
  let imported: ImportInitialCmsPageResult

  beforeAll(async () => {
    await pool.query("drop schema if exists drizzle cascade")
    await pool.query("drop schema public cascade")
    await pool.query("create schema public")
    await migrate(database, { migrationsFolder: "drizzle" })
  }, 30_000)

  beforeEach(async () => {
    await pool.query("truncate cms_pages cascade")
    imported = await repository.importInitialPage({
      pageId: cmsHomepagePageId,
      attemptId: cmsHomepageImportAttemptId,
      contract: homepageV1Contract,
    })
  })

  afterAll(async () => {
    await pool.end()
  })

  it("imports once, retries safely, and reads the same normalised document", async () => {
    const input = {
      pageId: cmsHomepagePageId,
      attemptId: cmsHomepageImportAttemptId,
      contract: homepageV1Contract,
    } as const

    const retry = await repository.importInitialPage(input)
    const draft = await repository.loadDraft(cmsHomepagePageId)
    const published = await repository.loadPublishedPage("/")

    expect(imported.created).toBe(true)
    expect(retry.created).toBe(false)
    expect(retry.snapshot).toEqual(imported.snapshot)
    expect(draft).toEqual(imported.snapshot)
    expect(published).toEqual(imported.snapshot)
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

  it("creates one unpublished page from the approved template and retries safely", async () => {
    const pageId = randomUUID()
    const attemptId = randomUUID()
    const input = {
      pageId,
      attemptId,
      templateId: "homepage-v1" as const,
      templatePageId: cmsHomepagePageId,
      templateContract: homepageV1Contract,
      title: "Family support",
      path: "/family-support",
      displayName: "Alex Tan",
    }
    const created = await repository.createPage(input)
    const retry = await repository.createPage(input)

    expect(created.created).toBe(true)
    expect(created.snapshot.head.versionNumber).toBe(1)
    expect(created.page).toMatchObject({
      pageId,
      title: "Family support",
      path: "/family-support",
      lifecycle: "active",
      lifecycleVersion: 1,
      publishedHead: null,
    })
    expect(retry.created).toBe(false)
    expect(retry.snapshot.head).toEqual(created.snapshot.head)
    await expect(
      repository.loadPublishedPage("/family-support")
    ).rejects.toMatchObject({ code: "PAGE_NOT_FOUND" })

    const pages = await repository.listPages()
    expect(pages.map((page) => page.pageId).sort()).toEqual(
      [cmsHomepagePageId, pageId].sort()
    )
  })

  it("duplicates page content and design intent with fresh IDs but no comments", async () => {
    const story = homepageV1Contract.pageDocument.sections.find(
      (section) => section.type === "connected-story"
    )
    if (!story) throw new Error("Expected the connected story fixture")
    await repository.createComment({
      id: randomUUID(),
      pageId: cmsHomepagePageId,
      targetId: story.id,
      targetVersionId: imported.snapshot.head.versionId,
      subject: "design-intent",
      body: "Keep this comment on the source page only.",
      displayName: "Alex Tan",
    })

    const pageId = randomUUID()
    const duplicated = await repository.duplicatePage({
      pageId,
      sourcePageId: cmsHomepagePageId,
      attemptId: randomUUID(),
      title: "Teacher Workspace copy",
      path: "/teacher-workspace-copy",
      displayName: "Jamie Lim",
    })
    const copiedStory = duplicated.snapshot.pageDocument.sections.find(
      (section) => section.type === "connected-story"
    )
    if (!copiedStory) throw new Error("Expected a duplicated story")

    expect(copiedStory.id).not.toBe(story.id)
    expect(duplicated.snapshot.reviewDocument.targets[copiedStory.id]).toEqual(
      homepageV1Contract.reviewDocument.targets[story.id]
    )
    expect(await repository.listComments(pageId)).toEqual([])
    expect(duplicated.page.publishedHead).toBeNull()
  })

  it("archives and restores an unpublished page without deleting its history", async () => {
    const pageId = randomUUID()
    const created = await repository.createPage({
      pageId,
      attemptId: randomUUID(),
      templateId: "homepage-v1",
      templatePageId: cmsHomepagePageId,
      templateContract: homepageV1Contract,
      title: "Support guide",
      path: "/support-guide",
      displayName: "Alex Tan",
    })
    const archiveAttemptId = randomUUID()
    const archiveInput = {
      pageId,
      expectedLifecycle: {
        lifecycle: "active" as const,
        lifecycleVersion: 1,
      },
      displayName: "Alex Tan",
      attemptId: archiveAttemptId,
    }
    const archived = await repository.archivePage(archiveInput)
    const retry = await repository.archivePage(archiveInput)

    expect(archived.page).toMatchObject({
      lifecycle: "archived",
      lifecycleVersion: 2,
    })
    expect(retry).toEqual(archived)
    expect((await repository.listVersions(pageId)).versions).toHaveLength(1)
    expect((await repository.loadDraft(pageId)).head).toEqual(
      created.snapshot.head
    )
    await expect(
      repository.saveVersion({
        pageId,
        expectedHead: created.snapshot.head,
        contract: contractWith(created.snapshot, {
          title: "An archived edit",
        }),
        displayName: "Alex Tan",
        attemptId: randomUUID(),
      })
    ).rejects.toMatchObject({ code: "PAGE_ARCHIVED" })

    const restored = await repository.restoreArchivedPage({
      pageId,
      expectedLifecycle: {
        lifecycle: "archived",
        lifecycleVersion: 2,
      },
      displayName: "Jamie Lim",
      attemptId: randomUUID(),
    })
    expect(restored.page).toMatchObject({
      lifecycle: "active",
      lifecycleVersion: 3,
    })
    expect(restored.page.draftHead).toEqual(created.snapshot.head)

    await expect(repository.archivePage(archiveInput)).resolves.toMatchObject({
      outcome: "committed-but-superseded",
      page: { lifecycle: "active", lifecycleVersion: 3 },
    })
    await expect(
      repository.archivePage({
        pageId: cmsHomepagePageId,
        expectedLifecycle: {
          lifecycle: "active",
          lifecycleVersion: 1,
        },
        displayName: "Alex Tan",
        attemptId: randomUUID(),
      })
    ).rejects.toMatchObject({ code: "PAGE_PUBLISHED" })
  })

  it("rejects reserved application paths before creating a page", async () => {
    await expect(
      repository.createPage({
        pageId: randomUUID(),
        attemptId: randomUUID(),
        templateId: "homepage-v1",
        templatePageId: cmsHomepagePageId,
        templateContract: homepageV1Contract,
        title: "Reserved path",
        path: "/cms-preview",
        displayName: "Alex Tan",
      })
    ).rejects.toMatchObject({ code: "INVALID_PATH" })
    expect(await repository.listPages()).toHaveLength(1)
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

  it("saves one immutable draft without changing the published head", async () => {
    const contract = contractWith(homepageV1Contract, {
      title: "Teacher Workspace draft",
    })
    const saved = await repository.saveVersion({
      pageId: cmsHomepagePageId,
      expectedHead: imported.snapshot.head,
      contract,
      displayName: "Alex Tan",
      attemptId: randomUUID(),
    })

    expect(saved.outcome).toBe("committed")
    expect(saved.committed.head.versionNumber).toBe(2)
    expect(saved.committed.parentVersionId).toBe(
      imported.snapshot.head.versionId
    )
    expect(saved.committed.editorDisplayName).toBe("Alex Tan")
    expect((await repository.loadDraft(cmsHomepagePageId)).head).toEqual(
      saved.committed.head
    )
    expect((await repository.loadPublishedPage("/")).head).toEqual(
      imported.snapshot.head
    )

    const history = await repository.listVersions(cmsHomepagePageId)
    expect(
      history.versions.map((version) => version.head.versionNumber)
    ).toEqual([2, 1])
    expect(history.versions[0]).toMatchObject({
      isCurrentDraft: true,
      isPublished: false,
    })
    expect(history.versions[1]).toMatchObject({
      isCurrentDraft: false,
      isPublished: true,
    })
  })

  it("serializes two saves from one base and preserves the losing document", async () => {
    const firstContract = contractWith(homepageV1Contract, {
      title: "First concurrent draft",
    })
    const secondContract = contractWith(homepageV1Contract, {
      title: "Second concurrent draft",
    })
    const results = await Promise.allSettled([
      repository.saveVersion({
        pageId: cmsHomepagePageId,
        expectedHead: imported.snapshot.head,
        contract: firstContract,
        displayName: "Alex Tan",
        attemptId: randomUUID(),
      }),
      repository.saveVersion({
        pageId: cmsHomepagePageId,
        expectedHead: imported.snapshot.head,
        contract: secondContract,
        displayName: "Jamie Lim",
        attemptId: randomUUID(),
      }),
    ])

    const successes = results.filter(
      (
        result
      ): result is PromiseFulfilledResult<
        Awaited<ReturnType<typeof repository.saveVersion>>
      > => result.status === "fulfilled"
    )
    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected"
    )
    expect(successes).toHaveLength(1)
    expect(failures).toHaveLength(1)
    expectRepositoryError(failures[0], "STALE_DRAFT")
    expect((failures[0].reason as CmsRepositoryError).latest?.head).toEqual(
      successes[0].value.committed.head
    )

    const counts = await database.execute<
      Record<string, unknown> & { versions: number }
    >(sql`select count(*)::int as versions from cms_page_versions`)
    expect(counts.rows[0].versions).toBe(2)
  })

  it("deduplicates simultaneous use and later retries of one save attempt", async () => {
    const attemptId = randomUUID()
    const input = {
      pageId: cmsHomepagePageId,
      expectedHead: imported.snapshot.head,
      contract: contractWith(homepageV1Contract, {
        title: "One attempt, one draft",
      }),
      displayName: "Alex Tan",
      attemptId,
    } as const
    const [first, duplicate] = await Promise.all([
      repository.saveVersion(input),
      repository.saveVersion(input),
    ])
    expect(duplicate.committed.head).toEqual(first.committed.head)

    const later = await repository.saveVersion({
      ...input,
      expectedHead: first.live.head,
      contract: contractWith(first.live, {
        title: "A later saved draft",
      }),
      attemptId: randomUUID(),
    })
    const retry = await repository.saveVersion(input)
    expect(retry.outcome).toBe("committed-but-superseded")
    expect(retry.committed.head).toEqual(first.committed.head)
    expect(retry.live.head).toEqual(later.committed.head)

    await expect(
      repository.saveVersion({
        ...input,
        contract: contractWith(homepageV1Contract, {
          title: "Reused for different work",
        }),
      })
    ).rejects.toMatchObject({ code: "ATTEMPT_REUSED" })
  })

  it("restores an exact old snapshot as a new draft with provenance", async () => {
    const changed = await repository.saveVersion({
      pageId: cmsHomepagePageId,
      expectedHead: imported.snapshot.head,
      contract: contractWith(homepageV1Contract, {
        title: "Changed before restore",
        description: "A changed description before the restore test.",
      }),
      displayName: "Alex Tan",
      attemptId: randomUUID(),
    })
    const restored = await repository.restoreVersion({
      pageId: cmsHomepagePageId,
      sourceVersionId: imported.snapshot.head.versionId,
      expectedHead: changed.live.head,
      displayName: "Jamie Lim",
      attemptId: randomUUID(),
    })

    expect(restored.committed.head.versionNumber).toBe(3)
    expect(restored.committed.parentVersionId).toBe(
      changed.committed.head.versionId
    )
    expect(restored.committed.restoredFromVersionId).toBe(
      imported.snapshot.head.versionId
    )
    expect(restored.committed.pageDocument).toEqual(
      imported.snapshot.pageDocument
    )
    expect(restored.committed.reviewDocument).toEqual(
      imported.snapshot.reviewDocument
    )
    expect((await repository.loadPublishedPage("/")).head).toEqual(
      imported.snapshot.head
    )
    expect(
      (
        await repository.getVersion(
          cmsHomepagePageId,
          changed.committed.head.versionId
        )
      ).pageDocument.page.title
    ).toBe("Changed before restore")
  })

  it("keeps target identity while archiving and restoring section context", async () => {
    const story = homepageV1Contract.pageDocument.sections.find(
      (section) => section.type === "connected-story"
    )
    if (!story) throw new Error("Expected the connected story fixture")
    const archivedContract: CmsVersionContract = {
      ...homepageV1Contract,
      pageDocument: {
        ...homepageV1Contract.pageDocument,
        sections: homepageV1Contract.pageDocument.sections.map((section) =>
          section.id === story.id ? { ...section, state: "archived" } : section
        ),
      },
    }
    const archived = await repository.saveVersion({
      pageId: cmsHomepagePageId,
      expectedHead: imported.snapshot.head,
      contract: archivedContract,
      displayName: "Alex Tan",
      attemptId: randomUUID(),
    })
    const archivedTarget = await database.execute<
      Record<string, unknown> & { state: string; archivedAt: Date | null }
    >(sql`
      select state, archived_at as "archivedAt"
      from cms_review_targets
      where page_id = ${cmsHomepagePageId} and id = ${story.id}
    `)
    expect(archivedTarget.rows[0]).toMatchObject({ state: "archived" })
    expect(archivedTarget.rows[0].archivedAt).not.toBeNull()

    await repository.restoreVersion({
      pageId: cmsHomepagePageId,
      sourceVersionId: imported.snapshot.head.versionId,
      expectedHead: archived.live.head,
      displayName: "Jamie Lim",
      attemptId: randomUUID(),
    })
    const restoredTarget = await database.execute<
      Record<string, unknown> & { state: string; archivedAt: Date | null }
    >(sql`
      select state, archived_at as "archivedAt"
      from cms_review_targets
      where page_id = ${cmsHomepagePageId} and id = ${story.id}
    `)
    expect(restoredTarget.rows[0]).toMatchObject({
      state: "active",
      archivedAt: null,
    })
  })

  it("round-trips every approved repeatable section through save, history, and restore", async () => {
    const repeatableTypes = [
      "connected-story",
      "reveal",
      "capabilities",
      "close",
      "access-support",
    ] as const
    let contract: CmsVersionContract = homepageV1Contract

    for (const type of repeatableTypes) {
      const existingIds = new Set(
        contract.pageDocument.sections.map((section) => section.id)
      )
      contract = addCmsSection(contract, type, randomUUID)
      const added = contract.pageDocument.sections.find(
        (section) => section.type === type && !existingIds.has(section.id)
      )
      if (!added) throw new Error(`Expected a new ${type} section`)

      const addedIndex = contract.pageDocument.sections.findIndex(
        (section) => section.id === added.id
      )
      contract = replaceCmsValue(
        contract,
        ["pageDocument", "sections", addedIndex, "fields", "heading"],
        `Saved ${type} section`
      )
      contract = duplicateCmsSection(contract, added.id, randomUUID)
      const duplicate = contract.pageDocument.sections[addedIndex + 1]
      contract = moveCmsSection(contract, duplicate.id, -1)
      contract = setCmsSectionState(contract, added.id, "hidden")
      contract = setCmsSectionState(contract, duplicate.id, "archived")
    }

    expect(isCmsVersionContract(contract)).toBe(true)
    const saved = await repository.saveVersion({
      pageId: cmsHomepagePageId,
      expectedHead: imported.snapshot.head,
      contract,
      displayName: "Alex Tan",
      attemptId: randomUUID(),
    })
    const reloaded = await repository.loadDraft(cmsHomepagePageId)
    expect(reloaded.pageDocument).toEqual(contract.pageDocument)
    expect(reloaded.reviewDocument).toEqual(contract.reviewDocument)

    const later = await repository.saveVersion({
      pageId: cmsHomepagePageId,
      expectedHead: saved.committed.head,
      contract: contractWith(saved.committed, {
        title: "A later draft before structural restore",
      }),
      displayName: "Jamie Lim",
      attemptId: randomUUID(),
    })
    const restored = await repository.restoreVersion({
      pageId: cmsHomepagePageId,
      sourceVersionId: saved.committed.head.versionId,
      expectedHead: later.committed.head,
      displayName: "Alex Tan",
      attemptId: randomUUID(),
    })

    expect(restored.committed.pageDocument).toEqual(contract.pageDocument)
    expect(restored.committed.reviewDocument).toEqual(contract.reviewDocument)
    expect(restored.committed.restoredFromVersionId).toBe(
      saved.committed.head.versionId
    )
    expect(
      (await repository.listVersions(cmsHomepagePageId)).versions.map(
        (version) => version.head.versionNumber
      )
    ).toEqual([4, 3, 2, 1])
  })

  it("keeps feedback on stable targets through edits, reorder, archive, and restore", async () => {
    const story = homepageV1Contract.pageDocument.sections.find(
      (section) => section.type === "connected-story"
    )
    if (!story) throw new Error("Expected the connected story fixture")
    const contentCommentId = randomUUID()
    const intentCommentId = randomUUID()
    const contentComment = await repository.createComment({
      id: contentCommentId,
      pageId: cmsHomepagePageId,
      targetId: story.id,
      targetVersionId: imported.snapshot.head.versionId,
      subject: "page-content",
      body: "Keep the student journey concrete.",
      displayName: "Alex Tan",
    })
    const retry = await repository.createComment({
      id: contentCommentId,
      pageId: cmsHomepagePageId,
      targetId: story.id,
      targetVersionId: imported.snapshot.head.versionId,
      subject: "page-content",
      body: "Keep the student journey concrete.",
      displayName: "Alex Tan",
    })
    await repository.createComment({
      id: intentCommentId,
      pageId: cmsHomepagePageId,
      targetId: story.id,
      targetVersionId: imported.snapshot.head.versionId,
      subject: "design-intent",
      body: "Explain why this story comes before the capability list.",
      displayName: "Jamie Lim",
    })
    expect(retry).toEqual(contentComment)

    const reorderedContract: CmsVersionContract = {
      ...homepageV1Contract,
      pageDocument: {
        ...homepageV1Contract.pageDocument,
        sections: [
          homepageV1Contract.pageDocument.sections[0],
          homepageV1Contract.pageDocument.sections[2],
          story,
          ...homepageV1Contract.pageDocument.sections.slice(3),
        ],
      },
    }
    const reordered = await repository.saveVersion({
      pageId: cmsHomepagePageId,
      expectedHead: imported.snapshot.head,
      contract: reorderedContract,
      displayName: "Alex Tan",
      attemptId: randomUUID(),
    })
    expect(
      (
        await repository.listComments(
          cmsHomepagePageId,
          reordered.committed.head.versionId
        )
      ).map((comment) => ({
        id: comment.id,
        targetId: comment.targetId,
        changed: comment.targetChanged,
      }))
    ).toEqual([
      { id: contentCommentId, targetId: story.id, changed: false },
      { id: intentCommentId, targetId: story.id, changed: false },
    ])

    const editedContract = structuredClone({
      pageSchemaVersion: reordered.committed.pageSchemaVersion,
      reviewSchemaVersion: reordered.committed.reviewSchemaVersion,
      sectionLibraryVersion: reordered.committed.sectionLibraryVersion,
      pageDocument: reordered.committed.pageDocument,
      reviewDocument: reordered.committed.reviewDocument,
    }) as CmsVersionContract
    const editedStory = editedContract.pageDocument.sections.find(
      (section) => section.id === story.id
    )
    if (!editedStory || editedStory.type !== "connected-story") {
      throw new Error("Expected the reordered story")
    }
    ;(editedStory.fields as { heading: string }).heading =
      "One synthetic student, followed from signal to support"
    ;(
      editedContract.reviewDocument.targets[story.id] as {
        designIntent: string
      }
    ).designIntent = "The story makes the product journey easier to follow."
    const edited = await repository.saveVersion({
      pageId: cmsHomepagePageId,
      expectedHead: reordered.committed.head,
      contract: editedContract,
      displayName: "Jamie Lim",
      attemptId: randomUUID(),
    })
    const changed = await repository.listComments(
      cmsHomepagePageId,
      edited.committed.head.versionId
    )
    expect(changed.map((comment) => comment.targetChanged)).toEqual([
      true,
      true,
    ])

    const archivedContract = structuredClone({
      pageSchemaVersion: edited.committed.pageSchemaVersion,
      reviewSchemaVersion: edited.committed.reviewSchemaVersion,
      sectionLibraryVersion: edited.committed.sectionLibraryVersion,
      pageDocument: edited.committed.pageDocument,
      reviewDocument: edited.committed.reviewDocument,
    }) as CmsVersionContract
    const archivedStory = archivedContract.pageDocument.sections.find(
      (section) => section.id === story.id
    )
    if (!archivedStory) throw new Error("Expected the edited story")
    ;(archivedStory as { state: string }).state = "archived"
    const archived = await repository.saveVersion({
      pageId: cmsHomepagePageId,
      expectedHead: edited.committed.head,
      contract: archivedContract,
      displayName: "Alex Tan",
      attemptId: randomUUID(),
    })
    expect(
      (
        await repository.listComments(
          cmsHomepagePageId,
          archived.committed.head.versionId
        )
      ).every((comment) => comment.targetState === "archived")
    ).toBe(true)
    await expect(
      repository.createComment({
        id: randomUUID(),
        pageId: cmsHomepagePageId,
        targetId: story.id,
        targetVersionId: archived.committed.head.versionId,
        subject: "page-content",
        body: "This should not be added.",
        displayName: "Alex Tan",
      })
    ).rejects.toMatchObject({ code: "TARGET_ARCHIVED" })

    const restored = await repository.restoreVersion({
      pageId: cmsHomepagePageId,
      sourceVersionId: imported.snapshot.head.versionId,
      expectedHead: archived.committed.head,
      displayName: "Jamie Lim",
      attemptId: randomUUID(),
    })
    const afterRestore = await repository.listComments(
      cmsHomepagePageId,
      restored.committed.head.versionId
    )
    expect(afterRestore.map((comment) => comment.targetChanged)).toEqual([
      false,
      false,
    ])
    expect(
      afterRestore.every((comment) => comment.targetState === "active")
    ).toBe(true)

    const resolved = await repository.updateCommentStatus({
      pageId: cmsHomepagePageId,
      commentId: contentCommentId,
      status: "resolved",
    })
    expect(resolved.status).toBe("resolved")
  })

  it("publishes only the exact saved draft and retries without a second event", async () => {
    const saved = await repository.saveVersion({
      pageId: cmsHomepagePageId,
      expectedHead: imported.snapshot.head,
      contract: contractWith(homepageV1Contract, {
        title: "Ready to publish",
      }),
      displayName: "Alex Tan",
      attemptId: randomUUID(),
    })
    const attemptId = randomUUID()
    const input = {
      pageId: cmsHomepagePageId,
      versionId: saved.committed.head.versionId,
      expectedDraft: saved.committed.head,
      expectedPublished: imported.snapshot.head,
      displayName: "Alex Tan",
      attemptId,
    } as const
    const [first, duplicate] = await Promise.all([
      repository.publishVersion(input),
      repository.publishVersion(input),
    ])
    const retry = await repository.publishVersion(input)

    expect(first.outcome).toBe("committed")
    expect(duplicate.committed.head).toEqual(first.committed.head)
    expect(retry.committed.head).toEqual(first.committed.head)
    expect((await repository.loadDraft(cmsHomepagePageId)).head).toEqual(
      saved.committed.head
    )
    expect((await repository.loadPublishedPage("/")).head).toEqual(
      saved.committed.head
    )
    const events = await database.execute<
      Record<string, unknown> & { publications: number }
    >(sql`
      select count(*)::int as publications
      from cms_publication_events
      where page_id = ${cmsHomepagePageId}
    `)
    expect(events.rows[0].publications).toBe(2)
  })

  it("rejects a stale publication and reports an older retry as superseded", async () => {
    const second = await repository.saveVersion({
      pageId: cmsHomepagePageId,
      expectedHead: imported.snapshot.head,
      contract: contractWith(homepageV1Contract, { title: "Version two" }),
      displayName: "Alex Tan",
      attemptId: randomUUID(),
    })
    const firstPublishInput = {
      pageId: cmsHomepagePageId,
      versionId: second.committed.head.versionId,
      expectedDraft: second.committed.head,
      expectedPublished: imported.snapshot.head,
      displayName: "Alex Tan",
      attemptId: randomUUID(),
    } as const
    const firstPublication = await repository.publishVersion(firstPublishInput)
    const third = await repository.saveVersion({
      pageId: cmsHomepagePageId,
      expectedHead: second.committed.head,
      contract: contractWith(second.committed, { title: "Version three" }),
      displayName: "Jamie Lim",
      attemptId: randomUUID(),
    })

    await expect(
      repository.publishVersion({
        pageId: cmsHomepagePageId,
        versionId: third.committed.head.versionId,
        expectedDraft: third.committed.head,
        expectedPublished: imported.snapshot.head,
        displayName: "Jamie Lim",
        attemptId: randomUUID(),
      })
    ).rejects.toMatchObject({
      code: "STALE_PUBLICATION",
      latest: { head: firstPublication.committed.head },
    })

    const secondPublication = await repository.publishVersion({
      pageId: cmsHomepagePageId,
      versionId: third.committed.head.versionId,
      expectedDraft: third.committed.head,
      expectedPublished: firstPublication.committed.head,
      displayName: "Jamie Lim",
      attemptId: randomUUID(),
    })
    const retry = await repository.publishVersion(firstPublishInput)
    expect(retry.outcome).toBe("committed-but-superseded")
    expect(retry.committed.head).toEqual(firstPublication.committed.head)
    expect(retry.live?.head).toEqual(secondPublication.committed.head)
  })

  it("reserves a changed draft path without moving the published path early", async () => {
    const saved = await repository.saveVersion({
      pageId: cmsHomepagePageId,
      expectedHead: imported.snapshot.head,
      contract: contractWith(homepageV1Contract, {
        title: "Replacement page",
        path: "/replacement",
      }),
      displayName: "Alex Tan",
      attemptId: randomUUID(),
    })
    expect((await repository.loadPublishedPage("/")).head).toEqual(
      imported.snapshot.head
    )
    await expect(
      repository.loadPublishedPage("/replacement")
    ).rejects.toMatchObject({ code: "PAGE_NOT_FOUND" })

    await repository.publishVersion({
      pageId: cmsHomepagePageId,
      versionId: saved.committed.head.versionId,
      expectedDraft: saved.committed.head,
      expectedPublished: imported.snapshot.head,
      displayName: "Alex Tan",
      attemptId: randomUUID(),
    })
    await expect(repository.loadPublishedPage("/")).rejects.toMatchObject({
      code: "PAGE_NOT_FOUND",
    })
    expect((await repository.loadPublishedPage("/replacement")).head).toEqual(
      saved.committed.head
    )
  })

  it("paginates version history without skipping a version", async () => {
    let head: CmsHead = imported.snapshot.head
    for (const title of ["Version two", "Version three", "Version four"]) {
      const saved = await repository.saveVersion({
        pageId: cmsHomepagePageId,
        expectedHead: head,
        contract: contractWith(homepageV1Contract, { title }),
        displayName: "Alex Tan",
        attemptId: randomUUID(),
      })
      head = saved.committed.head
    }

    const firstPage = await repository.listVersions(cmsHomepagePageId, null, 2)
    const secondPage = await repository.listVersions(
      cmsHomepagePageId,
      firstPage.nextCursor,
      2
    )
    expect(
      firstPage.versions.map((version) => version.head.versionNumber)
    ).toEqual([4, 3])
    expect(
      secondPage.versions.map((version) => version.head.versionNumber)
    ).toEqual([2, 1])
    expect(secondPage.nextCursor).toBeNull()
  })
})
