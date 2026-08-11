import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf8")
}

const routeSource = readSource("src/routes/cms-preview.tsx")
const serverFunctionSource = readSource("src/server/cms-comparison.ts")
const handlerSource = readSource("src/server/cms-comparison.handler.server.ts")
const sessionRouteSource = readSource("src/routes/api/cms/session.tsx")

describe("protected CMS preview boundary", () => {
  it("keeps database and capability modules behind server boundaries", () => {
    expect(routeSource).toContain('from "@/server/cms-comparison"')
    expect(routeSource).not.toContain("content-repository.server")
    expect(routeSource).not.toContain("cms-capability.server")
    expect(serverFunctionSource).toContain(
      'import("./cms-comparison.handler.server")'
    )
    expect(serverFunctionSource).not.toMatch(
      /from\s+["']\.\/cms-comparison\.handler\.server["']/
    )
  })

  it("checks the capability before loading any CMS document", () => {
    expect(handlerSource.indexOf("requireCmsCapability(request)")).toBeLessThan(
      handlerSource.indexOf("loadPublishedPage")
    )
    expect(handlerSource).toContain('"Cache-Control": "private, no-store"')
    expect(handlerSource).toContain('Vary: "Cookie"')
  })

  it("dynamically imports the exchange handler from the API route", () => {
    expect(sessionRouteSource).toContain(
      'import("@/server/cms-session.handler.server")'
    )
    expect(sessionRouteSource).not.toMatch(
      /from\s+["']@\/server\/cms-session\.handler\.server["']/
    )
  })
})
