export function ContentReviewError() {
  return (
    <main
      id="main"
      className="min-h-screen bg-background px-6 pt-[calc(var(--masthead-h)+2rem)] pb-16 font-body text-foreground sm:px-10"
    >
      <div className="mx-auto max-w-3xl border border-border bg-background p-6 sm:p-10">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          Landing page wireframe
        </p>
        <h1 className="mt-4 font-heading text-[32px] leading-tight font-semibold">
          Wireframe unavailable
        </h1>
        <p className="mt-6 leading-6">
          The draft content did not pass validation. Review is paused until the
          content structure is fixed.
        </p>
      </div>
    </main>
  )
}
