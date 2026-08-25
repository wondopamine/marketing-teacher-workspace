/**
 * Reads one MDX file that the Vite plugin has already turned into data.
 * Every accessor that can fail names the file and the missing field, because
 * the person who broke it is usually the person editing the copy.
 *
 * Nothing here parses markdown, so this module is safe to import from the
 * browser bundle. The parser lives in `mdx-parse.ts` and runs at build time.
 */

export class ContentError extends Error {
  constructor(file: string, detail: string) {
    super(`Content error in ${file}: ${detail}`)
    this.name = "ContentError"
  }
}

export type MdxItem = {
  /** `<Item id="...">`, the stable handle code uses to find this block. */
  readonly id: string
  /** `<Item label="...">`, the short eyebrow above the heading. */
  readonly label: string | null
  /** The first markdown heading inside the block. */
  readonly heading: string | null
  /** Every markdown paragraph inside the block, in order. */
  readonly body: ReadonlyArray<string>
  /** Every bullet inside the block, in order. */
  readonly bullets: ReadonlyArray<string>
}

/** What the Vite plugin emits for one `.mdx` file. */
export type ParsedMdxDocument = {
  readonly file: string
  readonly frontmatter: Readonly<Record<string, unknown>>
  readonly heading: string | null
  readonly body: ReadonlyArray<string>
  readonly bullets: ReadonlyArray<string>
  readonly items: ReadonlyArray<MdxItem>
}

export class MdxDocument {
  readonly file: string
  readonly heading: string | null
  readonly body: ReadonlyArray<string>
  readonly bullets: ReadonlyArray<string>
  readonly items: ReadonlyArray<MdxItem>

  private readonly frontmatter: Readonly<Record<string, unknown>>

  constructor(parsed: ParsedMdxDocument) {
    this.file = parsed.file
    this.frontmatter = parsed.frontmatter
    this.heading = parsed.heading
    this.body = parsed.body
    this.bullets = parsed.bullets
    this.items = parsed.items
  }

  fail(detail: string): never {
    throw new ContentError(this.file, detail)
  }

  /** A frontmatter value, or null when the author left it out or blank. */
  optionalText(key: string): string | null {
    const value = this.frontmatter[key]
    if (value === undefined || value === null) return null
    if (typeof value !== "string") {
      this.fail(`"${key}:" must be text.`)
    }
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  /** A frontmatter value the page cannot render without. */
  text(key: string): string {
    return (
      this.optionalText(key) ??
      this.fail(`"${key}:" is missing from the frontmatter at the top.`)
    )
  }

  /** The first markdown heading in the file. */
  requireHeading(): string {
    return (
      this.heading ??
      this.fail("this file needs a heading line that starts with `#`.")
    )
  }

  /** Every paragraph joined into one string, for single-paragraph fields. */
  requireBody(): string {
    if (this.body.length === 0) {
      this.fail("this file needs at least one paragraph of copy.")
    }
    return this.body.join(" ")
  }

  /** An `<Item id="...">` block, matched by id rather than by position. */
  item(id: string): MdxItem {
    return (
      this.items.find((candidate) => candidate.id === id) ??
      this.fail(`no <Item id="${id}"> block was found.`)
    )
  }

  /** Guards against an author deleting or duplicating a required block. */
  requireItems(ids: ReadonlyArray<string>): ReadonlyArray<MdxItem> {
    const found = this.items.map((item) => item.id)
    const duplicates = found.filter((id, index) => found.indexOf(id) !== index)
    if (duplicates.length > 0) {
      this.fail(`<Item id="${duplicates[0]}"> appears more than once.`)
    }
    const unexpected = found.filter((id) => !ids.includes(id))
    if (unexpected.length > 0) {
      this.fail(
        `<Item id="${unexpected[0]}"> is not part of this section. Expected: ${ids.join(", ")}.`
      )
    }
    return ids.map((id) => this.item(id))
  }
}

/** Reads one paragraph out of an item, naming the item when it is missing. */
export function itemBody(document: MdxDocument, item: MdxItem): string {
  if (item.body.length === 0) {
    document.fail(`<Item id="${item.id}"> needs at least one paragraph.`)
  }
  return item.body.join(" ")
}

/** Reads the heading out of an item, naming the item when it is missing. */
export function itemHeading(document: MdxDocument, item: MdxItem): string {
  return (
    item.heading ??
    document.fail(
      `<Item id="${item.id}"> needs a heading line that starts with \`##\`.`
    )
  )
}
