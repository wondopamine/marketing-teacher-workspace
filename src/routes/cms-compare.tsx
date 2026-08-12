import { createFileRoute } from "@tanstack/react-router"

import { ContentReviewPage } from "@/components/content-review/content-review-page"
import { Button } from "@/components/ui/button"
import { getCmsPublishedComparisonPageData } from "@/server/cms-comparison"

export const Route = createFileRoute("/cms-compare")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: typeof search.page === "string" ? search.page : undefined,
  }),
  loaderDeps: ({ search }) => ({ pageId: search.page ?? null }),
  loader: ({ deps }) =>
    getCmsPublishedComparisonPageData({ data: { pageId: deps.pageId } }),
  headers: () => ({
    "Cache-Control": "private, no-store",
    "CDN-Cache-Control": "no-store",
    "Vercel-CDN-Cache-Control": "no-store",
    Vary: "Cookie",
  }),
  head: ({ loaderData }) => {
    const metadata =
      loaderData?.status === "ready" ? loaderData.page.metadata : null
    return {
      meta: [
        {
          title: metadata
            ? `${metadata.title} — Private CMS comparison`
            : "Private CMS comparison",
        },
        ...(metadata
          ? [{ name: "description", content: metadata.description }]
          : []),
        { name: "robots", content: "noindex, nofollow" },
      ],
    }
  },
  component: CmsPublishedComparisonRoute,
})

function CmsPublishedComparisonRoute() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const editorHref = search.page
    ? `/cms-preview?page=${encodeURIComponent(search.page)}`
    : "/cms-preview"

  if (data.status === "locked") {
    return (
      <ComparisonMessage heading="Private comparison locked">
        This comparison needs the shared edit link.
      </ComparisonMessage>
    )
  }
  if (data.status === "unpublished") {
    return (
      <ComparisonMessage heading="No published version" editorHref={editorHref}>
        This page does not have a published version yet.
      </ComparisonMessage>
    )
  }
  if (data.status === "unavailable") {
    return (
      <ComparisonMessage
        heading="Comparison unavailable"
        editorHref={editorHref}
      >
        The published CMS comparison is not available right now.
      </ComparisonMessage>
    )
  }

  return (
    <>
      <header
        data-review-chrome
        aria-label="CMS comparison status"
        className="border-b border-border bg-background px-4 pt-[calc(var(--masthead-h)+1rem)] pb-4 font-body text-foreground sm:px-6"
      >
        <div className="mx-auto flex max-w-[90rem] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-[66ch]">
            <p className="text-sm font-semibold">
              Private published comparison
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              This private preview shows the published draft for{" "}
              <strong className="text-foreground">
                {data.page.metadata.title}
              </strong>{" "}
              at{" "}
              <strong className="text-foreground">
                {data.page.metadata.path}
              </strong>
              . The released website has not changed.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" size="lg" className="min-h-11">
              <a href={editorHref}>Return to editor</a>
            </Button>
            <Button asChild size="lg" className="min-h-11">
              <a href="/" target="_blank" rel="noreferrer">
                Open released homepage
              </a>
            </Button>
          </div>
        </div>
      </header>
      <ContentReviewPage
        data={{ kind: "ready", document: data.page.document }}
        showReviewPins={false}
      />
    </>
  )
}

export function ComparisonMessage({
  heading,
  children,
  editorHref,
}: {
  readonly heading: string
  readonly children: React.ReactNode
  readonly editorHref?: string
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-muted px-6 pt-[calc(var(--masthead-h)+2rem)] pb-8 font-body text-foreground">
      <div className="max-w-md border border-border bg-background p-6 text-center">
        <h1 className="font-heading text-2xl font-semibold">{heading}</h1>
        <p className="mt-3 text-base leading-6">{children}</p>
        {editorHref ? (
          <Button asChild variant="outline" size="lg" className="mt-4 min-h-11">
            <a href={editorHref}>Return to editor</a>
          </Button>
        ) : null}
      </div>
    </main>
  )
}
