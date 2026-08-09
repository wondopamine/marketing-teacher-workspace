# Turning on review feedback

The `/content-review` page lets anyone holding the link change wording and leave
notes without an account. Pressing **Send** commits that round to a branch and
adds it to a pull request you can read as a diff.

Sending stays switched off until two environment variables exist. Without them
the page still works — reviewers can edit and comment — but the panel tells them
to pass their notes to you by hand instead of pretending it sent.

## 1. Create a token

A [fine-grained personal access token](https://github.com/settings/tokens?type=beta)
scoped to **one repository** — the fork you own, not the org repo:

- Repository access: **Only select repositories** → `wondopamine/marketing-teacher-workspace`
- Repository permissions:
  - **Contents: Read and write** — to commit the edited `.mdx`
  - **Pull requests: Read and write** — to open the PR and post each round

Nothing else. The token never reaches the browser; it is read from
`process.env` inside a server function.

## 2. Add it to Vercel

```bash
vercel env add REVIEW_GITHUB_TOKEN preview
vercel env add REVIEW_GITHUB_REPO preview   # wondopamine/marketing-teacher-workspace
```

Optional, with sensible defaults:

| Variable | Default | What it does |
| --- | --- | --- |
| `REVIEW_GITHUB_BASE` | `main` | Branch the feedback branch is cut from, and the PR target |
| `REVIEW_GITHUB_BRANCH` | `review/page-feedback` | Branch each round is committed to |

Add them to `preview` only. Production deployments of this route are forbidden
by the decision record, so a production token would have nothing to serve.

Redeploy after adding them — environment variables are read at request time,
but the deployment needs to exist under the new configuration.

## 3. Check it

Open the preview link in a private window (no Vercel session). You should see
the **Review this page** panel bottom-right. Change a headline, press Enter,
press **Send**. A pull request appears on the fork within a few seconds.

## What reviewers can and cannot do

Every submission is re-checked on the server before anything is written:

- paths must match `content/**/*.mdx`; traversal and any other path is refused;
- copy cannot be empty, cannot contain a line break, and is length-capped;
- one round carries at most 100 edits and 50 comments;
- each edit is re-applied against the file's **current** contents on GitHub, so
  a reviewer working from a stale build is refused rather than silently
  overwriting someone else's change.

The token's blast radius is one repository, contents and pull requests only. The
worst a bad actor with the link can do is open a noisy pull request on a branch
you control — no merge, no production, no access to anything else.

## Turning it off

Remove `REVIEW_GITHUB_TOKEN`. The page keeps working; sending stops.
