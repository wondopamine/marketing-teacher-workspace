import { describe, expect, it } from "vitest"

import {
  contentReviewManifest,
  createContentReviewRegistry,
} from "./landing-v2-review.server"
import { buildTeacherPreviewPageData } from "./teacher-preview-document.server"
import { teacherPreviewScreenCatalog } from "./teacher-preview-screen-catalog.server"

import type { ContentReviewRegistryEntry } from "./landing-v2-review.server"
import type { TeacherPreviewScreenRecord } from "./teacher-preview-screen-catalog.server"

function collectObjectKeys(
  value: unknown,
  keys = new Set<string>()
): Set<string> {
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjectKeys(item, keys))
    return keys
  }
  if (!value || typeof value !== "object") return keys

  for (const [key, nested] of Object.entries(value)) {
    keys.add(key)
    collectObjectKeys(nested, keys)
  }
  return keys
}

describe("teacher-preview server adapter", () => {
  it("returns the one strict teacher-facing document and nothing else", () => {
    const result = buildTeacherPreviewPageData()

    expect(result.kind).toBe("ready")
    expect(Object.keys(result).sort()).toEqual(["document", "kind"])
    if (result.kind !== "ready") return

    expect(Object.keys(result.document).sort()).toEqual([
      "brand",
      "footer",
      "sections",
    ])
    expect(result.document.sections.map((section) => section.kind)).toEqual([
      "promise",
      "connected-story",
      "reveal",
      "capabilities",
      "close",
      "access-support",
    ])

    const keys = collectObjectKeys(result)
    const allowedKeys = new Set([
      "kind",
      "document",
      "brand",
      "sections",
      "footer",
      "eyebrow",
      "heading",
      "body",
      "action",
      "screen",
      "label",
      "note",
      "src",
      "alt",
      "breadcrumb",
      "steps",
      "asides",
      "items",
      "accessHeading",
      "methodLabel",
      "method",
      "accountNote",
      "feedbackLabel",
    ])
    expect([...keys].filter((key) => !allowedKeys.has(key))).toEqual([])

    for (const prohibitedKey of [
      "contentId",
      "reviewReference",
      "review",
      "rationale",
      "governance",
      "pending",
      "href",
      "schemaVersion",
      "version",
      "history",
      "editor",
      "comment",
      "target",
    ]) {
      expect(keys.has(prohibitedKey), prohibitedKey).toBe(false)
    }

    const serialised = JSON.stringify(result).toLowerCase()
    for (const prohibitedValue of [
      "tw-",
      "contextual-intelligence",
      "hey-talia",
      "teacher.digital.moe.gov.sg",
      "teacherworkspace-feedback",
      "question for the pm",
    ]) {
      expect(serialised, prohibitedValue).not.toContain(prohibitedValue)
    }
  })

  it("embeds all six safe local screens in their semantic story moments", () => {
    const registry = [...createContentReviewRegistry()]
    const storyEntryIndexes = registry.flatMap((entry, index) =>
      entry.role === "entry" && entry.sectionKind === "connected-story"
        ? [index]
        : []
    )
    const reversedStoryEntries = storyEntryIndexes
      .map((index) => registry[index])
      .reverse()
    storyEntryIndexes.forEach((registryIndex, index) => {
      registry[registryIndex] = reversedStoryEntries[index]
    })

    const result = buildTeacherPreviewPageData({
      registry,
      screens: [...teacherPreviewScreenCatalog].reverse(),
    })
    expect(result.kind).toBe("ready")
    if (result.kind !== "ready") return

    const promise = result.document.sections[0]
    const story = result.document.sections[1]
    expect(promise.kind).toBe("promise")
    expect(story.kind).toBe("connected-story")
    if (promise.kind !== "promise" || story.kind !== "connected-story") return

    expect(promise.screen.src).toBe(
      "/content-review/screens/student-profile.png"
    )
    expect(story.steps.map((step) => step.screen.src)).toEqual([
      "/content-review/screens/student-insights-class.png",
      "/content-review/screens/student-profile-family.png",
      "/content-review/screens/guidance.png",
      "/content-review/screens/post-composer.png",
      "/content-review/screens/post-read-tracking.png",
    ])
    expect(
      [promise.screen, ...story.steps.map((step) => step.screen)].every(
        (screen) =>
          screen.src.startsWith("/content-review/screens/") &&
          screen.alt.trim().length > 0 &&
          screen.breadcrumb.length > 0
      )
    ).toBe(true)
  })

  it("fails closed for duplicate or missing internal content IDs", () => {
    const registry = createContentReviewRegistry()
    const duplicateRegistry = [
      ...registry,
      registry[0],
    ] as ReadonlyArray<ContentReviewRegistryEntry>

    expect(
      buildTeacherPreviewPageData({ registry: duplicateRegistry })
    ).toEqual({ kind: "error" })
    expect(
      buildTeacherPreviewPageData({ manifest: contentReviewManifest.slice(1) })
    ).toEqual({ kind: "error" })
  })

  it("fails closed for wrong source section order and blank required copy", () => {
    const reordered = [...createContentReviewRegistry()]
    const promiseIndex = reordered.findIndex(
      (entry) => entry.role === "section" && entry.sectionKind === "promise"
    )
    const storyIndex = reordered.findIndex(
      (entry) =>
        entry.role === "section" && entry.sectionKind === "connected-story"
    )
    const promiseMarker = reordered[promiseIndex]
    reordered[promiseIndex] = reordered[storyIndex]
    reordered[storyIndex] = promiseMarker

    expect(buildTeacherPreviewPageData({ registry: reordered })).toEqual({
      kind: "error",
    })

    const blankCopy = createContentReviewRegistry().map((entry) =>
      entry.role === "entry" &&
      entry.contentId === "promise.hero" &&
      entry.entry.kind === "content"
        ? {
            ...entry,
            entry: { ...entry.entry, heading: " " },
          }
        : entry
    ) as unknown as ReadonlyArray<ContentReviewRegistryEntry>
    expect(buildTeacherPreviewPageData({ registry: blankCopy })).toEqual({
      kind: "error",
    })
  })

  it.each([
    ["review reference", "TW-PRIVATE"],
    ["stable content ID", "journey.promise"],
    ["capability content ID", "capability.hey-talia"],
    ["destination", "https://teacher.digital.moe.gov.sg/private"],
    ["non-HTTP destination", "mailto:internal@example.com"],
    ["embedded-data destination", "data:image/png;base64,private"],
    ["governance phrase", "Approved by Xingyu (PM)"],
    ["decision label", "Proof copy and testimonial permission"],
    ["pending rationale", "Question for the PM: approve this claim"],
  ])("fails closed when copy contains an injected %s", (_label, heading) => {
    const registry = createContentReviewRegistry().map((entry) =>
      entry.role === "entry" &&
      entry.contentId === "promise.hero" &&
      entry.entry.kind === "content"
        ? {
            ...entry,
            entry: { ...entry.entry, heading },
          }
        : entry
    ) as unknown as ReadonlyArray<ContentReviewRegistryEntry>

    expect(buildTeacherPreviewPageData({ registry })).toEqual({ kind: "error" })
  })

  it("fails closed for duplicate screen IDs and non-local screen sources", () => {
    const duplicateIds = teacherPreviewScreenCatalog.map((screen, index) =>
      index === 1 ? { ...screen, id: "hero" } : screen
    ) as unknown as ReadonlyArray<TeacherPreviewScreenRecord>
    const unsafeSource = teacherPreviewScreenCatalog.map((screen) =>
      screen.id === "hero"
        ? { ...screen, src: "https://example.com/student-profile.png" }
        : screen
    ) as unknown as ReadonlyArray<TeacherPreviewScreenRecord>

    expect(buildTeacherPreviewPageData({ screens: duplicateIds })).toEqual({
      kind: "error",
    })
    expect(buildTeacherPreviewPageData({ screens: unsafeSource })).toEqual({
      kind: "error",
    })
  })
})
