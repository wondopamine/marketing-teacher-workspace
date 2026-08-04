import { describe, expect, it } from "vitest"

import {
  buildContentReviewPageDto,
  createReviewSnapshot,
  deriveContentReviewStatus,
  getReviewDraftSnapshots,
} from "./landing-v2-review-state.server"
import {
  buildReviewDraftProjection,
  contentReviewManifest,
  createContentReviewRegistry,
} from "./landing-v2-review.server"
import { landingPageV2Content, landingPageV2Publication } from "./landing-v2"

describe("Landing Page v2 revision-aware review state", () => {
  it("normalises content deterministically without binding review metadata", () => {
    const first = createReviewSnapshot({
      heading: "  Progress\r\nmatters  ",
      body: ["A student's growth"],
    })
    const equivalent = createReviewSnapshot({
      body: ["A student's growth"],
      heading: "Progress\nmatters",
    })
    const changed = createReviewSnapshot({
      body: ["A student's progress"],
      heading: "Progress\nmatters",
    })

    expect(first).toBe(equivalent)
    expect(changed).not.toBe(first)
    expect(first).toMatch(/^v1-sha256-[a-f0-9]{16}$/)
  })

  it("uses the documented display-state precedence", () => {
    const currentSnapshot = createReviewSnapshot({ copy: "Current" })
    const reviewed = (
      reviewerRole: string,
      reviewedSnapshot = currentSnapshot
    ) => ({
      reviewerRole,
      reviewedSnapshot,
      evidenceReference: "Decision channel: item 1",
    })

    expect(
      deriveContentReviewStatus({
        currentSnapshot,
        blocked: true,
        explicitDecisionRequired: true,
        reviewerRequirement: "unresolved",
        requiredReviewers: [],
        records: [],
      }).status
    ).toBe("blocked")
    expect(
      deriveContentReviewStatus({
        currentSnapshot,
        blocked: false,
        explicitDecisionRequired: true,
        reviewerRequirement: "confirmed",
        requiredReviewers: ["PM"],
        records: [],
      }).status
    ).toBe("decision-required")
    expect(
      deriveContentReviewStatus({
        currentSnapshot,
        blocked: false,
        explicitDecisionRequired: false,
        reviewerRequirement: "confirmed",
        requiredReviewers: ["PM"],
        records: [reviewed("PM", createReviewSnapshot({ copy: "Old" }))],
      }).status
    ).toBe("reconfirmation-required")
    expect(
      deriveContentReviewStatus({
        currentSnapshot,
        blocked: false,
        explicitDecisionRequired: false,
        reviewerRequirement: "confirmed",
        requiredReviewers: ["PM"],
        records: [],
      }).status
    ).toBe("unreviewed")
    expect(
      deriveContentReviewStatus({
        currentSnapshot,
        blocked: false,
        explicitDecisionRequired: false,
        reviewerRequirement: "confirmed",
        requiredReviewers: ["Designer", "PM"],
        records: [reviewed("Designer")],
      }).status
    ).toBe("partially-reviewed")
    expect(
      deriveContentReviewStatus({
        currentSnapshot,
        blocked: false,
        explicitDecisionRequired: false,
        reviewerRequirement: "confirmed",
        requiredReviewers: ["Designer", "PM"],
        records: [reviewed("Designer"), reviewed("PM")],
      }).status
    ).toBe("reviewed-current")
  })

  it("keeps item invalidation local while staling the composed story", () => {
    const originalResult = buildReviewDraftProjection()
    expect(originalResult.ok).toBe(true)
    if (!originalResult.ok) return

    const changedContent = {
      ...landingPageV2Content,
      hero: {
        ...landingPageV2Content.hero,
        headline: `${landingPageV2Content.hero.headline} Today.`,
      },
    }
    const changedResult = buildReviewDraftProjection({
      content: changedContent,
    })
    expect(changedResult.ok).toBe(true)
    if (!changedResult.ok) return

    const original = getReviewDraftSnapshots(
      originalResult.projection,
      contentReviewManifest
    )
    const changed = getReviewDraftSnapshots(
      changedResult.projection,
      contentReviewManifest
    )

    expect(changed.byReference["TW-PROMISE"]).not.toBe(
      original.byReference["TW-PROMISE"]
    )
    expect(changed.byReference["TW-CAP-POSTS"]).toBe(
      original.byReference["TW-CAP-POSTS"]
    )
    expect(changed.iaOrderSnapshot).toBe(original.iaOrderSnapshot)
    expect(changed.storySnapshot).not.toBe(original.storySnapshot)
  })

  it("stales order and composition without changing item snapshots", () => {
    const result = buildReviewDraftProjection()
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const reorderedProjection = {
      ...result.projection,
      sections: [
        result.projection.sections[1],
        result.projection.sections[0],
        ...result.projection.sections.slice(2),
      ],
    }
    const original = getReviewDraftSnapshots(
      result.projection,
      contentReviewManifest
    )
    const reordered = getReviewDraftSnapshots(
      reorderedProjection,
      contentReviewManifest
    )

    expect(reordered.byReference["TW-PROMISE"]).toBe(
      original.byReference["TW-PROMISE"]
    )
    expect(reordered.iaOrderSnapshot).not.toBe(original.iaOrderSnapshot)
    expect(reordered.storySnapshot).not.toBe(original.storySnapshot)
  })

  it("builds a public-safe DTO with annotations and aggregate governance only", () => {
    const dto = buildContentReviewPageDto()

    expect(dto.kind).toBe("ready")
    if (dto.kind !== "ready") return

    expect(dto.sections).toHaveLength(10)
    expect(dto.artifactReview.iaOrder.reviewReference).toBe("TW-IA-ORDER")
    expect(dto.artifactReview.composedStory.reviewReference).toBe(
      "TW-STORY-COMPOSED"
    )
    expect(dto.appendix.proof.missingCapabilityLabels).toEqual([
      "Student Insights",
      "Message drafting",
      "Posts",
    ])

    const serialised = JSON.stringify(dto).toLowerCase()
    for (const prohibitedValue of [
      "contentid",
      "reviewedsnapshot",
      "evidencereference",
      "contextual-intelligence",
      "hey-talia",
      "xingyu",
      landingPageV2Content.sources.bursaryExampleComment.toLowerCase(),
      landingPageV2Content.testimonials[0].quote.toLowerCase(),
    ]) {
      expect(serialised).not.toContain(prohibitedValue)
    }
    expect(serialised).toContain("product manager")
  })

  it("builds appendix summaries from the requested content and publication", () => {
    const content = {
      ...landingPageV2Content,
      testimonials: [
        {
          ...landingPageV2Content.testimonials[0],
          capabilityIds: ["student-insights"] as const,
          publicationApproved: true,
        },
        {
          ...landingPageV2Content.testimonials[1],
          capabilityIds: ["hey-talia"] as const,
          publicationApproved: true,
        },
        ...landingPageV2Content.testimonials.slice(2).map((testimonial) => ({
          ...testimonial,
          publicationApproved: true,
        })),
      ],
    }
    const publication = {
      ...landingPageV2Publication,
      primaryCta: {
        ...landingPageV2Publication.primaryCta,
        label: "Continue with Google",
      },
      support: {
        ...landingPageV2Publication.support,
        strategy: "human-support" as const,
      },
    }

    const dto = buildContentReviewPageDto({ content, publication })
    expect(dto.kind).toBe("ready")
    if (dto.kind !== "ready") return

    expect(dto.appendix.proof.missingCapabilityLabels).toEqual([])
    expect(dto.appendix.access.label).toBe("Continue with Google")
    expect(dto.appendix.support.summary).toContain("selected")
  })

  it("returns only the safe error contract when structure validation fails", () => {
    const invalidManifest = contentReviewManifest.slice(1)
    const dto = buildContentReviewPageDto({ manifest: invalidManifest })

    expect(dto).toEqual({
      kind: "error",
      code: "CONTENT_REVIEW_INVALID",
      buildSnapshot: expect.stringMatching(/^v1-sha256-[a-f0-9]{16}$/),
      feedback: {
        label: "Send feedback",
        href: landingPageV2Content.footer.feedbackHref,
        note: null,
        purpose: "feedback",
      },
    })
  })

  it("fails unknown reviewer requirements closed without inventing owners", () => {
    const dto = buildContentReviewPageDto({
      registry: createContentReviewRegistry(),
    })

    expect(dto.kind).toBe("ready")
    if (dto.kind !== "ready") return

    const proof = dto.sections.find((section) => section.kind === "proof")
    expect(proof?.entries[0].review.status).toBe("decision-required")
    expect(proof?.entries[0].review.owner).toBe("Not assigned")
    expect(proof?.entries[0].review.requiredReviewers).toEqual([])
  })
})
