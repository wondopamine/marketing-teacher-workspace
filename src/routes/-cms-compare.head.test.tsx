import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ComparisonMessage, Route } from "./cms-compare"

type HeadShape = {
  options: {
    head?: (context: unknown) => {
      links?: Array<Record<string, unknown>>
      meta?: Array<Record<string, unknown>>
    }
  }
}

function getHead(loaderData: unknown) {
  return (Route as unknown as HeadShape).options.head?.({ loaderData })
}

describe("CMS published comparison metadata", () => {
  it("uses the published public metadata and stays out of search", () => {
    const head = getHead({
      status: "ready",
      page: {
        metadata: {
          title: "Teacher Workspace",
          path: "/",
          description: "A published description.",
        },
        document: {},
      },
    })

    expect(head?.meta).toEqual([
      { title: "Teacher Workspace — Private CMS comparison" },
      { name: "description", content: "A published description." },
      { name: "robots", content: "noindex, nofollow" },
    ])
  })

  it("does not emit canonical, social-image, or preload links", () => {
    const serialized = JSON.stringify(getHead({ status: "unpublished" }))
      .toLowerCase()

    expect(serialized).not.toContain("canonical")
    expect(serialized).not.toContain("og:image")
    expect(serialized).not.toContain("twitter:image")
    expect(serialized).not.toContain("preload")
  })

  it("gives every non-ready comparison state a primary heading", () => {
    render(
      <ComparisonMessage heading="Comparison unavailable">
        The published CMS comparison is not available right now.
      </ComparisonMessage>
    )

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Comparison unavailable",
      })
    ).not.toBeNull()
    expect(screen.getByRole("main")).not.toBeNull()
  })
})
