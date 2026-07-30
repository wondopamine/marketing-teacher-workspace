# Landing Page v2 foundations

Status: foundation ready; launch decisions outstanding

Source: [GitHub issue #3](https://github.com/String-dxd/marketing-teacher-workspace/issues/3)

## What is locked

- Tell one connected student-care story across Student Insights, Next-step
  guidance, Message drafting, and Posts.
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
