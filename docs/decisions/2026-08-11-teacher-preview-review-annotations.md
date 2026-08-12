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

## Phase 8: private publishing comparison

Publishing now moves an immutable CMS published pointer without changing the
released website. Reviewers with the shared edit link can open a private,
no-store comparison of the exact published version, unpublish it without
losing its draft or history, and publish it again. `/` remains on the released
static source.

The comparison receives a strict public projection containing only metadata
and teacher-facing page content. Stable IDs, hidden and archived sections,
reviewer context, comments, editor attribution, draft state, version metadata,
and history are excluded. The built-output verifier checks the comparison's
SSR and hydration data as well as its client dependency closure.

Responsive evidence:

- `/private/tmp/cms-phase8-comparison-1280.png`
- `/private/tmp/cms-phase8-comparison-320-fixed.png`

Verification completed after the independent review fixes:

- 48 regular test files and 305 tests passed; the database-only file was
  skipped in the regular suite.
- All 20 PostgreSQL integration tests passed against the local test database.
- TypeScript, ESLint, the production build, public-output leakage scans, route
  isolation, and the built capability-protected comparison check passed.
- The independent evaluator's focused re-grade passed 4 files and 20 tests.
- `CMP-1: asserted, no manifest — manifest absent for marketing-teacher-workspace`

### Independent evaluator report

PASS

No L0 or L1 blockers remain in Phase 8.

- The strict `CmsPublicPageDto` removes stable IDs, reviewer/editor data,
  hidden or archived sections, and version/history metadata.
- `/cms-compare` requires the edit-link capability, loads the exact published
  snapshot, uses private/no-store/noindex protections, and contains no review
  pins or editable regions.
- Publish and unpublish dialogs explain consequences, support idempotent
  recovery, announce failures, and preserve predictable focus through pending,
  success, and error states.
- Ready and non-ready routes have descriptive H1s and semantic main regions.
- The 1280px and 320px evidence shows clean reflow without horizontal overflow.
- `/` remains on the released static source.
- Focused re-grade: 4 files / 20 tests passed. Full suite: 48 files / 305 tests.
  Supplied PostgreSQL integration evidence: 20/20. TypeScript, ESLint, build,
  scanners, and protected-route verification pass.
- CMP-1: asserted, no manifest. Existing shared `Button` and native elements
  were reused.

The evaluator first found two blocking failure-state issues: an aborted
publish or unpublish could strand focus inside its dialog, and non-ready
comparison views lacked an H1. Both were fixed and covered by regression tests
before the PASS. Its two non-blocking copy advisories were also applied: the
interface now avoids internal release language and the comparison header names
the page and path being reviewed.

Independent-review limitation: this used a separate reviewer context and live
and code re-grade, but the same model family and shared worktree—not an external
human or independent black-box audit.

## Phase 9: Preview cutover rehearsal

The public CMS read path is now controlled by `CONTENT_SOURCE=static|cms`.
Leaving the setting unset uses the released static site. An invalid setting
fails closed, and a CMS read failure returns a clear 503 page instead of
quietly showing old static content.

The same strict teacher-facing projection now serves `/` and published
one-part paths in CMS mode. Missing paths return a real 404. Drafts, history,
section context, feedback, editor identity, stable IDs, hidden sections, and
archived sections stay outside public HTML and hydration data.

The Preview rehearsal used a separate PostgreSQL 17 Neon database in
Singapore. Migrations completed, the homepage import was idempotent, and the
shared edit link opened the CMS workspace through a secure capability cookie.
Publishing stayed separate from production.

Preview evidence:

- CMS candidate: `https://marketing-teacher-workspace-dszayy228-wondopamines-projects.vercel.app`
- static rollback build: `https://marketing-teacher-workspace-l520l4ax6-wondopamines-projects.vercel.app`
- public CMS page at 1280px: `/private/tmp/cms-phase9-final-public-1280.png`
- public CMS page at 320px: `/private/tmp/cms-phase9-final-public-320.png`
- authenticated workspace at 1280px: `/private/tmp/cms-phase9-workspace-1280.png`

The CMS candidate returned 200 for `/`, a real 404 for an unknown path, one
main landmark, one H1, and no horizontal overflow at 320px. Its public HTML
contained no review pins, editable regions, UUIDs, reviewer copy, comments,
or version fields. Both sign-in actions use the code-owned Teacher Workspace
product URL, and the footer uses the code-owned feedback URL. One-part and
deep 404 pages include a clear link back to the homepage. Five uncached hosted
reads succeeded; the first took about 2.7 seconds and the next four took about
0.7 seconds each.

The rollback rehearsal changed Preview to `static`, deployed the released
visual homepage, confirmed CMS-only paths returned 404, and then restored
Preview to `cms`. Production was not changed. Its public domain still serves
the released static deployment from commit `0faca1a`.

Before the rehearsal closed, the hosted publication was exported to a private
file and the hosted database was backed up with PostgreSQL 17 tools. Both
files use mode `0600`; `pg_restore --list` confirmed a valid custom archive
with the expected tables, constraints, foreign keys, indexes, and append-only
triggers. Export and backup replacement now use a private temporary file and
an atomic final step, so a forced replacement cannot remove the last good copy
or retain older, wider file permissions.

The release and rollback steps are recorded in
`docs/runbooks/cms-cutover.md`. Production promotion remains blocked on the
user's explicit final approval.

Final verification after the independent review fixes:

- 54 regular test files and 323 tests passed; the database-only file was
  skipped in the regular suite.
- All 20 PostgreSQL integration tests passed against the dedicated local test
  database.
- TypeScript, ESLint, CMS and static production builds, output leakage scans,
  route isolation, the protected-route verifier, and the public-source switch
  verifier passed.
- The final unaliased CMS Preview passed live checks at 1280px and 320px.
- Production remains on the released static deployment from commit `0faca1a`.

### Independent evaluator report

PASS

The evaluator first found three release blockers: 404 pages had no way home,
the public sign-in and feedback labels were still inert wireframe elements,
and forced backups could retain wide permissions or remove the last good file
before replacement. Each issue was fixed, covered by focused tests, and
checked again in the final hosted Preview. No L0 or L1 blocker remains.

Independent-review limitation: this used a separate reviewer context and live
and code re-grade, but the same model family and shared worktree—not an external
human or independent black-box audit.

## Scoped amendment: content editing and Admin mode

Approved by the product owner on 2026-08-12.

### Sprint contract

1. Anyone with the shared edit link can start content editing from the visible
   **Edit content** button.
2. Command-K or Control-K opens Admin mode and reveals only **Page settings**
   and **Sections**. Escape closes Admin mode without ending content editing.
3. The **Pages** control and panel are absent from the CMS workspace. The
   underlying single-page data model is unchanged.
4. The private comparison keeps **Return to editor** and removes **Open released
   homepage**.
5. **Finish editing** is the final toolbar action and includes a decorative exit
   door icon. Its existing save, discard, and keep-editing choices are unchanged.

### Plan and tradeoff

This is a scoped change to the existing workspace. It keeps direct content
editing, version history, publishing, rationale, feedback, and section editing
behaviour. Admin mode adds progressive disclosure for structural controls. It is
an interface mode, not a separate permission level. Anyone who knows the shortcut
and holds the edit link can use it.

The page-management UI is removed rather than redesigned. Its server model and
repository operations remain available, which keeps the change reversible and
avoids a database migration during the release rehearsal.

In-scope controls: A11Y-1, A11Y-2, A11Y-4, A11Y-6, A11Y-7, A11Y-8, A11Y-11,
CMP-1, CMP-5, CMP-7, CNT-2, CNT-3, SLP-9, LAY-2, LAY-5, LAY-6, and LAY-7.
There are no new async or destructive actions. CMP-1 is asserted with no
manifest; the change reuses the existing Button component and Lucide icon set.

### Verification

- Fresh unaliased Preview:
  `https://marketing-teacher-workspace-eddv77i3c-wondopamines-projects.vercel.app`
- Desktop Admin evidence: `/private/tmp/cms-admin-mode-1280-fixed.png`
- 320px Admin evidence: `/private/tmp/cms-admin-mode-320.png`
- The hosted 320px workspace measured `scrollWidth === clientWidth === 320`;
  every visible toolbar action measured 44px high.
- The full regular suite passed 54 files and 323 tests. TypeScript, ESLint, CMS
  and static builds, output leakage scans, and built-route checks passed.
- Production remains unchanged.

### Independent evaluator report

> VERDICT: pass
>
> No L0 or L1 blockers remain. All five contract items are met, and the
> Admin-mode focus issue is fixed with regression coverage.
>
> CMP-1: asserted, no manifest — manifest absent for
> marketing-teacher-workspace.

The final hosted Preview was deployed after that report. The exact advisory
path was checked again: after opening Page settings, Escape closed Admin mode,
kept content editing active, and moved focus to **Finish editing**.

## Scoped amendment: stable inline editing and Admin commands

Approved by the product owner on 2026-08-12.

### Sprint contract

1. Typing in any inline text field keeps the same field focused. A content edit
   must not replace its row or move the caret to another control.
2. Command-K or Control-K opens a short **Admin commands** popup. It does not
   change modes by itself.
3. The popup shows **Enter Admin mode** while Admin mode is off and **Exit Admin
   mode** while it is on.
4. Entering Admin mode reveals **Page settings** and **Sections**, then moves
   focus to **Sections**. Exiting returns focus to **Finish editing**.
5. Closing the popup without choosing a command returns focus to the control the
   reviewer was using. Their unsaved text remains in place.

### Plan and tradeoff

The typing defect came from React keys derived from editable copy. Changing a
heading or label changed its parent row's key, so React removed the focused row
and created another one. Repeated story, reveal, and capability rows now use
stable position keys. This preserves the current document model and avoids a
larger identity migration.

The Admin popup is a single-decision Base UI dialog composed with the existing
Button component. It keeps the structural tools hidden until requested without
turning page settings into a multi-step modal. Command-K toggles the popup;
choosing the visible command changes the mode. Escape only closes the popup.

In-scope controls: A11Y-1, A11Y-2, A11Y-4, A11Y-7, A11Y-8, A11Y-11, CMP-1,
CMP-5, CMP-7, CNT-2, CNT-3, SLP-9, SLP-10, LAY-2, LAY-5, LAY-6, and LAY-7.
CMP-1: asserted, no manifest — manifest absent for
marketing-teacher-workspace. Evidence source: direct review of the product
codebase and the installed Base UI package.

### Verification

- Fresh unaliased Preview:
  `https://marketing-teacher-workspace-czxeydpp6-wondopamines-projects.vercel.app`
- Desktop command-menu evidence: `/private/tmp/cms-admin-commands-1280.png`
- 320px command-menu evidence: `/private/tmp/cms-admin-commands-320.png`
- A live two-keystroke edit kept the same story-heading DOM node focused after
  both inputs. Command-K moved focus to **Enter Admin mode**; Escape closed only
  the popup and returned focus to the same editable field with its draft intact.
- Choosing **Enter Admin mode** revealed **Page settings** and **Sections** and
  focused **Sections**. Choosing **Exit Admin mode** hid those tools, kept the
  editable fields active, and focused **Finish editing**.
- At 320px, the hosted page measured `scrollWidth === clientWidth === 320`. The
  close target measured 44px high and the command target measured 56px high.
- The regular suite passed 54 files and 324 tests. TypeScript, scoped ESLint,
  the production build, output leakage scans, and built-route checks passed.
- Production remains unchanged.

### Independent evaluator report

> VERDICT: pass
>
> BLOCKING: None. No L0 or L1 failures found.
>
> ADVISORY: None material for this scoped amendment.
>
> The inspected code, captures, regression tests, and supplied live evidence
> cover stable inline focus, mode-neutral Admin command opening, correct command
> labels, Enter/Exit focus paths, exact-opener restoration, draft preservation,
> semantic dialog behavior, visible focus, 44/56px targets, and 320px reflow
> without overflow.
>
> Dark mode: N/A — product has no dark mode.
>
> CMP-1: asserted, no manifest — manifest absent for
> marketing-teacher-workspace. Evidence source: direct product-codebase read and
> installed Base UI package; the implementation reuses Base UI Dialog, the
> existing Button component, and Lucide icons.

## Scoped amendment: focused editing and section order

Approved by the product owner on 2026-08-12.

### Sprint contract

1. Editor mode does not show **Version history**, **View published**, or
   **Unpublish**. It keeps editing, undo, save, publish, and finish actions.
2. Admin mode does not show **Page settings**. Its only structural tool is
   **Section order**.
3. Section order opens beside the page on wide screens, so the reviewer can see
   the content move. At 320px it stacks before the page without horizontal
   scrolling.
4. The panel provides only **Move up** and **Move down**. It does not provide a
   section type, Add section, Duplicate, Hide, Archive, Restore, or Edit context.
5. The opening and footer stay fixed. Reordering remains part of the draft and
   can be undone before or after the panel closes.

### Plan and tradeoff

Editor mode becomes the short content-writing path. Version history and the
private published comparison remain available after editing ends. The underlying
version, publication, page-setting, and section-lifecycle models stay intact, but
their extra controls are not exposed in this release.

Entering Admin mode opens the Section order panel. A toolbar button can hide or
show it without leaving Admin mode. The panel uses a semantic ordered list and
the existing Button component. Reordering changes the page immediately, preserves
button focus, and uses the existing draft Undo and Save actions.

The tradeoff is less structural flexibility. Reviewers cannot create, copy, hide,
archive, or restore sections from this interface. This is acceptable for the
release because the current task is ordering the approved sections, not building
new page layouts.

No new async or destructive action is added. Reordering is local, reversible, and
saved through the existing draft transaction. Panel transitions use focus movement;
save and publish keep their existing live status messages.

In-scope controls: A11Y-1, A11Y-2, A11Y-4, A11Y-7, A11Y-8, A11Y-11, CMP-1,
CMP-5, CMP-7, CNT-2, CNT-3, SLP-9, LAY-2, LAY-5, LAY-6, and LAY-7. No waiver is
requested. CMP-1: asserted, no manifest — manifest absent for
marketing-teacher-workspace. Evidence source: direct product-codebase review;
the plan reuses the existing Button and page-side-panel patterns.

### Component inventory

- `/cms-preview`: `CmsWorkspace`, `PublicReviewMode`, `ContentReviewPage`,
  `SectionOrderPanel`, `CmsAdminCommandMenu`, `FinishEditingDialog`, and the
  existing review-context and version-history panels outside Editor mode.
- Editor controls: Show section context, Undo, Redo, Publish/Published, Save
  draft, and Finish editing.
- Admin controls: Section order, Undo, Redo, Publish/Published, Save draft, and
  Finish editing.
- Section panel controls: Close section order, Move up, and Move down. Verify
  visible focus, accessible names, truthful disabled states, and focus after a
  move or panel close.

### Plan summary

| Dimension | Plan |
|---|---|
| Structure | Page plus a 22rem Section order side panel on wide screens; one column at 320px |
| Components | Existing Button, ordered list, aside, and CMS draft model |
| Interaction and motion | Open/close without decorative motion; move one section per action |
| Async and A11Y-11 | No new async state; panel change uses focus, existing save/publish use live status |
| Controls | A11Y-1/2/4/7/8/11, CMP-1/5/7, CNT-2/3, SLP-9, LAY-2/5/6/7 |
| Waivers | None |
| Tradeoff | Only ordering is exposed; advanced section and page controls remain hidden |
| Evidence | 320, 768, and 1280 frames; keyboard reorder, Undo, close, and Admin exit |

### Verification

- Exact unaliased Preview:
  `https://marketing-teacher-workspace-4w889tg8c-wondopamines-projects.vercel.app`
- Desktop evidence: `/private/tmp/cms-section-order-1280-signoff.png`
- 768px evidence: `/private/tmp/cms-section-order-768.png`
- 320px evidence: `/private/tmp/cms-section-order-320.png`
- The hosted Editor showed no Version history, View published, Unpublish, Page
  settings, Add section, or Duplicate action. Command-K opened Admin commands;
  Enter Admin mode opened Section order beside the page at 1280px.
- Moving Reveal down changed the rendered section sequence and retained focus on
  its move control. Undo restored the original sequence, disabled Save draft,
  and announced **Last change undone.** No draft was saved during verification.
- While scrolled, the sticky panel began below the 147px editor toolbar and its
  44px Close section order control remained reachable. Closing the panel focused
  Section order. Exiting Admin mode kept 49 editable fields active and focused
  Finish editing.
- At 1280px and 320px, `scrollWidth === clientWidth`. Every visible toolbar,
  close, and reorder target at 320px measured at least 44px high. The 768px and
  320px layouts stack the panel before the content to preserve usable widths.
- The regular suite passed 54 files and 324 tests, with the database integration
  file skipped when no test database is configured. TypeScript, scoped ESLint,
  production build, token audit, static accessibility, contrast, typography,
  and output-boundary checks passed.
- Production remains unchanged.

### Independent evaluator report

> VERDICT: PASS
>
> BLOCKING: None. L0: 0; L1: 0.
>
> ADVISORY: None. L2: 0.
>
> Contract compliance:
>
> 1. PASS — Editor mode omits Version history, View published, and Unpublish
>    while retaining 49 inline editables, Undo/Redo, publication status/action,
>    Save draft, and Finish editing.
> 2. PASS — Admin mode exposes Section order only; Page settings and advanced
>    section controls are absent.
> 3. PASS — live 1280 measurement is exactly 352px/22rem beside 928px of visible
>    content. The 768px and 320px captures show the panel stacked before content
>    without horizontal overflow.
> 4. PASS — only labelled Move up/down buttons are exposed. No section type,
>    Add, Duplicate, Hide, Archive, Restore, or Edit context control appears.
> 5. PASS — opening/footer controls are disabled; live reorder changed DOM order
>    and retained focus; Undo restored the original order and announced “Last
>    change undone.” The focused tests cover retained archived sections being
>    skipped in one visible move.
> 6. PASS — Cmd/Ctrl+K uses the Admin commands dialog to enter/exit Admin without
>    ending editing. Entry focuses Section order; panel close returns there; exit
>    preserves all 49 editables and focuses Finish editing.
>
> Plan fidelity: PASS. The implementation matches the approved scoped
> amendment: simplified Editor chrome, a reversible local ordering surface,
> retained underlying lifecycle/version models, no added async or destructive
> flow, and no production switch.
>
> Quality grades:
>
> - Accessibility and semantics: A
> - Keyboard/focus behavior: A
> - Responsive composition: A
> - Visual hierarchy and density: A
> - Content and naming: A
> - Component consistency: A
>
> Judgment-control notes:
>
> - A11Y-7/8/11 pass: labelled `<aside>`, heading, semantic `<ol>`, native
>   button groups, accurate `aria-expanded`, polite status updates, and
>   deliberate focus movement.
> - CMP-5/7 pass: one filled action per toolbar region; secondary actions use
>   existing outline/ghost Button variants consistently.
> - CNT-2/3 and SLP-9 pass: “Section order,” “Move up/down,” and dialog copy are
>   plain, short, active, and free of generated-writing tells.
> - LAY-2/4/5/6/7 pass: usable narrow reading order, bounded text measure,
>   task-appropriate density, aligned edges, and content remains the primary
>   wide-screen region while the ordering task leads when stacked.
> - A11Y-1/2/4 pass on supplied scanner/live evidence, including visible focus
>   and mobile targets of at least 44px.
>
> CMP-1: asserted, no manifest — manifest absent for
> marketing-teacher-workspace
>
> Evidence source: direct product-codebase review; existing Button, Base UI
> Dialog, and page-side-panel patterns are reused.
>
> Uncovered:
>
> - Database integration remained skipped because no database configuration was
>   available.
> - The archived-section case is covered by source and automated test rather than
>   the deployed document's live state.
> - No separate 360px capture was supplied; 320px passed and uses the same
>   responsive tier, with 768px also inspected.
> - Dark mode: N/A; the product does not support it.
>
> Evidence reviewed: current diff and decision record, component/control
> inventory, four supplied captures, focused test assertions, supplied
> 54-file/324-test/typecheck/ESLint/build results, and an independent live
> capability-link spot-check of mode controls, exact 22rem layout, DOM reorder,
> focus, Undo announcement, panel dismissal, and Admin exit.
>
> Independent-review limitation: the live journey and source were checked
> independently, but the full suite/build and production-unchanged claims were
> accepted from the supplied evidence rather than rerun; database integration
> and dark mode were not available.
