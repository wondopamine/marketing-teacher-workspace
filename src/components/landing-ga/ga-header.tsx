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
const ITEM =
  "relative flex h-11 items-center rounded-2xl px-4 font-heading text-sm leading-4 font-semibold transition-colors duration-300 ease-out focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none"

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
 * Static in the flow below `md` and fixed from `md` up. The masthead offset is
 * kept on both paths — as top padding while static. The SG masthead is `fixed`
 * at a higher z-index, so dropping that offset put it over the wordmark and
 * left the header's controls unclickable at 320–360 (design review,
 * 2026-08-24).
 */
export function GaHeader() {
  return (
    <header className="pointer-events-none z-50 flex justify-center px-4 pt-[calc(var(--masthead-h,0px)+1rem)] sm:px-8 md:fixed md:inset-x-0 md:top-[var(--masthead-h,0px)] md:pt-4 md:transition-[top] md:duration-200 md:ease-out">
      <nav
        aria-label="Primary navigation"
        className="pointer-events-auto relative flex w-max items-stretch gap-1"
      >
        <span
          aria-hidden
          className="absolute -inset-1 rounded-3xl bg-[color:var(--nav-plate)] backdrop-blur-[13px]"
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
            plate stays content-hugging. */}
        <span aria-hidden className="w-8 sm:w-20 lg:w-32" />

        <Button
          asChild
          className={`${ITEM} bg-[color:var(--nav-pill)] px-5 text-[color:var(--paper-ink)] hover:bg-[color:var(--nav-pill-hover)]`}
        >
          <a href={TEACHER_WORKSPACE_APP_URL} rel="noreferrer">
            Get started
          </a>
        </Button>
      </nav>
    </header>
  )
}
