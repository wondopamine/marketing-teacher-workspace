import { describe, expect, it } from "vitest"

import { publicHomeHead } from "./index"

function getHeadLinks(): Array<Record<string, unknown>> | undefined {
  return publicHomeHead({ status: "static" }).links
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

  it("preloads the hero background used by the released static page", () => {
    const preload = (getHeadLinks() ?? []).find(
      (link) => link.rel === "preload" && link.as === "image"
    )

    expect(preload?.href).toBe("/hero/hero-bg.avif")
    expect(JSON.stringify(preload)).not.toContain("profiles-screen")
  })

  it("uses CMS metadata without preloading the old visual hero after cutover", () => {
    const head = publicHomeHead({
      status: "ready",
      page: {
        metadata: {
          title: "A published title",
          path: "/",
          description: "A published description.",
        },
        document: {
          brand: "Teacher Workspace",
          sections: [],
          footer: { brand: "Teacher Workspace", body: [], feedbackLabel: null },
        },
      },
    })

    expect(head.links).toEqual([])
    expect(head.meta).toEqual([
      { title: "A published title" },
      { name: "description", content: "A published description." },
    ])
  })
})
