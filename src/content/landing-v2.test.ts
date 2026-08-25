import { readFileSync } from "node:fs"

import { describe, expect, expectTypeOf, it } from "vitest"

import {
  getLandingPageV2LaunchDecisions,
  getLandingPageV2Readiness,
  getLandingPageV2StructureIssues,
} from "./landing-v2-readiness"
import { landingDocuments } from "./landing-copy"
import {
  audienceIds,
  capabilityIds,
  landingPageV2Content,
  landingPageV2MeasurementPlan,
  landingPageV2Publication,
  proposedAiLayerMemberCapabilityIds,
} from "./landing-v2"

import type { HttpsUrl } from "@/config/site"
import type { LandingPageV2Candidate } from "./landing-v2-readiness"
import type {
  AudienceBlock,
  CapabilityId,
  LandingPageV2MeasurementPlan,
  LandingPageV2Publication,
  PrimaryCtaIntent,
  ProductExplorer,
  Testimonial,
} from "./landing-v2"
import { siteConfig } from "@/config/site"

const explorerComprehensionFlow = [
  "choose-scenario",
  "inspect-connected-context",
  "preview-resulting-action",
] as const

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

function publicCopyFields(): ReadonlyArray<string> {
  return [
    landingPageV2Content.seoDraft.title,
    landingPageV2Content.seoDraft.description,
    landingPageV2Content.hero.headline,
    landingPageV2Content.hero.body,
    ...landingPageV2Content.journey.flatMap((act) => [
      act.moment,
      act.headline,
      act.body,
    ]),
    landingPageV2Content.reveal.headline,
    landingPageV2Content.reveal.body,
    ...landingPageV2Content.capabilities.flatMap((capability) => [
      capability.publicLabel,
      capability.job,
      capability.scenario,
    ]),
    ...landingPageV2Content.audiences.flatMap((audience) => [audience.label]),
    ...landingPageV2Content.testimonials.flatMap((testimonial) => [
      testimonial.quote,
      testimonial.role,
      testimonial.schoolLevel,
    ]),
    ...landingPageV2Content.supportResources.map((resource) => resource.label),
    landingPageV2Content.close.headline,
    landingPageV2Content.close.body,
    landingPageV2Publication.primaryCta.label,
    landingPageV2Publication.primaryCta.accessNote,
  ]
}

const readyContent: LandingPageV2Candidate = {
  ...landingPageV2Content,
  editorialStatus: "approved",
  reveal: {
    ...landingPageV2Content.reveal,
    gaLaunchLine: "Teacher Workspace is now available.",
  },
  audiences: landingPageV2Content.audiences.map((audience) => ({
    ...audience,
    question: `What does ${audience.label} need?`,
    answer: "A clear answer for launch.",
  })),
  testimonials: landingPageV2Content.testimonials.map((testimonial, index) => ({
    ...testimonial,
    capabilityIds:
      index === 0
        ? (["student-insights", "hey-talia", "posts"] as const)
        : testimonial.capabilityIds,
    publicationApproved: true,
  })),
}

const readyPublication: LandingPageV2Publication = {
  ...landingPageV2Publication,
  canonicalUrl: "https://teacher.example.gov.sg",
  socialImageUrl: "https://teacher.example.gov.sg/social.png",
  contentApprovedBy: "Content owner",
  gaAudience: {
    ...landingPageV2Publication.gaAudience,
    status: "confirmed",
    confirmedBy: "Xingyu (PM)",
  },
  productClaimsApproval: {
    ...landingPageV2Publication.productClaimsApproval,
    status: "approved",
    approvedBy: "Xingyu (PM)",
  },
  syntheticDemoApproval: {
    ...landingPageV2Publication.syntheticDemoApproval,
    status: "approved",
    approvedBy: ["Designer", "Xingyu (PM)"],
  },
  support: {
    strategy: "pair-assistant",
    destinationUrl: "https://pair-assistant.example.gov.sg",
    owner: "Posts team",
    accessExplanation: "Available to authorised school staff.",
    approvedBy: "Support owner",
  },
}

describe("Landing Page v2 content contract", () => {
  it("keeps the five-act and four-capability structure coherent", () => {
    expect(getLandingPageV2StructureIssues()).toEqual([])
  })

  it("uses audited prototype moments without rejected claims", () => {
    const narrative = [
      landingPageV2Content.seoDraft.description,
      landingPageV2Content.hero.headline,
      landingPageV2Content.hero.body,
      ...landingPageV2Content.journey.flatMap((act) => [
        act.moment,
        act.headline,
        act.body,
      ]),
      landingPageV2Content.reveal.body,
      ...landingPageV2Content.capabilities.map(
        (capability) => capability.scenario
      ),
      landingPageV2Content.close.headline,
      landingPageV2Content.close.body,
    ].join("\n")
    const lowered = narrative.toLowerCase()

    expect(lowered).toContain("which families have read")
    // The public copy (headings and bodies) carries the CNT-4 illustrative
    // disclosure instead of wireframe-audit framing; the flag-gated
    // availability honesty lives in the internal slot labels, the screen
    // catalog (content/screens.mdx), and the decision record
    // (docs/decisions/ga-landing-page.md), never in marketing copy.
    const publicCopy = landingPageV2Content.journey
      .flatMap((act) => [act.headline, act.body])
      .join("\n")
      .toLowerCase()
    expect(publicCopy).not.toContain("release 2")
    expect(publicCopy).not.toContain("wireframe")
    expect(publicCopy).not.toContain("synthetic")
    expect(
      landingDocuments.story.text("syntheticNote").toLowerCase()
    ).toContain("synthetic")
    expect(
      readFileSync("content/screens.mdx", "utf8").toLowerCase()
    ).toContain("release 2 capability flag")

    for (const rejectedTerm of [
      "xiao ming",
      "bursary",
      "eligibility",
      "financial assistance",
      "offence",
      "counselling",
      "conduct grade",
      "application window",
      "circular",
    ]) {
      expect(lowered).not.toContain(rejectedTerm)
    }

    expect(landingPageV2Content.journey.map((act) => act.capabilityId)).toEqual(
      [null, ...capabilityIds]
    )
    expect(
      landingPageV2Content.journey.map((act) => act.editorialStatus)
    ).toEqual(["proposed", "proposed", "proposed", "proposed", "proposed"])
  })

  it("keeps the capability discovery layer in journey order", () => {
    expect(
      landingPageV2Content.capabilities.map((capability) => capability.id)
    ).toEqual(capabilityIds)
  })

  it("uses plain public labels while retaining internal capability IDs", () => {
    expect(
      landingPageV2Content.capabilities.map(
        (capability) => capability.publicLabel
      )
    ).toEqual([
      "Student Insights",
      "AI next-step guidance",
      "Message drafting",
      "Posts",
    ])

    expect(capabilityIds).toContain("contextual-intelligence")
    expect(capabilityIds).toContain("hey-talia")
    expect(
      landingPageV2Content.aiPlanning.specialistAgentDirection.agents[0]
        .capabilityId
    ).toBe("hey-talia")

    const publicCopy = publicCopyFields().join("\n")
    expect(publicCopy).not.toContain("Contextual Intelligence")
    expect(publicCopy).not.toContain("HeyTalia")
  })

  it.each(["Contextual Intelligence", "HeyTalia"] as const)(
    "rejects %s as a public capability label",
    (publicLabel) => {
      const candidate: LandingPageV2Candidate = {
        ...landingPageV2Content,
        capabilities: landingPageV2Content.capabilities.map(
          (capability, index) =>
            index === 1 ? { ...capability, publicLabel } : capability
        ),
      }

      expect(issueCodes(getLandingPageV2StructureIssues(candidate))).toContain(
        "public-capability-labels"
      )
    }
  )

  it("records the confirmed Google access contract on the existing product link", () => {
    expect(landingPageV2Publication.primaryCta).toEqual({
      label: "Sign in with Google",
      href: siteConfig.links.product,
      intent: "google-sign-in",
      identityProvider: "google",
      requiredAccountDomain: "edu.gov.sg",
      accessNote: "Use your @edu.gov.sg account.",
    })
    expect(issueCodes(getLandingPageV2LaunchDecisions())).not.toContain(
      "primary-cta"
    )
  })

  it("records the intended GA audience without treating owner assignment as confirmation", () => {
    expect(
      landingPageV2Content.audiences.map((audience) => ({
        id: audience.id,
        label: audience.label,
      }))
    ).toEqual([
      { id: "teachers", label: "Form Teachers" },
      { id: "key-personnel", label: "Key Personnel" },
      { id: "school-leaders", label: "School Leaders" },
    ])
    expect(landingPageV2Publication.gaAudience).toEqual({
      intendedAudienceIds: audienceIds,
      status: "pending-pm-confirmation",
      owner: "Xingyu (PM)",
      confirmedBy: null,
    })
    expect(issueCodes(getLandingPageV2LaunchDecisions())).toContain(
      "audience-confirmation"
    )
  })

  it("accepts the exact backend-free synthetic explorer flow", () => {
    expect(landingPageV2Content.productExplorer).toEqual({
      status: "accepted",
      format: "guided-key-screen-explorer",
      comprehensionFlow: explorerComprehensionFlow,
      capabilityIds,
      maxStepsToAnyCapability: 3,
      usesSyntheticDataOnly: true,
      requiresBackend: false,
      placement: null,
    })
  })

  it("accepts anonymous role-and-school-level proof without inventing school names", () => {
    expect(landingPageV2Publication.testimonialAttributionPolicy).toBe(
      "anonymous-role-and-school-level"
    )
    expect(landingPageV2Content.testimonials.length).toBeGreaterThan(0)

    for (const testimonial of landingPageV2Content.testimonials) {
      expect(testimonial.verbatim).toBe(true)
      expect(testimonial.sourceUrl).toBe(
        landingPageV2Content.sources.testimonialsComment
      )
      expect(testimonial.schoolName).toBeNull()
      expect(testimonial.publicationApproved).toBe(false)
    }

    const codes = issueCodes(getLandingPageV2LaunchDecisions())
    expect(codes).not.toContain("testimonial-school-names")
    expect(codes).toContain("testimonial-approval")
    // Required coverage is Posts only, which the verbatims already satisfy.
    expect(codes.some((code) => code.startsWith("testimonial-coverage-"))).toBe(
      false
    )
  })

  it("defines provider-neutral anonymous conversion and comprehension semantics", () => {
    expect(landingPageV2MeasurementPlan).toEqual({
      status: "pending-approval",
      providerStrategy: "provider-neutral",
      primary: {
        objective: "anonymous-sign-in-cta-conversion",
        event: "primary-cta-selected",
        owner: "marketing-surface",
        placements: ["hero", "close"],
        denominator: null,
      },
      secondary: {
        sectionReach: {
          event: "section-reached",
          owner: "marketing-surface",
          thresholds: null,
        },
        capabilityEngagement: {
          event: "capability-engaged",
          owner: "marketing-surface",
          definition: null,
        },
      },
      analyticsOwner: null,
      reportingCadence: null,
      payloadPolicy: {
        anonymousOnly: true,
        allowlistedFields: ["anonymous-session-id", "placement"],
        prohibitedFields: [
          "student-data",
          "testimonial-text",
          "teacher-email",
          "account-identifier",
        ],
      },
      marketingImplementationBoundary: "contract-only",
    })

    expect(JSON.stringify(landingPageV2MeasurementPlan)).not.toMatch(
      /Google Analytics|Mixpanel|Amplitude|Segment/
    )
  })

  it("keeps OAuth and analytics runtimes outside the content module", () => {
    const source = readFileSync("src/content/landing-v2.ts", "utf8")
    const imported = Array.from(
      source.matchAll(/^import\s[^;]*?from\s+"([^"]+)"/gm)
    ).map(([, specifier]) => specifier)

    expect(imported).toEqual([
      "./landing-copy",
      "@/config/site",
      "@/config/site",
    ])
    expect(source).not.toMatch(/OAuth|analytics SDK|createAuth|track\(/)
    expect(landingPageV2MeasurementPlan.marketingImplementationBoundary).toBe(
      "contract-only"
    )
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
      name: "explorer comprehension flow is out of order",
      code: "product-explorer-flow",
      candidate: {
        ...landingPageV2Content,
        productExplorer: {
          ...landingPageV2Content.productExplorer,
          comprehensionFlow: [...explorerComprehensionFlow].reverse(),
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
    ["a missing capability", capabilityIds.slice(0, -1)],
    ["an extra capability", [...capabilityIds, "student-insights"]],
    [
      "a duplicate capability",
      ["student-insights", "contextual-intelligence", "hey-talia", "hey-talia"],
    ],
  ] satisfies ReadonlyArray<readonly [string, ReadonlyArray<CapabilityId>]>)(
    "rejects $0 after the product explorer is accepted",
    (_name, productExplorerCapabilityIds) => {
      const candidate: LandingPageV2Candidate = {
        ...landingPageV2Content,
        productExplorer: {
          ...landingPageV2Content.productExplorer,
          capabilityIds: productExplorerCapabilityIds,
        },
      }

      expect(issueCodes(getLandingPageV2StructureIssues(candidate))).toContain(
        "product-explorer-capabilities"
      )
    }
  )

  it("allows an accepted product explorer to choose its own capability order", () => {
    const candidate: LandingPageV2Candidate = {
      ...landingPageV2Content,
      productExplorer: {
        ...landingPageV2Content.productExplorer,
        capabilityIds: [...capabilityIds].reverse(),
      },
    }

    expect(
      issueCodes(getLandingPageV2StructureIssues(candidate))
    ).not.toContain("product-explorer-capabilities")
  })

  it("allows the product explorer to be declined", () => {
    const candidate: LandingPageV2Candidate = {
      ...landingPageV2Content,
      productExplorer: {
        status: "not-pursued",
      },
    }

    expect(getLandingPageV2StructureIssues(candidate)).toEqual([])
  })

  it("keeps every genuinely unresolved publication decision visible", () => {
    const codes = issueCodes(getLandingPageV2LaunchDecisions())

    // release-copy cleared on 2026-08-07: GA positioning confirmed and the
    // launch line filled as proposed copy.
    expect(codes).toEqual([
      "content-approval",
      "canonical-url",
      "social-image",
      "audience-confirmation",
      "product-claims",
      "synthetic-demo-approval",
      "testimonial-approval",
      "support-strategy",
    ])
    expect(codes).not.toContain("primary-cta")
    expect(codes).not.toContain("student-scenario")
    expect(codes).not.toContain("testimonial-school-names")
    expect(getLandingPageV2Readiness().ready).toBe(false)
  })

  it.each([
    {
      name: "a blank CTA label",
      patch: { label: "   " },
    },
    {
      name: "a different CTA URL",
      patch: { href: "https://teacher.example.gov.sg/app" },
    },
    {
      name: "a missing Google identity provider",
      patch: { identityProvider: null },
    },
    {
      name: "a missing account domain",
      patch: { requiredAccountDomain: null },
    },
    {
      name: "a blank access note",
      patch: { accessNote: "   " },
    },
  ] satisfies ReadonlyArray<{
    readonly name: string
    readonly patch: Partial<LandingPageV2Publication["primaryCta"]>
  }>)("rejects $name", ({ patch }) => {
    const publication: LandingPageV2Publication = {
      ...readyPublication,
      primaryCta: {
        ...readyPublication.primaryCta,
        ...patch,
      },
    }

    expect(
      issueCodes(getLandingPageV2LaunchDecisions(readyContent, publication))
    ).toContain("primary-cta")
  })

  it("does not mistake the PM owner for GA audience confirmation", () => {
    const ownerOnly: LandingPageV2Publication = {
      ...readyPublication,
      gaAudience: {
        ...readyPublication.gaAudience,
        status: "pending-pm-confirmation",
        confirmedBy: null,
      },
    }
    const statusWithoutRecord: LandingPageV2Publication = {
      ...readyPublication,
      gaAudience: {
        ...readyPublication.gaAudience,
        status: "confirmed",
        confirmedBy: "   ",
      },
    }

    expect(
      issueCodes(getLandingPageV2LaunchDecisions(readyContent, ownerOnly))
    ).toContain("audience-confirmation")
    expect(
      issueCodes(
        getLandingPageV2LaunchDecisions(readyContent, statusWithoutRecord)
      )
    ).toContain("audience-confirmation")
  })

  it("does not mistake the product-claim owner for recorded approval", () => {
    const ownerOnly: LandingPageV2Publication = {
      ...readyPublication,
      productClaimsApproval: {
        owner: "Xingyu (PM)",
        status: "pending-approval",
        approvedBy: null,
      },
    }
    const statusWithoutRecord: LandingPageV2Publication = {
      ...readyPublication,
      productClaimsApproval: {
        owner: "Xingyu (PM)",
        status: "approved",
        approvedBy: "   ",
      },
    }

    expect(
      issueCodes(getLandingPageV2LaunchDecisions(readyContent, ownerOnly))
    ).toContain("product-claims")
    expect(
      issueCodes(
        getLandingPageV2LaunchDecisions(readyContent, statusWithoutRecord)
      )
    ).toContain("product-claims")
  })

  it("requires recorded approval from both synthetic-demo owners", () => {
    const ownerOnly: LandingPageV2Publication = {
      ...readyPublication,
      syntheticDemoApproval: {
        owners: ["Designer", "Xingyu (PM)"],
        status: "pending-approval",
        approvedBy: [],
      },
    }
    const oneRecordedApproval: LandingPageV2Publication = {
      ...readyPublication,
      syntheticDemoApproval: {
        owners: ["Designer", "Xingyu (PM)"],
        status: "approved",
        approvedBy: ["Designer"],
      },
    }

    expect(
      issueCodes(getLandingPageV2LaunchDecisions(readyContent, ownerOnly))
    ).toContain("synthetic-demo-approval")
    expect(
      issueCodes(
        getLandingPageV2LaunchDecisions(readyContent, oneRecordedApproval)
      )
    ).toContain("synthetic-demo-approval")
  })

  it("uses public capability labels in testimonial coverage decisions", () => {
    // The verbatims all cover Posts, so required coverage is satisfied and no
    // coverage decision fires; see docs/adr/0003-publish-the-proof-we-have.md.
    const coverageDecisions = getLandingPageV2LaunchDecisions().filter(
      (decision) => decision.code.startsWith("testimonial-coverage-")
    )

    expect(coverageDecisions).toEqual([])

    // A candidate without Posts coverage still names the public label.
    const withoutPosts: LandingPageV2Candidate = {
      ...landingPageV2Content,
      testimonials: landingPageV2Content.testimonials.map((testimonial) => ({
        ...testimonial,
        capabilityIds: ["student-insights"],
      })),
    }
    const missingCoverage = getLandingPageV2LaunchDecisions(
      withoutPosts,
      landingPageV2Publication
    ).filter((decision) => decision.code.startsWith("testimonial-coverage-"))

    expect(missingCoverage.map((decision) => decision.message)).toEqual([
      "Provide an approved testimonial covering Posts.",
    ])
    expect(
      missingCoverage.map((decision) => decision.message).join(" ")
    ).not.toContain("hey-talia")
  })

  it.each([
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
    {
      name: "an unapproved testimonial",
      code: "testimonial-approval",
      content: withFirstTestimonial({ publicationApproved: false }),
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

  it("keeps Teacher Workspace as the sole public brand for AI capabilities", () => {
    expect(landingPageV2Content.aiPlanning).toEqual({
      brandArchitecture: {
        status: "approved",
        publicBrand: "Teacher Workspace",
        capabilityTreatment: "product-capabilities",
        dedicatedAiLayerBrand: false,
      },
      surfaceModel: {
        status: "confirmed",
        embedded: true,
        destination: true,
        primarySurfaceDecision: {
          status: "undecided",
          value: null,
        },
      },
      futureDirection: {
        status: "working-hypothesis",
        model: "shared-ai-capability-and-agent-layer",
        proposedMemberCapabilityIds: proposedAiLayerMemberCapabilityIds,
      },
      specialistAgentDirection: {
        status: "working-hypothesis",
        agents: [
          {
            capabilityId: "hey-talia",
            role: "document-drafting",
            dedicatedBrand: false,
          },
        ],
      },
      teacherControl: {
        status: "working-hypothesis",
        outputs: "teacher-reviewable",
      },
    })
    expect(issueCodes(getLandingPageV2LaunchDecisions())).not.toContain(
      "ga-ai-presentation"
    )
  })

  it("accepts a fully resolved candidate under the current contract", () => {
    expect(getLandingPageV2Readiness(readyContent, readyPublication)).toEqual({
      ready: true,
      issues: [],
    })
  })

  it("retains readonly literal publication and measurement metadata", () => {
    expectTypeOf(
      landingPageV2Publication
    ).toMatchTypeOf<LandingPageV2Publication>()
    expectTypeOf(
      landingPageV2MeasurementPlan
    ).toMatchTypeOf<LandingPageV2MeasurementPlan>()
    expectTypeOf<PrimaryCtaIntent>().toEqualTypeOf<"google-sign-in">()
    expectTypeOf(
      landingPageV2Publication.releasePositioning
    ).toEqualTypeOf<"ga">()
    expectTypeOf(
      landingPageV2Publication.primaryCta.intent
    ).toEqualTypeOf<"google-sign-in">()
    expectTypeOf(
      landingPageV2Publication.primaryCta.requiredAccountDomain
    ).toEqualTypeOf<"edu.gov.sg">()
    expectTypeOf(
      landingPageV2Publication.gaAudience.intendedAudienceIds
    ).toEqualTypeOf<readonly ["teachers", "key-personnel", "school-leaders"]>()
    expectTypeOf(
      landingPageV2Publication.syntheticDemoApproval.owners
    ).toEqualTypeOf<readonly ["Designer", "Xingyu (PM)"]>()
    expectTypeOf(
      landingPageV2Publication.testimonialCoverageRequired
    ).toEqualTypeOf<readonly ["posts"]>()
    expectTypeOf(proposedAiLayerMemberCapabilityIds).toEqualTypeOf<
      readonly ["contextual-intelligence", "hey-talia"]
    >()
    expectTypeOf(
      landingPageV2Content.productExplorer
    ).toMatchTypeOf<ProductExplorer>()
    expectTypeOf(
      landingPageV2Content.productExplorer.comprehensionFlow
    ).toEqualTypeOf<
      readonly [
        "choose-scenario",
        "inspect-connected-context",
        "preview-resulting-action",
      ]
    >()
    expectTypeOf(landingPageV2MeasurementPlan.primary.placements).toEqualTypeOf<
      readonly ["hero", "close"]
    >()
    expectTypeOf(
      landingPageV2MeasurementPlan.payloadPolicy.allowlistedFields
    ).toEqualTypeOf<readonly ["anonymous-session-id", "placement"]>()
  })
})
