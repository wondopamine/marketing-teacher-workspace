import { GaApps } from "./ga-apps"
import { GaAudiences } from "./ga-audiences"
import { GaClose } from "./ga-close"
import { GaHeader } from "./ga-header"
import { GaHero } from "./ga-hero"
import { GaJourney } from "./ga-journey"
import { GaReveal } from "./ga-reveal"
import { GaSchools } from "./ga-schools"

import { SiteFooter } from "@/components/landing/footer"

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
