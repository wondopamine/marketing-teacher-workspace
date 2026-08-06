# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues in
**`String-dxd/marketing-teacher-workspace`**. Use the `gh` CLI for all
operations.

## Always pass `--repo`

This clone has three remotes, and `origin` points at a personal fork
(`wondopamine/marketing-teacher-workspace`) **with issues disabled**. `gh`
infers the repo from `origin`, so an unpinned command fails or targets the
wrong place.

Pass `--repo String-dxd/marketing-teacher-workspace` on every command.

`upstream` is recorded as `String-sg/marketing-teacher-workspace`; that org was
renamed and GitHub redirects it to `String-dxd`. Both resolve to the same repo —
prefer the canonical `String-dxd` name in new commands.

## Conventions

Throughout, `--repo String-dxd/marketing-teacher-workspace` is abbreviated as
`$REPO`.

- **Create an issue**: `gh issue create --repo $REPO --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --repo $REPO --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --repo $REPO --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --repo $REPO --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --repo $REPO --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --repo $REPO --comment "..."`

## Write access

Issues live in an org repo that this clone contributes to through a fork. Before
a skill creates, comments on, closes, or relabels an issue, confirm with the
user — a write here is visible to the whole team, not just this workspace.
Reading is always fine.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --repo $REPO --comments` and `gh pr diff <number> --repo $REPO` for the diff.
- **List external PRs for triage**: `gh pr list --repo $REPO --state open --json number,title,body,labels,author,authorAssociation,comments` then keep only `authorAssociation` of `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE` (drop `OWNER`/`MEMBER`/`COLLABORATOR`).
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close` — each with `--repo $REPO`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either — resolve with `gh pr view 42 --repo $REPO` and fall back to `gh issue view 42 --repo $REPO`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue in `String-dxd/marketing-teacher-workspace`.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --repo String-dxd/marketing-teacher-workspace --comments`.

## Known landmarks

- **Issue #3 — "Landing Page v2"** is the source of the current landing-page
  content contract. `src/config/site.ts` links to it and to three of its
  comments; `src/content/landing-v2.ts` encodes what it asked for. Read it
  before changing landing content or its readiness rules.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --repo $REPO --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (`gh api` on the sub-issues endpoint). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: GitHub's **native issue dependencies** — the canonical, UI-visible representation. Add an edge with `gh api --method POST repos/String-dxd/marketing-teacher-workspace/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/String-dxd/marketing-teacher-workspace/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). GitHub reports `issue_dependencies_summary.blocked_by` (open blockers only — the live gate). Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children (`gh issue list --repo $REPO --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (`issue_dependencies_summary.blocked_by > 0`, or an open issue in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --repo $REPO --add-assignee @me` — the session's first write.
- **Resolve**: `gh issue comment <n> --repo $REPO --body "<answer>"`, then `gh issue close <n> --repo $REPO`, then append a context pointer (gist + link) to the map's Decisions-so-far.
