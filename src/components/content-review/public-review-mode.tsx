import { useCallback, useEffect, useRef, useState } from "react"

import { getReviewSpans, submitReviewFeedback } from "@/server/review-feedback"

/**
 * The review layer on the shared, public wireframe link. Anyone holding the URL
 * can retitle a line or leave a note without an account of any kind; pressing
 * Send commits the round to a branch and adds it to a pull request.
 *
 * Two properties are deliberate:
 *
 * - **It mounts only after hydration.** The server-rendered HTML keeps zero
 *   controls, so the reviewed markup, heading order, and landmark structure
 *   stay byte-identical to the artifact the contract was verified against.
 * - **It changes no page markup.** Editable text is found by matching rendered
 *   strings against the source map, exactly as the dev editor does, so nothing
 *   in the approved DOM is rewritten to make editing possible.
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

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; message: string; url: string | null }
  | { kind: "error"; message: string }

const editableSelector = "h1, h2, h3, h4, p, li, dd, dt"

/** Only elements whose entire text is one span, so we never clobber markup. */
function matchElements(spans: ReadonlyArray<Span>): Map<HTMLElement, Span> {
  const byText = new Map<string, Array<Span>>()
  for (const span of spans) {
    const key = span.text.trim()
    if (key.length === 0) continue
    byText.set(key, [...(byText.get(key) ?? []), span])
  }

  const matched = new Map<HTMLElement, Span>()
  const claimed = new Set<string>()

  for (const element of document.querySelectorAll<HTMLElement>(
    editableSelector
  )) {
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

/** The nearest section heading, so a comment says where it came from. */
function locationOf(element: HTMLElement): string {
  const section = element.closest("section, footer, header")
  const heading = section?.querySelector("h1, h2, h3")
  return heading?.textContent.trim().slice(0, 120) ?? "Page"
}

export function PublicReviewMode() {
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const [canSubmit, setCanSubmit] = useState(true)
  const [edits, setEdits] = useState<ReadonlyArray<PendingEdit>>([])
  const [comments, setComments] = useState<
    ReadonlyArray<{ where: string; note: string }>
  >([])
  const [reviewer, setReviewer] = useState("")
  const [note, setNote] = useState("")
  const spansRef = useRef<ReadonlyArray<Span>>([])
  const cleanupRef = useRef<() => void>(() => {})
  const toggleRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => setMounted(true), [])

  const recordEdit = useCallback((span: Span, text: string) => {
    setEdits((current) => [
      ...current.filter((edit) => edit.span.id !== span.id),
      { span, text },
    ])
  }, [])

  const deactivate = useCallback(() => {
    cleanupRef.current()
    cleanupRef.current = () => {}
    setActive(false)
    toggleRef.current?.focus()
  }, [])

  const activate = useCallback(async () => {
    try {
      const result = await getReviewSpans()
      spansRef.current = result.spans
      setCanSubmit(result.canSubmit)
    } catch {
      setStatus({
        kind: "error",
        message: "Could not load the editable copy. Reload and try again.",
      })
      return
    }

    const matched = matchElements(spansRef.current)
    const teardown: Array<() => void> = []

    for (const [element, span] of matched) {
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

      element.addEventListener("blur", commit)
      element.addEventListener("keydown", onKeyDown)
      teardown.push(() => {
        element.removeEventListener("blur", commit)
        element.removeEventListener("keydown", onKeyDown)
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
    setStatus(
      matched.size === 0
        ? { kind: "error", message: "No editable copy found on this page." }
        : { kind: "idle" }
    )
  }, [recordEdit])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const toggle =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
      if (toggle) {
        event.preventDefault()
        if (active) deactivate()
        else void activate()
      }
      if (event.key === "Escape" && active) deactivate()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [activate, active, deactivate])

  useEffect(() => cleanupRef.current, [])

  const addComment = useCallback(() => {
    const trimmed = note.trim()
    if (trimmed.length === 0) return
    const focused = document.activeElement
    const where =
      focused instanceof HTMLElement && focused.dataset.reviewBlock
        ? locationOf(focused)
        : "Page"
    setComments((current) => [...current, { where, note: trimmed }])
    setNote("")
  }, [note])

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
        message: "Something went wrong sending that. Please try again.",
      })
    }
  }, [comments, edits, reviewer])

  if (!mounted) return null

  const pending = edits.length + comments.length

  return (
    <div
      data-review-chrome
      className="fixed right-4 bottom-4 z-50 font-body text-sm motion-safe:transition-all"
    >
      <div className="max-w-[22rem] rounded-lg border border-foreground/25 bg-background shadow-lg">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="font-semibold">Review this page</p>
          <button
            type="button"
            ref={toggleRef}
            onClick={() => (active ? deactivate() : void activate())}
            aria-pressed={active}
            className="min-h-11 min-w-11 rounded-md border border-foreground/30 px-3 py-2 font-medium focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {active ? "Done" : "Edit"}
          </button>
        </div>

        <div className="space-y-3 px-4 py-3">
          <p className="text-muted-foreground">
            {active
              ? "Click any text to change it. Press Enter to keep, Esc to undo."
              : "Change any wording or leave a note. No account needed. ⌘K toggles editing."}
          </p>

          <label className="block">
            <span className="font-medium">Your name</span>
            <input
              value={reviewer}
              onChange={(event) => setReviewer(event.target.value)}
              placeholder="So the designer knows who to thank"
              className="mt-1 min-h-11 w-full rounded-md border border-foreground/30 bg-background px-3 py-2 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </label>

          <label className="block">
            <span className="font-medium">Add a note</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              placeholder="What feels off, and why"
              className="mt-1 w-full rounded-md border border-foreground/30 bg-background px-3 py-2 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={addComment}
            disabled={note.trim().length === 0}
            className="min-h-11 w-full rounded-md border border-foreground/30 px-3 py-2 font-medium disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Add note
          </button>

          <button
            type="button"
            onClick={() => void send()}
            disabled={pending === 0 || status.kind === "sending" || !canSubmit}
            className="min-h-11 w-full rounded-md border-2 border-foreground bg-foreground px-3 py-2 font-semibold text-background disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {status.kind === "sending"
              ? "Sending…"
              : `Send${pending > 0 ? ` (${pending})` : ""}`}
          </button>

          <p aria-live="polite" className="min-h-5 text-muted-foreground">
            {status.kind === "error" ? status.message : null}
            {status.kind === "sent" ? status.message : null}
            {status.kind === "idle" && pending > 0
              ? `${edits.length} edit${edits.length === 1 ? "" : "s"} and ${comments.length} note${comments.length === 1 ? "" : "s"} ready to send.`
              : null}
            {!canSubmit
              ? " Sending is off for this deployment — copy your notes to the designer."
              : null}
          </p>
        </div>
      </div>
    </div>
  )
}
