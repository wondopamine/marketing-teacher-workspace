import { beforeEach, describe, expect, it, vi } from "vitest"

import { loadPublicPageData } from "./public-page.handler.server"
import type { CmsVersionSnapshot } from "@/db/content-repository.server"
import { homepageV1Contract } from "@/cms/templates/homepage-v1.server"

const mocks = vi.hoisted(() => ({
  contentSource: "static",
  loadPublishedPage: vi.fn(),
  setResponseHeaders: vi.fn(),
  setResponseStatus: vi.fn(),
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
  setResponseStatus: mocks.setResponseStatus,
}))

vi.mock("@/config/content-source.server", () => ({
  getContentSource: vi.fn(() => {
    if (mocks.contentSource === "invalid") throw new Error("invalid source")
    return mocks.contentSource
  }),
}))

vi.mock("@/db/client.server", () => ({
  getCmsDatabase: vi.fn(() => ({})),
}))

vi.mock("@/db/content-repository.server", () => ({
  CmsRepositoryError: mocks.RepositoryError,
  createCmsContentRepository: vi.fn(() => ({
    loadPublishedPage: mocks.loadPublishedPage,
  })),
}))

function publishedSnapshot(): CmsVersionSnapshot {
  return {
    ...homepageV1Contract,
    pageId: "b7a1e972-1758-4815-87b9-9697a324a667",
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

describe("public content loader", () => {
  beforeEach(() => {
    mocks.contentSource = "static"
    mocks.loadPublishedPage.mockReset()
    mocks.setResponseHeaders.mockReset()
    mocks.setResponseStatus.mockReset()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("serves only the released homepage while the switch is static", async () => {
    expect(
      await loadPublicPageData(new Request("https://example.test/"), "/")
    ).toEqual({ status: "static" })
    expect(mocks.loadPublishedPage).not.toHaveBeenCalled()

    expect(
      await loadPublicPageData(
        new Request("https://example.test/new-page"),
        "/new-page"
      )
    ).toEqual({ status: "not-found" })
    expect(mocks.setResponseStatus).toHaveBeenLastCalledWith(404)
  })

  it("serves only the exact published public projection in CMS mode", async () => {
    mocks.contentSource = "cms"
    mocks.loadPublishedPage.mockResolvedValue(publishedSnapshot())

    const result = await loadPublicPageData(
      new Request("https://example.test/"),
      "/"
    )

    expect(result.status).toBe("ready")
    expect(mocks.loadPublishedPage).toHaveBeenCalledWith("/")
    expect(JSON.stringify(result)).not.toMatch(
      /reviewDocument|designIntent|editorDisplayName|versionNumber|pageId/
    )
    const headers = mocks.setResponseHeaders.mock.calls[0]?.[0] as Headers
    expect(headers.get("cache-control")).toBe(
      "public, max-age=0, must-revalidate"
    )
  })

  it("never falls back to static content after a CMS failure", async () => {
    mocks.contentSource = "cms"
    mocks.loadPublishedPage.mockRejectedValueOnce(new Error("database offline"))

    expect(
      await loadPublicPageData(new Request("https://example.test/"), "/")
    ).toEqual({ status: "unavailable" })
    expect(mocks.setResponseStatus).toHaveBeenLastCalledWith(503)

    mocks.loadPublishedPage.mockRejectedValueOnce(
      new mocks.RepositoryError("PAGE_NOT_FOUND")
    )
    expect(
      await loadPublicPageData(
        new Request("https://example.test/missing"),
        "/missing"
      )
    ).toEqual({ status: "not-found" })
    expect(mocks.setResponseStatus).toHaveBeenLastCalledWith(404)
  })

  it("fails closed when the switch is invalid or the CMS homepage is missing", async () => {
    mocks.contentSource = "invalid"
    expect(
      await loadPublicPageData(new Request("https://example.test/"), "/")
    ).toEqual({ status: "unavailable" })

    mocks.contentSource = "cms"
    mocks.loadPublishedPage.mockRejectedValueOnce(
      new mocks.RepositoryError("PAGE_NOT_FOUND")
    )
    expect(
      await loadPublicPageData(new Request("https://example.test/"), "/")
    ).toEqual({ status: "unavailable" })
    expect(mocks.setResponseStatus).toHaveBeenLastCalledWith(503)
  })
})
