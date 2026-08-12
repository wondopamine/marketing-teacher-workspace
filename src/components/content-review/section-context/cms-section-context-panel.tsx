import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useReviewAnnotations } from "../review-annotations"
import { readCmsComments, writeCmsComment } from "../editor/cms-client"
import type {
  CmsComment,
  CmsCommentStatus,
  CmsCommentSubject,
} from "@/db/content-repository.server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type FeedbackAttempt = {
  readonly fingerprint: string
  readonly commentId: string
}

function subjectLabel(subject: CmsCommentSubject): string {
  return subject === "page-content" ? "Page content" : "Design intent"
}

function statusLabel(status: CmsCommentStatus): string {
  if (status === "open") return "Open"
  if (status === "resolved") return "Resolved"
  return "Withdrawn"
}

export function CmsSectionContextPanel({
  pageId,
  versionId,
  csrfToken,
  displayName,
  onDisplayNameChange,
  onStatusMessage,
}: {
  readonly pageId: string
  readonly versionId: string
  readonly csrfToken: string
  readonly displayName: string
  readonly onDisplayNameChange: (value: string) => void
  readonly onStatusMessage: (message: string) => void
}) {
  const { annotations, selectedId } = useReviewAnnotations()
  const selected = selectedId ? annotations.get(selectedId) : null
  const [comments, setComments] = useState<ReadonlyArray<CmsComment>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryAction, setRetryAction] = useState<"load" | "add" | null>(null)
  const [busyCommentId, setBusyCommentId] = useState<string | null>(null)
  const [busyStatus, setBusyStatus] = useState<CmsCommentStatus | null>(null)
  const [statusControlOrigins, setStatusControlOrigins] = useState<
    Readonly<Record<string, "resolved" | "withdrawn">>
  >({})
  const [drafts, setDrafts] = useState<Readonly<Record<string, string>>>({})
  const [subjects, setSubjects] = useState<
    Readonly<Record<string, CmsCommentSubject>>
  >({})
  const feedbackAttemptRef = useRef<FeedbackAttempt | null>(null)

  const loadComments = useCallback(async () => {
    setLoading(true)
    setError(null)
    setRetryAction(null)
    try {
      const response = await readCmsComments(pageId, versionId)
      if (!response.ok) {
        setError(response.message)
        setRetryAction("load")
        return
      }
      setComments(response.comments)
    } catch {
      setError("Feedback is not available right now. Try again.")
      setRetryAction("load")
    } finally {
      setLoading(false)
    }
  }, [pageId, versionId])

  useEffect(() => {
    void loadComments()
  }, [loadComments])

  const selectedComments = useMemo(
    () => comments.filter((comment) => comment.targetId === selectedId),
    [comments, selectedId]
  )
  const draft = selectedId ? (drafts[selectedId] ?? "") : ""
  const subject = selectedId
    ? (subjects[selectedId] ?? "page-content")
    : "page-content"

  const addFeedback = useCallback(async () => {
    if (!selectedId || busyCommentId !== null) return
    const body = draft.trim()
    const name = displayName.trim()
    if (!name) {
      setError("Enter your name before adding feedback.")
      setRetryAction(null)
      return
    }
    if (!body) {
      setError("Write your feedback before adding it.")
      setRetryAction(null)
      return
    }
    const fingerprint = JSON.stringify({
      pageId,
      targetId: selectedId,
      versionId,
      subject,
      body,
      name,
    })
    const attempt =
      feedbackAttemptRef.current?.fingerprint === fingerprint
        ? feedbackAttemptRef.current
        : { fingerprint, commentId: crypto.randomUUID() }
    feedbackAttemptRef.current = attempt
    setBusyCommentId(attempt.commentId)
    setBusyStatus(null)
    setError(null)
    setRetryAction(null)
    try {
      const response = await writeCmsComment(
        {
          operation: "create",
          commentId: attempt.commentId,
          pageId,
          targetId: selectedId,
          targetVersionId: versionId,
          subject,
          body,
          displayName: name,
        },
        csrfToken
      )
      if (!response.ok) {
        setError(response.message)
        setRetryAction("add")
        return
      }
      feedbackAttemptRef.current = null
      setComments((current) => {
        const withoutRetry = current.filter(
          (comment) => comment.id !== response.comment.id
        )
        return [...withoutRetry, response.comment]
      })
      setDrafts((current) => ({ ...current, [selectedId]: "" }))
      onStatusMessage("Feedback added.")
    } catch {
      setError(
        "We could not add this feedback. Your note is still here. Try again."
      )
      setRetryAction("add")
    } finally {
      setBusyCommentId(null)
      setBusyStatus(null)
    }
  }, [
    busyCommentId,
    csrfToken,
    displayName,
    draft,
    onStatusMessage,
    pageId,
    selectedId,
    subject,
    versionId,
  ])

  const updateStatus = useCallback(
    async (comment: CmsComment, status: CmsCommentStatus) => {
      if (busyCommentId !== null) return
      setBusyCommentId(comment.id)
      setBusyStatus(status)
      if (status === "resolved" || status === "withdrawn") {
        setStatusControlOrigins((current) => ({
          ...current,
          [comment.id]: status,
        }))
      }
      setError(null)
      setRetryAction(null)
      try {
        const response = await writeCmsComment(
          {
            operation: "set-status",
            pageId,
            commentId: comment.id,
            status,
          },
          csrfToken
        )
        if (!response.ok) {
          setError(response.message)
          return
        }
        setComments((current) =>
          current.map((item) =>
            item.id === response.comment.id ? response.comment : item
          )
        )
        onStatusMessage(
          status === "open"
            ? "Feedback reopened."
            : status === "resolved"
              ? "Feedback resolved."
              : "Feedback withdrawn."
        )
      } catch {
        setError("We could not update this feedback. Try again.")
      } finally {
        setBusyCommentId(null)
        setBusyStatus(null)
      }
    },
    [busyCommentId, csrfToken, onStatusMessage, pageId]
  )

  const busyMessage =
    busyCommentId === null
      ? null
      : busyStatus === "resolved"
        ? "Resolving feedback…"
        : busyStatus === "withdrawn"
          ? "Withdrawing feedback…"
          : busyStatus === "open"
            ? "Reopening feedback…"
            : "Adding feedback…"

  return (
    <>
      <header className="border-b border-border px-4 py-4">
        <p className="font-semibold">Section context</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Use a numbered marker to review another section.
        </p>
        <p className="mt-3 border-l-2 border-foreground/40 pl-3 text-muted-foreground">
          Reviewer-only. Teachers will not see this panel or its feedback.
        </p>
      </header>

      <div className="space-y-5 px-4 py-4">
        {selected ? (
          <>
            <section aria-labelledby="cms-section-context-title">
              <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground">
                Why this section is here
              </p>
              <h2
                id="cms-section-context-title"
                className="mt-2 font-heading text-xl font-semibold"
              >
                {selected.title}
              </h2>
              <h3 className="mt-4 font-semibold">Design intent</h3>
              <p className="mt-1 max-w-[66ch] leading-6 text-muted-foreground">
                {selected.rationale}
              </p>
              {selected.details.length > 0 ? (
                <div className="mt-4">
                  <h3 className="font-semibold">What to check</h3>
                  <ul className="mt-2 max-w-[66ch] list-disc space-y-1 pl-5 text-muted-foreground">
                    {selected.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {selected.pending ? (
                <div className="mt-4 max-w-[66ch] border-l-2 border-foreground/50 bg-muted px-3 py-2">
                  <h3 className="font-semibold">Decision needed</h3>
                  <p className="mt-1 leading-5">{selected.pending}</p>
                </div>
              ) : null}
            </section>

            <section
              className="border-t border-border pt-5"
              aria-labelledby="cms-feedback-heading"
            >
              <h2
                id="cms-feedback-heading"
                className="font-heading text-lg font-semibold"
              >
                Your feedback
              </h2>
              <label className="mt-4 block">
                <span className="font-medium">Your name</span>
                <Input
                  value={displayName}
                  onChange={(event) => onDisplayNameChange(event.target.value)}
                  placeholder="Shown with your feedback"
                  className="mt-1 min-h-11"
                />
              </label>

              <fieldset className="mt-4">
                <legend className="font-medium">Your feedback is about</legend>
                <div className="mt-2 flex flex-wrap gap-3">
                  {(["page-content", "design-intent"] as const).map((value) => (
                    <label
                      className="inline-flex min-h-11 items-center gap-2"
                      key={value}
                    >
                      <input
                        type="radio"
                        name={`cms-feedback-subject-${selected.id}`}
                        value={value}
                        checked={subject === value}
                        onChange={() =>
                          setSubjects((current) => ({
                            ...current,
                            [selected.id]: value,
                          }))
                        }
                      />
                      {subjectLabel(value)}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="mt-4 block">
                <span className="font-medium">Feedback</span>
                <textarea
                  value={draft}
                  maxLength={4_000}
                  rows={4}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [selected.id]: event.target.value,
                    }))
                  }
                  placeholder="What should the team review?"
                  className="mt-1 w-full rounded-md border border-foreground/30 bg-background px-3 py-2 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </label>
              <Button
                type="button"
                size="lg"
                className="mt-3 min-h-11 w-full"
                disabled={draft.trim().length === 0}
                aria-disabled={busyCommentId !== null}
                onClick={() => void addFeedback()}
              >
                {busyCommentId === feedbackAttemptRef.current?.commentId
                  ? "Adding feedback…"
                  : "Add feedback"}
              </Button>
            </section>

            <section
              className="border-t border-border pt-5"
              aria-labelledby="cms-existing-feedback-heading"
            >
              <h2
                id="cms-existing-feedback-heading"
                className="font-heading text-lg font-semibold"
              >
                Feedback ({selectedComments.length})
              </h2>
              {loading ? (
                <p role="status" className="mt-3 text-muted-foreground">
                  Loading feedback…
                </p>
              ) : selectedComments.length === 0 ? (
                <p className="mt-3 text-muted-foreground">
                  No feedback on this section yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {selectedComments.map((comment) => (
                    <li key={comment.id} className="border border-border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{subjectLabel(comment.subject)}</span>
                        <span>{statusLabel(comment.status)}</span>
                      </div>
                      <p className="mt-2 break-words">{comment.body}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {comment.displayName} · {comment.createdAt.slice(0, 10)}
                      </p>
                      {comment.targetState === "archived" ? (
                        <p className="mt-2 text-xs font-medium">
                          This content was removed. Your feedback is kept.
                        </p>
                      ) : comment.targetChanged ? (
                        <p className="mt-2 text-xs font-medium">
                          {comment.subject === "page-content"
                            ? "The page content changed after this feedback was left."
                            : "The design intent changed after this feedback was left."}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {comment.status === "open" ? (
                          <>
                            <Button
                              key="resolved"
                              type="button"
                              variant="outline"
                              size="lg"
                              className="min-h-11"
                              aria-disabled={busyCommentId !== null}
                              onClick={() =>
                                void updateStatus(comment, "resolved")
                              }
                            >
                              {busyCommentId === comment.id &&
                              busyStatus === "resolved"
                                ? "Resolving…"
                                : "Resolve"}
                            </Button>
                            <Button
                              key="withdrawn"
                              type="button"
                              variant="outline"
                              size="lg"
                              className="min-h-11"
                              aria-disabled={busyCommentId !== null}
                              onClick={() =>
                                void updateStatus(comment, "withdrawn")
                              }
                            >
                              {busyCommentId === comment.id &&
                              busyStatus === "withdrawn"
                                ? "Withdrawing…"
                                : "Withdraw"}
                            </Button>
                          </>
                        ) : (
                          <Button
                            key={
                              statusControlOrigins[comment.id] ??
                              (comment.status === "withdrawn"
                                ? "withdrawn"
                                : "resolved")
                            }
                            type="button"
                            variant="outline"
                            size="lg"
                            className="min-h-11"
                            aria-disabled={busyCommentId !== null}
                            onClick={() => void updateStatus(comment, "open")}
                          >
                            {busyCommentId === comment.id &&
                            busyStatus === "open"
                              ? "Reopening…"
                              : "Reopen"}
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : (
          <p className="text-muted-foreground">
            Choose a numbered marker to review its section context.
          </p>
        )}

        {busyMessage ? (
          <p role="status" className="text-muted-foreground">
            {busyMessage}
          </p>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="border-l-2 border-destructive pl-3 text-destructive"
          >
            <p>{error}</p>
            {retryAction ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="mt-2 min-h-11"
                onClick={() =>
                  void (retryAction === "add" ? addFeedback() : loadComments())
                }
              >
                {retryAction === "add"
                  ? "Try adding again"
                  : "Try loading again"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  )
}
