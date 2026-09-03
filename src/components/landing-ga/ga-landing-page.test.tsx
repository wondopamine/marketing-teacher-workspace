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

  it("floats the nav over the hero at every width, offset by the masthead", () => {
    // The header was `static` below `md` (round 4), which made it 88px of page
    // rather than 88px of nothing: the hero started below it instead of under
    // the masthead, so a narrow viewport opened on a white band with the tray
    // ruled across it, and crossing 768px in either direction jumped the whole
    // document 88px. Reported by the owner on 2026-08-26 after a resize.
    //
    // The offset is the other half. Going static once dropped
    // `top-[var(--masthead-h)]`, and the SG masthead is `fixed` at z-51 over
    // this header's z-50 — the wordmark was 93% covered at 320 and the nav's
    // only control was unclickable (A11Y-2, L0, 2026-08-24). Both halves have
    // to hold together, so they are pinned together.
    render(<GaLandingPage />)
    const nav = screen.getByRole("navigation", { name: "Primary navigation" })
    const header = nav.closest("header")
    expect(header).not.toBeNull()
    // Token-exact, not `toContain`: "md:fixed" contains "fixed", so a substring
    // check passes against the very markup this test exists to reject.
    const tokens = (header?.className ?? "").split(/\s+/)
    expect(tokens).toContain("fixed")
    expect(tokens).toContain("top-[var(--masthead-h,0px)]")
    // No breakpoint may own the position or the offset: one path at all widths.
    // Anchored per token so `2xl:` is caught too — it has no word boundary
    // before the colon, which a `\b`-based regex on the whole string misses.
    expect(
      tokens.filter((token) =>
        /^(sm|md|lg|xl|2xl):(fixed|static|absolute|top-|pt-)/.test(token)
      )
    ).toEqual([])

    // At 320 the cluster is 7px wider than the padding box allows. The spacer
    // is what gives those 7px up; flex used to take them out of the wordmark
    // image instead, drawing the lockup 5px narrow.
    for (const item of within(nav).getAllByRole("link")) {
      expect(item.className).toContain("shrink-0")
    }
  })

  it("lets the page through everywhere except the two pills", () => {
    // The tray is 296–398px of fixed overlay pinned to the top of the viewport.
    // While `pointer-events-auto` sat on the `nav`, all of it took clicks — the
    // decorative plate and the spacer between the pills included — and the
    // hero's filled "Get started" was dead where it scrolled under: 0 of 60
    // sampled points live at 375, 20 of 60 at 1440 (design review,
    // 2026-08-26). Only the two controls may take the pointer.
    render(<GaLandingPage />)
    const nav = screen.getByRole("navigation", { name: "Primary navigation" })
    expect(nav.className).toContain("pointer-events-none")
    expect(nav.className).not.toContain("pointer-events-auto")
    for (const item of within(nav).getAllByRole("link")) {
      expect(item.className).toContain("pointer-events-auto")
    }
    // The plate and the spacer are decoration; neither may reclaim it.
    const decoration = [...nav.querySelectorAll(":scope > span")]
    expect(decoration).toHaveLength(2)
    for (const span of decoration) {
      expect(span.className).not.toContain("pointer-events-auto")
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
    expect(html).toContain("Get started")
    expect(html).toContain("Real schools")
    // The hero's settled composition is the still frame; the looping video
    // only mounts after hydration when the visitor allows motion.
    expect(html).not.toContain("<video")
    expect(html).toContain("teacher-working-poster")
    // Same contract for the hero's pointer trail: decorative, client-only.
    expect(html).not.toContain("<canvas")
  })

  it("ships no product captures — the coded screens carry every visual", () => {
    // Round 3 (stakeholder feedback) took the captures off the page; the
    // Paper-style screens (owner, 2026-08-26) keep them off. Every screen is
    // coded from synthetic data, and the profile's Behaviour and Family
    // sections are redaction bars, so nothing from them can appear here.
    const html = renderToStaticMarkup(<GaLandingPage />)
    expect(html).not.toContain("/content-review/screens/")
  })

  it("ships the stages empty and leaves the screens to the client", () => {
    // The five product screens are illustration — aria-hidden, described in
    // an sr-only line — and the heaviest thing on the page. Server-rendered
    // they pushed the document past TCP's first congestion window and cost
    // Lighthouse mobile four points, so the server sends each act's words and
    // description with an empty stage; the screens' chunk mounts when an act
    // comes within a viewport of the fold.
    const html = renderToStaticMarkup(<GaLandingPage />)
    for (const act of gaJourneyActs) {
      expect(html).toContain(`id="act-${act.id}"`)
    }
    expect(html).toContain("A demonstration:")
    expect(html).not.toContain("Show records")
    expect(html).not.toContain("Jump to")
  })

  it("keeps internal capability names off the page", () => {
    const { container } = render(<GaLandingPage />)
    const text = container.textContent ?? ""
    expect(text).not.toContain("HeyTalia")
    expect(text).not.toContain("Contextual Intelligence")
    expect(text).not.toContain("Release 2")
  })
})
