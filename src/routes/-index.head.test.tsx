import { describe, expect, it } from "vitest"

import { Route } from "./index"

type HeadShape = {
  options: {
    head?: (ctx?: unknown) => { links?: Array<Record<string, unknown>> }
  }
}

function getHeadLinks(): Array<Record<string, unknown>> | undefined {
  const route = Route as unknown as HeadShape
  return route.options.head?.().links
}

describe("index route LCP preload", () => {
  it("emits exactly one high-priority AVIF image preload", () => {
    const links = getHeadLinks() ?? []
    const preloads = links.filter(
      (link) => link.rel === "preload" && link.as === "image"
    )

    expect(preloads).toEqual([
      expect.objectContaining({
        type: "image/avif",
        fetchPriority: "high",
      }),
    ])
  })

  it("preloads the hero background used in both rendering modes", () => {
    const preload = (getHeadLinks() ?? []).find(
      (link) => link.rel === "preload" && link.as === "image"
    )

    expect(preload?.href).toBe("/hero/hero-bg.avif")
    expect(JSON.stringify(preload)).not.toContain("profiles-screen")
  })
})
