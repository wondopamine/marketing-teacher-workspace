import "@tanstack/react-start/server-only"

import { createHash } from "node:crypto"

import {
  buildReviewDraftProjection,
  contentReviewManifest,
  createContentReviewRegistry,
  type ContentReviewManifestEntry,
  type ContentReviewRecord,
  type ReviewBuildOptions,
} from "./landing-v2-review.server"
import {
  landingPageV2Content,
  landingPageV2MeasurementPlan,
  landingPageV2Publication,
} from "./landing-v2"

import type {
  ContentReviewAppendixDto,
  ContentReviewContextDto,
  ContentReviewEntryDto,
  ContentReviewPageDto,
  ContentReviewReadyPageDto,
  ContentReviewSectionDto,
  ContentReviewStatus,
  ReviewDraftEntryDto,
  ReviewDraftProjectionDto,
  ReviewReference,
} from "./landing-v2-review.types"

const snapshotVersion = "v1"

type SnapshotValue =
  | null
  | boolean
  | number
  | string
  | ReadonlyArray<SnapshotValue>
  | { readonly [key: string]: SnapshotValue }

type ReviewStatusInput = {
  readonly currentSnapshot: string
  readonly blocked: boolean
  readonly explicitDecisionRequired: boolean
  readonly reviewerRequirement: "confirmed" | "unresolved"
  readonly requiredReviewers: ReadonlyArray<string>
  readonly records: ReadonlyArray<ContentReviewRecord>
}

type ReviewStatusResult = {
  readonly status: ContentReviewStatus
  readonly remainingReviewers: ReadonlyArray<string>
  readonly blockers: ReadonlyArray<string>
}

export type ReviewDraftSnapshots = {
  readonly byReference: Readonly<Record<ReviewReference, string>>
  readonly itemSnapshot: string
  readonly iaOrderSnapshot: string
  readonly storySnapshot: string
}

function normaliseSnapshotString(value: string): string {
  return value.normalize("NFKC").replace(/\r\n?/g, "\n").trim()
}

function normaliseSnapshotValue(value: unknown): SnapshotValue {
  if (value === null || typeof value === "boolean" || typeof value === "number") {
    return value
  }
  if (typeof value === "string") return normaliseSnapshotString(value)
  if (Array.isArray(value)) return value.map(normaliseSnapshotValue)
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, nestedValue]) => nestedValue !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, normaliseSnapshotValue(nestedValue)])
    )
  }
  return normaliseSnapshotString(String(value))
}

export function createReviewSnapshot(value: unknown): string {
  const canonical = JSON.stringify(normaliseSnapshotValue(value))
  const digest = createHash("sha256").update(canonical).digest("hex").slice(0, 16)
  return `${snapshotVersion}-sha256-${digest}`
}

function entrySnapshotPayload(entry: ReviewDraftEntryDto): SnapshotValue {
  if (entry.kind === "decision") return { kind: "omission" }

  return {
    kind: "content",
    contentKind: entry.contentKind,
    label: entry.label,
    heading: entry.heading,
    body: entry.body,
    link: entry.link
      ? {
          label: entry.link.label,
          href: entry.link.href,
          note: entry.link.note,
          purpose: entry.link.purpose,
        }
      : null,
  }
}

function sectionSnapshotPayload(
  section: ReviewDraftProjectionDto["sections"][number]
): SnapshotValue {
  return {
    kind: section.kind,
    entries: section.entries.map(entrySnapshotPayload),
  }
}

export function getReviewDraftSnapshots(
  projection: ReviewDraftProjectionDto,
  manifest: ReadonlyArray<ContentReviewManifestEntry> = contentReviewManifest
): ReviewDraftSnapshots {
  const byReference = {} as Record<ReviewReference, string>
  byReference[projection.metadata.reviewReference] = createReviewSnapshot(
    entrySnapshotPayload(projection.metadata)
  )

  for (const section of projection.sections) {
    byReference[section.reviewReference] = createReviewSnapshot(
      sectionSnapshotPayload(section)
    )
    for (const entry of section.entries) {
      byReference[entry.reviewReference] = createReviewSnapshot(
        entrySnapshotPayload(entry)
      )
    }
  }

  const manifestByReference = new Map(
    manifest.map((item) => [item.reviewReference, item])
  )
  const orderedSectionIds = projection.sections.map(
    (section) =>
      manifestByReference.get(section.reviewReference)?.contentId ??
      section.reviewReference
  )
  const storyPayload = {
    metadata: entrySnapshotPayload(projection.metadata),
    sections: projection.sections.map(sectionSnapshotPayload),
  }
  const orderedItemSnapshots = [
    projection.metadata.reviewReference,
    ...projection.sections.flatMap((section) => [
      section.reviewReference,
      ...section.entries.map((entry) => entry.reviewReference),
    ]),
  ].map((reviewReference) => ({
    reviewReference,
    snapshot: byReference[reviewReference],
  }))

  return {
    byReference,
    itemSnapshot: createReviewSnapshot(orderedItemSnapshots),
    iaOrderSnapshot: createReviewSnapshot(orderedSectionIds),
    storySnapshot: createReviewSnapshot(storyPayload),
  }
}

export function deriveContentReviewStatus(
  input: ReviewStatusInput
): ReviewStatusResult {
  if (input.blocked) {
    return {
      status: "blocked",
      remainingReviewers: input.requiredReviewers,
      blockers: ["Structural or public-safety validation failed."],
    }
  }

  if (
    input.explicitDecisionRequired ||
    input.reviewerRequirement === "unresolved"
  ) {
    return {
      status: "decision-required",
      remainingReviewers: input.requiredReviewers,
      blockers: ["A content, reviewer, or evidence decision is required."],
    }
  }

  if (
    input.records.some(
      (record) => record.reviewedSnapshot !== input.currentSnapshot
    )
  ) {
    return {
      status: "reconfirmation-required",
      remainingReviewers: input.requiredReviewers,
      blockers: ["The recorded review does not match the current snapshot."],
    }
  }

  if (input.records.length === 0) {
    return {
      status: "unreviewed",
      remainingReviewers: input.requiredReviewers,
      blockers: [],
    }
  }

  const currentReviewerRoles = new Set(
    input.records
      .filter((record) => record.reviewedSnapshot === input.currentSnapshot)
      .map((record) => record.reviewerRole)
  )
  const remainingReviewers = input.requiredReviewers.filter(
    (reviewer) => !currentReviewerRoles.has(reviewer)
  )

  return remainingReviewers.length > 0
    ? {
        status: "partially-reviewed",
        remainingReviewers,
        blockers: [],
      }
    : {
        status: "reviewed-current",
        remainingReviewers: [],
        blockers: [],
      }
}

function hasValidRecords(
  manifest: ReadonlyArray<ContentReviewManifestEntry>
): boolean {
  return manifest.every((item) => {
    const reviewerRoles = item.records.map((record) => record.reviewerRole)
    if (new Set(reviewerRoles).size !== reviewerRoles.length) return false
    if (item.reviewerRequirement === "unresolved") {
      return item.records.length === 0
    }
    if (
      item.records.some(
        (record) =>
          !normaliseSnapshotString(record.reviewerRole) ||
          !normaliseSnapshotString(record.reviewedSnapshot) ||
          !normaliseSnapshotString(record.evidenceReference)
      )
    ) {
      return false
    }
    return item.records.every((record) =>
      item.requiredReviewers.includes(record.reviewerRole)
    )
  })
}

function reviewContext(
  item: ContentReviewManifestEntry,
  currentSnapshot: string,
  explicitDecisionRequired: boolean
): ContentReviewContextDto {
  const state = deriveContentReviewStatus({
    currentSnapshot,
    blocked: false,
    explicitDecisionRequired,
    reviewerRequirement: item.reviewerRequirement,
    requiredReviewers: item.requiredReviewers,
    records: item.records,
  })

  return {
    reviewReference: item.reviewReference,
    status: state.status,
    owner: item.owner,
    requiredReviewers: item.requiredReviewers,
    remainingReviewers: state.remainingReviewers,
    concerns: item.concerns,
    sourceLabel: item.sourceLabel,
    snapshot: currentSnapshot,
    blockers: state.blockers,
  }
}

function annotateEntry(
  entry: ReviewDraftEntryDto,
  manifestByReference: ReadonlyMap<ReviewReference, ContentReviewManifestEntry>,
  snapshots: ReviewDraftSnapshots
): ContentReviewEntryDto {
  const item = manifestByReference.get(entry.reviewReference)
  if (!item) throw new Error("Validated review entry is missing its manifest")

  return {
    ...entry,
    review: reviewContext(
      item,
      snapshots.byReference[entry.reviewReference],
      entry.kind === "decision"
    ),
  }
}

function humaniseField(value: string): string {
  const normalised = value.replaceAll("-", " ")
  return `${normalised.charAt(0).toUpperCase()}${normalised.slice(1)}`
}

function buildAppendix(
  sections: ReadonlyArray<ContentReviewSectionDto>
): ContentReviewAppendixDto {
  const approvedCoverage = new Set<string>(
    landingPageV2Content.testimonials
      .filter((testimonial) => testimonial.publicationApproved)
      .flatMap((testimonial) => testimonial.capabilityIds)
  )
  const missingCapabilityLabels =
    landingPageV2Publication.testimonialCoverageRequired
      .filter((capabilityId) => !approvedCoverage.has(capabilityId))
      .map(
        (capabilityId) =>
          landingPageV2Content.capabilities.find(
            (capability) => capability.id === capabilityId
          )?.publicLabel ?? "Required capability"
      )
  const unresolvedClaims = sections
    .flatMap((section) => section.entries)
    .filter(
      (entry) =>
        entry.kind === "content" &&
        entry.contentKind === "claim" &&
        entry.review.status !== "reviewed-current"
    ).length

  return {
    syntheticData: {
      rule: "Only synthetic data may appear in the story or product explorer.",
      prohibitedData:
        landingPageV2MeasurementPlan.payloadPolicy.prohibitedFields.map(
          humaniseField
        ),
    },
    claims: {
      summary:
        "Product claims remain proposed until the accountable reviewer considers the exact snapshot.",
      unresolvedCount: unresolvedClaims,
    },
    proof: {
      summary:
        "No testimonial copy or attribution is shown until publication permission and required capability coverage are confirmed.",
      missingCapabilityLabels,
    },
    access: {
      label: landingPageV2Publication.primaryCta.label ?? "Sign-in decision",
      accountNote:
        landingPageV2Publication.primaryCta.accessNote ??
        "Account access note required.",
      implementationBoundary:
        "Authentication and completed product access remain on the product/auth surface.",
    },
    support: {
      summary: landingPageV2Publication.support.strategy
        ? "A support strategy is selected but remains subject to its access and destination review."
        : "A public support strategy, destination, owner, and access explanation are still required.",
    },
    measurement: {
      providerStrategy: "Provider-neutral",
      engagementOwner: "Marketing surface",
      conversionProxyOwner: "Marketing surface",
      trueConversionOwner: "Product/auth surface",
      unresolvedDecisions: [
        "Cross-domain correlation",
        "Consent",
        "Retention",
        "Event delivery",
      ],
      allowedFields:
        landingPageV2MeasurementPlan.payloadPolicy.allowlistedFields.map(
          humaniseField
        ),
      prohibitedFields:
        landingPageV2MeasurementPlan.payloadPolicy.prohibitedFields.map(
          humaniseField
        ),
    },
  }
}

function artifactContext(
  reviewReference: ReviewReference,
  snapshot: string,
  concerns: ReadonlyArray<string>
): ContentReviewContextDto {
  const artifactManifest: ContentReviewManifestEntry = {
    contentId: reviewReference,
    reviewReference,
    contentKind: "structure",
    owner: "Designer and Xingyu (PM)",
    reviewerRequirement: "confirmed",
    requiredReviewers: ["Designer", "Xingyu (PM)"],
    concerns,
    sourceLabel: "Content-review structure",
    linkDisplay: "label-only",
    records: [],
  }
  return reviewContext(artifactManifest, snapshot, false)
}

function errorDto(issueCodes: ReadonlyArray<string>): ContentReviewPageDto {
  return {
    kind: "error",
    code: "CONTENT_REVIEW_INVALID",
    buildSnapshot: createReviewSnapshot({ code: "CONTENT_REVIEW_INVALID", issueCodes }),
    feedback: {
      label: landingPageV2Content.footer.feedbackLabel,
      href: landingPageV2Content.footer.feedbackHref,
      note: null,
      purpose: "feedback",
    },
  }
}

export function buildContentReviewPageDto(
  options: ReviewBuildOptions = {}
): ContentReviewPageDto {
  const content = options.content ?? landingPageV2Content
  const publication = options.publication ?? landingPageV2Publication
  const registry =
    options.registry ?? createContentReviewRegistry(content, publication)
  const manifest = options.manifest ?? contentReviewManifest
  const result = buildReviewDraftProjection({
    content,
    publication,
    registry,
    manifest,
  })

  if (!result.ok) return errorDto(result.issues.map((issue) => issue.code))
  if (!hasValidRecords(manifest)) return errorDto(["invalid-review-record"])

  const snapshots = getReviewDraftSnapshots(result.projection, manifest)
  const manifestByReference = new Map(
    manifest.map((item) => [item.reviewReference, item])
  )
  const metadataManifest = manifestByReference.get(
    result.projection.metadata.reviewReference
  )
  if (!metadataManifest) return errorDto(["metadata-manifest-missing"])

  const sections: Array<ContentReviewSectionDto> = []
  for (const section of result.projection.sections) {
    const sectionManifest = manifestByReference.get(section.reviewReference)
    if (!sectionManifest) return errorDto(["section-manifest-missing"])
    sections.push({
      kind: section.kind,
      review: reviewContext(
        sectionManifest,
        snapshots.byReference[section.reviewReference],
        false
      ),
      entries: section.entries.map((entry) =>
        annotateEntry(entry, manifestByReference, snapshots)
      ),
    })
  }

  const dto: ContentReviewReadyPageDto = {
    kind: "ready",
    artifactLabel: "Internal content review — not approved for publication",
    warning:
      "This unauthenticated review artifact contains draft public-safe copy. It is not an access control or publication approval.",
    itemSnapshot: snapshots.itemSnapshot,
    iaOrderSnapshot: snapshots.iaOrderSnapshot,
    storySnapshot: snapshots.storySnapshot,
    artifactReview: {
      iaOrder: artifactContext("TW-IA-ORDER", snapshots.iaOrderSnapshot, [
        "Information architecture",
      ]),
      composedStory: artifactContext(
        "TW-STORY-COMPOSED",
        snapshots.storySnapshot,
        ["Content", "Narrative coherence"]
      ),
    },
    metadata: {
      ...result.projection.metadata,
      review: reviewContext(
        metadataManifest,
        snapshots.byReference[result.projection.metadata.reviewReference],
        false
      ),
    },
    sections,
    appendix: buildAppendix(sections),
  }

  return dto
}
