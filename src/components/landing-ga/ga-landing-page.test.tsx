import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"

import { GaLandingPage } from "./ga-landing-page"

import { siteConfig } from "@/config/site"

import {
  gaAudiences,
  gaCapabilities,
  gaJourneyActs,
  gaTestimonials,
} from "@/content/landing-ga-page"

describe("GaLandingPage", () => {
  it("renders the seven IA sections in the approved order", () => {
    const { container } = render(<GaLandingPage />)
    const main = container.querySelector("main#main")
    expect(main).not.toBeNull()
    const sections = [...(main?.querySelectorAll(":scope > section") ?? [])]
    // The capability row sits directly under the hero (product owner,
    // 2026-08-24); hero, reveal and close carry no anchor id.
    expect(sections.map((section) => section.id)).toEqual([
      "",
      "apps",
      "journey",
      "",
      "audiences",
      "schools",
      "",
    ])
  })

  it("keeps the filled primary actions to the header and the hero", () => {
    // CMP-5: exactly one filled action on the page, and it is the hero's. The
    // owner added "Get started" to the header on 2026-08-25 so the way in stays
    // in reach, then made it white — so the nav repeats the destination without
    // repeating the emphasis, and the rule still holds. The close stays
    // outlined. All three say the same word and point at the same place.
    const { container } = render(<GaLandingPage />)
    const actions = [...container.querySelectorAll("a")].filter(
      (a) => a.getAttribute("href") === siteConfig.links.product
    )
    expect(actions.map((a) => a.textContent)).toEqual([
      "Get started",
      "Get started",
      "Get started",
    ])
    const filled = actions.filter((a) => a.className.includes("bg-primary "))
    expect(filled).toHaveLength(1)
    expect(filled[0]?.closest("header")).toBeNull()
  })

  it("keeps the nav to the wordmark and the way in, and nothing else", () => {
    // The section anchors went first — three links to places the page reaches
    // on the way down made the header a menu rather than a mark and a way in.
    // Feedback followed (review of 2026-08-25), a second ask competing with the
    // only one this page is making; the footer still carries it. Nothing in the
    // nav points within the page, and nothing else may be added quietly.
    render(<GaLandingPage />)
    const nav = screen.getByRole("navigation", { name: "Primary navigation" })
    const links = within(nav).getAllByRole("link")
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/",
      siteConfig.links.product,
    ])
  })

  it("tells each journey act in its own words, never by feature name", () => {
    // The acts are the teacher's story; naming the capability that closes one
    // sold the product mid-sentence (owner, 2026-08-25). None of the four
    // public labels appears anywhere in the story copy, so any of them turning
    // up in an act block means the sign-off line came back.
    const { container } = render(<GaLandingPage />)
    const labels = gaCapabilities.map((capability) => capability.publicLabel)
    for (const act of gaJourneyActs) {
      const block = container.querySelector(`#act-${act.id}`)
      expect(block, act.id).not.toBeNull()
      expect(block?.textContent).toContain(act.moment)
      expect(block?.textContent).toContain(act.headline)
      expect(block?.textContent).toContain(act.body)
      for (const label of labels) {
        expect(block?.textContent, `${act.id} names ${label}`).not.toContain(
          label
        )
      }
    }
  })

  it("renders all three audience blocks with question and answer", () => {
    const { container } = render(<GaLandingPage />)
    const section = container.querySelector("#audiences")
    for (const audience of gaAudiences) {
      expect(audience.question, audience.id).not.toBeNull()
      expect(section?.textContent).toContain(audience.question ?? "")
      expect(section?.textContent).toContain(audience.answer ?? "")
    }
  })

  it("renders the three curated testimonials verbatim with role and school level", () => {
    const { container } = render(<GaLandingPage />)
    const section = container.querySelector("#schools")
    expect(gaTestimonials).toHaveLength(3)
    for (const testimonial of gaTestimonials) {
      expect(section?.textContent).toContain(testimonial.quote)
      expect(section?.textContent).toContain(testimonial.role)
      expect(section?.textContent).toContain(testimonial.schoolLevel)
      // The two PG-named quotes stay unpublished on this page.
      expect(testimonial.quote).not.toContain("PG")
    }
  })

  it("server-renders the settled composition — nothing ships hidden at opacity 0", () => {
    // The no-JS baseline (design review 2026-08-20): server markup must never
    // hide content behind an animation's initial state. Every reveal renders
    // settled on the server and only arms itself after hydration.
    const html = renderToStaticMarkup(<GaLandingPage />)
    expect(html).not.toContain("opacity:0")
    expect(html).not.toContain("opacity: 0")
    expect(html).toContain("Get started")
    expect(html).toContain("Real schools")
    // The hero's settled composition is the still frame; the looping video
    // only mounts after hydration when the visitor allows motion.
    expect(html).not.toContain("<video")
    expect(html).toContain("teacher-working-poster")
    // Same contract for the hero's pointer trail: decorative, client-only.
    expect(html).not.toContain("<canvas")
  })

  it("ships no product captures — the vignettes carry every visual", () => {
    // Round 3 (stakeholder feedback): journey visuals are coded vignettes
    // showing information categories only, so no prototype capture — and
    // nothing under Behaviour/Family — can appear on the public page.
    const html = renderToStaticMarkup(<GaLandingPage />)
    expect(html).not.toContain("/content-review/screens/")
    expect(html).toContain("Sensitive sections stay inside the profile.")
  })

  it("keeps internal capability names off the page", () => {
    const { container } = render(<GaLandingPage />)
    const text = container.textContent ?? ""
    expect(text).not.toContain("HeyTalia")
    expect(text).not.toContain("Contextual Intelligence")
    expect(text).not.toContain("Release 2")
  })
})
