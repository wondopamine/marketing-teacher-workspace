import { createFileRoute } from "@tanstack/react-router"
import "@fontsource-variable/inter"

import { ContentEditMode } from "@/components/content-review/content-edit-mode"
import { ContentReviewPage } from "@/components/content-review/content-review-page"
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
      {import.meta.env.MODE === "development" ? <ContentEditMode /> : null}
    </>
  )
}
