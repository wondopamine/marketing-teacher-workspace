import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"
import type { AnyPgColumn } from "drizzle-orm/pg-core"

import type { CmsPageDocument, CmsReviewDocument } from "@/cms/document"

const digestCheck = (column: AnyPgColumn) => sql`${column} ~ '^[0-9a-f]{64}$'`

export const cmsPages = pgTable(
  "cms_pages",
  {
    id: uuid("id").primaryKey(),
    title: text("title").notNull(),
    lifecycle: text("lifecycle").notNull().default("active"),
    lifecycleVersion: integer("lifecycle_version").notNull().default(1),
    draftVersionId: uuid("draft_version_id").notNull(),
    draftVersionNumber: integer("draft_version_number").notNull(),
    draftDigest: text("draft_digest").notNull(),
    publishedVersionId: uuid("published_version_id"),
    publishedVersionNumber: integer("published_version_number"),
    publishedDigest: text("published_digest"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    archivedAt: timestamp("archived_at", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    check(
      "cms_pages_lifecycle_check",
      sql`${table.lifecycle} in ('active', 'archived')`
    ),
    check(
      "cms_pages_lifecycle_version_check",
      sql`${table.lifecycleVersion} > 0`
    ),
    check(
      "cms_pages_lifecycle_time_check",
      sql`(${table.lifecycle} = 'active' and ${table.archivedAt} is null)
          or (${table.lifecycle} = 'archived' and ${table.archivedAt} is not null)`
    ),
    check(
      "cms_pages_draft_version_check",
      sql`${table.draftVersionNumber} > 0`
    ),
    check("cms_pages_draft_digest_check", digestCheck(table.draftDigest)),
    check(
      "cms_pages_published_head_check",
      sql`(${table.publishedVersionId} is null
            and ${table.publishedVersionNumber} is null
            and ${table.publishedDigest} is null)
          or (${table.publishedVersionId} is not null
            and ${table.publishedVersionNumber} > 0
            and ${table.publishedDigest} ~ '^[0-9a-f]{64}$')`
    ),
    index("idx_cms_pages_lifecycle_updated").on(
      table.lifecycle,
      table.updatedAt.desc()
    ),
  ]
)

export const cmsPageVersions = pgTable(
  "cms_page_versions",
  {
    id: uuid("id").primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references((): AnyPgColumn => cmsPages.id, { onDelete: "restrict" }),
    versionNumber: integer("version_number").notNull(),
    parentVersionId: uuid("parent_version_id"),
    restoredFromVersionId: uuid("restored_from_version_id"),
    pageSchemaVersion: integer("page_schema_version").notNull(),
    reviewSchemaVersion: integer("review_schema_version").notNull(),
    sectionLibraryVersion: integer("section_library_version").notNull(),
    pageDocument: jsonb("page_document").$type<CmsPageDocument>().notNull(),
    reviewDocument: jsonb("review_document")
      .$type<CmsReviewDocument>()
      .notNull(),
    canonicalDigest: text("canonical_digest").notNull(),
    attributionKind: text("attribution_kind").notNull(),
    editorDisplayName: text("editor_display_name"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    attemptId: uuid("attempt_id").notNull(),
    requestFingerprint: text("request_fingerprint").notNull(),
  },
  (table) => [
    check(
      "cms_page_versions_version_number_check",
      sql`${table.versionNumber} > 0`
    ),
    check(
      "cms_page_versions_schema_versions_check",
      sql`${table.pageSchemaVersion} > 0
          and ${table.reviewSchemaVersion} > 0
          and ${table.sectionLibraryVersion} > 0`
    ),
    check(
      "cms_page_versions_page_document_check",
      sql`jsonb_typeof(${table.pageDocument}) = 'object'`
    ),
    check(
      "cms_page_versions_review_document_check",
      sql`jsonb_typeof(${table.reviewDocument}) = 'object'`
    ),
    check("cms_page_versions_digest_check", digestCheck(table.canonicalDigest)),
    check(
      "cms_page_versions_fingerprint_check",
      digestCheck(table.requestFingerprint)
    ),
    check(
      "cms_page_versions_attribution_check",
      sql`(${table.attributionKind} = 'system-import'
            and ${table.editorDisplayName} is null)
          or (${table.attributionKind} = 'self-declared'
            and length(btrim(${table.editorDisplayName})) between 1 and 80)`
    ),
    unique("cms_page_versions_page_version_uq").on(
      table.pageId,
      table.versionNumber
    ),
    unique("cms_page_versions_page_attempt_uq").on(
      table.pageId,
      table.attemptId
    ),
    unique("cms_page_versions_page_id_id_uq").on(table.pageId, table.id),
    unique("cms_page_versions_head_pointer_uq").on(
      table.pageId,
      table.id,
      table.versionNumber,
      table.canonicalDigest
    ),
    foreignKey({
      name: "cms_page_versions_parent_fk",
      columns: [table.pageId, table.parentVersionId],
      foreignColumns: [table.pageId, table.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "cms_page_versions_restore_source_fk",
      columns: [table.pageId, table.restoredFromVersionId],
      foreignColumns: [table.pageId, table.id],
    }).onDelete("restrict"),
    index("idx_cms_page_versions_page_version").on(
      table.pageId,
      table.versionNumber.desc()
    ),
  ]
)

export const cmsRoutes = pgTable(
  "cms_routes",
  {
    normalizedPath: text("normalized_path").primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => cmsPages.id, { onDelete: "restrict" }),
    isDraftPath: boolean("is_draft_path").notNull().default(false),
    isPublishedPath: boolean("is_published_path").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "cms_routes_path_check",
      sql`${table.normalizedPath} ~ '^/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$'`
    ),
    index("idx_cms_routes_page").on(table.pageId),
    uniqueIndex("cms_routes_page_draft_uq")
      .on(table.pageId)
      .where(sql`${table.isDraftPath} = true`),
    uniqueIndex("cms_routes_page_published_uq")
      .on(table.pageId)
      .where(sql`${table.isPublishedPath} = true`),
  ]
)

export const cmsPublicationEvents = pgTable(
  "cms_publication_events",
  {
    id: uuid("id").primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => cmsPages.id, { onDelete: "restrict" }),
    eventKind: text("event_kind").notNull(),
    fromPublishedVersionId: uuid("from_published_version_id"),
    toPublishedVersionId: uuid("to_published_version_id"),
    publishedPath: text("published_path"),
    attributionKind: text("attribution_kind").notNull(),
    editorDisplayName: text("editor_display_name"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    attemptId: uuid("attempt_id").notNull(),
    requestFingerprint: text("request_fingerprint").notNull(),
  },
  (table) => [
    check(
      "cms_publication_events_kind_check",
      sql`${table.eventKind} in ('initial-import', 'publish', 'unpublish')`
    ),
    check(
      "cms_publication_events_path_check",
      sql`${table.publishedPath} is null
          or ${table.publishedPath} ~ '^/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$'`
    ),
    check(
      "cms_publication_events_fingerprint_check",
      digestCheck(table.requestFingerprint)
    ),
    check(
      "cms_publication_events_attribution_check",
      sql`(${table.attributionKind} = 'system-import'
            and ${table.editorDisplayName} is null)
          or (${table.attributionKind} = 'self-declared'
            and length(btrim(${table.editorDisplayName})) between 1 and 80)`
    ),
    unique("cms_publication_events_page_attempt_uq").on(
      table.pageId,
      table.attemptId
    ),
    foreignKey({
      name: "cms_publication_events_from_version_fk",
      columns: [table.pageId, table.fromPublishedVersionId],
      foreignColumns: [cmsPageVersions.pageId, cmsPageVersions.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "cms_publication_events_to_version_fk",
      columns: [table.pageId, table.toPublishedVersionId],
      foreignColumns: [cmsPageVersions.pageId, cmsPageVersions.id],
    }).onDelete("restrict"),
    index("idx_cms_publication_events_page_created").on(
      table.pageId,
      table.createdAt.desc()
    ),
  ]
)

export const cmsPageLifecycleEvents = pgTable(
  "cms_page_lifecycle_events",
  {
    id: uuid("id").primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => cmsPages.id, { onDelete: "restrict" }),
    eventKind: text("event_kind").notNull(),
    fromLifecycleVersion: integer("from_lifecycle_version"),
    toLifecycleVersion: integer("to_lifecycle_version").notNull(),
    attributionKind: text("attribution_kind").notNull(),
    editorDisplayName: text("editor_display_name"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    attemptId: uuid("attempt_id").notNull(),
    requestFingerprint: text("request_fingerprint").notNull(),
  },
  (table) => [
    check(
      "cms_page_lifecycle_events_kind_check",
      sql`${table.eventKind} in ('created', 'archived', 'restored')`
    ),
    check(
      "cms_page_lifecycle_events_version_check",
      sql`${table.toLifecycleVersion} > 0
          and (${table.fromLifecycleVersion} is null
            or ${table.fromLifecycleVersion} > 0)`
    ),
    check(
      "cms_page_lifecycle_events_fingerprint_check",
      digestCheck(table.requestFingerprint)
    ),
    check(
      "cms_page_lifecycle_events_attribution_check",
      sql`(${table.attributionKind} = 'system-import'
            and ${table.editorDisplayName} is null)
          or (${table.attributionKind} = 'self-declared'
            and length(btrim(${table.editorDisplayName})) between 1 and 80)`
    ),
    unique("cms_page_lifecycle_events_page_attempt_uq").on(
      table.pageId,
      table.attemptId
    ),
    index("idx_cms_page_lifecycle_events_page_created").on(
      table.pageId,
      table.createdAt.desc()
    ),
  ]
)

export const cmsReviewTargets = pgTable(
  "cms_review_targets",
  {
    id: uuid("id").notNull(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => cmsPages.id, { onDelete: "restrict" }),
    sectionId: uuid("section_id"),
    fieldKey: text("field_key"),
    repeatedItemId: uuid("repeated_item_id"),
    parentTargetId: uuid("parent_target_id"),
    kind: text("kind").notNull(),
    state: text("state").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    archivedAt: timestamp("archived_at", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    primaryKey({ columns: [table.pageId, table.id] }),
    check(
      "cms_review_targets_kind_check",
      sql`${table.kind} in ('page', 'section', 'field', 'repeated-item', 'screen')`
    ),
    check(
      "cms_review_targets_state_check",
      sql`${table.state} in ('active', 'archived')`
    ),
    check(
      "cms_review_targets_archive_time_check",
      sql`(${table.state} = 'active' and ${table.archivedAt} is null)
          or (${table.state} = 'archived' and ${table.archivedAt} is not null)`
    ),
    check(
      "cms_review_targets_location_check",
      sql`(${table.kind} = 'page'
            and ${table.sectionId} is null
            and ${table.fieldKey} is null
            and ${table.repeatedItemId} is null)
          or (${table.kind} = 'section'
            and ${table.sectionId} is not null
            and ${table.fieldKey} is null
            and ${table.repeatedItemId} is null)
          or (${table.kind} = 'field'
            and ${table.fieldKey} is not null)
          or (${table.kind} = 'repeated-item'
            and ${table.sectionId} is not null
            and ${table.fieldKey} is null
            and ${table.repeatedItemId} is not null)
          or (${table.kind} = 'screen'
            and ${table.sectionId} is not null
            and ${table.fieldKey} is null
            and ${table.repeatedItemId} is not null)`
    ),
    foreignKey({
      name: "cms_review_targets_parent_fk",
      columns: [table.pageId, table.parentTargetId],
      foreignColumns: [table.pageId, table.id],
    }).onDelete("restrict"),
    index("idx_cms_review_targets_page_state").on(table.pageId, table.state),
    index("idx_cms_review_targets_section").on(table.pageId, table.sectionId),
  ]
)

export const cmsComments = pgTable(
  "cms_comments",
  {
    id: uuid("id").primaryKey(),
    pageId: uuid("page_id").notNull(),
    targetId: uuid("target_id").notNull(),
    targetVersionId: uuid("target_version_id").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    displayName: text("display_name").notNull(),
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "cms_comments_subject_check",
      sql`${table.subject} in ('page-content', 'design-intent')`
    ),
    check(
      "cms_comments_status_check",
      sql`${table.status} in ('open', 'resolved', 'withdrawn')`
    ),
    check(
      "cms_comments_body_check",
      sql`length(btrim(${table.body})) between 1 and 4000`
    ),
    check(
      "cms_comments_display_name_check",
      sql`length(btrim(${table.displayName})) between 1 and 80`
    ),
    foreignKey({
      name: "cms_comments_target_fk",
      columns: [table.pageId, table.targetId],
      foreignColumns: [cmsReviewTargets.pageId, cmsReviewTargets.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "cms_comments_target_version_fk",
      columns: [table.pageId, table.targetVersionId],
      foreignColumns: [cmsPageVersions.pageId, cmsPageVersions.id],
    }).onDelete("restrict"),
    index("idx_cms_comments_target_created").on(
      table.pageId,
      table.targetId,
      table.createdAt.desc()
    ),
    index("idx_cms_comments_page_status").on(table.pageId, table.status),
  ]
)
