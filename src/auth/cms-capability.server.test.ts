import { describe, expect, it } from "vitest"

import {
  CmsCapabilityError,
  cmsCapabilityCookieDevelopment,
  cmsCapabilityCookieProduction,
  cmsCsrfHeader,
  createCmsCapabilityService,
  hashCmsEditKey,
} from "./cms-capability.server"

const editKey = "edit_key_abcdefghijklmnopqrstuvwxyz_123456"
const editKeyHash = hashCmsEditKey(editKey)
const cookieSecret = "cookie-secret-with-at-least-thirty-two-bytes"
const issuedAt = Date.UTC(2026, 7, 12, 0, 0, 0)

function createService(now = issuedAt) {
  return createCmsCapabilityService(
    {
      editKeyHash,
      cookieSecret,
      sessionDurationMs: 60_000,
    },
    {
      now: () => now,
      randomBytes: (size) => Buffer.alloc(size, size),
    }
  )
}

function cookiePair(setCookie: string): string {
  return setCookie.split(";", 1)[0] ?? ""
}

function requestWithCookie(
  cookie: string,
  init: RequestInit = {},
  url = "http://localhost:3000/cms-preview"
): Request {
  const headers = new Headers(init.headers)
  headers.set("cookie", cookie)
  return new Request(url, { ...init, headers })
}

describe("CMS shared-link capability", () => {
  it("exchanges the valid key for a signed, HTTP-only local cookie", () => {
    const result = createService().exchange(
      editKey,
      "http://localhost:3000/api/cms/session"
    )

    expect(result.cookieHeader).toContain(
      `${cmsCapabilityCookieDevelopment}=`
    )
    expect(result.cookieHeader).toContain("HttpOnly")
    expect(result.cookieHeader).toContain("SameSite=Strict")
    expect(result.cookieHeader).not.toContain("; Secure")
    expect(
      createService().requireSession(
        requestWithCookie(cookiePair(result.cookieHeader))
      )
    ).toEqual(result.session)
  })

  it("uses a __Host cookie over HTTPS", () => {
    const result = createService().exchange(
      editKey,
      "https://preview.example.gov/api/cms/session"
    )

    expect(result.cookieHeader).toContain(`${cmsCapabilityCookieProduction}=`)
    expect(result.cookieHeader).toContain("; Secure")
    expect(result.cookieHeader).toContain("Path=/")
  })

  it("rejects an invalid link and a tampered cookie", () => {
    expect(() =>
      createService().exchange(
        "wrong_key_abcdefghijklmnopqrstuvwxyz_1234",
        "http://localhost:3000/api/cms/session"
      )
    ).toThrowError(expect.objectContaining({ code: "INVALID_LINK" }))

    const result = createService().exchange(
      editKey,
      "http://localhost:3000/api/cms/session"
    )
    const pair = cookiePair(result.cookieHeader)
    const tampered = `${pair.slice(0, -1)}${pair.endsWith("a") ? "b" : "a"}`
    expect(() =>
      createService().requireSession(requestWithCookie(tampered))
    ).toThrowError(expect.objectContaining({ code: "UNAUTHORIZED" }))
  })

  it("invalidates expired sessions and both kinds of rotation", () => {
    const result = createService().exchange(
      editKey,
      "http://localhost:3000/api/cms/session"
    )
    const request = requestWithCookie(cookiePair(result.cookieHeader))

    expect(() => createService(issuedAt + 60_001).requireSession(request)).toThrowError(
      expect.objectContaining({ code: "EXPIRED" })
    )
    expect(() =>
      createCmsCapabilityService({
        editKeyHash: hashCmsEditKey(`${editKey}rotated`),
        cookieSecret,
        sessionDurationMs: 60_000,
      }).requireSession(request)
    ).toThrowError(expect.objectContaining({ code: "UNAUTHORIZED" }))
    expect(() =>
      createCmsCapabilityService({
        editKeyHash,
        cookieSecret: `${cookieSecret}-rotated`,
        sessionDurationMs: 60_000,
      }).requireSession(request)
    ).toThrowError(expect.objectContaining({ code: "UNAUTHORIZED" }))
  })

  it("requires same-origin mutation requests and the session CSRF token", () => {
    const service = createService()
    const result = service.exchange(
      editKey,
      "http://localhost:3000/api/cms/session"
    )
    const cookie = cookiePair(result.cookieHeader)
    const validHeaders = {
      origin: "http://localhost:3000",
      "sec-fetch-site": "same-origin",
      [cmsCsrfHeader]: result.session.csrfToken,
    }

    expect(
      service.requireMutation(
        requestWithCookie(cookie, { method: "POST", headers: validHeaders })
      )
    ).toEqual(result.session)

    expect(() =>
      service.requireMutation(
        requestWithCookie(cookie, {
          method: "POST",
          headers: { ...validHeaders, origin: "https://other.example" },
        })
      )
    ).toThrowError(expect.objectContaining({ code: "CROSS_ORIGIN" }))

    expect(() =>
      service.requireMutation(
        requestWithCookie(cookie, {
          method: "POST",
          headers: { ...validHeaders, [cmsCsrfHeader]: "wrong" },
        })
      )
    ).toThrowError(expect.objectContaining({ code: "INVALID_CSRF" }))
  })

  it("fails closed on insecure non-local transport", () => {
    expect(() =>
      createService().exchange(
        editKey,
        "http://preview.example.gov/api/cms/session"
      )
    ).toThrowError(CmsCapabilityError)
  })
})
