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
    expect(main.id).toBe("main")
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Every student. No support left unclaimed."
    )
    expect(within(main).queryByRole("contentinfo")).toBeNull()
    expect(within(main).queryByRole("complementary")).toBeNull()
    expect(screen.queryAllByRole("article")).toHaveLength(0)
    expect(container.querySelectorAll("img, video, canvas")).toHaveLength(0)
    const interfaceDescriptions = Array.from(
      container.querySelectorAll("[data-interface-description]")
    )
    expect(interfaceDescriptions).toHaveLength(6)
    expect(
      interfaceDescriptions.every(
        (description) =>
          description.getAttribute("aria-hidden") === null &&
          description.textContent.trim().length > 0
      )
    ).toBe(true)
    expect(
      container.querySelectorAll("[data-wireframe-placeholder]")
    ).toHaveLength(0)
    // The PM-notes region is gone; the page ends at the footer.
    expect(container.querySelector("[data-wireframe-appendix]")).toBeNull()
    expect(screen.queryAllByRole("complementary")).toHaveLength(0)

    const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4")).map(
      (heading) => Number(heading.tagName.slice(1))
    )
    expect(levels[0]).toBe(1)
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1)
    }

    expect(footer.previousElementSibling).toBe(main)
    expect(footer.nextElementSibling).toBeNull()
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
        name: "Xiao Ming's family may qualify for support. Nobody has applied.",
      })
    ).not.toBeNull()
    expect(
      screen.getByRole("heading", {
        name: "Sent. Seen. On file.",
      })
    ).not.toBeNull()

    // The three-step explorer has no slot on the GA page.
    expect(
      screen.queryByRole("heading", { name: "Explore the flow in three steps" })
    ).toBeNull()
    expect(screen.queryByText("Placement to confirm")).toBeNull()
    expect(screen.queryAllByRole("combobox")).toHaveLength(0)
    expect(screen.queryAllByRole("dialog")).toHaveLength(0)

    const capabilities = screen
      .getByRole("heading", {
        name: "The apps, up close",
      })
      .closest("section")
    expect(capabilities?.querySelectorAll("ol > li")).toHaveLength(4)

    const formTeachers = screen.getByRole("heading", {
      name: "Form Teachers",
    })
    const audiences = formTeachers.closest("section")
    expect(formTeachers).not.toBeNull()
    expect(audiences?.querySelectorAll("ul > li")).toHaveLength(3)
    expect(
      screen.getByRole("heading", { name: "Key Personnel" })
    ).not.toBeNull()
    expect(
      screen.getByRole("heading", { name: "School Leaders" })
    ).not.toBeNull()
    expect(
      screen.getAllByText(
        "PM to confirm the question and approved answer for this audience."
      )
    ).toHaveLength(3)
    expect(
      screen.getByText("Proof copy and testimonial permission")
    ).not.toBeNull()
    expect(screen.getByText("Public support route")).not.toBeNull()
  })

  it("describes every proposed interface with the synthetic care-journey guardrails", () => {
    const data = buildReadyReviewPage()

    const { container } = render(<ContentReviewPage data={data} />)
    const descriptions = Array.from(
      container.querySelectorAll("[data-interface-description]")
    )

    expect(descriptions).toHaveLength(6)
    expect(
      descriptions.every(
        (description) =>
          description.querySelector("h2, h4") &&
          description.querySelectorAll("ul > li").length === 3
      )
    ).toBe(true)
    expect(
      screen.getByRole("heading", {
        name: "Class view with one synthetic student",
      })
    ).not.toBeNull()
    expect(screen.getByText("No conduct or attention markers")).not.toBeNull()
    expect(
      screen.getByText(
        "Ground the story in an ordinary class. Show Xiao Ming as one row among many, with no conduct, offence, or attention marker anywhere in the frame."
      )
    ).not.toBeNull()
    expect(JSON.stringify(data).toLowerCase()).not.toContain("swan")
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

  it("renders no PM-notes region and leaks no raw server material", () => {
    const data = buildReadyReviewPage()

    const { container } = render(<ContentReviewPage data={data} />)
    // Governance detail is server-side only now — none of it reaches the page.
    expect(screen.queryByRole("heading", { name: "PM review notes" })).toBeNull()
    expect(screen.queryByText("Provider-neutral")).toBeNull()
    expect(screen.queryByText("Page metadata draft")).toBeNull()
    expect(screen.queryByText("Measurement boundary")).toBeNull()
    expect(screen.queryByText("Capability mapping:")).toBeNull()
    expect(container.querySelector("[data-review-reference]")).toBeNull()

    const html = container.innerHTML.toLowerCase()
    for (const prohibitedValue of [
      "tw-ia-order",
      "tw-story-composed",
      "contextual-intelligence",
      "hey-talia",
      "xingyu",
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
      "Every student. No support left unclaimed"
    )
    expect(container.innerHTML).not.toContain("manifest-coverage")
    expect(container.innerHTML).not.toContain("CONTENT_REVIEW_INVALID")
    expect(container.innerHTML).not.toContain("build snapshot")
  })
})
