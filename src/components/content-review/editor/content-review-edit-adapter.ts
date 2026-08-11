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
