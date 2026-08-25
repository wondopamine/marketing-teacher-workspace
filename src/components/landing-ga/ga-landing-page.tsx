import { GaApps } from "./ga-apps"
import { GaAudiences } from "./ga-audiences"
import { GaClose } from "./ga-close"
import { GaHeader, handleHashClick } from "./ga-header"
import { GaHero } from "./ga-hero"
import { GaJourney } from "./ga-journey"
import { GaReveal } from "./ga-reveal"
import { GaSchools } from "./ga-schools"

import { SiteFooter } from "@/components/landing/footer"
import { gaNavItems } from "@/content/landing-ga-page"

/**
 * The GA landing page — issue #3's seven sections, with the capability row
 * lifted above the journey (product owner, 2026-08-24): hero, the four
 * capabilities at a glance, the journey they play out in, the reveal, the
 * people who run schools, real schools, close. Direction and approvals:
 * docs/decisions/ga-landing-page.md.
 */
export function GaLandingPage() {
  return (
    <>
      <GaHeader />
      <main className="paper-page" id="main">
        <GaHero />
        {/* The pill nav hides its links below md; this in-flow row keeps the
            section shortcuts reachable on small screens (LAY-2). */}
        <nav
          aria-label="Page sections"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-5 pt-16 md:hidden"
        >
          {gaNavItems.map((item) => (
            <a
              className="inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-[color:var(--paper-ink)] underline decoration-[color:var(--paper-rule-strong)] underline-offset-4 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary"
              href={item.href}
              key={item.label}
              onClick={(event) => handleHashClick(event, item.href)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <GaApps />
        <GaJourney />
        <GaReveal />
        <GaAudiences />
        <GaSchools />
        <GaClose />
      </main>
      <SiteFooter />
    </>
  )
}
