import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"
import { DoorOpenIcon, XIcon } from "lucide-react"

import { ContentReviewPage } from "../content-review-page"
import { PublicReviewMode } from "../public-review-mode"
import { CmsVersionHistoryPanel } from "../version-history/cms-version-history-panel"
import { CmsSectionContextPanel } from "../section-context/cms-section-context-panel"
import { useReviewAnnotations } from "../review-annotations"
import { FinishEditingDialog, PublishVersionDialog } from "./cms-editor-dialogs"
import { CmsAdminCommandMenu } from "./cms-admin-command-menu"
import {
  cmsEditorReducer,
  createCmsEditorState,
  isCmsEditorDirty,
  moveCmsSection,
  replaceCmsValue,
} from "./cms-editor-model"
import { readCmsHistory, readCmsVersion, writeCms } from "./cms-client"
import type {
  CmsHead,
  CmsVersionHistoryItem,
  CmsVersionSnapshot,
} from "@/db/content-repository.server"
import type { ContentReviewEditAdapter } from "./content-review-edit-adapter"
import type { CmsWriteRequest } from "@/cms/api"
import type { CmsVersionContract } from "@/cms/document"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cmsSectionRegistry } from "@/cms/section-registry"
import {
  isCmsVersionContract,
  projectCmsPageDocumentForEditor,
} from "@/cms/validation"
import { buildCmsReviewPresentation } from "@/cms/review-presentation"

type WorkspaceStatus = {
  readonly kind: "idle" | "busy" | "success" | "error"
  readonly message: string
}

type HistoryRetryAction =
  | {
      readonly kind: "load"
      readonly cursor: number | null
      readonly append: boolean
    }
  | {
      readonly kind: "preview"
      readonly version: CmsVersionHistoryItem
    }

type RetriableAttempt = {
  readonly fingerprint: string
  readonly attemptId: string
}

type PublicationFocusTarget = "publish" | "finish"

function sameHead(left: CmsHead | null, right: CmsHead | null): boolean {
  if (!left || !right) return left === right
  return (
    left.versionId === right.versionId &&
    left.versionNumber === right.versionNumber &&
    left.digest === right.digest
  )
}

function attemptFor(
  current: RetriableAttempt | null,
  fingerprint: string
): RetriableAttempt {
  return current?.fingerprint === fingerprint
    ? current
    : { fingerprint, attemptId: crypto.randomUUID() }
}

export function CmsWorkspace({
  snapshot,
  publishedHead,
  csrfToken,
}: {
  readonly snapshot: CmsVersionSnapshot
  readonly publishedHead: CmsHead | null
  readonly csrfToken: string
}) {
  const [state, dispatch] = useReducer(
    cmsEditorReducer,
    createCmsEditorState(snapshot, publishedHead)
  )
  const { panelOpen, replaceAnnotations, setPanelOpen, setPinsVisible } =
    useReviewAnnotations()
  const [displayName, setDisplayName] = useState("")
  const [status, setStatus] = useState<WorkspaceStatus>({
    kind: "idle",
    message: "Review a section or edit the teacher copy.",
  })
  const [adminMode, setAdminMode] = useState(false)
  const [adminCommandMenuOpen, setAdminCommandMenuOpen] = useState(false)
  const [sectionsOpen, setSectionsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historyRetryAction, setHistoryRetryAction] =
    useState<HistoryRetryAction | null>(null)
  const [history, setHistory] = useState<ReadonlyArray<CmsVersionHistoryItem>>(
    []
  )
  const [historyCursor, setHistoryCursor] = useState<number | null>(null)
  const [previewVersion, setPreviewVersion] =
    useState<CmsVersionSnapshot | null>(null)
  const [previewingVersionId, setPreviewingVersionId] = useState<string | null>(
    null
  )
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const saveAttemptRef = useRef<RetriableAttempt | null>(null)
  const publishAttemptRef = useRef<RetriableAttempt | null>(null)
  const publishButtonRef = useRef<HTMLButtonElement | null>(null)
  const sectionsButtonRef = useRef<HTMLButtonElement | null>(null)
  const finishEditingButtonRef = useRef<HTMLButtonElement | null>(null)
  const adminCommandFocusTargetRef = useRef<"sections" | "finish" | null>(null)
  const adminCommandOpenerRef = useRef<HTMLElement | null>(null)
  const publicationFocusTargetRef = useRef<PublicationFocusTarget | null>(null)
  const restoreAttemptRef = useRef<RetriableAttempt | null>(null)
  const historyOpenerRef = useRef<HTMLButtonElement | null>(null)

  const dirty = isCmsEditorDirty(state)
  const busy = status.kind === "busy"
  const editing = state.mode === "editing"
  const currentPublished = sameHead(state.publishedHead, state.baseline.head)

  const undo = useCallback(() => {
    if (busy || state.past.length === 0) return
    dispatch({ type: "undo" })
    setStatus({ kind: "success", message: "Last change undone." })
  }, [busy, state.past.length])

  const redo = useCallback(() => {
    if (busy || state.future.length === 0) return
    dispatch({ type: "redo" })
    setStatus({ kind: "success", message: "Change restored." })
  }, [busy, state.future.length])

  useEffect(() => {
    if (publishDialogOpen || busy) return
    const target = publicationFocusTargetRef.current
    if (!target) return
    const element =
      target === "publish"
        ? publishButtonRef.current
        : finishEditingButtonRef.current
    if (!element) return
    element.focus()
    publicationFocusTargetRef.current = null
  }, [busy, publishDialogOpen, state.publishedHead])

  useEffect(() => {
    if (adminCommandMenuOpen) return
    const requested = adminCommandFocusTargetRef.current
    const opener = adminCommandOpenerRef.current
    if (!requested && !opener) return
    adminCommandFocusTargetRef.current = null
    adminCommandOpenerRef.current = null
    window.requestAnimationFrame(() => {
      const target =
        requested === "sections"
          ? sectionsButtonRef.current
          : requested === "finish"
            ? finishEditingButtonRef.current
            : opener?.isConnected
              ? opener
              : null
      target?.focus()
    })
  }, [adminCommandMenuOpen])

  useEffect(() => {
    const remembered = window.sessionStorage.getItem("tw-cms-display-name")
    if (remembered) setDisplayName(remembered)
  }, [])

  useEffect(() => {
    const trimmed = displayName.trim()
    if (trimmed) window.sessionStorage.setItem("tw-cms-display-name", trimmed)
  }, [displayName])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  useEffect(() => {
    const handleUndo = (event: KeyboardEvent) => {
      if (
        !editing ||
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "z"
      ) {
        return
      }
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest("[data-cms-native-undo]")
      ) {
        return
      }
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }
    window.addEventListener("keydown", handleUndo)
    return () => window.removeEventListener("keydown", handleUndo)
  }, [editing, redo, undo])

  useEffect(() => {
    if (panelOpen) {
      setHistoryOpen(false)
    }
  }, [panelOpen])

  useEffect(() => {
    setPinsVisible(!editing)
    if (editing) setPanelOpen(false)
  }, [editing, setPanelOpen, setPinsVisible])

  useEffect(() => {
    if (editing) return
    setAdminMode(false)
    setAdminCommandMenuOpen(false)
    setSectionsOpen(false)
  }, [editing])

  const apply = useCallback(
    (contract: typeof state.present, historyGroup?: string) => {
      dispatch({ type: "apply", contract, historyGroup })
    },
    []
  )

  const editor = useMemo<ContentReviewEditAdapter | undefined>(() => {
    if (!editing || previewVersion) return undefined
    return {
      updatePageText: (field, value) =>
        apply(
          replaceCmsValue(
            state.present,
            ["pageDocument", "page", field],
            value
          ),
          `page.${field}`
        ),
      updateSectionText: (visibleSectionIndex, fieldPath, value) => {
        const visibleSections = state.present.pageDocument.sections.filter(
          (section) =>
            section.state === "visible" && section.type !== "footer-feedback"
        )
        const target = visibleSections.at(visibleSectionIndex)
        if (!target) return
        const storedIndex = state.present.pageDocument.sections.findIndex(
          (section) => section.id === target.id
        )
        if (storedIndex < 0) return
        apply(
          replaceCmsValue(
            state.present,
            ["pageDocument", "sections", storedIndex, "fields", ...fieldPath],
            value
          ),
          `section.${target.id}.${fieldPath.join(".")}`
        )
      },
      updateFooterText: (fieldPath, value) => {
        const footerIndex = state.present.pageDocument.sections.findIndex(
          (section) => section.type === "footer-feedback"
        )
        if (footerIndex < 0) return
        apply(
          replaceCmsValue(
            state.present,
            ["pageDocument", "sections", footerIndex, "fields", ...fieldPath],
            value
          ),
          `footer.${fieldPath.join(".")}`
        )
      },
    }
  }, [apply, editing, previewVersion, state.present])

  const displayContract = previewVersion ?? state.present
  const reviewPresentation = useMemo(
    () => buildCmsReviewPresentation(displayContract),
    [displayContract]
  )
  const reviewVersionId =
    previewVersion?.head.versionId ?? state.baseline.head.versionId
  const previewDocument = projectCmsPageDocumentForEditor(
    displayContract.pageDocument
  )

  useEffect(() => {
    replaceAnnotations(reviewPresentation.annotations)
  }, [replaceAnnotations, reviewPresentation.annotations])

  const loadHistory = useCallback(
    async (cursor: number | null = null, append = false) => {
      if (append) setHistoryLoadingMore(true)
      else setHistoryLoading(true)
      try {
        const response = await readCmsHistory(state.baseline.pageId, cursor)
        if (!response.ok || response.kind !== "history") {
          setHistoryRetryAction({ kind: "load", cursor, append })
          setHistoryError(
            response.ok
              ? "Version history is not available right now."
              : response.message
          )
          return
        }
        setHistoryRetryAction(null)
        setHistoryError(null)
        setHistory((current) =>
          append
            ? [...current, ...response.history.versions]
            : response.history.versions
        )
        setHistoryCursor(response.history.nextCursor)
      } catch {
        setHistoryRetryAction({ kind: "load", cursor, append })
        setHistoryError(
          "Version history is not available right now. Try again."
        )
      } finally {
        setHistoryLoading(false)
        setHistoryLoadingMore(false)
      }
    },
    [state.baseline.pageId]
  )

  const openHistory = useCallback(
    (opener?: HTMLButtonElement) => {
      if (opener) historyOpenerRef.current = opener
      setPanelOpen(false)
      setHistoryOpen(true)
      setSectionsOpen(false)
      if (history.length === 0 && !historyLoading) void loadHistory()
    },
    [history.length, historyLoading, loadHistory, setPanelOpen]
  )

  const closeHistory = useCallback(() => {
    setHistoryOpen(false)
    setPreviewVersion(null)
    window.requestAnimationFrame(() => {
      const remembered = historyOpenerRef.current
      const fallback = document.querySelector<HTMLButtonElement>(
        "[data-cms-history-trigger]"
      )
      const target = remembered?.isConnected ? remembered : fallback
      target?.focus()
    })
  }, [])

  const startOrFinishEditing = useCallback(() => {
    if (editing) {
      dispatch({ type: "request-finish" })
      return
    }
    setHistoryOpen(false)
    setPreviewVersion(null)
    setStatus({
      kind: "idle",
      message: "Editing is on. Select any outlined teacher-facing text.",
    })
    dispatch({ type: "start-editing" })
  }, [editing])

  const setAdminModeFromCommand = useCallback(
    (next: boolean) => {
      adminCommandFocusTargetRef.current = next ? "sections" : "finish"
      setAdminMode(next)
      setAdminCommandMenuOpen(false)
      setSectionsOpen(next)
      setHistoryOpen(false)
      setPreviewVersion(null)
      setPanelOpen(false)
      if (next && !editing) {
        dispatch({ type: "start-editing" })
        setStatus({
          kind: "idle",
          message: "Editing is on. Select any outlined teacher-facing text.",
        })
      }
    },
    [editing, setPanelOpen]
  )

  const toggleAdminCommandMenu = useCallback(() => {
    const next = !adminCommandMenuOpen
    if (next) {
      adminCommandOpenerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      setHistoryOpen(false)
      setPreviewVersion(null)
      setPanelOpen(false)
    }
    setAdminCommandMenuOpen(next)
  }, [adminCommandMenuOpen, setPanelOpen])

  const saveDraft = useCallback(
    async (finish: boolean) => {
      const name = displayName.trim()
      if (!name) {
        setStatus({ kind: "error", message: "Enter your name before saving." })
        return false
      }
      if (!isCmsVersionContract(state.present)) {
        setStatus({
          kind: "error",
          message:
            "Some content needs attention before this draft can be saved.",
        })
        return false
      }
      const fingerprint = JSON.stringify({
        head: state.baseline.head,
        contract: state.present,
        name,
      })
      const attempt = attemptFor(saveAttemptRef.current, fingerprint)
      saveAttemptRef.current = attempt
      const request: CmsWriteRequest = {
        operation: "save",
        pageId: state.baseline.pageId,
        expectedHead: state.baseline.head,
        contract: state.present,
        displayName: name,
        attemptId: attempt.attemptId,
      }
      setStatus({ kind: "busy", message: "Saving draft…" })
      try {
        const response = await writeCms(request, csrfToken)
        if (!response.ok) {
          if (response.code === "STALE_DRAFT" && response.latest) {
            dispatch({ type: "save-conflicted", latest: response.latest })
          }
          if (response.code !== "UNAVAILABLE") saveAttemptRef.current = null
          setStatus({ kind: "error", message: response.message })
          return false
        }
        if (response.operation !== "save") {
          setStatus({
            kind: "error",
            message:
              "The editor returned an unexpected response. Your changes are still here.",
          })
          return false
        }
        if (response.result.outcome !== "committed") {
          const latest = response.result.live
          dispatch({ type: "save-conflicted", latest })
          setStatus({
            kind: "error",
            message:
              "A newer version was saved. Your changes are still here. Compare them before saving again.",
          })
          saveAttemptRef.current = null
          return false
        }
        saveAttemptRef.current = null
        dispatch({
          type: "save-succeeded",
          snapshot: response.result.committed,
          finish,
        })
        setStatus({
          kind: "success",
          message: `Draft saved as version ${response.result.committed.head.versionNumber}.`,
        })
        if (historyOpen) void loadHistory()
        return true
      } catch {
        setStatus({
          kind: "error",
          message:
            "We could not save this draft. Your changes are still here. Try again.",
        })
        return false
      }
    },
    [
      csrfToken,
      displayName,
      historyOpen,
      loadHistory,
      state.baseline,
      state.present,
    ]
  )

  const previewHistoryVersion = useCallback(
    async (version: CmsVersionHistoryItem) => {
      setPreviewingVersionId(version.head.versionId)
      try {
        const response = await readCmsVersion(
          state.baseline.pageId,
          version.head.versionId
        )
        if (!response.ok || response.kind !== "version") {
          setHistoryRetryAction({ kind: "preview", version })
          setHistoryError(
            response.ok ? "That version could not be loaded." : response.message
          )
          return
        }
        setHistoryRetryAction(null)
        setHistoryError(null)
        setPreviewVersion(response.version)
      } catch {
        setHistoryRetryAction({ kind: "preview", version })
        setHistoryError("That version could not be loaded. Try again.")
      } finally {
        setPreviewingVersionId(null)
      }
    },
    [state.baseline.pageId]
  )

  const retryHistory = useCallback(() => {
    if (!historyRetryAction) return
    if (historyRetryAction.kind === "load") {
      void loadHistory(historyRetryAction.cursor, historyRetryAction.append)
      return
    }
    void previewHistoryVersion(historyRetryAction.version)
  }, [historyRetryAction, loadHistory, previewHistoryVersion])

  const restoreVersion = useCallback(async () => {
    if (!previewVersion || dirty) return
    const name = displayName.trim()
    if (!name) {
      setStatus({
        kind: "error",
        message: "Enter your name before restoring a version.",
      })
      return
    }
    const fingerprint = JSON.stringify({
      source: previewVersion.head.versionId,
      head: state.baseline.head,
      name,
    })
    const attempt = attemptFor(restoreAttemptRef.current, fingerprint)
    restoreAttemptRef.current = attempt
    setStatus({
      kind: "busy",
      message: `Restoring version ${previewVersion.head.versionNumber}…`,
    })
    try {
      const response = await writeCms(
        {
          operation: "restore",
          pageId: state.baseline.pageId,
          sourceVersionId: previewVersion.head.versionId,
          expectedHead: state.baseline.head,
          displayName: name,
          attemptId: attempt.attemptId,
        },
        csrfToken
      )
      if (!response.ok) {
        if (response.code === "STALE_DRAFT" && response.latest) {
          dispatch({ type: "save-conflicted", latest: response.latest })
        }
        if (response.code !== "UNAVAILABLE") restoreAttemptRef.current = null
        setStatus({ kind: "error", message: response.message })
        return
      }
      if (response.operation !== "restore") {
        setStatus({
          kind: "error",
          message:
            "The editor returned an unexpected response. The current draft has not changed.",
        })
        return
      }
      if (response.result.outcome !== "committed") {
        dispatch({ type: "save-conflicted", latest: response.result.live })
        setStatus({
          kind: "error",
          message:
            "A newer version was saved. Refresh history before restoring.",
        })
        return
      }
      restoreAttemptRef.current = null
      dispatch({
        type: "restore-succeeded",
        snapshot: response.result.committed,
      })
      setPreviewVersion(null)
      setStatus({
        kind: "success",
        message: `Version ${previewVersion.head.versionNumber} was restored as draft version ${response.result.committed.head.versionNumber}.`,
      })
      void loadHistory()
    } catch {
      setStatus({
        kind: "error",
        message:
          "We could not restore this version. The current draft has not changed.",
      })
    }
  }, [
    csrfToken,
    dirty,
    displayName,
    loadHistory,
    previewVersion,
    state.baseline,
  ])

  const publishVersion = useCallback(async () => {
    const name = displayName.trim()
    if (!name) {
      publicationFocusTargetRef.current = "publish"
      setPublishDialogOpen(false)
      setStatus({
        kind: "error",
        message: "Enter your name before publishing.",
      })
      return
    }
    const fingerprint = JSON.stringify({
      draft: state.baseline.head,
      published: state.publishedHead,
      name,
    })
    const attempt = attemptFor(publishAttemptRef.current, fingerprint)
    publishAttemptRef.current = attempt
    setStatus({
      kind: "busy",
      message: `Publishing version ${state.baseline.head.versionNumber}…`,
    })
    try {
      const response = await writeCms(
        {
          operation: "publish",
          pageId: state.baseline.pageId,
          versionId: state.baseline.head.versionId,
          expectedDraft: state.baseline.head,
          expectedPublished: state.publishedHead,
          displayName: name,
          attemptId: attempt.attemptId,
        },
        csrfToken
      )
      if (!response.ok) {
        if (response.code !== "UNAVAILABLE") publishAttemptRef.current = null
        if (response.code === "STALE_PUBLICATION" && response.latest) {
          dispatch({
            type: "publish-succeeded",
            publishedHead: response.latest.head,
          })
        }
        publicationFocusTargetRef.current = response.latest
          ? "finish"
          : "publish"
        setPublishDialogOpen(false)
        setStatus({ kind: "error", message: response.message })
        return
      }
      if (response.operation !== "publish") {
        publicationFocusTargetRef.current = "publish"
        setPublishDialogOpen(false)
        setStatus({
          kind: "error",
          message:
            "The editor returned an unexpected response. The public page has not changed.",
        })
        return
      }
      publishAttemptRef.current = null
      const liveHead =
        response.result.live?.head ?? response.result.committed.head
      publicationFocusTargetRef.current = "finish"
      dispatch({ type: "publish-succeeded", publishedHead: liveHead })
      setPublishDialogOpen(false)
      setStatus({
        kind: "success",
        message:
          response.result.outcome === "committed"
            ? `Version ${response.result.committed.head.versionNumber} is ready in the private comparison. The released website has not changed.`
            : `Version ${liveHead.versionNumber} is the latest private publication.`,
      })
      if (historyOpen) void loadHistory()
    } catch {
      publicationFocusTargetRef.current = "publish"
      setPublishDialogOpen(false)
      setStatus({
        kind: "error",
        message:
          "We could not publish this version. The public page has not changed. Try again.",
      })
    }
  }, [
    csrfToken,
    displayName,
    historyOpen,
    loadHistory,
    state.baseline,
    state.publishedHead,
  ])

  const publishedComparisonHref = `/cms-compare?page=${encodeURIComponent(
    state.baseline.pageId
  )}`

  const controls = editing ? (
    <>
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="min-h-11"
        disabled={state.past.length === 0 || busy}
        onClick={undo}
      >
        Undo
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="min-h-11"
        disabled={state.future.length === 0 || busy}
        onClick={redo}
      >
        Redo
      </Button>
      {adminMode ? (
        <Button
          ref={sectionsButtonRef}
          type="button"
          variant="outline"
          size="lg"
          className="min-h-11"
          aria-controls="cms-sections-panel"
          aria-expanded={sectionsOpen}
          disabled={busy}
          onClick={() => {
            setSectionsOpen((open) => !open)
            setHistoryOpen(false)
            setPanelOpen(false)
          }}
        >
          Section order
        </Button>
      ) : null}
      <Button
        ref={publishButtonRef}
        type="button"
        variant="outline"
        size="lg"
        className="min-h-11"
        disabled={busy || dirty || currentPublished}
        title={
          dirty ? "Save or discard your changes before publishing." : undefined
        }
        onClick={() => setPublishDialogOpen(true)}
      >
        {currentPublished ? "Published" : "Publish"}
      </Button>
      <Button
        type="button"
        size="lg"
        className="min-h-11"
        disabled={busy || !dirty}
        onClick={() => void saveDraft(false)}
      >
        {status.kind === "busy" && status.message.startsWith("Saving")
          ? "Saving draft…"
          : "Save draft"}
      </Button>
      <Button
        ref={finishEditingButtonRef}
        type="button"
        variant="outline"
        size="lg"
        className="min-h-11"
        disabled={busy}
        onClick={startOrFinishEditing}
      >
        <DoorOpenIcon data-icon="inline-start" aria-hidden="true" />
        Finish editing
      </Button>
    </>
  ) : (
    <Button
      type="button"
      size="lg"
      className="min-h-11"
      onClick={startOrFinishEditing}
    >
      Edit content
    </Button>
  )

  const leadingControls = !editing ? (
    <>
      {state.publishedHead ? (
        <Button asChild variant="outline" size="lg" className="min-h-11">
          <a href={publishedComparisonHref} target="_blank" rel="noreferrer">
            View published
          </a>
        </Button>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="min-h-11"
        data-cms-history-trigger
        aria-controls="cms-version-history-panel"
        aria-expanded={historyOpen}
        onClick={(event) => openHistory(event.currentTarget)}
      >
        Version history
      </Button>
    </>
  ) : null

  const sidePanelOpen = panelOpen || historyOpen || sectionsOpen
  const sidePanelSide = historyOpen ? "left" : sidePanelOpen ? "right" : null
  const previewing = previewVersion !== null

  return (
    <div
      data-cms-panel-side={sidePanelSide ?? undefined}
      className={
        sidePanelSide === "left"
          ? "flex flex-col lg:grid lg:grid-cols-[22rem_minmax(0,1fr)]"
          : sidePanelSide === "right"
            ? "flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_22rem]"
            : undefined
      }
    >
      <PublicReviewMode
        externalEditor={{
          active: editing,
          adminActive: adminMode,
          adminCommandOpen: adminCommandMenuOpen,
          busy,
          leadingControls,
          controls,
          statusMessage: state.conflict
            ? "A newer draft was saved. Your changes are still here."
            : status.message,
          onAdminCommand: toggleAdminCommandMenu,
          onToggle: startOrFinishEditing,
        }}
        externalReviewPanel={{
          content: (
            <CmsSectionContextPanel
              pageId={state.baseline.pageId}
              versionId={reviewVersionId}
              csrfToken={csrfToken}
              displayName={displayName}
              onDisplayNameChange={setDisplayName}
              onStatusMessage={(message) =>
                setStatus({ kind: "success", message })
              }
            />
          ),
        }}
      />

      {editing && adminMode && sectionsOpen ? (
        <SectionOrderPanel
          contract={state.present}
          onChange={(contract) => {
            apply(contract)
            setStatus({
              kind: "success",
              message: "Section order updated. Use Undo to restore it.",
            })
          }}
          onClose={() => {
            setSectionsOpen(false)
            window.requestAnimationFrame(() =>
              sectionsButtonRef.current?.focus()
            )
          }}
        />
      ) : null}

      <CmsVersionHistoryPanel
        open={historyOpen}
        loading={historyLoading}
        loadingMore={historyLoadingMore}
        error={historyError}
        retryKind={historyRetryAction?.kind ?? null}
        versions={history}
        nextCursor={historyCursor}
        selected={previewVersion}
        dirty={dirty}
        restoring={
          status.kind === "busy" && status.message.startsWith("Restoring")
        }
        previewingVersionId={previewingVersionId}
        onClose={closeHistory}
        onPreview={(version) => void previewHistoryVersion(version)}
        onRestore={() => void restoreVersion()}
        onLoadMore={() => void loadHistory(historyCursor, history.length > 0)}
        onRetry={retryHistory}
        onReturnToDraft={() => setPreviewVersion(null)}
      />

      <div
        className={
          sidePanelSide === "left"
            ? "order-2 min-w-0 lg:order-none lg:col-start-2 lg:row-start-2"
            : sidePanelSide === "right"
              ? "order-2 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2"
              : "min-w-0"
        }
      >
        {editing ? (
          <div
            data-review-chrome
            className="border-b border-border bg-muted px-4 py-3 font-body sm:px-6"
          >
            <label className="mx-auto block max-w-[90rem] text-sm font-medium sm:ml-0 sm:max-w-sm">
              Your name
              <Input
                data-cms-native-undo
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Shown in version history"
                className="mt-1 min-h-11 bg-background"
              />
            </label>
          </div>
        ) : null}

        {previewing ? (
          <div
            data-review-chrome
            className="border-b border-foreground/20 bg-muted px-4 py-3 font-body text-sm sm:px-6"
          >
            <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3">
              <p className="font-medium">
                Previewing saved version {previewVersion.head.versionNumber}
              </p>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="min-h-11"
                onClick={() => setPreviewVersion(null)}
              >
                Exit version preview
              </Button>
            </div>
          </div>
        ) : null}

        {state.conflict ? (
          <div
            data-review-chrome
            className="border-b border-foreground/20 bg-background px-4 py-3 font-body text-sm sm:px-6"
          >
            <div className="mx-auto max-w-[90rem]">
              <p className="font-semibold">A newer draft was saved.</p>
              <p className="mt-1 text-muted-foreground">
                Your changes are still here. The latest saved draft is version{" "}
                {state.conflict.head.versionNumber}.
              </p>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="mt-3 min-h-11"
                data-cms-history-trigger
                onClick={(event) => openHistory(event.currentTarget)}
              >
                Compare versions
              </Button>
            </div>
          </div>
        ) : null}

        {previewDocument ? (
          <ContentReviewPage
            data={{ kind: "ready", document: previewDocument }}
            editor={editor}
            reviewTargets={{
              sections: reviewPresentation.sectionTargets,
              footerSectionId: reviewPresentation.footerTargetId,
            }}
          />
        ) : (
          <main className="grid min-h-[50vh] place-items-center bg-muted px-6 font-body">
            <p className="max-w-md border border-border bg-background p-6 text-center">
              Some content needs attention before this preview can be shown. Use
              Undo, or press Command-K, choose Enter Admin mode, and check
              Section order.
            </p>
          </main>
        )}
      </div>

      <FinishEditingDialog
        open={state.finishChoiceOpen}
        saving={status.kind === "busy" && status.message.startsWith("Saving")}
        errorMessage={
          state.finishChoiceOpen && status.kind === "error"
            ? status.message
            : null
        }
        onSave={() => void saveDraft(true)}
        onDiscard={() => {
          dispatch({ type: "discard-and-finish" })
          setSectionsOpen(false)
          setStatus({ kind: "success", message: "Unsaved changes discarded." })
        }}
        onKeepEditing={() => dispatch({ type: "keep-editing" })}
      />

      <CmsAdminCommandMenu
        open={adminCommandMenuOpen}
        adminActive={adminMode}
        onOpenChange={setAdminCommandMenuOpen}
        onEnterAdmin={() => setAdminModeFromCommand(true)}
        onExitAdmin={() => setAdminModeFromCommand(false)}
      />

      <PublishVersionDialog
        open={publishDialogOpen}
        publishing={
          status.kind === "busy" && status.message.startsWith("Publishing")
        }
        pageTitle={state.baseline.pageDocument.page.title}
        path={state.baseline.pageDocument.page.path}
        versionNumber={state.baseline.head.versionNumber}
        displayName={displayName.trim()}
        onPublish={() => void publishVersion()}
        onCancel={() => {
          publicationFocusTargetRef.current = "publish"
          setPublishDialogOpen(false)
        }}
      />
    </div>
  )
}

function SectionOrderPanel({
  contract,
  onChange,
  onClose,
}: {
  readonly contract: CmsVersionContract
  readonly onChange: (contract: CmsVersionContract) => void
  readonly onClose: () => void
}) {
  const sections = contract.pageDocument.sections.filter(
    (section) => section.state !== "archived"
  )

  return (
    <aside
      id="cms-sections-panel"
      data-review-chrome
      aria-labelledby="cms-sections-heading"
      className="order-1 min-w-0 border-b border-foreground/20 bg-background font-body text-sm lg:order-none lg:col-start-2 lg:row-start-2 lg:min-h-screen lg:border-b-0 lg:border-l"
    >
      <div className="lg:sticky lg:top-[calc(var(--masthead-h)+8.5rem)] lg:max-h-[calc(100vh-var(--masthead-h)-8.5rem)] lg:overflow-y-auto">
        <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-4">
          <div>
            <h2
              id="cms-sections-heading"
              className="font-heading text-lg font-semibold"
            >
              Section order
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Move sections into the order they should appear on the page.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Close section order"
            onClick={onClose}
          >
            <XIcon aria-hidden="true" />
          </Button>
        </header>

        <ol className="divide-y divide-border px-4">
          {sections.map((section, index) => {
            const rule = cmsSectionRegistry[section.type]
            const fixed = !rule.canArchive
            return (
              <li key={section.id} className="py-4">
                <div className="flex items-start gap-3">
                  <p className="pt-0.5 text-xs text-muted-foreground tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{rule.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {fixed
                        ? "Fixed position"
                        : section.state === "hidden"
                          ? "Hidden from the page"
                          : "Shown on the page"}
                    </p>
                  </div>
                </div>
                <div
                  className="mt-3 flex gap-2 pl-7"
                  role="group"
                  aria-label={`${rule.label} order`}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="min-h-11 flex-1"
                    aria-label={`Move ${rule.label} up`}
                    disabled={fixed || index <= 1}
                    onClick={() =>
                      onChange(
                        moveCmsSectionInPanelOrder(contract, section.id, -1)
                      )
                    }
                  >
                    Move up
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="min-h-11 flex-1"
                    aria-label={`Move ${rule.label} down`}
                    disabled={fixed || index >= sections.length - 2}
                    onClick={() =>
                      onChange(
                        moveCmsSectionInPanelOrder(contract, section.id, 1)
                      )
                    }
                  >
                    Move down
                  </Button>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </aside>
  )
}

function moveCmsSectionInPanelOrder(
  contract: CmsVersionContract,
  sectionId: string,
  direction: -1 | 1
): CmsVersionContract {
  const sections = contract.pageDocument.sections
  const index = sections.findIndex((section) => section.id === sectionId)
  if (index < 0) return contract

  let destination = index + direction
  while (sections[destination]?.state === "archived") {
    destination += direction
  }
  if (destination < 0 || destination >= sections.length) return contract

  let next = contract
  for (let step = 0; step < Math.abs(destination - index); step += 1) {
    next = moveCmsSection(next, sectionId, direction)
  }
  return next
}
