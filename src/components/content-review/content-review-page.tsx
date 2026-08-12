import { ContentReviewError } from "./content-review-error"
import { ContentReviewOutline } from "./content-review-outline"
import { EditableCopy } from "./editor/editable-copy"
import { ReviewPin } from "./review-annotations"

import type { TeacherPreviewPageDataDto } from "@/content/teacher-preview-document"
import type {
  ContentReviewEditAdapter,
  ContentReviewReviewTargets,
} from "./editor/content-review-edit-adapter"

export function ContentReviewPage({
  data,
  editor,
  reviewTargets,
}: {
  data: TeacherPreviewPageDataDto
  editor?: ContentReviewEditAdapter
  reviewTargets?: ContentReviewReviewTargets
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
            <EditableCopy
              as="p"
              value={document.brand}
              label="Edit product name"
              className="text-lg font-semibold tracking-[-0.015em]"
              onChange={
                editor
                  ? (value) => editor.updatePageText("brand", value)
                  : undefined
              }
            />
          </header>

          <ContentReviewOutline
            sections={document.sections}
            editor={editor}
            reviewTargets={reviewTargets?.sections}
          />
        </div>
      </main>

      <footer
        aria-label="Teacher Workspace footer"
        className="bg-muted px-3 font-body text-foreground sm:px-6"
        data-wireframe-section="footer-feedback"
      >
        <div className="mx-auto flex max-w-[90rem] flex-col gap-5 border-x border-t border-border bg-background px-6 py-8 sm:flex-row sm:items-center sm:justify-between md:px-10 lg:px-16">
          <div>
            <div className="flex items-start gap-3">
              <EditableCopy
                as="p"
                value={footer.brand}
                label="Edit footer product name"
                className="font-semibold"
                onChange={
                  editor
                    ? (value) => editor.updateFooterText(["brand"], value)
                    : undefined
                }
              />
              {reviewTargets?.footerSectionId ? (
                <ReviewPin id={reviewTargets.footerSectionId} />
              ) : null}
            </div>
            {footer.body.map((paragraph, index) => (
              <EditableCopy
                as="p"
                value={paragraph}
                label={`Edit footer paragraph ${index + 1}`}
                className="mt-1 text-sm text-muted-foreground"
                key={index}
                onChange={
                  editor
                    ? (value) => editor.updateFooterText(["body", index], value)
                    : undefined
                }
              />
            ))}
          </div>
          {footer.feedbackLabel ? (
            <EditableCopy
              as="span"
              value={footer.feedbackLabel}
              label="Edit footer feedback label"
              className="text-sm font-medium select-none"
              onChange={
                editor
                  ? (value) => editor.updateFooterText(["feedbackLabel"], value)
                  : undefined
              }
            />
          ) : null}
        </div>
      </footer>
    </div>
  )
}
