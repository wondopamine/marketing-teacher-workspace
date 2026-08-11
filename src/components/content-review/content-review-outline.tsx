import { contentReviewChrome } from "./content-review-chrome"
import { ReviewPin, productScreenReferences } from "./review-annotations"

import type { SectionChrome } from "./content-review-chrome"
import type { ProductScreenReference } from "./review-annotations"
import type {
  ContentReviewWireframeAppendixDto,
  ContentReviewWireframeEntryDto,
  ContentReviewWireframeSectionDto,
} from "@/content/landing-v2-review.types"

type ContentEntry = Extract<ContentReviewWireframeEntryDto, { kind: "content" }>
type SectionProps = {
  section: ContentReviewWireframeSectionDto
}

const chrome = contentReviewChrome

function contentEntries(
  section: ContentReviewWireframeSectionDto
): ReadonlyArray<ContentEntry> {
  return section.entries.filter(
    (entry): entry is ContentEntry => entry.kind === "content"
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

function SectionIntro({
  annotationId,
  chrome: sectionChrome,
  headingId,
}: {
  annotationId?: string
  chrome: SectionChrome
  headingId: string
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-start gap-3">
        <h2
          id={headingId}
          className="font-heading text-[32px] font-semibold tracking-[-0.025em]"
        >
          {sectionChrome.title}
        </h2>
        {annotationId ? <ReviewPin id={annotationId} /> : null}
      </div>
    </div>
  )
}

function ProductScreenFigure({
  location,
  reference,
}: {
  location: string
  reference: ProductScreenReference
}) {
  return (
    <figure
      className="relative min-w-0 border border-border bg-background"
      data-product-screen
      data-wireframe-interface={location}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <nav aria-label="Product location" className="min-w-0">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {reference.breadcrumb.map((item, index) => (
              <li className="flex items-center gap-2" key={item}>
                {index > 0 ? <span aria-hidden>/</span> : null}
                <span
                  className={
                    index === reference.breadcrumb.length - 1
                      ? "font-semibold text-foreground"
                      : undefined
                  }
                >
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </nav>
        <ReviewPin id={reference.annotationId} />
      </div>
      <div className="overflow-hidden bg-white">
        <img
          alt={reference.alt}
          className="block h-auto w-full"
          decoding="async"
          height="1000"
          loading="lazy"
          src={reference.image}
          width="1600"
        />
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <span>Illustrative Teacher Workspace prototype</span>
        <a
          href={reference.image}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center font-semibold text-foreground underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label={`Open ${reference.breadcrumb.at(-1) ?? "product"} screen at full size`}
        >
          Open full size
        </a>
      </figcaption>
    </figure>
  )
}

function ProductFrame() {
  return (
    <div data-wireframe-interface-frame="product-view">
      <ProductScreenFigure
        location="hero-product-view"
        reference={productScreenReferences.hero}
      />
    </div>
  )
}

function HeroSection({ section }: SectionProps) {
  const entries = contentEntries(section)
  const copy = entries.find((entry) => entry.heading)
  const action = entries.find((entry) => entry.action?.purpose === "product")

  if (!copy?.heading) return null

  return (
    <section
      aria-labelledby="wireframe-hero-heading"
      className="grid gap-12 border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16 2xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] 2xl:items-center"
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

      <ProductFrame />
    </section>
  )
}

function ConnectedStorySection({ section }: SectionProps) {
  const entries = contentEntries(section)

  return (
    <section
      aria-labelledby="wireframe-connected-story"
      className="border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <SectionIntro
        annotationId="story-overview"
        chrome={chrome.story}
        headingId="wireframe-connected-story"
      />

      <ol className="mt-12 border-t border-border">
        {entries.map((entry, index) => (
          <li
            className="grid gap-8 border-b border-border py-10 2xl:grid-cols-[4rem_minmax(0,1fr)_minmax(18rem,0.9fr)] 2xl:items-start"
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
            </div>
            {productScreenReferences.story[index] ? (
              <ProductScreenFigure
                location={`story-step-${index + 1}`}
                reference={productScreenReferences.story[index]}
              />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}

function RevealSection({ section }: SectionProps) {
  const entries = contentEntries(section)
  const copy = entries.find((entry) => entry.heading)
  // A resolved slot (the GA launch line) projects as copy without a heading;
  // it takes the place of its former pending box beside the thesis.
  const asides = entries.filter((entry) => entry !== copy)

  if (!copy?.heading) return null

  return (
    <section
      aria-labelledby="wireframe-reveal"
      className="border-b border-border bg-foreground px-6 py-16 text-background md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] md:items-end">
        <div>
          <h2
            id="wireframe-reveal"
            className="font-heading text-[32px] font-semibold tracking-[-0.035em] sm:text-5xl"
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
        {asides.map((entry, index) => (
          <div
            className="border border-background/30 p-5"
            key={entry.label ?? `reveal-aside-${index}`}
          >
            {entry.body.map((paragraph) => (
              <p className="text-sm text-background/85" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

function CapabilitiesSection({ section }: SectionProps) {
  const entries = contentEntries(section)

  return (
    <section
      aria-labelledby="wireframe-capabilities"
      className="border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <SectionIntro
        annotationId="capabilities-overview"
        chrome={chrome.capabilities}
        headingId="wireframe-capabilities"
      />

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

function AudiencesSection({ section }: SectionProps) {
  const content = contentEntries(section)

  if (content.length === 0) return null

  return (
    <section
      aria-labelledby="wireframe-audiences"
      className="border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <SectionIntro
        annotationId="audiences-overview"
        chrome={chrome.audiences}
        headingId="wireframe-audiences"
      />

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
      </ul>
    </section>
  )
}

function ProofSection({ section }: SectionProps) {
  const content = contentEntries(section)

  if (content.length === 0) return null

  return (
    <section
      aria-labelledby="wireframe-proof"
      className="border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="grid gap-10 md:grid-cols-[minmax(0,0.7fr)_minmax(20rem,1.3fr)]">
        <div>
          <div className="flex items-start gap-3">
            <h2
              id="wireframe-proof"
              className="font-heading text-[32px] font-semibold tracking-[-0.025em]"
            >
              {chrome.proof.title}
            </h2>
            <ReviewPin id="proof-overview" />
          </div>
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
        </div>
      </div>
    </section>
  )
}

function AccessSupportSection({
  appendix,
  section,
}: SectionProps & { appendix: ContentReviewWireframeAppendixDto }) {
  const accessSupport = chrome.accessSupport

  return (
    <section
      aria-labelledby="wireframe-access-support"
      className="border-b border-border bg-muted px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <SectionIntro
        annotationId="access-support-overview"
        chrome={accessSupport}
        headingId="wireframe-access-support"
      />

      <div className="mt-12 max-w-2xl">
        <div>
          <h3 className="font-heading text-xl font-semibold">
            {accessSupport.accessHeading}
          </h3>
          <dl className="mt-6 grid gap-2 border-y border-foreground/30 py-5 sm:grid-cols-[8rem_1fr]">
            <dt className="text-sm font-medium text-muted-foreground">
              {accessSupport.accessMethodLabel}
            </dt>
            <dd className="font-semibold">{appendix.access.label}</dd>
          </dl>
          <p className="mt-3 text-sm leading-[1.5] text-muted-foreground">
            {appendix.access.accountNote}
          </p>
        </div>
      </div>
    </section>
  )
}

function CloseSection({ section }: SectionProps) {
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
  ...props
}: SectionProps & { appendix: ContentReviewWireframeAppendixDto }) {
  switch (props.section.kind) {
    case "promise":
      return <HeroSection {...props} />
    case "connected-story":
      return <ConnectedStorySection {...props} />
    case "reveal":
      return <RevealSection {...props} />
    case "capabilities":
      return <CapabilitiesSection {...props} />
    case "audiences":
      return <AudiencesSection {...props} />
    case "proof":
      return <ProofSection {...props} />
    case "close":
      return <CloseSection {...props} />
    case "access-support":
      return <AccessSupportSection appendix={appendix} {...props} />
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
