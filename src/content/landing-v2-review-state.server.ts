import "@tanstack/react-start/server-only"

import { createHash } from "node:crypto"

import { itemProse, landingDocuments } from "./landing-copy"
import {
  buildReviewDraftProjection,
  contentReviewArtifactManifest,
  contentReviewArtifactReferences,
  createContentReviewManifest,
  createContentReviewRegistry,
  isContentReviewReviewerRole,
} from "./landing-v2-review.server"
import {
  landingPageV2Content,
  landingPageV2MeasurementPlan,
  landingPageV2Publication,
} from "./landing-v2"
import { getLandingPageV2Readiness } from "./landing-v2-readiness"

import type {
  LandingPageV2Content,
  LandingPageV2Publication,
} from "./landing-v2"
import type {
  ContentReviewArtifactManifestEntry,
  ContentReviewArtifactRecords,
  ContentReviewManifestEntry,
  ContentReviewRecord,
  ContentReviewReviewerRole,
  ReviewBuildOptions,
} from "./landing-v2-review.server"
import type { LandingPageV2ReadinessIssue } from "./landing-v2-readiness"
import type {
  ContentReviewAnnotatedPageDto,
  ContentReviewAnnotatedReadyPageDto,
  ContentReviewAppendixDto,
  ContentReviewContextDto,
  ContentReviewEntryDto,
  ContentReviewErrorPageDto,
  ContentReviewPageDto,
  ContentReviewSectionDto,
  ContentReviewStatus,
  ContentReviewWireframeEntryDto,
  ReviewDraftEntryDto,
  ReviewDraftProjectionDto,
  ReviewReference,
} from "./landing-v2-review.types"

const snapshotVersion = "v2"

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
  readonly requiredReviewers: ReadonlyArray<ContentReviewReviewerRole>
  readonly records: ReadonlyArray<ContentReviewRecord>
}

export type ReviewStatusResult = {
  readonly status: ContentReviewStatus
  readonly remainingReviewers: ReadonlyArray<ContentReviewReviewerRole>
  readonly blockers: ReadonlyArray<string>
}

export type ReviewDraftSnapshots = {
  readonly byReference: Readonly<Record<ReviewReference, string>>
  readonly itemSnapshot: string
  readonly iaOrderSnapshot: string
  readonly storySnapshot: string
}

export type ContentReviewStateBuildOptions = ReviewBuildOptions & {
  readonly artifactManifest?: ReadonlyArray<ContentReviewArtifactManifestEntry>
  readonly artifactRecords?: ContentReviewArtifactRecords
}

export type ContentReviewReadinessState = ReviewStatusResult & {
  readonly reviewReference: ReviewReference
}

export type ContentReviewReadinessIssue = LandingPageV2ReadinessIssue & {
  readonly source: "review-structure" | "review-state"
  readonly reviewReference: ReviewReference | null
  readonly reviewStatus: ContentReviewStatus | null
}

function normaliseSnapshotString(value: string): string {
  return value.normalize("NFKC").replace(/\r\n?/g, "\n").trim()
}

function normaliseSnapshotValue(value: unknown): SnapshotValue {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
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
  const digest = createHash("sha256")
    .update(canonical)
    .digest("hex")
    .slice(0, 16)
  return `${snapshotVersion}-sha256-${digest}`
}

function entrySnapshotPayload(entry: ReviewDraftEntryDto): SnapshotValue {
  if (entry.kind === "decision") {
    return { kind: "omission", reviewLabel: entry.reviewLabel }
  }

  return {
    kind: "content",
    contentKind: entry.contentKind,
    capabilityLabel: entry.capabilityLabel ?? null,
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
  }
}

export function getReviewDraftSnapshots(
  projection: ReviewDraftProjectionDto,
  manifest: ReadonlyArray<ContentReviewManifestEntry> = createContentReviewManifest()
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
  const contentIdFor = (reviewReference: ReviewReference): string => {
    const contentId = manifestByReference.get(reviewReference)?.contentId
    if (!contentId) {
      throw new Error("A projected review reference is missing its content ID")
    }
    return contentId
  }
  const orderedContentIds = [
    contentIdFor(projection.metadata.reviewReference),
    ...projection.sections.flatMap((section) => [
      contentIdFor(section.reviewReference),
      ...section.entries.map((entry) => contentIdFor(entry.reviewReference)),
    ]),
  ]
  const storyPayload = {
    metadata: entrySnapshotPayload(projection.metadata),
    sections: projection.sections.map((section) => ({
      section: sectionSnapshotPayload(section),
      entries: section.entries.map(entrySnapshotPayload),
    })),
  }

  return {
    byReference,
    itemSnapshot: createReviewSnapshot(byReference),
    iaOrderSnapshot: createReviewSnapshot(orderedContentIds),
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

  const currentReviewerRoles = new Set(
    input.records
      .filter((record) => record.reviewedSnapshot === input.currentSnapshot)
      .map((record) => record.reviewerRole)
  )
  const remainingReviewers = input.requiredReviewers.filter(
    (reviewer) => !currentReviewerRoles.has(reviewer)
  )

  if (
    input.records.some(
      (record) => record.reviewedSnapshot !== input.currentSnapshot
    )
  ) {
    return {
      status: "reconfirmation-required",
      remainingReviewers,
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
      return item.requiredReviewers.length === 0 && item.records.length === 0
    }
    if (
      item.requiredReviewers.length === 0 ||
      new Set(item.requiredReviewers).size !== item.requiredReviewers.length ||
      item.requiredReviewers.some(
        (reviewerRole) => !isContentReviewReviewerRole(reviewerRole)
      )
    ) {
      return false
    }
    if (
      item.records.some(
        (record) =>
          !isContentReviewReviewerRole(record.reviewerRole) ||
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

function resolveArtifactManifest(
  options: ContentReviewStateBuildOptions
): ReadonlyArray<ContentReviewArtifactManifestEntry> {
  const manifest = options.artifactManifest ?? contentReviewArtifactManifest
  return manifest.map((item) => ({
    ...item,
    records: options.artifactRecords?.[item.reviewReference] ?? item.records,
  }))
}

function hasValidArtifactManifest(
  itemManifest: ReadonlyArray<ContentReviewManifestEntry>,
  artifactManifest: ReadonlyArray<ContentReviewArtifactManifestEntry>,
  artifactRecords: ContentReviewArtifactRecords | undefined
): boolean {
  const expectedContentIds = new Map([
    ["TW-IA-ORDER", "artifact.ia-order"],
    ["TW-STORY-COMPOSED", "artifact.composed-story"],
  ] as const)
  const artifactReferences = artifactManifest.map(
    (item) => item.reviewReference
  )
  const recordReferences = Object.keys(artifactRecords ?? {})

  return (
    artifactManifest.length === contentReviewArtifactReferences.length &&
    new Set(artifactReferences).size === artifactReferences.length &&
    contentReviewArtifactReferences.every((reviewReference) =>
      artifactReferences.includes(reviewReference)
    ) &&
    artifactManifest.every(
      (item) =>
        item.contentId === expectedContentIds.get(item.reviewReference) &&
        item.contentKind === "structure" &&
        item.reviewerRequirement === "confirmed" &&
        item.linkDisplay === "label-only"
    ) &&
    recordReferences.every((reviewReference) =>
      contentReviewArtifactReferences.includes(
        reviewReference as (typeof contentReviewArtifactReferences)[number]
      )
    ) &&
    itemManifest.every(
      (item) =>
        !contentReviewArtifactReferences.includes(
          item.reviewReference as (typeof contentReviewArtifactReferences)[number]
        )
    ) &&
    hasValidRecords(artifactManifest)
  )
}

function reviewReadinessIssue(
  code: string,
  severity: ContentReviewReadinessIssue["severity"],
  message: string,
  source: ContentReviewReadinessIssue["source"],
  reviewReference: ReviewReference | null = null,
  reviewStatus: ContentReviewStatus | null = null
): ContentReviewReadinessIssue {
  return {
    code,
    severity,
    message,
    source,
    reviewReference,
    reviewStatus,
  }
}

function reviewState(
  item: ContentReviewManifestEntry,
  currentSnapshot: string,
  explicitDecisionRequired: boolean
): ContentReviewReadinessState {
  return {
    reviewReference: item.reviewReference,
    ...deriveContentReviewStatus({
      currentSnapshot,
      blocked: false,
      explicitDecisionRequired,
      reviewerRequirement: item.reviewerRequirement,
      requiredReviewers: item.requiredReviewers,
      records: item.records,
    }),
  }
}

export type LandingPageV2CombinedReadiness = {
  readonly landing: ReturnType<typeof getLandingPageV2Readiness>
  readonly review: {
    readonly errors: ReadonlyArray<ContentReviewReadinessIssue>
    readonly decisions: ReadonlyArray<ContentReviewReadinessIssue>
    readonly states: ReadonlyArray<ContentReviewReadinessState>
    readonly projection: ReviewDraftProjectionDto | null
    readonly snapshots: ReviewDraftSnapshots | null
  }
  readonly issues: ReadonlyArray<
    LandingPageV2ReadinessIssue | ContentReviewReadinessIssue
  >
}

export function getLandingPageV2CombinedReadiness(
  options: ContentReviewStateBuildOptions = {}
): LandingPageV2CombinedReadiness {
  const content = options.content ?? landingPageV2Content
  const publication = options.publication ?? landingPageV2Publication
  const registry =
    options.registry ?? createContentReviewRegistry(content, publication)
  const manifest = options.manifest ?? createContentReviewManifest(content)
  const artifacts = resolveArtifactManifest(options)
  const landing = getLandingPageV2Readiness(content, publication)
  const projectionResult = buildReviewDraftProjection({
    content,
    publication,
    registry,
    manifest,
  })
  const errors: Array<ContentReviewReadinessIssue> = projectionResult.ok
    ? []
    : projectionResult.issues.map((item) =>
        reviewReadinessIssue(
          item.code,
          "error",
          item.message,
          "review-structure"
        )
      )

  if (!hasValidRecords(manifest)) {
    errors.push(
      reviewReadinessIssue(
        "invalid-review-record",
        "error",
        "Review records and confirmed reviewer roles must match the closed review manifest.",
        "review-state"
      )
    )
  }
  if (!hasValidArtifactManifest(manifest, artifacts, options.artifactRecords)) {
    errors.push(
      reviewReadinessIssue(
        "invalid-artifact-review",
        "error",
        "Aggregate review artifacts and their records must match the IA-order and composed-story manifests.",
        "review-state"
      )
    )
  }

  if (!projectionResult.ok || errors.length > 0) {
    return {
      landing,
      review: {
        errors,
        decisions: [],
        states: [],
        projection: null,
        snapshots: null,
      },
      issues: [...landing.issues, ...errors],
    }
  }

  const projection = projectionResult.projection
  const snapshots = getReviewDraftSnapshots(projection, manifest)
  const manifestByReference = new Map(
    manifest.map((item) => [item.reviewReference, item])
  )
  const stateInputs = [
    {
      reviewReference: projection.metadata.reviewReference,
      snapshot: snapshots.byReference[projection.metadata.reviewReference],
      explicitDecisionRequired: false,
    },
    ...projection.sections.flatMap((section) => [
      {
        reviewReference: section.reviewReference,
        snapshot: snapshots.byReference[section.reviewReference],
        explicitDecisionRequired: false,
      },
      ...section.entries.map((entry) => ({
        reviewReference: entry.reviewReference,
        snapshot: snapshots.byReference[entry.reviewReference],
        explicitDecisionRequired: entry.kind === "decision",
      })),
    ]),
  ]
  const states = stateInputs.map((input) => {
    const item = manifestByReference.get(input.reviewReference)
    if (!item) {
      throw new Error("Validated projection is missing its review manifest")
    }
    return reviewState(item, input.snapshot, input.explicitDecisionRequired)
  })
  const artifactSnapshots = new Map([
    ["TW-IA-ORDER", snapshots.iaOrderSnapshot],
    ["TW-STORY-COMPOSED", snapshots.storySnapshot],
  ] as const)
  for (const artifact of artifacts) {
    states.push(
      reviewState(
        artifact,
        artifactSnapshots.get(artifact.reviewReference) ?? "",
        false
      )
    )
  }

  const stateIssues = states
    .filter((state) => state.status !== "reviewed-current")
    .map((state) =>
      reviewReadinessIssue(
        `review-${state.status}-${state.reviewReference.toLowerCase()}`,
        state.status === "blocked" ? "error" : "decision",
        `Review ${state.reviewReference} is ${state.status}.`,
        "review-state",
        state.reviewReference,
        state.status
      )
    )
  const stateErrors = stateIssues.filter((item) => item.severity === "error")
  const decisions = stateIssues.filter((item) => item.severity === "decision")
  errors.push(...stateErrors)

  return {
    landing,
    review: {
      errors,
      decisions,
      states,
      projection,
      snapshots,
    },
    issues: [...landing.issues, ...errors, ...decisions],
  }
}

function reviewContext(
  item: ContentReviewManifestEntry,
  currentSnapshot: string,
  explicitDecisionRequired: boolean,
  resolvedState?: ReviewStatusResult
): ContentReviewContextDto {
  const state =
    resolvedState ??
    deriveContentReviewStatus({
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
    owner: publicOwnerLabel(item.owner),
    requiredReviewers: item.requiredReviewers.map(publicReviewerRole),
    remainingReviewers: state.remainingReviewers.map(publicReviewerRole),
    concerns: item.concerns,
    sourceLabel: item.sourceLabel,
    snapshot: currentSnapshot,
    blockers: state.blockers,
  }
}

const publicReviewerRoles = new Map<string, string>([
  ["Designer", "Designer"],
  ["Xingyu (PM)", "Product manager"],
])

function publicReviewerRole(role: string): string {
  return publicReviewerRoles.get(role) ?? "Reviewer role to be confirmed"
}

function publicOwnerLabel(owner: string): string {
  if (owner === "Not assigned") return owner

  const roles = owner.split(" and ").map(publicReviewerRole)
  return roles.includes("Reviewer role to be confirmed")
    ? "Review owner role to be confirmed"
    : roles.join(" and ")
}

function annotateEntry(
  entry: ReviewDraftEntryDto,
  manifestByReference: ReadonlyMap<ReviewReference, ContentReviewManifestEntry>,
  snapshots: ReviewDraftSnapshots,
  statesByReference: ReadonlyMap<ReviewReference, ContentReviewReadinessState>
): ContentReviewEntryDto {
  const item = manifestByReference.get(entry.reviewReference)
  if (!item) throw new Error("Validated review entry is missing its manifest")

  return {
    ...entry,
    review: reviewContext(
      item,
      snapshots.byReference[entry.reviewReference],
      entry.kind === "decision",
      statesByReference.get(entry.reviewReference)
    ),
  }
}

function humaniseField(value: string): string {
  const normalised = value.replaceAll("-", " ")
  return `${normalised.charAt(0).toUpperCase()}${normalised.slice(1)}`
}

function buildAppendix(
  sections: ReadonlyArray<ContentReviewSectionDto>,
  content: LandingPageV2Content,
  publication: LandingPageV2Publication
): ContentReviewAppendixDto {
  const approvedCoverage = new Set<string>(
    content.testimonials
      .filter((testimonial) => testimonial.publicationApproved)
      .flatMap((testimonial) => testimonial.capabilityIds)
  )
  const missingCapabilityLabels = publication.testimonialCoverageRequired
    .filter((capabilityId) => !approvedCoverage.has(capabilityId))
    .map(
      (capabilityId) =>
        content.capabilities.find(
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
      label: publication.primaryCta.label ?? "Sign-in decision",
      accountNote:
        publication.primaryCta.accessNote ?? "Account access note required.",
      implementationBoundary: itemProse(
        landingDocuments.accessSupport,
        "implementation-boundary"
      ),
    },
    support: {
      summary: itemProse(
        landingDocuments.accessSupport,
        publication.support.strategy ? "support-selected" : "support-required"
      ),
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
  artifact: ContentReviewArtifactManifestEntry,
  snapshot: string,
  state: ContentReviewReadinessState | undefined
): ContentReviewContextDto {
  return reviewContext(artifact, snapshot, false, state)
}

function errorDto(): ContentReviewErrorPageDto {
  return { kind: "error" }
}

export function buildContentReviewAnnotatedPageDto(
  options: ContentReviewStateBuildOptions = {}
): ContentReviewAnnotatedPageDto {
  const content = options.content ?? landingPageV2Content
  const publication = options.publication ?? landingPageV2Publication
  const manifest = options.manifest ?? createContentReviewManifest(content)
  const readiness = getLandingPageV2CombinedReadiness(options)
  const landingStructureErrors = readiness.landing.issues.filter(
    (item) => item.severity === "error"
  )
  if (
    landingStructureErrors.length > 0 ||
    readiness.review.errors.length > 0 ||
    !readiness.review.projection ||
    !readiness.review.snapshots
  ) {
    return errorDto()
  }

  const projection = readiness.review.projection
  const snapshots = readiness.review.snapshots
  const manifestByReference = new Map(
    manifest.map((item) => [item.reviewReference, item])
  )
  const statesByReference = new Map(
    readiness.review.states.map((state) => [state.reviewReference, state])
  )
  const metadataManifest = manifestByReference.get(
    projection.metadata.reviewReference
  )
  if (!metadataManifest) return errorDto()

  const sections: Array<ContentReviewSectionDto> = []
  for (const section of projection.sections) {
    const sectionManifest = manifestByReference.get(section.reviewReference)
    if (!sectionManifest) return errorDto()
    sections.push({
      kind: section.kind,
      review: reviewContext(
        sectionManifest,
        snapshots.byReference[section.reviewReference],
        false,
        statesByReference.get(section.reviewReference)
      ),
      entries: section.entries.map((entry) =>
        annotateEntry(entry, manifestByReference, snapshots, statesByReference)
      ),
    })
  }

  const artifactByReference = new Map(
    resolveArtifactManifest(options).map((item) => [item.reviewReference, item])
  )
  const iaOrderArtifact = artifactByReference.get("TW-IA-ORDER")
  const composedStoryArtifact = artifactByReference.get("TW-STORY-COMPOSED")
  if (!iaOrderArtifact || !composedStoryArtifact) {
    return errorDto()
  }

  const dto: ContentReviewAnnotatedReadyPageDto = {
    kind: "ready",
    artifactLabel: "Internal content review — not approved for publication",
    warning: itemProse(landingDocuments.wireframe, "warning"),
    itemSnapshot: snapshots.itemSnapshot,
    iaOrderSnapshot: snapshots.iaOrderSnapshot,
    storySnapshot: snapshots.storySnapshot,
    artifactReview: {
      iaOrder: artifactContext(
        iaOrderArtifact,
        snapshots.iaOrderSnapshot,
        statesByReference.get("TW-IA-ORDER")
      ),
      composedStory: artifactContext(
        composedStoryArtifact,
        snapshots.storySnapshot,
        statesByReference.get("TW-STORY-COMPOSED")
      ),
    },
    metadata: {
      ...projection.metadata,
      review: reviewContext(
        metadataManifest,
        snapshots.byReference[projection.metadata.reviewReference],
        false,
        statesByReference.get(projection.metadata.reviewReference)
      ),
    },
    sections,
    appendix: buildAppendix(sections, content, publication),
  }

  return dto
}

function buildWireframeEntry(
  entry: ContentReviewEntryDto
): ContentReviewWireframeEntryDto {
  if (entry.kind === "decision") {
    return {
      kind: "decision",
      reviewLabel: entry.reviewLabel,
    }
  }

  return {
    kind: "content",
    capabilityLabel: entry.capabilityLabel,
    label: entry.label,
    heading: entry.heading,
    body: entry.body,
    action: entry.link
      ? {
          label: entry.link.label,
          note: entry.link.note,
          purpose: entry.link.purpose,
        }
      : null,
  }
}

export function buildContentReviewPageDto(
  options: ContentReviewStateBuildOptions = {}
): ContentReviewPageDto {
  const review = buildContentReviewAnnotatedPageDto(options)
  if (review.kind === "error") return review

  return {
    kind: "ready",
    artifactLabel: landingDocuments.wireframe.text("artifactLabel"),
    warning: review.warning,
    metadata: {
      heading: review.metadata.heading ?? "Teacher Workspace",
      body: review.metadata.body,
      status: review.metadata.review.status,
    },
    sections: review.sections.map((section) => ({
      kind: section.kind,
      entries: section.entries.map(buildWireframeEntry),
    })),
    appendix: {
      ...review.appendix,
      syntheticData: {
        rule: review.appendix.syntheticData.rule,
      },
    },
  }
}
