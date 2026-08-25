import "@tanstack/react-start/server-only"

import type {
  CmsPageReadResponse,
  CmsPageWriteRequest,
  CmsPageWriteResponse,
} from "@/cms/api"
import type {
  CmsLifecycleHead,
  CmsRepositoryErrorCode,
} from "@/db/content-repository.server"
import {
  CmsCapabilityError,
  requireCmsCapability,
  requireCmsMutation,
} from "@/auth/cms-capability.server"
import { isCmsStableId } from "@/cms/validation"
import {
  cmsHomepagePageId,
  homepageV1Contract,
} from "@/cms/templates/homepage-v1.server"
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

function isLifecycleHead(value: unknown): value is CmsLifecycleHead {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["lifecycle", "lifecycleVersion"]) &&
    (value.lifecycle === "active" || value.lifecycle === "archived") &&
    Number.isInteger(value.lifecycleVersion) &&
    (value.lifecycleVersion as number) > 0
  )
}

function hasCommonValues(value: UnknownRecord): boolean {
  return (
    isCmsStableId(value.pageId) &&
    isCmsStableId(value.attemptId) &&
    typeof value.displayName === "string"
  )
}

function isWriteRequest(value: unknown): value is CmsPageWriteRequest {
  if (!isRecord(value) || !hasCommonValues(value)) return false
  if (value.operation === "create") {
    return (
      hasExactKeys(value, [
        "operation",
        "pageId",
        "attemptId",
        "templateId",
        "title",
        "path",
        "displayName",
      ]) &&
      value.templateId === "homepage-v1" &&
      typeof value.title === "string" &&
      typeof value.path === "string"
    )
  }
  if (value.operation === "duplicate") {
    return (
      hasExactKeys(value, [
        "operation",
        "pageId",
        "sourcePageId",
        "attemptId",
        "title",
        "path",
        "displayName",
      ]) &&
      isCmsStableId(value.sourcePageId) &&
      typeof value.title === "string" &&
      typeof value.path === "string"
    )
  }
  if (value.operation === "archive" || value.operation === "restore-archived") {
    return (
      hasExactKeys(value, [
        "operation",
        "pageId",
        "expectedLifecycle",
        "attemptId",
        "displayName",
      ]) && isLifecycleHead(value.expectedLifecycle)
    )
  }
  return false
}

function messageFor(code: CmsRepositoryErrorCode): string {
  switch (code) {
    case "INVALID_PATH":
      return "Use / or a lower-case page address, such as /family-support. Application addresses cannot be used."
    case "PATH_TAKEN":
      return "That page address is already in use. Choose another address."
    case "PAGE_EXISTS":
      return "That page already exists. Refresh the page list."
    case "PAGE_PUBLISHED":
      return "Unpublish this page before archiving it."
    case "PAGE_ARCHIVED":
      return "Restore this page before changing it."
    case "STALE_LIFECYCLE":
      return "This page changed after the list loaded. Refresh the page list and try again."
    case "INVALID_DISPLAY_NAME":
      return "Enter your name before changing a page."
    case "ATTEMPT_REUSED":
      return "This request no longer matches the page change. Try the action again."
    case "PAGE_NOT_FOUND":
      return "That page could not be found. Refresh the page list."
    default:
      return "We could not change this page. The current site has not changed. Try again."
  }
}

function json<T extends CmsPageReadResponse | CmsPageWriteResponse>(
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
    })
  }
  return json(503, {
    ok: false,
    code: "UNAVAILABLE",
    message: "Page management is not available right now.",
  })
}

function repositoryFailure(error: unknown): Response {
  if (error instanceof CmsRepositoryError) {
    const conflict = [
      "ATTEMPT_REUSED",
      "NO_CHANGES",
      "PAGE_EXISTS",
      "PAGE_PUBLISHED",
      "PATH_TAKEN",
      "STALE_LIFECYCLE",
    ].includes(error.code)
    return json(error.code === "PAGE_NOT_FOUND" ? 404 : conflict ? 409 : 400, {
      ok: false,
      code: error.code,
      message: messageFor(error.code),
    })
  }
  return json(503, {
    ok: false,
    code: "UNAVAILABLE",
    message:
      "Page management is not available right now. The current site has not changed.",
  })
}

export async function handleCmsPagesRead(request: Request): Promise<Response> {
  try {
    requireCmsCapability(request)
  } catch (error) {
    return capabilityFailure(error)
  }

  if ([...new URL(request.url).searchParams.keys()].length > 0) {
    return json(400, {
      ok: false,
      code: "INVALID_DOCUMENT",
      message: "The page list request is invalid. Reload and try again.",
    })
  }

  try {
    const repository = createCmsContentRepository(getCmsDatabase())
    return json(200, { ok: true, pages: await repository.listPages() })
  } catch (error) {
    return repositoryFailure(error)
  }
}

export async function handleCmsPagesWrite(request: Request): Promise<Response> {
  try {
    requireCmsMutation(request)
  } catch (error) {
    return capabilityFailure(error)
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0")
  if (Number.isFinite(contentLength) && contentLength > 50_000) {
    return json(413, {
      ok: false,
      code: "INVALID_DOCUMENT",
      message: "This page request is too large.",
    })
  }

  let input: unknown
  try {
    const serialized = await request.text()
    if (new TextEncoder().encode(serialized).byteLength > 50_000) {
      return json(413, {
        ok: false,
        code: "INVALID_DOCUMENT",
        message: "This page request is too large.",
      })
    }
    input = JSON.parse(serialized)
  } catch {
    return json(400, {
      ok: false,
      code: "INVALID_DOCUMENT",
      message: "The editor sent an invalid page request. Reload and try again.",
    })
  }
  if (!isWriteRequest(input)) {
    return json(400, {
      ok: false,
      code: "INVALID_DOCUMENT",
      message: "Some page details need attention before this can be saved.",
    })
  }

  const repository = createCmsContentRepository(getCmsDatabase())
  try {
    if (input.operation === "create") {
      return json(200, {
        ok: true,
        operation: input.operation,
        result: await repository.createPage({
          ...input,
          templatePageId: cmsHomepagePageId,
          templateContract: homepageV1Contract,
        }),
      })
    }
    if (input.operation === "duplicate") {
      return json(200, {
        ok: true,
        operation: input.operation,
        result: await repository.duplicatePage(input),
      })
    }
    return json(200, {
      ok: true,
      operation: input.operation,
      result:
        input.operation === "archive"
          ? await repository.archivePage(input)
          : await repository.restoreArchivedPage(input),
    })
  } catch (error) {
    return repositoryFailure(error)
  }
}
