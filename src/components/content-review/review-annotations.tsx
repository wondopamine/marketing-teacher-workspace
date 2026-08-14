import { createContext, useContext, useEffect, useMemo, useState } from "react"

import {
  contentReviewChrome,
  contentReviewScreens,
} from "./content-review-chrome"
import { Button } from "@/components/ui/button"

export type ReviewAnnotation = {
  readonly id: string
  readonly title: string
  readonly rationale: string
  readonly details: ReadonlyArray<string>
  readonly pending: string | null
}

export const reviewAnnotationBindings = {
  accessSupport: "access-support-overview",
  capabilities: "capability-map-overview",
  heroScreen: "screen-hero",
  notice: "notice-and-understand-overview",
  act: "act-overview",
  communicate: "communicate-overview",
  schoolConsistency: "school-consistency-overview",
  storyScreens: [
    "screen-story-promise",
    "screen-story-notice",
    "screen-story-next-steps",
    "screen-story-words",
    "screen-story-family-and-record",
  ],
} as const

function screenAnnotation(
  id: string,
  screen: (typeof contentReviewScreens)["hero"]
): ReviewAnnotation {
  return {
    id,
    title: screen.heading,
    rationale: screen.body,
    details: screen.keyElements,
    pending: screen.pendingInterface?.question ?? null,
  }
}

export const reviewAnnotations: ReadonlyArray<ReviewAnnotation> = [
  screenAnnotation(
    reviewAnnotationBindings.heroScreen,
    contentReviewScreens.hero
  ),
  {
    id: reviewAnnotationBindings.capabilities,
    title: contentReviewChrome.capabilities.label ?? "Capability map",
    rationale: contentReviewChrome.capabilities.intro ?? "",
    details: [
      "Student Insights",
      "AI next-step guidance",
      "Message drafting",
      "Posts",
    ],
    pending: "Capability owners must confirm each public behaviour.",
  },
  {
    id: reviewAnnotationBindings.notice,
    title: contentReviewChrome.narrative.noticeHeading,
    rationale:
      "Use one positive, synthetic Student Insights moment. A positive tag and recent observations should be the visual focus.",
    details: ["Positive framing", "Synthetic data", "Teacher interpretation"],
    pending: "Student Insights must confirm the positive state shown at GA.",
  },
  ...contentReviewScreens.story
    .slice(0, 2)
    .map((screen, index) =>
      screenAnnotation(reviewAnnotationBindings.storyScreens[index], screen)
    ),
  {
    id: reviewAnnotationBindings.act,
    title: contentReviewChrome.narrative.actHeading,
    rationale:
      "Use a separate positive task so the page does not invent a hand-off from Student Insights to AI guidance.",
    details: ["Separate scenario", "Possible next step", "Teacher decision"],
    pending:
      "The capability owner must confirm the GA guidance task and output.",
  },
  screenAnnotation(
    reviewAnnotationBindings.storyScreens[2],
    contentReviewScreens.story[2]
  ),
  {
    id: reviewAnnotationBindings.communicate,
    title: contentReviewChrome.narrative.communicateHeading,
    rationale:
      "Use a separate positive communication moment. Show teacher review before publishing and only approved Posts delivery information.",
    details: ["Editable draft", "Teacher review", "Posts delivery state"],
    pending:
      "Message drafting and Posts owners must confirm the public GA behaviour. The testimonial remains omitted until approved.",
  },
  ...contentReviewScreens.story
    .slice(3, 5)
    .map((screen, index) =>
      screenAnnotation(reviewAnnotationBindings.storyScreens[index + 3], screen)
    ),
  {
    id: reviewAnnotationBindings.schoolConsistency,
    title: contentReviewChrome.revealLabel,
    rationale:
      "Explain the organisational value for Key Personnel and School Leaders without moving the page away from everyday teachers.",
    details: [
      "Consistent school practice",
      "Teacher professional judgement",
      "Approved access and data language",
    ],
    pending: "Policy, security, and product owners must approve the assurance.",
  },
  {
    id: reviewAnnotationBindings.accessSupport,
    title: contentReviewChrome.accessSupport.label ?? "Access review",
    rationale:
      "Confirm the public support route and access explanation before publication.",
    details: [
      contentReviewChrome.accessSupport.accessHeading,
      contentReviewChrome.accessSupport.supportHeading,
    ],
    pending: contentReviewChrome.accessSupport.pendingLabel,
  },
]

export const staticReviewTargets = [
  {
    sectionId: "",
    screenIds: [reviewAnnotationBindings.heroScreen],
  },
  {
    sectionId: reviewAnnotationBindings.capabilities,
    screenIds: [],
  },
  {
    sectionId: reviewAnnotationBindings.notice,
    screenIds: reviewAnnotationBindings.storyScreens.slice(0, 2),
  },
  {
    sectionId: reviewAnnotationBindings.act,
    screenIds: reviewAnnotationBindings.storyScreens.slice(2, 3),
  },
  {
    sectionId: reviewAnnotationBindings.communicate,
    screenIds: reviewAnnotationBindings.storyScreens.slice(3, 5),
  },
  {
    sectionId: reviewAnnotationBindings.schoolConsistency,
    screenIds: [],
  },
  { sectionId: "", screenIds: [] },
] as const

type ReviewAnnotationContextValue = {
  readonly annotations: ReadonlyMap<string, ReviewAnnotation>
  readonly panelOpen: boolean
  readonly panelOpenerId: string | null
  readonly pinsVisible: boolean
  readonly selectionVersion: number
  readonly selectedId: string | null
  readonly open: (id: string) => void
  readonly replaceAnnotations: (
    annotations: ReadonlyArray<ReviewAnnotation>
  ) => void
  readonly setPanelOpen: (open: boolean) => void
  readonly setPinsVisible: (visible: boolean) => void
  readonly toggle: (id: string) => void
}

const ReviewAnnotationContext =
  createContext<ReviewAnnotationContextValue | null>(null)

export function ReviewAnnotationProvider({
  annotations: initialAnnotations = reviewAnnotations,
  children,
}: {
  annotations?: ReadonlyArray<ReviewAnnotation>
  children: React.ReactNode
}) {
  const [availableAnnotations, setAvailableAnnotations] =
    useState(initialAnnotations)
  const [panelOpen, setPanelOpenState] = useState(false)
  const [panelOpenerId, setPanelOpenerId] = useState<string | null>(null)
  const [pinsVisible, setPinsVisible] = useState(true)
  const [selectionVersion, setSelectionVersion] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(
    initialAnnotations[0]?.id ?? null
  )
  const annotations = useMemo(
    () =>
      new Map(
        availableAnnotations.map((annotation) => [annotation.id, annotation])
      ),
    [availableAnnotations]
  )

  useEffect(() => {
    setAvailableAnnotations(initialAnnotations)
  }, [initialAnnotations])

  useEffect(() => {
    if (selectedId && annotations.has(selectedId)) return
    setSelectedId(availableAnnotations[0]?.id ?? null)
    if (availableAnnotations.length === 0) setPanelOpenState(false)
  }, [annotations, availableAnnotations, selectedId])

  return (
    <ReviewAnnotationContext.Provider
      value={{
        annotations,
        panelOpen,
        panelOpenerId,
        pinsVisible,
        selectionVersion,
        selectedId,
        open: (id) => {
          if (!annotations.has(id)) return
          setSelectedId(id)
          setPanelOpenerId(id)
          setSelectionVersion((version) => version + 1)
          setPanelOpenState(true)
        },
        replaceAnnotations: setAvailableAnnotations,
        setPanelOpen: (open) => {
          setPanelOpenState(open)
          if (open) setPanelOpenerId(null)
        },
        setPinsVisible,
        toggle: (id) => {
          if (panelOpen && selectedId === id) {
            setPanelOpenState(false)
            return
          }
          setSelectedId(id)
          setPanelOpenerId(id)
          setSelectionVersion((version) => version + 1)
          setPanelOpenState(true)
        },
      }}
    >
      {children}
    </ReviewAnnotationContext.Provider>
  )
}

export function useReviewAnnotations(): ReviewAnnotationContextValue {
  const context = useContext(ReviewAnnotationContext)
  if (!context) {
    throw new Error(
      "useReviewAnnotations must be used inside ReviewAnnotationProvider"
    )
  }
  return context
}

export function ReviewAnnotationDetails({
  annotation,
  compact = false,
}: {
  annotation: ReviewAnnotation
  compact?: boolean
}) {
  return (
    <div
      className={compact ? "border-t border-border pt-4" : ""}
      data-review-annotation-details={annotation.id}
    >
      <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
        Reviewer note
      </p>
      <p
        className="mt-2 font-heading text-xl font-semibold"
        data-review-annotation-title
      >
        {annotation.title}
      </p>
      {annotation.rationale ? (
        <p className="mt-2 max-w-[66ch] leading-6 text-muted-foreground">
          {annotation.rationale}
        </p>
      ) : null}
      {annotation.details.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
          {annotation.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
      {annotation.pending ? (
        <div className="mt-3 border-l-2 border-foreground/50 bg-muted px-3 py-2 text-foreground">
          <p className="text-xs font-semibold uppercase">Decision needed</p>
          <p className="mt-1 leading-5">{annotation.pending}</p>
        </div>
      ) : null}
    </div>
  )
}

export function ReviewPin({ id }: { id: string }) {
  const { annotations, panelOpen, pinsVisible, selectedId, toggle } =
    useReviewAnnotations()
  const annotation = annotations.get(id)
  if (!pinsVisible || !annotation) return null

  const expanded = panelOpen && selectedId === id
  const number = Array.from(annotations.keys()).indexOf(id) + 1
  return (
    <span data-review-annotation data-review-chrome>
      <Button
        type="button"
        aria-controls="review-rationale-panel"
        aria-expanded={expanded}
        aria-label={`Review note: ${annotation.title}`}
        className="review-pin min-h-11 min-w-11 rounded-full border-2 border-background bg-foreground text-background shadow-md"
        data-review-annotation-trigger={id}
        onClick={() => toggle(id)}
      >
        <span aria-hidden>{number}</span>
      </Button>
    </span>
  )
}
