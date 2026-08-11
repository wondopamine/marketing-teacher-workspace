import "@tanstack/react-start/server-only"

import type {
  CmsReadResponse,
  CmsWriteRequest,
  CmsWriteResponse,
} from "@/cms/api"
import type { CmsHead } from "@/db/content-repository.server"
import {
  CmsCapabilityError,
  requireCmsCapability,
  requireCmsMutation,
} from "@/auth/cms-capability.server"
import { isCmsStableId, isCmsVersionContract } from "@/cms/validation"
import { getCmsDatabase } from "@/db/client.server"
import {
  CmsRepositoryError,
  createCmsContentRepository,
} from "@/db/content-repository.server"

const privateHeaders = {
  "Cache-Control": "private, no-store",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  Vary: "Cookie",
} as const

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function hasExactKeys(
  value: UnknownRecord,
  expected: ReadonlyArray<string>
): boolean {
  const actual = Object.keys(value).sort()
  const keys = [...expected].sort()
  return (
    actual.length === keys.length && actual.every((key, i) => key === keys[i])
  )
}

function isHead(value: unknown): value is CmsHead {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["versionId", "versionNumber", "digest"]) &&
    isCmsStableId(value.versionId) &&
    Number.isInteger(value.versionNumber) &&
    (value.versionNumber as number) > 0 &&
    typeof value.digest === "string" &&
    /^[0-9a-f]{64}$/.test(value.digest)
  )
}

function commonWriteValues(value: UnknownRecord): boolean {
  return (
    isCmsStableId(value.pageId) &&
    isCmsStableId(value.attemptId) &&
    typeof value.displayName === "string"
  )
}

function isWriteRequest(value: unknown): value is CmsWriteRequest {
  if (!isRecord(value) || !commonWriteValues(value)) return false
  if (value.operation === "save") {
    return (
      hasExactKeys(value, [
        "operation",
        "pageId",
        "expectedHead",
        "contract",
        "displayName",
        "attemptId",
      ]) &&
      isHead(value.expectedHead) &&
      isCmsVersionContract(value.contract)
    )
  }
  if (value.operation === "restore") {
    return (
      hasExactKeys(value, [
        "operation",
        "pageId",
        "sourceVersionId",
        "expectedHead",
        "displayName",
        "attemptId",
      ]) &&
      isCmsStableId(value.sourceVersionId) &&
      isHead(value.expectedHead)
    )
  }
  if (value.operation === "publish") {
    return (
      hasExactKeys(value, [
        "operation",
        "pageId",
        "versionId",
        "expectedDraft",
        "expectedPublished",
        "displayName",
        "attemptId",
      ]) &&
      isCmsStableId(value.versionId) &&
      isHead(value.expectedDraft) &&
      (value.expectedPublished === null || isHead(value.expectedPublished))
    )
  }
  return false
}

function errorMessage(code: CmsRepositoryError["code"]): string {
  switch (code) {
    case "STALE_DRAFT":
      return "A newer version was saved. Your changes are still here. Compare them before saving again."
    case "STALE_PUBLICATION":
      return "The published version changed. Refresh the history before publishing again."
    case "PATH_TAKEN":
      return "That page address is already in use. Choose another address."
    case "INVALID_DOCUMENT":
      return "Some content needs attention before this draft can be saved."
    case "INVALID_DISPLAY_NAME":
      return "Enter your name before saving."
    case "NO_CHANGES":
      return "There are no new changes to save."
    case "ALREADY_PUBLISHED":
      return "This version is already published."
    case "ATTEMPT_REUSED":
      return "This request no longer matches your changes. Try the action again."
    case "PAGE_NOT_FOUND":
    case "VERSION_NOT_FOUND":
      return "That saved version could not be found. Refresh and try again."
    default:
      return "We could not complete that action. Your changes are still here. Try again."
  }
}

function json<T extends CmsReadResponse | CmsWriteResponse>(
  status: number,
  value: T
): Response {
  return Response.json(value, { status, headers: privateHeaders })
}

function capabilityFailure(error: unknown): Response {
  if (error instanceof CmsCapabilityError && error.code !== "UNAVAILABLE") {
    return json(401, {
      ok: false,
      code: "UNAUTHORIZED",
      message: "This edit link is no longer valid. Open the shared link again.",
      latest: null,
    })
  }
  return json(503, {
    ok: false,
    code: "UNAVAILABLE",
    message: "The editor is not available right now.",
    latest: null,
  })
}

function readCapabilityFailure(error: unknown): Response {
  if (error instanceof CmsCapabilityError && error.code !== "UNAVAILABLE") {
    return json(401, {
      ok: false,
      code: "UNAUTHORIZED",
      message: "This edit link is no longer valid. Open the shared link again.",
    })
  }
  return json(503, {
    ok: false,
    code: "UNAVAILABLE",
    message: "The editor is not available right now.",
  })
}

function repositoryFailure(error: unknown): Response {
  if (error instanceof CmsRepositoryError) {
    const conflict = [
      "ALREADY_PUBLISHED",
      "ATTEMPT_REUSED",
      "NO_CHANGES",
      "PATH_TAKEN",
      "STALE_DRAFT",
      "STALE_PUBLICATION",
    ].includes(error.code)
    const missing = ["PAGE_NOT_FOUND", "VERSION_NOT_FOUND"].includes(error.code)
    return json(conflict ? 409 : missing ? 404 : 400, {
      ok: false,
      code: error.code,
      message: errorMessage(error.code),
      latest: error.latest,
    })
  }
  return json(503, {
    ok: false,
    code: "UNAVAILABLE",
    message:
      "The editor is not available right now. Your changes are still here.",
    latest: null,
  })
}

export async function handleCmsVersionsWrite(
  request: Request
): Promise<Response> {
  try {
    requireCmsMutation(request)
  } catch (error) {
    return capabilityFailure(error)
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0")
  if (Number.isFinite(contentLength) && contentLength > 1_000_000) {
    return json(413, {
      ok: false,
      code: "INVALID_DOCUMENT",
      message: "This draft is too large to save.",
      latest: null,
    })
  }

  let serialized: string
  try {
    serialized = await request.text()
  } catch {
    return json(400, {
      ok: false,
      code: "INVALID_DOCUMENT",
      message: "The editor sent an invalid request. Reload and try again.",
      latest: null,
    })
  }
  if (new TextEncoder().encode(serialized).byteLength > 1_000_000) {
    return json(413, {
      ok: false,
      code: "INVALID_DOCUMENT",
      message: "This draft is too large to save.",
      latest: null,
    })
  }
  let input: unknown
  try {
    input = JSON.parse(serialized)
  } catch {
    return json(400, {
      ok: false,
      code: "INVALID_DOCUMENT",
      message: "The editor sent an invalid request. Reload and try again.",
      latest: null,
    })
  }
  if (!isWriteRequest(input)) {
    return json(400, {
      ok: false,
      code: "INVALID_DOCUMENT",
      message: "Some content needs attention before this draft can be saved.",
      latest: null,
    })
  }

  const repository = createCmsContentRepository(getCmsDatabase())
  try {
    if (input.operation === "save") {
      return json(200, {
        ok: true,
        operation: "save",
        result: await repository.saveVersion(input),
      })
    }
    if (input.operation === "restore") {
      return json(200, {
        ok: true,
        operation: "restore",
        result: await repository.restoreVersion(input),
      })
    }
    return json(200, {
      ok: true,
      operation: "publish",
      result: await repository.publishVersion(input),
    })
  } catch (error) {
    return repositoryFailure(error)
  }
}

export async function handleCmsVersionsRead(
  request: Request
): Promise<Response> {
  try {
    requireCmsCapability(request)
  } catch (error) {
    return readCapabilityFailure(error)
  }

  const url = new URL(request.url)
  const queryKeys = [...url.searchParams.keys()]
  const allowedKeys = new Set(["pageId", "versionId", "cursor"])
  if (
    queryKeys.some((key) => !allowedKeys.has(key)) ||
    new Set(queryKeys).size !== queryKeys.length
  ) {
    return json(400, {
      ok: false,
      code: "INVALID_CURSOR",
      message: "The version request is not valid.",
    })
  }
  const pageId = url.searchParams.get("pageId")
  const versionId = url.searchParams.get("versionId")
  const cursorValue = url.searchParams.get("cursor")
  if (!pageId || !isCmsStableId(pageId)) {
    return json(400, {
      ok: false,
      code: "INVALID_ID",
      message: "The page could not be loaded.",
    })
  }
  const repository = createCmsContentRepository(getCmsDatabase())
  try {
    if (versionId !== null) {
      if (!isCmsStableId(versionId) || cursorValue !== null) {
        throw new CmsRepositoryError("INVALID_ID")
      }
      return json(200, {
        ok: true,
        kind: "version",
        version: await repository.getVersion(pageId, versionId),
      })
    }
    const cursor = cursorValue === null ? null : Number(cursorValue)
    return json(200, {
      ok: true,
      kind: "history",
      history: await repository.listVersions(pageId, cursor),
    })
  } catch (error) {
    if (error instanceof CmsRepositoryError) {
      return json(error.code.includes("NOT_FOUND") ? 404 : 400, {
        ok: false,
        code: error.code,
        message: errorMessage(error.code),
      })
    }
    return json(503, {
      ok: false,
      code: "UNAVAILABLE",
      message: "Version history is not available right now.",
    })
  }
}
