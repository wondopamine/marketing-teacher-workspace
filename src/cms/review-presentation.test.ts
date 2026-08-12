import { describe, expect, it } from "vitest"

import { buildCmsReviewPresentation } from "./review-presentation"
import { homepageV1Contract } from "./templates/homepage-v1.server"

describe("CMS review presentation", () => {
  it("uses stable section and screen IDs in the order they appear", () => {
    const presentation = buildCmsReviewPresentation(homepageV1Contract)

    expect(presentation.annotations.map((item) => item.id)).toEqual([
      "02e79e5c-bd01-47e5-be54-95b7c939c358",
      "7d2140d1-15e7-4762-b3b3-17e261c85948",
      "e4a6a36b-bb0a-4977-854b-66f3db071123",
      "74176ccd-fdee-47a2-9308-286146f2366b",
      "9618e896-adda-4973-95e0-61c45360a2f5",
      "f050b81e-c800-4013-9258-57d991041363",
      "24bef79e-9103-4190-a1ba-9ac4fbfd75c5",
      "d9e36bc7-89b2-48b0-b35e-11867763d44a",
      "fd9a7815-00b4-4a6f-8b69-c83a05b7b90d",
      "c8de156c-516f-4ba6-b7c4-b4ed652cb45d",
      "76329aa6-ea3d-4f34-b6a3-3d9a222b2df0",
      "c091f7ce-49db-4acc-89ed-91613e7e475a",
      "54fd7d5c-8c75-456e-abc7-5835ed93a3c1",
    ])
    expect(presentation.sectionTargets[1]).toEqual({
      sectionId: "e4a6a36b-bb0a-4977-854b-66f3db071123",
      screenIds: [
        "74176ccd-fdee-47a2-9308-286146f2366b",
        "9618e896-adda-4973-95e0-61c45360a2f5",
        "f050b81e-c800-4013-9258-57d991041363",
        "24bef79e-9103-4190-a1ba-9ac4fbfd75c5",
        "d9e36bc7-89b2-48b0-b35e-11867763d44a",
      ],
    })
    expect(presentation.footerTargetId).toBe(
      "54fd7d5c-8c75-456e-abc7-5835ed93a3c1"
    )
  })

  it("omits hidden and archived context without changing its stable IDs", () => {
    const story = homepageV1Contract.pageDocument.sections[1]
    const contract = {
      ...homepageV1Contract,
      pageDocument: {
        ...homepageV1Contract.pageDocument,
        sections: homepageV1Contract.pageDocument.sections.map((section) =>
          section.id === story.id
            ? { ...section, state: "hidden" as const }
            : section
        ),
      },
    }

    const presentation = buildCmsReviewPresentation(contract)

    expect(presentation.annotations.some((item) => item.id === story.id)).toBe(
      false
    )
    expect(
      presentation.sectionTargets.some((item) => item.sectionId === story.id)
    ).toBe(false)
  })
})
