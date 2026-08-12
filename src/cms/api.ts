import type {
  CmsComment,
  CmsCommentStatus,
  CmsCommentSubject,
  CmsCommitResult,
  CmsHead,
  CmsLifecycleHead,
  CmsPageCreateResult,
  CmsPageLifecycleResult,
  CmsPageState,
  CmsPublicationResult,
  CmsRepositoryErrorCode,
  CmsUnpublicationResult,
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

export type CmsUnpublishRequest = {
  readonly operation: "unpublish"
  readonly pageId: string
  readonly expectedPublished: CmsHead
  readonly displayName: string
  readonly attemptId: string
}

export type CmsWriteRequest =
  | CmsSaveRequest
  | CmsRestoreRequest
  | CmsPublishRequest
  | CmsUnpublishRequest

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
      readonly ok: true
      readonly operation: "unpublish"
      readonly result: CmsUnpublicationResult
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

export type CmsCreateCommentRequest = {
  readonly operation: "create"
  readonly commentId: string
  readonly pageId: string
  readonly targetId: string
  readonly targetVersionId: string
  readonly subject: CmsCommentSubject
  readonly body: string
  readonly displayName: string
}

export type CmsSetCommentStatusRequest = {
  readonly operation: "set-status"
  readonly pageId: string
  readonly commentId: string
  readonly status: CmsCommentStatus
}

export type CmsCommentWriteRequest =
  | CmsCreateCommentRequest
  | CmsSetCommentStatusRequest

export type CmsCommentReadResponse =
  | {
      readonly ok: true
      readonly comments: ReadonlyArray<CmsComment>
    }
  | {
      readonly ok: false
      readonly code: CmsRepositoryErrorCode | "UNAUTHORIZED" | "UNAVAILABLE"
      readonly message: string
    }

export type CmsCommentWriteResponse =
  | {
      readonly ok: true
      readonly comment: CmsComment
    }
  | {
      readonly ok: false
      readonly code: CmsRepositoryErrorCode | "UNAUTHORIZED" | "UNAVAILABLE"
      readonly message: string
    }

export type CmsCreatePageRequest = {
  readonly operation: "create"
  readonly pageId: string
  readonly attemptId: string
  readonly templateId: "homepage-v1"
  readonly title: string
  readonly path: string
  readonly displayName: string
}

export type CmsDuplicatePageRequest = {
  readonly operation: "duplicate"
  readonly pageId: string
  readonly sourcePageId: string
  readonly attemptId: string
  readonly title: string
  readonly path: string
  readonly displayName: string
}

export type CmsChangePageLifecycleRequest = {
  readonly operation: "archive" | "restore-archived"
  readonly pageId: string
  readonly expectedLifecycle: CmsLifecycleHead
  readonly attemptId: string
  readonly displayName: string
}

export type CmsPageWriteRequest =
  | CmsCreatePageRequest
  | CmsDuplicatePageRequest
  | CmsChangePageLifecycleRequest

export type CmsPageReadResponse =
  | {
      readonly ok: true
      readonly pages: ReadonlyArray<CmsPageState>
    }
  | {
      readonly ok: false
      readonly code: CmsRepositoryErrorCode | "UNAUTHORIZED" | "UNAVAILABLE"
      readonly message: string
    }

export type CmsPageWriteResponse =
  | {
      readonly ok: true
      readonly operation: "create" | "duplicate"
      readonly result: CmsPageCreateResult
    }
  | {
      readonly ok: true
      readonly operation: "archive" | "restore-archived"
      readonly result: CmsPageLifecycleResult
    }
  | {
      readonly ok: false
      readonly code: CmsRepositoryErrorCode | "UNAUTHORIZED" | "UNAVAILABLE"
      readonly message: string
    }
