import "@tanstack/react-start/server-only"

import { randomUUID } from "node:crypto"

import { and, eq, ne, notInArray, sql } from "drizzle-orm"

import {
  cmsComments,
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
  isCmsPageDocument,
  isCmsReviewDocument,
  isCmsStableId,
  isCmsVersionContract,
  normaliseCmsPath,
} from "@/cms/validation"

type CmsExecutor = CmsDatabase | CmsTransaction

type StoredVersionRow = Record<string, unknown> & {
  readonly versionId: string
  readonly pageId: string
  readonly versionNumber: number
  readonly parentVersionId: string | null
  readonly restoredFromVersionId: string | null
  readonly pageSchemaVersion: number
  readonly reviewSchemaVersion: number
  readonly sectionLibraryVersion: number
  readonly pageDocument: unknown
  readonly reviewDocument: unknown
  readonly canonicalDigest: string
  readonly attributionKind: "system-import" | "self-declared"
  readonly editorDisplayName: string | null
  readonly createdAt: Date | string
  readonly attemptId: string
  readonly requestFingerprint: string
}

type StoredPageHeadRow = Record<string, unknown> & {
  readonly pageId: string
  readonly lifecycle: "active" | "archived"
  readonly draftVersionId: string
  readonly draftVersionNumber: number
  readonly draftDigest: string
  readonly publishedVersionId: string | null
  readonly publishedVersionNumber: number | null
  readonly publishedDigest: string | null
}

type StoredPublicationRow = Record<string, unknown> & {
  readonly toPublishedVersionId: string | null
  readonly requestFingerprint: string
}

type StoredReviewTargetRow = Record<string, unknown> & {
  readonly id: string
  readonly sectionId: string | null
  readonly fieldKey: string | null
  readonly repeatedItemId: string | null
  readonly parentTargetId: string | null
  readonly kind: "page" | "section" | "field" | "repeated-item" | "screen"
  readonly state: "active" | "archived"
}

type StoredCommentRow = Record<string, unknown> & {
  readonly id: string
  readonly pageId: string
  readonly targetId: string
  readonly targetVersionId: string
  readonly subject: CmsCommentSubject
  readonly body: string
  readonly displayName: string
  readonly status: CmsCommentStatus
  readonly createdAt: Date | string
  readonly updatedAt: Date | string
  readonly targetState: "active" | "archived"
  readonly targetKind: StoredReviewTargetRow["kind"]
  readonly sectionId: string | null
  readonly fieldKey: string | null
  readonly repeatedItemId: string | null
  readonly pageDocument: unknown
  readonly reviewDocument: unknown
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
  readonly parentVersionId: string | null
  readonly restoredFromVersionId: string | null
}

export type CmsCommitResult = {
  readonly outcome: "committed" | "committed-but-superseded"
  readonly committed: CmsVersionSnapshot
  readonly live: CmsVersionSnapshot
}

export type CmsPublicationResult = {
  readonly outcome: "committed" | "committed-but-superseded"
  readonly committed: CmsVersionSnapshot
  readonly live: CmsVersionSnapshot | null
}

export type SaveCmsVersionInput = {
  readonly pageId: string
  readonly expectedHead: CmsHead
  readonly contract: CmsVersionContract
  readonly displayName: string
  readonly attemptId: string
}

export type RestoreCmsVersionInput = {
  readonly pageId: string
  readonly sourceVersionId: string
  readonly expectedHead: CmsHead
  readonly displayName: string
  readonly attemptId: string
}

export type PublishCmsVersionInput = {
  readonly pageId: string
  readonly versionId: string
  readonly expectedDraft: CmsHead
  readonly expectedPublished: CmsHead | null
  readonly displayName: string
  readonly attemptId: string
}

export type CmsVersionHistoryItem = {
  readonly head: CmsHead
  readonly parentVersionId: string | null
  readonly restoredFromVersionId: string | null
  readonly attributionKind: "system-import" | "self-declared"
  readonly editorDisplayName: string | null
  readonly createdAt: string
  readonly isCurrentDraft: boolean
  readonly isPublished: boolean
}

export type CmsVersionHistoryPage = {
  readonly versions: ReadonlyArray<CmsVersionHistoryItem>
  readonly nextCursor: number | null
}

export type CmsPageState = {
  readonly pageId: string
  readonly lifecycle: "active" | "archived"
  readonly draftHead: CmsHead
  readonly publishedHead: CmsHead | null
}

export const cmsCommentSubjects = ["page-content", "design-intent"] as const
export type CmsCommentSubject = (typeof cmsCommentSubjects)[number]

export const cmsCommentStatuses = ["open", "resolved", "withdrawn"] as const
export type CmsCommentStatus = (typeof cmsCommentStatuses)[number]

export type CmsComment = {
  readonly id: string
  readonly pageId: string
  readonly targetId: string
  readonly targetVersionId: string
  readonly subject: CmsCommentSubject
  readonly body: string
  readonly displayName: string
  readonly status: CmsCommentStatus
  readonly createdAt: string
  readonly updatedAt: string
  readonly targetState: "active" | "archived"
  readonly targetKind: StoredReviewTargetRow["kind"]
  readonly targetChanged: boolean
}

export type CreateCmsCommentInput = {
  readonly id: string
  readonly pageId: string
  readonly targetId: string
  readonly targetVersionId: string
  readonly subject: CmsCommentSubject
  readonly body: string
  readonly displayName: string
}

export type UpdateCmsCommentStatusInput = {
  readonly pageId: string
  readonly commentId: string
  readonly status: CmsCommentStatus
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
  | "ALREADY_PUBLISHED"
  | "ATTEMPT_REUSED"
  | "CORRUPT_STATE"
  | "COMMENT_ID_REUSED"
  | "COMMENT_NOT_FOUND"
  | "INVALID_COMMENT"
  | "INVALID_DISPLAY_NAME"
  | "INVALID_DOCUMENT"
  | "INVALID_HEAD"
  | "INVALID_ID"
  | "INVALID_PATH"
  | "INVALID_CURSOR"
  | "NO_CHANGES"
  | "PAGE_EXISTS"
  | "PAGE_NOT_FOUND"
  | "PATH_TAKEN"
  | "PERSISTENCE_FAILED"
  | "STALE_DRAFT"
  | "STALE_PUBLICATION"
  | "TARGET_ARCHIVED"
  | "TARGET_NOT_FOUND"
  | "VERSION_NOT_FOUND"

export class CmsRepositoryError extends Error {
  readonly code: CmsRepositoryErrorCode
  readonly latest: CmsVersionSnapshot | null

  constructor(
    code: CmsRepositoryErrorCode,
    latest: CmsVersionSnapshot | null = null
  ) {
    super(code)
    this.name = "CmsRepositoryError"
    this.code = code
    this.latest = latest
  }
}

function versionSelect() {
  return sql`
    versions.id as "versionId",
    versions.page_id as "pageId",
    versions.version_number as "versionNumber",
    versions.parent_version_id as "parentVersionId",
    versions.restored_from_version_id as "restoredFromVersionId",
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

function commentSelect() {
  return sql`
    comments.id as "id",
    comments.page_id as "pageId",
    comments.target_id as "targetId",
    comments.target_version_id as "targetVersionId",
    comments.subject as "subject",
    comments.body as "body",
    comments.display_name as "displayName",
    comments.status as "status",
    comments.created_at as "createdAt",
    comments.updated_at as "updatedAt",
    targets.state as "targetState",
    targets.kind as "targetKind",
    targets.section_id as "sectionId",
    targets.field_key as "fieldKey",
    targets.repeated_item_id as "repeatedItemId",
    versions.page_document as "pageDocument",
    versions.review_document as "reviewDocument"
  `
}

async function loadCommentById(
  executor: CmsExecutor,
  commentId: string
): Promise<StoredCommentRow | null> {
  const result = await executor.execute<StoredCommentRow>(sql`
    select ${commentSelect()}
    from cms_comments as comments
    inner join cms_review_targets as targets
      on targets.page_id = comments.page_id
      and targets.id = comments.target_id
    inner join cms_page_versions as versions
      on versions.page_id = comments.page_id
      and versions.id = comments.target_version_id
    where comments.id = ${commentId}
    limit 1
  `)
  return result.rows[0] ?? null
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
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : row.createdAt,
    parentVersionId: row.parentVersionId,
    restoredFromVersionId: row.restoredFromVersionId,
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
  assertReviewDocumentTargets(input.pageId, input.contract)
}

function importFingerprint(input: ImportInitialCmsPageInput): string {
  return digestCmsValue({
    operation: "initial-import",
    pageId: input.pageId,
    contract: input.contract,
  })
}

const digestPattern = /^[0-9a-f]{64}$/

function assertRepositoryId(value: string): void {
  if (!isCmsStableId(value)) throw new CmsRepositoryError("INVALID_ID")
}

function assertHead(value: CmsHead): void {
  if (
    !isCmsStableId(value.versionId) ||
    !Number.isInteger(value.versionNumber) ||
    value.versionNumber < 1 ||
    !digestPattern.test(value.digest)
  ) {
    throw new CmsRepositoryError("INVALID_HEAD")
  }
}

function sameHead(left: CmsHead | null, right: CmsHead | null): boolean {
  if (left === null || right === null) return left === right
  return (
    left.versionId === right.versionId &&
    left.versionNumber === right.versionNumber &&
    left.digest === right.digest
  )
}

function draftHeadFromPage(row: StoredPageHeadRow): CmsHead {
  return {
    versionId: row.draftVersionId,
    versionNumber: row.draftVersionNumber,
    digest: row.draftDigest,
  }
}

function publishedHeadFromPage(row: StoredPageHeadRow): CmsHead | null {
  const values = [
    row.publishedVersionId,
    row.publishedVersionNumber,
    row.publishedDigest,
  ]
  if (values.every((value) => value === null)) return null
  if (values.some((value) => value === null)) {
    throw new CmsRepositoryError("CORRUPT_STATE")
  }
  return {
    versionId: row.publishedVersionId as string,
    versionNumber: row.publishedVersionNumber as number,
    digest: row.publishedDigest as string,
  }
}

function normaliseDisplayName(value: string): string {
  const normalized = value.normalize("NFC").trim()
  if (
    normalized.length === 0 ||
    [...normalized].length > 80 ||
    /[\p{Cc}\p{Cf}]/u.test(normalized)
  ) {
    throw new CmsRepositoryError("INVALID_DISPLAY_NAME")
  }
  return normalized
}

function normaliseCommentBody(value: string): string {
  const normalized = value.normalize("NFC").trim()
  if (
    normalized.length === 0 ||
    [...normalized].length > 4_000 ||
    /\p{Cc}/u.test(normalized.replace(/[\n\r\t]/g, ""))
  ) {
    throw new CmsRepositoryError("INVALID_COMMENT")
  }
  return normalized
}

function isCommentSubject(value: string): value is CmsCommentSubject {
  return cmsCommentSubjects.some((subject) => subject === value)
}

function isCommentStatus(value: string): value is CmsCommentStatus {
  return cmsCommentStatuses.some((status) => status === value)
}

function isoTime(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

type TargetLocation = Pick<
  StoredCommentRow,
  "targetId" | "targetKind" | "sectionId" | "fieldKey" | "repeatedItemId"
>

function objectWithId(
  value: unknown,
  id: string
): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = objectWithId(item, id)
      if (match) return match
    }
    return null
  }
  if (typeof value !== "object" || value === null) return null
  const record = value as Record<string, unknown>
  if (record.id === id) return record
  for (const nested of Object.values(record)) {
    const match = objectWithId(nested, id)
    if (match) return match
  }
  return null
}

function pathValue(value: unknown, path: ReadonlyArray<string>): unknown {
  let current = value
  for (const key of path) {
    if (
      typeof current !== "object" ||
      current === null ||
      Array.isArray(current)
    ) {
      return null
    }
    current = (current as Record<string, unknown>)[key]
  }
  return current ?? null
}

function targetContentValue(
  document: CmsVersionContract["pageDocument"],
  target: TargetLocation
): unknown {
  if (target.targetKind === "page") return document
  if (target.sectionId === null) {
    const pageField = target.fieldKey?.replace(/^page\./, "")
    return pageField ? pathValue(document.page, [pageField]) : null
  }

  const section = document.sections.find(
    (candidate) => candidate.id === target.sectionId
  )
  if (!section) return null
  if (target.targetKind === "section") return section

  if (target.targetKind === "repeated-item" || target.targetKind === "screen") {
    return target.repeatedItemId
      ? objectWithId(section.fields, target.repeatedItemId)
      : null
  }

  if (!target.fieldKey) return null
  if (target.repeatedItemId) {
    const entity = objectWithId(section.fields, target.repeatedItemId)
    const field = target.fieldKey.split(".").at(-1)
    return entity && field ? pathValue(entity, [field]) : null
  }
  return pathValue(section.fields, target.fieldKey.split("."))
}

function commentFromRow(
  row: StoredCommentRow,
  comparison: CmsVersionSnapshot
): CmsComment {
  if (
    !isCmsPageDocument(row.pageDocument) ||
    !isCmsReviewDocument(row.reviewDocument)
  ) {
    throw new CmsRepositoryError("CORRUPT_STATE")
  }
  const target: TargetLocation = row
  const before =
    row.subject === "design-intent"
      ? (row.reviewDocument.targets[row.targetId] ?? null)
      : targetContentValue(row.pageDocument, target)
  const after =
    row.subject === "design-intent"
      ? (comparison.reviewDocument.targets[row.targetId] ?? null)
      : targetContentValue(comparison.pageDocument, target)
  return {
    id: row.id,
    pageId: row.pageId,
    targetId: row.targetId,
    targetVersionId: row.targetVersionId,
    subject: row.subject,
    body: row.body,
    displayName: row.displayName,
    status: row.status,
    createdAt: isoTime(row.createdAt),
    updatedAt: isoTime(row.updatedAt),
    targetState: row.targetState,
    targetKind: row.targetKind,
    targetChanged: digestCmsValue(before) !== digestCmsValue(after),
  }
}

function assertContract(contract: CmsVersionContract): void {
  if (!isCmsVersionContract(contract)) {
    throw new CmsRepositoryError("INVALID_DOCUMENT")
  }
  if (normaliseCmsPath(contract.pageDocument.page.path) === null) {
    throw new CmsRepositoryError("INVALID_PATH")
  }
}

function assertReviewDocumentTargets(
  pageId: string,
  contract: CmsVersionContract
): void {
  const targetIds = new Set(
    buildCmsReviewTargetSeeds(pageId, contract.pageDocument).map(
      (target) => target.id
    )
  )
  if (
    Object.keys(contract.reviewDocument.targets).some(
      (targetId) => !targetIds.has(targetId)
    )
  ) {
    throw new CmsRepositoryError("INVALID_DOCUMENT")
  }
}

async function loadVersionById(
  executor: CmsExecutor,
  pageId: string,
  versionId: string
): Promise<StoredVersionRow | null> {
  const result = await executor.execute<StoredVersionRow>(sql`
    select ${versionSelect()}
    from cms_page_versions as versions
    where versions.page_id = ${pageId}
      and versions.id = ${versionId}
    limit 1
  `)
  return result.rows[0] ?? null
}

async function loadDraftSnapshot(
  executor: CmsExecutor,
  pageId: string
): Promise<CmsVersionSnapshot | null> {
  const result = await executor.execute<StoredVersionRow>(sql`
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
  return row ? snapshotFromRow(row) : null
}

async function loadPublishedSnapshot(
  executor: CmsExecutor,
  pageId: string
): Promise<CmsVersionSnapshot | null> {
  const result = await executor.execute<StoredVersionRow>(sql`
    select ${versionSelect()}
    from cms_pages as pages
    inner join cms_page_versions as versions
      on versions.page_id = pages.id
      and versions.id = pages.published_version_id
      and versions.version_number = pages.published_version_number
      and versions.canonical_digest = pages.published_digest
    where pages.id = ${pageId}
    limit 1
  `)
  const row = result.rows.at(0)
  return row ? snapshotFromRow(row) : null
}

async function lockPage(
  transaction: CmsTransaction,
  pageId: string
): Promise<StoredPageHeadRow> {
  const result = await transaction.execute<StoredPageHeadRow>(sql`
    select
      pages.id as "pageId",
      pages.lifecycle as "lifecycle",
      pages.draft_version_id as "draftVersionId",
      pages.draft_version_number as "draftVersionNumber",
      pages.draft_digest as "draftDigest",
      pages.published_version_id as "publishedVersionId",
      pages.published_version_number as "publishedVersionNumber",
      pages.published_digest as "publishedDigest"
    from cms_pages as pages
    where pages.id = ${pageId}
    for update
  `)
  const row = result.rows.at(0)
  if (!row) throw new CmsRepositoryError("PAGE_NOT_FOUND")
  return row
}

async function loadPublicationByAttempt(
  executor: CmsExecutor,
  pageId: string,
  attemptId: string
): Promise<StoredPublicationRow | null> {
  const result = await executor.execute<StoredPublicationRow>(sql`
    select
      events.to_published_version_id as "toPublishedVersionId",
      events.request_fingerprint as "requestFingerprint"
    from cms_publication_events as events
    where events.page_id = ${pageId}
      and events.attempt_id = ${attemptId}
    limit 1
  `)
  return result.rows[0] ?? null
}

async function reserveDraftPath(
  transaction: CmsTransaction,
  pageId: string,
  nextPath: string
): Promise<void> {
  const current = await transaction.execute<
    Record<string, unknown> & { normalizedPath: string }
  >(sql`
    select normalized_path as "normalizedPath"
    from cms_routes
    where page_id = ${pageId} and is_draft_path = true
    limit 1
  `)
  if (current.rows[0]?.normalizedPath === nextPath) return

  await transaction.execute(sql`
    update cms_routes
    set is_draft_path = false, updated_at = now()
    where page_id = ${pageId} and is_draft_path = true
  `)
  const reserved = await transaction.execute<
    Record<string, unknown> & { pageId: string }
  >(sql`
    insert into cms_routes (
      normalized_path,
      page_id,
      is_draft_path,
      is_published_path
    ) values (${nextPath}, ${pageId}, true, false)
    on conflict (normalized_path) do update
      set is_draft_path = true, updated_at = now()
      where cms_routes.page_id = excluded.page_id
    returning page_id as "pageId"
  `)
  if (reserved.rows[0]?.pageId !== pageId) {
    throw new CmsRepositoryError("PATH_TAKEN")
  }
}

async function movePublishedPath(
  transaction: CmsTransaction,
  pageId: string,
  nextPath: string
): Promise<void> {
  const current = await transaction.execute<
    Record<string, unknown> & { normalizedPath: string }
  >(sql`
    select normalized_path as "normalizedPath"
    from cms_routes
    where page_id = ${pageId} and is_published_path = true
    limit 1
  `)
  if (current.rows[0]?.normalizedPath === nextPath) return

  await transaction.execute(sql`
    update cms_routes
    set is_published_path = false, updated_at = now()
    where page_id = ${pageId} and is_published_path = true
  `)
  const moved = await transaction.execute<
    Record<string, unknown> & { pageId: string }
  >(sql`
    update cms_routes
    set is_published_path = true, updated_at = now()
    where normalized_path = ${nextPath}
      and page_id = ${pageId}
      and is_draft_path = true
    returning page_id as "pageId"
  `)
  if (moved.rows[0]?.pageId !== pageId) {
    throw new CmsRepositoryError("PATH_TAKEN")
  }
}

function sameTargetLocation(
  existing: StoredReviewTargetRow,
  desired: ReturnType<typeof buildCmsReviewTargetSeeds>[number]
): boolean {
  return (
    existing.sectionId === desired.sectionId &&
    existing.fieldKey === desired.fieldKey &&
    existing.repeatedItemId === desired.repeatedItemId &&
    existing.parentTargetId === desired.parentTargetId &&
    existing.kind === desired.kind
  )
}

async function synchronizeReviewTargets(
  transaction: CmsTransaction,
  pageId: string,
  contract: CmsVersionContract
): Promise<void> {
  const desired = buildCmsReviewTargetSeeds(pageId, contract.pageDocument)
  const desiredById = new Map(desired.map((target) => [target.id, target]))
  const result = await transaction.execute<StoredReviewTargetRow>(sql`
    select
      id,
      section_id as "sectionId",
      field_key as "fieldKey",
      repeated_item_id as "repeatedItemId",
      parent_target_id as "parentTargetId",
      kind,
      state
    from cms_review_targets
    where page_id = ${pageId}
  `)

  for (const existing of result.rows) {
    const target = desiredById.get(existing.id)
    if (target && !sameTargetLocation(existing, target)) {
      throw new CmsRepositoryError("INVALID_DOCUMENT")
    }
  }

  const existingIds = new Set(result.rows.map((target) => target.id))
  const missing = desired.filter((target) => !existingIds.has(target.id))
  if (missing.length > 0) {
    const archivedAt = new Date().toISOString()
    await transaction
      .insert(cmsReviewTargets)
      .values(
        missing.map((target) =>
          target.state === "archived" ? { ...target, archivedAt } : target
        )
      )
  }

  for (const target of desired) {
    if (!existingIds.has(target.id)) continue
    await transaction.execute(sql`
      update cms_review_targets
      set
        state = ${target.state},
        archived_at = case when ${target.state} = 'archived' then coalesce(archived_at, now()) else null end,
        updated_at = now()
      where page_id = ${pageId} and id = ${target.id}
    `)
  }

  const desiredIds = desired.map((target) => target.id)
  await transaction
    .update(cmsReviewTargets)
    .set({
      state: "archived",
      archivedAt: sql`coalesce(${cmsReviewTargets.archivedAt}, now())`,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(cmsReviewTargets.pageId, pageId),
        notInArray(cmsReviewTargets.id, desiredIds),
        ne(cmsReviewTargets.state, "archived")
      )
    )
}

function databaseErrorDetails(error: unknown): {
  readonly code: string
  readonly constraint: string | null
} | null {
  let current: unknown = error
  while (current && typeof current === "object") {
    const code = (current as { code?: unknown }).code
    if (typeof code === "string") {
      const constraint = (current as { constraint?: unknown }).constraint
      return {
        code,
        constraint: typeof constraint === "string" ? constraint : null,
      }
    }
    current = (current as { cause?: unknown }).cause
  }
  return null
}

function translateDatabaseError(error: unknown): never {
  if (error instanceof CmsRepositoryError) throw error
  const details = databaseErrorDetails(error)
  if (details?.code === "23505") {
    if (details.constraint === "cms_routes_pkey") {
      throw new CmsRepositoryError("PATH_TAKEN")
    }
    if (details.constraint === "cms_review_targets_location_uq") {
      throw new CmsRepositoryError("INVALID_DOCUMENT")
    }
  }
  throw error
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
      const importedTargets = buildCmsReviewTargetSeeds(
        input.pageId,
        input.contract.pageDocument
      )
      const archivedAt = new Date().toISOString()
      await transaction
        .insert(cmsReviewTargets)
        .values(
          importedTargets.map((target) =>
            target.state === "archived" ? { ...target, archivedAt } : target
          )
        )
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

  async function committedDraftResult(
    executor: CmsExecutor,
    committedRow: StoredVersionRow
  ): Promise<CmsCommitResult> {
    const committed = snapshotFromRow(committedRow)
    const live = await loadDraftSnapshot(executor, committed.pageId)
    if (!live) throw new CmsRepositoryError("CORRUPT_STATE")
    return {
      outcome: sameHead(committed.head, live.head)
        ? "committed"
        : "committed-but-superseded",
      committed,
      live,
    }
  }

  async function committedPublicationResult(
    executor: CmsExecutor,
    pageId: string,
    publication: StoredPublicationRow
  ): Promise<CmsPublicationResult> {
    if (!publication.toPublishedVersionId) {
      throw new CmsRepositoryError("ATTEMPT_REUSED")
    }
    const committedRow = await loadVersionById(
      executor,
      pageId,
      publication.toPublishedVersionId
    )
    if (!committedRow) throw new CmsRepositoryError("CORRUPT_STATE")
    const committed = snapshotFromRow(committedRow)
    const live = await loadPublishedSnapshot(executor, pageId)
    return {
      outcome:
        live && sameHead(committed.head, live.head)
          ? "committed"
          : "committed-but-superseded",
      committed,
      live,
    }
  }

  async function appendDraftVersion(
    transaction: CmsTransaction,
    input: {
      readonly pageId: string
      readonly attemptId: string
      readonly requestFingerprint: string
      readonly contract: CmsVersionContract
      readonly displayName: string
      readonly currentHead: CmsHead
      readonly restoredFromVersionId: string | null
    }
  ): Promise<StoredVersionRow> {
    const canonicalDigest = digestCmsVersionContract(input.contract)
    const versionId = randomUUID()
    const versionNumber = input.currentHead.versionNumber + 1

    await transaction.execute(sql`set constraints all deferred`)
    await reserveDraftPath(
      transaction,
      input.pageId,
      input.contract.pageDocument.page.path
    )
    await transaction.insert(cmsPageVersions).values({
      id: versionId,
      pageId: input.pageId,
      versionNumber,
      parentVersionId: input.currentHead.versionId,
      restoredFromVersionId: input.restoredFromVersionId,
      pageSchemaVersion: input.contract.pageSchemaVersion,
      reviewSchemaVersion: input.contract.reviewSchemaVersion,
      sectionLibraryVersion: input.contract.sectionLibraryVersion,
      pageDocument: input.contract.pageDocument,
      reviewDocument: input.contract.reviewDocument,
      canonicalDigest,
      attributionKind: "self-declared",
      editorDisplayName: input.displayName,
      attemptId: input.attemptId,
      requestFingerprint: input.requestFingerprint,
    })
    const moved = await transaction.execute<
      Record<string, unknown> & { pageId: string }
    >(sql`
      update cms_pages
      set
        title = ${input.contract.pageDocument.page.title},
        draft_version_id = ${versionId},
        draft_version_number = ${versionNumber},
        draft_digest = ${canonicalDigest},
        updated_at = now()
      where id = ${input.pageId}
        and draft_version_id = ${input.currentHead.versionId}
        and draft_version_number = ${input.currentHead.versionNumber}
        and draft_digest = ${input.currentHead.digest}
      returning id as "pageId"
    `)
    if (moved.rows[0]?.pageId !== input.pageId) {
      throw new CmsRepositoryError("STALE_DRAFT")
    }

    await synchronizeReviewTargets(transaction, input.pageId, input.contract)
    const inserted = await loadVersionByAttempt(
      transaction,
      input.pageId,
      input.attemptId
    )
    if (!inserted) throw new CmsRepositoryError("PERSISTENCE_FAILED")
    return inserted
  }

  async function saveVersion(
    input: SaveCmsVersionInput
  ): Promise<CmsCommitResult> {
    assertRepositoryId(input.pageId)
    assertRepositoryId(input.attemptId)
    assertHead(input.expectedHead)
    assertContract(input.contract)
    assertReviewDocumentTargets(input.pageId, input.contract)
    const displayName = normaliseDisplayName(input.displayName)
    const requestFingerprint = digestCmsValue({
      operation: "save-version",
      pageId: input.pageId,
      expectedHead: input.expectedHead,
      contract: input.contract,
      displayName,
    })
    const nextDigest = digestCmsVersionContract(input.contract)

    try {
      return await database.transaction(async (transaction) => {
        const beforeLock = await loadVersionByAttempt(
          transaction,
          input.pageId,
          input.attemptId
        )
        if (beforeLock) {
          if (beforeLock.requestFingerprint !== requestFingerprint) {
            throw new CmsRepositoryError("ATTEMPT_REUSED")
          }
          return committedDraftResult(transaction, beforeLock)
        }

        const page = await lockPage(transaction, input.pageId)
        const afterLock = await loadVersionByAttempt(
          transaction,
          input.pageId,
          input.attemptId
        )
        if (afterLock) {
          if (afterLock.requestFingerprint !== requestFingerprint) {
            throw new CmsRepositoryError("ATTEMPT_REUSED")
          }
          return committedDraftResult(transaction, afterLock)
        }

        const currentHead = draftHeadFromPage(page)
        if (!sameHead(currentHead, input.expectedHead)) {
          const latest = await loadDraftSnapshot(transaction, input.pageId)
          throw new CmsRepositoryError("STALE_DRAFT", latest)
        }
        if (currentHead.digest === nextDigest) {
          throw new CmsRepositoryError("NO_CHANGES")
        }

        const inserted = await appendDraftVersion(transaction, {
          pageId: input.pageId,
          attemptId: input.attemptId,
          requestFingerprint,
          contract: input.contract,
          displayName,
          currentHead,
          restoredFromVersionId: null,
        })
        return committedDraftResult(transaction, inserted)
      })
    } catch (error) {
      translateDatabaseError(error)
    }
  }

  async function restoreVersion(
    input: RestoreCmsVersionInput
  ): Promise<CmsCommitResult> {
    assertRepositoryId(input.pageId)
    assertRepositoryId(input.sourceVersionId)
    assertRepositoryId(input.attemptId)
    assertHead(input.expectedHead)
    const displayName = normaliseDisplayName(input.displayName)
    const requestFingerprint = digestCmsValue({
      operation: "restore-version",
      pageId: input.pageId,
      sourceVersionId: input.sourceVersionId,
      expectedHead: input.expectedHead,
      displayName,
    })

    try {
      return await database.transaction(async (transaction) => {
        const beforeLock = await loadVersionByAttempt(
          transaction,
          input.pageId,
          input.attemptId
        )
        if (beforeLock) {
          if (beforeLock.requestFingerprint !== requestFingerprint) {
            throw new CmsRepositoryError("ATTEMPT_REUSED")
          }
          return committedDraftResult(transaction, beforeLock)
        }

        const page = await lockPage(transaction, input.pageId)
        const afterLock = await loadVersionByAttempt(
          transaction,
          input.pageId,
          input.attemptId
        )
        if (afterLock) {
          if (afterLock.requestFingerprint !== requestFingerprint) {
            throw new CmsRepositoryError("ATTEMPT_REUSED")
          }
          return committedDraftResult(transaction, afterLock)
        }

        const currentHead = draftHeadFromPage(page)
        if (!sameHead(currentHead, input.expectedHead)) {
          const latest = await loadDraftSnapshot(transaction, input.pageId)
          throw new CmsRepositoryError("STALE_DRAFT", latest)
        }
        if (currentHead.versionId === input.sourceVersionId) {
          throw new CmsRepositoryError("NO_CHANGES")
        }

        const sourceRow = await loadVersionById(
          transaction,
          input.pageId,
          input.sourceVersionId
        )
        if (!sourceRow) throw new CmsRepositoryError("VERSION_NOT_FOUND")
        const source = snapshotFromRow(sourceRow)
        const contract: CmsVersionContract = {
          pageSchemaVersion: source.pageSchemaVersion,
          reviewSchemaVersion: source.reviewSchemaVersion,
          sectionLibraryVersion: source.sectionLibraryVersion,
          pageDocument: source.pageDocument,
          reviewDocument: source.reviewDocument,
        }
        assertReviewDocumentTargets(input.pageId, contract)

        const inserted = await appendDraftVersion(transaction, {
          pageId: input.pageId,
          attemptId: input.attemptId,
          requestFingerprint,
          contract,
          displayName,
          currentHead,
          restoredFromVersionId: source.head.versionId,
        })
        return committedDraftResult(transaction, inserted)
      })
    } catch (error) {
      translateDatabaseError(error)
    }
  }

  async function getVersion(
    pageId: string,
    versionId: string
  ): Promise<CmsVersionSnapshot> {
    assertRepositoryId(pageId)
    assertRepositoryId(versionId)
    const row = await loadVersionById(database, pageId, versionId)
    if (!row) throw new CmsRepositoryError("VERSION_NOT_FOUND")
    return snapshotFromRow(row)
  }

  async function listVersions(
    pageId: string,
    cursor: number | null = null,
    requestedLimit = 20
  ): Promise<CmsVersionHistoryPage> {
    assertRepositoryId(pageId)
    if (
      (cursor !== null && (!Number.isInteger(cursor) || cursor < 1)) ||
      !Number.isInteger(requestedLimit) ||
      requestedLimit < 1 ||
      requestedLimit > 50
    ) {
      throw new CmsRepositoryError("INVALID_CURSOR")
    }
    const limit = requestedLimit + 1
    type HistoryRow = Record<string, unknown> & {
      versionId: string
      versionNumber: number
      canonicalDigest: string
      parentVersionId: string | null
      restoredFromVersionId: string | null
      attributionKind: "system-import" | "self-declared"
      editorDisplayName: string | null
      createdAt: Date | string
      draftVersionId: string
      publishedVersionId: string | null
    }
    const result = await database.execute<HistoryRow>(sql`
      select
        versions.id as "versionId",
        versions.version_number as "versionNumber",
        versions.canonical_digest as "canonicalDigest",
        versions.parent_version_id as "parentVersionId",
        versions.restored_from_version_id as "restoredFromVersionId",
        versions.attribution_kind as "attributionKind",
        versions.editor_display_name as "editorDisplayName",
        versions.created_at as "createdAt",
        pages.draft_version_id as "draftVersionId",
        pages.published_version_id as "publishedVersionId"
      from cms_pages as pages
      inner join cms_page_versions as versions on versions.page_id = pages.id
      where pages.id = ${pageId}
        and (${cursor}::int is null or versions.version_number < ${cursor})
      order by versions.version_number desc
      limit ${limit}
    `)
    if (result.rows.length === 0) {
      const page = await database.execute(sql`
        select 1 from cms_pages where id = ${pageId} limit 1
      `)
      if (page.rows.length === 0) throw new CmsRepositoryError("PAGE_NOT_FOUND")
    }
    const hasMore = result.rows.length > requestedLimit
    const visibleRows = result.rows.slice(0, requestedLimit)
    const versions = visibleRows.map((row) => ({
      head: {
        versionId: row.versionId,
        versionNumber: row.versionNumber,
        digest: row.canonicalDigest,
      },
      parentVersionId: row.parentVersionId,
      restoredFromVersionId: row.restoredFromVersionId,
      attributionKind: row.attributionKind,
      editorDisplayName: row.editorDisplayName,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : row.createdAt,
      isCurrentDraft: row.versionId === row.draftVersionId,
      isPublished: row.versionId === row.publishedVersionId,
    }))
    return {
      versions,
      nextCursor: hasMore ? (visibleRows.at(-1)?.versionNumber ?? null) : null,
    }
  }

  async function publishVersion(
    input: PublishCmsVersionInput
  ): Promise<CmsPublicationResult> {
    assertRepositoryId(input.pageId)
    assertRepositoryId(input.versionId)
    assertRepositoryId(input.attemptId)
    assertHead(input.expectedDraft)
    if (input.expectedPublished) assertHead(input.expectedPublished)
    const displayName = normaliseDisplayName(input.displayName)
    const requestFingerprint = digestCmsValue({
      operation: "publish-version",
      pageId: input.pageId,
      versionId: input.versionId,
      expectedDraft: input.expectedDraft,
      expectedPublished: input.expectedPublished,
      displayName,
    })

    try {
      return await database.transaction(async (transaction) => {
        const beforeLock = await loadPublicationByAttempt(
          transaction,
          input.pageId,
          input.attemptId
        )
        if (beforeLock) {
          if (beforeLock.requestFingerprint !== requestFingerprint) {
            throw new CmsRepositoryError("ATTEMPT_REUSED")
          }
          return committedPublicationResult(
            transaction,
            input.pageId,
            beforeLock
          )
        }

        const page = await lockPage(transaction, input.pageId)
        const afterLock = await loadPublicationByAttempt(
          transaction,
          input.pageId,
          input.attemptId
        )
        if (afterLock) {
          if (afterLock.requestFingerprint !== requestFingerprint) {
            throw new CmsRepositoryError("ATTEMPT_REUSED")
          }
          return committedPublicationResult(
            transaction,
            input.pageId,
            afterLock
          )
        }

        const currentDraft = draftHeadFromPage(page)
        const currentPublished = publishedHeadFromPage(page)
        if (!sameHead(currentDraft, input.expectedDraft)) {
          const latest = await loadDraftSnapshot(transaction, input.pageId)
          throw new CmsRepositoryError("STALE_DRAFT", latest)
        }
        if (!sameHead(currentPublished, input.expectedPublished)) {
          const latest = await loadPublishedSnapshot(transaction, input.pageId)
          throw new CmsRepositoryError("STALE_PUBLICATION", latest)
        }
        if (currentDraft.versionId !== input.versionId) {
          throw new CmsRepositoryError("STALE_DRAFT")
        }
        if (currentPublished && sameHead(currentPublished, currentDraft)) {
          throw new CmsRepositoryError("ALREADY_PUBLISHED")
        }

        const targetRow = await loadVersionById(
          transaction,
          input.pageId,
          input.versionId
        )
        if (!targetRow) throw new CmsRepositoryError("VERSION_NOT_FOUND")
        const target = snapshotFromRow(targetRow)
        const publishedPath = target.pageDocument.page.path

        await transaction.execute(sql`set constraints all deferred`)
        await movePublishedPath(transaction, input.pageId, publishedPath)
        await transaction.insert(cmsPublicationEvents).values({
          id: randomUUID(),
          pageId: input.pageId,
          eventKind: "publish",
          fromPublishedVersionId: currentPublished?.versionId ?? null,
          toPublishedVersionId: target.head.versionId,
          publishedPath,
          attributionKind: "self-declared",
          editorDisplayName: displayName,
          attemptId: input.attemptId,
          requestFingerprint,
        })
        const moved = await transaction.execute<
          Record<string, unknown> & { pageId: string }
        >(sql`
          update cms_pages
          set
            published_version_id = ${target.head.versionId},
            published_version_number = ${target.head.versionNumber},
            published_digest = ${target.head.digest},
            updated_at = now()
          where id = ${input.pageId}
            and draft_version_id = ${currentDraft.versionId}
            and draft_version_number = ${currentDraft.versionNumber}
            and draft_digest = ${currentDraft.digest}
            and published_version_id is not distinct from ${currentPublished?.versionId ?? null}::uuid
            and published_version_number is not distinct from ${currentPublished?.versionNumber ?? null}::int
            and published_digest is not distinct from ${currentPublished?.digest ?? null}::text
          returning id as "pageId"
        `)
        if (moved.rows[0]?.pageId !== input.pageId) {
          throw new CmsRepositoryError("STALE_PUBLICATION")
        }

        const event = await loadPublicationByAttempt(
          transaction,
          input.pageId,
          input.attemptId
        )
        if (!event) throw new CmsRepositoryError("PERSISTENCE_FAILED")
        return committedPublicationResult(transaction, input.pageId, event)
      })
    } catch (error) {
      translateDatabaseError(error)
    }
  }

  async function loadDraft(pageId: string): Promise<CmsVersionSnapshot> {
    assertRepositoryId(pageId)
    const snapshot = await loadDraftSnapshot(database, pageId)
    if (!snapshot) throw new CmsRepositoryError("PAGE_NOT_FOUND")
    return snapshot
  }

  async function loadPageState(pageId: string): Promise<CmsPageState> {
    assertRepositoryId(pageId)
    const result = await database.execute<StoredPageHeadRow>(sql`
      select
        pages.id as "pageId",
        pages.lifecycle as "lifecycle",
        pages.draft_version_id as "draftVersionId",
        pages.draft_version_number as "draftVersionNumber",
        pages.draft_digest as "draftDigest",
        pages.published_version_id as "publishedVersionId",
        pages.published_version_number as "publishedVersionNumber",
        pages.published_digest as "publishedDigest"
      from cms_pages as pages
      where pages.id = ${pageId}
      limit 1
    `)
    const page = result.rows.at(0)
    if (!page) throw new CmsRepositoryError("PAGE_NOT_FOUND")
    return {
      pageId,
      lifecycle: page.lifecycle,
      draftHead: draftHeadFromPage(page),
      publishedHead: publishedHeadFromPage(page),
    }
  }

  async function listComments(
    pageId: string,
    comparisonVersionId: string | null = null
  ): Promise<ReadonlyArray<CmsComment>> {
    assertRepositoryId(pageId)
    if (comparisonVersionId) assertRepositoryId(comparisonVersionId)
    const comparison = comparisonVersionId
      ? await getVersion(pageId, comparisonVersionId)
      : await loadDraft(pageId)
    const result = await database.execute<StoredCommentRow>(sql`
      select ${commentSelect()}
      from cms_comments as comments
      inner join cms_review_targets as targets
        on targets.page_id = comments.page_id
        and targets.id = comments.target_id
      inner join cms_page_versions as versions
        on versions.page_id = comments.page_id
        and versions.id = comments.target_version_id
      where comments.page_id = ${pageId}
      order by comments.created_at asc, comments.id asc
    `)
    return result.rows.map((row) => commentFromRow(row, comparison))
  }

  async function createComment(
    input: CreateCmsCommentInput
  ): Promise<CmsComment> {
    assertRepositoryId(input.id)
    assertRepositoryId(input.pageId)
    assertRepositoryId(input.targetId)
    assertRepositoryId(input.targetVersionId)
    if (!isCommentSubject(input.subject)) {
      throw new CmsRepositoryError("INVALID_COMMENT")
    }
    const body = normaliseCommentBody(input.body)
    const displayName = normaliseDisplayName(input.displayName)

    return database.transaction(async (transaction) => {
      const existing = await loadCommentById(transaction, input.id)
      if (existing) {
        if (
          existing.pageId !== input.pageId ||
          existing.targetId !== input.targetId ||
          existing.targetVersionId !== input.targetVersionId ||
          existing.subject !== input.subject ||
          existing.body !== body ||
          existing.displayName !== displayName
        ) {
          throw new CmsRepositoryError("COMMENT_ID_REUSED")
        }
        const comparisonRow = await loadVersionById(
          transaction,
          input.pageId,
          input.targetVersionId
        )
        if (!comparisonRow) throw new CmsRepositoryError("CORRUPT_STATE")
        return commentFromRow(existing, snapshotFromRow(comparisonRow))
      }

      const targetResult = await transaction.execute<
        Record<string, unknown> & {
          id: string
          state: "active" | "archived"
        }
      >(sql`
        select id, state
        from cms_review_targets
        where page_id = ${input.pageId} and id = ${input.targetId}
        for share
      `)
      const target = targetResult.rows.at(0)
      if (!target) throw new CmsRepositoryError("TARGET_NOT_FOUND")
      if (target.state === "archived") {
        throw new CmsRepositoryError("TARGET_ARCHIVED")
      }
      const version = await loadVersionById(
        transaction,
        input.pageId,
        input.targetVersionId
      )
      if (!version) throw new CmsRepositoryError("VERSION_NOT_FOUND")

      await transaction.insert(cmsComments).values({
        id: input.id,
        pageId: input.pageId,
        targetId: input.targetId,
        targetVersionId: input.targetVersionId,
        subject: input.subject,
        body,
        displayName,
        status: "open",
      })
      const inserted = await loadCommentById(transaction, input.id)
      if (!inserted) throw new CmsRepositoryError("PERSISTENCE_FAILED")
      return commentFromRow(inserted, snapshotFromRow(version))
    })
  }

  async function updateCommentStatus(
    input: UpdateCmsCommentStatusInput
  ): Promise<CmsComment> {
    assertRepositoryId(input.pageId)
    assertRepositoryId(input.commentId)
    if (!isCommentStatus(input.status)) {
      throw new CmsRepositoryError("INVALID_COMMENT")
    }

    return database.transaction(async (transaction) => {
      const updated = await transaction
        .update(cmsComments)
        .set({ status: input.status, updatedAt: sql`now()` })
        .where(
          and(
            eq(cmsComments.pageId, input.pageId),
            eq(cmsComments.id, input.commentId)
          )
        )
        .returning({ id: cmsComments.id })
      if (!updated[0]) throw new CmsRepositoryError("COMMENT_NOT_FOUND")
      const row = await loadCommentById(transaction, input.commentId)
      const comparison = await loadDraftSnapshot(transaction, input.pageId)
      if (!row || !comparison) throw new CmsRepositoryError("CORRUPT_STATE")
      return commentFromRow(row, comparison)
    })
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

  return {
    createComment,
    importInitialPage,
    getVersion,
    listVersions,
    listComments,
    loadDraft,
    loadPageState,
    loadPublishedPage,
    publishVersion,
    restoreVersion,
    saveVersion,
    updateCommentStatus,
  }
}
