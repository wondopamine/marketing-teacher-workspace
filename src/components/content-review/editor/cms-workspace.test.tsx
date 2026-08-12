import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ReviewAnnotationProvider } from "../review-annotations"
import { CmsWorkspace } from "./cms-workspace"
import {
  readCmsComments,
  readCmsHistory,
  readCmsVersion,
  writeCms,
  writeCmsComment,
} from "./cms-client"
import type { CmsVersionContract } from "@/cms/document"
import type {
  CmsVersionHistoryItem,
  CmsVersionSnapshot,
} from "@/db/content-repository.server"
import { digestCmsVersionContract } from "@/cms/canonical.server"
import { homepageV1Contract } from "@/cms/templates/homepage-v1.server"

vi.mock("@/server/review-feedback", () => ({
  getReviewSpans: vi.fn().mockResolvedValue({ canSubmit: false, spans: [] }),
  submitReviewFeedback: vi.fn(),
}))

vi.mock("./cms-client", () => ({
  readCmsComments: vi.fn(),
  readCmsHistory: vi.fn(),
  readCmsVersion: vi.fn(),
  writeCms: vi.fn(),
  writeCmsComment: vi.fn(),
}))

const mockedReadComments = vi.mocked(readCmsComments)
const mockedReadHistory = vi.mocked(readCmsHistory)
const mockedReadVersion = vi.mocked(readCmsVersion)
const mockedWrite = vi.mocked(writeCms)
const mockedWriteComment = vi.mocked(writeCmsComment)

function snapshot(
  versionNumber = 1,
  contract: CmsVersionContract = homepageV1Contract,
  overrides: Partial<CmsVersionSnapshot> = {}
): CmsVersionSnapshot {
  return {
    ...contract,
    pageId: "b7a1e972-1758-4815-87b9-9697a324a667",
    head: {
      versionId: `00000000-0000-4000-8000-${String(versionNumber).padStart(12, "0")}`,
      versionNumber,
      digest: digestCmsVersionContract(contract),
    },
    attributionKind: versionNumber === 1 ? "system-import" : "self-declared",
    editorDisplayName: versionNumber === 1 ? null : "Alex Tan",
    createdAt: `2026-08-12T00:0${versionNumber}:00.000Z`,
    parentVersionId: null,
    restoredFromVersionId: null,
    ...overrides,
  }
}

function historyItem(
  version: CmsVersionSnapshot,
  options: { current?: boolean; published?: boolean } = {}
): CmsVersionHistoryItem {
  return {
    head: version.head,
    parentVersionId: version.parentVersionId,
    restoredFromVersionId: version.restoredFromVersionId,
    attributionKind: version.attributionKind,
    editorDisplayName: version.editorDisplayName,
    createdAt: version.createdAt,
    isCurrentDraft: options.current ?? false,
    isPublished: options.published ?? false,
  }
}

function renderWorkspace(
  initial = snapshot(),
  publishedHead: CmsVersionSnapshot["head"] | null = initial.head
) {
  return render(
    <ReviewAnnotationProvider>
      <CmsWorkspace
        snapshot={initial}
        publishedHead={publishedHead}
        csrfToken="csrf-token"
      />
    </ReviewAnnotationProvider>
  )
}

function changeEditable(label: string, value: string): HTMLElement {
  const editable = screen.getByRole("textbox", { name: label })
  editable.textContent = value
  fireEvent.input(editable)
  return editable
}

function enterAdminMode(): void {
  fireEvent.keyDown(window, { key: "k", metaKey: true })
  fireEvent.click(screen.getByRole("button", { name: "Enter Admin mode" }))
}

describe("CMS workspace", () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    mockedReadComments.mockReset()
    mockedReadComments.mockResolvedValue({ ok: true, comments: [] })
    mockedReadHistory.mockReset()
    mockedReadVersion.mockReset()
    mockedWrite.mockReset()
    mockedWriteComment.mockReset()
  })

  it("supports direct editing, keyboard undo, and every finish choice", async () => {
    renderWorkspace()

    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    const reviewTools = screen.getByRole("group", { name: "Review tools" })
    const finishEditing = within(reviewTools).getByRole("button", {
      name: "Finish editing",
    })
    expect(within(reviewTools).getAllByRole("button").at(-1)).toBe(
      finishEditing
    )
    expect(finishEditing.querySelector("svg")).not.toBeNull()
    changeEditable("Edit opening heading", "A clearer opening")
    expect(screen.getByText("A clearer opening")).not.toBeNull()

    fireEvent.keyDown(window, { key: "z", metaKey: true })
    expect(
      screen.getByText("Every student gets the support they qualify for")
    ).not.toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Redo" }))
    expect(screen.getByText("A clearer opening")).not.toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "Finish editing" }))
    expect(
      screen.getByRole("dialog", { name: "Finish editing?" })
    ).not.toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }))
    expect(
      screen.getByRole("textbox", { name: "Edit opening heading" })
    ).not.toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "Finish editing" }))
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }))
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Edit content" })
      ).not.toBeNull()
    })
    expect(screen.queryByText("A clearer opening")).toBeNull()
  })

  it("opens Admin commands with Cmd+K and keeps content editing active", async () => {
    renderWorkspace()

    fireEvent.keyDown(window, { key: "k", metaKey: true })
    expect(
      screen.getByRole("dialog", { name: "Admin commands" })
    ).not.toBeNull()
    expect(
      screen.queryByRole("button", { name: "Page settings" })
    ).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Enter Admin mode" }))
    expect(screen.getByText("Admin mode")).not.toBeNull()
    expect(
      screen.getByRole("button", { name: "Page settings" })
    ).not.toBeNull()
    const sections = screen.getByRole("button", { name: "Sections" })
    await waitFor(() => {
      expect(document.activeElement).toBe(sections)
    })
    expect(
      screen.getByRole("button", { name: "Finish editing" })
    ).not.toBeNull()
    const finishEditing = screen.getByRole("button", {
      name: "Finish editing",
    })

    fireEvent.keyDown(window, { key: "k", metaKey: true })
    expect(
      screen.getByRole("button", { name: "Exit Admin mode" })
    ).not.toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Exit Admin mode" }))
    expect(screen.getByText("Review tools")).not.toBeNull()
    expect(
      screen.queryByRole("button", { name: "Page settings" })
    ).toBeNull()
    expect(screen.queryByRole("button", { name: "Sections" })).toBeNull()
    expect(screen.getByRole("button", { name: "Finish editing" })).toBe(
      finishEditing
    )
    await waitFor(() => {
      expect(document.activeElement).toBe(finishEditing)
    })
  })

  it("keeps the active editable mounted while text changes", async () => {
    renderWorkspace()
    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))

    const editable = screen.getByRole("textbox", {
      name: "Edit story step 2 heading",
    })
    editable.focus()
    editable.textContent = "X"
    fireEvent.input(editable)

    const afterFirstInput = screen.getByRole("textbox", {
      name: "Edit story step 2 heading",
    })
    expect(afterFirstInput).toBe(editable)
    expect(document.activeElement).toBe(editable)

    editable.textContent = "Xiao"
    fireEvent.input(editable)
    expect(
      screen.getByRole("textbox", { name: "Edit story step 2 heading" })
    ).toBe(editable)
    expect(document.activeElement).toBe(editable)

    fireEvent.keyDown(window, { key: "k", metaKey: true })
    expect(
      screen.getByRole("dialog", { name: "Admin commands" })
    ).not.toBeNull()
    fireEvent.keyDown(document, { key: "Escape" })
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Admin commands" })
      ).toBeNull()
      expect(document.activeElement).toBe(editable)
    })
  })

  it("saves a named draft, opens history, previews, and restores an old version", async () => {
    const version1 = snapshot()
    let version2: CmsVersionSnapshot | null = null
    mockedWrite.mockImplementation((request) => {
      if (request.operation === "save") {
        version2 = snapshot(2, request.contract, {
          parentVersionId: version1.head.versionId,
        })
        return Promise.resolve({
          ok: true,
          operation: "save",
          result: { outcome: "committed", committed: version2, live: version2 },
        })
      }
      if (request.operation === "restore") {
        const version3 = snapshot(3, homepageV1Contract, {
          parentVersionId: version2?.head.versionId ?? null,
          restoredFromVersionId: version1.head.versionId,
        })
        return Promise.resolve({
          ok: true,
          operation: "restore",
          result: { outcome: "committed", committed: version3, live: version3 },
        })
      }
      return Promise.reject(new Error("Unexpected publish request"))
    })
    mockedReadHistory.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        kind: "history",
        history: {
          versions: [
            historyItem(version2 ?? snapshot(2), { current: true }),
            historyItem(version1, { published: true }),
          ],
          nextCursor: null,
        },
      })
    )
    mockedReadVersion.mockResolvedValue({
      ok: true,
      kind: "version",
      version: version1,
    })
    renderWorkspace(version1)

    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    fireEvent.change(screen.getByRole("textbox", { name: "Your name" }), {
      target: { value: "Alex Tan" },
    })
    changeEditable("Edit opening heading", "A saved opening")
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }))

    await screen.findByText("Draft saved as version 2.")
    expect(mockedWrite).toHaveBeenCalledWith(
      expect.objectContaining({ operation: "save", displayName: "Alex Tan" }),
      "csrf-token"
    )

    const historyButton = screen.getByRole("button", {
      name: "Version history",
    })
    fireEvent.click(historyButton)
    expect(await screen.findByText("Version 1")).not.toBeNull()
    await waitFor(() => {
      expect(document.activeElement?.textContent).toContain("Version history")
    })
    const previewButtons = screen.getAllByRole("button", {
      name: /Preview version/,
    })
    const versionOnePreview = previewButtons.at(-1) as HTMLButtonElement
    fireEvent.click(versionOnePreview)
    expect(await screen.findByText("Previewing saved version 1")).not.toBeNull()
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Return to current draft" })
      )
    })

    fireEvent.click(
      screen.getByRole("button", { name: "Return to current draft" })
    )
    await waitFor(() => {
      expect(document.activeElement).toBe(versionOnePreview)
    })

    fireEvent.click(versionOnePreview)
    await screen.findByText("Previewing saved version 1")
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Return to current draft" })
      )
    })

    fireEvent.click(
      screen.getByRole("button", { name: "Restore this version" })
    )
    expect(
      await screen.findByText("Version 1 was restored as draft version 3.")
    ).not.toBeNull()
    expect(mockedWrite).toHaveBeenLastCalledWith(
      expect.objectContaining({
        operation: "restore",
        sourceVersionId: version1.head.versionId,
      }),
      "csrf-token"
    )
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Version history" })
      )
    })
  })

  it("publishes to the private comparison and can unpublish without losing history", async () => {
    const version1 = snapshot()
    mockedWrite.mockImplementation((request) => {
      if (request.operation === "publish") {
        return Promise.resolve({
          ok: true,
          operation: "publish",
          result: {
            outcome: "committed",
            committed: version1,
            live: version1,
          },
        })
      }
      if (request.operation === "unpublish") {
        return Promise.resolve({
          ok: true,
          operation: "unpublish",
          result: {
            outcome: "committed",
            unpublished: version1,
            live: null,
          },
        })
      }
      return Promise.reject(new Error("Unexpected CMS write"))
    })
    renderWorkspace(version1, null)

    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    fireEvent.change(screen.getByRole("textbox", { name: "Your name" }), {
      target: { value: "Alex Tan" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Publish" }))
    fireEvent.click(
      within(
        screen.getByRole("dialog", { name: "Publish version 1?" })
      ).getByRole("button", { name: "Publish" })
    )

    expect(
      await screen.findByText(
        "Version 1 is ready in the private comparison. The released website has not changed."
      )
    ).not.toBeNull()
    const comparisonLink = screen.getByRole("link", {
      name: "View published",
    })
    expect(comparisonLink.getAttribute("href")).toBe(
      `/cms-compare?page=${version1.pageId}`
    )
    await waitFor(() => {
      expect(document.activeElement).toBe(comparisonLink)
    })

    fireEvent.click(screen.getByRole("button", { name: "Unpublish" }))
    const dialog = screen.getByRole("dialog", {
      name: "Unpublish this version?",
    })
    expect(dialog.textContent).toContain(
      "draft and version history stay available"
    )
    fireEvent.click(within(dialog).getByRole("button", { name: "Unpublish" }))

    expect(
      await screen.findByText(
        "This version is unpublished. Its draft and history are still available."
      )
    ).not.toBeNull()
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Publish" })
      )
    })
    expect(screen.queryByRole("link", { name: "View published" })).toBeNull()
    expect(mockedWrite).toHaveBeenLastCalledWith(
      expect.objectContaining({
        operation: "unpublish",
        expectedPublished: version1.head,
        displayName: "Alex Tan",
      }),
      "csrf-token"
    )
  })

  it("closes a failed publish dialog and returns focus to Publish", async () => {
    mockedWrite.mockRejectedValueOnce(new Error("network unavailable"))
    renderWorkspace(snapshot(), null)

    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    fireEvent.change(screen.getByRole("textbox", { name: "Your name" }), {
      target: { value: "Alex Tan" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Publish" }))
    const dialog = screen.getByRole("dialog", { name: "Publish version 1?" })
    const confirm = within(dialog).getByRole("button", { name: "Publish" })
    fireEvent.click(confirm)

    expect(
      await screen.findByText(
        "We could not publish this version. The public page has not changed. Try again."
      )
    ).not.toBeNull()
    expect(
      screen.queryByRole("dialog", { name: "Publish version 1?" })
    ).toBeNull()
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Publish" })
      )
    })
  })

  it("closes a failed unpublish dialog and returns focus to Unpublish", async () => {
    const version1 = snapshot()
    mockedWrite.mockRejectedValueOnce(new Error("network unavailable"))
    renderWorkspace(version1, version1.head)

    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    fireEvent.change(screen.getByRole("textbox", { name: "Your name" }), {
      target: { value: "Alex Tan" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Unpublish" }))
    const dialog = screen.getByRole("dialog", {
      name: "Unpublish this version?",
    })
    const confirm = within(dialog).getByRole("button", { name: "Unpublish" })
    fireEvent.click(confirm)

    expect(
      await screen.findByText(
        "We could not unpublish this version. The private comparison is unchanged. Try again."
      )
    ).not.toBeNull()
    expect(
      screen.queryByRole("dialog", { name: "Unpublish this version?" })
    ).toBeNull()
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Unpublish" })
      )
    })
  })

  it("retries the exact failed history action without losing focus", async () => {
    const version1 = snapshot(1)
    const version2 = snapshot(2)
    const version3 = snapshot(3)
    mockedReadHistory
      .mockResolvedValueOnce({
        ok: true,
        kind: "history",
        history: {
          versions: [
            historyItem(version3, { current: true }),
            historyItem(version2),
          ],
          nextCursor: 2,
        },
      })
      .mockResolvedValueOnce({
        ok: false,
        code: "UNAVAILABLE",
        message: "Earlier versions could not be loaded. Try again.",
      })
      .mockResolvedValueOnce({
        ok: true,
        kind: "history",
        history: {
          versions: [historyItem(version1, { published: true })],
          nextCursor: null,
        },
      })
    mockedReadVersion
      .mockResolvedValueOnce({
        ok: false,
        code: "UNAVAILABLE",
        message: "That version could not be loaded. Try again.",
      })
      .mockResolvedValueOnce({
        ok: true,
        kind: "version",
        version: version1,
      })
    renderWorkspace(version3)

    fireEvent.click(screen.getByRole("button", { name: "Version history" }))
    fireEvent.click(
      await screen.findByRole("button", { name: "Load earlier versions" })
    )
    const loadRetry = await screen.findByRole("button", { name: "Try again" })
    await waitFor(() => expect(document.activeElement).toBe(loadRetry))
    fireEvent.click(loadRetry)
    expect(await screen.findByText("Version 1")).not.toBeNull()
    expect(mockedReadHistory.mock.calls.slice(-2)).toEqual([
      [version3.pageId, 2],
      [version3.pageId, 2],
    ])

    const versionOneRow = screen.getByText("Version 1").closest("li")
    if (!versionOneRow) throw new Error("Expected the version 1 history row")
    fireEvent.click(
      within(versionOneRow).getByRole("button", { name: "Preview version 1" })
    )
    const previewRetry = await screen.findByRole("button", {
      name: "Try again",
    })
    await waitFor(() => expect(document.activeElement).toBe(previewRetry))
    fireEvent.click(previewRetry)
    expect(await screen.findByText("Previewing saved version 1")).not.toBeNull()
    expect(mockedReadVersion).toHaveBeenNthCalledWith(
      1,
      version3.pageId,
      version1.head.versionId
    )
    expect(mockedReadVersion).toHaveBeenNthCalledWith(
      2,
      version3.pageId,
      version1.head.versionId
    )
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Return to current draft" })
      )
    })
  })

  it("keeps the finish dialog open and explains a failed save", () => {
    renderWorkspace()
    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    changeEditable("Edit opening heading", "An unsaved opening")
    fireEvent.click(screen.getByRole("button", { name: "Finish editing" }))
    fireEvent.click(screen.getByRole("button", { name: "Save and finish" }))

    expect(screen.getByRole("alert").textContent).toContain(
      "Enter your name before saving."
    )
    expect(
      screen.getByRole("dialog", { name: "Finish editing?" })
    ).not.toBeNull()
  })

  it("edits reviewer context separately from teacher-facing content", () => {
    renderWorkspace()
    expect(screen.queryByRole("button", { name: "Pages" })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    expect(
      screen.queryByRole("button", { name: "Page settings" })
    ).toBeNull()
    expect(screen.queryByRole("button", { name: "Sections" })).toBeNull()

    enterAdminMode()
    expect(screen.getByText("Admin mode")).not.toBeNull()
    expect(
      screen.getByRole("button", { name: "Page settings" })
    ).not.toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Sections" }))
    fireEvent.click(screen.getAllByRole("button", { name: "Edit context" })[0])

    const intent = screen.getByRole<HTMLTextAreaElement>("textbox", {
      name: "Design intent",
    })
    const original = intent.value
    fireEvent.change(intent, {
      target: {
        value:
          "The opening states the teacher outcome before showing the product.",
      },
    })
    expect(intent.value).toContain("teacher outcome")

    fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "Design intent",
      }).value
    ).toBe(original)
    expect(
      screen.queryByText(
        "The opening states the teacher outcome before showing the product."
      )
    ).toBeNull()
  })

  it("adds a bounded section and includes the structural change in undo", () => {
    const { container } = renderWorkspace()
    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    enterAdminMode()
    fireEvent.click(screen.getByRole("button", { name: "Sections" }))

    expect(
      container.querySelectorAll(
        '[data-teacher-preview] [data-wireframe-section="connected-story"]'
      )
    ).toHaveLength(1)
    fireEvent.click(screen.getByRole("button", { name: "Add section" }))
    expect(
      container.querySelectorAll(
        '[data-teacher-preview] [data-wireframe-section="connected-story"]'
      )
    ).toHaveLength(2)
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Save draft" })
        .disabled
    ).toBe(false)

    fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    expect(
      container.querySelectorAll(
        '[data-teacher-preview] [data-wireframe-section="connected-story"]'
      )
    ).toHaveLength(1)
  })

  it("keeps focus on the replacement section lifecycle action", async () => {
    renderWorkspace()
    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    enterAdminMode()
    fireEvent.click(screen.getByRole("button", { name: "Sections" }))

    const sectionActions = screen.getByRole("group", {
      name: "Connected story section actions",
    })
    fireEvent.click(
      within(sectionActions).getByRole("button", { name: "Archive" })
    )
    await waitFor(() => {
      expect(document.activeElement).toBe(
        within(sectionActions).getByRole("button", { name: "Restore" })
      )
    })

    fireEvent.click(
      within(sectionActions).getByRole("button", { name: "Restore" })
    )
    await waitFor(() => {
      expect(document.activeElement).toBe(
        within(sectionActions).getByRole("button", { name: "Archive" })
      )
    })
  })

})
