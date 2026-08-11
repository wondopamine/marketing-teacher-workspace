import { describe, expect, it } from "vitest"

import {
  cmsEditorReducer,
  createCmsEditorState,
  duplicateCmsSection,
  isCmsEditorDirty,
  moveCmsSection,
  replaceCmsValue,
  setCmsSectionState,
} from "./cms-editor-model"
import type { CmsVersionSnapshot } from "@/db/content-repository.server"
import { digestCmsVersionContract } from "@/cms/canonical.server"
import { homepageV1Contract } from "@/cms/templates/homepage-v1.server"

function snapshot(versionNumber = 1): CmsVersionSnapshot {
  return {
    ...homepageV1Contract,
    pageId: "b7a1e972-1758-4815-87b9-9697a324a667",
    head: {
      versionId: `00000000-0000-4000-8000-${String(versionNumber).padStart(12, "0")}`,
      versionNumber,
      digest: digestCmsVersionContract(homepageV1Contract),
    },
    attributionKind: versionNumber === 1 ? "system-import" : "self-declared",
    editorDisplayName: versionNumber === 1 ? null : "Alex Tan",
    createdAt: "2026-08-12T00:00:00.000Z",
    parentVersionId: null,
    restoredFromVersionId: null,
  }
}

describe("CMS editor model", () => {
  it("moves through editing, undo, redo, and an unchanged finish", () => {
    let state = createCmsEditorState(snapshot(), snapshot().head)
    state = cmsEditorReducer(state, { type: "start-editing" })
    const changed = replaceCmsValue(
      state.present,
      ["pageDocument", "page", "title"],
      "A clearer page title"
    )
    state = cmsEditorReducer(state, { type: "apply", contract: changed })
    expect(isCmsEditorDirty(state)).toBe(true)
    expect(state.past).toHaveLength(1)

    state = cmsEditorReducer(state, { type: "undo" })
    expect(isCmsEditorDirty(state)).toBe(false)
    state = cmsEditorReducer(state, { type: "redo" })
    expect(isCmsEditorDirty(state)).toBe(true)
    state = cmsEditorReducer(state, { type: "undo" })
    state = cmsEditorReducer(state, { type: "request-finish" })
    expect(state.mode).toBe("viewing")
    expect(state.finishChoiceOpen).toBe(false)
  })

  it("offers all three finish choices without silently losing work", () => {
    let state = cmsEditorReducer(
      createCmsEditorState(snapshot(), snapshot().head),
      {
        type: "start-editing",
      }
    )
    const changed = replaceCmsValue(
      state.present,
      ["pageDocument", "page", "description"],
      "Changed locally"
    )
    state = cmsEditorReducer(state, { type: "apply", contract: changed })
    state = cmsEditorReducer(state, { type: "request-finish" })
    expect(state.finishChoiceOpen).toBe(true)
    expect(state.present.pageDocument.page.description).toBe("Changed locally")

    const kept = cmsEditorReducer(state, { type: "keep-editing" })
    expect(kept.mode).toBe("editing")
    expect(isCmsEditorDirty(kept)).toBe(true)

    const discarded = cmsEditorReducer(state, { type: "discard-and-finish" })
    expect(discarded.mode).toBe("viewing")
    expect(isCmsEditorDirty(discarded)).toBe(false)

    const savedSnapshot = {
      ...snapshot(2),
      pageDocument: changed.pageDocument,
    }
    const saved = cmsEditorReducer(state, {
      type: "save-succeeded",
      snapshot: savedSnapshot,
      finish: true,
    })
    expect(saved.mode).toBe("viewing")
    expect(saved.baseline.head.versionNumber).toBe(2)
    expect(isCmsEditorDirty(saved)).toBe(false)
  })

  it("groups one typing run into a single undo step", () => {
    let state = cmsEditorReducer(
      createCmsEditorState(snapshot(), snapshot().head),
      { type: "start-editing" }
    )
    const first = replaceCmsValue(
      state.present,
      ["pageDocument", "page", "title"],
      "A"
    )
    state = cmsEditorReducer(state, {
      type: "apply",
      contract: first,
      historyGroup: "page.title",
    })
    const second = replaceCmsValue(
      state.present,
      ["pageDocument", "page", "title"],
      "A clearer title"
    )
    state = cmsEditorReducer(state, {
      type: "apply",
      contract: second,
      historyGroup: "page.title",
    })

    expect(state.past).toHaveLength(1)
    state = cmsEditorReducer(state, { type: "undo" })
    expect(state.present.pageDocument.page.title).toBe(
      homepageV1Contract.pageDocument.page.title
    )
    state = cmsEditorReducer(state, { type: "redo" })
    expect(state.present.pageDocument.page.title).toBe("A clearer title")
  })

  it("keeps the complete local document after a stale save", () => {
    let state = cmsEditorReducer(
      createCmsEditorState(snapshot(), snapshot().head),
      {
        type: "start-editing",
      }
    )
    const local = replaceCmsValue(
      state.present,
      ["pageDocument", "page", "title"],
      "My local title"
    )
    state = cmsEditorReducer(state, { type: "apply", contract: local })
    state = cmsEditorReducer(state, {
      type: "save-conflicted",
      latest: snapshot(2),
    })
    expect(state.present.pageDocument.page.title).toBe("My local title")
    expect(state.conflict?.head.versionNumber).toBe(2)
    expect(isCmsEditorDirty(state)).toBe(true)
  })

  it("supports section duplicate, reorder, hide, archive, and undo as documents", () => {
    const source = homepageV1Contract.pageDocument.sections[1]
    const ids = Array.from(
      { length: 20 },
      (_, i) => `10000000-0000-4000-8000-${String(i).padStart(12, "0")}`
    )
    const duplicate = duplicateCmsSection(
      homepageV1Contract,
      source.id,
      () => ids.shift() ?? ""
    )
    const copied = duplicate.pageDocument.sections[2]
    expect(copied.id).not.toBe(source.id)
    if (copied.type === "connected-story") {
      expect(copied.fields.steps[0].id).not.toBe(source.fields.steps[0].id)
      expect(copied.fields.steps[0].screen.id).not.toBe(
        source.fields.steps[0].screen.id
      )
    }

    const moved = moveCmsSection(homepageV1Contract, source.id, 1)
    expect(moved.pageDocument.sections[2].id).toBe(source.id)
    expect(moveCmsSection(homepageV1Contract, source.id, -1)).toBe(
      homepageV1Contract
    )
    expect(
      setCmsSectionState(homepageV1Contract, source.id, "hidden").pageDocument
        .sections[1].state
    ).toBe("hidden")
    expect(
      setCmsSectionState(homepageV1Contract, source.id, "archived").pageDocument
        .sections[1].id
    ).toBe(source.id)
  })
})
