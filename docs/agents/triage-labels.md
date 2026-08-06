# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.

## Current state upstream

`String-dxd/marketing-teacher-workspace` carries only GitHub's default label
set today. Of the five roles above, **`wontfix` already exists** ("This will not
be worked on"); the other four do not.

Creating a label is a visible change to a shared org repo, so confirm with the
user before the first `gh label create`. To create all four at once:

```bash
REPO=String-dxd/marketing-teacher-workspace
gh label create needs-triage    --repo "$REPO" --description "Maintainer needs to evaluate this issue"
gh label create needs-info      --repo "$REPO" --description "Waiting on reporter for more information"
gh label create ready-for-agent --repo "$REPO" --description "Fully specified, ready for an AFK agent"
gh label create ready-for-human --repo "$REPO" --description "Requires human implementation"
```
