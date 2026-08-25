import { describe, expect, it } from "vitest"

import { isCmsPublicPageDto, projectCmsPublicPage } from "./public-page"
import { homepageV1Contract } from "./templates/homepage-v1.server"

function collectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    value.forEach((item) => collectKeys(item, keys))
    return keys
  }
  if (typeof value !== "object" || value === null) return keys
  for (const [key, nested] of Object.entries(value)) {
    keys.add(key)
    collectKeys(nested, keys)
  }
  return keys
}

describe("CMS public page projection", () => {
  it("keeps only approved public metadata and teacher-facing content", () => {
    const projected = projectCmsPublicPage(homepageV1Contract.pageDocument)
    expect(projected).not.toBeNull()
    expect(isCmsPublicPageDto(projected)).toBe(true)
    expect(Object.keys(projected ?? {})).toEqual(["metadata", "document"])
    expect(Object.keys(projected?.metadata ?? {})).toEqual([
      "title",
      "path",
      "description",
    ])

    const keys = collectKeys(projected)
    for (const prohibited of [
      "id",
      "pageId",
      "reviewDocument",
      "designIntent",
      "checks",
      "decisionNeeded",
      "comment",
      "editorDisplayName",
      "head",
      "versionId",
      "versionNumber",
      "digest",
      "history",
      "schemaVersion",
      "state",
    ]) {
      expect(keys.has(prohibited), prohibited).toBe(false)
    }
    expect(JSON.stringify(projected)).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i
    )
  })

  it("omits hidden and archived sections", () => {
    const changed = {
      ...homepageV1Contract.pageDocument,
      sections: homepageV1Contract.pageDocument.sections.map(
        (section, index) =>
          index === 1
            ? { ...section, state: "hidden" as const }
            : index === 2
              ? { ...section, state: "archived" as const }
              : section
      ),
    }

    const projected = projectCmsPublicPage(changed)
    expect(projected?.document.sections.map((section) => section.kind)).toEqual(
      ["promise", "connected-story", "connected-story", "reveal", "close"]
    )
  })

  it("rejects extra operational fields", () => {
    const projected = projectCmsPublicPage(homepageV1Contract.pageDocument)
    expect(isCmsPublicPageDto({ ...projected, versionNumber: 1 })).toBe(false)
    expect(
      isCmsPublicPageDto({
        ...projected,
        metadata: { ...projected?.metadata, pageId: "private" },
      })
    ).toBe(false)
  })
})
