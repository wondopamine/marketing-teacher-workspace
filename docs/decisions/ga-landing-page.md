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

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| — none — | | | | |

**Calibration notes (not waivers):**

- **COL-1:** primary actions use the repo's locked brand token `--cta-blue #245adb`, not the harness table's TW `#0064FF`. The visual system is locked by CLAUDE.md; drift flagged here, not changed.
- **TYP-1/TYP-3 (memo card, wordmark):** the extracted v1 `MemoCard` keeps its shipped sizes (22/15/13px) and the header wordmark its 13px two-line lockup — registered v1 conventions under the locked visual system; drift flagged, not restyled. The memo numeral did change `font-mono` → Inter `tabular-nums` (revert: restore `font-mono` class in `memo-card.tsx`).
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

- **Screenshots:** `docs/design-evidence/ga-landing-page/` — 1280 (hero, act-promise, act-next-steps, act-words, act-family, reveal, apps, audiences, schools, close), 768 (hero, journey stacked), 360 (hero, schools), 320 (reflow), reduced-motion at 1280 (hero, journey), focus states (skip link, nav).
- **CMP-3 evidence:** N/A — no async actions on the page.
- **Token block line range:** tokens live in `src/styles.css:100–135` (pre-existing); no new raw values outside it.
- **Dark mode:** N/A — the public landing page has no dark mode (the paper world is deliberately light; no theme toggle on the marketing site).
- **Verification ledger:**

  | Control | Method | Evidence |
  |---------|--------|----------|
  | TOK-1..3 | script | `checks/token-audit.py` clean on `landing-ga/`, `landing-ga-page.ts`, `memo-card.tsx` |
  | A11Y-1 | script + manual | `checks/contrast.py --tokens src/styles.css` clean; ink #1a1a1a / muted #5f6f76 on paper grounds inspected in frames |
  | A11Y-2 | script + manual | `checks/a11y-static.py` clean; tab traversal operated — skip link and nav focus rings photographed |
  | A11Y-5 / MOT-3 | manual | reduced-motion frames: stacked presentation, no animation, zero information loss |
  | A11Y-6 | manual | captures `aria-hidden` inside labelled `role="img"` figures; decorative sketches `aria-hidden` |
  | A11Y-7/9/10 | manual | accessibility snapshot: skip link first, landmarks, h1→h2→h3 hierarchy, GA title from 01-meta.mdx |
  | TYP-1 | script | `type-scan --rules TYP-1` clean after mono→Inter fix |
  | TYP-2/3 | script + manual | remaining findings are headings / inherited v1 memo sizes (calibration notes above) |
  | CNT set | script + manual | `content-lint` findings triaged (false positives + one deliberate line, above); copy proofread |
  | CMP-1 | asserted | no manifest — composed from existing repo components (Button, RevealOnScroll, MemoCard, SiteFooter, MastheadSg, SkipLink) |
  | CMP-5 | test | `ga-landing-page.test.tsx` asserts exactly one filled primary ("Sign in with Google") |
  | LAY-2 | manual | 320px frame: single column, no horizontal scroll |
  | SLP-1..9,11 | manual | no gradients/glow/nested cards; apps grid cells are interactive links with distinct evidence |
  | Output isolation | script | build-time `verify-content-review-public-output.mjs` + `verify-content-review-routes.mjs` clean; unpublished quotes, internal ids, reviewer notes absent from public bundle (public-safe module + sync test) |
  | Suite | script | 347/347 vitest, tsc clean, production build green (`pnpm lint` broken pre-existing — eslint not a direct dep on either lineage) |

- **Evaluator verdict:** _pending — dx-design-review dispatch below._

## Ratchet

_To be completed at Phase 6 after the review verdict and user acceptance._
