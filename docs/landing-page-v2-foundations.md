# Landing page v2 foundations

Status: The PM-facing content-review wireframe exists, but its bursary candidate
is superseded. Use [the GA landing-page specification](landing-page-ga-spec.md)
for the next candidate. Launch decisions remain open.

Source: [GitHub issue #3](https://github.com/String-dxd/marketing-teacher-workspace/issues/3)

## Historical v2 contract

The sections below document the current review candidate and its code
boundaries. They remain useful for preserving stable IDs and CMS comments, but
they no longer define the next content direction. ADR-0004 replaces the
single-student bursary journey with three separate positive scenarios after GA
claims are confirmed.

## What was locked for the current candidate

- The page presents Teacher Workspace as a connected platform across Student
  Insights, AI next-step guidance, Message drafting, and Posts. The bursary
  journey is one worked example of that platform, not the whole product story.
- The canonical review story is the ticket's bursary near-miss. The synthetic
  student "Xiao Ming" appears in every act under the guardrails in
  [ADR-0001](adr/0001-bursary-care-story-is-canonical.md). The ticket's bursary
  screenshot cannot be published.
- The student's journey and the teacher's job lead the page.
- Teacher Workspace is the only public brand.
- The page has one primary CTA: `Sign in with Google`.
- The CTA uses the existing Teacher Workspace product link in
  `src/config/site.ts`.
- The access note says: `Use your @edu.gov.sg account.`
- The planned GA audiences are Form Teachers, Key Personnel, and School
  Leaders. Audience confirmation remains pending until Xingyu (PM) records it.
- The accepted three-step explorer uses synthetic data and has no backend. It
  has no section on the GA page because the journey and capability cards
  already explain the product. See
  [ADR-0002](adr/0002-cut-the-product-explorer-from-the-ga-page.md).
- Initial GA proof may use anonymous role-and-school-level testimonials.
- Owner assignment and recorded approval are separate facts.
- Public labels and copy do not use internal capability names.
- The page keeps its accessibility, footer, and feedback link.

The ticket proposes a five-act narrative and seven-section information
architecture. Reviewers can edit both, and neither is an approved acceptance
criterion.

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

The v2 contract is the source for UI copy and the following relationships.
Layout and motion may change without changing them:

1. Five journey acts stay ordered from promise to record.
2. Acts two through five map once to the four capability IDs.
3. Capability sections mirror journey order and keep unique anchors.
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
The route does not change the public homepage, its metadata, or its current
choreography.

The route is an unauthenticated, PM-facing landing-page wireframe. It shows the
canonical draft copy in the proposed page order, so reviewers can judge a
landing flow instead of a code-like information architecture. The greyscale
styling is neutral and temporary. The route omits imagery, themed components,
motion, live CTAs, product interaction, analytics, form submission, and a
review backend. Pending decisions appear as empty labelled slots.

The route has no authentication, so every rendered value and server-function
response must be safe for public retrieval. `noindex` and an unshared URL do
not provide access control. PM, policy, security, and content reviewers can use
the same route while the website is being built.

Review annotations help people locate copy. They do not record authenticated
approval, grant publication authority, or replace the external decision
record.

## Review workflow

In the wireframe, give feedback by naming the visible section heading or
pending label and quoting a short copy excerpt. Do not refer only to visual
position such as "the third card"; order can change. In the approved external
record, the Designer or product manager maps that feedback to the server-owned
stable review reference and current snapshot. Raw references, snapshots,
restricted evidence, and free-form reviewer discussion never render on the
review route.

The route-facing server projection strips those review fields and unused link
destinations before SSR serialization. Production verification checks the
complete HTML response, including its hydration payload, rather than only the
visible DOM.

| Registry state            | Meaning                                                                         | Required next action                                                     |
| ------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `blocked`                 | Structural or public-safety validation failed.                                  | Stop review until the validation issue is fixed.                         |
| `decision-required`       | Copy, evidence, ownership, or reviewer requirements are unresolved.             | Supply and record the missing decision in the approved external channel. |
| `reconfirmation-required` | A recorded review targets an older snapshot.                                    | Review the current snapshot again.                                       |
| `unreviewed`              | No review is recorded for the current snapshot.                                 | Review this item against the current snapshot in the external record.    |
| `partially-reviewed`      | Some, but not all, confirmed reviewer roles have reviewed the current snapshot. | Ask the remaining roles to review it.                                    |
| `reviewed-current`        | Every required role has a record for the current snapshot.                      | Treat it as current review evidence only, never as publication approval. |

Three snapshot levels stop an edit from leaving an old decision marked current:

- each item snapshot changes when that item's reviewable copy, destination, or
  public capability mapping changes;
- the IA-order snapshot changes when any section or within-section item moves;
- the composed-story snapshot changes when order or connected context changes.

The IA-order snapshot is derived from ordered server-only content IDs, while
those IDs never enter the browser DTO. An unchanged item can therefore remain
current while a reordered or rewritten story correctly asks for contextual
reconfirmation. Separate record-bearing IA-order and composed-story artifacts
track those aggregate reviews without mixing them into item registry coverage.

## Review responsibilities

- The Designer facilitates review, collates section-and-copy feedback, maps it
  to the corresponding reference and snapshot in the external record, and owns
  the positive, opportunity-led story rubric.
- The product manager validates audience intent, product behaviour, and product
  claims. The public route displays this role without a personal name.
- Policy and security reviewers decide publication, sensitive-content,
  synthetic-data, proof, access, and measurement questions in an approved
  external channel.

No canonical external channel or steward is recorded yet. Until there is one,
repository state and role ownership are display aids only. Listing a person as
an owner does not show that they approved the copy.

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

Use the PM-facing wireframe, server-owned stable references, and accepted
section order as inputs to visual design. Publication still needs separate
approval. The wireframe communicates hierarchy, page rhythm, and copy
placement without proposing branded visuals or interactions. Designers can
replace the neutral classes and review annotations without rewriting the
public-copy outline. The visual phase must preserve semantic order,
accessibility, public naming, CTA and access rules, and unresolved publication
gates.

Media, themed components, responsive art direction, the interactive explorer,
analytics, a publication-only projection, and production routing are follow-up
work. Content and clearance review can run alongside that work because the
wireframe contains only public-safe data and labels pending material.
Before treating the content as locked, run a short review pilot with the
Designer, the product manager, and an available policy or security reviewer.
The pilot succeeds only if participants can identify sections and pending
decisions consistently, interpret each state and next action, identify omitted
content, and focus on IA/content without treating the neutral layout as a final
visual proposal.

## Public naming and approval governance

Teacher Workspace is the sole public brand. Public capability labels map to
stable internal IDs:

| Internal ID               | Public label          |
| ------------------------- | --------------------- |
| `student-insights`        | Student Insights      |
| `contextual-intelligence` | AI next-step guidance |
| `hey-talia`               | Message drafting      |
| `posts`                   | Posts                 |

`Contextual Intelligence` and `HeyTalia` are internal-only names. They must
not appear in capability labels, public descriptions, or launch-decision copy.

Approval governance records three separate facts:

| Decision                 | Accountable owner        | Default state           | Recorded approval |
| ------------------------ | ------------------------ | ----------------------- | ----------------- |
| GA audience              | Xingyu (PM)              | Pending PM confirmation | None              |
| Product claims           | Xingyu (PM)              | Pending approval        | None              |
| Synthetic story and demo | Designer and Xingyu (PM) | Pending approval        | None              |

The owner column assigns responsibility. Readiness clears only after the
matching state changes and the required approver is recorded.

## Accepted product explorer

Teachers can understand the connected workflow before opening the restricted
product. The accepted explorer follows this order:

1. Choose a synthetic scenario.
2. Inspect the connected context.
3. Preview the resulting action.

Every capability stays reachable within these three steps.

The future explorer uses public-safe synthetic data and local interactions. It
needs no authentication, persistence, AI inference, submission endpoint, or
backend. It has no section on the GA page or the `/content-review` wireframe.
It is future work with no page slot; see
[ADR-0002](adr/0002-cut-the-product-explorer-from-the-ga-page.md).

## Initial GA proof

Anonymous role-and-school-level attribution is valid for initial GA
testimonials. A school name is not required.

Each selected quote still needs publication approval and an HTTPS source.
Required coverage is Posts only. The proof section says what the verbatims
actually evidence. Coverage for other capabilities requires future fieldwork
and is not a launch gate. See
[ADR-0003](adr/0003-publish-the-proof-we-have.md).

Do not invent a school name or infer one from the testimonial source.

## Publication blockers

The following decisions are resolved:

- CTA intent, label, destination, Google provider, account domain, and access
  note;
- the accepted synthetic explorer and its three-step flow;
- anonymous role-and-school-level testimonial attribution;
- plain-language capability labels.

Publishing remains blocked by:

- general content approval (GA positioning was confirmed by the PM on
  2026-08-07 and the launch line is filled as proposed copy);
- canonical URL, preview indexing policy, and social image;
- Xingyu's recorded confirmation of the intended GA audience;
- audience questions and answers;
- Xingyu's recorded approval of product claims;
- recorded synthetic/demo approval from both the Designer and Xingyu;
- publication approval for every selected testimonial;
- a launch-ready support strategy, destination, owner, access explanation, and
  approver.

Named owners show accountability only. Their names do not prove confirmation
or approval.

## Measurement and integration contract

Measurement should show whether anonymous visitors understand the page and
choose the Google sign-in action. The contract stays independent of any
analytics provider.

| Priority | Event | Source surface | Decision still required |
| --- | --- | --- | --- |
| Primary | `primary-cta-selected` | Marketing | Eligible anonymous-session denominator |
| Secondary | `section-reached` | Marketing | Reach thresholds |
| Secondary | `capability-engaged` | Marketing | Engagement definition |

Before implementation, approve the analytics owner, reporting cadence,
consent, retention, denominator, thresholds, and event definitions.

Event payloads may contain only these allowlisted fields:

- anonymous session ID;
- CTA placement.

Event payloads must never send these values back to the marketing site:

- student data;
- testimonial text;
- teacher email addresses;
- account identifiers.

## Repository boundary

The marketing repository consumes the existing product/auth link. It defines
portable event names, ownership, and integration requirements.

The product/auth system owns OAuth and access. Approved platform services own
analytics-provider initialisation, persistence, and backend processing.

The marketing repository has no auth flow, analytics runtime, endpoint,
environment variable, persistence, or backend for this contract.

## Synthetic-data warning

Do not publish the bursary screenshot attached to the ticket. It contains
real-looking student names.

Use redacted or purpose-built synthetic material. The Designer and Xingyu (PM)
must both record approval before publication.

## Integration gate

Design and future UI work can proceed against this foundation. Publishing stays
blocked until every decision listed above has a recorded resolution.
