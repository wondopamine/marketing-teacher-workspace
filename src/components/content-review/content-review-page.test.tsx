import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ContentReviewPage } from "./content-review-page"
import type { ContentReviewWireframeReadyPageDto } from "@/content/landing-v2-review.types"
import { buildContentReviewPageDto } from "@/content/landing-v2-review-state.server"

function buildReadyReviewPage(): ContentReviewWireframeReadyPageDto {
  const data = buildContentReviewPageDto()
  if (data.kind !== "ready") {
    throw new Error("Expected the default content-review DTO to be ready")
  }
  return data
}

describe("ContentReviewPage", () => {
  it("renders one greyscale landing-page wireframe with the footer outside main", () => {
    const data = buildReadyReviewPage()

    const { container } = render(<ContentReviewPage data={data} />)
    const main = screen.getByRole("main")
    const footer = screen.getByRole("contentinfo", {
      name: "Teacher Workspace wireframe",
    })
    const reviewNotes = screen.getByRole("complementary", {
      name: "PM review notes",
    })

    expect(main.id).toBe("main")
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "See the progress worth building on."
    )
    expect(within(main).queryByRole("contentinfo")).toBeNull()
    expect(within(main).queryByRole("complementary")).toBeNull()
    expect(screen.queryAllByRole("article")).toHaveLength(0)
    expect(container.querySelectorAll("img, video, canvas")).toHaveLength(0)
    expect(
      container.querySelectorAll("[data-wireframe-placeholder]").length
    ).toBeGreaterThan(0)
    expect(container.querySelector("[data-wireframe-appendix]")).not.toBeNull()

    const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4")).map(
      (heading) => Number(heading.tagName.slice(1))
    )
    expect(levels[0]).toBe(1)
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1)
    }

    expect(footer.previousElementSibling).toBe(main)
    expect(reviewNotes.previousElementSibling).toBe(footer)
  })

  it("renders the accepted IA, actual story content, and explicit pending slots", () => {
    const data = buildReadyReviewPage()

    const { container } = render(<ContentReviewPage data={data} />)
    const sectionKinds = Array.from(
      container.querySelectorAll("[data-wireframe-section]")
    ).map((element) => element.getAttribute("data-wireframe-section"))

    expect(sectionKinds).toEqual(data.sections.map((section) => section.kind))
    expect(
      screen.getByRole("heading", {
        name: "A student is beginning to contribute with growing confidence.",
      })
    ).not.toBeNull()
    expect(
      screen.getByRole("heading", {
        name: "Shared with the family. Kept with the record.",
      })
    ).not.toBeNull()

    const explorerHeading = screen.getByRole("heading", {
      name: "Explore the flow in three steps",
    })
    const explorer = explorerHeading.closest("section")
    expect(explorer).not.toBeNull()
    expect(explorer?.querySelectorAll("ol > li")).toHaveLength(3)
    expect(
      within(explorer as HTMLElement).queryAllByRole("button")
    ).toHaveLength(0)
    expect(within(explorer as HTMLElement).queryAllByRole("tab")).toHaveLength(
      0
    )
    expect(screen.queryAllByRole("combobox")).toHaveLength(0)
    expect(screen.queryAllByRole("dialog")).toHaveLength(0)

    expect(
      screen.getByRole("heading", { name: "Form Teachers" })
    ).not.toBeNull()
    expect(
      screen.getByRole("heading", { name: "Key Personnel" })
    ).not.toBeNull()
    expect(
      screen.getByRole("heading", { name: "School Leaders" })
    ).not.toBeNull()
    expect(screen.getAllByText("Audience-specific copy pending")).toHaveLength(
      3
    )
    expect(
      screen.getByText("Proof copy and testimonial permission")
    ).not.toBeNull()
    expect(screen.getByText("Public support route")).not.toBeNull()
    expect(screen.getByText("Placement to confirm")).not.toBeNull()
  })

  it("shows two inert product actions and feedback without redundant UI captions", () => {
    const data = buildReadyReviewPage()

    const { container } = render(<ContentReviewPage data={data} />)

    const entries = data.sections.flatMap((section) => section.entries)
    const productAction = entries.find(
      (entry) => entry.kind === "content" && entry.action?.purpose === "product"
    )
    const feedbackAction = entries.find(
      (entry) =>
        entry.kind === "content" && entry.action?.purpose === "feedback"
    )

    expect(productAction?.kind).toBe("content")
    expect(feedbackAction?.kind).toBe("content")
    if (
      productAction?.kind !== "content" ||
      feedbackAction?.kind !== "content" ||
      !productAction.action ||
      !feedbackAction.action
    ) {
      return
    }

    const productActions = Array.from(
      container.querySelectorAll("[data-wireframe-action]")
    )
    expect(productActions).toHaveLength(2)
    expect(
      productActions.every(
        (action) => action.textContent === productAction.action?.label
      )
    ).toBe(true)
    expect(screen.getByText(feedbackAction.action.label)).not.toBeNull()
    expect(screen.queryByText("Static CTA placement")).toBeNull()
    expect(screen.queryByText("Feedback link placement")).toBeNull()
    expect(screen.queryAllByRole("link")).toHaveLength(0)
    expect(screen.queryAllByRole("button")).toHaveLength(0)
    expect(container.querySelectorAll("[href]")).toHaveLength(0)
  })

  it("renders the governance appendix without leaking raw server material", () => {
    const data = buildReadyReviewPage()

    const { container } = render(<ContentReviewPage data={data} />)
    expect(
      screen.getByRole("heading", { name: "PM review notes" })
    ).not.toBeNull()
    expect(screen.getByText("Provider-neutral")).not.toBeNull()
    expect(screen.getAllByText("Student Insights").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Message drafting").length).toBeGreaterThan(0)
    expect(screen.queryByText("Capability mapping:")).toBeNull()
    expect(container.querySelector("[data-review-reference]")).toBeNull()

    const html = container.innerHTML.toLowerCase()
    for (const prohibitedValue of [
      "tw-ia-order",
      "tw-story-composed",
      "contextual-intelligence",
      "hey-talia",
      "xingyu",
      "xiao ming",
      "bursary",
      "reviewedsnapshot",
      "evidencereference",
      "contentid",
      "undefined",
      ">null<",
    ]) {
      expect(html).not.toContain(prohibitedValue)
    }
  })

  it("renders a stop-review error without partial story or diagnostics", () => {
    const data = buildContentReviewPageDto({ manifest: [] })
    expect(data.kind).toBe("error")

    const { container } = render(<ContentReviewPage data={data} />)
    const main = screen.getByRole("main")

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    expect(
      screen.getByRole("heading", { name: "Wireframe unavailable" })
    ).not.toBeNull()
    expect(within(main).getByText(/review is paused/i)).not.toBeNull()
    expect(screen.queryAllByRole("link")).toHaveLength(0)
    expect(screen.queryAllByRole("button")).toHaveLength(0)
    expect(container.querySelectorAll("[href]")).toHaveLength(0)
    expect(container.textContent).not.toContain(
      "See the progress worth building on"
    )
    expect(container.innerHTML).not.toContain("manifest-coverage")
    expect(container.innerHTML).not.toContain("CONTENT_REVIEW_INVALID")
    expect(container.innerHTML).not.toContain("build snapshot")
  })
})
