# Publish the proof we have

Required testimonial coverage for launch is Posts only (`testimonialCoverageRequired: ["posts"]`), down from Student Insights + Message drafting + Posts. All six verified verbatims from the 22 Jun FGD extraction cover Parent Gateway communication. None evidences the other capabilities. The attribution policy (anonymous role and school level, no school names) is unchanged.

The three-capability requirement was a launch blocker with no path to clearing: satisfying it would have meant either inventing coverage the quotes don't carry (a CNT-4 violation, implying the quotes evidence the new capabilities) or blocking launch on a future FGD. The proof section now says only what the quotes actually evidence. If the PM wants Student Insights or Message drafting proof, that is new fieldwork commissioned separately, not a gate on this page.

Publication approval per quote is still required. Nothing renders until `publicationApproved` is recorded.

## Addendum — 2026-08-20: proposed rendering on unmerged review builds

The builder (wondo.jeong@gt.tech.gov.sg) directed the GA landing build to render
three curated verbatims (`pg-read-speed`, `pg-immediacy`, `pg-work-reduction`)
on the `ga-landing-design` branch as **proposed** content, so reviewers grade
the real section instead of an empty slot. This scopes — it does not reverse —
the rule above:

- `publicationApproved` stays `false` on every quote until ticket #10 records
  each approval; the flag remains the **merge/publication** gate.
- The two quotes naming "PG" and the growth quote stay unrendered; the
  output-leak scanner now guards those three fragments.
- "Nothing renders until `publicationApproved` is recorded" continues to bind
  the released site and any CMS publish; branch preview builds carrying this
  addendum render the curated three as proposed copy for review.
