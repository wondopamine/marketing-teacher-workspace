import { createFileRoute } from "@tanstack/react-router"

import type { TeacherPreviewDocumentDto } from "@/content/teacher-preview-document"
import { ContentReviewPage } from "@/components/content-review/content-review-page"
import { PublicReviewMode } from "@/components/content-review/public-review-mode"
import {
  ReviewAnnotationProvider,
  useReviewAnnotations,
} from "@/components/content-review/review-annotations"
import { getCmsComparisonPageData } from "@/server/cms-comparison"


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
    <ReviewAnnotationProvider>
      <CmsPreviewReady document={data.document} />
    </ReviewAnnotationProvider>
  )
}

function CmsPreviewReady({
  document,
}: {
  document: TeacherPreviewDocumentDto
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
        <ContentReviewPage data={{ kind: "ready", document }} />
      </div>
    </div>
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
