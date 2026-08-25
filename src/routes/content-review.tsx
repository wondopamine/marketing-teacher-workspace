import { createFileRoute } from "@tanstack/react-router"
import "@fontsource-variable/inter"

import { ContentReviewPage } from "@/components/content-review/content-review-page"
import { PublicReviewMode } from "@/components/content-review/public-review-mode"
import {
  ReviewAnnotationProvider,
  useReviewAnnotations,
} from "@/components/content-review/review-annotations"
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
  const data = Route.useLoaderData()

  return (
    <ReviewAnnotationProvider>
      <ContentReviewRouteLayout data={data} />
    </ReviewAnnotationProvider>
  )
}

function ContentReviewRouteLayout({
  data,
}: {
  data: ReturnType<typeof Route.useLoaderData>
}) {
  const { panelOpen } = useReviewAnnotations()

  return (
    <div
      className={
        panelOpen ? "lg:grid lg:grid-cols-[minmax(0,1fr)_22rem]" : undefined
      }
    >
      <PublicReviewMode />
      <div
        className={
          panelOpen ? "min-w-0 lg:col-start-1 lg:row-start-2" : "min-w-0"
        }
      >
        <ContentReviewPage data={data} />
      </div>
    </div>
  )
}
