import { describe, expect, it } from "vitest"

import {
  buildReviewDraftProjection,
  contentReviewArtifactManifest,
  contentReviewManifest,
  contentReviewRegistry,
  contentReviewSectionOrder,
  getContentReviewStructureIssues,
} from "./landing-v2-review.server"
import { landingPageV2Content } from "./landing-v2"
import type { ContentReviewRegistryEntry } from "./landing-v2-review.server"

describe("Landing Page v2 content-review projection", () => {
  it("covers the complete ordered IA with one manifest entry per registry item", () => {
    expect(contentReviewSectionOrder).toEqual([
      "promise",
      "connected-story",
      "reveal",
      "capabilities",
      "explorer",
      "audiences",
      "proof",
      "access-support",
      "close",
      "footer-feedback",
    ])

    expect(contentReviewManifest.map((item) => item.contentId).sort()).toEqual(
      contentReviewRegistry.map((item) => item.contentId).sort()
    )
    expect(
      contentReviewArtifactManifest.map((item) => item.reviewReference)
    ).toEqual(["TW-IA-ORDER", "TW-STORY-COMPOSED"])
    expect(
      contentReviewArtifactManifest.some((artifact) =>
        contentReviewManifest.some(
          (item) => item.reviewReference === artifact.reviewReference
        )
      )
    ).toBe(false)
    expect(
      new Set(contentReviewManifest.map((item) => item.reviewReference)).size
    ).toBe(contentReviewManifest.length)
    expect(getContentReviewStructureIssues()).toEqual([])
  })

  it("projects the positive story without raw review or superseded source data", () => {
    const result = buildReviewDraftProjection()

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const serialised = JSON.stringify(result.projection)
    const lowercase = serialised.toLowerCase()

    expect(lowercase).toContain("progress")
    for (const prohibitedValue of [
      "xiao ming",
      "fas",
      "bursary",
      "contextual-intelligence",
      "hey-talia",
      "approvedby",
      "sourceurl",
      "contentid",
      landingPageV2Content.sources.bursaryExampleComment.toLowerCase(),
      landingPageV2Content.testimonials[0].quote.toLowerCase(),
    ]) {
      expect(lowercase).not.toContain(prohibitedValue)
    }

    expect(result.projection.sections.map((section) => section.kind)).toEqual(
      contentReviewSectionOrder
    )
  })

  it("projects the canonical journey-to-capability mapping with public labels only", () => {
    const result = buildReviewDraftProjection()

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const story = result.projection.sections.find(
      (section) => section.kind === "connected-story"
    )
    expect(
      story?.entries.map((entry) =>
        entry.kind === "content" ? entry.capabilityLabel : undefined
      )
    ).toEqual([
      null,
      "Student Insights",
      "Next-step guidance",
      "Message drafting",
      "Posts",
    ])
  })

  it("fails projection when only the canonical journey capability mapping changes", () => {
    const content = {
      ...landingPageV2Content,
      journey: [
        landingPageV2Content.journey[0],
        {
          ...landingPageV2Content.journey[1],
          capabilityId: "contextual-intelligence" as const,
        },
        {
          ...landingPageV2Content.journey[2],
          capabilityId: "student-insights" as const,
        },
        landingPageV2Content.journey[3],
        landingPageV2Content.journey[4],
      ] as const,
    }

    expect(
      getContentReviewStructureIssues({ content }).map((issue) => issue.code)
    ).toContain("journey-capability-mapping")
    expect(buildReviewDraftProjection({ content }).ok).toBe(false)

    const registry = contentReviewRegistry.map((item) =>
      item.role === "entry" &&
      item.contentId === "journey.notice" &&
      item.entry.kind === "content"
        ? {
            ...item,
            entry: { ...item.entry, capabilityLabel: "Message drafting" },
          }
        : item
    ) as ReadonlyArray<ContentReviewRegistryEntry>
    expect(buildReviewDraftProjection({ registry }).ok).toBe(false)
  })

  it("keeps omitted audience, proof, and support copy as referenced decisions", () => {
    const result = buildReviewDraftProjection()

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const decisions = result.projection.sections.flatMap((section) =>
      section.entries.filter((entry) => entry.kind === "decision")
    )

    expect(decisions.map((entry) => entry.reviewReference)).toEqual([
      "TW-REVEAL-GA-LINE",
      "TW-AUDIENCE-FORM-TEACHERS",
      "TW-AUDIENCE-KEY-PERSONNEL",
      "TW-AUDIENCE-SCHOOL-LEADERS",
      "TW-PROOF",
      "TW-SUPPORT",
    ])
    expect(
      decisions.every(
        (entry) =>
          !("heading" in entry) &&
          !("body" in entry) &&
          entry.reviewLabel.length > 0
      )
    ).toBe(true)
  })

  it("fails closed for missing mappings, duplicate references, or an unaccepted explorer", () => {
    const missingManifestEntry = contentReviewManifest.slice(1)
    const duplicateReferenceManifest = contentReviewManifest.map(
      (item, index) =>
        index === 1
          ? {
              ...item,
              reviewReference: contentReviewManifest[0].reviewReference,
            }
          : item
    )
    const unacceptedExplorer = {
      ...landingPageV2Content,
      productExplorer: { status: "not-pursued" as const },
    }

    expect(
      buildReviewDraftProjection({ manifest: missingManifestEntry }).ok
    ).toBe(false)
    expect(
      getContentReviewStructureIssues({
        manifest: duplicateReferenceManifest,
      }).map((issue) => issue.code)
    ).toContain("duplicate-review-reference")
    expect(buildReviewDraftProjection({ content: unacceptedExplorer }).ok).toBe(
      false
    )
  })

  it.each(["Contextual-Intelligence", "Hey Talia", "hey_talia"])(
    "normalises and rejects the internal public name %s",
    (internalName) => {
      const content = {
        ...landingPageV2Content,
        hero: {
          ...landingPageV2Content.hero,
          body: `Draft copy mentions ${internalName}.`,
        },
      }

      expect(
        getContentReviewStructureIssues({ content }).map((issue) => issue.code)
      ).toContain("public-copy-safety")
    }
  )

  it("enforces the manifest link-display policy", () => {
    const manifest = contentReviewManifest.map((item) =>
      item.contentId === "destination.cta.hero"
        ? { ...item, linkDisplay: "label-only" as const }
        : item
    )

    expect(
      getContentReviewStructureIssues({ manifest }).map((issue) => issue.code)
    ).toContain("link-display-mismatch")
  })

  it("fails closed when a content entry's inner and outer kinds disagree", () => {
    const registry = contentReviewRegistry.map((item) =>
      item.role === "entry" &&
      item.contentId === "promise.hero" &&
      item.entry.kind === "content"
        ? {
            ...item,
            entry: { ...item.entry, contentKind: "claim" as const },
          }
        : item
    ) as unknown as ReadonlyArray<ContentReviewRegistryEntry>

    expect(
      getContentReviewStructureIssues({ registry }).map((issue) => issue.code)
    ).toContain("entry-content-kind-mismatch")
    expect(buildReviewDraftProjection({ registry }).ok).toBe(false)

    const metadataRegistry = contentReviewRegistry.map((item) =>
      item.role === "metadata"
        ? {
            ...item,
            entry: { ...item.entry, contentKind: "claim" as const },
          }
        : item
    ) as unknown as ReadonlyArray<ContentReviewRegistryEntry>

    expect(
      getContentReviewStructureIssues({ registry: metadataRegistry }).map(
        (issue) => issue.code
      )
    ).toContain("entry-content-kind-mismatch")
    expect(buildReviewDraftProjection({ registry: metadataRegistry }).ok).toBe(
      false
    )
  })

  it("includes the confirmed footer and two CTA placements without v1 imports", () => {
    const result = buildReviewDraftProjection()

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const entries = result.projection.sections.flatMap(
      (section) => section.entries
    )
    const links = entries.flatMap((entry) =>
      entry.kind === "content" && entry.link ? [entry.link] : []
    )

    expect(links.filter((link) => link.purpose === "product")).toHaveLength(2)
    expect(links.filter((link) => link.purpose === "feedback")).toHaveLength(1)
    expect(
      entries.some(
        (entry) =>
          entry.kind === "content" &&
          entry.reviewReference === "TW-FOOTER" &&
          entry.body.includes("© MOE 2026")
      )
    ).toBe(true)
  })
})
