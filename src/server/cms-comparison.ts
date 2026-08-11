import { createServerFn } from "@tanstack/react-start"

import type {
  CmsHead,
  CmsVersionSnapshot,
} from "@/db/content-repository.server"

export type CmsComparisonPageData =
  | { readonly status: "locked" }
  | { readonly status: "unavailable" }
  | {
      readonly status: "ready"
      readonly snapshot: CmsVersionSnapshot
      readonly publishedHead: CmsHead | null
      readonly csrfToken: string
    }

export const getCmsComparisonPageData = createServerFn({
  method: "GET",
}).handler(async (): Promise<CmsComparisonPageData> => {
  const [{ getRequest }, { loadCmsComparisonPageData }] = await Promise.all([
    import("@tanstack/react-start/server"),
    import("./cms-comparison.handler.server"),
  ])
  return loadCmsComparisonPageData(getRequest())
})
