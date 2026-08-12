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

## CMS rationale and feedback follow-up

Implemented and independently verified on 2026-08-12:

- The CMS now builds review pins from stable section and screen IDs. Hidden and archived targets keep their IDs but leave the visible pin sequence.
- Design intent is versioned with the page. Reviewer comments remain separate durable records and distinguish Page content from Design intent.
- Comments support Open, Resolved, and Withdrawn states. A withdrawn or resolved comment can be reopened.
- The selected rationale panel explains section purpose, position, safety choices, review checks, and unresolved decisions. It does not show a rationale directory.
- Direct content editing and section-context review remain separate tasks. The reviewer can edit Design intent, What to check, and Decision needed from Section Manager, with Undo before saving.
- Loading, saving, resolving, withdrawing, reopening, and retry states are visible and announced. A failed add keeps both the note and focus on the acting control.
- The design-intent and review-check prose measure is capped at 66 characters. Dark mode is not applicable because this product has no visible dark-mode control or supported rendered dark layer.

Responsive evidence:

- `/private/tmp/cms-phase6-full-1280.png`
- `/private/tmp/cms-phase6-context-1280.png`
- `/private/tmp/cms-phase6-full-360-fresh.png`
- `/private/tmp/cms-phase6-context-360.png`
- `/private/tmp/cms-phase6-context-768-fixed.png`
- `/private/tmp/cms-phase6-error-768-fixed-alert.png`
- `/private/tmp/cms-phase6-loading-768.png`
- `/private/tmp/cms-phase6-public-home-1280.png`

Verification completed after the final accessibility fix:

- 44 test files and 274 tests passed; the database-only file was skipped in the regular suite.
- All 13 PostgreSQL integration tests passed against the local test database.
- TypeScript, ESLint, the production build, public-output leakage scan, and built-route isolation passed.
- The token audit and static accessibility check passed.
- The content scanner reported only internal response-code comparison strings such as `STALE_DRAFT` and `UNAVAILABLE`; these are not visible copy.
- The type scanner's only line-height warning referred to the numeric review-pin pseudo-element, not body copy.
- `CMP-1: asserted, no manifest — manifest absent for marketing-teacher-workspace`

### Verbatim independent evaluator report

PASS

VERDICT: pass

#### Contract compliance

- **Teacher/reviewer separation — met.** Reviewer rationale, checks, decisions, feedback fields, and comments remain outside the teacher-facing subtree. The only approved review chrome inside the preview is the numbered pin control. The panel states: “Reviewer-only. Teachers will not see this panel or its feedback.”
- **Rationale quality and story order — met.** Each section explains why it exists and why it appears in that position. The Connected story rationale explains the immersive single-student thread, the synthetic bursary example, the exclusion of sensitive groups including SWaN students, and why the story comes before the capability list.
- **Stable pin mapping — met.** `buildCmsReviewPresentation()` derives pins from stable section and screen IDs in current visual order. Hidden and archived targets are omitted without replacing their IDs. The rendered sequence is contiguous from 1 to 13.
- **Durable feedback semantics — met.** Feedback records Page content or Design intent, author, version, status, and stable target. Browser evidence proved persistence after reload and subject-specific change notices. PostgreSQL integration tests cover reorder, archive, restore, idempotent creation, and status changes.
- **Full-width and side-panel behavior — met.** The preview uses the full width by default. The 1280px context frame shows the approved 22rem rail; the 768px and 360px frames stack the panel without covering the preview. A direct 320px check measured `scrollWidth === clientWidth === 320` with the panel both closed and open.
- **Editing separation — met.** Show/Hide section context and Edit content remain distinct actions. Editing closes reviewer context, preserves the full-width preview, and exposes separately editable Design intent, What to check, and Decision needed fields with Undo support.
- **Async and recovery behavior — met.** Loading feedback and add/resolve/withdraw/reopen operations expose named `role="status"` states. Failed Add retains the note, keeps focus on Add feedback, announces one alert, and offers Try adding again. The refreshed error evidence is `/private/tmp/cms-phase6-error-768-fixed-alert.png`.
- **Public boundary — met.** `/` still renders the released visual homepage. Production build, route isolation, and leakage scans passed; public projection excludes review documents, comments, IDs, drafts, and operational metadata.

#### Plan fidelity

The implementation matches the approved direction: selected-only context instead of a rationale directory, separate review and edit controls, stable annotation targets, versioned design intent, durable comments, actual product screenshots with breadcrumbs, and no early change to public `/`.

No unapproved structural drift was found.

#### BLOCKING

None.

#### ADVISORY

None.

#### Quality grades

- **Design quality — strong.** The teacher preview remains the primary focal region, while review context appears only when requested.
- **Originality — acceptable and appropriate.** The workspace uses familiar controls and restrained annotation patterns without decorative novelty or generic AI-dashboard treatment.
- **Craft — strong.** Alignment, spacing, responsive reflow, 66ch prose measures, focus continuity, loading states, recovery, and edge cases are deliberately handled.
- **Functionality — strong.** Review, comment, retry, resolve, edit context, undo, save, reload, archive, restore, and history semantics connect without dead ends.
- **Dark mode — N/A.** The product has no visible dark-mode control or supported rendered dark layer.

#### Judgment control notes

- **A11Y-1 — pass.** Foreground, muted, primary, and destructive states use the established accessible token palette; token checks and visual evidence found no contrast failure.
- **A11Y-2 — pass.** Interactive elements are native keyboard controls with visible focus. Toolbar controls and pins meet the 44px mobile target.
- **A11Y-3 — pass.** Name, feedback, subject, and context fields have visible programmatic labels; no placeholder acts as the only label.
- **A11Y-7 — pass.** The panel uses labelled regions, logical H2/H3 structure, lists, fieldset/legend semantics, and descriptive screenshot links.
- **A11Y-8 — pass.** Pins and disclosures expose `aria-expanded`; busy controls use truthful `aria-disabled` state with guarded activation; the empty Add feedback state uses native `disabled`.
- **A11Y-11 — pass.** Pending states use live status regions. Success is announced through the toolbar. Failed Add uses one alert channel while focus remains on the retry-capable acting control.
- **CMP-1 — pass.** Existing Button, Input, native textarea, fieldset, aside, and dialog elements cover the needs. **CMP-1: asserted, no manifest — manifest absent for marketing-teacher-workspace.** Evidence source: direct product-codebase review.
- **CMP-2 — pass.** Feedback is never hard-deleted. Withdraw is reversible through Reopen; section archive has a visible Undo path; discard and publication consequences are explicit.
- **CMP-3 — pass.** Comment loading, creation, and status updates each have visible loading, success, and error behavior. Focused regression tests cover these states.
- **CNT-1 — pass.** “We could not add this feedback. Your note is still here. Try again.” states the failure, confirms retained work, and gives the next action.
- **CNT-2 — pass.** Section context, Design intent, What to check, Decision needed, and feedback status labels use plain functional language.
- **CNT-3 — pass.** Instructions are active, direct, and short; rationale sentences stay within the required length.
- **CNT-4 — pass.** Product captures are labelled illustrative, the student is explicitly synthetic, and checks call out potentially sensitive or misleading details.
- **CNT-5 — pass.** Instructions use device-independent verbs such as use, choose, open, and review.
- **CNT-6 — pass.** No removable empty openers or filler weaken the reviewed copy.
- **CNT-7 — pass.** Each rationale starts with the section’s purpose before explaining the layout or mechanism.
- **SLP-9 — pass.** The copy contains no buzzwords, em-dash chains, forced triads, significance inflation, chatbot phrasing, or redundant rationale scaffolding.
- **IDN-3 — pass.** The writing stays neutral, steady, plain, and quietly confident—the Teacher Workspace register.
- **LAY-2 — pass, verified manually.** No horizontal overflow occurred at 320px; reading order and controls remain usable at 360, 768, and 1280px.
- **LAY-3 — pass.** The surface follows a review-workspace template: persistent tools, primary preview, and optional contextual rail.
- **LAY-4 — pass.** Design intent, checks, and pending-decision prose now cap at 66ch.
- **LAY-5 — pass.** Density fits a review task: compact controls, readable rationale, and sufficient separation between feedback records.
- **LAY-6 — pass.** Shared edges, field labels, toolbar controls, panel sections, and preview boundaries align consistently.
- **LAY-7 — pass.** The teacher preview leads by default; when context is requested, the panel gains appropriate task priority without competing with or obscuring the preview.

#### UNCOVERED

None.

#### Verification evidence

- Current focused regression suite: 3 files and 9 tests passed.
- Full suite reported: 44 files and 273 tests passed.
- PostgreSQL integration: 13 of 13 passed.
- TypeScript, ESLint, production build, postbuild leakage checks, route isolation, token audit, and static accessibility checks passed.
- Responsive evidence reviewed at 360, 768, and 1280px, plus an independent live 320px reflow measurement.

Independent-review limitation: this evaluation was performed by a separate evaluator subagent, but it shares the same model family and repository context as the implementation agent. It provides process independence, not independent-model diversity.

## Phase 7: bounded page and section management

The CMS now supports a controlled set of page and section changes without becoming a general website builder. Reviewers can create a page from the approved template, duplicate it, change its title and path, archive it, and restore it. They can add, duplicate, reorder, hide, archive, and restore the five repeatable section types. The opening and footer remain fixed, and each repeatable type has a server-enforced limit.

Every duplicated page and section receives new stable content and review IDs. Design intent is copied; existing feedback is not. Archived sections keep their content, context, and feedback. Archived pages keep their immutable version history and cannot be edited or published until restored. Published pages must be unpublished before they can be archived.

The released `/` homepage remains on its static source. New pages and CMS publications are private during shadow mode.

Responsive evidence:

- `/private/tmp/cms-phase7-pages-1280.png`
- `/private/tmp/cms-phase7-pages-360-fixed.png`
- `/private/tmp/cms-phase7-pages-320.png`
- `/private/tmp/cms-phase7-public-root.png`

Verification completed after the independent review fixes:

- 45 test files and 289 tests passed; the database-only file was skipped in the regular suite.
- All 18 PostgreSQL integration tests passed against the local test database.
- TypeScript, ESLint, the production build, public-output leakage scan, and built-route isolation passed.
- The token audit and static accessibility check passed.
- The content scanner reported only internal response-code comparison strings such as `STALE_DRAFT` and `UNAVAILABLE`; these are not visible copy.
- `CMP-1: asserted, no manifest — manifest absent for marketing-teacher-workspace`

### Verbatim independent evaluator report

PASS

VERDICT: pass. No L0 or L1 blockers remain in the Phase 7 bounded page/section CMS UI.

Evidence:

- Pages/full-width behavior: `CmsWorkspace` keeps the teacher preview full width by default and makes Pages, Version history, Sections, and reviewer context separate disclosures. The Pages rail is coherent at 1280 (`/private/tmp/cms-phase7-pages-1280.png`) and moves directly below the toolbar at 360/320 (`cms-phase7-pages-360-fixed.png`, `cms-phase7-pages-320.png`). Live 320px measurement was `scrollWidth === clientWidth === 320`; panel top matched the toolbar bottom.
- Pages flow: `cms-pages-panel.tsx` uses a labelled list and action groups, clear lifecycle badges, plain consequence copy, and reversible Archive/Restore. New/Duplicate expose `aria-controls`/`aria-expanded`, focus Page title, and Cancel returns to the exact opener. Async lifecycle controls retain focus across Archive↔Restore and expose accurate pending labels/states.
- Section manager: `cms-workspace.tsx` and `cms-editor-model.ts` provide bounded add, duplicate, reorder, hide, archive, restore, context editing, and Undo. Fixed sections and limits are enforced; cloned sections receive new stable content/review IDs, while archived content/context/feedback is retained. Teacher copy remains distinct from reviewer-only context.
- History/restore: `cms-version-history-panel.tsx` explains that restore creates a new draft, preserves immutable history, and manages focus for panel open/close, Preview, Return, Restore, and errors. Retry now repeats the exact failed initial-load, load-more cursor, or version-preview action. Pending, success, and recovery states are visible and accessible without duplicate announcements.
- Accessibility/action clarity: native labelled controls, semantic headings/lists/groups, 44px targets, visible focus, disclosure state, and context-change focus all pass the scoped A11Y controls. Destructive actions satisfy CMP-2 through explicit consequence copy plus persistent Undo/Restore; published pages cannot be archived accidentally.
- Copy/craft: the interface uses short, direct language such as “Page address”, “Current page”, and “restore it as a new draft”. No material AI-writing tells were found. Layout hierarchy, density, and 66ch prose measures remain coherent.
- Public boundary: `/private/tmp/cms-phase7-public-root.png` confirms the released `/` experience is unchanged; CMS/reviewer controls remain outside the public homepage boundary.
- Verification: focused Phase 7 suite 22/22 passed; full suite 45 files/288 tests passed (1 integration file skipped without DB); TypeScript and ESLint passed. CMP-1: asserted, no manifest — `.tfx/component-manifest.json` is absent; existing Button/Input/native elements were reused.

L2 advisories (non-blocking):

1. Give repeated history actions version-specific accessible names such as “Preview version 3” for faster screen-reader button navigation.
2. Preserve focus on the replacement Restore/Archive control after the synchronous section-level Archive/Restore toggle; current async page lifecycle focus is already correct.
3. Replace the editor notice “new feedback targets” with plainer wording such as “New feedback will stay with the copy.”

Independent-review limitation: this was a separate evaluator pass, but it used the same model family and shared worktree.

All three non-blocking advisories were applied after this report. The final focused workspace suite passed 8 tests, bringing the full suite to 289 tests.
