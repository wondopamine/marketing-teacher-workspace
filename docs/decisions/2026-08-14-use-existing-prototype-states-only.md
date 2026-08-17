# Use existing prototype states only

Date: 14 August 2026

## Decision

The landing-page wireframe must not propose a product screen or state that is absent from the Teacher Workspace design prototype. Each interface brief must either name an existing prototype state and its real mock content, or identify a gap and omit the screen until an existing, approved state is available.

The audit was performed against `String-sg/design-teacher-workspace` at commit `80a895b`.

## Audit result

| Landing slot           | Prototype evidence                                                                                                                                                                                           | Decision                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Hero product peek      | `/students/12` contains the synthetic Rachel Wong Mei Ling profile: Class 3B, Swimming, 47 of 47 days present, Excellent conduct, 91% overall, and no attention tag.                                         | Use this existing profile, subject to approval of the public crop.                                      |
| Notice: class list     | `/students` contains the class list and can show Rachel's existing Class 3B row. It has no positive attention tag and no route to recent positive observations.                                              | Use the existing row and remove the invented “Contributing with confidence” tag and observations route. |
| Understand: profile    | `/students/12` contains Attendance, Behaviour, Wellbeing, Academic, and Family sections. Teacher remarks and next steps are hidden in the base Student Insights view.                                        | Use the real profile fields. Do not invent a recent-observations panel.                                 |
| Act: AI guidance       | `/glow/3` and `/glow/118` are the only authored guidance states. Both are student-support scenarios and do not meet the landing page's positive-story guardrail.                                             | Mark this as a prototype gap. Do not show a fictional positive guidance screen.                         |
| Communicate: draft     | `/announcements/new` contains AI Draft. The existing Term Update Letter template fills “Start of Term 3: What to Expect” and displays “Drafted with AI · Example content” with a review-before-posting note. | Use this existing state, subject to GA and public-use confirmation.                                     |
| Communicate: sent post | `/announcements/pg-1` contains “Term 4 Letter to Parents”, Posted status, an overview showing 2 of 3 read and 1 unread, recipient read times, an attachment, and contact details.                            | Use this existing state, subject to confirmation of the public read-status claim.                       |

## Captured-image caveat

The existing local image files were made from older prototype states. In particular, the class-list capture contains support tags, the guidance capture is a student-support case, and the composer capture contains a financial-assistance draft. The wireframe therefore continues to use text-only prototype-evidence blocks. No old capture should be promoted to a public product image without being replaced by a newly approved capture of the verified state above.

## Consequence

The content-review route is less visually complete in the AI-guidance section, but it is product-faithful. A capability owner must supply an already-designed, public-safe positive guidance state before that screen can be added. The landing-page project does not create that product state.

## Amendment, 17 August 2026 — flag state was not recorded

This audit read the prototype without recording which **feature flags** were on. The prototype has 24 flags (`/flags`, `src/lib/feature-flags/`), each with its own `defaultValue`, so "not present" and "present but flagged off" are different findings. Re-audited at the same commit `80a895b` by driving the running prototype. Three findings above do not hold.

- **The observations route is not invented.** `section#observations` is present on `/students/12` in the **default build**, already carrying the positive tag "Collaboration" and a colleague's note. Only the tag name `Contributing with confidence` was invented. The panel and the route were not.
- **The AI-guidance screen exists; it is flag-gated, not missing.** `/glow/3` does not load at all on the default build — it redirects to `/students/3` — and opens only with `lta-intervention`, a **Release 2** flag. Its cards are explicitly positive, one reading "keeps the conversation about momentum rather than deficit". The guardrail concern is real but is a cropping problem: the surrounding frame carries support classifications, the cards do not.
- **The hero-peek evidence mixed a flagged field into the base build.** There is no "47 of 47 days" field; attendance reads `Attendance (%) 100`. `91% overall` requires `overall-percentage`, which is **off by default**. "Teacher remarks and next steps are hidden in the base view" was correct.

### What replaced this decision

Per the product owner on 17 August 2026, a screen behind a **Release 2** flag may appear, provided it is aligned with the GA capabilities named in issue #3 and is labelled as not yet available to teachers. Experiment-stage fields stay off the page.

Each of the six screens now ships a **verified capture together with its brief**, and the brief states the build state the capture came from — `Existing screen · default build` or `Existing screen · needs a Release 2 flag`. The captured-image caveat below is therefore discharged for the five screens recaptured on 17 August; the class-list capture was **not** replaced, because every class in the fixture contains a student with poor conduct and recorded offences, and three carry financial-assistance status. That slot moved to the observations panel instead.

Two constraints found while recapturing, both now enforced by crop:

- `/announcements/pg-1` holds parent names and phone numbers in its recipient table. Only the overview tile is published.
- The second guidance card's Resources row names an internal programme. Only the first card is published.

See `docs/prototype-flag-audit-2026-08-17.md` for the full evidence.
