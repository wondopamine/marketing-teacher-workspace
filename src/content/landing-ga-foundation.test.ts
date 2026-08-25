import { describe, expect, expectTypeOf, it } from "vitest"

import {
  getLandingGaPrototypeBlockers,
  landingGaCapabilityClaimRegister,
  landingGaCmsUpdatePolicy,
  landingGaMeasurementFoundation,
  landingGaNarrativeMoments,
  landingGaPrototypeInputs,
  landingGaPublicCapabilities,
  landingGaRejectedClaims,
  landingGaScenarioPolicy,
  landingGaSectionIds,
} from "./landing-ga-foundation"

import type { LandingGaSectionId } from "./landing-ga-foundation"

describe("Teacher Workspace GA landing foundation", () => {
  it("locks the compact seven-part information architecture", () => {
    expect(landingGaSectionIds).toEqual([
      "hero",
      "capability-map",
      "notice-and-understand",
      "act",
      "communicate",
      "school-consistency",
      "close-and-access",
    ])
    expectTypeOf(landingGaSectionIds).toEqualTypeOf<
      readonly [
        "hero",
        "capability-map",
        "notice-and-understand",
        "act",
        "communicate",
        "school-consistency",
        "close-and-access",
      ]
    >()
    expectTypeOf<LandingGaSectionId>().toEqualTypeOf<
      (typeof landingGaSectionIds)[number]
    >()
  })

  it("carries four verbs through three separate narrative moments", () => {
    expect(landingGaNarrativeMoments.map((moment) => moment.verbs)).toEqual([
      ["notice", "understand"],
      ["act"],
      ["communicate"],
    ])
  })

  it("uses functional public capability names without surfacing internal brands", () => {
    expect(
      landingGaPublicCapabilities.map((capability) => capability.publicName)
    ).toEqual([
      "Student Insights",
      "AI next-step guidance",
      "Message drafting",
      "Posts",
    ])

    const publicNames = landingGaPublicCapabilities
      .map((capability) => capability.publicName)
      .join("\n")
    expect(publicNames).not.toMatch(/Contextual Intelligence|HeyTalia/)
  })

  it("starts with an empty owner-confirmed claims register", () => {
    expect(landingGaCapabilityClaimRegister).toHaveLength(4)
    for (const record of landingGaCapabilityClaimRegister) {
      expect(record.coordinator).toBe("Xingyu (PM)")
      expect(record.capabilityOwner).toBeNull()
      expect(record.status).toBe("pending-owner-confirmation")
      expect(record.allowedPublicClaims).toEqual([])
      expect(record.evidenceReferences).toEqual([])
      expect(record.approvedBy).toBeNull()
      expect(record.approvedOn).toBeNull()
    }
  })

  it("explicitly rejects every challenged claim unless new evidence is recorded", () => {
    expect(landingGaRejectedClaims.map((claim) => claim.id)).toEqual([
      "circular-reading",
      "automatic-bursary-matching",
      "application-outcome-tracking",
      "student-context-drafting",
    ])
    expect(landingGaRejectedClaims.map((claim) => claim.disposition)).toEqual([
      "rejected-unless-new-evidence",
      "rejected-unless-new-evidence",
      "rejected-unless-new-evidence",
      "rejected-unless-new-evidence",
    ])
  })

  it("blocks story selection until GA claims are confirmed", () => {
    expect(landingGaScenarioPolicy).toMatchObject({
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
    })
  })

  it("keeps every prototype input at its authorised human gate", () => {
    expect(getLandingGaPrototypeBlockers()).toEqual([
      { code: "capability-claims", issue: 6 },
      { code: "hero-product-peek", issue: 7 },
      { code: "positive-scenarios", issue: 8 },
      { code: "school-consistency-assurance", issue: 9 },
      { code: "posts-proof", issue: 10 },
      { code: "measurement", issue: 11 },
    ])
    expect(landingGaPrototypeInputs.capabilityClaims.status).toBe("pending")
  })

  it("defines anonymous measurement without sensitive payloads", () => {
    expect(landingGaMeasurementFoundation).toMatchObject({
      status: "pending-approval",
      primary: {
        objective: "anonymous-sign-in-cta-conversion",
        event: "primary-cta-selected",
        denominator: null,
        owner: null,
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
    })
  })

  it("permits only an append-only CMS draft save", () => {
    expect(landingGaCmsUpdatePolicy).toMatchObject({
      allowedOperation: "append-only-save",
      requiresCurrentExpectedHead: true,
      requiresUnchangedStableTargetIds: true,
      expectedCommentBaseline: { open: 6, withdrawn: 1 },
      preserveCommentTargets: true,
      preserveCommentStatuses: true,
      staleHeadBehaviour: "abort-and-reapply",
    })
    expect(landingGaCmsUpdatePolicy.forbiddenOperations).toEqual(
      expect.arrayContaining([
        "cms:import",
        "publish",
        "restore",
        "migrate",
        "reset",
        "replace-page",
        "change-production-alias",
        "change-released-homepage",
      ])
    )
  })
})
