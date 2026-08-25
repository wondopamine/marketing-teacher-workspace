import { cmsSectionRegistry } from "./section-registry"

import type {
  CmsReviewDocument,
  CmsScreenDocument,
  CmsSectionDocument,
  CmsVersionContract,
} from "./document"

export type CmsReviewAnnotation = {
  readonly id: string
  readonly title: string
  readonly rationale: string
  readonly details: ReadonlyArray<string>
  readonly pending: string | null
}

export type CmsSectionReviewTargets = {
  readonly sectionId: string
  readonly screenIds: ReadonlyArray<string>
}

export type CmsReviewPresentation = {
  readonly annotations: ReadonlyArray<CmsReviewAnnotation>
  readonly sectionTargets: ReadonlyArray<CmsSectionReviewTargets>
  readonly footerTargetId: string | null
}

function annotation(
  id: string,
  title: string,
  reviewDocument: CmsReviewDocument
): CmsReviewAnnotation | null {
  const context = reviewDocument.targets[id]
  if (!context) return null
  return {
    id,
    title,
    rationale: context.designIntent,
    details: context.checks,
    pending: context.decisionNeeded ?? null,
  }
}

function screenTitle(screen: CmsScreenDocument): string {
  const location = screen.breadcrumb.at(-1) ?? "Product screen"
  return `${location} screen`
}

function sectionScreens(
  section: CmsSectionDocument
): ReadonlyArray<CmsScreenDocument> {
  if (section.type === "promise") return [section.fields.screen]
  if (section.type === "connected-story") {
    return section.fields.steps.map((step) => step.screen)
  }
  return []
}

export function buildCmsReviewPresentation(
  contract: CmsVersionContract
): CmsReviewPresentation {
  const visible = contract.pageDocument.sections.filter(
    (section) => section.state === "visible"
  )
  const footer = visible.find((section) => section.type === "footer-feedback")
  const pageSections = visible.filter(
    (section) => section.type !== "footer-feedback"
  )
  const annotations: Array<CmsReviewAnnotation> = []

  for (const section of pageSections) {
    const sectionAnnotation = annotation(
      section.id,
      cmsSectionRegistry[section.type].label,
      contract.reviewDocument
    )
    if (sectionAnnotation) annotations.push(sectionAnnotation)

    for (const screen of sectionScreens(section)) {
      const screenAnnotation = annotation(
        screen.id,
        screenTitle(screen),
        contract.reviewDocument
      )
      if (screenAnnotation) annotations.push(screenAnnotation)
    }
  }

  if (footer) {
    const footerAnnotation = annotation(
      footer.id,
      cmsSectionRegistry[footer.type].label,
      contract.reviewDocument
    )
    if (footerAnnotation) annotations.push(footerAnnotation)
  }

  return {
    annotations,
    sectionTargets: pageSections.map((section) => ({
      sectionId: section.id,
      screenIds: sectionScreens(section).map((screen) => screen.id),
    })),
    footerTargetId: footer?.id ?? null,
  }
}
