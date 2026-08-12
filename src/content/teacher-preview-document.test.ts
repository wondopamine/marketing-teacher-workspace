import { describe, expect, it } from "vitest"

import {
  isCanonicalTeacherPreviewDocumentDto,
  isTeacherPreviewDocumentDto,
  teacherPreviewSectionKinds,
} from "./teacher-preview-document"
import { buildTeacherPreviewPageData } from "./teacher-preview-document.server"

function readyDocument() {
  const result = buildTeacherPreviewPageData()
  if (result.kind !== "ready") {
    throw new Error("Expected the canonical teacher preview to be ready")
  }
  return result.document
}

describe("teacher-preview document contract", () => {
  it("keeps the imported source on the six canonical sections in exact order", () => {
    const document = readyDocument()

    expect(isTeacherPreviewDocumentDto(document)).toBe(true)
    expect(isCanonicalTeacherPreviewDocumentDto(document)).toBe(true)
    expect(document.sections.map((section) => section.kind)).toEqual(
      teacherPreviewSectionKinds
    )

    const reordered = {
      ...document,
      sections: [
        document.sections[1],
        document.sections[0],
        ...document.sections.slice(2),
      ],
    }
    expect(isCanonicalTeacherPreviewDocumentDto(reordered)).toBe(false)
  })

  it("accepts bounded CMS repeats after the opening section", () => {
    const document = readyDocument()
    const reordered = {
      ...document,
      sections: [
        document.sections[0],
        document.sections[3],
        document.sections[2],
        document.sections[1],
        document.sections[4],
        document.sections[5],
        document.sections[2],
      ],
    }

    expect(isTeacherPreviewDocumentDto(reordered)).toBe(true)
    expect(isCanonicalTeacherPreviewDocumentDto(reordered)).toBe(false)
  })

  it("rejects extra keys at every public boundary", () => {
    const document = readyDocument()
    const promise = document.sections[0]
    if (promise.kind !== "promise") {
      throw new Error("Expected the first section to be the promise")
    }

    expect(
      isTeacherPreviewDocumentDto({
        ...document,
        sections: [
          {
            ...promise,
            screen: { ...promise.screen, contentId: "screen.hero" },
          },
          ...document.sections.slice(1),
        ],
      })
    ).toBe(false)
  })

  it("rejects blank copy, unsafe screen paths, and duplicate screens", () => {
    const document = readyDocument()
    const promise = document.sections[0]
    if (promise.kind !== "promise") {
      throw new Error("Expected the first section to be the promise")
    }

    expect(
      isTeacherPreviewDocumentDto({
        ...document,
        sections: [
          { ...promise, heading: "\u200b" },
          ...document.sections.slice(1),
        ],
      })
    ).toBe(false)
    expect(
      isTeacherPreviewDocumentDto({
        ...document,
        sections: [
          {
            ...promise,
            screen: { ...promise.screen, src: "/hero/student-profile.png" },
          },
          ...document.sections.slice(1),
        ],
      })
    ).toBe(false)

    const story = document.sections[1]
    if (story.kind !== "connected-story") {
      throw new Error("Expected the second section to be the connected story")
    }
    expect(
      isTeacherPreviewDocumentDto({
        ...document,
        sections: [
          promise,
          {
            ...story,
            steps: [
              {
                ...story.steps[0],
                screen: promise.screen,
              },
              ...story.steps.slice(1),
            ],
          },
          ...document.sections.slice(2),
        ],
      })
    ).toBe(true)
    expect(
      isCanonicalTeacherPreviewDocumentDto({
        ...document,
        sections: [
          promise,
          {
            ...story,
            steps: [
              {
                ...story.steps[0],
                screen: promise.screen,
              },
              ...story.steps.slice(1),
            ],
          },
          ...document.sections.slice(2),
        ],
      })
    ).toBe(false)
  })
})
