import { createContext, useContext, useMemo, useState } from "react"

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
  capabilities: "capabilities-overview",
  heroScreen: "screen-hero",
  story: "story-overview",
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
    id: reviewAnnotationBindings.story,
    title: contentReviewChrome.story.label ?? "Story rationale",
    rationale: contentReviewChrome.story.intro ?? "",
    details: [],
    pending: null,
  },
  ...contentReviewScreens.story.map((screen, index) =>
    screenAnnotation(reviewAnnotationBindings.storyScreens[index], screen)
  ),
  {
    id: reviewAnnotationBindings.capabilities,
    title: contentReviewChrome.capabilities.label ?? "Capability rationale",
    rationale: contentReviewChrome.capabilities.intro ?? "",
    details: [],
    pending: null,
  },
  {
    id: "audiences-overview",
    title: contentReviewChrome.audiences.label ?? "Audience review",
    rationale: contentReviewChrome.audiences.pendingNote,
    details: ["Form Teachers", "Key Personnel", "School Leaders"],
    pending: "Each audience still needs an approved question and answer.",
  },
  {
    id: "proof-overview",
    title: contentReviewChrome.proof.label ?? "Proof review",
    rationale: contentReviewChrome.proof.intro ?? "",
    details: [],
    pending: contentReviewChrome.proof.pendingLabel,
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

type ReviewAnnotationContextValue = {
  readonly annotations: ReadonlyMap<string, ReviewAnnotation>
  readonly panelOpen: boolean
  readonly panelOpenerId: string | null
  readonly pinsVisible: boolean
  readonly selectionVersion: number
  readonly selectedId: string | null
  readonly open: (id: string) => void
  readonly setPanelOpen: (open: boolean) => void
  readonly setPinsVisible: (visible: boolean) => void
  readonly toggle: (id: string) => void
}

const ReviewAnnotationContext =
  createContext<ReviewAnnotationContextValue | null>(null)

export function ReviewAnnotationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [panelOpen, setPanelOpenState] = useState(false)
  const [panelOpenerId, setPanelOpenerId] = useState<string | null>(null)
  const [pinsVisible, setPinsVisible] = useState(true)
  const [selectionVersion, setSelectionVersion] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(
    reviewAnnotations[0]?.id ?? null
  )
  const annotations = useMemo(
    () =>
      new Map(
        reviewAnnotations.map((annotation) => [annotation.id, annotation])
      ),
    []
  )

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
          setSelectedId(id)
          setPanelOpenerId(id)
          setSelectionVersion((version) => version + 1)
          setPanelOpenState(true)
        },
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
