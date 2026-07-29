import { describe, expect, expectTypeOf, it } from "vitest"

import {
  getLandingPageV2LaunchDecisions,
  getLandingPageV2Readiness,
  getLandingPageV2StructureIssues,
} from "./landing-v2-readiness"
import {
  capabilityIds,
  landingPageV2Content,
  landingPageV2Publication,
  proposedAiLayerMemberCapabilityIds,
} from "./landing-v2"

import type { HttpsUrl } from "@/config/site"
import type { LandingPageV2Candidate } from "./landing-v2-readiness"
import type {
  AudienceBlock,
  CapabilityId,
  LandingPageV2Publication,
  Testimonial,
} from "./landing-v2"

function issueCodes(
  issues: ReturnType<typeof getLandingPageV2StructureIssues>
): ReadonlyArray<string> {
  return issues.map((issue) => issue.code)
}

function withFirstAudience(
  patch: Partial<AudienceBlock>
): LandingPageV2Candidate {
  return {
    ...readyContent,
    audiences: readyContent.audiences.map((audience, index) =>
      index === 0 ? { ...audience, ...patch } : audience
    ),
  }
}

function withFirstTestimonial(
  patch: Partial<Testimonial>
): LandingPageV2Candidate {
  return {
    ...readyContent,
    testimonials: readyContent.testimonials.map((testimonial, index) =>
      index === 0 ? { ...testimonial, ...patch } : testimonial
    ),
  }
}

const readyContent: LandingPageV2Candidate = {
  ...landingPageV2Content,
  editorialStatus: "approved",
  reveal: {
    ...landingPageV2Content.reveal,
    gaLaunchLine: "Teacher Workspace is now available.",
  },
  aiPlanning: {
    ...landingPageV2Content.aiPlanning,
    gaPresentationDecision: {
      status: "approved",
      presentation: "shared-ai-layer",
      publicName: "Example approved AI layer name",
    },
  },
  audiences: landingPageV2Content.audiences.map((audience) => ({
    ...audience,
    question: `What does ${audience.label} need?`,
    answer: "A clear, launch-ready answer.",
  })),
  testimonials: landingPageV2Content.testimonials.map(
    (testimonial, index) => ({
      ...testimonial,
      schoolName: "Example School",
      capabilityIds:
        index === 0
          ? ([
              "student-insights",
              "hey-talia",
              "posts",
            ] as const)
          : testimonial.capabilityIds,
      publicationApproved: true,
    })
  ),
}

const readyPublication: LandingPageV2Publication = {
  releasePositioning: "ga",
  primaryCta: {
    label: "Open Teacher Workspace",
    href: "https://teacher.example.gov.sg/app",
    intent: "open-restricted-product",
  },
  canonicalUrl: "https://teacher.example.gov.sg",
  socialImageUrl: "https://teacher.example.gov.sg/social.png",
  contentApprovedBy: "Content owner",
  claimsApprovedBy: "Product owner",
  studentScenarioApprovedBy: "Privacy reviewer",
  testimonialCoverageRequired: [
    "student-insights",
    "hey-talia",
    "posts",
  ],
  support: {
    strategy: "pair-assistant",
    destinationUrl: "https://pair-assistant.example.gov.sg",
    owner: "Posts team",
    accessExplanation: "Available to authorised school staff.",
    approvedBy: "Support owner",
  },
}

describe("Landing Page v2 content contract", () => {
  it("keeps the proposed five-act and four-capability structure coherent", () => {
    expect(getLandingPageV2StructureIssues()).toEqual([])
  })

  it("keeps the capability discovery layer in journey order", () => {
    expect(
      landingPageV2Content.capabilities.map((capability) => capability.id)
    ).toEqual(capabilityIds)
  })

  it("uses Posts as the canonical capability identity and public name", () => {
    expect(
      landingPageV2Content.capabilities.find(
        (capability) => capability.id === "posts"
      )
    ).toMatchObject({
      id: "posts",
      name: "Posts",
      anchorId: "posts",
    })
  })

  it("retains testimonial provenance without pretending approval or school names exist", () => {
    expect(landingPageV2Content.testimonials.length).toBeGreaterThan(0)
    for (const testimonial of landingPageV2Content.testimonials) {
      expect(testimonial.verbatim).toBe(true)
      expect(testimonial.sourceUrl).toBe(
        landingPageV2Content.sources.testimonialsComment
      )
      expect(testimonial.schoolName).toBeNull()
      expect(testimonial.publicationApproved).toBe(false)
    }
  })

  it.each([
    {
      name: "journey IDs are out of order",
      code: "journey-order",
      candidate: {
        ...landingPageV2Content,
        journey: landingPageV2Content.journey.map((act, index) => {
          if (index === 0) return { ...act, id: "notice" as const }
          if (index === 1) return { ...act, id: "promise" as const }
          return act
        }),
      },
    },
    {
      name: "journey numbering is out of order",
      code: "journey-numbering",
      candidate: {
        ...landingPageV2Content,
        journey: landingPageV2Content.journey.map((act, index) => {
          if (index === 0) return { ...act, order: 2 as const }
          if (index === 1) return { ...act, order: 1 as const }
          return act
        }),
      },
    },
    {
      name: "the null capability slot shifts away from act one",
      code: "journey-capabilities",
      candidate: {
        ...landingPageV2Content,
        journey: landingPageV2Content.journey.map((act, index) => {
          if (index === 0) {
            return { ...act, capabilityId: "student-insights" as const }
          }
          if (index === 1) return { ...act, capabilityId: null }
          return act
        }),
      },
    },
    {
      name: "capability cards are out of order",
      code: "capability-order",
      candidate: {
        ...landingPageV2Content,
        capabilities: landingPageV2Content.capabilities.map(
          (capability, index, capabilities) => {
            if (index === 0) return capabilities[1]
            if (index === 1) return capabilities[0]
            return capability
          }
        ),
      },
    },
    {
      name: "capability anchors are duplicated",
      code: "capability-anchors",
      candidate: {
        ...landingPageV2Content,
        capabilities: landingPageV2Content.capabilities.map(
          (capability, index) =>
            index === 1
              ? {
                  ...capability,
                  anchorId: landingPageV2Content.capabilities[0].anchorId,
                }
              : capability
        ),
      },
    },
    {
      name: "AI layer members are out of order",
      code: "ai-layer-members",
      candidate: {
        ...landingPageV2Content,
        aiPlanning: {
          ...landingPageV2Content.aiPlanning,
          futureDirection: {
            ...landingPageV2Content.aiPlanning.futureDirection,
            proposedMemberCapabilityIds: [
              "hey-talia",
              "contextual-intelligence",
            ],
          },
        },
      },
    },
    {
      name: "audience blocks are out of order",
      code: "audience-order",
      candidate: {
        ...landingPageV2Content,
        audiences: landingPageV2Content.audiences.map(
          (audience, index, audiences) => {
            if (index === 0) return audiences[1]
            if (index === 1) return audiences[0]
            return audience
          }
        ),
      },
    },
    {
      name: "testimonial provenance is malformed",
      code: "testimonial-provenance",
      candidate: {
        ...landingPageV2Content,
        testimonials: landingPageV2Content.testimonials.map(
          (testimonial, index) =>
            index === 0
              ? {
                  ...testimonial,
                  sourceUrl: "https://" as HttpsUrl,
                }
              : testimonial
        ),
      },
    },
  ] satisfies ReadonlyArray<{
    readonly name: string
    readonly code: string
    readonly candidate: LandingPageV2Candidate
  }>)("rejects $name", ({ candidate, code }) => {
    expect(() => getLandingPageV2StructureIssues(candidate)).not.toThrow()
    expect(issueCodes(getLandingPageV2StructureIssues(candidate))).toContain(
      code
    )
  })

  it.each([
    ["a missing member", ["contextual-intelligence"]],
    [
      "an extra member",
      ["contextual-intelligence", "hey-talia", "student-insights"],
    ],
    [
      "a duplicate member",
      ["contextual-intelligence", "contextual-intelligence"],
    ],
  ] satisfies ReadonlyArray<readonly [string, ReadonlyArray<CapabilityId>]>)(
    "rejects $0 in the proposed AI-layer membership",
    (_name, proposedMemberCapabilityIds) => {
      const candidate: LandingPageV2Candidate = {
        ...landingPageV2Content,
        aiPlanning: {
          ...landingPageV2Content.aiPlanning,
          futureDirection: {
            ...landingPageV2Content.aiPlanning.futureDirection,
            proposedMemberCapabilityIds,
          },
        },
      }

      expect(
        issueCodes(getLandingPageV2StructureIssues(candidate))
      ).toContain("ai-layer-members")
    }
  )

  it("keeps the validator baseline isolated from in-place candidate mutation", () => {
    const proposedMemberCapabilityIds: Array<CapabilityId> = [
      ...proposedAiLayerMemberCapabilityIds,
    ]
    const candidate: LandingPageV2Candidate = {
      ...landingPageV2Content,
      aiPlanning: {
        ...landingPageV2Content.aiPlanning,
        futureDirection: {
          ...landingPageV2Content.aiPlanning.futureDirection,
          proposedMemberCapabilityIds,
        },
      },
    }

    proposedMemberCapabilityIds.reverse()

    expect(Object.isFrozen(proposedAiLayerMemberCapabilityIds)).toBe(true)
    expect(
      landingPageV2Content.aiPlanning.futureDirection
        .proposedMemberCapabilityIds
    ).not.toBe(proposedAiLayerMemberCapabilityIds)
    expect(issueCodes(getLandingPageV2StructureIssues(candidate))).toContain(
      "ai-layer-members"
    )
  })

  it("fails launch readiness loudly on the ticket's unresolved decisions", () => {
    const codes = getLandingPageV2LaunchDecisions().map(
      (decision) => decision.code
    )

    expect(codes).toEqual(
      expect.arrayContaining([
        "release-copy",
        "ga-ai-presentation",
        "content-approval",
        "primary-cta",
        "canonical-url",
        "social-image",
        "product-claims",
        "student-scenario",
        "testimonial-coverage-student-insights",
        "testimonial-coverage-hey-talia",
        "testimonial-school-names",
        "testimonial-approval",
        "audience-copy",
        "support-strategy",
      ])
    )
    expect(getLandingPageV2Readiness().ready).toBe(false)
  })

  it.each([
    {
      name: "a blank CTA label",
      code: "primary-cta",
      content: readyContent,
      publication: {
        ...readyPublication,
        primaryCta: { ...readyPublication.primaryCta, label: "   " },
      },
    },
    {
      name: "a malformed CTA URL",
      code: "primary-cta",
      content: readyContent,
      publication: {
        ...readyPublication,
        primaryCta: {
          ...readyPublication.primaryCta,
          href: "https://",
        },
      },
    },
    {
      name: "a malformed canonical URL",
      code: "canonical-url",
      content: readyContent,
      publication: {
        ...readyPublication,
        canonicalUrl: "https://",
      },
    },
    {
      name: "a malformed social image URL",
      code: "social-image",
      content: readyContent,
      publication: {
        ...readyPublication,
        socialImageUrl: "https://",
      },
    },
    {
      name: "a blank content approver",
      code: "content-approval",
      content: readyContent,
      publication: { ...readyPublication, contentApprovedBy: "   " },
    },
    {
      name: "a blank claims approver",
      code: "product-claims",
      content: readyContent,
      publication: { ...readyPublication, claimsApprovedBy: "   " },
    },
    {
      name: "a blank student-scenario approver",
      code: "student-scenario",
      content: readyContent,
      publication: {
        ...readyPublication,
        studentScenarioApprovedBy: "   ",
      },
    },
    {
      name: "a blank testimonial school",
      code: "testimonial-school-names",
      content: withFirstTestimonial({ schoolName: "   " }),
      publication: readyPublication,
    },
    {
      name: "a blank audience question",
      code: "audience-copy",
      content: withFirstAudience({ question: "   " }),
      publication: readyPublication,
    },
    {
      name: "a blank audience answer",
      code: "audience-copy",
      content: withFirstAudience({ answer: "   " }),
      publication: readyPublication,
    },
  ] satisfies ReadonlyArray<{
    readonly name: string
    readonly code: string
    readonly content: LandingPageV2Candidate
    readonly publication: LandingPageV2Publication
  }>)("rejects $name", ({ code, content, publication }) => {
    expect(() =>
      getLandingPageV2LaunchDecisions(content, publication)
    ).not.toThrow()
    expect(
      issueCodes(getLandingPageV2LaunchDecisions(content, publication))
    ).toContain(code)
  })

  it("requires complete support governance after a strategy is selected", () => {
    const publication: LandingPageV2Publication = {
      ...readyPublication,
      support: {
        ...readyPublication.support,
        destinationUrl: null,
        owner: "   ",
      },
    }

    expect(
      issueCodes(getLandingPageV2LaunchDecisions(readyContent, publication))
    ).toContain("support-details")
  })

  it.each([null, "   "] as const)(
    "blocks GA release when GA copy is %j",
    (gaLaunchLine) => {
      const content: LandingPageV2Candidate = {
        ...readyContent,
        reveal: {
          ...readyContent.reveal,
          gaLaunchLine,
        },
      }

      expect(
        issueCodes(getLandingPageV2LaunchDecisions(content, readyPublication))
      ).toContain("release-copy")
    }
  )

  it("keeps draft content blocked even when an approver is present", () => {
    const content: LandingPageV2Candidate = {
      ...readyContent,
      editorialStatus: "draft",
    }

    expect(
      issueCodes(getLandingPageV2LaunchDecisions(content, readyPublication))
    ).toContain("content-approval")
  })

  it("keeps individual names inside a provisional shared AI-layer direction", () => {
    expect(landingPageV2Content.aiPlanning).toEqual({
      futureDirection: {
        status: "working-hypothesis",
        model: "shared-ai-capability-and-agent-layer",
        proposedMemberCapabilityIds: proposedAiLayerMemberCapabilityIds,
      },
      gaPresentationDecision: {
        status: "unresolved",
        presentation: null,
        publicName: null,
      },
    })
    expect(
      proposedAiLayerMemberCapabilityIds.map(
        (capabilityId) =>
          landingPageV2Content.capabilities.find(
            (capability) => capability.id === capabilityId
          )?.name
        )
    ).toEqual(["Contextual Intelligence", "HeyTalia"])
    expect(
      issueCodes(
        getLandingPageV2LaunchDecisions(
          landingPageV2Content,
          landingPageV2Publication
        )
      )
    ).toContain("ga-ai-presentation")
  })

  it.each(["   ", "\u200B"])(
    "rejects an approved shared AI layer with an invisible public name",
    (publicName) => {
      const content: LandingPageV2Candidate = {
        ...readyContent,
        aiPlanning: {
          ...readyContent.aiPlanning,
          gaPresentationDecision: {
            status: "approved",
            presentation: "shared-ai-layer",
            publicName,
          },
        },
      }

      expect(
        issueCodes(getLandingPageV2LaunchDecisions(content, readyPublication))
      ).toContain("ga-ai-presentation")
    }
  )

  it("allows the current individual names as an approved GA presentation", () => {
    const content: LandingPageV2Candidate = {
      ...readyContent,
      aiPlanning: {
        ...readyContent.aiPlanning,
        gaPresentationDecision: {
          status: "approved",
          presentation: "individual-capabilities",
          publicName: null,
        },
      },
    }

    expect(getLandingPageV2Readiness(content, readyPublication)).toEqual({
      ready: true,
      issues: [],
    })
  })

  it("accepts a fully resolved candidate under the current contract", () => {
    expect(getLandingPageV2Readiness(readyContent, readyPublication)).toEqual({
      ready: true,
      issues: [],
    })
  })

  it("retains readonly literal publication metadata", () => {
    expectTypeOf(landingPageV2Publication).toMatchTypeOf<LandingPageV2Publication>()
    expectTypeOf(
      landingPageV2Publication.releasePositioning
    ).toEqualTypeOf<"ga">()
    expectTypeOf(
      landingPageV2Publication.testimonialCoverageRequired
    ).toEqualTypeOf<
      readonly ["student-insights", "hey-talia", "posts"]
    >()
    expectTypeOf(proposedAiLayerMemberCapabilityIds).toEqualTypeOf<
      readonly ["contextual-intelligence", "hey-talia"]
    >()
    expectTypeOf(
      landingPageV2Content.aiPlanning.futureDirection
        .proposedMemberCapabilityIds
    ).toEqualTypeOf<
      readonly ["contextual-intelligence", "hey-talia"]
    >()
  })

  it("does not silently point an unresolved v2 CTA at the restricted app", () => {
    expect(landingPageV2Publication.primaryCta).toEqual({
      label: null,
      href: null,
      intent: null,
    })
  })
})
