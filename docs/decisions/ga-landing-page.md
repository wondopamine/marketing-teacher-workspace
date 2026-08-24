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
- **Story before specifics** — KPs must scroll past the narrative to reach briefing cards. Accepted: issue #3 orders discovery after the story deliberately. ~~Superseded 2026-08-24~~ — see "Capability row lifted above the journey" below.
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

Candidates surfaced by this run's reviews, recorded for `rule-proposal.md` routing to the harness repo [proposed — pending design-lead approval]:

1. **No-JS baseline control**: server-rendered output must not hide content behind an animation's initial state (statically detectable — scan SSR markup for `opacity:0` on content subtrees). This build shipped its primary action at `opacity:0` and passed every deterministic check.
2. **Availability-claim control**: an availability or capability claim on a public surface traces to a capability owner's recorded confirmation (no existing control reaches "Now available…" beside a flag-gated capability).
3. **Screenshot-disclosure control**: captures of product UI on public surfaces are reviewed for the data categories they display, not only their text alternative (a capture passed A11Y-6/CNT-4 while showing conduct/counselling/SEN fields).
4. **Test-harness check**: a project's `matchMedia` stub must not blanket-match `prefers-reduced-motion` (this repo's stub keeps all 348 tests in the reduced-motion branch; `vitest.setup.ts` unchanged this run — flagged, not fixed).
5. **Script gaps**: `checks/type-scan.py` does not implement TYP-1's dead-import clause; `checks/contrast.py` cannot resolve Tailwind `/opacity` modifiers — both let real failures pass a "clean" run.

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

Round 2 ran 2026-08-20 (fresh dx-design-review instance — the round-1 reviewer's context could not be resumed; the round-1 verdict and fix list were passed in full). Verdict below, verbatim.

## Design review — round 2 (2026-08-20, dx-design-review re-check)

### Verbatim verdict (summary table + closing; full text on ticket #14)

All 11 code findings graded **resolved** against independently verified evidence (reviewer re-ran the harness checks, pixel-sampled the frames, and ran two independent SSR probes — zero `opacity:0`, focus ring measured 4.43:1 on the sky and 4.83:1 on its offset, audience labels 5.61–5.91:1, close CTA 5.32:1, cropped capture read directly and confirmed attendance-only, type-scan TYP-3 clean, stacked act gap ~84px). Finding 12 graded **partial**: the ADR-0003 addendum is a legitimate scoped resolution for a branch build, but the page said "Verified quotes", the landing-map acceptance rows were unreconciled, and act 3 still presents a Release-2 capability beside the GA line — merge gates #6/#10, not a re-review gate.

New/residual advisories: near-empty fixed nav pill below 640px occluding content; 31-word frame aria-label (CNT-3); "Verified quotes" rendering as a first-class string; evidence hygiene (byte-identical hero/focus frames, stale 768 set, no post-fix memo capture); the vitest matchMedia stub still silences the enhanced rendering branch (advisory + ratchet); CNT-10 "Message drafting" vs "AI Draft" pass-with-caveat — needs a rename or a documented waiver before merge; CNT-12 mixed case on capability labels.

Grades: design quality — acceptable · originality — strong · craft — acceptable, improved · functionality — acceptable, up from weak · dark mode — N/A.

VERDICT: pass

*(In the standard's three-value vocabulary this is `pass-with-findings` — the advisories are all L2 or record-level, and none is a blocking control failure.)*

### Post-round-2 touch-ups (same day)

- `08-proof.mdx` publicLede no longer says "Verified quotes" → "Quoted verbatim from staff interviews, with role and school level."
- Landing-map acceptance rows reconciled via a dated amendment in `docs/decisions/2026-08-13-teacher-workspace-ga-landing-map.md`.
- Frame aria-label shortened to 19 words.
- The mobile nav pill fits its content (`w-fit md:w-full`) instead of spanning the width.
- Evidence refreshed: resting 1280 hero, full 768 set, current memo-card frames at 1280/768/360.

Open for the PM before merge (unchanged): per-quote publication approval (#10), claims register incl. act-3 availability posture (#6), CNT-10 naming call (Message drafting vs AI Draft), Facebook/Instagram verbatim publication call.

---

## Round 3 — stakeholder feedback iteration (2026-08-21)

- **Trigger:** stakeholder Figma feedback (`feedback.pdf`, reviewed 2026-08-21) plus a
  follow-up direction: journey visuals should work like Linear's feature vignettes —
  highlight only the key component, offer a limited interactive part, never show the
  whole product screen.
- **Run type:** dx-design modification loop. The feedback + the user's explicit
  "iterate on this" counts as the chosen direction (stop-once rule); plan recorded
  below and exposed in-session before build.

### What changed

1. **Hero (peaceful).** Product peek and hero launch-line pill removed. Headline →
   "Gain back your time to care for students" (stakeholder copy, verbatim). The locked
   sky + clouds stay. New visual: the hand-drawn teacher-working loop
   (`/hero/teacher-working.mp4`, 8.9s 624×624, provided by the stakeholder) rendered
   with `mix-blend-multiply` so its white ground melts into the sky. The server, no-JS,
   and reduced-motion renders get the still frame (`teacher-working-poster.webp`,
   extracted from frame 0); the video mounts only after hydration when motion is
   allowed, and a visible Pause/Play toggle (aria-pressed, ≥44px) satisfies
   WCAG 2.2.2 for the >5s loop. Regression test: SSR markup contains no `<video`.
2. **Journey visuals → coded feature vignettes** (`ga-vignettes.tsx`), replacing all
   product captures. Identify = working filter chips (Attendance, CCA attendance,
   Social links, FAS — the stakeholder's example set) over six synthetic students with
   an aria-live match count; auto-cycles until first touch. Holistic = category
   jump-rail + attendance card + Behaviour/Family as header-only cards with redacted
   bars ("Sensitive sections stay inside the profile."). Guidance = one suggestion
   card. Draft = Term Update Letter draft settling in. Posts = read receipts + a
   scheduled reminder. Pinned stage crossfades vignettes (200ms opacity; inactive
   layers inert + aria-hidden); every vignette settles complete without JS/motion.
   **Privacy consequence:** no product capture ships on the public page at all —
   enforced by a new regression test (`no /content-review/screens/` in SSR output).
   This supersedes round 1's "captures, decorative" media decision at the
   stakeholder's direction.
3. **Journey copy** (03-story.mdx, stakeholder wording): "You identify / Find the
   students you're looking for, easily.", "You understand / See each student
   holistically.", "The words are ready / Write with your whole school behind you.",
   "Every family is in the loop. / Sent. Seen. Followed through."; reveal body now
   "identifying, understanding, deciding, and engaging students and families."
4. **Capabilities section** (ga-apps.tsx): Craft-style icon row — TW ink icon above
   the heading, lucide icon + title + one-line JTBD per capability, whole item
   anchors to its act. Scenario paragraphs no longer render (they remain in
   05-capabilities.mdx for the wireframe and governance sync).

### Decisions and flags

- **CTA label stays "Sign in with Google."** The mock proposed "Sign in with edupass",
  but `landingPageV2Publication.primaryCta` records the confirmed Google access
  contract (identityProvider: google; readiness check pins the label). Changing the
  marketing label without a product-side identity change would be a false claim.
  **Open PM/product question.**
- **New copy claims enter the register as PROPOSED (ticket #6 gate):** "We draw on
  what teachers across your school have already sent" (school-voice drafting) and
  "We send the reminders" (automatic reminders). Neither is yet capability-owner
  confirmed; both now render. Same posture as the act-3 flag-gated state.
- **Audited-claim spot-check re-anchored:** the "Term Update Letter" mention left the
  narrative copy (it survives visually in the draft vignette), so
  `landing-v2.test.ts` / `landing-v2-review.server.test.ts` now anchor on the
  read-tracking claim ("which families have read"), which the audited prototype
  still demonstrates.
- **CMS fallback template** (`homepage-v1.server.ts`) re-synced to the new copy so
  the review candidate projection stays exact; section/item/screen IDs unchanged.
- **CLAUDE.md tension, named:** the "product UI emerging from the paper world"
  choreography is now confined to the journey (pinned vignette stage); the hero no
  longer scales a product surface. Done at the product owner's explicit direction.

### Verification (round 3)

- token-audit clean; a11y-static clean; contrast clean (one manual note:
  `--paper-hover-bg` used only on decorative redaction bars). type-scan: vignette
  micro-type raised to the 12px floor; the two remaining findings are the standing
  display-heading calibration note. vitest 349/349; production build + output-leak
  scanner + route verifiers pass; 320px scrollWidth = 320.
- Evidence: `docs/design-evidence/ga-landing-page/round-3/` — 1280 (hero ×2 frames
  for motion proof, fold with pause control, pause focus, all five acts, identify
  interaction + chip focus, reveal, apps), reduced-motion (hero still-image DOM
  verified, journey stacked), 768 (hero, journey), 360 (hero, apps), 320 (reflow).

### Round-3 review verdict (verbatim)

VERDICT: fail

Three blocking control failures (one L0), all introduced by the round-3 vignette work. Contract criteria 1–6 are otherwise met, largely verbatim.

**Inputs**: contract, plan, component inventory, 19 round-3 frames, code — all received. **Standing overrides: none.** I checked for `.dx/design.json` at the repo root myself; the file does not exist (LAY-1 correctly N/A, and no override adjusts any control this run). No waivers are on file — `docs/decisions/ga-landing-page.md` "Waivers granted" is an empty table across all three rounds.

**Evidence caveat that shaped this review:** three of the cited frames do not show what their filenames claim (details in ADVISORY). I therefore graded the interactive controls from the route's code and from pixel measurements of the frames that do render the surfaces, not from the builder's captions.

BLOCKING (must fix before ship):

1. **Text meets WCAG AA contrast (A11Y-1, L0)** — the filtered-out student rows render at 30% opacity and measure **1.92:1**. `src/components/landing-ga/ga-vignettes.tsx:132-136` applies `opacity-30` to the whole `<li>` for non-matching students. Measured from `round-3/768-journey.png`: "Priya Nair" text samples at rgb(185,183,177) on rgb(253,250,242) = 1.92:1; the avatar chip beside it is 1.74:1 (needs 4.5:1 at 14px). This ships in **every** rendering branch — desktop pinned stage, 768/360 stacked, no-JS, and reduced-motion (visible in `round-3/1280-reduced-journey.png`, where three of six names are washed out). `contrast.py` reported clean because it cannot resolve an opacity utility applied to a container — the exact gap round 1 already logged to the ratchet, so "contrast.py clean" does not cover this. L0: no waiver is available. If the team wants to argue these rows are exempt as "inactive" content, that needs a named human approver on the record, not a reviewer's inference.

2. **Interactive targets are at least 24×24px, 44px on mobile (A11Y-4, L1)** — the four filter chips are 24px tall at every width. `ga-vignettes.tsx:111` sets `min-h-6` (24px) with `gap-1.5` (6px) between chips. Measured directly from `round-3/768-journey.png`: the "Attendance" chip spans y=447→470 = **24px**. These are real `<button>`s on phones — `ga-journey.tsx:171-175` renders every vignette inline with live controls when `enhanced` is false, which is the branch all mobile users get. 24px clears the desktop floor but not the 44px mobile floor; this is the same rule that forced `min-h-11` on the header and footer wordmarks after round 1. No waiver on file.

3. **No nested cards (SLP-4, L1)** — up to three levels of card-styled container. `ga-journey.tsx:106` (`rounded-2xl border border-[color:var(--paper-rule-strong)] bg-[color:var(--paper-card)] p-5 shadow-[var(--paper-shadow-card)]`) wraps `VignetteCard` at `ga-vignettes.tsx:403` (`rounded-xl border … bg-[color:var(--memo-bg)] p-4 shadow-…`), which wraps the panels at `ga-vignettes.tsx:209` and `:231` (`rounded-lg border … bg-[color:var(--paper-card)] p-3`). The non-enhanced branch repeats it at `ga-journey.tsx:172`. Plainly visible as two concentric bordered, shadowed boxes in `round-3/1280-act-identify.png`, `1280-act-guidance.png`, `1280-act-draft.png`, `768-journey.png`, `1280-reduced-journey.png`. SLP-4 has no detail file, so title + verify are the whole rule and there is no "do not flag" exception to reach for. The outer frame carries no content — deleting it closes this and the SLP-11 finding below.

ADVISORY (should fix):

- **A card is only for an interactive unit (SLP-11, L2)** — same container as blocking #3. The pinned `<figure>` (`ga-journey.tsx:106`) and the fallback wrapper (`:172`) are card chrome around static content; in `1280-act-guidance.png` a ~200px vignette floats in a ~550px empty white frame. Removing the chrome would not hurt comprehension. One fix closes both findings; counted once.
- **Adjacent type-scale steps differ by ≥1.25× (SLP-6, L2)** — the capability items are flat: title 16px (`ga-apps.tsx:72` `text-base`), one-liner 14px (`:75`), link 14px (`:78`) = 1.14×. In `1280-apps.png` "Student Insights" barely outweighs its own sentence; weight and colour are doing all the hierarchy work.
- **Shared edges align (LAY-6, L2)** — in `1280-apps.png` item 1's "See it in the journey →" sits at y≈695 while items 2–4 sit at y≈673, because only item 1's one-liner wraps to two lines; the four link rows should share a baseline. Separately, the journey copy column starts at x=32 (`ga-journey.tsx:72,78` — `px-5 sm:px-8` + `max-w-[1220px]`) while the apps section is inset to x≈90, so the acts hug the viewport edge at 1280.
- **Components stay consistent with their defaults and sibling usage (CMP-7, L2)** — verified manually against the codebase (no manifest). Two divergences: (a) one chip affordance carries three different meanings — a live toggle (`ga-vignettes.tsx:109-121`), a decorative category highlight (`:195-206`), and a dead "Use this step" span styled identically to the live chips (`:270-276`, inside an `aria-hidden` div); (b) the same vignette gets a labelled `<figure>` + `<figcaption>` in the enhanced branch (`ga-journey.tsx:106-111`) but a bare unlabelled `<div>` in the fallback branch (`:172`) that every phone and no-JS reader gets.
- **Copy uses sentence case (CNT-12, L2)** — round 3 adds "Student Profiles" (`ga-vignettes.tsx:94`) and "Term Update Letter" (`:304`) to the unresolved round-1/2 finding: "Student Insights" sits in a row with "AI next-step guidance", "Message drafting", "Posts" (`1280-apps.png`). Some are arguably product surface names and exempt as branded nouns — but the row is visibly mixed, and no reason is recorded either way.
- **Structure is programmatically determinable (A11Y-7, L1) — close call, not graded fail** — `ga-journey.tsx:71` still labels the section `aria-label="One student's care journey"`, but round 3 replaced the single-student captures with a six-student filter list and three recipient families. The label no longer describes its content. I judged this pass-with-caveat because the narrative reading is still defensible; a stricter reading makes it blocking, and the fix is one string. Recommend a human call.
- **Custom components expose name, role and value (A11Y-8, L1) — close call** — the hero pause control carries **both** `aria-pressed={paused}` and a label that flips (`ga-hero.tsx:127,132`). When paused, AT announces "Play animation, toggle button, **pressed**". State does track the visual, so it clears A11Y-8's stated fails_when, but the combination is a known APG anti-pattern. Pick one: static name + `aria-pressed`, or changing name and no `aria-pressed`.
- **One term per thing (CNT-10, L1) — third round unresolved** — "Message drafting" (apps) vs "AI Draft" (`ga-vignettes.tsx:306`). Round 2 recorded "needs a rename or a documented waiver before merge"; round 3 re-created the string in new code and neither happened. I keep the pass-with-caveat grade (a capability name vs a document-state badge are arguably different objects), but this is L1 with `waiver: documented` — a waiver row with a named approver, or the rename, should land before merge.
- **Fixed nav pill occludes running copy (craft; round-1 advisory, unchanged)** — in `1280-reveal.png`… `1280-act-posts.png` the h2 "We removed the admin between the moments." has its first line entirely behind the pill with ghost text bleeding through the translucent fill; the same happens to the act-3 h2 in `1280-act-guidance.png`. Accepted in rounds 1–2 as a v1 sibling convention; round 3's act rhythm makes it land on headings more often.
- **Evidence defects (three frames do not show their subject)** — `1280-pause-focus.png` shows the hero scrolled to top with **no pause button in frame** and no focus indicator anywhere; `1280-identify-chip-focus.png` shows the FAS chip at rest with **no focus ring** (the only delta from its sibling frame is the pause label reading "Play animation"); `1280-act-posts.png` shows the reveal band and the apps section, **not** the posts vignette — the fifth vignette has no evidence at all. Also: no 360 or 320 journey capture, so the mobile vignette rendering (the branch carrying the 24px chips) is unphotographed; and the direct-edit dev overlay is baked into all 19 frames, occluding content in `1280-apps.png`, `768-journey.png` and `1280-reduced-hero.png`. This is a repeat of round 1's mislabelled-focus-frame advisory. Positive: no byte-identical frames this round (19 files, 19 hashes).
- **Record note is inaccurate** — the round-3 verification note says `--paper-hover-bg` is "used only for decorative redaction bars, not text". It is also the background of the criterion tags at `ga-vignettes.tsx:153` (12px `--paper-muted` on it). I measured that pairing at **4.62:1** — it passes, but the manual note as written does not cover it.
- **Hydration layout shift, and no round-3 performance evidence** — `ga-hero.tsx:105-114` mounts `<video>` with no `width`/`height`/aspect-ratio, replacing an `<img>` that has `width={624} height={624}` (`:116-123`); before the poster resolves, `w-full` with an unknown intrinsic ratio lays the element out at 2:1, then snaps square. CLAUDE.md pins "must not regress current Lighthouse scores" and this round adds an autoplaying 8.9s MP4 on every load, including mobile — no Lighthouse or CLS figure was reported.
- **SLP-5 (L2) close call, not graded fail** — the apps row is now the icon-above-heading 4-up shape, though without card chrome. L2 permits a specific reason and the decision record carries one ("Craft-style icon row", stakeholder direction, round 3 §4). Recorded, so not a finding — noted so the next reviewer does not re-litigate it.

SUGGESTIONS (not violations — improvements the builder may take):
- Delete the outer journey frame (`ga-journey.tsx:106` and `:172`) and let the vignette sit on the paper ground — closes SLP-4 and SLP-11 and removes the empty white plate in one edit.
- De-emphasise non-matching rows with muted text + no border instead of `opacity-30`, keeping them ≥4.5:1 — serves A11Y-1 and keeps the "narrowing" idea legible to everyone.
- `min-h-11 md:min-h-6` on the filter chips (or an expanded hit area) — serves A11Y-4 and makes the one interactive vignette actually tappable on the phone it mostly renders on.
- Raise the capability title to 20px (`text-xl`) — restores a 1.25× step over its one-liner (SLP-6) and lets the four capabilities scan.
- Give the vignette ambient cycles the same pause treatment the hero got, and fire the `aria-live` count only on user-initiated toggles — closes the two UNCOVERED items below at their source.

QUALITY GRADES:
- **Design quality — acceptable.** The hero is genuinely peaceful and the copy/CTA hierarchy is unambiguous at all four widths; the journey undercuts itself with a double frame around a small card and a copy column pinned hard to the viewport edge.
- **Originality — strong.** Replacing product captures with coded, partly-interactive vignettes is the right and distinctive call, and it solves the privacy problem structurally rather than by cropping; the paper world still reads as nobody else's. The capabilities row drifting toward the generic icon-grid is the one pull in the other direction. No slop tells: no gradients, no glow, no side-tab borders, standard `cubic-bezier(0.4,0,0.2,1)` easing throughout, and the blue/mint/sky coding is the registered paper system, not decoration.
- **Craft — weak.** A 1.9:1 text state in the default rendering, 24px touch targets, three levels of nested card, an empty frame, a stale section label, a video with no intrinsic dimensions, and three evidence frames that do not show their subject. Individually small; together they say the round was not re-read after it was built.
- **Functionality — acceptable.** The teacher's one task (sign in) completes at 320/360/768/1280 and in the no-JS, reduced-motion and mobile branches; the filter works, settles, and hands control back on first touch; no dead ends or unrecoverable states. Held back by three identical-looking affordances where only one responds, and ambient motion the visitor cannot stop.
- **Dark mode — N/A: product has no dark mode** (deliberately light paper world; no toggle, no re-rendering `.dark` layer on this route).

UNCOVERED (defects no control covers — feed the ratchet):
1. **Auto-updating content with no pause control.** The vignette cycles run indefinitely at 2.2s (holistic), 2.8s (identify) and 3.4s (guidance) intervals (`ga-vignettes.tsx:71,177,257`) with no pause/stop/hide affordance. The catalogue's declared floor is WCAG 2.2 AA and SC 2.2.2 covers auto-updating information, but A11Y-5 reaches only `prefers-reduced-motion` and MOT-1 only duration/placement. The page proves the gap: the hero got a pause control for exactly this reason, and the vignettes beside it did not.
2. **Timer-driven live region.** `aria-live="polite"` on the match count (`ga-vignettes.tsx:96`) re-announces every 2.8s while the identify act is on screen and untouched. A11Y-11's four fails_when clauses are all about async state changes the user initiated; none reaches an unattended announcer.
3. **Hydration-swap layout shift.** No control governs a media element mounted after hydration without intrinsic dimensions (`ga-hero.tsx:105-114`), even though it produces a visible reflow of the hero's focal image.
4. **Performance budget.** CLAUDE.md pins "must not regress current Lighthouse scores"; no control requires a perf measurement in the verify phase, and none was reported for the round that added an autoplaying 8.9s MP4 to every load, mobile included.
5. **Opacity utilities are invisible to `contrast.py`.** Round 1 logged that `contrast.py` cannot resolve Tailwind `/opacity` modifiers; this round shows the container-level `opacity-30` case is equally invisible — and it hid an L0 failure behind a "clean" run. Worth promoting from a ratchet note to a script fix.
6. **Evidence fidelity.** No control requires that a cited evidence frame actually show the state its filename claims. Three round-3 frames failed this, and the same class of defect appeared in round 1. A verify-phase check ("each named frame shows the named state") would have caught all four.

(Full judgment-control notes and the verification ledger are preserved in the run record on the design ticket.)

### Fixes applied after round 3 (same day)

All three blocking findings and the actionable advisories, fixed and re-photographed:

1. **A11Y-1 (L0) row contrast** → `opacity-30` removed. Non-matching rows keep full
   opacity and de-emphasise structurally: muted text (`--paper-muted` on
   `--memo-bg`, 5.01:1), no card ground, avatar flips to `--paper-hover-bg` +
   muted initials. Fixed, re-captured (`1280-act-identify.png`, `360-journey.png`,
   `1280-reduced-journey.png`).
2. **A11Y-4 chips** → `min-h-11 px-3` with `lg:min-h-6 lg:px-2.5` (44px on every
   touch-first width; 24px only inside the desktop pinned stage). Measured in
   `360-journey.png`.
3. **SLP-4/SLP-11 nested frames** → the outer journey frame is deleted in both
   branches; the vignette card is the only chrome, floating on the paper ground.
   Also removes the empty white plate.
4. **SLP-6** → capability titles raised to `text-xl` (20px; 1.43× over the 14px
   one-liner). **LAY-6** → the one-liner takes `flex-1`, so the four "See it in the
   journey" rows share a baseline.
5. **A11Y-7** → journey section `aria-label` now "The journey" (matches the nav
   name and the section's content). **A11Y-8** → the pause control uses the
   changing-name pattern only (`aria-pressed` removed).
6. **CMP-7** → the three chip meanings are now three affordances: live filters
   keep the outlined rounded-full chip; the holistic rail reads as jump links
   (text + underline on highlight, no border); the depicted "Use this step"
   dropped its outline. Both branches now use the same plain wrapper (figure
   removed with the frame).
7. **Hydration shift** → the video carries `width/height={624}` + `aspect-square`,
   matching the still frame exactly.
8. **UNCOVERED #1/#2 at source** → every ambient cycle now comes to rest on its
   own after two passes (identify, holistic, guidance), and the match-count
   live region is `aria-live="off"` until the visitor first touches a chip.
9. **Evidence fidelity** → full re-capture: real keyboard-driven focus rings
   (`1280-pause-focus.png`, `1280-identify-chip-focus.png`), the posts vignette
   photographed (`1280-act-posts.png`), holistic act added
   (`1280-act-holistic.png`), journey at 360 and 320 added (scrollWidth 320 = 320).
   The small floating badge in some frames is the capture tool's cursor
   indicator, not page UI.
10. **Record note corrected** → `--paper-hover-bg` also grounds the criterion tags
    (muted text on it measures 4.62:1, passing); the earlier note undercounted.

Deliberately not changed (with reasons): CNT-12 Title Case strings — "Student
Insights" and "Posts" are product capability names, "Student Profiles" a product
surface name, "Term Update Letter" a template name; recorded here as branded
nouns (PM may rename). CNT-10 "Message drafting" vs "AI Draft" — still the PM
naming call carried since round 2; the vignette depicts the product's own badge.
Nav pill translucency — v1 sibling convention, accepted rounds 1–2. Performance:
no Lighthouse run this round (uncovered #4 stands as an open verify-phase gap);
the video is 3.1MB, poster 37KB webp, and the hydration-shift fix removes the
known CLS source — flagged for a measured run before merge.

Checks after fixes: token-audit clean; a11y-static clean; type-scan — only the
standing display-heading calibration set; vitest 349/349; production build +
output-leak scanner + route verifiers pass.

### Round-3 re-check verdict (verbatim)

## Original findings — re-graded

**BLOCKING**

1. **Text meets WCAG AA contrast (A11Y-1, L0) — RESOLVED.** `opacity-30` is gone from the row (`src/components/landing-ga/ga-vignettes.tsx:141-168`); I pixel-sampled the dimmed names in all three rendering branches and every one returns the same rgb(95,111,118) on rgb(253,250,242) = **5.01:1** — `1280-act-identify.png` ("Priya Nair"), `360-journey.png`, `1280-reduced-journey.png`; the muted avatar initials on `--paper-hover-bg` over `--memo-bg` compute to 4.62:1, also passing.
2. **Interactive targets ≥24×24px, 44px on mobile (A11Y-4, L1) — RESOLVED.** `min-h-11 px-3 … lg:min-h-6 lg:px-2.5` at `ga-vignettes.tsx:120`; column-scanning the "Attendance" chip borders gives y=397→440 = **44px** in `360-journey.png` and the same 44px band in `768-journey.png` / `320-journey.png`, with 24px (y=237→260) only in the ≥1024px pinned stage of `1280-act-identify.png`.
3. **No nested cards (SLP-4, L1) — RESOLVED (close call noted).** The bordered/shadowed `<figure>` is deleted from the pinned stage (`ga-journey.tsx:104-126`, now a bare `relative` div) and from the fallback branch (`:167-171`, now `flex justify-center`); `1280-act-identify/guidance/draft/holistic/posts.png`, `768-journey.png` and `1280-reduced-journey.png` all show a single card on the paper ground. Close call for the record: the `VignetteCard` (`:425`) still contains `rounded-lg border … bg-[--paper-card]` panels/rows (`:141`, `:231`, `:253`, `:388`), which a strict read of SLP-4's *verify* sentence ("no card-styled container nested inside another") still catches, though it no longer matches the `fails_when` ("cards inside cards inside cards") and it is exactly the remedy round 3 prescribed. Recommend a human confirm the two-level read once, so round 4 does not re-litigate it.

**ADVISORIES**

- **SLP-11 (empty white frame) — RESOLVED.** `1280-act-guidance.png` shows the ~200px vignette alone; the ~550px empty plate is gone with the frame.
- **SLP-6 (flat type scale) — RESOLVED.** `ga-apps.tsx:72` is `text-xl leading-7` (20px) over a 14px one-liner = 1.43×; visible in `1280-apps.png`, where "Student Insights" now clearly outweighs its sentence.
- **LAY-6 (shared edges) — PARTIAL.** The link-row half is fixed: `flex-1` on the one-liner (`ga-apps.tsx:75`) puts all four "See it in the journey →" rows on y≈699 in `1280-apps.png`. The section-inset half is unchanged and, unlike the other deliberate stands, carries **no recorded reason** in the decision record — journey copy still starts at x=32 (`ga-journey.tsx:72,78`) against the apps section's x≈90 and the nav pill's x≈170, three different left edges at 1280. L2 with `waiver: rationale`, so a one-line reason in the record closes it.
- **A11Y-7 (descriptive labels) — RESOLVED.** `ga-journey.tsx:71` now reads `aria-label="The journey"`, matching the nav item in every frame.
- **A11Y-8 (name/role/value) — RESOLVED.** `ga-hero.tsx:128-134` carries the changing name only; no `aria-pressed` anywhere on the pause button. `1280-pause-focus.png` shows the real control in frame, labelled "Pause animation", with a genuine focus ring.
- **CMP-7 (consistency) — RESOLVED.** Three affordances now separate cleanly: outlined `rounded-full` live chips (`ga-vignettes.tsx:118-131`), borderless text-with-underline holistic rail (`:218-228`, confirmed in `1280-act-holistic.png`), tint-only "Use this step" (`:293`, confirmed in `1280-act-guidance.png`); both branches use the same plain wrapper now that the `<figure>`/`<figcaption>` asymmetry went with the frame. Contrast on the re-coloured chips re-checked under A11Y-1: active chip 4.90:1, "Use this step" 4.91:1, criterion tag 4.82:1 — all pass.
- **Hydration layout shift — RESOLVED.** `ga-hero.tsx:107-115` sets `aspect-square` + `width/height={624}`, identical geometry to the `<img>` at `:118-125`; no ratio change across the swap.
- **UNCOVERED #1 / #2 (unstoppable cycles, timer-driven live region) — RESOLVED at source.** `useCycle` clears its interval and returns to rest after `steps * 2` ticks (`ga-vignettes.tsx:435-455`), the identify cycle does the same at `:71-82` and stops permanently on first touch, and the match count is `aria-live={touched ? "polite" : "off"}` (`:105`).
- **Evidence fidelity — RESOLVED (two stale frames).** `1280-identify-chip-focus.png` shows a real ring on "CCA attendance" with a different filter state (4 of 6), `1280-pause-focus.png` shows a real ring on the pause button, `1280-act-posts.png` genuinely shows the posts vignette, `1280-act-holistic.png` / `360-journey.png` / `320-journey.png` are new, and the dev overlay is gone. Residual: `1280-hero-fold.png` (15:27) and `1280-reveal.png` (15:31) predate the 16:15–16:17 fix batch, so those two are not post-fix captures.
- **Record note (`--paper-hover-bg`) — RESOLVED.** Corrected at `docs/decisions/ga-landing-page.md:405-406`; I re-derived the criterion-tag pairing at 4.62:1, matching the note.
- **Deliberate stands — RECORDED, one caveat.** CNT-12 branded nouns, CNT-10, nav-pill translucency and the missing Lighthouse run are all written down in "Deliberately not changed". Caveat: **CNT-10 is L1 with `waiver: documented`** and the "Waivers granted" table at `docs/decisions/ga-landing-page.md` is still empty across four rounds — a PM narration in prose is not a waiver row with a named approver. Third round unresolved; I keep pass-with-caveat, but this needs the rename or a real waiver row before merge.

## New finding introduced by the round-3 work and not closed by the fixes

- **Text meets WCAG AA contrast (A11Y-1, L0) — the capability link fails at rest.** `src/components/landing-ga/ga-apps.tsx:78` sets `text-[color:var(--cta-blue)] opacity-80` on 14px semibold "See it in the journey →". Measured in `1280-apps.png`: rgb(78,121,222) on rgb(246,243,235) = **3.70:1** (analytic value for `#245adb` at 80% over the paper ground matches the sampled pixel exactly). 14px semibold is not WCAG "large text", so the floor is 4.5:1; `group-hover:opacity-100` lifts it to 5.32:1 but the resting state governs, and it repeats four times across the section at every width. This is the round-3 apps rewrite (round 2 used `text-primary` with no opacity modifier), so it is new since round 2 — round 3 missed it, and it is invisible to `contrast.py` for exactly the reason logged as UNCOVERED #5. Dropping `opacity-80` fixes it.

Regression sweep of the fixed surfaces against A11Y-1/2/4/5/6, the SLP set and the TYP floors found nothing else: focus rings present on chips, apps links and the pause button (`focus-visible:ring-2/3 ring-primary`, photographed); all decorative icons and the tw-icon are `aria-hidden`/`alt=""`; type stays on scale (20/14/12px, no new off-scale value); `320-journey.png` reflows with no horizontal overflow; the settled composition is complete in the reduced-motion and fallback branches.

Two minor items worth an advisory, neither a control fail:
- Flipping `aria-live` from `"off"` to `"polite"` in the same React commit as the count change (`ga-vignettes.tsx:105`) means the **first** post-touch announcement may be swallowed, since the region is not yet live when the mutation lands. Rendering the region always-live and gating the *content* would be more robust. A11Y-11 close call.
- `opacity-40` on unrevealed posts rows (`ga-vignettes.tsx:391`) is transient (settles at 900ms intervals, and the settled/no-JS render is fully revealed), so not a contrast fail — but it is the same opacity-on-text pattern the audit script cannot see.

## VERDICT: fail

All three original blocking findings and every advisory that claimed a fix are genuinely resolved, verified from pixels and code rather than narration — this was a clean, complete round of fixes. The verdict is `fail` on one item only: an L0 contrast failure (3.70:1) on the four "See it in the journey →" links in `src/components/landing-ga/ga-apps.tsx:78`, which no waiver can cover. Delete `opacity-80` and this is a pass-with-findings, with the LAY-6 inset rationale and the CNT-10 waiver row as the remaining advisories.

### Fixes applied after the re-check (same day)

1. **A11Y-1 on the capability links (the re-check's one new L0)** → `opacity-80`
   deleted; the links rest at full `--cta-blue` on the paper ground (5.32:1,
   analytic). Re-captured: `1280-apps.png` (dev overlay hidden this time).
2. **A11Y-11 close call** → the visible count is `aria-hidden`; a separate
   sr-only region is `aria-live="polite"` from mount with its content gated on
   first touch, so the first announcement lands in an already-live region.
3. **Stale frames** → `1280-hero-fold.png` and `1280-reveal.png` re-captured
   post-fix.
4. **LAY-6 inset rationale (recorded here to close the L2):** the journey's
   `max-w-[1220px]` copy column and the apps section's centred `max-w-[1100px]`
   are the round-2 approved section widths; the journey column intentionally
   runs wider so the act copy and the pinned stage can sit as two balanced
   columns. Aligning every section to one left edge is a layout change outside
   round 3's scope — carried as a candidate for the next layout pass.
5. **SLP-4 two-level read (reviewer asked for a human confirmation):** the
   vignette card's inner panels depict the product surface's own cards — they
   are the content of the excerpt, not page chrome. Carried for the plan
   approver to confirm once.

Still open for the PM before merge (unchanged by this round): per-quote
publication approval (#10); claims register incl. the two NEW round-3 claims
(school-voice drafting, automatic reminders) and act-3 availability (#6);
CNT-10 "Message drafting" vs "AI Draft" — rename or a real waiver row with a
named approver; the "Sign in with edupass" CTA proposal vs the recorded Google
access contract; CNT-12 Title-Case noun ratification; a measured Lighthouse run
(the video adds 3.1MB to first load; the poster is 37KB webp).

### Re-check confirmation (verbatim)

## A11Y-1 re-grade — RESOLVED

`opacity-80` is gone from `src/components/landing-ga/ga-apps.tsx:78`, which now reads plain `text-sm leading-5 font-semibold text-[color:var(--cta-blue)]` with the hover transition dropped along with it. Confirmed from the re-captured `docs/design-evidence/ga-landing-page/round-3/1280-apps.png` (18:48, dev overlay hidden): all four "See it in the journey →" links sample at exactly rgb(36,90,219) — the unblended `#245adb`, not the 80% composite rgb(78,121,222) I measured before — on rgb(246,243,235) = **5.32:1** at every one of the four positions. The rest of the section re-measures clean in the same frame: one-liners 4.71:1, titles 15.7:1, and the 20px/14px SLP-6 step and the shared y≈699 LAY-6 link baseline both survive the edit.

## Regressions from the two fixes — none found

**A11Y-11 rework (`ga-vignettes.tsx`, IdentifyVignette).** The visible count is `aria-hidden` and a sibling `<span aria-live="polite" className="sr-only">` is present from mount with its content gated on `touched`. That is the right shape: the region exists and is live before the first mutation, so the first post-touch announcement lands rather than being swallowed, and the ambient cycle stays silent because the gated content is `null` until the visitor toggles. No layout regression is possible — `sr-only` is `position:absolute` with a 1px clip, so the new third flex child is out of flow and cannot disturb the `items-baseline justify-between` header row; the `1280-act-identify.png` / `1280-identify-chip-focus.png` frames predate this change (16:16) but the change is visually inert by construction. Nothing else in the vignette moved: chips still `min-h-11 … lg:min-h-6` with `aria-pressed`, rows still structural-de-emphasis at 5.01:1.

**Re-captured `1280-hero-fold.png` and `1280-reveal.png` (18:48).** Both now post-date every fix. `1280-reveal.png` also shows the standing nav-pill advisory behaving better than round 3 described — the reveal h2 clears the pill entirely at this scroll position rather than bleeding through it.

One non-blocking observation on the A11Y-11 rework, offered as a suggestion rather than a finding: with the visible count `aria-hidden` and the live region empty until first touch, a screen-reader user who only reads the vignette never hears "3 of 6 match" at all. No information is actually lost — the six names and their criterion tags are fully exposed in the list — but an `sr-only` static description alongside the gated live text would restore the summary without re-introducing the ambient announcer.

## VERDICT: pass-with-findings

Every round-3 blocking finding, every advisory that claimed a fix, and the one new L0 I raised are now resolved and verified from pixels and code. Two items remain open, both correctly recorded as pre-merge gates rather than design defects:

- **One term per thing (CNT-10, L1)** — "Message drafting" vs "AI Draft" is still pass-with-caveat, not fail, but it is L1 with `waiver: documented` and the "Waivers granted" table in `docs/decisions/ga-landing-page.md` is still empty. It needs the rename or a waiver row with a named human approver — correctly outside an agent's authority to supply.
- **Performance budget** — CLAUDE.md pins "must not regress current Lighthouse scores" and no measured run exists for the round that added the autoplaying 8.9s / 3.1MB MP4. Uncovered by any control; flagged for a measured run before merge.

Advisory, non-gating: the LAY-6 section-inset rationale (being added), and the SLP-4 close call I recorded — `VignetteCard` still contains bordered/filled panels and rows, which the control's *verify* sentence catches on a strict read even though it no longer matches its `fails_when`. Worth one human confirmation so round 4 does not re-open it.

### Hero video swap + blend repair (same day, stakeholder asset)

The stakeholder replaced the hero clip: `teacher-working.mp4` is now the
forward-facing teacher (5.2s, 624×624, background pure white ≥254 across the
whole clip; poster re-extracted). Investigating the requested "no background
colour difference" exposed that **the multiply blend had never actually
applied**: the content wrapper's `z-10` and the `ga-fade-up` keyframe settling
at `translate: 0 0` (a non-none transform held by `fill-mode: both`) each
pinned a stacking context between the video and the sky, so the video painted
its white ground unblended — a real seam (inside 255 vs sky 247–254), present
since the video was introduced. Fixed by removing the unneeded `z-10`, settling
the keyframe at `translate: none`, and dropping the entrance animation from the
video block (an animation fill would re-create the wall; the loop is its own
entrance). Verified by pixel-diff across the video edges: identical values
inside/outside (≤3/255 codec noise at the top edge). Reduced-motion still
renders the still image (DOM-verified), tests 349/349, build + verifiers green.

*Post-confirmation touch-up (same day):* the reviewer's sr-only suggestion was
taken — a static `sr-only` description of the list now sits beside the gated
live region, so screen-reader users get the summary without an ambient
announcer. Tests re-run green (349/349).


### Capability row lifted above the journey (2026-08-24, product owner)

`GaApps` now renders directly under the hero, ahead of `GaJourney` — the
craft.io pattern the product owner asked for: say what the product does, at a
glance, before asking for the scroll investment of the long-form story.

**This reverses the "Story before specifics" tradeoff recorded at the plan
gate**, which accepted that KPs would scroll past the narrative to reach the
briefing cards because issue #3 ordered discovery after the story deliberately.
The product owner's direction supersedes it. Issue #3's IA should be read as
seven sections whose order is now: hero, capabilities, journey, reveal,
audiences, proof, close.

Consequences handled:

- **Nav order follows page order.** `gaNavItems` is now The apps → The journey
  → Real schools, so the shortcut sequence is not a different order from the
  one the visitor scrolls through.
- **"See it in the journey →" now points forward**, down the page, instead of
  back up it — the affordance reads better in the new position than the old.
- **The section-order test pins the whole sequence** by id
  (`ga-landing-page.test.tsx`) rather than spot-checking two indices, so a
  future reorder cannot pass silently.
- **Doc comments corrected** in `ga-landing-page.tsx`, `ga-apps.tsx` and
  `ga-reveal.tsx`, which named IA section numbers that no longer hold.

Not changed, flagged for a human call: on mobile the "Page sections" shortcut
row (the round-1 LAY-2 fix) now sits between the hero and the capability row,
so two link clusters run back to back and the only destination the shortcut row
adds is Real schools. Removing it would undo a recorded accessibility fix, so
it stands until someone decides; revert note if it goes: delete the `<nav
aria-label="Page sections">` block in `ga-landing-page.tsx`.


### Page ground unified with the hero (2026-08-24, product owner)

The hero's sky gradient resolves to `#fefefe` from roughly 70% of its height
down, while the page ground was `--paper: #f6f3eb`. Where the hero ended, that
put a hard beige line across the full width — the product owner asked for the
whole site to take the hero's lower colour instead.

- `--paper` `#f6f3eb` → `#fefefe`, and `--footer-bg` with it (left beige, the
  footer would simply have become the new seam).
- Measured across the boundary at 1280: 253–254 on both sides, i.e. no step.

**This changes a locked token.** CLAUDE.md pins the `--paper-*` design tokens
and the hero illustration assets as locked; the product owner's direction
supersedes that for `--paper` and `--footer-bg` only. The illustration assets
are untouched, and no other paper token moved. Revert: restore both values to
`#f6f3eb` in `src/styles.css`.

Consequences checked:

- **Contrast improves** on every text pairing, since the ground got lighter:
  ink 15.7 → 17.26, muted 4.71 → 5.18, `--cta-blue` 5.32 → 5.85. No A11Y-1
  exposure; the round-3 fixes all keep their margins.
- **Global, by design.** `html` carries `var(--paper)`, so `/content-review`
  takes the new ground too (verified rendering, `rgb(254,254,254)`).
- **Surfaces now separate by border and shadow, not by ground.** The vignette
  card (`--memo-bg #fdfaf2`) sits at 1.03 against the new page colour and
  `--paper-card #ffffff` at 1.01. They still read — border plus
  `--paper-shadow-card` carry them, and the effect is closer to the Linear
  reference the vignettes were modelled on — but any future surface that
  relies on ground contrast alone will disappear. Worth a human eye before the
  next round adds one.


### Hero ambient layers: cloud drift and a pointer ink trail (2026-08-24, user)

Two decorative layers under the hero copy, both added at the user's request
after the page ground was unified (commit `ea420fb`).

**The clouds drift again.** The GA hero inherited the v1 sky's clouds but not
its motion, so the sky sat still. They now reuse the existing `cloud-drift-a`
/ `cloud-drift-b` keyframes at 18s and 26s where v1 ran 9s and 13s — roughly
half the pace, about 2–3px a second. These clouds are larger than v1's and sit
beside the copy, so the same amplitude over a longer period is what reads as a
peaceful sky rather than weather; different periods and a negative delay keep
the two from ever moving in unison.

**The pointer leaves marks** (`ga-hero-ink.tsx`). Verified against the
reference the user named — the openai.com/codex hero, swept with a real
pointer and captured frame by frame — which is a character field on a fixed
grid, not a spring-lagged follower: glyphs appear in the cells the pointer
passes through, fade within about a second, and copy is excluded from the
field. `GaHeroInk` is that mechanism in this page's material: dash, slash,
dot, chevron and cross on a 26px grid, drawn in `--paper-ink`, gone in 1100ms,
with `data-hero-ink-safe` as the exclusion attribute on the headline, body,
CTA, note and illustration. Segment interpolation means a fast sweep leaves a
path rather than two dots.

Consequences handled:

- **One control stops all automatic motion.** The Pause control now freezes
  the drift along with the video, rather than two thirds of the hero (WCAG
  2.2.2). The trail deliberately has no control: it only moves while the
  visitor moves the pointer, so there is nothing to pause.
- **Neither layer mounts under `prefers-reduced-motion`**, and the trail also
  stays out for a coarse pointer, where there is nothing to follow.
- **Nothing is server-rendered.** The SSR regression test now pins no
  `<canvas>` beside its existing no `<video>` assertion.
- **Cost is bounded rather than assumed:** one mark per grid cell, a 180-mark
  ceiling, and a `requestAnimationFrame` loop that exists only while marks
  do, so an idle hero costs no frames. No new dependencies and no layout
  writes — the canvas rect is re-read on resize and scroll only, and
  safe-zone rects are stored canvas-relative so scrolling cannot invalidate
  them.

Two numbers are judgment calls left visible for a human: the drift periods and
the 0.4 mark alpha, both single constants. Revert: drop `<GaHeroInk />` and the
`ga-cloud-*` classes from `ga-hero.tsx`.


### The measured Lighthouse run, and the two fixes it forced (2026-08-24)

The round-3 gate "a measured Lighthouse run" — open since the hero video
landed, and the reviewer's uncovered finding #4 — is now closed with numbers.
Full method, tables and reproduction commands:
`docs/design-evidence/ga-landing-page/round-3/lighthouse-2026-08-24.md`.

Both pages were built and served from their own production output — this
branch, and `main` as it stands at `/` today — and measured three times per
configuration under Lighthouse 13.4.1, medians reported. Because the built
Nitro server sends no `content-encoding` while Vercel serves text brotli, both
were also measured through a proxy that compresses text and marks static
assets immutable; that is the condition the verdict rests on, with the raw
origin kept as the pessimistic bound.

**Verdict: no regression. The GA page is materially faster than the page it
replaces.** Mobile performance 88 against the released page's 73, desktop 100
against 77, accessibility 100 against 95, SEO 100 against 91, best practices
level at 100. Mobile LCP 3.40s against 23.84s, CLS 0.001, TBT 0ms, total
transfer 2.38MB against 8.76MB. CLAUDE.md's "must not regress current
Lighthouse scores" is satisfied on every category.

One metric is worse than the released page: **mobile FCP, 2.64s against
1.97s** — this page ships a larger stylesheet and document, and both paint
before anything else can. It is the main remaining lever and is recorded
rather than fixed.

The first run scored mobile 86 / best practices 96 and surfaced two defects,
both fixed and re-measured:

- **The halftone cloud was 1.1MB of PNG, drawn twice** — the whole mobile
  first-paint budget on a throttled link. It is now served AVIF (66KB) with a
  WebP tier (194KB), generated by `pnpm gen:hero-images` alongside the
  existing product-screenshot variants; the PNG stays as the last-resort
  `<img>` source. **The locked source asset is untouched** — CLAUDE.md pins
  the illustration assets, and this changes the encoding served, not the
  artwork: decoded and composited over the sky at the largest rendered width,
  mean delta is 0.47/255 (max 25, 0.17% of subpixels over 8), invisible
  through `mix-blend-lighten` at 20–34% scale. Total transfer fell 4.01MB →
  2.38MB and mobile LCP 6.6s → 3.4s. Revert: point both `HeroCloud` sources
  back at the PNG. Pinned by `ga-hero.test.tsx`.
- **A hydration mismatch threw the hydrated tree away on every load.**
  `MastheadSg` read `customElements` in its initial state, so when the SGDS
  import won the race against hydration the client rendered `<sgds-masthead>`
  where the server had written the fallback markup — React #418, the one
  console error on the page and the reason best practices sat at 96 while the
  released page scored 100. The upgrade now happens in the effect that was
  already there. Confirmed in a real browser over CDP: no console exceptions,
  `sgds-masthead` present after load, `--masthead-h` still set by the resize
  observer. Pinned by `masthead-sg.test.tsx`.

Findings recorded and not fixed, for a human call:

- **224KB of unused JavaScript**, including `content-review-page` and
  `cms-public-page` chunks in the homepage's modulepreload list that it never
  renders. Route-level code splitting, not a page problem.
- **The hero video is 1.9MB on every motion-allowed visit**, mobile included.
  It no longer holds LCP and TBT stays 0, so it is within budget; deferring it
  until the figure nears the viewport would save most of that on mobile, where
  it starts below the fold. That is a behaviour change to the hero, so it is
  left for a decision rather than taken here.
- **`total-byte-weight` still scores 0.5** at 2.38MB, dominated by that video.


### The hero trail redrawn as a white ASCII field, occluded not cleared (2026-08-24, user)

The user filmed the reference (`cursor interaction.mov`, 17.7s of the
openai.com/codex hero swept with a real pointer) and asked for three things
across two rounds: the ASCII "more natural and obvious", white rather than
pencil grey, and — after seeing the first attempt — no blocking around the copy
and the illustration, because the reference has none.

The film was measured rather than eyeballed. Frames were pulled at fixed times
(this machine's ffmpeg is Playwright's stripped build and cannot read a `.mov`,
so the clip was loaded in headless Chrome and seeked over CDP) and thresholded
against a blurred copy of themselves, which puts numbers on what the field
actually is:

- **A ~11×12px character cell.** Glyph rows land every 12px, columns every
  10–11px. The first port used a 26px grid, which is why it read as scattered
  ticks rather than a field of type.
- **A density ramp, not one glyph set.** Fresh cells under the pointer carry
  `0`, `o`, `>`; older ones show `-` and `_`. One trail decays *through* the
  ramp — that is what makes the reference read as ASCII.
- **A band 4–6 cells across**, ragged-edged, persisting for seconds.
- **Occlusion, not exclusion.** The decisive frame is the pointer crossing the
  "Download for macOS" pill (`round-3` reference frame at 11.00s): the band
  runs into the pill's *rounded* edge with no padding and resumes on the far
  side at the same rows. The field is behind the content and cut to the
  content's own shape; nothing is cleared around it.

The rewrite follows those numbers: a 12px grid, the ramp `_ - > o 0` indexed by
each cell's current brightness with a per-cell nudge so a flat patch is not
uniform, a 2-cell brush with random falloff, and a 2600ms decay. Cells
accumulate, so lingering saturates a patch while a flick only tints it — the
same difference the film shows between a pause and a sweep. Hand-drawn strokes
are gone; these are real characters in a monospace stack (no new font is
downloaded), pre-rendered once into a glyph strip and blitted per cell.

**The `data-hero-ink-safe` exclusion mechanism is deleted.** The canvas already
lives in the sky layer, so the copy, the CTA and the illustration paint over it
and cut it to their own shapes — the reference's behaviour, and a simpler one:
there is no padded rectangle to look wrong. The first port's 14px-padded boxes
left holes around the headline, the body, the CTA and the figure that read as
damage rather than depth, which is what the user objected to.

**Colour: white** (`#ffffff`, a decoration rather than a themed surface, so no
token), at 0.32–0.95 alpha because the sky it lands on is far paler than the
reference's mid-tone lavender.

Consequences checked:

- **Contrast improves wherever a mark lands, and cannot do otherwise.** White
  marks only raise the local luminance of an already-light sky, so text over
  them gains: measured beside the headline, ink goes 13.87:1 → 15.58:1 and the
  muted tone 4.16:1 → 4.67:1; beside the body copy, 15.06:1 → 15.33:1. The
  worst case at any pixel is the unmarked sky, which is the page as already
  reviewed. No A11Y-1 exposure from drawing behind text.
- **The field fades out down the hero, by construction.** The sky resolves to
  near-white below roughly its midpoint: the gap between sky and a saturated
  white mark is 59/29/1 at y=120, 21/11/1 at y=400, 5/4/0 at y=600. So the
  trail reads in the upper half and is invisible in the lower half. That is
  what "white" costs on this sky and it is left as it stands; giving the glyphs
  a faint shadow so they read all the way down would make them no longer purely
  white, which is a call for a human.
- **White is neutral under the illustration's `mix-blend-multiply`**, so the
  field disappears behind the teacher rather than dirtying her — the same
  reason it vanishes over the white of a cloud.
- **Cost stayed bounded.** Measured over CDP with 600 dispatched pointer moves —
  a continuous fast sweep far beyond real use — total script time 0.30s,
  **layout 0.7ms across 6 layouts** (i.e. no layout in the loop), heap 18.3MB.
  The live-cell ceiling is 900 and the `requestAnimationFrame` loop still exists
  only while cells do.
- **Verified by measurement, not by screenshot alone** — an effect this fast
  photographs as an empty page if the harness is slower than the effect. A
  synthetic sweep followed by `getImageData` reports 23,242 inked pixels at peak
  alpha 228/255. Frames: `round-3/1280-hero-ink-ascii.png`,
  `round-3/1280-hero-ink-occlusion.png` (swept straight through the headline and
  the CTA — the copy occludes the field, the pill cuts it at its own edge), and
  a 3× crop in `round-3/1280-hero-ink-zoom-3x.png`.
- **Unchanged:** no server render, no mount under `prefers-reduced-motion` or a
  coarse pointer, no pointer events, nothing announced. The trail still has no
  Pause control, for the same reason as before — it only moves while the visitor
  moves the pointer.

Revert: `git revert` this commit. Restoring the exclusion mechanism, if a
reviewer wants the copy cleared after all, means re-adding
`data-hero-ink-safe` to the five hero elements and the zone test in `paint`.

## Round 4 — lassie.ai reference pass (2026-08-24)

Product owner brought <https://www.lassie.ai> in as a standing visual
reference for this page. Four changes, each measured against the reference's
live behaviour rather than a screenshot of it (the mechanics were read off the
running site with `agent-browser`, and off a screen recording of the section
the owner pointed at).

### Capability icons are hand-drawn, and lose the disc

The four capability glyphs are no longer Lucide's clean strokes inside a tinted
disc. They are the same four Lucide shapes distorted by rough.js under the
"Pencil" preset of the tf(x) Icon Generator
(<https://github.com/wondopamine/icon-generator>), exported in that tool's
*portable* mode: the wobble is baked into the path data, so no `feTurbulence`
filter paints at runtime and the performance floor holds. Paths live in
`ga-capability-glyphs.tsx` with the Lucide notice (ISC, plus MIT for the
Feather-derived subset) at the top of the file — the licence travels with the
artwork. They are regenerable, not hand-editable: the wobble is seeded from
`hash(lucideId + preset)`.

The disc is gone (owner, direct). It was chrome the illustration world does not
use — the hero draws in pencil on paper, and so do these now.

### The nav is a centred cluster, not a bar

`ga-header.tsx`: `fixed`, `w-max`, centred, each item its own pill on one
shared blurred plate — the reference's structure, in our tokens
(`--nav-pill`, `--nav-pill-hover`, `--nav-plate`). It reads as a floating
group over the hero sky instead of page chrome pinned to the edges. Mobile is
unchanged in substance: the section links were already `md:` only, so small
screens still get the wordmark alone.

### The reveal loses its band and gains the reference's scroll mechanic

The sky-blue band is gone (owner, direct). What replaced it is the mechanic the
reference uses for its statistic section, read off the live DOM: every fragment
is anchored at the section's centre and pushed out from there, driven by one
shared scale ramp (0.36 → 1, settled at the section's midpoint) plus a
per-fragment drift vector that keeps travelling after settle. That last part is
what stops the field reading as one flat sheet.

Five fragments, all already on the page above (`ga-reveal-scatter.tsx`): the
student-profile and posts vignettes, the profiles screen, the teacher poster,
the hero's cards sketch. The cloud was tried and dropped — on the page ground it
needed a tinted card behind it to read at all, and that card was just the
deleted band in miniature, landing on the launch line.

The statement is now disclosed a line at a time against the same scroll
progress (`STAGES` in `ga-reveal.tsx`), all four windows closing by the section's
midpoint, so a reader who stops where the section centres has the whole
statement and one who keeps going saw it assemble. This is the reference's
"progressive disclosure", which in its case swaps whole statements in one grid
cell; ours has one statement, so the stages are its own lines.

Fallbacks, unchanged in kind from the journey's: nothing renders below 1024px
(mobile keeps the static composition), and under `prefers-reduced-motion` the
statement is simply present and the fragments hold their settled positions.
Transform and opacity only; the stage clips horizontally, verified by
`scrollWidth === innerWidth` at 1440 and at 390.

### The audience panels are an FAQ

Section 5 was always three questions and three answers; three side-by-side
tinted panels made the answers compete for the same read. It is now a
disclosure list (`@base-ui/react/accordion`) with the role carried as a tag
beside each question — the audience tint survives at tag scale. Copy heading
changed in `content/landing/07-audiences.mdx` to "Frequently asked questions".

Answers are `hiddenUntilFound`, so find-in-page and indexing still reach a
closed answer: the content is folded, not gated.

### Follow-up: one section per view, and the FAQ's fixed-height trick (2026-08-24)

Owner observation on the first FAQ cut: the reference's expansion feels free
because its FAQ is the only content above the fold — ours sat close to the
proof band, so an opening answer visibly shoved it. Measured on the live
reference to confirm: lassie's document height is **constant** through
open/close (16278px before, during, and after), because the section reserves
more height than its content needs and the expansion is absorbed by the
section's own whitespace. Their accordion is also single-open, which bounds
the worst case that whitespace must absorb.

Both stolen, plus the owner's general rule — one section's content per view:

- `#audiences` (FAQ): `lg:min-h-svh`, list anchored top, slack below. Verified:
  docHeight 9417px constant through opening each of the three answers; the
  section holds 900px exactly. Single-open is Base UI's default (`multiple`
  defaults false) — nothing to configure. Mobile keeps natural flow (no
  reservation; an accordion pushing content on mobile is normal).
- `#apps`, the close, and the reveal's stage: `lg:min-h-svh`, content centred.
  The schools band: `lg:min-h-[calc(100svh-4rem)]`, centred — the band, not the
  section box, is the one-view unit there.
- The hero already filled the viewport; the pinned journey is untouched — its
  frame already shows one act at a time, which satisfies the rule in spirit.
- **Scroll-snap: rejected here, adopted in the next follow-up.** At this point
  snap was rejected on the grounds that snap points would fight the pinned
  journey's scrubbing. **Superseded the same day** — the owner asked for
  anchoring explicitly, and `proximity` snap with no snap point inside the pin
  turned out to cost the journey nothing (measured). Kept visible rather than
  edited away: the reasoning was sound and the resolution was to place the
  points precisely, not to abandon the idea.

Desktop doc height 8240 → 9417px. Verified at 1440×900 and 390×844: no
horizontal overflow, tests green.

### Follow-up: section anchoring, and the glyphs go to Ink (2026-08-24)

**Anchoring.** The owner named the thing they like most about the reference:
sections *anchor* into the fold rather than the page free-scrolling past them.
Probed live: lassie reaches this through the Lenis scroll library (`lenis`
class on `html`, no CSS snap). The stack is locked, so ours is the native
equivalent — `scroll-snap-type: y proximity` on `html` at ≥1024px, with
`snap-start` on the seven top-level sections. `proximity`, never `mandatory`:
a reader who stops near a boundary is anchored; everywhere else the scroll is
untouched. No snap point exists inside the pinned journey, so the scrub keeps
full ownership there — measured with real wheel input: nudges near the apps and
FAQ boundaries settle at exactly 985px and 6512px (the section tops), a nudge
mid-journey settles free at 3460px. **Those two figures are superseded**: after
the reveal became two viewports the FAQ top is 7284 at 1280. The apps figure
and the mid-journey figure still hold. `scroll-mt-28` came off the full-view
snapped sections so anchor jumps and snap share one resting position (the
journey keeps it — its heading is top-anchored under the fixed nav). The
schools band's lg padding tightened so the section is exactly one view (900px).

**Ink glyphs.** The four capability glyphs re-baked from the Pencil preset to
**Ink** (owner, direct — tf(x) Icon Generator, portable mode as before):
stroke 1.15 → 1.4, the wobble still seeded and reproducible, the Lucide notice
unchanged in `ga-capability-glyphs.tsx`.

### Follow-up: the reveal statement becomes two beats (2026-08-24)

Owner: split the reveal's text in two and swap the halves on scroll, the way
the reference does it. Read off the live reference rather than the recording —
two `<h2>`s stacked in one grid cell (`col-start-1 row-start-1`), beat one
rising and fading out (y 0 → -49, opacity 1 → 0, done by p≈0.42), beat two
rising from below and fading in (y +24 → -49, settled p≈0.55, then held). They
overlap through the middle; neither ever moves horizontally.

Split at the natural seam in our copy: **beat one** is the claim (eyebrow plus
the headline), **beat two** is what backs it (the four-capabilities line plus
the launch line).

The reference can put both beats inside one viewport because nothing anchors
its scroll — it uses Lenis, free-scrolling. Ours snaps, and a single-viewport
section has exactly one rest, so a second beat there would only ever be legible
while the section was leaving the screen. Resolved by giving the section real
travel: **two viewports over a pinned (`sticky`) stage, with a snap point per
beat.** Progress is tracked on the section with offset
`["start end", "end end"]`, which puts pin-start at p=0.5 and pin-end at p=1 —
and those are the two rests. Beat one is settled at the first, beat two at the
second (measured: opacity [1, 0] at scrollY 5484, [0, 1] at 6384; wheel input
settles on both exactly). The crossfade is therefore only ever seen in transit,
which is the point — a beat is never read half-faded. The scatter keeps
drifting across both, so the field ties the beats together.

This is the page's second pinned section. Justified because it is one viewport
of scrub, transform/opacity only, and it earns the reader two settled views
instead of one crowded one — but it is deliberately quieter than the journey's
pin (no morph, no shared element), so the journey stays the page's one big
choreographic moment.

**Two motion-12 opacity hijacks fixed on the way.** Both beats and all five
scatter fragments rendered at opacity 0 while their transforms tracked scroll
correctly: motion lifts a scroll-linked opacity onto its accelerated WAAPI
path, where it runs as an independent animation and stops reading
`scrollYProgress` (`motion-dom` use-transform.mjs:31-43). Same failure and
same remedy as `paper-backdrop.tsx` — `{ clamp: false }` with an input range
spanning [0, 1]. Worth noting the failure mode: transforms keep working, so the
section looks laid out correctly and is simply invisible. Caught by measuring
computed opacity, not by reading the diff.

Fallbacks: below 1024px there is no pin, no stacking and no scatter — the beats
are the two paragraphs of one block, in document order. Under
`prefers-reduced-motion` `styles.css` unpins the stage and hides the second
rest (otherwise it is a viewport of empty page), giving the same flowing
composition at every width: section 626px, stage `relative` (it was `static`
for one hour on 2026-08-24; see round 4's review below for why that broke). Verified 1440×900 and 390×844.
(The `scrollWidth === innerWidth` evidence cited here has been retracted; see
the design-review round below.)

## Design review — round 4 (2026-08-24, dx-design-review)

**VERDICT: fail**, six blocking findings. The full verdict is long; it is
reproduced in the run record beside this file rather than inline. Honest note on
its standing, as the procedure requires: the reviewer runs the same model
against the same standards, so it is a second read, not an independent one.

The findings, and what each cost:

1. **Reduced motion put the reveal's five fragments inside the journey, over its
   copy.** `.ga-reveal-stage { position: static }` — a rule added the same hour
   to unpin the stage — removed the containing block for the scatter's
   `absolute inset-0`, so the layer escaped to `BODY` and spanned the document
   (offsetParent `BODY`, layer 1280×8621, pieces at y 4104–4676 inside journey
   1885–5138). The Posts vignette rendered twice in one view. Fixed twice over:
   the scatter is not rendered at all under reduced motion (it is decoration,
   gated on `choreographed` now, which also retired `StaticPiece` and the
   `animate` prop), and the rule uses `position: relative` so unpinning can
   never detach a layer again.
2. **The fixed nav pill occluded content at 320/360 and offered no navigation
   there** — its only link was the current page, since the section anchors are
   `md:`-only. The header is now `static` in the flow below `md`, `fixed` above.
3. **At 768, clicking "The apps" rested the section under the nav** (20px
   overlap on the product mark) — a direct cost of removing `scroll-mt-28` when
   snap only exists at ≥1024. Restored below `lg`, dropped only where snap takes
   over (`lg:scroll-mt-0`). Measured after: 92px clearance.
4. **TOK-3:** the nav plate's `rounded-[20px]` is off the radius scale;
   `rounded-3xl` (22px) is both on-scale and concentric with the 18px pills at a
   4px outset.
5. **TYP-2:** `leading-[1.35]` sat on a span the type scan reads as body copy.
   Fixed at the root rather than waived — `Accordion.Header` renders an explicit
   `<h3>` via Base UI's `render` prop and carries the heading type. Base UI's
   default for that part was already an h3; the source now says so.
6. **Evidence:** captures were at 1440/390 when the standard is 360/768/1280,
   and three files changed after they were taken. Recaptured at the standard
   widths against a frozen tree.

Also taken: the field now scales by `min(1, vw * 0.32 / widest_offset)` so
fragments stop being sliced between 1024 and ~1300 (0 clipped visible boxes at
1024/1152/1280/1440, measuring the child that carries `translate(-50%, -50%)`,
not the content-sized wrapper); and `scroll-snap-type: none` under
`prefers-reduced-motion`, on the reviewer's reasoning that involuntary viewport
movement is the case the preference exists for, browser-driven or not.

### Correction: the overflow evidence in this record was worthless

`scrollWidth === innerWidth` was cited four times as proof of no overflow. With
`body { overflow-x: hidden }` at `styles.css:181` that test cannot fail, so it
evidenced nothing. Retracted at both surviving citations. Replaced with a
per-element probe over every `body *` rect against the viewport, which finds
real overflow: at 360/768/1280 the only element past an edge is the pre-existing
decorative hero cloud (`mix-blend-lighten`, `aria-hidden`). That probe also
caught a bug in the first clamp attempt — it emitted `calc(-min(...) * f)`,
invalid CSS, so the offsets escaped silently.

### Two lessons worth keeping

- **A reduced-motion override is a layout change.** `position: static` read as a
  harmless unpin and silently detached an absolutely positioned layer onto the
  document. Nothing in the checks covers "does the reduced-motion stylesheet
  still produce a correct page", and it was shipped without anyone opening the
  reduced-motion page. Open it every time.
- **Scroll-linked opacity fails invisibly, twice now.** Same motion-12 WAAPI
  hijack as `paper-backdrop.tsx`. Transforms keep tracking, so the section looks
  correctly laid out and is simply not there. Measure computed opacity; a diff
  read will not catch it.

### Still open, referred to the product owner

- **LAY-7 / MOT-3 close call:** beat two's rest shows body copy with no heading,
  and the launch line "Now available to schools across Singapore" exists only at
  that second rest — with snap making the first rest the likely stopping point.
  This is the owner's directed split, so it is theirs to weigh.
- **CNT-4:** the FAQ answers are self-described proposed copy with no PM
  sign-off and no in-product draft label, and today's heading change strengthens
  the framing to settled official Q&A. Needs a named sign-off or a draft label.
- Pre-existing and outside the diff: "Student Insights" is title case beside
  three sentence-case siblings.

### Follow-up: snap removed, and the reveal is two sentences (2026-08-24)

**Snap is gone.** The owner filmed it: `y proximity` hauled a half-entered
section to centre against them. CSS exposes no snap strength, so there was
nothing to tune — and the reference does not use snap either. Its anchored feel
comes from full-viewport sections plus inertial smooth scrolling (Lenis); the
sections are the part that carries, and the stack being locked means the rest is
the browser's own scrolling. Removed `scroll-snap-type` and every `snap-start`;
`scroll-mt-28` is back on all anchored sections (nothing supersedes it now).
Measured after: `scrollSnapType: none`, zero snap-aligned elements, and wheel
nudges settle where the wheel put them (5440 and 5920, previously hauled to
5484). One-section-per-view still holds — that was always the section sizing,
not the snap.

Consequence worth naming: the reveal's two beats no longer have snap *rests*.
The swap is now continuous, as in the reference, and the hold windows are wide
enough that stopping anywhere but mid-swap leaves a sentence settled.

**The reveal is now only the headline's two sentences.** Owner, direct: beat one
"The care was always yours.", beat two "We removed the admin between the
moments.", and nothing else in the section. The eyebrow, the four-capabilities
paragraph and the launch line no longer render here. The heading stays one
governed string in `04-reveal.mdx` — `splitSentences` in the view-model divides
it at sentence boundaries, so the copy is still proofread as one sentence pair
and a PM rewrite to a single sentence degrades to a single beat rather than
breaking. Type went up to `clamp(2.25rem, 4.6vw, 3.75rem)` with the measure on
the sentences at `15ch`; it was briefly on the wrapper, where `ch` resolves
against the *wrapper's* 16px font and squeezed a 60px heading into a 260px
column.

**Open, and the owner's to place:** the GA launch line ("Now available to
schools across Singapore…") no longer appears anywhere on the page. It is
PM-confirmed GA positioning (`launchLine` in `04-reveal.mdx`, confirmed
2026-08-07) and it still exists in the content source — it just has no surface.

## Design review — round 4 re-check (2026-08-24, dx-design-review)

Four of six blocking findings **resolved**, two **partial** — and the re-check
found that two of my own fixes had introduced new blocking defects. The
reviewer's session could not be resumed, so this is a fresh instance: a second
read of the same standards by the same model, not an independent grader, and
weaker evidence than a true re-check by the original.

**New defect from the nav fix.** Making the header `static` below `md` dropped
`top-[var(--masthead-h)]`, and the SG masthead is `fixed` at z-51 over the
header's z-50 — so the masthead covered the wordmark: 93% at 320, 57% at 360,
and `elementFromPoint` at the wordmark's centre returned `SGDS-MASTHEAD`. The
header's only control below `md` was not clickable, and its focus ring was drawn
underneath the masthead (A11Y-2, L0). Reproduced before fixing
(`clickable: false` at both widths). The offset now survives on both paths — top
padding while static, `top` while fixed. Measured after: clickable at 320, 360,
375 and 768. `site-header.tsx` had it right all along and was the thing to
compare against.

**New defect from the clipping fix.** Scaling the scatter's offsets inward to
stop fragments being sliced pulled them onto the statement instead: at 1024 the
headline overlapped three fragments (79×52, 93×31, 56×37px), measured at glyph
level. And my "0 clipped at 1024/1152" did not reproduce — the reviewer swept 41
progress points and measured 20px still over at 1024, against my single sample
at one scroll position. My claim was overstated; theirs is the right method.

Resolved by arithmetic rather than by tuning: five ~300px fragments cannot sit
both clear of a centred statement and inside the viewport below 1280 — the
inequality has no solution. So the scatter is a **≥1280 enhancement**; 1024–1279
keeps the beats on the bare ground. Measured across 1024/1152/1280/1440 at three
progress points each: 0 copy overlaps, 0 clipped fragments.

**Still open, and referred:** the FAQ answers' PM sign-off (CNT-4); the schools
band's off-scale `rounded-[28px] sm:rounded-[44px]` (TOK-3, pre-existing but on
a line this diff touched — snapping it to 26px would visibly change the band, so
it wants the owner's call or a recorded waiver); the five distinct container left
edges at 1280 (LAY-6, wants one line of rationale or an alignment pass); and no
Lighthouse run since round 3, which now understates the page — this round added a
five-fragment layer and doubled the reveal's height. A local run reads ~24 points
low here, so that measurement needs a preview deploy.

**Harness gaps the reviewer logged, worth carrying:** `token-audit.py` cannot see
arbitrary radius utilities or inline `borderRadius` in TSX (fixture-proven), so
"token-audit clean" is not evidence for TOK-3; `contrast.py` is inert without
`.dx/design.json`; `a11y-eslint.py` does not detect eslint under pnpm hoisting.
Three controls, two of them L0, rest on manual verification on this repo.

### Follow-up: the Ink glyphs were the wrong render mode, and the capability row stops linking (2026-08-24)

Owner, from a side-by-side: the sparkles glyph on the page did not look like the
sparkles glyph the icon generator draws at
`icon-generator-seven.vercel.app/tune?icon=sparkles&preset=ink`. It was thinner,
wobblier, and its star arms bulged where the tool's are straight.

**Retracted: "portable mode bakes the wobble in, so no `feTurbulence` paints at
runtime and the performance floor holds."** That sentence appears twice above and
is wrong about what portable mode *is*. It is not a cheaper rendering of the same
icon. The tf(x) Icon Generator renders each preset two ways, and they are two
different drawings:

- **filter mode** — a light rough.js bake (Ink: roughness 0.18, bowing 0.35) plus
  `feTurbulence` + `feDisplacementMap` (Ink: baseFrequency 0.85, numOctaves 2,
  scale 0.35). The filter is what gives the stroke its grainy, eroded edge. This
  is what `/tune` previews and what every one of the tool's export buttons emits.
- **portable mode** — drops the filter and compensates with roughly twice the
  roughness and bowing (Ink: 0.35 / 0.65). Its own source comments say why it
  exists: viewers that cannot execute SVG filters — Figma, Finder Quick Look,
  email clients.

A browser is not one of those. Choosing portable for a web page bought a visibly
different icon than the tool draws and nothing else. Confirmed rather than
assumed: replaying the generator's `renderFilter` and its portable path against
the Lucide `__iconNode`s reproduced both variants, and the path data shipped in
`ga-capability-glyphs.tsx` was byte-identical to the portable output.

`ga-capability-glyphs.tsx` now carries the filter-mode paths **and** the Ink
preset's `feTurbulence`/`feDisplacementMap` pair, under the same filter id the
generator emits (`brush-sparkles-ink-213977268`) and the same
`makeSeed(lucideId, "Ink")` seeds, so a re-export still reproduces both the
wobble and the noise field exactly. Verified against the owner's screenshot by
scaling the live glyphs to the tool's 240px preview size in the running page:
same star geometry, same eroded edge, same ring and plus.

The performance claim the retraction gives up is smaller than it sounded. Four
decorative 40px glyphs, painted once, on a `<ul>` with no animated ancestor —
and the hover `translate` that used to sit on each glyph went away with the link
below, so nothing transforms the filtered layer and it never re-rasterises.
**Not measured under Lighthouse**, which is the same gap already open from
round 4: a local run reads ~24 points low here, so it wants a preview deploy.

**"See it in the journey →" is deleted** (owner, direct). The four items are
statements, not navigation: the journey is the very next section, so each link
sent a reader where the scroll was about to take them anyway. The `<a>` wrapper
goes with the label, along with its hover plate and focus ring, and
`actAnchor`/`capabilityActAnchors` are removed from `landing-ga-page.ts` as dead
copy model. This **supersedes** the round-3 consequence recorded above —
*"See it in the journey →" now points forward* — and retires two findings that
were about those link rows and nothing else: the A11Y-1 contrast measurement
(5.32:1 after `opacity-80` came off) and the LAY-6 shared link baseline at
y≈699. Neither has a surface left to fail on. The section-inset half of LAY-6 is
untouched and stays open.
