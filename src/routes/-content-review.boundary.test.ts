import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const routeSource = readFileSync(
  join(process.cwd(), "src/routes/content-review.tsx"),
  "utf8"
)
const homeSource = readFileSync(
  join(process.cwd(), "src/routes/index.tsx"),
  "utf8"
)
const serverSource = readFileSync(
  join(process.cwd(), "src/server/content-review.ts"),
  "utf8"
)

describe("content-review route boundary", () => {
  it("loads only the public-safe server function from the route", () => {
    expect(routeSource).toContain('from "@/server/content-review"')
    expect(routeSource).toContain("getContentReviewPageData()")
    expect(routeSource).not.toContain("landing-v2-review-state.server")
    expect(routeSource).not.toContain("landing-v2-review.server")
    expect(routeSource).not.toContain("landing-v2.ts")
  })

  it("keeps the raw DTO builder behind a literal dynamic server import", () => {
    expect(serverSource).toMatch(
      /createServerFn\(\{\s*method:\s*"GET",?\s*\}\)/
    )
    expect(serverSource).toMatch(
      /import\(\s*"\.\.\/content\/landing-v2-review-state\.server"\s*\)/
    )
    expect(serverSource).not.toMatch(
      /^import .*landing-v2-review-state\.server/m
    )
  })

  it("does not add a content-review entry point to the public homepage", () => {
    expect(homeSource).not.toContain("content-review")
  })
})
