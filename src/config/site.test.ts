import { describe, expect, it } from "vitest"

import { siteConfig } from "./site"

describe("siteConfig", () => {
  it("keeps every public and source-of-truth link on HTTPS", () => {
    for (const href of Object.values(siteConfig.links)) {
      expect(new URL(href).protocol).toBe("https:")
    }
  })

  it("keeps the product and feedback destinations distinct", () => {
    expect(siteConfig.links.product).not.toBe(siteConfig.links.feedback)
  })
})
