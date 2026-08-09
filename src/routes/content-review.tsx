import { createFileRoute } from "@tanstack/react-router"
import "@fontsource-variable/inter"

import { ContentReviewPage } from "@/components/content-review/content-review-page"
import { PublicReviewMode } from "@/components/content-review/public-review-mode"
import { getContentReviewPageData } from "@/server/content-review"

export const Route = createFileRoute("/content-review")({
  loader: () => getContentReviewPageData(),
  head: () => ({
    meta: [
      { title: "Teacher Workspace landing wireframe — Draft" },
      {
        name: "description",
        content:
          "Review the proposed Teacher Workspace landing-page structure and content.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ContentReviewRoute,
})

function ContentReviewRoute() {
  return (
    <>
      <ContentReviewPage data={Route.useLoaderData()} />
      {/* Mounts after hydration, so the server-rendered artifact keeps the
          zero-controls markup its accessibility evidence was verified on. */}
      <PublicReviewMode />
    </>
  )
}
