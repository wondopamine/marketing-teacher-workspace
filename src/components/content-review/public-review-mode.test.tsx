import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { useState } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PublicReviewMode } from "./public-review-mode"
import { ReviewAnnotationProvider, ReviewPin } from "./review-annotations"
import { getReviewSpans } from "@/server/review-feedback"

vi.mock("@/server/review-feedback", () => ({
  getReviewSpans: vi.fn(),
  submitReviewFeedback: vi.fn(),
}))

const mockedGetReviewSpans = vi.mocked(getReviewSpans)

function renderReviewTools() {
  return render(
    <ReviewAnnotationProvider>
      <PublicReviewMode />
      <main>
        <h1>Teacher heading</h1>
        <ReviewPin id="notice-and-understand-overview" />
      </main>
    </ReviewAnnotationProvider>
  )
}

describe("PublicReviewMode", () => {
  beforeEach(() => {
    mockedGetReviewSpans.mockReset()
    mockedGetReviewSpans.mockResolvedValue({
      canSubmit: false,
      spans: [
        {
          id: "teacher-heading",
          file: "content/landing/01-hero.mdx",
          label: "Teacher heading",
          text: "Teacher heading",
          start: 0,
          end: 15,
          kind: "prose",
        },
      ],
    })
  })

  it("keeps the preview full width until a control or pin opens one rationale", async () => {
    const { container } = renderReviewTools()

    const panel = container.querySelector<HTMLElement>(
      "#review-rationale-panel"
    )
    expect(panel).not.toBeNull()
    if (!panel) return
    expect(panel.hidden).toBe(true)
    expect(
      screen
        .getByRole("button", { name: "Show rationale" })
        .getAttribute("aria-expanded")
    ).toBe("false")

    fireEvent.click(screen.getByRole("button", { name: "Show rationale" }))
    expect(panel.hidden).toBe(false)
    expect(
      within(panel).getByText("Focused product peek at the fold")
    ).not.toBeNull()
    expect(screen.queryByText("Review notes")).toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "Hide rationale" }))
    expect(panel.hidden).toBe(true)

    fireEvent.click(
      screen.getByRole("button", {
        name: "Review note: Notice and understand",
      })
    )
    expect(panel.hidden).toBe(false)
    expect(within(panel).getByText("Notice and understand")).not.toBeNull()
    expect(
      screen.getByText("Section rationale · Notice and understand")
    ).not.toBeNull()

    fireEvent.change(screen.getByRole("textbox", { name: "Add a note" }), {
      target: { value: "Keep this section comment" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Add note" }))
    expect(screen.getByText("Your notes (1)")).not.toBeNull()
    expect(screen.getByText("Keep this section comment")).not.toBeNull()
    expect(
      (
        await screen.findByRole<HTMLButtonElement>("button", {
          name: "Copy for the designer (1)",
        })
      ).disabled
    ).toBe(false)

    const scrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    })
    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation(
      (query) =>
        ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList
    )
    fireEvent.click(screen.getByRole("button", { name: "Show me" }))
    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "auto",
        block: "center",
      })
    })
    matchMedia.mockRestore()

    fireEvent.click(screen.getByRole("button", { name: "Hide rationale" }))
    fireEvent.click(screen.getByRole("button", { name: "Show rationale" }))
    expect(screen.getByText("Keep this section comment")).not.toBeNull()

    screen.getByRole("textbox", { name: "Add a note" }).focus()
    fireEvent.keyDown(window, { key: "Escape" })
    expect(panel.hidden).toBe(true)
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Show rationale" })
      )
    })

    const storyPin = screen.getByRole("button", {
      name: "Review note: Notice and understand",
    })
    fireEvent.click(storyPin)
    screen.getByRole("textbox", { name: "Add a note" }).focus()
    fireEvent.keyDown(window, { key: "Escape" })
    await waitFor(() => {
      expect(document.activeElement).toBe(storyPin)
    })
  })

  it("separates direct editing from section comments without losing drafts", async () => {
    const { container } = renderReviewTools()

    fireEvent.click(screen.getByRole("button", { name: "Show rationale" }))
    const note = screen.getByRole("textbox", { name: "Add a note" })
    fireEvent.change(note, { target: { value: "Keep this draft" } })

    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))

    const finish = await screen.findByRole("button", {
      name: "Finish editing",
    })
    expect(finish.getAttribute("aria-pressed")).toBe("true")
    expect(
      container.querySelector<HTMLElement>("#review-rationale-panel")?.hidden
    ).toBe(true)
    expect(
      screen.queryByRole("button", {
        name: "Review note: Notice and understand",
      })
    ).toBeNull()

    const editableHeading = screen.getByRole("textbox", {
      name: "Edit Teacher heading",
    })
    editableHeading.focus()
    editableHeading.textContent = "A clearer teacher heading"
    fireEvent.click(finish)

    await waitFor(() => {
      expect(
        screen
          .getByRole("button", { name: "Edit content" })
          .getAttribute("aria-pressed")
      ).toBe("false")
    })
    expect(
      screen.getByRole("button", {
        name: "Review note: Notice and understand",
      })
    ).not.toBeNull()
    expect(
      screen.getAllByText("1 edit and 0 notes ready.").length
    ).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole("button", { name: "Show rationale" }))
    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "Add a note",
      }).value
    ).toBe("Keep this draft")
    expect(screen.getByText("A clearer teacher heading")).not.toBeNull()
    expect(screen.getByText("Teacher heading — Page")).not.toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    expect(
      (await screen.findByRole("textbox", { name: "Edit Teacher heading" }))
        .textContent
    ).toBe("A clearer teacher heading")
  })

  it("preserves an explicit whole-page target with its draft", () => {
    const { container } = renderReviewTools()

    fireEvent.click(screen.getByRole("button", { name: "Show rationale" }))
    fireEvent.click(
      screen.getByRole("button", {
        name: "Comment on the whole page instead",
      })
    )
    fireEvent.change(screen.getByRole("textbox", { name: "Add a note" }), {
      target: { value: "Whole-page draft" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Hide rationale" }))
    fireEvent.click(screen.getByRole("button", { name: "Show rationale" }))

    expect(
      container.querySelector<HTMLElement>("#review-rationale-panel")?.hidden
    ).toBe(false)
    expect(screen.getByText("Whole page")).not.toBeNull()
    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Add a note" })
        .value
    ).toBe("Whole-page draft")
  })

  it("hands Cmd+K and Escape to the persistent CMS editor", () => {
    function ExternalEditorHarness() {
      const [active, setActive] = useState(false)
      const toggle = () => setActive((current) => !current)
      return (
        <PublicReviewMode
          externalEditor={{
            active,
            busy: false,
            controls: (
              <button type="button" onClick={toggle}>
                {active ? "Finish editing" : "Edit content"}
              </button>
            ),
            statusMessage: active ? "Editing is on." : "Ready to review.",
            onToggle: toggle,
          }}
        />
      )
    }

    render(
      <ReviewAnnotationProvider>
        <ExternalEditorHarness />
      </ReviewAnnotationProvider>
    )

    fireEvent.keyDown(window, { key: "k", metaKey: true })
    expect(
      screen.getByRole("button", { name: "Finish editing" })
    ).not.toBeNull()
    expect(screen.getByText("Editing is on.")).not.toBeNull()
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Show rationale" })
        .disabled
    ).toBe(true)

    fireEvent.keyDown(window, { key: "Escape" })
    expect(screen.getByRole("button", { name: "Edit content" })).not.toBeNull()
    expect(screen.getByText("Ready to review.")).not.toBeNull()
  })

  it("reopens edits when two blocks now have the same text", async () => {
    mockedGetReviewSpans.mockResolvedValue({
      canSubmit: false,
      spans: [
        {
          id: "alpha",
          file: "content/landing/01-hero.mdx",
          label: "Alpha copy",
          text: "Alpha",
          start: 0,
          end: 5,
          kind: "prose",
        },
        {
          id: "beta",
          file: "content/landing/01-hero.mdx",
          label: "Beta copy",
          text: "Beta",
          start: 6,
          end: 10,
          kind: "prose",
        },
      ],
    })
    render(
      <ReviewAnnotationProvider>
        <PublicReviewMode />
        <main>
          <h1>Alpha</h1>
          <p>Beta</p>
        </main>
      </ReviewAnnotationProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    const alpha = await screen.findByRole("textbox", {
      name: "Edit Alpha copy",
    })
    alpha.focus()
    alpha.textContent = "Beta"
    fireEvent.click(screen.getByRole("button", { name: "Finish editing" }))
    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))

    expect(
      (await screen.findByRole("textbox", { name: "Edit Alpha copy" }))
        .textContent
    ).toBe("Beta")
    expect(
      screen.getByRole("textbox", { name: "Edit Beta copy" }).textContent
    ).toBe("Beta")
  })
})
