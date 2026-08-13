# Teacher Workspace GA landing-page specification

**Status:** Direction approved; GA claims and prototype inputs pending

**Wayfinder map:** [#5 Shape the Teacher Workspace GA landing page](https://github.com/String-dxd/marketing-teacher-workspace/issues/5)

**Source conversation:** [#3 Landing Page v2](https://github.com/String-dxd/marketing-teacher-workspace/issues/3) and the shared CMS annotations

**Released homepage:** Out of scope and unchanged

## Outcome

The landing page helps an everyday teacher understand why Teacher Workspace is
worth opening, then sign in with Google. It should make scattered work feel
more manageable without claiming that separate capabilities form one automated
workflow.

This specification ends in two review artifacts:

1. Approved positioning, claims, content, and information architecture.
2. One greyscale CMS wireframe for Designer, PM, capability-owner, policy, and
   security review.

The wireframe is not the released website. It proposes no final imagery,
branding, motion, or interaction design.

## Locked decisions

| Decision | Direction |
| --- | --- |
| Primary audience | Everyday teachers |
| Secondary audience | Key Personnel and School Leaders |
| Main promise | Less scattered work and easier task completion |
| Product model | Related capabilities in Teacher Workspace, without an invented integrated workflow |
| Narrative | Three separate moments: notice + understand, act, communicate |
| Scenarios | Three positive, synthetic scenarios chosen after GA claims are confirmed |
| Public brand | Teacher Workspace only |
| Public capability names | Student Insights, AI next-step guidance, Message drafting, Posts |
| Hero | Copy first, one focused approved product screen entering at the fold |
| Primary action | Sign in with Google |
| Access note | Use your `@edu.gov.sg` account. |
| Proof | One approved Posts testimonial in the communicate section |
| Organisational value | Consistent school practice, supported only by approved assurance language |
| Primary measurement | Anonymous sign-in CTA conversion |
| Secondary measurement | Section reach and capability engagement |
| Voice | Calm, concrete, teacher-led, concise |

## Positioning and content direction

The recommended hero direction is:

> **Spend less time piecing everyday work together.**
>
> Use Teacher Workspace to understand students, get help with next steps, draft
> messages, and communicate with families.

This is proposed copy, not approved GA copy. Capability owners must confirm the
four verbs before it enters the CMS draft. The headline may change during copy
review, but it must continue to lead with the teacher's outcome rather than a
feature list or student-support case.

The page must not use platform hype or imply automatic hand-offs. It should
avoid words such as “seamless”, “streamline”, “empower”, and “all-in-one”.

## GA claims register

[Ticket #6](https://github.com/String-dxd/marketing-teacher-workspace/issues/6)
is the first decision frontier. Xingyu coordinates the register with each
capability owner.

| Capability | Public name | Owner | Allowed public claims | Evidence | Approval |
| --- | --- | --- | --- | --- | --- |
| `student-insights` | Student Insights | Pending | Pending | Pending | Pending |
| `contextual-intelligence` | AI next-step guidance | Pending | Pending | Pending | Pending |
| `hey-talia` | Message drafting | Pending | Pending | Pending | Pending |
| `posts` | Posts | Pending | Pending | Pending | Pending |

Each approved record needs the capability owner, allowed claims, evidence,
approval name, and approval date. “Pending” is not permission to publish a
plausible claim.

These claims are rejected unless an owner records new evidence:

- AI next-step guidance reads or interprets circulars.
- Teacher Workspace automatically matches a student to a bursary or scheme.
- Posts tracks whether an application was submitted or approved.
- Message drafting prepares a draft from student context.

Posts may show delivery or read status only if its owner confirms the exact
state and wording. Teacher review must remain explicit for drafted content.

## Seven-part page

### 1. Hero

- Lead with less scattered work.
- Show one primary Google sign-in action.
- Place `Use your @edu.gov.sg account.` beneath the action.
- Let one approved product screen enter at the fold.
- Do not invent a Teacher Workspace home, dashboard, or app shelf.

The screen choice stays blocked by [ticket #7](https://github.com/String-dxd/marketing-teacher-workspace/issues/7).
Compare available screens by teacher legibility, GA truth, sensitive-data risk,
and ability to communicate one task.

### 2. Capability map

Orient the visitor to the four functional capabilities near the hero. This is
a compact map, not four equal product cards and not four separate brands.

Final job statements come from the GA claims register. Until then, the four
labels may appear in the specification but no behavioural description is
approved.

### 3. Notice + understand

Use one positive, synthetic Student Insights scenario. The teacher should
notice progress or a constructive opportunity, then understand the relevant
context. A positive tag may be the visual focal point if the product owner
confirms that state.

Candidate direction, pending [ticket #8](https://github.com/String-dxd/marketing-teacher-workspace/issues/8):
a student has begun contributing with growing confidence, and the teacher can
see recent positive observations worth building on.

### 4. Act

Use a separate positive scenario for AI next-step guidance. Explain the
teacher's decision and the supported task. Do not reuse the Student Insights
student to imply an automatic hand-off.

The section must not mention circular reading, scheme matching, submission
routes, or closing dates unless the claims register explicitly permits them.

### 5. Communicate

Use a separate positive communication scenario. Show Message drafting and
Posts as related capabilities without claiming that one automatically supplies
the other with student context.

- Make teacher review visible in the drafting state.
- Describe delivery or read status only at the level approved for GA.
- Place one publicly approved Posts testimonial here.
- Treat the quote as Posts proof, not proof for all of Teacher Workspace.

The quote and attribution stay blocked by [ticket #10](https://github.com/String-dxd/marketing-teacher-workspace/issues/10).

### 6. School consistency

Answer the secondary audience's question: how does this help a school work more
consistently? Lead with the organisational outcome. Support it only with
approved language about teacher review, educator access, product controls, and
data handling.

This section stays blocked by [ticket #9](https://github.com/String-dxd/marketing-teacher-workspace/issues/9)
and policy/security review.

### 7. Close and access

- Repeat the Google sign-in action once.
- Repeat the `@edu.gov.sg` access note.
- Include a public support route only after its destination, access conditions,
  owner, and wording are approved.
- End with the brief Teacher Workspace footer.

Do not add extra CTA labels, a product directory, or a section describing the
wireframe itself.

## Scenario guardrails

Every scenario must:

- use purpose-built synthetic data;
- show a positive moment, opportunity, or progress;
- keep the teacher as the decision-maker;
- map each behaviour to an approved GA claim;
- stand on its own without a fictional cross-capability hand-off.

Every scenario must exclude:

- real student, family, or teacher data;
- SWaN framing;
- bullying, discipline, behavioural risk, crisis, or deficit narratives;
- unnecessary sensitive detail;
- the real-looking bursary screenshot attached to issue #3.

## Proof and attribution

Anonymous role-and-school-level attribution is acceptable for the first
candidate. It does not replace publication permission.

The selected Posts quote needs:

- exact approved wording;
- role and school level;
- source reference;
- approver and approval date;
- any channel or expiry restriction.

If no quote receives approval, omit the proof instead of substituting an
unverified claim.

## Measurement contract

[Ticket #11](https://github.com/String-dxd/marketing-teacher-workspace/issues/11)
must record:

- the eligible anonymous-session denominator for CTA conversion;
- the section-reach thresholds;
- the definition of capability engagement;
- the analytics owner and reporting cadence;
- consent and retention expectations.

The measurement payload must never contain student data, testimonial text,
teacher email, or an account identifier. The marketing repository defines the
event contract only. It does not add authentication, persistence, or an
analytics provider in this phase.

## Shared CMS update protocol

The CMS draft may change only after tickets #6–#11 supply the approved inputs
and ticket #12 is unblocked.

Before the save:

1. Read the latest page and record the current head.
2. Record every comment ID, target, subject, status, and version.
3. Expect six open comments and one withdrawn comment in the current baseline.
4. Verify every section, item, screen, field, and review-target ID that must
   survive the edit.

Apply one append-only `save` with the current `expectedHead`. If the head is
stale, abort, reload, and reapply the candidate to the latest draft.

After the save:

1. Confirm every baseline comment remains on its original target.
2. Confirm every status remains unchanged.
3. Allow changed targets to show the existing content-changed state.
4. Leave comments open until Xingyu or Lay Hui confirms resolution.

Never run `cms:import`, publish, restore, migrate, reset, replace the page,
change production aliases, or change the released `/` route.

## Approval gate

The final review requires the Designer, PM, capability owners, policy, and
security. Approval covers claims, positive scenarios, hero screen, Posts proof,
school assurance, anonymous measurement, seven-part IA, and comment retention.

Visual branding, final imagery, motion, detailed interactions, product feature
development, AI-layer branding, multipage architecture, public merge, and
production deployment remain out of scope.
