import type { MouseEvent as ReactMouseEvent } from "react"

import { gaNavItems } from "@/content/landing-ga-page"

// Instant (not smooth) hash jumps so anchor travel never strands users
// mid-flight inside the pinned journey — same rationale as SiteHeader.
function handleHashClick(
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
  if (typeof history !== "undefined") {
    history.replaceState(null, "", href)
  }
}

/**
 * GA page header: wordmark plus three section anchors, deliberately without
 * the nav CTA the v1 header carries — the page keeps one filled sign-in
 * action in the hero and an outlined repeat at the close (CMP-5), and the
 * nav never duplicates it. See docs/decisions/ga-landing-page.md.
 */
export function GaHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-[var(--masthead-h,0px)] z-50 px-4 pt-4 transition-[top] duration-200 ease-out sm:px-8">
      <nav
        aria-label="Primary navigation"
        className="nav-pill pointer-events-auto mx-auto flex w-full max-w-[940px] items-center justify-between gap-6 rounded-full py-2.5 pr-5 pl-5 shadow-[0_0_0_1px_rgb(15_23_42/0.04),0_2px_6px_-1px_rgb(15_23_42/0.06)] sm:gap-12"
      >
        <a
          className="flex items-center gap-2.5 rounded-full font-heading text-[color:var(--paper-ink)] transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/40"
          href="/"
        >
          <img
            alt=""
            aria-hidden
            className="size-9 select-none"
            src="/hero/tw-icon.png"
          />
          <span className="hidden text-[13px] leading-[1.05] font-medium sm:flex sm:flex-col">
            <span>Teacher</span>
            <span>Workspace</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 text-sm font-semibold text-[color:var(--paper-ink)] md:flex">
          {gaNavItems.map((item) => (
            <a
              className="inline-flex h-10 items-center rounded-sm transition-colors duration-200 ease-out hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/40"
              href={item.href}
              key={item.label}
              onClick={(event) => handleHashClick(event, item.href)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  )
}
