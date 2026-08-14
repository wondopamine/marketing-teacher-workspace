import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ContentReviewPage } from "./content-review-page"
import {
  ReviewAnnotationProvider,
  reviewAnnotations,
} from "./review-annotations"
import type { TeacherPreviewPageDataDto } from "@/content/teacher-preview-document"
import { buildTeacherPreviewPageData } from "@/content/teacher-preview-document.server"

type ReadyTeacherPreviewPage = Extract<
  TeacherPreviewPageDataDto,
  { kind: "ready" }
>

function buildReadyReviewPage(): ReadyTeacherPreviewPage {
  const data = buildTeacherPreviewPageData()
  if (data.kind !== "ready") {
    throw new Error("Expected the default teacher preview document to be ready")
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
      "See what is changing. Know what to do next."
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

  it("renders the canonical replacement document in its approved order", () => {
    const { data } = renderReadyReviewPage()

    expect(data.document.sections.map((section) => section.kind)).toEqual([
      "promise",
      "capabilities",
      "connected-story",
      "connected-story",
      "connected-story",
      "reveal",
      "close",
    ])
    expect(data.document.brand).toBe("Teacher Workspace")
    expect(data.document.footer.brand).toBe("Teacher Workspace")
  })

  it("keeps reviewer rationale and pending decisions out of the teacher copy", () => {
    const { container } = renderReadyReviewPage()
    const preview = container.querySelector<HTMLElement>(
      "[data-teacher-preview]"
    )
    expect(preview).not.toBeNull()
    if (!preview) return

    expect(preview.textContent).toContain("Proposed interface")
    expect(preview.textContent).not.toContain("Story rationale")
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
        name: "A student is contributing with growing confidence.",
      })
    ).not.toBeNull()
    expect(
      screen.getByRole("heading", {
        name: "Share the approved update through Posts.",
      })
    ).not.toBeNull()
  })

  it("shows six aligned interface briefs with their product locations", () => {
    const { container, data } = renderReadyReviewPage()
    const figures = Array.from(
      container.querySelectorAll("[data-product-screen]")
    )
    const briefs = Array.from(
      container.querySelectorAll("[data-interface-brief]")
    )
    const locations = screen.getAllByRole("navigation", {
      name: "Product location",
    })
    const hero = data.document.sections.find(
      (section) => section.kind === "promise"
    )
    const stories = data.document.sections.filter(
      (section) => section.kind === "connected-story"
    )
    if (hero?.kind !== "promise") throw new Error("Expected the promise")
    const documentScreens = [
      hero.screen,
      ...stories.flatMap((story) => story.steps.map((step) => step.screen)),
    ]

    expect(figures).toHaveLength(6)
    expect(briefs).toHaveLength(6)
    expect(locations).toHaveLength(6)
    expect(
      screen.queryByRole("link", { name: /screen at full size$/ })
    ).toBeNull()
    expect(documentScreens.map((item) => item.src)).toEqual([
      "/content-review/screens/student-profile.png",
      "/content-review/screens/student-insights-class.png",
      "/content-review/screens/student-profile-family.png",
      "/content-review/screens/guidance.png",
      "/content-review/screens/post-composer.png",
      "/content-review/screens/post-read-tracking.png",
    ])

    documentScreens.forEach((item, index) => {
      expect(briefs[index].textContent).toContain(item.brief?.heading)
      for (const crumb of item.breadcrumb) {
        expect(locations[index].textContent).toContain(crumb)
      }
    })
  })

  it("renders accessible review pins without turning teacher actions into live controls", () => {
    const { container, data } = renderReadyReviewPage()
    const promise = data.document.sections.find(
      (section) => section.kind === "promise"
    )
    const close = data.document.sections.find(
      (section) => section.kind === "close"
    )

    const productActions = Array.from(
      container.querySelectorAll("[data-wireframe-action]")
    )
    expect(productActions).toHaveLength(2)
    expect(productActions.every((action) => action.tagName === "SPAN")).toBe(
      true
    )
    expect(promise?.action).not.toBeNull()
    expect(close?.action).not.toBeNull()
    expect(data.document.footer.feedbackLabel).toBeTruthy()

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

    expect(reviewAnnotations).toHaveLength(12)
  })

  it("renders the published public document without a review provider or pins", () => {
    const data = buildReadyReviewPage()
    const { container } = render(
      <ContentReviewPage data={data} showReviewPins={false} />
    )

    expect(screen.getByRole("heading", { level: 1 })).not.toBeNull()
    expect(container.querySelector("[data-review-annotation]")).toBeNull()
    expect(screen.queryByRole("button")).toBeNull()
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
    const data: TeacherPreviewPageDataDto = { kind: "error" }
    const { container } = render(<ContentReviewPage data={data} />)

    expect(screen.getByRole("heading", { level: 1 })).not.toBeNull()
    expect(container.querySelector("[data-teacher-preview]")).toBeNull()
    expect(container.querySelector("[data-product-screen]")).toBeNull()
  })
})
