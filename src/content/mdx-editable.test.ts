import { describe, expect, it } from "vitest"

import {
  applyEdit,
  collectEditableSpans,
  serialiseFrontmatterValue,
} from "./mdx-editable"

const source = `---
label: Story flow
blank:
quoted: "Already: quoted"
---

# A connected story

The intro paragraph.

<Item id="promise" label="A positive moment">

## A student is contributing.

You want to understand it.

- One
- Two

</Item>
`

function spans() {
  return collectEditableSpans("content/example.mdx", source)
}

function byLabel(label: string) {
  const found = spans().find((span) => span.label === label)
  if (!found) throw new Error(`no span labelled ${label}`)
  return found
}

describe("collectEditableSpans", () => {
  it("records a byte range that slices back to the exact text", () => {
    for (const span of spans()) {
      const raw = source.slice(span.start, span.end)
      const expected =
        span.kind === "frontmatter"
          ? serialiseFrontmatterValue(span.text)
          : span.text
      expect(raw).toBe(expected)
    }
  })

  it("finds frontmatter, headings, paragraphs, and bullets", () => {
    expect(byLabel("label").text).toBe("Story flow")
    expect(byLabel("heading").text).toBe("A connected story")
    expect(byLabel("body").text).toBe("The intro paragraph.")
    expect(byLabel("promise · heading").text).toBe("A student is contributing.")
    expect(byLabel("promise · body").text).toBe("You want to understand it.")
    expect(byLabel("promise · bullet 1").text).toBe("One")
    expect(byLabel("promise · bullet 2").text).toBe("Two")
  })

  it("skips a blank frontmatter value and unwraps a quoted one", () => {
    expect(spans().some((span) => span.label === "blank")).toBe(false)
    expect(byLabel("quoted").text).toBe("Already: quoted")
  })

  it("excludes the heading marker from the editable range", () => {
    expect(source.slice(byLabel("heading").start - 2, byLabel("heading").start))
      .toBe("# ")
  })
})

describe("applyEdit", () => {
  it("replaces only the edited range", () => {
    const span = byLabel("promise · heading")
    const result = applyEdit(source, {
      start: span.start,
      end: span.end,
      was: span.text,
      text: "A student is thriving.",
      kind: "prose",
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.source).toContain("## A student is thriving.")
    expect(result.source).toContain("label: Story flow")
    expect(result.source).toContain("You want to understand it.")
    expect(result.source.split("\n")).toHaveLength(source.split("\n").length)
  })

  it("quotes a frontmatter value only when YAML needs it", () => {
    const span = byLabel("label")
    const plain = applyEdit(source, { ...span, was: span.text, text: "Our story", kind: "frontmatter" })
    expect(plain.ok && plain.source).toContain("label: Our story")

    const risky = applyEdit(source, { ...span, was: span.text, text: "Story: flow", kind: "frontmatter" })
    expect(risky.ok && risky.source).toContain('label: "Story: flow"')
  })

  it("refuses an edit when the file changed underneath", () => {
    const span = byLabel("body")
    const result = applyEdit(source, {
      start: span.start,
      end: span.end,
      was: "Something else entirely.",
      text: "New copy.",
      kind: "prose",
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toMatch(/changed since the page loaded/i)
  })

  it("refuses a range outside the file and a multi-line value", () => {
    const span = byLabel("body")
    expect(
      applyEdit(source, {
        start: 0,
        end: source.length + 10,
        was: "",
        text: "x",
        kind: "prose",
      }).ok
    ).toBe(false)
    expect(
      applyEdit(source, {
        start: span.start,
        end: span.end,
        was: span.text,
        text: "line one\nline two",
        kind: "prose",
      }).ok
    ).toBe(false)
  })

  it("survives a full round trip through the parser", () => {
    const span = byLabel("promise · body")
    const edited = applyEdit(source, {
      start: span.start,
      end: span.end,
      was: span.text,
      text: "You want to build on it.",
      kind: "prose",
    })
    expect(edited.ok).toBe(true)
    if (!edited.ok) return

    const reparsed = collectEditableSpans("content/example.mdx", edited.source)
    const reread = reparsed.find((item) => item.label === "promise · body")
    expect(reread?.text).toBe("You want to build on it.")
    expect(reparsed).toHaveLength(spans().length)
  })
})
