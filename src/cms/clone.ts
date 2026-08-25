import type {
  CmsPageDocument,
  CmsReviewDocument,
  CmsSectionDocument,
  CmsVersionContract,
} from "./document"

export type CmsIdFactory = () => string

export type CmsSectionClone = {
  readonly section: CmsSectionDocument
  readonly idMap: ReadonlyMap<string, string>
}

function rememberFreshId(
  idMap: Map<string, string>,
  currentId: string,
  createId: CmsIdFactory
): string {
  const nextId = createId()
  idMap.set(currentId, nextId)
  return nextId
}

export function cloneCmsSection(
  source: CmsSectionDocument,
  createId: CmsIdFactory = () => crypto.randomUUID()
): CmsSectionClone {
  const next = structuredClone(source)
  const idMap = new Map<string, string>()
  const sectionId = rememberFreshId(idMap, next.id, createId)

  if (next.type === "promise") {
    return {
      idMap,
      section: {
        ...next,
        id: sectionId,
        fields: {
          ...next.fields,
          screen: {
            ...next.fields.screen,
            id: rememberFreshId(idMap, next.fields.screen.id, createId),
          },
        },
      },
    }
  }
  if (next.type === "connected-story") {
    return {
      idMap,
      section: {
        ...next,
        id: sectionId,
        fields: {
          ...next.fields,
          steps: next.fields.steps.map((step) => ({
            ...step,
            id: rememberFreshId(idMap, step.id, createId),
            screen: {
              ...step.screen,
              id: rememberFreshId(idMap, step.screen.id, createId),
            },
          })),
        },
      },
    }
  }
  if (next.type === "reveal") {
    return {
      idMap,
      section: {
        ...next,
        id: sectionId,
        fields: {
          ...next.fields,
          asides: next.fields.asides.map((aside) => ({
            ...aside,
            id: rememberFreshId(idMap, aside.id, createId),
          })),
        },
      },
    }
  }
  if (next.type === "capabilities") {
    return {
      idMap,
      section: {
        ...next,
        id: sectionId,
        fields: {
          ...next.fields,
          items: next.fields.items.map((item) => ({
            ...item,
            id: rememberFreshId(idMap, item.id, createId),
          })),
        },
      },
    }
  }
  return { idMap, section: { ...next, id: sectionId } }
}

export function copyCmsReviewContexts(
  source: CmsReviewDocument,
  idMap: ReadonlyMap<string, string>
): CmsReviewDocument {
  const targets: Record<
    string,
    NonNullable<CmsReviewDocument["targets"][string]>
  > = {}
  for (const [sourceId, targetId] of idMap) {
    const context = source.targets[sourceId]
    if (context) targets[targetId] = structuredClone(context)
  }
  return { targets }
}

export function cloneCmsContractForPage(
  source: CmsVersionContract,
  options: {
    readonly title: string
    readonly path: string
    readonly createId?: CmsIdFactory
  }
): {
  readonly contract: CmsVersionContract
  readonly idMap: ReadonlyMap<string, string>
} {
  const createId = options.createId ?? (() => crypto.randomUUID())
  const idMap = new Map<string, string>()
  const sections = source.pageDocument.sections.map((section) => {
    const cloned = cloneCmsSection(section, createId)
    cloned.idMap.forEach((targetId, sourceId) => idMap.set(sourceId, targetId))
    return cloned.section
  })
  const pageDocument: CmsPageDocument = {
    page: {
      ...source.pageDocument.page,
      title: options.title,
      path: options.path,
    },
    sections,
  }
  return {
    idMap,
    contract: {
      pageSchemaVersion: source.pageSchemaVersion,
      reviewSchemaVersion: source.reviewSchemaVersion,
      sectionLibraryVersion: source.sectionLibraryVersion,
      pageDocument,
      reviewDocument: copyCmsReviewContexts(source.reviewDocument, idMap),
    },
  }
}
