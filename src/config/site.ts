export type HttpsUrl = `https://${string}`

type SiteConfig = {
  readonly name: string
  readonly links: {
    readonly product: HttpsUrl
    readonly feedback: HttpsUrl
    readonly reportVulnerability: HttpsUrl
    readonly scamShield: HttpsUrl
    readonly parentGatewayResourceCentre: HttpsUrl
    readonly landingPageV2Issue: HttpsUrl
    readonly landingPageV2DirectionComment: HttpsUrl
    readonly landingPageV2TestimonialsComment: HttpsUrl
    readonly landingPageV2BursaryExampleComment: HttpsUrl
  }
}

/**
 * Public destinations and source-of-truth links shared by the current page
 * and the Landing Page v2 content contract.
 *
 * Keep deployment-only values (for example, preview origins) out of this
 * object. Those need an explicit environment contract once the canonical
 * marketing domain and indexing policy are confirmed.
 */
export const siteConfig = {
  name: "Teacher Workspace",
  links: {
    product: "https://teacher.digital.moe.gov.sg",
    feedback: "https://go.gov.sg/teacherworkspace-feedback",
    // Both are obligations of a public-facing government site, raised in
    // review on 2026-09-03. `report_vulnerability` and the bare host both
    // redirect here, so this is the form that costs no hop.
    reportVulnerability: "https://www.tech.gov.sg/report-vulnerability/",
    scamShield: "https://www.scamshield.gov.sg",
    parentGatewayResourceCentre: "https://go.gov.sg/PGresource",
    landingPageV2Issue:
      "https://github.com/String-dxd/marketing-teacher-workspace/issues/3",
    landingPageV2DirectionComment:
      "https://github.com/String-dxd/marketing-teacher-workspace/issues/3#issuecomment-4970493652",
    landingPageV2TestimonialsComment:
      "https://github.com/String-dxd/marketing-teacher-workspace/issues/3#issuecomment-4977362644",
    landingPageV2BursaryExampleComment:
      "https://github.com/String-dxd/marketing-teacher-workspace/issues/3#issuecomment-4977836365",
  },
} as const satisfies SiteConfig
