import {
  itemCopy,
  itemLabel,
  landingDocuments,
  optionalItemCopy,
} from "./landing-copy"

import type { HttpsUrl } from "@/config/site"
import { siteConfig } from "@/config/site"

export const capabilityIds = [
  "student-insights",
  "contextual-intelligence",
  "hey-talia",
  "posts",
] as const

export type CapabilityId = (typeof capabilityIds)[number]

export const proposedAiLayerMemberCapabilityIds = Object.freeze([
  "contextual-intelligence",
  "hey-talia",
] as const) satisfies ReadonlyArray<CapabilityId>

export const journeyActIds = [
  "promise",
  "notice",
  "next-steps",
  "words",
  "family-and-record",
] as const

export type JourneyActId = (typeof journeyActIds)[number]

export const audienceIds = [
  "teachers",
  "key-personnel",
  "school-leaders",
] as const

export type AudienceId = (typeof audienceIds)[number]

/**
 * The accepted three-step explorer remains a product decision, but it has no
 * slot on the GA page: the five-act journey and the capability cards already
 * carry comprehension, and a third layer diluted both. `placement: null` now
 * means "off the page until a future milestone", not "position undecided".
 * See docs/adr/0002-cut-the-product-explorer-from-the-ga-page.md.
 */
export const productExplorerComprehensionFlow = [
  "choose-scenario",
  "inspect-connected-context",
  "preview-resulting-action",
] as const

export type ProductExplorerComprehensionStep =
  (typeof productExplorerComprehensionFlow)[number]

type EditorialStatus = "proposed" | "verbatim"
export type SupportStrategy =
  | "resource-centre"
  | "pair-assistant"
  | "human-support"

export type JourneyAct = {
  readonly id: JourneyActId
  readonly order: 1 | 2 | 3 | 4 | 5
  readonly moment: string
  readonly headline: string
  readonly body: string
  readonly capabilityId: CapabilityId | null
  readonly editorialStatus: EditorialStatus
}

export type CapabilityCard = {
  readonly id: CapabilityId
  readonly publicLabel: string
  readonly job: string
  readonly scenario: string
  readonly anchorId: string
  readonly editorialStatus: EditorialStatus
}

export type AiPlanning = {
  readonly brandArchitecture: {
    readonly status: "approved"
    readonly publicBrand: "Teacher Workspace"
    readonly capabilityTreatment: "product-capabilities"
    readonly dedicatedAiLayerBrand: false
  }
  readonly surfaceModel: {
    readonly status: "confirmed"
    readonly embedded: true
    readonly destination: true
    readonly primarySurfaceDecision: {
      readonly status: "undecided"
      readonly value: null
    }
  }
  readonly futureDirection: {
    readonly status: "working-hypothesis"
    readonly model: "shared-ai-capability-and-agent-layer"
    readonly proposedMemberCapabilityIds: ReadonlyArray<CapabilityId>
  }
  readonly specialistAgentDirection: {
    readonly status: "working-hypothesis"
    readonly agents: readonly [
      {
        readonly capabilityId: "hey-talia"
        readonly role: "document-drafting"
        readonly dedicatedBrand: false
      },
    ]
  }
  readonly teacherControl: {
    readonly status: "working-hypothesis"
    readonly outputs: "teacher-reviewable"
  }
}

export type ProductExplorer =
  | {
      readonly status: "proposed" | "accepted"
      readonly format: "guided-key-screen-explorer"
      readonly comprehensionFlow: ReadonlyArray<ProductExplorerComprehensionStep>
      readonly capabilityIds: ReadonlyArray<CapabilityId>
      readonly maxStepsToAnyCapability: 3
      readonly usesSyntheticDataOnly: true
      readonly requiresBackend: false
      readonly placement: null
    }
  | {
      readonly status: "not-pursued"
    }

export type AudienceBlock = {
  readonly id: AudienceId
  readonly label: string
  readonly question: string | null
  readonly answer: string | null
}

export type Testimonial = {
  readonly id: string
  readonly quote: string
  readonly role: string
  readonly schoolLevel: "Primary School" | "Secondary School"
  readonly schoolName: string | null
  readonly capabilityIds: ReadonlyArray<CapabilityId>
  readonly sourceUrl: HttpsUrl
  readonly verbatim: true
  readonly publicationApproved: boolean
}

export type SupportResource = {
  readonly id:
    | "parent-gateway-resource-centre"
    | "pair-assistant"
    | "support-bot"
  readonly label: string
  readonly href: HttpsUrl | null
  readonly availability: "available-restricted" | "url-required" | "in-progress"
  readonly publicLinkDecision: "required"
}

export type LandingPageV2Content = {
  readonly version: 2
  readonly editorialStatus: "draft" | "approved"
  readonly sources: {
    readonly ticket: HttpsUrl
    readonly directionComment: HttpsUrl
    readonly testimonialsComment: HttpsUrl
    readonly bursaryExampleComment: HttpsUrl
  }
  readonly seoDraft: {
    readonly title: string
    readonly description: string
  }
  readonly hero: {
    readonly eyebrow: string | null
    readonly headline: string
    readonly body: string
    readonly ctaPlacements: readonly ["hero", "close"]
  }
  readonly journey: readonly [
    JourneyAct,
    JourneyAct,
    JourneyAct,
    JourneyAct,
    JourneyAct,
  ]
  readonly reveal: {
    readonly headline: string
    readonly body: string
    readonly gaLaunchLine: string | null
    readonly editorialStatus: EditorialStatus
  }
  readonly capabilities: readonly [
    CapabilityCard,
    CapabilityCard,
    CapabilityCard,
    CapabilityCard,
  ]
  readonly aiPlanning: AiPlanning
  readonly productExplorer: ProductExplorer
  readonly audiences: readonly [AudienceBlock, AudienceBlock, AudienceBlock]
  readonly testimonials: ReadonlyArray<Testimonial>
  readonly supportResources: readonly [
    SupportResource,
    SupportResource,
    SupportResource,
  ]
  readonly close: {
    readonly headline: string
    readonly body: string
    readonly editorialStatus: EditorialStatus
  }
  readonly footer: {
    readonly copyright: string
    readonly brand: "Teacher Workspace"
    readonly feedbackLabel: string
    readonly feedbackHref: HttpsUrl
  }
}

export type PrimaryCtaIntent = "google-sign-in"

export type GaAudienceGovernance = {
  readonly intendedAudienceIds: ReadonlyArray<AudienceId>
  readonly status: "pending-pm-confirmation" | "confirmed"
  readonly owner: string
  readonly confirmedBy: string | null
}

export type ApprovalGovernance = {
  readonly owner: string
  readonly status: "pending-approval" | "approved"
  readonly approvedBy: string | null
}

export type MultiPartyApprovalGovernance = {
  readonly owners: ReadonlyArray<string>
  readonly status: "pending-approval" | "approved"
  readonly approvedBy: ReadonlyArray<string>
}

export type LandingPageV2Publication = {
  readonly releasePositioning: "ga"
  readonly primaryCta: {
    readonly label: string | null
    readonly href: HttpsUrl | null
    readonly intent: PrimaryCtaIntent | null
    readonly identityProvider: "google" | null
    readonly requiredAccountDomain: "edu.gov.sg" | null
    readonly accessNote: string | null
  }
  readonly canonicalUrl: HttpsUrl | null
  readonly socialImageUrl: HttpsUrl | null
  readonly contentApprovedBy: string | null
  readonly gaAudience: GaAudienceGovernance
  readonly productClaimsApproval: ApprovalGovernance
  readonly syntheticDemoApproval: MultiPartyApprovalGovernance
  readonly testimonialAttributionPolicy: "anonymous-role-and-school-level"
  /**
   * Launch proof is limited to what the verbatims actually evidence. All six
   * quotes cover Posts; coverage for the other capabilities is a future FGD,
   * not a launch gate. See docs/adr/0003-publish-the-proof-we-have.md.
   */
  readonly testimonialCoverageRequired: readonly ["posts"]
  readonly support: {
    readonly strategy: SupportStrategy | null
    readonly destinationUrl: HttpsUrl | null
    readonly owner: string | null
    readonly accessExplanation: string | null
    readonly approvedBy: string | null
  }
}

export type LandingPageV2MeasurementPlan = {
  readonly providerStrategy: "provider-neutral"
  readonly objectives: readonly ["engagement", "conversion"]
  readonly engagement: {
    readonly scroll: {
      readonly event: "scroll-milestone"
      readonly owner: "marketing-surface"
      readonly milestones: readonly [25, 50, 75, 100]
    }
    readonly explorer: {
      readonly owner: "marketing-surface"
      readonly events: readonly [
        {
          readonly event: "explorer-scenario-selected"
          readonly step: "choose-scenario"
        },
        {
          readonly event: "explorer-connected-context-inspected"
          readonly step: "inspect-connected-context"
        },
        {
          readonly event: "explorer-resulting-action-previewed"
          readonly step: "preview-resulting-action"
        },
      ]
    }
  }
  readonly conversion: {
    readonly proxy: {
      readonly event: "primary-cta-selected"
      readonly owner: "marketing-surface"
      readonly classification: "interim-proxy"
      readonly placements: readonly ["hero", "close"]
    }
    readonly true: {
      readonly event: "product-access-completed"
      readonly owner: "product-auth-surface"
      readonly identityProvider: "google"
      readonly outcomes: readonly ["sign-in", "sign-up"]
      readonly crossDomainAttribution: {
        readonly required: true
        readonly purpose: "associate-product-access-with-landing-journey"
      }
    }
  }
  readonly payloadPolicy: {
    readonly allowlistedFields: readonly [
      "journey-id",
      "placement",
      "synthetic-scenario-id",
    ]
    readonly prohibitedFields: readonly [
      "student-data",
      "testimonial-text",
      "teacher-email",
      "account-identifier",
    ]
  }
  readonly marketingImplementationBoundary: "contract-only"
}

const heroDocument = landingDocuments.hero
const storyDocument = landingDocuments.story
const revealDocument = landingDocuments.reveal
const capabilityDocument = landingDocuments.capabilities
const audienceDocument = landingDocuments.audiences

/**
 * Maps each product capability to the block an author edits in
 * `content/landing/05-capabilities.mdx`. Authors see the public name; the
 * internal id stays here so renaming a capability in public copy never
 * silently rewires the product contract.
 */
const capabilityCopyIds = {
  "student-insights": "student-insights",
  "contextual-intelligence": "next-step",
  "hey-talia": "message-drafting",
  posts: "posts",
} as const satisfies Record<CapabilityId, string>

function journeyAct(
  id: JourneyActId,
  order: JourneyAct["order"],
  capabilityId: CapabilityId | null
): JourneyAct {
  const item = storyDocument.item(id)
  const copy = itemCopy(storyDocument, id)
  return {
    id,
    order,
    moment: itemLabel(storyDocument, item),
    headline: copy.heading,
    body: copy.body,
    capabilityId,
    editorialStatus: "proposed",
  }
}

function capabilityCard(id: CapabilityId): CapabilityCard {
  const copyId = capabilityCopyIds[id]
  const item = capabilityDocument.item(copyId)
  const copy = itemCopy(capabilityDocument, copyId)
  return {
    id,
    publicLabel: itemLabel(capabilityDocument, item),
    job: copy.heading,
    scenario: copy.body,
    anchorId: id,
    editorialStatus: "proposed",
  }
}

function audienceBlock(id: AudienceId): AudienceBlock {
  const copy = optionalItemCopy(audienceDocument, id)
  return {
    id,
    label: itemLabel(audienceDocument, audienceDocument.item(id)),
    question: copy?.heading ?? null,
    answer: copy?.body ?? null,
  }
}

/**
 * Content contract derived from issue #3. The ticket author explicitly
 * described the five-act narrative and information architecture as
 * suggestions, so every non-verbatim marketing line remains "proposed".
 *
 * The words come from `content/`, so a PM can revise copy without touching
 * TypeScript. This module owns the structure around them: which sections
 * exist, in what order, and which capability each story act belongs to.
 */
export const landingPageV2Content = {
  version: 2,
  editorialStatus: "draft",
  sources: {
    ticket: siteConfig.links.landingPageV2Issue,
    directionComment: siteConfig.links.landingPageV2DirectionComment,
    testimonialsComment: siteConfig.links.landingPageV2TestimonialsComment,
    bursaryExampleComment: siteConfig.links.landingPageV2BursaryExampleComment,
  },
  seoDraft: {
    title: landingDocuments.meta.requireHeading(),
    description: landingDocuments.meta.requireBody(),
  },
  hero: {
    eyebrow: heroDocument.optionalText("eyebrow"),
    headline: heroDocument.requireHeading(),
    body: heroDocument.requireBody(),
    ctaPlacements: ["hero", "close"],
  },
  journey: [
    journeyAct("promise", 1, null),
    journeyAct("notice", 2, "student-insights"),
    journeyAct("next-steps", 3, "contextual-intelligence"),
    journeyAct("words", 4, "hey-talia"),
    journeyAct("family-and-record", 5, "posts"),
  ],
  reveal: {
    headline: revealDocument.requireHeading(),
    body: revealDocument.requireBody(),
    gaLaunchLine: revealDocument.optionalText("launchLine"),
    editorialStatus: "proposed",
  },
  capabilities: [
    capabilityCard("student-insights"),
    capabilityCard("contextual-intelligence"),
    capabilityCard("hey-talia"),
    capabilityCard("posts"),
  ],
  aiPlanning: {
    brandArchitecture: {
      status: "approved",
      publicBrand: siteConfig.name,
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
      proposedMemberCapabilityIds: [...proposedAiLayerMemberCapabilityIds],
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
  },
  productExplorer: {
    status: "accepted",
    format: "guided-key-screen-explorer",
    comprehensionFlow: productExplorerComprehensionFlow,
    capabilityIds: [...capabilityIds],
    maxStepsToAnyCapability: 3,
    usesSyntheticDataOnly: true,
    requiresBackend: false,
    placement: null,
  },
  audiences: [
    audienceBlock("teachers"),
    audienceBlock("key-personnel"),
    audienceBlock("school-leaders"),
  ],
  testimonials: [
    {
      id: "pg-work-reduction",
      quote:
        "A lot of enhancements have been made to facilitate and cut down some of the work done in school. We are quite grateful.",
      role: "Vice Principal",
      schoolLevel: "Primary School",
      schoolName: null,
      capabilityIds: ["posts"],
      sourceUrl: siteConfig.links.landingPageV2TestimonialsComment,
      verbatim: true,
      publicationApproved: false,
    },
    {
      id: "pg-intuitive",
      quote:
        "The system is quite intuitive — it's easy to go from one point to another.",
      role: "Corporate Comms & Education Outreach Staff",
      schoolLevel: "Secondary School",
      schoolName: null,
      capabilityIds: ["posts"],
      sourceUrl: siteConfig.links.landingPageV2TestimonialsComment,
      verbatim: true,
      publicationApproved: false,
    },
    {
      id: "pg-growth",
      quote:
        "We've really seen the system grow and improve over the years, and how it has benefited us.",
      role: "Vice Principal",
      schoolLevel: "Primary School",
      schoolName: null,
      capabilityIds: ["posts"],
      sourceUrl: siteConfig.links.landingPageV2TestimonialsComment,
      verbatim: true,
      publicationApproved: false,
    },
    {
      id: "pg-read-speed",
      quote:
        "Wow, so fast! Within 10 minutes, so many parents had already checked and read it. It's even faster than Facebook and Instagram.",
      role: "Corporate Comms & Education Outreach Staff",
      schoolLevel: "Secondary School",
      schoolName: null,
      capabilityIds: ["posts"],
      sourceUrl: siteConfig.links.landingPageV2TestimonialsComment,
      verbatim: true,
      publicationApproved: false,
    },
    {
      id: "pg-immediacy",
      quote: "It's the immediacy of the outreach — it's almost instant.",
      role: "Head of Department",
      schoolLevel: "Secondary School",
      schoolName: null,
      capabilityIds: ["posts"],
      sourceUrl: siteConfig.links.landingPageV2TestimonialsComment,
      verbatim: true,
      publicationApproved: false,
    },
    {
      id: "pg-wonderful-tool",
      quote: "PG has been a wonderful tool for all of us.",
      role: "Vice Principal",
      schoolLevel: "Secondary School",
      schoolName: null,
      capabilityIds: ["posts"],
      sourceUrl: siteConfig.links.landingPageV2TestimonialsComment,
      verbatim: true,
      publicationApproved: false,
    },
  ],
  supportResources: [
    {
      id: "parent-gateway-resource-centre",
      label: "Parent Gateway Resource Centre",
      href: siteConfig.links.parentGatewayResourceCentre,
      availability: "available-restricted",
      publicLinkDecision: "required",
    },
    {
      id: "pair-assistant",
      label: "Pair Assistant",
      href: null,
      availability: "url-required",
      publicLinkDecision: "required",
    },
    {
      id: "support-bot",
      label: "Parent Gateway support bot",
      href: null,
      availability: "in-progress",
      publicLinkDecision: "required",
    },
  ],
  close: {
    headline: landingDocuments.close.requireHeading(),
    body: landingDocuments.close.requireBody(),
    editorialStatus: "proposed",
  },
  footer: {
    copyright: landingDocuments.footer.text("copyright"),
    brand: siteConfig.name,
    feedbackLabel: landingDocuments.footer.text("feedbackLabel"),
    feedbackHref: siteConfig.links.feedback,
  },
} as const satisfies LandingPageV2Content

/**
 * Confirmed and unresolved launch decisions. Nulls are not placeholders to
 * render; the readiness validator turns them into explicit launch blockers.
 */
export const landingPageV2Publication = {
  releasePositioning: "ga",
  primaryCta: {
    label: heroDocument.text("action"),
    href: siteConfig.links.product,
    intent: "google-sign-in",
    identityProvider: "google",
    requiredAccountDomain: "edu.gov.sg",
    accessNote: heroDocument.text("actionNote"),
  },
  canonicalUrl: null,
  socialImageUrl: null,
  contentApprovedBy: null,
  gaAudience: {
    intendedAudienceIds: audienceIds,
    status: "pending-pm-confirmation",
    owner: "Xingyu (PM)",
    confirmedBy: null,
  },
  productClaimsApproval: {
    owner: "Xingyu (PM)",
    status: "pending-approval",
    approvedBy: null,
  },
  syntheticDemoApproval: {
    owners: ["Designer", "Xingyu (PM)"],
    status: "pending-approval",
    approvedBy: [],
  },
  testimonialAttributionPolicy: "anonymous-role-and-school-level",
  testimonialCoverageRequired: ["posts"],
  support: {
    strategy: null,
    destinationUrl: null,
    owner: null,
    accessExplanation: null,
    approvedBy: null,
  },
} as const satisfies LandingPageV2Publication

export const landingPageV2MeasurementPlan = {
  providerStrategy: "provider-neutral",
  objectives: ["engagement", "conversion"],
  engagement: {
    scroll: {
      event: "scroll-milestone",
      owner: "marketing-surface",
      milestones: [25, 50, 75, 100],
    },
    explorer: {
      owner: "marketing-surface",
      events: [
        {
          event: "explorer-scenario-selected",
          step: "choose-scenario",
        },
        {
          event: "explorer-connected-context-inspected",
          step: "inspect-connected-context",
        },
        {
          event: "explorer-resulting-action-previewed",
          step: "preview-resulting-action",
        },
      ],
    },
  },
  conversion: {
    proxy: {
      event: "primary-cta-selected",
      owner: "marketing-surface",
      classification: "interim-proxy",
      placements: ["hero", "close"],
    },
    true: {
      event: "product-access-completed",
      owner: "product-auth-surface",
      identityProvider: "google",
      outcomes: ["sign-in", "sign-up"],
      crossDomainAttribution: {
        required: true,
        purpose: "associate-product-access-with-landing-journey",
      },
    },
  },
  payloadPolicy: {
    allowlistedFields: ["journey-id", "placement", "synthetic-scenario-id"],
    prohibitedFields: [
      "student-data",
      "testimonial-text",
      "teacher-email",
      "account-identifier",
    ],
  },
  marketingImplementationBoundary: "contract-only",
} as const satisfies LandingPageV2MeasurementPlan
