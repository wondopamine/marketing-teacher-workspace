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
  readonly testimonialCoverageRequired: readonly [
    "student-insights",
    "hey-talia",
    "posts",
  ]
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

/**
 * Content contract derived from issue #3. The ticket author explicitly
 * described the five-act narrative and information architecture as
 * suggestions, so every non-verbatim marketing line remains "proposed".
 *
 * This module is deliberately separate from the current v1 rendering data.
 * Designers can change layout without losing the journey/capability
 * relationships, while product and legal reviewers can see which material
 * is still awaiting approval.
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
    title: "Teacher Workspace | See what is changing",
    description:
      "Bring classroom observations, practical next steps, family communication, and the student record into one teacher-controlled flow.",
  },
  hero: {
    eyebrow: null,
    headline: "See what is changing. Know what to do next.",
    body: "Teacher Workspace brings classroom observations, practical next steps, family communication, and the student record into one teacher-controlled flow.",
    ctaPlacements: ["hero", "close"],
  },
  journey: [
    {
      id: "promise",
      order: 1,
      moment: "A positive change",
      headline: "A student is contributing with growing confidence.",
      body: "You notice the progress and want to help it continue.",
      capabilityId: null,
      editorialStatus: "proposed",
    },
    {
      id: "notice",
      order: 2,
      moment: "Notice the progress",
      headline: "Recent moments reveal a pattern.",
      body: "Classroom observations sit together, making the change easier to recognise.",
      capabilityId: "student-insights",
      editorialStatus: "proposed",
    },
    {
      id: "next-steps",
      order: 3,
      moment: "Choose the next step",
      headline: "A practical next step is ready to review.",
      body: "Teacher Workspace suggests a way to build on the progress. You decide what fits.",
      capabilityId: "contextual-intelligence",
      editorialStatus: "proposed",
    },
    {
      id: "words",
      order: 4,
      moment: "Prepare the update",
      headline: "Turn the progress into a family update.",
      body: "Start with a draft drawn from the classroom context, then review and edit every word.",
      capabilityId: "hey-talia",
      editorialStatus: "proposed",
    },
    {
      id: "family-and-record",
      order: 5,
      moment: "Keep everyone aligned",
      headline: "Share the update. Keep the record connected.",
      body: "Publish through Posts when you are ready, while keeping the communication with the student’s journey.",
      capabilityId: "posts",
      editorialStatus: "proposed",
    },
  ],
  reveal: {
    headline: "Your judgment stays in the loop.",
    body: "Teacher Workspace connects the context and possible next action without taking the decision away from you.",
    gaLaunchLine: null,
    editorialStatus: "proposed",
  },
  capabilities: [
    {
      id: "student-insights",
      publicLabel: "Student Insights",
      job: "See recent observations and classroom moments in one view.",
      scenario:
        "Recognise a positive change without piecing together separate notes.",
      anchorId: "student-insights",
      editorialStatus: "proposed",
    },
    {
      id: "contextual-intelligence",
      publicLabel: "Next-step guidance",
      job: "Consider a relevant next step with its classroom context.",
      scenario: "Review one practical way to help the progress continue.",
      anchorId: "contextual-intelligence",
      editorialStatus: "proposed",
    },
    {
      id: "hey-talia",
      publicLabel: "Message drafting",
      job: "Start a family update from the progress you have observed.",
      scenario: "Review and edit every word before anything is shared.",
      anchorId: "hey-talia",
      editorialStatus: "proposed",
    },
    {
      id: "posts",
      publicLabel: "Posts",
      job: "Share the update and keep the communication on record.",
      scenario: "Keep the family message connected to the student’s journey.",
      anchorId: "posts",
      editorialStatus: "proposed",
    },
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
    {
      id: "teachers",
      label: "Form Teachers",
      question: null,
      answer: null,
    },
    {
      id: "key-personnel",
      label: "Key Personnel",
      question: null,
      answer: null,
    },
    {
      id: "school-leaders",
      label: "School Leaders",
      question: null,
      answer: null,
    },
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
    headline: "Carry the progress forward.",
    body: "See the context, decide the next step, and keep families informed — all from Teacher Workspace.",
    editorialStatus: "proposed",
  },
  footer: {
    copyright: "© MOE 2026",
    brand: siteConfig.name,
    feedbackLabel: "Send feedback",
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
    label: "Sign in with Google",
    href: siteConfig.links.product,
    intent: "google-sign-in",
    identityProvider: "google",
    requiredAccountDomain: "edu.gov.sg",
    accessNote: "Use your @edu.gov.sg account.",
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
  testimonialCoverageRequired: ["student-insights", "hey-talia", "posts"],
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
