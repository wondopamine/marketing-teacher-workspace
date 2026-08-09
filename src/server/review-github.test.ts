import { describe, expect, it } from "vitest"

import {
  applyEditsToSource,
  limits,
  readGitHubConfig,
  validateSubmission,
} from "./review-github"

function edit(patch: Record<string, unknown> = {}) {
  return {
    file: "content/landing/02-hero.mdx",
    start: 10,
    end: 20,
    was: "old copy",
    text: "new copy",
    kind: "prose",
    ...patch,
  }
}

describe("review submission validation", () => {
  it("accepts a well-formed round of edits and comments", () => {
    const result = validateSubmission({
      reviewer: "  Xingyu  ",
      edits: [edit()],
      comments: [{ where: "Hero", note: "Punchier, please." }],
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.submission.reviewer).toBe("Xingyu")
    expect(result.submission.edits).toHaveLength(1)
    expect(result.submission.comments).toHaveLength(1)
  })

  it("names an anonymous reviewer rather than rejecting the round", () => {
    const result = validateSubmission({ edits: [edit()], comments: [] })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.submission.reviewer).toBe("Anonymous reviewer")
  })

  it.each([
    ["a path outside content/", { file: "src/routes/index.tsx" }],
    ["a traversal attempt", { file: "content/../../etc/passwd.mdx" }],
    ["a non-mdx file", { file: "content/landing/02-hero.ts" }],
    ["a negative offset", { start: -1 }],
    ["an inverted range", { start: 40, end: 10 }],
    ["a fractional offset", { start: 1.5 }],
    ["an unknown kind", { kind: "markdown" }],
  ])("rejects %s", (_name, patch) => {
    const result = validateSubmission({ edits: [edit(patch)], comments: [] })
    expect(result.ok).toBe(false)
  })

  it("rejects empty copy, line breaks, and oversized copy", () => {
    for (const patch of [
      { text: "   " },
      { text: "two\nlines" },
      { text: "x".repeat(limits.textLength + 1) },
    ]) {
      expect(validateSubmission({ edits: [edit(patch)], comments: [] }).ok).toBe(
        false
      )
    }
  })

  it("refuses a submission that is empty or oversized", () => {
    expect(validateSubmission({ edits: [], comments: [] }).ok).toBe(false)
    expect(
      validateSubmission({
        edits: Array.from({ length: limits.edits + 1 }, () => edit()),
        comments: [],
      }).ok
    ).toBe(false)
    expect(validateSubmission(null).ok).toBe(false)
    expect(validateSubmission({ edits: "nope", comments: [] }).ok).toBe(false)
  })

  it("drops blank comments without failing the round", () => {
    const result = validateSubmission({
      edits: [edit()],
      comments: [{ where: "Hero", note: "   " }],
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.submission.comments).toHaveLength(0)
  })
})

describe("applying edits to a source file", () => {
  const source = "# One heading\n\nSome body copy here.\n"

  it("applies several edits to one file without shifting later offsets", () => {
    const heading = { start: 2, end: 13 }
    const body = { start: 15, end: 35 }
    expect(source.slice(heading.start, heading.end)).toBe("One heading")
    expect(source.slice(body.start, body.end)).toBe("Some body copy here.")

    const result = applyEditsToSource(source, [
      { ...edit(), ...heading, was: "One heading", text: "Another heading" },
      { ...edit(), ...body, was: "Some body copy here.", text: "Fresh copy." },
    ] as never)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.source).toBe("# Another heading\n\nFresh copy.\n")
  })

  it("refuses the whole round when the file moved underneath it", () => {
    const result = applyEditsToSource(source, [
      { ...edit(), start: 2, end: 13, was: "Stale heading", text: "New" },
    ] as never)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toMatch(/changed since/i)
  })
})

describe("GitHub configuration", () => {
  it("is absent until both the token and the repository are set", () => {
    expect(readGitHubConfig({})).toBeNull()
    expect(readGitHubConfig({ REVIEW_GITHUB_TOKEN: "t" })).toBeNull()
    expect(readGitHubConfig({ REVIEW_GITHUB_REPO: "owner/repo" })).toBeNull()
    expect(
      readGitHubConfig({ REVIEW_GITHUB_TOKEN: "t", REVIEW_GITHUB_REPO: "junk" })
    ).toBeNull()
  })

  it("defaults the base and feedback branches", () => {
    const config = readGitHubConfig({
      REVIEW_GITHUB_TOKEN: "t",
      REVIEW_GITHUB_REPO: "owner/repo",
    })

    expect(config).toMatchObject({
      owner: "owner",
      repo: "repo",
      base: "main",
      branch: "review/page-feedback",
    })
  })
})
