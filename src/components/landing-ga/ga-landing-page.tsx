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
 * The GA landing page — issue #3's seven-section IA in order: hero, the
 * journey (acts 2–5), the reveal, the apps up close, the people who run
 * schools, real schools, close. Direction and approvals:
 * docs/decisions/ga-landing-page.md.
 */
export function GaLandingPage() {
  return (
    <>
      <GaHeader />
      <main className="paper-page" id="main">
        <GaHero />
        <GaJourney />
        <GaReveal />
        <GaApps />
        <GaAudiences />
        <GaSchools />
        <GaClose />
      </main>
      <SiteFooter />
    </>
  )
}
