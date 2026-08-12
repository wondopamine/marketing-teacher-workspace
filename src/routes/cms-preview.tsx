import { createFileRoute } from "@tanstack/react-router"

import { CmsWorkspace } from "@/components/content-review/editor/cms-workspace"
import { ReviewAnnotationProvider } from "@/components/content-review/review-annotations"
import { getCmsComparisonPageData } from "@/server/cms-comparison"
import { buildCmsReviewPresentation } from "@/cms/review-presentation"

export const Route = createFileRoute("/cms-preview")({
  loader: () => getCmsComparisonPageData(),
  headers: () => ({
    "Cache-Control": "private, no-store",
    "CDN-Cache-Control": "no-store",
    "Vercel-CDN-Cache-Control": "no-store",
    Vary: "Cookie",
  }),
  head: () => ({
    meta: [
      { title: "Teacher Workspace CMS preview" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CmsPreviewRoute,
})

function CmsPreviewRoute() {
  const data = Route.useLoaderData()
  if (data.status === "locked") {
    return (
      <CmsPreviewMessage>
        This preview needs the shared edit link.
      </CmsPreviewMessage>
    )
  }
  if (data.status === "unavailable") {
    return (
      <CmsPreviewMessage>
        The CMS preview is not available right now.
      </CmsPreviewMessage>
    )
  }
  return (
    <ReviewAnnotationProvider
      annotations={buildCmsReviewPresentation(data.snapshot).annotations}
    >
      <CmsWorkspace
        snapshot={data.snapshot}
        publishedHead={data.publishedHead}
        csrfToken={data.csrfToken}
      />
    </ReviewAnnotationProvider>
  )
}

function CmsPreviewMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-muted px-6 font-body text-foreground">
      <p className="max-w-md border border-border bg-background p-6 text-center text-base">
        {children}
      </p>
    </main>
  )
}
