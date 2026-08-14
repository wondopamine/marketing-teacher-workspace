export const teacherPreviewSectionKinds = [
  "promise",
  "connected-story",
  "reveal",
  "capabilities",
  "close",
  "access-support",
] as const

export const canonicalTeacherPreviewSectionKinds = [
  "promise",
  "capabilities",
  "connected-story",
  "connected-story",
  "connected-story",
  "reveal",
  "close",
] as const satisfies ReadonlyArray<TeacherPreviewSectionKind>

export type TeacherPreviewSectionKind =
  (typeof teacherPreviewSectionKinds)[number]

export type TeacherPreviewActionDto = {
  readonly label: string
  readonly note: string | null
}

export type TeacherPreviewScreenDto = {
  readonly src: string
  readonly alt: string
  readonly breadcrumb: ReadonlyArray<string>
  readonly brief: {
    readonly heading: string
    readonly body: string
    readonly keyElements: ReadonlyArray<string>
  } | null
}

export type TeacherPreviewPromiseSectionDto = {
  readonly kind: "promise"
  readonly eyebrow: string | null
  readonly heading: string
  readonly body: ReadonlyArray<string>
  readonly action: TeacherPreviewActionDto | null
  readonly screen: TeacherPreviewScreenDto
}

export type TeacherPreviewConnectedStorySectionDto = {
  readonly kind: "connected-story"
  readonly heading: string
  readonly steps: ReadonlyArray<{
    readonly label: string | null
    readonly heading: string | null
    readonly body: ReadonlyArray<string>
    readonly screen: TeacherPreviewScreenDto
  }>
}

export type TeacherPreviewRevealSectionDto = {
  readonly kind: "reveal"
  readonly heading: string
  readonly body: ReadonlyArray<string>
  readonly asides: ReadonlyArray<{
    readonly body: ReadonlyArray<string>
  }>
}

export type TeacherPreviewCapabilitiesSectionDto = {
  readonly kind: "capabilities"
  readonly heading: string
  readonly items: ReadonlyArray<{
    readonly label: string | null
    readonly heading: string | null
    readonly body: ReadonlyArray<string>
  }>
}

export type TeacherPreviewCloseSectionDto = {
  readonly kind: "close"
  readonly heading: string
  readonly body: ReadonlyArray<string>
  readonly action: TeacherPreviewActionDto | null
}

export type TeacherPreviewAccessSupportSectionDto = {
  readonly kind: "access-support"
  readonly heading: string
  readonly accessHeading: string
  readonly methodLabel: string
  readonly method: string
  readonly accountNote: string
}

export type TeacherPreviewSectionDto =
  | TeacherPreviewPromiseSectionDto
  | TeacherPreviewConnectedStorySectionDto
  | TeacherPreviewRevealSectionDto
  | TeacherPreviewCapabilitiesSectionDto
  | TeacherPreviewCloseSectionDto
  | TeacherPreviewAccessSupportSectionDto

export type TeacherPreviewDocumentDto = {
  readonly brand: string
  readonly sections: ReadonlyArray<TeacherPreviewSectionDto>
  readonly footer: {
    readonly brand: string
    readonly body: ReadonlyArray<string>
    readonly feedbackLabel: string | null
  }
}

export type TeacherPreviewPageDataDto =
  | {
      readonly kind: "ready"
      readonly document: TeacherPreviewDocumentDto
    }
  | { readonly kind: "error" }

type UnknownRecord = Readonly<Record<string, unknown>>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function hasExactKeys(
  value: UnknownRecord,
  expected: ReadonlyArray<string>
): boolean {
  const actual = Object.keys(value).sort()
  const sortedExpected = [...expected].sort()
  return (
    actual.length === sortedExpected.length &&
    actual.every((key, index) => key === sortedExpected[index])
  )
}

function isNonBlank(value: unknown): value is string {
  return (
    typeof value === "string" && value.replace(/\p{Cf}/gu, "").trim().length > 0
  )
}

function isNullableNonBlank(value: unknown): value is string | null {
  return value === null || isNonBlank(value)
}

function isBody(value: unknown): value is ReadonlyArray<string> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((paragraph) => isNonBlank(paragraph))
  )
}

function isAction(value: unknown): value is TeacherPreviewActionDto | null {
  if (value === null) return true
  return (
    isRecord(value) &&
    hasExactKeys(value, ["label", "note"]) &&
    isNonBlank(value.label) &&
    isNullableNonBlank(value.note)
  )
}

export function isTeacherPreviewScreenDto(
  value: unknown
): value is TeacherPreviewScreenDto {
  return (
    isRecord(value) &&
    hasExactKeys(value, ["src", "alt", "breadcrumb", "brief"]) &&
    typeof value.src === "string" &&
    /^\/content-review\/screens\/[a-z0-9][a-z0-9._-]*$/.test(value.src) &&
    isNonBlank(value.alt) &&
    Array.isArray(value.breadcrumb) &&
    value.breadcrumb.length > 0 &&
    value.breadcrumb.every((crumb) => isNonBlank(crumb)) &&
    (value.brief === null ||
      (isRecord(value.brief) &&
        hasExactKeys(value.brief, ["heading", "body", "keyElements"]) &&
        isNonBlank(value.brief.heading) &&
        isNonBlank(value.brief.body) &&
        Array.isArray(value.brief.keyElements) &&
        value.brief.keyElements.length === 3 &&
        value.brief.keyElements.every((item) => isNonBlank(item))))
  )
}

function isPromiseSection(
  value: UnknownRecord
): value is TeacherPreviewPromiseSectionDto {
  return (
    hasExactKeys(value, [
      "kind",
      "eyebrow",
      "heading",
      "body",
      "action",
      "screen",
    ]) &&
    value.kind === "promise" &&
    isNullableNonBlank(value.eyebrow) &&
    isNonBlank(value.heading) &&
    isBody(value.body) &&
    isAction(value.action) &&
    isTeacherPreviewScreenDto(value.screen)
  )
}

function isConnectedStorySection(
  value: UnknownRecord
): value is TeacherPreviewConnectedStorySectionDto {
  if (
    !hasExactKeys(value, ["kind", "heading", "steps"]) ||
    value.kind !== "connected-story" ||
    !isNonBlank(value.heading) ||
    !Array.isArray(value.steps) ||
    value.steps.length < 1 ||
    value.steps.length > 5
  ) {
    return false
  }

  return value.steps.every(
    (step) =>
      isRecord(step) &&
      hasExactKeys(step, ["label", "heading", "body", "screen"]) &&
      isNullableNonBlank(step.label) &&
      isNullableNonBlank(step.heading) &&
      isBody(step.body) &&
      isTeacherPreviewScreenDto(step.screen)
  )
}

function isRevealSection(
  value: UnknownRecord
): value is TeacherPreviewRevealSectionDto {
  if (
    !hasExactKeys(value, ["kind", "heading", "body", "asides"]) ||
    value.kind !== "reveal" ||
    !isNonBlank(value.heading) ||
    !isBody(value.body) ||
    !Array.isArray(value.asides) ||
    value.asides.length > 1
  ) {
    return false
  }

  return value.asides.every(
    (aside) =>
      isRecord(aside) && hasExactKeys(aside, ["body"]) && isBody(aside.body)
  )
}

function isCapabilitiesSection(
  value: UnknownRecord
): value is TeacherPreviewCapabilitiesSectionDto {
  if (
    !hasExactKeys(value, ["kind", "heading", "items"]) ||
    value.kind !== "capabilities" ||
    !isNonBlank(value.heading) ||
    !Array.isArray(value.items) ||
    value.items.length !== 4
  ) {
    return false
  }

  return value.items.every(
    (item) =>
      isRecord(item) &&
      hasExactKeys(item, ["label", "heading", "body"]) &&
      isNullableNonBlank(item.label) &&
      isNullableNonBlank(item.heading) &&
      isBody(item.body)
  )
}

function isCloseSection(
  value: UnknownRecord
): value is TeacherPreviewCloseSectionDto {
  return (
    hasExactKeys(value, ["kind", "heading", "body", "action"]) &&
    value.kind === "close" &&
    isNonBlank(value.heading) &&
    isBody(value.body) &&
    isAction(value.action)
  )
}

function isAccessSupportSection(
  value: UnknownRecord
): value is TeacherPreviewAccessSupportSectionDto {
  return (
    hasExactKeys(value, [
      "kind",
      "heading",
      "accessHeading",
      "methodLabel",
      "method",
      "accountNote",
    ]) &&
    value.kind === "access-support" &&
    isNonBlank(value.heading) &&
    isNonBlank(value.accessHeading) &&
    isNonBlank(value.methodLabel) &&
    isNonBlank(value.method) &&
    isNonBlank(value.accountNote)
  )
}

function isSection(value: unknown): value is TeacherPreviewSectionDto {
  if (!isRecord(value)) return false

  switch (value.kind) {
    case "promise":
      return isPromiseSection(value)
    case "connected-story":
      return isConnectedStorySection(value)
    case "reveal":
      return isRevealSection(value)
    case "capabilities":
      return isCapabilitiesSection(value)
    case "close":
      return isCloseSection(value)
    case "access-support":
      return isAccessSupportSection(value)
    default:
      return false
  }
}

export function isTeacherPreviewDocumentDto(
  value: unknown
): value is TeacherPreviewDocumentDto {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["brand", "sections", "footer"]) ||
    !isNonBlank(value.brand) ||
    !Array.isArray(value.sections) ||
    value.sections.length < 1 ||
    value.sections.length > 19 ||
    !value.sections.every(isSection) ||
    !isRecord(value.footer) ||
    !hasExactKeys(value.footer, ["brand", "body", "feedbackLabel"]) ||
    value.footer.brand !== value.brand ||
    !isBody(value.footer.body) ||
    !isNullableNonBlank(value.footer.feedbackLabel)
  ) {
    return false
  }

  const counts = new Map<TeacherPreviewSectionKind, number>()
  for (const section of value.sections) {
    counts.set(section.kind, (counts.get(section.kind) ?? 0) + 1)
  }
  return (
    value.sections[0]?.kind === "promise" &&
    counts.get("promise") === 1 &&
    teacherPreviewSectionKinds
      .filter((kind) => kind !== "promise")
      .every((kind) => (counts.get(kind) ?? 0) <= 4)
  )
}

export function isCanonicalTeacherPreviewDocumentDto(
  value: unknown
): value is TeacherPreviewDocumentDto {
  if (
    !isTeacherPreviewDocumentDto(value) ||
    value.sections.length !== canonicalTeacherPreviewSectionKinds.length ||
    !value.sections.every(
      (section, index) =>
        section.kind === canonicalTeacherPreviewSectionKinds[index]
    )
  ) {
    return false
  }

  const promise = value.sections[0]
  if (promise.kind !== "promise") return false
  const screenSources = [
    promise.screen.src,
    ...value.sections.flatMap((section) =>
      section.kind === "connected-story"
        ? section.steps.map((step) => step.screen.src)
        : []
    ),
  ]
  return screenSources.length === 6 && new Set(screenSources).size === 6
}
