import "@tanstack/react-start/server-only"

import { contentReviewSectionKinds } from "./landing-v2-review.types"
import { landingDocuments } from "./landing-copy"
import {
  capabilityIds,
  landingPageV2Content,
  landingPageV2Publication,
} from "./landing-v2"

import type {
  CapabilityId,
  LandingPageV2Content,
  LandingPageV2Publication,
} from "./landing-v2"
import type {
  ContentReviewSectionKind,
  ReviewContentKind,
  ReviewDraftContentEntryDto,
  ReviewDraftDecisionEntryDto,
  ReviewDraftEntryDto,
  ReviewDraftProjectionDto,
  ReviewReference,
} from "./landing-v2-review.types"

export const contentReviewSectionOrder = contentReviewSectionKinds

type RegistrySection = {
  readonly role: "section"
  readonly contentId: string
  readonly sectionKind: ContentReviewSectionKind
  readonly contentKind: "structure"
  readonly entry: null
}

type RegistryMetadata = {
  readonly role: "metadata"
  readonly contentId: string
  readonly sectionKind: null
  readonly contentKind: "copy"
  readonly entry: ReviewDraftContentEntryInput<"copy">
}

type RegistryContentKind = Exclude<ReviewContentKind, "structure" | "omission">

type ReviewDraftContentEntryInput<TContentKind extends RegistryContentKind> =
  Omit<ReviewDraftContentEntryDto, "reviewReference" | "contentKind"> & {
    readonly contentKind: TContentKind
  }

type ReviewDraftDecisionEntryInput = Omit<
  ReviewDraftDecisionEntryDto,
  "reviewReference"
>

type RegistryContentEntry<TContentKind extends RegistryContentKind> = {
  readonly role: "entry"
  readonly contentId: string
  readonly sectionKind: ContentReviewSectionKind
  readonly contentKind: TContentKind
  readonly entry: ReviewDraftContentEntryInput<TContentKind>
}

type RegistryDecisionEntry = {
  readonly role: "entry"
  readonly contentId: string
  readonly sectionKind: ContentReviewSectionKind
  readonly contentKind: "omission"
  readonly entry: ReviewDraftDecisionEntryInput
}

type RegistryEntry =
  | {
      [ContentKind in RegistryContentKind]: RegistryContentEntry<ContentKind>
    }[RegistryContentKind]
  | RegistryDecisionEntry

export type ContentReviewRegistryEntry =
  | RegistrySection
  | RegistryMetadata
  | RegistryEntry

export const contentReviewReviewerRoles = ["Designer", "Xingyu (PM)"] as const

export type ContentReviewReviewerRole =
  (typeof contentReviewReviewerRoles)[number]

export function isContentReviewReviewerRole(
  value: unknown
): value is ContentReviewReviewerRole {
  return contentReviewReviewerRoles.some((role) => role === value)
}

export type ContentReviewRecord = {
  readonly reviewerRole: ContentReviewReviewerRole
  readonly reviewedSnapshot: string
  readonly evidenceReference: string
}

export type ContentReviewManifestEntry = {
  readonly contentId: string
  readonly reviewReference: ReviewReference
  readonly contentKind: ReviewContentKind
  readonly owner: string
  readonly reviewerRequirement: "confirmed" | "unresolved"
  readonly requiredReviewers: ReadonlyArray<ContentReviewReviewerRole>
  readonly concerns: ReadonlyArray<string>
  readonly sourceLabel: string
  readonly linkDisplay: "public-destination" | "label-only"
  readonly records: ReadonlyArray<ContentReviewRecord>
}

export type ContentReviewStructureIssue = {
  readonly code: string
  readonly message: string
}

export type ReviewBuildOptions = {
  readonly content?: LandingPageV2Content
  readonly publication?: LandingPageV2Publication
  readonly registry?: ReadonlyArray<ContentReviewRegistryEntry>
  readonly manifest?: ReadonlyArray<ContentReviewManifestEntry>
}

export const contentReviewArtifactReferences = [
  "TW-IA-ORDER",
  "TW-STORY-COMPOSED",
] as const satisfies ReadonlyArray<ReviewReference>

export type ContentReviewArtifactReference =
  (typeof contentReviewArtifactReferences)[number]

export type ContentReviewArtifactManifestEntry = Omit<
  ContentReviewManifestEntry,
  "reviewReference"
> & {
  readonly reviewReference: ContentReviewArtifactReference
}

export type ContentReviewArtifactRecords = Readonly<
  Partial<
    Record<ContentReviewArtifactReference, ReadonlyArray<ContentReviewRecord>>
  >
>

function section(
  contentId: string,
  sectionKind: ContentReviewSectionKind
): RegistrySection {
  return {
    role: "section",
    contentId,
    sectionKind,
    contentKind: "structure",
    entry: null,
  }
}

function contentEntry<TContentKind extends RegistryContentKind>(
  contentId: string,
  sectionKind: ContentReviewSectionKind,
  contentKind: TContentKind,
  entry: ReviewDraftContentEntryInput<NoInfer<TContentKind>>
): RegistryContentEntry<TContentKind> {
  return { role: "entry", contentId, sectionKind, contentKind, entry }
}

function decisionEntry(
  contentId: string,
  sectionKind: ContentReviewSectionKind,
  reviewLabel: string
): RegistryDecisionEntry {
  const entry: ReviewDraftDecisionEntryInput = {
    kind: "decision",
    contentKind: "omission",
    reviewLabel,
  }
  return {
    role: "entry",
    contentId,
    sectionKind,
    contentKind: "omission",
    entry,
  }
}

function linkEntry(
  contentId: string,
  sectionKind: ContentReviewSectionKind,
  label: string,
  href: string,
  note: string | null,
  purpose: "product" | "feedback"
): RegistryEntry {
  return contentEntry(contentId, sectionKind, "destination", {
    kind: "content",
    contentKind: "destination",
    label: purpose === "product" ? "Primary action" : "Feedback",
    heading: null,
    body: [],
    link: { label, href, note, purpose },
  })
}

const launchLineLabel = landingDocuments.reveal.text("launchLinePendingLabel")

function publicCapabilityLabel(
  content: LandingPageV2Content,
  capabilityId: CapabilityId | null
): string | null {
  if (capabilityId === null) return null
  return (
    content.capabilities.find((capability) => capability.id === capabilityId)
      ?.publicLabel ?? null
  )
}

export function createContentReviewRegistry(
  content: LandingPageV2Content = landingPageV2Content,
  publication: LandingPageV2Publication = landingPageV2Publication
): ReadonlyArray<ContentReviewRegistryEntry> {
  const primaryCta = publication.primaryCta
  const ctaLabel = primaryCta.label ?? ""
  const ctaHref = primaryCta.href ?? ""
  const ctaNote = primaryCta.accessNote

  return [
    {
      role: "metadata",
      contentId: "meta.seo",
      sectionKind: null,
      contentKind: "copy",
      entry: {
        kind: "content",
        contentKind: "copy",
        label: "Page metadata draft",
        heading: content.seoDraft.title,
        body: [content.seoDraft.description],
        link: null,
      },
    },
    section("section.promise", "promise"),
    contentEntry("promise.hero", "promise", "copy", {
      kind: "content",
      contentKind: "copy",
      label: content.hero.eyebrow,
      heading: content.hero.headline,
      body: [content.hero.body],
      link: null,
    }),
    linkEntry(
      "destination.cta.hero",
      "promise",
      ctaLabel,
      ctaHref,
      ctaNote,
      "product"
    ),
    section("section.connected-story", "connected-story"),
    ...content.journey.map((act) =>
      contentEntry(`journey.${act.id}`, "connected-story", "claim", {
        kind: "content",
        contentKind: "claim",
        capabilityLabel: publicCapabilityLabel(content, act.capabilityId),
        label: act.moment,
        heading: act.headline,
        body: [act.body],
        link: null,
      })
    ),
    section("section.reveal", "reveal"),
    contentEntry("reveal.copy", "reveal", "claim", {
      kind: "content",
      contentKind: "claim",
      label: null,
      heading: content.reveal.headline,
      body: [content.reveal.body],
      link: null,
    }),
    ...(content.reveal.gaLaunchLine
      ? [
          contentEntry("reveal.ga-launch-line", "reveal", "copy", {
            kind: "content",
            contentKind: "copy",
            label: launchLineLabel,
            heading: null,
            body: [content.reveal.gaLaunchLine],
            link: null,
          }),
        ]
      : [decisionEntry("reveal.ga-launch-line", "reveal", launchLineLabel)]),
    section("section.capabilities", "capabilities"),
    ...content.capabilities.map((capability) =>
      contentEntry(`capability.${capability.id}`, "capabilities", "claim", {
        kind: "content",
        contentKind: "claim",
        label: capability.publicLabel,
        heading: capability.job,
        body: [capability.scenario],
        link: null,
      })
    ),
    section("section.audiences", "audiences"),
    ...content.audiences.map((audience) =>
      audience.question && audience.answer
        ? contentEntry(`audience.${audience.id}`, "audiences", "copy", {
            kind: "content",
            contentKind: "copy",
            label: audience.label,
            heading: audience.question,
            body: [audience.answer],
            link: null,
          })
        : decisionEntry(
            `audience.${audience.id}`,
            "audiences",
            `${audience.label}: question and answer`
          )
    ),
    section("section.proof", "proof"),
    decisionEntry(
      "proof.testimonials",
      "proof",
      landingDocuments.proof.text("pendingLabel")
    ),
    section("section.close", "close"),
    contentEntry("close.copy", "close", "copy", {
      kind: "content",
      contentKind: "copy",
      label: null,
      heading: content.close.headline,
      body: [content.close.body],
      link: null,
    }),
    linkEntry(
      "destination.cta.close",
      "close",
      ctaLabel,
      ctaHref,
      ctaNote,
      "product"
    ),
    section("section.access-support", "access-support"),
    decisionEntry(
      "support.public-route",
      "access-support",
      landingDocuments.accessSupport.text("pendingLabel")
    ),
    section("section.footer-feedback", "footer-feedback"),
    contentEntry("footer.copy", "footer-feedback", "copy", {
      kind: "content",
      contentKind: "copy",
      label: content.footer.brand,
      heading: null,
      body: [content.footer.copyright],
      link: null,
    }),
    linkEntry(
      "destination.feedback",
      "footer-feedback",
      content.footer.feedbackLabel,
      content.footer.feedbackHref,
      null,
      "feedback"
    ),
  ]
}

function manifestEntry(
  contentId: string,
  reviewReference: ReviewReference,
  contentKind: ReviewContentKind,
  options: {
    readonly owner?: string
    readonly requiredReviewers?: ReadonlyArray<ContentReviewReviewerRole>
    readonly concerns?: ReadonlyArray<string>
    readonly sourceLabel?: string
    readonly linkDisplay?: "public-destination" | "label-only"
  } = {}
): ContentReviewManifestEntry {
  const requiredReviewers = options.requiredReviewers ?? []
  return {
    contentId,
    reviewReference,
    contentKind,
    owner: options.owner ?? "Not assigned",
    reviewerRequirement:
      requiredReviewers.length > 0 ? "confirmed" : "unresolved",
    requiredReviewers,
    concerns: options.concerns ?? ["Content"],
    sourceLabel: options.sourceLabel ?? "Landing Page V2 foundation",
    linkDisplay: options.linkDisplay ?? "label-only",
    records: [],
  }
}

function artifactManifestEntry(
  contentId: string,
  reviewReference: ContentReviewArtifactReference,
  concerns: ReadonlyArray<string>
): ContentReviewArtifactManifestEntry {
  return {
    ...manifestEntry(contentId, reviewReference, "structure", {
      owner: "Designer and Xingyu (PM)",
      requiredReviewers: contentReviewReviewerRoles,
      concerns,
      sourceLabel: "Content-review structure",
    }),
    reviewReference,
  }
}

export const contentReviewArtifactManifest = [
  artifactManifestEntry("artifact.ia-order", "TW-IA-ORDER", [
    "Information architecture",
  ]),
  artifactManifestEntry("artifact.composed-story", "TW-STORY-COMPOSED", [
    "Content",
    "Narrative coherence",
  ]),
] as const satisfies ReadonlyArray<ContentReviewArtifactManifestEntry>

const syntheticReviewers = ["Designer", "Xingyu (PM)"] as const
const productReviewer = ["Xingyu (PM)"] as const

export const contentReviewManifest = [
  manifestEntry("meta.seo", "TW-META-SEO", "copy", {
    concerns: ["Content", "Publication"],
  }),
  manifestEntry("section.promise", "TW-SECTION-PROMISE", "structure"),
  manifestEntry("promise.hero", "TW-PROMISE", "copy"),
  manifestEntry("destination.cta.hero", "TW-CTA-HERO", "destination", {
    concerns: ["Access", "Publication"],
    linkDisplay: "public-destination",
  }),
  manifestEntry(
    "section.connected-story",
    "TW-SECTION-CONNECTED-STORY",
    "structure",
    { owner: "Designer and Xingyu (PM)", requiredReviewers: syntheticReviewers }
  ),
  manifestEntry("journey.promise", "TW-STORY-SETUP", "claim", {
    owner: "Designer and Xingyu (PM)",
    requiredReviewers: syntheticReviewers,
    concerns: ["Content", "Synthetic data"],
  }),
  manifestEntry("journey.notice", "TW-STORY-INSIGHTS", "claim", {
    owner: "Designer and Xingyu (PM)",
    requiredReviewers: syntheticReviewers,
    concerns: ["Content", "Product claim", "Synthetic data"],
  }),
  manifestEntry("journey.next-steps", "TW-STORY-NEXT-STEP", "claim", {
    owner: "Designer and Xingyu (PM)",
    requiredReviewers: syntheticReviewers,
    concerns: ["Content", "Product claim", "Synthetic data"],
  }),
  manifestEntry("journey.words", "TW-STORY-MESSAGE", "claim", {
    owner: "Designer and Xingyu (PM)",
    requiredReviewers: syntheticReviewers,
    concerns: ["Content", "Product claim", "Synthetic data"],
  }),
  manifestEntry("journey.family-and-record", "TW-STORY-POSTS", "claim", {
    owner: "Designer and Xingyu (PM)",
    requiredReviewers: syntheticReviewers,
    concerns: ["Content", "Product claim", "Synthetic data"],
  }),
  manifestEntry("section.reveal", "TW-SECTION-REVEAL", "structure"),
  manifestEntry("reveal.copy", "TW-REVEAL", "claim", {
    owner: "Xingyu (PM)",
    requiredReviewers: productReviewer,
    concerns: ["Content", "Product claim"],
  }),
  manifestEntry("reveal.ga-launch-line", "TW-REVEAL-GA-LINE", "omission", {
    owner: "Xingyu (PM)",
    requiredReviewers: productReviewer,
    concerns: ["Content", "Publication"],
  }),
  manifestEntry(
    "section.capabilities",
    "TW-SECTION-CAPABILITIES",
    "structure",
    { owner: "Xingyu (PM)", requiredReviewers: productReviewer }
  ),
  manifestEntry(
    "capability.student-insights",
    "TW-CAP-STUDENT-INSIGHTS",
    "claim",
    {
      owner: "Xingyu (PM)",
      requiredReviewers: productReviewer,
      concerns: ["Content", "Product claim"],
    }
  ),
  manifestEntry(
    "capability.contextual-intelligence",
    "TW-CAP-NEXT-STEP",
    "claim",
    {
      owner: "Xingyu (PM)",
      requiredReviewers: productReviewer,
      concerns: ["Content", "Product claim"],
    }
  ),
  manifestEntry("capability.hey-talia", "TW-CAP-MESSAGE-DRAFTING", "claim", {
    owner: "Xingyu (PM)",
    requiredReviewers: productReviewer,
    concerns: ["Content", "Product claim", "Teacher control"],
  }),
  manifestEntry("capability.posts", "TW-CAP-POSTS", "claim", {
    owner: "Xingyu (PM)",
    requiredReviewers: productReviewer,
    concerns: ["Content", "Product claim"],
  }),
  manifestEntry("section.audiences", "TW-SECTION-AUDIENCES", "structure", {
    owner: "Xingyu (PM)",
    requiredReviewers: productReviewer,
  }),
  manifestEntry("audience.teachers", "TW-AUDIENCE-FORM-TEACHERS", "omission", {
    owner: "Xingyu (PM)",
    requiredReviewers: productReviewer,
  }),
  manifestEntry(
    "audience.key-personnel",
    "TW-AUDIENCE-KEY-PERSONNEL",
    "omission",
    { owner: "Xingyu (PM)", requiredReviewers: productReviewer }
  ),
  manifestEntry(
    "audience.school-leaders",
    "TW-AUDIENCE-SCHOOL-LEADERS",
    "omission",
    { owner: "Xingyu (PM)", requiredReviewers: productReviewer }
  ),
  manifestEntry("section.proof", "TW-SECTION-PROOF", "structure"),
  manifestEntry("proof.testimonials", "TW-PROOF", "omission", {
    concerns: ["Publication", "Testimonial permission", "Capability coverage"],
  }),
  manifestEntry("section.close", "TW-SECTION-CLOSE", "structure"),
  manifestEntry("close.copy", "TW-CLOSE", "copy"),
  manifestEntry("destination.cta.close", "TW-CTA-CLOSE", "destination", {
    concerns: ["Access", "Publication"],
    linkDisplay: "public-destination",
  }),
  manifestEntry(
    "section.access-support",
    "TW-SECTION-ACCESS-SUPPORT",
    "structure"
  ),
  manifestEntry("support.public-route", "TW-SUPPORT", "omission", {
    concerns: ["Access", "Publication"],
  }),
  manifestEntry(
    "section.footer-feedback",
    "TW-SECTION-FOOTER-FEEDBACK",
    "structure"
  ),
  manifestEntry("footer.copy", "TW-FOOTER", "copy"),
  manifestEntry("destination.feedback", "TW-FEEDBACK", "destination", {
    concerns: ["Feedback"],
    linkDisplay: "public-destination",
  }),
] as const satisfies ReadonlyArray<ContentReviewManifestEntry>

/**
 * The GA-launch line and the three audience answers are slots an author can
 * resolve in `content/`. The moment one is filled in, the registry projects it
 * as reviewable copy rather than an unanswered decision, so its review
 * classification has to follow the content instead of being fixed above.
 */
export function createContentReviewManifest(
  content: LandingPageV2Content = landingPageV2Content
): ReadonlyArray<ContentReviewManifestEntry> {
  const resolved = new Map<string, ReviewContentKind>([
    [
      "reveal.ga-launch-line",
      content.reveal.gaLaunchLine ? "copy" : "omission",
    ],
    ...content.audiences.map(
      (audience) =>
        [
          `audience.${audience.id}`,
          audience.question && audience.answer ? "copy" : "omission",
        ] as const
    ),
  ])

  return contentReviewManifest.map((entry) => {
    const contentKind = resolved.get(entry.contentId)
    return contentKind === undefined || contentKind === entry.contentKind
      ? entry
      : { ...entry, contentKind }
  })
}

export const contentReviewRegistry = createContentReviewRegistry()

function issue(code: string, message: string): ContentReviewStructureIssue {
  return { code, message }
}

function isNonBlank(value: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}

function normaliseSafetyText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function projectWithoutValidation(
  registry: ReadonlyArray<ContentReviewRegistryEntry>,
  manifest: ReadonlyArray<ContentReviewManifestEntry>
): ReviewDraftProjectionDto | null {
  const manifestById = new Map(manifest.map((item) => [item.contentId, item]))
  const metadata = registry.find((item) => item.role === "metadata")
  if (!metadata) return null

  const metadataManifest = manifestById.get(metadata.contentId)
  if (!metadataManifest) return null

  const projectedMetadata: ReviewDraftContentEntryDto = {
    ...metadata.entry,
    reviewReference: metadataManifest.reviewReference,
  }

  const sections = contentReviewSectionOrder.map((sectionKind) => {
    const marker = registry.find(
      (item) => item.role === "section" && item.sectionKind === sectionKind
    )
    if (!marker) return null

    const markerManifest = manifestById.get(marker.contentId)
    if (!markerManifest) return null

    const entries = registry
      .filter(
        (item): item is RegistryEntry =>
          item.role === "entry" && item.sectionKind === sectionKind
      )
      .map((item) => {
        const manifestItem = manifestById.get(item.contentId)
        if (!manifestItem) return null
        return {
          ...item.entry,
          reviewReference: manifestItem.reviewReference,
        }
      })

    if (entries.some((entry) => entry === null)) return null

    return {
      kind: sectionKind,
      reviewReference: markerManifest.reviewReference,
      entries: entries as ReadonlyArray<ReviewDraftEntryDto>,
    }
  })

  if (sections.some((sectionValue) => sectionValue === null)) return null

  return {
    metadata: projectedMetadata,
    sections: sections as ReviewDraftProjectionDto["sections"],
  }
}

export function getContentReviewStructureIssues(
  options: ReviewBuildOptions = {}
): ReadonlyArray<ContentReviewStructureIssue> {
  const content = options.content ?? landingPageV2Content
  const publication = options.publication ?? landingPageV2Publication
  const registry =
    options.registry ?? createContentReviewRegistry(content, publication)
  const manifest = options.manifest ?? createContentReviewManifest(content)
  const issues: Array<ContentReviewStructureIssue> = []

  const registryIds = registry.map((item) => item.contentId)
  const manifestIds = manifest.map((item) => item.contentId)
  if (new Set(registryIds).size !== registryIds.length) {
    issues.push(issue("duplicate-content-id", "Registry IDs must be unique."))
  }
  if (new Set(manifestIds).size !== manifestIds.length) {
    issues.push(issue("duplicate-manifest-id", "Manifest IDs must be unique."))
  }

  const registryIdSet = new Set(registryIds)
  const manifestIdSet = new Set(manifestIds)
  if (
    registryIds.some((contentId) => !manifestIdSet.has(contentId)) ||
    manifestIds.some((contentId) => !registryIdSet.has(contentId))
  ) {
    issues.push(
      issue(
        "manifest-coverage",
        "Every registry item needs exactly one manifest entry and no manifest entry may be orphaned."
      )
    )
  }

  const reviewReferences = manifest.map((item) => item.reviewReference)
  if (new Set(reviewReferences).size !== reviewReferences.length) {
    issues.push(
      issue(
        "duplicate-review-reference",
        "Public review references must be unique."
      )
    )
  }
  if (
    reviewReferences.some(
      (reviewReference) => !/^TW-[A-Z0-9-]+$/.test(reviewReference)
    )
  ) {
    issues.push(
      issue(
        "invalid-review-reference",
        "Public review references must use the TW semantic namespace."
      )
    )
  }

  const sectionKinds = registry
    .filter((item): item is RegistrySection => item.role === "section")
    .map((item) => item.sectionKind)
  if (
    sectionKinds.length !== contentReviewSectionOrder.length ||
    !sectionKinds.every(
      (sectionKind, index) => sectionKind === contentReviewSectionOrder[index]
    )
  ) {
    issues.push(
      issue(
        "section-order",
        "The review registry must contain every canonical section exactly once and in order."
      )
    )
  }

  for (const item of registry) {
    const manifestItem = manifest.find(
      (candidate) => candidate.contentId === item.contentId
    )
    if (
      item.role !== "section" &&
      item.contentKind !== item.entry.contentKind
    ) {
      issues.push(
        issue(
          "entry-content-kind-mismatch",
          "A registry item's inner and outer content classifications must match."
        )
      )
      break
    }
    if (manifestItem && manifestItem.contentKind !== item.contentKind) {
      issues.push(
        issue(
          "content-kind-mismatch",
          "Registry and manifest content classifications must match."
        )
      )
      break
    }

    if (manifestItem && item.role !== "section") {
      const hasPublicDestination =
        item.entry.kind === "content" && item.entry.link !== null
      const expectedLinkDisplay = hasPublicDestination
        ? "public-destination"
        : "label-only"

      if (manifestItem.linkDisplay !== expectedLinkDisplay) {
        issues.push(
          issue(
            "link-display-mismatch",
            "Manifest link-display policy must match the projected destination."
          )
        )
        break
      }
    }

    if (item.role === "section") continue
    if (item.entry.kind === "decision") {
      if (!isNonBlank(item.entry.reviewLabel)) {
        issues.push(
          issue(
            "blank-decision-label",
            "Decision-only slots need a public-safe review label."
          )
        )
      }
      continue
    }

    const textValues = [
      item.entry.label,
      item.entry.heading,
      ...item.entry.body,
      item.entry.link?.label ?? null,
      item.entry.link?.note ?? null,
    ].filter((value): value is string => value !== null)
    if (textValues.some((value) => !isNonBlank(value))) {
      issues.push(
        issue("blank-public-copy", "Projected public copy cannot be blank.")
      )
      break
    }
    if (item.entry.link && !isHttpsUrl(item.entry.link.href)) {
      issues.push(
        issue(
          "invalid-public-destination",
          "Projected public destinations must use HTTPS."
        )
      )
      break
    }
  }

  const canonicalJourneyCapabilities = [null, ...capabilityIds] as const
  const journeyCapabilityIds = content.journey.map((act) => act.capabilityId)
  const journeyCapabilityLabels = content.journey.map((act) =>
    publicCapabilityLabel(content, act.capabilityId)
  )
  if (
    journeyCapabilityIds.length !== canonicalJourneyCapabilities.length ||
    !journeyCapabilityIds.every(
      (capabilityId, index) =>
        capabilityId === canonicalJourneyCapabilities[index]
    ) ||
    journeyCapabilityLabels[0] !== null ||
    journeyCapabilityLabels.slice(1).some((label) => !isNonBlank(label)) ||
    new Set(journeyCapabilityLabels.slice(1)).size !== capabilityIds.length
  ) {
    issues.push(
      issue(
        "journey-capability-mapping",
        "The five journey acts must map once, in order, to the four public capability labels after the setup act."
      )
    )
  }

  const projection = projectWithoutValidation(registry, manifest)
  if (!projection) {
    issues.push(
      issue(
        "projection-incomplete",
        "An invalid registry or manifest cannot produce a partial draft."
      )
    )
    return issues
  }

  const projectedStory = projection.sections.find(
    (sectionValue) => sectionValue.kind === "connected-story"
  )
  const projectedCapabilityLabels = projectedStory?.entries.map((entry) =>
    entry.kind === "content" ? entry.capabilityLabel : undefined
  )
  if (
    !projectedCapabilityLabels ||
    projectedCapabilityLabels.length !== journeyCapabilityLabels.length ||
    !projectedCapabilityLabels.every(
      (label, index) => label === journeyCapabilityLabels[index]
    )
  ) {
    if (!issues.some((item) => item.code === "journey-capability-mapping")) {
      issues.push(
        issue(
          "journey-capability-mapping",
          "The projected journey must expose the canonical public capability mapping."
        )
      )
    }
  }

  // The canonical story is the ticket's bursary care journey again (see
  // docs/adr/0001-bursary-care-story-is-canonical.md), so "Xiao Ming" and
  // "bursary" are reviewable copy now. Internal capability names, the raw
  // source URL of the unpublishable ticket screenshot, and the FAS
  // abbreviation (public copy spells out "financial assistance") stay banned.
  const serialisedProjection = normaliseSafetyText(JSON.stringify(projection))
  const prohibitedValues = [
    "contextual intelligence",
    "heytalia",
    "hey talia",
    normaliseSafetyText(content.sources.bursaryExampleComment),
  ]
  if (
    prohibitedValues.some((value) => serialisedProjection.includes(value)) ||
    /(^| )fas( |$)/.test(serialisedProjection)
  ) {
    issues.push(
      issue(
        "public-copy-safety",
        "The review draft cannot contain internal capability names, the FAS abbreviation, or raw source references."
      )
    )
  }

  return issues
}

export function buildReviewDraftProjection(options: ReviewBuildOptions = {}):
  | { readonly ok: true; readonly projection: ReviewDraftProjectionDto }
  | {
      readonly ok: false
      readonly issues: ReadonlyArray<ContentReviewStructureIssue>
    } {
  const content = options.content ?? landingPageV2Content
  const publication = options.publication ?? landingPageV2Publication
  const registry =
    options.registry ?? createContentReviewRegistry(content, publication)
  const manifest = options.manifest ?? createContentReviewManifest(content)
  const issues = getContentReviewStructureIssues({
    content,
    publication,
    registry,
    manifest,
  })

  if (issues.length > 0) return { ok: false, issues }

  const projection = projectWithoutValidation(registry, manifest)
  return projection
    ? { ok: true, projection }
    : {
        ok: false,
        issues: [
          issue(
            "projection-incomplete",
            "An invalid registry or manifest cannot produce a partial draft."
          ),
        ],
      }
}
