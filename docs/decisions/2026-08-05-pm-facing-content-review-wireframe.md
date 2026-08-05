# Design decision record — PM-facing Teacher Workspace landing wireframe

- **Date:** 2026-08-05
- **Product:** TW
- **Change type:** modification
- **Page type:** marketing landing-page wireframe; no standard product-page template fits
- **Run type:** attended
- **The teacher and the moment:** Product, policy, security, and content reviewers need to judge the proposed teacher-facing story before themed design begins.

## Sprint contract (done-criteria)

1. `/content-review` reads as a real low-fidelity landing page rather than a code-like information-architecture ledger.
2. The page uses canonical public-safe content in the accepted order: hero, positive-growth story, reveal, capabilities, explorer, audiences, proof, access and support, close, and footer.
3. Undecided audience, proof, GA-line, support, and explorer-placement content stays visibly pending. No testimonial, internal name, identifier, or restricted source is invented or exposed.
4. The presentation stays greyscale and share-safe, with no media, motion, live CTA, product simulation, analytics, or JavaScript interaction.
5. The route reflows at 360, 768, and 1280 pixels with one main landmark, one H1, semantic section order, and no route-local interactive controls.
6. The public `/` route remains unchanged. `/content-review` stays unlinked, `noindex, nofollow`, and behind the validated public-safe server DTO boundary.

## Chosen approach

Build `/content-review` as a route-local, greyscale landing-page wireframe populated from a whitelist projection of the server-owned review state. The public copy reads in the shape of a real marketing page. Review metadata moves into a subordinate PM-notes region after the proposed landing-page flow.

The route-facing DTO carries only copy, explicit pending labels, static action labels, PM-note summaries, and a generic metadata status. Review references, snapshots, reviewer context, aggregate artifacts, hashes, unused synthetic-data fields, and destination URLs remain server-only and are rejected by built-response checks if they enter SSR hydration.

The wireframe shows two CTA placements as inert affordances in the hero and closing regions. The accepted explorer is a static three-step sequence. Audience, proof, GA-launch, support, and placement decisions render as explicit pending slots.

The existing public homepage, shared masthead, content registry, validation, snapshot model, and route-facing server boundary remain unchanged.

## Rejected options

- **Keep the semantic review document only** — it exposes the content model but does not let PMs judge the hierarchy and pace of a landing page.
- **Build a branded interactive prototype now** — it would mix content review with unresolved visual and interaction decisions.
- **Replace the public `/` route during review** — it would disturb the website already deployed to the public.

## Tradeoffs, named

The wireframe sacrifices visual polish, production navigation, and behavioural fidelity. That is acceptable because its purpose is to align PM, policy, security, and content reviewers without implying that branding or interaction has been approved.

The route remains unauthenticated so every browser-visible value must be safe for public retrieval. `noindex` and the unlinked route reduce discovery but do not provide access control.

## Controls in scope

- Accessibility: A11Y-1, A11Y-2, A11Y-3, A11Y-4, A11Y-5, A11Y-6, A11Y-7, A11Y-9, A11Y-10.
- Tokens, colour, and type: TOK-1, TOK-2, TOK-3, COL-1, COL-2, TYP-1, TYP-2, TYP-3, TYP-4, TYP-5.
- Content: CNT-2, CNT-3, CNT-4, CNT-5, CNT-6, CNT-7, SLP-9.
- Components and composition: CMP-1, CMP-5, CMP-7, SLP-5, SLP-8, SLP-10, SLP-11.
- Layout: LAY-3, LAY-7.

CMP-2 and CMP-3 are not in scope because the wireframe has no destructive or asynchronous action. Motion controls apply only as a prohibition: the route introduces no motion.

## Waivers granted

| Control | Tier | Reason              | Approver | Where recorded |
| ------- | ---- | ------------------- | -------- | -------------- |
| None    | —    | No waivers required | —        | —              |

## Plan approval

- **Approved by:** Designer and workspace owner
- **Approved on:** 2026-08-05 — “ok let's do it now. I consider this wireframe as a comm tool for PMs”

## Verify verdict

- **Screenshots:**
  - `/private/tmp/tw-wireframe-evidence/content-review-360.png` — 360 × 900 viewport; full page; document scroll width 360.
  - `/private/tmp/tw-wireframe-evidence/content-review-768.png` — 768 × 1024 viewport; full page; document scroll width 768.
  - `/private/tmp/tw-wireframe-evidence/content-review-1280.png` — 1280 × 900 viewport; full page; document scroll width 1280.
  - `/private/tmp/tw-wireframe-evidence/public-home-1280.png` — existing public homepage isolation check.
- **CMP-3 evidence:** N/A — no asynchronous state or interaction exists in the wireframe.
- **Token block line range:** `src/styles.css:19-22` — the route adds an Inter body token while retaining Plus Jakarta Sans for headings and the existing public homepage default. The Inter font-face import is route-local in `src/routes/content-review.tsx:1-2`.
- **Dark mode:** N/A — the review route has no user-facing theme toggle and does not claim dark-mode support.
- **Component inventory:** Shared `SkipLink` and `MastheadSg`; route-local status banner, wireframe header, hero and product placeholder, five-step story, reveal, capability rows, static explorer, audience rows, proof slot, access and support, close, inert footer, PM review notes after the footer, and the fail-closed `ContentReviewError` branch. Both ready and error branches have zero route-local interactive controls.
- **Live DOM evidence:** zero route-local links or buttons; two locally labelled static CTA placements; one main; one H1; ten wireframe regions in the accepted order; PM notes immediately after the landing footer. Computed typography is Inter for body/UI, Plus Jakarta Sans 600 for headings, and weight 400 for story numerals. The complete live document contains none of the prohibited review fields, hashes, references, or unused destinations.
- **Automated project checks:** 168 tests passed; TypeScript, ESLint, the full production build, route-and-error component checks, and the harness detector passed. The production postbuild scanners inspect the content-review client chunk and built SSR response, including hydration, while confirming `/` isolation.

- **Verification ledger:**

  | Control | Method          | Evidence                                                                                                                                                                                                                        |
  | ------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | A11Y-1  | script          | Harness `detect.py --all --tokens src/styles.css` found no contrast or token findings across the ready and error components; inherited contexts were inspected in the 360/768/1280 screenshots.                                 |
  | A11Y-2  | script          | `a11y-static` passed through the harness detector; source, tests, and live DOM inspection found no route-local interactive controls in either render branch.                                                                    |
  | A11Y-3  | script          | `a11y-static` passed; the route adds no form control or icon-only control requiring a name.                                                                                                                                     |
  | A11Y-4  | manual          | The complete ready-and-error interaction inventory is empty, so there is no route-local hit target to measure.                                                                                                                  |
  | A11Y-5  | manual          | Source and live render contain no route-local animation or transition.                                                                                                                                                          |
  | A11Y-6  | manual          | Source, tests, and rendered DOM contain no image, video, canvas, or meaningful icon. Placeholder geometry is CSS and decorative.                                                                                                |
  | A11Y-7  | manual          | Accessibility snapshot confirms one H1, ordered H2/H3 regions, semantic ordered lists for story and explorer, and no skipped heading level. The fail-closed branch has one H1 and no partial story.                             |
  | A11Y-9  | manual          | Live document title is “Teacher Workspace landing wireframe — Draft”; shared root retains its language declaration.                                                                                                             |
  | A11Y-10 | manual          | Live accessibility snapshot exposes “Skip to main content”; the target is the single `main#main`.                                                                                                                               |
  | TOK-1   | script          | Harness token audit passed across all route components, including the fail-closed branch, with semantic tokens and no raw component colour.                                                                                     |
  | TOK-2   | script          | Harness token audit passed with on-scale spacing.                                                                                                                                                                               |
  | TOK-3   | script          | Harness token audit passed; the wireframe introduces no decorative radius system.                                                                                                                                               |
  | COL-1   | manual          | Greyscale is an explicit wireframe constraint; primary-looking static actions use semantic foreground/background tokens consistently.                                                                                           |
  | COL-2   | script          | Harness token audit found no Tailwind palette bypass after semantic-token remediation.                                                                                                                                          |
  | TYP-1   | manual          | Harness type scan passed; live computed styles confirm route-local body/UI in Inter 400/500/600 and headings in Plus Jakarta Sans 600.                                                                                          |
  | TYP-2   | manual          | Harness type scan passed; multiline body copy resolves to 1.5–1.6 line-height ratios.                                                                                                                                           |
  | TYP-3   | manual          | Harness type scan passed; headings use the published 20/24/32/48/72px scale steps.                                                                                                                                              |
  | TYP-4   | script          | Harness type scan passed; ready and error labels remain sentence case with no text transform.                                                                                                                                   |
  | TYP-5   | manual          | Story and capability step numbers use `tabular-nums`; story numerals resolve to approved weight 400.                                                                                                                            |
  | CNT-2   | script          | Only Teacher Workspace and approved public capability labels appear; internal capability brands, review identifiers, snapshots, hashes, and unused destinations remain denylisted in the built client and SSR hydration output. |
  | CNT-3   | script          | Harness content lint passed; canonical and fail-closed copy use direct, active language.                                                                                                                                        |
  | CNT-4   | manual          | Product placeholders carry placeholder treatment and the explorer states that it uses synthetic classroom information only.                                                                                                     |
  | CNT-5   | script          | Harness content lint found no device-bound action instruction.                                                                                                                                                                  |
  | CNT-6   | script          | Harness content lint found no low-information opener or filler finding.                                                                                                                                                         |
  | CNT-7   | manual          | Hero, story, capability, and close copy lead with the teacher value before the mechanism.                                                                                                                                       |
  | SLP-9   | script          | Harness content lint found no AI-writing-tell finding; manual review found no redundant label/helper pattern in public copy.                                                                                                    |
  | CMP-1   | manual          | Asserted, no manifest. Existing semantic HTML and route-local composition are used; no new component primitive or parallel library is introduced.                                                                               |
  | CMP-5   | manual          | Exactly two locally labelled static primary-action placements appear, one in the hero and one in the separate closing region. Neither is a control.                                                                             |
  | CMP-7   | manual          | The intentionally neutral wireframe uses semantic HTML and default token behaviour without bespoke interaction styling.                                                                                                         |
  | SLP-5   | manual          | Sections use a narrative sequence, divider-based rows, one step sequence, and deliberate pending slots rather than one repeated generic card grid.                                                                              |
  | SLP-8   | manual          | No bounce, animation, or decorative motion exists.                                                                                                                                                                              |
  | SLP-10  | manual          | The multi-section review is a full route, not a modal or constrained overlay.                                                                                                                                                   |
  | SLP-11  | manual          | Static information is grouped with headings, whitespace, dividers, and lists; boxes are reserved for screen placeholders and pending decisions. PM review notes sit outside the landing flow after its footer.                  |
  | LAY-3   | manual          | The declared type is a marketing landing-page wireframe; no standard product-page template matches this communication artifact.                                                                                                 |
  | LAY-7   | manual          | Hero promise and first static CTA are the clear focal region before supporting narrative sections.                                                                                                                              |

- **Evaluator verdict (verbatim):**

    VERDICT: pass

    BLOCKING (must fix before ship):
    - None.

    ADVISORY (should fix):
    - None.

    SUGGESTIONS (not violations):
    - Add a 360px screenshot of the validation-error branch to the evidence pack so both ready and recovery states have visual evidence.
    - Preserve the explicit “Static CTA placement” and “Feedback link placement” labels until interaction work is formally approved.

    ## CONTRACT ASSESSMENT

    1. **MET — Real low-fidelity landing page.** `/content-review` renders a recognisable landing page with hero, narrative, product frame placeholders, content sections, close, and footer—not an IA ledger.
    2. **MET — Required content order.** The page follows hero → five-step positive-growth story → reveal → capabilities → static explorer → audiences → proof → access/support → close → footer. PM notes follow outside the footer.
    3. **MET — Pending decisions and public safety.** Audience, proof, product-reveal, support, and related decisions are visibly marked pending. Internal names, review IDs, snapshots, source references, private destinations, and superseded story material are absent from the complete SSR response and hydration payload.
    4. **MET — Greyscale communication artifact.** The route uses semantic greyscale tokens, static skeleton frames, no product media, no route-local motion or JavaScript interaction, and two clearly labelled inert CTA placements.
    5. **MET — Responsive and semantic.** Captures at 360, 768, and 1280 show coherent reflow without visible clipping. The built output contains exactly one `main`, one `h1`, descriptive sections, lists, and definition lists.
    6. **MET — Isolated draft route.** `/content-review` is `noindex, nofollow`, has no canonical/social-image metadata, is not linked from `/`, and is backed by a public-safe DTO. The public homepage remained visually and structurally isolated.

    ## PLAN FIDELITY

    Full fidelity. The implementation remains route-local, keeps the public homepage intact, uses canonical content through a validated server projection, renders static CTA labels instead of destinations, and places PM-only publication notes after the proposed public footer.

    ## COMPONENT INVENTORY

    - Shared root chrome: `SkipLink` and `MastheadSg`, rendered by `RootDocument`; verified as preserved shared chrome and excluded from the route-local greyscale/component redesign boundary.
    - Route/data boundary: `ContentReviewRoute` → `getContentReviewPageData()` → safe `buildContentReviewPageDto()`.
    - Ready view: `ContentReviewPage`, `ContentReviewOutline`, hero, connected story, reveal, capabilities, explorer, audiences, proof, access/support, close, footer, and `ContentReviewAppendix`.
    - Error view: `ContentReviewError`.
    - Route-local interactive controls: **0**.
    - Deliberately inert placements: **2** CTA spans labelled “Static CTA placement”; **1** footer feedback span labelled “Feedback link placement”.
    - Decorative wireframe frames are marked `aria-hidden`.

    ## BOUNDARY VERIFICATION

    - The route imports only the safe server function; boundary tests reject use of `buildContentReviewAnnotatedPageDto`.
    - The wireframe DTO reconstructs actions as `{ label, note, purpose }`; it carries no `href`.
    - The public appendix projection retains only the synthetic-data rule and drops `prohibitedData`.
    - Recursive DTO tests reject review keys, snapshots, owner/reviewer fields, concerns, blockers, internal identifiers, hashes, and unused destinations.
    - The built-handler check scans the complete SSR HTML, including hydration data, and passed.
    - Public-output scanning passed across 6 generated files and the content-review client chunk.
    - Independent focused verification passed: 4 files, 34 tests.
    - TFX detector passed all 5 available checks with no findings.

    ## QUALITY GRADES

    - **Design quality — strong:** The hero establishes the page proposition, and the narrative-to-capability sequence gives PMs a clear reading order.
    - **Originality — strong:** The composition is purposefully editorial and restrained without introducing novelty inappropriate for a low-fidelity review tool.
    - **Craft — strong:** Typography, spacing, semantic structure, responsive states, pending-copy treatment, and validation failure state are deliberate and consistent.
    - **Functionality — strong:** The artifact completes its communication task without pretending unavailable interactions or exposing implementation-only review data.
    - **Dark mode — N/A:** No dark-mode experience is exposed or required for this wireframe.

    ## JUDGMENT CONTROL NOTES

    - **A11Y-7 pass** — One descriptive H1, sequenced H2/H3 hierarchy, an ordered story list, semantic lists and definition lists, and descriptive section labels.
    - **COL-1 pass-with-caveat** — There is no live primary action or product-brand moment; black CTA blocks are explicitly labelled inert placement markers under the approved greyscale contract.
    - **TYP-5 pass** — Story and capability sequence numbers use `tabular-nums`; there are no live updating figures.
    - **CNT-2 pass** — “Student insights”, “Message drafting”, “Posts”, and other labels use teacher-facing language; internal agent and capability names are absent.
    - **CNT-3 pass** — Copy is active, direct, and concise; automated content lint is clean.
    - **CNT-4 pass** — The classroom story and product screens are explicitly illustrative/synthetic, and proof awaiting approval remains visibly pending.
    - **CNT-5 pass** — Action wording names outcomes such as “Sign in with Google”; no device-bound instructions appear.
    - **CNT-6 pass** — No empty openers or filler materially weaken the visible copy.
    - **CNT-7 pass** — Section introductions lead with teacher value and purpose before describing product mechanics.
    - **CMP-1 pass** — The route uses semantic primitives for a non-interactive communication artifact; no existing stack component is bypassed for a comparable need.
    - **CMP-5 pass** — No live primary buttons exist; the two CTA mock placements occur in distinct regions and are explicitly inert.
    - **CMP-7 pass** — Semantic tokens and repeated wireframe primitives are consistent; no route-local control group or unexplained design-system override exists.
    - **SLP-9 pass** — No marketing buzzwords, chatbot phrases, forced triads, em-dash chains, or redundant helper pairs.
    - **SLP-10 pass** — The long multi-section review artifact is correctly presented as a page, not a modal.
    - **SLP-11 pass** — Static content is primarily grouped by spacing and rules; bordered elements are explicitly diagram frames, pending slots, or low-fi storyboard cells rather than faux interactive cards.
    - **LAY-3 pass** — The surface fits a standalone landing-page/content-review template inside the established root shell.
    - **LAY-7 pass** — The hero is the clear focal region; narrative, capabilities, decisions, close, and PM appendix step down in the intended priority order.

    CMP-1: asserted, no manifest — manifest absent for Teacher Workspace.

    ## VERIFICATION LEDGER

    | Control | Method | Evidence |
    |---------|--------|----------|
    | A11Y-1 | script | `detect.py --all --tokens src/styles.css` contrast subset clean; 360/768/1280 captures reviewed for inherited greyscale pairings. |
    | A11Y-2 | script | Static accessibility scan clean; source enumeration found no route-local controls, and the shared skip link has an explicit visible focus state. |
    | A11Y-3 | script | Accessibility scan clean; route contains no form fields or route-local buttons. |
    | A11Y-4 | manual | Route-local control inventory is empty, so no undersized hit targets exist. |
    | A11Y-5 | manual | Source and rendered captures contain no animation or motion on the wireframe route. |
    | A11Y-6 | manual | Product and story placeholders are decorative and marked `aria-hidden`; no informative media lacks an alternative. |
    | A11Y-7 | manual | Read rendered DOM and component source: one H1, ordered list, descriptive headings, lists, and definition lists. |
    | A11Y-9 | script | Built-route verification confirms the draft-specific title; `RootDocument` declares `lang="en"`. |
    | A11Y-10 | script | Built-route verification confirms `href="#main"`, “Skip to main content”, and `<main id="main">`. |
    | TOK-1 | script | Token audit clean for route components and styles; no route-local raw colours. |
    | TOK-2 | script | Token audit clean for spacing values. |
    | TOK-3 | script | Token audit clean for radius values; peer placeholders use consistent geometry. |
    | COL-1 | manual | No live primary action; greyscale CTA markers are explicitly labelled as static wireframe placements. |
    | COL-2 | script | Token audit clean; no functional-colour system is introduced on this route. |
    | TYP-1 | script | Type scan clean; body uses Inter and headings use Plus Jakarta Sans at approved weights. |
    | TYP-2 | script | Type scan clean; body copy is at least 14px with 1.5–1.6 line height. |
    | TYP-3 | script | Type scan clean; route sizes use the TFX scale. |
    | TYP-4 | script | Type scan clean; no styled all-caps copy. |
    | TYP-5 | manual | Numeric story/capability sequences carry `tabular-nums`; no updating figures exist. |
    | CNT-2 | manual | Reviewed visible labels and full SSR denylist; no codenames or internal product identifiers appear. |
    | CNT-3 | script | Content lint clean; manual review confirms active, direct sentences. |
    | CNT-4 | manual | Scenario/product frames are marked illustrative or synthetic, while unapproved proof remains pending. |
    | CNT-5 | script | Content lint clean; visible action labels contain no device-specific verbs. |
    | CNT-6 | script | Content lint clean; manual pass found no clarity-reducing filler. |
    | CNT-7 | manual | Hero and section intros state teacher value before mechanism. |
    | CMP-1 | manual | Product-codebase read; no manifest exists and semantic primitives match the static wireframe need. |
    | CMP-5 | manual | Enumerated zero live actions and two clearly labelled inert CTA placements in separate regions. |
    | CMP-7 | manual | Compared repeated route primitives and shared shell usage; no unexplained control/default divergence. |
    | SLP-5 | manual | Story and capability layouts are linear editorial structures; the three explorer cells communicate a sequence rather than a default feature-card grid. |
    | SLP-8 | manual | No transition, spring, bounce, or elastic easing exists on the route. |
    | SLP-9 | script | Content lint clean; manual review found no structural AI-writing tells. |
    | SLP-10 | manual | Multi-section artifact is rendered as its own page, not a modal. |
    | SLP-11 | manual | Reviewed every bordered region; they are diagram frames/pending placeholders, while static content uses spacing and dividers. |
    | LAY-3 | manual | Route maps coherently to the approved standalone landing-page review artifact. |
    | LAY-7 | manual | Squint review at all three widths: hero dominates first, then story and product structure, with PM notes last. |

    ## UNCOVERED

    - None.

    ## RATCHET CANDIDATES

    - Preserve the built-handler full-HTML/hydration denylist and recursive safe-DTO key test as permanent route-safety gates.
    - Add automated visual evidence for the error branch at mobile width.
    - Consider a reusable check that rejects navigation-like fields such as `href`, review metadata, and snapshots from browser-bound DTO schemas.

## Ratchet

- Extend `type-scan.py` to resolve named Tailwind text-size and line-height utilities; the first evaluator pass showed that a clean scan can miss compiled off-scale values.
- Extend TYP-1 verification to check body/display role mapping and approved weights, not only broad font-family allowlisting.
- Require evaluator inventories to enumerate every discriminated render branch so a fail-closed state cannot escape interaction and share-safety review.
- Require unauthenticated review routes to inspect the built SSR hydration payload, not only the visible DOM, for server-only fields and unused destinations. This gate is now implemented in `verify-content-review-routes.mjs`.
