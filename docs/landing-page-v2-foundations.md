# Landing Page v2 foundations

Status: content-review foundation implemented; launch decisions outstanding

Source: [GitHub issue #3](https://github.com/String-dxd/marketing-teacher-workspace/issues/3)

## What is locked

- Tell one connected student-care story across Student Insights, Next-step
  guidance, Message drafting, and Posts.
- Use the proposed positive-growth narrative as the canonical review story.
  The financial-assistance/bursary example is non-canonical and may return only
  as a separately approved, fully synthetic example.
- Lead with the student's journey and the teacher's job.
- Use Teacher Workspace as the only public brand.
- Use one primary CTA: `Sign in with Google`.
- Send the CTA to the existing Teacher Workspace product link in
  `src/config/site.ts`.
- Tell teachers: `Use your @edu.gov.sg account.`
- Plan GA for Form Teachers, Key Personnel, and School Leaders.
- Keep audience confirmation pending until Xingyu (PM) records it.
- Use the accepted three-step explorer with synthetic data and no backend.
- Allow anonymous role-and-school-level testimonials for initial GA proof.
- Keep owner assignment separate from recorded approval.
- Keep internal capability names out of public labels and public copy.
- Preserve accessibility, the footer, and the feedback link.

The ticket's five-act narrative and seven-section information architecture
remain editable draft content. They are not approved acceptance criteria.

## Foundation contract

- `src/config/site.ts` owns the existing product destination and source links.
- `src/content/landing-v2.ts` owns the journey, public labels, audience,
  explorer, proof policy, approval governance, and measurement contract.
- `src/content/landing-v2-readiness.ts` separates structural errors from launch
  decisions.
- `src/content/landing-v2-review.server.ts` owns the ordered review registry and
  builds a public-copy projection without pending fields, raw sources, internal
  names, or unapproved proof.
- `src/content/landing-v2-review-state.server.ts` derives revision-aware review
  states, composes landing and review readiness on the server, and produces the
  narrow public-safe DTO returned to the route.
- `src/content/landing.ts` keeps the current v1 copy isolated from this
  foundation.

Future UI should consume the v2 contract instead of duplicating copy inside
components. Layout and motion may change while these relationships remain:

1. Five journey acts stay ordered from promise to record.
2. Acts two through five map once to the four capability IDs.
3. Capability cards mirror journey order and keep unique anchors.
4. Audience coverage stays Form Teachers, Key Personnel, and School Leaders.
5. Testimonials retain provenance, capability coverage, attribution policy,
   and publication status.
6. Hero and close use the same Google sign-in CTA.
7. The explorer keeps its confirmed comprehension flow and four-capability
   coverage.
8. Approval owners never count as recorded approvers.

## Content-review prototype

Open `/content-review` directly on the implementation branch or an explicitly
authorised non-production preview. The route is not linked from `/`, inherits
the existing skip link and SGDS masthead, and declares `noindex, nofollow`.
The public homepage, its metadata, and its current choreography remain
unchanged.

The route is an unauthenticated semantic review document. It deliberately has
no imagery, themed component system, motion, product simulation, analytics,
form submission, or review backend. `noindex` and an unshared URL are not
security controls, so every rendered value and server-function response must
remain safe for public retrieval.

Review annotations are informational aids. They do not record authenticated
approval, grant publication authority, or replace the external decision
record. Missing public copy renders as an explicit decision slot instead of a
plausible placeholder.

## Review workflow

Give feedback using the visible review reference and the current content
snapshot, for example `TW-CAP-STUDENT-INSIGHTS / v2-sha256-…`. Do not refer to
visual position such as “the third card”; order can change while references
stay stable. Restricted evidence and free-form reviewer discussion stay in the
approved external channel and are cited there using the same reference and
snapshot. The review route must never contain that evidence.

| Display state | Meaning | Required next action |
| --- | --- | --- |
| `blocked` | Structural or public-safety validation failed. | Stop review until the validation issue is fixed. |
| `decision-required` | Copy, evidence, ownership, or reviewer requirements are unresolved. | Supply and record the missing decision in the approved external channel. |
| `reconfirmation-required` | A recorded review targets an older snapshot. | Review the current snapshot again. |
| `unreviewed` | No review is recorded for the current snapshot. | Review this item against the displayed snapshot. |
| `partially-reviewed` | Some, but not all, confirmed reviewer roles have reviewed the current snapshot. | Ask the remaining roles to review it. |
| `reviewed-current` | Every required role has a record for the current snapshot. | Treat it as current review evidence only, never as publication approval. |

Three snapshot levels prevent stale decisions from silently surviving edits:

- each item snapshot changes when that item’s reviewable copy, destination, or
  public capability mapping changes;
- the IA-order snapshot changes when any section or within-section item moves;
- the composed-story snapshot changes when order or connected context changes.

The IA-order snapshot is derived from ordered server-only content IDs, while
those IDs never enter the browser DTO. An unchanged item can therefore remain
current while a reordered or rewritten story correctly asks for contextual
reconfirmation. Separate record-bearing IA-order and composed-story artifacts
track those aggregate reviews without mixing them into item registry coverage.

## Review responsibilities

- The Designer facilitates review, collates reference-and-snapshot feedback,
  and owns the positive, opportunity-led story rubric.
- The product manager validates audience intent, product behaviour, and product
  claims. The public route displays this role without a personal name.
- Policy and security reviewers decide publication, sensitive-content,
  synthetic-data, proof, access, and measurement questions in an approved
  external channel.

The canonical external channel and its steward are still unresolved. Until
they are named, repository state and role ownership are display aids only. A
person being listed as an owner is never evidence that they approved the copy.

## Preview lifecycle

Creating or deploying a review preview requires explicit authorisation. Before
sharing it, verify that its project and alias are non-production and record:

- preview URL and project/alias;
- owner;
- reviewed item, IA-order, and composed-story snapshots;
- creation date and expiry;
- retirement date and evidence that the old URL no longer serves the artifact.

Never promote this route to production from this phase. Retire a superseded
preview before sharing its replacement. If future review content cannot remain
public-safe, do not deploy this unauthenticated route; use an approved protected
channel instead.

## Visual handoff

The reviewed draft projection, stable references, and accepted section order
are inputs to visual design, not publication authority. The neutral classes and
all review annotations can be removed without rewriting the public-copy
outline. The later visual phase must preserve semantic order, accessibility,
public naming, CTA/access rules, and unresolved publication gates.

Media, themed components, responsive art direction, the interactive explorer,
analytics, a publication-only projection, and production routing are follow-up
work. Before that phase begins, run a short review pilot with the Designer, the
product manager, and an available policy or security reviewer. The pilot is a
handoff gate—not yet a completed activity—and succeeds only if participants can
cite stable references, interpret each state and next action, identify omitted
content, and focus on IA/content without treating the neutral layout as a
visual proposal.

## Public naming and approval governance

Teacher Workspace is the sole public brand. Public capability labels map to
stable internal IDs:

| Internal ID | Public label |
| --- | --- |
| `student-insights` | Student Insights |
| `contextual-intelligence` | Next-step guidance |
| `hey-talia` | Message drafting |
| `posts` | Posts |

`Contextual Intelligence` and `HeyTalia` are internal-only names. They must
not appear in capability labels, public descriptions, or launch-decision copy.

Approval governance records three separate facts:

| Decision | Accountable owner | Default state | Recorded approval |
| --- | --- | --- | --- |
| GA audience | Xingyu (PM) | Pending PM confirmation | None |
| Product claims | Xingyu (PM) | Pending approval | None |
| Synthetic story and demo | Designer and Xingyu (PM) | Pending approval | None |

The owner column assigns responsibility. Readiness clears only after the
matching state changes and the required approver is recorded.

## Accepted product explorer

Teachers can understand the connected workflow before opening the restricted
product. The accepted explorer follows this order:

1. Choose a synthetic scenario.
2. Inspect the connected context.
3. Preview the resulting action.

Every capability stays reachable within these three steps. Placement within the
page remains undecided.

The explorer uses public-safe synthetic data and local interactions. It needs
no authentication, persistence, AI inference, submission endpoint, or backend.

## Initial GA proof

Anonymous role-and-school-level attribution is valid for initial GA
testimonials. A school name is not required.

Each selected quote still needs publication approval and an HTTPS source.
Current proof covers Posts. Approved coverage for Student Insights and Message
drafting is still missing.

Do not invent a school name or infer one from the testimonial source.

## Publication blockers

The following decisions are resolved:

- CTA intent, label, destination, Google provider, account domain, and access
  note;
- the accepted synthetic explorer and its three-step flow;
- anonymous role-and-school-level testimonial attribution;
- plain-language capability labels.

Publishing remains blocked by:

- the GA launch line and general content approval;
- canonical URL, preview indexing policy, and social image;
- Xingyu's recorded confirmation of the intended GA audience;
- audience questions and answers;
- Xingyu's recorded approval of product claims;
- recorded synthetic/demo approval from both the Designer and Xingyu;
- publication approval for every selected testimonial;
- missing approved testimonial coverage for Student Insights and Message
  drafting;
- a launch-ready support strategy, destination, owner, access explanation, and
  approver.

Named owners show accountability only. Their names do not prove confirmation
or approval.

## Measurement and integration contract

Measurement should show whether teachers understand the story and reach the
product. The contract stays independent of any analytics provider.

| Classification | Event | Source surface | Required detail |
| --- | --- | --- | --- |
| Engagement | `scroll-milestone` | Marketing | `25`, `50`, `75`, or `100` |
| Engagement | `explorer-scenario-selected` | Marketing | Synthetic scenario ID |
| Engagement | `explorer-connected-context-inspected` | Marketing | Synthetic scenario ID |
| Engagement | `explorer-resulting-action-previewed` | Marketing | Synthetic scenario ID |
| Interim proxy | `primary-cta-selected` | Marketing | `hero` or `close` placement |
| True conversion | `product-access-completed` | Product/auth | Google `sign-in` or `sign-up` outcome |

CTA selection shows intent on the marketing surface. It is not a completed
product access event.

The product/auth surface owns `product-access-completed`. Cross-domain
attribution is required to associate that event with a landing journey.

Before implementation, approve the correlation, consent, retention, and event
delivery contract. The event pipeline must honour that contract across both
surfaces.

Event payloads may contain only these allowlisted fields:

- journey ID;
- CTA placement;
- synthetic scenario ID.

Event payloads must never send these values back to the marketing site:

- student data;
- testimonial text;
- teacher email addresses;
- account identifiers.

## Repository boundary

The marketing repository consumes the existing product/auth link. It defines
portable event names, ownership, and integration requirements.

The product/auth system owns OAuth and completed-access emission. Approved
platform services own cross-domain identity, analytics-provider initialisation,
persistence, and backend processing.

This marketing change adds no auth flow, analytics runtime, endpoint,
environment variable, persistence, or backend.

## Synthetic-data warning

Do not publish the bursary screenshot attached to the ticket. It contains
real-looking student names.

Use redacted or purpose-built synthetic material. The Designer and Xingyu (PM)
must both record approval before publication.

## Integration gate

Design and future UI work can proceed against this foundation. Publishing stays
blocked until every decision listed above has a recorded resolution.
