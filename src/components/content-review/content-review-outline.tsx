import { contentReviewInterfaceDescriptions } from "./content-review-interface-descriptions"
import type { ContentReviewInterfaceDescription } from "./content-review-interface-descriptions"
import type {
  ContentReviewWireframeAppendixDto,
  ContentReviewWireframeEntryDto,
  ContentReviewWireframeSectionDto,
} from "@/content/landing-v2-review.types"

type ContentEntry = Extract<ContentReviewWireframeEntryDto, { kind: "content" }>
type DecisionEntry = Extract<
  ContentReviewWireframeEntryDto,
  { kind: "decision" }
>

function contentEntries(
  section: ContentReviewWireframeSectionDto
): ReadonlyArray<ContentEntry> {
  return section.entries.filter(
    (entry): entry is ContentEntry => entry.kind === "content"
  )
}

function decisionEntries(
  section: ContentReviewWireframeSectionDto
): ReadonlyArray<DecisionEntry> {
  return section.entries.filter(
    (entry): entry is DecisionEntry => entry.kind === "decision"
  )
}

function WireframeLabel({ children }: { children: string }) {
  return (
    <span className="inline-flex border border-foreground/30 bg-background px-2.5 py-1 text-xs font-medium tracking-[0.08em] text-muted-foreground">
      {children}
    </span>
  )
}

function InertAction({ entry }: { entry: ContentEntry | undefined }) {
  if (!entry?.action) return null

  return (
    <div className="mt-7">
      <span
        className="inline-flex min-h-12 items-center justify-center border-2 border-foreground bg-foreground px-6 py-3 font-semibold text-background select-none"
        data-wireframe-action
      >
        {entry.action.label}
      </span>
      {entry.action.note ? (
        <p className="mt-3 text-sm leading-[1.5] text-muted-foreground">
          {entry.action.note}
        </p>
      ) : null}
    </div>
  )
}

function PendingSlot({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-foreground/40 bg-background p-5">
      <WireframeLabel>Copy pending</WireframeLabel>
      <p className="mt-3 font-medium text-foreground">{label}</p>
      <p className="mt-2 text-sm leading-[1.5] text-muted-foreground">
        This space is intentionally reserved for PM and reviewer input.
      </p>
    </div>
  )
}

function InterfaceDescription({
  className = "border border-border bg-background p-5",
  description,
  headingLevel,
  location,
}: {
  className?: string
  description: ContentReviewInterfaceDescription
  headingLevel: 2 | 4
  location: string
}) {
  const Heading = headingLevel === 2 ? "h2" : "h4"

  return (
    <div
      className={className}
      data-interface-description
      data-wireframe-interface={location}
    >
      <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground">
        Proposed interface
      </p>
      <Heading className="mt-3 font-heading text-lg leading-snug font-semibold">
        {description.heading}
      </Heading>
      <p className="mt-3 max-w-[72ch] text-sm leading-[1.5] text-muted-foreground">
        {description.body}
      </p>
      <ul className="mt-4 max-w-[72ch] border-t border-border pt-2 text-sm text-foreground">
        {description.keyElements.map((element) => (
          <li
            className="border-b border-border py-2 last:border-b-0"
            key={element}
          >
            {element}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProductFrame({
  description,
}: {
  description: ContentReviewInterfaceDescription
}) {
  return (
    <div
      className="border-2 border-foreground/30 bg-background p-3"
      data-wireframe-interface-frame="product-view"
    >
      <div
        aria-hidden="true"
        className="flex items-center justify-between border-b border-border pb-3"
      >
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/50" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <span className="text-xs tracking-[0.12em] text-muted-foreground">
          Teacher Workspace
        </span>
      </div>
      <InterfaceDescription
        className="pt-5"
        description={description}
        headingLevel={2}
        location="hero-product-view"
      />
    </div>
  )
}

function HeroSection({
  section,
}: {
  section: ContentReviewWireframeSectionDto
}) {
  const entries = contentEntries(section)
  const copy = entries.find((entry) => entry.heading)
  const action = entries.find((entry) => entry.action?.purpose === "product")

  if (!copy?.heading) return null

  return (
    <section
      aria-labelledby="wireframe-hero-heading"
      className="grid gap-12 border-b border-border px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] lg:items-center lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div>
        {copy.label ? <WireframeLabel>{copy.label}</WireframeLabel> : null}
        <h1
          id="wireframe-hero-heading"
          className="max-w-[13ch] font-heading text-[32px] leading-tight font-semibold tracking-[-0.035em] sm:text-5xl lg:text-[72px]"
        >
          {copy.heading}
        </h1>
        {copy.body.map((paragraph) => (
          <p
            className="mt-6 max-w-[42rem] text-lg leading-7 text-muted-foreground"
            key={paragraph}
          >
            {paragraph}
          </p>
        ))}
        <InertAction entry={action} />
      </div>

      <ProductFrame description={contentReviewInterfaceDescriptions.hero} />
    </section>
  )
}

function ConnectedStorySection({
  section,
}: {
  section: ContentReviewWireframeSectionDto
}) {
  const entries = contentEntries(section)

  return (
    <section
      aria-labelledby="wireframe-connected-story"
      className="border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="max-w-3xl">
        <WireframeLabel>Story flow</WireframeLabel>
        <h2
          id="wireframe-connected-story"
          className="mt-4 font-heading text-[32px] font-semibold tracking-[-0.025em]"
        >
          A connected positive-growth story
        </h2>
        <p className="mt-4 max-w-2xl leading-6 text-muted-foreground">
          The landing page follows one constructive moment from observation to
          family communication and the student record.
        </p>
      </div>

      <ol className="mt-12 border-t border-border">
        {entries.map((entry, index) => (
          <li
            className="grid gap-8 border-b border-border py-10 lg:grid-cols-[4rem_minmax(0,1fr)_minmax(18rem,0.9fr)] lg:items-start"
            key={entry.heading ?? entry.label ?? `story-${index}`}
          >
            <p className="text-[32px] font-normal text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </p>
            <div>
              {entry.label ? (
                <WireframeLabel>{entry.label}</WireframeLabel>
              ) : null}
              {entry.heading ? (
                <h3 className="mt-4 max-w-2xl font-heading text-2xl leading-tight font-semibold tracking-[-0.02em]">
                  {entry.heading}
                </h3>
              ) : null}
              {entry.body.map((paragraph) => (
                <p
                  className="mt-4 max-w-2xl leading-6 text-muted-foreground"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
              {entry.capabilityLabel ? (
                <p className="mt-5 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Product capability:
                  </span>{" "}
                  {entry.capabilityLabel}
                </p>
              ) : null}
            </div>
            <InterfaceDescription
              description={contentReviewInterfaceDescriptions.story[index]}
              headingLevel={4}
              location={`story-step-${index + 1}`}
            />
          </li>
        ))}
      </ol>
    </section>
  )
}

function RevealSection({
  section,
}: {
  section: ContentReviewWireframeSectionDto
}) {
  const copy = contentEntries(section).find((entry) => entry.heading)
  const decisions = decisionEntries(section)

  if (!copy?.heading) return null

  return (
    <section
      aria-labelledby="wireframe-reveal"
      className="border-b border-border bg-foreground px-6 py-16 text-background md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] md:items-end">
        <div>
          <p className="text-xs font-medium tracking-[0.12em] text-background/60">
            Product reveal
          </p>
          <h2
            id="wireframe-reveal"
            className="mt-4 font-heading text-[32px] font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            {copy.heading}
          </h2>
          {copy.body.map((paragraph) => (
            <p
              className="mt-6 max-w-3xl text-lg leading-7 text-background/75"
              key={paragraph}
            >
              {paragraph}
            </p>
          ))}
        </div>
        {decisions.map((entry) => (
          <div
            className="border border-dashed border-background/30 p-5"
            key={entry.reviewLabel}
          >
            <p className="text-xs font-medium tracking-[0.1em] text-background/60">
              Copy pending
            </p>
            <p className="mt-3 text-sm text-background/85">
              {entry.reviewLabel}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CapabilitiesSection({
  section,
}: {
  section: ContentReviewWireframeSectionDto
}) {
  const entries = contentEntries(section)

  return (
    <section
      aria-labelledby="wireframe-capabilities"
      className="border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="max-w-3xl">
        <WireframeLabel>Product capabilities</WireframeLabel>
        <h2
          id="wireframe-capabilities"
          className="mt-4 font-heading text-[32px] font-semibold tracking-[-0.025em]"
        >
          What Teacher Workspace brings together
        </h2>
      </div>

      <ol className="mt-12 border-t border-foreground/30">
        {entries.map((entry, index) => (
          <li
            className="grid gap-5 border-b border-border py-8 md:grid-cols-[3rem_minmax(10rem,0.55fr)_minmax(0,1.45fr)]"
            key={entry.label ?? entry.heading ?? `capability-${index}`}
          >
            <p className="text-sm text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="text-lg font-semibold">{entry.label}</p>
            <div>
              {entry.heading ? (
                <h3 className="font-heading text-xl leading-snug font-semibold">
                  {entry.heading}
                </h3>
              ) : null}
              {entry.body.map((paragraph) => (
                <p
                  className="mt-3 max-w-[72ch] leading-6 text-muted-foreground"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function ExplorerSection({
  section,
}: {
  section: ContentReviewWireframeSectionDto
}) {
  const entries = contentEntries(section)

  return (
    <section
      aria-labelledby="wireframe-explorer"
      className="border-b border-border bg-muted px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <WireframeLabel>Static walkthrough</WireframeLabel>
          <WireframeLabel>Placement to confirm</WireframeLabel>
        </div>
        <h2
          id="wireframe-explorer"
          className="mt-4 font-heading text-[32px] font-semibold tracking-[-0.025em]"
        >
          Explore the flow in three steps
        </h2>
        <p className="mt-4 max-w-[72ch] leading-6 text-muted-foreground">
          This wireframe shows the sequence only. It is not an interactive
          product demo.
        </p>
      </div>

      <ol className="mt-12 border-2 border-foreground/30 bg-background lg:grid lg:grid-cols-3">
        {entries.map((entry, index) => (
          <li
            className="border-b border-border p-6 last:border-b-0 lg:border-r lg:border-b-0 lg:p-8 lg:last:border-r-0"
            key={entry.heading ?? entry.label ?? `explorer-${index}`}
          >
            <p className="text-sm font-medium text-muted-foreground">
              Step {index + 1}
            </p>
            {entry.label ? (
              <p className="mt-5 text-sm font-semibold tracking-[0.06em]">
                {entry.label}
              </p>
            ) : null}
            {entry.heading ? (
              <h3 className="mt-3 font-heading text-xl leading-snug font-semibold">
                {entry.heading}
              </h3>
            ) : null}
            {entry.body.map((paragraph) => (
              <p
                className="mt-4 leading-6 text-muted-foreground"
                key={paragraph}
              >
                {paragraph}
              </p>
            ))}
            <InterfaceDescription
              className="mt-8 border-t border-border pt-5"
              description={contentReviewInterfaceDescriptions.explorer[index]}
              headingLevel={4}
              location={`explorer-step-${index + 1}`}
            />
          </li>
        ))}
      </ol>
    </section>
  )
}

function audienceLabel(reviewLabel: string): string {
  return reviewLabel.replace(/:\s*question and answer$/i, "")
}

function AudiencesSection({
  section,
}: {
  section: ContentReviewWireframeSectionDto
}) {
  const content = contentEntries(section)
  const decisions = decisionEntries(section)

  return (
    <section
      aria-labelledby="wireframe-audiences"
      className="border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="max-w-3xl">
        <WireframeLabel>Audience</WireframeLabel>
        <h2
          id="wireframe-audiences"
          className="mt-4 font-heading text-[32px] font-semibold tracking-[-0.025em]"
        >
          Intended audiences
        </h2>
      </div>

      <ul className="mt-12 border-y border-foreground/30 md:grid md:grid-cols-3">
        {content.map((entry) => (
          <li
            className="border-b border-border py-7 last:border-b-0 md:border-r md:border-b-0 md:px-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
            key={entry.label ?? entry.heading}
          >
            <h3 className="font-heading text-xl font-semibold">
              {entry.label}
            </h3>
            {entry.heading ? <p className="mt-4">{entry.heading}</p> : null}
            {entry.body.map((paragraph) => (
              <p
                className="mt-3 max-w-[72ch] leading-6 text-muted-foreground"
                key={paragraph}
              >
                {paragraph}
              </p>
            ))}
          </li>
        ))}
        {decisions.map((entry) => (
          <li
            className="border-b border-border py-7 last:border-b-0 md:border-r md:border-b-0 md:px-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
            key={entry.reviewLabel}
          >
            <h3 className="font-heading text-xl font-semibold">
              {audienceLabel(entry.reviewLabel)}
            </h3>
            <p className="mt-4 max-w-[72ch] text-sm leading-[1.5] text-muted-foreground">
              PM to confirm the question and approved answer for this audience.
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProofSection({
  section,
}: {
  section: ContentReviewWireframeSectionDto
}) {
  const content = contentEntries(section)
  const decisions = decisionEntries(section)

  return (
    <section
      aria-labelledby="wireframe-proof"
      className="border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="grid gap-10 md:grid-cols-[minmax(0,0.7fr)_minmax(20rem,1.3fr)]">
        <div>
          <WireframeLabel>Publication-dependent</WireframeLabel>
          <h2
            id="wireframe-proof"
            className="mt-4 font-heading text-[32px] font-semibold tracking-[-0.025em]"
          >
            Proof
          </h2>
          <p className="mt-4 leading-6 text-muted-foreground">
            No testimonial or attribution is shown in this wireframe without
            publication approval.
          </p>
        </div>
        <div className="space-y-5">
          {content.map((entry) => (
            <div key={entry.heading ?? entry.label}>
              {entry.heading ? (
                <h3 className="font-heading text-xl font-semibold">
                  {entry.heading}
                </h3>
              ) : null}
              {entry.body.map((paragraph) => (
                <p className="mt-3 leading-6" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
          {decisions.map((entry) => (
            <PendingSlot key={entry.reviewLabel} label={entry.reviewLabel} />
          ))}
        </div>
      </div>
    </section>
  )
}

function AccessSupportSection({
  appendix,
  section,
}: {
  appendix: ContentReviewWireframeAppendixDto
  section: ContentReviewWireframeSectionDto
}) {
  const decisions = decisionEntries(section)

  return (
    <section
      aria-labelledby="wireframe-access-support"
      className="border-b border-border bg-muted px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="max-w-3xl">
        <WireframeLabel>Access</WireframeLabel>
        <h2
          id="wireframe-access-support"
          className="mt-4 font-heading text-[32px] font-semibold tracking-[-0.025em]"
        >
          Access and support
        </h2>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <h3 className="font-heading text-xl font-semibold">Teacher access</h3>
          <dl className="mt-6 grid gap-2 border-y border-foreground/30 py-5 sm:grid-cols-[8rem_1fr]">
            <dt className="text-sm font-medium text-muted-foreground">
              Access method
            </dt>
            <dd className="font-semibold">{appendix.access.label}</dd>
          </dl>
          <p className="mt-3 text-sm leading-[1.5] text-muted-foreground">
            {appendix.access.accountNote}
          </p>
          <p className="mt-5 border-l-2 border-foreground/30 pl-4 text-sm leading-[1.5] text-muted-foreground">
            {appendix.access.implementationBoundary}
          </p>
        </div>
        <div>
          <h3 className="font-heading text-xl font-semibold">Support</h3>
          <p className="mt-4 leading-6 text-muted-foreground">
            {appendix.support.summary}
          </p>
          <div className="mt-6 space-y-4">
            {decisions.map((entry) => (
              <PendingSlot key={entry.reviewLabel} label={entry.reviewLabel} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CloseSection({
  section,
}: {
  section: ContentReviewWireframeSectionDto
}) {
  const entries = contentEntries(section)
  const copy = entries.find((entry) => entry.heading)
  const action = entries.find((entry) => entry.action?.purpose === "product")

  if (!copy?.heading) return null

  return (
    <section
      aria-labelledby="wireframe-close"
      className="px-6 py-20 text-center md:px-10 md:py-28 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <h2
        id="wireframe-close"
        className="mx-auto max-w-4xl font-heading text-[32px] font-semibold tracking-[-0.035em] sm:text-5xl"
      >
        {copy.heading}
      </h2>
      {copy.body.map((paragraph) => (
        <p
          className="mx-auto mt-6 max-w-2xl text-lg leading-7 text-muted-foreground"
          key={paragraph}
        >
          {paragraph}
        </p>
      ))}
      <InertAction entry={action} />
    </section>
  )
}

export function ContentReviewSection({
  appendix,
  section,
}: {
  appendix: ContentReviewWireframeAppendixDto
  section: ContentReviewWireframeSectionDto
}) {
  switch (section.kind) {
    case "promise":
      return <HeroSection section={section} />
    case "connected-story":
      return <ConnectedStorySection section={section} />
    case "reveal":
      return <RevealSection section={section} />
    case "capabilities":
      return <CapabilitiesSection section={section} />
    case "explorer":
      return <ExplorerSection section={section} />
    case "audiences":
      return <AudiencesSection section={section} />
    case "proof":
      return <ProofSection section={section} />
    case "access-support":
      return <AccessSupportSection appendix={appendix} section={section} />
    case "close":
      return <CloseSection section={section} />
    case "footer-feedback":
      return null
  }
}

export function ContentReviewOutline({
  appendix,
  sections,
}: {
  appendix: ContentReviewWireframeAppendixDto
  sections: ReadonlyArray<ContentReviewWireframeSectionDto>
}) {
  return (
    <>
      {sections.map((section) => (
        <ContentReviewSection
          appendix={appendix}
          key={section.kind}
          section={section}
        />
      ))}
    </>
  )
}
