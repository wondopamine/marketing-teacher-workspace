import { ContentReviewError } from "./content-review-error"
import { ContentReviewOutline } from "./content-review-outline"

import type { TeacherPreviewPageDataDto } from "@/content/teacher-preview-document"

export function ContentReviewPage({
  data,
}: {
  data: TeacherPreviewPageDataDto
}) {
  if (data.kind === "error") return <ContentReviewError />

  const { document } = data
  const { footer } = document

  return (
    <div data-teacher-preview>
      <main
        id="main"
        className="min-h-screen bg-muted px-3 pt-6 pb-0 font-body text-foreground sm:px-6"
      >
        <div className="mx-auto max-w-[90rem] border-x border-border bg-background">
          <header
            aria-label="Teacher Workspace header"
            className="flex min-h-20 flex-col items-start justify-between gap-3 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:gap-6 md:px-10 lg:px-16"
          >
            <p className="text-lg font-semibold tracking-[-0.015em]">
              {document.brand}
            </p>
          </header>

          <ContentReviewOutline sections={document.sections} />
        </div>
      </main>

      <footer
        aria-label="Teacher Workspace footer"
        className="bg-muted px-3 font-body text-foreground sm:px-6"
        data-wireframe-section="footer-feedback"
      >
        <div className="mx-auto flex max-w-[90rem] flex-col gap-5 border-x border-t border-border bg-background px-6 py-8 sm:flex-row sm:items-center sm:justify-between md:px-10 lg:px-16">
          <div>
            <p className="font-semibold">{footer.brand}</p>
            {footer.body.map((paragraph) => (
              <p className="mt-1 text-sm text-muted-foreground" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
          {footer.feedbackLabel ? (
            <span className="text-sm font-medium select-none">
              {footer.feedbackLabel}
            </span>
          ) : null}
        </div>
      </footer>
    </div>
  )
}
