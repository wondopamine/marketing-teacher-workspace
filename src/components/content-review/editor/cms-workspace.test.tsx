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
  readCmsPages,
  readCmsVersion,
  writeCms,
  writeCmsComment,
  writeCmsPage,
} from "./cms-client"
import type { CmsVersionContract } from "@/cms/document"
import type {
  CmsPageState,
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
  readCmsPages: vi.fn(),
  readCmsVersion: vi.fn(),
  writeCms: vi.fn(),
  writeCmsComment: vi.fn(),
  writeCmsPage: vi.fn(),
}))

const mockedReadComments = vi.mocked(readCmsComments)
const mockedReadHistory = vi.mocked(readCmsHistory)
const mockedReadPages = vi.mocked(readCmsPages)
const mockedReadVersion = vi.mocked(readCmsVersion)
const mockedWrite = vi.mocked(writeCms)
const mockedWriteComment = vi.mocked(writeCmsComment)
const mockedWritePage = vi.mocked(writeCmsPage)

function pageState(
  initial: CmsVersionSnapshot,
  overrides: Partial<CmsPageState> = {}
): CmsPageState {
  return {
    pageId: initial.pageId,
    title: initial.pageDocument.page.title,
    path: initial.pageDocument.page.path,
    lifecycle: "active" as const,
    lifecycleVersion: 1,
    draftHead: initial.head,
    publishedHead: initial.head,
    updatedAt: initial.createdAt,
    ...overrides,
  }
}

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

function renderWorkspace(initial = snapshot()) {
  return render(
    <ReviewAnnotationProvider>
      <CmsWorkspace
        snapshot={initial}
        pageState={pageState(initial)}
        publishedHead={initial.head}
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

describe("CMS workspace", () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    mockedReadComments.mockReset()
    mockedReadComments.mockResolvedValue({ ok: true, comments: [] })
    mockedReadHistory.mockReset()
    mockedReadVersion.mockReset()
    mockedReadPages.mockReset()
    mockedReadPages.mockResolvedValue({
      ok: true,
      pages: [pageState(snapshot())],
    })
    mockedWrite.mockReset()
    mockedWriteComment.mockReset()
    mockedWritePage.mockReset()
  })

  it("supports direct editing, keyboard undo, and every finish choice", async () => {
    renderWorkspace()

    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
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
    fireEvent.click(screen.getByRole("button", { name: "Edit content" }))
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

  it("manages page creation and restore without exposing public content", async () => {
    const current = snapshot()
    const archived = pageState(current, {
      pageId: "44444444-4444-4444-8444-444444444444",
      title: "Archived guide",
      path: "/archived-guide",
      lifecycle: "archived",
      lifecycleVersion: 2,
      publishedHead: null,
    })
    const another = pageState(current, {
      pageId: "55555555-5555-4555-8555-555555555555",
      title: "Another draft",
      path: "/another-draft",
      publishedHead: null,
    })
    mockedReadPages.mockResolvedValue({
      ok: true,
      pages: [pageState(current), another, archived],
    })
    mockedWritePage.mockImplementation((request) => {
      if (request.operation === "create") {
        return Promise.resolve({
          ok: false,
          code: "PATH_TAKEN",
          message:
            "That page address is already in use. Choose another address.",
        })
      }
      if (request.operation === "restore-archived") {
        return Promise.resolve({
          ok: true,
          operation: "restore-archived",
          result: {
            outcome: "committed",
            page: {
              ...archived,
              lifecycle: "active",
              lifecycleVersion: 3,
            },
          },
        })
      }
      return Promise.reject(new Error("Unexpected page request"))
    })
    renderWorkspace(current)

    fireEvent.click(screen.getByRole("button", { name: "Pages" }))
    expect(await screen.findByText("Archived guide")).not.toBeNull()
    expect(
      screen.getByText(/Archive removes an unpublished page from active use/)
    ).not.toBeNull()
    fireEvent.change(screen.getByRole("textbox", { name: "Your name" }), {
      target: { value: "Alex Tan" },
    })
    const newPageButton = screen.getByRole("button", { name: "New page" })
    fireEvent.click(newPageButton)
    expect(newPageButton.getAttribute("aria-expanded")).toBe("true")
    expect(newPageButton.getAttribute("aria-controls")).toBe("cms-page-form")
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("textbox", { name: "Page title" })
      )
    })
    fireEvent.change(screen.getByRole("textbox", { name: "Page title" }), {
      target: { value: "Family support" },
    })
    fireEvent.change(screen.getByRole("textbox", { name: /^Page address/ }), {
      target: { value: "/family-support" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Create page" }))

    expect(
      await screen.findByText(
        "That page address is already in use. Choose another address."
      )
    ).not.toBeNull()
    expect(mockedWritePage).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "create",
        title: "Family support",
        path: "/family-support",
      }),
      "csrf-token"
    )

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() => {
      expect(document.activeElement).toBe(newPageButton)
    })
    expect(newPageButton.getAttribute("aria-expanded")).toBe("false")

    const duplicateButtons = screen.getAllByRole("button", {
      name: "Duplicate",
    })
    fireEvent.click(duplicateButtons[0])
    expect(duplicateButtons[0].getAttribute("aria-expanded")).toBe("true")
    expect(duplicateButtons[1].getAttribute("aria-expanded")).toBe("false")
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("textbox", { name: "Page title" })
      )
    })
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() => {
      expect(document.activeElement).toBe(duplicateButtons[0])
    })

    fireEvent.click(screen.getByRole("button", { name: "Restore" }))
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Restore" })).toBeNull()
    })
    await waitFor(() => {
      expect(document.activeElement).toBe(
        within(
          screen.getByRole("group", {
            name: "Archived guide page actions",
          })
        ).getByRole("button", { name: "Archive" })
      )
    })
    expect(mockedWritePage).toHaveBeenLastCalledWith(
      expect.objectContaining({
        operation: "restore-archived",
        pageId: archived.pageId,
      }),
      "csrf-token"
    )
  })
})
