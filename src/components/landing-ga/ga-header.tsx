import type { MouseEvent as ReactMouseEvent } from "react"

import { gaNavItems } from "@/content/landing-ga-page"

// Instant (not smooth) hash jumps so anchor travel never strands users
// mid-flight inside the pinned journey — same rationale as SiteHeader.
export function handleHashClick(
  event: ReactMouseEvent<HTMLAnchorElement>,
  href: string
) {
  if (!href.startsWith("#")) return
  const id = href.slice(1)
  if (!id) return
  const target =
    typeof document === "undefined" ? null : document.getElementById(id)
  if (!target) return
  event.preventDefault()
  target.scrollIntoView({ behavior: "instant", block: "start" })
  // Move focus with the jump so the next Tab continues inside the section
  // instead of from the nav (A11Y-2 at flow scope).
  target.tabIndex = -1
  target.focus({ preventScroll: true })
  if (typeof history !== "undefined") {
    history.replaceState(null, "", href)
  }
}

const PILL =
  "relative flex h-14 items-center rounded-2xl bg-[color:var(--nav-pill)] px-4 font-heading text-sm leading-4 font-semibold text-[color:var(--paper-ink)] transition-colors duration-300 ease-out hover:bg-[color:var(--nav-pill-hover)] focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none"

/**
 * GA page header: wordmark plus three section anchors, deliberately without
 * the nav CTA the v1 header carries — the page keeps one filled sign-in
 * action in the hero and an outlined repeat at the close (CMP-5), and the
 * nav never duplicates it. See docs/decisions/ga-landing-page.md.
 *
 * Static in the flow below `md` and fixed from `md` up: below that breakpoint
 * the cluster holds only the wordmark — the section anchors are `md:` — so a
 * fixed pill would sit in the reading column permanently while linking nowhere
 * but the current page (design review, 2026-08-24).
 *
 * The masthead offset is kept on both paths — as top padding while static.
 * The SG masthead is `fixed` at a higher z-index, so dropping that offset put
 * it over the wordmark and left the header's only control unclickable at
 * 320–360 (design review re-check, 2026-08-24).
 *
 * Centred and content-hugging rather than a full-width bar (2026-08-24):
 * each item is its own pill on a shared blurred plate, so the nav reads as a
 * floating cluster over the hero sky instead of page chrome pinned to the
 * edges. The plate is what keeps the group legible where the sky goes pale.
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

        <a
          aria-label="Teacher Workspace"
          className={`${PILL} gap-2.5`}
          href="/"
        >
          <img
            alt=""
            aria-hidden
            className="size-9 select-none"
            src="/hero/tw-icon.png"
          />
          <span className="hidden font-medium sm:flex sm:flex-col">
            <span>Teacher</span>
            <span>Workspace</span>
          </span>
        </a>

        {gaNavItems.map((item) => (
          <a
            className={`${PILL} hidden md:flex`}
            href={item.href}
            key={item.label}
            onClick={(event) => handleHashClick(event, item.href)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
