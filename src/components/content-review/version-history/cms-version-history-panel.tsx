import { useEffect, useMemo, useRef } from "react"

import type {
  CmsVersionHistoryItem,
  CmsVersionSnapshot,
} from "@/db/content-repository.server"
import { Button } from "@/components/ui/button"

function formatSavedAt(value: string): string {
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
  }).format(new Date(value))
}

export function CmsVersionHistoryPanel({
  open,
  loading,
  loadingMore,
  error,
  retryKind,
  versions,
  nextCursor,
  selected,
  dirty,
  restoring,
  previewingVersionId,
  onClose,
  onPreview,
  onRestore,
  onLoadMore,
  onRetry,
  onReturnToDraft,
}: {
  readonly open: boolean
  readonly loading: boolean
  readonly loadingMore: boolean
  readonly error: string | null
  readonly retryKind: "load" | "preview" | null
  readonly versions: ReadonlyArray<CmsVersionHistoryItem>
  readonly nextCursor: number | null
  readonly selected: CmsVersionSnapshot | null
  readonly dirty: boolean
  readonly restoring: boolean
  readonly previewingVersionId: string | null
  readonly onClose: () => void
  readonly onPreview: (version: CmsVersionHistoryItem) => void
  readonly onRestore: () => void
  readonly onLoadMore: () => void
  readonly onRetry: () => void
  readonly onReturnToDraft: () => void
}) {
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const returnToDraftRef = useRef<HTMLButtonElement | null>(null)
  const retryRef = useRef<HTMLButtonElement | null>(null)
  const previewButtonRefs = useRef(new Map<string, HTMLButtonElement>())
  const previousSelectedIdRef = useRef<string | null>(null)
  const selectedExitFocusRef = useRef<"preview" | "heading">("preview")
  const previousErrorRef = useRef<string | null>(null)
  const retryingRef = useRef<"history" | "preview" | null>(null)
  useEffect(() => {
    if (open) headingRef.current?.focus()
  }, [open])
  useEffect(() => {
    const selectedId = selected?.head.versionId ?? null
    const previousId = previousSelectedIdRef.current
    previousSelectedIdRef.current = selectedId
    if (selectedId && selectedId !== previousId) {
      window.requestAnimationFrame(() => returnToDraftRef.current?.focus())
      return
    }
    if (!selectedId && previousId) {
      window.requestAnimationFrame(() => {
        if (selectedExitFocusRef.current === "heading") {
          headingRef.current?.focus()
        } else {
          const previewButton = previewButtonRefs.current.get(previousId)
          if (previewButton?.isConnected) previewButton.focus()
          else headingRef.current?.focus()
        }
        selectedExitFocusRef.current = "preview"
      })
    }
  }, [selected?.head.versionId])
  const retryBusy = loading || loadingMore || previewingVersionId !== null
  useEffect(() => {
    const previousError = previousErrorRef.current
    if (error) {
      previousErrorRef.current = error
      if (error === previousError) return
      window.requestAnimationFrame(() => retryRef.current?.focus())
      return
    }
    previousErrorRef.current = null
    if (retryingRef.current && !retryBusy) {
      const completedRetry = retryingRef.current
      retryingRef.current = null
      if (completedRetry === "history") {
        window.requestAnimationFrame(() => headingRef.current?.focus())
      }
    }
  }, [error, retryBusy])
  const numberById = useMemo(
    () =>
      new Map(
        versions.map((version) => [
          version.head.versionId,
          version.head.versionNumber,
        ])
      ),
    [versions]
  )
  if (!open) return null

  return (
    <aside
      id="cms-version-history-panel"
      aria-labelledby="cms-version-history-heading"
      data-cms-panel-side="left"
      data-review-chrome
      className="z-40 order-1 min-w-0 border-b border-foreground/20 bg-background font-body text-sm lg:order-none lg:col-start-1 lg:row-start-2 lg:min-h-screen lg:border-r lg:border-b-0"
    >
      <div className="lg:sticky lg:top-[calc(var(--masthead-h)+4.25rem)] lg:max-h-[calc(100vh-var(--masthead-h)-4.25rem)] lg:overflow-y-auto">
        <header className="border-b border-border px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="cms-version-history-heading"
                ref={headingRef}
                tabIndex={-1}
                className="font-heading text-xl font-semibold outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                Version history
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Preview a saved version or restore it as a new draft.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="min-h-11"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </header>

        <div className="px-4 py-4">
          {dirty ? (
            <p className="mb-4 border-l-2 border-foreground/40 bg-muted px-3 py-2 leading-5">
              Save or discard your changes before restoring a version.
            </p>
          ) : null}
          {selected ? (
            <section
              className="mb-4 border-b border-border pb-4"
              aria-label="Version preview controls"
            >
              <p className="font-semibold">
                Previewing version {selected.head.versionNumber}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selected.editorDisplayName
                  ? `Saved by ${selected.editorDisplayName}`
                  : "Imported when the CMS was created"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  ref={returnToDraftRef}
                  type="button"
                  variant="outline"
                  size="lg"
                  className="min-h-11"
                  onClick={() => {
                    selectedExitFocusRef.current = "preview"
                    onReturnToDraft()
                  }}
                >
                  Return to current draft
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="min-h-11"
                  disabled={
                    dirty ||
                    restoring ||
                    selected.head.versionNumber ===
                      versions.find((v) => v.isCurrentDraft)?.head.versionNumber
                  }
                  onClick={() => {
                    selectedExitFocusRef.current = "heading"
                    onRestore()
                  }}
                >
                  {restoring ? "Restoring…" : "Restore this version"}
                </Button>
              </div>
            </section>
          ) : null}

          {error ? (
            <div>
              <p
                id="cms-version-history-error"
                className="leading-5 text-destructive"
              >
                {error}
              </p>
              <Button
                ref={retryRef}
                type="button"
                variant="outline"
                size="lg"
                className="mt-3 min-h-11"
                aria-describedby="cms-version-history-error"
                aria-disabled={retryBusy}
                onClick={() => {
                  if (retryBusy) return
                  retryingRef.current =
                    retryKind === "preview" ? "preview" : "history"
                  onRetry()
                }}
              >
                {retryBusy ? "Trying again…" : "Try again"}
              </Button>
            </div>
          ) : loading ? (
            <p role="status" className="py-6 text-muted-foreground">
              Loading version history…
            </p>
          ) : (
            <ol className="divide-y divide-border border-y border-border">
              {versions.map((version) => {
                const restoredFrom = version.restoredFromVersionId
                  ? numberById.get(version.restoredFromVersionId)
                  : null
                const isSelected =
                  selected?.head.versionId === version.head.versionId
                return (
                  <li key={version.head.versionId} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          Version {version.head.versionNumber}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatSavedAt(version.createdAt)}
                          {version.editorDisplayName
                            ? ` · ${version.editorDisplayName}`
                            : " · System import"}
                        </p>
                      </div>
                      <Button
                        ref={(element) => {
                          if (element)
                            previewButtonRefs.current.set(
                              version.head.versionId,
                              element
                            )
                          else
                            previewButtonRefs.current.delete(
                              version.head.versionId
                            )
                        }}
                        type="button"
                        variant="outline"
                        size="lg"
                        className="min-h-11"
                        disabled={isSelected || previewingVersionId !== null}
                        aria-label={`${
                          isSelected
                            ? "Viewing"
                            : previewingVersionId === version.head.versionId
                              ? "Loading"
                              : "Preview"
                        } version ${version.head.versionNumber}`}
                        onClick={() => onPreview(version)}
                      >
                        {isSelected
                          ? "Viewing"
                          : previewingVersionId === version.head.versionId
                            ? "Loading…"
                            : "Preview"}
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                      {version.isCurrentDraft ? (
                        <span className="border border-foreground/30 bg-muted px-2 py-1 font-medium">
                          Current draft
                        </span>
                      ) : null}
                      {version.isPublished ? (
                        <span className="border border-foreground/30 bg-background px-2 py-1 font-medium">
                          Published
                        </span>
                      ) : null}
                      {!version.isCurrentDraft && !version.isPublished ? (
                        <span className="px-2 py-1 text-muted-foreground">
                          Earlier
                        </span>
                      ) : null}
                    </div>
                    {restoredFrom ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Restored from version {restoredFrom}
                      </p>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          )}

          {nextCursor !== null && !loading ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="mt-4 min-h-11 w-full"
              disabled={loadingMore}
              onClick={onLoadMore}
            >
              {loadingMore ? "Loading more…" : "Load earlier versions"}
            </Button>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
