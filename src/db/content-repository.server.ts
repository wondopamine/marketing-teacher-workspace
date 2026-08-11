import "@tanstack/react-start/server-only"

import { randomUUID } from "node:crypto"

import { sql } from "drizzle-orm"

import {
  cmsPageLifecycleEvents,
  cmsPageVersions,
  cmsPages,
  cmsPublicationEvents,
  cmsReviewTargets,
  cmsRoutes,
} from "./schema"
import type { CmsVersionContract } from "@/cms/document"
import type { CmsDatabase, CmsTransaction } from "./client.server"
import {
  digestCmsValue,
  digestCmsVersionContract,
} from "@/cms/canonical.server"
import { buildCmsReviewTargetSeeds } from "@/cms/review-targets.server"
import {
  isCmsStableId,
  isCmsVersionContract,
  normaliseCmsPath,
} from "@/cms/validation"

type CmsExecutor = CmsDatabase | CmsTransaction

type StoredVersionRow = Record<string, unknown> & {
  readonly versionId: string
  readonly pageId: string
  readonly versionNumber: number
  readonly pageSchemaVersion: number
  readonly reviewSchemaVersion: number
  readonly sectionLibraryVersion: number
  readonly pageDocument: unknown
  readonly reviewDocument: unknown
  readonly canonicalDigest: string
  readonly attributionKind: "system-import" | "self-declared"
  readonly editorDisplayName: string | null
  readonly createdAt: string
  readonly attemptId: string
  readonly requestFingerprint: string
}

export type CmsHead = {
  readonly versionId: string
  readonly versionNumber: number
  readonly digest: string
}

export type CmsVersionSnapshot = CmsVersionContract & {
  readonly pageId: string
  readonly head: CmsHead
  readonly attributionKind: "system-import" | "self-declared"
  readonly editorDisplayName: string | null
  readonly createdAt: string
}

export type ImportInitialCmsPageInput = {
  readonly pageId: string
  readonly attemptId: string
  readonly contract: CmsVersionContract
}

export type ImportInitialCmsPageResult = {
  readonly created: boolean
  readonly snapshot: CmsVersionSnapshot
}

export type CmsRepositoryErrorCode =
  | "ATTEMPT_REUSED"
  | "CORRUPT_STATE"
  | "INVALID_DOCUMENT"
  | "INVALID_ID"
  | "INVALID_PATH"
  | "PAGE_EXISTS"
  | "PAGE_NOT_FOUND"
  | "PERSISTENCE_FAILED"

export class CmsRepositoryError extends Error {
  readonly code: CmsRepositoryErrorCode

  constructor(code: CmsRepositoryErrorCode) {
    super(code)
    this.name = "CmsRepositoryError"
    this.code = code
  }
}

function versionSelect() {
  return sql`
    versions.id as "versionId",
    versions.page_id as "pageId",
    versions.version_number as "versionNumber",
    versions.page_schema_version as "pageSchemaVersion",
    versions.review_schema_version as "reviewSchemaVersion",
    versions.section_library_version as "sectionLibraryVersion",
    versions.page_document as "pageDocument",
    versions.review_document as "reviewDocument",
    versions.canonical_digest as "canonicalDigest",
    versions.attribution_kind as "attributionKind",
    versions.editor_display_name as "editorDisplayName",
    versions.created_at as "createdAt",
    versions.attempt_id as "attemptId",
    versions.request_fingerprint as "requestFingerprint"
  `
}

async function loadVersionByAttempt(
  executor: CmsExecutor,
  pageId: string,
  attemptId: string
): Promise<StoredVersionRow | null> {
  const result = await executor.execute<StoredVersionRow>(sql`
    select ${versionSelect()}
    from cms_page_versions as versions
    where versions.page_id = ${pageId}
      and versions.attempt_id = ${attemptId}
    limit 1
  `)
  return result.rows[0] ?? null
}

function snapshotFromRow(row: StoredVersionRow): CmsVersionSnapshot {
  const contract = {
    pageSchemaVersion: row.pageSchemaVersion,
    reviewSchemaVersion: row.reviewSchemaVersion,
    sectionLibraryVersion: row.sectionLibraryVersion,
    pageDocument: row.pageDocument,
    reviewDocument: row.reviewDocument,
  }
  if (!isCmsVersionContract(contract)) {
    throw new CmsRepositoryError("CORRUPT_STATE")
  }
  if (digestCmsVersionContract(contract) !== row.canonicalDigest) {
    throw new CmsRepositoryError("CORRUPT_STATE")
  }
  return {
    ...contract,
    pageId: row.pageId,
    head: {
      versionId: row.versionId,
      versionNumber: row.versionNumber,
      digest: row.canonicalDigest,
    },
    attributionKind: row.attributionKind,
    editorDisplayName: row.editorDisplayName,
    createdAt: row.createdAt,
  }
}

function assertImportInput(input: ImportInitialCmsPageInput): void {
  if (!isCmsStableId(input.pageId) || !isCmsStableId(input.attemptId)) {
    throw new CmsRepositoryError("INVALID_ID")
  }
  if (!isCmsVersionContract(input.contract)) {
    throw new CmsRepositoryError("INVALID_DOCUMENT")
  }
  if (normaliseCmsPath(input.contract.pageDocument.page.path) === null) {
    throw new CmsRepositoryError("INVALID_PATH")
  }
}

function importFingerprint(input: ImportInitialCmsPageInput): string {
  return digestCmsValue({
    operation: "initial-import",
    pageId: input.pageId,
    contract: input.contract,
  })
}

export function createCmsContentRepository(database: CmsDatabase) {
  async function importInitialPage(
    input: ImportInitialCmsPageInput
  ): Promise<ImportInitialCmsPageResult> {
    assertImportInput(input)
    const requestFingerprint = importFingerprint(input)
    const canonicalDigest = digestCmsVersionContract(input.contract)

    return database.transaction(async (transaction) => {
      await transaction.execute(
        sql`select pg_advisory_xact_lock(hashtextextended(${`cms-import:${input.pageId}`}, 0))`
      )

      const committedAttempt = await loadVersionByAttempt(
        transaction,
        input.pageId,
        input.attemptId
      )
      if (committedAttempt) {
        if (committedAttempt.requestFingerprint !== requestFingerprint) {
          throw new CmsRepositoryError("ATTEMPT_REUSED")
        }
        return { created: false, snapshot: snapshotFromRow(committedAttempt) }
      }

      const existingPage = await transaction.execute<
        Record<string, unknown> & { id: string }
      >(sql`select id from cms_pages where id = ${input.pageId} limit 1`)
      if (existingPage.rows[0]) throw new CmsRepositoryError("PAGE_EXISTS")

      const versionId = randomUUID()
      const publicationEventId = randomUUID()
      const lifecycleEventId = randomUUID()
      const page = input.contract.pageDocument.page

      await transaction.execute(sql`set constraints all deferred`)
      await transaction.insert(cmsPages).values({
        id: input.pageId,
        title: page.title,
        lifecycle: "active",
        lifecycleVersion: 1,
        draftVersionId: versionId,
        draftVersionNumber: 1,
        draftDigest: canonicalDigest,
        publishedVersionId: versionId,
        publishedVersionNumber: 1,
        publishedDigest: canonicalDigest,
      })
      await transaction.insert(cmsPageVersions).values({
        id: versionId,
        pageId: input.pageId,
        versionNumber: 1,
        parentVersionId: null,
        restoredFromVersionId: null,
        pageSchemaVersion: input.contract.pageSchemaVersion,
        reviewSchemaVersion: input.contract.reviewSchemaVersion,
        sectionLibraryVersion: input.contract.sectionLibraryVersion,
        pageDocument: input.contract.pageDocument,
        reviewDocument: input.contract.reviewDocument,
        canonicalDigest,
        attributionKind: "system-import",
        editorDisplayName: null,
        attemptId: input.attemptId,
        requestFingerprint,
      })
      await transaction.insert(cmsRoutes).values({
        normalizedPath: page.path,
        pageId: input.pageId,
        isDraftPath: true,
        isPublishedPath: true,
      })
      await transaction
        .insert(cmsReviewTargets)
        .values([
          ...buildCmsReviewTargetSeeds(
            input.pageId,
            input.contract.pageDocument
          ),
        ])
      await transaction.insert(cmsPublicationEvents).values({
        id: publicationEventId,
        pageId: input.pageId,
        eventKind: "initial-import",
        fromPublishedVersionId: null,
        toPublishedVersionId: versionId,
        publishedPath: page.path,
        attributionKind: "system-import",
        editorDisplayName: null,
        attemptId: input.attemptId,
        requestFingerprint: digestCmsValue({
          operation: "initial-publication",
          pageId: input.pageId,
          versionId,
          path: page.path,
          canonicalDigest,
        }),
      })
      await transaction.insert(cmsPageLifecycleEvents).values({
        id: lifecycleEventId,
        pageId: input.pageId,
        eventKind: "created",
        fromLifecycleVersion: null,
        toLifecycleVersion: 1,
        attributionKind: "system-import",
        editorDisplayName: null,
        attemptId: input.attemptId,
        requestFingerprint: digestCmsValue({
          operation: "initial-lifecycle",
          pageId: input.pageId,
          lifecycleVersion: 1,
        }),
      })

      const inserted = await loadVersionByAttempt(
        transaction,
        input.pageId,
        input.attemptId
      )
      if (!inserted) throw new CmsRepositoryError("PERSISTENCE_FAILED")
      return { created: true, snapshot: snapshotFromRow(inserted) }
    })
  }

  async function loadDraft(pageId: string): Promise<CmsVersionSnapshot> {
    if (!isCmsStableId(pageId)) throw new CmsRepositoryError("INVALID_ID")
    const result = await database.execute<StoredVersionRow>(sql`
      select ${versionSelect()}
      from cms_pages as pages
      inner join cms_page_versions as versions
        on versions.page_id = pages.id
        and versions.id = pages.draft_version_id
        and versions.version_number = pages.draft_version_number
        and versions.canonical_digest = pages.draft_digest
      where pages.id = ${pageId}
      limit 1
    `)
    const row = result.rows.at(0)
    if (!row) throw new CmsRepositoryError("PAGE_NOT_FOUND")
    return snapshotFromRow(row)
  }

  async function loadPublishedPage(
    requestedPath: string
  ): Promise<CmsVersionSnapshot> {
    const normalizedPath = normaliseCmsPath(requestedPath)
    if (normalizedPath === null || normalizedPath !== requestedPath) {
      throw new CmsRepositoryError("INVALID_PATH")
    }
    const result = await database.execute<StoredVersionRow>(sql`
      select ${versionSelect()}
      from cms_routes as routes
      inner join cms_pages as pages
        on pages.id = routes.page_id
      inner join cms_page_versions as versions
        on versions.page_id = pages.id
        and versions.id = pages.published_version_id
        and versions.version_number = pages.published_version_number
        and versions.canonical_digest = pages.published_digest
      where routes.normalized_path = ${normalizedPath}
        and routes.is_published_path = true
        and pages.lifecycle = 'active'
      limit 1
    `)
    const row = result.rows.at(0)
    if (!row) throw new CmsRepositoryError("PAGE_NOT_FOUND")
    return snapshotFromRow(row)
  }

  return { importInitialPage, loadDraft, loadPublishedPage }
}
