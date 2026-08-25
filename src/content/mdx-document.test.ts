import { describe, expect, it } from "vitest"

import {
  ContentError,
  MdxDocument,
  itemBody,
  itemHeading,
} from "./mdx-document"
import { parseMdx } from "./mdx-parse"

const source = `---
title: Intended audiences
intro: Who the page is written for.
blank: "   "
---

# Section heading

First paragraph.

Second paragraph.

- One
- Two

<Item id="teachers" label="Form Teachers">

## What changes for me?

You keep the judgment.

</Item>

<Item id="leaders">

## And for the school?

One shared view.

- Attendance
- Notes

</Item>
`

function parse(text: string): MdxDocument {
  return new MdxDocument(parseMdx("content/example.mdx", text))
}

describe("MdxDocument", () => {
  const document = parse(source)

  it("reads frontmatter, prose, and bullets from one file", () => {
    expect(document.text("title")).toBe("Intended audiences")
    expect(document.text("intro")).toBe("Who the page is written for.")
    expect(document.requireHeading()).toBe("Section heading")
    expect(document.body).toEqual(["First paragraph.", "Second paragraph."])
    expect(document.bullets).toEqual(["One", "Two"])
  })

  it("treats blank and absent frontmatter values the same", () => {
    expect(document.optionalText("blank")).toBeNull()
    expect(document.optionalText("missing")).toBeNull()
  })

  it("matches Item blocks by id rather than by position", () => {
    const [leaders, teachers] = document.requireItems(["leaders", "teachers"])

    expect(teachers.label).toBe("Form Teachers")
    expect(itemHeading(document, teachers)).toBe("What changes for me?")
    expect(itemBody(document, teachers)).toBe("You keep the judgment.")
    expect(leaders.label).toBeNull()
    expect(leaders.bullets).toEqual(["Attendance", "Notes"])
  })

  it("names the file and the field when copy is missing", () => {
    expect(() => document.text("headline")).toThrow(ContentError)
    expect(() => document.text("headline")).toThrow(
      'Content error in content/example.mdx: "headline:" is missing'
    )
    expect(() => document.item("nobody")).toThrow(
      'no <Item id="nobody"> block was found'
    )
  })

  it("rejects a duplicated or unexpected Item block", () => {
    expect(() =>
      parse('<Item id="a" />\n\n<Item id="a" />\n').requireItems(["a"])
    ).toThrow('<Item id="a"> appears more than once')
    expect(() => document.requireItems(["teachers"])).toThrow(
      '<Item id="leaders"> is not part of this section'
    )
  })

  it("rejects an unknown block and a nested Item", () => {
    expect(() => parse("<Callout>\n\nHello.\n\n</Callout>\n")).toThrow(
      "<Callout> is not a known block"
    )
    expect(() =>
      parse('<Item id="a">\n\n<Item id="b" />\n\n</Item>\n')
    ).toThrow("cannot be nested")
  })

  it("rejects an Item without an id", () => {
    expect(() => parse('<Item label="Hi" />\n')).toThrow(
      "every <Item> needs an id"
    )
  })
})
