import "@tanstack/react-start/server-only"

import {
  setResponseHeaders,
  setResponseStatus,
} from "@tanstack/react-start/server"

import type { PublicPageData } from "./public-page"
import { getContentSource } from "@/config/content-source.server"
import { projectCmsPublicPage } from "@/cms/public-page"
import { getCmsDatabase } from "@/db/client.server"
import {
  CmsRepositoryError,
  createCmsContentRepository,
} from "@/db/content-repository.server"

function setCmsPublicHeaders(): void {
  setResponseHeaders(
    new Headers({
      "Cache-Control": "public, max-age=0, must-revalidate",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
    })
  )
}

function unavailable(): PublicPageData {
  setResponseStatus(503)
  setResponseHeaders(new Headers({ "Cache-Control": "no-store" }))
  return { status: "unavailable" }
}

function notFound(): PublicPageData {
  setResponseStatus(404)
  return { status: "not-found" }
}

export async function loadPublicPageData(
  _request: Request,
  requestedPath: string | null
): Promise<PublicPageData> {
  if (requestedPath === null) return notFound()

  let source
  try {
    source = getContentSource()
  } catch (error) {
    console.error("[cms/public] invalid content source", {
      message: error instanceof Error ? error.message : "Unknown error",
    })
    return unavailable()
  }

  if (source === "static") {
    return requestedPath === "/" ? { status: "static" } : notFound()
  }

  setCmsPublicHeaders()
  try {
    const repository = createCmsContentRepository(getCmsDatabase())
    const snapshot = await repository.loadPublishedPage(requestedPath)
    const page = projectCmsPublicPage(snapshot.pageDocument)
    if (!page) return unavailable()
    return { status: "ready", page }
  } catch (error) {
    if (
      error instanceof CmsRepositoryError &&
      error.code === "PAGE_NOT_FOUND" &&
      requestedPath !== "/"
    ) {
      return notFound()
    }
    console.error("[cms/public] published page unavailable", {
      path: requestedPath,
      code: error instanceof CmsRepositoryError ? error.code : "UNEXPECTED",
    })
    return unavailable()
  }
}
