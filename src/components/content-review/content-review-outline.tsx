import { ReviewPin, reviewAnnotationBindings } from "./review-annotations"
import { EditableCopy } from "./editor/editable-copy"

import type {
  ContentReviewEditAdapter,
  ContentReviewSectionReviewTargets,
} from "./editor/content-review-edit-adapter"
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

type SectionTextChange = (
  fieldPath: ReadonlyArray<string | number>,
  value: string
) => void

function WireframeLabel({
  children,
  label,
  onChange,
}: {
  children: string
  label?: string
  onChange?: (value: string) => void
}) {
  return (
    <EditableCopy
      as="span"
      value={children}
      label={label ?? "Edit label"}
      onChange={onChange}
      className="inline-flex border border-foreground/30 bg-background px-2.5 py-1 text-xs font-medium tracking-[0.08em] text-muted-foreground"
    />
  )
}

function InertAction({
  action,
  onChange,
}: {
  action: TeacherPreviewActionDto | null
  onChange?: SectionTextChange
}) {
  if (!action) return null

  return (
    <div className="mt-7">
      <EditableCopy
        as="span"
        value={action.label}
        label="Edit action label"
        onChange={
          onChange ? (value) => onChange(["action", "label"], value) : undefined
        }
        className="inline-flex min-h-12 items-center justify-center border-2 border-foreground bg-foreground px-6 py-3 font-semibold text-background select-none"
        data-wireframe-action
      />
      {action.note ? (
        <EditableCopy
          as="p"
          value={action.note}
          label="Edit action note"
          onChange={
            onChange
              ? (value) => onChange(["action", "note"], value)
              : undefined
          }
          className="mt-3 text-sm leading-[1.5] text-muted-foreground"
        />
      ) : null}
    </div>
  )
}

function SectionIntro({
  annotationId,
  headingId,
  title,
  onTitleChange,
}: {
  annotationId?: string
  headingId: string
  title: string
  onTitleChange?: (value: string) => void
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-start gap-3">
        <EditableCopy
          as="h2"
          id={headingId}
          value={title}
          label={`Edit ${title} heading`}
          onChange={onTitleChange}
          className="font-heading text-[32px] font-semibold tracking-[-0.025em]"
        />
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
  annotationId?: string
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
        {annotationId ? <ReviewPin id={annotationId} /> : null}
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
  headingId,
  section,
  onChange,
  reviewTargets,
}: {
  headingId: string
  section: TeacherPreviewPromiseSectionDto
  onChange?: SectionTextChange
  reviewTargets?: ContentReviewSectionReviewTargets | null
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="grid gap-12 border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16 2xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] 2xl:items-center"
      data-wireframe-section={section.kind}
    >
      <div>
        {section.eyebrow ? (
          <WireframeLabel
            label="Edit opening label"
            onChange={
              onChange ? (value) => onChange(["eyebrow"], value) : undefined
            }
          >
            {section.eyebrow}
          </WireframeLabel>
        ) : null}
        <div className="flex items-start gap-3">
          <EditableCopy
            as="h1"
            id={headingId}
            value={section.heading}
            label="Edit opening heading"
            onChange={
              onChange ? (value) => onChange(["heading"], value) : undefined
            }
            className="max-w-[13ch] font-heading text-[32px] leading-tight font-semibold tracking-[-0.035em] sm:text-5xl lg:text-[72px]"
          />
          {reviewTargets?.sectionId ? (
            <ReviewPin id={reviewTargets.sectionId} />
          ) : null}
        </div>
        {section.body.map((paragraph, index) => (
          <EditableCopy
            as="p"
            value={paragraph}
            label={`Edit opening paragraph ${index + 1}`}
            onChange={
              onChange ? (value) => onChange(["body", index], value) : undefined
            }
            className="mt-6 max-w-[42rem] text-lg leading-7 text-muted-foreground"
            key={index}
          />
        ))}
        <InertAction action={section.action} onChange={onChange} />
      </div>

      <div data-wireframe-interface-frame="product-view">
        <ProductScreenFigure
          annotationId={
            reviewTargets === null
              ? undefined
              : reviewTargets?.screenIds[0] ?? reviewAnnotationBindings.heroScreen
          }
          location="hero-product-view"
          screen={section.screen}
        />
      </div>
    </section>
  )
}

function ConnectedStorySection({
  headingId,
  section,
  onChange,
  reviewTargets,
}: {
  headingId: string
  section: TeacherPreviewConnectedStorySectionDto
  onChange?: SectionTextChange
  reviewTargets?: ContentReviewSectionReviewTargets | null
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <SectionIntro
        annotationId={
          reviewTargets === null
            ? undefined
            : reviewTargets?.sectionId ?? reviewAnnotationBindings.story
        }
        headingId={headingId}
        title={section.heading}
        onTitleChange={
          onChange ? (value) => onChange(["heading"], value) : undefined
        }
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
                <WireframeLabel
                  label={`Edit story step ${index + 1} label`}
                  onChange={
                    onChange
                      ? (value) => onChange(["steps", index, "label"], value)
                      : undefined
                  }
                >
                  {step.label}
                </WireframeLabel>
              ) : null}
              {step.heading ? (
                <EditableCopy
                  as="h3"
                  value={step.heading}
                  label={`Edit story step ${index + 1} heading`}
                  onChange={
                    onChange
                      ? (value) => onChange(["steps", index, "heading"], value)
                      : undefined
                  }
                  className="mt-4 max-w-2xl font-heading text-2xl leading-tight font-semibold tracking-[-0.02em]"
                />
              ) : null}
              {step.body.map((paragraph, paragraphIndex) => (
                <EditableCopy
                  as="p"
                  value={paragraph}
                  label={`Edit story step ${index + 1} paragraph ${paragraphIndex + 1}`}
                  onChange={
                    onChange
                      ? (value) =>
                          onChange(
                            ["steps", index, "body", paragraphIndex],
                            value
                          )
                      : undefined
                  }
                  className="mt-4 max-w-2xl leading-6 text-muted-foreground"
                  key={paragraphIndex}
                />
              ))}
            </div>
            <ProductScreenFigure
              annotationId={
                reviewTargets === null
                  ? undefined
                  : reviewTargets?.screenIds[index] ??
                    reviewAnnotationBindings.storyScreens[index]
              }
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
  headingId,
  section,
  onChange,
  reviewTargets,
}: {
  headingId: string
  section: TeacherPreviewRevealSectionDto
  onChange?: SectionTextChange
  reviewTargets?: ContentReviewSectionReviewTargets | null
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="border-b border-border bg-foreground px-6 py-16 text-background md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] md:items-end">
        <div>
          <div className="flex items-start gap-3">
            <EditableCopy
              as="h2"
              id={headingId}
              value={section.heading}
              label="Edit reveal heading"
              onChange={
                onChange ? (value) => onChange(["heading"], value) : undefined
              }
              className="font-heading text-[32px] font-semibold tracking-[-0.035em] sm:text-5xl"
            />
            {reviewTargets?.sectionId ? (
              <ReviewPin id={reviewTargets.sectionId} />
            ) : null}
          </div>
          {section.body.map((paragraph, index) => (
            <EditableCopy
              as="p"
              value={paragraph}
              label={`Edit reveal paragraph ${index + 1}`}
              onChange={
                onChange
                  ? (value) => onChange(["body", index], value)
                  : undefined
              }
              className="mt-6 max-w-3xl text-lg leading-7 text-background/75"
              key={index}
            />
          ))}
        </div>
        {section.asides.map((aside, index) => (
          <div
            className="border border-background/30 p-5"
            key={aside.body[0] ?? `reveal-aside-${index}`}
          >
            {aside.body.map((paragraph, paragraphIndex) => (
              <EditableCopy
                as="p"
                value={paragraph}
                label={`Edit reveal note ${index + 1}`}
                onChange={
                  onChange
                    ? (value) =>
                        onChange(
                          ["asides", index, "body", paragraphIndex],
                          value
                        )
                    : undefined
                }
                className="text-sm text-background/85"
                key={paragraphIndex}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

function CapabilitiesSection({
  headingId,
  section,
  onChange,
  reviewTargets,
}: {
  headingId: string
  section: TeacherPreviewCapabilitiesSectionDto
  onChange?: SectionTextChange
  reviewTargets?: ContentReviewSectionReviewTargets | null
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="border-b border-border px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <SectionIntro
        annotationId={
          reviewTargets === null
            ? undefined
            : reviewTargets?.sectionId ??
              reviewAnnotationBindings.capabilities
        }
        headingId={headingId}
        title={section.heading}
        onTitleChange={
          onChange ? (value) => onChange(["heading"], value) : undefined
        }
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
            {item.label ? (
              <EditableCopy
                as="p"
                value={item.label}
                label={`Edit capability ${index + 1} label`}
                onChange={
                  onChange
                    ? (value) => onChange(["items", index, "label"], value)
                    : undefined
                }
                className="text-lg font-semibold"
              />
            ) : null}
            <div>
              {item.heading ? (
                <EditableCopy
                  as="h3"
                  value={item.heading}
                  label={`Edit capability ${index + 1} heading`}
                  onChange={
                    onChange
                      ? (value) => onChange(["items", index, "heading"], value)
                      : undefined
                  }
                  className="font-heading text-xl leading-snug font-semibold"
                />
              ) : null}
              {item.body.map((paragraph, paragraphIndex) => (
                <EditableCopy
                  as="p"
                  value={paragraph}
                  label={`Edit capability ${index + 1} paragraph ${paragraphIndex + 1}`}
                  onChange={
                    onChange
                      ? (value) =>
                          onChange(
                            ["items", index, "body", paragraphIndex],
                            value
                          )
                      : undefined
                  }
                  className="mt-3 max-w-[72ch] leading-6 text-muted-foreground"
                  key={paragraphIndex}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function AccessSupportSection({
  headingId,
  section,
  onChange,
  reviewTargets,
}: {
  headingId: string
  section: TeacherPreviewAccessSupportSectionDto
  onChange?: SectionTextChange
  reviewTargets?: ContentReviewSectionReviewTargets | null
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="border-b border-border bg-muted px-6 py-16 md:px-10 md:py-24 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <SectionIntro
        annotationId={
          reviewTargets === null
            ? undefined
            : reviewTargets?.sectionId ?? reviewAnnotationBindings.accessSupport
        }
        headingId={headingId}
        title={section.heading}
        onTitleChange={
          onChange ? (value) => onChange(["heading"], value) : undefined
        }
      />

      <div className="mt-12 max-w-2xl">
        <div>
          <EditableCopy
            as="h3"
            value={section.accessHeading}
            label="Edit access heading"
            onChange={
              onChange
                ? (value) => onChange(["accessHeading"], value)
                : undefined
            }
            className="font-heading text-xl font-semibold"
          />
          <dl className="mt-6 grid gap-2 border-y border-foreground/30 py-5 sm:grid-cols-[8rem_1fr]">
            <EditableCopy
              as="dt"
              value={section.methodLabel}
              label="Edit access method label"
              onChange={
                onChange
                  ? (value) => onChange(["methodLabel"], value)
                  : undefined
              }
              className="text-sm font-medium text-muted-foreground"
            />
            <EditableCopy
              as="dd"
              value={section.method}
              label="Edit access method"
              onChange={
                onChange ? (value) => onChange(["method"], value) : undefined
              }
              className="font-semibold"
            />
          </dl>
          <EditableCopy
            as="p"
            value={section.accountNote}
            label="Edit access note"
            onChange={
              onChange ? (value) => onChange(["accountNote"], value) : undefined
            }
            className="mt-3 text-sm leading-[1.5] text-muted-foreground"
          />
        </div>
      </div>
    </section>
  )
}

function CloseSection({
  headingId,
  section,
  onChange,
  reviewTargets,
}: {
  headingId: string
  section: TeacherPreviewCloseSectionDto
  onChange?: SectionTextChange
  reviewTargets?: ContentReviewSectionReviewTargets | null
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="px-6 py-20 text-center md:px-10 md:py-28 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="flex items-start justify-center gap-3">
        <EditableCopy
          as="h2"
          id={headingId}
          value={section.heading}
          label="Edit closing heading"
          onChange={
            onChange ? (value) => onChange(["heading"], value) : undefined
          }
          className="max-w-4xl font-heading text-[32px] font-semibold tracking-[-0.035em] sm:text-5xl"
        />
        {reviewTargets?.sectionId ? (
          <ReviewPin id={reviewTargets.sectionId} />
        ) : null}
      </div>
      {section.body.map((paragraph, index) => (
        <EditableCopy
          as="p"
          value={paragraph}
          label={`Edit closing paragraph ${index + 1}`}
          onChange={
            onChange ? (value) => onChange(["body", index], value) : undefined
          }
          className="mx-auto mt-6 max-w-2xl text-lg leading-7 text-muted-foreground"
          key={index}
        />
      ))}
      <InertAction action={section.action} onChange={onChange} />
    </section>
  )
}

export function ContentReviewSection({
  headingId,
  section,
  onChange,
  reviewTargets,
}: {
  headingId: string
  section: TeacherPreviewSectionDto
  onChange?: SectionTextChange
  reviewTargets?: ContentReviewSectionReviewTargets | null
}) {
  switch (section.kind) {
    case "promise":
      return (
        <HeroSection
          headingId={headingId}
          section={section}
          onChange={onChange}
          reviewTargets={reviewTargets}
        />
      )
    case "connected-story":
      return (
        <ConnectedStorySection
          headingId={headingId}
          section={section}
          onChange={onChange}
          reviewTargets={reviewTargets}
        />
      )
    case "reveal":
      return (
        <RevealSection
          headingId={headingId}
          section={section}
          onChange={onChange}
          reviewTargets={reviewTargets}
        />
      )
    case "capabilities":
      return (
        <CapabilitiesSection
          headingId={headingId}
          section={section}
          onChange={onChange}
          reviewTargets={reviewTargets}
        />
      )
    case "close":
      return (
        <CloseSection
          headingId={headingId}
          section={section}
          onChange={onChange}
          reviewTargets={reviewTargets}
        />
      )
    case "access-support":
      return (
        <AccessSupportSection
          headingId={headingId}
          section={section}
          onChange={onChange}
          reviewTargets={reviewTargets}
        />
      )
  }
}

export function ContentReviewOutline({
  sections,
  editor,
  reviewTargets,
  showReviewPins = true,
}: {
  sections: ReadonlyArray<TeacherPreviewSectionDto>
  editor?: ContentReviewEditAdapter
  reviewTargets?: ReadonlyArray<ContentReviewSectionReviewTargets>
  showReviewPins?: boolean
}) {
  return (
    <>
      {sections.map((section, index) => (
        <ContentReviewSection
          headingId={`wireframe-${section.kind}-${index + 1}`}
          key={`${section.kind}-${index}`}
          section={section}
          reviewTargets={showReviewPins ? reviewTargets?.[index] : null}
          onChange={
            editor
              ? (path, value) => editor.updateSectionText(index, path, value)
              : undefined
          }
        />
      ))}
    </>
  )
}
