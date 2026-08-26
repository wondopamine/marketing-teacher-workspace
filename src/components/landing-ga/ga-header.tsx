import { Button } from "@/components/ui/button"
import { TEACHER_WORKSPACE_APP_URL } from "@/content/landing"

/**
 * Every item in the cluster is the same height — 44px, against the hero's 48px
 * primary action. The nav's job is to be in reach, not to compete with the one
 * button the page is actually asking you to press.
 */
// `relative` is load-bearing: the plate behind these is absolutely positioned
// and its `backdrop-blur` makes it a stacking context, so a static sibling
// paints underneath it and the whole cluster comes out of focus.
//
// `shrink-0` is load-bearing too, and it belongs on the items rather than the
// spacer. At 320 the cluster's max-content width is 7px wider than the padding
// box allows, and flex took those 7px out of the widest thing that could give:
// the wordmark image, squeezed from 105px to 100px. The spacer gives them up
// instead, so the lockup is never drawn out of proportion.
const ITEM =
  "pointer-events-auto relative flex h-11 shrink-0 items-center rounded-full px-4 font-heading text-sm leading-4 font-semibold transition-colors duration-300 ease-out focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none"

/**
 * The wordmark carries no ground of its own (owner, 2026-08-25) — it sits
 * straight on the shared plate, which is what makes "Get started" the only
 * thing in the cluster that looks pressable. The pill comes back on hover, so
 * it still answers the pointer.
 */
const QUIET = `${ITEM} text-[color:var(--paper-ink)] hover:bg-[color:var(--nav-pill)]`

/**
 * GA page header: the wordmark on one side of a floating cluster, the way in
 * on the other, and open plate in between.
 *
 * The section anchors went first — three links to places the page reaches
 * anyway on the way down, which made the header a menu rather than a mark and
 * a way in. Feedback followed (Xingyi, review of 2026-08-25): it is a second
 * ask competing with the only one this page is making, and the footer's "Send
 * feedback" already carries it for anyone who reaches the end wanting to say
 * something. What is left is who this is, and how to start.
 *
 * The cluster itself is unchanged from round 4 — centred and content-hugging
 * rather than a full-width bar, each item on its own pill over one shared
 * translucent plate, so it reads as floating over the hero's sky instead of
 * page chrome ruled across it. The gap in the middle is a spacer rather than
 * `justify-between`, because the plate is sized by its contents: pushing the
 * two ends apart with free space would stretch the plate to the viewport and
 * turn the cluster into the bar it is deliberately not.
 *
 * CMP-5 kept the nav free of a CTA so the page had one filled action in the
 * hero and an outlined repeat at the close. "Get started" is here on the
 * owner's call, but it is white rather than filled and 44px against the hero's
 * 48px, so the rule CMP-5 was protecting still holds: exactly one filled
 * action on the page, and it is the hero's. What the nav has is the same
 * destination kept in reach, not a second thing shouting.
 *
 * Fixed at every width, offset by the masthead's measured height. It was
 * `static` in the flow below `md` — round 4's cluster rebuild — and that is
 * the defect reported on 2026-08-26 after a resize. A static header is 88px of
 * *page*: the hero stopped below it instead of starting under the masthead, so
 * the top of a narrow viewport was a white band with the tray sitting on it as
 * the ruled bar the cluster is designed not to be, and crossing 768px in
 * either direction jumped the whole document 88px. Measured before the fix at
 * 320/360/375/640/700/767: hero top at 88–128px, against 0 from 768 up.
 *
 * `top-[var(--masthead-h,0px)]` is the part the static path was covering for.
 * `masthead-sg` writes that variable from the live masthead height, so the
 * offset holds where the masthead wraps to two and three lines (48px at 360,
 * 68px at 320) and the wordmark stays clickable — the L0 finding of 2026-08-24
 * (A11Y-2), when going static dropped the offset and left the SG masthead,
 * `fixed` at z-51 over this header's z-50, covering the only control here.
 * `site-header.tsx` has always done exactly this, at every width.
 */
export function GaHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-[var(--masthead-h,0px)] z-50 flex justify-center px-4 pt-4 sm:px-8 md:transition-[top] md:duration-200 md:ease-out">
      <nav
        aria-label="Primary navigation"
        className="pointer-events-none relative flex w-max items-stretch gap-1"
      >
        {/* The tray the cluster sits on. Its edge is tone alone — no line and
            no shadow (owner, 2026-08-26): `--nav-plate` darkens whatever is
            behind it, so the tray reads a step under its ground and the white
            pills read a step over the tray, on the hero's sky and on the page
            below it alike.

            The pills are fully rounded (owner, 2026-08-26), so the tray is
            too: at 44px tall a pill's radius is 22px, and the tray is 52px
            tall for a radius of 26 — the pill's 22 plus the 4px the tray is
            inset by, which is what `rounded-full` gives it here. The two
            corners stay concentric with no number to restate. */}
        <span
          aria-hidden
          className="absolute -inset-1 rounded-full bg-[color:var(--nav-plate)] backdrop-blur-[13px]"
        />

        <a aria-label="Teacher Workspace" className={QUIET} href="/">
          {/* One lockup rather than an icon beside type: the mark and the
              words are drawn together, so their spacing and weight are the
              brand's rather than this stylesheet's. The link carries the
              accessible name, so the image itself is decorative. */}
          <img
            alt=""
            aria-hidden
            className="h-8 w-auto select-none"
            height={640}
            src="/hero/tw-logo.svg"
            width={2099}
          />
        </a>

        {/* The distance between the two ends, held open by a spacer so the
            plate stays content-hugging. It is the one thing in the cluster
            that may shrink, which is why the items carry `shrink-0`. */}
        <span aria-hidden className="w-8 sm:w-20 lg:w-32" />

        <Button
          asChild
          className={`${ITEM} border-0 bg-[color:var(--nav-pill)] px-5 text-[color:var(--paper-ink)] hover:bg-[color:var(--nav-pill-hover)]`}
        >
          <a href={TEACHER_WORKSPACE_APP_URL} rel="noreferrer">
            Get started
          </a>
        </Button>
      </nav>
    </header>
  )
}
