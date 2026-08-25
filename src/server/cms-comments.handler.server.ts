import "@tanstack/react-start/server-only"

import type {
  CmsCommentReadResponse,
  CmsCommentWriteRequest,
  CmsCommentWriteResponse,
} from "@/cms/api"
import {
  CmsCapabilityError,
  requireCmsCapability,
  requireCmsMutation,
} from "@/auth/cms-capability.server"
import { isCmsStableId } from "@/cms/validation"
import { getCmsDatabase } from "@/db/client.server"
import {
  CmsRepositoryError,
  cmsCommentStatuses,
  cmsCommentSubjects,
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
    actual.length === keys.length &&
    actual.every((key, index) => key === keys[index])
  )
}

function isWriteRequest(value: unknown): value is CmsCommentWriteRequest {
  if (!isRecord(value)) return false
  if (value.operation === "create") {
    return (
      hasExactKeys(value, [
        "operation",
        "commentId",
        "pageId",
        "targetId",
        "targetVersionId",
        "subject",
        "body",
        "displayName",
      ]) &&
      isCmsStableId(value.commentId) &&
      isCmsStableId(value.pageId) &&
      isCmsStableId(value.targetId) &&
      isCmsStableId(value.targetVersionId) &&
      typeof value.subject === "string" &&
      cmsCommentSubjects.some((subject) => subject === value.subject) &&
      typeof value.body === "string" &&
      typeof value.displayName === "string"
    )
  }
  if (value.operation === "set-status") {
    return (
      hasExactKeys(value, ["operation", "pageId", "commentId", "status"]) &&
      isCmsStableId(value.pageId) &&
      isCmsStableId(value.commentId) &&
      typeof value.status === "string" &&
      cmsCommentStatuses.some((status) => status === value.status)
    )
  }
  return false
}

function json<T extends CmsCommentReadResponse | CmsCommentWriteResponse>(
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
    message: "Feedback is not available right now.",
  })
}

function errorMessage(code: CmsRepositoryError["code"]): string {
  switch (code) {
    case "INVALID_COMMENT":
    case "INVALID_DISPLAY_NAME":
      return "Add your name and feedback before sending."
    case "TARGET_ARCHIVED":
      return "This content was removed. Existing feedback is kept, but new feedback cannot be added here."
    case "TARGET_NOT_FOUND":
      return "This section could not be found. Refresh and try again."
    case "VERSION_NOT_FOUND":
      return "This saved version could not be found. Return to the current draft and try again."
    case "COMMENT_NOT_FOUND":
      return "This feedback could not be found. Refresh and try again."
    case "COMMENT_ID_REUSED":
      return "This feedback request no longer matches your note. Try adding it again."
    default:
      return "We could not update feedback. Your note is still here. Try again."
  }
}

function repositoryFailure(error: unknown): Response {
  if (error instanceof CmsRepositoryError) {
    const missing = [
      "COMMENT_NOT_FOUND",
      "TARGET_NOT_FOUND",
      "VERSION_NOT_FOUND",
    ].includes(error.code)
    const conflict = ["COMMENT_ID_REUSED", "TARGET_ARCHIVED"].includes(
      error.code
    )
    return json(missing ? 404 : conflict ? 409 : 400, {
      ok: false,
      code: error.code,
      message: errorMessage(error.code),
    })
  }
  return json(503, {
    ok: false,
    code: "UNAVAILABLE",
    message: "Feedback is not available right now. Your note is still here.",
  })
}

export async function handleCmsCommentsRead(
  request: Request
): Promise<Response> {
  try {
    requireCmsCapability(request)
  } catch (error) {
    return capabilityFailure(error)
  }

  const url = new URL(request.url)
  const queryKeys = [...url.searchParams.keys()]
  const allowed = new Set(["pageId", "versionId"])
  if (
    queryKeys.some((key) => !allowed.has(key)) ||
    new Set(queryKeys).size !== queryKeys.length
  ) {
    return json(400, {
      ok: false,
      code: "INVALID_ID",
      message: "The feedback request is not valid.",
    })
  }
  const pageId = url.searchParams.get("pageId")
  const versionId = url.searchParams.get("versionId")
  if (
    !pageId ||
    !isCmsStableId(pageId) ||
    (versionId !== null && !isCmsStableId(versionId))
  ) {
    return json(400, {
      ok: false,
      code: "INVALID_ID",
      message: "The feedback request is not valid.",
    })
  }

  try {
    const comments = await createCmsContentRepository(
      getCmsDatabase()
    ).listComments(pageId, versionId)
    return json(200, { ok: true, comments })
  } catch (error) {
    return repositoryFailure(error)
  }
}

export async function handleCmsCommentsWrite(
  request: Request
): Promise<Response> {
  try {
    requireCmsMutation(request)
  } catch (error) {
    return capabilityFailure(error)
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0")
  if (Number.isFinite(contentLength) && contentLength > 20_000) {
    return json(413, {
      ok: false,
      code: "INVALID_COMMENT",
      message: "This feedback is too long to add.",
    })
  }

  let serialized: string
  try {
    serialized = await request.text()
  } catch {
    return json(400, {
      ok: false,
      code: "INVALID_COMMENT",
      message: "The feedback request is not valid. Reload and try again.",
    })
  }
  if (new TextEncoder().encode(serialized).byteLength > 20_000) {
    return json(413, {
      ok: false,
      code: "INVALID_COMMENT",
      message: "This feedback is too long to add.",
    })
  }

  let input: unknown
  try {
    input = JSON.parse(serialized)
  } catch {
    return json(400, {
      ok: false,
      code: "INVALID_COMMENT",
      message: "The feedback request is not valid. Reload and try again.",
    })
  }
  if (!isWriteRequest(input)) {
    return json(400, {
      ok: false,
      code: "INVALID_COMMENT",
      message: "Add your name and feedback before sending.",
    })
  }

  const repository = createCmsContentRepository(getCmsDatabase())
  try {
    const comment =
      input.operation === "create"
        ? await repository.createComment({
            id: input.commentId,
            pageId: input.pageId,
            targetId: input.targetId,
            targetVersionId: input.targetVersionId,
            subject: input.subject,
            body: input.body,
            displayName: input.displayName,
          })
        : await repository.updateCommentStatus({
            pageId: input.pageId,
            commentId: input.commentId,
            status: input.status,
          })
    return json(200, { ok: true, comment })
  } catch (error) {
    return repositoryFailure(error)
  }
}
