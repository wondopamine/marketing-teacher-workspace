import { createFileRoute } from "@tanstack/react-router"

import { ContentReviewPage } from "@/components/content-review/content-review-page"
import { getContentReviewPageData } from "@/server/content-review"

export const Route = createFileRoute("/content-review")({
  loader: () => getContentReviewPageData(),
  head: () => ({
    meta: [
      { title: "Teacher Workspace content review — Draft" },
      {
        name: "description",
        content:
          "Review the draft information architecture and content for Teacher Workspace.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ContentReviewRoute,
})

function ContentReviewRoute() {
  return <ContentReviewPage data={Route.useLoaderData()} />
}
