import { describe, expect, it } from "vitest"

import {
  gaAudiences,
  gaCapabilities,
  gaJourneyActs,
  gaTestimonials,
} from "./landing-ga-page"
import { landingPageV2Content } from "./landing-v2"

/**
 * `landing-ga-page.ts` ships in the public bundle, so it carries its own
 * minimal public dataset instead of importing the governance module. These
 * tests are the sync contract: every public entry must match its governance
 * record in `landing-v2.ts` verbatim, and nothing beyond the public fields
 * may leak.
 */
describe("GA page dataset stays in sync with the governance records", () => {
  it("matches each curated testimonial to its landing-v2 record verbatim", () => {
    expect(gaTestimonials).toHaveLength(3)
    for (const testimonial of gaTestimonials) {
      const record = landingPageV2Content.testimonials.find(
        (candidate) => candidate.id === testimonial.id
      )
      expect(record, testimonial.id).toBeDefined()
      expect(testimonial.quote).toBe(record?.quote)
      expect(testimonial.role).toBe(record?.role)
      expect(testimonial.schoolLevel).toBe(record?.schoolLevel)
      expect(record?.verbatim).toBe(true)
      // Proof coverage stays Posts-only (ADR 0003) with no school names.
      expect(record?.capabilityIds).toEqual(["posts"])
      expect(record?.schoolName).toBeNull()
      // The quotes naming "PG" stay unpublished on this page.
      expect(testimonial.quote).not.toContain("PG")
    }
  })

  it("matches the journey acts to the governance journey", () => {
    expect(gaJourneyActs.map((act) => act.id)).toEqual(
      landingPageV2Content.journey.map((act) => act.id)
    )
    for (const [index, act] of gaJourneyActs.entries()) {
      const record = landingPageV2Content.journey[index]
      expect(act.headline).toBe(record?.headline)
      expect(act.body).toBe(record?.body)
    }
  })

  it("matches capability labels and copy to the governance cards", () => {
    expect(gaCapabilities.map((capability) => capability.publicLabel)).toEqual(
      landingPageV2Content.capabilities.map(
        (capability) => capability.publicLabel
      )
    )
    for (const [index, capability] of gaCapabilities.entries()) {
      const record = landingPageV2Content.capabilities[index]
      expect(capability.job).toBe(record?.job)
      expect(capability.scenario).toBe(record?.scenario)
    }
  })

  it("matches the audience blocks to the governance audiences", () => {
    expect(gaAudiences.map((audience) => audience.id)).toEqual(
      landingPageV2Content.audiences.map((audience) => audience.id)
    )
    for (const [index, audience] of gaAudiences.entries()) {
      const record = landingPageV2Content.audiences[index]
      expect(audience.question).toBe(record?.question)
      expect(audience.answer).toBe(record?.answer)
      expect(audience.label).toBe(record?.label)
    }
  })
})
