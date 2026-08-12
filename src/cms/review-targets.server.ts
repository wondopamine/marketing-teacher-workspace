import "@tanstack/react-start/server-only"

import { createHash } from "node:crypto"

import type {
  CmsPageDocument,
  CmsReviewDocument,
  CmsSectionDocument,
} from "./document"

export type CmsReviewTargetSeed = {
  readonly id: string
  readonly pageId: string
  readonly sectionId: string | null
  readonly fieldKey: string | null
  readonly repeatedItemId: string | null
  readonly parentTargetId: string | null
  readonly kind: "page" | "section" | "field" | "repeated-item" | "screen"
  readonly state: "active" | "archived"
}

function derivedTargetId(parts: ReadonlyArray<string>): string {
  const bytes = createHash("sha256")
    .update(parts.join("\u001f"))
    .digest()
    .subarray(0, 16)
  bytes[6] = (bytes[6] & 0x0f) | 0x80
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const value = bytes.toString("hex")
  return [
    value.slice(0, 8),
    value.slice(8, 12),
    value.slice(12, 16),
    value.slice(16, 20),
    value.slice(20),
  ].join("-")
}

function fieldTarget(
  pageId: string,
  sectionId: string,
  fieldKey: string,
  parentTargetId: string,
  repeatedItemId: string | null = null
): CmsReviewTargetSeed {
  return {
    id: derivedTargetId([
      "cms-field-target-v1",
      pageId,
      sectionId,
      repeatedItemId ?? "",
      fieldKey,
    ]),
    pageId,
    sectionId,
    fieldKey,
    repeatedItemId,
    parentTargetId,
    kind: "field",
    state: "active",
  }
}

function entityTarget(
  pageId: string,
  sectionId: string,
  id: string,
  kind: "repeated-item" | "screen",
  parentTargetId: string
): CmsReviewTargetSeed {
  return {
    id,
    pageId,
    sectionId,
    fieldKey: null,
    repeatedItemId: id,
    parentTargetId,
    kind,
    state: "active",
  }
}

function screenTargets(
  pageId: string,
  sectionId: string,
  screen: { readonly id: string },
  parentTargetId: string
): ReadonlyArray<CmsReviewTargetSeed> {
  const screenTarget = entityTarget(
    pageId,
    sectionId,
    screen.id,
    "screen",
    parentTargetId
  )
  return [
    screenTarget,
    ...["screen.src", "screen.alt", "screen.breadcrumb"].map((fieldKey) =>
      fieldTarget(pageId, sectionId, fieldKey, screen.id, screen.id)
    ),
  ]
}

function sectionFieldTargets(
  pageId: string,
  section: CmsSectionDocument
): ReadonlyArray<CmsReviewTargetSeed> {
  const base = (fieldKeys: ReadonlyArray<string>) =>
    fieldKeys.map((fieldKey) =>
      fieldTarget(pageId, section.id, fieldKey, section.id)
    )

  if (section.type === "promise") {
    return [
      ...base(["eyebrow", "heading", "body", "action.label", "action.note"]),
      ...screenTargets(pageId, section.id, section.fields.screen, section.id),
    ]
  }
  if (section.type === "connected-story") {
    return [
      ...base(["heading"]),
      ...section.fields.steps.flatMap((step) => [
        entityTarget(pageId, section.id, step.id, "repeated-item", section.id),
        ...["steps.label", "steps.heading", "steps.body"].map((fieldKey) =>
          fieldTarget(pageId, section.id, fieldKey, step.id, step.id)
        ),
        ...screenTargets(pageId, section.id, step.screen, step.id),
      ]),
    ]
  }
  if (section.type === "reveal") {
    return [
      ...base(["heading", "body"]),
      ...section.fields.asides.flatMap((aside) => [
        entityTarget(pageId, section.id, aside.id, "repeated-item", section.id),
        fieldTarget(pageId, section.id, "asides.body", aside.id, aside.id),
      ]),
    ]
  }
  if (section.type === "capabilities") {
    return [
      ...base(["heading"]),
      ...section.fields.items.flatMap((item) => [
        entityTarget(pageId, section.id, item.id, "repeated-item", section.id),
        ...["items.label", "items.heading", "items.body"].map((fieldKey) =>
          fieldTarget(pageId, section.id, fieldKey, item.id, item.id)
        ),
      ]),
    ]
  }
  if (section.type === "close") {
    return base(["heading", "body", "action.label", "action.note"])
  }
  if (section.type === "access-support") {
    return base([
      "heading",
      "accessHeading",
      "methodLabel",
      "method",
      "accountNote",
    ])
  }
  return base(["brand", "body", "feedbackLabel"])
}

export function buildCmsReviewTargetSeeds(
  pageId: string,
  document: CmsPageDocument
): ReadonlyArray<CmsReviewTargetSeed> {
  const pageTarget: CmsReviewTargetSeed = {
    id: pageId,
    pageId,
    sectionId: null,
    fieldKey: null,
    repeatedItemId: null,
    parentTargetId: null,
    kind: "page",
    state: "active",
  }
  const pageFields = ["title", "path", "description", "brand"].map(
    (fieldKey) => ({
      ...fieldTarget(pageId, pageId, `page.${fieldKey}`, pageId),
      sectionId: null,
    })
  )
  const sectionTargets = document.sections.flatMap((section) => [
    ...[
      {
        id: section.id,
        pageId,
        sectionId: section.id,
        fieldKey: null,
        repeatedItemId: null,
        parentTargetId: pageId,
        kind: "section" as const,
        state: "active" as const,
      },
      ...sectionFieldTargets(pageId, section),
    ].map((target) => ({
      ...target,
      state:
        section.state === "archived" ? ("archived" as const) : target.state,
    })),
  ])

  const targets = [pageTarget, ...pageFields, ...sectionTargets]
  const ids = targets.map((target) => target.id)
  if (new Set(ids).size !== ids.length) {
    throw new Error("CMS review target generation produced a duplicate ID")
  }
  return targets
}

export function remapCmsReviewDocument(
  sourcePageId: string,
  targetPageId: string,
  sourcePage: CmsPageDocument,
  targetPage: CmsPageDocument,
  sourceReview: CmsReviewDocument,
  idMap: ReadonlyMap<string, string>
): CmsReviewDocument {
  const sourceSeeds = buildCmsReviewTargetSeeds(sourcePageId, sourcePage)
  const targetSeeds = buildCmsReviewTargetSeeds(targetPageId, targetPage)
  const targets: Record<
    string,
    NonNullable<CmsReviewDocument["targets"][string]>
  > = {}

  for (const source of sourceSeeds) {
    const context = sourceReview.targets[source.id]
    if (!context) continue

    let targetId: string | undefined
    if (source.kind === "page") {
      targetId = targetPageId
    } else if (
      source.kind === "section" ||
      source.kind === "repeated-item" ||
      source.kind === "screen"
    ) {
      targetId = idMap.get(source.id)
    } else {
      const targetSectionId = source.sectionId
        ? idMap.get(source.sectionId)
        : null
      const targetRepeatedItemId = source.repeatedItemId
        ? idMap.get(source.repeatedItemId)
        : null
      targetId = targetSeeds.find(
        (candidate) =>
          candidate.kind === "field" &&
          candidate.sectionId === targetSectionId &&
          candidate.fieldKey === source.fieldKey &&
          candidate.repeatedItemId === targetRepeatedItemId
      )?.id
    }
    if (targetId) targets[targetId] = structuredClone(context)
  }

  return { targets }
}
