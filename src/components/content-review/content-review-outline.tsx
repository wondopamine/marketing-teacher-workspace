import { ReviewPin, reviewAnnotationBindings } from "./review-annotations"

import type {
  TeacherPreviewAccessSupportSectionDto,
  TeacherPreviewActionDto,
  TeacherPreviewCapabilitiesSectionDto,
  TeacherPreviewCloseSectionDto,
  TeacherPreviewConnectedStorySectionDto,
  TeacherPreviewPromiseSectionDto,
  TeacherPreviewRevealSectionDto,
  TeacherPreviewScreenDto,
  TeacherPreviewSectionDto,
} from "@/content/teacher-preview-document"

function WireframeLabel({ children }: { children: string }) {
  return (
    <span className="inline-flex border border-foreground/30 bg-background px-2.5 py-1 text-xs font-medium tracking-[0.08em] text-muted-foreground">
      {children}
    </span>
  )
}

function InertAction({ action }: { action: TeacherPreviewActionDto | null }) {
  if (!action) return null

  return (
    <div className="mt-7">
      <span
        className="inline-flex min-h-12 items-center justify-center border-2 border-foreground bg-foreground px-6 py-3 font-semibold text-background select-none"
        data-wireframe-action
      >
        {action.label}
      </span>
      {action.note ? (
        <p className="mt-3 text-sm leading-[1.5] text-muted-foreground">
          {action.note}
        </p>
      ) : null}
    </div>
  )
}

function SectionIntro({
  annotationId,
  headingId,
  title,
}: {
  annotationId?: string
  headingId: string
  title: string
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-start gap-3">
        <h2
          id={headingId}
          className="font-heading text-[32px] font-semibold tracking-[-0.025em]"
        >
          {title}
        </h2>
        {annotationId ? <ReviewPin id={annotationId} /> : null}
      </div>
    </div>
  )
}

function ProductScreenFigure({
  annotationId,
  location,
  screen,
}: {
  annotationId: string
  location: string
  screen: TeacherPreviewScreenDto
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
            {screen.breadcrumb.map((item, index) => (
              <li className="flex items-center gap-2" key={item}>
                {index > 0 ? <span aria-hidden>/</span> : null}
                <span
                  className={
                    index === screen.breadcrumb.length - 1
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
        <ReviewPin id={annotationId} />
      </div>
      <div className="overflow-hidden bg-white">
        <img
          alt={screen.alt}
          className="block h-auto w-full"
          decoding="async"
          height="1000"
          loading="lazy"
          src={screen.src}
          width="1600"
        />
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <span>Illustrative Teacher Workspace prototype</span>
        <a
          href={screen.src}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center font-semibold text-foreground underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label={`Open ${screen.breadcrumb.at(-1) ?? "product"} screen at full size`}
        >
          Open full size
        </a>
      </figcaption>
    </figure>
  )
}

function HeroSection({
  section,
}: {
  section: TeacherPreviewPromiseSectionDto
}) {
  return (
    <section
      aria-labelledby="wireframe-hero-heading"
      className="grid gap-12 border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16 2xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] 2xl:items-center"
      data-wireframe-section={section.kind}
    >
      <div>
        {section.eyebrow ? (
          <WireframeLabel>{section.eyebrow}</WireframeLabel>
        ) : null}
        <h1
          id="wireframe-hero-heading"
          className="max-w-[13ch] font-heading text-[32px] leading-tight font-semibold tracking-[-0.035em] sm:text-5xl lg:text-[72px]"
        >
          {section.heading}
        </h1>
        {section.body.map((paragraph) => (
          <p
            className="mt-6 max-w-[42rem] text-lg leading-7 text-muted-foreground"
            key={paragraph}
          >
            {paragraph}
          </p>
        ))}
        <InertAction action={section.action} />
      </div>

      <div data-wireframe-interface-frame="product-view">
        <ProductScreenFigure
          annotationId={reviewAnnotationBindings.heroScreen}
          location="hero-product-view"
          screen={section.screen}
        />
      </div>
    </section>
  )
}

function ConnectedStorySection({
  section,
}: {
  section: TeacherPreviewConnectedStorySectionDto
}) {
  return (
    <section
      aria-labelledby="wireframe-connected-story"
      className="border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <SectionIntro
        annotationId={reviewAnnotationBindings.story}
        headingId="wireframe-connected-story"
        title={section.heading}
      />

      <ol className="mt-12 border-t border-border">
        {section.steps.map((step, index) => (
          <li
            className="grid gap-8 border-b border-border py-10 2xl:grid-cols-[4rem_minmax(0,1fr)_minmax(18rem,0.9fr)] 2xl:items-start"
            key={step.heading ?? step.label ?? `story-${index}`}
          >
            <p className="text-[32px] font-normal text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </p>
            <div>
              {step.label ? (
                <WireframeLabel>{step.label}</WireframeLabel>
              ) : null}
              {step.heading ? (
                <h3 className="mt-4 max-w-2xl font-heading text-2xl leading-tight font-semibold tracking-[-0.02em]">
                  {step.heading}
                </h3>
              ) : null}
              {step.body.map((paragraph) => (
                <p
                  className="mt-4 max-w-2xl leading-6 text-muted-foreground"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <ProductScreenFigure
              annotationId={reviewAnnotationBindings.storyScreens[index]}
              location={`story-step-${index + 1}`}
              screen={step.screen}
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
  section: TeacherPreviewRevealSectionDto
}) {
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
            {section.heading}
          </h2>
          {section.body.map((paragraph) => (
            <p
              className="mt-6 max-w-3xl text-lg leading-7 text-background/75"
              key={paragraph}
            >
              {paragraph}
            </p>
          ))}
        </div>
        {section.asides.map((aside, index) => (
          <div
            className="border border-background/30 p-5"
            key={aside.body[0] ?? `reveal-aside-${index}`}
          >
            {aside.body.map((paragraph) => (
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

function CapabilitiesSection({
  section,
}: {
  section: TeacherPreviewCapabilitiesSectionDto
}) {
  return (
    <section
      aria-labelledby="wireframe-capabilities"
      className="border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <SectionIntro
        annotationId={reviewAnnotationBindings.capabilities}
        headingId="wireframe-capabilities"
        title={section.heading}
      />

      <ol className="mt-12 border-t border-foreground/30">
        {section.items.map((item, index) => (
          <li
            className="grid gap-5 border-b border-border py-8 md:grid-cols-[3rem_minmax(10rem,0.55fr)_minmax(0,1.45fr)]"
            key={item.label ?? item.heading ?? `capability-${index}`}
          >
            <p className="text-sm text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="text-lg font-semibold">{item.label}</p>
            <div>
              {item.heading ? (
                <h3 className="font-heading text-xl leading-snug font-semibold">
                  {item.heading}
                </h3>
              ) : null}
              {item.body.map((paragraph) => (
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

function AccessSupportSection({
  section,
}: {
  section: TeacherPreviewAccessSupportSectionDto
}) {
  return (
    <section
      aria-labelledby="wireframe-access-support"
      className="border-b border-border bg-muted px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <SectionIntro
        annotationId={reviewAnnotationBindings.accessSupport}
        headingId="wireframe-access-support"
        title={section.heading}
      />

      <div className="mt-12 max-w-2xl">
        <div>
          <h3 className="font-heading text-xl font-semibold">
            {section.accessHeading}
          </h3>
          <dl className="mt-6 grid gap-2 border-y border-foreground/30 py-5 sm:grid-cols-[8rem_1fr]">
            <dt className="text-sm font-medium text-muted-foreground">
              {section.methodLabel}
            </dt>
            <dd className="font-semibold">{section.method}</dd>
          </dl>
          <p className="mt-3 text-sm leading-[1.5] text-muted-foreground">
            {section.accountNote}
          </p>
        </div>
      </div>
    </section>
  )
}

function CloseSection({ section }: { section: TeacherPreviewCloseSectionDto }) {
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
        {section.heading}
      </h2>
      {section.body.map((paragraph) => (
        <p
          className="mx-auto mt-6 max-w-2xl text-lg leading-7 text-muted-foreground"
          key={paragraph}
        >
          {paragraph}
        </p>
      ))}
      <InertAction action={section.action} />
    </section>
  )
}

export function ContentReviewSection({
  section,
}: {
  section: TeacherPreviewSectionDto
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
    case "close":
      return <CloseSection section={section} />
    case "access-support":
      return <AccessSupportSection section={section} />
  }
}

export function ContentReviewOutline({
  sections,
}: {
  sections: ReadonlyArray<TeacherPreviewSectionDto>
}) {
  return (
    <>
      {sections.map((section) => (
        <ContentReviewSection key={section.kind} section={section} />
      ))}
    </>
  )
}
