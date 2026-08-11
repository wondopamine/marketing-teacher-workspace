# Design decision record: separate the teacher preview from review annotations

- **Status:** implemented and independently verified on 2026-08-11
- **Page type:** standalone landing-page review workspace
- **Primary task:** let reviewers judge the teacher-facing story in context, inspect rationale on demand, and comment without placing review notes inside the proposed website
- **Approved direction:** teacher-only preview with in-context review pins and an optional, hideable rationale rail

## Follow-up interaction refinement

Approved on 2026-08-11 after reviewing the first implementation:

- Replace the Preview/Review switch with two independent controls: **Show rationale** and **Edit content**.
- Remove the rationale directory. A numbered pin opens the rail directly on its rationale and comment form.
- Closing the rationale rail returns its width to the teacher preview.
- Direct editing runs on the full-width preview. The rationale rail closes and annotation pins pause until editing finishes.
- Preserve drafted notes and recorded edits when the reviewer hides the rail or switches tasks.
- Keep one slim review toolbar visible so both tasks remain reachable.
- On narrow screens, place the optional rationale panel below the toolbar rather than inside the teacher preview.

The slim toolbar costs one row of vertical space. This is acceptable because it keeps both review tasks visible without permanently narrowing the proposed website.

## Problem

The review route displayed screen specifications, PM questions, and section rationale as if they were part of the landing page. A browser-like frame around prose made the specification look like a missing screenshot. The fixed feedback panel also covered the preview, particularly at narrow widths.

## Decision

The proposed website becomes a distinct teacher-facing preview. Reviewer labels, rationale, pending decisions, and interface questions move into an annotation layer. Actual captures from the local Teacher Workspace prototype replace the prose-only interface frames. Each capture carries a breadcrumb that distinguishes a whole page from a region within that page.

Review pins are native buttons with an accessible name and expanded state. Selecting a pin opens its rationale in the desktop rail or in a stacked panel below the review toolbar on small screens. A reviewer can aim the existing comment composer at the annotation. The indicator may pulse briefly when review tools load, but it never blinks continuously and the motion is disabled when reduced motion is requested.

The in-context pin triggers are the sole reviewer-layer exception inside `[data-teacher-preview]`. Each exception is marked `[data-review-chrome][data-review-annotation]` and contains only its number and accessible control name. Rationale, PM questions, comment fields, instructions, and toolbar copy remain outside the teacher-facing subtree.

The teacher preview uses the full viewport width by default. The review toolbar exposes section rationale and direct editing as two separate tasks. Opening rationale allocates a 22-rem desktop rail; hiding it returns that width immediately. Starting a direct edit closes the rail and pauses the rationale pins so reviewers can change teacher-facing copy on the full-width preview. Draft notes and pending edits remain in memory across those task changes.

## Screen map

| Story moment        | Product location                                                   |
| ------------------- | ------------------------------------------------------------------ |
| Opening             | Student Insights / Student profile                                 |
| Student in class    | Student Insights / Class 3A                                        |
| Eligibility signal  | Student Insights / Student profile / Family                        |
| Recommended support | Student Insights / Student profile / Recommended action / Guidance |
| Family message      | Posts / New post                                                   |
| Follow-up record    | Posts / Sent post / Read tracking                                  |

The captures are illustrative prototype data. They do not contain a real student. Where the exact bursary-matching or profile-record interface does not yet exist, the annotation says so; the teacher preview does not present that implementation question as website copy.

## Component inventory

- Existing `Button`, `Input`, and native semantic elements for review controls
- Existing public review submission, copy editing, comment list, loading, success, and error behavior
- Repeated product-screen figure composed from an image, breadcrumb, caption, and review pin
- Review annotation context shared by the preview and review rail
- No modal or custom component that duplicates an available Base UI primitive

## Standards in scope

- **A11Y-7, A11Y-8:** semantic breadcrumbs and figures; annotation triggers expose their name and expanded state
- **A11Y-11, CMP-3:** feedback submission retains one visible loading, success, and error path announced through the existing live region
- **CNT-2, CNT-4:** plain labels and explicit illustrative prototype status
- **SLP-9, SLP-10, SLP-11:** direct prose, no multi-section review modal, and no static card grid
- **LAY-2, LAY-3, LAY-4, LAY-7:** 320-pixel reflow, review-workspace template, bounded prose measure, and the teacher preview as the primary focal region
- **CMP-1:** asserted, no manifest — manifest absent for marketing-teacher-workspace; the product codebase and available local primitives were reviewed directly

## Verification plan

- Component tests prove reviewer rationale and pending questions are absent from the teacher-preview region.
- Component tests prove all six story placements render a real image and breadcrumb.
- Interaction tests cover review visibility, pin selection, annotation-targeted comments, removal, keyboard state, and feedback submission states.
- Manual captures cover 320, 360, 768, and 1280 CSS pixels with no panel obscuring the preview.
- Project tests, typecheck, content lint, public-output checks, route checks, and the production build must pass.

## Implementation verification

- The rationale directory and Preview/Review switch are absent. The toolbar exposes only **Show rationale** and **Edit content** as the two primary review controls.
- The only review chrome inside `[data-teacher-preview]` is the explicitly approved set of numbered pin triggers; reviewer prose and forms remain outside it.
- A section pin opens one selected rationale, sets its section-comment target, and reports its state through `aria-expanded`. Direct editing reports its state through `aria-pressed`.
- Direct editing commits a focused field before teardown, preserves pending edits, supports reopening a pending edit, hides annotation pins, and restores them when editing finishes.
- Draft note text, added section comments, and pending direct edits survive hiding the rationale panel and switching tasks.
- Live layout measurements found no horizontal overflow: 320, 360, and 768-pixel previews matched their viewport width; at 1280 pixels the closed preview measured 1280 pixels and the open layout measured 928 pixels plus a 352-pixel rail.
- The full test suite passed: 30 files and 214 tests. TypeScript, ESLint, production build, public-output scanning, and built-route isolation checks passed.
- The TFX `token-audit.py`, `a11y-static.py`, and `content-lint.py` checks passed on the changed UI and rationale files.
- `CMP-1: asserted, no manifest — manifest absent for marketing-teacher-workspace`

## Independent evaluator verdict

PASS

- **Teacher/reviewer separation:** The teacher preview contains only teacher-facing content plus the explicitly approved numbered pin triggers. Rationale, PM questions, toolbar copy, comment fields, and submission controls remain outside `[data-teacher-preview]`. Regression coverage enforces that the only nested `[data-review-chrome]` elements are numbered annotations.
- **Two controls:** The always-visible toolbar exposes independent **Show/Hide rationale** and **Edit/Finish content** controls. Their `aria-expanded` and `aria-pressed` states track the rendered state.
- **Full-width behavior:** With rationale closed, the teacher preview uses the full viewport. At 1280px, opening rationale creates the approved 928px preview plus 352px rail. At narrower widths, the panel stacks below the toolbar without overlay or horizontal overflow.
- **Pins and selected rationale:** The rationale directory is absent. Each accessible numbered pin opens only its matching rationale, establishes the correct section-comment target, and returns focus to the actual opener when dismissed with Escape.
- **Direct editing and persistence:** Edit mode closes the rationale panel, hides pins, and limits editable spans to `content/landing/**`. Focused edits commit before teardown. Stable DOM mapping supports reopening colliding edited values. Draft notes, explicit whole-page or copy targets, section comments, and pending edits survive panel and mode changes.
- **Accessibility and responsiveness:** Native semantics, visible focus states, 44px targets, labelled form fields, live async status, semantic regions, and correct ARIA state are present. Reduced-motion mode disables pin animation and changes comment-target scrolling from smooth to automatic. The 320px layout reflows without loss.
- **Component/control review:** Existing `Button` and `Input` primitives now cover the available stack needs; native `textarea` is appropriate because the repository has no textarea primitive. `CMP-1: asserted, no manifest — manifest absent for marketing-teacher-workspace`
- **Verification:** The current suite passes **30 files and 214 tests**. TypeScript passes cleanly. The supplied lint, production build and postbuild scans, route-isolation checks, token audit, accessibility static check, and content lint all pass. The Node 25 versus requested Node 24 engine warning did not affect results.

**Remaining blockers or actionable flags: none.**
