import { isNotFound } from "@tanstack/react-router"
import { describe, expect, it } from "vitest"

import { requirePublishedPage } from "./$slug"

describe("public CMS slug route", () => {
  it("turns missing and static-only paths into router 404s", () => {
    for (const data of [
      { status: "not-found" as const },
      { status: "static" as const },
    ]) {
      try {
        requirePublishedPage(data)
        throw new Error("Expected a not-found result")
      } catch (error) {
        expect(isNotFound(error)).toBe(true)
      }
    }
  })

  it("keeps service errors available to the route message", () => {
    expect(requirePublishedPage({ status: "unavailable" })).toEqual({
      status: "unavailable",
    })
  })
})
