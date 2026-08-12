import { useCallback, useEffect, useRef, useState } from "react"

import { contentReviewChrome } from "./content-review-chrome"
import {
  ReviewAnnotationDetails,
  useReviewAnnotations,
} from "./review-annotations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getReviewSpans, submitReviewFeedback } from "@/server/review-feedback"

/**
 * The review layer on the shared, public wireframe link. Anyone holding the URL
 * can retitle a line or leave a note without an account of any kind; pressing
 * Send commits the round to a branch and adds it to a pull request.
 *
 * Review controls carry `data-review-chrome`, which keeps them out of the copy
 * matcher and makes the teacher/reviewer boundary explicit. Editable text is
 * found by matching rendered strings against the source map, exactly as the
 * dev editor does, so the reviewed content needs no editor-specific wrappers.
 *
 * Accessibility is part of the feature, not a follow-up: every control is a
 * real button reachable by keyboard, edits are entered and committed from the
 * keyboard alone, status is announced politely, and the panel respects
 * `prefers-reduced-motion`.
 */

type Span = {
  id: string
  file: string
  label: string
  text: string
  start: number
  end: number
  kind: "frontmatter" | "prose"
}

type PendingEdit = {
  readonly span: Span
  readonly text: string
}

type PendingComment = {
  /** The span the note is pinned to, or null for a whole-page note. */
  readonly spanId: string | null
  /** A reviewer-rationale target, or null for copy and whole-page notes. */
  readonly anchorId: string | null
  readonly where: string
  readonly note: string
}

/**
 * Pins are drawn with a stylesheet and a data attribute rather than by
 * appending child nodes, so the text of a commented block stays exactly one
 * string — which is what the edit-matching relies on.
 */
const pinStyles = `
[data-review-comments]{position:relative}
[data-review-comments]::after{
  content:attr(data-review-comments);
  position:absolute;top:-.6em;right:-1.6em;
  min-width:1.35em;height:1.35em;
  display:inline-flex;align-items:center;justify-content:center;
  border-radius:999px;background:currentColor;color:Canvas;
  font-size:.7rem;font-weight:700;font-family:ui-sans-serif,system-ui,sans-serif;
  line-height:1;padding:0 .3em;
}
`

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; message: string; url: string | null }
  | { kind: "copied" }
  | { kind: "error"; message: string }

const editableSelector = "h1, h2, h3, h4, p, li, dd, dt"

/** Only elements whose entire text is one span, so we never clobber markup. */
function matchElements(
  spans: ReadonlyArray<Span>,
  pendingText = new Map<string, string>(),
  knownElements = new Map<string, HTMLElement>()
): Map<HTMLElement, Span> {
  const byText = new Map<string, Array<Span>>()
  for (const span of spans) {
    const key = (pendingText.get(span.id) ?? span.text).trim()
    if (key.length === 0) continue
    byText.set(key, [...(byText.get(key) ?? []), span])
  }

  const matched = new Map<HTMLElement, Span>()
  const claimed = new Set<string>()
  const spansById = new Map(spans.map((span) => [span.id, span]))

  for (const [id, element] of knownElements) {
    const span = spansById.get(id)
    if (
      !span ||
      !element.isConnected ||
      element.closest("[data-review-chrome]")
    ) {
      continue
    }
    claimed.add(id)
    matched.set(element, span)
  }

  for (const element of document.querySelectorAll<HTMLElement>(
    editableSelector
  )) {
    if (matched.has(element)) continue
    if (element.closest("[data-review-chrome]")) continue
    const text = element.textContent.trim()
    if (text.length === 0) continue

    const candidates = byText.get(text)
    if (!candidates || candidates.length !== 1) continue
    if (element.querySelector(editableSelector)) continue

    const span = candidates[0]
    if (claimed.has(span.id)) continue
    claimed.add(span.id)
    matched.set(element, span)
  }

  return matched
}

/**
 * A plain-text round-up of the reviewer's work, used when sending isn't wired
 * up on a deployment. Without this the "copy your notes" advice would be a dead
 * end: there would be nothing to copy.
 */
function summarise(
  reviewer: string,
  edits: ReadonlyArray<PendingEdit>,
  comments: ReadonlyArray<PendingComment>
): string {
  const lines = [
    `Landing page review${reviewer.trim() ? ` from ${reviewer.trim()}` : ""}`,
    "",
  ]
  if (comments.length > 0) {
    lines.push("Comments:")
    for (const comment of comments) {
      lines.push(`- ${comment.where}: ${comment.note}`)
    }
    lines.push("")
  }
  if (edits.length > 0) {
    lines.push("Copy changes:")
    for (const edit of edits) {
      lines.push(`- ${edit.span.label} (${edit.span.file})`)
      lines.push(`  was: ${edit.span.text}`)
      lines.push(`  now: ${edit.text}`)
    }
  }
  return lines.join("\n")
}

/** The nearest section heading, so a comment says where it came from. */
function locationOf(element: HTMLElement): string {
  const section = element.closest("section, footer, header")
  const heading = section?.querySelector("h1, h2, h3")
  return heading?.textContent.trim().slice(0, 120) ?? "Page"
}

export type ExternalReviewEditor = {
  readonly active: boolean
  readonly adminActive?: boolean
  readonly adminCommandOpen?: boolean
  readonly busy: boolean
  readonly controls: React.ReactNode
  readonly statusMessage: string
  readonly onAdminCommand?: () => void
  readonly onToggle: () => void
}

export type ExternalReviewPanel = {
  readonly content: React.ReactNode
}

export function PublicReviewMode({
  externalEditor,
  externalReviewPanel,
}: {
  externalEditor?: ExternalReviewEditor
  externalReviewPanel?: ExternalReviewPanel
} = {}) {
  const {
    annotations,
    open,
    panelOpen,
    panelOpenerId,
    selectionVersion,
    selectedId,
    setPanelOpen,
    setPinsVisible,
  } = useReviewAnnotations()
  const selectedAnnotation = selectedId ? annotations.get(selectedId) : null
  const usesExternalReviewPanel = externalReviewPanel !== undefined
  const [active, setActive] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const [canSubmit, setCanSubmit] = useState<boolean | null>(null)
  const [edits, setEdits] = useState<ReadonlyArray<PendingEdit>>([])
  const [comments, setComments] = useState<ReadonlyArray<PendingComment>>([])
  const [target, setTarget] = useState<{
    spanId: string | null
    anchorId: string | null
    label: string
  } | null>(() =>
    selectedAnnotation
      ? {
          spanId: null,
          anchorId: selectedAnnotation.id,
          label: `Section rationale · ${selectedAnnotation.title}`,
        }
      : null
  )
  const [reviewer, setReviewer] = useState("")
  const [note, setNote] = useState("")
  const [fallbackText, setFallbackText] = useState<string | null>(null)
  const spansRef = useRef<ReadonlyArray<Span>>([])
  const elementsRef = useRef(new Map<string, HTMLElement>())
  const cleanupRef = useRef<() => void>(() => {})
  const rationaleRef = useRef<HTMLButtonElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const noteRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (usesExternalReviewPanel) {
      setCanSubmit(false)
      return
    }
    let cancelled = false
    void getReviewSpans()
      .then((result) => {
        if (cancelled) return
        spansRef.current = result.spans
        setCanSubmit(result.canSubmit)
      })
      .catch(() => {
        if (!cancelled) setCanSubmit(false)
      })
    return () => {
      cancelled = true
    }
  }, [usesExternalReviewPanel])

  useEffect(() => {
    if (selectionVersion === 0 || !selectedAnnotation) return
    setTarget({
      spanId: null,
      anchorId: selectedAnnotation.id,
      label: `Section rationale · ${selectedAnnotation.title}`,
    })
  }, [selectedAnnotation, selectionVersion])

  const recordEdit = useCallback((span: Span, text: string) => {
    setEdits((current) => {
      const remaining = current.filter((edit) => edit.span.id !== span.id)
      return text === span.text ? remaining : [...remaining, { span, text }]
    })
  }, [])

  const deactivate = useCallback(
    (restoreFocus = true) => {
      const focused = document.activeElement
      if (
        focused instanceof HTMLElement &&
        focused.hasAttribute("data-review-block")
      ) {
        focused.blur()
      }

      cleanupRef.current()
      cleanupRef.current = () => {}
      setActive(false)
      setPinsVisible(true)
      if (restoreFocus) toggleRef.current?.focus()
    },
    [setPinsVisible]
  )

  const activate = useCallback(async () => {
    setEditLoading(true)
    setPanelOpen(false)
    setPinsVisible(false)

    try {
      const result = await getReviewSpans()
      spansRef.current = result.spans
      setCanSubmit(result.canSubmit)
    } catch {
      setEditLoading(false)
      setPinsVisible(true)
      setStatus({
        kind: "error",
        message: "Could not load the editable copy. Reload and try again.",
      })
      return
    }

    const pendingText = new Map(
      edits.map((edit) => [edit.span.id, edit.text] as const)
    )
    const matched = matchElements(
      spansRef.current,
      pendingText,
      elementsRef.current
    )
    if (matched.size === 0) {
      setEditLoading(false)
      setPinsVisible(true)
      setStatus({
        kind: "error",
        message: "No editable copy found on this page.",
      })
      return
    }

    const teardown: Array<() => void> = []

    const style = document.createElement("style")
    style.dataset.reviewChromeStyle = ""
    style.textContent = pinStyles
    document.head.append(style)
    teardown.push(() => style.remove())

    elementsRef.current = new Map()

    for (const [element, span] of matched) {
      elementsRef.current.set(span.id, element)
      const original = element.textContent
      element.contentEditable = "plaintext-only"
      element.spellcheck = true
      element.tabIndex = 0
      element.setAttribute("role", "textbox")
      element.setAttribute("aria-label", `Edit ${span.label}`)
      element.dataset.reviewBlock = span.label
      element.style.outline = "2px dashed currentColor"
      element.style.outlineOffset = "4px"
      element.style.borderRadius = "2px"

      const commit = () => {
        const next = element.textContent.trim()
        if (next === original.trim()) return
        if (next.length === 0) {
          element.textContent = original
          setStatus({ kind: "error", message: "Copy cannot be empty." })
          return
        }
        recordEdit(span, next)
        setStatus({ kind: "idle" })
      }
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          event.preventDefault()
          element.blur()
        }
        if (event.key === "Escape") {
          event.stopPropagation()
          element.textContent = original
          element.blur()
        }
      }

      const aim = () => {
        setTarget({
          spanId: span.id,
          anchorId: null,
          label: `${span.label} — ${locationOf(element)}`,
        })
      }

      element.addEventListener("focus", aim)
      element.addEventListener("blur", commit)
      element.addEventListener("keydown", onKeyDown)
      teardown.push(() => {
        element.removeEventListener("focus", aim)
        element.removeEventListener("blur", commit)
        element.removeEventListener("keydown", onKeyDown)
        element.removeAttribute("data-review-comments")
        element.removeAttribute("data-review-focus")
        element.removeAttribute("contenteditable")
        element.removeAttribute("role")
        element.removeAttribute("aria-label")
        element.removeAttribute("tabindex")
        element.removeAttribute("data-review-block")
        element.style.outline = ""
        element.style.outlineOffset = ""
        element.style.borderRadius = ""
      })
    }

    cleanupRef.current = () => teardown.forEach((fn) => fn())
    setActive(true)
    setEditLoading(false)
    setStatus({ kind: "idle" })
  }, [edits, recordEdit, setPanelOpen, setPinsVisible])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const toggle =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
      if (toggle) {
        event.preventDefault()
        if (externalEditor?.onAdminCommand) externalEditor.onAdminCommand()
        else if (externalEditor) externalEditor.onToggle()
        else if (active) deactivate()
        else if (!editLoading) void activate()
      }
      if (event.key === "Escape" && externalEditor?.adminCommandOpen) return
      if (event.key === "Escape" && externalEditor?.active) {
        externalEditor.onToggle()
      } else if (event.key === "Escape" && active) deactivate()
      else if (event.key === "Escape" && panelOpen) {
        const opener = panelOpenerId
          ? document.querySelector<HTMLElement>(
              `[data-review-annotation-trigger="${panelOpenerId}"]`
            )
          : rationaleRef.current
        setPanelOpen(false)
        window.requestAnimationFrame(() => opener?.focus())
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [
    activate,
    active,
    deactivate,
    editLoading,
    externalEditor,
    panelOpen,
    panelOpenerId,
    setPanelOpen,
  ])

  useEffect(() => () => cleanupRef.current(), [])

  const addComment = useCallback(() => {
    const trimmed = note.trim()
    if (trimmed.length === 0) return

    const pinned: PendingComment = {
      spanId: target?.spanId ?? null,
      anchorId: target?.anchorId ?? null,
      where: target?.label ?? "Whole page",
      note: trimmed,
    }
    setComments((current) => {
      const next = [...current, pinned]
      // Redraw the pin count on whichever block this note belongs to.
      if (pinned.spanId) {
        const element = elementsRef.current.get(pinned.spanId)
        const count = next.filter((c) => c.spanId === pinned.spanId).length
        if (element) element.dataset.reviewComments = String(count)
      }
      return next
    })
    setNote("")
  }, [note, target])

  /** Scroll to a pinned note's block and flash it, so notes are findable. */
  const revealComment = useCallback(
    (comment: PendingComment) => {
      if (comment.anchorId) open(comment.anchorId)

      window.requestAnimationFrame(() => {
        const element = comment.spanId
          ? elementsRef.current.get(comment.spanId)
          : comment.anchorId
            ? document.querySelector<HTMLElement>(
                `[data-review-annotation-trigger="${comment.anchorId}"]`
              )
            : null
        if (!element) return
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
        element.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "center",
        })
        element.dataset.reviewFocus = ""
        window.setTimeout(
          () => element.removeAttribute("data-review-focus"),
          1600
        )
      })
    },
    [open]
  )

  const removeComment = useCallback((index: number) => {
    setComments((current) => {
      const removed = current[index]
      const next = current.filter((_, i) => i !== index)
      if (removed.spanId) {
        const element = elementsRef.current.get(removed.spanId)
        const count = next.filter((c) => c.spanId === removed.spanId).length
        if (element) {
          if (count === 0) element.removeAttribute("data-review-comments")
          else element.dataset.reviewComments = String(count)
        }
      }
      return next
    })
  }, [])

  const copyForDesigner = useCallback(async () => {
    const text = summarise(reviewer, edits, comments)
    try {
      await navigator.clipboard.writeText(text)
      setStatus({ kind: "copied" })
    } catch {
      // Clipboard access can be refused; a textarea the reviewer can select
      // from is better than losing their work.
      setStatus({
        kind: "error",
        message: "Couldn't copy automatically — select the text below instead.",
      })
      setFallbackText(text)
    }
  }, [comments, edits, reviewer])

  const send = useCallback(async () => {
    setStatus({ kind: "sending" })
    try {
      const result = await submitReviewFeedback({
        data: {
          reviewer,
          comments,
          edits: edits.map((edit) => ({
            file: edit.span.file,
            start: edit.span.start,
            end: edit.span.end,
            was: edit.span.text,
            text: edit.text,
            kind: edit.span.kind,
          })),
        },
      })

      if (!result.ok) {
        setStatus({ kind: "error", message: result.reason })
        return
      }
      setEdits([])
      setComments([])
      setStatus({
        kind: "sent",
        message: "Sent to the designer. Thank you.",
        url: result.url,
      })
    } catch {
      setStatus({
        kind: "error",
        message: "Something went wrong sending that. Try again.",
      })
    }
  }, [comments, edits, reviewer])

  const pending = edits.length + comments.length
  const readySummary = `${edits.length} edit${edits.length === 1 ? "" : "s"} and ${comments.length} note${comments.length === 1 ? "" : "s"} ready.`
  const statusMessage = editLoading
    ? "Preparing the teacher copy for editing…"
    : active
      ? "Editing is on. Select teacher-facing text, then press Enter to keep the change or Escape to undo it."
      : canSubmit === null
        ? "Checking how this review can be sent…"
        : status.kind === "sending"
          ? "Sending your review…"
          : status.kind === "error"
            ? status.message
            : status.kind === "sent"
              ? status.message
              : status.kind === "copied"
                ? "Copied. Paste it to the designer — thank you."
                : pending > 0
                  ? readySummary
                  : "Review a section or edit the teacher copy."
  const visibleStatusMessage = externalEditor?.statusMessage ?? statusMessage

  const toggleRationale = () => {
    if (active) {
      deactivate(false)
      setPanelOpen(true)
      return
    }
    setPinsVisible(true)
    setPanelOpen(!panelOpen)
  }

  return (
    <>
      <header
        data-review-chrome
        className="sticky top-0 z-50 border-b border-foreground/20 bg-background pt-[var(--masthead-h)] font-body text-sm lg:col-span-full lg:row-start-1"
      >
        <div className="mx-auto flex min-h-16 max-w-[90rem] flex-col justify-center gap-3 px-3 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="font-semibold">
              {externalEditor?.adminActive ? "Admin mode" : "Review tools"}
            </p>
            <p
              aria-live="polite"
              className="mt-0.5 max-w-[62ch] text-xs text-muted-foreground"
            >
              {visibleStatusMessage}
            </p>
          </div>
          <div
            className="flex w-full flex-wrap gap-2 [&>*:last-child]:ml-auto"
            role="group"
            aria-label={
              externalEditor?.adminActive ? "Admin tools" : "Review tools"
            }
          >
            <Button
              type="button"
              variant="outline"
              size="lg"
              ref={rationaleRef}
              aria-controls="review-rationale-panel"
              aria-expanded={panelOpen}
              disabled={
                editLoading || externalEditor?.active || externalEditor?.busy
              }
              onClick={toggleRationale}
              className="min-h-11 px-4"
            >
              {externalReviewPanel
                ? panelOpen
                  ? "Hide section context"
                  : "Show section context"
                : panelOpen
                  ? "Hide rationale"
                  : "Show rationale"}
            </Button>
            {externalEditor?.controls ?? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                ref={toggleRef}
                aria-pressed={active}
                disabled={editLoading}
                onClick={() => (active ? deactivate() : void activate())}
                className="min-h-11 px-4 aria-pressed:bg-foreground aria-pressed:text-background"
              >
                {editLoading
                  ? "Preparing…"
                  : active
                    ? "Finish editing"
                    : "Edit content"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <aside
        id="review-rationale-panel"
        aria-label={
          externalReviewPanel
            ? "Section context and feedback"
            : "Rationale and section comments"
        }
        data-review-chrome
        hidden={!panelOpen}
        className="order-1 z-40 min-w-0 border-b border-foreground/20 bg-background font-body text-sm lg:order-none lg:col-start-2 lg:row-start-2 lg:min-h-screen lg:border-b-0 lg:border-l"
      >
        <div className="lg:sticky lg:top-[calc(var(--masthead-h)+4.25rem)] lg:max-h-[calc(100vh-var(--masthead-h)-4.25rem)] lg:overflow-y-auto">
          {externalReviewPanel ? (
            externalReviewPanel.content
          ) : (
            <>
              <header className="border-b border-border px-4 py-4">
                <div>
                  <p className="font-semibold">
                    Rationale and section comments
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use a numbered pin to review another section.
                  </p>
                </div>
                <p className="mt-2 text-muted-foreground">
                  {contentReviewChrome.badge}. {contentReviewChrome.warning}
                </p>
              </header>

              <div className="space-y-4 px-4 py-4">
                {selectedAnnotation ? (
                  <section
                    aria-label={`Review note: ${selectedAnnotation.title}`}
                    className="border-b border-border pb-4"
                  >
                    <ReviewAnnotationDetails annotation={selectedAnnotation} />
                  </section>
                ) : null}

                <label className="block">
                  <span className="font-medium">Your name</span>
                  <Input
                    value={reviewer}
                    onChange={(event) => setReviewer(event.target.value)}
                    placeholder="So the designer knows who to thank"
                    className="mt-1 min-h-11 rounded-md border-foreground/30 bg-background px-3 py-2"
                  />
                </label>

                <div className="border-y border-foreground/20 bg-muted px-3 py-3">
                  <p className="text-xs font-medium tracking-[0.06em] text-muted-foreground">
                    Commenting on
                  </p>
                  <p className="mt-1 font-medium break-words">
                    {target ? target.label : "Whole page"}
                  </p>
                  {target ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setTarget(null)}
                      className="mt-2 min-h-11 border-foreground/30 px-3 text-xs"
                    >
                      Comment on the whole page instead
                    </Button>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Select a numbered pin to target a section.
                    </p>
                  )}
                </div>

                <label className="block">
                  <span className="font-medium">Add a note</span>
                  <textarea
                    ref={noteRef}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder="What should the designer know?"
                    className="mt-1 w-full rounded-md border border-foreground/30 bg-background px-3 py-2 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none"
                  />
                </label>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={addComment}
                  disabled={note.trim().length === 0}
                  className="min-h-11 w-full border-foreground/30 px-3"
                >
                  Add note
                </Button>

                {comments.length > 0 ? (
                  <div>
                    <p className="font-medium">
                      Your notes ({comments.length})
                    </p>
                    <ul className="mt-2 space-y-2">
                      {comments.map((comment, index) => (
                        <li
                          key={`${comment.spanId ?? comment.anchorId ?? "page"}-${index}`}
                          className="border-y border-foreground/20 px-3 py-2"
                        >
                          <p className="text-xs break-words text-muted-foreground">
                            {comment.where}
                          </p>
                          <p className="mt-1 break-words">{comment.note}</p>
                          <div className="mt-2 flex gap-2">
                            {comment.spanId || comment.anchorId ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={() => revealComment(comment)}
                                className="min-h-11 border-foreground/30 px-3 text-xs"
                              >
                                Show me
                              </Button>
                            ) : null}
                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              onClick={() => removeComment(index)}
                              className="min-h-11 border-foreground/30 px-3 text-xs"
                            >
                              Remove
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <Button
                  type="button"
                  size="lg"
                  onClick={() => void (canSubmit ? send() : copyForDesigner())}
                  disabled={
                    canSubmit === null ||
                    pending === 0 ||
                    status.kind === "sending"
                  }
                  className="min-h-11 w-full border-2 border-foreground bg-foreground px-3 font-semibold text-background"
                >
                  {status.kind === "sending"
                    ? "Sending…"
                    : canSubmit === null
                      ? "Checking feedback…"
                      : canSubmit
                        ? `Send${pending > 0 ? ` (${pending})` : ""}`
                        : `Copy for the designer${pending > 0 ? ` (${pending})` : ""}`}
                </Button>

                <p className="min-h-5 text-muted-foreground">{statusMessage}</p>

                {fallbackText ? (
                  <label className="block">
                    <span className="font-medium">
                      Your feedback — select and copy
                    </span>
                    <textarea
                      readOnly
                      rows={6}
                      value={fallbackText}
                      className="mt-1 w-full rounded-md border border-foreground/30 bg-background px-3 py-2 text-xs focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none"
                    />
                  </label>
                ) : null}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
