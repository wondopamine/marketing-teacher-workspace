import { describe, expect, it } from "vitest"

import { parseContentSource } from "./content-source.server"

describe("public content source", () => {
  it("keeps the released static page as the safe default", () => {
    expect(parseContentSource(undefined)).toBe("static")
    expect(parseContentSource("")).toBe("static")
    expect(parseContentSource("static")).toBe("static")
  })

  it("enables CMS content only through the exact switch value", () => {
    expect(parseContentSource("cms")).toBe("cms")
    expect(() => parseContentSource("CMS")).toThrow(
      'CONTENT_SOURCE must be either "static" or "cms"'
    )
    expect(() => parseContentSource("legacy")).toThrow(
      'CONTENT_SOURCE must be either "static" or "cms"'
    )
  })
})
