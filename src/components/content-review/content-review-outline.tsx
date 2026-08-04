import type {
  ContentReviewContextDto,
  ContentReviewEntryDto,
  ContentReviewSectionDto,
  ContentReviewSectionKind,
} from "@/content/landing-v2-review.types"

const sectionHeadings: Record<ContentReviewSectionKind, string> = {
  promise: "Value promise",
  "connected-story": "Connected positive-growth story",
  reveal: "Teacher Workspace reveal",
  capabilities: "Product capabilities",
  explorer: "Explore the flow in three steps",
  audiences: "Intended audiences",
  proof: "Proof",
  "access-support": "Access and support",
  close: "Closing action",
  "footer-feedback": "Footer and feedback",
}

function reviewId(reviewReference: string): string {
  return `${reviewReference.toLowerCase()}-review`
}

function ReviewDetails({ context }: { context: ContentReviewContextDto }) {
  return (
    <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[9rem_1fr]">
      <dt className="font-medium text-neutral-700">Reference</dt>
      <dd>
        <code>{context.reviewReference}</code>
      </dd>
      <dt className="font-medium text-neutral-700">Status</dt>
      <dd>{context.status}</dd>
      <dt className="font-medium text-neutral-700">Owner</dt>
      <dd>{context.owner}</dd>
      <dt className="font-medium text-neutral-700">Required reviewers</dt>
      <dd>
        {context.requiredReviewers.length > 0
          ? context.requiredReviewers.join(", ")
          : "Not yet defined"}
      </dd>
      {context.remainingReviewers.length > 0 ? (
        <>
          <dt className="font-medium text-neutral-700">Still needed</dt>
          <dd>{context.remainingReviewers.join(", ")}</dd>
        </>
      ) : null}
      <dt className="font-medium text-neutral-700">Concerns</dt>
      <dd>{context.concerns.join(", ")}</dd>
      <dt className="font-medium text-neutral-700">Source</dt>
      <dd>{context.sourceLabel}</dd>
      <dt className="font-medium text-neutral-700">Content snapshot</dt>
      <dd>
        <code>{context.snapshot}</code>
      </dd>
      {context.blockers.length > 0 ? (
        <>
          <dt className="font-medium text-neutral-700">Next action</dt>
          <dd>{context.blockers.join(" ")}</dd>
        </>
      ) : null}
    </dl>
  )
}

export function ReviewAnnotation({
  context,
  heading = "Review context",
  headingLevel = 3,
}: {
  context: ContentReviewContextDto
  heading?: string
  headingLevel?: 3 | 4
}) {
  const Heading = headingLevel === 4 ? "h4" : "h3"
  const id = reviewId(context.reviewReference)

  return (
    <aside
      aria-labelledby={id}
      className="mt-4 border-l-2 border-neutral-300 pl-4 text-neutral-800"
    >
      <Heading
        id={id}
        className="text-sm font-semibold tracking-wide uppercase"
      >
        {heading} — {context.reviewReference}
      </Heading>
      <ReviewDetails context={context} />
    </aside>
  )
}

function ContentLink({
  entry,
}: {
  entry: Extract<ContentReviewEntryDto, { kind: "content" }>
}) {
  if (!entry.link) return null

  const descriptionRoot = `${reviewId(entry.reviewReference)}-link`
  const noteId = entry.link.note ? `${descriptionRoot}-note` : null
  const destinationId =
    entry.link.purpose === "product" ? `${descriptionRoot}-destination` : null
  const describedBy = [noteId, destinationId].filter(Boolean).join(" ")

  return (
    <div className="mt-4">
      <a
        aria-describedby={describedBy || undefined}
        className="rounded-sm font-medium underline decoration-1 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950"
        href={entry.link.href}
        rel="noreferrer"
        target="_blank"
      >
        {entry.link.label}
      </a>
      {entry.link.note ? (
        <p className="mt-2 text-sm" id={noteId ?? undefined}>
          {entry.link.note}
        </p>
      ) : null}
      {entry.link.purpose === "product" ? (
        <p
          className="mt-1 text-sm text-neutral-600"
          id={destinationId ?? undefined}
        >
          Opens the live Teacher Workspace product in a new tab.
        </p>
      ) : null}
    </div>
  )
}

function ReviewEntry({ entry }: { entry: ContentReviewEntryDto }) {
  if (entry.kind === "decision") {
    const id = `${reviewId(entry.reviewReference)}-decision`
    return (
      <aside
        aria-labelledby={id}
        className="border border-neutral-300 p-4"
        data-review-reference={entry.reviewReference}
      >
        <h3 id={id} className="font-semibold">
          {entry.reviewLabel}
        </h3>
        <p className="mt-2 text-sm text-neutral-700">
          Public copy is intentionally omitted until this decision is resolved.
        </p>
        <ReviewDetails context={entry.review} />
      </aside>
    )
  }

  return (
    <div data-review-reference={entry.reviewReference}>
      {entry.label ? (
        <p className="text-sm font-medium tracking-wide text-neutral-600 uppercase">
          {entry.label}
        </p>
      ) : null}
      {entry.heading ? (
        <h3 className="mt-2 text-xl font-semibold">{entry.heading}</h3>
      ) : null}
      {entry.body.map((paragraph) => (
        <p className="mt-3 leading-7" key={paragraph}>
          {paragraph}
        </p>
      ))}
      {entry.capabilityLabel !== undefined ? (
        <p className="mt-3 text-sm text-neutral-700">
          <span className="font-medium">Capability mapping:</span>{" "}
          {entry.capabilityLabel ?? "None — setup moment only"}
        </p>
      ) : null}
      <ContentLink entry={entry} />
      <ReviewAnnotation
        context={entry.review}
        headingLevel={entry.heading ? 4 : 3}
      />
    </div>
  )
}

function EntryCollection({ section }: { section: ContentReviewSectionDto }) {
  const ordered =
    section.kind === "connected-story" || section.kind === "explorer"
  const listed =
    ordered || section.kind === "capabilities" || section.kind === "audiences"

  if (!listed) {
    return (
      <div className="mt-8 space-y-8">
        {section.entries.map((entry) => (
          <ReviewEntry entry={entry} key={entry.reviewReference} />
        ))}
      </div>
    )
  }

  const List = ordered ? "ol" : "ul"
  return (
    <List className="mt-8 space-y-8 pl-6 marker:font-medium">
      {section.entries.map((entry) => (
        <li key={entry.reviewReference}>
          <ReviewEntry entry={entry} />
        </li>
      ))}
    </List>
  )
}

export function ContentReviewSection({
  section,
}: {
  section: ContentReviewSectionDto
}) {
  const headingId = `content-review-${section.kind}`

  return (
    <section
      aria-labelledby={headingId}
      className="border-t border-neutral-300 py-10"
      data-review-reference={section.review.reviewReference}
      data-review-section
    >
      <h2 id={headingId} className="text-2xl font-semibold">
        {sectionHeadings[section.kind]}
      </h2>
      <ReviewAnnotation context={section.review} heading="Section review" />
      <EntryCollection section={section} />
    </section>
  )
}

export function ContentReviewOutline({
  sections,
}: {
  sections: ReadonlyArray<ContentReviewSectionDto>
}) {
  return (
    <>
      {sections.map((section) => (
        <ContentReviewSection key={section.kind} section={section} />
      ))}
    </>
  )
}
