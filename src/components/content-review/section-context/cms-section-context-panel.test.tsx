import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { readCmsComments, writeCmsComment } from "../editor/cms-client"
import { ReviewAnnotationProvider, ReviewPin } from "../review-annotations"
import { CmsSectionContextPanel } from "./cms-section-context-panel"
import type { CmsComment } from "@/db/content-repository.server"

vi.mock("../editor/cms-client", () => ({
  readCmsComments: vi.fn(),
  writeCmsComment: vi.fn(),
}))

const mockedReadComments = vi.mocked(readCmsComments)
const mockedWriteComment = vi.mocked(writeCmsComment)
const pageId = "b7a1e972-1758-4815-87b9-9697a324a667"
const versionId = "00000000-0000-4000-8000-000000000001"
const openingId = "02e79e5c-bd01-47e5-be54-95b7c939c358"
const storyId = "e4a6a36b-bb0a-4977-854b-66f3db071123"

const annotations = [
  {
    id: openingId,
    title: "Opening promise",
    rationale: "The opening helps teachers judge the page quickly.",
    details: ["Does the promise match the current product?"],
    pending: null,
  },
  {
    id: storyId,
    title: "Connected story",
    rationale: "One synthetic student keeps the steps connected.",
    details: ["Could any detail look like real student data?"],
    pending: "Confirm the approved eligibility signals.",
  },
] as const

function comment(overrides: Partial<CmsComment> = {}): CmsComment {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    pageId,
    targetId: openingId,
    targetVersionId: versionId,
    subject: "page-content",
    body: "Make the opening more specific.",
    displayName: "Alex Tan",
    status: "open",
    createdAt: "2026-08-12T00:00:00.000Z",
    updatedAt: "2026-08-12T00:00:00.000Z",
    targetState: "active",
    targetKind: "section",
    targetChanged: true,
    ...overrides,
  }
}

function renderPanel() {
  const onNameChange = vi.fn()
  const onStatusMessage = vi.fn()
  render(
    <ReviewAnnotationProvider annotations={annotations}>
      <ReviewPin id={openingId} />
      <ReviewPin id={storyId} />
      <CmsSectionContextPanel
        pageId={pageId}
        versionId={versionId}
        csrfToken="csrf-token"
        displayName="Alex Tan"
        onDisplayNameChange={onNameChange}
        onStatusMessage={onStatusMessage}
      />
    </ReviewAnnotationProvider>
  )
  return { onNameChange, onStatusMessage }
}

describe("CMS section context panel", () => {
  beforeEach(() => {
    mockedReadComments.mockReset()
    mockedWriteComment.mockReset()
    mockedReadComments.mockResolvedValue({
      ok: true,
      comments: [comment()],
    })
  })

  it("shows reviewer-only context and durable feedback state", async () => {
    const { onStatusMessage } = renderPanel()

    expect(
      screen.getByText(
        "Reviewer-only. Teachers will not see this panel or its feedback."
      )
    ).not.toBeNull()
    expect(screen.getByText("Why this section is here")).not.toBeNull()
    expect(
      screen.getByText("The opening helps teachers judge the page quickly.")
    ).not.toBeNull()
    expect(
      await screen.findByText("Make the opening more specific.")
    ).not.toBeNull()
    expect(
      screen.getByText("The page content changed after this feedback was left.")
    ).not.toBeNull()

    let finishStatusUpdate: () => void = () => undefined
    mockedWriteComment.mockImplementation(async () => {
      await new Promise<void>((resolve) => {
        finishStatusUpdate = resolve
      })
      return {
        ok: true,
        comment: comment({ status: "resolved" }),
      }
    })
    const resolveButton = screen.getByRole("button", { name: "Resolve" })
    resolveButton.focus()
    fireEvent.click(resolveButton)
    expect(screen.getByText("Resolving feedback…")).not.toBeNull()
    expect(resolveButton.getAttribute("aria-disabled")).toBe("true")
    finishStatusUpdate()
    expect(await screen.findByText("Resolved")).not.toBeNull()
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Reopen" })
    )
    expect(onStatusMessage).toHaveBeenCalledWith("Feedback resolved.")
  })

  it("adds feedback about design intent and keeps drafts per target", async () => {
    const added = comment({
      id: "22222222-2222-4222-8222-222222222222",
      targetId: storyId,
      subject: "design-intent",
      body: "Explain why the bursary example was chosen.",
      targetChanged: false,
    })
    mockedWriteComment.mockResolvedValue({ ok: true, comment: added })
    renderPanel()

    const textarea = screen.getByRole("textbox", { name: "Feedback" })
    const emptyAddButton = screen.getByRole<HTMLButtonElement>("button", {
      name: "Add feedback",
    })
    expect(emptyAddButton.disabled).toBe(true)
    expect(emptyAddButton.getAttribute("aria-disabled")).toBe("false")
    fireEvent.change(textarea, { target: { value: "Opening draft" } })
    expect(emptyAddButton.disabled).toBe(false)
    fireEvent.click(
      screen.getByRole("button", { name: "Review note: Connected story" })
    )
    expect(
      screen.getByText("Confirm the approved eligibility signals.")
    ).not.toBeNull()
    fireEvent.click(screen.getByRole("radio", { name: "Design intent" }))
    fireEvent.change(screen.getByRole("textbox", { name: "Feedback" }), {
      target: { value: "Explain why the bursary example was chosen." },
    })
    fireEvent.click(screen.getByRole("button", { name: "Add feedback" }))

    await waitFor(() => {
      expect(mockedWriteComment).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: "create",
          targetId: storyId,
          targetVersionId: versionId,
          subject: "design-intent",
          body: "Explain why the bursary example was chosen.",
        }),
        "csrf-token"
      )
    })
    expect(
      await screen.findByText("Explain why the bursary example was chosen.")
    ).not.toBeNull()

    fireEvent.click(
      screen.getByRole("button", { name: "Review note: Opening promise" })
    )
    expect(
      screen.getByRole<HTMLInputElement>("textbox", { name: "Feedback" }).value
    ).toBe("Opening draft")
  })

  it("retries the failed action and keeps the feedback draft", async () => {
    const added = comment({
      id: "33333333-3333-4333-8333-333333333333",
      body: "Keep this note while the request is retried.",
      targetChanged: false,
    })
    mockedWriteComment
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockResolvedValueOnce({ ok: true, comment: added })
    renderPanel()

    const textarea = screen.getByRole<HTMLTextAreaElement>("textbox", {
      name: "Feedback",
    })
    fireEvent.change(textarea, {
      target: { value: "Keep this note while the request is retried." },
    })
    const addButton = screen.getByRole("button", { name: "Add feedback" })
    addButton.focus()
    fireEvent.click(addButton)

    expect(await screen.findByRole("alert")).not.toBeNull()
    expect(document.activeElement).toBe(addButton)
    expect(textarea.value).toBe("Keep this note while the request is retried.")
    fireEvent.click(screen.getByRole("button", { name: "Try adding again" }))

    await waitFor(() => expect(mockedWriteComment).toHaveBeenCalledTimes(2))
    expect(
      await screen.findByText("Keep this note while the request is retried.")
    ).not.toBeNull()
    expect(textarea.value).toBe("")
  })
})
