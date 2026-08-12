import { createFileRoute, notFound } from "@tanstack/react-router"

import type { PublicPageData } from "@/server/public-page"
import { CmsPublishedPage } from "@/components/public/cms-public-page"
import { PublicPageMessage } from "@/components/public/public-page-message"
import {
  getPublicPageData,
  publicPageResponseHeaders,
} from "@/server/public-page"

export function requirePublishedPage(
  data: PublicPageData
): Exclude<PublicPageData, { status: "not-found" | "static" }> {
  if (data.status === "not-found" || data.status === "static") {
    throw notFound()
  }
  return data
}

export const Route = createFileRoute("/$slug")({
  server: {
    handlers: {
      GET: async ({ request, params, next }) => {
        const { loadPublicPageData } = await import(
          "@/server/public-page.handler.server"
        )
        const publicPageData = await loadPublicPageData(
          request,
          `/${params.slug}`
        )
        return next({ context: { publicPageData } })
      },
    },
  },
  loader: async ({ params, serverContext }) =>
    requirePublishedPage(
      serverContext?.publicPageData ??
        (await getPublicPageData({ data: { path: `/${params.slug}` } }))
    ),
  headers: ({ loaderData }) => publicPageResponseHeaders(loaderData),
  head: ({ loaderData }) => {
    if (loaderData?.status === "ready") {
      return {
        meta: [
          { title: loaderData.page.metadata.title },
          {
            name: "description",
            content: loaderData.page.metadata.description,
          },
        ],
      }
    }
    return {
      meta: [
        {
          title:
            loaderData?.status === "unavailable"
              ? "Teacher Workspace is unavailable"
              : "Page not found — Teacher Workspace",
        },
        { name: "robots", content: "noindex" },
      ],
    }
  },
  notFoundComponent: () => (
    <PublicPageMessage
      heading="Page not found"
      action={{ href: "/", label: "Go to homepage" }}
    >
      This Teacher Workspace page does not exist or is not published.
    </PublicPageMessage>
  ),
  component: CmsPublicSlugRoute,
})

function CmsPublicSlugRoute() {
  const data = Route.useLoaderData()

  if (data.status === "ready") return <CmsPublishedPage page={data.page} />
  return (
    <PublicPageMessage heading="Website unavailable">
      We could not load this Teacher Workspace page. Please try again shortly.
    </PublicPageMessage>
  )
}
