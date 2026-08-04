---
date: 2026-08-04
topic: teacher-workspace-ia-content-review
---

# Teacher Workspace IA and content review prototype

## Problem Frame

The current public landing page is visually and interaction-led, while the
next Teacher Workspace story, information architecture, product claims, and
publication approvals are still being worked out. Reusing the current design
would make an editable content structure look settled and would invite visual
feedback before PM, policy, and security reviewers have cleared the material.

The next artifact must let reviewers understand and challenge the page order,
connected story, capability framing, claims, proof, and access boundaries
without relying on illustrations, motion, product mock-ups, or themed
components. It must remain isolated from the public website and provide a
clean foundation for a later visual redesign.

---

## Actors

- A1. Teachers and school staff: The eventual public audience who must be able
  to understand Teacher Workspace, its connected value, and how to access it.
- A2. Designer and PM: Shape the narrative and IA, own the working content,
  and record product and synthetic-story decisions.
- A3. Policy and security reviewers: Review public claims, sensitive content,
  synthetic-data safety, proof, access, and measurement boundaries.
- A4. Website implementers: Build the reviewable structure now and apply the
  later visual and interaction layer without duplicating or rewriting content.

---

## Key Flows

- F1. Review the public story
  - **Trigger:** A reviewer opens the isolated prototype.
  - **Actors:** A2, A3
  - **Steps:** Read the page in order; inspect the positive connected story;
    compare each capability with its role in that story; inspect audience,
    proof, support, and access sections; identify unresolved material by its
    stable review reference.
  - **Outcome:** Reviewers can discuss IA and copy without interpreting visual
    design as approved or searching across separate documents.
  - **Covered by:** R1, R2, R3, R8, R9, R10

- F2. Understand the intended public experience
  - **Trigger:** A teacher or stakeholder reads the content-only page from top
    to bottom.
  - **Actors:** A1
  - **Steps:** Understand the promise; follow one positive student-growth
    journey; see how the four capabilities contribute; inspect the static
    three-step explorer outline; understand intended audiences and access;
    reach the closing action.
  - **Outcome:** The story remains coherent without imagery, motion, or a live
    product demonstration.
  - **Covered by:** R2, R4, R5, R6, R7, R11

- F3. Hand the approved structure into visual design
  - **Trigger:** The IA and required content are sufficiently reviewed.
  - **Actors:** A2, A4
  - **Steps:** Preserve the approved content order and references; remove or
    separate internal review annotations; apply the future visual system and
    interactions; retain accessibility and publication gates.
  - **Outcome:** Visual work can begin without recoupling content to the old
    choreography or reopening settled structural decisions.
  - **Covered by:** R1, R3, R12, R13

---

## Requirements

**Artifact and information architecture**

- R1. The first deliverable must be an isolated, content-first review
  prototype, not a modification or deployment of the current public website.
- R2. The prototype must use a simple, naturally flowing document structure
  whose hierarchy and meaning remain clear without imagery, animation, or
  themed components.
- R3. Page sections must have stable review references and an explicit order
  so reviewers can propose moves, additions, removals, and copy changes
  without referring to visual position.
- R4. The starting IA must cover the value promise, connected story, Teacher
  Workspace reveal, product capabilities, explorer outline, audiences, proof,
  access/support, closing action, footer, and feedback path.

**Narrative and public content**

- R5. The page must tell one connected, public-safe story about a teacher
  noticing and celebrating a student's positive growth.
- R6. The story must show the four public capabilities contributing in order:
  Student Insights makes progress visible, Next-step guidance supports a
  constructive response, Message drafting prepares a warm family message for
  teacher review, and Posts shares or records the communication.
- R7. The exact student-growth signal, final wording, and product claims must
  remain proposed until their accountable reviewers approve them; the
  prototype must not present draft language as cleared fact.
- R8. Teacher Workspace must remain the only public brand. Internal capability
  names, including Contextual Intelligence and HeyTalia, must not appear in
  public-facing labels or copy.
- R9. Bullying, discipline, crisis, and other sensitive or negatively framed
  student scenarios are outside this public-content phase. Students must be
  described through growth, opportunity, support, and potential rather than
  deficits.

**Review and publication governance**

- R10. Every reviewable section or claim must expose enough review context to
  identify its status, source, accountable owner, required approval, and any
  policy or security concern without embedding those annotations in eventual
  public copy.
- R11. Unresolved content must appear as an explicit pending decision or
  omission; null fields and fabricated placeholder answers must never render
  as public copy.
- R12. The artifact must show the synthetic-data boundary, product-claim
  approvals, testimonial provenance and permission, access constraints,
  support readiness, and provider-neutral measurement boundary in one compact
  review appendix.
- R13. Approval must remain revision-aware in principle: changing approved
  wording or an approved artifact must make the affected review visibly
  subject to reconfirmation rather than silently inheriting an old approval.

**Interaction boundary and accessibility**

- R14. The three-step product explorer must be represented as a static content
  outline during this phase; scenario selection, product simulation, and
  analytics events are deferred.
- R15. Sign-in label, destination, and `@edu.gov.sg` access note must be
  reviewable as content, but the prototype must not implement authentication
  or product-side conversion tracking.
- R16. Semantic landmarks, heading order, keyboard readability, visible focus
  behavior for any ordinary links, feedback access, and the existing
  accessibility baseline must be preserved from the beginning.

---

## Acceptance Examples

- AE1. **Covers R2, R4, R5, R6.** Given the page with all styling disabled,
  when a reviewer reads its headings and text in source order, the value
  promise, positive growth story, four capability contributions, audience,
  proof, access, and close still form a coherent sequence.
- AE2. **Covers R7, R10, R11, R13.** Given an unapproved product claim, when a
  policy reviewer opens the prototype, the claim is identifiable as proposed
  with a stable reference and owner; it is not represented as approved, and a
  missing answer is not replaced with invented copy.
- AE3. **Covers R8, R9.** Given the public-facing content, when it is searched
  for internal brands and sensitive scenario themes, it contains neither
  internal capability names nor bullying, discipline, or crisis-led stories.
- AE4. **Covers R12.** Given the review appendix, when security and policy
  reviewers inspect it, they can find the synthetic-data rule, prohibited
  data, claim and testimonial blockers, access boundary, and unresolved
  support and measurement decisions in one place.
- AE5. **Covers R14, R15.** Given the IA prototype, when a reviewer reaches the
  explorer and sign-in areas, they can review the three-step flow and access
  contract without encountering a simulated product workflow, authentication
  implementation, or analytics runtime.
- AE6. **Covers R1, R16.** Given the isolated prototype branch, when it is
  reviewed, the current public deployment remains unchanged and the prototype
  still has a single main landmark, logical headings, feedback access, and no
  animation-dependent content.

---

## Success Criteria

- PM, policy, and security reviewers can reference a section or claim
  unambiguously and see what is proposed, blocked, or approved.
- A reader can explain the page's promise, positive connected story, four
  capabilities, intended audiences, and access path after reading the neutral
  prototype without supporting visuals.
- Draft or missing content is never mistaken for published fact, and sensitive
  student stories are absent from the public narrative.
- The visual-design phase can replace the neutral presentation without
  duplicating content or rebuilding the page hierarchy.
- Work can proceed and be previewed on the isolated branch without changing or
  deploying the current public website.

---

## Scope Boundaries

- No themed visual system, illustrations, product screenshots, video, or
  decorative assets.
- No scroll choreography, transitions, animation, product simulation, tabs,
  carousels, or scenario interaction.
- No authentication flow, backend, persistence, AI inference, analytics SDK,
  cross-domain attribution implementation, or product-side changes.
- No invented testimonial, school, student, audience answer, support route, or
  approval.
- No final visual-design decisions or claim that the current neutral layout is
  the eventual public design.
- No public production deployment from this phase.

---

## Key Decisions

- Use a semantic content-review prototype rather than the current themed shell
  or a polished Shadcn wireframe: this minimises review bias and later rework.
- Use one connected positive-growth story: it preserves the platform narrative
  while avoiding hard-to-publish negative or sensitive scenarios.
- Treat the financial-assistance story as non-canonical: it may return later as
  an approved synthetic example, but it does not define this public narrative.
- Keep internal review context adjacent to, but separable from, eventual public
  copy: reviewers need governance detail that teachers should not see.
- Keep the explorer static in this phase: comprehension and placement can be
  reviewed before interaction design begins.

---

## Dependencies / Assumptions

- The existing Landing Page V2 foundation remains the source of confirmed
  naming, access, audience, proof, publication, and measurement decisions.
- Xingyu remains the accountable PM for audience confirmation and product
  claims; the Designer and Xingyu remain accountable for synthetic-story
  approval.
- Final story wording, the concrete growth signal, supporting evidence,
  audience answers, testimonial coverage, support details, and launch metadata
  will be supplied or approved through the parallel content-clearance process.
- A branch or preview deployment is an internal review artifact and is not
  equivalent to production approval.

---

## Outstanding Questions

### Deferred to Planning

- [Affects R3, R10, R13][Technical] Define the smallest review-record shape
  that supports stable references and revision-aware status without turning
  the marketing repository into a content-management system.
- [Affects R1, R4][Technical] Define the least disruptive route and component
  boundary for the isolated prototype while leaving the current choreography
  implementation intact for the public branch.

### Deferred to Content Clearance

- [Affects R7][Review] Which concrete positive growth signal and wording are
  approved for the connected public story?
- [Affects R10, R12][Review] Which reviewers and evidence are required for each
  claim, testimonial, synthetic artifact, support destination, and measurement
  decision?

---

## Next Steps

-> `ce-plan` for structured implementation planning
