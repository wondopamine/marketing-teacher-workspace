import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"

import { ContentReviewPage } from "../content-review-page"
import { PublicReviewMode } from "../public-review-mode"
import { CmsVersionHistoryPanel } from "../version-history/cms-version-history-panel"
import { useReviewAnnotations } from "../review-annotations"
import { FinishEditingDialog, PublishVersionDialog } from "./cms-editor-dialogs"
import {
  cmsEditorReducer,
  createCmsEditorState,
  isCmsEditorDirty,
  moveCmsSection,
  replaceCmsValue,
  setCmsSectionState,
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

type WorkspaceStatus = {
  readonly kind: "idle" | "busy" | "success" | "error"
  readonly message: string
}

type RetriableAttempt = {
  readonly fingerprint: string
  readonly attemptId: string
}

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
  const { panelOpen, setPanelOpen, setPinsVisible } = useReviewAnnotations()
  const [displayName, setDisplayName] = useState("")
  const [status, setStatus] = useState<WorkspaceStatus>({
    kind: "idle",
    message: "Review a section or edit the teacher copy.",
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sectionsOpen, setSectionsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
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
  const restoreAttemptRef = useRef<RetriableAttempt | null>(null)
  const historyOpenerRef = useRef<HTMLButtonElement | null>(null)

  const dirty = isCmsEditorDirty(state)
  const busy = status.kind === "busy"
  const editing = state.mode === "editing"
  const currentPublished = sameHead(state.publishedHead, state.baseline.head)

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
      dispatch({ type: event.shiftKey ? "redo" : "undo" })
    }
    window.addEventListener("keydown", handleUndo)
    return () => window.removeEventListener("keydown", handleUndo)
  }, [editing])

  useEffect(() => {
    if (panelOpen) setHistoryOpen(false)
  }, [panelOpen])

  useEffect(() => {
    setPinsVisible(!editing)
    if (editing) setPanelOpen(false)
  }, [editing, setPanelOpen, setPinsVisible])

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
  const previewDocument = projectCmsPageDocumentForEditor(
    displayContract.pageDocument
  )

  const loadHistory = useCallback(
    async (cursor: number | null = null, append = false) => {
      if (append) setHistoryLoadingMore(true)
      else setHistoryLoading(true)
      setHistoryError(null)
      try {
        const response = await readCmsHistory(state.baseline.pageId, cursor)
        if (!response.ok || response.kind !== "history") {
          setHistoryError(
            response.ok
              ? "Version history is not available right now."
              : response.message
          )
          return
        }
        setHistory((current) =>
          append
            ? [...current, ...response.history.versions]
            : response.history.versions
        )
        setHistoryCursor(response.history.nextCursor)
      } catch {
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
      setSettingsOpen(false)
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
      setHistoryError(null)
      try {
        const response = await readCmsVersion(
          state.baseline.pageId,
          version.head.versionId
        )
        if (!response.ok || response.kind !== "version") {
          setHistoryError(
            response.ok ? "That version could not be loaded." : response.message
          )
          return
        }
        setPreviewVersion(response.version)
        setStatus({
          kind: "success",
          message: `Previewing version ${response.version.head.versionNumber}.`,
        })
      } catch {
        setHistoryError("That version could not be loaded. Try again.")
      } finally {
        setPreviewingVersionId(null)
      }
    },
    [state.baseline.pageId]
  )

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
        setPublishDialogOpen(false)
        setStatus({ kind: "error", message: response.message })
        return
      }
      if (response.operation !== "publish") {
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
      dispatch({ type: "publish-succeeded", publishedHead: liveHead })
      setPublishDialogOpen(false)
      setStatus({
        kind: "success",
        message:
          response.result.outcome === "committed"
            ? `Version ${response.result.committed.head.versionNumber} published to the CMS. The released homepage has not changed.`
            : `Version ${liveHead.versionNumber} is now the latest CMS publication.`,
      })
      if (historyOpen) void loadHistory()
    } catch {
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

  const controls = editing ? (
    <>
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="min-h-11"
        disabled={state.past.length === 0 || busy}
        onClick={() => dispatch({ type: "undo" })}
      >
        Undo
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="min-h-11"
        disabled={state.future.length === 0 || busy}
        onClick={() => dispatch({ type: "redo" })}
      >
        Redo
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="min-h-11"
        aria-expanded={settingsOpen}
        disabled={busy}
        onClick={() => {
          setSettingsOpen((open) => !open)
          setSectionsOpen(false)
        }}
      >
        Page settings
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="min-h-11"
        aria-expanded={sectionsOpen}
        disabled={busy}
        onClick={() => {
          setSectionsOpen((open) => !open)
          setSettingsOpen(false)
        }}
      >
        Sections
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="min-h-11"
        data-cms-history-trigger
        disabled={busy}
        onClick={(event) => openHistory(event.currentTarget)}
      >
        Version history
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="min-h-11"
        disabled={busy}
        onClick={startOrFinishEditing}
      >
        Finish editing
      </Button>
      <Button
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
        Publish
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
    </>
  ) : (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="min-h-11"
        data-cms-history-trigger
        onClick={(event) => openHistory(event.currentTarget)}
      >
        Version history
      </Button>
      <Button
        type="button"
        size="lg"
        className="min-h-11"
        onClick={startOrFinishEditing}
      >
        Edit content
      </Button>
    </>
  )

  const sidePanelOpen = panelOpen || historyOpen
  const previewing = previewVersion !== null

  return (
    <div
      className={
        sidePanelOpen ? "lg:grid lg:grid-cols-[minmax(0,1fr)_22rem]" : undefined
      }
    >
      <PublicReviewMode
        externalEditor={{
          active: editing,
          busy,
          controls,
          statusMessage: state.conflict
            ? "A newer draft was saved. Your changes are still here."
            : status.message,
          onToggle: startOrFinishEditing,
        }}
      />

      <div
        className={
          sidePanelOpen ? "min-w-0 lg:col-start-1 lg:row-start-2" : "min-w-0"
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
                Return to current draft
              </Button>
            </div>
          </div>
        ) : null}

        {editing && settingsOpen ? (
          <PageSettings
            title={state.present.pageDocument.page.title}
            path={state.present.pageDocument.page.path}
            description={state.present.pageDocument.page.description}
            onChange={(field, value) =>
              apply(
                replaceCmsValue(
                  state.present,
                  ["pageDocument", "page", field],
                  value
                ),
                `page.${field}`
              )
            }
          />
        ) : null}

        {editing && sectionsOpen ? (
          <SectionManager
            contract={state.present}
            onChange={(contract) => apply(contract)}
            onNotice={(message) => setStatus({ kind: "success", message })}
          />
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
          />
        ) : (
          <main className="grid min-h-[50vh] place-items-center bg-muted px-6 font-body">
            <p className="max-w-md border border-border bg-background p-6 text-center">
              Some content needs attention before this preview can be shown. Use
              Undo or open Sections.
            </p>
          </main>
        )}
      </div>

      <CmsVersionHistoryPanel
        open={historyOpen}
        loading={historyLoading}
        loadingMore={historyLoadingMore}
        error={historyError}
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
        onLoadMore={() =>
          void loadHistory(
            historyError ? null : historyCursor,
            historyError ? false : history.length > 0
          )
        }
        onReturnToDraft={() => setPreviewVersion(null)}
      />

      <FinishEditingDialog
        open={state.finishChoiceOpen}
        saving={status.kind === "busy" && status.message.startsWith("Saving")}
        errorMessage={status.kind === "error" ? status.message : null}
        onSave={() => void saveDraft(true)}
        onDiscard={() => {
          dispatch({ type: "discard-and-finish" })
          setSettingsOpen(false)
          setSectionsOpen(false)
          setStatus({ kind: "success", message: "Unsaved changes discarded." })
        }}
        onKeepEditing={() => dispatch({ type: "keep-editing" })}
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
        onCancel={() => setPublishDialogOpen(false)}
      />
    </div>
  )
}

function PageSettings({
  title,
  path,
  description,
  onChange,
}: {
  readonly title: string
  readonly path: string
  readonly description: string
  readonly onChange: (
    field: "title" | "path" | "description",
    value: string
  ) => void
}) {
  const pathValid = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(path)
  return (
    <section
      data-review-chrome
      aria-labelledby="cms-page-settings-heading"
      className="border-b border-border bg-background px-4 py-5 font-body sm:px-6"
    >
      <div className="mx-auto max-w-[90rem]">
        <h2
          id="cms-page-settings-heading"
          className="font-heading text-xl font-semibold"
        >
          Page settings
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.45fr)]">
          <label className="text-sm font-medium">
            Page title
            <Input
              data-cms-native-undo
              value={title}
              onChange={(event) => onChange("title", event.target.value)}
              className="mt-1 min-h-11"
            />
          </label>
          <label className="text-sm font-medium">
            Page address
            <Input
              data-cms-native-undo
              value={path}
              aria-invalid={!pathValid}
              onChange={(event) => onChange("path", event.target.value)}
              className="mt-1 min-h-11"
            />
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              Use / or one lower-case path, such as /family-support.
            </span>
          </label>
          <label className="text-sm font-medium lg:col-span-2">
            Search description
            <textarea
              data-cms-native-undo
              value={description}
              onChange={(event) => onChange("description", event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
        </div>
      </div>
    </section>
  )
}

function SectionManager({
  contract,
  onChange,
  onNotice,
}: {
  readonly contract: CmsVersionContract
  readonly onChange: (contract: CmsVersionContract) => void
  readonly onNotice: (message: string) => void
}) {
  const sections = contract.pageDocument.sections
  return (
    <section
      data-review-chrome
      aria-labelledby="cms-sections-heading"
      className="border-b border-border bg-background px-4 py-5 font-body sm:px-6"
    >
      <div className="mx-auto max-w-[90rem]">
        <h2
          id="cms-sections-heading"
          className="font-heading text-xl font-semibold"
        >
          Sections
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Reorder, hide, or archive a section. Undo stays available until you
          save.
        </p>
        <ol className="mt-4 divide-y divide-border border-y border-border">
          {sections.map((section, index) => {
            const rule = cmsSectionRegistry[section.type]
            const fixed = !rule.canArchive
            return (
              <li
                key={section.id}
                className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="font-medium">{rule.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {section.state === "visible"
                      ? "Shown"
                      : section.state === "hidden"
                        ? "Hidden"
                        : "Archived"}
                  </p>
                </div>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label={`${rule.label} section actions`}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="min-h-11"
                    disabled={fixed || index <= 1}
                    onClick={() =>
                      onChange(moveCmsSection(contract, section.id, -1))
                    }
                  >
                    Move up
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="min-h-11"
                    disabled={fixed || index >= sections.length - 2}
                    onClick={() =>
                      onChange(moveCmsSection(contract, section.id, 1))
                    }
                  >
                    Move down
                  </Button>
                  {section.state === "archived" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="min-h-11"
                      onClick={() => {
                        onChange(
                          setCmsSectionState(contract, section.id, "visible")
                        )
                        onNotice(
                          `${rule.label} restored. Use Undo to put it back.`
                        )
                      }}
                    >
                      Restore
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="min-h-11"
                        disabled={fixed}
                        onClick={() =>
                          onChange(
                            setCmsSectionState(
                              contract,
                              section.id,
                              section.state === "hidden" ? "visible" : "hidden"
                            )
                          )
                        }
                      >
                        {section.state === "hidden" ? "Show" : "Hide"}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="lg"
                        className="min-h-11"
                        disabled={fixed}
                        onClick={() => {
                          onChange(
                            setCmsSectionState(contract, section.id, "archived")
                          )
                          onNotice(
                            `${rule.label} archived. Use Undo to restore it.`
                          )
                        }}
                      >
                        Archive
                      </Button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
