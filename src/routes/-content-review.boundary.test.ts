import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf8")
}

const routeSource = readSource("src/routes/content-review.tsx")
const homeSource = readSource("src/routes/index.tsx")
const serverSource = readSource("src/server/content-review.ts")

describe("content-review route boundary", () => {
  it("loads only the public-safe server function from the route", () => {
    expect(routeSource).toContain('from "@/server/content-review"')
    expect(routeSource).toContain("getContentReviewPageData()")
    expect(routeSource).not.toContain("landing-v2-review-state.server")
    expect(routeSource).not.toContain("landing-v2-review.server")
    expect(routeSource).not.toContain("landing-v2.ts")
  })

  it("keeps the wireframe DTO builder behind a literal dynamic server import", () => {
    expect(serverSource).toMatch(
      /createServerFn\(\{\s*method:\s*"GET",?\s*\}\)/
    )
    expect(serverSource).toMatch(
      /import\(\s*"\.\.\/content\/landing-v2-review-state\.server"\s*\)/
    )
    expect(serverSource).toContain("return buildContentReviewPageDto()")
    expect(serverSource).not.toContain("buildContentReviewAnnotatedPageDto")
    expect(serverSource).not.toMatch(
      /^import .*landing-v2-review-state\.server/m
    )
  })

  it("does not add a content-review entry point to the public homepage", () => {
    expect(homeSource).not.toContain("content-review")
  })
})
