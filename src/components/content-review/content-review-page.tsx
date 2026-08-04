import { ContentReviewAppendix } from "./content-review-appendix"
import { ContentReviewError } from "./content-review-error"
import {
  ContentReviewOutline,
  ContentReviewSection,
  ReviewAnnotation,
} from "./content-review-outline"

import type {
  ContentReviewPageDto,
  ContentReviewStatus,
} from "@/content/landing-v2-review.types"

const statusActions: ReadonlyArray<{
  status: ContentReviewStatus
  action: string
}> = [
  {
    status: "blocked",
    action: "Stop review until the validation issue is fixed.",
  },
  {
    status: "decision-required",
    action: "Supply the named content or review decision.",
  },
  {
    status: "reconfirmation-required",
    action: "Review the current snapshot again.",
  },
  { status: "unreviewed", action: "Review this item against its snapshot." },
  {
    status: "partially-reviewed",
    action: "Ask the remaining confirmed reviewer roles to review it.",
  },
  {
    status: "reviewed-current",
    action: "Current review is recorded; this is not publication approval.",
  },
]

function StatusKey() {
  return (
    <section aria-labelledby="content-review-status-key" className="py-10">
      <h2 id="content-review-status-key" className="text-2xl font-semibold">
        Review status key
      </h2>
      <dl className="mt-6 space-y-4">
        {statusActions.map(({ action, status }) => (
          <div key={status}>
            <dt className="font-mono text-sm font-semibold">{status}</dt>
            <dd className="mt-1 text-neutral-700">{action}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function ContentReviewPage({ data }: { data: ContentReviewPageDto }) {
  if (data.kind === "error") return <ContentReviewError data={data} />

  const footerSection = data.sections.find(
    (section) => section.kind === "footer-feedback"
  )
  const mainSections = data.sections.filter(
    (section) => section.kind !== "footer-feedback"
  )

  return (
    <>
      <main
        id="main"
        className="min-h-screen bg-white px-6 pt-[calc(var(--masthead-h)+2rem)] pb-16 text-neutral-950 sm:px-10"
      >
        <article className="mx-auto max-w-3xl">
          <p className="text-sm font-medium tracking-wide uppercase">
            {data.artifactLabel}
          </p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Teacher Workspace content review
          </h1>
          <p className="mt-6 max-w-2xl leading-7">{data.warning}</p>
          <dl className="mt-6 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="font-medium">Draft snapshot</dt>
            <dd>
              <code>{data.itemSnapshot}</code>
            </dd>
            <dt className="font-medium">IA-order snapshot</dt>
            <dd>
              <code>{data.iaOrderSnapshot}</code>
            </dd>
            <dt className="font-medium">Whole-story snapshot</dt>
            <dd>
              <code>{data.storySnapshot}</code>
            </dd>
          </dl>

          <StatusKey />

          <section
            aria-labelledby="content-review-artifacts"
            className="border-t border-neutral-300 py-10"
          >
            <h2
              id="content-review-artifacts"
              className="text-2xl font-semibold"
            >
              Structure reviews
            </h2>
            <ReviewAnnotation
              context={data.artifactReview.iaOrder}
              heading="Information architecture order"
            />
            <ReviewAnnotation
              context={data.artifactReview.composedStory}
              heading="Composed story"
            />
          </section>

          <ContentReviewOutline sections={mainSections} />
          <ContentReviewAppendix
            appendix={data.appendix}
            metadata={data.metadata}
          />
        </article>
      </main>

      {footerSection ? (
        <footer
          aria-label="Content review"
          className="bg-white px-6 text-neutral-950 sm:px-10"
        >
          <div className="mx-auto max-w-3xl">
            <ContentReviewSection section={footerSection} />
          </div>
        </footer>
      ) : null}
    </>
  )
}
