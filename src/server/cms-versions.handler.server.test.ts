import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  handleCmsVersionsRead,
  handleCmsVersionsWrite,
} from "./cms-versions.handler.server"
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
  return new Request("http://localhost:3000/api/cms/versions", {
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

describe("CMS version API boundary", () => {
  beforeEach(() => {
    process.env.CMS_EDIT_KEY_HASH = editKeyHash
    process.env.CMS_COOKIE_SECRET = cookieSecret
  })

  afterEach(() => {
    process.env.CMS_EDIT_KEY_HASH = previousEditKeyHash
    process.env.CMS_COOKIE_SECRET = previousCookieSecret
  })

  it("checks the edit capability before parsing a write body", async () => {
    const response = await handleCmsVersionsWrite(
      new Request("http://localhost:3000/api/cms/versions", {
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

  it("requires the CSRF token and rejects invalid or oversized documents before database access", async () => {
    const wrongCsrf = await handleCmsVersionsWrite(
      mutationRequest("{}", { csrfToken: "wrong" })
    )
    expect(wrongCsrf.status).toBe(401)

    const invalid = await handleCmsVersionsWrite(mutationRequest("{}"))
    expect(invalid.status).toBe(400)
    expect(await invalid.json()).toMatchObject({
      ok: false,
      code: "INVALID_DOCUMENT",
    })

    const oversized = await handleCmsVersionsWrite(
      mutationRequest("{}", { contentLength: "1000001" })
    )
    expect(oversized.status).toBe(413)

    const oversizedWithoutHeader = await handleCmsVersionsWrite(
      mutationRequest(`"${"x".repeat(1_000_001)}"`)
    )
    expect(oversizedWithoutHeader.status).toBe(413)
  })

  it("rejects missing, unknown, and repeated history query values", async () => {
    const { cookie } = capability()
    for (const query of [
      "",
      "?pageId=not-an-id",
      "?pageId=b7a1e972-1758-4815-87b9-9697a324a667&extra=true",
      "?pageId=b7a1e972-1758-4815-87b9-9697a324a667&pageId=b7a1e972-1758-4815-87b9-9697a324a667",
    ]) {
      const response = await handleCmsVersionsRead(
        new Request(`http://localhost:3000/api/cms/versions${query}`, {
          headers: { cookie },
        })
      )
      expect(response.status).toBe(400)
    }
  })

  it("keeps read responses private and rejects a missing capability", async () => {
    const response = await handleCmsVersionsRead(
      new Request(
        "http://localhost:3000/api/cms/versions?pageId=b7a1e972-1758-4815-87b9-9697a324a667"
      )
    )

    expect(response.status).toBe(401)
    expect(response.headers.get("cache-control")).toBe("private, no-store")
    expect(response.headers.get("vary")).toBe("Cookie")
  })

  it("reports missing server configuration as unavailable, not an invalid link", async () => {
    delete process.env.CMS_COOKIE_SECRET
    const response = await handleCmsVersionsRead(
      new Request(
        "http://localhost:3000/api/cms/versions?pageId=b7a1e972-1758-4815-87b9-9697a324a667"
      )
    )

    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({
      ok: false,
      code: "UNAVAILABLE",
    })
  })
})
