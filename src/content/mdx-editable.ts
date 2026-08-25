import { createProcessor } from "@mdx-js/mdx"
import remarkFrontmatter from "remark-frontmatter"

import type { Root, RootContent } from "mdast"

/**
 * Locates every editable string in an `.mdx` file and records the exact byte
 * range it occupies in the source.
 *
 * Editing by byte range rather than by search-and-replace means a change to
 * one block never disturbs the comments, blank lines, or identical wording
 * elsewhere in the file.
 *
 * Dev-server only: this is used by the `⌘K` edit mode middleware in
 * `mdx-plugin.ts` and never runs in the browser or in production.
 */

export type EditableSpan = {
  /** Stable handle: `<file>#<start>`. */
  readonly id: string
  readonly file: string
  /** Human label shown on the edit badge, e.g. `promise · heading`. */
  readonly label: string
  /** The current text, exactly as rendered on the page. */
  readonly text: string
  /** Byte range of the text within the source file. */
  readonly start: number
  readonly end: number
  /** Frontmatter values are re-serialised on write; body text is spliced raw. */
  readonly kind: "frontmatter" | "prose"
}

type JsxElement = {
  readonly type: "mdxJsxFlowElement"
  readonly name: string | null
  readonly attributes: ReadonlyArray<{
    readonly type: string
    readonly name?: string
    readonly value?: unknown
  }>
  readonly children: ReadonlyArray<RootContent>
}

const processor = createProcessor({
  remarkPlugins: [[remarkFrontmatter, ["yaml"]]],
})

function isJsxElement(node: RootContent): node is RootContent & JsxElement {
  return node.type === "mdxJsxFlowElement"
}

function itemId(element: JsxElement): string | null {
  const attribute = element.attributes.find(
    (candidate) => candidate.type === "mdxJsxAttribute" && candidate.name === "id"
  )
  return typeof attribute?.value === "string" ? attribute.value : null
}

/** The span covering a node's inline content, excluding any `#` markers. */
function contentSpan(
  node: Extract<RootContent, { children: Array<unknown> }>
): { start: number; end: number } | null {
  const children = node.children as Array<RootContent>
  const first = children[0]?.position?.start.offset
  const last = children[children.length - 1]?.position?.end.offset
  if (first === undefined || last === undefined) return null
  return { start: first, end: last }
}

function frontmatterSpans(
  file: string,
  source: string,
  node: Extract<RootContent, { type: "yaml" }>
): Array<EditableSpan> {
  const start = node.position?.start.offset
  if (start === undefined) return []

  // The yaml node's value excludes the `---` fences; find where it begins.
  const valueStart = source.indexOf(node.value, start)
  if (valueStart === -1) return []

  const spans: Array<EditableSpan> = []
  let cursor = valueStart

  for (const line of node.value.split("\n")) {
    const match = /^([A-Za-z0-9_-]+:)([ \t]*)(.*)$/.exec(line)
    const value = match?.[3]?.trimEnd()
    if (match && value !== undefined && value.length > 0) {
      const key = match[1]
      const offset = cursor + key.length + match[2].length
      const unquoted =
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
          ? value.slice(1, -1)
          : value
      spans.push({
        id: `${file}#${offset}`,
        file,
        label: key.slice(0, -1),
        text: unquoted,
        start: offset,
        end: offset + value.length,
        kind: "frontmatter",
      })
    }
    cursor += line.length + 1
  }

  return spans
}

function collect(
  file: string,
  source: string,
  nodes: ReadonlyArray<RootContent>,
  prefix: string
): Array<EditableSpan> {
  const spans: Array<EditableSpan> = []
  let bulletIndex = 0
  let paragraphIndex = 0

  const push = (
    label: string,
    range: { start: number; end: number } | null
  ): void => {
    if (!range) return
    spans.push({
      id: `${file}#${range.start}`,
      file,
      label: prefix ? `${prefix} · ${label}` : label,
      text: source.slice(range.start, range.end),
      start: range.start,
      end: range.end,
      kind: "prose",
    })
  }

  for (const node of nodes) {
    if (node.type === "yaml") {
      spans.push(...frontmatterSpans(file, source, node))
      continue
    }
    if (node.type === "heading") {
      push("heading", contentSpan(node))
      continue
    }
    if (node.type === "paragraph") {
      paragraphIndex += 1
      push(paragraphIndex === 1 ? "body" : `body ${paragraphIndex}`, contentSpan(node))
      continue
    }
    if (node.type === "list") {
      for (const listItem of node.children) {
        bulletIndex += 1
        if (listItem.children.length === 0) continue
        const [firstChild] = listItem.children
        if (firstChild.type === "paragraph") {
          push(`bullet ${bulletIndex}`, contentSpan(firstChild))
        }
      }
      continue
    }
    if (isJsxElement(node) && node.name === "Item") {
      const id = itemId(node)
      if (id) spans.push(...collect(file, source, node.children, id))
    }
  }

  return spans
}

export function collectEditableSpans(
  file: string,
  source: string
): ReadonlyArray<EditableSpan> {
  let tree: Root
  try {
    tree = processor.parse(source)
  } catch {
    return []
  }
  return collect(file, source, tree.children, "")
}

/** Quotes a frontmatter value only when YAML would otherwise misread it. */
export function serialiseFrontmatterValue(text: string): string {
  const needsQuotes =
    text !== text.trim() ||
    text.length === 0 ||
    /^[-?:,[\]{}#&*!|>'"%@`]/.test(text) ||
    /:\s/.test(text) ||
    /\s#/.test(text)
  return needsQuotes ? JSON.stringify(text) : text
}

/**
 * Splices one edit into a source file. `was` is the text the browser believed
 * it was editing; a mismatch means the file changed underneath and the edit is
 * refused rather than silently overwriting.
 */
export function applyEdit(
  source: string,
  edit: {
    readonly start: number
    readonly end: number
    readonly was: string
    readonly text: string
    readonly kind: "frontmatter" | "prose"
  }
): { ok: true; source: string } | { ok: false; reason: string } {
  if (edit.start < 0 || edit.end > source.length || edit.start > edit.end) {
    return { ok: false, reason: "The edit range is outside the file." }
  }

  const current = source.slice(edit.start, edit.end)
  const expected =
    edit.kind === "frontmatter" ? serialiseFrontmatterValue(edit.was) : edit.was
  if (current !== expected && current !== edit.was) {
    return {
      ok: false,
      reason: "This file changed since the page loaded. Reload and try again.",
    }
  }

  const replacement =
    edit.kind === "frontmatter"
      ? serialiseFrontmatterValue(edit.text)
      : edit.text
  if (replacement.includes("\n")) {
    return { ok: false, reason: "Copy cannot contain a line break." }
  }

  return {
    ok: true,
    source: source.slice(0, edit.start) + replacement + source.slice(edit.end),
  }
}
