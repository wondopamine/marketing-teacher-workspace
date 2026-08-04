import type { ContentReviewErrorPageDto } from "@/content/landing-v2-review.types"

export function ContentReviewError({
  data,
}: {
  data: ContentReviewErrorPageDto
}) {
  return (
    <>
      <main
        id="main"
        className="min-h-screen bg-white px-6 pt-[calc(var(--masthead-h)+2rem)] pb-16 text-neutral-950 sm:px-10"
      >
        <article className="mx-auto max-w-3xl">
          <p className="text-sm font-medium tracking-wide uppercase">
            Internal content review
          </p>
          <h1 className="mt-4 text-3xl font-semibold">
            Content review unavailable
          </h1>
          <p className="mt-6 font-medium">{data.code}</p>
          <p className="mt-3">
            Stop this review. The content structure did not pass validation, so
            no draft story has been rendered.
          </p>
          <p className="mt-3 text-sm text-neutral-700">
            Build snapshot: <code>{data.buildSnapshot}</code>
          </p>
        </article>
      </main>
      <footer
        aria-label="Content review"
        className="border-t border-neutral-300 bg-white px-6 py-8 text-neutral-950 sm:px-10"
      >
        <div className="mx-auto max-w-3xl">
          <a
            className="rounded-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950"
            href={data.feedback.href}
            rel="noreferrer"
            target="_blank"
          >
            {data.feedback.label}
          </a>
        </div>
      </footer>
    </>
  )
}
