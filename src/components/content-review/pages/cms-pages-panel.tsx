import { useEffect, useRef, useState } from "react"

import type { CmsPageState } from "@/db/content-repository.server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { isReservedCmsPath } from "@/cms/validation"

export type CmsPageForm = {
  readonly mode: "create" | "duplicate"
  readonly sourcePageId: string | null
  readonly title: string
  readonly path: string
}

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
  }).format(new Date(value))
}

export function CmsPagesPanel({
  open,
  loading,
  error,
  pages,
  currentPageId,
  dirty,
  busyAction,
  displayName,
  onDisplayNameChange,
  onClose,
  onReload,
  onSubmit,
  onArchive,
  onRestore,
  onOpenPage,
}: {
  readonly open: boolean
  readonly loading: boolean
  readonly error: string | null
  readonly pages: ReadonlyArray<CmsPageState>
  readonly currentPageId: string
  readonly dirty: boolean
  readonly busyAction: string | null
  readonly displayName: string
  readonly onDisplayNameChange: (value: string) => void
  readonly onClose: () => void
  readonly onReload: () => void
  readonly onSubmit: (form: CmsPageForm) => void
  readonly onArchive: (page: CmsPageState) => void
  readonly onRestore: (page: CmsPageState) => void
  readonly onOpenPage: (pageId: string) => void
}) {
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const pageTitleRef = useRef<HTMLInputElement | null>(null)
  const formOpenerRef = useRef<HTMLButtonElement | null>(null)
  const lifecycleButtonRefs = useRef(new Map<string, HTMLButtonElement>())
  const lifecycleActionPageIdRef = useRef<string | null>(null)
  const previousBusyActionRef = useRef<string | null>(null)
  const previousFormKeyRef = useRef<string | null>(null)
  const [form, setForm] = useState<CmsPageForm | null>(null)
  const formKey = form
    ? `${form.mode}:${form.sourcePageId ?? "template"}`
    : null

  useEffect(() => {
    if (open) headingRef.current?.focus()
  }, [open])
  useEffect(() => {
    const previousBusy = previousBusyActionRef.current
    previousBusyActionRef.current = busyAction
    const pageId = lifecycleActionPageIdRef.current
    if (previousBusy && busyAction === null && pageId) {
      lifecycleActionPageIdRef.current = null
      window.requestAnimationFrame(() => {
        const action = lifecycleButtonRefs.current.get(pageId)
        if (action?.isConnected) action.focus()
        else headingRef.current?.focus()
      })
    }
  }, [busyAction, pages])
  useEffect(() => {
    const previousKey = previousFormKeyRef.current
    previousFormKeyRef.current = formKey
    if (formKey) {
      pageTitleRef.current?.focus()
      return
    }
    if (previousKey) {
      const opener = formOpenerRef.current
      if (opener?.isConnected) opener.focus()
      else headingRef.current?.focus()
    }
  }, [formKey])

  if (!open) return null

  const normalizedPath = form?.path.trim().toLowerCase() ?? ""
  const pathValid =
    /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(normalizedPath) &&
    !isReservedCmsPath(normalizedPath)
  const formValid =
    Boolean(form?.title.trim()) &&
    pathValid &&
    Boolean(displayName.trim()) &&
    busyAction === null

  const openForm = (next: CmsPageForm, opener: HTMLButtonElement) => {
    formOpenerRef.current = opener
    setForm(next)
  }

  const closeForm = () => {
    setForm(null)
  }

  return (
    <aside
      id="cms-pages-panel"
      aria-labelledby="cms-pages-heading"
      data-review-chrome
      className="order-1 z-40 min-w-0 border-b border-foreground/20 bg-background font-body text-sm lg:order-none lg:col-start-2 lg:row-start-2 lg:min-h-screen lg:border-b-0 lg:border-l"
    >
      <div className="lg:sticky lg:top-[calc(var(--masthead-h)+4.25rem)] lg:max-h-[calc(100vh-var(--masthead-h)-4.25rem)] lg:overflow-y-auto">
        <header className="border-b border-border px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="cms-pages-heading"
                ref={headingRef}
                tabIndex={-1}
                className="font-heading text-xl font-semibold outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                Pages
              </h2>
              <p className="mt-1 max-w-[66ch] text-xs text-muted-foreground">
                Create an unpublished page, open a draft, or manage an existing
                page.
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
          <p className="max-w-[66ch] border-l-2 border-foreground/40 bg-muted px-3 py-2 leading-5">
            Hide keeps a section in the page. Archive removes an unpublished
            page from active use but keeps its versions, feedback, and address.
            Published pages must be unpublished first.
          </p>

          {dirty ? (
            <p className="mt-4 max-w-[66ch] text-muted-foreground">
              Save or discard your current changes before opening or changing
              another page.
            </p>
          ) : null}

          <label className="mt-4 block text-sm font-medium">
            Your name
            <Input
              data-cms-native-undo
              value={displayName}
              onChange={(event) => onDisplayNameChange(event.target.value)}
              placeholder="Shown in page history"
              className="mt-1 min-h-11"
            />
          </label>

          <Button
            type="button"
            size="lg"
            className="mt-4 min-h-11 w-full"
            disabled={dirty || busyAction !== null}
            aria-controls="cms-page-form"
            aria-expanded={form?.mode === "create"}
            onClick={(event) =>
              openForm(
                {
                  mode: "create",
                  sourcePageId: null,
                  title: "",
                  path: "",
                },
                event.currentTarget
              )
            }
          >
            New page
          </Button>

          {form ? (
            <section
              id="cms-page-form"
              aria-labelledby="cms-page-form-heading"
              className="mt-4 border-y border-border py-4"
            >
              <h3 id="cms-page-form-heading" className="font-semibold">
                {form.mode === "create" ? "New page" : "Duplicate page"}
              </h3>
              <p className="mt-1 max-w-[66ch] text-xs text-muted-foreground">
                {form.mode === "create"
                  ? "Start with the approved Teacher Workspace page template."
                  : "Copy the saved content and design intent. Feedback stays with the source page."}
              </p>
              <label className="mt-4 block font-medium">
                Page title
                <Input
                  ref={pageTitleRef}
                  data-cms-native-undo
                  value={form.title}
                  maxLength={160}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  className="mt-1 min-h-11"
                />
              </label>
              <label className="mt-4 block font-medium">
                Page address
                <Input
                  data-cms-native-undo
                  value={form.path}
                  aria-invalid={form.path.length > 0 && !pathValid}
                  onChange={(event) =>
                    setForm({ ...form, path: event.target.value })
                  }
                  placeholder="/family-support"
                  className="mt-1 min-h-11"
                />
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  Use / or one lower-case path. App addresses are reserved.
                </span>
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="lg"
                  className="min-h-11"
                  disabled={!formValid}
                  onClick={() => onSubmit({ ...form, path: normalizedPath })}
                >
                  {busyAction === "page-form"
                    ? form.mode === "create"
                      ? "Creating…"
                      : "Duplicating…"
                    : form.mode === "create"
                      ? "Create page"
                      : "Duplicate page"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="min-h-11"
                  disabled={busyAction !== null}
                  onClick={closeForm}
                >
                  Cancel
                </Button>
              </div>
            </section>
          ) : null}

          {error ? (
            <div className="mt-4" role="alert">
              <p className="max-w-[66ch] leading-5 text-destructive">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="mt-3 min-h-11"
                onClick={onReload}
              >
                Refresh page list
              </Button>
            </div>
          ) : null}

          {loading ? (
            <p role="status" className="py-6 text-muted-foreground">
              Loading pages…
            </p>
          ) : (
            <ol className="mt-4 divide-y divide-border border-y border-border">
              {pages.map((page) => {
                const current = page.pageId === currentPageId
                const actionBusy = busyAction === page.pageId
                return (
                  <li key={page.pageId} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold break-words">
                          {page.title}
                        </p>
                        <p className="mt-1 text-xs break-all text-muted-foreground">
                          {page.path}
                        </p>
                      </div>
                      <span className="border border-foreground/30 px-2 py-1 text-xs font-medium">
                        {page.lifecycle === "archived"
                          ? "Archived"
                          : page.publishedHead
                            ? "Published"
                            : "Draft"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Updated {formatUpdatedAt(page.updatedAt)}
                      {current ? " · Current page" : ""}
                    </p>
                    <div
                      className="mt-3 flex flex-wrap gap-2"
                      role="group"
                      aria-label={`${page.title} page actions`}
                    >
                      {page.lifecycle === "active" ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="min-h-11"
                            disabled={current || dirty || busyAction !== null}
                            onClick={() => onOpenPage(page.pageId)}
                          >
                            {current ? "Open" : "Open page"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="min-h-11"
                            disabled={dirty || busyAction !== null}
                            aria-controls="cms-page-form"
                            aria-expanded={
                              form?.mode === "duplicate" &&
                              form.sourcePageId === page.pageId
                            }
                            onClick={(event) =>
                              openForm(
                                {
                                  mode: "duplicate",
                                  sourcePageId: page.pageId,
                                  title: `${page.title} copy`,
                                  path: "",
                                },
                                event.currentTarget
                              )
                            }
                          >
                            Duplicate
                          </Button>
                          <Button
                            ref={(element) => {
                              if (element)
                                lifecycleButtonRefs.current.set(
                                  page.pageId,
                                  element
                                )
                              else
                                lifecycleButtonRefs.current.delete(page.pageId)
                            }}
                            type="button"
                            variant="destructive"
                            size="lg"
                            className="min-h-11"
                            disabled={
                              dirty ||
                              (busyAction !== null && !actionBusy) ||
                              page.publishedHead !== null
                            }
                            aria-disabled={actionBusy}
                            title={
                              page.publishedHead
                                ? "Unpublish this page before archiving it."
                                : undefined
                            }
                            onClick={() => {
                              if (busyAction !== null) return
                              lifecycleActionPageIdRef.current = page.pageId
                              onArchive(page)
                            }}
                          >
                            {actionBusy ? "Archiving…" : "Archive"}
                          </Button>
                        </>
                      ) : (
                        <Button
                          ref={(element) => {
                            if (element)
                              lifecycleButtonRefs.current.set(
                                page.pageId,
                                element
                              )
                            else
                              lifecycleButtonRefs.current.delete(page.pageId)
                          }}
                          type="button"
                          variant="outline"
                          size="lg"
                          className="min-h-11"
                          disabled={
                            dirty || (busyAction !== null && !actionBusy)
                          }
                          aria-disabled={actionBusy}
                          onClick={() => {
                            if (busyAction !== null) return
                            lifecycleActionPageIdRef.current = page.pageId
                            onRestore(page)
                          }}
                        >
                          {actionBusy ? "Restoring…" : "Restore"}
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
    </aside>
  )
}
