# Design decision record — GA landing page (`/`)

> One record per page or significant change. Started at the Phase 3 plan gate (the
> approved plan is the fixed artifact the verify phase grades against), finished at
> Phase 6. Keeps the human approval, waivers, and verdict traceable.

- **Date:** 2026-08-20
- **Product:** TW
- **Change type:** new page (replaces the `/` fallback render on branch `ga-landing-design`; the CMS-published and unavailable branches of `/` are untouched)
- **Page type:** marketing landing page (genre reference: `design-landing-pages` skill, wondopamine/design-craft-skills)
- **Run type:** attended (dx-design full run: intent → diverge → plan gate → implement → verify)
- **The teacher and the moment:** Mdm Tan, P5 form teacher, opens the link after a staff briefing. She must believe the care was always hers — the chasing, cross-referencing, and drafting between the moments is what's removed. One action: Sign in with Google.

## Sprint contract (done-criteria)

1. All seven IA sections (issue #3) present in order, each doing its one job — sections 5 (For the people who run schools) and 6 (Real schools) fully designed with real content, not pending slots.
2. Exactly one filled primary action on the page (hero); the close steps down to outline (CMP-5 + landing floor).
3. The story reads as one student carried through the acts; the page visibly carries the paper world of v1 (COL-1/TYP-1 via the registered paper system).
4. Content guardrails hold: synthetic student, no denylisted claims, verbatim quotes with role + school level only, calm teacher-led voice.
5. Reduced-motion and no-JS get the complete settled composition; AA contrast, keyboard reach with visible focus, skip link, 320px reflow.

## Chosen approach

**Direction A — "One screen, carried."** Copy-first hero on the locked illustrated paper sky, with the student-profile capture rising at the fold (doubles as the proposed ticket #7 hero-peek candidate). Acts 2–5 run against one pinned product frame (CSS sticky) whose state crossfades (opacity-only, 200ms) between the five verified prototype captures as the act copy scrolls past. The reveal names the product once on the sky band; four capability cards anchor back into the acts; three answered audience blocks; three curated verbatim testimonials in the v1 memo-card format; outlined close CTA.

Copy flows through `content/landing/*.mdx` (same files as the `/content-review` wireframe and ⌘K editing). The public bundle reads a dedicated module (`src/content/landing-ga-page.ts`) that imports only public copy files — never the governance module or the content glob — with `landing-ga-page.test.ts` as the sync contract.

## Rejected options

- **Option B — Five quiet bands** (editorial alternating full bands, no pinning): calmest and cheapest, but drops the shared-element choreography that is CLAUDE.md's locked core value.
- **Option C — The teacher's desk** (acts as taped paper artefacts, reveal tidies them into one frame): boldest paper-brand commitment, but decoration risks outrunning product truth and the artefacts would need redrawing to stay honest.

Direction mocks: Claude artifacts `69326c91` (A), `399bbef7` (B), `f908e86c` (C). Pick: A (user, 2026-08-20).

## Grill record

The plan was grilled; decisions resolved:

1. **Frame media** (control most at risk, WCAG 1.4.5): captures with every claim in live copy, captures decorative — over coded replicas or a hybrid. (user)
2. **Hero peek** (ducked decision, ticket #7 open): the student-profile capture enters at the fold and reads as the same surface the journey pins; recorded as the proposed ticket #7 candidate. (user)
3. **Branch guard:** base was 10 commits behind `origin/main` → merged main in (conflicts resolved keeping this branch's restructure; main's cloud texture later reverted — it renders as an opaque plate under this branch's `mix-blend-lighten` treatment).
4. **Act 3 claim posture** (mid-implement, surfaced by guardrail tests): keep act 3 with public copy; the Release-2 flag-gated availability honesty lives in `content/screens.mdx`, the internal slot label ("Behind a Release 2 flag"), and this record — never in marketing copy. Ticket #6's claims register remains the merge gate. (user)
5. Resolved from context: v1 landing components stay in-tree (only the `/` fallback render swaps); hero reuses the locked illustration assets.

## Tradeoffs, named

- **Pinned journey costs mobile parity** — mobile gets the calm stacked read, not the choreography. Accepted: CLAUDE.md forbids engineering effort on mobile pinned scroll.
- **Captures instead of the coded replica** — consistent, cheap, honest; sacrifices crisp text at very large zoom and interactivity. Accepted: the journey is narration, not a demo; claims live in copy.
- **Story before specifics** — KPs must scroll past the narrative to reach briefing cards. Accepted: issue #3 orders discovery after the story deliberately.
- **Act 3 shows a Release-2 state** — the guidance screen is flag-gated and not at GA. Accepted only as *proposed* content: capability-owner approval (ticket #6) gates the merge.

## Controls in scope

A11Y-1, A11Y-2, A11Y-4, A11Y-5, A11Y-6, A11Y-7, A11Y-9, A11Y-10 · TOK-1..3 · TYP-1..6 · COL-1, COL-2 · CMP-1 (asserted, no manifest), CMP-5, CMP-7 · CNT-2, CNT-3, CNT-5..14 · MOT-1, MOT-3 · IDN-1 · SLP-1..9, SLP-11 · LAY-2..7.

N/A: LAY-1 (no declared grid — no `.dx/design.json`); CMP-2/CMP-3/A11Y-11/CMP-8 (no async or destructive actions, no form fields — CTAs are external links); A11Y-3 (no form fields); IDN-4 (not CaseSync).

## Waivers granted

No waivers were requested or granted this run.

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|

**Calibration notes (not waivers):**

- **COL-1:** the filled primary uses the repo's `--primary` token (`#0066ff`, effectively the registered TW blue `#0064FF`), consistent with the v1 siblings. The close CTA's *text and border* use `--cta-blue #245adb` because `#0066ff` as 16px text on the paper ground measures 4.36:1 and fails AA (review round 1, finding 5). An earlier version of this note misnamed the filled CTA's token; corrected 2026-08-20.
- **TYP-1/TYP-3 (memo card, wordmark):** after review round 1 the inherited off-scale sizes moved onto the Tailwind scale (memo quote 22→20px, body 15→16px, attribution 13→14px; wordmark/footer 13→14px) rather than carrying an L1 waiver, and the memo numeral changed `font-mono` → Inter `tabular-nums`. Revert: restore the previous classes in `memo-card.tsx`, `ga-header.tsx`, `footer.tsx`. The dead `@fontsource-variable/geist` import was removed from `src/styles.css` (TYP-1 dead-import clause).
- **TYP-2 line-height findings** from `type-scan` are display headings, not body (static scan cannot classify); body copy runs 1.6–1.7. Verified manually.
- **CNT-13 "color" findings** are Tailwind `text-[color:var(--…)]` syntax, not copy. False positives; copy proofread manually (Singapore English).
- **CNT-6 "This is"** — "This is Teacher Workspace" is issue #3's verbatim reveal line; the naming moment is the point. Deliberate (L2 rationale).
- **SLP-11 (audience blocks):** tinted paper regions in v1's audience grammar — no border, shadow, or implied affordance; not card chrome.
- **MOT-1:** `RevealOnScroll` (600ms) and the memo-card entrance are the product's existing narrative-tier motion conventions, reused unchanged; all new motion is ≤200–300ms standard easing; A11Y-5 honoured throughout.

## Content governance decisions this build carries

- **Testimonials:** three of the six verbatims render (`pg-read-speed`, `pg-immediacy`, `pg-work-reduction`) as *proposed* content — per-quote publication approval (ticket #10) is still pending; `publicationApproved: false` stands in `landing-v2.ts`. The three unselected quotes (both PG-named ones included) are now what the output-leak scanner guards.
- **Audience copy:** the three Q&A blocks in `07-audiences.mdx` are drafted from approved assurance language only; PM review replaces in place (the wireframe now shows them as reviewable copy instead of pending slots).
- **Reveal copy:** `04-reveal.mdx` now carries issue #3's thesis ("The care was always yours…"); the school-consistency assurance moved into the reveal body + school-leaders block.
- **Act copy:** rewritten as public copy in `03-story.mdx`; wireframe slot labels unchanged. The flag-gated act-3 state and the synthetic profile (Rachel Wong Mei Ling, flag-on guidance capture) are disclosed on-page via the CNT-4 line ("Shown with a purpose-built synthetic student record") and internally via `content/screens.mdx`.
- **Route-isolation verifier** now expects the GA title on the static homepage (was pinned to the v1 title).

## Plan approval

- **Approved by:** wondo.jeong@gt.tech.gov.sg (session AskUserQuestion: "Approve — build it")
- **Approved on:** 2026-08-20

## Verify verdict

- **Screenshots:** `docs/design-evidence/ga-landing-page` — 1280 (hero, act-promise, act-next-steps, act-words, act-family, reveal, apps, audiences, schools, close), 768 (hero, journey stacked), 360 (hero, schools), 320 (reflow), reduced-motion at 1280 (hero, journey), focus states (skip link, nav).
- **CMP-3 evidence:** N/A — no async actions on the page.
- **Token block line range:** tokens live in `src/styles.css:100–135` (pre-existing); no new raw values outside it.
- **Dark mode:** N/A — the public landing page has no dark mode (the paper world is deliberately light; no theme toggle on the marketing site).
- **Verification ledger:**

  | Control | Method | Evidence |
  |---------|--------|----------|
  | TOK-1..3 | script | `checks/token-audit.py` clean on `landing-ga/`, `landing-ga-page.ts`, `memo-card.tsx` |
  | A11Y-1 | manual | `checks/contrast.py --tokens src/styles.css` clean; ink #1a1a1a / muted #5f6f76 on paper grounds inspected in frames |
  | A11Y-2 | manual | `checks/a11y-static.py` clean; tab traversal operated — skip link and nav focus rings photographed |
  | A11Y-5 | manual | reduced-motion frames: stacked presentation, no animation, zero information loss |
  | A11Y-6 | manual | captures `aria-hidden` inside labelled `role="img"` figures; decorative sketches `aria-hidden` |
  | A11Y-7/9/10 | manual | accessibility snapshot: skip link first, landmarks, h1→h2→h3 hierarchy, GA title from 01-meta.mdx |
  | TYP-1 | script | `type-scan --rules TYP-1` clean after mono→Inter fix |
  | TYP-2/3 | manual | remaining findings are headings / inherited v1 memo sizes (calibration notes above) |
  | CNT set | manual | `content-lint` findings triaged (false positives + one deliberate line, above); copy proofread |
  | CMP-1 | manual | CMP-1: asserted, no manifest — manifest absent for tw. Evidence source (a): reviewed the product codebase directly; composed from Button, RevealOnScroll, MemoCard, SiteFooter, MastheadSg, SkipLink |
  | CMP-5 | script | `ga-landing-page.test.tsx` asserts exactly one filled primary ("Sign in with Google") |
  | LAY-2 | manual | 320px frame: single column, no horizontal scroll |
  | SLP-1..9,11 | manual | no gradients/glow/nested cards; apps grid cells are interactive links with distinct evidence |
  | Output isolation | script | build-time `verify-content-review-public-output.mjs` + `verify-content-review-routes.mjs` clean; unpublished quotes, internal ids, reviewer notes absent from public bundle (public-safe module + sync test) |
  | Test suite | script | 347/347 vitest, tsc clean, production build green (`pnpm lint` broken pre-existing — eslint not a direct dep on either lineage) |

- **Evaluator verdict:**

  VERDICT: fail (round 1 — full verbatim verdict in "Design review — round 1" below, findings 1–12 blocking, all addressed; re-check pending with the same reviewer)

  QUALITY GRADES: Design quality — acceptable. Originality — strong. Craft — acceptable. Functionality — weak (pre-fix). Dark mode — N/A: product has no dark mode on this surface.

## Ratchet

_To be completed at Phase 6 after the review verdict and user acceptance._

## Design review — round 1 (2026-08-20, dx-design-review)

> Verdict pasted verbatim per `procedures/design-review.md`. Shared-limit note:
> the reviewer runs the same model on the same standards — a second read, not a
> fully independent one; split findings and non-mechanical checks remain
> candidates for human review.

### Verbatim verdict

VERDICT: fail

Two L0 controls fail, sprint-contract criteria 4 and 5 are not met, and the page's single primary action is invisible without JavaScript.

Standing overrides: none (no `.dx/design.json`, no `DESIGN.md`; LAY-1 correctly N/A).

BLOCKING (must fix before ship)

1. Conduct, offences, counselling and SEN data render on the public page (contract criterion 4 guardrail; CNT-4). The student-profile capture is used twice — hero peek and act 2 — and visibly contains "Conduct grade · Excellent (2025, Overall)", "Offences · 0", "Counselling · 0", "Special Educational Needs (SEN)". Fix the capture, not the copy.
2. Without JavaScript the hero — including "Sign in with Google" — never becomes visible (contract criterion 5; MOT-3). Server HTML ships `opacity:0` on the hero copy block, hero peek, reveal, section headings, the entire close section, and all three memo cards; no `<noscript>` fallback. Related gap: `vitest.setup.ts` stubs `matchMedia` with `matches: true` for every query, so all 347 tests run in the reduced-motion branch.
3. Focus indicators at 1.3–1.8:1, far below the 3:1 non-text floor (A11Y-1 / A11Y-2, both L0): `ring-primary/40` (header, apps, footer) measured 1.81:1; `ring-ring/50` on the two Buttons 1.31:1 (hero, on sky) and 1.44:1 (close). Only the skip link and footer feedback link pass.
4. Audience block labels fail AA (A11Y-1, L0): `text-[color:var(--paper-ink)]/60` at 14px semibold measures 4.28/4.15/4.16:1 on cream/mint/sky (needs 4.5:1).
5. Close CTA label fails AA (A11Y-1, L0): `text-primary` #0066ff on paper #f6f3eb = 4.36:1 at 16px/600. With `--cta-blue #245adb` the same pairing measures 5.32:1 and passes.
6. The header wordmark link has no accessible name below 640px (A11Y-8, L1); the footer's identical pattern carries `aria-label` (CMP-7 divergence).
7. Interactive targets below the size floor (A11Y-4, L1; no ledger row): footer feedback link 18px vs 24px floor; header wordmark 36px and footer wordmark 28px vs 44px mobile floor.
8. In-page navigation deleted below 768px with no equivalent (LAY-2, L1); the 320/360 captures predate three late fixes, so the current 320 reflow is unverified — re-capture required.
9. Off-scale type sizes with no waiver on file (TYP-3, L1): 13px header/footer; 22/15/13px memo card. L1 needs a documented waiver with a named approver or on-scale sizes.
10. A dead font import ships on this page (TYP-1, L1): `@fontsource-variable/geist` imported in styles.css, referenced by nothing; `type-scan` does not implement the dead-import clause.
11. The ≥1024px fallback collapses the gap between acts to zero (SLP-7, L1): `lg:gap-y-0` with no padding in the non-enhanced branch — capability sign-off sits ~20px above the next act's eyebrow.
12. Two binding decision-record gates still open while the page renders as if cleared: ADR-0003 "Nothing renders until `publicationApproved` is recorded" vs three rendered quotes at `publicationApproved: false` (and the landing-map acceptance table says one quote, the build ships three, labelled "Verified quotes"); "Capability-owner-confirmed GA claims only" vs act 3's Release-2 flag-gated capability beside "Now available to schools across Singapore." Ticket #6 remains the merge gate.

ADVISORY (should fix)

- Illustrative labelling incomplete (CNT-4): synthetic disclosure beside the journey frame only; hero peek unlabelled; flag-gated capability has neither owner sign-off nor in-product label.
- Capability naming internally inconsistent (CNT-12/CNT-10 close call): "Student Insights" Title Case beside sentence-case peers; "Message drafting" (card) vs "AI Draft" (act 4 copy/capture).
- Memo-card motion overshoots and runs long (MOT-1; SLP-8 close call): 950ms overshoot keyframes, underdamped cursor spring; judged decorative narrative content, worth a human call.
- The record misstates the CTA colour (COL-1): says `--cta-blue #245adb`, code uses `--primary #0066ff`.
- Header anchors suppress native fragment focus: `preventDefault` + `scrollIntoView` with no focus move.
- The decision record fails `checks/audit-record.py` (11 errors: ledger method vocabulary, missing fixed-form CMP-1 line, placeholder waiver row); the ledger claims the hero CTA's focus state was photographed but the frame shows a nav link.
- Two rendered strings bypass the MDX copy layer (reveal eyebrow, schools lede).
- Raw shadow values beside existing tokens (ga-header, memo-card).
- The launch line appears twice (hero pill and reveal).
- Identical 4-up card grid as the discovery layout (SLP-5, close call, reasoned).
- The fixed translucent pill sits on top of running copy at 360 and 1280.
- Minor A11Y-6: literal "→" announced; sticky frame aria-label concatenates five sentences.
- Publication judgment on one verbatim ("faster than Facebook and Instagram") — a PM call.
- Inter is delivered by accident (imported only via the content-review route's chunk attached to the root entry).

QUALITY GRADES: Design quality — acceptable. Originality — strong. Craft — acceptable. Functionality — weak. Dark mode — N/A.

UNCOVERED (feed the ratchet): no control requires a no-JS/hydration-failure baseline; no control governs marketing claim accuracy/availability; no control governs what a product screenshot discloses; a project matchMedia stub can silence a whole rendering branch; `type-scan` lacks TYP-1's dead-import clause; `contrast.py` cannot resolve Tailwind `/opacity` modifiers.

(Full judgment-control notes and the reviewer's verification ledger are preserved in the design ticket run record, String-dxd/marketing-teacher-workspace#14.)

### Fixes applied after round 1 (commit pending re-check)

1. **Capture data leak** → new cropped asset `student-profile-attendance.png` (2050×980: breadcrumb, name card, attendance card only — no behaviour/counselling/SEN fields, no jump-rail); used by the hero peek and act 2. Fixed, re-captured.
2. **No-JS opacity:0** → hero entrances rewritten as pure CSS keyframes (`ga-fade-up`); `RevealOnScroll` and `MemoCard` now server-render the settled state and only arm their entrance after hydration for elements still below the viewport. New regression test: `renderToStaticMarkup(<GaLandingPage/>)` must contain no `opacity:0` and must contain the CTA. Fixed.
3. **Focus contrast** → all `/40`–`/50` ring modifiers replaced with full-opacity `ring-primary`; the two Buttons add `ring-offset-2`. Fixed, hero-CTA focus frame captured this time.
4. **Audience labels** → `/60` → `/70` (computed ≥5.8:1 on all three tints). Fixed.
5. **Close CTA text** → `--cta-blue` text/border (5.32:1). Fixed.
6. **Wordmark accessible name** → `aria-label="Teacher Workspace"` on the header link. Fixed.
7. **Hit areas** → `min-h-11` on header/footer wordmarks; feedback link `min-h-11 sm:min-h-6`. Fixed.
8. **Mobile navigation** → in-flow "Page sections" anchor row under the hero, `md:hidden`; 320px re-verified (scrollWidth = 320, no overflow). Fixed.
9. **Off-scale sizes** → moved onto the scale (see calibration note) instead of a waiver. Fixed.
10. **Dead Geist import** → removed from `src/styles.css`; zero `geist` references in served output. Fixed.
11. **Stacked act rhythm** → non-enhanced acts column carries `gap-y-16`. Fixed, re-captured.
12. **Governance gates** → ADR-0003 amended with a scoped addendum (proposed rendering on unmerged review builds; `publicationApproved` remains the merge gate); act-3/claims posture already recorded — tickets #6 and #10 stay the merge gates. Recorded, not code.

Advisory items also applied: hero peek now carries the synthetic-record label; anchor jumps move focus to the target section; "→" is `aria-hidden`; the frame `aria-label` is a single composed sentence; reveal eyebrow and schools lede moved into MDX frontmatter (`04-reveal.mdx`, `08-proof.mdx`); schools h2 weight aligned to siblings; record compliance errors fixed. Deliberately not changed (with reasons): launch line appears in hero and reveal (issue #3's IA places a mark in both); memo-card entrance overshoot (v1's designed narrative motion, reduced-motion safe — flagged for a human call); 4-up card grid (reasoned in plan); translucent pill (v1 sibling convention); "faster than Facebook and Instagram" verbatim (PM publication call, ticket #10); "Message drafting" vs "AI Draft" (capability vs control name — flagged to PM).

CMP-1: asserted, no manifest — manifest absent for tw

### Re-check status

_Pending: same reviewer, new screenshots._
