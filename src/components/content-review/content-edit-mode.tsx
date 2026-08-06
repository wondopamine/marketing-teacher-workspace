import { useCallback, useEffect, useRef, useState } from "react"

/**
 * ⌘K edit mode — dev server only.
 *
 * The wireframe route is contractually static and share-safe (see
 * docs/decisions/2026-08-05-pm-facing-content-review-wireframe.md), so this
 * never renders outside `pnpm dev`: the built artifact and every preview
 * deploy keep zero route-local controls.
 *
 * It deliberately changes none of the page's markup. It finds editable text by
 * matching what is rendered against the source map served by the dev
 * middleware, so the approved DOM stays exactly as reviewed.
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

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; label: string }
  | { kind: "error"; message: string }

const editableSelector = "h1, h2, h3, h4, p, li, dd, dt, span"

function isDevServer(): boolean {
  return import.meta.env.MODE === "development"
}

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
    if (element.closest("[data-edit-chrome]")) continue
    const text = element.textContent.trim()
    if (text.length === 0) continue

    const candidates = byText.get(text)
    if (!candidates || candidates.length !== 1) continue

    // Prefer the innermost element holding exactly this text.
    if (element.querySelector(editableSelector)) continue

    const span = candidates[0]
    if (claimed.has(span.id)) continue
    claimed.add(span.id)
    matched.set(element, span)
  }

  return matched
}

export function ContentEditMode() {
  const [active, setActive] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const spansRef = useRef<ReadonlyArray<Span>>([])
  const cleanupRef = useRef<() => void>(() => {})

  const loadSpans = useCallback(async () => {
    const response = await fetch("/__content/map")
    const body = (await response.json()) as { spans?: Array<Span> }
    spansRef.current = body.spans ?? []
  }, [])

  const save = useCallback(async (span: Span, text: string) => {
    setStatus({ kind: "saving" })
    const response = await fetch("/__content/edit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        file: span.file,
        start: span.start,
        end: span.end,
        was: span.text,
        text,
        kind: span.kind,
      }),
    })

    if (!response.ok) {
      const body = (await response.json()) as { error?: string }
      setStatus({
        kind: "error",
        message: body.error ?? "That edit could not be saved.",
      })
      return
    }
    setStatus({ kind: "saved", label: span.label })
  }, [])

  const deactivate = useCallback(() => {
    cleanupRef.current()
    cleanupRef.current = () => {}
    setActive(false)
    setStatus({ kind: "idle" })
  }, [])

  const activate = useCallback(async () => {
    try {
      await loadSpans()
    } catch {
      setStatus({ kind: "error", message: "Could not reach the dev server." })
      return
    }

    const matched = matchElements(spansRef.current)
    const teardown: Array<() => void> = []

    for (const [element, span] of matched) {
      const original = element.textContent
      element.contentEditable = "plaintext-only"
      element.spellcheck = true
      element.dataset.editBlock = span.label
      element.style.outline = "1px dashed currentColor"
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
        void save(span, next)
      }
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          event.preventDefault()
          element.blur()
        }
        if (event.key === "Escape") {
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
        element.removeAttribute("data-edit-block")
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
  }, [loadSpans, save])

  useEffect(() => {
    if (!isDevServer()) return

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

  if (!isDevServer()) return null

  return (
    <div
      data-edit-chrome
      className="fixed right-4 bottom-4 z-50 font-body text-xs"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="rounded-full border border-foreground/20 bg-background px-3 py-2 shadow-sm"
        style={{ pointerEvents: "auto" }}
      >
        {active ? (
          <span>
            <strong>Edit mode</strong> · click any text · ⌘K or Esc to exit
            {status.kind === "saving" ? " · saving…" : null}
            {status.kind === "saved" ? ` · saved ${status.label}` : null}
          </span>
        ) : (
          <span>Press ⌘K to edit the copy</span>
        )}
        {status.kind === "error" ? (
          <span className="ml-2 font-medium">{status.message}</span>
        ) : null}
      </div>
    </div>
  )
}
