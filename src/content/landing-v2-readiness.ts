import {
  audienceIds,
  capabilityIds,
  journeyActIds,
  landingPageV2Content,
  landingPageV2Publication,
  productExplorerComprehensionFlow,
} from "./landing-v2"

import type {
  AudienceBlock,
  CapabilityCard,
  JourneyAct,
  LandingPageV2Content,
  LandingPageV2Publication,
  ProductExplorer,
  SupportResource,
  Testimonial,
} from "./landing-v2"
import { siteConfig } from "@/config/site"

export type LandingPageV2ReadinessIssue = {
  readonly code: string
  readonly severity: "error" | "decision"
  readonly message: string
}

export type LandingPageV2Candidate = {
  readonly editorialStatus: LandingPageV2Content["editorialStatus"]
  readonly reveal: LandingPageV2Content["reveal"]
  readonly journey: ReadonlyArray<JourneyAct>
  readonly capabilities: ReadonlyArray<CapabilityCard>
  readonly productExplorer: ProductExplorer
  readonly audiences: ReadonlyArray<AudienceBlock>
  readonly testimonials: ReadonlyArray<Testimonial>
  readonly supportResources: ReadonlyArray<SupportResource>
}

function sameOrder<T>(
  actual: ReadonlyArray<T>,
  expected: ReadonlyArray<T>
): boolean {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  )
}

function hasExactMembers<T>(
  actual: ReadonlyArray<T>,
  expected: ReadonlyArray<T>
): boolean {
  const actualMembers = new Set(actual)
  return (
    actual.length === expected.length &&
    actualMembers.size === expected.length &&
    expected.every((value) => actualMembers.has(value))
  )
}

function issue(
  code: string,
  severity: LandingPageV2ReadinessIssue["severity"],
  message: string
): LandingPageV2ReadinessIssue {
  return { code, severity, message }
}

function isNonBlank(value: string | null | undefined): value is string {
  return (
    typeof value === "string" && value.replace(/\p{Cf}/gu, "").trim().length > 0
  )
}

function isHttpsUrl(value: string | null | undefined): boolean {
  if (!isNonBlank(value)) return false

  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname.length > 0
  } catch {
    return false
  }
}

function compactIssues(
  issues: ReadonlyArray<LandingPageV2ReadinessIssue | null>
): ReadonlyArray<LandingPageV2ReadinessIssue> {
  return issues.filter(
    (candidate): candidate is LandingPageV2ReadinessIssue => candidate !== null
  )
}

function checkJourneyOrder(
  content: LandingPageV2Candidate
): LandingPageV2ReadinessIssue | null {
  return sameOrder(
    content.journey.map((act) => act.id),
    journeyActIds
  )
    ? null
    : issue(
        "journey-order",
        "error",
        "The five journey acts must remain in promise-to-record order."
      )
}

function checkJourneyNumbering(
  content: LandingPageV2Candidate
): LandingPageV2ReadinessIssue | null {
  return sameOrder(
    content.journey.map((act) => act.order),
    [1, 2, 3, 4, 5]
  )
    ? null
    : issue(
        "journey-numbering",
        "error",
        "Journey act numbers must be contiguous from one through five."
      )
}

function checkJourneyCapabilities(
  content: LandingPageV2Candidate
): LandingPageV2ReadinessIssue | null {
  return sameOrder(
    content.journey.map((act) => act.capabilityId),
    [null, ...capabilityIds]
  )
    ? null
    : issue(
        "journey-capabilities",
        "error",
        "Acts two through five must map once, in order, to the four capabilities."
      )
}

function checkCapabilityOrder(
  content: LandingPageV2Candidate
): LandingPageV2ReadinessIssue | null {
  return sameOrder(
    content.capabilities.map((capability) => capability.id),
    capabilityIds
  )
    ? null
    : issue(
        "capability-order",
        "error",
        "The capability discovery layer must mirror the journey order."
      )
}

function checkCapabilityAnchors(
  content: LandingPageV2Candidate
): LandingPageV2ReadinessIssue | null {
  const anchors = content.capabilities.map((capability) => capability.anchorId)
  return new Set(anchors).size === anchors.length
    ? null
    : issue(
        "capability-anchors",
        "error",
        "Every capability card needs a unique anchor."
      )
}

function checkPublicCapabilityLabels(
  content: LandingPageV2Candidate
): LandingPageV2ReadinessIssue | null {
  const internalOnlyLabels = new Set(["Contextual Intelligence", "HeyTalia"])
  return content.capabilities.some((capability) =>
    internalOnlyLabels.has(capability.publicLabel)
  )
    ? issue(
        "public-capability-labels",
        "error",
        "Capability cards must use approved plain-language public labels."
      )
    : null
}

function checkProductExplorerCapabilities(
  content: LandingPageV2Candidate
): LandingPageV2ReadinessIssue | null {
  if (content.productExplorer.status !== "accepted") return null

  return hasExactMembers(content.productExplorer.capabilityIds, capabilityIds)
    ? null
    : issue(
        "product-explorer-capabilities",
        "error",
        "An accepted product explorer must cover every Teacher Workspace capability exactly once."
      )
}

function checkProductExplorerFlow(
  content: LandingPageV2Candidate
): LandingPageV2ReadinessIssue | null {
  if (content.productExplorer.status !== "accepted") return null

  return sameOrder(
    content.productExplorer.comprehensionFlow,
    productExplorerComprehensionFlow
  )
    ? null
    : issue(
        "product-explorer-flow",
        "error",
        "The accepted product explorer must preserve the confirmed comprehension flow."
      )
}

function checkAudienceOrder(
  content: LandingPageV2Candidate
): LandingPageV2ReadinessIssue | null {
  return sameOrder(
    content.audiences.map((audience) => audience.id),
    audienceIds
  )
    ? null
    : issue(
        "audience-order",
        "error",
        "Audience blocks must cover teachers, key personnel, and school leaders."
      )
}

function checkTestimonialProvenance(
  content: LandingPageV2Candidate
): LandingPageV2ReadinessIssue | null {
  return content.testimonials.some(
    (testimonial) => !isHttpsUrl(testimonial.sourceUrl)
  )
    ? issue(
        "testimonial-provenance",
        "error",
        "Every testimonial needs an HTTPS source reference."
      )
    : null
}

export function getLandingPageV2StructureIssues(
  content: LandingPageV2Candidate = landingPageV2Content
): ReadonlyArray<LandingPageV2ReadinessIssue> {
  return compactIssues([
    checkJourneyOrder(content),
    checkJourneyNumbering(content),
    checkJourneyCapabilities(content),
    checkCapabilityOrder(content),
    checkCapabilityAnchors(content),
    checkPublicCapabilityLabels(content),
    checkProductExplorerCapabilities(content),
    checkProductExplorerFlow(content),
    checkAudienceOrder(content),
    checkTestimonialProvenance(content),
  ])
}

function checkReleaseCopy(
  content: LandingPageV2Candidate
): LandingPageV2ReadinessIssue | null {
  return isNonBlank(content.reveal.gaLaunchLine)
    ? null
    : issue(
        "release-copy",
        "decision",
        "Approve GA launch copy before publishing."
      )
}

function checkContentApproval(
  content: LandingPageV2Candidate,
  publication: LandingPageV2Publication
): LandingPageV2ReadinessIssue | null {
  return content.editorialStatus === "approved" &&
    isNonBlank(publication.contentApprovedBy)
    ? null
    : issue(
        "content-approval",
        "decision",
        "Mark the final copy approved and record its accountable approver."
      )
}

function checkPrimaryCta(
  publication: LandingPageV2Publication
): LandingPageV2ReadinessIssue | null {
  const {
    accessNote,
    href,
    identityProvider,
    intent,
    label,
    requiredAccountDomain,
  } = publication.primaryCta
  return label === "Sign in with Google" &&
    href === siteConfig.links.product &&
    intent === "google-sign-in" &&
    identityProvider === "google" &&
    requiredAccountDomain === "edu.gov.sg" &&
    accessNote === "Use your @edu.gov.sg account."
    ? null
    : issue(
        "primary-cta",
        "decision",
        "Use the confirmed Google sign-in link and @edu.gov.sg access note in hero and close."
      )
}

function checkCanonicalUrl(
  publication: LandingPageV2Publication
): LandingPageV2ReadinessIssue | null {
  return isHttpsUrl(publication.canonicalUrl)
    ? null
    : issue(
        "canonical-url",
        "decision",
        "Confirm the public marketing origin and preview indexing policy."
      )
}

function checkSocialImage(
  publication: LandingPageV2Publication
): LandingPageV2ReadinessIssue | null {
  return isHttpsUrl(publication.socialImageUrl)
    ? null
    : issue(
        "social-image",
        "decision",
        "Approve a public social preview image before wiring launch metadata."
      )
}

function checkProductClaims(
  publication: LandingPageV2Publication
): LandingPageV2ReadinessIssue | null {
  const { approvedBy, owner, status } = publication.productClaimsApproval
  return owner === "Xingyu (PM)" &&
    status === "approved" &&
    isNonBlank(approvedBy)
    ? null
    : issue(
        "product-claims",
        "decision",
        "Record Xingyu's review of the progress visibility, next-step guidance, teacher-reviewable drafting, and Posts claims."
      )
}

function checkAudienceConfirmation(
  publication: LandingPageV2Publication
): LandingPageV2ReadinessIssue | null {
  const { confirmedBy, intendedAudienceIds, owner, status } =
    publication.gaAudience
  return sameOrder(intendedAudienceIds, audienceIds) &&
    owner === "Xingyu (PM)" &&
    status === "confirmed" &&
    isNonBlank(confirmedBy)
    ? null
    : issue(
        "audience-confirmation",
        "decision",
        "Record Xingyu's confirmation of Form Teachers, Key Personnel, and School Leaders as the GA audience."
      )
}

function checkSyntheticDemoApproval(
  publication: LandingPageV2Publication
): LandingPageV2ReadinessIssue | null {
  const requiredApprovers = ["Designer", "Xingyu (PM)"] as const
  const { approvedBy, owners, status } = publication.syntheticDemoApproval
  return sameOrder(owners, requiredApprovers) &&
    status === "approved" &&
    requiredApprovers.every((approver) => approvedBy.includes(approver))
    ? null
    : issue(
        "synthetic-demo-approval",
        "decision",
        "Record Designer and Xingyu approval that the student story and demo data are synthetic and safe for public use."
      )
}

function checkTestimonialCoverage(
  content: LandingPageV2Candidate,
  publication: LandingPageV2Publication
): ReadonlyArray<LandingPageV2ReadinessIssue> {
  const coverage = new Set(
    content.testimonials.flatMap((testimonial) => testimonial.capabilityIds)
  )
  return publication.testimonialCoverageRequired
    .filter((capabilityId) => !coverage.has(capabilityId))
    .map((capabilityId) => {
      const publicLabel =
        content.capabilities.find(
          (capability) => capability.id === capabilityId
        )?.publicLabel ?? "a required capability"
      return issue(
        `testimonial-coverage-${capabilityId}`,
        "decision",
        `Provide an approved testimonial covering ${publicLabel}.`
      )
    })
}

function checkTestimonialApproval(
  content: LandingPageV2Candidate
): LandingPageV2ReadinessIssue | null {
  return content.testimonials.some(
    (testimonial) => !testimonial.publicationApproved
  )
    ? issue(
        "testimonial-approval",
        "decision",
        "Record publication approval for every selected testimonial."
      )
    : null
}

function checkAudienceCopy(
  content: LandingPageV2Candidate
): LandingPageV2ReadinessIssue | null {
  return content.audiences.some(
    (audience) => !isNonBlank(audience.question) || !isNonBlank(audience.answer)
  )
    ? issue(
        "audience-copy",
        "decision",
        "Define the real question and answer for each audience block."
      )
    : null
}

function checkSupportStrategy(
  publication: LandingPageV2Publication
): LandingPageV2ReadinessIssue | null {
  return publication.support.strategy === null
    ? issue(
        "support-strategy",
        "decision",
        "Choose the launch-ready support destination and explain any access restriction."
      )
    : null
}

function checkSupportDetails(
  publication: LandingPageV2Publication
): LandingPageV2ReadinessIssue | null {
  const { accessExplanation, approvedBy, destinationUrl, owner, strategy } =
    publication.support
  if (strategy === null) return null
  return isHttpsUrl(destinationUrl) &&
    isNonBlank(owner) &&
    isNonBlank(accessExplanation) &&
    isNonBlank(approvedBy)
    ? null
    : issue(
        "support-details",
        "decision",
        "Define the support URL, owner, access explanation, and approver."
      )
}

export function getLandingPageV2LaunchDecisions(
  content: LandingPageV2Candidate = landingPageV2Content,
  publication: LandingPageV2Publication = landingPageV2Publication
): ReadonlyArray<LandingPageV2ReadinessIssue> {
  return [
    ...compactIssues([
      checkReleaseCopy(content),
      checkContentApproval(content, publication),
      checkPrimaryCta(publication),
      checkCanonicalUrl(publication),
      checkSocialImage(publication),
      checkAudienceConfirmation(publication),
      checkProductClaims(publication),
      checkSyntheticDemoApproval(publication),
    ]),
    ...checkTestimonialCoverage(content, publication),
    ...compactIssues([
      checkTestimonialApproval(content),
      checkAudienceCopy(content),
      checkSupportStrategy(publication),
      checkSupportDetails(publication),
    ]),
  ]
}

export function getLandingPageV2Readiness(
  content: LandingPageV2Candidate = landingPageV2Content,
  publication: LandingPageV2Publication = landingPageV2Publication
) {
  const issues = [
    ...getLandingPageV2StructureIssues(content),
    ...getLandingPageV2LaunchDecisions(content, publication),
  ]

  return {
    ready: issues.length === 0,
    issues,
  } as const
}
