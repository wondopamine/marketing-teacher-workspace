import "@tanstack/react-start/server-only"

import { landingDocuments } from "./landing-copy"
import {
  buildReviewDraftProjection,
  contentReviewSectionOrder,
  createContentReviewManifest,
  createContentReviewRegistry,
} from "./landing-v2-review.server"
import { landingPageV2Content, landingPageV2Publication } from "./landing-v2"
import { getLandingPageV2StructureIssues } from "./landing-v2-readiness"
import {
  isCanonicalTeacherPreviewDocumentDto,
  isTeacherPreviewScreenDto,
} from "./teacher-preview-document"
import {
  teacherPreviewScreenCatalog,
  teacherPreviewScreenIds,
} from "./teacher-preview-screen-catalog.server"

import type {
  ContentReviewManifestEntry,
  ContentReviewRegistryEntry,
  ReviewBuildOptions,
} from "./landing-v2-review.server"
import type {
  ReviewDraftContentEntryDto,
  ReviewDraftEntryDto,
  ReviewDraftProjectionDto,
  ReviewReference,
} from "./landing-v2-review.types"
import type {
  TeacherPreviewActionDto,
  TeacherPreviewDocumentDto,
  TeacherPreviewPageDataDto,
  TeacherPreviewScreenDto,
} from "./teacher-preview-document"
import type {
  TeacherPreviewScreenId,
  TeacherPreviewScreenRecord,
} from "./teacher-preview-screen-catalog.server"

export type TeacherPreviewDocumentBuildOptions = ReviewBuildOptions & {
  readonly screens?: ReadonlyArray<TeacherPreviewScreenRecord>
}

type ProjectionIndex = {
  readonly entriesByContentId: ReadonlyMap<string, ReviewDraftEntryDto>
}

const storyBindings = [
  {
    contentId: "journey.promise",
    screenId: "story-promise",
  },
  {
    contentId: "journey.notice",
    screenId: "story-notice",
  },
  {
    contentId: "journey.next-steps",
    screenId: "story-next-steps",
  },
  {
    contentId: "journey.words",
    screenId: "story-words",
  },
  {
    contentId: "journey.family-and-record",
    screenId: "story-family-and-record",
  },
] as const satisfies ReadonlyArray<{
  readonly contentId: string
  readonly screenId: TeacherPreviewScreenId
}>

const capabilityContentIds = [
  "capability.student-insights",
  "capability.contextual-intelligence",
  "capability.hey-talia",
  "capability.posts",
] as const

function errorPage(): TeacherPreviewPageDataDto {
  return { kind: "error" }
}

function isNonBlank(value: string | null): value is string {
  return (
    typeof value === "string" && value.replace(/\p{Cf}/gu, "").trim().length > 0
  )
}

function hasUniqueValues(values: ReadonlyArray<string>): boolean {
  return new Set(values).size === values.length
}

function hasSameValues(
  actual: ReadonlyArray<string>,
  expected: ReadonlyArray<string>
): boolean {
  if (actual.length !== expected.length) return false
  const actualSet = new Set(actual)
  return (
    actualSet.size === actual.length &&
    expected.every((value) => actualSet.has(value))
  )
}

function hasCanonicalRegistrySectionOrder(
  registry: ReadonlyArray<ContentReviewRegistryEntry>
): boolean {
  const registryOrder = registry
    .filter((entry) => entry.role === "section")
    .map((entry) => entry.sectionKind)

  return (
    registryOrder.length === contentReviewSectionOrder.length &&
    contentReviewSectionOrder.every(
      (kind, index) => registryOrder[index] === kind
    )
  )
}

function hasCanonicalProjectionSectionOrder(
  projection: ReviewDraftProjectionDto
): boolean {
  const projectionOrder = projection.sections.map((section) => section.kind)
  return (
    projectionOrder.length === contentReviewSectionOrder.length &&
    contentReviewSectionOrder.every(
      (kind, index) => projectionOrder[index] === kind
    )
  )
}

function orderRegistryByContentId(
  registry: ReadonlyArray<ContentReviewRegistryEntry>,
  orderedContentIds: ReadonlyArray<string>
): ReadonlyArray<ContentReviewRegistryEntry> | null {
  const registryById = new Map(
    registry.map((entry) => [entry.contentId, entry])
  )
  const ordered: Array<ContentReviewRegistryEntry> = []
  for (const contentId of orderedContentIds) {
    const entry = registryById.get(contentId)
    if (!entry) return null
    ordered.push(entry)
  }
  return ordered
}

function createProjectionIndex(
  projection: ReviewDraftProjectionDto,
  manifest: ReadonlyArray<ContentReviewManifestEntry>
): ProjectionIndex | null {
  const references = manifest.map((entry) => entry.reviewReference)
  if (!hasUniqueValues(references)) return null

  const contentIdByReference = new Map<ReviewReference, string>(
    manifest.map((entry) => [entry.reviewReference, entry.contentId])
  )
  const projectedContentIds = new Set<string>()
  const entriesByContentId = new Map<string, ReviewDraftEntryDto>()

  const recordReference = (reviewReference: ReviewReference): string | null => {
    const contentId = contentIdByReference.get(reviewReference)
    if (!contentId || projectedContentIds.has(contentId)) return null
    projectedContentIds.add(contentId)
    return contentId
  }

  if (!recordReference(projection.metadata.reviewReference)) return null

  for (const section of projection.sections) {
    const sectionContentId = recordReference(section.reviewReference)
    if (sectionContentId !== `section.${section.kind}`) return null

    for (const entry of section.entries) {
      const contentId = recordReference(entry.reviewReference)
      if (!contentId) return null
      entriesByContentId.set(contentId, entry)
    }
  }

  if (
    projectedContentIds.size !== manifest.length ||
    manifest.some((entry) => !projectedContentIds.has(entry.contentId))
  ) {
    return null
  }

  return { entriesByContentId }
}

function projectedContent(
  index: ProjectionIndex,
  contentId: string
): ReviewDraftContentEntryDto | null {
  const entry = index.entriesByContentId.get(contentId)
  return entry?.kind === "content" ? entry : null
}

function actionFrom(
  entry: ReviewDraftContentEntryDto | null
): TeacherPreviewActionDto | null {
  if (!entry?.link) return null
  return {
    label: entry.link.label,
    note: entry.link.note,
  }
}

function collectTextValues(value: unknown, values: Array<string>): void {
  if (typeof value === "string") {
    values.push(value)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectTextValues(item, values))
    return
  }
  if (!value || typeof value !== "object") return
  Object.values(value).forEach((item) => collectTextValues(item, values))
}

function normaliseSafetyValue(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/\p{Cf}/gu, "")
    .toLowerCase()
}

function registryDestinations(
  registry: ReadonlyArray<ContentReviewRegistryEntry>
): ReadonlyArray<string> {
  return registry.flatMap((entry) =>
    entry.role !== "section" &&
    entry.entry.kind === "content" &&
    entry.entry.link
      ? [entry.entry.link.href]
      : []
  )
}

function registryDecisionValues(
  registry: ReadonlyArray<ContentReviewRegistryEntry>
): ReadonlyArray<string> {
  return registry.flatMap((entry) =>
    entry.role === "entry" && entry.entry.kind === "decision"
      ? [entry.entry.reviewLabel]
      : []
  )
}

function manifestGovernanceValues(
  manifest: ReadonlyArray<ContentReviewManifestEntry>
): ReadonlyArray<string> {
  return manifest.flatMap((entry) => [
    entry.owner,
    entry.sourceLabel,
    ...entry.requiredReviewers,
    ...entry.records.flatMap((record) => [
      record.reviewerRole,
      record.reviewedSnapshot,
      record.evidenceReference,
    ]),
  ])
}

function hasSafePublicValues(
  document: TeacherPreviewDocumentDto,
  registry: ReadonlyArray<ContentReviewRegistryEntry>,
  manifest: ReadonlyArray<ContentReviewManifestEntry>
): boolean {
  const publicValues: Array<string> = []
  collectTextValues(document, publicValues)

  const sourceSpecificValues = [
    ...registry.map((entry) => entry.contentId),
    ...manifest.map((entry) => entry.reviewReference),
    ...registryDestinations(registry),
    ...registryDecisionValues(registry),
    ...manifestGovernanceValues(manifest),
  ]
    .map(normaliseSafetyValue)
    .filter((value) => value.length > 0)
  const prohibitedFragments = [
    "contextual-intelligence",
    "contextual intelligence",
    "hey-talia",
    "hey talia",
    "heytalia",
    "xingyu",
    "v2-sha256",
    "decision-required",
    "reconfirmation-required",
    "partially-reviewed",
    "reviewed-current",
    "question for the pm",
  ]

  return publicValues.every((value) => {
    const normalised = normaliseSafetyValue(value)
    return (
      !/(^|[^a-z0-9+.-])[a-z][a-z0-9+.-]*:(?=\S)/.test(normalised) &&
      !/\btw-[a-z0-9-]+\b/.test(normalised) &&
      !/(^|[^a-z0-9])swan([^a-z0-9]|$)/.test(normalised) &&
      !prohibitedFragments.some((fragment) => normalised.includes(fragment)) &&
      !sourceSpecificValues.some((fragment) => normalised.includes(fragment))
    )
  })
}

function createScreenIndex(
  screens: ReadonlyArray<TeacherPreviewScreenRecord>
): ReadonlyMap<TeacherPreviewScreenId, TeacherPreviewScreenDto> | null {
  const ids = screens.map((screen) => screen.id)
  const sources = screens.map((screen) => screen.src)
  if (
    !hasUniqueValues(ids) ||
    !hasUniqueValues(sources) ||
    !hasSameValues(ids, teacherPreviewScreenIds)
  ) {
    return null
  }

  const screenIndex = new Map<TeacherPreviewScreenId, TeacherPreviewScreenDto>()
  for (const { id, src, alt, breadcrumb } of screens) {
    const publicScreen = { src, alt, breadcrumb: [...breadcrumb] }
    if (!isTeacherPreviewScreenDto(publicScreen)) return null
    screenIndex.set(id, publicScreen)
  }
  return screenIndex
}

function buildDocument(
  options: TeacherPreviewDocumentBuildOptions
): TeacherPreviewDocumentDto | null {
  const content = options.content ?? landingPageV2Content
  const publication = options.publication ?? landingPageV2Publication
  const registry =
    options.registry ?? createContentReviewRegistry(content, publication)
  const manifest = options.manifest ?? createContentReviewManifest(content)
  const screens = options.screens ?? teacherPreviewScreenCatalog

  const registryIds = registry.map((entry) => entry.contentId)
  const manifestIds = manifest.map((entry) => entry.contentId)
  const expectedRegistryIds = createContentReviewRegistry(
    content,
    publication
  ).map((entry) => entry.contentId)
  if (
    getLandingPageV2StructureIssues(content).length > 0 ||
    !hasUniqueValues(registryIds) ||
    !hasUniqueValues(manifestIds) ||
    !hasSameValues(registryIds, expectedRegistryIds) ||
    !hasSameValues(manifestIds, expectedRegistryIds) ||
    !hasCanonicalRegistrySectionOrder(registry)
  ) {
    return null
  }

  // CMS and review adapters may return entry records in any order. Resolve
  // them by the established content IDs before projecting; only section order
  // is structural. The IDs are never copied into the public document.
  const orderedRegistry = orderRegistryByContentId(
    registry,
    expectedRegistryIds
  )
  if (!orderedRegistry) return null

  const result = buildReviewDraftProjection({
    content,
    publication,
    registry: orderedRegistry,
    manifest,
  })
  if (!result.ok || !hasCanonicalProjectionSectionOrder(result.projection)) {
    return null
  }

  const projectionIndex = createProjectionIndex(result.projection, manifest)
  const screenIndex = createScreenIndex(screens)
  if (!projectionIndex || !screenIndex) return null

  const promiseCopy = projectedContent(projectionIndex, "promise.hero")
  const heroAction = actionFrom(
    projectedContent(projectionIndex, "destination.cta.hero")
  )
  const heroScreen = screenIndex.get("hero")
  const revealCopy = projectedContent(projectionIndex, "reveal.copy")
  const launchLine = projectedContent(projectionIndex, "reveal.ga-launch-line")
  const closeCopy = projectedContent(projectionIndex, "close.copy")
  const closeAction = actionFrom(
    projectedContent(projectionIndex, "destination.cta.close")
  )
  const footerCopy = projectedContent(projectionIndex, "footer.copy")
  const feedback = projectedContent(projectionIndex, "destination.feedback")

  if (
    !promiseCopy ||
    !isNonBlank(promiseCopy.heading) ||
    !heroAction ||
    !isNonBlank(heroAction.note) ||
    !heroScreen ||
    !revealCopy ||
    !isNonBlank(revealCopy.heading) ||
    !closeCopy ||
    !isNonBlank(closeCopy.heading) ||
    !closeAction ||
    !footerCopy ||
    !isNonBlank(footerCopy.label)
  ) {
    return null
  }

  const storySteps = storyBindings.map(({ contentId, screenId }) => {
    const entry = projectedContent(projectionIndex, contentId)
    const screen = screenIndex.get(screenId)
    return entry && screen ? { entry, screen } : null
  })
  if (
    storySteps.some(
      (step) =>
        !step ||
        !isNonBlank(step.entry.label) ||
        !isNonBlank(step.entry.heading)
    )
  ) {
    return null
  }

  const capabilityEntries = capabilityContentIds.map((contentId) =>
    projectedContent(projectionIndex, contentId)
  )
  if (
    capabilityEntries.some(
      (entry) =>
        !entry || !isNonBlank(entry.label) || !isNonBlank(entry.heading)
    )
  ) {
    return null
  }

  const brand = footerCopy.label
  const document: TeacherPreviewDocumentDto = {
    brand,
    sections: [
      {
        kind: "promise",
        eyebrow: promiseCopy.label,
        heading: promiseCopy.heading,
        body: [...promiseCopy.body],
        action: heroAction,
        screen: heroScreen,
      },
      {
        kind: "connected-story",
        heading: landingDocuments.story.requireHeading(),
        steps: storySteps.map((step) => {
          if (!step) throw new Error("A validated story binding disappeared")
          return {
            label: step.entry.label,
            heading: step.entry.heading,
            body: [...step.entry.body],
            screen: step.screen,
          }
        }),
      },
      {
        kind: "reveal",
        heading: revealCopy.heading,
        body: [...revealCopy.body],
        asides: launchLine ? [{ body: [...launchLine.body] }] : [],
      },
      {
        kind: "capabilities",
        heading: landingDocuments.capabilities.requireHeading(),
        items: capabilityEntries.map((entry) => {
          if (!entry) {
            throw new Error("A validated capability binding disappeared")
          }
          return {
            label: entry.label,
            heading: entry.heading,
            body: [...entry.body],
          }
        }),
      },
      {
        kind: "close",
        heading: closeCopy.heading,
        body: [...closeCopy.body],
        action: closeAction,
      },
      {
        kind: "access-support",
        heading: landingDocuments.accessSupport.requireHeading(),
        accessHeading: landingDocuments.accessSupport.text("accessHeading"),
        methodLabel: landingDocuments.accessSupport.text("accessMethodLabel"),
        method: heroAction.label,
        accountNote: heroAction.note,
      },
    ],
    footer: {
      brand,
      body: [...footerCopy.body],
      feedbackLabel: feedback?.link?.label ?? null,
    },
  }

  return isCanonicalTeacherPreviewDocumentDto(document) &&
    hasSafePublicValues(document, registry, manifest)
    ? document
    : null
}

export function buildTeacherPreviewPageData(
  options: TeacherPreviewDocumentBuildOptions = {}
): TeacherPreviewPageDataDto {
  try {
    const document = buildDocument(options)
    return document ? { kind: "ready", document } : errorPage()
  } catch {
    return errorPage()
  }
}
