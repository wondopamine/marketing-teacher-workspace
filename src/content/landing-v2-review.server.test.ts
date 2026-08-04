import { describe, expect, it } from "vitest"

import {
  buildReviewDraftProjection,
  contentReviewManifest,
  contentReviewRegistry,
  contentReviewSectionOrder,
  getContentReviewStructureIssues,
} from "./landing-v2-review.server"
import { landingPageV2Content } from "./landing-v2"

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
