import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"

import { GaLandingPage } from "./ga-landing-page"

import {
  gaAudiences,
  gaJourneyActs,
  gaTestimonials,
} from "@/content/landing-ga-page"

describe("GaLandingPage", () => {
  it("renders the seven IA sections in issue #3's order", () => {
    const { container } = render(<GaLandingPage />)
    const main = container.querySelector("main#main")
    expect(main).not.toBeNull()
    const sections = [...(main?.querySelectorAll(":scope > section") ?? [])]
    // hero, journey, reveal, apps, audiences, schools, close
    expect(sections).toHaveLength(7)
    expect(sections[1]?.id).toBe("journey")
    expect(sections[3]?.id).toBe("apps")
    expect(sections[4]?.id).toBe("audiences")
    expect(sections[5]?.id).toBe("schools")
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

  it("renders every journey act with its moment and capability sign-off", () => {
    const { container } = render(<GaLandingPage />)
    for (const act of gaJourneyActs) {
      const block = container.querySelector(`#act-${act.id}`)
      expect(block, act.id).not.toBeNull()
      expect(block?.textContent).toContain(act.moment)
      expect(block?.textContent).toContain(act.headline)
      if (act.capabilityLabel !== null) {
        expect(block?.textContent).toContain(act.capabilityLabel)
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
  })

  it("keeps internal capability names off the page", () => {
    const { container } = render(<GaLandingPage />)
    const text = container.textContent ?? ""
    expect(text).not.toContain("HeyTalia")
    expect(text).not.toContain("Contextual Intelligence")
    expect(text).not.toContain("Release 2")
  })
})
