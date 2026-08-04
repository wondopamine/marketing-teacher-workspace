import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

import { verifyContentReviewPublicOutput } from "./verify-content-review-public-output.mjs"

const fixtureRoots = new Set()

function makeOutput(files = {}) {
  const root = mkdtempSync(join(tmpdir(), "content-review-output-"))
  fixtureRoots.add(root)

  for (const [relativePath, contents] of Object.entries(files)) {
    const path = join(root, relativePath)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, contents, "utf8")
  }

  return root
}

afterEach(() => {
  for (const root of fixtureRoots) {
    rmSync(root, { force: true, recursive: true })
  }
  fixtureRoots.clear()
})

describe("verifyContentReviewPublicOutput", () => {
  it("fails when the public output directory is missing", () => {
    const root = makeOutput()
    const missingOutput = join(root, "missing")

    expect(() => verifyContentReviewPublicOutput(missingOutput)).toThrowError(
      "Public build output is missing. Run the production build before this check."
    )
  })

  it("fails when the public output has no scannable files", () => {
    const output = makeOutput({ "README.txt": "not part of the build scan" })

    expect(() => verifyContentReviewPublicOutput(output)).toThrowError(
      "Public build output contains no scannable files."
    )
  })

  it("fails when the content-review client chunk is missing", () => {
    const output = makeOutput({ "index.html": "clean public page" })

    expect(() => verifyContentReviewPublicOutput(output)).toThrowError(
      "The public build is missing the content-review client chunk."
    )
  })

  it("passes clean public output", () => {
    const output = makeOutput({
      "assets/content-review-route.js": "clean review route",
      "index.html": "clean public page",
    })

    expect(verifyContentReviewPublicOutput(output)).toEqual({
      fileCount: 2,
      reviewFileCount: 1,
    })
  })

  it("fails when any public file contains a global denylisted value", () => {
    const output = makeOutput({
      "assets/content-review-route.js": "clean review route",
      "index.html": "ISSUECOMMENT-4977836365",
    })

    expect(() => verifyContentReviewPublicOutput(output)).toThrowError(
      "Known prohibited value found in public build output:\n" +
        "superseded story source: index.html"
    )
  })

  it("fails when a content-review chunk contains a route-only denylisted value", () => {
    const output = makeOutput({
      "assets/content-review-route.js": "XINGYU",
      "index.html": "clean public page",
    })

    expect(() => verifyContentReviewPublicOutput(output)).toThrowError(
      "Known prohibited value found in public build output:\n" +
        "internal person name: assets/content-review-route.js"
    )
  })
})
