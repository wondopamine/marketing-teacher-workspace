import { describe, expect, it } from "vitest"

import {
  buildContentReviewAnnotatedPageDto,
  buildContentReviewPageDto,
  createReviewSnapshot,
  deriveContentReviewStatus,
  getLandingPageV2CombinedReadiness,
  getReviewDraftSnapshots,
} from "./landing-v2-review-state.server"
import {
  buildReviewDraftProjection,
  contentReviewArtifactManifest,
  contentReviewManifest,
  contentReviewRegistry,
  createContentReviewRegistry,
} from "./landing-v2-review.server"
import { getLandingPageV2Readiness } from "./landing-v2-readiness"
import { landingPageV2Content, landingPageV2Publication } from "./landing-v2"
import type { ContentReviewReviewerRole } from "./landing-v2-review.server"

function collectObjectKeys(
  value: unknown,
  keys = new Set<string>()
): Set<string> {
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjectKeys(item, keys))
    return keys
  }
  if (!value || typeof value !== "object") return keys

  for (const [key, item] of Object.entries(value)) {
    keys.add(key)
    collectObjectKeys(item, keys)
  }
  return keys
}

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
    expect(first).toMatch(/^v2-sha256-[a-f0-9]{16}$/)
  })

  it("uses the documented display-state precedence", () => {
    const currentSnapshot = createReviewSnapshot({ copy: "Current" })
    const reviewed = (
      reviewerRole: ContentReviewReviewerRole,
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
        requiredReviewers: ["Xingyu (PM)"],
        records: [],
      }).status
    ).toBe("decision-required")
    expect(
      deriveContentReviewStatus({
        currentSnapshot,
        blocked: false,
        explicitDecisionRequired: false,
        reviewerRequirement: "confirmed",
        requiredReviewers: ["Xingyu (PM)"],
        records: [
          reviewed("Xingyu (PM)", createReviewSnapshot({ copy: "Old" })),
        ],
      }).status
    ).toBe("reconfirmation-required")
    expect(
      deriveContentReviewStatus({
        currentSnapshot,
        blocked: false,
        explicitDecisionRequired: false,
        reviewerRequirement: "confirmed",
        requiredReviewers: ["Xingyu (PM)"],
        records: [],
      }).status
    ).toBe("unreviewed")
    expect(
      deriveContentReviewStatus({
        currentSnapshot,
        blocked: false,
        explicitDecisionRequired: false,
        reviewerRequirement: "confirmed",
        requiredReviewers: ["Designer", "Xingyu (PM)"],
        records: [reviewed("Designer")],
      }).status
    ).toBe("partially-reviewed")
    expect(
      deriveContentReviewStatus({
        currentSnapshot,
        blocked: false,
        explicitDecisionRequired: false,
        reviewerRequirement: "confirmed",
        requiredReviewers: ["Designer", "Xingyu (PM)"],
        records: [reviewed("Designer"), reviewed("Xingyu (PM)")],
      }).status
    ).toBe("reviewed-current")
  })

  it("keeps only roles without a current record in mixed reconfirmation", () => {
    const currentSnapshot = createReviewSnapshot({ copy: "Current" })
    const staleSnapshot = createReviewSnapshot({ copy: "Old" })

    expect(
      deriveContentReviewStatus({
        currentSnapshot,
        blocked: false,
        explicitDecisionRequired: false,
        reviewerRequirement: "confirmed",
        requiredReviewers: ["Designer", "Xingyu (PM)"],
        records: [
          {
            reviewerRole: "Designer",
            reviewedSnapshot: currentSnapshot,
            evidenceReference: "Decision channel: item 1",
          },
          {
            reviewerRole: "Xingyu (PM)",
            reviewedSnapshot: staleSnapshot,
            evidenceReference: "Decision channel: item 2",
          },
        ],
      })
    ).toMatchObject({
      status: "reconfirmation-required",
      remainingReviewers: ["Xingyu (PM)"],
    })
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
    expect(reordered.itemSnapshot).toBe(original.itemSnapshot)
    expect(reordered.iaOrderSnapshot).not.toBe(original.iaOrderSnapshot)
    expect(reordered.storySnapshot).not.toBe(original.storySnapshot)
  })

  it("binds every ordered internal content ID into IA without binding children to section items", () => {
    const result = buildReviewDraftProjection()
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const storyIndex = result.projection.sections.findIndex(
      (section) => section.kind === "connected-story"
    )
    const story = result.projection.sections[storyIndex]
    const reorderedStory = {
      ...story,
      entries: [story.entries[1], story.entries[0], ...story.entries.slice(2)],
    }
    const reorderedProjection = {
      ...result.projection,
      sections: result.projection.sections.map((section, index) =>
        index === storyIndex ? reorderedStory : section
      ),
    }

    const original = getReviewDraftSnapshots(
      result.projection,
      contentReviewManifest
    )
    const reordered = getReviewDraftSnapshots(
      reorderedProjection,
      contentReviewManifest
    )

    expect(original.iaOrderSnapshot).toBe(
      createReviewSnapshot(contentReviewRegistry.map((item) => item.contentId))
    )
    expect(reordered.byReference[story.reviewReference]).toBe(
      original.byReference[story.reviewReference]
    )
    for (const entry of story.entries) {
      expect(reordered.byReference[entry.reviewReference]).toBe(
        original.byReference[entry.reviewReference]
      )
    }
    expect(reordered.itemSnapshot).toBe(original.itemSnapshot)
    expect(reordered.iaOrderSnapshot).not.toBe(original.iaOrderSnapshot)
    expect(reordered.storySnapshot).not.toBe(original.storySnapshot)
  })

  it("binds a public capability-label-only change to the item and story snapshots", () => {
    const result = buildReviewDraftProjection()
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const changedProjection = {
      ...result.projection,
      sections: result.projection.sections.map((section) => ({
        ...section,
        entries: section.entries.map((entry) =>
          entry.kind === "content" &&
          entry.reviewReference === "TW-STORY-INSIGHTS"
            ? { ...entry, capabilityLabel: "Message drafting" }
            : entry
        ),
      })),
    }
    const original = getReviewDraftSnapshots(result.projection)
    const changed = getReviewDraftSnapshots(changedProjection)

    expect(changed.byReference["TW-STORY-INSIGHTS"]).not.toBe(
      original.byReference["TW-STORY-INSIGHTS"]
    )
    expect(changed.byReference["TW-STORY-NEXT-STEP"]).toBe(
      original.byReference["TW-STORY-NEXT-STEP"]
    )
    expect(changed.iaOrderSnapshot).toBe(original.iaOrderSnapshot)
    expect(changed.storySnapshot).not.toBe(original.storySnapshot)
  })

  it("binds decision-label-only edits to that item and the composed story", () => {
    const result = buildReviewDraftProjection()
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const changedProjection = {
      ...result.projection,
      sections: result.projection.sections.map((section) => ({
        ...section,
        entries: section.entries.map((entry) =>
          entry.kind === "decision" && entry.reviewReference === "TW-PROOF"
            ? { ...entry, reviewLabel: `${entry.reviewLabel} updated` }
            : entry
        ),
      })),
    }
    const original = getReviewDraftSnapshots(result.projection)
    const changed = getReviewDraftSnapshots(changedProjection)

    expect(changed.byReference["TW-PROOF"]).not.toBe(
      original.byReference["TW-PROOF"]
    )
    expect(changed.byReference["TW-SUPPORT"]).toBe(
      original.byReference["TW-SUPPORT"]
    )
    expect(changed.byReference["TW-SECTION-PROOF"]).toBe(
      original.byReference["TW-SECTION-PROOF"]
    )
    expect(changed.iaOrderSnapshot).toBe(original.iaOrderSnapshot)
    expect(changed.storySnapshot).not.toBe(original.storySnapshot)
  })

  it("uses validated aggregate records for current and stale artifact states", () => {
    const initial = buildContentReviewAnnotatedPageDto()
    expect(initial.kind).toBe("ready")
    if (initial.kind !== "ready") return

    const records = (
      reviewedSnapshot: string
    ): ReadonlyArray<{
      reviewerRole: "Designer" | "Xingyu (PM)"
      reviewedSnapshot: string
      evidenceReference: string
    }> => [
      {
        reviewerRole: "Designer",
        reviewedSnapshot,
        evidenceReference: "Decision channel: IA",
      },
      {
        reviewerRole: "Xingyu (PM)",
        reviewedSnapshot,
        evidenceReference: "Decision channel: PM",
      },
    ]

    const dto = buildContentReviewAnnotatedPageDto({
      artifactRecords: {
        "TW-IA-ORDER": records(initial.iaOrderSnapshot),
        "TW-STORY-COMPOSED": records(
          createReviewSnapshot({ stale: initial.storySnapshot })
        ),
      },
    })

    expect(dto.kind).toBe("ready")
    if (dto.kind !== "ready") return
    expect(dto.artifactReview.iaOrder.status).toBe("reviewed-current")
    expect(dto.artifactReview.composedStory.status).toBe(
      "reconfirmation-required"
    )
  })

  it("fails closed for invalid aggregate manifests and unknown confirmed reviewer roles", () => {
    expect(
      buildContentReviewPageDto({
        artifactManifest: contentReviewArtifactManifest.slice(1),
      }).kind
    ).toBe("error")

    const projection = buildReviewDraftProjection()
    expect(projection.ok).toBe(true)
    if (!projection.ok) return
    const snapshots = getReviewDraftSnapshots(projection.projection)
    const manifest = contentReviewManifest.map((item) =>
      item.reviewReference === "TW-CAP-POSTS"
        ? {
            ...item,
            reviewerRequirement: "confirmed" as const,
            requiredReviewers: ["External approver" as never],
            records: [
              {
                reviewerRole: "External approver" as never,
                reviewedSnapshot: snapshots.byReference["TW-CAP-POSTS"],
                evidenceReference: "Decision channel: external",
              },
            ],
          }
        : item
    )

    expect(buildContentReviewPageDto({ manifest }).kind).toBe("error")
  })

  it("combines landing and review readiness without claiming publishability", () => {
    const initial = getLandingPageV2CombinedReadiness()
    const landing = getLandingPageV2Readiness()

    expect(initial.landing.issues).toEqual(landing.issues)
    expect(initial.review.states).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reviewReference: "TW-PROOF",
          status: "decision-required",
        }),
      ])
    )
    expect(initial).not.toHaveProperty("publishable")

    const invalid = getLandingPageV2CombinedReadiness({
      manifest: contentReviewManifest.slice(1),
    })
    expect(invalid.review.errors.map((issue) => issue.code)).toContain(
      "manifest-coverage"
    )

    const projection = buildReviewDraftProjection()
    expect(projection.ok).toBe(true)
    if (!projection.ok) return
    const snapshots = getReviewDraftSnapshots(projection.projection)
    const withRecord = (reviewedSnapshot: string) =>
      contentReviewManifest.map((item) =>
        item.reviewReference === "TW-CAP-POSTS"
          ? {
              ...item,
              records: [
                {
                  reviewerRole: "Xingyu (PM)" as const,
                  reviewedSnapshot,
                  evidenceReference: "Decision channel: PM",
                },
              ],
            }
          : item
      )

    const current = getLandingPageV2CombinedReadiness({
      manifest: withRecord(snapshots.byReference["TW-CAP-POSTS"]),
    })
    expect(
      current.review.states.find(
        (state) => state.reviewReference === "TW-CAP-POSTS"
      )?.status
    ).toBe("reviewed-current")

    const stale = getLandingPageV2CombinedReadiness({
      manifest: withRecord(createReviewSnapshot({ old: true })),
    })
    expect(
      stale.review.states.find(
        (state) => state.reviewReference === "TW-CAP-POSTS"
      )?.status
    ).toBe("reconfirmation-required")
  })

  it("builds the internal annotated DTO used to derive review state", () => {
    const dto = buildContentReviewAnnotatedPageDto()

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

  it("projects a minimal wireframe DTO without review identifiers, snapshots, or destinations", () => {
    const dto = buildContentReviewPageDto()

    expect(dto.kind).toBe("ready")
    if (dto.kind !== "ready") return

    expect(dto.sections).toHaveLength(10)
    expect(dto.metadata.status).toBe("decision-required")
    expect(dto.appendix.proof.missingCapabilityLabels).toEqual([
      "Student Insights",
      "Message drafting",
      "Posts",
    ])

    const keys = collectObjectKeys(dto)
    for (const prohibitedKey of [
      "reviewReference",
      "contentKind",
      "review",
      "link",
      "href",
      "snapshot",
      "owner",
      "requiredReviewers",
      "remainingReviewers",
      "concerns",
      "sourceLabel",
      "blockers",
      "itemSnapshot",
      "iaOrderSnapshot",
      "storySnapshot",
      "artifactReview",
      "prohibitedData",
      "interfaceDescription",
      "interfaceBrief",
    ]) {
      expect(keys).not.toContain(prohibitedKey)
    }

    const serialised = JSON.stringify(dto).toLowerCase()
    for (const prohibitedValue of [
      "reviewreference",
      "contentkind",
      "itemsnapshot",
      "iaordersnapshot",
      "storysnapshot",
      "artifactreview",
      "v2-sha256",
      "tw-",
      "requiredreviewers",
      "remainingreviewers",
      "sourcelabel",
      "blockers",
      '"href"',
      "teacher.digital.moe.gov.sg",
      "go.gov.sg/teacherworkspace-feedback",
      "connected positive-growth view",
      "positive student profile",
    ]) {
      expect(serialised).not.toContain(prohibitedValue)
    }
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
    const dto = buildContentReviewPageDto({
      manifest: invalidManifest,
    })

    expect(dto).toEqual({ kind: "error" })
  })

  it("fails closed for landing structure errors outside the review projection", () => {
    const content = {
      ...landingPageV2Content,
      journey: [
        { ...landingPageV2Content.journey[0], order: 99 },
        ...landingPageV2Content.journey.slice(1),
      ] as unknown as typeof landingPageV2Content.journey,
    }

    expect(buildContentReviewPageDto({ content }).kind).toBe("error")
  })

  it("fails unknown reviewer requirements closed without inventing owners", () => {
    const dto = buildContentReviewAnnotatedPageDto({
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
