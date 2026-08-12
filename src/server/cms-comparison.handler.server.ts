import "@tanstack/react-start/server-only"

import { setResponseHeaders } from "@tanstack/react-start/server"

import type {
  CmsComparisonPageData,
  CmsPublishedComparisonPageData,
} from "./cms-comparison"
import {
  CmsCapabilityError,
  requireCmsCapability,
} from "@/auth/cms-capability.server"
import { getCmsDatabase } from "@/db/client.server"
import {
  CmsRepositoryError,
  createCmsContentRepository,
} from "@/db/content-repository.server"
import { cmsHomepagePageId } from "@/cms/templates/homepage-v1.server"
import { isCmsStableId } from "@/cms/validation"
import { projectCmsPublicPage } from "@/cms/public-page"

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
  request: Request,
  requestedPageId: string | null = null
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
    if (requestedPageId !== null && !isCmsStableId(requestedPageId)) {
      return { status: "unavailable" }
    }
    const repository = createCmsContentRepository(getCmsDatabase())
    const pageId = requestedPageId ?? cmsHomepagePageId
    const [snapshot, page] = await Promise.all([
      repository.loadDraft(pageId),
      repository.loadPageState(pageId),
    ])
    return {
      status: "ready",
      snapshot,
      page,
      publishedHead: page.publishedHead,
      csrfToken: session.csrfToken,
    }
  } catch {
    return { status: "unavailable" }
  }
}

export async function loadCmsPublishedComparisonPageData(
  request: Request,
  requestedPageId: string | null = null
): Promise<CmsPublishedComparisonPageData> {
  setPrivateHeaders()
  try {
    requireCmsCapability(request)
  } catch (error) {
    return error instanceof CmsCapabilityError &&
      (error.code === "UNAUTHORIZED" || error.code === "EXPIRED")
      ? { status: "locked" }
      : { status: "unavailable" }
  }

  if (requestedPageId !== null && !isCmsStableId(requestedPageId)) {
    return { status: "unavailable" }
  }
  const pageId = requestedPageId ?? cmsHomepagePageId
  try {
    const repository = createCmsContentRepository(getCmsDatabase())
    const snapshot = await repository.loadPublished(pageId)
    const page = projectCmsPublicPage(snapshot.pageDocument)
    return page ? { status: "ready", page } : { status: "unavailable" }
  } catch (error) {
    return error instanceof CmsRepositoryError &&
      error.code === "VERSION_NOT_FOUND"
      ? { status: "unpublished" }
      : { status: "unavailable" }
  }
}
