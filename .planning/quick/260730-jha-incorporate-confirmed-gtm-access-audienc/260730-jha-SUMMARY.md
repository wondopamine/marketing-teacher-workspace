---
phase: 260730-jha
plan: 01
subsystem: content-governance
tags:
  - typescript
  - content-contract
  - launch-readiness
  - measurement

requires: []
provides:
  - Typed Google access, audience, explorer, proof, approval, and measurement contracts
  - Readiness gates that separate assigned owners from recorded approvals
  - Provider-neutral integration and public-data documentation
affects:
  - landing-page-v2-ui
  - launch-governance
  - analytics-integration

tech-stack:
  added: []
  patterns:
    - Readonly literal content contracts validated with satisfies
    - Owner, state, and recorded approver stored as separate governance fields
    - Marketing proxy and product-auth conversion events modelled separately

key-files:
  created: []
  modified:
    - src/content/landing-v2.ts
    - src/content/landing-v2-readiness.ts
    - src/content/landing-v2.test.ts
    - docs/landing-page-v2-foundations.md

key-decisions:
  - "Google sign-in uses the existing product URL and requires an @edu.gov.sg account."
  - "Owner assignment never clears audience, product-claim, or synthetic-demo approval."
  - "Internal capability IDs remain stable while public labels use plain job-led language."
  - "CTA selection is an interim proxy; product-auth access completion is the true conversion."

patterns-established:
  - "Public naming: keep internal capability IDs stable and expose publicLabel for surface copy."
  - "Approval governance: store owner, status, and recorded approver independently."
  - "Measurement ownership: marketing owns engagement and CTA proxy events; product/auth owns completed access."

requirements-completed:
  - QUICK-260730-jha

coverage:
  - id: D1
    description: "Confirmed GTM choices are encoded as readonly typed contracts."
    requirement: QUICK-260730-jha
    verification:
      - kind: unit
        ref: "src/content/landing-v2.test.ts#records the confirmed Google access contract on the existing product link"
        status: pass
      - kind: unit
        ref: "src/content/landing-v2.test.ts#accepts the exact backend-free synthetic explorer flow"
        status: pass
    human_judgment: false
  - id: D2
    description: "Readiness requires recorded confirmation and approval, not owner metadata alone."
    requirement: QUICK-260730-jha
    verification:
      - kind: unit
        ref: "src/content/landing-v2.test.ts#does not mistake the PM owner for GA audience confirmation"
        status: pass
      - kind: unit
        ref: "src/content/landing-v2.test.ts#does not mistake the product-claim owner for recorded approval"
        status: pass
      - kind: unit
        ref: "src/content/landing-v2.test.ts#requires recorded approval from both synthetic-demo owners"
        status: pass
    human_judgment: false
  - id: D3
    description: "Measurement distinguishes engagement, CTA proxy, and product-auth true conversion."
    requirement: QUICK-260730-jha
    verification:
      - kind: unit
        ref: "src/content/landing-v2.test.ts#defines provider-neutral engagement, proxy, and true-conversion semantics"
        status: pass
    human_judgment: false
  - id: D4
    description: "Foundation documentation matches the typed publication and integration contract."
    requirement: QUICK-260730-jha
    verification:
      - kind: other
        ref: "rg Google sign-in|scroll-milestone|cross-domain docs/landing-page-v2-foundations.md"
        status: pass
    human_judgment: true
    rationale: "Prose clarity and exact policy alignment require a human reading in addition to deterministic term checks."
  - id: D5
    description: "The marketing change adds no live auth, provider runtime, endpoint, persistence, or backend."
    requirement: QUICK-260730-jha
    verification:
      - kind: integration
        ref: "pnpm typecheck && pnpm lint && pnpm build"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-07-30
status: complete
---

# Quick Task 260730-jha: Confirmed GTM foundation Summary

**Google access, audience governance, accepted synthetic explorer, anonymous proof, and provider-neutral measurement now share one typed launch-readiness contract.**

## Performance

- **Duration:** 25 minutes
- **Started:** 2026-07-30T06:18:11Z
- **Completed:** 2026-07-30T06:43:39Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Encoded D-01 through D-09 in readonly content, publication, readiness, and measurement contracts.
- Kept pending audience, claims, synthetic-demo, testimonial, metadata, copy, and support decisions visible.
- Documented exact event ownership, cross-domain attribution, payload limits, and the marketing repository boundary.

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Add failing GTM contract coverage** - `6a37689` (test)
2. **Task 1 GREEN: Encode confirmed GTM decisions** - `29fc2bf` (feat)
3. **Task 2: Document publication and measurement contract** - `c4c6829` (docs)

Plan metadata remains uncommitted for the quick-task orchestrator.

## Files Created/Modified

- `src/content/landing-v2.ts` - Typed access, governance, explorer, proof, naming, and measurement contracts.
- `src/content/landing-v2-readiness.ts` - Exact structure and launch-decision gates.
- `src/content/landing-v2.test.ts` - Forty-seven focused regression and literal-type tests.
- `docs/landing-page-v2-foundations.md` - Publication state, event contract, data restrictions, and ownership boundary.

## Decisions Made

- Reused `siteConfig.links.product`; no second product URL was introduced.
- Kept capability IDs and anchors stable while replacing surface names with plain public labels.
- Required recorded approval from both Designer and Xingyu for synthetic/demo publication.
- Treated `primary-cta-selected` as a proxy and `product-access-completed` as true conversion.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Mirrored event payload restrictions in the typed measurement contract**

- **Found during:** Task 1
- **Issue:** The threat model required an allowlist, while the typed measurement action specified only event semantics.
- **Fix:** Added typed allowlisted and prohibited payload fields, then documented the same restrictions.
- **Files modified:** `src/content/landing-v2.ts`, `src/content/landing-v2.test.ts`, `docs/landing-page-v2-foundations.md`
- **Verification:** Focused measurement test, full typecheck, lint, and build passed.
- **Committed in:** `29fc2bf` and `c4c6829`

**Total deviations:** 1 auto-fixed (1 missing critical).
**Impact on plan:** The addition enforces the planned information-disclosure mitigation without adding runtime code.

## Issues Encountered

None. Verification emitted existing Node engine and bundler warnings, but every required command exited successfully.

## Known Stubs

None. Remaining null publication fields are deliberate readiness sentinels and are not surfaceable copy.

## User Setup Required

None. No external service, environment variable, or provider configuration was added.

## Verification

- `pnpm test src/content/landing-v2.test.ts` - passed, 47 tests.
- `pnpm typecheck` - passed.
- `pnpm lint` - passed.
- `pnpm build` - passed.
- Diff scope - limited to the four declared implementation files.

## Next Phase Readiness

Future UI can consume the confirmed contract. Publication remains blocked by the recorded decisions listed in the foundation document.

## Self-Check: PASSED

- All four declared implementation files and this summary exist.
- Commits `6a37689`, `29fc2bf`, and `c4c6829` exist.
- The committed diff from the dispatch base contains only the four declared files.

---

*Quick task: 260730-jha*
*Completed: 2026-07-30*
