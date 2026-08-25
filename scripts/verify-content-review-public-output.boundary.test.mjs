import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

import { verifyContentReviewPublicOutput } from "./verify-content-review-public-output.mjs"

const fixtureRoots = new Set()

function makeOutput(files) {
  const root = mkdtempSync(join(tmpdir(), "content-review-boundary-"))
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

describe("content-review public-output dependency boundary", () => {
  it("scans review code moved into transitive shared chunks", () => {
    const output = makeOutput({
      "assets/content-review-route.js":
        'export const loadReview = () => import("./shared-ui.js")',
      "assets/shared-ui.js": 'export { data } from "./shared-data.js"',
      "assets/shared-data.js":
        'export const data = { reviewReference: "leak" }',
      "assets/home-route.js": "clean public page",
    })

    expect(() => verifyContentReviewPublicOutput(output)).toThrowError(
      "raw review reference field: assets/shared-data.js"
    )
  })

  it("scans source maps belonging to shared review dependencies", () => {
    const output = makeOutput({
      "assets/content-review-route.js": 'import "./shared-ui.js"',
      "assets/shared-ui.js": "export const clean = true",
      "assets/shared-ui.js.map": '{"sourcesContent":["schemaVersion: 3"]}',
    })

    expect(() => verifyContentReviewPublicOutput(output)).toThrowError(
      "raw schema-version field: assets/shared-ui.js.map"
    )
  })

  it("does not sweep an unrelated lazy homepage chunk", () => {
    const output = makeOutput({
      "assets/content-review-route.js": 'import "./shared-router.js"',
      "assets/shared-router.js":
        'export const home = () => import("./home-route.js")',
      "assets/home-route.js":
        'const teacherCopy = "Swan teacher.digital.moe.gov.sg TW-storybook"',
    })

    expect(verifyContentReviewPublicOutput(output)).toEqual({
      fileCount: 3,
      reviewFileCount: 2,
    })
  })
})
