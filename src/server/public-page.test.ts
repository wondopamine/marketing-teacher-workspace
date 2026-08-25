import { describe, expect, it } from "vitest"

import {
  PUBLIC_PAGE_STATUS_HEADER,
  finalisePublicPageResponse,
  publicPageResponseHeaders,
} from "./public-page"

describe("public page response", () => {
  it("marks only the rendered service-error response", () => {
    expect(publicPageResponseHeaders({ status: "static" })).toBeUndefined()
    expect(publicPageResponseHeaders({ status: "not-found" })).toBeUndefined()
    expect(
      publicPageResponseHeaders({ status: "unavailable" })
    ).toMatchObject({
      "Cache-Control": "no-store",
      [PUBLIC_PAGE_STATUS_HEADER]: "unavailable",
    })
  })

  it("returns the rendered outage as 503 without exposing its marker", async () => {
    const response = finalisePublicPageResponse(
      new Response("Website unavailable", {
        headers: { [PUBLIC_PAGE_STATUS_HEADER]: "unavailable" },
      })
    )

    expect(response.status).toBe(503)
    expect(response.statusText).toBe("Service Unavailable")
    expect(response.headers.has(PUBLIC_PAGE_STATUS_HEADER)).toBe(false)
    expect(await response.text()).toBe("Website unavailable")
  })
})
