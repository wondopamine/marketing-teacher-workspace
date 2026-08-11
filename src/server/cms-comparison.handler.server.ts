import "@tanstack/react-start/server-only"

import { setResponseHeaders } from "@tanstack/react-start/server"

import type { CmsComparisonPageData } from "./cms-comparison"
import {
  CmsCapabilityError,
  requireCmsCapability,
} from "@/auth/cms-capability.server"
import { getCmsDatabase } from "@/db/client.server"
import { createCmsContentRepository } from "@/db/content-repository.server"
import { cmsHomepagePageId } from "@/cms/templates/homepage-v1.server"

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
  let session
  try {
    session = requireCmsCapability(request)
  } catch (error) {
    return error instanceof CmsCapabilityError &&
      (error.code === "UNAUTHORIZED" || error.code === "EXPIRED")
      ? { status: "locked" }
      : { status: "unavailable" }
  }

  try {
    const repository = createCmsContentRepository(getCmsDatabase())
    const [snapshot, page] = await Promise.all([
      repository.loadDraft(cmsHomepagePageId),
      repository.loadPageState(cmsHomepagePageId),
    ])
    return {
      status: "ready",
      snapshot,
      publishedHead: page.publishedHead,
      csrfToken: session.csrfToken,
    }
  } catch {
    return { status: "unavailable" }
  }
}
