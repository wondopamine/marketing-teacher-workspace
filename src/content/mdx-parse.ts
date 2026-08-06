import { createProcessor } from "@mdx-js/mdx"
import { toString as mdastToString } from "mdast-util-to-string"
import remarkFrontmatter from "remark-frontmatter"
import { parse as parseYaml } from "yaml"

import { ContentError } from "./mdx-document"

import type { MdxItem, ParsedMdxDocument } from "./mdx-document"
import type { Root, RootContent } from "mdast"

/**
 * Turns one `.mdx` file into plain data. This runs inside the Vite plugin at
 * build time only, so no markdown parser ships to the browser or the server.
 * Errors name the file and the block, so the person editing the copy can fix
 * their own mistake.
 */

type JsxAttribute = {
  readonly type: string
  readonly name?: string
  readonly value?: unknown
}

type JsxElement = {
  readonly type: "mdxJsxFlowElement"
  readonly name: string | null
  readonly attributes: ReadonlyArray<JsxAttribute>
  readonly children: ReadonlyArray<RootContent>
}

const processor = createProcessor({
  remarkPlugins: [[remarkFrontmatter, ["yaml"]]],
})

function isJsxElement(node: RootContent): node is RootContent & JsxElement {
  return node.type === "mdxJsxFlowElement"
}

function stringAttribute(
  file: string,
  element: JsxElement,
  name: string
): string | null {
  const attribute = element.attributes.find(
    (candidate) =>
      candidate.type === "mdxJsxAttribute" && candidate.name === name
  )
  if (!attribute) return null
  if (typeof attribute.value !== "string") {
    throw new ContentError(
      file,
      `<${element.name ?? "Item"} ${name}={...}> must be plain text in quotes.`
    )
  }
  return attribute.value.trim()
}

type Blocks = Omit<ParsedMdxDocument, "file" | "frontmatter">

function collectBlocks(
  file: string,
  nodes: ReadonlyArray<RootContent>,
  { allowItems }: { allowItems: boolean }
): Blocks {
  let heading: string | null = null
  const body: Array<string> = []
  const bullets: Array<string> = []
  const items: Array<MdxItem> = []

  for (const node of nodes) {
    if (node.type === "heading") {
      heading ??= mdastToString(node).trim()
      continue
    }
    if (node.type === "paragraph") {
      const text = mdastToString(node).trim()
      if (text.length > 0) body.push(text)
      continue
    }
    if (node.type === "list") {
      for (const listItem of node.children) {
        const text = mdastToString(listItem).trim()
        if (text.length > 0) bullets.push(text)
      }
      continue
    }
    if (isJsxElement(node)) {
      if (!allowItems) {
        throw new ContentError(
          file,
          "<Item> blocks cannot be nested inside another <Item>."
        )
      }
      if (node.name !== "Item") {
        throw new ContentError(
          file,
          `<${node.name ?? "?"}> is not a known block. Use <Item id="...">.`
        )
      }
      const id = stringAttribute(file, node, "id")
      if (!id) {
        throw new ContentError(file, "every <Item> needs an id attribute.")
      }
      const nested = collectBlocks(file, node.children, { allowItems: false })
      items.push({
        id,
        label: stringAttribute(file, node, "label"),
        heading: nested.heading,
        body: nested.body,
        bullets: nested.bullets,
      })
    }
  }

  return { heading, body, bullets, items }
}

function readFrontmatter(file: string, tree: Root): Record<string, unknown> {
  const node = tree.children.find((child) => child.type === "yaml")
  if (!node) return {}

  const parsed: unknown = parseYaml(node.value)
  if (parsed === null || parsed === undefined) return {}
  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ContentError(
      file,
      "the frontmatter between the --- lines must be a list of `key: value` settings."
    )
  }
  return parsed as Record<string, unknown>
}

export function parseMdx(file: string, source: string): ParsedMdxDocument {
  let tree: Root
  try {
    tree = processor.parse(source)
  } catch (cause) {
    throw new ContentError(
      file,
      `this file is not valid MDX. ${(cause as Error).message}`
    )
  }

  return {
    file,
    frontmatter: readFrontmatter(file, tree),
    ...collectBlocks(file, tree.children, { allowItems: true }),
  }
}
