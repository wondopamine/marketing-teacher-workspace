CREATE TABLE "cms_comments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"page_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"target_version_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"display_name" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_comments_subject_check" CHECK ("cms_comments"."subject" in ('page-content', 'design-intent')),
	CONSTRAINT "cms_comments_status_check" CHECK ("cms_comments"."status" in ('open', 'resolved', 'withdrawn')),
	CONSTRAINT "cms_comments_body_check" CHECK (length(btrim("cms_comments"."body")) between 1 and 4000),
	CONSTRAINT "cms_comments_display_name_check" CHECK (length(btrim("cms_comments"."display_name")) between 1 and 80)
);
--> statement-breakpoint
CREATE TABLE "cms_page_lifecycle_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"page_id" uuid NOT NULL,
	"event_kind" text NOT NULL,
	"from_lifecycle_version" integer,
	"to_lifecycle_version" integer NOT NULL,
	"attribution_kind" text NOT NULL,
	"editor_display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"request_fingerprint" text NOT NULL,
	CONSTRAINT "cms_page_lifecycle_events_page_attempt_uq" UNIQUE("page_id","attempt_id"),
	CONSTRAINT "cms_page_lifecycle_events_kind_check" CHECK ("cms_page_lifecycle_events"."event_kind" in ('created', 'archived', 'restored')),
	CONSTRAINT "cms_page_lifecycle_events_version_check" CHECK ("cms_page_lifecycle_events"."to_lifecycle_version" > 0
          and ("cms_page_lifecycle_events"."from_lifecycle_version" is null
            or "cms_page_lifecycle_events"."from_lifecycle_version" > 0)),
	CONSTRAINT "cms_page_lifecycle_events_fingerprint_check" CHECK ("cms_page_lifecycle_events"."request_fingerprint" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "cms_page_lifecycle_events_attribution_check" CHECK (("cms_page_lifecycle_events"."attribution_kind" = 'system-import'
            and "cms_page_lifecycle_events"."editor_display_name" is null)
          or ("cms_page_lifecycle_events"."attribution_kind" = 'self-declared'
            and length(btrim("cms_page_lifecycle_events"."editor_display_name")) between 1 and 80))
);
--> statement-breakpoint
CREATE TABLE "cms_page_versions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"page_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"parent_version_id" uuid,
	"restored_from_version_id" uuid,
	"page_schema_version" integer NOT NULL,
	"review_schema_version" integer NOT NULL,
	"section_library_version" integer NOT NULL,
	"page_document" jsonb NOT NULL,
	"review_document" jsonb NOT NULL,
	"canonical_digest" text NOT NULL,
	"attribution_kind" text NOT NULL,
	"editor_display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"request_fingerprint" text NOT NULL,
	CONSTRAINT "cms_page_versions_page_version_uq" UNIQUE("page_id","version_number"),
	CONSTRAINT "cms_page_versions_page_attempt_uq" UNIQUE("page_id","attempt_id"),
	CONSTRAINT "cms_page_versions_page_id_id_uq" UNIQUE("page_id","id"),
	CONSTRAINT "cms_page_versions_head_pointer_uq" UNIQUE("page_id","id","version_number","canonical_digest"),
	CONSTRAINT "cms_page_versions_version_number_check" CHECK ("cms_page_versions"."version_number" > 0),
	CONSTRAINT "cms_page_versions_schema_versions_check" CHECK ("cms_page_versions"."page_schema_version" > 0
          and "cms_page_versions"."review_schema_version" > 0
          and "cms_page_versions"."section_library_version" > 0),
	CONSTRAINT "cms_page_versions_page_document_check" CHECK (jsonb_typeof("cms_page_versions"."page_document") = 'object'),
	CONSTRAINT "cms_page_versions_review_document_check" CHECK (jsonb_typeof("cms_page_versions"."review_document") = 'object'),
	CONSTRAINT "cms_page_versions_digest_check" CHECK ("cms_page_versions"."canonical_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "cms_page_versions_fingerprint_check" CHECK ("cms_page_versions"."request_fingerprint" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "cms_page_versions_attribution_check" CHECK (("cms_page_versions"."attribution_kind" = 'system-import'
            and "cms_page_versions"."editor_display_name" is null)
          or ("cms_page_versions"."attribution_kind" = 'self-declared'
            and length(btrim("cms_page_versions"."editor_display_name")) between 1 and 80))
);
--> statement-breakpoint
CREATE TABLE "cms_pages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"lifecycle" text DEFAULT 'active' NOT NULL,
	"lifecycle_version" integer DEFAULT 1 NOT NULL,
	"draft_version_id" uuid NOT NULL,
	"draft_version_number" integer NOT NULL,
	"draft_digest" text NOT NULL,
	"published_version_id" uuid,
	"published_version_number" integer,
	"published_digest" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "cms_pages_lifecycle_check" CHECK ("cms_pages"."lifecycle" in ('active', 'archived')),
	CONSTRAINT "cms_pages_lifecycle_version_check" CHECK ("cms_pages"."lifecycle_version" > 0),
	CONSTRAINT "cms_pages_lifecycle_time_check" CHECK (("cms_pages"."lifecycle" = 'active' and "cms_pages"."archived_at" is null)
          or ("cms_pages"."lifecycle" = 'archived' and "cms_pages"."archived_at" is not null)),
	CONSTRAINT "cms_pages_draft_version_check" CHECK ("cms_pages"."draft_version_number" > 0),
	CONSTRAINT "cms_pages_draft_digest_check" CHECK ("cms_pages"."draft_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "cms_pages_published_head_check" CHECK (("cms_pages"."published_version_id" is null
            and "cms_pages"."published_version_number" is null
            and "cms_pages"."published_digest" is null)
          or ("cms_pages"."published_version_id" is not null
            and "cms_pages"."published_version_number" > 0
            and "cms_pages"."published_digest" ~ '^[0-9a-f]{64}$'))
);
--> statement-breakpoint
CREATE TABLE "cms_publication_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"page_id" uuid NOT NULL,
	"event_kind" text NOT NULL,
	"from_published_version_id" uuid,
	"to_published_version_id" uuid,
	"published_path" text,
	"attribution_kind" text NOT NULL,
	"editor_display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"request_fingerprint" text NOT NULL,
	CONSTRAINT "cms_publication_events_page_attempt_uq" UNIQUE("page_id","attempt_id"),
	CONSTRAINT "cms_publication_events_kind_check" CHECK ("cms_publication_events"."event_kind" in ('initial-import', 'publish', 'unpublish')),
	CONSTRAINT "cms_publication_events_path_check" CHECK ("cms_publication_events"."published_path" is null
          or "cms_publication_events"."published_path" ~ '^/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$'),
	CONSTRAINT "cms_publication_events_fingerprint_check" CHECK ("cms_publication_events"."request_fingerprint" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "cms_publication_events_attribution_check" CHECK (("cms_publication_events"."attribution_kind" = 'system-import'
            and "cms_publication_events"."editor_display_name" is null)
          or ("cms_publication_events"."attribution_kind" = 'self-declared'
            and length(btrim("cms_publication_events"."editor_display_name")) between 1 and 80))
);
--> statement-breakpoint
CREATE TABLE "cms_review_targets" (
	"id" uuid NOT NULL,
	"page_id" uuid NOT NULL,
	"section_id" uuid,
	"field_key" text,
	"repeated_item_id" uuid,
	"parent_target_id" uuid,
	"kind" text NOT NULL,
	"state" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "cms_review_targets_page_id_id_pk" PRIMARY KEY("page_id","id"),
	CONSTRAINT "cms_review_targets_kind_check" CHECK ("cms_review_targets"."kind" in ('page', 'section', 'field', 'repeated-item', 'screen')),
	CONSTRAINT "cms_review_targets_state_check" CHECK ("cms_review_targets"."state" in ('active', 'archived')),
	CONSTRAINT "cms_review_targets_archive_time_check" CHECK (("cms_review_targets"."state" = 'active' and "cms_review_targets"."archived_at" is null)
          or ("cms_review_targets"."state" = 'archived' and "cms_review_targets"."archived_at" is not null)),
	CONSTRAINT "cms_review_targets_location_check" CHECK (("cms_review_targets"."kind" = 'page'
            and "cms_review_targets"."section_id" is null
            and "cms_review_targets"."field_key" is null
            and "cms_review_targets"."repeated_item_id" is null)
          or ("cms_review_targets"."kind" = 'section'
            and "cms_review_targets"."section_id" is not null
            and "cms_review_targets"."field_key" is null
            and "cms_review_targets"."repeated_item_id" is null)
          or ("cms_review_targets"."kind" = 'field'
            and "cms_review_targets"."field_key" is not null)
          or ("cms_review_targets"."kind" = 'repeated-item'
            and "cms_review_targets"."section_id" is not null
            and "cms_review_targets"."field_key" is null
            and "cms_review_targets"."repeated_item_id" is not null)
          or ("cms_review_targets"."kind" = 'screen'
            and "cms_review_targets"."section_id" is not null
            and "cms_review_targets"."field_key" is null
            and "cms_review_targets"."repeated_item_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "cms_routes" (
	"normalized_path" text PRIMARY KEY NOT NULL,
	"page_id" uuid NOT NULL,
	"is_draft_path" boolean DEFAULT false NOT NULL,
	"is_published_path" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_routes_path_check" CHECK ("cms_routes"."normalized_path" ~ '^/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$')
);
--> statement-breakpoint
ALTER TABLE "cms_comments" ADD CONSTRAINT "cms_comments_target_fk" FOREIGN KEY ("page_id","target_id") REFERENCES "public"."cms_review_targets"("page_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_comments" ADD CONSTRAINT "cms_comments_target_version_fk" FOREIGN KEY ("page_id","target_version_id") REFERENCES "public"."cms_page_versions"("page_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_page_lifecycle_events" ADD CONSTRAINT "cms_page_lifecycle_events_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_page_versions" ADD CONSTRAINT "cms_page_versions_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_page_versions" ADD CONSTRAINT "cms_page_versions_parent_fk" FOREIGN KEY ("page_id","parent_version_id") REFERENCES "public"."cms_page_versions"("page_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_page_versions" ADD CONSTRAINT "cms_page_versions_restore_source_fk" FOREIGN KEY ("page_id","restored_from_version_id") REFERENCES "public"."cms_page_versions"("page_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_publication_events" ADD CONSTRAINT "cms_publication_events_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_publication_events" ADD CONSTRAINT "cms_publication_events_from_version_fk" FOREIGN KEY ("page_id","from_published_version_id") REFERENCES "public"."cms_page_versions"("page_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_publication_events" ADD CONSTRAINT "cms_publication_events_to_version_fk" FOREIGN KEY ("page_id","to_published_version_id") REFERENCES "public"."cms_page_versions"("page_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_review_targets" ADD CONSTRAINT "cms_review_targets_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_review_targets" ADD CONSTRAINT "cms_review_targets_parent_fk" FOREIGN KEY ("page_id","parent_target_id") REFERENCES "public"."cms_review_targets"("page_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_routes" ADD CONSTRAINT "cms_routes_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cms_comments_target_created" ON "cms_comments" USING btree ("page_id","target_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_cms_comments_page_status" ON "cms_comments" USING btree ("page_id","status");--> statement-breakpoint
CREATE INDEX "idx_cms_page_lifecycle_events_page_created" ON "cms_page_lifecycle_events" USING btree ("page_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_cms_page_versions_page_version" ON "cms_page_versions" USING btree ("page_id","version_number" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_cms_pages_lifecycle_updated" ON "cms_pages" USING btree ("lifecycle","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_cms_publication_events_page_created" ON "cms_publication_events" USING btree ("page_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_cms_review_targets_page_state" ON "cms_review_targets" USING btree ("page_id","state");--> statement-breakpoint
CREATE INDEX "idx_cms_review_targets_section" ON "cms_review_targets" USING btree ("page_id","section_id");--> statement-breakpoint
CREATE INDEX "idx_cms_routes_page" ON "cms_routes" USING btree ("page_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cms_routes_page_draft_uq" ON "cms_routes" USING btree ("page_id") WHERE "cms_routes"."is_draft_path" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "cms_routes_page_published_uq" ON "cms_routes" USING btree ("page_id") WHERE "cms_routes"."is_published_path" = true;
--> statement-breakpoint
ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_draft_version_fk"
FOREIGN KEY ("id", "draft_version_id", "draft_version_number", "draft_digest")
REFERENCES "cms_page_versions" ("page_id", "id", "version_number", "canonical_digest")
ON DELETE RESTRICT
DEFERRABLE INITIALLY DEFERRED;
--> statement-breakpoint
ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_published_version_fk"
FOREIGN KEY ("id", "published_version_id", "published_version_number", "published_digest")
REFERENCES "cms_page_versions" ("page_id", "id", "version_number", "canonical_digest")
ON DELETE RESTRICT
DEFERRABLE INITIALLY DEFERRED;
--> statement-breakpoint
CREATE UNIQUE INDEX "cms_review_targets_location_uq"
ON "cms_review_targets" (
  "page_id",
  "kind",
  "section_id",
  "field_key",
  "repeated_item_id"
) NULLS NOT DISTINCT;
--> statement-breakpoint
CREATE FUNCTION "cms_reject_append_only_change"() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME USING ERRCODE = '55000';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "cms_page_versions_append_only"
BEFORE UPDATE OR DELETE ON "cms_page_versions"
FOR EACH ROW EXECUTE FUNCTION "cms_reject_append_only_change"();
--> statement-breakpoint
CREATE TRIGGER "cms_publication_events_append_only"
BEFORE UPDATE OR DELETE ON "cms_publication_events"
FOR EACH ROW EXECUTE FUNCTION "cms_reject_append_only_change"();
--> statement-breakpoint
CREATE TRIGGER "cms_page_lifecycle_events_append_only"
BEFORE UPDATE OR DELETE ON "cms_page_lifecycle_events"
FOR EACH ROW EXECUTE FUNCTION "cms_reject_append_only_change"();
