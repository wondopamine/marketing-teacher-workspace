import { describe, expect, it } from "vitest"

import { digestCmsVersionContract } from "./canonical.server"
import { buildCmsReviewTargetSeeds } from "./review-targets.server"
import { isCmsVersionContract, projectCmsPageDocument } from "./validation"
import {
  cmsHomepagePageId,
  homepageV1Contract,
} from "./templates/homepage-v1.server"
import { buildTeacherPreviewPageData } from "@/content/teacher-preview-document.server"

describe("CMS homepage version 1", () => {
  it("projects to the exact teacher preview that is already approved", () => {
    const current = buildTeacherPreviewPageData()
    expect(current.kind).toBe("ready")
    if (current.kind !== "ready") return

    expect(isCmsVersionContract(homepageV1Contract)).toBe(true)
    expect(projectCmsPageDocument(homepageV1Contract.pageDocument)).toEqual(
      current.document
    )
  })

  it("has a stable digest and stable review targets", () => {
    const firstTargets = buildCmsReviewTargetSeeds(
      cmsHomepagePageId,
      homepageV1Contract.pageDocument
    )
    const secondTargets = buildCmsReviewTargetSeeds(
      cmsHomepagePageId,
      structuredClone(homepageV1Contract.pageDocument)
    )

    expect(digestCmsVersionContract(homepageV1Contract)).toMatch(
      /^[0-9a-f]{64}$/
    )
    expect(secondTargets).toEqual(firstTargets)
    expect(new Set(firstTargets.map((target) => target.id)).size).toBe(
      firstTargets.length
    )
    expect(firstTargets.some((target) => target.kind === "field")).toBe(true)
    expect(firstTargets.some((target) => target.kind === "screen")).toBe(true)
  })

  it("removes stable IDs and review data from the public projection", () => {
    const projected = projectCmsPageDocument(homepageV1Contract.pageDocument)
    const serialised = JSON.stringify(projected)

    expect(serialised).not.toContain(cmsHomepagePageId)
    for (const key of [
      "reviewDocument",
      "designIntent",
      "schemaVersion",
      "editorDisplayName",
      "canonicalDigest",
    ]) {
      expect(serialised).not.toContain(key)
    }
  })
})
