import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { handleCmsCapabilityExchange } from "./cms-session.handler.server"
import { hashCmsEditKey } from "@/auth/cms-capability.server"


const editKey = "edit_key_abcdefghijklmnopqrstuvwxyz_123456"
const previousEditKeyHash = process.env.CMS_EDIT_KEY_HASH
const previousCookieSecret = process.env.CMS_COOKIE_SECRET

describe("CMS capability exchange endpoint", () => {
  beforeEach(() => {
    process.env.CMS_EDIT_KEY_HASH = hashCmsEditKey(editKey)
    process.env.CMS_COOKIE_SECRET =
      "cookie-secret-with-at-least-thirty-two-bytes"
  })

  afterEach(() => {
    process.env.CMS_EDIT_KEY_HASH = previousEditKeyHash
    process.env.CMS_COOKIE_SECRET = previousCookieSecret
  })

  it("removes the key from the visible URL by redirecting to the preview", () => {
    const response = handleCmsCapabilityExchange(
      new Request(
        `http://localhost:3000/api/cms/session?key=${encodeURIComponent(editKey)}`
      )
    )

    expect(response.status).toBe(303)
    expect(response.headers.get("location")).toBe("/cms-preview")
    expect(response.headers.get("location")).not.toContain(editKey)
    expect(response.headers.get("set-cookie")).toContain("HttpOnly")
    expect(response.headers.get("cache-control")).toBe("private, no-store")
    expect(response.headers.get("referrer-policy")).toBe("no-referrer")
  })

  it("does not set a cookie for invalid, duplicated, or extra query values", () => {
    for (const path of [
      "/api/cms/session?key=invalid",
      `/api/cms/session?key=${editKey}&key=${editKey}`,
      `/api/cms/session?key=${editKey}&returnTo=https://example.com`,
    ]) {
      const response = handleCmsCapabilityExchange(
        new Request(`http://localhost:3000${path}`)
      )
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.headers.get("set-cookie")).toBeNull()
    }
  })
})
