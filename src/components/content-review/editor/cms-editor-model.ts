import type {
  CmsHead,
  CmsVersionSnapshot,
} from "@/db/content-repository.server"
import type {
  CmsSectionDocument,
  CmsSectionState,
  CmsSectionType,
  CmsVersionContract,
} from "@/cms/document"
import { cloneCmsSection, copyCmsReviewContexts } from "@/cms/clone"
import { cmsSectionRegistry } from "@/cms/section-registry"

export type CmsEditorMode = "viewing" | "editing"

export type CmsEditorState = {
  readonly mode: CmsEditorMode
  readonly baseline: CmsVersionSnapshot
  readonly present: CmsVersionContract
  readonly past: ReadonlyArray<CmsVersionContract>
  readonly future: ReadonlyArray<CmsVersionContract>
  readonly lastHistoryGroup: string | null
  readonly finishChoiceOpen: boolean
  readonly conflict: CmsVersionSnapshot | null
  readonly publishedHead: CmsHead | null
}

export type CmsEditorAction =
  | { readonly type: "start-editing" }
  | {
      readonly type: "apply"
      readonly contract: CmsVersionContract
      readonly historyGroup?: string
    }
  | { readonly type: "undo" }
  | { readonly type: "redo" }
  | { readonly type: "request-finish" }
  | { readonly type: "keep-editing" }
  | { readonly type: "discard-and-finish" }
  | {
      readonly type: "save-succeeded"
      readonly snapshot: CmsVersionSnapshot
      readonly finish: boolean
    }
  | { readonly type: "save-conflicted"; readonly latest: CmsVersionSnapshot }
  | { readonly type: "clear-conflict" }
  | {
      readonly type: "restore-succeeded"
      readonly snapshot: CmsVersionSnapshot
    }
  | { readonly type: "publish-succeeded"; readonly publishedHead: CmsHead }

const maximumUndoSteps = 100

export function contractFromSnapshot(
  snapshot: CmsVersionSnapshot
): CmsVersionContract {
  return {
    pageSchemaVersion: snapshot.pageSchemaVersion,
    reviewSchemaVersion: snapshot.reviewSchemaVersion,
    sectionLibraryVersion: snapshot.sectionLibraryVersion,
    pageDocument: snapshot.pageDocument,
    reviewDocument: snapshot.reviewDocument,
  }
}

function sameContract(
  left: CmsVersionContract,
  right: CmsVersionContract
): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function isCmsEditorDirty(state: CmsEditorState): boolean {
  return !sameContract(contractFromSnapshot(state.baseline), state.present)
}

export function createCmsEditorState(
  snapshot: CmsVersionSnapshot,
  publishedHead: CmsHead | null
): CmsEditorState {
  return {
    mode: "viewing",
    baseline: snapshot,
    present: contractFromSnapshot(snapshot),
    past: [],
    future: [],
    lastHistoryGroup: null,
    finishChoiceOpen: false,
    conflict: null,
    publishedHead,
  }
}

export function cmsEditorReducer(
  state: CmsEditorState,
  action: CmsEditorAction
): CmsEditorState {
  switch (action.type) {
    case "start-editing":
      return {
        ...state,
        mode: "editing",
        finishChoiceOpen: false,
        lastHistoryGroup: null,
      }
    case "apply": {
      if (
        state.mode !== "editing" ||
        sameContract(state.present, action.contract)
      ) {
        return state
      }
      return {
        ...state,
        present: action.contract,
        past:
          action.historyGroup && action.historyGroup === state.lastHistoryGroup
            ? state.past
            : [...state.past, state.present].slice(-maximumUndoSteps),
        future: [],
        lastHistoryGroup: action.historyGroup ?? null,
        conflict: null,
      }
    }
    case "undo": {
      const previous = state.past.at(-1)
      if (state.mode !== "editing" || !previous) return state
      return {
        ...state,
        present: previous,
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future].slice(0, maximumUndoSteps),
        lastHistoryGroup: null,
        conflict: null,
      }
    }
    case "redo": {
      if (state.mode !== "editing" || state.future.length === 0) return state
      const next = state.future[0]
      return {
        ...state,
        present: next,
        past: [...state.past, state.present].slice(-maximumUndoSteps),
        future: state.future.slice(1),
        lastHistoryGroup: null,
        conflict: null,
      }
    }
    case "request-finish":
      return isCmsEditorDirty(state)
        ? { ...state, finishChoiceOpen: true }
        : { ...state, mode: "viewing", finishChoiceOpen: false }
    case "keep-editing":
      return { ...state, mode: "editing", finishChoiceOpen: false }
    case "discard-and-finish":
      return {
        ...state,
        mode: "viewing",
        present: contractFromSnapshot(state.baseline),
        past: [],
        future: [],
        lastHistoryGroup: null,
        finishChoiceOpen: false,
        conflict: null,
      }
    case "save-succeeded":
      return {
        ...state,
        mode: action.finish ? "viewing" : "editing",
        baseline: action.snapshot,
        present: contractFromSnapshot(action.snapshot),
        past: [],
        future: [],
        lastHistoryGroup: null,
        finishChoiceOpen: false,
        conflict: null,
      }
    case "save-conflicted":
      return { ...state, conflict: action.latest, finishChoiceOpen: false }
    case "clear-conflict":
      return { ...state, conflict: null }
    case "restore-succeeded":
      return {
        ...state,
        mode: "viewing",
        baseline: action.snapshot,
        present: contractFromSnapshot(action.snapshot),
        past: [],
        future: [],
        lastHistoryGroup: null,
        finishChoiceOpen: false,
        conflict: null,
      }
    case "publish-succeeded":
      return { ...state, publishedHead: action.publishedHead }
  }
}

type MutableJson = Record<string, unknown> | Array<unknown>

export function replaceCmsValue(
  contract: CmsVersionContract,
  path: ReadonlyArray<string | number>,
  value: unknown
): CmsVersionContract {
  if (path.length === 0) return contract
  const next = structuredClone(contract) as unknown as MutableJson
  let current: MutableJson = next
  for (const [index, segment] of path.entries()) {
    if (
      segment === "__proto__" ||
      segment === "prototype" ||
      segment === "constructor"
    ) {
      return contract
    }
    const last = index === path.length - 1
    if (last) {
      if (Array.isArray(current) && typeof segment === "number")
        current[segment] = value
      else if (!Array.isArray(current) && typeof segment === "string")
        current[segment] = value
      else return contract
      break
    }
    const nested = current[segment as keyof typeof current]
    if (!nested || typeof nested !== "object") return contract
    current = nested as MutableJson
  }
  return next as unknown as CmsVersionContract
}

export function updateCmsReviewContext(
  contract: CmsVersionContract,
  targetId: string,
  context: {
    readonly designIntent: string
    readonly checks: ReadonlyArray<string>
    readonly decisionNeeded?: string
  }
): CmsVersionContract {
  if (!contract.reviewDocument.targets[targetId]) return contract
  return {
    ...contract,
    reviewDocument: {
      targets: {
        ...contract.reviewDocument.targets,
        [targetId]: context,
      },
    },
  }
}

function activeSectionCount(
  contract: CmsVersionContract,
  type: CmsSectionType
): number {
  return contract.pageDocument.sections.filter(
    (section) => section.type === type && section.state !== "archived"
  ).length
}

export function canAddCmsSection(
  contract: CmsVersionContract,
  type: CmsSectionType
): boolean {
  return (
    contract.pageDocument.sections.length < 20 &&
    activeSectionCount(contract, type) < cmsSectionRegistry[type].maximum
  )
}

function contractWithClonedSection(
  contract: CmsVersionContract,
  source: CmsSectionDocument,
  insertAt: number,
  createId: () => string,
  state: CmsSectionState
): CmsVersionContract {
  const cloned = cloneCmsSection(source, createId)
  const section = { ...cloned.section, state } as CmsSectionDocument
  const copiedReview = copyCmsReviewContexts(
    contract.reviewDocument,
    cloned.idMap
  )
  const sections = [...contract.pageDocument.sections]
  sections.splice(insertAt, 0, section)
  return {
    ...contract,
    pageDocument: { ...contract.pageDocument, sections },
    reviewDocument: {
      targets: {
        ...contract.reviewDocument.targets,
        ...copiedReview.targets,
      },
    },
  }
}

export function duplicateCmsSection(
  contract: CmsVersionContract,
  sectionId: string,
  createId: () => string = () => crypto.randomUUID()
): CmsVersionContract {
  const index = contract.pageDocument.sections.findIndex(
    (section) => section.id === sectionId
  )
  if (index < 0) return contract
  const source = contract.pageDocument.sections[index]
  if (
    source.state === "archived" ||
    !cmsSectionRegistry[source.type].canArchive ||
    !canAddCmsSection(contract, source.type)
  ) {
    return contract
  }
  return contractWithClonedSection(
    contract,
    source,
    index + 1,
    createId,
    source.state
  )
}

export function addCmsSection(
  contract: CmsVersionContract,
  type: CmsSectionType,
  createId: () => string = () => crypto.randomUUID()
): CmsVersionContract {
  if (!cmsSectionRegistry[type].canArchive || !canAddCmsSection(contract, type))
    return contract
  const source = contract.pageDocument.sections.find(
    (section) => section.type === type
  )
  const footerIndex = contract.pageDocument.sections.findIndex(
    (section) => section.type === "footer-feedback"
  )
  if (!source || footerIndex < 0) return contract
  return contractWithClonedSection(
    contract,
    source,
    footerIndex,
    createId,
    "visible"
  )
}

export function moveCmsSection(
  contract: CmsVersionContract,
  sectionId: string,
  direction: -1 | 1
): CmsVersionContract {
  const sections = [...contract.pageDocument.sections]
  const index = sections.findIndex((section) => section.id === sectionId)
  const destination = index + direction
  if (index < 0 || destination < 0 || destination >= sections.length)
    return contract
  if (
    sections[index].type === "promise" ||
    sections[index].type === "footer-feedback"
  ) {
    return contract
  }
  if (destination === 0 || destination === sections.length - 1) return contract
  const [section] = sections.splice(index, 1)
  sections.splice(destination, 0, section)
  return {
    ...contract,
    pageDocument: { ...contract.pageDocument, sections },
  }
}

export function setCmsSectionState(
  contract: CmsVersionContract,
  sectionId: string,
  state: CmsSectionState
): CmsVersionContract {
  const section = contract.pageDocument.sections.find(
    (candidate) => candidate.id === sectionId
  )
  if (!section || !cmsSectionRegistry[section.type].canArchive) return contract
  if (
    section.state === "archived" &&
    state !== "archived" &&
    !canAddCmsSection(contract, section.type)
  ) {
    return contract
  }
  return {
    ...contract,
    pageDocument: {
      ...contract.pageDocument,
      sections: contract.pageDocument.sections.map((candidate) =>
        candidate.id === sectionId ? { ...candidate, state } : candidate
      ),
    },
  }
}
