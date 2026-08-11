import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ReviewAnnotationProvider } from "../review-annotations"
import { CmsWorkspace } from "./cms-workspace"
import { readCmsHistory, readCmsVersion, writeCms } from "./cms-client"
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
  readCmsHistory: vi.fn(),
  readCmsVersion: vi.fn(),
  writeCms: vi.fn(),
}))

const mockedReadHistory = vi.mocked(readCmsHistory)
const mockedReadVersion = vi.mocked(readCmsVersion)
const mockedWrite = vi.mocked(writeCms)

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
    mockedReadHistory.mockReset()
    mockedReadVersion.mockReset()
    mockedWrite.mockReset()
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
    const previewButtons = screen.getAllByRole("button", { name: "Preview" })
    fireEvent.click(previewButtons.at(-1) as HTMLButtonElement)
    expect(await screen.findByText("Previewing saved version 1")).not.toBeNull()

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
})
