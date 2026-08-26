import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { SkipLink } from "./skip-link"

describe("SkipLink", () => {
  it("renders an <a href='#main'> element", () => {
    render(<SkipLink />)
    const link = screen.getByRole("link", { name: /skip to main content/i })
    expect(link.getAttribute("href")).toBe("#main")
  })

  it("is sr-only by default (visually hidden until focus)", () => {
    render(<SkipLink />)
    const link = screen.getByRole("link", { name: /skip to main content/i })
    expect(link.className).toMatch(/\bsr-only\b/)
  })

  /**
   * The bypass mechanism is the page's first tab stop, and it has to be visible
   * when it takes focus. Twice now it has not been: at `focus:top-4` the SG
   * masthead (`fixed`, z-51, 68px tall at 320 where its line wraps three ways)
   * covered it completely, and once it cleared the masthead it landed in the GA
   * page's nav tray, whose wordmark covered it at 320–430 (design review,
   * 2026-08-26, A11Y-2 and A11Y-10, both measured with `elementFromPoint`).
   *
   * Both halves are pinned here: the offset that puts it under the masthead,
   * and the z-index that puts it over everything else living in that band.
   */
  it("clears the masthead and outranks every fixed header when focused", () => {
    render(<SkipLink />)
    const tokens = screen
      .getByRole("link", { name: /skip to main content/i })
      .className.split(/\s+/)
    // The masthead's measured height, not a fixed guess: it is 28px on one
    // line, 48 on two and 68 on three, and only the variable knows which.
    expect(tokens).toContain("focus:top-[calc(var(--masthead-h,0px)+1rem)]")
    // Above the masthead's z-51 and both headers' z-50.
    expect(tokens).toContain("focus:z-[52]")
    expect(tokens).toContain("focus:not-sr-only")
  })
})
