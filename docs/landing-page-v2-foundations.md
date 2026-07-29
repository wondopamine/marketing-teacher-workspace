# Landing Page v2 foundations

Status: foundation ready; launch decisions outstanding
Source: [GitHub issue #3](https://github.com/String-dxd/marketing-teacher-workspace/issues/3)

## What is locked

- Tell one connected student-care story across Student Insights, Contextual
  Intelligence, HeyTalia, and Posts.
- Lead with the student's journey and teacher value, not integrations or a
  feature bundle.
- Preserve accessibility, the footer, and the feedback link.

The ticket author explicitly described the proposed five-act narrative and
seven-section information architecture as suggestions. They are captured in
`src/content/landing-v2.ts` as editable draft content, not treated as approved
acceptance criteria.

## Foundation contract

- `src/config/site.ts` owns public destinations and ticket source links.
- `src/content/landing-v2.ts` owns the typed v2 journey, capability order,
  audiences, AI planning metadata, verbatim testimonials, support candidates,
  and the publication checklist. AI planning keeps the proposed future
  direction separate from the GA presentation decision.
- `src/content/landing-v2-readiness.ts` separates structural errors from
  product/content decisions. A draft may remain valid while launch readiness
  stays false.
- The current v1 content remains in `src/content/landing.ts`, so UX work can
  proceed without a half-migrated production page.

The UX implementation should consume the v2 contract instead of duplicating
copy inside components. Layout and motion may change without breaking these
relationships:

1. Five journey acts remain ordered from promise to record.
2. Acts two through five map once to the four capabilities.
3. Capability discovery cards mirror journey order and have unique anchors.
4. Audience coverage remains teachers, key personnel, and school leaders.
5. Testimonials retain their source, capability coverage, school attribution,
   and publication-approval state.
6. The same primary CTA intent is repeated in hero and close.

## Why no backend was added

Issue #3 does not define a form, lead capture, CRM, API, CMS, analytics
provider, consent model, or data-retention policy. The current conversion is a
plain link to an SSOE-restricted product. A backend would only be justified if
the chosen CTA becomes a contact or lead submission.

The possible shared AI/agent layer is also not a backend requirement for this
landing-page phase. It remains a working hypothesis, not an approved service
boundary. Before implementing shared context or orchestration, define:

- whether AI is a destination, embedded intelligence, or both;
- whether HeyTalia is the primary persona or one agent in a registry;
- which capabilities are agents, which are tools, and how new members register;
- which read, infer, recommend, draft, send, and update actions need human
  confirmation;
- whether memory belongs to a teacher, student case, school, or conversation,
  including access, retention, and deletion rules;
- the audit trail, attribution, and stable internal IDs independent of public
  naming.

Before adding a submission endpoint, define:

- fields and validation;
- system of record and operational owner;
- privacy notice, lawful purpose, retention, and deletion;
- spam/rate limiting and abuse handling;
- confirmation and failure behaviour;
- notification or follow-up service level.

Before adding analytics, define the conversion KPI, approved platform, event
taxonomy, consent rules, retention, and whether cross-domain attribution to
the product is permitted.

## Publication blockers

- GA is confirmed; the exact GA launch line is still unapproved.
- Contextual Intelligence and HeyTalia remain approved individual names. The
  working direction is to bring them into one Teacher Workspace AI/agent layer,
  but its GA presentation and public brand are still undefined.
- The single CTA's intent, label, destination, and non-SSOE fallback are
  unresolved.
- The canonical marketing origin, preview indexing policy, and social image
  are unknown.
- Product claims about eligibility, scheme matching, drafting, delivery/read
  tracking, and record updates need an accountable approver.
- The named student story and bundled demo data need confirmation as wholly
  synthetic and public-safe.
- Supplied verbatims are anonymous and Posts/PG-only. Approved,
  named-school Student Insights and HeyTalia coverage is still missing.
- Audience-specific questions and answers are not supplied.
- The launch support path is unclear. The PG Resource Centre is restricted,
  the Pair Assistant has no URL in the ticket, and the support bot is still in
  progress.

Do not publish the bursary screenshot attached to the ticket as-is; it contains
real-looking student names. Use redacted or purpose-built synthetic material.

## Integration gate

The v2 visual implementation is ready to start when the content owner resolves
the GA launch line, AI-layer presentation, CTA, claims, testimonial permissions,
and synthetic-data approval. Canonical/SEO and analytics/backend work can then
follow their respective decisions without reworking the content model.
