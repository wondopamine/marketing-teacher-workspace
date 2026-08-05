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

type JourneyAct = {
  readonly heading: string
  readonly storyIndexes: readonly number[]
  readonly explorerIndex: number
  readonly descriptionIndex: number
}

const journeyActs: readonly JourneyAct[] = [
  {
    heading: "Notice the progress",
    storyIndexes: [0, 1],
    explorerIndex: 0,
    descriptionIndex: 0,
  },
  {
    heading: "Choose the next step",
    storyIndexes: [2],
    explorerIndex: 1,
    descriptionIndex: 1,
  },
  {
    heading: "Keep everyone aligned",
    storyIndexes: [3, 4],
    explorerIndex: 2,
    descriptionIndex: 2,
  },
]

function contentEntries(
  section: ContentReviewWireframeSectionDto | undefined
): ReadonlyArray<ContentEntry> {
  return (
    section?.entries.filter(
      (entry): entry is ContentEntry => entry.kind === "content"
    ) ?? []
  )
}

function decisionEntries(
  section: ContentReviewWireframeSectionDto | undefined
): ReadonlyArray<DecisionEntry> {
  return (
    section?.entries.filter(
      (entry): entry is DecisionEntry => entry.kind === "decision"
    ) ?? []
  )
}

function SectionLabel({
  children,
  tone = "light",
}: {
  children: string
  tone?: "light" | "dark"
}) {
  const toneClass =
    tone === "dark" ? "text-background/60" : "text-muted-foreground"

  return (
    <p className={`text-xs font-semibold tracking-[0.1em] ${toneClass}`}>
      {children}
    </p>
  )
}

function InertAction({ entry }: { entry: ContentEntry | undefined }) {
  if (!entry?.action) return null

  return (
    <div className="mt-7">
      <span
        className="inline-flex min-h-12 items-center justify-center bg-foreground px-6 py-3 font-semibold text-background select-none"
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

function ApprovalRequest({ label }: { label: string }) {
  return (
    <div
      className="border border-dashed border-foreground/40 px-5 py-4"
      data-approval-request
    >
      <p className="text-xs font-semibold tracking-[0.1em] text-muted-foreground">
        Approval required
      </p>
      <p className="mt-2 font-medium">{label}</p>
    </div>
  )
}

function InterfaceBrief({
  description,
}: {
  description: ContentReviewInterfaceDescription
}) {
  return (
    <div className="mt-5 max-w-[72ch]" data-interface-description>
      <p className="text-xs font-semibold tracking-[0.1em] text-muted-foreground">
        Product stage brief
      </p>
      <p className="mt-2 font-medium">{description.heading}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description.body}
      </p>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        {description.keyElements.map((element) => (
          <li key={element}>{element}</li>
        ))}
      </ul>
    </div>
  )
}

function ProductStage({
  description,
  kind,
}: {
  description: ContentReviewInterfaceDescription
  kind: "hero" | "progress" | "next-step" | "family"
}) {
  const stageContent = {
    hero: (
      <>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Synthetic class example</span>
          <span>Primary 4</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-muted p-4">
            <p className="text-sm font-semibold">Student A · Primary 4</p>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
              Growing confidence
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Volunteered an answer during group sharing.
            </p>
          </div>
          <div className="space-y-3 p-4 text-sm">
            <p className="font-medium">Next step</p>
            <p>Invite another short contribution after pair discussion.</p>
            <p className="text-muted-foreground">
              Family update · Review required
            </p>
          </div>
        </div>
      </>
    ),
    progress: (
      <>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Synthetic class example</span>
          <span>Student A · Primary 4</span>
        </div>
        <div className="mt-5 bg-muted p-4">
          <p className="text-xs font-semibold tracking-[0.1em] text-muted-foreground">
            Positive change
          </p>
          <p className="mt-2 text-2xl font-semibold">Growing confidence</p>
          <ul className="mt-5 space-y-3 text-sm">
            <li>Volunteered an answer during group sharing.</li>
            <li>Added an idea after listening to a classmate.</li>
          </ul>
        </div>
      </>
    ),
    "next-step": (
      <>
        <p className="text-xs font-semibold tracking-[0.1em] text-muted-foreground">
          Student A · Primary 4
        </p>
        <div className="mt-5 bg-muted p-4">
          <p className="font-medium">Suggested next step</p>
          <p className="mt-3 text-lg font-semibold">
            Invite another short contribution after pair discussion.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            This builds on recent group-sharing observations.
          </p>
        </div>
        <p className="mt-4 text-sm font-medium">Review or adapt</p>
      </>
    ),
    family: (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-muted p-4">
            <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground">
              Draft family update · Teacher review required
            </p>
            <p className="mt-3 text-sm">
              Student A has been contributing more often during group sharing.
            </p>
          </div>
          <div className="p-4 text-sm">
            <p className="font-semibold">Posts preview · Not shared</p>
            <p className="mt-4 text-muted-foreground">
              Today · Family update prepared
            </p>
            <p className="mt-2 text-muted-foreground">
              Student journey · Classroom observation connected
            </p>
          </div>
        </div>
      </>
    ),
  }[kind]

  return (
    <div
      className="border-2 border-foreground/30 bg-background p-4 sm:p-5"
      data-product-stage
    >
      <div aria-hidden="true" className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-muted-foreground/50" />
        <span className="size-2 rounded-full bg-muted-foreground/30" />
        <span className="size-2 rounded-full bg-muted-foreground/30" />
      </div>
      <div className="mt-4">{stageContent}</div>
      <InterfaceBrief description={description} />
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
      className="grid gap-10 px-6 py-14 md:px-10 md:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(28rem,1.15fr)] lg:items-center lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div>
        <SectionLabel>Teacher Workspace</SectionLabel>
        <h1
          id="wireframe-hero-heading"
          className="mt-4 max-w-[13ch] font-heading text-[34px] leading-tight font-semibold tracking-[-0.04em] sm:text-5xl lg:text-[68px]"
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
      <ProductStage
        description={contentReviewInterfaceDescriptions.hero}
        kind="hero"
      />
    </section>
  )
}

function TrustStrip({
  appendix,
}: {
  appendix: ContentReviewWireframeAppendixDto
}) {
  return (
    <section className="bg-muted px-6 py-8 md:px-10 lg:px-16">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] lg:items-center">
        <ul className="grid gap-5 text-sm sm:grid-cols-3">
          <li>
            <p className="font-semibold">Teacher-controlled</p>
            <p className="mt-1 text-muted-foreground">
              Review and edit before anything is shared.
            </p>
          </li>
          <li>
            <p className="font-semibold">Synthetic example</p>
            <p className="mt-1 text-muted-foreground">
              No real student information.
            </p>
          </li>
          <li>
            <p className="font-semibold">Educator access</p>
            <p className="mt-1 text-muted-foreground">
              {appendix.access.accountNote}
            </p>
          </li>
        </ul>
        <ApprovalRequest label="Verified adoption metric" />
      </div>
    </section>
  )
}

function JourneyEntry({ entry }: { entry: ContentEntry }) {
  return (
    <li>
      {entry.label ? <SectionLabel>{entry.label}</SectionLabel> : null}
      {entry.heading ? (
        <h3 className="mt-2 max-w-2xl font-heading text-2xl font-semibold tracking-[-0.025em]">
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
      {entry.capabilityLabel ? (
        <p className="mt-4 text-sm font-medium">{entry.capabilityLabel}</p>
      ) : null}
    </li>
  )
}

function JourneyActSection({
  act,
  explorerEntries,
  storyEntries,
}: {
  act: JourneyAct
  explorerEntries: ReadonlyArray<ContentEntry>
  storyEntries: ReadonlyArray<ContentEntry>
}) {
  const stories = act.storyIndexes
    .map((index) => storyEntries[index])
    .filter((entry): entry is ContentEntry => Boolean(entry))
  const explorer = explorerEntries[act.explorerIndex]
  const stageKind = ["progress", "next-step", "family"] as const

  if (stories.length === 0 && !explorer) return null

  return (
    <section
      aria-labelledby={`journey-act-${act.descriptionIndex + 1}`}
      className="px-6 py-14 md:px-10 md:py-20 lg:px-16"
      data-journey-act
      data-journey-act-layout={
        act.descriptionIndex === 1 ? "stage-left-at-lg" : "copy-left-at-lg"
      }
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(24rem,1.2fr)] lg:items-start">
        <div className={act.descriptionIndex === 1 ? "lg:order-2" : undefined}>
          <SectionLabel>{`Journey act ${act.descriptionIndex + 1}`}</SectionLabel>
          <h2
            className="mt-3 font-heading text-[32px] font-semibold tracking-[-0.03em] sm:text-4xl"
            id={`journey-act-${act.descriptionIndex + 1}`}
          >
            {act.heading}
          </h2>
          <ol className="mt-8 space-y-8">
            {stories.map((entry) => (
              <JourneyEntry entry={entry} key={entry.heading ?? entry.label} />
            ))}
          </ol>
          {explorer ? (
            <div className="mt-8 max-w-[72ch] bg-muted p-5">
              <p className="text-sm font-semibold">In this view</p>
              <p className="mt-2 text-sm font-medium">{explorer.label}</p>
              {explorer.heading ? (
                <p className="mt-2">{explorer.heading}</p>
              ) : null}
              {explorer.body.map((paragraph) => (
                <p
                  className="mt-2 text-sm text-muted-foreground"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
        </div>
        <div className={act.descriptionIndex === 1 ? "lg:order-1" : undefined}>
          <ProductStage
            description={
              contentReviewInterfaceDescriptions.journey[act.descriptionIndex]
            }
            kind={stageKind[act.descriptionIndex]}
          />
        </div>
      </div>
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
      className="bg-foreground px-6 py-16 text-background md:px-10 md:py-20 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.65fr)] md:items-end">
        <div>
          <SectionLabel tone="dark">Teacher control</SectionLabel>
          <h2
            className="mt-4 font-heading text-[32px] font-semibold tracking-[-0.035em] sm:text-5xl"
            id="wireframe-reveal"
          >
            {copy.heading}
          </h2>
          {copy.body.map((paragraph) => (
            <p
              className="mt-5 max-w-[72ch] text-lg leading-7 text-background/75"
              key={paragraph}
            >
              {paragraph}
            </p>
          ))}
        </div>
        {decisions.map((entry) => (
          <p className="text-sm text-background/70" key={entry.reviewLabel}>
            {entry.reviewLabel} pending approval
          </p>
        ))}
      </div>
    </section>
  )
}

function CapabilitiesSection({
  proof,
  section,
}: {
  proof: ContentReviewWireframeSectionDto | undefined
  section: ContentReviewWireframeSectionDto
}) {
  const entries = contentEntries(section)
  const proofRequest = decisionEntries(proof)[0]?.reviewLabel

  return (
    <section
      aria-labelledby="wireframe-capabilities"
      className="bg-muted px-6 py-14 md:px-10 md:py-20 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="max-w-3xl">
        <SectionLabel>Connected teaching jobs</SectionLabel>
        <h2
          className="mt-3 font-heading text-[32px] font-semibold tracking-[-0.03em]"
          id="wireframe-capabilities"
        >
          What Teacher Workspace brings together
        </h2>
      </div>
      <ol className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
        {entries.map((entry) => (
          <li key={entry.label ?? entry.heading}>
            <p className="font-semibold">{entry.label}</p>
            {entry.heading ? (
              <h3 className="mt-2 font-heading text-xl font-semibold">
                {entry.heading}
              </h3>
            ) : null}
            {entry.body.map((paragraph) => (
              <p
                className="mt-3 max-w-[72ch] text-sm leading-6 text-muted-foreground"
                key={paragraph}
              >
                {paragraph}
              </p>
            ))}
          </li>
        ))}
      </ol>
      {proofRequest ? (
        <div className="mt-10 max-w-2xl">
          <ApprovalRequest label="Approved anonymous teacher quote, role, and school level" />
        </div>
      ) : null}
    </section>
  )
}

function AudiencesSection({
  section,
}: {
  section: ContentReviewWireframeSectionDto
}) {
  const entries = contentEntries(section)
  const decisions = decisionEntries(section)
  const labels = [
    ...entries.map((entry) => entry.label),
    ...decisions.map((entry) =>
      entry.reviewLabel.replace(/:\s*question and answer$/i, "")
    ),
  ]

  return (
    <section
      aria-labelledby="wireframe-audiences"
      className="px-6 py-14 md:px-10 md:py-20 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <SectionLabel>For school teams</SectionLabel>
      <h2
        className="mt-3 font-heading text-[32px] font-semibold tracking-[-0.03em]"
        id="wireframe-audiences"
      >
        Intended audiences
      </h2>
      <ul className="mt-10 grid gap-8 md:grid-cols-3">
        {labels
          .filter((label): label is string => Boolean(label))
          .map((label) => (
            <li key={label}>
              <h3 className="font-heading text-xl font-semibold">{label}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                PM confirmation will define the audience question and approved
                answer.
              </p>
            </li>
          ))}
      </ul>
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
  const supportRequest = decisionEntries(section)[0]?.reviewLabel
  return (
    <section
      aria-labelledby="wireframe-access-support"
      className="bg-muted px-6 py-14 md:px-10 md:py-20 lg:px-16"
      data-wireframe-section={section.kind}
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <SectionLabel>Access and support</SectionLabel>
          <h2
            className="mt-3 font-heading text-[32px] font-semibold tracking-[-0.03em]"
            id="wireframe-access-support"
          >
            Access Teacher Workspace
          </h2>
          <p className="mt-5 max-w-[72ch] leading-6 text-muted-foreground">
            {appendix.access.accountNote}
          </p>
          {supportRequest ? (
            <p className="mt-5 text-sm font-medium">
              {supportRequest} · Pending
            </p>
          ) : null}
        </div>
        <ApprovalRequest label="Approved security and data-handling assurance" />
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
        className="mx-auto max-w-4xl font-heading text-[32px] font-semibold tracking-[-0.035em] sm:text-5xl"
        id="wireframe-close"
      >
        {copy.heading}
      </h2>
      {copy.body.map((paragraph) => (
        <p
          className="mx-auto mt-5 max-w-2xl text-lg leading-7 text-muted-foreground"
          key={paragraph}
        >
          {paragraph}
        </p>
      ))}
      <InertAction entry={action} />
    </section>
  )
}

export function ContentReviewOutline({
  appendix,
  sections,
}: {
  appendix: ContentReviewWireframeAppendixDto
  sections: ReadonlyArray<ContentReviewWireframeSectionDto>
}) {
  const sectionsByKind = new Map(
    sections.map((section) => [section.kind, section])
  )
  const promise = sectionsByKind.get("promise")
  const story = contentEntries(sectionsByKind.get("connected-story"))
  const explorer = contentEntries(sectionsByKind.get("explorer"))

  return (
    <>
      {promise ? <HeroSection section={promise} /> : null}
      <TrustStrip appendix={appendix} />
      {journeyActs.map((act) => (
        <JourneyActSection
          act={act}
          explorerEntries={explorer}
          key={act.heading}
          storyEntries={story}
        />
      ))}
      {sectionsByKind.get("reveal") ? (
        <RevealSection
          section={
            sectionsByKind.get("reveal") as ContentReviewWireframeSectionDto
          }
        />
      ) : null}
      {sectionsByKind.get("capabilities") ? (
        <CapabilitiesSection
          proof={sectionsByKind.get("proof")}
          section={
            sectionsByKind.get(
              "capabilities"
            ) as ContentReviewWireframeSectionDto
          }
        />
      ) : null}
      {sectionsByKind.get("audiences") ? (
        <AudiencesSection
          section={
            sectionsByKind.get("audiences") as ContentReviewWireframeSectionDto
          }
        />
      ) : null}
      {sectionsByKind.get("access-support") ? (
        <AccessSupportSection
          appendix={appendix}
          section={
            sectionsByKind.get(
              "access-support"
            ) as ContentReviewWireframeSectionDto
          }
        />
      ) : null}
      {sectionsByKind.get("close") ? (
        <CloseSection
          section={
            sectionsByKind.get("close") as ContentReviewWireframeSectionDto
          }
        />
      ) : null}
    </>
  )
}
