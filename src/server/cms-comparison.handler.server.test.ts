import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { loadCmsPublishedComparisonPageData } from "./cms-comparison.handler.server"
import type { CmsVersionSnapshot } from "@/db/content-repository.server"
import { CmsRepositoryError } from "@/db/content-repository.server"
import {
  createCmsCapabilityService,
  hashCmsEditKey,
} from "@/auth/cms-capability.server"
import {
  cmsHomepagePageId,
  homepageV1Contract,
} from "@/cms/templates/homepage-v1.server"

const mocks = vi.hoisted(() => ({
  loadPublished: vi.fn(),
  setResponseHeaders: vi.fn(),
  RepositoryError: class RepositoryError extends Error {
    readonly code: string

    constructor(code: string) {
      super(code)
      this.code = code
    }
  },
}))

vi.mock("@tanstack/react-start/server", () => ({
  setResponseHeaders: mocks.setResponseHeaders,
}))

vi.mock("@/db/client.server", () => ({
  getCmsDatabase: vi.fn(() => ({})),
}))

vi.mock("@/db/content-repository.server", () => ({
  CmsRepositoryError: mocks.RepositoryError,
  createCmsContentRepository: vi.fn(() => ({
    loadPublished: mocks.loadPublished,
  })),
}))

const editKey = "edit_key_abcdefghijklmnopqrstuvwxyz_123456"
const editKeyHash = hashCmsEditKey(editKey)
const cookieSecret = "cookie-secret-with-at-least-thirty-two-bytes"
const previousEditKeyHash = process.env.CMS_EDIT_KEY_HASH
const previousCookieSecret = process.env.CMS_COOKIE_SECRET

function capabilityRequest(): Request {
  const result = createCmsCapabilityService({
    editKeyHash,
    cookieSecret,
    sessionDurationMs: 60_000,
  }).exchange(editKey, "http://localhost:3000/api/cms/session")
  return new Request("http://localhost:3000/cms-compare", {
    headers: { cookie: result.cookieHeader.split(";", 1)[0] ?? "" },
  })
}

function publishedSnapshot(): CmsVersionSnapshot {
  return {
    ...homepageV1Contract,
    pageId: cmsHomepagePageId,
    head: {
      versionId: "11111111-1111-4111-8111-111111111111",
      versionNumber: 2,
      digest: "a".repeat(64),
    },
    attributionKind: "self-declared",
    editorDisplayName: "Alex Tan",
    createdAt: "2026-08-12T00:00:00.000Z",
    parentVersionId: null,
    restoredFromVersionId: null,
  }
}

describe("CMS published comparison loader", () => {
  beforeEach(() => {
    process.env.CMS_EDIT_KEY_HASH = editKeyHash
    process.env.CMS_COOKIE_SECRET = cookieSecret
    mocks.loadPublished.mockReset()
    mocks.setResponseHeaders.mockReset()
  })

  afterEach(() => {
    process.env.CMS_EDIT_KEY_HASH = previousEditKeyHash
    process.env.CMS_COOKIE_SECRET = previousCookieSecret
  })

  it("checks the capability before reading a publication", async () => {
    const result = await loadCmsPublishedComparisonPageData(
      new Request("http://localhost:3000/cms-compare"),
      cmsHomepagePageId
    )

    expect(result).toEqual({ status: "locked" })
    expect(mocks.loadPublished).not.toHaveBeenCalled()
  })

  it("returns only the public projection with private response headers", async () => {
    mocks.loadPublished.mockResolvedValue(publishedSnapshot())
    const result = await loadCmsPublishedComparisonPageData(
      capabilityRequest(),
      cmsHomepagePageId
    )

    expect(result.status).toBe("ready")
    expect(JSON.stringify(result)).not.toMatch(
      /reviewDocument|designIntent|editorDisplayName|versionNumber|pageId/
    )
    expect(mocks.setResponseHeaders).toHaveBeenCalledOnce()
    const headers = mocks.setResponseHeaders.mock.calls[0]?.[0] as Headers
    expect(headers.get("cache-control")).toBe("private, no-store")
    expect(headers.get("vary")).toBe("Cookie")
  })

  it("distinguishes an unpublished page from an unavailable service", async () => {
    mocks.loadPublished.mockRejectedValueOnce(
      new CmsRepositoryError("VERSION_NOT_FOUND")
    )
    expect(
      await loadCmsPublishedComparisonPageData(
        capabilityRequest(),
        cmsHomepagePageId
      )
    ).toEqual({ status: "unpublished" })

    mocks.loadPublished.mockRejectedValueOnce(new Error("database offline"))
    expect(
      await loadCmsPublishedComparisonPageData(
        capabilityRequest(),
        cmsHomepagePageId
      )
    ).toEqual({ status: "unavailable" })
  })
})
