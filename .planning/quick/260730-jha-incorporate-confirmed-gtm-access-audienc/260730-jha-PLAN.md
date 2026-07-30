---
phase: 260730-jha
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/content/landing-v2.ts
  - src/content/landing-v2-readiness.ts
  - src/content/landing-v2.test.ts
  - docs/landing-page-v2-foundations.md
autonomous: true
requirements:
  - QUICK-260730-jha
must_haves:
  truths:
    - "The primary landing CTA is a Google sign-in link to the existing Teacher Workspace product surface and tells teachers to use an @edu.gov.sg account; the marketing repository owns no OAuth flow."
    - "Form Teachers, Key Personnel, and School Leaders are recorded as the intended GA audience while PM confirmation remains an explicit launch decision."
    - "The accepted explorer follows scenario choice -> connected-context inspection -> resulting-action preview, uses synthetic data only, and requires no backend."
    - "Anonymous role-and-school-level testimonials are valid initial GA proof, while testimonial publication approval and missing capability coverage remain explicit blockers."
    - "Xingyu (PM) is recorded as product-claim approval owner, and the Designer plus Xingyu (PM) are recorded as synthetic/demo approval owners; owner metadata alone never clears readiness."
    - "Contextual Intelligence and HeyTalia remain usable as internal IDs but never appear in surfaceable capability labels or public copy."
    - "A provider-neutral measurement contract distinguishes scroll/explorer engagement, CTA selection as a proxy, and completed Google product access as the true conversion requiring cross-domain attribution."
    - "The default foundation remains not launch-ready for every genuinely unresolved confirmation or approval."
  artifacts:
    - path: "src/content/landing-v2.ts"
      provides: "Typed GTM access, audience, explorer, proof, naming, approval-governance, and measurement contracts"
      exports:
        - "landingPageV2Content"
        - "landingPageV2Publication"
        - "landingPageV2MeasurementPlan"
    - path: "src/content/landing-v2-readiness.ts"
      provides: "Launch decision checks that distinguish assigned owners from recorded approvals"
      exports:
        - "getLandingPageV2StructureIssues"
        - "getLandingPageV2LaunchDecisions"
        - "getLandingPageV2Readiness"
    - path: "src/content/landing-v2.test.ts"
      provides: "Focused regression coverage for every confirmed decision and remaining blocker"
      contains: "Landing Page v2 content contract"
    - path: "docs/landing-page-v2-foundations.md"
      provides: "Current foundation, publication blockers, and provider-neutral integration requirements"
  key_links:
    - from: "src/content/landing-v2.ts"
      to: "src/config/site.ts"
      via: "landingPageV2Publication.primaryCta.href reuses siteConfig.links.product"
      pattern: "siteConfig\\.links\\.product"
    - from: "src/content/landing-v2-readiness.ts"
      to: "src/content/landing-v2.ts"
      via: "readiness evaluates publication governance status and recorded approvers separately"
      pattern: "landingPageV2Publication"
    - from: "src/content/landing-v2.test.ts"
      to: "src/content/landing-v2-readiness.ts"
      via: "tests exercise default pending state, invalid mutations, and a fully resolved candidate"
      pattern: "getLandingPageV2(Readiness|LaunchDecisions|StructureIssues)"
    - from: "docs/landing-page-v2-foundations.md"
      to: "src/content/landing-v2.ts"
      via: "documentation names the same CTA, event taxonomy, approval states, and integration ownership encoded in the typed contract"
      pattern: "Google sign-in|scroll milestone|cross-domain"
---

<objective>
Incorporate the confirmed GTM access, audience, explorer, proof, public naming,
approval ownership, and measurement decisions into the Landing Page foundation
without treating any pending confirmation as complete (D-01 through D-09).

Purpose: Give design and future UI work one truthful typed source of record:
confirmed choices are directly consumable, owner assignment is not mistaken for
approval, and launch readiness continues to expose the remaining decisions.

Output: Updated content/publication/measurement contracts, readiness gates,
focused tests, and integration documentation. No live UI, OAuth implementation,
analytics provider code, or marketing backend is included.
</objective>

<execution_context>
@/Users/jeongwondo/.codex/gsd-core/workflows/execute-plan.md
@/Users/jeongwondo/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/PROJECT.md
@.planning/STATE.md
@src/config/site.ts
@src/content/landing-v2.ts
@src/content/landing-v2-readiness.ts
@src/content/landing-v2.test.ts
@docs/landing-page-v2-foundations.md

<interfaces>
The current foundation already centralizes the restricted product destination
as `siteConfig.links.product` and separates `getLandingPageV2StructureIssues`
from `getLandingPageV2LaunchDecisions`. Preserve both patterns.

Treat the following decision IDs as locked:

- D-01: Primary CTA is Google sign-in for teachers using @edu.gov.sg accounts.
- D-02: Intended GA audience is Form Teachers, Key Personnel, and School
  Leaders; Xingyu (PM) confirmation is pending.
- D-03: Xingyu (PM) owns product-claim approval; ownership is not approval.
- D-04: Explorer is accepted with the ordered comprehension flow
  choose-scenario, inspect-connected-context, preview-resulting-action; it is
  synthetic and backend-free.
- D-05: Anonymous role-and-school-level testimonials are acceptable for
  initial GA proof.
- D-06: Synthetic/demo approval owners are the Designer and Xingyu (PM);
  approval is pending until recorded.
- D-07: Contextual Intelligence and HeyTalia are internal-only names; public
  copy uses plain-language capability/job labels.
- D-08: Measurement covers engagement and conversion; scroll milestones and
  explorer engagement are engagement signals, completed Google sign-in/sign-up
  is the true conversion, and CTA selection is the interim proxy.
- D-09: The marketing repository links to the existing product/auth surface and
  defines integration requirements only; it does not implement OAuth,
  analytics provider code, or a backend.
</interfaces>
</context>

<dependency_graph>
Task 1 needs the existing content/publication and readiness contracts and
creates the authoritative typed model plus regression coverage. Task 2 needs
that resulting model and documents its public-copy, governance, and
cross-domain integration contract. Both tasks are autonomous and execute in
order within this plan.
</dependency_graph>

<source_audit>

| Source | ID | Feature/Requirement | Plan | Status | Notes |
|--------|----|---------------------|------|--------|-------|
| GOAL | — | Incorporate the confirmed GTM decisions without implementing runtime integrations | 01 | COVERED | Tasks 1-2 |
| REQ | QUICK-260730-jha | Atomic foundation contract/readiness/docs update | 01 | COVERED | Four scoped files |
| RESEARCH | — | No research artifact or new dependency is needed | — | N/A | Existing internal patterns only |
| CONTEXT | D-01 | Google sign-in CTA and @edu.gov.sg access | 01 | COVERED | Task 1 contract and tests; Task 2 docs |
| CONTEXT | D-02 | Intended GA audience with PM confirmation pending | 01 | COVERED | Task 1 governance/readiness |
| CONTEXT | D-03 | Product-claim owner is not recorded approval | 01 | COVERED | Task 1 governance/readiness |
| CONTEXT | D-04 | Accepted three-step synthetic explorer | 01 | COVERED | Task 1 structure and tests |
| CONTEXT | D-05 | Anonymous initial-GA proof accepted | 01 | COVERED | Task 1 readiness and tests |
| CONTEXT | D-06 | Designer/PM demo approval ownership remains pending | 01 | COVERED | Task 1 governance/readiness |
| CONTEXT | D-07 | Internal AI capability names stay out of public copy | 01 | COVERED | Task 1 labels and leakage regression |
| CONTEXT | D-08 | Provider-neutral engagement/conversion measurement | 01 | COVERED | Task 1 typed plan; Task 2 integration requirements |
| CONTEXT | D-09 | No marketing OAuth, analytics provider, or backend | 01 | COVERED | Both tasks preserve contract-only boundary |

</source_audit>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Encode confirmed GTM decisions and truthful readiness gates</name>
  <files>src/content/landing-v2.ts, src/content/landing-v2-readiness.ts, src/content/landing-v2.test.ts</files>
  <behavior>
    - D-01: The default primary CTA has label `Sign in with Google`, uses `siteConfig.links.product`, has intent `google-sign-in`, identity provider `google`, required account domain `edu.gov.sg`, and access note `Use your @edu.gov.sg account.`
    - D-02: The intended audience tuple remains teachers/key-personnel/school-leaders, the first public label is `Form Teachers`, and default publication status remains pending PM confirmation with Xingyu (PM) as owner and no recorded confirmer.
    - D-03: Merely setting Xingyu (PM) as product-claim owner still returns the `product-claims` decision; only an approved status plus a nonblank recorded approver clears it.
    - D-04: The explorer is accepted and its exact ordered flow is choose-scenario, inspect-connected-context, preview-resulting-action; it covers all four capability IDs, uses synthetic data, and requires no backend.
    - D-05: Null testimonial school names no longer produce a school-name launch decision, while unapproved testimonials still produce `testimonial-approval` and missing internal capability coverage remains visible.
    - D-06: Merely listing Designer and Xingyu (PM) as synthetic/demo approval owners still returns `synthetic-demo-approval`; it clears only after approved status and both approvals are recorded.
    - D-07: Surfaceable capability labels use `Next-step guidance` and `Message drafting`; a regression test rejects the literals Contextual Intelligence and HeyTalia from public-copy fields while allowing internal capability IDs.
    - D-08: The measurement plan is provider-neutral, tracks 25/50/75/100 scroll milestones and the explorer's three comprehension steps, treats `primary-cta-selected` as a marketing-surface proxy, and treats product access completed by Google sign-in or sign-up on the product/auth surface as true conversion.
    - D-09: The content model contains integration requirements only and imports no OAuth or analytics SDK.
    - The default candidate remains `ready: false`; resolved CTA and anonymous attribution are absent from the blocker list, while GA copy/content, audience confirmation/copy, product claims, synthetic demo, testimonial coverage/approval, canonical/social, and support decisions remain represented.
    - A fully resolved typed fixture still returns `{ ready: true, issues: [] }`.
  </behavior>
  <action>
    Start with tests, then implement the contract until they pass.

    In the content module, make capability surface semantics explicit by
    replacing the generic card `name` field with `publicLabel`. Keep internal
    `CapabilityId` values and anchors unchanged, retain `Student Insights` and
    `Posts` where already public, and use `Next-step guidance` plus `Message
    drafting` for the two internal-only names per D-07. Add the explorer flow as
    an exact ordered tuple and change its default status to accepted per D-04;
    retain all-capability coverage, three-step maximum, synthetic-only data,
    backend-free operation, and unresolved placement.

    Narrow the primary CTA intent to `google-sign-in` and populate the default
    publication CTA with the exact D-01 label, existing `siteConfig.links.product`
    destination, Google provider, `edu.gov.sg` domain, and public access note.
    Reuse the existing site-config destination per D-09; do not add another URL
    or modify site config.

    Replace ambiguous approval strings with governance objects that keep
    decision owner, state, and recorded approver separate. Add `gaAudience` with
    the exact intended audience IDs, `pending-pm-confirmation` default status,
    Xingyu (PM) owner, and null `confirmedBy` per D-02. Add
    `productClaimsApproval` with Xingyu (PM) owner, pending default status, and
    null `approvedBy` per D-03. Add `syntheticDemoApproval` with the exact owner
    tuple Designer/Xingyu (PM), pending default status, and an empty
    `approvedBy` list per D-06. Record D-05 as the literal testimonial
    attribution policy `anonymous-role-and-school-level`; keep each quote's
    `publicationApproved` flag and capability-coverage requirements intact.
    Preserve all unrelated null publication decisions.

    Export a typed `landingPageV2MeasurementPlan` per D-08. Use no vendor name
    or SDK. Encode objectives `engagement` and `conversion`; scroll milestones
    25/50/75/100; explorer events for scenario selection, connected-context
    inspection, and resulting-action preview; proxy event
    `primary-cta-selected` owned by the marketing surface; and true event
    `product-access-completed` owned by the product/auth surface with Google
    outcomes sign-in/sign-up. Mark cross-domain attribution as required to join
    true conversion to the landing journey and mark the marketing
    implementation boundary as contract-only per D-09.

    In readiness, preserve the structure-versus-decision split. Extend accepted
    explorer validation to require the exact comprehension-flow order. Add a
    public-capability-label structure check for the two prohibited display
    literals. Update CTA validation for the resolved Google access contract.
    Add an audience-confirmation decision that requires confirmed status and a
    recorded confirmer. Update product-claim and synthetic-demo decisions so
    owner presence never satisfies approval; the synthetic/demo check must
    require both named owners in the recorded approvals. Remove the school-name
    requirement under the accepted anonymous attribution policy, but retain
    testimonial provenance, capability coverage, and per-quote publication
    approval gates. Use plain-language public labels in decision messages even
    when issue codes retain internal IDs.

    Refactor the existing ready fixtures and mutation table to the new typed
    shapes. Add focused regressions for each behavior above, including separate
    owner-without-approval cases, exact explorer order, public-label leakage,
    anonymous proof, exact measurement semantics, the updated default blocker
    set, and the fully resolved path. Keep the content contract readonly and
    literal with `satisfies`; retain strict type-level assertions for the new
    tuples and governance states.
  </action>
  <verify>
    <automated>pnpm test src/content/landing-v2.test.ts</automated>
  </verify>
  <done>
    - All D-01 through D-09 decisions are represented in typed data or readiness logic.
    - Confirmed CTA, explorer, proof-attribution, and naming decisions no longer appear as unresolved blockers.
    - PM confirmation, product claims, synthetic/demo approval, testimonial publication/coverage, audience copy, and unrelated publication decisions remain explicit.
    - Owner-only fixtures fail readiness, fully approved fixtures pass, and the focused test file is green.
    - No UI, OAuth handler, analytics runtime, SDK, endpoint, environment variable, or marketing backend is created.
  </done>
</task>

<task type="auto">
  <name>Task 2: Document publication state and provider-neutral measurement integration</name>
  <files>docs/landing-page-v2-foundations.md</files>
  <action>
    Bring the foundation document into exact alignment with the typed contract.
    In `What is locked` and `Foundation contract`, record the Google sign-in CTA,
    @edu.gov.sg access note, existing product destination, intended audience
    roles with PM confirmation pending, accepted three-step explorer,
    anonymous initial-GA proof policy, separate owner/approval states, and
    plain-language public naming per D-01 through D-07. Replace the prior
    explorer proposal language with the accepted synthetic flow, while leaving
    placement undecided and retaining the backend-free boundary.

    Rewrite `Publication blockers` to distinguish what is resolved from what is
    still pending. Remove CTA intent and named-school attribution as blockers.
    Keep GA launch copy, general content approval, canonical/social metadata,
    audience PM confirmation and audience copy, product-claim approval,
    synthetic/demo approval, testimonial publication and missing capability
    coverage, and support decisions explicit. Name Xingyu (PM) and the
    Designer/Xingyu pair only as accountable approval owners, never as evidence
    of completed approval.

    Add a provider-neutral `Measurement and integration contract` section per
    D-08 and D-09. Define the 25/50/75/100 `scroll-milestone` signal, the three
    explorer events, CTA selection with hero/close placement as the interim
    proxy, and `product-access-completed` with Google sign-in/sign-up outcome as
    true conversion. State that the true event originates on the product/auth
    surface, cross-domain attribution is required to associate it with a
    landing journey, and implementation requires an approved correlation,
    consent, retention, and event-delivery contract. Event payloads may contain
    allowlisted journey/placement/synthetic scenario identifiers only; they
    must not send student data, testimonial text, teacher email addresses, or
    account identifiers back to the marketing site.

    State the repository boundary unambiguously: the landing consumes the
    existing product/auth link and defines portable events/integration
    requirements; OAuth, completed-access emission, cross-domain identity,
    analytics-provider initialization, persistence, and backend processing
    belong outside this marketing change. Preserve the current warning against
    publishing real-looking student demo data.
  </action>
  <verify>
    <automated>pnpm test src/content/landing-v2.test.ts &amp;&amp; pnpm typecheck &amp;&amp; pnpm lint &amp;&amp; pnpm build</automated>
  </verify>
  <done>
    - Documentation and typed contracts describe the same confirmed choices and pending approvals.
    - The measurement section identifies exact engagement, proxy, and true-conversion semantics without choosing or implementing an analytics provider.
    - The auth/analytics/backend ownership boundary and public-data restrictions are explicit.
    - Focused tests, full typecheck, full lint, and production build pass.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Marketing content -> product/auth surface | A public CTA leaves this repository for the existing restricted Teacher Workspace sign-in surface. |
| Internal foundation -> public copy | Internal capability IDs and approval metadata may be consumed by a future public landing UI. |
| Synthetic explorer/proof -> public visitor | Demo context and anonymous testimonials are public content and must not expose real student, school, or account data. |
| Marketing engagement -> product conversion | Marketing-side proxy signals and product/auth completion signals cross deployment and ownership boundaries. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-260730-jha-01 | Spoofing | `landingPageV2Publication.primaryCta` | high | mitigate | Bind the CTA to the existing HTTPS `siteConfig.links.product` constant, encode Google/@edu.gov.sg access as content metadata, and keep OAuth handling outside the marketing repository. |
| T-260730-jha-02 | Tampering | Approval governance in `landing-v2-readiness.ts` | high | mitigate | Model owners, status, and recorded approvers separately; tests prove an owner alone cannot clear product-claim, audience, or synthetic/demo readiness decisions. |
| T-260730-jha-03 | Information Disclosure | Explorer, proof, and measurement contract | high | mitigate | Require synthetic-only/backend-free explorer data, permit anonymous proof without inventing school names, and document an allowlist that excludes student data, testimonial text, teacher email, and account identifiers from event payloads. |
| T-260730-jha-04 | Information Disclosure | Public capability copy | medium | mitigate | Keep internal IDs for code relationships, expose plain-language labels, and add a structure regression for the two prohibited public names. |
| T-260730-jha-05 | Repudiation | Engagement/conversion reporting | medium | mitigate | Label CTA selection as a proxy and recognize only product/auth `product-access-completed` as true conversion; document source-surface ownership and the cross-domain attribution requirement. |
| T-260730-jha-06 | Elevation of Privilege | Marketing repository | low | accept | This change adds no executable auth path, provider SDK, server endpoint, secrets, or backend capability; authentication remains entirely on the existing product surface. |
</threat_model>

<verification>
- `pnpm test src/content/landing-v2.test.ts` passes the focused decision-contract suite.
- `pnpm typecheck` passes under the repository's strict readonly/literal types.
- `pnpm lint` passes across the full repository.
- `pnpm build` produces a successful production build.
- The diff is limited to the four declared files; `src/config/site.ts` remains the reused source of truth and no live UI, route, OAuth, analytics runtime, or backend file is added.
- Default `getLandingPageV2StructureIssues()` is empty and default `getLandingPageV2Readiness().ready` remains false only because recorded confirmations/approvals and unrelated publication decisions are still outstanding.
</verification>

<success_criteria>
- Google sign-in through the existing product link is directly consumable by
  future landing UI, including the @edu.gov.sg access note.
- The audience, claim, and synthetic/demo owner assignments are visible without
  masquerading as confirmation or approval.
- The accepted explorer, anonymous proof policy, and public naming constraints
  are structurally protected by focused tests.
- Measurement has a portable event and ownership contract: scroll/explorer
  engagement, CTA proxy, and product-auth true conversion are not conflated.
- No implementation crosses the marketing-only boundary.
- Focused tests, full typecheck, full lint, and production build all pass.
</success_criteria>

<output>
After completion, create
`.planning/quick/260730-jha-incorporate-confirmed-gtm-access-audienc/260730-jha-SUMMARY.md`
covering the finalized contract fields, remaining readiness decisions, test
coverage, verification commands, and confirmation that no UI/OAuth/analytics
provider/backend code was introduced.
</output>
