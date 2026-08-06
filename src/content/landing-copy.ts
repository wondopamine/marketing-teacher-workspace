import { MdxDocument, itemBody, itemHeading } from "./mdx-document"

import type { MdxItem, ParsedMdxDocument } from "./mdx-document"

/**
 * Every word on the landing page and on the PM wireframe comes from the
 * `content/` folder. Editing an `.mdx` file there is the whole workflow: no
 * TypeScript, no rebuild step, and a named error when a required piece of
 * copy goes missing.
 *
 * Product structure — which sections exist, their order, and which capability
 * each story act belongs to — stays in `landing-v2.ts`, because changing that
 * changes the contract with the product, not just the wording.
 */

const parsed: Record<string, ParsedMdxDocument | undefined> = import.meta.glob(
  "/content/**/*.mdx",
  {
    eager: true,
    import: "default",
  }
)

function load(path: string): MdxDocument {
  const document = parsed[`/${path}`]
  if (document === undefined) {
    const available = Object.keys(parsed).sort().join(", ")
    throw new Error(
      `Missing content file ${path}. Found: ${available || "no .mdx files at all"}.`
    )
  }
  return new MdxDocument(document)
}

export const landingDocuments = {
  meta: load("content/landing/01-meta.mdx"),
  hero: load("content/landing/02-hero.mdx"),
  story: load("content/landing/03-story.mdx"),
  reveal: load("content/landing/04-reveal.mdx"),
  capabilities: load("content/landing/05-capabilities.mdx"),
  explorer: load("content/landing/06-explorer.mdx"),
  audiences: load("content/landing/07-audiences.mdx"),
  proof: load("content/landing/08-proof.mdx"),
  accessSupport: load("content/landing/09-access-support.mdx"),
  close: load("content/landing/10-close.mdx"),
  footer: load("content/landing/11-footer.mdx"),
  wireframe: load("content/wireframe.mdx"),
  screens: load("content/screens.mdx"),
} as const

/** A headline with its copy — the shape most of the page is made of. */
export type CopyBlock = {
  readonly label: string | null
  readonly heading: string
  readonly body: string
}

/** An `<Item>` block that must carry a heading and copy. */
export function itemCopy(document: MdxDocument, id: string): CopyBlock {
  const item = document.item(id)
  return {
    label: item.label,
    heading: itemHeading(document, item),
    body: itemBody(document, item),
  }
}

/** An `<Item>` block used as a named paragraph, with no heading. */
export function itemProse(document: MdxDocument, id: string): string {
  return itemBody(document, document.item(id))
}

/**
 * An `<Item>` block a reviewer has not answered yet. Returns null until the
 * author adds a `##` heading and a paragraph, at which point the wireframe
 * renders the copy instead of a pending slot.
 */
export function optionalItemCopy(
  document: MdxDocument,
  id: string
): CopyBlock | null {
  const item = document.item(id)
  if (item.heading === null || item.body.length === 0) return null
  return {
    label: item.label,
    heading: item.heading,
    body: item.body.join(" "),
  }
}

/** The short label an `<Item>` carries, required for named slots. */
export function itemLabel(document: MdxDocument, item: MdxItem): string {
  return (
    item.label ??
    document.fail(`<Item id="${item.id}"> needs a label="..." attribute.`)
  )
}
