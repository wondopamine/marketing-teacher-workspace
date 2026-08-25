import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"

import { GaLandingPage } from "./ga-landing-page"

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

  it("keeps exactly one filled primary action on the page", () => {
    const { container } = render(<GaLandingPage />)
    const filled = [...container.querySelectorAll("a")].filter((a) =>
      a.className.includes("bg-primary ")
    )
    expect(filled).toHaveLength(1)
    expect(filled[0]?.textContent).toBe("Sign in with Google")
  })

  it("never puts a CTA in the nav", () => {
    render(<GaLandingPage />)
    const nav = screen.getByRole("navigation", { name: "Primary navigation" })
    const links = within(nav).getAllByRole("link")
    for (const link of links) {
      expect(link.getAttribute("href")?.startsWith("https://")).toBe(false)
    }
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
    expect(html).toContain("Sign in with Google")
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
