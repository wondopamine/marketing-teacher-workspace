import "@tanstack/react-start/server-only"

import { applyEdit } from "@/content/mdx-editable"

/**
 * Turns a reviewer's submission into a commit on a scratch branch and a pull
 * request the designer can read as a diff.
 *
 * The page it is called from is public and unauthenticated, so nothing here
 * trusts the caller: paths are re-checked against `content/`, every edit is
 * re-applied against the file's *current* contents on GitHub (not the build
 * the reviewer loaded), and the credential never leaves the server.
 */

export type ReviewEdit = {
  readonly file: string
  readonly start: number
  readonly end: number
  readonly was: string
  readonly text: string
  readonly kind: "frontmatter" | "prose"
}

export type ReviewComment = {
  readonly where: string
  readonly note: string
}

export type ReviewSubmission = {
  readonly edits: ReadonlyArray<ReviewEdit>
  readonly comments: ReadonlyArray<ReviewComment>
  readonly reviewer: string
}

export type ReviewSubmissionResult =
  | { readonly ok: true; readonly url: string; readonly editCount: number }
  | { readonly ok: false; readonly reason: string }

/** Caps chosen so one submission stays a review, not a bulk rewrite. */
export const limits = {
  edits: 100,
  comments: 50,
  textLength: 2000,
  noteLength: 5000,
  reviewerLength: 80,
} as const

const contentPath = /^content\/[A-Za-z0-9._/-]+\.mdx$/

export function validateSubmission(
  value: unknown
): { ok: true; submission: ReviewSubmission } | { ok: false; reason: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, reason: "Malformed submission." }
  }
  const body = value as Record<string, unknown>
  const rawEdits = Array.isArray(body.edits) ? body.edits : null
  const rawComments = Array.isArray(body.comments) ? body.comments : null
  if (!rawEdits || !rawComments) {
    return { ok: false, reason: "Malformed submission." }
  }
  if (rawEdits.length > limits.edits || rawComments.length > limits.comments) {
    return { ok: false, reason: "Too many changes in one submission." }
  }
  if (rawEdits.length === 0 && rawComments.length === 0) {
    return { ok: false, reason: "Nothing to send yet." }
  }

  const edits: Array<ReviewEdit> = []
  for (const candidate of rawEdits) {
    const edit = candidate as Record<string, unknown>
    if (
      typeof edit.file !== "string" ||
      !contentPath.test(edit.file) ||
      edit.file.includes("..") ||
      typeof edit.start !== "number" ||
      typeof edit.end !== "number" ||
      !Number.isInteger(edit.start) ||
      !Number.isInteger(edit.end) ||
      edit.start < 0 ||
      edit.end < edit.start ||
      typeof edit.was !== "string" ||
      typeof edit.text !== "string" ||
      (edit.kind !== "frontmatter" && edit.kind !== "prose")
    ) {
      return { ok: false, reason: "An edit named a file or range we can't use." }
    }
    if (edit.text.trim().length === 0) {
      return { ok: false, reason: "Copy cannot be empty." }
    }
    if (edit.text.length > limits.textLength) {
      return { ok: false, reason: "That copy is too long to submit." }
    }
    if (/[\r\n]/.test(edit.text)) {
      return { ok: false, reason: "Copy cannot contain a line break." }
    }
    edits.push({
      file: edit.file,
      start: edit.start,
      end: edit.end,
      was: edit.was,
      text: edit.text,
      kind: edit.kind,
    })
  }

  const comments: Array<ReviewComment> = []
  for (const candidate of rawComments) {
    const comment = candidate as Record<string, unknown>
    if (typeof comment.where !== "string" || typeof comment.note !== "string") {
      return { ok: false, reason: "Malformed comment." }
    }
    if (comment.note.trim().length === 0) continue
    if (comment.note.length > limits.noteLength) {
      return { ok: false, reason: "That comment is too long to submit." }
    }
    comments.push({
      where: comment.where.slice(0, 200),
      note: comment.note,
    })
  }

  const reviewer =
    typeof body.reviewer === "string" && body.reviewer.trim().length > 0
      ? body.reviewer.trim().slice(0, limits.reviewerLength)
      : "Anonymous reviewer"

  return { ok: true, submission: { edits, comments, reviewer } }
}

/**
 * Applies a file's edits highest-offset-first, so each splice leaves the
 * offsets of the edits still to be applied untouched.
 */
export function applyEditsToSource(
  source: string,
  edits: ReadonlyArray<ReviewEdit>
): { ok: true; source: string } | { ok: false; reason: string } {
  let next = source
  const ordered = [...edits].sort((left, right) => right.start - left.start)

  for (const edit of ordered) {
    const result = applyEdit(next, {
      start: edit.start,
      end: edit.end,
      was: edit.was,
      text: edit.text,
      kind: edit.kind,
    })
    if (!result.ok) return { ok: false, reason: result.reason }
    next = result.source
  }

  return { ok: true, source: next }
}

type GitHubConfig = {
  readonly token: string
  readonly owner: string
  readonly repo: string
  readonly base: string
  readonly branch: string
}

export function readGitHubConfig(
  env: Record<string, string | undefined>
): GitHubConfig | null {
  const token = env.REVIEW_GITHUB_TOKEN
  const repository = env.REVIEW_GITHUB_REPO
  if (!token || !repository) return null

  const [owner, repo] = repository.split("/")
  if (!owner || !repo) return null

  return {
    token,
    owner,
    repo,
    base: env.REVIEW_GITHUB_BASE || "main",
    branch: env.REVIEW_GITHUB_BRANCH || "review/page-feedback",
  }
}

async function gh(
  config: GitHubConfig,
  path: string,
  init: RequestInit = {}
): Promise<{ status: number; body: any }> {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
      ...(init.headers ?? {}),
    },
  })
  const text = await response.text()
  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
  }
}

function commentBlock(submission: ReviewSubmission): string {
  const lines = [
    `### Review feedback from ${submission.reviewer}`,
    "",
    `${submission.edits.length} copy change${submission.edits.length === 1 ? "" : "s"}, ${submission.comments.length} comment${submission.comments.length === 1 ? "" : "s"}.`,
  ]

  if (submission.comments.length > 0) {
    lines.push("", "#### Comments", "")
    for (const comment of submission.comments) {
      lines.push(`- **${comment.where}** — ${comment.note}`)
    }
  }

  if (submission.edits.length > 0) {
    lines.push("", "#### Copy changes", "")
    for (const edit of submission.edits) {
      lines.push(`- \`${edit.file}\``)
      lines.push(`  - was: ${edit.was}`)
      lines.push(`  - now: ${edit.text}`)
    }
  }

  return lines.join("\n")
}

export async function submitToGitHub(
  submission: ReviewSubmission,
  config: GitHubConfig
): Promise<ReviewSubmissionResult> {
  const repo = `/repos/${config.owner}/${config.repo}`

  // Branch: create from base the first time, reuse it afterwards so repeated
  // review rounds accumulate on one pull request.
  const existingBranch = await gh(config, `${repo}/git/ref/heads/${config.branch}`)
  if (existingBranch.status === 404) {
    const baseRef = await gh(config, `${repo}/git/ref/heads/${config.base}`)
    if (baseRef.status !== 200) {
      return { ok: false, reason: "Could not read the base branch." }
    }
    const created = await gh(config, `${repo}/git/refs`, {
      method: "POST",
      body: JSON.stringify({
        ref: `refs/heads/${config.branch}`,
        sha: baseRef.body.object.sha,
      }),
    })
    if (created.status >= 300) {
      return { ok: false, reason: "Could not open a branch for this feedback." }
    }
  } else if (existingBranch.status >= 300) {
    return { ok: false, reason: "Could not read the feedback branch." }
  }

  const byFile = new Map<string, Array<ReviewEdit>>()
  for (const edit of submission.edits) {
    const list = byFile.get(edit.file) ?? []
    list.push(edit)
    byFile.set(edit.file, list)
  }

  for (const [file, edits] of byFile) {
    const current = await gh(
      config,
      `${repo}/contents/${file}?ref=${encodeURIComponent(config.branch)}`
    )
    if (current.status !== 200 || typeof current.body?.content !== "string") {
      return { ok: false, reason: `Could not read ${file}.` }
    }

    const source = Buffer.from(current.body.content, "base64").toString("utf8")
    const applied = applyEditsToSource(source, edits)
    if (!applied.ok) return { ok: false, reason: applied.reason }
    if (applied.source === source) continue

    const written = await gh(config, `${repo}/contents/${file}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `content: ${submission.reviewer} edited ${file}`,
        content: Buffer.from(applied.source, "utf8").toString("base64"),
        sha: current.body.sha,
        branch: config.branch,
      }),
    })
    if (written.status >= 300) {
      return { ok: false, reason: `Could not save changes to ${file}.` }
    }
  }

  // Comments are committed to the branch as well as posted to the pull
  // request. Posting needs a pull-requests-write token; committing does not, so
  // a reviewer's notes survive even when the PR cannot be opened.
  if (submission.comments.length > 0) {
    const notesPath = "review-notes.md"
    const existing = await gh(
      config,
      `${repo}/contents/${notesPath}?ref=${encodeURIComponent(config.branch)}`
    )
    const previous =
      existing.status === 200 && typeof existing.body?.content === "string"
        ? Buffer.from(existing.body.content, "base64").toString("utf8")
        : "# Review notes\n\nComments left on the review page, newest last.\n"
    const appended = `${previous.trimEnd()}\n\n${commentBlock(submission)}\n`

    await gh(config, `${repo}/contents/${notesPath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `content: notes from ${submission.reviewer}`,
        content: Buffer.from(appended, "utf8").toString("base64"),
        ...(existing.status === 200 ? { sha: existing.body.sha } : {}),
        branch: config.branch,
      }),
    })
  }

  const open = await gh(
    config,
    `${repo}/pulls?state=open&head=${config.owner}:${config.branch}`
  )
  let pullNumber: number | null =
    Array.isArray(open.body) && open.body.length > 0 ? open.body[0].number : null
  let url: string =
    pullNumber !== null
      ? open.body[0].html_url
      : `https://github.com/${config.owner}/${config.repo}/tree/${config.branch}`

  // Opening the pull request is a convenience, not the delivery mechanism: the
  // branch already holds the edits and the notes. A token without
  // pull-requests-write simply leaves the reviewer pointed at the branch.
  if (pullNumber === null) {
    const created = await gh(config, `${repo}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: "Landing page review feedback",
        head: config.branch,
        base: config.base,
        body: "Copy edits and comments submitted from the review page. Each round is added as a comment below, and `review-notes.md` on this branch holds the same notes.",
      }),
    })
    if (created.status < 300) {
      pullNumber = created.body.number
      url = created.body.html_url
    }
  }

  if (pullNumber !== null) {
    await gh(config, `${repo}/issues/${pullNumber}/comments`, {
      method: "POST",
      body: JSON.stringify({ body: commentBlock(submission) }),
    })
  }

  return { ok: true, url, editCount: submission.edits.length }
}
