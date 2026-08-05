import { describe, expect, it } from "vitest"

import { Route } from "./content-review"

type HeadMeta = Record<string, unknown>

type HeadShape = {
  options: {
    head?: (ctx?: unknown) => {
      links?: Array<Record<string, unknown>>
      meta?: Array<HeadMeta>
    }
  }
}

function getHead() {
  const route = Route as unknown as HeadShape
  return route.options.head?.()
}

describe("content-review route metadata", () => {
  it("labels the page as a draft and keeps it out of search indexes", () => {
    expect(getHead()?.meta).toEqual([
      { title: "Teacher Workspace landing wireframe — Draft" },
      {
        name: "description",
        content:
          "Review the proposed Teacher Workspace landing-page structure and content.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ])
  })

  it("does not publish canonical, social-image, or preload links", () => {
    const head = getHead()
    const serialized = JSON.stringify(head).toLowerCase()

    expect(head?.links ?? []).toHaveLength(0)
    expect(serialized).not.toContain("canonical")
    expect(serialized).not.toContain("og:image")
    expect(serialized).not.toContain("twitter:image")
    expect(serialized).not.toContain("preload")
  })
})
