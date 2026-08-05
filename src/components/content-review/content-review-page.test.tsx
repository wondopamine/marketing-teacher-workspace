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
  it("renders a product-led landing page with a direct footer", () => {
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
      "See what is changing. Know what to do next."
    )
    expect(footer.previousElementSibling).toBe(main)
    expect(within(main).queryByRole("contentinfo")).toBeNull()
    expect(screen.queryByRole("complementary")).toBeNull()
    expect(screen.queryByLabelText("Wireframe status")).toBeNull()
    expect(screen.queryByText("Landing page wireframe")).toBeNull()
    expect(container.querySelector("[data-wireframe-appendix]")).toBeNull()
    expect(container.querySelectorAll("img, video, canvas")).toHaveLength(0)
    expect(
      container.querySelectorAll("[data-wireframe-placeholder]")
    ).toHaveLength(0)

    const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4")).map(
      (heading) => Number(heading.tagName.slice(1))
    )
    expect(levels[0]).toBe(1)
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1)
    }
  })

  it("groups the five-record story and three-record explorer into three acts", () => {
    const data = buildReadyReviewPage()
    const { container } = render(<ContentReviewPage data={data} />)
    const acts = Array.from(container.querySelectorAll("[data-journey-act]"))

    expect(acts).toHaveLength(3)
    expect(acts.map((act) => act.querySelector("h2")?.textContent)).toEqual([
      "Notice the progress",
      "Choose the next step",
      "Keep everyone aligned",
    ])
    expect(acts[1].getAttribute("data-journey-act-layout")).toBe(
      "stage-left-at-lg"
    )
    const actTwoColumns = acts[1].firstElementChild
    expect(actTwoColumns?.children[0]?.className).toContain("lg:order-2")
    expect(actTwoColumns?.children[1]?.className).toContain("lg:order-1")
    expect(container.querySelectorAll("[data-product-stage]")).toHaveLength(4)
    expect(
      container.querySelectorAll("[data-interface-description]")
    ).toHaveLength(4)
    expect(
      screen.queryByRole("heading", { name: /explore the flow/i })
    ).toBeNull()

    for (const headline of [
      "A student is contributing with growing confidence.",
      "Recent moments reveal a pattern.",
      "A practical next step is ready to review.",
      "Turn the progress into a family update.",
      "Share the update. Keep the record connected.",
      "Start with one positive-growth moment.",
      "See the relevant signals and next step together.",
      "Review the message or Posts action before anything is shared.",
    ]) {
      expect(screen.getByText(headline)).not.toBeNull()
    }
  })

  it("uses safe synthetic product stages and public capability labels", () => {
    const data = buildReadyReviewPage()
    const { container } = render(<ContentReviewPage data={data} />)
    const html = container.innerHTML.toLowerCase()

    for (const safeLabel of [
      "Synthetic class example",
      "Student A · Primary 4",
      "Growing confidence",
      "Volunteered an answer during group sharing.",
      "Invite another short contribution after pair discussion.",
      "Draft family update · Teacher review required",
      "Posts preview · Not shared",
    ]) {
      expect(screen.getAllByText(safeLabel).length).toBeGreaterThan(0)
    }
    expect(screen.getAllByText("Student Insights")).not.toHaveLength(0)
    expect(screen.getAllByText("Next-step guidance")).not.toHaveLength(0)
    expect(screen.getAllByText("Message drafting")).not.toHaveLength(0)
    expect(screen.getAllByText("Posts")).not.toHaveLength(0)

    for (const prohibitedValue of [
      "contextual-intelligence",
      "hey-talia",
      "ai agent",
      "xingyu",
      "xiao ming",
      "bursary",
      "swan",
      "undefined",
      ">null<",
    ]) {
      expect(html).not.toContain(prohibitedValue)
    }
  })

  it("distributes pending evidence and preserves static action boundaries", () => {
    const data = buildReadyReviewPage()
    const { container } = render(<ContentReviewPage data={data} />)
    const requests = Array.from(
      container.querySelectorAll("[data-approval-request]")
    )

    expect(requests.map((request) => request.textContent)).toEqual([
      expect.stringContaining("Verified adoption metric"),
      expect.stringContaining(
        "Approved anonymous teacher quote, role, and school level"
      ),
      expect.stringContaining("Approved security and data-handling assurance"),
    ])
    expect(screen.getAllByText("Sign in with Google")).toHaveLength(2)
    expect(
      screen.getAllByText("Use your @edu.gov.sg account.").length
    ).toBeGreaterThan(0)
    expect(container.querySelectorAll("[data-wireframe-action]")).toHaveLength(
      2
    )
    expect(screen.getByText("Send feedback")).not.toBeNull()
    expect(screen.queryAllByRole("button")).toHaveLength(0)
    expect(screen.queryAllByRole("link")).toHaveLength(0)
    expect(container.querySelectorAll("[href]")).toHaveLength(0)
    expect(container.querySelectorAll("input, select, textarea")).toHaveLength(
      0
    )
  })

  it("keeps trust and access facts concise without adding approval slots", () => {
    const data = buildReadyReviewPage()
    const { container } = render(<ContentReviewPage data={data} />)

    for (const value of [
      "Teacher-controlled",
      "Review and edit before anything is shared.",
      "Synthetic example",
      "No real student information.",
      "Educator access",
      "Access Teacher Workspace",
      "Public support route · Pending",
    ]) {
      expect(screen.getByText(value)).not.toBeNull()
    }
    expect(screen.getByText("Teacher control").className).toContain(
      "text-background/60"
    )
    expect(container.querySelectorAll("[data-approval-request]")).toHaveLength(
      3
    )
    expect(container.textContent).not.toContain(data.appendix.support.summary)
  })

  it("keeps four capabilities and three audiences in the landing story", () => {
    const data = buildReadyReviewPage()
    render(<ContentReviewPage data={data} />)

    const capabilities = screen
      .getByRole("heading", { name: "What Teacher Workspace brings together" })
      .closest("section")
    expect(capabilities?.querySelectorAll("ol > li")).toHaveLength(4)

    const audiences = screen
      .getByRole("heading", { name: "Intended audiences" })
      .closest("section")
    expect(audiences?.querySelectorAll("ul > li")).toHaveLength(3)
    expect(
      screen.getByRole("heading", { name: "Form Teachers" })
    ).not.toBeNull()
    expect(
      screen.getByRole("heading", { name: "Key Personnel" })
    ).not.toBeNull()
    expect(
      screen.getByRole("heading", { name: "School Leaders" })
    ).not.toBeNull()
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
    expect(container.innerHTML).not.toContain("CONTENT_REVIEW_INVALID")
  })
})
