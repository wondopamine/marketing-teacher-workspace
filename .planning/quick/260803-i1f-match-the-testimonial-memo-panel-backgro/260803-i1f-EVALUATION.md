# Independent Visual Evaluation

**Overall verdict: PASS WITH FLAGS**

The testimonial memo field now matches the supplied reference blue exactly. The locked value is `#92CAEB` / `rgb(146, 202, 235)` in the semantic token, the same exact RGB is present as the dominant blue in every after capture, and the previous `#CFE6FF` field is no longer rendered. The two implementation commits are narrowly scoped: one token-value replacement and one local, AA-required intro-colour correction. No blocking regression was found.

The flag is an evidence-quality limitation rather than a product defect: the 1280px before capture has a Flow Tuner overlay and a different vertical scroll position, while the 360px after capture places the sticky navigation over the first heading line. Source history proves that neither layout nor heading markup changed in the evaluated commits; the 360px frame is therefore used for field-colour and card-stacking evidence, while the 768px and 1280px frames provide the full-heading comparison.

## Evidence reviewed

- Target reference: `/var/folders/97/5tm4ps7n7q9_bvl7t0ss0j1r0000gn/T/codex-clipboard-09d0304e-acd9-4bb2-bb0c-5c06d4363224.png` (2104x512), inspected at original resolution with `view_image`. Pixel-frequency inspection identifies `#92CAEB` (`146, 202, 235`) as the dominant blue, with 594,539 exact pixels.
- Before: `/private/tmp/tw-testimonial-before-1280.png` (1280x900), inspected at original resolution with `view_image`. Its prior field colour is exactly `#CFE6FF` (`207, 230, 255`), with 210,282 exact pixels. The frame contains a Flow Tuner overlay and is vertically offset relative to the after frame.
- After 360: `/private/tmp/tw-testimonial-after-360.png` (360x900), inspected at original resolution with `view_image`. It contains 61,022 exact `#92CAEB` pixels and preserves the single-column memo-card stack.
- After 768: `/private/tmp/tw-testimonial-after-768.png` (768x900), inspected at original resolution with `view_image`. It contains 170,006 exact `#92CAEB` pixels, the full heading and intro, and the single-column card layout.
- After 1280: `/private/tmp/tw-testimonial-after-1280.png` (1280x900), inspected at original resolution with `view_image`. It contains 481,137 exact `#92CAEB` pixels, the full heading and intro, and the three-column card layout.
- `src/styles.css`: `--memo-section-bg: #92CAEB` is defined once at the semantic token layer.
- `src/components/landing/schools-today.tsx`: `#schools > div` still consumes `bg-[color:var(--memo-section-bg)]`; the intro alone uses `var(--paper-ink)` at 70% opacity.
- Git commits `a916755` and `a0d848a`, inspected with `git show`, `git diff`, `git diff --check`, and `git blame`. Across both commits there are exactly two one-line replacements in two files: the field token and the intro text colour utility. There is no tracked working-tree diff.
- Quick plan and summary under `.planning/quick/260803-i1f-match-the-testimonial-memo-panel-backgro/`, including the documented accessibility deviation.
- TFX standards catalog and relevant detail files under `/Users/jeongwondo/.claude/plugins/cache/tfx/tfx/0.7.0/standards`.
- Read-only checks: `token-audit.py` passed; `a11y-static.py` passed; `contrast.py --tokens src/styles.css` passed. Manual WCAG calculations independently confirm the visible text ratios listed below.

## Control-by-control table

Verdicts are scoped to this colour-polish delta and its rendered consequences. Pre-existing, explicitly locked typography, spacing, radius, motion, and layout are assessed for regression rather than retroactively widened into this task.

| Control | Verdict | Evidence / rationale |
|---|---|---|
| A11Y-1 | PASS | Intro copy composites to `rgb(62, 79, 89)` over `#92CAEB` and measures 4.81:1, clearing the 4.5:1 body-text floor at both 16px and 18px. Heading ink is 9.84:1. On the cream cards, ink is 16.69:1, 85%-ink body copy is 10.60:1, and muted metadata is 5.01:1. `contrast.py` also exits cleanly. |
| A11Y-2 | N/A | Independent source enumeration finds no actionable control inside `#schools`: no links, buttons, inputs, click actions, or focusable custom roles. The `motion.article` mouse movement is presentation-only tilt, not an activation path. Navigation visible above the section is outside the declared surface. |
| A11Y-3 | N/A | The scoped section contains no form fields and no icon-only controls requiring a label. `a11y-static.py` exits cleanly. |
| CMP-2 | N/A | The testimonial panel exposes no destructive action or data-changing flow. |
| TOK-1 | PASS | The target literal occurs exactly once under `src/`, at `src/styles.css:110`; component markup contains only `var(--memo-section-bg)`. The intro correction also uses semantic `var(--paper-ink)`. `token-audit.py` passes. |
| TOK-2 | PASS (scoped) | Neither commit changes margin, padding, or gap. Existing spacing utilities and responsive spacing remain byte-for-byte unchanged; the token audit reports no changed-scope violation. |
| TOK-3 | PASS (scoped) | Neither commit changes radii. The field and all memo-card corners visually retain their prior shapes at 360/768/1280. |
| TYP-1 | PASS (scoped) | No font family or weight changes. The colour-only intro edit preserves its prior typography. The baseline `font-mono` memo-number finding from `type-scan.py` predates this task (blamed to `f81a3bcf`) and is excluded by the locked typography scope. |
| TYP-2 | PASS (scoped) | No font size or line-height changes. Intro remains 16px/1.7 at 360 and 18px/1.7 from 768 upward; card type remains unchanged. Baseline scanner findings for the existing 12px memo number and 13px school caption predate this task and are excluded rather than attributed to this colour change. |
| TYP-3 | PASS (scoped) | No type-size token changed. Baseline scanner findings for existing 22px, 15px, and 13px card text are all on unchanged lines introduced by `f81a3bcf`; they are recorded as scope exclusions, not regressions. |
| TYP-4 | PASS | No all-caps transform or non-acronym all-caps copy is present or introduced. `FAS`, `SEN`, and `LTA` are genuine acronyms. The type scan reports no TYP-4 finding. |
| TYP-5 | N/A | `Note · 01/02/03` are static standalone labels, not a numeric column, table, counter, timer, or in-place updating value. |
| COL-1 | N/A | The changed sky field is a decorative reference-matched surface, not a primary action or product-primary brand control. No scoped CTA or cross-product primary colour is introduced. |
| COL-2 | N/A | The change introduces no success, warning, danger, or info state. The reference sky blue is decorative and conveys no functional status. Existing tape colours are unchanged and outside the locked colour delta. |
| SLP-1 | PASS | The field is a flat light sky blue. There is no purple/violet gradient, cyan-on-dark treatment, or glow accent. Card shadows remain restrained and unchanged. |
| SLP-2 | PASS | Heading, intro, and memo copy use solid semantic text colours; there is no gradient text. |
| SLP-3 | PASS | Memo cards have a subtle 1px border and top tape; there is no thick side-tab accent border. |
| SLP-6 | PASS (scoped) | The title remains clearly dominant over the intro at all reviewed widths, and memo quote/body/byline hierarchy remains visibly differentiated. No type size changed or hierarchy flattened. |
| SLP-7 | PASS (scoped) | Related title/intro and memo content remain grouped more tightly than the larger separation between section intro and cards. Responsive gaps and internal card rhythm are unchanged. |

### Baseline typography exclusion

For transparency, the full-file TFX type scan reports pre-existing findings at `schools-today.tsx:194`, `:197`, `:200`, and `:206` (`font-mono`, 12px/13px floors, and 22px/15px/13px off-scale values). `git blame a916755^` attributes all four lines to `f81a3bcf` from 2026-05-05, and the evaluated diff changes none of them. The task explicitly locks typography sizing and requests no findings outside the colour-only change, so these are not graded as regressions or ship blockers here.

## Visual comparison findings

1. **Exact field-colour match — pass.** The reference and all three after frames contain the exact target pixel `#92CAEB`; the old 1280 frame contains `#CFE6FF`. The source token and the summary's browser-computed style agree on `rgb(146, 202, 235)` at all widths.
2. **Hierarchy and legibility — pass.** The darker sky field gives the panel more visual presence without overtaking the cream memos. The heading remains the primary entry point; the 70%-ink intro is visibly supporting text while clearing AA at 4.81:1. Cream cards, tape, quote/body/byline hierarchy, and copy remain unchanged.
3. **Responsive continuity — pass within capture limits.** At 1280 the three memo cards remain in one row; at 768 and 360 they remain a single-column stack. Field insets, card widths, tape centering, cream surfaces, and copy reflow are coherent with no horizontal clipping. At 360 the sticky navigation occludes the first heading line because of the capture's scroll position, so that frame is not used to grade complete heading visibility; 768 and 1280 show the full heading.
4. **No unintended implementation change — pass.** `a916755^..a0d848a` changes only `--memo-section-bg` and the intro colour utility (one insertion/one deletion in each file). Memo card markup, tape tokens, copy, typography sizing, spacing, radii, motion constants, event behavior, and other sections are untouched.
5. **Plan fidelity — pass with documented necessary deviation.** The token change follows the approved plan exactly. The extra component-line change in `a0d848a` is the summary's documented accessibility correction caused by the darker locked background; it is local, semantic, and necessary to satisfy A11Y-1 rather than unrelated scope drift.

## Blocking issues

None.

## Non-blocking flags

- **Capture comparability:** the 1280px before image is partly covered by a Flow Tuner overlay and uses a different vertical scroll offset, and the 360px after image has the sticky nav over the first title line. This limits pixel-for-pixel before/after layout comparison but does not indicate a changed-code regression. The two-line commit diff, 768/1280 full-heading frames, and all three responsive card layouts provide sufficient evidence for this narrow colour change. A clean, identically scrolled before/after pair would improve archival evidence but is not required to accept the implementation.

## Final recommendation

Accept and ship the colour-polish change. The memo field is an exact reference match, the target literal remains correctly owned by the semantic token, the intro correction restores WCAG AA contrast, and no in-scope visual or implementation regression is present. Optionally recapture the evidence set at matched scroll positions without overlays if a strict visual-regression baseline is desired.
