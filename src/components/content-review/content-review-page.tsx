import { ContentReviewAppendix } from "./content-review-appendix"
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
  if (!section) return []
  return section.entries.filter(
    (entry): entry is ContentEntry => entry.kind === "content"
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
      <main
        id="main"
        className="min-h-screen bg-muted px-3 pt-[calc(var(--masthead-h)+1.5rem)] pb-0 font-body text-foreground sm:px-6"
      >
        <div className="mx-auto max-w-[90rem] border-x border-border bg-background">
          <section
            aria-label="Wireframe status"
            className="border-b border-background/30 bg-foreground px-6 py-4 text-background md:px-10 lg:px-16"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <p className="text-sm font-semibold">{data.artifactLabel}</p>
              <p className="text-xs tracking-[0.1em] text-background/70">
                PM communication wireframe · Content and order only
              </p>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-[1.5] text-background/70">
              {data.warning}
            </p>
          </section>

          <header
            aria-label="Teacher Workspace wireframe header"
            className="flex min-h-20 flex-col items-start justify-between gap-3 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:gap-6 md:px-10 lg:px-16"
          >
            <p className="text-lg font-semibold tracking-[-0.015em]">{brand}</p>
            <p className="border border-border px-3 py-1.5 text-xs font-medium tracking-[0.08em] text-muted-foreground">
              Landing page wireframe
            </p>
          </header>

          <ContentReviewOutline
            appendix={data.appendix}
            sections={mainSections}
          />
        </div>
      </main>

      <footer
        aria-label="Teacher Workspace wireframe"
        className="bg-muted px-3 font-body text-foreground sm:px-6"
        data-wireframe-section={footerSection?.kind}
      >
        <div className="mx-auto flex max-w-[90rem] flex-col gap-5 border-x border-t border-border bg-background px-6 py-8 sm:flex-row sm:items-center sm:justify-between md:px-10 lg:px-16">
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

      <aside
        aria-label="PM review notes"
        className="bg-muted px-3 pb-8 font-body text-foreground sm:px-6"
      >
        <div className="mx-auto max-w-[90rem] border-x border-border bg-background">
          <ContentReviewAppendix
            appendix={data.appendix}
            metadata={data.metadata}
          />
        </div>
      </aside>
    </>
  )
}
