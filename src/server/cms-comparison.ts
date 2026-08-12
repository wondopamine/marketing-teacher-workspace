import { createServerFn } from "@tanstack/react-start"

import type {
  CmsHead,
  CmsPageState,
  CmsVersionSnapshot,
} from "@/db/content-repository.server"

export type CmsComparisonPageData =
  | { readonly status: "locked" }
  | { readonly status: "unavailable" }
  | {
      readonly status: "ready"
      readonly snapshot: CmsVersionSnapshot
      readonly page: CmsPageState
      readonly publishedHead: CmsHead | null
      readonly csrfToken: string
    }

export const getCmsComparisonPageData = createServerFn({
  method: "GET",
})
  .validator((input: unknown): { readonly pageId: string | null } => {
    if (
      typeof input === "object" &&
      input !== null &&
      !Array.isArray(input) &&
      Object.keys(input).length === 1 &&
      (typeof (input as { pageId?: unknown }).pageId === "string" ||
        (input as { pageId?: unknown }).pageId === null)
    ) {
      return { pageId: (input as { pageId: string | null }).pageId }
    }
    return { pageId: null }
  })
  .handler(async ({ data }): Promise<CmsComparisonPageData> => {
    const [{ getRequest }, { loadCmsComparisonPageData }] = await Promise.all([
      import("@tanstack/react-start/server"),
      import("./cms-comparison.handler.server"),
    ])
    return loadCmsComparisonPageData(getRequest(), data.pageId)
  })
