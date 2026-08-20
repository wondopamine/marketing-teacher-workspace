import { createFileRoute } from "@tanstack/react-router"

import type { PublicPageData } from "@/server/public-page"
import { GaLandingPage } from "@/components/landing-ga/ga-landing-page"
import { gaPageCopy } from "@/content/landing-ga-page"
import { CmsPublishedPage } from "@/components/public/cms-public-page"
import { PublicPageMessage } from "@/components/public/public-page-message"
import {
  getPublicPageData,
  publicPageResponseHeaders,
} from "@/server/public-page"

export function publicHomeHead(data: PublicPageData | undefined) {
  if (data?.status === "ready") {
    return {
      meta: [
        { title: data.page.metadata.title },
        { name: "description", content: data.page.metadata.description },
      ],
      links: [],
    }
  }
  if (data?.status === "unavailable") {
    return {
      meta: [
        { title: "Teacher Workspace is unavailable" },
        { name: "robots", content: "noindex" },
      ],
      links: [],
    }
  }
  return {
    meta: [
      { title: gaPageCopy.meta.title },
      { name: "description", content: gaPageCopy.meta.description },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        href: "/hero/hero-bg.avif",
        fetchPriority: "high" as const,
      },
    ],
  }
}

export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: async ({ request, next }) => {
        const { loadPublicPageData } = await import(
          "@/server/public-page.handler.server"
        )
        const publicPageData = await loadPublicPageData(request, "/")
        return next({ context: { publicPageData } })
      },
    },
  },
  loader: ({ serverContext }) =>
    serverContext?.publicPageData ??
    getPublicPageData({ data: { path: "/" } }),
  headers: ({ loaderData }) => publicPageResponseHeaders(loaderData),
  component: HomePage,
  head: ({ loaderData }) => publicHomeHead(loaderData),
})

function HomePage() {
  const data = Route.useLoaderData()

  if (data.status === "ready") return <CmsPublishedPage page={data.page} />
  if (data.status === "unavailable" || data.status === "not-found") {
    return (
      <PublicPageMessage heading="Website unavailable">
        We could not load the current Teacher Workspace page. Please try again
        shortly.
      </PublicPageMessage>
    )
  }

  return <GaLandingPage />
}
