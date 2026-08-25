# Design decision record: Teacher Workspace GA landing map

- **Date:** 2026-08-13
- **Product:** Teacher Workspace
- **Change type:** content and IA foundation
- **Page type:** public marketing landing page; greyscale review wireframe
- **Run type:** attended
- **Teacher and moment:** An everyday teacher wants to understand quickly whether Teacher Workspace can reduce the switching involved in routine work.

## Sprint contract

1. Lock one compact seven-part page led by less scattered work.
2. Present four related capabilities without inventing an integrated workflow.
3. Use only GA claims confirmed by capability owners.
4. Use three separate positive, synthetic scenarios across notice + understand,
   act, and communicate.
5. Preserve every shared CMS comment and stable target through any later draft.
6. Keep the released homepage and production aliases unchanged.

## Chosen approach

Create a team-visible Wayfinder map before changing the candidate. The map
separates product truth, hero evidence, scenario selection, school assurance,
Posts proof, measurement, prototyping, and final approval into native child
issues with dependency gates.

Encode the approved direction in the repository as a specification and a
testable foundation. The foundation records the section order, public names,
challenged claims, scenario constraints, measurement privacy, prototype gates,
and CMS mutation policy.

Do not rewrite or save the wireframe while its source claims remain
unconfirmed. The existing CMS candidate stays available for comment history,
but ADR-0004 supersedes its bursary narrative.

## Content and structure

1. Hero: outcome, Google sign-in, access note, approved product peek.
2. Capability map: four functional labels.
3. Notice + understand: positive Student Insights scenario.
4. Act: separate verified guidance scenario.
5. Communicate: separate drafting and Posts scenario with Posts proof.
6. School consistency: approved organisational assurance.
7. Close and access: repeated sign-in, optional approved support, brief footer.

## Interaction and motion

The review artifact stays a static greyscale wireframe. The sign-in placements
may remain inert in review mode. No motion, simulation, analytics runtime, or
new product interaction is part of this phase.

## Controls in scope

- Accessibility: semantic landmarks and headings, keyboard access, visible
  focus for any real link, AA contrast, and 320-pixel reflow.
- Content: functional naming, purpose-first copy, verified domain claims,
  device-agnostic actions, concise sentences, and no AI-writing tells.
- Layout: one focal hero, readable measure, clear section hierarchy, aligned
  edges, and density suitable for PM review.
- Safety: synthetic data only, positive framing, no internal brand names, no
  reviewer or comment data in public output.

## Tradeoffs

The decision gate delays the revised wireframe. That cost is acceptable because
an attractive but unsupported story would create policy and product risk and
would waste review time.

The first artifact remains greyscale and static. It can establish message,
order, and interface intent, but it cannot validate final brand expression or
interaction quality.

## Approval

- **Approved by:** Designer and workspace owner
- **Approved on:** 2026-08-13, “PLEASE IMPLEMENT THIS PLAN”
- **External writes approved:** Team-visible GitHub Wayfinder map and tickets

## Implementation status

- Wayfinder labels and map published as issue #5.
- Eight native child issues published as #6–#13.
- Native dependencies enforce the decision frontier.
- Repository specification and foundation added.
- Measurement foundation updated to anonymous CTA conversion plus comprehension
  signals.
- CMS draft save remains blocked by #6–#11.
- Public homepage, production publication, final visual design, and interaction
  design remain untouched.

## Plan summary

| Dimension | Decision |
| --- | --- |
| Structure | Compact seven-part page |
| Audience | Everyday teachers first; KPs and leaders second |
| Story | Three separate positive synthetic moments |
| Product truth | Capability-owner-confirmed GA claims only |
| Hero | Copy first with one approved product screen |
| Proof | One publicly approved Posts testimonial |
| Measurement | Anonymous CTA conversion; section reach and capability engagement |
| CMS | One append-only draft save after gates clear |
| Preserved | Stable targets, all comment states, `/`, production aliases |
| Deferred | Visual branding, imagery, motion, interactions, launch publication |

## Amendment — 2026-08-20 (GA landing build, design review round 2)

Two acceptance rows are reconciled against the build on `ga-landing-design`:

- **Proof** ("One publicly approved Posts testimonial"): superseded in count by
  the builder's 2026-08-20 direction (three curated verbatims, issue #3's
  "kept brief" format) and in approval state by the ADR-0003 addendum — the
  quotes render as proposed on unmerged review builds only; per-quote
  `publicationApproved` (ticket #10) remains the publication gate.
- **Product truth** ("Capability-owner-confirmed GA claims only"): unchanged
  as the publication bar. The branch build presents AI next-step guidance
  (a Release-2 flag-gated state, recorded in `content/screens.mdx` and
  `docs/decisions/ga-landing-page.md`) as proposed content; ticket #6's
  claims register must clear before merge.
