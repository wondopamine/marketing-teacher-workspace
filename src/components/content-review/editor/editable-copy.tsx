import { createElement, useLayoutEffect, useRef } from "react"

import { cn } from "@/lib/utils"

type EditableTag = "dd" | "dt" | "h1" | "h2" | "h3" | "p" | "span"

function insertPlainText(element: HTMLElement, text: string): void {
  const selection = element.ownerDocument.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)
  if (!element.contains(range.commonAncestorContainer)) return
  range.deleteContents()
  const textNode = element.ownerDocument.createTextNode(text)
  range.insertNode(textNode)
  range.setStartAfter(textNode)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
}

export function EditableCopy({
  as,
  value,
  label,
  className,
  onChange,
  id,
  "data-wireframe-action": wireframeAction,
}: {
  readonly as: EditableTag
  readonly value: string
  readonly label: string
  readonly className?: string
  readonly onChange?: (value: string) => void
  readonly id?: string
  readonly "data-wireframe-action"?: boolean
}) {
  const editable = Boolean(onChange)
  const ref = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    const element = ref.current
    if (editable && element && element.textContent !== value) {
      element.textContent = value
    }
  }, [editable, value])
  return createElement(
    as,
    {
      ref,
      className: cn(
        className,
        editable &&
          "cursor-text rounded-sm outline-1 outline-offset-4 outline-foreground/30 transition-[background-color,outline-color] hover:bg-primary/5 hover:outline-dashed focus:bg-primary/5 focus:outline-2 focus:outline-primary"
      ),
      contentEditable: editable || undefined,
      suppressContentEditableWarning: editable || undefined,
      spellCheck: editable || undefined,
      role: editable ? "textbox" : undefined,
      "aria-label": editable ? label : undefined,
      "aria-multiline": editable ? "false" : undefined,
      "data-cms-editable": editable ? "" : undefined,
      "data-wireframe-action": wireframeAction ? "" : undefined,
      id,
      onInput: editable
        ? (event: React.FormEvent<HTMLElement>) => {
            const next = event.currentTarget.textContent
            if (next.trim().length > 0) onChange?.(next)
          }
        : undefined,
      onBlur: editable
        ? (event: React.FocusEvent<HTMLElement>) => {
            const next = event.currentTarget.textContent
            if (next.trim().length === 0)
              event.currentTarget.textContent = value
            else if (next !== value) onChange?.(next.trim())
          }
        : undefined,
      onPaste: editable
        ? (event: React.ClipboardEvent<HTMLElement>) => {
            event.preventDefault()
            insertPlainText(
              event.currentTarget,
              event.clipboardData.getData("text/plain")
            )
            const next = event.currentTarget.textContent
            if (next.trim().length > 0) onChange?.(next)
          }
        : undefined,
      onKeyDown: editable
        ? (event: React.KeyboardEvent<HTMLElement>) => {
            if (event.key === "Enter") {
              event.preventDefault()
              event.currentTarget.blur()
            }
          }
        : undefined,
    },
    editable ? undefined : value
  )
}
