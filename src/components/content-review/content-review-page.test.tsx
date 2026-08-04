import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ContentReviewPage } from "./content-review-page"
import { buildContentReviewPageDto } from "@/content/landing-v2-review-state.server"

describe("ContentReviewPage", () => {
  it("renders one neutral semantic document with the footer outside main", () => {
    const data = buildContentReviewPageDto()
    expect(data.kind).toBe("ready")

    const { container } = render(<ContentReviewPage data={data} />)
    const main = screen.getByRole("main")
    const footer = screen.getByRole("contentinfo", { name: "Content review" })

    expect(main.id).toBe("main")
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Teacher Workspace content review"
    )
    expect(within(main).queryByRole("contentinfo")).toBeNull()
    expect(container.querySelectorAll("img, video, canvas")).toHaveLength(0)

    const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4")).map(
      (heading) => Number(heading.tagName.slice(1))
    )
    expect(levels[0]).toBe(1)
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1)
    }

    expect(footer.previousElementSibling).toBe(main)
  })

  it("renders the accepted IA, static explorer, decisions, and status actions", () => {
    const data = buildContentReviewPageDto()
    expect(data.kind).toBe("ready")
    if (data.kind !== "ready") return

    const { container } = render(<ContentReviewPage data={data} />)
    const sectionReferences = Array.from(
      container.querySelectorAll("[data-review-section]")
    ).map((element) => element.getAttribute("data-review-reference"))

    expect(sectionReferences).toEqual(
      data.sections.map((section) => section.review.reviewReference)
    )
    expect(screen.getByText("TW-IA-ORDER")).not.toBeNull()
    expect(screen.getByText("TW-STORY-COMPOSED")).not.toBeNull()

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
      screen.getByText("Form Teachers: question and answer")
    ).not.toBeNull()
    expect(
      screen.getByText("Proof copy and testimonial permission")
    ).not.toBeNull()
    expect(screen.getByText("Public support route")).not.toBeNull()

    for (const status of [
      "blocked",
      "decision-required",
      "reconfirmation-required",
      "unreviewed",
      "partially-reviewed",
      "reviewed-current",
    ]) {
      expect(screen.getByText(status, { selector: "dt" })).not.toBeNull()
    }
  })

  it("renders exactly two product links and one feedback link as native links", () => {
    const data = buildContentReviewPageDto()
    expect(data.kind).toBe("ready")
    if (data.kind !== "ready") return

    render(<ContentReviewPage data={data} />)

    const productHref = data.sections
      .flatMap((section) => section.entries)
      .find(
        (entry) => entry.kind === "content" && entry.link?.purpose === "product"
      )
    const feedbackHref = data.sections
      .flatMap((section) => section.entries)
      .find(
        (entry) =>
          entry.kind === "content" && entry.link?.purpose === "feedback"
      )

    expect(productHref?.kind).toBe("content")
    expect(feedbackHref?.kind).toBe("content")
    if (
      productHref?.kind !== "content" ||
      feedbackHref?.kind !== "content" ||
      !productHref.link ||
      !feedbackHref.link
    ) {
      return
    }

    const productLinks = screen.getAllByRole("link", {
      name: productHref.link.label,
    })
    expect(productLinks).toHaveLength(2)
    expect(
      screen.getAllByText(productHref.link.note ?? "").length
    ).toBeGreaterThanOrEqual(2)
    expect(
      screen.getAllByRole("link", { name: feedbackHref.link.label })
    ).toHaveLength(1)

    for (const link of [
      ...productLinks,
      ...screen.getAllByRole("link", { name: feedbackHref.link.label }),
    ]) {
      expect(link.getAttribute("target")).toBe("_blank")
      expect(link.getAttribute("rel")).toBe("noreferrer")
    }
  })

  it("renders the governance appendix without leaking raw server material", () => {
    const data = buildContentReviewPageDto()
    expect(data.kind).toBe("ready")

    const { container } = render(<ContentReviewPage data={data} />)
    expect(
      screen.getByRole("heading", { name: "Review appendix" })
    ).not.toBeNull()
    expect(screen.getByText("Provider-neutral")).not.toBeNull()
    expect(screen.getAllByText("Student Insights").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Message drafting").length).toBeGreaterThan(0)

    const html = container.innerHTML.toLowerCase()
    for (const prohibitedValue of [
      "contextual-intelligence",
      "hey-talia",
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
    expect(screen.getByText("CONTENT_REVIEW_INVALID")).not.toBeNull()
    expect(within(main).getByText(/stop this review/i)).not.toBeNull()
    expect(screen.getByRole("link", { name: "Send feedback" })).not.toBeNull()
    expect(container.textContent).not.toContain(
      "See the progress worth building on"
    )
    expect(container.innerHTML).not.toContain("manifest-coverage")
  })
})
