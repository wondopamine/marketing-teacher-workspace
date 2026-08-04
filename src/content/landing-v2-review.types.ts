export type ReviewReference = `TW-${string}`

export const contentReviewSectionKinds = [
  "promise",
  "connected-story",
  "reveal",
  "capabilities",
  "explorer",
  "audiences",
  "proof",
  "access-support",
  "close",
  "footer-feedback",
] as const

export type ContentReviewSectionKind =
  (typeof contentReviewSectionKinds)[number]

export type ReviewContentKind =
  | "structure"
  | "copy"
  | "claim"
  | "destination"
  | "omission"

export type ContentReviewLinkDto = {
  readonly label: string
  readonly href: string
  readonly note: string | null
  readonly purpose: "product" | "feedback"
}

export type ReviewDraftContentEntryDto = {
  readonly kind: "content"
  readonly reviewReference: ReviewReference
  readonly contentKind: Exclude<ReviewContentKind, "structure" | "omission">
  readonly label: string | null
  readonly heading: string | null
  readonly body: ReadonlyArray<string>
  readonly link: ContentReviewLinkDto | null
}

export type ReviewDraftDecisionEntryDto = {
  readonly kind: "decision"
  readonly reviewReference: ReviewReference
  readonly contentKind: "omission"
  readonly reviewLabel: string
}

export type ReviewDraftEntryDto =
  | ReviewDraftContentEntryDto
  | ReviewDraftDecisionEntryDto

export type ReviewDraftSectionDto = {
  readonly kind: ContentReviewSectionKind
  readonly reviewReference: ReviewReference
  readonly entries: ReadonlyArray<ReviewDraftEntryDto>
}

export type ReviewDraftProjectionDto = {
  readonly metadata: ReviewDraftContentEntryDto
  readonly sections: ReadonlyArray<ReviewDraftSectionDto>
}

export const contentReviewStatuses = [
  "blocked",
  "decision-required",
  "reconfirmation-required",
  "unreviewed",
  "partially-reviewed",
  "reviewed-current",
] as const

export type ContentReviewStatus = (typeof contentReviewStatuses)[number]

export type ContentReviewContextDto = {
  readonly reviewReference: ReviewReference
  readonly status: ContentReviewStatus
  readonly owner: string
  readonly requiredReviewers: ReadonlyArray<string>
  readonly remainingReviewers: ReadonlyArray<string>
  readonly concerns: ReadonlyArray<string>
  readonly sourceLabel: string
  readonly snapshot: string
  readonly blockers: ReadonlyArray<string>
}

export type ContentReviewEntryDto =
  | (ReviewDraftContentEntryDto & {
      readonly review: ContentReviewContextDto
    })
  | (ReviewDraftDecisionEntryDto & {
      readonly review: ContentReviewContextDto
    })

export type ContentReviewSectionDto = {
  readonly kind: ContentReviewSectionKind
  readonly review: ContentReviewContextDto
  readonly entries: ReadonlyArray<ContentReviewEntryDto>
}

export type ContentReviewAppendixDto = {
  readonly syntheticData: {
    readonly rule: string
    readonly prohibitedData: ReadonlyArray<string>
  }
  readonly claims: {
    readonly summary: string
    readonly unresolvedCount: number
  }
  readonly proof: {
    readonly summary: string
    readonly missingCapabilityLabels: ReadonlyArray<string>
  }
  readonly access: {
    readonly label: string
    readonly accountNote: string
    readonly implementationBoundary: string
  }
  readonly support: {
    readonly summary: string
  }
  readonly measurement: {
    readonly providerStrategy: string
    readonly engagementOwner: string
    readonly conversionProxyOwner: string
    readonly trueConversionOwner: string
    readonly unresolvedDecisions: ReadonlyArray<string>
    readonly allowedFields: ReadonlyArray<string>
    readonly prohibitedFields: ReadonlyArray<string>
  }
}

export type ContentReviewReadyPageDto = {
  readonly kind: "ready"
  readonly artifactLabel: string
  readonly warning: string
  readonly itemSnapshot: string
  readonly iaOrderSnapshot: string
  readonly storySnapshot: string
  readonly artifactReview: {
    readonly iaOrder: ContentReviewContextDto
    readonly composedStory: ContentReviewContextDto
  }
  readonly metadata: ReviewDraftContentEntryDto & {
    readonly review: ContentReviewContextDto
  }
  readonly sections: ReadonlyArray<ContentReviewSectionDto>
  readonly appendix: ContentReviewAppendixDto
}

export type ContentReviewErrorPageDto = {
  readonly kind: "error"
  readonly code: "CONTENT_REVIEW_INVALID"
  readonly buildSnapshot: string
  readonly feedback: ContentReviewLinkDto
}

export type ContentReviewPageDto =
  | ContentReviewReadyPageDto
  | ContentReviewErrorPageDto
