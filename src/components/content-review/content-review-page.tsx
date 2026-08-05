import { ContentReviewError } from "./content-review-error"
import { ContentReviewOutline } from "./content-review-outline"

import type {
  ContentReviewWireframeEntryDto,
  ContentReviewWireframePageDto,
  ContentReviewWireframeSectionDto,
} from "@/content/landing-v2-review.types"

type ContentEntry = Extract<ContentReviewWireframeEntryDto, { kind: "content" }>

function contentEntries(
  section: ContentReviewWireframeSectionDto | undefined
): ReadonlyArray<ContentEntry> {
  return (
    section?.entries.filter(
      (entry): entry is ContentEntry => entry.kind === "content"
    ) ?? []
  )
}

export function ContentReviewPage({
  data,
}: {
  data: ContentReviewWireframePageDto
}) {
  if (data.kind === "error") return <ContentReviewError />

  const footerSection = data.sections.find(
    (section) => section.kind === "footer-feedback"
  )
  const mainSections = data.sections.filter(
    (section) => section.kind !== "footer-feedback"
  )
  const footerEntries = contentEntries(footerSection)
  const footerCopy = footerEntries.find((entry) => entry.body.length > 0)
  const feedback = footerEntries.find(
    (entry) => entry.action?.purpose === "feedback"
  )
  const brand = footerCopy?.label ?? "Teacher Workspace"

  return (
    <>
      <header className="bg-muted px-6 py-5 font-body text-foreground md:px-10 lg:px-16">
        <p className="mx-auto max-w-[90rem] font-semibold tracking-[-0.015em]">
          {brand}
        </p>
      </header>
      <main id="main" className="bg-background font-body text-foreground">
        <div className="mx-auto max-w-[90rem]">
          <ContentReviewOutline
            appendix={data.appendix}
            sections={mainSections}
          />
        </div>
      </main>
      <footer
        aria-label="Teacher Workspace wireframe"
        className="bg-muted px-6 py-8 font-body text-foreground md:px-10 lg:px-16"
        data-wireframe-section={footerSection?.kind}
      >
        <div className="mx-auto flex max-w-[90rem] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">{brand}</p>
            {footerCopy?.body.map((paragraph) => (
              <p className="mt-1 text-sm text-muted-foreground" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
          {feedback?.action ? (
            <span className="text-sm font-medium select-none">
              {feedback.action.label}
            </span>
          ) : null}
        </div>
      </footer>
    </>
  )
}
