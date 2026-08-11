# Turning on review feedback

The `/content-review` page lets anyone holding the link change wording and leave
notes without an account. Pressing **Send** commits that round to a branch and
adds it to a pull request you can read as a diff.

Sending stays switched off until two environment variables exist. Without
them, reviewers can still edit and comment. The panel asks them to pass their
notes to you by hand.

## 1. Create a token

A [fine-grained personal access token](https://github.com/settings/tokens?type=beta)
scoped to **one repository**: the fork you own, not the org repo.

- Repository access: **Only select repositories** → `wondopamine/marketing-teacher-workspace`
- Repository permissions:
  - **Contents: Read and write**, to commit the edited `.mdx`
  - **Pull requests: Read and write**, to open the PR and post each round

Do not grant any other permissions. The token never reaches the browser. A
server function reads it from `process.env`.

## 2. Add it to Vercel

```bash
vercel env add REVIEW_GITHUB_TOKEN preview
vercel env add REVIEW_GITHUB_REPO preview   # wondopamine/marketing-teacher-workspace
```

These variables are optional and have defaults:

| Variable | Default | What it does |
| --- | --- | --- |
| `REVIEW_GITHUB_BASE` | `main` | Branch the feedback branch is cut from, and the PR target |
| `REVIEW_GITHUB_BRANCH` | `review/page-feedback` | Branch each round is committed to |

Add them to `preview` only. Production deployments of this route are forbidden
by the decision record, so a production token would have nothing to serve.

Redeploy after adding them. The server reads environment variables at request
time, but the existing deployment does not have the new configuration.

## 3. Check it

Open the preview link in a private window (no Vercel session). You should see
the **Review this page** panel bottom-right. Change a headline, press Enter,
press **Send**. A pull request appears on the fork within a few seconds.

## What reviewers can and cannot do

The server checks every submission before it writes anything:

- The server accepts only paths that match `content/**/*.mdx`. It rejects path
  traversal and every other path.
- Copy must contain text, fit on one line, and stay within the length limit.
- One round can carry at most 100 edits and 50 comments.
- The server applies each edit to the file's **current** contents on GitHub. It
  rejects an edit from a stale build instead of overwriting someone else's
  change.

The token's blast radius is one repository, contents and pull requests only. The
worst a bad actor with the link can do is open a noisy pull request on a branch
you control. They cannot merge it, deploy to production, or access anything
else.

## Turning it off

Remove `REVIEW_GITHUB_TOKEN`. The page keeps working; sending stops.
