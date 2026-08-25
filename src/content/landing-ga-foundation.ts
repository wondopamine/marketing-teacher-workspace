import type { CapabilityId } from "./landing-v2"

export const landingGaSectionIds = [
  "hero",
  "capability-map",
  "notice-and-understand",
  "act",
  "communicate",
  "school-consistency",
  "close-and-access",
] as const

export type LandingGaSectionId = (typeof landingGaSectionIds)[number]

export const landingGaNarrativeMoments = [
  {
    id: "notice-and-understand",
    verbs: ["notice", "understand"],
    requiredCapabilityIds: ["student-insights"],
  },
  {
    id: "act",
    verbs: ["act"],
    requiredCapabilityIds: ["contextual-intelligence"],
  },
  {
    id: "communicate",
    verbs: ["communicate"],
    requiredCapabilityIds: ["hey-talia", "posts"],
  },
] as const satisfies ReadonlyArray<{
  readonly id: Extract<
    LandingGaSectionId,
    "notice-and-understand" | "act" | "communicate"
  >
  readonly verbs: ReadonlyArray<"notice" | "understand" | "act" | "communicate">
  readonly requiredCapabilityIds: ReadonlyArray<CapabilityId>
}>

export const landingGaPublicCapabilities = [
  {
    id: "student-insights",
    publicName: "Student Insights",
  },
  {
    id: "contextual-intelligence",
    publicName: "AI next-step guidance",
  },
  {
    id: "hey-talia",
    publicName: "Message drafting",
  },
  {
    id: "posts",
    publicName: "Posts",
  },
] as const satisfies ReadonlyArray<{
  readonly id: CapabilityId
  readonly publicName: string
}>

export const landingGaRejectedClaims = [
  {
    id: "circular-reading",
    disposition: "rejected-unless-new-evidence",
    capabilityIds: ["contextual-intelligence"],
    claim: "AI next-step guidance reads or interprets circulars.",
  },
  {
    id: "automatic-bursary-matching",
    disposition: "rejected-unless-new-evidence",
    capabilityIds: ["student-insights", "contextual-intelligence"],
    claim:
      "Teacher Workspace automatically matches a student to a bursary or scheme.",
  },
  {
    id: "application-outcome-tracking",
    disposition: "rejected-unless-new-evidence",
    capabilityIds: ["posts"],
    claim: "Posts tracks whether an application was submitted or approved.",
  },
  {
    id: "student-context-drafting",
    disposition: "rejected-unless-new-evidence",
    capabilityIds: ["hey-talia"],
    claim: "Message drafting prepares a draft from student context.",
  },
] as const satisfies ReadonlyArray<{
  readonly id:
    | "circular-reading"
    | "automatic-bursary-matching"
    | "application-outcome-tracking"
    | "student-context-drafting"
  readonly disposition: "rejected-unless-new-evidence"
  readonly capabilityIds: ReadonlyArray<CapabilityId>
  readonly claim: string
}>

export type LandingGaCapabilityClaimRecord = {
  readonly capabilityId: CapabilityId
  readonly publicName: string
  readonly coordinator: "Xingyu (PM)"
  readonly capabilityOwner: string | null
  readonly status: "pending-owner-confirmation" | "confirmed"
  readonly allowedPublicClaims: ReadonlyArray<string>
  readonly evidenceReferences: ReadonlyArray<string>
  readonly approvedBy: string | null
  readonly approvedOn: string | null
}

export const landingGaCapabilityClaimRegister = Object.freeze(
  landingGaPublicCapabilities.map(
    ({ id, publicName }): LandingGaCapabilityClaimRecord => ({
      capabilityId: id,
      publicName,
      coordinator: "Xingyu (PM)",
      capabilityOwner: null,
      status: "pending-owner-confirmation",
      allowedPublicClaims: [],
      evidenceReferences: [],
      approvedBy: null,
      approvedOn: null,
    })
  )
)

export const landingGaScenarioPolicy = {
  status: "blocked-by-ga-claims",
  requiredCount: 3,
  selectedScenarios: [],
  constraints: {
    syntheticOnly: true,
    positiveOnly: true,
    realDataProhibited: true,
    swanFramingProhibited: true,
    behaviouralRiskProhibited: true,
    unsupportedCrossCapabilityHandoffsProhibited: true,
    teacherRemainsDecisionMaker: true,
  },
} as const

type LandingGaPrototypeInputs = {
  readonly capabilityClaims: {
    readonly issue: 6
    readonly status: "pending" | "approved"
  }
  readonly heroProductPeek: {
    readonly issue: 7
    readonly status: "blocked-by-ga-claims" | "pending" | "approved"
    readonly selectedScreenId: string | null
  }
  readonly positiveScenarios: {
    readonly issue: 8
    readonly status: "blocked-by-ga-claims" | "pending" | "approved"
  }
  readonly schoolConsistencyAssurance: {
    readonly issue: 9
    readonly status: "blocked-by-ga-claims" | "pending" | "approved"
    readonly approvedCopy: string | null
  }
  readonly postsProof: {
    readonly issue: 10
    readonly status: "pending-publication-approval" | "approved"
    readonly selectedTestimonialId: string | null
  }
  readonly measurement: {
    readonly issue: 11
    readonly status: "pending-approval" | "approved"
  }
}

export const landingGaPrototypeInputs: LandingGaPrototypeInputs = {
  capabilityClaims: {
    issue: 6,
    status: "pending",
  },
  heroProductPeek: {
    issue: 7,
    status: "blocked-by-ga-claims",
    selectedScreenId: null,
  },
  positiveScenarios: {
    issue: 8,
    status: "blocked-by-ga-claims",
  },
  schoolConsistencyAssurance: {
    issue: 9,
    status: "blocked-by-ga-claims",
    approvedCopy: null,
  },
  postsProof: {
    issue: 10,
    status: "pending-publication-approval",
    selectedTestimonialId: null,
  },
  measurement: {
    issue: 11,
    status: "pending-approval",
  },
}

type LandingGaMeasurementFoundation = {
  readonly status: "pending-approval" | "approved"
  readonly providerStrategy: "provider-neutral"
  readonly primary: {
    readonly objective: "anonymous-sign-in-cta-conversion"
    readonly event: "primary-cta-selected"
    readonly placements: readonly ["hero", "close"]
    readonly denominator: string | null
    readonly owner: string | null
  }
  readonly secondary: {
    readonly sectionReach: {
      readonly event: "section-reached"
      readonly thresholds: ReadonlyArray<number> | null
    }
    readonly capabilityEngagement: {
      readonly event: "capability-engaged"
      readonly definition: string | null
    }
  }
  readonly privacy: {
    readonly anonymousOnly: true
    readonly prohibitedFields: readonly [
      "student-data",
      "testimonial-text",
      "teacher-email",
      "account-identifier",
    ]
  }
}

export const landingGaMeasurementFoundation: LandingGaMeasurementFoundation = {
  status: "pending-approval",
  providerStrategy: "provider-neutral",
  primary: {
    objective: "anonymous-sign-in-cta-conversion",
    event: "primary-cta-selected",
    placements: ["hero", "close"],
    denominator: null,
    owner: null,
  },
  secondary: {
    sectionReach: {
      event: "section-reached",
      thresholds: null,
    },
    capabilityEngagement: {
      event: "capability-engaged",
      definition: null,
    },
  },
  privacy: {
    anonymousOnly: true,
    prohibitedFields: [
      "student-data",
      "testimonial-text",
      "teacher-email",
      "account-identifier",
    ],
  },
}

export const landingGaCmsUpdatePolicy = {
  allowedOperation: "append-only-save",
  requiresCurrentExpectedHead: true,
  requiresUnchangedStableTargetIds: true,
  expectedCommentBaseline: {
    open: 6,
    withdrawn: 1,
  },
  preserveCommentTargets: true,
  preserveCommentStatuses: true,
  staleHeadBehaviour: "abort-and-reapply",
  forbiddenOperations: [
    "cms:import",
    "publish",
    "restore",
    "migrate",
    "reset",
    "replace-page",
    "change-production-alias",
    "change-released-homepage",
  ],
} as const

export type LandingGaPrototypeBlocker = {
  readonly code:
    | "capability-claims"
    | "hero-product-peek"
    | "positive-scenarios"
    | "school-consistency-assurance"
    | "posts-proof"
    | "measurement"
  readonly issue: number
}

export function getLandingGaPrototypeBlockers(): ReadonlyArray<LandingGaPrototypeBlocker> {
  const blockers: Array<LandingGaPrototypeBlocker> = []

  if (
    landingGaCapabilityClaimRegister.some(
      (record) => record.status !== "confirmed"
    )
  ) {
    blockers.push({
      code: "capability-claims",
      issue: landingGaPrototypeInputs.capabilityClaims.issue,
    })
  }
  if (landingGaPrototypeInputs.heroProductPeek.status !== "approved") {
    blockers.push({
      code: "hero-product-peek",
      issue: landingGaPrototypeInputs.heroProductPeek.issue,
    })
  }
  if (landingGaPrototypeInputs.positiveScenarios.status !== "approved") {
    blockers.push({
      code: "positive-scenarios",
      issue: landingGaPrototypeInputs.positiveScenarios.issue,
    })
  }
  if (
    landingGaPrototypeInputs.schoolConsistencyAssurance.status !== "approved"
  ) {
    blockers.push({
      code: "school-consistency-assurance",
      issue: landingGaPrototypeInputs.schoolConsistencyAssurance.issue,
    })
  }
  if (landingGaPrototypeInputs.postsProof.status !== "approved") {
    blockers.push({
      code: "posts-proof",
      issue: landingGaPrototypeInputs.postsProof.issue,
    })
  }
  if (
    landingGaPrototypeInputs.measurement.status !== "approved" ||
    landingGaMeasurementFoundation.status !== "approved"
  ) {
    blockers.push({
      code: "measurement",
      issue: landingGaPrototypeInputs.measurement.issue,
    })
  }

  return blockers
}
