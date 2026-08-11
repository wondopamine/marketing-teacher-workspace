import "@tanstack/react-start/server-only"

import { setResponseHeaders } from "@tanstack/react-start/server"

import type { CmsComparisonPageData } from "./cms-comparison"
import {
  CmsCapabilityError,
  requireCmsCapability,
} from "@/auth/cms-capability.server"
import { projectCmsPageDocument } from "@/cms/validation"
import { getCmsDatabase } from "@/db/client.server"
import { createCmsContentRepository } from "@/db/content-repository.server"


function setPrivateHeaders(): void {
  setResponseHeaders(
    new Headers({
      "Cache-Control": "private, no-store",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
      Vary: "Cookie",
    })
  )
}

export async function loadCmsComparisonPageData(
  request: Request
): Promise<CmsComparisonPageData> {
  setPrivateHeaders()
  try {
    requireCmsCapability(request)
  } catch (error) {
    return error instanceof CmsCapabilityError &&
      (error.code === "UNAUTHORIZED" || error.code === "EXPIRED")
      ? { status: "locked" }
      : { status: "unavailable" }
  }

  try {
    const snapshot =
      await createCmsContentRepository(getCmsDatabase()).loadPublishedPage("/")
    const document = projectCmsPageDocument(snapshot.pageDocument)
    return document ? { status: "ready", document } : { status: "unavailable" }
  } catch {
    return { status: "unavailable" }
  }
}
