export type ContentReviewEditAdapter = {
  readonly updatePageText: (
    field: "brand" | "description" | "path" | "title",
    value: string
  ) => void
  readonly updateSectionText: (
    visibleSectionIndex: number,
    fieldPath: ReadonlyArray<string | number>,
    value: string
  ) => void
  readonly updateFooterText: (
    fieldPath: ReadonlyArray<string | number>,
    value: string
  ) => void
}

export type ContentReviewSectionReviewTargets = {
  readonly sectionId: string
  readonly screenIds: ReadonlyArray<string>
}

export type ContentReviewReviewTargets = {
  readonly sections: ReadonlyArray<ContentReviewSectionReviewTargets>
  readonly footerSectionId: string | null
}
