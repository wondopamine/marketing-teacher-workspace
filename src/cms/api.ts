import type {
  CmsCommitResult,
  CmsHead,
  CmsPublicationResult,
  CmsRepositoryErrorCode,
  CmsVersionHistoryPage,
  CmsVersionSnapshot,
} from "@/db/content-repository.server"
import type { CmsVersionContract } from "./document"

export type CmsSaveRequest = {
  readonly operation: "save"
  readonly pageId: string
  readonly expectedHead: CmsHead
  readonly contract: CmsVersionContract
  readonly displayName: string
  readonly attemptId: string
}

export type CmsRestoreRequest = {
  readonly operation: "restore"
  readonly pageId: string
  readonly sourceVersionId: string
  readonly expectedHead: CmsHead
  readonly displayName: string
  readonly attemptId: string
}

export type CmsPublishRequest = {
  readonly operation: "publish"
  readonly pageId: string
  readonly versionId: string
  readonly expectedDraft: CmsHead
  readonly expectedPublished: CmsHead | null
  readonly displayName: string
  readonly attemptId: string
}

export type CmsWriteRequest =
  | CmsSaveRequest
  | CmsRestoreRequest
  | CmsPublishRequest

export type CmsWriteResponse =
  | {
      readonly ok: true
      readonly operation: "save" | "restore"
      readonly result: CmsCommitResult
    }
  | {
      readonly ok: true
      readonly operation: "publish"
      readonly result: CmsPublicationResult
    }
  | {
      readonly ok: false
      readonly code: CmsRepositoryErrorCode | "UNAUTHORIZED" | "UNAVAILABLE"
      readonly message: string
      readonly latest: CmsVersionSnapshot | null
    }

export type CmsReadResponse =
  | {
      readonly ok: true
      readonly kind: "history"
      readonly history: CmsVersionHistoryPage
    }
  | {
      readonly ok: true
      readonly kind: "version"
      readonly version: CmsVersionSnapshot
    }
  | {
      readonly ok: false
      readonly code: CmsRepositoryErrorCode | "UNAUTHORIZED" | "UNAVAILABLE"
      readonly message: string
    }
