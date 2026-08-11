import { cmsSectionRegistry } from "./section-registry"
import {
  cmsPageSchemaVersion,
  cmsReviewSchemaVersion,
  cmsSectionLibraryVersion,
  cmsSectionStates,
} from "./document"

import type {
  CmsActionDocument,
  CmsDocuments,
  CmsPageDocument,
  CmsReviewDocument,
  CmsScreenDocument,
  CmsSectionDocument,
  CmsSectionState,
  CmsSectionType,
  CmsVersionContract,
} from "./document"
import type {
  TeacherPreviewDocumentDto,
  TeacherPreviewSectionDto,
} from "@/content/teacher-preview-document"
import { isTeacherPreviewDocumentDto } from "@/content/teacher-preview-document"

type UnknownRecord = Record<string, unknown>

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const pagePathPattern = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function hasExactKeys(
  value: UnknownRecord,
  expectedKeys: ReadonlyArray<string>
): boolean {
  const actualKeys = Object.keys(value).sort()
  const sortedExpected = [...expectedKeys].sort()
  return (
    actualKeys.length === sortedExpected.length &&
    actualKeys.every((key, index) => key === sortedExpected[index])
  )
}

function isNonBlankString(
  value: unknown,
  maximumLength = 2_000
): value is string {
  return (
    typeof value === "string" &&
    value.length <= maximumLength &&
    value.replace(/\p{Cf}/gu, "").trim().length > 0
  )
}

function isNullableNonBlankString(
  value: unknown,
  maximumLength = 2_000
): value is string | null {
  return value === null || isNonBlankString(value, maximumLength)
}

function isBody(value: unknown): value is ReadonlyArray<string> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 8 &&
    value.every((paragraph) => isNonBlankString(paragraph, 4_000))
  )
}

export function isCmsStableId(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value)
}

export function normaliseCmsPath(value: string): string | null {
  const normalised = value.trim().toLowerCase()
  return pagePathPattern.test(normalised) ? normalised : null
}

function isAction(value: unknown): value is CmsActionDocument | null {
  return (
    value === null ||
    (isRecord(value) &&
      hasExactKeys(value, ["label", "note"]) &&
      isNonBlankString(value.label, 120) &&
      isNullableNonBlankString(value.note, 240))
  )
}

function isScreen(value: unknown): value is CmsScreenDocument {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["id", "src", "alt", "breadcrumb"]) &&
    isCmsStableId(value.id) &&
    typeof value.src === "string" &&
    /^\/content-review\/screens\/[a-z0-9][a-z0-9._-]*$/.test(value.src) &&
    isNonBlankString(value.alt, 400) &&
    Array.isArray(value.breadcrumb) &&
    value.breadcrumb.length > 0 &&
    value.breadcrumb.length <= 6 &&
    value.breadcrumb.every((crumb) => isNonBlankString(crumb, 100))
  )
}

function isState(value: unknown): value is CmsSectionState {
  return cmsSectionStates.some((state) => state === value)
}

function hasSectionEnvelope(
  value: UnknownRecord,
  type: CmsSectionType
): boolean {
  return (
    hasExactKeys(value, ["id", "type", "state", "fields"]) &&
    isCmsStableId(value.id) &&
    value.type === type &&
    isState(value.state) &&
    isRecord(value.fields)
  )
}

function isSection(value: unknown): value is CmsSectionDocument {
  if (!isRecord(value) || typeof value.type !== "string") return false

  if (value.type === "promise" && hasSectionEnvelope(value, value.type)) {
    const fields = value.fields as UnknownRecord
    return (
      hasExactKeys(fields, [
        "eyebrow",
        "heading",
        "body",
        "action",
        "screen",
      ]) &&
      isNullableNonBlankString(fields.eyebrow, 120) &&
      isNonBlankString(fields.heading, 240) &&
      isBody(fields.body) &&
      isAction(fields.action) &&
      isScreen(fields.screen)
    )
  }

  if (
    value.type === "connected-story" &&
    hasSectionEnvelope(value, value.type)
  ) {
    const fields = value.fields as UnknownRecord
    return (
      hasExactKeys(fields, ["heading", "steps"]) &&
      isNonBlankString(fields.heading, 240) &&
      Array.isArray(fields.steps) &&
      fields.steps.length === 5 &&
      fields.steps.every(
        (step) =>
          isRecord(step) &&
          hasExactKeys(step, ["id", "label", "heading", "body", "screen"]) &&
          isCmsStableId(step.id) &&
          isNullableNonBlankString(step.label, 120) &&
          isNullableNonBlankString(step.heading, 240) &&
          isBody(step.body) &&
          isScreen(step.screen)
      )
    )
  }

  if (value.type === "reveal" && hasSectionEnvelope(value, value.type)) {
    const fields = value.fields as UnknownRecord
    return (
      hasExactKeys(fields, ["heading", "body", "asides"]) &&
      isNonBlankString(fields.heading, 240) &&
      isBody(fields.body) &&
      Array.isArray(fields.asides) &&
      fields.asides.length <= 1 &&
      fields.asides.every(
        (aside) =>
          isRecord(aside) &&
          hasExactKeys(aside, ["id", "body"]) &&
          isCmsStableId(aside.id) &&
          isBody(aside.body)
      )
    )
  }

  if (value.type === "capabilities" && hasSectionEnvelope(value, value.type)) {
    const fields = value.fields as UnknownRecord
    return (
      hasExactKeys(fields, ["heading", "items"]) &&
      isNonBlankString(fields.heading, 240) &&
      Array.isArray(fields.items) &&
      fields.items.length === 4 &&
      fields.items.every(
        (item) =>
          isRecord(item) &&
          hasExactKeys(item, ["id", "label", "heading", "body"]) &&
          isCmsStableId(item.id) &&
          isNullableNonBlankString(item.label, 120) &&
          isNullableNonBlankString(item.heading, 240) &&
          isBody(item.body)
      )
    )
  }

  if (value.type === "close" && hasSectionEnvelope(value, value.type)) {
    const fields = value.fields as UnknownRecord
    return (
      hasExactKeys(fields, ["heading", "body", "action"]) &&
      isNonBlankString(fields.heading, 240) &&
      isBody(fields.body) &&
      isAction(fields.action)
    )
  }

  if (
    value.type === "access-support" &&
    hasSectionEnvelope(value, value.type)
  ) {
    const fields = value.fields as UnknownRecord
    return (
      hasExactKeys(fields, [
        "heading",
        "accessHeading",
        "methodLabel",
        "method",
        "accountNote",
      ]) &&
      isNonBlankString(fields.heading, 240) &&
      isNonBlankString(fields.accessHeading, 160) &&
      isNonBlankString(fields.methodLabel, 120) &&
      isNonBlankString(fields.method, 120) &&
      isNonBlankString(fields.accountNote, 240)
    )
  }

  if (
    value.type === "footer-feedback" &&
    hasSectionEnvelope(value, value.type)
  ) {
    const fields = value.fields as UnknownRecord
    return (
      hasExactKeys(fields, ["brand", "body", "feedbackLabel"]) &&
      isNonBlankString(fields.brand, 120) &&
      isBody(fields.body) &&
      isNullableNonBlankString(fields.feedbackLabel, 120)
    )
  }

  return false
}

function collectEntityIds(section: CmsSectionDocument): ReadonlyArray<string> {
  const ids = [section.id]
  if (section.type === "promise") ids.push(section.fields.screen.id)
  if (section.type === "connected-story") {
    section.fields.steps.forEach((step) => ids.push(step.id, step.screen.id))
  }
  if (section.type === "reveal") {
    section.fields.asides.forEach((aside) => ids.push(aside.id))
  }
  if (section.type === "capabilities") {
    section.fields.items.forEach((item) => ids.push(item.id))
  }
  return ids
}

export function isCmsPageDocument(value: unknown): value is CmsPageDocument {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["page", "sections"]) ||
    !isRecord(value.page) ||
    !hasExactKeys(value.page, ["title", "path", "description", "brand"]) ||
    !isNonBlankString(value.page.title, 160) ||
    typeof value.page.path !== "string" ||
    normaliseCmsPath(value.page.path) !== value.page.path ||
    !isNonBlankString(value.page.description, 320) ||
    !isNonBlankString(value.page.brand, 120) ||
    !Array.isArray(value.sections) ||
    value.sections.length < 2 ||
    value.sections.length > 20 ||
    !value.sections.every(isSection)
  ) {
    return false
  }

  const sections = value.sections
  const entityIds = sections.flatMap(collectEntityIds)
  if (new Set(entityIds).size !== entityIds.length) return false

  const activeSections = sections.filter(
    (section) => section.state !== "archived"
  )
  for (const [type, rule] of Object.entries(cmsSectionRegistry)) {
    const count = activeSections.filter(
      (section) => section.type === type
    ).length
    if (count < rule.minimum || count > rule.maximum) return false
  }

  const promise = activeSections[0]
  const footer = activeSections.at(-1)
  if (
    promise.type !== "promise" ||
    promise.state !== "visible" ||
    footer?.type !== "footer-feedback" ||
    footer.state !== "visible"
  ) {
    return false
  }

  return true
}

export function isCmsReviewDocument(
  value: unknown
): value is CmsReviewDocument {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["targets"]) ||
    !isRecord(value.targets)
  ) {
    return false
  }

  return Object.entries(value.targets).every(
    ([targetId, target]) =>
      isCmsStableId(targetId) &&
      isRecord(target) &&
      (hasExactKeys(target, ["designIntent", "checks"]) ||
        hasExactKeys(target, ["designIntent", "checks", "decisionNeeded"])) &&
      isNonBlankString(target.designIntent, 4_000) &&
      Array.isArray(target.checks) &&
      target.checks.length <= 12 &&
      target.checks.every((check) => isNonBlankString(check, 500)) &&
      (target.decisionNeeded === undefined ||
        isNonBlankString(target.decisionNeeded, 1_000))
  )
}

export function isCmsDocuments(value: unknown): value is CmsDocuments {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["pageDocument", "reviewDocument"]) &&
    isCmsPageDocument(value.pageDocument) &&
    isCmsReviewDocument(value.reviewDocument)
  )
}

export function isCmsVersionContract(
  value: unknown
): value is CmsVersionContract {
  return (
    isRecord(value) &&
    hasExactKeys(value, [
      "pageDocument",
      "reviewDocument",
      "pageSchemaVersion",
      "reviewSchemaVersion",
      "sectionLibraryVersion",
    ]) &&
    value.pageSchemaVersion === cmsPageSchemaVersion &&
    value.reviewSchemaVersion === cmsReviewSchemaVersion &&
    value.sectionLibraryVersion === cmsSectionLibraryVersion &&
    isCmsPageDocument(value.pageDocument) &&
    isCmsReviewDocument(value.reviewDocument)
  )
}

function projectSection(
  section: CmsSectionDocument
): TeacherPreviewSectionDto | null {
  if (section.type === "promise") {
    const { screen, ...fields } = section.fields
    return { kind: section.type, ...fields, screen: withoutId(screen) }
  }
  if (section.type === "connected-story") {
    return {
      kind: section.type,
      heading: section.fields.heading,
      steps: section.fields.steps.map(({ id: _id, screen, ...step }) => ({
        ...step,
        screen: withoutId(screen),
      })),
    }
  }
  if (section.type === "reveal") {
    return {
      kind: section.type,
      heading: section.fields.heading,
      body: section.fields.body,
      asides: section.fields.asides.map(({ id: _id, ...aside }) => aside),
    }
  }
  if (section.type === "capabilities") {
    return {
      kind: section.type,
      heading: section.fields.heading,
      items: section.fields.items.map(({ id: _id, ...item }) => item),
    }
  }
  if (section.type === "close") {
    return { kind: section.type, ...section.fields }
  }
  if (section.type === "access-support") {
    return { kind: section.type, ...section.fields }
  }
  return null
}

function withoutId({ id: _id, ...screen }: CmsScreenDocument) {
  return screen
}

export function projectCmsPageDocument(
  document: CmsPageDocument
): TeacherPreviewDocumentDto | null {
  if (!isCmsPageDocument(document)) return null

  const visible = document.sections.filter(
    (section) => section.state === "visible"
  )
  const footer = visible.find((section) => section.type === "footer-feedback")
  if (!footer) return null

  const projected: TeacherPreviewDocumentDto = {
    brand: document.page.brand,
    sections: visible.flatMap((section) => {
      const projectedSection = projectSection(section)
      return projectedSection ? [projectedSection] : []
    }),
    footer: { ...footer.fields },
  }

  return isTeacherPreviewDocumentDto(projected) ? projected : null
}
