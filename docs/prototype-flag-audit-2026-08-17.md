# Prototype re-audit: feature-flagged screens and reviewer sync

Date: 17 August 2026
Status: **findings only — corrects `docs/decisions/2026-08-14-use-existing-prototype-states-only.md`, needs ratification before the wireframe changes**

Audited against `design-teacher-workspace` at commit `80a895b` — the same commit the
14 August audit used. Every claim below was verified by driving the running
prototype, not by reading fixtures.

## 1. Reviewer sync status

**Nobody has commented since 13 August.** The last comment predates the last
commit on this branch, so no reviewer input is unseen.

| Fact | Value |
| --- | --- |
| Comment store | Neon Postgres `cms_comments` (**not** the GitHub `review/page-feedback` branch, which does not exist) |
| Comments | 7 total — **6 open, 0 resolved**, 1 withdrawn |
| Reviewers | Xingyu (4), Lay Hui (3) |
| First / last comment | 2026-08-12 10:36Z → 2026-08-13 05:29Z |
| Last commit on branch | 2026-08-14 08:12Z (`e0d4d23`) |
| CMS page | "Every student gets the support they qualify for" — version **1**, never updated |
| `CONTENT_SOURCE` on preview | `cms` |

### The sync problem

The comments are anchored to review targets belonging to the **bursary** page
structure — sections `promise`, `connected-story`, `capabilities`. This branch
has since replaced that structure with `notice-and-understand` /
`act-with-your-judgement` / `communicate-with-care`. Those anchor ids do not
exist in the new structure.

Consequences, all verified:

- The share alias still serves the **pre-pivot build**. If Xingyu or Lay Hui
  open their link today they see the old bursary page with their six comments
  still open, and none of the 13–14 August work.
- The deployment built from current `HEAD` has **no alias assigned**, so only
  its immutable hash URL reaches it.
- Re-pointing the alias without migrating anchors would orphan all six open
  comments.

### What each open comment asked, and where it stands

| # | Who | Ask | Status in current `HEAD` |
| --- | --- | --- | --- |
| 1 | Xingyu | Generalise the hero — "could limit users to think it's a student support platform … rather than teacher productivity" | **Addressed.** Hero is now "See what is changing. Know what to do next." |
| 2 | Xingyu | "CI can't read circulars yet" — not available by GA | **Addressed by omission**, but see §2: the omission was justified on a wrong premise |
| 3 | Xingyu | Can't know if an application goes in or is approved — that's separate from informing parents | **Addressed.** Only read receipts remain |
| 4 | Xingyu | HeyTalia can't pull student context — say "draft with intelligent assistance" | **Addressed.** Drafting is template-framed |
| 5 | Lay Hui | Highlight "One-place" / "Consolidation"; show **App shelf**, SI and other features | **Not addressed.** A real screen exists for this — see §3 |
| 7 | Lay Hui | Rethink the narrative; alternative arc via attendance, late-coming, social links, TCI risk → CI recommended action → Posts + meeting | **Not addressed.** All four data types exist in the prototype — see §3 |

## 2. The 14 August audit is wrong on three points

The audit recorded prototype state without recording **which feature flags were
on**. The prototype has **24 flags** across 5 modules (`/flags` route,
`src/lib/feature-flags/`), each with a `defaultValue`. Reading a screen with
flags forced off is not the same as reading the default build, and neither is
the same as "does not exist".

Three distinct states matter, and the audit collapsed them:

1. **Default build** — what a teacher sees with no flag changes.
2. **Flag-gated** — exists, designed, authored, but off until a flag is on.
3. **Absent** — genuinely not in the prototype.

### Correction A — the observations panel is not invented

> Audit: "It has no positive attention tag and **no route to recent positive
> observations** … remove the invented 'Contributing with confidence' tag and
> observations route."

`section#observations` is present on `/students/12` **in the default build**. Its
content:

> Observations · 1 observation · 1 teacher · 1 context · + Add my observation ·
> **Collaboration** · Week of 13 Jul · Mrs Lee Su Yin · Collaboration · other ·
> "Noticed a teammate was stuck and re-explained the instructions patiently."

That is a real, authored, positive observation with a positive tag. The tag
`Contributing with confidence` was indeed invented, but the **route and the
panel were not** — and the panel already carries positive framing.

### Correction B — the AI guidance screen exists; it is flag-gated, not missing

> Audit: "`/glow/3` and `/glow/118` are the only authored guidance states. Both
> are student-support scenarios and do not meet the landing page's positive-story
> guardrail. → **Mark this as a prototype gap.**"

Two errors:

- **The screens do not load at all unless `lta-intervention` is on.** On the
  default build `/glow/3` returns 200 but redirects to `/students/3`. The audit
  never records this, so "only authored states" reads as a content finding when
  it is a flag finding.
- **The guidance cards are explicitly positive.** With `lta-intervention` on,
  `/glow/3` renders a three-pane "Explore student support" screen whose cards
  are:
  - "Consider keeping the daily check-in going" — "Attendance has climbed from
    72% to 93% over six weeks."
  - "Consider naming the progress to him directly" — "…keeps the conversation
    about **momentum rather than deficit**."
  - "Consider building on his peer connection" — "Buddy support around
    Volleyball and Robotics…"

  The screen *frame* does carry deficit markers (a `SwAN` tag, "Possible support
  areas: Long-Term Absenteeism, Low mood", and a chat preamble naming both). So
  the guardrail concern is real — but it is a **cropping** problem, not an
  absence. A crop of cards 1–2 is a real, positive, existing guidance image.

### Correction C — the hero-peek evidence mixes flag-on fields into the base build

> Audit: "`/students/12` contains … Class 3B, Swimming, **47 of 47 days
> present**, Excellent conduct, **91% overall**, and no attention tag."

Verified on `/students/12`:

| Claim | Reality |
| --- | --- |
| Class 3B, Swimming | ✅ default build |
| "47 of 47 days present" | ❌ the field reads **Attendance (%) 100** — there is no 47-of-47 figure |
| Excellent conduct | ✅ default build ("Excellent (2025, Overall)") |
| **91% overall** | ⚠️ requires `overall-percentage` — **default off** |
| No attention tag | ✅ correct; the Attention tag column needs `attention-tag` |
| "Teacher remarks and next steps hidden in base view" | ✅ correct — and their content is positive: "Model student, class leader." / "Nominate for school awards" |

The profile grows from ~861 to ~2 978 characters of text between flags-off and
flags-on, and from 5 sections to 9 (`personal`, `reports`, `observations`,
`others` appear). Any claim of the form "the prototype does not have X" made
without naming the flag state is unsafe.

## 3. Screens that exist and are not being used

### The App shelf — Lay Hui's "one place", already built

The prototype **home route `/`** is an app shelf, in the default build:

- Greeting, then **Featured**: Student Insights (Beta)
- **Frequently Used**: School Cockpit, SC Mobile, SLS
- **Student Information**: All Ears, Student Insights, Allocate, SDIS
- **Social-Emotional & Mental Wellbeing (SEConnect)**: MySEI, **Connecto-gram**,
  Termly Check-In
- **AI Productivity Tools**

This answers comment #5 directly and with a real screen. It is also the
strongest available argument for the consolidation thesis both reviewers asked
for, because it shows the scattering *and* the single entry point in one frame.

### Lay Hui's alternative narrative is fully sourced

Every data type in comment #7 exists in the **default build**:

| Lay Hui's data | Where it exists |
| --- | --- |
| Attendance | `section#attendance` — Attendance (%), Late-coming, Non-VR/Private VR/MC absences |
| CCA attendance | `section#attendance` — "CCA attendance (%) 100% (Swimming)" |
| TCI data | `section#wellbeing` — "TCI risk indicators 0 of 5 indicators" |
| Connectogram data | `section#wellbeing` — "Social links 7"; plus **Connecto-gram** on the app shelf |

All four are also columns on the default `/students` class list.

## 4. Real screenshots available, with the crop each one needs

Captured at 2× device scale. Files in the session scratchpad under `crops/` and
`proto/`.

| Landing slot | Route | Flag needed | Crop / redaction required |
| --- | --- | --- | --- |
| One place | `/` | none | Dismiss the "New! Parents Gateway posts are here" coach-mark first; greeting names "Mr. Tan" (synthetic) |
| Notice — class list | `/students` | none | Crop to Rachel's row; FAS is a default column and must be cropped out |
| Understand — attendance | `/students/12#attendance` | none | Clean as-is |
| Understand — conduct | `/students/12#behaviour` | none | Clean as-is |
| Understand — wellbeing | `/students/12#wellbeing` | none | Clean as-is; carries TCI + Social links |
| Positive observation | `/students/12#observations` | none (default) | Clean as-is; names "Mrs Lee Su Yin" (synthetic staff) |
| Overall % tile | `/students/12` | `overall-percentage` | Label as flag-gated, not GA-guaranteed |
| Teacher remarks | `/students/12#behaviour` | flag-gated | Label as flag-gated |
| Act — AI guidance | `/glow/3` | **`lta-intervention`** | **Crop to cards 1–2 only.** Must exclude the left pane (SwAN, Long-Term Absenteeism, Low mood) and the chat preamble |
| Communicate — draft | `/announcements/new` | none | The Term Update Letter state needs the AI Draft interaction driven; the bare route is an empty composer |
| Communicate — sent post | `/announcements/pg-1` | none | **Crop to the OVERVIEW tile only (2/3 read, 1 unread).** The STATUS table contains parent names and phone numbers |

## 5. Genuine gaps — what a design asset must show

These are absent from the prototype, and per Xingyu's comments two of them will
still be absent at GA. A mockup here is a **capability illustration**, clearly
marked as not-yet-built, never presented as a product screenshot.

### Gap 1 — CI naming a specific scheme and its documents

Xingyu, comment #2: *"This capability wont be available by GA. I dont think CI
can read circulars yet."*

**Do not mock this.** It cannot be shown as a capability the product will have.
If the narrative needs the beat, the honest version is what CI *does* do —
surface context already held about a student. That is `/glow/3`'s "Student
context" pane, which exists.

### Gap 2 — application submitted / approved tracking

Xingyu, comment #3: *"Application is seperate from informing parents."*

**Do not mock this.** The record ends at delivery and read receipt. The real
asset is the `/announcements/pg-1` OVERVIEW tile.

### Gap 3 — a positive guidance state with no deficit frame

Real but partial: the guidance *cards* are positive, the surrounding frame is
not. A design asset should show:

- **Frame**: the three-pane "Explore student support" layout, taken from
  `/glow/3` so the layout is real.
- **Left pane**: replace "Possible support areas: Long-Term Absenteeism / Low
  mood" with a strengths framing sourced from the observations panel that
  already exists — e.g. Collaboration, Curiosity, "Forming pattern".
- **Cards**: reuse the two real positive cards verbatim.
- **Label**: "Proposed state — composed from existing `/glow` layout and
  existing observation tags. Not a built screen."

This is the only gap where a mockup is both honest and useful, because every
element already exists somewhere in the prototype; only the combination is new.

### Gap 4 — the consolidation "before" state

Lay Hui, comment #5: the pain is that "tasks and information are scattered
across tools". The app shelf shows the *after*. There is no screen showing the
*before* — a teacher moving between School Cockpit, SLS, MySEI, Connecto-gram
to assemble one picture.

A diagram, not a mockup: the same app tiles from the real shelf, arranged as
disconnected sources feeding one profile. Every tile is a real product name from
`src/data/apps.ts`, so nothing is invented; only the arrangement is editorial.

## 6. What needs a decision

1. **The alias.** Re-point it to current `HEAD`, or publish a fresh URL, or
   leave it. Re-pointing orphans six open comment anchors.
2. **Ratify or reject the three corrections in §2.** The wireframe's AI-guidance
   omission and its removal of the observations route both rest on findings that
   do not hold.
3. **Flag-gated screens: existing or not?** A screen behind a `Release 2` flag
   is built and designed but not on for teachers today. The landing page needs
   one consistent rule, and the answer changes what may be shown for the
   guidance beat.
4. **Narrative.** Comment #7 is still open and proposes a different arc that the
   prototype can source end to end. The current generalised narrative was a
   response to comment #1, not a settled answer to #7.
