import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ContentReviewPage } from "./content-review-page"
import {
  ReviewAnnotationProvider,
  productScreenReferences,
  reviewAnnotations,
} from "./review-annotations"
import type { ContentReviewWireframeReadyPageDto } from "@/content/landing-v2-review.types"
import { buildContentReviewPageDto } from "@/content/landing-v2-review-state.server"

function buildReadyReviewPage(): ContentReviewWireframeReadyPageDto {
  const data = buildContentReviewPageDto()
  if (data.kind !== "ready") {
    throw new Error("Expected the default content-review DTO to be ready")
  }
  return data
}

function renderReadyReviewPage() {
  const data = buildReadyReviewPage()
  const rendered = render(
    <ReviewAnnotationProvider>
      <ContentReviewPage data={data} />
    </ReviewAnnotationProvider>
  )
  return { data, ...rendered }
}

describe("ContentReviewPage", () => {
  it("renders one teacher-facing preview with a complete document structure", () => {
    const { container } = renderReadyReviewPage()
    const preview = container.querySelector("[data-teacher-preview]")
    const main = screen.getByRole("main")
    const footer = screen.getByRole("contentinfo", {
      name: "Teacher Workspace footer",
    })

    expect(preview).not.toBeNull()
    expect(main.id).toBe("main")
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Every student gets the support they qualify for"
    )
    expect(within(main).queryByRole("contentinfo")).toBeNull()
    expect(footer.closest("[data-teacher-preview]")).toBe(preview)

    const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4")).map(
      (heading) => Number(heading.tagName.slice(1))
    )
    expect(levels[0]).toBe(1)
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1)
    }
  })

  it("keeps reviewer rationale and pending decisions out of the teacher copy", () => {
    const { container } = renderReadyReviewPage()
    const preview = container.querySelector<HTMLElement>(
      "[data-teacher-preview]"
    )
    expect(preview).not.toBeNull()
    if (!preview) return

    expect(preview.textContent).not.toContain("Proposed interface")
    expect(preview.textContent).not.toContain("Story flow")
    expect(preview.textContent).not.toContain(
      "The page follows one synthetic student through a single care journey"
    )
    expect(preview.textContent).not.toContain("Question for the PM")
    expect(preview.textContent).not.toContain("Interface not built yet")
    expect(preview.textContent).not.toContain("GA launch line")
    expect(preview.textContent).not.toContain(
      "PM to confirm the question and approved answer"
    )
    const reviewChromeInsidePreview = Array.from(
      preview.querySelectorAll<HTMLElement>("[data-review-chrome]")
    )
    expect(reviewChromeInsidePreview.length).toBeGreaterThan(0)
    expect(
      reviewChromeInsidePreview.every((element) =>
        element.hasAttribute("data-review-annotation")
      )
    ).toBe(true)
    expect(
      reviewChromeInsidePreview.every((element) =>
        /^\d+$/.test(element.textContent.trim())
      )
    ).toBe(true)
    expect(
      screen.queryByRole("heading", { name: "For the people who run schools" })
    ).toBeNull()
    expect(screen.queryByRole("heading", { name: "Real schools" })).toBeNull()

    expect(
      screen.getByRole("heading", {
        name: "Xiao Ming's family may qualify for support. Nobody has applied.",
      })
    ).not.toBeNull()
    expect(
      screen.getByRole("heading", {
        name: "The family hears from you, and the record shows it.",
      })
    ).not.toBeNull()
  })

  it("shows six actual product screens with breadcrumbs instead of prose specifications", () => {
    const { container } = renderReadyReviewPage()
    const figures = Array.from(
      container.querySelectorAll("[data-product-screen]")
    )
    const images = Array.from(
      container.querySelectorAll<HTMLImageElement>("[data-product-screen] img")
    )
    const locations = screen.getAllByRole("navigation", {
      name: "Product location",
    })
    const fullSizeLinks = screen.getAllByRole("link", {
      name: /screen at full size$/,
    })
    const references = [
      productScreenReferences.hero,
      ...productScreenReferences.story,
    ]

    expect(figures).toHaveLength(6)
    expect(images).toHaveLength(6)
    expect(locations).toHaveLength(6)
    expect(fullSizeLinks).toHaveLength(6)
    expect(container.querySelector("[data-interface-description]")).toBeNull()

    references.forEach((reference, index) => {
      expect(images[index].getAttribute("src")).toBe(reference.image)
      expect(images[index].getAttribute("alt")).toBe(reference.alt)
      expect(fullSizeLinks[index].getAttribute("href")).toBe(reference.image)
      for (const crumb of reference.breadcrumb) {
        expect(locations[index].textContent).toContain(crumb)
      }
    })
  })

  it("renders accessible review pins without turning teacher actions into live controls", () => {
    const { container, data } = renderReadyReviewPage()
    const entries = data.sections.flatMap((section) => section.entries)
    const productAction = entries.find(
      (entry) => entry.kind === "content" && entry.action?.purpose === "product"
    )
    const feedbackAction = entries.find(
      (entry) =>
        entry.kind === "content" && entry.action?.purpose === "feedback"
    )

    const productActions = Array.from(
      container.querySelectorAll("[data-wireframe-action]")
    )
    expect(productActions).toHaveLength(2)
    expect(productActions.every((action) => action.tagName === "SPAN")).toBe(
      true
    )
    expect(productAction?.kind).toBe("content")
    expect(feedbackAction?.kind).toBe("content")

    const reviewButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button")
    )
    expect(reviewButtons.length).toBeGreaterThan(0)
    expect(
      reviewButtons.every((button) => button.closest("[data-review-chrome]"))
    ).toBe(true)
    for (const button of reviewButtons) {
      expect(button.getAttribute("aria-label")).toMatch(/^Review note:/)
      expect(button.hasAttribute("aria-expanded")).toBe(true)
    }

    expect(reviewAnnotations).toHaveLength(11)
  })

  it("keeps raw governance material and real-student identifiers out of the preview", () => {
    const { container } = renderReadyReviewPage()
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

  it("renders a stop-review error without partial teacher content", () => {
    const data = buildContentReviewPageDto({ manifest: [] })
    expect(data.kind).toBe("error")

    const { container } = render(<ContentReviewPage data={data} />)
    expect(screen.getByRole("heading", { level: 1 })).not.toBeNull()
    expect(container.querySelector("[data-teacher-preview]")).toBeNull()
    expect(container.querySelector("[data-product-screen]")).toBeNull()
  })
})
