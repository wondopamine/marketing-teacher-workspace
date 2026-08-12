import { createServerFn } from "@tanstack/react-start"

import type { CmsPublicPageDto } from "@/cms/public-page"
import { normaliseCmsPath } from "@/cms/validation"

export type PublicPageData =
  | { readonly status: "static" }
  | { readonly status: "ready"; readonly page: CmsPublicPageDto }
  | { readonly status: "not-found" }
  | { readonly status: "unavailable" }

export const PUBLIC_PAGE_STATUS_HEADER = "X-Teacher-Workspace-Status"

export function publicPageResponseHeaders(
  data: PublicPageData | undefined
): Record<string, string> | undefined {
  if (data?.status === "ready") {
    return {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
    }
  }
  if (data?.status === "unavailable") {
    return {
      "Cache-Control": "no-store",
      [PUBLIC_PAGE_STATUS_HEADER]: "unavailable",
    }
  }
  return undefined
}

export function finalisePublicPageResponse(response: Response): Response {
  if (response.headers.get(PUBLIC_PAGE_STATUS_HEADER) !== "unavailable") {
    return response
  }
  const headers = new Headers(response.headers)
  headers.delete(PUBLIC_PAGE_STATUS_HEADER)
  return new Response(response.body, {
    status: 503,
    statusText: "Service Unavailable",
    headers,
  })
}

function validatePublicPathInput(input: unknown): {
  readonly path: string | null
} {
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input) ||
    Object.keys(input).length !== 1 ||
    typeof (input as { path?: unknown }).path !== "string"
  ) {
    return { path: null }
  }
  const path = (input as { path: string }).path
  return { path: normaliseCmsPath(path) === path ? path : null }
}

export const getPublicPageData = createServerFn({ method: "GET" })
  .validator(validatePublicPathInput)
  .handler(async ({ data }): Promise<PublicPageData> => {
    const [{ getRequest }, { loadPublicPageData }] = await Promise.all([
      import("@tanstack/react-start/server"),
      import("./public-page.handler.server"),
    ])
    return loadPublicPageData(getRequest(), data.path)
  })
