import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  handleCmsPagesRead,
  handleCmsPagesWrite,
} from "./cms-pages.handler.server"
import {
  createCmsCapabilityService,
  hashCmsEditKey,
} from "@/auth/cms-capability.server"

const editKey = "edit_key_abcdefghijklmnopqrstuvwxyz_123456"
const editKeyHash = hashCmsEditKey(editKey)
const cookieSecret = "cookie-secret-with-at-least-thirty-two-bytes"
const previousEditKeyHash = process.env.CMS_EDIT_KEY_HASH
const previousCookieSecret = process.env.CMS_COOKIE_SECRET

function capability() {
  const result = createCmsCapabilityService({
    editKeyHash,
    cookieSecret,
    sessionDurationMs: 60_000,
  }).exchange(editKey, "http://localhost:3000/api/cms/session")
  return {
    cookie: result.cookieHeader.split(";", 1)[0] ?? "",
    csrfToken: result.session.csrfToken,
  }
}

function mutationRequest(
  body: string,
  options: { csrfToken?: string; contentLength?: string } = {}
): Request {
  const session = capability()
  return new Request("http://localhost:3000/api/cms/pages", {
    method: "POST",
    headers: {
      cookie: session.cookie,
      origin: "http://localhost:3000",
      "sec-fetch-site": "same-origin",
      "content-type": "application/json",
      "x-cms-csrf": options.csrfToken ?? session.csrfToken,
      ...(options.contentLength
        ? { "content-length": options.contentLength }
        : {}),
    },
    body,
  })
}

describe("CMS page API boundary", () => {
  beforeEach(() => {
    process.env.CMS_EDIT_KEY_HASH = editKeyHash
    process.env.CMS_COOKIE_SECRET = cookieSecret
  })

  afterEach(() => {
    process.env.CMS_EDIT_KEY_HASH = previousEditKeyHash
    process.env.CMS_COOKIE_SECRET = previousCookieSecret
  })

  it("checks the edit capability before parsing a page request", async () => {
    const response = await handleCmsPagesWrite(
      new Request("http://localhost:3000/api/cms/pages", {
        method: "POST",
        body: "{",
      })
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toMatchObject({
      ok: false,
      code: "UNAUTHORIZED",
    })
  })

  it("requires CSRF and rejects invalid or oversized page requests", async () => {
    const wrongCsrf = await handleCmsPagesWrite(
      mutationRequest("{}", { csrfToken: "wrong" })
    )
    expect(wrongCsrf.status).toBe(401)

    const invalid = await handleCmsPagesWrite(mutationRequest("{}"))
    expect(invalid.status).toBe(400)
    expect(await invalid.json()).toMatchObject({
      ok: false,
      code: "INVALID_DOCUMENT",
    })

    const extraKey = await handleCmsPagesWrite(
      mutationRequest(
        JSON.stringify({
          operation: "create",
          pageId: "44444444-4444-4444-8444-444444444444",
          attemptId: "55555555-5555-4555-8555-555555555555",
          templateId: "homepage-v1",
          title: "New page",
          path: "/new-page",
          displayName: "Alex Tan",
          published: true,
        })
      )
    )
    expect(extraKey.status).toBe(400)

    const oversized = await handleCmsPagesWrite(
      mutationRequest("{}", { contentLength: "50001" })
    )
    expect(oversized.status).toBe(413)
  })

  it("keeps the page list private and rejects a missing capability", async () => {
    const response = await handleCmsPagesRead(
      new Request("http://localhost:3000/api/cms/pages")
    )

    expect(response.status).toBe(401)
    expect(response.headers.get("cache-control")).toBe("private, no-store")
    expect(response.headers.get("vary")).toBe("Cookie")
  })

  it("rejects unknown page-list query values", async () => {
    const { cookie } = capability()
    const response = await handleCmsPagesRead(
      new Request("http://localhost:3000/api/cms/pages?published=true", {
        headers: { cookie },
      })
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      ok: false,
      code: "INVALID_DOCUMENT",
    })
  })
})
