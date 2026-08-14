export const cmsPageSchemaVersion = 1 as const
export const cmsReviewSchemaVersion = 1 as const
export const cmsSectionLibraryVersion = 1 as const

export const cmsSectionStates = ["visible", "hidden", "archived"] as const
export type CmsSectionState = (typeof cmsSectionStates)[number]

export const cmsSectionTypes = [
  "promise",
  "connected-story",
  "reveal",
  "capabilities",
  "close",
  "access-support",
  "footer-feedback",
] as const

export type CmsSectionType = (typeof cmsSectionTypes)[number]

export type CmsActionDocument = {
  readonly label: string
  readonly note: string | null
}

export type CmsScreenDocument = {
  readonly id: string
  readonly src: string
  readonly alt: string
  readonly breadcrumb: ReadonlyArray<string>
  readonly brief?: {
    /** Optional for backwards compatibility with saved v1 CMS drafts. */
    readonly label?: string
    readonly heading: string
    readonly body: string
    readonly keyElements: ReadonlyArray<string>
  }
}

type CmsSectionBase<
  TType extends CmsSectionType,
  TFields extends Readonly<Record<string, unknown>>,
> = {
  readonly id: string
  readonly type: TType
  readonly state: CmsSectionState
  readonly fields: TFields
}

export type CmsPromiseSectionDocument = CmsSectionBase<
  "promise",
  {
    readonly eyebrow: string | null
    readonly heading: string
    readonly body: ReadonlyArray<string>
    readonly action: CmsActionDocument | null
    readonly screen: CmsScreenDocument
  }
>

export type CmsConnectedStorySectionDocument = CmsSectionBase<
  "connected-story",
  {
    readonly heading: string
    readonly steps: ReadonlyArray<{
      readonly id: string
      readonly label: string | null
      readonly heading: string | null
      readonly body: ReadonlyArray<string>
      readonly screen: CmsScreenDocument
    }>
  }
>

export type CmsRevealSectionDocument = CmsSectionBase<
  "reveal",
  {
    readonly heading: string
    readonly body: ReadonlyArray<string>
    readonly asides: ReadonlyArray<{
      readonly id: string
      readonly body: ReadonlyArray<string>
    }>
  }
>

export type CmsCapabilitiesSectionDocument = CmsSectionBase<
  "capabilities",
  {
    readonly heading: string
    readonly items: ReadonlyArray<{
      readonly id: string
      readonly label: string | null
      readonly heading: string | null
      readonly body: ReadonlyArray<string>
    }>
  }
>

export type CmsCloseSectionDocument = CmsSectionBase<
  "close",
  {
    readonly heading: string
    readonly body: ReadonlyArray<string>
    readonly action: CmsActionDocument | null
  }
>

export type CmsAccessSupportSectionDocument = CmsSectionBase<
  "access-support",
  {
    readonly heading: string
    readonly accessHeading: string
    readonly methodLabel: string
    readonly method: string
    readonly accountNote: string
  }
>

export type CmsFooterFeedbackSectionDocument = CmsSectionBase<
  "footer-feedback",
  {
    readonly brand: string
    readonly body: ReadonlyArray<string>
    readonly feedbackLabel: string | null
  }
>

export type CmsSectionDocument =
  | CmsPromiseSectionDocument
  | CmsConnectedStorySectionDocument
  | CmsRevealSectionDocument
  | CmsCapabilitiesSectionDocument
  | CmsCloseSectionDocument
  | CmsAccessSupportSectionDocument
  | CmsFooterFeedbackSectionDocument

export type CmsPageDocument = {
  readonly page: {
    readonly title: string
    readonly path: string
    readonly description: string
    readonly brand: string
  }
  readonly sections: ReadonlyArray<CmsSectionDocument>
}

export type CmsReviewDocument = {
  readonly targets: Readonly<
    Partial<
      Record<
        string,
        {
          readonly designIntent: string
          readonly checks: ReadonlyArray<string>
          readonly decisionNeeded?: string
        }
      >
    >
  >
}

export type CmsDocuments = {
  readonly pageDocument: CmsPageDocument
  readonly reviewDocument: CmsReviewDocument
}

export type CmsVersionContract = CmsDocuments & {
  readonly pageSchemaVersion: typeof cmsPageSchemaVersion
  readonly reviewSchemaVersion: typeof cmsReviewSchemaVersion
  readonly sectionLibraryVersion: typeof cmsSectionLibraryVersion
}
