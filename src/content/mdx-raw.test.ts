import { describe, expect, it } from "vitest"

import { editableSpans, mdxSources } from "./mdx-raw"

describe("bundled MDX sources", () => {
  it("carries raw source text, not compiled data", () => {
    const hero = mdxSources["content/landing/02-hero.mdx"]

    expect(hero).toBeTypeOf("string")
    expect(hero).toContain("---")
    expect(hero).toContain("# Every student. No support left unclaimed.")
  })

  it("keys every landing document by its repo-relative path", () => {
    const paths = Object.keys(mdxSources)

    expect(paths).toContain("content/landing/03-story.mdx")
    expect(paths).toContain("content/screens.mdx")
    expect(paths.every((path) => !path.startsWith("/"))).toBe(true)
  })

  it("locates editable spans whose ranges quote the source exactly", () => {
    const spans = editableSpans()
    expect(spans.length).toBeGreaterThan(20)

    for (const span of spans) {
      const source = mdxSources[span.file]
      expect(source).toBeTypeOf("string")
      expect(source.slice(span.start, span.end)).toContain(span.text)
    }

    const headline = spans.find(
      (span) => span.text === "Every student. No support left unclaimed."
    )
    expect(headline?.file).toBe("content/landing/02-hero.mdx")
  })
})
