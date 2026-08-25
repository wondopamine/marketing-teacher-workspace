import {
  normaliseCmsPath,
  projectCmsPageDocument,
} from "./validation"
import type { CmsPageDocument } from "./document"
import type { TeacherPreviewDocumentDto } from "@/content/teacher-preview-document"
import { isTeacherPreviewDocumentDto } from "@/content/teacher-preview-document"

export type CmsPublicPageDto = {
  readonly metadata: {
    readonly title: string
    readonly path: string
    readonly description: string
  }
  readonly document: TeacherPreviewDocumentDto
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function hasExactKeys(
  value: UnknownRecord,
  expected: ReadonlyArray<string>
): boolean {
  const actual = Object.keys(value).sort()
  const keys = [...expected].sort()
  return (
    actual.length === keys.length &&
    actual.every((key, index) => key === keys[index])
  )
}

function isNonBlank(value: unknown, maximum: number): value is string {
  return (
    typeof value === "string" &&
    value.length <= maximum &&
    value.replace(/\p{Cf}/gu, "").trim().length > 0
  )
}

export function isCmsPublicPageDto(value: unknown): value is CmsPublicPageDto {
  if (!isRecord(value) || !hasExactKeys(value, ["metadata", "document"])) {
    return false
  }
  if (
    !isRecord(value.metadata) ||
    !hasExactKeys(value.metadata, ["title", "path", "description"])
  ) {
    return false
  }
  return (
    isNonBlank(value.metadata.title, 200) &&
    isNonBlank(value.metadata.description, 500) &&
    typeof value.metadata.path === "string" &&
    normaliseCmsPath(value.metadata.path) === value.metadata.path &&
    isTeacherPreviewDocumentDto(value.document)
  )
}

export function projectCmsPublicPage(
  pageDocument: CmsPageDocument
): CmsPublicPageDto | null {
  const document = projectCmsPageDocument(pageDocument)
  if (!document) return null
  const projected: CmsPublicPageDto = {
    metadata: {
      title: pageDocument.page.title,
      path: pageDocument.page.path,
      description: pageDocument.page.description,
    },
    document,
  }
  return isCmsPublicPageDto(projected) ? projected : null
}
