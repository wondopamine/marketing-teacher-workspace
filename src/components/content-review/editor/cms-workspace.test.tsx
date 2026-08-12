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

  it("groups published versions left of the right-aligned review tools", () => {
    renderWorkspace()

    const reviewTools = screen.getByRole("group", { name: "Review tools" })
    expect(
      Array.from(reviewTools.querySelectorAll("a, button")).map((control) =>
        control.textContent.trim()
      )
    ).toEqual([
      "View published",
      "Version history",
      "Show section context",
      "Edit content",
    ])
  })

  it("opens version history on the left and section context on the right", async () => {
    renderWorkspace()

    fireEvent.click(screen.getByRole("button", { name: "Version history" }))
    const historyPanel = await screen.findByRole("complementary", {
      name: "Version history",
    })
    expect(historyPanel.getAttribute("data-cms-panel-side")).toBe("left")
    expect(
      historyPanel.parentElement?.getAttribute("data-cms-panel-side")
    ).toBe("left")
    const teacherPreview = document.querySelector("[data-teacher-preview]")
    expect(teacherPreview).not.toBeNull()
    expect(
      historyPanel.compareDocumentPosition(teacherPreview as Element) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).not.toBe(0)

    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    fireEvent.click(
      screen.getByRole("button", { name: "Show section context" })
    )
    expect(
      screen
        .getByRole("complementary", { name: "Section context and feedback" })
        .closest("[data-cms-panel-side]")
        ?.getAttribute("data-cms-panel-side")
    ).toBe("right")
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
    expect(screen.queryByRole("button", { name: "Page settings" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Section order" })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Enter Admin mode" }))
    expect(screen.getByText("Admin mode")).not.toBeNull()
    expect(screen.queryByRole("button", { name: "Page settings" })).toBeNull()
    const sections = screen.getByRole("button", { name: "Section order" })
    expect(
      screen.getByRole("complementary", { name: "Section order" })
    ).not.toBeNull()
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
    expect(screen.queryByRole("button", { name: "Page settings" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Section order" })).toBeNull()
    expect(
      screen.queryByRole("complementary", { name: "Section order" })
    ).toBeNull()
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

    expect(screen.queryByRole("button", { name: "Version history" })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Finish editing" }))
    await screen.findByRole("button", { name: "Edit content" })
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

  it("publishes without adding comparison controls to Editor mode", async () => {
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
    expect(screen.queryByRole("link", { name: "View published" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Unpublish" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Version history" })).toBeNull()
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Finish editing" })
      )
    })

    fireEvent.click(screen.getByRole("button", { name: "Finish editing" }))
    const comparisonLink = await screen.findByRole("link", {
      name: "View published",
    })
    expect(comparisonLink.getAttribute("href")).toBe(
      `/cms-compare?page=${version1.pageId}`
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

  it("keeps advanced section and page controls out of Admin mode", () => {
    renderWorkspace()
    expect(screen.queryByRole("button", { name: "Pages" })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    expect(screen.queryByRole("button", { name: "Page settings" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Section order" })).toBeNull()

    enterAdminMode()
    expect(screen.getByText("Admin mode")).not.toBeNull()
    expect(screen.queryByRole("button", { name: "Page settings" })).toBeNull()
    expect(
      screen.getByRole("complementary", { name: "Section order" })
    ).not.toBeNull()
    for (const name of [
      "Add section",
      "Duplicate",
      "Hide",
      "Archive",
      "Restore",
      "Edit context",
    ]) {
      expect(screen.queryByRole("button", { name })).toBeNull()
    }
    expect(screen.queryByRole("combobox", { name: "Section type" })).toBeNull()
  })

  it("reorders the page from the side panel and includes the change in undo", () => {
    const { container } = renderWorkspace()
    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    enterAdminMode()

    const order = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          "[data-teacher-preview] [data-wireframe-section]"
        )
      ).map((section) => section.dataset.wireframeSection)
    const original = order()
    fireEvent.click(screen.getByRole("button", { name: "Move Reveal down" }))
    const reordered = [...original]
    const revealIndex = reordered.indexOf("reveal")
    const next = reordered[revealIndex + 1]
    reordered[revealIndex + 1] = "reveal"
    reordered[revealIndex] = next
    expect(order()).toEqual(reordered)
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Save draft" })
        .disabled
    ).toBe(false)

    fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    expect(order()).toEqual(original)
  })

  it("moves across retained archived sections in one visible step", () => {
    const contract: CmsVersionContract = {
      ...homepageV1Contract,
      pageDocument: {
        ...homepageV1Contract.pageDocument,
        sections: homepageV1Contract.pageDocument.sections.map((section) =>
          section.type === "capabilities"
            ? { ...section, state: "archived" as const }
            : section
        ),
      },
    }
    const { container } = renderWorkspace(snapshot(1, contract))
    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    enterAdminMode()

    const order = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          "[data-teacher-preview] [data-wireframe-section]"
        )
      ).map((section) => section.dataset.wireframeSection)
    expect(order()).toEqual([
      "promise",
      "connected-story",
      "reveal",
      "close",
      "access-support",
      "footer-feedback",
    ])

    fireEvent.click(screen.getByRole("button", { name: "Move Reveal down" }))
    expect(order()).toEqual([
      "promise",
      "connected-story",
      "close",
      "reveal",
      "access-support",
      "footer-feedback",
    ])
  })

  it("keeps focus while reordering and returns it when the panel closes", async () => {
    renderWorkspace()
    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
    enterAdminMode()

    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Section order" })
      )
    })

    const moveReveal = screen.getByRole("button", {
      name: "Move Reveal down",
    })
    moveReveal.focus()
    fireEvent.click(moveReveal)
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Move Reveal down" })
      )
    })

    fireEvent.click(screen.getByRole("button", { name: "Close section order" }))
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Section order" })
      )
    })
    expect(
      screen.queryByRole("complementary", { name: "Section order" })
    ).toBeNull()
  })
})
