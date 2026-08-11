import { collectEditableSpans } from "./mdx-editable"

import type { EditableSpan } from "./mdx-editable"

/**
 * The unmodified `.mdx` sources, bundled so a deployed server can locate every
 * editable string without a filesystem. `mdx-plugin.ts` leaves `?raw` imports
 * alone precisely so this stays text rather than compiled data.
 *
 * The spans here describe the build the reviewer is looking at. A submitted
 * edit is still checked against the file's current contents on GitHub before
 * it is written, so a stale build is refused rather than silently overwriting.
 */
const rawSources: Record<string, string> = import.meta.glob(
  "/content/**/*.mdx",
  { query: "?raw", import: "default", eager: true }
)

/** Repo-relative path (`content/landing/02-hero.mdx`) to its source text. */
export const mdxSources: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    Object.entries(rawSources).map(([path, source]) => [
      path.replace(/^\//, ""),
      source,
    ])
  )
)

/** Only teacher-facing landing copy belongs in the public editing surface. */
export function editableSpans(): ReadonlyArray<EditableSpan> {
  return Object.entries(mdxSources).flatMap(([file, source]) =>
    file.startsWith("content/landing/")
      ? collectEditableSpans(file, source)
      : []
  )
}
